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
  Music2
} from 'lucide-react';
import { Track } from '../types';
import { useAuth } from '../context/AuthContext';

interface BottomPlayerBarProps {
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
}

export function BottomPlayerBar({
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

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleFavorite(currentTrack.id);
  };

  return (
    <div 
      id="persistent-bottom-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 shadow-2xl px-4 sm:px-6 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Track Info */}
        <div 
          onClick={onOpenFullPlayer}
          className="flex items-center gap-3.5 min-w-0 w-1/4 sm:w-1/3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md">
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
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={onPlayPrev}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Bài trước"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={onTogglePlay}
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
              onClick={onPlayNext}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Bài tiếp theo"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2.5 text-[11px] text-zinc-500 font-mono">
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

        {/* Right Volume & Expand */}
        <div className="flex items-center justify-end gap-3 w-1/4 sm:w-1/3">
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={onToggleMute} 
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
              className="w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <button
            onClick={onOpenFullPlayer}
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
