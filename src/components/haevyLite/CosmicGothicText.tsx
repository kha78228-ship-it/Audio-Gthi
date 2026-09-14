import React from 'react';

interface CosmicGothicTextProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function CosmicGothicText({
  text,
  className = '',
  size = 'md'
}: CosmicGothicTextProps) {
  // Size classes
  const sizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl md:text-2xl',
    xl: 'text-2xl sm:text-3xl md:text-4xl',
    '2xl': 'text-3xl sm:text-4xl md:text-5xl'
  };

  return (
    <span
      className={`inline-block font-black select-none tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: "'UnifrakturCook', 'Pirata One', 'MedievalSharp', 'Cinzel Decorative', Georgia, serif",
        background: 'linear-gradient(180deg, #dcfce7 0%, #7ee7fc 30%, #38bdf8 65%, #0284c7 92%, #0369a1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 8px rgba(56, 189, 248, 0.75)) drop-shadow(0 0 20px rgba(14, 165, 233, 0.4))',
        letterSpacing: '0.04em'
      }}
    >
      {text}
    </span>
  );
}
