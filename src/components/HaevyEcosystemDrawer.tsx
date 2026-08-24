import React, { useState, useRef } from 'react';
import { 
  X, 
  Headphones, 
  MessageSquare, 
  Heart, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  User as UserIcon, 
  Coins, 
  Check, 
  Copy, 
  LogOut, 
  Bell,
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Zap,
  Radio,
  Sliders,
  Send,
  Layers,
  BookOpen,
  Calendar,
  PieChart,
  Mic,
  Disc3,
  Users,
  Compass,
  FileAudio,
  Award,
  Gamepad2,
  Trophy,
  Maximize,
  Minimize,
  Smartphone,
  Download
} from 'lucide-react';
import { ActiveTab, EcosystemMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdminChainLockOverlay } from './admin/AdminChainLockOverlay';

interface HaevyEcosystemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenStudioAudio?: (tab?: 'tts' | 'publish' | 'ekyc' | 'my-tracks') => void;
  onOpenAuth?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenInstallPwa?: () => void;
}

export function HaevyEcosystemDrawer({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  activeTab,
  onSelectTab,
  onOpenStudioAudio,
  onOpenAuth,
  onOpenNotifications,
  unreadNotificationCount = 0,
  onToggleFullscreen,
  isFullscreen = false,
  onOpenInstallPwa
}: HaevyEcosystemDrawerProps) {
  const { user, isVip, isAdmin, audioPoints, accountId, logout } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [showAdminChainLock, setShowAdminChainLock] = useState(false);
  const [pendingAdminTab, setPendingAdminTab] = useState<ActiveTab | undefined>(undefined);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 6 Chế độ Hệ sinh thái Haevy được thiết kế dạng trang chuyên biệt
  const ecosystemModes: {
    id: EcosystemMode;
    name: string;
    englishName: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
    themeGradient: string;
    accentColor: string;
    borderColor: string;
    activeBorderColor: string;
    iconBg: string;
    defaultTab: ActiveTab;
    subPages: {
      title: string;
      desc: string;
      icon: React.ElementType;
      tabKey: ActiveTab | 'studio_tts' | 'studio_publish';
    }[];
    highlights: string[];
  }[] = [
    {
      id: 'audio',
      name: 'Haevy Audio',
      englishName: 'Audio & Music Space',
      subtitle: 'Nền Tảng Âm Nhạc & Giải Trí Hi-Fi Lossless',
      description: 'Chế độ chuyên biệt cho trải nghiệm thưởng thức âm thanh bản quyền chất lượng cao, đài Radio trực tuyến và thảo luận cùng cộng đồng yêu nhạc.',
      icon: Headphones,
      badge: 'Chế Độ Âm Nhạc',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      themeGradient: 'from-amber-500/20 via-orange-950/40 to-zinc-950',
      accentColor: 'text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      activeBorderColor: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20',
      iconBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-black',
      defaultTab: 'home',
      subPages: [
        { title: 'Trang Chủ Khám Phá', desc: 'Bảng tin xu hướng, bản phát hành mới & gợi ý', icon: Compass, tabKey: 'home' },
        { title: 'Kho Audio Cá Nhân', desc: 'Bộ sưu tập bài hát, thể loại & danh sách phát', icon: Disc3, tabKey: 'library' },
        { title: 'Thảo Luận Cộng Đồng', desc: 'Giao lưu, bình luận bài hát & kết nối bạn bè', icon: Users, tabKey: 'community' },
        { title: 'Trình Phát Hi-Fi 3D', desc: 'Bộ Equalizer thông minh, Spatial Audio & Hẹn giờ', icon: Headphones, tabKey: 'player' }
      ],
      highlights: ['Hi-Fi 24-bit/96kHz', '3D Spatial Audio', 'Đài Radio 24/7', 'Cộng đồng tương tác']
    },
    {
      id: 'messages',
      name: 'Haevy Message',
      englishName: 'Realtime Chat & Voice',
      subtitle: 'Trò Chuyện Realtime, Voice Note HD & Chia Sẻ Nhạc',
      description: 'Chế độ nhắn tin trực tuyến tức thì, gửi tin nhắn thoại Voice Note chất lượng cao không nén và cùng bạn bè nghe bài hát yêu thích.',
      icon: MessageSquare,
      badge: 'Chế Độ Tin Nhắn',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      themeGradient: 'from-sky-500/20 via-blue-950/40 to-zinc-950',
      accentColor: 'text-sky-400',
      borderColor: 'border-sky-500/30 hover:border-sky-400',
      activeBorderColor: 'border-sky-400 ring-2 ring-sky-400/40 shadow-sky-500/20',
      iconBg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white',
      defaultTab: 'messages',
      subPages: [
        { title: 'Hộp Thư & Bạn Bè', desc: 'Danh bạ trực tuyến, nhắn tin 1-1 realtime', icon: MessageSquare, tabKey: 'messages' },
        { title: 'Voice Note HD Studio', desc: 'Thu âm gửi tin nhắn thoại âm thanh trong trẻo', icon: Mic, tabKey: 'messages' },
        { title: 'Phòng Chat Âm Nhạc', desc: 'Chia sẻ giai điệu & cùng lắng nghe bản nhạc hay', icon: Disc3, tabKey: 'messages' }
      ],
      highlights: ['Realtime WebSocket', 'Voice Note HD', 'Gửi Nhạc 1-Chạm', 'Mã Hóa Riêng Tư']
    },
    {
      id: 'couple',
      name: 'I Love Haevy',
      englishName: 'Couple Romance Space',
      subtitle: 'Không Gian Tình Yêu & Hôn Nhân Lãng Mạn',
      description: 'Chế độ độc quyền dành cho hai người: Đồng hồ đếm ngày yêu, nhật ký hẹn hò lưu giữ kỷ niệm, nghe nhạc đôi đồng bộ và xây dựng quỹ chung.',
      icon: Heart,
      badge: 'Chế Độ Cặp Đôi 💕',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      themeGradient: 'from-rose-500/20 via-pink-950/40 to-zinc-950',
      accentColor: 'text-rose-400',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      activeBorderColor: 'border-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/20',
      iconBg: 'bg-gradient-to-br from-rose-400 via-pink-500 to-red-600 text-white',
      defaultTab: 'couple',
      subPages: [
        { title: 'Không Gian Cặp Đôi', desc: 'Đồng hồ đếm ngày yêu, mốc kỷ niệm & danh hiệu', icon: Heart, tabKey: 'couple' },
        { title: 'Nhật Ký Hẹn Hò', desc: 'Ghi lại kỷ niệm ngọt ngào và hình ảnh đáng nhớ', icon: BookOpen, tabKey: 'couple' },
        { title: 'Nghe Chung & Quỹ Đôi', desc: 'Đồng bộ âm nhạc thời gian thực & Nuôi heo đất đôi', icon: Calendar, tabKey: 'couple' }
      ],
      highlights: ['Đếm Ngày Yêu Live', 'Nhật Ký Kỷ Niệm', 'Đồng Bộ Phát Nhạc', 'Quỹ Đôi Tiết Kiệm']
    },
    {
      id: 'finance',
      name: 'Haevy Finance',
      englishName: 'Smart Wealth Manager',
      subtitle: 'Quản Trị Tài Chính Cá Nhân & Sổ Thu Chi',
      description: 'Chế độ quản lý dòng tiền toàn diện: Kiểm soát thu chi tức thời, quản lý đa ví tiền, hạn mức ngân sách thông minh 50/30/20 và báo cáo phân tích.',
      icon: Wallet,
      badge: 'Chế Độ Tài Chính 💰',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      themeGradient: 'from-emerald-500/20 via-teal-950/40 to-zinc-950',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      activeBorderColor: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20',
      iconBg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-zinc-950',
      defaultTab: 'finance',
      subPages: [
        { title: 'Tổng Quan Tài Sản', desc: 'Số dư tổng hợp, ví tiền mặt, ngân hàng & tiết kiệm', icon: Wallet, tabKey: 'finance' },
        { title: 'Sổ Giao Dịch Thu / Chi', desc: 'Ghi nhận chi tiêu nhanh, phân loại chi tiết', icon: PieChart, tabKey: 'finance' },
        { title: 'Hạn Mức Ngân Sách 50/30/20', desc: 'Thiết lập trần chi tiêu, cảnh báo vượt mức', icon: Sliders, tabKey: 'finance' }
      ],
      highlights: ['Đa Ví Tiền Tệ', 'Sổ Thu Chi Admin', 'Ngân Sách 50/30/20', 'Biểu Đồ Dòng Tiền']
    },
    {
      id: 'admin',
      name: 'Haevy Admin',
      englishName: 'System & Audit Control',
      subtitle: 'Trung Tâm Quản Trị Máy Chủ & Kiểm Toán',
      description: 'Chế độ tối cao dành cho Quản trị viên: Cấp đặc quyền VIP, xét duyệt tác giả eKYC, quản lý kho bài hát và phát thông báo khẩn cấp hệ thống.',
      icon: ShieldCheck,
      badge: isAdmin ? 'Đặc Quyền Quản Trị' : 'Chế Độ Admin',
      badgeColor: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
      themeGradient: 'from-amber-500/20 via-yellow-950/40 to-zinc-950',
      accentColor: 'text-yellow-400',
      borderColor: 'border-yellow-400/40 hover:border-yellow-300',
      activeBorderColor: 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-yellow-500/20',
      iconBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-black',
      defaultTab: 'admin',
      subPages: [
        { title: 'Trang 1: Tổng Quan Hệ Thống', desc: 'Báo cáo tổng thể server, người dùng, bài hát & audit logs', icon: ShieldCheck, tabKey: 'admin' },
        { title: 'Trang 2: Các Đặc Quyền Admin', desc: 'Tạo mã giới thiệu 6 ký tự & mã VIP ẩn danh', icon: Crown, tabKey: 'admin' },
        { title: 'Trang 3: Xét Duyệt Tác Giả', desc: 'Kiểm duyệt bài hát phát hành & eKYC nghệ sĩ', icon: Award, tabKey: 'admin' },
        { title: 'Trang 4: Nuôi Admin & Gói VIP', desc: 'Xét duyệt nạp xu audio, gói VIP và ủng hộ quản trị', icon: Coins, tabKey: 'admin' }
      ],
      highlights: ['Tổng Quan Hệ Thống', 'Đặc Quyền Mã VIP', 'Duyệt eKYC & Bài Hát', 'Nuôi Admin & Nạp Xu']
    },
    {
      id: 'studio',
      name: 'Haevy Studio',
      englishName: 'AI Studio & Creator Hub',
      subtitle: 'Phòng Thu Sáng Tạo & Quản Lý Tác Giả',
      description: 'Chế độ chuyên biệt cho Tác giả & Nghệ sĩ: Xác thực định danh eKYC, chuyển văn bản thành giọng nói AI Text-to-Speech truyền cảm và quản lý kho tác phẩm.',
      icon: Sparkles,
      badge: 'Chế Độ Sáng Tạo 🎙️',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      themeGradient: 'from-purple-500/20 via-indigo-950/40 to-zinc-950',
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      activeBorderColor: 'border-purple-400 ring-2 ring-purple-400/40 shadow-purple-500/20',
      iconBg: 'bg-gradient-to-br from-purple-400 via-indigo-500 to-pink-600 text-white',
      defaultTab: 'studio',
      subPages: [
        { title: 'Trang 1: Tổng Quan & Xác Thực', desc: 'Định danh eKYC nghệ sĩ, thống kê tác giả & chính sách', icon: ShieldCheck, tabKey: 'studio' },
        { title: 'Trang 2: Tính Năng AI (TTS)', desc: 'Chuyển văn bản thành giọng đọc truyền cảm AI & phối âm', icon: Mic, tabKey: 'studio' },
        { title: 'Trang 3: Kho Tác Phẩm', desc: 'Quản lý tác phẩm đã phát hành, chỉnh sửa & số liệu', icon: Layers, tabKey: 'studio' }
      ],
      highlights: ['Xác Thực eKYC Tác Giả', 'AI Text-to-Speech Gemini', 'Kho Tác Phẩm & Quản Lý', 'Nhận Quà Tặng Fans']
    },
    {
      id: 'games',
      name: 'Haevy Games',
      englishName: 'Arcade & Challenge Arena',
      subtitle: 'Đấu Trường Game & Tranh Tài Bảng Xếp Hạng',
      description: 'Không gian giải trí game âm nhạc đỉnh cao: Thử thách đoán bài hát, đấu nhịp điệu rinh điểm thưởng và leo top bảng vinh danh cao thủ.',
      icon: Gamepad2,
      badge: 'Chế Độ Game 🎮',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      themeGradient: 'from-indigo-500/20 via-violet-950/40 to-zinc-950',
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      activeBorderColor: 'border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-500/20',
      iconBg: 'bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white',
      defaultTab: 'games',
      subPages: [
        { title: 'Trang Chủ Game', desc: 'Đấu trường mini-game, thử thách nhịp điệu & vòng quay', icon: Gamepad2, tabKey: 'games' },
        { title: 'Bảng Xếp Hạng', desc: 'Bảng vinh danh cao thủ, đua top điểm thưởng & danh hiệu', icon: Trophy, tabKey: 'games' }
      ],
      highlights: ['Đoán Giai Điệu', 'Đua Top BXH', 'Vòng Quay May Mắn', 'Săn Xu Thưởng']
    }
  ];

  const handleModeSelection = (modeId: EcosystemMode, targetTab?: ActiveTab | 'studio_tts' | 'studio_publish') => {
    if (modeId === 'admin') {
      setPendingAdminTab((targetTab as ActiveTab) || 'admin');
      setShowAdminChainLock(true);
      return;
    }

    if (targetTab === 'studio_tts') {
      onSelectMode('studio', 'profile');
      if (onOpenStudioAudio) onOpenStudioAudio('tts');
    } else if (targetTab === 'studio_publish') {
      onSelectMode('studio', 'profile');
      if (onOpenStudioAudio) onOpenStudioAudio('publish');
    } else {
      const mode = ecosystemModes.find(m => m.id === modeId);
      const tabToOpen = targetTab || (mode ? mode.defaultTab : 'home');
      onSelectMode(modeId, tabToOpen);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-zinc-950 flex flex-col overflow-hidden animate-in fade-in duration-250 select-none">
      
      {/* Main Full-Screen Container */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col justify-between overflow-hidden">
        
        {/* Top Header: User Profile Card & Slider Controls */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-950 to-zinc-900/90 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: User Profile Brief */}
            {user ? (
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden p-0.5 border shrink-0 ${
                  isVip 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 shadow-md shadow-amber-500/20' 
                    : 'border-zinc-700 bg-zinc-800'
                }`}>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Avatar'} 
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-indigo-600 via-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold text-sm">
                      {user.displayName?.charAt(0) || 'H'}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white truncate max-w-[150px] sm:max-w-xs">
                      {user.displayName || 'Thành viên Haevy'}
                    </h3>
                    {isVip ? (
                      <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                        <Crown size={10} className="fill-amber-400 text-amber-400" />
                        VIP Hoàng Gia
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] bg-zinc-800 text-zinc-400 font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-zinc-700">
                        Bản Chuẩn
                      </span>
                    )}
                    {isAdmin && (
                      <span className="text-[9px] sm:text-[10px] bg-yellow-400 text-black font-black px-1.5 py-0.2 rounded uppercase">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {accountId && (
                      <div 
                        onClick={handleCopyId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 font-mono text-[10px] sm:text-[11px] cursor-pointer transition-colors"
                        title="Bấm để sao chép mã tài khoản"
                      >
                        <span className="text-zinc-500">ID:</span>
                        <span className="font-bold text-amber-300">{accountId}</span>
                        {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-zinc-400" />}
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-mono">
                      <Coins size={11} className="text-amber-400" />
                      <span className="font-bold text-amber-300">{audioPoints.toLocaleString()}</span>
                      <span className="text-zinc-500">pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Khách Trải Nghiệm</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400">Chọn 1 trong 6 chế độ để khám phá nền tảng</p>
                </div>
              </div>
            )}

            {/* Right: Close & Navigation Controls */}
            <div className="flex items-center gap-2">
              {/* Prev / Next Slider Arrows for desktop */}
              <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => scrollSlider('left')}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Trượt sang trái"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Trượt sang phải"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer font-bold text-xs shadow-sm active:scale-95"
                title="Đóng chế độ toàn màn hình"
              >
                <X size={16} />
                <span>Đóng</span>
              </button>
            </div>
          </div>

          {/* Top Quick Actions: Thông Báo, Trang Cá Nhân, Nạp Điểm & VIP, Đăng xuất */}
          {user ? (
            <div className="flex items-center gap-2 pt-3 sm:pt-3.5 flex-wrap">
              <button
                id="drawer-top-notifications-btn"
                onClick={() => {
                  onClose();
                  if (onOpenNotifications) onOpenNotifications();
                }}
                className="relative px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 group"
              >
                <Bell size={14} className="text-amber-400 group-hover:animate-bounce" />
                <span>Thông Báo</span>
                {Boolean(unreadNotificationCount && unreadNotificationCount > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse shadow-sm shadow-rose-500/50">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              <button
                id="drawer-top-profile-btn"
                onClick={() => {
                  onSelectTab('profile');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <UserIcon size={14} className="text-indigo-400" />
                <span>Trang Cá Nhân</span>
              </button>

              {/* Fullscreen Toggle Action in Drawer */}
              {onToggleFullscreen && (
                <button
                  id="drawer-top-fullscreen-btn"
                  onClick={onToggleFullscreen}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                    isFullscreen
                      ? 'bg-amber-400 text-black border-amber-300 font-black'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border-zinc-800'
                  }`}
                >
                  {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} className="text-amber-400" />}
                  <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
                </button>
              )}

              {/* Install App / PWA Action in Drawer */}
              {onOpenInstallPwa && (
                <button
                  id="drawer-top-install-btn"
                  onClick={() => {
                    onClose();
                    onOpenInstallPwa();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900 hover:from-zinc-800 hover:to-zinc-800 text-amber-300 hover:text-amber-200 border border-zinc-800 hover:border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Smartphone size={14} className="text-amber-400" />
                  <span>Tải App Độc Lập</span>
                </button>
              )}

              <button
                id="drawer-top-vip-btn"
                onClick={() => {
                  onSelectTab('topup');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Crown size={14} className="text-amber-400 fill-amber-400/20" />
                <span>Nạp Điểm & VIP</span>
              </button>

              <button
                id="drawer-top-logout-btn"
                onClick={async () => {
                  onClose();
                  await logout();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Đăng xuất tài khoản"
              >
                <LogOut size={14} className="text-rose-400" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 pt-3 sm:pt-3.5 flex-wrap">
              <p className="text-xs text-zinc-400">Chọn 1 trong 6 chế độ để trải nghiệm hệ sinh thái Haevy</p>
              <button
                id="drawer-top-login-btn"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer active:scale-95"
              >
                Đăng Nhập / Đăng Ký
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Slider Area with Snap-Scrolling */}
        <div 
          ref={sliderRef}
          className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 flex gap-4 sm:gap-6 snap-x snap-mandatory scroll-smooth custom-scrollbar items-stretch"
        >
          {ecosystemModes.map((mode) => {
            const IconComp = mode.icon;
            const isModeActive = currentMode === mode.id;

            return (
              <div
                key={mode.id}
                className={`w-[85vw] sm:w-[380px] md:w-[410px] shrink-0 snap-center rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all bg-gradient-to-b ${mode.themeGradient} ${
                  isModeActive
                    ? `${mode.activeBorderColor} bg-zinc-900/90`
                    : `${mode.borderColor} bg-zinc-950/70 hover:bg-zinc-900/70`
                }`}
              >
                {/* Mode Top Info */}
                <div className="space-y-4">
                  
                  {/* Icon & Badge Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${mode.iconBg}`}>
                      <IconComp size={28} />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${mode.badgeColor}`}>
                        {mode.badge}
                      </span>
                      {isModeActive && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Đang Sử Dụng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      {mode.name}
                    </h4>
                    <p className={`text-xs font-bold ${mode.accentColor} mt-0.5`}>
                      {mode.subtitle}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                      {mode.description}
                    </p>
                  </div>

                  {/* Sub-Pages & Specific Workspaces */}
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Các Trang & Tính Năng Chuyên Biệt:
                    </span>

                    <div className="grid grid-cols-1 gap-1.5">
                      {mode.subPages.map((page, idx) => {
                        const PageIcon = page.icon;
                        const isSubActive = isModeActive && activeTab === page.tabKey;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleModeSelection(mode.id, page.tabKey)}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                              isSubActive 
                                ? 'bg-amber-400/15 border-amber-400/50 text-white' 
                                : 'bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-xl ${isSubActive ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700'}`}>
                                <PageIcon size={14} />
                              </div>
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold truncate leading-tight">
                                  {page.title}
                                </h6>
                                <p className="text-[10px] text-zinc-400 truncate">
                                  {page.desc}
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={13} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feature Highlights Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {mode.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-zinc-400"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mode Bottom Action */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80">
                  <button
                    onClick={() => handleModeSelection(mode.id)}
                    className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                      isModeActive
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-black shadow-amber-500/20'
                    }`}
                  >
                    <span>{isModeActive ? 'Đang Ở Chế Độ Này' : `Chuyển Sang ${mode.name}`}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Subtle Status Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-zinc-800/80 bg-zinc-950/98 shrink-0 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Hệ Sinh Thái Đa Tầng Haevy • 6 Không Gian Chuyên Biệt</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-600 hidden sm:inline">Trượt ngang để xem tất cả chế độ</span>
        </div>
      </div>

      {/* Security Moving Chains & Central Padlock Overlay */}
      <AdminChainLockOverlay
        isOpen={showAdminChainLock}
        onClose={() => setShowAdminChainLock(false)}
        onSuccess={() => {
          setShowAdminChainLock(false);
          onSelectMode('admin', pendingAdminTab || 'admin');
          onClose();
        }}
      />
    </div>
  );
}
