import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Wrench, 
  Coins, 
  Crown, 
  UserCheck, 
  KeyRound, 
  ShieldAlert, 
  Save, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Zap,
  Flame,
  Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemGlobalConfig } from '../../types';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SystemConfigTabProps {
  showToast: (msg: string) => void;
}

const DEFAULT_CONFIG: SystemGlobalConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang được nâng cấp máy chủ audio Lossless. Vui lòng quay lại sau ít phút.',
  pointMultiplier: 1.0,
  vipDiscountPercent: 0,
  allowNewRegistrations: true,
  allowAuthorRegistrations: true,
  allowAnonymousPasses: true,
  dailyCheckinBonus: 50,
};

export function SystemConfigTab({ showToast }: SystemConfigTabProps) {
  const { user, isSuperAdmin, logSystemActivity } = useAuth();
  const [config, setConfig] = useState<SystemGlobalConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'systemSettings', 'globalConfig'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as SystemGlobalConfig);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, 'systemSettings', 'globalConfig'), config, { merge: true });

      await logSystemActivity({
        action: 'UPDATE_SYSTEM_CONFIG',
        actionTitle: 'Cập Nhật Cấu Hình Toàn Cục',
        targetType: 'system_config',
        targetId: 'globalConfig',
        targetName: 'Cấu hình hệ thống',
        details: `Bảo trì: ${config.maintenanceMode ? 'BẬT' : 'TẮT'}, Hệ số điểm: ${config.pointMultiplier}x, Giảm giá VIP: ${config.vipDiscountPercent}%, Điểm danh: +${config.dailyCheckinBonus} xu.`,
        severity: config.maintenanceMode ? 'critical' : 'warning'
      });

      showToast('Đã lưu cấu hình hệ thống toàn cục thành công!');
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Cấu Hình Tham Số & Bảo Trì Toàn Hệ Thống</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Global Parameters
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Điều chỉnh tốc độ cày xu, khuyến mãi VIP toàn sàn và kích hoạt trạng thái bảo trì khẩn cấp.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Sparkles size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Lưu Cấu Hình Ngay</span>
        </button>
      </div>

      <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MAINTENANCE MODE CARD */}
        <div className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
          config.maintenanceMode 
            ? 'bg-gradient-to-br from-rose-950/40 via-zinc-950 to-zinc-950 border-rose-500/50' 
            : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                config.maintenanceMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Wrench size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Chế Độ Bảo Trì Khẩn Cấp</h3>
                <p className="text-[11px] text-zinc-400">Hiển thị cảnh báo nâng cấp tới mọi người dùng</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Thông Điệp Bảo Trì
            </label>
            <textarea
              value={config.maintenanceMessage}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              rows={3}
              placeholder="Thông báo hiển thị cho người dùng trong thời gian bảo trì..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>

        {/* REWARDS & POINTS MULTIPLIER */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hệ Số Thưởng Xu Toàn Sàn (X-Factor)</h3>
              <p className="text-[11px] text-zinc-400">Nhân điểm thưởng nghe nhạc & hoạt động trong dịp lễ hội</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Hệ Số Nhân Điểm
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={config.pointMultiplier}
                  onChange={(e) => setConfig({ ...config, pointMultiplier: parseFloat(e.target.value) || 1.0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                />
                <span className="text-xs font-black text-amber-400">x</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Thưởng Điểm Danh Hàng Ngày
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={config.dailyCheckinBonus}
                  onChange={(e) => setConfig({ ...config, dailyCheckinBonus: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                />
                <span className="text-xs font-black text-amber-400">Xu</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
            {config.pointMultiplier > 1 ? (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Flame size={14} className="text-orange-500" />
                Sự kiện nhân {config.pointMultiplier}x điểm đang kích hoạt cho toàn bộ người nghe!
              </span>
            ) : (
              <span>Hệ số nhân bình thường (1.0x). Người dùng nhận 5 xu mỗi phút nghe nhạc.</span>
            )}
          </div>
        </div>

        {/* VIP GLOBAL DISCOUNT */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Crown size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Giảm Giá Gói VIP Toàn Sàn (%)</h3>
              <p className="text-[11px] text-zinc-400">Áp dụng chiết khấu tự động cho tất cả gói đăng ký VIP</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Phần Trăm Giảm Giá Toàn Cục
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="70"
                step="5"
                value={config.vipDiscountPercent}
                onChange={(e) => setConfig({ ...config, vipDiscountPercent: parseInt(e.target.value, 10) || 0 })}
                className="w-full accent-purple-500"
              />
              <span className="text-base font-black text-purple-300 font-mono w-14 text-right">
                {config.vipDiscountPercent}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Trạng thái ưu đãi:</span>
            <span className="font-bold text-purple-300">
              {config.vipDiscountPercent > 0 ? `Đang giảm ${config.vipDiscountPercent}% toàn bộ gói` : 'Giá gốc niêm yết'}
            </span>
          </div>
        </div>

        {/* SYSTEM TOGGLES */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cổng Đăng Ký & Phát Hành Mã</h3>
              <p className="text-[11px] text-zinc-400">Bật/tắt các cổng chức năng của nền tảng</p>
            </div>
          </div>

          <label className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Cho Phép Mở Cổng Đăng Ký Tác Giả eKYC</p>
              <p className="text-[10px] text-zinc-400">Người dùng có thể gửi hồ sơ xác minh CCCD</p>
            </div>
            <input
              type="checkbox"
              checked={config.allowAuthorRegistrations}
              onChange={(e) => setConfig({ ...config, allowAuthorRegistrations: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded"
            />
          </label>

          <label className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Cho Phép Kích Hoạt Mã Ẩn Danh (3 Số)</p>
              <p className="text-[10px] text-zinc-400">Người dùng ẩn danh có thể dùng mã VIP 1 tháng & 1 tuần</p>
            </div>
            <input
              type="checkbox"
              checked={config.allowAnonymousPasses}
              onChange={(e) => setConfig({ ...config, allowAnonymousPasses: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded"
            />
          </label>
        </div>
      </form>
    </div>
  );
}
