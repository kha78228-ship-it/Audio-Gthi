import { Track, GiftItem, VipPrivilegeItem, PointTopupPackage } from './types';

// System default tracks are empty: All audio in Haevy Audio is 100% created & uploaded by authors/creators
export const INITIAL_TRACKS: Track[] = [];

export const GENRE_LIST = [
  'Tất cả',
  'Truyện Audio & Cốt Truyện',
  'Truyện Tiên Hiệp & Kiếm Hiệp',
  'Truyện Ma & Trinh Thám',
  'Truyện Ngôn Tình & Đô Thị',
  'Sách Nói & Radio',
  'Lo-Fi Chill',
  'Deep Focus',
  'Acoustic',
  'Electronic',
  'Ambient & Zen',
  'Podcast & Talk'
] as const;

export const FEATURED_PLAYLISTS = [
  {
    id: 'f-story-1',
    title: 'Tuyển Tập Truyện Tiên Hiệp & Kiếm Hiệp Đỉnh Cao',
    description: 'Khám phá thế giới tu chân kỳ ảo, pháp bảo vạn năm và hành trình nghịch thiên thành tiên.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trackCount: 35,
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp'
  },
  {
    id: 'f-story-2',
    title: 'Trinh Thám & Án Mạng Đêm Khuya (3D Spatial)',
    description: 'Những câu chuyện rùng rợn, ly kỳ hồi hộp cùng âm thanh không gian 3D sống động.',
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    trackCount: 28,
    genre: 'Truyện Ma & Trinh Thám'
  },
  {
    id: 'f-story-3',
    title: 'Sách Nói Tinh Hoa Phát Triển Tư Duy',
    description: 'Các tác phẩm kinh điển gối đầu giường giúp nâng tầm tư duy và làm chủ cuộc sống.',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    trackCount: 16,
    genre: 'Sách Nói & Radio'
  },
  {
    id: 'f1',
    title: 'Lo-Fi Tập Trung Làm Việc',
    description: 'Những giai điệu êm dịu, giúp bạn duy trì năng lượng và sự tập trung suốt ngày dài.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    trackCount: 18,
    genre: 'Lo-Fi Chill'
  },
  {
    id: 'f2',
    title: 'Coding Night in Cyberpunk (Lossless VIP)',
    description: 'Nhịp đập Synthwave & Electro bốc lửa chất lượng cao studio.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    trackCount: 24,
    genre: 'Electronic'
  },
  {
    id: 'f3',
    title: 'Không Gian Thiền & Tĩnh Tâm',
    description: 'Âm thanh sóng nước, chuông xoay Tây Tạng giúp giải tỏa căng thẳng và ngủ ngon.',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    trackCount: 12,
    genre: 'Ambient & Zen'
  }
];

