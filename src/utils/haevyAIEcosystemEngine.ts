import { FamilyTreeMember, Track } from '../types';

// ==============================================================================
// HAEVY ECOSYSTEM COMPLETE MODES KNOWLEDGE & SPECIFICATION
// ==============================================================================
export interface EcosystemModeInfo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  color: string;
  description: string;
  capabilities: string[];
  supportedActions: string[];
  keyStatsLabel: string;
  sampleQueries: string[];
}

export const HAEVY_ECOSYSTEM_MODES_INFO: EcosystemModeInfo[] = [
  {
    id: 'audio',
    name: 'Haevy Audio & Thư Viện',
    tagline: 'Kho nhạc Hi-Fi Lossless & Truyện Audio Đỉnh Cao',
    category: 'Giải Trí & Âm Nhạc',
    badge: 'Hi-Fi Master',
    color: 'from-purple-600 via-indigo-600 to-pink-600',
    description: 'Kho nhạc số chất lượng cao Lossless 24-bit/192kHz, kho truyện audio đa dạng (tiên hiệp, kiếm hiệp, trinh thám, podcast chữa lành), trình phát nhạc thông minh Smart Shuffle, quản lý playlist cá nhân và bảng xếp hạng cộng đồng.',
    capabilities: [
      'Phát nhạc theo bài hát, nghệ sĩ hoặc thể loại thông minh',
      'Thêm bài hát mới vào danh sách phát hoặc thư viện cá nhân',
      'Xoá bài hát hoặc xoá nhiều bài hát khỏi playlist',
      'Tạo mới hoặc quản lý playlist theo chủ đề',
      'Thống kê lượt nghe hôm nay, bảng xếp hạng Top Trending'
    ],
    supportedActions: ['play_music', 'add_track', 'delete_tracks', 'create_playlist', 'audio_stats'],
    keyStatsLabel: 'Bài hát trong kho',
    sampleQueries: [
      'Phát bài hát Lo-Fi Chill',
      'Thêm bài hát mới vào playlist',
      'Xoá các bài hát cũ khỏi danh sách phát',
      'Kiểm tra thống kê lượt nghe hôm nay'
    ]
  },
  {
    id: 'family_tree',
    name: 'Haevy Family Tree (Gia Phả)',
    tagline: 'Gia Phả Số Dòng Họ Tương Tác & Thế Hệ',
    category: 'Văn Hóa & Dòng Họ',
    badge: 'Gia Phả Số',
    color: 'from-amber-600 via-orange-600 to-yellow-600',
    description: 'Nền tảng số hóa phả hệ gia tộc toàn diện: sơ đồ cây tương tác đa tầng, phân biệt chi phái, tính tuổi âm/dương, xác định xưng hô thân tộc theo thế thứ, lưu trữ sắc phong, liên kết audio giọng đọc tổ tiên, kết bạn thân tộc và chat bảo mật trong dòng họ.',
    capabilities: [
      'Thêm thành viên mới (đơn lẻ hoặc hàng loạt) vào gia phả',
      'Xoá thành viên hoặc xoá nhiều người khỏi phả hệ',
      'Tra cứu thông tin, thế hệ, xưng hô thân tộc chuẩn xác',
      'Thống kê số lượng thành viên, các đời và chi phái',
      'Kết bạn và trò chuyện trực tiếp với người trong gia tộc'
    ],
    supportedActions: ['add_family_member', 'delete_family_members', 'query_family_info', 'clan_connect'],
    keyStatsLabel: 'Thành viên gia phả',
    sampleQueries: [
      'Thêm thành viên Nguyễn Văn Nam đời 4 chi 2 sinh năm 1995 vào gia phả',
      'Xoá thành viên Nguyễn Văn X khỏi gia phả',
      'Xem danh sách thành viên đời thứ 3 trong gia phả',
      'Tra cứu mối quan hệ xưng hô trong dòng họ'
    ]
  },
  {
    id: 'couple',
    name: 'I Love Haevy (Cặp Đôi)',
    tagline: 'Không Gian Lãng Mạn & Đếm Ngày Yêu Đôi Lứa',
    category: 'Tình Cảm & Kết Nối',
    badge: 'Lãng Mạn 100%',
    color: 'from-rose-600 via-pink-600 to-red-500',
    description: 'Không gian riêng tư cho tình yêu đôi lứa: đếm ngày yêu chính xác từng giây, nhắc các cột mốc kỷ niệm (100, 200, 500, 1000 ngày), lưu giữ nhật ký kỷ niệm, ghi âm voice moments ngọt ngào, chia sẻ playlist tình yêu và câu đố thấu hiểu đối phương.',
    capabilities: [
      'Đếm ngày yêu chính xác và tính thời gian đến cột mốc tiếp theo',
      'Thêm kỷ niệm tình yêu mới kèm ngày tháng và mô tả',
      'Xoá kỷ niệm hoặc xoá các cột mốc đã chọn',
      'Cập nhật ngày bắt đầu yêu và biệt danh đôi lứa',
      'Gửi Love Ping rung chuông yêu thương đến người ấy'
    ],
    supportedActions: ['couple_anniversary', 'add_couple_memory', 'delete_couple_memories', 'update_couple_info'],
    keyStatsLabel: 'Ngày bên nhau',
    sampleQueries: [
      'Đếm ngày yêu nhau hôm nay là ngày thứ bao nhiêu?',
      'Thêm kỷ niệm: Đi du lịch Đà Lạt cùng người yêu ngày 15/08',
      'Xoá kỷ niệm tình yêu cũ',
      'Bao nhiêu ngày nữa là đến cột mốc 1000 ngày yêu?'
    ]
  },
  {
    id: 'finance',
    name: 'Haevy Finance (Sổ Thu Chi 6 Hũ)',
    tagline: 'Quản Lý Tài Chính & Tự Động Phân Bổ 6 Jars',
    category: 'Tài Chính & Két Sắt',
    badge: '6 Jars Master',
    color: 'from-emerald-600 via-teal-600 to-cyan-600',
    description: 'Hệ thống quản lý tài chính thông minh theo phương pháp 6 Hũ (Jars): 50% Thiết yếu (NEC), 10% Tự do tài chính (FFA), 10% Tiết kiệm dài hạn (LTSS), 10% Giáo dục (EDU), 10% Hưởng thụ (PLAY), 10% Thiện nguyện (GIVE). Quản lý đa ví (Ngân hàng, Tiền mặt, Ví điện tử) và báo cáo dòng tiền.',
    capabilities: [
      'Tự động ghi nhận thu nhập và phân bổ tức thì vào 6 hũ chuẩn xác',
      'Ghi chép chi tiêu theo từng hũ và cập nhật số dư ví',
      'Xoá giao dịch đơn lẻ hoặc xoá hàng loạt giao dịch',
      'Xem số dư két sắt tổng và số tiền trong từng hũ tài chính',
      'Báo cáo trực quan cơ cấu tài sản và tỷ lệ chi tiêu'
    ],
    supportedActions: ['finance_transaction', 'delete_finance_transactions', 'get_finance_summary'],
    keyStatsLabel: 'Giao dịch thu chi',
    sampleQueries: [
      'Thêm nhận lương 50 triệu và tự động phân bổ 6 hũ',
      'Thêm chi tiêu 500k tiền ăn uống cà phê từ hũ Hưởng Thụ',
      'Xoá giao dịch thu nhập vừa tạo',
      'Kiểm tra số dư hiện tại trong 6 hũ tài chính'
    ]
  },
  {
    id: 'messages',
    name: 'Haevy Message & Bạn Bè',
    tagline: 'Nhắn Tin Bảo Mật & Kết Nối Toàn Hệ Sinh Thái',
    category: 'Giao Tiếp & Xã Hội',
    badge: 'Realtime Chat',
    color: 'from-blue-600 via-indigo-600 to-violet-600',
    description: 'Hạ tầng nhắn tin thời gian thực an toàn cao, gửi tin nhắn văn bản, voice note cảm xúc, chia sẻ bài hát đang nghe trực tiếp vào khung chat, kết bạn toàn hệ sinh thái và danh bạ thân tộc họ hàng.',
    capabilities: [
      'Gửi tin nhắn trực tiếp đến bạn bè hoặc người thân',
      'Thêm bạn bè mới vào danh bạ Haevy Message',
      'Xoá tin nhắn hoặc xoá cuộc trò chuyện',
      'Chia sẻ bài hát và khoảnh khắc âm nhạc'
    ],
    supportedActions: ['send_chat_message', 'add_friend', 'delete_message', 'delete_friend'],
    keyStatsLabel: 'Bạn bè & Kết nối',
    sampleQueries: [
      'Thêm bạn mới Nguyễn Văn An vào danh bạ Haevy Message',
      'Gửi tin nhắn cho bạn bè',
      'Xoá tin nhắn trong hộp thoại'
    ]
  },
  {
    id: 'studio',
    name: 'Haevy Studio (AI Voice)',
    tagline: 'Phòng Thu Giọng Đọc Trí Tuệ Nhân Tạo',
    category: 'Sáng Tạo & Studio',
    badge: 'AI Voice 2026',
    color: 'from-fuchsia-600 via-purple-600 to-pink-600',
    description: 'Phòng thu âm trí tuệ nhân tạo thế hệ mới: chuyển đổi văn bản thành giọng đọc truyền cảm xúc cao cấp (Text-to-Speech), sáng tác truyện audio, phối hợp nhạc nền thư giãn và xuất bản tác phẩm lên hệ sinh thái.',
    capabilities: [
      'Tạo bản đọc audio từ văn bản kịch bản',
      'Thêm bản thu âm mới vào danh sách studio',
      'Xoá bản thu âm audio cũ',
      'Tùy biến cao độ, tốc độ và cảm xúc giọng đọc'
    ],
    supportedActions: ['create_tts_audio', 'delete_tts_audio'],
    keyStatsLabel: 'Bản thu Studio',
    sampleQueries: [
      'Mở phòng thu Haevy Studio để đọc truyện',
      'Tạo bản thu âm giọng đọc AI mới'
    ]
  },
  {
    id: 'spiritual',
    name: 'Haevy Spiritual (Tâm Linh)',
    tagline: 'Tâm Linh Vũ Trụ, Tarot 3D & Tử Vi 2026',
    category: 'Tâm Linh & Chữa Lành',
    badge: 'Tâm Linh 3D',
    color: 'from-violet-600 via-purple-600 to-indigo-800',
    description: 'Khám phá thế giới huyền học và tâm thức: bói bài Tarot 3D chuẩn xác, giải tử vi trọn đời & vận hạn năm 2026, bản đồ sao chiêm tinh, thần số học Pitago, bói chỉ tay và nghe sóng âm tần số Solfeggio 528Hz chữa lành.',
    capabilities: [
      'Rút quẻ Tarot 3 lá hoặc 1 lá giải đáp băn khoăn',
      'Lưu kết quả trải bài vào nhật ký tâm linh',
      'Xoá kết quả trải bài hoặc nhật ký cũ',
      'Phát sóng âm tần số 432Hz - 528Hz an yên tâm hồn'
    ],
    supportedActions: ['draw_tarot', 'add_spiritual_log', 'delete_spiritual_log'],
    keyStatsLabel: 'Quẻ bói & Nhật ký',
    sampleQueries: [
      'Rút 1 lá bài Tarot cho ngày hôm nay',
      'Xem tử vi năm 2026 cho tuổi Bính Tý',
      'Phát tần số âm thanh Solfeggio 528Hz'
    ]
  },
  {
    id: 'space',
    name: 'Haevy Space (3D AR)',
    tagline: 'Không Gian Sáng Tạo 3D & Thực Tế Tăng Cường',
    category: 'Công Nghệ Không Gian',
    badge: '3D AR Vision',
    color: 'from-cyan-600 via-blue-600 to-indigo-600',
    description: 'Trải nghiệm thực tế ảo tăng cường AR và 3D WebGL đột phá: vẽ các nét cọ tự do trong không gian ba chiều bằng camera và cử chỉ bàn tay, nắn thẳng hình học không gian, mô hình tương tác thời gian thực.',
    capabilities: [
      'Khởi chạy camera AR vẽ 3D trong không gian thực',
      'Lưu lại tác phẩm vẽ 3D vào bộ nhớ',
      'Xoá bản vẽ 3D hoặc dọn dẹp không gian'
    ],
    supportedActions: ['save_3d_art', 'delete_3d_art'],
    keyStatsLabel: 'Bản vẽ 3D',
    sampleQueries: [
      'Mở chế độ vẽ không gian 3D AR',
      'Xoá các bản vẽ 3D cũ'
    ]
  },
  {
    id: 'vip',
    name: 'Haevy VIP & Hội Viên',
    tagline: 'Đặc Quyền Âm Thanh Lossless & Xu Thưởng',
    category: 'Hội Viên & Quà Tặng',
    badge: 'VIP Diamond',
    color: 'from-amber-500 via-yellow-500 to-orange-500',
    description: 'Nâng hạng tài khoản lên VIP Bạc, Vàng hoặc Kim Cương, thưởng thức chất lượng âm thanh Ultra HD FLAC 24-bit/192kHz không nén, nhận xu tương tác mỗi ngày, tham gia Vòng quay may mắn 3D và đổi quà giá trị.',
    capabilities: [
      'Tặng và cộng xu thưởng tương tác vào số dư tài khoản',
      'Kiểm tra hạng thành viên và ngày hết hạn VIP',
      'Mở khóa toàn bộ đặc quyền không giới hạn'
    ],
    supportedActions: ['reward_points', 'check_vip_status'],
    keyStatsLabel: 'Xu tích lũy',
    sampleQueries: [
      'Nhận xu thưởng tương tác hôm nay',
      'Kiểm tra quyền lợi gói VIP Kim Cương'
    ]
  },
  {
    id: 'study',
    name: 'Haevy AI Study (Học Sâu)',
    tagline: 'Phân Tích Nguyên Lý & Logic Chuyên Sâu Tránh Học Vẹt',
    category: 'Trí Tuệ Nhân Tạo & Học Tập',
    badge: 'Gemini 3.5 Flash',
    color: 'from-emerald-500 via-indigo-600 to-purple-600',
    description: 'Công nghệ trợ lý học sâu tích hợp mô hình Gemini 3.5 Flash: tiếp nhận dữ liệu tài liệu văn bản từ hệ thống, phân tích cơ chế bản chất gốc rễ, giải thích logic chiều sâu bằng ví dụ trực quan và tóm tắt cô đọng nhất.',
    capabilities: [
      'Phân tích bản chất logic và nguyên lý hoạt động của tài liệu',
      'Thêm tài liệu học tập mới vào thư viện nghiên cứu',
      'Xoá tài liệu học tập hoặc kết quả phân tích',
      'Giải thích chi tiết theo phong cách sư phạm hiện đại'
    ],
    supportedActions: ['add_study_doc', 'delete_study_docs', 'analyze_study_doc'],
    keyStatsLabel: 'Tài liệu nghiên cứu',
    sampleQueries: [
      'Phân tích nguyên lý hoạt động của phương pháp 6 hũ tài chính',
      'Thêm tài liệu học tập mới',
      'Xoá tài liệu nghiên cứu đã hoàn thành'
    ]
  },
  {
    id: 'admin',
    name: 'Haevy Admin & Bảo Mật 6 Lớp',
    tagline: 'Bảng Quản Trị Hệ Thống & Khiên An Ninh 6 Lớp',
    category: 'Hệ Thống & Quản Trị',
    badge: 'Security Level 6',
    color: 'from-red-600 via-rose-600 to-zinc-800',
    description: 'Trung tâm kiểm soát an ninh hệ thống: bảo mật 6 lớp gồm mã PIN 6 số, sinh trắc học Face ID, xác thực 2 bước OTP Gmail tức thì, phát hiện phiên đăng nhập lạ, chấm điểm bảo mật tài khoản và kiểm duyệt dữ liệu.',
    capabilities: [
      'Kiểm tra điểm số an ninh bảo mật tài khoản',
      'Xem nhật ký đăng nhập và thiết bị',
      'Kích hoạt khiên bảo mật 6 lớp'
    ],
    supportedActions: ['check_security_score'],
    keyStatsLabel: 'Điểm bảo mật',
    sampleQueries: [
      'Kiểm tra điểm an ninh tài khoản của tôi',
      'Xem các tính năng bảo mật 6 lớp'
    ]
  }
];

