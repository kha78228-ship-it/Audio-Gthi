// Sun Study App Storage & State Synchronization Service
// Manages: Personal Desk, Study Rooms, Tasks, KPI, Exam Countdowns, Ranks, Quests, Sun Shop & Community

export interface SunTask {
  id: string;
  title: string;
  subject: string;
  priority: 'urgent' | 'important' | 'normal';
  estimatedPomodoros: number; // in tomatoes (25m each)
  completedPomodoros: number;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface SunExam {
  id: string;
  title: string;
  type: 'cap3' | 'thptqg' | 'dgnl' | 'custom';
  targetDate: string; // ISO string or YYYY-MM-DDTHH:mm:ss
  subtitle: string;
  quote: string;
  isCustom?: boolean;
}

export interface SunStudyRoom {
  id: string;
  name: string;
  subjectCategory: string;
  currentUsers: number;
  maxUsers: number;
  hostName: string;
  description: string;
  isLive: boolean;
  tag: string;
}

export interface SunRankTier {
  id: string;
  name: string;
  minPoints: number;
  icon: string;
  color: string;
  badge: string;
  rewardTitle: string;
}

export const SUN_RANK_TIERS: SunRankTier[] = [
  { id: 'bronze', name: 'Đồng: Tân Binh Học Tập', minPoints: 0, icon: '🥉', color: 'from-amber-700 to-amber-900', badge: 'Tân Binh', rewardTitle: 'Mới Khởi Động' },
  { id: 'silver', name: 'Bạc: Học Sinh Chăm Chỉ', minPoints: 300, icon: '🥈', color: 'from-slate-400 to-slate-600', badge: 'Chăm Chỉ', rewardTitle: 'Cần Cù Bền Bỉ' },
  { id: 'gold', name: 'Vàng: Cần Cù Bù Thông Minh', minPoints: 800, icon: '🥇', color: 'from-amber-400 to-yellow-600', badge: 'Chiến Thần', rewardTitle: 'Học Bá Triển Vọng' },
  { id: 'platinum', name: 'Bạch Kim: Học Bá Bản Lĩnh', minPoints: 1800, icon: '💎', color: 'from-cyan-400 to-blue-600', badge: 'Học Bá', rewardTitle: 'Bác Bỏ Học Vẹt' },
  { id: 'diamond', name: 'Kim Cương: Thủ Khoa Tương Lai', minPoints: 3500, icon: '👑', color: 'from-purple-400 to-indigo-600', badge: 'Thủ Khoa', rewardTitle: 'Đẳng Cấp 27+' },
  { id: 'sun_master', name: 'Mặt Trời: Huyền Thoại Sun Study', minPoints: 6000, icon: '☀️', color: 'from-orange-400 to-amber-500', badge: 'Ánh Dương', rewardTitle: 'Huyền Thoại Sĩ Tử' },
];

export interface SunQuest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  currentProgress: number;
  maxProgress: number;
  unit: string;
  claimed: boolean;
  type: 'daily' | 'weekly';
}

export interface SunShopItem {
  id: string;
  name: string;
  category: 'avatar_frame' | 'desk_pet' | 'desk_theme' | 'title';
  price: number;
  icon: string;
  preview: string;
  description: string;
  unlocked: boolean;
  equipped: boolean;
}

export interface SunCommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRank: string;
  authorBadge: string;
  title: string;
  content: string;
  category: 'qa' | 'stress_relief' | 'tips' | 'motivation';
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  commentsCount: number;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    time: string;
  }>;
}

export interface SunStudyState {
  sunCoins: number; // Hạt Nắng ☀️
  sunXp: number;
  todayStudyMinutes: number;
  dailyGoalMinutes: number;
  currentStreakDays: number;
  deskTheme: string;
  activePet: string;
  activeFrame: string;
  activeTitle: string;
  tasks: SunTask[];
  customExams: SunExam[];
  quests: SunQuest[];
  shopItems: SunShopItem[];
  weeklyStudyMinutes: { [day: string]: number }; // e.g. { 'T2': 180, 'T3': 210, ... }
  subjectDistribution: { [subject: string]: number }; // minutes per subject
}

const STORAGE_KEY = 'haevy_sun_study_state_v1';
const COMMUNITY_STORAGE_KEY = 'haevy_sun_study_community_v1';

