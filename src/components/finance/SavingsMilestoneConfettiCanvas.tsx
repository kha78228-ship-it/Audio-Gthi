import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Trophy, Award, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MilestoneCelebrationData {
  goalId: string;
  goalTitle: string;
  goalColor?: string;
  milestonePercentage: number;
  badgeName: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
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
  opacity: number;
  shape: 'rect' | 'circle' | 'star' | 'ribbon';
  length: number;
  wobble: number;
  wobbleSpeed: number;
}

interface SavingsMilestoneConfettiCanvasProps {
  celebration: MilestoneCelebrationData | null;
  onClose: () => void;
}

const CONFETTI_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#fbbf24', // Yellow Gold
  '#f43f5e', // Rose
  '#ffffff', // Crisp White
];

export const SavingsMilestoneConfettiCanvas: React.FC<SavingsMilestoneConfettiCanvasProps> = ({
  celebration,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isRunningRef = useRef(false);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Spawn confetti particles from both sides or center
  const spawnParticles = useCallback((width: number, height: number, count: number = 180) => {
    const particles: Particle[] = [];
    const shapes: ('rect' | 'circle' | 'star' | 'ribbon')[] = ['rect', 'circle', 'star', 'ribbon'];

    for (let i = 0; i < count; i++) {
      // Half from left cannon, half from right cannon, plus some center bursts
      const source = i % 3;
      let startX = width / 2;
      let startY = height * 0.45;
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // upward spray
      let velocity = 12 + Math.random() * 22;

      if (source === 0) {
        // Left cannon
        startX = Math.random() * (width * 0.2);
        startY = height * 0.85;
        angle = -Math.PI * 0.35 + (Math.random() - 0.5) * 0.7; // sprays right-up
        velocity = 16 + Math.random() * 20;
      } else if (source === 1) {
        // Right cannon
        startX = width - Math.random() * (width * 0.2);
        startY = height * 0.85;
        angle = -Math.PI * 0.65 + (Math.random() - 0.5) * 0.7; // sprays left-up
        velocity = 16 + Math.random() * 20;
      }

      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 6 + Math.random() * 10;

      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        opacity: 1,
        shape,
        length: size * (1.2 + Math.random() * 1.5),
        wobble: Math.random() * 10,
        wobbleSpeed: 0.05 + Math.random() * 0.1
      });
    }

    particlesRef.current = particles;
  }, []);

  // Canvas render loop
  useEffect(() => {
    if (!celebration) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle responsive canvas sizing
    const updateSize = () => {
      const container = containerRef.current || canvas.parentElement || document.body;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    updateSize();
    const rect = canvas.getBoundingClientRect();
    spawnParticles(rect.width, rect.height, 220);
    isRunningRef.current = true;

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Animation physics loop
    const gravity = 0.38;
    const drag = 0.982;

    const render = () => {
      if (!isRunningRef.current) return;
      const rectNow = canvas.getBoundingClientRect();
      const w = rectNow.width;
      const h = rectNow.height;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0.01 || p.y > h + 40) continue;

        activeCount++;

        // Update physics
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out gradually as they fall
        if (p.y > h * 0.6) {
          p.opacity = Math.max(0, p.opacity - 0.012);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Render respective particle shape
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          // 4-point sparkle star
          const spikes = 4;
          const outerR = p.size;
          const innerR = p.size * 0.38;
          ctx.beginPath();
          for (let s = 0; s < spikes * 2; s++) {
            const r = s % 2 === 0 ? outerR : innerR;
            const a = (s * Math.PI) / spikes;
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'ribbon') {
          const ribbonW = p.size * 0.7;
          const ribbonH = p.length * (1 + Math.sin(p.wobble) * 0.3);
          ctx.fillRect(-ribbonW / 2, -ribbonH / 2, ribbonW, ribbonH);
        } else {
          // Standard confetti rectangle
          ctx.fillRect(-p.size / 2, -p.length / 2, p.size, p.length);
        }

        ctx.restore();
      }

      if (activeCount > 0) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        // All particles fell or faded
        isRunningRef.current = false;
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [celebration, spawnParticles]);

  if (!celebration) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4"
    >
      {/* Canvas Layer for 60fps confetti */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Interactive Celebration Modal Card (Pointer events enabled for dismiss button & actions) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="pointer-events-auto relative max-w-md w-full rounded-3xl bg-zinc-950/95 border-2 p-6 sm:p-7 shadow-2xl backdrop-blur-xl text-center space-y-5 overflow-hidden"
          style={{
            borderColor: celebration.goalColor || '#06b6d4',
            boxShadow: `0 20px 60px -15px ${celebration.goalColor || '#06b6d4'}40`
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: celebration.goalColor || '#06b6d4' }}
          />

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
            title="Đóng thông báo"
          >
            <X size={16} />
          </button>

          {/* Icon / Badge Avatar with pulsating ring */}
          <div className="relative inline-block mx-auto mt-2">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 relative z-10 animate-bounce"
              style={{
                backgroundColor: `${celebration.goalColor || '#06b6d4'}25`,
                borderColor: celebration.goalColor || '#06b6d4'
              }}
            >
              <span>{celebration.icon}</span>
            </div>
            {/* Pulsing ring */}
            <div 
              className="absolute inset-0 rounded-3xl animate-ping opacity-40"
              style={{ backgroundColor: celebration.goalColor || '#06b6d4' }}
            />
          </div>

          {/* Titles & Percentage Banner */}
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black border uppercase tracking-wider"
              style={{
                backgroundColor: `${celebration.goalColor || '#06b6d4'}20`,
                borderColor: `${celebration.goalColor || '#06b6d4'}60`,
                color: celebration.goalColor || '#06b6d4'
              }}
            >
              <Sparkles size={13} />
              <span>Chạm Mốc Vàng {celebration.milestonePercentage}%</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mở Khóa: {celebration.badgeName}!
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300">
              Chúc mừng bạn đã tích lũy thành công mốc <strong className="text-white">{celebration.milestonePercentage}%</strong> cho mục tiêu{' '}
              <span className="font-bold underline decoration-cyan-400 decoration-2">
                "{celebration.goalTitle}"
              </span>
            </p>
          </div>

          {/* Metric Recap Chip */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs relative z-10">
            <div className="text-left space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold block">Hiện có trong quỹ</span>
              <span className="font-black text-white font-mono text-sm">
                {formatVND(celebration.currentAmount)}
              </span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold block">Mục tiêu toàn phần</span>
              <span className="font-black text-cyan-300 font-mono text-sm">
                {formatVND(celebration.targetAmount)}
              </span>
            </div>
          </div>

          {/* Celebratory Cheer Button */}
          <div className="pt-2 relative z-10">
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-zinc-950 shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy size={16} />
              <span>Tuyệt Vời! Tiếp Tục Giữ Vững Phong Độ</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
