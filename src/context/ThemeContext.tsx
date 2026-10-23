import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  calculateSolarTimes,
  getStoredSolarCoordinates,
  getFallbackLocation,
  requestBrowserGeolocation,
  SolarLocation,
} from '../utils/solarCalculator';

export type ThemeMode = 'solar' | 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

export interface SolarTimesInfo {
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  goldenHour?: Date | null;
  isDaytime: boolean;
  nextTransitionTime: Date | null;
  nextTransitionType: 'sunrise' | 'sunset' | null;
}

export interface ThemeContextType {
  theme: EffectiveTheme; // 'light' | 'dark' (the active theme currently rendered)
  effectiveTheme: EffectiveTheme; // 'light' | 'dark' (backwards compatibility)
  themeMode: ThemeMode; // 'solar' | 'system' | 'light' | 'dark'
  isSystem: boolean; // true if following the OS prefers-color-scheme
  isSolar: boolean; // true if automatically following local sunset/sunrise
  hasManualOverride: boolean; // true if user has explicitly chosen 'light' or 'dark'
  systemDetectedTheme: EffectiveTheme; // live OS-level preference
  solarDetectedTheme: EffectiveTheme; // live astronomical sunset/sunrise theme
  solarTimes: SolarTimesInfo | null; // calculated times for sunrise, sunset, dawn, dusk
  solarLocation: SolarLocation | null; // current GPS/cached/fallback coordinates
  solarLoading: boolean; // true while requesting browser geolocation
  solarError: string | null; // error message if geolocation permission denied or timed out
  isCloudSynced: boolean; // true if theme is saved & synchronized with Firestore
  isSyncingToCloud: boolean; // true while saving to Firestore
  lastCloudSyncTime: Date | null; // timestamp of last Firestore sync
  refreshSolarTimes: () => void; // recalculate with current clock/coords
  requestSolarLocation: () => Promise<void>; // explicitly trigger browser GPS prompt
  setTheme: (mode: ThemeMode | EffectiveTheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void; // manually switches to the opposite of current theme
  resetToSolar: () => void; // clears manual override and resumes solar sunset/sunrise automatic mode
  resetToSystem: () => void; // clears manual override and resumes following OS preference
  clearManualOverride: () => void; // alias for resetToSolar
  saveThemeToFirestore: (theme: EffectiveTheme, mode?: ThemeMode) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'haevy_theme_mode';

/**
 * Helper to synchronously query the user's OS-level dark/light mode preference
 */
function getOSThemePreference(): EffectiveTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      console.warn('Error querying prefers-color-scheme:', e);
    }
  }
  return 'dark'; // Fallback default
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read saved theme mode or default to 'solar' for automatic sunset/sunrise switching
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'solar' || saved === 'system' || saved === 'light' || saved === 'dark') {
          return saved as ThemeMode;
        }
      } catch (e) {
        console.warn('Unable to access localStorage for theme preference', e);
      }
    }
    // Default mode is 'solar' (astronomical sunrise/sunset auto-switching)
    return 'solar';
  });

  // Track the live OS-level dark/light mode preference
  const [systemDetectedTheme, setSystemDetectedTheme] = useState<EffectiveTheme>(() => {
    return getOSThemePreference();
  });

  // Solar Location & Calculation state
  const [solarLocation, setSolarLocation] = useState<SolarLocation>(() => {
    return getStoredSolarCoordinates() || getFallbackLocation();
  });

  const solarLocationRef = useRef<SolarLocation>(solarLocation);
  solarLocationRef.current = solarLocation;

  const [solarLoading, setSolarLoading] = useState(false);
  const [solarError, setSolarError] = useState<string | null>(null);

  // Initial calculation of solar times
  const [solarCalc, setSolarCalc] = useState(() => {
    const loc = getStoredSolarCoordinates() || getFallbackLocation();
    return calculateSolarTimes(new Date(), loc);
  });

  const solarDetectedTheme = solarCalc.solarTheme;

  const solarTimes: SolarTimesInfo = useMemo(() => ({
    sunrise: solarCalc.sunrise,
    sunset: solarCalc.sunset,
    dawn: solarCalc.dawn,
    dusk: solarCalc.dusk,
    goldenHour: solarCalc.goldenHour,
    isDaytime: solarCalc.isDaytime,
    nextTransitionTime: solarCalc.nextTransitionTime,
    nextTransitionType: solarCalc.nextTransitionType,
  }), [solarCalc]);

  // Recalculate solar times with given or current location (stabilized, no state loop)
  const refreshSolarTimes = useCallback((customLocation?: SolarLocation) => {
    const loc = customLocation || solarLocationRef.current || getStoredSolarCoordinates() || getFallbackLocation();
    if (customLocation) {
      solarLocationRef.current = customLocation;
      setSolarLocation(customLocation);
    }
    const result = calculateSolarTimes(new Date(), loc);
    setSolarCalc(result);
  }, []);

  // Request high/coarse accuracy coordinates via browser Geolocation API
  const requestSolarLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setSolarError('Trình duyệt không hỗ trợ Geolocation API');
      return;
    }

    setSolarLoading(true);
    setSolarError(null);

    try {
      const location = await requestBrowserGeolocation();
      solarLocationRef.current = location;
      setSolarLocation(location);
      const result = calculateSolarTimes(new Date(), location);
      setSolarCalc(result);
    } catch (err: any) {
      const errorMsg = err?.message || 'Không thể truy cập vị trí định vị';
      setSolarError(errorMsg);
      console.warn('Geolocation acquisition failed, keeping fallback coordinates:', err);
    } finally {
      setSolarLoading(false);
    }
  }, []);

  // Auto-request location once on mount if no cached coordinates exist
  useEffect(() => {
    const stored = getStoredSolarCoordinates();
    if (!stored && typeof window !== 'undefined' && navigator.geolocation) {
      requestSolarLocation();
    }
  }, [requestSolarLocation]);

  // Actively listen for real-time changes to the user's OS-level theme
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Synchronize initial state
    const currentOSTheme = mediaQuery.matches ? 'dark' : 'light';
    setSystemDetectedTheme(currentOSTheme);

    const handleOSThemeChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const isDark = typeof event.matches === 'boolean' ? event.matches : mediaQuery.matches;
      const newTheme: EffectiveTheme = isDark ? 'dark' : 'light';
      setSystemDetectedTheme(newTheme);
    };

    try {
      mediaQuery.addEventListener('change', handleOSThemeChange);
      return () => mediaQuery.removeEventListener('change', handleOSThemeChange);
    } catch (err) {
      mediaQuery.addListener(handleOSThemeChange);
      return () => mediaQuery.removeListener(handleOSThemeChange);
    }
  }, []);

  // Periodic check to transition theme at sunrise and sunset (stabilized, runs at set interval)
  useEffect(() => {
    const checkSolarTransition = () => {
      const loc = solarLocationRef.current || getStoredSolarCoordinates() || getFallbackLocation();
      const result = calculateSolarTimes(new Date(), loc);

      setSolarCalc((prev) => {
        // Only update state if theme or transition type changed, or after significant time step
        if (
          prev.solarTheme !== result.solarTheme ||
          prev.nextTransitionType !== result.nextTransitionType ||
          Math.abs(prev.timeUntilNextTransitionMs - result.timeUntilNextTransitionMs) > 60000
        ) {
          return result;
        }
        return prev;
      });
    };

    // Check periodically every 30 seconds
    const interval = setInterval(checkSolarTransition, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Compute the effective theme
  const effectiveTheme: EffectiveTheme = useMemo(() => {
    if (themeMode === 'solar') {
      return solarDetectedTheme;
    }
    if (themeMode === 'system') {
      return systemDetectedTheme;
    }
    return themeMode;
  }, [themeMode, solarDetectedTheme, systemDetectedTheme]);

  const isFirstMount = useRef(true);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to apply classes and meta tags to the DOM
  const applyThemeDOM = (theme: EffectiveTheme) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    // Sync mobile browser theme-color for notch & navigation bars
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#09090b' : '#f1f5f9');
    }

    // Sync iOS status bar style
    const metaApple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaApple) {
      metaApple.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');
    }
  };

  // Apply effective theme to DOM with a smooth cross-fade animation when toggling
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isFirstMount.current) {
      // Direct apply on initial load to prevent flashing
      applyThemeDOM(effectiveTheme);
      isFirstMount.current = false;
      return;
    }

    // Clear any pending transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    const root = document.documentElement;
    const body = document.body;

    // Add theme-transitioning class for smooth cross-fade animation across all elements
    root.classList.add('theme-transitioning');
    body.classList.add('theme-transitioning');

    // Use modern View Transitions API if supported and document is fully visible
    const canUseViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !document.hidden &&
      document.visibilityState === 'visible' &&
      !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (canUseViewTransition) {
      try {
        const transition = (document as any).startViewTransition(() => {
          applyThemeDOM(effectiveTheme);
        });

        // Catch all ViewTransition promise rejections immediately to prevent "Transition was aborted because of invalid state. Document hidden" unhandled exceptions
        if (transition && typeof transition === 'object') {
          if (transition.updateCallbackDone && typeof transition.updateCallbackDone.catch === 'function') {
            transition.updateCallbackDone.catch(() => {
              // Ignore aborted transition callback
            });
          }
          if (transition.ready && typeof transition.ready.catch === 'function') {
            transition.ready.catch(() => {
              // Ignore aborted transition ready state
            });
          }
          if (transition.finished && typeof transition.finished.catch === 'function') {
            transition.finished
              .catch(() => {
                // Safely handle aborted transition without throwing unhandled promise rejection
              })
              .finally(() => {
                root.classList.remove('theme-transitioning');
                body.classList.remove('theme-transitioning');
              });
          }
        }
      } catch {
        applyThemeDOM(effectiveTheme);
        root.classList.remove('theme-transitioning');
        body.classList.remove('theme-transitioning');
      }
    } else {
      applyThemeDOM(effectiveTheme);
    }

    // Fallback timer to ensure theme-transitioning class is removed cleanly
    transitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      body.classList.remove('theme-transitioning');
    }, 500);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [effectiveTheme]);

  // Cloud Firestore Persistence & Real-time Ecosystem Sync State
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<Date | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const lastPushedModeRef = useRef<string | null>(null);

  // Function to persistently save user's chosen theme ('dark' or 'light') to Firestore
  const saveThemeToFirestore = useCallback(async (
    targetEffectiveTheme: EffectiveTheme,
    targetMode?: ThemeMode,
    targetUid?: string
  ): Promise<boolean> => {
    const uid = targetUid || authUid || auth.currentUser?.uid;
    if (!uid) return false;

    const modeToSave = targetMode || (targetEffectiveTheme as ThemeMode);

    setIsSyncingToCloud(true);
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        theme: targetEffectiveTheme, // Persistently save chosen theme ('dark' or 'light')
        themePreference: targetEffectiveTheme,
        themeMode: modeToSave,
        themeUpdatedAt: new Date().toISOString()
      }, { merge: true });

      setIsCloudSynced(true);
      setLastCloudSyncTime(new Date());
      return true;
    } catch (err) {
      console.warn('Unable to persist chosen theme to Firestore:', err);
      return false;
    } finally {
      setIsSyncingToCloud(false);
    }
  }, [authUid]);

  // Set theme mode (manual override 'light' | 'dark', 'solar', or 'system') and synchronize to Firestore across user's devices
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Unable to persist themeMode to localStorage', e);
    }

    // Determine the user's chosen/effective visual theme ('dark' or 'light')
    let chosenTheme: EffectiveTheme;
    if (mode === 'light') {
      chosenTheme = 'light';
    } else if (mode === 'dark') {
      chosenTheme = 'dark';
    } else if (mode === 'solar') {
      chosenTheme = solarDetectedTheme;
    } else {
      chosenTheme = systemDetectedTheme;
    }

    // Persist to Firestore if user is authenticated
    const currentUid = auth.currentUser?.uid || authUid;
    if (currentUid) {
      lastPushedModeRef.current = mode;
      saveThemeToFirestore(chosenTheme, mode, currentUid);
    }
  }, [solarDetectedTheme, systemDetectedTheme, authUid, saveThemeToFirestore]);

  // Standard setTheme function accepting 'solar', 'system', 'light', or 'dark'
  const setTheme = useCallback((mode: ThemeMode | EffectiveTheme) => {
    setThemeMode(mode as ThemeMode);
  }, [setThemeMode]);

  // Toggle manually switches to the opposite of current active theme
  const toggleTheme = useCallback(() => {
    const nextManualTheme: EffectiveTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextManualTheme);
  }, [effectiveTheme, setThemeMode]);

  // Reset to solar sunset/sunrise automatic mode
  const resetToSolar = useCallback(() => {
    setThemeMode('solar');
  }, [setThemeMode]);

  // Reset to OS preference mode
  const resetToSystem = useCallback(() => {
    setThemeMode('system');
  }, [setThemeMode]);

  // Real-time synchronization across all devices via Firebase Auth & Firestore onSnapshot
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      // Clean up previous snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setAuthUid(null);
        setIsCloudSynced(false);
        return;
      }

      setAuthUid(user.uid);
      const userRef = doc(db, 'users', user.uid);

      // Realtime listener across all devices
      unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        // Extract chosen theme ('dark' or 'light') and themeMode from Firestore
        const cloudTheme = data.theme || data.themePreference;
        const cloudMode = data.themeMode;

        // Valid mode candidates
        const hasValidCloudTheme = cloudTheme === 'dark' || cloudTheme === 'light';
        const hasValidCloudMode = 
          cloudMode === 'dark' || cloudMode === 'light' || cloudMode === 'solar' || cloudMode === 'system';

        if (hasValidCloudMode || hasValidCloudTheme) {
          const targetMode: ThemeMode = hasValidCloudMode 
            ? cloudMode 
            : (cloudTheme as ThemeMode);

          // Avoid feedback loop if this is the mode we just pushed
          if (lastPushedModeRef.current === targetMode) {
            lastPushedModeRef.current = null;
            setIsCloudSynced(true);
            setLastCloudSyncTime(new Date());
            return;
          }

          setThemeModeState((prev) => {
            if (prev !== targetMode) {
              try {
                localStorage.setItem(THEME_STORAGE_KEY, targetMode);
              } catch (e) {
                console.warn('Unable to persist synced theme to localStorage', e);
              }
              return targetMode;
            }
            return prev;
          });

          setIsCloudSynced(true);
          setLastCloudSyncTime(new Date());
        } else {
          // Document exists but no theme has been saved yet -> persist local preference to user's Firestore profile
          const currentMode = themeMode;
          const currentChosenTheme: EffectiveTheme = 
            currentMode === 'light' ? 'light' : currentMode === 'dark' ? 'dark' : solarDetectedTheme;
          saveThemeToFirestore(currentChosenTheme, currentMode, user.uid);
        }
      }, (err) => {
        console.warn('Notice: Firestore theme synchronization listener:', err);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [solarDetectedTheme, themeMode, saveThemeToFirestore]);

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        effectiveTheme,
        themeMode,
        isSystem: themeMode === 'system',
        isSolar: themeMode === 'solar',
        hasManualOverride: themeMode === 'light' || themeMode === 'dark',
        systemDetectedTheme,
        solarDetectedTheme,
        solarTimes,
        solarLocation,
        solarLoading,
        solarError,
        isCloudSynced,
        isSyncingToCloud,
        lastCloudSyncTime,
        refreshSolarTimes: () => refreshSolarTimes(),
        requestSolarLocation,
        setTheme,
        setThemeMode,
        toggleTheme,
        resetToSolar,
        resetToSystem,
        clearManualOverride: resetToSolar,
        saveThemeToFirestore,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
