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
  TrendingUp,
  Compass,
  BrainCircuit,
  GitFork,
  Calendar,
  Eye,
  Gamepad2,
  Gem
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGiftEffect } from '../context/GiftEffectContext';
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
import { VipAiIntelligenceDashboard } from './VipAiIntelligenceDashboard';
import { BillionaireLoungeView } from './vip/BillionaireLoungeView';

interface VipTopupViewProps {
  onOpenAuth: () => void;
  onGoToProfile?: () => void;
  allTracks?: Track[];
  currentTrack?: Track;
  onOpenGiftShopModal?: (author?: any) => void;
  activePage?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6';
  onSelectPage?: (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6') => void;
  onNavigateMode?: (mode: string, params?: any) => void;
}

export const VIP_PACKAGES: VipPackage[] = [
  {
    id: 'week',
    name: 'Gói VIP Tuần',
    durationDays: 7,
    priceVnd: 30000,
    bonusPoints: 300,
    tier: 'vip',
    description: 'Trải nghiệm âm thanh Hi-Fi, x3 Xu Haevy & mở khóa đặc quyền đa chế độ trong 7 ngày',
    features: [
      'Âm thanh Hi-Fi Lossless 320kbps & 24-bit/96kHz',
      'Haevy Spiritual: Trải 78 lá Tarot 3D & Xem Tử Vi 2026',
      'Haevy AI Master: Phân tích tài liệu logic chuyên sâu không giới hạn',
      'Haevy Finance: Tăng x3 Xu Haevy & 0% Phí chuyển xu',
      'Haevy Message: Khung avatar VIP & Tin nhắn thoại HD',
      'Haevy Studio: Giảm 33% phí AI Voice & Hàng chờ số 1',
      'Haevy Lite: Tặng trọn bộ 7 Phông Chữ Độc Quyền',
      'Thưởng ngay +300 Xu Haevy'
    ]
  },
  {
    id: 'month',
    name: 'Gói VIP 1 Tháng',
    durationDays: 30,
    priceVnd: 40000,
    originalPriceVnd: 120000,
    bonusPoints: 1000,
    tier: 'vip',
    isPopular: true,
    description: 'Gói tiết kiệm & được yêu thích nhất cho người dùng trải nghiệm toàn hệ sinh thái',
    features: [
      'Đặc quyền trọn vẹn Hi-Fi Lossless & Spatial 3D Audio 360°',
      'Haevy Spiritual: Không giới hạn Tarot 3D & 9 Sóng Solfeggio 8D',
      'Haevy AI: Luồng GPU riêng Zero-Wait & Gia sư AI phân tích bản chất logic',
      'Haevy Space: Bộ cọ 3D AR Neon Cực Quang & Son 3D giáp vàng',
      'Haevy Games: Nhân đôi (x2) điểm thưởng & Vòng quay VIP 100% trúng',
      'Haevy Lite: Khung Avatar Rồng Vàng Dragon Aura & Giảm 50% Shop',
      'Haevy Finance: Nhân 3 (x3) Xu & Sinh lời +15%/năm Két Sắt',
      'Haevy Message: Cùng Nghe Nhạc (Listen Together) & Sticker VIP 3D',
      '100% Không quảng cáo & Tải Offline Lossless không giới hạn',
      'Thưởng ngay +1.000 Xu Haevy'
    ]
  },
  {
    id: '3month',
    name: 'Gói VIP 3 Tháng',
    durationDays: 90,
    priceVnd: 90000,
    originalPriceVnd: 360000,
    bonusPoints: 2500,
    tier: 'vip',
    description: 'Tiết kiệm chi phí, đặc quyền toàn năng suốt 90 ngày liên tục',
    features: [
      'Đặc quyền VIP trọn gói 90 ngày liên tục toàn bộ 12 phân hệ',
      'Haevy Family Tree: Quản lý gia phả vô hạn đời & Báo lịch giỗ đa kênh',
      'Haevy Spiritual: Chiêm tinh học Natal Chart & Luận giải Đại Hạn 2026',
      'Haevy Games: Siêu xe thần thoại & Chiến cơ không gian mạ vàng',
      'Haevy Finance: Rút thưởng về MB Bank tức thì dưới 30s',
      'Haevy Studio: Tác phẩm đẩy Top 1 BXH & Xuất FLAC 24-bit',
      'Haevy Message: Ghim hội thoại & Lưu trữ đám mây vô hạn',
      'I Love Haevy: Trợ lý AI sáng tạo thơ tình & Lời chúc đôi',
      'Thưởng ngay +2.500 Xu Haevy'
    ]
  },
  {
    id: '6month',
    name: 'Gói VIP 6 Tháng',
    durationDays: 180,
    priceVnd: 160000,
    originalPriceVnd: 720000,
    bonusPoints: 5000,
    tier: 'vip',
    description: 'Nửa năm trải nghiệm đỉnh cao với ưu đãi vượt trội',
    features: [
      'Trải nghiệm VIP toàn diện 180 ngày đẳng cấp Hoàng Gia',
      'Haevy Space: Xuất mô hình 3D chuẩn .GLB & Video 4K 60FPS',
      'Haevy Studio: Bộ trộn Multi-Track đa tầng & Tách lời AI Vocal Remover',
      'Haevy Finance: Báo cáo tài chính & Phân tích 6 hũ dòng tiền AI',
      'Haevy Family Tree: Số hóa văn bia sắc phong cổ chuẩn Ultra-HD',
      'I Love Haevy: Khung nhẫn đôi & Nhịp tim phát sáng đồng bộ',
      'Đường truyền máy chủ CDN riêng biệt Zero-Latency 0ms',
      'Thưởng ngay +5.000 Xu Haevy'
    ]
  },
  {
    id: 'year',
    name: 'Gói VIP Trọn Năm',
    durationDays: 365,
    priceVnd: 280000,
    originalPriceVnd: 1440000,
    bonusPoints: 12000,
    tier: 'vip',
    isBestValue: true,
    description: 'Tiết kiệm tới 80% chi phí - Trở thành VIP Hoàng Gia đích thực',
    features: [
      'Đặc quyền VIP Hoàng Gia 365 ngày mở khóa 100% tính năng tất cả chế độ',
      'Toàn quyền: Spiritual + AI Master + Space + Games + Family Tree + Lite',
      'Vương Miện mạ vàng & Golden Aura phát sáng trên toàn hệ thống',
      'Trọn bộ 6 Preset Dolby Theater & Equalizer 10 băng tần',
      'Tặng trọn gói kho giao diện Royal, Cyber Neon & Luxury',
      'Thưởng ngay +12.000 Xu Haevy cực khủng'
    ]
  },
  {
    id: 'centurion_sovereign',
    name: 'Gói Siêu Giàu Centurion (Vĩnh Viễn)',
    durationDays: 36500,
    priceVnd: 999000,
    originalPriceVnd: 9999000,
    bonusPoints: 100000,
    tier: 'vip',
    isBestValue: true,
    description: 'Đặc quyền tối cao của giới siêu giàu - Sở hữu Thẻ Đen Centurion Titanium trọn đời & Quản gia AI riêng 24/7',
    features: [
      'Đặc quyền Thẻ Đen Centurion Sovereign Trọn Đời (Vĩnh Viễn)',
      'Quản gia AI riêng (Butler Sterling) phục vụ 24/7 tức thì',
      'Thẻ kim loại Titanium nguyên khối NFC khắc laser gửi tận nơi',
      'Âm thanh Audiophile 32-bit DSD Master 11.2MHz & Không gian 360°',
      'Két sắt Lượng tử Thụy Sĩ bảo toàn 100% tài sản trong hệ sinh thái',
      'Miễn 100% thuế phí chuyển tiền & Không giới hạn hạn mức giao dịch',
      'Đường truyền vệ tinh riêng biệt Zero-Latency 0ms cho mọi dịch vụ',
      'Bảo hộ vĩnh cửu cây gia phả dòng họ & di sản muôn đời',
      'Thưởng ngay +100.000 Xu Haevy cực khủng'
    ]
  }
];

const AVAILABLE_PROMO_CODES: PromoCode[] = [
  { code: 'VIP2026', discountType: 'percentage', value: 20, description: 'Giảm 20% tổng hóa đơn chào đón năm 2026' },
  { code: 'HE2026', discountType: 'fixed', value: 10000, description: 'Giảm ngay 10.000đ cho tất cả gói nạp' },
  { code: 'BILLIONAIRE', discountType: 'percentage', value: 30, description: 'Mã đặc quyền siêu giàu giảm 30% gói Centurion' },
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
  onSelectPage,
  onNavigateMode
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
  const { triggerGiftEffect } = useGiftEffect();

  // Internal tab state synced with activePage prop
  const [internalPage, setInternalPage] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6'>(activePage);

  useEffect(() => {
    if (activePage) {
      setInternalPage(activePage);
    }
  }, [activePage]);

  const handleTabChange = (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6') => {
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
  const [vipPaymentMethod, setVipPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay'>('vietqr');
  const [isProcessingVip, setIsProcessingVip] = useState(false);
  const [vipSuccessMessage, setVipSuccessMessage] = useState('');
  const [vipErrorMessage, setVipErrorMessage] = useState('');
  const [copiedBankInfo, setCopiedBankInfo] = useState<string | null>(null);
  const [vipOrdersList, setVipOrdersList] = useState<VipOrder[]>([]);

  // --- PRIVILEGES FILTER (PAGE 1) ---
  const [privilegeCategoryTab, setPrivilegeCategoryTab] = useState<string>('all');
  const [privilegeSearchQuery, setPrivilegeSearchQuery] = useState<string>('');
  const [qrModalOpen, setQrModalOpen] = useState(false);

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
        triggerGiftEffect({
          giftId: giftSelectedVipPkg.id,
          giftName: `Gói VIP ${giftSelectedVipPkg.name}`,
          giftEmoji: '👑',
          senderName: user.displayName || 'Bạn',
          senderAvatar: user.photoURL || undefined,
          recipientName: giftRecipientInput.trim(),
          pointsCost: giftSelectedVipPkg.priceVnd,
          rarity: 'legendary',
          message: giftMessage.trim() || 'Tặng bạn gói VIP thưởng thức âm nhạc đỉnh cao!'
        });
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
        triggerGiftEffect({
          giftId: 'transfer_coins_gift',
          giftName: `${actualCoins.toLocaleString()} Xu Haevy`,
          giftEmoji: '🪙',
          senderName: user.displayName || 'Bạn',
          senderAvatar: user.photoURL || undefined,
          recipientName: giftRecipientInput.trim(),
          pointsCost: actualCoins,
          rarity: actualCoins >= 5000 ? 'legendary' : actualCoins >= 1000 ? 'epic' : 'rare',
          message: giftMessage.trim() || 'Tặng bạn Xu Haevy để cùng tận hưởng âm nhạc!'
        });
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

  const qrImageUrlVip = `https://img.vietqr.io/image/VPB-0795249860-compact2.png?amount=${vipFinal}&addInfo=${encodeURIComponent(transferContentVip)}&accountName=HA%20QUANG%20KHAI`;
  const qrImageUrlCoin = `https://img.vietqr.io/image/VPB-0795249860-compact2.png?amount=${coinFinal}&addInfo=${encodeURIComponent(transferContentCoin)}&accountName=HA%20QUANG%20KHAI`;

  return (
    <div id="haevy-vip-hub" className="min-h-screen bg-zinc-950 text-zinc-100 pb-36 pt-1 sm:pt-2 px-2.5 sm:px-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-250 w-full overflow-hidden sm:overflow-visible">
      
      {/* ========================================================================= */}
      {/* MASTER TOP LOGO & VIP HUB HEADER                                          */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-500/40 p-4 sm:p-7 shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Main Royal VIP Brand Emblem at TOP */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/20 animate-pulse" />
                <Crown size={26} className="text-amber-400 fill-amber-400 relative z-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">VIP</span>
                </h1>
                <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1">
                  ⭐ Hoàng Gia Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-snug break-words">
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

        {/* 4 Mode Navigation Tabs with Touch Horizontal Scroll & Mobile-friendly Labels */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
          <button
            id="vip-tab-page1"
            onClick={() => handleTabChange('page1')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page1'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Crown size={15} className={internalPage === 'page1' ? 'fill-black' : 'text-amber-400'} />
            <span className="sm:hidden">Đặc Quyền</span>
            <span className="hidden sm:inline">Trang 1: Đặc Quyền VIP</span>
          </button>

          <button
            id="vip-tab-page2"
            onClick={() => handleTabChange('page2')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page2'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Zap size={15} className={internalPage === 'page2' ? 'fill-black' : 'text-amber-400'} />
            <span className="sm:hidden">Nạp VIP</span>
            <span className="hidden sm:inline">Trang 2: Nạp VIP</span>
          </button>

          <button
            id="vip-tab-page3"
            onClick={() => handleTabChange('page3')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page3'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Coins size={15} className={internalPage === 'page3' ? 'fill-black' : 'text-amber-400'} />
            <span className="sm:hidden">Nạp Xu</span>
            <span className="hidden sm:inline">Trang 3: Nạp Xu Haevy</span>
          </button>

          <button
            id="vip-tab-page4"
            onClick={() => handleTabChange('page4')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page4'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Gift size={15} className={internalPage === 'page4' ? 'fill-black' : 'text-amber-400'} />
            <span className="sm:hidden">Tặng Bạn</span>
            <span className="hidden sm:inline">Trang 4: Tặng Bạn Bè</span>
          </button>

          <button
            id="vip-tab-page5"
            onClick={() => handleTabChange('page5')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page5'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 hover:border-amber-500/70 shadow-sm'
            }`}
          >
            <BrainCircuit size={15} className={internalPage === 'page5' ? 'fill-black text-black' : 'text-amber-400 animate-pulse'} />
            <span className="sm:hidden">AI VIP</span>
            <span className="hidden sm:inline">Trang 5: AI VIP Intelligence</span>
          </button>

          <button
            id="vip-tab-page6"
            onClick={() => handleTabChange('page6')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
              internalPage === 'page6'
                ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/30 font-black'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-yellow-300 border border-yellow-500/50 hover:border-yellow-400 shadow-sm'
            }`}
          >
            <Gem size={15} className={internalPage === 'page6' ? 'fill-black text-black' : 'text-yellow-400 animate-pulse'} />
            <span className="sm:hidden">Thượng Lưu 👑</span>
            <span className="hidden sm:inline">Trang 6: Thượng Lưu 👑 (Billionaire)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRANG 1: ĐẶC QUYỀN VIP                                                   */}
      {/* ========================================================================= */}
      {internalPage === 'page1' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          
          {/* Billionaire Lounge & Black Card Callout Banner */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/25 via-yellow-500/10 to-zinc-900 border-2 border-yellow-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-yellow-500/10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-yellow-500/40">
                <Crown size={24} className="fill-black" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={11} className="text-yellow-300" />
                  <span>Haevy Centurion Sovereign • Độc Bản 24K</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Trải Nghiệm Thượng Lưu & Thẻ Đen Centurion 3D</span>
                  <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-md font-black uppercase">Mới</span>
                </h3>
                <p className="text-xs text-zinc-300">
                  Phòng Thương Gia Siêu Giàu: Quản gia riêng AI Sterling 24/7, Thẻ Đen Titanium 3D, Két sắt Thụy Sĩ & Sâm Panh Mưa Vàng 24K.
                </p>
              </div>
            </div>
            <button
              id="btn-goto-billionaire-lounge"
              onClick={() => handleTabChange('page6')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 text-black font-black text-xs transition-all shadow-md shadow-yellow-500/30 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <span>Vào Phòng Thượng Lưu</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* AI VIP Intelligence Highlight Callout Banner */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/20">
                <BrainCircuit size={24} />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Gemini 3.8 Flash • AI Autonomous VIP</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Khám Phá AI VIP Intelligence Dashboard
                </h3>
                <p className="text-xs text-zinc-300">
                  Phân tích hành vi cá nhân & tối ưu hóa tự động 12 phân hệ Haevy đạt hiệu suất đặc quyền tối đa.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTabChange('page5')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <span>Mở Dashboard AI</span>
              <ArrowRight size={14} />
            </button>
          </div>
          
          {/* Interactive Sound Quality Comparison Demo Card */}
          <div className="p-4 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 sm:pb-4">
              <div>
                <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                  <Headphones size={20} className="text-amber-400 shrink-0" />
                  <span>Trải Nghiệm Thử Nghiệm Chất Lượng Âm Thanh VIP</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Chạm để so sánh sự khác biệt giữa chuẩn 128kbps thường và 320kbps Lossless Master / 3D Audio
                </p>
              </div>

              <button
                onClick={() => handleTabChange('page2')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              >
                <Zap size={14} fill="currentColor" />
                <span>Nâng Cấp VIP Ngay</span>
              </button>
            </div>

            {/* Quality Switcher Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div
                onClick={() => setSoundTestQuality('standard')}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  soundTestQuality === 'standard'
                    ? 'bg-zinc-800/90 border-zinc-600 shadow-md ring-1 ring-zinc-500'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Chuẩn Thường</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">128 kbps</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">Âm thanh nén tiêu chuẩn, dải động vừa phải, phù hợp kết nối 3G yếu.</p>
              </div>

              <div
                onClick={() => setSoundTestQuality('hifi')}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
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
                <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">Âm thanh chi tiết, dải trầm sâu lắng, âm trung trong trẻo không suy hao.</p>
              </div>

              <div
                onClick={() => setSoundTestQuality('spatial')}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
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
                <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">Mô phỏng trường âm vòm 3D như đang ngồi trực tiếp tại rạp hát thính phòng.</p>
              </div>
            </div>

            {/* Simulated Live Visualizer Spectrum */}
            <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Volume2 size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white break-words">
                    {soundTestQuality === 'standard' ? 'Đang mô phỏng: 128kbps Standard' : soundTestQuality === 'hifi' ? 'Đang mô phỏng: 320kbps Hi-Fi Studio FLAC' : 'Đang mô phỏng: Spatial 3D Audio 360°'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 break-words mt-0.5">
                    {soundTestQuality === 'standard' ? 'Dynamic Range: 60dB | Cắt tần >16kHz' : soundTestQuality === 'hifi' ? 'Dynamic Range: 144dB | Full Frequency 20Hz - 48kHz' : 'Dolby Atmos Directional Simulation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 h-6 shrink-0">
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

          {/* Full Grid of VIP Privileges with Category Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Kho Đặc Quyền Toàn Diện Haevy VIP</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Mở khóa trọn bộ tính năng cao cấp nhất trên toàn bộ hệ sinh thái Haevy Audio.
                </p>
              </div>
              <span className="text-xs text-amber-400 font-mono self-start sm:self-auto bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                100% Độc Quyền VIP
              </span>
            </div>

            {/* Search and Category Filter Tabs */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đặc quyền VIP (VD: Tarot, AI, Games, Gia Phả, Hi-Fi, Két Sắt, Font, Avatar...)"
                  value={privilegeSearchQuery}
                  onChange={(e) => setPrivilegeSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                {privilegeSearchQuery && (
                  <button
                    onClick={() => setPrivilegeSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar text-xs">
                {[
                  { id: 'all', label: '✨ Tất Cả', count: VIP_PRIVILEGES_LIST.length },
                  { id: 'spiritual', label: '🔮 Spiritual', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'spiritual').length },
                  { id: 'haevy_ai', label: '🧠 AI Master', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'haevy_ai').length },
                  { id: 'space', label: '🌌 Space 3D AR', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'space').length },
                  { id: 'games', label: '🎮 Games', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'games').length },
                  { id: 'family_tree', label: '👑 Gia Phả', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'family_tree').length },
                  { id: 'haevy_lite', label: '💎 Haevy Lite', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'haevy_lite').length },
                  { id: 'finance', label: '💰 Haevy Finance', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'finance').length },
                  { id: 'studio', label: '🎙️ Haevy Studio', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'studio').length },
                  { id: 'messages', label: '💬 Haevy Message', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'messages').length },
                  { id: 'couple', label: '💖 I Love Haevy', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'couple').length },
                  { id: 'audio', label: '🎵 Âm Thanh & Hi-Fi', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'audio').length },
                  { id: 'playback', label: '⚡ Phát Nhạc', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'playback').length },
                  { id: 'downloads', label: '📥 Tải Offline', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'downloads').length },
                  { id: 'social', label: '👑 Giao Diện & Social', count: VIP_PRIVILEGES_LIST.filter(p => p.category === 'social').length },
                ].map((tab) => {
                  const isActive = privilegeCategoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPrivilegeCategoryTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black shadow-md shadow-amber-500/20'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtered Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {VIP_PRIVILEGES_LIST.filter(item => {
                const matchCategory = privilegeCategoryTab === 'all' || item.category === privilegeCategoryTab;
                const matchSearch = !privilegeSearchQuery.trim() ||
                  item.title.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                  item.shortDesc.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                  item.detailedBenefit.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                  (item.badge && item.badge.toLowerCase().includes(privilegeSearchQuery.toLowerCase()));
                return matchCategory && matchSearch;
              }).map((item, idx) => {
                const getCategoryMeta = (cat: string) => {
                  switch (cat) {
                    case 'spiritual': return { label: 'Haevy Spiritual', icon: <Sparkles size={16} className="text-purple-400" />, border: 'border-purple-500/20', bg: 'bg-purple-500/10' };
                    case 'haevy_ai': return { label: 'Haevy AI Master', icon: <BrainCircuit size={16} className="text-indigo-400" />, border: 'border-indigo-500/20', bg: 'bg-indigo-500/10' };
                    case 'space': return { label: 'Haevy Space 3D', icon: <Compass size={16} className="text-cyan-400" />, border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' };
                    case 'games': return { label: 'Haevy Games', icon: <Gamepad2 size={16} className="text-amber-400" />, border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
                    case 'family_tree': return { label: 'Haevy Gia Phả', icon: <GitFork size={16} className="text-amber-500" />, border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
                    case 'haevy_lite': return { label: 'Haevy Lite', icon: <Crown size={16} className="text-pink-400" />, border: 'border-pink-500/20', bg: 'bg-pink-500/10' };
                    case 'finance': return { label: 'Haevy Finance', icon: <Coins size={16} className="text-emerald-400" />, border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };
                    case 'studio': return { label: 'Haevy Studio', icon: <Sliders size={16} className="text-rose-400" />, border: 'border-rose-500/20', bg: 'bg-rose-500/10' };
                    case 'messages': return { label: 'Haevy Message', icon: <Send size={16} className="text-sky-400" />, border: 'border-sky-500/20', bg: 'bg-sky-500/10' };
                    case 'couple': return { label: 'I Love Haevy', icon: <Heart size={16} className="text-rose-400" />, border: 'border-rose-500/20', bg: 'bg-rose-500/10' };
                    case 'audio': return { label: 'Hi-Fi Audio', icon: <Headphones size={16} className="text-indigo-400" />, border: 'border-indigo-500/20', bg: 'bg-indigo-500/10' };
                    case 'playback': return { label: 'Phát Nhạc', icon: <Zap size={16} className="text-amber-400" />, border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
                    case 'downloads': return { label: 'Tải Offline', icon: <Download size={16} className="text-blue-400" />, border: 'border-blue-500/20', bg: 'bg-blue-500/10' };
                    default: return { label: 'Social VIP', icon: <Sparkles size={16} className="text-amber-400" />, border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
                  }
                };
                const meta = getCategoryMeta(item.category);
                return (
                  <div
                    key={item.id || idx}
                    className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 transition-all flex flex-col justify-between group space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          {meta.icon}
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
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed break-words">
                          {item.detailedBenefit || item.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="capitalize text-zinc-500 font-mono text-[10px]">
                        {meta.label}
                      </span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {VIP_PRIVILEGES_LIST.filter(item => {
              const matchCategory = privilegeCategoryTab === 'all' || item.category === privilegeCategoryTab;
              const matchSearch = !privilegeSearchQuery.trim() ||
                item.title.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                item.shortDesc.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                item.detailedBenefit.toLowerCase().includes(privilegeSearchQuery.toLowerCase()) ||
                (item.badge && item.badge.toLowerCase().includes(privilegeSearchQuery.toLowerCase()));
              return matchCategory && matchSearch;
            }).length === 0 && (
              <div className="text-center py-10 px-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
                Không tìm thấy đặc quyền phù hợp với từ khóa "{privilegeSearchQuery}".
              </div>
            )}
          </div>

          {/* Comparison: Standard Free vs VIP */}
          <div className="p-4 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 border-b border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                <Crown size={18} className="text-amber-400 fill-amber-400 shrink-0" />
                <span>Bảng So Sánh Quyền Lợi Toàn Diện: Bản Chuẩn vs Haevy VIP</span>
              </h3>
            </div>

            {/* Mobile-Friendly Comparison Cards (Visible on mobile screens) */}
            <div className="grid grid-cols-1 gap-2.5 sm:hidden">
              {[
                { title: 'Chất lượng âm thanh', free: '128 kbps', vip: '320kbps & 24-bit Lossless' },
                { title: 'Không gian âm thanh 3D', free: '❌ Không', vip: '✅ Spatial 360° Surround' },
                { title: '🔮 Haevy Spiritual', free: '1 trải bài cơ bản/ngày', vip: '✨ Không giới hạn 78 lá 3D & Tử Vi 2026' },
                { title: '🧠 Haevy AI Master & Study', free: '10 câu hỏi/ngày, cơ bản', vip: '⚡ Luồng GPU riêng, phân tích logic sâu' },
                { title: '🌌 Haevy Space 3D AR', free: '2 cọ cơ bản', vip: '🎨 Cọ Neon Cực Quang & Son 3D giáp vàng' },
                { title: '🎮 Haevy Games', free: 'Thưởng chuẩn 1x', vip: '🔥 x2 Thưởng, Vòng Quay VIP & Xe đua vàng' },
                { title: '👑 Gia Phả Dòng Tộc', free: 'Tối đa 2 đời', vip: '📜 Vô hạn đời & Báo lịch giỗ đa kênh' },
                { title: '💎 Haevy Lite Trang Sức', free: 'Mua lẻ bằng Xu', vip: '👑 Full 7 Fonts VIP & Dragon Aura' },
                { title: '💰 Haevy Finance', free: '1x Chuẩn, có phí chuyển', vip: '🔥 x3 Xu, 0% phí & Rút MB Bank 30s' },
                { title: '🎙️ Haevy Studio', free: '500 ký tự, 75 pts/lượt', vip: '🎧 -33% phí, Master FLAC & Top 1 BXH' },
                { title: '💬 Haevy Message', free: 'Tin nhắn cơ bản', vip: '👑 Khung Gold, Listen Together' },
                { title: '💖 I Love Haevy', free: '1 Theme cơ bản', vip: '💑 Full Theme, Voice Capsule & AI Thơ' },
                { title: '📥 Tải nhạc Offline', free: 'Tối đa 3 bài', vip: '✅ Không giới hạn FLAC' },
                { title: '⚡ Trải nghiệm & Nghe nền', free: 'Có quảng cáo', vip: '✅ 100% Không quảng cáo & Chạy nền' },
                { title: '👑 Huy hiệu Vương Miện VIP', free: '❌ Không', vip: '👑 Vương Miện Hoàng Gia & Golden Aura' }
              ].map((row, rIdx) => (
                <div key={rIdx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <div className="text-xs font-bold text-white">{row.title}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <span className="block text-[10px] text-zinc-500 font-semibold mb-0.5">Bản Chuẩn:</span>
                      <span className="font-medium">{row.free}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300">
                      <span className="block text-[10px] text-amber-400/80 font-bold mb-0.5">Haevy VIP 👑:</span>
                      <span className="font-black">{row.vip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (Visible on sm+) */}
            <div className="hidden sm:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-bold">Tính Năng / Quyền Lợi Theo Chế Độ</th>
                    <th className="pb-3 font-bold text-center w-36">Bản Chuẩn</th>
                    <th className="pb-3 font-bold text-center w-52 text-amber-300">Haevy VIP 👑</th>
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
                    <td className="py-3 font-medium">🔮 Haevy Spiritual: Tarot 3D & Tử Vi 2026</td>
                    <td className="py-3 text-center text-zinc-500">1 trải bài/ngày</td>
                    <td className="py-3 text-center font-bold text-purple-400">✅ Không giới hạn 78 lá 3D & Tử Vi</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">🧠 Haevy AI Master: Phân tích bản chất logic</td>
                    <td className="py-3 text-center text-zinc-500">10 câu hỏi/ngày</td>
                    <td className="py-3 text-center font-bold text-indigo-400">✅ Không giới hạn & Luồng GPU Zero-Wait</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">🌌 Haevy Space: Vẽ 3D AR & Linh vật Son</td>
                    <td className="py-3 text-center text-zinc-500">2 cọ cơ bản</td>
                    <td className="py-3 text-center font-bold text-cyan-400">✅ Cọ Neon Cực Quang & Son Giáp Vàng</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">🎮 Haevy Games: Điểm thưởng & Trang bị</td>
                    <td className="py-3 text-center text-zinc-500">1x Chuẩn</td>
                    <td className="py-3 text-center font-bold text-amber-400">✅ Nhân đôi (x2) điểm & Vòng Quay VIP</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">👑 Haevy Family Tree: Quản lý gia phả dòng họ</td>
                    <td className="py-3 text-center text-zinc-500">Tối đa 2 đời</td>
                    <td className="py-3 text-center font-bold text-amber-300">✅ Vô hạn đời & Báo lịch giỗ đa kênh</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">💎 Haevy Lite: Phông chữ & Trang sức avatar</td>
                    <td className="py-3 text-center text-zinc-500">Mua lẻ theo vật phẩm</td>
                    <td className="py-3 text-center font-bold text-pink-400">✅ Full 7 Fonts VIP & Dragon Aura</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">💰 Haevy Finance: Tốc độ tích lũy & sinh lời Xu</td>
                    <td className="py-3 text-center text-zinc-500">1x Chuẩn</td>
                    <td className="py-3 text-center font-bold text-amber-300">Nhân 3 (x3) Xu & +15%/năm Két Sắt</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">🎙️ Haevy Studio: Sáng tạo AI Voice & Xuất file</td>
                    <td className="py-3 text-center text-zinc-500">75 pts/lượt</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ 50 pts/lượt (-33%) & Master FLAC</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">💬 Haevy Message: Trò chuyện & Cùng nghe nhạc</td>
                    <td className="py-3 text-center text-zinc-500">Cơ bản</td>
                    <td className="py-3 text-center font-bold text-amber-300">✅ Listen Together & HD Voice</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">💖 I Love Haevy: Theme đôi & Voice Capsule</td>
                    <td className="py-3 text-center text-zinc-500">1 Theme cơ bản</td>
                    <td className="py-3 text-center font-bold text-pink-400">✅ Full VIP Theme & AI Love Letter</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">📥 Tải nhạc Offline không giới hạn</td>
                    <td className="py-3 text-center text-zinc-500">Tối đa 3 bài</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ Không giới hạn FLAC Lossless</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">⚡ Trải nghiệm không quảng cáo & Nghe nền</td>
                    <td className="py-3 text-center text-zinc-500">Có quảng cáo</td>
                    <td className="py-3 text-center font-bold text-emerald-400">✅ 100% Không quảng cáo</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">👑 Huy hiệu Vương Miện & Aura Vàng bình luận</td>
                    <td className="py-3 text-center text-zinc-500">❌ Không</td>
                    <td className="py-3 text-center font-bold text-amber-300">✅ Vương Miện Hoàng Gia & Golden Aura</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => handleTabChange('page2')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 inline-flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap size={16} fill="currentColor" />
                <span>Nâng Cấp VIP Ngay (Chỉ từ 40.000đ/tháng)</span>
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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          
          {/* Success / Error Notification Banners */}
          {vipSuccessMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{vipSuccessMessage}</div>
            </div>
          )}

          {vipErrorMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{vipErrorMessage}</div>
            </div>
          )}

          {/* 1. VIP Packages Grid */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Bước 1: Chọn Gói Thành Viên VIP</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {VIP_PACKAGES.map((pkg) => {
                const isSelected = selectedVipPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedVipPackage(pkg)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between active:scale-[0.99] ${
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
                        <h4 className="text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                          <span>{pkg.name}</span>
                          <span className="text-xs text-zinc-400 font-normal">({pkg.durationDays} ngày)</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-snug">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
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
                          <div key={fidx} className="flex items-start gap-2 text-xs text-zinc-300">
                            <Check size={13} className="text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-snug break-words">{feat}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Left: Promo Code & Payment Selector */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 sm:space-y-5">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Bước 2: Mã Giảm Giá & Phương Thức</span>
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
                    placeholder="VD: VIP2026, HE2026..."
                    disabled={!!appliedPromo}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 uppercase"
                  />
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-500/30 shrink-0"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer border border-zinc-700 shrink-0 active:scale-95"
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'vietqr', name: 'VietQR Tự Động', icon: QrCode, desc: 'Mọi ngân hàng' },
                    { id: 'momo', name: 'Ví MoMo', icon: Smartphone, desc: '24/7 tức thì' },
                    { id: 'zalopay', name: 'Ví ZaloPay', icon: Smartphone, desc: 'Xác thực nhanh' },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setVipPaymentMethod(method.id as any)}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 ${
                        vipPaymentMethod === method.id
                          ? 'bg-amber-950/25 border-amber-400 ring-1 ring-amber-400/40 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <method.icon size={18} className={vipPaymentMethod === method.id ? 'text-amber-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold leading-tight break-words">{method.name}</h5>
                        <p className="text-[10px] text-zinc-500 leading-tight hidden sm:block">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: VietQR Dynamic Code & Checkout Confirmation */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center justify-between">
                  <span>Chi Tiết Thanh Toán & Kích Hoạt VIP</span>
                  <span className="text-xs font-mono font-bold text-amber-400">VietQR Pro</span>
                </h3>

                {/* Pricing Summary */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
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
                      <span>Giảm giá:</span>
                      <span className="font-mono">-{vipDisc.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                    <span>Tổng thanh toán:</span>
                    <span className="text-base font-black text-amber-300 font-mono">{vipFinal.toLocaleString()} VNĐ</span>
                  </div>
                </div>

                {/* VietQR Dynamic Code Image Preview (Prominent Large QR) */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative group">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-amber-400/40">
                      <img
                        src={qrImageUrlVip}
                        alt="VietQR Pay"
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    {/* Scan indicator badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                      Quét Mã VietQR Tự Động
                    </div>
                  </div>

                  <div className="pt-1 space-y-1">
                    <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                      <QrCode size={14} className="text-amber-400" />
                      <span>Mở app ngân hàng (MB, VCB, Techcom, MoMo...)</span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Quét mã trên để tự động điền đúng số tiền <span className="text-amber-300 font-bold font-mono">{vipFinal.toLocaleString()}đ</span> và cú pháp kích hoạt.
                    </p>
                  </div>
                </div>

                {/* Bank transfer info with Copy buttons (Full text, no truncation) */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400 shrink-0">Ngân hàng:</span>
                    <span className="font-bold text-white font-mono text-right">VPBANK (Việt Nam Thịnh Vượng)</span>
                  </div>

                  <div 
                    onClick={() => handleCopyText('0795249860', 'account_no')}
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors active:scale-[0.99]"
                  >
                    <span className="text-zinc-400 shrink-0">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                      <span>0795249860</span>
                      {copiedBankInfo === 'account_no' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-500 group-hover:text-amber-300" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                    <span className="text-zinc-400 shrink-0">Chủ tài khoản:</span>
                    <span className="font-bold text-white font-mono uppercase text-right">HA QUANG KHAI</span>
                  </div>

                  <div 
                    onClick={() => handleCopyText(transferContentVip, 'content')}
                    className="p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors space-y-1 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Nội dung chuyển khoản (Bắt buộc):</span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                        {copiedBankInfo === 'content' ? <span className="text-emerald-400">Đã chép!</span> : <span>Chạm để chép</span>}
                        {copiedBankInfo === 'content' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-xs sm:text-sm text-amber-300 break-all select-all bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
                      {transferContentVip}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConfirmVipPayment}
                disabled={isProcessingVip}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 mt-2"
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
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-amber-400" />
                <span>Lịch Sử Đơn Nạp VIP Gần Đây</span>
              </h4>
              <div className="divide-y divide-zinc-800/80">
                {vipOrdersList.map((order) => (
                  <div key={order.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-white truncate block">{order.packageName}</span>
                      <p className="text-[11px] text-zinc-500">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'} • {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          
          {/* Ratio Banner & Current Balance Card */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-sm sm:text-lg font-black text-white">
                  Nạp Xu Haevy (Tỷ Lệ 1:1 Chuẩn Xác)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-snug">
                1.000 VNĐ = 50 Xu Haevy (+ tặng thêm lên đến 30% Xu thưởng).
              </p>
            </div>

            <div className="w-full sm:w-auto p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between sm:justify-start gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 font-medium">Số dư Xu:</span>
                  <p className="text-base font-black text-amber-300 font-mono">
                    {audioPoints.toLocaleString()} Xu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success / Error Notification Banners */}
          {coinSuccessMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{coinSuccessMessage}</div>
            </div>
          )}

          {coinErrorMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{coinErrorMessage}</div>
            </div>
          )}

          {/* Xu Haevy Packages Grid */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Chọn Gói Nạp Xu Haevy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {POINT_TOPUP_PACKAGES.map((pkg) => {
                const isSelected = selectedCoinPackage.id === pkg.id;
                const totalCoins = pkg.points + (pkg.bonusPoints || 0);

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedCoinPackage(pkg)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between active:scale-[0.99] ${
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

                    <div className="space-y-2.5">
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-1.5">
                          <span>{pkg.name}</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-snug">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
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
          <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-amber-400" />
                <span>Phương Thức Thanh Toán Nạp Xu</span>
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'vietqr', name: 'VietQR Ngân Hàng', icon: QrCode },
                  { id: 'momo', name: 'Ví MoMo', icon: Smartphone },
                  { id: 'zalopay', name: 'ZaloPay', icon: Smartphone },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setCoinPaymentMethod(m.id as any)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                      coinPaymentMethod === m.id
                        ? 'bg-amber-950/25 border-amber-400 ring-1 ring-amber-400/40 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <m.icon size={18} className={coinPaymentMethod === m.id ? 'text-amber-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                    <span className="text-xs font-bold leading-tight">{m.name}</span>
                  </div>
                ))}
              </div>

              {/* VietQR Dynamic Code Image Preview for Coins (Prominent Large QR) */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative group">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-2 border-amber-400/40">
                    <img
                      src={qrImageUrlCoin}
                      alt="VietQR Coin Pay"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                    Quét Nạp Xu Tự Động
                  </div>
                </div>
                <div className="pt-1 space-y-1">
                  <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <QrCode size={14} className="text-amber-400" />
                    <span>Quét mã nạp Xu nhanh</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Tự động nhận +{(selectedCoinPackage.points + (selectedCoinPackage.bonusPoints || 0)).toLocaleString()} Xu Haevy sau khi thanh toán.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Số Xu nhận:</span>
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
                  onClick={() => handleCopyText('0795249860', 'coin_account')}
                  className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors active:scale-[0.99]"
                >
                  <span className="text-zinc-400">STK VPBank:</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-300">
                    <span>0795249860</span>
                    {copiedBankInfo === 'coin_account' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-amber-300" />}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                  <span className="text-zinc-400">Chủ tài khoản:</span>
                  <span className="font-bold text-white font-mono uppercase">HA QUANG KHAI</span>
                </div>

                <div 
                  onClick={() => handleCopyText(transferContentCoin, 'coin_content')}
                  className="p-2 sm:p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 cursor-pointer group transition-colors space-y-1 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Nội dung chuyển khoản (Bắt buộc):</span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                      {copiedBankInfo === 'coin_content' ? <span className="text-emerald-400">Đã chép!</span> : <span>Chạm để chép</span>}
                      {copiedBankInfo === 'coin_content' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-amber-300 break-all select-all bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
                    {transferContentCoin}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmCoinPayment}
                disabled={isProcessingCoin}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 mt-2"
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
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-amber-400" />
                <span>Biến Động Số Dư Xu Haevy Gần Đây</span>
              </h4>
              <div className="divide-y divide-zinc-800/80">
                {pointTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-200 truncate block">{tx.title}</span>
                      <p className="text-[11px] text-zinc-500">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-sm shrink-0 ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Mode Switcher */}
          <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Tặng Quà Cho Bạn Bè & Người Thân</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-snug">
                  Tặng trực tiếp Gói VIP hoặc Chuyển Xu Haevy qua ID Tài Khoản hoặc Email.
                </p>
              </div>

              {/* Sub Mode Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setGiftMode('gift_vip')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                    giftMode === 'gift_vip'
                      ? 'bg-amber-500 text-black font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🎁 Tặng Gói VIP
                </button>
                <button
                  onClick={() => setGiftMode('transfer_coins')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    value={giftRecipientInput}
                    onChange={(e) => {
                      setGiftRecipientInput(e.target.value);
                      setRecipientPreview(null);
                      setRecipientSearchError('');
                    }}
                    placeholder="VD: ID (ACC8888) hoặc email..."
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
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
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer border border-zinc-700 flex items-center gap-1.5 disabled:opacity-50 shrink-0 active:scale-95"
                >
                  {isSearchingRecipient ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>Kiểm Tra</span>
                </button>
              </div>

              {/* Recipient Verified Preview Card */}
              {recipientPreview && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">
                      {recipientPreview?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">{recipientPreview.name}</span>
                        {recipientPreview.isVip && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/40 shrink-0">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {recipientPreview.accountId ? `ID: ${recipientPreview.accountId}` : recipientPreview.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0 text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>Đã tìm thấy</span>
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
                placeholder="VD: Chúc bạn có những phút giây thư giãn tuyệt vời!"
                maxLength={120}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Success / Error Notification Banners */}
          {giftSuccessMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{giftSuccessMessage}</div>
            </div>
          )}

          {giftErrorMessage && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="text-xs sm:text-sm font-medium leading-snug break-words">{giftErrorMessage}</div>
            </div>
          )}

          {/* SUB-SECTION 1: TẶNG GÓI VIP CHO BẠN BÈ */}
          {giftMode === 'gift_vip' && (
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span>Chọn Gói VIP Muốn Tặng</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {VIP_PACKAGES.map((pkg) => {
                  const isSelected = giftSelectedVipPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setGiftSelectedVipPkg(pkg)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99] ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/40 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm">{pkg.name} ({pkg.durationDays} ngày)</span>
                        <span className="font-mono font-bold text-amber-300">{pkg.priceVnd.toLocaleString()}đ</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{pkg.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Gift VIP Payment & Submit */}
              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                  <span className="text-xs text-zinc-400">Gói tặng: <strong className="text-white">{giftSelectedVipPkg.name}</strong></span>
                  <p className="text-sm font-mono font-black text-amber-300">
                    Tổng thanh toán: {giftSelectedVipPkg.priceVnd.toLocaleString()} VNĐ
                  </p>
                </div>

                <button
                  onClick={handleConfirmGiftVip}
                  disabled={isSubmittingGift}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
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
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
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
                    className={`py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
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
              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                  <span className="text-xs text-zinc-400">
                    Số dư hiện có: <strong className="text-amber-300 font-mono">{audioPoints.toLocaleString()} Xu</strong>
                  </span>
                  <p className="text-sm font-mono font-black text-white">
                    Sẽ chuyển: {giftCustomCoins ? parseInt(giftCustomCoins, 10).toLocaleString() : giftCoinAmount.toLocaleString()} Xu Haevy
                  </p>
                </div>

                <button
                  onClick={handleConfirmTransferCoins}
                  disabled={isSubmittingGift}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
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

      {/* ========================================================================= */}
      {/* TRANG 5: AI VIP INTELLIGENCE DASHBOARD (Powered by Gemini API)            */}
      {/* ========================================================================= */}
      {internalPage === 'page5' && (
        <VipAiIntelligenceDashboard
          onOpenAuth={onOpenAuth}
          onNavigateMode={onNavigateMode}
          onGoToProfile={onGoToProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* TRANG 6: HAEVY BILLIONAIRE LOUNGE (Phòng Thương Gia Siêu Giàu 24K)         */}
      {/* ========================================================================= */}
      {internalPage === 'page6' && (
        <BillionaireLoungeView
          onOpenAuth={onOpenAuth}
          onNavigateMode={onNavigateMode}
          onGoToTopupVip={() => handleTabChange('page2')}
          onGoToProfile={onGoToProfile}
        />
      )}
    </div>
  );
}
