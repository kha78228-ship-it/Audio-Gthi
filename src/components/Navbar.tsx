import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Home, 
  Library, 
  Disc3, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Check,
  Crown,
  Coins,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Copy,
  Users,
  Heart,
  Mic,
  Radio,
  Wallet,
  DollarSign,
  Layers,
  Compass,
  Headphones,
  Sliders,
  Sparkle,
  Gamepad2,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, EcosystemMode } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HaevyEcosystemDrawer } from './HaevyEcosystemDrawer';

interface NavbarProps {
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenEcosystemDrawer?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onOpenAnonPass?: () => void;
  onOpenStudioAudio?: (tab?: 'tts' | 'publish' | 'ekyc' | 'my-tracks') => void;
}

export function Navbar({ 
  currentMode,
  onSelectMode,
  onOpenEcosystemDrawer,
  activeTab, 
  onSelectTab, 
  onOpenAuth,
  onOpenAnonPass,
  onOpenStudioAudio
}: NavbarProps) {
  const { 
    user, 
    loading, 
    accountId, 
    isAdmin, 
    audioPoints, 
    isVip, 
    vipTier, 
    isAuthorVerified, 
    logout 
  } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEcosystemDrawerOpen, setIsEcosystemDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for unread messages & requests count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubConv = onSnapshot(qConv, (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.unreadCount && data.unreadCount[user.uid]) {
          total += data.unreadCount[user.uid] || 0;
        }
      });
      setUnreadCount(total);
    }, () => {});

    return () => unsubConv();
  }, [user]);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Dedicated sub-navigation tabs for each of the 6 standalone ecosystem modes
  const getModeNavItems = () => {
    switch (currentMode) {
      case 'audio':
        return [
          { id: 'home' as ActiveTab, label: 'Trang Chủ', icon: Compass },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
          { id: 'community' as ActiveTab, label: 'Thảo Luận Cộng Đồng', icon: Users }
        ];
      case 'messages':
        return [
          { 
            id: 'messages' as ActiveTab, 
            label: 'Hộp Thư & Bạn Bè', 
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined 
          },
          { id: 'community' as ActiveTab, label: 'Giao Lưu Âm Nhạc', icon: Users }
        ];
      case 'couple':
        return [
          { id: 'couple' as ActiveTab, label: 'Không Gian Cặp Đôi 💕', icon: Heart },
          { id: 'library' as ActiveTab, label: 'Kho Nhạc Đôi', icon: Disc3 }
        ];
      case 'finance':
        return [
          { id: 'finance' as ActiveTab, label: 'Sổ Thu Chi 💰', icon: Wallet },
          { id: 'topup' as ActiveTab, label: 'Nạp Điểm & VIP', icon: Coins }
        ];
      case 'admin':
        return [
          { id: 'admin' as ActiveTab, label: 'Bảng Quản Trị Server 🛡️', icon: ShieldCheck },
          { id: 'library' as ActiveTab, label: 'Kho Bài Hát', icon: Library }
        ];
      case 'studio':
        return [
          { id: 'studio' as ActiveTab, label: 'Haevy Studio 🎙️', icon: Sparkles }
        ];
      case 'games':
        return [
          { id: 'games' as ActiveTab, label: 'Đấu Trường Game 🎮', icon: Gamepad2 }
        ];
      default:
        return [
          { id: 'home' as ActiveTab, label: 'Trang Chủ', icon: Home },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
          { id: 'community' as ActiveTab, label: 'Cộng Đồng', icon: Users }
        ];
    }
  };

  const currentNavItems = getModeNavItems();

  const getModeBadgeInfo = () => {
    switch (currentMode) {
      case 'audio':
        return { name: 'Haevy Audio', icon: Headphones, tag: 'Audio', color: 'from-amber-400 to-yellow-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'messages':
        return { name: 'Haevy Message', icon: MessageSquare, tag: 'Chat', color: 'from-sky-400 to-blue-400', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'couple':
        return { name: 'I Love Haevy', icon: Heart, tag: 'Love', color: 'from-rose-400 to-pink-400', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'finance':
        return { name: 'Haevy Finance', icon: Wallet, tag: 'Finance', color: 'from-emerald-400 to-teal-400', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'admin':
        return { name: 'Haevy Admin', icon: ShieldCheck, tag: 'Admin', color: 'from-yellow-400 to-amber-500', badgeClass: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40' };
      case 'studio':
        return { name: 'Haevy Studio', icon: Sparkles, tag: 'Studio', color: 'from-purple-400 to-pink-400', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'games':
        return { name: 'Haevy Games', icon: Gamepad2, tag: 'Games', color: 'from-indigo-400 to-violet-500', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    }
  };

  const modeInfo = getModeBadgeInfo();
  const ModeIcon = modeInfo.icon;

  const handleOpenDrawer = () => {
    if (onOpenEcosystemDrawer) {
      onOpenEcosystemDrawer();
    } else {
      setIsEcosystemDrawerOpen(true);
    }
  };

  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5 gap-2 sm:gap-3">
      {/* Brand & Logo with Mode Switcher Trigger */}
      <div 
        onClick={handleOpenDrawer}
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 select-none"
        title="Bấm để mở toàn màn hình 6 Chế Độ"
      >
        {currentMode === 'couple' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-[1px] shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                <Heart size={20} className="fill-rose-500 text-rose-300 animate-bounce relative z-10" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                I Love <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Haevy</span>
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-black px-2 py-0.5 rounded-full border border-rose-500/40 shadow-sm flex items-center gap-1">
                💕 Love
              </span>
            </div>
          </>
        ) : currentMode === 'finance' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                <Wallet size={20} className="text-emerald-300 animate-pulse relative z-10" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Finance</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                💰 Tiền Tệ
              </span>
            </div>
          </>
        ) : currentMode === 'messages' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                <MessageSquare size={20} className="text-sky-300 fill-indigo-500/30 animate-pulse relative z-10" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Message</span>
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-black px-2 py-0.5 rounded-full border border-sky-500/40 shadow-sm">
                💬 Chat
              </span>
            </div>
          </>
        ) : currentMode === 'admin' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative">
                <ShieldCheck size={21} className="text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Admin</span>
              </span>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-black px-2 py-0.5 rounded-full border border-yellow-400/40 shadow-sm">
                🛡️ Admin
              </span>
            </div>
          </>
        ) : currentMode === 'studio' ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-500 to-pink-600 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <Sparkles size={20} className="text-purple-300 animate-pulse relative z-10" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Studio</span>
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-full border border-purple-500/40 shadow-sm">
                👑 VIP & AI
              </span>
            </div>
          </>
        ) : (activeTab === 'vip' || activeTab === 'topup') ? (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/15 animate-pulse" />
                <Crown size={21} className="fill-amber-400 text-amber-300 relative z-10 animate-bounce" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">VIP</span>
              </span>
              <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1">
                👑 Royal Hub
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center gap-[2.5px] px-2.5">
                <span className="w-[3px] h-3.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full animate-pulse" />
                <span className="w-[3px] h-5 bg-gradient-to-t from-amber-400 to-yellow-200 rounded-full" />
                <span className="w-[3px] h-6 bg-gradient-to-t from-amber-300 to-white rounded-full" />
                <span className="w-[3px] h-4 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-full animate-pulse" />
                <span className="w-[3px] h-2.5 bg-gradient-to-t from-amber-500 to-amber-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                Haevy <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Audio</span>
              </span>
              {isVip && (
                <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-0.5 shadow-sm">
                  <Crown size={10} className="fill-amber-400 text-amber-400" />
                  VIP
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Compact Brand Header - navigation is moved down to the bottom taskbar */}

      {/* Right Action Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Unified Studio AI Direct Action Button */}
        {onOpenStudioAudio && (
          <button
            id="navbar-unified-studio-btn"
            onClick={() => onOpenStudioAudio('tts')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Studio AI: Chuyển văn bản ra giọng đọc & phát hành audio"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>AI Voice</span>
          </button>
        )}

        {/* Account ID Pill with 1-Click Copy (Desktop Only) */}
        {accountId && (
          <div 
            onClick={handleCopyId}
            className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer text-xs font-mono group shrink-0"
            title="Bấm để sao chép ID tài khoản của bạn"
          >
            <span className="text-[9px] text-zinc-500 group-hover:text-amber-400/70">ID:</span>
            <span className="font-bold">{accountId}</span>
            {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-zinc-500 group-hover:text-amber-300" />}
          </div>
        )}

        {/* Anonymous Pass Quick Action if not logged in */}
        {!user && onOpenAnonPass && (
          <button
            id="navbar-anon-pass-btn"
            onClick={onOpenAnonPass}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
            title="Nhập mã ẩn danh VIP (Không cần đăng nhập)"
          >
            <KeyRound size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Mã VIP</span>
          </button>
        )}

        {/* COMPACT AVATAR & POINTS (CLICKING OPENS FULL SCREEN 6-MODE ECOSYSTEM) */}
        {loading ? (
          <div className="w-20 h-8 rounded-full bg-zinc-800 animate-pulse" />
        ) : user ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              id="user-profile-unified-btn"
              onClick={handleOpenDrawer}
              className={`flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full border transition-all text-left shadow-sm cursor-pointer group shrink-0 ${
                isVip
                  ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500/40 hover:border-amber-400'
                  : 'bg-zinc-900 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Bấm vào Avatar để mở toàn màn hình 6 Chế Độ Haevy"
            >
              {/* Avatar Icon (26px) */}
              <div className="relative shrink-0 w-6 h-6 sm:w-7 sm:h-7">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-full h-full rounded-full object-cover ring-1 ring-zinc-700 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold ring-1 ring-zinc-700 text-[10px] sm:text-xs">
                    {user.displayName?.charAt(0) || 'H'}
                  </div>
                )}
                {isVip && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-sm ring-1 ring-black">
                    <Crown size={8} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Compact Points */}
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold">
                <Coins size={11} className="text-amber-400" />
                <span className={isVip ? 'text-amber-300' : 'text-zinc-200'}>
                  {audioPoints.toLocaleString()}
                </span>
              </div>

              {/* Subtle 6 Modes Indicator on Tablet/Desktop */}
              <span className="hidden min-[480px]:inline-flex items-center gap-0.5 text-[9px] bg-amber-500/15 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                <Layers size={9} className="text-amber-400" />
                <span>6 Chế Độ</span>
              </span>

              <ChevronDown 
                size={11} 
                className="text-zinc-500 group-hover:text-amber-300 transition-transform group-hover:translate-y-0.5 shrink-0" 
              />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="open-modes-btn-guest"
              onClick={handleOpenDrawer}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm group"
              title="Khám phá 6 Chế độ Hệ sinh thái Haevy"
            >
              <Layers size={13} className="text-amber-400" />
              <span className="text-[11px] font-bold">6 Chế Độ</span>
            </button>

            <button
              id="open-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <LogIn size={13} />
              <span className="text-[11px]">Đăng nhập</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
