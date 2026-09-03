import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Sparkles, 
  Activity, 
  Waves, 
  Radio, 
  Orbit, 
  Sliders, 
  Flame, 
  Volume2, 
  Zap, 
  Maximize2, 
  Eye, 
  RefreshCw,
  Palette
} from 'lucide-react';
import { webAudioEqualizer } from '../lib/webAudioEqualizer';

export type VisualizerMode = 'bars' | 'radial' | 'fluid_wave' | 'galaxy' | 'oscilloscope';
export type VisualizerTheme = 'cyber_amber' | 'neon_cyan' | 'aurora_emerald' | 'electric_pink' | 'deep_purple' | 'rainbow_flux';

interface AudioDynamicVisualizerProps {
  isPlaying: boolean;
  isVip?: boolean;
  trackTitle?: string;
  artist?: string;
  coverUrl?: string;
  compact?: boolean;
  className?: string;
  defaultMode?: VisualizerMode;
  onClose?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  angle: number;
  distance: number;
  speed: number;
  freqIndex: number;
}

const THEME_CONFIGS: Record<VisualizerTheme, {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgGradient: string;
  particleColors: string[];
}> = {
  cyber_amber: {
    name: 'Cyber Gold',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fef08a',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgGradient: 'from-amber-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff']
  },
  neon_cyan: {
    name: 'Neon Cyan',
    primary: '#06b6d4',
    secondary: '#22d3ee',
    accent: '#67e8f9',
    glow: 'rgba(6, 182, 212, 0.45)',
    bgGradient: 'from-cyan-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#06b6d4', '#22d3ee', '#38bdf8', '#a5f3fc', '#ffffff']
  },
  aurora_emerald: {
    name: 'Aurora Green',
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgGradient: 'from-emerald-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#10b981', '#34d399', '#059669', '#a7f3d0', '#6ee7b7']
  },
  electric_pink: {
    name: 'Electric Pink',
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#fbcfe8',
    glow: 'rgba(236, 72, 153, 0.45)',
    bgGradient: 'from-pink-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#ec4899', '#f472b6', '#db2777', '#fdf2f8', '#ffffff']
  },
  deep_purple: {
    name: 'Cosmic Violet',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c4b5fd',
    glow: 'rgba(139, 92, 246, 0.45)',
    bgGradient: 'from-purple-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#8b5cf6', '#a78bfa', '#7c3aed', '#ddd6fe', '#ffffff']
  },
  rainbow_flux: {
    name: 'Rainbow Flux',
    primary: '#6366f1',
    secondary: '#ec4899',
    accent: '#06b6d4',
    glow: 'rgba(99, 102, 241, 0.45)',
    bgGradient: 'from-indigo-950/30 via-zinc-950 to-zinc-950',
    particleColors: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899']
  }
};

