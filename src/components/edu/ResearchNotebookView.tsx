import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  Download,
  Copy,
  Check,
  Calculator,
  Atom,
  TestTube,
  Dna,
  Binary,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';
import { EduNotebookNote, EduLabSubject } from '../../types';

interface ResearchNotebookViewProps {
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenAiAssistant?: (prompt?: string) => void;
}

const DEFAULT_SEEDED_NOTES: EduNotebookNote[] = [
  {
    id: 'note-pendulum-core',
    title: 'Bản Chất Triệt Tiêu Khối Lượng Ở Con Lắc Đơn',
    subject: 'physics',
    tags: ['Cơ năng', 'Con lắc đơn', 'Quán tính'],
    firstPrincipleEssence: 'Khối lượng m xuất hiện đồng thời ở cả lực kéo về phục hồi (m·g·sinα) và gia tốc quán tính (a = F/m), nên triệt tiêu tuyệt đối.',
    content: `[GHI CHÉP NGHIÊN CỨU THỰC HÀNH HAEVY EDU]
- Thí nghiệm: Con lắc dây L = 2.0m, g = 9.81 m/s².
- Thử nghiệm 1: Quả nặng m = 0.5 kg -> Chu kỳ đo T = 2.838s.
- Thử nghiệm 2: Quả nặng m = 5.0 kg (gấp 10 lần) -> Chu kỳ đo T = 2.837s.
- Kết luận: Chu kỳ dao động T = 2π√(L/g) hoàn toàn độc lập với khối lượng m.
- Sai lầm học vẹt: Học sinh thường nghĩ vật nặng hơn sẽ rơi/dao động nhanh hơn vì lực hút mạnh hơn, nhưng quên mất khối lượng lớn hơn cũng đồng nghĩa quán tính cản trở gia tốc lớn hơn tương ứng!`,
    source: 'lab_experiment',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'note-titration-essence',
    title: 'Tại Sao Có Bước Nhảy pH Đột Ngột Khi Chuẩn Độ?',
    subject: 'chemistry',
    tags: ['Chuẩn độ', 'pH', 'Logarit', 'Arrhenius'],
    firstPrincipleEssence: 'Thang đo pH là hàm logarit bậc 10 (pH = -log[H+]). Khi [H+] giảm từ 10^-5 xuống 10^-9 chỉ cần 1 giọt NaOH dư, tạo bước nhảy vọt đồ thị.',
    content: `[PHÂN TÍCH BẢN CHẤT DUNG DỊCH ĐIỆN LY]
- Phản ứng: H+ + OH- -> H2O (phản ứng tạo chất điện ly cực yếu).
- Khi thêm từ 0ml đến 24.5ml NaOH 0.1M vào 25ml HCl 0.1M: pH chỉ tăng từ 1.0 lên khoảng 3.0 (tăng chậm).
- Nhưng từ 24.9ml đến 25.1ml (chỉ chênh lệch 0.2ml NaOH): pH vọt ngay từ 3.0 lên 11.0!
- Cốt lõi: Vì số mol H+ còn sót lại trong bình giảm theo cấp số nhân, 1 giọt kiềm cuối cùng lập tức đảo ngược trạng thái từ dư axit sang dư bazơ.`,
    source: 'ai_assistant',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'note-dna-base-pairs',
    title: 'Quy Tắc Bổ Sung A-T, G-C Dưới Góc Nhìn Liên Kết Hydro',
    subject: 'biology',
    tags: ['DNA', 'Di truyền', 'Liên kết Hydro'],
    firstPrincipleEssence: 'Kích thước không gian (1 purine 2 vòng + 1 pyrimidine 1 vòng = 2.0nm) và khoảng cách vị trí cầu hydro định đoạt tính bổ sung.',
    content: `[NGUYÊN LÝ PHÂN TỬ WATSON - CRICK]
- Adenine (A) luôn cặp với Thymine (T) bằng 2 liên kết Hydro.
- Guanine (G) luôn cặp với Cytosine (C) bằng 3 liên kết Hydro (bền vững hơn nhiệt động học).
- Tại sao A không thể bắt cặp với C? Vì sự định hướng của các nhóm donor (cho H) và acceptor (nhận H) bị lệch pha điện tích đẩy nhau, gây biến dạng trục xoắn kép.`,
    source: 'roadmap',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export function ResearchNotebookView({ onOpenLab, onOpenAiAssistant }: ResearchNotebookViewProps) {
  const [notes, setNotes] = useState<EduNotebookNote[]>(() => {
    try {
      const stored = localStorage.getItem('haevy_edu_notebook_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading notes:', e);
    }
    return DEFAULT_SEEDED_NOTES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<'all' | 'physics' | 'chemistry' | 'biology' | 'math' | 'general'>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for creating/editing note
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState<'physics' | 'chemistry' | 'biology' | 'math' | 'general'>('physics');
  const [formTags, setFormTags] = useState('');
  const [formEssence, setFormEssence] = useState('');
  const [formContent, setFormContent] = useState('');

  // Interactive Calculator State
  const [calcFormula, setCalcFormula] = useState<'pendulum' | 'ohm' | 'kinetic' | 'ph'>('pendulum');
  // Pendulum params
  const [calcPendulumL, setCalcPendulumL] = useState(2.0);
  const [calcPendulumG, setCalcPendulumG] = useState(9.81);
  // Ohm params
  const [calcOhmU, setCalcOhmU] = useState(12);
  const [calcOhmR, setCalcOhmR] = useState(24);
  // Kinetic params
  const [calcKineticM, setCalcKineticM] = useState(2);
  const [calcKineticV, setCalcKineticV] = useState(10);
  // pH params
  const [calcHConcentration, setCalcHConcentration] = useState(0.001);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('haevy_edu_notebook_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Error saving notes:', e);
    }
  }, [notes]);

  // Active note
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  // Filtered notes
  const filteredNotes = notes.filter(note => {
    const matchesSubject = filterSubject === 'all' || note.subject === filterSubject;
    const matchesQuery = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (note.firstPrincipleEssence && note.firstPrincipleEssence.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesQuery;
  });

  const handleCreateNew = () => {
    const newNote: EduNotebookNote = {
      id: `note-${Date.now()}`,
      title: 'Ghi chép nguyên lý mới',
      subject: 'physics',
      tags: ['Nguyên lý gốc'],
      firstPrincipleEssence: 'Bản chất logic cơ bản nhất của hiện tượng...',
      content: 'Nhập chi tiết quá trình quan sát, lập luận toán học hoặc các định luật bảo toàn liên quan...',
      source: 'manual',
      createdAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setFormTitle(newNote.title);
    setFormSubject(newNote.subject);
    setFormTags(newNote.tags.join(', '));
    setFormEssence(newNote.firstPrincipleEssence || '');
    setFormContent(newNote.content);
    setIsEditing(true);
  };

  const handleStartEdit = (note: EduNotebookNote) => {
    setFormTitle(note.title);
    setFormSubject(note.subject);
    setFormTags(note.tags.join(', '));
    setFormEssence(note.firstPrincipleEssence || '');
    setFormContent(note.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activeNote) return;
    const updated: EduNotebookNote = {
      ...activeNote,
      title: formTitle.trim() || 'Ghi chép chưa đặt tên',
      subject: formSubject,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      firstPrincipleEssence: formEssence.trim(),
      content: formContent.trim(),
      updatedAt: new Date().toISOString()
    };
    setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id) {
      setSelectedNoteId(remaining[0]?.id || '');
    }
  };

  const handleCopyNote = (note: EduNotebookNote) => {
    const text = `# ${note.title}
Môn: ${note.subject.toUpperCase()} | Tags: ${note.tags.join(', ')}
${note.firstPrincipleEssence ? `\n> Bản chất cốt lõi: ${note.firstPrincipleEssence}\n` : ''}
${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAllMarkdown = () => {
    const text = `# SỔ TAY NGHIÊN CỨU HỌC TẬP CHUYÊN SÂU - HAEVY EDU
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
Tổng số ghi chép: ${notes.length}

` + notes.map(n => `## ${n.title}
- Môn học: ${n.subject}
- Thẻ: ${n.tags.join(', ')}
- Thời gian: ${new Date(n.createdAt).toLocaleString('vi-VN')}
${n.firstPrincipleEssence ? `\n> **Bản chất First Principles:** ${n.firstPrincipleEssence}\n` : ''}
\`\`\`
${n.content}
\`\`\`
---
`).join('\n');

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haevy-edu-notebook-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculator outputs
  const calcPendulumPeriod = (2 * Math.PI * Math.sqrt(calcPendulumL / calcPendulumG)).toFixed(3);
  const calcOhmCurrent = calcOhmR > 0 ? (calcOhmU / calcOhmR).toFixed(3) : '0';
  const calcOhmPower = calcOhmR > 0 ? ((calcOhmU * calcOhmU) / calcOhmR).toFixed(2) : '0';
  const calcKineticEnergy = (0.5 * calcKineticM * calcKineticV * calcKineticV).toFixed(2);
  const calcPHValue = calcHConcentration > 0 ? (-Math.log10(calcHConcentration)).toFixed(2) : '14.00';

  const CONSTANTS_LIST = [
    { symbol: 'g', name: 'Gia tốc trọng trường', val: '9.80665 m/s²', copyVal: '9.80665' },
    { symbol: 'c', name: 'Vận tốc ánh sáng', val: '2.9979 × 10⁸ m/s', copyVal: '299792458' },
    { symbol: 'h', name: 'Hằng số Planck', val: '6.62607 × 10⁻³⁴ J·s', copyVal: '6.62607015e-34' },
    { symbol: 'N_A', name: 'Hằng số Avogadro', val: '6.02214 × 10²³ mol⁻¹', copyVal: '6.02214076e23' },
    { symbol: 'k_B', name: 'Hằng số Boltzmann', val: '1.38065 × 10⁻²³ J/K', copyVal: '1.380649e-23' },
    { symbol: 'R', name: 'Hằng số khí lý tưởng', val: '8.31446 J/(mol·K)', copyVal: '8.31446' },
    { symbol: 'e', name: 'Điện tích nguyên tố', val: '1.60218 × 10⁻¹⁹ C', copyVal: '1.602176634e-19' },
    { symbol: 'K_w', name: 'Tích số ion nước (25°C)', val: '1.0 × 10⁻¹⁴', copyVal: '1.0e-14' }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-amber-950/40 via-zinc-900 to-emerald-950/40 border border-amber-500/30 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/50">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 tracking-tight">
                  Sổ Tay Nghiên Cứu <span className="text-amber-400">& Luận Điểm STEM</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  {notes.length} Luận Điểm
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  Đồng Bộ Tự Động
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Nơi tổng hợp các phát hiện từ phòng thí nghiệm ảo, các phân tích nguyên lý gốc từ trợ lý AI và công cụ tính toán hằng số khoa học trực tiếp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleCreateNew}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all"
            >
              <Plus size={16} />
              <span>Tạo Ghi Chép Mới</span>
            </button>

            <button
              onClick={handleExportAllMarkdown}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-2 transition-all"
              title="Xuất toàn bộ sổ tay sang Markdown"
            >
              <Download size={14} className="text-amber-400" />
              <span>Xuất .MD</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Chips */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 mr-2 flex items-center gap-1.5">
            <Filter size={13} className="text-amber-400" />
            Lọc Theo Môn:
          </span>

          {[
            { id: 'all' as const, label: 'Tất Cả', icon: <Layers size={13} /> },
            { id: 'physics' as const, label: 'Vật Lý', icon: <Atom size={13} /> },
            { id: 'chemistry' as const, label: 'Hóa Học', icon: <TestTube size={13} /> },
            { id: 'biology' as const, label: 'Sinh Học', icon: <Dna size={13} /> },
            { id: 'math' as const, label: 'Toán & Tính Toán', icon: <Binary size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterSubject(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterSubject === tab.id
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/50'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Note list & Search (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, thẻ, nguyên lý..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Note List Scrollable */}
          <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
                Không tìm thấy ghi chép phù hợp. Nhấn "Tạo Ghi Chép Mới" để bắt đầu!
              </div>
            ) : (
              filteredNotes.map(note => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-950/20'
                        : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {note.title}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        note.subject === 'physics'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : note.subject === 'chemistry'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : note.subject === 'biology'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {note.subject}
                      </span>
                    </div>

                    {note.firstPrincipleEssence && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed italic border-l-2 border-amber-500/50 pl-2">
                        "{note.firstPrincipleEssence}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {note.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="bg-zinc-800/90 text-zinc-400 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Access to Lab / AI Assistant */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Học & Bóc Tách Bản Chất:</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenLab?.('physics', 'pendulum')}
                className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left text-xs text-zinc-300 transition-colors flex items-center gap-2"
              >
                <Atom size={14} className="text-cyan-400 shrink-0" />
                <span className="line-clamp-1 font-medium">Thí Nghiệm Vật Lý</span>
              </button>
              <button
                onClick={() => onOpenAiAssistant?.()}
                className="p-2.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left text-xs text-zinc-300 transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} className="text-emerald-400 shrink-0" />
                <span className="line-clamp-1 font-medium">Hỏi Trợ Lý AI</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Note Detail / Editor & Interactive Formula Lab (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Note View & Edit Panel */}
          {activeNote ? (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
              {isEditing ? (
                // Edit Mode
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-amber-300">Chỉnh Sửa Ghi Chép Nghiên Cứu</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-950/40 transition-colors"
                      >
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-zinc-400">Tiêu đề ghi chép:</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                        placeholder="Nhập tiêu đề..."
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-zinc-400">Môn học:</label>
                      <select
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value as any)}
                        className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="physics">Vật Lý</option>
                        <option value="chemistry">Hóa Học</option>
                        <option value="biology">Sinh Học</option>
                        <option value="math">Toán Học</option>
                        <option value="general">Tổng Quát</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-400">Bản chất cốt lõi (First Principle Essence):</label>
                    <input
                      type="text"
                      value={formEssence}
                      onChange={(e) => setFormEssence(e.target.value)}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                      placeholder="Nguyên lý gốc đằng sau hiện tượng..."
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-400">Thẻ từ khóa (cách nhau bởi dấu phẩy):</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      placeholder="Con lắc, Bảo toàn cơ năng, Chu kỳ"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-zinc-400">Nội dung ghi chép:</label>
                    <textarea
                      rows={8}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                      placeholder="Nhập chi tiết ghi chép..."
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase">
                          {activeNote.subject}
                        </span>
                        {activeNote.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                        {activeNote.title}
                      </h3>
                      <span className="text-[11px] text-zinc-500">
                        Khởi tạo lúc: {new Date(activeNote.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyNote(activeNote)}
                        className="p-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl transition-colors"
                        title="Sao chép toàn bộ ghi chép"
                      >
                        {copiedId === activeNote.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => handleStartEdit(activeNote)}
                        className="p-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl transition-colors"
                        title="Chỉnh sửa ghi chép"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(activeNote.id)}
                        className="p-2 bg-zinc-800/80 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 rounded-xl transition-colors"
                        title="Xóa ghi chép này"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Highlighted First Principle Box */}
                  {activeNote.firstPrincipleEssence && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                      <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-200/90 leading-relaxed">
                        <strong className="text-amber-300 block mb-0.5">Bản Chất First Principles Cốt Lõi:</strong>
                        {activeNote.firstPrincipleEssence}
                      </div>
                    </div>
                  )}

                  {/* Main Content Render */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                    {activeNote.content}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Interactive Scientific Calculator & Constants Table */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Máy Tính Kiểm Nghiệm Công Thức & Hằng Số Khoa Học</h3>
              </div>
              
              {/* Formula selector tabs */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
                <button
                  onClick={() => setCalcFormula('pendulum')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    calcFormula === 'pendulum' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Con Lắc (T)
                </button>
                <button
                  onClick={() => setCalcFormula('ohm')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    calcFormula === 'ohm' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Định Luật Ohm
                </button>
                <button
                  onClick={() => setCalcFormula('kinetic')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    calcFormula === 'kinetic' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Động Năng
                </button>
                <button
                  onClick={() => setCalcFormula('ph')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    calcFormula === 'ph' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Thang Đo pH
                </button>
              </div>
            </div>

            {/* Formula Interactive Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              {calcFormula === 'pendulum' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Công thức: T = 2π · √(L / g)</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">Chu kỳ T = {calcPendulumPeriod} giây</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Chiều dài dây L:</span>
                        <span className="text-zinc-200 font-mono">{calcPendulumL} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="5.0"
                        step="0.1"
                        value={calcPendulumL}
                        onChange={(e) => setCalcPendulumL(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Gia tốc trọng trường g:</span>
                        <span className="text-zinc-200 font-mono">{calcPendulumG} m/s²</span>
                      </div>
                      <input
                        type="range"
                        min="1.6"
                        max="24.8"
                        step="0.1"
                        value={calcPendulumG}
                        onChange={(e) => setCalcPendulumG(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcFormula === 'ohm' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Công thức: I = U / R & P = U · I</span>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-cyan-300 font-bold">I = {calcOhmCurrent} A</span>
                      <span className="text-amber-300 font-bold">P = {calcOhmPower} W</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Hiệu điện thế U:</span>
                        <span className="text-zinc-200 font-mono">{calcOhmU} V</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={calcOhmU}
                        onChange={(e) => setCalcOhmU(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Điện trở R:</span>
                        <span className="text-zinc-200 font-mono">{calcOhmR} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={calcOhmR}
                        onChange={(e) => setCalcOhmR(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcFormula === 'kinetic' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Công thức: Wđ = 1/2 · m · v²</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">Động năng Wđ = {calcKineticEnergy} Joules</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Khối lượng m:</span>
                        <span className="text-zinc-200 font-mono">{calcKineticM} kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="20"
                        step="0.5"
                        value={calcKineticM}
                        onChange={(e) => setCalcKineticM(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Vận tốc v:</span>
                        <span className="text-zinc-200 font-mono">{calcKineticV} m/s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={calcKineticV}
                        onChange={(e) => setCalcKineticV(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {calcFormula === 'ph' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Công thức: pH = -log₁₀[H⁺]</span>
                    <span className={`font-bold font-mono text-sm ${parseFloat(calcPHValue) < 7 ? 'text-rose-400' : parseFloat(calcPHValue) > 7 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      pH = {calcPHValue} ({parseFloat(calcPHValue) < 7 ? 'Axit' : parseFloat(calcPHValue) > 7 ? 'Bazơ' : 'Trung tính'})
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Nồng độ ion [H⁺]:</span>
                      <span className="text-zinc-200 font-mono">{calcHConcentration} M</span>
                    </div>
                    <input
                      type="range"
                      min="0.00000000000001"
                      max="1"
                      step="0.0001"
                      value={calcHConcentration}
                      onChange={(e) => setCalcHConcentration(parseFloat(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Constants Table */}
            <div>
              <span className="text-xs font-bold text-zinc-400 block mb-2">Bảng Tra Hằng Số Khoa Học Căn Bản:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONSTANTS_LIST.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigator.clipboard.writeText(c.copyVal);
                      setCopiedId(`const-${idx}`);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/50 text-left transition-all group"
                    title={`Click để copy giá trị ${c.copyVal}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">{c.symbol}</span>
                      {copiedId === `const-${idx}` ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{c.name}</div>
                    <div className="text-[11px] font-mono text-zinc-200 font-semibold">{c.val}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
