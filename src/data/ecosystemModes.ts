import React from 'react';
import {
  Sparkles,
  Headphones,
  BrainCircuit,
  Moon,
  GitFork,
  Wallet,
  MessageSquare,
  Mic,
  Heart,
  Gamepad2,
  Orbit,
  Crown,
  ShieldCheck,
  HelpCircle,
  User,
  Compass,
  Disc3,
  Layers,
  Calendar,
  PieChart,
  Home,
  Sun,
  Eye,
  Camera,
  Coins,
  GraduationCap,
  MapPin,
  Globe
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../types';

export interface EcosystemModeConfig {
  id: EcosystemMode;
  name: string;
  shortName: string;
  englishName: string;
  category: 'hub' | 'audio' | 'ai' | 'spiritual' | 'family' | 'finance' | 'creative' | 'social' | 'games' | 'utility' | 'study' | 'maps' | 'internet';
  categoryLabel: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  color: string; // Tailwind gradient from/to
  accentColor: string;
  borderColor: string;
  activeBorderColor: string;
  tagline: string;
  description: string;
  defaultTab: ActiveTab;
  shortcut: string;
  shortcutAction: string;
  keywords: string[];
  subPages?: Array<{
    title: string;
    desc: string;
    tabKey: string;
  }>;
}

export const ALL_ECOSYSTEM_MODES: EcosystemModeConfig[] = [
  {
    id: 'portal',
    name: 'Cổng Hệ Sinh Thái Haevy',
    shortName: 'Cổng Vũ Trụ',
    englishName: 'Universal Ecosystem Hub',
    category: 'hub',
    categoryLabel: 'Trung Tâm Hệ Sinh Thái',
    icon: Home,
    badge: 'Cổng Trung Tâm HUB',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    color: 'from-amber-500 to-yellow-600',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    activeBorderColor: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20',
    tagline: 'Cổng khám phá toàn diện các phân hệ, sự kiện đại lễ & nhận 500 Xu tân thủ.',
    description: 'Trang chủ trung tâm kết nối toàn bộ hệ sinh thái Haevy, bảng tin sự kiện, ưu đãi xu thưởng và vinh danh thành viên.',
    defaultTab: 'portal',
    shortcut: 'Alt + 0',
    shortcutAction: 'mode_portal',
    keywords: ['cổng', 'portal', 'trang chủ', 'hub', 'hệ sinh thái', 'đại lễ', '500 xu', 'tân thủ', 'sự kiện'],
    subPages: [
      { title: 'Trang Chủ Hệ Sinh Thái', desc: 'Banner đại lễ & nhận 500 xu tân thủ', tabKey: 'portal' },
      { title: 'Khám Phá Phân Hệ', desc: 'Toàn bộ vũ trụ sáng tạo Haevy', tabKey: 'portal' }
    ]
  },
  {
    id: 'haevy_ai',
    name: 'Haevy AI Master',
    shortName: 'Haevy AI',
    englishName: 'Omni Ecosystem Assistant & Soul Companion',
    category: 'ai',
    categoryLabel: 'Trí Tuệ Nhân Tạo & Thấu Cảm',
    icon: BrainCircuit,
    badge: 'AI Toàn Năng 🧠',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    color: 'from-purple-500 via-indigo-500 to-pink-500',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    activeBorderColor: 'border-purple-400 ring-2 ring-purple-400/40 shadow-purple-500/20',
    tagline: 'Trợ lý AI toàn năng điều phối các phân hệ, tâm sự tri kỷ thấu cảm & hỗ trợ 24/7.',
    description: 'Chế độ AI chuyên biệt hỗ trợ mọi tác vụ và điều phối toàn bộ các phân hệ: Lắng nghe tâm sự, gợi ý âm nhạc chữa lành, cập nhật thông tin sự kiện 3D và tháo gỡ vướng mắc kỹ thuật.',
    defaultTab: 'haevy_ai',
    shortcut: 'Alt + 2',
    shortcutAction: 'mode_haevy_ai',
    keywords: ['ai', 'trợ lý', 'chat', 'tâm sự', 'thấu cảm', 'cứu hộ', 'giải đáp', 'học sâu', 'gemini'],
    subPages: [
      { title: 'Trợ Lý Hệ Sinh Thái', desc: 'Matrix điều phối và trợ giúp toàn diện', tabKey: 'haevy_ai' },
      { title: 'Tâm Sự & Thấu Cảm', desc: 'Trò chuyện tri kỷ, xoa dịu cảm xúc', tabKey: 'haevy_ai' }
    ]
  },
  {
    id: 'audio',
    name: 'Haevy Audio',
    shortName: 'Haevy Audio',
    englishName: 'Audio & Music Space Hi-Fi Lossless',
    category: 'audio',
    categoryLabel: 'Âm Thanh & Giải Trí Hi-Fi',
    icon: Headphones,
    badge: 'Hi-Fi 24-bit/96kHz',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    color: 'from-indigo-500 to-purple-600',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    activeBorderColor: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20',
    tagline: 'Nền tảng âm nhạc bản quyền Lossless, truyện audio đêm, sóng não Delta & radio.',
    description: 'Chế độ chuyên biệt cho trải nghiệm thưởng thức âm thanh bản quyền chất lượng cao, đài Radio trực tuyến và thảo luận cùng cộng đồng yêu nhạc.',
    defaultTab: 'home',
    shortcut: 'Alt + 1',
    shortcutAction: 'mode_audio',
    keywords: ['nhạc', 'audio', 'bài hát', 'lossless', 'truyện', 'radio', 'podcast', 'sóng não', 'delta', 'hifi'],
    subPages: [
      { title: 'Trang Chủ Khám Phá', desc: 'Bảng tin xu hướng & bài hát mới', tabKey: 'home' },
      { title: 'Kho Audio Cá Nhân', desc: 'Bộ sưu tập bài hát & danh sách phát', tabKey: 'library' },
      { title: 'Cộng Đồng', desc: 'Bình luận & kết nối bạn bè', tabKey: 'community' }
    ]
  },
  {
    id: 'spiritual',
    name: 'Haevy Spiritual',
    shortName: 'Tâm Linh Vũ Trụ',
    englishName: 'Tarot 3D, Tu Vi 2026 & Astrology Sanctuary',
    category: 'spiritual',
    categoryLabel: 'Tâm Linh & Huyền Học',
    icon: Moon,
    badge: 'Tarot 3D & Tử Vi 2026 🔮',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    color: 'from-purple-600 via-indigo-600 to-pink-600',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    activeBorderColor: 'border-purple-400 ring-2 ring-purple-400/40 shadow-purple-500/20',
    tagline: 'Bói 78 lá Tarot 3D, lập lá số Tử Vi 12 cung 2026, bản đồ sao Chiêm Tinh & Solfeggio 528Hz.',
    description: 'Không gian tâm linh huyền học toàn năng: Bói 78 lá bài Tarot 3D đa dạng kiểu trải, lập lá số Tử Vi trọn đời và vận hạn năm 2026 (Bính Ngọ), bản đồ sao Chiêm tinh Natal Chart cùng sóng âm Solfeggio chữa lành 7 luân xa.',
    defaultTab: 'spiritual',
    shortcut: 'Alt + 3',
    shortcutAction: 'mode_spiritual',
    keywords: ['tâm linh', 'tarot', 'tử vi', 'bói bài', 'chiêm tinh', 'sao', 'luân xa', 'solfeggio', 'chuông xoay', 'huyền học'],
    subPages: [
      { title: 'Bói Bài Tarot 3D', desc: '78 lá Rider-Waite & luận giải', tabKey: 'spiritual' },
      { title: 'Lá Số Tử Vi Trọn Đời', desc: '12 cung & vận hạn 2026', tabKey: 'spiritual' },
      { title: 'Chiêm Tinh & Natal Chart', desc: 'Bản đồ sao cá nhân', tabKey: 'spiritual' },
      { title: 'Sóng Âm Chữa Lành', desc: 'Solfeggio 528Hz & chuông xoay', tabKey: 'spiritual' }
    ]
  },
  {
    id: 'family_tree',
    name: 'Haevy Family Tree',
    shortName: 'Gia Phả Dòng Họ',
    englishName: 'Pedigree Clan & Genealogy Interactive Tree',
    category: 'family',
    categoryLabel: 'Gia Đình & Cội Nguồn Dòng Tộc',
    icon: GitFork,
    badge: 'Gia Phả Dòng Tộc 👑',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    color: 'from-amber-600 via-yellow-600 to-amber-700',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    activeBorderColor: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20',
    tagline: 'Phả hệ dòng tộc số hóa, cây phả hệ tương tác thu phóng O(1), hồ sơ sắc phong & lịch giỗ Âm-Dương.',
    description: 'Chế độ quản lý phả hệ dòng tộc số hóa: Sơ đồ cây tương tác phóng to thu nhỏ, quản lý hồ sơ thành viên kèm tư liệu sắc phong, thiết lập quan hệ cha-con, vợ-chồng, tra cứu danh bộ đa tiêu chí, lịch giỗ chạp tính Âm-Dương tự động nhắc nhở.',
    defaultTab: 'family_tree',
    shortcut: 'Alt + 4',
    shortcutAction: 'mode_family_tree',
    keywords: ['gia phả', 'dòng họ', 'cây phả hệ', 'tổ tiên', 'lịch giỗ', 'âm dương', 'sắc phong', 'phả hệ', 'trưởng họ'],
    subPages: [
      { title: 'Sơ Đồ Cây Tương Tác', desc: 'Thu phóng & khám phá các thế hệ', tabKey: 'family_tree' },
      { title: 'Hồ Sơ & Danh Bộ', desc: 'Tiểu sử, sắc phong & học vị', tabKey: 'family_tree' },
      { title: 'Lịch Giỗ & Sự Kiện', desc: 'Tính ngày Âm-Dương tự động', tabKey: 'family_tree' }
    ]
  },
  {
    id: 'finance',
    name: 'Haevy Finance',
    shortName: 'Thu Chi 6 Hũ',
    englishName: 'Smart Wealth & 6 Jars Budget Manager',
    category: 'finance',
    categoryLabel: 'Tài Chính & Quản Lý Dòng Tiền',
    icon: Wallet,
    badge: '6 Hũ Tiền & Ngân Sách 💰',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: 'from-emerald-500 to-green-600',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    activeBorderColor: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20',
    tagline: 'Quản trị thu chi thông minh, quản lý 6 hũ tiền, đa ví tài khoản & ngân sách 50/30/20.',
    description: 'Chế độ quản lý dòng tiền toàn diện: Kiểm soát thu chi tức thời, quản lý đa ví tiền, hạn mức ngân sách thông minh 50/30/20 và báo cáo phân tích.',
    defaultTab: 'finance',
    shortcut: 'Alt + 5',
    shortcutAction: 'mode_finance',
    keywords: ['tài chính', 'thu chi', 'tiền', 'ví', 'ngân sách', '6 hũ', 'tiết kiệm', 'nợ', 'lãi kép', 'finance'],
    subPages: [
      { title: 'Tổng Quan Tài Sản', desc: 'Số dư tổng hợp & các loại ví', tabKey: 'finance' },
      { title: 'Sổ Giao Dịch Thu / Chi', desc: 'Ghi nhận chi tiêu nhanh', tabKey: 'finance' },
      { title: '6 Hũ & Ngân Sách', desc: 'Quy tắc 6 hũ & 50/30/20', tabKey: 'finance' }
    ]
  },
  {
    id: 'couple',
    name: 'I Love Haevy',
    shortName: 'Cặp Đôi Lãng Mạn',
    englishName: 'Couple Romance Space & Love Clock',
    category: 'social',
    categoryLabel: 'Tình Yêu & Cặp Đôi',
    icon: Heart,
    badge: 'Cặp Đôi 💕',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    color: 'from-rose-500 to-red-600',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    activeBorderColor: 'border-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/20',
    tagline: 'Không gian tình nhân lãng mạn: Đồng hồ đếm ngày yêu, nhật ký kỷ niệm, nghe nhạc chung & heo đất đôi.',
    description: 'Chế độ độc quyền dành cho hai người: Đồng hồ đếm ngày yêu, nhật ký hẹn hò lưu giữ kỷ niệm, nghe nhạc đôi đồng bộ và xây dựng quỹ chung.',
    defaultTab: 'couple',
    shortcut: 'Alt + 6',
    shortcutAction: 'mode_couple',
    keywords: ['cặp đôi', 'tình yêu', 'yêu', 'đếm ngày yêu', 'kỷ niệm', 'nhật ký', 'quỹ đôi', 'nghe chung', 'romance'],
    subPages: [
      { title: 'Đồng Hồ Đếm Ngày Yêu', desc: 'Mốc kỷ niệm & danh hiệu tình yêu', tabKey: 'couple' },
      { title: 'Nhật Ký Hẹn Hò', desc: 'Lưu giữ khoảnh khắc ngọt ngào', tabKey: 'couple' },
      { title: 'Nghe Chung & Quỹ Đôi', desc: 'Đồng bộ phát nhạc & nuôi heo đất', tabKey: 'couple' }
    ]
  },
  {
    id: 'messages',
    name: 'Haevy Message',
    shortName: 'Tin Nhắn & Bạn',
    englishName: 'Realtime Chat & HD Voice Note',
    category: 'social',
    categoryLabel: 'Kết Nối & Nhắn Tin Trực Tuyến',
    icon: MessageSquare,
    badge: 'Tin Nhắn Realtime',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    color: 'from-sky-500 to-blue-600',
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    activeBorderColor: 'border-sky-400 ring-2 ring-sky-400/40 shadow-sky-500/20',
    tagline: 'Nhắn tin realtime bảo mật, gửi Voice Note HD không nén & phòng chat cùng nghe nhạc.',
    description: 'Chế độ nhắn tin trực tuyến tức thì, gửi tin nhắn thoại Voice Note chất lượng cao không nén và cùng bạn bè nghe bài hát yêu thích.',
    defaultTab: 'messages',
    shortcut: 'Alt + 7',
    shortcutAction: 'mode_messages',
    keywords: ['tin nhắn', 'chat', 'bạn bè', 'voice note', 'thoại', 'kết bạn', 'nhắn tin', 'realtime'],
    subPages: [
      { title: 'Hộp Thư & Bạn Bè', desc: 'Trò chuyện 1-1 realtime', tabKey: 'messages' },
      { title: 'Voice Note Studio', desc: 'Ghi âm gửi tin nhắn thoại HD', tabKey: 'messages' }
    ]
  },
  {
    id: 'space',
    name: 'Haevy Space (3D AR)',
    shortName: 'Haevy Space 3D',
    englishName: 'Spatial 3D Drawing & Calligraphy Space',
    category: 'creative',
    categoryLabel: 'Thực Tế Ảo & Bảng Vẽ 3D AR',
    icon: Sparkles,
    badge: '3D AR Không Gian 🌌',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    color: 'from-cyan-500 to-blue-600',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    activeBorderColor: 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-500/20',
    tagline: 'Bảng vẽ tương tác 3D trong không gian, vẽ hình học, viết thư pháp AR & xuất Hologram 360°.',
    description: 'Bảng vẽ tương tác 3D thực tế ảo không chạm 60 FPS: Vẽ hình học toán học, viết thư pháp trong không khí, nhận diện AI nét vẽ & xuất Hologram xoay 360°.',
    defaultTab: 'space',
    shortcut: 'Alt + 8',
    shortcutAction: 'mode_space',
    keywords: ['space', '3d', 'ar', 'bảng vẽ', 'thư pháp', 'hologram', 'không gian', 'không chạm'],
    subPages: [
      { title: 'Bảng Vẽ Thư Pháp 3D', desc: 'Nét cọ laser & plasma', tabKey: 'space' },
      { title: 'Hình Học Không Gian', desc: 'Khối đa diện 3D', tabKey: 'space' }
    ]
  },
  {
    id: 'haevy_lite',
    name: 'Xu Haevy Lite',
    shortName: 'Xu Lite & Avatar',
    englishName: 'Haevy Lite Coins & Cosmic Theme Bundles',
    category: 'creative',
    categoryLabel: 'Xu Thưởng & Combo Vũ Trụ',
    icon: Orbit,
    badge: 'Combo Vũ Trụ 🌌',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    color: 'from-purple-600 via-indigo-600 to-pink-500',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    activeBorderColor: 'border-purple-400 ring-2 ring-purple-400/40 shadow-purple-500/20',
    tagline: 'Xem quảng cáo 30s nhận +50 Xu, mở khóa combo vũ trụ, hào quang avatar quỹ đạo 3D.',
    description: 'Hệ thống Xu Haevy Lite độc quyền: Xem quảng cáo 30s tích lũy +50 Xu mỗi lượt, nạp Xu thanh toán tức thì, mở khóa combo vũ trụ bao gồm hào quang avatar xoay quỹ đạo, hiệu ứng cổng chào khi vào trang cá nhân và nhạc nền không gian.',
    defaultTab: 'haevy_lite',
    shortcut: 'Alt + 9',
    shortcutAction: 'mode_haevy_lite',
    keywords: ['xu', 'lite', 'avatar', 'quỹ đạo', 'combo', 'vũ trụ', 'quảng cáo', 'nạp xu'],
    subPages: [
      { title: 'Kho Combo Chủ Đề', desc: 'Combo Vũ Trụ & Cyber Neon', tabKey: 'haevy_lite' },
      { title: 'Xem Quảng Cáo 30s', desc: '+50 Xu Haevy Lite mỗi lượt', tabKey: 'haevy_lite' }
    ]
  },
  {
    id: 'studio',
    name: 'Haevy Studio',
    shortName: 'Haevy Studio',
    englishName: 'AI Studio & Creator Hub',
    category: 'creative',
    categoryLabel: 'Sáng Tạo & Giọng Đọc AI',
    icon: Mic,
    badge: 'AI Voice TTS 🎙️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    color: 'from-rose-500 to-pink-600',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30 hover:border-rose-400',
    activeBorderColor: 'border-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/20',
    tagline: 'Phòng thu giọng đọc AI truyền cảm Gemini TTS, xác thực định danh nghệ sĩ eKYC & phát hành.',
    description: 'Chế độ chuyên biệt cho Tác giả & Nghệ sĩ: Xác thực định danh eKYC, chuyển văn bản thành giọng nói AI Text-to-Speech truyền cảm và quản lý kho tác phẩm.',
    defaultTab: 'studio',
    shortcut: 'Alt + S',
    shortcutAction: 'mode_studio',
    keywords: ['studio', 'tts', 'giọng đọc', 'ai voice', 'phát hành', 'ekyc', 'tác giả', 'thu âm'],
    subPages: [
      { title: 'Định Danh eKYC Tác Giả', desc: 'Hồ sơ nghệ sĩ & chứng nhận', tabKey: 'studio' },
      { title: 'AI Text-to-Speech', desc: 'Chuyển văn bản thành giọng đọc', tabKey: 'studio' },
      { title: 'Kho Tác Phẩm', desc: 'Quản lý bài đã phát hành', tabKey: 'studio' }
    ]
  },
  {
    id: 'games',
    name: 'Haevy Games',
    shortName: 'Haevy Games',
    englishName: 'Arcade & Challenge Arena',
    category: 'games',
    categoryLabel: 'Trò Chơi & Giải Trí',
    icon: Gamepad2,
    badge: 'Trò Chơi 🎮',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    color: 'from-indigo-600 to-violet-600',
    accentColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30 hover:border-indigo-400',
    activeBorderColor: 'border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-500/20',
    tagline: 'Đấu trường mini-game âm nhạc, thử thách đoán bài hát, vòng quay may mắn & đua top bảng vinh danh.',
    description: 'Không gian giải trí game âm nhạc đỉnh cao: Thử thách đoán bài hát, đấu nhịp điệu rinh điểm thưởng và leo top bảng vinh danh cao thủ.',
    defaultTab: 'games',
    shortcut: 'Alt + G',
    shortcutAction: 'mode_games',
    keywords: ['game', 'trò chơi', 'đoán nhạc', 'vòng quay', 'bxh', 'điểm thưởng', 'arcade'],
    subPages: [
      { title: 'Đấu Trường Game', desc: 'Đoán giai điệu & vòng quay', tabKey: 'games' },
      { title: 'Bảng Xếp Hạng', desc: 'Vinh danh cao thủ', tabKey: 'games' }
    ]
  },
  {
    id: 'vip',
    name: 'Haevy VIP Club',
    shortName: 'Haevy VIP',
    englishName: 'VIP Club & Intelligence Analytics',
    category: 'utility',
    categoryLabel: 'Đặc Quyền & Hội Viên VIP',
    icon: Crown,
    badge: 'VIP Club 👑',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    color: 'from-amber-400 to-yellow-500',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-400/30 hover:border-amber-400',
    activeBorderColor: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20',
    tagline: 'Đặc quyền hội viên thượng lưu, báo cáo phân tích thông minh toàn hệ sinh thái & tối ưu trải nghiệm.',
    description: 'Bảng điều khiển VIP thông minh: Phân tích sức khỏe trải nghiệm hệ sinh thái, mở khóa âm thanh Spatial 3D, hỗ trợ độc quyền và gợi ý tối ưu tự động.',
    defaultTab: 'vip',
    shortcut: 'Alt + V',
    shortcutAction: 'mode_vip',
    keywords: ['vip', 'club', 'đặc quyền', 'hội viên', 'phân tích', 'tối ưu', 'nâng cấp'],
    subPages: [
      { title: 'Đặc Quyền VIP', desc: 'Quyền lợi âm thanh & hệ sinh thái', tabKey: 'vip' },
      { title: 'Trí Tuệ Toàn Diện', desc: 'Báo cáo thông minh cá nhân', tabKey: 'vip' }
    ]
  },
  {
    id: 'admin',
    name: 'Haevy Admin',
    shortName: 'Quản Trị Hệ Thống',
    englishName: 'Universal Ecosystem Administration',
    category: 'utility',
    categoryLabel: 'Quản Trị & Điều Hành',
    icon: ShieldCheck,
    badge: 'Quản Trị 🛡️',
    badgeColor: 'bg-red-500/20 text-rose-300 border-red-500/40',
    color: 'from-red-500 to-rose-600',
    accentColor: 'text-rose-400',
    borderColor: 'border-red-500/30 hover:border-red-400',
    activeBorderColor: 'border-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/20',
    tagline: 'Trung tâm quản trị toàn hệ sinh thái: Duyệt tác giả eKYC, quản lý kho nhạc, chuỗi khóa bảo vệ & thành viên.',
    description: 'Bảng điều khiển dành riêng cho Quản trị viên: Kiểm duyệt bản quyền nhạc, phê duyệt hồ sơ tác giả, giám sát tài chính và thiết lập hệ thống.',
    defaultTab: 'admin',
    shortcut: 'Alt + A',
    shortcutAction: 'mode_admin',
    keywords: ['admin', 'quản trị', 'kiểm duyệt', 'kho nhạc', 'bảo vệ', 'chain lock', 'phê duyệt']
  },
  {
    id: 'support',
    name: 'Haevy Support',
    shortName: 'Trợ Giúp & FAQ',
    englishName: 'Customer Support & Knowledge Base',
    category: 'utility',
    categoryLabel: 'Hỗ Trợ Khách Hàng',
    icon: HelpCircle,
    badge: 'Hỗ Trợ 24/7',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    color: 'from-blue-500 to-indigo-600',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    activeBorderColor: 'border-blue-400 ring-2 ring-blue-400/40 shadow-blue-500/20',
    tagline: 'Trung tâm trợ giúp, giải đáp thắc mắc và hướng dẫn sử dụng hệ sinh thái.',
    description: 'Hỗ trợ khách hàng, giải đáp thắc mắc kỹ thuật, thanh toán và hướng dẫn sử dụng hệ sinh thái Haevy 24/7.',
    defaultTab: 'support',
    shortcut: 'Alt + H',
    shortcutAction: 'mode_support',
    keywords: ['hỗ trợ', 'support', 'faq', 'giúp đỡ', 'liên hệ', 'hướng dẫn']
  },
  {
    id: 'profile',
    name: 'Trang Cá Nhân & Tài Khoản',
    shortName: 'Trang Cá Nhân',
    englishName: 'User Profile & Settings',
    category: 'utility',
    categoryLabel: 'Tài Khoản Cá Nhân',
    icon: User,
    badge: 'Cá Nhân',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    activeBorderColor: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20',
    tagline: 'Quản lý tài khoản, điểm thưởng, VIP, lịch sử nghe và bảo mật cá nhân.',
    description: 'Thông tin hồ sơ người dùng, quản lý tài khoản, nâng cấp VIP, điểm thưởng và cài đặt cá nhân hóa.',
    defaultTab: 'profile',
    shortcut: 'Alt + P',
    shortcutAction: 'mode_profile',
    keywords: ['profile', 'hồ sơ', 'cá nhân', 'tài khoản', 'cài đặt', 'bảo mật']
  },
  {
    id: 'edu',
    name: 'Haevy Edu (Khoa Học & Thử Nghiệm STEM)',
    shortName: 'Haevy Edu',
    englishName: 'Interactive STEM Lab & Deep Learning Engine',
    category: 'study',
    categoryLabel: 'Nghiên Cứu & Học Tập STEM',
    icon: GraduationCap,
    badge: 'Học Tập & Thí Nghiệm 🧪',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: 'from-teal-500 via-emerald-600 to-cyan-500',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    activeBorderColor: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20',
    tagline: 'Phòng thí nghiệm tương tác Vật lý, Hóa học, Sinh học; Phân tích tài liệu tạo lộ trình & Video bài giảng AI.',
    description: 'Chế độ chuyên biệt dành cho học sinh, sinh viên và nghiên cứu: Thí nghiệm mô phỏng tương tác Vật lý (con lắc, khúc xạ quang học, mạch điện), Hóa học (chuẩn độ pH, phản ứng kết tủa/sủi bọt, bảng tuần hoàn), Sinh học (kính hiển vi ảo, di truyền Men-đen, quang hợp), đọc file/thư mục tài liệu để xây dựng lộ trình học tập hiệu quả tránh học vẹt và tạo video bài học sinh động.',
    defaultTab: 'edu' as ActiveTab,
    shortcut: 'Alt + E',
    shortcutAction: 'mode_edu',
    keywords: ['edu', 'học tập', 'thí nghiệm', 'vật lý', 'hóa học', 'sinh học', 'lộ trình', 'tài liệu', 'video bài giảng', 'stem', 'sinh viên', 'học sinh'],
    subPages: [
      { title: 'Phòng Thí Nghiệm Ảo', desc: 'Vật lý, Hóa học, Sinh học tương tác thời gian thực', tabKey: 'lab' },
      { title: 'Đọc File & Lộ Trình Học', desc: 'AI phân tích nguyên lý gốc rễ, tránh học vẹt', tabKey: 'roadmap' },
      { title: 'Tạo Video Bài Giảng AI', desc: 'Chuyển tài liệu thành video thuyết minh sống động', tabKey: 'video' },
      { title: 'Công Cụ & Tra Cứu Khoa Học', desc: 'Máy tính STEM, hằng số vũ trụ & chuyển đổi', tabKey: 'tools' }
    ]
  },
  {
    id: 'maps',
    name: 'Haevy Maps (Gia Đình & Bạn Đời)',
    shortName: 'Haevy Maps',
    englishName: 'Live Family & Couple GPS Map',
    category: 'family',
    categoryLabel: 'Bản Đồ Định Vị & An Toàn',
    icon: MapPin,
    badge: 'Live GPS 📍',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    color: 'from-emerald-500 via-teal-500 to-sky-500',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    activeBorderColor: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20',
    tagline: 'Bản đồ trực tiếp kết nối vị trí bạn đời, người yêu và gia đình, chia sẻ mức pin & vùng an toàn Geofencing.',
    description: 'Chế độ bản đồ định vị thông minh thời gian thực: Hiển thị khoảng cách và ước tính thời gian di chuyển (xe máy, ô tô, đi bộ) tới bạn đời hoặc người thân; Gửi nhịp tim yêu thương và rung chuông tìm kiếm; Quản lý vùng an toàn Geofencing (nhà riêng, trường học, cơ quan) và phát tín hiệu SOS khẩn cấp khi cần giúp đỡ.',
    defaultTab: 'maps' as ActiveTab,
    shortcut: 'Alt + M',
    shortcutAction: 'mode_maps',
    keywords: ['maps', 'bản đồ', 'định vị', 'gps', 'người yêu', 'bạn đời', 'gia đình', 'vị trí', 'an toàn', 'geofence', 'sos', 'pin'],
    subPages: [
      { title: 'Tất Cả Thành Viên', desc: 'Xem toàn bộ người thân và bạn bè trên bản đồ', tabKey: 'all' },
      { title: 'Bạn Đời & Người Yêu', desc: 'Không gian định vị cặp đôi, gửi tim & dẫn đường', tabKey: 'couple' },
      { title: 'Nhóm Gia Đình', desc: 'Theo dõi an toàn con cái, bố mẹ và ông bà', tabKey: 'family' },
      { title: 'Vùng An Toàn (Geofence)', desc: 'Nhà riêng, cơ quan, trường học & bệnh viện', tabKey: 'zones' }
    ]
  },
  {
    id: 'internet',
    name: 'Haevy Internet (Trình Duyệt & Web 4.0)',
    shortName: 'Haevy Internet',
    englishName: 'Next-Gen Tabbed AI Web Browser',
    category: 'internet',
    categoryLabel: 'Trình Duyệt & Tìm Kiếm Web',
    icon: Globe,
    badge: 'Trình Duyệt Web 🌐',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    color: 'from-sky-500 via-blue-600 to-indigo-600',
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    activeBorderColor: 'border-sky-400 ring-2 ring-sky-400/40 shadow-sky-500/20',
    tagline: 'Trình duyệt web đa tab tách biệt từ Haevy AI, đọc báo sạch không quảng cáo & tóm tắt Gemini AI.',
    description: 'Chế độ trình duyệt web đa tab độc lập tách biệt hoàn toàn từ Haevy AI: Tìm kiếm thông minh Google/Wikipedia/Bing, duyệt web HTTPS an toàn, chế độ đọc sạch Reader Mode loại bỏ quảng cáo, đọc to bài viết bằng giọng đọc tiếng Việt chuẩn và kết nối sâu với Gemini AI để tóm tắt, trích xuất dữ liệu trang web.',
    defaultTab: 'internet' as ActiveTab,
    shortcut: 'Alt + I',
    shortcutAction: 'mode_internet',
    keywords: ['internet', 'trình duyệt', 'browser', 'web', 'tìm kiếm', 'chrome', 'báo', 'tin tức', 'reader', 'wikipedia', 'google'],
    subPages: [
      { title: 'Trình Duyệt Đa Thẻ', desc: 'Duyệt mọi trang web độc lập với thanh URL HTTPS', tabKey: 'browser' },
      { title: 'Tìm Kiếm AI Thông Minh', desc: 'Tra cứu thông tin chính xác từ nguồn Internet', tabKey: 'search' },
      { title: 'Dấu Trang & Lịch Sử', desc: 'Quản lý kho website yêu thích theo danh mục', tabKey: 'bookmarks' },
      { title: 'Bản Tin Xu Hướng 24h', desc: 'Cập nhật tin công nghệ, xã hội & khởi nghiệp', tabKey: 'news' },
      { title: 'Chế Độ Đọc AI Reader', desc: 'Đọc sạch không quảng cáo & tóm tắt bản chất', tabKey: 'ai_reader' }
    ]
  }
];

export function getEcosystemModeConfig(modeId: string): EcosystemModeConfig {
  const found = ALL_ECOSYSTEM_MODES.find(m => m.id === modeId);
  if (found) return found;
  // Fallback for audio_library, morning, support, profile
  if (modeId === 'audio_library') {
    return {
      ...ALL_ECOSYSTEM_MODES[2],
      id: 'audio_library',
      name: 'Kho Audio Cá Nhân',
      shortName: 'Kho Audio',
      defaultTab: 'library',
      badge: 'Kho Nhạc',
    };
  }
  if (modeId === 'morning') {
    return {
      ...ALL_ECOSYSTEM_MODES[7],
      id: 'morning',
      name: 'Haevy Space (3D AR)',
      shortName: 'Haevy Space',
      defaultTab: 'morning',
    };
  }
  return ALL_ECOSYSTEM_MODES[0];
}
