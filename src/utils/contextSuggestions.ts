export interface ContextQuickSuggestion {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  iconName: 
    | 'Headphones' 
    | 'Heart' 
    | 'Wallet' 
    | 'Sparkles' 
    | 'Compass' 
    | 'TreePine' 
    | 'MessageSquare' 
    | 'Gamepad2' 
    | 'Mic' 
    | 'Orbit' 
    | 'Sun' 
    | 'Crown' 
    | 'Zap' 
    | 'ShieldCheck' 
    | 'Flame' 
    | 'Radio' 
    | 'Music' 
    | 'Coins' 
    | 'Camera' 
    | 'TrendingUp' 
    | 'Layers'
    | 'GraduationCap'
    | 'MapPin'
    | 'Globe'
    | 'BookOpen';
  actionType: 'prompt' | 'navigate' | 'action';
  prompt?: string;
  targetMode?: string;
  targetTab?: string;
}

export interface ModeContextConfig {
  mode: string;
  displayName: string;
  badge: string;
  iconName: string;
  gradient: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  tagline: string;
  suggestions: ContextQuickSuggestion[];
}

export const ECOSYSTEM_CONTEXT_SUGGESTIONS: Record<string, ModeContextConfig> = {
  audio: {
    mode: 'audio',
    displayName: 'Audio & Thư Viện',
    badge: 'Hi-Fi Master',
    iconName: 'Headphones',
    gradient: 'from-purple-500/20 via-indigo-500/20 to-pink-500/20',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    tagline: 'Kho nhạc Lossless & Truyện Audio',
    suggestions: [
      {
        id: 'audio_mood_ai',
        title: 'Gợi ý nhạc theo tâm trạng',
        subtitle: 'Phân tích cảm xúc & gợi ý 3 bản nhạc ưng ý nhất',
        badge: 'AI Gợi ý',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Phân tích tâm trạng hiện tại của mình và gợi ý 3 bài hát hoặc danh sách nghe nhạc phù hợp nhất trong kho nhạc Haevy.'
      },
      {
        id: 'audio_stats_check',
        title: 'Thống kê lượt nghe hôm nay',
        subtitle: 'Xem tổng thời lượng nghe và người nghe cùng gu',
        badge: 'Thống kê',
        iconName: 'TrendingUp',
        actionType: 'prompt',
        prompt: 'Kiểm tra thống kê lượt nghe audio hôm nay có bao nhiêu người nghe và thời lượng phát sóng?'
      },
      {
        id: 'audio_solfeggio_432',
        title: 'Bật sóng não 432Hz thư giãn',
        subtitle: 'Kích hoạt tần số Solfeggio giúp tập trung sâu',
        badge: 'Sóng não',
        iconName: 'Radio',
        actionType: 'prompt',
        prompt: 'Giải thích tác dụng tần số sóng não 432Hz và bật bài hát thư giãn sâu.'
      },
      {
        id: 'audio_meaning_query',
        title: 'Tra cứu ý nghĩa bài hát',
        subtitle: 'Hỏi AI thông điệp, ca từ & bối cảnh sáng tác',
        badge: 'Phân tích',
        iconName: 'Music',
        actionType: 'prompt',
        prompt: 'Phân tích ý nghĩa ca từ, thông điệp nghệ thuật và bối cảnh sáng tác của bài hát đang phát.'
      }
    ]
  },
  finance: {
    mode: 'finance',
    displayName: 'Sổ Thu Chi 6 Hũ',
    badge: '6 Jars Master',
    iconName: 'Wallet',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    tagline: 'Quản lý tài chính & tự động 6 hũ',
    suggestions: [
      {
        id: 'finance_auto_salary',
        title: 'Tự động thêm lương 15 triệu',
        subtitle: 'Ghi nhận và phân bổ chuẩn xác vào 6 hũ tài chính',
        badge: 'Tự động',
        iconName: 'Coins',
        actionType: 'prompt',
        prompt: 'Tự động thêm giao dịch nhận lương 15 triệu vào sổ thu chi và phân bổ 6 hũ tài chính thông minh giúp mình.'
      },
      {
        id: 'finance_check_balance',
        title: 'Phân tích số dư 6 hũ',
        subtitle: 'Đánh giá tỷ lệ chi tiêu an toàn tháng này',
        badge: 'Báo cáo',
        iconName: 'TrendingUp',
        actionType: 'prompt',
        prompt: 'Kiểm tra số dư hiện tại trong 6 hũ tài chính và đánh giá cơ cấu chi tiêu tháng này.'
      },
      {
        id: 'finance_saving_tips',
        title: 'Tư vấn tiết kiệm thiết thực',
        subtitle: 'Chiến lược cắt giảm chi phí sinh hoạt thừa',
        badge: 'Tư vấn',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Tư vấn 3 mẹo tiết kiệm tài chính thiết thực nhất để tối ưu hóa ngân sách tháng này.'
      },
      {
        id: 'finance_coin_wallet',
        title: 'Tối ưu tích lũy Ví Xu',
        subtitle: 'Hướng dẫn quy đổi điểm thưởng sang lợi ích VIP',
        badge: 'Ví Xu',
        iconName: 'Coins',
        actionType: 'prompt',
        prompt: 'Hướng dẫn tối ưu hóa số dư ví xu và chuyển đổi điểm thưởng trong hệ sinh thái.'
      }
    ]
  },
  couple: {
    mode: 'couple',
    displayName: 'I Love Haevy',
    badge: 'Cặp Đôi 100%',
    iconName: 'Heart',
    gradient: 'from-rose-500/20 via-pink-500/20 to-red-500/20',
    accentBorder: 'border-rose-500/40 hover:border-rose-400',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    tagline: 'Không gian tình yêu & kỷ niệm',
    suggestions: [
      {
        id: 'couple_days_count',
        title: 'Đếm ngày yêu nhau',
        subtitle: 'Tính toán chính xác số ngày bên nhau từng giây',
        badge: 'Đếm ngày',
        iconName: 'Heart',
        actionType: 'prompt',
        prompt: 'Hôm nay là ngày thứ bao nhiêu hai đứa mình yêu nhau rồi?'
      },
      {
        id: 'couple_love_letter',
        title: 'Soạn thư tình ngọt ngào',
        subtitle: 'Viết bức thư ngắn bất ngờ gửi người thương',
        badge: 'Sáng tác',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Soạn một bức thư tình ngắn ngọt ngào, lãng mạn và tinh tế để gửi người yêu nhân dịp bất ngờ.'
      },
      {
        id: 'couple_date_ideas',
        title: '3 ý tưởng hẹn hò cuối tuần',
        subtitle: 'Kế hoạch hẹn hò lãng mạn và ấm cúng',
        badge: 'Hẹn hò',
        iconName: 'Flame',
        actionType: 'prompt',
        prompt: 'Gợi ý 3 kế hoạch hẹn hò cuối tuần lãng mạn, ấm cúng và bất ngờ dành cho cặp đôi.'
      },
      {
        id: 'couple_anniversary_ping',
        title: 'Đếm ngược mốc kỷ niệm',
        subtitle: 'Bao nhiêu ngày nữa tới mốc 100 / 500 / 1000 ngày',
        badge: 'Cột mốc',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Bao nhiêu ngày nữa là đến cột mốc kỷ niệm tiếp theo của hai đứa?'
      }
    ]
  },
  spiritual: {
    mode: 'spiritual',
    displayName: 'Haevy Tâm Linh',
    badge: 'Năng Lượng & Phong Thủy',
    iconName: 'Compass',
    gradient: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
    accentBorder: 'border-violet-500/40 hover:border-violet-400',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-300',
    tagline: 'Tần số năng lượng & bài học vũ trụ',
    suggestions: [
      {
        id: 'spiritual_tarot_daily',
        title: 'Rút quẻ Tarot hôm nay',
        subtitle: 'Thông điệp vũ trụ dẫn lối cho ngày mới',
        badge: 'Tarot AI',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Rút một lá bài Tarot ngẫu nhiên và giải đoán thông điệp năng lượng vũ trụ cho mình hôm nay.'
      },
      {
        id: 'spiritual_chakra_solfeggio',
        title: 'Tần số Solfeggio luân xa',
        subtitle: 'Cân bằng luân xa tim & tâm trí với 528Hz',
        badge: 'Chữa lành',
        iconName: 'Radio',
        actionType: 'prompt',
        prompt: 'Gợi ý tần số âm thanh Solfeggio chữa lành luân xa phù hợp với năng lượng hiện tại.'
      },
      {
        id: 'spiritual_fengshui_direction',
        title: 'Xem hướng & màu may mắn',
        subtitle: 'Tư vấn năng lượng không gian và hướng tốt',
        badge: 'Phong thủy',
        iconName: 'Compass',
        actionType: 'prompt',
        prompt: 'Tư vấn năng lượng phong thủy, hướng xuất hành tốt và màu sắc may mắn cho ngày hôm nay.'
      }
    ]
  },
  family_tree: {
    mode: 'family_tree',
    displayName: 'Gia Phả Số Dòng Họ',
    badge: 'Gia Phả Dòng Họ',
    iconName: 'TreePine',
    gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    tagline: 'Lưu truyền ký ức & cội nguồn',
    suggestions: [
      {
        id: 'family_tree_relationship',
        title: 'Tra cứu xưng hô thân tộc',
        subtitle: 'Xác định cách gọi đúng thứ bậc dòng họ',
        badge: 'Xưng hô',
        iconName: 'TreePine',
        actionType: 'prompt',
        prompt: 'Tra cứu mối quan hệ xưng hô thân tộc chuẩn xác theo văn hóa truyền thống Việt Nam.'
      },
      {
        id: 'family_interview_elders',
        title: 'Phỏng vấn ký ức ông bà',
        subtitle: '5 câu hỏi hay để lưu lại hồi ký tiền bối',
        badge: 'Gợi ý',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Gợi ý 5 câu hỏi phỏng vấn hay và sâu sắc để ghi lại hồi ký và câu chuyện của ông bà cha mẹ.'
      },
      {
        id: 'family_clan_anniversary',
        title: 'Nhắc ngày giỗ & sự kiện họ',
        subtitle: 'Theo dõi các ngày kỷ niệm dòng họ sắp tới',
        badge: 'Kỷ niệm',
        iconName: 'TrendingUp',
        actionType: 'prompt',
        prompt: 'Xem danh sách và nhắc nhở các ngày kỷ niệm, ngày giỗ dòng họ sắp diễn ra.'
      }
    ]
  },
  messages: {
    mode: 'messages',
    displayName: 'Bản Tin & Trò Chuyện',
    badge: 'Mạng Xã Hội',
    iconName: 'MessageSquare',
    gradient: 'from-sky-500/20 via-blue-500/20 to-indigo-500/20',
    accentBorder: 'border-sky-500/40 hover:border-sky-400',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    tagline: 'Kết nối bạn bè & chia sẻ khoảnh khắc',
    suggestions: [
      {
        id: 'msg_caption_gen',
        title: 'Gợi ý caption Bản Tin cực chất',
        subtitle: '3 câu caption ảnh cuốn hút, tạo tương tác cao',
        badge: 'Caption AI',
        iconName: 'Camera',
        actionType: 'prompt',
        prompt: 'Viết giúp mình 3 câu caption ảnh cực chất, ngắn gọn và thu hút tương tác cho bài đăng Bản Tin.'
      },
      {
        id: 'msg_conversation_starter',
        title: 'Bắt chuyện tự nhiên dí dỏm',
        subtitle: 'Mở đầu tin nhắn thân thiện, xóa tan ngại ngùng',
        badge: 'Giao tiếp',
        iconName: 'MessageSquare',
        actionType: 'prompt',
        prompt: 'Gợi ý cách mở đầu cuộc trò chuyện tự nhiên, dí dỏm và tinh tế để nhắn cho một người bạn mới.'
      },
      {
        id: 'msg_birthday_wishes',
        title: 'Soạn lời chúc sinh nhật',
        subtitle: 'Lời chúc ấm áp, tràn đầy năng lượng tích cực',
        badge: 'Lời chúc',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Tạo lời chúc mừng sinh nhật tràn đầy năng lượng, hài hước và tình cảm dành cho bạn thân.'
      }
    ]
  },
  games: {
    mode: 'games',
    displayName: 'Haevy Minigames',
    badge: 'Săn Xu Thưởng',
    iconName: 'Gamepad2',
    gradient: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
    accentBorder: 'border-yellow-500/40 hover:border-yellow-400',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-300',
    tagline: 'Đấu trường dự đoán & kiếm xu vui nhộn',
    suggestions: [
      {
        id: 'games_coins_strategy',
        title: 'Bí quyết săn Xu tối đa',
        subtitle: 'Mẹo tối ưu điểm thưởng từ các minigame',
        badge: 'Mẹo chơi',
        iconName: 'Coins',
        actionType: 'prompt',
        prompt: 'Hướng dẫn các mẹo chơi minigame để nhận tối đa xu thưởng và điểm tương tác hôm nay.'
      },
      {
        id: 'games_rules_arena',
        title: 'Quy tắc đấu trường dự đoán',
        subtitle: 'Thể lệ tham gia & cơ chế chia thưởng công bằng',
        badge: 'Thể lệ',
        iconName: 'Gamepad2',
        actionType: 'prompt',
        prompt: 'Giải thích cơ chế chơi và nhận thưởng trong đấu trường cộng đồng dự đoán.'
      },
      {
        id: 'games_rewards_exchange',
        title: 'Đổi Xu lấy quà độc quyền',
        subtitle: 'Khám phá các vật phẩm và huy hiệu đặc biệt',
        badge: 'Quà tặng',
        iconName: 'Crown',
        actionType: 'prompt',
        prompt: 'Xem danh sách quà tặng và vật phẩm độc quyền có thể đổi bằng Xu trong kho Haevy.'
      }
    ]
  },
  studio: {
    mode: 'studio',
    displayName: 'Haevy Studio',
    badge: 'Phòng Thu Nhạc',
    iconName: 'Mic',
    gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    tagline: 'Sáng tạo nhạc số & hòa âm phối khí',
    suggestions: [
      {
        id: 'studio_lyrics_chorus',
        title: 'Sáng tác điệp khúc bài hát',
        subtitle: 'Viết đoạn chorus pop/acoustic bắt tai',
        badge: 'Lời bài hát',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Viết một đoạn lời bài hát điệp khúc theo phong cách Pop/Ballad giàu hình ảnh về thanh xuân.'
      },
      {
        id: 'studio_chord_progression',
        title: 'Gợi ý vòng hòa âm chuẩn',
        subtitle: 'Vòng hợp âm Acoustic, Lo-fi êm ái, giàu xúc cảm',
        badge: 'Hòa âm',
        iconName: 'Music',
        actionType: 'prompt',
        prompt: 'Gợi ý các vòng hợp âm chuẩn cảm xúc cho bài hát thể loại Acoustic hoặc Lo-Fi Chill.'
      },
      {
        id: 'studio_verified_author',
        title: 'Đăng ký tác giả có tích xanh',
        subtitle: 'Hướng dẫn nộp hồ sơ nhận tích xanh tác giả',
        badge: 'Tác giả',
        iconName: 'ShieldCheck',
        actionType: 'prompt',
        prompt: 'Hướng dẫn chi tiết các bước nộp hồ sơ để được cấp tích xanh xác minh tác giả trên Haevy.'
      }
    ]
  },
  space: {
    mode: 'space',
    displayName: 'Haevy Space 3D',
    badge: 'Vũ Trụ 3D',
    iconName: 'Orbit',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    tagline: 'Không gian đa chiều & Spatial Audio',
    suggestions: [
      {
        id: 'space_galaxy_tour',
        title: 'Thuyết minh dải ngân hà 3D',
        subtitle: 'Khám phá chòm sao và nguồn gốc thiên thể',
        badge: 'Khám phá',
        iconName: 'Orbit',
        actionType: 'prompt',
        prompt: 'Thuyết minh về nguồn gốc các chòm sao và dải ngân hà trong không gian 3D của Haevy Space.'
      },
      {
        id: 'space_spatial_setup',
        title: 'Thiết lập Spatial Audio 3D',
        subtitle: 'Bật âm thanh vòm 360 độ sống động',
        badge: 'Âm thanh 3D',
        iconName: 'Headphones',
        actionType: 'prompt',
        prompt: 'Hướng dẫn thiết lập âm thanh không gian 3 chiều Spatial Audio để có trải nghiệm đỉnh cao.'
      },
      {
        id: 'space_zen_stars',
        title: 'Thiền định giữa các vì sao',
        subtitle: 'Thả lỏng tâm trí trong không gian vô tận',
        badge: 'Thiền định',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Dẫn dắt một bài thiền buông thư tâm trí sâu lắng giữa không gian bao la của vũ trụ.'
      }
    ]
  },
  morning: {
    mode: 'morning',
    displayName: 'Buổi Sáng Năng Lượng',
    badge: 'Chào Ngày Mới',
    iconName: 'Sun',
    gradient: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    tagline: 'Khởi đầu ngày mới tràn đầy nhiệt huyết',
    suggestions: [
      {
        id: 'morning_three_tasks',
        title: 'Lên lịch 3 việc then chốt',
        subtitle: 'Tập trung hoàn thành mục tiêu quan trọng nhất',
        badge: 'Kế hoạch',
        iconName: 'TrendingUp',
        actionType: 'prompt',
        prompt: 'Giúp mình lên danh sách 3 nhiệm vụ quan trọng nhất cần hoàn thành hôm nay để đạt hiệu suất cao.'
      },
      {
        id: 'morning_breath_exercise',
        title: 'Bài thở 4-7-8 tỉnh táo',
        subtitle: 'Nạp oxy cho não bộ, sảng khoái tức thì',
        badge: 'Tỉnh táo',
        iconName: 'Sun',
        actionType: 'prompt',
        prompt: 'Hướng dẫn từng nhịp bài tập thở 4-7-8 giúp cơ thể tỉnh táo và tràn đầy năng lượng ngay tức thì.'
      },
      {
        id: 'morning_quote_inspire',
        title: 'Danh ngôn truyền cảm hứng',
        subtitle: 'Tiếp thêm năng lượng tích cực cho ngày mới',
        badge: 'Động lực',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Gửi tặng một danh ngôn sâu sắc và lời chúc may mắn để bắt đầu một ngày mới rực rỡ.'
      }
    ]
  },
  vip: {
    mode: 'vip',
    displayName: 'Đặc Quyền VIP',
    badge: 'Hoàng Gia',
    iconName: 'Crown',
    gradient: 'from-amber-500/20 via-yellow-500/20 to-orange-500/20',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    tagline: 'Chất lượng Lossless & trải nghiệm độc quyền',
    suggestions: [
      {
        id: 'vip_lossless_setup',
        title: 'Tối ưu âm thanh Hi-Fi Lossless',
        subtitle: 'Kích hoạt nhạc không nén 24-bit/192kHz',
        badge: 'Hi-Fi Master',
        iconName: 'Headphones',
        actionType: 'prompt',
        prompt: 'Tối ưu hóa cài đặt Hi-Fi Lossless và Bass Boost cho tài khoản VIP.'
      },
      {
        id: 'vip_daily_reward',
        title: 'Nhận 150 Xu thưởng VIP',
        subtitle: 'Phần thưởng hội viên tri ân mỗi ngày',
        badge: 'Nhận Xu',
        iconName: 'Coins',
        actionType: 'prompt',
        prompt: 'Cho mình xin nhận 150 Xu thưởng tương tác hàng ngày cùng Haevy AI nhé!'
      },
      {
        id: 'vip_golden_aura',
        title: 'Bật hào quang Golden Aura',
        subtitle: 'Giao diện hoàng gia và biểu tượng tỏa sáng',
        badge: 'Độc quyền',
        iconName: 'Crown',
        actionType: 'prompt',
        prompt: 'Hướng dẫn kích hoạt hiệu ứng hào quang vàng Golden Aura và biểu tượng vương miện VIP.'
      }
    ]
  },
  haevy_lite: {
    mode: 'haevy_lite',
    displayName: 'Haevy Lite',
    badge: 'Siêu Nhẹ',
    iconName: 'Zap',
    gradient: 'from-emerald-500/20 via-lime-500/20 to-teal-500/20',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    tagline: 'Tiết kiệm pin, RAM và dung lượng mạng',
    suggestions: [
      {
        id: 'lite_performance_test',
        title: 'Kiểm tra mức tiết kiệm',
        subtitle: 'Xem lượng RAM và pin đã được tối ưu hóa',
        badge: 'Hiệu suất',
        iconName: 'Zap',
        actionType: 'prompt',
        prompt: 'Đánh giá mức tối ưu RAM, pin và dung lượng mạng của chế độ Haevy Lite.'
      },
      {
        id: 'lite_ambient_playlist',
        title: 'Nghe nhạc nhẹ không tốn ram',
        subtitle: 'Danh sách phát êm dịu, mượt mà trên máy yếu',
        badge: 'Nhạc nhẹ',
        iconName: 'Headphones',
        actionType: 'prompt',
        prompt: 'Gợi ý các bản nhạc dung lượng nhẹ, êm dịu không tốn tài nguyên máy.'
      },
      {
        id: 'lite_switch_full',
        title: 'Mở bản đầy đủ Portal',
        subtitle: 'Trải nghiệm đồ họa không gian 3D phong phú',
        badge: 'Chuyển chế độ',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Hướng dẫn quay lại chế độ đầy đủ với đầy đủ hiệu ứng âm thanh và đồ họa.'
      }
    ]
  },
  support: {
    mode: 'support',
    displayName: 'Trung Tâm Cứu Hộ 24/7',
    badge: 'Support 24/7',
    iconName: 'ShieldCheck',
    gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
    accentBorder: 'border-amber-500/40 hover:border-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    tagline: 'Cứu hộ khẩn cấp & trợ giúp kỹ thuật',
    suggestions: [
      {
        id: 'support_troubleshoot_now',
        title: 'Chẩn đoán sự cố tự động',
        subtitle: 'AI quét và hướng dẫn sửa lỗi âm thanh & kết nối',
        badge: 'Cứu hộ AI',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Tôi đang gặp sự cố khi sử dụng ứng dụng. Hãy hướng dẫn tôi cách chẩn đoán và khắc phục nhanh nhất.'
      },
      {
        id: 'support_faq_query',
        title: 'Tra cứu câu hỏi thường gặp',
        subtitle: 'Xem hướng dẫn nạp Xu, bảo mật & khôi phục mã PIN',
        badge: 'FAQ',
        iconName: 'Compass',
        actionType: 'prompt',
        prompt: 'Hướng dẫn tôi các câu hỏi thường gặp về cách khôi phục mã PIN, cài đặt PWA và bảo vệ tài khoản.'
      }
    ]
  },
  profile: {
    mode: 'profile',
    displayName: 'Hồ Sơ & Danh Tính',
    badge: 'User Identity',
    iconName: 'Sparkles',
    gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
    accentBorder: 'border-indigo-500/40 hover:border-indigo-400',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    tagline: 'Cài đặt tài khoản, bảo mật & danh hiệu',
    suggestions: [
      {
        id: 'profile_security_audit',
        title: 'Đánh giá điểm an ninh 6 lớp',
        subtitle: 'Kiểm tra mã PIN ví, xác thực 2 bước và E2EE',
        badge: 'Bảo mật',
        iconName: 'ShieldCheck',
        actionType: 'prompt',
        prompt: 'Hãy đánh giá điểm an ninh tài khoản của tôi và hướng dẫn hoàn thiện 6 lớp bảo vệ dữ liệu cá nhân.'
      },
      {
        id: 'profile_badge_upgrade',
        title: 'Nâng cấp danh hiệu & huy hiệu',
        subtitle: 'Khám phá cách mở khóa huy hiệu VIP Hoàng Gia',
        badge: 'Huy hiệu',
        iconName: 'Crown',
        actionType: 'prompt',
        prompt: 'Làm thế nào để tôi có thể mở khóa các huy hiệu quý giá và danh hiệu thành viên tích cực trên Haevy?'
      }
    ]
  },
  admin: {
    mode: 'admin',
    displayName: 'Quản Trị Hệ Thống',
    badge: 'System Admin',
    iconName: 'ShieldCheck',
    gradient: 'from-red-500/20 via-amber-500/20 to-purple-500/20',
    accentBorder: 'border-red-500/40 hover:border-red-400',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-300',
    tagline: 'Bảng điều khiển và quản lý người dùng',
    suggestions: [
      {
        id: 'admin_audit_report',
        title: 'Tóm tắt tình trạng hệ thống',
        subtitle: 'Báo cáo số liệu người dùng, giao dịch và hiệu năng',
        badge: 'Báo cáo',
        iconName: 'TrendingUp',
        actionType: 'prompt',
        prompt: 'Tóm tắt các chỉ số vận hành quan trọng, báo cáo an ninh và khuyến nghị tối ưu hệ sinh thái.'
      }
    ]
  },
  edu: {
    mode: 'edu',
    displayName: 'Haevy Edu & STEM Lab',
    badge: 'Deep Study AI',
    iconName: 'GraduationCap',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    accentBorder: 'border-cyan-500/40 hover:border-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    tagline: 'Khoa học thực nghiệm & Tư duy First Principles',
    suggestions: [
      {
        id: 'edu_first_principles',
        title: 'Phân tích bản chất First Principles',
        subtitle: 'Giải thích nguyên lý gốc rễ, cạm bẫy học vẹt & tóm tắt cô đọng',
        badge: 'Gemini 3.5',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Hãy phân tích nguyên lý gốc rễ (First Principles) của bài học này: giải thích bản chất logic vận hành, chỉ ra cạm bẫy học vẹt và tóm tắt cô đọng.'
      },
      {
        id: 'edu_casio_tactic',
        title: 'Bí quyết Casio fx-880 BTG',
        subtitle: 'Mở máy tính khoa học & mẹo giải nhanh kỳ thi THPT',
        badge: 'Casio Tools',
        iconName: 'Layers',
        actionType: 'navigate',
        targetTab: 'tools'
      },
      {
        id: 'edu_virtual_lab',
        title: 'Vào Phòng Thí Nghiệm Ảo',
        subtitle: 'Tương tác vật lý, hóa học, sinh học với thanh trượt trực quan',
        badge: 'STEM Lab',
        iconName: 'Orbit',
        actionType: 'navigate',
        targetTab: 'labs'
      },
      {
        id: 'edu_doc_processor',
        title: 'Trích xuất tài liệu nội bộ',
        subtitle: 'Đọc dữ liệu nội bộ và bóc tách kiến thức trọng tâm',
        badge: 'Bóc tách',
        iconName: 'GraduationCap',
        actionType: 'prompt',
        prompt: 'Trích xuất và tóm tắt bản chất logic các định luật bảo toàn từ tài liệu nội bộ, không học thuộc lòng công thức.'
      }
    ]
  },
  maps: {
    mode: 'maps',
    displayName: 'Haevy Maps & Định Vị Gia Đình',
    badge: 'Safe Geolocation',
    iconName: 'MapPin',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    tagline: 'Bản đồ định vị gia đình & cảnh báo vùng an toàn',
    suggestions: [
      {
        id: 'maps_safe_route',
        title: 'AI Tư vấn điểm hẹn & Lộ trình an toàn',
        subtitle: 'Tính toán điểm giao cân bằng khoảng cách giữa các thành viên',
        badge: 'Định vị AI',
        iconName: 'Compass',
        actionType: 'prompt',
        prompt: 'Hãy gợi ý cách chọn điểm hẹn an toàn, cân bằng khoảng cách giữa các thành viên gia đình và thiết lập cảnh báo Geofencing.'
      },
      {
        id: 'maps_geofence_zones',
        title: 'Xem Vùng An Toàn Gia Đình',
        subtitle: 'Kiểm tra cảnh báo ra/vào trường học, cơ quan và nhà ở',
        badge: 'Geofence',
        iconName: 'ShieldCheck',
        actionType: 'navigate',
        targetTab: 'zones'
      }
    ]
  },
  haevy_ai: {
    mode: 'haevy_ai',
    displayName: 'Vũ Trụ Haevy AI & MCP',
    badge: 'Universal AI',
    iconName: 'Sparkles',
    gradient: 'from-purple-500/20 via-pink-500/20 to-amber-500/20',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    tagline: 'Model Context Protocol & Trợ lý thông minh toàn diện',
    suggestions: [
      {
        id: 'ai_mcp_security_audit',
        title: 'Quét An Toàn Bảo Mật MCP',
        subtitle: 'Kiểm tra token, rò rỉ dữ liệu nhạy cảm E2EE và quyền truy cập',
        badge: 'Bảo mật E2EE',
        iconName: 'ShieldCheck',
        actionType: 'prompt',
        prompt: 'Tiến hành kiểm tra an toàn dữ liệu Model Context Protocol (MCP) và đề xuất các biện pháp bảo vệ tài khoản.'
      },
      {
        id: 'ai_deep_first_principles_switch',
        title: 'Chuyển sang Học Sâu First Principles',
        subtitle: 'Phân tích bản chất mọi chủ đề học tập cùng Gemini 3.5 Flash',
        badge: 'First Principles',
        iconName: 'GraduationCap',
        actionType: 'navigate',
        targetMode: 'edu',
        targetTab: 'assistant'
      }
    ]
  },
  internet: {
    mode: 'internet',
    displayName: 'Haevy Internet',
    badge: 'Web 4.0 Pro 🌐',
    iconName: 'Globe',
    gradient: 'from-sky-500/20 via-blue-500/20 to-indigo-500/20',
    accentBorder: 'border-sky-500/40 hover:border-sky-400',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    tagline: 'Trình duyệt web đa tab & AI Reader tách từ Haevy AI',
    suggestions: [
      {
        id: 'internet_summarize_content',
        title: 'Tóm tắt bài viết đang đọc',
        subtitle: 'Bóc tách ý cốt lõi, loại bỏ quảng cáo',
        badge: 'Tóm tắt AI',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Hãy tóm tắt ngắn gọn các điểm chính của bài viết trên trang web hiện tại.'
      },
      {
        id: 'internet_reader_clean',
        title: 'Bật chế độ đọc sạch Reader',
        subtitle: 'Font chữ đọc sách, nền dịu mắt',
        badge: 'Đọc sạch',
        iconName: 'BookOpen',
        actionType: 'navigate',
        targetMode: 'internet',
        targetTab: 'ai_reader'
      },
      {
        id: 'internet_check_url',
        title: 'Kiểm tra bảo mật trang web',
        subtitle: 'Quét chứng chỉ SSL & cảnh báo giả mạo',
        badge: 'Bảo mật SSL',
        iconName: 'ShieldCheck',
        actionType: 'prompt',
        prompt: 'Đánh giá tính an toàn bảo mật và độ tin cậy của trang web đang mở.'
      }
    ]
  },
  portal: {
    mode: 'portal',
    displayName: 'Cổng Hệ Sinh Thái',
    badge: 'Ecosystem',
    iconName: 'Sparkles',
    gradient: 'from-purple-500/20 via-indigo-500/20 to-pink-500/20',
    accentBorder: 'border-purple-500/40 hover:border-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    tagline: 'Trung tâm kết nối toàn bộ hệ sinh thái Haevy',
    suggestions: [
      {
        id: 'portal_explore_features',
        title: 'Khám phá tính năng hot hôm nay',
        subtitle: 'Giới thiệu các điểm nổi bật của 12 chế độ',
        badge: 'Khám phá',
        iconName: 'Sparkles',
        actionType: 'prompt',
        prompt: 'Giới thiệu các tính năng độc đáo nhất trong hệ sinh thái Haevy và gợi ý trải nghiệm.'
      },
      {
        id: 'portal_security_audit',
        title: 'Kiểm tra 6 lớp bảo mật',
        subtitle: 'Đánh giá độ an toàn tài khoản & điểm an ninh',
        badge: 'Bảo mật',
        iconName: 'ShieldCheck',
        actionType: 'prompt',
        prompt: 'Kiểm tra mức độ an toàn tài khoản của mình và hướng dẫn kích hoạt 6 lớp bảo vệ.'
      },
      {
        id: 'portal_daily_coins',
        title: 'Nhận 150 Xu tương tác',
        subtitle: 'Tích điểm hàng ngày cùng trợ lý Haevy AI',
        badge: 'Nhận Xu',
        iconName: 'Coins',
        actionType: 'prompt',
        prompt: 'Cho mình xin nhận 150 Xu thưởng tương tác hàng ngày cùng Haevy AI nhé!'
      },
      {
        id: 'portal_mood_recommend',
        title: 'Tư vấn chế độ theo tâm trạng',
        subtitle: 'Gợi ý chế độ phù hợp với nhu cầu lúc này',
        badge: 'Tư vấn',
        iconName: 'Headphones',
        actionType: 'prompt',
        prompt: 'Tư vấn chế độ phù hợp nhất với cảm xúc và nhu cầu của mình ngay lúc này.'
      }
    ]
  }
};

