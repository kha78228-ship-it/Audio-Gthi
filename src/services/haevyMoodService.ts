import {
  HaevyTimePhase,
  HaevyWeatherCondition,
  HaevyMoodPalette,
  HaevyWeatherData,
  HaevyMoodState,
  SolarTimesInfo,
  MorningColorThemeId,
  MorningColorThemeConfig
} from '../types';
import { SolarLocation, getStoredSolarCoordinates, getFallbackLocation } from '../utils/solarCalculator';

const WEATHER_CACHE_KEY = 'haevy_weather_cache_v2';
const WEATHER_CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MOOD_SETTINGS_KEY = 'haevy_mood_settings_v1';

/**
 * Classify the current time into an intuitive circadian phase
 */
export function determineTimePhase(now: Date = new Date(), solarTimes?: SolarTimesInfo | null): HaevyTimePhase {
  const currentMs = now.getTime();

  if (solarTimes && solarTimes.sunrise && solarTimes.sunset) {
    const sunriseMs = solarTimes.sunrise.getTime();
    const sunsetMs = solarTimes.sunset.getTime();
    const dawnMs = solarTimes.dawn ? solarTimes.dawn.getTime() : sunriseMs - 35 * 60 * 1000;
    const duskMs = solarTimes.dusk ? solarTimes.dusk.getTime() : sunsetMs + 45 * 60 * 1000;
    const goldenHourMs = solarTimes.goldenHour ? solarTimes.goldenHour.getTime() : sunsetMs - 60 * 60 * 1000;

    // 1. Dawn (Rạng đông): từ khi hừng đông đến khi mặt trời mọc
    if (currentMs >= dawnMs && currentMs < sunriseMs + 20 * 60 * 1000) {
      return 'dawn';
    }
    // 2. Morning (Nắng mai): từ sau bình minh đến 11:00
    if (currentMs >= sunriseMs && now.getHours() < 11) {
      return 'morning';
    }
    // 3. Midday (Trưa rực rỡ): 11:00 đến 15:00
    if (now.getHours() >= 11 && now.getHours() < 15) {
      return 'midday';
    }
    // 4. Golden Hour (Hoàng hôn / Chiều tà): từ 15:00 đến mặt trời lặn
    if (currentMs >= goldenHourMs && currentMs < sunsetMs + 10 * 60 * 1000) {
      return 'golden_hour';
    }
    if (now.getHours() >= 15 && currentMs < sunsetMs) {
      return 'golden_hour';
    }
    // 5. Dusk (Chạng vạng): từ sau hoàng hôn đến khi sập tối
    if (currentMs >= sunsetMs && currentMs < duskMs) {
      return 'dusk';
    }
    // 6. Night (Đêm sao): từ sau chạng vạng đến 23:30
    if (now.getHours() >= 20 && now.getHours() < 23.5) {
      return 'night';
    }
    // 7. Midnight (Đêm sâu / Khuya): 23:30 đến hừng đông
    return 'midnight';
  }

  // Fallback based on clock hour if solar times not available
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 5 && hour < 6.5) return 'dawn';
  if (hour >= 6.5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18.5) return 'golden_hour';
  if (hour >= 18.5 && hour < 20) return 'dusk';
  if (hour >= 20 && hour < 23.5) return 'night';
  return 'midnight';
}

/**
 * Map WMO weather code to intuitive Haevy condition
 */
export function mapWmoWeatherCode(code: number): { condition: HaevyWeatherCondition; label: string } {
  if (code === 0) {
    return { condition: 'clear', label: 'Trời quang đãng' };
  }
  if (code === 1) {
    return { condition: 'clear', label: 'Nắng nhẹ, ít mây' };
  }
  if (code === 2) {
    return { condition: 'partly_cloudy', label: 'Mây rải rác' };
  }
  if (code === 3) {
    return { condition: 'overcast', label: 'Trời nhiều mây' };
  }
  if (code >= 45 && code <= 48) {
    return { condition: 'fog', label: 'Sương mù lãng đãng' };
  }
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return { condition: 'rain', label: 'Mưa rơi rả rích' };
  }
  if (code >= 66 && code <= 77) {
    return { condition: 'snow', label: 'Tuyết / Lạnh giá' };
  }
  if (code >= 95 && code <= 99) {
    return { condition: 'storm', label: 'Mưa giông sấm chớp' };
  }
  return { condition: 'clear', label: 'Thời tiết ôn hòa' };
}

/**
 * Fetch live weather from Open-Meteo API using user coordinates
 */
export async function fetchCurrentWeather(location?: SolarLocation): Promise<HaevyWeatherData> {
  const loc = location || getStoredSolarCoordinates() || getFallbackLocation();
  const cacheKey = `${WEATHER_CACHE_KEY}_${loc.latitude.toFixed(1)}_${loc.longitude.toFixed(1)}`;

  // Check valid localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: HaevyWeatherData = JSON.parse(cached);
        if (Date.now() - parsed.lastUpdated < WEATHER_CACHE_MAX_AGE_MS) {
          return { ...parsed, source: 'cached' };
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude.toFixed(4)}&longitude=${loc.longitude.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const code = typeof current.weather_code === 'number' ? current.weather_code : 0;
    const { condition, label } = mapWmoWeatherCode(code);

    const weatherResult: HaevyWeatherData = {
      temperature: Math.round(current.temperature_2m ?? 26),
      weatherCode: code,
      condition,
      conditionLabel: label,
      locationName: data.timezone ? data.timezone.replace('_', ' ') : 'Khu vực địa phương',
      isDay: Boolean(current.is_day ?? 1),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      lastUpdated: Date.now(),
      source: 'open-meteo'
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(weatherResult));
      } catch {
        // Storage quota safeguard
      }
    }

    return weatherResult;
  } catch (err) {
    console.warn('Weather fetch failed, falling back to estimated weather:', err);

    // Contextual fallback based on current hour
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    const fallbackTemp = isDay ? 28 : 22;

    return {
      temperature: fallbackTemp,
      weatherCode: 0,
      condition: 'clear',
      conditionLabel: isDay ? 'Nắng quang đãng' : 'Trời trong tĩnh lặng',
      locationName: 'Vị trí địa phương',
      isDay,
      humidity: 60,
      windSpeed: 10,
      lastUpdated: Date.now(),
      source: 'fallback'
    };
  }
}

