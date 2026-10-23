import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Star, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown, 
  BrainCircuit, 
  MessageSquare, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Layers, 
  FolderPlus, 
  PenTool,
  Lightbulb,
  Cloud,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { QuickNote, QuickNoteTag } from '../../types';
import { 
  createQuickNote, 
  deleteQuickNote, 
  toggleStarQuickNote, 
  subscribeToQuickNotes, 
  QUICK_NOTE_TAGS,
  formatQuickNotePromptForAI 
} from '../../services/quickNotesService';
import { haptics } from '../../utils/haptics';
import { useAuth } from '../../context/AuthContext';

interface FloatingQuickNoteWidgetProps {
  onNavigateToAI?: (prompt?: string, subTab?: string) => void;
  className?: string;
}

export function FloatingQuickNoteWidget({
  onNavigateToAI,
  className = ''
}: FloatingQuickNoteWidgetProps) {
  const { user } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<QuickNoteTag>('idea');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | QuickNoteTag>('all');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to persistent Firestore & local notes
  useEffect(() => {
    const unsubscribe = subscribeToQuickNotes(user?.uid, (notes) => {
      setQuickNotes(notes);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const handleDemoExpand = () => {
      setIsExpanded((prev) => !prev);
      haptics.impact('light');
    };
    window.addEventListener('haevy-onboarding-demo-quicknote', handleDemoExpand);
    return () => window.removeEventListener('haevy-onboarding-demo-quicknote', handleDemoExpand);
  }, []);

  // Handle fast save
  const handleSaveNote = async () => {
    const text = inputText.trim();
    if (!text || isSaving) return;

    setIsSaving(true);
    haptics.impact('medium');

    try {
      await createQuickNote(user?.uid, {
        content: text,
        tag: selectedTag,
        isStarred: false
      });

      setInputText('');
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    } catch (err) {
      console.warn('[QuickNote] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy note
  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    haptics.impact('light');
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    haptics.impact('light');
    await deleteQuickNote(user?.uid, id);
  };

  // Toggle star
  const handleToggleStar = async (id: string, currentVal: boolean) => {
    haptics.selection();
    await toggleStarQuickNote(user?.uid, id, !currentVal);
  };

  // Send to Haevy AI
  const handleSendToAI = (note: QuickNote) => {
    haptics.impact('medium');
    const prompt = formatQuickNotePromptForAI(note);
    if (onNavigateToAI) {
      onNavigateToAI(prompt, 'chat');
    }
  };

  // Filtered notes
  const filteredNotes = quickNotes.filter(note => {
    if (activeFilter === 'starred') return Boolean(note.isStarred);
    if (activeFilter === 'all') return true;
    return note.tag === activeFilter;
  });

  return (
    <div 
      data-onboarding="floating-widgets"
      className={`fixed bottom-24 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm sm:max-w-md w-full no-swipe ${className}`}
      data-no-swipe="true"
    >
      {/* 1. COLLAPSED FLOATING PILL / COMPACT BAR */}
      {!isExpanded ? (
        <div className="bg-zinc-950/95 border border-amber-500/40 rounded-2xl sm:rounded-full p-2 pl-3 sm:pl-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 shadow-amber-500/10 hover:border-amber-400 transition-all group">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              haptics.impact('light');
            }}
            className="flex items-center gap-2 text-left cursor-pointer group-hover:scale-[1.01] transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Lightbulb size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Ghi Chú Nhanh</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {quickNotes.length}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate max-w-[140px] sm:max-w-[180px]">
                {quickNotes[0] ? `"${quickNotes[0].content.slice(0, 25)}..."` : 'Lưu suy nghĩ thoáng qua...'}
              </p>
            </div>
          </button>

          {/* Quick inline 1-line thought submitter */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveNote();
            }}
            className="hidden sm:flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800 flex-1 ml-1"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nảy ra ý tưởng mới?..."
              className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-full px-1"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSaving}
              className="p-1 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-30 transition cursor-pointer shrink-0"
              title="Lưu ngay vào Firestore"
            >
              <Send size={11} />
            </button>
          </form>

          {/* Expand Full Notepad Button */}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              haptics.impact('light');
            }}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
            title="Mở sổ tay ý tưởng"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      ) : (
        /* 2. EXPANDED PERSISTENT FLOATING NOTEPAD */
        <div className="bg-zinc-950/98 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl space-y-3.5 border-amber-500/30 shadow-amber-500/15 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
                <Lightbulb size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Ý Tưởng Thoáng Qua</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-0.5">
                    <Cloud size={9} /> Firestore
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400">Tự động kết nối &amp; tra cứu trong Haevy AI Chat</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onNavigateToAI && quickNotes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    const prompt = `Tổng hợp và phân tích toàn bộ ${quickNotes.length} ghi chú/ý tưởng thoáng qua của tôi trên Haevy Portal, chỉ ra quy luật logic cốt lõi và hướng triển khai phù hợp nhất.`;
                    onNavigateToAI(prompt, 'chat');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Đưa toàn bộ ghi chú vào Haevy AI"
                >
                  <BrainCircuit size={11} className="text-purple-300" />
                  <span>AI Tổng Hợp</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  haptics.impact('light');
                }}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Thu gọn"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Quick Input Area */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSaveNote();
                  }
                }}
                placeholder="Ghi nhanh suy nghĩ, ý tưởng, câu hỏi bất chợt xuất hiện..."
                rows={2}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-700/80 focus:border-amber-400 text-xs text-white placeholder-zinc-500 outline-none resize-none transition-colors"
                autoFocus
              />
              {saveSuccessNotice && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-fadeIn">
                  <CheckCircle2 size={11} /> Đã lưu Firestore
                </div>
              )}
            </div>

            {/* Tag selector & Submit Button */}
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {QUICK_NOTE_TAGS.map(t => {
                  const isSelected = selectedTag === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTag(t.id);
                        haptics.selection();
                      }}
                      className={`px-2 py-0.8 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        isSelected 
                          ? `${t.bg} ${t.color} border ${t.border} shadow-sm font-black` 
                          : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSaveNote}
                disabled={!inputText.trim() || isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 ml-auto"
              >
                <Send size={12} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Lại'}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-1 border-t border-zinc-800 pt-2 text-[10px]">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                  activeFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Tất cả ({quickNotes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('starred')}
                className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-0.5 cursor-pointer ${
                  activeFilter === 'starred' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>Đã ghim</span>
              </button>
            </div>
          </div>

          {/* Saved Notes Scroll Area */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredNotes.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Chưa có ghi chú nào. Hãy gõ suy nghĩ thoáng qua của bạn ở trên!
              </div>
            ) : (
              filteredNotes.map(note => {
                const tagInfo = QUICK_NOTE_TAGS.find(t => t.id === note.tag) || QUICK_NOTE_TAGS[0];
                const relativeTime = getRelativeTime(note.createdAt);

                return (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${tagInfo.bg} ${tagInfo.color} border ${tagInfo.border} flex items-center gap-0.5`}>
                          <span>{tagInfo.icon}</span>
                          <span>{tagInfo.label}</span>
                        </span>
                        <span className="text-zinc-500 font-mono flex items-center gap-0.5">
                          <Clock size={9} /> {relativeTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStar(note.id, Boolean(note.isStarred))}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition"
                          title="Ghim ghi chú"
                        >
                          <Star size={12} className={note.isStarred ? 'fill-amber-400 text-amber-400' : ''} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyNote(note.id, note.content)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition"
                          title="Sao chép nội dung"
                        >
                          {copiedNoteId === note.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition"
                          title="Xóa ghi chú"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                      {note.content}
                    </p>

                    {/* Action: Send to AI */}
                    {onNavigateToAI && (
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendToAI(note)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <BrainCircuit size={11} />
                          <span>Hỏi AI Phân Tích Ý Tưởng Này →</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getRelativeTime(isoString: string): string {
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return new Date(isoString).toLocaleDateString('vi-VN');
  } catch {
    return 'Gần đây';
  }
}
