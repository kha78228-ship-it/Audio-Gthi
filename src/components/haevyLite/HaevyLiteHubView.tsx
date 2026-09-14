import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Coins, 
  Orbit, 
  Play, 
  CreditCard, 
  Check, 
  Lock, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
  Star,
  Tv,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  User as UserIcon,
  Layers,
  Gift,
  AlertCircle,
  X,
  QrCode,
  Smartphone,
  Copy,
  Tag,
  History,
  Loader2,
  Percent,
  RefreshCw,
  Send,
  MessageSquare,
  SlidersHorizontal,
  Wand2,
  Search,
  Filter,
  ArrowUpDown,
  Radio,
  Activity,
  Crown,
  MousePointer,
  Type,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { haptics } from '../../utils/haptics';
import { useAuth } from '../../context/AuthContext';
import { 
  HAEVY_LITE_SHOP_ITEMS, 
  HAEVY_LITE_TOPUP_PACKAGES, 
  HaevyLiteShopItem, 
  HaevyLiteItemCategory,
  getPlayerWave,
  getTitleBadge,
  getCursorAura,
  getNameFont,
  getNameBorder,
  getChatBorder,
  getAvatarFrame,
  getEntranceAnimation
} from './themeBundles';
import { CosmicAvatarFX } from './CosmicAvatarFX';
import { ProfileEntranceFX } from './ProfileEntranceFX';
import { Watch30sAdModal } from './Watch30sAdModal';
import { HaevyLiteCustomizerPanel } from './HaevyLiteCustomizerPanel';
import { HaevyLiteTopupPanel } from './HaevyLiteTopupPanel';

interface HaevyLiteHubViewProps {
  onBackToPortal?: () => void;
  onGoToProfile?: () => void;
  onOpenAuth?: () => void;
  initialTab?: 'topup_and_ads' | 'shop' | 'customize' | 'watch_ad' | 'topup';
  activeTabControlled?: 'shop' | 'customize' | 'topup_and_ads';
  onTabChange?: (tab: 'shop' | 'customize' | 'topup_and_ads') => void;
}