export const GIFT_CATALOG: GiftItem[] = [
  {
    id: 'coffee',
    name: 'Cà phê Sáng tạo',
    pointsCost: 20,
    iconEmoji: '☕',
    tag: 'Tiếp năng lượng',
    description: 'Tặng 1 ly cà phê ấm nóng tiếp thêm năng lượng sáng tác bài hát mới cho tác giả.',
    rarity: 'common',
    authorExpBonus: 20
  },
  {
    id: 'rose',
    name: 'Bó Hoa Tri Ân',
    pointsCost: 50,
    iconEmoji: '🌹',
    tag: 'Tình cảm',
    description: 'Gửi ngàn đóa hồng tươi thắm bày tỏ sự mến mộ sâu sắc đến tác phẩm của tác giả.',
    rarity: 'common',
    authorExpBonus: 50
  },
  {
    id: 'headphones',
    name: 'Tai nghe Studio Vàng',
    pointsCost: 100,
    iconEmoji: '🎧',
    tag: 'Âm thanh chuẩn',
    description: 'Món quà âm thanh cao cấp hỗ trợ tác giả kiểm âm và phối khí chuẩn xác.',
    rarity: 'rare',
    authorExpBonus: 100
  },
  {
    id: 'guitar',
    name: 'Đàn Guitar Gỗ Cổ Điển',
    pointsCost: 250,
    iconEmoji: '🎸',
    tag: 'Giai điệu mộc',
    description: 'Tiếp lửa đam mê những nốt nhạc acoustic mộc mạc, ngọt ngào và đầy rung động.',
    rarity: 'rare',
    authorExpBonus: 250
  },
  {
    id: 'mic',
    name: 'Micro Studio Mạ Vàng',
    pointsCost: 500,
    iconEmoji: '🎙️',
    tag: 'Giọng ca vàng',
    description: 'Tôn vinh giọng ca truyền cảm và giai điệu đỉnh cao chạm đến trái tim người nghe.',
    rarity: 'epic',
    authorExpBonus: 500
  },
  {
    id: 'trophy',
    name: 'Cúp Cống Hiến Âm Nhạc',
    pointsCost: 1000,
    iconEmoji: '🏆',
    tag: 'Vinh danh',
    description: 'Biểu tượng vinh danh tác giả xuất sắc, có đóng góp to lớn cho cộng đồng Haevy Audio.',
    rarity: 'epic',
    authorExpBonus: 1000
  },
  {
    id: 'rocket',
    name: 'Bệ Phóng Đưa Nhạc Lên Top',
    pointsCost: 2500,
    iconEmoji: '🚀',
    tag: 'Viral Top 1',
    description: 'Tăng tốc đưa bài hát của tác giả lên vị trí trang trọng tại Bảng Xếp Hạng & Trang Chủ 24h.',
    rarity: 'legendary',
    authorExpBonus: 2500
  },
  {
    id: 'crown',
    name: 'Vương Miện Hoàng Gia Âm Nhạc',
    pointsCost: 5000,
    iconEmoji: '👑',
    tag: 'Huyền thoại',
    description: 'Món quà tối thượng gửi trọn 5,000 Điểm và ghi danh bạn vào Bảng Vàng Top Fan của tác giả.',
    rarity: 'legendary',
    authorExpBonus: 5000
  }
];

export const POINT_TOPUP_PACKAGES: PointTopupPackage[] = [
  {
    id: 'coin_starter',
    name: 'Gói Xu Haevy Khởi Đầu',
    points: 500,
    bonusPoints: 50,
    priceVnd: 10000,
    description: 'Nạp nhanh 550 Xu Haevy (tỷ lệ 1:1) để trải nghiệm tính năng & quà tặng',
    tag: 'Khởi đầu'
  },
  {
    id: 'coin_popular',
    name: 'Gói Xu Haevy Phổ Biến',
    points: 1200,
    bonusPoints: 200,
    priceVnd: 20000,
    originalPriceVnd: 25000,
    isPopular: true,
    description: 'Nhận ngay 1.400 Xu Haevy (+17% thưởng), gói nạp nhiều nhất cho Studio AI & Bạn bè',
    tag: 'Phổ biến nhất'
  },
  {
    id: 'coin_growth',
    name: 'Gói Xu Haevy Thịnh Hành',
    points: 3500,
    bonusPoints: 700,
    priceVnd: 50000,
    originalPriceVnd: 70000,
    description: 'Nhận ngay 4.200 Xu Haevy (+20% thưởng), tối ưu chi phí cho nhà sáng tạo âm thanh',
    tag: 'Tiết kiệm 20%'
  },
  {
    id: 'coin_pro',
    name: 'Gói Xu Haevy Đại Gia',
    points: 8000,
    bonusPoints: 2000,
    priceVnd: 100000,
    originalPriceVnd: 150000,
    isBestValue: true,
    description: 'Nhận ngay 10.000 Xu Haevy (+25% thưởng), tặng quà hoặc chuyển Xu tức thì',
    tag: 'Tối ưu nhất'
  },
  {
    id: 'coin_unlimited',
    name: 'Gói Xu Haevy Vô Cực (Studio Master)',
    points: 20000,
    bonusPoints: 6000,
    priceVnd: 200000,
    originalPriceVnd: 350000,
    description: 'Nhận ngay 26.000 Xu Haevy (+30% thưởng) - Đỉnh cao sáng tác AI & bảng vàng Top Fan',
    tag: 'VIP Creator'
  }
];

