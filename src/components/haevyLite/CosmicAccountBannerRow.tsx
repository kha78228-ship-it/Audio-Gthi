import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Crown, 
  ShieldCheck, 
  Lock, 
  Eye, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { CosmicGothicText } from './CosmicGothicText';
import { HoloTrooperHelmet } from './HoloTrooperHelmet';
import { CosmicProfileCardModal, CosmicProfileUserData } from './CosmicProfileCardModal';

interface CosmicAccountBannerRowProps {
  displayName: string;
  photoURL?: string | null;
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  statusText?: string;
  isVip?: boolean;
  isAuthorVerified?: boolean;
  isE2EEEnabled?: boolean;
  showTrooperHelmet?: boolean;
  onClickChat: () => void;
  userData?: CosmicProfileUserData;
  nameFont?: any;
  className?: string;
}

export function CosmicAccountBannerRow({
  displayName,
  photoURL,
  lastMessageText,
  lastMessageTime,
  unreadCount = 0,
  isOnline = true,
  statusText = 'Đang trực tuyến',
  isVip = false,
  isAuthorVerified = false,
  isE2EEEnabled = false,
  showTrooperHelmet = true,
  onClickChat,
  userData,
  nameFont,
  className = ''
}: CosmicAccountBannerRowProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  const profileData: CosmicProfileUserData = {
    displayName,
    photoURL,
    isVip,
    statusText,
    joinedDate: userData?.joinedDate || '17 thg 4, 2022',
    handle: userData?.handle || `@${displayName.toLowerCase().replace(/\s+/g, '_')}`,
    subtitle: userData?.subtitle || 'Khải HQ',
    ...userData
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-sky-400/40 hover:border-cyan-300 shadow-[0_4px_25px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_35px_rgba(56,189,248,0.5)] transition-all duration-300 cursor-pointer select-none active:scale-[0.99] ${className}`}
        style={{
          background: 'linear-gradient(135deg, #070b24 0%, #0d164d 28%, #182875 52%, #0c1a52 78%, #060a22 100%)'
        }}
        onClick={onClickChat}
      >
        {/* 1. Starfield Particles Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 10% 25%, #ffffff 100%, transparent),
              radial-gradient(1.2px 1.2px at 35% 18%, #7ee7fc 100%, transparent),
              radial-gradient(2px 2px at 65% 55%, #ffffff 100%, transparent),
              radial-gradient(1.5px 1.5px at 85% 20%, #bae6fd 100%, transparent),
              radial-gradient(1.2px 1.2px at 20% 75%, #e0f2fe 100%, transparent),
              radial-gradient(2px 2px at 92% 70%, #ffffff 100%, transparent),
              radial-gradient(1px 1px at 50% 85%, #7dd3fc 100%, transparent)
            `
          }}
        />

        {/* 2. Celestial Energy Light Wave (Screen blend) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-75 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse 65% 140% at 85% 30%, rgba(56, 189, 248, 0.4), transparent 75%), radial-gradient(ellipse 45% 100% at 25% 65%, rgba(168, 85, 247, 0.35), transparent 70%)'
          }}
        />

        {/* 3. Subtle Light Ray Flare across banner */}
        <div className="absolute -inset-x-20 -top-16 h-32 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent rotate-6 blur-lg pointer-events-none" />

        {/* 4. Top Glass Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent pointer-events-none" />

        {/* 5. Main Banner Content */}
        <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Block: Avatar with Helmet + Name & Details */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            
            {/* Avatar Container with Holo Helmet */}
            <div 
              className="relative shrink-0 cursor-pointer"
              title="Nhấn để xem Hồ Sơ Vũ Trụ chi tiết"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileModalOpen(true);
              }}
            >
              {/* Backlight Halo */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 opacity-80 blur-sm animate-pulse" />

              {/* Avatar Photo */}
              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-cyan-300/80 bg-slate-950 overflow-hidden shadow-xl flex items-center justify-center text-white font-bold text-base sm:text-lg">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-800 to-indigo-950 font-serif">
                    {initial}
                  </div>
                )}
              </div>

              {/* Presence Dot */}
              {isOnline ? (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399] z-20" title="Đang trực tuyến">
                  <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-950 z-20" title={statusText} />
              )}

              {/* The Hologram Trooper Helmet (Image 2 style) */}
              {showTrooperHelmet && (
                <div className="absolute -bottom-2 -left-2 z-30 pointer-events-none">
                  <HoloTrooperHelmet size="sm" showPedestal={true} />
                </div>
              )}
            </div>

            {/* Middle Info: Gothic Fraktur Name & Subtext */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Custom Font if equipped, otherwise iconic Gothic Text */}
                {nameFont && nameFont.id !== 'font_gothic_fraktur' ? (
                  <span 
                    className={`text-base sm:text-lg font-bold tracking-wide truncate ${nameFont.fontGlowClass || 'text-white'}`}
                    style={{ fontFamily: nameFont.fontFamilyName }}
                  >
                    {displayName}
                  </span>
                ) : (
                  <CosmicGothicText text={displayName} size="md" />
                )}

                {isVip && (
                  <span className="text-[9px] bg-amber-500/25 text-amber-300 font-extrabold px-1.5 py-0.2 rounded-full border border-amber-400/50 shrink-0 flex items-center gap-0.5 shadow-sm">
                    <Crown size={10} className="fill-amber-400" />
                    <span>VIP</span>
                  </span>
                )}

                {isAuthorVerified && (
                  <CheckCircle2 size={13} className="text-cyan-300 shrink-0 drop-shadow" />
                )}

                {isE2EEEnabled && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40 shrink-0 flex items-center gap-0.5">
                    <ShieldCheck size={10} />
                    <span>6 Lớp</span>
                  </span>
                )}
              </div>

              {/* Message preview snippet or status */}
              {lastMessageText ? (
                <p className="text-xs text-sky-200/80 truncate flex items-center gap-1 font-medium">
                  {lastMessageText.includes('mã hóa') ? (
                    <>
                      <Lock size={11} className="text-amber-300 shrink-0" />
                      <span className="text-amber-200/90 font-mono text-[11px]">[Tin nhắn mã hóa 6 lớp]</span>
                    </>
                  ) : (
                    lastMessageText
                  )}
                </p>
              ) : (
                <p className="text-[11px] text-sky-300/60 truncate italic">
                  Nhấn để vào phiên trò chuyện vũ trụ toàn màn hình...
                </p>
              )}
            </div>

          </div>

          {/* Right Action Block */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Profile View Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileModalOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-cyan-500/30 text-sky-300 hover:text-white border border-sky-400/30 hover:border-cyan-300 transition-all cursor-pointer shadow-sm"
              title="Xem Hồ Sơ Vũ Trụ (Ảnh 1)"
            >
              <Eye size={15} />
            </button>

            {/* Time / Unread Count */}
            {lastMessageTime && (
              <span className="text-[10px] text-sky-300/60 font-mono hidden sm:inline">
                {lastMessageTime}
              </span>
            )}

            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/50 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Profile Card Modal when clicking eye or avatar */}
      <CosmicProfileCardModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={profileData}
        onStartChat={onClickChat}
      />
    </>
  );
}
