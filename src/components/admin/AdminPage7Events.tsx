import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Users, 
  Coins, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  Music, 
  Crown, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  Sliders, 
  Copy, 
  Zap, 
  Tag,
  Upload,
  Image as ImageIcon,
  Gift,
  Gamepad2,
  Headphones,
  Compass,
  MessageSquare,
  Mic2,
  Wallet,
  Heart,
  Video,
  Globe,
  Award,
  Sparkle,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  HaevyUpcomingEvent, 
  EventCategory, 
  EventTheme, 
  EventStatus,
  EventAudience,
  EventDisplayLocation,
  EventIconName,
  EventRewardDisplayStyle,
  EventHostingMode
} from '../../types';

interface EventPreset {
  name: string;
  category: EventCategory;
  theme: EventTheme;
  gradientFrom: string;
  gradientTo: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImageUrl: string;
  rewardCoins: number;
  rewardBadgeText: string;
  rewardDisplayStyle: EventRewardDisplayStyle;
  hostingMode: EventHostingMode;
  iconName: EventIconName;
  ctaText: string;
  ctaAction: 'mode_portal' | 'mode_audio' | 'mode_games' | 'mode_space' | 'mode_messages' | 'mode_studio' | 'mode_finance' | 'mode_couple' | 'mode_vip' | 'mode_support' | 'open_link' | 'custom_modal';
}

const PRESET_TEMPLATES: EventPreset[] = [
  {
    name: '👑 Đại Hội Âm Nhạc & Hệ Sinh Thái',
    category: 'holiday',
    theme: 'gold_luxury',
    gradientFrom: '#fbbf24',
    gradientTo: '#f59e0b',
    badge: '👑 ĐẠI LỄ HỆ SINH THÁI',
    title: 'Đại Hội Âm Nhạc Hoàng Gia Haevy 2026',
    subtitle: 'Đêm Hội Lossless Hi-Fi & Tri Ân Toàn Hệ Thống',
    description: 'Khai mạc đêm hội âm thanh đỉnh cao, tặng 500 Xu Haevy cho toàn bộ thành viên check-in và mở khóa danh hiệu Thành Viên Danh Dự.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 500,
    rewardBadgeText: '+500 Xu & Huy Hiệu Hoàng Gia',
    rewardDisplayStyle: 'gold_chest',
    hostingMode: 'mode_portal',
    iconName: 'crown',
    ctaText: 'Nhận 500 Xu & Tham Gia',
    ctaAction: 'mode_portal',
  },
  {
    name: '⚡ Đấu Trường Trí Tuệ ×2 Triệu Xu',
    category: 'tournament',
    theme: 'cyber_fire',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
    badge: '⚡ GIẢI ĐẤU ×2 XU',
    title: 'Đấu Trường Đám Đông: Vua Âm Nhạc',
    subtitle: 'Vòng Đua Tranh Bảng Vàng Trí Tuệ',
    description: 'Thách đấu cùng hàng ngàn thành viên khác trong trò chơi Trí Tuệ Đám Đông trực tiếp mỗi tối, tổng thưởng 1,000,000 Xu Haevy.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 1000,
    rewardBadgeText: 'Giải Thưởng 1,000,000 Xu',
    rewardDisplayStyle: 'lucky_wheel',
    hostingMode: 'mode_games',
    iconName: 'trophy',
    ctaText: 'Vào Đấu Trường Ngay',
    ctaAction: 'mode_games',
  },
  {
    name: '🌌 Triển Lãm Không Gian 3D Vũ Trụ',
    category: 'space_ar',
    theme: 'neon_galaxy',
    gradientFrom: '#8b5cf6',
    gradientTo: '#3b82f6',
    badge: '🌌 SPACE 3D AR',
    title: 'Hành Trình Âm Thanh Vũ Trụ 3D',
    subtitle: 'Đắm Chìm Cực Quang & Sóng Não Alpha',
    description: 'Trải nghiệm không gian âm thanh thực tế ảo 3D Space hoàn toàn mới, kích hoạt trạng thái thư giãn sâu và sạc lại năng lượng tinh thần.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 300,
    rewardBadgeText: '+300 Xu Thư Giãn',
    rewardDisplayStyle: 'neon_crystal',
    hostingMode: 'mode_space',
    iconName: 'sparkles',
    ctaText: 'Trải Nghiệm Space 3D',
    ctaAction: 'mode_space',
  },
  {
    name: '🎧 Ra Mắt Tuyệt Phẩm Album Master Lossless',
    category: 'album_launch',
    theme: 'emerald_zen',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
    badge: '🎧 RA MẮT ĐỘC QUYỀN',
    title: 'Khai Mở Tuyệt Tác Âm Hưởng 2026',
    subtitle: 'Album Tuyển Chọn Master Lossless Hi-Fi',
    description: 'Đặc quyền trải nghiệm sớm 12 bản nhạc thiền & cốt truyện độc quyền chỉ dành riêng cho hệ thống Haevy Audio.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 200,
    rewardBadgeText: '+200 Xu Thính Giả',
    rewardDisplayStyle: 'gift_box',
    hostingMode: 'mode_audio',
    iconName: 'music',
    ctaText: 'Nghe Ngay Album Mới',
    ctaAction: 'mode_audio',
  },
  {
    name: '🪙 Cơn Mưa Xu Haevy Thịnh Vượng',
    category: 'giveaway',
    theme: 'sunset_orange',
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
    badge: '🪙 MƯA XU HAEVY',
    title: 'Lễ Hội Mưa Xu & Quản Lý Dòng Tiền',
    subtitle: 'Khai Mở Két Sắt Tài Chính Thông Minh',
    description: 'Nhận ngay mưa xu thưởng miễn phí, thử nghiệm tính năng lập kế hoạch tài chính và chia sẻ mẹo đầu tư cùng chuyên gia.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 800,
    rewardBadgeText: 'Mưa Xu +800 Coins',
    rewardDisplayStyle: 'coin_fountain',
    hostingMode: 'mode_finance',
    iconName: 'zap',
    ctaText: 'Hốt Xu & Mở Két Sắt',
    ctaAction: 'mode_finance',
  },
  {
    name: '🎴 Đại Tiệc Dạ Hội Quý Tộc VIP',
    category: 'live_show',
    theme: 'royal_purple',
    gradientFrom: '#7c3aed',
    gradientTo: '#ec4899',
    badge: '👑 ĐẶC QUYỀN VIP',
    title: 'Dạ Tiệc Tri Ân Hội Viên Tinh Anh',
    subtitle: 'Mở Khóa Huy Hiệu & Thẻ Bài Hoàng Gia',
    description: 'Sự kiện riêng tư dành riêng cho thành viên VIP và khách mời cao cấp với chuỗi quà tặng độc quyền và phòng trò chuyện phong cách quý tộc.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    rewardCoins: 1500,
    rewardBadgeText: '+1500 Xu & Thẻ Hoàng Gia',
    rewardDisplayStyle: 'royal_card',
    hostingMode: 'mode_vip',
    iconName: 'crown',
    ctaText: 'Nhập Hội VIP Ngay',
    ctaAction: 'mode_vip',
  }
];