export const DEFAULT_EXAMS: SunExam[] = [
  {
    id: 'exam_cap3',
    title: 'Kỳ Thi Tuyển Sinh Vào Lớp 10 (Thi Cấp 3)',
    type: 'cap3',
    targetDate: '2027-06-05T07:30:00',
    subtitle: 'Mục tiêu: Đỗ trường Chuyên & Nguyện vọng 1',
    quote: 'Mỗi trang sách hôm nay là một bước chân tự tin bước vào cánh cổng ngôi trường mơ ước!'
  },
  {
    id: 'exam_thptqg',
    title: 'Kỳ Thi Tốt Nghiệp THPT Quốc Gia 2027',
    type: 'thptqg',
    targetDate: '2027-06-25T07:30:00',
    subtitle: 'Chương trình GDPT 2018 • Chiến dịch Đại học Top 1',
    quote: 'Không có áp lực, không có kim cương. Hãy thức dậy trước khi cơ hội ngủ quên!'
  },
  {
    id: 'exam_dgnl',
    title: 'Kỳ Thi Đánh Giá Năng Lực (ĐGNL ĐHQG)',
    type: 'dgnl',
    targetDate: '2027-03-28T08:00:00',
    subtitle: 'Đợt 1 ĐHQG TP.HCM & ĐHQG Hà Nội',
    quote: 'Tư duy logic First Principles là chìa khóa bứt phá điểm số tối đa!'
  }
];

export const DEFAULT_STUDY_ROOMS: SunStudyRoom[] = [
  {
    id: 'room_thpt_a00',
    name: '☀️ Chiến Hạm 27+ Khối A00 & B00',
    subjectCategory: 'Toán • Lý • Hóa • Sinh',
    currentUsers: 142,
    maxUsers: 200,
    hostName: 'Minh Khoa (Chuyên Sư Phạm)',
    description: 'Phòng học yên tĩnh tuyệt đối, cùng bấm Pomodoro cày đề nâng cao mỗi tối.',
    isLive: true,
    tag: 'Cực Chăm'
  },
  {
    id: 'room_cap3_special',
    name: '🌸 Biệt Đội Chinh Phục Lớp 10 Chuyên',
    subjectCategory: 'Toán • Văn • Anh Văn',
    currentUsers: 88,
    maxUsers: 150,
    hostName: 'Thu Hà (Học Sinh Giỏi)',
    description: 'Rèn luyện ngữ pháp Tiếng Anh và các bài toán hình học hóc búa vào cấp 3.',
    isLive: true,
    tag: 'Cấp 3'
  },
  {
    id: 'room_silent_night',
    name: '🌙 Cú Đêm Silent Study With Me',
    subjectCategory: 'Tất cả các môn • Lofi chill',
    currentUsers: 215,
    maxUsers: 300,
    hostName: 'Sun Study Bot ☀️',
    description: 'Bật nhạc Lofi nhẹ nhàng, tắt mic, cùng bật cam avatar tập trung hết công suất.',
    isLive: true,
    tag: 'Đêm Khuya'
  },
  {
    id: 'room_dgnl_speed',
    name: '⚡ Luyện Phản Xạ Đánh Giá Năng Lực',
    subjectCategory: 'Tư Duy Định Lượng & Ngôn Ngữ',
    currentUsers: 94,
    maxUsers: 150,
    hostName: 'Bảo Long (950+ ĐGNL)',
    description: 'Rèn tốc độ xử lý câu hỏi nhanh, Casio fx-880 và phản biện logic bản chất.',
    isLive: true,
    tag: 'ĐGNL'
  }
];

