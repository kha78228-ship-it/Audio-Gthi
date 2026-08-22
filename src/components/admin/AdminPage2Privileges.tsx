import React, { useState } from 'react';
import { 
  Crown, 
  ShieldAlert, 
  Sliders, 
  Sparkles, 
  Radio, 
  KeyRound, 
  Gift, 
  Activity, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers,
  Lock,
  Eye,
  Filter,
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReferralCode, AnonymousPass, SystemAuditLog, SystemAnnouncement, SystemGlobalConfig } from '../../types';
import { SubAdminManagementTab } from './SubAdminManagementTab';
import { SystemAnnouncementsTab } from './SystemAnnouncementsTab';
import { SystemConfigTab } from './SystemConfigTab';
import { BatchOperationsTab } from './BatchOperationsTab';

interface AdminPage2PrivilegesProps {
  referralCodes: ReferralCode[];
  anonymousPasses: AnonymousPass[];
  auditLogs: SystemAuditLog[];
  onRefreshData?: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export function AdminPage2Privileges({
  referralCodes,
  anonymousPasses,
  auditLogs,
  onRefreshData,
  showToast
}: AdminPage2PrivilegesProps) {
  const { 
    createReferralCode, 
    deleteReferralCode, 
    createAnonymousPass, 
    deleteAnonymousPass 
  } = useAuth();

  const [activeSubSection, setActiveSubSection] = useState<
    'sub_admins' | 'system_config' | 'batch_operations' | 'announcements' | 'passes_referrals' | 'audit_logs'
  >('sub_admins');

  // Referral Codes State
  const [newRefCode, setNewRefCode] = useState('');
  const [newRefRewardPoints, setNewRefRewardPoints] = useState(200);
  const [newRefRewardVipDays, setNewRefRewardVipDays] = useState(3);
  const [newRefDescription, setNewRefDescription] = useState('Mã giới thiệu VIP');
  const [creatingRef, setCreatingRef] = useState(false);

  // Anonymous Passes State
  const [newAnonCode, setNewAnonCode] = useState('');
  const [newAnonType, setNewAnonType] = useState<'3_digit_month' | '1_week'>('3_digit_month');
  const [newAnonDescription, setNewAnonDescription] = useState('');
  const [creatingAnon, setCreatingAnon] = useState(false);

  // Audit search & filters
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'all' | 'info' | 'warning' | 'danger' | 'critical'>('all');
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRef(true);
    const res = await createReferralCode({
      code: newRefCode || undefined,
      rewardPoints: Number(newRefRewardPoints),
      rewardVipDays: Number(newRefRewardVipDays),
      description: newRefDescription,
    });
    setCreatingRef(false);
    if (res.success) {
      showToast(res.message);
      setNewRefCode('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCreateAnonymousPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnonCode.trim()) {
      showToast('Vui lòng nhập mã VIP 3 số hoặc chữ', 'error');
      return;
    }
    setCreatingAnon(true);
    const res = await createAnonymousPass({
      passCode: newAnonCode,
      type: newAnonType,
      description: newAnonDescription,
    });
    setCreatingAnon(false);
    if (res.success) {
      showToast(res.message);
      setNewAnonCode('');
      setNewAnonDescription('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = !auditLogSearch || 
      log.actionTitle.toLowerCase().includes(auditLogSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditLogSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditLogSearch.toLowerCase());
    const matchesSeverity = auditSeverityFilter === 'all' || log.severity === auditSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Crown size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              Trang 2 • Master Admin Privileges
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Các Đặc Quyền & Thiết Lập Quản Trị Tối Cao</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Phân quyền phó admin, cấu hình tham số toàn cục, tặng thưởng hàng loạt, bản tin chạy chữ và nhật ký kiểm toán.
            </p>
          </div>
        </div>

        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Làm Mới</span>
          </button>
        )}
      </div>

      {/* 6 Sub-Tab Switcher Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. Sub Admins */}
        <button
          onClick={() => setActiveSubSection('sub_admins')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'sub_admins'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'sub_admins' ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-amber-400'}`}>
              <ShieldAlert size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-300 rounded font-bold">RBAC</span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Phó Admin & Phân Quyền</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">9 nhóm quyền hạt nhân</p>
        </button>

        {/* 2. System Config */}
        <button
          onClick={() => setActiveSubSection('system_config')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'system_config'
              ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'system_config' ? 'bg-rose-500 text-white' : 'bg-zinc-900 text-rose-400'}`}>
              <Sliders size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/10 text-rose-300 rounded font-bold">Config</span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Cấu Hình Toàn Cục</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">X-Factor & tham số sàn</p>
        </button>

        {/* 3. Batch Operations */}
        <button
          onClick={() => setActiveSubSection('batch_operations')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'batch_operations'
              ? 'bg-teal-500/15 border-teal-500 text-white shadow-lg shadow-teal-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'batch_operations' ? 'bg-teal-500 text-black' : 'bg-zinc-900 text-teal-400'}`}>
              <Sparkles size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-teal-500/10 text-teal-300 rounded font-bold">Batch</span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Thao Tác Hàng Loạt</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Phát Xu & VIP toàn sàn</p>
        </button>

        {/* 4. Announcements */}
        <button
          onClick={() => setActiveSubSection('announcements')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'announcements'
              ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'announcements' ? 'bg-cyan-500 text-black' : 'bg-zinc-900 text-cyan-400'}`}>
              <Radio size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded font-bold">Marquee</span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Bảng Chạy Chữ & Bản Tin</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Tùy biến phông/màu/cỡ</p>
        </button>

        {/* 5. Passes & Referrals */}
        <button
          onClick={() => setActiveSubSection('passes_referrals')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'passes_referrals'
              ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'passes_referrals' ? 'bg-purple-500 text-white' : 'bg-zinc-900 text-purple-400'}`}>
              <KeyRound size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded font-bold font-mono">
              {anonymousPasses.length + referralCodes.length}
            </span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Mã VIP Ẩn Danh & Ref</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">3 số 1 tháng & 6 ký tự</p>
        </button>

        {/* 6. Audit Logs */}
        <button
          onClick={() => setActiveSubSection('audit_logs')}
          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            activeSubSection === 'audit_logs'
              ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-xl ${activeSubSection === 'audit_logs' ? 'bg-sky-500 text-black' : 'bg-zinc-900 text-sky-400'}`}>
              <Activity size={16} />
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-sky-950 text-sky-300 rounded font-bold font-mono">
              {auditLogs.length}
            </span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">Nhật Ký Kiểm Toán</p>
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Audit trail minh bạch</p>
        </button>
      </div>

      {/* Render Sub Section Content */}
      <div className="pt-2">
        {/* SUB 1: Sub Admins Management */}
        {activeSubSection === 'sub_admins' && (
          <SubAdminManagementTab showToast={showToast} />
        )}

        {/* SUB 2: Global System Config */}
        {activeSubSection === 'system_config' && (
          <SystemConfigTab showToast={showToast} />
        )}

        {/* SUB 3: Batch Operations */}
        {activeSubSection === 'batch_operations' && (
          <BatchOperationsTab showToast={showToast} />
        )}

        {/* SUB 4: System Announcements & Marquee */}
        {activeSubSection === 'announcements' && (
          <SystemAnnouncementsTab showToast={showToast} />
        )}

        {/* SUB 5: Anonymous Passes & Referral Codes */}
        {activeSubSection === 'passes_referrals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Split Grid: 1. Referral Codes (6 digits) & 2. Anonymous Passes (3 digits) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Referral Codes Generator & List */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Mã Giới Thiệu (6 Ký Tự • 100 Lượt)</h3>
                    <p className="text-[11px] text-zinc-400">Tặng Điểm Audio & Ngày VIP khi người dùng kích hoạt</p>
                  </div>
                </div>

                <form onSubmit={handleCreateReferral} className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Mã (Để trống tạo ngẫu nhiên)</label>
                      <input
                        type="text"
                        value={newRefCode}
                        onChange={(e) => setNewRefCode(e.target.value.toUpperCase())}
                        placeholder="VD: HAEVY6, KHA782"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-300 outline-none focus:border-indigo-500"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Mô tả / Chiến dịch</label>
                      <input
                        type="text"
                        value={newRefDescription}
                        onChange={(e) => setNewRefDescription(e.target.value)}
                        placeholder="VD: Sự kiện âm nhạc tháng 8"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Thưởng Điểm Audio</label>
                      <input
                        type="number"
                        value={newRefRewardPoints}
                        onChange={(e) => setNewRefRewardPoints(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Thưởng Ngày VIP</label>
                      <input
                        type="number"
                        value={newRefRewardVipDays}
                        onChange={(e) => setNewRefRewardVipDays(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingRef}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus size={15} />
                    <span>{creatingRef ? 'Đang tạo...' : 'Tạo Mã Giới Thiệu (Giới hạn 100 lượt)'}</span>
                  </button>
                </form>

                {/* Referral Codes List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {referralCodes.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">Chưa có mã giới thiệu nào.</div>
                  ) : (
                    referralCodes.map((code) => (
                      <div key={code.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-indigo-300">{code.code}</span>
                            <button
                              onClick={() => handleCopy(code.code, code.id)}
                              className="text-zinc-500 hover:text-white"
                              title="Sao chép mã"
                            >
                              {copiedId === code.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{code.description}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            +{code.rewardPoints} pts • +{code.rewardVipDays} ngày VIP • Đã dùng: {code.usedCount}/{code.maxUses || 100}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteReferralCode(code.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Xóa mã"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box 2: Anonymous Passes (3 digits - 1 month / 1 week) */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Mã VIP Ẩn Danh (3 Số • 1 Tháng & 1 Tuần)</h3>
                    <p className="text-[11px] text-zinc-400">Đăng nhập tài khoản ẩn danh mở khóa VIP tức thì không cần Gmail</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAnonymousPass} className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Mã Ẩn Danh (3 Ký Tự)</label>
                      <input
                        type="text"
                        value={newAnonCode}
                        onChange={(e) => setNewAnonCode(e.target.value.toUpperCase())}
                        placeholder="VD: 777, VIP, 888, 999"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 outline-none focus:border-amber-500"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Thời hạn gói VIP</label>
                      <select
                        value={newAnonType}
                        onChange={(e) => setNewAnonType(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-bold"
                      >
                        <option value="3_digit_month">Gói 1 Tháng (30 Ngày)</option>
                        <option value="1_week">Gói 1 Tuần (7 Ngày)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Ghi chú người nhận</label>
                    <input
                      type="text"
                      value={newAnonDescription}
                      onChange={(e) => setNewAnonDescription(e.target.value)}
                      placeholder="VD: Cấp cho đối tác thử nghiệm trải nghiệm"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingAnon}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus size={15} />
                    <span>{creatingAnon ? 'Đang tạo...' : 'Tạo Mã VIP Ẩn Danh'}</span>
                  </button>
                </form>

                {/* Anonymous Passes List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {anonymousPasses.length === 0 ? (
                    <div className="text-center py-6 text-zinc-500 text-xs">Chưa có mã ẩn danh nào.</div>
                  ) : (
                    anonymousPasses.map((pass) => (
                      <div key={pass.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-amber-300">{pass.passCode}</span>
                            <span className="text-[10px] px-2 py-0.2 bg-amber-500/10 text-amber-300 rounded font-bold">
                              {pass.type === '3_digit_month' ? '1 Tháng (30d)' : '1 Tuần (7d)'}
                            </span>
                            <button
                              onClick={() => handleCopy(pass.passCode, pass.id)}
                              className="text-zinc-500 hover:text-white"
                              title="Sao chép mã"
                            >
                              {copiedId === pass.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{pass.description || 'Mã VIP Ẩn Danh'}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Lượt kích hoạt: {pass.usedCount || 0} lần
                          </p>
                        </div>

                        <button
                          onClick={() => deleteAnonymousPass(pass.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Xóa mã"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB 6: System Transparency Audit Logs */}
        {activeSubSection === 'audit_logs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Severity Filter Bar */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={auditLogSearch}
                  onChange={(e) => setAuditLogSearch(e.target.value)}
                  placeholder="Tìm kiếm nhật ký, hành động, ID..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['all', 'info', 'warning', 'danger', 'critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAuditSeverityFilter(sev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      auditSeverityFilter === sev
                        ? 'bg-sky-500 text-black shadow-md'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {sev === 'all' ? 'Tất cả mức độ' : sev.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Logs List */}
            <div className="space-y-2.5">
              {filteredAuditLogs.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
                  Không tìm thấy sự kiện kiểm toán nào phù hợp với bộ lọc.
                </div>
              ) : (
                filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase ${
                          log.severity === 'critical' || log.severity === 'danger'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-bold text-white text-sm">{log.actionTitle}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {log.createdAt ? new Date(log.createdAt?.seconds ? log.createdAt.seconds * 1000 : log.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span className="text-amber-400 font-mono font-semibold">Thực hiện bởi: {log.actorName} ({log.actorEmail || 'Admin'})</span>
                      {log.targetId && (
                        <span className="font-mono text-zinc-500 text-[10px]">Target ID: {log.targetId}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
