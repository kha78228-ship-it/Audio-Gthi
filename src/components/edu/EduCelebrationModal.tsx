import React, { useEffect, useRef } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  Flame, 
  CheckCircle2, 
  Share2, 
  X, 
  ArrowRight,
  Zap,
  BookOpen
} from 'lucide-react';
import { playEduCelebrationFanfare } from '../../services/eduDailyGoalService';

interface EduCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  dateStr: string;
  totalEstimatedMinutes?: number;
  onOpenNotebook?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'star';
  opacity: number;
}

export function EduCelebrationModal({
  isOpen,
  onClose,
  streakCount,
  dateStr,
  totalEstimatedMinutes = 145,
  onOpenNotebook
}: EduCelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedShare, setCopiedShare] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger triumphant fanfare sound
    playEduCelebrationFanfare();

    // Canvas Confetti Animation Loop
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = [
      '#10b981', // emerald
      '#06b6d4', // cyan
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#f43f5e', // rose
      '#3b82f6', // blue
      '#eab308'  // gold
    ];

    const particleCount = 130;
    const particles: Particle[] = [];

    // Seed particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star'),
        opacity: 1
      });
    }

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.985; // friction
        p.rotation += p.rotationSpeed;

        if (p.y > height - 20) {
          p.opacity -= 0.02;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw diamond star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.5, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.5, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (frame < 260) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = `🎯 Tôi vừa hoàn thành trọn vẹn 7/7 Trụ Cột Mục Tiêu Ngày trong Haevy Edu (Ôn thi THPT 2027 & GDPT 2018 theo tư duy First Principles)! 🔥 Chuỗi liên tiếp: ${Math.max(1, streakCount)} ngày.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Confetti Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Main Celebration Dialog Box */}
      <div 
        className="relative z-20 w-full max-w-lg bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/80 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient Lights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X size={18} />
        </button>

        {/* Hero Trophy & Animated Crown Badge */}
        <div className="relative mb-3.5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-300 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce duration-1000">
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
              <Trophy size={42} className="text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-md">
            <Sparkles size={12} />
            <span>100%</span>
          </div>
        </div>

        {/* Headline */}
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
          Kỷ Lục Rèn Luyện Bản Chất
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 tracking-tight leading-snug mb-2">
          CHINH PHỤC TRỌN VẸN 7/7 TRỤ CỘT!
        </h2>

        {/* First Principles Insight Quote */}
        <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed max-w-md mb-5 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
          &ldquo;Hôm nay bạn đã hoàn thành đầy đủ từ bóc tách khái niệm gốc, phản biện Đúng/Sai, làm chủ fx-880, thí nghiệm STEM đến áp lực thi thử. Kiên định mỗi ngày chính là chìa khóa bứt phá điểm số thực chất!&rdquo;
        </p>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
              <CheckCircle2 size={16} />
              <span className="text-base sm:text-lg font-black font-mono">7 / 7</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Trụ Cột Đạt</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-amber-500/30 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 mb-0.5">
              <Flame size={16} className="text-amber-400 animate-pulse" />
              <span className="text-base sm:text-lg font-black font-mono">{Math.max(1, streakCount)} Ngày</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Chuỗi Liên Tục</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-purple-500/30 flex flex-col items-center">
            <div className="flex items-center gap-1 text-purple-400 mb-0.5">
              <Zap size={16} />
              <span className="text-base sm:text-lg font-black font-mono">+100 XP</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Thưởng Kỷ Luật</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <button
            onClick={handleShare}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Share2 size={14} />
            <span>{copiedShare ? 'Đã sao chép thành tích!' : 'Chia sẻ thành tích'}</span>
          </button>

          {onOpenNotebook && (
            <button
              onClick={() => {
                onClose();
                onOpenNotebook();
              }}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/60 hover:bg-teal-900/70 border border-teal-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <BookOpen size={14} />
              <span>Ghi vào Sổ Tay</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-zinc-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Tiếp Tục</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
