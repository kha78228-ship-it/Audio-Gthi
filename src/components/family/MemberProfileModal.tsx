import React, { useState, useEffect } from 'react';
import { FamilyTreeMember as FamilyMember, FamilyRole, FamilyDocument, Track } from '../../types';
import { getMemberAgeInfo, getMemberHometown, getRelationshipStatusInfo, getMemberAudioTracks } from '../../utils/familyTreeUtils';
import { 
  X, 
  Save, 
  Trash2, 
  Upload, 
  FileText, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Award, 
  Users, 
  Heart, 
  Crown, 
  Plus, 
  ExternalLink,
  BookOpen,
  Camera,
  AlertCircle,
  Music,
  MessageSquare,
  UserPlus,
  Check,
  Play,
  Volume2,
  Sparkles
} from 'lucide-react';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  userRole: FamilyRole;
  branches: string[];
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onOpenChatWithMember?: (member: FamilyMember) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onSaveMember: (updatedMember: FamilyMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onOpenProposalFor: (member: FamilyMember) => void;
  onAnalyzePhaTueAI?: (member: FamilyMember) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  allMembers,
  userRole,
  branches,
  tracks = [],
  onPlayTrack,
  onOpenChatWithMember,
  onNavigateToMode,
  onSaveMember,
  onDeleteMember,
  onOpenProposalFor,
  onAnalyzePhaTueAI
}) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'relations' | 'documents' | 'audio'>('info');

  // New Document input state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<FamilyDocument['type']>('genealogy_record');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [showAddDocForm, setShowAddDocForm] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
      setIsEditing(false);
      setShowAddDocForm(false);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSave = () => {
    if (!formData.fullName?.trim()) {
      alert('Vui lòng nhập Họ và tên thành viên');
      return;
    }
    onSaveMember(formData as FamilyMember);
    setIsEditing(false);
  };

  const handleAddDocument = () => {
    if (!newDocTitle.trim()) {
      alert('Vui lòng nhập tiêu đề tài liệu');
      return;
    }
    const doc: FamilyDocument = {
      id: `doc_${Date.now()}`,
      title: newDocTitle.trim(),
      type: newDocType,
      url: newDocUrl.trim() || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      description: newDocDesc.trim(),
      date: new Date().toISOString().substring(0, 10),
      fileSize: '2.5 MB'
    };
    const updatedDocs = [...(formData.documents || []), doc];
    setFormData(prev => ({ ...prev, documents: updatedDocs }));
    setNewDocTitle('');
    setNewDocUrl('');
    setNewDocDesc('');
    setShowAddDocForm(false);
  };

  const handleRemoveDoc = (docId: string) => {
    const updated = (formData.documents || []).filter(d => d.id !== docId);
    setFormData(prev => ({ ...prev, documents: updated }));
  };

  // Find related members
  const father = allMembers.find(m => m.id === member.fatherId);
  const mother = allMembers.find(m => m.id === member.motherId);
  const spouses = allMembers.filter(m => (member.spouseIds || []).includes(m.id));
  const children = allMembers.filter(m => m.fatherId === member.id || m.motherId === member.id);

  // Eligible potential parents (generation - 1)
  const potentialFathers = allMembers.filter(m => m.id !== member.id && m.gender === 'male' && m.generation === member.generation - 1);
  const potentialMothers = allMembers.filter(m => m.id !== member.id && m.gender === 'female' && m.generation === member.generation - 1);
  const potentialSpouses = allMembers.filter(m => m.id !== member.id && m.generation === member.generation);

  const memberAudioTracks = getMemberAudioTracks(member, tracks);
  const loveStatus = getRelationshipStatusInfo(formData as FamilyMember, allMembers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="member-profile-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header with Title & Action */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-amber-200">
                {isEditing ? 'Chỉnh Sửa Hồ Sơ Thành Viên' : 'Hồ Sơ Gia Phả Cá Nhân'}
              </h3>
              <p className="text-xs text-amber-400/70">
                Đời thứ {member.generation} • {member.branch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct message button */}
            <button
              onClick={() => {
                if (onOpenChatWithMember) {
                  onOpenChatWithMember(member);
                } else if (onNavigateToMode) {
                  onClose();
                  onNavigateToMode('messages', 'chat');
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all flex items-center gap-1.5"
              title="Nhắn tin với thành viên dòng họ"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Nhắn tin</span>
            </button>

            {/* Clan friend button */}
            <button
              onClick={() => {
                const nextStatus = formData.haevyFriendStatus === 'friend' ? 'none' : 'friend';
                const updated = { ...formData, haevyFriendStatus: nextStatus } as FamilyMember;
                setFormData(updated);
                onSaveMember(updated);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                formData.haevyFriendStatus === 'friend'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
              }`}
              title="Kết bạn thân tộc"
            >
              {formData.haevyFriendStatus === 'friend' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bạn thân tộc</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Kết bạn</span>
                </>
              )}
            </button>

            {onAnalyzePhaTueAI && (
              <button
                id="btn-profile-analyze-pha-tue"
                onClick={() => {
                  onClose();
                  onAnalyzePhaTueAI(member);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5"
                title="Luận giải tính cách, vận mệnh, ngũ hành và lời khuyên gia huấn từ Phả Tuệ AI"
              >
                <span>🤖 Phả Tuệ AI</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                id="btn-toggle-edit-mode"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isEditing 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                }`}
              >
                {isEditing ? 'Hủy chỉnh sửa' : '✏️ Chỉnh sửa'}
              </button>
            )}

            {userRole === 'member' && (
              <button
                id="btn-profile-send-proposal"
                onClick={() => {
                  onClose();
                  onOpenProposalFor(member);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1"
              >
                ✍️ Gửi đề xuất sửa
              </button>
            )}

            <button
              id="btn-close-member-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 shrink-0 text-xs">
          <button
            id="tab-btn-profile-info"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Thông Tin Cá Nhân
          </button>
          <button
            id="tab-btn-profile-relations"
            onClick={() => setActiveTab('relations')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'relations'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Quan Hệ Phả Hệ ({children.length + spouses.length + (father ? 1 : 0)} mối liên kết)
          </button>
          <button
            id="tab-btn-profile-documents"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Tài Liệu & Sắc Phong ({formData.documents?.length || 0})
          </button>
          <button
            id="tab-btn-profile-audio"
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audio'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Audio & Bản Thu Haevy ({memberAudioTracks.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Avatar and Portrait */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="relative group">
                  <img
                    src={formData.photoUrl || (formData.gender === 'female' 
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80')}
                    alt={formData.fullName}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Họ và tên chính thức *</label>
                        <input
                          type="text"
                          value={formData.fullName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Tên Húy / Tên Tự / Tên Hiệu</label>
                        <input
                          type="text"
                          value={formData.alternativeName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, alternativeName: e.target.value }))}
                          placeholder="Ví dụ: Tự Phúc An, Hiệu Tịnh Trai"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Đường dẫn ảnh chân dung (URL)</label>
                        <input
                          type="text"
                          value={formData.photoUrl || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[11px] text-slate-400 block mb-1">Giới tính</label>
                          <select
                            value={formData.gender || 'male'}
                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-200 focus:outline-none"
                          >
                            <option value="male">Nam giới</option>
                            <option value="female">Nữ giới</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] text-slate-400 block mb-1">Thế hệ (Đời)</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.generation || 1}
                            onChange={(e) => setFormData(prev => ({ ...prev, generation: parseInt(e.target.value, 10) || 1 }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-bold text-amber-100">{formData.fullName}</h4>
                      {formData.alternativeName && (
                        <p className="text-sm text-amber-300/80 italic mt-0.5">{formData.alternativeName}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          formData.isDeceased 
                            ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {formData.isDeceased ? '🕊️ Tiên linh đã khuất' : '🌱 Đang sinh sống'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                          ⏳ {getMemberAgeInfo(formData as FamilyMember).display} ({getMemberAgeInfo(formData as FamilyMember).yearText})
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Quê quán: {getMemberHometown(formData as FamilyMember)}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {formData.branch}
                        </span>
                        {formData.adoptionType === 'adopted_in' && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                            Quan hệ: Con nuôi
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Life Span & Vital Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Birth details */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Sinh Nhật & Sinh Thìn
                  </h5>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Ngày sinh (Dương lịch)</label>
                        <input
                          type="date"
                          value={formData.birthDate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Ngày sinh (Âm lịch)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: 15/08 Ất Mùi"
                          value={formData.lunarBirthDate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, lunarBirthDate: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs space-y-1 text-slate-300">
                      <p><span className="text-slate-500">Dương lịch:</span> {formData.birthDate || 'Chưa cập nhật'}</p>
                      {formData.lunarBirthDate && (
                        <p><span className="text-slate-500">Âm lịch:</span> {formData.lunarBirthDate}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Death / Memorial details */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      🕊️ Ngày Mất & Ngày Giỗ
                    </h5>
                    {isEditing && (
                      <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDeceased || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDeceased: e.target.checked }))}
                          className="rounded border-slate-700"
                        />
                        <span>Đã khuất</span>
                      </label>
                    )}
                  </div>

                  {formData.isDeceased ? (
                    isEditing ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Ngày mất (Dương lịch)</label>
                          <input
                            type="date"
                            value={formData.deathDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, deathDate: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Ngày giỗ chính thức (Âm lịch)</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: 15/10 Âm lịch"
                            value={formData.lunarDeathDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, lunarDeathDate: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Nơi an táng / Mộ phần</label>
                          <input
                            type="text"
                            placeholder="Nghĩa trang, tọa độ mộ tổ..."
                            value={formData.burialPlace || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, burialPlace: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1 text-slate-300">
                        <p><span className="text-slate-500">Dương lịch:</span> {formData.deathDate || 'Chưa rõ'}</p>
                        <p><span className="text-slate-500">Ngày giỗ âm:</span> <strong className="text-amber-300">{formData.lunarDeathDate || 'Chưa cập nhật'}</strong></p>
                        {formData.burialPlace && (
                          <p><span className="text-slate-500">Mộ phần:</span> {formData.burialPlace}</p>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-emerald-400 italic py-2">
                      Thành viên đang sinh sống cùng gia tộc.
                    </p>
                  )}
                </div>
              </div>

              {/* Career & Residence */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Sự Nghiệp, Học Vị & Nơi Ở
                </h5>

                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Quê quán / Nguyên quán</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Kim Bảng, Hà Nam"
                        value={formData.originPlace || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, originPlace: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Nơi cư trú / Địa chỉ hiện nay</label>
                      <input
                        type="text"
                        value={formData.currentResidence || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentResidence: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Nghề nghiệp / Chức vị / Học vị</label>
                      <input
                        type="text"
                        value={formData.occupation || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Quê quán / Nguyên quán:</span>
                      <p className="text-amber-200 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        {getMemberHometown(formData as FamilyMember)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nơi cư trú hiện nay:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{formData.currentResidence || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nghề nghiệp / Công danh:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{formData.occupation || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Romantic & Marriage Relationship Status */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Mối Quan Hệ Tình Cảm & Hôn Phối Gia Đạo
                  </h5>
                  {!isEditing && (loveStatus.statusKey === 'married' || loveStatus.statusKey === 'dating') && onNavigateToMode && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToMode('couple');
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
                    >
                      <Heart className="w-3 h-3 text-rose-400" />
                      Mở I Love Haevy (Gia đạo)
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tình trạng tình cảm</label>
                      <select
                        value={formData.relationshipStatus || 'single'}
                        onChange={(e) => setFormData(prev => ({ ...prev, relationshipStatus: e.target.value as any }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-rose-200 focus:outline-none"
                      >
                        <option value="single">Độc thân</option>
                        <option value="dating">Đang hẹn hò</option>
                        <option value="married">Đã kết hôn</option>
                        <option value="widowed">Góa bụa</option>
                        <option value="divorced">Ly hôn / Độc lập</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Họ tên bạn đời / người yêu</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Trần Thị Lan..."
                        value={formData.relationshipPartnerName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, relationshipPartnerName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Ngày cưới / Ngày kỷ niệm</label>
                      <input
                        type="date"
                        value={formData.relationshipAnniversary || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, relationshipAnniversary: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-1">Tài khoản Haevy (Username / UID liên kết)</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: haevy_nguyenphuc..."
                        value={formData.haevyUsername || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, haevyUsername: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-200"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${loveStatus.badgeColor}`}>
                          {loveStatus.label}
                        </span>
                        {loveStatus.partnerDisplay && (
                          <span className="text-rose-200 font-semibold">
                            với {loveStatus.partnerDisplay}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px]">{loveStatus.detailsText}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (onOpenChatWithMember) {
                            onOpenChatWithMember(member);
                          } else if (onNavigateToMode) {
                            onClose();
                            onNavigateToMode('messages', 'chat');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Nhắn tin
                      </button>
                      <button
                        onClick={() => setActiveTab('audio')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Music className="w-3.5 h-3.5" />
                        Audio ({memberAudioTracks.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Biography / Ghi chú cuộc đời */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Tiểu Sử, Đức Nghiệp & Ghi Chú Phả Ký
                </h5>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Ghi lại sự tích cuộc đời, công đức đóng góp cho dòng họ và quê hương..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {formData.bio || 'Chưa có ghi chép tiểu sử chi tiết.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="space-y-5">
              {/* Parents section */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Cha Mẹ (Thế Hệ Tiền Bối)
                </h5>

                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Thân phụ (Cha)</label>
                      <select
                        value={formData.fatherId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, fatherId: e.target.value || null }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      >
                        <option value="">-- Không có / Khởi tổ --</option>
                        {potentialFathers.map(f => (
                          <option key={f.id} value={f.id}>{f.fullName} (Đời {f.generation})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Thân mẫu (Mẹ)</label>
                      <select
                        value={formData.motherId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, motherId: e.target.value || null }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      >
                        <option value="">-- Không có / Chưa rõ --</option>
                        {potentialMothers.map(m => (
                          <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                      <span className="text-blue-400 font-bold">Cha:</span>
                      {father ? (
                        <span className="text-amber-200 font-semibold">{father.fullName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Khởi thủy / Không rõ</span>
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                      <span className="text-rose-400 font-bold">Mẹ:</span>
                      {mother ? (
                        <span className="text-amber-200 font-semibold">{mother.fullName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Không rõ</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Spouses section */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Phối Ngẫu (Vợ / Chồng)
                </h5>

                {spouses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa ghi nhận thông tin phối ngẫu.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {spouses.map(sp => (
                      <div key={sp.id} className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/20 flex items-center gap-2 text-xs">
                        <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-amber-100 font-semibold truncate">{sp.fullName}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">
                          {sp.isDeceased ? 'Đã mất' : 'Còn sống'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Children section */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Hậu Duệ (Con Cái - {children.length} người)
                </h5>

                {children.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa có hậu duệ nào được ghi nhận dưới nhánh này.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {children.map((child, idx) => (
                      <div key={child.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-amber-100 font-semibold truncate">{child.fullName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 ml-2">
                          Đời {child.generation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Tài liệu thực tế chứng thực danh tính, sắc phong vua ban, trích lục khai sinh/tử, ảnh tư liệu.
                </p>
                {userRole === 'admin' && (
                  <button
                    id="btn-toggle-add-doc"
                    onClick={() => setShowAddDocForm(!showAddDocForm)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    + Đính Kèm Tài Liệu
                  </button>
                )}
              </div>

              {/* Add document form */}
              {showAddDocForm && (
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3">
                  <h6 className="text-xs font-bold text-amber-300">Bổ Sung Tư Liệu Mới</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Tên tư liệu / Tiêu đề văn bản *</label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="Ví dụ: Sắc phong Khải Định Niên Tự"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Loại tư liệu</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="genealogy_record">Gia phả ký cổ truyền</option>
                        <option value="decree">Sắc phong / Chiếu chỉ triều đình</option>
                        <option value="certificate">Huân chương / Bằng khen / Chứng thư</option>
                        <option value="historical_photo">Ảnh tư liệu lịch sử</option>
                        <option value="other">Tài liệu khác</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1">Đường dẫn tệp / Hình ảnh chứng thực (URL)</label>
                      <input
                        type="text"
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1">Mô tả tóm tắt nội dung văn bản</label>
                      <textarea
                        rows={2}
                        value={newDocDesc}
                        onChange={(e) => setNewDocDesc(e.target.value)}
                        placeholder="Nội dung trích lục, niên đại, người lưu giữ..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded"
                    >
                      Hủy
                    </button>
                    <button
                      id="btn-confirm-save-doc"
                      onClick={handleAddDocument}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400"
                    >
                      Lưu Tư Liệu
                    </button>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {(!formData.documents || formData.documents.length === 0) ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  Chưa có tài liệu hay sắc phong nào được đính kèm cho vị này.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-amber-200 truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-[11px] text-slate-400 truncate">{doc.description}</p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {doc.date || 'Lưu truyền'} {doc.fileSize && `• ${doc.fileSize}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 rounded text-xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Xem tư liệu
                        </a>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Xóa tài liệu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-emerald-400" />
                    Kho Audio, Podcast & Giọng Đọc Của {formData.fullName}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Lưu giữ giọng nói, khúc ca, hồi ký âm thanh và podcast gia tộc trên hệ sinh thái Haevy
                  </p>
                </div>

                {onNavigateToMode && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToMode('upload');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Đăng audio mới
                  </button>
                )}
              </div>

              {memberAudioTracks.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-300">Chưa có audio liên kết trực tiếp</div>
                    <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
                      Hãy đăng tải bản thu âm tâm sự, bài hát, hoặc podcast của {formData.fullName} lên Haevy Audio để con cháu muôn đời sau mãi khắc ghi thanh âm cội nguồn!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (onOpenChatWithMember) {
                          onOpenChatWithMember(member);
                        } else if (onNavigateToMode) {
                          onClose();
                          onNavigateToMode('messages', 'chat');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Nhắn tin hỏi audio
                    </button>
                    {onNavigateToMode && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToMode('portal');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium"
                      >
                        Khám phá kho nhạc Haevy
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {memberAudioTracks.map((track) => (
                    <div
                      key={track.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-md">
                          <Volume2 className="w-5 h-5 text-slate-950" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1.5">
                            {track.title}
                            {track.genre && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                                {track.genre}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {track.artist || track.addedByName || 'Thành viên gia tộc'} • {track.duration || '3:45'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onPlayTrack && (
                          <button
                            onClick={() => onPlayTrack(track)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Phát Ngay
                          </button>
                        )}
                        {onNavigateToMode && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToMode('portal');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Xem chi tiết trên Haevy Audio"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <span className="text-[11px] text-slate-500">
            ID: {member.id} • Mã bảo mật gia tộc
          </span>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                id="btn-save-member-profile-changes"
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                Lưu Thay Đổi
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
