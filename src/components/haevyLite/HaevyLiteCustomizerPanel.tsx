import React, { useState } from 'react';
import { 
  Sparkles, 
  Orbit, 
  Zap, 
  MessageSquare, 
  Tag, 
  Check, 
  X, 
  SlidersHorizontal, 
  Wand2, 
  ShoppingBag,
  Eye,
  Crown,
  RotateCcw,
  Type,
  Activity,
  MousePointer,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  HAEVY_LITE_SHOP_ITEMS, 
  HaevyLiteShopItem, 
  HaevyLiteItemCategory,
  getAvatarFrame,
  getEntranceAnimation,
  getChatBorder,
  getNameBorder,
  getNameFont,
  getPlayerWave,
  getTitleBadge,
  getCursorAura
} from './themeBundles';
import { CosmicAvatarFX } from './CosmicAvatarFX';
import { ProfileEntranceFX } from './ProfileEntranceFX';
import { CosmicProfileCardModal } from './CosmicProfileCardModal';

interface HaevyLiteCustomizerPanelProps {
  onGoToShop?: () => void;
  onShowMessage?: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export function HaevyLiteCustomizerPanel({
  onGoToShop,
  onShowMessage
}: HaevyLiteCustomizerPanelProps) {
  const {
    user,
    activeAvatarFrame,
    activeEntranceAnimation,
    activeChatBorder,
    activeNameBorder,
    activeNameFont,
    activePlayerWave,
    activeTitleBadge,
    activeCursorAura,
    unlockedHaevyLiteItems = [],
    equipHaevyLiteItem,
    unequipHaevyLiteItem,
    isVip
  } = useAuth();

  const [previewAnimId, setPreviewAnimId] = useState<string | null>(null);
  const [isEquippingAll, setIsEquippingAll] = useState(false);
  const [isUnequippingAll, setIsUnequippingAll] = useState(false);
  const [isCosmicProfileModalOpen, setIsCosmicProfileModalOpen] = useState(false);
  const [activeSlotFilter, setActiveSlotFilter] = useState<'all' | HaevyLiteItemCategory>('all');

  // Group owned items by category
  const ownedItems = HAEVY_LITE_SHOP_ITEMS.filter(item => 
    unlockedHaevyLiteItems.includes(item.id)
  );

  const ownedFrames = ownedItems.filter(i => i.category === 'avatar_frame');
  const ownedAnimations = ownedItems.filter(i => i.category === 'entrance_animation');
  const ownedChatBorders = ownedItems.filter(i => i.category === 'chat_border');
  const ownedNameBorders = ownedItems.filter(i => i.category === 'name_border');
  const ownedNameFonts = ownedItems.filter(i => i.category === 'name_font');
  const ownedPlayerWaves = ownedItems.filter(i => i.category === 'player_wave');
  const ownedTitleBadges = ownedItems.filter(i => i.category === 'title_badge');
  const ownedCursorAuras = ownedItems.filter(i => i.category === 'cursor_aura');

  const currentFrameItem = getAvatarFrame(activeAvatarFrame);
  const currentAnimItem = getEntranceAnimation(activeEntranceAnimation);
  const currentChatItem = getChatBorder(activeChatBorder);
  const currentNameItem = getNameBorder(activeNameBorder);
  const currentFontItem = getNameFont(activeNameFont);
  const currentWaveItem = getPlayerWave(activePlayerWave);
  const currentBadgeItem = getTitleBadge(activeTitleBadge);
  const currentAuraItem = getCursorAura(activeCursorAura);

  // Bulk Equip: Activate first owned item for all 8 categories
  const handleEquipAll = async () => {
    if (ownedItems.length === 0) {
      onShowMessage?.({
        type: 'error',
        text: 'Bạn chưa sở hữu hiệu ứng nào. Hãy ghé Cửa Hàng Shop để mở khóa nhé!'
      });
      return;
    }

    setIsEquippingAll(true);
    try {
      if (ownedFrames.length > 0) await equipHaevyLiteItem('avatar_frame', ownedFrames[0].id);
      if (ownedAnimations.length > 0) await equipHaevyLiteItem('entrance_animation', ownedAnimations[0].id);
      if (ownedChatBorders.length > 0) await equipHaevyLiteItem('chat_border', ownedChatBorders[0].id);
      if (ownedNameBorders.length > 0) await equipHaevyLiteItem('name_border', ownedNameBorders[0].id);
      if (ownedNameFonts.length > 0) await equipHaevyLiteItem('name_font', ownedNameFonts[0].id);
      if (ownedPlayerWaves.length > 0) await equipHaevyLiteItem('player_wave', ownedPlayerWaves[0].id);
      if (ownedTitleBadges.length > 0) await equipHaevyLiteItem('title_badge', ownedTitleBadges[0].id);
      if (ownedCursorAuras.length > 0) await equipHaevyLiteItem('cursor_aura', ownedCursorAuras[0].id);

      onShowMessage?.({
        type: 'success',
        text: '✨ Đã đồng bộ kích hoạt tất cả hiệu ứng đã sở hữu!'
      });
    } catch (e) {
      console.error(e);
      onShowMessage?.({
        type: 'error',
        text: 'Có lỗi xảy ra khi kích hoạt hiệu ứng. Vui lòng thử lại!'
      });
    } finally {
      setIsEquippingAll(false);
    }
  };

  // Bulk Unequip: Turn off all effects
  const handleUnequipAll = async () => {
    setIsUnequippingAll(true);
    try {
      await unequipHaevyLiteItem('avatar_frame');
      await unequipHaevyLiteItem('entrance_animation');
      await unequipHaevyLiteItem('chat_border');
      await unequipHaevyLiteItem('name_border');
      await unequipHaevyLiteItem('name_font');
      await unequipHaevyLiteItem('player_wave');
      await unequipHaevyLiteItem('title_badge');
      await unequipHaevyLiteItem('cursor_aura');

      onShowMessage?.({
        type: 'success',
        text: '✓ Đã tắt tất cả hiệu ứng, khôi phục về giao diện tiêu chuẩn!'
      });
    } catch (e) {
      console.error(e);
      onShowMessage?.({
        type: 'error',
        text: 'Có lỗi xảy ra khi tắt hiệu ứng.'
      });
    } finally {
      setIsUnequippingAll(false);
    }
  };

  const activeEffectsCount = [
    activeAvatarFrame && activeAvatarFrame !== 'none',
    activeEntranceAnimation && activeEntranceAnimation !== 'none',
    activeChatBorder && activeChatBorder !== 'none',
    activeNameBorder && activeNameBorder !== 'none',
    activeNameFont && activeNameFont !== 'none',
    activePlayerWave && activePlayerWave !== 'none',
    activeTitleBadge && activeTitleBadge !== 'none',
    activeCursorAura && activeCursorAura !== 'none',
  ].filter(Boolean).length;

  const CATEGORY_SLOTS: {
    id: HaevyLiteItemCategory;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    ownedList: HaevyLiteShopItem[];
    activeId: string | undefined | null;
    activeItem: HaevyLiteShopItem | null;
    renderCustomPreview?: (item: HaevyLiteShopItem, isEquipped: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'avatar_frame',
      title: '1. Khung Avatar Vũ Trụ',
      subtitle: 'Vòng hào quang rực rỡ hiển thị bao bọc quanh avatar của bạn',
      icon: Orbit,
      color: 'text-purple-400',
      ownedList: ownedFrames,
      activeId: activeAvatarFrame,
      activeItem: currentFrameItem
    },
    {
      id: 'entrance_animation',
      title: '2. Hoạt Ảnh Mở Đầu (Entrance FX)',
      subtitle: 'Hiệu ứng mở cổng rực rỡ khi người khác hoặc bạn vào trang cá nhân',
      icon: Zap,
      color: 'text-sky-400',
      ownedList: ownedAnimations,
      activeId: activeEntranceAnimation,
      activeItem: currentAnimItem
    },
    {
      id: 'chat_border',
      title: '3. Viền Chat Trong Haevy Message',
      subtitle: 'Tùy biến bong bóng tin nhắn chat rạng rỡ và khác biệt',
      icon: MessageSquare,
      color: 'text-pink-400',
      ownedList: ownedChatBorders,
      activeId: activeChatBorder,
      activeItem: currentChatItem
    },
    {
      id: 'name_border',
      title: '4. Viền Tên Tài Khoản',
      subtitle: 'Thẻ tên phát sáng trong danh sách hội thoại và hồ sơ',
      icon: Tag,
      color: 'text-amber-400',
      ownedList: ownedNameBorders,
      activeId: activeNameBorder,
      activeItem: currentNameItem
    },
    {
      id: 'name_font',
      title: '5. Phông Chữ Tên Độc Bản (Name Font)',
      subtitle: 'Kiểu chữ nghệ thuật độc quyền tôn vinh phong cách của bạn',
      icon: Type,
      color: 'text-cyan-400',
      ownedList: ownedNameFonts,
      activeId: activeNameFont,
      activeItem: currentFontItem,
      renderCustomPreview: (font, isEquipped) => (
        <div className="py-1">
          <span 
            className={`text-sm tracking-wide block truncate ${font.fontGlowClass || 'text-white'}`}
            style={{ fontFamily: font.fontFamilyName }}
          >
            {user?.displayName || font.fontPreviewText || 'Ha Khai 5429'}
          </span>
        </div>
      )
    },
    {
      id: 'player_wave',
      title: '6. Sóng Nhạc Trình Phát Vũ Trụ (Player Wave)',
      subtitle: 'Thanh sóng âm sống động khi phát nhạc và podcast',
      icon: Activity,
      color: 'text-emerald-400',
      ownedList: ownedPlayerWaves,
      activeId: activePlayerWave,
      activeItem: currentWaveItem,
      renderCustomPreview: (wave) => (
        <div className="flex items-center gap-1 py-1.5">
          {[40, 75, 95, 60, 100, 80, 50, 85].map((h, idx) => (
            <span 
              key={idx}
              className={`w-1.5 rounded-full ${wave.waveGlow || wave.waveGradient || 'bg-emerald-400'}`}
              style={{ height: `${h * 0.2}px` }}
            />
          ))}
          <span className="text-[10px] text-zinc-400 ml-2 font-mono">Sóng nhạc 3D</span>
        </div>
      )
    },
    {
      id: 'title_badge',
      title: '7. Huy Hiệu Danh Xưng Tinh Anh (Title Badge)',
      subtitle: 'Huy hiệu vương giả xuất hiện cạnh tên hiển thị của bạn',
      icon: Crown,
      color: 'text-yellow-400',
      ownedList: ownedTitleBadges,
      activeId: activeTitleBadge,
      activeItem: currentBadgeItem,
      renderCustomPreview: (badge) => (
        <div className="py-1">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 border ${badge.titleBadgeClass || 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
            <span>👑</span>
            <span>{badge.titleBadgeText || badge.name}</span>
          </span>
        </div>
      )
    },
    {
      id: 'cursor_aura',
      title: '8. Hào Quang Con Trỏ Chuột (Cursor Aura)',
      subtitle: 'Đuôi ánh sáng ngân hà chuyển động theo chuột khi duyệt web',
      icon: MousePointer,
      color: 'text-indigo-400',
      ownedList: ownedCursorAuras,
      activeId: activeCursorAura,
      activeItem: currentAuraItem
    }
  ];

  const filteredSlots = activeSlotFilter === 'all' 
    ? CATEGORY_SLOTS 
    : CATEGORY_SLOTS.filter(s => s.id === activeSlotFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/70 via-zinc-950 to-indigo-950/70 border border-purple-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <SlidersHorizontal size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Tủ Đồ & Bảng Tùy Chỉnh Hiệu Ứng (8 Danh Mục)
              </h2>
            </div>
            <p className="text-xs text-zinc-300">
              Quản lý, kích hoạt hoặc gỡ bỏ đồng bộ 8 loại trang bị: Khung avatar, hoạt ảnh mở đầu, viền chat, viền tên, phông chữ, sóng nhạc, danh hiệu & hào quang.
            </p>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCosmicProfileModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
              title="Xem trước mẫu Thẻ Hồ Sơ Vũ Trụ"
            >
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span>Thẻ Hồ Sơ Vũ Trụ</span>
            </button>

            <button
              type="button"
              onClick={handleEquipAll}
              disabled={isEquippingAll || ownedItems.length === 0}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Tự động bật các hiệu ứng tốt nhất bạn đang sở hữu"
            >
              <Wand2 size={14} />
              <span>Bật Tất Cả ({ownedItems.length} Món)</span>
            </button>

            <button
              type="button"
              onClick={handleUnequipAll}
              disabled={isUnequippingAll || activeEffectsCount === 0}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
              title="Gỡ bỏ tất cả hiệu ứng, quay về giao diện tiêu chuẩn"
            >
              <RotateCcw size={14} />
              <span>Tắt Tất Cả</span>
            </button>
          </div>
        </div>

        {/* Stats counter strip */}
        <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold block">Tổng Vật Phẩm Đã Có</span>
            <span className="text-base font-black text-white font-mono">{ownedItems.length}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold block">Đang Kích Hoạt</span>
            <span className="text-base font-black text-purple-300 font-mono">{activeEffectsCount} / 8</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold block">Khung Avatar</span>
            <span className="text-xs font-bold text-amber-300 mt-0.5 block truncate">
              {currentFrameItem ? currentFrameItem.name : 'Tiêu chuẩn'}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold block">Hoạt Ảnh Cổng</span>
            <span className="text-xs font-bold text-sky-300 mt-0.5 block truncate">
              {currentAnimItem ? currentAnimItem.name : 'Tắt'}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE HOLISTIC PREVIEW STAGE */}
      <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-purple-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Mô Phỏng Trực Quan Thời Gian Thực
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            Live Preview
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Left Preview: Avatar + Nameplate + Badge */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col items-center justify-center space-y-3 text-center min-h-[160px]">
            <CosmicAvatarFX
              photoURL={user?.photoURL}
              displayName={user?.displayName || 'Tài Khoản'}
              avatarFrameId={activeAvatarFrame}
              size="lg"
              showBadge={false}
            />

            {/* Title Badge if active */}
            {currentBadgeItem && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 border shadow-sm ${currentBadgeItem.titleBadgeClass || 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                <span>👑</span>
                <span>{currentBadgeItem.titleBadgeText || currentBadgeItem.name}</span>
              </span>
            )}

            {/* Nameplate with Font styling */}
            <div className={`px-3 py-1 rounded-xl border inline-flex items-center gap-1.5 ${currentNameItem?.nameplateBorderClass || 'border-zinc-700'} ${currentNameItem?.nameplateBgClass || 'bg-zinc-900/60'}`}>
              <span className="text-xs">{currentNameItem?.nameplateIcon || '✨'}</span>
              <span 
                className={`text-xs font-black ${currentNameItem?.nameplateTextClass || 'text-white'} ${currentFontItem?.fontGlowClass || ''} ${currentFontItem?.fontCssStyle || ''}`}
                style={{ fontFamily: currentFontItem?.fontFamilyName }}
              >
                {user?.displayName || 'Tài Khoản Của Bạn'}
              </span>
            </div>
          </div>

          {/* Right Preview: Chat Bubble + Player Wave */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-4 min-h-[160px]">
            {/* Chat Bubble Preview */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Viền Chat Message:</span>
              <div className={`p-3 rounded-2xl text-xs max-w-[95%] shadow-md ${currentChatItem?.bubbleBgClass || 'bg-sky-600'} ${currentChatItem?.bubbleBorderClass || 'border border-cyan-400'} ${currentChatItem?.bubbleShadowClass || ''}`}>
                <p className={`text-white font-medium ${currentChatItem?.bubbleTextGlowClass || ''}`}>
                  Xin chào! Đây là tin nhắn hiển thị với viền chat và phông chữ tùy chỉnh của bạn. ✨
                </p>
                <span className="text-[9px] text-white/70 block text-right mt-1">12:30 • Đã xem</span>
              </div>
            </div>

            {/* Player Wave Preview */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-xs text-zinc-300 font-bold">
                  {currentWaveItem ? currentWaveItem.name : 'Sóng nhạc tiêu chuẩn'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[30, 60, 90, 45, 80, 50, 75, 40].map((h, i) => (
                  <span 
                    key={i} 
                    className={`w-1 rounded-full ${currentWaveItem?.waveGlow || currentWaveItem?.waveGradient || 'bg-emerald-400'}`}
                    style={{ height: `${h * 0.22}px` }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSlotFilter('all')}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
            activeSlotFilter === 'all'
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
          }`}
        >
          <Filter size={12} />
          <span>Tất Cả (8 Danh Mục)</span>
        </button>

        {CATEGORY_SLOTS.map((slot) => {
          const isSelected = activeSlotFilter === slot.id;
          const IconComp = slot.icon;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveSlotFilter(slot.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/25'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <IconComp size={13} className={isSelected ? 'text-white' : slot.color} />
              <span>{slot.title.split('.')[1]?.trim() || slot.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {slot.ownedList.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 8 SLOTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSlots.map((slot) => {
          const IconComp = slot.icon;
          const isCategoryEquipped = !!slot.activeId && slot.activeId !== 'none';

          return (
            <div 
              key={slot.id} 
              className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <IconComp size={17} className={slot.color} />
                    <div>
                      <h3 className="text-sm font-black text-white">{slot.title}</h3>
                      <p className="text-[11px] text-zinc-400">{slot.subtitle}</p>
                    </div>
                  </div>
                  {isCategoryEquipped && (
                    <button
                      type="button"
                      onClick={() => unequipHaevyLiteItem(slot.id)}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer shrink-0 ml-2"
                    >
                      Gỡ bỏ
                    </button>
                  )}
                </div>

                {/* Empty State: Haven't unlocked any in this category */}
                {slot.ownedList.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-850 text-center space-y-2">
                    <p className="text-xs text-zinc-400">Bạn chưa sở hữu vật phẩm nào trong mục này.</p>
                    {onGoToShop && (
                      <button
                        type="button"
                        onClick={onGoToShop}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ShoppingBag size={13} />
                        <span>Đến Shop Mở Khóa</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {slot.ownedList.map((item) => {
                      const isEquipped = slot.activeId === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => equipHaevyLiteItem(slot.id, item.id)}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                            isEquipped
                              ? 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-400/50'
                              : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white truncate">{item.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-black">
                                {item.badge}
                              </span>
                            </div>

                            {/* Optional Custom Preview Slot */}
                            {slot.renderCustomPreview && slot.renderCustomPreview(item, isEquipped)}

                            <p className="text-[10px] text-zinc-400 truncate">{item.tagline}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {slot.id === 'entrance_animation' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewAnimId(item.id);
                                }}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-sky-600 text-zinc-300 hover:text-white transition-colors"
                                title="Xem thử hoạt ảnh"
                              >
                                <Eye size={13} />
                              </button>
                            )}

                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                isEquipped
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-zinc-800 hover:bg-purple-600 text-white'
                              }`}
                            >
                              {isEquipped ? 'Đang Dùng' : 'Trang Bị'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Entrance Animation Preview Modal */}
      {previewAnimId && (
        <ProfileEntranceFX
          animationId={previewAnimId}
          onComplete={() => setPreviewAnimId(null)}
        />
      )}

      {/* Cosmic Profile Vista Modal */}
      <CosmicProfileCardModal
        isOpen={isCosmicProfileModalOpen}
        onClose={() => setIsCosmicProfileModalOpen(false)}
        userData={{
          displayName: user?.displayName || 'Ha Khai 5429',
          handle: user?.email ? `@${user.email.split('@')[0]}` : '@hakhai_5429',
          subtitle: 'Khải HQ',
          photoURL: user?.photoURL,
          joinedDate: '17 thg 4, 2022',
          isVip: isVip,
          statusText: 'Đang trực tuyến'
        }}
      />
    </div>
  );
}
