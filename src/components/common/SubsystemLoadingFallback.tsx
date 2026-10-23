import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface SubsystemLoadingFallbackProps {
  subsystemName?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export function SubsystemLoadingFallback({
  subsystemName = 'Phân Hệ Haevy',
  icon,
  subtitle = 'Đang tải tài nguyên & tối ưu hóa bộ nhớ...'
}: SubsystemLoadingFallbackProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-8 flex flex-col items-center justify-center min-h-[420px] animate-fadeIn">
      {/* Central Glowing Loading Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center max-w-md w-full overflow-hidden">
        {/* Ambient Glow Backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Icon Pill */}
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-inner">
            {icon || <Loader2 size={26} className="animate-spin text-amber-400" />}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Subsystem Name & Spinner */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {subsystemName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
              Lazy
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar Animation */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-5 overflow-hidden border border-zinc-800 relative">
          <div className="h-full bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 rounded-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
          <Sparkles size={12} className="text-amber-400" />
          <span>Tải bất đồng bộ · Tiết kiệm dung lượng RAM</span>
        </div>
      </div>

      {/* Skeleton Wireframe Background to prevent layout shifts */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 opacity-40 pointer-events-none">
        <div className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse" />
        <div className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse hidden sm:block" />
        <div className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse hidden sm:block" />
      </div>
    </div>
  );
}