/**
 * Generate an aesthetically harmonious Haevy Mood color palette
 * adapting seamlessly to Dark or Light mode.
 */
export function getHaevyMoodPalette(
  timePhase: HaevyTimePhase,
  weather: HaevyWeatherCondition,
  isLightMode: boolean
): HaevyMoodPalette {
  const isDaytime = timePhase === 'dawn' || timePhase === 'morning' || timePhase === 'midday' || timePhase === 'golden_hour';

  // Specific weather overrides take precedence when atmospheric (e.g. rain, storm, fog)
  if (weather === 'rain') {
    if (isLightMode) {
      return {
        id: 'rain_light',
        name: 'Rainy Day Zen',
        vietnameseTitle: 'Mưa Rơi Thanh Tịnh',
        description: 'Tông màu lam ngọc dịu mát, thanh lọc tâm trí với âm vang giọt mưa',
        timePhase,
        weather,
        isDaytime,
        baseBg: '#f0f9ff',
        surfaceBg: '#ffffff',
        accentColor: '#0284c7',
        accentGlow: 'rgba(2, 132, 199, 0.22)',
        accentRgb: '2, 132, 199',
        ambientGradient: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e2e8f0 100%)',
        ambientMesh: {
          orb1: 'rgba(56, 189, 248, 0.18)',
          orb2: 'rgba(14, 165, 233, 0.14)',
          orb3: 'rgba(99, 102, 241, 0.12)',
          opacity: 0.75
        },
        badgeColor: '#0369a1',
        badgeBg: 'rgba(14, 165, 233, 0.12)',
        temperatureHint: 'Mát mẻ & Tĩnh tâm',
        particlesType: 'rain'
      };
    }
    return {
      id: 'rain_dark',
      name: 'Midnight Rain Echo',
      vietnameseTitle: 'Mưa Đêm Trầm Lắng',
      description: 'Sắc lam thẫm huyền ảo, tạo không gian tập trung và thư giãn sâu',
      timePhase,
      weather,
      isDaytime,
      baseBg: '#060a12',
      surfaceBg: '#0b111c',
      accentColor: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.28)',
      accentRgb: '56, 189, 248',
      ambientGradient: 'linear-gradient(135deg, #030712 0%, #081226 50%, #060a12 100%)',
      ambientMesh: {
        orb1: 'rgba(14, 165, 233, 0.22)',
        orb2: 'rgba(56, 189, 248, 0.16)',
        orb3: 'rgba(99, 102, 241, 0.14)',
        opacity: 0.85
      },
      badgeColor: '#7dd3fc',
      badgeBg: 'rgba(14, 165, 233, 0.15)',
      temperatureHint: 'Se lạnh & Tĩnh mịch',
      particlesType: 'rain'
    };
  }

  if (weather === 'storm') {
    if (isLightMode) {
      return {
        id: 'storm_light',
        name: 'Electric Tempest Light',
        vietnameseTitle: 'Giông Tố Huyền Ảo',
        description: 'Tông tím hoa cà phối chàm xám mạnh mẽ, khơi dậy nội lực sáng tạo',
        timePhase,
        weather,
        isDaytime,
        baseBg: '#f5f3ff',
        surfaceBg: '#ffffff',
        accentColor: '#7c3aed',
        accentGlow: 'rgba(124, 58, 237, 0.2)',
        accentRgb: '124, 58, 237',
        ambientGradient: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #f1f5f9 100%)',
        ambientMesh: {
          orb1: 'rgba(168, 85, 247, 0.20)',
          orb2: 'rgba(99, 102, 241, 0.16)',
          orb3: 'rgba(139, 92, 246, 0.14)',
          opacity: 0.8
        },
        badgeColor: '#6d28d9',
        badgeBg: 'rgba(139, 92, 246, 0.14)',
        temperatureHint: 'Mạnh mẽ & Tập trung',
        particlesType: 'mist'
      };
    }
    return {
      id: 'storm_dark',
      name: 'Thunder Violet Veil',
      vietnameseTitle: 'Giông Bão Tím Thẫm',
      description: 'Hào quang tím điện từ trên nền bóng tối, tạo trường năng lượng sâu sắc',
      timePhase,
      weather,
      isDaytime,
      baseBg: '#080512',
      surfaceBg: '#100c1e',
      accentColor: '#c084fc',
      accentGlow: 'rgba(192, 132, 252, 0.35)',
      accentRgb: '192, 132, 252',
      ambientGradient: 'linear-gradient(135deg, #05020a 0%, #160b2b 50%, #090514 100%)',
      ambientMesh: {
        orb1: 'rgba(168, 85, 247, 0.26)',
        orb2: 'rgba(192, 132, 252, 0.18)',
        orb3: 'rgba(79, 70, 229, 0.22)',
        opacity: 0.9
      },
      badgeColor: '#d8b4fe',
      badgeBg: 'rgba(168, 85, 247, 0.18)',
      temperatureHint: 'Năng lượng điện từ cao',
      particlesType: 'aurora'
    };
  }

  if (weather === 'fog' || weather === 'overcast') {
    if (isLightMode) {
      return {
        id: 'fog_light',
        name: 'Misty Sage Breath',
        vietnameseTitle: 'Sương Khói Bồng Bềnh',
        description: 'Tông ngọc lục bảo nhạt và xám ngọc trai dịu nhẹ, dưỡng mắt tuyệt đối',
        timePhase,
        weather,
        isDaytime,
        baseBg: '#f0fdf4',
        surfaceBg: '#ffffff',
        accentColor: '#059669',
        accentGlow: 'rgba(5, 150, 105, 0.18)',
        accentRgb: '5, 150, 105',
        ambientGradient: 'linear-gradient(135deg, #e6f7ef 0%, #f0fdf4 50%, #f1f5f9 100%)',
        ambientMesh: {
          orb1: 'rgba(52, 211, 153, 0.16)',
          orb2: 'rgba(45, 212, 191, 0.14)',
          orb3: 'rgba(148, 163, 184, 0.12)',
          opacity: 0.7
        },
        badgeColor: '#047857',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        temperatureHint: 'Mát mẻ & Mềm mại',
        particlesType: 'mist'
      };
    }
    return {
      id: 'fog_dark',
      name: 'Misty Twilight Embers',
      vietnameseTitle: 'Sương Đêm Tĩnh Lặng',
      description: 'Làn sương ngọc lam và xám khói trôi lững lờ, cân bằng trạng thái tinh thần',
      timePhase,
      weather,
      isDaytime,
      baseBg: '#060a0a',
      surfaceBg: '#0c1314',
      accentColor: '#2dd4bf',
      accentGlow: 'rgba(45, 212, 191, 0.25)',
      accentRgb: '45, 212, 191',
      ambientGradient: 'linear-gradient(135deg, #030606 0%, #091a18 50%, #060a0a 100%)',
      ambientMesh: {
        orb1: 'rgba(45, 212, 191, 0.18)',
        orb2: 'rgba(20, 184, 166, 0.14)',
        orb3: 'rgba(71, 85, 105, 0.15)',
        opacity: 0.8
      },
      badgeColor: '#5eead4',
      badgeBg: 'rgba(45, 212, 191, 0.14)',
      temperatureHint: 'Yên bình & Mờ sương',
      particlesType: 'mist'
    };
  }

  // Circadian Time-Phase Primary Palettes
  switch (timePhase) {
    case 'dawn':
      if (isLightMode) {
        return {
          id: 'dawn_light',
          name: 'Rose Quartz Dawn',
          vietnameseTitle: 'Bình Minh Ửng Hồng',
          description: 'Ánh rạng đông cánh sen tươi sáng, đón chào ngày mới đầy hi vọng',
          timePhase,
          weather,
          isDaytime: true,
          baseBg: '#fff1f2',
          surfaceBg: '#ffffff',
          accentColor: '#e11d48',
          accentGlow: 'rgba(225, 29, 72, 0.2)',
          accentRgb: '225, 29, 72',
          ambientGradient: 'linear-gradient(135deg, #ffe4e6 0%, #fff1f2 50%, #fef3c7 100%)',
          ambientMesh: {
            orb1: 'rgba(251, 113, 133, 0.22)',
            orb2: 'rgba(251, 191, 36, 0.18)',
            orb3: 'rgba(244, 63, 94, 0.14)',
            opacity: 0.75
          },
          badgeColor: '#be123c',
          badgeBg: 'rgba(244, 63, 94, 0.12)',
          temperatureHint: 'Trong lành & Tươi mới',
          particlesType: 'sunbeams'
        };
      }
      return {
        id: 'dawn_dark',
        name: 'Sunrise Rose Horizon',
        vietnameseTitle: 'Rạng Đông Hổ Phách Hoa Hồng',
        description: 'Vệt sáng hồng đào thức giấc nơi chân trời vũ trụ, báo hiệu bình minh',
        timePhase,
        weather,
        isDaytime: true,
        baseBg: '#0d070b',
        surfaceBg: '#160d13',
        accentColor: '#fb7185',
        accentGlow: 'rgba(251, 113, 133, 0.3)',
        accentRgb: '251, 113, 133',
        ambientGradient: 'linear-gradient(135deg, #090308 0%, #200d1b 50%, #0d070b 100%)',
        ambientMesh: {
          orb1: 'rgba(244, 63, 94, 0.24)',
          orb2: 'rgba(251, 146, 60, 0.18)',
          orb3: 'rgba(168, 85, 247, 0.14)',
          opacity: 0.85
        },
        badgeColor: '#fda4af',
        badgeBg: 'rgba(244, 63, 94, 0.15)',
        temperatureHint: 'Ấm áp & Đầy sức sống',
        particlesType: 'sunbeams'
      };

    case 'morning':
      if (isLightMode) {
        return {
          id: 'morning_light',
          name: 'Fresh Golden Sunbeam',
          vietnameseTitle: 'Nắng Mai Trong Trẻo',
          description: 'Sắc vàng tươi ấm áp kết hợp da trời trong vắt, kích hoạt sự tỉnh táo',
          timePhase,
          weather,
          isDaytime: true,
          baseBg: '#fffbeb',
          surfaceBg: '#ffffff',
          accentColor: '#d97706',
          accentGlow: 'rgba(217, 119, 6, 0.2)',
          accentRgb: '217, 119, 6',
          ambientGradient: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #f0f9ff 100%)',
          ambientMesh: {
            orb1: 'rgba(245, 158, 11, 0.22)',
            orb2: 'rgba(56, 189, 248, 0.16)',
            orb3: 'rgba(251, 191, 36, 0.16)',
            opacity: 0.75
          },
          badgeColor: '#b45309',
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          temperatureHint: 'Sảng khoái & Tỉnh táo',
          particlesType: 'sunbeams'
        };
      }
      return {
        id: 'morning_dark',
        name: 'Solar Amber Flare',
        vietnameseTitle: 'Hào Quang Nắng Sớm',
        description: 'Vàng hổ phách rực rỡ len lỏi trên nền tối, thúc đẩy động lực làm việc',
        timePhase,
        weather,
        isDaytime: true,
        baseBg: '#090805',
        surfaceBg: '#131109',
        accentColor: '#fbbf24',
        accentGlow: 'rgba(251, 191, 36, 0.3)',
        accentRgb: '251, 191, 36',
        ambientGradient: 'linear-gradient(135deg, #060503 0%, #1c1508 50%, #090805 100%)',
        ambientMesh: {
          orb1: 'rgba(245, 158, 11, 0.25)',
          orb2: 'rgba(217, 119, 6, 0.18)',
          orb3: 'rgba(14, 165, 233, 0.12)',
          opacity: 0.85
        },
        badgeColor: '#fde68a',
        badgeBg: 'rgba(245, 158, 11, 0.16)',
        temperatureHint: 'Tràn đầy năng lượng',
        particlesType: 'sunbeams'
      };

    case 'midday':
      if (isLightMode) {
        return {
          id: 'midday_light',
          name: 'Crystal Azure Light',
          vietnameseTitle: 'Trưa Nắng Trong Veo',
          description: 'Độ tương phản quang học sắc nét, tôn vinh độ chính xác và sáng suốt',
          timePhase,
          weather,
          isDaytime: true,
          baseBg: '#f8fafc',
          surfaceBg: '#ffffff',
          accentColor: '#0284c7',
          accentGlow: 'rgba(2, 132, 199, 0.2)',
          accentRgb: '2, 132, 199',
          ambientGradient: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 50%, #f1f5f9 100%)',
          ambientMesh: {
            orb1: 'rgba(6, 182, 212, 0.20)',
            orb2: 'rgba(59, 130, 246, 0.16)',
            orb3: 'rgba(245, 158, 11, 0.14)',
            opacity: 0.75
          },
          badgeColor: '#0369a1',
          badgeBg: 'rgba(2, 132, 199, 0.12)',
          temperatureHint: 'Sáng tỏ & Tập trung',
          particlesType: 'none'
        };
      }
      return {
        id: 'midday_dark',
        name: 'Zenith Blue Crystal',
        vietnameseTitle: 'Đỉnh Nhật Lam Ngọc',
        description: 'Sắc xanh ngọc bích rực rỡ và tự tin, duy trì hiệu suất cao nhất trong ngày',
        timePhase,
        weather,
        isDaytime: true,
        baseBg: '#06080e',
        surfaceBg: '#0c101a',
        accentColor: '#38bdf8',
        accentGlow: 'rgba(56, 189, 248, 0.32)',
        accentRgb: '56, 189, 248',
        ambientGradient: 'linear-gradient(135deg, #030408 0%, #0a1628 50%, #06080e 100%)',
        ambientMesh: {
          orb1: 'rgba(14, 165, 233, 0.26)',
          orb2: 'rgba(6, 182, 212, 0.18)',
          orb3: 'rgba(245, 158, 11, 0.12)',
          opacity: 0.85
        },
        badgeColor: '#7dd3fc',
        badgeBg: 'rgba(14, 165, 233, 0.16)',
        temperatureHint: 'Hiệu suất đỉnh cao',
        particlesType: 'none'
      };

    case 'golden_hour':
      if (isLightMode) {
        return {
          id: 'golden_hour_light',
          name: 'Golden Sunset Glow',
          vietnameseTitle: 'Hoàng Hôn Hổ Phách',
          description: 'Ánh mật ong ấm dịu lúc chiều tà, mang lại cảm giác bình yên và mãn nguyện',
          timePhase,
          weather,
          isDaytime: true,
          baseBg: '#fffbeb',
          surfaceBg: '#ffffff',
          accentColor: '#d97706',
          accentGlow: 'rgba(217, 119, 6, 0.25)',
          accentRgb: '217, 119, 6',
          ambientGradient: 'linear-gradient(135deg, #fed7aa 0%, #fffbeb 50%, #fef3c7 100%)',
          ambientMesh: {
            orb1: 'rgba(249, 115, 22, 0.24)',
            orb2: 'rgba(245, 158, 11, 0.20)',
            orb3: 'rgba(234, 88, 12, 0.16)',
            opacity: 0.8
          },
          badgeColor: '#b45309',
          badgeBg: 'rgba(245, 158, 11, 0.14)',
          temperatureHint: 'Thư thái & Ấm áp',
          particlesType: 'sunbeams'
        };
      }
      return {
        id: 'golden_hour_dark',
        name: 'Liquid Amber Sunset',
        vietnameseTitle: 'Hoàng Hôn Mật Ong Thẫm',
        description: 'Tông hổ phách và đồng thau óng ánh, chuyển giao nhịp sống sau giờ làm việc',
        timePhase,
        weather,
        isDaytime: true,
        baseBg: '#0e0906',
        surfaceBg: '#18100a',
        accentColor: '#f59e0b',
        accentGlow: 'rgba(245, 158, 11, 0.38)',
        accentRgb: '245, 158, 11',
        ambientGradient: 'linear-gradient(135deg, #080503 0%, #221207 50%, #0e0906 100%)',
        ambientMesh: {
          orb1: 'rgba(245, 158, 11, 0.30)',
          orb2: 'rgba(234, 88, 12, 0.22)',
          orb3: 'rgba(168, 85, 247, 0.12)',
          opacity: 0.9
        },
        badgeColor: '#fde68a',
        badgeBg: 'rgba(245, 158, 11, 0.18)',
        temperatureHint: 'Lắng đọng & Thảnh thơi',
        particlesType: 'sunbeams'
      };

    case 'dusk':
      if (isLightMode) {
        return {
          id: 'dusk_light',
          name: 'Lavender Dusk Whispers',
          vietnameseTitle: 'Chạng Vạng Hoa Oải Hương',
          description: 'Sắc tím oải hương pha ánh lam chiều, làm dịu đôi mắt và buông bỏ căng thẳng',
          timePhase,
          weather,
          isDaytime: false,
          baseBg: '#faf5ff',
          surfaceBg: '#ffffff',
          accentColor: '#9333ea',
          accentGlow: 'rgba(147, 51, 234, 0.2)',
          accentRgb: '147, 51, 234',
          ambientGradient: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 50%, #e0e7ff 100%)',
          ambientMesh: {
            orb1: 'rgba(168, 85, 247, 0.20)',
            orb2: 'rgba(129, 140, 248, 0.16)',
            orb3: 'rgba(244, 63, 94, 0.12)',
            opacity: 0.75
          },
          badgeColor: '#7e22ce',
          badgeBg: 'rgba(147, 51, 234, 0.12)',
          temperatureHint: 'Dịu dàng & Buông bỏ',
          particlesType: 'aurora'
        };
      }
      return {
        id: 'dusk_dark',
        name: 'Twilight Magenta Veil',
        vietnameseTitle: 'Chạng Vạng Tím Thẫm',
        description: 'Màu tím huyền ảo chuyển tiếp từ hoàng hôn sang đêm, đưa tâm thức vào chiều sâu',
        timePhase,
        weather,
        isDaytime: false,
        baseBg: '#0a0712',
        surfaceBg: '#130e1f',
        accentColor: '#a855f7',
        accentGlow: 'rgba(168, 85, 247, 0.35)',
        accentRgb: '168, 85, 247',
        ambientGradient: 'linear-gradient(135deg, #06040a 0%, #1b0d2d 50%, #0a0712 100%)',
        ambientMesh: {
          orb1: 'rgba(168, 85, 247, 0.26)',
          orb2: 'rgba(236, 72, 153, 0.18)',
          orb3: 'rgba(79, 70, 229, 0.20)',
          opacity: 0.88
        },
        badgeColor: '#d8b4fe',
        badgeBg: 'rgba(168, 85, 247, 0.16)',
        temperatureHint: 'Mơ màng & Nghỉ ngơi',
        particlesType: 'aurora'
      };

    case 'night':
      if (isLightMode) {
        return {
          id: 'night_light',
          name: 'Starlight Silver Glow',
          vietnameseTitle: 'Ánh Bạc Trời Đêm',
          description: 'Nền ngọc trai phủ ánh bạc tinh khôi, tạo không gian yên tĩnh đọc sách',
          timePhase,
          weather,
          isDaytime: false,
          baseBg: '#f8fafc',
          surfaceBg: '#ffffff',
          accentColor: '#4f46e5',
          accentGlow: 'rgba(79, 70, 229, 0.2)',
          accentRgb: '79, 70, 229',
          ambientGradient: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 50%, #ede9fe 100%)',
          ambientMesh: {
            orb1: 'rgba(99, 102, 241, 0.20)',
            orb2: 'rgba(139, 92, 246, 0.16)',
            orb3: 'rgba(56, 189, 248, 0.12)',
            opacity: 0.75
          },
          badgeColor: '#4338ca',
          badgeBg: 'rgba(79, 70, 229, 0.12)',
          temperatureHint: 'Yên ả & Sâu lắng',
          particlesType: 'stars'
        };
      }
      return {
        id: 'night_dark',
        name: 'Starlight Obsidian',
        vietnameseTitle: 'Đêm Sao Tĩnh Mịch',
        description: 'Vòm trời đen thẳm dát ánh sao xanh chàm, bảo vệ đôi mắt và đưa vào giấc ngủ',
        timePhase,
        weather,
        isDaytime: false,
        baseBg: '#05070e',
        surfaceBg: '#0b0e18',
        accentColor: '#818cf8',
        accentGlow: 'rgba(129, 140, 248, 0.28)',
        accentRgb: '129, 140, 248',
        ambientGradient: 'linear-gradient(135deg, #020306 0%, #0c1224 50%, #05070e 100%)',
        ambientMesh: {
          orb1: 'rgba(99, 102, 241, 0.22)',
          orb2: 'rgba(14, 165, 233, 0.16)',
          orb3: 'rgba(139, 92, 246, 0.14)',
          opacity: 0.85
        },
        badgeColor: '#a5b4fc',
        badgeBg: 'rgba(99, 102, 241, 0.15)',
        temperatureHint: 'Tĩnh mịch & Êm ái',
        particlesType: 'stars'
      };

    case 'midnight':
    default:
      if (isLightMode) {
        return {
          id: 'midnight_light',
          name: 'Silent Aurora Dew',
          vietnameseTitle: 'Sương Khuya Tĩnh Mịch',
          description: 'Sắc ngọc bích đêm khuya dịu mắt, phục hồi năng lượng tinh thần',
          timePhase,
          weather,
          isDaytime: false,
          baseBg: '#f0fdfa',
          surfaceBg: '#ffffff',
          accentColor: '#0d9488',
          accentGlow: 'rgba(13, 148, 136, 0.18)',
          accentRgb: '13, 148, 136',
          ambientGradient: 'linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 50%, #f1f5f9 100%)',
          ambientMesh: {
            orb1: 'rgba(20, 184, 166, 0.18)',
            orb2: 'rgba(99, 102, 241, 0.12)',
            orb3: 'rgba(56, 189, 248, 0.12)',
            opacity: 0.7
          },
          badgeColor: '#0f766e',
          badgeBg: 'rgba(13, 148, 136, 0.12)',
          temperatureHint: 'Trầm mặc & Tịnh hóa',
          particlesType: 'stars'
        };
      }
      return {
        id: 'midnight_dark',
        name: 'Cosmic Abyssal Aurora',
        vietnameseTitle: 'Khuya Vũ Trụ Tĩnh Lặng',
        description: 'Độ sâu huyền bí của hố đen kết hợp dải cực quang ngọc lục bảo, tiết kiệm pin tối đa',
        timePhase,
        weather,
        isDaytime: false,
        baseBg: '#040508',
        surfaceBg: '#090b10',
        accentColor: '#2dd4bf',
        accentGlow: 'rgba(45, 212, 191, 0.22)',
        accentRgb: '45, 212, 191',
        ambientGradient: 'linear-gradient(135deg, #020305 0%, #061517 50%, #040508 100%)',
        ambientMesh: {
          orb1: 'rgba(20, 184, 166, 0.18)',
          orb2: 'rgba(6, 182, 212, 0.12)',
          orb3: 'rgba(99, 102, 241, 0.10)',
          opacity: 0.8
        },
        badgeColor: '#5eead4',
        badgeBg: 'rgba(45, 212, 191, 0.12)',
        temperatureHint: 'Nghỉ ngơi sâu sắc',
        particlesType: 'stars'
      };
  }
}

