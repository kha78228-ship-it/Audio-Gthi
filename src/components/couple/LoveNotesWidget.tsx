import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Check, 
  Trash2, 
  Heart, 
  Pin, 
  Sparkles, 
  Calendar, 
  Clock, 
  AlertCircle,
  Coffee,
  Pill,
  PhoneCall,
  Smile,
  Flame,
  Send
} from 'lucide-react';
import { CoupleData } from '../../types';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface LoveNoteItem {
  id: string;
  coupleId: string;
  authorUid: string;
  authorName: string;
  content: string;
  category: 'health' | 'date' | 'wish' | 'reminder' | 'sweet';
  isPinned?: boolean;
  isCompleted?: boolean;
  completedAt?: any;
  targetTime?: string;
  createdAt: any;
}

const PRESET_REMINDERS = [
  { text: '💧 Nhớ uống đủ nước và ăn đúng bữa nha người thương!', category: 'health' as const },
  { text: '💊 Uống vitamin / thuốc đúng giờ nhé em/anh yêu!', category: 'health' as const },
  { text: '📞 Tối nay tụi mình gọi video tâm sự một chút nha!', category: 'date' as const },
  { text: '✨ Chúc người thương một ngày mới tràn ngập năng lượng!', category: 'wish' as const },
  { text: '🚗 Đi làm / đi học về cẩn thận, về đến nơi nhắn cho anh/em nhé!', category: 'reminder' as const },
  { text: '❤️ Yêu và nhớ bạn nhiều hơn ngày hôm qua!', category: 'sweet' as const }
];

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; badgeClass: string }> = {
  health: { label: 'Sức Khỏe', icon: '💊', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  date: { label: 'Hẹn Hò', icon: '🍷', badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  wish: { label: 'Lời Chúc', icon: '✨', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  reminder: { label: 'Nhắc Nhở', icon: '🔔', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  sweet: { label: 'Ngọt Ngào', icon: '💖', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
};

interface LoveNotesWidgetProps {
  couple: CoupleData;
  userUid?: string;
  onSendLovePing?: (type: 'kiss' | 'hug' | 'heartbeat' | 'rose' | 'coffee') => void;
}

export function LoveNotesWidget({ couple, userUid, onSendLovePing }: LoveNotesWidgetProps) {
  const [notes, setNotes] = useState<LoveNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'health' | 'date' | 'wish' | 'reminder' | 'sweet'>('reminder');
  const [targetTime, setTargetTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const isMePartner1 = couple.partner1.uid === userUid;
  const myPartnerName = (isMePartner1 ? couple.partner2?.nickname || couple.partner2?.name : couple.partner1?.nickname || couple.partner1?.name) || 'Người Thương';

  useEffect(() => {
    if (!couple || !couple.id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'couples', couple.id, 'loveNotes'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: LoveNoteItem[] = snap.docs.map(d => ({
        ...d.data(),
        id: d.id
      } as LoveNoteItem));
      setNotes(list);
      setLoading(false);
    }, (err) => {
      console.warn('Love notes snapshot error (fallback):', err);
      setLoading(false);
    });

    return () => unsub();
  }, [couple]);

  const handleAddNote = async (e?: React.FormEvent, customText?: string, customCat?: any) => {
    if (e) e.preventDefault();
    const content = (customText || noteContent).trim();
    if (!content || !couple.id || !userUid) return;

    setSubmitting(true);
    try {
      const authorName = (isMePartner1 ? couple.partner1.nickname || couple.partner1.name : couple.partner2?.nickname || couple.partner2?.name) || 'Người Thương';
      await addDoc(collection(db, 'couples', couple.id, 'loveNotes'), {
        coupleId: couple.id,
        authorUid: userUid,
        authorName,
        content,
        category: customCat || noteCategory,
        isPinned: false,
        isCompleted: false,
        targetTime: targetTime.trim() || null,
        createdAt: serverTimestamp()
      });

      // Reward points
      await updateDoc(doc(db, 'couples', couple.id), {
        lovePoints: (couple.lovePoints || 0) + 15
      });

      setNoteContent('');
      setTargetTime('');
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to create love note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (note: LoveNoteItem) => {
    if (!couple.id) return;
    const newStatus = !note.isCompleted;
    await updateDoc(doc(db, 'couples', couple.id, 'loveNotes', note.id), {
      isCompleted: newStatus,
      completedAt: newStatus ? serverTimestamp() : null
    });
  };

  const handleTogglePin = async (note: LoveNoteItem) => {
    if (!couple.id) return;
    await updateDoc(doc(db, 'couples', couple.id, 'loveNotes', note.id), {
      isPinned: !note.isPinned
    });
  };

  const handleDelete = async (noteId: string) => {
    if (!couple.id) return;
    await deleteDoc(doc(db, 'couples', couple.id, 'loveNotes', noteId));
  };

  const filteredNotes = notes.filter(n => {
    if (filter === 'active') return !n.isCompleted;
    if (filter === 'completed') return n.isCompleted;
    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...regularNotes];

  return (
    <div className="space-y-3.5 sm:space-y-5 rounded-2xl sm:rounded-3xl bg-zinc-900/90 border border-rose-500/30 p-3.5 xs:p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>Lời Nhắc Nhở & Lời Nhắn Yêu Thương</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {notes.filter(n => !n.isCompleted).length} việc
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400">
              Gửi lời quan tâm, nhắc nhở ăn uống, sức khỏe và việc cần làm cho {myPartnerName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Segmented */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 text-[11px] font-bold">
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'active' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Chưa Xong ({notes.filter(n => !n.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'completed' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Đã Xong ({notes.filter(n => n.isCompleted).length})
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Thêm Lời Nhắc</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Reminder Chips */}
      <div className="space-y-1.5">
        <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          <span>Gửi nhanh lời nhắc quan tâm mẫu:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_REMINDERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddNote(undefined, preset.text, preset.category)}
              className="px-2.5 py-1 rounded-xl bg-zinc-950/80 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/40 text-[10px] sm:text-xs text-zinc-300 hover:text-rose-200 transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1"
            >
              <span>{preset.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Note Form */}
      {isAddOpen && (
        <form onSubmit={handleAddNote} className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-rose-500/40 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Heart size={14} className="text-rose-400 fill-rose-400" />
              <span>Tạo lời nhắc / lời nhắn mới cho {myPartnerName}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Đóng
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Nội dung lời nhắn hoặc việc cần nhắc *</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="VD: Em nhớ uống 1 cốc nước ấm trước khi ngủ nhé, anh yêu em nhiều..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">Phân loại</label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="reminder">🔔 Việc Cần Nhắc</option>
                <option value="health">💊 Sức Khỏe & Ăn Uống</option>
                <option value="date">🍷 Hẹn Hò & Gặp Mặt</option>
                <option value="wish">✨ Lời Chúc Ngày Mới</option>
                <option value="sweet">💖 Lời Nhắn Yêu Thương</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">Khung giờ / Hẹn giờ (Tùy chọn)</label>
              <input
                type="text"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                placeholder="VD: 8h30 tối nay, Buổi sáng..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !noteContent.trim()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              <span>Gửi Lời Nhắc (+15 Điểm)</span>
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-6 text-center text-xs text-zinc-500">Đang tải lời nhắc yêu thương...</div>
        ) : sortedNotes.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Heart size={16} className="fill-rose-500" />
            </div>
            <p className="text-xs font-bold text-zinc-300">
              {filter === 'active' ? 'Chưa có lời nhắc nào đang chờ' : 'Chưa có lời nhắc nào hoàn thành'}
            </p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Hãy bấm vào các gợi ý gửi nhanh ở trên hoặc tạo lời nhắc quan tâm đầu tiên cho đối phương nhé!
            </p>
          </div>
        ) : (
          sortedNotes.map(note => {
            const catInfo = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.reminder;
            const isMyNote = note.authorUid === userUid;

            return (
              <div
                key={note.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-2.5 ${
                  note.isCompleted 
                    ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60' 
                    : note.isPinned 
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/30' 
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Checkbox button */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(note)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    note.isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-zinc-700 hover:border-rose-500 text-transparent hover:text-rose-400'
                  }`}
                  title={note.isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu đã hoàn thành'}
                >
                  <Check size={12} strokeWidth={3} />
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-black border flex items-center gap-0.5 ${catInfo.badgeClass}`}>
                      <span>{catInfo.icon}</span>
                      <span>{catInfo.label}</span>
                    </span>

                    {note.isPinned && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold flex items-center gap-0.5">
                        <Pin size={9} />
                        <span>Ghim</span>
                      </span>
                    )}

                    {note.targetTime && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock size={10} className="text-rose-400" />
                        <span>{note.targetTime}</span>
                      </span>
                    )}

                    <span className="text-[10px] text-zinc-500 font-medium">
                      • Bởi: <strong className="text-zinc-300 font-bold">{note.authorName}</strong>
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm text-zinc-200 leading-relaxed ${note.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                    {note.content}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(note)}
                    className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      note.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                  >
                    <Pin size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa lời nhắc"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
