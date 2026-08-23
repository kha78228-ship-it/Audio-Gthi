export type AudioGenre = 
  | 'Tất cả'
  | 'Truyện Audio'
  | 'Truyện Tiên Hiệp & Kiếm Hiệp'
  | 'Truyện Ma & Trinh Thám'
  | 'Truyện Ngôn Tình & Đô Thị'
  | 'Sách Nói & Radio'
  | 'Lo-Fi Chill'
  | 'Deep Focus'
  | 'Acoustic'
  | 'Electronic'
  | 'Ambient & Zen'
  | 'Podcast & Talk';

export type VipTier = 'free' | 'vip';
export type AudioQuality = 'standard' | 'hifi_lossless' | 'spatial_3d';

export interface VipSettings {
  hifiMode: boolean;
  bassBoost: boolean;
  spatial3D: boolean;
  showVipBadge: boolean;
  autoDownloadOffline: boolean;
  smartEqualizer?: 'flat' | 'bass_ultra' | 'vocal_clarity' | 'electronic' | 'acoustic' | 'cinema_3d';
  audioCrossfadeSec?: number;
  karaokeMode?: boolean;
  sleepTimerFadeout?: boolean;
  goldenCommentAura?: boolean;
  customTheme?: 'royal_gold' | 'cyber_neon' | 'amethyst_purple' | 'emerald_luxury' | 'default_dark';
}

export interface PointTransaction {
  id: string;
  title: string;
  amount: number; // positive for earn, negative for spend
  type: 'listen' | 'checkin' | 'upload' | 'post' | 'comment' | 'redeem_vip' | 'bonus' | 'gift_author' | 'receive_gift' | 'tts_synthesis' | 'spend' | 'topup_coins' | 'gift_vip' | 'receive_vip' | 'transfer_coins' | 'receive_coins' | 'game_crowd_bet' | 'game_crowd_win' | 'game_crowd_refund';
  createdAt: any;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
  genre?: string;
  durationSec?: number;
  plays?: number;
  likesCount?: number;
  addedBy?: string;
  addedByName?: string;
  isVipOnly?: boolean;
  bitrate?: string;
  description?: string;
  lyrics?: string;
  isAuthorVerified?: boolean;
  stageName?: string;
  authorBio?: string;
  status?: 'published' | 'pending_review' | 'rejected';
  isFeatured?: boolean;
  isHidden?: boolean;
  createdAt?: any;
  // Story Series & Episode Progression (Cốt truyện, bộ truyện, các tập tiếp theo)
  isSeries?: boolean;
  seriesId?: string;
  seriesTitle?: string;
  episodeNumber?: number;
  episodeTitle?: string;
  totalEpisodes?: number;
  storylineSummary?: string;
  nextTrackId?: string;
}

export interface AudioSeriesItem {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  stageName?: string;
  isAuthorVerified?: boolean;
  coverUrl: string;
  genre: string;
  storylineSummary: string;
  totalEpisodes: number;
  episodes: Track[];
  totalPlays: number;
  totalLikes: number;
  updatedAt?: any;
}

export interface AuthorProfileInfo {
  uid: string;
  stageName: string;
  fullName?: string;
  photoURL?: string;
  bio?: string;
  isVerified?: boolean;
  genre?: string;
  socialLink?: string;
  tracksCount: number;
  seriesCount: number;
  totalPlays: number;
  totalLikes: number;
  followersCount: number;
  tracks: Track[];
  seriesList: AudioSeriesItem[];
}

export type AuthorVerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface AuthorVerification {
  id: string;
  userId: string;
  fullName: string;
  stageName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  idCardNumber: string; // CCCD 12 số
  idCardIssueDate: string;
  idCardFrontUrl: string; // Base64 or image URL
  idCardBackUrl: string; // Base64 or image URL
  facePhotoUrl: string; // Live capture or selfie Base64
  musicGenre: string;
  bio: string;
  socialLink?: string;
  status: AuthorVerificationStatus;
  adminNote?: string;
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  isAuthorAdmin?: boolean;
  text: string;
  isPinned?: boolean;
  createdAt: any;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  isAuthorAdmin?: boolean;
  content: string;
  trackId?: string;
  trackTitle?: string;
  trackArtist?: string;
  trackCover?: string;
  trackUrl?: string;
  likes: string[]; // User UIDs
  commentsCount: number;
  createdAt: any;
  tag?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
}

