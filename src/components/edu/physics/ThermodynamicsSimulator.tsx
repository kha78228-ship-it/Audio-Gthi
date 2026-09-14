import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Gauge, 
  Layers,
  Thermometer,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

interface ThermodynamicsSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

interface GasMolecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function ThermodynamicsSimulator({ onOpenVideoLesson }: ThermodynamicsSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Experiment variables (Isothermal Process - Đẳng Nhiệt T = const)
  const [volumeMl, setVolumeMl] = useState<number>(50); // 20ml - 80ml
  const [temperatureK, setTemperatureK] = useState<number>(300); // 250K - 400K
  const [gasType, setGasType] = useState<'helium' | 'nitrogen' | 'air'>('nitrogen');
  const [dataPoints, setDataPoints] = useState<{ volume: number; pressure: number; pv: number }[]>([
    { volume: 80, pressure: 0.75, pv: 60.0 },
    { volume: 60, pressure: 1.00, pv: 60.0 },
    { volume: 50, pressure: 1.20, pv: 60.0 },
    { volume: 40, pressure: 1.50, pv: 60.0 },
    { volume: 30, pressure: 2.00, pv: 60.0 },
  ]);

  // Gas particles simulation
  const moleculesRef = useRef<GasMolecule[]>([]);
  const animRef = useRef<number>(0);

  // Ideal Gas Law: P = (n * R * T) / V
  // Let constant C = n * R * T = 60 at 300K
  const baseConstant = (temperatureK / 300) * 60;
  const currentPressureBar = Number((baseConstant / volumeMl).toFixed(2));
  const currentPv = Number((currentPressureBar * volumeMl).toFixed(1));

  // Initialize gas molecules
  useEffect(() => {
    const count = 45;
    const molecules: GasMolecule[] = [];
    const speed = Math.sqrt(temperatureK / 300) * 2.2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      molecules.push({
        x: 40 + Math.random() * 150,
        y: 40 + Math.random() * 160,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: gasType === 'helium' ? 3 : 4.5
      });
    }
    moleculesRef.current = molecules;
  }, [temperatureK, gasType]);

  // Record measurement to data table
  const handleRecordPoint = () => {
    setDataPoints(prev => [
      ...prev,
      {
        volume: volumeMl,
        pressure: currentPressureBar,
        pv: currentPv
      }
    ].sort((a, b) => b.volume - a.volume));
  };

  const handleClearData = () => {
    setDataPoints([]);
  };

  // Canvas render loop for transparent cylinder & piston
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Cylinder dimensions
      const cylX = 40;
      const cylY = 40;
      const cylHeight = 220;
      const maxCylWidth = 280; // corresponds to 100ml
      const currentCylWidth = (volumeMl / 100) * maxCylWidth;

      // Draw Glass Cylinder Container
      ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.fillRect(cylX, cylY, maxCylWidth, cylHeight);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(cylX, cylY, maxCylWidth, cylHeight);

      // Volume tick marks on cylinder wall
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      for (let ml = 20; ml <= 100; ml += 20) {
        const markX = cylX + (ml / 100) * maxCylWidth;
        ctx.beginPath();
        ctx.moveTo(markX, cylY + cylHeight);
        ctx.lineTo(markX, cylY + cylHeight + 8);
        ctx.strokeStyle = '#64748b';
        ctx.stroke();
        ctx.fillText(`${ml}ml`, markX - 10, cylY + cylHeight + 20);
      }

      // Gas molecules movement & collisions inside active volume
      const molecules = moleculesRef.current;
      const speedScale = Math.sqrt(temperatureK / 300);

      ctx.fillStyle = gasType === 'helium' ? '#fbbf24' : '#38bdf8';
      for (let i = 0; i < molecules.length; i++) {
        const m = molecules[i];
        m.x += m.vx * speedScale;
        m.y += m.vy * speedScale;

        // Bounce left wall
        if (m.x - m.radius < cylX) {
          m.x = cylX + m.radius;
          m.vx = Math.abs(m.vx);
        }
        // Bounce moving piston right wall
        const pistonX = cylX + currentCylWidth;
        if (m.x + m.radius > pistonX) {
          m.x = pistonX - m.radius;
          m.vx = -Math.abs(m.vx);
        }
        // Bounce top wall
        if (m.y - m.radius < cylY) {
          m.y = cylY + m.radius;
          m.vy = Math.abs(m.vy);
        }
        // Bounce bottom wall
        if (m.y + m.radius > cylY + cylHeight) {
          m.y = cylY + cylHeight - m.radius;
          m.vy = -Math.abs(m.vy);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Moving Piston (Pit-tông kín)
      const pistonX = cylX + currentCylWidth;
      ctx.fillStyle = '#475569';
      ctx.fillRect(pistonX - 10, cylY, 14, cylHeight);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pistonX - 10, cylY, 14, cylHeight);

      // Piston connecting rod handle
      ctx.fillStyle = '#64748b';
      ctx.fillRect(pistonX + 4, cylY + cylHeight / 2 - 8, 70, 16);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('TAY CẦM', pistonX + 15, cylY + cylHeight / 2 + 4);

      // Pressure Gauge (Áp kế điện tử) connected to cylinder top
      const gaugeX = cylX + currentCylWidth / 2;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gaugeX, cylY);
      ctx.lineTo(gaugeX, cylY - 20);
      ctx.stroke();

      // Digital Sensor Dial
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(gaugeX, cylY - 20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`${currentPressureBar}bar`, gaugeX - 14, cylY - 17);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [volumeMl, temperatureK, gasType, currentPressureBar]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Grade 12 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-rose-950/20 to-zinc-900/60 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold text-sm">
            VẬT LÝ 12
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Thực Hành Khảo Sát Khí Lý Tưởng & Định Luật Boyle
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                CTGDPT 2018 Sách Mới • Quá Trình Đẳng Nhiệt
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Kiểm chứng định luật Boyle: Trong quá trình đẳng nhiệt (T = const), tích áp suất và thể tích là một hằng số (p · V = const).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecordPoint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <span>+ Ghi Số Liệu Đo (V={volumeMl}ml)</span>
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Gauge size={14} className="text-amber-400" />
              <span>Xilanh Khí Kín Pit-tông Di Động & Cảm Biến Áp Suất</span>
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              $T = {temperatureK}$ K (${temperatureK - 273}$°C)
            </span>
          </div>

          <div className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              width={420}
              height={320}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950"
            />
          </div>

          {/* Realtime Sensor Readout */}
          <div className="w-full mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Thể tích đo ($V$):</span>
              <span className="font-mono text-lg font-bold text-sky-400">{volumeMl} ml</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Áp suất đo ($p$):</span>
              <span className="font-mono text-lg font-bold text-emerald-400">{currentPressureBar} bar</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Tích $p \cdot V$:</span>
              <span className="font-mono text-lg font-bold text-amber-400">{currentPv}</span>
            </div>
          </div>
        </div>

        {/* Controls and Experimental Data Table */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-amber-400" />
                <span>Điều Khiển Pit-Tông & Nhiệt Độ</span>
              </span>
            </div>

            {/* Volume V Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Vị trí Pit-tông (Thể tích $V$):</span>
                <span className="font-mono text-sky-400 font-bold">{volumeMl} ml</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={volumeMl}
                onChange={(e) => setVolumeMl(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>20ml (Nén sâu)</span>
                <span>50ml</span>
                <span>80ml (Dãn nở)</span>
              </div>
            </div>

            {/* Temperature T Slider */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Nhiệt độ khí ($T$):</span>
                <span className="font-mono text-amber-400 font-bold">{temperatureK} K ({temperatureK - 273}°C)</span>
              </div>
              <input
                type="range"
                min="250"
                max="400"
                step="10"
                value={temperatureK}
                onChange={(e) => setTemperatureK(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            {/* Gas Species */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400">Loại khí nạp trong xilanh:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'nitrogen' as const, label: 'Khí N₂ (Nitơ)' },
                  { id: 'air' as const, label: 'Không Khí' },
                  { id: 'helium' as const, label: 'Khí He (Heli)' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGasType(g.id)}
                    className={`p-1.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                      gasType === g.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Experimental Records Table */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <FileSpreadsheet size={14} className="text-amber-400" />
                <span>Bảng Kiểm Chứng Định Luật Boyle</span>
              </span>
              <button
                onClick={handleClearData}
                className="text-[10px] text-zinc-500 hover:text-rose-400 underline cursor-pointer"
              >
                Xóa bảng
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto scrollbar-thin text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1">V (ml)</th>
                    <th className="py-1">p (bar)</th>
                    <th className="py-1">1/V (ml⁻¹)</th>
                    <th className="py-1">p · V (Hằng số)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {dataPoints.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40">
                      <td className="py-1 text-sky-400 font-bold">{row.volume}</td>
                      <td className="py-1 text-emerald-400">{row.pressure}</td>
                      <td className="py-1 text-purple-300 font-mono">{(1 / row.volume).toFixed(3)}</td>
                      <td className="py-1 text-amber-300 font-bold">{row.pv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-zinc-500 italic mt-1">
              Nhận xét SGK: Giá trị $p \cdot V$ xấp xỉ không đổi, chứng minh đồ thị $p(V)$ là đường hypebol và đồ thị $p(1/V)$ là đường thẳng đi qua gốc tọa độ.
            </p>
          </div>
        </div>
      </div>

      {/* First Principles Theoretical Note */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Bản Chất Vi Mô Của Áp Suất Khí (Thuyết Động Học Phân Tử)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Tại sao khi nén pit-tông áp suất lại tăng?</strong> Áp suất vĩ mô là tổng hợp lực va chạm của vô số phân tử khí lên 1 đơn vị diện tích thành xilanh: p = ⅓ · μ · m · v̄². Khi thể tích giảm một nửa, mật độ phân tử μ = N/V tăng gấp đôi, làm tần số va chạm vào thành xilanh tăng gấp đôi, do đó áp suất đo được tăng gấp đôi!
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Điều kiện áp dụng định luật Boyle:</strong> Lượng khí phải không đổi (hệ kín) và nhiệt độ phải giữ cố định (quá trình biến đổi đẳng nhiệt).
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Khí Lý Tưởng & Định Luật Boyle pV = const')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Định Luật Boyle</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
