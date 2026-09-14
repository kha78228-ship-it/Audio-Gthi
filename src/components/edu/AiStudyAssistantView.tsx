import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BrainCircuit,
  FileText,
  Upload,
  Send,
  Copy,
  Check,
  BookOpen,
  FlaskConical,
  AlertTriangle,
  HelpCircle,
  RotateCw,
  FolderOpen,
  Lightbulb,
  GraduationCap,
  Compass,
  Trash2,
  ChevronRight,
  Atom,
  TestTube,
  Dna,
  Volume2,
  VolumeX,
  Play,
  Square,
  Eye,
  X,
  Share2,
  CheckCircle2,
  Film,
  Zap
} from 'lucide-react';
import { EduAiStudyMessage, EduLabSubject } from '../../types';
import Markdown from 'react-markdown';

interface AiStudyAssistantViewProps {
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenVideo?: (topic: string, summary?: string) => void;
  onOpenNotebook?: () => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export type StudyMode = 'first_principles' | 'socratic' | 'document_data' | 'step_by_step';

export interface PresetInternalDoc {
  id: string;
  name: string;
  subject: string;
  badge: string;
  description: string;
  content: string;
  associatedLab?: {
    subject: EduLabSubject;
    experimentId: string;
    experimentName: string;
  };
}

// Built-in educational documents ready for GeminiProcessorService extraction
export const INTERNAL_DOCUMENTS: PresetInternalDoc[] = [
  {
    id: 'doc-phys-newton',
    name: 'Cơ Học Cổ Điển & Các Định Luật Bảo Toàn',
    subject: 'Vật Lý',
    badge: 'Cơ Học & Con Lắc',
    description: '3 định luật Newton, định luật vạn vật hấp dẫn, cơ năng, con lắc đơn T = 2π√(L/g)',
    associatedLab: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Con Lắc Đơn & Cơ Năng'
    },
    content: `GIÁO TRÌNH NỘI BỘ: CƠ HỌC CỔ ĐIỂN VÀ CÁC ĐỊNH LUẬT BẢO TOÀN
1. Định luật II Newton: F = m·a. Lực là nguyên nhân làm thay đổi vận tốc (gia tốc), không phải duy trì vận tốc (phá bỏ tư duy sai lầm kiểu Aristotle).
2. Định luật bảo toàn cơ năng: Trong trường lực thế (như trọng trường bỏ qua ma sát), tổng động năng và thế năng là đại lượng bảo toàn: W = Wd + Wt = 1/2*m*v^2 + m*g*z = hằng số.
3. Con lắc đơn: Dao động tự do góc nhỏ (α < 10°). Phương trình vi phân d²α/dt² + (g/L)α = 0.
Chu kỳ dao động: T = 2π√(L/g).
ĐIỂM CỐT LÕI BẢN CHẤT: Chu kỳ T hoàn toàn độc lập với khối lượng m vì cả lực kéo về phục hồi (F_restore = -m*g*sinα) và gia tốc quán tính (a = F/m) đều tỉ lệ thuận với m, nên m bị triệt tiêu!`
  },
  {
    id: 'doc-chem-reaction',
    name: 'Dung Dịch Điện Ly & Phản Ứng Trao Đổi Ion',
    subject: 'Hóa Học',
    badge: 'Cân Bằng & Kết Tủa',
    description: 'Thuyết điện ly Arrhenius, phản ứng trao đổi ion BaSO4, Fe + HCl, chuẩn độ dung dịch',
    associatedLab: {
      subject: 'chemistry',
      experimentId: 'reactions',
      experimentName: 'Phản Ứng BaCl2 + Na2SO4'
    },
    content: `GIÁO TRÌNH HÓA HỌC: DUNG DỊCH ĐIỆN LY VÀ PHẢN ỨNG TRAO ĐỔI ION
1. Bản chất sự điện ly: Dưới tác dụng của các phân tử nước có cực, liên kết ion hoặc cộng hóa trị phân cực bị bẻ gãy, giải phóng các ion tự do chuyển động (cation và anion).
2. Điều kiện xảy ra phản ứng trao đổi ion: Phải tạo thành ít nhất một trong 3 yếu tố:
- Chất kết tủa không tan (ví dụ Ba2+ + SO4(2-) -> BaSO4↓ với tích số tan T_BaSO4 cực nhỏ 1.1 x 10^-10).
- Chất khí bay hơi (ví dụ 2H+ + Fe -> Fe2+ + H2↑).
- Chất điện ly yếu (ví dụ H+ + OH- -> H2O).
3. ĐIỂM CỐT LÕI BẢN CHẤT: Phản ứng ion thực chất chỉ xảy ra giữa các ion thực sự tham gia tạo sản phẩm bền hơn; các ion trơ (như Na+, Cl-) chỉ đóng vai trò khán giả (spectator ions).`
  },
  {
    id: 'doc-phys-circuit',
    name: 'Dòng Điện Một Chiều & Định Luật Ohm Nâng Cao',
    subject: 'Vật Lý',
    badge: 'Mạch Điện',
    description: 'Chuyển động có hướng của electron, định luật Ohm I = U/R, công suất P = I²R và nhiệt lượng Joule',
    associatedLab: {
      subject: 'physics',
      experimentId: 'circuits',
      experimentName: 'Mạch Điện Thông Minh & Định Luật Ohm'
    },
    content: `GIÁO TRÌNH VẬT LÝ ĐIỆN: DÒNG ĐIỆN VÀ ĐỊNH LUẬT OHM
1. Bản chất dòng điện trong kim loại: Là dòng dịch chuyển có hướng của các electron tự do dưới tác dụng của điện trường. Dù vận tốc truyền tương tác điện gần bằng vận tốc ánh sáng (300.000 km/s), vận tốc trôi trung bình của từng electron chỉ khoảng vài mm/giây!
2. Định luật Ohm cho đoạn mạch: Cường độ dòng điện I tỉ lệ thuận với hiệu điện thế U và tỉ lệ nghịch với điện trở R: I = U / R.
3. Mạch nối tiếp và song song:
- Nối tiếp: Dòng điện bằng nhau I = I1 = I2, điện trở cộng dồn R = R1 + R2.
- Song song: Hiệu điện thế bằng nhau U = U1 = U2, 1/R = 1/R1 + 1/R2.
4. Nguy cơ đoản mạch: Khi R -> 0, dòng điện I vọt lên cực đại I = U/r_nguồn, tỏa nhiệt Q = I²*R*t khổng lồ làm nóng chảy dây dẫn và gây cháy nổ.`
  },
  {
    id: 'doc-bio-genetics',
    name: 'Di Truyền Học Men-đen & Cấu Trúc Phân Tử DNA',
    subject: 'Sinh Học',
    badge: 'Di Truyền',
    description: 'Quy luật phân ly, tổ hợp tự do, khung Punnett, liên kết Hydro và mã di truyền',
    associatedLab: {
      subject: 'biology',
      experimentId: 'punnett',
      experimentName: 'Lai Men-đen & Khung Punnett'
    },
    content: `GIÁO TRÌNH SINH HỌC: DI TRUYỀN HỌC VÀ CƠ CHẾ PHÂN TỬ
1. Quy luật phân ly của Men-đen: Mỗi tính trạng do một cặp alen quy định. Trong quá trình giảm phân, các alen phân ly đồng đều về các giao tử.
2. Bản chất lai một cặp tính trạng: P: AA x aa -> F1: 100% Aa (kiểu hình trội). F1 tự thụ phấn -> F2: tỉ lệ kiểu gen 1 AA : 2 Aa : 1 aa (tỉ lệ kiểu hình 3 trội : 1 lặn).
3. Cấu trúc DNA Watson-Crick: Hai mạch polynucleotide xoắn kép ngược chiều (5'->3' và 3'->5'). Các bazơ nitơ liên kết theo nguyên tắc bổ sung: A liên kết với T bằng 2 liên kết hydro, G liên kết với C bằng 3 liên kết hydro.
4. ĐIỂM CỐT LÕI BẢN CHẤT: Tính chính xác trong nhân đôi DNA đến từ tính đặc hiệu về kích thước và số lượng liên kết hydro giữa các cặp bazơ bổ sung.`
  }
];