export const INITIAL_SHOP_ITEMS: SunShopItem[] = [
  // Khung Avatar
  {
    id: 'frame_sun_radiance',
    name: 'Khung Ánh Dương Rực Rỡ ☀️',
    category: 'avatar_frame',
    price: 150,
    icon: '☀️',
    preview: 'border-4 border-amber-400 shadow-lg shadow-amber-500/40',
    description: 'Tỏa sáng hào quang mặt trời ấm áp của Sun Study App.',
    unlocked: true,
    equipped: true
  },
  {
    id: 'frame_cherry_blossom',
    name: 'Khung Hoa Anh Đào 🌸',
    category: 'avatar_frame',
    price: 250,
    icon: '🌸',
    preview: 'border-4 border-pink-400 shadow-lg shadow-pink-500/40',
    description: 'Dễ thương thanh lịch phong cách anime học đường.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'frame_cyber_scholar',
    name: 'Khung Học Bá Cyberpunk ⚡',
    category: 'avatar_frame',
    price: 400,
    icon: '⚡',
    preview: 'border-4 border-cyan-400 shadow-lg shadow-cyan-500/50',
    description: 'Học sinh công nghệ thế hệ mới 2026-2027.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'frame_valedictorian_crown',
    name: 'Khung Vương Miện Thủ Khoa 👑',
    category: 'avatar_frame',
    price: 800,
    icon: '👑',
    preview: 'border-4 border-yellow-300 shadow-xl shadow-yellow-400/60 ring-2 ring-amber-500',
    description: 'Danh hiệu tối thượng dành cho người kiên trì nhất.',
    unlocked: false,
    equipped: false
  },

  // Thú Cưng Bàn Học (Desk Pets)
  {
    id: 'pet_orange_cat',
    name: 'Mèo Cam Chăm Chỉ 🐱',
    category: 'desk_pet',
    price: 100,
    icon: '🐱',
    preview: 'Mèo cam ngồi gật gù bên trang vở và vẫy đuôi cổ vũ',
    description: 'Người bạn trung thành luôn thức cùng bạn mỗi đêm cày đề.',
    unlocked: true,
    equipped: true
  },
  {
    id: 'pet_wise_owl',
    name: 'Cú Đêm Thông Thái 🦉',
    category: 'desk_pet',
    price: 300,
    icon: '🦉',
    preview: 'Cú đeo kính thông thái nhắc nhở không được lướt điện thoại',
    description: 'Biểu tượng của sự tập trung sâu và tri thức uyên bác.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'pet_cozy_panda',
    name: 'Gấu Trúc Dễ Thương 🐼',
    category: 'desk_pet',
    price: 350,
    icon: '🐼',
    preview: 'Bé gấu trúc ôm cành trúc mỉm cười thư giãn',
    description: 'Giúp giảm bớt căng thẳng, mang lại nguồn năng lượng tích cực.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'pet_smart_penguin',
    name: 'Chim Cánh Cụt Đeo Khăn 🐧',
    category: 'desk_pet',
    price: 500,
    icon: '🐧',
    preview: 'Bé cánh cụt vỗ tay khen ngợi mỗi khi bạn hoàn thành 1 Pomodoro',
    description: 'Động lực bất tận cho những buổi ôn thi dài.',
    unlocked: false,
    equipped: false
  },

  // Theme Bàn Học
  {
    id: 'theme_wooden_desk',
    name: 'Bàn Gỗ Mộc Cổ Điển 🪵',
    category: 'desk_theme',
    price: 0,
    icon: '🪵',
    preview: 'bg-gradient-to-b from-amber-950/40 to-zinc-950 border-amber-900/40',
    description: 'Ấm cúng, mộc mạc và tĩnh lặng như bàn học thư viện trường.',
    unlocked: true,
    equipped: true
  },
  {
    id: 'theme_lofi_rain',
    name: 'Bàn Học Đêm Mưa Lofi 🌧️',
    category: 'desk_theme',
    price: 280,
    icon: '🌧️',
    preview: 'bg-gradient-to-b from-slate-900/80 to-blue-950/60 border-blue-800/40',
    description: 'Tiếng mưa rơi tí tách ngoài cửa sổ, ánh đèn vàng dịu mắt.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'theme_sakura_cafe',
    name: 'Góc Cafe Hoa Anh Đào 🌸',
    category: 'desk_theme',
    price: 350,
    icon: '🌸',
    preview: 'bg-gradient-to-b from-rose-950/50 to-zinc-950 border-rose-800/40',
    description: 'Không gian ngọt ngào, tươi sáng cho ngày học tràn đầy cảm hứng.',
    unlocked: false,
    equipped: false
  },

  // Danh Hiệu Học Sinh
  {
    id: 'title_first_principles',
    name: 'Bác Bỏ Học Vẹt 🧠',
    category: 'title',
    price: 150,
    icon: '🧠',
    preview: 'Danh hiệu hiển thị trang trọng trên hồ sơ học sinh',
    description: 'Học hiểu bản chất First Principles, từ chối ghi nhớ máy móc.',
    unlocked: true,
    equipped: true
  },
  {
    id: 'title_pomodoro_warrior',
    name: 'Chiến Thần Pomodoro 🍅',
    category: 'title',
    price: 200,
    icon: '🍅',
    preview: 'Huy hiệu cà chua đỏ rực kỷ luật sắt',
    description: 'Hoàn thành trên 50 ca Pomodoro tập trung không xao nhãng.',
    unlocked: false,
    equipped: false
  },
  {
    id: 'title_sun_shining',
    name: 'Mặt Trời Nhỏ Kiên Cường ☀️',
    category: 'title',
    price: 500,
    icon: '☀️',
    preview: 'Ánh dương rạng ngời truyền cảm hứng cho bạn bè',
    description: 'Luôn giữ nụ cười và tinh thần lạc quan trên hành trình vượt vũ môn.',
    unlocked: false,
    equipped: false
  }
];

