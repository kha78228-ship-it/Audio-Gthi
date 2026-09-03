import React from 'react';
import { Sparkles, Orbit, Layers, Globe2, Compass, Boxes } from 'lucide-react';

interface HaevySpaceLogoProps {
  variant?: 'icon' | 'full' | 'hero' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  animated?: boolean;
}

export function HaevySpaceLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
  animated = true
}: HaevySpaceLogoProps) {
  
  // Icon Dimension based on size prop
  const getIconDimensions = () => {
    switch (size) {
      case 'sm': return { box: 'w-7 h-7', svg: 28, text: 'text-sm', sub: 'text-[9px]' };
      case 'lg': return { box: 'w-14 h-14', svg: 56, text: 'text-2xl', sub: 'text-xs' };
      case 'xl': return { box: 'w-20 h-20 sm:w-24 sm:h-24', svg: 96, text: 'text-3xl sm:text-5xl', sub: 'text-xs sm:text-sm' };
      case 'md':
      default:
        return { box: 'w-10 h-10', svg: 40, text: 'text-lg', sub: 'text-[10px]' };
    }
  };

  const dims = getIconDimensions();

  // Core 5D Spatial Holographic Emblem (SVG Vector Masterpiece)
  const renderSpatialEmblem = () => (
    <div className={`relative ${dims.box} flex items-center justify-center shrink-0 select-none group`}>
      {/* Dynamic Cosmic Aurora Glow */}
      <div 
        className={`absolute -inset-1.5 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 rounded-3xl opacity-75 blur-md ${
          animated ? 'animate-pulse' : ''
        } group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Main Beveled Container Glass Frame */}
      <div className="relative w-full h-full rounded-2xl bg-zinc-950 p-[1px] shadow-2xl border border-cyan-400/40 overflow-hidden flex items-center justify-center">
        {/* Holographic Background Matrix Grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/60 via-indigo-950/40 to-black" />
        
        {/* Animated Radial Scanline */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />

        {/* 5D Cosmic Spatial Isometric Cube & Orbital Rings SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className={`relative z-10 w-full h-full p-1.5 transition-transform duration-700 group-hover:scale-110`}
        >
          <defs>
            {/* Linear Gradients */}
            <linearGradient id="spaceGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="spaceGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <linearGradient id="spaceGradViolet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Neon Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Orbit Ellipse Ring 1 (Inclined Left-Right) */}
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="16"
            transform="rotate(-28 50 50)"
            fill="none"
            stroke="url(#spaceGradCyan)"
            strokeWidth="2.2"
            strokeDasharray="18 4"
            opacity="0.85"
            className={animated ? 'animate-[spin_12s_linear_infinite]' : ''}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* 2. Orbit Ellipse Ring 2 (Inclined Opposite) */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="14"
            transform="rotate(38 50 50)"
            fill="none"
            stroke="url(#spaceGradAmber)"
            strokeWidth="1.8"
            strokeDasharray="14 3"
            opacity="0.75"
            className={animated ? 'animate-[spin_16s_linear_infinite_reverse]' : ''}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* 3. Isometric 3D Dimensional Polyhedron Cube (X, Y, Z Spatial Coordinates) */}
          {/* Top Face */}
          <polygon
            points="50,22 72,34 50,46 28,34"
            fill="url(#spaceGradCyan)"
            opacity="0.9"
          />
          {/* Left Face */}
          <polygon
            points="28,34 50,46 50,72 28,60"
            fill="url(#spaceGradViolet)"
            opacity="0.8"
          />
          {/* Right Face */}
          <polygon
            points="50,46 72,34 72,60 50,72"
            fill="url(#spaceGradAmber)"
            opacity="0.85"
          />

          {/* 4. Spatial Coordinate Wireframe Lines */}
          <line x1="50" y1="22" x2="50" y2="46" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="28" y1="34" x2="50" y2="46" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="72" y1="34" x2="50" y2="46" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="50" y1="46" x2="50" y2="72" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* 5. Central Radiant Singularity Pulsar Core */}
          <circle cx="50" cy="46" r="10" fill="url(#coreGlow)" />
          <circle cx="50" cy="46" r="3.5" fill="#ffffff" filter="url(#neonGlow)" />

          {/* 6. Orbital Satellites / Cosmic Photon Nodes */}
          <circle cx="84" cy="38" r="2.8" fill="#fbbf24" filter="url(#neonGlow)" />
          <circle cx="16" cy="62" r="2.5" fill="#22d3ee" filter="url(#neonGlow)" />
          <circle cx="50" cy="12" r="2.2" fill="#c084fc" filter="url(#neonGlow)" />

          {/* 7. Quantum Sparkle Crosshair at Top Right */}
          <path
            d="M74,18 L76,14 L78,18 L82,20 L78,22 L76,26 L74,22 L70,20 Z"
            fill="#ffffff"
            opacity="0.95"
            className={animated ? 'animate-pulse' : ''}
          />
        </svg>
      </div>
    </div>
  );

  // Return specific variant
  if (variant === 'icon') {
    return <div className={`inline-flex ${className}`}>{renderSpatialEmblem()}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 backdrop-blur-xl ${className}`}>
        {renderSpatialEmblem()}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white tracking-tight">HAEVY</span>
            <span className="text-xs font-black bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">SPACE</span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-bold text-cyan-400/90 tracking-wider">3D & AR METAVERSE</span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Grand Hero Emblem with Floating Celestial Rays */}
        <div className="relative mb-5 sm:mb-6">
          {/* Background Warp Tunnel Aura */}
          <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-indigo-600/30 to-amber-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
          
          {/* Large Emblem */}
          {renderSpatialEmblem()}

          {/* Floating Orbiting Badges */}
          <div className="absolute -top-2 -right-4 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 text-[10px] font-black tracking-widest shadow-lg shadow-cyan-500/30 animate-bounce">
            5D AR
          </div>
          <div className="absolute -bottom-2 -left-4 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black tracking-widest shadow-lg shadow-amber-500/30">
            60-120 FPS
          </div>
        </div>

        {/* Hero Title with Metallic Spatial Gradient */}
        <h1 className={`${dims.text} font-black tracking-tight mb-2 text-white flex items-center justify-center gap-2 flex-wrap`}>
          <span>HAEVY</span>
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
            SPACE
          </span>
          <span className="text-xl sm:text-3xl text-amber-400">🌌</span>
        </h1>

        {showSubtitle && (
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/15 to-amber-500/10 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-extrabold tracking-wide shadow-inner">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>CỔNG KHÔNG GIAN ĐA CHIỀU • 3D AIR STUDIO & AR 5D</span>
          </div>
        )}
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {renderSpatialEmblem()}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`${dims.text} font-black text-white tracking-tight`}>Haevy</span>
          <span className={`${dims.text} font-black bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent`}>
            Space
          </span>
          <span className="text-xs sm:text-sm">🌌</span>
        </div>
        {showSubtitle && (
          <span className={`${dims.sub} font-bold text-cyan-300/80 tracking-wider uppercase`}>
            3D Studio & AR Metaverse
          </span>
        )}
      </div>
    </div>
  );
}
