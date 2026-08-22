import React, { useState } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { CoupleData, CoupleEvent, CouplePeriodCycleConfig } from '../../types';

interface CoupleCalendarTabProps {
  couple: CoupleData;
  userUid?: string;
  customEvents: CoupleEvent[];
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

export function CoupleCalendarTab({
  couple,
  userUid,
  customEvents,
  onCreateCustomEvent,
  onUpdateCustomEvent,
  onDeleteCustomEvent
}: CoupleCalendarTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Add Event Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDay);
  const [eventIcon, setEventIcon] = useState('💖');
  const [eventCategory, setEventCategory] = useState<CoupleEvent['category']>('date_night');
  const [eventBadge, setEventBadge] = useState('Hẹn Hò');
  const [eventNote, setEventNote] = useState('');
  const [eventRecurring, setEventRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const daysLeftCalculate = (targetDateStr: string, isYearly = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    if (isYearly) {
      target.setFullYear(today.getFullYear());
      if (target < today) {
        target.setFullYear(today.getFullYear() + 1);
      }
    }

    const diffMs = target.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 3600 * 24));
  };

  const handleOpenAddForDay = (dateStr: string) => {
    setEventDate(dateStr);
    setSelectedDay(dateStr);
    setIsAddModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    setSubmitting(true);
    try {
      await onCreateCustomEvent(
        eventTitle.trim(),
        eventDate,
        eventIcon,
        eventCategory,
        eventBadge.trim() || 'Sự Kiện',
        eventNote.trim(),
        eventRecurring
      );
      setIsAddModalOpen(false);
      setEventTitle('');
      setEventNote('');
    } finally {
      setSubmitting(false);
    }
  };

  // Selected Day's events
  const selectedDayEvents = getEventsForDate(selectedDay);
  const selectedIsPeriod = isPeriodDay(selectedDay);
  const selectedIsOvulation = isOvulationDay(selectedDay);
  const selectedIsAnniversary = isAnniversaryDay(selectedDay);

  // Month name formatting
  const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & CALENDAR CONTROLS */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <CalendarDays size={12} className="text-rose-400" />
              <span>Lịch Kỷ Niệm & Hẹn Hò Cặp Đôi</span>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white capitalize">
              {monthName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
            >
              Hôm Nay
            </button>
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => handleOpenAddForDay(selectedDay)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm Sự Kiện</span>
            </button>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm" />
            <span>Kỷ Niệm Đôi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500/80 inline-block" />
            <span>Kỳ Kinh Bạn Gái 🩸</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500/80 inline-block" />
            <span>Ngày Rụng Trứng 🌸</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Hẹn Hò / Sự Kiện</span>
          </div>
        </div>

        {/* 2. CALENDAR GRID */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          {/* Day Headers (CN, T2, T3, T4, T5, T6, T7) */}
          <div className="grid grid-cols-7 border-b border-zinc-800/80 bg-zinc-900/50 text-center py-2 text-[10px] sm:text-xs font-bold text-zinc-400">
            <div className="text-rose-400">CN</div>
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div className="text-amber-400">T7</div>
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Empty filler cells before 1st day */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[88px] p-1 border-r border-b border-zinc-800/40 bg-zinc-950/40 opacity-30" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              const isSelected = selectedDay === dateStr;

              const hasPeriod = isPeriodDay(dateStr);
              const hasOvulation = isOvulationDay(dateStr);
              const hasAnniversary = isAnniversaryDay(dateStr);
              const dayEvents = getEventsForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`min-h-[64px] sm:min-h-[88px] p-1 sm:p-2 border-r border-b border-zinc-800/60 relative cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-rose-950/50 ring-2 ring-rose-500 z-10' 
                      : isToday
                      ? 'bg-zinc-900/90'
                      : hasPeriod
                      ? 'bg-rose-950/20 hover:bg-rose-950/40'
                      : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      isToday 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : isSelected
                        ? 'text-rose-300 font-black'
                        : 'text-zinc-300'
                    }`}>
                      {dayNum}
                    </span>

                    <div className="flex items-center gap-0.5">
                      {hasAnniversary && <span className="text-[10px]" title="Kỷ Niệm Đôi">💖</span>}
                      {hasPeriod && <span className="text-[10px]" title="Kỳ Kinh Bạn Gái">🩸</span>}
                      {hasOvulation && <span className="text-[10px]" title="Ngày Rụng Trứng">🌸</span>}
                    </div>
                  </div>

                  {/* Badges / event preview on cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="px-1 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[9px] sm:text-[10px] text-zinc-300 truncate flex items-center gap-1 font-medium"
                      >
                        <span>{ev.icon || '📌'}</span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] sm:text-[9px] text-zinc-400 font-bold pl-1">
                        +{dayEvents.length - 2} sự kiện khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SELECTED DAY DETAILS & EVENT LIST */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-rose-400" />
              <h3 className="text-sm sm:text-base font-black text-white">
                Sự Kiện Ngày {new Date(selectedDay).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              {selectedIsAnniversary && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  💖 Ngày Kỷ Niệm Tình Yêu / Cưới
                </span>
              )}
              {selectedIsPeriod && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                  🩸 Chu Kỳ Bạn Gái
                </span>
              )}
              {selectedIsOvulation && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  🌸 Khả Năng Rụng Trứng Cao
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleOpenAddForDay(selectedDay)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Thêm Sự Kiện Ngày Này</span>
          </button>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 text-xs space-y-1">
            <div>Chưa có sự kiện hẹn hò / lịch nhắc nào trong ngày này.</div>
            <p className="text-[11px] text-zinc-600">Bấm nút "Thêm Sự Kiện Ngày Này" để lên lịch đi chơi, xem phim hoặc hẹn hò cùng người yêu nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDayEvents.map(ev => {
              const daysLeft = daysLeftCalculate(ev.targetDate, ev.isYearlyRecurring);
              return (
                <div 
                  key={ev.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                      {ev.icon || '💖'}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-rose-300">
                        {ev.title}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-rose-400 font-bold">
                          {ev.badge || 'Sự Kiện'}
                        </span>
                        {ev.isYearlyRecurring && (
                          <span className="px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 text-[9px] flex items-center gap-0.5">
                            <Repeat size={10} />
                            <span>Lặp lại hàng năm</span>
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500">
                          {daysLeft === 0 ? 'Hôm nay!' : daysLeft > 0 ? `Còn ${daysLeft} ngày` : `Đã qua ${Math.abs(daysLeft)} ngày`}
                        </span>
                      </div>
                      {ev.note && (
                        <p className="text-[11px] text-zinc-400 italic">{ev.note}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCustomEvent(ev.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                    title="Xóa sự kiện"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: CREATE CUSTOM CALENDAR EVENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <CalendarDays size={17} className="text-rose-400" />
                <span>Lên Lịch Hẹn Hò & Sự Kiện Đôi</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white text-xs">
                Đóng
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên Sự Kiện / Lịch Hẹn</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="VD: Đi ăn tối kỷ niệm, Xem phim rạp, Chuyến đi Đà Lạt..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày diễn ra</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
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
                      const matching = PRESET_CATEGORIES.find(c => c.id === cat);
                      if (matching) {
                        setEventBadge(matching.badge);
                        setEventIcon(matching.icon);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {PRESET_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Biểu tượng Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEventIcon(ic)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                        eventIcon === ic ? 'bg-rose-500/30 border border-rose-500 scale-110 shadow-sm' : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ghi chú & Chi tiết (Tùy chọn)</label>
                <input
                  type="text"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  placeholder="VD: Đặt bàn lúc 19h, mặc đồ đôi màu kem..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={eventRecurring}
                  onChange={(e) => setEventRecurring(e.target.checked)}
                  className="accent-rose-500 cursor-pointer"
                />
                <label htmlFor="recurring" className="text-xs text-zinc-300 cursor-pointer font-medium">
                  Lặp lại sự kiện này hàng năm (Kỷ niệm / Sinh nhật)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang Lưu...' : 'Lưu Sự Kiện (+15đ)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