export function HaevyLiteHubView({
  onBackToPortal,
  onGoToProfile,
  onOpenAuth,
  initialTab = 'shop',
  activeTabControlled,
  onTabChange
}: HaevyLiteHubViewProps) {
  const { 
    user, 
    accountId,
    haevyLiteCoins = 0, 
    activeAvatarFrame,
    activeEntranceAnimation,
    activeChatBorder,
    activeNameBorder,
    activeNameFont,
    activePlayerWave,
    activeTitleBadge,
    activeCursorAura,
    unlockedHaevyLiteItems = [],
    unlockHaevyLiteItem,
    equipHaevyLiteItem,
    unequipHaevyLiteItem
  } = useAuth();

  const [internalTab, setInternalTab] = useState<'shop' | 'customize' | 'topup_and_ads'>(() => {
    if (activeTabControlled) return activeTabControlled;
    if (initialTab === 'customize') return 'customize';
    if (initialTab === 'topup_and_ads' || initialTab === 'watch_ad' || initialTab === 'topup') return 'topup_and_ads';
    return 'shop';
  });

  const activeTab = activeTabControlled !== undefined ? activeTabControlled : internalTab;

  const setActiveTab = (tab: 'shop' | 'customize' | 'topup_and_ads') => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
    setStatusMessage(null);
    haptics?.selection?.();
  };
  const [activeCategory, setActiveCategory] = useState<'all' | HaevyLiteItemCategory>('all');
  const [topupSubFilter, setTopupSubFilter] = useState<'all' | 'ads' | 'topup'>('all');
  const [previewAnimId, setPreviewAnimId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Dressing Room (Phòng Thử Đồ) & Filter State
  const [tryOnItem, setTryOnItem] = useState<HaevyLiteShopItem | null>(null);
  const [isDressingRoomOpen, setIsDressingRoomOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'unlocked' | 'locked' | 'active'>('all');

  const isItemActive = (item: HaevyLiteShopItem) => {
    switch (item.category) {
      case 'avatar_frame':
        return activeAvatarFrame === item.id;
      case 'entrance_animation':
        return activeEntranceAnimation === item.id;
      case 'chat_border':
        return activeChatBorder === item.id;
      case 'name_border':
        return activeNameBorder === item.id;
      case 'name_font':
        return activeNameFont === item.id;
      case 'player_wave':
        return activePlayerWave === item.id;
      case 'title_badge':
        return activeTitleBadge === item.id;
      case 'cursor_aura':
        return activeCursorAura === item.id;
      default:
        return false;
    }
  };

  const handleUnlockItem = async (item: HaevyLiteShopItem) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      setStatusMessage({ type: 'error', text: 'Vui lòng đăng nhập để mở khóa vật phẩm!' });
      return;
    }

    if (haevyLiteCoins < item.priceLiteCoins) {
      setStatusMessage({ 
        type: 'error', 
        text: `Bạn cần ${item.priceLiteCoins} Xu Haevy Lite (hiện có ${haevyLiteCoins} Xu). Hãy xem quảng cáo 30s hoặc nạp thêm Xu!` 
      });
      setActiveTab('topup_and_ads');
      setTopupSubFilter('ads');
      return;
    }

    setIsPurchasing(true);
    setStatusMessage(null);
    try {
      if (unlockHaevyLiteItem) {
        const res = await unlockHaevyLiteItem(item.id, item.priceLiteCoins);
        if (res.success) {
          if (equipHaevyLiteItem) {
            await equipHaevyLiteItem(item.category, item.id);
          }
          setStatusMessage({ 
            type: 'success', 
            text: `✨ Chúc mừng bạn đã mở khóa thành công "${item.name}"! Vật phẩm đã được tự động kích hoạt vào tài khoản.` 
          });
        } else {
          setStatusMessage({ type: 'error', text: res.message });
        }
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Lỗi khi mở khóa vật phẩm.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEquipItem = async (item: HaevyLiteShopItem) => {
    try {
      if (equipHaevyLiteItem) {
        await equipHaevyLiteItem(item.category, item.id);
        setStatusMessage({
          type: 'success',
          text: `Đã trang bị "${item.name}" thành công!`
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Lỗi khi trang bị vật phẩm.' });
    }
  };

  const handleUnequipCategory = async (category: HaevyLiteItemCategory) => {
    try {
      if (unequipHaevyLiteItem) {
        await unequipHaevyLiteItem(category);
        setStatusMessage({
          type: 'success',
          text: 'Đã gỡ bỏ trang bị thành công!'
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Lỗi khi gỡ trang bị.' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-28">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-zinc-950/80 p-3 sm:p-4 rounded-3xl border border-zinc-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
              title="Quay lại Hệ sinh thái"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Orbit size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  Trung Tâm Xu Haevy Lite & Combo Hoạt Ảnh
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold uppercase">
                  Vũ Trụ 🌌
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Đổi hoạt ảnh động Cổng Vũ Trụ khi vào trang cá nhân & Vòng xoay thiên hà quanh avatar
              </p>
            </div>
          </div>
        </div>

        {/* User Balance Capsule */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-950/60 to-zinc-900 border border-purple-500/40 flex items-center gap-2 shadow-inner">
            <Sparkles size={16} className="text-purple-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Số dư Xu Lite</div>
              <div className="text-sm sm:text-base font-black text-purple-300 font-mono flex items-baseline gap-1">
                {haevyLiteCoins.toLocaleString()} <span className="text-[10px] font-bold">XU</span>
              </div>
            </div>
          </div>

          {onGoToProfile && (
            <button
              onClick={onGoToProfile}
              className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Xem trang cá nhân của bạn"
            >
              <UserIcon size={16} />
              <span className="hidden sm:inline">Trang Cá Nhân</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert status notification if any */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40' 
            : 'bg-rose-950/30 text-rose-300 border-rose-500/40'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 1: CỬA HÀNG VẬT PHẨM HAEVY LITE (SHOP)                              */}
      {/* ========================================================================= */}
      {activeTab === 'shop' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cosmic Hub Spotlight Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-950 to-indigo-950/80 border border-purple-500/30 p-5 sm:p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2.5 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  <Sparkles size={13} className="text-purple-400" />
                  <span>CỬA HÀNG VẬT PHẨM HAEVY LITE • 40+ HIỆU ỨNG ĐỘC BẢN</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Tùy Biến Phong Cách Cá Nhân Toàn Hệ Sinh Thái
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Mở khóa Khung Avatar chuyển động, Cổng Vũ Trụ mở đầu, Viền Chat trong Haevy Message, Sóng Nhạc Trình Phát và Hào Quang Chuột.
                </p>

                <div className="flex items-center gap-2.5 pt-1 justify-center md:justify-start flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDressingRoomOpen(!isDressingRoomOpen);
                      haptics.selection();
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isDressingRoomOpen || tryOnItem
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    <Wand2 size={14} />
                    <span>{isDressingRoomOpen || tryOnItem ? 'Thu Gọn Phòng Thử Đồ' : 'Mở Phòng Thử Đồ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('topup_and_ads')}
                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Tv size={14} />
                    <span>Xem QC (+50 Xu Miễn Phí)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewAnimId('cosmic_portal')}
                    className="px-3.5 py-2 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Thử Cổng Vũ Trụ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('customize')}
                    className="px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Tủ Đồ (Trang 2)</span>
                  </button>
                </div>
              </div>

              {/* Compact Active Avatar Preview Capsule */}
              <div className="shrink-0 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-purple-500/30 shadow-lg">
                <CosmicAvatarFX
                  photoURL={user?.photoURL}
                  displayName={user?.displayName || 'Tài Khoản'}
                  avatarFrameId={activeAvatarFrame}
                  size="sm"
                  showBadge={false}
                />
                <div className="text-left">
                  <div className="text-xs font-black text-white truncate max-w-[140px]">
                    {user?.displayName || 'Tài Khoản'}
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono mt-0.5">
                    {activeAvatarFrame ? '🌌 Khung Vũ Trụ' : 'Tiêu chuẩn'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE LIVE TRY-ON STUDIO (PHÒNG THỬ ĐỒ VŨ TRỤ TRỰC QUAN 🪞)        */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-b from-zinc-900/95 via-purple-950/30 to-zinc-950/95 p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of Dressing Room */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Wand2 size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Phòng Thử Đồ Tương Tác Trực Quan (Live Try-On Studio)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {tryOnItem 
                      ? `Đang ướm thử vật phẩm: ${tryOnItem.name} (${tryOnItem.badge})` 
                      : 'Bấm nút "Thử Đồ" ở bất kỳ vật phẩm nào trong Shop để xem thử trực tiếp trước khi mở khóa!'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {tryOnItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setTryOnItem(null);
                      haptics.light();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Hủy Ướm Thử</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDressingRoomOpen(!isDressingRoomOpen)}
                  className="p-2 rounded-xl bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
                  title={isDressingRoomOpen ? 'Thu gọn phòng thử đồ' : 'Mở rộng phòng thử đồ'}
                >
                  {isDressingRoomOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Collapsible Dressing Room Canvas */}
            {isDressingRoomOpen && (
              <div className="pt-5 space-y-5">
                {/* 4 Multi-Perspective Preview Panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Panel 1: Avatar & Identity Card Preview */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col items-center justify-center min-h-[170px] relative text-center">
                    <span className="absolute top-2.5 left-3 text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                      <Orbit size={11} />
                      Khung & Danh Hiệu
                    </span>

                    <div className="pt-4 pb-2">
                      <CosmicAvatarFX
                        avatarFrameId={tryOnItem?.category === 'avatar_frame' ? tryOnItem.id : activeAvatarFrame}
                        photoURL={user?.photoURL}
                        displayName={user?.displayName || 'Tài Khoản'}
                        size="lg"
                        showBadge={false}
                      />
                    </div>

                    {/* Render Title Badge & Nameplate */}
                    <div className="mt-2 flex flex-col items-center gap-1">
                      {/* Title Badge Preview */}
                      {(() => {
                        const badgeId = tryOnItem?.category === 'title_badge' ? tryOnItem.id : activeTitleBadge;
                        const badgeObj = getTitleBadge(badgeId);
                        if (!badgeObj) return null;
                        return (
                          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border shadow-sm ${badgeObj.titleBadgeClass || 'bg-purple-500/20 text-purple-200 border-purple-500/40'}`}>
                            <span>👑</span>
                            <span>{badgeObj.titleBadgeText || badgeObj.name}</span>
                          </div>
                        );
                      })()}

                      {/* Nameplate & Custom Font Preview */}
                      {(() => {
                        const nameplateId = tryOnItem?.category === 'name_border' ? tryOnItem.id : activeNameBorder;
                        const fontId = tryOnItem?.category === 'name_font' ? tryOnItem.id : activeNameFont;
                        const nameplate = getNameBorder(nameplateId);
                        const fontObj = getNameFont(fontId);
                        return (
                          <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${nameplate?.nameplateBorderClass || 'border-zinc-700'} ${nameplate?.nameplateBgClass || 'bg-zinc-900/60'}`}>
                            <span className="text-xs">{nameplate?.nameplateIcon || '✨'}</span>
                            <span 
                              className={`text-xs font-black ${nameplate?.nameplateTextClass || 'text-white'} ${fontObj?.fontGlowClass || ''} ${fontObj?.fontCssStyle || ''}`}
                            >
                              {user?.displayName || 'Tài Khoản Haevy'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Panel 2: Live Chat Message Bubble Preview */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between min-h-[170px] relative">
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1">
                      <MessageSquare size={11} />
                      Viền Chat Message
                    </span>

                    {(() => {
                      const chatItemId = tryOnItem?.category === 'chat_border' ? tryOnItem.id : activeChatBorder;
                      const chatItem = getChatBorder(chatItemId);
                      const fontId = tryOnItem?.category === 'name_font' ? tryOnItem.id : activeNameFont;
                      const fontObj = getNameFont(fontId);
                      return (
                        <div className="my-auto space-y-2 py-2">
                          <div className={`p-3 rounded-2xl text-xs max-w-[92%] ml-auto shadow-md ${chatItem?.bubbleBgClass || 'bg-sky-600'} ${chatItem?.bubbleBorderClass || 'border border-cyan-400'} ${chatItem?.bubbleShadowClass || ''}`}>
                            <p 
                              className={`text-white font-medium ${chatItem?.bubbleTextGlowClass || ''} ${fontObj?.fontCssStyle || ''}`}
                            >
                              {tryOnItem?.category === 'chat_border' 
                                ? `Trải nghiệm viền chat "${tryOnItem.name}" siêu đỉnh! 🔥`
                                : 'Tin nhắn trò chuyện phong cách Haevy Lite ✨'}
                            </p>
                            <span className="text-[9px] text-white/70 block text-right mt-1">12:30 • Đã xem</span>
                          </div>
                        </div>
                      );
                    })()}

                    <span className="text-[10px] text-zinc-500 text-center">
                      Hiển thị trực tiếp trong Haevy Message & Room Chat
                    </span>
                  </div>

                  {/* Panel 3: Music Player Wave Visualizer & Cursor Aura */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between min-h-[170px] relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                        <Activity size={11} />
                        Sóng Nhạc Visualizer
                      </span>
                      {tryOnItem?.category === 'cursor_aura' && (
                        <span className="text-[10px] font-black uppercase text-pink-400 flex items-center gap-1">
                          <MousePointer size={11} /> Hào Quang Chuột
                        </span>
                      )}
                    </div>

                    {/* Live Animated Audio Waveform Equalizer */}
                    {(() => {
                      const waveId = tryOnItem?.category === 'player_wave' ? tryOnItem.id : activePlayerWave;
                      const waveObj = getPlayerWave(waveId);
                      const barClass = waveObj?.waveGradient ? `bg-gradient-to-t ${waveObj.waveGradient}` : 'bg-gradient-to-t from-purple-500 to-pink-400';
                      const glowClass = waveObj?.waveGlow || 'shadow-[0_0_12px_rgba(168,85,247,0.5)]';
                      return (
                        <div className="my-auto py-3 px-2 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-end justify-center gap-1.5 h-16">
                          {[35, 65, 85, 45, 95, 70, 50, 90, 60, 80, 40, 75, 55, 30].map((baseHeight, idx) => (
                            <span 
                              key={idx}
                              className={`w-1.5 rounded-full transition-all duration-300 animate-pulse ${barClass} ${glowClass}`}
                              style={{ 
                                height: `${Math.max(15, (baseHeight + (idx % 3) * 10) % 95)}%`,
                                animationDelay: `${idx * 0.08}s` 
                              }}
                            />
                          ))}
                        </div>
                      );
                    })()}

                    {/* Cursor Aura or Sub-note */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                      <span>{tryOnItem?.category === 'player_wave' ? tryOnItem.name : 'Hi-Fi Audio Frequency'}</span>
                      <span className="font-mono text-purple-400">96kHz • Lossless</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar of Dressing Room with Quick Actions */}
                {tryOnItem && (
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">✨</span>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>Vật phẩm đang thử: <strong>{tryOnItem.name}</strong></span>
                          <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                            {tryOnItem.priceLiteCoins} Xu
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{tryOnItem.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isItemActive(tryOnItem) ? (
                        <button
                          type="button"
                          onClick={() => handleUnequipCategory(tryOnItem.category)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                          <span>Gỡ Khỏi Tài Khoản</span>
                        </button>
                      ) : unlockedHaevyLiteItems.includes(tryOnItem.id) ? (
                        <button
                          type="button"
                          onClick={() => handleEquipItem(tryOnItem)}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles size={14} />
                          <span>Áp Dụng Trang Bị Ngay</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUnlockItem(tryOnItem)}
                          disabled={isPurchasing}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Coins size={14} />
                          <span>Mở Khóa Ngay ({tryOnItem.priceLiteCoins} Xu)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setTryOnItem(null);
                          haptics.light();
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* CATEGORY FILTER TABS (ALL 9 CATEGORIES)                                   */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all' as const, label: 'Tất Cả', icon: Sparkles, count: HAEVY_LITE_SHOP_ITEMS.length },
              { id: 'avatar_frame' as const, label: 'Khung Avatar', icon: Orbit, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'avatar_frame').length },
              { id: 'entrance_animation' as const, label: 'Hoạt Ảnh Mở Đầu', icon: Zap, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'entrance_animation').length },
              { id: 'chat_border' as const, label: 'Viền Chat Message', icon: MessageSquare, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'chat_border').length },
              { id: 'name_border' as const, label: 'Viền Tên Phiên Chat', icon: Tag, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'name_border').length },
              { id: 'name_font' as const, label: 'Phông Chữ Nghệ Thuật', icon: Type, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'name_font').length },
              { id: 'player_wave' as const, label: 'Sóng Nhạc Player', icon: Activity, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'player_wave').length },
              { id: 'title_badge' as const, label: 'Danh Hiệu Hệ Sinh Thái', icon: Crown, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'title_badge').length },
              { id: 'cursor_aura' as const, label: 'Hào Quang Chuột', icon: MousePointer, count: HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'cursor_aura').length },
            ].map((cat) => {
              const isSelected = activeCategory === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    haptics.selection();
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-600/30 scale-[1.02]'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <IconComp size={14} className={isSelected ? 'text-white' : 'text-purple-400'} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* SEARCH, OWNERSHIP FILTER, AND SORT CONTROLS                               */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm vật phẩm, combo, hiệu ứng..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-between md:justify-end">
              {/* Ownership Filter Pills */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: 'locked', label: 'Chưa Có' },
                  { id: 'unlocked', label: 'Đã Mở' },
                  { id: 'active', label: 'Đang Dùng' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setOwnershipFilter(f.id as any);
                      haptics.selection();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ownershipFilter === f.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
                <ArrowUpDown size={13} className="text-zinc-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-transparent text-xs text-zinc-300 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-zinc-900 text-white">Nổi Bật Nhất</option>
                  <option value="price_asc" className="bg-zinc-900 text-white">Giá Thấp → Cao</option>
                  <option value="price_desc" className="bg-zinc-900 text-white">Giá Cao → Thấp</option>
                  <option value="name" className="bg-zinc-900 text-white">Tên A → Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SHOP ITEMS GRID                                                           */}
          {/* ========================================================================= */}
          {(() => {
            const filteredItems = HAEVY_LITE_SHOP_ITEMS
              .filter(item => {
                // Category filter
                if (activeCategory !== 'all' && item.category !== activeCategory) return false;
                // Search filter
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  const matchName = item.name.toLowerCase().includes(q);
                  const matchTagline = item.tagline.toLowerCase().includes(q);
                  const matchBadge = item.badge?.toLowerCase().includes(q);
                  const matchFeatures = item.features.some(f => f.toLowerCase().includes(q));
                  if (!matchName && !matchTagline && !matchBadge && !matchFeatures) return false;
                }
                // Ownership filter
                const isUnlocked = unlockedHaevyLiteItems.includes(item.id);
                const isActive = isItemActive(item);
                if (ownershipFilter === 'locked' && isUnlocked) return false;
                if (ownershipFilter === 'unlocked' && !isUnlocked) return false;
                if (ownershipFilter === 'active' && !isActive) return false;
                return true;
              })
              .sort((a, b) => {
                if (sortOption === 'price_asc') return a.priceLiteCoins - b.priceLiteCoins;
                if (sortOption === 'price_desc') return b.priceLiteCoins - a.priceLiteCoins;
                if (sortOption === 'name') return a.name.localeCompare(b.name);
                return 0;
              });

            if (filteredItems.length === 0) {
              return (
                <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <Search size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Không tìm thấy vật phẩm phù hợp</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      setOwnershipFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Xem Tất Cả Vật Phẩm
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => {
                  const isUnlocked = unlockedHaevyLiteItems.includes(item.id);
                  const isActive = isItemActive(item);
                  const isBeingTried = tryOnItem?.id === item.id;

                  return (
                    <div 
                      key={item.id}
                      className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between overflow-hidden group ${
                        isActive 
                          ? 'bg-gradient-to-br from-purple-950/70 via-zinc-950 to-zinc-950 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/30' 
                          : isBeingTried
                            ? 'bg-zinc-950 border-pink-500/80 shadow-lg shadow-pink-500/20'
                            : isUnlocked 
                              ? 'bg-zinc-950 border-emerald-500/40 hover:border-emerald-500' 
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Badge & Price Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {item.badge}
                          </span>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs font-black text-amber-300">
                            <Coins size={13} className="text-amber-400" />
                            <span>{item.priceLiteCoins} Xu</span>
                          </div>
                        </div>

                        {/* Visual Preview Container */}
                        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
                          {/* 1. Avatar Frame Preview */}
                          {item.category === 'avatar_frame' && (
                            <div className="py-2">
                              <CosmicAvatarFX
                                avatarFrameId={item.id}
                                photoURL={user?.photoURL}
                                displayName={user?.displayName || 'Tài Khoản'}
                                size="lg"
                                showBadge={false}
                              />
                            </div>
                          )}

                          {/* 2. Entrance Animation Preview */}
                          {item.category === 'entrance_animation' && (
                            <div className="text-center space-y-2 py-1 w-full">
                              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-950 border-2 border-purple-400 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 animate-pulse">
                                {item.entranceIcon || '🌌'}
                              </div>
                              <p className="text-xs font-bold text-white">{item.entranceTitle || item.name}</p>
                              <button
                                type="button"
                                onClick={() => setPreviewAnimId(item.id)}
                                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Xem Thử Hoạt Ảnh</span>
                              </button>
                            </div>
                          )}

                          {/* 3. Chat Border Preview */}
                          {item.category === 'chat_border' && (
                            <div className="w-full space-y-2 py-1">
                              <div className={`p-2.5 rounded-2xl text-xs max-w-[88%] ml-auto ${item.bubbleBgClass || 'bg-sky-600'} ${item.bubbleBorderClass || 'border border-cyan-400'} ${item.bubbleShadowClass || ''}`}>
                                <p className={`text-white font-medium ${item.bubbleTextGlowClass || ''}`}>
                                  Tin nhắn xem trước với viền chat này ✨
                                </p>
                                <span className="text-[9px] text-white/70 block text-right mt-0.5">Vừa gửi</span>
                              </div>
                            </div>
                          )}

                          {/* 4. Name Border Preview */}
                          {item.category === 'name_border' && (
                            <div className="w-full py-2 flex items-center justify-center">
                              <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${item.nameplateBorderClass} ${item.nameplateBgClass}`}>
                                <span className="text-sm">{item.nameplateIcon}</span>
                                <span className={`text-xs font-black ${item.nameplateTextClass}`}>
                                  {user?.displayName || 'Tên Người Dùng'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 5. Name Font Preview */}
                          {item.category === 'name_font' && (
                            <div className="w-full py-2 flex flex-col items-center justify-center gap-1 text-center">
                              <div 
                                className={`text-base font-black ${item.fontGlowClass || 'text-white'} ${item.fontCssStyle || ''}`}
                              >
                                {user?.displayName || 'Haevy Super User'}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Phông: {item.fontFamilyName || item.name}
                              </span>
                            </div>
                          )}

                          {/* 6. Player Wave Preview */}
                          {item.category === 'player_wave' && (
                            <div className="w-full py-2 flex flex-col items-center justify-center gap-2">
                              <div className="flex items-end justify-center gap-1 h-12 w-full px-4">
                                {[30, 70, 95, 50, 85, 40, 90, 65, 80, 45, 60, 35].map((val, i) => (
                                  <span
                                    key={i}
                                    className={`w-1.5 rounded-full animate-pulse ${item.waveGradient ? `bg-gradient-to-t ${item.waveGradient}` : 'bg-purple-500'} ${item.waveGlow || ''}`}
                                    style={{ 
                                      height: `${val}%`, 
                                      animationDelay: `${i * 0.09}s` 
                                    }}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                <Activity size={12} className="text-purple-400" />
                                <span>Tần số sóng nhạc tương tác</span>
                              </span>
                            </div>
                          )}

                          {/* 7. Title Badge Preview */}
                          {item.category === 'title_badge' && (
                            <div className="w-full py-2 flex flex-col items-center justify-center gap-2">
                              <div className={`px-4 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-md ${item.titleBadgeClass || 'bg-purple-500/20 text-purple-200 border-purple-500/40'}`}>
                                <span className="text-sm">👑</span>
                                <span>{item.titleBadgeText || item.name}</span>
                              </div>
                              <span className="text-[10px] text-zinc-400">
                                Xuất hiện trên Thẻ Hồ Sơ & Leaderboard
                              </span>
                            </div>
                          )}

                          {/* 8. Cursor Aura Preview */}
                          {item.category === 'cursor_aura' && (
                            <div className="w-full py-2 flex flex-col items-center justify-center gap-2 text-center">
                              <div className="relative flex items-center justify-center w-12 h-12">
                                <div 
                                  className="w-8 h-8 rounded-full animate-ping opacity-60 absolute"
                                  style={{ backgroundColor: item.cursorAuraGlow || 'rgba(168,85,247,0.6)' }}
                                />
                                <div 
                                  className={`w-4 h-4 rounded-full relative z-10 bg-gradient-to-r ${item.cursorAuraColor || 'from-purple-400 to-pink-400'}`} 
                                />
                              </div>
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <MousePointer size={11} className="text-purple-400" />
                                <span>{item.name}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Tagline */}
                        <div>
                          <h3 className="text-base font-black text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                Đang Dùng
                              </span>
                            )}
                            {isBeingTried && !isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 text-[10px] font-bold">
                                Đang Ướm Thử
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {item.tagline}
                          </p>
                        </div>

                        {/* Feature Checklist */}
                        <div className="space-y-1.5 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-900">
                          <div className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                            Đặc quyền vật phẩm:
                          </div>
                          <ul className="space-y-1 text-xs text-zinc-300">
                            {item.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <Check size={12} className="text-purple-400 mt-0.5 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center gap-2">
                        {/* Try-On Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTryOnItem(item);
                            setIsDressingRoomOpen(true);
                            haptics.selection();
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            isBeingTried
                              ? 'bg-pink-600/30 text-pink-300 border-pink-500/50 shadow-sm'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                          }`}
                          title="Ướm thử vật phẩm này lên phòng thử đồ"
                        >
                          <Eye size={14} />
                          <span className="hidden sm:inline">Ướm Thử</span>
                        </button>

                        {/* Primary Unlock/Equip Button */}
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => handleUnequipCategory(item.category)}
                            className="flex-1 py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <X size={15} />
                            <span>Gỡ Bỏ (Không Dùng)</span>
                          </button>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleEquipItem(item)}
                            className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                          >
                            <Sparkles size={15} />
                            <span>Trang Bị Ngay</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUnlockItem(item)}
                            disabled={isPurchasing}
                            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <Coins size={14} />
                            <span>Mở Khóa ({item.priceLiteCoins} Xu)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 2: TÙY CHỈNH TẤT CẢ HIỆU ỨNG (CUSTOMIZER PANEL)                     */}
      {/* ========================================================================= */}
      {activeTab === 'customize' && (
        <HaevyLiteCustomizerPanel
          onGoToShop={() => setActiveTab('shop')}
          onShowMessage={setStatusMessage}
        />
      )}

      {/* ========================================================================= */}
      {/* TRANG 3: NẠP XU VÀ XEM VIDEO QUẢNG CÁO (TOPUP & WATCH ADS)               */}
      {/* ========================================================================= */}
      {activeTab === 'topup_and_ads' && (
        <HaevyLiteTopupPanel
          subFilter={topupSubFilter}
          onSubFilterChange={setTopupSubFilter}
          onShowMessage={setStatusMessage}
          onGoToShop={() => setActiveTab('shop')}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* Preview Entrance Modal */}
      {previewAnimId && (
        <ProfileEntranceFX
          animationId={previewAnimId}
          userName={user?.displayName || 'Người Dùng Haevy'}
          userPhoto={user?.photoURL}
          isOpen={Boolean(previewAnimId)}
          onClose={() => setPreviewAnimId(null)}
        />
      )}
    </div>
  );
}
