import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  FamilyTreeMember as FamilyMember, 
  FamilyRole 
} from '../../types';
import { 
  getMemberAgeInfo, 
  getMemberHometown 
} from '../../utils/familyTreeUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Users, 
  Search, 
  Plus, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Filter, 
  Crown, 
  Info,
  GitFork,
  Layers,
  ListFilter,
  Eye,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronUp,
  Minus,
  Cake,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FamilyEvent } from '../../types';
import { FamilyCalendarIntegration } from './FamilyCalendarIntegration';
import { getCombinedCalendarItems } from '../../utils/familyCalendarUtils';

interface InteractiveTreeViewProps {
  members: FamilyMember[];
  events?: FamilyEvent[];
  userRole: FamilyRole;
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branches: string[];
  onOpenMemberProfile: (member: FamilyMember) => void;
  onAddNewMemberUnder: (parentMember: FamilyMember) => void;
  onAddSpouseFor: (member: FamilyMember) => void;
  onOpenProposalFor: (member: FamilyMember) => void;
  onAddNewMember?: () => void;
  onAddEvent?: (event: FamilyEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const InteractiveTreeView: React.FC<InteractiveTreeViewProps> = ({
  members,
  events = [],
  userRole,
  selectedBranch,
  onSelectBranch,
  branches,
  onOpenMemberProfile,
  onAddNewMemberUnder,
  onAddSpouseFor,
  onOpenProposalFor,
  onAddNewMember,
  onAddEvent,
  onDeleteEvent,
}) => {
  // Trạng thái mở Lịch sự kiện & sinh nhật trực tiếp trên sơ đồ gia phả
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Tính toán các sự kiện và sinh nhật sắp tới
  const calendarItems = useMemo(() => {
    return getCombinedCalendarItems(events || [], members, new Date());
  }, [events, members]);

  const nextUpcomingItem = useMemo(() => {
    return calendarItems.length > 0 ? calendarItems[0] : null;
  }, [calendarItems]);
  // Sơ đồ view mode: 'tree' (Sơ đồ cây nối cành) | 'ladder' (Sơ đồ phân tầng các đời) | 'compact' (Sổ gia phả giản lược)
  const [viewMode, setViewMode] = useState<'tree' | 'ladder' | 'compact'>('tree');
  
  // Chế độ tinh gọn (Ẩn bớt thông tin, chỉ hiện Tên, Tuổi và Quê quán)
  // Mặc định BẬT để đáp ứng yêu cầu người dùng
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);

  // Kích thước thẻ: 'compact' (Nhỏ tổng quát) | 'normal' (Kích thước tiêu chuẩn)
  // Mặc định 'compact' để người dùng nhìn bao quát toàn bộ sơ đồ gia phả
  const [cardDensity, setCardDensity] = useState<'compact' | 'normal'>('compact');

  // Lọc theo thế hệ (Đời 1, Đời 2,...) hoặc tất cả
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');

  // Zoom và Pan Canvas - Mặc định 0.75 (75%) để nhìn tổng quát toàn bộ sơ đồ
  const [zoom, setZoom] = useState<number>(0.75);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Tìm kiếm & Tiêu điểm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);

  // Trạng thái thu gọn/mở rộng nhánh con
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Lọc theo Chi Phái
  const filteredMembers = useMemo(() => {
    let list = members;
    if (selectedBranch !== 'all') {
      list = list.filter(m => m.branch === selectedBranch || m.branch === 'Toàn tộc');
    }
    if (selectedGen !== 'all') {
      list = list.filter(m => m.generation === selectedGen);
    }
    return list;
  }, [members, selectedBranch, selectedGen]);

  // Danh sách các thế hệ có trong gia phả
  const availableGenerations = useMemo(() => {
    const gens = Array.from(new Set(members.map(m => m.generation || 1))).sort((a, b) => a - b);
    return gens;
  }, [members]);

  // Phân nhóm theo đời (Generation Groups cho ladder và compact view)
  const generationGroups = useMemo(() => {
    const groups: Record<number, FamilyMember[]> = {};
    filteredMembers.forEach(m => {
      const gen = m.generation || 1;
      if (!groups[gen]) groups[gen] = [];
      groups[gen].push(m);
    });
    return Object.entries(groups)
      .map(([genStr, list]) => ({
        generation: parseInt(genStr, 10),
        members: list.sort((a, b) => (a.orderInFamily || 1) - (b.orderInFamily || 1))
      }))
      .sort((a, b) => a.generation - b.generation);
  }, [filteredMembers]);