// ==============================================================================
// ACTION RESULT & UNDO MANAGEMENT
// ==============================================================================
export interface EcosystemActionResult {
  success: boolean;
  actionType: string;
  targetMode: string;
  message: string;
  affectedCount: number;
  dataSummary?: any;
  undoData?: {
    actionType: string;
    targetMode: string;
    backupPayload: any;
  };
}

let lastExecutedAction: EcosystemActionResult | null = null;

export function getLastExecutedAction(): EcosystemActionResult | null {
  return lastExecutedAction;
}

// ==============================================================================
// LIVE ECOSYSTEM DATA AGGREGATOR
// ==============================================================================
export interface EcosystemLiveSnapshot {
  familyTreeCount: number;
  familyTreeName: string;
  tracksCount: number;
  customTracksCount: number;
  playlistsCount: number;
  financeTransactionsCount: number;
  financeTotalBalance: number;
  financeJarsBalance: Record<string, number>;
  coupleDaysCount: number;
  couplePartnerName: string;
  coupleMemoriesCount: number;
  messagesCount: number;
  studyDocsCount: number;
}

export function getEcosystemLiveSnapshot(): EcosystemLiveSnapshot {
  if (typeof window === 'undefined') {
    return {
      familyTreeCount: 0,
      familyTreeName: 'Gia Phả Dòng Họ',
      tracksCount: 0,
      customTracksCount: 0,
      playlistsCount: 0,
      financeTransactionsCount: 0,
      financeTotalBalance: 0,
      financeJarsBalance: {},
      coupleDaysCount: 0,
      couplePartnerName: 'Em Yêu',
      coupleMemoriesCount: 0,
      messagesCount: 0,
      studyDocsCount: 0
    };
  }

  // 1. Family Tree
  let familyTreeCount = 0;
  let familyTreeName = 'Gia Tộc Haevy';
  try {
    const rawMembers = localStorage.getItem('haevy_family_members');
    if (rawMembers) {
      const parsed = JSON.parse(rawMembers);
      if (Array.isArray(parsed)) familyTreeCount = parsed.length;
    }
    const rawTreeInfo = localStorage.getItem('haevy_family_tree_info');
    if (rawTreeInfo) {
      const parsed = JSON.parse(rawTreeInfo);
      if (parsed?.name) familyTreeName = parsed.name;
    }
  } catch (e) {}

  // 2. Custom tracks & playlists
  let customTracksCount = 0;
  let playlistsCount = 0;
  try {
    const rawTracks = localStorage.getItem('haevy_custom_tracks');
    if (rawTracks) {
      const parsed = JSON.parse(rawTracks);
      if (Array.isArray(parsed)) customTracksCount = parsed.length;
    }
    const rawPlaylists = localStorage.getItem('haevy_user_playlists');
    if (rawPlaylists) {
      const parsed = JSON.parse(rawPlaylists);
      if (Array.isArray(parsed)) playlistsCount = parsed.length;
    }
  } catch (e) {}

  // 3. Finance
  let financeTransactionsCount = 0;
  let financeTotalBalance = 0;
  let financeJarsBalance: Record<string, number> = {};
  try {
    const rawTx = localStorage.getItem('haevy_finance_transactions_v2');
    if (rawTx) {
      const parsed = JSON.parse(rawTx);
      if (Array.isArray(parsed)) {
        financeTransactionsCount = parsed.length;
        financeTotalBalance = parsed.reduce((acc: number, t: any) => {
          return t.type === 'income' ? acc + (Number(t.amount) || 0) : acc - (Number(t.amount) || 0);
        }, 0);
      }
    }
    const rawJars = localStorage.getItem('haevy_finance_jars_v2');
    if (rawJars) {
      const parsed = JSON.parse(rawJars);
      if (Array.isArray(parsed)) {
        parsed.forEach((j: any) => {
          if (j?.id) financeJarsBalance[j.id] = Number(j.balance) || 0;
        });
      }
    }
  } catch (e) {}

  // 4. Couple
  let coupleDaysCount = 0;
  let couplePartnerName = 'Em Yêu';
  let coupleMemoriesCount = 0;
  try {
    const startDate = new Date('2024-05-20');
    const now = new Date();
    coupleDaysCount = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const rawMemories = localStorage.getItem('haevy_couple_memories');
    if (rawMemories) {
      const parsed = JSON.parse(rawMemories);
      if (Array.isArray(parsed)) coupleMemoriesCount = parsed.length;
    }
  } catch (e) {}

  // 5. Messages
  let messagesCount = 0;
  try {
    const rawFriends = localStorage.getItem('haevy_messages_friends');
    if (rawFriends) {
      const parsed = JSON.parse(rawFriends);
      if (Array.isArray(parsed)) messagesCount = parsed.length;
    }
  } catch (e) {}

  // 6. Study docs
  let studyDocsCount = 0;
  try {
    const rawDocs = localStorage.getItem('haevy_ai_study_docs');
    if (rawDocs) {
      const parsed = JSON.parse(rawDocs);
      if (Array.isArray(parsed)) studyDocsCount = parsed.length;
    }
  } catch (e) {}

  return {
    familyTreeCount,
    familyTreeName,
    tracksCount: customTracksCount,
    customTracksCount,
    playlistsCount,
    financeTransactionsCount,
    financeTotalBalance,
    financeJarsBalance,
    coupleDaysCount,
    couplePartnerName,
    coupleMemoriesCount,
    messagesCount,
    studyDocsCount
  };
}

