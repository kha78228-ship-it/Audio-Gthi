export interface UserProfileData {
  displayName: string;
  nickname: string;
  bio: string;
  quote: string;
  birthday: string;
  zodiac: string;
  gender: string;
  location: string;
  hometown: string;
  occupation: string;
  hobbies: string[];
  favoriteGenres: string[];
  socialLinks: {
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    instagram?: string;
    spotify?: string;
  };
  joinedDate: string;
  photoURL?: string;
  coverUrl?: string;
  avatarFrameId?: AvatarFrameId;
  email?: string;
}

export type AvatarFrameId = 
  | 'dragon_gold'
  | 'cyber_neon'
  | 'zen_lotus'
  | 'cosmic_galaxy'
  | 'diamond_ice'
  | 'romantic_rose'
  | 'fire_phoenix'
  | 'minimal_titanium';

export interface AvatarFrame {
  id: AvatarFrameId;
  name: string;
  description: string;
  badge: string;
  ringClass: string;
  borderStyle: string;
  glowStyle: string;
  auraAnimation: string;
  crownIcon?: string;
  isVipExclusive?: boolean;
}

export interface ProfilePostComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ProfilePost {
  id: string;
  content: string;
  imageUrl?: string;
  audioTrackId?: string;
  audioTrackTitle?: string;
  audioTrackArtist?: string;
  audioTrackCover?: string;
  mood?: string;
  privacy: 'public' | 'friends' | 'private';
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: ProfilePostComment[];
}

export interface ProfileMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  title: string;
  caption?: string;
  duration?: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'dragon_gold',
    name: 'Rồng Vàng Hoàng Gia',
    description: 'Khung mạ vàng đế vương với ngọc châu rực rỡ và vầng hào quang rồng thiêng',
    badge: 'VIP Đế Vương',
    ringClass: 'ring-4 ring-amber-400',
    borderStyle: 'border-2 border-yellow-300',
    glowStyle: 'shadow-[0_0_25px_rgba(251,191,36,0.65)]',
    auraAnimation: 'animate-pulse',
    crownIcon: '👑',
    isVipExclusive: true
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Vũ Trụ',
    description: 'Khung công nghệ tương lai phát sáng hai dải màu Cyan & Hồng neon sắc nét',
    badge: 'Cyberpunk',
    ringClass: 'ring-4 ring-cyan-400',
    borderStyle: 'border-2 border-fuchsia-400',
    glowStyle: 'shadow-[0_0_25px_rgba(34,211,238,0.7)]',
    auraAnimation: '',
    crownIcon: '⚡',
    isVipExclusive: false
  },
  {
    id: 'zen_lotus',
    name: 'Sen Ngọc Tịnh Tâm',
    description: 'Khung hoa sen ngọc bích tỏa năng lượng bình an và thanh tịnh tâm hồn',
    badge: 'Tâm Linh',
    ringClass: 'ring-4 ring-emerald-400',
    borderStyle: 'border-2 border-teal-300',
    glowStyle: 'shadow-[0_0_22px_rgba(52,211,153,0.6)]',
    auraAnimation: '',
    crownIcon: '🪷',
    isVipExclusive: false
  },
  {
    id: 'cosmic_galaxy',
    name: 'Hào Quang Thiên Hà',
    description: 'Vòng xoáy tinh vân tím huyền ảo từ chiều không gian sâu thẳm vũ trụ',
    badge: 'Tinh Vân',
    ringClass: 'ring-4 ring-purple-500',
    borderStyle: 'border-2 border-indigo-400',
    glowStyle: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    auraAnimation: 'animate-pulse',
    crownIcon: '🌌',
    isVipExclusive: false
  },
  {
    id: 'diamond_ice',
    name: 'Kim Cương Băng Giá',
    description: 'Góc cắt kim cương pha lê xanh phát sáng tinh khiết và sang trọng',
    badge: 'Kim Cương',
    ringClass: 'ring-4 ring-sky-300',
    borderStyle: 'border-2 border-blue-200',
    glowStyle: 'shadow-[0_0_22px_rgba(125,211,252,0.65)]',
    auraAnimation: '',
    crownIcon: '💎',
    isVipExclusive: true
  },
  {
    id: 'romantic_rose',
    name: 'Hồng Ngọc Tình Yêu',
    description: 'Cánh hoa hồng nhung đỏ rực lãng mạn dành cho những trái tim biết yêu',
    badge: 'Lãng Mạn',
    ringClass: 'ring-4 ring-rose-500',
    borderStyle: 'border-2 border-pink-400',
    glowStyle: 'shadow-[0_0_22px_rgba(244,63,94,0.6)]',
    auraAnimation: '',
    crownIcon: '🌹',
    isVipExclusive: false
  },
  {
    id: 'fire_phoenix',
    name: 'Phượng Hoàng Lửa',
    description: 'Lửa thiêng bất diệt tái sinh từ tàn tro với ngọn lửa cam rực cháy nhiệt huyết',
    badge: 'Hỏa Diệm',
    ringClass: 'ring-4 ring-orange-500',
    borderStyle: 'border-2 border-red-500',
    glowStyle: 'shadow-[0_0_25px_rgba(249,115,22,0.7)]',
    auraAnimation: 'animate-pulse',
    crownIcon: '🔥',
    isVipExclusive: true
  },
  {
    id: 'minimal_titanium',
    name: 'Titanium Tối Giản',
    description: 'Viền kim loại titan thanh lịch, tối giản và hiện đại cho phong cách tinh tế',
    badge: 'Tối Giản',
    ringClass: 'ring-2 ring-zinc-400',
    borderStyle: 'border border-zinc-500',
    glowStyle: 'shadow-[0_0_12px_rgba(255,255,255,0.2)]',
    auraAnimation: '',
    crownIcon: '✨',
    isVipExclusive: false
  }
];

export const COVER_PRESETS = [
  {
    id: 'nebula',
    name: 'Thiên Hà Vũ Trụ',
    category: 'Vũ trụ',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cyberpunk',
    name: 'Thành Phố Neon',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'golden_luxury',
    name: 'Lụa Vàng Hoàng Gia',
    category: 'Hoàng gia',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'zen_sunset',
    name: 'Hoàng Hôn Biển Vắng',
    category: 'Thư giãn',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'aurora_forest',
    name: 'Bắc Cực Quang & Rừng Thông',
    category: 'Thiên nhiên',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'music_studio',
    name: 'Phòng Thu Lo-Fi Vibes',
    category: 'Âm nhạc',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'mount_fuji',
    name: 'Núi Phú Sĩ & Hoa Anh Đào',
    category: 'Nghệ thuật',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80'
  }
];
