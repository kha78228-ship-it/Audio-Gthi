import React from 'react';

interface HoloTrooperHelmetProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPedestal?: boolean;
}

export function HoloTrooperHelmet({
  size = 'md',
  className = '',
  showPedestal = true
}: HoloTrooperHelmetProps) {
  // Size mapping for the helmet
  const sizeMap = {
    xs: { width: 20, height: 24, pedestalW: 24, pedestalH: 6 },
    sm: { width: 28, height: 32, pedestalW: 32, pedestalH: 8 },
    md: { width: 36, height: 42, pedestalW: 40, pedestalH: 10 },
    lg: { width: 48, height: 56, pedestalW: 52, pedestalH: 12 },
    xl: { width: 68, height: 80, pedestalW: 72, pedestalH: 16 }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* 1. Holographic Light Beam & Particle Aura */}
      <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-md animate-pulse pointer-events-none" />
      
      {/* 2. Detailed Sci-Fi Helmet SVG */}
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] filter brightness-105"
      >
        <defs>
          {/* White Armor Gradients */}
          <linearGradient id="armorGrad" x1="20" y1="10" x2="85" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="80%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id="armorShade" x1="10" y1="50" x2="90" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
            <stop offset="25%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.5" />
          </linearGradient>

          {/* Visor Gradient with Sci-Fi cyan glow */}
          <linearGradient id="visorGrad" x1="15" y1="45" x2="85" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#020617" />
            <stop offset="75%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Cyan Glow Filter */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Helmet Dome (Headpiece) --- */}
        <path
          d="M 50 12 
             C 28 12, 16 26, 15 48 
             C 14 62, 18 78, 24 88 
             C 30 96, 38 98, 50 98 
             C 62 98, 70 96, 76 88 
             C 82 78, 86 62, 85 48 
             C 84 26, 72 12, 50 12 Z"
          fill="url(#armorGrad)"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Fin / Center Ridge on Crown */}
        <path
          d="M 47 12 
             C 47 12, 47 36, 46 44 
             C 49 44, 51 44, 54 44 
             C 53 36, 53 12, 53 12 Z"
          fill="#cbd5e1"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Forehead Brow Band */}
        <path
          d="M 20 40 
             C 32 37, 68 37, 80 40 
             L 81 45 
             C 68 42, 32 42, 19 45 Z"
          fill="#1e293b"
        />

        {/* Battle Scars / Weathering Decal */}
        <path
          d="M 28 22 L 32 30 L 29 36"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="34" cy="28" r="1.5" fill="#334155" />

        {/* --- Iconic T-Visor / Slit --- */}
        {/* Horizontal Eye-slit */}
        <path
          d="M 23 48 
             C 32 45, 68 45, 77 48 
             L 75 58 
             C 62 55, 57 55, 54 58 
             L 54 78 
             C 52 80, 48 80, 46 78 
             L 46 58 
             C 43 55, 38 55, 25 58 Z"
          fill="url(#visorGrad)"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* Visor Cyan Reflection Ray */}
        <path
          d="M 60 50 L 73 51 L 68 56 L 56 55 Z"
          fill="#38bdf8"
          opacity="0.85"
        />
        <line x1="49" y1="62" x2="49" y2="76" stroke="#00f0ff" strokeWidth="1.5" opacity="0.9" />

        {/* --- Cheeks / Jaw Plating --- */}
        {/* Left Cheek Indent */}
        <path
          d="M 24 64 C 27 68, 30 74, 34 76 L 33 84 C 27 82, 23 74, 21 68 Z"
          fill="#94a3b8"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Right Cheek Indent */}
        <path
          d="M 76 64 C 73 68, 70 74, 66 76 L 67 84 C 73 82, 77 74, 79 68 Z"
          fill="#cbd5e1"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* --- Mouth Area / Chin Filter (Aerators) --- */}
        {/* Triangular Chin Center */}
        <path
          d="M 43 85 L 57 85 L 53 95 L 47 95 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Left Circular Aerator Node */}
        <circle cx="36" cy="88" r="4.5" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="36" cy="88" r="2" fill="#0ea5e9" />

        {/* Right Circular Aerator Node */}
        <circle cx="64" cy="88" r="4.5" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="64" cy="88" r="2" fill="#0ea5e9" />

        {/* Chin Vent Slits */}
        <line x1="46" y1="89" x2="54" y2="89" stroke="#64748b" strokeWidth="1.2" />
        <line x1="48" y1="92" x2="52" y2="92" stroke="#64748b" strokeWidth="1.2" />

        {/* Futuristic Holographic Scanlines */}
        <line x1="18" y1="32" x2="82" y2="32" stroke="#38bdf8" strokeWidth="0.75" opacity="0.35" strokeDasharray="3 2" />
        <line x1="16" y1="62" x2="84" y2="62" stroke="#38bdf8" strokeWidth="0.75" opacity="0.35" strokeDasharray="4 2" />
      </svg>

      {/* 3. Hologram Emitter Pedestal (under the helmet) */}
      {showPedestal && (
        <div 
          className="relative -mt-1 flex flex-col items-center z-20"
          style={{ width: currentSize.pedestalW }}
        >
          {/* Emitter Disc Top */}
          <div 
            className="w-full rounded-full bg-gradient-to-r from-cyan-900 via-cyan-400 to-cyan-900 border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            style={{ height: currentSize.pedestalH }}
          />
          {/* Hologram Base Plate */}
          <div 
            className="w-4/5 -mt-0.5 rounded-full bg-slate-900 border border-cyan-500/60 shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center"
            style={{ height: Math.max(3, currentSize.pedestalH - 2) }}
          >
            <span className="w-1.5 h-1 rounded-full bg-cyan-300 animate-ping opacity-75" />
          </div>
        </div>
      )}
    </div>
  );
}
