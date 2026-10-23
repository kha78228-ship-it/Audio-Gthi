import { useState, useEffect } from 'react';

export type PlatformMode = 'auto' | 'desktop' | 'mobile';

function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // If mobile user agent and not an ultrawide/large desktop screen, treat as mobile
  if (isMobileUA && width < 1200) {
    return true;
  }

  // Standard responsive breakpoint: screens < 1024px (phone/tablet) use mobile touch UI, >= 1024px use PC Desktop Pro
  return width < 1024;
}

export function useDevicePlatform() {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectIsMobile());
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200;
  });

  useEffect(() => {
    // Clear any previous manual overrides from localStorage to ensure 100% automatic detection
    try {
      localStorage.removeItem('haevy_platform_override');
    } catch {
      // ignore
    }

    const updateDevice = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(detectIsMobile());
    };

    window.addEventListener('resize', updateDevice);
    window.addEventListener('orientationchange', updateDevice);
    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('orientationchange', updateDevice);
    };
  }, []);

  const isDesktop = !isMobile;
  const platformMode: PlatformMode = isDesktop ? 'desktop' : 'mobile';

  return {
    platformMode,
    setPlatformMode: () => {}, // No-op, device is 100% automatically detected
    isMobile,
    isDesktop,
    deviceType: isDesktop ? ('pc' as const) : ('mobile' as const),
    windowWidth,
  };
}