export type EcosystemMode = 'audio' | 'messages' | 'couple' | 'finance' | 'admin' | 'studio' | 'games';

export type ActiveTab = 'home' | 'library' | 'player' | 'community' | 'messages' | 'couple' | 'finance' | 'topup' | 'vip' | 'profile' | 'admin' | 'studio' | 'games';

export type CoupleRelationshipType = 'dating' | 'engaged' | 'married';

export interface CouplePartnerInfo {
  uid: string;
  name: string;
  accountId: string;
  photoURL?: string;
  nickname?: string;
  isVip?: boolean;
}

export interface CouplePeriodCycleConfig {
  lastPeriodStartDate: string; // YYYY-MM-DD
  cycleLengthDays: number; // typically 21-35, default 28
  periodDurationDays: number; // typically 3-7, default 5
  lutealPhaseDays?: number; // default 14
  notificationsEnabled?: boolean;
  notes?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export interface CouplePeriodLog {
  id: string;
  coupleId: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  flowLevel?: 'light' | 'medium' | 'heavy' | 'spotting';
  painLevel?: number; // 1 to 5 scale
  symptoms?: string[];
  mood?: string;
  boyfriendCareNotes?: string;
  sweetMessageFromPartner?: string;
  createdAt: any;
}

export interface CoupleDiaryComment {
  id: string;
  authorUid: string;
  authorName: string;
  authorNickname?: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
}

export interface CoupleDiary {
  id: string;
  coupleId: string;
  authorUid: string;
  authorName: string;
  authorNickname?: string;
  authorPhoto?: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  mood: string; // e.g. 'happy', 'romantic', 'sweet', 'missing', 'cozy', 'sulking', 'peaceful'
  weather?: string; // 'sunny', 'rainy', 'cold', 'cloudy', 'sunset', 'night'
  photoUrls?: string[];
  audioTrackId?: string;
  audioTrackTitle?: string;
  audioTrackArtist?: string;
  reactions?: Record<string, string>; // uid -> emoji string
  comments?: CoupleDiaryComment[];
  createdAt: any;
  updatedAt?: any;
}

export interface CoupleData {
  id: string;
  pairCode: string; // System-generated code e.g. "HV-74921X"
  passcode: string; // Password created by space owner to protect couple room
  partner1: CouplePartnerInfo;
  partner2?: CouplePartnerInfo;
  status: 'pending' | 'active' | 'cancelled';
  relationshipType: CoupleRelationshipType;
  anniversaryDate: string; // YYYY-MM-DD
  coupleTitle: string;
  theme: 'rose_romance' | 'sunset_glow' | 'starlight_midnight' | 'pure_diamond';
  lovePoints: number;
  sharedSongIds: string[];
  bannerUrl?: string;
  cycleConfig?: CouplePeriodCycleConfig;
  createdAt: any;
  updatedAt?: any;
}

// 1. Guess anniversary date game
export interface CoupleAnniversaryGuess {
  id: string;
  coupleId: string;
  createdById: string;
  createdByName: string;
  questionTitle: string; // e.g. "Ngày đầu tiên tụi mình gặp nhau?", "Ngày nụ hôn đầu?"
  actualDate: string; // YYYY-MM-DD
  hint?: string;
  // Partner's guess
  guessedById?: string;
  guessedDate?: string; // YYYY-MM-DD
  isCorrect?: boolean;
  daysDifference?: number;
  rewardPoints?: number;
  reactionMessage?: string;
  createdAt: any;
  answeredAt?: any;
}

// 2. Custom Partner Quiz
export interface CustomQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface CoupleCustomQuiz {
  id: string;
  coupleId: string;
  createdById: string;
  createdByName: string;
  question: string;
  options: CustomQuizOption[];
  explanation?: string;
  sweetRewardNote?: string;
  // Answer by partner
  answeredById?: string;
  chosenOptionId?: string;
  isPassed?: boolean;
  createdAt: any;
  answeredAt?: any;
}

// 3. Love Card Deck Q&A
export type LoveCardCategory = 'sweet_romance' | 'deep_secrets' | 'future_promises' | 'gratitude_bonding';

export interface CoupleLoveCard {
  id: string;
  coupleId: string;
  cardIndex: number;
  category: LoveCardCategory;
  promptText: string;
  partner1Answer?: {
    uid: string;
    name: string;
    text: string;
    submittedAt: any;
  };
  partner2Answer?: {
    uid: string;
    name: string;
    text: string;
    submittedAt: any;
  };
  isRevealed: boolean; // Revealed when both answered or unlocked together
  createdAt: any;
}

// 4. Voice Moment & Promise Capsules
export interface CoupleVoiceMoment {
  id: string;
  coupleId: string;
  authorUid: string;
  authorName: string;
  title: string;
  audioUrl: string; // Blob audio / URL
  durationSec: number;
  type: 'promise' | 'night_whisper' | 'sweet_song' | 'anniversary_capsule';
  note?: string;
  unlockDate?: string; // If locked until anniversary
  isFavorite?: boolean;
  createdAt: any;
}

// 5. Shared Couple Memory Gallery
export interface CoupleMemory {
  id: string;
  coupleId: string;
  authorUid: string;
  authorName: string;
  title: string;
  description: string;
  photoUrl: string;
  date: string; // YYYY-MM-DD
  location?: string;
  likesCount?: number;
  createdAt: any;
}

// 6. Custom Couple Event / Anniversary Milestone
export interface CoupleEvent {
  id: string;
  coupleId: string;
  createdById: string;
  createdByName?: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  icon?: string; // Emoji e.g. 🎂, ✈️, 💍, 🌹, 🏖️, 🏠, 💖, 🎁, 🎉
  category?: 'milestone' | 'birthday' | 'trip' | 'date_night' | 'promise' | 'custom';
  badge?: string; // e.g. "Sinh Nhật", "Chuyến Đi", "Kỷ Niệm", "Hẹn Hò"
  note?: string;
  isYearlyRecurring?: boolean; // Repeat every year
  createdAt: any;
  updatedAt?: any;
}

export interface FriendRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderAccountId: string;
  senderPhoto?: string;
  isSenderVip?: boolean;
  isSenderAuthor?: boolean;
  senderAuthorStageName?: string;
  receiverUid: string;
  receiverName?: string;
  receiverAccountId?: string;
  receiverPhoto?: string;
  isReceiverAuthor?: boolean;
  receiverAuthorStageName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: any;
}

