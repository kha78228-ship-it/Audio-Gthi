import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  HaevyTimePhase,
  HaevyWeatherCondition,
  HaevyMoodPalette,
  HaevyWeatherData,
  HaevyMoodState,
  MorningColorThemeId,
  MorningColorThemeConfig
} from '../types';
import { useTheme } from './ThemeContext';
import {
  determineTimePhase,
  fetchCurrentWeather,
  getHaevyMoodPalette,
  applyMoodCssVariables,
  getStoredMoodSettings,
  saveStoredMoodSettings,
  StoredMoodSettings,
  DEFAULT_MORNING_THEMES,
  getMorningThemeConfig,
  applyMorningThemeCssVariables
} from '../services/haevyMoodService';

export interface HaevyMoodContextType {
  moodState: HaevyMoodState;
  palette: HaevyMoodPalette;
  weather: HaevyWeatherData | null;
  timePhase: HaevyTimePhase;
  isAuto: boolean;
  isEnabled: boolean;
  intensity: number;
  isWeatherLoading: boolean;
  toggleMoodEngine: () => void;
  toggleAutoMood: () => void;
  setManualPreset: (timePhase: HaevyTimePhase, weather?: HaevyWeatherCondition) => void;
  resetToAuto: () => void;
  refreshWeather: () => Promise<void>;
  setIntensity: (val: number) => void;
  // Morning Dashboard Color Theme Extensions
  morningTheme: MorningColorThemeId;
  setMorningTheme: (theme: MorningColorThemeId) => void;
  morningThemeConfig: MorningColorThemeConfig;
  availableMorningThemes: MorningColorThemeConfig[];
}

const HaevyMoodContext = createContext<HaevyMoodContextType | undefined>(undefined);