  // Tiêu đề đời trang trọng truyền thống
  const getGenerationTitle = (gen: number) => {
    switch (gen) {
      case 1:
        return 'ĐỜI I: KHỞI TỔ (Thủy Tổ Khai Sáng)';
      case 2:
        return 'ĐỜI II: CAO TỔ (Thế Hệ Tiên Phong Khai Khẩn)';
      case 3:
        return 'ĐỜI III: TẰNG TỔ (Kế Nghiệp Tông Môn Đỗ Đạt)';
      case 4:
        return 'ĐỜI IV: CAO TẰNG (Hậu Duệ Lập Nghiệp Thời Đại Mới)';
      case 5:
        return 'ĐỜI V: HẬU DUỆ MĂNG NON (Kế Thừa Gia Phong)';
      default:
        return `ĐỜI THỨ ${gen} (Hậu Duệ Nối Dõi)`;
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom(prev => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Kéo thả canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.member-card-interactive') || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Tự động tìm và định vị
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFocusedMemberId(null);
      return;
    }
    const q = searchQuery.toLowerCase();
    const found = members.find(m => 
      m.fullName.toLowerCase().includes(q) || 
      (m.alternativeName && m.alternativeName.toLowerCase().includes(q))
    );
    if (found) {
      setFocusedMemberId(found.id);
    } else {
      setFocusedMemberId(null);
    }
  }, [searchQuery, members]);

  // Tìm tên cha / mẹ
  const getParentNames = (m: FamilyMember) => {
    const parentList: string[] = [];
    if (m.fatherId) {
      const f = members.find(x => x.id === m.fatherId);
      if (f) parentList.push(`Cụ ${f.fullName}`);
    }
    if (m.motherId) {
      const mo = members.find(x => x.id === m.motherId);
      if (mo) parentList.push(`Bà ${mo.fullName}`);
    }
    return parentList.length > 0 ? parentList.join(' & ') : null;
  };

  // Tìm phối ngẫu
  const getSpouse = (m: FamilyMember) => {
    if (!m.spouseIds || m.spouseIds.length === 0) return null;
    return members.find(x => m.spouseIds?.includes(x.id)) || null;
  };

  // Map tất cả các con của một thành viên
  const getChildrenOf = (m: FamilyMember) => {
    const childList = members.filter(child => child.fatherId === m.id || child.motherId === m.id);
    // Sắp xếp theo thứ tự con trưởng -> con thứ
    return childList.sort((a, b) => (a.orderInFamily || 1) - (b.orderInFamily || 1));
  };

  // Khi chọn một thành viên từ Lịch Sự Kiện & Sinh Nhật
  const handleCalendarSelectMember = (targetMember: FamilyMember) => {
    setFocusedMemberId(targetMember.id);
    setIsCalendarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`card-member-${targetMember.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 250);
  };

  // Thành viên gốc đời 1 (Root Ancestors)
  const rootMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    const roots = members.filter(m => (m.generation === 1 || !m.fatherId) && m.gender === 'male');
    if (roots.length > 0) return roots;
    const anyGen1 = members.filter(m => m.generation === 1 || !m.fatherId);
    if (anyGen1.length > 0) return anyGen1;
    return members.length > 0 ? [members[0]] : [];
  }, [members]);

  // --------------------------------------------------------------------------
  // HÀM RENDER THẺ THÀNH VIÊN (CARD) VỚI 2 CHẾ ĐỘ: TINH GỌN HOẶC CHI TIẾT
  // --------------------------------------------------------------------------
  const renderMemberCard = (member: FamilyMember, isSpouseCard = false) => {
    const isFocused = focusedMemberId === member.id;
    const isMale = member.gender === 'male';
    const ageInfo = getMemberAgeInfo(member);
    const hometown = getMemberHometown(member);

    if (isSimpleMode) {
      // ======================================================================
      // CHẾ ĐỘ TINH GỌN (CHỈ HIỆN: TÊN • TUỔI • QUÊ QUÁN) THEO YÊU CẦU
      // ======================================================================
      const isCompact = cardDensity === 'compact';

      return (
        <div
          key={member.id}
          id={`card-member-${member.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenMemberProfile(member);
          }}
          className={`member-card-interactive group relative rounded-xl transition-all duration-200 shadow-md border cursor-pointer select-none overflow-hidden ${
            isCompact ? 'w-36 sm:w-44' : 'w-56 sm:w-60'
          } ${
            isFocused
              ? 'ring-2 ring-amber-400 bg-slate-900 border-amber-300 scale-105 z-30 shadow-amber-500/40'
              : isMale
              ? 'bg-slate-900/95 border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/25'
              : 'bg-slate-900/95 border-rose-500/50 hover:border-rose-400 hover:shadow-rose-500/25'
          }`}
          title="Nhấp để xem bảng thông tin đầy đủ"
        >
          {/* Dải màu đỉnh phân biệt Nam / Nữ */}
          <div className={`h-1 w-full ${isMale ? 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600' : 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500'}`} />

