import { LevelMilestone, LevelPrivilegeItem } from '../types';

export const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 1,
    title: 'Tập Sự Giai Điệu',
    subtitle: 'Khởi đầu hành trình âm nhạc',
    requiredExp: 0,
    icon: '🎵',
    badgeGradient: 'from-slate-600 via-slate-500 to-zinc-400',
    cardBorderColor: 'border-slate-600/40',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    rewards: [
      {
        id: 'r_lv1_welcome',
        name: 'Huy hiệu Khởi Đầu',
        description: 'Đánh dấu bước chân đầu tiên gia nhập đại gia đình Haevy Audio',
        icon: '🔰',
        type: 'badge',
        value: 'badge_novice'
      }
    ],
    privileges: [
      'Nghe nhạc chuẩn tiêu chuẩn trực tuyến chất lượng cao',
      'Tham gia bình luận, đánh giá và thả tim bài hát',
      'Tặng quà ủng hộ nghệ sĩ trong phòng nghe'
    ]
  },
  {
    level: 2,
    title: 'Khán Giả Thân Thiết',
    subtitle: 'Người bạn đồng hành quen thuộc',
    requiredExp: 500,
    icon: '🥉',
    badgeGradient: 'from-amber-700 via-amber-600 to-yellow-600',
    cardBorderColor: 'border-amber-700/50',
    glowColor: 'rgba(180, 83, 9, 0.25)',
    rewards: [
      {
        id: 'r_lv2_coins',
        name: '+200 Xu Haevy',
        description: 'Thưởng 200 Xu Haevy nạp thẳng vào ví tài khoản',
        icon: '🪙',
        type: 'coins',
        value: 200
      },
      {
        id: 'r_lv2_badge',
        name: 'Huy hiệu Đồng LV.2',
        description: 'Huy hiệu Đồng phát sáng cạnh tên hiển thị',
        icon: '🥉',
        type: 'badge',
        value: 'badge_bronze_lv2'
      }
    ],
    privileges: [
      'Tăng 5% tỉ lệ nhận thêm Xu may mắn khi tương tác',
      'Mở khóa khung chat "Đồng Ánh Kim" trang nhã',
      'Mở rộng danh sách phát cá nhân lên 100 bài hát'
    ]
  },
  {
    level: 3,
    title: 'Tri Kỷ Âm Nhạc',
    subtitle: 'Thấu hiểu từng cung bậc thanh âm',
    requiredExp: 1200,
    icon: '🌸',
    badgeGradient: 'from-pink-600 via-rose-500 to-pink-400',
    cardBorderColor: 'border-pink-500/50',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    rewards: [
      {
        id: 'r_lv3_coins',
        name: '+350 Xu Haevy',
        description: 'Thưởng 350 Xu Haevy hỗ trợ tặng quà nghệ sĩ',
        icon: '🪙',
        type: 'coins',
        value: 350
      },
      {
        id: 'r_lv3_frame',
        name: 'Khung Avatar Sóng Nhạc Neon',
        description: 'Khung viền avatar hiệu ứng sóng âm Neon lung linh',
        icon: '✨',
        type: 'avatar_frame',
        value: 'neon_soundwave'
      }
    ],
    privileges: [
      'Giảm 3% giá Xu khi tặng quà cho mọi tác giả bài hát',
      'Mở khóa bộ biểu cảm động (Animated Emotes) độc quyền trong phòng nghe',
      'Quyền yêu cầu bài hát ưu tiên trong phòng nghe nhóm'
    ]
  },
  {
    level: 4,
    title: 'Nhà Bảo Trợ Đồng',
    subtitle: 'Nền tảng vững chắc cho các nghệ sĩ',
    requiredExp: 2200,
    icon: '🛡️',
    badgeGradient: 'from-amber-600 via-yellow-600 to-amber-500',
    cardBorderColor: 'border-amber-500/50',
    glowColor: 'rgba(217, 119, 6, 0.3)',
    rewards: [
      {
        id: 'r_lv4_coins',
        name: '+600 Xu Haevy',
        description: 'Thưởng 600 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 600
      },
      {
        id: 'r_lv4_vip',
        name: '3 Ngày VIP Trọn Gói',
        description: 'Tặng ngay 3 ngày hội viên VIP thưởng thức âm thanh Lossless và đa phân hệ',
        icon: '👑',
        type: 'vip_days',
        value: 3
      }
    ],
    privileges: [
      'Huy hiệu tên phát sáng Ánh Đồng trong toàn bộ các phòng',
      'Mở rộng dung lượng lưu trữ playlist cá nhân lên 250 bài',
      'Tặng quà tác giả được kèm theo tin nhắn nổi bật (Pinned Wish)'
    ]
  },
  {
    level: 5,
    title: 'Đại Sứ Âm Thanh',
    subtitle: 'Tiếng nói lan tỏa tình yêu nghệ thuật',
    requiredExp: 3500,
    icon: '⚡',
    badgeGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    cardBorderColor: 'border-purple-500/50',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    rewards: [
      {
        id: 'r_lv5_coins',
        name: '+1,000 Xu Haevy',
        description: 'Thưởng 1,000 Xu Haevy thưởng thính giả tận tụy',
        icon: '🪙',
        type: 'coins',
        value: 1000
      },
      {
        id: 'r_lv5_lite',
        name: '+50 Xu Haevy Lite',
        description: '50 Xu Lite dùng mua sắm trang sức & phông chữ',
        icon: '💎',
        type: 'lite_coins',
        value: 50
      },
      {
        id: 'r_lv5_effect',
        name: 'Hiệu ứng Quà Tặng Lấp Lánh',
        description: 'Mở khóa hiệu ứng tia sáng khi gửi quà tặng tác giả',
        icon: '✨',
        type: 'chat_effect',
        value: 'sparkle_gift_fx'
      }
    ],
    privileges: [
      'Giảm 5% phí nạp khi nạp Xu Haevy',
      'Hiệu ứng xuất hiện phòng nghe Sparkle Aura khi bước vào',
      'Được gắn cờ danh dự "Đại Sứ Âm Thanh" trên trang cộng đồng'
    ]
  },
  {
    level: 6,
    title: 'Mạnh Thường Quân Bạc',
    subtitle: 'Biểu tượng của sự hào phóng và tinh tế',
    requiredExp: 5200,
    icon: '🥈',
    badgeGradient: 'from-slate-400 via-slate-300 to-zinc-200',
    cardBorderColor: 'border-slate-300/60',
    glowColor: 'rgba(226, 232, 240, 0.35)',
    rewards: [
      {
        id: 'r_lv6_coins',
        name: '+1,500 Xu Haevy',
        description: 'Thưởng 1,500 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 1500
      },
      {
        id: 'r_lv6_frame',
        name: 'Khung Avatar Bạch Ngân Hoàng Gia',
        description: 'Khung Avatar viền bạc bạch kim lộng lẫy',
        icon: '🖼️',
        type: 'avatar_frame',
        value: 'royal_silver_frame'
      }
    ],
    privileges: [
      'Tặng quà tác giả nhận thêm x1.1 EXP tích lũy thăng cấp',
      'Thẻ vinh danh Bạc hiển thị nổi bật trong hồ sơ cá nhân',
      'Ưu tiên kết nối âm thanh máy chủ siêu tốc dưới 15ms'
    ]
  },
  {
    level: 7,
    title: 'Đại Gia Âm Nhạc',
    subtitle: 'Nhà bảo trợ quyền lực của thế giới âm thanh',
    requiredExp: 7500,
    icon: '💎',
    badgeGradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    cardBorderColor: 'border-cyan-400/50',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    rewards: [
      {
        id: 'r_lv7_coins',
        name: '+2,200 Xu Haevy',
        description: 'Thưởng 2,200 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 2200
      },
      {
        id: 'r_lv7_lite',
        name: '+100 Xu Lite',
        description: '100 Xu Haevy Lite đổi phông chữ và trang phục',
        icon: '💎',
        type: 'lite_coins',
        value: 100
      },
      {
        id: 'r_lv7_chat',
        name: 'Khung Chat Bạch Kim Pha Lê',
        description: 'Viền bong bóng chat phát sáng pha lê tinh khiết',
        icon: '💬',
        type: 'chat_effect',
        value: 'crystal_chat_border'
      }
    ],
    privileges: [
      'Tăng hạn mức chuyển Xu tặng bạn bè lên 50,000 Xu/ngày',
      'Biểu tượng Ngôi Sao Vàng bên cạnh tên người dùng',
      'Quyền ghim lời nhắn trong phòng nghe trong 5 phút'
    ]
  },
  {
    level: 8,
    title: 'Nhà Tài Trợ Vàng',
    subtitle: 'Trụ cột danh dự của hệ sinh thái',
    requiredExp: 10500,
    icon: '🥇',
    badgeGradient: 'from-amber-400 via-yellow-400 to-amber-600',
    cardBorderColor: 'border-amber-400/60',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    rewards: [
      {
        id: 'r_lv8_coins',
        name: '+3,000 Xu Haevy',
        description: 'Thưởng 3,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 3000
      },
      {
        id: 'r_lv8_vip',
        name: '7 Ngày VIP Gold',
        description: 'Tặng 7 ngày hội viên VIP Gold mở khóa toàn bộ chế độ',
        icon: '👑',
        type: 'vip_days',
        value: 7
      }
    ],
    privileges: [
      'Mở khóa phòng nghe nhạc riêng tư chất lượng FLAC Master 24-bit 192kHz',
      'Giảm 8% giá toàn bộ danh mục quà tặng tác giả',
      'Huy hiệu Nhà Tài Trợ Vàng phát sáng rực rỡ trên hồ sơ'
    ]
  },
  {
    level: 9,
    title: 'Bá Tước Giai Điệu',
    subtitle: 'Phong thái quý tộc giữa ngàn thanh sắc',
    requiredExp: 14500,
    icon: '🔥',
    badgeGradient: 'from-rose-600 via-red-600 to-orange-500',
    cardBorderColor: 'border-rose-500/60',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    rewards: [
      {
        id: 'r_lv9_coins',
        name: '+4,000 Xu Haevy',
        description: 'Thưởng 4,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 4000
      },
      {
        id: 'r_lv9_frame',
        name: 'Khung Avatar Phượng Hoàng Lửa Đỏ',
        description: 'Khung Avatar hoạt ảnh lửa phượng hoàng cuộn trào',
        icon: '🔥',
        type: 'avatar_frame',
        value: 'red_phoenix_flame'
      }
    ],
    privileges: [
      'Tên hiển thị hiệu ứng đổi màu Gradient cầu vồng quang phổ',
      'Phát thông báo toàn phòng khi gửi quà mức Hiếm (Rare) trở lên',
      'Giảm 5% giá mua mọi gói nạp xu'
    ]
  },
  {
    level: 10,
    title: 'Tinh Hoa Âm Nhạc',
    subtitle: 'Đỉnh cao của lòng say mê và cống hiến',
    requiredExp: 20000,
    icon: '👑',
    badgeGradient: 'from-amber-300 via-yellow-400 to-orange-500',
    cardBorderColor: 'border-yellow-300/80',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    rewards: [
      {
        id: 'r_lv10_coins',
        name: '+6,000 Xu Haevy',
        description: 'Thưởng 6,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 6000
      },
      {
        id: 'r_lv10_vip',
        name: '15 Ngày VIP Diamond',
        description: '15 ngày trải nghiệm đặc quyền VIP Diamond cao cấp nhất',
        icon: '💎',
        type: 'vip_days',
        value: 15
      },
      {
        id: 'r_lv10_crown',
        name: 'Vương Miện Hoàng Kim Vĩnh Viễn',
        description: 'Huy hiệu vương miện hoàng gia vĩnh viễn trên đầu avatar',
        icon: '👑',
        type: 'badge',
        value: 'permanent_golden_crown'
      }
    ],
    privileges: [
      'Tự động nhân đôi hiệu ứng combo quà tặng tác giả',
      'Vinh danh Top 10 Bảng Vàng Người Ủng Hộ toàn nền tảng',
      'Đường dây nóng CSKH hỗ trợ kỹ thuật ưu tiên 24/7'
    ]
  },
  {
    level: 11,
    title: 'Đại Hiệp Phòng Trà',
    subtitle: 'Ngao du giang hồ, vang danh tứ hải',
    requiredExp: 28000,
    icon: '⚔️',
    badgeGradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    cardBorderColor: 'border-emerald-400/70',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    rewards: [
      {
        id: 'r_lv11_coins',
        name: '+8,000 Xu Haevy',
        description: 'Thưởng 8,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 8000
      },
      {
        id: 'r_lv11_chat',
        name: 'Khung Chat Long Phụng Tranh Hùng',
        description: 'Khung chat viền rồng phượng cổ phong ấn tượng',
        icon: '🐉',
        type: 'chat_effect',
        value: 'dragon_phoenix_chat'
      }
    ],
    privileges: [
      'Hàng chờ 0 giây khi sáng tác bài hát qua Studio AI',
      'Giảm 10% phí quà tặng tác giả vĩnh viễn',
      'Tùy chỉnh ảnh bìa đại diện độc quyền động'
    ]
  },
  {
    level: 12,
    title: 'Chúa Tể Sóng Nhạc',
    subtitle: 'Điều khiển tần số, dẫn dắt thính giác',
    requiredExp: 38000,
    icon: '🪐',
    badgeGradient: 'from-purple-600 via-indigo-600 to-blue-500',
    cardBorderColor: 'border-purple-400/80',
    glowColor: 'rgba(147, 51, 234, 0.45)',
    rewards: [
      {
        id: 'r_lv12_coins',
        name: '+11,000 Xu Haevy',
        description: 'Thưởng 11,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 11000
      },
      {
        id: 'r_lv12_vip',
        name: '30 Ngày VIP Diamond',
        description: '30 ngày VIP Diamond chất lượng đỉnh chóp',
        icon: '👑',
        type: 'vip_days',
        value: 30
      }
    ],
    privileges: [
      'Tạo phòng nghe nhạc riêng tư mã hóa bảo mật cấp cao',
      'Mở khóa toàn bộ hiệu ứng thị giác Visualizer 3D cao cấp',
      'Tặng quà tác giả được đính kèm huy chương hào quang'
    ]
  },
  {
    level: 13,
    title: 'Vương Giả Âm Thanh',
    subtitle: 'Bậc đế vương uy phong lẫm liệt',
    requiredExp: 50000,
    icon: '🌌',
    badgeGradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    cardBorderColor: 'border-fuchsia-400/80',
    glowColor: 'rgba(217, 70, 239, 0.45)',
    rewards: [
      {
        id: 'r_lv13_coins',
        name: '+15,000 Xu Haevy',
        description: 'Thưởng 15,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 15000
      },
      {
        id: 'r_lv13_frame',
        name: 'Khung Avatar Vũ Trụ Thiên Hà',
        description: 'Khung Avatar lốc xoáy ngân hà huyền bí',
        icon: '🌌',
        type: 'avatar_frame',
        value: 'cosmic_galaxy_frame'
      }
    ],
    privileges: [
      'Toàn quyền tải không giới hạn kho Master Track 24-bit/192kHz',
      'Hỗ trợ quản trị viên riêng tận tình 1 kèm 1',
      'Miễn phí 100% phí chuyển Xu cho bất kỳ thành viên nào'
    ]
  },
  {
    level: 14,
    title: 'Huyền Thoại Bất Tử',
    subtitle: 'Tên tuổi lưu danh thiên thu vạn đại',
    requiredExp: 65000,
    icon: '🌟',
    badgeGradient: 'from-amber-400 via-rose-500 to-purple-600',
    cardBorderColor: 'border-amber-300',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    rewards: [
      {
        id: 'r_lv14_coins',
        name: '+20,000 Xu Haevy',
        description: 'Thưởng 20,000 Xu Haevy',
        icon: '🪙',
        type: 'coins',
        value: 20000
      },
      {
        id: 'r_lv14_vip',
        name: '45 Ngày VIP Platinum',
        description: '45 ngày trải nghiệm đặc quyền Platinum',
        icon: '💎',
        type: 'vip_days',
        value: 45
      }
    ],
    privileges: [
      'Tên mạ vàng phát sáng ánh hào quang động toàn hệ sinh thái',
      'Biểu tượng Vương Miện Rồng 3D độc tôn bên cạnh ảnh đại diện',
      'Toàn bộ âm thanh hiệu ứng quà tặng tự động nâng cấp mức Hoàng Kim'
    ]
  },
  {
    level: 15,
    title: 'Thần Thoại Haevy',
    subtitle: 'Cảnh giới tối cao của người bảo trợ',
    requiredExp: 85000,
    icon: '☀️',
    badgeGradient: 'from-yellow-300 via-amber-400 to-red-500',
    cardBorderColor: 'border-yellow-200',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    rewards: [
      {
        id: 'r_lv15_coins',
        name: '+30,000 Xu Haevy',
        description: 'Thưởng 30,000 Xu Haevy kỷ lục',
        icon: '🪙',
        type: 'coins',
        value: 30000
      },
      {
        id: 'r_lv15_vip',
        name: 'Gói VIP Trọn Đời (Lifetime)',
        description: 'Tặng vĩnh viễn gói VIP cao cấp nhất không bao giờ hết hạn',
        icon: '👑',
        type: 'vip_days',
        value: 36500 // ~100 years
      },
      {
        id: 'r_lv15_monument',
        name: 'Tượng Đài Vinh Danh Cá Nhân',
        description: 'Ghi danh tại Đại Sảnh Danh Vọng (Hall of Fame) Haevy Audio',
        icon: '🏛️',
        type: 'special',
        value: 'hall_of_fame_monument'
      }
    ],
    privileges: [
      'Toàn bộ đặc quyền tối cao của mọi phân hệ được mở khóa vĩnh viễn',
      'Được vinh danh làm Cố Vấn Danh Dự trong các sự kiện âm nhạc',
      'Tặng quà đạt tối đa hiệu ứng thị giác và âm thanh khải hoàn toàn server'
    ]
  }
];