export const VIP_PRIVILEGES_LIST: VipPrivilegeItem[] = [
  // --- NHÓM 1: HAEVY FINANCE (TÀI CHÍNH & XU HAEVY) ---
  {
    id: 'finance_multiplier_points',
    title: 'Haevy Finance: Tăng Gấp 3 (x3) Tốc Độ Tích Lũy Xu Haevy',
    category: 'finance',
    tierRequired: 'vip',
    shortDesc: 'Nhân 3 toàn bộ Xu khi nghe nhạc, điểm danh và nhiệm vụ hằng ngày',
    detailedBenefit: 'Toàn bộ thành viên VIP nhận nhân ba (x3) Xu Haevy khi nghe nhạc (+15 xu/phút), điểm danh hằng ngày (+150 xu/ngày) và tương tác cộng đồng.',
    iconName: 'Coins',
    badge: 'x3 Xu Haevy'
  },
  {
    id: 'finance_zero_fee',
    title: 'Haevy Finance: Miễn 100% Phí Chuyển Xu & Tặng Quà Tác Giả',
    category: 'finance',
    tierRequired: 'vip',
    shortDesc: '0% phí giao dịch khi nạp, tặng quà và chuyển Xu Haevy cho bạn bè',
    detailedBenefit: 'Miễn phí hoàn toàn các khoản phí giao dịch tài chính nội bộ, tối ưu 100% giá trị quà tặng đến tay nghệ sĩ và người thân.',
    iconName: 'ShieldCheck',
    badge: '0% Phí Giao Dịch'
  },
  {
    id: 'finance_interest_bonus',
    title: 'Haevy Finance: Hưởng Lãi Suất Tích Lũy Xu +15%/Năm Trong Két Sắt',
    category: 'finance',
    tierRequired: 'vip',
    shortDesc: 'Tự động sinh lời Xu Haevy hằng ngày dựa trên số dư tài khoản',
    detailedBenefit: 'Tính năng Staking tài chính thông minh: Số dư Xu trong ví Haevy Finance tự động sinh thêm lợi nhuận +15%/năm nhận theo ngày.',
    iconName: 'TrendingUp',
    badge: '+15%/Năm Két Sắt'
  },
  {
    id: 'finance_vip_analytics',
    title: 'Haevy Finance: Báo Cáo Tài Chính & Phân Tích Dòng Tiền AI Chuyên Sâu',
    category: 'finance',
    tierRequired: 'vip',
    shortDesc: 'Biểu đồ thu chi đa chiều, dự báo dòng tiền và quản lý ngân sách thông minh',
    detailedBenefit: 'Trợ lý AI tự động phân loại giao dịch, cảnh báo chi tiêu vượt ngưỡng và đề xuất kế hoạch tích lũy tối ưu.',
    iconName: 'Sliders',
    badge: 'AI Finance Pro'
  },
  {
    id: 'finance_instant_payout',
    title: 'Haevy Finance: Xử Lý Đổi Thưởng & Rút Về MB Bank Tức Thì (Dưới 30s)',
    category: 'finance',
    tierRequired: 'vip',
    shortDesc: 'Phân luồng ưu tiên rút thưởng 24/7 không cần chờ duyệt thủ công',
    detailedBenefit: 'Hệ thống tự động kích hoạt API ngân hàng chuyển tiền thưởng về số tài khoản MB Bank đã liên kết chỉ trong 30 giây.',
    iconName: 'Zap',
    badge: 'Rút 30s'
  },

  // --- NHÓM 2: HAEVY STUDIO (PHÒNG THU & SÁNG TẠO AI) ---
  {
    id: 'tts_studio_discount',
    title: 'Haevy Studio: Ưu Đãi Tạo Giọng Đọc AI Voice (-33% Phí & Không Giới Hạn)',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Giảm 33% phí chuyển văn bản thành âm thanh AI (50 pts vs 75 pts) và hỗ trợ văn bản dài',
    detailedBenefit: 'Đặc quyền tạo giọng đọc AI chất lượng cao & phối nhạc nền chỉ với 50 pts/lượt (tiết kiệm 25 Điểm Audio so với người dùng thường) không giới hạn độ dài văn bản.',
    iconName: 'Sparkles',
    badge: 'Studio 50 pts'
  },
  {
    id: 'studio_master_lossless_export',
    title: 'Haevy Studio: Xuất Âm Thanh Studio Master Lossless 24-bit / 96kHz',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Tải và xuất file audio chất lượng phòng thu 24-bit/96kHz chuẩn FLAC/WAV',
    detailedBenefit: 'Hỗ trợ xuất file âm thanh chất lượng cao chuẩn FLAC/WAV không nén, phục vụ sản xuất podcast, truyện audio và âm nhạc chuyên nghiệp.',
    iconName: 'Sliders',
    badge: 'Master 24-bit'
  },
  {
    id: 'studio_fast_track_queue',
    title: 'Haevy Studio: Luồng Xử Lý AI Siêu Tốc Độ Ưu Tiên 1 (Zero-Queue)',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Hàng chờ ưu tiên chuyển đổi giọng đọc AI chỉ dưới 2 giây trên cụm GPU riêng',
    detailedBenefit: 'Bỏ qua hàng chờ thông thường, tài khoản VIP được phân luồng trực tiếp đến cụm máy chủ GPU hiệu năng cao xử lý tức thì.',
    iconName: 'Zap',
    badge: 'Zero-Queue'
  },
  {
    id: 'author_support_priority',
    title: 'Haevy Studio: Tác Phẩm Đẩy Top 1 Bảng Xếp Hạng & Trang Chủ',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Tác phẩm sáng tác được kiểm duyệt nhanh gấp 5 lần & gắn huy hiệu VIP Studio',
    detailedBenefit: 'Bài hát/audio do VIP đăng tải được đưa vào luồng ưu tiên số 1, tự động gắn nhãn "VIP Studio Exclusive / Featured" trên Trang Chủ và BXH.',
    iconName: 'Flame',
    badge: 'Top Spotlight'
  },
  {
    id: 'studio_premium_ambient_pack',
    title: 'Haevy Studio: Kho Nhạc Nền Phòng Thu Bản Quyền Miễn Phí',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Mở khóa trọn bộ Ambient Backgrounds (Lofi, Thiền, Piano, Mưa, Hùng tráng)',
    detailedBenefit: 'Tự do lồng ghép toàn bộ thư viện nhạc nền cao cấp vào tác phẩm audio của bạn mà không tốn thêm bất kỳ chi phí bản quyền nào.',
    iconName: 'Headphones',
    badge: 'Ambient Pro'
  },
  {
    id: 'studio_multi_track_vip',
    title: 'Haevy Studio: Bộ Trộn Multi-Track & Lồng Tiếng Đa Tầng Không Giới Hạn',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Mix nhiều lớp âm thanh, lồng hiệu ứng FX và master chuyên nghiệp',
    detailedBenefit: 'Hỗ trợ không giới hạn layer âm thanh trong một dự án, tích hợp bộ nén tiếng Compressor và Reverb phòng thu cao cấp.',
    iconName: 'Sliders',
    badge: 'Multi-Track'
  },

  // --- NHÓM 3: HAEVY MESSAGE (TIN NHẮN & KẾT NỐI BẠN BÈ) ---
  {
    id: 'messages_vip_avatar_glow',
    title: 'Haevy Message: Khung Avatar VIP Golden Aura & Vương Miện Chat',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Hiệu ứng phát sáng vàng kim và biểu tượng VIP danh dự bên cạnh tên',
    detailedBenefit: 'Tôn vinh vị thế thành viên VIP trong danh sách bạn bè, hội thoại trực tiếp và các phòng chat giao lưu âm nhạc.',
    iconName: 'Crown',
    badge: 'VIP Aura'
  },
  {
    id: 'messages_lossless_voice',
    title: 'Haevy Message: Tin Nhắn Thoại HD Lossless 320kbps Khử Tạp Âm',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Gửi tin nhắn âm thanh trong trẻo, khử tạp âm và không giới hạn độ dài',
    detailedBenefit: 'Thu âm giọng nói rõ nét chuẩn 320kbps truyền tải trọn vẹn cảm xúc và giai điệu bài hát bạn muốn gửi tặng bạn bè.',
    iconName: 'Headphones',
    badge: 'HD Voice'
  },
  {
    id: 'messages_listen_together',
    title: 'Haevy Message: Cùng Nghe Nhạc Trực Tuyến Đồng Bộ (Listen Together)',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Nghe chung một bài hát cùng lúc với bạn bè thời gian thực trong khi nhắn tin',
    detailedBenefit: 'Đồng bộ hóa thanh phát nhạc giữa 2 thiết bị thời gian thực với độ trễ 0ms, cùng cảm nhận giai điệu tuyệt hảo ở khoảng cách xa.',
    iconName: 'Radio',
    badge: 'Listen Together'
  },
  {
    id: 'messages_animated_stickers',
    title: 'Haevy Message: Trọn Bộ Nhãn Dán Động VIP & Emoji Hiệu Ứng 3D',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Hàng trăm sticker âm nhạc động vui nhộn và hiệu ứng quà tặng bùng nổ',
    detailedBenefit: 'Mở khóa toàn bộ bộ sưu tập biểu cảm động độc quyền, gửi quà tặng kèm hiệu ứng bùng nổ ngay trong cửa sổ chat.',
    iconName: 'Gift',
    badge: 'VIP Stickers'
  },
  {
    id: 'messages_cloud_history_pin',
    title: 'Haevy Message: Ghim Tin Nhắn Quan Trọng & Lưu Trữ Đám Mây Vô Hạn',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Tìm kiếm lại toàn bộ lịch sử trò chuyện và ghim tin nhắn yêu thích',
    detailedBenefit: 'Không bao giờ mất tin nhắn quan trọng, tự động đồng bộ hóa trên tất cả các thiết bị cá nhân của bạn.',
    iconName: 'ShieldCheck',
    badge: 'Cloud Chat'
  },

  // --- NHÓM 4: I LOVE HAEVY (KHÔNG GIAN HẸN HÒ & TÌNH YÊU ĐÔI) ---
  {
    id: 'couple_themes_vip',
    title: 'I Love Haevy: Mở Khóa Toàn Bộ Theme Lãng Mạn VIP Độc Quyền',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Đêm Sao Thiên Hà, Anh Đào Nhật Bản, Hoàng Hôn Tình Yêu & Vườn Hồng Hoàng Gia',
    detailedBenefit: 'Đổi mới không gian hẹn hò với 4 bộ giao diện cao cấp có hoạt cảnh chuyển động, màu sắc lung linh và hiệu ứng ánh sáng gradient.',
    iconName: 'Sparkles',
    badge: 'VIP Themes'
  },
  {
    id: 'couple_voice_capsules_unlimited',
    title: 'I Love Haevy: Hộp Thời Gian Lời Hứa & Voice Note Không Giới Hạn',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Ghi âm tâm tình, lời hứa tương lai chuẩn âm thanh Lossless HD',
    detailedBenefit: 'Lưu giữ trọn đời những lời thì thầm ngọt ngào, hẹn giờ mở hộp thư vào ngày kỷ niệm tình yêu hoặc ngày cưới sắp tới.',
    iconName: 'Radio',
    badge: 'Voice Capsule'
  },
  {
    id: 'couple_gallery_hd_cloud',
    title: 'I Love Haevy: Album Kỷ Niệm 4K & Kho Nhạc Đôi Không Giới Hạn',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Lưu trữ không giới hạn hình ảnh tình yêu và bài hát gắn liền kỷ niệm',
    detailedBenefit: 'Tải lên hình ảnh độ phân giải cao và ghim bài hát chủ đề của hai người cùng phát nhạc nền đồng bộ mọi lúc.',
    iconName: 'Download',
    badge: '4K Gallery'
  },
  {
    id: 'couple_ai_love_letters',
    title: 'I Love Haevy: Trợ Lý AI Viết Thơ & Thư Tình Yêu Cảm Động',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Sáng tạo thiệp chúc mừng, thơ tình yêu cá nhân hóa theo kỷ niệm của hai bạn',
    detailedBenefit: 'AI hỗ trợ tạo những bức tâm thư ngọt ngào vào các dịp Valentine, 8/3, ngày kỷ niệm hoặc sinh nhật người thương.',
    iconName: 'Gift',
    badge: 'AI Love Letter'
  },
  {
    id: 'couple_aura_badge',
    title: 'I Love Haevy: Khung Nhẫn Đôi & Hiệu Ứng Trái Tim Vàng Phát Sáng',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Biểu tượng nhẫn cưới mạ vàng và nhịp tim đập đồng bộ giữa hai người',
    detailedBenefit: 'Cả hai tài khoản đều nhận hiệu ứng Trái Tim Đôi phát sáng lấp lánh khi truy cập ứng dụng cùng lúc.',
    iconName: 'Crown',
    badge: 'Golden Love'
  },
  {
    id: 'couple_shared_playlist_sync',
    title: 'I Love Haevy: Danh Sách Phát Tình Yêu Chung & Ghi Chú Đôi',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Cùng nhau tạo danh sách bài hát kỷ niệm và viết nhật ký cảm xúc theo từng ca khúc',
    detailedBenefit: 'Playlist tình yêu được đồng bộ tự động giữa 2 người, hỗ trợ ghim bài hát đại diện và nhắc nhở nghe chung mỗi tối.',
    iconName: 'Heart',
    badge: 'Love Playlist'
  },

  // --- NHÓM 5: CHẤT LƯỢNG ÂM THANH & PHÁT NHẠC ĐỈNH CAO ---
  {
    id: 'hifi_sound',
    title: 'Âm Thanh Studio Master Lossless 24-bit / 96kHz',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Độ phân giải siêu cao gấp 6 lần chuẩn thường, chi tiết trung thực',
    detailedBenefit: 'Tận hưởng từng dải âm trầm sâu lắng, âm trung trong trẻo và âm cao tách bạch với chuẩn nén FLAC không suy hao.',
    iconName: 'Sparkles',
    badge: 'Lossless 24-bit'
  },
  {
    id: 'spatial_3d',
    title: 'Không Gian Âm Nhạc Vòm Spatial 3D Audio 360°',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Mô phỏng âm thanh 360 độ như đang ở rạp hát thính phòng',
    detailedBenefit: 'Công nghệ định vị hướng âm thanh vòm 3 chiều độc quyền, tăng cảm giác sống động và chân thực khi đeo tai nghe.',
    iconName: 'Headphones',
    badge: '3D Surround'
  },
  {
    id: 'equalizer_pro',
    title: 'Equalizer Chuyên Nghiệp 10 Băng Tần & 6 Preset Dolby',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Tùy biến âm bass, vocal, acoustic, cinema sống động',
    detailedBenefit: 'Tự do tinh chỉnh dải tần từ 31Hz đến 16kHz với 6 chế độ căn chỉnh âm thanh chuyên nghiệp chuẩn rạp hát phòng thu.',
    iconName: 'Sliders',
    badge: 'Equalizer Pro'
  },
  {
    id: 'unlimited_download',
    title: 'Tải Nhạc Offline Không Giới Hạn Chuẩn Lossless',
    category: 'downloads',
    tierRequired: 'vip',
    shortDesc: 'Lưu bài hát trực tiếp vào máy nghe không cần mạng 4G/Wifi',
    detailedBenefit: 'Tải trọn vẹn danh sách phát yêu thích chuẩn Lossless, nghe mượt mà ngay cả khi trên máy bay hay không có 4G/Wifi.',
    iconName: 'Download',
    badge: 'Offline'
  },
  {
    id: 'ad_free',
    title: 'Trải Nghiệm 100% Không Quảng Cáo & Phát Nhạc Khi Tắt Màn Hình',
    category: 'playback',
    tierRequired: 'vip',
    shortDesc: 'Phát nhạc liên tục khi khóa màn hình hoặc chuyển ứng dụng khác',
    detailedBenefit: 'Không bao giờ bị làm phiền bởi quảng cáo gián đoạn cảm xúc, tiết kiệm pin tối đa khi phát ngầm trên thiết bị di động.',
    iconName: 'Zap',
    badge: 'No Ads'
  },
  {
    id: 'crossfade_seamless',
    title: 'Âm Nhạc Liền Mạch Crossfade & Gapless Playback Chuẩn DJ',
    category: 'playback',
    tierRequired: 'vip',
    shortDesc: 'Chuyển bài mượt mà 0 - 12 giây như tại Club/DJ Studio',
    detailedBenefit: 'Hòa quyện phần đuôi ca khúc trước và phần đầu ca khúc sau liền mạch không ngắt quãng, duy trì nhịp đập cảm xúc.',
    iconName: 'Flame',
    badge: 'Seamless DJ'
  },
  {
    id: 'karaoke_lyrics_sync',
    title: 'Chế Độ Karaoke Studio & Đồng Bộ Lời Bài Hát Thời Gian Thực',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Hiển thị lời chạy mượt mà từng giây và tính năng tách vocal',
    detailedBenefit: 'Trải nghiệm hát theo nhạc với hiệu ứng karaoke chạy chữ nhấp nháy, hỗ trợ luyện giọng và thu âm tại gia.',
    iconName: 'Sparkles',
    badge: 'Karaoke Studio'
  },
  {
    id: 'vip_exclusive_themes',
    title: 'Kho Giao Diện Cá Nhân Hóa VIP (Royal, Cyber Neon, Luxury)',
    category: 'social',
    tierRequired: 'vip',
    shortDesc: 'Tùy biến không gian âm nhạc theo phong cách hoàng gia riêng',
    detailedBenefit: 'Chuyển đổi giao diện độc quyền: Hoàng Gia Gold, Cyberpunk Neon, Thạch Anh Tím và Ngọc Lục Bảo Quý Phái.',
    iconName: 'Sparkles',
    badge: 'Themes'
  }
];

