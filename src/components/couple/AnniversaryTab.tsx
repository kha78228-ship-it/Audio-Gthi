import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Sparkle, 
  PartyPopper, 
  Gift, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Heart,
  Trash2,
  Edit2,
  CalendarPlus,
  Tag,
  Repeat,
  Flame,
  Check
} from 'lucide-react';
import { CoupleData, CoupleAnniversaryGuess, CoupleEvent } from '../../types';

interface AnniversaryTabProps {
  couple: CoupleData;
  userUid?: string;
  anniversaryGuesses: CoupleAnniversaryGuess[];
  onCreateGuess: (title: string, actualDate: string, hint: string) => Promise<void>;
  onSubmitGuessAnswer: (item: CoupleAnniversaryGuess, guessedDate: string) => Promise<void>;
  // Custom Events
  customEvents?: CoupleEvent[];
  onCreateCustomEvent?: (
    title: string, 
    targetDate: string, 
    icon: string, 
    category: CoupleEvent['category'], 
    badge: string, 
    note: string, 
    isYearlyRecurring: boolean
  ) => Promise<void>;
  onUpdateCustomEvent?: (eventId: string, data: Partial<CoupleEvent>) => Promise<void>;
  onDeleteCustomEvent?: (eventId: string) => Promise<void>;
}

const PRESET_ICONS = ['🎂', '✈️', '💍', '🌹', '🏖️', '🏠', '💖', '🎁', '🎉', '🥂', '🍰', '🌸', '🎬', '☕', '🌟', '🚀'];

const PRESET_SUGGESTIONS = [
  { title: 'Sinh Nhật Người Ấy', icon: '🎂', category: 'birthday' as const, badge: 'Sinh Nhật', isYearlyRecurring: true },
  { title: 'Chuyến Du Lịch Biển', icon: '🏖️', category: 'trip' as const, badge: 'Du Lịch', isYearlyRecurring: false },
  { title: 'Hẹn Hò Kỷ Niệm Lãng Mạn', icon: '🍷', category: 'date_night' as const, badge: 'Hẹn Hò', isYearlyRecurring: false },
  { title: 'Lễ Đính Hôn / Cầu Hôn', icon: '💍', category: 'milestone' as const, badge: 'Đính Hôn', isYearlyRecurring: false },
  { title: 'Về Chung Một Nhà', icon: '🏠', category: 'milestone' as const, badge: 'Tổ Ấm', isYearlyRecurring: false },
  { title: 'Lời Hứa Tình Yêu', icon: '💖', category: 'promise' as const, badge: 'Lời Hứa', isYearlyRecurring: true }
];

