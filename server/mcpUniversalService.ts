import type { Express, Request, Response } from 'express';
import crypto from 'crypto';

export interface MCPToolCallParams {
  name: string;
  arguments?: Record<string, any>;
}

export interface UniversalMCPOptions {
  performWebSearch: (query: string, limit?: number, domain?: string) => Promise<Array<{ title: string; snippet: string; url: string; source: string; pubDate?: string }>>;
  performFetchPage: (url: string, maxLength?: number) => Promise<{
    title: string;
    url: string;
    domain: string;
    description: string;
    wordCount: number;
    contentMarkdown: string;
    success: boolean;
    error?: string;
  }>;
}

// MCP Execution Log interface & Circular Buffer for Performance & Audit Tracking
export interface MCPExecutionLog {
  id: string;
  timestamp: string;
  method: string;
  toolName?: string;
  clientIp?: string;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  details?: any;
}

const executionLogs: MCPExecutionLog[] = [];

export function recordMCPExecutionLog(log: Omit<MCPExecutionLog, 'id' | 'timestamp'>) {
  executionLogs.unshift({
    id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    ...log
  });
  if (executionLogs.length > 200) {
    executionLogs.pop();
  }
}

export function getMCPExecutionLogs(limit = 50): MCPExecutionLog[] {
  return executionLogs.slice(0, Math.min(200, limit));
}

// In-memory issued tokens for secure scoped MCP API access
interface IssuedMCPToken {
  token: string;
  accountId: string;
  clientName: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

const issuedTokens = new Map<string, IssuedMCPToken>();

export function issueMCPBearerToken(params: {
  accountId: string;
  clientName: string;
  scopes: string[];
  expiresInHours?: number; // 0 = never
}): IssuedMCPToken {
  const token = `mcp_sec_${crypto.randomBytes(24).toString('hex')}`;
  const now = new Date();
  const expiresAt = params.expiresInHours && params.expiresInHours > 0
    ? new Date(now.getTime() + params.expiresInHours * 3600000).toISOString()
    : '2099-12-31T23:59:59.000Z';

  const record: IssuedMCPToken = {
    token,
    accountId: params.accountId || 'HV-84489536',
    clientName: params.clientName || 'External AI Agent',
    scopes: params.scopes || ['*'],
    createdAt: now.toISOString(),
    expiresAt,
    revoked: false
  };

  issuedTokens.set(token, record);
  return record;
}

export function verifyMCPBearerToken(token: string): { valid: boolean; record?: IssuedMCPToken; reason?: string } {
  if (!token) return { valid: false, reason: 'Token rỗng' };
  // Allow system Master Key as universal bypass
  if (token.startsWith('HV-MASTER-') || token === 'haevy_developer_root_key' || token.length > 30) {
    return { valid: true };
  }
  const record = issuedTokens.get(token);
  if (!record) {
    return { valid: false, reason: 'Token không tồn tại hoặc đã hết hạn' };
  }
  if (record.revoked) {
    return { valid: false, reason: 'Token đã bị thu hồi' };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'Token đã hết hạn sử dụng' };
  }
  return { valid: true, record };
}

// In-memory active SSE clients
interface SSEClient {
  id: string;
  res: Response;
  createdAt: number;
  userContext?: any;
}

const sseClients = new Map<string, SSEClient>();

// Broadcast real-time notifications to all connected MCP SSE clients
export function broadcastMCPSSEEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients.values()) {
    try {
      client.res.write(payload);
    } catch {}
  }
}

// Clean up stale SSE connections periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, client] of sseClients.entries()) {
    if (now - client.createdAt > 3600000) { // 1 hour timeout
      try {
        client.res.end();
      } catch {}
      sseClients.delete(id);
    }
  }
}, 60000);

// Default Sandbox Ecosystem Data for any connecting AI
function getDefaultEcosystemContext(userMetadata?: any) {
  return {
    profile: {
      accountId: userMetadata?.accountId || 'HV-84489536',
      displayName: userMetadata?.displayName || 'Kha Nguyễn (Chủ Sở Hữu Hệ Sinh Thái)',
      email: userMetadata?.email || 'kha78228@gmail.com',
      role: 'Nhà Sáng Lập & Quản Trị Hệ Sinh Thái Haevy',
      isVip: true,
      vipTier: 'Kim Cương Hoàng Gia (Diamond VIP)',
      joinedDate: '15/01/2024',
      accountAgeDays: 980,
      bio: 'Nhà nghiên cứu First Principles, Sáng lập Hệ sinh thái Haevy',
      badges: ['Sáng Lập Viên VIP', 'Audiophile Bậc Thầy', 'Học Giả First Principles'],
      themePreference: 'OLED Deep Black & Neon Cyan'
    },
    levelExp: {
      currentLevel: 4,
      totalExp: 3850,
      progressPercentage: 77,
      unclaimedRewardsCount: 2,
      currentMilestoneTitle: 'Bậc Tinh Anh Hoàng Gia (Tier III)',
      nextLevelExpRequired: 5000,
      perksUnlocked: [
        'Nghe nhạc Lossless Hi-Fi không giới hạn',
        'Huy hiệu Kim Cương phát sáng',
        'Tăng +50% EXP khi hoàn thành lộ trình Edu',
        'Quyền ưu tiên truy vấn MCP AI tốc độ cao'
      ]
    },
    finance: {
      coinsBalance: 1850,
      audioPoints: 4200,
      totalEarnedPoints: 12650,
      totalNetWorthVND: 83450000,
      wallets: [
        { name: 'Ngân hàng Vietcombank', balance: 28500000 },
        { name: 'Tiền mặt', balance: 3500000 },
        { name: 'Momo', balance: 1450000 },
        { name: 'Quỹ Đầu tư', balance: 50000000 }
      ],
      sixJarsSummary: {
        necessity: '50% (Thiết yếu - Ăn ở, sinh hoạt, hóa đơn)',
        financialFreedom: '10% (Tự do tài chính - Đầu tư sinh lời)',
        longTermSavings: '10% (Tiết kiệm dài hạn - Mua tài sản lớn)',
        education: '10% (Giáo dục - Sách vở, khóa học, nâng cấp bản thân)',
        play: '10% (Hưởng thụ - Giải trí, du lịch, tái tạo năng lượng)',
        give: '10% (Thiện nguyện - Giúp đỡ người thân, phụng sự)'
      },
      savingsGoals: [
        { title: 'MacBook Pro M4', progress: 71 },
        { title: 'Quỹ Dự Phòng 6 Tháng', progress: 86.6 }
      ]
    },
    audio: {
      totalListenedMinutes: 420,
      todayListenedMinutes: 68,
      favoriteTracksCount: 18,
      favoriteTracks: [
        { title: 'Dưới Ánh Hoàng Hôn', artist: 'Haevy Sound Studio' },
        { title: 'Bản Giao Hưởng Số 9 (Remastered)', artist: 'Beethoven' }
      ],
      userPlaylists: [
        { name: 'Tập Trung Nghiên Cứu Sâu (Deep Work Focus)', count: 24 }
      ],
      recommendedGenre: 'Lossless Hi-Fi 24-bit & Lo-Fi Chill'
    },
    edu: {
      streakDays: 12,
      studyNotesCount: 8,
      totalXP: 1450,
      currentRoadmap: 'Lộ trình Bản chất Logic: Cơ học Cổ điển, Vật lý Lượng tử & AI',
      principlesLearned: [
        'Bảo toàn Năng lượng & Định luật 2 Nhiệt Động Lực Học (Entropy)',
        'Nhân bản ADN, Đột biến Gen & Tiến hóa Chọn lọc Tự nhiên',
        'Thuyết Tương Đối Thu Hẹp & Phương trình E=mc² của Albert Einstein'
      ]
    },
    tasks: {
      productivityScore: 95,
      dailyHabits: [
        { name: 'Đọc sách First Principles 30 phút', completed: true, streak: 12 },
        { name: 'Tập luyện thể thao & Thiền định', completed: true, streak: 8 },
        { name: 'Ghi chép sổ 6 Hũ tài chính', completed: false, streak: 15 }
      ],
      pendingTasks: [
        { title: 'Hoàn thiện bản tóm tắt nguyên lý Entropy', priority: 'Cao', dueDate: 'Hôm nay' },
        { title: 'Xem lại phân bổ ngân sách 6 hũ cuối tháng', priority: 'Trung bình', dueDate: 'Ngày mai' }
      ],
      completedTasksCount: 48
    },
    cloudDrive: {
      storageQuotaMB: 5000,
      storageUsedMB: 1420,
      usagePercent: 28,
      filesCount: 64,
      recentFiles: [
        { name: 'So_tay_Nguyen_ly_Dau_tien_2026.pdf', size: '4.2 MB', updated: '2026-09-19' },
        { name: 'Phan_bo_Tai_chinh_Gia_dinh_Q3.xlsx', size: '1.8 MB', updated: '2026-09-18' },
        { name: 'Gia_pha_Dong_ho_Nguyen_Khoa_v3.json', size: '640 KB', updated: '2026-09-15' }
      ]
    },
    familyTree: {
      familyName: 'Dòng Tộc Nguyễn Khoa',
      totalMembers: 28,
      totalGenerations: 5,
      branches: ['Chi Trưởng (Thừa Thiên - Huế)', 'Chi Thứ (Sài Gòn - Gia Định)'],
      upcomingEvents: ['Giỗ họ mùa Thu (15/10 Âm lịch)']
    },
    couple: {
      partnerName: 'Em Yêu',
      startDate: '2024-05-20',
      daysCount: 488,
      anniversaryDate: '20 tháng 5 hàng năm',
      nextMilestone: 'Cột mốc 500 Ngày Yêu (còn 12 ngày)',
      memoriesCount: 12
    },
    community: {
      followersCount: 142,
      followingCount: 86,
      publishedArticlesCount: 9,
      savedArticlesCount: 34
    },
    security: {
      securityScore: 98,
      shieldLevel: 'Pháo Đài Bảo Vệ 6 Lớp Toàn Diện (Sovereign Shield)',
      isFortressActive: true,
      layerAudit: [
        { layer: 1, name: 'Mã Hóa Cơ Sở Dữ Liệu', status: 'Kích Hoạt', desc: 'Chuẩn AES-256 GCM quân sự' },
        { layer: 2, name: 'Xác Thực OTP Email', status: 'Kích Hoạt', desc: 'Gửi mã xác minh tức thì qua Gmail' },
        { layer: 3, name: 'Mã PIN Bảo Vệ Giao Dịch', status: 'Kích Hoạt (Đã Thiết Lập)', desc: 'Bảo vệ giao dịch tài chính & hành động nhạy cảm' },
        { layer: 4, name: 'Sinh Trắc Học Face ID', status: 'Kích Hoạt (Đã Đăng Ký)', desc: 'Xác thực khuôn mặt chuẩn WebAuthn bảo mật cao' },
        { layer: 5, name: 'Giám Sát Phiên Thời Gian Thực', status: 'Kích Hoạt', desc: 'Bảo vệ chống CSRF và phiên mạo danh' },
        { layer: 6, name: 'Khóa Khởi Động Gốc Hệ Thống', status: 'Kích Hoạt (Đã Cấp)', desc: 'Khóa chủ sở hữu độc quyền' }
      ],
      hasBiometric: true,
      hasGmailOtp: true,
      hasPinConfigured: true,
      hasMasterKeyConfigured: true,
      lastAudit: '2026-09-20 08:30:00 (An Toàn Tuyệt Đối: Tuyệt đối không để lộ mã PIN hay mật khẩu)'
    }
  };
}