export interface Friendship {
  id: string;
  userIds: string[]; // [uid1, uid2]
  users: Record<string, {
    uid: string;
    displayName: string;
    accountId: string;
    photoURL?: string;
    isVip?: boolean;
    isAuthorVerified?: boolean;
    authorStageName?: string;
  }>;
  createdAt: any;
  lastInteractionAt?: any;
}

export interface ChatMessageTrackAttachment {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  url: string;
  genre?: string;
}

export interface ChatMessageAttachment {
  type: 'voice' | 'image' | 'file';
  url: string;
  durationSec?: number;
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderId?: string;
  senderName: string;
  senderPhoto?: string;
  senderAccountId?: string;
  isSenderVip?: boolean;
  isSenderAuthor?: boolean;
  senderAuthorStageName?: string;
  text: string;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDurationSec?: number;
  attachments?: ChatMessageAttachment[];
  callLog?: {
    type: 'voice' | 'video';
    durationSec: number;
    status: 'completed' | 'missed' | 'declined';
  };
  trackAttachment?: ChatMessageTrackAttachment;
  sharedTrack?: ChatMessageTrackAttachment;
  pointsGift?: {
    amount: number;
    giftName: string;
    giftIcon: string;
  };
  reactions?: Record<string, any>; // emoji -> list of UIDs or map
  createdAt: any;
  isRead?: boolean;
}

export interface ConversationParticipant {
  uid: string;
  displayName: string;
  accountId: string;
  photoURL?: string;
  isVip?: boolean;
  isAuthorVerified?: boolean;
  authorStageName?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantDetails: Record<string, ConversationParticipant>;
  lastMessageText: string;
  lastMessageSenderUid: string;
  lastMessageAt: any;
  unreadCount?: Record<string, number>;
  createdAt: any;
}