export interface CalculatedLevelState {
  currentLevel: number;
  currentMilestone: LevelMilestone;
  nextMilestone: LevelMilestone | null;
  expInCurrentLevel: number;
  expRequiredForNext: number;
  progressPercentage: number;
  remainingExp: number;
}

export function calculateLevelFromExp(exp: number): CalculatedLevelState {
  const safeExp = Math.max(0, exp || 0);

  let currentMilestone = LEVEL_MILESTONES[0];
  let nextMilestone: LevelMilestone | null = LEVEL_MILESTONES[1] || null;

  for (let i = LEVEL_MILESTONES.length - 1; i >= 0; i--) {
    if (safeExp >= LEVEL_MILESTONES[i].requiredExp) {
      currentMilestone = LEVEL_MILESTONES[i];
      nextMilestone = LEVEL_MILESTONES[i + 1] || null;
      break;
    }
  }

  const currentLevel = currentMilestone.level;

  if (!nextMilestone) {
    return {
      currentLevel,
      currentMilestone,
      nextMilestone: null,
      expInCurrentLevel: safeExp - currentMilestone.requiredExp,
      expRequiredForNext: 0,
      progressPercentage: 100,
      remainingExp: 0
    };
  }

  const levelBaseExp = currentMilestone.requiredExp;
  const nextLevelExp = nextMilestone.requiredExp;
  const expInCurrentLevel = safeExp - levelBaseExp;
  const expRequiredForNext = nextLevelExp - levelBaseExp;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((expInCurrentLevel / expRequiredForNext) * 100)));
  const remainingExp = Math.max(0, nextLevelExp - safeExp);

  return {
    currentLevel,
    currentMilestone,
    nextMilestone,
    expInCurrentLevel,
    expRequiredForNext,
    progressPercentage,
    remainingExp
  };
}

export function getUnclaimedLevelRewards(currentLevel: number, claimedLevels: number[]): LevelMilestone[] {
  const claimedSet = new Set(claimedLevels || []);
  return LEVEL_MILESTONES.filter(m => m.level <= currentLevel && m.level > 1 && !claimedSet.has(m.level));
}
