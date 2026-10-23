import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Compass,
  Headphones,
  Heart,
  Sparkles,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { haptics } from '../../utils/haptics';

export interface LivingPersona {
  id: string;
  name: string;
  role: string;
  discipline: string;
  quote: string;
  targetMode: string;
  targetLabel: string;
  metricLabel: string;
  metricValue: string;
  palette: {
    bgTop: string;
    bgBottom: string;
    rimLight: string;
    accentHex: string;
    skinTone: string;
    skinShadow: string;
    hairColor: string;
    garmentColor: string;
    garmentAccent: string;
  };
  sceneType: 'acoustic' | 'first_principles' | 'companionship' | 'heritage';
}

export const LIVING_PERSONAS: LivingPersona[] = [
  {
    id: 'minh-anh',
    name: 'Lâm Vũ Minh Anh',
    role: 'Đạo diễn Âm thanh Không gian',
    discipline: 'Haevy Audio · Phòng thu Lossless',
    quote:
      '“Âm thanh chân thực không nằm ở hiệu ứng màu mè, mà ở khoảng lặng giữa hai nhịp thở và độ ấm của dải tần 432Hz.”',
    targetMode: 'audio',
    targetLabel: 'Mở Phòng Nghe Hi-Fi',
    metricLabel: 'Tần số chuẩn',
    metricValue: '432 Hz · 24-bit',
    palette: {
      bgTop: '#1c1613',
      bgBottom: '#0b0a0e',
      rimLight: '#e2b86b',
      accentHex: '#e2b86b',
      skinTone: '#e8bfa2',
      skinShadow: '#b58367',
      hairColor: '#19161a',
      garmentColor: '#231f20',
      garmentAccent: '#d4a359'
    },
    sceneType: 'acoustic'
  },
  {
    id: 'hoang-bach',
    name: 'TS. Trần Hoàng Bách',
    role: 'Kiến trúc sư Tư duy Nguyên lý gốc',
    discipline: 'Haevy AI · Haevy Edu · Web 4.0',
    quote:
      '“Khi bóc tách mọi vấn đề phức tạp về các tiên đề cơ bản nhất, việc học và nghiên cứu trở thành sự khai sáng tự nhiên.”',
    targetMode: 'edu',
    targetLabel: 'Vào Bàn Học & Lab STEM',
    metricLabel: 'Phương pháp',
    metricValue: 'First Principles',
    palette: {
      bgTop: '#101b1e',
      bgBottom: '#090c10',
      rimLight: '#5eead4',
      accentHex: '#5eead4',
      skinTone: '#dfb497',
      skinShadow: '#a6785c',
      hairColor: '#16181d',
      garmentColor: '#182226',
      garmentAccent: '#4fd1c5'
    },
    sceneType: 'first_principles'
  },
  {
    id: 'linh-huy',
    name: 'Khánh Linh & Gia Huy',
    role: 'Hành trình Đồng hành & Định vị Bình an',
    discipline: 'Haevy Maps · Không gian Cặp đôi',
    quote:
      '“Dù mỗi người một cung đường giữa Sài Gòn nhộn nhịp, chỉ một ánh nhìn trên bản đồ cũng đủ biết người thương đang bình an.”',
    targetMode: 'maps',
    targetLabel: 'Mở Bản Đồ Người Thân',
    metricLabel: 'Kết nối trực tiếp',
    metricValue: 'GPS Thời gian thực',
    palette: {
      bgTop: '#211318',
      bgBottom: '#0b090d',
      rimLight: '#fda4af',
      accentHex: '#fb7185',
      skinTone: '#ecc5ab',
      skinShadow: '#ba896e',
      hairColor: '#1c1618',
      garmentColor: '#291a20',
      garmentAccent: '#f43f5e'
    },
    sceneType: 'companionship'
  },
  {
    id: 'dinh-phong',
    name: 'Nghệ nhân Nguyễn Đình Phong',
    role: 'Người giữ lửa Gia phả & Triết học Phương Đông',
    discipline: 'Haevy Gia Phả · Chiêm nghiệm Nội tâm',
    quote:
      '“Cây có cội mới trổ cành xanh lá. Lưu giữ mạch nguồn gia tộc là trao lại ngọn đuốc ký ức sống động cho muôn đời sau.”',
    targetMode: 'family_tree',
    targetLabel: 'Khám Phá Cây Gia Phả',
    metricLabel: 'Cấu trúc lưu trữ',
    metricValue: 'Đồ thị đa thế hệ',
    palette: {
      bgTop: '#1e1912',
      bgBottom: '#0b0a09',
      rimLight: '#fcd34d',
      accentHex: '#f59e0b',
      skinTone: '#d9ab8a',
      skinShadow: '#9e6f50',
      hairColor: '#3a3637',
      garmentColor: '#261e15',
      garmentAccent: '#d97706'
    },
    sceneType: 'heritage'
  }
];