export interface ReferralCode {
  id: string;
  code: string; // 6 uppercase alphanumeric characters e.g. "VIP100", "A8K9X2"
  maxUses: number; // 100 uses per code
  usedCount: number;
  usedByUids: string[];
  rewardPoints: number; // e.g. 200 points
  rewardVipDays: number; // e.g. 3 or 7 days
  createdBy: string;
  createdAt: any;
  isActive: boolean;
  description?: string;
}

export interface AnonymousPass {
  id: string;
  passCode: string; // 3-digit number (1 month) or other custom code (1 week)
  type: '3_digit_month' | '1_week';
  durationDays: number; // 30 for 3-digit, 7 for standard
  usedCount: number;
  isActive: boolean;
  description?: string;
  createdAt: any;
}

export interface AnonymousVipSession {
  isActive: boolean;
  guestId: string; // e.g. "GUEST-VIP-8492"
  passCode: string;
  durationDays: number;
  activatedAt: string;
  expiresAt: string;
  type: '3_digit_month' | '1_week';
}

export interface UserAccountData {
  uid: string;
  accountId: string; // e.g. "AH-849215"
  email: string;
  displayName: string;
  photoURL?: string;
  audioPoints: number;
  totalEarnedPoints: number;
  totalListenedMinutes?: number;
  lastDailyCheckin?: string | null;
  vipTier: VipTier;
  vipExpiresAt: string | null;
  isAuthorVerified?: boolean;
  authorStatus?: AuthorVerificationStatus;
  authorStageName?: string;
  authorBio?: string;
  authorVerificationId?: string;
  role?: 'admin' | 'user';
  isBanned?: boolean;
  bannedReason?: string;
  bannedAt?: any;
  createdAt: any;
}

export interface VipPackage {
  id: 'week' | 'month' | '3month' | '6month' | 'year';
  name: string;
  durationDays: number;
  priceVnd: number;
  originalPriceVnd?: number;
  bonusPoints: number;
  tier: 'vip';
  isPopular?: boolean;
  isBestValue?: boolean;
  description: string;
  features: string[];
}

export interface PointTopupPackage {
  id: string;
  name: string;
  points: number; // Điểm / Xu gốc
  bonusPoints: number; // Điểm / Xu thưởng thêm
  priceVnd: number;
  originalPriceVnd?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  description: string;
  tag?: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 20 for 20%, 10000 for 10.000đ
  description: string;
  minSpend?: number;
}

export interface VipOrder {
  id: string;
  packageId: string;
  packageName: string;
  durationDays: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCodeApplied?: string;
  paymentMethod: 'vietqr' | 'momo' | 'zalopay';
  status: 'completed' | 'pending';
  createdAt: any;
}

export interface PointTopupOrder {
  id: string;
  packageId: string;
  packageName: string;
  pointsAwarded: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCodeApplied?: string;
  paymentMethod: 'vietqr' | 'momo' | 'zalopay';
  status: 'completed' | 'pending';
  createdAt: any;
}

export interface VipGiftOrder {
  id: string;
  senderUid: string;
  senderName: string;
  senderAccountId?: string;
  recipientIdentifier: string; // UID or AccountId or Email
  recipientUid?: string;
  recipientName?: string;
  packageId: string;
  packageName: string;
  durationDays: number;
  finalAmount: number;
  paymentMethod: 'vietqr' | 'momo' | 'zalopay';
  message?: string;
  status: 'completed' | 'pending';
  createdAt: any;
}

export interface CoinTransferRecord {
  id: string;
  senderUid: string;
  senderName: string;
  senderAccountId?: string;
  recipientIdentifier: string;
  recipientUid?: string;
  recipientName?: string;
  amount: number;
  message?: string;
  createdAt: any;
}

export interface GiftItem {
  id: string;
  name: string;
  pointsCost: number;
  iconEmoji: string;
  tag: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  authorExpBonus: number;
}

export interface AuthorGiftDonation {
  id: string;
  senderUid: string;
  senderName: string;
  senderAccountId?: string;
  senderPhoto?: string;
  isSenderVip?: boolean;
  authorUid: string;
  authorStageName: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  pointsCost: number;
  message?: string;
  trackId?: string;
  trackTitle?: string;
  createdAt: any;
}

