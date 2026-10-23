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
  Pause,
  Square,
  Eye,
  X,
  Share2,
  CheckCircle2,
  Film,
  Zap,
  Cpu,
  Globe,
  ExternalLink,
  Search,
  Database,
  Headphones,
  Timer,
  Sliders,
  Calculator,
  Layers,
  BookmarkPlus,
  ArrowRight,
  Info,
  HardDrive
} from 'lucide-react';
import { EduAiStudyMessage, EduLabSubject } from '../../types';
import { executeAddEduNote } from '../../utils/haevyAIEcosystemEngine';
import { GoogleDriveDocumentPickerModal } from '../google/GoogleDriveDocumentPickerModal';
import { GoogleDriveDocumentItem } from '../../services/googleDriveService';
import { geminiProcessorService } from '../../services/geminiProcessorService';
import { 
  startBinauralBeat, 
  stopBinauralBeat, 
  startFocusPinkNoise, 
  stopFocusPinkNoise, 
  playFocusBellSound 
} from '../../utils/studyAudioSynthesizer';
import Markdown from 'react-markdown';

interface AiStudyAssistantViewProps {
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenVideo?: (topic: string, summary?: string) => void;
  onOpenNotebook?: () => void;
  onOpenHaevyAi?: () => void;
  onOpenTools?: (tab?: 'casio880' | 'calculator' | 'periodic' | 'converter' | 'pomodoro' | 'flashcards' | 'deconstructor') => void;
  onOpenExam?: () => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export type StudyMode = 
  | 'first_principles' 
  | 'socratic' 
  | 'step_by_step' 
  | 'casio_fx880' 
  | 'feynman_simple' 
  | 'thpt_exam_tactic' 
  | 'document_data' 
  | 'live_search';

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
    label: 'Hướng dẫn bấm máy Casio fx-880 BTG giải hệ phương trình 3 ẩn & kiểm tra nghiệm',
    subject: 'Toán Học',
    mode: 'casio_fx880' as StudyMode
  },
  {
    label: 'Giải thích định luật bảo toàn động lượng theo phương pháp Feynman siêu dễ hiểu',
    subject: 'Vật Lý',
    mode: 'feynman_simple' as StudyMode
  },
  {
    label: 'Chiến thuật làm bài trắc nghiệm Đúng/Sai 4 ý môn Hóa thi THPT 2027 và cách né bẫy',
    subject: 'Hóa Học',
    mode: 'thpt_exam_tactic' as StudyMode
  },
  {
    label: 'Phân tích tài liệu nội bộ đã chọn và tóm tắt cô đọng 3 nguyên lý gốc',
    subject: 'Tài Liệu',
    mode: 'document_data' as StudyMode
  }
];

export const SCIENCE_CONSTANTS = [
  { symbol: 'c', name: 'Tốc độ ánh sáng', value: '2.998 × 10⁸ m/s', unit: 'm/s', field: 'Vật Lý Quang Học & Vũ Trụ', textToInsert: 'c = 3×10⁸ m/s' },
  { symbol: 'h', name: 'Hằng số Planck', value: '6.626 × 10⁻³⁴ J·s', unit: 'J·s', field: 'Vật Lý Lượng Tử', textToInsert: 'h = 6.626×10⁻³⁴ J·s' },
  { symbol: 'G', name: 'Hằng số hấp dẫn', value: '6.674 × 10⁻¹¹ N·m²/kg²', unit: 'N·m²/kg²', field: 'Cơ Học & Thiên Văn', textToInsert: 'G = 6.674×10⁻¹¹ N·m²/kg²' },
  { symbol: 'e', name: 'Điện tích nguyên tố', value: '1.602 × 10⁻¹⁹ C', unit: 'C', field: 'Điện Từ Học & Hạt Cơ Bản', textToInsert: 'e = 1.602×10⁻¹⁹ C' },
  { symbol: 'N_A', name: 'Số Avogadro', value: '6.022 × 10²³ mol⁻¹', unit: 'mol⁻¹', field: 'Hóa Học & Phân Tử', textToInsert: 'N_A = 6.022×10²³ mol⁻¹' },
  { symbol: 'R', name: 'Hằng số khí lý tưởng', value: '8.314 J/(mol·K)', unit: 'J/(mol·K)', field: 'Nhiệt Động Lực Học', textToInsert: 'R = 8.314 J/(mol·K)' },
  { symbol: 'k_B', name: 'Hằng số Boltzmann', value: '1.381 × 10⁻²³ J/K', unit: 'J/K', field: 'Vật Lý Thống Kê', textToInsert: 'k_B = 1.381×10⁻²³ J/K' },
  { symbol: 'g₀', name: 'Gia tốc trọng trường', value: '9.81 m/s²', unit: 'm/s²', field: 'Cơ Học Cổ Điển', textToInsert: 'g = 9.81 m/s²' }
];

