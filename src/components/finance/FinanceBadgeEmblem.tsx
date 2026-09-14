import React, { useState } from 'react';
import { 
  PiggyBank, 
  ShieldAlert, 
  Sword, 
  Sparkles, 
  Lock, 
  Check, 
  Hammer, 
  Compass, 
  Coins, 
  Diamond, 
  Flame,
  Award
} from 'lucide-react';
import { FinanceAchievementBadge } from '../../types';

interface FinanceBadgeEmblemProps {
  badge: FinanceAchievementBadge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
}

export function FinanceBadgeEmblem({ 
  badge, 
  size = 'md',
  showLevel = true 
}: FinanceBadgeEmblemProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // Size styling maps
  const sizeMap = {
    sm: { box: 'w-12 h-12', icon: 18, border: 'p-1', star: 10, text: 'text-[9px]' },
    md: { box: 'w-20 h-20', icon: 28, border: 'p-1.5', star: 12, text: 'text-[10px]' },
    lg: { box: 'w-28 h-28', icon: 40, border: 'p-2', star: 14, text: 'text-xs' },
    xl: { box: 'w-36 h-36', icon: 52, border: 'p-2.5', star: 16, text: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // Level Metallic Palette
  const levelThemes = {
    Bronze: {
      border: 'border-amber-700/60 shadow-amber-900/30',
      bg: 'from-amber-950/80 via-zinc-900 to-amber-900/40',
      text: 'text-amber-500',
      ring: 'ring-amber-600/40',
      tagBg: 'bg-amber-950/90 border-amber-700/50 text-amber-400'
    },
    Silver: {
      border: 'border-slate-400/70 shadow-slate-500/20',
      bg: 'from-slate-800/90 via-zinc-900 to-slate-700/40',
      text: 'text-slate-200',
      ring: 'ring-slate-400/40',
      tagBg: 'bg-slate-900/90 border-slate-400/50 text-slate-200'
    },
    Gold: {
      border: 'border-amber-400/80 shadow-amber-500/40',
      bg: 'from-amber-900/90 via-yellow-950 to-amber-800/40',
      text: 'text-yellow-300',
      ring: 'ring-amber-400/50',
      tagBg: 'bg-amber-900/90 border-yellow-400/60 text-yellow-300'
    },
    Diamond: {
      border: 'border-cyan-400/80 shadow-cyan-500/40',
      bg: 'from-cyan-950/90 via-blue-950 to-indigo-950/80',
      text: 'text-cyan-300',
      ring: 'ring-cyan-400/50',
      tagBg: 'bg-cyan-950/90 border-cyan-400/60 text-cyan-300'
    }
  };

  const theme = levelThemes[badge.levelName] || levelThemes.Bronze;

  // Custom 3D Vector Graphics for each badge type
  const renderVectorArt = () => {
    switch (badge.id) {
      case 'master_saver':
        return (
          <div className="relative flex items-center justify-center">
            {/* Piggy Bank & Sparkles */}
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles size={currentSize.star} className="text-amber-300" />
            </div>
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-zinc-950 shadow-lg shadow-emerald-500/30">
              <PiggyBank size={currentSize.icon} className="stroke-[2.2]" />
            </div>
          </div>
        );

      case 'budget_ninja':
        return (
          <div className="relative flex items-center justify-center">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30">
              <Sword size={currentSize.icon} className="stroke-[2.2] -rotate-45" />
            </div>
          </div>
        );

      case 'debt_crusher':
        return (
          <div className="relative flex items-center justify-center">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-600 text-white shadow-lg shadow-amber-500/30">
              <Hammer size={currentSize.icon} className="stroke-[2.2]" />
            </div>
          </div>
        );

      case 'wealth_architect':
        return (
          <div className="relative flex items-center justify-center">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
              <Compass size={currentSize.icon} className="stroke-[2.2]" />
            </div>
          </div>
        );

      case 'cashflow_alchemist':
        return (
          <div className="relative flex items-center justify-center">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-pink-500/30">
              <Coins size={currentSize.icon} className="stroke-[2.2]" />
            </div>
          </div>
        );

      case 'discipline_diamond':
        return (
          <div className="relative flex items-center justify-center">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-blue-500/30">
              <Diamond size={currentSize.icon} className="stroke-[2.2]" />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-lg">
            <Award size={currentSize.icon} />
          </div>
        );
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none group">
      {/* Outer Hexagon / Circle Medallion */}
      <div 
        className={`relative ${currentSize.box} rounded-3xl ${currentSize.border} bg-gradient-to-b ${theme.bg} border-2 ${theme.border} shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 overflow-hidden ${
          !badge.isUnlocked ? 'grayscale contrast-75 opacity-70' : 'ring-2 ' + theme.ring
        }`}
      >
        {/* Glow ambient circle */}
        {badge.isUnlocked && (
          <div 
            className="absolute inset-0 opacity-30 blur-md pointer-events-none"
            style={{ backgroundColor: badge.accentColor }}
          />
        )}

        {/* Badge Artwork: Image with fallback to vector illustration */}
        {!imageFailed && badge.iconUrl ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-zinc-950">
            <img
              src={badge.iconUrl}
              alt={badge.title}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
            />
            {/* Dark glass overlay with badge icon stamp */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-1">
              <div className="scale-75 opacity-90 drop-shadow-md">
                {renderVectorArt()}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            {renderVectorArt()}
          </div>
        )}

        {/* Locked State Overlay */}
        {!badge.isUnlocked && (
          <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-zinc-400 gap-1">
            <div className="p-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 shadow-md">
              <Lock size={size === 'sm' ? 12 : 16} className="text-zinc-400" />
            </div>
          </div>
        )}

        {/* Unlocked Checkmark Badge */}
        {badge.isUnlocked && (
          <div className="absolute top-1 right-1 z-20 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md shadow-emerald-500/40">
            <Check size={10} className="stroke-[3]" />
          </div>
        )}
      </div>

      {/* Level Tag Pill */}
      {showLevel && (
        <div className={`-mt-2.5 z-20 px-2 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase shadow-md ${theme.tagBg}`}>
          {badge.levelName}
        </div>
      )}
    </div>
  );
}
