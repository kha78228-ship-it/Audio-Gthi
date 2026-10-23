import React, { createContext, useContext, useState, useEffect } from 'react';

export type DisplayScale = 'standard' | 'large';

interface DisplayScaleContextType {
  displayScale: DisplayScale;
  setDisplayScale: (scale: DisplayScale) => void;
  toggleDisplayScale: () => void;
  isLargeDisplay: boolean;
}

const DisplayScaleContext = createContext<DisplayScaleContextType | undefined>(undefined);

const DISPLAY_SCALE_KEY = 'haevy_display_scale';

export function DisplayScaleProvider({ children }: { children: React.ReactNode }) {
  const [displayScale, setDisplayScaleState] = useState<DisplayScale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DISPLAY_SCALE_KEY);
        if (saved === 'standard' || saved === 'large') {
          return saved as DisplayScale;
        }
      } catch (e) {
        console.warn('Unable to access localStorage for display scale:', e);
      }
    }
    return 'standard';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (displayScale === 'large') {
      root.classList.add('haevy-large-display');
    } else {
      root.classList.remove('haevy-large-display');
    }

    try {
      localStorage.setItem(DISPLAY_SCALE_KEY, displayScale);
    } catch {
      // ignore in sandboxed environments
    }
  }, [displayScale]);

  const setDisplayScale = (scale: DisplayScale) => {
    setDisplayScaleState(scale);
  };

  const toggleDisplayScale = () => {
    setDisplayScaleState(prev => (prev === 'standard' ? 'large' : 'standard'));
  };

  return (
    <DisplayScaleContext.Provider
      value={{
        displayScale,
        setDisplayScale,
        toggleDisplayScale,
        isLargeDisplay: displayScale === 'large'
      }}
    >
      {children}
    </DisplayScaleContext.Provider>
  );
}

export function useDisplayScale() {
  const context = useContext(DisplayScaleContext);
  if (!context) {
    throw new Error('useDisplayScale must be used within a DisplayScaleProvider');
  }
  return context;
}
