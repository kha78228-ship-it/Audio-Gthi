import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Heart, 
  Clock, 
  MapPin, 
  Trash2, 
  Edit2, 
  Repeat, 
  Filter,
  CheckCircle2,
  Flower2,
  Droplets,
  CalendarDays,
  BookOpen,
  Send,
  MessageSquare,
  Smile,
  Image as ImageIcon,
  Music,
  Play,
  Check,
  Sun,
  CloudRain,
  Wind,
  Moon,
  Share2,
  Lock,
  UserCheck,
  PenTool
} from 'lucide-react';
import { CoupleData, CoupleEvent, CoupleDiary, Track } from '../../types';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface CoupleCalendarAndDiaryTabProps {
  couple: CoupleData;
  userUid?: string;
  customEvents: CoupleEvent[];
  diaries: CoupleDiary[];
  effectiveTracks: Track[];
  onPlayTrack?: (track: Track) => void;
  onCreateCustomEvent: (
    title: string, 
    targetDate: string, 
    icon: string, 
    category: CoupleEvent['category'], 
    badge: string, 
    note: string, 
    isYearlyRecurring: boolean
  ) => Promise<void>;
  onUpdateCustomEvent?: (eventId: string, data: Partial<CoupleEvent>) => Promise<void>;
  onDeleteCustomEvent: (eventId: string) => Promise<void>;
  onCreateDiary: (
    title: string, 
    content: string, 
    date: string, 
    mood: string, 
    weather: string, 
    photoUrl?: string, 
    trackId?: string
  ) => Promise<void>;
  onDeleteDiary: (diaryId: string) => Promise<void>;
  onAddDiaryComment: (diaryId: string, text: string) => Promise<void>;
  onToggleDiaryReaction: (diaryId: string, emoji: string) => Promise<void>;
}

const PRESET_ICONS = ['💖', '🎂', '🍷', '🏖️', '💍', '🎬', '🏠', '🎁', '✈️', '🌸', '☕', '🚀', '🍰', '🥂', '🌟', '🧸'];

const PRESET_CATEGORIES: { id: CoupleEvent['category']; label: string; badge: string; icon: string }[] = [
  { id: 'date_night', label: 'Hẹn Hò Lãng Mạn', badge: 'Hẹn Hò', icon: '🍷' },
  { id: 'milestone', label: 'Cột Mốc Kỷ Niệm', badge: 'Kỷ Niệm', icon: '💍' },
  { id: 'birthday', label: 'Sinh Nhật', badge: 'Sinh Nhật', icon: '🎂' },
  { id: 'trip', label: 'Du Lịch / Chuyến Đi', badge: 'Du Lịch', icon: '🏖️' },
  { id: 'promise', label: 'Lời Hứa Đôi', badge: 'Lời Hứa', icon: '💖' },
  { id: 'custom', label: 'Sự Kiện Khác', badge: 'Sự Kiện', icon: '🎉' },
];

