import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  CloudRain,
  Sunrise,
  Cloud,
  CloudLightning,
  Eye,
  RefreshCw,
  X,
  Compass,
  Sliders,
  Check,
  Zap,
  MapPin,
  Thermometer,
  Palette
} from 'lucide-react';
import { useHaevyMood } from '../../context/HaevyMoodContext';
import { useTheme } from '../../context/ThemeContext';
import { HaevyTimePhase, HaevyWeatherCondition } from '../../types';
import { haptics } from '../../utils/haptics';

interface HaevyMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HaevyMoodModal({ isOpen, onClose }: HaevyMoodModalProps) {
  const {
    palette,
    weather,
    timePhase,
    isAuto,
    isEnabled,
    intensity,
    isWeatherLoading,
    toggleMoodEngine,
    toggleAutoMood,
    setManualPreset,
    resetToAuto,
    refreshWeather,
    setIntensity,
    morningTheme,
    setMorningTheme,
    morningThemeConfig,
    availableMorningThemes
  } = useHaevyMood();

  const { effectiveTheme, solarTimes, solarLocation } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHex = (hex: string) => {
    try {
      navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      haptics.selection();
      setTimeout(() => setCopiedColor(null), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const presetOptions: {
    id: string;
    title: string;
    subtitle: string;
    timePhase: HaevyTimePhase;
    weather: HaevyWeatherCondition;
    icon: any;
    accent: string;
  }[] = [
    {
      id: 'dawn',
      title: 'Bình Minh',
      subtitle: 'Rạng đông ửng hồng',
      timePhase: 'dawn',
      weather: 'clear',
      icon: Sunrise,
      accent: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    },
    {
      id: 'morning',
      title: 'Nắng Mai',
      subtitle: 'Trong trẻo, tươi mới',
      timePhase: 'morning',
      weather: 'clear',
      icon: Sun,
      accent: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      id: 'midday',
      title: 'Trưa Nắng',
      subtitle: 'Sắc nét & Tập trung',
      timePhase: 'midday',
      weather: 'clear',
      icon: Zap,
      accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
    },
    {
      id: 'golden_hour',
      title: 'Hoàng Hôn',
      subtitle: 'Hổ phách mật ong',
      timePhase: 'golden_hour',
      weather: 'clear',
      icon: Sunrise,
      accent: 'text-amber-500 border-amber-500/30 bg-amber-500/10'
    },
    {
      id: 'rain',
      title: 'Mưa Rơi',
      subtitle: 'Thanh tịnh, êm dịu',
      timePhase: 'dusk',
      weather: 'rain',
      icon: CloudRain,
      accent: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
    },
    {
      id: 'storm',
      title: 'Giông Bão',
      subtitle: 'Tím thẫm năng lượng',
      timePhase: 'dusk',
      weather: 'storm',
      icon: CloudLightning,
      accent: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    },
    {
      id: 'night',
      title: 'Đêm Sao',
      subtitle: 'Tĩnh mịch sâu lắng',
      timePhase: 'night',
      weather: 'clear',
      icon: Moon,
      accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
    },
    {
      id: 'fog',
      title: 'Sương Khói',
      subtitle: 'Mờ ảo thanh tao',
      timePhase: 'morning',
      weather: 'fog',
      icon: Cloud,
      accent: 'text-teal-400 border-teal-500/30 bg-teal-500/10'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-3xl bg-zinc-950/98 border border-zinc-800 shadow-2xl p-4 sm:p-6 text-zinc-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500"
              style={{
                backgroundColor: palette.accentColor,
                boxShadow: `0 0 20px ${palette.accentGlow}`
              }}
            >
              <Sparkles size={20} className="text-zinc-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Haevy Mood Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  AI Circadian
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Đổi bảng màu không gian tự động theo Chu kỳ thời gian & Thời tiết thực tế
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Atmosphere Spotlight Card */}
        <div 
          className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all duration-700"
          style={{
            borderColor: `${palette.accentColor}55`,
            background: `linear-gradient(135deg, ${palette.baseBg}dd, ${palette.surfaceBg}ee)`
          }}
        >
          {/* Ambient Corner Glow */}
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-700"
            style={{ backgroundColor: palette.accentColor }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: palette.accentColor }}
                />
                <span 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: palette.accentColor }}
                >
                  {palette.vietnameseTitle}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-medium">
                  {isAuto ? 'Tự động theo thời gian thực' : 'Chế độ thử nghiệm'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {palette.name}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-md leading-relaxed">
                {palette.description}
              </p>
            </div>

            {/* Weather & Location Live Tag */}
            <div className="flex flex-col items-end shrink-0 bg-zinc-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-white">
                  {weather ? `${weather.temperature}°C` : '26°C'}
                </span>
                <span className="text-xs text-zinc-300 font-medium">
                  {weather?.conditionLabel || 'Trời quang đãng'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                <MapPin size={11} className="text-emerald-400" />
                <span className="truncate max-w-[140px]">
                  {weather?.locationName || 'Địa phương'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    refreshWeather();
                  }}
                  disabled={isWeatherLoading}
                  className="ml-1 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Cập nhật thời tiết mới nhất"
                >
                  <RefreshCw size={11} className={isWeatherLoading ? 'animate-spin text-amber-400' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Color Palette Swatches Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 mr-1">Bảng màu CSS:</span>
            
            <button
              type="button"
              onClick={() => handleCopyHex(palette.accentColor)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] hover:border-zinc-700 transition-all cursor-pointer group"
              title="Sao chép mã màu Accent"
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.accentColor }} />
              <span className="font-mono text-zinc-300 group-hover:text-white">{palette.accentColor}</span>
              {copiedColor === palette.accentColor && <Check size={10} className="text-emerald-400 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleCopyHex(palette.baseBg)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] hover:border-zinc-700 transition-all cursor-pointer group"
              title="Sao chép mã màu Base Background"
            >
              <span className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: palette.baseBg }} />
              <span className="font-mono text-zinc-300 group-hover:text-white">{palette.baseBg}</span>
              {copiedColor === palette.baseBg && <Check size={10} className="text-emerald-400 ml-0.5" />}
            </button>

