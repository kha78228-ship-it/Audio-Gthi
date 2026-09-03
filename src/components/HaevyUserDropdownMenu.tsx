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
  GitFork
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EcosystemMode, ActiveTab } from '../types';

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
  const { user, isVip, audioPoints, accountId, logout, addAudioPoints } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [claimedGift, setClaimedGift] = useState(false);

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
    <div 
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-20px)] rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-3 sm:p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Profile Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/80 mb-2.5">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 text-white font-black flex items-center justify-center text-sm ring-1 ring-white/20 shadow-md shrink-0 overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Avatar'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            user.displayName?.charAt(0) || 'U'
          )}
        </div>
        <div className="truncate flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs text-white truncate">{user.displayName || 'Thành viên Haevy'}</span>
            {isVip && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/40 shrink-0">
                VIP
              </span>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">{user.email || accountId}</div>
        </div>
      </div>

      {/* Coin Balance Bar */}
      <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800/80 mb-2.5 flex items-center justify-between text-xs shadow-inner">
        <div className="flex items-center gap-1.5">
          <Coins size={15} className="text-amber-400 animate-bounce" />
          <span className="text-zinc-400 text-[11px] font-medium">Số dư ví:</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-amber-300 font-mono text-sm">
            {(audioPoints ?? 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-400/80 font-bold">Xu</span>
        </div>
      </div>

      {/* Main 3 Action Buttons: Haevy VIP, Haevy Support, Trang Cá Nhân */}
      <div className="space-y-1.5 mb-2.5">
        {/* 1. Haevy VIP Button */}
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

        {/* 2. Haevy Support Button */}
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

        {/* 3. Haevy Spiritual Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('spiritual');
            onSelectTab?.('spiritual');
          }}
          className="w-full p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-purple-500/40 hover:border-purple-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-purple-300 flex items-center justify-between">
              <span>Haevy Spiritual</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">Tarot & Tử Vi 🔮</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Bói Tarot 3D, Lá số Tử Vi 2026 & Chiêm tinh</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 3b. Haevy Family Tree Button */}
        <button
          onClick={() => {
            onClose();
            onSelectMode('family_tree');
            onSelectTab?.('family_tree' as any);
          }}
          className="w-full p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-amber-500/40 hover:border-amber-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-zinc-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <GitFork size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-black text-amber-300 flex items-center justify-between">
              <span>Haevy Family Tree</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">Gia Phả 👑</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate">Cây phả hệ tương tác, lịch giỗ Âm-Dương & con cháu</div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
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
  );
}
