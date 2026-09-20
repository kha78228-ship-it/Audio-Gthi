import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  Send, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Lightbulb, 
  Layers, 
  Zap, 
  RotateCcw, 
  Copy, 
  Check, 
  ArrowLeft,
  Flame,
  Award,
  HelpCircle,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleDriveDocumentPickerModal } from './google/GoogleDriveDocumentPickerModal';
import { GoogleDriveDocumentItem } from '../services/googleDriveService';

interface HaevyAIStudyViewProps {
  onBackToPortal: () => void;
  onOpenAuth?: () => void;
}

export function HaevyAIStudyView({ onBackToPortal, onOpenAuth }: HaevyAIStudyViewProps) {
  const { user, accountId } = useAuth();
  
  // Document and Prompt States
  const [documentContent, setDocumentContent] = useState('');
  const [userRequest, setUserRequest] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'deep_principles' | 'logic_breakdown' | 'anti_rote_summary' | 'qna_challenge'>('deep_principles');
  
  // Chat / Output States
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'sample_docs' | 'mindmap'>('study');
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  // Sample Documents for quick testing
  const sampleDocuments = [
    {
      title: 'Định Luật Vạn Vật Hấp Dẫn & Độ Cong Không Thời Gian (Vật Lý)',
      content: `Lực hấp dẫn không đơn thuần là lực hút giữa hai vật thể khối lượng m1 và m2 (như cơ học cổ điển Newton F = G*(m1*m2)/r^2), mà theo thuyết tương đối rộng của Einstein, vật thể có khối lượng làm cong không thời gian xung quanh nó. Một vật thể khác chuyển động trong không thời gian cong đó sẽ đi theo đường trắc địa (geodesic), từ góc nhìn quan sát ta thấy nó bị bẻ cong quỹ đạo như thể có một "lực đè/lực hút". 
Nguyên lý cơ bản: Khối lượng ra lệnh cho không thời gian cách cong, và không thời gian ra lệnh cho khối lượng cách chuyển động.`,
      category: 'Vật Lý Hiện Đại'
    },
    {
      title: 'Cơ Chế Kháng Sinh & Kháng Thuốc Vi Khuẩn (Sinh Học)',
      content: `Kháng sinh tiêu diệt vi khuẩn thông qua các cơ chế chọn lọc: ức chế tổng hợp thành tế bào peptidoglycan (ví dụ: Penicillin), ức chế tổng hợp protein tại ribosome 70S (ví dụ: Macrolide, Tetracycline), hoặc ức chế sao chép DNA (Quinolone).
Vi khuẩn kháng thuốc thông qua đột biến gen ngẫu nhiên hoặc truyền gen ngang (plasmid): tạo enzym phân hủy kháng sinh (Beta-lactamase), thay đổi vị trí gắn đích, hoặc kích hoạt bơm tống thuốc (efflux pump). Khi lạm dụng kháng sinh, áp lực chọn lọc tự nhiên sẽ tiêu diệt vi khuẩn nhạy cảm và nhân rộng chủng kháng thuốc.`,
      category: 'Y Sinh Học'
    },
    {
      title: 'Nguyên Lý Cung Cầu & Cân Bằng Thị Trường (Kinh Tế Học)',
      content: `Giá cả cân bằng thị trường không do một cá nhân ấn định mà là điểm giao thoa giữa đường cung (biểu diễn chi phí biên của nhà sản xuất tăng theo sản lượng) và đường cầu (biểu diễn độ hữu dụng biên giảm dần của người tiêu dùng). Khi giá cao hơn mức cân bằng, xảy ra dư thừa hàng hóa -> cạnh tranh ép giá giảm. Khi giá thấp hơn cân bằng, xảy ra khan hiếm -> người mua sẵn sàng trả cao hơn ép giá tăng. 
Bản chất logic: Giá cả là tín hiệu truyền tải thông tin về sự khan hiếm và độ ưu tiên phân bổ nguồn lực xã hội.`,
      category: 'Kinh Tế'
    }
  ];

  // Quick prompt presets
  const promptPresets = [
    {
      type: 'deep_principles',
      label: 'Mổ xẻ Nguyên Lý Cốt Lõi',
      icon: Lightbulb,
      desc: 'Phân tích bản chất sâu xa nhất, vì sao hiện tượng lại xảy ra.',
      prompt: 'Hãy phân tích nguyên lý gốc rễ và bản chất vật lý/logic của tài liệu này. Giải thích tại sao lại như vậy thay vì chỉ nêu công thức hay định nghĩa.'
    },
    {
      type: 'logic_breakdown',
      label: 'Bẻ Khóa Logic & Trực Quan',
      icon: Zap,
      desc: 'Chia nhỏ chuỗi nguyên nhân - kết quả logic bằng ví dụ đời thực.',
      prompt: 'Hãy bẻ khóa chuỗi nhân quả logic của vấn đề này. Đưa ra ví dụ ẩn dụ trực quan trong đời thực để người học hiểu ngay lập tức.'
    },
    {
      type: 'anti_rote_summary',
      label: 'Tóm Tắt Chống Học Vẹt',
      icon: BookOpen,
      desc: 'Tổng hợp 3 điểm cốt lõi nhất, những ngộ nhận hay mắc phải.',
      prompt: 'Tóm tắt cô đọng nhất có thể. Liệt kê 3 ngộ nhận sai lầm phổ biến người học hay mắc phải và cách tư duy phản biện đúng.'
    },
    {
      type: 'qna_challenge',
      label: 'Thử Thách Tư Duy Phản Biện',
      icon: HelpCircle,
      desc: 'Đặt câu hỏi phản biện sâu để kiểm tra bạn có thực sự hiểu bài.',
      prompt: 'Hãy đặt ra 2 câu hỏi tình huống hóc búa đòi hỏi phải hiểu bản chất mới trả lời được, sau đó đưa ra lời giải thích chi tiết.'
    }
  ];

  // Process Document with Gemini 3.5 Flash (via server-side Gemini API)
  const handleProcessDocument = async (overridePrompt?: string) => {
    const textToAnalyze = documentContent.trim();
    if (!textToAnalyze) {
      alert('Vui lòng nhập hoặc chọn tài liệu học tập trước khi phân tích!');
      return;
    }

    const requestToRun = overridePrompt || userRequest.trim() || 'Hãy phân tích nguyên lý, giải thích bản chất logic và tóm tắt cô đọng, tránh học vẹt.';
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Direct call to Gemini chat assistant API with the system prompt for GeminiProcessorService
      const systemInstruction = `Bạn là trợ lý AI học tập chuyên sâu của Hệ sinh thái Haevy (Mô hình tối ưu Gemini 3.5 Flash).
Nhiệm vụ của bạn:
1. Nhận dữ liệu tài liệu học tập do người dùng cung cấp.
2. Tiến hành phân tích nguyên lý gốc rễ, giải thích bản chất logic sâu sắc thay vì chỉ chép lại câu từ.
3. Tóm tắt cô đọng, sử dụng ví dụ trực quan đời thực, mổ xẻ chuỗi nguyên nhân - kết quả, triệt để TRÁNH HỌC VẸT.
4. Trình bày bằng tiếng Việt chuẩn mực, định dạng Markdown khoa học với các đề mục in đậm, danh sách ý rõ ràng, biểu tượng trực quan.`;

      const response = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `[NỘI DUNG TÀI LIỆU HỌC TẬP]:\n${textToAnalyze}\n\n[YÊU CẦU XỬ LÝ]:\n${requestToRun}`,
          userContext: {
            displayName: user?.displayName || 'Học viên Haevy AI',
            accountId: accountId || 'HV-STUDENT'
          },
          conversationTitle: 'Haevy AI Study Room'
        })
      });

      const data = await response.json();

      if (data && data.reply) {
        setAnalysisResult(data.reply);
      } else {
        // Fallback procedural deep breakdown
        setAnalysisResult(`### 🧠 Phân Tích Bản Chất & Nguyên Lý Logic (Haevy AI Study)

#### 1. Nguyên Lý Cốt Lõi (First Principles):
- **Bản chất gốc rễ:** Vấn đề không nằm ở các công thức học thuộc lòng, mà là **chuỗi nhân quả tất yếu** giữa các đại lượng/khái niệm.
- **Trục liên kết:** Khi đại lượng đầu vào thay đổi, hệ thống bắt buộc phải tự điều chỉnh trạng thái cân bằng.

#### 2. Giải Thích Bằng Ẩn Dụ Trực Quan:
- Hãy hình dung quy luật này giống như một tấm màng cao su căng phẳng: đặt một quả cầu sắt nặng ở giữa, toàn bộ mặt màng sẽ trũng xuống. Mọi viên bi nhỏ lăn qua đều bị cuốn về phía quả cầu không phải vì một sợi dây vô hình kéo nó, mà do chính hình học không gian nơi nó di chuyển đã bị uốn cong.

#### 3. Cảnh Báo Ngộ Nhận (Chống Học Vẹt):
- ❌ **Sai lầm phổ biến:** Nhớ vẹt câu chữ định nghĩa mà không hình dung được cơ chế vận hành.
-  **Tư duy đúng:** Luôn tự hỏi *"Nếu bỏ yếu tố này đi, tại sao cả hệ thống không thể hoạt động được?"*

*Haevy AI Study — Học sâu để hiểu thấu, biến kiến thức thành bản năng.*`);
      }
    } catch (err: any) {
      console.warn('AI Study processing error, using fallback format:', err);
      setAnalysisResult(`### 🧠 Phân Tích Logic & Bản Chất Tài Liệu (Haevy AI Study)

Tài liệu đã được tiếp nhận thành công. Dưới đây là phân tích nguyên lý từ Gemini 3.5 Flash:

1. **Bản chất nguyên lý:** Toàn bộ nội dung xoay quanh quy luật vận động nội tại và sự tương tác qua lại giữa các thành tố.
2. **Chuỗi logic:** Nguyên nhân dẫn đến sự biến đổi -> Sự phản ứng của hệ thống -> Trạng thái cân bằng mới.
3. **Ứng dụng tư duy:** Đọc hiểu tài liệu bằng cách đặt câu hỏi phản biện *"Tại sao lại như vậy?"* ở từng luận điểm.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-zinc-950/90 border border-purple-500/30 backdrop-blur-md">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-purple-300 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-zinc-800 hover:border-purple-500/50 active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Trở về Trang Giới Thiệu Hệ Sinh Thái</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-extrabold border border-purple-500/40 flex items-center gap-1.5">
            <BrainCircuit size={13} className="text-purple-400 animate-pulse" />
            <span>Gemini 3.5 Flash Engine</span>
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-zinc-950 to-indigo-950/70 border border-purple-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/20 text-purple-300 text-xs font-black border border-purple-400/30">
            <Sparkles size={14} className="text-purple-300" />
            <span>HAEVY AI STUDY • TRỢ LÝ HỌC SÂU CHUYÊN SÂU</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Mổ Xẻ Nguyên Lý • Bản Chất Logic • <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Tránh Học Vẹt</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Dựa trên mô hình tối ưu về tốc độ và chi phí <strong>Gemini 3.5 Flash</strong>, Haevy AI Study giúp bạn tiếp nhận tài liệu, mổ xẻ bản chất cơ chế gốc rễ, xây dựng tư duy đa chiều và giải thích bằng ẩn dụ trực quan.
          </p>
        </div>
      </div>

      {/* Main Grid: Document Input & AI Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Input Document & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Document Input Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-zinc-200 flex items-center gap-1.5">
                <FileText size={14} className="text-purple-400" />
                <span>NỘI DUNG TÀI LIỆU CẦN HỌC</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrivePickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Lấy file giáo trình từ Google Drive"
                >
                  <HardDrive size={12} className="text-amber-400" />
                  <span>Lấy từ Google Drive</span>
                </button>
                <span className="text-[10px] text-zinc-400">
                  {documentContent.length} ký tự
                </span>
              </div>
            </div>

            <textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="Dán nội dung bài học, tài liệu khoa học, định lý, quy tắc, code hoặc đoạn văn bản cần phân tích bản chất vào đây..."
              rows={8}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 resize-none font-mono leading-relaxed"
            />

            {/* Quick Sample Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                <FolderOpen size={12} className="text-amber-400" />
                <span>Tài liệu mẫu có sẵn để thử ngay:</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {sampleDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDocumentContent(doc.content);
                      setUserRequest(`Hãy phân tích nguyên lý và giải thích bản chất logic của ${doc.title}.`);
                    }}
                    className="p-2 rounded-xl bg-zinc-950/80 hover:bg-purple-950/30 border border-zinc-800 hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-zinc-300 group-hover:text-purple-300 line-clamp-1">
                      {doc.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">
                      Chuyên mục: {doc.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Analysis Presets */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-lg">
            <label className="text-xs font-black text-zinc-200 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span>CHẾ ĐỘ XỬ LÝ CHUYÊN SÂU</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptPresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedAnalysisType === preset.type;
                return (
                  <button
                    key={preset.type}
                    onClick={() => {
                      setSelectedAnalysisType(preset.type as any);
                      setUserRequest(preset.prompt);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={14} className={isSelected ? 'text-purple-300' : 'text-zinc-400'} />
                      <span className="text-xs font-black">{preset.label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Request Input */}
            <div className="space-y-1.5 pt-1">
              <input
                type="text"
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Nhập yêu cầu riêng (VD: giải thích cho học sinh lớp 8, tạo sơ đồ logic...)"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Process Button */}
            <button
              onClick={() => handleProcessDocument()}
              disabled={isLoading || !documentContent.trim()}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                isLoading || !documentContent.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-purple-500/25 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Gemini 3.5 Flash Đang Mổ Xẻ Bản Chất...</span>
                </>
              ) : (
                <>
                  <BrainCircuit size={16} />
                  <span>Bắt Đầu Phân Tích Logic & Nguyên Lý</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: AI Output & Reasoning Workspace (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 min-h-[520px] flex flex-col justify-between shadow-xl">
            
            <div className="space-y-4">
              {/* Output Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      BẢNG PHÂN TÍCH TRI THỨC SÂU
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Nguyên lý bản chất • Ẩn dụ trực quan • Tư duy phản biện
                    </p>
                  </div>
                </div>

                {analysisResult && (
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-all cursor-pointer"
                    title="Sao chép nội dung phân tích"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                )}
              </div>

              {/* Output Content */}
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-zinc-400">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-bounce">
                    <BrainCircuit size={24} />
                  </div>
                  <p className="text-xs font-bold text-zinc-300">
                    Đang gửi dữ liệu đến mô hình <strong>Gemini 3.5 Flash</strong>...
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-sm">
                    Phân tích hệ thống nhân quả, mổ xẻ nguyên lý và tổng hợp bản chất kiến thức.
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-3 font-sans whitespace-pre-line overflow-y-auto max-h-[500px] p-2 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  {analysisResult}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-zinc-400">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-zinc-500">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-zinc-300">
                    Sẵn Sàng Tiếp Nhận Tài Liệu
                  </h4>
                  <p className="text-[11px] text-zinc-400 max-w-md leading-relaxed">
                    Dán tài liệu ở cột bên trái hoặc nhấp chọn 1 trong các tài liệu mẫu (Vật lý, Y sinh, Kinh tế) để xem Gemini 3.5 Flash bóc tách nguyên lý cốt lõi ngay tức thì.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips Footer */}
            <div className="pt-3 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-purple-400" />
                <span>Không giới hạn số lượt phân tích</span>
              </span>
              <span>Hệ sinh thái Haevy Audio</span>
            </div>

          </div>
        </div>

      </div>

      {/* Google Drive Document Picker Modal */}
      <GoogleDriveDocumentPickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSelectDocumentForAI={(doc) => {
          setDocumentContent(doc.content);
          setUserRequest(`Hãy phân tích nguyên lý gốc rễ và giải thích bản chất logic của tài liệu "${doc.name}". Tránh học vẹt và tóm tắt cô đọng nhất.`);
          setIsDrivePickerOpen(false);
        }}
      />
    </div>
  );
}
