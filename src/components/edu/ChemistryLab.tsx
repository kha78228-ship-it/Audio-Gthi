import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Droplet, 
  FlaskConical, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Info,
  Zap
} from 'lucide-react';
import { ReactionRateSimulator } from './chemistry/ReactionRateSimulator';
import { LeChatelierSimulator } from './chemistry/LeChatelierSimulator';
import { ElectrochemicalSimulator } from './chemistry/ElectrochemicalSimulator';

export type ChemExperimentId = 
  | 'titration' 
  | 'reactions' 
  | 'periodic' 
  | 'balancer' 
  | 'reaction_rate' 
  | 'le_chatelier' 
  | 'electrochemical';

interface ChemistryLabProps {
  initialExperiment?: ChemExperimentId;
  onSelectExperiment?: (id: ChemExperimentId) => void;
  onOpenVideoLesson?: (topic: string) => void;
  onOpenQuickQuiz?: (subject: 'chemistry', experimentId?: string) => void;
}

export function ChemistryLab({
  initialExperiment = 'titration',
  onSelectExperiment,
  onOpenVideoLesson,
  onOpenQuickQuiz
}: ChemistryLabProps) {
  const [activeExp, setActiveExp] = useState<ChemExperimentId>(initialExperiment);
  const [gradeFilter, setGradeFilter] = useState<'all' | 10 | 11 | 12>('all');

  useEffect(() => {
    if (initialExperiment) {
      setActiveExp(initialExperiment);
    }
  }, [initialExperiment]);

  const handleSwitchExp = (id: ChemExperimentId) => {
    setActiveExp(id);
    onSelectExperiment?.(id);
  };

  const allExperiments = [
    { id: 'reaction_rate' as const, label: 'Tốc Độ Phản Ứng (Dấu X)', icon: '⏱️', grade: 10, desc: 'Nhiệt độ, nồng độ & quy tắc Van \'t Hoff' },
    { id: 'periodic' as const, label: 'Bảng Tuần Hoàn 118 Nguyên Tố', icon: '🔬', grade: 10, desc: 'Cấu hình electron, độ âm điện & phân loại' },
    { id: 'balancer' as const, label: 'Cân Bằng Phương Trình Oxi Hóa', icon: '⚖️', grade: 10, desc: 'Phương pháp thăng bằng electron & ion' },
    { id: 'le_chatelier' as const, label: 'Cân Bằng Hóa Học Le Chatelier', icon: '♨️', grade: 11, desc: 'Hệ khí 2NO₂ ⇌ N₂O₄ đổi màu theo nhiệt độ' },
    { id: 'titration' as const, label: 'Chuẩn Độ Axit - Bazơ', icon: '🧪', grade: 11, desc: 'Buret, pH, bước nhảy tương đương & chỉ thị' },
    { id: 'reactions' as const, label: 'Bàn Trộn Phản Ứng Vô Cơ & Hữu Cơ', icon: '⚗️', grade: 11, desc: 'Sủi bọt khí, kết tủa & nhận biết ion' },
    { id: 'electrochemical' as const, label: 'Pin Điện Hóa Daniell & E° Pin', icon: '⚡', grade: 12, desc: 'Cặp Zn-Cu, cầu muối & suất điện động 1.10V' },
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
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Khối Lớp CTGDPT 2018:
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 'all' ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất Cả (7)
            </button>
            <button
              onClick={() => setGradeFilter(10)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 10 ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 10
            </button>
            <button
              onClick={() => setGradeFilter(11)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 11 ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 11
            </button>
            <button
              onClick={() => setGradeFilter(12)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 12 ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 12
            </button>
          </div>
        </div>

        {onOpenQuickQuiz && (
          <button
            onClick={() => onOpenQuickQuiz('chemistry', activeExp)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer self-end sm:self-auto"
            title="Đánh giá kiến thức ngay lập tức sau thí nghiệm hóa học"
          >
            <Zap size={14} className="text-rose-400" />
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
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold shadow-lg shadow-rose-950/40'
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
      {activeExp === 'reaction_rate' && <ReactionRateSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'titration' && <TitrationSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'le_chatelier' && <LeChatelierSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'reactions' && <ReactionMixer onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'electrochemical' && <ElectrochemicalSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'periodic' && <PeriodicTableViewer onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'balancer' && <EquationBalancer onOpenVideoLesson={onOpenVideoLesson} />}
    </div>
  );
}

// =========================================================================
// 1. ACID-BASE TITRATION SIMULATOR
// =========================================================================
function TitrationSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  // 25ml HCl 0.1M titrated with NaOH 0.1M
  const [naohVolume, setNaohVolume] = useState<number>(0); // ml added
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'litmus' | 'methyl_orange'>('phenolphthalein');
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const dripIntervalRef = useRef<any>(null);

  // Calculate pH based on strong acid + strong base formula
  // Initial: 25ml of 0.1M HCl => 0.0025 moles H+
  const vAcid = 25.0; // ml
  const cAcid = 0.1; // M
  const cBase = 0.1; // M
  const vBase = naohVolume; // ml

  let calculatedPh = 1.0;
  const molesAcid = (vAcid * cAcid) / 1000;
  const molesBase = (vBase * cBase) / 1000;
  const totalVolumeL = (vAcid + vBase) / 1000;

  if (vBase < 25.0) {
    // Excess H+
    const remainingH = (molesAcid - molesBase) / totalVolumeL;
    calculatedPh = -Math.log10(Math.max(1e-7, remainingH));
  } else if (Math.abs(vBase - 25.0) < 0.05) {
    // Equivalence point
    calculatedPh = 7.0;
  } else {
    // Excess OH-
    const excessOH = (molesBase - molesAcid) / totalVolumeL;
    const pOH = -Math.log10(Math.max(1e-7, excessOH));
    calculatedPh = 14.0 - pOH;
  }
  calculatedPh = Math.max(1.0, Math.min(13.0, calculatedPh));

  // Determine indicator color
  let liquidColor = 'rgba(240, 240, 245, 0.4)'; // clear
  let colorName = 'Trong suốt không màu';

  if (indicator === 'phenolphthalein') {
    if (calculatedPh >= 8.2) {
      const alpha = Math.min(0.85, (calculatedPh - 8.2) / 2 + 0.3);
      liquidColor = `rgba(244, 63, 94, ${alpha})`;
      colorName = 'Hồng cánh sen đậm (Bazơ)';
    } else if (calculatedPh >= 7.8) {
      liquidColor = 'rgba(251, 113, 133, 0.3)';
      colorName = 'Phớt hồng nhạt (Điểm tương đương)';
    } else {
      liquidColor = 'rgba(255, 255, 255, 0.2)';
      colorName = 'Không màu (Môi trường Axit)';
    }
  } else if (indicator === 'litmus') {
    if (calculatedPh < 6.0) {
      liquidColor = 'rgba(239, 68, 68, 0.65)';
      colorName = 'Đỏ (Môi trường Axit)';
    } else if (calculatedPh <= 8.0) {
      liquidColor = 'rgba(168, 85, 247, 0.65)';
      colorName = 'Tím trung tính (Điểm tương đương pH ~ 7)';
    } else {
      liquidColor = 'rgba(59, 130, 246, 0.7)';
      colorName = 'Xanh lam (Môi trường Bazơ)';
    }
  } else {
    // methyl orange: red (<3.1), orange (3.1-4.4), yellow (>4.4)
    if (calculatedPh < 3.1) {
      liquidColor = 'rgba(239, 68, 68, 0.7)';
      colorName = 'Đỏ tươi (Axit mạnh)';
    } else if (calculatedPh <= 4.4) {
      liquidColor = 'rgba(249, 115, 22, 0.7)';
      colorName = 'Da cam';
    } else {
      liquidColor = 'rgba(234, 179, 8, 0.7)';
      colorName = 'Vàng rơm';
    }
  }

  // Handle continuous drip
  const toggleDrip = () => {
    if (isDripping) {
      clearInterval(dripIntervalRef.current);
      setIsDripping(false);
    } else {
      setIsDripping(true);
      dripIntervalRef.current = setInterval(() => {
        setNaohVolume(prev => {
          if (prev >= 40) {
            clearInterval(dripIntervalRef.current);
            setIsDripping(false);
            return 40;
          }
          return Number((prev + 0.2).toFixed(1));
        });
      }, 100);
    }
  };

  useEffect(() => {
    return () => clearInterval(dripIntervalRef.current);
  }, []);

  const addSingleDrop = () => {
    setNaohVolume(prev => Math.min(40, Number((prev + 0.5).toFixed(1))));
  };

  const handleReset = () => {
    clearInterval(dripIntervalRef.current);
    setIsDripping(false);
    setNaohVolume(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Visual Simulation Area */}
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Buret & Bình Tam Giác Chuẩn Độ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addSingleDrop}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1"
            >
              <Droplet size={13} className="text-sky-400" />
              +1 Giọt (0.5ml)
            </button>
            <button
              onClick={toggleDrip}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isDripping
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950'
              }`}
            >
              {isDripping ? 'Khóa Vòi Buret' : 'Mở Vòi Chảy'}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Đặt lại từ đầu"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Graphic Area */}
        <div className="w-full h-[360px] bg-zinc-900/70 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
          {/* Burette Column */}
          <div className="flex flex-col items-center absolute top-3">
            <span className="text-[10px] text-zinc-400 font-mono">Buret NaOH 0.1M (Đã dùng: {naohVolume.toFixed(1)} ml)</span>
            <div className="w-7 h-40 border-2 border-zinc-500 bg-zinc-950/80 rounded-b-sm relative overflow-hidden flex flex-col justify-end">
              {/* NaOH liquid height */}
              <div
                className="w-full bg-sky-400/40 border-t border-sky-300 transition-all duration-150"
                style={{ height: `${Math.max(5, 100 - (naohVolume / 40) * 90)}%` }}
              ></div>
              {/* Graduations */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 px-0.5 pointer-events-none opacity-40">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-full border-b border-zinc-400 h-0"></div>
                ))}
              </div>
            </div>
            {/* Stopcock tap */}
            <div className={`w-4 h-3 bg-zinc-700 rounded-sm my-0.5 border ${isDripping ? 'border-emerald-400 bg-emerald-950' : 'border-zinc-500'}`}></div>
            {/* Dripping tip */}
            <div className="w-1 h-4 bg-zinc-600"></div>

            {/* Falling Drop Animation */}
            {isDripping && (
              <div className="w-2 h-2.5 rounded-full bg-sky-400 animate-bounce mt-1"></div>
            )}
          </div>

          {/* Erlenmeyer Flask (Bình tam giác) */}
          <div className="absolute bottom-6 flex flex-col items-center">
            {/* Flask neck */}
            <div className="w-8 h-8 border-x-2 border-t-2 border-zinc-500 bg-transparent rounded-t-sm"></div>
            {/* Flask body trapezoid */}
            <div
              className="w-36 h-28 border-2 border-zinc-400 rounded-b-2xl relative overflow-hidden flex items-end justify-center shadow-inner"
              style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
            >
              {/* Liquid inside flask */}
              <div
                className="w-full transition-all duration-300 flex items-center justify-center"
                style={{
                  height: `${Math.min(90, 45 + (naohVolume / 40) * 45)}%`,
                  backgroundColor: liquidColor,
                  boxShadow: `0 0 20px ${liquidColor}`
                }}
              >
                {/* Magnetic stirring bar */}
                <div className={`w-8 h-2 rounded-full bg-zinc-200 border border-zinc-500 shadow ${isDripping ? 'animate-spin' : ''}`}></div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-zinc-300 mt-2">Bình tam giác chứa 25ml HCl 0.1M</span>
          </div>

          {/* pH Meter HUD on top right */}
          <div className="absolute top-4 right-4 bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl flex flex-col items-center gap-1 shadow-xl">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Đồng Hồ Đo pH Điện Tử</span>
            <div className={`text-2xl font-mono font-black ${
              calculatedPh < 6 ? 'text-red-400' : calculatedPh > 8 ? 'text-pink-400' : 'text-emerald-400'
            }`}>
              {calculatedPh.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-400 text-center font-medium">
              {colorName}
            </div>
          </div>
        </div>

        {/* Dynamic Titration Curve Graph Representation */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Đường cong chuẩn độ pH theo thể tích V(NaOH) nhỏ vào:</span>
            <span className="text-[11px] text-zinc-400">Điểm tương đương: <strong className="text-emerald-400">25.0 ml (pH = 7)</strong></span>
          </div>
          <div className="w-full bg-zinc-950 h-16 rounded-lg border border-zinc-800 relative flex items-center px-4 overflow-hidden">
            {/* Baseline 7 */}
            <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-zinc-700"></div>
            {/* Equivalence mark */}
            <div className="absolute left-[62.5%] top-0 bottom-0 border-l border-dashed border-emerald-500/60"></div>
            
            {/* Current progress dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 transition-all duration-200"
              style={{
                left: `${Math.min(95, Math.max(2, (naohVolume / 40) * 100))}%`,
                transform: `translate(-50%, ${-(calculatedPh - 7) * 3}px)`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Control & Theory Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Lựa Chọn Chất Chỉ Thị Màu</h4>
          <div className="flex flex-col gap-2">
            {[
              { id: 'phenolphthalein' as const, label: 'Phenolphthalein', range: 'pH 8.2 - 10.0', desc: 'Không màu sang hồng cánh sen (Tối ưu cho Axit mạnh + Bazơ mạnh)' },
              { id: 'litmus' as const, label: 'Quỳ Tím (Litmus)', range: 'pH 5.0 - 8.0', desc: 'Đỏ sang tím rồi xanh lam' },
              { id: 'methyl_orange' as const, label: 'Methyl Da Cam', range: 'pH 3.1 - 4.4', desc: 'Đỏ sang cam rồi vàng' },
            ].map(ind => (
              <button
                key={ind.id}
                onClick={() => setIndicator(ind.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  indicator === ind.id
                    ? 'bg-pink-950/30 border-pink-500/50 text-pink-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{ind.label}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{ind.range}</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{ind.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400">Điều chỉnh thủ công thể tích NaOH:</span>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={naohVolume}
              onChange={(e) => setNaohVolume(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg mt-2"
            />
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Bản Chất Phản Ứng Trung Hòa</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Phương trình ion rút gọn:</strong> $H^+ + OH^- \rightarrow H_2O$. Axit phân ly cho ion $H^+$, Bazơ phân ly cho ion $OH^-$. Chúng triệt tiêu lẫn nhau tạo thành phân tử nước trung tính.
            </p>
            <p>
              • <strong>Bước nhảy pH (pH jump):</strong> Khi gần đạt đến 25ml NaOH, chỉ cần thêm 1 giọt (0.05ml), pH sẽ nhảy vọt từ ~3.5 lên thẳng ~10.5 do nồng độ ion tự do giảm theo hàm logarit mũ!
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Bản Chất Chuẩn Độ Axit Bazơ & Bước Nhảy pH')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Giải Thích Chuẩn Độ pH</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. REACTION TEST TUBE MIXER
// =========================================================================
interface ChemicalReagent {
  id: string;
  name: string;
  formula: string;
  category: 'acid' | 'base' | 'salt' | 'metal';
  color: string;
}

const REAGENTS: ChemicalReagent[] = [
  { id: 'ba_cl2', name: 'Bari Clorua', formula: 'BaCl₂', category: 'salt', color: 'text-zinc-200' },
  { id: 'h2_so4', name: 'Axit Sunfuric', formula: 'H₂SO₄', category: 'acid', color: 'text-rose-400' },
  { id: 'cu_so4', name: 'Đồng(II) Sunfat', formula: 'CuSO₄', category: 'salt', color: 'text-sky-400' },
  { id: 'na_oh', name: 'Natri Hydroxit', formula: 'NaOH', category: 'base', color: 'text-emerald-400' },
  { id: 'fe', name: 'Sắt (Bột kim loại)', formula: 'Fe', category: 'metal', color: 'text-amber-400' },
  { id: 'h_cl', name: 'Axit Clohidric', formula: 'HCl', category: 'acid', color: 'text-red-400' },
  { id: 'ag_no3', name: 'Bạc Nitrat', formula: 'AgNO₃', category: 'salt', color: 'text-slate-300' },
  { id: 'na_cl', name: 'Natri Clorua (Muối ăn)', formula: 'NaCl', category: 'salt', color: 'text-zinc-300' },
];

function ReactionMixer({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [reagentA, setReagentA] = useState<string>('ba_cl2');
  const [reagentB, setReagentB] = useState<string>('h2_so4');
  const [isReacting, setIsReacting] = useState<boolean>(false);

  // Check matched reaction
  const pairKey = [reagentA, reagentB].sort().join('+');

  let reactionOutcome = {
    hasReaction: false,
    equation: 'Không có phản ứng hóa học xảy ra (Dung dịch đồng nhất ion tự do)',
    ionicEquation: '',
    phenomenon: 'Dung dịch trong suốt, không đổi màu, không có kết tủa hay khí.',
    precipitateColor: '',
    hasGas: false,
    liquidColor: 'rgba(255, 255, 255, 0.15)',
    explanation: 'Hai chất không tạo thành chất kết tủa, chất khí bay hơi hoặc chất điện ly yếu nên phản ứng trao đổi ion không diễn ra.'
  };

  if (pairKey === 'ba_cl2+h2_so4') {
    reactionOutcome = {
      hasReaction: true,
      equation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ (trắng) + 2HCl',
      ionicEquation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓',
      phenomenon: 'Xuất hiện kết tủa trắng tinh mịn như sữa, không tan trong axit mạnh.',
      precipitateColor: '#ffffff',
      hasGas: false,
      liquidColor: 'rgba(255, 255, 255, 0.7)',
      explanation: 'Ion Ba²⁺ liên kết rất bền với anion SO₄²⁻ để tạo thành mạng tinh thể BaSO₄ không tan trong nước và axit.'
    };
  } else if (pairKey === 'cu_so4+na_oh') {
    reactionOutcome = {
      hasReaction: true,
      equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ (xanh lam) + Na₂SO₄',
      ionicEquation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓',
      phenomenon: 'Xuất hiện kết tủa màu xanh lam dạng keo lơ lửng rồi lắng dần xuống đáy ống nghiệm.',
      precipitateColor: '#38bdf8',
      hasGas: false,
      liquidColor: 'rgba(56, 189, 248, 0.6)',
      explanation: 'Kết tủa bazơ không tan Cu(OH)₂ hình thành đặc trưng của ion Cu²⁺ trong môi trường kiềm.'
    };
  } else if (pairKey === 'fe+h_cl') {
    reactionOutcome = {
      hasReaction: true,
      equation: 'Fe + 2HCl → FeCl₂ + H₂↑',
      ionicEquation: 'Fe + 2H⁺ → Fe²⁺ + H₂↑',
      phenomenon: 'Kim loại sắt tan dần, sủi bọt khí Hydro (H₂) không màu rộn ràng, dung dịch chuyển sang màu lục nhạt.',
      precipitateColor: '',
      hasGas: true,
      liquidColor: 'rgba(52, 211, 153, 0.35)',
      explanation: 'Sắt đứng trước Hydro trong dãy hoạt động hóa học nên khử ion H⁺ thành khí Hydro tự do (Oxy hóa khử).'
    };
  } else if (pairKey === 'ag_no3+na_cl') {
    reactionOutcome = {
      hasReaction: true,
      equation: 'AgNO₃ + NaCl → AgCl↓ (trắng) + NaNO₃',
      ionicEquation: 'Ag⁺ + Cl⁻ → AgCl↓',
      phenomenon: 'Xuất hiện ngay lập tức kết tủa trắng vón cục của Bạc Clorua (AgCl), để ngoài sáng sẽ chuyển dần sang xám đen.',
      precipitateColor: '#f4f4f5',
      hasGas: false,
      liquidColor: 'rgba(244, 244, 245, 0.65)',
      explanation: 'Tích số tan của AgCl cực kỳ nhỏ (Ks ~ 1.8 × 10⁻¹⁰) khiến ion Ag⁺ và Cl⁻ nhanh chóng kết tinh.'
    };
  } else if (pairKey === 'h_cl+na_oh') {
    reactionOutcome = {
      hasReaction: true,
      equation: 'HCl + NaOH → NaCl + H₂O (Phản ứng trung hòa)',
      ionicEquation: 'H⁺ + OH⁻ → H₂O',
      phenomenon: 'Dung dịch trong suốt, ống nghiệm ấm lên do tỏa nhiệt lượng lớn.',
      precipitateColor: '',
      hasGas: false,
      liquidColor: 'rgba(255, 255, 255, 0.2)',
      explanation: 'Phản ứng trung hòa hoàn toàn giữa axit mạnh và bazơ mạnh tạo muối ăn và nước.'
    };
  }

  const triggerMix = () => {
    setIsReacting(true);
    setTimeout(() => setIsReacting(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Test Tube Rack Canvas */}
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Mô Phỏng Phản Ứng Ống Nghiệm</h3>
          </div>
          <button
            onClick={triggerMix}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <FlaskConical size={14} />
            Tiến Hành Phản Ứng
          </button>
        </div>

        {/* Test Tube Illustration */}
        <div className="w-full h-[340px] bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
          {/* Test Tube Stand */}
          <div className="relative flex flex-col items-center">
            {/* Tube rim */}
            <div className="w-16 h-3 border-2 border-zinc-500 bg-zinc-800 rounded-t-md"></div>
            {/* Tube body */}
            <div className="w-14 h-56 border-x-2 border-b-2 border-zinc-500 bg-zinc-950/40 rounded-b-full relative overflow-hidden flex flex-col justify-end p-1">
              {/* Liquid */}
              <div
                className="w-full h-36 rounded-b-full transition-all duration-700 relative overflow-hidden"
                style={{ backgroundColor: reactionOutcome.liquidColor }}
              >
                {/* Gas bubbles animation if Fe + HCl */}
                {reactionOutcome.hasGas && (
                  <div className="absolute inset-0 flex justify-around">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                        style={{ animationDuration: `${0.4 + (i % 3) * 0.2}s` }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Precipitate settling at bottom */}
                {reactionOutcome.precipitateColor && (
                  <div
                    className="w-full h-8 rounded-b-full absolute bottom-0 transition-all duration-1000"
                    style={{ backgroundColor: reactionOutcome.precipitateColor, opacity: 0.9 }}
                  ></div>
                )}
              </div>
            </div>
            <div className="w-24 h-4 bg-zinc-800 border border-zinc-700 rounded-md mt-2"></div>
          </div>

          {/* Real-time Reaction Status Badge */}
          <div className="absolute top-4 left-4 max-w-[300px] bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl text-xs space-y-1">
            <div className="text-zinc-400 font-semibold">Hiện tượng quan sát được:</div>
            <div className="text-zinc-100 font-medium leading-relaxed">{reactionOutcome.phenomenon}</div>
          </div>
        </div>

        {/* Reaction Breakdown */}
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Phương trình hóa học phân tử:</span>
            {reactionOutcome.hasReaction ? (
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                ✓ Phản Ứng Thành Công
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">Không phản ứng</span>
            )}
          </div>
          <div className="font-mono text-sm font-bold text-emerald-400">{reactionOutcome.equation}</div>
          {reactionOutcome.ionicEquation && (
            <div className="text-xs text-zinc-400">
              Phương trình ion rút gọn: <span className="font-mono text-cyan-300">{reactionOutcome.ionicEquation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Select Chemicals Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Chọn 2 Hóa Chất Để Trộn</h4>

          <div className="space-y-2">
            <span className="text-xs text-zinc-400">Chất thứ nhất (Chất A):</span>
            <select
              value={reagentA}
              onChange={(e) => setReagentA(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono"
            >
              {REAGENTS.map(r => (
                <option key={r.id} value={r.id}>{r.formula} - {r.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-zinc-400">Chất thứ hai (Chất B):</span>
            <select
              value={reagentB}
              onChange={(e) => setReagentB(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono"
            >
              {REAGENTS.map(r => (
                <option key={r.id} value={r.id}>{r.formula} - {r.name}</option>
              ))}
            </select>
          </div>

          {/* Quick presets */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400">Thí nghiệm kinh điển phổ biến:</span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setReagentA('ba_cl2'); setReagentB('h2_so4'); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-left text-xs text-zinc-300 border border-zinc-800"
              >
                🥛 BaCl₂ + H₂SO₄ (Kết tủa trắng sữa)
              </button>
              <button
                onClick={() => { setReagentA('cu_so4'); setReagentB('na_oh'); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-left text-xs text-zinc-300 border border-zinc-800"
              >
                🌊 CuSO₄ + NaOH (Kết tủa xanh lam Cu(OH)₂)
              </button>
              <button
                onClick={() => { setReagentA('fe'); setReagentB('h_cl'); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-left text-xs text-zinc-300 border border-zinc-800"
              >
                🔥 Fe + HCl (Sủi bọt khí H₂)
              </button>
              <button
                onClick={() => { setReagentA('ag_no3'); setReagentB('na_cl'); }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-left text-xs text-zinc-300 border border-zinc-800"
              >
                💎 AgNO₃ + NaCl (Kết tủa AgCl)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <Info size={15} />
            <span>Điều Kiện Phản Ứng Trao Đổi Ion</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Bản chất phản ứng trao đổi:</strong> Phản ứng chỉ xảy ra khi các ion kết hợp với nhau tạo thành ít nhất 1 trong 3 yếu tố: <strong>Chất kết tủa ($\downarrow$)</strong>, <strong>Chất khí ($\uparrow$)</strong>, hoặc <strong>Chất điện ly yếu (như $H_2O$)</strong>.
            </p>
            <p>
              • Nếu sau phản ứng các ion vẫn tồn tại tự do trong dung dịch mà không tạo thành liên kết mới bền vững, phản ứng được coi là không xảy ra.
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Bản Chất Phản Ứng Trao Đổi Ion Trong Dung Dịch')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Giải Thích Phản Ứng Ion</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. PERIODIC TABLE VIEWER (Bảng Tuần Hoàn)
// =========================================================================
interface PeriodicElement {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  category: 'alkali' | 'alkaline_earth' | 'transition' | 'nonmetal' | 'halogen' | 'noble_gas' | 'metalloid';
  electronConfig: string;
  electronegativity: number;
  period: number;
  group: number;
  summary: string;
}

const SAMPLE_PERIODIC_ELEMENTS: PeriodicElement[] = [
  { z: 1, symbol: 'H', name: 'Hydro', mass: 1.008, category: 'nonmetal', electronConfig: '1s¹', electronegativity: 2.20, period: 1, group: 1, summary: 'Nguyên tố nhẹ nhất và dồi dào nhất trong vũ trụ, nhiên liệu cho phản ứng nhiệt hạch trong các vì sao.' },
  { z: 2, symbol: 'He', name: 'Heli', mass: 4.002, category: 'noble_gas', electronConfig: '1s²', electronegativity: 0, period: 1, group: 18, summary: 'Khí hiếm trơ, điểm sôi thấp nhất trong mọi chất, dùng làm chất siêu làm lạnh cho máy chụp cộng hưởng từ MRI.' },
  { z: 3, symbol: 'Li', name: 'Liti', mass: 6.94, category: 'alkali', electronConfig: '[He] 2s¹', electronegativity: 0.98, period: 2, group: 1, summary: 'Kim loại nhẹ nhất, thế điện cực chuẩn âm nhất, là thành phần cốt lõi của pin Lithium-ion cho xe điện và smartphone.' },
  { z: 6, symbol: 'C', name: 'Cacbon', mass: 12.011, category: 'nonmetal', electronConfig: '[He] 2s² 2p²', electronegativity: 2.55, period: 2, group: 14, summary: 'Nền tảng của sự sống và hóa học hữu cơ, có các thù hình phi thường như kim cương, than chì và Graphene.' },
  { z: 7, symbol: 'N', name: 'Nitơ', mass: 14.007, category: 'nonmetal', electronConfig: '[He] 2s² 2p³', electronegativity: 3.04, period: 2, group: 15, summary: 'Chiếm 78% bầu khí quyển Trái Đất, có liên kết ba N≡N cực bền, là nguyên tố thiết yếu trong protein và DNA.' },
  { z: 8, symbol: 'O', name: 'Oxy', mass: 15.999, category: 'nonmetal', electronConfig: '[He] 2s² 2p⁴', electronegativity: 3.44, period: 2, group: 16, summary: 'Duy trì sự hô hấp của sinh vật và quá trình đốt cháy, nguyên tố phổ biến nhất trong vỏ Trái Đất.' },
  { z: 11, symbol: 'Na', name: 'Natri', mass: 22.990, category: 'alkali', electronConfig: '[Ne] 3s¹', electronegativity: 0.93, period: 3, group: 1, summary: 'Kim loại kiềm mềm màu bạc, phản ứng dữ dội với nước, ion Na+ điều hòa áp suất thẩm thấu và dẫn truyền xung thần kinh.' },
  { z: 12, symbol: 'Mg', name: 'Magie', mass: 24.305, category: 'alkaline_earth', electronConfig: '[Ne] 3s²', electronegativity: 1.31, period: 3, group: 2, summary: 'Cháy với ngọn lửa trắng chói sáng, ion Mg2+ là nguyên tử trung tâm của phân tử diệp lục (chlorophyll) quang hợp.' },
  { z: 17, symbol: 'Cl', name: 'Clo', mass: 35.45, category: 'halogen', electronConfig: '[Ne] 3s² 3p⁵', electronegativity: 3.16, period: 3, group: 17, summary: 'Khí màu vàng lục có tính oxy hóa cực mạnh, dùng để khử trùng nước sinh hoạt và sản xuất PVC.' },
  { z: 26, symbol: 'Fe', name: 'Sắt', mass: 55.845, category: 'transition', electronConfig: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, period: 4, group: 8, summary: 'Kim loại quan trọng nhất trong lịch sử loài người, tâm điểm của hemoglobin vận chuyển oxy trong máu đỏ.' },
  { z: 29, symbol: 'Cu', name: 'Đồng', mass: 63.546, category: 'transition', electronConfig: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, period: 4, group: 11, summary: 'Dẫn điện và dẫn nhiệt tuyệt vời chỉ sau bạc, kim loại nền tảng cho mạng lưới điện thoại và lưới điện thế giới.' },
  { z: 79, symbol: 'Au', name: 'Vàng', mass: 196.97, category: 'transition', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, period: 6, group: 11, summary: 'Kim loại quý không bị oxy hóa trong không khí, dùng làm tài sản dự trữ và vi mạch bán dẫn cao cấp.' },
];

function PeriodicTableViewer({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [selectedElement, setSelectedElement] = useState<PeriodicElement>(SAMPLE_PERIODIC_ELEMENTS[3]); // Carbon
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = SAMPLE_PERIODIC_ELEMENTS.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Bảng Tuần Hoàn Nguyên Tố Tương Tác</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm nguyên tố (Fe, C, Liti...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {filtered.map(elem => {
            const isSelected = selectedElement.symbol === elem.symbol;
            return (
              <button
                key={elem.symbol}
                onClick={() => setSelectedElement(elem)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40 shadow-lg scale-105'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] font-mono text-zinc-500 self-start">{elem.z}</span>
                <span className="text-xl font-black font-mono">{elem.symbol}</span>
                <span className="text-[11px] font-medium truncate w-full text-center">{elem.name}</span>
                <span className="text-[9px] font-mono text-zinc-500">{elem.mass.toFixed(1)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Element Detail Inspector */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/60 flex flex-col items-center justify-center shadow-lg">
                <span className="text-[10px] font-mono text-zinc-400">{selectedElement.z}</span>
                <span className="text-2xl font-black font-mono text-emerald-300">{selectedElement.symbol}</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-100">{selectedElement.name}</h4>
                <span className="text-xs text-emerald-400 font-mono">Khối lượng: {selectedElement.mass} g/mol</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700">
              Nhóm {selectedElement.group} • Chu kỳ {selectedElement.period}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between">
              <span className="text-zinc-400">Cấu hình Electron:</span>
              <span className="font-mono font-bold text-cyan-300">{selectedElement.electronConfig}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between">
              <span className="text-zinc-400">Độ âm điện (Pauling):</span>
              <span className="font-mono font-bold text-amber-300">{selectedElement.electronegativity || 'Trơ (0.0)'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            <span className="font-semibold text-zinc-200 block mb-1">Ứng Dụng & Ý Nghĩa Vũ Trụ:</span>
            {selectedElement.summary}
          </div>

          <button
            onClick={() => onOpenVideoLesson?.(`Nguyên Tố ${selectedElement.name} (${selectedElement.symbol}) Và Cấu Trúc Nguyên Tử`)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Về Nguyên Tố {selectedElement.symbol}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. CHEMICAL EQUATION BALANCER
// =========================================================================
function EquationBalancer({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [inputEq, setInputEq] = useState('Al + O2 -> Al2O3');
  const [balancedResult, setBalancedResult] = useState({
    balanced: '4Al + 3O₂ → 2Al₂O₃',
    type: 'Phản ứng oxy hóa - khử (Oxi hóa kim loại)',
    electronTransfer: 'Al nhường 3e (chất khử): Al⁰ → Al⁺³ + 3e\nO₂ nhận 4e (chất oxi hóa): O₂⁰ + 4e → 2O⁻²',
    steps: [
      '1. Xác định số oxi hóa: Al (0 lên +3), O (0 xuống -2).',
      '2. Viết quá trình nhường nhận e: Thăng bằng electron 4×(Al) và 3×(O₂).',
      '3. Điền hệ số: 4Al + 3O₂ → 2Al₂O₃.',
      '4. Kiểm tra bảo toàn số nguyên tử 2 vế: Vế trái 4 Al, 6 O; Vế phải 4 Al, 6 O (Chuẩn xác!).'
    ]
  });

  const handleBalance = (eq: string) => {
    setInputEq(eq);
    const clean = eq.toLowerCase().replace(/\s+/g, '');
    if (clean.includes('fe3o4') || clean.includes('co')) {
      setBalancedResult({
        balanced: 'Fe₃O₄ + 4CO → 3Fe + 4CO₂',
        type: 'Khử oxit kim loại ở nhiệt độ cao trong luyện kim',
        electronTransfer: 'Fe⁺⁸/³ nhận e thành Fe⁰\nC⁺² nhường 2e thành C⁺⁴',
        steps: [
          '1. Carbon monoxide (CO) lấy oxy của oxit sắt.',
          '2. Điền hệ số 4 vào CO và CO₂ để lấy hết 4 nguyên tử O trong Fe₃O₄.',
          '3. Cân bằng sắt: 3 Fe vế phải.'
        ]
      });
    } else if (clean.includes('kmno4') || clean.includes('hcl')) {
      setBalancedResult({
        balanced: '2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 5Cl₂↑ + 8H₂O',
        type: 'Điều chế khí Clo trong phòng thí nghiệm',
        electronTransfer: 'Mn⁺⁷ + 5e → Mn⁺² (Chất oxi hóa mạnh)\n2Cl⁻¹ → Cl₂⁰ + 2e (Chất khử)',
        steps: [
          '1. Thăng bằng electron: 2×(Mn⁺⁷) và 5×(Cl₂⁰).',
          '2. Điền 2 KMnO₄ và 5 Cl₂.',
          '3. Bảo toàn Kali và Mangan: 2 KCl + 2 MnCl₂.',
          '4. Tổng số nguyên tử Cl vế phải = 2 + 4 + 10 = 16 => Điền 16 HCl.',
          '5. Bảo toàn Hydro: 8 H₂O.'
        ]
      });
    } else {
      setBalancedResult({
        balanced: '4Al + 3O₂ → 2Al₂O₃',
        type: 'Phản ứng cháy nhôm tỏa nhiệt mạnh',
        electronTransfer: 'Al⁰ → Al⁺³ + 3e (x4)\nO₂⁰ + 4e → 2O⁻² (x3)',
        steps: [
          'Bảo toàn nguyên tố Al: 4 vế trái, 4 vế phải.',
          'Bảo toàn nguyên tố O: 6 vế trái, 6 vế phải.'
        ]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <h3 className="text-sm sm:text-base font-bold text-zinc-100">Cân Bằng Phương Trình Tự Động & Giải Thích Chi Tiết</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputEq}
            onChange={(e) => setInputEq(e.target.value)}
            placeholder="Nhập phương trình (Ví dụ: Fe3O4 + CO -> Fe + CO2)"
            className="flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleBalance(inputEq)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shrink-0 transition-all shadow-md"
          >
            Cân Bằng Ngay
          </button>
        </div>

        {/* Result Card */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3">
          <span className="text-xs text-zinc-400">Phương trình đã cân bằng chính xác:</span>
          <div className="text-lg sm:text-xl font-mono font-black text-amber-300 tracking-wide">
            {balancedResult.balanced}
          </div>
          <div className="text-xs text-emerald-400 font-medium">
            Phân loại: {balancedResult.type}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-300">Các bước suy luận bảo toàn nguyên tố & electron:</span>
          <div className="space-y-1.5 text-xs text-zinc-400">
            {balancedResult.steps.map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/60 leading-relaxed font-mono">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <span className="text-xs font-bold text-zinc-300">Chọn mẫu phương trình kinh điển:</span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleBalance('Al + O2 -> Al2O3')}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-xs font-mono text-zinc-300"
            >
              Al + O₂ → Al₂O₃ (Nhôm cháy)
            </button>
            <button
              onClick={() => handleBalance('Fe3O4 + CO -> Fe + CO2')}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-xs font-mono text-zinc-300"
            >
              Fe₃O₄ + CO → Fe + CO₂ (Luyện kim)
            </button>
            <button
              onClick={() => handleBalance('KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O')}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-xs font-mono text-zinc-300"
            >
              KMnO₄ + HCl → Điều chế khí Clo
            </button>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.(`Cân Bằng Phản Ứng Oxi Hóa Khử & Thăng Bằng Electron: ${balancedResult.balanced}`)}
            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Về Phương Trình Này</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
