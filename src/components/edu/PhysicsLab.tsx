import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Eye, 
  Zap, 
  ArrowRight, 
  HelpCircle,
  Activity,
  Compass,
  Gauge
} from 'lucide-react';
import { motion } from 'motion/react';
import { FreeFallSimulator } from './physics/FreeFallSimulator';
import { WaveInterferenceSimulator } from './physics/WaveInterferenceSimulator';
import { ThermodynamicsSimulator } from './physics/ThermodynamicsSimulator';

export type PhysicsExperimentId = 
  | 'pendulum' 
  | 'optics' 
  | 'circuits' 
  | 'projectile' 
  | 'free_fall' 
  | 'wave_interference' 
  | 'thermodynamics';

interface PhysicsLabProps {
  initialExperiment?: PhysicsExperimentId;
  onSelectExperiment?: (id: PhysicsExperimentId) => void;
  onOpenVideoLesson?: (topic: string) => void;
  onOpenQuickQuiz?: (subject: 'physics', experimentId?: string) => void;
}

export function PhysicsLab({
  initialExperiment = 'pendulum',
  onSelectExperiment,
  onOpenVideoLesson,
  onOpenQuickQuiz
}: PhysicsLabProps) {
  const [activeExp, setActiveExp] = useState<PhysicsExperimentId>(initialExperiment);
  const [gradeFilter, setGradeFilter] = useState<'all' | 10 | 11 | 12>('all');

  useEffect(() => {
    if (initialExperiment) {
      setActiveExp(initialExperiment);
    }
  }, [initialExperiment]);

  const handleSwitchExp = (id: PhysicsExperimentId) => {
    setActiveExp(id);
    onSelectExperiment?.(id);
  };

  const allExperiments = [
    { id: 'free_fall' as const, label: 'Khảo Sát Rơi Tự Do (g)', icon: '⏱️', grade: 10, desc: 'Cổng quang điện hiện số & đo gia tốc g' },
    { id: 'pendulum' as const, label: 'Con Lắc Đơn & Cơ Năng', icon: '🔔', grade: 11, desc: 'Dao động điều hòa & bảo toàn năng lượng' },
    { id: 'projectile' as const, label: 'Chuyển Động Ném Ngang / Xiên', icon: '🎯', grade: 10, desc: 'Quỹ đạo parabol, tầm xa & vận tốc' },
    { id: 'optics' as const, label: 'Khúc Xạ Ánh Sáng & Lăng Kính', icon: '🌈', grade: 11, desc: 'Định luật Snell & Phản xạ toàn phần' },
    { id: 'circuits' as const, label: 'Định Luật Ohm & Mạch Điện', icon: '⚡', grade: 11, desc: 'Nối tiếp, song song & công suất tỏa nhiệt' },
    { id: 'wave_interference' as const, label: 'Giao Thoa Sóng & Sóng Dừng', icon: '🌊', grade: 11, desc: 'Vân cực đại, nút sóng & bụng sóng' },
    { id: 'thermodynamics' as const, label: 'Khí Lý Tưởng & Định Luật Boyle', icon: '🌡️', grade: 12, desc: 'Đẳng nhiệt T=const, p·V=const xilanh kín' },
  ];

  const filteredExperiments = gradeFilter === 'all' 
    ? allExperiments 
    : allExperiments.filter(e => e.grade === gradeFilter);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Grade Filter & Curriculum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Khối Lớp CTGDPT 2018:
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 'all' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất Cả (7)
            </button>
            <button
              onClick={() => setGradeFilter(10)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 10 ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 10
            </button>
            <button
              onClick={() => setGradeFilter(11)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 11 ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 11
            </button>
            <button
              onClick={() => setGradeFilter(12)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 12 ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 12
            </button>
          </div>
        </div>

        {onOpenQuickQuiz && (
          <button
            onClick={() => onOpenQuickQuiz('physics', activeExp)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer self-end sm:self-auto"
            title="Đánh giá kiến thức ngay lập tức sau thí nghiệm"
          >
            <Zap size={14} className="text-emerald-400" />
            <span>Bài Kiểm Tra Nhanh (Quiz)</span>
          </button>
        )}
      </div>

      {/* Experiment Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filteredExperiments.map(exp => (
          <button
            key={exp.id}
            onClick={() => handleSwitchExp(exp.id)}
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeExp === exp.id
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-lg shadow-emerald-950/40'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span className="text-base">{exp.icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span>{exp.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  L{exp.grade}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-normal hidden sm:block">{exp.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Experiment View */}
      {activeExp === 'free_fall' && <FreeFallSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'pendulum' && <PendulumSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'optics' && <OpticsSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'circuits' && <CircuitsSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'projectile' && <ProjectileSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'wave_interference' && <WaveInterferenceSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'thermodynamics' && <ThermodynamicsSimulator onOpenVideoLesson={onOpenVideoLesson} />}
    </div>
  );
}

// =========================================================================
// 1. PENDULUM SIMULATOR (Con Lắc Đơn & Bảo Toàn Năng Lượng)
// =========================================================================
function PendulumSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physical parameters
  const [length, setLength] = useState<number>(2.0); // meters
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2
  const [mass, setMass] = useState<number>(1.5); // kg
  const [damping, setDamping] = useState<number>(0.002); // air resistance
  const [initialAngleDeg, setInitialAngleDeg] = useState<number>(35); // degrees
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Real-time state
  const stateRef = useRef({
    theta: (35 * Math.PI) / 180,
    omega: 0,
    time: 0
  });

  const [currentMetrics, setCurrentMetrics] = useState({
    angleDeg: 35,
    period: 2.84,
    kineticEnergy: 0,
    potentialEnergy: 5.1,
    totalEnergy: 5.1,
    velocity: 0
  });

  // Calculate theoretical period T = 2*pi*sqrt(L/g)
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));

  // Reset simulation
  const handleReset = () => {
    stateRef.current = {
      theta: (initialAngleDeg * Math.PI) / 180,
      omega: 0,
      time: 0
    };
  };

  useEffect(() => {
    handleReset();
  }, [length, gravity, initialAngleDeg]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      if (isRunning) {
        // Runge-Kutta 2 / Euler-Cromer physics integration
        const g_over_L = gravity / Math.max(0.1, length);
        const alpha = -g_over_L * Math.sin(stateRef.current.theta) - damping * stateRef.current.omega;
        stateRef.current.omega += alpha * dt;
        stateRef.current.theta += stateRef.current.omega * dt;
        stateRef.current.time += dt;

        // Energies
        const v = stateRef.current.omega * length;
        const h = length * (1 - Math.cos(stateRef.current.theta));
        const Ek = 0.5 * mass * v * v;
        const Ep = mass * gravity * h;
        const Etotal = Ek + Ep;

        setCurrentMetrics({
          angleDeg: Math.round((stateRef.current.theta * 180) / Math.PI),
          period: Number(theoreticalPeriod.toFixed(2)),
          kineticEnergy: Number(Ek.toFixed(2)),
          potentialEnergy: Number(Ep.toFixed(2)),
          totalEnergy: Number(Etotal.toFixed(2)),
          velocity: Number(v.toFixed(2))
        });
      }

      // Drawing
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background Grid & Protractor
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      const pivotX = width / 2;
      const pivotY = 70;

      // Vertical dashed reference line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, height - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Protractor Arc
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 80, 0, Math.PI);
      ctx.strokeStyle = '#3f3f46';
      ctx.stroke();

      // Pixel scale: map length (0.5m - 4.0m) to canvas pixels
      const pixelLength = Math.min(height - 130, 80 + length * 65);
      const bobX = pivotX + pixelLength * Math.sin(stateRef.current.theta);
      const bobY = pivotY + pixelLength * Math.cos(stateRef.current.theta);

      // Trajectory arc
      ctx.beginPath();
      const maxTheta = (initialAngleDeg * Math.PI) / 180;
      ctx.arc(pivotX, pivotY, pixelLength, Math.PI / 2 - maxTheta, Math.PI / 2 + maxTheta);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // String line
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pivot support
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(pivotX - 25, pivotY - 14, 50, 6);

      // Bob ball with glow based on kinetic energy
      const bobRadius = 14 + mass * 3;
      const gradient = ctx.createRadialGradient(
        bobX - bobRadius / 3,
        bobY - bobRadius / 3,
        bobRadius / 6,
        bobX,
        bobY,
        bobRadius
      );
      gradient.addColorStop(0, '#6ee7b7');
      gradient.addColorStop(0.7, '#10b981');
      gradient.addColorStop(1, '#065f46');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Velocity vector arrow
      if (Math.abs(stateRef.current.omega) > 0.05) {
        const velScale = 18;
        const vx = -pixelLength * stateRef.current.omega * Math.cos(stateRef.current.theta);
        const vy = pixelLength * stateRef.current.omega * Math.sin(stateRef.current.theta);
        
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(bobX + vx * velScale * 0.04, bobY + vy * velScale * 0.04);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, length, gravity, mass, damping, initialAngleDeg, theoreticalPeriod]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Canvas View (7 cols) */}
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 relative shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Mô Phỏng Không Gian Vật Lý 2D</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'Tạm Dừng' : 'Tiếp Tục'}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
              title="Khôi phục trạng thái ban đầu"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Canvas container */}
        <div className="w-full h-[380px] bg-zinc-900/50 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800">
          <canvas
            ref={canvasRef}
            width={580}
            height={380}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
          />

          {/* Quick HUD Metrics Overlay */}
          <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 flex flex-col gap-1">
            <div className="text-zinc-400">Góc lệch: <span className="text-emerald-400 font-mono font-bold">{currentMetrics.angleDeg}°</span></div>
            <div className="text-zinc-400">Chu kỳ $T$: <span className="text-amber-400 font-mono font-bold">{currentMetrics.period} s</span></div>
            <div className="text-zinc-400">Vận tốc $v$: <span className="text-sky-400 font-mono font-bold">{currentMetrics.velocity} m/s</span></div>
          </div>
        </div>

        {/* Real-time Energy Balance Bars */}
        <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Biểu đồ chuyển hóa cơ năng ($W = W_đ + W_t$):</span>
            <span className="font-mono text-emerald-400 font-bold">{currentMetrics.totalEnergy} Joules</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-sky-400">Động năng $W_đ$ (Kinetic):</span>
              <span className="font-mono">{currentMetrics.kineticEnergy} J</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, (currentMetrics.kineticEnergy / Math.max(0.01, currentMetrics.totalEnergy)) * 100)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-amber-400">Thế năng $W_t$ (Potential):</span>
              <span className="font-mono">{currentMetrics.potentialEnergy} J</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, (currentMetrics.potentialEnergy / Math.max(0.01, currentMetrics.totalEnergy)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls & Theoretical First-Principles (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Sliders Control Card */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Sliders size={16} className="text-emerald-400" />
            <span>Thông Số Thí Nghiệm</span>
          </div>

          {/* Length Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Chiều dài dây $L$:</span>
              <span className="font-mono text-emerald-400 font-bold">{length.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          {/* Mass Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Khối lượng quả nặng $m$:</span>
              <span className="font-mono text-emerald-400 font-bold">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          {/* Initial Angle Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Góc kéo ban đầu $\alpha_0$:</span>
              <span className="font-mono text-amber-400 font-bold">{initialAngleDeg}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="75"
              step="1"
              value={initialAngleDeg}
              onChange={(e) => setInitialAngleDeg(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          {/* Gravity Presets */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400">Môi trường trọng trường $g$:</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: '🌍 Trái Đất', val: 9.81 },
                { name: '🌕 Mặt Trăng', val: 1.62 },
                { name: '🔴 Sao Hỏa', val: 3.71 },
                { name: '🪐 Sao Mộc', val: 24.79 },
              ].map(p => (
                <button
                  key={p.name}
                  onClick={() => setGravity(p.val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                    gravity === p.val
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {p.name} <span className="font-mono text-[10px] opacity-75">({p.val} m/s²)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* First Principles Theoretical Note */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Activity size={15} />
            <span>Nguyên Lý Bản Chất (First Principles)</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Chu kỳ không phụ thuộc vào khối lượng:</strong> Công thức T = 2π√(L/g) chứng minh thời gian dao động của con lắc chỉ phụ thuộc chiều dài L và gia tốc trọng trường g.
            </p>
            <p>
              • <strong>Bản chất cơ năng:</strong> Khi con lắc ở biên cực đại, vận tốc v = 0 nên toàn bộ năng lượng là thế năng hấp dẫn (W_t = mgh). Khi qua vị trí cân bằng, độ cao h = 0, thế năng chuyển hóa hoàn toàn thành động năng (W_đ = 1/2 · m · v²).
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Con Lắc Đơn & Bảo Toàn Năng Lượng')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Giải Thích Bài Học Này</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. OPTICS SIMULATOR (Khúc Xạ Ánh Sáng & Định Luật Snell)
// =========================================================================
function OpticsSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [n1, setN1] = useState<number>(1.0); // Môi trường 1 (Không khí = 1.0)
  const [n2, setN2] = useState<number>(1.5); // Môi trường 2 (Thủy tinh = 1.5)
  const [incidentAngleDeg, setIncidentAngleDeg] = useState<number>(45); // Góc tới i

  // Tính góc khúc xạ theo định luật Snell: n1 * sin(i) = n2 * sin(r)
  const iRad = (incidentAngleDeg * Math.PI) / 180;
  const sinR = (n1 * Math.sin(iRad)) / n2;
  const isTotalInternalReflection = sinR > 1.0;
  const rRad = isTotalInternalReflection ? 0 : Math.asin(sinR);
  const rDeg = isTotalInternalReflection ? 0 : (rRad * 180) / Math.PI;

  // Góc tới hạn (Critical angle): sin(i_gh) = n2 / n1 (khi n1 > n2)
  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const midY = height / 2;
    const midX = width / 2;

    // Backgrounds for Medium 1 and Medium 2
    ctx.fillStyle = '#18181b'; // Medium 1
    ctx.fillRect(0, 0, width, midY);

    // Medium 2 color gradient depending on optical density
    const m2Alpha = Math.min(0.7, 0.15 + (n2 - 1) * 0.3);
    ctx.fillStyle = `rgba(14, 165, 233, ${m2Alpha})`;
    ctx.fillRect(0, midY, width, midY);

    // Interface boundary line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Normal line (Pháp tuyến vuông góc)
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Medium labels
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`Môi trường 1 (Chiết suất n₁ = ${n1.toFixed(2)})`, 20, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Môi trường 2 (Chiết suất n₂ = ${n2.toFixed(2)})`, 20, midY + 30);

    // 1. Incident Ray (Tia tới - Red Laser)
    const rayLength = 160;
    const srcX = midX - rayLength * Math.sin(iRad);
    const srcY = midY - rayLength * Math.cos(iRad);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(srcX, srcY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // Arrow on incident ray
    drawArrowHead(ctx, srcX, srcY, midX, midY, '#ef4444');

    // 2. Reflected Ray (Tia phản xạ)
    const refX = midX + rayLength * Math.sin(iRad);
    const refY = midY - rayLength * Math.cos(iRad);

    const reflectIntensity = isTotalInternalReflection ? 1.0 : 0.3;
    ctx.strokeStyle = `rgba(239, 68, 68, ${reflectIntensity})`;
    ctx.lineWidth = isTotalInternalReflection ? 3.5 : 2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(refX, refY);
    ctx.stroke();
    drawArrowHead(ctx, midX, midY, refX, refY, `rgba(239, 68, 68, ${reflectIntensity})`);

    // 3. Refracted Ray (Tia khúc xạ)
    if (!isTotalInternalReflection) {
      const refrX = midX + rayLength * Math.sin(rRad);
      const refrY = midY + rayLength * Math.cos(rRad);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(refrX, refrY);
      ctx.stroke();
      drawArrowHead(ctx, midX, midY, refrX, refrY, '#10b981');

      // Angle arc r
      ctx.beginPath();
      ctx.arc(midX, midY, 40, Math.PI / 2, Math.PI / 2 + rRad);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Angle arc i
    ctx.beginPath();
    ctx.arc(midX, midY, 40, (3 * Math.PI) / 2 - iRad, (3 * Math.PI) / 2);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [n1, n2, incidentAngleDeg, iRad, rRad, isTotalInternalReflection]);

  function drawArrowHead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) {
    const headlen = 10;
    const midPointX = (fromX + toX) / 2;
    const midPointY = (fromY + toY) / 2;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(midPointX, midPointY);
    ctx.lineTo(midPointX - headlen * Math.cos(angle - Math.PI / 6), midPointY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(midPointX - headlen * Math.cos(angle + Math.PI / 6), midPointY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Mô Phỏng Đường Đi Của Tia Sáng (Ray Tracing)</h3>
          </div>
          {isTotalInternalReflection && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
              ⚡ Phản Xạ Toàn Phần!
            </span>
          )}
        </div>

        <div className="w-full h-[360px] bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800 flex items-center justify-center">
          <canvas ref={canvasRef} width={580} height={360} className="w-full h-full object-contain" />
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300">
            <div className="text-[11px] text-zinc-400">Góc tới $i$</div>
            <div className="font-mono font-bold text-base">{incidentAngleDeg}°</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
            <div className="text-[11px] text-zinc-400">Góc khúc xạ $r$</div>
            <div className="font-mono font-bold text-base">
              {isTotalInternalReflection ? 'Triệt tiêu' : `${rDeg.toFixed(1)}°`}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-sky-300">
            <div className="text-[11px] text-zinc-400">Góc tới hạn i_gh</div>
            <div className="font-mono font-bold text-base">
              {criticalAngleDeg ? `${criticalAngleDeg.toFixed(1)}°` : 'Không có'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Sliders size={16} className="text-cyan-400" />
            <span>Điều Khiển Góc Tới & Chiết Suất</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Góc tới của chùm tia $i$:</span>
              <span className="font-mono text-red-400 font-bold">{incidentAngleDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="85"
              step="1"
              value={incidentAngleDeg}
              onChange={(e) => setIncidentAngleDeg(parseInt(e.target.value))}
              className="w-full accent-red-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Chiết suất môi trường 1 ($n_1$):</span>
              <span className="font-mono text-cyan-400 font-bold">{n1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={n1}
              onChange={(e) => setN1(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Chiết suất môi trường 2 ($n_2$):</span>
              <span className="font-mono text-cyan-400 font-bold">{n2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={n2}
              onChange={(e) => setN2(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          {/* Preset Material Pairs */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400">Bộ mẫu vật liệu phổ biến:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setN1(1.0); setN2(1.5); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                Không khí $\rightarrow$ Thủy tinh
              </button>
              <button
                onClick={() => { setN1(1.33); setN2(1.0); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                Nước $\rightarrow$ Không khí
              </button>
              <button
                onClick={() => { setN1(2.42); setN2(1.0); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                Kim cương $\rightarrow$ Không khí
              </button>
              <button
                onClick={() => { setN1(1.5); setN2(1.33); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 text-left"
              >
                Thủy tinh $\rightarrow$ Nước
              </button>
            </div>
          </div>
        </div>

        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <Compass size={15} />
            <span>Định Luật Snell & Ứng Dụng Thực Tiễn</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Định luật khúc xạ:</strong> $n_1 \cdot \sin(i) = n_2 \cdot \sin(r)$. Khi ánh sáng truyền từ môi trường chiết quang kém sang môi trường chiết quang hơn ($n_1 &lt; n_2$), tia khúc xạ bị bẻ cong lại gần pháp tuyến ($r &lt; i$).
            </p>
            <p>
              • <strong>Phản xạ toàn phần trong Cáp Quang:</strong> Khi truyền từ môi trường chiết quang hơn sang kém hơn (n1 &gt; n2) với góc tới i ≥ i_gh, tia sáng bị phản xạ 100% bên trong lõi sợi quang, giúp truyền tín hiệu Internet toàn cầu với tốc độ ánh sáng mà không bị suy hao.
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Khúc Xạ Ánh Sáng & Sợi Cáp Quang Internet')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Giải Thích Định Luật Snell</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. CIRCUITS SIMULATOR (Định Luật Ohm & Mạch Điện)
// =========================================================================
function CircuitsSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [r1, setR1] = useState<number>(6); // Ohms
  const [r2, setR2] = useState<number>(6); // Ohms
  const [circuitType, setCircuitType] = useState<'series' | 'parallel'>('series');

  // Calculations
  const rEquivalent = circuitType === 'series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const currentTotal = voltage / Math.max(0.1, rEquivalent);
  const totalPower = voltage * currentTotal; // Watts

  // Sub-currents & voltages
  const v1 = circuitType === 'series' ? currentTotal * r1 : voltage;
  const v2 = circuitType === 'series' ? currentTotal * r2 : voltage;
  const i1 = circuitType === 'series' ? currentTotal : voltage / r1;
  const i2 = circuitType === 'series' ? currentTotal : voltage / r2;

  // Bulb brightness representation (0 - 100%)
  const brightness1 = Math.min(100, Math.round((v1 * i1 * 100) / 25));
  const brightness2 = Math.min(100, Math.round((v2 * i2 * 100) / 25));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Sơ Đồ Mạch Điện Tương Tác</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCircuitType('series')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                circuitType === 'series'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Mắc Nối Tiếp
            </button>
            <button
              onClick={() => setCircuitType('parallel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                circuitType === 'parallel'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Mắc Song Song
            </button>
          </div>
        </div>

        {/* Visual Circuit Diagram Canvas */}
        <div className="w-full h-[320px] bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Circuit wire frames */}
          <div className="w-[85%] h-[200px] border-2 border-zinc-600 rounded-xl relative flex items-center justify-between px-8">
            {/* Battery on left */}
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-zinc-950 px-2 py-3 border border-amber-500 rounded-lg text-center flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-bold">+</span>
              <Zap size={18} className="text-amber-400 animate-bounce" />
              <span className="text-xs font-mono font-bold text-zinc-100">{voltage}V</span>
              <span className="text-[10px] text-zinc-400 font-bold">-</span>
            </div>

            {/* Circuit components based on series vs parallel */}
            {circuitType === 'series' ? (
              <div className="w-full flex items-center justify-around">
                {/* Resistor 1 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300 shadow-lg"
                    style={{
                      backgroundColor: `rgba(251, 191, 36, ${brightness1 / 150})`,
                      boxShadow: `0 0 ${brightness1 / 3}px rgba(251, 191, 36, ${brightness1 / 100})`
                    }}
                  >
                    💡
                  </div>
                  <span className="text-xs font-bold text-zinc-200">Đèn 1: {r1}Ω</span>
                  <span className="text-[11px] font-mono text-zinc-400">{v1.toFixed(1)}V • {i1.toFixed(2)}A</span>
                </div>

                {/* Resistor 2 */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300 shadow-lg"
                    style={{
                      backgroundColor: `rgba(251, 191, 36, ${brightness2 / 150})`,
                      boxShadow: `0 0 ${brightness2 / 3}px rgba(251, 191, 36, ${brightness2 / 100})`
                    }}
                  >
                    💡
                  </div>
                  <span className="text-xs font-bold text-zinc-200">Đèn 2: {r2}Ω</span>
                  <span className="text-[11px] font-mono text-zinc-400">{v2.toFixed(1)}V • {i2.toFixed(2)}A</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-around h-full py-4">
                {/* Branch 1 */}
                <div className="flex items-center justify-between border-b border-dashed border-zinc-700 pb-3">
                  <span className="text-xs text-zinc-400">Nhánh 1:</span>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full border border-amber-400 flex items-center justify-center transition-all"
                      style={{ backgroundColor: `rgba(251, 191, 36, ${brightness1 / 120})` }}
                    >💡</div>
                    <span className="text-xs font-mono text-zinc-200">{r1}Ω • {i1.toFixed(2)}A</span>
                  </div>
                </div>

                {/* Branch 2 */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs text-zinc-400">Nhánh 2:</span>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full border border-amber-400 flex items-center justify-center transition-all"
                      style={{ backgroundColor: `rgba(251, 191, 36, ${brightness2 / 120})` }}
                    >💡</div>
                    <span className="text-xs font-mono text-zinc-200">{r2}Ω • {i2.toFixed(2)}A</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Meter Readings */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-[11px] text-zinc-400">Điện trở tương đương R_tđ</div>
            <div className="text-base font-bold font-mono text-emerald-400">{rEquivalent.toFixed(2)} Ω</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-[11px] text-zinc-400">Dòng điện tổng $I$ (Ampe)</div>
            <div className="text-base font-bold font-mono text-amber-400">{currentTotal.toFixed(2)} A</div>
          </div>
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-[11px] text-zinc-400">Công suất toàn mạch $P$</div>
            <div className="text-base font-bold font-mono text-rose-400">{totalPower.toFixed(1)} W</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Sliders size={16} className="text-amber-400" />
            <span>Điều Chỉnh Nguồn Điện & Điện Trở</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Hiệu điện thế nguồn $U$:</span>
              <span className="font-mono text-amber-400 font-bold">{voltage} V</span>
            </div>
            <input
              type="range"
              min="1"
              max="48"
              step="1"
              value={voltage}
              onChange={(e) => setVoltage(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Điện trở $R_1$:</span>
              <span className="font-mono text-emerald-400 font-bold">{r1} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={r1}
              onChange={(e) => setR1(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Điện trở $R_2$:</span>
              <span className="font-mono text-emerald-400 font-bold">{r2} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={r2}
              onChange={(e) => setR2(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Activity size={15} />
            <span>Nguyên Lý Cốt Lõi Về Mạch Điện</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Mạch Nối Tiếp:</strong> Dòng điện qua mọi điểm là như nhau ($I = I_1 = I_2$). Hiệu điện thế phân chia theo tỷ lệ điện trở ($U = U_1 + U_2$). Nếu một bóng đèn bị đứt, toàn bộ mạch hở và ngắt điện.
            </p>
            <p>
              • <strong>Mạch Song Song:</strong> Hiệu điện thế trên mỗi nhánh bằng nhau ($U = U_1 = U_2 = 12V$). Điện trở tương đương luôn nhỏ hơn từng điện trở nhánh, giúp các thiết bị gia đình hoạt động độc lập không phụ thuộc nhau.
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Định Luật Ohm & Mạch Điện Gia Đình')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Giải Thích Định Luật Ohm</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. PROJECTILE SIMULATOR (Ném Xiên / Ném Ngang)
// =========================================================================
function ProjectileSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [v0, setV0] = useState<number>(25); // m/s
  const [angleDeg, setAngleDeg] = useState<number>(45); // degrees
  const [gravity] = useState<number>(9.81);

  const angleRad = (angleDeg * Math.PI) / 180;
  const timeOfFlight = (2 * v0 * Math.sin(angleRad)) / gravity;
  const maxRange = (v0 * v0 * Math.sin(2 * angleRad)) / gravity;
  const maxHeight = (v0 * v0 * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * gravity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.strokeStyle = '#3f3f46';
    ctx.beginPath();
    ctx.moveTo(0, height - 30);
    ctx.lineTo(width, height - 30);
    ctx.stroke();

    // Origin
    const startX = 40;
    const startY = height - 30;

    // Scale calculation
    const scaleX = (width - 80) / Math.max(70, maxRange * 1.1);
    const scaleY = (height - 80) / Math.max(25, maxHeight * 1.3);

    // Parabolic trajectory trace
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (timeOfFlight * i) / steps;
      const x = v0 * Math.cos(angleRad) * t;
      const y = v0 * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
      ctx.lineTo(startX + x * scaleX, startY - y * scaleY);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Launcher Cannon
    const cannonLen = 30;
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(0, -6, cannonLen, 12);
    ctx.restore();

    // Impact point marker
    const landingX = startX + maxRange * scaleX;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(landingX, startY, 5, 0, Math.PI * 2);
    ctx.fill();

  }, [v0, angleDeg, angleRad, timeOfFlight, maxRange, maxHeight, gravity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Quỹ Đạo Chuyển Động Ném Xiên</h3>
          </div>
          <span className="text-xs text-zinc-400">Góc tối ưu tầm xa: <span className="text-emerald-400 font-bold">45°</span></span>
        </div>

        <div className="w-full h-[320px] bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800">
          <canvas ref={canvasRef} width={580} height={320} className="w-full h-full object-contain" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-zinc-400 text-[11px]">Tầm ném xa cực đại $L$</div>
            <div className="text-base font-mono font-bold text-emerald-400">{maxRange.toFixed(1)} m</div>
          </div>
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-zinc-400 text-[11px]">Độ cao cực đại H_max</div>
            <div className="text-base font-mono font-bold text-amber-400">{maxHeight.toFixed(1)} m</div>
          </div>
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-zinc-400 text-[11px]">Thời gian bay $t$</div>
            <div className="text-base font-mono font-bold text-sky-400">{timeOfFlight.toFixed(2)} s</div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Sliders size={16} className="text-emerald-400" />
            <span>Thông Số Phóng</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Vận tốc ban đầu $v_0$:</span>
              <span className="font-mono text-emerald-400 font-bold">{v0} m/s</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={v0}
              onChange={(e) => setV0(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Góc phóng $\alpha$:</span>
              <span className="font-mono text-amber-400 font-bold">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="85"
              step="1"
              value={angleDeg}
              onChange={(e) => setAngleDeg(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Activity size={15} />
            <span>Phân Tích Độc Lập Chuyển Động</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Tách biệt 2 phương Oxy:</strong> Theo phương ngang Ox, không có gia tốc nên vật chuyển động thẳng đều (vx = v0 · cos(α)). Theo phương thẳng đứng Oy, trọng lực tác dụng gia tốc g hướng xuống nên vật chuyển động biến đổi đều.
            </p>
            <p>
              • <strong>Tại sao góc 45° ném xa nhất?</strong> Tầm xa L = (v0² · sin(2α)) / g. Hàm số sin(2α) đạt giá trị lớn nhất bằng 1 khi 2α = 90° ⇒ α = 45°.
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Chuyển Động Ném Xiên & Bí Quyết Ném Xa Nhất')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Bài Giảng Ném Xiên</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
