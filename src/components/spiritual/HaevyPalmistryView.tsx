import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Share2, 
  BookOpen, 
  RefreshCw, 
  Check, 
  HelpCircle, 
  Flame, 
  Heart, 
  BrainCircuit, 
  Compass, 
  Sun, 
  Eye, 
  Volume2, 
  VolumeX,
  Copy,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { PalmHandSide, PalmLineFeature, PalmAnalysisResult, SpiritualShareAttachment } from '../../types';
import { HAND_SHAPE_ELEMENTS, PALM_LINE_FEATURES, SPECIAL_PALM_SIGNS } from '../../data/palmistryAndDivinationData';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { HaevyPalmCameraScannerModal } from './HaevyPalmCameraScannerModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { spiritualTextReader } from '../../utils/spiritualTextReader';
import { haptics } from '../../utils/haptics';

interface HaevyPalmistryViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

type PalmistrySubView = 'camera_scan' | 'manual_picker' | 'handbook' | 'reading_result';

export function HaevyPalmistryView({ onEarnCoins, onNavigateToMode }: HaevyPalmistryViewProps) {
  const [activeSubView, setActiveSubView] = useState<PalmistrySubView>('camera_scan');
  const [handSide, setHandSide] = useState<PalmHandSide>('right');
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0);
  const [activeLineTab, setActiveLineTab] = useState<string>('life_line');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({
    life_line: 0,
    head_line: 0,
    heart_line: 0,
    fate_line: 0,
    sun_line: 0
  });
  const [activeSpecialMarks, setActiveSpecialMarks] = useState<string[]>(['letter_m']);
  const [userQuestion, setUserQuestion] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PalmAnalysisResult | null>(null);
  const [aiReadingMarkdown, setAiReadingMarkdown] = useState<string | null>(null);
  const [isQuickSpeaking, setIsQuickSpeaking] = useState(false);
  
  // Modals & UI states
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentShape = HAND_SHAPE_ELEMENTS[selectedShapeIndex] || HAND_SHAPE_ELEMENTS[0];

  const handleOptionChange = (lineId: string, optionIndex: number) => {
    haptics.selection();
    setSelectedOptions(prev => ({ ...prev, [lineId]: optionIndex }));
  };

  const toggleSpecialMark = (markId: string) => {
    haptics.impact('light');
    setActiveSpecialMarks(prev => 
      prev.includes(markId) ? prev.filter(id => id !== markId) : [...prev, markId]
    );
  };

  // Handle live camera scan completion
  const handleCameraScanComplete = (result: PalmAnalysisResult, readingMarkdown: string) => {
    setAnalysisResult(result);
    setAiReadingMarkdown(readingMarkdown);
    setActiveSubView('reading_result');
    
    // Auto-select matched shape index if found
    const matchedShapeIdx = HAND_SHAPE_ELEMENTS.findIndex(e => e.element === result.handShapeElement);
    if (matchedShapeIdx >= 0) {
      setSelectedShapeIndex(matchedShapeIdx);
    }

    if (onEarnCoins) {
      onEarnCoins(50, 'Quét camera xem chỉ tay AI thực tế (+50 Xu)');
    }
    showToast('Đã phân tích bàn tay thành công qua Camera AI!');
  };

  // Quick speak directly with Vietnamese TTS
  const handleToggleQuickSpeak = () => {
    if (!aiReadingMarkdown) return;
    haptics.impact('medium');

    if (isQuickSpeaking) {
      spiritualTextReader.stop();
      setIsQuickSpeaking(false);
    } else {
      spiritualTextReader.parseText(aiReadingMarkdown);
      spiritualTextReader.start(0);
      setIsQuickSpeaking(true);

      const unsub = spiritualTextReader.onStateChange((playing) => {
        if (!playing) {
          setIsQuickSpeaking(false);
          unsub();
        }
      });
    }
  };

  // Simulate AI Hand Camera Scan
  const handleStartScanSimulator = () => {
    haptics.impact('medium');
    setIsScanning(true);
    setScanProgress(0);
    spiritualAudio.playCrystalResonance();

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          haptics.success();
          spiritualAudio.playTempleBell();
          showToast('Quét bàn tay thành công! Đang tổng hợp bản luận giải...');
          handleGenerateReading();
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate In-Depth Palmistry AI Reading
  const handleGenerateReading = async () => {
    haptics.impact('heavy');
    setIsAiAnalyzing(true);
    setAiReadingMarkdown(null);
    spiritualAudio.playSingingBowl(216);

    const lifeLineOpt = PALM_LINE_FEATURES.find(f => f.id === 'life_line')?.options[selectedOptions.life_line]?.label;
    const headLineOpt = PALM_LINE_FEATURES.find(f => f.id === 'head_line')?.options[selectedOptions.head_line]?.label;
    const heartLineOpt = PALM_LINE_FEATURES.find(f => f.id === 'heart_line')?.options[selectedOptions.heart_line]?.label;
    const fateLineOpt = PALM_LINE_FEATURES.find(f => f.id === 'fate_line')?.options[selectedOptions.fate_line]?.label;
    const sunLineOpt = PALM_LINE_FEATURES.find(f => f.id === 'sun_line')?.options[selectedOptions.sun_line]?.label;

    const specialMarkNames = SPECIAL_PALM_SIGNS
      .filter(s => activeSpecialMarks.includes(s.id))
      .map(s => s.name);

    // Calculate heuristic scores
    const vitalityScore = PALM_LINE_FEATURES.find(f => f.id === 'life_line')?.options[selectedOptions.life_line]?.score || 90;
    const wisdomScore = PALM_LINE_FEATURES.find(f => f.id === 'head_line')?.options[selectedOptions.head_line]?.score || 90;
    const emotionScore = PALM_LINE_FEATURES.find(f => f.id === 'heart_line')?.options[selectedOptions.heart_line]?.score || 88;
    const destinyScore = PALM_LINE_FEATURES.find(f => f.id === 'fate_line')?.options[selectedOptions.fate_line]?.score || 92;
    const intuitionScore = specialMarkNames.length > 0 ? 95 : 85;

    const simulatedResult: PalmAnalysisResult = {
      handShapeElement: currentShape.element,
      handSide,
      scores: {
        vitality: vitalityScore,
        wisdom: wisdomScore,
        emotion: emotionScore,
        destiny: destinyScore,
        intuition: intuitionScore
      },
      keyInsights: [
        {
          title: 'Sự Nghiệp & Công Danh',
          verdict: `Đường Định Mệnh & Thái Dương: ${fateLineOpt || 'Sáng rõ tụ tài'}. Vận trình công danh rộng mở.`,
          advice: 'Tận dụng các cơ hội hợp tác và trau dồi chuyên môn để bứt phá.'
        },
        {
          title: 'Tình Duyên & Cảm Xúc',
          verdict: `Đường Tâm Đạo: ${heartLineOpt || 'Uốn cong về gò Mộc Tinh'}. Tình cảm chân thành, thủy chung.`,
          advice: 'Luôn lắng nghe và thấu hiểu đối phương để gắn kết bền lâu.'
        },
        {
          title: 'Sinh Lực & Trí Tuệ',
          verdict: `Sinh Đạo: ${lifeLineOpt || 'Sâu đậm rõ ràng'}, Trí Đạo: ${headLineOpt || 'Thẳng dài sắc nét'}.`,
          advice: 'Duy trì lối sống cân bằng, giữ tâm an định để sinh lực dồi dào.'
        }
      ],
      specialSignsDetected: specialMarkNames,
      overallVerdict: `Tướng tay đắc cách thuộc ngũ hành ${currentShape.element}, mang vận khí quý nhân phù trợ và tài lộc thịnh vượng.`,
      createdAt: new Date().toISOString()
    };

    setAnalysisResult(simulatedResult);

    try {
      const resp = await fetch('/api/spiritual/palmistry-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handSide,
          handShapeElement: currentShape.element,
          lifeLine: lifeLineOpt,
          headLine: headLineOpt,
          heartLine: heartLineOpt,
          fateLine: fateLineOpt,
          sunLine: sunLineOpt,
          specialMarks: specialMarkNames,
          userQuestion: userQuestion.trim()
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.reading) {
          setAiReadingMarkdown(data.reading);
          setIsAiAnalyzing(false);
          setActiveSubView('reading_result');
          if (onEarnCoins) {
            onEarnCoins(50, 'Xem chỉ tay chiêm bái tướng bàn tay AI (+50 Xu)');
          }
          return;
        }
      }
    } catch {
      // Fallback
    }

    // High quality client fallback in pure Vietnamese
    const fallbackText = `### ✋ Luận Giải Tướng Bàn Tay AI: ${currentShape.element} (${handSide === 'left' ? 'Tay Trái - Bẩm Sinh' : 'Tay Phải - Hậu Vận'})

#### 🌟 1. Tổng Quan Tướng Khí & Bản Mệnh:
Lòng bàn tay thuộc hành **${currentShape.element}**, da dẻ hồng nhuận, các gò bàn tay (Mộc Tinh, Thái Dương, Kim Tinh) nổi rõ biểu thị cốt cách vững vàng, giàu ý chí vươn lên. Bạn sở hữu phong thái điềm đạm, suy nghĩ thấu đáo và luôn là chỗ dựa vững chắc cho người xung quanh.

#### 💼 2. Công Danh, Sự Nghiệp & Tài Lộc:
- **Đường Định Mệnh & Thái Dương**: Vận trình sự nghiệp có lộ trình bứt phá mạnh mẽ. Khoảng thời gian từ 28-35 tuổi là giai đoạn vàng để tạo dựng tên tuổi và tích lũy tài sản.
- **Tài lộc**: Dòng tiền hanh thông, thích hợp với các lĩnh vực sáng tạo, quản lý chiến lược và đầu tư có tầm nhìn.

#### 💖 3. Tình Duyên & Cảm Xúc:
- **Đường Tâm Đạo**: Tình cảm sâu đậm, giàu đức hy sinh và chung thủy. Bạn luôn hướng về một gia đình êm ấm, nơi cả hai cùng thấu hiểu và tôn trọng lý tưởng của nhau.

#### 🧠 4. Trí Tuệ & Tư Duy Sáng Tạo:
- **Đường Trí Đạo**: Khả năng phân tích sắc sảo, học hỏi nhanh chóng và ứng biến linh hoạt trước mọi biến động thời cuộc.

#### ✨ 5. Dấu Ấn Quý Tướng & Lời Khuyên Khai Vận:
${specialMarkNames.length > 0 ? `Bàn tay hội tụ các ấn tướng hiếm: **${specialMarkNames.join(', ')}**, gia tăng trực giác tâm linh và mang lại sự che chở vô hình trong những thời khắc quan trọng.` : 'Các đường vân chính phụ nâng đỡ nhau tạo thế bàn tay chứa ngọc gom tài.'}
- **Lời khuyên**: Hãy kiên trì với đam mê, giữ tâm trong sáng và thường xuyên giúp đỡ người khác để phước báu ngày càng dồi dào.`;

    setAiReadingMarkdown(fallbackText);
    setIsAiAnalyzing(false);
    setActiveSubView('reading_result');
    if (onEarnCoins) {
      onEarnCoins(50, 'Xem chỉ tay chiêm bái tướng bàn tay AI (+50 Xu)');
    }
  };

  const handleShareResult = () => {
    haptics.impact('light');
    setShareAttachment({
      type: 'palmistry',
      title: `✋ Tướng Bàn Tay AI: ${currentShape.element}`,
      subtitle: `${handSide === 'left' ? 'Tay Trái' : 'Tay Phải'} • Điểm Sinh Khí: ${analysisResult?.scores.vitality || 92}%`,
      questionOrTheme: userQuestion || 'Xem tướng chỉ tay khai vận tài lộc & tình duyên',
      aiVerdictExcerpt: analysisResult?.overallVerdict || 'Bàn tay đắc cách quý tướng, công danh hanh thông.',
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  const handleCopyReading = () => {
    if (!aiReadingMarkdown) return;
    navigator.clipboard.writeText(aiReadingMarkdown);
    haptics.impact('light');
    showToast('Đã sao chép toàn bộ bài luận giải chỉ tay!');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-zinc-950/90 border border-amber-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/50 shrink-0">
              <span className="text-2xl sm:text-3xl">✋</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-400/40">
                  Nhân Tướng Học & AI Vision
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Bàn Tay Tướng Pháp Đông Tây</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                Xem Chỉ Tay & Luận Tướng Bàn Tay AI
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5 max-w-2xl">
                Soi 5 đại đường chỉ tay (Sinh - Trí - Tâm - Định Mệnh - Thái Dương) & nhận diện ấn ký chữ M, chữ X khai mở tài vận.
              </p>
            </div>
          </div>

          {/* Quick Stats or Actions */}
          {aiReadingMarkdown && (
            <button
              onClick={() => setActiveSubView('reading_result')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span>Xem Lại Kết Quả Vừa Xem</span>
            </button>
          )}
        </div>

        {/* Clear Sub-Page Navigation Tabs */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              haptics.impact('light');
              setActiveSubView('camera_scan');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeSubView === 'camera_scan'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>1. Soi Camera Trực Tiếp (Nhanh Nhất)</span>
          </button>

          <button
            onClick={() => {
              haptics.impact('light');
              setActiveSubView('manual_picker');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeSubView === 'manual_picker'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Tự Chọn Đường Chỉ Tay Thủ Công</span>
          </button>

          <button
            onClick={() => {
              haptics.impact('light');
              setActiveSubView('handbook');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeSubView === 'handbook'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Cẩm Nang Tra Cứu Tướng Tay</span>
          </button>

          {aiReadingMarkdown && (
            <button
              onClick={() => {
                haptics.impact('light');
                setActiveSubView('reading_result');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeSubView === 'reading_result'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                  : 'bg-zinc-900/80 text-purple-300 hover:text-white border border-purple-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>4. Kết Quả Luận Giải</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: CAMERA SCANNER (CHÍNH - KHÔNG CẦN KÉO XUỐNG) */}
      {/* ========================================================================= */}
      {activeSubView === 'camera_scan' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-zinc-950/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                Nhận Diện Thị Giác Trực Tiếp Bằng AI
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Mở Camera Soi Bàn Tay Để Xem Chỉ Tay Ngay Lập Tức
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Hệ thống sử dụng trí tuệ nhân tạo nhận diện quang học hình dạng ngũ hành của bàn tay, đo độ sâu của 5 đại đường chỉ tay và các ấn ký quý nhân phù trợ trong 3 giây.
              </p>
            </div>

            {/* Hand Side Selector & Question in Camera Mode */}
            <div className="max-w-xl mx-auto bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">Chọn bàn tay muốn soi:</span>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => {
                      haptics.impact('light');
                      setHandSide('left');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handSide === 'left' 
                        ? 'bg-amber-400 text-zinc-950 font-black shadow-md' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tay Trái (Bẩm Sinh)
                  </button>
                  <button
                    onClick={() => {
                      haptics.impact('light');
                      setHandSide('right');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handSide === 'right' 
                        ? 'bg-amber-400 text-zinc-950 font-black shadow-md' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tay Phải (Hậu Vận)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Câu hỏi / Nguyện vọng của bạn (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={userQuestion}
                  onChange={e => setUserQuestion(e.target.value)}
                  placeholder="VD: Khi nào tài lộc hanh thông, tình duyên, công việc năm nay..."
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="max-w-md mx-auto space-y-3">
              <button
                onClick={() => {
                  haptics.impact('heavy');
                  setIsCameraScannerOpen(true);
                }}
                className="w-full py-4 rounded-2xl font-black text-base text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-2xl shadow-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Camera className="w-5 h-5 text-zinc-950 animate-pulse" />
                <span>Mở Camera Soi Bàn Tay Ngay</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    haptics.impact('medium');
                    setIsCameraScannerOpen(true);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Tải Ảnh Bàn Tay</span>
                </button>

                <button
                  onClick={handleStartScanSimulator}
                  disabled={isScanning}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{isScanning ? `Đang Quét (${scanProgress}%)` : 'Quét Bàn Tay Mẫu'}</span>
                </button>
              </div>
            </div>

            {/* Visual 3-Step Instruction Guide */}
            <div className="max-w-3xl mx-auto pt-6 border-t border-zinc-800/80">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider text-center mb-4">
                3 Bước Xem Chỉ Tay Chuẩn Xác
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <div className="text-xs font-black text-white">Đủ Ánh Sáng</div>
                  <p className="text-[11px] text-zinc-400">Giơ lòng bàn tay phẳng trước camera nơi có đủ ánh sáng tự nhiên.</p>
                </div>
                <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <div className="text-xs font-black text-white">Khớp Khung Ngắm</div>
                  <p className="text-[11px] text-zinc-400">Đặt lòng bàn tay vừa vặn vào khung ngắm quét HUD trong 3 giây.</p>
                </div>
                <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <div className="text-xs font-black text-white">Nhận Luận Giải & Đọc</div>
                  <p className="text-[11px] text-zinc-400">Xem ngay bản luận giải tướng tay và nghe đọc bằng giọng Tiếng Việt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: MANUAL PICKER (TỰ CHỌN VÂN TAY) */}
      {/* ========================================================================= */}
      {activeSubView === 'manual_picker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Visual Hand Diagram & Element Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-950/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  1. Chọn Bàn Tay & Ngũ Hành
                </h3>
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => {
                      haptics.impact('light');
                      setHandSide('left');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handSide === 'left' 
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-black' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tay Trái
                  </button>
                  <button
                    onClick={() => {
                      haptics.impact('light');
                      setHandSide('right');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handSide === 'right' 
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-black' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tay Phải
                  </button>
                </div>
              </div>

              {/* Hand Shape Elements */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400">Hình Thái Tướng Tay Ngũ Hành:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HAND_SHAPE_ELEMENTS.map((elem, idx) => (
                    <button
                      key={elem.element}
                      onClick={() => {
                        haptics.impact('light');
                        setSelectedShapeIndex(idx);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedShapeIndex === idx
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-black truncate">{elem.element.split(' ')[0]}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{elem.element.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800/80">
                  <strong className={currentShape.color}>{currentShape.element}: </strong>
                  {currentShape.description}
                </p>
              </div>

              {/* Interactive Hand Canvas Visualizer */}
              <div className="relative aspect-square max-w-sm mx-auto bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
                
                <svg viewBox="0 0 400 450" className="w-full h-full max-h-72 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <path
                    d="M100,400 C100,420 300,420 300,400 C320,350 350,280 340,200 C335,160 300,165 295,200 C290,140 260,130 255,190 C250,110 215,100 210,185 C205,130 175,135 170,200 C165,220 130,225 110,250 C80,290 90,370 100,400 Z"
                    fill="rgba(39, 39, 42, 0.6)"
                    stroke="#71717a"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* 1. Life Line */}
                  <path
                    d="M150,230 Q170,300 200,370"
                    fill="none"
                    stroke={activeLineTab === 'life_line' ? '#10b981' : '#059669'}
                    strokeWidth={activeLineTab === 'life_line' ? '5' : '3'}
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] cursor-pointer"
                    onClick={() => setActiveLineTab('life_line')}
                  />

                  {/* 2. Head Line */}
                  <path
                    d="M150,230 Q230,270 300,300"
                    fill="none"
                    stroke={activeLineTab === 'head_line' ? '#38bdf8' : '#0284c7'}
                    strokeWidth={activeLineTab === 'head_line' ? '5' : '3'}
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] cursor-pointer"
                    onClick={() => setActiveLineTab('head_line')}
                  />

                  {/* 3. Heart Line */}
                  <path
                    d="M180,200 Q260,220 330,240"
                    fill="none"
                    stroke={activeLineTab === 'heart_line' ? '#f43f5e' : '#be123c'}
                    strokeWidth={activeLineTab === 'heart_line' ? '5' : '3'}
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] cursor-pointer"
                    onClick={() => setActiveLineTab('heart_line')}
                  />

                  {/* 4. Fate Line */}
                  <path
                    d="M230,380 Q235,280 230,190"
                    fill="none"
                    stroke={activeLineTab === 'fate_line' ? '#f59e0b' : '#b45309'}
                    strokeWidth={activeLineTab === 'fate_line' ? '5' : '2.5'}
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] cursor-pointer"
                    onClick={() => setActiveLineTab('fate_line')}
                  />

                  {/* 5. Sun Line */}
                  <path
                    d="M275,320 L275,200"
                    fill="none"
                    stroke={activeLineTab === 'sun_line' ? '#eab308' : '#854d0e'}
                    strokeWidth={activeLineTab === 'sun_line' ? '4' : '2'}
                    className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] cursor-pointer"
                    onClick={() => setActiveLineTab('sun_line')}
                  />

                  {/* Special Glyphs */}
                  {activeSpecialMarks.includes('letter_m') && (
                    <text x="210" y="275" fill="#facc15" fontSize="16" fontWeight="bold" textAnchor="middle">
                      ✨ M
                    </text>
                  )}
                  {activeSpecialMarks.includes('mystic_cross') && (
                    <text x="250" y="240" fill="#a855f7" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✝️ X
                    </text>
                  )}
                </svg>

                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                  <span>Nhấn trực tiếp vào đường chỉ tay trên hình</span>
                  <span className="font-bold text-amber-400">Đang chọn: {PALM_LINE_FEATURES.find(f => f.id === activeLineTab)?.nameVi.split(' ')[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Line Options Customizer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-zinc-950/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                2. Tùy Chỉnh 5 Đường Chỉ Tay Chính
              </h3>

              {/* Line Tabs */}
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {PALM_LINE_FEATURES.map(line => {
                  const isActive = activeLineTab === line.id;
                  return (
                    <button
                      key={line.id}
                      onClick={() => {
                        haptics.impact('light');
                        setActiveLineTab(line.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-md font-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      <span>{line.icon}</span>
                      <span>{line.nameVi.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Line Description & Options */}
              {(() => {
                const currentLine = PALM_LINE_FEATURES.find(f => f.id === activeLineTab) || PALM_LINE_FEATURES[0];
                const selectedIdx = selectedOptions[currentLine.id] || 0;
                return (
                  <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="text-lg">{currentLine.icon}</span>
                        {currentLine.nameVi} ({currentLine.nameEn})
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Điểm Tướng: {currentLine.options[selectedIdx]?.score || 90}/100
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{currentLine.description}</p>

                    <div className="space-y-2 pt-1">
                      {currentLine.options.map((opt, oIdx) => {
                        const isOptSelected = selectedIdx === oIdx;
                        return (
                          <div
                            key={opt.label}
                            onClick={() => handleOptionChange(currentLine.id, oIdx)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isOptSelected
                                ? 'bg-amber-500/15 border-amber-400 text-amber-100 shadow-md'
                                : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-2">
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isOptSelected ? 'border-amber-400 bg-amber-400' : 'border-zinc-600'}`}>
                                  {isOptSelected && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                                </span>
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium">({opt.score}đ)</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 pl-5">{opt.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Special Marks Section */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    3. Dấu Hiệu Quý Tướng & Ấn Ký Đặc Biệt:
                  </label>
                  <span className="text-[10px] text-zinc-400">Chọn các ký hiệu bạn có</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIAL_PALM_SIGNS.map(sign => {
                    const isChecked = activeSpecialMarks.includes(sign.id);
                    return (
                      <button
                        key={sign.id}
                        onClick={() => toggleSpecialMark(sign.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{sign.symbol} {sign.name.split('(')[0]}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-semibold">{sign.rarity}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1">{sign.meaning}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateReading}
                disabled={isAiAnalyzing}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {isAiAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Đại Sư AI Đang Soi Tướng Bàn Tay...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-950 animate-pulse" />
                    <span>Luận Giải Tướng Bàn Tay Toàn Diện</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: HANDBOOK ENCYCLOPEDIA (CẨM NANG TRA CỨU) */}
      {/* ========================================================================= */}
      {activeSubView === 'handbook' && (
        <div className="bg-zinc-950/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Cẩm Nang Tra Cứu Nhân Tướng Bàn Tay
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tổng hợp ý nghĩa 5 đường vân chính, các gò bàn tay và dấu hiệu quý nhân phù trợ theo cổ thư.
              </p>
            </div>
            <button
              onClick={() => setActiveSubView('camera_scan')}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Soi Bàn Tay Ngay</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PALM_LINE_FEATURES.map(line => (
              <div key={line.id} className="bg-zinc-900/70 p-4 rounded-2xl border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white flex items-center gap-2">
                    <span className="text-xl">{line.icon}</span>
                    {line.nameVi} ({line.nameEn})
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Đại Vân Chính
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{line.description}</p>
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-amber-400">Các dạng tướng thường gặp:</div>
                  {line.options.map(opt => (
                    <div key={opt.label} className="text-[11px] text-zinc-400 pl-2 border-l border-zinc-700">
                      <strong className="text-zinc-200">{opt.label}:</strong> {opt.description}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: READING RESULT (TRANG KẾT QUẢ LUẬN GIẢI CHUYÊN BIỆT) */}
      {/* ========================================================================= */}
      {activeSubView === 'reading_result' && aiReadingMarkdown && (
        <div className="bg-zinc-950/95 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-xl shadow-md">
                ✋
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Luận Giải AI
                  </span>
                  <span className="text-xs text-zinc-400">{handSide === 'left' ? 'Tay Trái (Bẩm Sinh)' : 'Tay Phải (Hậu Vận)'}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Bản Luận Giải Tướng Bàn Tay: {analysisResult?.handShapeElement || currentShape.element}
                </h3>
              </div>
            </div>

            {/* Action Buttons: Speak, Open Reader, Copy, Share */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* 1-Click Vietnamese Voice Playback Button */}
              <button
                onClick={handleToggleQuickSpeak}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                  isQuickSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950'
                }`}
                title="Nghe đọc ngay bằng giọng Tiếng Việt chuẩn"
              >
                {isQuickSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isQuickSpeaking ? 'Dừng Đọc' : 'Nghe Đọc Tiếng Việt'}</span>
              </button>

              <button
                onClick={() => setIsReaderModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Mở toàn màn hình trình đọc văn bản"
              >
                <BookOpen size={14} />
                <span>Mở Trình Đọc</span>
              </button>

              <button
                onClick={handleCopyReading}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Copy size={14} />
                <span>Sao Chép</span>
              </button>

              <button
                onClick={handleShareResult}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-900/30"
              >
                <Share2 size={14} />
                <span>Chia Sẻ</span>
              </button>
            </div>
          </div>

          {/* Scores Overview Chips */}
          {analysisResult && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">🌱 Sinh Lực</div>
                <div className="text-lg font-black text-white mt-0.5">{analysisResult.scores.vitality}%</div>
              </div>
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner">
                <div className="text-[10px] text-sky-400 font-bold uppercase">🧠 Trí Tuệ</div>
                <div className="text-lg font-black text-white mt-0.5">{analysisResult.scores.wisdom}%</div>
              </div>
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner">
                <div className="text-[10px] text-rose-400 font-bold uppercase">💖 Tình Duyên</div>
                <div className="text-lg font-black text-white mt-0.5">{analysisResult.scores.emotion}%</div>
              </div>
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner">
                <div className="text-[10px] text-amber-400 font-bold uppercase">🏛️ Cơ Nghiệp</div>
                <div className="text-lg font-black text-white mt-0.5">{analysisResult.scores.destiny}%</div>
              </div>
              <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 text-center shadow-inner col-span-2 sm:col-span-1">
                <div className="text-[10px] text-purple-400 font-bold uppercase">✨ Trực Giác</div>
                <div className="text-lg font-black text-white mt-0.5">{analysisResult.scores.intuition}%</div>
              </div>
            </div>
          )}

          {/* Formatted Markdown Content */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/80 whitespace-pre-wrap">
            {aiReadingMarkdown}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <button
              onClick={() => {
                setActiveSubView('camera_scan');
                setIsCameraScannerOpen(true);
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Soi Lại Bàn Tay Khác Bằng Camera</span>
            </button>
            <button
              onClick={() => setIsReaderModalOpen(true)}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Mở Toàn Màn Hình Trình Đọc</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-zinc-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live Palm Camera Scanner Modal */}
      <HaevyPalmCameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        handSide={handSide}
        onHandSideChange={setHandSide}
        userQuestion={userQuestion}
        onAnalysisComplete={handleCameraScanComplete}
      />

      {/* Share Modal */}
      <SpiritualShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        attachment={shareAttachment}
        onNavigateToMode={onNavigateToMode}
      />

      {/* Text Reader Modal */}
      <SpiritualTextReaderModal
        isOpen={isReaderModalOpen}
        onClose={() => setIsReaderModalOpen(false)}
        title={`Bản Luận Giải Tướng Bàn Tay (${handSide === 'left' ? 'Tay Trái' : 'Tay Phải'})`}
        contentMarkdown={aiReadingMarkdown || ''}
      />
    </div>
  );
}
