import React, { useRef, useEffect, useState } from 'react';
import {
  Crown,
  LifeBuoy,
  User as UserIcon,
  Coins,
  Gift,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Orbit,
  Copy,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EcosystemMode, ActiveTab } from '../types';
import { ThemeSwitcher } from './common/ThemeSwitcher';

interface HaevyUserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onClaimGift?: () => void;
}

export function HaevyUserDropdownMenu({
  isOpen,
  onClose,
  onSelectMode,
  onSelectTab,
  onClaimGift
}: HaevyUserDropdownMenuProps) {
  const { 
    user, 
    isVip, 
    audioPoints, 
    haevyLiteCoins = 0, 
    accountId, 
    logout, 
    addAudioPoints,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    userProfile
  } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [claimedGift, setClaimedGift] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Synchronized Profile Display Information
  const effectiveDisplayName = userProfile?.displayName || authDisplayName || user?.displayName || user?.email?.split('@')[0] || 'Thành viên Haevy';
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL || null;

  // Reliable, permanent Account ID representation
  const effectiveAccountId = (accountId && accountId !== 'GUEST-000000') 
    ? accountId 
    : (user?.uid ? `AH-${user.uid.slice(0, 6).toUpperCase()}` : 'AH-MEMBER');

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveAccountId) {
      navigator.clipboard.writeText(effectiveAccountId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Broadcast menu state to hide bottom taskbars across modes
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: true }));
      if (menuRef.current) {
        menuRef.current.scrollTop = 0;
      }
    } else {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: false }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: false }));
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleClaim = async () => {
    if (onClaimGift) {
      onClaimGift();
    } else {
      if (!claimedGift) {
        await addAudioPoints(500, 'Quà tặng Đại Lễ Hệ Sinh Thái Haevy', 'bonus');
        setClaimedGift(true);
      }
    }
  };

  return (
    <>
      {/* Completely transparent overlay for outside clicks without dimming or blurring the background */}
      <div 
        className="fixed inset-0 z-[80] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      <div 
        ref={menuRef}
        className="absolute right-0 top-full mt-2.5 w-[calc(100vw-20px)] sm:w-84 max-w-[340px] max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 p-3 sm:p-3.5 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pb-4"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Sticky User Profile Header: Avatar & ID Tài Khoản ALWAYS fully visible & never covered by any action */}
      <div className="sticky -top-3 sm:-top-3.5 -mt-3 sm:-mt-3.5 -mx-3 sm:-mx-3.5 p-3 sm:p-3.5 bg-zinc-950/98 backdrop-blur-2xl border-b border-zinc-800/80 mb-3 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {/* Prominent Unobstructed Avatar */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 text-white font-black flex items-center justify-center text-sm ring-2 ring-white/20 shadow-md overflow-hidden">
              {effectivePhotoURL ? (
                <img 
                  src={effectivePhotoURL} 
                  alt={effectiveDisplayName || 'Avatar'} 
                  referrerPolicy="no-referrer" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                effectiveDisplayName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            {isVip && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-md ring-1 ring-zinc-950" title="VIP Member">
                <Crown size={9} fill="currentColor" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" title="Đang trực tuyến" />
          </div>

          {/* User Name, VIP Badge & Email */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-white truncate">
                {effectiveDisplayName}
              </span>
              {isVip ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/40 shrink-0">
                  VIP
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] font-semibold shrink-0">
                  MEMBER
                </span>
              )}
            </div>
            {user.email && (
              <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={user.email}>
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Account ID Box with 1-click copy - ALWAYS VISIBLE, NEVER COVERED */}
        <div className="mt-2.5 flex items-center justify-between gap-2 bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-all">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0">ID Tài Khoản:</span>
            <span className="font-mono font-black text-xs text-amber-300 tracking-wider select-all truncate">
              {effectiveAccountId}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-amber-300 bg-zinc-800/80 hover:bg-zinc-700/80 px-2 py-1 rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
            title="Sao chép ID tài khoản"
          >
            {copiedId ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coin & Lite Coin Balance Bar */}
      <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800/80 mb-2.5 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-amber-400" />
            <span className="text-zinc-400 text-[11px] font-medium">Điểm Audio:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-amber-300 font-mono text-xs">
              {(audioPoints ?? 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold">Điểm</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onSelectMode('haevy_lite');
            onSelectTab?.('haevy_lite');
          }}
          className="w-full flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/70 hover:bg-purple-950/30 px-1 py-1 -mx-1 rounded-lg transition-colors cursor-pointer group"
          title="Bấm để vào Hub Xu Haevy Lite & Mở Khóa Combo"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-zinc-400 text-[11px] font-medium group-hover:text-purple-300 transition-colors">Xu Haevy Lite:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-purple-300 font-mono text-xs group-hover:underline">
              {(haevyLiteCoins ?? 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-purple-400/80 font-bold">Xu ↗</span>
          </div>
        </button>
      </div>

      {/* Main Action Buttons in User Task Panel */}
      <div className="space-y-1.5 mb-2.5">
        {/* 1. Dedicated Xu Haevy Lite & Combo Hoạt Ảnh Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('haevy_lite');
            onSelectTab?.('haevy_lite');
          }}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-950/50 via-zinc-900 to-zinc-900 hover:from-purple-900/70 hover:to-zinc-800/90 border border-purple-500/50 hover:border-purple-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Orbit size={16} className="animate-spin-slow" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-purple-300 flex items-center justify-between">
              <span>Xu Lite & Combo Hoạt Ảnh</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-200 border border-purple-400/40">Vũ Trụ 🌌</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Đổi combo vũ trụ, avatar động & xem QC 30s</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 1.5 Haevy Edu Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('edu');
            onSelectTab?.('edu' as any);
          }}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 hover:from-emerald-900/60 hover:to-zinc-800/90 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-emerald-300 flex items-center justify-between">
              <span>Haevy Edu</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">Lab & AI 🎓</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Phòng lab ảo STEM, AI Gia Sư & Lộ trình</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 2. Haevy VIP Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('vip');
            onSelectTab?.('vip');
          }}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 hover:from-amber-900/60 hover:to-zinc-800/90 border border-amber-500/40 hover:border-amber-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Crown size={16} fill="currentColor" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-amber-300 flex items-center justify-between">
              <span>Haevy VIP</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">Hi-Fi Lossless</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Nâng cấp VIP, Âm thanh Lossless & Nạp xu</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 3. Haevy Support Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('support');
            onSelectTab?.('support' as any);
          }}
          className="w-full p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <LifeBuoy size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-emerald-300 flex items-center justify-between">
              <span>Haevy Support</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">24/7</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Trung tâm hỗ trợ, Gửi Ticket & FAQ</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 4. Personal Profile Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('profile');
            onSelectTab?.('profile');
          }}
          className="w-full p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-blue-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <UserIcon size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-zinc-100 group-hover:text-blue-300 transition-colors flex items-center justify-between">
              <span>Hồ Sơ Cá Nhân</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Haevy ID</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Xem và cài đặt tài khoản, bảo mật</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Theme Switcher Row (Sáng / Tối / Tự động theo điện thoại) */}
      <div className="mb-2 px-1 border-t border-b border-zinc-800/80 py-1">
        <ThemeSwitcher variant="menu-item" />
      </div>

      {/* Gift Claim Button */}
      <button
        onClick={handleClaim}
        disabled={claimedGift}
        className={`w-full py-2 px-3 rounded-xl font-bold text-xs mb-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
          claimedGift 
            ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 active:scale-98'
        }`}
      >
        {claimedGift ? (
          <>
            <Check size={13} className="text-emerald-400" />
            <span>Đã nhận 500 Xu Đại Lễ!</span>
          </>
        ) : (
          <>
            <Gift size={13} className="text-amber-400 animate-bounce" />
            <span>Nhận Quà 500 Xu Đại Lễ</span>
          </>
        )}
      </button>

      {/* Logout Button */}
      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full py-2 rounded-xl bg-zinc-900/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800/60 hover:border-rose-800/40 active:scale-98"
      >
        <LogOut size={13} />
        <span>Đăng xuất tài khoản</span>
      </button>
    </div>
    </>
  );
}
