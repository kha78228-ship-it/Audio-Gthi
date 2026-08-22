import { Track, GiftItem, VipPrivilegeItem, PointTopupPackage } from './types';

export const INITIAL_TRACKS: Track[] = [
  // --- BỘ TRUYỆN TIÊN HIỆP & KIẾM HIỆP ---
  {
    id: 'story-1',
    title: 'Phàm Nhân Tu Tiên - Tập 01: Nhập Thôn Thất Huyền Môn',
    artist: 'MC Tiến Dũng (Diễn Đọc)',
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
    durationSec: 1680,
    plays: 89400,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Hành trình bước vào con đường tu đạo của thiếu niên bình phàm Hàn Lập. Giọng đọc truyền cảm, lôi cuốn kết hợp nhạc nền hùng tráng.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Tiến Dũng',
    authorBio: 'Giọng đọc Tiên Hiệp số 1 cộng đồng audio truyện.'
  },
  {
    id: 'story-2',
    title: 'Phàm Nhân Tu Tiên - Tập 02: Chưởng Thiên Bình Xuất Thế (VIP)',
    artist: 'MC Tiến Dũng (Diễn Đọc)',
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
    durationSec: 1890,
    plays: 64200,
    isVipOnly: true,
    bitrate: 'Spatial 3D Surround Master',
    description: 'Bí mật chiếc bình xanh thần bí giúp thúc dục linh dược vạn năm. Bản thu VIP Spatial 3D độc quyền chất lượng phòng thu.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Tiến Dũng',
  },
  {
    id: 'story-3',
    title: 'Đấu Phá Thương Khung - Tập 01: Thiên Tài Biến Phế Vật',
    artist: 'MC Hoàng Hải',
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
    durationSec: 1450,
    plays: 53100,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Ba mươi năm hà đông, ba mươi năm hà tây, đừng khinh thiếu niên nghèo! Khởi đầu huyền thoại của Tiêu Viêm.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Hoàng Hải'
  },
  {
    id: 'story-4',
    title: 'Tiên Nghịch - Tập 01: Thiếu Niên Vương Lâm Cầu Tiên',
    artist: 'MC Đình Soạn',
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
    durationSec: 1720,
    plays: 48900,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Đạo tu chân tàn khốc, thuận vi phàm, nghịch vi tiên. Khắc họa con đường tu đạo gian truân đẫm máu lửa của Vương Lâm.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Đình Soạn'
  },

  // --- BỘ TRUYỆN MA & TRINH THÁM ĐÊM KHUYA ---
  {
    id: 'story-5',
    title: 'Huyết Án Làng Ma Đêm Mưa - Tập 01',
    artist: 'MC Nguyễn Thành Audio',
    genre: 'Truyện Ma & Trinh Thám',
    durationSec: 2150,
    plays: 97800,
    isVipOnly: true,
    bitrate: 'Lossless 24-bit/96kHz (Âm Thanh Rùng Rợn)',
    description: 'Vụ án bí ẩn tại ngôi làng hẻo lánh giữa rừng già. Tiếng gõ cửa lúc 3 giờ sáng và những cái bóng trắng lẩn khuất.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Nguyễn Thành'
  },
  {
    id: 'story-6',
    title: 'Bác Sĩ Pháp Y Kể Chuyện - Hồ Sơ Kẻ Giấu Mặt',
    artist: 'MC Ánh Nguyệt',
    genre: 'Truyện Ma & Trinh Thám',
    durationSec: 1560,
    plays: 41200,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Những góc khuất phá án li kỳ qua lăng kính giải phẫu pháp y. Từng chứng cứ nhỏ nhất cũng cất lên tiếng nói công lý.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Ánh Nguyệt'
  },
  {
    id: 'story-7',
    title: 'Oan Hồn Cây Đa Cổ Thụ - Chuyện Tâm Linh Có Thật',
    artist: 'MC Quàng A Phìn',
    genre: 'Truyện Ma & Trinh Thám',
    durationSec: 1980,
    plays: 68500,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Chuyện tâm linh dân gian xứ Bắc cực kỳ cuốn hút, dẫn dắt bởi nghệ sĩ kể chuyện tâm linh nổi tiếng Quàng A Phìn.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Quàng A Phìn'
  },

  // --- BỘ TRUYỆN NGÔN TÌNH & ĐÔ THỊ ---
  {
    id: 'story-8',
    title: 'Boss Nghiện Vợ Vô Độ - Tập 01: Gặp Gỡ Định Mệnh',
    artist: 'MC Thanh Mai',
    genre: 'Truyện Ngôn Tình & Đô Thị',
    durationSec: 1420,
    plays: 56300,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Câu chuyện tình yêu ngọt ngào, hài hước và đầy kịch tính của tổng tài bá đạo và cô nàng thiết kế thông minh.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Thanh Mai'
  },
  {
    id: 'story-9',
    title: 'Hôn Trộm 55 Lần - Tập 01: Hợp Đồng Hôn Nhân',
    artist: 'MC Thảo My Audio',
    genre: 'Truyện Ngôn Tình & Đô Thị',
    durationSec: 1380,
    plays: 47900,
    isVipOnly: true,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Siêu phẩm ngôn tình lãng mạn triệu view. Diễn đọc cảm xúc sâu lắng chạm đến trái tim người nghe.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'MC Thảo My'
  },

  // --- SÁCH NÓI & RADIO TINH TUYỂN ---
  {
    id: 'story-10',
    title: 'Sách Nói: Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người',
    artist: 'Radio Tri Thức & Doanh Nhân',
    genre: 'Sách Nói & Radio',
    durationSec: 2400,
    plays: 112000,
    bitrate: '320kbps Hi-Fi Studio',
    description: 'Tác phẩm kinh điển thế giới về nghệ thuật ứng xử, giao tiếp và kết nối con người của Dale Carnegie.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'Radio Tri Thức'
  },
  {
    id: 'story-11',
    title: 'Sách Nói: Nhà Giả Kim - Đi Tìm Kho Báu Cuộc Đời',
    artist: 'Hành Trình Tri Thức',
    genre: 'Sách Nói & Radio',
    durationSec: 2100,
    plays: 87600,
    bitrate: '320kbps Hi-Fi Audio',
    description: 'Khi bạn khao khát một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được điều đó.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    isAuthorVerified: true,
    stageName: 'Hành Trình Tri Thức'
  },

  // --- ÂM NHẠC & PODCAST THƯ GIÃN ---
  {
    id: '1',
    title: 'Midnight Lo-fi Beats',
    artist: 'ChillHop Vibes',
    genre: 'Lo-Fi Chill',
    durationSec: 218,
    plays: 14200,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Deep Coding Horizon',
    artist: 'DevSynthesizer',
    genre: 'Deep Focus',
    durationSec: 184,
    plays: 28900,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Sunset Acoustic Melody',
    artist: 'Elena Rossi',
    genre: 'Acoustic',
    durationSec: 245,
    plays: 9500,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Neon Cyber Odyssey (Studio Master)',
    artist: 'HyperDrive Labs',
    genre: 'Electronic',
    durationSec: 310,
    plays: 35100,
    isVipOnly: true,
    bitrate: 'Lossless 24-bit/96kHz',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    title: 'Zen Tibetan Sanctuary (Spatial 3D Master)',
    artist: 'Mindful Sanctuary',
    genre: 'Ambient & Zen',
    durationSec: 275,
    plays: 18300,
    isVipOnly: true,
    bitrate: 'Spatial 3D Surround',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '6',
    title: 'Tập 01: Sáng tạo & Công nghệ AI',
    artist: 'TechTalk Vietnam Podcast',
    genre: 'Podcast & Talk',
    durationSec: 360,
    plays: 8200,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=600&q=80',
  }
];

