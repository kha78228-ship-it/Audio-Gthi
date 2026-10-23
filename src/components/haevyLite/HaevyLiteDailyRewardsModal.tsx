import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Gift,
  Sparkles,
  Coins,
  CheckCircle2,
  Flame,
  Trophy,
  Compass,
  RotateCw,
  ShoppingBag,
  Layers,
  Check,
  Eye,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HAEVY_LITE_SHOP_ITEMS, HaevyLiteShopItem } from './themeBundles';
import { haptics } from '../../utils/haptics';

interface DailyCheckinState {
  streak: number;
  lastClaimDate: string | null;
  claimedMissionsDate: string | null;
  claimedMissionIds: string[];
  lastWheelSpinDate: string | null;
  extraSpinsToday: number;
}

const CHECKIN_STORAGE_KEY = 'haevy_lite_daily_rewards_v2';

const SEVEN_DAY_REWARDS = [
  { day: 1, coins: 30, label: 'Ngày 1', badge: 'Khởi đầu' },
  { day: 2, coins: 40, label: 'Ngày 2', badge: 'Chăm chỉ' },
  { day: 3, coins: 60, label: 'Ngày 3', badge: 'Tăng tốc' },
  { day: 4, coins: 80, label: 'Ngày 4', badge: 'Bứt phá' },
  { day: 5, coins: 100, label: 'Ngày 5', badge: 'Bền bỉ' },
  { day: 6, coins: 130, label: 'Ngày 6', badge: 'Siêu cấp' },
  { day: 7, coins: 250, label: 'Ngày 7', badge: 'Rương Vũ Trụ 🌌' }
];

const WHEEL_PRIZES = [
  { id: 'w1', label: '+40 Xu Lite', coins: 40, color: 'from-purple-600 to-indigo-600', icon: '🪙' },
  { id: 'w2', label: '+80 Xu Lite', coins: 80, color: 'from-amber-500 to-orange-500', icon: '✨' },
  { id: 'w3', label: '+30 Xu Lite', coins: 30, color: 'from-sky-600 to-blue-600', icon: '💫' },
  { id: 'w4', label: '+150 Xu Lite', coins: 150, color: 'from-pink-600 to-rose-600', icon: '💎' },
  { id: 'w5', label: '+50 Xu Lite', coins: 50, color: 'from-emerald-600 to-teal-600', icon: '🌟' },
  { id: 'w6', label: 'JACKPOT +300 Xu', coins: 300, color: 'from-yellow-400 via-amber-500 to-red-500', icon: '👑' }
];

export interface CosmicComboBundle {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  accentGradient: string;
  itemIds: string[];
  discountPercent: number;
}

export const COSMIC_COMBO_BUNDLES: CosmicComboBundle[] = [
  {
    id: 'combo_nebula_supreme',
    name: 'Combo Tinh Vân Tối Thượng',
    tagline: 'Bộ tứ trang bị Thiên Hà Xoáy, Cổng Vũ Trụ, Viền Chat Tinh Vân & Sóng Nhạc',
    badge: 'TIẾT KIỆM 30%',
    accentGradient: 'from-purple-600 via-indigo-600 to-pink-500',
    itemIds: ['galaxy_swirl', 'cosmic_portal', 'chat_nebula_glow', 'wave_cosmic_pulse'],
    discountPercent: 30
  },
  {
    id: 'combo_royal_gold',
    name: 'Combo Hoàng Gia Ánh Kim',
    tagline: 'Phong cách Thượng Lưu với Khung Vàng Rồng, Cổng Hoàng Kim & Danh Hiệu Đế Vương',
    badge: 'HOT COMBO -30%',
    accentGradient: 'from-amber-500 via-yellow-500 to-orange-500',
    itemIds: ['solar_flare', 'supernova_burst', 'name_royal_gold', 'badge_cosmic_emperor'],
    discountPercent: 30
  },
  {
    id: 'combo_cyber_aurora',
    name: 'Combo Cực Quang Cyberpunk',
    tagline: 'Sắc màu tương lai với Khung Cực Quang, Chữ Nghệ Thuật Neon & Hào Quang Chuột',
    badge: 'ƯU ĐÃI -30%',
    accentGradient: 'from-cyan-500 via-blue-600 to-violet-600',
    itemIds: ['aurora_ring', 'wormhole_jump', 'font_cyber_neon', 'aura_stardust_trail'],
    discountPercent: 30
  }
];

