import React, { useState } from 'react';
import { 
  Timer, 
  Moon, 
  X, 
  Clock, 
  Check, 
  VolumeX, 
  Sparkles,
  Plus,
  Play
} from 'lucide-react';

export type SleepTimerOption = 15 | 30 | 45 | 60 | 90 | -1 | null; // -1 means 'end of track', null means 'off'

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDuration: number | null; // minutes or -1 for end of track, null if off
  secondsLeft: number | null;
  onSetTimer: (minutes: number | null) => void;
  onAddMinutes?: (extraMinutes: number) => void;
  currentTrackTitle?: string;
}

export function SleepTimerModal({
  isOpen,
  onClose,
  activeDuration,
  secondsLeft,
  onSetTimer,
  onAddMinutes,
  currentTrackTitle,
}: SleepTimerModalProps) {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  if (!isOpen) return null;

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00';
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const presetOptions: { label: string; value: SleepTimerOption; desc: string; icon?: any }[] = [
    { label: '15 phút', value: 15, desc: 'Thư giãn ngắn trước khi ngủ' },
    { label: '30 phút', value: 30, desc: 'Lý tưởng cho giấc ngủ trưa / tối' },
    { label: '45 phút', value: 45, desc: 'Dành cho danh sách phát yêu thích' },
    { label: '60 phút (1 giờ)', value: 60, desc: 'Ngủ sâu cùng podcast & zen âm nhạc' },
    { label: '90 phút (1.5 giờ)', value: 90, desc: 'Thời lượng một chu kỳ giấc ngủ' },
    { label: 'Sau khi hết bài này', value: -1, desc: currentTrackTitle ? `Dừng sau: ${currentTrackTitle}` : 'Dừng khi bài hiện tại kết thúc' },
  ];

  const handleSelectPreset = (val: SleepTimerOption) => {
    onSetTimer(val);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0 && val <= 360) {
      onSetTimer(val);
      setShowCustom(false);
      setCustomInput('');
      onClose();
    }
  };

  return (
    <div 
      id="sleep-timer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="sleep-timer-modal"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <Moon size={20} className="fill-amber-400/30" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Hẹn Giờ Tắt Nhạc</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                  Sleep Timer
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Tự động dừng phát âm thanh giúp bạn ngủ ngon</p>
            </div>
          </div>
          <button
            type="button"
            id="close-sleep-timer-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Countdown Banner if timer is running */}
        {secondsLeft !== null && secondsLeft > 0 && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-indigo-950/40 border border-amber-500/40 flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-300">Đang đếm ngược dừng phát:</span>
              </div>
              <span className="text-lg font-mono font-extrabold text-amber-300 tracking-wider">
                {formatCountdown(secondsLeft)}
              </span>
            </div>

            {/* Quick Extension Buttons & Cancel */}
            <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
              {onAddMinutes && (
                <>
                  <button
                    type="button"
                    onClick={() => onAddMinutes(5)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-zinc-700"
                  >
                    <Plus size={12} />
                    <span>+5 phút</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddMinutes(15)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-zinc-700"
                  >
                    <Plus size={12} />
                    <span>+15 phút</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleSelectPreset(null)}
                className="ml-auto px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer border border-rose-500/40 flex items-center gap-1"
              >
                <VolumeX size={13} />
                <span>Hủy hẹn giờ</span>
              </button>
            </div>
          </div>
        )}

        {/* Preset Duration Options */}
        <div className="overflow-y-auto pr-1 my-2 space-y-2 relative z-10 flex-1">
          {presetOptions.map((opt) => {
            const isSelected = activeDuration === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                id={`sleep-timer-opt-${opt.value}`}
                onClick={() => handleSelectPreset(opt.value)}
                className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    isSelected 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                  }`}>
                    {opt.value === -1 ? <Play size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                          Đang bật
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{opt.desc}</p>
                  </div>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-zinc-700 group-hover:border-zinc-500 shrink-0" />
                )}
              </button>
            );
          })}

          {/* Option: Turn Off Timer */}
          {activeDuration !== null && (
            <button
              type="button"
              id="sleep-timer-opt-off"
              onClick={() => handleSelectPreset(null)}
              className="w-full p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all text-left flex items-center justify-between text-zinc-400 hover:text-rose-300 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500">
                  <VolumeX size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm">Tắt hẹn giờ (Không dừng phát)</div>
                  <p className="text-xs text-zinc-500">Tiếp tục phát danh sách nhạc liên tục</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Custom Minutes Input Section */}
        <div className="pt-3 border-t border-zinc-800/80 relative z-10">
          {!showCustom ? (
            <button
              type="button"
              id="toggle-custom-sleep-timer"
              onClick={() => setShowCustom(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Tùy chỉnh số phút khác</span>
            </button>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="360"
                  placeholder="Nhập số phút (1 - 360)..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customInput || parseInt(customInput, 10) <= 0}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
