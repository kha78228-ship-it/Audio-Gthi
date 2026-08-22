import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  Users, 
  Crown, 
  Coins, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface BatchOperationsTabProps {
  showToast: (msg: string) => void;
}

export function BatchOperationsTab({ showToast }: BatchOperationsTabProps) {
  const { user, logSystemActivity } = useAuth();
  const [targetGroup, setTargetGroup] = useState<'all' | 'vip' | 'authors' | 'free'>('all');
  const [pointsBonus, setPointsBonus] = useState<number>(100);
  const [vipDaysBonus, setVipDaysBonus] = useState<number>(0);
  const [reason, setReason] = useState<string>('Quà tặng tri ân toàn sàn từ Quản Trị Viên');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);

  const handleExecuteBatchReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pointsBonus <= 0 && vipDaysBonus <= 0) {
      showToast('Vui lòng nhập số điểm xu hoặc số ngày VIP cần thưởng.');
      return;
    }

    if (!window.confirm(`XÁC NHẬN: Bạn có chắc muốn trao thưởng cho nhóm [${targetGroup.toUpperCase()}] với ${pointsBonus} Xu và ${vipDaysBonus} ngày VIP? Thao tác này sẽ áp dụng ngay lập tức cho toàn bộ người dùng phù hợp.`)) {
      return;
    }

    setIsProcessing(true);
    setProcessedCount(null);

    try {
      const snap = await getDocs(collection(db, 'users'));
      let count = 0;

      const updatePromises: Promise<any>[] = [];

      snap.forEach((docSnap) => {
        const uData = docSnap.data();
        const isVipUser = uData.vipTier === 'vip';
        const isAuthorUser = uData.isAuthorVerified === true;

        // Filter group
        if (targetGroup === 'vip' && !isVipUser) return;
        if (targetGroup === 'authors' && !isAuthorUser) return;
        if (targetGroup === 'free' && isVipUser) return;

        count++;
        const userRef = doc(db, 'users', docSnap.id);

        const updatePayload: Record<string, any> = {};

        if (pointsBonus > 0) {
          updatePayload.audioPoints = increment(pointsBonus);
          updatePayload.totalEarnedPoints = increment(pointsBonus);
        }

        if (vipDaysBonus > 0) {
          const currentExp = uData.vipExpiresAt ? new Date(uData.vipExpiresAt).getTime() : Date.now();
          const baseTime = currentExp > Date.now() ? currentExp : Date.now();
          const newExp = new Date(baseTime + vipDaysBonus * 24 * 60 * 60 * 1000).toISOString();
          updatePayload.vipTier = 'vip';
          updatePayload.vipExpiresAt = newExp;
        }

        if (Object.keys(updatePayload).length > 0) {
          updatePromises.push(updateDoc(userRef, updatePayload));
        }
      });

      await Promise.all(updatePromises);

      await logSystemActivity({
        action: 'BATCH_REWARD',
        actionTitle: 'Tặng Thưởng Hàng Loạt (Batch Reward)',
        targetType: 'user',
        details: `Đã tặng thưởng cho ${count} người dùng [Nhóm: ${targetGroup.toUpperCase()}]: +${pointsBonus} Xu, +${vipDaysBonus} ngày VIP. Lý do: "${reason}".`,
        severity: 'warning'
      });

      setProcessedCount(count);
      showToast(`Đã tặng thưởng thành công cho ${count} tài khoản!`);
    } catch (err: any) {
      showToast(`Lỗi trao thưởng: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Tặng Thưởng Hàng Loạt & Bồi Thường Sự Cố</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Batch Rewards
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cấp phát điểm xu và ngày VIP cho nhiều người dùng đồng thời chỉ bằng một lần nhấn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM PANEL */}
        <div className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Gift size={16} className="text-emerald-400" />
            <span>Thiết Lập Gói Thưởng Hàng Loạt</span>
          </h3>

          <form onSubmit={handleExecuteBatchReward} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                1. Nhóm Người Dùng Mục Tiêu
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTargetGroup('all')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetGroup === 'all'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Users size={16} className="mx-auto mb-1" />
                  <span>Tất Cả Thành Viên</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetGroup('vip')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetGroup === 'vip'
                      ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Crown size={16} className="mx-auto mb-1" />
                  <span>Chỉ Thành Viên VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetGroup('authors')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetGroup === 'authors'
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Sparkles size={16} className="mx-auto mb-1" />
                  <span>Chỉ Tác Giả eKYC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetGroup('free')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    targetGroup === 'free'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Coins size={16} className="mx-auto mb-1" />
                  <span>Người Dùng Miễn Phí</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  2. Thưởng Điểm Xu (Audio Points)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={pointsBonus}
                    onChange={(e) => setPointsBonus(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-zinc-400">Xu/User</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  3. Thưởng Thêm Ngày VIP
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={vipDaysBonus}
                    onChange={(e) => setVipDaysBonus(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-purple-300 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-zinc-400">Ngày VIP</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                4. Lý Do Thưởng & Tin Nhắn Ghi Sổ
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Quà tặng bù đắp bảo trì máy chủ ngày 20/08"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isProcessing ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Thực Hiện Trao Thưởng Hàng Loạt Ngay</span>
            </button>
          </form>
        </div>

        {/* SUMMARY & STATUS PANEL */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ShieldAlert size={16} className="text-amber-400" />
              <span>Lưu Ý Vận Hành</span>
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-400 leading-relaxed">
              <p className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                ✨ <strong className="text-white">Cộng dồn tự động:</strong> Nếu người dùng đã là VIP, ngày VIP tặng thêm sẽ được nối tiếp vào hạn dùng hiện tại.
              </p>
              <p className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                📜 <strong className="text-white">Minh bạch 100%:</strong> Mọi thao tác trao thưởng hàng loạt đều được tự động lưu vào Nhật Ký Minh Bạch (Audit Logs).
              </p>
            </div>
          </div>

          {processedCount !== null && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs text-center animate-in fade-in">
              <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1" />
              <p className="font-bold">Đã phân phối thành công!</p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Tổng cộng {processedCount} người dùng đã nhận thưởng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
