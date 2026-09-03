import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  onSnapshot, 
  serverTimestamp, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  increment 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { 
  VipTier, 
  VipSettings, 
  PointTransaction, 
  VipPackage, 
  VipOrder,
  PointTopupPackage,
  PointTopupOrder,
  ReferralCode,
  AnonymousPass,
  AnonymousVipSession,
  UserAccountData,
  AuthorVerification,
  AuthorVerificationStatus,
  Track,
  SystemAuditLog,
  AdminRole,
  SubAdminPermissions,
  SystemAnnouncement,
  SystemGlobalConfig,
  AdminHomeCustomConfig,
  HaevyUpcomingEvent,
  EventStatus,
  ShortcutItemConfig,
  ShortcutsConfig
} from '../types';
import { INITIAL_TRACKS } from '../data';
import { DEFAULT_SHORTCUTS_CONFIG } from '../data/defaultShortcuts';
import { useGlobalPresenceHeartbeat } from '../services/presenceService';

interface CustomAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isLocalSession?: boolean;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: User | CustomAuthUser | null;
  loading: boolean;
  accountId: string;
  role: AdminRole;
  adminRole: AdminRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  subAdminPermissions: SubAdminPermissions;
  favorites: string[];
  audioPoints: number;
  totalEarnedPoints: number;
  totalListenedMinutes: number;
  lastDailyCheckin: string | null;
  vipTier: VipTier;
  vipExpiresAt: string | null;
  isVip: boolean;
  vipSettings: VipSettings;
  anonymousVipSession: AnonymousVipSession | null;
  isAnonymousAccount: boolean;
  loginAsAnonymous: (passCode?: string) => Promise<{ success: boolean; message: string; guestId: string }>;
  // Author & Verification State
  authorStatus: AuthorVerificationStatus;
  isAuthorVerified: boolean;
  authorStageName: string;
  authorBio: string;
  authorVerificationData: AuthorVerification | null;
  logSystemActivity: (params: {
    action: SystemAuditLog['action'];
    actionTitle: string;
    targetType: SystemAuditLog['targetType'];
    targetId?: string;
    targetName?: string;
    details: string;
    metadata?: Record<string, any>;
    severity?: SystemAuditLog['severity'];
  }) => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  addAudioPoints: (amount: number, title: string, type: PointTransaction['type']) => Promise<void>;
  deductAudioPoints: (amount: number, title: string, type?: PointTransaction['type']) => Promise<{ success: boolean; message: string }>;
  incrementListenTime: (minutes: number) => Promise<void>;
  performDailyCheckin: () => Promise<{ success: boolean; message: string; pointsAwarded: number }>;
  redeemVipWithPoints: (tier: VipTier, durationDays: number, pointsCost: number) => Promise<{ success: boolean; message: string }>;
  purchaseVipPlan: (params: {
    pkg: VipPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: VipOrder['paymentMethod'];
  }) => Promise<{ success: boolean; message: string; orderId?: string }>;
  purchasePointsPackage: (params: {
    pkg: PointTopupPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: PointTopupOrder['paymentMethod'];
  }) => Promise<{ success: boolean; message: string; orderId?: string }>;
  giftVipPlanToUser: (params: {
    recipientIdentifier: string;
    pkg: VipPackage;
    finalAmount: number;
    paymentMethod: VipOrder['paymentMethod'];
    message?: string;
  }) => Promise<{ success: boolean; message: string; recipientName?: string; orderId?: string }>;
  transferCoinsToUser: (params: {
    recipientIdentifier: string;
    amount: number;
    message?: string;
  }) => Promise<{ success: boolean; message: string; recipientName?: string }>;
  activateTrialVip: () => Promise<void>;
  updateVipSettings: (settings: Partial<VipSettings>) => Promise<void>;
  createBlankAnonymousAccount: () => { guestId: string; message: string };
  activateAnonymousPass: (code: string) => Promise<{ success: boolean; message: string; durationDays: number; type: '3_digit_month' | '1_week' }>;
  clearAnonymousVipSession: () => void;
  redeemReferralCode: (code: string) => Promise<{ success: boolean; message: string; pointsAwarded?: number; daysAwarded?: number }>;
  // Author Methods
  submitAuthorVerification: (data: {
    fullName: string;
    stageName: string;
    email: string;
    phoneNumber: string;
    idCardNumber: string;
    idCardIssueDate: string;
    idCardFrontUrl: string;
    idCardBackUrl: string;
    facePhotoUrl: string;
    musicGenre: string;
    bio: string;
    socialLink?: string;
  }) => Promise<{ success: boolean; message: string }>;
  publishAuthorTrack: (trackData: {
    title: string;
    artist?: string;
    genre: string;
    url: string;
    coverUrl: string;
    durationSec?: number;
    isVipOnly?: boolean;
    bitrate?: string;
    description?: string;
    lyrics?: string;
    isSeries?: boolean;
    seriesId?: string;
    seriesTitle?: string;
    episodeNumber?: number;
    episodeTitle?: string;
    totalEpisodes?: number;
    storylineSummary?: string;
  }) => Promise<{ success: boolean; message: string; trackId?: string }>;
  deleteAuthorTrack: (trackId: string) => Promise<{ success: boolean; message: string }>;
  sendGiftToAuthor: (params: {
    authorUid: string;
    authorStageName: string;
    giftId: string;
    giftName: string;
    giftIcon: string;
    pointsCost: number;
    message?: string;
    trackId?: string;
    trackTitle?: string;
  }) => Promise<{ success: boolean; message: string }>;
  // Admin Methods
  approveAuthorVerification: (verificationId: string, targetUserId: string, stageName: string) => Promise<{ success: boolean; message: string }>;
  rejectAuthorVerification: (verificationId: string, targetUserId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  revokeAuthorStatus: (targetUserId: string) => Promise<{ success: boolean; message: string }>;
  createReferralCode: (params: { code?: string; rewardPoints?: number; rewardVipDays?: number; description?: string }) => Promise<{ success: boolean; message: string; code?: string }>;
  deleteReferralCode: (codeId: string) => Promise<void>;
  createAnonymousPass: (params: { passCode: string; type: '3_digit_month' | '1_week'; description?: string }) => Promise<{ success: boolean; message: string }>;
  deleteAnonymousPass: (passId: string) => Promise<void>;
  updateUserVipByAdmin: (targetUid: string, tier: VipTier, durationDays: number) => Promise<{ success: boolean; message: string }>;
  adjustUserPointsByAdmin: (targetUid: string, pointsDelta: number, reason: string) => Promise<{ success: boolean; message: string }>;
  deleteCommentByAdmin: (postId: string, commentId: string) => Promise<{ success: boolean; message: string }>;
  deleteCommunityPostByAdmin: (postId: string) => Promise<{ success: boolean; message: string }>;
  pinCommunityPostByAdmin: (postId: string, isPinned: boolean) => Promise<{ success: boolean; message: string }>;
  deleteAudioTrackByAdmin: (trackId: string) => Promise<{ success: boolean; message: string }>;
  toggleTrackVipStatusByAdmin: (trackId: string, currentVip: boolean) => Promise<{ success: boolean; message: string }>;
  banUserAccountByAdmin: (targetUid: string, isBanned: boolean, reason?: string) => Promise<{ success: boolean; message: string }>;
  
  // Sub-Admin Management
  assignSubAdmin: (targetUid: string, role: AdminRole, permissions: SubAdminPermissions) => Promise<{ success: boolean; message: string }>;
  revokeSubAdmin: (targetUid: string) => Promise<{ success: boolean; message: string }>;
  updateSubAdminPermissions: (targetUid: string, permissions: SubAdminPermissions) => Promise<{ success: boolean; message: string }>;

  // System Broadcast Announcements
  systemAnnouncements: SystemAnnouncement[];
  createSystemAnnouncement: (data: {
    title: string;
    content: string;
    type: 'info' | 'event' | 'urgent' | 'maintenance';
    targetAudience: 'all' | 'vip' | 'authors';
    isPinned?: boolean;
    durationHours?: number;
  }) => Promise<{ success: boolean; message: string }>;
  deleteSystemAnnouncement: (announcementId: string) => Promise<{ success: boolean; message: string }>;
  togglePinAnnouncement: (announcementId: string, isPinned: boolean) => Promise<{ success: boolean; message: string }>;

  // Global System Configuration & Maintenance
  systemGlobalConfig: SystemGlobalConfig;
  updateSystemGlobalConfig: (config: Partial<SystemGlobalConfig>) => Promise<{ success: boolean; message: string }>;

  // Admin Homepage Customization (Chỉnh sửa Trang Chủ Haevy Audio)
  homeCustomConfig: AdminHomeCustomConfig;
  updateHomeCustomConfig: (config: Partial<AdminHomeCustomConfig>) => Promise<{ success: boolean; message: string }>;
  resetHomeCustomConfig: () => Promise<{ success: boolean; message: string }>;

  // Ecosystem Upcoming & Live Events Management (Quản Lý & Tùy Chỉnh Sự Kiện)
  upcomingEvents: HaevyUpcomingEvent[];
  createUpcomingEvent: (eventData: Partial<HaevyUpcomingEvent>) => Promise<{ success: boolean; message: string; eventId?: string }>;
  updateUpcomingEvent: (eventId: string, eventData: Partial<HaevyUpcomingEvent>) => Promise<{ success: boolean; message: string }>;
  deleteUpcomingEvent: (eventId: string) => Promise<{ success: boolean; message: string }>;
  toggleEventPin: (eventId: string, isPinned: boolean) => Promise<{ success: boolean; message: string }>;
  toggleEventStatus: (eventId: string, status: EventStatus) => Promise<{ success: boolean; message: string }>;
  registerForEvent: (eventId: string) => Promise<{ success: boolean; message: string; rewardAwarded?: number }>;
  claimEventReward: (eventId: string) => Promise<{ success: boolean; message: string; rewardAwarded?: number }>;

  // Batch Operations
  batchRewardUsers: (targetUids: string[], points: number, vipDays: number, reason: string) => Promise<{ success: boolean; message: string; count: number }>;

  // Personal Keyboard Shortcuts Customization & Cloud Sync
  shortcutsConfig: ShortcutsConfig;
  isShortcutsSyncing: boolean;
  updateShortcutsConfig: (newConfig: ShortcutsConfig) => Promise<{ success: boolean; message: string }>;
  updateSingleShortcut: (actionId: string, updates: Partial<ShortcutItemConfig>) => Promise<{ success: boolean; message: string }>;
  resetShortcutsToDefault: () => Promise<{ success: boolean; message: string }>;

  signInWithGoogle: (referralCode?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_SUB_ADMIN_PERMISSIONS: SubAdminPermissions = {
  canManageAuthors: false,
  canManageTracks: false,
  canManageCommunity: false,
  canManageUsers: false,
  canCreateVipAndPasses: false,
  canPostAnnouncements: false,
  canManageSystemConfig: false,
  canBatchReward: false,
  canViewAuditLogs: false
};

const DEFAULT_VIP_SETTINGS: VipSettings = {
  hifiMode: true,
  bassBoost: true,
  spatial3D: true,
  showVipBadge: true,
  autoDownloadOffline: false,
  smartEqualizer: 'bass_ultra',
  audioCrossfadeSec: 4,
  karaokeMode: true,
  sleepTimerFadeout: true,
  goldenCommentAura: true,
  customTheme: 'royal_gold',
};

const DEFAULT_GLOBAL_CONFIG: SystemGlobalConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang được nâng cấp định kỳ nhằm nâng cao chất lượng dịch vụ âm thanh.',
  pointMultiplier: 1,
  vipDiscountPercent: 0,
  allowNewRegistrations: true,
  allowAuthorRegistrations: true,
  allowAnonymousPasses: true,
  dailyCheckinBonus: 100,
};

export const DEFAULT_HOME_CUSTOM_CONFIG: AdminHomeCustomConfig = {
  isEnabled: false,
  targetAudience: 'all',
  targetAccountIds: [],
  titleTag: 'Trang Chủ Tùy Biến Haevy Audio',
  showAdminGreetingBanner: false,
  greetingBannerText: 'Chào mừng bạn đến với Không Gian Âm Nhạc & Cốt Truyện Đặc Quyền Haevy Audio!',
  greetingBannerSubtext: 'Khám phá các tuyệt phẩm được tuyển chọn bởi Ban Quản Trị hôm nay.',
  greetingBannerIcon: 'sparkles',
  greetingBannerColor: 'amber',
  greetingBannerCtaText: 'Khám Phá Ngay',
  greetingBannerCtaTab: 'library',
  heroMode: 'auto',
  showHeroSpotlight: true,
  showGenresSection: true,
  genresTitle: 'Khám phá theo thể loại',
  showTrendingSection: true,
  trendingTitle: 'Xu hướng nghe nhiều',
  trendingSubtitle: 'Các bản audio thịnh hành trong tuần',
  showAdminPicksSection: false,
  adminPicksTitle: 'Lựa Chọn Của Ban Quản Trị ⭐',
  adminPicksSubtitle: 'Những tác phẩm độc đáo & ấn tượng nhất do Admin đề cử riêng',
  adminPicksTrackIds: [],
  showCuratedCollections: true,
  curatedCollectionsTitle: 'Bộ sưu tập chọn lọc',
  curatedCollectionsSubtitle: 'Playlist tạo sẵn cho từng trạng thái tâm trí',
  customBadgeText: '⭐ Giao diện được cá nhân hóa bởi Haevy Admin',
  version: 1,
};

export const DEFAULT_UPCOMING_EVENTS: HaevyUpcomingEvent[] = [
  {
    id: 'event-grand-ecosystem-2026',
    title: 'Đại Lễ Hệ Sinh Thái Haevy 2026',
    subtitle: 'Đêm Hội Âm Nhạc & Khai Mở Không Gian Vũ Trụ 3D',
    description: 'Sự kiện lớn nhất năm: Khai mạc chuỗi đại tiệc âm thanh Lossless Hi-Fi, tặng thưởng 500 Xu Haevy cho toàn bộ thành viên check-in và ra mắt phòng trà 3D Space AR trực tiếp.',
    badge: '👑 ĐẠI LỄ HỆ SINH THÁI',
    category: 'holiday',
    theme: 'gold_luxury',
    customGradientFrom: '#fbbf24',
    customGradientTo: '#f59e0b',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    iconName: 'crown',
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    countdownEnabled: true,
    status: 'upcoming',
    ctaText: 'Đăng Ký Nhận 500 Xu',
    ctaAction: 'mode_portal',
    rewardCoins: 500,
    rewardBadgeText: '+500 Xu & Huy Hiệu',
    targetAudience: 'all',
    displayLocations: ['portal', 'audio_home', 'top_ribbon'],
    isPinned: true,
    priorityOrder: 100,
    viewCount: 1248,
    joinedCount: 382,
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    createdByName: 'Haevy Admin Master'
  },
  {
    id: 'event-crowd-tournament-x2',
    title: 'Giải Đấu Trí Đám Đông ×2 Triệu Xu',
    subtitle: 'Vòng Đua Tranh Bảng Vàng Siêu Trí Tuệ',
    description: 'Tham gia giải đấu trực tiếp mỗi tối 20:00: Trả lời các câu hỏi xu hướng âm nhạc và công nghệ, tỷ lệ nhân đôi x2 xu cược và tổng giải thưởng 1,000,000 Xu Haevy.',
    badge: '⚡ GIẢI ĐẤU ×2 XU',
    category: 'tournament',
    theme: 'cyber_fire',
    customGradientFrom: '#ef4444',
    customGradientTo: '#f97316',
    bannerImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    iconName: 'trophy',
    startAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    countdownEnabled: true,
    status: 'upcoming',
    ctaText: 'Vào Đấu Trường Ngay',
    ctaAction: 'mode_games',
    rewardCoins: 1000,
    rewardBadgeText: 'Giải Thưởng 1,000,000 Xu',
    targetAudience: 'all',
    displayLocations: ['portal', 'audio_home'],
    isPinned: false,
    priorityOrder: 90,
    viewCount: 890,
    joinedCount: 245,
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    createdByName: 'Haevy Admin Master'
  },
  {
    id: 'event-space-3d-aurora',
    title: 'Triển Lãm Không Gian 3D Cực Quang',
    subtitle: 'Đắm Chìm Âm Thanh Sóng Não & Tranh Nghệ Thuật',
    description: 'Trải nghiệm không gian thực tế ảo 3D Space với hiệu ứng Cực Quang Huyền Ảo và âm thanh thư giãn Alpha Wave giảm căng thẳng tuyệt đối.',
    badge: '🌌 SPACE 3D AR',
    category: 'space_ar',
    theme: 'neon_galaxy',
    customGradientFrom: '#8b5cf6',
    customGradientTo: '#3b82f6',
    bannerImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    iconName: 'sparkles',
    startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    countdownEnabled: true,
    status: 'upcoming',
    ctaText: 'Trải Nghiệm Không Gian 3D',
    ctaAction: 'mode_space',
    rewardCoins: 200,
    rewardBadgeText: '+200 Xu Tinh Thần',
    targetAudience: 'all',
    displayLocations: ['portal'],
    isPinned: false,
    priorityOrder: 80,
    viewCount: 654,
    joinedCount: 167,
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    createdByName: 'Haevy Admin Master'
  }
];

const ANON_SESSION_KEY = 'audiohub_anon_vip_session';
const LOCAL_USER_KEY = 'audiohub_custom_auth_user';

// Helper to generate unique human-readable account ID
function generateAccountId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const numeric = Math.abs(hash % 900000) + 100000;
  return `AH-${numeric}`;
}

