import React, { useState, useMemo } from 'react';
import { FamilyTreeMember as FamilyMember, FamilyRole } from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Heart, 
  Eye, 
  ShieldCheck, 
  ArrowUpDown,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface FamilyMembersListViewProps {
  members: FamilyMember[];
  userRole: FamilyRole;
  branches: string[];
  onOpenMemberProfile: (member: FamilyMember) => void;
  onAddNewMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onJumpToTree: (memberId: string) => void;
  onOpenProposalFor: (member: FamilyMember) => void;
}

export const FamilyMembersListView: React.FC<FamilyMembersListViewProps> = ({
  members,
  userRole,
  branches,
  onOpenMemberProfile,
  onAddNewMember,
  onEditMember,
  onDeleteMember,
  onJumpToTree,
  onOpenProposalFor
}) => {
  const [search, setSearch] = useState('');
  const [filterGen, setFilterGen] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'living', 'deceased'
  const [filterGender, setFilterGender] = useState<string>('all'); // 'all', 'male', 'female'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'generation' | 'name' | 'birthDate'>('generation');

  // Compute available generations
  const generations = useMemo(() => {
    const gens = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b);
    return gens;
  }, [members]);

  // Filter and Sort members
  const filteredList = useMemo(() => {
    return members
      .filter(m => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = m.fullName.toLowerCase().includes(q);
          const matchAlt = m.alternativeName?.toLowerCase().includes(q);
          const matchJob = m.occupation?.toLowerCase().includes(q);
          const matchPlace = m.currentResidence?.toLowerCase().includes(q) || m.burialPlace?.toLowerCase().includes(q);
          if (!matchName && !matchAlt && !matchJob && !matchPlace) return false;
        }
        if (filterGen !== 'all' && m.generation !== parseInt(filterGen, 10)) return false;
        if (filterBranch !== 'all' && m.branch !== filterBranch && m.branch !== 'Toàn tộc') return false;
        if (filterStatus === 'living' && m.isDeceased) return false;
        if (filterStatus === 'deceased' && !m.isDeceased) return false;
        if (filterGender !== 'all' && m.gender !== filterGender) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'generation') {
          if (a.generation !== b.generation) return a.generation - b.generation;
          return (a.orderInFamily || 1) - (b.orderInFamily || 1);
        }
        if (sortBy === 'name') {
          return a.fullName.localeCompare(b.fullName, 'vi');
        }
        if (sortBy === 'birthDate') {
          return (a.birthDate || '9999').localeCompare(b.birthDate || '9999');
        }
        return 0;
      });
  }, [members, search, filterGen, filterBranch, filterStatus, filterGender, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = members.length;
    const living = members.filter(m => !m.isDeceased).length;
    const deceased = total - living;
    const male = members.filter(m => m.gender === 'male').length;
    const female = total - male;
    const docsCount = members.reduce((sum, m) => sum + (m.documents?.length || 0), 0);
    return { total, living, deceased, male, female, docsCount };
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Top Stats Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Tổng thành viên</span>
          <p className="text-xl font-bold text-amber-300 mt-0.5">{stats.total} vị</p>
        </div>
        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Đang sinh sống</span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{stats.living} người</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Tiên linh đã khuất</span>
          <p className="text-xl font-bold text-slate-300 mt-0.5">{stats.deceased} vị</p>
        </div>
        <div className="bg-slate-900/80 border border-blue-500/20 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Nam giới</span>
          <p className="text-xl font-bold text-blue-400 mt-0.5">{stats.male} người</p>
        </div>
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Nữ giới</span>
          <p className="text-xl font-bold text-rose-400 mt-0.5">{stats.female} người</p>
        </div>
        <div className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Tư liệu & Sắc phong</span>
          <p className="text-xl font-bold text-purple-300 mt-0.5">{stats.docsCount} văn bản</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="member-list-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo họ tên, tên tự/húy, nghề nghiệp, quê quán..."
              className="w-full bg-slate-950 border border-amber-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Add member button */}
          {userRole === 'admin' && (
            <button
              id="btn-add-new-member"
              onClick={onAddNewMember}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Thành Viên Mới</span>
            </button>
          )}
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800 text-xs">
          {/* Generation filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Thế hệ:</span>
            <select
              id="filter-select-gen"
              value={filterGen}
              onChange={(e) => setFilterGen(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Tất cả thế hệ</option>
              {generations.map(gen => (
                <option key={gen} value={gen.toString()} className="bg-slate-900 text-slate-200">
                  Đời thứ {gen}
                </option>
              ))}
            </select>
          </div>

          {/* Branch filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Chi nhánh:</span>
            <select
              id="filter-select-branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Tất cả chi họ</option>
              {branches.map(b => (
                <option key={b} value={b} className="bg-slate-900 text-slate-200">{b}</option>
              ))}
            </select>
          </div>

          {/* Living / Deceased filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Trạng thái:</span>
            <select
              id="filter-select-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Tất cả</option>
              <option value="living" className="bg-slate-900 text-slate-200">🌱 Còn sống</option>
              <option value="deceased" className="bg-slate-900 text-slate-200">🕊️ Đã khuất</option>
            </select>
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Giới tính:</span>
            <select
              id="filter-select-gender"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Tất cả</option>
              <option value="male" className="bg-slate-900 text-slate-200">Nam</option>
              <option value="female" className="bg-slate-900 text-slate-200">Nữ</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="generation" className="bg-slate-900 text-slate-200">Sắp xếp theo: Đời / Thứ bậc</option>
              <option value="name" className="bg-slate-900 text-slate-200">Sắp xếp theo: Tên (A-Z)</option>
              <option value="birthDate" className="bg-slate-900 text-slate-200">Sắp xếp theo: Năm sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid Cards */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <Users className="w-12 h-12 mx-auto text-amber-500/40 mb-3" />
          <p className="text-base font-semibold text-amber-200">
            {members.length === 0 ? 'Gia phả hiện tại chưa có thông tin' : 'Không tìm thấy thành viên nào phù hợp'}
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {members.length === 0 
              ? 'Toàn bộ dữ liệu mẫu đã được dọn sạch. Bạn hãy bắt đầu ghi danh thành viên mới cho gia tộc.' 
              : 'Hãy thử thay đổi từ khóa hoặc bộ lọc chi họ, thế hệ.'}
          </p>
          {onAddNewMember && (
            <button
              onClick={onAddNewMember}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Thông Tin Thành Viên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={member.photoUrl || (member.gender === 'female' 
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80')}
                    alt={member.fullName}
                    className={`w-14 h-14 rounded-xl object-cover border-2 shrink-0 ${
                      member.gender === 'female' ? 'border-rose-400/80' : 'border-amber-400/80'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Đời thứ {member.generation}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        member.isDeceased ? 'bg-slate-800 text-slate-400' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {member.isDeceased ? '🕊️ Đã khuất' : '🌱 Còn sống'}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onOpenMemberProfile(member)}
                      className="text-base font-bold text-amber-100 hover:text-amber-300 cursor-pointer truncate mt-1"
                    >
                      {member.fullName}
                    </h3>
                    {member.alternativeName && (
                      <p className="text-xs text-amber-300/70 italic truncate">
                        {member.alternativeName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Key metadata badges */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span>
                      {member.birthDate || 'Chưa rõ'} 
                      {member.isDeceased && ` — ${member.deathDate || 'Hưởng thọ'}`}
                      {member.lunarDeathDate && <span className="text-amber-300/80 ml-1">({member.lunarDeathDate})</span>}
                    </span>
                  </div>

                  {member.occupation && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="truncate">{member.occupation}</span>
                    </div>
                  )}

                  {member.burialPlace && member.isDeceased && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                      <span className="truncate">Mộ phần: {member.burialPlace}</span>
                    </div>
                  )}

                  {member.currentResidence && !member.isDeceased && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      <span className="truncate">Nơi ở: {member.currentResidence}</span>
                    </div>
                  )}
                </div>

                {/* Documents tag if available */}
                {member.documents && member.documents.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{member.documents.length} tài liệu & trích lục phả hệ</span>
                  </div>
                )}
              </div>

              {/* Action Buttons footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  id={`btn-jump-tree-${member.id}`}
                  onClick={() => onJumpToTree(member.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Định vị trên cây
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-view-member-card-${member.id}`}
                    onClick={() => onOpenMemberProfile(member)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Xem chi tiết hồ sơ"
                  >
                    <User className="w-3.5 h-3.5" />
                  </button>

                  {userRole === 'admin' ? (
                    <>
                      <button
                        id={`btn-edit-member-${member.id}`}
                        onClick={() => onEditMember(member)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteMember && (
                        <button
                          id={`btn-delete-member-${member.id}`}
                          onClick={() => onDeleteMember(member.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      id={`btn-card-propose-${member.id}`}
                      onClick={() => onOpenProposalFor(member)}
                      className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-medium transition-colors"
                    >
                      ✍️ Đề xuất
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