export const GENRE_LIST = [
  'Tất cả',
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
  {
    id: 'multiplier_points',
    title: 'Tăng Gấp 3 (x3) Tốc Độ Tích Lũy Xu Haevy',
    category: 'points',
    tierRequired: 'vip',
    shortDesc: 'Nhân 3 toàn bộ Xu Haevy khi nghe nhạc & điểm danh',
    detailedBenefit: 'Toàn bộ thành viên VIP nhận nhân ba (x3) Xu Haevy khi nghe nhạc (+15 xu/phút), điểm danh hằng ngày (+150 xu/ngày) và tương tác cộng đồng.',
    iconName: 'Coins',
    badge: 'x3 Xu Haevy'
  },
  {
    id: 'hifi_sound',
    title: 'Âm thanh Studio Master Lossless 24-bit / 96kHz',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Độ phân giải siêu cao gấp 6 lần chuẩn thường',
    detailedBenefit: 'Tận hưởng từng dải âm trầm sâu lắng, âm trung trong trẻo và âm cao tách bạch với chuẩn nén FLAC không suy hao.',
    iconName: 'Sparkles',
    badge: 'Lossless 24-bit'
  },
  {
    id: 'spatial_3d',
    title: 'Không Gian Âm Nhạc Vòm Spatial 3D Audio',
    category: 'audio',
    tierRequired: 'vip',
    shortDesc: 'Mô phỏng âm thanh 360 độ như đang ở rạp hát',
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
    shortDesc: 'Lưu bài hát trực tiếp vào máy nghe không cần mạng',
    detailedBenefit: 'Tải trọn vẹn danh sách phát yêu thích chuẩn Lossless, nghe mượt mà ngay cả khi trên máy bay hay không có 4G/Wifi.',
    iconName: 'Download',
    badge: 'Offline'
  },
  {
    id: 'ad_free',
    title: 'Trải Nghiệm 100% Không Quảng Cáo & Nghe Nền',
    category: 'playback',
    tierRequired: 'vip',
    shortDesc: 'Phát nhạc liên tục khi khóa màn hình hoặc đa nhiệm',
    detailedBenefit: 'Không bao giờ bị làm phiền bởi quảng cáo gián đoạn cảm xúc, tiết kiệm pin tối đa khi phát ngầm trên thiết bị di động.',
    iconName: 'Zap',
    badge: 'No Ads'
  },
  {
    id: 'unlimited_skips',
    title: 'Bỏ Qua Bài Hát Không Giới Hạn (Unlimited Skips)',
    category: 'playback',
    tierRequired: 'vip',
    shortDesc: 'Tự do chuyển bài hát tiếp theo bất cứ lúc nào',
    detailedBenefit: 'Không bị giới hạn 6 lượt bỏ qua/giờ như bản thường. Bạn làm chủ hoàn toàn danh sách phát theo cảm xúc.',
    iconName: 'Radio',
    badge: 'Unlimited'
  },
  {
    id: 'crossfade_seamless',
    title: 'Âm Nhạc Liền Mạch Crossfade & Gapless Playback',
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
    id: 'sleep_timer_smart_fade',
    title: 'Hẹn Giờ Tắt Thông Minh Tự Động Giảm Dần Âm Lượng',
    category: 'playback',
    tierRequired: 'vip',
    shortDesc: 'Smart Sleep Fade-out bảo vệ giấc ngủ và thính giác',
    detailedBenefit: 'Âm lượng tự động giảm dần tuyến tính trong 60 giây cuối cùng trước khi dừng phát, đưa bạn vào giấc ngủ êm đềm.',
    iconName: 'Zap',
    badge: 'Smart Sleep'
  },
  {
    id: 'vip_aura_badge',
    title: 'Huy Hiệu Vương Miện VIP Mạ Vàng & Golden Aura',
    category: 'social',
    tierRequired: 'vip',
    shortDesc: 'Nổi bật vị thế quý tộc trong mọi bình luận và danh bạ',
    detailedBenefit: 'Tên tài khoản phát sáng màu vàng Gold sang trọng, hiệu ứng khung viền mạ vàng đặc quyền dành riêng cho giới VIP.',
    iconName: 'Crown',
    badge: 'Aura Gold'
  },
  {
    id: 'vip_direct_chat_perks',
    title: 'Đặc Quyền Nhắn Tin: Khung Avatar VIP & Chia Sẻ Nhạc Tốc Độ Cao',
    category: 'social',
    tierRequired: 'vip',
    shortDesc: 'Trò chuyện không giới hạn và tặng quà thần tốc',
    detailedBenefit: 'Mở khóa toàn bộ nhãn dán cao cấp, biểu tượng cảm xúc động và khung avatar vương miện rực rỡ trong Tin Nhắn Bạn Bè.',
    iconName: 'ShieldCheck',
    badge: 'VIP Chat'
  },
  {
    id: 'gift_discount',
    title: 'Đặc Quyền Quà Tặng & Bảng Vàng Top Fan Tác Giả',
    category: 'social',
    tierRequired: 'vip',
    shortDesc: 'Gửi quà tặng kèm hiệu ứng pháo hoa rực rỡ cho thần tượng',
    detailedBenefit: 'Mở khóa toàn bộ kho quà tặng độc quyền trong Cửa Hàng Quà Tác Giả, ghi danh bạn vào Bảng Vàng Vinh Danh của nghệ sĩ.',
    iconName: 'Gift',
    badge: 'Top Fan'
  },
  {
    id: 'vip_exclusive_themes',
    title: 'Kho Giao Diện Cá Nhân Hóa VIP (Royal, Cyber Neon, Luxury)',
    category: 'social',
    tierRequired: 'vip',
    shortDesc: 'Tùy biến không gian âm nhạc theo phong cách riêng',
    detailedBenefit: 'Chuyển đổi giao diện độc quyền: Hoàng Gia Gold, Cyberpunk Neon, Thạch Anh Tím và Ngọc Lục Bảo Quý Phái.',
    iconName: 'Sparkles',
    badge: 'Themes'
  },
  {
    id: 'tts_studio_discount',
    title: 'Haevy Studio: Ưu Đãi Tạo Giọng Đọc AI Voice (-33% Phí)',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Giảm 33% phí chuyển văn bản thành âm thanh AI (50 pts vs 75 pts)',
    detailedBenefit: 'Đặc quyền tạo giọng đọc AI chất lượng cao & phối nhạc nền chỉ với 50 pts/lượt (tiết kiệm 25 Điểm Audio so với người dùng thường).',
    iconName: 'Sparkles',
    badge: 'Studio 50 pts'
  },
  {
    id: 'studio_master_lossless_export',
    title: 'Haevy Studio: Xuất Âm Thanh Studio Master Lossless 24-bit',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Tải và xuất file audio chất lượng phòng thu 24-bit/96kHz',
    detailedBenefit: 'Hỗ trợ xuất file âm thanh chất lượng cao chuẩn FLAC/WAV không nén, phù hợp sản xuất podcast, truyện audio và âm nhạc chuyên nghiệp.',
    iconName: 'Sliders',
    badge: 'Master 24-bit'
  },
  {
    id: 'studio_fast_track_queue',
    title: 'Haevy Studio: Luồng Xử Lý AI Siêu Tốc Độ Ưu Tiên 1',
    category: 'studio',
    tierRequired: 'vip',
    shortDesc: 'Hàng chờ ưu tiên chuyển đổi giọng đọc AI chỉ dưới 2 giây',
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
    id: 'couple_themes_vip',
    title: 'I Love Haevy: Mở Khóa Toàn Bộ Theme Lãng Mạn VIP Độc Quyền',
    category: 'couple',
    tierRequired: 'vip',
    shortDesc: 'Đêm Sao Thiên Hà, Anh Đào Nhật Bản, Hoàng Hôn Tình Yêu & Hoa Hồng',
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
    title: 'Haevy Message: Tin Nhắn Thoại HD Lossless Phòng Thu',
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
    shortDesc: 'Nghe chung một bài hát cùng lúc với bạn bè trong khi nhắn tin',
    detailedBenefit: 'Đồng bộ hóa thanh phát nhạc giữa 2 thiết bị thời gian thực, cùng cảm nhận giai điệu tuyệt hảo ở khoảng cách xa.',
    iconName: 'Radio',
    badge: 'Listen Together'
  },
  {
    id: 'messages_animated_stickers',
    title: 'Haevy Message: Trọn Bộ Nhãn Dán Động VIP & Emoji Độc Quyền',
    category: 'messages',
    tierRequired: 'vip',
    shortDesc: 'Hàng trăm sticker âm nhạc động vui nhộn và pháo hoa chúc mừng',
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
  {
    id: 'early_access',
    title: 'Quyền Nghe Sớm Bản Thu & Album Mới Trước 7 Ngày',
    category: 'exclusives',
    tierRequired: 'vip',
    shortDesc: 'Truy cập kho nhạc độc quyền từ các nghệ sĩ danh tiếng',
    detailedBenefit: 'Trở thành những người đầu tiên thưởng thức các ca khúc, album và podcast độc quyền trước khi phát hành đại chúng.',
    iconName: 'Radio',
    badge: 'Early Access'
  },
  {
    id: 'exclusive_vip_radio',
    title: 'Kênh Radio Độc Quyền VIP 24/7 & Master Playlists',
    category: 'exclusives',
    tierRequired: 'vip',
    shortDesc: 'Đài phát thanh tuyển chọn không giới hạn bởi chuyên gia',
    detailedBenefit: 'Thưởng thức các luồng radio trực tuyến chuẩn Lossless theo tâm trạng: Deep Focus, Acoustic Coffee, Lofi Midnight và EDM Energy.',
    iconName: 'Headphones',
    badge: 'Master Radio'
  },
  {
    id: 'cloud_library_unlimited',
    title: 'Lưu Trữ Danh Sách Phát & Thư Viện Đám Mây Vô Hạn',
    category: 'downloads',
    tierRequired: 'vip',
    shortDesc: 'Tạo hàng trăm Playlist và tự động sao lưu an toàn',
    detailedBenefit: 'Không giới hạn số lượng bài hát trong danh sách yêu thích, đồng bộ tức thì trên mọi thiết bị bạn đăng nhập.',
    iconName: 'Download',
    badge: 'Cloud Sync'
  },
  {
    id: 'dedicated_server',
    title: 'Băng Thông Riêng Zero-Latency Không Giật Lag',
    category: 'downloads',
    tierRequired: 'vip',
    shortDesc: 'Kết nối đường truyền CDN siêu tốc độ độ trễ 0ms',
    detailedBenefit: 'Hệ thống phân luồng máy chủ siêu tốc riêng biệt, bảo đảm phát nhạc tức thì không phải chờ tải bộ đệm ngay cả giờ cao điểm.',
    iconName: 'ShieldCheck',
    badge: 'Dedicated CDN'
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