export const CORE_FORMULAS = [
  { label: 'Con lắc đơn', name: 'Dao động con lắc đơn', formula: 'T = 2π√(l/g)', subject: 'Vật Lý', essence: 'Chu kỳ chỉ phụ thuộc chiều dài dây và gia tốc trọng trường, hoàn toàn độc lập với khối lượng m do quán tính và trọng lực triệt tiêu lẫn nhau.', textToInsert: 'T = 2π√(l/g)' },
  { label: 'Định luật Ohm', name: 'Định luật Ohm toàn mạch', formula: 'I = U / R ; P = U·I = I²R', subject: 'Vật Lý', essence: 'Cường độ dòng điện là lưu lượng điện tích bị cản trở bởi điện trở vật liệu và được thúc đẩy bởi hiệu điện thế.', textToInsert: 'I = U/R' },
  { label: 'Phương trình Clapeyron', name: 'Khí lý tưởng Clapeyron - Mendeleev', formula: 'P·V = n·R·T', subject: 'Hóa Học', essence: 'Áp suất là kết quả của sự va chạm phân tử lên thành bình; nhiệt độ T đo động năng chuyển động hỗn loạn trung bình.', textToInsert: 'P·V = n·R·T' },
  { label: 'Nồng độ pH dung dịch', name: 'Thang đo pH dung dịch nước', formula: 'pH = -log[H⁺]', subject: 'Hóa Học', essence: 'Thang đo logarit biểu diễn nồng độ ion H+ biến thiên trên nhiều bậc độ lớn từ 10^-14 đến 1 mol/L.', textToInsert: 'pH = -log[H⁺]' },
  { label: 'Nguyên tắc bổ sung DNA', name: 'Nguyên tắc bổ sung Watson - Crick', formula: 'A = T ; G ≡ C ; L = N/2 × 3.4 Å', subject: 'Sinh Học', essence: 'Liên kết hydro đặc hiệu giữa purin và pyrimidine đảm bảo độ rộng chuỗi xoắn kép không đổi và bảo toàn mã di truyền khi sao chép.', textToInsert: 'A=T, G=X' },
  { label: 'Nghiệm phương trình bậc 2', name: 'Phương trình bậc hai một ẩn', formula: 'Δ = b² - 4ac ; x = (-b ± √Δ)/(2a)', subject: 'Toán Học', essence: 'Tách biểu thức thành bình phương đúng để chuyển bài toán về căn bậc hai hình học.', textToInsert: 'ax² + bx + c = 0' }
];

