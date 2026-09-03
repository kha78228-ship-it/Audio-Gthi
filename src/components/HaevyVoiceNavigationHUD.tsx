import React from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Compass, 
  CheckCircle2,
  Volume2,
  BrainCircuit
} from 'lucide-react';
import { VoiceCommandMatch } from '../utils/voiceNavigation';

interface HaevyVoiceNavigationHUDProps {
  isListening: boolean;
  transcript: string;
  lastMatchedCommand: VoiceCommandMatch | null;
  errorMessage: string | null;
  onToggleListening: () => void;
  onSelectSuggestion?: (command: string) => void;
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

export function HaevyVoiceNavigationHUD({
  isListening,
  transcript,
  lastMatchedCommand,
  errorMessage,
  onToggleListening,
  onSelectSuggestion
}: HaevyVoiceNavigationHUDProps) {
  if (!isListening && !lastMatchedCommand && !errorMessage) {
    return null;
  }

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-3 animate-fadeIn pointer-events-none">
      <div className="pointer-events-auto bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-amber-500/20 ring-1 ring-white/10 text-white space-y-2.5">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-zinc-950 shadow-lg shadow-amber-500/30">
              <Mic className="w-4 h-4 text-zinc-950 animate-bounce" />
              {isListening && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-amber-300">
                  Điều Khiển Bằng Giọng Nói (Haevy Voice)
                </span>
                {isListening ? (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 animate-pulse">
                    Đang nghe...
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    Đã dừng
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">
                Hãy nói: "Đi đến Haevy Finance", "Mở phòng thu", "Mở Tử Vi"...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
            <button
              id="voice_hud_close_btn"
              type="button"
              onClick={onToggleListening}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Đóng bảng điều khiển giọng nói"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Transcript or Error Feedback */}
        {errorMessage ? (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : lastMatchedCommand ? (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">
                  Đã nhận lệnh: "{transcript}"
                </span>
                <span className="text-[11px] text-emerald-300">
                  {lastMatchedCommand.feedbackText}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-200 shrink-0">
              {lastMatchedCommand.label}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs flex items-center gap-2">
            {/* Animated Sound Waveform */}
            <div className="flex items-center gap-1 shrink-0 px-1">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1 h-5 bg-amber-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-4 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>

            <div className="min-w-0 flex-1">
              {transcript ? (
                <p className="text-zinc-200 font-medium truncate">
                  Đang nghe: <span className="text-amber-300 font-bold">"{transcript}"</span>
                </p>
              ) : (
                <p className="text-zinc-400 italic">
                  Đang lắng nghe khẩu lệnh... Hãy nói một câu như "Đi đến Haevy Finance" hoặc "Mở phòng thu".
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-zinc-500 shrink-0 flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Gợi ý:
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
