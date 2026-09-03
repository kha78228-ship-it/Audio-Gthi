import React, { useState } from 'react';
import { FamilyTreeMember as FamilyMember, FamilyRole } from '../../types';
import { 
  X, 
  Save, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Heart, 
  Crown, 
  Plus, 
  Users,
  Sparkles,
  Info
} from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMembers: FamilyMember[];
  branches: string[];
  treeId: string;
  onSaveMember: (
    newMember: FamilyMember, 
    relationType?: 'root' | 'child' | 'spouse' | 'custom',
    relatedMemberId?: string
  ) => void;
  defaultParent?: FamilyMember | null;
  defaultSpouse?: FamilyMember | null;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  allMembers,
  branches,
  treeId,
  onSaveMember,
  defaultParent,
  defaultSpouse
}) => {
  // Determine initial relationship
  const initialRelationType = defaultParent ? 'child' : defaultSpouse ? 'spouse' : (allMembers.length === 0 ? 'root' : 'custom');
  const initialRelatedId = defaultParent ? defaultParent.id : defaultSpouse ? defaultSpouse.id : '';

  const [relationType, setRelationType] = useState<'root' | 'child' | 'spouse' | 'custom'>(initialRelationType);
  const [relatedMemberId, setRelatedMemberId] = useState<string>(initialRelatedId);

  // Member Form State
  const [fullName, setFullName] = useState('');
  const [alternativeName, setAlternativeName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [generation, setGeneration] = useState<number>(1);
  const [branch, setBranch] = useState<string>(branches[0] || 'Chi Trưởng');
  const [orderInFamily, setOrderInFamily] = useState<number>(1);
  const [isDeceased, setIsDeceased] = useState(false);
  
  // Dates & Places
  const [birthDate, setBirthDate] = useState('');
  const [lunarBirthDate, setLunarBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [lunarDeathDate, setLunarDeathDate] = useState('');
  const [originPlace, setOriginPlace] = useState('');
  const [currentResidence, setCurrentResidence] = useState('');
  const [burialPlace, setBurialPlace] = useState('');
  
  // Profile info
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Ecosystem & Relationship state
  const [relationshipStatus, setRelationshipStatus] = useState<'single' | 'dating' | 'married' | 'widowed' | 'divorced'>(initialRelationType === 'spouse' ? 'married' : 'single');
  const [relationshipPartnerName, setRelationshipPartnerName] = useState(defaultSpouse ? defaultSpouse.fullName : '');
  const [relationshipAnniversary, setRelationshipAnniversary] = useState('');
  const [haevyUsername, setHaevyUsername] = useState('');

  // Custom branch input toggle
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranchText, setCustomBranchText] = useState('');

  // Sync relationType changes
  const handleRelationTypeChange = (type: 'root' | 'child' | 'spouse' | 'custom') => {
    setRelationType(type);
    if (type === 'root') {
      setGeneration(1);
      setRelatedMemberId('');
    } else if (type === 'child') {
      const parent = allMembers.find(m => m.id === relatedMemberId) || allMembers[0];
      if (parent) {
        setRelatedMemberId(parent.id);
        setGeneration(parent.generation + 1);
        setBranch(parent.branch);
        if (parent.originPlace && !originPlace) {
          setOriginPlace(parent.originPlace);
        }
      }
    } else if (type === 'spouse') {
      setRelationshipStatus('married');
      const target = allMembers.find(m => m.id === relatedMemberId) || allMembers[0];
      if (target) {
        setRelatedMemberId(target.id);
        setGeneration(target.generation);
        setBranch(target.branch);
        setGender(target.gender === 'male' ? 'female' : 'male');
        setRelationshipPartnerName(target.fullName);
      }
    }
  };

  const handleRelatedMemberSelect = (memberId: string) => {
    setRelatedMemberId(memberId);
    const target = allMembers.find(m => m.id === memberId);
    if (!target) return;

    if (relationType === 'child') {
      setGeneration(target.generation + 1);
      setBranch(target.branch);
      if (target.originPlace && !originPlace) {
        setOriginPlace(target.originPlace);
      }
    } else if (relationType === 'spouse') {
      setGeneration(target.generation);
      setBranch(target.branch);
      setGender(target.gender === 'male' ? 'female' : 'male');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập Họ và tên thành viên');
      return;
    }

    const effectiveBranch = isCustomBranch && customBranchText.trim() ? customBranchText.trim() : branch;
    const newMemberId = `mem_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    let fatherId: string | null = null;
    let motherId: string | null = null;
    let spouseIds: string[] = [];

    if (relationType === 'child' && relatedMemberId) {
      const parent = allMembers.find(m => m.id === relatedMemberId);
      if (parent) {
        if (parent.gender === 'male') {
          fatherId = parent.id;
          // Look for spouse
          if (parent.spouseIds && parent.spouseIds.length > 0) {
            motherId = parent.spouseIds[0];
          }
        } else {
          motherId = parent.id;
          if (parent.spouseIds && parent.spouseIds.length > 0) {
            fatherId = parent.spouseIds[0];
          }
        }
      }
    } else if (relationType === 'spouse' && relatedMemberId) {
      spouseIds = [relatedMemberId];
    }

    const newMember: FamilyMember = {
      id: newMemberId,
      treeId,
      fullName: fullName.trim(),
      alternativeName: alternativeName.trim() || undefined,
      gender,
      generation: Number(generation) || 1,
      branch: effectiveBranch || 'Toàn tộc',
      orderInFamily: Number(orderInFamily) || 1,
      isDeceased,
      birthDate: birthDate.trim() || undefined,
      lunarBirthDate: lunarBirthDate.trim() || undefined,
      deathDate: isDeceased ? (deathDate.trim() || undefined) : undefined,
      lunarDeathDate: isDeceased ? (lunarDeathDate.trim() || undefined) : undefined,
      originPlace: originPlace.trim() || undefined,
      currentResidence: !isDeceased ? (currentResidence.trim() || undefined) : undefined,
      burialPlace: isDeceased ? (burialPlace.trim() || undefined) : undefined,
      occupation: occupation.trim() || undefined,
      bio: bio.trim() || undefined,
      photoUrl: photoUrl.trim() || (gender === 'female' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'),
      fatherId,
      motherId,
      spouseIds,
      childrenIds: [],
      adoptionType: 'none',
      relationshipStatus: relationshipStatus || 'single',
      relationshipPartnerName: relationshipPartnerName.trim() || undefined,
      relationshipAnniversary: relationshipAnniversary.trim() || undefined,
      haevyUsername: haevyUsername.trim() || undefined,
      haevyFriendStatus: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user'
    };

    onSaveMember(newMember, relationType, relatedMemberId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        id="add-member-modal-container"
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200">
                Thêm Thông Tin Thành Viên Mới
              </h3>
              <p className="text-xs text-slate-400">
                Ghi danh người thân vào gia phả dòng họ
              </p>
            </div>
          </div>

          <button
            id="btn-close-add-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Vai Trò Quan Hệ */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-amber-500/20">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>1. VỊ TRÍ & QUAN HỆ TRONG GIA PHẢ</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="rel-type-root"
                onClick={() => handleRelationTypeChange('root')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  relationType === 'root'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>👑 Khởi Tổ (Đời 1)</span>
              </button>

              <button
                type="button"
                id="rel-type-child"
                disabled={allMembers.length === 0}
                onClick={() => handleRelationTypeChange('child')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  allMembers.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                } ${
                  relationType === 'child'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>👶 Là Con Của...</span>
              </button>

              <button
                type="button"
                id="rel-type-spouse"
                disabled={allMembers.length === 0}
                onClick={() => handleRelationTypeChange('spouse')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  allMembers.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                } ${
                  relationType === 'spouse'
                    ? 'bg-rose-500 text-white border-rose-300 shadow font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-500/40'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>💍 Phối Ngẫu (Vợ/Chồng)</span>
              </button>

              <button
                type="button"
                id="rel-type-custom"
                onClick={() => handleRelationTypeChange('custom')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  relationType === 'custom'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>⚙️ Tự Chọn Thế Hệ</span>
              </button>
            </div>

            {/* If relation is child or spouse: Select Target Member */}
            {(relationType === 'child' || relationType === 'spouse') && allMembers.length > 0 && (
              <div className="pt-2">
                <label className="text-xs text-slate-300 block mb-1">
                  {relationType === 'child' ? '👉 Chọn Cha hoặc Mẹ:' : '👉 Chọn Vợ hoặc Chồng:'}
                </label>
                <select
                  id="select-related-member"
                  value={relatedMemberId}
                  onChange={(e) => handleRelatedMemberSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation} • {m.gender === 'male' ? '♂ Nam' : '♀ Nữ'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Thông tin cá nhân cơ bản */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>2. THÔNG TIN CÁ NHÂN CƠ BẢN</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="input-new-fullname"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-100 font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tên gọi khác / Tên tự / Biệt danh
                </label>
                <input
                  type="text"
                  id="input-new-altname"
                  placeholder="Ví dụ: Tự Phúc Hưng, tên ở nhà: Tí..."
                  value={alternativeName}
                  onChange={(e) => setAlternativeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Giới tính */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Giới tính
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      gender === 'male'
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ♂ Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      gender === 'female'
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ♀ Nữ
                  </button>
                </div>
              </div>

              {/* Thế hệ / Đời */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Thế hệ (Đời thứ)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={generation}
                  onChange={(e) => setGeneration(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-200 font-bold text-center text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Thứ tự sinh */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Thứ bậc (Con thứ)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={orderInFamily}
                  onChange={(e) => setOrderInFamily(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-center text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Trạng thái sống/mất */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tình trạng
                </label>
                <button
                  type="button"
                  onClick={() => setIsDeceased(!isDeceased)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    isDeceased
                      ? 'bg-slate-800 text-slate-300 border-slate-600'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isDeceased ? '🕊️ Đã khuất' : '🌱 Còn sống'}
                </button>
              </div>
            </div>

            {/* Chi nhánh */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300 font-medium">
                  Chi / Phân nhánh
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomBranch(!isCustomBranch)}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  {isCustomBranch ? 'Chọn từ danh sách có sẵn' : '+ Nhập tên chi mới'}
                </button>
              </div>
              {isCustomBranch ? (
                <input
                  type="text"
                  placeholder="Ví dụ: Chi Trưởng, Chi Giáp, Phân chi B..."
                  value={customBranchText}
                  onChange={(e) => setCustomBranchText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              ) : (
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                >
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Toàn tộc">Toàn tộc (Chung cho dòng họ)</option>
                </select>
              )}
            </div>
          </div>

          {/* Section 3: Năm sinh, Ngày giỗ, Quê quán */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>3. THỜI GIAN, QUÊ QUÁN & MỘ PHẦN</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Ngày sinh (Dương lịch hoặc chỉ ghi năm)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1980-05-15 hoặc 1980"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Ngày sinh (Âm lịch)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 12/4 Canh Thân"
                  value={lunarBirthDate}
                  onChange={(e) => setLunarBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Thông tin nếu đã khuất */}
            {isDeceased && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">
                      Năm/Ngày tạ thế (Dương lịch)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 2015-11-20 hoặc 2015"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-300/80 font-medium block mb-1">
                      Ngày giỗ chính (Âm lịch)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 15/10 Nhâm Ngọ"
                      value={lunarDeathDate}
                      onChange={(e) => setLunarDeathDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Nơi an táng / Mộ phần
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đồi mộ dòng họ tại xã Kim Bảng, tỉnh Hà Nam"
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Quê quán / Nguyên quán
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kim Bảng, Hà Nam"
                  value={originPlace}
                  onChange={(e) => setOriginPlace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Nơi ở hiện nay / Nơi làm việc
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
                  value={currentResidence}
                  onChange={(e) => setCurrentResidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Nghề nghiệp & Tiểu sử */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>4. HÀNH TRẠNG, NGHỀ NGHIỆP & TIỂU SỬ</span>
            </label>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Nghề nghiệp / Chức vị / Học vị
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Giáo viên, Kỹ sư, Cử nhân..."
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Tóm tắt hành trạng / Ghi chú / Lời gia huấn
              </label>
              <textarea
                rows={3}
                placeholder="Ghi chú về cuộc đời, thành tích, đóng góp cho gia tộc..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Section 5: Mối Quan Hệ Tình Cảm & Hệ Sinh Thái Haevy */}
          <div className="space-y-4 bg-slate-950/70 p-4 rounded-xl border border-rose-500/20">
            <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>5. MỐI QUAN HỆ TÌNH CẢM & HỆ SINH THÁI HAEVY</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tình trạng tình cảm
                </label>
                <select
                  value={relationshipStatus}
                  onChange={(e) => setRelationshipStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-rose-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                >
                  <option value="single">Độc thân</option>
                  <option value="dating">Đang hẹn hò</option>
                  <option value="married">Đã kết hôn</option>
                  <option value="widowed">Góa bụa</option>
                  <option value="divorced">Ly hôn / Độc lập</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tên bạn đời / người yêu (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trần Thị Lan..."
                  value={relationshipPartnerName}
                  onChange={(e) => setRelationshipPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Ngày cưới / Ngày kỷ niệm
                </label>
                <input
                  type="date"
                  value={relationshipAnniversary}
                  onChange={(e) => setRelationshipAnniversary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tài khoản Haevy (Tên đăng nhập hoặc UID để nhắn tin & liên kết audio)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: haevy_nguyenphuc hoặc @haevy_member"
                  value={haevyUsername}
                  onChange={(e) => setHaevyUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              id="btn-submit-add-member"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer border border-amber-300"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Thêm Vào Gia Phả</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddMemberModal;