interface HaevyLiteDailyRewardsPanelProps {
  onShowMessage?: (msg: { type: 'success' | 'error'; text: string }) => void;
  onTryComboItems?: (items: HaevyLiteShopItem[]) => void;
  onOpenWatchAd?: () => void;
  onOpenAuth?: () => void;
}

export function HaevyLiteDailyRewardsPanel({
  onShowMessage,
  onTryComboItems,
  onOpenWatchAd,
  onOpenAuth
}: HaevyLiteDailyRewardsPanelProps) {
  const {
    user,
    haevyLiteCoins = 0,
    unlockedHaevyLiteItems = [],
    earnHaevyLiteCoins,
    spendHaevyLiteCoins,
    unlockHaevyLiteItem,
    equipHaevyLiteItem
  } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [rewardState, setRewardState] = useState<DailyCheckinState>(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          streak: parsed.streak || 0,
          lastClaimDate: parsed.lastClaimDate || null,
          claimedMissionsDate: parsed.claimedMissionsDate || null,
          claimedMissionIds: parsed.claimedMissionsDate === todayStr ? (parsed.claimedMissionIds || []) : [],
          lastWheelSpinDate: parsed.lastWheelSpinDate || null,
          extraSpinsToday: parsed.lastWheelSpinDate === todayStr ? (parsed.extraSpinsToday || 0) : 0
        };
      }
    } catch {}
    return {
      streak: 0,
      lastClaimDate: null,
      claimedMissionsDate: todayStr,
      claimedMissionIds: [],
      lastWheelSpinDate: null,
      extraSpinsToday: 0
    };
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<typeof WHEEL_PRIZES[0] | null>(null);
  const [isUnlockingComboId, setIsUnlockingComboId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(rewardState));
    } catch {}
  }, [rewardState]);

  const isCheckedInToday = rewardState.lastClaimDate === todayStr;
  const currentDayIndex = isCheckedInToday
    ? ((rewardState.streak - 1) % 7) + 1
    : (rewardState.streak % 7) + 1;

  const handleDailyCheckin = async () => {
    if (!user) {
      onOpenAuth?.();
      onShowMessage?.({ type: 'error', text: 'Vui lòng đăng nhập để điểm danh nhận Xu Haevy Lite mỗi ngày!' });
      return;
    }
    if (isCheckedInToday) {
      onShowMessage?.({ type: 'error', text: 'Bạn đã điểm danh hôm nay rồi! Hãy quay lại vào ngày mai nhé.' });
      return;
    }

    const rewardObj = SEVEN_DAY_REWARDS[currentDayIndex - 1] || SEVEN_DAY_REWARDS[0];
    haptics?.success?.();

    try {
      if (earnHaevyLiteCoins) {
        await earnHaevyLiteCoins(rewardObj.coins, `Điểm danh Haevy Lite ${rewardObj.label} (Chuỗi ${rewardState.streak + 1} ngày)`);
      }
      setRewardState(prev => ({
        ...prev,
        streak: prev.streak + 1,
        lastClaimDate: todayStr
      }));
      onShowMessage?.({
        type: 'success',
        text: `🎉 Điểm danh ${rewardObj.label} thành công! Bạn nhận được +${rewardObj.coins} Xu Haevy Lite.`
      });
    } catch (e: any) {
      onShowMessage?.({ type: 'error', text: e.message || 'Lỗi khi điểm danh nhận Xu.' });
    }
  };

  const DAILY_MISSIONS = [
    {
      id: 'mission_tryon',
      title: 'Ướm thử vật phẩm tại Phòng Thử Đồ Live',
      desc: 'Trải nghiệm xem trước khung avatar, viền chat hoặc sóng nhạc bất kỳ',
      rewardCoins: 35,
      icon: Eye,
      color: 'text-purple-400'
    },
    {
      id: 'mission_internet',
      title: 'Đọc báo hoặc Tóm tắt AI trên Haevy Internet',
      desc: 'Khám phá tri thức mỗi ngày với trình duyệt toàn màn hình Haevy Internet',
      rewardCoins: 50,
      icon: Compass,
      color: 'text-cyan-400'
    },
    {
      id: 'mission_edu',
      title: 'Ôn tập Flashcard hoặc Pomodoro trên Haevy Edu',
      desc: 'Hoàn thành 1 phiên tập trung tại Bàn học All-in-One Haevy Edu',
      rewardCoins: 60,
      icon: Flame,
      color: 'text-amber-400'
    },
    {
      id: 'mission_equip',
      title: 'Đồng bộ trang bị hiệu ứng yêu thích',
      desc: 'Kích hoạt ít nhất 1 hiệu ứng Haevy Lite cho tài khoản của bạn',
      rewardCoins: 45,
      icon: Sparkles,
      color: 'text-emerald-400'
    }
  ];

  const handleClaimMission = async (mission: typeof DAILY_MISSIONS[0]) => {
    if (!user) {
      onOpenAuth?.();
      onShowMessage?.({ type: 'error', text: 'Vui lòng đăng nhập để nhận thưởng nhiệm vụ!' });
      return;
    }
    if (rewardState.claimedMissionIds.includes(mission.id)) return;

    haptics?.success?.();
    try {
      if (earnHaevyLiteCoins) {
        await earnHaevyLiteCoins(mission.rewardCoins, `Hoàn thành nhiệm vụ ngày: ${mission.title}`);
      }
      setRewardState(prev => ({
        ...prev,
        claimedMissionsDate: todayStr,
        claimedMissionIds: [...prev.claimedMissionIds, mission.id]
      }));
      onShowMessage?.({
        type: 'success',
        text: `✨ Đã nhận +${mission.rewardCoins} Xu Lite từ nhiệm vụ "${mission.title}"!`
      });
    } catch (e: any) {
      onShowMessage?.({ type: 'error', text: 'Không thể nhận thưởng nhiệm vụ lúc này.' });
    }
  };

  const hasFreeSpinToday = rewardState.lastWheelSpinDate !== todayStr;

  const handleSpinWheel = async () => {
    if (!user) {
      onOpenAuth?.();
      onShowMessage?.({ type: 'error', text: 'Vui lòng đăng nhập để quay Vòng Quay Ngân Hà!' });
      return;
    }
    if (isSpinning) return;

    const spinCost = hasFreeSpinToday ? 0 : 40;
    if (spinCost > 0 && haevyLiteCoins < spinCost) {
      onShowMessage?.({
        type: 'error',
        text: `Bạn đã dùng lượt miễn phí hôm nay. Cần ${spinCost} Xu Lite để quay thêm!`
      });
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);
    haptics?.medium?.();

    try {
      if (spinCost > 0 && spendHaevyLiteCoins) {
        const spendRes = await spendHaevyLiteCoins(spinCost, 'Quay thêm Vòng Quay Ngân Hà Haevy Lite');
        if (!spendRes.success) {
          setIsSpinning(false);
          onShowMessage?.({ type: 'error', text: spendRes.message });
          return;
        }
      }

      const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
      const selectedPrize = WHEEL_PRIZES[prizeIndex];
      const sliceAngle = 360 / WHEEL_PRIZES.length;
      const targetDeg = wheelRotation + 360 * 5 + (360 - prizeIndex * sliceAngle);
      setWheelRotation(targetDeg);

      setTimeout(async () => {
        if (earnHaevyLiteCoins) {
          await earnHaevyLiteCoins(selectedPrize.coins, `Trúng thưởng Vòng Quay Ngân Hà: ${selectedPrize.label}`);
        }
        setRewardState(prev => ({
          ...prev,
          lastWheelSpinDate: todayStr,
          extraSpinsToday: hasFreeSpinToday ? prev.extraSpinsToday : prev.extraSpinsToday + 1
        }));
        setWonPrize(selectedPrize);
        setIsSpinning(false);
        haptics?.success?.();
        onShowMessage?.({
          type: 'success',
          text: `🎉 Chúc mừng! Vòng Quay Ngân Hà mang về cho bạn ${selectedPrize.label}!`
        });
      }, 2600);
    } catch (e: any) {
      setIsSpinning(false);
      onShowMessage?.({ type: 'error', text: 'Lỗi khi quay thưởng.' });
    }
  };

  const handleUnlockCombo = async (combo: CosmicComboBundle, items: HaevyLiteShopItem[], discountedPrice: number) => {
    if (!user) {
      onOpenAuth?.();
      onShowMessage?.({ type: 'error', text: 'Vui lòng đăng nhập để mở khóa Gói Combo Vũ Trụ!' });
      return;
    }

    const lockedItems = items.filter(i => !unlockedHaevyLiteItems.includes(i.id));
    if (lockedItems.length === 0) {
      // Just equip all items in the combo
      for (const item of items) {
        if (equipHaevyLiteItem) {
          await equipHaevyLiteItem(item.category, item.id);
        }
      }
      window.dispatchEvent(new CustomEvent('haevy:lite-equipment-updated'));
      onShowMessage?.({ type: 'success', text: `✨ Đã trang bị đồng bộ toàn bộ "${combo.name}"!` });
      return;
    }

    if (haevyLiteCoins < discountedPrice) {
      onShowMessage?.({
        type: 'error',
        text: `Bạn cần ${discountedPrice} Xu Lite để mở khóa gói "${combo.name}" (hiện có ${haevyLiteCoins} Xu).`
      });
      return;
    }

    setIsUnlockingComboId(combo.id);
    try {
      // Unlock first locked item with the bundle discounted price, and unlock the rest for 0 cost
      for (let idx = 0; idx < lockedItems.length; idx++) {
        const item = lockedItems[idx];
        const costToCharge = idx === 0 ? discountedPrice : 0;
        if (unlockHaevyLiteItem) {
          const res = await unlockHaevyLiteItem(item.id, costToCharge);
          if (!res.success && idx === 0) {
            onShowMessage?.({ type: 'error', text: res.message });
            setIsUnlockingComboId(null);
            return;
          }
        }
      }

      // Equip all items in the combo immediately
      for (const item of items) {
        if (equipHaevyLiteItem) {
          await equipHaevyLiteItem(item.category, item.id);
        }
      }

      window.dispatchEvent(new CustomEvent('haevy:lite-equipment-updated'));
      haptics?.success?.();
      onShowMessage?.({
        type: 'success',
        text: `🌌 Đã mở khóa & trang bị trọn bộ "${combo.name}" (Tiết kiệm 30% Xu)!`
      });
    } catch (e: any) {
      onShowMessage?.({ type: 'error', text: e.message || 'Lỗi khi mở khóa gói Combo.' });
    } finally {
      setIsUnlockingComboId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 7-DAY DAILY CHECK-IN & LUCKY WHEEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: 7-Day Check-In Calendar */}
        <div className="lg:col-span-7 rounded-3xl bg-zinc-950 border border-purple-500/30 p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <CalendarCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Điểm Danh 7 Ngày Nhận Xu Lite
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black font-mono">
                    Chuỗi {rewardState.streak} ngày 🔥
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Điểm danh liên tiếp mỗi ngày để mở Rương Vũ Trụ +250 Xu vào Ngày 7
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDailyCheckin}
              disabled={isCheckedInToday}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                isCheckedInToday
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 shadow-amber-500/25 active:scale-95'
              }`}
            >
              {isCheckedInToday ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Đã Điểm Danh Hôm Nay</span>
                </>
              ) : (
                <>
                  <Gift size={15} />
                  <span>Điểm Danh Nhận +{SEVEN_DAY_REWARDS[currentDayIndex - 1]?.coins || 30} Xu</span>
                </>
              )}
            </button>
          </div>

          {/* 7 Days Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {SEVEN_DAY_REWARDS.map((item) => {
              const isPastClaimed = isCheckedInToday
                ? item.day <= currentDayIndex
                : item.day < currentDayIndex;
              const isTodayTarget = !isCheckedInToday && item.day === currentDayIndex;
              const isDay7 = item.day === 7;

              return (
                <div
                  key={item.day}
                  onClick={() => {
                    if (isTodayTarget) handleDailyCheckin();
                  }}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all relative ${
                    isPastClaimed
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : isTodayTarget
                      ? 'bg-gradient-to-b from-purple-900/60 to-zinc-900 border-amber-400 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50 cursor-pointer scale-[1.02]'
                      : isDay7
                      ? 'bg-gradient-to-b from-indigo-950/50 to-zinc-950 border-purple-500/40 text-purple-200'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {item.label}
                  </span>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black ${
                    isPastClaimed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isTodayTarget
                      ? 'bg-amber-400/20 text-amber-300 animate-bounce'
                      : 'bg-zinc-950 text-amber-400'
                  }`}>
                    {isPastClaimed ? <Check size={18} /> : isDay7 ? '🌌' : '🪙'}
                  </div>

                  <div>
                    <div className="text-xs font-black font-mono text-white">
                      +{item.coins} Xu
                    </div>
                    <div className="text-[9px] text-zinc-400 truncate max-w-[70px]">
                      {item.badge}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Missions List */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-400" />
                <span>Nhiệm Vụ Kiếm Xu Miễn Phí Mỗi Ngày</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Đã nhận: {rewardState.claimedMissionIds.length}/{DAILY_MISSIONS.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DAILY_MISSIONS.map((m) => {
                const IconComp = m.icon;
                const isClaimed = rewardState.claimedMissionIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 ${m.color}`}>
                        <IconComp size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{m.title}</div>
                        <div className="text-[10px] text-amber-300 font-mono font-bold">+{m.rewardCoins} Xu Lite</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimMission(m)}
                      disabled={isClaimed}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition cursor-pointer ${
                        isClaimed
                          ? 'bg-zinc-800 text-emerald-400 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm active:scale-95'
                      }`}
                    >
                      {isClaimed ? 'Đã Nhận ✓' : 'Nhận Xu'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Cosmic Lucky Wheel */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-zinc-950 to-zinc-950 border border-indigo-500/40 p-5 sm:p-6 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="text-left">
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400" />
                <span>Vòng Quay Ngân Hà May Mắn</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Tặng 1 lượt quay miễn phí mỗi ngày • Cơ hội trúng Jackpot +300 Xu
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black font-mono">
              {hasFreeSpinToday ? '1 Lượt FREE' : '40 Xu / Lượt'}
            </span>
          </div>

          {/* Interactive Wheel Visual */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Top Pointer */}
            <div className="absolute -top-3 z-20 w-6 h-6 bg-amber-400 rotate-45 rounded-sm shadow-lg border-2 border-zinc-950" />

            <div
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
              }}
              className="w-52 h-52 sm:w-56 sm:h-56 rounded-full border-4 border-purple-500/60 shadow-[0_0_40px_rgba(168,85,247,0.35)] bg-zinc-900 relative overflow-hidden flex items-center justify-center"
            >
              {WHEEL_PRIZES.map((prize, idx) => {
                const rotation = idx * (360 / WHEEL_PRIZES.length);
                return (
                  <div
                    key={prize.id}
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="absolute inset-0 flex flex-col items-center justify-start pt-3 pointer-events-none"
                  >
                    <span className="text-base">{prize.icon}</span>
                    <span className="text-[10px] font-black text-white font-mono bg-zinc-950/80 px-1.5 py-0.5 rounded-full border border-zinc-700 mt-0.5">
                      +{prize.coins}
                    </span>
                  </div>
                );
              })}

              {/* Center Hub */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border-4 border-zinc-950 shadow-xl flex items-center justify-center text-white font-black text-xs z-10">
                HAEVY
              </div>
            </div>
          </div>

          {wonPrize && (
            <div className="w-full p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black animate-bounce">
              🎉 Bạn vừa quay trúng: {wonPrize.label}!
            </div>
          )}

          <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RotateCw size={15} className={isSpinning ? 'animate-spin' : ''} />
              <span>
                {isSpinning
                  ? 'Đang Quay Ngân Hà...'
                  : hasFreeSpinToday
                  ? 'Quay Ngay (Miễn Phí Hôm Nay)'
                  : 'Quay Tiếp (40 Xu Lite)'}
              </span>
            </button>

            {onOpenWatchAd && (
              <button
                type="button"
                onClick={onOpenWatchAd}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-xs font-bold whitespace-nowrap cursor-pointer transition"
              >
                +50 Xu (Xem QC)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. COSMIC COMBO BUNDLES (-30% DISCOUNT) */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center text-zinc-950 shadow-lg">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Gói Combo Trang Bị Vũ Trụ Đồng Bộ (Giảm 30% Xu)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase">
                  Combo Ưu Đãi
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Mở khóa trọn bộ 4 hiệu ứng phối sẵn và tự động kích hoạt đồng bộ chỉ với 1 chạm
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COSMIC_COMBO_BUNDLES.map((combo) => {
            const bundleItems = combo.itemIds
              .map(id => HAEVY_LITE_SHOP_ITEMS.find(i => i.id === id))
              .filter(Boolean) as HaevyLiteShopItem[];

            const originalTotal = bundleItems.reduce((sum, item) => sum + item.priceLiteCoins, 0);
            const remainingItems = bundleItems.filter(i => !unlockedHaevyLiteItems.includes(i.id));
            const remainingOriginal = remainingItems.reduce((sum, item) => sum + item.priceLiteCoins, 0);
            const discountedCost = Math.round(remainingOriginal * (1 - combo.discountPercent / 100));
            const isAllOwned = remainingItems.length === 0;

            return (
              <div
                key={combo.id}
                className="rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-purple-500/50 p-5 flex flex-col justify-between gap-4 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${combo.accentGradient}`}>
                      {combo.badge}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {!isAllOwned && (
                        <span className="text-zinc-500 line-through text-[11px]">{originalTotal} Xu</span>
                      )}
                      <span className="font-black text-amber-300">
                        {isAllOwned ? 'Đã Sở Hữu Trọn Bộ' : `${discountedCost} Xu`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">{combo.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{combo.tagline}</p>
                  </div>

                  <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/80">
                    <div className="text-[10px] font-bold uppercase text-zinc-400">
                      Bao gồm {bundleItems.length} vật phẩm:
                    </div>
                    {bundleItems.map((bItem) => {
                      const owned = unlockedHaevyLiteItems.includes(bItem.id);
                      return (
                        <div key={bItem.id} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200 font-medium truncate">{bItem.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            owned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {owned ? 'Đã có ✓' : `${bItem.priceLiteCoins} Xu`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {onTryComboItems && (
                    <button
                      type="button"
                      onClick={() => {
                        onTryComboItems(bundleItems);
                        haptics?.selection?.();
                      }}
                      className="px-3 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <Eye size={14} />
                      <span>Thử Bộ Này</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleUnlockCombo(combo, bundleItems, discountedCost)}
                    disabled={isUnlockingComboId === combo.id}
                    className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 ${
                      isAllOwned
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : `bg-gradient-to-r ${combo.accentGradient} text-white hover:brightness-110`
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>
                      {isUnlockingComboId === combo.id
                        ? 'Đang kích hoạt...'
                        : isAllOwned
                        ? 'Trang Bị Cả Bộ'
                        : `Mở Khóa (${discountedCost} Xu)`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
