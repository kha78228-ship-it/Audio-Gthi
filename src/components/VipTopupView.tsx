import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Copy, 
  Check, 
  Percent, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  History, 
  Gift, 
  Flame,
  Star,
  ExternalLink,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VipPackage, PromoCode, VipOrder } from '../types';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface VipTopupViewProps {
  onOpenAuth: () => void;
  onGoToVipSettings: () => void;
}

export const VIP_PACKAGES: VipPackage[] = [
  {
    id: 'week',
    name: 'Gói VIP Tuần',
    durationDays: 7,
    priceVnd: 15000,
    bonusPoints: 150,
    tier: 'vip',
    description: 'Trải nghiệm trọn vẹn âm thanh chuẩn Hi-Fi trong 7 ngày',
    features: [
      'Âm thanh Hi-Fi Lossless 320kbps',
      'Spatial 3D Audio không gian',
      'Nhân đôi (x2) điểm thưởng nghe nhạc',
      'Thưởng ngay +150 Điểm Audio'
    ]
  },
  {
    id: 'month',
    name: 'Gói VIP 1 Tháng',
    durationDays: 30,
    priceVnd: 20000,
    originalPriceVnd: 60000,
    bonusPoints: 500,
    tier: 'vip',
    isPopular: true,
    description: 'Gói tiết kiệm & được yêu thích nhất cho người yêu âm nhạc',
    features: [
      'Toàn bộ đặc quyền VIP Hi-Fi & Spatial 3D',
      'Huy hiệu Vương miện VIP trong Cộng đồng',
      'Mở khóa tải nhạc Offline chuẩn Lossless',
      'Truy cập độc quyền toàn bộ kho nhạc',
      'Thưởng ngay +500 Điểm Audio'
    ]
  },
  {
    id: '3month',
    name: 'Gói VIP 3 Tháng',
    durationDays: 90,
    priceVnd: 45000,
    originalPriceVnd: 180000,
    bonusPoints: 1200,
    tier: 'vip',
    description: 'Tiết kiệm 25% chi phí, trải nghiệm âm thanh không giới hạn suốt mùa',
    features: [
      'Mọi đặc quyền VIP cao cấp 90 ngày liên tục',
      'Nghe nhạc nền không quảng cáo',
      'Tải không giới hạn bài hát chất lượng Studio',
      'Ưu tiên kết nối server đường truyền riêng',
      'Thưởng ngay +1,200 Điểm Audio'
    ]
  },
  {
    id: '6month',
    name: 'Gói VIP 6 Tháng',
    durationDays: 180,
    priceVnd: 80000,
    originalPriceVnd: 360000,
    bonusPoints: 2500,
    tier: 'vip_master',
    description: 'Nửa năm đắm chìm trong thế giới âm thanh đỉnh cao (Tiết kiệm 33%)',
    features: [
      'Nâng cấp lên danh hiệu VIP MASTER',
      'Huy hiệu VIP Master phát sáng Aura độc quyền',
      'Âm thanh Master Lossless 24-bit / 96kHz',
      'Ưu tiên xuất bản bài hát cộng đồng lên Top',
      'Thưởng ngay +2,500 Điểm Audio'
    ]
  },
  {
    id: 'year',
    name: 'Gói VIP 1 Năm (Hoàng Gia)',
    durationDays: 365,
    priceVnd: 150000,
    originalPriceVnd: 720000,
    bonusPoints: 5000,
    tier: 'vip_master',
    isBestValue: true,
    description: 'Đặc quyền Tối thượng 365 ngày - Tiết kiệm đến 38% & Thưởng khủng',
    features: [
      'Đặc quyền Thượng lưu VIP MASTER trọn vẹn 1 năm',
      'Trải nghiệm sớm các tính năng AI & Master Audio mới nhất',
      'Huy hiệu Vương miện Kim Cương Hoàng Gia',
      'Tải kho bài hát Offline không giới hạn số lượng',
      'Tặng thưởng cực lớn +5,000 Điểm Audio'
    ]
  }
];

