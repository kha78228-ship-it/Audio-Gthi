import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Gauge, 
  CheckCircle2,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface FreeFallSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

interface MeasurementRecord {
  attempt: number;
  heightM: number;
  timeMs: number;
  calculatedG: number;
}

export function FreeFallSimulator({ onOpenVideoLesson }: FreeFallSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment parameters
  const [heightCm, setHeightCm] = useState<number>(60); // 20cm - 100cm
  const [environment, setEnvironment] = useState<'earth_vac' | 'earth_air' | 'moon' | 'mars'>('earth_vac');
  const [fallObject, setFallObject] = useState<'steel_ball' | 'wood_ball' | 'feather'>('steel_ball');

  // Simulation animation state
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0); // 0 to 1 ratio
  const [records, setRecords] = useState<MeasurementRecord[]>([]);

  // Physical constants
  const getG = () => {
    switch (environment) {
      case 'moon': return 1.62;
      case 'mars': return 3.71;
      case 'earth_air':
      case 'earth_vac':
      default: return 9.80665;
    }
  };

  const getAirResistanceCoeff = () => {
    if (environment !== 'earth_air') return 0;
    switch (fallObject) {
      case 'feather': return 3.8; // High air resistance
      case 'wood_ball': return 0.25;
      case 'steel_ball':
      default: return 0.05;
    }
  };

  // Reset simulator
  const handleReset = () => {
    setIsDropping(false);
    setHasFinished(false);
    setElapsedTimeMs(0);
    setCurrentY(0);
  };

  // Trigger drop
  const handleDrop = () => {
    if (isDropping) return;
    handleReset();
    setIsDropping(true);
  };

  // Physics animation loop
  useEffect(() => {
    if (!isDropping) return;

    const g = getG();
    const kAir = getAirResistanceCoeff();
    const heightM = heightCm / 100;

    let startTime: number | null = null;
    let animId: number;
    let posY = 0; // meters
    let velocity = 0; // m/s
    let lastTime = 0;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
        lastTime = timestamp;
      }

      const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds
      lastTime = timestamp;

      // Acceleration a = g - (k * v^2 / m)
      const a = Math.max(0, g - kAir * velocity * Math.abs(velocity));
      velocity += a * dt;
      posY += velocity * dt;

      const totalElapsedMs = timestamp - startTime;

      if (posY >= heightM) {
        // Reached gate E2
        posY = heightM;
        setCurrentY(1);
        setElapsedTimeMs(Math.round(totalElapsedMs));
        setIsDropping(false);
        setHasFinished(true);

        // Record measurement
        const measuredSec = totalElapsedMs / 1000;
        const gCalc = measuredSec > 0 ? (2 * heightM) / (measuredSec * measuredSec) : 0;
        setRecords(prev => [
          {
            attempt: prev.length + 1,
            heightM,
            timeMs: Math.round(totalElapsedMs),
            calculatedG: Number(gCalc.toFixed(2))
          },
          ...prev.slice(0, 9)
        ]);
        return;
      }

      setCurrentY(posY / heightM);
      setElapsedTimeMs(Math.round(totalElapsedMs));
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isDropping, heightCm, environment, fallObject]);

  // Canvas renderer for vertical apparatus & photogates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(39, 39, 42, 0.5)';
    ctx.lineWidth = 1;
    for (let y = 30; y < height - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
    }

    // Vertical Stand / Column (Thước mm đứng)
    const standX = 140;
    const topY = 40;
    const bottomY = height - 50;
    const trackHeight = bottomY - topY;

    // Metal pole
    ctx.fillStyle = '#27272a';
    ctx.fillRect(standX - 8, topY - 10, 16, trackHeight + 20);
    ctx.strokeStyle = '#3f3f46';
    ctx.strokeRect(standX - 8, topY - 10, 16, trackHeight + 20);

    // Millimeter tick marks
    ctx.fillStyle = '#71717a';
    ctx.font = '9px monospace';
    for (let cm = 0; cm <= 100; cm += 10) {
      const markY = topY + (cm / 100) * trackHeight;
      ctx.beginPath();
      ctx.moveTo(standX + 8, markY);
      ctx.lineTo(standX + 18, markY);
      ctx.strokeStyle = '#a1a1aa';
      ctx.stroke();
      ctx.fillText(`${cm}cm`, standX + 22, markY + 3);
    }

    // Electromagnet at Top (s = 0)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(standX - 20, topY - 18, 40, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('NAM CHÂM', standX - 22, topY - 22);

    // Photogate E1 at s = 0
    const gate1Y = topY;
    drawPhotogate(ctx, standX - 45, gate1Y, 'CỔNG QUANG E1 (0cm)');

    // Photogate E2 at heightCm
    const gate2Y = topY + (heightCm / 100) * trackHeight;
    drawPhotogate(ctx, standX - 45, gate2Y, `CỔNG QUANG E2 (${heightCm}cm)`);

    // Optical beam infrared line between gates
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(standX - 40, gate1Y);
    ctx.lineTo(standX + 20, gate1Y);
    ctx.stroke();

    ctx.strokeStyle = isDropping && currentY >= 0.98 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.moveTo(standX - 40, gate2Y);
    ctx.lineTo(standX + 20, gate2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Falling Object
    const ballY = topY + currentY * (gate2Y - topY);
    const ballX = standX;

    if (fallObject === 'feather') {
      // Draw feather
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate(Math.sin(elapsedTimeMs / 100) * 0.3);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      ctx.restore();
    } else {
      // Draw ball
      const radius = fallObject === 'steel_ball' ? 9 : 12;
      ctx.beginPath();
      ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(ballX - 3, ballY - 3, 2, ballX, ballY, radius);
      if (fallObject === 'steel_ball') {
        gradient.addColorStop(0, '#e4e4e7');
        gradient.addColorStop(0.7, '#71717a');
        gradient.addColorStop(1, '#27272a');
      } else {
        gradient.addColorStop(0, '#fdba74');
        gradient.addColorStop(0.7, '#c2410c');
        gradient.addColorStop(1, '#7c2d12');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Motion motion blur trajectory
    if (isDropping) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ballX, topY);
      ctx.lineTo(ballX, ballY);
      ctx.stroke();
    }
  }, [currentY, heightCm, fallObject, isDropping, elapsedTimeMs]);

  function drawPhotogate(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x, y - 8, 30, 16);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y - 8, 30, 16);

    // Diode LED
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 5, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px sans-serif';
    ctx.fillText(label, x + 35, y + 4);
  }

  // Theoretical values for comparison
  const gTheory = getG();
  const heightM = heightCm / 100;
  const tTheorySec = Math.sqrt((2 * heightM) / gTheory);
  const tTheoryMs = Math.round(tTheorySec * 1000);

  // Average measured g from records
  const avgG = records.length > 0 
    ? (records.reduce((sum, r) => sum + r.calculatedG, 0) / records.length).toFixed(2)
    : '--';

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-zinc-900/60 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold text-sm">
            VẬT LÝ 10
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành: Đo Gia Tốc Rơi Tự Do (Cổng Quang Điện Hiện Số)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                CTGDPT 2018 • KNTT / CD / CTST
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Công thức gốc: s = ½·g·t² ⇒ g = 2s/t². Khảo sát sự rơi trong chân không vs trong không khí.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDrop}
            disabled={isDropping}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" />
            <span>{isDropping ? 'Đang Rơi...' : 'Thả Bi Rơi Tự Do'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
            title="Đặt lại vị trí ban đầu"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Apparatus Canvas */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Activity size={14} className="text-emerald-400" />
              <span>Giá Đứng Thí Nghiệm & Cổng Quang Điện Hiện Số</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              Độ chia nhỏ nhất: 1mm • Đồng hồ: 0.001s
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              width={420}
              height={380}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950"
            />
          </div>

          {/* Digital Timer Display (Đồng hồ hiện số MC-964) */}
          <div className="w-full mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Đồng hồ hiện số:</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400 tracking-wider">
              {(elapsedTimeMs / 1000).toFixed(4)} <span className="text-xs text-emerald-600 font-sans">giây</span>
            </div>
          </div>
        </div>

        {/* Control Panel & Measurements Table */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Controls */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-emerald-400" />
                <span>Thiết Lập Dụng Cụ</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">s = {heightCm} cm</span>
            </div>

            {/* Quãng đường rơi s */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Vị trí cổng E2 (Quãng đường s):</span>
                <span className="font-mono text-emerald-400 font-semibold">{heightCm} cm ({heightM} m)</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={heightCm}
                onChange={(e) => {
                  setHeightCm(Number(e.target.value));
                  handleReset();
                }}
                disabled={isDropping}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>20 cm</span>
                <span>40 cm</span>
                <span>60 cm</span>
                <span>80 cm</span>
                <span>100 cm</span>
              </div>
            </div>

            {/* Môi trường rơi */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Môi trường khảo sát:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'earth_vac' as const, label: 'Trái Đất (Chân Không)', g: '9.81 m/s²' },
                  { id: 'earth_air' as const, label: 'Trái Đất (Không Khí)', g: 'Có Lực Cản' },
                  { id: 'moon' as const, label: 'Mặt Trăng', g: '1.62 m/s²' },
                  { id: 'mars' as const, label: 'Sao Hỏa', g: '3.71 m/s²' },
                ].map(env => (
                  <button
                    key={env.id}
                    onClick={() => { setEnvironment(env.id); handleReset(); }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      environment === env.id
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="truncate">{env.label}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{env.g}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vật thể rơi (Ống Newton) */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Vật rơi (Thí nghiệm Ống Newton):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'steel_ball' as const, label: 'Bi Sắt' },
                  { id: 'wood_ball' as const, label: 'Bi Gỗ' },
                  { id: 'feather' as const, label: 'Lông Chim' },
                ].map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => { setFallObject(obj.id); handleReset(); }}
                    className={`p-1.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                      fallObject === obj.id
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bảng Dữ Liệu Thực Nghiệm (Xử Lý Sai Số Thực Nghiệm) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <span>Bảng Số Liệu Đo Thực Nghiệm ({records.length} Lần)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300">
                ḡ = {avgG} m/s²
              </span>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-4">
                Chưa có dữ liệu đo. Nhấn "Thả Bi Rơi Tự Do" để thực hiện đo lường.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto scrollbar-thin text-xs">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-1">Lần</th>
                      <th className="py-1">s (m)</th>
                      <th className="py-1">t (ms)</th>
                      <th className="py-1">g đo (m/s²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {records.map((r) => (
                      <tr key={r.attempt} className="hover:bg-zinc-800/40">
                        <td className="py-1 font-bold text-emerald-400">#{r.attempt}</td>
                        <td className="py-1">{r.heightM}</td>
                        <td className="py-1">{r.timeMs}</td>
                        <td className="py-1 text-emerald-300 font-bold">{r.calculatedG}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* First Principles Insight Callout */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Nguyên Lý Gốc Rễ (First Principles) Theo SGK CTGDPT 2018</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Tại sao vật nặng và vật nhẹ rơi tự do như nhau?</strong> Theo Định luật 2 Newton: a = F/m. Lực hấp dẫn của Trái Đất tỷ lệ với khối lượng (F = m · g), nhưng quán tính cản trở gia tốc của vật cũng tỷ lệ đúng với m. Khối lượng m ở tử số và mẫu số triệt tiêu nhau hoàn toàn: a = (m · g) / m = g.
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Thí nghiệm Ống Newton:</strong> Trong không khí, chiếc lông rơi chậm do lực cản không khí lớn so với trọng lượng. Khi hút hết không khí tạo chân không, lông chim và viên bi sắt rơi chạm đáy cùng một thời điểm!
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Khảo Sát Rơi Tự Do & Đo Gia Tốc Trọng Trường')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Rơi Tự Do</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
