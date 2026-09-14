import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  RotateCcw, 
  Play, 
  Sliders, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Users, 
  BarChart3, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface HardyWeinbergSimulatorProps {
  onOpenVideoLesson?: (topic: string) => void;
}

export function HardyWeinbergSimulator({ onOpenVideoLesson }: HardyWeinbergSimulatorProps) {
  // Allele frequency p(A), q = 1 - p
  const [pFreq, setPFreq] = useState<number>(0.6);
  const qFreq = Number((1 - pFreq).toFixed(2));

  // Evolutionary factors
  const [populationSize, setPopulationSize] = useState<'infinite' | 'small'>('infinite'); // Genetic drift
  const [selectionAgainstRecessive, setSelectionAgainstRecessive] = useState<number>(0); // 0 to 0.8
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Genotype frequencies history
  const [genHistory, setGenHistory] = useState<
    { gen: number; p: number; q: number; AA: number; Aa: number; aa: number }[]
  >([]);

  // Theoretical Hardy-Weinberg equilibrium frequencies
  const theoAA = Number((pFreq * pFreq).toFixed(3));
  const theoAa = Number((2 * pFreq * qFreq).toFixed(3));
  const theoaa = Number((qFreq * qFreq).toFixed(3));

  // Initialize history
  useEffect(() => {
    setGenHistory([
      {
        gen: 0,
        p: pFreq,
        q: qFreq,
        AA: theoAA,
        Aa: theoAa,
        aa: theoaa,
      }
    ]);
    setGenerationCount(0);
  }, [pFreq]);

  // Advance to next generation
  const advanceGeneration = () => {
    const current = genHistory[genHistory.length - 1] || { p: pFreq, q: qFreq };
    let curP = current.p;
    let curQ = current.q;

    // Apply natural selection if any: fitness of aa = 1 - s
    const wAA = 1.0;
    const wAa = 1.0;
    const waa = Math.max(0.05, 1.0 - selectionAgainstRecessive);

    const fAA = curP * curP * wAA;
    const fAa = 2 * curP * curQ * wAa;
    const faa = curQ * curQ * waa;
    const wAvg = fAA + fAa + faa;

    let nextAA = fAA / wAvg;
    let nextAa = fAa / wAvg;
    let nextaa = faa / wAvg;

    // New allele frequencies
    let nextP = nextAA + nextAa / 2;
    let nextQ = nextaa + nextAa / 2;

    // Apply genetic drift (random sampling fluctuation if population size is small)
    if (populationSize === 'small') {
      const drift = (Math.random() - 0.5) * 0.08;
      nextP = Math.max(0.02, Math.min(0.98, nextP + drift));
      nextQ = 1 - nextP;
      nextAA = nextP * nextP;
      nextAa = 2 * nextP * nextQ;
      nextaa = nextQ * nextQ;
    }

    const nextGen = generationCount + 1;
    setGenerationCount(nextGen);
    setGenHistory(prev => [
      ...prev,
      {
        gen: nextGen,
        p: Number(nextP.toFixed(3)),
        q: Number(nextQ.toFixed(3)),
        AA: Number(nextAA.toFixed(3)),
        Aa: Number(nextAa.toFixed(3)),
        aa: Number(nextaa.toFixed(3)),
      }
    ]);
  };

  const handleReset = () => {
    setGenerationCount(0);
    setGenHistory([
      {
        gen: 0,
        p: pFreq,
        q: qFreq,
        AA: theoAA,
        Aa: theoAa,
        aa: theoaa,
      }
    ]);
  };

  const currentStatus = genHistory[genHistory.length - 1] ?? {
    p: pFreq,
    q: qFreq,
    AA: theoAA,
    Aa: theoAa,
    aa: theoaa,
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* CTGDPT 2018 Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-teal-950/20 to-zinc-900/60 border border-blue-500/30">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono font-bold text-sm">
            SINH HỌC 12
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Di Truyền Học Quần Thể & Trạng Thái Cân Bằng Hardy - Weinberg
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                CTGDPT 2018 Sách Mới • Định Luật Cân Bằng Di Truyền
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Công thức: $p^2 AA + 2pq Aa + q^2 aa = 1$ với $p(A) + q(a) = 1$. Khảo sát sự ổn định qua các thế hệ ngẫu phối.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={advanceGeneration}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            <span>Sinh Sản Thế Hệ Kế Tiếp (F{generationCount + 1})</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
            title="Đặt lại thế hệ ban đầu P"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Genotype Bar Distribution */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <BarChart3 size={14} className="text-blue-400" />
              <span>Cấu Trúc Di Truyền Quần Thể Ở Thế Hệ F{generationCount}</span>
            </span>
            <span className="font-mono text-[11px] text-blue-400">
              Alen p(A): {currentStatus.p.toFixed(3)} | q(a): {currentStatus.q.toFixed(3)}
            </span>
          </div>

          {/* Graphical Proportions Bar */}
          <div className="w-full flex flex-col gap-3 py-3">
            <div className="w-full h-10 rounded-xl overflow-hidden flex border border-zinc-700 shadow-inner">
              <div 
                style={{ width: `${currentStatus.AA * 100}%` }} 
                className="bg-blue-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                title={`AA: ${(currentStatus.AA * 100).toFixed(1)}%`}
              >
                {currentStatus.AA > 0.12 && `AA: ${(currentStatus.AA * 100).toFixed(1)}%`}
              </div>
              <div 
                style={{ width: `${currentStatus.Aa * 100}%` }} 
                className="bg-teal-500 flex items-center justify-center text-xs font-bold text-zinc-950 transition-all duration-500"
                title={`Aa: ${(currentStatus.Aa * 100).toFixed(1)}%`}
              >
                {currentStatus.Aa > 0.12 && `Aa: ${(currentStatus.Aa * 100).toFixed(1)}%`}
              </div>
              <div 
                style={{ width: `${currentStatus.aa * 100}%` }} 
                className="bg-amber-500 flex items-center justify-center text-xs font-bold text-zinc-950 transition-all duration-500"
                title={`aa: ${(currentStatus.aa * 100).toFixed(1)}%`}
              >
                {currentStatus.aa > 0.12 && `aa: ${(currentStatus.aa * 100).toFixed(1)}%`}
              </div>
            </div>

            {/* Genotype Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/40">
                <span className="text-blue-400 font-bold block">Kiểu gen đồng hợp trội AA</span>
                <span className="text-lg font-mono font-bold text-white mt-1 block">
                  {(currentStatus.AA * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">$p^2 = {theoAA}$</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/40">
                <span className="text-teal-400 font-bold block">Kiểu gen dị hợp Aa</span>
                <span className="text-lg font-mono font-bold text-white mt-1 block">
                  {(currentStatus.Aa * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">$2pq = {theoAa}$</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40">
                <span className="text-amber-400 font-bold block">Kiểu gen đồng hợp lặn aa</span>
                <span className="text-lg font-mono font-bold text-white mt-1 block">
                  {(currentStatus.aa * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">$q^2 = {theoaa}$</span>
              </div>
            </div>
          </div>

          {/* Historical Generations List */}
          <div className="w-full mt-2 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-semibold mb-2 block">
              Biến động cấu trúc di truyền qua các thế hệ ({genHistory.length} thế hệ):
            </span>
            <div className="max-h-32 overflow-y-auto scrollbar-thin text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1">Thế hệ</th>
                    <th className="py-1">Alen p(A)</th>
                    <th className="py-1">Alen q(a)</th>
                    <th className="py-1">AA (%)</th>
                    <th className="py-1">Aa (%)</th>
                    <th className="py-1">aa (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {genHistory.slice(-6).map((g, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40">
                      <td className="py-1 text-blue-400 font-bold">F{g.gen}</td>
                      <td className="py-1">{g.p}</td>
                      <td className="py-1 text-amber-400">{g.q}</td>
                      <td className="py-1">{(g.AA * 100).toFixed(1)}%</td>
                      <td className="py-1">{(g.Aa * 100).toFixed(1)}%</td>
                      <td className="py-1 text-rose-400 font-bold">{(g.aa * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-zinc-200 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-400" />
                <span>Tham Số Quần Thể Ban Đầu (P)</span>
              </span>
            </div>

            {/* Tần số alen ban đầu p(A) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Tần số alen trội $p(A)$:</span>
                <span className="font-mono text-blue-400 font-bold">{pFreq}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={pFreq}
                onChange={(e) => setPFreq(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>p = 0.1</span>
                <span>Tần số alen lặn q(a) = {qFreq}</span>
                <span>p = 0.9</span>
              </div>
            </div>

            {/* Kích thước quần thể (Genetic Drift) */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                <Users size={14} className="text-teal-400" />
                <span>Kích thước quần thể (Phiêu bạt di truyền):</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPopulationSize('infinite')}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    populationSize === 'infinite'
                      ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Rất Lớn (Vô Hạn • Ổn Định)
                </button>
                <button
                  onClick={() => setPopulationSize('small')}
                  className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    populationSize === 'small'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Nhỏ (Biến Động Di Truyền)
                </button>
              </div>
            </div>

            {/* Áp lực chọn lọc tự nhiên */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Chọn lọc đào thải kiểu hình lặn ($aa$):</span>
                <span className="font-mono text-rose-400 font-bold">{(selectionAgainstRecessive * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={selectionAgainstRecessive}
                onChange={(e) => setSelectionAgainstRecessive(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <span className="text-[10px] text-zinc-500 block">
                Hệ số chọn lọc $s$: Khả năng sống sót của kiểu hình aa là $1 - s$.
              </span>
            </div>
          </div>

          {/* Conditions for HW Equilibrium */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-xs">
            <span className="font-bold text-zinc-200">5 Điều Kiện Nghiệm Đúng Của Hardy - Weinberg:</span>
            <div className="space-y-1 text-zinc-400 leading-relaxed text-[11px]">
              <div>1. Quần thể phải có kích thước lớn.</div>
              <div>2. Các cá thể giao phối hoàn toàn ngẫu nhiên (ngẫu phối).</div>
              <div>3. Không có đột biến mới xảy ra ($A \leftrightarrow a$).</div>
              <div>4. Không có sự di - nhập gen (quần thể cách ly).</div>
              <div>5. Các cá thể có sức sống và khả năng sinh sản như nhau (không có chọn lọc tự nhiên).</div>
            </div>
          </div>
        </div>
      </div>

      {/* First Principles Insight Callout */}
      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Ý Nghĩa Sinh Học & Tiến Hóa Của Hardy - Weinberg (First Principles)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            • <strong>Quần thể không tiến hóa nếu đạt trạng thái cân bằng:</strong> Khi đáp ứng đủ 5 điều kiện, tần số alen và thành phần kiểu gen sẽ được duy trì không đổi từ thế hệ này sang thế hệ khác. Do đó, tiến hóa thực chất chính là sự phá vỡ trạng thái cân bằng di truyền của quần thể dưới tác động của các nhân tố tiến hóa (Chọn lọc tự nhiên, Đột biến, Di nhập gen, Phiêu bạt di truyền).
          </p>
        </div>

        {onOpenVideoLesson && (
          <button
            onClick={() => onOpenVideoLesson('Định Luật Di Truyền Hardy - Weinberg')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Tạo Video Bài Giảng Hardy - Weinberg</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
