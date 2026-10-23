import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  GitFork,
  Kanban,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  Calculator,
  Timer,
  Search,
  Volume2,
  VolumeX,
  ChevronRight,
  Trash2,
  ArrowRight,
  Flame,
  AlertTriangle,
  Check,
  Eye
} from 'lucide-react';
import { haptics } from '../../utils/haptics';

export type WorkspaceToolTab = 'flashcards' | 'mindmap' | 'kanban_pomodoro' | 'formulas';

interface FlashcardItem {
  id: string;
  subject: 'physics' | 'chemistry' | 'biology' | 'math' | 'english';
  subjectLabel: string;
  front: string;
  back: string;
  firstPrincipleNote: string;
  boxLevel: number; // 0 = New/Again, 1 = Hard (1d), 2 = Good (3d), 3 = Easy (7d)
  nextReviewLabel: string;
}

const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    subject: 'physics',
    subjectLabel: 'Vật Lý 12',
    front: 'Chu kỳ dao động của con lắc đơn T = 2π√(L/g) phụ thuộc vào những đại lượng nào? Nếu tăng khối lượng quả nặng gấp 4 lần thì chu kỳ thay đổi ra sao?',
    back: 'Chu kỳ T CHỈ phụ thuộc vào chiều dài dây treo L và gia tốc trọng trường g tại nơi đặt con lắc. Tăng khối lượng m gấp 4 lần thì chu kỳ T KHÔNG ĐỔI.',
    firstPrincipleNote: 'Bản chất: Lực kéo về F = -mg·sin(α) tỉ lệ thuận với m, nhưng quán tính a = F/m lại chia cho m nên khối lượng tự triệt tiêu (m_hấp_dẫn = m_quán_tính).',
    boxLevel: 0,
    nextReviewLabel: 'Cần ôn ngay'
  },
  {
    id: 'fc_2',
    subject: 'physics',
    subjectLabel: 'Vật Lý 12',
    front: 'Điều kiện để có cực đại và cực tiểu giao thoa của hai nguồn sóng kết hợp cùng pha là gì?',
    back: '• Cực đại giao thoa: d₂ - d₁ = kλ\n• Cực tiểu giao thoa: d₂ - d₁ = (k + 0.5)λ (với k ∈ ℤ)',
    firstPrincipleNote: 'Bản chất: Khi hiệu đường đi bằng số nguyên lần bước sóng, hai sóng tới điểm M luôn cùng pha và cộng hưởng biên độ A_max = A₁ + A₂.',
    boxLevel: 1,
    nextReviewLabel: '1 ngày'
  },
  {
    id: 'fc_3',
    subject: 'chemistry',
    subjectLabel: 'Hóa Học 12',
    front: 'Nguyên lý chuyển dịch cân bằng Le Chatelier phát biểu như thế nào khi tăng nhiệt độ của hệ phản ứng tỏa nhiệt (ΔH < 0)?',
    back: 'Khi tăng nhiệt độ, cân bằng sẽ chuyển dịch theo chiều phản ứng THU NHIỆT (tức là chiều nghịch đối với phản ứng có ΔH < 0) để chống lại tác động tăng nhiệt.',
    firstPrincipleNote: 'Bẫy hay gặp: Chất xúc tác KHÔNG làm chuyển dịch cân bằng hóa học, chỉ giúp hệ đạt trạng thái cân bằng nhanh hơn.',
    boxLevel: 0,
    nextReviewLabel: 'Cần ôn ngay'
  },
  {
    id: 'fc_4',
    subject: 'biology',
    subjectLabel: 'Sinh Học 12',
    front: 'Trong quá trình nhân đôi ADN, vì sao mạch mới thứ hai (mạch ra chậm) lại được tổng hợp ngắt quãng thành các đoạn Okazaki?',
    back: 'Vì ADN polymerase chỉ có thể gắn thêm nucleotit vào đầu 3\'-OH tự do (tổng hợp theo chiều 5\' → 3\'), trong khi hai mạch khuôn của ADN có chiều ngược nhau.',
    firstPrincipleNote: 'Bản chất cấu trúc hóa học: Liên kết phosphodiester đòi hỏi nhóm 3\'-OH tấn công vào nhóm phosphate 5\' của dNTP mới.',
    boxLevel: 2,
    nextReviewLabel: '3 ngày'
  },
  {
    id: 'fc_5',
    subject: 'math',
    subjectLabel: 'Toán 12',
    front: 'Điều kiện cần và đủ để hàm số y = f(x) có cực trị tại điểm x₀ (khi f có đạo hàm tại x₀) là gì?',
    back: 'f\'(x₀) = 0 VÀ đạo hàm f\'(x) phải ĐỔI DẤU khi x đi qua x₀ (từ + sang - là cực đại, từ - sang + là cực tiểu).',
    firstPrincipleNote: 'Bẫy học vẹt: f\'(x₀) = 0 chỉ là điều kiện cần. Ví dụ y = x³ có y\'(0) = 0 nhưng không đổi dấu qua 0 nên không có cực trị.',
    boxLevel: 0,
    nextReviewLabel: 'Cần ôn ngay'
  }
];