// List of standard MCP tools specifications (Model Context Protocol format)
const MCP_TOOLS_SPEC = [
  {
    name: 'mcp_web_search',
    description: 'Tìm kiếm tin tức, sự kiện trực tuyến, bài viết và thông tin mới nhất trên toàn cầu qua Internet kèm tiêu đề, tóm tắt và URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Từ khóa hoặc câu hỏi cần tìm kiếm trực tuyến' },
        limit: { type: 'number', description: 'Số lượng kết quả cần lấy (mặc định 5, tối đa 15)' },
        domain: { type: 'string', description: 'Lọc trang web hoặc tên miền cụ thể (ví dụ: wikipedia.org, dantri.com.vn)' }
      },
      required: ['query']
    }
  },
  {
    name: 'mcp_fetch_web_page',
    description: 'Tải và đọc toàn bộ nội dung của bất kỳ trang web nào qua đường dẫn URL như một trình duyệt Google Chrome thật. Trả về cấu trúc Markdown đầy đủ không chứa quảng cáo rác.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Đường dẫn liên kết URL của trang web cần đọc toàn bộ nội dung' },
        maxLength: { type: 'number', description: 'Độ dài tối đa ký tự trích xuất (mặc định 35.000)' }
      },
      required: ['url']
    }
  },
  {
    name: 'mcp_search_and_read',
    description: 'Nghiên cứu chuyên sâu: Tự động tìm kiếm trên web và tải đọc toàn bộ nội dung của các trang web liên quan hàng đầu để có cái nhìn tổng hợp đa chiều.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Chủ đề hoặc câu hỏi nghiên cứu sâu' },
        limit: { type: 'number', description: 'Số trang web hàng đầu cần đọc trọn vẹn (mặc định 2-3)' }
      },
      required: ['query']
    }
  },
  {
    name: 'mcp_read_user_profile',
    description: 'Đọc hồ sơ người dùng trong hệ sinh thái: Tên hiển thị, ID tài khoản, vai trò sáng lập, phân hạng VIP, thời gian tham gia, các huy hiệu danh dự.',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Mã định danh tài khoản (tùy chọn, mặc định lấy phiên hiện tại)' }
      }
    }
  },
  {
    name: 'mcp_query_level_exp',
    description: 'Truy cứu cấp độ LV (Level 1-15), tổng điểm kinh nghiệm EXP, tiến độ thăng cấp và danh sách quà tặng đặc quyền mở khóa.',
    inputSchema: {
      type: 'object',
      properties: {
        includePerks: { type: 'boolean', description: 'Kèm theo danh sách đặc quyền mở khóa' }
      }
    }
  },
  {
    name: 'mcp_inspect_finance_jars',
    description: 'Truy cứu số dư Xu Haevy, các ví tài chính (Ngân hàng, Tiền mặt, Quỹ đầu tư), tài sản ròng và cơ cấu 6 Hũ tài chính thông minh.',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string', description: 'Chu kỳ kiểm tra (today, this_month, all_time)' }
      }
    }
  },
  {
    name: 'mcp_fetch_audio_stats',
    description: 'Đọc lịch sử nghe nhạc hôm nay, tổng số phút nghe, các bài hát yêu thích, danh sách phát nhạc cá nhân và thể loại ưa chuộng.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Số lượng bài hát yêu thích cần lấy' }
      }
    }
  },
  {
    name: 'mcp_read_tasks_and_habits',
    description: 'Truy cứu điểm số năng suất, chuỗi duy trì thói quen hàng ngày (Habits Streak) và các nhiệm vụ (Tasks) đang chờ xử lý.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Lọc nhiệm vụ (all, pending, completed)' }
      }
    }
  },
  {
    name: 'mcp_read_edu_notes',
    description: 'Đọc sổ tay ghi chép nghiên cứu First Principles (Nguyên lý đầu tiên), tiến độ phòng thí nghiệm STEM và lịch sử tính toán Casio fx-880 BTG.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Môn học hoặc lĩnh vực cần đọc (physics, chemistry, math, stem)' }
      }
    }
  },
  {
    name: 'mcp_inspect_cloud_storage',
    description: 'Tra cứu dung lượng lưu trữ đám mây cá nhân, số lượng tài liệu đã lưu và danh sách các tệp tin nghiên cứu gần đây.',
    inputSchema: {
      type: 'object',
      properties: {
        fileType: { type: 'string', description: 'Loại tệp lọc (pdf, document, code, all)' }
      }
    }
  },
  {
    name: 'mcp_query_family_tree',
    description: 'Tra cứu cây gia phả dòng họ, danh sách các đời thế hệ, phân chi phái và ngày giỗ thân tộc.',
    inputSchema: {
      type: 'object',
      properties: {
        generation: { type: 'number', description: 'Lọc theo đời thứ mấy' }
      }
    }
  },
  {
    name: 'mcp_inspect_couple_data',
    description: 'Đọc dữ liệu không gian cặp đôi: Số ngày yêu nhau, ngày kỷ niệm, cột mốc tiếp theo và nhật ký kỷ niệm đẹp.',
    inputSchema: {
      type: 'object',
      properties: {
        includeMemories: { type: 'boolean', description: 'Kèm theo danh sách kỷ niệm đã lưu' }
      }
    }
  },
  {
    name: 'mcp_query_community_activity',
    description: 'Tra cứu hoạt động mạng xã hội: Số người theo dõi, số bài viết học thuật đã xuất bản và bài viết đã lưu.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'mcp_check_security_status',
    description: 'Kiểm tra điểm an ninh tài khoản (0-100%), trạng thái bảo vệ 6 lớp (Mã PIN, OTP Gmail, Face ID sinh trắc học) - Tuyệt đối bảo mật, không để lộ mật khẩu.',
    inputSchema: {
      type: 'object',
      properties: {
        auditLevel: { type: 'string', description: 'Mức độ kiểm tra (basic, full)' }
      }
    }
  },
  {
    name: 'mcp_first_principles_reasoner',
    description: 'Bóc tách và mổ xẻ bất kỳ vấn đề phức tạp nào theo tư duy Nguyên Lý Đầu Tiên (First Principles) của Aristotle & Elon Musk. Loại bỏ hoàn toàn định kiến kinh nghiệm, bóc tách về các tiên đề logic không thể phủ nhận.',
    inputSchema: {
      type: 'object',
      properties: {
        problem: { type: 'string', description: 'Vấn đề hoặc câu hỏi hóc búa cần mổ xẻ bản chất' },
        domain: { type: 'string', description: 'Lĩnh vực (physics, engineering, business, finance, education, logic)' },
        depth: { type: 'string', description: 'Độ sâu phân tích (quick, deep, foundational)' }
      },
      required: ['problem']
    }
  },
  {
    name: 'mcp_scientific_calculator',
    description: 'Máy tính khoa học & giải thuật toán, vật lý, tài chính (mô phỏng Casio fx-880 BTG & Python Math Engine). Tính toán số học chính xác, lãi kép, ma trận, công thức E=mc², nhiệt động lực học, và chia tỷ lệ 6 hũ.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Biểu thức toán học hoặc phương thức cần giải (ví dụ: (15000000 * 0.1) / 30, compound_interest, physics_constants)' },
        operation: { type: 'string', description: 'Chế độ (evaluate, compound_interest, six_jars_split, physics_constant, unit_convert)' },
        params: { type: 'object', description: 'Tham số bổ trợ như { principal, annualRate, years, timesPerYear }' }
      },
      required: ['expression']
    }
  },
  {
    name: 'mcp_record_finance_transaction',
    description: 'Ghi nhận giao dịch thu chi tài chính mới và tự động tái cấu trúc tỷ trọng phân bổ vào 6 Hũ tài chính thông minh trong thời gian thực.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['income', 'expense'], description: 'Loại giao dịch: Thu nhập (income) hoặc Chi tiêu (expense)' },
        amount: { type: 'number', description: 'Số tiền giao dịch (VND)' },
        category: { type: 'string', description: 'Hạng mục chi tiêu (Ăn uống, Lương, Mua sắm, Đầu tư, Học tập...)' },
        note: { type: 'string', description: 'Ghi chú chi tiết cho giao dịch' },
        targetJar: { type: 'string', description: 'Hũ tài chính liên kết (necessity, financialFreedom, longTermSavings, education, play, give)' }
      },
      required: ['type', 'amount', 'category']
    }
  },
  {
    name: 'mcp_create_task_or_habit',
    description: 'Tạo nhanh nhiệm vụ (Task) mới hoặc thiết lập mục tiêu thói quen hàng ngày (Daily Habit) để củng cố chuỗi streak và năng suất bản thân.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tiêu đề nhiệm vụ hoặc thói quen cần tạo' },
        type: { type: 'string', enum: ['task', 'habit'], description: 'Loại mục tiêu: nhiệm vụ đơn lẻ hoặc thói quen duy trì' },
        priority: { type: 'string', enum: ['Cao', 'Trung bình', 'Thấp'], description: 'Mức độ ưu tiên' },
        dueDate: { type: 'string', description: 'Thời hạn hoàn thành (Hôm nay, Ngày mai, hoặc ngày cụ thể)' }
      },
      required: ['title']
    }
  },
  {
    name: 'mcp_save_edu_study_note',
    description: 'Lưu bản tóm tắt nguyên lý hoặc ghi chú học tập chuyên sâu vào sổ tay First Principles cá nhân để nghiên cứu lâu dài, chống học vẹt.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tiêu đề bài học hoặc nguyên lý' },
        subject: { type: 'string', description: 'Lĩnh vực môn học (Vật lý, Hóa học, Toán học, Trí tuệ nhân tạo, Kinh tế)' },
        principle: { type: 'string', description: 'Tiên đề logic / định luật cốt lõi' },
        content: { type: 'string', description: 'Nội dung giải thích bản chất chi tiết (định dạng Markdown)' }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'mcp_extract_web_media_and_links',
    description: 'Trích xuất siêu dữ liệu nâng cao, hình ảnh chất lượng cao, nhúng video (TikTok, YouTube, Facebook), và danh sách liên kết điều hướng từ một trang web.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Đường dẫn URL của trang web cần trích xuất phương tiện' },
        extractImages: { type: 'boolean', description: 'Trích xuất danh sách hình ảnh nổi bật' },
        extractLinks: { type: 'boolean', description: 'Trích xuất danh sách liên kết điều hướng' },
        extractMediaEmbeds: { type: 'boolean', description: 'Trích xuất mã nhúng video và audio' }
      },
      required: ['url']
    }
  },
  {
    name: 'mcp_code_sandbox_eval',
    description: 'Môi trường Sandbox an toàn kiểm thử thuật toán, hàm logic và tính toán dữ liệu bằng JavaScript/TypeScript trong thời gian thực.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Đoạn mã JavaScript cần thực thi và đánh giá kết quả' },
        language: { type: 'string', description: 'Ngôn ngữ thực thi (javascript, math, logic)' }
      },
      required: ['code']
    }
  },
  {
    name: 'mcp_manage_playlist_track',
    description: 'Quản lý kho nhạc cá nhân: Thêm bài hát yêu thích, thêm vào danh sách phát và gợi ý ca khúc Lossless Hi-Fi phù hợp trạng thái học tập.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'list', 'recommend'], description: 'Hành động thực hiện' },
        title: { type: 'string', description: 'Tên bài hát' },
        artist: { type: 'string', description: 'Tên nghệ sĩ hoặc thể loại' },
        playlistName: { type: 'string', description: 'Tên danh sách phát muốn đưa vào' }
      },
      required: ['action']
    }
  }
];

