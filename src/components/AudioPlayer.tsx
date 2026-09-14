import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Disc3, 
  Search, 
  Sparkles,
  Download,
  Headphones,
  Sliders,
  Crown,
  CheckCircle2,
  Music2,
  Gift,
  Coins,
  Moon,
  Timer,
  Flame,
  Music,
  Mic,
  Zap,
  Radio,
  Equal,
  Activity,
  Shuffle,
  Repeat,
  Repeat1,
  TrendingUp,
  Image as ImageIcon,
  BarChart3,
  Waves,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus
} from 'lucide-react';
import { Track, AudioBookmark } from '../types';
import { useAuth } from '../context/AuthContext';
import { VisualEqualizer } from './VisualEqualizer';
import { AudioDynamicVisualizer, VisualizerMode } from './AudioDynamicVisualizer';
import { AudioBookmarksTab } from './AudioBookmarksTab';
import { audioBookmarkService } from '../services/audioBookmarkService';
import { 
  webAudioEqualizer, 
  EQUALIZER_PRESETS, 
  EqualizerPresetKey 
} from '../lib/webAudioEqualizer';
import { ShuffleMode, RepeatMode } from '../services/smartShuffleService';

interface AudioPlayerProps {
  playlist: Track[];
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
  onSelectTrack: (track: Track) => void;
  onOpenAuth: () => void;
  onOpenVipHub?: () => void;
  onOpenGiftShop?: (author?: any) => void;
  onOpenSleepTimer?: () => void;
  sleepTimerSecondsLeft?: number | null;
  sleepTimerActive?: boolean;
}