interface MindmapNode {
  id: string;
  title: string;
  formula?: string;
  principle: string;
  trap?: string;
  children?: MindmapNode[];
}

const MINDMAP_TOPICS: Record<string, { subject: string; root: MindmapNode }> = {
  pendulum_waves: {
    subject: 'Vật Lý: Dao Động & Sóng Cơ',
    root: {
      id: 'root_phys',
      title: 'Dao Động Điều Hòa & Sóng Cơ Học',
      formula: 'x = A·cos(ωt + φ)',
      principle: 'Mọi dao động điều hòa đều là hình chiếu của chuyển động tròn đều lên một trục đường kính. Năng lượng dao động tỉ lệ với bình phương biên độ (W = ½kA²).',
      trap: 'Tần số góc ω phụ thuộc vào đặc tính hệ (√(k/m) hoặc √(g/L)), KHÔNG phụ thuộc vào cách kích thích ban đầu.',
      children: [
        {
          id: 'node_p1',
          title: '1. Con Lắc Lò Xo & Con Lắc Đơn',
          formula: 'T_lx = 2π√(m/k)  |  T_đơn = 2π√(L/g)',
          principle: 'Lực kéo về luôn hướng về vị trí cân bằng và tỉ lệ với li độ: F = -kx.',
          trap: 'Chu kỳ con lắc đơn không phụ thuộc vào khối lượng m.'
        },
        {
          id: 'node_p2',
          title: '2. Năng Lượng Dao Động',
          formula: 'W = W_đ + W_t = ½mω²A² = const',
          principle: 'Động năng và thế năng biến thiên tuần hoàn với tần số góc 2ω (tần số 2f, chu kỳ T/2).',
          trap: 'Cơ năng W bảo toàn nếu bỏ qua ma sát, không biến thiên điều hòa.'
        },
        {
          id: 'node_p3',
          title: '3. Giao Thoa & Sóng Dừng',
          formula: 'Δd = kλ (Cực đại) | L = k·(λ/2) (Hai đầu cố định)',
          principle: 'Sóng cơ là sự lan truyền pha dao động và năng lượng, các phần tử môi trường chỉ dao động quanh vị trí cân bằng.',
          trap: 'Khoảng cách giữa 2 bụng sóng hoặc 2 nút sóng liên tiếp là λ/2 (không phải λ).'
        }
      ]
    }
  },
  calculus_math: {
    subject: 'Toán 12: Hàm Số & Tích Phân',
    root: {
      id: 'root_math',
      title: 'Khảo Sát Hàm Số & Nguyên Hàm Tích Phân',
      formula: 'y\' = lim(Δy/Δx)  |  ∫_a^b f(x)dx = F(b) - F(a)',
      principle: 'Đạo hàm biểu thị tốc độ biến thiên tức thời (hệ số góc tiếp tuyến), còn Tích phân là tổng diện tích vô hạn các dải vi phân cực nhỏ.',
      trap: 'Khi tìm tiệm cận ngang/đứng của hàm phân thức, phải xét giới hạn chứ không chỉ nhìn mẫu số bằng 0.',
      children: [
        {
          id: 'node_m1',
          title: '1. Tính Đơn Điệu & Cực Trị',
          formula: 'f\'(x) ≥ 0 ∀x ∈ K ⇒ Đồng biến trên K',
          principle: 'Dấu của đạo hàm bậc nhất quyết định chiều biến thiên của đồ thị hàm số.',
          trap: 'Hàm bậc nhất trên bậc nhất y = (ax+b)/(cx+d) luôn đơn điệu trên từng khoảng xác định, KHÔNG có cực trị.'
        },
        {
          id: 'node_m2',
          title: '2. Giá Trị Lớn Nhất & Nhỏ Nhất (Min-Max)',
          formula: 'Max/Min trên đoạn [a; b]',
          principle: 'Trên đoạn đóng và liên tục, GTLN/GTNN chỉ đạt tại các điểm cực trị trong khoảng (a;b) hoặc tại hai đầu mút a, b.'
        },
        {
          id: 'node_m3',
          title: '3. Ứng Dụng Tích Phân Tính Diện Tích & Thể Tích',
          formula: 'S = ∫|f(x) - g(x)|dx  |  V = π∫[f(x)]²dx',
          principle: 'Cắt vật thể bằng mặt phẳng vuông góc trục Ox tại x có thiết diện S(x), thể tích là V = ∫S(x)dx.',
          trap: 'Quên nhân hệ số π trong công thức thể tích khối tròn xoay.'
        }
      ]
    }
  },
  chem_equilibrium: {
    subject: 'Hóa Học: Cân Bằng & Pin Điện Hóa',
    root: {
      id: 'root_chem',
      title: 'Cân Bằng Hóa Học, pH & Pin Điện Galvanic',
      formula: 'K_c = [C]^c[D]^d / ([A]^a[B]^b)  |  E°_pin = E°_catot - E°_anot',
      principle: 'Cân bằng hóa học là cân bằng ĐỘNG khi tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (v_t = v_n > 0).',
      trap: 'Hằng số cân bằng K_c chỉ phụ thuộc vào nhiệt độ T, không phụ thuộc nồng độ ban đầu.',
      children: [
        {
          id: 'node_c1',
          title: '1. Nguyên Lý Le Chatelier',
          formula: 'Tăng P → Chiều giảm số mol khí | Tăng T → Chiều thu nhiệt',
          principle: 'Hệ ở trạng thái cân bằng luôn tự điều chỉnh để giảm thiểu tác động từ bên ngoài.'
        },
        {
          id: 'node_c2',
          title: '2. Pin Điện Hóa & Dãy Điện Hóa',
          formula: 'Anode (-): Oxi hóa kim loại mạnh | Cathode (+): Khử ion kim loại yếu',
          principle: 'Dòng electron di chuyển từ cực Âm (kim loại có thế điện cực chuẩn nhỏ hơn) sang cực Dương qua dây dẫn ngoài.'
        }
      ]
    }
  }
};

