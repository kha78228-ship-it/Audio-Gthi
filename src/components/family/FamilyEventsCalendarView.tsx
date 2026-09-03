import React, { useState, useMemo } from 'react';
import { FamilyEvent, FamilyTreeMember as FamilyMember, FamilyRole, FamilyEventType } from '../../types';
import { 
  Calendar, 
  Bell, 
  Plus, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Volume2, 
  Info,
  Flame,
  Cake,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

interface FamilyEventsCalendarViewProps {
  events: FamilyEvent[];
  members: FamilyMember[];
  userRole: FamilyRole;
  onAddEvent: (event: FamilyEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const FamilyEventsCalendarView: React.FC<FamilyEventsCalendarViewProps> = ({
  events,
  members,
  userRole,
  onAddEvent,
  onDeleteEvent
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<FamilyEventType>('death_anniversary');
  const [memberId, setMemberId] = useState('');
  const [solarDate, setSolarDate] = useState('');
  const [lunarDate, setLunarDate] = useState('');
  const [reminderDays, setReminderDays] = useState(7);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Handle Push Notification Permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationEnabled(true);
        new Notification('Haevy Family Tree', {
          body: 'Đã kích hoạt chuông báo nhắc nhở ngày giỗ & sự kiện gia tộc thành công!',
          icon: '/favicon.ico'
        });
      }
    } else {
      setNotificationEnabled(true);
      setSimulatedAlert('Hệ thống nhắc nhở tự động trong ứng dụng đã sẵn sàng!');
    }
  };

  // Test play event chime
  const playAlertChime = (eventTitle: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528Hz Solfeggio frequency
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
    setSimulatedAlert(`🔔 Thông báo thử nghiệm: "${eventTitle}" - Chuông nhắc đã phát.`);
    setTimeout(() => setSimulatedAlert(null), 4500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !solarDate) {
      alert('Vui lòng nhập đầy đủ tiêu đề và ngày dương lịch diễn ra sự kiện');
      return;
    }
    const selectedMember = members.find(m => m.id === memberId);
    const newEvent: FamilyEvent = {
      id: `evt_${Date.now()}`,
      treeId: 'tree_nguyen_phuc_main',
      title: title.trim(),
      eventType,
      memberId: memberId || undefined,
      memberName: selectedMember?.fullName,
      solarDate,
      lunarDate: lunarDate.trim() || undefined,
      recurringYearly: true,
      reminderDaysBefore: reminderDays,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    onAddEvent(newEvent);
    // Reset
    setTitle('');
    setMemberId('');
    setSolarDate('');
    setLunarDate('');
    setLocation('');
    setDescription('');
    setShowAddForm(false);
  };

  // Compute countdown in days
  const getDaysRemaining = (solarDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(solarDateStr);
    eventDate.setFullYear(today.getFullYear()); // adjust to current year for yearly recurrence
    if (eventDate.getTime() < today.getTime()) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        if (filterType !== 'all' && e.eventType !== filterType) return false;
        return true;
      })
      .sort((a, b) => getDaysRemaining(a.solarDate) - getDaysRemaining(b.solarDate));
  }, [events, filterType]);

  const getEventBadge = (type: FamilyEventType) => {
    switch (type) {
      case 'death_anniversary':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            Ngày Giỗ Tiên Nhân
          </span>
        );
      case 'birthday':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <Cake className="w-3 h-3 text-rose-400" />
            Mừng Thọ / Sinh Nhật
          </span>
        );
      case 'clan_gathering':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-400" />
            Họp Mặt & Tế Tổ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            Sự Kiện Dòng Tộc
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Notification Reminder & Action */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-200">
              Lịch Giỗ Chạp & Sự Kiện Dòng Tộc Tự Động
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Đồng bộ lịch Âm & Dương. Tự động gửi thông báo (Push Notifications) và chuông nhắc nhở trước ngày giỗ để con cháu chuẩn bị mâm cỗ dâng tổ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-enable-push-notifications"
            onClick={requestNotificationPermission}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              notificationEnabled
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {notificationEnabled ? 'Đã bật chuông nhắc' : 'Bật Push Notification'}
          </button>

          {userRole === 'admin' && (
            <button
              id="btn-toggle-add-event"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              + Thêm Sự Kiện
            </button>
          )}
        </div>
      </div>

      {/* Simulated Alert Notification Toast */}
      {simulatedAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{simulatedAlert}</span>
        </motion.div>
      )}

      {/* Add Event Form Modal / Accordion */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-5 bg-slate-900 border border-amber-500/40 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-amber-300">Tạo Mới Sự Kiện / Ngày Giỗ Dòng Họ</h4>
            <button onClick={() => setShowAddForm(false)} className="text-xs text-slate-400 hover:text-white">✕ Hủy</button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Tên ngày lễ / Tiêu đề sự kiện *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ngày giỗ Cụ Thủy Tổ Nguyễn Phúc Đức Thọ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Loại sự kiện</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-amber-200 focus:outline-none"
                >
                  <option value="death_anniversary">🕊️ Ngày Giỗ Âm Lịch</option>
                  <option value="birthday">🎂 Mừng Thọ / Sinh Nhật</option>
                  <option value="clan_gathering">👥 Tế Tổ / Tảo Mộ / Họp Tộc</option>
                  <option value="ancestral_worship">🏮 Lễ Thượng Tiêu / Rằm</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Thành viên gắn liền (Nếu có)</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Sự kiện chung toàn tộc --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation} - {m.isDeceased ? 'Đã mất' : 'Đang sống'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ngày diễn ra (Dương lịch) *</label>
                <input
                  type="date"
                  value={solarDate}
                  onChange={(e) => setSolarDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ngày âm lịch tương ứng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 15/10 Âm lịch"
                  value={lunarDate}
                  onChange={(e) => setLunarDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nhắc nhở trước bao nhiêu ngày?</label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                >
                  <option value={1}>Trước 1 ngày</option>
                  <option value={3}>Trước 3 ngày</option>
                  <option value={7}>Trước 7 ngày (1 tuần)</option>
                  <option value={15}>Trước 15 ngày</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Địa điểm tổ chức / Nhà thờ họ</label>
                <input
                  type="text"
                  placeholder="Từ Đường Nguyễn Tộc, Thôn Đông, Hà Nam..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-400 block mb-1">Ghi chú & Phân công chuẩn bị mâm cúng</label>
                <textarea
                  rows={2}
                  placeholder="Nội dung khóa lễ, phân công chi nào chuẩn bị lễ vật..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Hủy
              </button>
              <button
                id="btn-submit-create-event"
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20"
              >
                Lưu Sự Kiện
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            filterType === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Tất cả sự kiện ({events.length})
        </button>
        <button
          onClick={() => setFilterType('death_anniversary')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            filterType === 'death_anniversary'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🕊️ Ngày Giỗ Âm Lịch
        </button>
        <button
          onClick={() => setFilterType('clan_gathering')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            filterType === 'clan_gathering'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          👥 Tế Tổ & Họp Mặt
        </button>
        <button
          onClick={() => setFilterType('birthday')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            filterType === 'birthday'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎂 Mừng Thọ & Sinh Nhật
        </button>
      </div>

      {/* Events Timeline / Cards */}
      <div className="space-y-3.5">
        {filteredEvents.map((evt) => {
          const daysLeft = getDaysRemaining(evt.solarDate);
          const isSoon = daysLeft <= evt.reminderDaysBefore;

          return (
            <motion.div
              key={evt.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isSoon
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Countdown visual box */}
                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                  isSoon 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Còn</span>
                  <span className="text-xl font-extrabold font-mono">{daysLeft}</span>
                  <span className="text-[9px] font-medium">ngày</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getEventBadge(evt.eventType)}
                    {isSoon && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                        ⚠️ Sắp diễn ra
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-amber-100">{evt.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Dương: <strong className="text-white">{evt.solarDate}</strong>
                    </span>
                    {evt.lunarDate && (
                      <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                        Âm: {evt.lunarDate}
                      </span>
                    )}
                    {evt.location && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {evt.location}
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  id={`btn-play-sound-${evt.id}`}
                  onClick={() => playAlertChime(evt.title)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Thử chuông nhắc nhở"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Thử Chuông
                </button>

                {userRole === 'admin' && onDeleteEvent && (
                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Xóa sự kiện"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
