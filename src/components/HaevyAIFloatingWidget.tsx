import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Heart, 
  ShieldCheck, 
  Zap,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';

interface HaevyAIFloatingWidgetProps {
  onOpenFullAI?: (subTab?: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes') => void;
  onSelectMode?: (mode: string, initialTab?: string) => void;
  onSelectTab?: (tab: string) => void;
}

export function HaevyAIFloatingWidget({
  onOpenFullAI,
  onSelectMode
}: HaevyAIFloatingWidgetProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenAIChat = (subTab: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes' = 'chat') => {
    haptics.medium();
    if (onOpenFullAI) {
      onOpenFullAI(subTab);
    } else if (onSelectMode) {
      onSelectMode('haevy_ai', subTab);
    }
  };

  return (
    <div 
      className="fixed bottom-24 right-3 sm:right-5 z-40 flex flex-col items-end pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quick Action Shortcut Pills on Hover / Context */}
      <div className={`flex flex-col items-end gap-1.5 mb-2 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        <button
          onClick={() => handleOpenAIChat('chat')}
          className="px-3 py-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl text-rose-300 text-xs font-bold border border-rose-500/40 shadow-xl shadow-rose-950/40 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition"
        >
          <Heart size={14} className="text-rose-400" />
          <span>Tâm Sự Thấu Cảm 💖</span>
          <ChevronRight size={13} className="text-zinc-500" />
        </button>

        <button
          onClick={() => handleOpenAIChat('updates')}
          className="px-3 py-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl text-amber-300 text-xs font-bold border border-amber-500/40 shadow-xl shadow-amber-950/40 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>Điểm Mới Sự Kiện 3D 🚀</span>
          <ChevronRight size={13} className="text-zinc-500" />
        </button>

        <button
          onClick={() => handleOpenAIChat('troubleshoot')}
          className="px-3 py-1.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl text-cyan-300 text-xs font-bold border border-cyan-500/40 shadow-xl shadow-cyan-950/40 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition"
        >
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Cứu Hộ & Vướng Mắc 🛠️</span>
          <ChevronRight size={13} className="text-zinc-500" />
        </button>
      </div>

      {/* Main Full-Screen AI Trigger Button */}
      <button
        onClick={() => handleOpenAIChat('chat')}
        className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-900/60 ring-2 ring-purple-400/50 hover:ring-purple-300 hover:scale-105 active:scale-95 transition-all duration-300"
        title="Chuyển vào chế độ Haevy AI toàn màn hình - Giao diện Chat"
      >
        {/* Glowing Luminous Pulse */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 transition duration-300 -z-10 animate-pulse"></span>

        <div className="relative">
          <BrainCircuit className="w-4 sm:w-5 h-4 sm:h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-purple-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          </span>
        </div>

        <span className="tracking-wide">
          Chat Haevy AI
        </span>

        <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 text-amber-300 text-[10px] font-black border border-purple-400/40 hidden sm:inline-block">
          Toàn Màn Hình
        </span>

        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
      </button>
    </div>
  );
}
