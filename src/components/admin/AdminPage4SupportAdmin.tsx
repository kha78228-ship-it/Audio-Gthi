import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Crown, 
  Users, 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Ban, 
  Unlock, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  Check, 
  Copy, 
  X,
  Zap,
  ArrowUpRight,
  Filter,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAccountData, VipTier, VipOrder, PointTopupOrder } from '../../types';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface AdminPage4SupportAdminProps {
  usersList: UserAccountData[];
  onRefreshUsers: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export function AdminPage4SupportAdmin({
  usersList,
  onRefreshUsers,
  showToast
}: AdminPage4SupportAdminProps) {
  const { 
    updateUserVipByAdmin, 
    adjustUserPointsByAdmin, 
    banUserAccountByAdmin,
    logSystemActivity,
    user
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'approvals' | 'manual_grant' | 'users_list'>('approvals');
  const [userSearch, setUserSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // VIP Upgrade Modal State
  const [vipModalUser, setVipModalUser] = useState<UserAccountData | null>(null);
  const [vipDuration, setVipDuration] = useState(30);
  const [vipTierSelect, setVipTierSelect] = useState<VipTier>('vip');

  // Points Modal State
  const [pointsModalUser, setPointsModalUser] = useState<UserAccountData | null>(null);
  const [pointsDelta, setPointsDelta] = useState(1000);
  const [pointsReason, setPointsReason] = useState('Duyệt nạp xu Nuôi Admin');

  // Ban User Modal
  const [banModalUser, setBanModalUser] = useState<UserAccountData | null>(null);
  const [banReason, setBanReason] = useState('Vi phạm điều khoản cộng đồng');

  // Direct ID manual input
  const [targetIdInput, setTargetIdInput] = useState('');
  const [manualVipDays, setManualVipDays] = useState(30);
  const [manualCoinsAmount, setManualCoinsAmount] = useState(2000);
  const [manualNote, setManualNote] = useState('Nuôi Admin - Gói Nạp Ưu Đãi');

  // Orders / Topup Requests
  const [topupOrders, setTopupOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Listen or fetch orders from Firestore
  useEffect(() => {
    try {
      setOrdersLoading(true);
      const q = query(collection(db, 'vipOrders'), orderBy('createdAt', 'desc'), limit(50));
      const unsub = onSnapshot(q, (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setTopupOrders(list);
        setOrdersLoading(false);
      }, (err) => {
        console.warn('Orders snapshot notice:', err);
        setOrdersLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Orders init notice:', e);
      setOrdersLoading(false);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle VIP Upgrade Submission
  const handleApplyVip = async () => {
    if (!vipModalUser) return;
    const res = await updateUserVipByAdmin(vipModalUser.uid, vipTierSelect, vipDuration);
    if (res.success) {
      showToast(res.message);
      setVipModalUser(null);
      onRefreshUsers();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Points Adjustment Submission
  const handleApplyPoints = async () => {
    if (!pointsModalUser) return;
    const res = await adjustUserPointsByAdmin(pointsModalUser.uid, Number(pointsDelta), pointsReason);
    if (res.success) {
      showToast(res.message);
      setPointsModalUser(null);
      onRefreshUsers();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Ban User Submission
  const handleConfirmBan = async () => {
    if (!banModalUser) return;
    const isCurrentlyBanned = Boolean(banModalUser.isBanned);
    const res = await banUserAccountByAdmin(banModalUser.uid, !isCurrentlyBanned, banReason);
    if (res.success) {
      showToast(res.message);
      setBanModalUser(null);
      onRefreshUsers();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Direct Manual Grant by ID
  const handleDirectManualGrant = async (grantType: 'vip' | 'coins') => {
    const cleanId = targetIdInput.trim();
    if (!cleanId) {
      showToast('Vui lòng nhập Mã ID tài khoản (AH-XXXXXX) hoặc Email', 'error');
      return;
    }

    const matchedUser = usersList.find(
      u => u.accountId?.toLowerCase() === cleanId.toLowerCase() ||
           u.email?.toLowerCase() === cleanId.toLowerCase() ||
           u.uid === cleanId
    );

    if (!matchedUser) {
      showToast(`Không tìm thấy tài khoản "${cleanId}". Vui lòng kiểm tra lại.`, 'error');
      return;
    }

    if (grantType === 'vip') {
      const res = await updateUserVipByAdmin(matchedUser.uid, 'vip', manualVipDays);
      if (res.success) {
        showToast(`Đã kích hoạt +${manualVipDays} ngày VIP cho [${matchedUser.accountId}] thành công!`);
        setTargetIdInput('');
        onRefreshUsers();
      } else {
        showToast(res.message, 'error');
      }
    } else {
      const res = await adjustUserPointsByAdmin(matchedUser.uid, Number(manualCoinsAmount), manualNote);
      if (res.success) {
        showToast(`Đã nạp +${manualCoinsAmount.toLocaleString()} Xu Audio cho [${matchedUser.accountId}] thành công!`);
        setTargetIdInput('');
        onRefreshUsers();
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Quick Approve Topup Order
  const handleApproveOrder = async (order: any) => {
    try {
      const targetUid = order.userId || order.uid;
      if (targetUid) {
        if (order.durationDays) {
          await updateUserVipByAdmin(targetUid, 'vip', order.durationDays);
        }
        if (order.pointsAwarded || order.bonusPoints) {
          const pts = (order.pointsAwarded || 0) + (order.bonusPoints || 0);
          if (pts > 0) {
            await adjustUserPointsByAdmin(targetUid, pts, `Duyệt đơn nạp [${order.packageName || 'VIP'}]`);
          }
        }
      }

      if (order.id) {
        const orderRef = doc(db, 'vipOrders', order.id);
        await updateDoc(orderRef, {
          status: 'completed',
          approvedAt: serverTimestamp(),
          approvedBy: user?.email || 'admin'
        });
      }

      showToast(`Đã duyệt kích hoạt gói "${order.packageName || 'VIP/Xu'}" thành công!`);
      onRefreshUsers();
    } catch (e: any) {
      console.error(e);
      showToast('Lỗi khi duyệt đơn: ' + e.message, 'error');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.accountId && u.accountId.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q))
    );
  });

  const vipCount = usersList.filter(u => u.vipTier === 'vip').length;
  const totalCirculationPoints = usersList.reduce((acc, curr) => acc + (curr.audioPoints || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Nuôi Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-zinc-950 to-black border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <HeartHandshake size={14} className="text-amber-400" />
              <span>Trang 4 • Nuôi Admin & Duyệt Gói VIP / Nạp Xu Audio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trung Tâm <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Nuôi Admin</span> & Quản Trị Tài Khoản
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Duyệt các yêu cầu nạp Xu Audio & gói VIP từ người dùng, cấp phát thời hạn VIP thủ công (1 tuần - 1 năm - vĩnh viễn), 
              điều chỉnh số dư điểm cho mọi ID tài khoản (AH-XXXXXX) và quản lý trạng thái tài khoản.
            </p>
          </div>

          {/* Quick Stats Block */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shrink-0 grid grid-cols-2 gap-3 min-w-[260px] shadow-xl">
            <div>
              <span className="text-[11px] text-zinc-400 block">Hội viên VIP:</span>
              <span className="text-xl font-black text-amber-400 font-mono">{vipCount}</span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block">Tổng Xu Đang Giữ:</span>
              <span className="text-xl font-black text-cyan-400 font-mono">{totalCirculationPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 3 Sub Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-zinc-800/80 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'approvals'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Xét Duyệt Gói Nạp & VIP</span>
            {topupOrders.filter(o => o.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-mono animate-pulse">
                {topupOrders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manual_grant')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'manual_grant'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles size={15} />
            <span>Cấp Phát Thủ Công (Manual Grant)</span>
          </button>

          <button
            onClick={() => setActiveTab('users_list')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'users_list'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Users size={15} />
            <span>Danh Sách Người Dùng ({usersList.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB 1: Topup / VIP Approvals Queue */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Yêu Cầu Nạp VIP & Xu Audio Từ Người Dùng</h3>
                  <p className="text-[11px] text-zinc-400">Xem xét và phê duyệt các giao dịch thanh toán chuyển khoản</p>
                </div>
              </div>

              <button
                onClick={onRefreshUsers}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Làm mới</span>
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {topupOrders.length === 0 ? (
                <div className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800/80 text-center text-zinc-500 text-xs">
                  Chưa có giao dịch nạp tiền nào trong hàng đợi.
                </div>
              ) : (
                topupOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{order.packageName || 'Gói Nạp Audio'}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
                          {Number(order.finalAmount || order.originalAmount || 0).toLocaleString()}đ
                        </span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold uppercase ${
                          order.status === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        <span>Phương thức: <strong className="text-zinc-200 uppercase font-mono">{order.paymentMethod || 'VietQR'}</strong></span>
                        {order.durationDays && (
                          <span>Thời hạn: <strong className="text-amber-300">+{order.durationDays} ngày VIP</strong></span>
                        )}
                        {(order.pointsAwarded || order.bonusPoints) && (
                          <span>Xu tặng: <strong className="text-cyan-300">+{order.pointsAwarded || order.bonusPoints} pts</strong></span>
                        )}
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {order.createdAt ? new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {order.status !== 'completed' ? (
                        <button
                          onClick={() => handleApproveOrder(order)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          <span>Duyệt Kích Hoạt</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-emerald-400 text-xs font-bold border border-zinc-800">
                          <Check size={14} />
                          Đã Duyệt Xong
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB 2: Manual Grant Hub */}
      {/* ========================================================================= */}
      {activeTab === 'manual_grant' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Box 1: Cấp VIP trực tiếp theo ID */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Crown size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cấp Quyền VIP Thủ Công Theo ID</h3>
                <p className="text-[11px] text-zinc-400">Nâng cấp thời hạn VIP cho bất kỳ ID tài khoản nào</p>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Mã ID Tài Khoản (AH-XXXXXX) hoặc Email</label>
                <input
                  type="text"
                  value={targetIdInput}
                  onChange={(e) => setTargetIdInput(e.target.value)}
                  placeholder="VD: AH-839201 hoặc kha78228@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Gói Thời Hạn VIP</label>
                <select
                  value={manualVipDays}
                  onChange={(e) => setManualVipDays(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
                >
                  <option value={7}>Gói 7 Ngày (1 Tuần)</option>
                  <option value={30}>Gói 30 Ngày (1 Tháng)</option>
                  <option value={90}>Gói 90 Ngày (3 Tháng)</option>
                  <option value={180}>Gói 180 Ngày (6 Tháng)</option>
                  <option value={365}>Gói 365 Ngày (1 Năm)</option>
                  <option value={3650}>VIP Vĩnh Viễn (10 Năm)</option>
                </select>
              </div>

              <button
                onClick={() => handleDirectManualGrant('vip')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Crown size={15} />
                <span>Kích Hoạt VIP Ngay</span>
              </button>
            </div>
          </div>

          {/* Box 2: Nạp Xu Audio trực tiếp theo ID */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nạp Xu Audio / Thưởng Điểm Theo ID</h3>
                <p className="text-[11px] text-zinc-400">Cộng trực tiếp số dư Xu Audio vào tài khoản</p>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Mã ID Tài Khoản (AH-XXXXXX) hoặc Email</label>
                <input
                  type="text"
                  value={targetIdInput}
                  onChange={(e) => setTargetIdInput(e.target.value)}
                  placeholder="VD: AH-839201 hoặc kha78228@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Số Lượng Xu Audio</label>
                  <input
                    type="number"
                    value={manualCoinsAmount}
                    onChange={(e) => setManualCoinsAmount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-500"
                    step={100}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Lý do / Sự kiện</label>
                  <input
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                onClick={() => handleDirectManualGrant('coins')}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Coins size={15} />
                <span>Nạp Xu Audio Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB 3: Complete Users List Directory */}
      {/* ========================================================================= */}
      {activeTab === 'users_list' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm theo ID (AH-XXXXXX), Email, Tên hiển thị..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <span className="text-xs text-zinc-400 font-mono shrink-0">
              {filteredUsers.length} tài khoản
            </span>
          </div>

          {/* User Cards Grid */}
          <div className="space-y-2.5">
            {filteredUsers.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
                Không tìm thấy người dùng nào phù hợp.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.uid}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold shrink-0">
                      {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{u.displayName || 'Thành Viên'}</span>
                        <div className="flex items-center gap-1 font-mono text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">
                          <span>{u.accountId || 'AH-XXXXXX'}</span>
                          <button
                            onClick={() => handleCopy(u.accountId, u.uid)}
                            className="text-zinc-500 hover:text-white"
                            title="Sao chép ID"
                          >
                            {copiedId === u.uid ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                        {u.vipTier === 'vip' && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Crown size={10} /> VIP
                          </span>
                        )}
                        {u.isBanned && (
                          <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                            BANNED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        <span>Email: <strong className="text-zinc-300 font-mono">{u.email || 'Ẩn danh'}</strong></span>
                        <span>Số dư: <strong className="text-cyan-400 font-mono">{u.audioPoints?.toLocaleString() || 0} pts</strong></span>
                        {u.vipExpiresAt && (
                          <span>Hạn VIP: <strong className="text-amber-300 font-mono">{new Date(u.vipExpiresAt).toLocaleDateString('vi-VN')}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this user */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setVipModalUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Crown size={13} />
                      <span>Cấp VIP</span>
                    </button>

                    <button
                      onClick={() => setPointsModalUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Coins size={13} />
                      <span>Nạp Xu</span>
                    </button>

                    <button
                      onClick={() => setBanModalUser(u)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        u.isBanned
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black'
                          : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                      }`}
                      title={u.isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    >
                      {u.isBanned ? <Unlock size={14} /> : <Ban size={14} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Cấp VIP cho User */}
      {vipModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crown size={18} className="text-amber-400" />
              <span>Nâng Cấp VIP Cho Tài Khoản</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Cấp thời hạn VIP cho tài khoản: <strong className="text-amber-300">{vipModalUser.accountId}</strong> ({vipModalUser.email || vipModalUser.displayName})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Thời gian cộng thêm (Ngày)</label>
                <select
                  value={vipDuration}
                  onChange={(e) => setVipDuration(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
                >
                  <option value={7}>7 Ngày (1 Tuần)</option>
                  <option value={30}>30 Ngày (1 Tháng)</option>
                  <option value={90}>90 Ngày (3 Tháng)</option>
                  <option value={180}>180 Ngày (6 Tháng)</option>
                  <option value={365}>365 Ngày (1 Năm)</option>
                  <option value={3650}>VIP Vĩnh Viễn</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVipModalUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleApplyVip}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Xác Nhận Nâng VIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nạp Xu Audio cho User */}
      {pointsModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins size={18} className="text-cyan-400" />
              <span>Nạp Xu / Điều Chỉnh Điểm Audio</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Nạp điểm cho tài khoản: <strong className="text-cyan-300">{pointsModalUser.accountId}</strong> ({pointsModalUser.email || pointsModalUser.displayName})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Số Điểm / Xu Audio (Dương: cộng, Âm: trừ)</label>
                <input
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-500"
                  step={100}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Lý do điều chỉnh</label>
                <input
                  type="text"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPointsModalUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleApplyPoints}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Xác Nhận Nạp Xu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Khóa / Mở khóa tài khoản */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {banModalUser.isBanned ? <Unlock size={18} className="text-emerald-400" /> : <Ban size={18} className="text-rose-400" />}
              <span>{banModalUser.isBanned ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản Vi Phạm'}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Tài khoản mục tiêu: <strong className="text-white">{banModalUser.accountId}</strong> ({banModalUser.email || banModalUser.displayName})
            </p>

            {!banModalUser.isBanned && (
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Lý do khóa tài khoản</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Nhập lý do khóa tài khoản..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 min-h-[80px]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBanModalUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmBan}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  banModalUser.isBanned
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                }`}
              >
                {banModalUser.isBanned ? 'Xác Nhận Mở Khóa' : 'Xác Nhận Khóa Tài Khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
