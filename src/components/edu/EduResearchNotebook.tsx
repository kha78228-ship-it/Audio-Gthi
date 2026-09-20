import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FlaskConical, 
  Atom, 
  TestTube, 
  Dna, 
  Sparkles, 
  Tag, 
  CheckCircle2,
  Calculator,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  FileText
} from 'lucide-react';
import Markdown from 'react-markdown';
import { EduLabSubject } from '../../types';
import { GoogleDocsExportModal } from '../google/GoogleDocsExportModal';
import { GoogleDocExportOptions } from '../../services/googleDocsService';

export interface EduResearchNote {
  id: string;
  title: string;
  content: string;
  subject: 'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'STEM';
  pinned?: boolean;
  tags?: string[];
  createdAt: string;
  labBridge?: {
    subject: EduLabSubject;
    experimentId: string;
    experimentName: string;
  };
}

interface EduResearchNotebookProps {
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenAiAssistant?: () => void;
}

const STORAGE_KEY = 'haevy_edu_notebook_notes';

const DEFAULT_SEEDED_NOTES: EduResearchNote[] = [
  {
    id: 'note-seed-1',
    title: 'Tại sao chu kỳ con lắc đơn T không phụ thuộc vào khối lượng m?',
    subject: 'Vật Lý',
    pinned: true,
    tags: ['Cơ Học', 'Con Lắc', 'Bảo Toàn'],
    createdAt: new Date().toLocaleDateString('vi-VN'),
    content: `### 🔍 Bản Chất Nguyên Lý Gốc (First Principles)
Chu kỳ dao động tự do của con lắc đơn:
$$T = 2\\pi \\sqrt{\\frac{L}{g}}$$

**Tại sao khối lượng $m$ bị triệt tiêu hoàn toàn?**
1. **Lực kéo về phục hồi:** Thành phần tiếp tuyến của trọng lực kéo con lắc về vị trí cân bằng là $F_{restore} = -m \\cdot g \\cdot \\sin\\alpha$. Vật càng nặng ($m$ lớn) thì lực kéo về càng mạnh.
2. **Khối lượng quán tính cản trở:** Theo định luật II Newton ($F = m \\cdot a$), gia tốc tức thời $a = \\frac{F}{m}$. Vật càng nặng ($m$ lớn) thì lại càng "lì", kháng cự lại sự thay đổi trạng thái chuyển động càng nhiều.
3. **Triệt tiêu hoàn hảo:** Cả hai tác dụng này tỉ lệ thuận với $m$ ở cùng một bậc. Lực kéo tăng bao nhiêu thì quán tính cản trở tăng bấy nhiêu, dẫn đến gia tốc $a = -g \\cdot \\sin\\alpha$ hoàn toàn không còn $m$!

⚠️ **Cạm bẫy học vẹt:** Tưởng rằng "vật nặng hơn thì rơi nhanh hơn hoặc dao động nhanh hơn".`,
    labBridge: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Con Lắc Đơn & Bảo Toàn Cơ Năng'
    }
  },
  {
    id: 'note-seed-2',
    title: 'Bản chất sự biến đổi màu đột ngột tại điểm tương đương chuẩn độ',
    subject: 'Hóa Học',
    pinned: true,
    tags: ['Chuẩn Độ', 'pH', 'Điện Ly'],
    createdAt: new Date().toLocaleDateString('vi-VN'),
    content: `### 🔍 Bản Chất Logic & Thang Đo Logarit
Khi nhỏ từng giọt dung dịch $\\text{NaOH } 0.1\\text{M}$ vào $25\\text{ml HCl } 0.1\\text{M}$:
- Từ $0\\text{ml}$ đến $24.9\\text{ml}$: Nồng độ $[\\text{H}^+]$ giảm dần nhưng vẫn nằm trong thang đo axit mạnh, pH chỉ nhích từ $1.0$ lên khoảng $3.4$. Dung dịch vẫn hoàn toàn không màu với Phenolphthalein.
- **Chỉ cần thêm đúng 1 giọt (0.05ml)**: Toàn bộ lượng ion $\\text{H}^+$ dư bị trung hòa hoàn toàn. Nồng độ $\\text{H}^+$ rơi từ $10^{-4}$ xuống $10^{-7}$, rồi vọt sang môi trường kiềm $10^{-10}$. 
- Vì thang đo $\\text{pH} = -\\log[\\text{H}^+]$ là thang đo logarit cơ số 10: một sự giảm $10^6$ lần nồng độ tương đương bước nhảy vọt $6$ đơn vị pH tức thì!
- Chỉ thị Phenolphthalein lập tức bị bứt proton $\\text{H}^+$, biến đổi cấu trúc vòng quinoid cộng hưởng, hấp thụ ánh sáng và phát ra màu hồng sen rực rỡ.`,
    labBridge: {
      subject: 'chemistry',
      experimentId: 'titration',
      experimentName: 'Chuẩn Độ Axit - Bazơ & Bước Nhảy pH'
    }
  },
  {
    id: 'note-seed-3',
    title: 'Tại sao nối song song đèn sáng hơn nối tiếp? Bản chất điện thế',
    subject: 'Vật Lý',
    pinned: false,
    tags: ['Định Luật Ohm', 'Mạch Điện', 'Công Suất'],
    createdAt: new Date().toLocaleDateString('vi-VN'),
    content: `### 🔍 Bản Chất Thế Năng Electron & Công Suất Tỏa Nhiệt
Công suất tiêu thụ của bóng đèn (độ sáng) được xác định bởi:
$$P = U \\cdot I = \\frac{U^2}{R}$$

1. **Mạch nối tiếp ($R_{td} = R_1 + R_2$):** Điện trở tổng tăng gấp đôi, cường độ dòng điện $I$ giảm một nửa. Mỗi bóng đèn chỉ nhận được một nửa hiệu điện thế nguồn ($U_1 = U/2$). Công suất mỗi đèn giảm còn $P' = \\frac{(U/2)^2}{R} = \\frac{P}{4}$ (chỉ bằng 1/4 độ sáng ban đầu!).
2. **Mạch song song ($U_1 = U_2 = U_{nguồn}$):** Cả hai bóng đèn đều chịu trọn vẹn hiệu điện thế nguồn. Electron đi qua mỗi nhánh đều được "bơm" đầy đủ năng lượng thế điện trường, sinh công suất $P = \\frac{U^2}{R}$ tối đa độc lập.`,
    labBridge: {
      subject: 'physics',
      experimentId: 'circuit',
      experimentName: 'Mạch Điện Thông Minh & Định Luật Ohm'
    }
  },
  {
    id: 'note-seed-4',
    title: 'Nguyên tắc bổ sung trong nhân đôi DNA và tính đặc hiệu liên kết Hydro',
    subject: 'Sinh Học',
    pinned: false,
    tags: ['Di Truyền', 'DNA', 'Watson-Crick'],
    createdAt: new Date().toLocaleDateString('vi-VN'),
    content: `### 🔍 Bản Chất Hình Học Phân Tử
Chuỗi xoắn kép DNA Watson-Crick có đường kính ổn định $20\\text{ Å} (2\\text{ nm})$.
- Bazơ Purine (A, G) có kích thước lớn (2 vòng).
- Bazơ Pyrimidine (T, C) có kích thước nhỏ (1 vòng).
- **Quy luật hình học:** Luôn phải là 1 Purine kết hợp với 1 Pyrimidine để tổng khoảng cách không gian luôn bằng 3 vòng. Nếu A đi với G thì chuỗi sẽ phình to; nếu T đi với C thì chuỗi sẽ co rút!
- **Độ bền liên kết:** A liên kết với T bằng đúng 2 liên kết Hydro; G liên kết với C bằng đúng 3 liên kết Hydro. Sự ăn khớp này tạo nên tính tự sửa sai của enzyme DNA Polymerase với tỷ lệ đột biến tự nhiên chỉ $10^{-9}$!`,
    labBridge: {
      subject: 'biology',
      experimentId: 'dna',
      experimentName: 'Cấu Trúc Xoắn Kép & Nhân Đôi DNA'
    }
  }
];