interface LivingPortraitShowcaseProps {
  onSelectMode?: (mode: string) => void;
}

export const LivingPortraitShowcase: React.FC<LivingPortraitShowcaseProps> = ({
  onSelectMode
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightingPreset, setLightingPreset] = useState<'golden' | 'moonlight' | 'studio'>('golden');
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const persona = LIVING_PERSONAS[activeIndex];

  // Natural human eye blink cycle
  useEffect(() => {
    let timeoutId: number;
    const scheduleBlink = () => {
      const nextDelay = 2600 + Math.random() * 3400;
      timeoutId = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, nextDelay);
    };
    scheduleBlink();
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Auto-advance persona gently if user is not hovering, or allow manual control
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LIVING_PERSONAS.length);
    }, 11000);
    return () => window.clearInterval(interval);
  }, []);

  // Interactive HTML5 Canvas Atmospheric Scene Backdrop (Light rays, dust motes, sound waves, constellations)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const particles = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.2,
      speedX: (Math.random() - 0.5) * 0.00035,
      speedY: -0.0002 - Math.random() * 0.0004,
      phase: i * 0.7
    }));

    const render = () => {
      time += 0.016;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Volumetric window light beam
      const beamGrad = ctx.createLinearGradient(
        width * (0.75 + pointerOffset.x * 0.08),
        0,
        width * 0.15,
        height
      );
      const beamColor =
        lightingPreset === 'golden'
          ? 'rgba(226, 184, 107, 0.13)'
          : lightingPreset === 'moonlight'
          ? 'rgba(125, 211, 252, 0.11)'
          : 'rgba(244, 244, 245, 0.09)';
      beamGrad.addColorStop(0, beamColor);
      beamGrad.addColorStop(0.6, 'rgba(226, 184, 107, 0.03)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.45, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width * 0.75, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // 2. Scene-specific living background geometry
      ctx.save();
      if (persona.sceneType === 'acoustic') {
        // Harmonic analog waveforms
        for (let w = 0; w < 3; w++) {
          ctx.beginPath();
          ctx.strokeStyle =
            w === 0
              ? 'rgba(226, 184, 107, 0.25)'
              : w === 1
              ? 'rgba(226, 184, 107, 0.12)'
              : 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = w === 0 ? 1.5 : 1;
          for (let x = 0; x <= width; x += 8) {
            const normX = x / width;
            const env = Math.sin(normX * Math.PI);
            const y =
              height * 0.72 +
              Math.sin(normX * 10 + time * (1.8 + w * 0.4)) * 18 * env +
              pointerOffset.y * 8;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (persona.sceneType === 'first_principles') {
        // Sacred geometric orbital rings & nodes
        const cx = width * 0.5 + pointerOffset.x * 14;
        const cy = height * 0.42 + pointerOffset.y * 10;
        ctx.strokeStyle = 'rgba(94, 234, 212, 0.14)';
        ctx.lineWidth = 1;
        [68, 108, 148].forEach((radius, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, time * (0.25 + idx * 0.1), time * (0.25 + idx * 0.1) + Math.PI * 1.45);
          ctx.stroke();
        });
      } else if (persona.sceneType === 'companionship') {
        // Dual connected location pulse rings
        const cx = width * 0.5 + pointerOffset.x * 12;
        const cy = height * 0.46 + pointerOffset.y * 10;
        const pulse = (time * 24) % 90;
        ctx.strokeStyle = `rgba(251, 113, 133, ${Math.max(0, 0.28 - pulse / 320)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 45 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Heritage tree branches & golden celestial arcs
        const cx = width * 0.5;
        const cy = height * 0.38;
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 96, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Floating sunlit dust motes / bokeh particles
      particles.forEach((p) => {
        p.x += p.speedX + pointerOffset.x * 0.00015;
        p.y += p.speedY;
        if (p.y < -0.05) p.y = 1.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const alpha = 0.2 + 0.35 * Math.sin(time * 1.5 + p.phase);
        ctx.fillStyle = `rgba(245, 222, 179, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(animId);
  }, [persona, lightingPreset, pointerOffset.x, pointerOffset.y]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointerOffset({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny))
    });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  const triggerHarmonicChord = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const baseFreqs =
        persona.sceneType === 'acoustic'
          ? [216, 324, 432, 648]
          : persona.sceneType === 'first_principles'
          ? [256, 384, 512, 768]
          : persona.sceneType === 'companionship'
          ? [264, 330, 396, 528]
          : [192, 288, 384, 576];

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + idx * 0.06 + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 1.15);
      });
    } catch {
      // Ignore if audio context is blocked
    }
  };

  const handleSelectPersona = (index: number) => {
    haptics.selection();
    setActiveIndex(index);
    if (isAmbientSoundOn) {
      triggerHarmonicChord();
    }
  };

  const handleToggleSound = () => {
    haptics.light();
    const next = !isAmbientSoundOn;
    setIsAmbientSoundOn(next);
    if (next) {
      triggerHarmonicChord();
    }
  };

  useEffect(() => {
    const handleDemoTrigger = () => {
      setActiveIndex((prev) => (prev + 1) % LIVING_PERSONAS.length);
      setIsAmbientSoundOn(true);
      triggerHarmonicChord();
    };
    window.addEventListener('haevy-onboarding-demo-portrait', handleDemoTrigger);
    return () => window.removeEventListener('haevy-onboarding-demo-portrait', handleDemoTrigger);
  }, [persona]);

  const eyeShiftX = pointerOffset.x * 3.2;
  const eyeShiftY = pointerOffset.y * 2.2;
  const headShiftX = pointerOffset.x * 6;
  const headShiftY = pointerOffset.y * 4;

  return (
    <div
      ref={stageRef}
      data-onboarding="living-portrait"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full rounded-2xl overflow-hidden surface-obsidian select-none"
      style={{
        background: `linear-gradient(165deg, ${persona.palette.bgTop} 0%, ${persona.palette.bgBottom} 100%)`
      }}
    >
      {/* Interactive Atmospheric Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={640}
        height={460}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Top Stage Controls Bar: Lighting Mode & Sound Resonance */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-5 pt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-zinc-200 font-medium">Chân dung & Hoạt cảnh</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular text-zinc-400">
            0{activeIndex + 1} / 0{LIVING_PERSONAS.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
            {(
              [
                { id: 'golden', label: 'Hoàng hôn' },
                { id: 'moonlight', label: 'Ánh trăng' },
                { id: 'studio', label: 'Studio' }
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setLightingPreset(preset.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lightingPreset === preset.id
                    ? 'bg-white/15 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isAmbientSoundOn ? 'Tắt âm hưởng không gian' : 'Bật âm hưởng không gian'}
            aria-label="Âm hưởng không gian"
          >
            {isAmbientSoundOn ? <Volume2 size={14} className="text-amber-300" /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main Living Portrait Stage */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 items-center gap-4 px-4 sm:px-6 pt-3 pb-5">
        {/* Left/Center: Interactive Chiaroscuro Portrait Figure with Eye & Head Parallax */}
        <div className="sm:col-span-6 flex items-center justify-center relative min-h-[250px] sm:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-56 h-64 sm:w-64 sm:h-72 flex items-center justify-center"
            >
              {/* Warm Backlight Halo */}
              <div
                className="absolute inset-4 rounded-full blur-2xl animate-breathe-light pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${persona.palette.rimLight}33 0%, transparent 72%)`,
                  transform: `translate3d(${-headShiftX * 1.2}px, ${-headShiftY * 1.2}px, 0)`
                }}
              />

              {/* Framed Editorial Portrait SVG with Living Parallax, Breathing & Blinking */}
              <svg
                viewBox="0 0 260 300"
                className="w-full h-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.75)] overflow-visible"
                role="img"
                aria-label={`Chân dung sống động của ${persona.name}`}
              >
                <defs>
                  <linearGradient id={`skinGrad-${persona.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={persona.palette.skinTone} />
                    <stop offset="70%" stopColor={persona.palette.skinShadow} />
                    <stop offset="100%" stopColor="#3b261d" />
                  </linearGradient>
                  <linearGradient id={`rimGrad-${persona.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={persona.palette.rimLight} stopOpacity="0.85" />
                    <stop offset="25%" stopColor={persona.palette.rimLight} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`garmentGrad-${persona.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={persona.palette.garmentColor} />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>
                </defs>

                {/* Architectural Arch Frame Behind Portrait */}
                <path
                  d="M 36,290 L 36,115 A 94,94 0 0,1 224,115 L 224,290 Z"
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />

                {/* Subtle Inner Rim Arch */}
                <path
                  d="M 46,285 L 46,118 A 84,84 0 0,1 214,118 L 214,285"
                  fill="none"
                  stroke={persona.palette.rimLight}
                  strokeOpacity="0.22"
                  strokeWidth="0.75"
                />

                {/* Breathing Torso & Tailored Garment */}
                <g
                  className="animate-float-slow"
                  style={{
                    transform: `translate(${headShiftX * 0.45}px, ${headShiftY * 0.35}px)`
                  }}
                >
                  {/* Shoulders & Coat */}
                  <path
                    d="M 38,290 C 42,226 78,205 130,205 C 182,205 218,226 222,290 Z"
                    fill={`url(#garmentGrad-${persona.id})`}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  {/* Collar / Lapel Detail */}
                  <path
                    d="M 102,206 L 130,248 L 158,206"
                    fill="none"
                    stroke={persona.palette.garmentAccent}
                    strokeWidth="2"
                    strokeOpacity="0.75"
                  />

                  {/* Studio Headphones around neck for Audio Persona */}
                  {persona.sceneType === 'acoustic' && (
                    <g>
                      <path
                        d="M 88,208 C 88,236 172,236 172,208"
                        fill="none"
                        stroke="#d4a359"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                      />
                      <ellipse cx="96" cy="214" rx="14" ry="18" fill="#18181b" stroke="#e2b86b" strokeWidth="2" />
                      <ellipse cx="164" cy="214" rx="14" ry="18" fill="#18181b" stroke="#e2b86b" strokeWidth="2" />
                    </g>
                  )}

                  {/* Neck & Chiaroscuro Shadow */}
                  <path
                    d="M 112,166 L 112,214 C 112,224 148,224 148,214 L 148,166 Z"
                    fill={`url(#skinGrad-${persona.id})`}
                  />
                  <path
                    d="M 113,174 C 122,190 142,192 148,182 L 148,168 L 113,168 Z"
                    fill="rgba(0,0,0,0.28)"
                  />
                </g>

                {/* Head, Hair & Expressive Living Face */}
                <g
                  style={{
                    transform: `translate(${headShiftX}px, ${headShiftY}px)`,
                    transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Back Hair Silhouette */}
                  {persona.id === 'minh-anh' || persona.id === 'linh-huy' ? (
                    <path
                      d="M 76,118 C 70,155 74,205 88,222 C 110,225 152,225 172,222 C 186,205 190,155 184,118 C 178,70 82,70 76,118 Z"
                      fill={persona.palette.hairColor}
                    />
                  ) : null}

                  {/* Ears */}
                  <ellipse cx="86" cy="136" rx="7" ry="13" fill={persona.palette.skinShadow} />
                  <ellipse cx="174" cy="136" rx="7" ry="13" fill={persona.palette.skinTone} />

                  {/* Sculpted Head Contour */}
                  <path
                    d="M 88,108 C 88,72 172,72 172,108 C 172,146 156,182 130,185 C 104,182 88,146 88,108 Z"
                    fill={`url(#skinGrad-${persona.id})`}
                  />

                  {/* Golden Window Rim Light on Left Cheek & Jaw */}
                  <path
                    d="M 88,108 C 88,72 172,72 172,108 C 172,146 156,182 130,185 C 104,182 88,146 88,108 Z"
                    fill={`url(#rimGrad-${persona.id})`}
                  />

                  {/* Expressive Eyebrows & Eyes (Follow Pointer Gaze) */}
                  <g
                    style={{
                      transform: `translate(${eyeShiftX}px, ${eyeShiftY}px)`,
                      transition: 'transform 90ms ease-out'
                    }}
                  >
                    {/* Eyebrows */}
                    <path
                      d="M 102,115 Q 112,110 121,114"
                      fill="none"
                      stroke={persona.palette.hairColor}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 139,114 Q 148,110 158,115"
                      fill="none"
                      stroke={persona.palette.hairColor}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />

                    {/* Left & Right Eyes (with natural blink) */}
                    {isBlinking ? (
                      <>
                        <path
                          d="M 103,126 Q 112,129 120,126"
                          fill="none"
                          stroke="#1f1614"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 140,126 Q 148,129 157,126"
                          fill="none"
                          stroke="#1f1614"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        {/* Left Eye */}
                        <ellipse cx="111.5" cy="126" rx="7.5" ry="4.5" fill="#faf7f5" />
                        <circle cx={111.5 + eyeShiftX * 0.35} cy={126 + eyeShiftY * 0.25} r="3.4" fill="#291d18" />
                        <circle cx={110.2 + eyeShiftX * 0.35} cy={124.8 + eyeShiftY * 0.25} r="1.1" fill="#ffffff" />
                        <path
                          d="M 103,125 Q 111.5,120 120,125"
                          fill="none"
                          stroke="#1f1614"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        {/* Right Eye */}
                        <ellipse cx="148.5" cy="126" rx="7.5" ry="4.5" fill="#faf7f5" />
                        <circle cx={148.5 + eyeShiftX * 0.35} cy={126 + eyeShiftY * 0.25} r="3.4" fill="#291d18" />
                        <circle cx={147.2 + eyeShiftX * 0.35} cy={124.8 + eyeShiftY * 0.25} r="1.1" fill="#ffffff" />
                        <path
                          d="M 140,125 Q 148.5,120 157,125"
                          fill="none"
                          stroke="#1f1614"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Architectural Eyeglasses for Researcher Persona */}
                    {persona.id === 'hoang-bach' && (
                      <g stroke="#e2b86b" strokeWidth="1.4" fill="rgba(94, 234, 212, 0.06)">
                        <rect x="100" y="119" width="23" height="14" rx="4" />
                        <rect x="137" y="119" width="23" height="14" rx="4" />
                        <line x1="123" y1="125" x2="137" y2="125" />
                      </g>
                    )}

                    {/* Nose Bridge & Chiaroscuro Highlight */}
                    <path
                      d="M 130,120 L 128,144 Q 130,147 134,145"
                      fill="none"
                      stroke="rgba(75, 42, 28, 0.65)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    {/* Serene Authentic Smile */}
                    <path
                      d="M 119,159 Q 130,165 141,159"
                      fill="none"
                      stroke="#8a4b3c"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 123,163 Q 130,166 137,163"
                      fill="none"
                      stroke="rgba(0,0,0,0.22)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Front Hair / Crown Styling */}
                  <path
                    d="M 85,114 C 84,74 114,62 134,64 C 158,66 177,80 175,114 C 166,95 148,88 126,92 C 106,96 94,102 85,114 Z"
                    fill={persona.palette.hairColor}
                  />
                  {/* Hair Rim Shine */}
                  <path
                    d="M 90,94 Q 118,74 152,82"
                    fill="none"
                    stroke={persona.palette.rimLight}
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Editorial Story, Live Quote & Direct Subsystem Launch */}
        <div className="sm:col-span-6 flex flex-col justify-between space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="text-xs text-zinc-400">
                <span style={{ color: persona.palette.accentHex }} className="font-medium">
                  {persona.discipline}
                </span>
              </div>

              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  {persona.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{persona.role}</p>
              </div>

              <blockquote className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal italic">
                {persona.quote}
              </blockquote>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">{persona.metricLabel}</span>
                  <span className="font-mono-tabular text-zinc-200 font-medium">
                    {persona.metricValue}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptics.modeSwitch();
                    onSelectMode?.(persona.targetMode);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{persona.targetLabel}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Persona Selector Thumbnails Bar */}
          <div className="pt-2 border-t border-white/10">
            <div className="grid grid-cols-4 gap-1.5">
              {LIVING_PERSONAS.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPersona(idx)}
                    className={`p-2 rounded-lg text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white/12 border-white/25 text-white'
                        : 'bg-black/25 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-[10px] font-mono-tabular text-zinc-500">0{idx + 1}</div>
                    <div className="text-[11px] font-semibold truncate mt-0.5">
                      {item.name.split(' ').slice(-2).join(' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