export function AnniversaryTab({
  couple,
  userUid,
  anniversaryGuesses,
  onCreateGuess,
  onSubmitGuessAnswer,
  customEvents = [],
  onCreateCustomEvent,
  onUpdateCustomEvent,
  onDeleteCustomEvent
}: AnniversaryTabProps) {
  // Custom Event state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<'all' | 'custom' | 'auto'>('all');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventIcon, setEventIcon] = useState('🎂');
  const [eventCategory, setEventCategory] = useState<CoupleEvent['category']>('custom');
  const [eventBadge, setEventBadge] = useState('Sự Kiện');
  const [eventNote, setEventNote] = useState('');
  const [eventRecurring, setEventRecurring] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Guessing game state
  const [isAddGuessOpen, setIsAddGuessOpen] = useState(false);
  const [guessTitle, setGuessTitle] = useState('');
  const [guessActualDate, setGuessActualDate] = useState('');
  const [guessHint, setGuessHint] = useState('');
  const [activeGuessingItem, setActiveGuessingItem] = useState<CoupleAnniversaryGuess | null>(null);
  const [guessedInputDate, setGuessedInputDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMePartner1 = couple.partner1.uid === userUid;
  const myPartner = isMePartner1 ? couple.partner2 : couple.partner1;

  // Calculate days left for any date (with optional yearly recurrence)
  const calculateDaysLeft = (targetDateStr: string, isYearly = false) => {
    if (!targetDateStr) return { daysLeft: 0, formattedDate: '' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    if (isYearly) {
      const currentYear = today.getFullYear();
      target.setFullYear(currentYear);
      if (target < today) {
        target.setFullYear(currentYear + 1);
      }
    }

    const diffMs = target.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 3600 * 24));
    return { daysLeft, formattedDate: target.toISOString().split('T')[0] };
  };

  // Preset key upcoming automated events based on anniversary
  const getAutoUpcomingEvents = () => {
    if (!couple.anniversaryDate) return [];
    const baseDate = new Date(couple.anniversaryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = [];

    // Next 100 days milestones
    const daysSince = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 3600 * 24));
    const next100 = (Math.floor(daysSince / 100) + 1) * 100;
    const next100Date = new Date(baseDate.getTime() + next100 * 24 * 3600 * 1000);
    const daysTo100 = Math.max(0, Math.ceil((next100Date.getTime() - today.getTime()) / (1000 * 3600 * 24)));

    events.push({
      id: 'auto-100-days',
      title: `Kỷ Niệm ${next100} Ngày Yêu`,
      targetDate: next100Date.toISOString().split('T')[0],
      daysLeft: daysTo100,
      icon: '🎉',
      badge: 'Cột mốc 100 ngày',
      isAuto: true,
      note: 'Hành trình trăm ngày tiếp theo tràn ngập niềm vui'
    });

    // Next Yearly Anniversary
    const currentYear = today.getFullYear();
    let nextYearly = new Date(couple.anniversaryDate);
    nextYearly.setFullYear(currentYear);
    if (nextYearly < today) {
      nextYearly.setFullYear(currentYear + 1);
    }
    const daysToYearly = Math.max(0, Math.ceil((nextYearly.getTime() - today.getTime()) / (1000 * 3600 * 24)));
    const nthYear = nextYearly.getFullYear() - baseDate.getFullYear();

    events.push({
      id: 'auto-yearly-anniversary',
      title: `Kỷ Niệm ${nthYear} Năm ${couple.relationshipType === 'married' ? 'Ngày Cưới' : 'Yêu Nhau'}`,
      targetDate: nextYearly.toISOString().split('T')[0],
      daysLeft: daysToYearly,
      icon: '💍',
      badge: 'Kỷ Niệm Năm',
      isAuto: true,
      note: `Gắn bó tròn ${nthYear} năm ngọt ngào bên nhau`
    });

    // Valentine
    let val = new Date(currentYear, 1, 14);
    if (val < today) {
      val = new Date(currentYear + 1, 1, 14);
    }
    const daysToVal = Math.max(0, Math.ceil((val.getTime() - today.getTime()) / (1000 * 3600 * 24)));
    events.push({
      id: 'auto-valentine',
      title: 'Lễ Tình Nhân Valentine',
      targetDate: val.toISOString().split('T')[0],
      daysLeft: daysToVal,
      icon: '💖',
      badge: 'Ngày Lễ Tình Yêu',
      isAuto: true,
      note: 'Ngày trao gửi yêu thương và những món quà nồng ấm'
    });

    return events;
  };

  const autoEvents = getAutoUpcomingEvents();

  // Combine custom & auto events
  const mappedCustomEvents = customEvents.map(evt => {
    const { daysLeft, formattedDate } = calculateDaysLeft(evt.targetDate, evt.isYearlyRecurring);
    return {
      id: evt.id,
      title: evt.title,
      targetDate: formattedDate || evt.targetDate,
      originalTargetDate: evt.targetDate,
      daysLeft,
      icon: evt.icon || '🎂',
      badge: evt.badge || 'Sự Kiện Tùy Chỉnh',
      isAuto: false,
      isYearlyRecurring: evt.isYearlyRecurring,
      category: evt.category || 'custom',
      note: evt.note,
      createdByName: evt.createdByName
    };
  });

  const allDisplayEvents = [
    ...(eventFilter !== 'custom' ? autoEvents : []),
    ...(eventFilter !== 'auto' ? mappedCustomEvents : [])
  ].sort((a, b) => {
    // Sort upcoming events by days left
    return a.daysLeft - b.daysLeft;
  });

  const resetEventForm = () => {
    setEventTitle('');
    setEventDate('');
    setEventIcon('🎂');
    setEventCategory('custom');
    setEventBadge('Sự Kiện');
    setEventNote('');
    setEventRecurring(false);
    setEditingEventId(null);
    setIsAddEventOpen(false);
  };

  const handleApplyPreset = (preset: typeof PRESET_SUGGESTIONS[0]) => {
    setEventTitle(preset.title);
    setEventIcon(preset.icon);
    setEventCategory(preset.category);
    setEventBadge(preset.badge);
    setEventRecurring(preset.isYearlyRecurring);
  };

  const handleCustomEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    setEventSubmitting(true);
    try {
      if (editingEventId && onUpdateCustomEvent) {
        await onUpdateCustomEvent(editingEventId, {
          title: eventTitle.trim(),
          targetDate: eventDate,
          icon: eventIcon,
          category: eventCategory,
          badge: eventBadge.trim() || 'Sự Kiện',
          note: eventNote.trim(),
          isYearlyRecurring: eventRecurring
        });
      } else if (onCreateCustomEvent) {
        await onCreateCustomEvent(
          eventTitle.trim(),
          eventDate,
          eventIcon,
          eventCategory,
          eventBadge.trim() || 'Sự Kiện',
          eventNote.trim(),
          eventRecurring
        );
      }
      resetEventForm();
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleEditClick = (evt: typeof mappedCustomEvents[0]) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventDate(evt.originalTargetDate);
    setEventIcon(evt.icon);
    setEventCategory(evt.category);
    setEventBadge(evt.badge);
    setEventNote(evt.note || '');
    setEventRecurring(Boolean(evt.isYearlyRecurring));
    setIsAddEventOpen(true);
  };

  const handleDeleteClick = async (eventId: string, title: string) => {
    if (!onDeleteCustomEvent) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không?`)) {
      await onDeleteCustomEvent(eventId);
    }
  };

  // Guessing game submit handlers
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessTitle.trim() || !guessActualDate) return;
    setSubmitting(true);
    try {
      await onCreateGuess(guessTitle.trim(), guessActualDate, guessHint.trim());
      setGuessTitle('');
      setGuessActualDate('');
      setGuessHint('');
      setIsAddGuessOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuessSubmit = async (item: CoupleAnniversaryGuess) => {
    if (!guessedInputDate) return;
    setSubmitting(true);
    try {
      await onSubmitGuessAnswer(item, guessedInputDate);
      setActiveGuessingItem(null);
      setGuessedInputDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: CUSTOMIZABLE EVENTS & ANNIVERSARIES TIMELINE */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-rose-400 shrink-0" />
              <h2 className="text-base sm:text-xl font-bold text-white">
                Sự Kiện & Kỷ Niệm Tùy Chỉnh
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                {allDisplayEvents.length} Sự kiện
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Tự do thêm, sửa và đếm ngược từng ngày đặc biệt, sinh nhật và kế hoạch chung đôi
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filter pills */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] sm:text-xs font-bold">
              <button
                onClick={() => setEventFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  eventFilter === 'all' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setEventFilter('custom')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  eventFilter === 'custom' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tùy Chỉnh
              </button>
              <button
                onClick={() => setEventFilter('auto')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  eventFilter === 'auto' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cột Mốc Tự Động
              </button>
            </div>

            <button
              onClick={() => {
                resetEventForm();
                setIsAddEventOpen(true);
              }}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Thêm Sự Kiện</span>
            </button>
          </div>
        </div>

        {/* Modal / Add or Edit Custom Event */}
        {isAddEventOpen && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CalendarPlus size={16} className="text-rose-400 shrink-0" />
                <span>{editingEventId ? 'Chỉnh Sửa Sự Kiện Đôi' : 'Tạo Sự Kiện / Kỷ Niệm Mới'}</span>
              </h3>
              <button onClick={resetEventForm} className="text-xs text-zinc-400 hover:text-white cursor-pointer">
                Đóng
              </button>
            </div>

            {/* Quick Presets */}
            {!editingEventId && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Gợi ý mẫu sự kiện nhanh:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SUGGESTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/40 text-zinc-300 hover:text-rose-300 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCustomEventSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Tên sự kiện / Ngày kỷ niệm *</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="VD: Sinh nhật em yêu, Kỷ niệm đi Đà Nẵng, Ngày chuyển về nhà mới..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày diễn ra *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Icon Picker & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Chọn Biểu Tượng Emoji</label>
                  <div className="flex flex-wrap gap-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                    {PRESET_ICONS.map((icon, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEventIcon(icon)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                          eventIcon === icon ? 'bg-rose-500 scale-110 shadow-md' : 'hover:bg-zinc-800'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Nhãn / Tag hiển thị</label>
                  <input
                    type="text"
                    value={eventBadge}
                    onChange={(e) => setEventBadge(e.target.value)}
                    placeholder="VD: Sinh Nhật, Du Lịch, Kỷ Niệm..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>

              {/* Note and Recurring Checkbox */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ghi chú / Kế hoạch ngọt ngào (Tùy chọn)</label>
                <textarea
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="Kế hoạch đi ăn ở đâu, món quà bí mật chuẩn bị..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <input
                  type="checkbox"
                  id="eventRecurring"
                  checked={eventRecurring}
                  onChange={(e) => setEventRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                />
                <label htmlFor="eventRecurring" className="text-xs text-zinc-300 font-medium cursor-pointer flex items-center gap-1.5">
                  <Repeat size={13} className="text-rose-400" />
                  <span>Lặp lại hàng năm (Thích hợp cho Sinh nhật, Ngày kỷ niệm cưới/yêu)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetEventForm}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={eventSubmitting || !eventTitle.trim() || !eventDate}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {editingEventId ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện Ngay'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Cards Grid */}
        {allDisplayEvents.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <CalendarPlus size={20} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">Chưa có sự kiện nào trong danh sách</p>
            <p className="text-[11px] sm:text-xs text-zinc-400 max-w-md mx-auto">
              Hãy thêm sự kiện đầu tiên của hai bạn như sinh nhật, chuyến du lịch hoặc ngày hẹn hò đặc biệt!
            </p>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              + Tạo sự kiện ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {allDisplayEvents.map((evt) => {
              const isToday = evt.daysLeft === 0;
              const isPassed = evt.daysLeft < 0;

              return (
                <div
                  key={evt.id}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xl space-y-3 transition-all flex flex-col justify-between group relative overflow-hidden ${
                    isToday
                      ? 'bg-gradient-to-b from-rose-950/70 to-zinc-900 border-rose-500/70 shadow-rose-500/10 ring-1 ring-rose-500/50'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl sm:text-3xl p-1 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        {evt.icon}
                      </span>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-extrabold">
                          {evt.badge}
                        </span>
                        {evt.isYearlyRecurring && (
                          <span className="ml-1 text-[10px] text-zinc-400" title="Lặp lại hàng năm">
                            🔁
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons if custom */}
                    {!evt.isAuto && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(evt as any)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Sửa sự kiện"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(evt.id, evt.title)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa sự kiện"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {evt.title}
                    </h3>
                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                      <Calendar size={12} className="text-zinc-500 shrink-0" />
                      <span>{evt.targetDate}</span>
                    </div>
                    {evt.note && (
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 italic mt-1.5 line-clamp-2 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/50">
                        "{evt.note}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-zinc-400">
                      {isToday ? 'HÔM NAY!' : isPassed ? 'Đã qua' : 'Còn lại:'}
                    </span>
                    <span className={`text-xs sm:text-base font-black ${
                      isToday 
                        ? 'text-amber-300 animate-pulse font-extrabold' 
                        : isPassed 
                        ? 'text-zinc-500' 
                        : 'bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent'
                    }`}>
                      {isToday ? '🎉 HÔM NAY' : isPassed ? `${Math.abs(evt.daysLeft)} ngày trước` : `${evt.daysLeft} ngày`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: ANNIVERSARY GUESSING GAME */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 sm:space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h2 className="text-sm xs:text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <Calendar size={17} className="text-rose-400 shrink-0" />
              <span>Trò Chơi Đoán Ngày Kỷ Niệm</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              Tạo câu đố thử thách trí nhớ của đối phương về ngày hẹn hò, nụ hôn đầu...
            </p>
          </div>
          <button
            onClick={() => setIsAddGuessOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Tạo Câu Đố Mới</span>
          </button>
        </div>

        {/* Modal / Add Guess Question */}
        {isAddGuessOpen && (
          <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-3 sm:space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={14} className="text-rose-400 shrink-0" />
                <span>Tạo Câu Hỏi Đoán Ngày Kỷ Niệm Mới</span>
              </h3>
              <button onClick={() => setIsAddGuessOpen(false)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Câu hỏi kỷ niệm</label>
                <input
                  type="text"
                  value={guessTitle}
                  onChange={(e) => setGuessTitle(e.target.value)}
                  placeholder="VD: Ngày đầu tiên tụi mình đi xem phim cùng nhau? Ngày nụ hôn đầu?"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ngày chính xác của sự kiện đó</label>
                <input
                  type="date"
                  value={guessActualDate}
                  onChange={(e) => setGuessActualDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Gợi ý ngọt ngào (Tùy chọn)</label>
                <input
                  type="text"
                  value={guessHint}
                  onChange={(e) => setGuessHint(e.target.value)}
                  placeholder="VD: Hôm đó trời mưa to và quán trà sữa rất đông..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuessOpen(false)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Gửi Thử Thách Cho Người Ấy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Anniversary Guesses */}
        {anniversaryGuesses.length === 0 ? (
          <div className="p-6 sm:p-12 rounded-xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Calendar size={18} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">Chưa có thử thách đoán ngày nào</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 max-w-md mx-auto">
              Hãy tạo ngay một câu đố kỷ niệm bí mật để xem người ấy có nhớ chính xác ngày đặc biệt của hai đứa không!
            </p>
            <button
              onClick={() => setIsAddGuessOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs cursor-pointer"
            >
              + Tạo câu đố đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
            {anniversaryGuesses.map(item => {
              const isCreatedByMe = item.createdById === userUid;
              const isAnswered = Boolean(item.guessedDate);

              return (
                <div 
                  key={item.id}
                  className="p-3.5 xs:p-4 sm:p-5 rounded-xl sm:rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/40 transition-all space-y-2.5 sm:space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                        <Sparkle size={11} />
                        <span>Tạo bởi: {isCreatedByMe ? 'Bạn' : item.createdByName}</span>
                      </span>
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold ${
                        isAnswered ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' : 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
                      }`}>
                        {isAnswered ? 'Đã Trả Lời' : 'Chờ Đoán'}
                      </span>
                    </div>

                    <h3 className="text-xs xs:text-sm sm:text-base font-bold text-white leading-snug">{item.questionTitle}</h3>
                    {item.hint && (
                      <p className="text-[10px] sm:text-xs text-zinc-400 italic">💡 Gợi ý: {item.hint}</p>
                    )}
                  </div>

                  {/* Result or Action Form */}
                  {isAnswered ? (
                    <div className="p-2.5 xs:p-3 sm:p-3.5 rounded-lg sm:rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1 sm:space-y-2 text-[10px] sm:text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-zinc-300">
                        <span>Ngày đúng: <strong className="text-rose-300 font-mono">{item.actualDate}</strong></span>
                        <span>Đã đoán: <strong className="text-white font-mono">{item.guessedDate}</strong></span>
                      </div>
                      <div className="p-1.5 sm:p-2.5 rounded-md sm:rounded-xl bg-zinc-900 border border-zinc-800/80 text-rose-300 font-medium leading-relaxed flex items-center gap-1.5 sm:gap-2">
                        <PartyPopper size={14} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] sm:text-xs">{item.reactionMessage}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {isCreatedByMe ? (
                        <div className="p-2 sm:p-3 rounded-xl bg-zinc-950 text-[10px] sm:text-xs text-zinc-400 text-center">
                          Đang chờ {myPartner?.name || 'người ấy'} đoán ngày...
                        </div>
                      ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                          {activeGuessingItem?.id === item.id ? (
                            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-2 sm:space-y-3">
                              <label className="text-[11px] sm:text-xs font-bold text-zinc-300">Chọn ngày bạn nghĩ là đúng:</label>
                              <input
                                type="date"
                                value={guessedInputDate}
                                onChange={(e) => setGuessedInputDate(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveGuessingItem(null)}
                                  className="flex-1 py-1.5 sm:py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={submitting || !guessedInputDate}
                                  onClick={() => handleGuessSubmit(item)}
                                  className="flex-1 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs disabled:opacity-50"
                                >
                                  Xác Nhận
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveGuessingItem(item)}
                              className="w-full py-1.5 sm:py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer transition-all"
                            >
                              🎯 Nhập Ngày Để Đoán Ngay
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
