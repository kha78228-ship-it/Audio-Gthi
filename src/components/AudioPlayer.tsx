import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume1,
  Volume2, 
  VolumeX, 
  Minus,
  Plus,
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
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Power,
  Check,
  Info
} from 'lucide-react';
import { Track, AudioBookmark } from '../types';
import { useAuth } from '../context/AuthContext';
import { VisualEqualizer } from './VisualEqualizer';
import { AudioDynamicVisualizer, VisualizerMode } from './AudioDynamicVisualizer';
import { AudioBookmarksTab } from './AudioBookmarksTab';
import { audioBookmarkService } from '../services/audioBookmarkService';
import { offlineAudioService } from '../services/offlineAudioService';
import { 
  webAudioEqualizer, 
  EQUALIZER_PRESETS, 
  EQUALIZER_BANDS,
  EqualizerPresetKey 
} from '../lib/webAudioEqualizer';
import { ShuffleMode, RepeatMode } from '../services/smartShuffleService';
import { useHoldToAccelerate } from '../hooks/useHoldToAccelerate';
import { haptics } from '../utils/haptics';

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
  const [rightPanelTab, setRightPanelTab] = useState<'queue' | 'equalizer' | 'bookmarks'>('queue');
  const [displayMode, setDisplayMode] = useState<'artwork' | 'visualizer'>('artwork');
  const [currentEqPreset, setCurrentEqPreset] = useState<EqualizerPresetKey>(webAudioEqualizer.getCurrentPreset());
  const [isEqEnabled, setIsEqEnabled] = useState<boolean>(webAudioEqualizer.getIsActive());
  const [eqGains, setEqGains] = useState<number[]>(webAudioEqualizer.getCurrentGains());
  const [isEqualizerExpanded, setIsEqualizerExpanded] = useState<boolean>(false);
  const [isAuditionPlaying, setIsAuditionPlaying] = useState<boolean>(webAudioEqualizer.getIsAuditionPlaying());
  const [eqVisualMode, setEqVisualMode] = useState<'curve' | 'bars'>('curve');
  const [activeHoverBand, setActiveHoverBand] = useState<number | null>(null);
  const [activeTrackBookmarks, setActiveTrackBookmarks] = useState<AudioBookmark[]>([]);
  const [allBookmarksCount, setAllBookmarksCount] = useState<number>(0);

  const activeTrack = currentTrack || playlist[0];
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Offline Audio Playback Resolution (indexedDB blob / Cache API / network URL)
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | undefined>(activeTrack?.url);

  useEffect(() => {
    let isMounted = true;
    if (!activeTrack) {
      setResolvedAudioUrl(undefined);
      return;
    }

    offlineAudioService.getPlayableUrl(activeTrack).then((url) => {
      if (isMounted) {
        setResolvedAudioUrl(url);
      }
    }).catch(() => {
      if (isMounted) {
        setResolvedAudioUrl(activeTrack.url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTrack?.id, activeTrack?.url]);

  // Sync EQ manager state (preset, gains, active, audition)
  useEffect(() => {
    const unsubscribe = webAudioEqualizer.subscribe(() => {
      setCurrentEqPreset(webAudioEqualizer.getCurrentPreset());
      setEqGains(webAudioEqualizer.getCurrentGains());
      setIsEqEnabled(webAudioEqualizer.getIsActive());
      setIsAuditionPlaying(webAudioEqualizer.getIsAuditionPlaying());
    });
    return () => unsubscribe();
  }, []);

  // Initialize Web Audio API on the audioElement ref
  useEffect(() => {
    if (audioElementRef.current) {
      webAudioEqualizer.init(audioElementRef.current);
    }
  }, []);

  // Sync isPlaying with HTMLAudioElement
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;
    if (isPlaying && (resolvedAudioUrl || activeTrack?.url)) {
      webAudioEqualizer.resume();
      audio.play().catch(e => {
        console.warn('HTML audio play notice:', e);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, resolvedAudioUrl, activeTrack?.url]);

  // Sync volume and mute with HTMLAudioElement
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Live Canvas Visualizer for Equalizer Control Panel (Curve / Bars)
  useEffect(() => {
    if (!isEqualizerExpanded) return;
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const freqData = new Uint8Array(64);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      webAudioEqualizer.getFrequencyData(freqData);
      let hasRealAudio = false;
      for (let i = 0; i < 16; i++) {
        if (freqData[i] > 10) {
          hasRealAudio = true;
          break;
        }
      }

      phase += 0.05;

      if (eqVisualMode === 'bars') {
        const barCount = 24;
        const barWidth = (width / barCount) - 3;
        for (let i = 0; i < barCount; i++) {
          let value = 0;
          if (isPlaying || isAuditionPlaying) {
            if (hasRealAudio) {
              const dataIdx = Math.floor((i / barCount) * (freqData.length / 2));
              value = freqData[dataIdx] / 255;
            } else {
              const bandIdx = Math.min(5, Math.floor((i / barCount) * 6));
              const boost = (eqGains[bandIdx] + 12) / 24;
              const wave1 = Math.sin(phase * 1.5 + i * 0.3) * 0.3 + 0.5;
              value = Math.max(0.08, wave1 * boost * 0.85);
            }
          } else {
            value = 0.05 + Math.sin(phase * 0.5 + i * 0.2) * 0.03;
          }

          const barHeight = Math.max(4, value * (height - 14));
          const x = i * (barWidth + 3) + 2;
          const y = height - barHeight - 2;

          const grad = ctx.createLinearGradient(0, height, 0, 0);
          if (currentEqPreset === 'bass_boost') {
            grad.addColorStop(0, '#7c2d12');
            grad.addColorStop(1, '#fdba74');
          } else if (currentEqPreset === 'vocal') {
            grad.addColorStop(0, '#581c87');
            grad.addColorStop(1, '#f0abfc');
          } else if (currentEqPreset === 'acoustic') {
            grad.addColorStop(0, '#164e63');
            grad.addColorStop(1, '#67e8f9');
          } else {
            grad.addColorStop(0, '#27272a');
            grad.addColorStop(1, '#fbbf24');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else {
        // Curve mode
        const points = EQUALIZER_BANDS.map((band, idx) => {
          const px = (idx / (EQUALIZER_BANDS.length - 1)) * (width - 40) + 20;
          const gain = isEqEnabled ? (eqGains[idx] || 0) : 0;
          const py = height / 2 - (gain / 12) * (height * 0.38);
          return { x: px, y: py, gain, label: band.label };
        });

        // Center 0dB baseline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(10, height / 2);
        ctx.lineTo(width - 10, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Smooth curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        const curveGrad = ctx.createLinearGradient(0, 0, width, 0);
        if (currentEqPreset === 'bass_boost') {
          curveGrad.addColorStop(0, '#f97316');
          curveGrad.addColorStop(0.5, '#fb923c');
          curveGrad.addColorStop(1, '#fdba74');
        } else if (currentEqPreset === 'vocal') {
          curveGrad.addColorStop(0, '#c084fc');
          curveGrad.addColorStop(0.5, '#a855f7');
          curveGrad.addColorStop(1, '#e879f9');
        } else if (currentEqPreset === 'acoustic') {
          curveGrad.addColorStop(0, '#22d3ee');
          curveGrad.addColorStop(0.5, '#06b6d4');
          curveGrad.addColorStop(1, '#67e8f9');
        } else {
          curveGrad.addColorStop(0, '#f59e0b');
          curveGrad.addColorStop(0.5, '#fbbf24');
          curveGrad.addColorStop(1, '#38bdf8');
        }

        ctx.strokeStyle = isEqEnabled ? curveGrad : 'rgba(161, 161, 170, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Band Node Dots
        points.forEach((p, idx) => {
          ctx.fillStyle = idx === activeHoverBand ? '#ffffff' : (isEqEnabled ? '#f59e0b' : '#71717a');
          ctx.beginPath();
          ctx.arc(p.x, p.y, idx === activeHoverBand ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isEqualizerExpanded, eqVisualMode, isPlaying, isAuditionPlaying, isEqEnabled, eqGains, currentEqPreset, activeHoverBand]);

  // Sync audio bookmarks for active track and total count
  useEffect(() => {
    const updateBookmarks = () => {
      if (activeTrack) {
        setActiveTrackBookmarks(audioBookmarkService.getForTrack(activeTrack.id));
      } else {
        setActiveTrackBookmarks([]);
      }
      setAllBookmarksCount(audioBookmarkService.getAll().length);
    };
    updateBookmarks();
    const unsubscribe = audioBookmarkService.subscribe(updateBookmarks);
    return () => unsubscribe();
  }, [activeTrack?.id]);

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

  // Keep live refs for volume & mute state to avoid stale closures in hold callbacks
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Decrease volume with hold-to-accelerate
  const decreaseVolumeController = useHoldToAccelerate({
    onStep: (stepMultiplier) => {
      const currentVol = isMutedRef.current ? 0 : volumeRef.current;
      // Base step is 0.02 (2%). Multiplier scales up dynamically: 1.0 -> 1.8 -> 2.5 -> 3.8
      const stepDelta = 0.02 * stepMultiplier;
      const nextVol = Math.max(0, Math.round((currentVol - stepDelta) * 100) / 100);
      
      onVolumeChange(nextVol);
      
      if (nextVol === 0 && currentVol > 0) {
        haptics.threshold();
      }
    },
    disabled: volume === 0 && !isMuted,
  });

  // Increase volume with hold-to-accelerate
  const increaseVolumeController = useHoldToAccelerate({
    onStep: (stepMultiplier) => {
      const currentVol = isMutedRef.current ? 0 : volumeRef.current;
      // If currently muted, automatically unmute when pressing increase
      if (isMutedRef.current && onToggleMute) {
        onToggleMute();
      }
      const stepDelta = 0.02 * stepMultiplier;
      const nextVol = Math.min(1, Math.round((currentVol + stepDelta) * 100) / 100);
      
      onVolumeChange(nextVol);
      
      if (nextVol === 1 && currentVol < 1) {
        haptics.threshold();
      }
    },
    disabled: volume >= 1 && !isMuted,
  });

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
      {/* Hidden Audio Element connected to Web Audio DSP Pipeline */}
      <audio
        ref={audioElementRef}
        src={resolvedAudioUrl || activeTrack?.url}
        crossOrigin={resolvedAudioUrl?.startsWith('blob:') ? undefined : "anonymous"}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioElementRef.current && !isNaN(audioElementRef.current.currentTime)) {
            onSeek(audioElementRef.current.currentTime);
          }
        }}
        onEnded={() => {
          if (onPlayNext) onPlayNext();
        }}
      />

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

        {/* Progress Bar with Bookmark Markers */}
        <div className="mb-4 px-1">
          <div className="relative">
            <input
              id="audio-progress-bar"
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white relative z-10"
            />
            {/* Visual Bookmark Indicators on Timeline */}
            {duration > 0 && activeTrackBookmarks.length > 0 && (
              <div className="absolute inset-0 pointer-events-none z-20 flex items-center">
                {activeTrackBookmarks.map((bm) => {
                  const percent = Math.min(99.5, Math.max(0.5, (bm.timestamp / duration) * 100));
                  return (
                    <div
                      key={bm.id}
                      style={{ left: `${percent}%` }}
                      className="absolute -translate-x-1/2 w-2 h-2.5 bg-amber-400 border border-black rounded-sm shadow-sm"
                      title={`${bm.label} (${formatTime(bm.timestamp)})`}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500 font-medium font-mono">
            <span>{formatTime(progress)}</span>

            <button
              type="button"
              id="player-quick-bookmark-btn"
              onClick={() => {
                if (activeTrack) {
                  audioBookmarkService.add({
                    trackId: activeTrack.id,
                    trackTitle: activeTrack.title,
                    trackArtist: activeTrack.artist,
                    trackCoverUrl: activeTrack.coverUrl,
                    timestamp: Math.floor(progress),
                    label: `Mốc ${formatTime(progress)}`,
                    color: 'amber',
                  });
                  setRightPanelTab('bookmarks');
                }
              }}
              className="flex items-center gap-1.5 text-[11px] font-sans text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded-lg hover:bg-amber-500/10 transition-all cursor-pointer border border-transparent hover:border-amber-500/30"
              title="Lưu mốc thời gian này vào danh sách Bookmarks"
            >
              <BookmarkPlus size={13} className="text-amber-400" />
              <span>+ Đánh dấu mốc</span>
            </button>

            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Equalizer Control Panel (Web Audio API) */}
        <div 
          id="audio-player-equalizer-panel"
          className="mb-5 bg-zinc-950/90 border border-zinc-800 rounded-3xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden transition-all"
        >
          {/* Top Header: Title, Active Preset Badge, Audition & Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                <Sliders size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                    Equalizer Web Audio DSP
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
                    EQUALIZER_PRESETS[currentEqPreset]?.badgeBg || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    <Activity size={10} className="animate-pulse" />
                    <span>{EQUALIZER_PRESETS[currentEqPreset]?.name}</span>
                  </span>
                  {isEqEnabled && (
                    <span className="text-[9px] text-zinc-400 font-mono hidden md:inline">
                      • 48kHz / 32-bit Float
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate max-w-[280px] sm:max-w-md">
                  {isEqEnabled 
                    ? EQUALIZER_PRESETS[currentEqPreset]?.subtitle 
                    : 'Bộ lọc âm thanh đang tạm ngắt (DSP Bypass)'}
                </p>
              </div>
            </div>

            {/* Quick Actions: Audition, Power, Expand/Collapse */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Audition Sample Preview Button */}
              <button
                type="button"
                id="player-eq-audition-btn"
                onClick={() => {
                  webAudioEqualizer.playAuditionSample();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isAuditionPlaying
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md animate-pulse'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
                title="Phát chuỗi âm thanh mẫu Web Audio để nghe thử hiệu ứng của bộ Equalizer"
              >
                <Volume2 size={12} className={isAuditionPlaying ? 'animate-bounce text-black' : 'text-amber-400'} />
                <span>{isAuditionPlaying ? 'Đang thử...' : 'Nghe thử EQ'}</span>
              </button>

              {/* Master Power Toggle */}
              <button
                type="button"
                id="player-eq-power-btn"
                onClick={() => {
                  webAudioEqualizer.setEnabled(!isEqEnabled);
                  webAudioEqualizer.resume();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isEqEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
                title={isEqEnabled ? 'Tắt DSP (Bypass)' : 'Bật DSP Equalizer'}
              >
                <Power size={11} className={isEqEnabled ? 'text-emerald-400' : 'text-zinc-500'} />
                <span>{isEqEnabled ? 'ON' : 'BYPASS'}</span>
              </button>

              {/* Expand / Collapse Control Panel Button */}
              <button
                type="button"
                id="player-eq-toggle-expand-btn"
                onClick={() => setIsEqualizerExpanded(!isEqualizerExpanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                title={isEqualizerExpanded ? "Thu gọn bảng điều khiển" : "Mở rộng bảng chỉnh EQ chi tiết"}
              >
                <span>{isEqualizerExpanded ? "Thu gọn" : "Chỉnh chi tiết"}</span>
                {isEqualizerExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Featured Presets: Bass Boost, Vocal Clarity, Acoustic (Always visible) */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Chế độ âm sắc đặc trưng (DSP Presets)</span>
              </span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">
                Chuyển tức thì qua Web Audio API BiquadFilters
              </span>
            </div>

            {/* 3 Prominent Hero Preset Cards: Bass Boost, Vocal Clarity, Acoustic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Preset 1: Bass Boost */}
              <button
                type="button"
                id="eq-hero-btn-bass-boost"
                onClick={() => {
                  webAudioEqualizer.setPreset('bass_boost');
                  webAudioEqualizer.resume();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between gap-1.5 ${
                  currentEqPreset === 'bass_boost'
                    ? 'bg-gradient-to-br from-orange-950/60 via-zinc-900 to-zinc-950 border-orange-500/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm">
                      <Flame size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>Bass Boost</span>
                        {currentEqPreset === 'bass_boost' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-orange-400/90 font-mono">
                        +9dB (60Hz) • +6dB (150Hz)
                      </div>
                    </div>
                  </div>
                  {currentEqPreset === 'bass_boost' && (
                    <Check size={14} className="text-orange-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  Khuếch đại dải siêu trầm uy lực, âm bass sâu chắc & rung động
                </p>
                <div className="text-[9px] font-semibold text-orange-300/80 bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-900/40 self-start">
                  ⚡ EDM • Hip-Hop • Dance
                </div>
              </button>

              {/* Preset 2: Vocal Clarity */}
              <button
                type="button"
                id="eq-hero-btn-vocal"
                onClick={() => {
                  webAudioEqualizer.setPreset('vocal');
                  webAudioEqualizer.resume();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between gap-1.5 ${
                  currentEqPreset === 'vocal'
                    ? 'bg-gradient-to-br from-purple-950/60 via-zinc-900 to-zinc-950 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm">
                      <Mic size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>Vocal Clarity</span>
                        {currentEqPreset === 'vocal' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-purple-400/90 font-mono">
                        +7dB (1kHz) • +5dB (3.5kHz)
                      </div>
                    </div>
                  </div>
                  {currentEqPreset === 'vocal' && (
                    <Check size={14} className="text-purple-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  Tôn giọng hát ca sĩ & lời thoại rõ nét, cắt nhẹ trầm chống ù
                </p>
                <div className="text-[9px] font-semibold text-purple-300/80 bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-900/40 self-start">
                  🎙️ Podcast • Pop • Sách nói
                </div>
              </button>

              {/* Preset 3: Acoustic */}
              <button
                type="button"
                id="eq-hero-btn-acoustic"
                onClick={() => {
                  webAudioEqualizer.setPreset('acoustic');
                  webAudioEqualizer.resume();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between gap-1.5 ${
                  currentEqPreset === 'acoustic'
                    ? 'bg-gradient-to-br from-cyan-950/60 via-zinc-900 to-zinc-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm">
                      <Music size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>Acoustic</span>
                        {currentEqPreset === 'acoustic' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-cyan-400/90 font-mono">
                        +6dB (3.5kHz) • +8dB (10kHz)
                      </div>
                    </div>
                  </div>
                  {currentEqPreset === 'acoustic' && (
                    <Check size={14} className="text-cyan-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  Trong trẻo mộc mạc, nổi bật tiếng đàn guitar, piano & dây
                </p>
                <div className="text-[9px] font-semibold text-cyan-300/80 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-900/40 self-start">
                  🎸 Guitar • Piano • Indie
                </div>
              </button>
            </div>

            {/* Secondary Preset Pills: Flat, Electronic, Rock, Custom */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0 mr-1">
                Khác:
              </span>
              {[
                { key: 'flat', label: 'Flat (0dB)', icon: Equal, color: 'text-zinc-400' },
                { key: 'electronic', label: 'Electronic', icon: Zap, color: 'text-pink-400' },
                { key: 'rock', label: 'Rock', icon: Radio, color: 'text-yellow-400' },
                { key: 'custom', label: 'Tùy chỉnh', icon: Sliders, color: 'text-blue-400' },
              ].map(({ key, label, icon: Icon, color }) => {
                const isSelected = currentEqPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      webAudioEqualizer.setPreset(key as EqualizerPresetKey);
                      webAudioEqualizer.resume();
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <Icon size={12} className={isSelected ? 'text-amber-400' : color} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded Section: Visualizer Canvas & 6-Band Frequency Sliders */}
          {isEqualizerExpanded && (
            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col gap-4 animate-in fade-in duration-200">
              {/* Visualizer Canvas Card */}
              <div className="bg-zinc-950 rounded-2xl border border-zinc-800/90 p-3 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-amber-400" />
                    <span className="text-xs font-bold text-zinc-300">
                      Đáp tuyến tần số DSP Web Audio
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setEqVisualMode('curve')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        eqVisualMode === 'curve' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Đường cong
                    </button>
                    <button
                      type="button"
                      onClick={() => setEqVisualMode('bars')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        eqVisualMode === 'bars' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Phổ tần số
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-20 bg-black/60 rounded-xl overflow-hidden border border-zinc-800/60">
                  <canvas
                    ref={eqCanvasRef}
                    width={520}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-2.5 text-[9px] font-mono text-zinc-500 pointer-events-none">
                    -12 dB ~ +12 dB • Real-Time DSP Filtering
                  </div>
                </div>
              </div>

              {/* 6-Band Graphic Equalizer Faders */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <Sliders size={13} className="text-amber-400" />
                    <span>6 Dải tần số chi tiết (Graphic Equalizer Faders)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      webAudioEqualizer.resetToFlat();
                      webAudioEqualizer.resume();
                    }}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
                    title="Đặt lại tất cả về 0 dB"
                  >
                    <RotateCcw size={11} />
                    <span>Đặt lại (0dB)</span>
                  </button>
                </div>

                {/* 6 Sliders Grid */}
                <div className="grid grid-cols-6 gap-1.5 sm:gap-3 pt-1">
                  {EQUALIZER_BANDS.map((band, idx) => {
                    const gain = eqGains[idx] || 0;
                    const isBoosted = gain > 0;
                    const isCut = gain < 0;

                    return (
                      <div
                        key={band.freq}
                        className="flex flex-col items-center gap-2 group"
                        onMouseEnter={() => setActiveHoverBand(idx)}
                        onMouseLeave={() => setActiveHoverBand(null)}
                      >
                        {/* dB Pill */}
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isBoosted
                            ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                            : isCut
                            ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30'
                            : 'text-zinc-400 bg-zinc-800 border border-zinc-700'
                        }`}>
                          {gain > 0 ? `+${gain}` : `${gain}`} dB
                        </span>

                        {/* Slider Track */}
                        <div className="relative h-24 sm:h-28 flex items-center justify-center w-full py-1">
                          <div className="absolute w-full h-[1px] bg-zinc-700/60 pointer-events-none top-1/2 -translate-y-1/2" />
                          <input
                            id={`player-eq-fader-${idx}`}
                            type="range"
                            min={-12}
                            max={12}
                            step={1}
                            value={gain}
                            disabled={!isEqEnabled}
                            onChange={(e) => {
                              webAudioEqualizer.setBandGain(idx, Number(e.target.value));
                              webAudioEqualizer.resume();
                            }}
                            className="w-20 sm:w-24 -rotate-90 origin-center bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-md disabled:opacity-40"
                          />
                        </div>

                        {/* Label & Description */}
                        <div className="text-center">
                          <div className="text-xs font-bold text-zinc-200">
                            {band.label}
                          </div>
                          <div className="text-[9px] text-zinc-500 truncate max-w-[42px] sm:max-w-none">
                            {band.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Profile Info Banner */}
              {EQUALIZER_PRESETS[currentEqPreset] && (
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-amber-400 shrink-0" />
                    <span className="text-zinc-300">
                      {EQUALIZER_PRESETS[currentEqPreset].description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => webAudioEqualizer.playAuditionSample()}
                    className="shrink-0 px-2.5 py-1 rounded-xl font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 size={12} />
                    <span>Nghe thử</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
          {/* Volume Control Station with Hold-to-Accelerate */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              id="volume-mute-btn"
              onClick={() => {
                haptics.selection();
                onToggleMute();
              }} 
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800/60 cursor-pointer"
              aria-label={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
              title={isMuted ? "Bật âm thanh" : "Tắt tiếng (Mute)"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} className="text-zinc-500" />
              ) : volume < 0.5 ? (
                <Volume1 size={18} className="text-zinc-300" />
              ) : (
                <Volume2 size={18} className="text-zinc-300" />
              )}
            </button>

            {/* Hold to Decrease Volume Button */}
            <button
              type="button"
              id="audio-player-volume-decrease-btn"
              {...decreaseVolumeController.bind}
              disabled={volume === 0 && !isMuted}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer select-none border ${
                decreaseVolumeController.isHolding
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 scale-95 shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/60 active:scale-95 disabled:opacity-30 disabled:pointer-events-none'
              }`}
              title="Giảm âm lượng (Nhấn giữ để tăng tốc độ giảm)"
              aria-label="Giảm âm lượng (nhấn giữ để tự động tăng tốc)"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>

            {/* Volume Slider with dynamic track progress */}
            <div className="relative flex items-center">
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-18 sm:w-24 md:w-28 h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-115 transition-all"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(isMuted ? 0 : volume) * 100}%, #3f3f46 ${(isMuted ? 0 : volume) * 100}%, #3f3f46 100%)`
                }}
                aria-label="Thanh trượt âm lượng"
              />
            </div>

            {/* Hold to Increase Volume Button */}
            <button
              type="button"
              id="audio-player-volume-increase-btn"
              {...increaseVolumeController.bind}
              disabled={volume >= 1 && !isMuted}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer select-none border ${
                increaseVolumeController.isHolding
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 scale-95 shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border-zinc-700/60 active:scale-95 disabled:opacity-30 disabled:pointer-events-none'
              }`}
              title="Tăng âm lượng (Nhấn giữ để tăng tốc độ tăng)"
              aria-label="Tăng âm lượng (nhấn giữ để tự động tăng tốc)"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>

            {/* Numerical Volume Indicator & Speed Level Badge */}
            <div className="flex items-center gap-1 font-mono text-xs text-zinc-400 min-w-[46px]">
              <span className={`font-bold transition-colors ${
                decreaseVolumeController.isHolding || increaseVolumeController.isHolding ? 'text-amber-300' : 'text-zinc-300'
              }`}>
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>

              {(decreaseVolumeController.isHolding || increaseVolumeController.isHolding) && (
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                  {decreaseVolumeController.isHolding ? `${decreaseVolumeController.speedLevel}x` : `${increaseVolumeController.speedLevel}x`}
                </span>
              )}
            </div>
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

            <button
              type="button"
              id="player-tab-bookmarks-btn"
              onClick={() => setRightPanelTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightPanelTab === 'bookmarks'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark size={14} className={rightPanelTab === 'bookmarks' ? 'text-amber-400' : 'text-zinc-500'} />
              <span>Bookmarks</span>
              {activeTrackBookmarks.length > 0 ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                  {activeTrackBookmarks.length}
                </span>
              ) : allBookmarksCount > 0 ? (
                <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                  {allBookmarksCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {rightPanelTab === 'equalizer' ? (
              <span className="text-[11px] text-zinc-400 font-medium">
                Real-time Web Audio
              </span>
            ) : rightPanelTab === 'bookmarks' ? (
              <span className="text-xs text-amber-400/90 font-medium font-mono">
                {activeTrackBookmarks.length} mốc bài này
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-medium font-mono">
                {filteredPlaylist.length} bản nhạc
              </span>
            )}
          </div>
        </div>

        {rightPanelTab === 'bookmarks' ? (
          /* Bookmarks View */
          <AudioBookmarksTab
            currentTrack={activeTrack}
            playlist={playlist}
            progress={progress}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={onSeek}
            onSelectTrack={onSelectTrack}
            onTogglePlay={onTogglePlay}
          />
        ) : rightPanelTab === 'equalizer' ? (
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