export const AVAILABLE_PROMO_CODES: PromoCode[] = [
  {
    code: 'VIPPRO',
    discountType: 'percentage',
    value: 50,
    description: 'Giảm ngay 50% toàn bộ gói nạp (Hot Deal giới hạn)'
  },
  {
    code: 'CHAO2026',
    discountType: 'percentage',
    value: 30,
    description: 'Ưu đãi chào năm mới - Giảm 30% tổng hóa đơn'
  },
  {
    code: 'AUDIOVIP',
    discountType: 'percentage',
    value: 20,
    description: 'Mã tri ân thành viên AudioHub - Giảm 20%'
  },
  {
    code: 'GIAM10K',
    discountType: 'fixed',
    value: 10000,
    minSpend: 20000,
    description: 'Giảm trực tiếp 10.000đ cho đơn từ 20.000đ trở lên'
  },
  {
    code: 'AUDIOHUB',
    discountType: 'percentage',
    value: 15,
    description: 'Giảm 15% cho người yêu âm nhạc mới'
  }
];

export function VipTopupView({ onOpenAuth, onGoToVipSettings }: VipTopupViewProps) {
  const { user, isVip, vipTier, vipExpiresAt, purchaseVipPlan } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<VipPackage>(VIP_PACKAGES[1]); // Default 1 Month
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay' | 'card'>('vietqr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderSuccessResult, setOrderSuccessResult] = useState<{
    message: string;
    orderId?: string;
    pkgName: string;
    days: number;
  } | null>(null);

  const [ordersHistory, setOrdersHistory] = useState<VipOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Calculate pricing
  const originalPrice = selectedPkg.priceVnd;
  let discountAmount = 0;

  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((originalPrice * appliedPromo.value) / 100);
    } else if (appliedPromo.discountType === 'fixed') {
      if (!appliedPromo.minSpend || originalPrice >= appliedPromo.minSpend) {
        discountAmount = Math.min(appliedPromo.value, originalPrice);
      }
    }
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Fetch past VIP orders from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const q = query(
          collection(db, 'users', user.uid, 'vipOrders'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const list: VipOrder[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            packageId: data.packageId || '',
            packageName: data.packageName || '',
            durationDays: data.durationDays || 0,
            originalAmount: data.originalAmount || 0,
            discountAmount: data.discountAmount || 0,
            finalAmount: data.finalAmount || 0,
            promoCodeApplied: data.promoCodeApplied || '',
            paymentMethod: data.paymentMethod || 'vietqr',
            status: data.status || 'completed',
            createdAt: data.createdAt,
          };
        });
        setOrdersHistory(list);
      } catch (err) {
        console.error('Error fetching VIP orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, orderSuccessResult]);

  const handleApplyPromo = (codeToApply?: string) => {
    const rawCode = (codeToApply || promoCodeInput).trim().toUpperCase();
    setPromoError(null);
    setPromoSuccess(null);

    if (!rawCode) {
      setPromoError('Vui lòng nhập mã ưu đãi.');
      return;
    }

    const found = AVAILABLE_PROMO_CODES.find((p) => p.code === rawCode);
    if (!found) {
      setPromoError(`Mã ưu đãi "${rawCode}" không tồn tại hoặc đã hết hạn.`);
      return;
    }

    if (found.minSpend && selectedPkg.priceVnd < found.minSpend) {
      setPromoError(`Mã "${found.code}" chỉ áp dụng cho gói từ ${found.minSpend.toLocaleString()}đ trở lên.`);
      return;
    }

    setAppliedPromo(found);
    setPromoCodeInput(found.code);
    setPromoSuccess(
      `Áp dụng mã ${found.code} thành công! Giảm ${
        found.discountType === 'percentage' ? `${found.value}%` : `${found.value.toLocaleString()}đ`
      }.`
    );
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await purchaseVipPlan({
        pkg: selectedPkg,
        originalAmount: originalPrice,
        discountAmount,
        finalAmount: finalPrice,
        promoCodeApplied: appliedPromo?.code,
        paymentMethod,
      });

      if (res.success) {
        setOrderSuccessResult({
          message: res.message,
          orderId: res.orderId,
          pkgName: selectedPkg.name,
          days: selectedPkg.durationDays,
        });
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert('Có lỗi xảy ra trong quá trình kích hoạt VIP: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
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

  // Generate dynamic QR Code and Transfer info for VPBank, MoMo, ZaloPay (STK: 0795249860)
  const transferCode = `VIP${user ? user.uid.substring(0, 6).toUpperCase() : 'AUDIO'}${selectedPkg.id.toUpperCase()}`;
  const vpBankStk = '0795249860';
  const momoStk = '0795249860';
  const zaloPayStk = '0795249860';
  const accountHolderName = 'TRAN VAN KHA';

  // Get current active payment channel info based on selected method
  const currentPaymentInfo = (() => {
    switch (paymentMethod) {
      case 'vietqr':
        return {
          title: 'VietQR Ngân hàng VPBank',
          bankOrService: 'VPBank (Ngân Hàng Việt Nam Thịnh Vượng)',
          accountNumber: vpBankStk,
          accountHolder: accountHolderName,
          typeLabel: 'Số Tài Khoản VPBank',
          qrUrl: `https://img.vietqr.io/image/VPB-${vpBankStk}-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(transferCode)}&accountName=${encodeURIComponent(accountHolderName)}`,
          fallbackQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${vpBankStk}|${accountHolderName}|${finalPrice}|${transferCode}|VPB`,
        };
      case 'momo':
        return {
          title: 'Ví Điện Tử MoMo',
          bankOrService: 'Ví Điện Tử MoMo',
          accountNumber: momoStk,
          accountHolder: accountHolderName,
          typeLabel: 'Số Điện Thoại / STK Ví MoMo',
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${momoStk}|${accountHolderName}|${finalPrice}|${encodeURIComponent(transferCode)}|MOMO`,
          fallbackQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${momoStk}|${accountHolderName}|${finalPrice}|${encodeURIComponent(transferCode)}|MOMO`,
        };
      case 'zalopay':
        return {
          title: 'Ví Điện Tử ZaloPay',
          bankOrService: 'Ví Điện Tử ZaloPay',
          accountNumber: zaloPayStk,
          accountHolder: accountHolderName,
          typeLabel: 'Số Điện Thoại / STK ZaloPay',
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zalopay://transfer?phone=${zaloPayStk}&amount=${finalPrice}&note=${encodeURIComponent(transferCode)}`,
          fallbackQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${zaloPayStk}|${accountHolderName}|${finalPrice}|${encodeURIComponent(transferCode)}|ZALOPAY`,
        };
      case 'card':
      default:
        return {
          title: 'Chuyển Khoản Nhanh 24/7 VPBank',
          bankOrService: 'VPBank (Ngân Hàng Việt Nam Thịnh Vượng)',
          accountNumber: vpBankStk,
          accountHolder: accountHolderName,
          typeLabel: 'Số Tài Khoản Thụ Hưởng',
          qrUrl: `https://img.vietqr.io/image/VPB-${vpBankStk}-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(transferCode)}&accountName=${encodeURIComponent(accountHolderName)}`,
          fallbackQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${vpBankStk}|${accountHolderName}|${finalPrice}|${transferCode}|VPB`,
        };
    }
  })();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-36 sm:pb-40">
      {/* Header Banner */}
      <div 
        id="vip-topup-hero"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-black shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
              <Crown size={15} className="fill-amber-400" />
              <span>Nâng Cấp & Nạp Gói Đặc Quyền VIP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Mở Khóa Âm Nhạc <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Chất Lượng Cao</span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base font-normal leading-relaxed">
              Trải nghiệm chuẩn âm thanh phòng thu Hi-Fi Lossless 320kbps, Spatial 3D Audio sống động và huy hiệu VIP hoàng gia nổi bật khắp cộng đồng.
            </p>

            {isVip && (
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-amber-300">
                <Clock size={15} className="shrink-0" />
                <span>Trạng thái: <strong>{vipTier === 'vip_master' ? 'VIP MASTER' : 'VIP'}</strong> (Đang có hạn đến {formatExpiresDate(vipExpiresAt)}) - Mua thêm sẽ tự động cộng dồn ngày!</span>
              </div>
            )}
          </div>

          {/* Quick status box */}
          <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[240px] text-center shadow-xl backdrop-blur-md shrink-0">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
              Đặc quyền hiện tại
            </span>
            <div className="flex items-center gap-2 my-1 text-lg font-extrabold text-white">
              <Crown size={20} className={isVip ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'} />
              <span>{isVip ? (vipTier === 'vip_master' ? 'VIP MASTER' : 'VIP PRO') : 'Tài Khoản Thường'}</span>
            </div>
            <button
              onClick={onGoToVipSettings}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Xem cài đặt đặc quyền VIP</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL / NOTIFICATION */}
      {orderSuccessResult && (
        <div 
          id="vip-topup-success-card"
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border-2 border-emerald-500/60 shadow-2xl text-white space-y-4 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">
                Kích Hoạt Gói VIP Thành Công!
              </h3>
              <p className="text-sm text-zinc-300">
                {orderSuccessResult.message}
              </p>
              {orderSuccessResult.orderId && (
                <p className="text-xs text-zinc-500 font-mono">
                  Mã giao dịch: #{orderSuccessResult.orderId}
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-emerald-400 font-medium">
              ✨ Toàn bộ bài hát VIP, chất lượng Hi-Fi và hiệu ứng âm thanh 3D đã sẵn sàng!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOrderSuccessResult(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={onGoToVipSettings}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Bật Hi-Fi & 3D Audio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: CHỌN GÓI NẠP VIP (5 GÓI YÊU CẦU: Tuần 15k, Tháng 20k, 3 Tháng 45k, 6 Tháng 80k, 1 Năm 150k) */}
      <section id="vip-packages-selection" className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={22} className="text-amber-400" />
              <span>Bảng Giá Các Gói Nạp VIP</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Chọn gói thời hạn phù hợp với nhu cầu giải trí và làm việc của bạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {VIP_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;

            return (
              <div
                key={pkg.id}
                id={`vip-pkg-card-${pkg.id}`}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all cursor-pointer border ${
                  isSelected
                    ? pkg.isPopular || pkg.isBestValue
                      ? 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-zinc-900 border-zinc-300 shadow-lg ring-1 ring-zinc-400 scale-[1.02]'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Badge tags */}
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    Phổ biến nhất
                  </div>
                )}
                {pkg.isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    Siêu tiết kiệm
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {pkg.durationDays} Ngày
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-zinc-700 bg-zinc-800'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {pkg.name}
                  </h3>

                  <div className="my-3">
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                      {pkg.priceVnd.toLocaleString()}<span className="text-xs text-zinc-400 font-normal font-sans ml-1">VNĐ</span>
                    </div>
                    {pkg.originalPriceVnd && (
                      <div className="text-[11px] text-zinc-500 line-through font-mono">
                        {pkg.originalPriceVnd.toLocaleString()}đ
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg mb-3 flex items-center gap-1">
                    <Gift size={12} className="shrink-0" />
                    <span>+{pkg.bonusPoints} Audio Points</span>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-3">
                    {pkg.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/80">
                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span>{isSelected ? 'Đang chọn gói này' : 'Chọn gói này'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: CHỖ NHẬP MÃ ƯU ĐÃI & THANH TOÁN (PROMO CODE & CHECKOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Promo Code & Payment Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ô Nhập Mã Ưu Đãi */}
          <div id="promo-code-box" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Tag size={18} className="text-amber-400" />
              <span>Mã Ưu Đãi / Khuyến Mãi (Discount Code)</span>
            </div>

            <p className="text-xs text-zinc-400">
              Nhập mã giảm giá để nhận mức giá ưu đãi tốt nhất khi nạp gói VIP.
            </p>

            {/* Input form */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="promo-code-input"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã ưu đãi (Ví dụ: VIPPRO, CHAO2026, AUDIOVIP)..."
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-white uppercase font-mono tracking-wider placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                />
                <Percent size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>

              {appliedPromo ? (
                <button
                  type="button"
                  id="remove-promo-btn"
                  onClick={handleRemovePromo}
                  className="px-4 py-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-2xl text-xs font-bold transition-all shrink-0"
                >
                  Hủy mã
                </button>
              ) : (
                <button
                  type="button"
                  id="apply-promo-btn"
                  onClick={() => handleApplyPromo()}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 shrink-0"
                >
                  Áp dụng
                </button>
              )}
            </div>

            {/* Promo alerts */}
            {promoError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            {promoSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{promoSuccess}</span>
              </div>
            )}

            {/* Quick suggested promos pills */}
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-500 block mb-2 font-medium">
                Mã ưu đãi hot đang diễn ra (Click để áp dụng ngay):
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PROMO_CODES.map((promo) => (
                  <button
                    key={promo.code}
                    type="button"
                    onClick={() => handleApplyPromo(promo.code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      appliedPromo?.code === promo.code
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    <Tag size={11} className="text-amber-400" />
                    <span>{promo.code}</span>
                    <span className="text-[10px] text-amber-400/90 font-sans font-normal">
                      ({promo.discountType === 'percentage' ? `-${promo.value}%` : `-${promo.value.toLocaleString()}đ`})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phương Thức Thanh Toán */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <CreditCard size={18} className="text-amber-400" />
              <span>Phương Thức Thanh Toán</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('vietqr')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'vietqr'
                    ? 'bg-amber-500/10 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <QrCode size={24} className={paymentMethod === 'vietqr' ? 'text-amber-400' : 'text-zinc-500'} />
                <span className="text-xs font-bold">VietQR Ngân Hàng</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">Tự động 24/7</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('momo')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'momo'
                    ? 'bg-pink-500/10 border-pink-400 text-pink-300 ring-1 ring-pink-400/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Smartphone size={24} className={paymentMethod === 'momo' ? 'text-pink-400' : 'text-zinc-500'} />
                <span className="text-xs font-bold">Ví MoMo</span>
                <span className="text-[9px] text-zinc-500">Quét mã tiện lợi</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('zalopay')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'zalopay'
                    ? 'bg-blue-500/10 border-blue-400 text-blue-300 ring-1 ring-blue-400/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Smartphone size={24} className={paymentMethod === 'zalopay' ? 'text-blue-400' : 'text-zinc-500'} />
                <span className="text-xs font-bold">ZaloPay</span>
                <span className="text-[9px] text-zinc-500">Ví điện tử</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <CreditCard size={24} className={paymentMethod === 'card' ? 'text-indigo-400' : 'text-zinc-500'} />
                <span className="text-xs font-bold">ATM / Visa</span>
                <span className="text-[9px] text-zinc-500">Thẻ thanh toán</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Transfer Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-6">
            <h3 className="text-lg font-extrabold text-white flex items-center justify-between">
              <span>Hóa Đơn Thanh Toán</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {selectedPkg.durationDays} Ngày VIP
              </span>
            </h3>

            {/* Price breakdown */}
            <div className="space-y-3 text-xs sm:text-sm text-zinc-300 border-b border-zinc-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Gói đã chọn:</span>
                <span className="font-bold text-white">{selectedPkg.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Giá niêm yết:</span>
                <span className="font-mono text-zinc-300">{originalPrice.toLocaleString()} VNĐ</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    <span>Ưu đãi mã ({appliedPromo?.code}):</span>
                  </span>
                  <span className="font-mono font-bold">-{discountAmount.toLocaleString()} VNĐ</span>
                </div>
              )}

              <div className="flex items-center justify-between text-amber-400">
                <span>Điểm thưởng tặng kèm:</span>
                <span className="font-bold">+{selectedPkg.bonusPoints} Audio Points</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold text-zinc-300">Tổng thanh toán:</span>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {finalPrice.toLocaleString()} <span className="text-xs font-normal text-zinc-400 font-sans">VNĐ</span>
                </div>
                {discountAmount > 0 && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    (Tiết kiệm {discountAmount.toLocaleString()}đ)
                  </span>
                )}
              </div>
            </div>

            {/* VietQR / Payment Info Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <QrCode size={14} className="text-amber-400" />
                  <span>{currentPaymentInfo.title}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Khớp lệnh 24/7
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* QR Image */}
                <div className="w-32 h-32 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-md relative group">
                  <img
                    src={currentPaymentInfo.qrUrl}
                    onError={(e) => {
                      // Fallback to generic QR server if VietQR image service encounters network delay
                      (e.target as HTMLImageElement).src = currentPaymentInfo.fallbackQrUrl;
                    }}
                    alt={`QR ${currentPaymentInfo.title}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Transfer text details */}
                <div className="space-y-2 text-xs flex-1 min-w-0 w-full">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-0.5">
                      {currentPaymentInfo.typeLabel}:
                    </span>
                    <div className="flex items-center justify-between font-mono font-bold text-white bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                      <span className="text-sm text-yellow-300 tracking-wider">{currentPaymentInfo.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(currentPaymentInfo.accountNumber, 'stk')}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'stk' ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Nội Dung Chuyển Khoản:</span>
                    <div className="flex items-center justify-between font-mono font-bold text-amber-400 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                      <span className="truncate text-xs">{transferCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(transferCode, 'content')}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 ml-1"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'content' ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 pt-1 flex flex-col gap-0.5 border-t border-zinc-900">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Kênh nhận: <strong className="text-zinc-200">{currentPaymentInfo.bankOrService}</strong></span>
                </div>
                <div className="pl-5 text-zinc-500 text-[10px]">
                  Chủ tài khoản / ví: <strong className="text-zinc-300">{currentPaymentInfo.accountHolder}</strong>
                </div>
              </div>
            </div>

            {/* Confirm & Activate VIP Button */}
            <button
              type="button"
              id="confirm-vip-purchase-btn"
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang kích hoạt VIP...</span>
                </>
              ) : (
                <>
                  <Crown size={18} className="fill-black" />
                  <span>Xác Nhận & Kích Hoạt VIP Ngay</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-zinc-500 text-center">
              Hệ thống tự động kích hoạt ngay sau khi bấm xác nhận. Hỗ trợ 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: LỊCH SỬ NẠP GÓI VIP (VIP ORDERS HISTORY) */}
      {user && (
        <section id="vip-orders-history-section" className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-zinc-400" />
              <span>Lịch Sử Nạp Gói VIP Của Bạn</span>
            </h3>
          </div>

          {loadingOrders ? (
            <div className="text-center py-8">
              <Loader2 size={24} className="animate-spin text-zinc-500 mx-auto" />
            </div>
          ) : ordersHistory.length === 0 ? (
            <div className="text-center py-8 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-xs text-zinc-500">
              Bạn chưa có giao dịch nạp VIP nào. Hãy chọn gói bên trên để nâng cấp trải nghiệm!
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl divide-y divide-zinc-800/80 overflow-hidden shadow-lg">
              {ordersHistory.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <Crown size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{order.packageName}</p>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                          Thành công
                        </span>
                        {order.promoCodeApplied && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-500/30">
                            Mã: {order.promoCodeApplied}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        Thời hạn: +{order.durationDays} ngày • Phương thức: {order.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-sm sm:text-base text-amber-400">
                      {order.finalAmount.toLocaleString()} VNĐ
                    </span>
                    {order.discountAmount > 0 && (
                      <span className="text-[10px] text-zinc-500 block line-through">
                        {order.originalAmount.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
