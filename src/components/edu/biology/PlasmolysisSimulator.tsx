import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  Droplet, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ZoomIn, 
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface PlasmolysisSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function PlasmolysisSimulator({ onOpenVideoLesson }: PlasmolysisSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solution environment: distilled water (hypotonic), isotonic, hypertonic (NaCl 10%)
  const [solutionType, setSolutionType] = useState<'hypotonic' | 'isotonic' | 'hypertonic'>('isotonic');
  // Plasmolysis state (0 = fully turgid/deplasmolyzed, 1 = severely plasmolyzed)
  const [plasmolysisProgress, setPlasmolysisProgress] = useState<number>(0);
  const [cellState, setCellState] = useState<'normal' | 'plasmolyzed' | 'turgid'>('normal');

  // Transition smoothly when solution changes
  useEffect(() => {
    let target = 0;
    if (solutionType === 'hypertonic') {
      target = 0.85; // shrinks
    } else if (solutionType === 'hypotonic') {
      target = 0.0; // turgid
    } else {
      target = 0.15; // normal isotonic
    }

    const interval = setInterval(() => {
      setPlasmolysisProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.02) {
          if (target >= 0.7) setCellState('plasmolyzed');
          else if (target === 0) setCellState('turgid');
          else setCellState('normal');
          return target;
        }
        return prev + diff * 0.15;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [solutionType]);

  // Canvas visualizer for onion purple epidermal plant cells
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark background of microscope field
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Circular lens aperture
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 15;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Microscope illumination background
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
    grad.addColorStop(0, '#fef08a15');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw 3 plant cells side by side
    const cellWidth = 110;
    const cellHeight = 170;

    [-1, 0, 1].forEach((offset) => {
      const x = cx + offset * (cellWidth + 12) - cellWidth / 2;
      const y = cy - cellHeight / 2;

      // 1. Rigid Cellulose Cell Wall (Thành tế bào)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
      ctx.fillRect(x, y, cellWidth, cellHeight);

      // 2. Shrinking Protoplast & Vacuole (Khối nguyên sinh & Không bào tím Anthocyanin)
      const shrinkFactor = 1 - plasmolysisProgress * 0.45;
      const protoW = cellWidth * shrinkFactor;
      const protoH = cellHeight * shrinkFactor;
      const protoX = x + (cellWidth - protoW) / 2;
      const protoY = y + (cellHeight - protoH) / 2;

      // Space between cell wall and plasma membrane (filled with external NaCl solution during plasmolysis)
      if (plasmolysisProgress > 0.3) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.12)'; // NaCl solution entering
        ctx.fillRect(x, y, cellWidth, cellHeight);
      }

      // Protoplast mass (purple anthocyanin vacuole of onion cell)
      ctx.fillStyle = `rgba(168, 85, 247, ${0.7 + plasmolysisProgress * 0.25})`; // purple gets deeper as water leaves
      ctx.beginPath();
      ctx.roundRect(protoX, protoY, protoW, protoH, 18 * shrinkFactor);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cell nucleus (Nhân tế bào bị ép về một góc)
      ctx.fillStyle = '#7e22ce';
      const nucX = protoX + protoW * 0.75;
      const nucY = protoY + protoH * 0.25;
      ctx.beginPath();
      ctx.arc(nucX, nucY, 8 * shrinkFactor, 0, Math.PI * 2);
      ctx.fill();

      // Hechtian strands (Cầu sinh chất neo vào thành tế bào)
      if (plasmolysisProgress > 0.4) {
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Top left anchor
        ctx.moveTo(protoX, protoY);
        ctx.lineTo(x, y);
        // Top right anchor
        ctx.moveTo(protoX + protoW, protoY);
        ctx.lineTo(x + cellWidth, y);
        // Bottom left anchor
        ctx.moveTo(protoX, protoY + protoH);
        ctx.lineTo(x, y + cellHeight);
        // Bottom right anchor
        ctx.moveTo(protoX + protoW, protoY + protoH);
        ctx.lineTo(x + cellWidth, y + cellHeight);
        ctx.stroke();
      }
    });

    ctx.restore();

    // Microscope lens ring border
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }, [plasmolysisProgress]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-purple-950/20 to-zinc-900/60 border border-teal-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 font-mono font-bold text-sm">
            SINH HỌC 10
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành: Co & Phản Co Nguyên Sinh Ở Tế Bào Thực Vật
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                CTGDPT 2018 • Tiêu Bản Tế Bào Biểu Bì Củ Hành Tím
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Khảo sát sự thẩm thấu của nước qua màng sinh chất trong các môi trường ưu trương, đẳng trương và nhược trương.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSolutionType('hypertonic')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              solutionType === 'hypertonic'
                ? 'bg-purple-500/30 border border-purple-400 text-purple-200 shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
            }`}
          >
            Nhỏ Nước Muối 10% (Ưu Trương)
          </button>
          <button
            onClick={() => setSolutionType('hypotonic')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              solutionType === 'hypotonic'
                ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
            }`}
          >
            Nhỏ Nước Cất (Nhược Trương)
          </button>
          <button
            onClick={() => setSolutionType('isotonic')}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
            title="Đưa về môi trường đẳng trương sinh lý"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Eye size={14} className="text-teal-400" />
              <span>Thị Trường Kính Hiển Vi Quang Học (Độ Phóng Đại 400x)</span>
            </span>
            <span className="font-mono text-[11px] text-teal-400">
              {solutionType === 'hypertonic' ? 'Co Nguyên Sinh (Plasmolysis)' : solutionType === 'hypotonic' ? 'Phản Co Nguyên Sinh (Deplasmolysis)' : 'Đẳng Trương'}
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              width={360}
              height={320}
              className="rounded-full bg-zinc-950 shadow-2xl"
            />
          </div>

          {/* Real-time Status Card */}
          <div className="w-full mt-2 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-zinc-400 block">Trạng thái tế bào hiện tại:</span>
              <span className="font-bold text-zinc-100 text-sm">
                {cellState === 'plasmolyzed' && '🚨 Co Nguyên Sinh: Khối chất nguyên sinh tách rời thành tế bào'}
                {cellState === 'turgid' && '✨ Phản Co Nguyên Sinh: Trương nước căng đầy'}
                {cellState === 'normal' && 'Bình thường: Cân bằng áp suất thẩm thấu'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block text-[10px]">Độ co thể tích:</span>
              <span className="font-mono text-purple-400 font-bold text-sm">
                {(plasmolysisProgress * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Controls and Theory Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Droplet size={14} className="text-teal-400" />
                <span>Thao Tác Hóa Chất Lên Lam Kính</span>
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSolutionType('hypertonic')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  solutionType === 'hypertonic'
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold text-zinc-100">1. Nhỏ Dung Dịch NaCl 10% (Ưu Trương)</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Áp suất thẩm thấu ngoài lớn hơn trong tế bào $\Rightarrow$ Nước từ không bào thoát ra ngoài $\Rightarrow$ Thể tích khối tế bào chất co lại.
                </p>
              </button>

              <button
                onClick={() => setSolutionType('hypotonic')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  solutionType === 'hypotonic'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold text-zinc-100">2. Nhỏ Nước Cất (Nhược Trương)</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Nồng độ chất tan ngoài thấp hơn $\Rightarrow$ Nước thẩm thấu ngược vào trong tế bào $\Rightarrow$ Tế bào trương trở lại (Phản co nguyên sinh).
                </p>
              </button>

              <button
                onClick={() => setSolutionType('isotonic')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  solutionType === 'isotonic'
                    ? 'bg-teal-950/40 border-teal-500/60 text-teal-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold text-zinc-100">3. Dung Dịch Đẳng Trương (Sinh Lý)</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Lượng nước đi vào và đi ra qua màng sinh chất cân bằng nhau.
                </p>
              </button>
            </div>
          </div>

          {/* Key Identification Anatomy */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Layers size={14} className="text-teal-400" />
              <span>Cấu Trúc Tế Bào Quan Sát Thấy:</span>
            </span>
            <div className="space-y-1.5 text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                <span><strong>Thành tế bào (Cell Wall):</strong> Bằng cellulose cứng cáp, giữ nguyên hình dạng khung chữ nhật.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 shrink-0" />
                <span><strong>Không bào trung tâm (Vacuole):</strong> Chứa sắc tố màu tím anthocyanin, co rúm khi mất nước.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400 shrink-0" />
                <span><strong>Khoảng trống co nguyên sinh:</strong> Nơi dung dịch muối tràn vào nằm giữa thành và màng sinh chất.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* First Principles Insight Callout */}
      <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Tại Sao Tế Bào Động Vật Bị Vỡ Còn Thực Vật Thì Không? (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Thành tế bào cellulose:</strong> Khi đặt trong môi trường nhược trương (nước cất), hồng cầu động vật sẽ hút nước và vỡ tung (tan máu), nhưng tế bào thực vật chỉ trương nước căng đầy và dừng lại nhờ có thành cellulose tạo ra áp suất trương nước ($P$) cân bằng với áp suất thẩm thấu.
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Ý nghĩa thực tiễn:</strong> Ứng dụng giải thích tại sao bón quá nhiều phân hóa học (môi trường đất ưu trương) sẽ làm cây bị héo và chết rũ vì rễ cây không những không hút được nước mà còn bị mất nước ra đất.
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Hiện Tượng Co & Phản Co Nguyên Sinh Ở Tế Bào')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Co Nguyên Sinh</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