export const INITIAL_COMMUNITY_POSTS: SunCommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'Khánh Linh (K12)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorRank: 'Bạch Kim: Học Bá',
    authorBadge: 'Khối A00',
    title: 'Hôm nay mình cày xong 6 đề Toán GDPT 2018, chia sẻ mẹo dùng fx-880 siêu nhanh!',
    content: 'Chào cả nhà Sun Study! Mấy bạn học hàm số mũ và logarit chú ý tính năng Spreadsheet và Table trên máy tính Casio fx-880 BTG nha, tìm cực trị và tiệm cận chỉ mất tầm 10-15s thôi. Tự học một mình sợ nản nhưng vào phòng học chung thấy các bạn sáng đèn là có động lực ghê!',
    category: 'tips',
    createdAt: 'Vừa xong • 15 phút trước',
    likes: 38,
    commentsCount: 6,
    comments: [
      { id: 'c1', author: 'Đức Huy', content: 'Cảm ơn bạn nhiều nha! Chiều nay mình cũng vừa làm theo mẹo này cực mượt ❤️', time: '10 phút trước' },
      { id: 'c2', author: 'Thảo My', content: 'Phòng học chung số 1 vui thật sự, cảm giác như đang ngồi thư viện quốc gia.', time: '5 phút trước' }
    ]
  },
  {
    id: 'post_2',
    authorName: 'Hoàng Minh (K9 lên K10)',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    authorRank: 'Vàng: Cần Cù',
    authorBadge: 'Thi Cấp 3',
    title: 'Cần tìm bạn cùng cày tiếng Anh thi vào lớp 10 Chuyên ngữ!',
    content: 'Có bạn nào đang ôn thi Cấp 3 vào chuyên Sư Phạm hay Chuyên Ngoại Ngữ không ạ? Chúng mình lập nhóm học chung tầm 4-5 bạn để mỗi ngày đố nhau 20 cụm collocations và cùng bấm giờ làm đề nha! Chúc mọi người một ngày học năng suất!',
    category: 'qa',
    createdAt: '1 giờ trước',
    likes: 24,
    commentsCount: 4,
    comments: [
      { id: 'c3', author: 'Quỳnh Nga', content: 'Cho mình xin 1 slot vào nhóm nha bạn ơi, mình cũng đang ôn chuyên Anh!', time: '40 phút trước' }
    ]
  },
  {
    id: 'post_3',
    authorName: 'Thầy Hưng (Cố vấn STEM)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorRank: 'Mặt Trời Huyền Thoại',
    authorBadge: 'Cố Vấn',
    title: 'Đừng học vẹt công thức, hãy tự hỏi: "Nếu thay đổi điều kiện biên thì sao?"',
    content: 'Gửi các chiến binh Sun Study: Điểm khác biệt lớn nhất giữa một học sinh đạt 7 điểm và 9+ trong đề thi mới là khả năng giải thích nguyên lý gốc (First Principles). Khi làm bài Vật lý hay Hóa học, hãy luôn tưởng tượng bức tranh hiện tượng trước khi bấm máy tính. Chúc các em luôn giữ vững ngọn lửa nhiệt huyết!',
    category: 'motivation',
    createdAt: 'Hôm nay',
    likes: 85,
    commentsCount: 12,
    comments: [
      { id: 'c4', author: 'Tuấn Kiệt', content: 'Lời khuyên thấm thía quá thầy ạ! Em cảm ơn thầy nhiều!', time: '2 giờ trước' }
    ]
  }
];

