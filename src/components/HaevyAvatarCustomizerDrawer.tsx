import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Palette, 
  Crown, 
  Check, 
  Wand2, 
  Flame, 
  Zap, 
  Dices, 
  Shield, 
  Layers, 
  RotateCcw,
  Feather,
  Swords,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { morningAudio } from '../services/morningAudioService';

export interface AvatarArchetypeOption {
  id: 'astral_mage' | 'cyber_samurai' | 'spirit_warden' | 'celestial_archon' | 'cosmic_mecha';
  name: string;
  sub: string;
  icon: string;
  badge: string;
  lore: string;
  defaultPalette: string;
  defaultWings: 'angel' | 'cyber' | 'butterfly' | 'dual_angel' | 'none';
  defaultWeapon: 'staff' | 'plasma_sword' | 'mana_orb' | 'none';
  defaultHeadgear: 'crown' | 'visor' | 'spirit_horns' | 'hood' | 'none';
}

export interface AvatarPaletteOption {
  id: string;
  name: string;
  sub: string;
  primary: string;    // Main glow / aura color
  secondary: string;  // Armor / Trim accent
  tertiary: string;   // Highlighting
  hairColor: string;
  bodyColor: string;
  wingColor: string;
  glowColor: string;
  bgGrad: string;
}

export const AVATAR_ARCHETYPES: AvatarArchetypeOption[] = [
  {
    id: 'astral_mage',
    name: 'Pháp Sư Tinh Vân',
    sub: 'Áo choàng ma pháp & trượng năng lượng chòm sao',
    icon: '🧙‍♂️',
    badge: 'Ma Thuật Không Gian',
    lore: 'Ngưng tụ năng lượng tinh cầu thành dòng chảy phép thuật, sở hữu trượng mana xoay và hào quang vĩnh cửu.',
    defaultPalette: 'astral_cyan',
    defaultWings: 'angel',
    defaultWeapon: 'staff',
    defaultHeadgear: 'hood'
  },
  {
    id: 'cyber_samurai',
    name: 'Kiếm Sĩ Cyber Neon',
    sub: 'Giáp titan giác cạnh & katana plasma tương lai',
    icon: '⚔️',
    badge: 'Neo-Tokyo 2099',
    lore: 'Trang bị giáp phản lực cao tần và kiếm plasma cắt xuyên không gian số, tích hợp kính visor phát quang.',
    defaultPalette: 'sakura_rose',
    defaultWings: 'cyber',
    defaultWeapon: 'plasma_sword',
    defaultHeadgear: 'visor'
  },
  {
    id: 'spirit_warden',
    name: 'Hộ Vệ Tinh Linh Thảo Mộc',
    sub: 'Thảo y ngọc bích & sừng linh thú tự nhiên',
    icon: '🍃',
    badge: 'Ghibli Spirit',
    lore: 'Người bảo hộ rừng đại ngàn, kết nối tâm linh với muôn loài và triệu hồi cánh bướm hào quang dịu mát.',
    defaultPalette: 'emerald_spirit',
    defaultWings: 'butterfly',
    defaultWeapon: 'mana_orb',
    defaultHeadgear: 'spirit_horns'
  },
  {
    id: 'celestial_archon',
    name: 'Thiên Vương Hoàng Gia',
    sub: 'Giáp thái dương mạ vàng & 4 cánh ánh sáng chói lọi',
    icon: '👑',
    badge: 'Thần Thánh Hoàng Gia',
    lore: 'Thực thể quyền năng mang hào quang mặt trời, đội vương miện sao chổi cùng 4 cánh thiên thần rực rỡ.',
    defaultPalette: 'solar_gold',
    defaultWings: 'dual_angel',
    defaultWeapon: 'staff',
    defaultHeadgear: 'crown'
  },
  {
    id: 'cosmic_mecha',
    name: 'Thám Hiểm Lượng Tử',
    sub: 'Bộ exo-suit phi hành gia & lõi lò phản ứng lượng tử',
    icon: '🤖',
    badge: 'Quantum Mecha',
    lore: 'Chiến giáp thăm dò đa vũ trụ với vòm bảo hộ lượng tử và đĩa gia tốc trọng lực sau lưng.',
    defaultPalette: 'silver_frost',
    defaultWings: 'cyber',
    defaultWeapon: 'plasma_sword',
    defaultHeadgear: 'visor'
  }
];

