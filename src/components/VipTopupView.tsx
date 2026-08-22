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
  Coins,
  Headphones,
  KeyRound,
  Award,
  Download,
  Sliders,
  Volume2,
  Send,
  User as UserIcon,
  Search,
  CheckCircle,
  RefreshCw,
  Info,
  X,
  Radio,
  Share2,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  VipPackage, 
  PromoCode, 
  VipOrder, 
  PointTransaction, 
  Track, 
  VipPrivilegeItem, 
  PointTopupPackage, 
  PointTopupOrder,
  VipGiftOrder 
} from '../types';
import { VIP_PRIVILEGES_LIST, POINT_TOPUP_PACKAGES } from '../data';
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface VipTopupViewProps {
  onOpenAuth: () => void;
  onGoToProfile?: () => void;
  allTracks?: Track[];
  currentTrack?: Track;
  onOpenGiftShopModal?: (author?: any) => void;
  activePage?: 'page1' | 'page2' | 'page3' | 'page4';
  onSelectPage?: (page: 'page1' | 'page2' | 'page3' | 'page4') => void;
}

export const VIP_PACKAGES: VipPackage[] = [
  {
    id: 'week',
    name: 'Gói VIP Tuần',
    durationDays: 7,
    priceVnd: 15000,
    bonusPoints: 150,
    tier: 'vip',
    description: 'Trải nghiệm âm thanh Hi-Fi & tăng gấp 3 Xu Haevy trong 7 ngày',
    features: [
      'Âm thanh Hi-Fi Lossless 320kbps & 24-bit',
      'Spatial 3D Audio không gian đa hướng',
      'Tăng gấp 3 (x3) Xu Haevy khi nghe nhạc & điểm danh',
      'Mở khóa tải nhạc Offline Lossless',
      'Thưởng ngay +150 Xu Haevy'
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
      'Toàn bộ đặc quyền VIP Hi-Fi & Spatial 3D Master',
      'Tăng gấp 3 (x3) Xu Haevy khi nghe nhạc & điểm danh',
      'Huy hiệu Vương miện VIP trong Cộng đồng',
      'Mở khóa tải nhạc Offline chuẩn Lossless',
      'Truy cập độc quyền toàn bộ kho nhạc',
      'Thưởng ngay +500 Xu Haevy'
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
    description: 'Tiết kiệm chi phí, nhân 3 Xu Haevy suốt 90 ngày',
    features: [
      'Đặc quyền VIP trọn gói 90 ngày liên tục',
      'Nhân 3 (x3) tốc độ tích lũy Xu Haevy',
      'Quyền truy cập phòng chat VIP riêng biệt',
      'Không giới hạn tải nhạc Offline chất lượng cao',
      'Thưởng ngay +1.200 Xu Haevy'
    ]
  },
  {
    id: '6month',
    name: 'Gói VIP 6 Tháng',
    durationDays: 180,
    priceVnd: 80000,
    originalPriceVnd: 360000,
    bonusPoints: 2500,
    tier: 'vip',
    description: 'Nửa năm trải nghiệm đỉnh cao với ưu đãi lớn',
    features: [
      'Trải nghiệm VIP toàn diện 180 ngày',
      'Tải nhạc & nghe Offline chuẩn 24-bit/96kHz',
      'Huy hiệu VIP mạ vàng nổi bật trên toàn hệ thống',
      'Ưu tiên kết nối server tốc độ cao riêng biệt',
      'Thưởng ngay +2.500 Xu Haevy'
    ]
  },
  {
    id: 'year',
    name: 'Gói VIP Trọn Năm',
    durationDays: 365,
    priceVnd: 140000,
    originalPriceVnd: 720000,
    bonusPoints: 6000,
    tier: 'vip',
    isBestValue: true,
    description: 'Tiết kiệm tới 80% chi phí - Trở thành VIP Hoàng Gia đích thực',
    features: [
      'Đặc quyền VIP Hoàng Gia 365 ngày trọn vẹn',
      'Mở khóa tối đa toàn bộ tính năng Studio AI & Equalizer',
      'Aura bình luận mạ vàng độc quyền trên mọi bài hát',
      'Tặng trọn bộ Preset âm thanh Dolby Theater',
      'Thưởng ngay +6.000 Xu Haevy cực khủng'
    ]
  }
];

const AVAILABLE_PROMO_CODES: PromoCode[] = [
  { code: 'VIP2026', discountType: 'percentage', value: 20, description: 'Giảm 20% tổng hóa đơn chào đón năm 2026' },
  { code: 'HE2026', discountType: 'fixed', value: 10000, description: 'Giảm ngay 10.000đ cho tất cả gói nạp' },
  { code: 'AUDIO20', discountType: 'percentage', value: 20, description: 'Ưu đãi đặc biệt giảm 20% trải nghiệm Hi-Fi' },
  { code: 'HAEVYVIP', discountType: 'percentage', value: 15, description: 'Mã tri ân thành viên Haevy giảm 15%' }
];

export function VipTopupView({ 
  onOpenAuth, 
  onGoToProfile,
  allTracks = [],
  currentTrack,
  onOpenGiftShopModal,
  activePage = 'page1',
  onSelectPage
}: VipTopupViewProps) {
  const { 
    user, 
    isVip, 
    vipExpiresAt, 
    audioPoints, 
    purchaseVipPlan, 
    purchasePointsPackage,
    giftVipPlanToUser,
    transferCoinsToUser,
    accountId 
  } = useAuth();

  // Internal tab state synced with activePage prop
  const [internalPage, setInternalPage] = useState<'page1' | 'page2' | 'page3' | 'page4'>(activePage);

  useEffect(() => {
    if (activePage) {
      setInternalPage(activePage);
    }
  }, [activePage]);

  const handleTabChange = (page: 'page1' | 'page2' | 'page3' | 'page4') => {
    setInternalPage(page);
    if (onSelectPage) {
      onSelectPage(page);
    }
  };

  // --- VIP TOP-UP STATE (PAGE 2) ---
  const [selectedVipPackage, setSelectedVipPackage] = useState<VipPackage>(VIP_PACKAGES[1]); // Default 1 Month
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [vipPaymentMethod, setVipPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay' | 'card'>('vietqr');
  const [isProcessingVip, setIsProcessingVip] = useState(false);
  const [vipSuccessMessage, setVipSuccessMessage] = useState('');
  const [vipErrorMessage, setVipErrorMessage] = useState('');
  const [copiedBankInfo, setCopiedBankInfo] = useState<string | null>(null);
  const [vipOrdersList, setVipOrdersList] = useState<VipOrder[]>([]);

  // --- XU HAEVY TOP-UP STATE (PAGE 3) ---
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<PointTopupPackage>(POINT_TOPUP_PACKAGES[1]); // Default Popular
  const [coinPaymentMethod, setCoinPaymentMethod] = useState<PointTopupOrder['paymentMethod']>('vietqr');
  const [isProcessingCoin, setIsProcessingCoin] = useState(false);
  const [coinSuccessMessage, setCoinSuccessMessage] = useState('');
  const [coinErrorMessage, setCoinErrorMessage] = useState('');
  const [coinOrdersList, setCoinOrdersList] = useState<PointTopupOrder[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);

  // --- GIFTING STATE (PAGE 4) ---
  const [giftMode, setGiftMode] = useState<'gift_vip' | 'transfer_coins'>('gift_vip');
  const [giftRecipientInput, setGiftRecipientInput] = useState('');
  const [giftSelectedVipPkg, setGiftSelectedVipPkg] = useState<VipPackage>(VIP_PACKAGES[1]);
  const [giftCoinAmount, setGiftCoinAmount] = useState<number>(500);
  const [giftCustomCoins, setGiftCustomCoins] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState('');
  const [giftPaymentMethod, setGiftPaymentMethod] = useState<VipOrder['paymentMethod']>('vietqr');
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);
  const [recipientPreview, setRecipientPreview] = useState<{ uid: string; name: string; email?: string; accountId?: string; isVip?: boolean } | null>(null);
  const [recipientSearchError, setRecipientSearchError] = useState('');
  const [isSubmittingGift, setIsSubmittingGift] = useState(false);
  const [giftSuccessMessage, setGiftSuccessMessage] = useState('');
  const [giftErrorMessage, setGiftErrorMessage] = useState('');

  // --- SOUND COMPARISON TEST STATE (PAGE 1) ---
  const [soundTestQuality, setSoundTestQuality] = useState<'standard' | 'hifi' | 'spatial'>('hifi');
  const [soundTestPlaying, setSoundTestPlaying] = useState(false);

  // Load VIP orders, Coin orders and Point transactions from Firestore
  useEffect(() => {
    if (!user) return;

    // 1. VIP Orders
    const qVip = query(
      collection(db, 'users', user.uid, 'vipOrders'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubVip = onSnapshot(qVip, (snap) => {
      const list: VipOrder[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VipOrder[];
      setVipOrdersList(list);
    }, (err) => console.log('vipOrders snapshot error:', err));

    // 2. Coin Orders
    const qCoin = query(
      collection(db, 'users', user.uid, 'pointOrders'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubCoin = onSnapshot(qCoin, (snap) => {
      const list: PointTopupOrder[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PointTopupOrder[];
      setCoinOrdersList(list);
    }, (err) => console.log('coinOrders snapshot error:', err));

    // 3. Transactions
    const qTrans = query(
      collection(db, 'users', user.uid, 'pointTransactions'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      const list: PointTransaction[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PointTransaction[];
      setPointTransactions(list);
    }, (err) => console.log('pointTrans snapshot error:', err));

    return () => {
      unsubVip();
      unsubCoin();
      unsubTrans();
    };
  }, [user]);

  // Calculate pricing for VIP packages
  const calculateVipPricing = () => {
    const originalAmount = selectedVipPackage.priceVnd;
    let discountAmount = 0;

    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        discountAmount = Math.round((originalAmount * appliedPromo.value) / 100);
      } else {
        discountAmount = appliedPromo.value;
      }
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { originalAmount, discountAmount, finalAmount };
  };

  const { originalAmount: vipOrig, discountAmount: vipDisc, finalAmount: vipFinal } = calculateVipPricing();

  // Calculate pricing for Xu Haevy packages
  const calculateCoinPricing = () => {
    const originalAmount = selectedCoinPackage.priceVnd;
    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        discountAmount = Math.round((originalAmount * appliedPromo.value) / 100);
      } else {
        discountAmount = appliedPromo.value;
      }
    }
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { originalAmount, discountAmount, finalAmount };
  };

  const { originalAmount: coinOrig, discountAmount: coinDisc, finalAmount: coinFinal } = calculateCoinPricing();

  // Apply promo code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = AVAILABLE_PROMO_CODES.find((c) => c.code === code);
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setPromoError('Mã khuyến mãi không tồn tại hoặc đã hết lượt áp dụng.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(key);
    setTimeout(() => setCopiedBankInfo(null), 2000);
  };

  // Execute VIP Purchase
  const handleConfirmVipPayment = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessingVip(true);
    setVipSuccessMessage('');
    setVipErrorMessage('');

    try {
      const res = await purchaseVipPlan({
        pkg: selectedVipPackage,
        finalAmount: vipFinal,
        originalAmount: vipOrig,
        discountAmount: vipDisc,
        promoCodeApplied: appliedPromo?.code,
        paymentMethod: vipPaymentMethod,
      });

      if (res.success) {
        setVipSuccessMessage(res.message);
      } else {
        setVipErrorMessage(res.message);
      }
    } catch (err: any) {
      setVipErrorMessage('Đã xảy ra lỗi trong quá trình xử lý đơn hàng.');
    } finally {
      setIsProcessingVip(false);
    }
  };

  // Execute Coin Purchase
  const handleConfirmCoinPayment = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessingCoin(true);
    setCoinSuccessMessage('');
    setCoinErrorMessage('');

    try {
      const res = await purchasePointsPackage({
        pkg: selectedCoinPackage,
        finalAmount: coinFinal,
        originalAmount: coinOrig,
        discountAmount: coinDisc,
        promoCodeApplied: appliedPromo?.code,
        paymentMethod: coinPaymentMethod,
      });

      if (res.success) {
        setCoinSuccessMessage(res.message);
      } else {
        setCoinErrorMessage(res.message);
      }
    } catch (err: any) {
      setCoinErrorMessage('Đã xảy ra lỗi khi nạp Xu Haevy.');
    } finally {
      setIsProcessingCoin(false);
    }
  };

  // Search recipient for Gifting
  const handleSearchRecipient = async () => {
    const clean = giftRecipientInput.trim();
    if (!clean) {
      setRecipientSearchError('Vui lòng nhập ID Tài khoản hoặc Email người nhận.');
      setRecipientPreview(null);
      return;
    }

    setIsSearchingRecipient(true);
    setRecipientSearchError('');
    setRecipientPreview(null);

    try {
      // 1. By Account ID
      const qAcc = query(collection(db, 'users'), where('accountId', '==', clean.toUpperCase()));
      const snapAcc = await getDocs(qAcc);
      if (!snapAcc.empty) {
        const d = snapAcc.docs[0];
        const data = d.data();
        setRecipientPreview({
          uid: d.id,
          name: data.displayName || data.accountId || 'Người dùng Haevy',
          email: data.email,
          accountId: data.accountId,
          isVip: data.vipTier === 'vip' && data.vipExpiresAt && new Date(data.vipExpiresAt).getTime() > Date.now()
        });
        setIsSearchingRecipient(false);
        return;
      }

      // 2. By Email
      const qEmail = query(collection(db, 'users'), where('email', '==', clean.toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const d = snapEmail.docs[0];
        const data = d.data();
        setRecipientPreview({
          uid: d.id,
          name: data.displayName || data.email || 'Người dùng Haevy',
          email: data.email,
          accountId: data.accountId,
          isVip: data.vipTier === 'vip' && data.vipExpiresAt && new Date(data.vipExpiresAt).getTime() > Date.now()
        });
        setIsSearchingRecipient(false);
        return;
      }

      // 3. By UID
      const docDirect = await getDocs(query(collection(db, 'users'), where('__name__', '==', clean)));
      if (!docDirect.empty) {
        const d = docDirect.docs[0];
        const data = d.data();
        setRecipientPreview({
          uid: d.id,
          name: data.displayName || 'Người dùng Haevy',
          email: data.email,
          accountId: data.accountId,
          isVip: data.vipTier === 'vip' && data.vipExpiresAt && new Date(data.vipExpiresAt).getTime() > Date.now()
        });
        setIsSearchingRecipient(false);
        return;
      }

      setRecipientSearchError(`Không tìm thấy tài khoản người nhận với thông tin "${clean}".`);
    } catch (err) {
      console.error('Error searching recipient:', err);
      setRecipientSearchError('Lỗi kết nối khi tìm kiếm người nhận.');
    } finally {
      setIsSearchingRecipient(false);
    }
  };

  // Submit Gift VIP
  const handleConfirmGiftVip = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!giftRecipientInput.trim()) {
      setGiftErrorMessage('Vui lòng nhập ID Tài khoản hoặc Email người nhận.');
      return;
    }

    setIsSubmittingGift(true);
    setGiftSuccessMessage('');
    setGiftErrorMessage('');

    try {
      const res = await giftVipPlanToUser({
        recipientIdentifier: giftRecipientInput.trim(),
        pkg: giftSelectedVipPkg,
        finalAmount: giftSelectedVipPkg.priceVnd,
        paymentMethod: giftPaymentMethod,
        message: giftMessage.trim() || undefined,
      });

      if (res.success) {
        setGiftSuccessMessage(res.message);
        setGiftMessage('');
      } else {
        setGiftErrorMessage(res.message);
      }
    } catch (err: any) {
      setGiftErrorMessage('Gửi tặng gói VIP thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingGift(false);
    }
  };

  // Submit Transfer Coins
  const handleConfirmTransferCoins = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const actualCoins = giftCustomCoins ? parseInt(giftCustomCoins, 10) : giftCoinAmount;
    if (isNaN(actualCoins) || actualCoins <= 0) {
      setGiftErrorMessage('Vui lòng nhập số lượng Xu Haevy hợp lệ.');
      return;
    }

    if (!giftRecipientInput.trim()) {
      setGiftErrorMessage('Vui lòng nhập ID Tài khoản hoặc Email người nhận.');
      return;
    }

    if (audioPoints < actualCoins) {
      setGiftErrorMessage(`Số dư không đủ. Hiện có ${audioPoints.toLocaleString()} Xu Haevy, cần ${actualCoins.toLocaleString()} Xu.`);
      return;
    }

    setIsSubmittingGift(true);
    setGiftSuccessMessage('');
    setGiftErrorMessage('');

    try {
      const res = await transferCoinsToUser({
        recipientIdentifier: giftRecipientInput.trim(),
        amount: actualCoins,
        message: giftMessage.trim() || undefined,
      });

      if (res.success) {
        setGiftSuccessMessage(res.message);
        setGiftCustomCoins('');
        setGiftMessage('');
      } else {
        setGiftErrorMessage(res.message);
      }
    } catch (err: any) {
      setGiftErrorMessage('Chuyển tặng Xu Haevy thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingGift(false);
    }
  };

  const transferContentVip = `HAEVY VIP ${user?.uid?.substring(0, 6).toUpperCase() || 'USER'} ${selectedVipPackage.id.toUpperCase()}`;
  const transferContentCoin = `HAEVY XU ${user?.uid?.substring(0, 6).toUpperCase() || 'USER'} ${selectedCoinPackage.id.toUpperCase()}`;
  const transferContentGiftVip = `HAEVY TANG VIP ${user?.uid?.substring(0, 6).toUpperCase() || 'USER'} ${giftSelectedVipPkg.id.toUpperCase()}`;

  return (
    <div id="haevy-vip-hub" className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 pt-2 px-2.5 sm:px-6 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-250 select-none overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* MASTER TOP LOGO & VIP HUB HEADER                                          */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/40 p-4 sm:p-7 shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Main Royal VIP Brand Emblem at TOP */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/20 animate-pulse" />
                <Crown size={26} className="text-amber-400 fill-amber-400 relative z-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">VIP</span>
                </h1>
                <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1">
                  ⭐ Hoàng Gia Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug line-clamp-2">
                Âm thanh Hi-Fi Lossless 24-bit, nhân 3 Xu Haevy, không quảng cáo & tặng quà bạn bè.
              </p>
            </div>
          </div>

          {/* User Status Card (Optimized for Mobile) */}
          <div className="w-full md:w-auto bg-zinc-950/90 border border-zinc-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg shrink-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">Trạng thái:</span>
                {isVip ? (
                  <span className="text-[11px] sm:text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-black px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1">
                    <Crown size={11} className="fill-amber-400" />
                    VIP Hoàng Gia
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md border border-zinc-700">
                    Bản Chuẩn Free
                  </span>
                )}
              </div>

              {isVip && vipExpiresAt && (
                <p className="text-[10px] sm:text-[11px] text-amber-400/90 font-mono truncate">
                  Hạn: {new Date(vipExpiresAt).toLocaleDateString('vi-VN')}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                <Coins size={13} className="text-amber-400 shrink-0" />
                <span>{audioPoints.toLocaleString()} Xu Haevy</span>
              </div>
            </div>

            {onGoToProfile && (
              <button
                onClick={onGoToProfile}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-zinc-800 shrink-0 active:scale-95"
              >
                Hồ sơ
              </button>
            )}
          </div>
        </div>

        {/* 4 Mode Navigation Tabs with Touch Horizontal Scroll */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
          <button
            id="vip-tab-page1"
            onClick={() => handleTabChange('page1')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page1'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Crown size={15} className={internalPage === 'page1' ? 'fill-black' : 'text-amber-400'} />
            <span>Trang 1: Đặc Quyền VIP</span>
          </button>

          <button
            id="vip-tab-page2"
            onClick={() => handleTabChange('page2')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page2'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Zap size={15} className={internalPage === 'page2' ? 'fill-black' : 'text-amber-400'} />
            <span>Trang 2: Nạp VIP</span>
          </button>

          <button
            id="vip-tab-page3"
            onClick={() => handleTabChange('page3')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page3'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Coins size={15} className={internalPage === 'page3' ? 'fill-black' : 'text-amber-400'} />
            <span>Trang 3: Nạp Xu Haevy</span>
          </button>

          <button
            id="vip-tab-page4"
            onClick={() => handleTabChange('page4')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page4'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Gift size={15} className={internalPage === 'page4' ? 'fill-black' : 'text-amber-400'} />
            <span>Trang 4: Tặng Bạn Bè</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRANG 1: ĐẶC QUYỀN VIP                                                   */}
      {/* ========================================================================= */}
      {internalPage === 'page1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Interactive Sound Quality Comparison Demo Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Headphones size={20} className="text-amber-400" />
                  <span>Trải Nghiệm Thử Nghiệm Chất Lượng Âm Thanh VIP</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chạm để so sánh sự khác biệt giữa chuẩn 128kbps thường và 320kbps Lossless Master / 3D Audio
                </p>
              </div>

              <button
                onClick={() => handleTabChange('page2')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Zap size={14} fill="currentColor" />
                <span>Nâng Cấp VIP Ngay</span>
              </button>
            </div>

            {/* Quality Switcher Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setSoundTestQuality('standard')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  soundTestQuality === 'standard'
                    ? 'bg-zinc-800/90 border-zinc-600 shadow-md ring-1 ring-zinc-500'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Chuẩn Thường</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">128 kbps</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">Âm thanh nén tiêu chuẩn, dải động vừa phải, phù hợp kết nối 3G yếu.</p>
              </div>

              <div
                onClick={() => setSoundTestQuality('hifi')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  soundTestQuality === 'hifi'
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : 'bg-zinc-950 border-zinc-850 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Sparkles size={12} />
                    Hi-Fi Lossless
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full font-mono border border-amber-500/40">
                    320kbps / 24-bit
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">Âm thanh chi tiết, dải trầm sâu lắng, âm trung trong trẻo không suy hao.</p>
              </div>

              <div
                onClick={() => setSoundTestQuality('spatial')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  soundTestQuality === 'spatial'
                    ? 'bg-purple-950/30 border-purple-500/60 shadow-md shadow-purple-500/10 ring-1 ring-purple-400/50'
                    : 'bg-zinc-950 border-zinc-850 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1">
                    <Radio size={12} />
                    Spatial 3D Audio
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-full font-mono border border-purple-500/40">
                    360° Surround
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">Mô phỏng trường âm vòm 3D như đang ngồi trực tiếp tại rạp hát thính phòng.</p>
              </div>
            </div>

            {/* Simulated Live Visualizer Spectrum */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Volume2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {soundTestQuality === 'standard' ? 'Đang mô phỏng: 128kbps Standard' : soundTestQuality === 'hifi' ? 'Đang mô phỏng: 320kbps Hi-Fi Studio FLAC' : 'Đang mô phỏng: Spatial 3D Audio 360°'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {soundTestQuality === 'standard' ? 'Dynamic Range: 60dB | Cắt tần >16kHz' : soundTestQuality === 'hifi' ? 'Dynamic Range: 144dB | Full Frequency 20Hz - 48kHz' : 'Dolby Atmos Directional Simulation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 h-6">
                {[40, 70, 90, 60, 100, 85, 45, 95, 60, 30].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      soundTestQuality === 'standard'
                        ? 'bg-zinc-600'
                        : soundTestQuality === 'hifi'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-purple-400 animate-pulse'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Full Grid of 10 VIP Privileges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>10 Đặc Quyền Thành Viên VIP Hoàng Gia</span>
              </h3>
              <span className="text-xs text-amber-400/80 font-mono">100% Độc Quyền</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {VIP_PRIVILEGES_LIST.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Sparkles size={16} />
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-black bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {item.detailedBenefit || item.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Đặc quyền VIP #{idx + 1}</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison: Standard Free vs VIP (Mobile Cards + Responsive Table) */}
          <div className="p-4 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                <Crown size={18} className="text-amber-400 fill-amber-400" />
                <span>Bảng So Sánh Quyền Lợi: Bản Chuẩn vs Haevy VIP</span>
              </h3>
              <span className="text-[11px] text-zinc-400 sm:hidden italic">
                (Vuốt ngang bảng để xem chi tiết)
              </span>
            </div>

            {/* Responsive Table for Tablet & Desktop / Horizontal Swipeable */}
            <div className="overflow-x-auto custom-scrollbar -mx-2 px-2 pb-2">
              <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-bold">Tính Năng / Quyền Lợi</th>
                    <th className="pb-3 font-bold text-center w-28 sm:w-32">Bản Chuẩn</th>
                    <th className="pb-3 font-bold text-center w-36 sm:w-40 text-amber-300">Haevy VIP 👑</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-3 font-medium">Chất lượng âm thanh phát nhạc</td>
                    <td className="py-3 text-center text-zinc-500">128 kbps</td>
                    <td className="py-3 text-center font-bold text-amber-300">320 kbps & 24-bit Lossless</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Không gian âm thanh 3D Spatial Audio</td>
                    <td className="py-3 text-center text-zinc-500">❌ Không</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ Có (360° Surround)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Tốc độ nhận Xu Haevy (Nghe & Điểm danh)</td>
                    <td className="py-3 text-center text-zinc-500">1x Chuẩn</td>
                    <td className="py-3 text-center font-bold text-amber-300">Nhân 3 (x3) Xu Haevy</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Tải nhạc Offline không giới hạn</td>
                    <td className="py-3 text-center text-zinc-500">Tối đa 3 bài</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ Không giới hạn FLAC</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Trải nghiệm không quảng cáo & Nghe nền</td>
                    <td className="py-3 text-center text-zinc-500">Có quảng cáo</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ 100% Không quảng cáo</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Huy hiệu Vương Miện & Aura Vàng bình luận</td>
                    <td className="py-3 text-center text-zinc-500">❌ Không</td>
                    <td className="py-3 text-center font-bold text-amber-300">✅ Vương Miện Hoàng Gia</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Equalizer 10 băng tần & Preset Dolby</td>
                    <td className="py-3 text-center text-zinc-500">3 băng tần cơ bản</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ 10 Băng tần Studio</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Tạo giọng đọc Studio AI (Text-to-Audio)</td>
                    <td className="py-3 text-center text-zinc-500">500 ký tự/ngày</td>
                    <td className="py-3 text-center font-bold text-amber-300">✅ Không giới hạn ký tự</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => handleTabChange('page2')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 inline-flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap size={16} fill="currentColor" />
                <span>Nâng Cấp VIP Ngay (Chỉ từ 20.000đ/tháng)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 2: NẠP VIP                                                         */}
      {/* ========================================================================= */}
      {internalPage === 'page2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Success / Error Notification Banners */}
          {vipSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{vipSuccessMessage}</div>
            </div>
          )}

          {vipErrorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{vipErrorMessage}</div>
            </div>
          )}

          {/* 1. VIP Packages Grid */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Bước 1: Chọn Gói Thành Viên VIP</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VIP_PACKAGES.map((pkg) => {
                const isSelected = selectedVipPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedVipPackage(pkg)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/10'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        ⭐ Phổ biến nhất
                      </div>
                    )}
                    {pkg.isBestValue && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        👑 Tiết kiệm 80%
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-1.5">
                          <span>{pkg.name}</span>
                          <span className="text-xs text-zinc-500 font-normal">({pkg.durationDays} ngày)</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-300 font-mono">
                          {pkg.priceVnd.toLocaleString()}đ
                        </span>
                        {pkg.originalPriceVnd && (
                          <span className="text-xs text-zinc-500 line-through font-mono">
                            {pkg.originalPriceVnd.toLocaleString()}đ
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                        {pkg.features.map((feat, fidx) => (
                          <div key={fidx} className="flex items-center gap-2 text-xs text-zinc-300">
                            <Check size={13} className="text-amber-400 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400">
                        +{pkg.bonusPoints} Xu Haevy tặng kèm
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-600'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Promo Code & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Promo Code & Payment Selector */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Bước 2: Mã Giảm Giá & Phương Thức Thanh Toán</span>
              </h3>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                  <Tag size={13} className="text-amber-400" />
                  <span>Mã Giảm Giá Khuyến Mãi</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: VIP2026, HE2026, AUDIO20..."
                    disabled={!!appliedPromo}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 uppercase"
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-500/30"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer border border-zinc-700"
                    >
                      Áp Dụng
                    </button>
                  )}
                </div>

                {appliedPromo && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={13} />
                    <span>Đã áp dụng mã {appliedPromo.code}: {appliedPromo.description}</span>
                  </p>
                )}

                {promoError && (
                  <p className="text-xs text-rose-400">{promoError}</p>
                )}
              </form>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400">Chọn Cổng Thanh Toán</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'vietqr', name: 'Quét VietQR Tự Động', icon: QrCode, desc: 'Mọi ngân hàng' },
                    { id: 'momo', name: 'Ví Điện Tử MoMo', icon: Smartphone, desc: 'Nhanh chóng 24/7' },
                    { id: 'zalopay', name: 'Ví ZaloPay', icon: Smartphone, desc: 'Xác thực tức thì' },
                    { id: 'card', name: 'Thẻ ATM / Visa / Master', icon: CreditCard, desc: 'Bảo mật PCI DSS' },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setVipPaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        vipPaymentMethod === method.id
                          ? 'bg-amber-950/25 border-amber-400 ring-1 ring-amber-400/40 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <method.icon size={18} className={vipPaymentMethod === method.id ? 'text-amber-400' : 'text-zinc-500'} />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold truncate">{method.name}</h5>
                        <p className="text-[10px] text-zinc-500">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: VietQR Dynamic Code & Checkout Confirmation */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center justify-between">
                  <span>Chi Tiết Thanh Toán & Kích Hoạt VIP</span>
                  <span className="text-xs font-mono font-bold text-amber-400">VietQR Pro</span>
                </h3>

                {/* Pricing Summary */}
                <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gói đã chọn:</span>
                    <span className="text-white font-bold">{selectedVipPackage.name} ({selectedVipPackage.durationDays} ngày)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Giá gốc:</span>
                    <span className="font-mono text-zinc-300">{vipOrig.toLocaleString()}đ</span>
                  </div>
                  {vipDisc > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Giảm giá khuyến mãi:</span>
                      <span className="font-mono">-{vipDisc.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                    <span>Tổng thanh toán:</span>
                    <span className="text-base font-black text-amber-300 font-mono">{vipFinal.toLocaleString()} VNĐ</span>
                  </div>
                </div>

                {/* Bank transfer info with Copy buttons */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400">Ngân hàng:</span>
                    <span className="font-bold text-white font-mono">MB BANK (Quân Đội)</span>
                  </div>
                  <div 
                    onClick={() => handleCopyText('999988886666', 'account_no')}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors"
                  >
                    <span className="text-zinc-400">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                      <span>999988886666</span>
                      {copiedBankInfo === 'account_no' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-amber-300" />}
                    </div>
                  </div>
                  <div 
                    onClick={() => handleCopyText(transferContentVip, 'content')}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors"
                  >
                    <span className="text-zinc-400">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                      <span className="truncate max-w-[180px]">{transferContentVip}</span>
                      {copiedBankInfo === 'content' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-amber-300" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirmVipPayment}
                disabled={isProcessingVip}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingVip ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang Xác Thực Thanh Toán...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="currentColor" />
                    <span>Xác Nhận Đã Thanh Toán & Kích Hoạt VIP Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent VIP Orders History */}
          {vipOrdersList.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-amber-400" />
                <span>Lịch Sử Đơn Nạp VIP Gần Đây</span>
              </h4>
              <div className="divide-y divide-zinc-800/80">
                {vipOrdersList.map((order) => (
                  <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{order.packageName}</span>
                      <p className="text-[11px] text-zinc-500">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'} • {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-300">+{order.durationDays} ngày VIP</span>
                      <p className="text-[11px] text-emerald-400 font-bold">Thành công</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 3: NẠP XU HAEVY (1:1 VỚI XU CŨ)                                    */}
      {/* ========================================================================= */}
      {internalPage === 'page3' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Ratio Banner & Current Balance Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Nạp Xu Haevy (Tỷ Lệ 1:1 Chuẩn Xác)
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Xu Haevy là đơn vị tiền tệ chính thức trên nền tảng. 1.000 VNĐ = 50 Xu Haevy (+ tặng thêm lên đến 30% Xu thưởng).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins size={20} />
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 font-medium">Số dư Xu Haevy:</span>
                <p className="text-base font-black text-amber-300 font-mono">
                  {audioPoints.toLocaleString()} Xu
                </p>
              </div>
            </div>
          </div>

          {/* Success / Error Notification Banners */}
          {coinSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{coinSuccessMessage}</div>
            </div>
          )}

          {coinErrorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{coinErrorMessage}</div>
            </div>
          )}

          {/* Xu Haevy Packages Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Chọn Gói Nạp Xu Haevy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {POINT_TOPUP_PACKAGES.map((pkg) => {
                const isSelected = selectedCoinPackage.id === pkg.id;
                const totalCoins = pkg.points + (pkg.bonusPoints || 0);

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedCoinPackage(pkg)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/10'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {pkg.tag && (
                      <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        {pkg.tag}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-1.5">
                          <span>{pkg.name}</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-300 font-mono">
                          +{totalCoins.toLocaleString()} Xu
                        </span>
                        {pkg.bonusPoints > 0 && (
                          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            +{pkg.bonusPoints} Xu thưởng
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-400 font-mono">
                        Giá nạp: <strong className="text-white text-sm">{pkg.priceVnd.toLocaleString()}đ</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">Tỷ lệ quy đổi 1:1</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-600'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Xu Haevy Checkout Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-amber-400" />
                <span>Phương Thức Thanh Toán Nạp Xu</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'vietqr', name: 'VietQR Ngân Hàng', icon: QrCode },
                  { id: 'momo', name: 'Ví MoMo', icon: Smartphone },
                  { id: 'zalopay', name: 'ZaloPay', icon: Smartphone },
                  { id: 'card', name: 'Thẻ Quốc Tế', icon: CreditCard },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setCoinPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      coinPaymentMethod === m.id
                        ? 'bg-amber-950/25 border-amber-400 ring-1 ring-amber-400/40 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <m.icon size={16} className={coinPaymentMethod === m.id ? 'text-amber-400' : 'text-zinc-500'} />
                    <span className="text-xs font-bold">{m.name}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Số Xu Haevy nhận:</span>
                  <span className="text-amber-300 font-bold font-mono">
                    +{(selectedCoinPackage.points + (selectedCoinPackage.bonusPoints || 0)).toLocaleString()} Xu
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Số tiền thanh toán:</span>
                  <span className="text-amber-300 font-mono text-sm">{coinFinal.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Transfer details & confirmation button */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div 
                  onClick={() => handleCopyText('999988886666', 'coin_account')}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors"
                >
                  <span className="text-zinc-400">STK MB Bank:</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                    <span>999988886666</span>
                    {copiedBankInfo === 'coin_account' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-amber-300" />}
                  </div>
                </div>

                <div 
                  onClick={() => handleCopyText(transferContentCoin, 'coin_content')}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors"
                >
                  <span className="text-zinc-400">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                    <span className="truncate max-w-[180px]">{transferContentCoin}</span>
                    {copiedBankInfo === 'coin_content' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-amber-300" />}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmCoinPayment}
                disabled={isProcessingCoin}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingCoin ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang Xử Lý Nạp Xu...</span>
                  </>
                ) : (
                  <>
                    <Coins size={16} fill="currentColor" />
                    <span>Xác Nhận Nạp +{(selectedCoinPackage.points + (selectedCoinPackage.bonusPoints || 0)).toLocaleString()} Xu Haevy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Xu Haevy Transactions */}
          {pointTransactions.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-amber-400" />
                <span>Biến Động Số Dư Xu Haevy Gần Đây</span>
              </h4>
              <div className="divide-y divide-zinc-800/80">
                {pointTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-200">{tx.title}</span>
                      <p className="text-[11px] text-zinc-500">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount >= 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} Xu
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 4: TẶNG GÓI VIP HAY XU HAEVY CHO NGƯỜI KHÁC                         */}
      {/* ========================================================================= */}
      {internalPage === 'page4' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Mode Switcher */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <span>Tặng Quà Cho Bạn Bè & Người Thân</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tặng trực tiếp Gói VIP hoặc Chuyển Xu Haevy từ số dư của bạn qua ID Tài Khoản hoặc Email.
                </p>
              </div>

              {/* Sub Mode Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                <button
                  onClick={() => setGiftMode('gift_vip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    giftMode === 'gift_vip'
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🎁 Tặng Gói VIP
                </button>
                <button
                  onClick={() => setGiftMode('transfer_coins')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    giftMode === 'transfer_coins'
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  💰 Chuyển Xu Haevy
                </button>
              </div>
            </div>

            {/* Recipient Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <UserIcon size={14} className="text-amber-400" />
                <span>Nhập ID Tài Khoản Hoặc Email Người Nhận:</span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={giftRecipientInput}
                    onChange={(e) => {
                      setGiftRecipientInput(e.target.value);
                      setRecipientPreview(null);
                      setRecipientSearchError('');
                    }}
                    placeholder="VD: ID tài khoản (ACC8888) hoặc email bạn bè..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  {giftRecipientInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setGiftRecipientInput('');
                        setRecipientPreview(null);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearchRecipient}
                  disabled={isSearchingRecipient}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer border border-zinc-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSearchingRecipient ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>Kiểm Tra</span>
                </button>
              </div>

              {/* Recipient Verified Preview Card */}
              {recipientPreview && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      {recipientPreview.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{recipientPreview.name}</span>
                        {recipientPreview.isVip && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/40">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {recipientPreview.accountId ? `ID: ${recipientPreview.accountId}` : recipientPreview.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Đã xác thực</span>
                  </span>
                </div>
              )}

              {recipientSearchError && (
                <p className="text-xs text-rose-400">{recipientSearchError}</p>
              )}
            </div>

            {/* Custom Greeting Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Lời Nhắn Chúc Mừng Gửi Kèm (Tùy chọn):</label>
              <input
                type="text"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="VD: Chúc bạn có những phút giây thư giãn tuyệt vời cùng âm nhạc Hi-Fi!"
                maxLength={120}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Success / Error Notification Banners */}
          {giftSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{giftSuccessMessage}</div>
            </div>
          )}

          {giftErrorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium">{giftErrorMessage}</div>
            </div>
          )}

          {/* SUB-SECTION 1: TẶNG GÓI VIP CHO BẠN BÈ */}
          {giftMode === 'gift_vip' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span>Chọn Gói VIP Muốn Tặng</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VIP_PACKAGES.map((pkg) => {
                  const isSelected = giftSelectedVipPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setGiftSelectedVipPkg(pkg)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/40 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm">{pkg.name} ({pkg.durationDays} ngày)</span>
                        <span className="font-mono font-bold text-amber-300">{pkg.priceVnd.toLocaleString()}đ</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{pkg.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Gift VIP Payment & Submit */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-zinc-400">Gói tặng: <strong className="text-white">{giftSelectedVipPkg.name}</strong></span>
                  <p className="text-sm font-mono font-black text-amber-300">
                    Tổng thanh toán: {giftSelectedVipPkg.priceVnd.toLocaleString()} VNĐ
                  </p>
                </div>

                <button
                  onClick={handleConfirmGiftVip}
                  disabled={isSubmittingGift}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingGift ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang Gửi Tặng Gói VIP...</span>
                    </>
                  ) : (
                    <>
                      <Gift size={16} />
                      <span>Thanh Toán & Kích Hoạt VIP Cho Bạn Bè</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUB-SECTION 2: CHUYỂN TẶNG XU HAEVY */}
          {giftMode === 'transfer_coins' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins size={16} className="text-amber-400" />
                <span>Chọn Số Lượng Xu Haevy Muốn Chuyển Tặng</span>
              </h4>

              {/* Quick Select Coin Amount Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setGiftCoinAmount(amt);
                      setGiftCustomCoins('');
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      !giftCustomCoins && giftCoinAmount === amt
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {amt.toLocaleString()} Xu
                  </button>
                ))}
              </div>

              {/* Custom Coin Amount Input */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Hoặc nhập số lượng Xu tùy chỉnh:</label>
                <input
                  type="number"
                  value={giftCustomCoins}
                  onChange={(e) => setGiftCustomCoins(e.target.value)}
                  placeholder="Nhập số Xu Haevy muốn tặng..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-amber-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Transfer Coins Submit */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-zinc-400">
                    Số dư hiện có: <strong className="text-amber-300 font-mono">{audioPoints.toLocaleString()} Xu</strong>
                  </span>
                  <p className="text-sm font-mono font-black text-white">
                    Sẽ chuyển tặng: {giftCustomCoins ? parseInt(giftCustomCoins, 10).toLocaleString() : giftCoinAmount.toLocaleString()} Xu Haevy
                  </p>
                </div>

                <button
                  onClick={handleConfirmTransferCoins}
                  disabled={isSubmittingGift}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingGift ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang Chuyển Xu Haevy...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Xác Nhận Chuyển Xu Haevy Tức Thì</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
