import React, { useState } from 'react';
import {
  X,
  LayoutGrid,
  Search,
  Check,
  Eye,
  ArrowRight,
  Moon,
  Compass,
  MessageSquare,
  Mic,
  Wallet,
  ShieldCheck,
  Heart,
  BrainCircuit,
  Sparkles,
  GitFork,
  GraduationCap
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../types';
import { haptics } from '../utils/haptics';

interface HaevyAllModesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onSelectDemoModal?: (demoKey: string) => void;
  onClaimGift?: () => void;
}

export function HaevyAllModesInfoModal({
  isOpen,
  onClose,
  onSelectMode,
  onSelectDemoModal,
}: HaevyAllModesInfoModalProps) {
  const [allModesFilter, setAllModesFilter] = useState<'all' | 'spiritual' | 'audio' | 'creative' | 'social' | 'utility'>('all');
  const [allModesSearch, setAllModesSearch] = useState('');

  if (!isOpen) return null;

  const MODES_DATA = [
    {
      id: 'spiritual' as EcosystemMode,
      name: 'Haevy Spiritual',
      category: 'spiritual',
      categoryName: 'Tâm linh & Huyền học',
      icon: Sparkles,
      color: 'from-purple-600 via-indigo-600 to-pink-600',
      glow: 'border-purple-500/30 hover:border-purple-400/60',
      badge: 'Tarot 3D & Tử Vi 2026 🔮',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      tagline: 'Trải 78 lá bài Tarot 3D, lập lá số Tử Vi 12 cung, bản đồ sao Chiêm Tinh & Sóng âm Solfeggio.',
      highlights: [
        'Bộ 78 lá bài Tarot 3D Rider-Waite với nhiều kiểu trải bài & AI Luận giải chuyên sâu',
        'Lập lá số Tử Vi 12 cung chi tiết, Can Chi ngũ hành & Sao chiếu mệnh năm 2026 (Bính Ngọ)',
        'Khám phá 12 Cung Hoàng Đạo, bản đồ sao Natal Chart & Tần số chữa lành Solfeggio 528Hz'
      ],
      demoKey: 'spiritual_demo',
    },
    {
      id: 'haevy_ai' as EcosystemMode,
      name: 'Haevy AI Master',
      category: 'utility',
      categoryName: 'Trí tuệ nhân tạo toàn năng',
      icon: BrainCircuit,
      color: 'from-purple-500 via-indigo-500 to-pink-500',
      glow: 'border-purple-500/30 hover:border-purple-400/60',
      badge: 'Trí Tuệ Toàn Hệ Sinh Thái',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      tagline: 'Lắng nghe tâm sự thấu cảm, cập nhật điểm mới sự kiện 3D & trợ giúp giải quyết vướng mắc 24/7.',
      highlights: [
        'Trợ lý toàn năng hỗ trợ mọi phân hệ: Audio, Space 3D AR, Games, Finance, Couple...',
        'Tâm sự tri kỷ, xoa dịu cảm xúc, tư vấn tâm lý và gợi ý âm nhạc phù hợp tâm trạng',
        'Nắm vững dữ liệu hệ sinh thái, 7 phong cách thưởng sự kiện 3D và bảo mật 6 lớp'
      ],
      demoKey: 'ai_demo',
    },
    {
      id: 'audio' as EcosystemMode,
      name: 'Haevy Audio',
      category: 'audio',
      categoryName: 'Âm thanh & Thư giãn',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      glow: 'border-indigo-500/30 hover:border-indigo-400/60',
      badge: 'Sóng Não Delta 0.5-4Hz',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      tagline: 'Kho truyện đêm bất tận, âm thanh Hi-Fi ru ngủ & hẹn giờ tắt thông minh.',
      highlights: [
        'Hàng ngàn giờ truyện audio: Kiếm hiệp, Tiên hiệp, Ngôn tình, Trinh thám',
        'Sóng não Delta (0.5 - 4Hz) hỗ trợ thư giãn và ngủ sâu tự nhiên',
        'Hẹn giờ tự động tắt nhạc thông minh và lưu vị trí đang nghe'
      ],
      demoKey: 'audio_demo',
    },
    {
      id: 'space' as EcosystemMode,
      name: 'Haevy Space',
      category: 'creative',
      categoryName: 'Sáng tạo & 3D AR',
      icon: Compass,
      color: 'from-cyan-500 to-blue-600',
      glow: 'border-cyan-500/30 hover:border-cyan-400/60',
      badge: '3D AR & Không Chạm',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      tagline: 'Vẽ 3D trong không gian, tách nét 100%, cử chỉ Pinch camera & Linh vật Son 3D.',
      highlights: [
        'Tách nét vẽ 3D độc lập xoay 360° tự do trong không gian',
        'Điều khiển cử chỉ ngón tay Pinch không chạm qua Camera AI',
        'Tương tác cùng linh vật Haevy Son 3D sống động chân thực'
      ],
      demoKey: 'space_demo',
    },
    {
      id: 'messages' as EcosystemMode,
      name: 'Haevy Message',
      category: 'social',
      categoryName: 'Kết nối & Trò chuyện',
      icon: MessageSquare,
      color: 'from-sky-500 to-blue-600',
      glow: 'border-sky-500/30 hover:border-sky-400/60',
      badge: 'Thời Gian Thực & Voice Call',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      tagline: 'Nhắn tin tức thời, gọi thoại trực tiếp voice/video & AI trợ lý.',
      highlights: [
        'Nhắn tin mã hóa an toàn với độ trễ phản hồi cực thấp',
        'Gọi thoại trực tiếp không giới hạn thời lượng cuộc gọi',
        'Trợ lý Haevy AI đọc hiểu và hỗ trợ cuộc trò chuyện'
      ],
      demoKey: 'messages_demo',
    },
    {
      id: 'studio' as EcosystemMode,
      name: 'Haevy Studio',
      category: 'creative',
      categoryName: 'Tác giả & Sáng tác',
      icon: Mic,
      color: 'from-rose-500 to-pink-600',
      glow: 'border-rose-500/30 hover:border-rose-400/60',
      badge: 'AI TTS & eKYC Tác Giả',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      tagline: 'Chuyển văn bản thành giọng đọc truyền cảm, bảo vệ tác quyền số & nhận donate.',
      highlights: [
        'Công nghệ AI Voice TTS đa thanh âm truyền cảm hứng',
        'Hệ thống eKYC định danh tác giả và bảo vệ tác quyền số',
        'Nhận xu donate trực tiếp từ cộng đồng người nghe trung thành'
      ],
      demoKey: 'studio_demo',
    },
    {
      id: 'finance' as EcosystemMode,
      name: 'Haevy Finance',
      category: 'utility',
      categoryName: 'Quản lý & Tiện ích',
      icon: Wallet,
      color: 'from-emerald-500 to-green-600',
      glow: 'border-emerald-500/30 hover:border-emerald-400/60',
      badge: '1 Chạm & 6 Hũ Ngân Sách',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      tagline: 'Quản lý tài chính thông minh, ghi chép 1 chạm & báo cáo 6 hũ chi tiêu.',
      highlights: [
        'Ghi chép thu chi nhanh chóng chỉ trong 3 giây',
        'Phân bổ ngân sách khoa học (Hũ thiết yếu, đầu tư, tiết kiệm, học tập...)',
        'Biểu đồ trực quan và bảo mật dữ liệu tuyệt đối'
      ],
      demoKey: 'finance_demo',
    },
    {
      id: 'couple' as EcosystemMode,
      name: 'I Love Haevy',
      category: 'social',
      categoryName: 'Lãng mạn Cặp đôi',
      icon: Heart,
      color: 'from-rose-500 to-red-600',
      glow: 'border-rose-500/30 hover:border-rose-400/60',
      badge: 'Nhật Ký & Chu Kỳ',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      tagline: 'Nhật ký tình yêu chung, theo dõi chu kỳ bạn gái & đố vui ngày kỷ niệm.',
      highlights: [
        'Nhật ký đôi có mã ghép cặp bảo vệ riêng tư',
        'Theo dõi chu kỳ & lời nhắn ngọt ngào mỗi ngày',
        'Đố vui ngày kỷ niệm & hộp thư thoại lãng mạn'
      ],
      demoKey: 'couple_demo',
    },
    {
      id: 'family_tree' as EcosystemMode,
      name: 'Haevy Family Tree',
      category: 'social',
      categoryName: 'Gia Phả & Dòng Tộc',
      icon: GitFork,
      color: 'from-amber-600 via-yellow-600 to-amber-700',
      glow: 'border-amber-500/30 hover:border-amber-400/60',
      badge: 'Cây Phả Hệ & Lịch Giỗ 👑',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      tagline: 'Sơ đồ cây tương tác O(1), hồ sơ sắc phong, lịch giỗ Âm-Dương & hòm thư con cháu đóng góp.',
      highlights: [
        'Sơ đồ phả hệ cây tương tác phóng to thu nhỏ & Lọc theo đời/thế hệ',
        'Lịch giỗ chạp Âm-Dương tự động tính toán & Đếm ngược ngày giỗ',
        'Phân quyền Trưởng tộc (Admin) bảo mật & Hòm thư con cháu đóng góp ý kiến'
      ],
      demoKey: 'family_tree_demo',
    },
    {
      id: 'edu' as EcosystemMode,
      name: 'Haevy Edu',
      category: 'utility',
      categoryName: 'Học tập & Nghiên cứu',
      icon: GraduationCap,
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      glow: 'border-emerald-500/30 hover:border-emerald-400/60',
      badge: 'STEM Virtual Labs & AI Gia Sư 🎓',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      tagline: 'Phòng thí nghiệm ảo STEM (Vật lý, Hóa học, Sinh học), AI đọc tài liệu & Gia sư First Principles.',
      highlights: [
        'AI Gia Sư First Principles & Socratic: Hiểu sâu bản chất logic, phản xạ phản biện',
        'Phòng Lab ảo HTML5 Canvas tương tác: Con lắc đơn, mạch điện, chuẩn độ axit bazơ',
        'Đọc trích xuất tài liệu, tóm tắt cô đọng & thiết lập lộ trình học cá nhân hóa'
      ],
      demoKey: 'edu_demo',
    }
  ];

  const filteredModes = MODES_DATA.filter(item => {
    const matchCategory = allModesFilter === 'all' || item.category === allModesFilter;
    const matchSearch = !allModesSearch || 
      item.name.toLowerCase().includes(allModesSearch.toLowerCase()) ||
      item.tagline.toLowerCase().includes(allModesSearch.toLowerCase()) ||
      item.badge.toLowerCase().includes(allModesSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-zinc-950 border border-amber-500/40 shadow-2xl overflow-hidden animate-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-400/10">
              <LayoutGrid size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  BẢNG THÔNG TIN TẤT CẢ CÁC CHẾ ĐỘ HAEVY
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 hidden sm:inline">
                  Hệ Sinh Thái Toàn Năng
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Hệ sinh thái công nghệ Haevy: Tâm Linh Tarot 3D, Tử Vi 2026, Sáng tạo 3D AR, Âm thanh Hi-Fi, Kết nối đôi lứa & Trợ lý AI
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng bảng thông tin"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900/60 border-b border-zinc-800/60 text-center shrink-0">
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Tổng phân hệ</div>
            <div className="text-xs sm:text-sm font-black text-amber-400">Đa Trải Nghiệm Độc Bản</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Tài khoản & Dữ liệu</div>
            <div className="text-xs sm:text-sm font-black text-cyan-400">1 Haevy ID Duy Nhất</div>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Đồng bộ Cloud</div>
            <div className="text-xs sm:text-sm font-black text-emerald-400">Thời Gian Thực 100%</div>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-b border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'spiritual', label: '🔮 Tâm linh & Tử vi' },
              { id: 'audio', label: '🎧 Âm thanh' },
              { id: 'creative', label: '🎨 Sáng tạo & 3D' },
              { id: 'social', label: '👥 Kết nối & Đôi lứa' },
              { id: 'utility', label: '⚙️ Quản trị & Tiện ích' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.selection();
                  setAllModesFilter(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  allModesFilter === tab.id
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm chế độ hoặc tính năng..."
              value={allModesSearch}
              onChange={(e) => setAllModesSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            {allModesSearch && (
              <button 
                onClick={() => {
                  haptics.light();
                  setAllModesSearch('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Modes Cards Grid (Scrollable Body) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[58vh] space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredModes.map((mode) => {
              const IconComp = mode.icon;
              return (
                <div
                  key={mode.id}
                  className={`p-4 rounded-2xl bg-zinc-900/90 border ${mode.glow} transition-all flex flex-col justify-between hover:bg-zinc-900 group`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                          <IconComp size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                            {mode.name}
                          </h3>
                          <span className="text-[10px] text-zinc-400">
                            {mode.categoryName}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${mode.badgeBg}`}>
                        {mode.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                      {mode.tagline}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {mode.highlights.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                          <Check size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        haptics.medium();
                        onClose();
                        if (onSelectDemoModal) {
                          onSelectDemoModal(mode.demoKey);
                        } else if (onSelectMode) {
                          onSelectMode(mode.id);
                        }
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      title="Xem giới thiệu phân hệ"
                    >
                      <Eye size={13} className="text-amber-400" />
                      <span>Xem Demo</span>
                    </button>
                    <button
                      onClick={() => {
                        haptics.modeSwitch();
                        onClose();
                        if (onSelectMode) {
                          onSelectMode(mode.id);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                    >
                      <span>Vào Sử Dụng</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