interface KanbanTask {
  id: string;
  title: string;
  subject: string;
  status: 'todo' | 'doing' | 'done';
  pomodoroTarget: number;
  pomodoroCompleted: number;
}

const INITIAL_KANBAN_TASKS: KanbanTask[] = [
  {
    id: 'kt_1',
    title: 'Nắm vững bản chất Giao thoa sóng cơ & Sóng dừng (Vật Lý 12)',
    subject: 'Vật Lý',
    status: 'doing',
    pomodoroTarget: 2,
    pomodoroCompleted: 1
  },
  {
    id: 'kt_2',
    title: 'Làm 15 câu trắc nghiệm Cực trị & Tiệm cận hàm số (Toán 12)',
    subject: 'Toán Học',
    status: 'todo',
    pomodoroTarget: 2,
    pomodoroCompleted: 0
  },
  {
    id: 'kt_3',
    title: 'Ôn tập Flashcard Cơ chế nhân đôi ADN & Phiên mã (Sinh 12)',
    subject: 'Sinh Học',
    status: 'todo',
    pomodoroTarget: 1,
    pomodoroCompleted: 0
  },
  {
    id: 'kt_4',
    title: 'Thực hành thí nghiệm 3D Pin Điện Hóa Daniell Zn-Cu',
    subject: 'Hóa Học',
    status: 'done',
    pomodoroTarget: 1,
    pomodoroCompleted: 1
  }
];

const FORMULA_HANDBOOK = [
  {
    id: 'fm_1',
    subject: 'Vật Lý',
    title: 'Công thức Độc lập thời gian trong Dao động điều hòa',
    formula: '(x / A)² + (v / ωA)² = 1   ⇔   A² = x² + v² / ω²',
    variables: 'x: li độ (cm), v: vận tốc (cm/s), A: biên độ (cm), ω: tần số góc (rad/s)',
    principle: 'Xuất phát từ hệ thức lượng giác sin²(φ) + cos²(φ) = 1 vì vận tốc v sớm pha π/2 so với li độ x.',
    trap: 'Đổi cùng đơn vị đo (cm và cm/s hoặc m và m/s) trước khi thay số.'
  },
  {
    id: 'fm_2',
    subject: 'Vật Lý',
    title: 'Bước sóng & Khoảng vân Giao thoa',
    formula: 'λ = v · T = v / f   |   Δd = d₂ - d₁ = kλ',
    variables: 'λ: bước sóng, v: tốc độ truyền sóng, f: tần số (Hz)',
    principle: 'Bước sóng là quãng đường sóng truyền đi được trong đúng 1 chu kỳ dao động T.',
    trap: 'Khi sóng truyền từ môi trường này sang môi trường khác, tần số f KHÔNG ĐỔI, chỉ có v và λ thay đổi.'
  },
  {
    id: 'fm_3',
    subject: 'Toán Học',
    title: 'Đạo hàm hàm hợp & Tích phân từng phần',
    formula: '[u(x)]\' = u\'(x)·f\'(u)   |   ∫u·dv = u·v - ∫v·du',
    variables: 'Thứ tự ưu tiên đặt u: "Nhất lô (ln) - Nhì đa (đa thức) - Tam lượng (sin/cos) - Tứ mũ (e^x)"',
    principle: 'Tích phân từng phần chính là phép lấy nguyên hàm ngược của quy tắc đạo hàm tích (u·v)\' = u\'v + uv\'.',
    trap: 'Đừng quên đổi cận khi tính tích phân xác định bằng phương pháp đổi biến số.'
  },
  {
    id: 'fm_4',
    subject: 'Hóa Học',
    title: 'Định luật Faraday về Điện phân & Suất điện động Pin',
    formula: 'm = (A · I · t) / (n · F)   với F = 96500 C/mol',
    variables: 'm: khối lượng chất giải phóng (g), A: nguyên tử khối, I: cường độ dòng điện (A), t: thời gian (giây), n: số electron trao đổi',
    principle: 'Số mol electron trao đổi tại điện cực n_e = (I · t) / 96500.',
    trap: 'Thời gian t bắt buộc phải đổi ra GIÂY (s), không để đơn vị phút hay giờ.'
  },
  {
    id: 'fm_5',
    subject: 'Sinh Học',
    title: 'Định luật Cân bằng di truyền Hardy-Weinberg',
    formula: 'p² (AA) + 2pq (Aa) + q² (aa) = 1   với p + q = 1',
    variables: 'p: tần số alen trội A, q: tần số alen lặn a',
    principle: 'Trong quần thể ngẫu phối kích thước lớn, không có đột biến/chọn lọc/di nhập gen, tần số alen và thành phần kiểu gen duy trì không đổi qua các thế hệ.',
    trap: 'Muốn tìm tần số alen lặn q từ kiểu hình lặn (aa), lấy căn bậc hai: q = √(tỉ lệ kiểu hình lặn).'
  }
];

