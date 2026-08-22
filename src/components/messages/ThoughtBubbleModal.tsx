import React, { useState } from 'react';
import { X, Sparkles, Trash2, Smile, Check, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { setThoughtBubble, deleteThoughtBubble } from '../../services/socialService';
import { ThoughtBubble } from '../../types';

interface ThoughtBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBubble: ThoughtBubble | null;
  onSaved?: () => void;
}

const EMOJI_PRESETS = ['💭', '✨', '🎧', '☕', '🔥', '🌸', '🚀', '😴', '💡', '🎵', '❤️', '🌟'];
const BG_PRESETS = [
  { name: 'Mặc định', bg: '#18181b', border: '#27272a' },
  { name: 'Hoàng Hôn', bg: '#451a03', border: '#9a3412' },
  { name: 'Bầu Trời', bg: '#082f49', border: '#0284c7' },
  { name: 'Tím Khói', bg: '#3b0764', border: '#9333ea' },
  { name: 'Rừng Xanh', bg: '#022c22', border: '#059669' },
  { name: 'Hoa Hồng', bg: '#4c0519', border: '#e11d48' },
];

const DURATION_OPTIONS = [
  { label: '3 Giờ', hours: 3 },
  { label: '6 Giờ', hours: 6 },
  { label: '12 Giờ', hours: 12 },
  { label: '24 Giờ', hours: 24 }
];

export function ThoughtBubbleModal({
  isOpen,
  onClose,
  currentBubble,
  onSaved
}: ThoughtBubbleModalProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();
  const [text, setText] = useState(currentBubble?.text || '');
  const [selectedEmoji, setSelectedEmoji] = useState(currentBubble?.emoji || '💭');
  const [selectedBg, setSelectedBg] = useState(currentBubble?.bgColor || '#18181b');
  const [selectedDuration, setSelectedDuration] = useState<number>(currentBubble?.durationHours || 24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!text.trim()) {
      setErrorMsg('Vui lòng nhập nội dung suy nghĩ.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await setThoughtBubble({
      user: {
        uid: user.uid,
        displayName: user.displayName,
        accountId: accountId,
        photoURL: user.photoURL,
        isVip,
        isAuthorVerified,
        stageName: authorStageName
      },
      text: text.trim(),
      emoji: selectedEmoji,
      bgColor: selectedBg,
      durationHours: selectedDuration
    });

    setIsSubmitting(false);
    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    } else {
      setErrorMsg(res.message || 'Lỗi khi lưu bong bóng suy nghĩ.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const res = await deleteThoughtBubble(user.uid);
    setIsSubmitting(false);
    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bong Bóng Suy Nghĩ</h3>
              <p className="text-xs text-zinc-400">Chỉ hiển thị với bạn bè & tự động xóa theo thời gian</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Preview of Thought Bubble over Avatar */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center relative">
          {/* Floating Bubble */}
          <div 
            style={{ backgroundColor: selectedBg }}
            className="px-3.5 py-2 rounded-2xl border border-zinc-700/80 shadow-xl max-w-[260px] text-center mb-2 relative animate-bounce duration-1000"
          >
            <span className="mr-1">{selectedEmoji}</span>
            <span className="text-xs font-semibold text-white break-words">
              {text.trim() || 'Bạn đang nghĩ gì thế?'}
            </span>
            {/* Bubble Tail */}
            <div 
              style={{ borderTopColor: selectedBg }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
            />
          </div>

          {/* User Avatar */}
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-amber-400/80 shadow-md">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Input Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">Nội dung suy nghĩ (tối đa 120 ký tự):</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 120))}
            placeholder="Ví dụ: Đang chill cùng bài hát mới... / Hôm nay tâm trạng rất tuyệt! 🌟"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
          />
          <div className="text-right text-[11px] text-zinc-500 font-mono">
            {text.length}/120
          </div>
        </div>

        {/* Duration Selector (3h, 6h, 12h, 24h) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-400" />
              <span>Tự động biến mất sau:</span>
            </label>
            <span className="text-[11px] text-amber-400/90 font-medium">Chỉ bạn bè nhìn thấy</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                type="button"
                onClick={() => setSelectedDuration(opt.hours)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 ${
                  selectedDuration === opt.hours
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20 font-black'
                    : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">Chọn biểu tượng tâm trạng:</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                  selectedEmoji === emoji 
                    ? 'bg-amber-400/30 border border-amber-400 scale-110' 
                    : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">Tông màu bong bóng:</label>
          <div className="flex items-center gap-2 flex-wrap">
            {BG_PRESETS.map((preset) => (
              <button
                key={preset.bg}
                type="button"
                onClick={() => setSelectedBg(preset.bg)}
                style={{ backgroundColor: preset.bg, borderColor: preset.border }}
                className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                  selectedBg === preset.bg ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : ''
                }`}
                title={preset.name}
              >
                {selectedBg === preset.bg && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
            {errorMsg}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {currentBubble ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Xóa bóng</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !text.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black hover:brightness-110 disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Suy Nghĩ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
