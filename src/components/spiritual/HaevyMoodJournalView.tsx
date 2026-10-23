import React, { useState, useEffect, useMemo } from 'react';
import { 
  Smile, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Trash2, 
  Share2, 
  Check, 
  Plus, 
  Flame, 
  Heart, 
  BookOpen, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Filter,
  BarChart2,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { useAuth } from '../../context/AuthContext';
import { MoodJournalEntry } from '../../types';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

export interface MoodOption {
  emoji: string;
  label: string;
  sublabel: string;
  sentimentScore: number; // 1 to 5
  color: string;
  bgGlow: string;
  borderActive: string;
  textBadge: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    emoji: '🌟',
    label: 'Rực rỡ',
    sublabel: 'Tràn đầy cảm hứng & năng lượng vũ trụ',
    sentimentScore: 5,
    color: 'from-amber-400 to-yellow-500',
    bgGlow: 'bg-amber-500/20 text-amber-200',
    borderActive: 'border-amber-400 shadow-amber-500/30',
    textBadge: 'text-amber-300 bg-amber-950/60 border-amber-500/30'
  },
  {
    emoji: '😊',
    label: 'Vui tươi',
    sublabel: 'Biết ơn, yêu đời và nhẹ nhõm',
    sentimentScore: 4,
    color: 'from-emerald-400 to-teal-500',
    bgGlow: 'bg-emerald-500/20 text-emerald-200',
    borderActive: 'border-emerald-400 shadow-emerald-500/30',
    textBadge: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
  },
  {
    emoji: '🧘',
    label: 'Bình an',
    sublabel: 'Tĩnh tại, thanh thản và định tâm',
    sentimentScore: 3,
    color: 'from-sky-400 to-indigo-500',
    bgGlow: 'bg-sky-500/20 text-sky-200',
    borderActive: 'border-sky-400 shadow-sky-500/30',
    textBadge: 'text-sky-300 bg-sky-950/60 border-sky-500/30'
  },
  {
    emoji: '😐',
    label: 'Ổn định',
    sublabel: 'Bình thường, nhịp sống êm ả',
    sentimentScore: 2,
    color: 'from-zinc-400 to-slate-500',
    bgGlow: 'bg-zinc-500/20 text-zinc-200',
    borderActive: 'border-zinc-400 shadow-zinc-500/30',
    textBadge: 'text-zinc-300 bg-zinc-900 border-zinc-700'
  },
  {
    emoji: '😔',
    label: 'Chùng xuống',
    sublabel: 'Mệt mỏi, cần được chăm sóc & vỗ về',
    sentimentScore: 1,
    color: 'from-indigo-400 to-purple-600',
    bgGlow: 'bg-indigo-500/20 text-indigo-200',
    borderActive: 'border-indigo-400 shadow-indigo-500/30',
    textBadge: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30'
  },
  {
    emoji: '⚡',
    label: 'Áp lực',
    sublabel: 'Căng thẳng, cần thở sâu và buông bỏ',
    sentimentScore: 1,
    color: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-500/20 text-rose-200',
    borderActive: 'border-rose-400 shadow-rose-500/30',
    textBadge: 'text-rose-300 bg-rose-950/60 border-rose-500/30'
  }
];

export const QUICK_NOTE_SUGGESTIONS = [
  'Biết ơn vì một ngày bình an và tâm hồn thanh thản.',
  'Vừa hoàn thành một việc ý nghĩa, lòng thấy nhẹ nhõm.',
  'Cần một khoảng lặng nghe chuông 528Hz để nạp năng lượng.',
  'Gặp chút thử thách nhưng tin rằng mọi chuyện sẽ tốt đẹp.',
  'Cảm thấy gắn kết và ấm áp bên những người thân yêu.',
  'Tâm an thì vạn sự an — buông bỏ âu lo để đón nhận an lành.'
];

export const SPIRITUAL_TAGS = [
  'Biết Ơn',
  'Tĩnh Tâm',
  'Công Việc',
  'Gia Đình',
  'Tình Yêu',
  'Sức Khỏe',
  'Bản Thân'
];

