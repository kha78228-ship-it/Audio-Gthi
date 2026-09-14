import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Smartphone, Sunrise, Check, Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { formatSolarTime } from '../../utils/solarCalculator';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'segmented' | 'cards' | 'menu-item';
  className?: string;
  onThemeChange?: (mode: ThemeMode) => void;
}

export function ThemeSwitcher({
  variant = 'compact',
  className = '',
  onThemeChange
}: ThemeSwitcherProps) {
  const {
    themeMode,
    effectiveTheme,
    systemDetectedTheme,
    solarDetectedTheme,
    solarTimes,
    solarLocation,
    solarLoading,
    requestSolarLocation,
    setThemeMode
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsOpen(false);
    if (onThemeChange) onThemeChange(mode);
  };

  const sunriseFormatted = formatSolarTime(solarTimes?.sunrise);
  const sunsetFormatted = formatSolarTime(solarTimes?.sunset);
  const isSolarDay = solarTimes ? solarTimes.isDaytime : solarDetectedTheme === 'light';

  // Option definitions
  const options: {
    id: ThemeMode;
    label: string;
    description: string;
    sublabel: string;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'solar',
      label: 'Theo Mặt trời địa phương',
      sublabel: `Mặt trời: ${isSolarDay ? 'Ban ngày ☀️' : 'Ban đêm 🌙'} (Mọc ${sunriseFormatted} • Lặn ${sunsetFormatted})`,
      description: 'Tự động đổi sáng/tối chuẩn xác theo giờ Bình minh & Hoàng hôn tại vị trí địa lý của bạn',
      icon: Sunrise,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      id: 'system',
      label: 'Theo hệ thống điện thoại',
      sublabel: `Tự động: ${systemDetectedTheme === 'dark' ? 'Đêm 🌙' : 'Ngày ☀️'}`,
      description: 'Giao diện tự động thay đổi theo chế độ màn hình ban ngày / ban đêm của điện thoại',
      icon: Smartphone,
      color: 'text-sky-400 bg-sky-500/15 border-sky-500/30'
    },
    {
      id: 'light',
      label: 'Chế độ Ban ngày',
      sublabel: 'Giao diện sáng hiện đại',
      description: 'Tông màu sáng tinh tế, dễ đọc và dịu mắt dưới ánh sáng ban ngày',
      icon: Sun,
      color: 'text-amber-500 bg-amber-500/15 border-amber-400/40'
    },
    {
      id: 'dark',
      label: 'Chế độ Ban đêm',
      sublabel: 'Giao diện tối không gian',
      description: 'Tông màu tối sang trọng, giảm chói và tiết kiệm pin vào ban đêm',
      icon: Moon,
      color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
    }
  ];

  // 1. CARDS VARIANT (FOR USER PROFILE & SETTINGS)
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = themeMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer active:scale-98 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${opt.color}`}>
                  <Icon size={18} />
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-100">{opt.label}</span>
                </div>
                <p className="text-[11px] text-amber-400 font-medium mt-0.5">{opt.sublabel}</p>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. SEGMENTED CONTROL VARIANT
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex flex-wrap p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = themeMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
              title={opt.description}
            >
              <Icon size={14} />
              <span>
                {opt.id === 'solar'
                  ? 'Mặt trời'
                  : opt.id === 'system'
                  ? 'Theo máy'
                  : opt.id === 'light'
                  ? 'Ban ngày'
                  : 'Ban đêm'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. MENU ITEM VARIANT (FOR DROPDOWN MENUS)
  if (variant === 'menu-item') {
    return (
      <div className={`w-full py-1.5 ${className}`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            {themeMode === 'solar' ? (
              <Sunrise size={15} className="text-amber-400" />
            ) : themeMode === 'system' ? (
              <Smartphone size={15} className="text-sky-400" />
            ) : themeMode === 'light' ? (
              <Sun size={15} className="text-amber-500" />
            ) : (
              <Moon size={15} className="text-indigo-400" />
            )}
            <span className="text-xs font-bold text-zinc-200">Giao diện hiển thị</span>
          </div>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            {themeMode === 'solar'
              ? `Mặt trời (${isSolarDay ? 'Ngày ☀️' : 'Đêm 🌙'})`
              : themeMode === 'system'
              ? `Theo máy (${systemDetectedTheme === 'dark' ? 'Đêm' : 'Ngày'})`
              : themeMode === 'light'
              ? 'Ban ngày ☀️'
              : 'Ban đêm 🌙'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/90">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
                title={opt.description}
              >
                <Icon size={14} className="mb-1" />
                <span className="text-[9px] leading-tight font-medium">
                  {opt.id === 'solar'
                    ? 'Mặt trời'
                    : opt.id === 'system'
                    ? 'Theo máy'
                    : opt.id === 'light'
                    ? 'Ban ngày'
                    : 'Ban đêm'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. COMPACT BUTTON WITH POPUP (DEFAULT FOR NAVBAR & HEADERS)
  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        id="navbar-theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 group shrink-0"
        title={`Giao diện: ${
          themeMode === 'solar'
            ? `Tự động theo Mặt trời (Hiện tại: ${effectiveTheme === 'dark' ? 'Ban đêm 🌙' : 'Ban ngày ☀️'})`
            : themeMode === 'system'
            ? `Tự động theo điện thoại (Hiện tại: ${effectiveTheme === 'dark' ? 'Ban đêm 🌙' : 'Ban ngày ☀️'})`
            : themeMode === 'light'
            ? 'Ban ngày ☀️'
            : 'Ban đêm 🌙'
        }`}
        aria-label="Tùy chỉnh giao diện ngày / đêm"
      >
        {themeMode === 'solar' ? (
          <div className="relative flex items-center justify-center">
            <Sunrise size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-1 -right-1 text-[7px] leading-none">
              {effectiveTheme === 'dark' ? '🌙' : '☀️'}
            </span>
          </div>
        ) : themeMode === 'system' ? (
          <div className="relative flex items-center justify-center">
            <Smartphone size={13} className="text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-1 -right-1 text-[7px] leading-none">
              {effectiveTheme === 'dark' ? '🌙' : '☀️'}
            </span>
          </div>
        ) : themeMode === 'light' ? (
          <Sun size={13} className="text-amber-400 group-hover:scale-110 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon size={13} className="text-indigo-400 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Theme Selection Dropdown Popup */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[calc(100vw-28px)] max-w-[300px] p-2.5 rounded-2xl bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 shadow-2xl z-[120] animate-in fade-in slide-in-from-top-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-100">Giao diện Ngày & Đêm</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {effectiveTheme === 'dark' ? '🌙 Tối' : '☀️ Sáng'}
            </span>
          </div>

          <div className="space-y-1.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = themeMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-sm'
                      : 'hover:bg-zinc-900/90 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${opt.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-amber-400 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      {opt.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Solar Coordinates & GPS Info Bar */}
          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 px-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <div className="flex items-center gap-1">
                <MapPin size={11} className={solarLocation?.source === 'gps' ? 'text-emerald-400' : 'text-amber-400'} />
                <span>
                  {solarLocation?.source === 'gps'
                    ? `GPS: ${solarLocation.latitude.toFixed(2)}°, ${solarLocation.longitude.toFixed(2)}°`
                    : solarLocation?.source === 'cached'
                    ? `GPS đã lưu: ${solarLocation.latitude.toFixed(2)}°`
                    : 'Ước tính theo Múi giờ'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => requestSolarLocation()}
                disabled={solarLoading}
                className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
                title="Cập nhật lại tọa độ GPS chính xác"
              >
                <RefreshCw size={10} className={solarLoading ? 'animate-spin' : ''} />
                <span>{solarLoading ? 'Đang dò...' : 'Định vị GPS'}</span>
              </button>
            </div>
            <p className="text-[9px] text-zinc-500 mt-1 leading-tight">
              💡 Chế độ <strong>Theo Mặt Trời</strong> tự động chuyển giao diện theo chu kỳ Bình minh ({sunriseFormatted}) và Hoàng hôn ({sunsetFormatted}) tại địa phương.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export default ThemeSwitcher;
