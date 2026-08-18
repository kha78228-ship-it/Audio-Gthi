import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Home, 
  Library, 
  Disc3, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  Heart, 
  User as UserIcon, 
  ChevronDown, 
  Check,
  Crown,
  Coins,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  filterFavorites: boolean;
  onToggleFilterFavorites: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ 
  activeTab, 
  onSelectTab, 
  filterFavorites, 
  onToggleFilterFavorites,
  onOpenAuth
}: NavbarProps) {
  const { user, loading, favorites, audioPoints, isVip, vipTier, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'library', label: 'Kho Audio', icon: Library },
    { id: 'player', label: 'Trình phát', icon: Disc3 },
    { id: 'community', label: 'Cộng đồng', icon: MessageSquare },
    { id: 'topup', label: 'Nạp VIP', icon: Sparkles, isHot: true },
    { id: 'vip', label: 'Đặc quyền VIP', icon: Crown, isHighlight: true },
  ] as const;

  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6 gap-3">
      {/* Brand & Logo */}
      <div 
        onClick={() => onSelectTab('home')}
        className="flex items-center gap-3 cursor-pointer group shrink-0"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-zinc-800 to-zinc-700 border border-zinc-700 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform">
          <Music size={20} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">AudioHub</h1>
            {isVip ? (
              <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded-md border border-amber-500/40 flex items-center gap-0.5">
                <Crown size={10} className="fill-amber-400 text-amber-400" />
                VIP
              </span>
            ) : (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded-md border border-indigo-500/30">
                PRO
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">Kho nhạc & Đặc quyền VIP</p>
        </div>
      </div>

      {/* Center Nav Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-1 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isVipTab = item.id === 'vip';
          const isTopupTab = item.id === 'topup';

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? isTopupTab
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                    : isVipTab
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'bg-zinc-800 text-white shadow-sm'
                  : isTopupTab
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                  : isVipTab
                  ? 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Icon 
                size={15} 
                className={
                  isActive 
                    ? (isTopupTab ? 'text-amber-400' : isVipTab ? 'text-amber-400 fill-amber-400' : 'text-white')
                    : (isTopupTab ? 'text-yellow-400' : isVipTab ? 'text-amber-400' : 'text-zinc-500')
                } 
              />
              <span>{item.label}</span>
              {isTopupTab && (
                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold px-1 rounded-full uppercase tracking-tighter">
                  Ưu đãi
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2">
        {/* Nạp VIP Quick Action Button (Desktop + Mobile) */}
        <button
          id="navbar-quick-topup-btn"
          onClick={() => onSelectTab('topup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
            activeTab === 'topup'
              ? 'bg-amber-500 text-black shadow-amber-500/20'
              : 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200'
          }`}
          title="Nạp VIP - Giá chỉ từ 15k & Nhập mã ưu đãi"
        >
          <Sparkles size={14} className={activeTab === 'topup' ? 'text-black' : 'text-amber-400 animate-pulse'} />
          <span className="hidden sm:inline">Nạp VIP</span>
          <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1 rounded sm:ml-0.5">15k</span>
        </button>

        {/* Audio Points Indicator Button */}
        <button
          id="navbar-audio-points-btn"
          onClick={() => onSelectTab('vip')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all shadow-sm group"
          title="Xem Trung tâm Điểm Audio & Đổi VIP"
        >
          <Coins size={15} className="group-hover:scale-110 transition-transform" />
          <span className="font-mono">{audioPoints.toLocaleString()}</span>
          <span className="text-[10px] text-amber-400/70 font-normal hidden sm:inline">pts</span>
        </button>

        {/* Favorite Filter Toggle */}
        {user && (
          <button
            id="filter-favorites-btn"
            onClick={onToggleFilterFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              filterFavorites
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title="Lọc bài hát yêu thích"
          >
            <Heart
              size={15}
              className={filterFavorites ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}
            />
            <span className="hidden sm:inline">Yêu thích</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              filterFavorites ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {favorites.length}
            </span>
          </button>
        )}

        {/* User Profile / Auth State */}
        {loading ? (
          <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-profile-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 p-1.5 pr-3 bg-zinc-900 hover:bg-zinc-800/80 border rounded-full transition-colors text-left shadow-sm ${
                isVip ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-zinc-800'
              }`}
            >
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 ring-1 ring-zinc-700">
                    <UserIcon size={14} />
                  </div>
                )}
                {isVip && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-black">
                    <Crown size={9} fill="currentColor" />
                  </div>
                )}
              </div>

              <span className="text-xs font-medium text-zinc-200 max-w-[90px] truncate hidden sm:inline">
                {user.displayName || user.email?.split('@')[0] || 'Tài khoản'}
              </span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2.5 border-b border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Tài khoản</p>
                    {isVip && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                        {vipTier === 'vip_master' ? 'VIP MASTER' : 'VIP'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white truncate mt-0.5">
                    {user.email || user.displayName}
                  </p>
                </div>

                <button
                  id="dropdown-topup-btn"
                  onClick={() => {
                    onSelectTab('topup');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/10 flex items-center justify-between text-left transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={15} className="text-yellow-400" />
                    <span>Nạp VIP (Chỉ từ 15k)</span>
                  </div>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    Ưu đãi
                  </span>
                </button>

                <button
                  id="dropdown-vip-hub-btn"
                  onClick={() => {
                    onSelectTab('vip');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown size={15} />
                    <span>Trung tâm Điểm & VIP</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold">{audioPoints} pts</span>
                </button>

                <button
                  id="dropdown-favorites-btn"
                  onClick={() => {
                    onToggleFilterFavorites();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart size={15} className={filterFavorites ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'} />
                    <span>Kho yêu thích ({favorites.length})</span>
                  </div>
                  {filterFavorites && <Check size={14} className="text-rose-400" />}
                </button>

                <div className="my-1 border-t border-zinc-800/80" />

                <button
                  id="user-logout-btn"
                  onClick={async () => {
                    setDropdownOpen(false);
                    await logout();
                  }}
                  className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2.5 text-left transition-colors"
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="open-login-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