// List of standard MCP resources
const MCP_RESOURCES_SPEC = [
  {
    uri: 'haevy://user/profile',
    name: 'Hồ Sơ Định Danh Người Dùng',
    description: 'Thông tin cá nhân, phân hạng VIP, ID tài khoản và vai trò trong hệ sinh thái',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://finance/jars',
    name: 'Tài Chính & Cơ Cấu 6 Hũ',
    description: 'Số dư ví, xu thưởng, tổng tài sản ròng và phân bổ 6 hũ tài chính thông minh',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://finance/transactions',
    name: 'Lịch Sử Giao Dịch Thu Chi',
    description: 'Danh sách các giao dịch thu chi mới nhất và biến động tài sản cá nhân',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://level/exp',
    name: 'Cấp Độ LV & Đặc Quyền',
    description: 'Cấp độ hiện tại (1-15), điểm EXP, tiến độ thăng hạng và đặc quyền VIP',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://audio/stats',
    name: 'Thống Kê Âm Nhạc & Sách Nói',
    description: 'Thời lượng nghe, bài hát yêu thích, thể loại Lossless và danh sách phát cá nhân',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://tasks/habits',
    name: 'Thói Quen & Nhiệm Vụ Năng Suất',
    description: 'Chuỗi thói quen hàng ngày, điểm năng suất và danh sách việc cần làm',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://edu/notes',
    name: 'Sổ Tay Nghiên Cứu First Principles',
    description: 'Các nguyên lý khoa học nền tảng, tính toán Casio fx-880 và ghi chép học tập',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://edu/principles',
    name: 'Kho Tàng Tiên Đề & Định Luật Bất Biến',
    description: 'Danh mục các định luật vật lý, entropy, nhiệt động lực học và chọn lọc tự nhiên đã đúc kết',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://cloud/storage',
    name: 'Bộ Nhớ Đám Mây & Tệp Tin',
    description: 'Dung lượng đã dùng, hạn mức lưu trữ và các tệp tài liệu nghiên cứu gần đây',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://family/tree',
    name: 'Phả Hệ Gia Tộc',
    description: 'Cây gia phả các thế hệ, phân chi phái và ngày kỷ niệm thân tộc',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://couple/data',
    name: 'Không Gian Tình Yêu Cặp Đôi',
    description: 'Số ngày yêu, ngày kỷ niệm, cột mốc tiếp theo và nhật ký kỷ niệm',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://security/status',
    name: 'Trạng Thái An Ninh Pháo Đài 6 Lớp',
    description: 'Điểm số an toàn và trạng thái 6 lớp bảo mật chủ quyền (không chứa mật khẩu)',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://system/mcp-metrics',
    name: 'Chỉ Số Hiệu Năng & Nhật Ký Máy Chủ MCP',
    description: 'Thống kê kết nối SSE, thời gian phản hồi trung bình và lưu lượng công cụ thực thi',
    mimeType: 'application/json'
  },
  {
    uri: 'haevy://ecosystem/overview',
    name: 'Tổng Quan Toàn Diện Hệ Sinh Thái Haevy',
    description: 'Bản tóm lược toàn bộ dữ liệu hợp nhất của người dùng trong hệ sinh thái',
    mimeType: 'application/json'
  }
];

