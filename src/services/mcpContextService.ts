// ==============================================================================
// HAEVY MCP (MODEL CONTEXT PROTOCOL) SERVICE & CONTEXT PROVIDER
// Specification: Model Context Protocol (MCP) JSON-RPC 2.0
// Allows AI models to securely authenticate, query, and retrieve live user context
// ==============================================================================

export type MCPConnectionStatus = 'disconnected' | 'authenticating' | 'connected' | 'error';

export interface MCPScope {
  id: string;
  name: string;
  description: string;
  category: string;
  recommended: boolean;
}

export const MCP_AVAILABLE_SCOPES: MCPScope[] = [
  {
    id: 'profile:read',
    name: 'Hồ Sơ & Định Danh',
    description: 'Cho phép AI đọc thông tin cá nhân, tên hiển thị, ID tài khoản, vai trò, huy hiệu và trạng thái VIP.',
    category: 'Định danh',
    recommended: true
  },
  {
    id: 'level_exp:read',
    name: 'Cấp Độ LV & Đặc Quyền',
    description: 'Cho phép AI truy cứu cấp độ hiện tại, số điểm EXP, % thăng cấp và quà tặng chưa nhận.',
    category: 'Tiến trình',
    recommended: true
  },
  {
    id: 'finance:read',
    name: 'Tài Chính & Sổ 6 Hũ',
    description: 'Cho phép AI kiểm tra số dư Xu Haevy, dòng tiền thu chi, danh sách ví tài chính và phân bổ 6 hũ.',
    category: 'Tài chính',
    recommended: true
  },
  {
    id: 'audio:read',
    name: 'Kho Nhạc & Lịch Sử Nghe',
    description: 'Cho phép AI đọc thời lượng nghe nhạc, bài hát yêu thích, sách nói và danh sách phát cá nhân.',
    category: 'Giải trí',
    recommended: true
  },
  {
    id: 'family:read',
    name: 'Gia Phả Dòng Họ',
    description: 'Cho phép AI tra cứu các thế hệ, danh sách thành viên, phân chi phái và ngày giỗ thân tộc.',
    category: 'Dòng họ',
    recommended: false
  },
  {
    id: 'couple:read',
    name: 'Không Gian Cặp Đôi (I Love Haevy)',
    description: 'Cho phép AI đọc số ngày yêu, nhật ký kỷ niệm, bucket list và cột mốc tình yêu đôi lứa.',
    category: 'Tình cảm',
    recommended: false
  },
  {
    id: 'edu:read',
    name: 'Học Tập & Sổ Tay Nghiên Cứu',
    description: 'Cho phép AI truy cứu sổ tay First Principles, chuỗi Streak, lịch sử Casio fx-880 và XP giáo dục.',
    category: 'Học tập',
    recommended: true
  },
  {
    id: 'tasks:read',
    name: 'Nhiệm Vụ & Thói Quen Hàng Ngày',
    description: 'Cho phép AI kiểm tra danh sách thói quen (Habits), to-do list việc cần làm và điểm số năng suất.',
    category: 'Năng suất',
    recommended: true
  },
  {
    id: 'drive:read',
    name: 'Tệp Tin & Lưu Trữ Đám Mây',
    description: 'Cho phép AI tra cứu dung lượng bộ nhớ cá nhân, số lượng tài liệu đã tải lên và tệp gần đây.',
    category: 'Dữ liệu',
    recommended: true
  },
  {
    id: 'community:read',
    name: 'Mạng Xã Hội & Bạn Bè',
    description: 'Cho phép AI đọc số lượng người theo dõi, bài đăng chia sẻ và bài viết học thuật đã lưu.',
    category: 'Cộng đồng',
    recommended: false
  },
  {
    id: 'web_search:use',
    name: 'Tìm Kiếm Dữ Liệu Web Toàn Cầu',
    description: 'Cho phép MCP tìm kiếm tin tức, tài liệu, bài viết và thông tin mới nhất trên toàn thế giới qua Internet.',
    category: 'Mở rộng Web',
    recommended: true
  },
  {
    id: 'web_read:use',
    name: 'Đọc Toàn Bộ Nội Dung Trang Web',
    description: 'Cho phép MCP tải và đọc trọn vẹn toàn bộ bài viết, cấu trúc đề mục và chi tiết từ mọi đường link URL.',
    category: 'Mở rộng Web',
    recommended: true
  },
  {
    id: 'security:read',
    name: 'An Ninh & Pháo Đài 6 Lớp (Chỉ số an toàn)',
    description: 'Cho phép AI kiểm tra điểm an ninh tài khoản, trạng thái kích hoạt 6 lớp bảo vệ (tuyệt đối không bao gồm mật khẩu hay mã khóa).',
    category: 'Bảo mật',
    recommended: false
  }
];

