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
  Zap,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playChainLockSound, playChainUnlockSound } from '../../utils/chainSoundFX';

interface AdminChainLockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Ultra-realistic 3D metallic dark-titanium & gold link SVG pattern
const GOLD_CHAIN_SVG = `data:image/svg+xml,%3Csvg width='96' height='60' viewBox='0 0 96 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='goldGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef08a'/%3E%3Cstop offset='30%25' stop-color='%23f59e0b'/%3E%3Cstop offset='70%25' stop-color='%23b45309'/%3E%3Cstop offset='100%25' stop-color='%2378350f'/%3E%3C/linearGradient%3E%3ClinearGradient id='steelGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2371717a'/%3E%3Cstop offset='50%25' stop-color='%2327272a'/%3E%3Cstop offset='100%25' stop-color='%2309090b'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeDropShadow dx='0' dy='4' stdDeviation='4' flood-color='%23000000' flood-opacity='0.9'/%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd' filter='url(%23glow)'%3E%3Crect x='4' y='16' width='56' height='28' rx='14' stroke='url(%23goldGrad)' stroke-width='6.5' fill='%2318181b'/%3E%3Crect x='10' y='21' width='44' height='18' rx='9' fill='%2327272a' stroke='%23fef08a' stroke-width='1.5'/%3E%3Ccircle cx='32' cy='30' r='4' fill='%23f59e0b'/%3E%3Ccircle cx='32' cy='30' r='2' fill='%23ffffff'/%3E%3Crect x='44' y='10' width='48' height='40' rx='12' stroke='url(%23steelGrad)' stroke-width='7' fill='%2309090b'/%3E%3Crect x='50' y='16' width='36' height='28' rx='8' stroke='%23a1a1aa' stroke-width='2' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E`;

