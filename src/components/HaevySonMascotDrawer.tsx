import React from 'react';
import {
  Sparkles,
  X,
  Heart,
  Hand,
  Crown,
  Smile
} from 'lucide-react';
import {
  HAEVY_SON_VARIANTS,
  HAEVY_SON_HAND_MODES,
  type HaevySonVariant,
  type HaevySonHandMode,
  type HaevySonAccessory,
  type HaevySonMood
} from './HaevyAnimeMetaverseModal';

interface HaevySonMascotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showHaevySon: boolean;
  onToggleShowHaevySon: (val: boolean) => void;
  currentVariant: HaevySonVariant;
  onSelectVariant: (v: HaevySonVariant) => void;
  currentHandMode: HaevySonHandMode;
  onSelectHandMode: (m: HaevySonHandMode) => void;
  currentAccessory: HaevySonAccessory;
  onSelectAccessory: (a: HaevySonAccessory) => void;
  scale: number;
  onChangeScale: (s: number) => void;
  mood: HaevySonMood;
  affection: number;
  onFeedStarCandy: () => void;
  onTriggerFlip: () => void;
  onTriggerBeam: () => void;
  onPetMascot: () => void;
}

const ACCESSORIES_LIST: Array<{ id: HaevySonAccessory; name: string; icon: string }> = [
  { id: 'none', name: 'Không phụ kiện', icon: '❌' },
  { id: 'crown', name: 'Vương miện hoàng gia', icon: '👑' },
  { id: 'ar_visor', name: 'Kính thực tế ảo AR', icon: '🥽' },
  { id: 'angel_wings', name: 'Cánh thiên thần sáng rực', icon: '🪽' },
  { id: 'magic_wand', name: 'Đũa phép ngọc bích', icon: '🪄' },
  { id: 'bell_collar', name: 'Vòng chuông vàng may mắn', icon: '🔔' }
];

