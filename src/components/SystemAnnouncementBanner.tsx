import React, { useState } from 'react';
import { 
  Radio, 
  X, 
  Pin, 
  Sparkles, 
  AlertTriangle, 
  Wrench, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Megaphone,
  Flame,
  Bell,
  Crown,
  Heart,
  Star,
  Maximize2,
  Volume2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemAnnouncement } from '../types';

export function SystemAnnouncementBanner() {
  const { systemAnnouncements, systemGlobalConfig, isVip, isAuthorVerified } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedMarquee, setDismissedMarquee] = useState(false);
  const [dismissedCard, setDismissedCard] = useState(false);
  const [selectedModalAnnouncement, setSelectedModalAnnouncement] = useState<SystemAnnouncement | null>(null);

  // Filter announcements for the current user's target audience
  const relevantAnnouncements = systemAnnouncements.filter((item) => {
    if (item.targetAudience === 'vip' && !isVip) return false;
    if (item.targetAudience === 'authors' && !isAuthorVerified) return false;
    return true;
  });

  // Separate into Marquee Tickers and Pinned/Static Announcements
  const marqueeAnnouncements = relevantAnnouncements.filter((item) => item.isMarquee);
  const staticAnnouncements = relevantAnnouncements.filter((item) => !item.isMarquee);

  const getCustomIcon = (iconName?: string, size = 16, className = '') => {
    switch (iconName) {
      case 'megaphone':
        return <Megaphone size={size} className={className} />;
      case 'flame':
        return <Flame size={size} className={className} />;
      case 'bell':
        return <Bell size={size} className={className} />;
      case 'crown':
        return <Crown size={size} className={className} />;
      case 'sparkles':
        return <Sparkles size={size} className={className} />;
      case 'alert':
        return <AlertTriangle size={size} className={className} />;
      case 'heart':
        return <Heart size={size} className={className} />;
      case 'star':
        return <Star size={size} className={className} />;
      case 'radio':
      default:
        return <Radio size={size} className={className} />;
    }
  };

  const getFontFamilyClass = (font?: string) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono tracking-tight';
      case 'display':
        return 'font-sans tracking-wide uppercase font-black';
      case 'handwriting':
        return 'font-serif italic';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getFontSizeClass = (size?: string) => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      case 'sm':
      default:
        return 'text-sm';
    }
  };

  const getFontWeightClass = (weight?: string) => {
    switch (weight) {
      case 'normal':
        return 'font-normal';
      case 'semibold':
        return 'font-semibold';
      case 'black':
        return 'font-black';
      case 'bold':
      default:
        return 'font-bold';
    }
  };

  const getMarqueeSpeedClass = (speed?: string) => {
    switch (speed) {
      case 'slow':
        return 'animate-marquee-slow';
      case 'fast':
        return 'animate-marquee-fast';
      case 'normal':
      default:
        return 'animate-marquee-normal';
    }
  };

  const getTypeCardStyle = (t: string) => {
    switch (t) {
      case 'urgent':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-rose-500/30',
          bg: 'bg-gradient-to-r from-rose-950/30 via-zinc-900/90 to-zinc-950/80',
          icon: <AlertTriangle size={15} className="text-rose-400" />
        };
      case 'event':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          border: 'border-purple-500/30',
          bg: 'bg-gradient-to-r from-purple-950/30 via-zinc-900/90 to-zinc-950/80',
          icon: <Sparkles size={15} className="text-purple-400" />
        };
      case 'maintenance':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          border: 'border-amber-500/30',
          bg: 'bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-zinc-950/80',
          icon: <Wrench size={15} className="text-amber-400" />
        };
      default:
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-cyan-500/30',
          bg: 'bg-gradient-to-r from-cyan-950/30 via-zinc-900/90 to-zinc-950/80',
          icon: <Info size={15} className="text-cyan-400" />
        };
    }
  };

  return (
    <div className="w-full space-y-3 mb-4">
      {/* 1. High Priority Maintenance Banner */}
      {systemGlobalConfig?.maintenanceMode && (
        <div className="w-full bg-amber-950/50 border border-amber-500/50 rounded-2xl px-4 py-3 text-amber-200 flex items-center justify-between shadow-lg shadow-amber-950/30 backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Wrench size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Chế Độ Bảo Trì & Nâng Cấp</span>
                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-bold rounded">Server Maintenance</span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                {systemGlobalConfig.maintenanceMessage || 'Hệ thống đang được bảo trì nâng cấp đường truyền. Một số tính năng có thể chậm hơn thường lệ.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC SCROLLING MARQUEE TICKER BOARD (BẢNG CHẠY CHỮ TÙY BIẾN) */}
      {!dismissedMarquee && marqueeAnnouncements.length > 0 && (
        <div className="w-full space-y-2">
          {marqueeAnnouncements.map((item) => {
            const fontClass = getFontFamilyClass(item.fontFamily);
            const sizeClass = getFontSizeClass(item.fontSize);
            const weightClass = getFontWeightClass(item.fontWeight);
            const speedClass = getMarqueeSpeedClass(item.marqueeSpeed);

            const customStyle: React.CSSProperties = {
              color: item.textColor || '#fbbf24',
              backgroundColor: item.bgColor || 'rgba(24, 24, 27, 0.95)',
              borderColor: item.borderColor || (item.textColor ? `${item.textColor}40` : '#f59e0b50'),
            };

            const contentText = `${item.title ? `【${item.title.toUpperCase()}】: ` : ''}${item.content}`;

            return (
              <div
                key={item.id}
                style={customStyle}
                className={`w-full relative border rounded-2xl p-2 sm:px-4 sm:py-2.5 overflow-hidden shadow-xl backdrop-blur-md flex items-center gap-3 transition-all group ${
                  item.isBlinking ? 'ring-1 ring-amber-400/40' : ''
                }`}
                title="Bảng thông báo chạy chữ - Rê chuột để tạm dừng"
              >
                {/* Left Fixed Badge / Icon */}
                <div className="flex items-center gap-2 shrink-0 z-10 pr-2 border-r border-white/15">
                  <div className={`p-1.5 rounded-xl bg-black/40 border border-white/10 ${item.isBlinking ? 'animate-bounce' : ''}`}>
                    {getCustomIcon(item.customIcon || 'megaphone', 15, 'text-current')}
                  </div>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-current border border-white/10">
                    Bản Tin
                  </span>
                </div>

                {/* Center Scrolling Text Loop Container */}
                <div className="flex-1 overflow-hidden relative cursor-pointer" onClick={() => setSelectedModalAnnouncement(item)}>
                  <div className={speedClass}>
                    <div className={`flex items-center gap-12 pr-12 whitespace-nowrap ${fontClass} ${sizeClass} ${weightClass}`}>
                      <span>{contentText}</span>
                      <span className="opacity-50">✦</span>
                      <span>{contentText}</span>
                      <span className="opacity-50">✦</span>
                    </div>
                    <div className={`flex items-center gap-12 pr-12 whitespace-nowrap ${fontClass} ${sizeClass} ${weightClass}`}>
                      <span>{contentText}</span>
                      <span className="opacity-50">✦</span>
                      <span>{contentText}</span>
                      <span className="opacity-50">✦</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-1 shrink-0 z-10 pl-2 border-l border-white/15">
                  <button
                    onClick={() => setSelectedModalAnnouncement(item)}
                    className="p-1 rounded-lg bg-black/30 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Xem chi tiết bản tin"
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    onClick={() => setDismissedMarquee(true)}
                    className="p-1 rounded-lg bg-black/30 hover:bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Đóng bảng chạy chữ"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. STATIC / PINNED ANNOUNCEMENT CARDS */}
      {!dismissedCard && staticAnnouncements.length > 0 && (
        (() => {
          const current = staticAnnouncements[currentIndex] || staticAnnouncements[0];
          const style = getTypeCardStyle(current.type);

          const fontClass = getFontFamilyClass(current.fontFamily);
          const sizeClass = getFontSizeClass(current.fontSize);
          const weightClass = getFontWeightClass(current.fontWeight);

          const customStyle: React.CSSProperties = {
            color: current.textColor || undefined,
            backgroundColor: current.bgColor || undefined,
            borderColor: current.borderColor || undefined,
          };

          return (
            <div 
              style={customStyle}
              className={`w-full border rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in duration-200 ${
                !current.borderColor ? style.border : ''
              } ${!current.bgColor ? style.bg : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center shrink-0">
                    {current.customIcon ? getCustomIcon(current.customIcon, 15) : style.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {current.isPinned && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold flex items-center gap-0.5">
                          <Pin size={10} /> GHIM
                        </span>
                      )}
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${style.badge}`}>
                        {current.type.toUpperCase()}
                      </span>
                      <h5 className={`text-xs font-bold truncate max-w-md ${fontClass} ${weightClass}`}>
                        {current.title}
                      </h5>
                    </div>
                    <p className={`text-xs opacity-90 truncate max-w-xl mt-0.5 ${fontClass} ${sizeClass}`}>
                      {current.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {staticAnnouncements.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : staticAnnouncements.length - 1))}
                        className="p-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Bản tin trước"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] font-mono text-zinc-400 px-1">
                        {currentIndex + 1}/{staticAnnouncements.length}
                      </span>
                      <button
                        onClick={() => setCurrentIndex((prev) => (prev < staticAnnouncements.length - 1 ? prev + 1 : 0))}
                        className="p-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Bản tin kế tiếp"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedModalAnnouncement(current)}
                    className="p-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <Maximize2 size={14} />
                  </button>

                  <button
                    onClick={() => setDismissedCard(true)}
                    className="p-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Ẩn thông báo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* MODAL: VIEW DETAILED ANNOUNCEMENT */}
      {selectedModalAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {getCustomIcon(selectedModalAnnouncement.customIcon || 'radio', 18)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Chi Tiết Bản Tin Hệ Thống</h3>
                  <p className="text-xs text-zinc-400">
                    Phát hành bởi {selectedModalAnnouncement.createdByName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModalAnnouncement(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {selectedModalAnnouncement.type}
                </span>
                {selectedModalAnnouncement.isMarquee && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Bảng Chạy Chữ (Marquee)
                  </span>
                )}
                {selectedModalAnnouncement.isPinned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Ghim Đầu Trang
                  </span>
                )}
              </div>

              <h4 className="text-lg font-black text-white leading-snug">
                {selectedModalAnnouncement.title}
              </h4>

              <div 
                style={{
                  color: selectedModalAnnouncement.textColor || '#e4e4e7',
                }}
                className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm leading-relaxed whitespace-pre-line ${getFontFamilyClass(selectedModalAnnouncement.fontFamily)} ${getFontWeightClass(selectedModalAnnouncement.fontWeight)}`}
              >
                {selectedModalAnnouncement.content}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedModalAnnouncement(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
