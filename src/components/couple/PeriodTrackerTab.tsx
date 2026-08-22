import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
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
  Plus, 
  Edit3, 
  Send,
  Droplets,
  Flower2,
  HeartHandshake
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

const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Đau bụng dưới', icon: '😣' },
  { id: 'backache', label: 'Đau mỏi lưng', icon: '💆‍♀️' },
  { id: 'fatigue', label: 'Mệt mỏi, uể oải', icon: '🥱' },
  { id: 'moody', label: 'Dễ xúc động / cáu', icon: '🥺' },
  { id: 'sweet_craving', label: 'Thèm đồ ngọt / trà sữa', icon: '🧋' },
  { id: 'bloating', label: 'Đầy hơi, chướng bụng', icon: '🫧' },
  { id: 'headache', label: 'Đau đầu / chóng mặt', icon: '🤕' },
  { id: 'breast_pain', label: 'Căng tức ngực', icon: '🌸' },
  { id: 'happy', label: 'Tâm trạng thoải mái', icon: '🥰' },
];

const BOYFRIEND_CARE_PRESETS = [
  {
    id: 'warm_water',
    title: 'Nước Ấm & Trà Gừng',
    desc: 'Nhắc em uống một ly nước ấm/trà gừng mật ong xoa dịu bụng',
    icon: '🍵',
    message: 'Anh pha trà gừng ấm và nước ấm sẵn cho em rồi nè! Nhớ uống từng ngụm nhỏ cho ấm bụng em nhé ❤️'
  },
  {
    id: 'heating_pad',
    title: 'Túi Chườm Ấm Áp',
    desc: 'Gửi túi chườm ấm xoa tan cơn đau bụng cho người yêu',
    icon: '🧸',
    message: 'Anh chuẩn bị túi chườm ấm cho em rồi nè, em nằm nghỉ ngơi thoải mái để anh chăm sóc em nhé! 💕'
  },
  {
    id: 'sweet_treat',
    title: 'Socola & Trà Sữa',
    desc: 'Bổ sung năng lượng ngọt ngào giúp tâm trạng vui vẻ',
    icon: '🧋',
    message: 'Một chút ngọt ngào cho công chúa của anh! Cần ăn gì cứ nói anh mua cho em ngay nha 🍫'
  },
  {
    id: 'gentle_hug',
    title: 'Cái Ôm Xoa Dịu & Lắng Nghe',
    desc: 'Lắng nghe dịu dàng, chiều chuộng và không chọc giận',
    icon: '🫂',
    message: 'Dù em có giận hay khó chịu, anh vẫn luôn ở đây ôm em thật chặt và chiều chuộng em hết mực! 💖'
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
  // CYCLE CALCULATIONS
  // -------------------------------------------------------------
  const baseStartDateStr = couple.cycleConfig?.lastPeriodStartDate || lastStartDate;
  const effectiveCycleLen = couple.cycleConfig?.cycleLengthDays || cycleLength || 28;
  const effectivePeriodLen = couple.cycleConfig?.periodDurationDays || periodDuration || 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastStart = new Date(baseStartDateStr);
  lastStart.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastStart.getTime();
  const currentDayOfCycle = Math.floor(diffTime / (1000 * 3600 * 24)) + 1; // 1-indexed

  // Cycle phase determination
  let currentPhaseName = 'Giai đoạn Thư Thái';
  let currentPhaseDesc = 'Cơ thể đang ở trạng thái cân bằng và thoải mái.';
  let phaseThemeColor = 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300';
  let phaseBadge = '🌿 Nang Noãn';
  let isInPeriod = false;
  let isOvulation = false;

  // Next Period calculation
  const nextPeriodDate = new Date(lastStart);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + effectiveCycleLen);
  const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // Ovulation Date (approx 14 days before next period)
  const ovulationDate = new Date(lastStart);
  ovulationDate.setDate(ovulationDate.getDate() + (effectiveCycleLen - 14));
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 4);
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 2);

  if (currentDayOfCycle >= 1 && currentDayOfCycle <= effectivePeriodLen) {
    isInPeriod = true;
    currentPhaseName = `Kỳ Kinh Nguyệt (Ngày ${currentDayOfCycle}/${effectivePeriodLen})`;
    currentPhaseDesc = 'Bạn gái đang trong những ngày hành kinh. Cơ thể có thể mệt mỏi, đau bụng dưới và cần được chăm sóc đặc biệt.';
    phaseThemeColor = 'from-rose-950/80 via-red-950/50 to-zinc-900 border-rose-500 text-rose-300';
    phaseBadge = '🩸 Đang Trong Kỳ';
  } else if (today >= fertileStart && today <= fertileEnd) {
    isOvulation = true;
    const isPeak = today.toDateString() === ovulationDate.toDateString();
    currentPhaseName = isPeak ? 'Ngày Rụng Trứng Chính Thức 🌸' : 'Cửa Sổ Thụ Thai Cao 🌸';
    currentPhaseDesc = 'Thời điểm cơ thể rạng rỡ, năng lượng tràn đầy và khả năng thụ thai cao nhất trong tháng.';
    phaseThemeColor = 'from-pink-950/70 via-purple-950/40 to-zinc-900 border-pink-500 text-pink-300';
    phaseBadge = '🌸 Rụng Trứng';
  } else if (currentDayOfCycle < (effectiveCycleLen - 14)) {
    currentPhaseName = 'Giai Đoạn Nang Noãn (Tươi Tắn)';
    currentPhaseDesc = 'Hormone Estrogen tăng dần, tâm trạng vui tươi, làn da sáng đẹp và tràn đầy năng lượng.';
    phaseThemeColor = 'from-emerald-950/50 via-teal-950/30 to-zinc-900 border-emerald-500/40 text-emerald-300';
    phaseBadge = '✨ Năng Lượng Cao';
  } else {
    currentPhaseName = 'Giai Đoạn Hoàng Thể (Tiền Kinh Nguyệt PMS)';
    currentPhaseDesc = daysUntilNextPeriod <= 3 
      ? `Còn khoảng ${daysUntilNextPeriod} ngày nữa sẽ đến kỳ mới. Bạn gái có thể nhạy cảm, dễ mệt hoặc thèm đồ ngọt.`
      : 'Giai đoạn chuẩn bị cho chu kỳ mới. Hãy nghỉ ngơi đầy đủ và ăn uống lành mạnh.';
    phaseThemeColor = 'from-amber-950/60 via-orange-950/30 to-zinc-900 border-amber-500/40 text-amber-300';
    phaseBadge = '🌙 Tiền Kinh Nguyệt';
  }

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

      {/* 1. HERO CYCLE STATUS CARD */}
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${phaseThemeColor} border p-4 xs:p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Flower2 size={12} className="animate-spin text-rose-300" style={{ animationDuration: '8s' }} />
              <span>Sổ Tay Sức Khỏe & Chu Kỳ Bạn Gái</span>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{currentPhaseName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{isEditingConfig ? 'Đóng Cài Đặt' : 'Tùy Chỉnh Chu Kỳ'}</span>
            </button>
            <button
              onClick={() => setIsAddingLog(!isAddingLog)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Ghi Nhật Ký Hôm Nay</span>
            </button>
          </div>
        </div>

        {/* Edit Cycle Configuration Panel */}
        {isEditingConfig && (
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-zinc-950/80 border border-rose-500/30 space-y-3.5 animate-in slide-in-from-top-2">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Thiết lập chu kỳ kinh nguyệt cá nhân của bạn gái:</span>
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
                placeholder="VD: Thường đau lưng vào ngày 1-2, thích uống trà gừng ấm..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingConfig(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? 'Đang Lưu...' : 'Cập Nhật Chu Kỳ'}
              </button>
            </div>
          </form>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/60 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Hôm Nay Thuộc</div>
            <div className="text-base sm:text-2xl font-black text-rose-300">Ngày {currentDayOfCycle}</div>
            <div className="text-[10px] text-zinc-400">của chu kỳ {effectiveCycleLen} ngày</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/60 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Kỳ Kinh Tiếp Theo</div>
            <div className="text-base sm:text-2xl font-black text-white">
              {daysUntilNextPeriod > 0 ? `${daysUntilNextPeriod} ngày nữa` : 'Hôm nay / Đang kỳ'}
            </div>
            <div className="text-[10px] text-zinc-400">Dự kiến: {nextPeriodDate.toLocaleDateString('vi-VN')}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/60 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Ngày Rụng Trứng</div>
            <div className="text-base sm:text-2xl font-black text-pink-300">
              {ovulationDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </div>
            <div className="text-[10px] text-zinc-400">Khả năng thụ thai cao</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/60 border border-white/10 space-y-1">
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">Trạng Thái Sức Khỏe</div>
            <div className="text-xs sm:text-sm font-bold text-amber-300 truncate">
              {isInPeriod ? '🩸 Cần nghỉ ngơi' : isOvulation ? '🌸 Đang rạng rỡ' : '🌿 Ổn định tốt'}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">{currentPhaseDesc.slice(0, 32)}...</div>
          </div>
        </div>

        {/* Phase Summary & Tip */}
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/10 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
          <Sparkles size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Lời khuyên ngày hôm nay: </span>
            <span>{currentPhaseDesc}</span>
          </div>
        </div>
      </div>

      {/* 2. GÓC BẠN TRAI CHĂM SÓC (BOYFRIEND CARE STATION) */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧸</span>
              <h3 className="text-sm sm:text-base font-black text-white">Góc Chăm Sóc Bạn Gái Yêu</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Dành riêng cho bạn trai: Gửi lời động viên, trà gừng, túi chườm ấm 1 chạm giúp bạn gái vơi bớt mệt mỏi.
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
              <span>Ghi Nhật Ký Triệu Chứng & Cảm Xúc Hôm Nay</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="text-zinc-400 hover:text-white text-xs"
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
              Bấm nút "Ghi Nhật Ký Hôm Nay" ở trên để lưu lại các triệu chứng và tâm trạng trong kỳ để cả hai cùng theo dõi nhé!
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
                        Lượng: {log.flowLevel === 'heavy' ? 'Nhiều' : log.flowLevel === 'medium' ? 'Vừa' : 'Ít'}
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
                  <p className="text-xs text-zinc-300 italic bg-rose-950/20 p-2 rounded-xl border border-rose-500/20">
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
