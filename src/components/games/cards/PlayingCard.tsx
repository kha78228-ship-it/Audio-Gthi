import React from 'react';
import { PlayingCardData } from './cardTypes';
import { SUIT_SYMBOLS } from './cardUtils';

interface PlayingCardProps {
  key?: React.Key;
  card?: PlayingCardData;
  isFaceDown?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  badge?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
  badge
}) => {
  // Size dimensions
  const sizeClasses = {
    xs: 'w-7 h-10 text-[9px] rounded-md border',
    sm: 'w-10 h-14 text-xs rounded-lg border',
    md: 'w-13 h-19 sm:w-16 sm:h-24 text-sm sm:text-base rounded-xl border-[1.5px]',
    lg: 'w-16 h-24 sm:w-20 sm:h-28 text-base sm:text-lg rounded-xl border-2'
  }[size];

  // Face down card (Back pattern)
  if (isFaceDown || !card) {
    return (
      <div
        className={`relative select-none shrink-0 transition-transform duration-200 shadow-md ${sizeClasses} ${className} bg-gradient-to-br from-red-900 via-red-950 to-zinc-950 border-amber-500/40 p-1 flex items-center justify-center overflow-hidden`}
      >
        <div className="w-full h-full border border-amber-500/30 rounded-lg flex items-center justify-center bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:6px_6px] opacity-80">
          <div className="w-4 h-4 rounded-full border border-amber-400/60 bg-amber-500/20 flex items-center justify-center">
            <span className="text-[7px] font-black text-amber-400 font-serif">H</span>
          </div>
        </div>
      </div>
    );
  }

  const symbol = SUIT_SYMBOLS[card.suit];
  const textColor = card.isRed ? 'text-rose-600' : 'text-zinc-900';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`relative select-none shrink-0 cursor-pointer transition-all duration-150 shadow-md ${sizeClasses} ${className} ${
        isSelected
          ? '-translate-y-3.5 ring-2 ring-amber-400 shadow-xl shadow-amber-500/30 bg-amber-50'
          : 'bg-white hover:-translate-y-1.5 hover:shadow-lg'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed filter grayscale-[30%]' : ''
      } border-zinc-300 font-sans p-1 flex flex-col justify-between`}
    >
      {/* Top-Left Corner Index */}
      <div className={`leading-none flex flex-col items-center w-fit ${textColor}`}>
        <span className="font-black font-mono tracking-tighter">{card.displayValue}</span>
        <span className="text-[1.1em] -mt-0.5 leading-none">{symbol}</span>
      </div>

      {/* Center Big Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${textColor} opacity-85`}>
        <span className="text-xl sm:text-2xl font-serif">{symbol}</span>
      </div>

      {/* Bottom-Right Corner Index (Inverted) */}
      <div className={`leading-none flex flex-col items-center w-fit self-end rotate-180 ${textColor}`}>
        <span className="font-black font-mono tracking-tighter">{card.displayValue}</span>
        <span className="text-[1.1em] -mt-0.5 leading-none">{symbol}</span>
      </div>

      {/* Optional Badge */}
      {badge && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-full shadow-md z-10">
          {badge}
        </span>
      )}
    </div>
  );
}