            <span className="text-[10px] text-zinc-500 ml-auto font-mono">
              Hiệu ứng: {palette.particlesType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Engine Modes & Quick Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Master Toggle */}
          <button
            type="button"
            onClick={() => {
              haptics.toggle();
              toggleMoodEngine();
            }}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              isEnabled
                ? 'bg-zinc-900/90 border-amber-500/50 text-white'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold block">Haevy Mood Engine</span>
                <span className="text-[11px] text-zinc-400">
                  {isEnabled ? 'Đang kích hoạt' : 'Đang tạm dừng'}
                </span>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-amber-400' : 'bg-zinc-800'}`}>
              <div className={`w-5 h-5 rounded-full bg-zinc-950 shadow-sm transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Auto Mode vs Manual Preset Toggle */}
          <button
            type="button"
            onClick={() => {
              haptics.toggle();
              if (!isAuto) {
                resetToAuto();
              } else {
                toggleAutoMood();
              }
            }}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              isAuto
                ? 'bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border-sky-500/50 text-white'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAuto ? 'bg-sky-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                <Compass size={16} />
              </div>
              <div>
                <span className="text-xs font-bold block">Tự động Chu kỳ & Thời tiết</span>
                <span className="text-[11px] text-zinc-400">
                  {isAuto ? 'Theo GPS & Giờ địa phương' : 'Thử nghiệm thủ công'}
                </span>
              </div>
            </div>
            {isAuto && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-400/20 text-sky-300 border border-sky-400/30">
                ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* Ambient Atmosphere Intensity Slider */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-200">Độ đậm nét ánh sáng không gian</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {Math.round(intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.25"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-medium">
            <span>Dịu nhẹ (25%)</span>
            <span>Cân bằng (65%)</span>
            <span>Sống động (100%)</span>
          </div>
        </div>

        {/* Atmosphere Mood Presets Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <span>Trải nghiệm nhanh các trạng thái tâm trạng</span>
              {!isAuto && (
                <span className="text-[10px] font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Đang xem mẫu
                </span>
              )}
            </span>
            {!isAuto && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  resetToAuto();
                }}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                Quay lại Tự động
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presetOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = !isAuto && timePhase === opt.timePhase && palette.weather === opt.weather;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    haptics.light();
                    setManualPreset(opt.timePhase, opt.weather);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${opt.accent}`}>
                      <Icon size={14} />
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block">
                      {opt.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 leading-tight block">
                      {opt.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Morning Dashboard Color Theme & Energy Level */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px]"
                style={{ backgroundColor: morningThemeConfig.badgeBg, color: morningThemeConfig.accentColor }}
              >
                <Palette size={12} />
              </div>
              <span className="text-xs font-bold text-zinc-200">
                Tông Màu Kính Mờ Buổi Sáng (Morning Mode Glassmorphism)
              </span>
            </div>
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{
                backgroundColor: morningThemeConfig.badgeBg,
                color: morningThemeConfig.badgeText,
                borderColor: morningThemeConfig.cardBorderColor
              }}
            >
              {morningThemeConfig.name} • {morningThemeConfig.energyLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableMorningThemes.map((theme) => {
              const isSelected = morningTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setMorningTheme(theme.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-zinc-900 shadow-md ring-1'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80'
                  }`}
                  style={{
                    borderColor: isSelected ? theme.accentColor : undefined,
                    boxShadow: isSelected ? `0 0 12px ${theme.accentGlow}` : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{theme.iconEmoji}</span>
                    {isSelected ? (
                      <span 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-black"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-700" style={{ backgroundColor: theme.accentColor }} />
                    )}
                  </div>
                  <div>
                    <span 
                      className="text-xs font-bold block truncate"
                      style={{ color: isSelected ? theme.accentColor : '#f4f4f5' }}
                    >
                      {theme.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {theme.energyLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            Hòa quyện mượt mà với cả <strong>Chế độ Sáng</strong> và <strong>Chế độ Tối</strong>.
          </span>
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
export default HaevyMoodModal;