export const AVATAR_PALETTES: AvatarPaletteOption[] = [
  {
    id: 'astral_cyan',
    name: 'Lam Thiên & Indigo',
    sub: 'Xanh thiên hà & tinh vân huyền bí',
    primary: '#38bdf8',
    secondary: '#6366f1',
    tertiary: '#93c5fd',
    hairColor: '#38bdf8',
    bodyColor: '#1e1b4b',
    wingColor: '#60a5fa',
    glowColor: '#38bdf8',
    bgGrad: 'from-sky-500 via-indigo-500 to-indigo-900'
  },
  {
    id: 'sakura_rose',
    name: 'Anh Đào & Cyber Rose',
    sub: 'Hồng neon lấp lánh & cánh hoa bay',
    primary: '#f43f5e',
    secondary: '#ec4899',
    tertiary: '#fda4af',
    hairColor: '#fb7185',
    bodyColor: '#881337',
    wingColor: '#fda4af',
    glowColor: '#f43f5e',
    bgGrad: 'from-rose-500 via-pink-600 to-purple-900'
  },
  {
    id: 'solar_gold',
    name: 'Kim Hoàng Thái Dương',
    sub: 'Vàng rực rỡ hoàng tộc & hổ phách',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    tertiary: '#fde047',
    hairColor: '#fde047',
    bodyColor: '#78350f',
    wingColor: '#fef08a',
    glowColor: '#fbbf24',
    bgGrad: 'from-amber-400 via-yellow-500 to-orange-700'
  },
  {
    id: 'emerald_spirit',
    name: 'Lục Bảo & Đại Ngàn',
    sub: 'Ngọc bích nguyên sinh & mầm sống',
    primary: '#10b981',
    secondary: '#059669',
    tertiary: '#6ee7b7',
    hairColor: '#34d399',
    bodyColor: '#064e3b',
    wingColor: '#6ee7b7',
    glowColor: '#10b981',
    bgGrad: 'from-emerald-400 via-teal-600 to-emerald-950'
  },
  {
    id: 'arcane_void',
    name: 'Tím Huyền Bí Cổ Đại',
    sub: 'Mana hư không & ma thuật bóng đêm',
    primary: '#a855f7',
    secondary: '#7c3aed',
    tertiary: '#d8b4fe',
    hairColor: '#c084fc',
    bodyColor: '#3b0764',
    wingColor: '#d8b4fe',
    glowColor: '#a855f7',
    bgGrad: 'from-purple-500 via-fuchsia-600 to-slate-950'
  },
  {
    id: 'silver_frost',
    name: 'Bạch Kim Băng Tuyết',
    sub: 'Bạc tinh khôi & hàn băng vĩnh cửu',
    primary: '#e0f2fe',
    secondary: '#94a3b8',
    tertiary: '#f8fafc',
    hairColor: '#f8fafc',
    bodyColor: '#1e293b',
    wingColor: '#bae6fd',
    glowColor: '#93c5fd',
    bgGrad: 'from-slate-200 via-sky-400 to-slate-900'
  },
  {
    id: 'phoenix_flame',
    name: 'Hỏa Diệm Phượng Hoàng',
    sub: 'Nham thạch rực lửa & nhiệt huyết',
    primary: '#ff4500',
    secondary: '#ef4444',
    tertiary: '#f97316',
    hairColor: '#f97316',
    bodyColor: '#450a0a',
    wingColor: '#fdba74',
    glowColor: '#ef4444',
    bgGrad: 'from-red-500 via-orange-600 to-red-950'
  }
];