// ==========================================
// DEFAULT FINANCE WALLETS & CATEGORIES
// ==========================================

export const DEFAULT_FINANCE_CATEGORIES: import('./types').FinanceCategory[] = [
  // EXPENSES - Essential (50%)
  { id: 'cat_food', name: 'Ăn uống & Cà phê', type: 'expense', group: 'essential', icon: 'Utensils', color: '#f59e0b', monthlyBudget: 4500000 },
  { id: 'cat_transport', name: 'Đi lại & Xăng xe', type: 'expense', group: 'essential', icon: 'Car', color: '#3b82f6', monthlyBudget: 1200000 },
  { id: 'cat_bills', name: 'Hóa đơn & Điện nước / Net', type: 'expense', group: 'essential', icon: 'Receipt', color: '#ef4444', monthlyBudget: 1800000 },
  { id: 'cat_rent', name: 'Thuê nhà & Chung cư', type: 'expense', group: 'essential', icon: 'Home', color: '#6366f1', monthlyBudget: 6000000 },
  { id: 'cat_groceries', name: 'Chợ & Siêu thị bách hóa', type: 'expense', group: 'essential', icon: 'ShoppingCart', color: '#10b981', monthlyBudget: 3000000 },
  { id: 'cat_health', name: 'Y tế & Sức khỏe', type: 'expense', group: 'essential', icon: 'HeartPulse', color: '#ec4899', monthlyBudget: 1000000 },

  // EXPENSES - Lifestyle (30%)
  { id: 'cat_shopping', name: 'Mua sắm & Thời trang', type: 'expense', group: 'lifestyle', icon: 'ShoppingBag', color: '#8b5cf6', monthlyBudget: 2000000 },
  { id: 'cat_entertainment', name: 'Giải trí & Phim ảnh / Du lịch', type: 'expense', group: 'lifestyle', icon: 'Film', color: '#06b6d4', monthlyBudget: 1500000 },
  { id: 'cat_couple_date', name: 'Hẹn hò & Quà tặng Cặp đôi', type: 'expense', group: 'lifestyle', icon: 'Heart', color: '#f43f5e', monthlyBudget: 2000000 },
  { id: 'cat_education', name: 'Học tập & Khóa học', type: 'expense', group: 'lifestyle', icon: 'GraduationCap', color: '#14b8a6', monthlyBudget: 1000000 },
  { id: 'cat_gifts', name: 'Hiếu hỷ & Quà mừng', type: 'expense', group: 'lifestyle', icon: 'Gift', color: '#d946ef', monthlyBudget: 1000000 },

  // EXPENSES - Savings & Investments (20%)
  { id: 'cat_savings', name: 'Gửi tiết kiệm định kỳ', type: 'expense', group: 'savings_invest', icon: 'PiggyBank', color: '#22c55e', monthlyBudget: 5000000 },
  { id: 'cat_invest', name: 'Đầu tư chứng khoán / Quỹ', type: 'expense', group: 'savings_invest', icon: 'TrendingUp', color: '#10b981', monthlyBudget: 3000000 },
  { id: 'cat_insurance', name: 'Bảo hiểm nhân thọ & Tích lũy', type: 'expense', group: 'savings_invest', icon: 'Shield', color: '#0ea5e9', monthlyBudget: 1500000 },

  // INCOMES
  { id: 'inc_salary', name: 'Lương cố định hàng tháng', type: 'income', group: 'income_source', icon: 'Briefcase', color: '#10b981' },
  { id: 'inc_bonus', name: 'Thưởng KPI & Dự án', type: 'income', group: 'income_source', icon: 'Award', color: '#f59e0b' },
  { id: 'inc_freelance', name: 'Thu nhập phụ & Nghề tay trái', type: 'income', group: 'income_source', icon: 'Laptop', color: '#3b82f6' },
  { id: 'inc_invest_returns', name: 'Cổ tức & Lợi nhuận đầu tư', type: 'income', group: 'income_source', icon: 'LineChart', color: '#8b5cf6' },
  { id: 'inc_gift', name: 'Được tặng & Biếu thưởng', type: 'income', group: 'income_source', icon: 'Gift', color: '#ec4899' },
  { id: 'inc_audio_creator', name: 'Thu nhập Tác giả Haevy Audio', type: 'income', group: 'income_source', icon: 'Headphones', color: '#eab308' },
  { id: 'inc_other', name: 'Thu nhập khác', type: 'income', group: 'income_source', icon: 'PlusCircle', color: '#64748b' },
];