export function AudioPlayer({
  playlist,
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
  onSelectTrack,
  onOpenAuth,
  onOpenVipHub,
  onOpenGiftShop,
  onOpenSleepTimer,
  sleepTimerSecondsLeft,
  sleepTimerActive,
}: AudioPlayerProps) {
  const { user, isVip, vipSettings } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'queue' | 'equalizer'>('queue');
  const [displayMode, setDisplayMode] = useState<'artwork' | 'visualizer'>('artwork');
  const [currentEqPreset, setCurrentEqPreset] = useState<EqualizerPresetKey>(webAudioEqualizer.getCurrentPreset());

  // Sync EQ preset state
  useEffect(() => {
    const unsubscribe = webAudioEqualizer.subscribe(() => {
      setCurrentEqPreset(webAudioEqualizer.getCurrentPreset());
    });
    return () => unsubscribe();
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimerBadge = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeTrack = currentTrack || playlist[0];

  const filteredPlaylist = playlist.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDownload = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!isVip) {
      if (onOpenVipHub) onOpenVipHub();
      return;
    }

    if (activeTrack?.url) {
      setDownloadNotice(`Đang tải bản thu âm ${activeTrack.title} chất lượng cao 320kbps...`);
      const link = document.createElement('a');
      link.href = activeTrack.url;
      link.download = `${activeTrack.title} - ${activeTrack.artist}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setDownloadNotice(null), 3000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
      {/* Main Player Card */}
      <div 
        id="main-player-card"
        className={`flex-1 bg-zinc-900 border rounded-3xl p-5 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden transition-all ${
          isVip && vipSettings.showVipBadge
            ? 'border-amber-500/40 shadow-amber-500/5'
            : 'border-zinc-800'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* VIP Status & Sound Engine Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {isVip && vipSettings.hifiMode ? (
              <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1 shadow-sm">
                <Crown size={12} className="text-amber-400 fill-amber-400" />
                Lossless 24-bit/96kHz
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-zinc-800/90 text-zinc-400 px-2 py-0.5 rounded-lg border border-zinc-700/80">
                Bản thường 128kbps
              </span>
            )}

            {isVip && vipSettings.spatial3D && (
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1">
                <Headphones size={11} />
                Spatial 3D
              </span>
            )}

            {isVip && vipSettings.bassBoost && (
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/30 flex items-center gap-1">
                <Sliders size={11} />
                Bass Boost
              </span>
            )}

            {isVip && vipSettings.smartEqualizer && vipSettings.smartEqualizer !== 'flat' && (
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-500/30 flex items-center gap-1">
                <Sliders size={11} />
                {vipSettings.smartEqualizer === 'bass_ultra' ? 'EQ Bass Ultra' :
                 vipSettings.smartEqualizer === 'vocal_clarity' ? 'EQ Vocal' :
                 vipSettings.smartEqualizer === 'electronic' ? 'EQ EDM' :
                 vipSettings.smartEqualizer === 'acoustic' ? 'EQ Acoustic' : 'EQ Cinema'}
              </span>
            )}

            {isVip && (vipSettings.audioCrossfadeSec ?? 4) > 0 && (
              <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-lg border border-orange-500/30 flex items-center gap-1">
                <Flame size={11} />
                DJ Crossfade {vipSettings.audioCrossfadeSec ?? 4}s
              </span>
            )}
          </div>

          {/* Download offline button */}
          <button
            id="download-track-btn"
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              isVip
                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800/90 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title={isVip ? "Tải bài hát chất lượng cao về máy" : "Nâng cấp VIP để tải nhạc"}
          >
            <Download size={13} />
            <span>{isVip ? 'Tải offline (VIP)' : 'Mở khóa tải VIP'}</span>
          </button>
        </div>

        {downloadNotice && (
          <div className="mb-4 p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* View Mode Switcher (Artwork vs Real-Time Dynamic Visualizer) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center bg-zinc-950 p-1 rounded-2xl border border-zinc-800 shadow-inner">
            <button
              type="button"
              id="switch-player-view-artwork"
              onClick={() => setDisplayMode('artwork')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'artwork'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon size={13} className={displayMode === 'artwork' ? 'text-amber-400' : ''} />
              <span>Bìa Album</span>
            </button>
            <button
              type="button"
              id="switch-player-view-visualizer"
              onClick={() => setDisplayMode('visualizer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                displayMode === 'visualizer'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity size={13} className="text-amber-400 animate-pulse" />
              <span>Sóng D3 Real-Time</span>
              <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-extrabold">
                LIVE
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {displayMode === 'visualizer' && (
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950/60 px-2 py-0.5 rounded-lg border border-zinc-800/80">
                60 FPS • D3 & Canvas
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Visualizer Stage or Artwork */}
        {displayMode === 'visualizer' ? (
          <div className="w-full aspect-square rounded-3xl overflow-hidden mb-6 relative shadow-2xl border border-zinc-800/80">
            <AudioDynamicVisualizer
              isPlaying={isPlaying}
              isVip={isVip}
              trackTitle={activeTrack?.title}
              artist={activeTrack?.artist}
              coverUrl={activeTrack?.coverUrl}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-3xl overflow-hidden bg-zinc-800 mb-6 relative shadow-2xl group border border-zinc-800/80">
            {activeTrack?.coverUrl ? (
              <img 
                src={activeTrack.coverUrl} 
                alt={activeTrack.title} 
                className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <Music2 size={64} />
              </div>
            )}

            {/* Sound wave visualizer overlay on artwork */}
            {isPlaying && (
              <div 
                onClick={() => setDisplayMode('visualizer')}
                className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/10 cursor-pointer hover:border-amber-500/50 transition-all group/wave"
                title="Bấm để mở chế độ Sóng D3 Real-Time toàn màn hình đĩa"
              >
                <div className="flex items-center gap-2">
                  <Disc3 size={18} className={isVip ? 'text-amber-400 animate-spin' : 'text-zinc-300 animate-spin'} />
                  <span className="text-xs font-semibold text-zinc-200 group-hover/wave:text-amber-300 transition-colors">
                    {isVip && vipSettings.hifiMode ? 'Đang phát âm thanh Studio Hi-Fi' : 'Đang phát âm thanh bản thường'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-1 h-4">
                    <span className={`w-1 animate-[bounce_0.6s_infinite] h-full rounded-full ${isVip ? 'bg-amber-400' : 'bg-zinc-300'}`} />
                    <span className={`w-1 animate-[bounce_0.9s_infinite] h-3/4 rounded-full ${isVip ? 'bg-amber-400' : 'bg-zinc-400'}`} />
                    <span className={`w-1 animate-[bounce_0.4s_infinite] h-4/5 rounded-full ${isVip ? 'bg-amber-300' : 'bg-zinc-200'}`} />
                    <span className={`w-1 animate-[bounce_0.8s_infinite] h-2/3 rounded-full ${isVip ? 'bg-amber-400' : 'bg-zinc-400'}`} />
                    <span className={`w-1 animate-[bounce_0.5s_infinite] h-full rounded-full ${isVip ? 'bg-amber-300' : 'bg-zinc-300'}`} />
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 group-hover/wave:bg-amber-500 group-hover/wave:text-black transition-colors">
                    Mở D3 Wave
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Title & Artist & Series */}
        <div className="flex items-start justify-between mb-6 px-1 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {activeTrack?.isSeries && (
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Disc3 size={11} className="animate-spin text-indigo-400" />
                  {activeTrack.episodeNumber ? `Tập ${activeTrack.episodeNumber}${activeTrack.totalEpisodes ? `/${activeTrack.totalEpisodes}` : ''}` : 'Cốt Truyện'}
                </span>
              )}
              {activeTrack?.genre && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  {activeTrack.genre}
                </span>
              )}
              {activeTrack?.isVipOnly && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded font-mono">
                  VIP ONLY
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {activeTrack?.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-zinc-300 font-semibold text-sm sm:text-base truncate">
                {activeTrack?.artist}
              </p>
              {activeTrack?.isAuthorVerified && (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              )}
            </div>
            {activeTrack?.seriesTitle && (
              <p className="text-xs text-zinc-400 mt-1 font-medium truncate">
                📖 Nằm trong bộ cốt truyện: <span className="text-amber-300 font-bold">{activeTrack.seriesTitle}</span>
              </p>
            )}
            {activeTrack?.storylineSummary && (
              <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 italic bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80">
                "{activeTrack.storylineSummary}"
              </p>
            )}
          </div>

          {/* Quick Gift Button for Active Author */}
          {onOpenGiftShop && activeTrack && (
            <button
              id="player-gift-author-btn"
              onClick={() => onOpenGiftShop({
                uid: activeTrack.addedBy || `author-${activeTrack.artist}`,
                stageName: activeTrack.artist,
                trackTitle: activeTrack.title,
                trackId: activeTrack.id
              })}
              className="ml-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
              title="Tặng quà cho tác giả bài hát này"
            >
              <Gift size={15} className="text-amber-400" />
              <span className="hidden sm:inline">Tặng Quà Tác Giả</span>
              <span className="sm:hidden">Tặng quà</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 px-1">
          <input
            id="audio-progress-bar"
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="flex justify-between mt-2 text-xs text-zinc-500 font-medium font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Quick Equalizer Presets Strip */}
        <div className="mb-5 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Sliders size={13} className="text-amber-400" />
              <span>Chế độ âm thanh EQ:</span>
              <span className="text-amber-400 font-extrabold">{EQUALIZER_PRESETS[currentEqPreset]?.name}</span>
            </div>
            <button
              type="button"
              id="open-equalizer-tab-btn"
              onClick={() => setRightPanelTab('equalizer')}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20"
            >
              <Activity size={12} className="animate-pulse" />
              <span>Mở EQ Đồ Họa</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { key: 'bass_boost', label: 'Bass Boost', icon: Flame, color: 'text-orange-400' },
              { key: 'acoustic', label: 'Acoustic', icon: Music, color: 'text-cyan-400' },
              { key: 'vocal', label: 'Vocal Clarity', icon: Mic, color: 'text-purple-400' },
              { key: 'electronic', label: 'Electronic', icon: Zap, color: 'text-pink-400' },
              { key: 'rock', label: 'Rock', icon: Radio, color: 'text-amber-400' },
              { key: 'flat', label: 'Flat', icon: Equal, color: 'text-zinc-400' },
            ].map(({ key, label, icon: Icon, color }) => {
              const isSelected = currentEqPreset === key;
              return (
                <button
                  key={key}
                  id={`quick-eq-btn-${key}`}
                  type="button"
                  onClick={() => {
                    webAudioEqualizer.setPreset(key as EqualizerPresetKey);
                    webAudioEqualizer.resume();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 font-extrabold shadow-sm scale-[1.02]'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-800'
                  }`}
                >
                  <Icon size={12} className={isSelected ? 'text-black' : color} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Controls with Smart Shuffle and Repeat */}
        <div className="flex items-center justify-center gap-4 sm:gap-7 mb-4">
          {/* Shuffle Mode Toggle Button */}
          {onToggleShuffle && (
            <button 
              id="player-shuffle-mode-btn"
              onClick={onToggleShuffle}
              className={`p-3 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                shuffleMode === 'smart_shuffle'
                  ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-950/50'
                  : shuffleMode === 'shuffle'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
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
                <Sparkles size={20} className="text-purple-300 animate-pulse" />
              ) : (
                <Shuffle size={20} className={shuffleMode === 'shuffle' ? 'text-amber-400' : ''} />
              )}
            </button>
          )}

          <button 
            id="prev-track-btn"
            onClick={onPlayPrev}
            className="p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800 active:scale-95"
            aria-label="Previous track"
          >
            <SkipBack size={26} fill="currentColor" />
          </button>
          
          <button 
            id="play-pause-btn"
            onClick={onTogglePlay}
            className={`p-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl ${
              isVip
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black shadow-amber-500/20'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause size={30} fill="currentColor" />
            ) : (
              <Play size={30} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          
          <button 
            id="next-track-btn"
            onClick={onPlayNext}
            className="p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800 active:scale-95"
            aria-label="Next track"
          >
            <SkipForward size={26} fill="currentColor" />
          </button>

          {/* Repeat Mode Toggle Button */}
          {onToggleRepeat && (
            <button 
              id="player-repeat-mode-btn"
              onClick={onToggleRepeat}
              className={`p-3 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                repeatMode === 'one'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : repeatMode === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
              title={
                repeatMode === 'one'
                  ? '🔂 Đang lặp 1 bài - Bấm để đổi'
                  : repeatMode === 'all'
                  ? '🔁 Đang lặp toàn bộ danh sách - Bấm để đổi'
                  : 'Tắt lặp lại - Bấm để bật lặp'
              }
            >
              {repeatMode === 'one' ? (
                <Repeat1 size={20} className="text-amber-400" />
              ) : (
                <Repeat size={20} className={repeatMode === 'all' ? 'text-emerald-400' : ''} />
              )}
            </button>
          )}
        </div>

        {/* Smart Shuffle Indicator & Insights Trigger */}
        {shuffleMode === 'smart_shuffle' && onOpenSmartShuffleModal && (
          <div className="mb-4 flex items-center justify-center">
            <button
              id="open-smart-shuffle-insights-btn"
              type="button"
              onClick={onOpenSmartShuffleModal}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-zinc-900 border border-purple-500/40 hover:border-purple-400/80 text-xs text-purple-200 transition-all flex items-center gap-2 group shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles size={13} className="text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Smart Shuffle AI đang thấu cảm gu</span>
              <span className="text-[10px] text-purple-300 font-bold underline decoration-purple-400/50">
                Xem gợi ý & xếp hạng thể loại
              </span>
            </button>
          </div>
        )}

        {/* Bottom Bar inside Player */}
        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 px-1">
          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <button 
              id="volume-mute-btn"
              onClick={onToggleMute} 
              className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
              aria-label="Âm lượng"
            >
              {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-24 sm:w-28 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Center / Right: Sleep Timer Button & Points Reward */}
          <div className="flex items-center gap-2.5">
            {onOpenSleepTimer && (
              <button
                type="button"
                id="audio-player-sleep-timer-btn"
                onClick={onOpenSleepTimer}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  sleepTimerActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
                }`}
                title="Hẹn giờ tắt nhạc (Sleep Timer)"
              >
                <Moon size={14} className={sleepTimerActive ? 'text-amber-400 fill-amber-400/40 animate-pulse' : ''} />
                {sleepTimerActive && sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0 ? (
                  <span className="font-mono text-amber-300 font-extrabold">
                    Tắt sau {formatTimerBadge(sleepTimerSecondsLeft)}
                  </span>
                ) : sleepTimerActive ? (
                  <span className="text-amber-300 font-bold">
                    Tắt sau bài này
                  </span>
                ) : (
                  <span>Hẹn giờ tắt</span>
                )}
              </button>
            )}

            {user && (
              <span className="text-xs text-zinc-500 font-medium hidden sm:flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                {isVip ? '+2X Điểm (VIP)' : '+5 Điểm'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Playlist / Queue / Equalizer Panel */}
      <div 
        id="playlist-card"
        className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-7 flex flex-col min-h-[480px] shadow-xl"
      >
        {/* Tab Switcher Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
            <button
              type="button"
              id="player-tab-queue-btn"
              onClick={() => setRightPanelTab('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightPanelTab === 'queue'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListMusic size={14} className={rightPanelTab === 'queue' ? 'text-amber-400' : 'text-zinc-500'} />
              <span>Danh Sách Phát</span>
              <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                {filteredPlaylist.length}
              </span>
            </button>

            <button
              type="button"
              id="player-tab-equalizer-btn"
              onClick={() => setRightPanelTab('equalizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightPanelTab === 'equalizer'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders size={14} className={rightPanelTab === 'equalizer' ? 'text-amber-400' : 'text-zinc-500'} />
              <span>Visual Equalizer</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30">
                DSP
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {rightPanelTab === 'equalizer' ? (
              <span className="text-[11px] text-zinc-400 font-medium">
                Real-time Web Audio
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-medium font-mono">
                {filteredPlaylist.length} bản nhạc
              </span>
            )}
          </div>
        </div>

        {rightPanelTab === 'equalizer' ? (
          /* Visual Equalizer View */
          <div className="flex-1 flex flex-col justify-start">
            <VisualEqualizer 
              isPlaying={isPlaying} 
              isVip={isVip} 
              className="border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        ) : (
          /* Queue & Search View */
          <>
            {/* Search inside queue */}
            <div className="relative mb-5 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                id="playlist-search-input"
                type="text"
                placeholder="Lọc danh sách bài hát..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all"
              />
            </div>
            
            {/* Track List */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-1.5 custom-scrollbar max-h-[450px]">
              {filteredPlaylist.length === 0 ? (
                <div className="text-center text-zinc-500 py-16 px-4 flex flex-col items-center gap-2">
                  <Disc3 size={28} className="text-zinc-600 mb-1 animate-spin-slow" />
                  <p className="text-sm font-medium">Không tìm thấy bài hát phù hợp</p>
                </div>
              ) : (
                filteredPlaylist.map((track) => {
                  const isCurrent = track.id === activeTrack?.id;

                  return (
                    <div
                      key={track.id}
                      id={`playlist-item-${track.id}`}
                      onClick={() => onSelectTrack(track)}
                      className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                        isCurrent 
                          ? 'bg-zinc-800/90 border-zinc-700 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-zinc-800/40 hover:border-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 relative shadow-sm">
                          {track.coverUrl && (
                            <img 
                              src={track.coverUrl} 
                              alt="" 
                              className="w-full h-full object-cover opacity-90" 
                            />
                          )}
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="flex gap-0.5 items-end h-3">
                                <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                                <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                                <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-xs sm:text-sm truncate ${
                              isCurrent ? 'text-white font-bold' : 'text-zinc-300'
                            }`}>
                              {track.title}
                            </p>
                            {track.isVipOnly && (
                              <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded shrink-0">
                                VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-zinc-500 truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md hidden sm:inline border border-amber-500/30">
                            ĐANG PHÁT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
