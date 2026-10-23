/**
 * Haevy Finance Intelligent Vietnamese Voice & Natural Language Parser
 * Converts spoken Vietnamese phrases into structured FinanceTransaction objects.
 */

import { FinanceCategory, FinanceWallet, FinanceTransactionType } from '../types';

export interface ParsedVoiceExpense {
  rawTranscript: string;
  type: FinanceTransactionType;
  amount: number;
  formattedAmount: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  walletId: string;
  walletName: string;
  note: string;
  tags: string[];
  isCoupleShared: boolean;
  isFamilyFund: boolean;
  date: string;
  confidence: number;
  matchedJar: string; // 6-Jars label (NEC, LTSS, EDU, PLAY, FFA, GIVE)
}

// Vietnamese number words to value mapping
const VIETNAMESE_WORDS_MAP: Record<string, number> = {
  'không': 0, 'một': 1, 'mốt': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'tư': 4,
  'năm': 5, 'lăm': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10
};

/**
 * Parse Vietnamese spoken numbers from text:
 * Supports:
 * - "45k", "45.000", "50k", "150.000đ", "200000"
 * - "45 nghìn", "45 ngàn", "50 chục nghìn"
 * - "1 triệu", "1 tr", "1 củ", "1 triệu rưỡi", "1.5 triệu", "nửa triệu"
 * - "2 lít" (200k), "5 lít" (500k)
 * - "hai mươi nghìn", "năm mươi ngàn", "một trăm nghìn"
 */
export function extractVietnameseAmount(text: string): { amount: number; matchedText: string } | null {
  const normalized = text.toLowerCase().trim();

  // 1. Slang: "nửa triệu", "nửa củ"
  if (/nửa (triệu|củ)/.test(normalized)) {
    return { amount: 500000, matchedText: 'nửa triệu' };
  }

  // 2. Slang: "X lít" -> X * 100,000 (e.g. "2 lít" = 200,000; "lít rưỡi" = 150,000)
  const litMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*lít/);
  if (litMatch) {
    const val = parseFloat(litMatch[1].replace(',', '.'));
    return { amount: Math.round(val * 100000), matchedText: litMatch[0] };
  }
  if (/lít rưỡi/.test(normalized)) {
    return { amount: 150000, matchedText: 'lít rưỡi' };
  }
  if (/\b1\s*lít\b|\bmột\s*lít\b/.test(normalized)) {
    return { amount: 100000, matchedText: '1 lít' };
  }

  // 3. Million combinations: "X triệu rưỡi", "X củ rưỡi", "X tr 5", "X triệu", "X củ", "X tr"
  const trRuoiMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(triệu|củ)\s*rưỡi/);
  if (trRuoiMatch) {
    const base = parseFloat(trRuoiMatch[1].replace(',', '.'));
    return { amount: Math.round((base + 0.5) * 1000000), matchedText: trRuoiMatch[0] };
  }

  const tr5Match = normalized.match(/(\d+)\s*(?:tr|triệu|củ)\s*(\d+)/);
  if (tr5Match) {
    const base = parseInt(tr5Match[1], 10);
    const sub = parseInt(tr5Match[2], 10);
    const subVal = sub < 10 ? sub * 100000 : (sub < 100 ? sub * 10000 : sub * 1000);
    return { amount: base * 1000000 + subVal, matchedText: tr5Match[0] };
  }

  const trMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(triệu|củ|tr|m)\b/);
  if (trMatch) {
    const val = parseFloat(trMatch[1].replace(',', '.'));
    return { amount: Math.round(val * 1000000), matchedText: trMatch[0] };
  }

  // 4. Thousand combinations: "X k", "X nghìn", "X ngàn", "X ngàn rưỡi", "X nghìn rưỡi"
  const kRuoiMatch = normalized.match(/(\d+)\s*(?:nghìn|ngàn|k)\s*rưỡi/);
  if (kRuoiMatch) {
    const base = parseInt(kRuoiMatch[1], 10);
    return { amount: base * 1000 + 500, matchedText: kRuoiMatch[0] };
  }

  const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn)\b/);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(',', '.'));
    return { amount: Math.round(val * 1000), matchedText: kMatch[0] };
  }

  // 5. Plain numbers with dots / commas or 4+ digits: "45.000", "45000", "120.000đ"
  const numWithUnitMatch = normalized.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,9})\s*(?:vnđ|vnd|đ|đồng)?/);
  if (numWithUnitMatch && parseInt(numWithUnitMatch[1].replace(/[.,]/g, ''), 10) >= 1000) {
    const rawDigits = numWithUnitMatch[1].replace(/[.,]/g, '');
    const amount = parseInt(rawDigits, 10);
    if (!isNaN(amount) && amount > 0) {
      return { amount, matchedText: numWithUnitMatch[0] };
    }
  }

  // 6. Number words like "hai mươi nghìn", "năm mươi ngàn", "một trăm nghìn", "hai trăm k"
  const wordNumMatch = parseVietnameseSpokenWords(normalized);
  if (wordNumMatch) {
    return wordNumMatch;
  }

  // 7. Small integer standalone if mentioned with "hết", "tiêu", "mua", "giá" e.g. "mua phở hết 45" (often implies 45k)
  const contextNumMatch = normalized.match(/(?:hết|giá|tiêu|mất|được)\s*(\d{2,3})\b/);
  if (contextNumMatch) {
    const val = parseInt(contextNumMatch[1], 10);
    if (val >= 10 && val <= 999) {
      return { amount: val * 1000, matchedText: contextNumMatch[0] };
    }
  }

  return null;
}

