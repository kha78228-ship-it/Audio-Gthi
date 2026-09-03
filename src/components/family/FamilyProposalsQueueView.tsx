import React, { useState } from 'react';
import { FamilyProposal, FamilyRole, FamilyTreeMember as FamilyMember } from '../../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Crown, 
  UserCheck, 
  Users, 
  AlertTriangle, 
  Send, 
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';

interface FamilyProposalsQueueViewProps {
  proposals: FamilyProposal[];
  userRole: FamilyRole;
  onChangeUserRole: (newRole: FamilyRole) => void;
  onApproveProposal: (proposal: FamilyProposal) => void;
  onRejectProposal: (proposalId: string, note: string) => void;
  onSubmitNewProposal: (newProp: Omit<FamilyProposal, 'id' | 'createdAt' | 'status'>) => void;
  allMembers: FamilyMember[];
}

export const FamilyProposalsQueueView: React.FC<FamilyProposalsQueueViewProps> = ({
  proposals,
  userRole,
  onChangeUserRole,
  onApproveProposal,
  onRejectProposal,
  onSubmitNewProposal,
  allMembers
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<string>('');

  // Quick proposal form state for descendants
  const [showMemberProposalForm, setShowMemberProposalForm] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [proposerName, setProposerName] = useState<string>('Nguyễn Phúc Hậu Duệ');
  const [proposalReason, setProposalReason] = useState<string>('');
  const [proposedNewField, setProposedNewField] = useState<string>('');

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalReason.trim()) {
      alert('Vui lòng nêu lý do hoặc nội dung cần bổ sung');
      return;
    }
    const targetMember = allMembers.find(m => m.id === targetMemberId);
    onSubmitNewProposal({
      treeId: 'tree_nguyen_phuc_main',
      targetMemberId: targetMemberId || undefined,
      targetMemberName: targetMember?.fullName,
      proposalType: targetMemberId ? 'edit_member' : 'add_member',
      proposedByUid: 'user_active_client',
      proposedByName: proposerName.trim(),
      proposedData: {
        suggestedNotes: proposedNewField.trim()
      },
      reason: proposalReason.trim()
    });
    setProposalReason('');
    setProposedNewField('');
    setShowMemberProposalForm(false);
    alert('Đề xuất của bạn đã được gửi tới Trưởng Tộc và Ban Trị Sự dòng họ xem xét!');
  };

  const filteredProposals = proposals.filter(p => {
    if (filterStatus === 'pending') return p.status === 'pending';
    if (filterStatus === 'reviewed') return p.status !== 'pending';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Role Switcher & RBAC Header Bar */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-200">
                Phân Quyền Dòng Tộc & Hộp Thư Phê Duyệt
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                userRole === 'admin' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'bg-purple-900 text-purple-200 border border-purple-500/30'
              }`}>
                {userRole === 'admin' ? '👑 Trưởng Tộc / Quản Trị Viên' : '👤 Con Cháu / Thành Viên'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {userRole === 'admin'
                ? 'Bạn có toàn quyền thêm, sửa, xóa, duyệt đề xuất và bảo mật phả hệ dòng họ.'
                : 'Bạn đang xem ở quyền con cháu: được gửi đề xuất bổ sung thông tin lên Trưởng họ duyệt.'}
            </p>
          </div>
        </div>

        {/* Live Role Simulation Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 pl-2">Góc nhìn:</span>
          <button
            id="role-toggle-admin"
            onClick={() => onChangeUserRole('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              userRole === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 Trưởng Họ
          </button>
          <button
            id="role-toggle-member"
            onClick={() => onChangeUserRole('member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              userRole === 'member'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👤 Con Cháu
          </button>
        </div>
      </div>

      {/* Action to create proposal for member */}
      {userRole === 'member' && (
        <div className="p-4 bg-slate-900 border border-purple-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm font-bold text-purple-200">Bạn muốn bổ sung thông tin vào gia phả?</p>
              <p className="text-xs text-slate-400">Gửi thông tin thành viên mới sinh, học vị, công danh để Trưởng tộc cập nhật.</p>
            </div>
          </div>
          <button
            id="btn-open-new-proposal-form"
            onClick={() => setShowMemberProposalForm(!showMemberProposalForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shrink-0"
          >
            ✍️ Gửi Đề Xuất Mới
          </button>
        </div>
      )}

      {/* Member proposal form modal/drawer */}
      {showMemberProposalForm && (
        <div className="p-5 bg-slate-900 border border-purple-500/40 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-purple-300">Biểu Mẫu Gửi Đề Xuất Lên Trưởng Tộc</h4>
          <form onSubmit={handleSendProposal} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Họ tên người gửi</label>
                <input
                  type="text"
                  value={proposerName}
                  onChange={(e) => setProposerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Thành viên liên quan trong dòng họ</label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">-- Đề xuất ghi danh thành viên mới chào đời --</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Nội dung đề xuất cập nhật (Học vị, thành tựu, sinh/mất...)</label>
                <textarea
                  rows={2}
                  value={proposedNewField}
                  onChange={(e) => setProposedNewField(e.target.value)}
                  placeholder="Ví dụ: Vừa bảo vệ thành công Thạc sĩ tại ĐH Quốc Gia..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">Lý do & Lời nhắn gửi Trưởng họ</label>
                <textarea
                  rows={2}
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  placeholder="Kính gửi Bác Trưởng tộc, con cháu xin phép được báo cáo..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMemberProposalForm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-send-proposal"
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg"
              >
                Gửi Lên Trưởng Tộc
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs for Proposals */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            filterStatus === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Tất cả đề xuất ({proposals.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            filterStatus === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
          }`}
        >
          ⏳ Chờ duyệt ({proposals.filter(p => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('reviewed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            filterStatus === 'reviewed' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
          }`}
        >
          ✅ Đã xử lý ({proposals.filter(p => p.status !== 'pending').length})
        </button>
      </div>

      {/* Proposals List Cards */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/40 mb-2" />
            <p className="font-semibold text-slate-300">Không có đề xuất nào trong danh mục này</p>
          </div>
        ) : (
          filteredProposals.map((prop) => (
            <motion.div
              key={prop.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    prop.status === 'pending' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : prop.status === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {prop.status === 'pending' && '⏳ Chờ Trưởng họ duyệt'}
                    {prop.status === 'approved' && '✅ Đã chuẩn y vào phả hệ'}
                    {prop.status === 'rejected' && '❌ Từ chối'}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">
                    Loại: {prop.proposalType === 'add_member' ? 'Bổ sung thành viên' : 'Cập nhật thông tin'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(prop.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Người đề xuất: <strong className="text-amber-200">{prop.proposedByName}</strong> 
                  {prop.proposedByEmail && ` (${prop.proposedByEmail})`}
                </p>
                {prop.targetMemberName && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thành viên thụ hưởng: <strong className="text-white">{prop.targetMemberName}</strong>
                  </p>
                )}
              </div>

              {/* Reason */}
              {prop.reason && (
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                  <span className="text-amber-400 font-semibold block mb-0.5">Lời nhắn / Lý do:</span>
                  <p className="italic">{prop.reason}</p>
                </div>
              )}

              {/* Review Note if any */}
              {prop.reviewNote && (
                <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-300">
                  <strong>Ý kiến Trưởng Tộc ({prop.reviewedBy}):</strong> {prop.reviewNote}
                </div>
              )}

              {/* Admin Actions if pending */}
              {userRole === 'admin' && prop.status === 'pending' && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  {rejectingId === prop.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Nhập lý do từ chối..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          onRejectProposal(prop.id, rejectNote || 'Thông tin chưa đủ xác thực');
                          setRejectingId(null);
                          setRejectNote('');
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Xác nhận từ chối
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRejectingId(prop.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
                      >
                        Từ Chối
                      </button>
                      <button
                        id={`btn-approve-prop-${prop.id}`}
                        onClick={() => onApproveProposal(prop)}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Chuẩn Y & Cập Nhật Phả Hệ
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* RBAC Matrix Explainer Card */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-400">
        <h4 className="font-bold text-amber-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          Quy Chế Phân Quyền Gia Tộc (Role-Based Access Control)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-amber-500/20">
            <span className="text-amber-300 font-bold block mb-1">👑 Trưởng Họ (Admin)</span>
            <p className="text-[11px] text-slate-300">Toàn quyền cao nhất: thêm thành viên, chỉnh sửa thông tin, xóa, phân quyền biên tập viên, phê duyệt các đề xuất cập nhật từ con cháu.</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/20">
            <span className="text-blue-300 font-bold block mb-1">✍️ Biên Tập Viên (Editor)</span>
            <p className="text-[11px] text-slate-300">Các thành viên Ban Trị Sự được ủy quyền: có thể soạn thảo, bổ sung tư liệu và sự kiện giỗ chạp.</p>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-purple-500/20">
            <span className="text-purple-300 font-bold block mb-1">👤 Con Cháu (Member)</span>
            <p className="text-[11px] text-slate-300">Xem toàn bộ cây gia phả, hồ sơ, sự kiện ngày giỗ; có quyền gửi đề xuất thông tin lên Trưởng họ phê duyệt.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
