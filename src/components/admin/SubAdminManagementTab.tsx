import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Shield, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRole, SubAdminPermissions, SubAdminUser, UserAccountData } from '../../types';
import { collection, onSnapshot, query, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SubAdminManagementTabProps {
  showToast: (msg: string) => void;
}

const DEFAULT_PERMISSIONS: SubAdminPermissions = {
  canManageAuthors: true,
  canManageTracks: true,
  canManageCommunity: true,
  canManageUsers: false,
  canCreateVipAndPasses: true,
  canPostAnnouncements: true,
  canManageSystemConfig: false,
  canBatchReward: false,
  canViewAuditLogs: true,
};

const FULL_PERMISSIONS: SubAdminPermissions = {
  canManageAuthors: true,
  canManageTracks: true,
  canManageCommunity: true,
  canManageUsers: true,
  canCreateVipAndPasses: true,
  canPostAnnouncements: true,
  canManageSystemConfig: true,
  canBatchReward: true,
  canViewAuditLogs: true,
};

export function SubAdminManagementTab({ showToast }: SubAdminManagementTabProps) {
  const { user, isSuperAdmin, logSystemActivity } = useAuth();
  const [subAdmins, setSubAdmins] = useState<SubAdminUser[]>([]);
  const [usersList, setUsersList] = useState<UserAccountData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('sub_admin');
  const [permissions, setPermissions] = useState<SubAdminPermissions>(DEFAULT_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<SubAdminUser | null>(null);

  // Fetch Sub-Admins from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'subAdmins'),
      (snapshot) => {
        const list: SubAdminUser[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as unknown as SubAdminUser);
        });
        setSubAdmins(list);
      },
      (err) => {
        console.warn('Sub-admins listener notice:', err);
      }
    );

    return () => unsub();
  }, []);

  // Fetch all users for adding new sub-admins
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const uList: UserAccountData[] = [];
        snap.forEach((docSnap) => {
          uList.push({ uid: docSnap.id, ...docSnap.data() } as UserAccountData);
        });
        setUsersList(uList);
      } catch (err) {
        console.error('Error loading users for subadmin:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSaveSubAdmin = async () => {
    if (!selectedUser) {
      showToast('Vui lòng chọn người dùng để phân quyền.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subAdminData = {
        uid: selectedUser.uid,
        email: selectedUser.email || '',
        displayName: selectedUser.displayName || 'Người dùng',
        accountId: selectedUser.accountId || 'AH-000000',
        role: selectedRole,
        permissions: selectedRole === 'super_admin' ? FULL_PERMISSIONS : permissions,
        assignedBy: user?.email || 'kha78228@gmail.com',
        assignedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'subAdmins', selectedUser.uid), subAdminData);
      
      // Also update role in user doc
      await setDoc(doc(db, 'users', selectedUser.uid), { role: 'admin' }, { merge: true });

      await logSystemActivity({
        action: 'ASSIGN_SUB_ADMIN',
        actionTitle: 'Bổ Nhiệm / Cập Nhật Phó Admin',
        targetType: 'user',
        targetId: selectedUser.uid,
        targetName: selectedUser.displayName || selectedUser.email,
        details: `Đã bổ nhiệm ${selectedUser.displayName || selectedUser.email} thành ${selectedRole.toUpperCase()} với các quyền được thiết lập.`,
        severity: 'warning'
      });

      showToast(`Đã bổ nhiệm ${selectedUser.displayName || selectedUser.email} thành công!`);
      setIsAddModalOpen(false);
      setSelectedUser(null);
      setEditingSubAdmin(null);
    } catch (err: any) {
      showToast(`Lỗi: ${err.message || 'Không thể lưu phân quyền'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSubAdmin = async (subAdmin: SubAdminUser) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền Admin của ${subAdmin.displayName || subAdmin.email}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'subAdmins', subAdmin.uid));
      await setDoc(doc(db, 'users', subAdmin.uid), { role: 'user' }, { merge: true });

      await logSystemActivity({
        action: 'ASSIGN_SUB_ADMIN',
        actionTitle: 'Thu Hồi Quyền Admin',
        targetType: 'user',
        targetId: subAdmin.uid,
        targetName: subAdmin.displayName || subAdmin.email,
        details: `Đã thu hồi quyền Admin của ${subAdmin.displayName || subAdmin.email}.`,
        severity: 'danger'
      });

      showToast(`Đã thu hồi quyền của ${subAdmin.displayName || subAdmin.email}`);
    } catch (err: any) {
      showToast(`Lỗi khi thu hồi: ${err.message}`);
    }
  };

  const openEditModal = (subAdmin: SubAdminUser) => {
    setEditingSubAdmin(subAdmin);
    setSelectedUser({
      uid: subAdmin.uid,
      email: subAdmin.email,
      displayName: subAdmin.displayName,
      accountId: subAdmin.accountId,
    } as UserAccountData);
    setSelectedRole(subAdmin.role);
    setPermissions(subAdmin.permissions || DEFAULT_PERMISSIONS);
    setIsAddModalOpen(true);
  };

  const filteredSubAdmins = subAdmins.filter(
    (sa) =>
      sa.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sa.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sa.accountId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionLabels: { key: keyof SubAdminPermissions; label: string; desc: string }[] = [
    { key: 'canManageAuthors', label: 'Duyệt Tác Giả eKYC', desc: 'Xem hồ sơ CCCD, duyệt hoặc từ chối đơn tác giả' },
    { key: 'canManageTracks', label: 'Quản Lý Audio & VIP Track', desc: 'Duyệt nhạc tải lên, xóa track vi phạm, gắn cờ VIP' },
    { key: 'canManageCommunity', label: 'Kiểm Duyệt Cộng Đồng', desc: 'Xóa bài viết, ghim bài thảo luận, kiểm duyệt bình luận' },
    { key: 'canManageUsers', label: 'Quản Lý Người Dùng & Khóa Nick', desc: 'Cộng/trừ điểm xu, nâng VIP, khóa tài khoản vi phạm' },
    { key: 'canCreateVipAndPasses', label: 'Tạo Mã Giới Thiệu & Mã Ẩn Danh', desc: 'Sinh mã giới thiệu VIP, phát hành pass 3 số' },
    { key: 'canPostAnnouncements', label: 'Phát Thông Báo Toàn Sàn', desc: 'Đăng bản tin khẩn cấp, sự kiện, cập nhật hệ thống' },
    { key: 'canManageSystemConfig', label: 'Cấu Hình & Bật Chế Độ Bảo Trì', desc: 'Thay đổi hệ số nhân xu, giảm giá VIP, bảo trì server' },
    { key: 'canBatchReward', label: 'Tặng Thưởng Hàng Loạt (Batch Reward)', desc: 'Tặng điểm và VIP cho toàn bộ người dùng cùng lúc' },
    { key: 'canViewAuditLogs', label: 'Xem Nhật Ký Minh Bạch (Audit Logs)', desc: 'Theo dõi toàn bộ lịch sử thao tác của các Admin khác' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Quản Lý Phó Admin & Phân Quyền Hạt Nhân</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Role-Based Access Control
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Chỉ định phó admin, người kiểm duyệt và gán quyền thao tác chi tiết theo từng nghiệp vụ.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingSubAdmin(null);
            setSelectedUser(null);
            setSelectedRole('sub_admin');
            setPermissions(DEFAULT_PERMISSIONS);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Bổ Nhiệm Admin Mới</span>
        </button>
      </div>

      {/* Super Admin Info Card */}
      <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900/80 to-zinc-950 border border-amber-500/30 rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-lg shadow-md">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">Super Admin (Tổng Quản Trị)</span>
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-md">
                Toàn Quyền Hệ Thống
              </span>
            </div>
            <p className="text-xs text-amber-200/90 font-mono mt-0.5">kha78228@gmail.com</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <Lock size={14} className="text-amber-400" />
          <span>Tài khoản gốc bất khả xâm phạm</span>
        </div>
      </div>

      {/* Sub Admins List */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Danh Sách Phó Admin & Kiểm Duyệt Viên ({subAdmins.length})</span>
          </h3>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, ID..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {filteredSubAdmins.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
            <Shield size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 font-medium">Chưa có phó admin nào được bổ nhiệm.</p>
            <p className="text-xs text-zinc-500 mt-1">Nhấn "Bổ Nhiệm Admin Mới" để phân quyền cho thành viên tin cậy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubAdmins.map((subAdmin) => {
              const activePermsCount = Object.values(subAdmin.permissions || {}).filter(Boolean).length;
              return (
                <div
                  key={subAdmin.uid}
                  className="p-5 bg-zinc-950 border border-zinc-800/80 rounded-2xl hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                        {subAdmin.displayName ? subAdmin.displayName.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{subAdmin.displayName || 'Admin'}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            subAdmin.role === 'sub_admin' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {subAdmin.role === 'sub_admin' ? 'PHÓ ADMIN' : 'KIỂM DUYỆT VIÊN'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{subAdmin.email || 'Email ẩn'}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">ID: {subAdmin.accountId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(subAdmin)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Chỉnh sửa quyền"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleRevokeSubAdmin(subAdmin)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Thu hồi quyền"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Permissions Summary Badges */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                      <span>Quyền hạn được cấp:</span>
                      <span className="text-amber-400 font-bold font-mono">{activePermsCount}/9 quyền</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {permissionLabels.map(({ key, label }) => {
                        const isGranted = subAdmin.permissions?.[key];
                        if (!isGranted) return null;
                        return (
                          <span
                            key={key}
                            className="px-2 py-0.5 bg-zinc-900 border border-zinc-700/60 rounded-md text-[10px] text-zinc-300 flex items-center gap-1"
                          >
                            <Check size={10} className="text-emerald-400" />
                            <span>{label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT SUB-ADMIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingSubAdmin ? 'Chỉnh Sửa Quyền Hạn Phó Admin' : 'Bổ Nhiệm Phó Admin & Phân Quyền'}
                  </h3>
                  <p className="text-xs text-zinc-400">Chọn thành viên và tick chọn các chức năng cho phép thao tác</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubAdmin(null);
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Select User */}
              {!editingSubAdmin && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    1. Chọn Người Dùng
                  </label>
                  <select
                    value={selectedUser?.uid || ''}
                    onChange={(e) => {
                      const u = usersList.find((usr) => usr.uid === e.target.value);
                      setSelectedUser(u || null);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="">-- Chọn một người dùng --</option>
                    {usersList.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName || u.email || u.uid} ({u.accountId || 'No ID'}) - {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  2. Cấp Bậc Quyền Hạn
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('sub_admin');
                      setPermissions(DEFAULT_PERMISSIONS);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedRole === 'sub_admin'
                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                    }`}
                  >
                    <span className="font-bold text-xs block text-purple-300">Phó Admin (Sub-Admin)</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Quyền quản lý diện rộng, duyệt tác giả, nhạc & cộng đồng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('moderator');
                      setPermissions({
                        ...DEFAULT_PERMISSIONS,
                        canManageAuthors: false,
                        canManageUsers: false,
                        canCreateVipAndPasses: false,
                        canManageSystemConfig: false,
                        canBatchReward: false,
                      });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedRole === 'moderator'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                    }`}
                  >
                    <span className="font-bold text-xs block text-cyan-300">Kiểm Duyệt Viên (Moderator)</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">Chuyên trách bài đăng, bình luận cộng đồng & audio</span>
                  </button>
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    3. Bảng Quyền Hạn Chi Tiết
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPermissions(FULL_PERMISSIONS)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPermissions({
                          canManageAuthors: false,
                          canManageTracks: false,
                          canManageCommunity: false,
                          canManageUsers: false,
                          canCreateVipAndPasses: false,
                          canPostAnnouncements: false,
                          canManageSystemConfig: false,
                          canBatchReward: false,
                          canViewAuditLogs: false,
                        })
                      }
                      className="text-[11px] text-zinc-400 hover:underline"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {permissionLabels.map(({ key, label, desc }) => {
                    const checked = permissions[key];
                    return (
                      <label
                        key={key}
                        className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          checked
                            ? 'bg-amber-500/5 border-amber-500/40 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setPermissions((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="mt-1 rounded accent-amber-500"
                        />
                        <div>
                          <p className="font-bold text-xs text-white">{label}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubAdmin(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSubAdmin}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Sparkles size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>{editingSubAdmin ? 'Cập Nhật Quyền' : 'Xác Nhận Bổ Nhiệm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
