import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Gift, ArrowRight, X } from 'lucide-react';
import { LevelMilestone } from '../types';
import { haptics } from '../utils/haptics';

interface LevelUpEventDetail {
  previousLevel: number;
  newLevel: number;
  milestone: LevelMilestone;
}

interface UserLevelUpNotificationModalProps {
  onOpenLevelCenter: () => void;
}

export function UserLevelUpNotificationModal({ onOpenLevelCenter }: UserLevelUpNotificationModalProps) {
  const [levelUpData, setLevelUpData] = useState<LevelUpEventDetail | null>(null);

  useEffect(() => {
    const handleLevelUp = (e: CustomEvent<LevelUpEventDetail>) => {
      if (e.detail) {
        setLevelUpData(e.detail);
        haptics.rewardClaim();
      }
    };

    window.addEventListener('haevy:level-up' as any, handleLevelUp);
    return () => window.removeEventListener('haevy:level-up' as any, handleLevelUp);
  }, []);

  if (!levelUpData) return null;

  const { newLevel, milestone } = levelUpData;

  const handleOpenRewards = () => {
    setLevelUpData(null);
    onOpenLevelCenter();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-amber-500/50 shadow-2xl shadow-amber-500/20 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Background Aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full bg-amber-500/30 blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={() => setLevelUpData(null)}
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Crown Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center animate-bounce">
          <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center">
            <span className="text-3xl leading-none">{milestone.icon}</span>
            <span className="text-xs font-black text-amber-300 font-mono mt-0.5">
              LV.{newLevel}
            </span>
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
            <Crown size={15} fill="currentColor" />
          </div>
        </div>

        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>Chúc Mừng Thăng Cấp!</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Cấp Độ {newLevel}: {milestone.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {milestone.subtitle}
          </p>
        </div>

        {/* Rewards unlocked showcase */}
        <div className="mt-5 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gift size={13} />
            <span>Quà Tặng Cấp Độ Chờ Bạn Nhận:</span>
          </div>
          <div className="space-y-1.5">
            {milestone.rewards.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-xs text-zinc-200">
                <span className="text-base">{r.icon}</span>
                <strong className="text-amber-300">{r.name}</strong>
                <span className="text-zinc-500 text-[11px] truncate">({r.description})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleOpenRewards}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Nhận Quà & Xem Đặc Quyền Ngay</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setLevelUpData(null)}
            className="text-xs text-zinc-500 hover:text-zinc-400 py-1"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