const QUICK_PROMPTS = [
  {
    label: 'Tại sao chu kỳ con lắc đơn T không phụ thuộc vào khối lượng m?',
    subject: 'Vật Lý',
    mode: 'first_principles' as StudyMode
  },
  {
    label: 'Giải thích bản chất tại sao BaCl2 tác dụng Na2SO4 lại tạo kết tủa trắng BaSO4?',
    subject: 'Hóa Học',
    mode: 'first_principles' as StudyMode
  },
  {
    label: 'Đóng vai gia sư Socratic giúp tôi hiểu tại sao nối song song thì đèn sáng hơn nối tiếp',
    subject: 'Vật Lý',
    mode: 'socratic' as StudyMode
  },
  {
    label: 'Tại sao bước nhảy pH trong chuẩn độ axit-bazơ lại diễn ra đột ngột tại điểm tương đương?',
    subject: 'Hóa Học',
    mode: 'first_principles' as StudyMode
  },
  {
    label: 'Bản chất liên kết hydro trong chuỗi xoắn kép DNA: Tại sao A bắt cặp với T mà không phải C?',
    subject: 'Sinh Học',
    mode: 'first_principles' as StudyMode
  },
  {
    label: 'Phân tích tài liệu nội bộ đã chọn và tóm tắt cô đọng 3 nguyên lý gốc',
    subject: 'Tài Liệu',
    mode: 'document_data' as StudyMode
  }
];

