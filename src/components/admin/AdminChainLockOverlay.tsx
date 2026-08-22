import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminChainLockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminChainLockOverlay({
  isOpen,
  onClose,
  onSuccess
}: AdminChainLockOverlayProps) {
  const { user, isAdmin, isSuperAdmin, accountId } = useAuth();
  const [phase, setPhase] = useState<'locking' | 'locked' | 'unlocking' | 'rejected'>('locking');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase('locking');
      setPasskeyInput('');
      setPasskeyError('');
      return;
    }

    setPhase('locking');

    // Sequence timing
    const lockTimer = setTimeout(() => {
      setPhase('locked');

      // If user has admin privilege, automatically unlock after brief scan
      if (isAdmin || isSuperAdmin) {
        setTimeout(() => {
          setPhase('unlocking');
          setTimeout(() => {
            onSuccess();
          }, 800);
        }, 1100);
      }
    }, 750);

    return () => clearTimeout(lockTimer);
  }, [isOpen, isAdmin, isSuperAdmin]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleVerifyPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim().toUpperCase();
    if (!clean) {
      setPasskeyError('Vui lòng nhập mã bảo mật quản trị.');
      return;
    }

    setIsVerifying(true);
    setPasskeyError('');

    setTimeout(() => {
      setIsVerifying(false);
      if (clean === 'ADMIN2026' || clean === 'HAEVYADMIN' || clean === 'HE2026' || clean === 'VIPADMIN') {
        setPhase('unlocking');
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setPasskeyError('Mã bảo mật Passkey không chính xác. Vui lòng kiểm tra lại.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl select-none animate-in fade-in duration-200 overflow-hidden">
      
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0.95)_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-all cursor-pointer shadow-lg active:scale-95"
        title="Đóng / Hủy truy cập"
      >
        <X size={20} />
      </button>

      {/* ========================================================================= */}
      {/* TWO REALISTIC MOVING CHAINS (HAI SỢI XÍCH KÉO TỪ 2 BÊN VÀO GIỮA)           */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        
        {/* Left Chain - Enters from Left border towards Center */}
        <div 
          className={`absolute w-[160vw] sm:w-[130vw] h-16 sm:h-20 origin-center flex items-center shadow-[0_0_40px_rgba(0,0,0,0.95)] ${
            phase === 'unlocking' ? 'animate-chain-retract-left' : 'animate-chain-enter-left'
          }`}
          style={{ zIndex: 10 }}
        >
          <div 
            className="w-full h-full animate-chain-slide-1 flex items-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='50' viewBox='0 0 80 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect x='4' y='14' width='48' height='22' rx='11' stroke='%23f59e0b' stroke-width='4.5' fill='%2318181b'/%3E%3Crect x='9' y='18' width='38' height='14' rx='7' fill='%2327272a' stroke='%23fbbf24' stroke-width='2'/%3E%3Ccircle cx='28' cy='25' r='3.5' fill='%23f59e0b'/%3E%3Crect x='38' y='9' width='38' height='32' rx='9' stroke='%2371717a' stroke-width='5' fill='%2309090b'/%3E%3Crect x='43' y='14' width='28' height='22' rx='6' stroke='%23a1a1aa' stroke-width='1.5' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '80px 50px',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.9))'
            }}
          />
          {/* Glowing laser power rail */}
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 animate-pulse" />
        </div>

        {/* Right Chain - Enters from Right border towards Center */}
        <div 
          className={`absolute w-[160vw] sm:w-[130vw] h-16 sm:h-20 origin-center flex items-center shadow-[0_0_40px_rgba(0,0,0,0.95)] ${
            phase === 'unlocking' ? 'animate-chain-retract-right' : 'animate-chain-enter-right'
          }`}
          style={{ zIndex: 11 }}
        >
          <div 
            className="w-full h-full animate-chain-slide-2 flex items-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='50' viewBox='0 0 80 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect x='4' y='14' width='48' height='22' rx='11' stroke='%23ef4444' stroke-width='4.5' fill='%2318181b'/%3E%3Crect x='9' y='18' width='38' height='14' rx='7' fill='%2327272a' stroke='%23f87171' stroke-width='2'/%3E%3Ccircle cx='28' cy='25' r='3.5' fill='%23ef4444'/%3E%3Crect x='38' y='9' width='38' height='32' rx='9' stroke='%2352525b' stroke-width='5' fill='%2309090b'/%3E%3Crect x='43' y='14' width='28' height='22' rx='6' stroke='%239ca3af' stroke-width='1.5' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '80px 50px',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.9))'
            }}
          />
          {/* Glowing red power rail */}
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80 animate-pulse" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENTRAL SECURITY VAULT & PADLOCK (Ổ KHOÁ Ở GIỮA)                          */}
      {/* ========================================================================= */}
      <div className="relative z-30 flex flex-col items-center max-w-md w-full px-4 text-center">
        
        {/* Center Padlock with Snap & Glow */}
        <div className="relative mb-6">
          
          {/* Radiant Halo & Laser Scanner */}
          <div className={`absolute -inset-6 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
            phase === 'unlocking'
              ? 'bg-emerald-500/40'
              : isAdmin || isSuperAdmin
              ? 'bg-amber-500/35'
              : 'bg-rose-500/30'
          }`} />

          {/* Master Heavy Padlock Body */}
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 shadow-2xl transition-all duration-500 flex items-center justify-center animate-padlock-snap ${
            phase === 'unlocking'
              ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-emerald-500/50'
              : 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 shadow-amber-500/40'
          }`}>
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden border border-zinc-800">
              
              {/* Vertical Laser Scan beam */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-laser-scan pointer-events-none" />

              {/* Padlock Icon & Shackle Animation */}
              {phase === 'unlocking' ? (
                <div className="flex flex-col items-center gap-1 text-emerald-400 animate-in zoom-in-75 duration-300">
                  <Unlock size={46} className="text-emerald-400 animate-bounce" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">MỞ KHÓA</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-amber-400">
                  <div className="relative">
                    <Lock size={46} className="text-amber-400 fill-amber-500/20" />
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-amber-300 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase font-mono">BẢO MẬT ADMIN</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Status Message */}
        <div className="space-y-2 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs font-bold shadow-md">
            <ShieldCheck size={14} className={phase === 'unlocking' ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-white">Trung Tâm Quản Trị Haevy Admin</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {phase === 'unlocking' ? (
              <span className="text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                Xác Thực Quản Trị Thành Công
              </span>
            ) : phase === 'locking' ? (
              <span className="text-amber-300 flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Đang Kích Hoạt Xích Khóa Bảo Mật...
              </span>
            ) : isAdmin || isSuperAdmin ? (
              <span className="text-amber-300 flex items-center justify-center gap-2">
                <Sparkles size={18} />
                Đang Nhận Diện Quyền Admin...
              </span>
            ) : (
              <span className="text-zinc-100">
                Yêu Cầu Quyền Quản Trị Hệ Thống
              </span>
            )}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {phase === 'unlocking'
              ? 'Đang mở cổng điều khiển trung tâm và kiểm toán máy chủ...'
              : isAdmin || isSuperAdmin
              ? 'Tài khoản của bạn đã được cấp quyền Quản trị viên chính thức.'
              : 'Khu vực bảo mật tối cao dành riêng cho Quản trị viên. Vui lòng nhập mã Passkey hoặc liên hệ Super Admin.'}
          </p>
        </div>

        {/* Verification Status Card / Passkey Form for Non-Admin */}
        {phase === 'locked' && !isAdmin && !isSuperAdmin && (
          <div className="mt-5 w-full bg-zinc-900/95 border border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-2xl space-y-3.5 text-left animate-in slide-in-from-bottom-3 duration-250">
            
            {/* Account ID helper */}
            {accountId && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[10px] block font-mono">ID TÀI KHOẢN CỦA BẠN</span>
                  <span className="font-mono font-bold text-amber-300">{accountId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId ? 'Đã chép' : 'Sao chép ID'}</span>
                </button>
              </div>
            )}

            {/* Passkey Input Form */}
            <form onSubmit={handleVerifyPasskey} className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <KeyRound size={13} className="text-amber-400" />
                <span>Nhập Passkey Bảo Mật / Mã Quản Trị:</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Nhập mã bảo mật (VD: ADMIN2026)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 tracking-wider"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  <span>Xác Thực</span>
                </button>
              </div>

              {passkeyError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{passkeyError}</span>
                </p>
              )}
            </form>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Quay lại
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhase('unlocking');
                  setTimeout(() => {
                    onSuccess();
                  }, 800);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <span>Xem Thử Giao Diện Admin</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