export interface MCPAuthSession {
  token: string;
  accountId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  authenticatedAt: string;
  expiresAt: string;
  grantedScopes: string[];
  protocolVersion: string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export const MCP_AVAILABLE_TOOLS: MCPToolDefinition[] = [
  {
    name: 'mcp_read_user_profile',
    description: 'Đọc thông tin tổng quan hồ sơ người dùng: ID, Tên hiển thị, Email, Phân hạng VIP, Ngày tham gia, Huy hiệu.',
    category: 'Định Danh',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Mã ID tài khoản Haevy của người dùng' }
      },
      required: ['accountId']
    }
  },
  {
    name: 'mcp_query_level_exp',
    description: 'Truy cứu cấp độ LV (1-15), số điểm EXP hiện có, % tiến trình đến cấp kế tiếp, và các phần quà đặc quyền chưa nhận.',
    category: 'Cấp Độ',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Mã ID tài khoản' },
        includePerks: { type: 'boolean', description: 'Có kèm danh sách đặc quyền mở khóa không' }
      }
    }
  },
  {
    name: 'mcp_inspect_finance_jars',
    description: 'Truy cứu số dư Xu Haevy, ví tài chính (Ngân hàng, Tiền mặt, Ví điện tử) và báo cáo phân bổ 6 Hũ thông minh.',
    category: 'Tài Chính',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Khoảng thời gian (today, this_month, all_time)' }
      }
    }
  },
  {
    name: 'mcp_fetch_audio_stats',
    description: 'Đọc lịch sử nghe nhạc hôm nay, tổng số phút nghe, các bài hát yêu thích và danh sách phát cá nhân.',
    category: 'Audio',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Số lượng bài hát yêu thích cần lấy' }
      }
    }
  },
  {
    name: 'mcp_query_family_tree',
    description: 'Truy cứu cây gia phả dòng họ, danh sách các đời thế hệ, phân chi phái và thống kê thân tộc.',
    category: 'Gia Phả',
    inputSchema: {
      type: 'object',
      properties: {
        generation: { type: 'number', description: 'Lọc theo đời thứ mấy trong gia tộc' },
        searchName: { type: 'string', description: 'Tìm kiếm thành viên theo tên' }
      }
    }
  },
  {
    name: 'mcp_inspect_couple_data',
    description: 'Đọc dữ liệu không gian cặp đôi: Số ngày yêu nhau, ngày kỷ niệm, cột mốc tiếp theo và nhật ký kỷ niệm.',
    category: 'Cặp Đôi',
    inputSchema: {
      type: 'object',
      properties: {
        includeMemories: { type: 'boolean', description: 'Có kèm danh sách kỷ niệm đã lưu hay không' }
      }
    }
  },
  {
    name: 'mcp_read_edu_notes',
    description: 'Đọc sổ tay ghi chép nghiên cứu First Principles, lịch sử tính toán Casio fx-880 và tiến độ phòng thí nghiệm STEM.',
    category: 'Giáo Dục',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Môn học (physics, chemistry, biology, math, stem)' }
      }
    }
  },
  {
    name: 'mcp_check_security_status',
    description: 'Kiểm tra điểm an ninh tài khoản (0-100%), trạng thái bảo vệ 6 lớp (Mã PIN, OTP Gmail, Face ID sinh trắc học) - Tuyệt đối không chứa mật khẩu hay mã khóa bí mật.',
    category: 'Bảo Mật',
    inputSchema: {
      type: 'object',
      properties: {
        auditLevel: { type: 'string', description: 'Mức độ kiểm tra an ninh (basic, full)' }
      }
    }
  },
  {
    name: 'mcp_web_search',
    description: 'Tìm kiếm tin tức, dữ liệu trực tuyến, tài liệu học thuật và thông tin mới nhất trên toàn cầu qua Internet kèm tiêu đề, tóm tắt và URL.',
    category: 'Tìm Kiếm Web',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Từ khóa hoặc câu hỏi cần tìm kiếm trực tuyến' },
        limit: { type: 'number', description: 'Số lượng kết quả cần lấy (mặc định 5-10)' },
        domain: { type: 'string', description: 'Lọc tên miền mong muốn (tùy chọn)' }
      },
      required: ['query']
    }
  },
  {
    name: 'mcp_fetch_web_page',
    description: 'Tải và đọc trọn vẹn toàn bộ bài viết của trang web từ đường link URL. Tự động trích xuất tiêu đề, cấu trúc đề mục H1-H3, toàn bộ nội dung văn bản đầy đủ (đã lọc sạch quảng cáo và mã kịch bản rác).',
    category: 'Đọc Toàn Bộ Web',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Đường link URL trang web cần đọc toàn bộ nội dung' },
        maxLength: { type: 'number', description: 'Độ dài ký tự tối đa cần trích xuất (mặc định 50,000)' }
      },
      required: ['url']
    }
  },
  {
    name: 'mcp_search_and_read',
    description: 'Nghiên cứu sâu trên Web: Tìm kiếm trực tuyến và tự động đọc toàn bộ nội dung của các trang web đứng đầu để tổng hợp báo cáo chi tiết cho người dùng.',
    category: 'Nghiên Cứu Web',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Chủ đề cần nghiên cứu và đọc toàn diện' },
        limit: { type: 'number', description: 'Số lượng trang web cần đọc toàn bộ (mặc định 3)' }
      },
      required: ['query']
    }
  },
  {
    name: 'mcp_read_tasks_and_habits',
    description: 'Kiểm tra danh sách thói quen hằng ngày (Habits), tiến độ chuỗi streak, danh sách việc cần làm (To-Do) và chỉ số năng suất cá nhân.',
    category: 'Năng Suất',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Bộ lọc (all, today, pending, completed)' }
      }
    }
  },
  {
    name: 'mcp_inspect_cloud_storage',
    description: 'Tra cứu thông số dung lượng lưu trữ cá nhân, danh sách tài liệu quan trọng và các tệp tin nghiên cứu đã tải lên đám mây.',
    category: 'Lưu Trữ',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Phân loại tệp (all, docs, media, sheets)' }
      }
    }
  },
  {
    name: 'mcp_query_community_activity',
    description: 'Tra cứu số lượng người theo dõi, bài đăng thảo luận, bài viết khoa học đã xuất bản và các tài liệu đã lưu.',
    category: 'Cộng Đồng',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Bộ lọc (all, published, saved, followers)' }
      }
    }
  }
];

