import React, { useState } from 'react';
import { 
  X, 
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
  MessageSquare,
  Tag,
  SlidersHorizontal,
  Wand2,
  Type
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  HAEVY_LITE_SHOP_ITEMS, 
  HAEVY_LITE_TOPUP_PACKAGES, 
  HaevyLiteShopItem, 
  HaevyLiteItemCategory 
} from './themeBundles';
import { CosmicAvatarFX } from './CosmicAvatarFX';
import { ProfileEntranceFX } from './ProfileEntranceFX';
import { Watch30sAdModal } from './Watch30sAdModal';
import { HaevyLiteCustomizerPanel } from './HaevyLiteCustomizerPanel';

interface HaevyLiteHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'topup_and_ads' | 'shop' | 'customize' | 'watch_ad' | 'topup';
}

export function HaevyLiteHubModal({
  isOpen,
  onClose,
  initialTab = 'topup_and_ads'
}: HaevyLiteHubModalProps) {
  const { 
    user, 
    haevyLiteCoins = 0, 
    activeAvatarFrame,
    activeEntranceAnimation,
    activeChatBorder,
    activeNameBorder,
    activeNameFont,
    unlockedHaevyLiteItems = [],
    unlockHaevyLiteItem,
    equipHaevyLiteItem,
    unequipHaevyLiteItem,
    purchaseHaevyLitePackage
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'topup_and_ads' | 'shop' | 'customize'>(() => {
    if (initialTab === 'shop') return 'shop';
    if (initialTab === 'customize') return 'customize';
    return 'topup_and_ads';
  });
  const [topupSubFilter, setTopupSubFilter] = useState<'all' | 'ads' | 'topup'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | HaevyLiteItemCategory>('all');
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [previewAnimId, setPreviewAnimId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedTopupPkg, setSelectedTopupPkg] = useState(HAEVY_LITE_TOPUP_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay'>('vietqr');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

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
      default:
        return false;
    }
  };

  const handleUnlockItem = async (item: HaevyLiteShopItem) => {
    if (!user) {
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
          setStatusMessage({ 
            type: 'success', 
            text: `Chúc mừng bạn đã mở khóa thành công "${item.name}"!` 
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

  const handleTopup = async () => {
    if (!user) {
      setStatusMessage({ type: 'error', text: 'Vui lòng đăng nhập để nạp Xu Haevy Lite!' });
      return;
    }

    setIsPurchasing(true);
    setStatusMessage(null);
    try {
      if (purchaseHaevyLitePackage) {
        const res = await purchaseHaevyLitePackage({
          pkg: selectedTopupPkg,
          finalAmount: selectedTopupPkg.priceVnd,
          paymentMethod
        });
        if (res.success) {
          setStatusMessage({ type: 'success', text: res.message });
          setActiveTab('shop');
        } else {
          setStatusMessage({ type: 'error', text: res.message });
        }
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Lỗi nạp Xu Haevy Lite.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Orbit size={22} className="animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Xu Haevy Lite & Combo Chủ Đề</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MỚI
                </span>
              </div>
              <p className="text-xs text-zinc-400">Đổi hoạt ảnh cá nhân, avatar động và hiệu ứng kết bạn Haevy Message</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customizer Button */}
            <button
              type="button"
              onClick={() => { setActiveTab('customize'); setStatusMessage(null); }}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
              title="Tùy chỉnh tất cả các hiệu ứng mua được trong shop"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Tùy Chỉnh Tất Cả</span>
              <span className="sm:hidden">Tùy Chỉnh</span>
            </button>

            {/* User Coin Balance Badge */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center gap-2 shadow-inner">
              <Coins size={16} className="text-amber-400 animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block -mb-0.5">Số dư của bạn</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {haevyLiteCoins.toLocaleString()} <span className="text-[11px] font-bold text-amber-400">Xu Lite</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Chia đều 3 tác vụ chính */}
        <div className="grid grid-cols-3 px-3 sm:px-6 pt-3 pb-2 border-b border-zinc-800/60 bg-zinc-950 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('topup_and_ads'); setStatusMessage(null); }}
            className={`py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border text-center ${
              activeTab === 'topup_and_ads'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md font-black'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard size={14} className="shrink-0 text-emerald-400" />
            <span className="truncate">1. Nạp Xu & QC</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('shop'); setStatusMessage(null); }}
            className={`py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border text-center ${
              activeTab === 'shop'
                ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md font-black'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Orbit size={14} className="shrink-0 text-purple-400" />
            <span className="truncate">2. Shop Vật Phẩm</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('customize'); setStatusMessage(null); }}
            className={`py-2.5 px-2 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border text-center ${
              activeTab === 'customize'
                ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-md font-black'
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal size={14} className="shrink-0 text-pink-400" />
            <span className="truncate">3. Tùy Chỉnh Tủ Đồ</span>
          </button>
        </div>

        {/* Notification Banner */}
        {statusMessage && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-2xl border text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <HelpCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB 2: SHOP 4 VẬT PHẨM HAEVY LITE */}
          {activeTab === 'shop' && (
            <div className="space-y-5">
              {/* Quick banner to Customize All Effects */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-zinc-900 to-indigo-950/70 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">
                      Đã mở khóa các hiệu ứng từ Shop?
                    </h4>
                    <p className="text-[11px] text-zinc-300">
                      Bấm vào Tùy Chỉnh để kích hoạt đồng bộ cả 4 hiệu ứng cùng lúc.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('customize')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Wand2 size={13} />
                  <span>Tùy Chỉnh Tất Cả</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all' as const, label: 'Tất Cả', icon: Sparkles },
                  { id: 'avatar_frame' as const, label: 'Khung Avatar', icon: Orbit },
                  { id: 'entrance_animation' as const, label: 'Hoạt Ảnh Mở Đầu', icon: Zap },
                  { id: 'chat_border' as const, label: 'Viền Chat', icon: MessageSquare },
                  { id: 'name_border' as const, label: 'Viền Tên', icon: Tag },
                  { id: 'name_font' as const, label: 'Phông Chữ Tên', icon: Type },
                ].map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                          : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      }`}
                    >
                      <IconComp size={13} className={isSelected ? 'text-white' : 'text-purple-400'} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HAEVY_LITE_SHOP_ITEMS
                  .filter(item => activeCategory === 'all' || item.category === activeCategory)
                  .map((item) => {
                    const isUnlocked = unlockedHaevyLiteItems.includes(item.id);
                    const isActive = isItemActive(item);

                    return (
                      <div
                        key={item.id}
                        className={`relative p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3.5 ${
                          isActive
                            ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                            : isUnlocked
                            ? 'bg-zinc-900/80 border-emerald-500/40 hover:border-emerald-500'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {/* Top Item Badge & Price */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {item.badge}
                          </span>

                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300 font-mono text-xs font-bold">
                            <Coins size={13} className="text-amber-400" />
                            <span>{item.priceLiteCoins} Xu</span>
                          </div>
                        </div>

                        {/* Live Visual Preview Container */}
                        <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-850 flex flex-col items-center justify-center min-h-[95px] relative overflow-hidden">
                          {item.category === 'avatar_frame' && (
                            <div className="py-1">
                              <CosmicAvatarFX
                                avatarFrameId={item.id}
                                photoURL={user?.photoURL}
                                displayName={user?.displayName || 'Tài Khoản'}
                                size="md"
                                showBadge={false}
                              />
                            </div>
                          )}

                          {item.category === 'entrance_animation' && (
                            <div className="text-center space-y-1.5 py-1">
                              <div className="w-10 h-10 mx-auto rounded-full bg-zinc-900 border-2 border-purple-400 flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
                                {item.entranceIcon || '🌌'}
                              </div>
                              <button
                                type="button"
                                onClick={() => setPreviewAnimId(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>Xem thử hoạt ảnh</span>
                              </button>
                            </div>
                          )}

                          {item.category === 'chat_border' && (
                            <div className="w-full">
                              <div className={`p-2 rounded-xl text-[11px] max-w-[90%] ml-auto ${item.bubbleBgClass || 'bg-sky-600'} ${item.bubbleBorderClass || 'border border-cyan-400'} ${item.bubbleShadowClass || ''}`}>
                                <p className={`text-white font-medium ${item.bubbleTextGlowClass || ''}`}>
                                  Tin nhắn viền chat mẫu ✨
                                </p>
                              </div>
                            </div>
                          )}

                          {item.category === 'name_border' && (
                            <div className="w-full py-1 flex items-center justify-center">
                              <div className={`px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${item.nameplateBorderClass} ${item.nameplateBgClass}`}>
                                <span className="text-xs">{item.nameplateIcon}</span>
                                <span className={`text-xs font-black ${item.nameplateTextClass}`}>
                                  {user?.displayName || 'Tên Bạn'}
                                </span>
                              </div>
                            </div>
                          )}

                          {item.category === 'name_font' && (
                            <div className="w-full py-1.5 flex flex-col items-center justify-center text-center gap-1">
                              <span
                                className={`text-base font-bold tracking-wide ${item.fontGlowClass || 'text-white'}`}
                                style={{ fontFamily: item.fontFamilyName }}
                              >
                                {user?.displayName || item.fontPreviewText || 'Ha Khai 5429'}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Phông: {item.fontFamilyName?.split(',')[0]?.replace(/['"]/g, '')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Header */}
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                                Đang Dùng
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                            {item.tagline}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-zinc-800/80">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleUnequipCategory(item.category)}
                              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <X size={14} />
                              <span>Gỡ Bỏ</span>
                            </button>
                          ) : isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => handleEquipItem(item)}
                              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                            >
                              <Sparkles size={14} />
                              <span>Trang Bị Ngay</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isPurchasing}
                              onClick={() => handleUnlockItem(item)}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Coins size={13} className="text-amber-300" />
                              <span>Đổi {item.priceLiteCoins} Xu</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: NẠP XU VÀ XEM VIDEO QUẢNG CÁO (TOPUP & WATCH ADS)                 */}
          {/* ========================================================================= */}
          {activeTab === 'topup_and_ads' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Sub-toggle Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setTopupSubFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    topupSubFilter === 'all'
                      ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  ✨ Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => setTopupSubFilter('ads')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    topupSubFilter === 'ads'
                      ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  <Tv size={13} />
                  <span>Xem QC 30s (+50 Xu)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopupSubFilter('topup')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    topupSubFilter === 'topup'
                      ? 'bg-emerald-600 text-white font-black border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Gói Nạp Xu Haevy Lite</span>
                </button>
              </div>

              {/* 1. XEM QUẢNG CÁO 30S */}
              {(topupSubFilter === 'all' || topupSubFilter === 'ads') && (
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-amber-950/40 via-purple-950/30 to-zinc-950 border border-amber-500/30 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-bounce">
                    <Tv size={28} />
                  </div>

                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Xem Video Quảng Cáo 30 Giây Nhận +50 Xu
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Mỗi lượt xem trọn vẹn 30 giây quảng cáo tài trợ sẽ được cộng ngay <strong>+50 Xu Haevy Lite</strong> vào tài khoản của bạn.
                    </p>
                  </div>

                  {/* Coin Earnings Rate Details */}
                  <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto pt-1">
                    <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-400 block">Thời lượng</span>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono">30 Giây</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 text-center">
                      <span className="text-[10px] text-zinc-400 block">Thưởng mỗi lượt</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">+50 Xu</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-400 block">Giới hạn</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-400">Không Giới Hạn</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWatchingAd(true)}
                      className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-98 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Bắt Đầu Xem Quảng Cáo 30s Ngay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. GÓI NẠP XU */}
              {(topupSubFilter === 'all' || topupSubFilter === 'topup') && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white">Chọn Gói Nạp Xu Haevy Lite</h3>
                    <p className="text-[11px] text-zinc-400">Nạp nhanh qua VietQR, MoMo hoặc ZaloPay - Nhận Xu Haevy Lite lập tức</p>
                  </div>

                  {/* Packages Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HAEVY_LITE_TOPUP_PACKAGES.map((pkg) => {
                      const isSelected = selectedTopupPkg.id === pkg.id;
                      const totalCoins = pkg.coins + pkg.bonusCoins;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedTopupPkg(pkg)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-purple-950/30 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                              : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-300">{pkg.name}</span>
                            {pkg.tag && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {pkg.tag}
                              </span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                                {totalCoins.toLocaleString()}
                              </span>
                              <span className="text-xs font-bold text-zinc-400">Xu Lite</span>
                              {pkg.bonusCoins > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                  +{pkg.bonusCoins} tặng kèm
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400">{pkg.description}</p>
                          </div>

                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-white">
                              {pkg.priceVnd.toLocaleString()} đ
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-zinc-700'
                            }`}>
                              {isSelected && <Check size={10} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-zinc-300 block">Phương thức thanh toán</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'vietqr', label: 'VietQR' },
                        { id: 'momo', label: 'Ví MoMo' },
                        { id: 'zalopay', label: 'ZaloPay' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                            paymentMethod === m.id
                              ? 'border-sky-500 bg-sky-950/40 text-white'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topup Submit Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isPurchasing}
                      onClick={handleTopup}
                      className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Coins size={16} className="text-amber-300" />
                      <span>
                        Xác Nhận Nạp {selectedTopupPkg.coins + selectedTopupPkg.bonusCoins} Xu Lite ({selectedTopupPkg.priceVnd.toLocaleString()} đ)
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TÙY CHỈNH TẤT CẢ HIỆU ỨNG (CUSTOMIZER PANEL)                       */}
          {/* ========================================================================= */}
          {activeTab === 'customize' && (
            <HaevyLiteCustomizerPanel
              onGoToShop={() => setActiveTab('shop')}
              onShowMessage={setStatusMessage}
            />
          )}
        </div>

        {/* Live Preview Modal */}
        {previewAnimId && (
          <ProfileEntranceFX
            animationId={previewAnimId}
            userName={user?.displayName || 'Phi Hành Gia Haevy'}
            userPhoto={user?.photoURL}
            isOpen={Boolean(previewAnimId)}
            onClose={() => setPreviewAnimId(null)}
          />
        )}

        {/* Watch 30s Ad Modal */}
        <Watch30sAdModal
          isOpen={isWatchingAd}
          onClose={() => setIsWatchingAd(false)}
          onAdCompleted={(coinsEarned) => {
            setStatusMessage({
              type: 'success',
              text: `Bạn đã nhận được +${coinsEarned} Xu Haevy Lite từ lượt xem quảng cáo 30s!`
            });
          }}
        />
      </div>
    </div>
  );
}
