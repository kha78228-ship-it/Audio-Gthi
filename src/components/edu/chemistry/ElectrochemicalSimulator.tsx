import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Gauge, 
  CheckCircle2,
  Layers,
  Power
} from 'lucide-react';

interface ElectrochemicalSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function ElectrochemicalSimulator({ onOpenVideoLesson }: ElectrochemicalSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment mode: Daniell Galvanic Cell or Electrolysis
  const [cellMode, setCellMode] = useState<'daniell_pin' | 'electrolysis'>('daniell_pin');

  // Daniell Cell Interactive States
  const [hasSaltBridge, setHasSaltBridge] = useState<boolean>(true);
  const [isCircuitClosed, setIsCircuitClosed] = useState<boolean>(true);
  const [loadType, setLoadType] = useState<'voltmeter' | 'led_bulb'>('voltmeter');
  const [cellTimeSec, setCellTimeSec] = useState<number>(0);

  // Metal electrode pair selection
  const [anodeMetal, setAnodeMetal] = useState<'Zn' | 'Mg' | 'Fe'>('Zn');
  const [cathodeMetal, setCathodeMetal] = useState<'Cu' | 'Ag' | 'Ni'>('Cu');

  // Standard reduction potentials E° (V)
  const REDUCTION_POTENTIALS: Record<string, number> = {
    Mg: -2.37,
    Zn: -0.76,
    Fe: -0.44,
    Ni: -0.26,
    Cu: 0.34,
    Ag: 0.80
  };

  const eAnode = REDUCTION_POTENTIALS[anodeMetal] ?? -0.76;
  const eCathode = REDUCTION_POTENTIALS[cathodeMetal] ?? 0.34;
  const theoreticalEMF = Number((eCathode - eAnode).toFixed(2));

  // Current measured voltage
  const measuredVoltage = hasSaltBridge && isCircuitClosed ? theoreticalEMF : 0.00;

  // Animation loop for electron flow and ion movements
  useEffect(() => {
    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      if (hasSaltBridge && isCircuitClosed) {
        setCellTimeSec(prev => prev + 0.02);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawElectrochemicalCanvas(ctx, canvas.width, canvas.height, t);
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hasSaltBridge, isCircuitClosed, loadType, anodeMetal, cathodeMetal, cellMode, measuredVoltage]);

  function drawElectrochemicalCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const beaker1X = 60;
    const beaker2X = width - 180;
    const beakerY = 120;
    const beakerW = 120;
    const beakerH = 150;

    // 1. Draw Left Beaker (Anode - Zn / ZnSO4)
    ctx.fillStyle = 'rgba(24, 24, 27, 0.6)';
    ctx.fillRect(beaker1X, beakerY, beakerW, beakerH);
    // Liquid ZnSO4 (Clear colorless)
    ctx.fillStyle = 'rgba(212, 212, 216, 0.15)';
    ctx.fillRect(beaker1X, beakerY + 30, beakerW, beakerH - 30);
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.strokeRect(beaker1X, beakerY, beakerW, beakerH);

    // Left Electrode (Zn - Grey metal bar)
    const znX = beaker1X + 45;
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(znX, beakerY - 20, 26, beakerH + 10);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(znX, beakerY - 20, 26, beakerH + 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${anodeMetal} (-)`, znX - 4, beakerY - 26);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('ANODE (Oxi hóa)', beaker1X + 15, beakerY + beakerH + 20);

    // 2. Draw Right Beaker (Cathode - Cu / CuSO4)
    ctx.fillStyle = 'rgba(24, 24, 27, 0.6)';
    ctx.fillRect(beaker2X, beakerY, beakerW, beakerH);
    // Liquid CuSO4 (Vibrant blue)
    ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
    ctx.fillRect(beaker2X, beakerY + 30, beakerW, beakerH - 30);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(beaker2X, beakerY, beakerW, beakerH);

    // Right Electrode (Cu - Copper reddish orange)
    const cuX = beaker2X + 45;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(cuX, beakerY - 20, 26, beakerH + 10);
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cuX, beakerY - 20, 26, beakerH + 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${cathodeMetal} (+)`, cuX - 4, beakerY - 26);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('CATHODE (Khử)', beaker2X + 22, beakerY + beakerH + 20);

    // 3. Salt Bridge (Cầu Muối U-tube chứa KNO3)
    if (hasSaltBridge) {
      const bridgeLeftX = beaker1X + beakerW - 25;
      const bridgeRightX = beaker2X + 25;
      const bridgeTopY = beakerY - 10;
      const bridgeBottomY = beakerY + 80;

      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      // Left leg
      ctx.rect(bridgeLeftX - 10, bridgeTopY, 20, bridgeBottomY - bridgeTopY);
      // Horizontal bridge
      ctx.rect(bridgeLeftX - 10, bridgeTopY, bridgeRightX - bridgeLeftX + 20, 20);
      // Right leg
      ctx.rect(bridgeRightX - 10, bridgeTopY, 20, bridgeBottomY - bridgeTopY);
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bridgeLeftX - 10, bridgeBottomY);
      ctx.lineTo(bridgeLeftX - 10, bridgeTopY);
      ctx.lineTo(bridgeRightX + 10, bridgeTopY);
      ctx.lineTo(bridgeRightX + 10, bridgeBottomY);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('CẦU MUỐI (KNO₃)', (bridgeLeftX + bridgeRightX) / 2 - 40, bridgeTopY + 14);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('⚠️ CẦU MUỐI ĐÃ BỊ THÁO (MẠCH HỞ)', width / 2 - 85, beakerY + 40);
    }

    // 4. External Wire & Voltmeter / LED
    const wireY = 40;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;

    // Wire from Anode up
    ctx.beginPath();
    ctx.moveTo(znX + 13, beakerY - 20);
    ctx.lineTo(znX + 13, wireY);
    ctx.lineTo(width / 2 - 35, wireY);
    ctx.stroke();

    // Wire from Cathode up
    ctx.beginPath();
    ctx.moveTo(cuX + 13, beakerY - 20);
    ctx.lineTo(cuX + 13, wireY);
    ctx.lineTo(width / 2 + 35, wireY);
    ctx.stroke();

    // Center Load (Voltmeter or LED)
    const centerX = width / 2;
    if (loadType === 'voltmeter') {
      // Voltmeter dial
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(centerX, wireY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${measuredVoltage.toFixed(2)}V`, centerX - 18, wireY + 4);
      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('VÔN KẾ', centerX - 14, wireY + 17);
    } else {
      // LED Bulb
      const isLit = measuredVoltage > 0.5;
      ctx.fillStyle = isLit ? '#fde047' : '#52525b';
      ctx.beginPath();
      ctx.arc(centerX, wireY - 5, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isLit ? '#eab308' : '#71717a';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isLit) {
        // Glow rays
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(a) * 16, (wireY - 5) + Math.sin(a) * 16);
          ctx.lineTo(centerX + Math.cos(a) * 25, (wireY - 5) + Math.sin(a) * 25);
          ctx.stroke();
        }
      }
    }

    // Moving electrons along wire (from Anode Zn to Cathode Cu)
    if (measuredVoltage > 0) {
      ctx.fillStyle = '#38bdf8';
      const electronProgress = (time * 40) % (width - 160);
      const eX = znX + 13 + electronProgress;
      if (eX < cuX + 13) {
        ctx.beginPath();
        ctx.arc(eX, wireY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('e⁻', eX - 3, wireY - 6);
      }
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Banner CTGDPT 2018 Grade 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-zinc-900/60 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono font-bold text-sm">
            HÓA HỌC 12
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành: Pin Điện Hóa Daniell & Suất Điện Động Chuẩn
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                CTGDPT 2018 Sách Mới • Năng Lượng Điện Hóa
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Nguyên lý: Chuyển hóa hóa năng của phản ứng oxi hóa - khử tự phát thành điện năng: E°(pin) = E°(cathode) - E°(anode) = 1.10 V.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasSaltBridge(!hasSaltBridge)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              hasSaltBridge
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            {hasSaltBridge ? '✓ Cầu Muối Đang Nối' : '❌ Đã Tháo Cầu Muối'}
          </button>
          <button
            onClick={() => setIsCircuitClosed(!isCircuitClosed)}
            className={`p-2 rounded-xl border cursor-pointer ${
              isCircuitClosed
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/60 text-rose-300'
            }`}
            title={isCircuitClosed ? 'Ngắt công tắc' : 'Đóng công tắc'}
          >
            <Power size={16} />
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Zap size={14} className="text-cyan-400" />
              <span>Sơ Đồ Mô Phỏng Pin Điện Hóa Daniell Hoạt Động</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-400">
              Suất điện động $E^\circ = {measuredVoltage.toFixed(2)}$ V
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              width={480}
              height={300}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950 max-w-full"
            />
          </div>

          {/* Reaction Half Equations */}
          <div className="w-full mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 block text-[10px]">Cực Âm (Anode - Oxi hóa):</span>
              <span className="font-mono font-bold text-zinc-200">
                {anodeMetal} → {anodeMetal}²⁺ + 2e⁻
              </span>
              <span className="text-[10px] text-zinc-400 block">E° = {eAnode} V</span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-500 block text-[10px]">Cực Dương (Cathode - Khử):</span>
              <span className="font-mono font-bold text-cyan-300">
                {cathodeMetal}²⁺ + 2e⁻ → {cathodeMetal}
              </span>
              <span className="text-[10px] text-zinc-400 block">E° = +{eCathode} V</span>
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-cyan-400" />
                <span>Thiết Lập Cặp Điện Cực Kim Loại</span>
              </span>
            </div>

            {/* Anode Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Kim loại Cực Âm (Anode):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Zn' as const, label: 'Kẽm (Zn)', e: '-0.76V' },
                  { id: 'Mg' as const, label: 'Magie (Mg)', e: '-2.37V' },
                  { id: 'Fe' as const, label: 'Sắt (Fe)', e: '-0.44V' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setAnodeMetal(m.id)}
                    className={`p-1.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      anodeMetal === m.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>{m.label}</div>
                    <span className="text-[9px] font-mono text-zinc-500">{m.e}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cathode Selection */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Kim loại Cực Dương (Cathode):</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Cu' as const, label: 'Đồng (Cu)', e: '+0.34V' },
                  { id: 'Ag' as const, label: 'Bạc (Ag)', e: '+0.80V' },
                  { id: 'Ni' as const, label: 'Niken (Ni)', e: '-0.26V' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setCathodeMetal(m.id)}
                    className={`p-1.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      cathodeMetal === m.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>{m.label}</div>
                    <span className="text-[9px] font-mono text-zinc-500">{m.e}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Load Type */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Thiết bị tải tiêu thụ điện:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLoadType('voltmeter')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    loadType === 'voltmeter'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Vôn Kế Điện Tử
                </button>
                <button
                  onClick={() => setLoadType('led_bulb')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    loadType === 'led_bulb'
                      ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Bóng Đèn LED Phát Sáng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* First Principles Theoretical Note */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Vai Trò Của Cầu Muối & Cơ Chế Sinh Điện (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Tại sao tháo cầu muối thì dòng điện lập tức về 0?</strong> Nếu không có cầu muối, khi thanh Zn tan ra sinh ion Zn²⁺, cốc bên trái sẽ nhanh chóng thừa điện tích dương; cốc bên phải mất Cu²⁺ sẽ thừa điện tích âm SO₄²⁻. Sự chênh lệch điện tích này cản trở electron di chuyển tiếp. Cầu muối cho phép các ion K⁺ và NO₃⁻ dịch chuyển để trung hòa điện tích hai cốc, khép kín mạch điện!
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Quy ước dấu điện cực:</strong> Trong pin điện hóa, Anode là cực Âm (nơi nhường electron), Cathode là cực Dương (nơi nhận electron) — ngược lại với bình điện phân.
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Pin Điện Hóa Daniell & Suất Điện Động Chuẩn')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Pin Daniell</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