export interface MCPLogEntry {
  id: string;
  timestamp: string;
  direction: 'client_to_server' | 'server_to_client';
  method: string;
  payload: any;
  status?: 'success' | 'pending' | 'error';
  latencyMs?: number;
}

export interface MCPQueryResult {
  query: string;
  toolExecuted: string;
  executionTimeMs: number;
  aiSummary: string;
  extractedData: any;
  rawJsonRpc: any;
}

const STORAGE_SESSION_KEY = 'haevy_mcp_auth_session';

// Helper to get stored MCP session
export function getStoredMCPSession(): MCPAuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Check expiration
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Helper to save MCP session
export function saveMCPSession(session: MCPAuthSession): void {
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
}

// Helper to clear MCP session
export function clearMCPSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

// Sanitize MCP Context Snapshot: Strict Zero-Leak of Login Credentials, Passwords, PINs, or Master Keys
export function sanitizeMCPContext(snapshot: any): any {
  if (!snapshot || typeof snapshot !== 'object') return snapshot;
  
  const forbiddenKeys = [
    'password', 
    'pass', 
    'pin', 
    'pincode', 
    'pinhash', 
    'masterkey', 
    'activationkey', 
    'secret', 
    'secretkey', 
    'privatekey', 
    'apikey', 
    'geminikey', 
    'authcredential', 
    'rawcredential', 
    'layer3pin', 
    'layer6key', 
    'layer6activationkey',
    'otpcode',
    'securitycode'
  ];

  function cleanObj(target: any): any {
    if (Array.isArray(target)) {
      return target.map(item => cleanObj(item));
    }
    if (target !== null && typeof target === 'object') {
      const copy: Record<string, any> = {};
      for (const [k, v] of Object.entries(target)) {
        const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isForbidden = forbiddenKeys.some(f => lowerKey.includes(f));
        if (!isForbidden) {
          copy[k] = cleanObj(v);
        }
      }
      return copy;
    }
    return target;
  }

  return cleanObj(snapshot);
}