// ==============================================================================
// CRUD EXECUTORS FOR HAEVY FAMILY TREE
// ==============================================================================
export function executeAddFamilyMembers(
  newMembers: Array<{
    fullName: string;
    gender?: 'male' | 'female' | 'other';
    generation?: number;
    branch?: string;
    birthDate?: string;
    birthYear?: number | string;
    occupation?: string;
    bio?: string;
    relationshipPartnerName?: string;
    relationshipStatus?: 'single' | 'married' | 'dating' | 'widowed' | 'divorced';
  }>
): EcosystemActionResult {
  try {
    const existingRaw = localStorage.getItem('haevy_family_members') || '[]';
    const currentList: FamilyTreeMember[] = JSON.parse(existingRaw);
    const backupList = [...currentList];

    const addedList: FamilyTreeMember[] = newMembers.map((m, idx) => {
      const id = `member_ai_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      const member: FamilyTreeMember = {
        id,
        treeId: 'haevy_default_tree',
        fullName: m.fullName.trim(),
        gender: m.gender || 'male',
        generation: m.generation || 4,
        branch: m.branch || 'Chi Trưởng',
        isDeceased: false,
        birthDate: m.birthDate || (m.birthYear ? `${m.birthYear}-01-01` : undefined),
        occupation: m.occupation || 'Thành viên Gia tộc Haevy',
        bio: m.bio || 'Được thêm thông qua trợ lý Haevy AI Master.',
        relationshipStatus: m.relationshipStatus || 'single',
        relationshipPartnerName: m.relationshipPartnerName,
        haevyFriendStatus: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Haevy AI Agent'
      };
      return member;
    });

    const updatedList = [...currentList, ...addedList];
    localStorage.setItem('haevy_family_members', JSON.stringify(updatedList));

    // Dispatch global event for Family Tree view to refresh
    window.dispatchEvent(new CustomEvent('haevy_family_updated', { detail: { added: addedList } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'add_family_member',
      targetMode: 'family_tree',
      message: `Đã thêm thành công ${addedList.length} thành viên vào Gia phả: ${addedList.map(a => a.fullName).join(', ')}.`,
      affectedCount: addedList.length,
      dataSummary: { addedMembers: addedList },
      undoData: {
        actionType: 'restore_family_members',
        targetMode: 'family_tree',
        backupPayload: backupList
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'add_family_member',
      targetMode: 'family_tree',
      message: `Lỗi khi thêm thành viên vào gia phả: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

export function executeDeleteFamilyMembers(
  criteria: {
    names?: string[];
    ids?: string[];
    generation?: number;
    keyword?: string;
  }
): EcosystemActionResult {
  try {
    const existingRaw = localStorage.getItem('haevy_family_members') || '[]';
    const currentList: FamilyTreeMember[] = JSON.parse(existingRaw);
    const backupList = [...currentList];

    const toDeleteIds = new Set<string>();

    if (criteria.ids && criteria.ids.length > 0) {
      criteria.ids.forEach(id => toDeleteIds.add(id));
    }

    if (criteria.names && criteria.names.length > 0) {
      const lowerNames = criteria.names.map(n => n.toLowerCase().trim());
      currentList.forEach(m => {
        const mName = m.fullName.toLowerCase();
        if (lowerNames.some(target => mName.includes(target) || target.includes(mName))) {
          toDeleteIds.add(m.id);
        }
      });
    }

    if (criteria.keyword) {
      const kw = criteria.keyword.toLowerCase().trim();
      currentList.forEach(m => {
        if (m.fullName.toLowerCase().includes(kw) || (m.occupation && m.occupation.toLowerCase().includes(kw))) {
          toDeleteIds.add(m.id);
        }
      });
    }

    if (criteria.generation) {
      currentList.forEach(m => {
        if (m.generation === criteria.generation) {
          toDeleteIds.add(m.id);
        }
      });
    }

    if (toDeleteIds.size === 0) {
      return {
        success: false,
        actionType: 'delete_family_members',
        targetMode: 'family_tree',
        message: 'Không tìm thấy thành viên nào khớp với tiêu chí xoá đã yêu cầu.',
        affectedCount: 0
      };
    }

    const remainingList = currentList.filter(m => !toDeleteIds.has(m.id));
    const deletedMembers = currentList.filter(m => toDeleteIds.has(m.id));

    localStorage.setItem('haevy_family_members', JSON.stringify(remainingList));
    window.dispatchEvent(new CustomEvent('haevy_family_updated', { detail: { deleted: deletedMembers } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'delete_family_members',
      targetMode: 'family_tree',
      message: `Đã xoá ${deletedMembers.length} thành viên khỏi gia phả: ${deletedMembers.map(m => m.fullName).join(', ')}.`,
      affectedCount: deletedMembers.length,
      dataSummary: { deletedMembers },
      undoData: {
        actionType: 'restore_family_members',
        targetMode: 'family_tree',
        backupPayload: backupList
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'delete_family_members',
      targetMode: 'family_tree',
      message: `Lỗi khi xoá thành viên: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// CRUD EXECUTORS FOR HAEVY AUDIO & TRACKS
// ==============================================================================
export function executeAddTracks(
  newTracks: Array<{
    title: string;
    artist?: string;
    genre?: string;
    audioUrl?: string;
    coverUrl?: string;
  }>
): EcosystemActionResult {
  try {
    const existingRaw = localStorage.getItem('haevy_custom_tracks') || '[]';
    const currentList: Track[] = JSON.parse(existingRaw);
    const backupList = [...currentList];

    const addedTracks: Track[] = newTracks.map((t, idx) => {
      const id = `track_custom_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`;
      return {
        id,
        title: t.title.trim(),
        artist: t.artist || 'Haevy Sound Lab',
        genre: t.genre || 'Lo-Fi Chill',
        url: t.audioUrl || 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
        coverUrl: t.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        durationSec: 195,
        plays: 1,
        likesCount: 1
      };
    });

    const updated = [...currentList, ...addedTracks];
    localStorage.setItem('haevy_custom_tracks', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haevy_tracks_updated', { detail: { added: addedTracks } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'add_track',
      targetMode: 'audio',
      message: `Đã thêm thành công ${addedTracks.length} bài hát vào Thư viện Audio: ${addedTracks.map(a => a.title).join(', ')}.`,
      affectedCount: addedTracks.length,
      dataSummary: { addedTracks },
      undoData: {
        actionType: 'restore_tracks',
        targetMode: 'audio',
        backupPayload: backupList
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'add_track',
      targetMode: 'audio',
      message: `Lỗi khi thêm bài hát: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

export function executeDeleteTracks(
  criteria: {
    titles?: string[];
    ids?: string[];
    genre?: string;
  }
): EcosystemActionResult {
  try {
    const existingRaw = localStorage.getItem('haevy_custom_tracks') || '[]';
    const currentList: Track[] = JSON.parse(existingRaw);
    const backupList = [...currentList];

    const toDeleteIds = new Set<string>();

    if (criteria.ids && criteria.ids.length > 0) {
      criteria.ids.forEach(id => toDeleteIds.add(id));
    }

    if (criteria.titles && criteria.titles.length > 0) {
      const lowerTitles = criteria.titles.map(t => t.toLowerCase().trim());
      currentList.forEach(t => {
        const title = t.title.toLowerCase();
        if (lowerTitles.some(target => title.includes(target) || target.includes(title))) {
          toDeleteIds.add(t.id);
        }
      });
    }

    if (criteria.genre) {
      const g = criteria.genre.toLowerCase().trim();
      currentList.forEach(t => {
        if (t.genre && t.genre.toLowerCase().includes(g)) {
          toDeleteIds.add(t.id);
        }
      });
    }

    if (toDeleteIds.size === 0) {
      return {
        success: false,
        actionType: 'delete_tracks',
        targetMode: 'audio',
        message: 'Không tìm thấy bài hát nào khớp với yêu cầu xoá.',
        affectedCount: 0
      };
    }

    const remaining = currentList.filter(t => !toDeleteIds.has(t.id));
    const deleted = currentList.filter(t => toDeleteIds.has(t.id));

    localStorage.setItem('haevy_custom_tracks', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('haevy_tracks_updated', { detail: { deleted } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'delete_tracks',
      targetMode: 'audio',
      message: `Đã xoá ${deleted.length} bài hát khỏi Thư viện: ${deleted.map(t => t.title).join(', ')}.`,
      affectedCount: deleted.length,
      dataSummary: { deletedTracks: deleted },
      undoData: {
        actionType: 'restore_tracks',
        targetMode: 'audio',
        backupPayload: backupList
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'delete_tracks',
      targetMode: 'audio',
      message: `Lỗi khi xoá bài hát: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// CRUD EXECUTORS FOR HAEVY FINANCE (6 HŨ JARS)
// ==============================================================================
export function executeAddFinanceTransaction(
  payload: {
    type: 'income' | 'expense';
    amount: number;
    title: string;
    category?: string;
    walletId?: string;
    jarId?: string;
    jarsAllocation?: {
      essential: number;
      savings: number;
      education: number;
      enjoyment: number;
      investment: number;
      charity: number;
    };
  }
): EcosystemActionResult {
  try {
    const rawTx = localStorage.getItem('haevy_finance_transactions_v2') || '[]';
    const currentTx: any[] = JSON.parse(rawTx);
    const backupTx = [...currentTx];

    const amount = Number(payload.amount) || 0;
    const now = new Date();

    const newTx = {
      id: `tx_ai_${Date.now()}`,
      title: payload.title || (payload.type === 'income' ? 'Thu nhập được thêm qua Haevy AI' : 'Chi tiêu qua Haevy AI'),
      type: payload.type,
      amount,
      category: payload.category || (payload.type === 'income' ? 'Lương & Thưởng' : 'Thiết yếu'),
      walletId: payload.walletId || 'wallet_bank',
      jarId: payload.jarId || 'essential',
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      jarsAllocation: payload.jarsAllocation || (payload.type === 'income' ? {
        essential: Math.round(amount * 0.5),
        savings: Math.round(amount * 0.1),
        education: Math.round(amount * 0.1),
        enjoyment: Math.round(amount * 0.1),
        investment: Math.round(amount * 0.1),
        charity: Math.round(amount * 0.1)
      } : undefined)
    };

    const updatedTx = [newTx, ...currentTx];
    localStorage.setItem('haevy_finance_transactions_v2', JSON.stringify(updatedTx));

    // Update 6 Jars balances in localStorage if income
    if (payload.type === 'income' && newTx.jarsAllocation) {
      const rawJars = localStorage.getItem('haevy_finance_jars_v2');
      if (rawJars) {
        try {
          const jars = JSON.parse(rawJars);
          const alloc = newTx.jarsAllocation;
          const updatedJars = jars.map((j: any) => {
            if (j.id === 'essential') j.balance = (Number(j.balance) || 0) + alloc.essential;
            if (j.id === 'savings') j.balance = (Number(j.balance) || 0) + alloc.savings;
            if (j.id === 'education') j.balance = (Number(j.balance) || 0) + alloc.education;
            if (j.id === 'enjoyment') j.balance = (Number(j.balance) || 0) + alloc.enjoyment;
            if (j.id === 'investment') j.balance = (Number(j.balance) || 0) + alloc.investment;
            if (j.id === 'charity') j.balance = (Number(j.balance) || 0) + alloc.charity;
            return j;
          });
          localStorage.setItem('haevy_finance_jars_v2', JSON.stringify(updatedJars));
        } catch (e) {}
      }
    }

    window.dispatchEvent(new CustomEvent('haevy_finance_updated', { detail: { added: newTx } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'finance_transaction',
      targetMode: 'finance',
      message: `Đã ghi nhận thành công ${payload.type === 'income' ? 'thu nhập' : 'chi tiêu'} ${amount.toLocaleString('vi-VN')} đ và tự động phân bổ vào 6 Hũ.`,
      affectedCount: 1,
      dataSummary: newTx,
      undoData: {
        actionType: 'restore_finance',
        targetMode: 'finance',
        backupPayload: backupTx
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'finance_transaction',
      targetMode: 'finance',
      message: `Lỗi ghi chép tài chính: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

export function executeDeleteFinanceTransactions(
  criteria: {
    ids?: string[];
    count?: number;
    clearRecent?: boolean;
    category?: string;
  }
): EcosystemActionResult {
  try {
    const rawTx = localStorage.getItem('haevy_finance_transactions_v2') || '[]';
    const currentTx: any[] = JSON.parse(rawTx);
    const backupTx = [...currentTx];

    let deleted: any[] = [];
    let remaining: any[] = [];

    if (criteria.ids && criteria.ids.length > 0) {
      const idSet = new Set(criteria.ids);
      deleted = currentTx.filter(t => idSet.has(t.id));
      remaining = currentTx.filter(t => !idSet.has(t.id));
    } else if (criteria.clearRecent || criteria.count) {
      const countToDelete = criteria.count || 1;
      deleted = currentTx.slice(0, countToDelete);
      remaining = currentTx.slice(countToDelete);
    } else if (criteria.category) {
      const cat = criteria.category.toLowerCase().trim();
      deleted = currentTx.filter(t => t.category && t.category.toLowerCase().includes(cat));
      remaining = currentTx.filter(t => !(t.category && t.category.toLowerCase().includes(cat)));
    }

    if (deleted.length === 0) {
      return {
        success: false,
        actionType: 'delete_finance_transactions',
        targetMode: 'finance',
        message: 'Không có giao dịch nào khớp để xoá.',
        affectedCount: 0
      };
    }

    localStorage.setItem('haevy_finance_transactions_v2', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('haevy_finance_updated', { detail: { deleted } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'delete_finance_transactions',
      targetMode: 'finance',
      message: `Đã xoá ${deleted.length} giao dịch tài chính gần nhất khỏi Sổ thu chi.`,
      affectedCount: deleted.length,
      dataSummary: { deleted },
      undoData: {
        actionType: 'restore_finance',
        targetMode: 'finance',
        backupPayload: backupTx
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'delete_finance_transactions',
      targetMode: 'finance',
      message: `Lỗi xoá giao dịch: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// CRUD EXECUTORS FOR I LOVE HAEVY (CẶP ĐÔI)
// ==============================================================================
export function executeAddCoupleMemory(
  payload: {
    title: string;
    date?: string;
    description?: string;
    location?: string;
    imageUrl?: string;
  }
): EcosystemActionResult {
  try {
    const rawMemories = localStorage.getItem('haevy_couple_memories') || '[]';
    const currentMemories: any[] = JSON.parse(rawMemories);
    const backup = [...currentMemories];

    const newMemory = {
      id: `memory_ai_${Date.now()}`,
      title: payload.title.trim(),
      date: payload.date || new Date().toISOString().split('T')[0],
      description: payload.description || 'Kỷ niệm tình yêu được ghi lại cùng Haevy AI.',
      location: payload.location || 'Nơi Hẹn Hò Yêu Dấu',
      imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString()
    };

    const updated = [newMemory, ...currentMemories];
    localStorage.setItem('haevy_couple_memories', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haevy_couple_updated', { detail: { added: newMemory } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'add_couple_memory',
      targetMode: 'couple',
      message: `Đã lưu kỷ niệm tình yêu mới: "${newMemory.title}" vào dòng thời gian I Love Haevy.`,
      affectedCount: 1,
      dataSummary: newMemory,
      undoData: {
        actionType: 'restore_couple',
        targetMode: 'couple',
        backupPayload: backup
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'add_couple_memory',
      targetMode: 'couple',
      message: `Lỗi thêm kỷ niệm: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

export function executeDeleteCoupleMemories(
  criteria: {
    titles?: string[];
    ids?: string[];
    clearRecent?: boolean;
  }
): EcosystemActionResult {
  try {
    const rawMemories = localStorage.getItem('haevy_couple_memories') || '[]';
    const currentMemories: any[] = JSON.parse(rawMemories);
    const backup = [...currentMemories];

    let deleted: any[] = [];
    let remaining: any[] = [];

    if (criteria.ids && criteria.ids.length > 0) {
      const set = new Set(criteria.ids);
      deleted = currentMemories.filter(m => set.has(m.id));
      remaining = currentMemories.filter(m => !set.has(m.id));
    } else if (criteria.titles && criteria.titles.length > 0) {
      const lower = criteria.titles.map(t => t.toLowerCase().trim());
      deleted = currentMemories.filter(m => lower.some(target => m.title.toLowerCase().includes(target)));
      remaining = currentMemories.filter(m => !lower.some(target => m.title.toLowerCase().includes(target)));
    } else if (criteria.clearRecent) {
      deleted = currentMemories.slice(0, 1);
      remaining = currentMemories.slice(1);
    }

    if (deleted.length === 0) {
      return {
        success: false,
        actionType: 'delete_couple_memories',
        targetMode: 'couple',
        message: 'Không tìm thấy kỷ niệm nào phù hợp để xoá.',
        affectedCount: 0
      };
    }

    localStorage.setItem('haevy_couple_memories', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('haevy_couple_updated', { detail: { deleted } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'delete_couple_memories',
      targetMode: 'couple',
      message: `Đã xoá ${deleted.length} kỷ niệm: ${deleted.map(m => m.title).join(', ')}.`,
      affectedCount: deleted.length,
      dataSummary: { deleted },
      undoData: {
        actionType: 'restore_couple',
        targetMode: 'couple',
        backupPayload: backup
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'delete_couple_memories',
      targetMode: 'couple',
      message: `Lỗi xoá kỷ niệm: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// CRUD EXECUTORS FOR HAEVY MESSAGE (BẠN BÈ & TIN NHẮN)
// ==============================================================================
export function executeAddFriend(
  payload: {
    fullName: string;
    username?: string;
    avatarUrl?: string;
    relationNote?: string;
  }
): EcosystemActionResult {
  try {
    const raw = localStorage.getItem('haevy_messages_friends') || '[]';
    const currentList: any[] = JSON.parse(raw);
    const backup = [...currentList];

    const newFriend = {
      id: `friend_${Date.now()}`,
      fullName: payload.fullName.trim(),
      username: payload.username || `@${payload.fullName.toLowerCase().replace(/\s+/g, '')}`,
      avatarUrl: payload.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      relationNote: payload.relationNote || 'Bạn bè trong hệ sinh thái Haevy',
      status: 'online',
      addedAt: new Date().toISOString()
    };

    const updated = [...currentList, newFriend];
    localStorage.setItem('haevy_messages_friends', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haevy_messages_updated', { detail: { friendAdded: newFriend } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'add_friend',
      targetMode: 'messages',
      message: `Đã thêm bạn bè mới: ${newFriend.fullName} (${newFriend.username}) vào danh bạ Haevy Message!`,
      affectedCount: 1,
      dataSummary: newFriend,
      undoData: {
        actionType: 'restore_friends',
        targetMode: 'messages',
        backupPayload: backup
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'add_friend',
      targetMode: 'messages',
      message: `Lỗi kết bạn: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

export function executeDeleteFriend(friendNameOrId: string): EcosystemActionResult {
  try {
    const raw = localStorage.getItem('haevy_messages_friends') || '[]';
    const currentList: any[] = JSON.parse(raw);
    const backup = [...currentList];

    const target = friendNameOrId.toLowerCase().trim();
    const deleted = currentList.filter(f => f.id === target || f.fullName.toLowerCase().includes(target));
    const remaining = currentList.filter(f => !(f.id === target || f.fullName.toLowerCase().includes(target)));

    if (deleted.length === 0) {
      return {
        success: false,
        actionType: 'delete_friend',
        targetMode: 'messages',
        message: `Không tìm thấy bạn bè "${friendNameOrId}" trong danh bạ để xoá.`,
        affectedCount: 0
      };
    }

    localStorage.setItem('haevy_messages_friends', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('haevy_messages_updated', { detail: { friendDeleted: deleted } }));

    const result: EcosystemActionResult = {
      success: true,
      actionType: 'delete_friend',
      targetMode: 'messages',
      message: `Đã xoá ${deleted.length} người khỏi danh bạ bạn bè: ${deleted.map(f => f.fullName).join(', ')}.`,
      affectedCount: deleted.length,
      dataSummary: { deleted },
      undoData: {
        actionType: 'restore_friends',
        targetMode: 'messages',
        backupPayload: backup
      }
    };
    lastExecutedAction = result;
    return result;
  } catch (err: any) {
    return {
      success: false,
      actionType: 'delete_friend',
      targetMode: 'messages',
      message: `Lỗi xoá bạn bè: ${err?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// UNDO SYSTEM
// ==============================================================================
export function executeUndoLastAction(): EcosystemActionResult {
  if (!lastExecutedAction || !lastExecutedAction.undoData) {
    return {
      success: false,
      actionType: 'undo',
      targetMode: 'portal',
      message: 'Không có tác vụ gần nhất nào để hoàn tác.',
      affectedCount: 0
    };
  }

  const { actionType, targetMode, backupPayload } = lastExecutedAction.undoData;

  try {
    if (actionType === 'restore_family_members') {
      localStorage.setItem('haevy_family_members', JSON.stringify(backupPayload));
      window.dispatchEvent(new CustomEvent('haevy_family_updated', { detail: { restored: true } }));
    } else if (actionType === 'restore_tracks') {
      localStorage.setItem('haevy_custom_tracks', JSON.stringify(backupPayload));
      window.dispatchEvent(new CustomEvent('haevy_tracks_updated', { detail: { restored: true } }));
    } else if (actionType === 'restore_finance') {
      localStorage.setItem('haevy_finance_transactions_v2', JSON.stringify(backupPayload));
      window.dispatchEvent(new CustomEvent('haevy_finance_updated', { detail: { restored: true } }));
    } else if (actionType === 'restore_couple') {
      localStorage.setItem('haevy_couple_memories', JSON.stringify(backupPayload));
      window.dispatchEvent(new CustomEvent('haevy_couple_updated', { detail: { restored: true } }));
    } else if (actionType === 'restore_friends') {
      localStorage.setItem('haevy_messages_friends', JSON.stringify(backupPayload));
      window.dispatchEvent(new CustomEvent('haevy_messages_updated', { detail: { restored: true } }));
    }

    lastExecutedAction = null;
    return {
      success: true,
      actionType: 'undo',
      targetMode,
      message: `Đã hoàn tác thành công tác vụ vừa rồi trong chế độ ${targetMode}!`,
      affectedCount: 1
    };
  } catch (e: any) {
    return {
      success: false,
      actionType: 'undo',
      targetMode,
      message: `Lỗi khi hoàn tác: ${e?.message || 'Không xác định'}`,
      affectedCount: 0
    };
  }
}

// ==============================================================================
// UNIVERSAL NLP COMMAND PARSER (CLIENT-SIDE RULE-BASED FALLBACK)
// ==============================================================================
export interface ParsedEcosystemIntent {
  intent: string;
  targetMode: string;
  actionData: any;
  confidence: number;
}

export function parseEcosystemNaturalCommand(query: string): ParsedEcosystemIntent | null {
  const q = query.toLowerCase().trim();

  // 1. FAMILY TREE: ADD MEMBER
  if (
    (q.includes('thêm') || q.includes('tạo') || q.includes('bổ sung')) &&
    (q.includes('thành viên') || q.includes('người') || q.includes('ông') || q.includes('bà') || q.includes('bác') || q.includes('chú') || q.includes('anh') || q.includes('em') || q.includes('cháu')) &&
    (q.includes('gia phả') || q.includes('dòng họ') || q.includes('đời') || q.includes('chi'))
  ) {
    // Extract name
    let name = 'Nguyễn Văn Mới';
    const nameMatch = query.match(/(?:thành viên|tên là|tên:?)\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ][a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ\s]+)/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim().split(',')[0].split(' đời')[0].split(' sinh')[0];
    }

    // Extract generation
    let gen = 4;
    const genMatch = query.match(/đời\s*(\d+)/i) || query.match(/thế hệ\s*(\d+)/i);
    if (genMatch) gen = parseInt(genMatch[1]);

    // Extract branch
    let branch = 'Chi Trưởng';
    if (q.includes('chi 2') || q.includes('chi hai')) branch = 'Chi Thứ 2';
    if (q.includes('chi 3') || q.includes('chi ba')) branch = 'Chi Thứ 3';

    // Extract birth year
    let birthYear = 1990;
    const yearMatch = query.match(/sinh năm\s*(\d{4})/i) || query.match(/năm\s*(\d{4})/i);
    if (yearMatch) birthYear = parseInt(yearMatch[1]);

    return {
      intent: 'add_family_member',
      targetMode: 'family_tree',
      actionData: {
        type: 'add_family_member',
        title: 'Thêm Thành Viên Gia Phả Mới',
        members: [
          {
            fullName: name,
            generation: gen,
            branch: branch,
            birthYear: birthYear,
            gender: q.includes('bà') || q.includes('cô') || q.includes('chị') || q.includes('mẹ') ? 'female' : 'male'
          }
        ]
      },
      confidence: 0.95
    };
  }

  // 2. FAMILY TREE: DELETE MEMBERS
  if (
    (q.includes('xoá') || q.includes('xóa') || q.includes('loại bỏ')) &&
    (q.includes('thành viên') || q.includes('người')) &&
    (q.includes('gia phả') || q.includes('dòng họ'))
  ) {
    let name = '';
    const nameMatch = query.match(/(?:thành viên|tên là|tên:?)\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ][a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ\s]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim().split(' khỏi')[0].split(' trong')[0];
    }

    return {
      intent: 'delete_family_members',
      targetMode: 'family_tree',
      actionData: {
        type: 'delete_family_members',
        title: 'Xoá Thành Viên Gia Phả',
        names: name ? [name] : undefined
      },
      confidence: 0.9
    };
  }

  // 3. AUDIO: ADD TRACK
  if (
    (q.includes('thêm') || q.includes('tải') || q.includes('bổ sung')) &&
    (q.includes('bài hát') || q.includes('nhạc') || q.includes('track') || q.includes('audio')) &&
    (q.includes('playlist') || q.includes('danh sách') || q.includes('thư viện') || q.includes('vào'))
  ) {
    let title = 'Lo-Fi Chill Night';
    const titleMatch = query.match(/(?:bài hát|bài|nhạc)\s+["']?([^"']+)["']?/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].split(' vào')[0].split(' của')[0].trim();
    }

    return {
      intent: 'add_track',
      targetMode: 'audio',
      actionData: {
        type: 'add_track',
        title: 'Thêm Bài Hát Vào Thư Viện',
        tracks: [
          {
            title: title,
            artist: 'Haevy Artist',
            genre: q.includes('lo-fi') ? 'Lo-Fi Chill' : q.includes('acoustic') ? 'Acoustic' : 'Lossless VIP'
          }
        ]
      },
      confidence: 0.92
    };
  }

  // 4. AUDIO: DELETE TRACKS
  if (
    (q.includes('xoá') || q.includes('xóa') || q.includes('gỡ')) &&
    (q.includes('bài hát') || q.includes('track') || q.includes('bài')) &&
    (q.includes('playlist') || q.includes('danh sách') || q.includes('thư viện'))
  ) {
    return {
      intent: 'delete_tracks',
      targetMode: 'audio',
      actionData: {
        type: 'delete_tracks',
        title: 'Xoá Bài Hát Khỏi Danh Sách',
        titles: []
      },
      confidence: 0.9
    };
  }

  // 5. FINANCE: ADD TRANSACTION (INCOME OR EXPENSE)
  if (
    (q.includes('thêm') || q.includes('nhận') || q.includes('thu nhập') || q.includes('lương') || q.includes('chi tiêu') || q.includes('mua') || q.includes('trả tiền') || q.includes('ăn uống')) &&
    (/\d+\s*(?:tr|triệu|k|nghìn|ngàn|đ|vnd|đồng)/i.test(q) || /\d{5,}/.test(q))
  ) {
    const isIncome = q.includes('nhận') || q.includes('thu nhập') || q.includes('lương') || q.includes('thưởng') || q.includes('cộng');
    
    // Parse money amount
    let amount = 5000000;
    const millionMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:tr|triệu)/i);
    const thousandMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:k|nghìn|ngàn)/i);
    const rawNumberMatch = q.match(/(\d{4,10})/);

    if (millionMatch) {
      amount = parseFloat(millionMatch[1].replace(',', '.')) * 1000000;
    } else if (thousandMatch) {
      amount = parseFloat(thousandMatch[1].replace(',', '.')) * 1000;
    } else if (rawNumberMatch) {
      amount = parseInt(rawNumberMatch[1]);
    }

    return {
      intent: 'finance_transaction',
      targetMode: 'finance',
      actionData: {
        type: 'finance_transaction',
        transactionType: isIncome ? 'income' : 'expense',
        amount: amount,
        title: isIncome ? 'Lương / Thu nhập tháng này' : 'Chi tiêu sinh hoạt',
        jarsAllocation: isIncome ? {
          essential: Math.round(amount * 0.5),
          savings: Math.round(amount * 0.1),
          education: Math.round(amount * 0.1),
          enjoyment: Math.round(amount * 0.1),
          investment: Math.round(amount * 0.1),
          charity: Math.round(amount * 0.1)
        } : undefined
      },
      confidence: 0.95
    };
  }

  // 6. FINANCE: DELETE TRANSACTIONS
  if (
    (q.includes('xoá') || q.includes('xóa') || q.includes('huỷ') || q.includes('hủy')) &&
    (q.includes('giao dịch') || q.includes('thu chi') || q.includes('khoản chi') || q.includes('khoản thu'))
  ) {
    return {
      intent: 'delete_finance_transactions',
      targetMode: 'finance',
      actionData: {
        type: 'delete_finance_transactions',
        title: 'Xoá Giao Dịch Tài Chính',
        clearRecent: true
      },
      confidence: 0.92
    };
  }

  // 7. COUPLE: ADD MEMORY
  if (
    (q.includes('thêm') || q.includes('lưu') || q.includes('ghi lại')) &&
    (q.includes('kỷ niệm') || q.includes('ngày yêu') || q.includes('hẹn hò') || q.includes('đi chơi'))
  ) {
    let title = 'Buổi hẹn hò lãng mạn';
    const match = query.match(/(?:kỷ niệm|về|tiêu đề:?)\s*[:"']?([^"'\n]+)/i);
    if (match && match[1]) title = match[1].trim();

    return {
      intent: 'add_couple_memory',
      targetMode: 'couple',
      actionData: {
        type: 'add_couple_memory',
        title: 'Thêm Kỷ Niệm Tình Yêu Mới',
        memoryTitle: title
      },
      confidence: 0.93
    };
  }

  // 8. COUPLE: DELETE MEMORY
  if (
    (q.includes('xoá') || q.includes('xóa')) &&
    (q.includes('kỷ niệm') || q.includes('cột mốc'))
  ) {
    return {
      intent: 'delete_couple_memories',
      targetMode: 'couple',
      actionData: {
        type: 'delete_couple_memories',
        title: 'Xoá Kỷ Niệm Tình Yêu',
        clearRecent: true
      },
      confidence: 0.9
    };
  }

  // 9. MESSAGES: ADD FRIEND
  if (
    (q.includes('kết bạn') || q.includes('thêm bạn') || q.includes('kết nối')) &&
    (q.includes('bạn') || q.includes('tin nhắn') || q.includes('danh bạ'))
  ) {
    let name = 'Người Bạn Mới';
    const match = query.match(/(?:bạn|với|tên là)\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ][a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ\s]+)/i);
    if (match && match[1]) name = match[1].trim();

    return {
      intent: 'add_friend',
      targetMode: 'messages',
      actionData: {
        type: 'add_friend',
        title: 'Thêm Bạn Bè Mới',
        fullName: name
      },
      confidence: 0.91
    };
  }

  // 10. NAVIGATION OR MODE INFO
  for (const mode of HAEVY_ECOSYSTEM_MODES_INFO) {
    if (
      q.includes(mode.name.toLowerCase()) || 
      (mode.id !== 'audio' && q.includes(mode.id)) ||
      (mode.id === 'family_tree' && (q.includes('gia phả') || q.includes('dòng họ'))) ||
      (mode.id === 'couple' && (q.includes('cặp đôi') || q.includes('tình yêu') || q.includes('i love haevy'))) ||
      (mode.id === 'finance' && (q.includes('tài chính') || q.includes('6 hũ') || q.includes('két sắt'))) ||
      (mode.id === 'spiritual' && (q.includes('tâm linh') || q.includes('tarot') || q.includes('tử vi'))) ||
      (mode.id === 'space' && (q.includes('3d') || q.includes('ar') || q.includes('không gian'))) ||
      (mode.id === 'study' && (q.includes('học sâu') || q.includes('phân tích tài liệu')))
    ) {
      if (q.includes('mở') || q.includes('chuyển sang') || q.includes('vào chế độ')) {
        return {
          intent: 'navigate_mode',
          targetMode: mode.id,
          actionData: {
            type: 'navigate_mode',
            target: mode.id,
            modeName: mode.name
          },
          confidence: 0.95
        };
      }
    }
  }

  return null;
}
