import React, { useState, useMemo } from 'react';
import { 
  FamilyEvent, 
  FamilyTreeMember as FamilyMember, 
  FamilyRole, 
  FamilyEventType 
} from '../../types';
import { 
  UnifiedCalendarItem, 
  getCombinedCalendarItems, 
  buildMonthCalendarGrid,
  CalendarDayCell,
  parseDateComponents
} from '../../utils/familyCalendarUtils';
import { 
  Calendar as CalendarIcon, 
  Cake, 
  Flame, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Bell, 
  Volume2, 
  MapPin, 
  Trash2, 
  Check, 
  Copy, 
  Sparkles, 
  Heart, 
  Crown, 
  X, 
  CheckCircle2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FamilyCalendarIntegrationProps {
  events: FamilyEvent[];
  members: FamilyMember[];
  userRole?: FamilyRole;
  onAddEvent?: (event: FamilyEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onSelectMember?: (member: FamilyMember) => void;
  onClose?: () => void;
  isEmbeddedView?: boolean;
}

export const FamilyCalendarIntegration: React.FC<FamilyCalendarIntegrationProps> = ({
  events,
  members,
  userRole = 'admin',
  onAddEvent,
  onDeleteEvent,
  onSelectMember,
  onClose,
  isEmbeddedView = false
}) => {
  const today = useMemo(() => new Date(), []);
  
  // Current month displayed in grid
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  
  // Selected day in month grid (null = show all upcoming)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Filter & Search
  const [filterType, setFilterType] = useState<'all' | 'birthday' | 'death_anniversary' | 'clan_gathering'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Event Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<FamilyEventType>('birthday');
  const [formMemberId, setFormMemberId] = useState('');
  const [formSolarDate, setFormSolarDate] = useState('');
  const [formLunarDate, setFormLunarDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReminderDays, setFormReminderDays] = useState(7);

  // Birthday Wish Modal
  const [wishTargetMember, setWishTargetMember] = useState<{ member: FamilyMember; item: UnifiedCalendarItem } | null>(null);
  const [copiedWish, setCopiedWish] = useState(false);
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  // Sound chime test
  const playAlertChime = (titleText: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio chime not supported');
    }
    setSimulatedAlert(`🔔 Chuông báo nhắc nhở: "${titleText}" đã kích hoạt.`);
    setTimeout(() => setSimulatedAlert(null), 3500);
  };

  // Extract combined calendar items (Birthdays + Events)
  const allItems = useMemo(() => {
    return getCombinedCalendarItems(events, members, today);
  }, [events, members, today]);

  // Statistics
  const stats = useMemo(() => {
    const birthdays = allItems.filter(i => i.itemType === 'birthday');
    const anniversaries = allItems.filter(i => i.eventType === 'death_anniversary');
    const clanGatherings = allItems.filter(i => i.eventType === 'clan_gathering');
    const soonItems = allItems.filter(i => i.isSoon);

    return {
      total: allItems.length,
      birthdaysCount: birthdays.length,
      anniversariesCount: anniversaries.length,
      clanGatheringsCount: clanGatherings.length,
      soonCount: soonItems.length
    };
  }, [allItems]);

  // Calendar Grid for current month
  const monthWeeks = useMemo(() => {
    return buildMonthCalendarGrid(currentYear, currentMonth, allItems);
  }, [currentYear, currentMonth, allItems]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(null);
  };

  // Filtered upcoming items
  const displayItems = useMemo(() => {
    let list = allItems;

    // Filter by selected day if active
    if (selectedDay) {
      const selYear = selectedDay.getFullYear();
      const selMonth = selectedDay.getMonth();
      const selDate = selectedDay.getDate();

      list = list.filter(item => {
        const d = item.nextDate;
        return d.getFullYear() === selYear && d.getMonth() === selMonth && d.getDate() === selDate;
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'birthday') {
        list = list.filter(i => i.itemType === 'birthday');
      } else {
        list = list.filter(i => i.eventType === filterType);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => {
        return (
          i.title.toLowerCase().includes(q) ||
          (i.member?.fullName && i.member.fullName.toLowerCase().includes(q)) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [allItems, selectedDay, filterType, searchQuery]);

  // Submit quick event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSolarDate) return;

    const selectedMember = members.find(m => m.id === formMemberId);
    const newEvent: FamilyEvent = {
      id: `evt_${Date.now()}`,
      treeId: selectedMember?.treeId || 'tree_user_main',
      title: formTitle.trim(),
      eventType: formType,
      memberId: formMemberId || undefined,
      memberName: selectedMember?.fullName,
      solarDate: formSolarDate,
      lunarDate: formLunarDate.trim() || undefined,
      recurringYearly: true,
      reminderDaysBefore: formReminderDays,
      location: formLocation.trim() || undefined,
      description: formDescription.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    // Reset
    setFormTitle('');
    setFormSolarDate('');
    setFormLunarDate('');
    setFormLocation('');
    setFormDescription('');
    setFormMemberId('');
    setShowAddModal(false);
  };

  // Helper for generating warm Vietnamese birthday wishes based on age/generation
  const generateBirthdayWish = (member: FamilyMember, item: UnifiedCalendarItem) => {
    const age = item.ageTurning;
    if (member.isDeceased) {
      return `Thắp nén tâm nhang tưởng niệm ngày sinh của Cụ ${member.fullName} (${item.solarDate}). Nguyện cầu tiên tổ phù hộ độ trì cho con cháu nội ngoại bình an, vạn sự cát tường.`;
    }
    if (age && age >= 70) {
      return `Kính chúc cụ/ông/bà ${member.fullName} bước sang tuổi ${age} Phúc Như Đông Hải, Thọ Tỷ Nam Sơn, thân tâm an lạc, bách niên giai lão, luôn là chỗ dựa tinh thần vững chắc cho muôn đời con cháu!`;
    }
    if (age && age >= 50) {
      return `Chúc mừng sinh nhật ${member.fullName}! Kính chúc ${member.gender === 'male' ? 'bác' : 'cô/bác'} bước sang tuổi mới luôn dồi dào sức khỏe, gia đạo bình an, hạnh phúc viên mãn và sự nghiệp hanh thông!`;
    }
    if (age && age <= 18) {
      return `Chúc mừng sinh nhật ${member.fullName}! Chúc con/em thêm tuổi mới hay ăn chóng lớn, chăm ngoan, học giỏi, tràn đầy năng lượng và đạt được mọi ước mơ rực rỡ!`;
    }
    return `Chúc mừng sinh nhật ${member.fullName}! Chúc bạn/anh/chị một tuổi mới rực rỡ, dồi dào sức khỏe, công việc hanh thông, luôn an nhiên và hạnh phúc bên gia đình thân yêu!`;
  };

  const handleCopyWish = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWish(true);
      setTimeout(() => setCopiedWish(false), 2500);
    }
  };

  const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className={`space-y-4 ${isEmbeddedView ? '' : 'p-4 sm:p-6 bg-slate-900/95 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-md'}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 flex items-center gap-2">
                <span>Lịch Gia Tộc & Sinh Nhật Thành Viên</span>
                {stats.soonCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    {stats.soonCount} sự kiện sắp tới
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Tự động đồng bộ sinh nhật toàn thể thành viên trong phả hệ, ngày giỗ tiên tổ và các sự kiện tế lễ dòng họ.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {userRole === 'admin' && onAddEvent && (
            <button
              id="btn-calendar-add-event"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Thêm Sự Kiện / Giỗ</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Đóng bảng lịch"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Simulated Alert Notification Toast */}
      {simulatedAlert && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{simulatedAlert}</span>
        </motion.div>
      )}

      {/* Quick Summary Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button
          onClick={() => { setFilterType('all'); setSelectedDay(null); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterType === 'all' && !selectedDay
              ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold">Tất Cả</span>
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-black text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Sự kiện & sinh nhật</div>
        </button>

        <button
          onClick={() => { setFilterType('birthday'); setSelectedDay(null); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterType === 'birthday' && !selectedDay
              ? 'bg-rose-500/15 border-rose-500/60 shadow-md shadow-rose-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-400 font-bold">Sinh Nhật</span>
            <Cake className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-base font-black text-white mt-1">{stats.birthdaysCount}</div>
          <div className="text-[10px] text-slate-500">Thành viên phả hệ</div>
        </button>

        <button
          onClick={() => { setFilterType('death_anniversary'); setSelectedDay(null); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterType === 'death_anniversary' && !selectedDay
              ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-300 font-bold">Ngày Giỗ</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-black text-white mt-1">{stats.anniversariesCount}</div>
          <div className="text-[10px] text-slate-500">Tế tự tiên tổ</div>
        </button>

        <button
          onClick={() => { setFilterType('clan_gathering'); setSelectedDay(null); }}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterType === 'clan_gathering' && !selectedDay
              ? 'bg-blue-500/15 border-blue-500/60 shadow-md shadow-blue-500/10'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-bold">Họp Họ & Tế Tổ</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-black text-white mt-1">{stats.clanGatheringsCount}</div>
          <div className="text-[10px] text-slate-500">Gặp mặt gia tộc</div>
        </button>
      </div>

      {/* Main Grid: Left is Month Grid, Right is Upcoming Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: MONTHLY CALENDAR GRID (5 Cols on large screen) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleJumpToToday}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors cursor-pointer"
                title="Về tháng hiện tại"
              >
                Hôm nay
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1 border-b border-slate-800/80">
            {WEEK_DAYS.map((w, idx) => (
              <div key={w} className={idx >= 5 ? 'text-amber-400/90' : ''}>
                {w}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {monthWeeks.map((week, wIdx) => (
              <React.Fragment key={wIdx}>
                {week.map((cell, cIdx) => {
                  const hasBirthday = cell.items.some(i => i.itemType === 'birthday');
                  const hasAnniversary = cell.items.some(i => i.eventType === 'death_anniversary');
                  const hasGathering = cell.items.some(i => i.eventType === 'clan_gathering');

                  const isSelected = selectedDay && 
                    selectedDay.getFullYear() === cell.date.getFullYear() &&
                    selectedDay.getMonth() === cell.date.getMonth() &&
                    selectedDay.getDate() === cell.date.getDate();

                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDay(null);
                        } else {
                          setSelectedDay(cell.date);
                        }
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer relative ${
                        !cell.isCurrentMonth
                          ? 'opacity-30 hover:opacity-70 text-slate-500'
                          : isSelected
                            ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 shadow-md'
                            : cell.isToday
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                              : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                      title={cell.items.length > 0 ? `${cell.items.length} sự kiện/sinh nhật` : undefined}
                    >
                      <span className={`text-[11px] leading-tight ${isSelected ? 'font-black text-slate-950' : ''}`}>
                        {cell.dayNumber}
                      </span>

                      {/* Event Dot Indicators */}
                      <div className="flex items-center justify-center gap-0.5 min-h-[6px]">
                        {hasBirthday && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-rose-400'}`} />
                        )}
                        {hasAnniversary && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-amber-400'}`} />
                        )}
                        {hasGathering && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-blue-400'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Sinh nhật</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Ngày giỗ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Tế tổ/Họp mặt</span>
            </div>
            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-[10px] font-bold text-amber-400 hover:underline ml-auto"
              >
                ✕ Xóa lọc ngày
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: UPCOMING EVENTS & SHARED BIRTHDAYS FEED (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Search & Selection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>
                    {selectedDay 
                      ? `Lịch trình ngày: ${selectedDay.getDate()}/${selectedDay.getMonth() + 1}/${selectedDay.getFullYear()}`
                      : 'Lịch Trình Sắp Tới (Thứ Tự Thời Gian)'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-amber-300">
                    {displayItems.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedDay ? 'Bấm vào ngày khác trên lịch để xem tiếp' : 'Sinh nhật và ngày giỗ được tính đếm ngược tự động'}
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thành viên, lễ giỗ..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
              {displayItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2 my-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-lg">
                    🗓️
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    Không có sự kiện hoặc sinh nhật nào phù hợp
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    {selectedDay 
                      ? 'Ngày này chưa có lịch giỗ hoặc ngày sinh nào được ghi nhận.' 
                      : 'Hãy bấm "+ Thêm Sự Kiện / Giỗ" hoặc cập nhật ngày sinh trong hồ sơ thành viên để hệ thống tự động hiển thị.'}
                  </p>
                  {selectedDay && (
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Xem toàn bộ sự kiện sắp tới
                    </button>
                  )}
                </div>
              ) : (
                displayItems.map((item) => {
                  const isBirthday = item.itemType === 'birthday';
                  const days = item.daysRemaining;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        item.isToday
                          ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                          : item.isSoon
                            ? 'bg-slate-900/90 border-amber-500/40'
                            : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Countdown Badge Box */}
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                          item.isToday
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                            : item.isSoon
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-800/80 border-slate-700 text-slate-300'
                        }`}>
                          {item.isToday ? (
                            <>
                              <span className="text-[9px] font-black uppercase text-rose-400">HÔM</span>
                              <span className="text-xs font-black text-rose-200">NAY!</span>
                            </>
                          ) : item.isTomorrow ? (
                            <>
                              <span className="text-[9px] font-black uppercase text-amber-400">NGÀY</span>
                              <span className="text-xs font-black text-amber-200">MAI</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] uppercase font-medium text-slate-400">Còn</span>
                              <span className="text-base font-black font-mono leading-none">{days}</span>
                              <span className="text-[8px] text-slate-400">ngày</span>
                            </>
                          )}
                        </div>

                        {/* Event / Birthday Content */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isBirthday ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <Cake className="w-2.5 h-2.5" />
                                <span>Sinh Nhật</span>
                              </span>
                            ) : item.eventType === 'death_anniversary' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" />
                                <span>Ngày Giỗ</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                <span>Tế Tổ / Họp Mặt</span>
                              </span>
                            )}

                            {/* Longevity Milestone */}
                            {item.milestoneTitle && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{item.milestoneTitle}</span>
                              </span>
                            )}

                            {item.member && (
                              <span className="text-[10px] font-medium text-slate-400">
                                Đời {item.member.generation} • {item.member.branch}
                              </span>
                            )}
                          </div>

                          <div className="font-bold text-white text-xs sm:text-sm truncate">
                            {item.title}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-300">
                              <CalendarIcon className="w-3 h-3 text-amber-400" />
                              Dương: <strong className="text-white">{item.solarDate}</strong>
                            </span>
                            {item.lunarDate && (
                              <span className="text-amber-300/90 font-medium">
                                Âm: {item.lunarDate}
                              </span>
                            )}
                            {item.ageTurning && !item.member?.isDeceased && (
                              <span className="text-rose-300 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded">
                                Sắp tròn {item.ageTurning} tuổi
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span className="truncate max-w-[140px]">{item.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {isBirthday && item.member && (
                          <button
                            type="button"
                            onClick={() => setWishTargetMember({ member: item.member!, item })}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Gửi lời chúc mừng sinh nhật"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                            <span>Gửi Chúc Mừng</span>
                          </button>
                        )}

                        {item.member && onSelectMember && (
                          <button
                            type="button"
                            onClick={() => onSelectMember(item.member!)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Xem vị trí thành viên trên sơ đồ phả hệ"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Xem Trên Cây</span>
                          </button>
                        )}

                        {!isBirthday && (
                          <button
                            type="button"
                            onClick={() => playAlertChime(item.title)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition-colors cursor-pointer"
                            title="Thử chuông nhắc nhở"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {userRole === 'admin' && item.event && onDeleteEvent && (
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(item.event!.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Xóa sự kiện này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Birthday Wish Modal */}
      <AnimatePresence>
        {wishTargetMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Cake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Lời Chúc Sinh Nhật Tới: {wishTargetMember.member.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {wishTargetMember.item.ageTurning 
                        ? `Tròn ${wishTargetMember.item.ageTurning} tuổi (${wishTargetMember.item.solarDate})`
                        : wishTargetMember.item.solarDate}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setWishTargetMember(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Generated Wish Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/20 text-xs text-rose-100/90 leading-relaxed italic space-y-2">
                <p>
                  « {generateBirthdayWish(wishTargetMember.member, wishTargetMember.item)} »
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleCopyWish(generateBirthdayWish(wishTargetMember.member, wishTargetMember.item));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  {copiedWish ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Sao Chép Lời Chúc!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Lời Chúc Mừng</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Thêm Mới Sự Kiện / Lễ Giỗ / Sinh Nhật</h4>
                    <span className="text-[11px] text-slate-400">Được đồng bộ vào lịch gia phả tự động</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tên ngày lễ / Tiêu đề sự kiện *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Giỗ Cụ Khởi Tổ / Sinh Nhật Bác Cả..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Loại sự kiện</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none"
                    >
                      <option value="birthday">🎂 Sinh Nhật / Mừng Thọ</option>
                      <option value="death_anniversary">🕊️ Ngày Giỗ Tiên Tổ</option>
                      <option value="clan_gathering">👥 Họp Mặt & Tế Tổ</option>
                      <option value="ancestral_worship">🏮 Lễ Rằm / Thượng Tiêu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Gắn với thành viên</label>
                    <select
                      value={formMemberId}
                      onChange={(e) => {
                        setFormMemberId(e.target.value);
                        const m = members.find(x => x.id === e.target.value);
                        if (m && !formTitle) {
                          if (formType === 'birthday') {
                            setFormTitle(`Sinh nhật ${m.fullName}`);
                            if (m.birthDate) setFormSolarDate(m.birthDate);
                            if (m.lunarBirthDate) setFormLunarDate(m.lunarBirthDate);
                          } else if (formType === 'death_anniversary') {
                            setFormTitle(`Ngày giỗ ${m.fullName}`);
                            if (m.deathDate) setFormSolarDate(m.deathDate);
                            if (m.lunarDeathDate) setFormLunarDate(m.lunarDeathDate);
                          }
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Sự kiện chung toàn tộc --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} (Đời {m.generation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ngày Dương Lịch *</label>
                    <input
                      type="date"
                      required
                      value={formSolarDate}
                      onChange={(e) => setFormSolarDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ngày Âm Lịch (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 15/10 Âm"
                      value={formLunarDate}
                      onChange={(e) => setFormLunarDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Địa điểm tổ chức</label>
                  <input
                    type="text"
                    placeholder="Từ Đường Dòng Họ, Nhà Cụ Trưởng..."
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ghi chú & Lời dặn</label>
                  <textarea
                    rows={2}
                    placeholder="Chuẩn bị mâm cỗ, hương hoa, đón tiếp kiều bào..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    Lưu Sự Kiện
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
