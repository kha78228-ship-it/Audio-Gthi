import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Coins, 
  Clock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Headphones, 
  Radio, 
  Sliders, 
  CheckCircle2, 
  Copy, 
  Check, 
  LogOut, 
  LogIn, 
  Gift, 
  Flame, 
  ArrowRight, 
  KeyRound, 
  History, 
  Award, 
  Loader2, 
  Music, 
  Plus,
  Bot,
  ArrowLeft,
  FileText,
  Info,
  Film,
  Camera,
  Palette,
  Volume2,
  Eye,
  EyeOff,
  Lock,
  Share2,
  Play,
  Pause,
  ChevronUp,
  Maximize2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { maskAccountId } from '../utils/privacyMask';
import { useAuth } from '../context/AuthContext';
import { PointTransaction, Track } from '../types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminChainLockOverlay } from './admin/AdminChainLockOverlay';
import { SixLayerSecurityShield } from './account/SixLayerSecurityShield';
import { HaevySupportAiView } from './account/HaevySupportAiView';
import { SkeletonTransactionRow } from './common/Skeleton';

// Profile Modular Components
import { ProfileHeaderCover } from './profile/ProfileHeaderCover';
import { ProfilePostsTab } from './profile/ProfilePostsTab';
import { ProfileAboutTab } from './profile/ProfileAboutTab';
import { ProfileAudioTab } from './profile/ProfileAudioTab';
import { ProfileMediaGalleryTab } from './profile/ProfileMediaGalleryTab';
import { 
  UserProfileData, 
  AvatarFrameId, 
  COVER_PRESETS 
} from './profile/types';