export function AudioDynamicVisualizer({
  isPlaying,
  isVip = false,
  trackTitle = 'Đang phát âm thanh',
  artist = 'Nghệ sĩ',
  coverUrl,
  compact = false,
  className = '',
  defaultMode = 'bars',
}: AudioDynamicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [mode, setMode] = useState<VisualizerMode>(defaultMode);
  const [theme, setTheme] = useState<VisualizerTheme>(isVip ? 'cyber_amber' : 'neon_cyan');
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [showControls, setShowControls] = useState<boolean>(!compact);

  // Audio Stats
  const [liveStats, setLiveStats] = useState({
    rms: 0,
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
    peakHz: 0,
    isBeat: false
  });

  // State refs for animation loop
  const particlesRef = useRef<Particle[]>([]);
  const peakCapsRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const smoothedRmsRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  // Initialize Particles
  useEffect(() => {
    const particles: Particle[] = [];
    const count = compact ? 40 : 80;
    const colors = THEME_CONFIGS[theme].particleColors;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 160;
      particles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 1.5 + Math.random() * 3,
        baseRadius: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.7,
        angle,
        distance,
        speed: 0.005 + Math.random() * 0.015,
        freqIndex: Math.floor(Math.random() * 48)
      });
    }
    particlesRef.current = particles;
  }, [theme, compact]);

  // Main Canvas Rendering Loop with D3 Scales & Web Audio Analyzer Data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Buffer Setup
    const fftSize = 256;
    const bufferLength = fftSize / 2; // 128 bins
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Initialize Peaks
    if (peakCapsRef.current.length !== 48) {
      peakCapsRef.current = new Array(48).fill(0);
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Fetch Real Web Audio Data
      webAudioEqualizer.getFrequencyData(freqData);
      webAudioEqualizer.getTimeDomainData(timeData);

      // Check if actual frequency audio signal exists
      let hasRealSignal = false;
      let totalEnergy = 0;
      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;
      let maxBinVal = 0;
      let peakBinIdx = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = freqData[i];
        totalEnergy += val;
        if (val > maxBinVal) {
          maxBinVal = val;
          peakBinIdx = i;
        }
        if (i < 8) bassSum += val; // ~0 - 350 Hz
        else if (i < 40) midSum += val; // ~350 Hz - 3.5 kHz
        else trebleSum += val; // Highs
        if (val > 8) hasRealSignal = true;
      }

      const activeTheme = THEME_CONFIGS[theme];
      phaseRef.current += 0.04;
      const phase = phaseRef.current;

      // Synthetic fallback wave if audio is paused or restricted by cross-origin
      const now = Date.now();
      const syntheticEnergy = isPlaying ? 0.65 + Math.sin(phase * 1.5) * 0.25 : 0.05;

      let normalizedRms = 0;
      let bassEnergy = 0;
      let midEnergy = 0;
      let trebleEnergy = 0;

      if (hasRealSignal && isPlaying) {
        normalizedRms = Math.min(1.0, (totalEnergy / (bufferLength * 255)) * sensitivity);
        bassEnergy = Math.min(1.0, (bassSum / (8 * 255)) * sensitivity);
        midEnergy = Math.min(1.0, (midSum / (32 * 255)) * sensitivity);
        trebleEnergy = Math.min(1.0, (trebleSum / ((bufferLength - 40) * 255)) * sensitivity);
      } else if (isPlaying) {
        normalizedRms = syntheticEnergy;
        bassEnergy = Math.max(0.1, 0.6 + Math.sin(phase * 2.2) * 0.35);
        midEnergy = Math.max(0.1, 0.5 + Math.cos(phase * 1.8) * 0.3);
        trebleEnergy = Math.max(0.05, 0.4 + Math.sin(phase * 3.1) * 0.25);
      }

      // Smooth RMS for fluid visual pulsing
      smoothedRmsRef.current += (normalizedRms - smoothedRmsRef.current) * 0.18;
      const currentRms = smoothedRmsRef.current;

      // Beat detection on bass kick
      const isBeat = bassEnergy > 0.65 && now - lastBeatTimeRef.current > 240;
      if (isBeat) {
        lastBeatTimeRef.current = now;
      }

      // Update Live UI Stats (throttled every 6 frames)
      if (Math.floor(phase * 10) % 6 === 0) {
        const binHz = Math.round((peakBinIdx * 44100) / fftSize);
        setLiveStats({
          rms: Math.round(currentRms * 100),
          bassEnergy: Math.round(bassEnergy * 100),
          midEnergy: Math.round(midEnergy * 100),
          trebleEnergy: Math.round(trebleEnergy * 100),
          peakHz: binHz > 0 ? binHz : 440,
          isBeat
        });
      }

      // Center coords
      const cx = width / 2;
      const cy = height / 2;

      // =========================================================================
      // MODE 1: BARS - D3 Logarithmic Frequency Spectrum & Decaying Peak Caps
      // =========================================================================
      if (mode === 'bars') {
        const numBars = compact ? 32 : 48;
        const barMargin = 2.5;
        const totalBarWidth = width - (numBars - 1) * barMargin;
        const barWidth = Math.max(2, totalBarWidth / numBars);

        // D3 Color Scale for Rainbow or Gradient
        const colorScale = d3.scaleSequential()
          .domain([0, numBars])
          .interpolator(theme === 'rainbow_flux' ? d3.interpolateRainbow : d3.interpolateCool);

        // D3 Log Scale for Frequency Binning
        const binScale = d3.scaleLog()
          .domain([1, numBars])
          .range([1, Math.min(bufferLength - 1, 64)]);

        for (let i = 0; i < numBars; i++) {
          let value = 0;
          if (hasRealSignal && isPlaying) {
            const mappedBin = Math.floor(binScale(i + 1));
            value = (freqData[mappedBin] / 255) * sensitivity;
          } else if (isPlaying) {
            const wave1 = Math.sin(phase * 1.6 + i * 0.22) * 0.4 + 0.5;
            const wave2 = Math.cos(phase * 2.4 + i * 0.12) * 0.25;
            const boost = (i < 10 ? bassEnergy : i < 30 ? midEnergy : trebleEnergy);
            value = Math.max(0.08, (wave1 + wave2) * boost);
          } else {
            value = 0.04 + Math.sin(phase * 0.5 + i * 0.15) * 0.02;
          }

          value = Math.min(1.0, Math.max(0.02, value));
          const barHeight = value * (height * 0.72);
          const x = i * (barWidth + barMargin);
          const y = height - barHeight - 8;

          // Decaying Peak Cap Physics
          if (barHeight > (peakCapsRef.current[i] || 0)) {
            peakCapsRef.current[i] = barHeight;
          } else {
            peakCapsRef.current[i] = Math.max(0, (peakCapsRef.current[i] || 0) - 1.6);
          }
          const peakY = height - (peakCapsRef.current[i] || 0) - 8;

          // Bar Gradient
          const gradient = ctx.createLinearGradient(0, height, 0, y);
          if (theme === 'rainbow_flux') {
            const c = colorScale(i);
            gradient.addColorStop(0, 'rgba(30, 41, 59, 0.6)');
            gradient.addColorStop(0.6, c);
            gradient.addColorStop(1, '#ffffff');
          } else {
            gradient.addColorStop(0, activeTheme.glow.replace('0.45', '0.2'));
            gradient.addColorStop(0.5, activeTheme.primary);
            gradient.addColorStop(1, activeTheme.accent);
          }

          // Main Bar Body
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Peak Cap
          if (isPlaying) {
            ctx.fillStyle = theme === 'rainbow_flux' ? '#ffffff' : activeTheme.accent;
            ctx.shadowColor = activeTheme.primary;
            ctx.shadowBlur = 6;
            ctx.fillRect(x, Math.max(4, peakY - 3), barWidth, 2);
            ctx.shadowBlur = 0;
          }

          // Subtle Mirror Floor Reflection
          const reflectionH = barHeight * 0.22;
          const refGradient = ctx.createLinearGradient(0, height, 0, height + reflectionH);
          refGradient.addColorStop(0, activeTheme.glow.replace('0.45', '0.25'));
          refGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = refGradient;
          ctx.fillRect(x, height - 6, barWidth, reflectionH);
        }
      }

      // =========================================================================
      // MODE 2: RADIAL - 360° Circular Holographic Ring & Spoke Spectrum
      // =========================================================================
      else if (mode === 'radial') {
        const baseRadius = Math.min(width, height) * (compact ? 0.24 : 0.28);
        const dynamicRadius = baseRadius + currentRms * 18 + (isBeat ? 8 : 0);
        const spokes = compact ? 48 : 72;

        // Center Pulsing Orb Background
        const centerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, dynamicRadius);
        centerGradient.addColorStop(0, activeTheme.glow.replace('0.45', '0.4'));
        centerGradient.addColorStop(0.7, activeTheme.glow.replace('0.45', '0.1'));
        centerGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, dynamicRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core Ring
        ctx.save();
        ctx.strokeStyle = activeTheme.accent;
        ctx.lineWidth = 2;
        ctx.shadowColor = activeTheme.primary;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Radial Frequency Spokes
        for (let i = 0; i < spokes; i++) {
          const angle = (i / spokes) * Math.PI * 2 + phase * 0.2;
          const dataIdx = Math.floor((i / spokes) * (bufferLength / 2));
          let val = 0;

          if (hasRealSignal && isPlaying) {
            val = (freqData[dataIdx] / 255) * sensitivity;
          } else if (isPlaying) {
            val = 0.35 + Math.sin(phase * 2.5 + i * 0.3) * 0.35 * bassEnergy;
          } else {
            val = 0.08 + Math.sin(phase + i * 0.2) * 0.04;
          }

          val = Math.min(1.2, Math.max(0.04, val));
          const maxSpokeLen = Math.min(width, height) * 0.28;
          const spokeLen = val * maxSpokeLen;

          const x1 = cx + Math.cos(angle) * dynamicRadius;
          const y1 = cy + Math.sin(angle) * dynamicRadius;
          const x2 = cx + Math.cos(angle) * (dynamicRadius + spokeLen);
          const y2 = cy + Math.sin(angle) * (dynamicRadius + spokeLen);

          ctx.save();
          ctx.strokeStyle = theme === 'rainbow_flux' 
            ? d3.interpolateRainbow(i / spokes) 
            : activeTheme.primary;
          ctx.lineWidth = Math.max(1.8, (width / spokes) * 0.6);
          ctx.lineCap = 'round';
          ctx.shadowColor = activeTheme.primary;
          ctx.shadowBlur = val > 0.5 ? 8 : 2;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Outer Sparkle Tip
          if (val > 0.4 && isPlaying) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x2, y2, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // =========================================================================
      // MODE 3: FLUID WAVE - D3 Cardinal Spline Multi-Layer Ribbons
      // =========================================================================
      else if (mode === 'fluid_wave') {
        const pointsCount = compact ? 24 : 36;
        const stepX = width / (pointsCount - 1);

        // Generate 3 harmonic wave curves using D3 line generator with curveBasis
        const layers = [
          {
            color: activeTheme.primary,
            underfill: activeTheme.glow.replace('0.45', '0.22'),
            freqOffset: 0,
            amplitude: height * 0.32 * (bassEnergy + 0.3),
            speed: 1.8,
            lineWidth: 3
          },
          {
            color: activeTheme.secondary,
            underfill: activeTheme.glow.replace('0.45', '0.14'),
            freqOffset: Math.PI * 0.5,
            amplitude: height * 0.26 * (midEnergy + 0.25),
            speed: 2.3,
            lineWidth: 2.2
          },
          {
            color: activeTheme.accent,
            underfill: 'transparent',
            freqOffset: Math.PI,
            amplitude: height * 0.20 * (trebleEnergy + 0.2),
            speed: 3.1,
            lineWidth: 1.8
          }
        ];

        layers.forEach((layer) => {
          const rawPoints: [number, number][] = [];
          for (let i = 0; i < pointsCount; i++) {
            const x = i * stepX;
            let val = 0;
            const dataIdx = Math.floor((i / pointsCount) * (bufferLength / 2));

            if (hasRealSignal && isPlaying) {
              const audioVal = (timeData[dataIdx] - 128) / 128;
              val = audioVal * sensitivity;
            } else if (isPlaying) {
              val = Math.sin(phase * layer.speed + i * 0.35 + layer.freqOffset) * 0.65;
            } else {
              val = Math.sin(phase * 0.5 + i * 0.2) * 0.1;
            }

            const y = cy + val * layer.amplitude;
            rawPoints.push([x, y]);
          }

          // D3 Line Generator for smooth spline
          const lineGenerator = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis);

          const svgPathStr = lineGenerator(rawPoints);
          if (svgPathStr) {
            const path2D = new Path2D(svgPathStr);

            // Underfill area to bottom
            if (layer.underfill !== 'transparent') {
              ctx.save();
              const areaGenerator = d3.area<[number, number]>()
                .x(d => d[0])
                .y0(height)
                .y1(d => d[1])
                .curve(d3.curveBasis);
              const areaStr = areaGenerator(rawPoints);
              if (areaStr) {
                const areaPath = new Path2D(areaStr);
                const grad = ctx.createLinearGradient(0, cy - layer.amplitude, 0, height);
                grad.addColorStop(0, layer.underfill);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill(areaPath);
              }
              ctx.restore();
            }

            // Stroke line
            ctx.save();
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = layer.lineWidth;
            ctx.shadowColor = layer.color;
            ctx.shadowBlur = 10;
            ctx.stroke(path2D);
            ctx.restore();
          }
        });
      }

      // =========================================================================
      // MODE 4: GALAXY - Audio Particle Swarm & Constellation Web
      // =========================================================================
      else if (mode === 'galaxy') {
        const particles = particlesRef.current;
        const bassBoost = bassEnergy * 2.2 + 0.8;

        // Draw connecting constellation lasers between close particles
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];

          // React to particle freq index
          const fVal = hasRealSignal ? (freqData[p1.freqIndex] / 255) : (Math.sin(phase + i) * 0.4 + 0.5);
          p1.angle += p1.speed * (1 + fVal * 2.5);
          const currentDist = p1.distance * (1 + currentRms * 0.4 + (isBeat ? 0.2 : 0));
          p1.x = cx + Math.cos(p1.angle) * currentDist;
          p1.y = cy + Math.sin(p1.angle) * currentDist * 0.75; // Isometric tilt
          p1.radius = p1.baseRadius * (1 + fVal * 1.5);

          // Render Particle
          ctx.save();
          ctx.fillStyle = p1.color;
          ctx.shadowColor = p1.color;
          ctx.shadowBlur = fVal > 0.5 ? 12 : 4;
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, Math.max(1, p1.radius), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Connect with neighbor
          for (let j = i + 1; j < Math.min(particles.length, i + 8); j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 65) {
              ctx.strokeStyle = activeTheme.glow.replace('0.45', String((1 - dist / 65) * 0.35));
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Center Pulsing Core
        const coreR = Math.max(12, 28 * bassBoost);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, activeTheme.accent);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      }

      // =========================================================================
      // MODE 5: OSCILLOSCOPE - Raw Time Domain Cyber Beam
      // =========================================================================
      else if (mode === 'oscilloscope') {
        const sliceWidth = width / bufferLength;
        const rawPoints: [number, number][] = [];

        for (let i = 0; i < bufferLength; i++) {
          const x = i * sliceWidth;
          let val = 128;
          if (hasRealSignal && isPlaying) {
            val = timeData[i];
          } else if (isPlaying) {
            val = 128 + Math.sin(phase * 3 + i * 0.15) * 45 * sensitivity + Math.cos(phase * 1.8 + i * 0.08) * 25;
          } else {
            val = 128 + Math.sin(phase * 0.6 + i * 0.1) * 6;
          }
          const y = (val / 255) * height;
          rawPoints.push([x, y]);
        }

        // D3 Cardinal Spline for Laser Beam
        const lineGen = d3.line<[number, number]>()
          .x(d => d[0])
          .y(d => d[1])
          .curve(d3.curveCardinal);

        const pathStr = lineGen(rawPoints);
        if (pathStr) {
          const laserPath = new Path2D(pathStr);

          // PASS 1: Broad Atmospheric Glow
          ctx.save();
          ctx.strokeStyle = activeTheme.primary;
          ctx.lineWidth = 8;
          ctx.shadowColor = activeTheme.primary;
          ctx.shadowBlur = 18;
          ctx.stroke(laserPath);
          ctx.restore();

          // PASS 2: Crisp Neon Mid-Line
          ctx.save();
          ctx.strokeStyle = activeTheme.accent;
          ctx.lineWidth = 3;
          ctx.stroke(laserPath);
          ctx.restore();

          // PASS 3: Razor White Center Core
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke(laserPath);
          ctx.restore();
        }

        // Center Grid Crosshairs
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, theme, isPlaying, sensitivity, compact]);

  // Handle Resize using ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);
    updateSize();

    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      id="audio-dynamic-visualizer-container"
      className={`relative w-full h-full min-h-[160px] rounded-3xl overflow-hidden bg-gradient-to-b ${THEME_CONFIGS[theme].bgGradient} border border-zinc-800/80 shadow-2xl flex flex-col justify-between p-3.5 transition-colors duration-500 select-none ${className}`}
    >
      {/* Background Ambient Aura Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${THEME_CONFIGS[theme].glow} 0%, transparent 75%)`
        }}
      />

      {/* Top Header: Live Audio Stats & Diagnostics */}
      <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-2.5 py-1 rounded-xl shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            <span className="font-extrabold text-white text-[11px] uppercase tracking-wider">
              {isPlaying ? 'Live Spectrum' : 'Standby'}
            </span>
          </div>

          {!compact && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-950/60 px-2.5 py-1 rounded-xl border border-zinc-800/60 font-mono">
              <span className="text-amber-400 font-bold">Bass: {liveStats.bassEnergy}%</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Mid: {liveStats.midEnergy}%</span>
              <span>•</span>
              <span className="text-purple-400 font-bold">Treble: {liveStats.trebleEnergy}%</span>
              <span>•</span>
              <span className="text-zinc-300 font-bold">Peak: {liveStats.peakHz} Hz</span>
            </div>
          )}
        </div>

        {/* Action Toggle Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className="p-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1"
            title="Tùy chỉnh hiệu ứng hiển thị"
          >
            <Sliders size={13} className="text-amber-400" />
            <span className="hidden md:inline font-semibold">Tùy biến</span>
          </button>
        </div>
      </div>

      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          id="audio-dynamic-visualizer-canvas"
          className="w-full h-full block"
        />
      </div>

      {/* Interactive Toolbar Drawer */}
      {showControls && (
        <div className="relative z-10 mt-auto pt-2 bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/90 p-2.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'bars', label: 'Cột Phổ D3', icon: Activity },
              { id: 'radial', label: 'Vòng 360°', icon: Orbit },
              { id: 'fluid_wave', label: 'Dải Sóng', icon: Waves },
              { id: 'galaxy', label: 'Ngân Hà', icon: Sparkles },
              { id: 'oscilloscope', label: 'Laser Tia', icon: Zap },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as VisualizerMode)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                  }`}
                >
                  <Icon size={12} className={isSelected ? 'text-amber-400' : ''} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Palette Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1 hidden lg:inline">Màu Sắc:</span>
            {(Object.keys(THEME_CONFIGS) as VisualizerTheme[]).map((tKey) => {
              const t = THEME_CONFIGS[tKey];
              const isSelected = theme === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setTheme(tKey)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    isSelected ? 'scale-115 border-white shadow-md' : 'border-zinc-700 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.primary }}
                  title={t.name}
                />
              );
            })}
          </div>

          {/* Sensitivity Slider */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[10px] font-bold text-zinc-400">Độ nhạy:</span>
            <input
              type="range"
              min="0.5"
              max="2.2"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
            />
            <span className="text-[10px] font-mono text-zinc-300 font-semibold">{sensitivity.toFixed(1)}x</span>
          </div>
        </div>
      )}
    </div>
  );
}