/**
 * Parse text numbers like "hai mươi lăm nghìn", "năm trăm nghìn"
 */
function parseVietnameseSpokenWords(text: string): { amount: number; matchedText: string } | null {
  const units: Record<string, number> = {
    'trăm': 100,
    'mươi': 10,
    'chục': 10
  };

  // Check for phrases ending with nghìn / ngàn / triệu
  const textPattern = /(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|chục|trăm|nghìn|ngàn|triệu|rưỡi|lăm|mốt|\s)+/g;
  const matches = text.match(textPattern);
  if (!matches) return null;

  for (const phrase of matches) {
    const trimmed = phrase.trim();
    if (!trimmed.includes('nghìn') && !trimmed.includes('ngàn') && !trimmed.includes('triệu')) {
      continue;
    }

    const words = trimmed.split(/\s+/);
    let total = 0;
    let current = 0;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (VIETNAMESE_WORDS_MAP[w] !== undefined) {
        current += VIETNAMESE_WORDS_MAP[w];
      } else if (units[w]) {
        current = (current === 0 ? 1 : current) * units[w];
      } else if (w === 'nghìn' || w === 'ngàn') {
        total += (current === 0 ? 1 : current) * 1000;
        current = 0;
      } else if (w === 'triệu') {
        total += (current === 0 ? 1 : current) * 1000000;
        current = 0;
      } else if (w === 'rưỡi') {
        // e.g. triệu rưỡi = +500,000; nghìn rưỡi = +500
        if (words[i - 1] === 'triệu') total += 500000;
        else if (words[i - 1] === 'nghìn' || words[i - 1] === 'ngàn') total += 500;
      }
    }
    total += current;

    if (total >= 1000) {
      return { amount: total, matchedText: trimmed };
    }
  }

  return null;
}

/**
 * Keyword rules for categorizing Vietnamese expenses & incomes
 */