/**
 * Smoothly injects the active Haevy Mood palette into the document's CSS root variables.
 */
export function applyMoodCssVariables(
  palette: HaevyMoodPalette,
  isLightMode: boolean,
  intensity: number = 0.75
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set individual CSS variables with transition support
  root.style.setProperty('--haevy-mood-accent', palette.accentColor);
  root.style.setProperty('--haevy-mood-accent-rgb', palette.accentRgb);
  root.style.setProperty('--haevy-mood-accent-glow', palette.accentGlow);
  root.style.setProperty('--haevy-mood-base-bg', palette.baseBg);
  root.style.setProperty('--haevy-mood-surface', palette.surfaceBg);
  root.style.setProperty('--haevy-mood-badge-color', palette.badgeColor);
  root.style.setProperty('--haevy-mood-badge-bg', palette.badgeBg);
  root.style.setProperty('--haevy-mood-mesh-orb1', palette.ambientMesh.orb1);
  root.style.setProperty('--haevy-mood-mesh-orb2', palette.ambientMesh.orb2);
  root.style.setProperty('--haevy-mood-mesh-orb3', palette.ambientMesh.orb3);
  root.style.setProperty('--haevy-mood-intensity', intensity.toFixed(2));
}

/**
 * Stored settings helper
 */
export interface StoredMoodSettings {
  enabled: boolean;
  isAuto: boolean;
  manualTimePhaseOverride: HaevyTimePhase | null;
  manualWeatherOverride: HaevyWeatherCondition | null;
  intensity: number;
  morningTheme?: MorningColorThemeId;
}