interface EduWorkspaceToolkitViewProps {
  onOpenAiAssistant?: (prompt: string) => void;
  onOpenExamPrep?: () => void;
  onOpenCasio?: () => void;
  onRecordActivity?: (source: any, customXp?: number, label?: string) => void;
}

export function EduWorkspaceToolkitView({
  onOpenAiAssistant,
  onOpenExamPrep,
  onOpenCasio,
  onRecordActivity
}: EduWorkspaceToolkitViewProps) {
  const [activeTool, setActiveTool] = useState<WorkspaceToolTab>('flashcards');

  // ---------------- 1. FLASHCARDS SRS STATE ----------------
  const [cards, setCards] = useState<FlashcardItem[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_edu_srs_cards_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FLASHCARDS;
  });
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardPrinciple, setNewCardPrinciple] = useState('');
  const [newCardSubject, setNewCardSubject] = useState<FlashcardItem['subject']>('physics');

  useEffect(() => {
    try {
      localStorage.setItem('haevy_edu_srs_cards_v1', JSON.stringify(cards));
    } catch {}
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (selectedSubjectFilter === 'all') return cards;
    return cards.filter(c => c.subject === selectedSubjectFilter);
  }, [cards, selectedSubjectFilter]);

  const activeCard = filteredCards[currentCardIdx] || filteredCards[0];

  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeCard) return;
    haptics?.selection?.();

    const nextBox = rating === 'again' ? 0 : rating === 'hard' ? 1 : rating === 'good' ? 2 : 3;
    const nextLabel = rating === 'again' ? '10 phút' : rating === 'hard' ? '1 ngày' : rating === 'good' ? '3 ngày' : '7 ngày';

    setCards(prev =>
      prev.map(c => (c.id === activeCard.id ? { ...c, boxLevel: nextBox, nextReviewLabel: nextLabel } : c))
    );
    onRecordActivity?.('quiz_passed', 15, `Ôn thẻ SRS: ${activeCard.subjectLabel}`);
    setIsCardFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx(prev => (prev + 1) % Math.max(1, filteredCards.length));
    }, 150);
  };

  const handleCreateFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    const subjectLabels: Record<FlashcardItem['subject'], string> = {
      physics: 'Vật Lý 12',
      chemistry: 'Hóa Học 12',
      biology: 'Sinh Học 12',
      math: 'Toán 12',
      english: 'Tiếng Anh'
    };
    const created: FlashcardItem = {
      id: `fc_${Date.now()}`,
      subject: newCardSubject,
      subjectLabel: subjectLabels[newCardSubject],
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      firstPrincipleNote: newCardPrinciple.trim() || 'Hiểu rõ nguyên lý gốc thay vì học thuộc lòng công thức.',
      boxLevel: 0,
      nextReviewLabel: 'Cần ôn ngay'
    };
    setCards(prev => [created, ...prev]);
    setNewCardFront('');
    setNewCardBack('');
    setNewCardPrinciple('');
    setIsAddingCard(false);
    setCurrentCardIdx(0);
    haptics?.success?.();
  };

  // ---------------- 2. MINDMAP STATE ----------------
  const [activeMindmapKey, setActiveMindmapKey] = useState<string>('pendulum_waves');
  const [selectedNode, setSelectedNode] = useState<MindmapNode>(MINDMAP_TOPICS.pendulum_waves.root);
  const [customBranches, setCustomBranches] = useState<Record<string, MindmapNode[]>>({});
  const [newBranchTitle, setNewBranchTitle] = useState('');
  const [newBranchPrinciple, setNewBranchPrinciple] = useState('');

  const currentMindmap = MINDMAP_TOPICS[activeMindmapKey] || MINDMAP_TOPICS.pendulum_waves;
  const allBranches = [
    ...(currentMindmap.root.children || []),
    ...(customBranches[activeMindmapKey] || [])
  ];

  const handleAddMindmapBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchTitle.trim()) return;
    const node: MindmapNode = {
      id: `custom_node_${Date.now()}`,
      title: newBranchTitle.trim(),
      principle: newBranchPrinciple.trim() || 'Ghi chú tư duy nguyên lý do bạn tự tổng hợp.'
    };
    setCustomBranches(prev => ({
      ...prev,
      [activeMindmapKey]: [...(prev[activeMindmapKey] || []), node]
    }));
    setSelectedNode(node);
    setNewBranchTitle('');
    setNewBranchPrinciple('');
    haptics?.success?.();
  };

  // ---------------- 3. KANBAN & DEEP POMODORO STATE ----------------
  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_edu_kanban_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KANBAN_TASKS;
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Vật Lý');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string>('kt_1');

  const [pomoMode, setPomoMode] = useState<'25_5' | '50_10' | '90_15'>('25_5');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('haevy_edu_kanban_v1', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    if (!isPomoRunning) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsPomoRunning(false);
          onRecordActivity?.('lab_completed', 40, 'Hoàn thành phiên Deep Focus Pomodoro');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPomoRunning]);

  // Web Audio API soothing brown noise for focus
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      try {
        noiseNodeRef.current?.disconnect();
        audioCtxRef.current?.close();
      } catch {}
      setIsAmbientPlaying(false);
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.08; // Gentle soothing volume
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(ctx.destination);
      whiteNoise.start(0);
      audioCtxRef.current = ctx;
      noiseNodeRef.current = whiteNoise;
      setIsAmbientPlaying(true);
    } catch {
      setIsAmbientPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      try {
        noiseNodeRef.current?.disconnect();
        audioCtxRef.current?.close();
      } catch {}
    };
  }, []);

  const formatPomoTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMoveTask = (taskId: string, nextStatus: KanbanTask['status']) => {
    haptics?.selection?.();
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus,
              pomodoroCompleted: nextStatus === 'done' ? Math.max(t.pomodoroTarget, t.pomodoroCompleted + 1) : t.pomodoroCompleted
            }
          : t
      )
    );
    if (nextStatus === 'done') {
      onRecordActivity?.('quiz_passed', 25, 'Hoàn thành nhiệm vụ học tập Kanban');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item: KanbanTask = {
      id: `kt_${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      status: 'todo',
      pomodoroTarget: 2,
      pomodoroCompleted: 0
    };
    setTasks(prev => [item, ...prev]);
    setNewTaskTitle('');
    haptics?.success?.();
  };

  // ---------------- 4. FORMULA CHEAT SHEETS STATE ----------------
  const [formulaQuery, setFormulaQuery] = useState('');
  const [formulaSubject, setFormulaSubject] = useState('all');

  const filteredFormulas = useMemo(() => {
    return FORMULA_HANDBOOK.filter(item => {
      if (formulaSubject !== 'all' && item.subject !== formulaSubject) return false;
      if (formulaQuery.trim()) {
        const q = formulaQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.formula.toLowerCase().includes(q) ||
          item.principle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [formulaQuery, formulaSubject]);

  return (
    <div className="space-y-5">
      {/* Top All-in-One Study Desk Navigation */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase">
              <Sparkles size={11} />
              <span>Bàn Học Tập Trung All-in-One • Phương Pháp Chủ Động</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Không Gian Học Tập Chuyên Sâu &amp; Ghi Nhớ Dài Hạn
            </h2>
            <p className="text-xs text-zinc-400">
              Kết hợp Active Recall Flashcards, Sơ đồ tư duy Mindmap, Kanban Pomodoro và Sổ tay công thức bản chất.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenCasio && (
              <button
                type="button"
                onClick={onOpenCasio}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Calculator size={14} />
                <span>Máy Tính fx-880</span>
              </button>
            )}
            {onOpenExamPrep && (
              <button
                type="button"
                onClick={onOpenExamPrep}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <Timer size={14} />
                <span>Luyện Đề Bấm Giờ</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Power Tools Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {[
            {
              id: 'flashcards' as const,
              title: 'Flashcard Thông Minh',
              subtitle: 'Spaced Repetition (SRS)',
              icon: Layers,
              accent: 'from-purple-600 to-indigo-600'
            },
            {
              id: 'mindmap' as const,
              title: 'Sơ Đồ Tư Duy Mindmap',
              subtitle: 'Hệ thống nhánh logic',
              icon: GitFork,
              accent: 'from-cyan-500 to-blue-600'
            },
            {
              id: 'kanban_pomodoro' as const,
              title: 'Kanban & Pomodoro Sâu',
              subtitle: 'Quản lý mục tiêu & tập trung',
              icon: Kanban,
              accent: 'from-amber-500 to-orange-500'
            },
            {
              id: 'formulas' as const,
              title: 'Sổ Tay Công Thức Nhanh',
              subtitle: 'Tra cứu & chống bẫy học vẹt',
              icon: BookOpen,
              accent: 'from-emerald-500 to-teal-600'
            }
          ].map(tool => {
            const IconComp = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveTool(tool.id);
                  haptics?.selection?.();
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${tool.accent} text-white border-white/30 shadow-lg scale-[1.01]`
                    : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-black/25 text-white' : 'bg-zinc-900 text-amber-400'
                }`}>
                  <IconComp size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{tool.title}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                    {tool.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOOL 1: SPACED REPETITION FLASHCARDS (ACTIVE RECALL)                      */}
      {/* ========================================================================= */}
      {activeTool === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 cols: Active Flashcard Stage */}
          <div className="lg:col-span-8 rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tất Cả Bộ Thẻ' },
                  { id: 'physics', label: '⚛️ Vật Lý' },
                  { id: 'math', label: '📐 Toán Học' },
                  { id: 'chemistry', label: '🧪 Hóa Học' },
                  { id: 'biology', label: '🧬 Sinh Học' }
                ].map(subj => (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectFilter(subj.id);
                      setCurrentCardIdx(0);
                      setIsCardFlipped(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedSubjectFilter === subj.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {subj.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCard(!isAddingCard)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>{isAddingCard ? 'Đóng Khung Tạo' : 'Tạo Thẻ Mới'}</span>
              </button>
            </div>

            {isAddingCard && (
              <form onSubmit={handleCreateFlashcard} className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/40 space-y-3">
                <div className="text-xs font-black text-purple-300 uppercase">Tạo Thẻ Flashcard Active Recall Mới</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    placeholder="Mặt trước (Câu hỏi tư duy / Hiện tượng)..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
                    required
                  />
                  <select
                    value={newCardSubject}
                    onChange={(e) => setNewCardSubject(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none"
                  >
                    <option value="physics">Vật Lý 12</option>
                    <option value="math">Toán 12</option>
                    <option value="chemistry">Hóa Học 12</option>
                    <option value="biology">Sinh Học 12</option>
                    <option value="english">Tiếng Anh</option>
                  </select>
                </div>
                <textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Mặt sau (Đáp án cốt lõi & Công thức)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
                <input
                  type="text"
                  value={newCardPrinciple}
                  onChange={(e) => setNewCardPrinciple(e.target.value)}
                  placeholder="Ghi chú bản chất First Principles hoặc bẫy cần tránh..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-purple-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black cursor-pointer"
                  >
                    Lưu Vào Bộ Thẻ
                  </button>
                </div>
              </form>
            )}

            {/* Interactive Flip Card */}
            {activeCard ? (
              <div className="space-y-4">
                <div
                  onClick={() => {
                    setIsCardFlipped(!isCardFlipped);
                    haptics?.light?.();
                  }}
                  className={`min-h-[250px] p-6 sm:p-8 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                    isCardFlipped
                      ? 'bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border-indigo-400/50 shadow-2xl'
                      : 'bg-gradient-to-br from-purple-950/50 via-zinc-900 to-zinc-950 border-purple-500/40 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black">
                      {activeCard.subjectLabel} • Thẻ #{currentCardIdx + 1}/{filteredCards.length}
                    </span>
                    <span className="text-[11px] font-mono text-amber-300">
                      {isCardFlipped ? '💡 ĐÁP ÁN & BẢN CHẤT' : '❓ CÂU HỎI (Chạm để lật thẻ)'}
                    </span>
                  </div>

                  <div className="my-auto py-4">
                    {!isCardFlipped ? (
                      <h3 className="text-base sm:text-xl font-black text-white leading-relaxed text-center">
                        {activeCard.front}
                      </h3>
                    ) : (
                      <div className="space-y-3 text-left">
                        <div className="text-sm sm:text-base font-bold text-emerald-300 whitespace-pre-line leading-relaxed">
                          {activeCard.back}
                        </div>
                        <div className="p-3 rounded-2xl bg-zinc-950/90 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                          <strong className="text-amber-400 uppercase block mb-0.5">🔍 Giải thích First Principles:</strong>
                          {activeCard.firstPrincipleNote}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                    <span>Chu kỳ ôn tiếp theo: <strong className="text-white font-mono">{activeCard.nextReviewLabel}</strong></span>
                    <span className="text-purple-300 font-bold">Bấm vào thẻ để {isCardFlipped ? 'xem lại câu hỏi' : 'xem đáp án'} ↻</span>
                  </div>
                </div>

                {/* SRS Interval Rating Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRateCard('again')}
                    className="p-2.5 rounded-2xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-black flex flex-col items-center cursor-pointer active:scale-95"
                  >
                    <span>Quên / Học Lại</span>
                    <span className="text-[10px] font-mono opacity-80">&lt; 10 phút</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard('hard')}
                    className="p-2.5 rounded-2xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-black flex flex-col items-center cursor-pointer active:scale-95"
                  >
                    <span>Hơi Khó</span>
                    <span className="text-[10px] font-mono opacity-80">1 ngày</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard('good')}
                    className="p-2.5 rounded-2xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 text-xs font-black flex flex-col items-center cursor-pointer active:scale-95"
                  >
                    <span>Nhớ Tốt</span>
                    <span className="text-[10px] font-mono opacity-80">3 ngày</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard('easy')}
                    className="p-2.5 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-black flex flex-col items-center cursor-pointer active:scale-95"
                  >
                    <span>Rất Dễ (+15 XP)</span>
                    <span className="text-[10px] font-mono opacity-80">7 ngày</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right 4 cols: SRS Mastery Stats & AI Deep Tutor */}
          <div className="lg:col-span-4 rounded-3xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <BrainCircuit size={16} className="text-purple-400" />
                <span>Thống Kê Trí Nhớ Dài Hạn (SRS)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Tổng số thẻ</div>
                  <div className="text-lg font-black text-white font-mono">{cards.length} thẻ</div>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Đã thuộc vững</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {cards.filter(c => c.boxLevel >= 2).length} thẻ
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-zinc-300">Danh sách thẻ trong bộ đang chọn:</div>
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {filteredCards.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCurrentCardIdx(idx);
                        setIsCardFlipped(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                        idx === currentCardIdx
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="truncate flex-1">{c.front}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 shrink-0">
                        {c.nextReviewLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeCard && onOpenAiAssistant && (
              <button
                type="button"
                onClick={() =>
                  onOpenAiAssistant(
                    `Giải thích chuyên sâu theo phương pháp First Principles cho câu hỏi Flashcard sau:\n"${activeCard.front}"\nĐáp án tóm tắt: ${activeCard.back}`
                  )
                }
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Hỏi AI Gia Sư Phân Tích Sâu Thẻ Này</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 2: INTERACTIVE MINDMAP EXPLORER & BUILDER                            */}
      {/* ========================================================================= */}
      {activeTool === 'mindmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 cols: Interactive Visual Tree */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {Object.entries(MINDMAP_TOPICS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveMindmapKey(key);
                      setSelectedNode(item.root);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      activeMindmapKey === key
                        ? 'bg-cyan-500 text-zinc-950 font-black shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {item.subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Root + Connected Branches */}
            <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 space-y-4">
              {/* Root Node */}
              <div
                onClick={() => setSelectedNode(currentMindmap.root)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedNode.id === currentMindmap.root.id
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 shadow-lg'
                    : 'bg-zinc-950 border-zinc-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-cyan-400">🎯 Chủ đề trung tâm (Root Node)</span>
                  {currentMindmap.root.formula && (
                    <span className="text-xs font-mono font-bold text-amber-300 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-700">
                      {currentMindmap.root.formula}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white mt-1">{currentMindmap.root.title}</h3>
              </div>

              {/* Child Branches */}
              <div className="pl-4 sm:pl-6 border-l-2 border-cyan-500/40 space-y-3">
                {allBranches.map((branch) => {
                  const isSel = selectedNode.id === branch.id;
                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedNode(branch)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSel
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                          : 'bg-zinc-950/90 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs sm:text-sm font-black text-white">{branch.title}</div>
                        {branch.formula && (
                          <div className="text-xs font-mono text-amber-300">{branch.formula}</div>
                        )}
                      </div>
                      <ChevronRight size={16} className={isSel ? 'text-cyan-400 shrink-0' : 'text-zinc-600 shrink-0'} />
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Branch Form */}
              <form onSubmit={handleAddMindmapBranch} className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newBranchTitle}
                  onChange={(e) => setNewBranchTitle(e.target.value)}
                  placeholder="Tên nhánh kiến thức mới..."
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={newBranchPrinciple}
                  onChange={(e) => setNewBranchPrinciple(e.target.value)}
                  placeholder="Bản chất / Công thức..."
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black shrink-0 cursor-pointer"
                >
                  + Thêm Nhánh
                </button>
              </form>
            </div>
          </div>

          {/* Right 5 cols: Selected Node Deep Inspector */}
          <div className="lg:col-span-5 rounded-3xl bg-zinc-950 border border-cyan-500/30 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-black uppercase">
                <GitFork size={12} />
                <span>Chi Tiết Nhánh Tư Duy Đang Chọn</span>
              </div>

              <h3 className="text-lg font-black text-white">{selectedNode.title}</h3>

              {selectedNode.formula && (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-amber-500/30">
                  <div className="text-[10px] font-bold uppercase text-amber-400">Công thức trọng tâm:</div>
                  <div className="text-sm font-mono font-black text-white mt-1">{selectedNode.formula}</div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                <div className="text-xs font-black text-emerald-400 uppercase">🧠 Bản chất First Principles:</div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{selectedNode.principle}</p>
              </div>

              {selectedNode.trap && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1">
                  <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Bẫy Học Vẹt Thường Gặp Khi Đi Thi:</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{selectedNode.trap}</p>
                </div>
              )}
            </div>

            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={() =>
                  onOpenAiAssistant(
                    `Hãy phân tích sâu nhánh kiến thức "${selectedNode.title}" (${selectedNode.formula || ''}) và cho 2 ví dụ bài tập phân hóa THPT Quốc Gia.`
                  )
                }
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <BrainCircuit size={15} />
                <span>Nhờ AI Gia Sư Ra Ví Dụ Thực Chiến Cho Nhánh Này</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 3: KANBAN STUDY PLANNER + DEEP FOCUS POMODORO                        */}
      {/* ========================================================================= */}
      {activeTool === 'kanban_pomodoro' && (
        <div className="space-y-5">
          {/* Deep Focus Pomodoro Bar */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border border-amber-500/40 p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                <Flame size={13} />
                <span>ĐỒNG HỒ DEEP FOCUS POMODORO • KỶ LUẬT BÀN HỌC</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Đang tập trung: {tasks.find(t => t.id === activeFocusTaskId)?.title || 'Chọn nhiệm vụ bên dưới'}
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                {[
                  { id: '25_5' as const, label: '25p Học / 5p Nghỉ', mins: 25 },
                  { id: '50_10' as const, label: '50p Deep Work / 10p', mins: 50 },
                  { id: '90_15' as const, label: '90p Luyện Đề Chuẩn', mins: 90 }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPomoMode(m.id);
                      setIsPomoRunning(false);
                      setSecondsLeft(m.mins * 60);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition ${
                      pomoMode === m.id
                        ? 'bg-amber-500 text-zinc-950 font-black'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Tabular Timer & Controls */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="px-6 py-3 rounded-2xl bg-zinc-950 border border-amber-500/40 text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-wider shadow-inner">
                {formatPomoTime(secondsLeft)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPomoRunning(!isPomoRunning);
                    haptics?.toggle?.();
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
                >
                  {isPomoRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPomoRunning ? 'Tạm Dừng' : 'Bắt Đầu Focus'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPomoRunning(false);
                    const mins = pomoMode === '25_5' ? 25 : pomoMode === '50_10' ? 50 : 90;
                    setSecondsLeft(mins * 60);
                  }}
                  className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer"
                  title="Đặt lại đồng hồ"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  type="button"
                  onClick={toggleAmbientSound}
                  className={`px-3.5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    isAmbientPlaying
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Bật âm thanh trắng (Brown Noise) giúp não bộ tập trung sâu"
                >
                  {isAmbientPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span className="hidden sm:inline">{isAmbientPlaying ? 'Sóng Âm Focus: BẬT' : 'Sóng Âm Focus'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add Kanban Task Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Thêm mục tiêu học tập mới vào bảng Kanban (VD: Giải 10 câu Tích phân vận dụng)..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
            />
            <select
              value={newTaskSubject}
              onChange={(e) => setNewTaskSubject(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white outline-none"
            >
              <option value="Toán Học">📐 Toán Học</option>
              <option value="Vật Lý">⚛️ Vật Lý</option>
              <option value="Hóa Học">🧪 Hóa Học</option>
              <option value="Sinh Học">🧬 Sinh Học</option>
              <option value="Tiếng Anh">🌐 Tiếng Anh</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Thêm Nhiệm Vụ</span>
            </button>
          </form>

          {/* 3-Column Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'todo' as const, title: '📋 Cần Học Hôm Nay', border: 'border-zinc-800', badgeColor: 'bg-zinc-800 text-zinc-300' },
              { id: 'doing' as const, title: '🔥 Đang Tập Trung Giải Quyết', border: 'border-amber-500/40', badgeColor: 'bg-amber-500/20 text-amber-300' },
              { id: 'done' as const, title: '✅ Đã Hoàn Thành (+25 XP)', border: 'border-emerald-500/40', badgeColor: 'bg-emerald-500/20 text-emerald-300' }
            ].map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`rounded-3xl bg-zinc-950 border ${col.border} p-4 space-y-3 min-h-[280px] flex flex-col`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                    <span className="text-xs font-black text-white">{col.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${col.badgeColor}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl bg-zinc-900/90 border transition-all space-y-2.5 ${
                          activeFocusTaskId === task.id ? 'border-amber-400/70 shadow-md' : 'border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-cyan-300 font-bold border border-zinc-800">
                            {task.subject}
                          </span>
                          <span className="font-mono text-amber-300">
                            🍅 {task.pomodoroCompleted}/{task.pomodoroTarget} phiên
                          </span>
                        </div>

                        <p className={`text-xs font-bold leading-snug ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {task.title}
                        </p>

                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFocusTaskId(task.id);
                              setIsPomoRunning(true);
                              if (task.status === 'todo') handleMoveTask(task.id, 'doing');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black cursor-pointer"
                          >
                            🍅 Tập Trung
                          </button>

                          <div className="flex items-center gap-1">
                            {task.status !== 'doing' && (
                              <button
                                type="button"
                                onClick={() => handleMoveTask(task.id, 'doing')}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold cursor-pointer"
                              >
                                Đang học
                              </button>
                            )}
                            {task.status !== 'done' && (
                              <button
                                type="button"
                                onClick={() => handleMoveTask(task.id, 'done')}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer"
                              >
                                Xong ✓
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                              className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 4: INTERACTIVE FORMULA CHEAT SHEETS                                  */}
      {/* ========================================================================= */}
      {activeTool === 'formulas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={formulaQuery}
                onChange={(e) => setFormulaQuery(e.target.value)}
                placeholder="Tìm nhanh công thức (VD: Faraday, Hardy-Weinberg, giao thoa)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {['all', 'Toán Học', 'Vật Lý', 'Hóa Học', 'Sinh Học'].map(subj => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setFormulaSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    formulaSubject === subj
                      ? 'bg-emerald-500 text-zinc-950 font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {subj === 'all' ? 'Tất Cả Môn' : subj}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map(fm => (
              <div
                key={fm.id}
                className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                      {fm.subject}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-white">{fm.title}</h4>

                  <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-500/30 font-mono text-xs sm:text-sm font-black text-amber-300">
                    {fm.formula}
                  </div>

                  <p className="text-[11px] text-zinc-400 font-mono">{fm.variables}</p>

                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200 leading-relaxed">
                    <strong className="text-cyan-400">💡 Bản chất: </strong>
                    {fm.principle}
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-200">
                    <strong className="text-rose-400">⚠️ Lưu ý tránh sai: </strong>
                    {fm.trap}
                  </div>
                </div>

                {onOpenAiAssistant && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAiAssistant(`Cho 1 bài tập trắc nghiệm mẫu áp dụng công thức "${fm.title}" (${fm.formula}) kèm hướng dẫn bấm máy Casio fx-880.`)
                      }
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <BrainCircuit size={13} />
                      <span>Bài Tập Mẫu &amp; Bấm Máy Casio</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