interface CategoryRule {
  id: string;
  name: string;
  type: FinanceTransactionType;
  keywords: string[];
  jar: string; // 6-Jars mapping
  defaultTag: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  // 1. Food & Drinks (NEC - 55%)
  {
    id: 'cat_food',
    name: 'Ăn uống & Cà phê',
    type: 'expense',
    keywords: [
      'ăn', 'uống', 'cơm', 'phở', 'bún', 'bánh mì', 'bánh', 'cà phê', 'cafe', 'cf',
      'trà sữa', 'trà chanh', 'nước ngọt', 'nước suối', 'ăn sáng', 'ăn trưa', 'ăn tối',
      'quán ăn', 'nhà hàng', 'buffet', 'lẩu', 'nướng', 'thịt', 'cá', 'rau', 'hoa quả',
      'trái cây', 'đồ ăn', 'kem', 'chè', 'sinh tố', 'pizza', 'kfc', 'lotteria', 'sushi'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Ăn_uống'
  },
  // 2. Transport & Gas (NEC - 55%)
  {
    id: 'cat_transport',
    name: 'Đi lại & Xăng xe',
    type: 'expense',
    keywords: [
      'xăng', 'đổ xăng', 'xe máy', 'ô tô', 'oto', 'grab', 'be', 'gojek', 'taxi',
      'gửi xe', 'vé xe', 'rửa xe', 'sửa xe', 'thay dầu', 'thay nhớt', 'vá săm', 'vá lốp',
      'bảo dưỡng xe', 'trạm thu phí', 'bot', 'tàu', 'xe buýt', 'bus', 'vé máy bay'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Xăng_xe'
  },
  // 3. Groceries & Supermarket (NEC - 55%)
  {
    id: 'cat_groceries',
    name: 'Chợ & Siêu thị bách hóa',
    type: 'expense',
    keywords: [
      'chợ', 'siêu thị', 'bách hóa', 'vinmart', 'winmart', 'coop', 'big c', 'go',
      'tiền chợ', 'gia vị', 'mắm muối', 'dầu ăn', 'nước giặt', 'xà phòng', 'kem đánh răng',
      'giấy vệ sinh', 'đồ dùng'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Tiền_chợ'
  },
  // 4. Bills & Utilities (NEC - 55%)
  {
    id: 'cat_bills',
    name: 'Hóa đơn & Điện nước / Net',
    type: 'expense',
    keywords: [
      'tiền điện', 'tiền nước', 'điện nước', 'internet', 'wifi', 'tiền mạng', 'cáp',
      'hóa đơn', 'nạp điện thoại', 'thẻ cào', 'viettel', 'vina', 'mobi', 'rác', 'tiền rác',
      'phí dịch vụ', 'tiền gas', 'bình gas'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Hóa_đơn'
  },
  // 5. Rent & Housing (NEC - 55%)
  {
    id: 'cat_rent',
    name: 'Thuê nhà & Chung cư',
    type: 'expense',
    keywords: [
      'tiền nhà', 'tiền trọ', 'tiền phòng', 'thuê nhà', 'chung cư', 'mặt bằng', 'thuê trọ'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Tiền_nhà'
  },
  // 6. Health & Medical (NEC - 55%)
  {
    id: 'cat_health',
    name: 'Y tế & Sức khỏe',
    type: 'expense',
    keywords: [
      'thuốc', 'tiệm thuốc', 'dược', 'bác sĩ', 'bệnh viện', 'khám bệnh', 'xét nghiệm',
      'nha khoa', 'răng', 'nhổ răng', 'niềng răng', 'vitamin', 'thực phẩm chức năng',
      'khẩu trang', 'y tế', 'mắt kính', 'khám mắt'
    ],
    jar: 'Hũ Thiết Yếu (NEC)',
    defaultTag: '#Sức_khỏe'
  },
  // 7. Shopping & Clothes (PLAY / LIFESTYLE - 10%)
  {
    id: 'cat_shopping',
    name: 'Mua sắm & Thời trang',
    type: 'expense',
    keywords: [
      'mua sắm', 'quần áo', 'áo', 'quần', 'váy', 'giày', 'dép', 'túi xách', 'balo',
      'shopee', 'lazada', 'tiktok shop', 'mỹ phẩm', 'son', 'phấn', 'nước hoa', 'đồng hồ',
      'phụ kiện', 'ốp lưng', 'tai nghe', 'sạc'
    ],
    jar: 'Hũ Hưởng Thụ (PLAY)',
    defaultTag: '#Mua_sắm'
  },
  // 8. Entertainment & Travel (PLAY - 10%)
  {
    id: 'cat_entertainment',
    name: 'Giải trí & Phim ảnh / Du lịch',
    type: 'expense',
    keywords: [
      'xem phim', 'rạp phim', 'cgv', 'lotte', 'bhd', 'du lịch', 'khách sạn', 'homestay',
      'đi chơi', 'dã ngoại', 'nhậu', 'bia', 'karaoke', 'bar', 'pub', 'game', 'nạp game',
      'playstation', 'net', 'quán net', 'sở thích', 'hòa nhạc', 'concert'
    ],
    jar: 'Hũ Hưởng Thụ (PLAY)',
    defaultTag: '#Giải_trí'
  },
  // 9. Couple & Date (PLAY / GIVE - 10%)
  {
    id: 'cat_couple_date',
    name: 'Hẹn hò & Quà tặng Cặp đôi',
    type: 'expense',
    keywords: [
      'người yêu', 'em yêu', 'anh yêu', 'bạn gái', 'bạn trai', 'hẹn hò', 'kỷ niệm',
      'quà tặng người yêu', 'valentine', 'hoa tươi', 'hoa hồng', 'bó hoa', 'ăn tối lãng mạn'
    ],
    jar: 'Hũ Hưởng Thụ (PLAY)',
    defaultTag: '#Hẹn_hò'
  },
  // 10. Education & Books (EDU - 10%)
  {
    id: 'cat_education',
    name: 'Học tập & Khóa học',
    type: 'expense',
    keywords: [
      'sách', 'mua sách', 'học phí', 'khóa học', 'tiếng anh', 'ielts', 'toeic', 'học thêm',
      'lớp học', 'vở', 'bút', 'văn phòng phẩm', 'giáo trình', 'học tập'
    ],
    jar: 'Hũ Giáo Dục (EDU)',
    defaultTag: '#Học_tập'
  },
  // 11. Gifts & Charity (GIVE - 5%)
  {
    id: 'cat_gifts',
    name: 'Hiếu hỷ & Quà mừng',
    type: 'expense',
    keywords: [
      'mừng cưới', 'đám cưới', 'thiệp cưới', 'sinh nhật', 'thôi nôi', 'quà mừng', 'mừng thọ',
      'phong bì', 'lì xì', 'biếu bố', 'biếu mẹ', 'từ thiện', 'quyên góp', 'công đức', 'giúp đỡ'
    ],
    jar: 'Hũ Cho Đi (GIVE)',
    defaultTag: '#Hiếu_hỷ'
  },
  // 12. Savings & Investments (FFA - 10% / LTSS - 10%)
  {
    id: 'cat_invest',
    name: 'Đầu tư chứng khoán / Quỹ',
    type: 'expense',
    keywords: [
      'đầu tư', 'chứng khoán', 'cổ phiếu', 'mua vàng', 'tiết kiệm', 'gửi tiết kiệm',
      'quỹ', 'bảo hiểm'
    ],
    jar: 'Hũ Tự Do Tài Chính (FFA)',
    defaultTag: '#Đầu_tư'
  },

  // INCOMES
  {
    id: 'inc_salary',
    name: 'Lương cố định hàng tháng',
    type: 'income',
    keywords: [
      'lương', 'tiền lương', 'bảng lương', 'nhận lương', 'lương tháng'
    ],
    jar: 'Thu Nhập Tổng',
    defaultTag: '#Lương'
  },
  {
    id: 'inc_bonus',
    name: 'Thưởng KPI & Dự án',
    type: 'income',
    keywords: [
      'thưởng', 'tiền thưởng', 'kpi', 'thưởng tết', 'thưởng dự án', 'hoa hồng'
    ],
    jar: 'Thu Nhập Tổng',
    defaultTag: '#Thưởng'
  },
  {
    id: 'inc_freelance',
    name: 'Thu nhập phụ & Nghề tay trái',
    type: 'income',
    keywords: [
      'freelance', 'nghề tay trái', 'làm thêm', 'bán hàng', 'tiền khách', 'hợp đồng',
      'cọc', 'tiền cọc', 'thanh toán', 'khách trả'
    ],
    jar: 'Thu Nhập Tổng',
    defaultTag: '#Nghề_tay_trái'
  },
  {
    id: 'inc_gift',
    name: 'Được tặng & Biếu thưởng',
    type: 'income',
    keywords: [
      'được tặng', 'biếu', 'được cho', 'người ta cho', 'nhận tiền lì xì'
    ],
    jar: 'Thu Nhập Tổng',
    defaultTag: '#Được_tặng'
  }
];

/**
 * Match wallet based on Vietnamese spoken terms
 */
function matchWallet(
  text: string,
  wallets: FinanceWallet[]
): { walletId: string; walletName: string } {
  const normalized = text.toLowerCase();

  // Keyword mappings for wallets
  if (/momo|ví điện tử|ví momo|zalopay|zalo pay/.test(normalized)) {
    const eWallet = wallets.find(w => w.type === 'e_wallet' || w.name.toLowerCase().includes('momo') || w.name.toLowerCase().includes('điện tử'));
    if (eWallet) return { walletId: eWallet.id, walletName: eWallet.name };
  }

  if (/vcb|vietcombank|ngân hàng|tài khoản|thẻ|chuyển khoản|ck|banking|techcombank|mb|tpbank|acb|bidv/.test(normalized)) {
    const bankWallet = wallets.find(w => w.type === 'bank' || w.name.toLowerCase().includes('ngân hàng') || w.name.toLowerCase().includes('vcb'));
    if (bankWallet) return { walletId: bankWallet.id, walletName: bankWallet.name };
  }

  if (/tiền mặt|ví mặt|ví tay|tiền ví/.test(normalized)) {
    const cashWallet = wallets.find(w => w.type === 'cash' || w.name.toLowerCase().includes('tiền mặt'));
    if (cashWallet) return { walletId: cashWallet.id, walletName: cashWallet.name };
  }

  // Default to first wallet (usually cash)
  if (wallets.length > 0) {
    return { walletId: wallets[0].id, walletName: wallets[0].name };
  }

  return { walletId: 'wallet_cash', walletName: 'Tiền Mặt Ví Tay' };
}

/**
 * Clean up the note / description by stripping extracted quantity phrases and boilerplate words
 */
function cleanNoteText(text: string, matchedAmountStr?: string): string {
  let cleaned = text;

  // Remove matched amount phrase
  if (matchedAmountStr) {
    cleaned = cleaned.replace(new RegExp(matchedAmountStr, 'i'), '');
  }

  // Remove common wallet mentions from note text
  cleaned = cleaned.replace(/\b(bằng|từ|qua|bằng ví|ví)\s*(tiền mặt|vietcombank|vcb|momo|ngân hàng|thẻ)\b/gi, '');
  cleaned = cleaned.replace(/\b(hết|giá|mất|tốn|chi|thu|nộp|trả|bằng)\b/gi, ' ');

  // Clean extra spaces & punctuation
  cleaned = cleaned.replace(/[.,;?!]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned || 'Chi tiêu thường ngày';
}

/**
 * Main parser: takes a raw Vietnamese voice transcript and returns a structured transaction proposal
 */
export function parseVoiceExpense(
  rawTranscript: string,
  categories: FinanceCategory[],
  wallets: FinanceWallet[]
): ParsedVoiceExpense {
  const normalized = rawTranscript.toLowerCase().trim();

  // 1. Detect Type (Income vs Expense)
  let type: FinanceTransactionType = 'expense';
  const incomeKeywords = ['lương', 'thu', 'tiền về', 'nhận', 'thưởng', 'được cho', 'bán được', 'khách trả', 'tiền vào', 'cổ tức', 'lãi'];
  const hasIncomeKeyword = incomeKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(normalized));
  if (hasIncomeKeyword) {
    type = 'income';
  }

  // 2. Extract Amount
  const amountMatch = extractVietnameseAmount(rawTranscript);
  const amount = amountMatch ? amountMatch.amount : 50000;
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);

  // 3. Match Category
  let bestCategory = CATEGORY_RULES.find(r => r.type === type);
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    if (rule.type !== type) continue;
    let score = 0;
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        // Longer keyword matches give higher weight
        score += kw.length >= 4 ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = rule;
    }
  }

  // Find corresponding app category if exists
  const appCategory = categories.find(c => c.id === bestCategory?.id) ||
    categories.find(c => c.type === type) ||
    {
      id: bestCategory?.id || (type === 'income' ? 'inc_salary' : 'cat_food'),
      name: bestCategory?.name || (type === 'income' ? 'Lương cố định' : 'Ăn uống & Cà phê'),
      color: type === 'income' ? '#10b981' : '#f59e0b',
      icon: type === 'income' ? 'Briefcase' : 'Utensils'
    };

  // 4. Match Wallet
  const matchedWallet = matchWallet(rawTranscript, wallets);

  // 5. Detect Shared Flags
  const isCoupleShared = /(người yêu|em yêu|anh yêu|cặp đôi|bạn gái|bạn trai|hai đứa|chúng mình|hẹn hò)/i.test(normalized);
  const isFamilyFund = /(gia đình|cho con|tiền nhà|tiền chợ|bố mẹ|biếu bố|biếu mẹ|quỹ gia đình)/i.test(normalized);

  // 6. Clean Note
  const note = cleanNoteText(rawTranscript, amountMatch?.matchedText);

  // 7. Tags
  const tags: string[] = [];
  if (bestCategory?.defaultTag) tags.push(bestCategory.defaultTag);
  if (isCoupleShared && !tags.includes('#Hẹn_hò')) tags.push('#Hẹn_hò');
  if (isFamilyFund && !tags.includes('#Gia_đình')) tags.push('#Gia_đình');

  // Confidence calculation
  let confidence = 0.5;
  if (amountMatch) confidence += 0.3;
  if (bestScore > 0) confidence += 0.15;
  if (matchedWallet) confidence += 0.05;
  confidence = Math.min(0.99, confidence);

  return {
    rawTranscript,
    type,
    amount,
    formattedAmount,
    categoryId: appCategory.id,
    categoryName: appCategory.name,
    categoryColor: (appCategory as any).color || '#f59e0b',
    categoryIcon: (appCategory as any).icon || 'Utensils',
    walletId: matchedWallet.walletId,
    walletName: matchedWallet.walletName,
    note,
    tags,
    isCoupleShared,
    isFamilyFund,
    date: new Date().toISOString().slice(0, 10),
    confidence,
    matchedJar: bestCategory?.jar || (type === 'income' ? 'Thu Nhập Tổng' : 'Hũ Thiết Yếu (NEC)')
  };
}

/**
 * Text-to-Speech synthesizer in Vietnamese
 */
export function speakVietnameseFeedback(text: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try finding Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS not supported or audio blocked:', e);
  }
}