export const HaevySonMascotDrawer: React.FC<HaevySonMascotDrawerProps> = ({
  isOpen,
  onClose,
  showHaevySon,
  onToggleShowHaevySon,
  currentVariant,
  onSelectVariant,
  currentHandMode,
  onSelectHandMode,
  currentAccessory,
  onSelectAccessory,
  scale,
  onChangeScale,
  mood,
  affection,
  onFeedStarCandy,
  onTriggerFlip,
  onTriggerBeam,
  onPetMascot
}) => {
  if (!isOpen) return null;

  const activeVariantInfo = HAEVY_SON_VARIANTS.find(v => v.id === currentVariant) || HAEVY_SON_VARIANTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-zinc-950/95 border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-fuchsia-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/25 border border-sky-300/40">
              {activeVariantInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>Linh Vật Haevy Son</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {activeVariantInfo.title}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-sky-200/80">Điều khiển & tương tác cử chỉ bàn tay thực tế ảo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Mascot Visibility */}
            <button
              onClick={() => onToggleShowHaevySon(!showHaevySon)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showHaevySon
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              <span>{showHaevySon ? '🟢 Đang hiện' : '⚪ Đã ẩn'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mascot Status & Mood Banner */}
        <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Tâm trạng:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
              <Smile size={12} />
              {mood === 'happy' && 'Vui tươi nhảy múa 😊'}
              {mood === 'excited' && 'Phấn khích nhào lộn 🥳'}
              {mood === 'curious' && 'Tò mò quan sát 🧐'}
              {mood === 'sleepy' && 'Mơ màng nghỉ ngơi 😴'}
              {mood === 'loving' && 'Cưng nựng ấm áp 💖'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 flex items-center gap-1">
              <Heart size={12} className="text-rose-400 fill-rose-400" />
              Độ Thân Thiết:
            </span>
            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, affection)}%` }}
              />
            </div>
            <span className="font-mono text-amber-300 font-bold">{affection}%</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-xs custom-scrollbar">
          
          {/* Quick Pet & Interactive Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-300 font-extrabold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles size={14} />
                Hành Động Tương Tác Nhanh
              </span>
              <span className="text-[10px] text-zinc-500">Chạm để thử</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={onPetMascot}
                className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <span className="text-xl">💖</span>
                <span>Xoa Đầu</span>
                <span className="text-[9px] text-rose-400/80 font-mono">+3 Thân thiết</span>
              </button>

              <button
                onClick={onFeedStarCandy}
                className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <span className="text-xl">🍬</span>
                <span>Cho Ăn Kẹo</span>
                <span className="text-[9px] text-amber-400/80 font-mono">+5 Thân thiết</span>
              </button>

              <button
                onClick={onTriggerFlip}
                className="p-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <span className="text-xl">🤸</span>
                <span>Nhào Lộn 360°</span>
                <span className="text-[9px] text-sky-400/80 font-mono">+2 Thân thiết</span>
              </button>

              <button
                onClick={onTriggerBeam}
                className="p-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <span className="text-xl">✨</span>
                <span>Tỏa Sáng</span>
                <span className="text-[9px] text-purple-400/80 font-mono">Bụi Sao</span>
              </button>
            </div>
          </div>

          {/* 1. CHỌN NGOẠI HÌNH LINH VẬT (6 VARIANTS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-zinc-300 font-extrabold">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span>🐲</span>
                Ngoại Hình & Bản Thể Linh Vật (6 Biến Thể)
              </span>
              <span className="text-[10px] text-zinc-500">Chạm để chọn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HAEVY_SON_VARIANTS.map(v => {
                const isSelected = currentVariant === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectVariant(v.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 ring-1 ring-sky-400/50 shadow-lg shadow-sky-950/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                      style={{
                        backgroundColor: `${v.color}22`,
                        borderColor: isSelected ? v.color : 'transparent'
                      }}
                    >
                      {v.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-extrabold text-xs ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                          {v.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {v.title}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-1 italic line-clamp-2">{v.lore}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHẾ ĐỘ ĐIỀU KHIỂN BẰNG BÀN TAY (4 MODES) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-zinc-300 font-extrabold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Hand size={14} />
                Chế Độ Bàn Tay Điều Khiển (4 Kiểu)
              </span>
              <span className="text-[10px] text-zinc-500">Thời gian thực qua camera</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HAEVY_SON_HAND_MODES.map(m => {
                const isSelected = currentHandMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectHandMode(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-400 ring-1 ring-emerald-400/50'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <span className={`font-extrabold text-xs block ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                        {m.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block leading-tight">
                        {m.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. PHỤ KIỆN LINH VẬT & KÍCH THƯỚC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phụ kiện */}
            <div className="space-y-2">
              <span className="text-zinc-300 font-extrabold flex items-center gap-1.5 text-purple-400">
                <Crown size={14} />
                Phụ Kiện Trang Trí
              </span>
              <div className="space-y-1.5">
                {ACCESSORIES_LIST.map(acc => {
                  const isSelected = currentAccessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => onSelectAccessory(acc.id)}
                      className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-purple-950/50 border-purple-400 text-purple-300 font-bold'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{acc.icon}</span>
                        <span>{acc.name}</span>
                      </span>
                      {isSelected && <span className="text-[10px] text-purple-400">✓ Đang dùng</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kích thước & Hướng dẫn cử chỉ */}
            <div className="space-y-4">
              <div className="space-y-2 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div className="flex justify-between text-zinc-300 text-xs">
                  <span className="font-bold">Kích Thước Haevy Son:</span>
                  <span className="font-mono text-sky-300 font-bold">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={scale}
                  onChange={(e) => onChangeScale(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Chibi Nhỏ (60%)</span>
                  <span>Chuẩn (100%)</span>
                  <span>Khổng Lồ (180%)</span>
                </div>
              </div>

              <div className="p-3 bg-sky-950/40 rounded-2xl border border-sky-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs">
                  <Hand size={13} />
                  <span>Cách Điều Khiển Qua Camera:</span>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                  <li><strong>🤲 Đưa Bàn Tay:</strong> Linh vật bay đến đậu nhẹ nhàng vào lòng bàn tay</li>
                  <li><strong>👆 Di Chuyển Ngón Tay:</strong> Linh vật bay lượn bảo vệ xung quanh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            ✨ Haevy Son luôn bay theo bàn tay và nét vẽ của bạn!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition-all"
          >
            Đóng & Trải Nghiệm
          </button>
        </div>

      </div>
    </div>
  );
};