export function EduResearchNotebook({ onOpenLab, onOpenAiAssistant }: EduResearchNotebookProps) {
  const [notes, setNotes] = useState<EduResearchNote[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Google Docs Export state
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);
  const [googleDocsExportOptions, setGoogleDocsExportOptions] = useState<GoogleDocExportOptions | null>(null);

  // Form state for new note
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState<'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'STEM'>('Vật Lý');
  const [newTags, setNewTags] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
      // Initialize with default notes
      setNotes(DEFAULT_SEEDED_NOTES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_NOTES));
    } catch (e) {
      console.warn('Cannot load notebook notes:', e);
      setNotes(DEFAULT_SEEDED_NOTES);
    }
  }, []);

  const saveNotesToDisk = (updated: EduResearchNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Cannot save notebook notes:', e);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    saveNotesToDisk(updated);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ghi chú nghiên cứu này?')) {
      const updated = notes.filter(n => n.id !== id);
      saveNotesToDisk(updated);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const newNote: EduResearchNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      subject: newSubject,
      pinned: false,
      tags: parsedTags.length > 0 ? parsedTags : ['Ghi Chú Bản Chất'],
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    const updated = [newNote, ...notes];
    saveNotesToDisk(updated);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAddingNote(false);
  };

  const handleExportMarkdown = () => {
    let md = `# SỔ TAY NGHIÊN CỨU FIRST PRINCIPLES - HAEVY EDU\n*Xuất bản ngày: ${new Date().toLocaleDateString('vi-VN')}*\n\n`;
    notes.forEach((n, idx) => {
      md += `## ${idx + 1}. [${n.subject}] ${n.title}\n`;
      md += `*Thời gian: ${n.createdAt} | Thẻ: ${n.tags?.join(', ') || 'None'}*\n\n`;
      md += `${n.content}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haevy-edu-principles-notebook-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleDocsExportAll = () => {
    let md = `## SỔ TAY NGHIÊN CỨU FIRST PRINCIPLES - HAEVY EDU\n*Tổng hợp ngày: ${new Date().toLocaleDateString('vi-VN')}*\n\n`;
    const targetNotes = filteredNotes.length > 0 ? filteredNotes : notes;
    targetNotes.forEach((n, idx) => {
      md += `### ${idx + 1}. [${n.subject}] ${n.title}\n\n`;
      md += `*Thời gian: ${n.createdAt} | Thẻ: ${n.tags?.join(', ') || 'Chung'}*\n\n`;
      md += `${n.content}\n\n`;
      if (n.labBridge) {
        md += `*Thí nghiệm ảo kiểm chứng:* **${n.labBridge.experimentName}**\n\n`;
      }
      md += `---\n\n`;
    });

    setGoogleDocsExportOptions({
      title: `Sổ Tay Nghiên Cứu First Principles (${targetNotes.length} Luận Điểm) - Haevy Edu`,
      contentMarkdown: md,
      category: 'haevy_edu_notebook',
      categoryLabel: 'Haevy Edu - Sổ Tay Nghiên Cứu STEM',
      tags: ['HaevyEdu', 'FirstPrinciples', 'STEM', activeFilter],
      summary: `Tổng hợp ${targetNotes.length} ghi chép bóc tách bản chất khoa học First Principles từ Sổ tay Haevy Edu.`,
      sourceApp: 'haevy_edu'
    });
    setIsGoogleDocsModalOpen(true);
  };

  const handleOpenGoogleDocsExportNote = (note: EduResearchNote) => {
    let md = `**Lĩnh vực:** ${note.subject} &nbsp;|&nbsp; **Ngày ghi chép:** ${note.createdAt}\n\n`;
    if (note.tags && note.tags.length > 0) {
      md += `**Tags:** ${note.tags.map(t => `#${t}`).join(', ')}\n\n`;
    }
    md += `${note.content}\n\n`;
    if (note.labBridge) {
      md += `\n---\n*Liên kết thí nghiệm ảo kiểm chứng:* **${note.labBridge.experimentName}**\n`;
    }

    setGoogleDocsExportOptions({
      title: `[Haevy Edu] ${note.title}`,
      contentMarkdown: md,
      category: 'haevy_edu_single_note',
      categoryLabel: `Haevy Edu (${note.subject})`,
      tags: note.tags || ['HaevyEdu', 'FirstPrinciples'],
      summary: `Ghi chép bóc tách bản chất khoa học: ${note.title}`,
      sourceApp: 'haevy_edu'
    });
    setIsGoogleDocsModalOpen(true);
  };

  const handleCopyFormula = (formula: string, label: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(label);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (activeFilter === 'pinned' && !note.pinned) return false;
    if (activeFilter === 'physics' && note.subject !== 'Vật Lý') return false;
    if (activeFilter === 'chemistry' && note.subject !== 'Hóa Học') return false;
    if (activeFilter === 'biology' && note.subject !== 'Sinh Học') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      const matchTags = note.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchTags;
    }

    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-lg shadow-amber-950/60 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <BookOpen size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 tracking-tight">
                  Sổ Tay Nghiên Cứu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">First Principles</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  {notes.length} Luận Điểm Đã Lưu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Nơi tổng hợp các chân lý gốc rễ, nhận định bóc tách từ Trợ lý AI và các bài học rút ra sau khi kiểm chứng thực tế trong phòng thí nghiệm ảo.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Ghi Chép Mới</span>
            </button>

            <button
              onClick={handleOpenGoogleDocsExportAll}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/50 transition-all flex items-center gap-1.5"
              title="Xuất các ghi chép sổ tay sang Google Docs"
            >
              <FileText size={15} />
              <span>Xuất Google Docs</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="Xuất file Markdown (.md) để ôn tập"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Xuất Markdown</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              title="In hoặc lưu dạng PDF"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">In / PDF</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất Cả', icon: Sparkles },
              { id: 'pinned', label: 'Đã Ghim', icon: Pin },
              { id: 'physics', label: 'Vật Lý', icon: Atom },
              { id: 'chemistry', label: 'Hóa Học', icon: TestTube },
              { id: 'biology', label: 'Sinh Học', icon: Dna },
            ].map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeFilter === f.id
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-900/40'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={13} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công thức, nguyên lý..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Notes list (left) & Science Constants Sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Notes List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredNotes.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-500 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-bold text-zinc-300">Không tìm thấy ghi chú phù hợp</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Hãy chuyển chế độ lọc hoặc trao đổi với Trợ lý AI và nhấn nút "Lưu sổ tay" để tự động lưu nguyên lý vào đây.
              </p>
              {onOpenAiAssistant && (
                <button
                  onClick={onOpenAiAssistant}
                  className="mt-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Mở Trợ Lý AI Học Tập</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isPhysics = note.subject === 'Vật Lý';
              const isChem = note.subject === 'Hóa Học';
              const isBio = note.subject === 'Sinh Học';

              return (
                <div
                  key={note.id}
                  className={`bg-zinc-950 border rounded-3xl p-5 sm:p-6 shadow-xl transition-all flex flex-col gap-4 ${
                    note.pinned
                      ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/10 to-zinc-950'
                      : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isPhysics 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                          : isChem 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : isBio 
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                              : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {isPhysics ? <Atom size={14} /> : isChem ? <TestTube size={14} /> : isBio ? <Dna size={14} /> : <BookOpen size={14} />}
                        <span>{note.subject}</span>
                      </div>

                      <span className="text-[11px] text-zinc-400 font-mono">
                        {note.createdAt}
                      </span>
                    </div>

                    {/* Pin, Docs Export & Delete Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenGoogleDocsExportNote(note)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-zinc-900 transition-colors"
                        title="Xuất ghi chép này sang Google Docs"
                      >
                        <FileText size={14} />
                      </button>

                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          note.pinned 
                            ? 'bg-amber-500/20 text-amber-300' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                        }`}
                        title={note.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                      >
                        <Pin size={14} className={note.pinned ? 'fill-amber-300' : ''} />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                        title="Xóa ghi chú"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Note Title */}
                  <h3 className="text-base sm:text-lg font-black text-zinc-100 leading-snug tracking-tight">
                    {note.title}
                  </h3>

                  {/* Note Content (Rendered Markdown) */}
                  <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans prose prose-invert max-w-none prose-headings:text-zinc-100 prose-headings:font-bold prose-p:my-2">
                    <Markdown>{note.content}</Markdown>
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Lab Bridge Button if available */}
                  {note.labBridge && onOpenLab && (
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/30 mt-1">
                      <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                        <FlaskConical size={15} />
                        <span>Thí nghiệm ảo kiểm chứng: {note.labBridge.experimentName}</span>
                      </div>
                      <button
                        onClick={() => onOpenLab(note.labBridge!.subject, note.labBridge!.experimentId)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
                      >
                        <span>Mở Thí Nghiệm</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Physical Constants & Feynman Rules */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Fundamental Physical & Chemical Constants */}
          <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={17} className="text-amber-400" />
                <h4 className="text-sm font-bold text-zinc-100">Hằng Số Khoa Học Cốt Lõi</h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">1-Click Copy</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { label: 'Gia tốc trọng trường g', val: '9.80665 m/s²', copyVal: '9.80665' },
                { label: 'Vận tốc ánh sáng c', val: '299,792,458 m/s', copyVal: '299792458' },
                { label: 'Hằng số Planck h', val: '6.626 × 10⁻³⁴ J·s', copyVal: '6.62607015e-34' },
                { label: 'Số Avogadro N_A', val: '6.022 × 10²³ mol⁻¹', copyVal: '6.02214076e23' },
                { label: 'Hằng số khí lý tưởng R', val: '8.314 J/(mol·K)', copyVal: '8.314' },
                { label: 'Tích số ion nước Kw', val: '1.0 × 10⁻¹⁴ (25°C)', copyVal: '1.0e-14' },
                { label: 'Điện tích nguyên tố e', val: '1.602 × 10⁻¹⁹ C', copyVal: '1.602176634e-19' },
              ].map(c => (
                <div
                  key={c.label}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-2 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] text-zinc-400 truncate">{c.label}:</span>
                    <span className="text-zinc-200 font-bold text-xs">{c.val}</span>
                  </div>
                  <button
                    onClick={() => handleCopyFormula(c.copyVal, c.label)}
                    className="p-1.5 text-zinc-500 hover:text-amber-300 rounded-lg transition-colors shrink-0"
                    title={`Sao chép giá trị ${c.copyVal}`}
                  >
                    {copiedFormula === c.label ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Feynman Technique Card */}
          <div className="bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-teal-950/20 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lightbulb size={17} />
              <span>Kỹ Thuật Feynman: 4 Bước Thấu Suốt</span>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span><strong>Chọn khái niệm:</strong> Xác định rõ định luật hoặc hiện tượng muốn bóc tách.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span><strong>Giải thích cho đứa trẻ 10 tuổi:</strong> Dùng ngôn từ đời thường, không dùng thuật ngữ chuyên môn phức tạp.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span><strong>Tìm lỗ hổng tư duy:</strong> Nơi nào bạn phải ngập ngừng hoặc tra cứu công thức chính là nơi bạn chưa hiểu bản chất.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <span><strong>Đơn giản hóa & Trực quan:</strong> Tạo mô hình thí nghiệm thực nghiệm để kiểm chứng.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Add Manual Note */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <BookOpen size={18} className="text-amber-400" />
                <span>Thêm Ghi Chú Nghiên Cứu Bản Chất</span>
              </h3>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-zinc-500 hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNote} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Môn học</label>
                <div className="flex gap-2">
                  {(['Vật Lý', 'Hóa Học', 'Sinh Học', 'STEM'] as const).map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setNewSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        newSubject === subj 
                          ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Tiêu đề bản chất</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tại sao phản ứng trao đổi ion cần điều kiện kết tủa?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Nội dung giải thích (Hỗ trợ Markdown)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Ghi chép lập luận logic First Principles, công thức, cạm bẫy học vẹt..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Thẻ phân loại (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trao Đổi Ion, BaSO4, Tích Số Tan"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-950/50 transition-all"
                >
                  Lưu Ghi Chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Docs Export Confirmation & Integration Modal */}
      <GoogleDocsExportModal
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
        options={googleDocsExportOptions}
      />
    </div>
  );
}