export function AiStudyAssistantView({ 
  onOpenLab, 
  onOpenVideo, 
  onOpenNotebook,
  onOpenHaevyAi,
  onOpenTools,
  onOpenExam,
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
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);

  // Focus Audio Synthesizer State
  const [focusAudioMode, setFocusAudioMode] = useState<'off' | 'alpha' | 'beta' | 'gamma' | 'pink_noise'>('off');

  // Pomodoro Timer State
  const [isPomodoroActive, setIsPomodoroActive] = useState<boolean>(false);
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number>(25 * 60);
  const [pomodoroIntervalType, setPomodoroIntervalType] = useState<'work' | 'break'>('work');

  // Quick Study Drawers
  const [showRefConstantsModal, setShowRefConstantsModal] = useState<boolean>(false);
  const [constantsTab, setConstantsTab] = useState<'constants' | 'formulas'>('constants');
  const [constantsSearchQuery, setConstantsSearchQuery] = useState<string>('');
  const [showFlashcardModal, setShowFlashcardModal] = useState<boolean>(false);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState<number>(0);
  const [flashcardDeck, setFlashcardDeck] = useState<Array<{ id: string; question: string; answer: string; flipped: boolean }>>([
    {
      id: 'fc-1',
      question: 'Tại sao chu kỳ con lắc đơn T không phụ thuộc vào khối lượng quả nặng m?',
      answer: 'Khối lượng m xuất hiện ở cả lực kéo về phục hồi (F = -m·g·sinα) và quán tính cản trở gia tốc (F = m·a). Hai giá trị m triệt tiêu lẫn nhau hoàn toàn: a = -g·sinα!',
      flipped: false
    },
    {
      id: 'fc-2',
      question: 'Tại sao liên kết hydro giữa hai mạch DNA lại là liên kết yếu nhưng cấu trúc xoắn kép vẫn siêu ổn định?',
      answer: 'Từng liên kết hydro riêng lẻ chỉ có năng lượng 1-5 kcal/mol (yếu hơn nhiều so với liên kết cộng hóa trị), nhưng hàng triệu liên kết hydro cộng gộp lại tạo nên hiệu ứng bền vững tập thể khổng lồ, đồng thời cho phép tháo xoắn dễ dàng khi nhân đôi.',
      flipped: false
    },
    {
      id: 'fc-3',
      question: 'Cách bấm phím tìm cực trị hàm số bậc 3 trên Casio fx-880 BTG?',
      answer: 'Nhấn [HOME] -> Chọn ứng dụng Equation -> Chọn Polynomial -> Bậc 3 (Degree 3) -> Nhập hệ số a,b,c,d -> Nhấn [EXE]/[OK] để xem nghiệm và cuộn xuống xem toạ độ Điểm cực đại / Cực tiểu (x, y).',
      flipped: false
    }
  ]);

  // Conversation state
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState<boolean>(false);
  const [messages, setMessages] = useState<EduAiStudyMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: `Xin chào! Tôi là **Trợ lý AI Học Tập Chuyên Sâu của Haevy Edu**, vận hành theo phương pháp **First Principles (Nguyên lý đầu tiên)** kết hợp **Tra cứu Tri thức Mở Rộng Ngoài Mạng (Google Search Grounding)**.

🎯 **Phương châm cốt lõi:**
- Tiếp nhận tài liệu nội bộ từ thư mục hoặc câu hỏi học tập bất kỳ.
- Bóc tách nguyên lý, giải thích bản chất logic và tóm tắt cô đọng.
- **Tra cứu trực tiếp thông tin bên ngoài**: Chỉ cần gõ để tìm kiếm quy chế thi mới của Bộ GD&ĐT, đề thi THPT, công bố khoa học Nobel, bảng số liệu chuẩn IUPAC...
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

  // Listen to Google Drive document selection events from ecosystem dropdown or modals
  useEffect(() => {
    const handleSelectDocEvent = (e: any) => {
      const doc = e.detail?.doc as GoogleDriveDocumentItem | undefined;
      if (doc && (!e.detail?.target || e.detail?.target === 'ai_study')) {
        setUploadedDocName(doc.name);
        setUploadedDocContent(doc.content);
        setActiveMode('document_data');
        const prompt = `Tôi vừa nạp tài liệu từ Google Drive: "${doc.name}". Hãy phân tích nguyên lý gốc rễ, giải thích bản chất logic và tóm tắt theo phương pháp First Principles.`;
        handleSubmit(prompt, 'document_data');
      }
    };
    window.addEventListener('haevy-select-study-document', handleSelectDocEvent);
    return () => window.removeEventListener('haevy-select-study-document', handleSelectDocEvent);
  }, []);

  // Handler for selecting document from Google Drive Picker Modal
  const handleSelectGoogleDriveDoc = (doc: GoogleDriveDocumentItem) => {
    setUploadedDocName(doc.name);
    setUploadedDocContent(doc.content);
    setActiveMode('document_data');
    const prompt = `Tôi vừa nạp tài liệu từ Google Drive: "${doc.name}". Hãy phân tích nguyên lý gốc rễ, giải thích bản chất logic và tóm tắt theo phương pháp First Principles.`;
    handleSubmit(prompt, 'document_data');
  };

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
      // If analyzing internal or uploaded document, use GeminiProcessorService (Gemini 3.5 Flash) directly
      if (modeToUse === 'document_data' && activeDocContent) {
        const docResult = await geminiProcessorService.processDocumentData(activeDocContent, query);
        if (docResult) {
          const assistantMsg: EduAiStudyMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            content: docResult,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            mode: modeToUse,
            suggestedLab: activeDocObj?.associatedLab,
            isWebGrounded: false
          };
          setMessages(prev => [...prev, assistantMsg]);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/edu/ai-study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest: query,
          fileContent: activeDocContent,
          fileName: activeDocName,
          mode: modeToUse,
          enableWebSearch: isWebSearchEnabled || modeToUse === 'live_search',
          history: messages.slice(-5).map(m => ({ sender: m.sender, content: m.content })),
          subject: 'Khoa học tự nhiên & Tri thức học tập tổng quát'
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
          suggestedLab: data.suggestedLab || activeDocObj?.associatedLab,
          groundingSources: data.sources,
          searchQueries: data.searchQueries,
          isWebGrounded: data.isWebGrounded
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
      const firstLine = msg.content.split('\n')[0].replace(/#+\s/g, '').slice(0, 60);
      const subject = activeDocName.toLowerCase().includes('hóa') ? 'chemistry' : activeDocName.toLowerCase().includes('sinh') ? 'biology' : 'physics';

      executeAddEduNote({
        title: firstLine || `Phân tích: ${activeDocName}`,
        subject,
        tags: ['First Principles', 'AI Phân Tích', activeDocName.slice(0, 20)],
        firstPrincipleEssence: 'Bóc tách từ trợ lý AI học tập chuyên sâu Haevy Edu',
        content: msg.content
      });

      setSavedToNotebook(prev => ({ ...prev, [msg.id]: true }));
      setTimeout(() => {
        setSavedToNotebook(prev => ({ ...prev, [msg.id]: false }));
      }, 3000);
    } catch (e) {
      console.warn('Cannot save note:', e);
    }
  };

  // 1-Click Fast Extractors (GeminiProcessorService pattern)
  const handleFastExtract = (type: 'principles' | 'pitfalls' | 'mechanism' | 'socratic' | 'summary' | 'casio880' | 'feynman' | 'thpt_tactic') => {
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
      case 'casio880':
        prompt = `Hướng dẫn chi tiết cách dùng máy tính Casio fx-880 BTG để bấm máy, tính toán và kiểm tra nghiệm các bài toán liên quan đến [${activeDocName}]. Trình bày cụ thể từng nút bấm, menu và phím tắt.`;
        mode = 'casio_fx880';
        break;
      case 'feynman':
        prompt = `Hãy giải thích toàn bộ nội dung [${activeDocName}] bằng Phương pháp Feynman: dùng ẩn dụ đời thường cực kỳ đơn giản, không dùng biệt ngữ phức tạp để ngay cả học sinh lớp 6 cũng hiểu được bản chất.`;
        mode = 'feynman_simple';
        break;
      case 'thpt_tactic':
        prompt = `Phân tích cấu trúc đề thi THPT 2027 (chương trình GDPT 2018) đối với chủ đề [${activeDocName}]: ma trận dạng câu hỏi 4 lựa chọn, câu trắc nghiệm Đúng/Sai 4 ý, câu trả lời ngắn và chiến thuật xử lý bẫy trong 30 giây.`;
        mode = 'thpt_exam_tactic';
        break;
      case 'summary':
        prompt = `Hãy tóm tắt cô đọng nhất toàn bộ kiến thức trong tài liệu [${activeDocName}] trên một khung nhìn tinh giản, loại bỏ các chi tiết rườm rà.`;
        mode = 'document_data';
        break;
    }

    handleSubmit(prompt, mode);
  };

  // Pomodoro countdown timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPomodoroActive) {
      timer = setInterval(() => {
        setPomodoroSecondsLeft(prev => {
          if (prev <= 1) {
            playFocusBellSound();
            if (pomodoroIntervalType === 'work') {
              setPomodoroIntervalType('break');
              return 5 * 60;
            } else {
              setPomodoroIntervalType('work');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPomodoroActive, pomodoroIntervalType]);

  // Handle Focus Audio Toggle
  const handleToggleFocusAudio = (mode: 'alpha' | 'beta' | 'gamma' | 'pink_noise') => {
    if (focusAudioMode === mode) {
      stopBinauralBeat();
      stopFocusPinkNoise();
      setFocusAudioMode('off');
    } else {
      stopBinauralBeat();
      stopFocusPinkNoise();
      if (mode === 'pink_noise') {
        startFocusPinkNoise();
      } else {
        startBinauralBeat(mode);
      }
      setFocusAudioMode(mode);
    }
  };

  // Handle Flashcard Flip
  const handleToggleFlipCard = (id: string) => {
    setFlashcardDeck(prev => prev.map(c => c.id === id ? { ...c, flipped: !c.flipped } : c));
  };

  // Add AI response as flashcard
  const handleAddAiMsgToFlashcard = (msg: EduAiStudyMessage) => {
    const lines = msg.content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const q = lines[0]?.slice(0, 120) || `Trọng tâm bản chất từ ${activeDocName}`;
    const a = lines.slice(1, 4).join(' ').replace(/\*\*/g, '').slice(0, 220) || msg.content.slice(0, 200);
    const newCard = {
      id: `fc-${Date.now()}`,
      question: q,
      answer: a,
      flipped: false
    };
    setFlashcardDeck(prev => [newCard, ...prev]);
    setShowFlashcardModal(true);
  };

  // Format mm:ss
  const formatPomodoroTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner / Hero (Academic Precision Standard) */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">
                  AI Trợ Lý Học Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">First Principles</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-mono font-bold tracking-wide">
                  Gemini 3.5 Flash
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-medium">
                  Bóc Tách Bản Chất
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 max-w-2xl leading-relaxed font-normal">
                Xử lý dữ liệu tài liệu nội bộ, bóc tách nguyên lý tiên đề, giải thích bản chất logic và tóm tắt cô đọng — kết nối trực tiếp phòng thí nghiệm ảo và sổ tay nghiên cứu.
              </p>
            </div>
          </div>

          {/* Quick status & action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Tài liệu nạp:</span>
                <span className="text-xs font-semibold text-emerald-400 truncate max-w-[150px]" title={activeDocName}>
                  {activeDocName}
                </span>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-zinc-800 cursor-pointer"
                title="Xem toàn văn tài liệu"
              >
                <Eye size={12} />
                <span>Xem</span>
              </button>
            </div>

            {onOpenTools && (
              <button
                onClick={() => onOpenTools('casio880')}
                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-violet-800/60 text-violet-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Mở máy tính Casio fx-880 BTG"
              >
                <Calculator size={13} className="text-violet-400" />
                <span>Casio fx-880</span>
              </button>
            )}

            {onOpenExam && (
              <button
                onClick={onOpenExam}
                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-amber-800/60 text-amber-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Mở phòng thi THPT 2027 tốc độ 30s"
              >
                <GraduationCap size={13} className="text-amber-400" />
                <span>Thi THPT 2027</span>
              </button>
            )}

            {onOpenNotebook && (
              <button
                onClick={onOpenNotebook}
                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <BookOpen size={13} className="text-purple-400" />
                <span>Sổ Tay</span>
              </button>
            )}

            {onOpenHaevyAi && (
              <button
                onClick={onOpenHaevyAi}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:from-purple-900/90 hover:to-indigo-900/90 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                title="Mở Không Gian Haevy AI Toàn Năng & Chia Sẻ Dữ Liệu Hệ Sinh Thái"
              >
                <Sparkles size={13} className="text-purple-400 animate-pulse" />
                <span>Haevy AI Toàn Năng</span>
              </button>
            )}
          </div>
        </div>

        {/* Support Options Toolbar: Audio Synthesizer, Pomodoro, Constants, Flashcards */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Audio Synthesizer Widget */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${focusAudioMode !== 'off' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                <Headphones size={14} />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold text-zinc-200 block truncate">
                  Sóng Não Tập Trung
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block truncate">
                  {focusAudioMode === 'off' ? 'Đang tắt' : focusAudioMode === 'alpha' ? 'Alpha 10Hz' : focusAudioMode === 'beta' ? 'Beta 18Hz' : focusAudioMode === 'gamma' ? 'Gamma 40Hz' : 'Pink Noise'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleToggleFocusAudio('alpha')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${focusAudioMode === 'alpha' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                title="Sóng Alpha 10Hz: Thư thái tỉnh táo"
              >
                Alpha
              </button>
              <button
                onClick={() => handleToggleFocusAudio('beta')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${focusAudioMode === 'beta' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                title="Sóng Beta 18Hz: Giải bài toán khó"
              >
                Beta
              </button>
              <button
                onClick={() => handleToggleFocusAudio('pink_noise')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${focusAudioMode === 'pink_noise' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                title="Tiếng ồn hồng: Chặn tạp âm"
              >
                Pink
              </button>
              {focusAudioMode !== 'off' && (
                <button
                  onClick={() => handleToggleFocusAudio(focusAudioMode as any)}
                  className="p-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                  title="Tắt âm thanh"
                >
                  <Square size={10} fill="currentColor" />
                </button>
              )}
            </div>
          </div>

          {/* Pomodoro Timer Widget */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${isPomodoroActive ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                <Timer size={14} />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold text-zinc-200 block truncate">
                  {pomodoroIntervalType === 'work' ? 'Pomodoro 25 Phút' : 'Giải Lao 5 Phút'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {formatPomodoroTime(pomodoroSecondsLeft)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  isPomodoroActive ? 'bg-amber-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {isPomodoroActive ? <Pause size={11} /> : <Play size={11} />}
                <span>{isPomodoroActive ? 'Tạm dừng' : 'Bắt đầu'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPomodoroActive(false);
                  setPomodoroSecondsLeft(25 * 60);
                  setPomodoroIntervalType('work');
                }}
                className="p-1 rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                title="Đặt lại 25 phút"
              >
                <RotateCw size={11} />
              </button>
            </div>
          </div>

          {/* Quick Drawers: Constants & Flashcards */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-2 py-1.5 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowRefConstantsModal(true)}
              className="flex-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 rounded-lg text-xs font-semibold text-zinc-300 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Tra cứu nhanh các hằng số khoa học & công thức chuẩn"
            >
              <Sliders size={13} className="text-emerald-400" />
              <span>Tra Hằng Số & Công Thức</span>
            </button>
            <button
              onClick={() => setShowFlashcardModal(true)}
              className="flex-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 rounded-lg text-xs font-semibold text-zinc-300 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Ôn tập nhanh với bộ flashcard bản chất"
            >
              <Layers size={13} className="text-indigo-400" />
              <span>Bộ Thẻ ({flashcardDeck.length})</span>
            </button>
          </div>
        </div>

        {/* Study Modes Pill Selector (Expanded with Casio 880, Feynman, THPT 2027) */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 mr-1.5 flex items-center gap-1.5 shrink-0">
            <Sparkles size={13} className="text-emerald-400" />
            Phương Pháp Học Tập:
          </span>

          <button
            onClick={() => setActiveMode('first_principles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'first_principles'
                ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Lightbulb size={13} className={activeMode === 'first_principles' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>1. Nguyên Lý Gốc</span>
          </button>

          <button
            onClick={() => setActiveMode('casio_fx880')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'casio_fx880'
                ? 'bg-zinc-800 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Calculator size={13} className={activeMode === 'casio_fx880' ? 'text-violet-400' : 'text-zinc-500'} />
            <span>2. Bấm Casio fx-880</span>
          </button>

          <button
            onClick={() => setActiveMode('feynman_simple')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'feynman_simple'
                ? 'bg-zinc-800 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Sparkles size={13} className={activeMode === 'feynman_simple' ? 'text-pink-400' : 'text-zinc-500'} />
            <span>3. Feynman Đời Thường</span>
          </button>

          <button
            onClick={() => setActiveMode('thpt_exam_tactic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'thpt_exam_tactic'
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <GraduationCap size={13} className={activeMode === 'thpt_exam_tactic' ? 'text-amber-400' : 'text-zinc-500'} />
            <span>4. Bẫy Thi THPT 2027</span>
          </button>

          <button
            onClick={() => setActiveMode('socratic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'socratic'
                ? 'bg-zinc-800 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <HelpCircle size={13} className={activeMode === 'socratic' ? 'text-teal-400' : 'text-zinc-500'} />
            <span>5. Đối Thoại Socratic</span>
          </button>

          <button
            onClick={() => setActiveMode('document_data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'document_data'
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <FolderOpen size={13} className={activeMode === 'document_data' ? 'text-cyan-400' : 'text-zinc-500'} />
            <span>6. Xử Lý Giáo Trình</span>
          </button>

          <button
            onClick={() => setActiveMode('step_by_step')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'step_by_step'
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Cpu size={13} className={activeMode === 'step_by_step' ? 'text-amber-400' : 'text-zinc-500'} />
            <span>7. Giải Bản Chất</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('live_search');
              setIsWebSearchEnabled(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'live_search'
                ? 'bg-zinc-800 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-zinc-950/60 border border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Globe size={13} className={activeMode === 'live_search' ? 'text-blue-400 animate-pulse' : 'text-zinc-500'} />
            <span>8. Tra Cứu Ngoài (Live Web)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">Google</span>
          </button>
        </div>

        {/* 1-Click Fast Extractors Bar (Expanded Actions) */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 touch-pan-x">
          <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 mr-1 shrink-0">
            <Zap size={12} className="text-emerald-400" />
            Bóc Tách Nhanh:
          </span>

          <button
            onClick={() => handleFastExtract('principles')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Lightbulb size={12} className="text-emerald-400" />
            <span>3 Tiên Đề Gốc</span>
          </button>

          <button
            onClick={() => handleFastExtract('casio880')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800/60 rounded-lg text-xs font-medium text-violet-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Calculator size={12} className="text-violet-400" />
            <span>Bấm Casio 880</span>
          </button>

          <button
            onClick={() => handleFastExtract('feynman')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-pink-950/60 hover:bg-pink-900/60 border border-pink-800/60 rounded-lg text-xs font-medium text-pink-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={12} className="text-pink-400" />
            <span>Feynman Đời Thường</span>
          </button>

          <button
            onClick={() => handleFastExtract('thpt_tactic')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg text-xs font-medium text-amber-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <GraduationCap size={12} className="text-amber-400" />
            <span>Né Bẫy THPT 2027</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('live_search');
              setIsWebSearchEnabled(true);
              handleSubmit(`Tra cứu thông tin bên ngoài và các nghiên cứu khoa học mới nhất liên quan đến chủ đề: ${activeDocName}`, 'live_search');
            }}
            disabled={isLoading}
            className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-700/60 rounded-lg text-xs font-medium text-blue-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Tra cứu thông tin, bài báo khoa học và dữ liệu mới nhất trên Internet"
          >
            <Globe size={12} className="text-blue-400" />
            <span>Tra Cứu Web Về Chủ Đề Này</span>
          </button>

          <button
            onClick={() => handleFastExtract('pitfalls')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <AlertTriangle size={12} className="text-amber-400" />
            <span>Cạm Bẫy Học Vẹt</span>
          </button>

          <button
            onClick={() => handleFastExtract('mechanism')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Cpu size={12} className="text-cyan-400" />
            <span>Cơ Chế Tại Sao</span>
          </button>

          <button
            onClick={() => handleFastExtract('socratic')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <HelpCircle size={12} className="text-teal-400" />
            <span>3 Câu Hỏi Socratic</span>
          </button>

          <button
            onClick={() => handleFastExtract('summary')}
            disabled={isLoading}
            className="px-2.5 py-1 bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <FileText size={12} className="text-purple-400" />
            <span>Tóm Tắt 1 Trang</span>
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

            {/* Custom File Upload & Google Drive Ingestion Options */}
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrivePickerOpen(true)}
                  className="flex-1 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                  title="Lấy file tài liệu giáo trình từ Google Drive"
                >
                  <HardDrive size={14} className="text-amber-400 shrink-0" />
                  <span>Lấy từ Google Drive</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-2.5 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/70 rounded-xl text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Nạp file văn bản từ máy tính"
                >
                  <Upload size={13} className="text-emerald-400" />
                  <span>Tệp máy</span>
                </button>

                {uploadedDocName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedDocName(null);
                      setUploadedDocContent(null);
                    }}
                    className="p-2 bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 border border-zinc-700 rounded-xl text-zinc-400 transition-colors cursor-pointer"
                    title="Hủy tệp hiện tại"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {uploadedDocName && (
                <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Đang dùng: {uploadedDocName}</span>
                </div>
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
        <div className="lg:col-span-8 flex flex-col h-[560px] sm:h-[680px] lg:h-[780px] bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-950">
          
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

                    {/* Live Web Grounding Sources & Search Queries if present */}
                    {!isUser && msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-zinc-800/80 bg-zinc-900/50 rounded-xl p-3 border border-blue-900/30">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                            <Globe size={13} className="text-blue-400" />
                            <span>Dữ Liệu & Nguồn Tra Cứu Bên Ngoài ({msg.groundingSources.length}):</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                            Google Search Grounding
                          </span>
                        </div>

                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                              <Search size={10} />
                              Truy vấn:
                            </span>
                            {msg.searchQueries.map((q, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                                {q}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {msg.groundingSources.map((source, sIdx) => {
                            let domain = '';
                            try {
                              domain = new URL(source.url).hostname.replace(/^www\./, '');
                            } catch {
                              domain = 'Web Source';
                            }
                            return (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2 p-2 bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-blue-500/40 rounded-lg text-xs text-zinc-300 hover:text-white transition-all group"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-blue-400 font-mono shrink-0">
                                    {domain}
                                  </span>
                                  <span className="truncate text-[11px] font-medium group-hover:text-blue-200">
                                    {source.title}
                                  </span>
                                </div>
                                <ExternalLink size={12} className="shrink-0 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

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

                        {/* Copy, Flashcard & Save to Notebook */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddAiMsgToFlashcard(msg)}
                            className="p-1.5 hover:text-indigo-300 hover:bg-zinc-800/80 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                            title="Tạo thẻ nhớ flashcard từ phân tích này"
                          >
                            <Layers size={13} className="text-indigo-400" />
                            <span className="hidden sm:inline">Lưu Thẻ</span>
                          </button>

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
            {/* Active Attachment & Mode Badge */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <div className="flex items-center gap-1.5 truncate">
                <FileText size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">
                  Dữ liệu tài liệu đang gắn: <strong className="text-zinc-200">{activeDocName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(isWebSearchEnabled || activeMode === 'live_search') && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                    <Globe size={10} className="text-blue-400 animate-spin" />
                    Live Web Grounding
                  </span>
                )}
                <span className="text-[10px] font-mono text-zinc-500">
                  {activeMode === 'first_principles' ? '🔍 Bóc tách bản chất' : activeMode === 'socratic' ? '🧠 Gợi mở tư duy' : activeMode === 'document_data' ? '📄 Xử lý tài liệu' : activeMode === 'live_search' ? '🌐 Tra cứu bên ngoài' : '✍️ Giải từng bước'}
                </span>
              </div>
            </div>

            {/* Quick External Knowledge Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-[11px] touch-pan-x">
              <span className="text-zinc-500 shrink-0 flex items-center gap-1 text-[10px]">
                <Search size={10} className="text-blue-400" />
                Tra cứu nhanh:
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsWebSearchEnabled(true);
                  setInputQuery('Cấu trúc đề thi tốt nghiệp THPT 2025 mới nhất của Bộ Giáo dục và Đào tạo');
                  handleSubmit('Cấu trúc đề thi tốt nghiệp THPT 2025 mới nhất của Bộ Giáo dục và Đào tạo', 'live_search');
                }}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-300 shrink-0 transition-colors cursor-pointer"
              >
                📜 Quy chế thi Bộ GD&ĐT
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWebSearchEnabled(true);
                  setInputQuery('Bảng tuần hoàn các nguyên tố hóa học số liệu chuẩn IUPAC mới nhất');
                  handleSubmit('Bảng tuần hoàn các nguyên tố hóa học số liệu chuẩn IUPAC mới nhất', 'live_search');
                }}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-300 shrink-0 transition-colors cursor-pointer"
              >
                🧪 Bảng tuần hoàn chuẩn IUPAC
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWebSearchEnabled(true);
                  setInputQuery('Phát hiện mới nhất về vật lý thiên văn và kính James Webb');
                  handleSubmit('Phát hiện mới nhất về vật lý thiên văn và kính James Webb', 'live_search');
                }}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-300 shrink-0 transition-colors cursor-pointer"
              >
                🔭 Khám phá James Webb
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWebSearchEnabled(true);
                  setInputQuery('Ứng dụng công nghệ chỉnh sửa gen CRISPR-Cas9 đoạt giải Nobel');
                  handleSubmit('Ứng dụng công nghệ chỉnh sửa gen CRISPR-Cas9 đoạt giải Nobel', 'live_search');
                }}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-300 shrink-0 transition-colors cursor-pointer"
              >
                🧬 Nobel CRISPR-Cas9
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex items-center gap-2"
            >
              {/* Web Search Toggle Button */}
              <button
                type="button"
                onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                className={`px-3 py-3 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                  isWebSearchEnabled || activeMode === 'live_search'
                    ? 'bg-blue-950/80 border-blue-500/60 text-blue-300 shadow-sm shadow-blue-950/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
                title={isWebSearchEnabled || activeMode === 'live_search' ? 'Đang bật tra cứu Internet trực tiếp (Google Search)' : 'Bấm để bật tra cứu dữ liệu thực tế bên ngoài qua Google Search'}
              >
                <Globe size={15} className={isWebSearchEnabled || activeMode === 'live_search' ? 'text-blue-400' : 'text-zinc-500'} />
                <span className="hidden sm:inline text-[11px] font-mono">
                  {isWebSearchEnabled || activeMode === 'live_search' ? 'Web: BẬT' : 'Web: TẮT'}
                </span>
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isWebSearchEnabled || activeMode === 'live_search'
                    ? 'Gõ bất kỳ thông tin bên ngoài cần tìm: Quy chế thi mới, Nobel, tài liệu nghiên cứu, chuẩn IUPAC...'
                    : activeMode === 'first_principles'
                    ? 'Hỏi về bản chất: Tại sao lại có công thức này? Hiện tượng này do đâu?'
                    : activeMode === 'socratic'
                    ? 'Nhập vấn đề bạn đang thắc mắc để cùng suy luận từng bước...'
                    : activeMode === 'document_data'
                    ? 'Yêu cầu xử lý tài liệu: Tóm tắt 3 tiên đề gốc, tìm điểm mâu thuẫn...'
                    : 'Nhập đề bài tập để giải theo bản chất logic...'
                }
                disabled={isLoading}
                className={`flex-1 bg-zinc-900 border rounded-2xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
                  isWebSearchEnabled || activeMode === 'live_search'
                    ? 'border-blue-500/40 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/40'
                    : 'border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50'
                }`}
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className={`p-3 font-bold rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer ${
                  isWebSearchEnabled || activeMode === 'live_search'
                    ? 'bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:hover:bg-blue-500 text-zinc-950 shadow-blue-950/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 shadow-emerald-950/40'
                }`}
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

      {/* Scientific Constants & Axiomatic Formulas Reference Modal */}
      {showRefConstantsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <Sliders size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">Tra Cứu Hằng Số Khoa Học & Công Thức Tiên Đề</h3>
                  <p className="text-xs text-zinc-400">Chuẩn số liệu CODATA & Bộ Giáo Dục - Bấm để chèn nhanh vào câu hỏi</p>
                </div>
              </div>
              <button
                onClick={() => setShowRefConstantsModal(false)}
                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-nav & Search Filter */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setConstantsTab('constants')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    constantsTab === 'constants'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Hằng Số Chuẩn ({SCIENCE_CONSTANTS.length})
                </button>
                <button
                  onClick={() => setConstantsTab('formulas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    constantsTab === 'formulas'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Công Thức Tiên Đề ({CORE_FORMULAS.length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={constantsSearchQuery}
                  onChange={(e) => setConstantsSearchQuery(e.target.value)}
                  placeholder="Tìm tên, ký hiệu, công thức..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {constantsTab === 'constants' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SCIENCE_CONSTANTS.filter(c =>
                    c.name.toLowerCase().includes(constantsSearchQuery.toLowerCase()) ||
                    c.symbol.toLowerCase().includes(constantsSearchQuery.toLowerCase()) ||
                    c.field.toLowerCase().includes(constantsSearchQuery.toLowerCase())
                  ).map((c, idx) => (
                    <div key={idx} className="bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-mono text-emerald-400">{c.symbol}</span>
                            <span className="text-xs font-bold text-zinc-200">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">{c.field}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                          {c.unit}
                        </span>
                      </div>
                      <div className="bg-zinc-950/80 rounded-xl px-3 py-2 border border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-zinc-100">{c.value}</span>
                        <button
                          onClick={() => {
                            setInputQuery(prev => prev ? `${prev} [${c.symbol} = ${c.value} ${c.unit}]` : `Giá trị ${c.name} (${c.symbol} = ${c.value} ${c.unit})`);
                            setShowRefConstantsModal(false);
                          }}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Chèn vào hỏi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {CORE_FORMULAS.filter(f =>
                    f.name.toLowerCase().includes(constantsSearchQuery.toLowerCase()) ||
                    f.formula.toLowerCase().includes(constantsSearchQuery.toLowerCase()) ||
                    f.essence.toLowerCase().includes(constantsSearchQuery.toLowerCase())
                  ).map((f, idx) => (
                    <div key={idx} className="bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 text-[10px] font-mono font-bold">
                            {f.subject.toUpperCase()}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100">{f.name}</h4>
                        </div>
                        <div className="font-mono text-sm font-bold text-amber-400 bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800/80 inline-block">
                          {f.formula}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                          💡 <span className="text-zinc-300 font-medium">Bản chất tiên đề:</span> {f.essence}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setShowRefConstantsModal(false);
                            handleSubmit(`Hãy dùng First Principles để bóc tách bản chất tiên đề của công thức ${f.formula} (${f.name}) và chỉ ra tại sao công thức này lại có dạng toán học như vậy?`, 'first_principles');
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Hỏi AI Bóc Tách
                        </button>
                        <button
                          onClick={() => {
                            setInputQuery(prev => prev ? `${prev} [Công thức: ${f.formula}]` : `Bài toán áp dụng công thức ${f.formula}: `);
                            setShowRefConstantsModal(false);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Chèn công thức
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Flashcard Deck Modal */}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-indigo-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">Bộ Thẻ Ghi Nhớ Bản Chất (Flashcards)</h3>
                  <p className="text-xs text-zinc-400">
                    Thẻ {activeFlashcardIndex + 1} / {flashcardDeck.length} • Chạm thẻ để lật đáp án
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFlashcardModal(false)}
                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Flashcard Body */}
            <div className="p-6 flex flex-col items-center">
              {flashcardDeck.length > 0 && flashcardDeck[activeFlashcardIndex] ? (
                <div
                  onClick={() => handleToggleFlipCard(flashcardDeck[activeFlashcardIndex].id)}
                  className={`w-full min-h-[260px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer border shadow-xl relative overflow-hidden select-none ${
                    flashcardDeck[activeFlashcardIndex].flipped
                      ? 'bg-gradient-to-br from-indigo-950/80 to-zinc-950 border-indigo-500/50 text-indigo-100 shadow-indigo-950/30'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      flashcardDeck[activeFlashcardIndex].flipped ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {flashcardDeck[activeFlashcardIndex].flipped ? '💡 Bản Chất Cốt Lõi' : '❓ Câu Hỏi Tự Vấn'}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                      <RotateCw size={11} />
                      Bấm để lật
                    </span>
                  </div>

                  <div className="my-auto py-4">
                    <p className="text-sm sm:text-base leading-relaxed font-semibold">
                      {flashcardDeck[activeFlashcardIndex].flipped
                        ? flashcardDeck[activeFlashcardIndex].answer
                        : flashcardDeck[activeFlashcardIndex].question}
                    </p>
                  </div>

                  <div className="text-[11px] text-zinc-500 text-center italic">
                    {flashcardDeck[activeFlashcardIndex].flipped
                      ? 'Đã hiểu bản chất? Chuyển sang thẻ tiếp theo để kiểm tra phản xạ'
                      : 'Hãy tự suy luận nguyên lý trong đầu trước khi lật thẻ'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  Chưa có thẻ flashcard nào trong bộ nhớ.
                </div>
              )}

              {/* Navigation Controls */}
              <div className="mt-5 flex items-center justify-between w-full gap-3">
                <button
                  onClick={() => {
                    setActiveFlashcardIndex(prev => (prev > 0 ? prev - 1 : flashcardDeck.length - 1));
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Thẻ Trước
                </button>

                <button
                  onClick={() => {
                    if (flashcardDeck[activeFlashcardIndex]) {
                      handleToggleFlipCard(flashcardDeck[activeFlashcardIndex].id);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw size={12} />
                  <span>Lật Thẻ</span>
                </button>

                <button
                  onClick={() => {
                    setActiveFlashcardIndex(prev => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Thẻ Kế Tiếp
                </button>
              </div>

              {/* Ask AI about this flashcard */}
              {flashcardDeck[activeFlashcardIndex] && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full flex items-center justify-center">
                  <button
                    onClick={() => {
                      const card = flashcardDeck[activeFlashcardIndex];
                      setShowFlashcardModal(false);
                      handleSubmit(`Bóc tách chi tiết bản chất logic của vấn đề sau: ${card.question}`, 'first_principles');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Yêu cầu Haevy AI phân tích sâu hơn về câu này</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Document Picker Modal */}
      <GoogleDriveDocumentPickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSelectDocumentForAI={handleSelectGoogleDriveDoc}
      />
    </div>
  );
}