interface HaevyAvatarCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentArchetype: 'astral_mage' | 'cyber_samurai' | 'spirit_warden' | 'celestial_archon' | 'cosmic_mecha';
  onSelectArchetype: (archetype: 'astral_mage' | 'cyber_samurai' | 'spirit_warden' | 'celestial_archon' | 'cosmic_mecha') => void;
  currentPaletteId: string;
  onSelectPaletteId: (paletteId: string) => void;
  wingsStyle: 'angel' | 'cyber' | 'butterfly' | 'dual_angel' | 'none';
  onSelectWingsStyle: (wings: 'angel' | 'cyber' | 'butterfly' | 'dual_angel' | 'none') => void;
  weaponStyle: 'staff' | 'plasma_sword' | 'mana_orb' | 'none';
  onSelectWeaponStyle: (weapon: 'staff' | 'plasma_sword' | 'mana_orb' | 'none') => void;
  headgearStyle: 'crown' | 'visor' | 'spirit_horns' | 'hood' | 'none';
  onSelectHeadgearStyle: (headgear: 'crown' | 'visor' | 'spirit_horns' | 'hood' | 'none') => void;
  companionStyle: 'fox' | 'dragon' | 'wisp' | 'none';
  onSelectCompanionStyle: (companion: 'fox' | 'dragon' | 'wisp' | 'none') => void;
  customAuraColor: string;
  onChangeCustomAuraColor: (color: string) => void;
}

