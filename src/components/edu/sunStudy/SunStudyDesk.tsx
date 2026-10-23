import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Coffee, 
  Flame, 
  BookOpen, 
  Smile, 
  Edit3, 
  Save, 
  Plus, 
  Trash2,
  Music,
  Headphones,
  Sun,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SunStudyState, SunShopItem } from '../../../services/sunStudyStorageService';
import { EduMusicPlayer } from '../EduMusicPlayer';

interface SunStudyDeskProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
  onOpenShop: () => void;
  onOpenTasks: () => void;
  onRecordStudyTime: (minutes: number) => void;
}

export function SunStudyDesk({
  state,
  onUpdateState,
  onOpenShop,
  onOpenTasks,
  onRecordStudyTime
}: SunStudyDeskProps) {
  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán Học');
  const [deskNote, setDeskNote] = useState<string>('Mục tiêu hôm nay: Chinh phục 3 đề nâng cao, không xao nhãng mạng xã hội!');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);

  // Soundscape (Ambient White Noise / Lofi)
  const [selectedSound, setSelectedSound] = useState<'none' | 'lofi' | 'rain' | 'cafe' | 'clock'>('lofi');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [petMessage, setPetMessage] = useState<string>('Cố lên bạn ơi, mình luôn ngồi đây canh chừng bạn học bài nè! 🐾');

  // Interactive Pet animations
  const [petBounce, setPetBounce] = useState<boolean>(false);

  const activeThemeItem = state.shopItems.find(i => i.id === state.deskTheme && i.category === 'desk_theme');
  const activePetItem = state.shopItems.find(i => i.id === state.activePet && i.category === 'desk_pet');

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    // Record study time
    if (timerMode === 'pomodoro') {
      const minutesCompleted = 25;
      onRecordStudyTime(minutesCompleted);
      onUpdateState(prev => ({
        ...prev,
        sunCoins: prev.sunCoins + 15,
        sunXp: prev.sunXp + 50,
        todayStudyMinutes: prev.todayStudyMinutes + 25,
        weeklyStudyMinutes: {
          ...prev.weeklyStudyMinutes,
          'Hôm nay': (prev.weeklyStudyMinutes['Hôm nay'] || 0) + 25
        }
      }));
      setPetMessage('Tuyệt vời lắm! Bạn vừa hoàn thành 1 ca Pomodoro 25 phút trọn vẹn (+15 Hạt Nắng ☀️)! Nghỉ giải lao một chút nhé! 🎉');
      triggerPetReaction();
    } else {
      setPetMessage('Hết giờ giải lao rồi, chúng ta quay lại bàn học tiếp tục chiến đấu thôi nào! 🚀');
    }
  };

  const handleSwitchMode = (mode: 'pomodoro' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'short_break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setPetMessage(`Bắt đầu tập trung cao độ môn ${selectedSubject}! Không bấm điện thoại nhé! ⏱️`);
    } else {
      setPetMessage('Tạm dừng một lát, uống chút nước rồi tiếp tục nhé! 💧');
    }
    triggerPetReaction();
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') setTimeLeft(25 * 60);
    else if (timerMode === 'short_break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const triggerPetReaction = () => {
    setPetBounce(true);
    setTimeout(() => setPetBounce(false), 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = timerMode === 'pomodoro'
    ? Math.round(((25 * 60 - timeLeft) / (25 * 60)) * 100)
    : timerMode === 'short_break'
    ? Math.round(((5 * 60 - timeLeft) / (5 * 60)) * 100)
    : Math.round(((15 * 60 - timeLeft) / (15 * 60)) * 100);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Top Desk Header & Mood */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/20">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Bàn Học Cá Nhân Sun Study</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {isRunning ? '🟢 Đang Tập Trung' : '🟡 Sẵn Sàng'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Không gian tự học kỷ luật, triệt tiêu xao nhãng cùng đồng hồ Pomodoro & thú cưng đồng hành.
            </p>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenShop}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <span>🎨 Trang Trí Bàn</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {state.sunCoins} ☀️
            </span>
          </button>

          <button
            onClick={onOpenTasks}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
          >
            <CheckCircle2 size={13} />
            <span>Mở To-do List</span>
          </button>
        </div>
      </div>

      {/* Main Virtual Desk Graphic Viewport */}
      <div className={`w-full rounded-3xl p-5 sm:p-8 border shadow-2xl relative overflow-hidden transition-all duration-300 ${
        activeThemeItem ? activeThemeItem.preview : 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-900/50'
      }`}>
        {/* Ambient Room Glow Light Effect */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 blur-3xl pointer-events-none transition-all duration-700 ${
          isRunning ? 'bg-amber-400/20' : 'bg-blue-500/10'
        }`} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Pomodoro Big Timer */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-950/80 rounded-3xl border border-zinc-800/80 backdrop-blur-xl shadow-2xl text-center">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6">
              <button
                onClick={() => handleSwitchMode('pomodoro')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timerMode === 'pomodoro'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍅 Pomodoro (25p)
              </button>
              <button
                onClick={() => handleSwitchMode('short_break')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timerMode === 'short_break'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ☕ Nghỉ Ngắn (5p)
              </button>
              <button
                onClick={() => handleSwitchMode('long_break')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  timerMode === 'long_break'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-zinc-950 shadow-md shadow-blue-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🌴 Nghỉ Dài (15p)
              </button>
            </div>

            {/* Circular Progress & Huge Digital Display */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-zinc-900 flex flex-col items-center justify-center relative shadow-inner">
                {/* Visual Ring Indicator */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-zinc-900"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * progressPercent) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ${
                      timerMode === 'pomodoro' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                </svg>

                {/* Subject Selector Pill */}
                <span className="text-xs font-bold text-zinc-400 mb-1 z-10 flex items-center gap-1">
                  <span>Môn:</span>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-zinc-900 text-amber-300 font-bold border border-zinc-700 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
                  >
                    <option value="Toán Học">Toán Học 📐</option>
                    <option value="Vật Lý">Vật Lý ⚛️</option>
                    <option value="Hóa Học">Hóa Học 🧪</option>
                    <option value="Sinh Học">Sinh Học 🧬</option>
                    <option value="Ngữ Văn">Ngữ Văn 📖</option>
                    <option value="Tiếng Anh">Tiếng Anh 🇬🇧</option>
                    <option value="Lịch Sử">Lịch Sử 🏛️</option>
                    <option value="Địa Lý">Địa Lý 🌍</option>
                    <option value="ĐGNL / ĐGTD">ĐGNL / ĐGTD ⚡</option>
                  </select>
                </span>

                {/* Big Time Readout */}
                <span className="font-mono text-5xl sm:text-6xl font-black text-white tracking-wider z-10 drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>

                <span className="text-[11px] font-semibold text-zinc-400 mt-2 z-10 flex items-center gap-1">
                  {isRunning ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      <Flame size={12} /> Đang tập trung sâu...
                    </span>
                  ) : (
                    <span>Tạm dừng • Bấm bắt đầu</span>
                  )}
                </span>
              </div>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleToggleTimer}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                  isRunning
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/40 shadow-amber-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-amber-500/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause size={18} />
                    <span>TẠM DỪNG</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>BẮT ĐẦU HỌC</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer active:scale-95"
                title="Khởi động lại đồng hồ"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Desk Companion (Pet & Sticky Note & Soundscape) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Cute Interactive Desk Pet */}
            <div 
              onClick={triggerPetReaction}
              className={`p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl shadow-xl flex items-center gap-4 cursor-pointer transition-all hover:border-amber-500/40 group ${
                petBounce ? 'scale-105 transition-transform' : ''
              }`}
              title="Bấm vào thú cưng để tương tác và nhận lời cổ vũ!"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                {activePetItem ? activePetItem.icon : '🐱'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300">
                    {activePetItem ? activePetItem.name : 'Bé Mèo Cam Đồng Hành 🐱'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Bấm để xoa đầu ✨</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  "{petMessage}"
                </p>
              </div>
            </div>

            {/* Sticky Note: Target of the session */}
            <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/30 shadow-lg relative flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Edit3 size={13} />
                  <span>Giấy Ghi Chú Dán Bàn Học (Sticky Note)</span>
                </span>
                <button
                  onClick={() => setIsEditingNote(!isEditingNote)}
                  className="text-xs text-zinc-400 hover:text-amber-300 transition"
                >
                  {isEditingNote ? 'Xong' : 'Sửa'}
                </button>
              </div>

              {isEditingNote ? (
                <textarea
                  value={deskNote}
                  onChange={(e) => setDeskNote(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 text-xs text-zinc-200 border border-amber-500/40 rounded-xl p-2.5 outline-none focus:border-amber-400 resize-none font-sans"
                  placeholder="Ghi chú mục tiêu bài học hoặc câu nhắc nhở bản thân..."
                />
              ) : (
                <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-2xl border border-amber-500/20 whitespace-pre-line font-medium">
                  {deskNote}
                </div>
              )}
            </div>

            {/* Ambient Sound / Focus Music Controller with File Upload */}
            <div className="flex flex-col gap-1.5">
              <EduMusicPlayer compact={true} className="border-amber-500/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Desk Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold">Đã học hôm nay</div>
            <div className="text-base font-black text-white font-mono">{state.todayStudyMinutes} phút</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
            🎯
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold">KPI mục tiêu ngày</div>
            <div className="text-base font-black text-white font-mono">{state.dailyGoalMinutes} phút</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg">
            🔥
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold">Chuỗi ngày kỷ luật</div>
            <div className="text-base font-black text-white font-mono">{state.currentStreakDays} ngày liên tiếp</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-lg">
            ☀️
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-semibold">Hạt Nắng tích lũy</div>
            <div className="text-base font-black text-amber-300 font-mono">{state.sunCoins} Coins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
