import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Layers,
  Compass,
  Zap
} from 'lucide-react';

interface WaveInterferenceSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function WaveInterferenceSimulator({ onOpenVideoLesson }: WaveInterferenceSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mode: Water surface interference or Standing wave on string
  const [mode, setMode] = useState<'water_ripple' | 'standing_string'>('water_ripple');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Water Ripple Params
  const [freqWater, setFreqWater] = useState<number>(10); // Hz
  const [sourceDistCm, setSourceDistCm] = useState<number>(10); // cm between S1 and S2
  const [waveSpeedWater, setWaveSpeedWater] = useState<number>(25); // cm/s
  const [sourcePhase, setSourcePhase] = useState<'in_phase' | 'out_phase'>('in_phase'); // Cùng pha vs Ngược pha

  // Point M Inspector on water
  const [pointMX, setPointMX] = useState<number>(2); // cm from center
  const [pointMY, setPointMY] = useState<number>(4); // cm from center

  // Standing String Params
  const [stringHarmonic, setStringHarmonic] = useState<number>(3); // 1 to 6 nodes
  const [stringLengthM] = useState<number>(1.2); // meters
  const [waveSpeedString] = useState<number>(24); // m/s
  const [stringTension, setStringTension] = useState<number>(50); // N

  // Animation frame
  const animTimeRef = useRef<number>(0);

  // Calculated physical variables
  const lambdaWater = waveSpeedWater / freqWater; // cm
  const maxInterferenceK = Math.floor(sourceDistCm / lambdaWater);
  const totalMaxLines = 2 * maxInterferenceK + 1;

  // Standing wave resonance frequency: f_k = k * v / (2L)
  const resonantFreqString = (stringHarmonic * waveSpeedString) / (2 * stringLengthM);

  // Coordinates of sources S1 and S2 in water mode
  const s1X = -sourceDistCm / 2;
  const s2X = sourceDistCm / 2;

  // Distance from S1 and S2 to Point M
  const d1 = Math.sqrt((pointMX - s1X) ** 2 + pointMY ** 2);
  const d2 = Math.sqrt((pointMX - s2X) ** 2 + pointMY ** 2);
  const deltaD = Math.abs(d2 - d1);
  const kFloat = deltaD / lambdaWater;
  const isPointMMaximum = Math.abs(kFloat - Math.round(kFloat)) < 0.15;
  const isPointMMinimum = Math.abs(kFloat - (Math.floor(kFloat) + 0.5)) < 0.15;

  // Animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        animTimeRef.current += dt;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (mode === 'water_ripple') {
            drawWaterInterference(ctx, canvas.width, canvas.height, animTimeRef.current);
          } else {
            drawStandingString(ctx, canvas.width, canvas.height, animTimeRef.current);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, mode, freqWater, sourceDistCm, waveSpeedWater, sourcePhase, pointMX, pointMY, stringHarmonic]);

  // Renderer for 2D Water Wave Interference
  function drawWaterInterference(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 16; // pixels per cm

    // Draw interference field rings
    const s1PixelX = centerX + s1X * scale;
    const s2PixelX = centerX + s2X * scale;
    const sPixelY = centerY;

    const omega = 2 * Math.PI * freqWater;
    const kWave = (2 * Math.PI) / (lambdaWater * scale);

    // Draw wave fronts (gợn sóng)
    const maxR = Math.max(width, height);
    const ringSpacing = lambdaWater * scale;

    ctx.lineWidth = 1.5;
    const phaseOffset2 = sourcePhase === 'out_phase' ? Math.PI : 0;

    // Draw circular wave crests for S1
    for (let r = ((t * waveSpeedWater * scale) % ringSpacing); r < maxR; r += ringSpacing) {
      const alpha = Math.max(0.1, 1 - r / maxR);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(s1PixelX, sPixelY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw circular wave crests for S2
    for (let r = (((t * waveSpeedWater + (sourcePhase === 'out_phase' ? lambdaWater / 2 : 0)) * scale) % ringSpacing); r < maxR; r += ringSpacing) {
      const alpha = Math.max(0.1, 1 - r / maxR);
      ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(s2PixelX, sPixelY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Hyperbolic Crest Lines (Vân cực đại)
    for (let k = -maxInterferenceK; k <= maxInterferenceK; k++) {
      ctx.beginPath();
      ctx.strokeStyle = k === 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = k === 0 ? 2.5 : 1.5;

      const pathDiff = k * lambdaWater;
      if (Math.abs(pathDiff) < sourceDistCm) {
        let first = true;
        for (let y = -centerY + 10; y <= centerY - 10; y += 4) {
          const yCm = y / scale;
          // Hyperbola equation: x = k*lambda / 2 * sqrt(1 + 4*y^2 / (d^2 - (k*lambda)^2))
          const denom = sourceDistCm ** 2 - pathDiff ** 2;
          if (denom > 0) {
            const xCm = (pathDiff / 2) * Math.sqrt(1 + (4 * yCm ** 2) / denom);
            const px = centerX + xCm * scale;
            const py = centerY + y;
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();
      }
    }

    // Draw Source S1 & S2
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(s1PixelX, sPixelY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('S₁', s1PixelX - 6, sPixelY - 10);

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(s2PixelX, sPixelY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('S₂', s2PixelX - 6, sPixelY - 10);

    // Draw Inspected Point M
    const mPixelX = centerX + pointMX * scale;
    const mPixelY = centerY + pointMY * scale;

    // Lines from S1 to M and S2 to M
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s1PixelX, sPixelY);
    ctx.lineTo(mPixelX, mPixelY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s2PixelX, sPixelY);
    ctx.lineTo(mPixelX, mPixelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Point M circle
    ctx.fillStyle = isPointMMaximum ? '#22c55e' : isPointMMinimum ? '#ef4444' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(mPixelX, mPixelY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Điểm M (${isPointMMaximum ? 'CỰC ĐẠI' : isPointMMinimum ? 'CỰC TIỂU' : 'TRUNG GIAN'})`, mPixelX + 12, mPixelY + 4);
  }

  // Renderer for Standing Wave on String
  function drawStandingString(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const startX = 60;
    const endX = width - 60;
    const stringPixLen = endX - startX;
    const centerY = height / 2;

    // Supports at both ends
    ctx.fillStyle = '#27272a';
    ctx.fillRect(startX - 15, centerY - 50, 15, 100);
    ctx.fillRect(endX, centerY - 50, 15, 100);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('MÁY RUNG', startX - 35, centerY - 60);
    ctx.fillText('ĐẦU CỐ ĐỊNH', endX - 10, centerY - 60);

    // Oscillation wave
    const k = stringHarmonic; // number of antinodes / half-wavelengths
    const maxAmplitude = 38; // px
    const omega = 2 * Math.PI * resonantFreqString;
    const timePhase = Math.sin(t * 8);

    // Draw string shadow envelope (vùng giới hạn dao động)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Top envelope
    ctx.beginPath();
    for (let x = 0; x <= stringPixLen; x++) {
      const posRatio = x / stringPixLen;
      const amp = maxAmplitude * Math.sin(posRatio * Math.PI * k);
      const px = startX + x;
      const py = centerY - amp;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Bottom envelope
    ctx.beginPath();
    for (let x = 0; x <= stringPixLen; x++) {
      const posRatio = x / stringPixLen;
      const amp = maxAmplitude * Math.sin(posRatio * Math.PI * k);
      const px = startX + x;
      const py = centerY + amp;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw dynamic vibrating string
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= stringPixLen; x++) {
      const posRatio = x / stringPixLen;
      const displacement = maxAmplitude * Math.sin(posRatio * Math.PI * k) * timePhase;
      const px = startX + x;
      const py = centerY + displacement;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mark Nodes (Nút sóng) and Antinodes (Bụng sóng)
    for (let n = 0; n <= k; n++) {
      const nodeX = startX + (n / k) * stringPixLen;
      // Node marker
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(nodeX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText(`Nút ${n}`, nodeX - 12, centerY + 20);

      // Antinode marker in between
      if (n < k) {
        const antiX = startX + ((n + 0.5) / k) * stringPixLen;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(antiX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`Bụng ${n + 1}`, antiX - 15, centerY - 25);
      }
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Banner CTGDPT 2018 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-teal-950/20 to-zinc-900/60 border border-sky-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 font-mono font-bold text-sm">
            VẬT LÝ 11
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Giao Thoa Sóng & Sóng Dừng Trên Dây Đàn Hồi
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                CTGDPT 2018 • KNTT / CD / CTST
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Khảo sát bản chất giao thoa 2 nguồn sóng nước (d₂ - d₁ = k·λ) và hiện tượng sóng dừng (L = k·λ/2).
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setMode('water_ripple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'water_ripple'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Giao Thoa Sóng Nước
            </button>
            <button
              onClick={() => setMode('standing_string')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'standing_string'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sóng Dừng Trên Dây
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Tiếp tục dao động'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Activity size={14} className="text-sky-400" />
              <span>{mode === 'water_ripple' ? 'Mô Hình Gợn Sóng & Vân Cực Đại/Tiểu' : 'Mô Hình Sóng Dừng Động Lực Học'}</span>
            </span>
            <span className="font-mono text-[11px] text-sky-400">
              {mode === 'water_ripple' ? `λ = ${lambdaWater.toFixed(2)} cm • ${totalMaxLines} Vân Cực Đại` : `${stringHarmonic} Bụng Sóng • ${stringHarmonic + 1} Nút Sóng`}
            </span>
          </div>

          <div className="w-full flex justify-center py-1">
            <canvas
              ref={canvasRef}
              width={520}
              height={360}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950 max-w-full"
            />
          </div>

          {/* Realtime Inspector Readout */}
          {mode === 'water_ripple' ? (
            <div className="w-full mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">Khoảng cách $d_1$ (S₁→M):</span>
                <span className="font-mono font-bold text-sky-400">{d1.toFixed(2)} cm</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Khoảng cách $d_2$ (S₂→M):</span>
                <span className="font-mono font-bold text-emerald-400">{d2.toFixed(2)} cm</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Hiệu đường đi |d₂ - d₁|:</span>
                <span className="font-mono font-bold text-amber-400">{deltaD.toFixed(2)} cm</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Tỉ số |d₂ - d₁| / λ:</span>
                <span className="font-mono font-bold text-purple-400">{kFloat.toFixed(2)} ({isPointMMaximum ? 'CỰC ĐẠI' : isPointMMinimum ? 'CỰC TIỂU' : 'BẤT KỲ'})</span>
              </div>
            </div>
          ) : (
            <div className="w-full mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">Chiều dài dây L:</span>
                <span className="font-mono font-bold text-emerald-400">{stringLengthM} m</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Số bụng sóng k:</span>
                <span className="font-mono font-bold text-sky-400">{stringHarmonic} Bụng</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Bước sóng λ = 2L/k:</span>
                <span className="font-mono font-bold text-amber-400">{((2 * stringLengthM) / stringHarmonic).toFixed(2)} m</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Tần số cộng hưởng:</span>
                <span className="font-mono font-bold text-emerald-300">{resonantFreqString.toFixed(1)} Hz</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-sky-400" />
                <span>Điều Khiển Nguồn Sóng</span>
              </span>
            </div>

            {mode === 'water_ripple' ? (
              <>
                {/* Tần số nguồn f */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Tần số cần rung ($f$):</span>
                    <span className="font-mono text-sky-400 font-bold">{freqWater} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={freqWater}
                    onChange={(e) => setFreqWater(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Khoảng cách 2 nguồn S1 S2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Khoảng cách 2 nguồn ($S_1S_2$):</span>
                    <span className="font-mono text-emerald-400 font-bold">{sourceDistCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="1"
                    value={sourceDistCm}
                    onChange={(e) => setSourceDistCm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Tọa độ điểm M khảo sát */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Vị trí điểm M khảo sát:</span>
                    <span className="font-mono text-amber-400 font-bold">({pointMX}, {pointMY}) cm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-500">Trục X:</span>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={pointMX}
                        onChange={(e) => setPointMX(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500">Trục Y:</span>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={pointMY}
                        onChange={(e) => setPointMY(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Pha của 2 nguồn */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  <label className="text-xs text-zinc-400">Độ lệch pha 2 nguồn:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setSourcePhase('in_phase')}
                      className={`py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        sourcePhase === 'in_phase'
                          ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Cùng Pha ($\Delta\varphi = 0$)
                    </button>
                    <button
                      onClick={() => setSourcePhase('out_phase')}
                      className={`py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        sourcePhase === 'out_phase'
                          ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Ngược Pha ($\Delta\varphi = \pi$)
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Số bụng sóng dừng k */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Số bụng sóng ($k$):</span>
                    <span className="font-mono text-emerald-400 font-bold">{stringHarmonic} Bụng</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={stringHarmonic}
                    onChange={(e) => setStringHarmonic(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>k = 1</span>
                    <span>k = 2</span>
                    <span>k = 3</span>
                    <span>k = 4</span>
                    <span>k = 5</span>
                    <span>k = 6</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1.5 text-zinc-300">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <Zap size={13} />
                    <span>Điều Kiện Sóng Dừng 2 Đầu Cố Định:</span>
                  </div>
                  <p className="font-mono text-zinc-300 text-[11px]">
                    L = k · (λ/2) ⇒ λ = 2L/k
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Khoảng cách giữa 2 nút liên tiếp hoặc 2 bụng liên tiếp bằng λ/2. Khoảng cách giữa 1 nút và 1 bụng kề nhau là λ/4.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* First Principles Theoretical Note */}
      <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Nguyên Lý Gốc Rễ Bản Chất Sóng (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Giao thoa là bằng chứng thép của tính chất sóng:</strong> Hai sóng kết hợp gặp nhau sẽ cộng gộp độ dời dao động. Nơi 2 sóng cùng pha tới cùng lúc, biên độ dao động cực đại ($A = 2a$). Nơi 2 sóng ngược pha triệt tiêu nhau hoàn toàn, biên độ bằng 0 ($A = 0$).
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Bản chất sóng dừng:</strong> Sóng dừng không truyền tải năng lượng đi xa như sóng chạy, mà là hiện tượng giao thoa giữa sóng tới và sóng phản xạ từ đầu cố định. Các phần tử tại nút sóng hoàn toàn đứng yên!
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Giao Thoa Sóng & Sóng Dừng Trên Dây Đàn Hồi')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Giao Thoa Sóng</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