const MOOD_PRESETS = [
  { id: 'happy', label: 'Hạnh Phúc', icon: '🥰', color: 'from-amber-500/20 to-orange-500/20 text-amber-300' },
  { id: 'sweet', label: 'Ngọt Ngào', icon: '💕', color: 'from-rose-500/20 to-pink-500/20 text-rose-300' },
  { id: 'missing', label: 'Nhớ Nhung', icon: '🥺', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300' },
  { id: 'peaceful', label: 'Bình Yên', icon: '🍃', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300' },
  { id: 'romantic', label: 'Lãng Mạn', icon: '🌹', color: 'from-pink-500/20 to-rose-500/20 text-pink-300' },
  { id: 'cozy', label: 'Ấm Áp', icon: '☕', color: 'from-amber-600/20 to-yellow-600/20 text-amber-200' },
  { id: 'sulking', label: 'Giận Hờn Nhẹ', icon: '😤', color: 'from-red-500/20 to-rose-500/20 text-rose-400' },
];

const WEATHER_PRESETS = [
  { id: 'sunny', label: 'Nắng Đẹp', icon: '☀️' },
  { id: 'rainy', label: 'Mưa Rơi', icon: '🌧️' },
  { id: 'cold', label: 'Se Lạnh', icon: '❄️' },
  { id: 'sunset', label: 'Hoàng Hôn', icon: '🌅' },
  { id: 'night', label: 'Đêm Sao', icon: '🌙' },
];

const REACTION_EMOJIS = ['💖', '💋', '🫂', '🌹', '🥺', '✨'];

export function CoupleCalendarAndDiaryTab({
  couple,
  userUid,
  customEvents,
  diaries,
  effectiveTracks,
  onPlayTrack,
  onCreateCustomEvent,
  onUpdateCustomEvent,
  onDeleteCustomEvent,
  onCreateDiary,
  onDeleteDiary,
  onAddDiaryComment,
  onToggleDiaryReaction
}: CoupleCalendarAndDiaryTabProps) {
  const isMePartner1 = couple.partner1.uid === userUid;
  const myNickname = isMePartner1 ? couple.partner1.nickname || 'Bạn' : couple.partner2?.nickname || 'Bạn';

  // Sub-view switcher: 'all' (Tất cả Lịch & Nhật ký), 'calendar' (Chỉ Lịch), 'diary' (Chỉ Nhật ký)
  const [subView, setSubView] = useState<'calendar' | 'diary'>('calendar');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Add Event Form State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDay);
  const [eventIcon, setEventIcon] = useState('💖');
  const [eventCategory, setEventCategory] = useState<CoupleEvent['category']>('date_night');
  const [eventBadge, setEventBadge] = useState('Hẹn Hò');
  const [eventNote, setEventNote] = useState('');
  const [eventRecurring, setEventRecurring] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // New Diary Modal State
  const [isWriteDiaryOpen, setIsWriteDiaryOpen] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryDate, setDiaryDate] = useState(() => selectedDay || new Date().toISOString().split('T')[0]);
  const [diaryMood, setDiaryMood] = useState('sweet');
  const [diaryWeather, setDiaryWeather] = useState('sunny');
  const [diaryPhotoUrl, setDiaryPhotoUrl] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [submittingDiary, setSubmittingDiary] = useState(false);

  // Comments state per diary
  const [activeCommentDiaryId, setActiveCommentDiaryId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.toISOString().split('T')[0]);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month details
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Period cycle overlay calculations for the active month
  const cycleConfig = couple.cycleConfig;
  const cycleLen = cycleConfig?.cycleLengthDays || 28;
  const periodLen = cycleConfig?.periodDurationDays || 5;

  const isPeriodDay = (dateStr: string) => {
    if (!cycleConfig?.lastPeriodStartDate) return false;
    const base = new Date(cycleConfig.lastPeriodStartDate);
    const target = new Date(dateStr);
    const diffDays = Math.floor((target.getTime() - base.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return false;
    const dayInCycle = (diffDays % cycleLen) + 1;
    return dayInCycle >= 1 && dayInCycle <= periodLen;
  };

  const isOvulationDay = (dateStr: string) => {
    if (!cycleConfig?.lastPeriodStartDate) return false;
    const base = new Date(cycleConfig.lastPeriodStartDate);
    const target = new Date(dateStr);
    const diffDays = Math.floor((target.getTime() - base.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return false;
    const dayInCycle = (diffDays % cycleLen) + 1;
    const ovulationDayNum = cycleLen - 14;
    return dayInCycle >= (ovulationDayNum - 1) && dayInCycle <= (ovulationDayNum + 1);
  };

  // Check if date is anniversary
  const isAnniversaryDay = (dateStr: string) => {
    if (!couple.anniversaryDate) return false;
    const anni = new Date(couple.anniversaryDate);
    const target = new Date(dateStr);
    return anni.getDate() === target.getDate() && anni.getMonth() === target.getMonth();
  };

  // Get custom events for a specific date (handling yearly recurrence)
  const getEventsForDate = (dateStr: string) => {
    const target = new Date(dateStr);
    const targetMonth = target.getMonth();
    const targetDay = target.getDate();

    return customEvents.filter(ev => {
      const evDate = new Date(ev.targetDate);
      if (ev.isYearlyRecurring) {
        return evDate.getMonth() === targetMonth && evDate.getDate() === targetDay;
      }
      return ev.targetDate === dateStr;
    });
  };

  // Get diaries for a specific date
  const getDiariesForDate = (dateStr: string) => {
    return diaries.filter(d => d.date === dateStr);
  };

  const daysLeftCalculate = (targetDateStr: string, isYearly = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    if (isYearly) {
      target.setFullYear(today.getFullYear());
      if (target.getTime() < today.getTime()) {
        target.setFullYear(today.getFullYear() + 1);
      }
    }

    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  // Filtered upcoming events list
  const upcomingEvents = useMemo(() => {
    return customEvents
      .filter(ev => filterCategory === 'all' || ev.category === filterCategory)
      .map(ev => ({
        ...ev,
        daysLeft: daysLeftCalculate(ev.targetDate, ev.isYearlyRecurring)
      }))
      .sort((a, b) => {
        if (a.daysLeft >= 0 && b.daysLeft >= 0) return a.daysLeft - b.daysLeft;
        if (a.daysLeft < 0 && b.daysLeft < 0) return b.daysLeft - a.daysLeft;
        return a.daysLeft >= 0 ? -1 : 1;
      });
  }, [customEvents, filterCategory]);

  const selectedDayEvents = getEventsForDate(selectedDay);
  const selectedDayDiaries = getDiariesForDate(selectedDay);

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    setSubmittingEvent(true);
    try {
      await onCreateCustomEvent(
        eventTitle.trim(),
        eventDate,
        eventIcon,
        eventCategory,
        eventBadge,
        eventNote.trim(),
        eventRecurring
      );
      setIsAddEventOpen(false);
      setEventTitle('');
      setEventNote('');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleCreateDiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() || !diaryContent.trim()) return;
    setSubmittingDiary(true);
    try {
      await onCreateDiary(
        diaryTitle.trim(),
        diaryContent.trim(),
        diaryDate,
        diaryMood,
        diaryWeather,
        diaryPhotoUrl.trim() || undefined,
        selectedTrackId || undefined
      );
      setIsWriteDiaryOpen(false);
      setDiaryTitle('');
      setDiaryContent('');
      setDiaryPhotoUrl('');
      setSelectedTrackId('');
    } finally {
      setSubmittingDiary(false);
    }
  };

  const handleSendComment = async (diaryId: string) => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      await onAddDiaryComment(diaryId, commentText.trim());
      setCommentText('');
      setActiveCommentDiaryId(null);
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & QUICK ACTION DOCK */}
      <div className="p-4 xs:p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-950/70 via-zinc-900 to-zinc-950 border border-rose-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-rose-500/30">
            <Sparkles size={12} className="text-rose-400" />
            <span>Lịch Hẹn Hò & Nhật Ký Tình Yêu Chung</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Lịch Đôi & Nhật Ký</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Lưu giữ mọi ngày hẹn hò, lời hứa, cột mốc kỷ niệm cùng từng trang nhật ký ngọt ngào của hai bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-view switcher */}
          <div className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => setSubView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subView === 'calendar'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays size={13} />
              <span>Lịch Hẹn Hò ({customEvents.length})</span>
            </button>
            <button
              onClick={() => setSubView('diary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subView === 'diary'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span>Nhật Ký Đôi ({diaries.length})</span>
            </button>
          </div>

          {/* Quick Add Buttons */}
          <button
            onClick={() => {
              setEventDate(selectedDay);
              setIsAddEventOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={14} className="text-rose-400" />
            <span>+ Sự Kiện</span>
          </button>

          <button
            onClick={() => {
              setDiaryDate(selectedDay);
              setIsWriteDiaryOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <PenTool size={14} />
            <span>+ Viết Nhật Ký</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VIEW: CALENDAR VIEW */}
      {/* ============================================================= */}
      {subView === 'calendar' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left: Interactive Calendar Grid (7 cols) */}
            <div className="lg:col-span-7 p-4 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-rose-400" />
                  <h3 className="text-sm sm:text-base font-black text-white capitalize">
                    Tháng {month + 1}, {year}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={jumpToToday}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-colors cursor-pointer mr-1"
                  >
                    Hôm Nay
                  </button>
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Sự Kiện Đôi</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Nhật Ký 📖</span>
                </span>
                {cycleConfig?.lastPeriodStartDate && (
                  <>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-600/40">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>Kỳ Kinh</span>
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      <span>Rụng Trứng 🌸</span>
                    </span>
                  </>
                )}
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] sm:text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div className="text-rose-400">CN</div>
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div className="text-rose-400">T7</div>
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Empty cells before start day */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[44px] sm:min-h-[56px] rounded-xl bg-zinc-950/20 border border-transparent opacity-20" />
                ))}

                {/* Days of month */}
                {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                  const isSelected = selectedDay === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  const isAnni = isAnniversaryDay(dateStr);
                  const isPeriod = isPeriodDay(dateStr);
                  const isOvul = isOvulationDay(dateStr);
                  const dayEvents = getEventsForDate(dateStr);
                  const dayDiaries = getDiariesForDate(dateStr);

                  return (
                    <button
                      key={`day-${dayNumber}`}
                      onClick={() => setSelectedDay(dateStr)}
                      className={`relative min-h-[44px] sm:min-h-[56px] p-1 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-white scale-105 z-10 bg-zinc-800'
                          : isAnni
                          ? 'bg-rose-950/80 border-rose-500/60 text-white shadow-sm'
                          : isPeriod
                          ? 'bg-rose-950/50 border-rose-500/30 text-rose-200'
                          : isOvul
                          ? 'bg-pink-950/40 border-pink-500/30 text-pink-200'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <span className={`text-[11px] sm:text-xs font-mono font-bold ${
                          isToday ? 'px-1 rounded bg-rose-500 text-white font-black' : ''
                        }`}>
                          {dayNumber}
                        </span>

                        {isAnni && <span className="text-[10px]" title="Ngày kỷ niệm tình yêu">💍</span>}
                        {isOvul && !isAnni && <span className="text-[10px]" title="Rụng trứng">🌸</span>}
                        {isPeriod && !isAnni && !isOvul && <span className="text-[9px] text-rose-400" title="Kỳ kinh">🩸</span>}
                      </div>

                      {/* Events and diaries indicators */}
                      <div className="flex items-center gap-0.5 mt-auto">
                        {dayEvents.slice(0, 2).map((ev, eIdx) => (
                          <span key={eIdx} className="text-[10px]" title={ev.title}>
                            {ev.icon || '💖'}
                          </span>
                        ))}
                        {dayDiaries.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title={`Có ${dayDiaries.length} trang nhật ký`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Day Details & Quick Add for this Day (5 cols) */}
            <div className="lg:col-span-5 p-4 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Chi Tiết Ngày Đang Chọn</div>
                    <div className="text-sm sm:text-base font-black text-white">
                      {new Date(selectedDay).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEventDate(selectedDay);
                        setIsAddEventOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Sự Kiện</span>
                    </button>
                    <button
                      onClick={() => {
                        setDiaryDate(selectedDay);
                        setIsWriteDiaryOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <PenTool size={12} />
                      <span>Nhật Ký</span>
                    </button>
                  </div>
                </div>

                {/* Events list for selected date */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  <div className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                    <span>Sự kiện trong ngày ({selectedDayEvents.length}):</span>
                  </div>
                  {selectedDayEvents.length === 0 ? (
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-500 text-center">
                      Chưa có sự kiện hẹn hò nào trong ngày này.
                    </div>
                  ) : (
                    selectedDayEvents.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 transition-all flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{ev.icon || '💖'}</span>
                            <span className="text-xs font-bold text-white">{ev.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold">
                              {ev.badge || 'Hẹn Hò'}
                            </span>
                          </div>
                          {ev.note && <p className="text-[11px] text-zinc-400 italic">"{ev.note}"</p>}
                        </div>
                        <button
                          onClick={() => onDeleteCustomEvent(ev.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Xoá sự kiện"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Diaries list for selected date */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  <div className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                    <span>Nhật ký trong ngày ({selectedDayDiaries.length}):</span>
                  </div>
                  {selectedDayDiaries.length === 0 ? (
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-500 text-center">
                      Chưa có trang nhật ký nào viết vào ngày này.
                    </div>
                  ) : (
                    selectedDayDiaries.map(d => (
                      <div key={d.id} className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>📖</span>
                            <span>{d.title}</span>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">
                            bởi {d.authorUid === couple.partner1.uid ? couple.partner1.nickname : couple.partner2?.nickname || 'Người Ấy'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2">{d.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick View Switch */}
              <button
                onClick={() => setSubView('diary')}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
              >
                <BookOpen size={14} className="text-purple-400" />
                <span>Xem Tất Cả Các Trang Nhật Ký Tình Yêu ({diaries.length})</span>
              </button>
            </div>
          </div>

          {/* UPCOMING EVENTS LIST */}
          <div className="p-4 xs:p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Clock size={16} className="text-rose-400" />
                  <span>Danh Sách Sự Kiện Sắp Diễn Ra</span>
                </h3>
                <p className="text-xs text-zinc-400">Đếm ngược những ngày kỷ niệm và hẹn hò lãng mạn của hai bạn</p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === 'all' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Tất Cả
                </button>
                {PRESET_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      filterCategory === cat.id ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.icon} {cat.badge}
                  </button>
                ))}
              </div>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
                <CalendarIcon size={24} className="mx-auto text-zinc-600 mb-1" />
                <p>Chưa có sự kiện nào trong danh mục này.</p>
                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 hover:bg-rose-500/30 transition-all cursor-pointer"
                >
                  + Thêm Sự Kiện Ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingEvents.map(ev => {
                  const isFuture = ev.daysLeft >= 0;
                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 transition-all space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ev.icon || '💖'}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[140px]">{ev.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isFuture ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {isFuture ? (ev.daysLeft === 0 ? 'Hôm Nay!' : `Còn ${ev.daysLeft} ngày`) : `Đã qua ${Math.abs(ev.daysLeft)} ngày`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                        <span>📅 {new Date(ev.targetDate).toLocaleDateString('vi-VN')}</span>
                        {ev.isYearlyRecurring && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1">
                            <Repeat size={10} /> Hằng năm
                          </span>
                        )}
                      </div>

                      {ev.note && <p className="text-[11px] text-zinc-400 italic line-clamp-1">"{ev.note}"</p>}

                      <button
                        onClick={() => onDeleteCustomEvent(ev.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Xoá sự kiện"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW: DIARY FEED VIEW */}
      {/* ============================================================= */}
      {subView === 'diary' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="p-4 xs:p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-400" />
                  <span>Dòng Thời Gian Nhật Ký Tình Yêu</span>
                </h3>
                <p className="text-xs text-zinc-400">Chia sẻ cảm xúc chân thành, hình ảnh kỷ niệm và giai điệu tình ca</p>
              </div>

              <button
                onClick={() => setIsWriteDiaryOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Viết Trang Nhật Ký Mới</span>
              </button>
            </div>

            {diaries.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs space-y-3">
                <BookOpen size={32} className="mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">Chưa có trang nhật ký nào!</p>
                <p>Hãy viết trang nhật ký đầu tiên để lưu giữ những kỷ niệm đẹp của hai đứa.</p>
                <button
                  onClick={() => setIsWriteDiaryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Viết Nhật Ký Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {diaries.map(diary => {
                  const authorIsPartner1 = diary.authorUid === couple.partner1.uid;
                  const authorName = authorIsPartner1 ? couple.partner1.nickname || 'Anh Yêu' : couple.partner2?.nickname || 'Em Yêu';
                  const authorAvatar = authorIsPartner1 ? couple.partner1.photoURL : couple.partner2?.photoURL;
                  const isMyDiary = diary.authorUid === userUid;
                  const moodInfo = MOOD_PRESETS.find(m => m.id === diary.mood) || MOOD_PRESETS[0];
                  const weatherInfo = WEATHER_PRESETS.find(w => w.id === diary.weather);
                  const attachedTrack = effectiveTracks.find(t => t.id === diary.audioTrackId);

                  return (
                    <div
                      key={diary.id}
                      className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3.5 relative group"
                    >
                      {/* Diary Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover border border-rose-500/40"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white">{authorName}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r ${moodInfo.color}`}>
                                {moodInfo.icon} {moodInfo.label}
                              </span>
                              {weatherInfo && (
                                <span className="text-xs" title={weatherInfo.label}>{weatherInfo.icon}</span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              📅 {new Date(diary.date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>

                        {isMyDiary && (
                          <button
                            onClick={() => onDeleteDiary(diary.id)}
                            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Xoá nhật ký"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Diary Title & Body */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm sm:text-base font-black text-white">{diary.title}</h4>
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{diary.content}</p>
                      </div>

                      {/* Photo Attachment */}
                      {diary.photoUrls && diary.photoUrls.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-zinc-800 max-h-[360px] bg-black">
                          <img
                            src={diary.photoUrls[0]}
                            alt={diary.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Music Attachment */}
                      {attachedTrack && (
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                              <Music size={15} />
                            </div>
                            <div className="truncate text-xs">
                              <div className="font-bold text-white truncate">{attachedTrack.title}</div>
                              <div className="text-[10px] text-zinc-400 truncate">{attachedTrack.artist}</div>
                            </div>
                          </div>
                          {onPlayTrack && (
                            <button
                              onClick={() => onPlayTrack(attachedTrack)}
                              className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shrink-0"
                            >
                              <Play size={13} className="fill-white" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reaction bar */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-900">
                        {REACTION_EMOJIS.map(emoji => {
                          const reactions = diary.reactions?.[emoji] || [];
                          const hasReacted = reactions.includes(userUid || '');
                          return (
                            <button
                              key={emoji}
                              onClick={() => onToggleDiaryReaction(diary.id, emoji)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                hasReacted
                                  ? 'bg-rose-500/30 border border-rose-500 text-white scale-105'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                              }`}
                            >
                              <span>{emoji}</span>
                              {reactions.length > 0 && <span>{reactions.length}</span>}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setActiveCommentDiaryId(activeCommentDiaryId === diary.id ? null : diary.id)}
                          className="ml-auto px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-800 transition-all cursor-pointer"
                        >
                          <MessageSquare size={13} />
                          <span>Bình luận ({diary.comments?.length || 0})</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {activeCommentDiaryId === diary.id && (
                        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 animate-in fade-in">
                          {/* List comments */}
                          {diary.comments && diary.comments.length > 0 && (
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {diary.comments.map(c => (
                                <div key={c.id} className="p-2 rounded-xl bg-zinc-950 text-xs space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                    <span className="font-bold text-rose-300">{c.authorName}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-zinc-200">{c.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Write comment */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(diary.id)}
                              placeholder="Gửi lời yêu thương..."
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                            />
                            <button
                              onClick={() => handleSendComment(diary.id)}
                              disabled={commentSubmitting || !commentText.trim()}
                              className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 cursor-pointer"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD CUSTOM EVENT */}
      {/* ============================================================= */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-rose-500/40 p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📅</span>
                  <span>Thêm Sự Kiện Hẹn Hò & Kỷ Niệm</span>
                </h3>
                <p className="text-xs text-zinc-400">Tạo lời nhắc và đếm ngược sự kiện đôi</p>
              </div>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên sự kiện / Ngày kỷ niệm *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="VD: Kỷ niệm 1 năm yêu nhau, Đi xem phim, Sinh nhật em..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày diễn ra *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Danh mục</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => {
                      const cat = e.target.value as CoupleEvent['category'];
                      setEventCategory(cat);
                      const p = PRESET_CATEGORIES.find(c => c.id === cat);
                      if (p) {
                        setEventBadge(p.badge);
                        setEventIcon(p.icon);
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Chọn biểu tượng đại diện:</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEventIcon(ic)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all cursor-pointer ${
                        eventIcon === ic ? 'bg-rose-500/30 border-2 border-rose-500 scale-110' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ghi chú hoặc địa điểm (Tùy chọn)</label>
                <input
                  type="text"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="VD: Quán cà phê bờ hồ lúc 19h..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              {/* Recurring */}
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={eventRecurring}
                  onChange={(e) => setEventRecurring(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Lặp lại hằng năm (Dành cho ngày sinh nhật, ngày kỷ niệm)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submittingEvent ? 'Đang Lưu...' : 'Thêm Sự Kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: WRITE LOVE DIARY */}
      {/* ============================================================= */}
      {isWriteDiaryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/40 p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>✍️</span>
                  <span>Viết Trang Nhật Ký Tình Yêu Mới</span>
                </h3>
                <p className="text-xs text-zinc-400">Lưu lại những cảm xúc và lời nhắn gửi đến người ấy</p>
              </div>
              <button
                onClick={() => setIsWriteDiaryOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiarySubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tiêu đề nhật ký *</label>
                <input
                  type="text"
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  placeholder="VD: Một ngày mưa thật bình yên bên em..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày ghi nhật ký</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Thời tiết hôm nay</label>
                  <select
                    value={diaryWeather}
                    onChange={(e) => setDiaryWeather(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  >
                    {WEATHER_PRESETS.map(w => (
                      <option key={w.id} value={w.id}>{w.icon} {w.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mood Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tâm trạng của bạn:</label>
                <div className="flex flex-wrap gap-1.5">
                  {MOOD_PRESETS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDiaryMood(m.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        diaryMood === m.id
                          ? 'bg-purple-500 text-white scale-105 shadow-md'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nội dung nhật ký *</label>
                <textarea
                  rows={4}
                  value={diaryContent}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  placeholder="Viết những suy nghĩ chân thật và yêu thương nhất..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Photo Upload Picker */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <ImageIcon size={13} className="text-purple-400" />
                  <span>Ảnh đính kèm (Tùy chọn)</span>
                </label>
                <ImageUploadPicker
                  value={diaryPhotoUrl}
                  onChange={setDiaryPhotoUrl}
                  label="Ảnh kỷ niệm đính kèm"
                  helperText="Dán link ảnh hoặc tải ảnh lên trực tiếp"
                />
              </div>

              {/* Song selection */}
              {effectiveTracks.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                    <Music size={13} className="text-rose-400" />
                    <span>Giai điệu tình ca đính kèm</span>
                  </label>
                  <select
                    value={selectedTrackId}
                    onChange={(e) => setSelectedTrackId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="">-- Không đính kèm bài hát --</option>
                    {effectiveTracks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} - {t.artist}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsWriteDiaryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingDiary}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submittingDiary ? 'Đang Lưu...' : 'Đăng Nhật Ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
