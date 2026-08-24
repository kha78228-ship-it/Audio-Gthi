import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Calendar as CalendarIcon, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Flame, 
  Coffee, 
  Smile, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Edit3, 
  Send,
  Droplets,
  Flower2,
  HeartHandshake,
  Info,
  CalendarDays,
  Activity,
  CheckCircle2,
  TrendingUp,
  Gift
} from 'lucide-react';
import { CoupleData, CouplePeriodCycleConfig, CouplePeriodLog } from '../../types';

interface PeriodTrackerTabProps {
  couple: CoupleData;
  userUid?: string;
  periodLogs: CouplePeriodLog[];
  onUpdateCycleConfig: (config: CouplePeriodCycleConfig) => Promise<void>;
  onAddPeriodLog: (log: Omit<CouplePeriodLog, 'id' | 'coupleId' | 'createdAt'>) => Promise<void>;
  onSendBoyfriendCarePing: (careType: string, customMessage?: string) => Promise<void>;
}

export const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Đau bụng dưới', icon: '😣' },
  { id: 'backache', label: 'Đau mỏi lưng', icon: '💆‍♀️' },
  { id: 'fatigue', label: 'Mệt mỏi, uể oải', icon: '🥱' },
  { id: 'moody', label: 'Dễ xúc động / cáu', icon: '🥺' },
  { id: 'sweet_craving', label: 'Thèm đồ ngọt / trà sữa', icon: '🧋' },
  { id: 'bloating', label: 'Đầy hơi, chướng bụng', icon: '🫧' },
  { id: 'headache', label: 'Đau đầu / chóng mặt', icon: '🤕' },
  { id: 'breast_pain', label: 'Căng tức ngực', icon: '🌸' },
  { id: 'acne', label: 'Nổi mụn trứng cá', icon: '✨' },
  { id: 'happy', label: 'Tâm trạng thoải mái', icon: '🥰' },
];

export const BOYFRIEND_CARE_PRESETS = [
  {
    id: 'warm_water',
    title: 'Nước Ấm & Trà Gừng',
    desc: 'Nhắc em uống một ly nước ấm / trà gừng mật ong xoa dịu bụng',
    icon: '🍵',
    message: 'Anh chuẩn bị sẵn trà gừng mật ong ấm cho em rồi nè! Nhớ uống từng ngụm nhỏ cho bụng dễ chịu nha người yêu ❤️'
  },
  {
    id: 'heating_pad',
    title: 'Túi Chườm Ấm Áp',
    desc: 'Gửi túi chườm ấm xoa tan cơn đau mỏi lưng và bụng cho bạn gái',
    icon: '🧸',
    message: 'Anh chuẩn bị túi chườm ấm cho em rồi nè, em nằm nghỉ ngơi thoải mái để anh xoa bóp và chăm sóc em nhé! 💕'
  },
  {
    id: 'sweet_treat',
    title: 'Socola & Trà Sữa',
    desc: 'Bổ sung năng lượng ngọt ngào giúp tâm trạng em vui vẻ, thư giãn',
    icon: '🧋',
    message: 'Một chút ngọt ngào cho công chúa của anh! Cần ăn món gì hay thèm trà sữa cứ nói để anh mua cho em ngay nha 🍫'
  },
  {
    id: 'gentle_hug',
    title: 'Cái Ôm Xoa Dịu & Lắng Nghe',
    desc: 'Lắng nghe dịu dàng, chiều chuộng và ôm thật chặt',
    icon: '🫂',
    message: 'Dù em có giận dỗi hay khó chịu trong người, anh vẫn luôn ở đây ôm em thật chặt và chiều chuộng em hết mực! 💖'
  }
];