interface UserProfileViewProps {
  onOpenAuth: (tab?: 'signin' | 'signup' | 'anonymous') => void;
  onGoToTopup: () => void;
  onGoToHome?: () => void;
  onGoToAudio?: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenAuthorStudio?: () => void;
  onOpenAuthorVerification?: () => void;
  onOpenPublishAudio?: () => void;
  onOpenGiftShop?: () => void;
  onOpenAdmin?: () => void;
  onGoToHaevyLite?: () => void;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onTogglePlay?: () => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

export function UserProfileView({ 
  onOpenAuth, 
  onGoToTopup,
  onGoToHome,
  onGoToAudio,
  onSelectTab,
  onOpenAuthorStudio,
  onOpenAuthorVerification,
  onOpenPublishAudio,
  onOpenGiftShop,
  onOpenAdmin,
  onGoToHaevyLite,
  tracks = [],
  onPlayTrack,
  onTogglePlay,
  currentTrack,
  isPlaying = false
}: UserProfileViewProps) {
  const { 
    user, 
    accountId, 
    isAdmin, 
    audioPoints, 
    totalEarnedPoints, 
    totalListenedMinutes, 
    lastDailyCheckin, 
    vipExpiresAt, 
    isVip, 
    favorites,
    toggleFavorite,
    vipSettings,
    anonymousVipSession,
    isAuthorVerified,
    authorStatus,
    authorStageName,
    updateVipSettings,
    performDailyCheckin,
    logout,
    loginAsAnonymous,
    haevyLiteCoins,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    updateUserProfile,
    authStatus,
    isAuthenticated
  } = useAuth();

  // Primary 4 Profile Tabs requested by user:
  // 1: posts (Bài đăng)
  // 2: about (Giới thiệu thông tin người dùng tùy chỉnh)
  // 3: audio (Trang audio)
  // 4: media (Kho tổng hợp các ảnh và video đã đăng)
  // + secondary: security (Bảo vệ 6 lớp), transactions (Lịch sử điểm), support (Hỗ trợ AI)
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'audio' | 'media' | 'security' | 'transactions' | 'support'>('posts');
  
  const [isSupportFullScreen, setIsSupportFullScreen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState<'chat' | 'security' | 'history' | 'ticket' | 'faq'>('chat');
  const [showAdminChainLock, setShowAdminChainLock] = useState(false);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Privacy Mode State (Defaults to true: automatically hide sensitive data upon profile entry)
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('haevy_profile_privacy_mode');
      return saved === null ? true : saved !== 'false';
    } catch {
      return true;
    }
  });
  const [showTransactionAmounts, setShowTransactionAmounts] = useState<boolean>(false);

  const handleTogglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haevy_profile_privacy_mode', String(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  // Local Storage Keys for customization
  const userId = user?.uid || 'guest';
  const profileStorageKey = `haevy_custom_profile_${userId}`;
  const coverStorageKey = `haevy_profile_cover_${userId}`;
  const frameStorageKey = `haevy_avatar_frame_${userId}`;

  // Cover photo state with fallback
  const [coverUrl, setCoverUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(coverStorageKey);
      if (saved) return saved;
    } catch (e) {
      console.warn(e);
    }
    return COVER_PRESETS[0].url; // Nebula wallpaper preset
  });

  // Avatar frame state with fallback
  const [avatarFrameId, setAvatarFrameId] = useState<AvatarFrameId>(() => {
    try {
      const saved = localStorage.getItem(frameStorageKey) as AvatarFrameId;
      if (saved) return saved;
    } catch (e) {
      console.warn(e);
    }
    return isVip ? 'dragon_gold' : 'cyber_neon';
  });

  // Customizable User Profile Data with fallback
  const [profileData, setProfileData] = useState<UserProfileData>(() => {
    const defaultData: UserProfileData = {
      displayName: user?.displayName || 'Người Yêu Âm Nhạc',
      nickname: user?.email ? user.email.split('@')[0] : 'haevy_member',
      bio: 'Đam mê khám phá các giai điệu âm nhạc Hi-Fi Lossless, sóng não thiền định 528Hz và truyện audio tại Haevy Hub.',
      quote: 'Âm nhạc là sự tĩnh lặng trong tâm hồn giữa thế giới ồn ã.',
      birthday: '15/08',
      zodiac: 'Sư Tử ♌',
      gender: 'Không công khai',
      location: 'Hà Nội, Việt Nam',
      hometown: 'Đà Nẵng',
      occupation: 'Người sáng tạo nội dung & Yêu âm nhạc',
      hobbies: ['Nghe nhạc Hi-Fi', 'Đọc sách nói', 'Thiền định 528Hz', 'Chụp ảnh thiên nhiên'],
      favoriteGenres: ['Lo-Fi Chill', 'Acoustic & Guitar', 'Nhạc Thiền 528Hz', 'Truyện Audio'],
      socialLinks: {
        facebook: 'https://facebook.com',
        tiktok: 'https://tiktok.com',
        youtube: 'https://youtube.com',
        instagram: 'https://instagram.com'
      },
      joinedDate: 'Tháng 1, 2024'
    };

    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch (e) {
      console.warn(e);
    }
    return defaultData;
  });

  // Save changes to Firebase Auth, Firestore and localStorage
  const handleUpdateCoverUrl = async (url: string) => {
    setCoverUrl(url);
    try {
      localStorage.setItem(coverStorageKey, url);
    } catch (e) {
      console.warn(e);
    }
    await updateUserProfile({ coverUrl: url });
  };

  const handleUpdateAvatarFrame = async (frameId: AvatarFrameId) => {
    setAvatarFrameId(frameId);
    try {
      localStorage.setItem(frameStorageKey, frameId);
    } catch (e) {
      console.warn(e);
    }
    await updateUserProfile({ avatarFrameId: frameId });
  };

  const handleUpdateProfileData = async (data: UserProfileData) => {
    setProfileData(data);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(data));
    } catch (e) {
      console.warn(e);
    }
    await updateUserProfile(data);
  };

  // Automatically synchronize profile information, displayName and avatar from Firebase Auth / Firestore listeners
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        ...userProfile,
        displayName: userProfile.displayName || authDisplayName || prev.displayName
      }));
      if (userProfile.coverUrl) setCoverUrl(userProfile.coverUrl);
      if (userProfile.avatarFrameId) setAvatarFrameId(userProfile.avatarFrameId as AvatarFrameId);
    } else if (authDisplayName) {
      setProfileData(prev => ({
        ...prev,
        displayName: authDisplayName
      }));
    }
  }, [userProfile, authDisplayName]);

  // Load transaction history for secondary tab
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
        console.error('Error fetching point transactions:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchTransactions();
  }, [user, audioPoints]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = lastDailyCheckin === todayStr;

  // Toast Notification & Scroll to Top states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareProfile = () => {
    if (!accountId) return;
    const shareUrl = `${window.location.origin}?profile=${accountId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('✓ Đã sao chép liên kết chia sẻ trang cá nhân!');
  };

  const [copiedId, setCopiedId] = useState(false);
  const handleCopyAccountId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    showToast('✓ Đã sao chép mã ID tài khoản!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const [guestQuickLoginLoading, setGuestQuickLoginLoading] = useState(false);
  const [quickLoginMsg, setQuickLoginMsg] = useState<string | null>(null);

  const handleQuickAnonymousLogin = async () => {
    setGuestQuickLoginLoading(true);
    setQuickLoginMsg(null);
    try {
      const res = await loginAsAnonymous();
      setQuickLoginMsg(res.message || 'Đã vào tài khoản khách ẩn danh thành công (+50 Điểm Audio)!');
    } catch (err: any) {
      setQuickLoginMsg('Không thể khởi tạo tài khoản ẩn danh.');
    } finally {
      setGuestQuickLoginLoading(false);
    }
  };

  const handleDailyCheckin = async () => {
    if (!user) {
      onOpenAuth('signin');
      return;
    }
    setCheckinLoading(true);
    setCheckinMsg(null);
    const res = await performDailyCheckin();
    setCheckinLoading(false);
    setCheckinMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const formatExpiresDate = (isoStr: string | null) => {
    if (!isoStr) return 'Chưa kích hoạt';
    const d = new Date(isoStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} lúc ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // =========================================================================
  // REDESIGNED ACCOUNT ACCESS PORTAL (KHI TRUY CẬP VÀO TÀI KHOẢN CHƯA ĐĂNG NHẬP)
  // =========================================================================
  if (!user) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 px-3 sm:px-4 py-4 sm:py-6">
        {onGoToHome && (
          <div className="flex items-center justify-between">
            <button
              onClick={onGoToHome}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 group"
            >
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span>Quay lại Trang Chủ Âm Nhạc</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>CỔNG TRUY CẬP TÀI KHOẢN</span>
            </div>
          </div>
        )}

        {/* Hero Account Access Presentation Card */}
        <div className="p-6 sm:p-10 md:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 text-center space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle Ambient Nebula Background Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 opacity-70" />
          
          {/* Central Logo Emblem */}
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-850 to-purple-500/20 border-2 border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 shadow-2xl backdrop-blur-md relative group">
              <UserIcon size={44} className="text-zinc-100 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-zinc-950 shadow-lg">
                <Crown size={15} className="fill-zinc-950" />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide">
              <Sparkles size={14} className="text-amber-400" />
              <span>HAEVY IDENTITY & ACCOUNT PORTAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Trung Tâm Truy Cập Tài Khoản
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Đăng nhập để sở hữu trang cá nhân tùy chỉnh với ảnh bìa panorama, khung đại diện vũ trụ, lưu trữ kho nhạc lossless yêu thích, tích lũy Điểm Audio và nhận trọn vẹn đặc quyền VIP.
            </p>
          </div>

          {/* Quick Anonymous VIP Banner (If active) */}
          {anonymousVipSession?.isActive && (
            <div className="max-w-lg mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs text-left flex items-start gap-3 shadow-lg">
              <KeyRound size={22} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-black text-sm">Đang dùng phiên VIP Ẩn Danh ({anonymousVipSession.guestId})</p>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">VIP ACTIVE</span>
                </div>
                <p className="text-zinc-300 text-xs mt-1">
                  Hạn sử dụng đến: <span className="text-amber-300 font-bold">{formatExpiresDate(anonymousVipSession.expiresAt)}</span>. Hãy liên kết email để bảo vệ vĩnh viễn quyền lợi và tài sản điểm của bạn.
                </p>
              </div>
            </div>
          )}

          {/* Feedback banner for 1-click guest login */}
          {quickLoginMsg && (
            <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs text-left flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="font-semibold">{quickLoginMsg}</span>
            </div>
          )}

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/30 transition-colors space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Headphones size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Âm Thanh Hi-Fi 320kbps</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Đồng bộ kho nhạc lossless, danh sách yêu thích và trình phát nhạc vũ trụ 3D.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-purple-500/30 transition-colors space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Palette size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Hồ Sơ & Khung Vũ Trụ</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tự do thay đổi ảnh bìa panorama, trang bị khung đại diện hào quang và đăng bài viết.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/30 transition-colors space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Coins size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Tích Lũy Điểm Audio</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Điểm danh hàng ngày nhận điểm, đổi gói VIP, tặng quà nghệ sĩ và kho vũ trụ Haevy Lite.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-indigo-500/30 transition-colors space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-xs font-bold text-white">Bảo Mật 6 Lớp & AI</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Hệ thống bảo vệ dữ liệu 6 tầng, chế độ riêng tư tuyệt đối và trợ lý AI hỗ trợ 24/7.
              </p>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* 1. Primary Sign In */}
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-black font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              <span>Đăng Nhập Ngay</span>
            </button>

            {/* 2. Register New Account */}
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} className="fill-zinc-950" />
              <span>Tạo Tài Khoản Mới</span>
            </button>

            {/* 3. Quick 1-Click Anonymous Guest Login */}
            <button
              onClick={handleQuickAnonymousLogin}
              disabled={guestQuickLoginLoading}
              className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-purple-300 font-bold text-sm border border-purple-500/40 hover:border-purple-400 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="Khởi tạo tài khoản khách trắng thông tin và vào ứng dụng ngay với 50 Điểm Audio ban đầu"
            >
              {guestQuickLoginLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="text-amber-400 fill-amber-400" />}
              <span>Khách Ẩn Danh (1 Chạm)</span>
            </button>

            {/* 4. VIP Topup */}
            <button
              onClick={onGoToTopup}
              className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm border border-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Crown size={18} className="text-amber-400" />
              <span>Gói VIP</span>
            </button>

            {/* 5. Support AI */}
            <button
              onClick={() => {
                setSupportInitialTab('chat');
                setIsSupportFullScreen(true);
              }}
              className="px-5 py-3.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot size={18} className="text-indigo-400" />
              <span>Hỗ Trợ AI</span>
            </button>
          </div>
        </div>

        {/* Full-Screen Haevy Support AI Portal */}
        {isSupportFullScreen && (
          <HaevySupportAiView
            user={null}
            accountId={accountId}
            isVip={false}
            isFullScreen={true}
            onClose={() => setIsSupportFullScreen(false)}
            onNavigateToSecurity={() => setIsSupportFullScreen(false)}
            onNavigateToVip={() => {
              setIsSupportFullScreen(false);
              onGoToTopup();
            }}
            transactions={[]}
            audioPoints={0}
            totalEarnedPoints={0}
            initialTab={supportInitialTab}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 px-2 sm:px-4 py-2 sm:py-4">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION / QUICK CONTROLS BAR                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onGoToHome && (
            <button
              onClick={onGoToHome}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="Quay lại giao diện nghe nhạc chính của Haevy Audio"
            >
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span>Quay lại Haevy Audio</span>
            </button>
          )}

          {/* Quick Active Audio Track Pill */}
          {currentTrack && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/90 border border-purple-500/30 text-xs text-zinc-300 shadow-sm">
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                title={isPlaying ? "Tạm dừng bài hát" : "Tiếp tục phát nhạc"}
              >
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
              </button>
              <div 
                onClick={onGoToAudio}
                className="cursor-pointer hover:text-purple-300 flex items-center gap-1.5 max-w-[140px] sm:max-w-[180px] truncate"
                title={`Đang phát: ${currentTrack.title} - Bấm để chuyển đến trình phát`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate font-semibold text-[11px]">{currentTrack.title}</span>
              </div>
            </div>
          )}

          <span className="text-xs text-zinc-500 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-zinc-400 hidden sm:inline">Hồ Sơ & Trang Cá Nhân</span>
        </div>

        {/* Privacy Shield, Share, Support AI & Admin Button Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Share Profile Button */}
          <button
            type="button"
            onClick={handleShareProfile}
            className="px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Sao chép liên kết chia sẻ trang cá nhân của bạn"
          >
            <Share2 size={14} className="text-sky-400" />
            <span className="hidden sm:inline text-[11px]">Chia sẻ</span>
          </button>

          {/* Global Privacy Shield Toggle Button */}
          <button
            type="button"
            onClick={handleTogglePrivacyMode}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border ${
              isPrivacyMode
                ? 'bg-emerald-950/70 hover:bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-400'
            }`}
            title="Bật/Tắt chế độ ẩn toàn bộ thông tin nhạy cảm (Email, ID, số điểm, nơi ở, lịch sử)"
          >
            {isPrivacyMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="font-extrabold text-[11px]">Riêng Tư: BẬT</span>
              </>
            ) : (
              <>
                <EyeOff size={14} className="text-zinc-400 shrink-0" />
                <span className="text-[11px]">Riêng Tư: TẮT</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSupportInitialTab('chat');
              setIsSupportFullScreen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Bot size={15} />
            <span className="hidden xs:inline">Haevy Support AI</span>
          </button>

          {onGoToHaevyLite && (
            <button
              onClick={onGoToHaevyLite}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-700/80 to-indigo-700/80 hover:from-purple-600 hover:to-indigo-600 border border-purple-400/40 text-white font-extrabold text-xs shadow-lg shadow-purple-700/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Truy cập Xu Haevy Lite & Combo Hoạt Ảnh Vũ Trụ"
            >
              <Sparkles size={14} className="text-purple-200" />
              <span>Xu Haevy Lite</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAdminChainLock(true)}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-lg shadow-amber-500/10"
              title="Truy cập hệ thống Haevy Admin (Dành riêng cho Quản Trị Viên)"
            >
              <KeyRound size={14} className="text-amber-400" />
              <span className="inline">Haevy Admin</span>
            </button>
          )}

          <button
            onClick={async () => await logout()}
            className="p-2 rounded-2xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Đăng xuất tài khoản"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. ACCOUNT IDENTITY & REWARDS DASHBOARD (BẢNG TỔNG QUAN TÀI KHOẢN)         */}
      {/* ========================================================================= */}
      <div 
        id="account-identity-hud"
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Subtle Ambient Nebula Glow */}
        <div className="absolute top-0 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          {/* Left Column: Account ID, Membership Tier & Author status */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">ID:</span>
              <span className="font-mono text-xs font-black text-amber-300">
                {isPrivacyMode ? maskAccountId(accountId) : accountId}
              </span>
              <button
                type="button"
                onClick={handleCopyAccountId}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                title="Sao chép mã ID tài khoản"
              >
                {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            {/* VIP Tier Badge */}
            {isVip ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-sm">
                <Crown size={14} className="fill-amber-400 text-amber-400" />
                <span>HỘI VIÊN VIP</span>
                {vipExpiresAt && (
                  <span className="text-[10px] font-medium text-amber-400/80 pl-1 border-l border-amber-500/30">
                    Hạn: {formatExpiresDate(vipExpiresAt)}
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs font-bold">
                  <UserIcon size={13} className="text-zinc-400" />
                  <span>Thành viên</span>
                </span>
                <button
                  type="button"
                  onClick={onGoToTopup}
                  className="px-3 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Sparkles size={13} className="fill-zinc-950" />
                  <span>Nâng cấp VIP</span>
                </button>
              </div>
            )}

            {isAuthorVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                <Award size={13} className="text-purple-400" />
                <span>Nghệ Sĩ Xác Thực</span>
              </span>
            )}
          </div>

          {/* Right Column: Audio Points, Daily Check-in & Haevy Lite Coins */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            {/* Audio Points Chip */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-amber-500/30">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins size={13} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-black text-white">
                  {audioPoints.toLocaleString('vi-VN')}
                </span>
                <span className="text-[10px] text-amber-400/90 font-bold uppercase">Điểm</span>
              </div>
            </div>

            {/* Daily Check-in Button / Badge */}
            {hasCheckedInToday ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-xs font-bold shadow-sm">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Đã điểm danh hôm nay</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDailyCheckin}
                disabled={checkinLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                title="Bấm để nhận ngay từ +50 đến +100 Điểm Audio điểm danh hàng ngày"
              >
                {checkinLoading ? (
                  <Loader2 size={14} className="animate-spin text-zinc-950" />
                ) : (
                  <Sparkles size={14} className="fill-zinc-950 text-zinc-950" />
                )}
                <span>Điểm danh (+50~100đ)</span>
              </button>
            )}

            {/* Haevy Lite Coins */}
            {onGoToHaevyLite && (
              <button
                type="button"
                onClick={onGoToHaevyLite}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                title="Xu Haevy Lite dùng để mua hiệu ứng hào quang và avatar vũ trụ"
              >
                <Sparkles size={13} className="text-purple-400" />
                <span className="font-mono font-black">{haevyLiteCoins || 0}</span>
                <span className="text-[10px] opacity-80">Xu</span>
              </button>
            )}
          </div>
        </div>

        {/* Check-in Notification Banner */}
        {checkinMsg && (
          <div className={`mt-3 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in ${
            checkinMsg.type === 'success' 
              ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300' 
              : 'bg-rose-950/80 border border-rose-600 text-rose-300'
          }`}>
            {checkinMsg.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 text-emerald-400" /> : <AlertCircle size={16} className="shrink-0 text-rose-400" />}
            <span className="font-semibold">{checkinMsg.text}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SECTION: ẢNH BÌA & ẢNH ĐẠI DIỆN VỚI KHUNG ĐẠI DIỆN                      */}
      {/* "Đầu tiên là ảnh đại diện trên là ảnh bìa .Bổ sung nhìn khung đại diện..." */}
      {/* ========================================================================= */}
      <ProfileHeaderCover
        user={user}
        accountId={accountId}
        isVip={isVip}
        profileData={profileData}
        coverUrl={coverUrl}
        avatarFrameId={avatarFrameId}
        onUpdateCoverUrl={handleUpdateCoverUrl}
        onUpdateAvatarFrame={handleUpdateAvatarFrame}
        onOpenEditProfile={() => setActiveTab('about')}
        onGoToTopup={onGoToTopup}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={handleTogglePrivacyMode}
      />

      {/* ========================================================================= */}
      {/* 2. THE 4-TAB NAVIGATION BAR (XUỐNG DƯỚI CÓ 1 THANH)                       */}
      {/* 1: Bài đăng                                                               */}
      {/* 2: Giới thiệu thông tin người dùng (người dùng tùy chỉnh)                 */}
      {/* 3: Trang audio                                                            */}
      {/* 4: Kho tổng hợp các ảnh và video đã đăng                                  */}
      {/* ========================================================================= */}
      <div 
        id="profile_primary_tabs_bar" 
        className="sticky top-14 z-30 p-1.5 rounded-3xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/90 shadow-2xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
          
          {/* Tab 1: Bài đăng */}
          <button
            id="tab-profile-posts"
            onClick={() => setActiveTab('posts')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <FileText size={16} />
            <span>Bài Đăng</span>
          </button>

          {/* Tab 2: Giới thiệu thông tin người dùng (tùy chỉnh) */}
          <button
            id="tab-profile-about"
            onClick={() => setActiveTab('about')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Info size={16} />
            <span>Giới Thiệu Thông Tin</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-zinc-900 font-bold hidden sm:inline">
              Tùy chỉnh
            </span>
          </button>

          {/* Tab 3: Trang Audio */}
          <button
            id="tab-profile-audio"
            onClick={() => setActiveTab('audio')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Music size={16} />
            <span>Trang Audio</span>
            {favorites.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Tab 4: Kho tổng hợp ảnh và video đã đăng */}
          <button
            id="tab-profile-media"
            onClick={() => setActiveTab('media')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <Film size={16} />
            <span>Kho Ảnh & Video</span>
          </button>
        </div>

        {/* Secondary Options: Bảo mật 6 lớp & Lịch sử điểm */}
        <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-zinc-800">
          <button
            onClick={() => setActiveTab('security')}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-indigo-300'
            }`}
            title="Bảo Vệ Tài Khoản 6 Lớp"
          >
            <ShieldCheck size={16} className="text-indigo-400" />
            <span className="hidden lg:inline text-[11px]">Bảo mật 6 lớp</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-300'
            }`}
            title="Lịch Sử Biến Động Điểm Audio"
          >
            <History size={16} className="text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">Lịch sử</span>
          </button>

          <button
            id="tab-profile-support"
            onClick={() => setActiveTab('support')}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-sky-300'
            }`}
            title="Chat Trực Tuyến Haevy Support AI 24/7"
          >
            <Bot size={16} className="text-sky-400" />
            <span className="hidden lg:inline text-[11px]">Hỗ trợ AI</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENTS RENDERER                                                  */}
      {/* ========================================================================= */}
      
      {/* TAB 1: BÀI ĐĂNG (POSTS FEED) */}
      {activeTab === 'posts' && (
        <div className="animate-in fade-in duration-200">
          <ProfilePostsTab
            user={user}
            displayName={profileData.displayName}
            avatarFrameId={avatarFrameId}
            tracks={tracks}
            onPlayTrack={onPlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        </div>
      )}

      {/* TAB 2: GIỚI THIỆU THÔNG TIN NGƯỜI DÙNG (TÙY CHỈNH) */}
      {activeTab === 'about' && (
        <div className="animate-in fade-in duration-200">
          <ProfileAboutTab
            user={user}
            accountId={accountId}
            isVip={isVip}
            audioPoints={audioPoints}
            totalEarnedPoints={totalEarnedPoints}
            totalListenedMinutes={totalListenedMinutes}
            profileData={profileData}
            onUpdateProfileData={handleUpdateProfileData}
            isPrivacyMode={isPrivacyMode}
            onTogglePrivacyMode={handleTogglePrivacyMode}
          />
        </div>
      )}

      {/* TAB 3: TRANG AUDIO */}
      {activeTab === 'audio' && (
        <div className="animate-in fade-in duration-200">
          <ProfileAudioTab
            tracks={tracks}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onPlayTrack={onPlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            totalListenedMinutes={totalListenedMinutes}
            isVip={isVip}
            onOpenPublishAudio={onOpenPublishAudio}
            onOpenAuthorStudio={onOpenAuthorStudio}
            onGoToTopup={onGoToTopup}
          />
        </div>
      )}

      {/* TAB 4: KHO TỔNG HỢP CÁC ẢNH VÀ VIDEO ĐÃ ĐĂNG */}
      {activeTab === 'media' && (
        <div className="animate-in fade-in duration-200">
          <ProfileMediaGalleryTab
            user={user}
          />
        </div>
      )}

      {/* SECONDARY TAB: 6-LAYER SECURITY SHIELD */}
      {activeTab === 'security' && (
        <div className="animate-in fade-in duration-200 space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Haevy AI Hỗ Trợ An Ninh 6 Lớp</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full">Trực Tuyến</span>
                </h4>
                <p className="text-[11px] text-zinc-400">Trợ lý AI phân tích và hướng dẫn tối ưu hóa lá chắn bảo vệ đạt 100/100</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSupportInitialTab('chat');
                setIsSupportFullScreen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Bot size={14} />
              <span>Mở Trợ Lý Haevy AI</span>
            </button>
          </div>

          <SixLayerSecurityShield
            user={user}
            accountId={accountId}
            isVip={isVip}
            isPrivacyMode={isPrivacyMode}
            onOpenSupport={() => {
              setSupportInitialTab('chat');
              setIsSupportFullScreen(true);
            }}
          />
        </div>
      )}

      {/* SECONDARY TAB: TRANSACTION HISTORY */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-zinc-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0">
                <History size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Haevy AI Giám Sát Lịch Sử & Biến Động Điểm</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded-full">Tự Động Rà Soát</span>
                </h4>
                <p className="text-[11px] text-zinc-400">Xem phân tích giao dịch chuyên sâu, kiểm tra bất thường và đối soát an ninh</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSupportInitialTab('history');
                setIsSupportFullScreen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-lg shadow-purple-600/30 active:scale-95"
            >
              <Sparkles size={14} />
              <span>⚡ AI Quét Lịch Sử & An Ninh</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <History size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">Lịch Sử Biến Động Điểm Audio</h3>
              </div>
              <div className="flex items-center gap-2">
                {isPrivacyMode && (
                  <button
                    type="button"
                    onClick={() => setShowTransactionAmounts(!showTransactionAmounts)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                    title={showTransactionAmounts ? "Ẩn số điểm giao dịch" : "Hiện số điểm giao dịch"}
                  >
                    {showTransactionAmounts ? <EyeOff size={13} className="text-amber-400" /> : <Eye size={13} className="text-zinc-400" />}
                    <span>{showTransactionAmounts ? "Ẩn số điểm" : "Hiện số điểm"}</span>
                  </button>
                )}
                <span className="text-xs text-zinc-500">10 giao dịch gần nhất</span>
              </div>
            </div>

            {loadingHistory ? (
              <div className="divide-y divide-zinc-800/60">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonTransactionRow key={i} />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Chưa có giao dịch điểm nào. Hãy nghe nhạc và điểm danh để nhận điểm ngay!
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{tx.title}</p>
                      <p className="text-[11px] text-zinc-500">
                        {tx.type === 'listen' ? 'Thưởng nghe nhạc' : tx.type === 'checkin' ? 'Điểm danh hàng ngày' : tx.type === 'bonus' ? 'Thưởng hệ thống / Mã code' : 'Giao dịch'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`font-mono font-bold text-xs ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPrivacyMode && !showTransactionAmounts ? (
                          <span className="text-zinc-500 tracking-wider">•••• pts</span>
                        ) : (
                          `${tx.amount >= 0 ? `+${tx.amount}` : tx.amount} pts`
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECONDARY TAB: HAEVY SUPPORT AI (INLINE) */}
      {activeTab === 'support' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <HaevySupportAiView
            user={user}
            accountId={accountId}
            isVip={isVip}
            isFullScreen={false}
            onNavigateToSecurity={() => setActiveTab('security')}
            onNavigateToVip={() => onGoToTopup()}
            transactions={transactions}
            audioPoints={audioPoints}
            totalEarnedPoints={totalEarnedPoints}
            vipExpiresAt={vipExpiresAt}
            initialTab={supportInitialTab}
          />
        </div>
      )}

      {/* Admin Chain Lock Overlay */}
      <AdminChainLockOverlay
        isOpen={showAdminChainLock}
        onClose={() => setShowAdminChainLock(false)}
        onSuccess={() => {
          setShowAdminChainLock(false);
          if (onOpenAdmin) onOpenAdmin();
        }}
      />

      {/* Full-Screen Haevy Support AI Portal */}
      {isSupportFullScreen && (
        <HaevySupportAiView
          user={user}
          accountId={accountId}
          isVip={isVip}
          isFullScreen={true}
          onClose={() => setIsSupportFullScreen(false)}
          onNavigateToSecurity={() => {
            setIsSupportFullScreen(false);
            setActiveTab('security');
          }}
          onNavigateToVip={() => {
            setIsSupportFullScreen(false);
            onGoToTopup();
          }}
          transactions={transactions}
          audioPoints={audioPoints}
          totalEarnedPoints={totalEarnedPoints}
          vipExpiresAt={vipExpiresAt}
          initialTab={supportInitialTab}
        />
      )}
      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-purple-400 hover:text-white border border-purple-500/40 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center animate-in fade-in zoom-in duration-200"
          title="Cuộn lên đầu trang"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
