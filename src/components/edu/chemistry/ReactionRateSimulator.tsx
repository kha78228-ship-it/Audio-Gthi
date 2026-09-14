import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Thermometer, 
  Clock,
  Eye,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ReactionRateSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function ReactionRateSimulator({ onOpenVideoLesson }: ReactionRateSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment factors
  const [temperature, setTemperature] = useState<number>(25); // 20 - 60 °C
  const [concentrationNa2S2O3, setConcentrationNa2S2O3] = useState<number>(0.1); // 0.05M - 0.2M
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(false);
  const [stirringSpeed, setStirringSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  // Simulation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [turbidityOpacity, setTurbidityOpacity] = useState<number>(0); // 0 to 1
  const [isCrossCovered, setIsCrossCovered] = useState<boolean>(false);
  const [records, setRecords] = useState<{ id: number; temp: number; conc: number; timeSec: number; rateVal: number }[]>([]);

  // Theoretical reaction rate calculation
  // Rate v = k * [Na2S2O3] * [H2SO4], where k(T) follows Arrhenius equation
  // k doubles roughly every 10°C (Van 't Hoff rule)
  const tempFactor = Math.pow(2.2, (temperature - 25) / 10);
  const concFactor = concentrationNa2S2O3 / 0.1;
  const stirFactor = stirringSpeed === 'fast' ? 1.3 : stirringSpeed === 'medium' ? 1.0 : 0.8;
  const catalystFactor = hasCatalyst ? 2.5 : 1.0;

  const totalRateRelative = tempFactor * concFactor * stirFactor * catalystFactor;
  // Total time until sulfur precipitate fully covers the black "X" mark:
  const targetTimeSec = Math.max(3, Math.round(24 / totalRateRelative));

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSec(0);
    setTurbidityOpacity(0);
    setIsCrossCovered(false);
  };

  const handleStartReaction = () => {
    if (isRunning) return;
    handleReset();
    setIsRunning(true);
  };

  // Timer & precipitation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSec(prev => {
        const nextTime = prev + 0.1;
        const opacity = Math.min(1, nextTime / targetTimeSec);
        setTurbidityOpacity(opacity);

        if (opacity >= 0.95 && !isCrossCovered) {
          setIsCrossCovered(true);
          setIsRunning(false);

          // Record measurement
          const finishedTime = Number(nextTime.toFixed(1));
          setRecords(r => [
            {
              id: r.length + 1,
              temp: temperature,
              conc: concentrationNa2S2O3,
              timeSec: finishedTime,
              rateVal: Number((1 / finishedTime).toFixed(3))
            },
            ...r.slice(0, 7)
          ]);
        }
        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, targetTimeSec, isCrossCovered, temperature, concentrationNa2S2O3]);

  // Canvas visualizer for beaker viewed from above (looking through beaker at Cross "X")
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const beakerRadius = 90;

    // 1. Draw Paper underneath with black Cross "X" mark
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(centerX - 120, centerY - 120, 240, 240);
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - 120, centerY - 120, 240, 240);

    // Text on paper
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('GIẤY KẺ DẤU CHỮ THẬP (CTGDPT 2018)', centerX - 105, centerY - 100);

    // Black "X" cross mark on paper
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 50);
    ctx.lineTo(centerX + 50, centerY + 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 50, centerY - 50);
    ctx.lineTo(centerX - 50, centerY + 50);
    ctx.stroke();

    // 2. Beaker boundary ring (cốc thủy tinh)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, beakerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Liquid inside beaker (becoming milky yellow sulfur precipitate)
    // Initially clear water, turns opaque milky-yellow
    const yellowAlpha = turbidityOpacity * 0.98;
    ctx.fillStyle = `rgba(253, 224, 71, ${yellowAlpha})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, beakerRadius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Tiny sulfur particles floating in liquid
    if (turbidityOpacity > 0.1) {
      const particleCount = Math.floor(turbidityOpacity * 60);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
      for (let i = 0; i < particleCount; i++) {
        const angle = (i * 137.5) * (Math.PI / 180);
        const r = Math.sqrt((i + 1) / particleCount) * (beakerRadius - 10);
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Beaker glass reflection highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, beakerRadius - 4, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }, [turbidityOpacity]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Banner CTGDPT 2018 Grade 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-zinc-900/60 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold text-sm">
            HÓA HỌC 10
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành: Tốc Độ Phản Ứng & Các Yếu Tố Ảnh Hưởng
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                CTGDPT 2018 • Phương Pháp Dấu Chữ Thập X
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Phản ứng: Na₂S₂O₃ + H₂SO₄ → Na₂SO₄ + S↓ (vàng đục) + SO₂↑ + H₂O.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartReaction}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" />
            <span>{isRunning ? 'Đang phản ứng...' : 'Trộn Hóa Chất (Bắt Đầu)'}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
            title="Đặt lại dung dịch trong suốt"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Viewing Beaker from Top */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Eye size={14} className="text-amber-400" />
              <span>Góc Nhìn Thẳng Đứng Từ Trên Xuống Cốc Thủy Tinh (Dấu X)</span>
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              Độ đục S: {(turbidityOpacity * 100).toFixed(0)}%
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              width={340}
              height={300}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950"
            />
          </div>

          {/* Status banner */}
          <div className={`w-full mt-2 p-3 rounded-xl border flex items-center justify-between transition-all ${
            isCrossCovered
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : isRunning
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <Clock size={15} className={isRunning ? 'animate-spin' : ''} />
              <span>Thời gian phản ứng ($\Delta t$):</span>
            </div>
            <div className="font-mono text-xl font-bold tracking-wide">
              {elapsedSec.toFixed(1)}s {isCrossCovered && <span className="text-xs font-sans text-emerald-400">(Dấu X Bị Che Khuất)</span>}
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-amber-400" />
                <span>Các Yếu Tố Ảnh Hưởng Tốc Độ ($v$)</span>
              </span>
            </div>

            {/* Nhiệt độ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Thermometer size={13} className="text-rose-400" />
                  <span>Nhiệt độ dung dịch ($T$):</span>
                </span>
                <span className="font-mono text-rose-400 font-bold">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={temperature}
                onChange={(e) => { setTemperature(Number(e.target.value)); handleReset(); }}
                disabled={isRunning}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>20°C (Phòng)</span>
                <span>40°C</span>
                <span>60°C (Nóng)</span>
              </div>
            </div>

            {/* Nồng độ Na2S2O3 */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Nồng độ Na₂S₂O₃:</span>
                <span className="font-mono text-amber-400 font-bold">{concentrationNa2S2O3} M</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.20"
                step="0.025"
                value={concentrationNa2S2O3}
                onChange={(e) => { setConcentrationNa2S2O3(Number(e.target.value)); handleReset(); }}
                disabled={isRunning}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Tốc độ khuấy */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Tốc độ khuấy (Tiếp xúc):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['slow', 'medium', 'fast'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setStirringSpeed(s); handleReset(); }}
                    className={`py-1 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                      stirringSpeed === s
                        ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {s === 'slow' ? 'Chậm' : s === 'medium' ? 'Vừa' : 'Nhanh'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <FileSpreadsheet size={14} className="text-amber-400" />
                <span>Bảng Đối Chiếu Thời Gian Biến Mất Dấu X</span>
              </span>
            </div>

            {records.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-3">
                Chưa có dữ liệu. Nhấn "Trộn Hóa Chất" để bắt đầu bấm giờ.
              </p>
            ) : (
              <div className="max-h-36 overflow-y-auto scrollbar-thin text-xs">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-1">Lần</th>
                      <th className="py-1">T (°C)</th>
                      <th className="py-1">C (M)</th>
                      <th className="py-1">Δt (s)</th>
                      <th className="py-1">Tốc độ v (1/Δt)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-zinc-800/40">
                        <td className="py-1 text-amber-400 font-bold">#{r.id}</td>
                        <td className="py-1 text-rose-300">{r.temp}°C</td>
                        <td className="py-1">{r.conc}M</td>
                        <td className="py-1 font-bold text-emerald-400">{r.timeSec}s</td>
                        <td className="py-1 text-purple-300 font-bold">{r.rateVal}</td>
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
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Quy Tắc Van 't Hoff & Bản Chất Va Chạm Hiệu Quả (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Tại sao tăng nhiệt độ làm tăng tốc độ phản ứng?</strong> Phản ứng chỉ xảy ra khi các phân tử va chạm với năng lượng lớn hơn năng lượng hoạt hóa ($E \ge E_a$). Khi tăng nhiệt độ, động năng trung bình của phân tử tăng, dẫn đến tỷ lệ các va chạm hiệu quả tăng theo cấp số nhân (hệ số nhiệt độ Van 't Hoff $\gamma \approx 2 - 4$).
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Tại sao tăng nồng độ làm tăng tốc độ?</strong> Nồng độ tăng $\Rightarrow$ Số lượng hạt trong một đơn vị thể tích tăng $\Rightarrow$ Tần số va chạm giữa các chất phản ứng trong một giây tăng lên.
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Tốc Độ Phản Ứng & Các Yếu Tố Ảnh Hưởng')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Tốc Độ Phản Ứng</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
