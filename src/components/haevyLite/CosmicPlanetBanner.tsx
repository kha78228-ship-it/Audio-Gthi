import React from 'react';

interface CosmicPlanetBannerProps {
  variant?: 'card' | 'row';
  className?: string;
  children?: React.ReactNode;
}

export function CosmicPlanetBanner({
  variant = 'card',
  className = '',
  children
}: CosmicPlanetBannerProps) {
  if (variant === 'row') {
    // Horizontal cosmic nebula banner (Matches Screenshot 2)
    return (
      <div 
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-sky-400/30 shadow-[0_4px_25px_rgba(2,132,199,0.35)] transition-all ${className}`}
        style={{
          background: 'linear-gradient(135deg, #070b24 0%, #0d164d 25%, #182875 50%, #0c1a52 75%, #060a22 100%)'
        }}
      >
        {/* Starfield Particles */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15% 30%, #ffffff 100%, transparent),
              radial-gradient(1.2px 1.2px at 45% 20%, #7ee7fc 100%, transparent),
              radial-gradient(2px 2px at 70% 60%, #ffffff 100%, transparent),
              radial-gradient(1.5px 1.5px at 85% 25%, #bae6fd 100%, transparent),
              radial-gradient(1.2px 1.2px at 28% 75%, #e0f2fe 100%, transparent),
              radial-gradient(2.5px 2.5px at 92% 70%, #ffffff 100%, transparent),
              radial-gradient(1px 1px at 60% 85%, #7dd3fc 100%, transparent)
            `
          }}
        />

        {/* Flowing Celestial Aurora Energy Streaks */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse 65% 120% at 80% 30%, rgba(56, 189, 248, 0.45), transparent 70%), radial-gradient(ellipse 50% 100% at 30% 60%, rgba(168, 85, 247, 0.35), transparent 70%)'
          }}
        />

        {/* Ambient Light Ray Sweep */}
        <div 
          className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent rotate-12 blur-xl pointer-events-none"
        />

        {/* Edge Glaze & Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  // Full Profile Vista Banner (Matches Screenshot 1 "Thay đổi Hiệu Ứng Hồ Sơ")
  return (
    <div 
      className={`relative overflow-hidden w-full rounded-t-3xl sm:rounded-3xl border border-sky-400/30 shadow-[0_8px_35px_rgba(2,132,199,0.4)] ${className}`}
      style={{
        minHeight: '220px',
        background: 'linear-gradient(180deg, #080d2d 0%, #0e1b5b 35%, #1b2f8a 70%, #0d1a4e 100%)'
      }}
    >
      {/* 1. Starfield background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 12% 18%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 25% 42%, #ffffff 100%, transparent),
            radial-gradient(1px 1px at 38% 12%, #bae6fd 100%, transparent),
            radial-gradient(2.5px 2.5px at 80% 22%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 90% 45%, #7dd3fc 100%, transparent),
            radial-gradient(1px 1px at 65% 75%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 18% 80%, #38bdf8 100%, transparent)
          `
        }}
      />

      {/* 2. Top-Right Radiant Starburst */}
      <div className="absolute top-6 right-20 pointer-events-none">
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_#ffffff] flex items-center justify-center animate-pulse">
          <span className="w-6 h-[1.5px] bg-white/80 absolute rotate-45" />
          <span className="w-6 h-[1.5px] bg-white/80 absolute -rotate-45" />
        </div>
      </div>

      {/* 3. Blue Atmosphere Planet (Upper Center-Right) */}
      <div 
        className="absolute -top-6 right-24 sm:right-32 w-44 h-44 sm:w-52 sm:h-52 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 75% 25%, #38bdf8 0%, #0284c7 35%, #0f172a 80%, #020617 100%)',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.7), inset -8px -8px 25px rgba(2, 6, 23, 0.95), inset 6px 6px 20px rgba(125, 211, 252, 0.8)'
        }}
      >
        {/* Planet Atmosphere Rim Halo */}
        <div className="absolute -inset-1 rounded-full border border-cyan-300/40 opacity-70 blur-[1px]" />
      </div>

      {/* 4. Giant Ringed Gas Planet (Saturn-like in Golden/Amber from bottom right) */}
      <div 
        className="absolute -bottom-24 -right-16 sm:-right-8 w-72 h-72 sm:w-88 sm:h-88 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 25%, #b45309 60%, #451a03 85%, #180802 100%)',
          boxShadow: '0 0 45px rgba(245, 158, 11, 0.6), inset -12px -12px 30px rgba(0, 0, 0, 0.95), inset 8px 8px 20px rgba(254, 240, 138, 0.7)'
        }}
      >
        {/* Planet Atmospheric Cloud Bands */}
        <div className="absolute inset-0 rounded-full opacity-35 mix-blend-overlay bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.3)_10px,rgba(0,0,0,0.3)_20px)]" />
      </div>

      {/* 5. Glowing Cosmic Rings Sweeping Across (Behind avatar, passing through) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ringGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#7ee7fc" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#fde047" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
          <filter id="ringBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Inner Luminous Ring Arc */}
        <ellipse 
          cx="330" 
          cy="180" 
          rx="220" 
          ry="70" 
          fill="none" 
          stroke="url(#ringGlow)" 
          strokeWidth="3.5"
          filter="url(#ringBlur)"
          transform="rotate(-24 330 180)"
        />

        {/* Outer Fine Dust Ring Arc */}
        <ellipse 
          cx="330" 
          cy="180" 
          rx="250" 
          ry="80" 
          fill="none" 
          stroke="#fde047" 
          strokeWidth="1.2"
          strokeDasharray="6 3"
          opacity="0.6"
          transform="rotate(-24 330 180)"
        />

        {/* Space Blue Nebula Flow Ribbon */}
        <path 
          d="M 50 20 C 120 70, 240 40, 380 90" 
          fill="none" 
          stroke="#38bdf8" 
          strokeWidth="2" 
          opacity="0.4"
          filter="url(#ringBlur)"
        />
      </svg>

      {/* 6. Vertical Light Flare across the screen */}
      <div 
        className="absolute left-28 top-0 w-1 h-44 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent blur-[1px] pointer-events-none"
      />

      {/* Children elements (Avatar, Badges, etc.) */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