export function HaevyAvatarCustomizerDrawer({
  isOpen,
  onClose,
  currentArchetype,
  onSelectArchetype,
  currentPaletteId,
  onSelectPaletteId,
  wingsStyle,
  onSelectWingsStyle,
  weaponStyle,
  onSelectWeaponStyle,
  headgearStyle,
  onSelectHeadgearStyle,
  companionStyle,
  onSelectCompanionStyle,
  customAuraColor,
  onChangeCustomAuraColor
}: HaevyAvatarCustomizerDrawerProps) {
  const [activeTab, setActiveTab] = useState<'styles' | 'palettes' | 'accessories'>('styles');

  if (!isOpen) return null;

  const currentArchObj = AVATAR_ARCHETYPES.find(a => a.id === currentArchetype) || AVATAR_ARCHETYPES[0];
  const currentPalObj = AVATAR_PALETTES.find(p => p.id === currentPaletteId) || AVATAR_PALETTES[0];

  const handleRandomize = () => {
    const randomArch = AVATAR_ARCHETYPES[Math.floor(Math.random() * AVATAR_ARCHETYPES.length)];
    const randomPal = AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];
    
    onSelectArchetype(randomArch.id);
    onSelectPaletteId(randomPal.id);
    onSelectWingsStyle(randomArch.defaultWings);
    onSelectWeaponStyle(randomArch.defaultWeapon);
    onSelectHeadgearStyle(randomArch.defaultHeadgear);
    
    morningAudio.triggerStarPop();
  };

  const handleResetDefaults = () => {
    onSelectArchetype('astral_mage');
    onSelectPaletteId('astral_cyan');
    onSelectWingsStyle('angel');
    onSelectWeaponStyle('staff');
    onSelectHeadgearStyle('hood');
    onSelectCompanionStyle('fox');
    morningAudio.triggerThumbsUpChime();
  };

  return (
    <div className="absolute right-3 sm:right-6 top-16 sm:top-20 bottom-20 sm:bottom-24 z-40 w-[92vw] sm:w-[420px] max-w-[440px] bg-zinc-950/95 backdrop-blur-3xl border border-sky-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-6 duration-300">
      
      {/* HEADER */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 p-[1px] shadow-lg shadow-sky-500/25">
            <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center text-sm">
              ✨
            </div>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>Tùy Chỉnh Bản Thể 3D</span>
              <span className="text-[9px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 px-1.5 py-0.5 rounded-full uppercase">
                AR Studio
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Chọn phong cách nhân vật & bảng màu tương tác</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRandomize}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
            title="Ngẫu nhiên phong cách"
          >
            <Dices size={13} />
            <span className="text-[10px] hidden sm:inline">Ngẫu nhiên</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-xs transition-all"
            title="Đóng bảng tùy chỉnh"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1 p-2 bg-zinc-900/70 border-b border-zinc-800/80 shrink-0">
        <button
          onClick={() => {
            setActiveTab('styles');
            morningAudio.triggerEmojiPop(1.1);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'styles'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 border border-sky-300/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Crown size={13} />
          <span>Phong Cách 3D</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('palettes');
            morningAudio.triggerEmojiPop(1.2);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'palettes'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 border border-sky-300/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Palette size={13} />
          <span>Bảng Phối Màu</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('accessories');
            morningAudio.triggerEmojiPop(1.3);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'accessories'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 border border-sky-300/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wand2 size={13} />
          <span>Pháp Khí & Cánh</span>
        </button>
      </div>

      {/* SCROLLABLE CONTENT BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 custom-scrollbar">

        {/* TAB 1: 3D AVATAR STYLES / ARCHETYPES */}
        {activeTab === 'styles' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Hệ Nhân Vật Bản Thể Kỹ Thuật Số</span>
            </div>

            <div className="space-y-2">
              {AVATAR_ARCHETYPES.map((arch) => {
                const isSelected = currentArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => {
                      onSelectArchetype(arch.id);
                      onSelectWingsStyle(arch.defaultWings);
                      onSelectWeaponStyle(arch.defaultWeapon);
                      onSelectHeadgearStyle(arch.defaultHeadgear);
                      morningAudio.triggerStarPop();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border-sky-400/80 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                        : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md ${
                        isSelected ? 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {arch.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-black text-white truncate">{arch.name}</h4>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{arch.sub}</p>
                        <p className="text-[9px] text-zinc-500 mt-1 italic line-clamp-2">{arch.lore}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 ring-4 ring-sky-400/30 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COLOR PALETTES & THEMES */}
        {activeTab === 'palettes' && (
          <div className="space-y-3.5">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
              <span>Bảng Màu Ma Thuật Sẵn Có</span>
              <span className="text-[9px] font-normal text-zinc-400">Đồng bộ toàn cơ thể & ánh sáng</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {AVATAR_PALETTES.map((pal) => {
                const isSelected = currentPaletteId === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => {
                      onSelectPaletteId(pal.id);
                      onChangeCustomAuraColor(pal.primary);
                      morningAudio.triggerStarDrawTone(0.8);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-900 border-sky-400 ring-1 ring-sky-400 shadow-lg shadow-sky-500/20'
                        : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Gradient preview circle */}
                      <div 
                        className="w-9 h-9 rounded-2xl shadow-md shrink-0 flex items-center justify-center p-0.5 border border-white/20"
                        style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})` }}
                      >
                        {isSelected && <Check size={14} className="text-white drop-shadow" />}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white truncate">{pal.name}</h4>
                        <p className="text-[10px] text-zinc-400 truncate">{pal.sub}</p>
                      </div>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: pal.primary }} title="Màu Hào Quang" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: pal.hairColor }} title="Màu Tóc" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: pal.bodyColor }} title="Màu Giáp" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: pal.wingColor }} title="Màu Cánh" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Aura Color Picker */}
            <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-zinc-300">Tùy Chọn Màu Hào Quang Tự Do:</span>
                <span className="font-mono text-sky-400 text-[10px] font-bold">{customAuraColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customAuraColor}
                  onChange={(e) => onChangeCustomAuraColor(e.target.value)}
                  className="w-10 h-8 rounded-xl bg-transparent cursor-pointer border border-zinc-700"
                />
                <span className="text-[10px] text-zinc-400">Điều chỉnh màu ánh sáng theo ý thích</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACCESSORIES & WEAPONS */}
        {activeTab === 'accessories' && (
          <div className="space-y-4">
            
            {/* Wings Selection */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Feather size={12} />
                <span>Cánh Ánh Sáng (Wings)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'angel', name: '🪽 Cánh Thiên Thần', sub: '2 Cánh phát sáng' },
                  { id: 'dual_angel', name: '✨ Cánh Hoàng Gia', sub: '4 Cánh thiên giới' },
                  { id: 'cyber', name: '⚡ Cánh Phản Lực', sub: 'Neon Cyberpunk' },
                  { id: 'butterfly', name: '🦋 Cánh Bướm Tiên', sub: 'Ngọc bích dịu mát' },
                  { id: 'none', name: '🚫 Ẩn Cánh', sub: 'Không hiển thị cánh' }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      onSelectWingsStyle(w.id as any);
                      morningAudio.triggerStarPop();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      wingsStyle === w.id
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-1 ring-sky-400 font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{w.name}</div>
                    <div className="text-[9px] text-zinc-500">{w.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weapon / Artifact Selection */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Swords size={12} />
                <span>Pháp Khí & Vũ Khí Cầm Tay</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'staff', name: '🪄 Trượng Phép Pha Lê', sub: 'Orb năng lượng xoay' },
                  { id: 'plasma_sword', name: '⚔️ Kiếm Plasma Laser', sub: 'Lưỡi kiếm sáng rực' },
                  { id: 'mana_orb', name: '🔮 Quả Cầu Mana Bay', sub: 'Năng lượng nguyên tố' },
                  { id: 'none', name: '✋ Tay Không (Niệm Phép)', sub: 'Tư thế niệm ấn' }
                ].map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      onSelectWeaponStyle(wp.id as any);
                      morningAudio.triggerStarPop();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      weaponStyle === wp.id
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-1 ring-sky-400 font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{wp.name}</div>
                    <div className="text-[9px] text-zinc-500">{wp.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Headgear Selection */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={12} />
                <span>Mũ / Vương Miện / Phụ Kiện Đầu</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'crown', name: '👑 Vương Miện Tinh Tú', sub: 'Vương miện gai vàng' },
                  { id: 'visor', name: '🥽 Kính Visor Neon', sub: 'Giao diện Cyber HUD' },
                  { id: 'spirit_horns', name: '🌿 Sừng Tinh Linh', sub: 'Sừng ngọc phát sáng' },
                  { id: 'hood', name: '🧙 Khăn Trùm Ma Pháp', sub: 'Áo choàng bí ẩn' },
                  { id: 'none', name: '👤 Tóc Anime Tự Nhiên', sub: 'Không đội phụ kiện' }
                ].map((hg) => (
                  <button
                    key={hg.id}
                    onClick={() => {
                      onSelectHeadgearStyle(hg.id as any);
                      morningAudio.triggerStarPop();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      headgearStyle === hg.id
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-1 ring-sky-400 font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{hg.name}</div>
                    <div className="text-[9px] text-zinc-500">{hg.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Companion Familiar Selection */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>Linh Thú Đồng Hành Bay Quanh</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'fox', name: '🦊 Hồ Ly Tinh Linh', sub: 'Đồng hành thông thái' },
                  { id: 'dragon', name: '🐉 Rồng Con Không Gian', sub: 'Vẩy ánh kim bay lượn' },
                  { id: 'wisp', name: '✨ Đốm Sáng Tinh Tú', sub: 'Hạt ánh sao hộ mệnh' },
                  { id: 'none', name: '🚫 Không Triệu Hồi', sub: 'Ẩn linh thú' }
                ].map((cp) => (
                  <button
                    key={cp.id}
                    onClick={() => {
                      onSelectCompanionStyle(cp.id as any);
                      morningAudio.triggerStarPop();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      companionStyle === cp.id
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-1 ring-sky-400 font-bold'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{cp.name}</div>
                    <div className="text-[9px] text-zinc-500">{cp.sub}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center justify-between shrink-0">
        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <RotateCcw size={12} />
          <span>Mặc Định</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5"
        >
          <Check size={13} />
          <span>Áp Dụng Bản Thể</span>
        </button>
      </div>

    </div>
  );
}
