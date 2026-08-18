export type AudioGenre = 
  | 'Tất cả'
  | 'Lo-Fi Chill'
  | 'Deep Focus'
  | 'Acoustic'
  | 'Electronic'
  | 'Ambient & Zen'
  | 'Podcast & Talk';

export type VipTier = 'free' | 'vip' | 'vip_master';
export type AudioQuality = 'standard' | 'hifi_lossless' | 'spatial_3d';

export interface VipSettings {
  hifiMode: boolean;
  bassBoost: boolean;
  spatial3D: boolean;
  showVipBadge: boolean;
  autoDownloadOffline: boolean;
}

export interface PointTransaction {
  id: string;
  title: string;
  amount: number; // positive for earn, negative for spend
  type: 'listen' | 'checkin' | 'upload' | 'post' | 'comment' | 'redeem_vip' | 'bonus';
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
  addedBy?: string;
  addedByName?: string;
  isVipOnly?: boolean;
  bitrate?: string;
  createdAt?: any;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  text: string;
  createdAt: any;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
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
}

export type ActiveTab = 'home' | 'library' | 'player' | 'community' | 'vip' | 'topup';

export interface VipPackage {
  id: 'week' | 'month' | '3month' | '6month' | 'year';
  name: string;
  durationDays: number;
  priceVnd: number;
  originalPriceVnd?: number;
  bonusPoints: number;
  tier: VipTier;
  isPopular?: boolean;
  isBestValue?: boolean;
  description: string;
  features: string[];
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
  paymentMethod: 'vietqr' | 'momo' | 'zalopay' | 'card';
  status: 'completed' | 'pending';
  createdAt: any;
}