export const DEFAULT_FINANCE_WALLETS: import('./types').FinanceWallet[] = [
  {
    id: 'wallet_cash',
    name: 'Tiền Mặt Ví Tay',
    type: 'cash',
    balance: 0,
    currency: 'VND',
    color: '#10b981',
    icon: 'Banknote',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wallet_vcb',
    name: 'Tài Khoản Ngân Hàng',
    type: 'bank',
    balance: 0,
    currency: 'VND',
    bankName: 'Ngân hàng',
    accountNumber: '****0001',
    color: '#059669',
    icon: 'Building2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wallet_momo',
    name: 'Ví Điện Tử',
    type: 'e_wallet',
    balance: 0,
    currency: 'VND',
    color: '#d946ef',
    icon: 'Smartphone',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wallet_couple',
    name: 'Quỹ Chi Tiêu Chung (I Love Haevy)',
    type: 'couple_shared',
    balance: 0,
    currency: 'VND',
    isCoupleShared: true,
    color: '#f43f5e',
    icon: 'Heart',
    createdAt: new Date().toISOString(),
  },
];

export const FINANCIAL_WISDOM_QUOTES = [
  { quote: 'Đừng tiết kiệm những gì còn lại sau khi chi tiêu, hãy chi tiêu những gì còn lại sau khi đã tiết kiệm.', author: 'Warren Buffett' },
  { quote: 'Kiểm soát tài chính hôm nay là tấm vé cho sự tự do và an tâm ngày mai.', author: 'Haevy Finance Advisor' },
  { quote: 'Quy tắc 50/30/20: 50% Nhu cầu thiết yếu, 30% Phong cách sống, 20% Tiết kiệm & Tích lũy cho tương lai.', author: 'Elizabeth Warren' },
  { quote: 'Một đồng tiết kiệm được là một đồng kiếm được với lãi suất thời gian vô giá.', author: 'Benjamin Franklin' },
  { quote: 'Sự rõ ràng và minh bạch trong thu chi chính là chìa khóa gìn giữ hạnh phúc bền vững của gia đình và cặp đôi.', author: 'Haevy Finance' },
];

export const DEFAULT_FINANCE_BUDGET: import('./types').FinanceBudget = {
  id: 'budget_default',
  userId: 'current_user',
  month: '2026-08',
  totalMonthlyLimit: 0,
  alertThresholdPercent: 80,
  categoryLimits: {},
};

export const DEFAULT_FINANCE_SAVINGS_GOALS: import('./types').FinanceSavingsGoal[] = [];

export const DEFAULT_FINANCE_DEBTS: import('./types').FinanceDebtRecord[] = [];

export const DEFAULT_FINANCE_RECURRING: import('./types').FinanceRecurringTransaction[] = [];

export const DEFAULT_FINANCE_TRANSACTIONS: import('./types').FinanceTransaction[] = [];



