import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Gift, 
  Info,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AnonymousPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AnonymousPassModal({ isOpen, onClose, onSuccess }: AnonymousPassModalProps) {
  const { activateAnonymousPass, anonymousVipSession, clearAnonymousVipSession, isVip } = useAuth();
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; durationDays?: number } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passCode.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await activateAnonymousPass(passCode);
    setLoading(false);
    setResult(res);

    if (res.success) {
      if (onSuccess) onSuccess();
    }
  };

  const handleQuickCode = (code: string) => {
    setPassCode(code);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-anon-pass-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-black shadow-lg shadow-amber-500/20 mb-3">
            <KeyRound size={28} className="animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            Kích Hoạt VIP Ẩn Danh
            <Crown size={20} className="text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
            Sử dụng trọn vẹn đặc quyền VIP <strong className="text-amber-300">không cần đăng nhập tài khoản</strong>.
          </p>
        </div>

        {/* Current Active Session Info if any */}
        {anonymousVipSession && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-300 truncate">
                  Đang dùng mã ẩn danh [{anonymousVipSession.code}]
                </p>
                <p className="text-[11px] text-zinc-400">
                  Hạn dùng: <span className="text-zinc-200 font-mono">{new Date(anonymousVipSession.expiresAt).toLocaleDateString('vi-VN')}</span> ({anonymousVipSession.type === '3_digit_month' ? 'Gói 1 Tháng' : 'Gói 1 Tuần'})
                </p>
              </div>
            </div>
            <button
              onClick={clearAnonymousVipSession}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
            >
              Hủy phiên
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Nhập Mã Ẩn Danh (VIP Code)
            </label>
            <div className="relative">
              <input
                id="anonymous-pass-input"
                type="text"
                value={passCode}
                onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                placeholder="VD: 888, 999, VIP7DAYS..."
                maxLength={20}
                className="w-full bg-zinc-900/90 border border-zinc-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-2xl px-4 py-3.5 text-base sm:text-lg font-mono font-bold text-white placeholder-zinc-600 outline-none transition-all uppercase tracking-widest text-center"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {passCode && (
                  <button
                    type="button"
                    onClick={() => setPassCode('')}
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quy định về thời hạn mã */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div 
              onClick={() => handleQuickCode('888')}
              className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Crown size={12} /> Mã 3 Chữ Số
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded">
                  1 Tháng (30 ngày)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Mã gồm đúng 3 số (VD: <span className="text-white font-mono font-bold">888, 999, 777</span>)
              </p>
            </div>

            <div 
              onClick={() => handleQuickCode('FREEVIP')}
              className="p-3 rounded-2xl bg-zinc-900/60 hover:bg-yellow-500/10 border border-zinc-800 hover:border-yellow-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                  <Clock size={12} /> Mã Tiêu Chuẩn
                </span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 font-mono font-bold px-1.5 py-0.5 rounded">
                  1 Tuần (7 ngày)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Các mã ký tự khác (VD: <span className="text-white font-mono font-bold">FREEVIP, AUDIOHUB</span>)
              </p>
            </div>
          </div>

          {/* Quick test badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
              <Gift size={12} /> Mã mẫu thử:
            </span>
            {['888', '999', '777', 'FREEVIP'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleQuickCode(code)}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            id="submit-anon-pass-btn"
            type="submit"
            disabled={loading || !passCode.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={18} />
                <span>Kích Hoạt VIP Ngay</span>
              </>
            )}
          </button>
        </form>

        {/* Message Result */}
        {result && (
          <div
            className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
              result.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {result.success ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">{result.message}</p>
              {result.success && (
                <p className="text-[11px] text-emerald-400/80 mt-1">
                  Đã tự động cấp định danh VIP Khách. Bạn có thể nghe nhạc Lossless và tải không giới hạn ngay bây giờ!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-amber-400" /> Bảo mật & Ẩn danh 100%
          </span>
          <span>Tự động lưu trên trình duyệt</span>
        </div>
      </div>
    </div>
  );
}