export interface VipPrivilegeItem {
  id: string;
  title: string;
  category: 'audio' | 'downloads' | 'social' | 'points' | 'exclusives' | 'playback' | 'creator' | 'couple' | 'messages' | 'studio' | 'finance';
  tierRequired: 'vip';
  shortDesc: string;
  detailedBenefit: string;
  iconName: string;
  badge?: string;
}

export interface SystemAuditLog {
  id: string;
  action: 
    | 'DELETE_COMMENT'
    | 'DELETE_AUDIO'
    | 'DELETE_POST'
    | 'PIN_POST'
    | 'UNPIN_POST'
    | 'TOGGLE_VIP_TRACK'
    | 'BAN_USER'
    | 'UNBAN_USER'
    | 'UPDATE_VIP'
    | 'ADJUST_POINTS'
    | 'APPROVE_AUTHOR'
    | 'REJECT_AUTHOR'
    | 'REVOKE_AUTHOR'
    | 'REDEEM_ANON_CODE'
    | 'REDEEM_REF_CODE'
    | 'CREATE_REF_CODE'
    | 'CREATE_ANON_PASS'
    | 'PUBLISH_AUDIO'
    | 'SEND_GIFT'
    | 'ASSIGN_SUB_ADMIN'
    | 'CREATE_ANNOUNCEMENT'
    | 'DELETE_ANNOUNCEMENT'
    | 'UPDATE_SYSTEM_CONFIG'
    | 'UPDATE_HOME_LAYOUT'
    | 'BATCH_REWARD';
  actionTitle: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole: 'admin' | 'user' | 'author';
  targetType: 'comment' | 'audio_track' | 'post' | 'user' | 'author_verification' | 'pass_code' | 'referral_code' | 'gift' | 'system_announcement' | 'system_config' | 'home_customization';
  targetId?: string;
  targetName?: string;
  details: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  createdAt: any;
}

export type AdminRole = 'super_admin' | 'sub_admin' | 'moderator';

export interface SubAdminPermissions {
  canManageAuthors: boolean;
  canManageTracks: boolean;
  canManageCommunity: boolean;
  canManageUsers: boolean;
  canCreateVipAndPasses: boolean;
  canPostAnnouncements: boolean;
  canManageSystemConfig: boolean;
  canBatchReward: boolean;
  canViewAuditLogs: boolean;
}

export interface SubAdminUser {
  uid: string;
  email: string;
  displayName: string;
  accountId: string;
  role: AdminRole;
  permissions: SubAdminPermissions;
  assignedBy: string;
  assignedAt: any;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'event' | 'maintenance' | 'general';
  targetAudience: 'all' | 'vip' | 'authors';
  isPinned: boolean;
  // Marquee & Styling Customization
  isMarquee?: boolean;
  marqueeSpeed?: 'slow' | 'normal' | 'fast';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fontWeight?: 'normal' | 'semibold' | 'bold' | 'black';
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  isBlinking?: boolean;
  customIcon?: 'radio' | 'sparkles' | 'flame' | 'bell' | 'megaphone' | 'crown' | 'alert' | 'heart' | 'star';
  createdBy: string;
  createdByName: string;
  createdAt: any;
  expiresAt?: string;
}

export interface SystemGlobalConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  pointMultiplier: number;
  vipDiscountPercent: number;
  allowNewRegistrations: boolean;
  allowAuthorRegistrations: boolean;
  allowAnonymousPasses: boolean;
  dailyCheckinBonus: number;
}

export type HomeTargetAudience = 'all' | 'vip' | 'authors' | 'guests' | 'specific_accounts';
export type HomeHeroStyle = 'classic_spotlight' | 'cinematic_wide' | 'storyline_epic' | 'minimal_clean' | 'cyber_glow';
export type HomeHeroAction = 'play_track' | 'open_library' | 'open_vip' | 'open_studio' | 'open_community' | 'open_games' | 'open_author';

export interface CuratedCollectionItem {
  id: string;
  title: string;
  genre: string;
  coverUrl: string;
  description: string;
  trackCount: number;
}