export function getInitialSunStudyState(): SunStudyState {
  const defaultTasks: SunTask[] = [
    {
      id: 'task_1',
      title: 'Luyện 25 câu trắc nghiệm đúng/sai Toán (Khảo sát hàm số)',
      subject: 'Toán Học',
      priority: 'urgent',
      estimatedPomodoros: 2,
      completedPomodoros: 2,
      completed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_2',
      title: 'Ôn bản chất định luật I & II Nhiệt động lực học (Vật lý 12)',
      subject: 'Vật Lý',
      priority: 'important',
      estimatedPomodoros: 3,
      completedPomodoros: 1,
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_3',
      title: 'Thực hành thao tác bảng tính Spreadsheet trên Casio fx-880 BTG',
      subject: 'Tiện Ích',
      priority: 'normal',
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_4',
      title: 'Đọc 30 từ vựng chủ đề Science & Technology trong tiếng Anh',
      subject: 'Tiếng Anh',
      priority: 'important',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];

  const defaultQuests: SunQuest[] = [
    {
      id: 'quest_study_60m',
      title: 'Cần cù bù thông minh ⏳',
      description: 'Tích lũy đủ 60 phút học tập trung trên Bàn học cá nhân',
      rewardCoins: 25,
      rewardXp: 80,
      currentProgress: 45,
      maxProgress: 60,
      unit: 'phút',
      claimed: false,
      type: 'daily'
    },
    {
      id: 'quest_complete_tasks',
      title: 'Sát thủ To-do List 📋',
      description: 'Hoàn thành 3 đầu việc trong danh sách nhiệm vụ hôm nay',
      rewardCoins: 30,
      rewardXp: 100,
      currentProgress: 1,
      maxProgress: 3,
      unit: 'việc',
      claimed: false,
      type: 'daily'
    },
    {
      id: 'quest_join_room',
      title: 'Học nhóm không cô đơn 👥',
      description: 'Tham gia học tập trong Phòng học chung ít nhất 25 phút',
      rewardCoins: 20,
      rewardXp: 60,
      currentProgress: 25,
      maxProgress: 25,
      unit: 'phút',
      claimed: false,
      type: 'daily'
    },
    {
      id: 'quest_weekly_10h',
      title: 'Chiến dịch tuần: 10 Giờ Kỷ Luật 🔥',
      description: 'Tích lũy tối thiểu 600 phút (10 giờ) học tập trong tuần này',
      rewardCoins: 120,
      rewardXp: 350,
      currentProgress: 320,
      maxProgress: 600,
      unit: 'phút',
      claimed: false,
      type: 'weekly'
    }
  ];

  return {
    sunCoins: 165, // Ban đầu tặng bạn 165 Hạt Nắng trải nghiệm
    sunXp: 620,
    todayStudyMinutes: 145,
    dailyGoalMinutes: 180, // KPI 3 giờ
    currentStreakDays: 5,
    deskTheme: 'theme_wooden_desk',
    activePet: 'pet_orange_cat',
    activeFrame: 'frame_sun_radiance',
    activeTitle: 'title_first_principles',
    tasks: defaultTasks,
    customExams: [],
    quests: defaultQuests,
    shopItems: INITIAL_SHOP_ITEMS,
    weeklyStudyMinutes: {
      'T2': 160,
      'T3': 190,
      'T4': 140,
      'T5': 210,
      'T6': 145,
      'T7': 120,
      'CN': 180
    },
    subjectDistribution: {
      'Toán Học': 180,
      'Vật Lý': 120,
      'Hóa Học': 90,
      'Tiếng Anh': 60,
      'Sinh Học': 40
    }
  };
}

export function loadSunStudyState(): SunStudyState {
  if (typeof window === 'undefined') return getInitialSunStudyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSunStudyState();
      saveSunStudyState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return { ...getInitialSunStudyState(), ...parsed };
  } catch (err) {
    console.error('Error loading sun study state:', err);
    return getInitialSunStudyState();
  }
}

export function saveSunStudyState(state: SunStudyState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving sun study state:', err);
  }
}

export function loadCommunityPosts(): SunCommunityPost[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_POSTS;
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) {
      saveCommunityPosts(INITIAL_COMMUNITY_POSTS);
      return INITIAL_COMMUNITY_POSTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading community posts:', err);
    return INITIAL_COMMUNITY_POSTS;
  }
}

export function saveCommunityPosts(posts: SunCommunityPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving community posts:', err);
  }
}

export function getRankTierForPoints(points: number): SunRankTier {
  for (let i = SUN_RANK_TIERS.length - 1; i >= 0; i--) {
    if (points >= SUN_RANK_TIERS[i].minPoints) {
      return SUN_RANK_TIERS[i];
    }
  }
  return SUN_RANK_TIERS[0];
}

export function getNextRankTier(currentPoints: number): { nextTier: SunRankTier | null; progressPercent: number } {
  const currentTier = getRankTierForPoints(currentPoints);
  const currentIndex = SUN_RANK_TIERS.findIndex(t => t.id === currentTier.id);
  if (currentIndex === -1 || currentIndex === SUN_RANK_TIERS.length - 1) {
    return { nextTier: null, progressPercent: 100 };
  }
  const nextTier = SUN_RANK_TIERS[currentIndex + 1];
  const range = nextTier.minPoints - currentTier.minPoints;
  const gained = currentPoints - currentTier.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  return { nextTier, progressPercent };
}
