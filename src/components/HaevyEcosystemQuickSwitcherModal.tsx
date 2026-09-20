import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  BookOpen,
  History,
  Command,
  Radio,
  ExternalLink,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../types';
import { ALL_ECOSYSTEM_MODES, EcosystemModeConfig, getEcosystemModeConfig } from '../data/ecosystemModes';
import { switchEcosystemMode, getPreviousEcosystemMode } from '../services/modeSyncService';
import { useModeBadges } from '../context/ModeBadgeContext';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';

export const MODE_HIGHLIGHTS: Partial<Record<EcosystemMode, string[]>> = {
  portal: [
    'Cổng trung tâm kết nối 13 phân hệ đa nhiệm trong vũ trụ Haevy',
    'Nhận thưởng 500 Xu tân thủ, điểm danh hàng ngày & quay số may mắn',
    'Bảng tin sự kiện đại lễ, vinh danh thành viên & cập nhật phân hệ mới'
  ],
  haevy_ai: [
    'Trợ lý toàn năng hỗ trợ mọi phân hệ: Audio, Space 3D AR, Games, Finance, Couple...',
    'Tâm sự tri kỷ, xoa dịu cảm xúc, tư vấn tâm lý và gợi ý âm nhạc phù hợp tâm trạng',
    'Nắm vững dữ liệu hệ sinh thái, 7 phong cách thưởng sự kiện 3D và bảo mật 6 lớp'
  ],
  audio: [
    'Hàng ngàn giờ truyện audio: Kiếm hiệp, Tiên hiệp, Ngôn tình, Trinh thám Lossless',
    'Sóng não Delta (0.5 - 4Hz) thư giãn sâu, Equalizer 10 dải tần số chuẩn phòng thu',
    'Hẹn giờ tự động tắt nhạc thông minh, đánh dấu Bookmark mốc bài hát & lưu vị trí'
  ],
  spiritual: [
    'Bộ 78 lá bài Tarot 3D Rider-Waite với nhiều kiểu trải bài & AI Luận giải chuyên sâu',
    'Lập lá số Tử Vi 12 cung chi tiết, Can Chi ngũ hành & Sao chiếu mệnh năm 2026 (Bính Ngọ)',
    'Khám phá 12 Cung Hoàng Đạo, bản đồ sao Natal Chart & Tần số chữa lành Solfeggio 528Hz'
  ],
  family_tree: [
    'Sơ đồ phả hệ cây tương tác phóng to thu nhỏ & Lọc theo đời/thế hệ O(1)',
    'Lịch giỗ chạp Âm-Dương tự động tính toán & Đếm ngược ngày giỗ tộc họ',
    'Phân quyền Trưởng tộc bảo mật, lưu trữ sắc phong, học vị & hòm thư con cháu đóng góp'
  ],
  finance: [
    'Ghi chép thu chi siêu tốc chỉ trong 3 giây với phân loại thông minh',
    'Quản lý 6 hũ tài chính (Thiết yếu, Giáo dục, Tự do tài chính, Tiết kiệm, Hưởng thụ, Cho đi)',
    'Quy tắc ngân sách 50/30/20, đa ví tài khoản, biểu đồ chi tiêu trực quan & bảo mật'
  ],
  couple: [
    'Đồng hồ đếm ngày yêu chính xác từng giây & danh hiệu tình yêu ngọt ngào',
    'Nhật ký hẹn hò có mã ghép đôi riêng tư, theo dõi chu kỳ & lời nhắn yêu thương mỗi ngày',
    'Nghe nhạc đôi đồng bộ thời gian thực, nuôi heo đất tiết kiệm chung cho tương lai'
  ],
  messages: [
    'Nhắn tin mã hóa an toàn với độ trễ phản hồi cực thấp',
    'Gọi thoại trực tiếp voice/video không giới hạn thời lượng & ghi âm ghi chú HD',
    'Trợ lý Haevy AI đọc hiểu ngữ cảnh và hỗ trợ trả lời tin nhắn thông minh'
  ],
  space: [
    'Vẽ 3D tự do trong không gian đa chiều, tách nét 100%, xoay camera 360 độ',
    'Điều khiển cử chỉ ngón tay Pinch không chạm qua Camera AI webcam',
    'Tương tác cùng linh vật Haevy Son 3D sống động, hiệu ứng ánh sáng & âm thanh vật lý'
  ],
  studio: [
    'Công nghệ AI Voice TTS đa thanh âm truyền cảm, chuyển văn bản thành podcast tự động',
    'Hệ thống eKYC định danh tác giả, chống đạo văn & bảo vệ tác quyền số',
    'Nhận xu donate trực tiếp từ cộng đồng người nghe trung thành và bảng xếp hạng tác giả'
  ],
  edu: [
    'AI Gia Sư First Principles & Socratic: Hiểu sâu bản chất logic, phản xạ phản biện',
    'Phòng Lab ảo HTML5 Canvas tương tác: Con lắc đơn, mạch điện, chuẩn độ axit bazơ',
    'Đọc trích xuất tài liệu, tóm tắt cô đọng & thiết lập lộ trình học cá nhân hóa'
  ],
  games: [
    'Đấu trí trí tuệ cùng loạt mini game giải trí: Cờ vua, cờ caro, 2048, đố vui nhận xu',
    'Bảng xếp hạng game thủ tuần, săn huy hiệu danh vọng & nhận thưởng xu hệ sinh thái',
    'Chế độ chơi đơn rèn luyện tư duy hoặc thách đấu bạn bè trong phòng đấu'
  ],
  admin: [
    'Bảng điều khiển quản trị viên tối cao: Kiểm duyệt audio, giám sát giao dịch xu',
    'Hệ thống khóa đa tầng Admin Chain Lock bảo mật tuyệt đối',
    'Thống kê người dùng thời gian thực, quản lý quyền hạn & cấu hình hệ thống'
  ],
  maps: [
    'Định vị thời gian thực kết nối vị trí bạn đời, người yêu và gia đình',
    'Theo dõi dung lượng pin, tốc độ di chuyển, khoảng cách và thời gian đến nơi',
    'Gửi nhịp tim rung chuông yêu thương, quản lý vùng an toàn Geofencing và SOS khẩn cấp'
  ]
};

export interface HaevyEcosystemQuickSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode?: EcosystemMode;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
  onSelectDemoModal?: (demoKey: string) => void;
  onClaimGift?: () => void;
  initialViewMode?: 'quick' | 'detailed';
}

export function HaevyEcosystemQuickSwitcherModal({
  isOpen,
  onClose,
  currentMode = 'portal',
  onSelectMode,
  onSelectDemoModal,
  onClaimGift,
  initialViewMode = 'quick'
}: HaevyEcosystemQuickSwitcherModalProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { getBadgeForMode } = useModeBadges();
  const [viewMode, setViewMode] = useState<'quick' | 'detailed'>(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedHighlights, setExpandedHighlights] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMode = getPreviousEcosystemMode();

  // Reset & focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Sync initial view mode when opened
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialViewMode);
    }
  }, [isOpen, initialViewMode]);

  // Keyboard navigation: Escape to close, number keys 1-9 to select top modes
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter modes based on search query, category, and admin permissions
  const filteredModes = useMemo(() => {
    return ALL_ECOSYSTEM_MODES.filter((m) => {
      // Hide admin mode if not authorized
      if (m.id === 'admin' && !isAdmin && !isSuperAdmin) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'spiritual' && m.category !== 'spiritual') return false;
        if (selectedCategory === 'family' && m.category !== 'family') return false;
        if (selectedCategory === 'finance' && m.category !== 'finance') return false;
        if (selectedCategory === 'ai_creative' && m.category !== 'ai' && m.category !== 'creative') return false;
        if (selectedCategory === 'audio_studio' && m.category !== 'audio' && m.id !== 'studio') return false;
        if (selectedCategory === 'social_couple' && m.category !== 'social') return false;
        if (selectedCategory === 'study_games' && m.category !== 'study' && m.category !== 'games' && m.id !== 'edu') return false;
        if (selectedCategory === 'admin' && m.id !== 'admin') return false;
      }

      // Filter by search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const highlights = MODE_HIGHLIGHTS[m.id] || [];
      return (
        m.name.toLowerCase().includes(q) ||
        m.shortName.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.englishName.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q)) ||
        highlights.some((h) => h.toLowerCase().includes(q)) ||
        (m.subPages && m.subPages.some((s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, selectedCategory, isAdmin, isSuperAdmin]);

  if (!isOpen) return null;

  const handleSelect = (modeId: EcosystemMode, targetTab?: ActiveTab | string) => {
    haptics.selection();
    switchEcosystemMode(modeId, targetTab, 'quick_switcher');
    if (onSelectMode) {
      onSelectMode(modeId, targetTab);
    }
    onClose();
  };

  const toggleHighlights = (modeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.light();
    setExpandedHighlights((prev) => ({
      ...prev,
      [modeId]: !prev[modeId]
    }));
  };

  const currentModeConfig = getEcosystemModeConfig(currentMode);
  const CurrentIcon = currentModeConfig.icon;

  const categories = [
    { id: 'all', label: 'Tất cả (13)' },
    { id: 'spiritual', label: 'Tâm Linh & Tử Vi 🔮' },
    { id: 'family', label: 'Gia Phả Dòng Tộc 👑' },
    { id: 'finance', label: 'Thu Chi 6 Hũ 💰' },
    { id: 'ai_creative', label: 'AI & Sáng Tạo 🧠' },
    { id: 'audio_studio', label: 'Âm Nhạc & Studio 🎵' },
    { id: 'social_couple', label: 'Kết Nối & Cặp Đôi 💕' },
    { id: 'study_games', label: 'Học Tập & Games 🎮' },
    ...(isAdmin || isSuperAdmin ? [{ id: 'admin', label: 'Quản Trị Hệ Thống 🛡️' }] : [])
  ];

  return (
    <div
      id="unified-ecosystem-modal-overlay"
      className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="unified-ecosystem-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/95 via-zinc-950 to-zinc-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr ${currentModeConfig.color} p-0.5 shrink-0 shadow-lg shadow-amber-500/10`}
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <CurrentIcon size={20} className={currentModeConfig.accentColor} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  Đồng Bộ Chuyển Chế Độ
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                  {ALL_ECOSYSTEM_MODES.length} Chế Độ
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                <span>Đang hoạt động:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {currentModeConfig.name}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 hidden sm:inline">Phím tắt Alt + M</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* View Mode Toggle: Quick vs Detailed */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setViewMode('quick');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'quick'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Xem lưới chuyển nhanh với phím tắt và lối tắt"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Chuyển nhanh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setViewMode('detailed');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'detailed'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Xem giới thiệu chi tiết 3 tính năng nổi bật của từng chế độ"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Chi tiết</span>
              </button>
            </div>

            {/* Quick return button */}
            {previousMode && previousMode !== currentMode && (
              <button
                type="button"
                onClick={() => handleSelect(previousMode)}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title={`Quay lại: ${getEcosystemModeConfig(previousMode).name}`}
              >
                <History size={13} className="text-amber-400" />
                <span>Quay lại</span>
              </button>
            )}

            {/* Claim gift button if provided */}
            {onClaimGift && (
              <button
                type="button"
                onClick={() => {
                  haptics.success();
                  onClaimGift();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black transition-all hover:brightness-110 shadow-md cursor-pointer"
                title="Nhận quà tặng đại lễ 500 xu tân thủ"
              >
                <Gift size={13} />
                <span className="hidden sm:inline">Nhận 500 Xu</span>
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
              title="Đóng bảng chuyển chế độ (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chế độ (Tarot, Tử vi, Gia phả, Thu chi, AI, Audio, Games, Cặp đôi)..."
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area: Quick Grid vs Detailed Showcase */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {viewMode === 'quick' ? (
            /* ========================================================================= */
            /* VIEW 1: COMPACT QUICK GRID (FAST JUMPING & SUBPAGES)                      */
            /* ========================================================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredModes.map((mode) => {
                const isCurrent = mode.id === currentMode;
                const Icon = mode.icon;
                const badgeCount = getBadgeForMode(mode.id);
                const highlights = MODE_HIGHLIGHTS[mode.id] || [];
                const isExpanded = expandedHighlights[mode.id];

                return (
                  <div
                    key={mode.id}
                    id={`quick-switcher-card-${mode.id}`}
                    onClick={() => handleSelect(mode.id)}
                    className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden text-left select-none ${
                      isCurrent
                        ? 'bg-zinc-900/95 border-amber-400/90 ring-1 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${mode.color} p-0.5 shrink-0 shadow-md`}
                          >
                            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                              <Icon size={18} className={mode.accentColor} />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors tracking-tight truncate">
                                {mode.name}
                              </h4>
                              {isCurrent && (
                                <span
                                  className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"
                                  title="Đang mở"
                                />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium truncate block">
                              {mode.categoryLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isCurrent ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-black border border-amber-300">
                              Đang mở
                            </span>
                          ) : (
                            <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                              {mode.shortcut}
                            </kbd>
                          )}

                          {badgeCount > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-rose-500 text-white animate-pulse">
                              {badgeCount} mới
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tagline */}
                      <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed mb-2.5">
                        {mode.tagline}
                      </p>

                      {/* Inline Highlights Dropdown Toggle */}
                      {highlights.length > 0 && (
                        <div className="mb-2.5">
                          <button
                            type="button"
                            onClick={(e) => toggleHighlights(mode.id, e)}
                            className="text-[10px] font-semibold text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Thu gọn 3 điểm nổi bật' : 'Xem 3 điểm nổi bật'}</span>
                            <ChevronDown
                              size={11}
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 animate-in fade-in duration-150">
                              {highlights.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[10px] text-zinc-300 leading-relaxed">
                                  <Check size={11} className="text-amber-400 shrink-0 mt-0.5" />
                                  <span>{point}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Subpages Quick Jump or Enter Button */}
                    <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-2 mt-auto">
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                        {mode.subPages?.slice(0, 2).map((sub) => (
                          <button
                            key={sub.tabKey + sub.title}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(mode.id, sub.tabKey);
                            }}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                            title={sub.desc}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelect(mode.id)}
                        className={`text-[11px] font-bold flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg transition-all ${
                          isCurrent
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-zinc-300 group-hover:text-white group-hover:bg-zinc-800'
                        }`}
                      >
                        <span>{isCurrent ? 'Đang xem' : 'Mở chế độ'}</span>
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: DETAILED SHOWCASE (3 BULLETS, RICH TAGLINES, DEMO ACTIONS)       */
            /* ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredModes.map((mode) => {
                const isCurrent = mode.id === currentMode;
                const Icon = mode.icon;
                const badgeCount = getBadgeForMode(mode.id);
                const highlights = MODE_HIGHLIGHTS[mode.id] || [];

                return (
                  <div
                    key={mode.id}
                    id={`detailed-switcher-card-${mode.id}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-zinc-900/90 border-amber-400/90 ring-1 ring-amber-400/40 shadow-xl shadow-amber-500/10'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700 shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top banner */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${mode.color} p-0.5 shrink-0 shadow-lg`}
                          >
                            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                              <Icon size={20} className={mode.accentColor} />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white tracking-tight truncate">
                                {mode.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-black border border-amber-300">
                                  Đang mở
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              {mode.categoryLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {badgeCount > 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white animate-pulse">
                              {badgeCount} mới
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mode.badgeColor}`}>
                            {mode.badge}
                          </span>
                        </div>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed mb-3">
                        {mode.tagline}
                      </p>

                      {/* 3 Key Highlights */}
                      <div className="space-y-2 mb-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Tính Năng Trọng Tâm</span>
                        </div>
                        {highlights.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                            <Check size={13} className="text-amber-400 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 mt-auto">
                      {/* Subpages shortcuts */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                        {mode.subPages?.map((sub) => (
                          <button
                            key={sub.tabKey + sub.title}
                            type="button"
                            onClick={() => handleSelect(mode.id, sub.tabKey)}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                            title={sub.desc}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        {onSelectDemoModal && (
                          <button
                            type="button"
                            onClick={() => {
                              haptics.light();
                              onSelectDemoModal(`${mode.id}_demo`);
                            }}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            Demo
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelect(mode.id)}
                          className={`text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                          }`}
                        >
                          <span>{isCurrent ? 'Tiếp tục dùng' : 'Chuyển Chế Độ'}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredModes.length === 0 && (
            <div className="py-16 text-center text-zinc-400">
              <Search size={36} className="mx-auto mb-2 text-zinc-600 opacity-50" />
              <p className="text-sm font-semibold text-zinc-300">Không tìm thấy chế độ nào phù hợp</p>
              <p className="text-xs text-zinc-500 mt-1">
                Vui lòng thử từ khóa khác như "Tarot", "Gia phả", "AI", "Audio", "Thu chi", "Cặp đôi"...
              </p>
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <div className="p-3 sm:p-3.5 border-t border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Sparkles size={12} />
              Đồng bộ 13 chế độ toàn hệ sinh thái
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="hidden sm:inline text-zinc-500">Phím tắt nhanh:</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-300">
              Alt + M
            </kbd>
            <span className="text-zinc-700">•</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px] text-zinc-300">
              ESC đóng
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HaevyEcosystemQuickSwitcherModal;
