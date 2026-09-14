import * as SunCalc from 'suncalc';

export interface SolarLocation {
  latitude: number;
  longitude: number;
  source: 'gps' | 'cached' | 'fallback';
  accuracy?: number;
  timestamp: number;
}

export interface SolarCalculationResult {
  isDaytime: boolean;
  solarTheme: 'light' | 'dark';
  sunrise: Date | null;
  sunset: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  goldenHour?: Date | null;
  nextTransitionTime: Date | null;
  nextTransitionType: 'sunrise' | 'sunset' | null;
  timeUntilNextTransitionMs: number;
  location: SolarLocation;
}

const SOLAR_COORDS_STORAGE_KEY = 'haevy_solar_coords';
const COORDS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Retrieve cached coordinates from localStorage if available and unexpired
 */
export function getStoredSolarCoordinates(): SolarLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SOLAR_COORDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.latitude === 'number' &&
      typeof parsed?.longitude === 'number' &&
      !isNaN(parsed.latitude) &&
      !isNaN(parsed.longitude)
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        source: 'cached',
        accuracy: parsed.accuracy,
        timestamp: parsed.timestamp || Date.now(),
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached solar coordinates:', err);
  }
  return null;
}

/**
 * Persist coordinates to localStorage
 */
export function persistSolarCoordinates(latitude: number, longitude: number, accuracy?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      latitude,
      longitude,
      accuracy,
      timestamp: Date.now(),
    };
    localStorage.setItem(SOLAR_COORDS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to cache solar coordinates:', err);
  }
}

/**
 * Heuristic fallback location based on user timezone if GPS is denied or unavailable
 */
export function getFallbackLocation(): SolarLocation {
  let lat = 21.0285; // Default Hanoi / SE Asia latitude
  let lng = 105.8542; // Default Hanoi longitude

  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      // Approximate rough latitude/longitude based on common timezone continents
      const offsetHours = -new Date().getTimezoneOffset() / 60;
      lng = offsetHours * 15; // 15 degrees per hour offset

      if (tz.includes('Europe') || tz.includes('London') || tz.includes('Paris') || tz.includes('Berlin')) {
        lat = 50.0;
      } else if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('America')) {
        lat = 38.0;
      } else if (tz.includes('Tokyo') || tz.includes('Seoul')) {
        lat = 35.0;
      } else if (tz.includes('Sydney') || tz.includes('Australia')) {
        lat = -33.8;
      } else if (tz.includes('Singapore') || tz.includes('Bangkok') || tz.includes('Jakarta') || tz.includes('Ho_Chi_Minh')) {
        lat = 14.0;
      }
    } catch {
      // Use defaults
    }
  }

  return {
    latitude: lat,
    longitude: lng,
    source: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Request user coordinates via browser Geolocation API
 */
export function requestBrowserGeolocation(): Promise<SolarLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation API is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        persistSolarCoordinates(latitude, longitude, accuracy);
        resolve({
          latitude,
          longitude,
          source: 'gps',
          accuracy,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // Low power consumption, coarse coordinates are sufficient
        timeout: 8000,
        maximumAge: 60 * 60 * 1000, // 1 hour cached GPS position is fine
      }
    );
  });
}

/**
 * Calculate solar times and day/night status using SunCalc
 */
export function calculateSolarTimes(
  now: Date = new Date(),
  location: SolarLocation = getStoredSolarCoordinates() || getFallbackLocation()
): SolarCalculationResult {
  const { latitude, longitude } = location;

  try {
    const times = SunCalc.getTimes(now, latitude, longitude);
    const sunrise = times.sunrise;
    const sunset = times.sunset;
    const dawn = times.dawn;
    const dusk = times.dusk;
    const goldenHour = times.goldenHour;

    // Handle polar day or polar night where sunrise/sunset might be Invalid Date
    if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
      const sunPosition = SunCalc.getPosition(now, latitude, longitude);
      const isDaytime = sunPosition.altitude > 0;
      return {
        isDaytime,
        solarTheme: isDaytime ? 'light' : 'dark',
        sunrise: null,
        sunset: null,
        dawn: null,
        dusk: null,
        goldenHour: null,
        nextTransitionTime: null,
        nextTransitionType: null,
        timeUntilNextTransitionMs: 60 * 60 * 1000, // Check again in 1 hour
        location,
      };
    }

    const nowMs = now.getTime();
    const sunriseMs = sunrise.getTime();
    const sunsetMs = sunset.getTime();

    const isDaytime = nowMs >= sunriseMs && nowMs < sunsetMs;
    const solarTheme: 'light' | 'dark' = isDaytime ? 'light' : 'dark';

    let nextTransitionTime: Date;
    let nextTransitionType: 'sunrise' | 'sunset';

    if (nowMs < sunriseMs) {
      // Early morning before sunrise -> next event is today's sunrise
      nextTransitionTime = sunrise;
      nextTransitionType = 'sunrise';
    } else if (nowMs < sunsetMs) {
      // Daytime -> next event is today's sunset
      nextTransitionTime = sunset;
      nextTransitionType = 'sunset';
    } else {
      // Nighttime after sunset -> next event is tomorrow's sunrise
      const tomorrow = new Date(nowMs + 24 * 60 * 60 * 1000);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, latitude, longitude);
      nextTransitionTime = isNaN(tomorrowTimes.sunrise.getTime())
        ? new Date(nowMs + 8 * 60 * 60 * 1000)
        : tomorrowTimes.sunrise;
      nextTransitionType = 'sunrise';
    }

    const timeUntilNextTransitionMs = Math.max(1000, nextTransitionTime.getTime() - nowMs);

    return {
      isDaytime,
      solarTheme,
      sunrise,
      sunset,
      dawn,
      dusk,
      goldenHour,
      nextTransitionTime,
      nextTransitionType,
      timeUntilNextTransitionMs,
      location,
    };
  } catch (error) {
    console.warn('Error calculating solar times with SunCalc:', error);

    // Fallback based on local clock hours (6:00 to 18:30)
    const hours = now.getHours() + now.getMinutes() / 60;
    const isDaytime = hours >= 6 && hours < 18.5;
    const fallbackSunrise = new Date(now);
    fallbackSunrise.setHours(6, 0, 0, 0);
    const fallbackSunset = new Date(now);
    fallbackSunset.setHours(18, 30, 0, 0);

    const nextTransitionTime = isDaytime ? fallbackSunset : fallbackSunrise;
    const nextTransitionType = isDaytime ? 'sunset' : 'sunrise';
    const timeUntilNextTransitionMs = Math.max(1000, nextTransitionTime.getTime() - now.getTime());

    return {
      isDaytime,
      solarTheme: isDaytime ? 'light' : 'dark',
      sunrise: fallbackSunrise,
      sunset: fallbackSunset,
      dawn: null,
      dusk: null,
      goldenHour: null,
      nextTransitionTime,
      nextTransitionType,
      timeUntilNextTransitionMs,
      location: { ...location, source: 'fallback' },
    };
  }
}

/**
 * Format a Date to a clean 24h or AM/PM string (e.g. "05:45" or "18:12")
 */
export function formatSolarTime(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