// Ultra-realistic 3D metallic dark-titanium & crimson cyber link SVG pattern
const RED_CHAIN_SVG = `data:image/svg+xml,%3Csvg width='96' height='60' viewBox='0 0 96 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='redGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fecdd3'/%3E%3Cstop offset='30%25' stop-color='%23f43f5e'/%3E%3Cstop offset='70%25' stop-color='%23be123c'/%3E%3Cstop offset='100%25' stop-color='%23881337'/%3E%3C/linearGradient%3E%3ClinearGradient id='steelGrad2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2352525b'/%3E%3Cstop offset='50%25' stop-color='%2318181b'/%3E%3Cstop offset='100%25' stop-color='%23000000'/%3E%3C/linearGradient%3E%3Cfilter id='glow2'%3E%3CfeDropShadow dx='0' dy='4' stdDeviation='4' flood-color='%23000000' flood-opacity='0.9'/%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd' filter='url(%23glow2)'%3E%3Crect x='4' y='16' width='56' height='28' rx='14' stroke='url(%23redGrad)' stroke-width='6.5' fill='%2318181b'/%3E%3Crect x='10' y='21' width='44' height='18' rx='9' fill='%2327272a' stroke='%23fecdd3' stroke-width='1.5'/%3E%3Ccircle cx='32' cy='30' r='4' fill='%23f43f5e'/%3E%3Ccircle cx='32' cy='30' r='2' fill='%23ffffff'/%3E%3Crect x='44' y='10' width='48' height='40' rx='12' stroke='url(%23steelGrad2)' stroke-width='7' fill='%2309090b'/%3E%3Crect x='50' y='16' width='36' height='28' rx='8' stroke='%23fda4af' stroke-width='2' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E`;

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
    // Sound FX: Trigger heavy metallic lock audio
    playChainLockSound();

    // Sequence timing
    const lockTimer = setTimeout(() => {
      setPhase('locked');

      // If user has admin privilege, automatically unlock after brief scan
      if (isAdmin || isSuperAdmin) {
        setTimeout(() => {
          setPhase('unlocking');
          playChainUnlockSound();
          setTimeout(() => {
            onSuccess();
          }, 850);
        }, 1200);
      }
    }, 800);

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
        playChainUnlockSound();
        setTimeout(() => {
          onSuccess();
        }, 850);
      } else {
        setPasskeyError('Mã bảo mật Passkey không chính xác. Vui lòng kiểm tra lại.');
      }
    }, 600);
  };

  const handleDemoUnlock = () => {
    setPhase('unlocking');
    playChainUnlockSound();
    setTimeout(() => {
      onSuccess();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none animate-in fade-in duration-200 overflow-hidden">
      
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,rgba(239,68,68,0.1)_45%,rgba(0,0,0,0.98)_85%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 transition-all cursor-pointer shadow-2xl active:scale-95"
        title="Đóng / Hủy truy cập"
      >
        <X size={20} />
      </button>

      {/* ========================================================================= */}
      {/* 2 REALISTIC METALLIC DIAGONAL CROSSING CHAINS (2 XÍCH CHÉO NHAU CHUYỂN ĐỘNG) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        
        {/* CHAIN 1: Gold / Amber Titanium Chain (Diagonal Top-Left to Bottom-Right) */}
        <div 
          className={`absolute w-[220vw] sm:w-[160vw] h-20 sm:h-24 origin-center flex items-center shadow-[0_0_50px_rgba(0,0,0,0.98)] ${
            phase === 'unlocking' ? 'animate-chain-diag-retract-1' : 'animate-chain-diag-enter-1'
          }`}
          style={{ zIndex: 10 }}
        >
          <div 
            className="w-full h-full animate-chain-slide-1 flex items-center"
            style={{
              backgroundImage: `url("${GOLD_CHAIN_SVG}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '96px 60px',
              filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.95))'
            }}
          />
          {/* Glowing laser power beam along chain */}
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90 animate-pulse" />
          <div className="absolute inset-x-0 h-[1px] bg-white opacity-80 blur-[0.5px]" />
        </div>

        {/* CHAIN 2: Crimson / Ruby Cyber Alloy Chain (Diagonal Top-Right to Bottom-Left) */}
        <div 
          className={`absolute w-[220vw] sm:w-[160vw] h-20 sm:h-24 origin-center flex items-center shadow-[0_0_50px_rgba(0,0,0,0.98)] ${
            phase === 'unlocking' ? 'animate-chain-diag-retract-2' : 'animate-chain-diag-enter-2'
          }`}
          style={{ zIndex: 12 }}
        >
          <div 
            className="w-full h-full animate-chain-slide-2 flex items-center"
            style={{
              backgroundImage: `url("${RED_CHAIN_SVG}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '96px 60px',
              filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.95))'
            }}
          />
          {/* Glowing red plasma power rail along chain */}
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90 animate-pulse" />
          <div className="absolute inset-x-0 h-[1px] bg-white opacity-80 blur-[0.5px]" />
        </div>

        {/* Intersection Energy Sparks */}
        <div className="absolute z-15 w-44 h-44 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 blur-xl animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      {/* ========================================================================= */}
      {/* CENTRAL HEAVY BIOMETRIC PADLOCK (Ổ KHOÁ CƠ KHÍ & SINH TRẮC HỌC TỐI CAO)       */}
      {/* ========================================================================= */}
      <div className="relative z-30 flex flex-col items-center max-w-md w-full px-4 text-center">
        
        {/* Center Padlock with Snap & Glow */}
        <div className="relative mb-6">
          
          {/* Radiant Halo */}
          <div className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            phase === 'unlocking'
              ? 'bg-emerald-500/50'
              : isAdmin || isSuperAdmin
              ? 'bg-amber-500/40'
              : 'bg-rose-500/35'
          }`} />

          {/* Master Heavy Padlock Assembly */}
          <div className={`relative animate-padlock-snap transition-all duration-500 ${
            phase === 'unlocking' ? 'scale-105' : 'scale-100'
          }`}>
            
            {/* Padlock Steel Shackle (Càng khoá vòng thép) */}
            <div className={`mx-auto w-20 h-16 rounded-t-full border-[6px] transition-all duration-400 relative ${
              phase === 'unlocking'
                ? 'border-emerald-400 -translate-y-4 shadow-[0_0_25px_rgba(52,211,153,0.8)]'
                : 'border-zinc-300 translate-y-2 shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-shackle-snap'
            } bg-transparent`} />

            {/* Main Solid Vault Lock Body */}
            <div className={`relative -mt-3 w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1.5 shadow-2xl transition-all duration-500 flex items-center justify-center ${
              phase === 'unlocking'
                ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-800 shadow-emerald-500/60'
                : 'bg-gradient-to-br from-amber-400 via-yellow-500 to-rose-700 shadow-amber-500/50'
            }`}>
              <div className="w-full h-full bg-zinc-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden border border-zinc-800 shadow-inner">
                
                {/* Laser scan line inside lock */}
                <div className={`absolute inset-x-0 h-1.5 ${
                  phase === 'unlocking' ? 'bg-emerald-400' : 'bg-rose-500'
                } animate-laser-scan blur-[0.5px] pointer-events-none`} />

                {/* Padlock Icon & State */}
                {phase === 'unlocking' ? (
                  <div className="flex flex-col items-center gap-1.5 text-emerald-400 animate-in zoom-in-75 duration-300">
                    <Unlock size={52} className="text-emerald-400 animate-bounce drop-shadow-[0_0_15px_rgba(52,211,153,0.9)]" />
                    <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase font-mono">ĐÃ MỞ KHÓA</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-amber-400">
                    <div className="relative">
                      <Lock size={48} className="text-amber-400 fill-amber-500/20 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-300 rounded-full animate-pulse" />
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase font-mono mt-0.5">BẢO MẬT 2 XÍCH</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interlocking corner rivets */}
            <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-zinc-800 border-2 border-amber-500 shadow-md flex items-center justify-center">
              <Zap size={10} className="text-amber-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 border-2 border-rose-500 shadow-md flex items-center justify-center">
              <Flame size={10} className="text-rose-400" />
            </div>
          </div>
        </div>

        {/* Title & Status Message */}
        <div className="space-y-2 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/95 border border-zinc-700/80 text-xs font-bold shadow-xl">
            <ShieldCheck size={15} className={phase === 'unlocking' ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-white">Haevy Admin Security • Khóa Kép 2 Xích</span>
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
                Đang Khóa 2 Sợi Xích Bảo Mật...
              </span>
            ) : isAdmin || isSuperAdmin ? (
              <span className="text-amber-300 flex items-center justify-center gap-2">
                <Sparkles size={18} className="animate-spin" />
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
              ? 'Đang mở khóa xích và kết nối trung tâm kiểm toán máy chủ...'
              : isAdmin || isSuperAdmin
              ? 'Tài khoản của bạn đã được chứng thực Super Admin / Quản trị viên.'
              : 'Khu vực tối mật được bảo vệ bởi 2 lớp xích cơ khí & khóa sinh trắc học. Nhập Passkey để mở.'}
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  <span>Mở Khóa</span>
                </button>
              </div>

              {passkeyError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{passkeyError}</span>
                </p>
              )}
            </form>

            <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Quay lại
              </button>

              <button
                type="button"
                onClick={handleDemoUnlock}
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