// Sample default entries so chart looks rich on first visit
const DEFAULT_SAMPLE_ENTRIES: MoodJournalEntry[] = [
  {
    id: 'sample-1',
    userId: 'sample',
    emoji: '🧘',
    moodLabel: 'Bình an',
    sentimentScore: 3,
    note: 'Bắt đầu tuần mới với tâm thế thong dong và tĩnh tại.',
    tag: 'Tĩnh Tâm',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'sample-2',
    userId: 'sample',
    emoji: '😊',
    moodLabel: 'Vui tươi',
    sentimentScore: 4,
    note: 'Nhận được lời động viên ấm áp từ đồng nghiệp.',
    tag: 'Công Việc',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'sample-3',
    userId: 'sample',
    emoji: '⚡',
    moodLabel: 'Áp lực',
    sentimentScore: 1,
    note: 'Khá nhiều đầu việc dồn dập, tự nhủ thở sâu 3 nhịp.',
    tag: 'Công Việc',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'sample-4',
    userId: 'sample',
    emoji: '🧘',
    moodLabel: 'Bình an',
    sentimentScore: 3,
    note: 'Dành 15 phút thiền chuông xoay Tây Tạng lấy lại cân bằng.',
    tag: 'Tĩnh Tâm',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'sample-5',
    userId: 'sample',
    emoji: '😊',
    moodLabel: 'Vui tươi',
    sentimentScore: 4,
    note: 'Bữa tối sum vầy cùng gia đình đầy ắp tiếng cười.',
    tag: 'Gia Đình',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'sample-6',
    userId: 'sample',
    emoji: '🌟',
    moodLabel: 'Rực rỡ',
    sentimentScore: 5,
    note: 'Cảm nhận nguồn cảm hứng sáng tạo và may mắn tuôn trào.',
    tag: 'Biết Ơn',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

interface HaevyMoodJournalViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyMoodJournalView({ onEarnCoins }: HaevyMoodJournalViewProps) {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'guest_user';

  // State
  const [entries, setEntries] = useState<MoodJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[1]); // default 'Vui tươi'
  const [noteText, setNoteText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Biết Ơn');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [moodFilter, setMoodFilter] = useState<'all' | 'positive' | 'neutral' | 'challenging'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load entries from Firestore (or LocalStorage fallback)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const storageKey = `haevy_spiritual_moods_${currentUserId}`;

    // Read cached entries first
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          setIsLoading(false);
        }
      }
    } catch {
      // ignore
    }

    if (user && user.uid) {
      const moodPath = `users/${user.uid}/moodJournals`;
      try {
        const q = query(collection(db, 'users', user.uid, 'moodJournals'), orderBy('date', 'desc'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list: MoodJournalEntry[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                userId: data.userId || user.uid,
                emoji: data.emoji || '😊',
                moodLabel: data.moodLabel || 'Vui tươi',
                sentimentScore: typeof data.sentimentScore === 'number' ? data.sentimentScore : 3,
                note: data.note || '',
                tag: data.tag || 'Biết Ơn',
                date: data.date || new Date().toISOString().split('T')[0],
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
              });
            });

            if (list.length > 0) {
              setEntries(list);
              try {
                localStorage.setItem(storageKey, JSON.stringify(list));
              } catch {
                // ignore
              }
            } else {
              // If no entries yet, initialize with demo seeds
              setEntries(DEFAULT_SAMPLE_ENTRIES);
            }
            setIsLoading(false);
          },
          (err) => {
            console.warn('Firestore onSnapshot moodJournals notice:', err);
            // Fallback to local
            const localData = localStorage.getItem(storageKey);
            if (localData) {
              setEntries(JSON.parse(localData));
            } else {
              setEntries(DEFAULT_SAMPLE_ENTRIES);
            }
            setIsLoading(false);
          }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, moodPath);
      }
    } else {
      // Guest or local mode
      const local = localStorage.getItem(storageKey);
      if (local) {
        setEntries(JSON.parse(local));
      } else {
        setEntries(DEFAULT_SAMPLE_ENTRIES);
      }
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, currentUserId]);

  // Handle Create Entry
  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    haptics.impact('medium');
    setIsSubmitting(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntryPayload = {
      userId: currentUserId,
      emoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
      sentimentScore: selectedMood.sentimentScore,
      note: noteText.trim().slice(0, 140), // enforce 1-sentence brevity
      tag: selectedTag,
      date: todayStr,
      createdAt: new Date().toISOString()
    };

    try {
      if (user && user.uid) {
        const path = `users/${user.uid}/moodJournals`;
        try {
          const docRef = await addDoc(collection(db, 'users', user.uid, 'moodJournals'), {
            ...newEntryPayload,
            createdAt: serverTimestamp()
          });

          // Optimistically update local
          const createdEntry: MoodJournalEntry = {
            ...newEntryPayload,
            id: docRef.id
          };
          setEntries(prev => [createdEntry, ...prev.filter(p => p.id !== docRef.id)]);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        // Guest mode fallback
        const guestEntry: MoodJournalEntry = {
          ...newEntryPayload,
          id: `local-${Date.now()}`
        };
        const updated = [guestEntry, ...entries];
        setEntries(updated);
        try {
          localStorage.setItem(`haevy_spiritual_moods_${currentUserId}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      // Audio feedback & reward
      spiritualAudio.playSingingBowl(320);
      haptics.rewardClaim();

      if (onEarnCoins) {
        onEarnCoins(15, 'Ghi Nhật Ký Tâm Trạng (+15 Xu)');
      }

      setSuccessToast(`Đã lưu tâm trạng "${selectedMood.emoji} ${selectedMood.label}" (+15 Xu)`);
      setNoteText('');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (error) {
      console.error('Failed to save mood journal:', error);
      setSuccessToast('Đã lưu cục bộ vào thiết bị.');
      setTimeout(() => setSuccessToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    haptics.impact('light');
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi tâm trạng này?')) return;

    try {
      if (user && user.uid && !entryId.startsWith('sample-') && !entryId.startsWith('local-')) {
        const path = `users/${user.uid}/moodJournals/${entryId}`;
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'moodJournals', entryId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }

      const updated = entries.filter(e => e.id !== entryId);
      setEntries(updated);
      try {
        localStorage.setItem(`haevy_spiritual_moods_${currentUserId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Filtered entries for Timeline & History
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (moodFilter === 'positive') return e.sentimentScore >= 4;
      if (moodFilter === 'neutral') return e.sentimentScore === 3 || e.sentimentScore === 2;
      if (moodFilter === 'challenging') return e.sentimentScore <= 1;
      return true;
    });
  }, [entries, moodFilter]);

  // Data formatted for Recharts Sentiment Trend Chart
  const chartData = useMemo(() => {
    // Sort chronological (oldest to newest) for chart
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by time window
    const now = Date.now();
    const daysLimit = timeFilter === '7d' ? 7 : timeFilter === '14d' ? 14 : timeFilter === '30d' ? 30 : 365;
    const cutoffTime = now - daysLimit * 86400000;

    const filtered = sorted.filter(item => new Date(item.date).getTime() >= cutoffTime);

    // Group by day to show clean daily trend
    const map = new Map<string, { date: string; displayDate: string; score: number; count: number; note: string; emoji: string; label: string }>();

    filtered.forEach(entry => {
      const d = entry.date;
      const parsedDate = new Date(d);
      const displayDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}`;

      if (!map.has(d)) {
        map.set(d, {
          date: d,
          displayDate,
          score: entry.sentimentScore,
          count: 1,
          note: entry.note,
          emoji: entry.emoji,
          label: entry.moodLabel
        });
      } else {
        const curr = map.get(d)!;
        curr.score = (curr.score * curr.count + entry.sentimentScore) / (curr.count + 1);
        curr.count += 1;
        curr.note = entry.note;
        curr.emoji = entry.emoji;
        curr.label = entry.moodLabel;
      }
    });

    const result = Array.from(map.values()).map(v => ({
      ...v,
      score: Number(v.score.toFixed(1))
    }));

    return result;
  }, [entries, timeFilter]);

  // Compute Sentiment Statistics
  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { avgScore: 3, dominantMood: 'Bình an', streakDays: 1, positiveRatio: 100 };
    }

    const totalScore = entries.reduce((acc, curr) => acc + curr.sentimentScore, 0);
    const avgScore = Number((totalScore / entries.length).toFixed(1));

    // Count mood frequencies
    const countMap: Record<string, number> = {};
    let positiveCount = 0;
    entries.forEach(e => {
      countMap[e.moodLabel] = (countMap[e.moodLabel] || 0) + 1;
      if (e.sentimentScore >= 4) positiveCount++;
    });

    let dominantMood = 'Bình an';
    let maxCount = 0;
    Object.entries(countMap).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });

    const positiveRatio = Math.round((positiveCount / entries.length) * 100);

    return {
      avgScore,
      dominantMood,
      streakDays: Math.min(entries.length, 7),
      positiveRatio
    };
  }, [entries]);

  // Copy Note Helper
  const handleCopyNote = (entry: MoodJournalEntry) => {
    navigator.clipboard.writeText(`[Nhật Ký Tâm Trạng Haevy] ${entry.emoji} ${entry.moodLabel} (${entry.date}): "${entry.note}"`);
    haptics.impact('light');
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Hero Spiritual Mood Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-950 to-indigo-950/90 border border-purple-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Haevy Spiritual • Nhật Ký Tâm Trạng</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Lắng Nghe & Ghi Nhận Tâm Hồn
              <Smile className="w-6 h-6 text-amber-400 shrink-0" />
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Dành 30 giây mỗi ngày để quan sát cảm xúc bằng 1 biểu tượng và 1 câu chiêm nghiệm. 
              Dữ liệu được lưu trữ trực tiếp trên Firestore để theo dõi biểu đồ xu hướng năng lượng tinh thần theo thời gian.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto shrink-0">
            <div className="bg-zinc-900/80 border border-purple-500/30 p-3 rounded-2xl text-center shadow-lg backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Điểm Trung Bình</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-lg font-black text-amber-300">{stats.avgScore}</span>
                <span className="text-xs text-zinc-500">/ 5.0</span>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-purple-500/30 p-3 rounded-2xl text-center shadow-lg backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cảm Xúc Chủ Đạo</span>
              <span className="text-sm font-black text-purple-300 block truncate mt-0.5">
                {stats.dominantMood}
              </span>
            </div>

            <div className="bg-zinc-900/80 border border-purple-500/30 p-3 rounded-2xl text-center shadow-lg backdrop-blur-md col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Tỷ Lệ Tích Cực</span>
              <div className="flex items-center justify-center gap-1 mt-0.5 text-emerald-400 font-black text-lg">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.positiveRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="w-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
            Đã đồng bộ Firestore
          </span>
        </div>
      )}

      {/* Section 1: Quick Mood Prompt & Record Form */}
      <div className="bg-zinc-950/90 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Hôm nay bạn đang cảm thấy như thế nào?
              </h3>
              <p className="text-xs text-zinc-400">
                Chọn nhanh 1 biểu tượng cảm xúc và ghi lại 1 câu tâm sự ngắn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-950/50 border border-amber-500/30 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhận +15 Xu mỗi lượt ghi</span>
          </div>
        </div>

        {/* Emoji Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
            <span>1. Chọn Biểu Tượng Cảm Xúc:</span>
            <span className="text-purple-300 font-normal normal-case">({selectedMood.label} - Điểm {selectedMood.sentimentScore}/5)</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood.label === mood.label;
              return (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => {
                    haptics.impact('light');
                    spiritualAudio.playSingingBowl(200 + mood.sentimentScore * 35);
                    setSelectedMood(mood);
                  }}
                  className={`relative p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border text-center ${
                    isSelected
                      ? `${mood.bgGlow} ${mood.borderActive} scale-105 shadow-xl`
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <span className={`text-2xl sm:text-3xl transition-transform ${isSelected ? 'scale-125 animate-bounce' : 'hover:scale-110'}`}>
                    {mood.emoji}
                  </span>
                  <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {mood.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {mood.sentimentScore}/5
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400 italic px-1">
            "{selectedMood.sublabel}"
          </p>
        </div>

        {/* 1-Sentence Note Input */}
        <form onSubmit={handleSubmitEntry} className="space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
                <span>2. Ghi 1 Câu Tâm Sự Ngắn (Tối đa 140 ký tự):</span>
              </label>
              <span className={`text-[11px] font-mono font-bold ${noteText.length > 130 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {noteText.length}/140
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                maxLength={140}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ví dụ: Lòng nhẹ nhõm, biết ơn vì một ngày trôi qua bình an bên gia đình..."
                className="w-full bg-zinc-900/90 border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {noteText && (
                <button
                  type="button"
                  onClick={() => setNoteText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Quick Note Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 block">
              Gợi ý câu tâm sự nhanh 1-chạm:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {QUICK_NOTE_SUGGESTIONS.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    haptics.impact('light');
                    setNoteText(phrase);
                  }}
                  className="text-xs whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-purple-500/40 transition-all cursor-pointer shrink-0"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Spiritual Tag Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-zinc-400 mr-1">Chủ đề:</span>
              {SPIRITUAL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    haptics.impact('light');
                    setSelectedTag(tag);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !noteText.trim()}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                !noteText.trim()
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-purple-900/30 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu Lên Firestore...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Lưu Nhật Ký & Nhận +15 Xu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Sentiment Trend Chart Over Time */}
      <div className="bg-zinc-950/90 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Biểu Đồ Xu Hướng Tâm Trạng Theo Thời Gian
              </h3>
              <p className="text-xs text-zinc-400">
                Theo dõi biến thiên mức độ tích cực (thang điểm 1 - 5) qua từng ngày
              </p>
            </div>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            {(['7d', '14d', '30d', 'all'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => {
                  haptics.impact('light');
                  setTimeFilter(filter);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeFilter === filter
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {filter === '7d' ? '7 Ngày' : filter === '14d' ? '14 Ngày' : filter === '30d' ? '30 Ngày' : 'Tất Cả'}
              </button>
            ))}
          </div>
        </div>

        {/* The Recharts Sentiment Line/Area Chart */}
        <div className="w-full h-64 sm:h-72 pt-2">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Chưa có đủ dữ liệu để vẽ biểu đồ.</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Hãy ghi nhận tâm trạng đầu tiên của bạn ở biểu mẫu phía trên.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <ReferenceLine y={3} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Cân bằng (3.0)', fill: '#60a5fa', fontSize: 10, position: 'right' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 border border-purple-500/50 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-left max-w-xs space-y-1 z-50">
                          <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                            <span className="text-xs text-zinc-400 font-semibold">{data.date}</span>
                            <span className="text-xs font-black text-amber-300">
                              {data.score} / 5.0
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-xl">{data.emoji}</span>
                            <span className="text-xs font-bold text-white">{data.label}</span>
                          </div>
                          {data.note && (
                            <p className="text-[11px] text-zinc-300 italic pt-1 line-clamp-3">
                              "{data.note}"
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#sentimentGradient)" 
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend Explanations */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 px-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>5: Rực rỡ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>4: Vui tươi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>3: Bình an</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <span>2: Ổn định</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>1: Căng thẳng / Chùng</span>
            </span>
          </div>

          <span className="text-purple-300 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đồng bộ thời gian thực Firestore</span>
          </span>
        </div>
      </div>

      {/* Section 3: History & Log of Mood Entries */}
      <div className="bg-zinc-950/90 border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Dòng Thời Gian Nhật Ký Cảm Xúc
              </h3>
              <p className="text-xs text-zinc-400">
                {filteredEntries.length} bản ghi tâm sự được lưu giữ trong không gian tâm linh của bạn
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setMoodFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                moodFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setMoodFilter('positive')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                moodFilter === 'positive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Tích cực (4-5)
            </button>
            <button
              onClick={() => setMoodFilter('neutral')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                moodFilter === 'neutral'
                  ? 'bg-sky-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Bình yên (2-3)
            </button>
            <button
              onClick={() => setMoodFilter('challenging')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                moodFilter === 'challenging'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Cần cân bằng (1)
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <Smile className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-semibold">Chưa tìm thấy bản ghi nào với bộ lọc này.</p>
              <button
                onClick={() => setMoodFilter('all')}
                className="text-xs text-purple-400 hover:underline"
              >
                Xem lại tất cả nhật ký
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => {
              const moodOpt = MOOD_OPTIONS.find(m => m.label === entry.moodLabel) || MOOD_OPTIONS[1];
              return (
                <div
                  key={entry.id}
                  className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl shrink-0 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform">
                      {entry.emoji}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${moodOpt.textBadge}`}>
                          {entry.moodLabel} • {entry.sentimentScore}/5
                        </span>
                        {entry.tag && (
                          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                            #{entry.tag}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1 ml-auto sm:ml-0">
                          <Calendar className="w-3 h-3" />
                          <span>{entry.date}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed italic">
                        "{entry.note}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopyNote(entry)}
                      className="p-1.5 text-zinc-400 hover:text-purple-300 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Sao chép câu tâm sự"
                    >
                      {copiedId === entry.id ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                    </button>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Xóa bản ghi này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
