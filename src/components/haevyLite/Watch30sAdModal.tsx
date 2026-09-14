import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  Gift, 
  Clock, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Coins
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Watch30sAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted?: (coinsEarned: number) => void;
}

export function Watch30sAdModal({
  isOpen,
  onClose,
  onAdCompleted
}: Watch30sAdModalProps) {
  const { earnHaevyLiteCoins, user } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [adStage, setAdStage] = useState<'playing' | 'rewarded'>('playing');
  const [activeAdTopic, setActiveAdTopic] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  const AD_SPONSORS = [
    {
      title: 'Haevy Sound Studio Hi-Res 2026',
      tag: 'Tài Trợ Âm Thanh Lossless',
      desc: 'Trải nghiệm không gian âm nhạc 3D Spatial Audio và kho vũ trụ tinh vân không giới hạn.',
      badge: 'QUẢNG CÁO ĐẶC QUYỀN',
      accentColor: 'from-purple-600 via-indigo-600 to-sky-600'
    },
    {
      title: 'Haevy Universe & Galaxy Theme Pack',
      tag: 'Khám Phá Vũ Trụ 3D',
      desc: 'Mở khóa Combo Vũ Trụ Kỳ Vĩ, rạng rỡ khung avatar thiên hà và kết nối bạn bè.',
      badge: 'CÔNG NGHỆ MỚI',
      accentColor: 'from-pink-600 via-purple-600 to-indigo-600'
    }
  ];

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(30);
      setIsPlaying(true);
      setIsCompleted(false);
      setAdStage('playing');
      setShowExitPrompt(false);
      setActiveAdTopic(Math.floor(Math.random() * AD_SPONSORS.length));
    }
  }, [isOpen]);

  // 30 seconds Countdown Timer (pure state update, no side effects inside updater)
  useEffect(() => {
    if (!isOpen || !isPlaying || isCompleted || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, isCompleted, secondsRemaining]);

  // Trigger reward completion cleanly when countdown hits 0
  useEffect(() => {
    if (isOpen && secondsRemaining === 0 && !isCompleted && adStage === 'playing') {
      handleFinishAd();
    }
  }, [isOpen, secondsRemaining, isCompleted, adStage]);

  const handleFinishAd = async () => {
    setIsCompleted(true);
    setAdStage('rewarded');
    const rewardAmount = 50; // 50 Xu Haevy Lite per 30s ad

    try {
      if (earnHaevyLiteCoins) {
        await earnHaevyLiteCoins(rewardAmount, 'Xem trọn vẹn 30 giây quảng cáo tài trợ');
      }
      if (onAdCompleted) {
        onAdCompleted(rewardAmount);
      }
    } catch (e) {
      console.warn('Ad reward grant notice:', e);
    }
  };

  const handleWatchAgain = () => {
    setSecondsRemaining(30);
    setIsPlaying(true);
    setIsCompleted(false);
    setShowExitPrompt(false);
    setAdStage('playing');
    setActiveAdTopic((prev) => (prev + 1) % AD_SPONSORS.length);
  };

  if (!isOpen) return null;

  const currentSponsor = AD_SPONSORS[activeAdTopic];
  const progressPercent = ((30 - secondsRemaining) / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Xem Quảng Cáo Nhận Xu Haevy Lite
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer countdown pill */}
            {!isCompleted ? (
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
                <Clock size={13} className="animate-spin" />
                <span>{secondsRemaining}s</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Đã Hoàn Thành</span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => {
                if (!isCompleted && secondsRemaining > 3) {
                  setShowExitPrompt(true);
                } else {
                  onClose();
                }
              }}
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              title="Đóng quảng cáo"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Exit Confirmation Banner */}
        {showExitPrompt && !isCompleted && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle size={15} className="shrink-0 text-amber-400" />
              <span>Nếu thoát bây giờ bạn sẽ bỏ lỡ <strong>+50 Xu Lite</strong>!</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExitPrompt(false)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Xem tiếp
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Rời đi
              </button>
            </div>
          </div>
        )}

        {/* Video / Ad Canvas Stage */}
        <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden flex items-center justify-center">
          {/* Animated Background Gradients & Pulses */}
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentSponsor.accentColor} opacity-30 animate-pulse`} />
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-ping" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl" />

          {/* Ad Content Display */}
          {adStage === 'playing' ? (
            <div className="relative z-10 text-center px-6 space-y-3">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/10 text-white/90 border border-white/20 inline-block backdrop-blur-md">
                {currentSponsor.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md">
                {currentSponsor.title}
              </h3>
              <p className="text-xs text-zinc-200/80 max-w-sm mx-auto leading-relaxed">
                {currentSponsor.desc}
              </p>

              {/* Animated Sound Waveform Simulation */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {[40, 70, 90, 60, 100, 75, 45, 85, 65, 95, 50].map((h, i) => (
                  <span 
                    key={i} 
                    className="w-1.5 bg-gradient-to-t from-purple-400 to-sky-300 rounded-full transition-all duration-300"
                    style={{ 
                      height: `${isPlaying ? (h * 0.35) : 8}px`,
                      animation: isPlaying ? `bounce 1s infinite ${i * 0.1}s` : 'none'
                    }} 
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Rewarded Celebration View */
            <div className="relative z-10 text-center px-6 space-y-3 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-2xl shadow-amber-500/50 animate-bounce">
                <Coins size={36} className="text-amber-950" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow">
                  +50 Xu Haevy Lite
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  Đã cộng thành công vào tài khoản của bạn!
                </p>
              </div>
            </div>
          )}

          {/* Ad Controls (Play/Pause & Mute) */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title={isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title={isMuted ? 'Bật âm' : 'Tắt âm'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            <div className="text-[11px] font-mono font-bold text-zinc-300 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
              00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining} / 00:30
            </div>
          </div>

          {/* Real-time Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions & Policy Notice */}
        <div className="p-5 space-y-3 bg-zinc-950">
          {adStage === 'playing' ? (
            <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-amber-400 shrink-0" />
                <span>Xem hết 30 giây quảng cáo để nhận <strong>+50 Xu Haevy Lite</strong></span>
              </div>
              <span className="font-bold text-amber-400">Thưởng +50 Xu</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleWatchAgain}
                className="flex-1 py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Play size={16} />
                <span>Xem Thêm Lượt Nữa (+50 Xu)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Đổi Combo Chủ Đề Ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