// Global System Activity Logger (Audit Trail with zero omissions)
export const recordSystemAuditLog = async (params: {
  action: SystemAuditLog['action'];
  actionTitle: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole: 'admin' | 'user' | 'author';
  targetType: SystemAuditLog['targetType'];
  targetId?: string;
  targetName?: string;
  details: string;
  metadata?: Record<string, any>;
  severity?: SystemAuditLog['severity'];
}) => {
  try {
    await addDoc(collection(db, 'systemAuditLogs'), {
      action: params.action,
      actionTitle: params.actionTitle,
      actorId: params.actorId,
      actorName: params.actorName,
      actorEmail: params.actorEmail || '',
      actorRole: params.actorRole || 'user',
      targetType: params.targetType,
      targetId: params.targetId || '',
      targetName: params.targetName || '',
      details: params.details,
      metadata: params.metadata || {},
      severity: params.severity || 'info',
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('System audit log recording notice:', e);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | CustomAuthUser | null>(() => {
    try {
      const savedLocal = localStorage.getItem(LOCAL_USER_KEY);
      if (savedLocal) {
        return JSON.parse(savedLocal);
      }
    } catch (e) {
      console.warn('Error reading saved local user:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string>('GUEST-000000');
  const [role, setRole] = useState<AdminRole>('user');
  const [subAdminPermissions, setSubAdminPermissions] = useState<SubAdminPermissions>(DEFAULT_SUB_ADMIN_PERMISSIONS);
  const [systemAnnouncements, setSystemAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [systemGlobalConfig, setSystemGlobalConfig] = useState<SystemGlobalConfig>(DEFAULT_GLOBAL_CONFIG);
  const [homeCustomConfig, setHomeCustomConfig] = useState<AdminHomeCustomConfig>(() => {
    try {
      const saved = localStorage.getItem('haevy_home_custom_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved home custom config:', e);
    }
    return DEFAULT_HOME_CUSTOM_CONFIG;
  });
  const [upcomingEvents, setUpcomingEvents] = useState<HaevyUpcomingEvent[]>(() => {
    try {
      const cached = localStorage.getItem('haevy_upcoming_events_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return DEFAULT_UPCOMING_EVENTS;
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [audioPoints, setAudioPoints] = useState<number>(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState<number>(0);
  const [totalListenedMinutes, setTotalListenedMinutes] = useState<number>(0);
  const [lastDailyCheckin, setLastDailyCheckin] = useState<string | null>(null);
  const [vipTier, setVipTier] = useState<VipTier>('free');
  const [vipExpiresAt, setVipExpiresAt] = useState<string | null>(null);
  const [vipSettings, setVipSettings] = useState<VipSettings>(DEFAULT_VIP_SETTINGS);

  // Author & Verification State
  const [authorStatus, setAuthorStatus] = useState<AuthorVerificationStatus>('none');
  const [isAuthorVerified, setIsAuthorVerified] = useState<boolean>(false);
  const [authorStageName, setAuthorStageName] = useState<string>('');
  const [authorBio, setAuthorBio] = useState<string>('');
  const [authorVerificationData, setAuthorVerificationData] = useState<AuthorVerification | null>(null);

  // Personal Keyboard Shortcuts Config State with local cache fallback
  const [shortcutsConfig, setShortcutsConfig] = useState<ShortcutsConfig>(() => {
    try {
      const saved = localStorage.getItem('haevy_shortcuts_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SHORTCUTS_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading cached shortcuts config:', e);
    }
    return DEFAULT_SHORTCUTS_CONFIG;
  });
  const [isShortcutsSyncing, setIsShortcutsSyncing] = useState<boolean>(false);

  // Anonymous Guest VIP Session
  const [anonymousVipSession, setAnonymousVipSession] = useState<AnonymousVipSession | null>(() => {
    try {
      const saved = localStorage.getItem(ANON_SESSION_KEY);
      if (saved) {
        const parsed: AnonymousVipSession = JSON.parse(saved);
        if (parsed.isActive && new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading anon vip session:', e);
    }
    return null;
  });

  // Admin & Sub-Admin Hierarchy Checks
  const isSuperAdmin = 
    Boolean(user?.email && user.email.toLowerCase() === 'kha78228@gmail.com') ||
    role === 'super_admin' || role === 'admin';

  const isSubAdmin = role === 'sub_admin' || role === 'moderator';

  const isAdmin = isSuperAdmin || isSubAdmin;

  const adminRole: AdminRole = isSuperAdmin ? 'super_admin' : isSubAdmin ? role : 'user';

  const effectivePermissions: SubAdminPermissions = isSuperAdmin ? {
    canManageAuthors: true,
    canManageTracks: true,
    canManageCommunity: true,
    canManageUsers: true,
    canCreateVipAndPasses: true,
    canPostAnnouncements: true,
    canManageSystemConfig: true,
    canBatchReward: true,
    canViewAuditLogs: true,
  } : {
    canManageAuthors: Boolean(subAdminPermissions?.canManageAuthors),
    canManageTracks: Boolean(subAdminPermissions?.canManageTracks),
    canManageCommunity: Boolean(subAdminPermissions?.canManageCommunity),
    canManageUsers: Boolean(subAdminPermissions?.canManageUsers),
    canCreateVipAndPasses: Boolean(subAdminPermissions?.canCreateVipAndPasses),
    canPostAnnouncements: Boolean(subAdminPermissions?.canPostAnnouncements),
    canManageSystemConfig: Boolean(subAdminPermissions?.canManageSystemConfig),
    canBatchReward: Boolean(subAdminPermissions?.canBatchReward),
    canViewAuditLogs: Boolean(subAdminPermissions?.canViewAuditLogs),
  };

  // Derive isVip boolean considering both registered VIP & Anonymous VIP Session
  const isRegisteredVip = 
    vipTier !== 'free' && 
    (vipExpiresAt === null || new Date(vipExpiresAt).getTime() > Date.now());

  const isAnonVipActive = 
    Boolean(anonymousVipSession?.isActive && new Date(anonymousVipSession.expiresAt).getTime() > Date.now());

  const isAnonymousAccount = Boolean(
    (user && ('isAnonymous' in user ? user.isAnonymous : (user as any).isAnonymous)) ||
    (anonymousVipSession?.isActive && !user)
  );

  const effectiveIsVip = isRegisteredVip || isAnonVipActive;
  const effectiveVipTier: VipTier = isRegisteredVip ? vipTier : isAnonVipActive ? 'vip' : 'free';
  const effectiveVipExpiresAt = isRegisteredVip ? vipExpiresAt : isAnonVipActive ? anonymousVipSession?.expiresAt || null : null;

  // Effective Account ID
  const effectiveAccountId = user 
    ? accountId 
    : anonymousVipSession?.isActive 
    ? anonymousVipSession.guestId 
    : 'GUEST-CHUA-DANG-NHAP';

  // Global Real-Time Presence Heartbeat (Sends ping every 4s, marks offline if no signal for > 10s)
  useGlobalPresenceHeartbeat(user, {
    accountId: effectiveAccountId,
    isVip: effectiveIsVip,
    isAuthorVerified,
    authorStageName
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem(LOCAL_USER_KEY);
        setLoading(false);

        const userRef = doc(db, 'users', currentUser.uid);
        const isDefaultAdmin = currentUser.email?.toLowerCase() === 'kha78228@gmail.com';
        const generatedId = generateAccountId(currentUser.uid);

        // Immediately populate fallback account state so UI works seamlessly even offline
        setAccountId(generatedId);
        if (isDefaultAdmin) setRole('admin');

        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // New user registration bonus: 100 free Audio Points!
            await setDoc(userRef, {
              accountId: generatedId,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Người dùng',
              photoURL: currentUser.photoURL || '',
              role: isDefaultAdmin ? 'admin' : 'user',
              audioPoints: 100,
              totalEarnedPoints: 100,
              totalListenedMinutes: 0,
              lastDailyCheckin: null,
              vipTier: 'free',
              vipExpiresAt: null,
              vipSettings: DEFAULT_VIP_SETTINGS,
              favoriteTrackIds: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true });

            setAccountId(generatedId);
            setRole(isDefaultAdmin ? 'admin' : 'user');

            // Log welcome bonus
            try {
              await addDoc(collection(db, 'users', currentUser.uid, 'pointTransactions'), {
                title: 'Thưởng đăng ký thành viên mới',
                amount: 100,
                type: 'bonus',
                createdAt: serverTimestamp(),
              });
            } catch (txErr) {
              console.warn('Welcome bonus transaction delayed:', txErr);
            }
          } else {
            const data = snap.data();
            const currentAccountId = data.accountId || generatedId;
            const currentRole = isDefaultAdmin ? 'admin' : (data.role || 'user');
            
            // Ensure accountId and admin role are persisted
            if (!data.accountId || (isDefaultAdmin && data.role !== 'admin')) {
              await setDoc(userRef, { accountId: currentAccountId, role: currentRole }, { merge: true });
            }
            setAccountId(currentAccountId);
            setRole(currentRole);
          }
        } catch (err) {
          // Graceful fallback when Firestore is offline or initializing
          console.warn('Firestore offline/initializing, maintaining active session:', err);
          setAccountId(generatedId);
          if (isDefaultAdmin) setRole('admin');
        }
      } else {
        // Check if there is a local custom user
        const savedLocal = localStorage.getItem(LOCAL_USER_KEY);
        if (savedLocal) {
          try {
            const localUser: CustomAuthUser = JSON.parse(savedLocal);
            setUser(localUser);
            const isDefaultAdmin = localUser.email?.toLowerCase() === 'kha78228@gmail.com';
            const genId = generateAccountId(localUser.uid);
            setAccountId(genId);
            setRole(isDefaultAdmin ? 'admin' : 'user');
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
          setFavorites([]);
          setAudioPoints(0);
          setTotalEarnedPoints(0);
          setVipTier('free');
          setVipExpiresAt(null);
          setRole('user');
          setVipSettings(DEFAULT_VIP_SETTINGS);
        }
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to user profile in Firestore
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.favoriteTrackIds)) {
            setFavorites(data.favoriteTrackIds);
          }
          if (data.accountId) {
            setAccountId(data.accountId);
          }
          if (data.role) {
            setRole(user.email?.toLowerCase() === 'kha78228@gmail.com' ? 'super_admin' : data.role);
          }
          if (data.subAdminPermissions) {
            setSubAdminPermissions(data.subAdminPermissions);
          } else {
            setSubAdminPermissions(DEFAULT_SUB_ADMIN_PERMISSIONS);
          }
          setAudioPoints(typeof data.audioPoints === 'number' ? data.audioPoints : 0);
          setTotalEarnedPoints(typeof data.totalEarnedPoints === 'number' ? data.totalEarnedPoints : 0);
          setTotalListenedMinutes(typeof data.totalListenedMinutes === 'number' ? data.totalListenedMinutes : 0);
          setLastDailyCheckin(data.lastDailyCheckin || null);
          setVipTier((data.vipTier as VipTier) || 'free');
          setVipExpiresAt(data.vipExpiresAt || null);
          if (data.vipSettings) {
            setVipSettings({ ...DEFAULT_VIP_SETTINGS, ...data.vipSettings });
          }

          // Real-time listener for user personal shortcuts_config in Firestore
          if (data.shortcuts_config && typeof data.shortcuts_config === 'object') {
            const merged = { ...DEFAULT_SHORTCUTS_CONFIG, ...data.shortcuts_config };
            setShortcutsConfig(merged);
            try {
              localStorage.setItem('haevy_shortcuts_config', JSON.stringify(merged));
            } catch (e) {}
          } else if (data.shortcutsConfig && typeof data.shortcutsConfig === 'object') {
            const merged = { ...DEFAULT_SHORTCUTS_CONFIG, ...data.shortcutsConfig };
            setShortcutsConfig(merged);
            try {
              localStorage.setItem('haevy_shortcuts_config', JSON.stringify(merged));
            } catch (e) {}
          }

          // Author Verification States
          const isVerified = Boolean(
            data.isAuthorVerified || 
            (user.email?.toLowerCase() === 'kha78228@gmail.com' && data.isAuthorVerified !== false)
          );
          setIsAuthorVerified(isVerified);
          setAuthorStatus((data.authorStatus as AuthorVerificationStatus) || (isVerified ? 'verified' : 'none'));
          setAuthorStageName(data.authorStageName || user.displayName || '');
          setAuthorBio(data.authorBio || '');
        }
      },
      (error) => {
        console.error('Error fetching user snapshot:', error);
      }
    );

    // Listen to author verification document
    const verifRef = doc(db, 'authorVerifications', user.uid);
    const unsubscribeVerif = onSnapshot(
      verifRef,
      (vSnap) => {
        if (vSnap.exists()) {
          const vData = vSnap.data() as AuthorVerification;
          setAuthorVerificationData({ ...vData, id: vSnap.id });
          if (vData.status) {
            setAuthorStatus(vData.status);
            if (vData.status === 'verified') {
              setIsAuthorVerified(true);
            }
          }
        } else {
          setAuthorVerificationData(null);
        }
      },
      (err) => {
        console.warn('Author verification snap note:', err);
      }
    );

    return () => {
      unsubscribeDoc();
      unsubscribeVerif();
    };
  }, [user]);

  // Listen to System Broadcast Announcements
  useEffect(() => {
    try {
      const q = query(collection(db, 'systemAnnouncements'));
      const unsub = onSnapshot(q, (snap) => {
        const list: SystemAnnouncement[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        // Sort pinned first, then newest
        list.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setSystemAnnouncements(list);
      }, (err) => {
        console.warn('System announcements listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Announcements init notice:', e);
    }
  }, []);

  // Listen to Global System Configuration
  useEffect(() => {
    try {
      const configRef = doc(db, 'systemSettings', 'globalConfig');
      const unsub = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          setSystemGlobalConfig({ ...DEFAULT_GLOBAL_CONFIG, ...(snap.data() as any) });
        }
      }, (err) => {
        console.warn('Global config listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Global config init notice:', e);
    }
  }, []);

  // Listen to Admin Homepage Customization in Real-time
  useEffect(() => {
    try {
      const homeDocRef = doc(db, 'systemSettings', 'homeCustomization');
      const unsub = onSnapshot(homeDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const merged: AdminHomeCustomConfig = {
            ...DEFAULT_HOME_CUSTOM_CONFIG,
            ...(data as any),
          };
          setHomeCustomConfig(merged);
          localStorage.setItem('haevy_home_custom_config', JSON.stringify(merged));
        } else {
          setHomeCustomConfig(DEFAULT_HOME_CUSTOM_CONFIG);
          localStorage.removeItem('haevy_home_custom_config');
        }
      }, (err) => {
        console.warn('Home customization listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Home customization init notice:', e);
    }
  }, []);

  // Listen to Ecosystem Upcoming & Live Events in Real-time
  useEffect(() => {
    try {
      const q = query(collection(db, 'systemEvents'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const list: HaevyUpcomingEvent[] = [];
            snap.forEach((d) => {
              list.push({ id: d.id, ...(d.data() as any) });
            });
            list.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              if ((b.priorityOrder || 0) !== (a.priorityOrder || 0)) {
                return (b.priorityOrder || 0) - (a.priorityOrder || 0);
              }
              return new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime();
            });
            setUpcomingEvents(list);
            localStorage.setItem('haevy_upcoming_events_cache', JSON.stringify(list));
          } else {
            setUpcomingEvents(DEFAULT_UPCOMING_EVENTS);
          }
        },
        (err) => {
          console.warn('System events listener note:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('System events init notice:', e);
    }
  }, []);

  // Login or Activate Anonymous Account (Full rights except Studio, destroyed on logout)
  const loginAsAnonymous = async (passCode?: string): Promise<{ success: boolean; message: string; guestId: string }> => {
    const cleanCode = (passCode || '').trim().toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const guestId = `ANON-${randomNum}`;
    const anonUid = `anon-${Date.now()}-${randomNum}`;

    let durationDays = 0;
    let isVipActive = false;
    let bonusPoints = 50; // Starter points for anonymous user
    let perkMessage = 'Tài khoản Trắng cơ bản';
    let passType: '3_digit_month' | '1_week' = '1_week';

    if (cleanCode) {
      const is3Digits = /^\d{3}$/.test(cleanCode);
      let passDays = is3Digits ? 30 : 7;
      passType = is3Digits ? '3_digit_month' : '1_week';

      try {
        const passesRef = collection(db, 'anonymousPasses');
        const q = query(passesRef, where('passCode', '==', cleanCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const passDoc = snap.docs[0];
          const passData = passDoc.data();
          passDays = passData.durationDays || (passData.type === '3_digit_month' ? 30 : 7);
          passType = passData.type || (passDays >= 30 ? '3_digit_month' : '1_week');
          await updateDoc(doc(db, 'anonymousPasses', passDoc.id), {
            usedCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn('Pass check notice:', e);
      }

      isVipActive = true;
      durationDays = passDays;
      bonusPoints = 150;
      perkMessage = `Đặc quyền VIP (${durationDays} ngày) & +150 Điểm`;
    }

    const now = new Date();
    const expiresDate = isVipActive ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;

    const anonymousUser: CustomAuthUser = {
      uid: anonUid,
      email: null,
      displayName: `Khách Ẩn Danh #${randomNum}`,
      photoURL: null,
      isLocalSession: true,
      isAnonymous: true,
    };

    const anonSession: AnonymousVipSession = {
      isActive: isVipActive,
      guestId,
      passCode: cleanCode || `BLANK-${randomNum}`,
      durationDays,
      activatedAt: now.toISOString(),
      expiresAt: expiresDate ? expiresDate.toISOString() : '',
      type: passType,
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(anonymousUser));
    if (isVipActive) {
      localStorage.setItem(ANON_SESSION_KEY, JSON.stringify(anonSession));
      setAnonymousVipSession(anonSession);
    } else {
      localStorage.removeItem(ANON_SESSION_KEY);
      setAnonymousVipSession(null);
    }

    setUser(anonymousUser);
    setAccountId(guestId);
    setRole('user');
    setAudioPoints(bonusPoints);
    setTotalEarnedPoints(bonusPoints);
    setTotalListenedMinutes(0);
    setFavorites([]);
    setIsAuthorVerified(false);
    setAuthorStatus('none');

    if (isVipActive && expiresDate) {
      setVipTier('vip');
      setVipExpiresAt(expiresDate.toISOString());
    } else {
      setVipTier('free');
      setVipExpiresAt(null);
    }

    return {
      success: true,
      message: `Đăng nhập Ẩn danh [${guestId}] thành công! ${perkMessage}. Khi đăng xuất, tài khoản này sẽ tự động hủy hoàn toàn.`,
      guestId,
    };
  };

  // Activate Anonymous VIP Pass without Login (bridges to loginAsAnonymous)
  const activateAnonymousPass = async (code: string): Promise<{ success: boolean; message: string; durationDays: number; type: '3_digit_month' | '1_week' }> => {
    const res = await loginAsAnonymous(code);
    const cleanCode = code.trim().toUpperCase();
    const is3Digits = /^\d{3}$/.test(cleanCode);
    const durationDays = is3Digits ? 30 : 7;
    return {
      success: res.success,
      message: res.message,
      durationDays,
      type: is3Digits ? '3_digit_month' : '1_week',
    };
  };

  const clearAnonymousVipSession = () => {
    localStorage.removeItem(ANON_SESSION_KEY);
    setAnonymousVipSession(null);
  };

  // Create a completely new Blank Anonymous Account (Trắng thông tin)
  const createBlankAnonymousAccount = (): { guestId: string; message: string } => {
    const randomGuestNum = Math.floor(1000 + Math.random() * 9000);
    const guestId = `ANON-${randomGuestNum}`;
    loginAsAnonymous();
    return {
      guestId,
      message: `Đã đăng nhập tài khoản Ẩn Danh mới [${guestId}] trắng thông tin thành công! Bạn có đầy đủ quyền lợi nghe nhạc, bình luận, tích điểm (trừ Studio). Khi đăng xuất, tài khoản sẽ tự động xóa.`,
    };
  };

  // Redeem Referral Code (6-character alphanumeric uppercase code with 100 uses limit)
  const redeemReferralCode = async (code: string): Promise<{ success: boolean; message: string; pointsAwarded?: number; daysAwarded?: number }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Vui lòng nhập mã giới thiệu 6 ký tự.' };
    }

    if (cleanCode.length !== 6) {
      return { success: false, message: 'Mã giới thiệu hợp lệ phải gồm đúng 6 ký tự (chữ hoa và số).' };
    }

    if (!user) {
      // If not logged in, offer to activate anonymous pass or prompt login
      return { success: false, message: 'Vui lòng đăng nhập để nhận thưởng Điểm Audio và ngày VIP từ mã giới thiệu!' };
    }

    try {
      const codesRef = collection(db, 'referralCodes');
      const q = query(codesRef, where('code', '==', cleanCode));
      const snap = await getDocs(q);

      let rewardPoints = 200;
      let rewardVipDays = 7;
      let targetDocId: string | null = null;

      if (!snap.empty) {
        const codeDoc = snap.docs[0];
        const data = codeDoc.data();

        if (data.isActive === false) {
          return { success: false, message: 'Mã giới thiệu này hiện đang tạm khóa hoặc đã hết hạn.' };
        }

        const maxUses = typeof data.maxUses === 'number' ? data.maxUses : 100;
        const usedCount = typeof data.usedCount === 'number' ? data.usedCount : 0;
        const usedByUids: string[] = Array.isArray(data.usedByUids) ? data.usedByUids : [];

        if (usedCount >= maxUses) {
          return { success: false, message: `Mã giới thiệu này đã đạt tối đa ${maxUses} lượt nhập!` };
        }

        if (usedByUids.includes(user.uid)) {
          return { success: false, message: 'Bạn đã từng sử dụng mã giới thiệu này trước đây rồi.' };
        }

        rewardPoints = data.rewardPoints || 200;
        rewardVipDays = data.rewardVipDays || 7;
        targetDocId = codeDoc.id;

        // Record usage
        await updateDoc(doc(db, 'referralCodes', targetDocId), {
          usedCount: increment(1),
          usedByUids: arrayUnion(user.uid),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Fallback default built-in seed codes like VIP100, KHA782, VN2026, AUD100
        const builtInValid = ['VIP100', 'KHA782', 'VN2026', 'AUD100', 'PRO100', 'LUCKY6'].includes(cleanCode);
        if (!builtInValid) {
          return { success: false, message: 'Mã giới thiệu không tồn tại hoặc không chính xác.' };
        }
      }

      // Award points and VIP days to user
      let baseTime = Date.now();
      if (vipExpiresAt && new Date(vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + rewardVipDays * 24 * 60 * 60 * 1000).toISOString();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(rewardPoints),
          totalEarnedPoints: increment(rewardPoints),
          vipTier: 'vip',
          vipExpiresAt: newExpiresAt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Log point transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `Nhập mã giới thiệu [${cleanCode}] (+${rewardVipDays} ngày VIP)`,
        amount: rewardPoints,
        type: 'bonus',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Kích hoạt thành công mã giới thiệu [${cleanCode}]! Bạn nhận được +${rewardPoints} Điểm Audio và +${rewardVipDays} ngày VIP.`,
        pointsAwarded: rewardPoints,
        daysAwarded: rewardVipDays,
      };
    } catch (err: any) {
      console.error('Error redeeming referral code:', err);
      return { success: false, message: 'Không thể xử lý mã giới thiệu. Vui lòng thử lại.' };
    }
  };

  // Author Verification: Submit profile for approval (Email, Phone, CCCD, Face photo)
  const submitAuthorVerification = async (data: {
    fullName: string;
    stageName: string;
    email: string;
    phoneNumber: string;
    idCardNumber: string;
    idCardIssueDate: string;
    idCardFrontUrl: string;
    idCardBackUrl: string;
    facePhotoUrl: string;
    musicGenre: string;
    bio: string;
    socialLink?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để gửi hồ sơ xác minh tác giả.' };
    }

    try {
      const verifRef = doc(db, 'authorVerifications', user.uid);
      const isOwnerAdmin = user.email?.toLowerCase() === 'kha78228@gmail.com';
      const initialStatus: AuthorVerificationStatus = isOwnerAdmin ? 'verified' : 'pending';

      const verifPayload: AuthorVerification = {
        id: user.uid,
        userId: user.uid,
        fullName: data.fullName.trim(),
        stageName: data.stageName.trim(),
        email: data.email.trim(),
        emailVerified: true,
        phoneNumber: data.phoneNumber.trim(),
        phoneVerified: true,
        idCardNumber: data.idCardNumber.trim(),
        idCardIssueDate: data.idCardIssueDate.trim(),
        idCardFrontUrl: data.idCardFrontUrl,
        idCardBackUrl: data.idCardBackUrl,
        facePhotoUrl: data.facePhotoUrl,
        musicGenre: data.musicGenre,
        bio: data.bio.trim(),
        socialLink: data.socialLink?.trim() || '',
        status: initialStatus,
        submittedAt: serverTimestamp(),
        reviewedAt: isOwnerAdmin ? serverTimestamp() : null,
        reviewedBy: isOwnerAdmin ? 'auto_admin' : '',
      };

      await setDoc(verifRef, verifPayload);

      // Update user doc
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          authorStatus: initialStatus,
          isAuthorVerified: isOwnerAdmin ? true : false,
          authorStageName: data.stageName.trim(),
          authorBio: data.bio.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Bonus points for submitting eKYC verification
      await addAudioPoints(100, 'Thưởng gửi hồ sơ xác minh tác giả eKYC', 'bonus');

      return {
        success: true,
        message: isOwnerAdmin 
          ? 'Hồ sơ tác giả của Quản trị viên đã được xác minh tự động thành công!' 
          : 'Hồ sơ xác minh tác giả đã gửi thành công! Quản trị viên sẽ kiểm tra CCCD, SĐT, Email và Khuôn mặt để duyệt trong vòng 24h.',
      };
    } catch (err: any) {
      console.error('Error submitting author verification:', err);
      return { success: false, message: 'Lỗi khi gửi hồ sơ xác minh. Vui lòng thử lại.' };
    }
  };

  // Author: Publish Audio Track
  const publishAuthorTrack = async (trackData: {
    title: string;
    artist?: string;
    genre: string;
    url: string;
    coverUrl: string;
    durationSec?: number;
    isVipOnly?: boolean;
    bitrate?: string;
    description?: string;
    lyrics?: string;
    isSeries?: boolean;
    seriesId?: string;
    seriesTitle?: string;
    episodeNumber?: number;
    episodeTitle?: string;
    totalEpisodes?: number;
    storylineSummary?: string;
  }): Promise<{ success: boolean; message: string; trackId?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để đăng tác phẩm Audio.' };
    }

    try {
      const isVerified = isAuthorVerified || isAdmin;
      const cleanTitle = trackData.title.trim();
      const cleanArtist = (trackData.artist || authorStageName || user.displayName || 'Tác giả').trim();
      const coverUrl = trackData.coverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
      const isVipOnly = Boolean(trackData.isVipOnly);
      const bitrate = trackData.bitrate || (isVipOnly ? 'Lossless 24-bit/96kHz (Đặc quyền VIP)' : '320kbps Hi-Fi');

      let finalAudioUrl = trackData.url.trim();

      // Persist blob: audio URLs to permanent server disk storage so audio plays across sessions and page reloads
      if (finalAudioUrl.startsWith('blob:')) {
        try {
          const blobRes = await fetch(finalAudioUrl);
          const blobData = await blobRes.blob();
          const arrayBuffer = await blobData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as unknown as number[]);
          }
          const base64 = btoa(binary);
          const uploadRes = await fetch('/api/audio/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              fileName: `publish-${cleanTitle.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.wav`,
              format: 'wav',
            }),
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data.audioUrl) {
              finalAudioUrl = data.audioUrl;
            }
          }
        } catch (uploadErr) {
          console.warn('Could not persist audio blob to server disk, keeping current URL:', uploadErr);
        }
      }

      const payload: Record<string, any> = {
        title: cleanTitle,
        artist: cleanArtist,
        genre: trackData.genre || 'Khác',
        url: finalAudioUrl,
        coverUrl,
        durationSec: trackData.durationSec || 210,
        plays: 0,
        likesCount: 0,
        isVipOnly,
        bitrate,
        description: trackData.description?.trim() || '',
        lyrics: trackData.lyrics?.trim() || '',
        isAuthorVerified: isVerified,
        stageName: authorStageName || cleanArtist,
        addedBy: user.uid,
        addedByName: user.displayName || cleanArtist,
        status: 'published',
        createdAt: serverTimestamp(),
      };

      if (trackData.isSeries || trackData.seriesTitle || trackData.seriesId) {
        payload.isSeries = true;
        payload.seriesId = trackData.seriesId || `series-${user.uid}-${Date.now()}`;
        payload.seriesTitle = trackData.seriesTitle?.trim() || cleanTitle;
        payload.episodeNumber = trackData.episodeNumber ? Number(trackData.episodeNumber) : 1;
        payload.episodeTitle = trackData.episodeTitle?.trim() || `Tập ${payload.episodeNumber}`;
        if (trackData.totalEpisodes) payload.totalEpisodes = Number(trackData.totalEpisodes);
        if (trackData.storylineSummary) payload.storylineSummary = trackData.storylineSummary.trim();
      }

      const trackDocRef = await addDoc(collection(db, 'customTracks'), payload);

      // Reward audio points for publishing audio!
      await addAudioPoints(50, `Đăng tải tác phẩm: ${cleanTitle}`, 'upload');

      return {
        success: true,
        message: `Đăng tác phẩm "${cleanTitle}" thành công! Bài hát đã được đưa lên Kho Audio và Trang Tác Giả.`,
        trackId: trackDocRef.id,
      };
    } catch (err: any) {
      console.error('Error publishing author track:', err);
      return { success: false, message: 'Lỗi khi đăng Audio lên hệ thống. Vui lòng thử lại.' };
    }
  };

  // Author: Delete Audio Track
  const deleteAuthorTrack = async (trackId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    try {
      const cleanId = trackId.replace('custom-', '');
      await deleteDoc(doc(db, 'customTracks', cleanId));
      return { success: true, message: 'Đã xóa tác phẩm Audio thành công.' };
    } catch (err: any) {
      console.error('Error deleting author track:', err);
      return { success: false, message: 'Lỗi khi xóa bài hát.' };
    }
  };

  // Author & Fans: Send Virtual Gift to Author with Audio Points
  const sendGiftToAuthor = async (params: {
    authorUid: string;
    authorStageName: string;
    giftId: string;
    giftName: string;
    giftIcon: string;
    pointsCost: number;
    message?: string;
    trackId?: string;
    trackTitle?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tặng quà cho tác giả!' };
    }

    if (audioPoints < params.pointsCost) {
      return { 
        success: false, 
        message: `Bạn không đủ Điểm Audio (cần ${params.pointsCost.toLocaleString()} pts, hiện có ${audioPoints.toLocaleString()} pts). Hãy nghe nhạc tích lũy thêm điểm hoặc nạp gói VIP!` 
      };
    }

    try {
      // 1. Deduct points from sender state & database
      const newSenderPoints = Math.max(0, audioPoints - params.pointsCost);
      setAudioPoints(newSenderPoints);

      const senderRef = doc(db, 'users', user.uid);
      await setDoc(senderRef, {
        audioPoints: increment(-params.pointsCost),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 2. Add points transaction record for sender
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `Tặng ${params.giftIcon} ${params.giftName} cho tác giả "${params.authorStageName}"`,
        amount: -params.pointsCost,
        type: 'gift_author',
        createdAt: serverTimestamp(),
      });

      // 3. Award points to author (if valid user ID and not self)
      if (params.authorUid && params.authorUid !== user.uid && params.authorUid !== 'chillhop-official') {
        try {
          const authorRef = doc(db, 'users', params.authorUid);
          await setDoc(authorRef, {
            audioPoints: increment(params.pointsCost),
            totalEarnedPoints: increment(params.pointsCost),
            updatedAt: serverTimestamp(),
          }, { merge: true });

          // Log author transaction
          await addDoc(collection(db, 'users', params.authorUid, 'pointTransactions'), {
            title: `Nhận ${params.giftIcon} ${params.giftName} từ ${user.displayName || 'Khán giả'} (+${params.pointsCost} pts)`,
            amount: params.pointsCost,
            type: 'receive_gift',
            createdAt: serverTimestamp(),
          });
        } catch (authErr) {
          console.warn('Could not update remote author points directly:', authErr);
        }
      }

      // 4. Record global donation gift event in Firestore
      await addDoc(collection(db, 'giftDonations'), {
        senderUid: user.uid,
        senderName: user.displayName || 'Khán giả yêu nhạc',
        senderAccountId: effectiveAccountId,
        senderPhoto: user.photoURL || '',
        isSenderVip: effectiveIsVip,
        authorUid: params.authorUid || 'author_default',
        authorStageName: params.authorStageName,
        giftId: params.giftId,
        giftName: params.giftName,
        giftIcon: params.giftIcon,
        pointsCost: params.pointsCost,
        message: params.message?.trim() || '',
        trackId: params.trackId || '',
        trackTitle: params.trackTitle || '',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Đã gửi tặng ${params.giftIcon} ${params.giftName} (${params.pointsCost.toLocaleString()} Điểm Audio) thành công đến tác giả ${params.authorStageName}!`,
      };
    } catch (err: any) {
      console.error('Error sending gift to author:', err);
      return { success: false, message: 'Lỗi khi tặng quà: ' + (err.message || 'Vui lòng thử lại sau.') };
    }
  };

  // ADMIN: Approve Author Verification
  const approveAuthorVerification = async (verificationId: string, targetUserId: string, stageName: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền duyệt tác giả.' };
    }

    try {
      const verifRef = doc(db, 'authorVerifications', verificationId);
      await updateDoc(verifRef, {
        status: 'verified',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.email || 'admin',
      });

      const userRef = doc(db, 'users', targetUserId);
      await setDoc(
        userRef,
        {
          isAuthorVerified: true,
          authorStatus: 'verified',
          authorStageName: stageName || 'Tác giả',
          audioPoints: increment(300),
          totalEarnedPoints: increment(300),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add reward transaction
      await addDoc(collection(db, 'users', targetUserId, 'pointTransactions'), {
        title: 'Thưởng 300 pts khi được duyệt Tác Giả Âm Nhạc Chính Thức ✓',
        amount: 300,
        type: 'bonus',
        createdAt: serverTimestamp(),
      });

      return { success: true, message: `Đã phê duyệt xác minh Tác giả chính thức cho ${stageName || targetUserId}!` };
    } catch (err: any) {
      console.error('Error approving author verification:', err);
      return { success: false, message: 'Lỗi khi phê duyệt hồ sơ tác giả.' };
    }
  };

  // ADMIN: Reject Author Verification
  const rejectAuthorVerification = async (verificationId: string, targetUserId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền từ chối hồ sơ.' };
    }

    try {
      const verifRef = doc(db, 'authorVerifications', verificationId);
      await updateDoc(verifRef, {
        status: 'rejected',
        adminNote: reason || 'Thông tin giấy tờ CCCD/khuôn mặt chưa khớp hoặc mờ.',
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.email || 'admin',
      });

      const userRef = doc(db, 'users', targetUserId);
      await setDoc(
        userRef,
        {
          isAuthorVerified: false,
          authorStatus: 'rejected',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true, message: 'Đã từ chối hồ sơ xác minh tác giả kèm lý do phản hồi.' };
    } catch (err: any) {
      console.error('Error rejecting author verification:', err);
      return { success: false, message: 'Lỗi khi từ chối hồ sơ.' };
    }
  };

  // ADMIN: Revoke Author Status
  const revokeAuthorStatus = async (targetUserId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền thu hồi quyền tác giả.' };
    }

    try {
      const userRef = doc(db, 'users', targetUserId);
      await setDoc(
        userRef,
        {
          isAuthorVerified: false,
          authorStatus: 'none',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true, message: 'Đã thu hồi quyền Tác giả của người dùng thành công.' };
    } catch (err: any) {
      console.error('Error revoking author status:', err);
      return { success: false, message: 'Lỗi khi thu hồi quyền tác giả.' };
    }
  };

  // ADMIN: Create 6-character referral code with 100 uses
  const createReferralCode = async (params: {
    code?: string;
    rewardPoints?: number;
    rewardVipDays?: number;
    description?: string;
  }): Promise<{ success: boolean; message: string; code?: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên (Admin) mới có quyền tạo mã giới thiệu.' };
    }

    let code = params.code?.trim().toUpperCase() || '';
    if (!code) {
      // Auto-generate 6-char alphanumeric code (e.g. A9K3X7)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    if (code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
      return { success: false, message: 'Mã giới thiệu phải gồm đúng 6 ký tự chữ hoa hoặc số (Ví dụ: VIP100, A8K9X2).' };
    }

    try {
      const docRef = await addDoc(collection(db, 'referralCodes'), {
        code,
        maxUses: 100,
        usedCount: 0,
        usedByUids: [],
        rewardPoints: params.rewardPoints || 200,
        rewardVipDays: params.rewardVipDays || 7,
        description: params.description || 'Mã giới thiệu đặc quyền VIP',
        createdBy: user?.email || 'admin',
        isActive: true,
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Tạo mã giới thiệu [${code}] thành công với giới hạn 100 lượt nhập!`,
        code,
      };
    } catch (err: any) {
      console.error('Error creating referral code:', err);
      return { success: false, message: 'Lỗi khi tạo mã giới thiệu trong Firestore.' };
    }
  };

  const deleteReferralCode = async (codeId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'referralCodes', codeId));
    } catch (e) {
      console.error('Error deleting referral code:', e);
    }
  };

  // ADMIN: Create Anonymous Pass
  const createAnonymousPass = async (params: {
    passCode: string;
    type: '3_digit_month' | '1_week';
    description?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền tạo mã ẩn danh.' };
    }

    const cleanCode = params.passCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Vui lòng nhập mã code ẩn danh.' };
    }

    const is3Digits = params.type === '3_digit_month' || /^\d{3}$/.test(cleanCode);
    const durationDays = is3Digits ? 30 : 7;
    const type = is3Digits ? '3_digit_month' : '1_week';

    try {
      await addDoc(collection(db, 'anonymousPasses'), {
        passCode: cleanCode,
        type,
        durationDays,
        usedCount: 0,
        isActive: true,
        description: params.description || (is3Digits ? 'Mã 3 số VIP 1 tháng (Không cần login)' : 'Mã VIP 1 tuần (Không cần login)'),
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Đã tạo mã ẩn danh [${cleanCode}] thời hạn ${durationDays} ngày (${is3Digits ? '1 Tháng' : '1 Tuần'}) thành công!`,
      };
    } catch (err: any) {
      console.error('Error creating anonymous pass:', err);
      return { success: false, message: 'Lỗi khi tạo mã ẩn danh.' };
    }
  };

  const deleteAnonymousPass = async (passId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'anonymousPasses', passId));
      await recordSystemAuditLog({
        action: 'CREATE_ANON_PASS',
        actionTitle: 'Xóa mã VIP ẩn danh',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'pass_code',
        targetId: passId,
        details: `Quản trị viên đã xóa mã truy cập ẩn danh [${passId}]`,
        severity: 'warning',
      });
    } catch (e) {
      console.error('Error deleting anonymous pass:', e);
    }
  };

  // ADMIN: Update Target User VIP
  const updateUserVipByAdmin = async (targetUid: string, tier: VipTier, durationDays: number): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền nâng cấp VIP cho người dùng.' };
    }

    try {
      const userRef = doc(db, 'users', targetUid);
      let expiresAt: string | null = null;

      if (tier !== 'free') {
        const baseTime = Date.now();
        expiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();
      }

      await updateDoc(userRef, {
        vipTier: tier,
        vipExpiresAt: expiresAt,
        updatedAt: serverTimestamp(),
      });

      await recordSystemAuditLog({
        action: 'UPDATE_VIP',
        actionTitle: `Cập nhật gói VIP (${tier}) cho người dùng`,
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: `Quản trị viên đã cấp gói VIP [${tier}] với thời hạn ${durationDays} ngày cho tài khoản [${targetUid}]`,
        metadata: { targetUid, tier, durationDays, expiresAt },
        severity: 'warning',
      });

      return {
        success: true,
        message: `Đã cập nhật trạng thái VIP (${tier}) cho người dùng thành công!`,
      };
    } catch (e) {
      console.error('Error updating user VIP by admin:', e);
      return { success: false, message: 'Lỗi khi cập nhật VIP cho người dùng.' };
    }
  };

  // ADMIN: Adjust Target User Audio Points
  const adjustUserPointsByAdmin = async (targetUid: string, pointsDelta: number, reason: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền điều chỉnh điểm.' };
    }

    try {
      const userRef = doc(db, 'users', targetUid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(pointsDelta),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'users', targetUid, 'pointTransactions'), {
        title: `Quản trị viên điều chỉnh: ${reason}`,
        amount: pointsDelta,
        type: 'bonus',
        createdAt: serverTimestamp(),
      });

      await recordSystemAuditLog({
        action: 'ADJUST_POINTS',
        actionTitle: `Điều chỉnh ${pointsDelta > 0 ? '+' : ''}${pointsDelta} Điểm Audio`,
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: `Quản trị viên điều chỉnh ${pointsDelta > 0 ? '+' : ''}${pointsDelta} Điểm Audio cho [${targetUid}]. Lý do: ${reason}`,
        metadata: { targetUid, pointsDelta, reason },
        severity: 'info',
      });

      return {
        success: true,
        message: `Đã điều chỉnh ${pointsDelta > 0 ? '+' : ''}${pointsDelta} Điểm Audio cho tài khoản thành công!`,
      };
    } catch (e) {
      console.error('Error adjusting user points:', e);
      return { success: false, message: 'Lỗi khi điều chỉnh Điểm Audio.' };
    }
  };

  // ADMIN: Delete any community comment
  const deleteCommentByAdmin = async (postId: string, commentId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xóa bình luận này.' };
    }
    try {
      await deleteDoc(doc(db, 'communityPosts', postId, 'comments', commentId));
      await updateDoc(doc(db, 'communityPosts', postId), {
        commentsCount: increment(-1),
      });

      await recordSystemAuditLog({
        action: 'DELETE_COMMENT',
        actionTitle: 'Xóa bình luận vi phạm trực tiếp',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'comment',
        targetId: commentId,
        details: `Quản trị viên đã xóa bình luận [${commentId}] trực tiếp trong bài viết [${postId}]`,
        metadata: { postId, commentId },
        severity: 'danger',
      });

      return { success: true, message: 'Đã xóa bình luận thành công (Quyền Quản Trị).' };
    } catch (e: any) {
      console.error('Error deleting comment by admin:', e);
      return { success: false, message: 'Lỗi khi xóa bình luận: ' + (e.message || '') };
    }
  };

  // ADMIN: Delete any community post
  const deleteCommunityPostByAdmin = async (postId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xóa bài đăng này.' };
    }
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));

      await recordSystemAuditLog({
        action: 'DELETE_POST',
        actionTitle: 'Xóa bài đăng cộng đồng trực tiếp',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'post',
        targetId: postId,
        details: `Quản trị viên đã xóa vĩnh viễn bài đăng cộng đồng [${postId}]`,
        metadata: { postId },
        severity: 'danger',
      });

      return { success: true, message: 'Đã xóa bài đăng cộng đồng thành công (Quyền Quản Trị).' };
    } catch (e: any) {
      console.error('Error deleting post by admin:', e);
      return { success: false, message: 'Lỗi khi xóa bài đăng: ' + (e.message || '') };
    }
  };

  // ADMIN: Pin / Unpin Community Post
  const pinCommunityPostByAdmin = async (postId: string, isPinned: boolean): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền ghim bài đăng.' };
    }
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        isPinned,
        updatedAt: serverTimestamp(),
      });

      await recordSystemAuditLog({
        action: isPinned ? 'PIN_POST' : 'UNPIN_POST',
        actionTitle: isPinned ? 'Ghim bài viết lên đầu trang' : 'Bỏ ghim bài viết',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'post',
        targetId: postId,
        details: isPinned ? `Quản trị viên đã ghim bài viết [${postId}] lên đầu bảng tin` : `Quản trị viên đã bỏ ghim bài viết [${postId}]`,
        metadata: { postId, isPinned },
        severity: 'info',
      });

      return { 
        success: true, 
        message: isPinned ? 'Đã ghim bài viết lên đầu trang cộng đồng!' : 'Đã bỏ ghim bài viết.' 
      };
    } catch (e: any) {
      console.error('Error pinning post by admin:', e);
      return { success: false, message: 'Lỗi khi ghim bài viết: ' + (e.message || '') };
    }
  };

  // ADMIN: Delete any audio track
  const deleteAudioTrackByAdmin = async (trackId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xóa audio.' };
    }
    try {
      const cleanId = trackId.startsWith('custom-') ? trackId.replace('custom-', '') : trackId;
      
      // Try deleting from Firestore customTracks
      try {
        const trackRef = doc(db, 'customTracks', cleanId);
        await deleteDoc(trackRef);
      } catch (errDoc) {
        console.warn('Track doc delete notice:', errDoc);
      }

      // Also register into local hidden tracks so it disappears immediately across sessions
      const savedHidden: string[] = JSON.parse(localStorage.getItem('admin_hidden_tracks') || '[]');
      if (!savedHidden.includes(trackId)) savedHidden.push(trackId);
      if (!savedHidden.includes(cleanId)) savedHidden.push(cleanId);
      localStorage.setItem('admin_hidden_tracks', JSON.stringify(savedHidden));

      await recordSystemAuditLog({
        action: 'DELETE_AUDIO',
        actionTitle: 'Gỡ bỏ và xóa Audio trực tiếp',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'audio_track',
        targetId: trackId,
        details: `Quản trị viên đã gỡ bỏ và xóa bản audio [${trackId}] trực tiếp khỏi kho nhạc`,
        metadata: { trackId },
        severity: 'danger',
      });

      return { success: true, message: 'Đã gỡ bỏ và xóa bản audio khỏi toàn hệ thống (Quyền Admin)!' };
    } catch (e: any) {
      console.error('Error deleting audio track by admin:', e);
      return { success: false, message: 'Lỗi khi xóa track audio: ' + (e.message || '') };
    }
  };

  // ADMIN: Toggle Track VIP Only Status
  const toggleTrackVipStatusByAdmin = async (trackId: string, currentVip: boolean): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền chuyển đổi định dạng VIP.' };
    }
    try {
      const cleanId = trackId.startsWith('custom-') ? trackId.replace('custom-', '') : trackId;
      const initialTrack = INITIAL_TRACKS.find(t => t.id === trackId || t.id === cleanId);
      const trackRef = doc(db, 'customTracks', cleanId);

      const payload: Record<string, any> = {
        isVipOnly: !currentVip,
        bitrate: !currentVip ? 'Lossless 24-bit/96kHz (Đặc quyền VIP)' : '320kbps Hi-Fi',
        updatedAt: serverTimestamp(),
      };

      if (initialTrack) {
        payload.title = initialTrack.title;
        payload.artist = initialTrack.artist;
        payload.genre = initialTrack.genre;
        payload.url = initialTrack.url;
        payload.coverUrl = initialTrack.coverUrl;
        payload.durationSec = initialTrack.durationSec;
        payload.plays = initialTrack.plays;
        if (initialTrack.description) payload.description = initialTrack.description;
        if (initialTrack.stageName) payload.stageName = initialTrack.stageName;
        if (initialTrack.isAuthorVerified !== undefined) payload.isAuthorVerified = initialTrack.isAuthorVerified;
      }

      await setDoc(trackRef, payload, { merge: true });

      await recordSystemAuditLog({
        action: 'TOGGLE_VIP_TRACK',
        actionTitle: !currentVip ? 'Chuyển Audio sang VIP Master' : 'Mở khóa Audio Miễn phí',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'audio_track',
        targetId: trackId,
        details: !currentVip ? `Chuyển bản audio [${trackId}] sang chế độ Độc Quyền VIP Master` : `Mở khóa bài hát [${trackId}] cho tất cả người dùng`,
        metadata: { trackId, isVipOnly: !currentVip },
        severity: 'warning',
      });

      return { 
        success: true, 
        message: !currentVip ? 'Đã chuyển bản thu sang chế độ Độc Quyền VIP Master!' : 'Đã mở khóa miễn phí cho tất cả thành viên.' 
      };
    } catch (e: any) {
      console.error('Error updating track VIP by admin:', e);
      return { success: false, message: 'Lỗi khi cập nhật trạng thái VIP: ' + (e.message || '') };
    }
  };

  // ADMIN: Ban / Unban User Account
  const banUserAccountByAdmin = async (targetUid: string, isBanned: boolean, reason: string = 'Vi phạm tiêu chuẩn cộng đồng'): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xử lý tài khoản.' };
    }
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        isBanned,
        bannedReason: isBanned ? reason : null,
        bannedAt: isBanned ? new Date().toISOString() : null,
        updatedAt: serverTimestamp(),
      });

      await recordSystemAuditLog({
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        actionTitle: isBanned ? 'Khóa và cấm tài khoản' : 'Mở khóa tài khoản',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: isBanned ? `Khóa tài khoản [${targetUid}]. Lý do: ${reason}` : `Mở khóa cho tài khoản [${targetUid}]`,
        metadata: { targetUid, isBanned, reason },
        severity: 'critical',
      });

      return {
        success: true,
        message: isBanned 
          ? `Đã khóa và cấm tài khoản (${reason}) thành công!` 
          : 'Đã mở khóa tài khoản người dùng thành công!',
      };
    } catch (e: any) {
      console.error('Error banning user account by admin:', e);
      return { success: false, message: 'Lỗi khi cập nhật tài khoản: ' + (e.message || '') };
    }
  };

  // ADMIN: Assign Sub-Admin / Moderator
  const assignSubAdmin = async (
    targetUid: string, 
    newRole: AdminRole, 
    permissions: SubAdminPermissions
  ): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      return { success: false, message: 'Chỉ Tổng Quản Trị (Super Admin) mới có quyền bổ nhiệm Phó Admin / Quản trị viên phụ.' };
    }
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        role: newRole,
        subAdminPermissions: permissions,
        assignedBy: user?.email || user?.uid || 'super_admin',
        assignedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });

      // Also ensure admins collection record for security rules
      try {
        if (newRole === 'sub_admin' || newRole === 'moderator' || (newRole as string) === 'admin') {
          await setDoc(doc(db, 'admins', targetUid), {
            role: newRole,
            assignedAt: serverTimestamp(),
            assignedBy: user?.email || 'super_admin'
          }, { merge: true });
        }
      } catch (adminDocErr) {
        console.warn('Admins collection sync notice:', adminDocErr);
      }

      await recordSystemAuditLog({
        action: 'UPDATE_VIP',
        actionTitle: 'Bổ nhiệm Phó Admin / Ban Quản Trị',
        actorId: user?.uid || 'super_admin',
        actorName: user?.displayName || user?.email || 'Tổng Quản Trị',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: `Bổ nhiệm thành viên [${targetUid}] làm [${newRole.toUpperCase()}]. Quyền: ${JSON.stringify(permissions)}`,
        metadata: { targetUid, newRole, permissions },
        severity: 'danger',
      });

      return {
        success: true,
        message: `Đã bổ nhiệm thành công vai trò ${newRole === 'sub_admin' ? 'Phó Admin (Quản trị viên phụ)' : newRole === 'moderator' ? 'Kiểm Duyệt Viên' : 'Quản Trị Viên'}!`,
      };
    } catch (e: any) {
      console.error('Error assigning sub-admin:', e);
      return { success: false, message: 'Lỗi khi phân quyền Phó Admin: ' + (e.message || '') };
    }
  };

  // ADMIN: Revoke Sub-Admin
  const revokeSubAdmin = async (targetUid: string): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      return { success: false, message: 'Chỉ Tổng Quản Trị (Super Admin) mới có quyền bãi nhiệm Phó Admin.' };
    }
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        role: 'user',
        subAdminPermissions: null,
        updatedAt: serverTimestamp(),
      });

      try {
        await deleteDoc(doc(db, 'admins', targetUid));
      } catch (err) {
        console.warn('Admin doc removal notice:', err);
      }

      await recordSystemAuditLog({
        action: 'UPDATE_VIP',
        actionTitle: 'Bãi nhiệm quyền Quản trị viên phụ',
        actorId: user?.uid || 'super_admin',
        actorName: user?.displayName || user?.email || 'Tổng Quản Trị',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: `Bãi nhiệm quyền Quản trị viên của tài khoản [${targetUid}], chuyển về Thành viên Thường`,
        metadata: { targetUid },
        severity: 'danger',
      });

      return { success: true, message: 'Đã bãi nhiệm quyền Quản trị viên phụ thành công!' };
    } catch (e: any) {
      console.error('Error revoking sub-admin:', e);
      return { success: false, message: 'Lỗi khi bãi nhiệm: ' + (e.message || '') };
    }
  };

  // ADMIN: Update Sub-Admin Permissions
  const updateSubAdminPermissions = async (targetUid: string, permissions: SubAdminPermissions): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      return { success: false, message: 'Chỉ Tổng Quản Trị mới có quyền cập nhật quyền hạn Phó Admin.' };
    }
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        subAdminPermissions: permissions,
        updatedAt: serverTimestamp(),
      });

      await recordSystemAuditLog({
        action: 'UPDATE_VIP',
        actionTitle: 'Cập nhật phân quyền Phó Admin',
        actorId: user?.uid || 'super_admin',
        actorName: user?.displayName || user?.email || 'Tổng Quản Trị',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        targetId: targetUid,
        details: `Cập nhật phân quyền chi tiết cho Phó Admin [${targetUid}]: ${JSON.stringify(permissions)}`,
        metadata: { targetUid, permissions },
        severity: 'warning',
      });

      return { success: true, message: 'Đã cập nhật phân quyền Phó Admin thành công!' };
    } catch (e: any) {
      console.error('Error updating sub-admin permissions:', e);
      return { success: false, message: 'Lỗi khi cập nhật quyền: ' + (e.message || '') };
    }
  };

  // ADMIN: Create System Announcement
  const createSystemAnnouncement = async (data: {
    title: string;
    content: string;
    type: 'info' | 'event' | 'urgent' | 'maintenance';
    targetAudience: 'all' | 'vip' | 'authors';
    isPinned?: boolean;
    durationHours?: number;
  }): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền phát thông báo toàn sàn.' };
    }
    try {
      const expiresAt = data.durationHours 
        ? new Date(Date.now() + data.durationHours * 3600000).toISOString()
        : null;

      await addDoc(collection(db, 'systemAnnouncements'), {
        title: data.title,
        content: data.content,
        type: data.type,
        targetAudience: data.targetAudience || 'all',
        isPinned: Boolean(data.isPinned),
        isActive: true,
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Ban Quản Trị',
        createdAt: serverTimestamp(),
        expiresAt,
      });

      await recordSystemAuditLog({
        action: 'PIN_POST',
        actionTitle: 'Phát thông báo toàn hệ thống',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Ban Quản Trị',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'post',
        details: `Phát thông báo [${data.type.toUpperCase()}]: "${data.title}" tới đối tượng [${data.targetAudience}]`,
        metadata: { title: data.title, type: data.type, targetAudience: data.targetAudience },
        severity: data.type === 'urgent' || data.type === 'maintenance' ? 'critical' : 'info',
      });

      return { success: true, message: 'Đã phát thông báo toàn hệ thống thành công!' };
    } catch (e: any) {
      console.error('Error creating announcement:', e);
      return { success: false, message: 'Lỗi khi tạo thông báo: ' + (e.message || '') };
    }
  };

  // ADMIN: Delete System Announcement
  const deleteSystemAnnouncement = async (announcementId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xóa thông báo.' };
    }
    try {
      await deleteDoc(doc(db, 'systemAnnouncements', announcementId));
      return { success: true, message: 'Đã xóa thông báo hệ thống!' };
    } catch (e: any) {
      return { success: false, message: 'Lỗi khi xóa thông báo: ' + (e.message || '') };
    }
  };

  // ADMIN: Toggle Pin Announcement
  const togglePinAnnouncement = async (announcementId: string, isPinned: boolean): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền ghim thông báo.' };
    }
    try {
      await updateDoc(doc(db, 'systemAnnouncements', announcementId), {
        isPinned,
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: isPinned ? 'Đã ghim thông báo!' : 'Đã bỏ ghim thông báo.' };
    } catch (e: any) {
      return { success: false, message: 'Lỗi khi ghim thông báo: ' + (e.message || '') };
    }
  };

  // ADMIN: Update Global System Settings & Maintenance Mode
  const updateSystemGlobalConfig = async (configUpdate: Partial<SystemGlobalConfig>): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền thay đổi cấu hình hệ thống.' };
    }
    try {
      const configRef = doc(db, 'systemSettings', 'globalConfig');
      const newConfig = {
        ...systemGlobalConfig,
        ...configUpdate,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || user?.uid || 'admin',
      };
      await setDoc(configRef, newConfig, { merge: true });
      setSystemGlobalConfig(newConfig as SystemGlobalConfig);

      await recordSystemAuditLog({
        action: 'UPDATE_VIP',
        actionTitle: 'Cập nhật Cấu hình Tham số Hệ thống',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        details: `Cập nhật cấu hình hệ thống: ${JSON.stringify(configUpdate)}`,
        metadata: { configUpdate },
        severity: 'danger',
      });

      return { success: true, message: 'Đã cập nhật cấu hình hệ thống thành công!' };
    } catch (e: any) {
      console.error('Error updating system config:', e);
      return { success: false, message: 'Lỗi khi cập nhật cấu hình: ' + (e.message || '') };
    }
  };

  // ADMIN: Update Homepage Customization Layout
  const updateHomeCustomConfig = async (
    configUpdate: Partial<AdminHomeCustomConfig>
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên Haevy mới có quyền chỉnh sửa Trang Chủ.' };
    }
    try {
      const homeDocRef = doc(db, 'systemSettings', 'homeCustomization');
      const currentVersion = homeCustomConfig.version || 1;
      const payload: Partial<AdminHomeCustomConfig> = {
        ...configUpdate,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'admin',
        updatedByName: user?.displayName || user?.email || 'Haevy Admin',
        version: currentVersion + 1,
      };

      await setDoc(homeDocRef, payload, { merge: true });
      const merged = { ...homeCustomConfig, ...payload };
      setHomeCustomConfig(merged as AdminHomeCustomConfig);
      localStorage.setItem('haevy_home_custom_config', JSON.stringify(merged));

      await recordSystemAuditLog({
        action: 'UPDATE_HOME_LAYOUT',
        actionTitle: 'Tùy biến Giao diện Trang Chủ Haevy Audio',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'home_customization',
        details: `Cập nhật cấu hình Trang Chủ: Đối tượng = ${configUpdate.targetAudience || homeCustomConfig.targetAudience}, Bật = ${configUpdate.isEnabled !== undefined ? configUpdate.isEnabled : homeCustomConfig.isEnabled}`,
        metadata: { configUpdate },
        severity: 'warning',
      });

      return { success: true, message: 'Đã lưu và áp dụng giao diện Trang Chủ thành công!' };
    } catch (e: any) {
      console.error('Error updating home custom config:', e);
      return { success: false, message: 'Lỗi khi lưu giao diện Trang Chủ: ' + (e.message || '') };
    }
  };

  // ADMIN: Reset Homepage Customization to Default
  const resetHomeCustomConfig = async (): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền thiết lập lại.' };
    }
    try {
      const homeDocRef = doc(db, 'systemSettings', 'homeCustomization');
      await setDoc(homeDocRef, {
        ...DEFAULT_HOME_CUSTOM_CONFIG,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'admin',
        updatedByName: user?.displayName || user?.email || 'Haevy Admin',
        version: 1,
      });

      setHomeCustomConfig(DEFAULT_HOME_CUSTOM_CONFIG);
      localStorage.removeItem('haevy_home_custom_config');

      await recordSystemAuditLog({
        action: 'UPDATE_HOME_LAYOUT',
        actionTitle: 'Khôi phục Giao diện Trang Chủ mặc định',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'home_customization',
        details: 'Khôi phục toàn bộ giao diện Trang Chủ về trạng thái nguyên bản của hệ thống.',
        severity: 'info',
      });

      return { success: true, message: 'Đã khôi phục Trang Chủ về giao diện mặc định!' };
    } catch (e: any) {
      console.error('Error resetting home custom config:', e);
      return { success: false, message: 'Lỗi khi đặt lại: ' + (e.message || '') };
    }
  };

  // ADMIN: Create Upcoming / Live Event
  const createUpcomingEvent = async (
    eventData: Partial<HaevyUpcomingEvent>
  ): Promise<{ success: boolean; message: string; eventId?: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền tạo và tùy biến sự kiện.' };
    }
    try {
      const payload: Partial<HaevyUpcomingEvent> = {
        title: eventData.title || 'Sự kiện Mới Hệ Sinh Thái Haevy',
        subtitle: eventData.subtitle || '',
        description: eventData.description || '',
        badge: eventData.badge || 'SẮP DIỄN RA',
        category: eventData.category || 'music',
        theme: eventData.theme || 'gold_luxury',
        customGradientFrom: eventData.customGradientFrom || '#fbbf24',
        customGradientTo: eventData.customGradientTo || '#f59e0b',
        customBorderColor: eventData.customBorderColor || '',
        customTextColor: eventData.customTextColor || '',
        bannerImageUrl: eventData.bannerImageUrl || '',
        iconName: eventData.iconName || 'sparkles',
        startAt: eventData.startAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endAt: eventData.endAt || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        countdownEnabled: eventData.countdownEnabled !== undefined ? eventData.countdownEnabled : true,
        status: eventData.status || 'upcoming',
        ctaText: eventData.ctaText || 'Tham Gia Ngay',
        ctaAction: eventData.ctaAction || 'mode_portal',
        ctaUrl: eventData.ctaUrl || '',
        rewardCoins: eventData.rewardCoins || 0,
        rewardBadgeText: eventData.rewardBadgeText || '',
        targetAudience: eventData.targetAudience || 'all',
        targetAccountIds: eventData.targetAccountIds || [],
        displayLocations: eventData.displayLocations || ['portal', 'audio_home'],
        isPinned: eventData.isPinned || false,
        priorityOrder: eventData.priorityOrder || 50,
        viewCount: 0,
        joinedCount: 0,
        registeredUserIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Haevy Admin',
      };

      const docRef = await addDoc(collection(db, 'systemEvents'), payload);

      await recordSystemAuditLog({
        action: 'UPDATE_HOME_LAYOUT',
        actionTitle: 'Tạo Sự Kiện Mới Trong Hệ Sinh Thái',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'home_customization',
        targetId: docRef.id,
        targetName: payload.title,
        details: `Đã tạo sự kiện "${payload.title}" (${payload.category}) bắt đầu lúc ${new Date(payload.startAt!).toLocaleString('vi-VN')}.`,
        severity: 'info',
      });

      return {
        success: true,
        message: `Đã tạo thành công sự kiện "${payload.title}"! Giao diện đã được xuất bản và đồng bộ toàn hệ sinh thái.`,
        eventId: docRef.id,
      };
    } catch (e: any) {
      console.error('Error creating upcoming event:', e);
      return { success: false, message: 'Lỗi khi tạo sự kiện: ' + (e.message || '') };
    }
  };

  // ADMIN: Update Upcoming / Live Event
  const updateUpcomingEvent = async (
    eventId: string,
    eventData: Partial<HaevyUpcomingEvent>
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền chỉnh sửa sự kiện.' };
    }
    try {
      const payload = {
        ...eventData,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'systemEvents', eventId), payload, { merge: true });

      await recordSystemAuditLog({
        action: 'UPDATE_HOME_LAYOUT',
        actionTitle: 'Cập nhật Tùy Biến Giao Diện Sự Kiện',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'home_customization',
        targetId: eventId,
        targetName: eventData.title || eventId,
        details: `Cập nhật thông số & giao diện sự kiện ID ${eventId}.`,
        severity: 'info',
      });

      return { success: true, message: 'Đã cập nhật tùy biến giao diện sự kiện thành công!' };
    } catch (e: any) {
      console.error('Error updating upcoming event:', e);
      return { success: false, message: 'Lỗi khi cập nhật sự kiện: ' + (e.message || '') };
    }
  };

  // ADMIN: Delete Upcoming Event
  const deleteUpcomingEvent = async (eventId: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền xóa sự kiện.' };
    }
    try {
      await deleteDoc(doc(db, 'systemEvents', eventId));

      await recordSystemAuditLog({
        action: 'UPDATE_HOME_LAYOUT',
        actionTitle: 'Xóa Sự Kiện Hệ Sinh Thái',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'home_customization',
        targetId: eventId,
        details: `Đã xóa sự kiện ID ${eventId} khỏi hệ thống.`,
        severity: 'warning',
      });

      return { success: true, message: 'Đã xóa sự kiện thành công!' };
    } catch (e: any) {
      console.error('Error deleting upcoming event:', e);
      return { success: false, message: 'Lỗi khi xóa sự kiện: ' + (e.message || '') };
    }
  };

  // ADMIN: Toggle Event Pin
  const toggleEventPin = async (eventId: string, isPinned: boolean): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền ghim sự kiện.' };
    }
    try {
      await setDoc(doc(db, 'systemEvents', eventId), {
        isPinned,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return { success: true, message: isPinned ? 'Đã ghim sự kiện lên đầu trang!' : 'Đã bỏ ghim sự kiện.' };
    } catch (e: any) {
      return { success: false, message: 'Lỗi khi ghim sự kiện: ' + (e.message || '') };
    }
  };

  // ADMIN: Toggle Event Status
  const toggleEventStatus = async (eventId: string, status: EventStatus): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền đổi trạng thái.' };
    }
    try {
      await setDoc(doc(db, 'systemEvents', eventId), {
        status,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      const statusLabels: Record<EventStatus, string> = {
        upcoming: 'Sắp diễn ra',
        live: 'Đang diễn ra (Trực tiếp)',
        live_now: 'Đang diễn ra (Trực tiếp)',
        ended: 'Đã kết thúc',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy',
        draft: 'Bản nháp (Ẩn)',
      };
      return { success: true, message: `Đã chuyển trạng thái sự kiện sang: ${statusLabels[status] || status}` };
    } catch (e: any) {
      return { success: false, message: 'Lỗi khi đổi trạng thái: ' + (e.message || '') };
    }
  };

  // USER / MEMBER: Register / RSVP for Event
  const registerForEvent = async (eventId: string): Promise<{ success: boolean; message: string; rewardAwarded?: number }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để đăng ký tham gia sự kiện và nhận quà.' };
    }
    try {
      const eventRef = doc(db, 'systemEvents', eventId);
      const evSnap = await getDoc(eventRef);
      if (!evSnap.exists()) {
        return { success: false, message: 'Sự kiện không tồn tại hoặc đã kết thúc.' };
      }
      const evData = evSnap.data() as HaevyUpcomingEvent;
      const registeredList = evData.registeredUserIds || [];

      if (registeredList.includes(user.uid)) {
        return { success: false, message: 'Bạn đã đăng ký tham gia sự kiện này rồi!' };
      }

      // Add user to registered array and increment joinedCount
      await updateDoc(eventRef, {
        registeredUserIds: arrayUnion(user.uid),
        joinedCount: increment(1),
      });

      // Award bonus coins if event has rewards
      let awarded = 0;
      if (evData.rewardCoins && evData.rewardCoins > 0) {
        awarded = evData.rewardCoins;
        const uRef = doc(db, 'users', user.uid);
        await setDoc(uRef, {
          audioPoints: increment(awarded),
          totalEarnedPoints: increment(awarded),
          updatedAt: serverTimestamp(),
        }, { merge: true });

        await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: `🎁 Quà đăng ký sự kiện: ${evData.title}`,
          amount: awarded,
          type: 'bonus',
          createdAt: serverTimestamp(),
        });
      }

      return {
        success: true,
        message: `Đăng ký thành công sự kiện "${evData.title}"! ${awarded > 0 ? `Nhận ngay +${awarded.toLocaleString()} Xu Haevy.` : 'Hệ thống sẽ nhắc bạn khi sự kiện bắt đầu!'}`,
        rewardAwarded: awarded,
      };
    } catch (e: any) {
      console.error('Error registering for event:', e);
      return { success: false, message: 'Lỗi đăng ký sự kiện: ' + (e.message || '') };
    }
  };

  // USER / MEMBER: Claim Event Reward Coins Directly
  const claimEventReward = async (eventId: string): Promise<{ success: boolean; message: string; rewardAwarded?: number }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để nhận Xu thưởng sự kiện.' };
    }
    try {
      const eventRef = doc(db, 'systemEvents', eventId);
      const evSnap = await getDoc(eventRef);
      let evData: HaevyUpcomingEvent | undefined;
      
      if (evSnap.exists()) {
        evData = { id: evSnap.id, ...(evSnap.data() as any) };
      } else {
        evData = upcomingEvents.find(e => e.id === eventId);
      }

      if (!evData) {
        return { success: false, message: 'Sự kiện không tồn tại hoặc đã kết thúc.' };
      }

      const claimedList = evData.claimedUserIds || [];
      if (claimedList.includes(user.uid)) {
        return { success: false, message: 'Bạn đã nhận phần thưởng của sự kiện này rồi!' };
      }

      const rewardAmount = evData.rewardCoins || 0;
      if (rewardAmount <= 0) {
        return { success: false, message: 'Sự kiện này không có phần thưởng Xu kèm theo.' };
      }

      // Update event document if exists in Firestore
      if (evSnap.exists()) {
        await updateDoc(eventRef, {
          claimedUserIds: arrayUnion(user.uid),
          registeredUserIds: arrayUnion(user.uid),
          joinedCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }

      // Update user coins
      const uRef = doc(db, 'users', user.uid);
      await setDoc(uRef, {
        audioPoints: increment(rewardAmount),
        totalEarnedPoints: increment(rewardAmount),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Record point transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `🎁 Nhận Xu thưởng sự kiện: ${evData.title}`,
        amount: rewardAmount,
        type: 'bonus',
        createdAt: serverTimestamp(),
      });

      // Update local state
      setAudioPoints((prev) => (prev || 0) + rewardAmount);
      setUpcomingEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                claimedUserIds: [...(e.claimedUserIds || []), user.uid],
                registeredUserIds: [...(e.registeredUserIds || []), user.uid],
                joinedCount: (e.joinedCount || 0) + 1,
              }
            : e
        )
      );

      return {
        success: true,
        message: `Chúc mừng bạn đã nhận thành công +${rewardAmount.toLocaleString()} Xu Haevy từ sự kiện "${evData.title}"!`,
        rewardAwarded: rewardAmount,
      };
    } catch (e: any) {
      console.error('Error claiming event reward:', e);
      return { success: false, message: 'Lỗi khi nhận thưởng sự kiện: ' + (e.message || '') };
    }
  };

  // ADMIN: Batch Reward / Compensation for Multiple Users
  const batchRewardUsers = async (
    targetUids: string[], 
    points: number, 
    vipDays: number, 
    reason: string
  ): Promise<{ success: boolean; message: string; count: number }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên mới có quyền tặng quà/đền bù hàng loạt.', count: 0 };
    }
    if (targetUids.length === 0) {
      return { success: false, message: 'Vui lòng chọn ít nhất một người dùng.', count: 0 };
    }
    try {
      let successCount = 0;
      for (const tUid of targetUids) {
        try {
          const uRef = doc(db, 'users', tUid);
          const uSnap = await getDoc(uRef);
          if (!uSnap.exists()) continue;
          const uData = uSnap.data();

          const updateObj: any = {
            updatedAt: serverTimestamp(),
          };

          if (points > 0) {
            updateObj.audioPoints = increment(points);
            updateObj.totalEarnedPoints = increment(points);
            await addDoc(collection(db, 'users', tUid, 'pointTransactions'), {
              title: `Đền bù/Thưởng Admin: ${reason}`,
              amount: points,
              type: 'bonus',
              createdAt: serverTimestamp(),
            });
          }

          if (vipDays > 0) {
            const currentExpiry = uData.vipExpiresAt ? new Date(uData.vipExpiresAt) : new Date();
            const baseTime = currentExpiry.getTime() > Date.now() ? currentExpiry.getTime() : Date.now();
            const newExpiry = new Date(baseTime + vipDays * 86400000).toISOString();
            updateObj.vipTier = 'vip';
            updateObj.vipExpiresAt = newExpiry;
          }

          await updateDoc(uRef, updateObj);
          successCount++;
        } catch (subErr) {
          console.warn('Batch single user err:', subErr);
        }
      }

      await recordSystemAuditLog({
        action: 'ADJUST_POINTS',
        actionTitle: 'Tặng thưởng & Đền bù hàng loạt',
        actorId: user?.uid || 'admin',
        actorName: user?.displayName || user?.email || 'Quản trị viên',
        actorEmail: user?.email || '',
        actorRole: 'admin',
        targetType: 'user',
        details: `Đã tặng ${points} pts & ${vipDays} ngày VIP cho ${successCount} tài khoản. Lý do: ${reason}`,
        metadata: { targetUids, points, vipDays, reason, successCount },
        severity: 'warning',
      });

      return {
        success: true,
        message: `Đã thực hiện tặng thưởng/đền bù thành công cho ${successCount}/${targetUids.length} người dùng!`,
        count: successCount,
      };
    } catch (e: any) {
      console.error('Error in batch reward:', e);
      return { success: false, message: 'Lỗi khi xử lý hàng loạt: ' + (e.message || ''), count: 0 };
    }
  };

  const logSystemActivity = async (params: {
    action: SystemAuditLog['action'];
    actionTitle: string;
    targetType: SystemAuditLog['targetType'];
    targetId?: string;
    targetName?: string;
    details: string;
    metadata?: Record<string, any>;
    severity?: SystemAuditLog['severity'];
  }) => {
    await recordSystemAuditLog({
      action: params.action,
      actionTitle: params.actionTitle,
      actorId: user?.uid || 'guest',
      actorName: user?.displayName || user?.email || 'Người dùng',
      actorEmail: user?.email || '',
      actorRole: isAdmin ? 'admin' : (isAuthorVerified ? 'author' : 'user'),
      targetType: params.targetType,
      targetId: params.targetId,
      targetName: params.targetName,
      details: params.details,
      metadata: params.metadata,
      severity: params.severity || 'info',
    });
  };

  const addAudioPoints = async (amount: number, title: string, type: PointTransaction['type']) => {
    if (!user) return;

    // Apply VIP 3X point multiplier for earning points
    const finalAmount = effectiveIsVip && amount > 0 ? amount * 3 : amount;
    const finalTitle = effectiveIsVip && amount > 0 ? `${title} (x3 Đặc quyền VIP)` : title;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(finalAmount),
          totalEarnedPoints: finalAmount > 0 ? increment(finalAmount) : increment(0),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Record transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: finalTitle,
        amount: finalAmount,
        type,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding audio points:', err);
    }
  };

  const deductAudioPoints = async (
    amount: number,
    title: string,
    type: PointTransaction['type'] = 'tts_synthesis'
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để thực hiện tác vụ này.' };
    }

    if (audioPoints < amount) {
      return {
        success: false,
        message: `Số dư Điểm Audio không đủ (cần ${amount.toLocaleString()} pts, hiện có ${audioPoints.toLocaleString()} pts). Hãy điểm danh, nghe nhạc tích lũy hoặc nạp VIP để nhận thêm điểm!`,
      };
    }

    try {
      const newPoints = Math.max(0, audioPoints - amount);
      setAudioPoints(newPoints);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(-amount),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Record transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title,
        amount: -amount,
        type,
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Đã trừ ${amount.toLocaleString()} Điểm Audio thành công.`,
      };
    } catch (err: any) {
      console.error('Error deducting audio points:', err);
      return {
        success: false,
        message: 'Lỗi khi trừ điểm: ' + (err.message || 'Vui lòng thử lại sau.'),
      };
    }
  };

  const incrementListenTime = async (minutes: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          totalListenedMinutes: increment(minutes),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error incrementing listen time:', err);
    }
  };

  const performDailyCheckin = async (): Promise<{ success: boolean; message: string; pointsAwarded: number }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để điểm danh.', pointsAwarded: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (lastDailyCheckin === todayStr) {
      return { success: false, message: 'Bạn đã điểm danh ngày hôm nay rồi! Hãy quay lại vào ngày mai.', pointsAwarded: 0 };
    }

    const basePoints = 50;
    const pointsAwarded = effectiveIsVip ? basePoints * 3 : basePoints;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          lastDailyCheckin: todayStr,
          audioPoints: increment(pointsAwarded),
          totalEarnedPoints: increment(pointsAwarded),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: effectiveIsVip ? 'Điểm danh hằng ngày (+3x VIP Bonus)' : 'Điểm danh hằng ngày',
        amount: pointsAwarded,
        type: 'checkin',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Điểm danh thành công! Nhận ngay +${pointsAwarded} Điểm Audio${effectiveIsVip ? ' (Đã nhân 3 đặc quyền VIP)' : ''}.`,
        pointsAwarded,
      };
    } catch (err: any) {
      console.error('Error performing daily checkin:', err);
      return { success: false, message: 'Có lỗi xảy ra khi điểm danh.', pointsAwarded: 0 };
    }
  };

  const redeemVipWithPoints = async (
    tier: VipTier,
    durationDays: number,
    pointsCost: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    if (audioPoints < pointsCost) {
      return { 
        success: false, 
        message: `Bạn không đủ Điểm Audio (cần ${pointsCost} điểm, hiện có ${audioPoints} điểm). Hãy nghe nhạc để tích lũy thêm!` 
      };
    }

    try {
      // Calculate new expiration date
      let baseTime = Date.now();
      if (vipExpiresAt && new Date(vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(-pointsCost),
          vipTier: tier,
          vipExpiresAt: newExpiresAt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `Đổi gói VIP ${durationDays} ngày`,
        amount: -pointsCost,
        type: 'redeem_vip',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Chúc mừng bạn đã kích hoạt thành công gói VIP ${durationDays} ngày! Toàn bộ đặc quyền cao cấp đã được mở khóa.`,
      };
    } catch (err: any) {
      console.error('Error redeeming VIP:', err);
      return { success: false, message: 'Đổi đặc quyền VIP thất bại. Vui lòng thử lại.' };
    }
  };

  const purchaseVipPlan = async (params: {
    pkg: VipPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: VipOrder['paymentMethod'];
  }): Promise<{ success: boolean; message: string; orderId?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tiến hành nạp VIP.' };
    }

    try {
      const { pkg, finalAmount, originalAmount, discountAmount, promoCodeApplied, paymentMethod } = params;
      
      // Calculate new expiration date
      let baseTime = Date.now();
      if (vipExpiresAt && new Date(vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + pkg.durationDays * 24 * 60 * 60 * 1000).toISOString();
      const newTier: VipTier = pkg.tier || 'vip';

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          vipTier: newTier,
          vipExpiresAt: newExpiresAt,
          audioPoints: increment(pkg.bonusPoints),
          totalEarnedPoints: increment(pkg.bonusPoints),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add order record
      const orderRef = await addDoc(collection(db, 'users', user.uid, 'vipOrders'), {
        packageId: pkg.id,
        packageName: pkg.name,
        durationDays: pkg.durationDays,
        originalAmount,
        discountAmount,
        finalAmount,
        promoCodeApplied: promoCodeApplied || '',
        paymentMethod,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // Add bonus points transaction if any
      if (pkg.bonusPoints > 0) {
        await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: `Thưởng ${pkg.bonusPoints} pts khi nạp ${pkg.name}`,
          amount: pkg.bonusPoints,
          type: 'bonus',
          createdAt: serverTimestamp(),
        });
      }

      return {
        success: true,
        message: `Kích hoạt thành công ${pkg.name} (${pkg.durationDays} ngày)! Hạn VIP mới đến ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}.`,
        orderId: orderRef.id,
      };
    } catch (err: any) {
      console.error('Error purchasing VIP:', err);
      return {
        success: false,
        message: 'Thanh toán và kích hoạt VIP thất bại. Vui lòng thử lại.',
      };
    }
  };

  const purchasePointsPackage = async (params: {
    pkg: PointTopupPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: PointTopupOrder['paymentMethod'];
  }): Promise<{ success: boolean; message: string; orderId?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tiến hành nạp Xu Audio.' };
    }

    try {
      const { pkg, finalAmount, originalAmount, discountAmount, promoCodeApplied, paymentMethod } = params;
      const totalPointsAwarded = pkg.points + (pkg.bonusPoints || 0);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(totalPointsAwarded),
          totalEarnedPoints: increment(totalPointsAwarded),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add order record
      const orderRef = await addDoc(collection(db, 'users', user.uid, 'pointOrders'), {
        packageId: pkg.id,
        packageName: pkg.name,
        pointsAwarded: totalPointsAwarded,
        originalAmount,
        discountAmount,
        finalAmount,
        promoCodeApplied: promoCodeApplied || '',
        paymentMethod,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // Add points transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `Nạp ${pkg.name} (+${pkg.points} Xu ${pkg.bonusPoints > 0 ? `+${pkg.bonusPoints} Xu thưởng` : ''})`,
        amount: totalPointsAwarded,
        type: 'topup_coins',
        createdAt: serverTimestamp(),
      });

      await logSystemActivity({
        action: 'ADJUST_POINTS',
        actionTitle: 'Nạp Xu Audio Thành Công',
        targetType: 'user',
        targetId: user.uid,
        targetName: user.displayName || user.email || 'Người dùng',
        details: `Nạp ${pkg.name} thanh toán ${finalAmount.toLocaleString()}đ, cộng ${totalPointsAwarded.toLocaleString()} Xu Audio.`,
      });

      return {
        success: true,
        message: `Nạp thành công ${pkg.name}! Nhận ngay +${totalPointsAwarded.toLocaleString()} Xu Haevy vào tài khoản.`,
        orderId: orderRef.id,
      };
    } catch (err: any) {
      console.error('Error purchasing points package:', err);
      return {
        success: false,
        message: 'Thanh toán và nạp Xu Haevy thất bại. Vui lòng thử lại.',
      };
    }
  };

  const giftVipPlanToUser = async (params: {
    recipientIdentifier: string;
    pkg: VipPackage;
    finalAmount: number;
    paymentMethod: VipOrder['paymentMethod'];
    message?: string;
  }): Promise<{ success: boolean; message: string; recipientName?: string; orderId?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tặng gói VIP cho người khác.' };
    }

    const { recipientIdentifier, pkg, finalAmount, paymentMethod, message } = params;
    const cleanId = recipientIdentifier.trim();
    if (!cleanId) {
      return { success: false, message: 'Vui lòng nhập ID Tài khoản hoặc Email người nhận.' };
    }

    try {
      // Find recipient user in Firestore
      let targetUserDoc: any = null;
      let targetUid = '';
      let targetName = 'Bạn bè';

      // 1. Check by Account ID
      const qAccount = query(collection(db, 'users'), where('accountId', '==', cleanId.toUpperCase()));
      const snapAccount = await getDocs(qAccount);
      if (!snapAccount.empty) {
        targetUserDoc = snapAccount.docs[0];
        targetUid = targetUserDoc.id;
        targetName = targetUserDoc.data().displayName || targetUserDoc.data().accountId || 'Bạn bè';
      }

      // 2. Check by Email
      if (!targetUserDoc) {
        const qEmail = query(collection(db, 'users'), where('email', '==', cleanId.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          targetUserDoc = snapEmail.docs[0];
          targetUid = targetUserDoc.id;
          targetName = targetUserDoc.data().displayName || targetUserDoc.data().email || 'Bạn bè';
        }
      }

      // 3. Check by direct UID
      if (!targetUserDoc) {
        const docDirect = await getDoc(doc(db, 'users', cleanId));
        if (docDirect.exists()) {
          targetUserDoc = docDirect;
          targetUid = docDirect.id;
          targetName = docDirect.data().displayName || 'Bạn bè';
        }
      }

      if (!targetUserDoc || !targetUid) {
        return {
          success: false,
          message: `Không tìm thấy tài khoản người nhận với thông tin "${cleanId}". Vui lòng kiểm tra lại ID Tài khoản hoặc Email.`,
        };
      }

      const targetData = targetUserDoc.data() || {};
      let baseTime = Date.now();
      if (targetData.vipExpiresAt && new Date(targetData.vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(targetData.vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + pkg.durationDays * 24 * 60 * 60 * 1000).toISOString();

      // Update recipient's VIP status & bonus points
      const recipientRef = doc(db, 'users', targetUid);
      await setDoc(
        recipientRef,
        {
          vipTier: 'vip',
          vipExpiresAt: newExpiresAt,
          audioPoints: increment(pkg.bonusPoints || 0),
          totalEarnedPoints: increment(pkg.bonusPoints || 0),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add order record in sender's vipOrders
      const senderName = user.displayName || user.email || 'Người gửi ẩn danh';
      const orderRef = await addDoc(collection(db, 'users', user.uid, 'vipOrders'), {
        packageId: pkg.id,
        packageName: `[Tặng quà] ${pkg.name}`,
        durationDays: pkg.durationDays,
        finalAmount,
        originalAmount: finalAmount,
        discountAmount: 0,
        paymentMethod,
        isGift: true,
        recipientUid: targetUid,
        recipientName: targetName,
        recipientIdentifier: cleanId,
        message: message || '',
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // Add notification / transaction to recipient
      await addDoc(collection(db, 'users', targetUid, 'pointTransactions'), {
        title: `🎁 Nhận tặng gói ${pkg.name} (${pkg.durationDays} ngày) từ ${senderName}${message ? `: "${message}"` : ''}`,
        amount: pkg.bonusPoints || 0,
        type: 'receive_vip',
        createdAt: serverTimestamp(),
      });

      // Add transaction to sender
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `🎁 Tặng gói ${pkg.name} (${pkg.durationDays} ngày) cho ${targetName}`,
        amount: 0,
        type: 'gift_vip',
        createdAt: serverTimestamp(),
      });

      await logSystemActivity({
        action: 'UPDATE_VIP',
        actionTitle: 'Tặng Gói VIP Thành Công',
        targetType: 'user',
        targetId: targetUid,
        targetName,
        details: `${senderName} tặng gói ${pkg.name} (${pkg.durationDays} ngày) cho ${targetName} (${cleanId}). Thanh toán ${finalAmount.toLocaleString()}đ.`,
      });

      return {
        success: true,
        message: `Đã tặng thành công gói ${pkg.name} (${pkg.durationDays} ngày) cho "${targetName}"! Hạn VIP của bạn bè đã được kích hoạt đến ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}.`,
        recipientName: targetName,
        orderId: orderRef.id,
      };
    } catch (err: any) {
      console.error('Error gifting VIP plan:', err);
      return {
        success: false,
        message: 'Thao tác tặng gói VIP thất bại. Vui lòng kiểm tra lại kết nối.',
      };
    }
  };

  const transferCoinsToUser = async (params: {
    recipientIdentifier: string;
    amount: number;
    message?: string;
  }): Promise<{ success: boolean; message: string; recipientName?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tặng Xu Haevy.' };
    }

    const { recipientIdentifier, amount, message } = params;
    const cleanId = recipientIdentifier.trim();
    if (!cleanId) {
      return { success: false, message: 'Vui lòng nhập ID Tài khoản hoặc Email người nhận.' };
    }
    if (amount <= 0 || !Number.isInteger(amount)) {
      return { success: false, message: 'Số lượng Xu Haevy tặng phải là số nguyên lớn hơn 0.' };
    }
    if (audioPoints < amount) {
      return {
        success: false,
        message: `Số dư Xu Haevy không đủ (Hiện có ${audioPoints.toLocaleString()} Xu, cần ${amount.toLocaleString()} Xu). Vui lòng nạp thêm Xu Haevy.`,
      };
    }

    try {
      // Find recipient user
      let targetUserDoc: any = null;
      let targetUid = '';
      let targetName = 'Bạn bè';

      // 1. Check by Account ID
      const qAccount = query(collection(db, 'users'), where('accountId', '==', cleanId.toUpperCase()));
      const snapAccount = await getDocs(qAccount);
      if (!snapAccount.empty) {
        targetUserDoc = snapAccount.docs[0];
        targetUid = targetUserDoc.id;
        targetName = targetUserDoc.data().displayName || targetUserDoc.data().accountId || 'Bạn bè';
      }

      // 2. Check by Email
      if (!targetUserDoc) {
        const qEmail = query(collection(db, 'users'), where('email', '==', cleanId.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          targetUserDoc = snapEmail.docs[0];
          targetUid = targetUserDoc.id;
          targetName = targetUserDoc.data().displayName || targetUserDoc.data().email || 'Bạn bè';
        }
      }

      // 3. Check by direct UID
      if (!targetUserDoc) {
        const docDirect = await getDoc(doc(db, 'users', cleanId));
        if (docDirect.exists()) {
          targetUserDoc = docDirect;
          targetUid = docDirect.id;
          targetName = docDirect.data().displayName || 'Bạn bè';
        }
      }

      if (!targetUserDoc || !targetUid) {
        return {
          success: false,
          message: `Không tìm thấy tài khoản người nhận với thông tin "${cleanId}". Vui lòng kiểm tra lại.`,
        };
      }

      if (targetUid === user.uid) {
        return {
          success: false,
          message: 'Bạn không thể tự chuyển Xu Haevy cho chính tài khoản của mình.',
        };
      }

      const senderName = user.displayName || user.email || 'Người gửi';

      // Deduct points from sender
      const senderRef = doc(db, 'users', user.uid);
      await setDoc(
        senderRef,
        {
          audioPoints: increment(-amount),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Increment points for recipient
      const recipientRef = doc(db, 'users', targetUid);
      await setDoc(
        recipientRef,
        {
          audioPoints: increment(amount),
          totalEarnedPoints: increment(amount),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Log transaction for sender
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `🎁 Chuyển tặng ${amount.toLocaleString()} Xu Haevy cho ${targetName}${message ? `: "${message}"` : ''}`,
        amount: -amount,
        type: 'transfer_coins',
        createdAt: serverTimestamp(),
      });

      // Log transaction for recipient
      await addDoc(collection(db, 'users', targetUid, 'pointTransactions'), {
        title: `🎁 Nhận tặng +${amount.toLocaleString()} Xu Haevy từ ${senderName}${message ? `: "${message}"` : ''}`,
        amount: amount,
        type: 'receive_coins',
        createdAt: serverTimestamp(),
      });

      await logSystemActivity({
        action: 'ADJUST_POINTS',
        actionTitle: 'Tặng Xu Haevy Cho Bạn Bè',
        targetType: 'user',
        targetId: targetUid,
        targetName,
        details: `${senderName} đã chuyển tặng ${amount.toLocaleString()} Xu Haevy cho ${targetName} (${cleanId}).`,
      });

      return {
        success: true,
        message: `Đã tặng thành công ${amount.toLocaleString()} Xu Haevy cho "${targetName}"!`,
        recipientName: targetName,
      };
    } catch (err: any) {
      console.error('Error transferring coins:', err);
      return {
        success: false,
        message: 'Chuyển tặng Xu Haevy thất bại. Vui lòng thử lại.',
      };
    }
  };

  const activateTrialVip = async () => {
    if (!user) return;
    const newExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        vipTier: 'vip',
        vipExpiresAt: newExpiresAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
      title: 'Kích hoạt thử nghiệm 3 ngày VIP Miễn phí',
      amount: 0,
      type: 'bonus',
      createdAt: serverTimestamp(),
    });
  };

  const updateVipSettings = async (settings: Partial<VipSettings>) => {
    if (!user) return;
    const merged = { ...vipSettings, ...settings };
    setVipSettings(merged);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        vipSettings: merged,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để lưu bài hát yêu thích.');
    }

    const newFavorites = favorites.includes(trackId)
      ? favorites.filter((id) => id !== trackId)
      : [...favorites, trackId];

    setFavorites(newFavorites);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        favoriteTrackIds: newFavorites,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const signInWithGoogle = async (referralCodeForNewUser?: string) => {
    const cleanRef = (referralCodeForNewUser || '').trim().toUpperCase();
    
    // Check referral validity if provided
    let rewardPoints = 200;
    let rewardVipDays = 7;
    let refDocId: string | null = null;
    
    if (cleanRef) {
      try {
        const codesRef = collection(db, 'referralCodes');
        const q = query(codesRef, where('code', '==', cleanRef));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const codeDoc = snap.docs[0];
          const data = codeDoc.data();
          if (data.isActive === false) {
            throw new Error('Mã giới thiệu này hiện đang tạm khóa hoặc đã hết hạn.');
          }
          const maxUses = typeof data.maxUses === 'number' ? data.maxUses : 100;
          const usedCount = typeof data.usedCount === 'number' ? data.usedCount : 0;
          if (usedCount >= maxUses) {
            throw new Error(`Mã giới thiệu [${cleanRef}] đã đạt tối đa ${maxUses} lượt nhập.`);
          }
          rewardPoints = data.rewardPoints ?? 200;
          rewardVipDays = data.rewardVipDays ?? 7;
          refDocId = codeDoc.id;
        } else {
          const builtInValid = ['AUDIO2026', 'VIP100', 'AUDIOHUB', 'VN2026', 'KHA782', 'MEMBER', 'WELCOME', 'PRO100', 'GOOGLE2026'].includes(cleanRef);
          if (!builtInValid) {
            throw new Error('Mã giới thiệu không hợp lệ. Vui lòng nhập mã giới thiệu chính xác để kích hoạt tài khoản.');
          }
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Mã giới thiệu')) {
          throw e;
        }
        console.warn('Referral check during Google sign in:', e);
      }
    }

    const result = await signInWithPopup(auth, googleProvider);
    if (result.user && refDocId) {
      try {
        await updateDoc(doc(db, 'referralCodes', refDocId), {
          usedCount: increment(1),
          usedByUids: arrayUnion(result.user.uid),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('Error updating referral on google sign in:', e);
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        // Fallback to robust local session for this email
        const fallbackUid = `user-${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
        const isDefaultAdmin = cleanEmail === 'kha78228@gmail.com';
        const generatedId = generateAccountId(fallbackUid);
        const localUser: CustomAuthUser = {
          uid: fallbackUid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          photoURL: '',
          isLocalSession: true,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        setAccountId(generatedId);
        setRole(isDefaultAdmin ? 'admin' : 'user');
        setLoading(false);
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string, referralCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanRef = (referralCode || '').trim().toUpperCase();
    if (!cleanRef) {
      throw new Error('Vui lòng nhập Mã giới thiệu (bắt buộc khi tạo tài khoản mới để hệ thống kiểm soát tải).');
    }

    // Check referral code validity
    let rewardPoints = 200;
    let rewardVipDays = 7;
    let refDocId: string | null = null;

    try {
      const codesRef = collection(db, 'referralCodes');
      const q = query(codesRef, where('code', '==', cleanRef));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const codeDoc = snap.docs[0];
        const data = codeDoc.data();
        if (data.isActive === false) {
          throw new Error('Mã giới thiệu này hiện đang tạm khóa hoặc đã hết hạn.');
        }
        const maxUses = typeof data.maxUses === 'number' ? data.maxUses : 100;
        const usedCount = typeof data.usedCount === 'number' ? data.usedCount : 0;
        if (usedCount >= maxUses) {
          throw new Error(`Mã giới thiệu [${cleanRef}] đã đạt tối đa ${maxUses} lượt nhập.`);
        }
        rewardPoints = data.rewardPoints || 200;
        rewardVipDays = data.rewardVipDays || 7;
        refDocId = codeDoc.id;
      } else {
        // Built-in accepted referral codes
        const builtInValid = ['AUDIO2026', 'VIP100', 'AUDIOHUB', 'VN2026', 'KHA782', 'MEMBER', 'WELCOME', 'PRO100'].includes(cleanRef);
        if (!builtInValid) {
          throw new Error('Mã giới thiệu không tồn tại. Vui lòng nhập mã giới thiệu hợp lệ để kích hoạt tài khoản.');
        }
      }
    } catch (e: any) {
      if (e.message && e.message.includes('Mã giới thiệu')) {
        throw e;
      }
      console.warn('Error checking referral code during signup:', e);
    }

    try {
      // Proceed to create user via Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }

      // If referral doc exists in firestore, update usage
      if (refDocId && cred.user) {
        try {
          await updateDoc(doc(db, 'referralCodes', refDocId), {
            usedCount: increment(1),
            usedByUids: arrayUnion(cred.user.uid),
            updatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn('Error updating referral code usage:', e);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        // Fallback to local user session with starter + referral rewards
        const fallbackUid = `user-${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
        const isDefaultAdmin = cleanEmail === 'kha78228@gmail.com';
        const generatedId = generateAccountId(fallbackUid);
        const localUser: CustomAuthUser = {
          uid: fallbackUid,
          email: cleanEmail,
          displayName: name || cleanEmail.split('@')[0],
          photoURL: '',
          isLocalSession: true,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        setAccountId(generatedId);
        setRole(isDefaultAdmin ? 'admin' : 'user');
        setAudioPoints(100 + rewardPoints);
        setTotalEarnedPoints(100 + rewardPoints);
        if (rewardVipDays > 0) {
          setVipTier('vip');
          setVipExpiresAt(new Date(Date.now() + rewardVipDays * 24 * 60 * 60 * 1000).toISOString());
        }
        setLoading(false);

        // Try creating doc in Firestore if possible
        try {
          const userRef = doc(db, 'users', fallbackUid);
          await setDoc(userRef, {
            accountId: generatedId,
            email: cleanEmail,
            displayName: name || cleanEmail.split('@')[0],
            photoURL: '',
            role: isDefaultAdmin ? 'admin' : 'user',
            audioPoints: 100 + rewardPoints,
            totalEarnedPoints: 100 + rewardPoints,
            totalListenedMinutes: 0,
            lastDailyCheckin: null,
            vipTier: rewardVipDays > 0 ? 'vip' : 'free',
            vipExpiresAt: rewardVipDays > 0 ? new Date(Date.now() + rewardVipDays * 24 * 60 * 60 * 1000).toISOString() : null,
            vipSettings: DEFAULT_VIP_SETTINGS,
            favoriteTrackIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore fallback sync notice:', e);
        }

        return;
      }
      throw err;
    }
  };

  const updateShortcutsConfig = async (newConfig: ShortcutsConfig): Promise<{ success: boolean; message: string }> => {
    setIsShortcutsSyncing(true);
    try {
      setShortcutsConfig(newConfig);
      try {
        localStorage.setItem('haevy_shortcuts_config', JSON.stringify(newConfig));
      } catch (e) {}

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          shortcuts_config: newConfig,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      return { success: true, message: 'Đã lưu và đồng bộ phím tắt thành công!' };
    } catch (err) {
      console.error('Lỗi khi cập nhật shortcuts_config:', err);
      return { success: false, message: 'Lỗi lưu lên đám mây, đã lưu trên thiết bị.' };
    } finally {
      setIsShortcutsSyncing(false);
    }
  };

  const updateSingleShortcut = async (actionId: string, updates: Partial<ShortcutItemConfig>): Promise<{ success: boolean; message: string }> => {
    const current = shortcutsConfig[actionId] || DEFAULT_SHORTCUTS_CONFIG[actionId];
    if (!current) return { success: false, message: 'Không tìm thấy cấu hình phím tắt.' };
    
    const updatedItem: ShortcutItemConfig = {
      ...current,
      ...updates,
      isCustomized: true
    };
    
    const newConfig: ShortcutsConfig = {
      ...shortcutsConfig,
      [actionId]: updatedItem
    };

    return updateShortcutsConfig(newConfig);
  };

  const resetShortcutsToDefault = async (): Promise<{ success: boolean; message: string }> => {
    setIsShortcutsSyncing(true);
    try {
      setShortcutsConfig(DEFAULT_SHORTCUTS_CONFIG);
      try {
        localStorage.setItem('haevy_shortcuts_config', JSON.stringify(DEFAULT_SHORTCUTS_CONFIG));
      } catch (e) {}

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          shortcuts_config: DEFAULT_SHORTCUTS_CONFIG,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      return { success: true, message: 'Đã khôi phục phím tắt về mặc định ban đầu!' };
    } catch (err) {
      console.error('Lỗi khi khôi phục phím tắt mặc định:', err);
      return { success: false, message: 'Lỗi khi khôi phục trên máy chủ.' };
    } finally {
      setIsShortcutsSyncing(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(ANON_SESSION_KEY);
    setAnonymousVipSession(null);
    setAudioPoints(0);
    setTotalEarnedPoints(0);
    setFavorites([]);
    setVipTier('free');
    setVipExpiresAt(null);
    setAccountId('GUEST-CHUA-DANG-NHAP');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut note:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accountId: effectiveAccountId,
        role,
        adminRole,
        isAdmin,
        isSuperAdmin,
        isSubAdmin,
        subAdminPermissions: effectivePermissions,
        favorites,
        audioPoints,
        totalEarnedPoints,
        totalListenedMinutes,
        lastDailyCheckin,
        vipTier: effectiveVipTier,
        vipExpiresAt: effectiveVipExpiresAt,
        isVip: effectiveIsVip,
        vipSettings,
        anonymousVipSession,
        isAnonymousAccount,
        loginAsAnonymous,
        authorStatus,
        isAuthorVerified,
        authorStageName,
        authorBio,
        authorVerificationData,
        logSystemActivity,
        toggleFavorite,
        addAudioPoints,
        deductAudioPoints,
        incrementListenTime,
        performDailyCheckin,
        redeemVipWithPoints,
        purchaseVipPlan,
        purchasePointsPackage,
        giftVipPlanToUser,
        transferCoinsToUser,
        activateTrialVip,
        updateVipSettings,
        createBlankAnonymousAccount,
        activateAnonymousPass,
        clearAnonymousVipSession,
        redeemReferralCode,
        submitAuthorVerification,
        publishAuthorTrack,
        deleteAuthorTrack,
        sendGiftToAuthor,
        approveAuthorVerification,
        rejectAuthorVerification,
        revokeAuthorStatus,
        createReferralCode,
        deleteReferralCode,
        createAnonymousPass,
        deleteAnonymousPass,
        updateUserVipByAdmin,
        adjustUserPointsByAdmin,
        deleteCommentByAdmin,
        deleteCommunityPostByAdmin,
        pinCommunityPostByAdmin,
        deleteAudioTrackByAdmin,
        toggleTrackVipStatusByAdmin,
        banUserAccountByAdmin,
        assignSubAdmin,
        revokeSubAdmin,
        updateSubAdminPermissions,
        systemAnnouncements,
        createSystemAnnouncement,
        deleteSystemAnnouncement,
        togglePinAnnouncement,
        systemGlobalConfig,
        updateSystemGlobalConfig,
        homeCustomConfig,
        updateHomeCustomConfig,
        resetHomeCustomConfig,
        upcomingEvents,
        createUpcomingEvent,
        updateUpcomingEvent,
        deleteUpcomingEvent,
        toggleEventPin,
        toggleEventStatus,
        registerForEvent,
        claimEventReward,
        batchRewardUsers,
        shortcutsConfig,
        isShortcutsSyncing,
        updateShortcutsConfig,
        updateSingleShortcut,
        resetShortcutsToDefault,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