export interface AdminHomeCustomConfig {
  isEnabled: boolean;
  targetAudience: HomeTargetAudience;
  targetAccountIds: string[]; // List of account IDs (e.g. HV-123456, AH-ADMIN) or UIDs/emails
  titleTag?: string;
  // Greeting Announcement Ribbon
  showAdminGreetingBanner: boolean;
  greetingBannerText: string;
  greetingBannerSubtext?: string;
  greetingBannerIcon: 'sparkles' | 'crown' | 'radio' | 'flame' | 'heart' | 'zap' | 'gift';
  greetingBannerColor: 'amber' | 'purple' | 'emerald' | 'rose' | 'indigo' | 'cyber';
  greetingBannerCtaText?: string;
  greetingBannerCtaTab?: ActiveTab;
  // Hero Spotlight
  heroMode: 'auto' | 'custom_track' | 'custom_banner';
  heroCustomTrackId?: string;
  heroCustomTitle?: string;
  heroCustomSubtitle?: string;
  heroCustomTag?: string;
  heroCustomCoverUrl?: string;
  heroCustomCtaText?: string;
  heroCustomAction?: HomeHeroAction;
  heroCustomAuthorName?: string;
  heroCustomAuthorUid?: string;
  heroStyle?: HomeHeroStyle;
  // Sections visibility & titles
  showHeroSpotlight: boolean;
  showGenresSection: boolean;
  genresTitle?: string;
  showTrendingSection: boolean;
  trendingTitle?: string;
  trendingSubtitle?: string;
  // Admin Signature Picks
  showAdminPicksSection: boolean;
  adminPicksTitle?: string;
  adminPicksSubtitle?: string;
  adminPicksTrackIds: string[];
  // Curated Collections
  showCuratedCollections: boolean;
  curatedCollectionsTitle?: string;
  curatedCollectionsSubtitle?: string;
  customCuratedCollections?: CuratedCollectionItem[];
  // Meta
  customBadgeText?: string;
  updatedAt?: any;
  updatedBy?: string;
  updatedByName?: string;
  version?: number;
}

// ==========================================
// HAEVY FINANCE: PERSONAL & COUPLE MONEY HUB
// ==========================================

export type FinanceTransactionType = 'expense' | 'income' | 'transfer';

export type FinanceWalletType = 
  | 'cash' 
  | 'bank' 
  | 'e_wallet' 
  | 'savings' 
  | 'investment' 
  | 'credit_card' 
  | 'couple_shared';

export interface FinanceWallet {
  id: string;
  name: string;
  type: FinanceWalletType;
  balance: number;
  currency: 'VND' | 'USD';
  bankName?: string;
  accountNumber?: string;
  color: string;
  icon: string;
  isExcludedFromTotal?: boolean;
  isCoupleShared?: boolean;
  creditLimit?: number;
  createdAt: any;
  updatedAt?: any;
}

export type FinanceCategoryGroup = 
  | 'essential'      // Nhu cầu thiết yếu (50%)
  | 'lifestyle'      // Phong cách sống & Giải trí (30%)
  | 'savings_invest' // Tiết kiệm & Tích lũy (20%)
  | 'income_source'  // Nguồn thu nhập
  | 'other';

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
  group: FinanceCategoryGroup;
  icon: string;
  color: string;
  monthlyBudget?: number; // Budget allocated for this category
  isCustom?: boolean;
}

export interface FinanceTransaction {
  id: string;
  userId: string;
  amount: number; // in VND
  type: FinanceTransactionType;
  categoryId: string;
  categoryName: string;
  walletId: string;
  walletName: string;
  toWalletId?: string; // For transfer
  toWalletName?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  tags?: string[];
  isCoupleShared?: boolean;
  splitWithPartner?: boolean;
  partnerSplitPercent?: number; // default 50
  receiptUrl?: string; // demo receipt attachment
  location?: string;
  isRecurring?: boolean;
  recurringId?: string;
  isFamilyFund?: boolean;
  familyMemberId?: string;
  familyMemberName?: string;
  createdAt: any;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // e.g. "Chồng / Chủ hộ", "Vợ / Thủ quỹ", "Con trai", "Bạn bè"
  avatar: string;
  fixedSalary: number; // Lương cứng hàng tháng (VNĐ)
  contributionPercent: number; // % Lương cam kết đóng vào quỹ (e.g. 40%)
  monthlyCommitment: number; // Số tiền cam kết = fixedSalary * (contributionPercent / 100)
  contributedAmount: number; // Số tiền thực tế đã nạp/đóng
  spentAmount: number; // Số tiền đã chi tiêu từ quỹ
  phoneOrEmail?: string;
  role: 'admin' | 'member';
  status?: 'active' | 'pending_invite';
  joinedAt?: string;
}