export const MORNING_THEME_STORAGE_KEY = 'haevy_morning_color_theme_v2';

export const DEFAULT_MORNING_THEMES: MorningColorThemeConfig[] = [
  {
    id: 'solar_auto',
    name: 'Đồng Bộ Tự Nhiên',
    vietnameseTitle: 'Chu Kỳ Nhịp Sinh Học',
    energyLevel: 'Tự nhiên theo giờ ☀️',
    description: 'Tự động hòa sắc theo ánh sáng mặt trời thực tế và diễn biến thời tiết hiện tại.',
    accentColor: '#f59e0b',
    accentRgb: '245, 158, 11',
    accentGlow: 'rgba(245, 158, 11, 0.32)',
    cardBgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.09) 0%, rgba(20, 20, 26, 0.85) 50%, rgba(9, 9, 12, 0.95) 100%)',
    cardBorderColor: 'rgba(245, 158, 11, 0.28)',
    glowOrb1: 'rgba(245, 158, 11, 0.18)',
    glowOrb2: 'rgba(56, 189, 248, 0.14)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeText: '#fbbf24',
    iconEmoji: '☀️'
  },
  {
    id: 'sunrise_gold',
    name: 'Vàng Bình Minh',
    vietnameseTitle: 'Năng Lượng Khởi Sắc',
    energyLevel: 'Năng lượng cao ⚡',
    description: 'Sắc hổ phách & ánh cam ấm rực rỡ, kích thích ý chí hành động và nhiệt huyết ngày mới.',
    accentColor: '#f59e0b',
    accentRgb: '245, 158, 11',
    accentGlow: 'rgba(245, 158, 11, 0.36)',
    cardBgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(26, 18, 12, 0.85) 50%, rgba(10, 8, 6, 0.95) 100%)',
    cardBorderColor: 'rgba(245, 158, 11, 0.35)',
    glowOrb1: 'rgba(245, 158, 11, 0.24)',
    glowOrb2: 'rgba(251, 146, 60, 0.16)',
    badgeBg: 'rgba(245, 158, 11, 0.20)',
    badgeText: '#fbbf24',
    iconEmoji: '⚡'
  },
  {
    id: 'emerald_zen',
    name: 'Lục Bảo Zen',
    vietnameseTitle: 'Tĩnh Tâm & Sáng Suốt',
    energyLevel: 'Tập trung sâu 🍃',
    description: 'Sắc xanh ngọc lục bảo và thảo mộc tĩnh tại, ổn định nhịp tim và cân bằng cảm xúc.',
    accentColor: '#10b981',
    accentRgb: '16, 185, 129',
    accentGlow: 'rgba(16, 185, 129, 0.34)',
    cardBgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.11) 0%, rgba(10, 24, 16, 0.85) 50%, rgba(6, 12, 8, 0.95) 100%)',
    cardBorderColor: 'rgba(16, 185, 129, 0.32)',
    glowOrb1: 'rgba(16, 185, 129, 0.22)',
    glowOrb2: 'rgba(20, 184, 166, 0.16)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeText: '#34d399',
    iconEmoji: '🍃'
  },
  {
    id: 'ocean_breeze',
    name: 'Gió Biển Lam Ngọc',
    vietnameseTitle: 'Tươi Mát & Sảng Khoái',
    energyLevel: 'Tỉnh táo tươi mát 🌊',
    description: 'Làn sóng biển thanh khiết màu lam ngọc, đánh thức sự nhạy bén và cảm hứng trí tuệ.',
    accentColor: '#06b6d4',
    accentRgb: '6, 182, 212',
    accentGlow: 'rgba(6, 182, 212, 0.34)',
    cardBgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.11) 0%, rgba(8, 22, 30, 0.85) 50%, rgba(5, 11, 16, 0.95) 100%)',
    cardBorderColor: 'rgba(6, 182, 212, 0.32)',
    glowOrb1: 'rgba(6, 182, 212, 0.22)',
    glowOrb2: 'rgba(59, 130, 246, 0.16)',
    badgeBg: 'rgba(6, 182, 212, 0.18)',
    badgeText: '#38bdf8',
    iconEmoji: '🌊'
  },
  {
    id: 'lavender_calm',
    name: 'Oải Hương Bình Yên',
    vietnameseTitle: 'Thư Thái & Nhẹ Nhàng',
    energyLevel: 'Bình yên dịu êm 🪻',
    description: 'Sắc tím oải hương mềm mại xua tan âu lo, mang đến nhịp thở êm đềm và an lành.',
    accentColor: '#a855f7',
    accentRgb: '168, 85, 247',
    accentGlow: 'rgba(168, 85, 247, 0.34)',
    cardBgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.11) 0%, rgba(22, 14, 30, 0.85) 50%, rgba(10, 6, 16, 0.95) 100%)',
    cardBorderColor: 'rgba(168, 85, 247, 0.32)',
    glowOrb1: 'rgba(168, 85, 247, 0.22)',
    glowOrb2: 'rgba(236, 72, 153, 0.15)',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    badgeText: '#c084fc',
    iconEmoji: '🪻'
  },
  {
    id: 'rose_blossom',
    name: 'Hồng Ban Mai',
    vietnameseTitle: 'Ấm Áp & Lạc Quan',
    energyLevel: 'Tích cực yêu đời 🌸',
    description: 'Tông màu hồng hoa đào tươi trẻ, lan tỏa năng lượng yêu đời và lòng biết ơn cuộc sống.',
    accentColor: '#f43f5e',
    accentRgb: '244, 63, 94',
    accentGlow: 'rgba(244, 63, 94, 0.34)',
    cardBgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.11) 0%, rgba(28, 12, 18, 0.85) 50%, rgba(14, 6, 9, 0.95) 100%)',
    cardBorderColor: 'rgba(244, 63, 94, 0.32)',
    glowOrb1: 'rgba(244, 63, 94, 0.22)',
    glowOrb2: 'rgba(251, 113, 133, 0.16)',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    badgeText: '#fb7185',
    iconEmoji: '🌸'
  },
  {
    id: 'cosmic_focus',
    name: 'Vũ Trụ Huyền Ảo',
    vietnameseTitle: 'Siêu Tập Trung Deep Flow',
    energyLevel: 'Tập trung cao độ 🌌',
    description: 'Nền không gian vũ trụ tĩnh lặng pha sắc chàm vi diệu, loại bỏ mọi tác nhân gây xao nhãng.',
    accentColor: '#6366f1',
    accentRgb: '99, 102, 241',
    accentGlow: 'rgba(99, 102, 241, 0.34)',
    cardBgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.10) 0%, rgba(12, 12, 24, 0.88) 50%, rgba(5, 5, 12, 0.96) 100%)',
    cardBorderColor: 'rgba(99, 102, 241, 0.30)',
    glowOrb1: 'rgba(99, 102, 241, 0.20)',
    glowOrb2: 'rgba(168, 85, 247, 0.14)',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    badgeText: '#818cf8',
    iconEmoji: '🌌'
  }
];