/**
 * Get the context configuration and suggestions for the current mode.
 * Falls back to 'portal' if the mode is unknown or undefined.
 */
export function getContextSuggestionsForMode(
  mode?: string, 
  activeTab?: string,
  hasActiveTrack: boolean = false
): ModeContextConfig {
  const normalizedMode = (mode || 'portal').toLowerCase();
  
  // Specific tab or sub-mode mappings
  if (normalizedMode === 'audio_library') {
    return ECOSYSTEM_CONTEXT_SUGGESTIONS.audio;
  }
  
  const config = ECOSYSTEM_CONTEXT_SUGGESTIONS[normalizedMode] || ECOSYSTEM_CONTEXT_SUGGESTIONS.portal;

  // If music is actively playing in any mode, enrich with an audio meaning query if not already present
  if (hasActiveTrack && normalizedMode !== 'audio') {
    const hasAudioSuggestion = config.suggestions.some(s => s.id === 'track_meaning_live');
    if (!hasAudioSuggestion) {
      return {
        ...config,
        suggestions: [
          {
            id: 'track_meaning_live',
            title: 'Hỏi AI bài hát đang phát',
            subtitle: 'Tra cứu thông điệp bài hát đang nghe nền',
            badge: 'Đang phát',
            iconName: 'Headphones',
            actionType: 'prompt',
            prompt: 'Phân tích ý nghĩa bài hát đang phát và thông điệp nghệ thuật của bài hát này.'
          },
          ...config.suggestions
        ]
      };
    }
  }

  return config;
}
