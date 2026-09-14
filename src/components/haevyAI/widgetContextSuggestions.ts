import React from 'react';
import { 
  Music, 
  Headphones, 
  Heart, 
  Wallet, 
  Bell, 
  Sparkles, 
  MessageCircle, 
  Mic, 
  Disc3, 
  Sun, 
  TreePine, 
  Sliders, 
  ShieldCheck, 
  Flame, 
  BrainCircuit, 
  Gift,
  Compass,
  Zap,
  Coffee,
  Feather,
  Wand2,
  Calendar,
  Gamepad2,
  Share2,
  ScrollText,
  LucideIcon
} from 'lucide-react';
import { EcosystemMode } from '../../types';

export interface WidgetContextSuggestion {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badge?: string;
  actionType: 'ai_prompt' | 'navigate_tab' | 'navigate_mode' | 'voice_command' | 'custom_action';
  aiPrompt?: string;
  targetMode?: EcosystemMode | string;
  targetTab?: string;
}

export interface ModeContextInfo {
  modeKey: string;
  modeName: string;
  badge: string;
  iconName: string;
  accentGradient: string;
  themeColor: string;
  suggestions: WidgetContextSuggestion[];
}

export const CONTEXT_SUGGESTIONS_MAP: Record<string, ModeContextInfo> = {
  // 1. Audio Stream / Music Mode
  audio: {
    modeKey: 'audio',
    modeName: 'Thế Giới Âm Thanh',
    badge: 'Audio Stream',
    iconName: 'Headphones',
    accentGradient: 'from-amber-400 to-yellow-500',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'audio_mood_ai',
        title: 'Gợi ý nhạc theo tâm trạng',
        description: 'AI chọn lọc bài hát phù hợp với cảm xúc & thời điểm',
        tag: 'AI Music DJ',
        iconName: 'Sparkles',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        badge: 'Gợi ý ngay',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy gợi ý cho tôi 5 bài hát hoặc thể loại âm nhạc phù hợp để thư giãn, xua tan căng thẳng và tập trung làm việc hiệu quả ngay lúc này.'
      },
      {
        id: 'audio_spatial_fx',
        title: 'Bật Spatial 3D & Bass Boost',
        description: 'Mở bộ chỉnh âm vòm và tối ưu chất lượng âm thanh',
        tag: 'Equalizer Hi-Fi',
        iconName: 'Sliders',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-950/40',
        borderClass: 'border-yellow-500/40 hover:border-yellow-400',
        actionType: 'navigate_tab',
        targetTab: 'equalizer'
      },
      {
        id: 'audio_lyrics_sentiment',
        title: 'Phân tích cảm xúc bài hát',
        description: 'Khám phá câu chuyện & thông điệp nghệ thuật ca từ',
        tag: 'Cảm thụ âm nhạc',
        iconName: 'Disc3',
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-950/40',
        borderClass: 'border-sky-500/40 hover:border-sky-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy phân tích ý nghĩa ca từ, thông điệp nghệ thuật và cấu trúc cảm xúc của bài hát đang nghe trên Haevy Audio.'
      }
    ]
  },

  // 2. Audio Library Mode
  audio_library: {
    modeKey: 'audio_library',
    modeName: 'Thư Viện Âm Thanh',
    badge: 'Audio Hub',
    iconName: 'Music',
    accentGradient: 'from-amber-400 to-orange-500',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'library_smart_playlist',
        title: 'Tạo danh sách phát thông minh',
        description: 'AI nhóm các bản nhạc yêu thích theo gu riêng biệt',
        tag: 'Smart Playlist',
        iconName: 'Wand2',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy tư vấn cho tôi cách sắp xếp và tuyển tập một danh sách phát (playlist) gồm các bài hát nhẹ nhàng, thư thái dành cho ban đêm.'
      },
      {
        id: 'library_hifi_check',
        title: 'Bộ lọc Lossless Hi-Fi',
        description: 'Lọc các tác phẩm chất lượng cao Flac 24-bit',
        tag: 'Lossless Audio',
        iconName: 'Headphones',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-950/40',
        borderClass: 'border-yellow-500/40 hover:border-yellow-400',
        actionType: 'navigate_tab',
        targetTab: 'library'
      }
    ]
  },

  // 3. Social Messages & Feed Mode
  messages: {
    modeKey: 'messages',
    modeName: 'Bản Tin & Bạn Bè',
    badge: 'Social & Feed',
    iconName: 'MessageCircle',
    accentGradient: 'from-sky-400 to-indigo-500',
    themeColor: 'sky',
    suggestions: [
      {
        id: 'msg_caption_creator',
        title: 'Gợi ý caption ảnh độc lạ',
        description: 'Viết dòng trạng thái cuốn hút cho Story hoặc Bản Tin',
        tag: 'Sáng tạo Caption',
        iconName: 'Sparkles',
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-950/40',
        borderClass: 'border-sky-500/40 hover:border-sky-400',
        badge: 'Bắt trend',
        actionType: 'ai_prompt',
        aiPrompt: 'Gợi ý cho tôi 3 dòng trạng thái (caption) ảnh ngắn gọn, tinh tế, bắt trend và truyền cảm hứng để đăng lên Bản Tin khoảnh khắc.'
      },
      {
        id: 'msg_feed_switch',
        title: 'Mở Bản Tin Khoảnh Khắc',
        description: 'Xem ảnh Story & phản ứng cảm xúc của bạn bè',
        tag: 'Bản tin nhanh',
        iconName: 'Share2',
        colorClass: 'text-indigo-400',
        bgClass: 'bg-indigo-950/40',
        borderClass: 'border-indigo-500/40 hover:border-indigo-400',
        actionType: 'navigate_tab',
        targetTab: 'feed'
      },
      {
        id: 'msg_warm_greeting',
        title: 'Soạn lời thăm hỏi ngọt ngào',
        description: 'Gửi lời chúc ấm áp cho bạn thân hoặc người thân',
        tag: 'AI Thấu cảm',
        iconName: 'Heart',
        colorClass: 'text-rose-400',
        bgClass: 'bg-rose-950/40',
        borderClass: 'border-rose-500/40 hover:border-rose-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy viết giúp tôi một tin nhắn ngắn gọn, ấm áp và chân thành để hỏi thăm và chúc ngày mới bình an đến một người bạn thân.'
      }
    ]
  },

  // 4. Couple Romance Space
  couple: {
    modeKey: 'couple',
    modeName: 'Không Gian Cặp Đôi',
    badge: 'Love & Romance',
    iconName: 'Heart',
    accentGradient: 'from-rose-400 to-pink-500',
    themeColor: 'rose',
    suggestions: [
      {
        id: 'couple_date_idea',
        title: 'Ý tưởng hẹn hò bất ngờ',
        description: 'Gợi ý kế hoạch lãng mạn, ấm cúng cuối tuần cho 2 người',
        tag: 'Ý tưởng hẹn hò',
        iconName: 'Sparkles',
        colorClass: 'text-rose-400',
        bgClass: 'bg-rose-950/40',
        borderClass: 'border-rose-500/40 hover:border-rose-400',
        badge: 'Lãng mạn',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy gợi ý 3 ý tưởng hẹn hò lãng mạn, tinh tế, tiết kiệm nhưng tràn đầy bất ngờ và ấm áp vào dịp cuối tuần cho cặp đôi.'
      },
      {
        id: 'couple_love_letter',
        title: 'Soạn thư tình giấu kín',
        description: 'Viết lời nhắn yêu thương chân thành chạm đến trái tim',
        tag: 'Tâm sự đôi lứa',
        iconName: 'Feather',
        colorClass: 'text-pink-400',
        bgClass: 'bg-pink-950/40',
        borderClass: 'border-pink-500/40 hover:border-pink-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Soạn giúp tôi một bức thư tình ngắn hoặc lời nhắn yêu thương chân thành, sâu sắc để gửi đến nửa kia nhân dịp đặc biệt.'
      },
      {
        id: 'couple_days_counter',
        title: 'Đồng hồ đếm ngày yêu',
        description: 'Kiểm tra cột mốc ngày bên nhau & nhắc nhở ngày kỷ niệm',
        tag: 'Ngày kỷ niệm',
        iconName: 'Calendar',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'navigate_tab',
        targetTab: 'anniversary'
      }
    ]
  },

  // 5. Finance & Haevy Coin Mode
  finance: {
    modeKey: 'finance',
    modeName: 'Quản Lý Tài Chính & Ví Xu',
    badge: 'Wealth & Pots',
    iconName: 'Wallet',
    accentGradient: 'from-emerald-400 to-teal-500',
    themeColor: 'emerald',
    suggestions: [
      {
        id: 'fin_budget_50_30_20',
        title: 'Phân bổ 6 Chiếc Hũ & 50/30/20',
        description: 'AI đánh giá ngân sách và tư vấn cơ cấu dòng tiền',
        tag: 'Tư vấn tài chính',
        iconName: 'Sparkles',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        badge: 'Chiến lược',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy hướng dẫn và tư vấn cách phân bổ ngân sách chi tiêu hàng tháng theo phương pháp 50/30/20 và hệ thống 6 Chiếc Hũ tài chính thông minh.'
      },
      {
        id: 'fin_save_unexpected',
        title: 'Mẹo kiểm soát chi tiêu đột biến',
        description: 'Cách quản lý phát sinh không làm thâm hụt tiết kiệm',
        tag: 'Quản trị rủi ro',
        iconName: 'ShieldCheck',
        colorClass: 'text-teal-400',
        bgClass: 'bg-teal-950/40',
        borderClass: 'border-teal-500/40 hover:border-teal-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Chia sẻ các mẹo tài chính thiết thực giúp kiểm soát cảm xúc mua sắm và ngăn chặn các khoản chi đột xuất gây thâm hụt ngân sách.'
      },
      {
        id: 'fin_points_wallet',
        title: 'Kiểm tra Ví Xu & Điểm thưởng',
        description: 'Đổi quà tặng, vé nghe nhạc VIP và voucher',
        tag: 'Ví Xu thưởng',
        iconName: 'Gift',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'navigate_tab',
        targetTab: 'points'
      }
    ]
  },

  // 6. Spiritual & Zen Meditation Mode
  spiritual: {
    modeKey: 'spiritual',
    modeName: 'Tâm Linh & Thiền Định',
    badge: 'Zen & Healing',
    iconName: 'Bell',
    accentGradient: 'from-purple-400 to-violet-500',
    themeColor: 'purple',
    suggestions: [
      {
        id: 'spirit_bowl_528',
        title: 'Thiền chuông xoay 528Hz',
        description: 'Tần số Solfeggio tình yêu và chữa lành năng lượng',
        tag: 'Chuông xoay Tây Tạng',
        iconName: 'Bell',
        colorClass: 'text-purple-400',
        bgClass: 'bg-purple-950/40',
        borderClass: 'border-purple-500/40 hover:border-purple-400',
        actionType: 'navigate_tab',
        targetTab: 'singing_bowl'
      },
      {
        id: 'spirit_peace_message',
        title: 'Rút quẻ tâm an ngày mới',
        description: 'Thông điệp tĩnh tâm, lời khuyên chánh niệm nội tại',
        tag: 'Chánh niệm',
        iconName: 'Sparkles',
        colorClass: 'text-violet-400',
        bgClass: 'bg-violet-950/40',
        borderClass: 'border-violet-500/40 hover:border-violet-400',
        badge: 'Tĩnh tâm',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy gửi cho tôi một thông điệp thiền định, lời khuyên chánh niệm sâu sắc giúp tâm trí an yên, giải tỏa âu lo trong ngày hôm nay.'
      },
      {
        id: 'spirit_breath_guide',
        title: 'Phương pháp thở 4-7-8 xoa dịu stress',
        description: 'Kỹ thuật điều hòa nhịp tim và thư giãn tức thì',
        tag: 'Thở dưỡng sinh',
        iconName: 'Feather',
        colorClass: 'text-teal-400',
        bgClass: 'bg-teal-950/40',
        borderClass: 'border-teal-500/40 hover:border-teal-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hướng dẫn chi tiết từng bước phương pháp hít thở 4-7-8 giúp giải tỏa căng thẳng thần kinh và cải thiện giấc ngủ sâu.'
      }
    ]
  },

  // 7. Family Tree & Ancestral Heritage
  family_tree: {
    modeKey: 'family_tree',
    modeName: 'Gia Phả & Cội Nguồn',
    badge: 'Ancestral Heritage',
    iconName: 'TreePine',
    accentGradient: 'from-emerald-400 to-amber-500',
    themeColor: 'emerald',
    suggestions: [
      {
        id: 'family_interview_q',
        title: 'Gợi ý phỏng vấn ký ức dòng họ',
        description: 'Câu hỏi hay để ghi chép hồi ký ông bà, tiền nhân',
        tag: 'Ký ức gia tộc',
        iconName: 'ScrollText',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        badge: 'Cội nguồn',
        actionType: 'ai_prompt',
        aiPrompt: 'Gợi ý 5 câu hỏi hay và ý nghĩa nhất để phỏng vấn các bậc cao niên về nguồn cội, nếp nhà và ký ức truyền đời của dòng họ.'
      },
      {
        id: 'family_bio_writer',
        title: 'Soạn tiểu sử tiền nhân chuẩn mực',
        description: 'AI trợ giúp viết tóm tắt công đức tổ tiên trang trọng',
        tag: 'Tiểu sử phả hệ',
        iconName: 'Sparkles',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hướng dẫn mẫu viết tiểu sử vắn tắt, trang trọng và chuẩn mực văn phong gia phả truyền thống để lưu danh tiền nhân.'
      },
      {
        id: 'family_tree_view',
        title: 'Xem sơ đồ cây gia phả số',
        description: 'Khám phá các nhánh thế hệ và mối liên kết gia đình',
        tag: 'Sơ đồ phả hệ',
        iconName: 'TreePine',
        colorClass: 'text-green-400',
        bgClass: 'bg-green-950/40',
        borderClass: 'border-green-500/40 hover:border-green-400',
        actionType: 'navigate_tab',
        targetTab: 'tree'
      }
    ]
  },

  // 8. Studio Music Creator
  studio: {
    modeKey: 'studio',
    modeName: 'Phòng Thu Sáng Tạo',
    badge: 'Creator Studio',
    iconName: 'Mic',
    accentGradient: 'from-purple-400 to-pink-500',
    themeColor: 'purple',
    suggestions: [
      {
        id: 'studio_lyrics_gen',
        title: 'AI viết lời bài hát theo chủ đề',
        description: 'Tạo ca từ điệp khúc giàu hình tượng và vần điệu',
        tag: 'Sáng tác ca từ',
        iconName: 'Sparkles',
        colorClass: 'text-pink-400',
        bgClass: 'bg-pink-950/40',
        borderClass: 'border-pink-500/40 hover:border-pink-400',
        badge: 'Sáng tác AI',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy giúp tôi sáng tác lời bài hát gồm đoạn Verse và Chorus theo thể loại Pop Acoustic với giai điệu nhẹ nhàng, sâu lắng về mùa thu.'
      },
      {
        id: 'studio_mix_tips',
        title: 'Kỹ thuật mix nhạc & khử tạp âm',
        description: 'Bí quyết cân chỉnh Compressor, Reverb cho phòng thu',
        tag: 'Âm thanh phòng thu',
        iconName: 'Sliders',
        colorClass: 'text-purple-400',
        bgClass: 'bg-purple-950/40',
        borderClass: 'border-purple-500/40 hover:border-purple-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Chia sẻ kinh nghiệm căn chỉnh Compressor, Reverb và khử tạp âm nền khi thu âm giọng hát tại nhà để đạt chuẩn chất lượng phòng thu.'
      }
    ]
  },

  // 9. Games Arcade
  games: {
    modeKey: 'games',
    modeName: 'Giải Trí & Mini Game',
    badge: 'Arcade Arena',
    iconName: 'Gamepad2',
    accentGradient: 'from-amber-400 to-rose-500',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'games_music_trivia',
        title: 'Thử tài đố vui âm nhạc cùng AI',
        description: 'Các câu đố thử thách tài nhận biết bài hát & nghệ sĩ',
        tag: 'Đố vui trí tuệ',
        iconName: 'Sparkles',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy tổ chức một trò chơi đố vui âm nhạc gồm 3 câu hỏi thú vị về các bài hát nổi tiếng và tác giả của chúng!'
      },
      {
        id: 'games_arcade_switch',
        title: 'Khám phá kho game giải trí',
        description: 'Thư giãn với các mini game âm nhạc và phản xạ',
        tag: 'Mini Game',
        iconName: 'Gamepad2',
        colorClass: 'text-rose-400',
        bgClass: 'bg-rose-950/40',
        borderClass: 'border-rose-500/40 hover:border-rose-400',
        actionType: 'navigate_tab',
        targetTab: 'arcade'
      }
    ]
  },

  // 10. Morning Wakeup Mode
  morning: {
    modeKey: 'morning',
    modeName: 'Đánh Thức Ban Mai',
    badge: 'Morning Sunrise',
    iconName: 'Sun',
    accentGradient: 'from-amber-400 to-orange-500',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'morning_plan_rule_3',
        title: 'Kế hoạch 3 việc trọng tâm hôm nay',
        description: 'AI sắp xếp thứ tự ưu tiên cho ngày làm việc năng suất',
        tag: 'Quy tắc 3 việc',
        iconName: 'Sparkles',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        badge: 'Năng suất',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy hướng dẫn tôi cách xác định và tập trung vào 3 việc quan trọng nhất (The Rule of 3) cho ngày hôm nay để đạt hiệu quả cao nhất.'
      },
      {
        id: 'morning_alarm_sound',
        title: 'Báo thức âm thanh thiên nhiên',
        description: 'Thức giấc êm ái cùng tiếng sóng biển, chim rừng',
        tag: 'Chuông báo an lành',
        iconName: 'Sun',
        colorClass: 'text-orange-400',
        bgClass: 'bg-orange-950/40',
        borderClass: 'border-orange-500/40 hover:border-orange-400',
        actionType: 'navigate_tab',
        targetTab: 'alarm'
      }
    ]
  },

  // 11. Cosmic Space 3D
  space: {
    modeKey: 'space',
    modeName: 'Vũ Trụ Cosmic 3D',
    badge: 'Cosmic Galaxy',
    iconName: 'Compass',
    accentGradient: 'from-indigo-400 to-purple-500',
    themeColor: 'indigo',
    suggestions: [
      {
        id: 'space_astronomy_fact',
        title: 'Bí ẩn thiên văn học hôm nay',
        description: 'Khám phá sự thật kỳ thú về hố đen & các chòm sao',
        tag: 'Vũ trụ kỳ vĩ',
        iconName: 'Sparkles',
        colorClass: 'text-indigo-400',
        bgClass: 'bg-indigo-950/40',
        borderClass: 'border-indigo-500/40 hover:border-indigo-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Chia sẻ một sự thật thú vị và đầy cảm hứng về khám phá vũ trụ, các thiên hà xa xôi hoặc hiện tượng thiên văn kỳ vĩ.'
      },
      {
        id: 'space_3d_portal',
        title: 'Mở bản đồ vũ trụ 3D AR',
        description: 'Tương tác mô hình hệ mặt trời và trạm không gian',
        tag: 'Thực tế ảo 3D',
        iconName: 'Compass',
        colorClass: 'text-purple-400',
        bgClass: 'bg-purple-950/40',
        borderClass: 'border-purple-500/40 hover:border-purple-400',
        actionType: 'navigate_tab',
        targetTab: 'stars'
      }
    ]
  },

  // 12. VIP Membership Mode
  vip: {
    modeKey: 'vip',
    modeName: 'Đặc Quyền Hội Viên VIP',
    badge: 'VIP Luxury',
    iconName: 'Gift',
    accentGradient: 'from-amber-400 via-yellow-400 to-amber-600',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'vip_perks_overview',
        title: 'Kiểm tra quyền lợi VIP độc quyền',
        description: 'Âm thanh Hi-Fi, kho nhạc riêng biệt và huy hiệu vàng',
        tag: 'Quyền lợi hội viên',
        iconName: 'Gift',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        badge: 'Đặc quyền VIP',
        actionType: 'navigate_tab',
        targetTab: 'perks'
      },
      {
        id: 'vip_ai_optimization',
        title: 'Tối ưu trải nghiệm VIP cùng AI',
        description: 'Đánh giá mức độ khai thác hệ sinh thái cao cấp',
        tag: 'VIP AI Insight',
        iconName: 'Sparkles',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-950/40',
        borderClass: 'border-yellow-500/40 hover:border-yellow-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy phân tích và tư vấn cho tôi các tính năng và đặc quyền cao cấp nhất mà thành viên VIP có thể khai thác triệt để trên Haevy Ecosystem.'
      }
    ]
  },

  // 13. Haevy Lite Mode
  haevy_lite: {
    modeKey: 'haevy_lite',
    modeName: 'Phiên Bản Siêu Nhẹ (Lite)',
    badge: 'Haevy Lite',
    iconName: 'Zap',
    accentGradient: 'from-emerald-400 to-cyan-500',
    themeColor: 'emerald',
    suggestions: [
      {
        id: 'lite_save_data',
        title: 'Mẹo tối ưu dữ liệu di động 4G',
        description: 'Tiết kiệm pin và nghe nhạc ổn định trên mạng yếu',
        tag: 'Tiết kiệm băng thông',
        iconName: 'Sparkles',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Gợi ý các phương pháp hiệu quả nhất để tiết kiệm dữ liệu di động và tối ưu thời lượng pin khi nghe nhạc trên thiết bị di động.'
      }
    ]
  },

  // 14. Emergency & Support Mode
  support: {
    modeKey: 'support',
    modeName: 'Trung Tâm Cứu Hộ 24/7',
    badge: 'Support & Help',
    iconName: 'ShieldCheck',
    accentGradient: 'from-rose-400 to-amber-500',
    themeColor: 'amber',
    suggestions: [
      {
        id: 'support_troubleshoot_ai',
        title: 'Chẩn đoán sự cố tự động',
        description: 'AI quét và hỗ trợ khắc phục nhanh các vấn đề',
        tag: 'Cứu hộ AI 24/7',
        iconName: 'Sparkles',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Tôi đang gặp sự cố khi sử dụng ứng dụng. Hãy hướng dẫn tôi các bước kiểm tra và khắc phục lỗi thường gặp nhất.'
      }
    ]
  },

  // 15. User Profile
  profile: {
    modeKey: 'profile',
    modeName: 'Hồ Sơ Cá Nhân',
    badge: 'User Profile',
    iconName: 'BrainCircuit',
    accentGradient: 'from-purple-400 to-indigo-500',
    themeColor: 'purple',
    suggestions: [
      {
        id: 'profile_security_check',
        title: 'Kiểm tra bảo mật tài khoản 6 lớp',
        description: 'Đảm bảo an toàn tài sản, mã PIN ví và mật khẩu',
        tag: 'Bảo mật E2EE',
        iconName: 'ShieldCheck',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        actionType: 'ai_prompt',
        aiPrompt: 'Hãy hướng dẫn tôi cách tối ưu hóa bảo mật tài khoản cá nhân và thiết lập mã PIN an toàn trên hệ sinh thái Haevy.'
      }
    ]
  },

  // 16. Ecosystem Portal (Default Gateway)
  portal: {
    modeKey: 'portal',
    modeName: 'Cổng Hệ Sinh Thái Haevy',
    badge: 'Gateway Portal',
    iconName: 'Compass',
    accentGradient: 'from-purple-500 via-indigo-500 to-pink-500',
    themeColor: 'purple',
    suggestions: [
      {
        id: 'portal_smart_route',
        title: 'Lộ trình trải nghiệm phù hợp nhất',
        description: 'AI đề xuất chế độ nên khám phá theo thời điểm',
        tag: 'Định hướng AI',
        iconName: 'Sparkles',
        colorClass: 'text-purple-400',
        bgClass: 'bg-purple-950/40',
        borderClass: 'border-purple-500/40 hover:border-purple-400',
        badge: 'Đề xuất',
        actionType: 'ai_prompt',
        aiPrompt: 'Chào Haevy AI! Hãy gợi ý cho tôi lộ trình trải nghiệm và chế độ phù hợp nhất trên hệ sinh thái Haevy dựa trên thời điểm hiện tại.'
      },
      {
        id: 'portal_voice_cmd',
        title: 'Điều khiển bằng giọng nói rảnh tay',
        description: 'Kích hoạt lệnh thoại mở nhanh mọi tính năng',
        tag: 'Voice Assistant',
        iconName: 'Mic',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        actionType: 'voice_command'
      },
      {
        id: 'portal_shortcuts',
        title: 'Bảng phím tắt toàn năng',
        description: 'Điều hướng ứng dụng siêu tốc chỉ với bàn phím',
        tag: 'Phím tắt nhanh',
        iconName: 'Zap',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        actionType: 'custom_action'
      }
    ]
  }
};

/**
 * Returns context information and suggestions based on current mode and active tab.
 */
export function getModeContextSuggestions(mode?: string, activeTab?: string): ModeContextInfo {
  const currentKey = mode || 'portal';
  const found = CONTEXT_SUGGESTIONS_MAP[currentKey];
  if (found) {
    return found;
  }
  return CONTEXT_SUGGESTIONS_MAP.portal;
}

/**
 * Resolves a Lucide icon component dynamically.
 */
export function getContextIcon(name: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    Music,
    Headphones,
    Heart,
    Wallet,
    Bell,
    Sparkles,
    MessageCircle,
    Mic,
    Disc3,
    Sun,
    TreePine,
    Sliders,
    ShieldCheck,
    Flame,
    BrainCircuit,
    Gift,
    Compass,
    Zap,
    Coffee,
    Feather,
    Wand2,
    Calendar,
    Gamepad2,
    Share2,
    ScrollText
  };
  return map[name] || Sparkles;
}