export function getMorningThemeConfig(
  themeId: MorningColorThemeId,
  palette?: HaevyMoodPalette,
  isLightMode: boolean = false
): MorningColorThemeConfig {
  const found = DEFAULT_MORNING_THEMES.find((t) => t.id === themeId);
  const base = found || DEFAULT_MORNING_THEMES[0];

  // If theme is solar_auto and we have active circadian palette, dynamically adapt
  if (themeId === 'solar_auto' && palette) {
    if (isLightMode) {
      return {
        ...base,
        accentColor: palette.accentColor,
        accentRgb: palette.accentRgb,
        accentGlow: palette.accentGlow,
        cardBgGradient: `linear-gradient(135deg, rgba(${palette.accentRgb}, 0.12) 0%, rgba(255, 255, 255, 0.85) 50%, rgba(248, 250, 252, 0.95) 100%)`,
        cardBorderColor: `rgba(${palette.accentRgb}, 0.35)`,
        glowOrb1: palette.ambientMesh.orb1,
        glowOrb2: palette.ambientMesh.orb2,
        badgeBg: palette.badgeBg,
        badgeText: palette.badgeColor,
        description: `Đang hòa sắc cùng ${palette.vietnameseTitle} (${palette.temperatureHint})`
      };
    }
    return {
      ...base,
      accentColor: palette.accentColor,
      accentRgb: palette.accentRgb,
      accentGlow: palette.accentGlow,
      cardBgGradient: `linear-gradient(135deg, rgba(${palette.accentRgb}, 0.10) 0%, rgba(18, 18, 26, 0.85) 50%, rgba(9, 9, 12, 0.96) 100%)`,
      cardBorderColor: `rgba(${palette.accentRgb}, 0.30)`,
      glowOrb1: palette.ambientMesh.orb1,
      glowOrb2: palette.ambientMesh.orb2,
      badgeBg: palette.badgeBg,
      badgeText: palette.badgeColor,
      description: `Đang hòa sắc cùng ${palette.vietnameseTitle} (${palette.temperatureHint})`
    };
  }

  // Adjust for light mode if applicable
  if (isLightMode && base.id !== 'solar_auto') {
    return {
      ...base,
      cardBgGradient: `linear-gradient(135deg, rgba(${base.accentRgb}, 0.10) 0%, rgba(255, 255, 255, 0.88) 50%, rgba(249, 250, 251, 0.96) 100%)`,
      cardBorderColor: `rgba(${base.accentRgb}, 0.28)`
    };
  }

  return base;
}

