import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  Maximize2, 
  Music2, 
  Moon,
  Sparkles,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';
import { Track } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShuffleMode, RepeatMode } from '../services/smartShuffleService';
import { haptics } from '../utils/haptics';

interface BottomPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffleMode?: ShuffleMode;
  repeatMode?: RepeatMode;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onOpenSmartShuffleModal?: () => void;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenFullPlayer: () => void;
  onOpenAuth: () => void;
  onOpenSleepTimer?: () => void;
  sleepTimerSecondsLeft?: number | null;
  sleepTimerActive?: boolean;
}

export function BottomPlayerBar({
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isMuted,
  shuffleMode = 'smart_shuffle',
  repeatMode = 'off',
  onToggleShuffle,
  onToggleRepeat,
  onOpenSmartShuffleModal,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenFullPlayer,
  onOpenAuth,
  onOpenSleepTimer,
  sleepTimerSecondsLeft,
  sleepTimerActive,
}: BottomPlayerBarProps) {
  const { user, favorites, toggleFavorite } = useAuth();

  if (!currentTrack) return null;

  const isFavorite = favorites.includes(currentTrack.id);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimerBadge = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.light();
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleFavorite(currentTrack.id);
  };

  return (
    <div 
      id="persistent-bottom-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 shadow-2xl px-3 sm:px-6 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Track Info */}
        <div 
          onClick={() => {
            haptics.medium();
            onOpenFullPlayer();
          }}
          className="flex items-center gap-3 min-w-0 w-1/3 sm:w-1/4 cursor-pointer group"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Music2 size={18} />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-white animate-[bounce_0.8s_infinite] h-full" />
                  <div className="w-0.5 bg-white animate-[bounce_1.2s_infinite] h-2/3" />
                  <div className="w-0.5 bg-white animate-[bounce_0.9s_infinite] h-4/5" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition-colors hidden sm:inline-block ${
              isFavorite ? 'text-rose-500' : 'text-zinc-500 hover:text-white'
            }`}
            title={isFavorite ? 'Xóa khỏi yêu thích' : 'Yêu thích'}
          >
            <Heart size={16} className={isFavorite ? 'fill-rose-500' : ''} />
          </button>
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Shuffle Mode Toggle */}
            {onToggleShuffle && (
              <button
                id="bottom-shuffle-mode-btn"
                onClick={() => {
                  haptics.selection();
                  onToggleShuffle();
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  shuffleMode === 'smart_shuffle'
                    ? 'text-purple-300 bg-purple-500/20'
                    : shuffleMode === 'shuffle'
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={
                  shuffleMode === 'smart_shuffle'
                    ? '✨ Smart Shuffle AI (Ưu tiên theo gu) - Bấm để đổi'
                    : shuffleMode === 'shuffle'
                    ? '🔀 Ngẫu nhiên - Bấm để đổi'
                    : 'Phát tuần tự - Bấm để bật xáo trộn'
                }
              >
                {shuffleMode === 'smart_shuffle' ? (
                  <Sparkles size={15} className="animate-pulse" />
                ) : (
                  <Shuffle size={15} />
                )}
              </button>
            )}

            <button
              onClick={() => {
                haptics.light();
                onPlayPrev();
              }}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Bài trước"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={() => {
                haptics.toggle();
                onTogglePlay();
              }}
              className="p-2.5 bg-white hover:bg-zinc-200 text-black rounded-full transition-all shadow-md active:scale-95"
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                haptics.light();
                onPlayNext();
              }}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Bài tiếp theo"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            {/* Repeat Mode Toggle */}
            {onToggleRepeat && (
              <button
                id="bottom-repeat-mode-btn"
                onClick={() => {
                  haptics.selection();
                  onToggleRepeat();
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  repeatMode === 'one'
                    ? 'text-amber-300 bg-amber-500/20'
                    : repeatMode === 'all'
                    ? 'text-emerald-300 bg-emerald-500/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={
                  repeatMode === 'one'
                    ? '🔂 Đang lặp 1 bài - Bấm để đổi'
                    : repeatMode === 'all'
                    ? '🔁 Đang lặp toàn bộ - Bấm để đổi'
                    : 'Tắt lặp lại - Bấm để bật'
                }
              >
                {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            )}
          </div>

          <div className="w-full flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Volume & Expand & Smart Shuffle Hub */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-1/3 sm:w-1/4">
          {/* Smart Shuffle insights quick modal button */}
          {onOpenSmartShuffleModal && (
            <button
              id="bottom-smart-insights-btn"
              type="button"
              onClick={() => {
                haptics.light();
                onOpenSmartShuffleModal();
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                shuffleMode === 'smart_shuffle'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Xem phân tích gu âm nhạc & Hàng đợi Smart Shuffle"
            >
              <Sparkles size={14} className="text-purple-400" />
              <span className="hidden lg:inline text-[11px]">Gu AI</span>
            </button>
          )}

          {/* Sleep Timer button */}
          {onOpenSleepTimer && (
            <button
              type="button"
              onClick={() => {
                haptics.light();
                onOpenSleepTimer();
              }}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                sleepTimerActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
              title="Hẹn giờ tắt nhạc (Sleep Timer)"
            >
              <Moon size={15} className={sleepTimerActive ? 'text-amber-400 fill-amber-400/40 animate-pulse' : ''} />
              {sleepTimerActive && sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0 ? (
                <span className="font-mono text-[11px] font-bold text-amber-300 hidden min-[480px]:inline">
                  {formatTimerBadge(sleepTimerSecondsLeft)}
                </span>
              ) : null}
            </button>
          )}

          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => {
                haptics.selection();
                onToggleMute();
              }} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <button
            onClick={() => {
              haptics.medium();
              onOpenFullPlayer();
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title="Mở toàn màn hình trình phát"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