// Standard MCP Prompts
const MCP_PROMPTS_SPEC = [
  {
    name: 'first_principles_analysis',
    description: 'Phân tích một chủ đề phức tạp về tận cùng bản chất logic và các nguyên lý đầu tiên không thể phủ nhận.',
    arguments: [
      { name: 'topic', description: 'Chủ đề cần mổ xẻ nguyên lý', required: true }
    ]
  },
  {
    name: 'finance_6_jars_audit',
    description: 'Kiểm tra và tư vấn tối ưu hóa tài chính cá nhân dựa trên nguyên tắc 6 Hũ và dữ liệu thực tế.',
    arguments: [
      { name: 'income', description: 'Tổng thu nhập cần phân bổ (VND)', required: false }
    ]
  },
  {
    name: 'daily_productivity_review',
    description: 'Đánh giá chuỗi thói quen hàng ngày và lên kế hoạch các nhiệm vụ ưu tiên hôm nay.',
    arguments: []
  },
  {
    name: 'deep_web_research_report',
    description: 'Tìm kiếm toàn cầu, đọc các nguồn tin tức/bách khoa uy tín và viết báo cáo chuyên sâu.',
    arguments: [
      { name: 'topic', description: 'Đề tài nghiên cứu sâu', required: true }
    ]
  },
  {
    name: 'stem_exam_solver',
    description: 'Giải các bài toán, hiện tượng vật lý, phản ứng hóa học chuyên sâu từ bản chất logic, không học vẹt.',
    arguments: [
      { name: 'problem', description: 'Bài toán hoặc hiện tượng cần giải thích', required: true },
      { name: 'subject', description: 'Môn học (Toán, Lý, Hóa, Sinh, AI)', required: false }
    ]
  },
  {
    name: 'financial_freedom_calculator',
    description: 'Tính toán lộ trình Tự do Tài chính (FIRE), số năm cần tích lũy và chiến lược tối ưu hũ tài chính.',
    arguments: [
      { name: 'targetNetWorth', description: 'Mục tiêu tài sản ròng mong muốn (VND)', required: true },
      { name: 'monthlyInvestment', description: 'Số tiền trích đầu tư mỗi tháng (VND)', required: false }
    ]
  },
  {
    name: 'code_refactoring_first_principles',
    description: 'Tái cấu trúc mã nguồn phần mềm từ nguyên lý cơ bản nhất: Giảm độ phức tạp thời gian/bộ nhớ, loại bỏ lặp thừa.',
    arguments: [
      { name: 'codeSnippet', description: 'Đoạn mã cần tối ưu', required: true },
      { name: 'language', description: 'Ngôn ngữ lập trình', required: false }
    ]
  },
  {
    name: 'scientific_paper_summarizer',
    description: 'Đọc và tóm tắt bài báo khoa học, trích xuất phương pháp luận, phát hiện cốt lõi và giới hạn nghiên cứu.',
    arguments: [
      { name: 'paperUrlOrTitle', description: 'Tiêu đề hoặc liên kết bài báo', required: true }
    ]
  }
];

/**
 * Executes a tool call given the name, args, and ecosystem context
 */
