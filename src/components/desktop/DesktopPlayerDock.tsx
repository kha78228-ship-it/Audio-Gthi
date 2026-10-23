import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  X, 
  Music2, 
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Track } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { haptics } from '../../utils/haptics';

interface DesktopPlayerDockProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onOpenFullPlayer: () => void;
  onCloseTrack: () => void;
  shuffleMode?: 'off' | 'shuffle' | 'smart_shuffle';
  repeatMode?: 'off' | 'all' | 'one';
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
}

export function DesktopPlayerDock({
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
  onCloseTrack,
  shuffleMode = 'off',
  repeatMode = 'off',
  onToggleShuffle,
  onToggleRepeat,
}: DesktopPlayerDockProps) {
  const { favorites, toggleFavorite } = useAuth();
  const [isHoveringBar, setIsHoveringBar] = useState(false);

  if (!currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      id="desktop-pro-media-dock"
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] px-6 py-2.5 transition-all select-none"
      onMouseEnter={() => setIsHoveringBar(true)}
      onMouseLeave={() => setIsHoveringBar(false)}
    >
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-6">
        {/* Left: Track Information & Album Art */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
          <div 
            onClick={onOpenFullPlayer}
            className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/60 relative shrink-0 shadow-md cursor-pointer group"
            title="Bấm để mở trình phát toàn màn hình"
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Music2 size={20} />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-3.5">
                  <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                  <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                  <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 
                onClick={onOpenFullPlayer}
                className="font-extrabold text-sm text-white truncate cursor-pointer hover:text-amber-400 transition-colors"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>
              {currentTrack.isVipOnly && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/40">
                  VIP
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          {/* Quick Favorite Heart Button */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              toggleFavorite(currentTrack.id);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isFav ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart size={16} className={isFav ? 'fill-rose-500' : ''} />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            {onToggleShuffle && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onToggleShuffle();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  shuffleMode === 'smart_shuffle'
                    ? 'text-cyan-400 bg-cyan-500/20'
                    : shuffleMode === 'shuffle'
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={
                  shuffleMode === 'smart_shuffle'
                    ? 'Trộn thông minh AI đang bật'
                    : shuffleMode === 'shuffle'
                    ? 'Trộn ngẫu nhiên thường'
                    : 'Bật trộn bài'
                }
              >
                <Shuffle size={15} />
              </button>
            )}

            {/* Prev Track */}
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                onPlayPrev();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Bài trước"
            >
              <SkipBack size={18} />
            </button>

            {/* Play/Pause Main */}
            <button
              type="button"
              onClick={() => {
                haptics.medium();
                onTogglePlay();
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/30 cursor-pointer"
              title={isPlaying ? 'Tạm dừng (Space)' : 'Phát nhạc (Space)'}
            >
              {isPlaying ? (
                <Pause size={17} className="fill-zinc-950" />
              ) : (
                <Play size={17} className="fill-zinc-950 ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                onPlayNext();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Bài tiếp theo"
            >
              <SkipForward size={18} />
            </button>

            {/* Repeat */}
            {onToggleRepeat && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onToggleRepeat();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  repeatMode === 'one'
                    ? 'text-amber-300 bg-amber-500/20'
                    : repeatMode === 'all'
                    ? 'text-emerald-300 bg-emerald-500/20'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={
                  repeatMode === 'one'
                    ? 'Lặp 1 bài'
                    : repeatMode === 'all'
                    ? 'Lặp toàn bộ'
                    : 'Tắt lặp'
                }
              >
                {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            )}
          </div>

          {/* Progress Slider */}
          <div className="w-full flex items-center gap-2.5 text-xs text-zinc-400 font-mono">
            <span className="w-9 text-right tabular-nums">{formatTime(progress)}</span>
            <div className="relative flex-1 group/slider py-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
              />
            </div>
            <span className="w-9 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Full Player & Close */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          {/* Audio Waveform FX indicator */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Lossless Hi-Fi</span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
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
              className="w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-300 hover:[&::-webkit-slider-thumb]:bg-amber-400"
            />
          </div>

          {/* Full Screen Player */}
          <button
            type="button"
            onClick={onOpenFullPlayer}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition cursor-pointer"
            title="Mở toàn màn hình Studio Player"
          >
            <Maximize2 size={16} />
          </button>

          {/* Close Track */}
          <button
            type="button"
            onClick={onCloseTrack}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            title="Đóng trình phát"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