export interface FamilyBudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
}

export interface FamilyFundConfig {
  id: string;
  fundName: string;
  inviteCode: string;
  inviteLink: string;
  splitMode: 'percentage' | 'proportional' | 'equal' | 'custom';
  defaultSalaryPercent: number;
  createdAt: string;
}

export interface FinanceBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalMonthlyLimit: number;
  categoryLimits: Record<string, number>; // categoryId -> limit amount
  alertThresholdPercent: number; // e.g. 80% or 100%
  notes?: string;
}

export interface FinanceSavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDate: string; // YYYY-MM-DD
  color: string;
  icon: string;
  isCompleted: boolean;
  targetWalletId?: string;
  notes?: string;
  isCoupleShared?: boolean;
  createdAt: any;
}

export interface FinanceDebtRecord {
  id: string;
  userId: string;
  type: 'borrowed' | 'lent'; // vay người khác | cho người khác vay
  personName: string;
  personPhone?: string;
  amount: number;
  paidAmount: number;
  dueDate?: string;
  interestRateAnnual?: number;
  notes?: string;
  status: 'active' | 'completed' | 'overdue';
  createdAt: any;
  completedAt?: any;
}

export interface FinanceRecurringTransaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfRecurrence: number; // e.g. day 5 of every month
  nextDueDate: string;
  isActive: boolean;
  autoDeduct: boolean;
}

// ================= HAEVY MESSAGE TYPES =================
export interface ThoughtBubble {
  id: string;
  userId: string;
  userName: string;
  userAccountId: string;
  userPhoto?: string;
  isUserVip?: boolean;
  isAuthorVerified?: boolean;
  authorStageName?: string;
  text: string; // The thought bubble content (e.g. max 120 chars)
  emoji?: string; // Mood emoji
  musicSnippet?: {
    trackId?: string;
    trackTitle?: string;
    trackArtist?: string;
  };
  bgColor?: string;
  durationHours?: number; // 3, 6, 12, 24
  createdAt: any;
  expiresAt?: any;
}

export interface FriendPhotoPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAccountId: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  isAuthorVerified?: boolean;
  authorStageName?: string;
  photoUrl: string; // Base64 / image captured in-app or uploaded
  caption: string; // Miêu tả bên dưới ảnh
  captureSource: 'camera' | 'upload'; // Chụp trực tiếp trong app hay tải từ máy điện thoại
  location?: string;
  mood?: string;
  likes: string[]; // List of user UIDs who liked
  commentsCount: number;
  createdAt: any;
}

export interface FriendPhotoComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  text: string;
  createdAt: any;
}

// ================= HAEVY GAMES: ×2 ĐÁM ĐÔNG (CROWD 2X PREDICTION) =================
export interface CrowdGameOption {
  id: 'A' | 'B';
  text: string;
  description?: string;
  icon?: string;
  totalBets: number; // Tổng số lượt người đặt cược
  totalPool: number; // Tổng số Xu đã đặt vào phương án này
}

export interface CrowdGameQuestion {
  id: string;
  question: string; // Nội dung câu hỏi tranh luận
  category: string; // 'Âm Nhạc' | 'Showbiz' | 'Xu Hướng & Trend' | 'Thể Thao' | 'Tranh Luận Vui' | 'Đời Sống' | 'Đố Vui'
  description?: string;
  optionA: CrowdGameOption;
  optionB: CrowdGameOption;
  minBet: number; // Tối thiểu: 10 xu
  maxBet: number; // Tối đa: 2,000 xu (theo luật cược 2k xu)
  status: 'open' | 'closed' | 'settled' | 'cancelled';
  totalParticipants: number; // Tổng số lượt người tham gia
  totalPool: number; // Tổng số xu trong vòng cược
  winningOption?: 'A' | 'B' | 'draw' | null; // Bên có nhiều người đặt hơn sẽ thắng
  settledExplanation?: string;
  deadline?: string; // Hạn chót đặt cược
  createdAt: any;
  createdBy?: string;
  settledAt?: any;
  settledBy?: string;
}