          <div className={isCompact ? 'p-2 space-y-1.5' : 'p-3 space-y-2'}>
            {/* Header: Giới tính & Trạng thái */}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              <span className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                isMale 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                <span>{isMale ? '♂' : '♀'}</span>
                <span className="truncate">{isMale ? 'Nam' : 'Nữ'}</span>
                {isSpouseCard && <span className="text-[9px] text-rose-300">• Vợ</span>}
              </span>

              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                member.isDeceased
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }`}>
                {member.isDeceased ? '🕊️ Khuất' : '🌱 Sống'}
              </span>
            </div>

            {/* 1. TÊN THÀNH VIÊN */}
            <div className="pt-0.5">
              <h4 className={`font-black text-amber-100 group-hover:text-amber-300 transition-colors leading-tight truncate ${
                isCompact ? 'text-xs sm:text-[13px]' : 'text-sm sm:text-base'
              }`}>
                {member.fullName}
              </h4>
              {!isCompact && member.alternativeName && (
                <p className="text-[11px] text-amber-300/70 italic truncate mt-0.5">
                  {member.alternativeName}
                </p>
              )}
            </div>

            {/* 2. TUỔI THỌ / TUỔI ĐỜI */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-[11px] font-semibold text-amber-300 truncate">
              <span className="text-amber-400 text-xs shrink-0">⏳</span>
              <span className="truncate">{ageInfo.display}</span>
            </div>

            {/* 3. QUÊ QUÁN */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] sm:text-[11px] text-slate-200 truncate">
              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
              <span className="truncate font-medium text-slate-100">{hometown}</span>
            </div>
          </div>
        </div>
      );
    }

    // ========================================================================
    // CHẾ ĐỘ ĐẦY ĐỦ CHI TIẾT (FULL MODE)
    // ========================================================================
    return (
      <div
        key={member.id}
        id={`card-member-${member.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenMemberProfile(member);
        }}
        className={`member-card-interactive group relative rounded-2xl p-4 transition-all duration-200 shadow-xl border cursor-pointer select-none ${
          'w-72 sm:w-80'
        } ${
          isFocused
            ? 'ring-4 ring-amber-400 bg-slate-900 border-amber-300 scale-105 z-30 shadow-amber-500/40'
            : isMale
            ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20'
            : 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/20'
        }`}
      >
        {/* Hàng trên cùng: Trạng thái & Chi phái */}
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
            member.isDeceased
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
          }`}>
            {member.isDeceased ? '🕊️ Đã Quy Tiên' : '🌱 Đang Sinh Sống'}
          </span>

          <span className="text-[10px] text-amber-300 font-mono bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/20 truncate max-w-[130px]">
            {member.branch}
          </span>
        </div>

        {/* Avatar + Tên to rõ + Tuổi & Năm */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={member.photoUrl || (isMale
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80')}
              alt={member.fullName}
              className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-md ${
                isMale ? 'border-amber-400' : 'border-rose-400'
              }`}
            />
            <span className={`absolute -bottom-1 -right-1 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold text-slate-950 shadow ${
              isMale ? 'bg-amber-400' : 'bg-rose-300'
            }`}>
              {isMale ? '♂' : '♀'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-black text-amber-100 group-hover:text-amber-300 transition-colors truncate text-sm sm:text-base">
              {member.fullName}
            </h4>
            
            {member.alternativeName && (
              <p className="text-[11px] text-amber-300/80 italic truncate">
                {member.alternativeName}
              </p>
            )}

            {/* Tuổi & Niên đại */}
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{ageInfo.display}</span>
              <span className="text-[10px] text-slate-400 font-mono">({ageInfo.yearText})</span>
            </div>

            {/* Quê quán */}
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-300 truncate">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{hometown}</span>
            </div>
          </div>
        </div>

        {/* Nghề nghiệp / Sắc phong */}
        {member.occupation && (
          <div className="mt-2.5 text-[11px] text-slate-400 line-clamp-1 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            💼 {member.occupation}
          </div>
        )}

        {/* Nút thao tác nhanh dưới thẻ */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMemberProfile(member);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-all flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Xem Hồ Sơ</span>
          </button>

          {userRole === 'admin' ? (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewMemberUnder(member);
                }}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 transition-all flex items-center gap-1"
                title="Thêm con cho người này"
              >
                <Plus className="w-3 h-3" />
                <span>+ Con</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSpouseFor(member);
                }}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-200 transition-all flex items-center gap-1"
                title="Thêm phối ngẫu"
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span>+ Vợ/Chồng</span>
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenProposalFor(member);
              }}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition-all"
            >
              ✍️ Đóng Góp
            </button>
          )}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RECURSIVE COMPONENT: CÂY HUYẾT THỐNG VỚI ĐƯỜNG NỐI CHUẨN XÁC VÀ RÕ RÀNG
  // --------------------------------------------------------------------------
  const HierarchicalFamilyNode: React.FC<{ member: FamilyMember }> = ({ member }) => {
    const spouse = getSpouse(member);
    const children = getChildrenOf(member);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodes[member.id] || false;
    const isCompact = cardDensity === 'compact';

    return (
      <div className="flex flex-col items-center">
        {/* KHỐI GIA ĐÌNH: THÀNH VIÊN CHÍNH + ĐƯỜNG KẾT NỐI VỢ CHỒNG + PHỐI NGẪU */}
        <div className="flex items-center justify-center relative">
          {/* Thẻ thành viên chính */}
          {renderMemberCard(member)}

          {/* Nếu có vợ / chồng: Đường nối hôn nhân vàng kim trang trọng */}
          {spouse && (
            <div className="flex items-center">
              {/* Đường nối ngang */}
              <div className={`${isCompact ? 'w-2.5 sm:w-3.5' : 'w-6 sm:w-10'} h-0.5 bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]`} />
              
              {/* Biểu tượng liên kết hôn phối */}
              <div 
                className={`${isCompact ? 'w-5 h-5 -mx-2.5 text-[10px]' : 'w-7 h-7 -mx-3.5 text-xs'} z-10 rounded-full bg-slate-900 border-2 border-rose-400 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950`}
                title="Mối quan hệ hôn phối chính thất"
              >
                ❤️
              </div>

              <div className={`${isCompact ? 'w-2.5 sm:w-3.5' : 'w-6 sm:w-10'} h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]`} />

              {/* Thẻ phối ngẫu */}
              {renderMemberCard(spouse, true)}
            </div>
          )}
        </div>

        {/* NẾU CÓ CON: ĐƯỜNG NỐI HUYẾT THỐNG ĐI XUỐNG CÁC ĐỜI TIẾP THEO */}
        {hasChildren && (
          <div className="flex flex-col items-center w-full mt-0">
            {/* Đường trục thẳng đứng từ giữa bố mẹ đi xuống */}
            <div className={`w-0.5 ${isCompact ? 'h-4' : 'h-7'} bg-gradient-to-b from-amber-400 to-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]`} />

            {/* Nút thu gọn / mở rộng cành con cháu */}
            <button
              onClick={(e) => toggleCollapse(member.id, e)}
              className={`z-10 -my-2 px-2.5 py-0.5 rounded-full ${isCompact ? 'text-[9px]' : 'text-[10px]'} font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/30 transition-all cursor-pointer border border-amber-300`}
              title={isCollapsed ? 'Nhấp để mở rộng cành con cháu' : 'Nhấp để thu gọn cành con cháu'}
            >
              {isCollapsed ? (
                <>
                  <Plus className="w-2.5 h-2.5" />
                  <span>{children.length} Con</span>
                </>
              ) : (
                <>
                  <Minus className="w-2.5 h-2.5" />
                  <span>Thu Gọn ({children.length})</span>
                </>
              )}
            </button>

            {/* Nếu không thu gọn: Vẽ cành phân nhánh ngang và thả xuống từng con */}
            {!isCollapsed && (
              <>
                <div className={`w-0.5 ${isCompact ? 'h-4' : 'h-7'} bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]`} />

                {children.length === 1 ? (
                  // Chỉ có 1 người con: Đường nối thẳng đứng đi xuống
                  <div className="flex flex-col items-center">
                    <div className={`w-0.5 ${isCompact ? 'h-3.5' : 'h-6'} bg-amber-400`} />
                    <HierarchicalFamilyNode member={children[0]} />
                  </div>
                ) : (
                  // Có từ 2 người con trở lên: Cành ngang phân phối đều và thả xuống từng cột
                  <div className="flex items-start justify-center pt-0 relative">
                    {children.map((child, index) => {
                      const isFirst = index === 0;
                      const isLast = index === children.length - 1;

                      return (
                        <div key={child.id} className={`flex flex-col items-center relative ${isCompact ? 'px-1 sm:px-2' : 'px-4 sm:px-6'}`}>
                          {/* Đường cành ngang (Horizontal Branch Line) */}
                          <div className={`absolute top-0 left-0 right-0 ${isCompact ? 'h-4' : 'h-6'} pointer-events-none`}>
                            {/* Nửa bên trái */}
                            <div className={`absolute top-0 left-0 w-1/2 h-full ${!isFirst ? 'border-t-2 border-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.4)]' : ''}`} />
                            {/* Nửa bên phải */}
                            <div className={`absolute top-0 right-0 w-1/2 h-full ${!isLast ? 'border-t-2 border-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.4)]' : ''}`} />
                          </div>

                          {/* Cuống thẳng đứng rơi vào đỉnh thẻ con */}
                          <div className={`w-0.5 ${isCompact ? 'h-4' : 'h-7'} bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)] z-0`} />

                          {/* Thẻ con và các nhánh tiếp theo */}
                          <HierarchicalFamilyNode member={child} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-amber-500/20 flex flex-col shadow-2xl overflow-hidden select-none">
      
      {/* 1. THANH ĐIỀU KHIỂN & CHỌN CHẾ ĐỘ THÔNG MINH */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 flex flex-col gap-3">
        
        {/* Hàng 1: Dạng sơ đồ + NÚT BẬT/TẮT TINH GỌN (CHỈ HIỆN TÊN, TUỔI, QUÊ QUÁN) + Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Chọn dạng sơ đồ */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-amber-500/30">
            <button
              id="btn-view-mode-tree"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'tree'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sơ Đồ Cây Nối Cành</span>
            </button>

            <button
              id="btn-view-mode-ladder"
              onClick={() => setViewMode('ladder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'ladder'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sơ Đồ Phân Tầng Các Đời</span>
            </button>

            <button
              id="btn-view-mode-compact"
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'compact'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Dạng Sổ Tối Giản</span>
            </button>
          </div>

          {/* Toggle Chế độ Tinh Gọn & Kích thước Thu Nhỏ Tổng Quát */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lựa chọn kích thước: Cỡ Nhỏ (Tổng quan) vs Cỡ Tiêu Chuẩn */}
            <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-amber-500/30">
              <button
                id="btn-card-size-compact"
                onClick={() => setCardDensity('compact')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  cardDensity === 'compact'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Thu nhỏ thẻ để nhìn bao quát toàn bộ sơ đồ gia phả"
              >
                <span>🎯 Sơ Đồ Nhỏ (Tổng Quan)</span>
              </button>

              <button
                id="btn-card-size-normal"
                onClick={() => setCardDensity('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  cardDensity === 'normal'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Kích thước tiêu chuẩn"
              >
                <span>📐 Cỡ Vừa</span>
              </button>
            </div>

            {/* Nút Thêm Thông Tin Thành Viên */}
            {onAddNewMember && (
              <button
                id="btn-toolbar-add-member"
                onClick={onAddNewMember}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/25 border border-amber-300 cursor-pointer shrink-0 transition-transform active:scale-95"
                title="Bổ sung thêm thành viên mới vào gia phả"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Thêm Thông Tin</span>
              </button>
            )}

            {/* Nút Mở Lịch Gia Tộc & Sinh Nhật Thành Viên */}
            <button
              id="btn-tree-calendar-toggle"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                isCalendarOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/25'
                  : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-slate-800'
              }`}
              title="Xem lịch sự kiện gia tộc và sinh nhật chung của các thành viên"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Lịch & Sinh Nhật</span>
              {calendarItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isCalendarOpen ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {calendarItems.length}
                </span>
              )}
            </button>

            <button
              id="btn-toggle-simple-mode"
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isSimpleMode
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-200 border-amber-400/50'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-500/50'
              }`}
              title="Ẩn chi tiết thừa, chỉ hiện Tên, Tuổi và Quê quán để nhìn rõ sơ đồ gia phả"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isSimpleMode ? 'Tên • Tuổi • Quê Quán' : 'Chi Tiết Đầy Đủ'}</span>
            </button>

            {/* Quick Zoom Controls với các mốc Tổng quan nhanh */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
              <button
                id="btn-zoom-overview"
                onClick={() => {
                  setZoom(0.65);
                  setPan({ x: 0, y: 0 });
                }}
                title="Thu nhỏ để xem toàn cảnh các đời"
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  zoom <= 0.65 ? 'bg-amber-500 text-slate-950 shadow' : 'text-amber-300 hover:bg-slate-800'
                }`}
              >
                🔍 Toàn Cảnh (65%)
              </button>
              <button
                id="btn-zoom-75"
                onClick={() => {
                  setZoom(0.75);
                  setPan({ x: 0, y: 0 });
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  zoom === 0.75 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                75%
              </button>
              <button
                id="btn-zoom-100"
                onClick={() => setZoom(1)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  zoom === 1 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                100%
              </button>
              <button
                id="btn-zoom-out"
                onClick={handleZoomOut}
                title="Thu nhỏ sơ đồ"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-amber-300 px-1 min-w-[34px] text-center font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                id="btn-zoom-in"
                onClick={handleZoomIn}
                title="Phóng to sơ đồ"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-zoom-reset"
                onClick={handleResetZoom}
                title="Căn giữa lại sơ đồ"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Hàng 2: Bộ lọc Chi Phái + Lọc Đời + Tìm kiếm */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Lọc Chi Phái */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs py-0.5">
            <span className="text-amber-300 text-xs font-semibold shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              Chi phái:
            </span>
            <button
              onClick={() => onSelectBranch('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedBranch === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Toàn Tộc ({members.length})
            </button>
            {branches.map(b => (
              <button
                key={b}
                onClick={() => onSelectBranch(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedBranch === b
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Hộp bên phải: Ticker sự kiện sắp tới + Tìm kiếm */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Pill: Sự kiện hoặc Sinh nhật sắp tới */}
            {nextUpcomingItem && nextUpcomingItem.isSoon && (
              <button
                id="btn-quick-upcoming-pill"
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-rose-500/15 border border-rose-500/30 hover:border-rose-400 text-xs text-rose-200 transition-all cursor-pointer shadow-sm"
                title="Bấm để mở lịch sự kiện và sinh nhật chi tiết"
              >
                {nextUpcomingItem.itemType === 'birthday' ? (
                  <Cake className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="font-bold text-amber-300">
                  {nextUpcomingItem.itemType === 'birthday' ? '🎂 Sinh nhật sắp tới:' : '🕊️ Ngày giỗ sắp tới:'}
                </span>
                <span className="font-medium text-white truncate max-w-[140px]">
                  {nextUpcomingItem.member ? nextUpcomingItem.member.fullName : nextUpcomingItem.title}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  {nextUpcomingItem.isToday ? 'Hôm nay! 🎉' : `còn ${nextUpcomingItem.daysRemaining} ngày`}
                </span>
              </button>
            )}

            {/* Tìm kiếm người trong gia phả */}
            <div className="relative flex items-center min-w-[200px] sm:w-64 w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
              <input
                id="tree-search-member"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên cụ tổ, con cháu..."
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-8 pr-7 py-1.5 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thông báo chế độ tinh gọn & thu nhỏ tổng quát */}
        {isSimpleMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong>Sơ đồ thu nhỏ tổng quan:</strong> Chỉ hiện <strong>Tên, Tuổi và Quê Quán</strong> để nhìn bao quát toàn bộ cây gia phả một cách rõ nét nhất. Nhấp vào người muốn xem để mở bảng thông tin đầy đủ.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setCardDensity(cardDensity === 'compact' ? 'normal' : 'compact')}
                className="text-[11px] text-amber-300 hover:text-white font-bold underline cursor-pointer"
              >
                {cardDensity === 'compact' ? '📐 Phóng to thẻ' : '🎯 Thu nhỏ thẻ'}
              </button>
              <button 
                onClick={() => setIsSimpleMode(false)}
                className="text-[11px] text-slate-300 hover:text-white font-medium underline cursor-pointer"
              >
                Hiện chi tiết đầy đủ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. KHU VỰC HIỂN THỊ SƠ ĐỒ CHÍNH */}
      <div
        ref={containerRef}
        id="tree-main-display"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 min-h-[600px] max-h-[820px] overflow-auto bg-slate-950/95 cursor-grab active:cursor-grabbing ${
          cardDensity === 'compact' ? 'p-4 sm:p-6' : 'p-6 sm:p-10'
        }`}
        style={{
          backgroundImage: 'radial-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Thủy ấn biểu tượng Hoàng Gia chìm nhẹ */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Crown className="w-96 h-96 text-amber-400" />
        </div>

        {/* Transform viewport */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out'
          }}
          className="min-w-max mx-auto flex flex-col items-center gap-8"
        >

          {/* TRƯỜNG HỢP GIA PHẢ TRỐNG: CHƯA CÓ THÀNH VIÊN HOẶC ĐÃ XOÁ HẾT MẪU */}
          {members.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto bg-slate-900/90 rounded-3xl border border-amber-500/30 shadow-2xl my-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10 mb-4">
                🌳
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-200 mb-2">
                Sơ Đồ Gia Phả Đang Trống
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Toàn bộ thông tin mẫu đã được xóa sạch. Gia phả hiện tại đã sẵn sàng để bạn ghi danh các thế hệ trong gia đình mình.
              </p>
              {onAddNewMember && (
                <button
                  id="btn-empty-add-member"
                  onClick={onAddNewMember}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-amber-300"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>+ Thêm Khởi Tổ / Thành Viên Đầu Tiên</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHẾ ĐỘ 1: SƠ ĐỒ CÂY NỐI CÀNH (HUYẾT THỐNG CÂY GIA PHẢ VỚI ĐƯỜNG NỐI RÕ NÉT) */}
          {/* ========================================================================= */}
          {viewMode === 'tree' && members.length > 0 && (
            <div className="flex flex-col items-center gap-8 w-full py-4">
              {/* Tiêu đề Khởi tổ trang trọng */}
              <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-2 border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold shadow-xl shadow-amber-950/50">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>CỘI NGUỒN HUYẾT THỐNG TRỰC HỆ GIA TỘC</span>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded-full text-[11px] font-mono text-amber-300 font-semibold border border-amber-500/30">
                  {members.length} thành viên
                </span>
              </div>

              {/* Render từng cây cội nguồn (Root Trees) */}
              <div className={`flex flex-wrap justify-center items-start ${
                cardDensity === 'compact' ? 'gap-6 sm:gap-10' : 'gap-12 sm:gap-16'
              }`}>
                {rootMembers.map(root => (
                  <HierarchicalFamilyNode key={root.id} member={root} />
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHẾ ĐỘ 2: SƠ ĐỒ PHÂN TẦNG CÁC ĐỜI (LADDER STEPPER VIEW)                  */}
          {/* ========================================================================= */}
          {viewMode === 'ladder' && members.length > 0 && (
            <div className="w-full max-w-5xl flex flex-col gap-6 py-4">
              {generationGroups.map(({ generation, members: genMembers }) => (
                <div 
                  key={generation}
                  className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 shadow-2xl overflow-hidden"
                >
                  {/* Header thế hệ */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
                        Đ{generation}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-amber-200">
                          {getGenerationTitle(generation)}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Gồm {genMembers.length} vị tiền nhân & hậu duệ
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Thế hệ thứ {generation}
                    </span>
                  </div>

                  {/* Lưới thành viên */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-5">
                    {genMembers.map(m => renderMemberCard(m))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHẾ ĐỘ 3: DẠNG SỔ TỐI GIẢN (COMPACT LIST VIEW CHO NGƯỜI LỚN TUỔI)         */}
          {/* ========================================================================= */}
          {viewMode === 'compact' && members.length > 0 && (
            <div className="w-full max-w-4xl bg-slate-900/90 rounded-2xl border border-amber-500/30 p-6 shadow-2xl py-6">
              <div className="text-center pb-6 border-b border-amber-500/20">
                <h3 className="text-lg sm:text-xl font-black text-amber-300 tracking-wide">
                  SỔ GIA PHẢ CHÍNH TÔNG - THẾ THỨ TRUYỀN THỐNG
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trình bày theo thứ bậc truyền thống từ Cụ Khởi Tổ đến Hậu Duệ đương đại
                </p>
              </div>

              <div className="divide-y divide-slate-800/80">
                {generationGroups.map(({ generation, members: genMembers }) => (
                  <div key={generation} className="py-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="text-base font-black text-amber-300">
                        {getGenerationTitle(generation)}
                      </h4>
                    </div>

                    <div className="space-y-3 pl-4 sm:pl-6 border-l-2 border-amber-500/30">
                      {genMembers.map(m => {
                        const isMale = m.gender === 'male';
                        const ageInfo = getMemberAgeInfo(m);
                        const hometown = getMemberHometown(m);
                        const spouse = getSpouse(m);
                        const parentNames = getParentNames(m);

                        return (
                          <div
                            key={m.id}
                            onClick={() => onOpenMemberProfile(m)}
                            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                  isMale ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {isMale ? '♂ Cụ Ông / Con Trai' : '♀ Cụ Bà / Con Gái'}
                                </span>
                                <h5 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                  {m.fullName}
                                </h5>
                                {m.isDeceased ? (
                                  <span className="text-xs text-slate-400 font-mono">(Đã mất)</span>
                                ) : (
                                  <span className="text-xs text-emerald-400 font-mono">(Đang sống)</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
                                <span className="font-semibold text-amber-300">
                                  ⏳ {ageInfo.display} ({ageInfo.yearText})
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="flex items-center gap-1 text-slate-200">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  Quê quán: <strong className="text-amber-100">{hometown}</strong>
                                </span>
                              </div>

                              {!isSimpleMode && (
                                <>
                                  {parentNames && (
                                    <p className="text-xs text-slate-400">
                                      Con của: {parentNames}
                                    </p>
                                  )}
                                  {spouse && (
                                    <p className="text-xs text-rose-300">
                                      Phối ngẫu: {spouse.fullName}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                                {m.branch}
                              </span>
                              <span className="text-[11px] text-amber-400 group-hover:underline">
                                Nhấp xem thông tin đầy đủ →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. CHÂN TRANG: HƯỚNG DẪN & CHÚ THÍCH DỄ HIỂU */}
      <div className="p-3.5 bg-slate-900 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-500/20" />
            Nam giới (Viền Hoàng Kim)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-rose-400 bg-rose-500/20" />
            Nữ giới (Viền Cánh Sen)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Đang sinh sống
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Đã khuất (Tiên linh)
          </span>
          <span className="flex items-center gap-1">
            <span className="text-rose-400">❤️</span>
            Đường nối hôn phối
          </span>
        </div>

        <div className="text-amber-300 font-semibold flex items-center gap-1">
          <span>💡 Bấm vào bất kỳ người nào để mở bảng thông tin đầy đủ chi tiết</span>
        </div>
      </div>

      {/* 4. MODAL / SLIDE-OVER CALENDAR INTEGRATION */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div 
            id="tree-calendar-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsCalendarOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl my-auto"
            >
              <FamilyCalendarIntegration
                events={events || []}
                members={members}
                userRole={userRole}
                onAddEvent={onAddEvent}
                onDeleteEvent={onDeleteEvent}
                onSelectMember={handleCalendarSelectMember}
                onClose={() => setIsCalendarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InteractiveTreeView;