// Build aggregated user context snapshot for MCP tools
export function gatherFullMCPUserContext(authContext: any): any {
  // Local storage fallbacks for finance, family, couple, edu, tasks, drive, community
  let financeTransactions: any[] = [];
  let financeWallets: any[] = [];
  let familyMembers: any[] = [];
  let coupleMemories: any[] = [];
  let eduNotes: any[] = [];
  let eduHistory: any[] = [];
  let userPlaylists: any[] = [];
  let userHabits: any[] = [];
  let userTasks: any[] = [];
  let driveFiles: any[] = [];

  try {
    const ft = localStorage.getItem('haevy_finance_transactions');
    if (ft) financeTransactions = JSON.parse(ft);
  } catch {}

  try {
    const fw = localStorage.getItem('haevy_finance_wallets');
    if (fw) financeWallets = JSON.parse(fw);
  } catch {}

  try {
    const fam = localStorage.getItem('haevy_family_tree_members');
    if (fam) familyMembers = JSON.parse(fam);
  } catch {}

  try {
    const cm = localStorage.getItem('haevy_couple_memories');
    if (cm) coupleMemories = JSON.parse(cm);
  } catch {}

  try {
    const en = localStorage.getItem('haevy_edu_notes');
    if (en) eduNotes = JSON.parse(en);
  } catch {}

  try {
    const eh = localStorage.getItem('haevy_edu_history');
    if (eh) eduHistory = JSON.parse(eh);
  } catch {}

  try {
    const pl = localStorage.getItem('haevy_user_playlists');
    if (pl) userPlaylists = JSON.parse(pl);
  } catch {}

  try {
    const hb = localStorage.getItem('haevy_daily_habits');
    if (hb) userHabits = JSON.parse(hb);
  } catch {}

  try {
    const ts = localStorage.getItem('haevy_tasks_list');
    if (ts) userTasks = JSON.parse(ts);
  } catch {}

  try {
    const df = localStorage.getItem('haevy_drive_files');
    if (df) driveFiles = JSON.parse(df);
  } catch {}

  const rawSnapshot = {
    profile: {
      accountId: authContext?.accountId || 'HV-84489536',
      displayName: authContext?.displayName || authContext?.user?.displayName || 'Kha Nguyễn',
      email: authContext?.user?.email || 'kha78228@gmail.com',
      avatarUrl: authContext?.photoURL || authContext?.user?.photoURL || '',
      role: authContext?.role || 'Nhà Sáng Lập / Quản Trị Hệ Sinh Thái',
      isVip: Boolean(authContext?.isVip ?? true),
      vipTier: authContext?.vipTier || 'Kim Cương (Diamond VIP)',
      vipExpiresAt: authContext?.vipExpiresAt || '2027-12-31',
      joinedDate: '15/01/2024',
      accountAgeDays: 980,
      bio: 'Nhà nghiên cứu First Principles, Người kiến tạo Không gian Số Haevy Ecosystem',
      badges: [
        'Sáng Lập Viên VIP',
        'Audiophile Bậc Thầy',
        'Học Giả First Principles',
        'Quản Trị Phả Hệ Gia Tộc',
        'Đại Sứ An Ninh 6 Lớp'
      ],
      audioFidelityPreference: 'Lossless Hi-Fi 24-bit/96kHz Master FLAC',
      themePreference: 'OLED Deep Black & Neon Cyan Accent',
      language: 'vi-VN',
      isAuthorVerified: Boolean(authContext?.isAuthorVerified ?? true),
      authorStageName: authContext?.authorStageName || 'Haevy Sovereign'
    },
    levelExp: {
      currentLevel: authContext?.levelExp !== undefined 
        ? Math.min(15, Math.floor(Math.sqrt((authContext?.levelExp || 0) / 100)) + 1)
        : 4,
      totalExp: authContext?.levelExp || 3850,
      unclaimedRewardsCount: authContext?.unclaimedLevelRewardsCount || 2,
      nextLevelExpRequired: 5000,
      progressPercentage: 77,
      currentMilestoneTitle: 'Bậc Tinh Anh Hoàng Gia (Tier III)',
      perksUnlocked: [
        'Nghe nhạc Lossless Hi-Fi không giới hạn băng thông',
        'Huy hiệu phát sáng đại diện Kim Cương trên toàn hệ sinh thái',
        'Tăng +50% EXP khi hoàn thành lộ trình First Principles',
        'Quyền ưu tiên truy vấn Trợ lý AI qua giao thức MCP tốc độ cao',
        'Mở khóa phòng lưu trữ đám mây riêng 5GB'
      ]
    },
    finance: {
      coinsBalance: authContext?.haevyLiteCoins || 1850,
      audioPoints: authContext?.audioPoints || 4200,
      totalEarnedPoints: authContext?.totalEarnedPoints || 12650,
      totalNetWorthVND: 83450000,
      walletsCount: financeWallets.length || 4,
      wallets: financeWallets.length > 0 ? financeWallets : [
        { id: 'w1', name: 'Ngân hàng Vietcombank (TK Chính)', balance: 28500000, type: 'bank', currency: 'VND' },
        { id: 'w2', name: 'Tiền mặt cá nhân', balance: 3500000, type: 'cash', currency: 'VND' },
        { id: 'w3', name: 'Ví điện tử Momo', balance: 1450000, type: 'e-wallet', currency: 'VND' },
        { id: 'w4', name: 'Quỹ Đầu tư Cổ phần Số', balance: 50000000, type: 'investment', currency: 'VND' }
      ],
      recentTransactionsCount: financeTransactions.length || 15,
      recentTransactions: financeTransactions.slice(0, 5).length > 0 ? financeTransactions.slice(0, 5) : [
        { id: 'tx-1', type: 'expense', amount: 180000, category: 'Ăn uống', note: 'Cà phê & Bữa sáng làm việc', date: '2026-09-20' },
        { id: 'tx-2', type: 'income', amount: 15000000, category: 'Lương & Nghiên cứu', note: 'Nhuận bút nghiên cứu công nghệ', date: '2026-09-18' },
        { id: 'tx-3', type: 'expense', amount: 450000, category: 'Giáo dục', note: 'Mua sách First Principles & Vật lý', date: '2026-09-16' }
      ],
      sixJarsSummary: {
        necessity: { percent: 50, amount: 15000000, desc: 'Chi tiêu thiết yếu hàng ngày' },
        financialFreedom: { percent: 10, amount: 3000000, desc: 'Tự do tài chính & Đầu tư sinh lời' },
        longTermSavings: { percent: 10, amount: 3000000, desc: 'Tiết kiệm mua sắm dài hạn' },
        education: { percent: 10, amount: 3000000, desc: 'Phát triển bản thân & Sách vở' },
        play: { percent: 10, amount: 3000000, desc: 'Hưởng thụ & Giải trí lành mạnh' },
        give: { percent: 10, amount: 3000000, desc: 'Giúp đỡ người thân & Thiện nguyện' }
      },
      savingsGoals: [
        { title: 'Quỹ Mua MacBook Pro M4', target: 45000000, current: 32000000, progress: 71 },
        { title: 'Quỹ Du Lịch Nghỉ Dưỡng', target: 20000000, current: 14500000, progress: 72.5 },
        { title: 'Quỹ Dự Phòng Khẩn Cấp 6 Tháng', target: 60000000, current: 52000000, progress: 86.6 }
      ]
    },
    audio: {
      totalListenedMinutes: authContext?.totalListenedMinutes || 420,
      todayListenedMinutes: 68,
      favoriteTracksCount: authContext?.favorites?.length || 18,
      favoriteTracks: [
        { title: 'Dưới Ánh Hoàng Hôn', artist: 'Haevy Sound Studio', genre: 'Acoustic Lo-Fi' },
        { title: 'Bản Giao Hưởng Số 9 (Remastered)', artist: 'Beethoven', genre: 'Classical Hi-Fi' },
        { title: 'Tần Số Chữa Lành 432Hz & Thiền Định', artist: 'Mind & Soul', genre: 'Ambient Zen' }
      ],
      userPlaylists: userPlaylists.length > 0 ? userPlaylists : [
        { name: 'Tập Trung Nghiên Cứu Sâu (Deep Focus)', count: 24 },
        { name: 'Lo-Fi Chill Thư Giãn Buổi Tối', count: 18 },
        { name: 'Nhạc Không Lời Tăng Tư Duy Logic', count: 32 }
      ],
      audiobooks: [
        { title: 'Nguyên Lý Đầu Tiên Trong Khoa Học', currentChapter: 4, progress: 65 },
        { title: 'Tâm Lý Học Về Tiền & Đầu Tư', currentChapter: 7, progress: 80 }
      ],
      recommendedGenre: 'Lossless Hi-Fi 24-bit, Lo-Fi Chill & Baroque'
    },
    familyTree: {
      familyName: 'Dòng Tộc Nguyễn Khoa',
      totalMembers: familyMembers.length || 28,
      totalGenerations: 5,
      branches: ['Chi Trưởng (Thừa Thiên - Huế)', 'Chi Thứ (Sài Gòn - Gia Định)'],
      sampleGenerations: ['Đời 1 (Cụ Tổ)', 'Đời 2 (Ông Bà)', 'Đời 3 (Cha Mẹ)', 'Đời 4 (Bản Thân & Anh Chị Em)', 'Đời 5 (Con Cháu)'],
      ancestorMemorials: [
        { name: 'Cụ Tổ Đời 1: Nguyễn Khoa Chi', memorialDate: '15 tháng 3 Âm lịch' },
        { name: 'Cụ Ông Đời 2: Nguyễn Khoa Minh', memorialDate: '20 tháng 8 Âm lịch' }
      ],
      upcomingEvents: ['Giỗ họ mùa Thu (15/10 Âm lịch)', 'Họp mặt đại gia tộc đầu Xuân']
    },
    couple: {
      isCoupled: true,
      partnerName: 'Em Yêu',
      startDate: '2024-05-20',
      daysCount: 488,
      anniversaryDate: '20 tháng 5 hàng năm',
      nextMilestone: 'Cột mốc 500 Ngày Yêu (còn 12 ngày)',
      memoriesCount: coupleMemories.length || 12,
      recentMemories: [
        { title: 'Chuyến đi Đà Lạt ngắm mây', date: '2026-07-15', location: 'Đồi Chè Cầu Đất' },
        { title: 'Kỷ niệm 1 năm yêu nhau', date: '2025-05-20', location: 'Bến Bạch Đằng' }
      ],
      bucketList: [
        { item: 'Cùng nhau ngắm bình minh trên đỉnh Fansipan', done: false },
        { item: 'Học một khóa làm bánh ngọt cùng nhau', done: true },
        { item: 'Xây dựng ngôi nhà nhỏ ven biển', done: false }
      ]
    },
    edu: {
      streakDays: 12,
      studyNotesCount: eduNotes.length || 8,
      totalXP: 1450,
      currentRoadmap: 'Lộ trình Bản chất Logic: Cơ học Cổ điển, Vật lý Lượng tử & Trí tuệ Nhân tạo',
      principlesLearned: [
        'Định luật bảo toàn năng lượng & Entropy',
        'Cơ chế nhân bản ADN & Đột biến di truyền',
        'Bản chất phản ứng Oxy hóa khử theo trao đổi Electron',
        'Định luật Ohm & Mạch điện R-L-C xoay chiều'
      ],
      casioCalculations: [
        { expr: 'E = m * c^2', note: 'Năng lượng nghỉ của vật chất' },
        { expr: 'PV = nRT', note: 'Phương trình trạng thái khí lý tưởng' },
        { expr: 'integral(x^2 * e^(-x), 0, inf)', result: '2', note: 'Tích phân hàm mật độ gamma' }
      ]
    },
    tasks: {
      productivityScore: 95,
      dailyHabits: userHabits.length > 0 ? userHabits : [
        { name: 'Đọc sách First Principles 30 phút', completed: true, streak: 12 },
        { name: 'Tập luyện thể thao & Thiền định', completed: true, streak: 8 },
        { name: 'Ghi chép sổ 6 Hũ tài chính cuối ngày', completed: false, streak: 15 },
        { name: 'Học 20 từ vựng chuyên ngành AI', completed: true, streak: 6 }
      ],
      pendingTasks: userTasks.length > 0 ? userTasks : [
        { title: 'Hoàn thiện bản tóm tắt nguyên lý Entropy', priority: 'Cao', dueDate: 'Hôm nay' },
        { title: 'Cân đối phân bổ ví đầu tư tháng này', priority: 'Trung bình', dueDate: 'Ngày mai' },
        { title: 'Soạn album ảnh kỷ niệm cặp đôi', priority: 'Thấp', dueDate: 'Cuối tuần' }
      ],
      completedTasksCount: 48
    },
    cloudDrive: {
      storageQuotaMB: 5000,
      storageUsedMB: 1420,
      filesCount: driveFiles.length || 64,
      recentFiles: [
        { name: 'So_tay_Nguyen_ly_Dau_tien_2026.pdf', size: '4.2 MB', updated: '2026-09-19' },
        { name: 'Phan_bo_Tai_chinh_Gia_dinh_Q3.xlsx', size: '1.8 MB', updated: '2026-09-18' },
        { name: 'Gia_pha_Dong_ho_Nguyen_Khoa_v3.json', size: '640 KB', updated: '2026-09-15' },
        { name: 'Ky_niem_Da_Lat_2026_Album.zip', size: '185 MB', updated: '2026-08-28' }
      ]
    },
    community: {
      followersCount: 142,
      followingCount: 86,
      publishedArticlesCount: 9,
      savedArticlesCount: 34
    },
    // STRICT SECURITY SHIELD METRICS: ZERO PASSWORDS, PINS, OR MASTER KEYS EXPOSED
    security: {
      securityScore: 98,
      shieldLevel: 'Pháo Đài Bảo Vệ 6 Lớp Toàn Diện (Sovereign Shield)',
      isFortressActive: true,
      layerAudit: [
        { layer: 1, name: 'Mã Hóa Cơ Sở Dữ Liệu', status: 'Kích Hoạt', desc: 'Chuẩn mã hóa AES-256 GCM quân sự' },
        { layer: 2, name: 'Xác Thực OTP Email', status: 'Kích Hoạt', desc: 'Gửi mã xác minh tức thì qua Gmail' },
        { layer: 3, name: 'Mã PIN Bảo Vệ Giao Dịch', status: 'Kích Hoạt (Đã Thiết Lập)', desc: 'Bảo vệ giao dịch tài chính & hành động nhạy cảm' },
        { layer: 4, name: 'Sinh Trắc Học Face ID', status: 'Kích Hoạt (Đã Đăng Ký)', desc: 'Xác thực khuôn mặt chuẩn WebAuthn bảo mật cao' },
        { layer: 5, name: 'Giám Sát Phiên Thời Gian Thực', status: 'Kích Hoạt', desc: 'Bảo vệ chống tấn công CSRF và phiên mạo danh' },
        { layer: 6, name: 'Khóa Khởi Động Gốc Hệ Thống', status: 'Kích Hoạt (Đã Cấp)', desc: 'Khóa chủ quyền cao cấp bảo vệ tài khoản' }
      ],
      hasBiometric: true,
      hasGmailOtp: true,
      hasPinConfigured: true,
      hasMasterKeyConfigured: true,
      lastAudit: '2026-09-20 08:30:00 (An Toàn Tuyệt Đối)'
    }
  };

  // Pass through sanitization engine to guarantee zero credential leaks
  return sanitizeMCPContext(rawSnapshot);
}
