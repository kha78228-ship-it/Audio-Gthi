import React, { useState, useEffect } from 'react';
import { 
  FamilyTree, 
  FamilyTreeMember as FamilyMember, 
  FamilyEvent, 
  FamilyProposal, 
  FamilyRole,
  Track
} from '../types';
import { 
  SAMPLE_FAMILY_TREE, 
  SAMPLE_FAMILY_MEMBERS, 
  SAMPLE_FAMILY_EVENTS, 
  SAMPLE_FAMILY_PROPOSALS 
} from '../data/sampleFamilyTree';
import { InteractiveTreeView } from './family/InteractiveTreeView';
import { FamilyMembersListView } from './family/FamilyMembersListView';
import { MemberProfileModal } from './family/MemberProfileModal';
import { FamilyEventsCalendarView } from './family/FamilyEventsCalendarView';
import { FamilyProposalsQueueView } from './family/FamilyProposalsQueueView';
import { FamilyDataArchitectureModal } from './family/FamilyDataArchitectureModal';
import { PhaTueAIView } from './family/PhaTueAIView';
import { FamilyHistoryHeritageView } from './family/FamilyHistoryHeritageView';
import { GlobalFamilyConnectView } from './family/GlobalFamilyConnectView';
import { AddMemberModal } from './family/AddMemberModal';
import { HaevyClanAICommandBar } from './family/HaevyClanAICommandBar';
import { ClanDirectChatModal } from './family/ClanDirectChatModal';
import { 
  Crown, 
  GitFork, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Database, 
  Plus, 
  Search, 
  Sparkles, 
  Download, 
  BookOpen,
  MapPin,
  RefreshCw,
  Home,
  Brain,
  Globe2,
  ScrollText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Flame,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Danh sách ID dữ liệu mẫu mặc định cần lọc bỏ để đảm bảo chỉ có dữ liệu người dùng thêm vào
const SAMPLE_MEMBER_IDS = new Set([
  'mem_gen1_01', 'mem_gen1_02', 'mem_gen2_01', 'mem_gen2_02', 'mem_gen2_03', 
  'mem_gen2_04', 'mem_gen2_05', 'mem_gen3_01', 'mem_gen3_02', 'mem_gen3_03', 
  'mem_gen3_04', 'mem_gen3_05', 'mem_gen3_06', 'mem_gen4_01', 'mem_gen4_02', 
  'mem_gen4_03', 'mem_gen4_04'
]);
const SAMPLE_EVENT_IDS = new Set(['evt_01', 'evt_02', 'evt_03', 'evt_04', 'evt_05']);
const SAMPLE_PROPOSAL_IDS = new Set(['prop_01', 'prop_02', 'prop_03']);

const DEFAULT_CLEAN_TREE: FamilyTree = {
  id: 'tree_user_main',
  name: 'Gia Phả Dòng Họ',
  ancestralHall: 'Từ Đường Gia Tộc',
  clanOrigin: 'Quê hương bản quán',
  emblemUrl: '',
  motto: 'Ẩm Thủy Tư Nguyên - Vạn Đại Trường Tồn',
  creatorUid: 'user',
  adminUids: ['user', 'kha78228@gmail.com'],
  editorUids: [],
  memberUids: [],
  rootMemberId: '',
  totalGenerations: 0,
  totalMembers: 0,
  branches: ['Chi Trưởng', 'Chi Thứ Hai', 'Chi Thứ Ba'],
  description: 'Gia phả lưu truyền các thế hệ dòng họ',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export type FamilyTreeTab = 'tree' | 'phatue_ai' | 'members' | 'events' | 'heritage' | 'global_connect' | 'proposals';

interface HaevyFamilyTreeViewProps {
  onBackToPortal?: () => void;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  activeTabControlled?: string;
  onTabChange?: (tab: string) => void;
}

export const HaevyFamilyTreeView: React.FC<HaevyFamilyTreeViewProps> = ({
  onBackToPortal,
  tracks = [],
  onPlayTrack,
  onNavigateToMode,
  activeTabControlled,
  onTabChange
}) => {
  // Direct chat member state
  const [directChatMember, setDirectChatMember] = useState<FamilyMember | null>(null);

  // Khởi tạo trạng thái: chỉ giữ lại dữ liệu do người dùng thêm vào, xoá bỏ toàn bộ dữ liệu mẫu
  const [treeInfo, setTreeInfo] = useState<FamilyTree>(() => {
    const saved = localStorage.getItem('haevy_family_tree_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id !== 'tree_nguyen_phuc_main') {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_CLEAN_TREE;
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('haevy_family_members');
    if (saved) {
      try {
        const parsed: FamilyMember[] = JSON.parse(saved);
        // Lọc bỏ toàn bộ thông tin mẫu không phải do người dùng thêm vào
        return parsed.filter(m => !SAMPLE_MEMBER_IDS.has(m.id) && m.treeId !== 'tree_nguyen_phuc_main');
      } catch (e) {}
    }
    return [];
  });

  const [events, setEvents] = useState<FamilyEvent[]>(() => {
    const saved = localStorage.getItem('haevy_family_events');
    if (saved) {
      try {
        const parsed: FamilyEvent[] = JSON.parse(saved);
        return parsed.filter(e => !SAMPLE_EVENT_IDS.has(e.id));
      } catch (e) {}
    }
    return [];
  });

  const [proposals, setProposals] = useState<FamilyProposal[]>(() => {
    const saved = localStorage.getItem('haevy_family_proposals');
    if (saved) {
      try {
        const parsed: FamilyProposal[] = JSON.parse(saved);
        return parsed.filter(p => !SAMPLE_PROPOSAL_IDS.has(p.id));
      } catch (e) {}
    }
    return [];
  });

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultParentForAdd, setDefaultParentForAdd] = useState<FamilyMember | null>(null);
  const [defaultSpouseForAdd, setDefaultSpouseForAdd] = useState<FamilyMember | null>(null);

  // Edit Clan Info Modal State
  const [isClanModalOpen, setIsClanModalOpen] = useState(false);
  const [clanFormName, setClanFormName] = useState(treeInfo.name);
  const [clanFormHall, setClanFormHall] = useState(treeInfo.ancestralHall);
  const [clanFormMotto, setClanFormMotto] = useState(treeInfo.motto);

  // User RBAC Role in Family Tree: 'admin' (Trưởng Họ) vs 'member' (Con Cháu)
  const [userRole, setUserRole] = useState<FamilyRole>('admin');

  // Active View Tab: 7 Pillars of Gia Phả 4.0
  const mapSubTabToFamilyTab = (subTab?: string): FamilyTreeTab => {
    if (!subTab) return 'tree';
    if (subTab === 'records') return 'heritage';
    if (subTab === 'anniversaries') return 'events';
    if (subTab === 'ancestors') return 'members';
    if (['tree', 'phatue_ai', 'members', 'events', 'heritage', 'global_connect', 'proposals'].includes(subTab)) {
      return subTab as FamilyTreeTab;
    }
    return 'tree';
  };

  const [internalActiveTab, setInternalActiveTab] = useState<FamilyTreeTab>(() => mapSubTabToFamilyTab(activeTabControlled));

  useEffect(() => {
    if (activeTabControlled) {
      setInternalActiveTab(mapSubTabToFamilyTab(activeTabControlled));
    }
  }, [activeTabControlled]);

  const activeTab = activeTabControlled ? mapSubTabToFamilyTab(activeTabControlled) : internalActiveTab;
  const setActiveTab = (tab: FamilyTreeTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [phaTueSelectedMemberId, setPhaTueSelectedMemberId] = useState<string>('');
  const [showHeritageBanner, setShowHeritageBanner] = useState(false);

  // Modals state
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<FamilyMember | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('haevy_family_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('haevy_family_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('haevy_family_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('haevy_family_tree_info', JSON.stringify(treeInfo));
  }, [treeInfo]);

  // Open Add Member Modal
  const handleOpenAddModal = (parent?: FamilyMember | null, spouse?: FamilyMember | null) => {
    setDefaultParentForAdd(parent || null);
    setDefaultSpouseForAdd(spouse || null);
    setIsAddModalOpen(true);
  };

  // Handler: Update an existing member (e.g. friend status, love info)
  const handleUpdateMember = (updatedMember: FamilyMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (selectedMemberForProfile?.id === updatedMember.id) {
      setSelectedMemberForProfile(updatedMember);
    }
  };

  // Handler: Save New Member (Created by User)
  const handleSaveNewMember = (
    newMember: FamilyMember,
    relationType?: 'root' | 'child' | 'spouse' | 'custom',
    relatedMemberId?: string
  ) => {
    setMembers(prev => {
      let nextList = [...prev];
      if (relationType === 'child' && relatedMemberId) {
        nextList = nextList.map(m => {
          if (m.id === relatedMemberId) {
            return {
              ...m,
              childrenIds: Array.from(new Set([...(m.childrenIds || []), newMember.id]))
            };
          }
          return m;
        });
      } else if (relationType === 'spouse' && relatedMemberId) {
        nextList = nextList.map(m => {
          if (m.id === relatedMemberId) {
            return {
              ...m,
              spouseIds: Array.from(new Set([...(m.spouseIds || []), newMember.id]))
            };
          }
          return m;
        });
      }
      return [...nextList, newMember];
    });

    try {
      if (db) {
        setDoc(doc(db, 'familyMembers', newMember.id), newMember);
      }
    } catch (e) {
      console.log('Local persistence fallback');
    }
  };

  // Handler: Open Member Profile
  const handleOpenMemberProfile = (member: FamilyMember) => {
    setSelectedMemberForProfile(member);
    setIsProfileModalOpen(true);
  };

  // Handler: Jump to Pha Tue AI from Profile or Card
  const handleJumpToPhaTueAI = (member: FamilyMember) => {
    setPhaTueSelectedMemberId(member.id);
    setActiveTab('phatue_ai');
  };

  // Handler: Save Member (Admin)
  const handleSaveMember = (updatedMember: FamilyMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    setSelectedMemberForProfile(updatedMember);
    try {
      if (db) {
        setDoc(doc(db, 'familyMembers', updatedMember.id), updatedMember, { merge: true });
      }
    } catch (e) {
      console.log('Local persistence fallback');
    }
  };

  // Handler: Delete Member
  const handleDeleteMember = (memberId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi phả hệ?')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      if (selectedMemberForProfile?.id === memberId) {
        setIsProfileModalOpen(false);
      }
      try {
        if (db) {
          deleteDoc(doc(db, 'familyMembers', memberId));
        }
      } catch (e) {
        console.log('Local persistence fallback');
      }
    }
  };

  // Handler: Add New Member (Admin general)
  const handleAddNewMember = () => {
    handleOpenAddModal(null, null);
  };

  // Handler: Add New Member Under parent
  const handleAddNewMemberUnder = (parent: FamilyMember) => {
    handleOpenAddModal(parent, null);
  };

  // Handler: Add Spouse
  const handleAddSpouseFor = (member: FamilyMember) => {
    handleOpenAddModal(null, member);
  };

  // Handler: Add Event
  const handleAddEvent = (newEvent: FamilyEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    try {
      if (db) {
        setDoc(doc(db, 'familyEvents', newEvent.id), newEvent);
      }
    } catch (e) {
      console.log('Local persistence fallback');
    }
  };

  // Handler: Delete Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    try {
      if (db) {
        deleteDoc(doc(db, 'familyEvents', eventId));
      }
    } catch (e) {
      console.log('Local persistence fallback');
    }
  };

  // Handler: Approve Proposal
  const handleApproveProposal = (proposal: FamilyProposal) => {
    // If it's an edit proposal
    if (proposal.proposalType === 'edit_member' && proposal.targetMemberId) {
      setMembers(prev => prev.map(m => {
        if (m.id === proposal.targetMemberId) {
          return {
            ...m,
            ...proposal.proposedData,
            bio: `${m.bio || ''}\n[Bổ sung]: ${proposal.reason || ''}`.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return m;
      }));
    } else if (proposal.proposalType === 'add_member') {
      const newM: FamilyMember = {
        id: `mem_approved_${Date.now()}`,
        treeId: treeInfo.id,
        fullName: proposal.proposedData?.fullName || proposal.targetMemberName || 'Thành viên mới',
        gender: proposal.proposedData?.gender || 'male',
        generation: proposal.proposedData?.generation || 5,
        branch: proposal.proposedData?.branch || treeInfo.branches[0],
        birthDate: proposal.proposedData?.birthDate,
        lunarBirthDate: proposal.proposedData?.lunarBirthDate,
        fatherId: proposal.proposedData?.fatherId,
        isDeceased: false,
        bio: proposal.proposedData?.bio || proposal.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMembers(prev => [...prev, newM]);
    }

    // Mark proposal approved
    setProposals(prev => prev.map(p => {
      if (p.id === proposal.id) {
        return {
          ...p,
          status: 'approved',
          reviewNote: 'Trưởng tộc đã chuẩn y phê duyệt ghi danh vào phả hệ gia tộc.',
          reviewedBy: 'Trưởng Tộc Nguyễn Phúc',
          reviewedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Handler: Reject Proposal
  const handleRejectProposal = (proposalId: string, note: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status: 'rejected',
          reviewNote: note,
          reviewedBy: 'Trưởng Tộc Nguyễn Phúc',
          reviewedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Handler: Submit new proposal (Member)
  const handleSubmitNewProposal = (newProp: Omit<FamilyProposal, 'id' | 'createdAt' | 'status'>) => {
    const prop: FamilyProposal = {
      ...newProp,
      id: `prop_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setProposals(prev => [prop, ...prev]);
  };

  // Handler: Jump directly to tree tab with focused member
  const handleJumpToTree = (memberId: string) => {
    setActiveTab('tree');
  };

  // Reset demo tree data
  const handleResetToSample = () => {
    if (confirm('Khôi phục toàn bộ gia phả mẫu chuẩn 4 đời của Dòng Họ Nguyễn Phúc?')) {
      setMembers(SAMPLE_FAMILY_MEMBERS);
      setEvents(SAMPLE_FAMILY_EVENTS);
      setProposals(SAMPLE_FAMILY_PROPOSALS);
      setTreeInfo(SAMPLE_FAMILY_TREE);
      localStorage.removeItem('haevy_family_members');
      localStorage.removeItem('haevy_family_events');
      localStorage.removeItem('haevy_family_proposals');
    }
  };

  const pendingProposalsCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Main Pedigree Clan Header */}
      <header className="relative bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border-b border-amber-500/20 pt-4 pb-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top navigation row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBackToPortal && (
                <button
                  id="btn-back-to-portal"
                  onClick={onBackToPortal}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  Cổng Không Gian
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                      {treeInfo.name}
                    </h1>
                    <button
                      id="btn-edit-clan-name"
                      onClick={() => {
                        setClanFormName(treeInfo.name);
                        setClanFormHall(treeInfo.ancestralHall);
                        setClanFormMotto(treeInfo.motto);
                        setIsClanModalOpen(true);
                      }}
                      title="Chỉnh sửa tên dòng họ & từ đường"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Chính Tông
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/70 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {treeInfo.ancestralHall}
                  </p>
                </div>
              </div>
            </div>

              {/* Quick Actions & Role Indicator */}
            <div className="flex items-center gap-2">
              {/* Nút THÊM THÔNG TIN NỔI BẬT */}
              <button
                id="btn-header-add-member"
                onClick={() => handleOpenAddModal(null, null)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/25 border border-amber-300 cursor-pointer transition-transform active:scale-95 shrink-0"
                title="Thêm thành viên mới vào gia phả"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Thêm Thông Tin</span>
              </button>

              {/* Architecture Modal Trigger */}
              <button
                id="btn-open-architecture-modal"
                onClick={() => setIsArchitectureModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Xem cấu trúc Graph Database & Closure Table"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Kiến Trúc O(1) & Xuất Bản</span>
                <span className="sm:hidden">Xuất Bản</span>
              </button>

              {/* Role badge switcher */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] px-1 hidden sm:inline">Vai trò:</span>
                <button
                  id="header-role-btn"
                  onClick={() => setUserRole(userRole === 'admin' ? 'member' : 'admin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    userRole === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-purple-600 text-white shadow-purple-600/20'
                  }`}
                  title="Nhấp để chuyển quyền Trưởng Tộc hoặc Con Cháu"
                >
                  {userRole === 'admin' ? '👑 Trưởng Tộc' : '👤 Con Cháu'}
                </button>
              </div>

              {/* Dọn sạch dữ liệu */}
              <button
                id="btn-clear-all-data"
                onClick={() => {
                  if (confirm('Xác nhận xoá sạch dữ liệu không phải do bạn thêm vào để bắt đầu lập gia phả mới?')) {
                    setMembers([]);
                    setEvents([]);
                    setProposals([]);
                    setTreeInfo(DEFAULT_CLEAN_TREE);
                    localStorage.removeItem('haevy_family_members');
                    localStorage.removeItem('haevy_family_events');
                    localStorage.removeItem('haevy_family_proposals');
                    localStorage.removeItem('haevy_family_tree_info');
                  }
                }}
                title="Xoá sạch dữ liệu mẫu để nhập gia phả mới"
                className="p-2 rounded-xl bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clan Quick Stats Bar: Gọn Gàng & Dễ Nhìn */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                🏛️
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">Khai Sáng</div>
                <div className="text-xs font-bold text-amber-200 truncate">
                  {members.length > 0 ? `${Math.max(...members.map(m => m.generation))} Thế Hệ (Đời)` : 'Chưa có thế hệ'}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                👥
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">Tổng Đinh & Nữ</div>
                <div className="text-xs font-bold text-amber-200 truncate">{members.length} Thành Viên</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                🌱
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">Hậu Duệ Đương Thời</div>
                <div className="text-xs font-bold text-emerald-300 truncate">
                  {members.filter(m => !m.isDeceased).length} vị đang sống
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                🕊️
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">Tiên Linh Quy Tiên</div>
                <div className="text-xs font-bold text-rose-300 truncate">
                  {members.filter(m => m.isDeceased).length} vị tiền tổ
                </div>
              </div>
            </div>
          </div>

          {/* Motto & Gia Pha 4.0 Core Values */}
          <div className="space-y-2">
            {treeInfo.motto && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center flex items-center justify-between px-4">
                <p className="text-xs italic text-amber-200 font-serif tracking-wide mx-auto">
                  « {treeInfo.motto} »
                </p>
                <button
                  onClick={() => setShowHeritageBanner(!showHeritageBanner)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Vì sao chọn Gia Phả 4.0?</span>
                  {showHeritageBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Expandable Gia Pha 4.0 Highlights */}
            {showHeritageBanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-slate-900/95 border border-amber-500/30 space-y-3"
              >
                <div className="text-xs font-serif italic text-amber-200 text-center border-b border-amber-500/20 pb-2">
                  “Con người có tổ, có tông — Như cây có cội, như sông có nguồn.”
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Dễ Dùng Cho Mọi Lứa Tuổi
                    </div>
                    <p className="text-slate-400">3 chế độ trực quan: Sơ đồ nhánh, Bậc thang, Thu gọn.</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Bảo Mật Riêng Tư
                    </div>
                    <p className="text-slate-400">Phân quyền Trưởng họ & Con cháu. Dữ liệu mã hóa an toàn.</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Chuẩn Văn Hóa Việt
                    </div>
                    <p className="text-slate-400">Tôn vinh đạo hiếu, ghi nhớ lễ giỗ, câu đối từ đường.</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AI Phả Tuệ Độc Quyền
                    </div>
                    <p className="text-slate-400">Phân tích tính cách, vận mệnh, ngũ hành, hòa giải xung đột.</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Kết Nối Toàn Cầu
                    </div>
                    <p className="text-slate-400">Bà con xa xứ dâng nén tâm nhang online, gắn kết kiều bào.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Subtabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {/* Tab 1: Sơ Đồ Phả Hệ */}
            <button
              id="tab-nav-tree-view"
              onClick={() => setActiveTab('tree')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'tree'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sơ Đồ Phả Hệ 🌳</span>
            </button>

            {/* Tab 2: Phả Tuệ AI */}
            <button
              id="tab-nav-phatue-ai"
              onClick={() => setActiveTab('phatue_ai')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'phatue_ai'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>Phả Tuệ AI 🤖</span>
            </button>

            {/* Tab 3: Thành Viên */}
            <button
              id="tab-nav-members-list"
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'members'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thành Viên ({members.length})</span>
            </button>

            {/* Tab 4: Lễ Giỗ & Sự Kiện */}
            <button
              id="tab-nav-events-calendar"
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lễ Giỗ ({events.length})</span>
            </button>

            {/* Tab 5: Gia Sử & Di Sản Số */}
            <button
              id="tab-nav-heritage-history"
              onClick={() => setActiveTab('heritage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'heritage'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              <span>Gia Sử & Di Sản 📖</span>
            </button>

            {/* Tab 6: Kết Nối Toàn Cầu & Vọng Bái */}
            <button
              id="tab-nav-global-connect"
              onClick={() => setActiveTab('global_connect')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'global_connect'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Kết Nối Toàn Cầu 🌐</span>
            </button>

            {/* Tab 7: Hòm Thư Đóng Góp */}
            <button
              id="tab-nav-proposals-queue"
              onClick={() => setActiveTab('proposals')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'proposals'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hòm Thư</span>
              {pendingProposalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                  {pendingProposalsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Views Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Haevy Clan AI Command Bar & Ecosystem Social Hub */}
        <HaevyClanAICommandBar
          members={members}
          treeInfo={treeInfo}
          tracks={tracks}
          onOpenMemberProfile={(m) => {
            setSelectedMemberForProfile(m);
            setIsProfileModalOpen(true);
          }}
          onOpenChatWithMember={(m) => setDirectChatMember(m)}
          onPlayTrack={onPlayTrack}
          onNavigateToMode={onNavigateToMode}
          onUpdateMember={handleUpdateMember}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'tree' && (
            <motion.div
              key="view-tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InteractiveTreeView
                members={members}
                userRole={userRole}
                selectedBranch={selectedBranch}
                onSelectBranch={setSelectedBranch}
                branches={treeInfo.branches}
                onOpenMemberProfile={handleOpenMemberProfile}
                onAddNewMemberUnder={handleAddNewMemberUnder}
                onAddSpouseFor={handleAddSpouseFor}
                onAddNewMember={() => handleOpenAddModal(null, null)}
                onOpenProposalFor={(m) => {
                  setSelectedMemberForProfile(m);
                  setActiveTab('proposals');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="view-members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FamilyMembersListView
                members={members}
                userRole={userRole}
                branches={treeInfo.branches}
                onOpenMemberProfile={handleOpenMemberProfile}
                onAddNewMember={handleAddNewMember}
                onEditMember={handleOpenMemberProfile}
                onDeleteMember={handleDeleteMember}
                onJumpToTree={handleJumpToTree}
                onOpenProposalFor={(m) => {
                  setSelectedMemberForProfile(m);
                  setActiveTab('proposals');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="view-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FamilyEventsCalendarView
                events={events}
                members={members}
                userRole={userRole}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </motion.div>
          )}

          {activeTab === 'phatue_ai' && (
            <motion.div
              key="view-phatue-ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PhaTueAIView
                members={members}
                treeInfo={treeInfo}
                selectedMemberId={phaTueSelectedMemberId}
                onSelectMember={(m) => handleOpenMemberProfile(m)}
              />
            </motion.div>
          )}

          {activeTab === 'heritage' && (
            <motion.div
              key="view-heritage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FamilyHistoryHeritageView
                treeInfo={treeInfo}
                members={members}
                userRole={userRole}
              />
            </motion.div>
          )}

          {activeTab === 'global_connect' && (
            <motion.div
              key="view-global-connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlobalFamilyConnectView
                treeInfo={treeInfo}
                members={members}
              />
            </motion.div>
          )}

          {activeTab === 'proposals' && (
            <motion.div
              key="view-proposals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FamilyProposalsQueueView
                proposals={proposals}
                userRole={userRole}
                onChangeUserRole={setUserRole}
                onApproveProposal={handleApproveProposal}
                onRejectProposal={handleRejectProposal}
                onSubmitNewProposal={handleSubmitNewProposal}
                allMembers={members}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Detail & Edit Modal */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        member={selectedMemberForProfile}
        allMembers={members}
        userRole={userRole}
        branches={treeInfo.branches}
        tracks={tracks}
        onPlayTrack={onPlayTrack}
        onOpenChatWithMember={(m) => setDirectChatMember(m)}
        onNavigateToMode={onNavigateToMode}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
        onAnalyzePhaTueAI={handleJumpToPhaTueAI}
        onOpenProposalFor={(m) => {
          setIsProfileModalOpen(false);
          setActiveTab('proposals');
        }}
      />

      {/* Clan Direct Messaging Modal */}
      <ClanDirectChatModal
        isOpen={Boolean(directChatMember)}
        onClose={() => setDirectChatMember(null)}
        member={directChatMember}
        currentUserId="user"
        tracks={tracks}
        onPlayTrack={onPlayTrack}
        onNavigateToMode={onNavigateToMode}
      />

      {/* Database Architecture Modal (Neo4j & Closure Table & GEDCOM) */}
      <FamilyDataArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        members={members}
        familyTree={treeInfo}
      />

      {/* Add New Member Modal (Do người dùng chủ động thêm vào) */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        allMembers={members}
        branches={treeInfo.branches}
        treeId={treeInfo.id}
        onSaveMember={handleSaveNewMember}
        defaultParent={defaultParentForAdd}
        defaultSpouse={defaultSpouseForAdd}
      />

      {/* Edit Clan Info Modal */}
      {isClanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Chỉnh Sửa Thông Tin Dòng Họ</span>
              </h3>
              <button
                onClick={() => setIsClanModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setTreeInfo(prev => ({
                ...prev,
                name: clanFormName.trim() || 'Gia Phả Dòng Họ',
                ancestralHall: clanFormHall.trim() || 'Từ Đường Gia Tộc',
                motto: clanFormMotto.trim() || 'Ẩm Thủy Tư Nguyên - Vạn Đại Trường Tồn'
              }));
              setIsClanModalOpen(false);
            }} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Tên Dòng Họ / Gia Tộc</label>
                <input
                  type="text"
                  required
                  value={clanFormName}
                  onChange={(e) => setClanFormName(e.target.value)}
                  placeholder="Ví dụ: Gia Phả Dòng Họ Nguyễn, Họ Trần, Họ Lê..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-200 text-sm font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Từ Đường / Nơi Thờ Tự Tổ Tiên</label>
                <input
                  type="text"
                  value={clanFormHall}
                  onChange={(e) => setClanFormHall(e.target.value)}
                  placeholder="Ví dụ: Từ Đường Chi Trưởng tại quê quán"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Gia Huấn / Tộc Ước / Châm Ngôn</label>
                <input
                  type="text"
                  value={clanFormMotto}
                  onChange={(e) => setClanFormMotto(e.target.value)}
                  placeholder="Ví dụ: Ẩm Thủy Tư Nguyên - Vạn Đại Trường Tồn"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClanModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HaevyFamilyTreeView;
