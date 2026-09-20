import React, { useState, useEffect, useCallback } from 'react';
import { motion, type Variants } from 'motion/react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  CloudFog, 
  Moon, 
  CloudMoon, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  RefreshCw, 
  Sparkles,
  ChevronDown,
  Compass,
  Check
} from 'lucide-react';
import { 
  WeatherData, 
  WeatherCity, 
  POPULAR_CITIES, 
  fetchWeatherData 
} from '../../services/weatherService';
import { useHaevyMood } from '../../context/HaevyMoodContext';

interface HaevyMorningWeatherWidgetProps {
  cardVariants?: Variants;
  compact?: boolean;
}

export function HaevyMorningWeatherWidget({ 
  cardVariants,
  compact = false 
}: HaevyMorningWeatherWidgetProps) {
  const { morningThemeConfig } = useHaevyMood();
  const [selectedCity, setSelectedCity] = useState<WeatherCity>(POPULAR_CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);

  const loadWeather = useCallback(async (city: WeatherCity) => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(city);
      setWeather(data);
    } catch (err) {
      console.error('Error loading weather:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
    // Auto refresh every 15 minutes
    const interval = setInterval(() => {
      loadWeather(selectedCity);
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedCity, loadWeather]);

  // Render weather icon based on code and day/night
  const renderWeatherIcon = (code: number, isDay: boolean, size = 28, className = '') => {
    if (code === 0 || code === 1) {
      return isDay ? (
        <Sun size={size} className={`text-amber-400 ${className}`} />
      ) : (
        <Moon size={size} className={`text-indigo-300 ${className}`} />
      );
    }
    if (code === 2) {
      return isDay ? (
        <CloudSun size={size} className={`text-amber-300 ${className}`} />
      ) : (
        <CloudMoon size={size} className={`text-indigo-300 ${className}`} />
      );
    }
    if (code === 3) {
      return <Cloud size={size} className={`text-zinc-400 ${className}`} />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog size={size} className={`text-teal-300 ${className}`} />;
    }
    if (code >= 51 && code <= 55) {
      return <CloudDrizzle size={size} className={`text-cyan-400 ${className}`} />;
    }
    if (code >= 61 && code <= 82) {
      return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    }
    if (code >= 95) {
      return <CloudLightning size={size} className={`text-yellow-400 ${className}`} />;
    }
    return <CloudSun size={size} className={`text-amber-300 ${className}`} />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md text-xs">
        {weather ? (
          <>
            {renderWeatherIcon(weather.weatherCode, weather.isDay, 16)}
            <span className="font-bold text-white">{weather.temperature}°C</span>
            <span className="text-zinc-400 hidden sm:inline">{weather.conditionText}</span>
            <span className="text-zinc-500 font-mono text-[11px]">• {weather.city}</span>
          </>
        ) : (
          <span className="text-zinc-400 flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin text-amber-400" />
            Đang tải thời tiết...
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      className="relative rounded-3xl border p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-500 backdrop-blur-xl"
      style={{
        background: morningThemeConfig.cardBgGradient,
        borderColor: morningThemeConfig.cardBorderColor,
        boxShadow: `0 20px 35px -10px rgba(0,0,0,0.5), 0 0 20px ${morningThemeConfig.accentGlow}`
      }}
    >
      {/* Subtle background glow */}
      <div 
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: morningThemeConfig.glowOrb1 }}
      />
      <div 
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: morningThemeConfig.glowOrb2 }}
      />

      <div>
        {/* Widget Header: Title + City Selector & Refresh */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sun size={17} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Thời Tiết Buổi Sáng</span>
                {weather?.isLive ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Realtime
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Chỉ số thời gian thực & dự báo theo khung giờ
              </p>
            </div>
          </div>

          {/* City Selector Dropdown & Refresh */}
          <div className="relative flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-all"
                title="Chọn thành phố"
              >
                <MapPin size={12} className="text-amber-400 shrink-0" />
                <span className="max-w-[110px] truncate">{selectedCity.name}</span>
                <ChevronDown size={12} className="text-zinc-400" />
              </button>

              {isCityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCityDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 z-50 backdrop-blur-xl">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 py-1">
                      Khu vực theo dõi
                    </div>
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedCity.id === city.id
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{city.name}</span>
                        {selectedCity.id === city.id && <Check size={12} className="text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => loadWeather(selectedCity)}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
              title="Làm mới thời tiết"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>
        </div>

        {/* Main Temperature & Conditions Display */}
        {weather ? (
          <div>
            {/* Top time-relative greeting badge */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                <span>{weather.timeGreeting}</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Cập nhật: {weather.updatedAt}
              </span>
            </div>

            {/* Main Temp Row */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 mb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 shadow-inner">
                  {renderWeatherIcon(weather.weatherCode, weather.isDay, 38)}
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {weather.temperature}°
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">C</span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                    {weather.conditionText}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Cảm giác như <span className="text-zinc-300 font-medium">{weather.apparentTemperature}°C</span>
                  </div>
                </div>
              </div>

              {/* 3 mini key metrics */}
              <div className="grid grid-cols-2 gap-2 text-right">
                <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-left">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Droplets size={11} className="text-cyan-400" />
                    <span>Độ ẩm</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{weather.humidity}%</div>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-left">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Wind size={11} className="text-teal-400" />
                    <span>Gió</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{weather.windSpeed} km/h</div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast relative to current time */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Dự Báo Theo Giờ Trong Ngày
                </span>
                <span className="text-[10px] text-zinc-500">Kế hoạch các giờ tới</span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 overflow-x-auto pb-1">
                {weather.hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all ${
                      h.isCurrent
                        ? 'bg-amber-500/20 border border-amber-500/40 text-white shadow-sm'
                        : 'bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${h.isCurrent ? 'font-bold text-amber-300' : 'text-zinc-400'}`}>
                      {h.timeLabel}
                    </span>
                    <div className="my-1.5">
                      {renderWeatherIcon(h.weatherCode, h.hour >= 6 && h.hour < 18, 16)}
                    </div>
                    <span className="text-xs font-bold">{h.temperature}°</span>
                    {h.rainChance > 15 ? (
                      <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5">
                        <Droplets size={8} />
                        {h.rainChance}%
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                        --
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Morning Recommendation */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
              <Sparkles size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-amber-300 font-semibold mr-1">Lời khuyên sáng nay:</strong>
                {weather.morningAdvice}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500">
            <RefreshCw size={24} className="animate-spin text-amber-400 mb-2" />
            <p className="text-xs">Đang lấy dữ liệu thời tiết theo thời gian thực...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
