import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Headphones,
  Bell,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  HeartHandshake
} from 'lucide-react';
import { VoiceCommandMatch } from '../utils/voiceNavigation';
import { 
  analyzeVocalTone, 
  VocalToneType, 
  VocalToneAnalysisResult,
  VOCAL_TONE_PROFILES,
  WebAudioToneSensor,
  AcousticMetrics
} from '../utils/vocalToneAnalyzer';
import { spiritualAudio } from '../utils/spiritualAudioSynthesizer';
import { haptics } from '../utils/haptics';
import { Track } from '../types';

interface HaevyVoiceNavigationHUDProps {
  isListening: boolean;
  transcript: string;
  lastMatchedCommand: VoiceCommandMatch | null;
  errorMessage: string | null;
  onToggleListening: () => void;
  onSelectSuggestion?: (command: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onSelectPlaylist?: (genre: string, playlistTitle: string) => void;
  onPlayTrack?: (track: Track) => void;
  onDismiss?: () => void;
  tracks?: Track[];
}

const VOICE_SUGGESTIONS = [
  'Đi đến Haevy Finance',
  'Mở phòng thu',
  'Mở Tử Vi 2026',
  'Mở Bói Tarot 3D',
  'Mở I Love Haevy',
  'Mở Haevy AI',
  'Mở Tin Nhắn',
  'Mở Kho Audio'
];

const TONE_FILTER_PILLS: { tone: VocalToneType; label: string; icon: string }[] = [
  { tone: 'stress_fatigue', label: 'Căng thẳng / Mệt', icon: '🌿' },
  { tone: 'calm_serene', label: 'Bình an / Thư thái', icon: '🕊️' },
  { tone: 'deep_focus', label: 'Tập trung sâu', icon: '🧠' },
  { tone: 'energetic_joyful', label: 'Hào hứng / Sôi nổi', icon: '⚡' },
  { tone: 'romantic_tender', label: 'Ngọt ngào / Tình cảm', icon: '💖' },
  { tone: 'mystical_meditative', label: 'Tâm linh / Huyền bí', icon: '🔮' },
];

/**
 * Visual Real-Time "Listening" Animation Indicator Component
 * Provides clear, responsive audio feedback with 24 dynamic soundwave EQ spectrum bars,
 * acoustic decibel levels, speech detection badges, and concentric radar pulses.
 */
interface VoiceListeningVisualizerProps {
  isListening: boolean;
  transcript: string;
  acousticMetrics: AcousticMetrics;
  lastMatchedCommand: VoiceCommandMatch | null;
  errorMessage: string | null;
}

function VoiceListeningVisualizer({
  isListening,
  transcript,
  acousticMetrics,
  lastMatchedCommand,
  errorMessage
}: VoiceListeningVisualizerProps) {
  // 24 Equalizer Bars with varying harmonic base height factors
  const barBaseFactors = useMemo(() => [
    0.25, 0.35, 0.5, 0.7, 0.85, 0.95, 1.0, 0.9, 0.75, 0.6, 0.4, 0.3,
    0.3, 0.45, 0.65, 0.8, 0.95, 1.0, 0.9, 0.75, 0.55, 0.4, 0.3, 0.2
  ], []);

  const isSpeaking = isListening && (acousticMetrics.energyPercent > 18 || transcript.length > 0);

  return (
    <div
      id="voice_hud_listening_visualizer"
      className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isListening
          ? 'bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950 border-amber-500/50 shadow-xl shadow-amber-500/15 ring-1 ring-amber-400/30'
          : 'bg-zinc-900/70 border-zinc-800'
      }`}
    >
      {/* Background listening radar aura */}
      {isListening && (
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
      )}

      {/* Visualizer Status & Telemetry Header */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          {isListening ? (
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/30 animate-pulse-ring" />
              <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400/50 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-400/50" />
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isListening ? (isSpeaking ? 'text-amber-300' : 'text-emerald-300') : 'text-zinc-400'
              }`}
            >
              {isListening
                ? isSpeaking
                  ? 'Đang Nhận Tín Hiệu Giọng Nói'
                  : 'Đang Lắng Nghe Trực Tiếp...'
                : 'Microphone Tắt'}
            </span>
            {isListening && isSpeaking && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[9.5px] font-bold text-amber-300 animate-pulse flex items-center gap-1">
                <Radio size={10} className="text-amber-400 animate-spin" />
                <span>Âm Sắc Hoạt Động</span>
              </span>
            )}
            {isListening && !isSpeaking && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[9.5px] font-bold text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Sẵn Sàng Tiếp Nhận</span>
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Acoustic Readout */}
        {isListening ? (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span
              className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              <Activity
                size={11}
                className={isSpeaking ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}
              />
              {acousticMetrics.energyPercent}% Vol
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hidden sm:inline-block">
              {acousticMetrics.pitchHz} Hz
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-500 italic">Nhấn Micro để bật</span>
        )}
      </div>

      {/* Real-Time Dynamic Soundwave Spectrum (24 Animated Equalizer Bars) */}
      <div className="h-12 sm:h-14 w-full px-2 py-1 flex items-end justify-between gap-1 sm:gap-1.5 bg-black/60 rounded-xl border border-zinc-800/80 overflow-hidden relative">
        {/* Subtle dynamic background ambient reflection */}
        {isListening && (
          <div
            className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 pointer-events-none ${
              isSpeaking
                ? 'from-amber-500/20 via-emerald-500/15 to-transparent opacity-100'
                : 'from-emerald-500/10 to-transparent opacity-50'
            }`}
          />
        )}

        {barBaseFactors.map((baseFactor, idx) => {
          // Dynamic height calculated from microphone acoustic volume & energy
          const energyMultiplier = isListening
            ? Math.min(2.0, Math.max(0.3, acousticMetrics.energyPercent / 45))
            : 0.15;
          const calculatedHeightPct = isListening
            ? Math.min(100, Math.max(16, baseFactor * energyMultiplier * 100))
            : 10;

          const animDelay = `${((idx % 12) * 0.07).toFixed(2)}s`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col justify-end items-center h-full z-10"
            >
              <div
                className={`w-full max-w-[7px] rounded-full transition-all duration-100 ${
                  isListening
                    ? isSpeaking
                      ? 'animate-soundwave-bar bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'animate-soundwave-bar bg-gradient-to-t from-teal-600 via-emerald-400 to-cyan-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                    : 'bg-zinc-700/60'
                }`}
                style={{
                  height: `${calculatedHeightPct}%`,
                  animationDelay: animDelay,
                  animationDuration: isSpeaking ? '0.6s' : '1.1s'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Sub-line: Live Transcript or Status Prompt */}
      <div className="mt-2 px-0.5 min-w-0">
        {errorMessage ? (
          <div className="flex items-center gap-1.5 text-rose-300 text-xs">
            <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
        ) : lastMatchedCommand ? (
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-white truncate">"{transcript}"</span>
              <span className="text-emerald-300 truncate hidden sm:inline">• {lastMatchedCommand.feedbackText}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-300 shrink-0">
              {lastMatchedCommand.label}
            </span>
          </div>
        ) : transcript ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 shrink-0 text-[11px]">Đang nghe:</span>
            <p className="font-bold text-amber-300 truncate bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 flex-1">
              "{transcript}"
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span className="truncate italic">
              {isListening
                ? 'Hãy nói điều bạn muốn (ví dụ: "Mở Bói Tarot", "Tôi thấy mệt mỏi", "Mở Haevy Finance")...'
                : 'Bật Micro hoặc chạm các khẩu lệnh bên dưới để điều khiển.'}
            </span>
            {isListening && (
              <span className="text-[10px] font-semibold text-emerald-400/90 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Mic Sẵn Sàng
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function HaevyVoiceNavigationHUD({
  isListening,
  transcript,
  lastMatchedCommand,
  errorMessage,
  onToggleListening,
  onSelectSuggestion,
  onNavigateToMode,
  onSelectPlaylist,
  onPlayTrack,
  onDismiss,
  tracks = []
}: HaevyVoiceNavigationHUDProps) {
  // Dismissed state so user can always close the HUD cleanly without being trapped
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state whenever user activates voice or speaks
  useEffect(() => {
    if (isListening || transcript) {
      setIsDismissed(false);
    }
  }, [isListening, transcript]);

  // Real-time acoustic metrics from mic stream
  const [acousticMetrics, setAcousticMetrics] = useState<AcousticMetrics>({
    pitchHz: 175,
    rmsVolume: 0.05,
    energyPercent: 45,
    stabilityScore: 75
  });

  // Manual tone override (for instant testing and preview)
  const [manualToneOverride, setManualToneOverride] = useState<VocalToneType | null>(null);

  // Solfeggio playback state inside HUD
  const [activePlayingFreq, setActivePlayingFreq] = useState<number | null>(null);

  // Expand / collapse details panel (default collapsed on mobile screens to prevent blocking view)
  const [isTonePanelExpanded, setIsTonePanelExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return false;
    }
    return true;
  });

  // Toast feedback state inside HUD
  const [hudFeedback, setHudFeedback] = useState<string | null>(null);

  // Web Audio sensor ref
  const audioSensorRef = useRef<WebAudioToneSensor | null>(null);

  // Listen to microphone audio stream for real-time acoustic pitch/energy analysis
  useEffect(() => {
    let micStream: MediaStream | null = null;

    if (isListening) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then((stream) => {
            micStream = stream;
            const sensor = new WebAudioToneSensor();
            audioSensorRef.current = sensor;
            sensor.start(stream, (metrics) => {
              setAcousticMetrics(metrics);
            });
          })
          .catch((err) => {
            console.warn('Microphone acoustic analysis fallback (speech text only):', err);
          });
      }
    } else {
      if (audioSensorRef.current) {
        audioSensorRef.current.stop();
        audioSensorRef.current = null;
      }
    }

    return () => {
      if (audioSensorRef.current) {
        audioSensorRef.current.stop();
        audioSensorRef.current = null;
      }
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isListening]);

  // Compute detected vocal tone from either manual selection, transcript NLP, or acoustic signals
  const detectedToneResult: VocalToneAnalysisResult = useMemo(() => {
    if (manualToneOverride) {
      const base = VOCAL_TONE_PROFILES[manualToneOverride];
      return {
        ...base,
        confidence: 96,
        estimatedPitchHz: acousticMetrics.pitchHz || 175,
        energyLevel: base.energyLevel
      };
    }
    return analyzeVocalTone(transcript, acousticMetrics);
  }, [manualToneOverride, transcript, acousticMetrics]);

  // Auto-clear HUD toast feedback
  useEffect(() => {
    if (hudFeedback) {
      const timer = setTimeout(() => setHudFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [hudFeedback]);

  // Handle Play/Stop Solfeggio soundscape directly
  const handleToggleSolfeggioTone = (frequencyHz: number, title: string) => {
    haptics.impact('medium');
    if (activePlayingFreq === frequencyHz) {
      spiritualAudio.stopSolfeggioTone();
      setActivePlayingFreq(null);
      setHudFeedback(`⏹️ Đã dừng sóng âm ${frequencyHz} Hz`);
    } else {
      spiritualAudio.startSolfeggioTone(frequencyHz, 0.35);
      setActivePlayingFreq(frequencyHz);
      setHudFeedback(`🎵 Đang phát sóng âm chữa lành ${frequencyHz} Hz (${title})`);
    }
  };

  // Handle Tibetan singing bowl strike
  const handleStrikeSingingBowl = (frequencyHz: number) => {
    haptics.impact('heavy');
    spiritualAudio.playSingingBowl(frequencyHz);
    setHudFeedback(`🔔 Tiếng chuông xoay Tây Tạng ngân vang (${frequencyHz} Hz)`);
  };

  // Handle Play Playlist
  const handleOpenSuggestedPlaylist = (genre: string, playlistTitle: string) => {
    haptics.impact('light');
    if (onSelectPlaylist) {
      onSelectPlaylist(genre, playlistTitle);
    } else if (onNavigateToMode) {
      onNavigateToMode('audio');
    }

    // If matching tracks exist, play first one
    if (onPlayTrack && tracks.length > 0) {
      const matched = tracks.find(t => t.genre?.toLowerCase() === genre.toLowerCase()) || tracks[0];
      if (matched) {
        onPlayTrack(matched);
      }
    }
    setHudFeedback(`🎶 Đang mở Playlist: "${playlistTitle}" (${genre})`);
  };

  // Handle navigate to spiritual soundscapes mode
  const handleOpenSpiritualSoundscapes = () => {
    haptics.impact('light');
    if (onNavigateToMode) {
      onNavigateToMode('spiritual', 'soundscapes');
    }
    setHudFeedback(`🔮 Chuyển tới Không Gian Sóng Âm Solfeggio`);
  };

  // Do not render if explicitly dismissed by user and not currently listening
  if (isDismissed && !isListening) {
    return null;
  }

  if (!isListening && !lastMatchedCommand && !errorMessage && !manualToneOverride) {
    return null;
  }

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-2.5 sm:px-4 animate-fadeIn pointer-events-none">
      <div className={`pointer-events-auto bg-zinc-950/95 backdrop-blur-2xl border rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl ring-1 ring-white/10 text-white space-y-3 max-h-[85vh] overflow-y-auto scrollbar-none transition-all duration-300 ${
        isListening
          ? 'border-amber-500/60 shadow-amber-500/25 ring-amber-400/30 animate-listening-aura'
          : 'border-zinc-800/90 shadow-black/80'
      }`}>
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-zinc-950 shadow-lg shadow-amber-500/40 shrink-0">
              <Mic className={`w-4 h-4 text-zinc-950 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening && (
                <>
                  <span className="absolute -inset-1 rounded-xl border border-amber-400/80 animate-radar-ping pointer-events-none" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400" />
                </>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-amber-300 truncate">
                  Haevy Voice HUD & Nhận Diện Âm Sắc
                </span>
                {isListening ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-[10px] font-black text-emerald-300 flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    Đã dừng
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-zinc-400 truncate">
                AI tự động phân tích tần số giọng nói & gợi ý Playlist / Sóng âm tâm linh phù hợp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Tone Panel Expand / Collapse */}
            <button
              id="voice_hud_toggle_tone_panel_btn"
              type="button"
              onClick={() => setIsTonePanelExpanded(!isTonePanelExpanded)}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-all cursor-pointer text-xs flex items-center gap-1"
              title={isTonePanelExpanded ? 'Thu gọn đề xuất' : 'Mở rộng đề xuất'}
            >
              {isTonePanelExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {/* Mic Toggle Button */}
            <button
              id="voice_hud_toggle_mic_btn"
              type="button"
              onClick={onToggleListening}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/40'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/40'
              }`}
              title={isListening ? 'Tắt Micro' : 'Bật Micro'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              id="voice_hud_close_btn"
              type="button"
              onClick={() => {
                if (onDismiss) onDismiss();
                if (isListening) onToggleListening();
                if (activePlayingFreq) spiritualAudio.stopSolfeggioTone();
                setActivePlayingFreq(null);
                setManualToneOverride(null);
                setIsDismissed(true);
              }}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Đóng bảng điều khiển"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* HUD Notification Toast */}
        {hudFeedback && (
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{hudFeedback}</span>
          </div>
        )}

        {/* Visual Real-Time "Listening" Animation Indicator & Live Audio Spectrum */}
        <VoiceListeningVisualizer
          isListening={isListening}
          transcript={transcript}
          acousticMetrics={acousticMetrics}
          lastMatchedCommand={lastMatchedCommand}
          errorMessage={errorMessage}
        />

        {/* ========================================================================= */}
        {/* 🎯 VOCAL TONE & EMOTION DETECTION TELEMETRY CARD                          */}
        {/* ========================================================================= */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 space-y-2.5">
          {/* Header & Metrics */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">
                {detectedToneResult.emoji}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    Âm Sắc Giọng Nói:
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {detectedToneResult.toneLabel}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  {detectedToneResult.badge}
                </div>
              </div>
            </div>

            {/* Acoustic Metrics Badges */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 font-mono flex items-center gap-1">
                <Activity size={11} className="text-amber-400" />
                {detectedToneResult.estimatedPitchHz} Hz
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 font-mono">
                Năng lượng: {acousticMetrics.energyPercent}%
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                {detectedToneResult.confidence}% Tin cậy
              </span>
            </div>
          </div>

          {/* Emotional Analysis Description */}
          <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/30 p-2 rounded-xl border border-zinc-800/50">
            {detectedToneResult.moodDescription}
          </p>

          {/* Quick Vocal Tone Simulator Chips (Allow direct 1-click test of all 6 tones) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>Thử nghiệm âm sắc & tâm trạng khác:</span>
              {manualToneOverride && (
                <button
                  type="button"
                  onClick={() => setManualToneOverride(null)}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Quay lại tự động nhận diện
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TONE_FILTER_PILLS.map((pill) => {
                const isActive = (manualToneOverride || detectedToneResult.tone) === pill.tone;
                return (
                  <button
                    key={pill.tone}
                    type="button"
                    onClick={() => {
                      haptics.impact('light');
                      setManualToneOverride(pill.tone);
                      setHudFeedback(`Đã chuyển sang mẫu âm sắc: ${pill.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30'
                        : 'bg-zinc-900/90 hover:bg-zinc-800/90 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{pill.icon}</span>
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 🎼 DUAL RECOMMENDATIONS: 1 HAEVY PLAYLIST + 1 SPIRITUAL SOUNDSCAPE    */}
          {/* ===================================================================== */}
          {isTonePanelExpanded && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold">
                <span className="flex items-center gap-1 text-amber-300 uppercase tracking-wider text-[10px]">
                  <Sparkles size={12} /> Đề Xuất Tự Động Phù Hợp Tần Số
                </span>
                <span className="text-[10px] text-zinc-400">1 Audio Playlist + 1 Âm Thanh Tâm Linh</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. SUGGESTED HAEVY AUDIO PLAYLIST */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[10px] flex items-center gap-1">
                        <Music size={10} /> Haevy Audio Playlist
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {detectedToneResult.suggestedPlaylist.genre}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <img 
                        src={detectedToneResult.suggestedPlaylist.coverUrl} 
                        alt={detectedToneResult.suggestedPlaylist.title}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-700/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white truncate">
                          {detectedToneResult.suggestedPlaylist.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                          {detectedToneResult.suggestedPlaylist.description}
                        </p>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-amber-300/90 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 italic">
                      💡 {detectedToneResult.suggestedPlaylist.reason}
                    </p>
                  </div>

                  <button
                    id="hud_open_suggested_playlist_btn"
                    type="button"
                    onClick={() => handleOpenSuggestedPlaylist(
                      detectedToneResult.suggestedPlaylist.genre,
                      detectedToneResult.suggestedPlaylist.title
                    )}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Headphones size={13} />
                    Nghe Playlist Này Ngay
                  </button>
                </div>

                {/* 2. SUGGESTED SPIRITUAL SOUNDSCAPE (SOLFEGGIO) */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Radio size={10} /> Âm Thanh Tâm Linh Solfeggio
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-300">
                        {detectedToneResult.suggestedSoundscape.frequencyLabel}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">
                          {detectedToneResult.suggestedSoundscape.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        Luân Xa: {detectedToneResult.suggestedSoundscape.chakraName}
                      </p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                        {detectedToneResult.suggestedSoundscape.benefit}
                      </p>
                    </div>

                    <p className="text-[9.5px] text-teal-300/90 bg-teal-500/10 p-1.5 rounded-lg border border-teal-500/20 italic">
                      ✨ {detectedToneResult.suggestedSoundscape.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Play/Stop Solfeggio Tone live */}
                    <button
                      id="hud_play_solfeggio_btn"
                      type="button"
                      onClick={() => handleToggleSolfeggioTone(
                        detectedToneResult.suggestedSoundscape.frequencyHz,
                        detectedToneResult.suggestedSoundscape.title
                      )}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                        activePlayingFreq === detectedToneResult.suggestedSoundscape.frequencyHz
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      }`}
                      title="Bật/Tắt sóng âm Solfeggio"
                    >
                      {activePlayingFreq === detectedToneResult.suggestedSoundscape.frequencyHz ? (
                        <>
                          <VolumeX size={13} />
                          Dừng Sóng Âm
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          Phát Sóng Âm
                        </>
                      )}
                    </button>

                    {/* Singing Bowl Strike Button */}
                    <button
                      id="hud_strike_bowl_btn"
                      type="button"
                      onClick={() => handleStrikeSingingBowl(detectedToneResult.suggestedSoundscape.frequencyHz)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-300 hover:text-white transition-all cursor-pointer"
                      title="Gõ Chuông Xoay Tây Tạng"
                    >
                      <Bell size={13} />
                    </button>

                    {/* Navigate to Spiritual Tab */}
                    <button
                      id="hud_open_spiritual_mode_btn"
                      type="button"
                      onClick={handleOpenSpiritualSoundscapes}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      title="Mở toàn bộ kho sóng âm tâm linh"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Voice Navigation Shortcut Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          <span className="text-zinc-500 shrink-0 flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Khẩu lệnh:
          </span>
          {VOICE_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
            >
              {sug}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
