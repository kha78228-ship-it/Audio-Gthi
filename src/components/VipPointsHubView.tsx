import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Headphones, 
  Radio, 
  Volume2, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Download, 
  Gift, 
  Flame, 
  History, 
  Award,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VipTier, PointTransaction } from '../types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface VipPointsHubViewProps {
  onOpenAuth: () => void;
  onGoToTopup?: () => void;
}

export function VipPointsHubView({ onOpenAuth, onGoToTopup }: VipPointsHubViewProps) {
  const { 
    user, 
    audioPoints, 
    totalEarnedPoints, 
    totalListenedMinutes, 
    lastDailyCheckin,
    vipTier, 
    vipExpiresAt, 
    isVip, 
    vipSettings,
    performDailyCheckin,
    redeemVipWithPoints,
    activateTrialVip,
    updateVipSettings,
  } = useAuth();

  const [checkinLoading, setCheckinLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = lastDailyCheckin === todayStr;

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      setLoadingHistory(true);
      try {
        const q = query(
          collection(db, 'users', user.uid, 'pointTransactions'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        const txs: PointTransaction[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || '',
            amount: data.amount || 0,
            type: data.type || 'bonus',
            createdAt: data.createdAt,
          };
        });
        setTransactions(txs);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchTransactions();
  }, [user, audioPoints]);

  const handleDailyCheckin = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setCheckinLoading(true);
    setMessage(null);
    const res = await performDailyCheckin();
    setCheckinLoading(false);
    setMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handleRedeem = async (tier: VipTier, days: number, cost: number) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setRedeemLoading(`${tier}-${days}`);
    setMessage(null);
    const res = await redeemVipWithPoints(tier, days, cost);
    setRedeemLoading(null);
    setMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handleTrial = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    await activateTrialVip();
    setMessage({
      type: 'success',
      text: 'Đã kích hoạt thành công 3 ngày dùng thử đặc quyền VIP miễn phí!',
    });
  };

  const formatExpiresDate = (isoStr: string | null) => {
    if (!isoStr) return 'Vĩnh viễn';
    const date = new Date(isoStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-36 sm:pb-40">
      {/* Top Banner: Status Overview */}
      <div 
        id="vip-hub-hero"
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border shadow-2xl transition-all ${
          isVip
            ? 'bg-gradient-to-r from-amber-950/50 via-zinc-900 to-zinc-900 border-amber-500/40 shadow-amber-500/10'
            : 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border-zinc-800 shadow-xl'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-700 text-xs font-semibold">
              <Crown size={15} className={isVip ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'} />
              <span className={isVip ? 'text-amber-300 font-bold' : 'text-zinc-300'}>
                {isVip 
                  ? (vipTier === 'vip_master' ? 'Thành viên VIP MASTER Hoàng Gia' : 'Thành viên VIP Cao Cấp') 
                  : 'Tài khoản Miễn phí'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Điểm Audio & Đặc quyền VIP
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Tích lũy Điểm Audio qua từng phút nghe nhạc để mở khóa chất lượng âm thanh Hi-Fi Lossless, Spatial 3D Sound và huy hiệu VIP danh giá.
            </p>

            {isVip && (
              <div className="pt-1 flex items-center gap-2 text-xs font-medium text-amber-300/90">
                <Clock size={14} />
                <span>Hạn đặc quyền VIP: {formatExpiresDate(vipExpiresAt)}</span>
              </div>
            )}
          </div>

          {/* User Points Card */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center min-w-[280px] shadow-2xl backdrop-blur-md shrink-0 text-center">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
              <Coins size={28} />
            </div>

            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">
              Số dư Điểm Audio
            </span>
            <div className="text-4xl font-extrabold text-white my-1 font-mono tracking-tight text-amber-400">
              {audioPoints.toLocaleString()} <span className="text-lg text-zinc-400 font-normal">pts</span>
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center gap-3 mt-2 border-t border-zinc-800/80 pt-2 w-full justify-center">
              <span>Đã tích lũy: <strong className="text-zinc-300">{totalEarnedPoints}</strong></span>
              <span>•</span>
              <span>Thời gian nghe: <strong className="text-zinc-300">{totalListenedMinutes}m</strong></span>
            </div>

            {/* Daily checkin trigger */}
            <button
              id="daily-checkin-btn"
              onClick={handleDailyCheckin}
              disabled={checkinLoading || hasCheckedInToday}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                hasCheckedInToday
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 font-extrabold shadow-amber-500/20'
              }`}
            >
              {checkinLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : hasCheckedInToday ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Đã điểm danh hôm nay</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Điểm danh (+{isVip ? '100' : '50'} pts)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global alert feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* VIP Privileges Configuration Section */}
      <section id="vip-privileges-settings-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders size={20} className="text-amber-400" />
              <span>Cài đặt Đặc quyền VIP</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Tùy chỉnh các tính năng âm thanh nâng cao và hiệu ứng hiển thị
            </p>
          </div>

          {!isVip && (
            <button
              onClick={handleTrial}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl transition-all"
            >
              <Zap size={14} />
              <span>Kích hoạt 3 ngày VIP Miễn phí</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Setting: HiFi Lossless */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Radio size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Chất lượng âm thanh Hi-Fi Lossless</h4>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Mở khóa bitrate 320kbps chuẩn phòng thu studio, tái tạo chi tiết dải âm trung thực.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isVip) {
                  setMessage({ type: 'error', text: 'Tính năng này yêu cầu tài khoản VIP. Hãy đổi điểm để kích hoạt!' });
                  return;
                }
                updateVipSettings({ hifiMode: !vipSettings.hifiMode });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isVip && vipSettings.hifiMode ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isVip && vipSettings.hifiMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Setting: Spatial 3D Audio */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Headphones size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Âm thanh Vòm Spatial 3D</h4>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Không gian âm thanh đa hướng sống động mô phỏng thính phòng hòa nhạc.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isVip) {
                  setMessage({ type: 'error', text: 'Tính năng này yêu cầu tài khoản VIP.' });
                  return;
                }
                updateVipSettings({ spatial3D: !vipSettings.spatial3D });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isVip && vipSettings.spatial3D ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isVip && vipSettings.spatial3D ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Setting: Bass Boost */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <Volume2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Equalizer Dynamic Bass Boost</h4>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Tăng cường dải âm trầm mạnh mẽ, sâu lắng cho các dòng nhạc điện tử và lo-fi.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isVip) {
                  setMessage({ type: 'error', text: 'Tính năng này yêu cầu tài khoản VIP.' });
                  return;
                }
                updateVipSettings({ bassBoost: !vipSettings.bassBoost });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isVip && vipSettings.bassBoost ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isVip && vipSettings.bassBoost ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Setting: Golden VIP Badge in Community */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Crown size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Huy hiệu VIP Hoàng Gia trong Cộng đồng</h4>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Hiển thị vương miện hoàng kim và viền phát sáng bên cạnh tên bạn trong mọi bài viết & bình luận.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isVip) {
                  setMessage({ type: 'error', text: 'Tính năng này yêu cầu tài khoản VIP.' });
                  return;
                }
                updateVipSettings({ showVipBadge: !vipSettings.showVipBadge });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isVip && vipSettings.showVipBadge ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isVip && vipSettings.showVipBadge ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Direct VIP Recharge Banner */}
      {onGoToTopup && (
        <div 
          id="vip-topup-promo-card"
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-yellow-950/40 border-2 border-amber-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles size={13} className="text-amber-400" />
              <span>Gói Nạp Trực Tiếp Giá Rẻ - Siêu Tiết Kiệm</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Nạp VIP Trực Tiếp Chỉ Từ <span className="text-amber-400">15.000đ</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Gói Tuần 15k • Gói Tháng 20k • 3 Tháng 45k • 6 Tháng 80k • 1 Năm 150k. Hỗ trợ nhập mã ưu đãi giảm tới 50%!
            </p>
          </div>

          <button
            type="button"
            id="hub-goto-topup-btn"
            onClick={onGoToTopup}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Crown size={18} className="fill-black" />
            <span>Mở Trang Nạp VIP & Nhập Mã</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Points Exchange: Redeem VIP Packages */}
      <section id="vip-redeem-store-section" className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift size={20} className="text-amber-400" />
              <span>Cửa hàng Đổi Gói VIP bằng Điểm Audio</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Dùng điểm thưởng nghe nhạc của bạn để kích hoạt thời gian đặc quyền
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Package 7 days */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Trải nghiệm tuần
              </span>
              <h3 className="text-2xl font-extrabold text-white">Gói VIP 7 Ngày</h3>
              <div className="text-3xl font-extrabold text-amber-400 my-3 font-mono">
                250 <span className="text-sm text-zinc-400 font-normal">pts</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300 mt-4 border-t border-zinc-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Âm thanh chuẩn Hi-Fi Lossless</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Âm thanh vòm Spatial 3D</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Nhân đôi (+2X) điểm thưởng nghe nhạc</span>
                </li>
              </ul>
            </div>

            <button
              id="redeem-vip-7d-btn"
              onClick={() => handleRedeem('vip', 7, 250)}
              disabled={redeemLoading === 'vip-7' || audioPoints < 250}
              className="mt-6 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all border border-zinc-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {redeemLoading === 'vip-7' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>Đổi 7 Ngày VIP</span>
              )}
            </button>
          </div>

          {/* Package 30 days (POPULAR) */}
          <div className="bg-gradient-to-b from-amber-950/30 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-2xl relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider">
              Phổ biến nhất
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Gói tháng tiết kiệm
              </span>
              <h3 className="text-2xl font-extrabold text-white">Gói VIP 30 Ngày</h3>
              <div className="text-3xl font-extrabold text-amber-400 my-3 font-mono">
                800 <span className="text-sm text-zinc-400 font-normal">pts</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300 mt-4 border-t border-zinc-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Toàn bộ đặc quyền Hi-Fi & Spatial 3D</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Huy hiệu Vương miện VIP Cộng đồng</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Tải nhạc Offline trực tiếp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Truy cập kho nhạc độc quyền VIP</span>
                </li>
              </ul>
            </div>

            <button
              id="redeem-vip-30d-btn"
              onClick={() => handleRedeem('vip', 30, 800)}
              disabled={redeemLoading === 'vip-30' || audioPoints < 800}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {redeemLoading === 'vip-30' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>Đổi 30 Ngày VIP</span>
              )}
            </button>
          </div>

          {/* Package 90 days MASTER */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                Đẳng cấp Thượng Lưu
              </span>
              <h3 className="text-2xl font-extrabold text-white">Gói VIP MASTER 90 Ngày</h3>
              <div className="text-3xl font-extrabold text-purple-400 my-3 font-mono">
                2,000 <span className="text-sm text-zinc-400 font-normal">pts</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300 mt-4 border-t border-zinc-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Tất cả đặc quyền VIP cao nhất</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Huy hiệu VIP Master phát sáng hiệu ứng Aura</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                  <span>Ưu tiên xuất bản bài hát lên Top Thịnh hành</span>
                </li>
              </ul>
            </div>

            <button
              id="redeem-vip-90d-btn"
              onClick={() => handleRedeem('vip_master', 90, 2000)}
              disabled={redeemLoading === 'vip_master-90' || audioPoints < 2000}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all border border-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {redeemLoading === 'vip_master-90' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>Đổi 90 Ngày VIP Master</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Ways to Earn Points Section */}
      <section id="how-to-earn-points-section" className="space-y-4">
        <div className="border-b border-zinc-800/80 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame size={20} className="text-orange-400" />
            <span>Nhiệm vụ & Cách kiếm Điểm Audio</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Hoàn thành các hoạt động thường nhật để tích lũy điểm thưởng không giới hạn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nghe nhạc mỗi ngày</h4>
              <p className="text-xs text-zinc-400 mt-0.5">+10 pts mỗi 5 phút nghe ({isVip ? 'VIP nhận +20 pts' : 'VIP nhận x2'})</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Điểm danh 24h</h4>
              <p className="text-xs text-zinc-400 mt-0.5">+50 pts mỗi ngày ({isVip ? 'VIP nhận +100 pts' : '+100 pts nếu là VIP'})</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Coins size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Đóng góp Audio</h4>
              <p className="text-xs text-zinc-400 mt-0.5">+100 pts cho mỗi bài hát được chia sẻ vào kho</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Award size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Tương tác Cộng đồng</h4>
              <p className="text-xs text-zinc-400 mt-0.5">+20 pts mỗi bài viết chia sẻ cảm xúc âm nhạc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Point Transactions History */}
      {user && (
        <section id="point-transactions-history-section" className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History size={20} className="text-zinc-400" />
              <span>Lịch sử Biến động Điểm Audio</span>
            </h2>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8">
              <Loader2 size={24} className="animate-spin text-zinc-500 mx-auto" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-xs text-zinc-500">
              Chưa có lịch sử giao dịch điểm.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl divide-y divide-zinc-800/80 overflow-hidden shadow-lg">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      tx.amount >= 0
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {tx.amount >= 0 ? <Coins size={16} /> : <Crown size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.title}</p>
                      <span className="text-[11px] text-zinc-500">
                        {tx.type === 'checkin' && 'Điểm danh hằng ngày'}
                        {tx.type === 'listen' && 'Thưởng nghe nhạc'}
                        {tx.type === 'redeem_vip' && 'Đổi gói đặc quyền VIP'}
                        {tx.type === 'upload' && 'Đóng góp audio mới'}
                        {tx.type === 'post' && 'Chia sẻ cộng đồng'}
                        {tx.type === 'bonus' && 'Thưởng hệ thống'}
                      </span>
                    </div>
                  </div>

                  <span className={`font-bold font-mono text-sm sm:text-base ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
