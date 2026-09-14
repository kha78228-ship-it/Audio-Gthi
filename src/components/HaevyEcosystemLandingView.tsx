import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gift, 
  Crown, 
  Coins, 
  Flame, 
  Headphones, 
  Sun, 
  Moon, 
  BookOpen, 
  MessageSquare, 
  Gamepad2, 
  Wallet, 
  Mic, 
  Layers, 
  ArrowUp,
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Bell, 
  Maximize, 
  Minimize, 
  LogIn, 
  User as UserIcon, 
  Clock, 
  Star, 
  ShieldCheck, 
  Share2, 
  TrendingUp, 
  Heart, 
  ChevronRight, 
  Award,
  Sparkle,
  Smartphone,
  Eye,
  Camera,
  PenTool,
  BrainCircuit,
  Cpu,
  Globe,
  HelpCircle,
  Play,
  RotateCw,
  Sliders,
  Compass,
  Check,
  Send,
  X,
  Lock,
  Volume2,
  LayoutGrid,
  Boxes,
  Shapes,
  Search,
  LifeBuoy,
  GitFork,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HaevyAllModesInfoModal } from './HaevyAllModesInfoModal';
import { HaevyUserDropdownMenu } from './HaevyUserDropdownMenu';
import { haptics } from '../utils/haptics';

// Simple web audio celebratory chime
function playCelebrationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.4);
    });
  } catch {
    // Ignore if audio context not allowed yet
  }
}

interface HaevyEcosystemLandingViewProps {
  onOpenAuth: (tab?: 'signin' | 'signup' | 'anonymous') => void;
  onOpenNotifications: () => void;
  unreadNotificationCount?: number;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onSelectMode?: (mode: string) => void;
  onToggleVoiceListen?: () => void;
  isVoiceListening?: boolean;
}

