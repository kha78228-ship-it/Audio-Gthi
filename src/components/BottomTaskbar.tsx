import React from 'react';
import { 
  Home, 
  Library, 
  Disc3, 
  MessageSquare, 
  Sparkles, 
  Crown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Maximize2,
  Music2,
  Radio,
  PlusCircle,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Track, ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface BottomTaskbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenFullPlayer: () => void;
  onOpenAuth: () => void;
  onQuickAction?: (action: string) => void;
}

export function BottomTaskbar({
  activeTab,
  onSelectTab,
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenFullPlayer,
  onOpenAuth,
  onQuickAction,
}: BottomTaskbarProps) {
  const { user, favorites, toggleFavorite } = useAuth();

  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleFavorite(currentTrack.id);
  };

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
    { id: 'player' as ActiveTab, label: 'Trình phát', icon: Disc3 },
    { id: 'community' as ActiveTab, label: 'Cộng đồng', icon: MessageSquare },
    { id: 'vip' as ActiveTab, label: 'Gói VIP', icon: Crown },
  ];

  return (
    <footer 
      id="bottom-dock-taskbar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/90 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] transition-all"
    >
      {/* Mini Player Strip (Top portion of taskbar) */}
      {currentTrack && activeTab !== 'player' && (
        <div 
          id="mini-player-strip"
          className="border-b border-zinc-800/60 px-3 sm:px-6 py-2 bg-gradient-to-r from-zinc-900/90 via-zinc-950/95 to-zinc-900/90"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
            {/* Left Track Info */}
            <div 
              onClick={onOpenFullPlayer}
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-1/3 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md border border-zinc-700/50">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Music2 size={16} />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                      <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                      <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                    {currentTrack.title}
                  </h4>
                  {currentTrack.isVipOnly && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1 rounded border border-amber-500/40">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`p-1.5 rounded-lg transition-colors hidden sm:inline-block ${
                  isFavorite ? 'text-rose-500' : 'text-zinc-500 hover:text-white'
                }`}
                title={isFavorite ? 'Xóa khỏi yêu thích' : 'Yêu thích'}
              >
                <Heart size={15} className={isFavorite ? 'fill-rose-500' : ''} />
              </button>
            </div>

            {/* Center Controls & Progress Bar */}
            <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onPlayPrev}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài trước"
                >
                  <SkipBack size={16} fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="p-2 sm:p-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onPlayNext}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài tiếp theo"
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span className="hidden sm:inline">{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
                />
                <span className="hidden sm:inline">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Volume & Fullscreen Toggle */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 sm:w-1/3 shrink-0">
              <div className="hidden lg:flex items-center gap-2">
                <button 
                  type="button"
                  onClick={onToggleMute} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={onOpenFullPlayer}
                className="p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Mở toàn màn hình trình phát"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Taskbar Navigation Tabs */}
      <div className="max-w-3xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-around gap-1 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'vip' && activeTab === 'topup');
          const isVipTab = item.id === 'vip';

          return (
            <button
              key={item.id}
              id={`taskbar-tab-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? isVipTab
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-md'
                    : 'bg-zinc-800/90 text-white border border-zinc-700/60 font-bold shadow-md'
                  : isVipTab
                  ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {/* Active Glow Dot */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              )}

              <Icon 
                size={18} 
                className={
                  isActive 
                    ? (isVipTab ? 'text-amber-400 fill-amber-400' : 'text-white')
                    : (isVipTab ? 'text-amber-400' : 'text-zinc-400')
                } 
              />
              <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