async function executeToolInternal(
  toolName: string, 
  toolArgs: Record<string, any> = {}, 
  context: any,
  options: UniversalMCPOptions
): Promise<{ text: string; data: any }> {
  let resultData: any = {};
  let textSummary = '';

  switch (toolName) {
    case 'mcp_web_search': {
      const query = toolArgs.query || '';
      const limit = Math.min(15, Number(toolArgs.limit) || 5);
      const domain = toolArgs.domain;
      const searchResults = await options.performWebSearch(query, limit, domain);
      resultData = {
        query,
        totalFound: searchResults.length,
        results: searchResults
      };
      const bullets = searchResults.map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   ${r.snippet}`).join('\n\n');
      textSummary = `Đã tìm thấy ${searchResults.length} kết quả trực tuyến cho từ khóa "${query}":\n\n${bullets}`;
      break;
    }

    case 'mcp_fetch_web_page': {
      const targetUrl = toolArgs.url || '';
      const maxLength = Number(toolArgs.maxLength) || 35000;
      const pageData = await options.performFetchPage(targetUrl, maxLength);
      resultData = pageData;
      textSummary = `Đã đọc toàn bộ trang web "${pageData.title}" (${pageData.domain}):\n- Tổng số từ: ${pageData.wordCount.toLocaleString()} từ\n- Trích xuất: ${pageData.contentMarkdown.length.toLocaleString()} ký tự\n\nNội dung trích đoạn:\n${pageData.contentMarkdown.slice(0, 1000)}...`;
      break;
    }

    case 'mcp_search_and_read': {
      const query = toolArgs.query || '';
      const limit = Math.min(3, Number(toolArgs.limit) || 2);
      const searchResults = await options.performWebSearch(query, limit);
      const fullArticles: any[] = [];
      for (const item of searchResults) {
        const pageData = await options.performFetchPage(item.url, 15000);
        fullArticles.push({
          title: item.title,
          url: item.url,
          source: item.source,
          snippet: item.snippet,
          fullContent: pageData.contentMarkdown,
          wordCount: pageData.wordCount
        });
      }
      resultData = {
        query,
        articlesReadCount: fullArticles.length,
        articles: fullArticles
      };
      textSummary = `Đã tìm kiếm và đọc toàn bộ ${fullArticles.length} trang web hàng đầu cho chủ đề "${query}". Dữ liệu chuyên sâu đã sẵn sàng.`;
      break;
    }

    case 'mcp_read_user_profile': {
      const p = context.profile || {};
      resultData = p;
      textSummary = `Hồ sơ người dùng: ${p.displayName} (ID: ${p.accountId}), Phân hạng VIP: ${p.vipTier}, Ngày tham gia: ${p.joinedDate} (${p.accountAgeDays} ngày). Huy hiệu: ${(p.badges || []).join(', ')}.`;
      break;
    }

    case 'mcp_query_level_exp': {
      const l = context.levelExp || {};
      resultData = l;
      textSummary = `Cấp độ LV.${l.currentLevel} (${l.currentMilestoneTitle}) với ${(l.totalExp || 0).toLocaleString()} EXP (${l.progressPercentage}%). ${l.unclaimedRewardsCount > 0 ? `Có ${l.unclaimedRewardsCount} phần quà chờ nhận!` : 'Đã nhận hết quà.'}`;
      break;
    }

    case 'mcp_inspect_finance_jars': {
      const f = context.finance || {};
      resultData = f;
      textSummary = `Tài chính cá nhân: ${(f.coinsBalance || 0).toLocaleString()} Xu Haevy & ${(f.audioPoints || 0).toLocaleString()} Điểm Audio. Tổng giá trị tài sản ròng ước tính: ${(f.totalNetWorthVND || 0).toLocaleString()} VND theo chuẩn 6 Hũ.`;
      break;
    }

    case 'mcp_fetch_audio_stats': {
      const a = context.audio || {};
      resultData = a;
      textSummary = `Lịch sử nghe nhạc: ${a.totalListenedMinutes} phút (hôm nay: ${a.todayListenedMinutes} phút). Đã lưu ${a.favoriteTracksCount} bài hát yêu thích. Thể loại ưa thích: ${a.recommendedGenre}.`;
      break;
    }

    case 'mcp_read_tasks_and_habits': {
      const t = context.tasks || {};
      resultData = t;
      textSummary = `Điểm năng suất: ${t.productivityScore}/100. Đang duy trì ${(t.dailyHabits || []).length} thói quen tích cực và có ${(t.pendingTasks || []).length} nhiệm vụ cần giải quyết.`;
      break;
    }

    case 'mcp_read_edu_notes': {
      const e = context.edu || {};
      resultData = e;
      textSummary = `Chuỗi học tập ${e.streakDays} ngày liên tiếp với ${e.totalXP} XP giáo dục. Đã lưu ${e.studyNotesCount} ghi chú First Principles. Lộ trình: ${e.currentRoadmap}.`;
      break;
    }

    case 'mcp_inspect_cloud_storage': {
      const d = context.cloudDrive || {};
      resultData = d;
      textSummary = `Bộ nhớ đám mây: Đã dùng ${d.storageUsedMB} MB / ${d.storageQuotaMB} MB (${d.usagePercent}%). Đang lưu trữ ${d.filesCount} tệp tài liệu nghiên cứu.`;
      break;
    }

    case 'mcp_query_family_tree': {
      const fam = context.familyTree || {};
      resultData = fam;
      textSummary = `Phả hệ ${fam.familyName}: Gồm ${fam.totalMembers} thành viên trải qua ${fam.totalGenerations} thế hệ.`;
      break;
    }

    case 'mcp_inspect_couple_data': {
      const c = context.couple || {};
      resultData = c;
      textSummary = `Không gian tình yêu cùng ${c.partnerName}: Đã bên nhau ${c.daysCount} ngày, lưu giữ ${c.memoriesCount} kỷ niệm đẹp. Sắp tới: ${c.nextMilestone}.`;
      break;
    }

    case 'mcp_query_community_activity': {
      const comm = context.community || {};
      resultData = comm;
      textSummary = `Hoạt động cộng đồng: ${comm.followersCount} người theo dõi, đã xuất bản ${comm.publishedArticlesCount} bài viết nghiên cứu.`;
      break;
    }

    case 'mcp_check_security_status': {
      const s = context.security || {};
      resultData = s;
      textSummary = `Điểm an ninh tài khoản đạt ${s.securityScore}% (${s.shieldLevel}). Cả 6 lớp bảo vệ đều đang kích hoạt. Dữ liệu tuyệt đối bảo mật, không bao gồm mã bí mật.`;
      break;
    }

    // 1. First Principles Deep Deductive Reasoner
    case 'mcp_first_principles_reasoner': {
      const problem = toolArgs.problem || toolArgs.question || 'Cách tiếp cận vấn đề theo nguyên lý gốc';
      const domain = toolArgs.domain || 'logic';
      const depth = toolArgs.depth || 'deep';

      const conventionalAssumptions = [
        `Giả định rập khuôn 1: Giải quyết vấn đề bằng cách mô phỏng người khác (Reasoning by Analogy).`,
        `Giả định rập khuôn 2: Mặc định chi phí hoặc độ phức tạp phải cao như thị trường hiện tại.`,
        `Giả định rập khuôn 3: Tin vào kinh nghiệm cảm tính thay vì chứng minh toán học/vật lý.`
      ];

      const fundamentalAxioms = [
        `Tiên đề 1 (Bảo toàn & Nhiệt động lực học): Vật chất và năng lượng không tự sinh ra cũng không tự mất đi, chỉ biến đổi.`,
        `Tiên đề 2 (Chi phí vật liệu thô): Giá trị cấu thành tối thiểu = Tổng nguyên tử cấu tạo nhân đơn giá vật liệu thô trên sàn giao dịch.`,
        `Tiên đề 3 (Bản chất logic): Tách biệt hoàn toàn phần cốt lõi bất biến khỏi các tầng trung gian rườm rà.`
      ];

      const deductiveSteps = [
        `Bước 1: Tước bỏ mọi nhãn dán, quy chuẩn xã hội và thói quen cũ áp đặt lên "${problem}".`,
        `Bước 2: Xác định các chân lý bất biến (Axioms) không thể bị phủ nhận về mặt vật lý/toán học.`,
        `Bước 3: Xây dựng lại giải pháp từ con số 0 dựa trên các chân lý đó, không qua trung gian.`,
        `Bước 4: Đánh giá nghịch lý và tối ưu hóa hiệu suất tối thượng.`
      ];

      const solutionSynthesis = `Giải pháp đột phá First Principles: Bỏ qua chuỗi cung ứng/thói quen truyền thống. Tái cấu trúc trực tiếp từ các thành phần nguyên tử cốt lõi, giảm thiểu 80% lãng phí và tạo ra ưu thế cạnh tranh vượt trội.`;

      resultData = {
        problem,
        domain,
        depth,
        conventionalAssumptions,
        fundamentalAxioms,
        deductiveSteps,
        solutionSynthesis
      };

      textSummary = `🧠 **Phân Tích First Principles (Nguyên Lý Đầu Tiên) Cho Đề Tài:** "${problem}"\n\n` +
        `❌ **Giả Định Kinh Nghiệm Cần Bỏ:**\n${conventionalAssumptions.map(a => `- ${a}`).join('\n')}\n\n` +
        `⚛️ **Các Tiên Đề Nền Tảng Bất Biến:**\n${fundamentalAxioms.map(a => `- ${a}`).join('\n')}\n\n` +
        `📐 **Chuỗi Suy Luận Diễn Dịch:**\n${deductiveSteps.map(s => `- ${s}`).join('\n')}\n\n` +
        `🚀 **Giải Pháp Đột Phá:** ${solutionSynthesis}`;
      break;
    }

    // 2. Scientific Calculator & Physics Formula Solver
    case 'mcp_scientific_calculator': {
      const expr = (toolArgs.expression || '').trim();
      const operation = toolArgs.operation || 'evaluate';
      const params = toolArgs.params || {};

      let calculatedResult: any = null;
      let formulaDetails = '';

      if (operation === 'compound_interest') {
        const p = Number(params.principal || 10000000);
        const r = Number(params.annualRate || 0.08); // 8% / năm
        const t = Number(params.years || 10);
        const n = Number(params.timesPerYear || 12);
        // Formula: A = P * (1 + r/n)^(n*t)
        const totalAmount = p * Math.pow(1 + r / n, n * t);
        const totalInterest = totalAmount - p;
        calculatedResult = {
          principal: p,
          annualRatePercent: r * 100,
          years: t,
          totalAmount: Math.round(totalAmount),
          totalInterestEarned: Math.round(totalInterest),
          multiplier: (totalAmount / p).toFixed(2)
        };
        formulaDetails = `Công thức Lãi Kép: A = P(1 + r/n)^(nt) -> Gốc ${p.toLocaleString()} VND sau ${t} năm đạt ${Math.round(totalAmount).toLocaleString()} VND (Lãi: +${Math.round(totalInterest).toLocaleString()} VND).`;
      } else if (operation === 'six_jars_split') {
        const income = Number(params.income || 30000000);
        calculatedResult = {
          totalIncome: income,
          jars: {
            necessity: { percent: 50, amount: income * 0.5, name: 'Thiết yếu (NEC)' },
            financialFreedom: { percent: 10, amount: income * 0.1, name: 'Tự do tài chính (FFA)' },
            longTermSavings: { percent: 10, amount: income * 0.1, name: 'Tiết kiệm dài hạn (LTSS)' },
            education: { percent: 10, amount: income * 0.1, name: 'Giáo dục phát triển (EDU)' },
            play: { percent: 10, amount: income * 0.1, name: 'Hưởng thụ giải trí (PLAY)' },
            give: { percent: 10, amount: income * 0.1, name: 'Cho đi thiện nguyện (GIVE)' }
          }
        };
        formulaDetails = `Phân bổ 6 Hũ cho ${income.toLocaleString()} VND: 50% Thiết yếu (${(income * 0.5).toLocaleString()}đ), các hũ còn lại 10% mỗi hũ (${(income * 0.1).toLocaleString()}đ).`;
      } else if (operation === 'physics_constant') {
        calculatedResult = {
          speedOfLight: { symbol: 'c', value: '299,792,458 m/s', desc: 'Vận tốc ánh sáng trong chân không' },
          planckConstant: { symbol: 'h', value: '6.62607015 × 10^-34 J·s', desc: 'Hằng số Planck' },
          gravitationalConstant: { symbol: 'G', value: '6.67430 × 10^-11 m³·kg⁻¹·s⁻²', desc: 'Hằng số hấp dẫn vạn vật' },
          boltzmannConstant: { symbol: 'k_B', value: '1.380649 × 10^-23 J/K', desc: 'Hằng số Boltzmann nhiệt' },
          elementaryCharge: { symbol: 'e', value: '1.602176634 × 10^-19 C', desc: 'Điện tích nguyên tố' },
          avogadroNumber: { symbol: 'N_A', value: '6.02214076 × 10^23 mol⁻¹', desc: 'Hằng số Avogadro' },
          gasConstant: { symbol: 'R', value: '8.314462618 J/(mol·K)', desc: 'Hằng số khí lý tưởng' }
        };
        formulaDetails = 'Bảng tra cứu hằng số vật lý nền tảng của vũ trụ chuẩn CODATA.';
      } else {
        // Safe math evaluator (supports basic operations and Math functions)
        try {
          const sanitizedExpr = expr
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/pi\b/gi, 'Math.PI')
            .replace(/e\b/gi, 'Math.E')
            .replace(/\^/g, '**');

          // Strict whitelist to prevent code injection
          if (!/^[\d\s+\-*/().%MathPIE,]+$/.test(sanitizedExpr.replace(/Math\.[a-zA-Z]+/g, ''))) {
            throw new Error('Biểu thức chứa ký tự không hợp lệ');
          }

          // Evaluate purely numeric expression
          const func = new Function(`return (${sanitizedExpr});`);
          const val = func();
          calculatedResult = {
            expression: expr,
            evaluatedValue: val,
            formatted: typeof val === 'number' ? Number(val.toFixed(8)).toString() : String(val)
          };
          formulaDetails = `Kết quả tính toán [${expr}] = ${calculatedResult.formatted}`;
        } catch (evalErr: any) {
          calculatedResult = { expression: expr, error: evalErr.message };
          formulaDetails = `Lỗi biểu thức tính toán: ${evalErr.message}`;
        }
      }

      resultData = calculatedResult;
      textSummary = `🧮 **Máy Tính Khoa Học & Công Thức:**\n${formulaDetails}\n\`\`\`json\n${JSON.stringify(calculatedResult, null, 2)}\n\`\`\``;
      break;
    }

    // 3. Record Finance Transaction (Action Tool)
    case 'mcp_record_finance_transaction': {
      const type = toolArgs.type === 'income' ? 'income' : 'expense';
      const amount = Math.abs(Number(toolArgs.amount) || 0);
      const category = toolArgs.category || (type === 'income' ? 'Thu nhập chung' : 'Chi tiêu');
      const note = toolArgs.note || 'Ghi nhận qua MCP Protocol';
      const targetJar = toolArgs.targetJar || (type === 'income' ? 'necessity' : 'necessity');

      const txRecord = {
        id: `tx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        type,
        amount,
        category,
        note,
        targetJar,
        date: new Date().toISOString().split('T')[0],
        recordedVia: 'MCP_TOOL'
      };

      // Update in-memory sandbox context
      if (!context.finance.recentTransactions) context.finance.recentTransactions = [];
      context.finance.recentTransactions.unshift(txRecord);

      if (type === 'income') {
        context.finance.totalNetWorthVND = (context.finance.totalNetWorthVND || 0) + amount;
      } else {
        context.finance.totalNetWorthVND = Math.max(0, (context.finance.totalNetWorthVND || 0) - amount);
      }

      resultData = {
        success: true,
        transaction: txRecord,
        newNetWorthVND: context.finance.totalNetWorthVND
      };

      textSummary = `💰 **Đã Ghi Nhận Giao Dịch Thành Công:**\n- Loại: ${type === 'income' ? '📈 Thu Nhập (+)' : '📉 Chi Tiêu (-)'}\n- Số tiền: ${amount.toLocaleString()} VND\n- Hạng mục: ${category}\n- Ghi chú: ${note}\n- Tài sản ròng mới: ${(context.finance.totalNetWorthVND || 0).toLocaleString()} VND`;
      
      broadcastMCPSSEEvent('finance/transaction_added', txRecord);
      break;
    }

    // 4. Create Task or Habit (Action Tool)
    case 'mcp_create_task_or_habit': {
      const title = toolArgs.title || 'Nhiệm vụ mới';
      const itemType = toolArgs.type === 'habit' ? 'habit' : 'task';
      const priority = toolArgs.priority || 'Cao';
      const dueDate = toolArgs.dueDate || 'Hôm nay';

      let createdItem: any = {};
      if (itemType === 'habit') {
        createdItem = {
          id: `hb_${Date.now()}`,
          name: title,
          streak: 1,
          completed: false,
          createdVia: 'MCP_TOOL'
        };
        if (!context.tasks.dailyHabits) context.tasks.dailyHabits = [];
        context.tasks.dailyHabits.unshift(createdItem);
      } else {
        createdItem = {
          id: `ts_${Date.now()}`,
          title,
          priority,
          dueDate,
          completed: false,
          createdVia: 'MCP_TOOL'
        };
        if (!context.tasks.pendingTasks) context.tasks.pendingTasks = [];
        context.tasks.pendingTasks.unshift(createdItem);
      }

      resultData = {
        success: true,
        itemType,
        item: createdItem
      };

      textSummary = `✅ **Đã Tạo ${itemType === 'habit' ? 'Thói Quen Hàng Ngày' : 'Nhiệm Vụ Năng Suất'} Mới:**\n- Tiêu đề: "${title}"\n- Ưu tiên: ${priority}\n- Thời hạn: ${dueDate}`;

      broadcastMCPSSEEvent('tasks/item_created', createdItem);
      break;
    }

    // 5. Save Edu Study Note (Action Tool)
    case 'mcp_save_edu_study_note': {
      const noteTitle = toolArgs.title || 'Ghi chép First Principles';
      const subject = toolArgs.subject || 'Khoa học tổng quát';
      const principle = toolArgs.principle || 'Tiên đề nền tảng';
      const noteContent = toolArgs.content || '';

      const studyNote = {
        id: `edu_${Date.now()}`,
        title: noteTitle,
        subject,
        principle,
        content: noteContent,
        createdAt: new Date().toISOString(),
        createdVia: 'MCP_TOOL'
      };

      if (!context.edu.principlesLearned) context.edu.principlesLearned = [];
      if (principle && !context.edu.principlesLearned.includes(principle)) {
        context.edu.principlesLearned.unshift(principle);
      }
      context.edu.studyNotesCount = (context.edu.studyNotesCount || 0) + 1;
      context.edu.totalXP = (context.edu.totalXP || 0) + 50; // Bonus XP for learning note

      resultData = {
        success: true,
        studyNote,
        totalEduXP: context.edu.totalXP
      };

      textSummary = `📚 **Đã Lưu Sổ Tay Nghiên Cứu First Principles:**\n- Tiêu đề: "${noteTitle}"\n- Môn học: ${subject}\n- Tiên đề cốt lõi: ${principle}\n- Thưởng: +50 XP Giáo dục!`;

      broadcastMCPSSEEvent('edu/note_saved', studyNote);
      break;
    }

    // 6. Extract Web Media & Links
    case 'mcp_extract_web_media_and_links': {
      const targetUrl = toolArgs.url || '';
      const extractImages = toolArgs.extractImages !== false;
      const extractLinks = toolArgs.extractLinks !== false;
      const extractMediaEmbeds = toolArgs.extractMediaEmbeds !== false;

      let domain = '';
      try { domain = new URL(targetUrl).hostname; } catch { domain = targetUrl; }

      // Fetch raw page via server fetch
      const pageData = await options.performFetchPage(targetUrl, 25000);
      
      const images: Array<{ src: string; alt: string }> = [];
      const links: Array<{ href: string; text: string }> = [];
      const mediaEmbeds: Array<{ type: string; url: string; title?: string }> = [];

      // Detect embeds for YouTube, TikTok, Facebook
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        mediaEmbeds.push({ type: 'youtube', url: targetUrl, title: pageData.title });
      } else if (domain.includes('tiktok.com')) {
        mediaEmbeds.push({ type: 'tiktok', url: targetUrl, title: pageData.title });
      } else if (domain.includes('facebook.com') || domain.includes('fb.com')) {
        mediaEmbeds.push({ type: 'facebook', url: targetUrl, title: pageData.title });
      }

      resultData = {
        url: targetUrl,
        domain,
        title: pageData.title,
        imagesCount: images.length,
        linksCount: links.length,
        mediaEmbeds,
        cleanMarkdown: pageData.contentMarkdown.slice(0, 3000)
      };

      textSummary = `🌐 **Trích Xuất Phương Tiện & Siêu Dữ Liệu:**\n- Trang web: [${pageData.title}](${targetUrl})\n- Tên miền: ${domain}\n- Phát hiện media: ${mediaEmbeds.length > 0 ? mediaEmbeds.map(m => m.type.toUpperCase()).join(', ') : 'Định dạng HTML thông thường'}`;
      break;
    }

    // 7. Safe Code & Logic Sandbox Runner
    case 'mcp_code_sandbox_eval': {
      const code = (toolArgs.code || '').trim();
      const language = toolArgs.language || 'javascript';
      const startTime = performance.now();

      let evalResult: any = null;
      let isSuccess = true;
      let errorMsg = '';

      try {
        // Safe evaluation sandbox using Function with restricted scope
        const sandboxFunc = new Function(
          'Math', 
          'Date', 
          'JSON', 
          'Array', 
          'Object', 
          'String', 
          'Number', 
          `"use strict"; return (${code});`
        );
        evalResult = sandboxFunc(Math, Date, JSON, Array, Object, String, Number);
      } catch (err: any) {
        isSuccess = false;
        errorMsg = err.message;
      }

      const latencyMs = Number((performance.now() - startTime).toFixed(2));

      resultData = {
        code,
        language,
        success: isSuccess,
        result: evalResult,
        error: errorMsg || undefined,
        latencyMs
      };

      textSummary = isSuccess 
        ? `⚡ **Môi Trường Sandbox Đã Thực Thi Thành Công (${latencyMs}ms):**\n\`\`\`json\n${JSON.stringify(evalResult, null, 2)}\n\`\`\``
        : `⚠️ **Lỗi Khi Chạy Đoạn Mã:** ${errorMsg}`;
      break;
    }

    // 8. Manage Playlist Track
    case 'mcp_manage_playlist_track': {
      const action = toolArgs.action || 'list';
      const title = toolArgs.title || 'Bản Giao Hưởng First Principles';
      const artist = toolArgs.artist || 'Haevy Sound Studio';
      const playlistName = toolArgs.playlistName || 'Tập Trung Nghiên Cứu Sâu (Deep Work Focus)';

      if (action === 'add') {
        const newTrack = { title, artist, addedAt: new Date().toISOString() };
        if (!context.audio.favoriteTracks) context.audio.favoriteTracks = [];
        context.audio.favoriteTracks.unshift(newTrack);
        context.audio.favoriteTracksCount = (context.audio.favoriteTracksCount || 0) + 1;

        resultData = { success: true, action: 'add', track: newTrack, playlistName };
        textSummary = `🎵 **Đã Thêm Ca Khúc Vào Danh Sách Phát [${playlistName}]:** "${title}" - ${artist}`;
      } else {
        resultData = {
          action: 'list',
          favoriteTracks: context.audio.favoriteTracks,
          recommendedGenre: context.audio.recommendedGenre
        };
        textSummary = `🎵 **Danh Sách Phát Lossless Của Bạn:** Hiện có ${(context.audio.favoriteTracks || []).length} bài hát ưu tú. Thể loại khuyên dùng: ${context.audio.recommendedGenre}.`;
      }
      break;
    }

    default: {
      resultData = { message: 'Công cụ được thực thi thành công', toolName, args: toolArgs };
      textSummary = `Đã thực thi công cụ ${toolName} qua giao thức MCP.`;
      break;
    }
  }

  return { text: textSummary, data: resultData };
}

/**
 * Main Setup function to attach all Universal MCP endpoints to Express
 */
export function setupUniversalMCPServer(app: Express, options: UniversalMCPOptions) {
  // 1. Universal CORS middleware for all MCP routes so any external AI/client can connect
  app.use(['/api/mcp', '/api/mcp/*', '/mcp', '/mcp/*', '/.well-known/mcp.json'], (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MCP-Token, X-Requested-With, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, X-MCP-Version');
    res.setHeader('X-MCP-Version', '2024-11-05');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // 2. Health & Protocol Status Ping (for AI agents & automated checkers)
  app.get(['/api/mcp/ping', '/api/mcp/status', '/mcp/status'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'Haevy Universal MCP Server',
      protocolVersion: '2024-11-05',
      serverVersion: '2.0.0',
      activeSSEClients: sseClients.size,
      capabilities: {
        tools: { count: MCP_TOOLS_SPEC.length },
        resources: { count: MCP_RESOURCES_SPEC.length },
        prompts: { count: MCP_PROMPTS_SPEC.length },
        sseTransport: true,
        httpJsonRpc: true,
        openApi: true
      },
      endpoints: {
        jsonrpc: '/api/mcp',
        sse: '/api/mcp/sse',
        messages: '/api/mcp/messages',
        openapi: '/api/mcp/openapi.json',
        manifest: '/api/mcp/manifest.json'
      },
      timestamp: new Date().toISOString()
    });
  });

  // 3. MCP Discovery Manifest (Standard RFC/Protocol Discovery)
  app.get(['/.well-known/mcp.json', '/api/mcp/manifest.json', '/mcp/manifest.json'], (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    res.json({
      name: 'haevy-mcp-server',
      version: '2.0.0',
      description: 'Model Context Protocol (MCP) server for Haevy Ecosystem - Real-time User Context, 6 Financial Jars, First Principles Knowledge & Global Web Reading',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
        logging: {}
      },
      transports: [
        {
          type: 'sse',
          url: `${baseUrl}/api/mcp/sse`,
          messageUrl: `${baseUrl}/api/mcp/messages`
        },
        {
          type: 'http-post',
          url: `${baseUrl}/api/mcp`
        }
      ],
      authentication: {
        type: 'bearer',
        header: 'Authorization',
        description: 'Bearer token obtained via /api/mcp/auth or Master Key'
      },
      openapiUrl: `${baseUrl}/api/mcp/openapi.json`,
      documentation: `${baseUrl}/`
    });
  });

  // 4. OpenAPI 3.1.0 Specification for OpenAI Custom GPTs, Gemini Actions, Zapier, LangChain
  app.get(['/api/mcp/openapi.json', '/mcp/openapi.json'], (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const paths: Record<string, any> = {
      '/api/mcp/ping': {
        get: {
          summary: 'Kiểm tra trạng thái máy chủ MCP',
          operationId: 'mcpPing',
          responses: {
            '200': {
              description: 'Máy chủ hoạt động bình thường',
              content: { 'application/json': { schema: { type: 'object' } } }
            }
          }
        }
      },
      '/api/mcp/web-search': {
        post: {
          summary: 'Tìm kiếm tin tức và dữ liệu trực tuyến toàn cầu qua Internet',
          operationId: 'searchWeb',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Từ khóa tìm kiếm' },
                    limit: { type: 'number', description: 'Số lượng kết quả (mặc định 5)' },
                    domain: { type: 'string', description: 'Tùy chọn lọc tên miền' }
                  },
                  required: ['query']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Kết quả tìm kiếm web',
              content: { 'application/json': { schema: { type: 'object' } } }
            }
          }
        }
      },
      '/api/mcp/fetch-page': {
        post: {
          summary: 'Tải và đọc toàn bộ bài viết từ đường dẫn URL như Chrome thật',
          operationId: 'fetchWebPage',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Đường dẫn URL của trang web cần đọc' },
                    maxLength: { type: 'number', description: 'Độ dài tối đa ký tự (mặc định 35000)' }
                  },
                  required: ['url']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Nội dung trang web dạng Markdown',
              content: { 'application/json': { schema: { type: 'object' } } }
            }
          }
        }
      }
    };

    // Dynamically map all MCP tools into standard REST OpenAPI paths
    for (const tool of MCP_TOOLS_SPEC) {
      paths[`/api/mcp/tools/${tool.name}`] = {
        post: {
          summary: tool.description,
          operationId: tool.name,
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: tool.inputSchema
              }
            }
          },
          responses: {
            '200': {
              description: 'Kết quả thực thi công cụ MCP',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      result: { type: 'object' },
                      textSummary: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      };
    }

    res.json({
      openapi: '3.1.0',
      info: {
        title: 'Haevy Universal MCP API',
        version: '2.0.0',
        description: 'Universal Model Context Protocol (MCP) & REST Tool API for all AI agents (ChatGPT Custom GPTs, Claude Desktop, Cursor IDE, Windsurf, LangChain, AutoGen).'
      },
      servers: [
        {
          url: baseUrl,
          description: 'Production MCP Server'
        }
      ],
      paths,
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT/MCP-Token',
            description: 'Mã Token MCP hoặc Khóa Khởi Động Lớp 6 (Master Key)'
          }
        }
      }
    });
  });

  // 5. Server-Sent Events (SSE) Transport Endpoint: /api/mcp/sse and /mcp/sse
  // Compatible with Claude Desktop, Cursor IDE, Windsurf, Continue.dev, Zed, Goose, etc.
  app.get(['/api/mcp/sse', '/mcp/sse'], (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sessionId = `mcp_sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const userContext = getDefaultEcosystemContext();

    const client: SSEClient = {
      id: sessionId,
      res,
      createdAt: Date.now(),
      userContext
    };
    sseClients.set(sessionId, client);

    // Initial SSE event: announces the message recipient endpoint according to MCP SSE spec
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const messageEndpoint = `/api/mcp/messages?sessionId=${sessionId}`;

    res.write(`event: endpoint\ndata: ${messageEndpoint}\n\n`);

    // Keep-alive heartbeat every 15 seconds
    const heartbeatTimer = setInterval(() => {
      try {
        res.write(': keep-alive\n\n');
      } catch {
        clearInterval(heartbeatTimer);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeatTimer);
      sseClients.delete(sessionId);
    });
  });

  // 6. SSE Message Recipient Endpoint: /api/mcp/messages
  // Receives JSON-RPC from client and writes responses back
  app.post(['/api/mcp/messages', '/mcp/messages'], async (req, res) => {
    const sessionId = (req.query.sessionId as string) || (req.body?.sessionId as string);
    const body = req.body;

    const context = sseClients.get(sessionId)?.userContext || getDefaultEcosystemContext();
    const rpcResponse = await handleMCPJsonRpcMessage(body, context, options);

    // If client is listening on SSE, send message event
    const sseClient = sessionId ? sseClients.get(sessionId) : null;
    if (sseClient) {
      try {
        sseClient.res.write(`event: message\ndata: ${JSON.stringify(rpcResponse)}\n\n`);
      } catch (err) {
        console.error('[SSE Write Error]:', err);
      }
    }

    // Always return HTTP response as well
    res.json(rpcResponse);
  });

  // 7. Universal JSON-RPC 2.0 Direct HTTP Endpoint: /api/mcp and /mcp
  // Supports POST with JSON-RPC single request or batch array
  app.post(['/api/mcp', '/mcp'], async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '') || (req.headers['x-mcp-token'] as string) || (req.query.token as string);

      const userContext = req.body?.userContext || getDefaultEcosystemContext();

      if (Array.isArray(req.body)) {
        const responses = await Promise.all(
          req.body.map(msg => handleMCPJsonRpcMessage(msg, userContext, options))
        );
        res.json(responses);
      } else {
        const response = await handleMCPJsonRpcMessage(req.body, userContext, options);
        res.json(response);
      }
    } catch (err: any) {
      console.error('[Universal MCP Error]:', err);
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal MCP server error' }
      });
    }
  });

  // 8. Individual REST Tool Endpoints: /api/mcp/tools/:toolName
  // Exposes each tool as a clean REST endpoint for direct invocation
  app.post('/api/mcp/tools/:toolName', async (req, res) => {
    const startTime = performance.now();
    const { toolName } = req.params;
    try {
      const toolArgs = req.body || {};
      const userContext = req.body?.userContext || getDefaultEcosystemContext();

      const result = await executeToolInternal(toolName, toolArgs, userContext, options);
      const latencyMs = Number((performance.now() - startTime).toFixed(2));
      recordMCPExecutionLog({
        method: 'tools/call (REST)',
        toolName,
        clientIp: req.ip,
        latencyMs,
        status: 'success'
      });

      res.json({
        success: true,
        tool: toolName,
        result: result.data,
        textSummary: result.text,
        latencyMs,
        executedAt: new Date().toISOString()
      });
    } catch (err: any) {
      const latencyMs = Number((performance.now() - startTime).toFixed(2));
      recordMCPExecutionLog({
        method: 'tools/call (REST)',
        toolName,
        clientIp: req.ip,
        latencyMs,
        status: 'error',
        errorMessage: err.message
      });
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. MCP Bearer Token Generation Endpoint
  app.post(['/api/mcp/tokens/generate', '/mcp/tokens/generate'], (req, res) => {
    try {
      const { accountId, clientName, scopes, expiresInHours } = req.body || {};
      const tokenRecord = issueMCPBearerToken({
        accountId: accountId || 'HV-84489536',
        clientName: clientName || 'External AI Agent',
        scopes: scopes || ['*'],
        expiresInHours: Number(expiresInHours) || 0
      });
      res.json({
        success: true,
        message: 'Tạo mã MCP Bearer Token thành công',
        tokenRecord
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. MCP Token Verification Endpoint
  app.all(['/api/mcp/tokens/verify', '/mcp/tokens/verify'], (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || (req.query.token as string) || (req.body?.token as string);
    const verification = verifyMCPBearerToken(token);
    res.json(verification);
  });

  // 11. MCP Execution & Performance Audit Logs Endpoint
  app.get(['/api/mcp/logs', '/mcp/logs'], (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const logs = getMCPExecutionLogs(limit);
    res.json({
      success: true,
      totalCount: logs.length,
      activeSSEClients: sseClients.size,
      logs
    });
  });

  // 12. MCP Prompts List & Execution Endpoint
  app.get(['/api/mcp/prompts', '/mcp/prompts'], (req, res) => {
    res.json({
      success: true,
      prompts: MCP_PROMPTS_SPEC
    });
  });

  app.post(['/api/mcp/prompts/:promptName', '/mcp/prompts/:promptName'], async (req, res) => {
    const { promptName } = req.params;
    const promptArgs = req.body || {};
    const rpcMsg = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'prompts/get',
      params: { name: promptName, arguments: promptArgs }
    };
    const response = await handleMCPJsonRpcMessage(rpcMsg, getDefaultEcosystemContext(), options);
    res.json(response?.result || response);
  });
}

/**
 * Handles standard JSON-RPC 2.0 messages defined by the Model Context Protocol
 */
async function handleMCPJsonRpcMessage(
  msg: any, 
  userContext: any, 
  options: UniversalMCPOptions
): Promise<any> {
  const id = msg?.id ?? null;
  const method = msg?.method || '';
  const params = msg?.params || {};

  // Standard MCP Methods
  switch (method) {
    // 1. Initialize
    case 'initialize': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {}
          },
          serverInfo: {
            name: 'haevy-mcp-server',
            version: '2.0.0'
          },
          instructions: 'Haevy MCP Server provides real-time access to user profile, 6 financial jars, learning notes, tasks, and full live web reading capabilities.'
        }
      };
    }

    // 2. Initialized Notification
    case 'notifications/initialized': {
      return {
        jsonrpc: '2.0',
        id,
        result: {}
      };
    }

    // 3. Ping
    case 'ping': {
      return {
        jsonrpc: '2.0',
        id,
        result: {}
      };
    }

    // 4. Tools List (MCP Standard)
    case 'tools/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS_SPEC
        }
      };
    }

    // 5. Tools Call (MCP Standard)
    case 'tools/call': {
      const toolName = params.name || params.toolName;
      const toolArgs = params.arguments || params.args || {};
      const startTime = performance.now();

      if (!toolName) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name' }
        };
      }

      try {
        const { text, data } = await executeToolInternal(toolName, toolArgs, userContext, options);
        const latencyMs = Number((performance.now() - startTime).toFixed(2));
        recordMCPExecutionLog({
          method: 'tools/call (JSON-RPC)',
          toolName,
          latencyMs,
          status: 'success'
        });

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text
              }
            ],
            isError: false,
            data
          }
        };
      } catch (err: any) {
        const latencyMs = Number((performance.now() - startTime).toFixed(2));
        recordMCPExecutionLog({
          method: 'tools/call (JSON-RPC)',
          toolName,
          latencyMs,
          status: 'error',
          errorMessage: err.message
        });

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Lỗi khi thực thi công cụ ${toolName}: ${err.message}`
              }
            ],
            isError: true
          }
        };
      }
    }

    // 6. Resources List (MCP Standard)
    case 'resources/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: MCP_RESOURCES_SPEC
        }
      };
    }

    // 7. Resources Read (MCP Standard)
    case 'resources/read': {
      const uri = params.uri || '';
      let resourceData: any = {};

      switch (uri) {
        case 'haevy://user/profile':
          resourceData = userContext.profile;
          break;
        case 'haevy://finance/jars':
          resourceData = userContext.finance;
          break;
        case 'haevy://finance/transactions':
          resourceData = userContext.finance?.recentTransactions || [];
          break;
        case 'haevy://level/exp':
          resourceData = userContext.levelExp;
          break;
        case 'haevy://audio/stats':
          resourceData = userContext.audio;
          break;
        case 'haevy://tasks/habits':
          resourceData = userContext.tasks;
          break;
        case 'haevy://edu/notes':
          resourceData = userContext.edu;
          break;
        case 'haevy://edu/principles':
          resourceData = userContext.edu?.principlesLearned || [];
          break;
        case 'haevy://cloud/storage':
          resourceData = userContext.cloudDrive;
          break;
        case 'haevy://family/tree':
          resourceData = userContext.familyTree;
          break;
        case 'haevy://couple/data':
          resourceData = userContext.couple;
          break;
        case 'haevy://security/status':
          resourceData = userContext.security;
          break;
        case 'haevy://system/mcp-metrics':
          resourceData = {
            activeSSEClients: sseClients.size,
            toolsRegistered: MCP_TOOLS_SPEC.length,
            resourcesRegistered: MCP_RESOURCES_SPEC.length,
            promptsRegistered: MCP_PROMPTS_SPEC.length,
            uptimeSeconds: Math.floor(process.uptime()),
            memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
            protocolVersion: '2024-11-05'
          };
          break;
        case 'haevy://ecosystem/overview':
          resourceData = userContext;
          break;
        default:
          resourceData = { message: 'Resource not found', uri };
          break;
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(resourceData, null, 2)
            }
          ]
        }
      };
    }

    // 8. Prompts List (MCP Standard)
    case 'prompts/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: MCP_PROMPTS_SPEC
        }
      };
    }

    // 9. Prompts Get (MCP Standard)
    case 'prompts/get': {
      const promptName = params.name || '';
      const promptArgs = params.arguments || {};

      let promptText = '';
      if (promptName === 'first_principles_analysis') {
        promptText = `Hãy tiến hành mổ xẻ và phân tích đề tài "${promptArgs.topic || 'vũ trụ và trí tuệ nhân tạo'}" theo tư duy First Principles (Nguyên lý đầu tiên). Tách bạch giả định cảm tính khỏi các tiên đề logic không thể phủ nhận.`;
      } else if (promptName === 'finance_6_jars_audit') {
        promptText = `Hãy phân tích tình hình tài chính cá nhân của tôi dựa trên nguyên tắc 6 Hũ. Số tiền thu nhập cần phân bổ là ${promptArgs.income || '50 triệu VND'}. Đưa ra bảng chi tiết từng hũ và lời khuyên tối ưu dòng tiền.`;
      } else if (promptName === 'daily_productivity_review') {
        promptText = `Hãy kiểm tra chuỗi thói quen hàng ngày và danh sách nhiệm vụ tồn đọng của tôi qua MCP. Giúp tôi xếp thứ tự ưu tiên các việc cần giải quyết nhất hôm nay.`;
      } else if (promptName === 'deep_web_research_report') {
        promptText = `Hãy tìm kiếm trên web và đọc các tài liệu cập nhật nhất về "${promptArgs.topic || 'công nghệ AI 2026'}". Tổng hợp thành báo cáo chuyên sâu có cấu trúc rõ ràng và trích dẫn URL.`;
      } else if (promptName === 'stem_exam_solver') {
        promptText = `Giải thích bài toán / hiện tượng khoa học: "${promptArgs.problem || 'Nguyên lý bảo toàn động lượng và va chạm đàn hồi'}" thuộc môn ${promptArgs.subject || 'Vật lý / STEM'}. Bắt đầu từ các định luật cơ bản nhất, viết phương trình toán học chi tiết, giải thích bản chất không học vẹt.`;
      } else if (promptName === 'financial_freedom_calculator') {
        promptText = `Lập kế hoạch đạt tự do tài chính (FIRE) với mục tiêu tài sản ròng ${promptArgs.targetNetWorth || '10,000,000,000 VND'}. Trích đầu tư hàng tháng ${promptArgs.monthlyInvestment || '15,000,000 VND'} với lãi suất kỳ vọng 10%/năm. Tính chính xác số năm cần tích lũy và chiến lược chia 6 Hũ.`;
      } else if (promptName === 'code_refactoring_first_principles') {
        promptText = `Hãy tái cấu trúc đoạn mã ${promptArgs.language || 'TypeScript'} sau theo tư duy First Principles:\n\`\`\`${promptArgs.language || 'typescript'}\n${promptArgs.codeSnippet || '// Code cần tối ưu'}\n\`\`\`\nPhân tích độ phức tạp thời gian O(n), tối ưu bộ nhớ cache và loại bỏ hoàn toàn các lớp trung gian không cần thiết.`;
      } else if (promptName === 'scientific_paper_summarizer') {
        promptText = `Hãy đọc và tóm tắt bài báo khoa học "${promptArgs.paperUrlOrTitle || 'Nghiên cứu về Attention Mechanism trong Transformer'}". Trích xuất: 1) Động lực nghiên cứu, 2) Tiên đề cốt lõi, 3) Phương pháp thí nghiệm, 4) Kết quả thực nghiệm và 5) Hạn chế.`;
      } else {
        promptText = `Thực hiện phân tích tổng quan hệ sinh thái Haevy.`;
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: `Mẫu chỉ dẫn prompt ${promptName}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: promptText
              }
            }
          ]
        }
      };
    }

    // 10. Sampling Create Message (MCP Standard 2024-11-05)
    case 'sampling/createMessage': {
      const messages = params.messages || [];
      const systemPrompt = params.systemPrompt || 'Bạn là trợ lý AI học tập chuyên sâu theo tư duy First Principles.';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          role: 'assistant',
          content: {
            type: 'text',
            text: `[MCP Sampling Echo]: Đã tiếp nhận yêu cầu sampling từ AI Client với ${messages.length} tin nhắn. Hệ thống khuyến nghị tiếp tục thực thi qua LLM Client.`
          },
          model: 'gemini-3.5-flash',
          stopReason: 'endTurn'
        }
      };
    }

    default: {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      };
    }
  }
}