export function HaevyEcosystemLandingView({
  onOpenAuth,
  onOpenNotifications,
  unreadNotificationCount = 0,
  onToggleFullscreen,
  isFullscreen = false,
  onSelectMode,
  onToggleVoiceListen,
  isVoiceListening = false
}: HaevyEcosystemLandingViewProps) {
  const { user, isVip, audioPoints, addAudioPoints, accountId, logout, upcomingEvents, claimEventReward } = useAuth();
  
  // Compact UI layout mode state (persisted)
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('haevy_landing_compact_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCompactMode = () => {
    haptics.selection();
    setIsCompactMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haevy_landing_compact_mode', String(next));
      } catch {}
      return next;
    });
  };

  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [hasClaimedGift, setHasClaimedGift] = useState(false);
  const [claimingEventId, setClaimingEventId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'creative' | 'audio' | 'ai' | 'community' | 'spiritual' | 'utility'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDemoModal, setSelectedDemoModal] = useState<string | null>(null);
  const [demoAiInput, setDemoAiInput] = useState('Định luật bảo toàn năng lượng trong cơ học cổ điển');
  const [demoAiResult, setDemoAiResult] = useState<string | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [userProfileDropdown, setUserProfileDropdown] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [isAllModesPanelOpen, setIsAllModesPanelOpen] = useState(false);
  const [allModesFilter, setAllModesFilter] = useState<'all' | 'creative' | 'audio' | 'social' | 'utility'>('all');
  const [allModesSearch, setAllModesSearch] = useState('');

  // Primary Section Tab to eliminate excessive scrolling and streamline viewport
  type LandingSectionTab = 'pillars' | 'events' | 'tech_stats' | 'faq' | 'all';
  const [activeSectionTab, setActiveSectionTab] = useState<LandingSectionTab>('pillars');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll depth to toggle floating back-to-top dock button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectSectionTab = (tab: LandingSectionTab) => {
    haptics.selection();
    setActiveSectionTab(tab);
    // Smoothly reposition view near the tab bar if scrolled past
    if (typeof window !== 'undefined' && window.scrollY > 160) {
      const el = document.getElementById('ecosystem-nav-tabs');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    haptics.light();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close profile dropdown on window click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-profile-menu-container')) {
        setUserProfileDropdown(false);
      }
    };
    if (userProfileDropdown) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [userProfileDropdown]);

  // Claim welcome gift handler
  const handleClaimFestivalGift = () => {
    if (!user) {
      haptics.light();
      onOpenAuth('signin');
      return;
    }

    if (hasClaimedGift) {
      haptics.warning();
      setClaimToast('🎁 Bạn đã nhận gói quà chào mừng hôm nay rồi! Hãy tiếp tục khám phá các phân hệ nhé.');
      setTimeout(() => setClaimToast(null), 3000);
      return;
    }

    const bonusAmount = 500;
    addAudioPoints(bonusAmount, '🎁 Quà Tặng Tân Thủ Hệ Sinh Thái Haevy', 'bonus');
    setHasClaimedGift(true);
    haptics.rewardClaim();
    playCelebrationChime();
    setClaimToast(`🎉 Chúc mừng! Bạn đã nhận thành công +${bonusAmount} Xu Haevy Chào Mừng!`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  // Claim specific upcoming event reward handler
  const handleClaimUpcomingEvent = async (event: any) => {
    if (!user) {
      haptics.light();
      onOpenAuth('signin');
      return;
    }

    const claimed = (event.claimedUserIds || []).includes(user.uid);
    if (claimed) {
      haptics.warning();
      setClaimToast(`🎁 Bạn đã nhận phần thưởng cho sự kiện "${event.title}" rồi!`);
      setTimeout(() => setClaimToast(null), 3000);
      return;
    }

    setClaimingEventId(event.id);
    try {
      const res = await claimEventReward(event.id);
      if (res.success) {
        haptics.rewardClaim();
        playCelebrationChime();
        setClaimToast(`🎉 Chúc mừng! Bạn đã nhận thành công ${event.rewardCoins || 500} Xu Haevy từ sự kiện "${event.title}"!`);
      } else {
        haptics.warning();
        setClaimToast(`⚠️ ${res.message}`);
      }
    } catch (err: any) {
      setClaimToast(`⚠️ Lỗi khi nhận quà: ${err.message || ''}`);
    } finally {
      setClaimingEventId(null);
      setTimeout(() => setClaimToast(null), 4000);
    }
  };

  // Run AI Study Interactive Demo
  const handleRunAiDemo = () => {
    if (!demoAiInput.trim()) return;
    setIsAnalyzingAi(true);
    setDemoAiResult(null);

    setTimeout(() => {
      setIsAnalyzingAi(false);
      setDemoAiResult(
        `📌 [Phân Tích Bản Chất Logic - Gemini 3.5 Flash]:\n\n` +
        `1. Nguyên Lý Gốc Rễ:\n` +
        `Năng lượng không tự nhiên sinh ra hoặc biến mất, nó chỉ chuyển hóa từ dạng này (Động năng: mv²/2) sang dạng khác (Thế năng: mgh).\n\n` +
        `2. Giải Mã Bản Chất:\n` +
        `Tính bảo toàn xuất phát từ tính đối xứng tịnh tiến của thời gian (Định lý Noether). Dù vũ trụ trôi qua bao lâu, các định luật vật lý cơ bản không thay đổi theo thời gian.\n\n` +
        `3. Ứng Dụng Thực Tiễn:\n` +
        `Thiết kế con lắc đồng hồ, tàu lượn siêu tốc, đập thủy điện tích năng và tối ưu hóa hệ thống động cơ phản lực.`
      );
    }, 1200);
  };

  // Core Flagship Ecosystem Pillars Data for Home Landing Showcase
  const ecosystemPillars = [
    {
      id: 'haevy_ai',
      category: 'ai',
      badge: 'TRÍ TUỆ TOÀN NĂNG',
      title: 'Haevy AI Master',
      subTitle: 'Tâm sự thấu cảm, Cập nhật hệ sinh thái & Giải quyết vướng mắc',
      icon: BrainCircuit,
      color: 'from-purple-500 via-indigo-500 to-pink-500',
      borderColor: 'border-purple-500/50 hover:border-purple-400',
      bgGlow: 'bg-purple-500/20',
      textColor: 'text-purple-300',
      description: 'Trí tuệ nhân tạo nắm trọn vẹn dữ liệu hệ sinh thái: Lắng nghe tâm sự xoa dịu cảm xúc, thông báo các cập nhật mới (7 phong cách thưởng sự kiện 3D, nhận Xu), tháo gỡ mọi vướng mắc bảo mật & kỹ thuật.',
      highlights: [
        'Lắng nghe tâm sự sâu sắc & Gợi ý nhạc theo cảm xúc',
        'Nắm rõ điểm mới bản cập nhật: Sự kiện 3D, Space AR',
        'Thấu hiểu dữ liệu người dùng & Giải quyết vướng mắc 24/7'
      ],
      stats: 'Gemini 3.7 Pro Powered',
      demoType: 'ai_demo'
    },
    {
      id: 'audio',
      category: 'audio',
      badge: 'AUDIO & HI-FI',
      title: 'Haevy Audio',
      subTitle: 'Kho truyện audio, Sóng não Delta & Thư viện âm thanh',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      bgGlow: 'bg-indigo-500/10',
      textColor: 'text-indigo-300',
      description: 'Hàng ngàn giờ truyện audio Tiên hiệp, Kiếm hiệp, Trinh thám, Ngôn tình chất lượng cao, kết hợp âm thanh sóng não Delta ru ngủ êm dịu và bộ hẹn giờ tắt tự động.',
      highlights: [
        'Kho truyện phong phú & Diễn đọc truyền cảm',
        'Sóng não Delta 0.5-4Hz ru ngủ sâu tự nhiên',
        'Hẹn giờ thông minh tự động tắt nhạc khi ngủ say'
      ],
      stats: '50,000+ Giờ nghe',
      demoType: 'audio_demo'
    },
    {
      id: 'space',
      category: 'creative',
      badge: 'ĐỘC BẢN 3D AR',
      title: 'Haevy Space',
      subTitle: 'Phòng tranh không gian 360°, Bảng vẽ 3D & Linh vật AR',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      bgGlow: 'bg-cyan-500/10',
      textColor: 'text-cyan-300',
      description: 'Trải nghiệm bảng vẽ trong không gian 3D tách nét độc lập, tự do xoay 360 độ, điều khiển cử chỉ Pinch tay không chạm và tương tác cùng linh vật Haevy Son 3D sống động.',
      highlights: [
        'Vẽ nét 3D tách rời & Tự do xoay 360°',
        'Tái tạo nét bằng phương trình động lực học vật lý',
        'Linh vật Haevy Son 3D biến hình & Cử chỉ AR'
      ],
      stats: '1,200+ Tác phẩm 3D',
      demoType: 'space_demo'
    },
    {
      id: 'messages',
      category: 'community',
      badge: 'KẾT NỐI & TÂM SỰ',
      title: 'Haevy Message',
      subTitle: 'Trò chuyện thời gian thực, Gọi thoại trực tiếp & Bạn bè',
      icon: MessageSquare,
      color: 'from-sky-500 to-cyan-600',
      borderColor: 'border-sky-500/40 hover:border-sky-400',
      bgGlow: 'bg-sky-500/10',
      textColor: 'text-sky-300',
      description: 'Không gian kết nối an toàn, bảo mật: Hộp thư tin nhắn bạn bè, gọi thoại voice/video chất lượng cao và AI trợ lý đọc ngữ cảnh.',
      highlights: [
        'Nhắn tin tức thời & Chia sẻ âm thanh yêu thích',
        'Gọi thoại trực tiếp không giới hạn thời lượng',
        'Trợ lý Haevy AI đọc hiểu và hỗ trợ cuộc trò chuyện'
      ],
      stats: '15,000+ Cuộc trò chuyện',
      demoType: 'messages_demo'
    },
    {
      id: 'studio',
      category: 'creative',
      badge: 'SÁNG TÁC AUDIO',
      title: 'Haevy Studio',
      subTitle: 'Chuyển văn bản thành giọng nói cảm xúc & Phát hành có bản quyền',
      icon: Mic,
      color: 'from-rose-500 to-pink-600',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      bgGlow: 'bg-rose-500/10',
      textColor: 'text-rose-300',
      description: 'Studio chuyên nghiệp dành cho tác giả: Công nghệ AI TTS chuyển sách thành audio đa ngôn ngữ, hệ thống định danh eKYC bảo vệ quyền tác giả và nhận nhuận bút.',
      highlights: [
        'AI Voice chuyển văn bản thành giọng đọc sống động',
        'Xác thực eKYC CCCD bảo hộ bản quyền chính thức',
        'Kênh tác giả riêng & Nhận quà tặng xu từ thính giả'
      ],
      stats: '300+ Tác giả tham gia',
      demoType: 'studio_demo'
    },
    {
      id: 'finance',
      category: 'utility',
      badge: 'QUẢN LÝ TÀI CHÍNH',
      title: 'Haevy Finance',
      subTitle: 'Quản lý ngân sách 6 hũ tài chính thông minh, Thống kê trực quan',
      icon: Wallet,
      color: 'from-emerald-500 to-green-600',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      textColor: 'text-emerald-300',
      description: 'Công cụ tài chính đắc lực: Ghi chép chi tiêu nhanh chóng, phân loại 6 hũ ngân sách khoa học, biểu đồ dòng tiền trực quan giúp bạn làm chủ tài chính cá nhân.',
      highlights: [
        'Ghi chép thu chi 1 chạm cực nhanh',
        'Báo cáo trực quan theo ngày/tháng/danh mục',
        'Bảo mật tuyệt đối dữ liệu tài chính'
      ],
      stats: 'Chính xác & Tiện lợi',
      demoType: 'finance_demo'
    },
    {
      id: 'spiritual',
      category: 'spiritual',
      badge: 'TÂM LINH VŨ TRỤ 🔮',
      title: 'Haevy Spiritual',
      subTitle: 'Xem Chỉ Tay, Quẻ Kinh Dịch, Xăm Khổng Minh, Thần Số Học, Quả Cầu Pha Lê & Tarot 3D',
      icon: Sparkles,
      color: 'from-purple-600 via-indigo-600 to-pink-600',
      borderColor: 'border-purple-500/50 hover:border-purple-400',
      bgGlow: 'bg-purple-500/20',
      textColor: 'text-purple-300',
      description: 'Không gian huyền học toàn năng: Xem tướng bàn tay & chỉ tay ngũ hành, gieo quẻ Kinh Dịch 64 quẻ, xin xăm Khổng Minh 100 quẻ, thần số học Pythagoras 4 đỉnh cao, quả cầu pha lê trực giác, 78 lá bài Tarot 3D và lá số Tử Vi 2026.',
      highlights: [
        'Xem tướng bàn tay ngũ hành & quét chỉ tay AR tương tác',
        'Gieo quẻ Kinh Dịch 6 hào & Xin xăm Khổng Minh Thần Toán',
        'Thần Số Học Pythagoras & Quả Cầu Pha Lê tiên tri AI'
      ],
      stats: '7 Bộ Môn Huyền Học AI',
      demoType: 'spiritual_demo'
    },
    {
      id: 'couple',
      category: 'community',
      badge: 'LÃNG MẠN ĐÔI LỨA',
      title: 'I Love Haevy',
      subTitle: 'Nhật ký tình yêu, Theo dõi chu kỳ & Đố ngày kỷ niệm',
      icon: Heart,
      color: 'from-rose-500 to-red-600',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      bgGlow: 'bg-rose-500/10',
      textColor: 'text-rose-300',
      description: 'Góc ngọt ngào dành riêng cho hai người: Mã ghép cặp độc quyền, nhật ký chung, chăm sóc bạn gái theo dõi chu kỳ và đố vui ngày kỷ niệm.',
      highlights: [
        'Nhật ký tình yêu có mật khẩu bảo vệ riêng',
        'Theo dõi chu kỳ & Lời nhắn ngọt ngào cho bạn gái',
        'Đố ngày kỷ niệm & Hộp thư thoại yêu thương'
      ],
      stats: 'Gắn kết bền chặt',
      demoType: 'couple_demo'
    },
    {
      id: 'family_tree',
      category: 'community',
      badge: 'GIA PHẢ DÒNG TỘC 👑',
      title: 'Haevy Family Tree',
      subTitle: 'Sơ đồ cây tương tác O(1), Lịch giỗ Âm-Dương & Hòm thư con cháu',
      icon: GitFork,
      color: 'from-amber-500 via-yellow-600 to-amber-700',
      borderColor: 'border-amber-500/50 hover:border-amber-400',
      bgGlow: 'bg-amber-500/20',
      textColor: 'text-amber-300',
      description: 'Quản lý phả hệ dòng họ số hóa thông minh: Sơ đồ tương tác zoom & pan mượt mà, hồ sơ thành viên lưu trữ sắc phong & mộ phần, thiết lập liên kết cha-con, phu thê, con nuôi, lịch giỗ chạp Âm-Dương tự động nhắc nhở và phân quyền Trưởng tộc bảo mật.',
      highlights: [
        'Sơ đồ cây phả hệ tương tác trực quan & Tìm kiếm lọc thế hệ',
        'Lịch giỗ chạp Âm-Dương tự động tính toán & Đếm ngược ngày giỗ',
        'Phân quyền Trưởng tộc (Admin) & Hòm thư con cháu đóng góp'
      ],
      stats: 'Graph & Closure Table O(1)',
      demoType: 'family_tree_demo'
    },
    {
      id: 'edu',
      category: 'utility',
      badge: 'HỌC TẬP & NGHIÊN CỨU 🎓',
      title: 'Haevy Edu',
      subTitle: 'Phòng Lab Thử Nghiệm Vật Lý, Hóa Học, Sinh Học & Lộ Trình First Principles',
      icon: GraduationCap,
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      borderColor: 'border-emerald-500/50 hover:border-emerald-400',
      bgGlow: 'bg-emerald-500/20',
      textColor: 'text-emerald-300',
      description: 'Phòng thí nghiệm ảo đa ngành tương tác: Con lắc đơn, quang hình học, chuẩn độ axit bazơ, bảng tuần hoàn, kính hiển vi tế bào, di truyền Men-đen và AI đọc tài liệu thiết lập lộ trình học tránh học vẹt, tạo video bài giảng trực quan.',
      highlights: [
        'Phòng Lab ảo Vật lý, Hóa học & Sinh học HTML5 Canvas',
        'AI đọc tài liệu, bóc tách bản chất logic & thiết lập lộ trình',
        'Trình tạo video bài giảng trực quan tự động với thuyết minh AI'
      ],
      stats: 'First Principles STEM Lab',
      demoType: 'edu_demo'
    }
  ];

  // FAQs list
  const faqs = [
    {
      q: 'Hệ sinh thái Haevy gồm những phân hệ cốt lõi nào?',
      a: 'Hệ sinh thái Haevy gồm các phân hệ toàn diện: Haevy Spiritual (Tarot 3D, Tử Vi 2026 & Chiêm Tinh), Haevy Audio (Kho truyện & âm thanh Hi-Fi), Haevy Space (Bảng vẽ 3D & AR), Haevy AI Master (Trợ lý thông minh), Haevy Message (Nhắn tin & bạn bè), Haevy Studio (AI Voice sáng tác), Haevy Finance (Sổ thu chi 6 hũ) và I Love Haevy (Không gian cặp đôi).'
    },
    {
      q: 'Làm thế nào để truy cập Haevy VIP và Haevy Support?',
      a: 'Bạn chỉ cần bấm vào hình đại diện (Avatar) ở góc trên bên phải màn hình để mở menu tài khoản có sẵn Haevy VIP và Haevy Support, hoặc bấm vào nút 4 hình vuông để xem toàn bộ danh mục chế độ hệ sinh thái.'
    },
    {
      q: 'Làm thế nào để nhận quà tặng 500 Xu Tân Thủ?',
      a: 'Bạn chỉ cần đăng nhập tài khoản Haevy (hoặc tạo tài khoản mới miễn phí trong 10 giây). Sau đó bấm vào nút "Nhận Thưởng 500 Xu Tân Thủ". Xu sẽ được cộng tức thì vào ví tài khoản của bạn.'
    },
    {
      q: 'Không gian vẽ 3D Haevy Space có yêu cầu kính VR không?',
      a: 'Không cần! Haevy Space hoạt động mượt mà trên mọi trình duyệt WebGL máy tính, điện thoại cảm ứng (với chế độ xoay 360° tự do) và hỗ trợ nhận diện cử chỉ bàn tay Pinch AR trực tiếp qua camera máy ảnh.'
    },
    {
      q: 'Xu Haevy được sử dụng cho những mục đích gì?',
      a: 'Xu Haevy có thể được dùng để mở khóa các mẫu vẽ 3D cao cấp, nâng cấp âm thanh Hi-Fi Lossless trong Haevy VIP, và tặng quà tri ân cho các tác giả audio bạn yêu thích.'
    }
  ];

  // Filtered pillars based on search & category
  const filteredPillars = ecosystemPillars.filter(p => {
    const matchCategory = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex flex-col items-center selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: BRAND, NAV ANCHORS, AUTH (LOGIN / AVATAR + XU), NOTIFICATIONS & FULLSCREEN */}
      {/* ========================================================================= */}
      <header className={`w-full max-w-7xl px-2.5 sm:px-6 py-2.5 sm:py-3.5 mt-1 sm:mt-4 mb-3 sm:mb-4 flex items-center justify-between gap-1.5 sm:gap-3 bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl shadow-2xl sticky top-1 sm:top-2 transition-all ${userProfileDropdown ? 'z-[100]' : 'z-40'}`}>
        
        {/* Left: Ecosystem Logo */}
        <div 
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none min-w-0 shrink"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 ring-1 ring-white/20 shrink-0">
            <Sparkles size={18} className="animate-pulse text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-black text-xs sm:text-base tracking-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent truncate">
                HAEVY
              </span>
              <span className="hidden xs:inline-block font-black text-xs sm:text-base tracking-tight text-white truncate">
                ECOSYSTEM
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[8px] sm:text-[9px] font-black text-white tracking-widest uppercase shrink-0">
                HUB
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block truncate">
              Hệ Sinh Thái Đa Chiều & Sáng Tạo
            </p>
          </div>
        </div>

        {/* Center: Desktop Nav Quick Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-zinc-300">
          <button 
            onClick={() => {
              const el = document.getElementById('ecosystem-hero-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Gift size={13} className="text-amber-400" />
            <span>Quà Tân Thủ</span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('ecosystem-pillars-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Layers size={13} className="text-cyan-400" />
            <span>7 Phân Hệ</span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('tech-stack-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Cpu size={13} className="text-emerald-400" />
            <span>Công Nghệ AI & 3D</span>
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('faq-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <HelpCircle size={13} className="text-purple-400" />
            <span>Hỏi Đáp</span>
          </button>
        </nav>

        {/* Right: Notification, Fullscreen & User Account (Login / Avatar + Xu) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

          {/* Voice Navigation 'Listen' Button */}
          {onToggleVoiceListen && (
            <button
              id="landing-voice-listen-btn"
              onClick={() => {
                haptics.selection();
                onToggleVoiceListen();
              }}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 relative group ${
                isVoiceListening
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white border-amber-300 font-bold shadow-lg shadow-rose-500/30 ring-2 ring-amber-400/50 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300'
              }`}
              title={
                isVoiceListening 
                  ? 'Đang lắng nghe giọng nói... Bấm để dừng' 
                  : 'Điều khiển bằng giọng nói: "Đi đến Haevy Finance", "Mở phòng thu", "Mở Tử Vi"...'
              }
              aria-label="Lắng nghe giọng nói"
            >
              {isVoiceListening ? (
                <>
                  <div className="relative flex items-center justify-center">
                    <Mic size={13} className="text-white animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black tracking-tight hidden xs:inline text-white">
                    Đang nghe...
                  </span>
                </>
              ) : (
                <>
                  <Mic size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] sm:text-xs font-bold hidden md:inline text-zinc-300 group-hover:text-amber-300">
                    Lắng nghe
                  </span>
                </>
              )}
            </button>
          )}
          
          {/* Notification Button - Miniaturized */}
          <button
            onClick={() => {
              haptics.light();
              onOpenNotifications();
            }}
            className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Xem thông báo hệ thống & tin nhắn"
            aria-label="Thông báo"
          >
            <Bell size={13} className="text-zinc-400 group-hover:text-amber-400" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse border border-zinc-950">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Fullscreen Mode Button - Miniaturized */}
          {onToggleFullscreen && (
            <button
              onClick={() => {
                haptics.selection();
                onToggleFullscreen();
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
                isFullscreen
                  ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-amber-400/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Bật chế độ toàn màn hình'}
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? <Minimize size={13} className="text-black" /> : <Maximize size={13} />}
            </button>
          )}

          {/* 4-Blocks Icon: All Haevy Modes Quick Hub - Miniaturized */}
          <button
            id="all-modes-trigger-button"
            onClick={() => {
              haptics.medium();
              setIsAllModesPanelOpen(true);
            }}
            className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 hover:from-amber-950/40 hover:to-zinc-900 border border-zinc-800 hover:border-amber-500/60 text-zinc-300 hover:text-amber-300 transition-all cursor-pointer shadow-md active:scale-95 group shrink-0"
            title="Bảng thông tin tất cả các chế độ của Haevy (4 Khối)"
            aria-label="Tất cả các chế độ Haevy"
          >
            <div className="relative flex items-center justify-center">
              <LayoutGrid size={13} className="text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-75" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
          </button>

          {/* User Account Controls: If Logged In -> Avatar + Coins; If Not -> Login Button */}
          {user ? (
            <div id="user-profile-menu-container" className="relative shrink-0 z-50">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.light();
                  setUserProfileDropdown(!userProfileDropdown);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 rounded-full border transition-all cursor-pointer active:scale-95 shadow-md ${
                  isVip
                    ? 'bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border-amber-500/50 hover:border-amber-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                }`}
                title="Xem thông tin tài khoản & Ví xu"
              >
                {/* User Avatar */}
                <div className="relative shrink-0 w-5 h-5 sm:w-6 sm:h-6">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-full h-full rounded-full object-cover ring-1 ring-zinc-700"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-[9px] sm:text-xs ring-1 ring-zinc-700">
                      {user.displayName?.charAt(0) || 'H'}
                    </div>
                  )}
                  {isVip && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-sm ring-1 ring-black">
                      <Crown size={6} fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Haevy Coins Display */}
                <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono font-black shrink-0">
                  <Coins size={11} className="text-amber-400 shrink-0" />
                  <span className={`whitespace-nowrap ${isVip ? 'text-amber-300' : 'text-zinc-100'}`}>
                    {(audioPoints ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Reusable Profile Dropdown */}
              <HaevyUserDropdownMenu
                isOpen={userProfileDropdown}
                onClose={() => setUserProfileDropdown(false)}
                onSelectMode={(mode) => {
                  haptics.modeSwitch();
                  setUserProfileDropdown(false);
                  onSelectMode?.(mode);
                }}
                onClaimGift={handleClaimFestivalGift}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                haptics.light();
                onOpenAuth('signin');
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer shrink-0"
            >
              <LogIn size={12} className="stroke-[2.5]" />
              <span className="text-[10px] sm:text-xs font-black">Đăng nhập</span>
            </button>
          )}

        </div>
      </header>

      {/* Toast Notification */}
      {claimToast && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-2xl border border-amber-300 animate-in fade-in slide-in-from-top-4 text-xs sm:text-sm flex items-center gap-2 max-w-[92vw] text-center">
          <Sparkles size={16} className="text-yellow-200 animate-spin shrink-0" />
          <span className="break-word-safe">{claimToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧭 STICKY SECTION SEGMENTED NAVIGATION BAR (CHỐNG VUỐT THỪA THÃI & TINH GỌN) */}
      {/* ========================================================================= */}
      <div id="ecosystem-nav-tabs" className="sticky top-12 sm:top-14 z-30 w-full max-w-7xl px-2 sm:px-6 mb-3 sm:mb-4">
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-1 sm:p-1.5 shadow-2xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            
            {/* Tab 1: 12+ Pillars */}
            <button
              onClick={() => handleSelectSectionTab('pillars')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSectionTab === 'pillars'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
              }`}
            >
              <Layers size={14} className={activeSectionTab === 'pillars' ? 'text-zinc-950' : 'text-amber-400'} />
              <span>12+ Phân Hệ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSectionTab === 'pillars' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {ecosystemPillars.length}
              </span>
            </button>

            {/* Tab 2: Live Events */}
            <button
              onClick={() => handleSelectSectionTab('events')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSectionTab === 'events'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
              }`}
            >
              <Gift size={14} className={activeSectionTab === 'events' ? 'text-zinc-950' : 'text-amber-400'} />
              <span>Sự Kiện & Thưởng</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSectionTab === 'events' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-emerald-500/20 text-emerald-400 font-bold'
              }`}>
                {upcomingEvents ? upcomingEvents.filter(e => e.status !== 'ended' && e.status !== 'draft').length : 0}
              </span>
            </button>

            {/* Tab 3: Tech & Live Stats */}
            <button
              onClick={() => handleSelectSectionTab('tech_stats')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSectionTab === 'tech_stats'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
              }`}
            >
              <Cpu size={14} className={activeSectionTab === 'tech_stats' ? 'text-zinc-950' : 'text-cyan-400'} />
              <span>Hạ Tầng & Chỉ Số</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSectionTab === 'tech_stats' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Live
              </span>
            </button>

            {/* Tab 4: FAQ */}
            <button
              onClick={() => handleSelectSectionTab('faq')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSectionTab === 'faq'
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
              }`}
            >
              <HelpCircle size={14} className={activeSectionTab === 'faq' ? 'text-zinc-950' : 'text-purple-400'} />
              <span>Hỏi Đáp FAQ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSectionTab === 'faq' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {faqs.length}
              </span>
            </button>

            {/* Tab 5: All Sections */}
            <button
              onClick={() => handleSelectSectionTab('all')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                activeSectionTab === 'all'
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Xem dạng cuộn toàn bộ các phần"
            >
              <Sliders size={13} />
              <span>Xem Toàn Bộ</span>
            </button>
          </div>

          {/* Quick Action in Sticky Bar */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              onClick={() => {
                haptics.medium();
                setIsAllModesPanelOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <LayoutGrid size={13} className="text-amber-400" />
              <span>12+ Chế Độ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 STREAMLINED ECOSYSTEM HERO HUB (TỶ LỆ HỢP LÝ - CHỐNG CUỘN QUÁ MỨC) */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'pillars' || activeSectionTab === 'all') && (
        <section id="ecosystem-hero-section" className="w-full max-w-7xl px-2.5 sm:px-6 mb-4 sm:mb-6">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950/70 border border-zinc-800 shadow-2xl p-3.5 sm:p-6 md:p-7 text-white">
            
            {/* Ambient Cosmic Glows */}
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-bl from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 sm:w-72 h-40 sm:h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Mini Tagline & Quick Shortcut */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 sm:mb-3 relative z-10 w-full">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider max-w-full shadow-sm">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span className="break-word-safe">HỆ SINH THÁI SỐ TOÀN NĂNG HAEVY • PHIÊN BẢN 2026</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    haptics.selection();
                    setIsAllModesPanelOpen(true);
                  }}
                  className="px-2.5 sm:px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  title="Xem danh mục tất cả chế độ"
                >
                  <LayoutGrid size={12} className="text-amber-400" />
                  <span>Danh Mục 12+ Chế Độ</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center relative z-10">
              
              {/* Left Col: Main Typography & Value Props (7 cols) */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
                
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight font-serif text-white break-word-safe">
                    KẾT NỐI TRÍ TUỆ & SÁNG TẠO
                    <br />
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-sm font-sans font-black">
                      KHÔNG GIỚI HẠN
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed break-word-safe">
                    Một tài khoản duy nhất kết nối liền mạch 12+ phân hệ số: Trợ lý Haevy AI thấu cảm, âm thanh Spatial Hi-Fi Lossless, quản lý tài chính 6 hũ, phả hệ gia tộc và không gian 3D AR.
                  </p>
                </div>

                {/* Compact Key Highlights Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-0.5">
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-200">
                    <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                    <span className="truncate">An Ninh 6 Lớp</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-200">
                    <Headphones size={13} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Spatial Hi-Fi Audio</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-200 col-span-2 sm:col-span-1">
                    <BrainCircuit size={13} className="text-purple-400 shrink-0" />
                    <span className="truncate">Haevy AI Thấu Cảm</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5 w-full">
                  <button
                    onClick={handleClaimFestivalGift}
                    className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gift size={14} className="fill-zinc-950 shrink-0" />
                    <span className="truncate">{hasClaimedGift ? 'ĐÃ NHẬN 500 XU CHÀO MỪNG' : 'NHẬN THƯỞNG 500 XU TÂN THỦ'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('ecosystem-pillars-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm border border-zinc-700 hover:border-zinc-500 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Xem 12+ Phân Hệ</span>
                    <ChevronRight size={13} className="shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      haptics.modeSwitch();
                      if (onSelectMode) onSelectMode('haevy_ai');
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-bold text-xs sm:text-sm border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <BrainCircuit size={13} className="text-purple-400 shrink-0" />
                    <span>Mở Haevy AI</span>
                  </button>
                </div>

              </div>

              {/* Right Col: Interactive Quick Launch Matrix (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                    <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={13} className="text-amber-400" />
                      Truy Cập Nhanh Trụ Cột
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">1-Chạm Mở Ngay</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Quick Pill 1: Haevy AI */}
                    <div
                      onClick={() => {
                        haptics.modeSwitch();
                        if (onSelectMode) onSelectMode('haevy_ai');
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/90 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs shrink-0">
                          <BrainCircuit size={13} />
                        </div>
                        <span className="text-xs font-black text-white group-hover:text-purple-300 transition-colors truncate">Haevy AI</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">Trợ lý thấu cảm & học sâu</p>
                    </div>

                    {/* Quick Pill 2: Haevy Audio */}
                    <div
                      onClick={() => {
                        haptics.modeSwitch();
                        if (onSelectMode) onSelectMode('audio');
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/90 hover:bg-indigo-950/40 border border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">
                          <Moon size={13} />
                        </div>
                        <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors truncate">Haevy Audio</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">Sóng não & sách nói Hi-Fi</p>
                    </div>

                    {/* Quick Pill 3: Family Tree */}
                    <div
                      onClick={() => {
                        haptics.modeSwitch();
                        if (onSelectMode) onSelectMode('family_tree');
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/90 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                          <GitFork size={13} />
                        </div>
                        <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">Gia Phả O(1)</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">Phả hệ dòng họ & ngày giỗ</p>
                    </div>

                    {/* Quick Pill 4: Finance */}
                    <div
                      onClick={() => {
                        haptics.modeSwitch();
                        if (onSelectMode) onSelectMode('finance');
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/90 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                          <Wallet size={13} />
                        </div>
                        <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">Tài Chính 6 Hũ</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">Quản lý thu chi & ngân sách</p>
                    </div>
                  </div>

                  {/* Bottom Status Row */}
                  <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      12+ Phân hệ sẵn sàng
                    </span>
                    <span className="font-mono text-zinc-500">Haevy Ecosystem v2.6</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🎪 DYNAMIC ECOSYSTEM EVENTS SHOWCASE (REWARD STYLES & HOSTING MODES) */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'events' || activeSectionTab === 'all') && upcomingEvents && upcomingEvents.filter(e => e.status !== 'ended' && e.status !== 'draft').length > 0 && (
        <section id="ecosystem-live-events-showcase" className="w-full max-w-7xl px-2.5 sm:px-6 mb-5 sm:mb-8">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border-2 border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Sự Kiện & Hoạt Động Đang Diễn Ra</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {upcomingEvents.filter(e => e.status !== 'ended' && e.status !== 'draft').length} Sự Kiện
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Tham gia các sự kiện hệ sinh thái, khám phá phân hệ và nhận Xu Haevy miễn phí
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {upcomingEvents
                .filter(e => e.status !== 'ended' && e.status !== 'draft')
                .slice(0, 3)
                .map((event) => {
                  const isClaimed = user && (event.claimedUserIds || []).includes(user.uid);
                  const isLive = event.status === 'live';
                  
                  // Reward Style Icon
                  let rewardIcon = '👑';
                  let rewardStyleBadge = 'Rương Vàng';
                  let rewardGradient = 'from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-amber-400/40';
                  
                  if (event.rewardDisplayStyle === 'neon_crystal') {
                    rewardIcon = '💎';
                    rewardStyleBadge = 'Pha Lê 3D';
                    rewardGradient = 'from-purple-500/20 via-indigo-500/10 to-cyan-600/20 border-purple-400/40';
                  } else if (event.rewardDisplayStyle === 'gift_box') {
                    rewardIcon = '🎁';
                    rewardStyleBadge = 'Hộp Quà';
                    rewardGradient = 'from-rose-500/20 via-red-500/10 to-orange-600/20 border-rose-400/40';
                  } else if (event.rewardDisplayStyle === 'lucky_wheel') {
                    rewardIcon = '🎡';
                    rewardStyleBadge = 'Vòng Quay';
                    rewardGradient = 'from-emerald-500/20 via-teal-500/10 to-cyan-600/20 border-emerald-400/40';
                  } else if (event.rewardDisplayStyle === 'coin_fountain') {
                    rewardIcon = '🪙';
                    rewardStyleBadge = 'Mưa Xu 3D';
                    rewardGradient = 'from-yellow-500/25 via-amber-500/10 to-orange-500/20 border-yellow-400/40';
                  } else if (event.rewardDisplayStyle === 'royal_card') {
                    rewardIcon = '🎴';
                    rewardStyleBadge = 'Thẻ VIP';
                    rewardGradient = 'from-indigo-600/20 via-violet-600/10 to-amber-500/20 border-indigo-400/40';
                  }

                  return (
                    <div
                      key={event.id}
                      className="group relative rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-amber-400/50 p-3.5 sm:p-4 flex flex-col justify-between transition-all overflow-hidden shadow-xl"
                    >
                      {/* Banner Image or Ambient */}
                      {event.bannerImageUrl && (
                        <div className="relative h-28 -mx-3.5 -mt-3.5 sm:-mx-4 sm:-mt-4 mb-3 overflow-hidden rounded-t-2xl">
                          <img
                            src={event.bannerImageUrl}
                            alt={event.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
                              {event.badge || 'SỰ KIỆN'}
                            </span>
                            {isLive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {event.description || event.subtitle || 'Khám phá sự kiện và tham gia nhận thưởng ngay.'}
                        </p>

                        {/* Reward Visual Pill */}
                        <div className={`mt-2 p-2 rounded-xl bg-gradient-to-r ${rewardGradient} border flex items-center justify-between gap-2`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{rewardIcon}</span>
                            <div>
                              <span className="text-[9px] font-black text-amber-300 uppercase block">{rewardStyleBadge}</span>
                              <span className="text-[11px] font-bold text-white">
                                {event.rewardBadgeText || `+${event.rewardCoins || 0} Xu`}
                              </span>
                            </div>
                          </div>

                          {event.rewardCoins && event.rewardCoins > 0 && (
                            <button
                              onClick={() => handleClaimUpcomingEvent(event)}
                              disabled={isClaimed || claimingEventId === event.id}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                isClaimed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 shadow-md active:scale-95'
                              }`}
                            >
                              {claimingEventId === event.id ? '...' : isClaimed ? 'Đã Nhận ✓' : `Nhận ${event.rewardCoins} Xu`}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Event Footer CTA */}
                      <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {event.hostingMode ? `Phân hệ: ${event.hostingMode.replace('mode_', '').toUpperCase()}` : 'Hệ Sinh Thái'}
                        </span>

                        <button
                          onClick={() => {
                            haptics.selection();
                            if (event.hostingMode === 'mode_audio' || event.ctaAction === 'mode_audio') {
                              onSelectMode?.('audio');
                            } else if (event.hostingMode === 'mode_games' || event.ctaAction === 'mode_games') {
                              onSelectMode?.('games');
                            } else if (event.hostingMode === 'mode_space' || event.ctaAction === 'mode_space') {
                              setSelectedDemoModal('space_demo');
                            } else if (event.hostingMode === 'mode_finance' || event.ctaAction === 'mode_finance') {
                              onSelectMode?.('finance');
                            } else if (event.hostingMode === 'mode_couple' || event.ctaAction === 'mode_couple') {
                              onSelectMode?.('couple');
                            } else {
                              const el = document.getElementById('ecosystem-pillars-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="text-[11px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                        >
                          <span>{event.ctaText || 'Tham Gia Ngay'}</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🧭 FILTER TABS, SEARCH & COMPACT TOGGLE SECTION */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'pillars' || activeSectionTab === 'all') && (
        <>
        <section id="ecosystem-pillars-section" className="w-full max-w-7xl px-2.5 sm:px-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800">
          
          {/* Header & Density Toggle Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 break-word-safe">
                <Layers size={20} className="text-amber-400 shrink-0" />
                <span>Các Phân Hệ Cốt Lõi Trong Hệ Sinh Thái Haevy</span>
              </h2>
              <p className="text-xs text-zinc-400 break-word-safe">
                Khám phá các phân hệ trụ cột, tìm kiếm nhanh hoặc chuyển đổi giao diện gọn gàng theo nhu cầu.
              </p>
            </div>

            {/* Density & Display Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleCompactMode}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isCompactMode 
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md font-black'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
                title={isCompactMode ? 'Chuyển sang xem đầy đủ' : 'Chuyển sang giao diện nhỏ gọn'}
              >
                <Sliders size={13} className={isCompactMode ? 'text-zinc-950' : 'text-amber-400'} />
                <span>{isCompactMode ? 'Giao Diện Gọn Gàng' : 'Giao Diện Đầy Đủ'}</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm phân hệ (AI, Audio, Gia Phả, 3D, Tài Chính)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 rounded-md"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar w-full md:w-auto max-w-full touch-pan-x">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'spiritual', label: '🔮 Tâm Linh' },
                { id: 'audio', label: '🎧 Audio' },
                { id: 'creative', label: '🎨 Sáng Tạo & 3D' },
                { id: 'community', label: '👥 Kết Nối' },
                { id: 'utility', label: '⚙️ Quản Trị' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    haptics.selection();
                    setActiveCategoryFilter(cat.id as any);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategoryFilter === cat.id
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌌 BENTO GRID: 7 FLAGSHIP ECOSYSTEM PILLARS CARDS (HỖ TRỢ CHẾ ĐỘ GỌN GÀNG) */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl px-2.5 sm:px-6 mb-8 sm:mb-12">
        {filteredPillars.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-400">Không tìm thấy phân hệ nào phù hợp với từ khóa "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategoryFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-amber-300 text-xs font-bold hover:bg-zinc-700"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className={
            isCompactMode
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          }>
            {filteredPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  onClick={() => {
                    haptics.medium();
                    setSelectedDemoModal(pillar.demoType);
                  }}
                  className={`group relative rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black border ${pillar.borderColor} ${
                    isCompactMode ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6'
                  } shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden hover:shadow-2xl hover:border-amber-400/50`}
                >
                  {/* Ambient glow */}
                  <div className={`absolute top-0 right-0 w-36 h-36 ${pillar.bgGlow} rounded-full blur-3xl group-hover:scale-125 transition-all pointer-events-none`} />

                  <div>
                    {/* Top Card Bar */}
                    <div className={`flex items-center justify-between gap-2 ${isCompactMode ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
                      <div className={`${isCompactMode ? 'w-8 h-8 rounded-lg p-1.5' : 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl p-2 sm:p-2.5'} bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                        <Icon size={isCompactMode ? 16 : 20} className={isCompactMode ? '' : 'sm:w-6 sm:h-6'} />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[9px] font-black tracking-wider uppercase shrink-0">
                        {pillar.badge}
                      </span>
                    </div>

                    {/* Title & SubTitle */}
                    <h3 className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-xl'} font-black text-white group-hover:text-amber-300 transition-colors mb-0.5 break-word-safe`}>
                      {pillar.title}
                    </h3>
                    <p className={`text-[11px] font-bold ${pillar.textColor} ${isCompactMode ? 'mb-1.5' : 'mb-2.5'} leading-snug break-word-safe`}>
                      {pillar.subTitle}
                    </p>

                    <p className={`text-xs text-zinc-300 leading-relaxed ${isCompactMode ? 'line-clamp-2 mb-2 text-[11px]' : 'mb-3 sm:mb-4'} break-word-safe`}>
                      {pillar.description}
                    </p>

                    {/* Key Highlights */}
                    <div className={`space-y-1 ${isCompactMode ? 'mb-2.5' : 'mb-4 sm:mb-5'}`}>
                      {(isCompactMode ? pillar.highlights.slice(0, 1) : pillar.highlights).map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300 break-word-safe">
                          <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <span className={isCompactMode ? 'line-clamp-1' : ''}>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className={`pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-1.5`}>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold hidden sm:block truncate max-w-[100px]">
                      {pillar.stats}
                    </span>

                    <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.medium();
                          setSelectedDemoModal(pillar.demoType);
                        }}
                        className="px-2 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title="Xem giới thiệu & demo tương tác"
                      >
                        <Eye size={11} className="text-amber-400 shrink-0" />
                        <span>Demo</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.modeSwitch();
                          if (onSelectMode) {
                            onSelectMode(pillar.id);
                          } else {
                            setSelectedDemoModal(pillar.demoType);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 text-[11px] font-black shadow-md shadow-amber-400/20 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shrink-0"
                      >
                        <span>Mở</span>
                        <ArrowRight size={11} className="shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>
      </>
      )}

      {/* ========================================================================= */}
      {/* ⚡ UNIFIED TECH STACK & LIVE STATS BENTO (TINH GỌN & CÂN ĐỐI TỶ LỆ) */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'tech_stats' || activeSectionTab === 'all') && (
        <section id="tech-stack-section" className="w-full max-w-7xl px-2.5 sm:px-6 mb-6 sm:mb-10">
          <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-4 sm:p-7 shadow-2xl space-y-6">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                HẠ TẦNG KỸ THUẬT & SỐ LIỆU MINH BẠCH
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white break-word-safe">
                Nền Tảng Công Nghệ Đa Chiều & Cộng Đồng Haevy
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 break-word-safe">
                Kết hợp sức mạnh tính toán vật lý thời gian thực, AI học sâu và điện toán đám mây tốc độ cao.
              </p>
            </div>

            {/* Live Stats Row */}
            <div className="rounded-xl sm:rounded-2xl bg-zinc-950/90 border border-zinc-800/90 p-3 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center">
              <div className="space-y-0.5 p-1.5">
                <span className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-400 font-mono">
                  25,000+
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Thành Viên Tích Cực</p>
              </div>

              <div className="space-y-0.5 p-1.5">
                <span className="text-lg sm:text-2xl lg:text-3xl font-black text-cyan-400 font-mono">
                  1,200+
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Tác Phẩm Vẽ 3D AR</p>
              </div>

              <div className="space-y-0.5 p-1.5">
                <span className="text-lg sm:text-2xl lg:text-3xl font-black text-rose-400 font-mono">
                  50,000+
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Giờ Trải Nghiệm & Nghe</p>
              </div>

              <div className="space-y-0.5 p-1.5">
                <span className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-400 font-mono">
                  10,000,000+
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">Xu Đã Trao Thưởng</p>
              </div>
            </div>

            {/* Tech Pillar 4-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <PenTool size={16} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white break-word-safe">3D Dynamic Equations</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed break-word-safe">
                  Phương trình lực đè độ cong (Curvature Force) và mô hình lò xo giảm chấn tái tạo chiều sâu nét vẽ 3D tự nhiên.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <BrainCircuit size={16} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white break-word-safe">Gemini 3.5 AI Processor</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed break-word-safe">
                  Mô hình xử lý tài liệu tối ưu về tốc độ và chi phí, mổ xẻ nguyên lý logic sâu sắc và chống thói quen học vẹt.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Volume2 size={16} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white break-word-safe">Web Audio Spatial DSP</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed break-word-safe">
                  Bộ xử lý tín hiệu số tổng hợp sóng não Alpha (432Hz) và Delta (0.5-4Hz) chuẩn Hi-Fi trực tiếp trên trình duyệt.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white break-word-safe">Cloud Firestore & eKYC</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed break-word-safe">
                  Bảo vệ dữ liệu người dùng đa thiết bị, đồng bộ tức thời thời gian thực và xác thực bản quyền tác giả chính thức.
                </p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ❓ FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* ========================================================================= */}
      {(activeSectionTab === 'faq' || activeSectionTab === 'all') && (
        <section id="faq-section" className="w-full max-w-4xl px-2.5 sm:px-6 mb-8 sm:mb-12">
          <div className="text-center mb-4 sm:mb-6 space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-purple-500/40">
              HỎI ĐÁP & HƯỚNG DẪN
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white break-word-safe">
              Câu Hỏi Thường Gặp Về Hệ Sinh Thái Haevy
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden"
              >
                <button
                  onClick={() => {
                    haptics.selection();
                    setFaqOpenIndex(faqOpenIndex === idx ? null : idx);
                  }}
                  className="w-full p-3 sm:p-4 text-left flex items-center justify-between gap-2.5 hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-2 break-word-safe">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0">
                      ?
                    </span>
                    {faq.q}
                  </span>
                  <span className="text-zinc-500 text-base sm:text-lg font-bold shrink-0">
                    {faqOpenIndex === idx ? '−' : '+'}
                  </span>
                </button>

                {faqOpenIndex === idx && (
                  <div className="p-3 sm:p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 break-word-safe">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 🚀 QUICK JUMP FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-7xl px-2.5 sm:px-6 pb-12 text-center text-xs text-zinc-500 space-y-2.5 border-t border-zinc-800 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-zinc-400 font-bold text-xs">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-400 cursor-pointer">Trang Đầu</button>
          <button onClick={() => setSelectedDemoModal('space_demo')} className="hover:text-amber-400 cursor-pointer">Thử Vẽ 3D AR</button>
          <button onClick={() => setSelectedDemoModal('ai_demo')} className="hover:text-amber-400 cursor-pointer">Thử Trợ Lý AI</button>
          <button onClick={handleClaimFestivalGift} className="hover:text-amber-400 cursor-pointer">Nhận 500 Xu Tân Thủ</button>
        </div>
        <p className="font-bold text-zinc-400 break-word-safe">
          © {new Date().getFullYear()} Haevy Ecosystem • Nền Tảng Đa Trải Nghiệm Sáng Tạo & Thư Giãn Toàn Diện
        </p>
        <p className="text-[10px] sm:text-[11px] text-zinc-600 break-word-safe">
          Được tối ưu cho mọi thiết bị: Máy tính cá nhân, Bảng vẽ, Điện thoại cảm ứng & Kính thực tế ảo AR.
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* 🚀 FLOATING QUICK DOCK & BACK TO TOP BUTTON (CHỐNG VUỐT MỎI TAY) */}
      {/* ========================================================================= */}
      {showBackToTop && (
        <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <button
            onClick={() => {
              haptics.selection();
              scrollToTop();
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black shadow-xl shadow-amber-400/25 border border-amber-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp size={18} className="shrink-0" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎬 INTERACTIVE DEMO MODAL (POPUP PREVIEW RIGHT ON LANDING PAGE) */}
      {/* ========================================================================= */}
      {selectedDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative max-h-[88dvh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedDemoModal(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* AI STUDY DEMO */}
            {selectedDemoModal === 'ai_demo' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <BrainCircuit size={22} />
                  <h3 className="text-lg font-black text-white">Dùng Thử Trợ Lý Học Sâu Haevy AI (Gemini 3.5 Flash)</h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Nhập chủ đề hoặc tài liệu cần phân tích bản chất logic (không học vẹt):
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={demoAiInput}
                    onChange={(e) => setDemoAiInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Nhập nội dung cần giải mã bản chất..."
                  />
                  <button
                    onClick={handleRunAiDemo}
                    disabled={isAnalyzingAi}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzingAi ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{isAnalyzingAi ? 'AI Đang Mổ Xẻ Bản Chất Logic...' : 'Phân Tích Nguyên Lý Gốc Rễ'}</span>
                  </button>
                </div>

                {demoAiResult && (
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/30 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    {demoAiResult}
                  </div>
                )}
              </div>
            )}

            {/* SPIRITUAL DEMO */}
            {selectedDemoModal === 'spiritual_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Spiritual & Tâm Linh Vũ Trụ</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Trải nghiệm huyền học đỉnh cao: Bói 78 lá bài Tarot 3D Rider-Waite chân thực, lập lá số Tử Vi trọn đời và vận hạn 2026 Bính Ngọ, bản đồ sao Chiêm Tinh Natal Chart và sóng âm Solfeggio 528Hz chữa lành.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Check size={14} className="text-purple-400 shrink-0" /> 
                    <span>Xào bài & rút 78 lá Tarot 3D kèm âm thanh chuông xoay Tây Tạng</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Check size={14} className="text-purple-400 shrink-0" /> 
                    <span>Lập lá số Tử Vi 12 cung & Sao chiếu mệnh năm 2026 Bính Ngọ</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Check size={14} className="text-purple-400 shrink-0" /> 
                    <span>Khám phá 12 Cung Hoàng Đạo & Sóng âm Solfeggio 528Hz chuyển hóa năng lượng</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    if (onSelectMode) {
                      onSelectMode('spiritual');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  Vào Trải Nghiệm Haevy Spiritual Ngay
                </button>
              </div>
            )}

            {/* 3D SPACE DEMO */}
            {selectedDemoModal === 'space_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Không Gian Vẽ 3D & Metaverse Tách Nét 100%</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Công nghệ không gian 3D của Haevy cho phép từng nét vẽ và chữ viết tồn tại độc lập trong không gian ba chiều, tự do xoay 360°, hỗ trợ cử chỉ nhận diện tay Pinch AR qua camera.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-cyan-500/30 text-left space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Check size={14} className="text-cyan-400 shrink-0" /> 
                    <span>Tái tạo chiều sâu Z bằng thuật toán biến thiên lực đè quang học</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Check size={14} className="text-cyan-400 shrink-0" /> 
                    <span>Điều khiển Pinch hai ngón tay không chạm qua Camera</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Check size={14} className="text-cyan-400 shrink-0" /> 
                    <span>Tương tác cùng linh vật Haevy Son 3D sống động với biểu cảm thực tế</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Nhận 500 Xu & Bắt Đầu Trải Nghiệm
                </button>
              </div>
            )}

            {/* AUDIO DEMO */}
            {selectedDemoModal === 'audio_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Moon size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Audio & Kho Truyện Thư Giãn</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Kho truyện audio bất tận kết hợp sóng não Delta ru ngủ êm ái, âm thanh chuẩn phòng thu và chế độ hẹn giờ tắt thông minh.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-indigo-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Check size={14} className="text-indigo-400 shrink-0" /> 
                    <span>Hàng ngàn giờ truyện Audio: Kiếm hiệp, Tiên hiệp, Ngôn tình, Trinh thám</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Check size={14} className="text-indigo-400 shrink-0" /> 
                    <span>Sóng não Delta (0.5 - 4Hz) hỗ trợ thư giãn và ngủ sâu tự nhiên</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Check size={14} className="text-indigo-400 shrink-0" /> 
                    <span>Bộ đếm giờ tắt thông minh tự động dừng phát nhạc sau khi ngủ</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Nhận 500 Xu Thưởng & Trải Nghiệm Haevy Audio
                </button>
              </div>
            )}

            {/* STUDIO DEMO */}
            {selectedDemoModal === 'studio_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Mic size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Studio & AI Voice Tác Giả</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Chuyển văn bản thành giọng nói truyền cảm hứng, xác thực định danh tác giả eKYC bảo vệ bản quyền và nhận quà tặng thính giả.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-rose-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Công nghệ AI Voice TTS đa thanh âm, biểu cảm tự nhiên</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Hệ thống eKYC bảo vệ độc quyền bản quyền tác phẩm của tác giả</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Nhận xu donate trực tiếp từ cộng đồng người nghe trung thành</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Nhận 500 Xu Thưởng & Bắt Đầu Sáng Tác
                </button>
              </div>
            )}

            {/* MESSAGES DEMO */}
            {selectedDemoModal === 'messages_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Message & Kết Nối Bạn Bè</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Trò chuyện tức thời với bạn bè, gọi thoại voice/video chất lượng cao và chia sẻ những bản audio yêu thích trong không gian an toàn.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-sky-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <Check size={14} className="text-sky-400 shrink-0" /> 
                    <span>Nhắn tin thời gian thực với mã hóa an toàn</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <Check size={14} className="text-sky-400 shrink-0" /> 
                    <span>Gọi thoại trực tiếp không giới hạn thời lượng cuộc gọi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <Check size={14} className="text-sky-400 shrink-0" /> 
                    <span>Trợ lý Haevy AI đọc hiểu và hỗ trợ cuộc trò chuyện</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Nhận 500 Xu Thưởng & Kết Nối Bạn Bè
                </button>
              </div>
            )}

            {/* COUPLE DEMO */}
            {selectedDemoModal === 'couple_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Heart size={28} />
                </div>
                <h3 className="text-lg font-black text-white">I Love Haevy & Không Gian Cặp Đôi</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Không gian riêng tư cho hai người yêu nhau: Nhật ký tình yêu chung, theo dõi chu kỳ chăm sóc bạn gái và mini game đố ngày kỷ niệm.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-rose-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Mã ghép cặp độc quyền bảo mật 100% riêng tư</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Theo dõi chu kỳ & Lời nhắn yêu thương gửi bạn gái</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <Check size={14} className="text-rose-400 shrink-0" /> 
                    <span>Hộp thư thoại & Đố vui ngày kỷ niệm tình yêu</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Nhận 500 Xu Thưởng & Ghép Cặp Tình Yêu
                </button>
              </div>
            )}

            {/* FINANCE DEMO */}
            {selectedDemoModal === 'finance_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Finance & Sổ Thu Chi 6 Hũ</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Quản lý ngân sách cá nhân thông minh, ghi chép thu chi 1 chạm cực nhanh và báo cáo dòng tiền trực quan.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Ghi chép thu chi nhanh chóng chỉ trong 3 giây</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Phân bổ ngân sách khoa học (Hũ chi tiêu thiết yếu, đầu tư, tiết kiệm)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Biểu đồ trực quan và bảo mật dữ liệu tuyệt đối</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Nhận 500 Xu Thưởng & Quản Lý Tài Chính
                </button>
              </div>
            )}

            {/* VIP CLUB DEMO */}
            {selectedDemoModal === 'vip_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Crown size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy VIP Club & Đặc Quyền Hoàng Gia</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Đặc quyền âm thanh Spatial Lossless Hi-Fi, huy hiệu Vương Miện vàng phát sáng và ưu đãi tặng quà độc quyền cho tác giả.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Âm thanh Spatial Hi-Fi Lossless chuẩn phòng thu quốc tế</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Huy hiệu Vương Miện VIP vàng rực rỡ bên cạnh tên người dùng</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Quyền truy cập sớm các tính năng và kho quà độc quyền</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  Nhận 500 Xu Thưởng & Trải Nghiệm VIP
                </button>
              </div>
            )}

            {/* SUPPORT DEMO */}
            {selectedDemoModal === 'support_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <LifeBuoy size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Support & Trung Tâm Hỗ Trợ 24/7</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng trợ giúp: Gửi ticket nhanh, tra cứu FAQ và hỗ trợ trực tuyến.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Gửi yêu cầu hỗ trợ (Ticket) và nhận phản hồi nhanh chóng</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Kho câu hỏi thường gặp FAQ giải đáp mọi thắc mắc</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Hỗ trợ trực tiếp qua kênh Zalo, Telegram và Hotline</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDemoModal(null);
                    handleClaimFestivalGift();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-emerald-400/20"
                >
                  Nhận 500 Xu Thưởng & Đến Trung Tâm Hỗ Trợ
                </button>
              </div>
            )}

            {/* FAMILY TREE DEMO */}
            {selectedDemoModal === 'family_tree_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <GitFork size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Family Tree & Phả Hệ Gia Tộc Thông Minh</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Sơ đồ cây phả hệ tương tác thu phóng mượt mà, lưu trữ sắc phong, thiết lập mối quan hệ gia tộc, tự động tính ngày giỗ Âm-Dương và hòm thư phê duyệt đề xuất.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Sơ đồ cây gia phả tương tác mượt mà, tìm kiếm và lọc thế hệ</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Lịch giỗ chạp Âm-Dương tự động nhắc nhở & đếm ngược ngày giỗ</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Check size={14} className="text-amber-400 shrink-0" /> 
                    <span>Phân quyền Trưởng tộc (Admin) & Hòm thư con cháu đề xuất cập nhật</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDemoModal(null);
                      if (onSelectMode) {
                        onSelectMode('family_tree');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    Vào Xem Cây Phả Hệ Ngay 👑
                  </button>
                </div>
              </div>
            )}

            {selectedDemoModal === 'edu_demo' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-lg font-black text-white">Haevy Edu & Phòng Thí Nghiệm STEM Ảo</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Phòng thí nghiệm ảo đa ngành tương tác vật lý, hóa học, sinh học, AI đọc tài liệu xây dựng lộ trình học First Principles và AI Gia Sư chuyên sâu.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>AI Gia Sư First Principles & Socratic: Hiểu bản chất logic, tránh học vẹt</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Phòng Lab ảo HTML5 Canvas: Con lắc đơn, mạch điện Kirchhoff, chuẩn độ axit bazơ</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Check size={14} className="text-emerald-400 shrink-0" /> 
                    <span>Đọc tài liệu PDF/văn bản, trích xuất nguyên lý cốt lõi & lập lộ trình học</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDemoModal(null);
                      if (onSelectMode) {
                        onSelectMode('edu');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-zinc-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-emerald-400/20"
                  >
                    Vào Khám Phá Haevy Edu Ngay 🎓
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ALL MODES COMPREHENSIVE INFORMATION MODAL (Opened via 4-Blocks Icon) */}
      <HaevyAllModesInfoModal
        isOpen={isAllModesPanelOpen}
        onClose={() => setIsAllModesPanelOpen(false)}
        onSelectMode={(modeId) => {
          setIsAllModesPanelOpen(false);
          if (onSelectMode) {
            onSelectMode(modeId);
          } else {
            setSelectedDemoModal(`${modeId}_demo`);
          }
        }}
        onSelectDemoModal={(demoKey) => {
          setIsAllModesPanelOpen(false);
          setSelectedDemoModal(demoKey);
        }}
        onClaimGift={handleClaimFestivalGift}
      />

    </div>
  );
}
