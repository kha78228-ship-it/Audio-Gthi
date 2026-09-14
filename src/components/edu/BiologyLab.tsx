import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  Dna, 
  Leaf, 
  Sparkles, 
  ArrowRight,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { PlasmolysisSimulator } from './biology/PlasmolysisSimulator';
import { TranspirationSimulator } from './biology/TranspirationSimulator';
import { HardyWeinbergSimulator } from './biology/HardyWeinbergSimulator';

export type BioExperimentId = 
  | 'microscope' 
  | 'genetics' 
  | 'photosynthesis' 
  | 'dna' 
  | 'plasmolysis' 
  | 'transpiration' 
  | 'hardy_weinberg';

interface BiologyLabProps {
  initialExperiment?: BioExperimentId;
  onSelectExperiment?: (id: BioExperimentId) => void;
  onOpenVideoLesson?: (topic: string) => void;
  onOpenQuickQuiz?: (subject: 'biology', experimentId?: string) => void;
}

export function BiologyLab({
  initialExperiment = 'microscope',
  onSelectExperiment,
  onOpenVideoLesson,
  onOpenQuickQuiz
}: BiologyLabProps) {
  const [activeExp, setActiveExp] = useState<BioExperimentId>(initialExperiment);
  const [gradeFilter, setGradeFilter] = useState<'all' | 10 | 11 | 12>('all');

  useEffect(() => {
    if (initialExperiment) {
      setActiveExp(initialExperiment);
    }
  }, [initialExperiment]);

  const handleSwitchExp = (id: BioExperimentId) => {
    setActiveExp(id);
    onSelectExperiment?.(id);
  };

  const allExperiments = [
    { id: 'plasmolysis' as const, label: 'Co & Phản Co Nguyên Sinh', icon: '💧', grade: 10, desc: 'Tế bào biểu bì củ hành, ưu trương & nhược trương' },
    { id: 'microscope' as const, label: 'Kính Hiển Vi Quang Học Ảo', icon: '🔬', grade: 10, desc: 'Soi mẫu tế bào hành, hồng cầu & vi khuẩn' },
    { id: 'transpiration' as const, label: 'Thoát Hơi Nước & Khí Khổng', icon: '🍃', grade: 11, desc: 'Giấy tẩm CoCl₂, mặt trên vs mặt dưới của lá' },
    { id: 'photosynthesis' as const, label: 'Mô Phỏng Quang Hợp & O₂', icon: '☀️', grade: 11, desc: 'Ánh sáng, nồng độ CO₂ & bọt khí O₂' },
    { id: 'genetics' as const, label: 'Di Truyền Học & Khung Punnett', icon: '🌱', grade: 12, desc: 'Lai giống Men-đen, kiểu gen & kiểu hình' },
    { id: 'dna' as const, label: 'Cấu Trúc Xoắn Kép & Nhân Đôi DNA', icon: '🧬', grade: 12, desc: 'Cặp bazơ nitơ A-T, G-C & Enzyme Helicase' },
    { id: 'hardy_weinberg' as const, label: 'Cân Bằng Hardy - Weinberg', icon: '📊', grade: 12, desc: 'Tần số p²AA + 2pqAa + q²aa = 1 qua các thế hệ' },
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
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Khối Lớp CTGDPT 2018:
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 'all' ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất Cả (7)
            </button>
            <button
              onClick={() => setGradeFilter(10)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 10 ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 10
            </button>
            <button
              onClick={() => setGradeFilter(11)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 11 ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 11
            </button>
            <button
              onClick={() => setGradeFilter(12)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                gradeFilter === 12 ? 'bg-teal-500/20 text-teal-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lớp 12
            </button>
          </div>
        </div>

        {onOpenQuickQuiz && (
          <button
            onClick={() => onOpenQuickQuiz('biology', activeExp)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer self-end sm:self-auto"
            title="Đánh giá kiến thức ngay lập tức sau thí nghiệm sinh học"
          >
            <Zap size={14} className="text-teal-400" />
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
                ? 'bg-teal-500/20 border-teal-500/60 text-teal-300 font-semibold shadow-lg shadow-teal-950/40'
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
      {activeExp === 'plasmolysis' && <PlasmolysisSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'microscope' && <MicroscopeSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'transpiration' && <TranspirationSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'photosynthesis' && <PhotosynthesisSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'genetics' && <GeneticsSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'dna' && <DnaSimulator onOpenVideoLesson={onOpenVideoLesson} />}
      {activeExp === 'hardy_weinberg' && <HardyWeinbergSimulator onOpenVideoLesson={onOpenVideoLesson} />}
    </div>
  );
}

// =========================================================================
// 1. VIRTUAL OPTICAL MICROSCOPE
// =========================================================================
interface MicroscopeSlide {
  id: string;
  name: string;
  type: string;
  optimalFocus: number;
  organelles: string[];
  description: string;
}

const SLIDES: MicroscopeSlide[] = [
  {
    id: 'onion',
    name: 'Tế Bào Biểu Bì Củ Hành Tím',
    type: 'Thực Vật',
    optimalFocus: 50,
    organelles: ['Thành tế bào (Cell wall)', 'Màng sinh chất', 'Nhân tế bào (Nucleus)', 'Không bào trung tâm (Vacuole)'],
    description: 'Các tế bào hình chữ nhật xếp sát nhau như bờ tường gạch. Dưới kính hiển vi quang học, vách tế bào cellulose dày và nhân tế bào bắt màu thuốc nhuộm rất rõ nét.'
  },
  {
    id: 'blood',
    name: 'Hồng Cầu Máu Người (Erythrocytes)',
    type: 'Động Vật',
    optimalFocus: 65,
    organelles: ['Hình đĩa lõm 2 mặt', 'Không có nhân (tối ưu thể tích)', 'Chứa huyết sắc tố Hemoglobin'],
    description: 'Các tế bào hồng cầu hình đĩa lõm hai mặt giúp tối đa hóa diện tích tiếp xúc với oxy và dễ dàng luồn lách qua các mao mạch siêu nhỏ khắp cơ thể.'
  },
  {
    id: 'stomata',
    name: 'Khí Khổng Lá Cây Thoát Hơi Nước',
    type: 'Thực Vật',
    optimalFocus: 45,
    organelles: ['2 tế bào hình hạt đậu', 'Lỗ khí (Stomatal pore)', 'Lục lạp chứa diệp lục'],
    description: 'Cặp tế bào hình hạt đậu có mép trong dày và mép ngoài mỏng. Khi no nước, tế bào cong lại làm lỗ khí mở to để thoát hơi nước và thu nhận khí CO₂ cho quang hợp.'
  },
  {
    id: 'bacteria',
    name: 'Vi Khuẩn Đường Ruột E. coli',
    type: 'Vi Sinh Vật',
    optimalFocus: 80,
    organelles: ['Trực khuẩn hình que', 'Vùng nhân Nucleoid (chưa có màng)', 'Thành Peptidoglycan'],
    description: 'Tế bào nhân sơ (Prokaryote) kích thước siêu nhỏ (~2 micromet), không có màng nhân bao bọc phân tử DNA vòng, sinh sản phân đôi thần tốc.'
  }
];

function MicroscopeSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentSlide, setCurrentSlide] = useState<MicroscopeSlide>(SLIDES[0]);
  const [magnification, setMagnification] = useState<number>(100); // 40x, 100x, 400x, 1000x
  const [focus, setFocus] = useState<number>(50); // 0 - 100

  // Calculate blur distance from optimal focus
  const blurAmount = Math.abs(focus - currentSlide.optimalFocus) / 10;
  const isInSharpFocus = blurAmount < 0.6;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 135;

    // Outer dark casing of eyepiece
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Circular field of view
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Background illumination inside lens
    ctx.fillStyle = currentSlide.id === 'onion' ? '#fdf2f8' : currentSlide.id === 'blood' ? '#fff1f2' : '#f0fdf4';
    ctx.fillRect(0, 0, width, height);

    // Apply visual blur based on focus
    ctx.filter = `blur(${blurAmount * 2.2}px)`;

    // Draw Slide Specimens
    if (currentSlide.id === 'onion') {
      // Brick-like plant cell walls
      const cellW = 55 * (magnification / 100);
      const cellH = 35 * (magnification / 100);

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;

      for (let y = centerY - 150; y <= centerY + 150; y += cellH) {
        for (let x = centerX - 160; x <= centerX + 160; x += cellW) {
          ctx.strokeRect(x, y, cellW, cellH);

          // Nucleus dot inside each cell
          ctx.fillStyle = '#9333ea';
          ctx.beginPath();
          ctx.arc(x + cellW * 0.6, y + cellH * 0.5, 4.5 * (magnification / 100), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (currentSlide.id === 'blood') {
      // Red blood cells disc shapes
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.5;

      const cellCount = Math.round(50 * (100 / magnification));
      for (let i = 0; i < cellCount; i++) {
        const seed = i * 47;
        const x = centerX + ((seed * 73) % 220) - 110;
        const y = centerY + ((seed * 91) % 220) - 110;
        const r = 8 * (magnification / 100);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Indented center
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
      }
    } else if (currentSlide.id === 'stomata') {
      // Stomata bean cells
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;

      // Draw two bean cells hugging
      ctx.beginPath();
      ctx.ellipse(centerX - 12, centerY, 28, 14, Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(centerX + 12, centerY, 28, 14, Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chloroplast dots inside beans
      ctx.fillStyle = '#14532d';
      for (let i = -18; i <= 18; i += 9) {
        ctx.beginPath();
        ctx.arc(centerX - 12, centerY + i, 2.5, 0, Math.PI * 2);
        ctx.arc(centerX + 12, centerY + i, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // E. coli rod bacteria
      ctx.fillStyle = '#06b6d4';
      for (let i = 0; i < 30; i++) {
        const seed = i * 29;
        const x = centerX + ((seed * 53) % 200) - 100;
        const y = centerY + ((seed * 67) % 200) - 100;
        const angle = (seed % 360) * (Math.PI / 180);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillRect(-10, -3, 20, 6);
        ctx.restore();
      }
    }

    ctx.restore();

    // Reticle crosshair
    ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Lens ring
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

  }, [currentSlide, magnification, focus, blurAmount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Thị Kính Kính Hiển Vi Quang Học</h3>
          </div>
          {isInSharpFocus ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={13} /> Nét Chuẩn Sắc Nét
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
              Chưa lấy nét (Xoay ốc vi cấp)
            </span>
          )}
        </div>

        {/* Circular Microscope Viewer Canvas */}
        <div className="w-full h-[360px] bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
          <canvas ref={canvasRef} width={420} height={360} className="w-full h-full object-contain" />

          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl text-xs flex flex-col gap-1 shadow-lg">
            <span className="text-[10px] text-zinc-400">Mẫu Tiêu Bản Đang Soi:</span>
            <span className="font-bold text-emerald-400">{currentSlide.name}</span>
            <span className="text-[11px] text-zinc-400">Độ phóng đại: <strong className="text-zinc-200">{magnification}x</strong></span>
          </div>
        </div>

        {/* Coarse & Fine Focus Adjustment */}
        <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-200">Ốc Vi Cấp & Sơ Cấp (Lấy Nét Tiêu Cự):</span>
            <span className="font-mono text-zinc-400">Vị trí tiêu cự: {focus}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={focus}
            onChange={(e) => setFocus(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-zinc-500">
            <span>Mờ (Gần)</span>
            <span className="text-emerald-400 font-bold">Điểm nét tối ưu: ~{currentSlide.optimalFocus}%</span>
            <span>Mờ (Xa)</span>
          </div>
        </div>
      </div>

      {/* Slide & Objective Selector */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Slide Selection */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Chọn Lam Kính Tiêu Bản</h4>
          <div className="flex flex-col gap-2">
            {SLIDES.map(slide => (
              <button
                key={slide.id}
                onClick={() => { setCurrentSlide(slide); setFocus(slide.optimalFocus); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentSlide.id === slide.id
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{slide.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{slide.type}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Magnification Changer */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <span className="text-xs text-zinc-400 font-semibold">Vật Kính (Độ Phóng Đại):</span>
            <div className="grid grid-cols-4 gap-2">
              {[40, 100, 400, 1000].map(mag => (
                <button
                  key={mag}
                  onClick={() => setMagnification(mag)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                    magnification === mag
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {mag}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organelle Inspector */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Info size={15} />
            <span>Đặc Điểm Cấu Trúc Bào Quan</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {currentSlide.description}
          </p>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-300">Các thành phần nhận diện:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentSlide.organelles.map((org, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                  {org}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.(`Cấu Trúc Tế Bào: ${currentSlide.name} Dưới Kính Hiển Vi`)}
            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Về Mẫu Vật Này</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MENDELIAN GENETICS & PUNNETT SQUARE
// =========================================================================
function GeneticsSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  // Parent 1 and Parent 2 alleles (A = Vàng trội, a = Xanh lặn)
  const [p1, setP1] = useState<'AA' | 'Aa' | 'aa'>('Aa');
  const [p2, setP2] = useState<'AA' | 'Aa' | 'aa'>('Aa');

  // Gametes
  const gametes1 = p1.split('');
  const gametes2 = p2.split('');

  // 2x2 Punnett square combinations
  const square = [
    [gametes1[0] + gametes2[0], gametes1[1] + gametes2[0]],
    [gametes1[0] + gametes2[1], gametes1[1] + gametes2[1]],
  ].map(row => row.map(gen => gen.split('').sort().join('')));

  // Counts
  let countAA = 0;
  let countAa = 0;
  let count_aa = 0;

  square.forEach(row => {
    row.forEach(gen => {
      if (gen === 'AA') countAA++;
      else if (gen === 'Aa' || gen === 'aA') countAa++;
      else count_aa++;
    });
  });

  const yellowPhenotype = countAA + countAa; // Dominant
  const greenPhenotype = count_aa; // Recessive

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Khung Punnett Lai Cặp Tính Trạng</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            P: {p1} × {p2}
          </span>
        </div>

        {/* 2x2 Punnett Square Grid */}
        <div className="w-full bg-zinc-900/80 rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center">
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Corner */}
            <div className="p-3 font-mono font-bold text-xs text-zinc-500 flex items-center justify-center">
              ♀ \ ♂
            </div>
            {/* Gametes P1 top */}
            <div className="p-3 bg-zinc-800 rounded-xl font-mono font-black text-amber-400 text-base border border-zinc-700">
              {gametes1[0]}
            </div>
            <div className="p-3 bg-zinc-800 rounded-xl font-mono font-black text-amber-400 text-base border border-zinc-700">
              {gametes1[1]}
            </div>

            {/* Row 1 */}
            <div className="p-3 bg-zinc-800 rounded-xl font-mono font-black text-emerald-400 text-base border border-zinc-700 flex items-center justify-center">
              {gametes2[0]}
            </div>
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 ${
              square[0][0] === 'aa' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-amber-950/40 border-amber-500/50'
            }`}>
              <span className="font-mono font-black text-lg">{square[0][0]}</span>
              <span className="text-[11px] font-medium">{square[0][0] === 'aa' ? 'Hạt Xanh (lặn)' : 'Hạt Vàng (trội)'}</span>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 ${
              square[0][1] === 'aa' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-amber-950/40 border-amber-500/50'
            }`}>
              <span className="font-mono font-black text-lg">{square[0][1]}</span>
              <span className="text-[11px] font-medium">{square[0][1] === 'aa' ? 'Hạt Xanh (lặn)' : 'Hạt Vàng (trội)'}</span>
            </div>

            {/* Row 2 */}
            <div className="p-3 bg-zinc-800 rounded-xl font-mono font-black text-emerald-400 text-base border border-zinc-700 flex items-center justify-center">
              {gametes2[1]}
            </div>
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 ${
              square[1][0] === 'aa' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-amber-950/40 border-amber-500/50'
            }`}>
              <span className="font-mono font-black text-lg">{square[1][0]}</span>
              <span className="text-[11px] font-medium">{square[1][0] === 'aa' ? 'Hạt Xanh (lặn)' : 'Hạt Vàng (trội)'}</span>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 ${
              square[1][1] === 'aa' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-amber-950/40 border-amber-500/50'
            }`}>
              <span className="font-mono font-black text-lg">{square[1][1]}</span>
              <span className="text-[11px] font-medium">{square[1][1] === 'aa' ? 'Hạt Xanh (lặn)' : 'Hạt Vàng (trội)'}</span>
            </div>
          </div>
        </div>

        {/* Statistical Ratios */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-xs text-zinc-400 font-semibold">Tỉ lệ Kiểu Gen ($F_1$):</span>
            <div className="font-mono text-sm font-bold text-amber-300">
              {countAA > 0 ? `${countAA} AA : ` : ''}{countAa > 0 ? `${countAa} Aa : ` : ''}{count_aa > 0 ? `${count_aa} aa` : ''}
            </div>
          </div>
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-xs text-zinc-400 font-semibold">Tỉ lệ Kiểu Hình ($F_1$):</span>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {yellowPhenotype} Vàng : {greenPhenotype} Xanh ({Math.round((yellowPhenotype / 4) * 100)}% : {Math.round((greenPhenotype / 4) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Parental Allele Controls */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Chọn Kiểu Gen Bố & Mẹ (P)</h4>

          <div className="space-y-2">
            <span className="text-xs text-zinc-400">Cây Mẹ ♀ (Parent 1):</span>
            <div className="grid grid-cols-3 gap-2">
              {(['AA', 'Aa', 'aa'] as const).map(allele => (
                <button
                  key={allele}
                  onClick={() => setP1(allele)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    p1 === allele
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {allele}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-zinc-400">Cây Bố ♂ (Parent 2):</span>
            <div className="grid grid-cols-3 gap-2">
              {(['AA', 'Aa', 'aa'] as const).map(allele => (
                <button
                  key={allele}
                  onClick={() => setP2(allele)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    p2 === allele
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {allele}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Định Luật Phân Ly Của Men-đen</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Bản chất phân ly:</strong> Trong quá trình giảm phân hình thành giao tử, mỗi alen trong cặp alen phân ly đồng đều về các giao tử (50% giao tử mang alen A, 50% mang alen a).
            </p>
            <p>
              • <strong>Tổ hợp ngẫu nhiên:</strong> Sự thụ tinh ngẫu nhiên giữa các giao tử đực và cái tái tổ hợp lại thành tỉ lệ kinh điển 3 trội : 1 lặn khi lai hai cơ thể dị hợp $Aa \times Aa$.
            </p>
          </div>

          <button
            onClick={() => onOpenVideoLesson?.('Quy Luật Di Truyền Men-đen & Khung Punnett')}
            className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Về Quy Luật Men-đen</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. PHOTOSYNTHESIS SIMULATOR
// =========================================================================
function PhotosynthesisSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [lightIntensity, setLightIntensity] = useState<number>(60); // %
  const [co2Level, setCo2Level] = useState<number>(400); // ppm
  const [temperature, setTemperature] = useState<number>(25); // Celsius

  // Oxygen bubble generation rate (bubbles per min)
  // Optimal around 25-30C, increases with light and CO2
  const tempFactor = Math.max(0.1, 1 - Math.abs(temperature - 28) / 25);
  const bubbleRate = Math.round((lightIntensity / 100) * (co2Level / 400) * tempFactor * 45);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Cây Rong Đuôi Chó Thủy Sinh Trong Bình Nước</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            Tốc độ thoát O₂: {bubbleRate} bọt/phút
          </span>
        </div>

        {/* Visual Water Beaker with Bubbles */}
        <div className="w-full h-[320px] bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden flex items-end justify-center pb-6">
          {/* Water color changes with light */}
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              backgroundColor: `rgba(6, 182, 212, ${0.1 + (lightIntensity / 100) * 0.15})`
            }}
          ></div>

          {/* Plant Stem */}
          <div className="relative flex flex-col items-center z-10">
            <div className="w-3 h-40 bg-emerald-600 rounded-full flex flex-col justify-around">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-3 bg-emerald-500 rounded-full ${i % 2 === 0 ? '-translate-x-4 rotate-12' : 'translate-x-4 -rotate-12'}`}
                ></div>
              ))}
            </div>

            {/* Rising Bubbles */}
            <div className="absolute top-0 flex flex-col items-center">
              {[...Array(Math.min(12, Math.round(bubbleRate / 4)))].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-white/80 animate-bounce mb-3 shadow"
                  style={{ animationDuration: `${0.8 + (i % 4) * 0.3}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-emerald-300 text-center">
          6CO₂ + 6H₂O + Quang Năng (Photon) → C₆H₁₂O₆ (Glucose) + 6O₂↑
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Thông Số Môi Trường</h4>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Cường độ ánh sáng:</span>
              <span className="font-mono text-amber-400 font-bold">{lightIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Nồng độ CO₂ hòa tan:</span>
              <span className="font-mono text-cyan-400 font-bold">{co2Level} ppm</span>
            </div>
            <input
              type="range"
              min="100"
              max="1200"
              step="50"
              value={co2Level}
              onChange={(e) => setCo2Level(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Nhiệt độ nước:</span>
              <span className="font-mono text-emerald-400 font-bold">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={() => onOpenVideoLesson?.('Cơ Chế Pha Sáng & Pha Tối Của Quá Trình Quang Hợp')}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <span>🎬 Tạo Video Giải Thích Quang Hợp</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 4. DNA STRUCTURE & REPLICATION
// =========================================================================
function DnaSimulator({ onOpenVideoLesson }: { onOpenVideoLesson?: (topic: string) => void }) {
  const [selectedBase, setSelectedBase] = useState<'A' | 'T' | 'G' | 'C'>('A');

  const basePairs = [
    { left: 'A', right: 'T', bonds: '== (2 liên kết Hydro)' },
    { left: 'G', right: 'C', bonds: '=== (3 liên kết Hydro)' },
    { left: 'T', right: 'A', bonds: '== (2 liên kết Hydro)' },
    { left: 'C', right: 'G', bonds: '=== (3 liên kết Hydro)' },
    { left: 'A', right: 'T', bonds: '== (2 liên kết Hydro)' },
    { left: 'G', right: 'C', bonds: '=== (3 liên kết Hydro)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100">Cặp Bazơ Bổ Sung Chuỗi Xoắn Kép DNA</h3>
          </div>
          <span className="text-xs text-zinc-400">Nguyên tắc: <strong className="text-emerald-400">A - T, G - C</strong></span>
        </div>

        {/* Visual Ladder DNA */}
        <div className="w-full bg-zinc-900/90 rounded-xl border border-zinc-800 p-6 flex flex-col gap-3 items-center">
          {basePairs.map((pair, idx) => (
            <div key={idx} className="w-[80%] flex items-center justify-between">
              {/* Left base */}
              <div className={`w-12 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base shadow ${
                pair.left === 'A' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' :
                pair.left === 'T' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                pair.left === 'G' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              }`}>
                {pair.left}
              </div>

              {/* Hydrogen Bonds */}
              <div className="flex-1 border-b-2 border-dashed border-zinc-600 mx-4 relative flex items-center justify-center">
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2">{pair.bonds}</span>
              </div>

              {/* Right base */}
              <div className={`w-12 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base shadow ${
                pair.right === 'A' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' :
                pair.right === 'T' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                pair.right === 'G' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              }`}>
                {pair.right}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h4 className="text-sm font-bold text-zinc-200">Nguyên Tắc Bổ Sung Watson-Crick</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mỗi bazơ nitơ kích thước lớn (Purine: A, G) luôn liên kết với một bazơ kích thước bé (Pyrimidine: T, C) bằng liên kết Hydro, đảm bảo khoảng cách giữa 2 mạch đường kính luôn cố định 2nm.
          </p>

          <button
            onClick={() => onOpenVideoLesson?.('Cơ Chế Tự Nhân Đôi Bán Bảo Toàn Của DNA')}
            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <span>🎬 Tạo Video Về Tự Nhân Đôi DNA</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
