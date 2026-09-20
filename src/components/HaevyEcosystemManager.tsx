import React, { useState } from 'react';
import {
  TreePine,
  Headphones,
  Heart,
  Wallet,
  MessageSquare,
  Crown,
  Trophy,
  Sparkles,
  BookOpen,
  Compass,
  ShieldCheck,
  Users,
  ChevronRight,
  Plus,
  RotateCcw,
  Zap,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  X,
  Play,
  GraduationCap
} from 'lucide-react';
import {
  HAEVY_ECOSYSTEM_MODES_INFO,
  EcosystemModeInfo,
  EcosystemLiveSnapshot
} from '../utils/haevyAIEcosystemEngine';

interface HaevyEcosystemManagerProps {
  snapshot: EcosystemLiveSnapshot;
  onSelectMode?: (modeId: string) => void;
  onSendPrompt?: (prompt: string) => void;
  onOpenQuickAdd: (type: 'family' | 'track' | 'memory' | 'friend') => void;
  onUndo: () => void;
}

export const HaevyEcosystemManager: React.FC<HaevyEcosystemManagerProps> = ({
  snapshot,
  onSelectMode,
  onSendPrompt,
  onOpenQuickAdd,
  onUndo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [inspectMode, setInspectMode] = useState<EcosystemModeInfo | null>(null);

  const categories = ['Tất cả', 'Giải Trí & Âm Nhạc', 'Văn Hóa & Dòng Họ', 'Tài Chính & Két Sắt', 'Tình Cảm & Kết Nối', 'Học Tập & Tri Thức'];

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'family_tree': return TreePine;
      case 'audio': return Headphones;
      case 'couple': return Heart;
      case 'finance': return Wallet;
      case 'messages': return MessageSquare;
      case 'vip': return Crown;
      case 'game_arena': return Trophy;
      case 'zen': return Sparkles;
      case 'study': return BookOpen;
      case 'edu': return GraduationCap;
      case 'account': return ShieldCheck;
      case 'community': return Users;
      default: return Compass;
    }
  };

  const filteredModes = HAEVY_ECOSYSTEM_MODES_INFO.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Tất cả' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 space-y-6 max-w-6xl mx-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
      
      {/* 1. TOP LIVE ECOSYSTEM SNAPSHOT METRICS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Trung Tâm Điều Hành 12 Chế Độ Hệ Sinh Thái
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Haevy AI nắm quyền tự động thêm/xoá/đồng bộ thời gian thực trên toàn bộ ứng dụng
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onUndo}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="Hoàn tác thao tác thêm/xoá gần nhất"
              >
                <RotateCcw size={13} className="text-amber-400" />
                <span>Hoàn Tác Lệnh Trước</span>
              </button>
            </div>
          </div>

          {/* 7 Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-400">
                <TreePine size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Gia Phả</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white">{snapshot.familyTreeCount}</div>
                <div className="text-[10px] text-zinc-400">Thành viên dòng họ</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-400">
                <Headphones size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Audio</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white">{snapshot.tracksCount}</div>
                <div className="text-[10px] text-zinc-400">Bài hát & podcast</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-400">
                <Heart size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Cặp Đôi</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white">Ngày {snapshot.coupleDaysCount}</div>
                <div className="text-[10px] text-zinc-400">Bên nhau ngọt ngào</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400">
                <Wallet size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">6 Hũ</span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-black text-emerald-300 truncate">
                  {(snapshot.financeTotalBalance / 1000000).toFixed(1)}Tr đ
                </div>
                <div className="text-[10px] text-zinc-400">Tổng tài sản 6 hũ</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-400">
                <MessageSquare size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Tin Nhắn</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white">{snapshot.messagesCount}</div>
                <div className="text-[10px] text-zinc-400">Tin nhắn & đàm thoại</div>
              </div>
            </div>

            {/* Edu STEM Metric */}
            <div 
              onClick={() => onSelectMode && onSelectMode('edu')}
              className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex flex-col justify-between cursor-pointer hover:border-teal-400 transition"
              title="Nhấn để mở Haevy Edu"
            >
              <div className="flex items-center justify-between text-teal-400">
                <GraduationCap size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">Edu STEM</span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-black text-teal-300">
                  {snapshot.eduStreakDays || 1}d • {snapshot.eduTotalXp || 120} XP
                </div>
                <div className="text-[10px] text-zinc-400 truncate">{snapshot.eduNotesCount || 0} ghi chép • Casio</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] uppercase tracking-wider font-bold">An Toàn</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white">100%</div>
                <div className="text-[10px] text-zinc-400">Mã hóa đa tầng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INSTANT ADD SHORTCUTS TOOLBAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" />
            Tác Vụ Nhanh (Thêm Trực Tiếp Không Cần Soạn Lệnh)
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button
            onClick={() => onOpenQuickAdd('family')}
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-amber-500/30 hover:border-amber-400 text-left transition group shadow-md"
          >
            <div className="flex items-center justify-between text-amber-400 mb-1.5">
              <TreePine size={18} />
              <Plus size={15} className="group-hover:rotate-90 transition-transform text-zinc-400" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
              + Thành Viên Gia Phả
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Thêm họ tên, đời, chi, năm sinh</div>
          </button>

          <button
            onClick={() => onOpenQuickAdd('track')}
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-purple-500/30 hover:border-purple-400 text-left transition group shadow-md"
          >
            <div className="flex items-center justify-between text-purple-400 mb-1.5">
              <Headphones size={18} />
              <Plus size={15} className="group-hover:rotate-90 transition-transform text-zinc-400" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
              + Bài Hát Audio
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Lossless, ca sĩ, thể loại</div>
          </button>

          <button
            onClick={() => onOpenQuickAdd('memory')}
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-pink-500/30 hover:border-pink-400 text-left transition group shadow-md"
          >
            <div className="flex items-center justify-between text-pink-400 mb-1.5">
              <Heart size={18} />
              <Plus size={15} className="group-hover:rotate-90 transition-transform text-zinc-400" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-pink-200 transition-colors">
              + Kỷ Niệm Tình Yêu
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">I Love Haevy đếm ngày yêu</div>
          </button>

          <button
            onClick={() => onOpenQuickAdd('friend')}
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-blue-500/30 hover:border-blue-400 text-left transition group shadow-md"
          >
            <div className="flex items-center justify-between text-blue-400 mb-1.5">
              <MessageSquare size={18} />
              <Plus size={15} className="group-hover:rotate-90 transition-transform text-zinc-400" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
              + Bạn Bè Mới
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Haevy Message & kết nối tộc</div>
          </button>

          <button
            onClick={() => {
              if (onSendPrompt) {
                onSendPrompt('Lưu vào sổ tay Edu: Bản chất nguyên lý First Principles và mô phỏng thực nghiệm.');
              } else if (onSelectMode) {
                onSelectMode('edu');
              }
            }}
            className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-teal-500/30 hover:border-teal-400 text-left transition group shadow-md"
          >
            <div className="flex items-center justify-between text-teal-400 mb-1.5">
              <GraduationCap size={18} />
              <Plus size={15} className="group-hover:rotate-90 transition-transform text-zinc-400" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-teal-200 transition-colors">
              + Sổ Tay Edu STEM
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">First Principles & Casio 880</div>
          </button>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trong 12 chế độ..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 12-MODE COMPREHENSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {filteredModes.map((mode) => {
          const Icon = getModeIcon(mode.id);

          return (
            <div
              key={mode.id}
              className="p-5 rounded-3xl bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header with Icon & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mode.color} p-[1px] shadow-lg`}>
                    <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 text-[10px] font-bold border border-zinc-700/50">
                      {mode.badge}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {mode.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {mode.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {mode.description}
                </p>

                {/* Capabilities list */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Khả năng AI tự động:
                  </div>
                  {mode.capabilities.slice(0, 2).map((cap, cIdx) => (
                    <div key={cIdx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                <button
                  onClick={() => onSelectMode && onSelectMode(mode.id)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-purple-600 text-zinc-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <span>Mở Chế Độ</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  onClick={() => setInspectMode(mode)}
                  className="px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50 text-xs font-medium transition"
                  title="Xem chi tiết các lệnh mẫu"
                >
                  Chi Tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODE DETAIL INSPECTION MODAL */}
      {inspectMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${inspectMode.color} text-white`}>
                  {React.createElement(getModeIcon(inspectMode.id), { size: 20 })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectMode.name}</h3>
                  <span className="text-[11px] text-zinc-400">{inspectMode.tagline}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectMode(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {inspectMode.description}
            </p>

            {/* All Capabilities */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Tất cả tính năng & lệnh AI hỗ trợ:
              </h4>
              <div className="space-y-1">
                {inspectMode.capabilities.map((c, i) => (
                  <div key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Queries with 1-click execution */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                Bấm vào để thực thi lệnh AI ngay:
              </h4>
              <div className="space-y-1.5">
                {inspectMode.sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInspectMode(null);
                      onSendPrompt && onSendPrompt(q);
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-800/80 hover:bg-purple-600/30 text-left text-xs text-zinc-200 hover:text-white border border-zinc-700/50 hover:border-purple-500/50 flex items-center justify-between transition group"
                  >
                    <span>"{q}"</span>
                    <Play size={12} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const targetId = inspectMode.id;
                  setInspectMode(null);
                  onSelectMode && onSelectMode(targetId);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
              >
                <span>Chuyển Sang Chế Độ Này</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