export function PeriodTrackerTab({
  couple,
  userUid,
  periodLogs,
  onUpdateCycleConfig,
  onAddPeriodLog,
  onSendBoyfriendCarePing
}: PeriodTrackerTabProps) {
  const isMePartner1 = couple.partner1.uid === userUid;
  const myNickname = isMePartner1 ? couple.partner1.nickname || 'Bạn' : couple.partner2?.nickname || 'Bạn';
  const partnerNickname = isMePartner1 ? couple.partner2?.nickname || 'Người Ấy' : couple.partner1.nickname || 'Người Ấy';

  // Navigation tab inside Period Tracker: 'overview' (Lịch & Tổng quan), 'forecast' (Dự báo tương lai), 'guide' (Cẩm nang 4 pha)
  const [subView, setSubView] = useState<'overview' | 'forecast' | 'guide'>('overview');

  // Month navigation for visual calendar
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  // Selected date in calendar for inspection
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Config setup state
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [lastStartDate, setLastStartDate] = useState(() => {
    if (couple.cycleConfig?.lastPeriodStartDate) {
      return couple.cycleConfig.lastPeriodStartDate;
    }
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState(couple.cycleConfig?.cycleLengthDays || 28);
  const [periodDuration, setPeriodDuration] = useState(couple.cycleConfig?.periodDurationDays || 5);
  const [cycleNotes, setCycleNotes] = useState(couple.cycleConfig?.notes || '');
  const [savingConfig, setSavingConfig] = useState(false);

  // New Log state
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logStartDate, setLogStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [logFlow, setLogFlow] = useState<'light' | 'medium' | 'heavy' | 'spotting'>('medium');
  const [logPain, setLogPain] = useState<number>(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['cramps', 'fatigue']);
  const [logMood, setLogMood] = useState('Cần được ôm');
  const [logCareNotes, setLogCareNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Quick care toast animation
  const [careSentMessage, setCareSentMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CYCLE CALCULATIONS ENGINE
  // -------------------------------------------------------------
  const baseStartDateStr = couple.cycleConfig?.lastPeriodStartDate || lastStartDate;
  const effectiveCycleLen = couple.cycleConfig?.cycleLengthDays || cycleLength || 28;
  const effectivePeriodLen = couple.cycleConfig?.periodDurationDays || periodDuration || 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseStart = useMemo(() => {
    const d = new Date(baseStartDateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [baseStartDateStr]);

  // Current Cycle Day (normalized)
  const diffFromBase = Math.floor((today.getTime() - baseStart.getTime()) / (1000 * 3600 * 24));
  // Normalized to current active cycle index (1-indexed)
  const normalizedDayInCycle = ((diffFromBase % effectiveCycleLen) + effectiveCycleLen) % effectiveCycleLen + 1;

  // Next Period Start Date
  const cyclesPassed = Math.floor(diffFromBase / effectiveCycleLen);
  const currentCycleStartDate = new Date(baseStart);
  currentCycleStartDate.setDate(currentCycleStartDate.getDate() + cyclesPassed * effectiveCycleLen);

  const nextPeriodDate = new Date(currentCycleStartDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + effectiveCycleLen);
  const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // Ovulation Date for current cycle
  const currentOvulationDate = new Date(currentCycleStartDate);
  currentOvulationDate.setDate(currentOvulationDate.getDate() + (effectiveCycleLen - 14));

  // Determine Phase for ANY given date
  const getPhaseForDate = (targetDate: Date) => {
    const t = new Date(targetDate);
    t.setHours(0, 0, 0, 0);
    const diff = Math.floor((t.getTime() - baseStart.getTime()) / (1000 * 3600 * 24));
    const dayInCycle = ((diff % effectiveCycleLen) + effectiveCycleLen) % effectiveCycleLen + 1;

    const isPeriodDay = dayInCycle >= 1 && dayInCycle <= effectivePeriodLen;
    const ovulationDayIndex = effectiveCycleLen - 14;
    const isOvulationPeak = dayInCycle === ovulationDayIndex;
    const isFertileWindow = dayInCycle >= (ovulationDayIndex - 4) && dayInCycle <= (ovulationDayIndex + 2);
    const isFollicular = dayInCycle > effectivePeriodLen && dayInCycle < (ovulationDayIndex - 4);
    const isLuteal = dayInCycle > (ovulationDayIndex + 2);

    let type: 'period' | 'ovulation_peak' | 'fertile' | 'follicular' | 'luteal' = 'follicular';
    let name = 'Giai Đoạn Nang Noãn';
    let badgeText = '✨ Tươi Tắn & Năng Lượng';
    let bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    let indicatorColor = '#10b981';
    let fertilityLevel = 'Thấp';
    let boyfriendTip = 'Tâm trạng bạn gái đang rất tốt, tràn đầy hứng khởi. Rất thích hợp để cùng nhau đi ăn, dạo phố hoặc lên kế hoạch mới.';
    let girlfriendTip = 'Estrogen tăng giúp da sáng, tinh thần vui tươi. Hãy tận dụng thời gian này để học tập và rèn luyện thể thao!';

    if (isPeriodDay) {
      type = 'period';
      name = `Kỳ Hành Kinh (Ngày ${dayInCycle}/${effectivePeriodLen})`;
      badgeText = '🩸 Đang Trong Kỳ';
      bgClass = 'bg-rose-600/30 text-rose-300 border-rose-500/50';
      indicatorColor = '#f43f5e';
      fertilityLevel = 'Cực Thấp (Rất an toàn)';
      boyfriendTip = 'Bạn gái dễ đau bụng, mỏi lưng và nhạy cảm. Hãy chủ động pha nước ấm/trà gừng, chuẩn bị túi chườm và dịu dàng chăm sóc.';
      girlfriendTip = 'Cơ thể cần nghỉ ngơi. Tránh đồ lạnh, tắm nước ấm và bổ sung thêm thực phẩm giàu sắt nhé!';
    } else if (isOvulationPeak) {
      type = 'ovulation_peak';
      name = 'Ngày Rụng Trứng Đỉnh Điểm 🌸';
      badgeText = '🌸 Rụng Trứng (Cao Nhất)';
      bgClass = 'bg-pink-600/30 text-pink-300 border-pink-400/60 shadow-pink-500/20';
      indicatorColor = '#ec4899';
      fertilityLevel = 'Cao Nhất (99%)';
      boyfriendTip = 'Bạn gái đang ở thời điểm quyến rũ và rạng rỡ nhất trong tháng. Hãy dành những lời khen chân thành và một buổi tối ngọt ngào.';
      girlfriendTip = 'Năng lượng và sự quyến rũ đạt đỉnh cao. Nhớ giữ gìn sức khỏe và uống đủ nước nhé!';
    } else if (isFertileWindow) {
      type = 'fertile';
      name = 'Cửa Sổ Thụ Thai Cao 💜';
      badgeText = '💜 Khả Năng Thụ Thai Cao';
      bgClass = 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      indicatorColor = '#a855f7';
      fertilityLevel = 'Rất Cao';
      boyfriendTip = 'Thời điểm cơ thể bạn gái rất nhạy cảm và tràn đầy sức sống. Cùng nhau chia sẻ những câu chuyện tình cảm sâu sắc.';
      girlfriendTip = 'Khả năng thụ thai trong tuần này rất cao. Cần lưu ý các biện pháp kế hoạch nếu chưa có ý định sinh em bé.';
    } else if (isLuteal) {
      type = 'luteal';
      name = 'Giai Đoạn Hoàng Thể (Tiền Kinh Nguyệt PMS) 🌙';
      badgeText = '🌙 Tiền Kinh Nguyệt (PMS)';
      bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      indicatorColor = '#f59e0b';
      fertilityLevel = 'Thấp';
      boyfriendTip = 'Bạn gái có thể dễ cáu, mệt mỏi hoặc thèm đồ ngọt do biến đổi hormone. Hãy kiên nhẫn, mua trà sữa/socola dỗ dành cô ấy.';
      girlfriendTip = 'Progesterone tăng có thể khiến bạn hơi nặng bụng và nhạy cảm. Đừng lo lắng, hãy ngủ đủ giấc và nghe nhạc thư giãn.';
    }

    return {
      dayInCycle,
      type,
      name,
      badgeText,
      bgClass,
      indicatorColor,
      fertilityLevel,
      boyfriendTip,
      girlfriendTip
    };
  };

  // Today phase
  const todayPhase = getPhaseForDate(today);
  const selectedPhase = getPhaseForDate(selectedDate);

  // Check if a specific date has a log
  const getLogForDateStr = (dateStr: string) => {
    return periodLogs.find(l => l.startDate === dateStr);
  };

  // -------------------------------------------------------------
  // MULTI-MONTH FORECAST ENGINE (Dự Báo 4 Chu Kỳ Kế Tiếp)
  // -------------------------------------------------------------
  const forecastCycles = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 4; i++) {
      const cStart = new Date(currentCycleStartDate);
      cStart.setDate(cStart.getDate() + (i * effectiveCycleLen));
      
      const cEnd = new Date(cStart);
      cEnd.setDate(cEnd.getDate() + (effectivePeriodLen - 1));

      const cOvul = new Date(cStart);
      cOvul.setDate(cOvul.getDate() + (effectiveCycleLen - 14));

      const cFertileStart = new Date(cOvul);
      cFertileStart.setDate(cFertileStart.getDate() - 4);

      const cFertileEnd = new Date(cOvul);
      cFertileEnd.setDate(cFertileEnd.getDate() + 2);

      list.push({
        cycleIndex: i,
        startDate: cStart,
        endDate: cEnd,
        ovulationDate: cOvul,
        fertileStart: cFertileStart,
        fertileEnd: cFertileEnd
      });
    }
    return list;
  }, [currentCycleStartDate, effectiveCycleLen, effectivePeriodLen]);

  // -------------------------------------------------------------
  // MONTHLY CALENDAR GRID BUILDER
  // -------------------------------------------------------------
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as first day of week (0: Sun -> 6: Sat)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(year, month, day);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [calendarMonth]);

  // Calendar month change handlers
  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCalendarMonth(now);
    setSelectedDate(now);
  };

  // Toggle symptom select
  const toggleSymptom = (symId: string) => {
    if (selectedSymptoms.includes(symId)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symId]);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await onUpdateCycleConfig({
        lastPeriodStartDate: lastStartDate,
        cycleLengthDays: Number(cycleLength),
        periodDurationDays: Number(periodDuration),
        notes: cycleNotes.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: userUid
      });
      setIsEditingConfig(false);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      await onAddPeriodLog({
        startDate: logStartDate,
        flowLevel: logFlow,
        painLevel: logPain,
        symptoms: selectedSymptoms,
        mood: logMood,
        boyfriendCareNotes: logCareNotes.trim(),
      });
      setIsAddingLog(false);
    } finally {
      setSavingLog(false);
    }
  };

  const handleSendCare = async (preset: typeof BOYFRIEND_CARE_PRESETS[0]) => {
    await onSendBoyfriendCarePing(preset.id, preset.message);
    setCareSentMessage(`💖 Đã gửi "${preset.title}" tới người yêu! (+10đ Tình Yêu)`);
    setTimeout(() => setCareSentMessage(null), 4000);
  };

  const isTodaySelected = selectedDate.toDateString() === today.toDateString();
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDateLog = getLogForDateStr(selectedDateStr);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Toast popup when care sent */}
      {careSentMessage && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/95 to-pink-950/95 border border-rose-500 shadow-2xl text-white font-bold text-xs flex items-center justify-between gap-2 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-400 fill-rose-400 animate-bounce" />
            <span>{careSentMessage}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black">+10đ</span>
        </div>
      )}

      {/* 1. HERO CYCLE STATUS & OVERVIEW CARD */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-950/70 via-zinc-900 to-zinc-950 border border-rose-500/30 p-4 xs:p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-rose-500/30">
              <Flower2 size={13} className="animate-spin text-rose-400" style={{ animationDuration: '8s' }} />
              <span>Sổ Tay Sức Khỏe & Chu Kỳ Bạn Gái</span>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{todayPhase.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{isEditingConfig ? 'Đóng Thiết Lập' : 'Tùy Chỉnh Chu Kỳ'}</span>
            </button>
            <button
              onClick={() => {
                setLogStartDate(new Date().toISOString().split('T')[0]);
                setIsAddingLog(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Ghi Nhật Ký Hôm Nay</span>
            </button>
          </div>
        </div>

        {/* Edit Cycle Configuration Panel */}
        {isEditingConfig && (
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/40 space-y-3.5 animate-in slide-in-from-top-2">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <CalendarIcon size={14} />
              <span>Thiết lập thông số chu kỳ kinh nguyệt bạn gái:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Ngày bắt đầu kỳ gần nhất</label>
                <input
                  type="date"
                  value={lastStartDate}
                  onChange={(e) => setLastStartDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Độ dài chu kỳ (Ngày)</label>
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                  placeholder="Mặc định: 28"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Số ngày hành kinh (Ngày)</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                  placeholder="Mặc định: 5"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Ghi chú sức khỏe riêng tư (Tùy chọn)</label>
              <input
                type="text"
                value={cycleNotes}
                onChange={(e) => setCycleNotes(e.target.value)}
                placeholder="VD: Thường mỏi lưng vào ngày đầu, thích uống trà gừng và chườm ấm..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingConfig(false)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? 'Đang Lưu...' : 'Cập Nhật Chu Kỳ'}
              </button>
            </div>
          </form>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Activity size={12} className="text-rose-400" />
              <span>Tiến Độ Chu Kỳ</span>
            </div>
            <div className="text-base sm:text-2xl font-black text-rose-300">Ngày {normalizedDayInCycle}</div>
            <div className="text-[10px] text-zinc-400">của chu kỳ {effectiveCycleLen} ngày</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Droplets size={12} className="text-rose-400" />
              <span>Kỳ Tiếp Theo</span>
            </div>
            <div className="text-base sm:text-2xl font-black text-white">
              {daysUntilNextPeriod > 0 ? `Còn ${daysUntilNextPeriod} ngày` : 'Hôm nay / Đang kỳ'}
            </div>
            <div className="text-[10px] text-zinc-400">Dự kiến: {nextPeriodDate.toLocaleDateString('vi-VN')}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Flower2 size={12} className="text-pink-400" />
              <span>Ngày Rụng Trứng</span>
            </div>
            <div className="text-base sm:text-2xl font-black text-pink-300">
              {currentOvulationDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </div>
            <div className="text-[10px] text-zinc-400">Khả năng thụ thai đỉnh điểm</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1">
              <ShieldAlert size={12} className="text-amber-400" />
              <span>Khả Năng Thụ Thai</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-amber-300 truncate">
              {todayPhase.fertilityLevel}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">{todayPhase.badgeText}</div>
          </div>
        </div>

        {/* Dynamic Tip for Today */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
          <Sparkles size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Lời khuyên chăm sóc hôm nay:</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${todayPhase.bgClass}`}>
                {todayPhase.badgeText}
              </span>
            </div>
            <p className="text-zinc-300 text-xs">{todayPhase.boyfriendTip}</p>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (Tổng quan Lịch Tháng / Dự Báo Tương Lai / Cẩm Nang 4 Pha) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubView('overview')}
          className={`flex-1 min-w-[130px] py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subView === 'overview'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <CalendarDays size={14} />
          <span>Lịch Chu Kỳ Tháng</span>
        </button>

        <button
          onClick={() => setSubView('forecast')}
          className={`flex-1 min-w-[130px] py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subView === 'forecast'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <TrendingUp size={14} />
          <span>Dự Báo 4 Chu Kỳ Tới</span>
        </button>

        <button
          onClick={() => setSubView('guide')}
          className={`flex-1 min-w-[130px] py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subView === 'guide'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Info size={14} />
          <span>Cẩm Nang 4 Giai Đoạn</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* VIEW 1: MONTHLY VISUAL CALENDAR & DAY INSPECTOR */}
      {/* ============================================================= */}
      {subView === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left: Monthly Interactive Calendar (7 cols) */}
            <div className="lg:col-span-7 p-4 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
              {/* Calendar Month Header & Switcher */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-rose-400" />
                  <h3 className="text-sm sm:text-base font-black text-white capitalize">
                    Tháng {calendarMonth.getMonth() + 1}, {calendarMonth.getFullYear()}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleGoToday}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-colors cursor-pointer mr-1"
                  >
                    Hôm Nay
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Tháng trước"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Tháng sau"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] pt-1">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Kỳ Kinh</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <span>Rụng Trứng 🌸</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Thụ Thai Cao</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Tiền Kinh PMS</span>
                </span>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] sm:text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div className="text-rose-400">T7</div>
                <div className="text-rose-400">CN</div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {calendarDays.map((item, idx) => {
                  const dayDate = item.date;
                  const dayPhase = getPhaseForDate(dayDate);
                  const isCurrentDay = dayDate.toDateString() === today.toDateString();
                  const isDaySelected = dayDate.toDateString() === selectedDate.toDateString();
                  const dateStr = dayDate.toISOString().split('T')[0];
                  const hasLog = Boolean(getLogForDateStr(dateStr));

                  // Phase styling
                  let cellBg = 'bg-zinc-950/60 text-zinc-300 hover:bg-zinc-800/80';
                  let ringClass = '';

                  if (dayPhase.type === 'period') {
                    cellBg = 'bg-rose-950/70 text-rose-200 border-rose-500/50 hover:bg-rose-900/60 font-bold';
                  } else if (dayPhase.type === 'ovulation_peak') {
                    cellBg = 'bg-pink-950/80 text-pink-200 border-pink-400/60 shadow-sm font-extrabold';
                  } else if (dayPhase.type === 'fertile') {
                    cellBg = 'bg-purple-950/50 text-purple-200 border-purple-500/40 hover:bg-purple-900/40';
                  } else if (dayPhase.type === 'luteal') {
                    cellBg = 'bg-amber-950/40 text-amber-200 border-amber-500/30 hover:bg-amber-900/30';
                  }

                  if (isDaySelected) {
                    ringClass = 'ring-2 ring-white scale-105 z-10';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dayDate)}
                      className={`relative min-h-[44px] sm:min-h-[56px] p-1 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                        item.isCurrentMonth ? cellBg : 'opacity-30 bg-zinc-950/20 border-zinc-900'
                      } ${ringClass}`}
                    >
                      <div className="flex items-center justify-between w-full px-1">
                        <span className={`text-[11px] sm:text-xs font-mono ${
                          isCurrentDay ? 'px-1 rounded bg-rose-500 text-white font-black' : ''
                        }`}>
                          {dayDate.getDate()}
                        </span>

                        {dayPhase.type === 'ovulation_peak' && (
                          <span className="text-[10px]">🌸</span>
                        )}
                        {dayPhase.type === 'period' && (
                          <span className="text-[9px] text-rose-400">🩸</span>
                        )}
                      </div>

                      {/* Dot indicators */}
                      <div className="flex items-center gap-0.5 mt-auto">
                        {hasLog && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Đã có nhật ký ghi chép" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Day Inspector & Quick Action Card (5 cols) */}
            <div className="lg:col-span-5 p-4 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Chi Tiết Ngày Đang Chọn</div>
                    <div className="text-sm sm:text-base font-black text-white">
                      {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {isTodaySelected && <span className="ml-2 text-xs text-rose-400 font-bold">(Hôm nay)</span>}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${selectedPhase.bgClass}`}>
                    {selectedPhase.badgeText}
                  </span>
                </div>

                {/* Selected Phase Info Box */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-400">Giai đoạn chu kỳ:</span>
                    <span className="text-white font-extrabold">{selectedPhase.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-400">Khả năng thụ thai:</span>
                    <span className="text-amber-300 font-bold">{selectedPhase.fertilityLevel}</span>
                  </div>
                </div>

                {/* Tips for Boyfriend & Girlfriend on that selected day */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-rose-500/20 space-y-1">
                    <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                      <span>🧸 Lời khuyên cho bạn trai ({partnerNickname}):</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedPhase.boyfriendTip}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-pink-500/20 space-y-1">
                    <div className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                      <span>🌸 Mẹo tự chăm sóc cho bạn gái ({myNickname}):</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedPhase.girlfriendTip}
                    </p>
                  </div>
                </div>

                {/* Log on selected day if any */}
                {selectedDateLog && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Đã ghi nhật ký cho ngày này:</span>
                    </div>
                    <div className="text-xs text-zinc-300">
                      Mức đau: <span className="font-bold text-rose-300">{selectedDateLog.painLevel}/5</span> • Lượng kinh: <span className="font-bold text-white">{selectedDateLog.flowLevel || 'Vừa'}</span>
                    </div>
                    {selectedDateLog.boyfriendCareNotes && (
                      <div className="text-[11px] text-zinc-400 italic">
                        "{selectedDateLog.boyfriendCareNotes}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Log for this day */}
              <button
                onClick={() => {
                  setLogStartDate(selectedDateStr);
                  setIsAddingLog(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Ghi Nhật Ký Cho Ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: MULTI-MONTH FUTURE FORECAST (Dự Báo 4 Chu Kỳ Tiếp Theo) */}
      {/* ============================================================= */}
      {subView === 'forecast' && (
        <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-rose-400" />
                <h3 className="text-sm sm:text-base font-black text-white">Dự Báo 4 Chu Kỳ Kế Tiếp (Năm 2026)</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Kế hoạch chu kỳ tương lai giúp hai bạn chủ động sắp xếp lịch du lịch, hẹn hò lãng mạn và tránh những ngày mệt mỏi.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/20">
              Chu kỳ chuẩn: {effectiveCycleLen} ngày
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {forecastCycles.map((c) => (
              <div
                key={c.cycleIndex}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black">
                      Kỳ #{c.cycleIndex}
                    </span>
                    <span>Tháng {c.startDate.getMonth() + 1}/{c.startDate.getFullYear()}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Dự kiến {effectivePeriodLen} ngày
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/30 border border-rose-500/20">
                    <span className="text-zinc-300 flex items-center gap-1">
                      <span>🩸 Ngày bắt đầu kỳ kinh:</span>
                    </span>
                    <span className="font-bold text-rose-300 font-mono">
                      {c.startDate.toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-pink-950/30 border border-pink-500/20">
                    <span className="text-zinc-300 flex items-center gap-1">
                      <span>🌸 Ngày rụng trứng dự kiến:</span>
                    </span>
                    <span className="font-bold text-pink-300 font-mono">
                      {c.ovulationDate.toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-950/20 border border-purple-500/20">
                    <span className="text-zinc-300">💜 Cửa sổ thụ thai cao:</span>
                    <span className="font-bold text-purple-300 font-mono text-[11px]">
                      {c.fertileStart.getDate()}/{c.fertileStart.getMonth() + 1} - {c.fertileEnd.getDate()}/{c.fertileEnd.getMonth() + 1}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400 shrink-0" />
                  <span>
                    Gợi ý: Tránh xếp lịch đi biển / leo núi từ ngày {c.startDate.getDate()}/{c.startDate.getMonth() + 1} đến {c.endDate.getDate()}/{c.endDate.getMonth() + 1}.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 3: 4-PHASE CYCLE GUIDE (Cẩm Nang Thấu Hiểu Sinh Học Phụ Nữ) */}
      {/* ============================================================= */}
      {subView === 'guide' && (
        <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Info size={18} className="text-rose-400" />
              <span>Cẩm Nang 4 Giai Đoạn Chu Kỳ Của Phụ Nữ</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Giúp bạn trai thấu hiểu trọn vẹn diễn biến tâm lý & thể chất của bạn gái để luôn yêu thương và chăm sóc đúng cách.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phase 1 */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🩸 1. Giai Đoạn Hành Kinh</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  Ngày 1 - 5
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hormone estrogen và progesterone xuống mức thấp nhất. Niêm mạc tử cung bong ra gây đau bụng dưới, mỏi lưng và mệt mỏi.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-rose-500/20 text-[11px] text-rose-200">
                <strong>Bạn trai nên làm:</strong> Pha trà gừng ấm, mua túi chườm nóng, không để bạn gái mang vác nặng, ôm ấp và massage lưng.
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>✨ 2. Giai Đoạn Nang Noãn</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  Ngày 6 - 11
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Estrogen tăng cao dần. Bạn gái cảm thấy tràn đầy năng lượng, làn da mịn màng tươi sáng, tâm trạng vui vẻ và cởi mở.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/20 text-[11px] text-emerald-200">
                <strong>Bạn trai nên làm:</strong> Lên lịch hẹn hò đi chơi, thử các quán ăn mới, trải nghiệm hoạt động thể thao cùng nhau.
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🌸 3. Giai Đoạn Rụng Trứng</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                  Ngày 12 - 16
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Trứng rụng và sẵn sàng thụ tinh. Đây là thời điểm phụ nữ quyến rũ nhất, giọng nói ngọt ngào, cảm xúc thăng hoa cao độ.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-pink-500/20 text-[11px] text-pink-200">
                <strong>Bạn trai nên làm:</strong> Dành những lời khen chân thành, tặng hoa hồng, tạo không gian lãng mạn cho hai đứa.
              </div>
            </div>

            {/* Phase 4 */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🌙 4. Giai Đoạn Hoàng Thể (PMS)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  Ngày 17 - 28
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Progesterone tăng rồi sụt giảm nhanh nếu không thụ thai. Bạn gái có thể bị đầy hơi, nổi mụn, nhạy cảm hoặc dễ xúc động.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-amber-500/20 text-[11px] text-amber-200">
                <strong>Bạn trai nên làm:</strong> Kiên nhẫn tuyệt đối, không tranh luận, chủ động mua trà sữa/bánh ngọt dỗ dành người yêu.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GÓC BẠN TRAI CHĂM SÓC 1 CHẠM (BOYFRIEND CARE STATION) */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧸</span>
              <h3 className="text-sm sm:text-base font-black text-white">Góc Chăm Sóc Bạn Gái 1 Chạm</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Dành riêng cho bạn trai: Gửi lời động viên, trà gừng, túi chườm ấm 1 chạm giúp bạn gái xoa tan cơn đau mỏi.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
            +10đ Yêu / Lần
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {BOYFRIEND_CARE_PRESETS.map(preset => (
            <div 
              key={preset.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0 p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  {preset.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                    {preset.title}
                  </div>
                  <div className="text-[10px] sm:text-xs text-zinc-400 truncate">
                    {preset.desc}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSendCare(preset)}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Send size={12} />
                <span>Gửi Ngay</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LOG NEW SYMPTOMS MODAL / PANEL */}
      {isAddingLog && (
        <form onSubmit={handleSaveLog} className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Droplets size={16} className="text-rose-400" />
              <span>Ghi Nhật Ký Triệu Chứng & Cảm Xúc ({logStartDate})</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Ngày ghi chép</label>
              <input
                type="date"
                value={logStartDate}
                onChange={(e) => setLogStartDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Lượng kinh nguyệt (Flow)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'spotting', label: 'Vệt nhẹ' },
                  { id: 'light', label: 'Ít' },
                  { id: 'medium', label: 'Vừa' },
                  { id: 'heavy', label: 'Nhiều' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLogFlow(f.id as any)}
                    className={`py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                      logFlow === f.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300">Mức độ đau / khó chịu ({logPain}/5)</label>
              <span className="text-[11px] text-rose-300 font-bold">
                {logPain === 1 ? 'Hầu như không đau' : logPain === 3 ? 'Đau vừa, hơi mỏi' : logPain === 5 ? 'Đau nhiều, cần nghỉ ngơi' : `Mức độ ${logPain}`}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={logPain}
              onChange={(e) => setLogPain(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300">Triệu chứng cơ thể & tâm trạng</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map(sym => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>{sym.icon}</span>
                    <span className="truncate">{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">Tâm sự thêm / Lời nhắn cho người yêu</label>
            <input
              type="text"
              value={logCareNotes}
              onChange={(e) => setLogCareNotes(e.target.value)}
              placeholder="VD: Hôm nay hơi mỏi lưng, muốn được người ấy xoa lưng và ôm một cái..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savingLog}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
            >
              {savingLog ? 'Đang Lưu...' : 'Lưu Nhật Ký'}
            </button>
          </div>
        </form>
      )}

      {/* 4. HISTORY OF PERIOD LOGS */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-rose-400" />
            <h3 className="text-sm sm:text-base font-black text-white">Lịch Sử Ghi Chép Chu Kỳ</h3>
          </div>
          <span className="text-xs text-zinc-500">{periodLogs.length} bản ghi</span>
        </div>

        {periodLogs.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
              🌸
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-300">Chưa có bản ghi nhật ký chu kỳ nào</div>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Bấm nút "Ghi Nhật Ký Hôm Nay" ở trên hoặc chọn bất kỳ ngày nào trên lịch để lưu lại các triệu chứng và tâm trạng nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {periodLogs.map(log => (
              <div 
                key={log.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold text-xs sm:text-sm font-mono">📅 {log.startDate}</span>
                    {log.flowLevel && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        Lượng: {log.flowLevel === 'heavy' ? 'Nhiều' : log.flowLevel === 'medium' ? 'Vừa' : log.flowLevel === 'light' ? 'Ít' : 'Vệt nhẹ'}
                      </span>
                    )}
                  </div>
                  {log.painLevel && (
                    <span className="text-[10px] text-zinc-400">
                      Mức đau: <span className="text-rose-400 font-bold">{log.painLevel}/5</span>
                    </span>
                  )}
                </div>

                {log.symptoms && log.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {log.symptoms.map(symId => {
                      const symObj = SYMPTOM_OPTIONS.find(s => s.id === symId);
                      return (
                        <span key={symId} className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-medium flex items-center gap-1">
                          <span>{symObj?.icon || '•'}</span>
                          <span>{symObj?.label || symId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {log.boyfriendCareNotes && (
                  <p className="text-xs text-zinc-300 italic bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                    "{log.boyfriendCareNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