export function applyMorningThemeCssVariables(themeConfig: MorningColorThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--haevy-morning-accent', themeConfig.accentColor);
  root.style.setProperty('--haevy-morning-accent-rgb', themeConfig.accentRgb);
  root.style.setProperty('--haevy-morning-glow', themeConfig.accentGlow);
  root.style.setProperty('--haevy-morning-border', themeConfig.cardBorderColor);
  root.style.setProperty('--haevy-morning-orb1', themeConfig.glowOrb1);
  root.style.setProperty('--haevy-morning-orb2', themeConfig.glowOrb2);
}

export function getStoredMoodSettings(): StoredMoodSettings {
  if (typeof window === 'undefined') {
    return {
      enabled: true,
      isAuto: true,
      manualTimePhaseOverride: null,
      manualWeatherOverride: null,
      intensity: 0.8,
      morningTheme: 'solar_auto'
    };
  }
  try {
    const raw = localStorage.getItem(MOOD_SETTINGS_KEY);
    let morningTheme: MorningColorThemeId = 'solar_auto';
    const rawTheme = localStorage.getItem(MORNING_THEME_STORAGE_KEY);
    if (rawTheme) {
      morningTheme = rawTheme as MorningColorThemeId;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? true,
        isAuto: parsed.isAuto ?? true,
        manualTimePhaseOverride: parsed.manualTimePhaseOverride || null,
        manualWeatherOverride: parsed.manualWeatherOverride || null,
        intensity: typeof parsed.intensity === 'number' ? parsed.intensity : 0.8,
        morningTheme: (parsed.morningTheme || morningTheme) as MorningColorThemeId
      };
    }
    return {
      enabled: true,
      isAuto: true,
      manualTimePhaseOverride: null,
      manualWeatherOverride: null,
      intensity: 0.8,
      morningTheme
    };
  } catch {
    // Ignore parse error
  }
  return {
    enabled: true,
    isAuto: true,
    manualTimePhaseOverride: null,
    manualWeatherOverride: null,
    intensity: 0.8,
    morningTheme: 'solar_auto'
  };
}

export function saveStoredMoodSettings(settings: StoredMoodSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOOD_SETTINGS_KEY, JSON.stringify(settings));
    if (settings.morningTheme) {
      localStorage.setItem(MORNING_THEME_STORAGE_KEY, settings.morningTheme);
    }
  } catch {
    // Ignore storage quota
  }
}