export function AiStudyAssistantView({ 
  onOpenLab, 
  onOpenVideo, 
  onOpenNotebook,
  initialQuery,
  onClearInitialQuery
}: AiStudyAssistantViewProps) {
  // Mode selection
  const [activeMode, setActiveMode] = useState<StudyMode>('first_principles');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-phys-newton');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [uploadedDocContent, setUploadedDocContent] = useState<string | null>(null);

  // Document full view modal
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  // Conversation state
  const [messages, setMessages] = useState<EduAiStudyMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý AI Học Tập Chuyên Sâu của Haevy Edu**, vận hành theo phương pháp **First Principles (Nguyên lý đầu tiên)**.

🎯 **Phương châm cốt lõi:**
- Tiếp nhận tài liệu nội bộ từ thư mục hoặc câu hỏi học tập.
- Bóc tách nguyên lý, giải thích bản chất logic và tóm tắt cô đọng.
- **Tuyệt đối tránh học vẹt**, không bắt người học ghi nhớ máy móc các công thức.
- Luôn trả lời rõ *TẠI SAO (Why)* và *NHƯ THẾ NÀO (How)*.

Bạn có thể nhấn các phím phân tích nhanh bên dưới, chọn giáo trình nội bộ hoặc hỏi bất kỳ thắc mắc nào để cùng tôi bóc tách bản chất!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      mode: 'first_principles'
    }
  ]);

  const [inputQuery, setInputQuery] = useState(initialQuery || '');

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputQuery(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery, onClearInitialQuery]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedToNotebook, setSavedToNotebook] = useState<Record<string, boolean>>({});

  // TTS Speech Synthesis State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active document resolution
  const activeDocContent = uploadedDocContent ?? (INTERNAL_DOCUMENTS.find(d => d.id === selectedDocId)?.content || '');
  const activeDocName = uploadedDocName ?? (INTERNAL_DOCUMENTS.find(d => d.id === selectedDocId)?.name || 'Tài liệu học tập');
  const activeDocObj = INTERNAL_DOCUMENTS.find(d => d.id === selectedDocId);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Speech Synthesis
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ đọc văn bản bằng giọng nói.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner TTS
    const cleanText = text
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/⚠️|🔍|📐|💡|🎯|🔬|⚗️|🧪|⚡/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = speechRate;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedDocName(file.name);
      setUploadedDocContent(text);

      const systemNotice: EduAiStudyMessage = {
        id: `msg-doc-${Date.now()}`,
        sender: 'assistant',
        content: `📄 Đã tiếp nhận tài liệu cá nhân: **${file.name}** (${(file.size / 1024).toFixed(1)} KB).\nGeminiProcessorService đã sẵn sàng bóc tách nguyên lý gốc và giải thích bản chất logic theo yêu cầu của bạn!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        fileAttachment: {
          name: file.name,
          snippet: text.slice(0, 160) + '...'
        }
      };
      setMessages(prev => [...prev, systemNotice]);
    };
    reader.readAsText(file);
  };

  const handleSelectPresetDoc = (doc: PresetInternalDoc) => {
    setSelectedDocId(doc.id);
    setUploadedDocName(null);
    setUploadedDocContent(null);
  };

  // Submit query to /api/edu/ai-study-assistant
  const handleSubmit = async (customQuery?: string, customMode?: StudyMode) => {
    const query = (customQuery ?? inputQuery).trim();
    if (!query || isLoading) return;

    const modeToUse = customMode ?? activeMode;

    const userMsg: EduAiStudyMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      mode: modeToUse,
      fileAttachment: activeDocContent ? {
        name: activeDocName,
        snippet: activeDocContent.slice(0, 120) + '...'
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/edu/ai-study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest: query,
          fileContent: activeDocContent,
          fileName: activeDocName,
          mode: modeToUse,
          history: messages.slice(-5).map(m => ({ sender: m.sender, content: m.content })),
          subject: 'Khoa học tự nhiên (STEM First Principles)'
        })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        const assistantMsg: EduAiStudyMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          mode: modeToUse,
          suggestedLab: data.suggestedLab || activeDocObj?.associatedLab
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Không nhận được phản hồi từ Gemini AI');
      }
    } catch (err: any) {
      console.error('Study assistant error:', err);
      const errorMsg: EduAiStudyMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ Có gián đoạn khi kết nối mạng hoặc máy chủ AI (${err.message || 'Lỗi mạng'}).
        
📌 **Phân tích bản chất cục bộ:**
- Về mặt bản chất, mọi hiện tượng đều tuân theo các định luật bảo toàn (Bảo toàn năng lượng, điện tích, động lượng).
- Hãy áp dụng phương pháp phân rã biến số: Giữ cố định một đại lượng và quan sát đại lượng kia biến thiên tỷ lệ thuận hay nghịch.
- Bạn có thể chuyển sang tab **Phòng Thí Nghiệm Ảo** để tự mình kéo các thanh trượt và quan sát phản ứng trực quan!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedLab: activeDocObj?.associatedLab
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotebook = (msg: EduAiStudyMessage) => {
    try {
      const stored = localStorage.getItem('haevy_edu_notebook_notes') || '[]';
      const parsed = JSON.parse(stored);
      
      const firstLine = msg.content.split('\n')[0].replace(/#+\s/g, '').slice(0, 60);
      const subject = activeDocName.toLowerCase().includes('hóa') ? 'chemistry' : activeDocName.toLowerCase().includes('sinh') ? 'biology' : 'physics';

      const newNote = {
        id: `note-${Date.now()}`,
        title: firstLine || `Phân tích: ${activeDocName}`,
        subject,
        tags: ['First Principles', 'AI Phân Tích', activeDocName.slice(0, 20)],
        firstPrincipleEssence: 'Bóc tách từ trợ lý AI học tập chuyên sâu Haevy Edu',
        content: msg.content,
        source: 'ai_assistant',
        createdAt: new Date().toISOString()
      };

      parsed.unshift(newNote);
      localStorage.setItem('haevy_edu_notebook_notes', JSON.stringify(parsed));
      setSavedToNotebook(prev => ({ ...prev, [msg.id]: true }));
      setTimeout(() => {
        setSavedToNotebook(prev => ({ ...prev, [msg.id]: false }));
      }, 3000);
    } catch (e) {
      console.warn('Cannot save note:', e);
    }
  };

  // 1-Click Fast Extractors (GeminiProcessorService pattern)
  const handleFastExtract = (type: 'principles' | 'pitfalls' | 'mechanism' | 'socratic' | 'summary') => {
    let prompt = '';
    let mode: StudyMode = 'first_principles';

    switch (type) {
      case 'principles':
        prompt = `Hãy dùng phương pháp First Principles để bóc tách 3 tiên đề / nguyên lý nền tảng nhất chi phối nội dung tài liệu [${activeDocName}]. Giải thích rõ tại sao không thể phủ nhận các nguyên lý này.`;
        mode = 'first_principles';
        break;
      case 'pitfalls':
        prompt = `Chỉ ra 3 "cạm bẫy học vẹt" và hiểu lầm phổ biến nhất của học sinh khi học về chủ đề trong [${activeDocName}]. Giải thích bản chất thực sự là gì.`;
        mode = 'first_principles';
        break;
      case 'mechanism':
        prompt = `Giải thích chi tiết cơ chế vận hành (TẠI SAO và NHƯ THẾ NÀO) của các công thức hoặc hiện tượng trong tài liệu [${activeDocName}], tránh hoàn toàn lối giải thích áp đặt.`;
        mode = 'step_by_step';
        break;
      case 'socratic':
        prompt = `Hãy đóng vai gia sư Socratic và đặt cho tôi 3 câu hỏi gợi mở sâu sắc về chủ đề [${activeDocName}] để tôi tự động não suy luận ra bản chất.`;
        mode = 'socratic';
        break;
      case 'summary':
        prompt = `Hãy tóm tắt cô đọng nhất toàn bộ kiến thức trong tài liệu [${activeDocName}] trên một khung nhìn tinh giản, loại bỏ các chi tiết rườm rà.`;
        mode = 'document_data';
        break;
    }

    handleSubmit(prompt, mode);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="w-full bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/50 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl shadow-emerald-950/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/60 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-300">
                <BrainCircuit size={26} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 tracking-tight">
                  AI Hỗ Trợ Học Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">First Principles</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold tracking-wide">
                  GeminiProcessorService
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  Tránh Học Vẹt 🚫
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Nhận dữ liệu tài liệu từ thư mục nội bộ, tiến hành phân tích nguyên lý, giải thích bản chất logic và tóm tắt cô đọng — kết nối trực tiếp phòng thí nghiệm ảo và sổ tay nghiên cứu.
              </p>
            </div>
          </div>

          {/* Quick status & action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800/90 px-3.5 py-2 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Tài liệu nạp:</span>
                <span className="text-xs font-bold text-emerald-400 truncate max-w-[170px]" title={activeDocName}>
                  {activeDocName}
                </span>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Xem toàn văn tài liệu"
              >
                <Eye size={13} />
                <span>Xem</span>
              </button>
            </div>

            {onOpenNotebook && (
              <button
                onClick={onOpenNotebook}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen size={14} />
                <span>Mở Sổ Tay</span>
              </button>
            )}
          </div>
        </div>

        {/* Study Modes Pill Selector */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 mr-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400" />
            Chế Độ Nghiên Cứu:
          </span>

          <button
            onClick={() => setActiveMode('first_principles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'first_principles'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb size={14} />
            <span>1. Nguyên Lý Gốc (First Principles)</span>
          </button>

          <button
            onClick={() => setActiveMode('socratic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'socratic'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle size={14} />
            <span>2. Gia Sư Socratic (Gợi Mở)</span>
          </button>

          <button
            onClick={() => setActiveMode('document_data')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'document_data'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderOpen size={14} />
            <span>3. Xử Lý Dữ Liệu Tài Liệu</span>
          </button>

          <button
            onClick={() => setActiveMode('step_by_step')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'step_by_step'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GraduationCap size={14} />
            <span>4. Giải Bài Tập Bản Chất</span>
          </button>
        </div>

        {/* 1-Click Fast Extractors Bar (GeminiProcessorService Fast Actions) */}
        <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mr-1">
            <Zap size={13} />
            Bóc Tách Nhanh:
          </span>

          <button
            onClick={() => handleFastExtract('principles')}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-900/90 hover:bg-emerald-500/20 border border-zinc-700 hover:border-emerald-500/50 rounded-lg text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span>🔍 3 Tiên Đề Gốc</span>
          </button>

          <button
            onClick={() => handleFastExtract('pitfalls')}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-900/90 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/50 rounded-lg text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span>⚠️ Cạm Bẫy Học Vẹt</span>
          </button>

          <button
            onClick={() => handleFastExtract('mechanism')}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-900/90 hover:bg-cyan-500/20 border border-zinc-700 hover:border-cyan-500/50 rounded-lg text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span>📐 Cơ Chế Tại Sao & Như Thế Nào</span>
          </button>

          <button
            onClick={() => handleFastExtract('socratic')}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-900/90 hover:bg-teal-500/20 border border-zinc-700 hover:border-teal-500/50 rounded-lg text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span>🎯 3 Câu Hỏi Socratic</span>
          </button>

          <button
            onClick={() => handleFastExtract('summary')}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span>📑 Tóm Tắt 1 Trang</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Internal Document Vault & Fast Prompts (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Internal Documents Vault */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Thư Mục Giáo Trình Nội Bộ</h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded-md">
                {INTERNAL_DOCUMENTS.length} Giáo trình
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Chọn tài liệu nền tảng có sẵn để trợ lý AI nạp vào bộ xử lý nguyên lý logic:
            </p>

            {/* Preset Document Cards */}
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
              {INTERNAL_DOCUMENTS.map(doc => {
                const isSelected = selectedDocId === doc.id && !uploadedDocName;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectPresetDoc(doc)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {doc.subject === 'Vật Lý' ? <Atom size={14} /> : doc.subject === 'Hóa Học' ? <TestTube size={14} /> : <Dna size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {doc.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded shrink-0">
                          {doc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom File Upload Option */}
            <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/70 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-all"
              >
                <Upload size={14} className="text-emerald-400" />
                <span>{uploadedDocName ? `Tệp: ${uploadedDocName.slice(0, 16)}...` : 'Nạp File Từ Máy (.txt, .docx)'}</span>
              </button>
              {uploadedDocName && (
                <button
                  onClick={() => {
                    setUploadedDocName(null);
                    setUploadedDocContent(null);
                  }}
                  className="p-2 bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 border border-zinc-700 rounded-xl text-zinc-400 transition-colors"
                  title="Hủy tệp tải lên"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Quick First Principles Prompts */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Chủ Đề Phá Vỡ Học Vẹt</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Nhấn câu hỏi để bóc tách ngay cơ chế vận hành gốc rễ:
            </p>

            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(qp.label, qp.mode)}
                  disabled={isLoading}
                  className="text-left p-2.5 rounded-xl bg-zinc-950/50 hover:bg-zinc-800/60 border border-zinc-800 hover:border-emerald-500/40 text-xs text-zinc-300 transition-all flex items-start gap-2 group disabled:opacity-50"
                >
                  <ChevronRight size={14} className="text-emerald-500 group-hover:translate-x-0.5 transition-transform mt-0.5 shrink-0" />
                  <span className="flex-1 leading-snug">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core First Principles Philosophy Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block mb-1">Cảnh Báo Học Vẹt:</strong>
              Thuộc lòng công thức mà không hiểu nguyên lý tương tác chỉ giúp giải các bài toán khuôn mẫu. Khi gặp trường hợp biến dạng thực tế, tư duy học vẹt sẽ sụp đổ. Hãy luôn tự hỏi: <em>"Tại sao biến số này lại tăng khi biến số kia giảm?"</em>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Chat & First Principles Reasoning Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[780px] bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-950">
          
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-zinc-100">
                  Phòng Đối Thoại & Phân Tích Bản Chất
                </span>
                <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                  Chế độ: <span className="text-emerald-400 font-semibold">
                    {activeMode === 'first_principles' ? 'Nguyên Lý Gốc' : activeMode === 'socratic' ? 'Gia Sư Socratic' : activeMode === 'document_data' ? 'Xử Lý Tài Liệu' : 'Giải Bài Bản Chất'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice playback indicator if active */}
              {speakingMsgId && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium animate-pulse border border-emerald-500/30">
                  <Volume2 size={13} />
                  <span>Đang đọc...</span>
                  <button onClick={handleStopSpeak} className="ml-1 p-0.5 hover:text-white">
                    <Square size={10} fill="currentColor" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  handleStopSpeak();
                  setMessages([
                    {
                      id: `msg-reset-${Date.now()}`,
                      sender: 'assistant',
                      content: 'Đã làm mới phiên học. Hãy nhập bài toán hoặc chọn tài liệu nội bộ để cùng bóc tách bản chất mới!',
                      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCw size={14} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              const isSpeakingThis = speakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                >
                  {/* Sender Name & Timestamp */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                      {isUser ? 'Học sinh' : 'Haevy Edu AI (First Principles)'}
                    </span>
                    <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 max-w-[95%] sm:max-w-[88%] text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-950/40'
                        : 'bg-zinc-950 border border-zinc-800/90 text-zinc-200 rounded-tl-none shadow-md shadow-zinc-950/60'
                    } ${isSpeakingThis ? 'ring-2 ring-emerald-500/80' : ''}`}
                  >
                    {/* Attached Doc Snippet if any */}
                    {msg.fileAttachment && (
                      <div className={`mb-3 p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                        isUser
                          ? 'bg-emerald-700/40 border-emerald-500/30 text-emerald-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        <FileText size={14} className="shrink-0 text-emerald-300" />
                        <span className="font-semibold truncate">Tài liệu: {msg.fileAttachment.name}</span>
                      </div>
                    )}

                    {/* Markdown / Text Content */}
                    <div className="font-sans text-xs sm:text-sm prose prose-invert max-w-none prose-headings:text-emerald-300 prose-headings:font-bold prose-headings:text-sm sm:prose-headings:text-base prose-p:my-2 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:text-emerald-300 prose-code:bg-zinc-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* Suggested Lab Action Button if detected */}
                    {msg.suggestedLab && onOpenLab && (
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                          <FlaskConical size={16} />
                          <span>Thí nghiệm kiểm chứng: {msg.suggestedLab.experimentName}</span>
                        </div>
                        <button
                          onClick={() => onOpenLab(msg.suggestedLab!.subject, msg.suggestedLab!.experimentId)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Mở Phòng Thí Nghiệm</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    {/* Assistant Action Buttons Toolbar */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-zinc-400 text-xs">
                        {/* Voice reader toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.content)}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                              isSpeakingThis
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'hover:text-zinc-200 hover:bg-zinc-800/80'
                            }`}
                            title="Nghe đọc giải thích bằng giọng AI"
                          >
                            {isSpeakingThis ? <VolumeX size={13} className="text-emerald-400" /> : <Volume2 size={13} />}
                            <span>{isSpeakingThis ? 'Dừng đọc' : 'Nghe AI Đọc'}</span>
                          </button>

                          {onOpenVideo && (
                            <button
                              onClick={() => onOpenVideo(activeDocName, msg.content.slice(0, 300))}
                              className="p-1.5 hover:text-cyan-300 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                              title="Tạo video bài giảng trực quan từ phân tích này"
                            >
                              <Film size={13} />
                              <span className="hidden sm:inline">Tạo Video</span>
                            </button>
                          )}
                        </div>

                        {/* Copy & Save to Notebook */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1.5 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                            title="Sao chép toàn bộ phân tích"
                          >
                            {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedId === msg.id ? 'Đã sao chép' : 'Sao chép'}</span>
                          </button>

                          <button
                            onClick={() => handleSaveToNotebook(msg)}
                            className="p-1.5 hover:text-amber-300 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                            title="Lưu vào sổ tay nghiên cứu"
                          >
                            {savedToNotebook[msg.id] ? (
                              <>
                                <CheckCircle2 size={13} className="text-amber-400" />
                                <span className="text-amber-400">Đã lưu sổ tay</span>
                              </>
                            ) : (
                              <>
                                <BookOpen size={13} />
                                <span>Lưu sổ tay</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                    Haevy Edu AI Đang Bóc Tách Bản Chất...
                  </span>
                </div>
                <div className="rounded-2xl rounded-tl-none p-4 bg-zinc-950 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-400">
                    GeminiProcessorService đang phân tích dữ liệu tài liệu & tái lập từ các nguyên lý đầu tiên...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800/90 flex flex-col gap-2.5">
            {/* Active Attachment Badge */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <div className="flex items-center gap-1.5 truncate">
                <FileText size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">
                  Dữ liệu tài liệu đang gắn: <strong className="text-zinc-200">{activeDocName}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {activeMode === 'first_principles' ? '🔍 Bóc tách bản chất' : activeMode === 'socratic' ? '🧠 Gợi mở tư duy' : activeMode === 'document_data' ? '📄 Xử lý tài liệu' : '✍️ Giải từng bước'}
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  activeMode === 'first_principles'
                    ? 'Hỏi về bản chất: Tại sao lại có công thức này? Hiện tượng này do đâu?'
                    : activeMode === 'socratic'
                    ? 'Nhập vấn đề bạn đang thắc mắc để cùng suy luận từng bước...'
                    : activeMode === 'document_data'
                    ? 'Yêu cầu xử lý tài liệu: Tóm tắt 3 tiên đề gốc, tìm điểm mâu thuẫn...'
                    : 'Nhập đề bài tập để giải theo bản chất logic...'
                }
                disabled={isLoading}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-bold rounded-2xl transition-all shadow-md shadow-emerald-950/40 shrink-0 flex items-center justify-center"
                title="Gửi câu hỏi"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Document Full Text Modal Dialog */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">{activeDocName}</h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    Dung lượng: {(activeDocContent.length / 1024).toFixed(1)} KB • {activeDocContent.split(/\s+/).length} Từ
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Document Content */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900/50">
              {activeDocContent}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeDocContent);
                  alert('Đã sao chép toàn bộ tài liệu vào clipboard!');
                }}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <Copy size={14} />
                <span>Sao Chép Toàn Văn</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDocModal(false);
                    handleFastExtract('principles');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-950/50"
                >
                  Bóc Tách 3 Tiên Đề Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
