import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  Sun, 
  RotateCcw, 
  Play, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Droplet, 
  Clock, 
  Eye,
  Sliders
} from 'lucide-react';

interface TranspirationSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function TranspirationSimulator({ onOpenVideoLesson }: TranspirationSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Environmental conditions
  const [lightIntensity, setLightIntensity] = useState<'low' | 'medium' | 'high'>('high');
  const [waterStatus, setWaterStatus] = useState<'sufficient' | 'drought'>('sufficient');
  const [leafType, setLeafType] = useState<'dicot' | 'monocot'>('dicot'); // Cây 2 lá mầm hoặc 1 lá mầm

  // Experiment test state with CoCl2 paper
  const [isExperimentRunning, setIsExperimentRunning] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [topPinkProgress, setTopPinkProgress] = useState<number>(0); // 0 (blue) to 1 (pink)
  const [bottomPinkProgress, setBottomPinkProgress] = useState<number>(0); // 0 to 1

  // Stomatal aperture (0 = closed, 1 = fully open)
  const isStomaOpen = lightIntensity !== 'low' && waterStatus === 'sufficient';
  const stomatalAperture = isStomaOpen 
    ? (lightIntensity === 'high' ? 0.95 : 0.6) 
    : 0.05;

  // Rates of water loss
  // Bottom has typically 4-5x more stomata in dicots
  const bottomRate = (leafType === 'dicot' ? 4.5 : 2.0) * stomatalAperture;
  const topRate = (leafType === 'dicot' ? 0.8 : 1.8) * stomatalAperture;

  const handleReset = () => {
    setIsExperimentRunning(false);
    setElapsedSec(0);
    setTopPinkProgress(0);
    setBottomPinkProgress(0);
  };

  // Experiment timer
  useEffect(() => {
    if (!isExperimentRunning) return;

    const interval = setInterval(() => {
      setElapsedSec(prev => {
        const nextTime = prev + 0.2;
        setTopPinkProgress(p => Math.min(1, p + topRate * 0.012));
        setBottomPinkProgress(p => Math.min(1, p + bottomRate * 0.012));
        return nextTime;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isExperimentRunning, topRate, bottomRate]);

  // Canvas visualizer of stomata (khí khổng tế bào hình hạt đậu)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Draw pair of kidney-shaped guard cells (Tế bào hạt đậu)
    const gap = stomatalAperture * 26; // width of pore

    // Left Guard Cell
    ctx.save();
    ctx.translate(cx - gap / 2 - 25, cy);
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 65, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thick inner wall (thành trong dày)
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(10, 0, 50, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();

    // Chloroplasts (Lục lạp)
    ctx.fillStyle = '#4ade80';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(-8, i * 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Right Guard Cell
    ctx.save();
    ctx.translate(cx + gap / 2 + 25, cy);
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 65, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thick inner wall
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(-10, 0, 50, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();

    // Chloroplasts
    ctx.fillStyle = '#4ade80';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(8, i * 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Stomatal Pore Aperture Label & H2O vapor particles
    if (stomatalAperture > 0.2) {
      // Water vapor bubbles floating out
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      for (let i = 0; i < 6; i++) {
        const py = cy - 40 - (i * 12);
        ctx.beginPath();
        ctx.arc(cx + (i % 2 === 0 ? 4 : -4), py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('H₂O ↑ (Thoát Hơi Nước)', cx - 58, cy - 85);
    } else {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('LỖ KHÍ ĐÓNG KÍN', cx - 44, cy);
    }
  }, [stomatalAperture]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-green-950/20 to-zinc-900/60 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold text-sm">
            SINH HỌC 11
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành: Thoát Hơi Nước Qua Lá & Cơ Chế Đóng Mở Khí Khổng
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                CTGDPT 2018 • Phương Pháp Giấy Tẩm CoCl₂
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              So sánh tốc độ thoát hơi nước giữa mặt trên và mặt dưới của lá cây bằng giấy $CoCl_2$ (khô màu xanh $\rightarrow$ ẩm màu hồng).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExperimentRunning(!isExperimentRunning)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isExperimentRunning
                ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                : 'bg-emerald-500/30 border border-emerald-400 text-emerald-200'
            }`}
          >
            <Play size={14} fill="currentColor" />
            <span>{isExperimentRunning ? 'Đang Bấm Giờ...' : 'Kẹp Giấy Bấm Giờ'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
            title="Làm khô giấy tẩm CoCl2 về màu xanh"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Simulation Apparatus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: CoCl2 Paper Comparison View */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Leaf size={14} className="text-emerald-400" />
              <span>Thực Nghiệm Kẹp Giấy CoCl₂ Vào Hai Mặt Lá Cây</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              Thời gian kẹp: {elapsedSec.toFixed(1)}s
            </span>
          </div>

          {/* Leaf with Two Papers */}
          <div className="w-full grid grid-cols-2 gap-4 py-3">
            {/* Top Surface */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-300">MẶT TRÊN CỦA LÁ</span>
              <span className="text-[10px] text-zinc-500">Ít khí khổng, có lớp cutin dày</span>
              {/* Paper square that turns pink */}
              <div 
                className="w-24 h-24 rounded-lg border-2 border-zinc-600 shadow-md flex items-center justify-center text-center p-1 transition-colors duration-500"
                style={{
                  backgroundColor: `rgb(${Math.round(59 + topPinkProgress * 180)}, ${Math.round(130 - topPinkProgress * 40)}, ${Math.round(246 - topPinkProgress * 120)})`
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {topPinkProgress > 0.8 ? 'HỒNG ĐẬM' : topPinkProgress > 0.3 ? 'HỒNG NHẠT' : 'XANH DA TRỜI'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                Đổi màu: {(topPinkProgress * 100).toFixed(0)}%
              </span>
            </div>

            {/* Bottom Surface */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-300">MẶT DƯỚI CỦA LÁ</span>
              <span className="text-[10px] text-zinc-500">Tập trung nhiều khí khổng gấp 4-5 lần</span>
              {/* Paper square that turns pink quickly */}
              <div 
                className="w-24 h-24 rounded-lg border-2 border-emerald-500/60 shadow-md flex items-center justify-center text-center p-1 transition-colors duration-500"
                style={{
                  backgroundColor: `rgb(${Math.round(59 + bottomPinkProgress * 180)}, ${Math.round(130 - bottomPinkProgress * 40)}, ${Math.round(246 - bottomPinkProgress * 120)})`
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {bottomPinkProgress > 0.8 ? 'HỒNG ĐẬM RẤT NHANH' : bottomPinkProgress > 0.3 ? 'HỒNG NHẠT' : 'XANH DA TRỜI'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Đổi màu: {(bottomPinkProgress * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Microscopic Guard Cell Anatomy */}
          <div className="w-full mt-2 pt-3 border-t border-zinc-800 flex flex-col items-center">
            <span className="text-xs text-zinc-400 font-semibold mb-2">
              Kính hiển vi: Cơ chế tế bào đóng/mở lỗ khí ({isStomaOpen ? 'Đang mở thoát nước' : 'Đang khép kín'})
            </span>
            <canvas
              ref={canvasRef}
              width={340}
              height={160}
              className="rounded-xl bg-zinc-950 border border-zinc-800"
            />
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-emerald-400" />
                <span>Điều Kiện Môi Trường & Thực Vật</span>
              </span>
            </div>

            {/* Ánh sáng */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Sun size={14} className="text-amber-400" />
                <span>Cường độ ánh sáng chiếu vào lá:</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'low' as const, label: 'Ban Đêm (Tối)' },
                  { id: 'medium' as const, label: 'Bóng Râm' },
                  { id: 'high' as const, label: 'Nắng Gắt' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setLightIntensity(l.id); handleReset(); }}
                    className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      lightIntensity === l.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tình trạng nước của cây */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Droplet size={14} className="text-cyan-400" />
                <span>Độ ẩm đất & nước trong cây:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setWaterStatus('sufficient'); handleReset(); }}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    waterStatus === 'sufficient'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Đầy Đủ Nước (Tế Bào Trương)
                </button>
                <button
                  onClick={() => { setWaterStatus('drought'); handleReset(); }}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    waterStatus === 'drought'
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Hạn Hán (Cây Tiết ABA)
                </button>
              </div>
            </div>

            {/* Loại lá */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Dạng cây thực nghiệm:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setLeafType('dicot'); handleReset(); }}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    leafType === 'dicot'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Cây Hai Lá Mầm (Xoài, Dâm Bụt)
                </button>
                <button
                  onClick={() => { setLeafType('monocot'); handleReset(); }}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    leafType === 'monocot'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Cây Một Lá Mầm (Lúa, Ngô)
                </button>
              </div>
            </div>
          </div>

          {/* Theoretical Summary Box */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-xs">
            <span className="font-bold text-zinc-200">Kết Luận Thực Nghiệm SGK:</span>
            <p className="text-zinc-400 leading-relaxed">
              • Ở cây hai lá mầm, giấy $CoCl_2$ ở mặt dưới hóa hồng nhanh hơn mặt trên rõ rệt vì mặt dưới có mật độ khí khổng cao gấp 4–5 lần mặt trên và có lớp biểu bì mỏng hơn.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              • Khi thiếu nước (hạn hán), rễ cây tiết hormone <strong>Axit Abscisic (ABA)</strong> truyền lên lá làm các ion $K^+$ bị bơm ra khỏi tế bào hạt đậu $\Rightarrow$ khí khổng đóng chủ động để chống héo.
            </p>
          </div>
        </div>
      </div>

      {/* First Principles Insight Callout */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Tại Sao Cây Cần Thoát Đến 98% Lượng Nước Hút Vào? (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Động lực hút dòng mạch gỗ:</strong> Thoát hơi nước tạo ra sức hút rất lớn ở ngọn cây (lực kéo đầu trên), giúp đưa nước và các ion khoáng từ rễ lên tận các cành lá cao hàng chục mét.
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Hạ nhiệt độ bảo vệ lá:</strong> Nước bốc hơi hấp thụ nhiệt lượng rất lớn (~ 2.26 × 10⁶ J/kg), giúp làm mát mặt lá khi cây quang hợp dưới trời nắng gay gắt, ngăn chặn sự biến tính của protein enzyme.
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Thoát Hơi Nước & Đóng Mở Khí Khổng')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Thoát Hơi Nước</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