export interface CrowdGameBet {
  id: string;
  questionId: string;
  questionTitle: string;
  userId: string;
  userName: string;
  userAccountId: string;
  userPhoto?: string;
  isUserVip?: boolean;
  chosenOption: 'A' | 'B';
  chosenOptionText: string;
  betAmount: number; // Số xu cược (10 -> 2,000 Xu)
  potentialReward: number; // betAmount * 2
  status: 'pending' | 'won' | 'lost' | 'refunded';
  rewardAmount?: number; // Số xu thực tế nhận được khi thắng (x2 cược)
  createdAt: any;
  settledAt?: any;
}

// ================= HAEVY GAMES: ĐOÁN BÀI HÁT / AUDIO QUIZ TRACKS =================
export interface AudioQuizOption {
  id: string;
  title: string;
  artist: string;
  isCorrect: boolean;
}

export interface AudioQuizTrack {
  id: string;
  songTitle: string; // Tên bài hát chuẩn
  artist: string; // Ca sĩ / Nghệ sĩ
  genre: string; // Thể loại
  difficulty: 'Dễ' | 'Trung Bình' | 'Khó';
  audioUrl?: string; // URL âm thanh hoặc Base64 tải lên từ Admin
  audioName?: string; // Tên file âm thanh gốc
  startOffsetSec?: number; // Vị trí giây bắt đầu đoạn trích
  durationSec?: number; // Độ dài đoạn trích (vd: 10s - 20s)
  melodyNotes?: Array<{ freq: number; duration: number }>; // Nốt giai điệu tổng hợp
  options: AudioQuizOption[]; // 4 phương án trắc nghiệm
  triviaTip?: string; // Thông tin bên lề thú vị
  isActive: boolean; // Trạng thái kích hoạt trong game
  playsCount?: number;
  correctCount?: number;
  uploadedBy?: string;
  createdAt: any;
  updatedAt?: any;
}

// ================= HAEVY ACCOUNT 6-LAYER SECURITY & SUPPORT =================
export interface AccountSecurityShield {
  layer1PasswordEnabled: boolean;
  layer1LastVerifiedAt?: string;
  
  layer2EmailOtpEnabled: boolean;
  layer2PrimaryEmail?: string;
  layer2LastVerifiedAt?: string;

  layer3PinCodeEnabled: boolean;
  layer3PinHash?: string; // 6-digit PIN string or hash
  layer3LastVerifiedAt?: string;

  layer4RecoveryEmailEnabled: boolean;
  layer4RecoveryEmail?: string;
  layer4RecoveryVerified?: boolean;
  layer4LastVerifiedAt?: string;

  layer5FaceIdEnabled: boolean;
  layer5FaceEnrolledAt?: string;
  layer5FaceDataUrl?: string; // Thumbnail / descriptor of enrolled face
  layer5LastVerifiedAt?: string;

  layer6MasterActivationCode: string; // System-issued master key, e.g. HAEVY-SEC-XXXX-XXXX-XXXX-XXXX
  layer6CodeGeneratedAt?: string;
  layer6LastVerifiedAt?: string;
  
  securityScore: number; // 0 - 100%
  overallLockLevel: 'standard' | 'enhanced' | 'maximum_6x';
  updatedAt?: any;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'ai' | 'support_admin';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; action: string }>;
}

export interface SupportTicketItem {
  id: string;
  userId: string;
  userEmail: string;
  userAccountId: string;
  userName: string;
  category: 'security' | 'vip' | 'points' | 'technical' | 'author' | 'games';
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  messages: SupportMessage[];
  createdAt: any;
  updatedAt?: any;
}

// ================= HAEVY MESSAGE REAL-TIME PRESENCE (10S TIMEOUT) =================
export interface UserPresence {
  uid: string;
  isOnline: boolean;
  lastSeenMs: number; // Client timestamp in ms for exact sub-second precision
  lastSeen?: any;     // Firestore server timestamp
  displayName?: string;
  photoURL?: string;
  accountId?: string;
  isVip?: boolean;
  isAuthorVerified?: boolean;
  authorStageName?: string;
  activePlatform?: string;
  updatedAt?: any;
}

