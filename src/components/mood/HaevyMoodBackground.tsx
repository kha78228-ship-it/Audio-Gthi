import React, { useMemo } from 'react';
import { useHaevyMood } from '../../context/HaevyMoodContext';
import { useTheme } from '../../context/ThemeContext';

export function HaevyMoodBackground() {
  const { palette, isEnabled, intensity } = useHaevyMood();
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  // Opacity factor based on intensity
  const effectiveOpacity = isEnabled ? intensity : 0;

  // Starlight particles for night modes
  const stars = useMemo(() => {
    if (palette.particlesType !== 'stars') return [];
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 29) % 85,
      size: (i % 3) + 1.2,
      duration: 3 + (i % 4),
      delay: (i % 5) * 0.7,
      opacity: 0.25 + (i % 4) * 0.2
    }));
  }, [palette.particlesType]);

  // Raindrops for rain mode
  const raindrops = useMemo(() => {
    if (palette.particlesType !== 'rain') return [];
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: (i * 4.2) % 100,
      duration: 0.9 + (i % 3) * 0.35,
      delay: (i % 8) * 0.15,
      height: 35 + (i % 4) * 15,
      opacity: 0.15 + (i % 3) * 0.12
    }));
  }, [palette.particlesType]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      id="haevy-mood-background-engine"
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none transition-opacity duration-1000 ease-out"
      style={{ opacity: effectiveOpacity }}
      aria-hidden="true"
    >
      {/* 1. Base Atmospheric Glow Layer */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        style={{
          backgroundColor: isLight ? 'transparent' : 'rgba(3, 4, 7, 0.45)'
        }}
      />

      {/* 2. Primary Luminous Ambient Orb (Top Center/Left) */}
      <div
        className="absolute -top-[15%] left-[10%] w-[65vw] max-w-[750px] h-[65vw] max-h-[750px] rounded-full blur-[90px] sm:blur-[130px] transition-all duration-1000 ease-out transform -translate-x-1/4 animate-pulse-slow"
        style={{
          background: palette.ambientMesh.orb1,
          willChange: 'transform, opacity'
        }}
      />

      {/* 3. Secondary Complementary Ambient Orb (Top Right) */}
      <div
        className="absolute top-[5%] -right-[10%] w-[55vw] max-w-[650px] h-[55vw] max-h-[650px] rounded-full blur-[80px] sm:blur-[120px] transition-all duration-1000 ease-out"
        style={{
          background: palette.ambientMesh.orb2,
          willChange: 'transform, opacity'
        }}
      />

      {/* 4. Tertiary Grounding Ambient Orb (Bottom Center) */}
      <div
        className="absolute -bottom-[20%] left-[25%] w-[60vw] max-w-[700px] h-[60vw] max-h-[700px] rounded-full blur-[95px] sm:blur-[140px] transition-all duration-1000 ease-out"
        style={{
          background: palette.ambientMesh.orb3,
          willChange: 'transform, opacity'
        }}
      />

      {/* 5. Natural Particle / Weather Effects (GPU Hardware Accelerated) */}
      {palette.particlesType === 'rain' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-300/40 to-sky-200/60 animate-raindrop"
              style={{
                left: `${drop.left}%`,
                height: `${drop.height}px`,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
                opacity: drop.opacity
              }}
            />
          ))}
        </div>
      )}

      {palette.particlesType === 'stars' && (
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-indigo-100 animate-twinkle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 2}px rgba(165, 180, 252, 0.6)`
              }}
            />
          ))}
        </div>
      )}

      {palette.particlesType === 'sunbeams' && (
        <div className="absolute -top-1/4 -right-1/4 w-[120vw] h-[120vh] pointer-events-none opacity-30">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-orange-400/5 to-transparent blur-2xl transform rotate-12" />
        </div>
      )}

      {palette.particlesType === 'mist' && (
        <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-teal-500/10 via-slate-400/5 to-transparent blur-3xl pointer-events-none opacity-50" />
      )}

      {palette.particlesType === 'aurora' && (
        <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-purple-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none animate-pulse-slow opacity-60" />
      )}

      {/* 6. Subtle Vignette to keep text ultra-crisp & high-contrast */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 50% 30%, transparent 60%, rgba(241, 245, 249, 0.4) 100%)'
            : 'radial-gradient(circle at 50% 30%, transparent 55%, rgba(0, 0, 0, 0.55) 100%)'
        }}
      />
    </div>
  );
}
export default HaevyMoodBackground;