export function HaevyMoodProvider({ children }: { children: React.ReactNode }) {
  const { effectiveTheme, solarTimes, solarLocation } = useTheme();
  const isLightMode = effectiveTheme === 'light';

  // Load initial saved user settings
  const [settings, setSettings] = useState<StoredMoodSettings>(getStoredMoodSettings);
  const [weather, setWeather] = useState<HaevyWeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Determine current active time phase (auto or manual)
  const timePhase: HaevyTimePhase = useMemo(() => {
    if (!settings.isAuto && settings.manualTimePhaseOverride) {
      return settings.manualTimePhaseOverride;
    }
    return determineTimePhase(currentTime, solarTimes);
  }, [settings.isAuto, settings.manualTimePhaseOverride, currentTime, solarTimes]);

  // Determine active weather condition (auto or manual)
  const activeWeatherCondition: HaevyWeatherCondition = useMemo(() => {
    if (!settings.isAuto && settings.manualWeatherOverride) {
      return settings.manualWeatherOverride;
    }
    return weather?.condition || 'clear';
  }, [settings.isAuto, settings.manualWeatherOverride, weather]);

  // Compute active dynamic mood palette
  const palette: HaevyMoodPalette = useMemo(() => {
    return getHaevyMoodPalette(timePhase, activeWeatherCondition, isLightMode);
  }, [timePhase, activeWeatherCondition, isLightMode]);

  const moodState: HaevyMoodState = useMemo(() => ({
    enabled: settings.enabled,
    timePhase,
    weather,
    palette,
    isAuto: settings.isAuto,
    manualTimePhaseOverride: settings.manualTimePhaseOverride,
    manualWeatherOverride: settings.manualWeatherOverride,
    intensity: settings.intensity
  }), [settings, timePhase, weather, palette]);

  // Apply CSS Variables to :root on change with smooth transition
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (settings.enabled) {
      applyMoodCssVariables(palette, isLightMode, settings.intensity);
    } else {
      // Neutral fallback if disabled
      const root = document.documentElement;
      root.style.removeProperty('--haevy-mood-accent');
      root.style.removeProperty('--haevy-mood-accent-rgb');
      root.style.removeProperty('--haevy-mood-accent-glow');
      root.style.removeProperty('--haevy-mood-base-bg');
      root.style.removeProperty('--haevy-mood-surface');
      root.style.removeProperty('--haevy-mood-mesh-orb1');
      root.style.removeProperty('--haevy-mood-mesh-orb2');
      root.style.removeProperty('--haevy-mood-mesh-orb3');
      root.style.removeProperty('--haevy-mood-intensity');
    }
  }, [palette, isLightMode, settings.enabled, settings.intensity]);

  // Fetch live weather data
  const handleFetchWeather = useCallback(async () => {
    setIsWeatherLoading(true);
    try {
      const data = await fetchCurrentWeather(solarLocation || undefined);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch encountered issue:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [solarLocation]);

  // Auto fetch weather on mount & when coordinates change
  useEffect(() => {
    handleFetchWeather();
    // Periodically update weather every 25 minutes
    const weatherInterval = setInterval(handleFetchWeather, 25 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [handleFetchWeather]);

  // Tick clock every 30 seconds for smooth circadian progression
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30 * 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Actions
  const toggleMoodEngine = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      saveStoredMoodSettings(next);
      return next;
    });
  }, []);

  const toggleAutoMood = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, isAuto: !prev.isAuto };
      saveStoredMoodSettings(next);
      return next;
    });
  }, []);

  const setManualPreset = useCallback((targetTimePhase: HaevyTimePhase, targetWeather?: HaevyWeatherCondition) => {
    setSettings((prev) => {
      const next: StoredMoodSettings = {
        ...prev,
        isAuto: false,
        manualTimePhaseOverride: targetTimePhase,
        manualWeatherOverride: targetWeather || prev.manualWeatherOverride || 'clear'
      };
      saveStoredMoodSettings(next);
      return next;
    });
  }, []);

  const resetToAuto = useCallback(() => {
    setSettings((prev) => {
      const next: StoredMoodSettings = {
        ...prev,
        isAuto: true,
        manualTimePhaseOverride: null,
        manualWeatherOverride: null
      };
      saveStoredMoodSettings(next);
      return next;
    });
    handleFetchWeather();
  }, [handleFetchWeather]);

  const setIntensity = useCallback((val: number) => {
    const clamped = Math.min(1.0, Math.max(0.2, val));
    setSettings((prev) => {
      const next = { ...prev, intensity: clamped };
      saveStoredMoodSettings(next);
      return next;
    });
  }, []);

  // Morning Theme state & config
  const morningTheme: MorningColorThemeId = settings.morningTheme || 'solar_auto';

  const morningThemeConfig: MorningColorThemeConfig = useMemo(() => {
    return getMorningThemeConfig(morningTheme, palette, isLightMode);
  }, [morningTheme, palette, isLightMode]);

  // Inject morning theme CSS variables to :root
  useEffect(() => {
    applyMorningThemeCssVariables(morningThemeConfig);
  }, [morningThemeConfig]);

  const setMorningTheme = useCallback((targetTheme: MorningColorThemeId) => {
    setSettings((prev) => {
      const next: StoredMoodSettings = {
        ...prev,
        morningTheme: targetTheme
      };
      saveStoredMoodSettings(next);
      return next;
    });
  }, []);

  return (
    <HaevyMoodContext.Provider
      value={{
        moodState,
        palette,
        weather,
        timePhase,
        isAuto: settings.isAuto,
        isEnabled: settings.enabled,
        intensity: settings.intensity,
        isWeatherLoading,
        toggleMoodEngine,
        toggleAutoMood,
        setManualPreset,
        resetToAuto,
        refreshWeather: handleFetchWeather,
        setIntensity,
        morningTheme,
        setMorningTheme,
        morningThemeConfig,
        availableMorningThemes: DEFAULT_MORNING_THEMES
      }}
    >
      {children}
    </HaevyMoodContext.Provider>
  );
}

export function useHaevyMood() {
  const context = useContext(HaevyMoodContext);
  if (!context) {
    throw new Error('useHaevyMood must be used within a HaevyMoodProvider');
  }
  return context;
}