const CURATED_BANNER_GALLERY = [
  { name: '👑 Đại Tiệc Hoàng Gia', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop' },
  { name: '⚡ Đấu Trường Gaming', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop' },
  { name: '🌌 Cực Quang Vũ Trụ', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop' },
  { name: '🎧 DJ & Âm Thanh Lossless', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop' },
  { name: '💰 Tài Chính & Vàng Bạc', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop' },
  { name: '💖 Tình Yêu Cặp Đôi', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop' },
  { name: '🎙️ Phòng Thu Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop' },
  { name: '🌃 Cyberpunk Thành Phố Đêm', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop' },
];

const REWARD_STYLES: { 
  id: EventRewardDisplayStyle; 
  title: string; 
  icon: string; 
  desc: string; 
  bgGradient: string; 
  borderColor: string;
  badgeTag: string;
}[] = [
  {
    id: 'gold_chest',
    title: 'Rương Vàng Hoàng Kim',
    icon: '👑',
    desc: 'Hòm báu vật mạ vàng phát sáng lấp lánh ánh kim',
    bgGradient: 'from-amber-500/20 via-yellow-500/20 to-amber-600/30',
    borderColor: 'border-amber-400',
    badgeTag: 'RƯƠNG VÀNG'
  },
  {
    id: 'neon_crystal',
    title: 'Pha Lê Tinh Thể Vũ Trụ',
    icon: '💎',
    desc: 'Khối pha lê năng lượng tím xanh phát quang huyền bí',
    bgGradient: 'from-purple-500/20 via-indigo-500/20 to-cyan-600/30',
    borderColor: 'border-purple-400',
    badgeTag: 'TINH THỂ'
  },
  {
    id: 'gift_box',
    title: 'Hộp Quà Phát Sáng Thắt Nơ',
    icon: '🎁',
    desc: 'Hộp quà thắt nơ rực rỡ mang không khí đại tiệc',
    bgGradient: 'from-rose-500/20 via-red-500/20 to-orange-600/30',
    borderColor: 'border-rose-400',
    badgeTag: 'HỘP QUÀ'
  },
  {
    id: 'lucky_wheel',
    title: 'Vòng Quay May Mắn Vàng',
    icon: '🎡',
    desc: 'Vòng quay số nhân bội số Xu may mắn ngẫu nhiên',
    bgGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-600/30',
    borderColor: 'border-emerald-400',
    badgeTag: 'VÒNG QUAY'
  },
  {
    id: 'coin_fountain',
    title: 'Mưa Xu Haevy 3D',
    icon: '🪙',
    desc: 'Hiệu ứng các đồng xu vàng rơi lấp lánh rộn ràng',
    bgGradient: 'from-yellow-500/25 via-amber-500/20 to-orange-500/30',
    borderColor: 'border-yellow-400',
    badgeTag: 'MƯA XU 3D'
  },
  {
    id: 'royal_card',
    title: 'Thẻ Bài Hoàng Gia VIP',
    icon: '🎴',
    desc: 'Thẻ bài vinh danh danh dự mạ vàng nổi khối 3D',
    bgGradient: 'from-indigo-600/20 via-violet-600/20 to-amber-500/25',
    borderColor: 'border-indigo-400',
    badgeTag: 'THẺ HOÀNG GIA'
  },
  {
    id: 'minimal_badge',
    title: 'Huy Hiệu Tinh Gọn',
    icon: '🏷️',
    desc: 'Huy hiệu viền mảnh trang nhã phong cách hiện đại',
    bgGradient: 'from-slate-700/30 via-slate-800/30 to-slate-900/40',
    borderColor: 'border-slate-500',
    badgeTag: 'HUY HIỆU'
  }
];

const HOSTING_MODES: {
  id: EventHostingMode;
  name: string;
  icon: any;
  desc: string;
  defaultCta: string;
  ctaAction: HaevyUpcomingEvent['ctaAction'];
  color: string;
}[] = [
  {
    id: 'mode_portal',
    name: 'Cổng Hệ Sinh Thái Haevy',
    icon: Compass,
    desc: 'Trang chủ cổng tổng hợp các phân hệ và sự kiện lớn',
    defaultCta: 'Nhận Quà & Khám Phá',
    ctaAction: 'mode_portal',
    color: 'text-amber-400 border-amber-500/40'
  },
  {
    id: 'mode_audio',
    name: 'Trình Phát Nhạc Lossless & Audio Studio',
    icon: Headphones,
    desc: 'Không gian nghe nhạc chất lượng cao, album độc quyền & podcast',
    defaultCta: 'Nghe Ngay Album Mới',
    ctaAction: 'mode_audio',
    color: 'text-emerald-400 border-emerald-500/40'
  },
  {
    id: 'mode_games',
    name: 'Đấu Trường Games & Trí Tuệ Đám Đông',
    icon: Gamepad2,
    desc: 'Giải đấu trí tuệ trực tiếp đối kháng thời gian thực',
    defaultCta: 'Vào Đấu Trường Ngay',
    ctaAction: 'mode_games',
    color: 'text-orange-400 border-orange-500/40'
  },
  {
    id: 'mode_space',
    name: 'Không Gian Vũ Trụ 3D Space AR',
    icon: Sparkles,
    desc: 'Thế giới thực tế ảo 3D đắm chìm sóng não và cực quang',
    defaultCta: 'Trải Nghiệm Space 3D',
    ctaAction: 'mode_space',
    color: 'text-purple-400 border-purple-500/40'
  },
  {
    id: 'mode_messages',
    name: 'Tin Nhắn & Bảng Tin Cộng Đồng',
    icon: MessageSquare,
    desc: 'Kênh trò chuyện, giao lưu kết nối và đăng bài cộng đồng',
    defaultCta: 'Giao Lưu Cộng Đồng',
    ctaAction: 'mode_messages',
    color: 'text-blue-400 border-blue-500/40'
  },
  {
    id: 'mode_studio',
    name: 'Phòng Thu Sáng Tác Studio',
    icon: Mic2,
    desc: 'Công cụ sáng tác nhạc, phối beat và thu âm chuyên nghiệp',
    defaultCta: 'Vào Phòng Thu Âm',
    ctaAction: 'mode_studio',
    color: 'text-rose-400 border-rose-500/40'
  },
  {
    id: 'mode_finance',
    name: 'Quản Lý Dòng Tiền & Két Sắt Tài Chính',
    icon: Wallet,
    desc: 'Tính năng quản lý chi tiêu, sổ tiết kiệm và dòng tiền thông minh',
    defaultCta: 'Mở Két Sắt Tài Chính',
    ctaAction: 'mode_finance',
    color: 'text-yellow-400 border-yellow-500/40'
  },
  {
    id: 'mode_couple',
    name: 'Không Gian Cặp Đôi Yêu Thương',
    icon: Heart,
    desc: 'Không gian nhật ký kỷ niệm, nghe nhạc đôi và đồng hồ tình yêu',
    defaultCta: 'Vào Không Gian Đôi',
    ctaAction: 'mode_couple',
    color: 'text-pink-400 border-pink-500/40'
  },
  {
    id: 'mode_vip',
    name: 'Hội Quán Đặc Quyền VIP',
    icon: Crown,
    desc: 'Đặc quyền thành viên cấp cao, tri ân và dịch vụ ưu tiên',
    defaultCta: 'Nhận Đặc Quyền VIP',
    ctaAction: 'mode_vip',
    color: 'text-amber-300 border-amber-400/50'
  },
  {
    id: 'mode_live',
    name: 'Khán Đài Trực Tiếp Live Show',
    icon: Video,
    desc: 'Sân khấu trực tiếp tương tác cùng nghệ sĩ và bình luận',
    defaultCta: 'Xem Trực Tiếp Live',
    ctaAction: 'mode_portal',
    color: 'text-red-400 border-red-500/40'
  },
  {
    id: 'open_link',
    name: 'Liên Kết Tùy Chỉnh (Web Ngoài)',
    icon: Globe,
    desc: 'Mở trang web hoặc đường dẫn landing page tùy ý',
    defaultCta: 'Mở Trang Sự Kiện',
    ctaAction: 'open_link',
    color: 'text-slate-300 border-slate-600'
  }
];

export const AdminPage7Events: React.FC = () => {
  const { 
    upcomingEvents, 
    createUpcomingEvent, 
    updateUpcomingEvent, 
    deleteUpcomingEvent, 
    toggleEventPin,
    toggleEventStatus,
    claimEventReward,
    user,
    audioPoints,
    isAdmin 
  } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | EventStatus>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | EventCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Create / Edit
  const [formState, setFormState] = useState<Partial<HaevyUpcomingEvent>>({
    title: '',
    subtitle: '',
    description: '',
    badge: 'SẮP DIỄN RA',
    category: 'holiday',
    theme: 'gold_luxury',
    customGradientFrom: '#fbbf24',
    customGradientTo: '#f59e0b',
    customBorderColor: '#eab308',
    customTextColor: '#ffffff',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    iconName: 'sparkles',
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    countdownEnabled: true,
    status: 'upcoming',
    ctaText: 'Đăng Ký Nhận 500 Xu',
    ctaAction: 'mode_portal',
    ctaUrl: '',
    rewardCoins: 500,
    rewardBadgeText: '+500 Xu & Quà Tặng',
    rewardDisplayStyle: 'gold_chest',
    hostingMode: 'mode_portal',
    targetAudience: 'all',
    targetAccountIds: [],
    displayLocations: ['portal', 'audio_home'],
    isPinned: false,
    priorityOrder: 50,
  });

  const [targetAccountInput, setTargetAccountInput] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setFormState({
      title: '',
      subtitle: '',
      description: '',
      badge: 'SẮP DIỄN RA',
      category: 'holiday',
      theme: 'gold_luxury',
      customGradientFrom: '#fbbf24',
      customGradientTo: '#f59e0b',
      customBorderColor: '#eab308',
      customTextColor: '#ffffff',
      bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      iconName: 'sparkles',
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      countdownEnabled: true,
      status: 'upcoming',
      ctaText: 'Đăng Ký Nhận 500 Xu',
      ctaAction: 'mode_portal',
      ctaUrl: '',
      rewardCoins: 500,
      rewardBadgeText: '+500 Xu Haevy',
      rewardDisplayStyle: 'gold_chest',
      hostingMode: 'mode_portal',
      targetAudience: 'all',
      targetAccountIds: [],
      displayLocations: ['portal', 'audio_home'],
      isPinned: false,
      priorityOrder: 50,
    });
    setTargetAccountInput('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (event: HaevyUpcomingEvent) => {
    setEditingEventId(event.id);
    setFormState({
      ...event,
      rewardDisplayStyle: event.rewardDisplayStyle || 'gold_chest',
      hostingMode: event.hostingMode || (event.ctaAction as any) || 'mode_portal',
      startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
      endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
    });
    setTargetAccountInput(event.targetAccountIds?.join(', ') || '');
    setIsFormOpen(true);
  };

  const handleApplyPreset = (preset: EventPreset) => {
    setFormState(prev => ({
      ...prev,
      category: preset.category,
      theme: preset.theme,
      customGradientFrom: preset.gradientFrom,
      customGradientTo: preset.gradientTo,
      badge: preset.badge,
      title: preset.title,
      subtitle: preset.subtitle,
      description: preset.description,
      bannerImageUrl: preset.bannerImageUrl,
      rewardCoins: preset.rewardCoins,
      rewardBadgeText: preset.rewardBadgeText,
      rewardDisplayStyle: preset.rewardDisplayStyle,
      hostingMode: preset.hostingMode,
      iconName: preset.iconName,
      ctaText: preset.ctaText,
      ctaAction: preset.ctaAction,
    }));
    showToast('success', `Đã áp dụng mẫu sự kiện "${preset.name}"!`);
  };

  const handleHostingModeSelect = (mode: typeof HOSTING_MODES[0]) => {
    setFormState(prev => ({
      ...prev,
      hostingMode: mode.id,
      ctaAction: mode.ctaAction,
      ctaText: prev.ctaText || mode.defaultCta,
    }));
  };

  // Image Upload Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormState(prev => ({ ...prev, bannerImageUrl: dataUrl }));
        showToast('success', 'Đã tải ảnh lên thành công từ thiết bị của bạn!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim()) {
      showToast('error', 'Vui lòng nhập tiêu đề sự kiện!');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAccountIds = targetAccountInput
        ? targetAccountInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
        : [];

      const payload: Partial<HaevyUpcomingEvent> = {
        ...formState,
        startAt: formState.startAt ? new Date(formState.startAt).toISOString() : new Date().toISOString(),
        endAt: formState.endAt ? new Date(formState.endAt).toISOString() : new Date().toISOString(),
        targetAccountIds: parsedAccountIds,
        rewardDisplayStyle: formState.rewardDisplayStyle || 'gold_chest',
        hostingMode: formState.hostingMode || 'mode_portal',
      };

      if (editingEventId) {
        const res = await updateUpcomingEvent(editingEventId, payload);
        if (res.success) {
          showToast('success', res.message);
          setIsFormOpen(false);
        } else {
          showToast('error', res.message);
        }
      } else {
        const res = await createUpcomingEvent(payload);
        if (res.success) {
          showToast('success', res.message);
          setIsFormOpen(false);
        } else {
          showToast('error', res.message);
        }
      }
    } catch (err: any) {
      showToast('error', 'Có lỗi xảy ra: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    const res = await deleteUpcomingEvent(eventId);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  const handleTogglePin = async (eventId: string, currentPin: boolean) => {
    const res = await toggleEventPin(eventId, !currentPin);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    const res = await toggleEventStatus(eventId, newStatus);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  const handleDuplicate = async (event: HaevyUpcomingEvent) => {
    const duplicated: Partial<HaevyUpcomingEvent> = {
      ...event,
      title: `${event.title} (Bản sao)`,
      status: 'draft',
      isPinned: false,
      joinedCount: 0,
      viewCount: 0,
      registeredUserIds: [],
      claimedUserIds: [],
    };
    delete (duplicated as any).id;
    const res = await createUpcomingEvent(duplicated);
    if (res.success) {
      showToast('success', 'Đã nhân bản sự kiện thành công dưới dạng Bản nháp!');
    } else {
      showToast('error', res.message);
    }
  };

  // User / Admin Claim Event Coin Test
  const handleClaimReward = async (event: HaevyUpcomingEvent) => {
    if (!user) {
      showToast('error', 'Vui lòng đăng nhập để nhận Xu Haevy.');
      return;
    }

    const claimed = (event.claimedUserIds || []).includes(user.uid);
    if (claimed) {
      showToast('error', 'Bạn đã nhận phần thưởng của sự kiện này rồi!');
      return;
    }

    setIsClaiming(event.id);
    try {
      const res = await claimEventReward(event.id);
      if (res.success) {
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (e: any) {
      showToast('error', 'Lỗi khi nhận quà: ' + (e.message || ''));
    } finally {
      setIsClaiming(null);
    }
  };

  // Filter and search
  const filteredEvents = upcomingEvents.filter(ev => {
    if (activeFilter !== 'all' && ev.status !== activeFilter) return false;
    if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.subtitle && ev.subtitle.toLowerCase().includes(q)) ||
        (ev.badge && ev.badge.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCount = upcomingEvents.length;
  const upcomingCount = upcomingEvents.filter(e => e.status === 'upcoming').length;
  const liveCount = upcomingEvents.filter(e => e.status === 'live').length;
  const endedCount = upcomingEvents.filter(e => e.status === 'ended').length;
  const totalJoined = upcomingEvents.reduce((acc, curr) => acc + (curr.joinedCount || 0), 0);

  // Helper theme background
  const getThemeBg = (theme?: EventTheme, from?: string, to?: string) => {
    if (from && to) return `linear-gradient(135deg, ${from}, ${to})`;
    switch (theme) {
      case 'gold_luxury':
        return 'linear-gradient(135deg, #d97706, #f59e0b)';
      case 'cyber_fire':
        return 'linear-gradient(135deg, #dc2626, #ea580c)';
      case 'neon_galaxy':
        return 'linear-gradient(135deg, #7c3aed, #2563eb)';
      case 'emerald_zen':
        return 'linear-gradient(135deg, #059669, #0d9488)';
      case 'royal_purple':
        return 'linear-gradient(135deg, #6d28d9, #db2777)';
      case 'sunset_orange':
        return 'linear-gradient(135deg, #ea580c, #e11d48)';
      case 'midnight_blue':
      default:
        return 'linear-gradient(135deg, #1e293b, #0f172a)';
    }
  };

  const selectedRewardStyleObj = REWARD_STYLES.find(r => r.id === (formState.rewardDisplayStyle || 'gold_chest')) || REWARD_STYLES[0];
  const selectedHostingModeObj = HOSTING_MODES.find(h => h.id === (formState.hostingMode || 'mode_portal')) || HOSTING_MODES[0];

  return (
    <div id="admin-page7-events-container" className="space-y-6 text-slate-100 animate-in fade-in duration-300">
      
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div 
          id="admin-events-toast"
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-200 text-sm font-semibold ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TRANG 7 • QUẢN TRỊ SỰ KIỆN & LIVE SHOWS
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs font-medium text-slate-400">Tùy biến phần thưởng, chế độ tổ chức, tải ảnh & nhận Xu</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-amber-400" />
            Quản Lý & Tùy Chỉnh Sự Kiện Hệ Sinh Thái Haevy
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tạo các sự kiện âm nhạc, đại lễ hệ sinh thái, giải đấu trí tuệ và không gian 3D. Hỗ trợ chọn giao diện phần thưởng rương vàng/pha lê, chọn phân hệ tổ chức, tải ảnh trực tiếp và phân phối Xu Haevy tự động.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="admin-create-event-btn"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Tạo Sự Kiện Mới
          </button>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalCount}</div>
            <div className="text-[11px] text-slate-400">Tổng sự kiện</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{upcomingCount}</div>
            <div className="text-[11px] text-slate-400">Sắp diễn ra</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{liveCount}</div>
            <div className="text-[11px] text-slate-400">Đang Live</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{totalJoined}</div>
            <div className="text-[11px] text-slate-400">Lượt tham gia</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-300">
              {audioPoints ? audioPoints.toLocaleString() : 0} Xu
            </div>
            <div className="text-[11px] text-slate-400">Ví Xu của bạn</div>
          </div>
        </div>
      </div>

      {/* Preset Templates Quick Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Kho Mẫu Sự Kiện Chuẩn Hệ Sinh Thái (1 Click Áp Dụng)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Chọn mẫu sẵn để thiết lập nhanh chủ đề, phần thưởng và chế độ tổ chức
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_TEMPLATES.map((preset, idx) => (
            <div 
              key={idx}
              onClick={() => {
                handleApplyPreset(preset);
                setIsFormOpen(true);
              }}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/40 transition-all hover:bg-slate-950 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base shadow"
                  style={{ background: `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})` }}
                >
                  {preset.rewardDisplayStyle === 'gold_chest' && '👑'}
                  {preset.rewardDisplayStyle === 'neon_crystal' && '💎'}
                  {preset.rewardDisplayStyle === 'gift_box' && '🎁'}
                  {preset.rewardDisplayStyle === 'lucky_wheel' && '🎡'}
                  {preset.rewardDisplayStyle === 'coin_fountain' && '🪙'}
                  {preset.rewardDisplayStyle === 'royal_card' && '🎴'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400 font-semibold">{preset.rewardBadgeText}</span>
                    <span>•</span>
                    <span className="capitalize">{preset.hostingMode.replace('mode_', '')}</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-1 rounded-md bg-slate-800 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-[10px] font-semibold text-slate-400 transition-colors">
                Dùng Mẫu
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tất Cả ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Sắp Diễn Ra ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveFilter('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'live' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Đang Live ({liveCount})
          </button>
          <button
            onClick={() => setActiveFilter('ended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'ended' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Đã Kết Thúc ({endedCount})
          </button>
          <button
            onClick={() => setActiveFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'draft' 
                ? 'bg-amber-700 text-white' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Bản Nháp
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện, tiêu đề, mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Events Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Không tìm thấy sự kiện nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Chưa có sự kiện nào phù hợp với bộ lọc hiện tại. Bạn có thể nhấn nút "Tạo Sự Kiện Mới" để thiết lập ngay.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/30 cursor-pointer"
            >
              + Tạo Sự Kiện Mới Ngay
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isLive = event.status === 'live';
            const isUpcoming = event.status === 'upcoming';
            const isDraft = event.status === 'draft';
            const themeGradient = getThemeBg(event.theme, event.customGradientFrom, event.customGradientTo);
            const rStyle = REWARD_STYLES.find(r => r.id === event.rewardDisplayStyle) || REWARD_STYLES[0];
            const hMode = HOSTING_MODES.find(h => h.id === event.hostingMode) || HOSTING_MODES[0];
            const ModeIcon = hMode.icon;
            const isUserClaimed = user && (event.claimedUserIds || []).includes(user.uid);

            return (
              <div
                key={event.id}
                id={`admin-event-card-${event.id}`}
                className={`relative rounded-2xl bg-slate-900/80 border transition-all overflow-hidden flex flex-col justify-between ${
                  event.isPinned
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Event Card Banner Header */}
                <div 
                  className="relative h-48 p-5 flex flex-col justify-between bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage: event.bannerImageUrl 
                      ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.95)), url(${event.bannerImageUrl})`
                      : themeGradient,
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow"
                        style={{ background: themeGradient }}
                      >
                        {event.badge || 'SỰ KIỆN'}
                      </span>
                      {event.isPinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-amber-400 text-amber-400" /> Ghim Đầu
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Hosting Mode Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full bg-slate-950/80 border text-[11px] font-semibold flex items-center gap-1 ${hMode.color}`}>
                        <ModeIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{hMode.name}</span>
                      </span>

                      {/* Status indicator */}
                      <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60">
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : isUpcoming ? 'bg-blue-400' : isDraft ? 'bg-amber-400' : 'bg-slate-400'}`} />
                        <span className="text-[11px] font-semibold text-white">
                          {isLive && 'LIVE'}
                          {isUpcoming && 'SẮP DIỄN RA'}
                          {isDraft && 'BẢN NHÁP'}
                          {event.status === 'ended' && 'KẾT THÚC'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p className="text-xs text-amber-200/90 font-medium drop-shadow mt-0.5 line-clamp-1">
                        {event.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Details Body */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {event.description || 'Chưa có mô tả chi tiết cho sự kiện này.'}
                  </p>

                  {/* Reward Interface Showcase Pill */}
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${rStyle.bgGradient} border ${rStyle.borderColor} flex items-center justify-between gap-3 shadow-inner`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl drop-shadow">{rStyle.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{rStyle.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-mono">
                            {rStyle.badgeTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-200/90 font-medium">
                          {event.rewardBadgeText || `+${event.rewardCoins || 0} Xu Haevy`}
                        </div>
                      </div>
                    </div>

                    {/* Claim Button for testing & member reward */}
                    {event.rewardCoins && event.rewardCoins > 0 ? (
                      <button
                        onClick={() => handleClaimReward(event)}
                        disabled={isUserClaimed || isClaiming === event.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                          isUserClaimed 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 active:scale-95'
                        }`}
                      >
                        {isClaiming === event.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isUserClaimed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Đã Nhận {event.rewardCoins} Xu
                          </>
                        ) : (
                          <>
                            <Coins className="w-3.5 h-3.5" />
                            Nhận {event.rewardCoins} Xu
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{event.startAt ? new Date(event.startAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Chưa định'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{event.joinedCount || 0} người nhận / tham gia</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="capitalize">{event.category}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      <span className="truncate">{hMode.name}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Change status dropdown */}
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value as EventStatus)}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="live">Trực tiếp (Live)</option>
                        <option value="ended">Đã kết thúc</option>
                        <option value="draft">Bản nháp (Ẩn)</option>
                      </select>

                      <button
                        title={event.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                        onClick={() => handleTogglePin(event.id, !!event.isPinned)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          event.isPinned 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Nhân bản sự kiện"
                        onClick={() => handleDuplicate(event)}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa
                      </button>

                      <button
                        onClick={() => handleDelete(event.id, event.title)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors cursor-pointer"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form for Create / Edit */}
      {isFormOpen && (
        <div 
          id="event-editor-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div 
            id="event-editor-modal-container"
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-20">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  {editingEventId ? 'Chỉnh Sửa Tùy Biến Sự Kiện' : 'Tạo Sự Kiện Mới Trong Hệ Sinh Thái'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thiết lập giao diện phần thưởng, phân hệ tổ chức, tải ảnh banner & cấu hình nhận Xu
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 sm:p-6 space-y-6">
              
              {/* 1. Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> 1. Thông Tin Cơ Bản Sự Kiện
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tiêu đề sự kiện *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Đại Hội Âm Nhạc Hoàng Gia Haevy 2026"
                      value={formState.title || ''}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tiêu đề phụ (Subtitle)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đêm Hội Lossless Hi-Fi & Tri Ân"
                      value={formState.subtitle || ''}
                      onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Huy hiệu (Badge tag)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 👑 ĐẠI LỄ HỆ SINH THÁI"
                      value={formState.badge || ''}
                      onChange={(e) => setFormState({ ...formState, badge: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mô tả chi tiết nội dung sự kiện
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Chi tiết chương trình, thể lệ tặng xu và các hoạt động nổi bật..."
                      value={formState.description || ''}
                      onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Mục Chọn Giao Diện Phần Thưởng (Reward Display Style Selector) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> 2. Mục Chọn Giao Diện Phần Thưởng (Xu & Quà Tặng)
                  </h4>
                  <span className="text-[11px] text-amber-300 font-semibold">
                    Đang chọn: {selectedRewardStyleObj.title}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REWARD_STYLES.map((style) => {
                    const isSelected = formState.rewardDisplayStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setFormState({ ...formState, rewardDisplayStyle: style.id })}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected 
                            ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50' 
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl drop-shadow shrink-0 mt-0.5">
                          {style.icon}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{style.title}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {style.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Preview of Reward UI */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedRewardStyleObj.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{selectedRewardStyleObj.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                          XEM TRƯỚC HIỂN THỊ
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formState.rewardBadgeText || `+${formState.rewardCoins || 0} Xu Haevy`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      placeholder="Số Xu tặng"
                      value={formState.rewardCoins || 0}
                      onChange={(e) => setFormState({ ...formState, rewardCoins: parseInt(e.target.value) || 0 })}
                      className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold text-center"
                    />
                    <input
                      type="text"
                      placeholder="Nhãn quà tặng (VD: +500 Xu)"
                      value={formState.rewardBadgeText || ''}
                      onChange={(e) => setFormState({ ...formState, rewardBadgeText: e.target.value })}
                      className="flex-1 sm:w-48 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Mục Chọn Chế Độ Tổ Chức Sự Kiện (Event Hosting Mode Selector) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> 3. Mục Chọn Chế Độ Tổ Chức Sự Kiện (Phân Hệ Trải Nghiệm)
                  </h4>
                  <span className="text-[11px] text-indigo-300 font-semibold">
                    Đang chọn: {selectedHostingModeObj.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {HOSTING_MODES.map((mode) => {
                    const isSelected = formState.hostingMode === mode.id;
                    const ModeIcon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => handleHostingModeSelect(mode)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-slate-800/90 border-indigo-400 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-400/50' 
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-slate-900 border ${mode.color} shrink-0 mt-0.5`}>
                          <ModeIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{mode.name}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-indigo-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {mode.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Chữ hiển thị trên Nút hành động (CTA Text)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Tham Gia Ngay"
                      value={formState.ctaText || ''}
                      onChange={(e) => setFormState({ ...formState, ctaText: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {formState.hostingMode === 'open_link' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Đường dẫn Web ngoài (URL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formState.ctaUrl || ''}
                        onChange={(e) => setFormState({ ...formState, ctaUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Tải Ảnh Banner & Tùy Biến Đồ Họa (Image Upload & Media) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> 4. Tải Ảnh Banner & Giao Diện Màu Sắc
                </h4>

                {/* Hidden File Input for Device Upload */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Upload className="w-4 h-4" /> Tải Ảnh Từ Thiết Bị (PNG/JPG)
                      </button>

                      {formState.bannerImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, bannerImageUrl: '' })}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Xóa Ảnh
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Hoặc dán trực tiếp URL ảnh bên dưới
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Link Ảnh URL Banner
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formState.bannerImageUrl || ''}
                      onChange={(e) => setFormState({ ...formState, bannerImageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Curated Gallery Quick Selector */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Thư viện ảnh mẫu sắc nét chuẩn HD (Nhấn để chọn):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CURATED_BANNER_GALLERY.map((gal, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormState({ ...formState, bannerImageUrl: gal.url })}
                          className={`group relative h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            formState.bannerImageUrl === gal.url 
                              ? 'border-amber-400 ring-2 ring-amber-400/50' 
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img 
                            src={gal.url} 
                            alt={gal.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white drop-shadow truncate">
                              {gal.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Banner Preview Card */}
                  {formState.bannerImageUrl && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400">Xem trước Banner:</span>
                      <div 
                        className="relative h-40 rounded-xl overflow-hidden bg-cover bg-center p-4 flex flex-col justify-between border border-slate-700 shadow-xl"
                        style={{
                          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.9)), url(${formState.bannerImageUrl})`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            {formState.badge || 'SỰ KIỆN'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-black/60 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            {formState.rewardBadgeText || `+${formState.rewardCoins || 0} Xu`}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-white drop-shadow">
                            {formState.title || 'Tiêu đề sự kiện'}
                          </h4>
                          <p className="text-xs text-amber-200/90 drop-shadow line-clamp-1">
                            {formState.subtitle || 'Tiêu đề phụ của sự kiện'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme & Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Chủ đề màu sắc (Theme)
                    </label>
                    <select
                      value={formState.theme || 'gold_luxury'}
                      onChange={(e) => setFormState({ ...formState, theme: e.target.value as EventTheme })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="gold_luxury">Hoàng Gia Vàng (Gold Luxury)</option>
                      <option value="cyber_fire">Lửa Cyber Đỏ Cam (Cyber Fire)</option>
                      <option value="neon_galaxy">Vũ Trụ Neon Tím Xanh (Neon Galaxy)</option>
                      <option value="emerald_zen">Ngọc Lục Bảo Zen (Emerald Zen)</option>
                      <option value="royal_purple">Tím Hoàng Gia (Royal Purple)</option>
                      <option value="sunset_orange">Hoàng Hôn Cam (Sunset Orange)</option>
                      <option value="midnight_blue">Đêm Huyền Bí (Midnight Blue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Màu Gradient Đầu (From)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formState.customGradientFrom || '#fbbf24'}
                        onChange={(e) => setFormState({ ...formState, customGradientFrom: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formState.customGradientFrom || '#fbbf24'}
                        onChange={(e) => setFormState({ ...formState, customGradientFrom: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Màu Gradient Đuôi (To)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formState.customGradientTo || '#f59e0b'}
                        onChange={(e) => setFormState({ ...formState, customGradientTo: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formState.customGradientTo || '#f59e0b'}
                        onChange={(e) => setFormState({ ...formState, customGradientTo: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Thời Gian & Phân Quyền */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 5. Thời Gian & Điều Khiển Xuất Bản
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Thời gian Bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={formState.startAt || ''}
                      onChange={(e) => setFormState({ ...formState, startAt: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Thời gian Kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      value={formState.endAt || ''}
                      onChange={(e) => setFormState({ ...formState, endAt: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formState.status || 'upcoming'}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value as EventStatus })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="live">Đang trực tiếp (Live)</option>
                      <option value="ended">Đã kết thúc</option>
                      <option value="draft">Bản nháp (Ẩn)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!formState.isPinned}
                      onChange={(e) => setFormState({ ...formState, isPinned: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800 cursor-pointer"
                    />
                    Ghim lên đầu trang
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!formState.countdownEnabled}
                      onChange={(e) => setFormState({ ...formState, countdownEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800 cursor-pointer"
                    />
                    Bật đồng hồ đếm ngược
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur-md py-3 -mb-6 -mx-6 px-6 z-20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang Lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {editingEventId ? 'Lưu Thay Đổi Sự Kiện' : 'Xuất Bản Sự Kiện Mới'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
