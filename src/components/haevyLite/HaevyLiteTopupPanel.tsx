import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tv, 
  Coins, 
  Play, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Loader2, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { haptics } from '../../utils/haptics';
import { HAEVY_LITE_TOPUP_PACKAGES, HaevyLiteTopupPackage } from './themeBundles';
import { Watch30sAdModal } from './Watch30sAdModal';

interface HaevyLiteTopupPanelProps {
  subFilter?: 'all' | 'ads' | 'topup';
  onSubFilterChange?: (filter: 'all' | 'ads' | 'topup') => void;
  onShowMessage?: (msg: { type: 'success' | 'error'; text: string }) => void;
  onGoToShop?: () => void;
  onOpenAuth?: () => void;
}

export function HaevyLiteTopupPanel({
  subFilter,
  onSubFilterChange,
  onShowMessage,
  onGoToShop,
  onOpenAuth
}: HaevyLiteTopupPanelProps) {
  const {
    user,
    haevyLiteCoins = 0,
    purchaseHaevyLitePackage
  } = useAuth();

  const [internalSubFilter, setInternalSubFilter] = useState<'all' | 'ads' | 'topup'>('all');
  const activeSubFilter = subFilter !== undefined ? subFilter : internalSubFilter;
  const setTopupSubFilter = (filter: 'all' | 'ads' | 'topup') => {
    if (onSubFilterChange) {
      onSubFilterChange(filter);
    } else {
      setInternalSubFilter(filter);
    }
  };

  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedTopupPkg, setSelectedTopupPkg] = useState<HaevyLiteTopupPackage>(HAEVY_LITE_TOPUP_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay'>('vietqr');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent?: number;
    discountFixed?: number;
    desc: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Clipboard copy state
  const [copiedBankInfo, setCopiedBankInfo] = useState<string | null>(null);

  // Recent Xu Haevy Lite transactions
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setRecentTransactions([]);
      return;
    }
    try {
      const q = query(
        collection(db, 'users', user.uid, 'pointTransactions'),
        orderBy('createdAt', 'desc'),
        limit(25)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(tx => 
            tx.title?.includes('Lite') || 
            tx.title?.includes('Vũ Trụ') || 
            tx.title?.includes('Combo') ||
            tx.title?.includes('quảng cáo') ||
            tx.title?.includes('Xu')
          );
        setRecentTransactions(list);
      }, (err) => {
        console.warn('Sync transactions error:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Recent transaction listener setup failed:', e);
    }
  }, [user]);

  // Calculations for payment & promo discounts
  const discountVnd = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountPercent) {
      return Math.round((selectedTopupPkg.priceVnd * appliedPromo.discountPercent) / 100);
    }
    if (appliedPromo.discountFixed) {
      return Math.min(appliedPromo.discountFixed, selectedTopupPkg.priceVnd);
    }
    return 0;
  }, [appliedPromo, selectedTopupPkg]);

  const finalAmount = Math.max(0, selectedTopupPkg.priceVnd - discountVnd);
  const totalAwardedCoins = selectedTopupPkg.coins + (selectedTopupPkg.bonusCoins || 0);

  const transferContent = useMemo(() => {
    const cleanUid = (user?.uid || 'GUEST').slice(0, 8).toUpperCase();
    return `LITE ${selectedTopupPkg.id.toUpperCase()} ${cleanUid}`;
  }, [user, selectedTopupPkg]);

  const qrImageUrl = useMemo(() => {
    return `https://api.vietqr.io/image/970423-0795249860-tM388QO.jpg?amount=${finalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=HA%20QUANG%20KHAI`;
  }, [finalAmount, transferContent]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(label);
    haptics?.selection?.();
    setTimeout(() => setCopiedBankInfo(null), 2000);
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError(null);
    if (!code) {
      setPromoError('Vui lòng nhập mã ưu đãi!');
      return;
    }
    if (code === 'LITE2026') {
      setAppliedPromo({ code: 'LITE2026', discountPercent: 20, desc: 'Ưu đãi 20% thanh toán Xu Haevy Lite' });
      onShowMessage?.({ type: 'success', text: 'Áp dụng mã LITE2026 giảm 20% thành công!' });
    } else if (code === 'VIP2026' || code === 'HE2026') {
      setAppliedPromo({ code, discountFixed: 10000, desc: 'Giảm 10.000đ khi nạp gói Xu' });
      onShowMessage?.({ type: 'success', text: `Áp dụng mã ${code} giảm 10.000đ thành công!` });
    } else {
      setPromoError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const handleTopup = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      onShowMessage?.({ type: 'error', text: 'Vui lòng đăng nhập để nạp Xu Haevy Lite!' });
      return;
    }

    setIsPurchasing(true);
    try {
      if (purchaseHaevyLitePackage) {
        const res = await purchaseHaevyLitePackage({
          pkg: selectedTopupPkg,
          finalAmount,
          paymentMethod
        });
        if (res.success) {
          onShowMessage?.({ type: 'success', text: res.message });
          if (onGoToShop) onGoToShop();
        } else {
          onShowMessage?.({ type: 'error', text: res.message });
        }
      }
    } catch (e: any) {
      onShowMessage?.({ type: 'error', text: e.message || 'Lỗi nạp Xu Haevy Lite.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-toggle Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setTopupSubFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubFilter === 'all'
              ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
          }`}
        >
          ✨ Tất Cả (Xem QC & Nạp Xu)
        </button>
        <button
          type="button"
          onClick={() => setTopupSubFilter('ads')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            activeSubFilter === 'ads'
              ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
          }`}
        >
          <Tv size={14} />
          <span>Xem Video QC 30s (+50 Xu Miễn Phí)</span>
        </button>
        <button
          type="button"
          onClick={() => setTopupSubFilter('topup')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
            activeSubFilter === 'topup'
              ? 'bg-emerald-600 text-white font-black border-emerald-500 shadow-md shadow-emerald-600/20'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
          }`}
        >
          <CreditCard size={14} />
          <span>Nạp Xu Qua Ngân Hàng / VietQR</span>
        </button>
      </div>

      {/* 1. XEM QUẢNG CÁO 30S */}
      {(activeSubFilter === 'all' || activeSubFilter === 'ads') && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Tv size={32} className="animate-bounce" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 uppercase">
                Xem 30 Giây • Nhận Ngay +50 Xu Lite
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Kiếm Xu Haevy Lite Hoàn Toàn Miễn Phí
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Mỗi lượt xem đủ 30 giây quảng cáo tài trợ từ hệ sinh thái, tài khoản của bạn sẽ được tự động cộng <strong>+50 Xu Haevy Lite</strong> để đổi các Combo hoạt ảnh độc quyền!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsWatchingAd(true)}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
              >
                <Play size={18} fill="currentColor" />
                <span>Bắt Đầu Xem Quảng Cáo 30s (+50 Xu)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 text-left">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Thời Lượng</div>
                <div className="text-sm font-black text-white mt-0.5">30 Giây</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Phần Thưởng</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">+50 Xu / Lượt</div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Giới Hạn Lượt</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">Không Giới Hạn</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NẠP XU QUA VIETQR / NGÂN HÀNG */}
      {(activeSubFilter === 'all' || activeSubFilter === 'topup') && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800/80">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Coins size={18} className="text-amber-400 fill-amber-400/20" />
                <span>Nạp Xu Haevy Lite - Kích Hoạt Combo Hoạt Ảnh Vũ Trụ</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nạp Xu Haevy Lite tự động 24/7 qua VietQR Ngân Hàng, Ví MoMo hoặc ZaloPay.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-2xl bg-purple-950/30 border border-purple-500/30">
              <span className="text-[11px] text-zinc-400">Số dư hiện tại:</span>
              <span className="text-sm font-black text-purple-300 font-mono">
                {haevyLiteCoins.toLocaleString()} Xu
              </span>
            </div>
          </div>

          {/* Topup Package Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {HAEVY_LITE_TOPUP_PACKAGES.map((pkg) => {
              const isSelected = selectedTopupPkg.id === pkg.id;
              const totalCoins = pkg.coins + (pkg.bonusCoins || 0);

              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedTopupPkg(pkg);
                    haptics?.selection?.();
                  }}
                  className={`relative rounded-3xl p-4 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-950/50 to-zinc-950 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/50 scale-[1.02]'
                      : 'bg-zinc-950/90 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block truncate max-w-[120px]">
                        {pkg.tag}
                      </span>
                      {pkg.isPopular && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-amber-500 text-black uppercase tracking-wider">
                          HOT
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">{pkg.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 min-h-[28px]">{pkg.description}</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                      <div className="text-lg font-black text-purple-300 font-mono flex items-center justify-center gap-1">
                        <Coins size={14} className="text-amber-400 fill-amber-400/20" />
                        <span>{totalCoins.toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-zinc-400">Xu</span>
                      </div>
                      {pkg.bonusCoins && (
                        <div className="text-[9px] font-black text-emerald-400 mt-0.5">
                          Tặng +{pkg.bonusCoins.toLocaleString()} Xu thưởng
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-900/80 flex items-center justify-between">
                    <div>
                      {pkg.originalPriceVnd && (
                        <span className="text-[10px] text-zinc-500 line-through block">
                          {pkg.originalPriceVnd.toLocaleString()}đ
                        </span>
                      )}
                      <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                        {pkg.priceVnd.toLocaleString()}đ
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-600 text-white shadow-md shadow-purple-600/50' : 'bg-zinc-850 text-zinc-600'
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Input Card */}
          <div className="p-4 rounded-3xl bg-zinc-950/90 border border-zinc-850 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tag size={14} className="text-purple-400" />
                <span>Mã Ưu Đãi / Khuyến Mãi Nạp Xu Lite:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                <span className="text-zinc-500">Mã gợi ý:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput('LITE2026');
                    setAppliedPromo({ code: 'LITE2026', discountPercent: 20, desc: 'Ưu đãi 20% thanh toán Xu Haevy Lite' });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-300 font-mono hover:border-purple-500/50 cursor-pointer"
                >
                  LITE2026 (-20%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput('HE2026');
                    setAppliedPromo({ code: 'HE2026', discountFixed: 10000, desc: 'Giảm trực tiếp 10.000đ khi nạp Xu' });
                  }}
                  className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-300 font-mono hover:border-emerald-500/50 cursor-pointer"
                >
                  HE2026 (-10k)
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoError(null);
                }}
                placeholder="Nhập mã ưu đãi (Ví dụ: LITE2026, VIP2026)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors uppercase"
              />
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 font-bold text-xs hover:bg-rose-900/50 cursor-pointer transition-colors"
                >
                  Hủy Mã
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer transition-colors"
                >
                  Áp Dụng
                </button>
              )}
            </div>

            {appliedPromo && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Đã áp dụng mã <strong>{appliedPromo.code}</strong>: {appliedPromo.desc}</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  -{discountVnd.toLocaleString()}đ
                </span>
              </div>
            )}

            {promoError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{promoError}</span>
              </p>
            )}
          </div>

          {/* Payment Details & VietQR Code Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 sm:p-6 rounded-3xl bg-zinc-950/95 border border-zinc-800 shadow-2xl">
            {/* Left Column: Payment Method Selection & QR Code */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-purple-400" />
                <span>Phương Thức Thanh Toán Nạp Xu Lite</span>
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'vietqr', name: 'VietQR Ngân Hàng', icon: QrCode },
                  { id: 'momo', name: 'Ví MoMo', icon: Smartphone },
                  { id: 'zalopay', name: 'Ví ZaloPay', icon: Smartphone },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      haptics?.selection?.();
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                      paymentMethod === m.id
                        ? 'bg-purple-950/35 border-purple-400 ring-1 ring-purple-400/40 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <m.icon size={18} className={paymentMethod === m.id ? 'text-purple-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                    <span className="text-xs font-bold leading-tight">{m.name}</span>
                  </div>
                ))}
              </div>

              {/* Dynamic QR Code Box */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative group">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-purple-400/40">
                    <img
                      src={qrImageUrl}
                      alt="VietQR Haevy Lite Pay"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                    Quét Nạp Xu Lite Tự Động
                  </div>
                </div>

                <div className="pt-1 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <QrCode size={14} className="text-purple-400" />
                    <span>
                      {paymentMethod === 'vietqr' ? 'Mở App Ngân Hàng quét mã VietQR' : paymentMethod === 'momo' ? 'Mở App MoMo quét mã hoặc chuyển 24/7' : 'Mở App ZaloPay quét mã chuyển tiền'}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Hệ thống tự động cộng +{totalAwardedCoins.toLocaleString()} Xu Haevy Lite ngay khi nhận tiền.
                  </p>
                </div>
              </div>

              {/* Order Summary Pill */}
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-850 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Số Xu Haevy Lite nhận:</span>
                  <span className="text-purple-300 font-bold font-mono">
                    +{totalAwardedCoins.toLocaleString()} Xu
                  </span>
                </div>
                {discountVnd > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Ưu đãi giảm giá ({appliedPromo?.code}):</span>
                    <span className="font-mono">-{discountVnd.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-xs sm:text-sm pt-1 border-t border-zinc-800/80">
                  <span>Số tiền thanh toán:</span>
                  <span className="text-amber-300 font-mono text-sm sm:text-base">{finalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Right Column: Bank / Wallet Details & One-Click Copy */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Thông Tin Chuyển Khoản Trực Tiếp</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Bank / Gateway */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between">
                    <span className="text-zinc-400">
                      {paymentMethod === 'vietqr' ? 'Ngân hàng thụ hưởng:' : paymentMethod === 'momo' ? 'Cổng thanh toán:' : 'Cổng thanh toán:'}
                    </span>
                    <span className="text-white font-bold font-mono">
                      {paymentMethod === 'vietqr' ? 'VPBank (Việt Nam Thịnh Vượng)' : paymentMethod === 'momo' ? 'Ví Điện Tử MoMo' : 'Ví Điện Tử ZaloPay'}
                    </span>
                  </div>

                  {/* Account / Phone Number */}
                  <div 
                    onClick={() => handleCopyText(paymentMethod === 'vietqr' ? '0795249860' : '0988889999', 'account')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-purple-500/50 cursor-pointer group transition-colors active:scale-[0.99]"
                  >
                    <span className="text-zinc-400">
                      {paymentMethod === 'vietqr' ? 'Số tài khoản VPBank:' : 'Số điện thoại Ví:'}
                    </span>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-purple-300">
                      <span>{paymentMethod === 'vietqr' ? '0795249860' : '0988889999'}</span>
                      {copiedBankInfo === 'account' ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <Check size={13} /> Đã chép
                        </span>
                      ) : (
                        <Copy size={13} className="text-zinc-500 group-hover:text-purple-300" />
                      )}
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 flex items-center justify-between">
                    <span className="text-zinc-400">Chủ tài khoản:</span>
                    <span className="text-white font-bold uppercase font-mono">HA QUANG KHAI</span>
                  </div>

                  {/* Exact Amount */}
                  <div 
                    onClick={() => handleCopyText(String(finalAmount), 'amount')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-purple-500/50 cursor-pointer group transition-colors active:scale-[0.99]"
                  >
                    <span className="text-zinc-400">Số tiền chính xác:</span>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                      <span>{finalAmount.toLocaleString()}đ</span>
                      {copiedBankInfo === 'amount' ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <Check size={13} /> Đã chép
                        </span>
                      ) : (
                        <Copy size={13} className="text-zinc-500 group-hover:text-amber-300" />
                      )}
                    </div>
                  </div>

                  {/* Transfer Memo (Required) */}
                  <div 
                    onClick={() => handleCopyText(transferContent, 'content')}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-purple-500/50 cursor-pointer group transition-colors space-y-1.5 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <span>Nội dung chuyển khoản (Bắt buộc):</span>
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-purple-400 font-bold">
                        {copiedBankInfo === 'content' ? (
                          <span className="text-emerald-400 flex items-center gap-1"><Check size={13} /> Đã chép!</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy size={12} /> Chạm để chép</span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-xs sm:text-sm text-purple-300 break-all select-all bg-zinc-950 p-2 rounded-lg border border-purple-500/30">
                      {transferContent}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                  * Lưu ý: Hãy nhập chính xác nội dung chuyển khoản để hệ thống bot Haevy tự động kích hoạt Xu vào tài khoản trong vòng 30 giây.
                </p>
              </div>

              {/* Confirm / Submit Button */}
              <button
                type="button"
                onClick={handleTopup}
                disabled={isPurchasing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 mt-3"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang Xử Lý & Xác Nhận Nạp Xu...</span>
                  </>
                ) : (
                  <>
                    <Coins size={16} className="fill-current text-amber-300" />
                    <span>Xác Nhận Đã Chuyển & Nạp +{totalAwardedCoins.toLocaleString()} Xu Lite</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Xu Haevy Lite Transactions */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-purple-400" />
                <span>Biến Động Số Dư Xu Haevy Lite Gần Đây</span>
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">
                {recentTransactions.length} giao dịch ghi nhận
              </span>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Chưa có giao dịch biến động Xu Lite nào được ghi nhận. Hãy nạp Xu hoặc xem quảng cáo 30s để bắt đầu!
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-200 truncate block">{tx.title}</span>
                      <p className="text-[10px] text-zinc-500">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-sm shrink-0 ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount >= 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} Xu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watch 30s Ad Modal */}
      {isWatchingAd && (
        <Watch30sAdModal
          isOpen={isWatchingAd}
          onClose={() => setIsWatchingAd(false)}
          onAdCompleted={(coins) => {
            onShowMessage?.({
              type: 'success',
              text: `Chúc mừng bạn đã nhận thành công +${coins} Xu Haevy Lite từ việc xem quảng cáo tài trợ!`
            });
            setIsWatchingAd(false);
          }}
        />
      )}
    </div>
  );
}
