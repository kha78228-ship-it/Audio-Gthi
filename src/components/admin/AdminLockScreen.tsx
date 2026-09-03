import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  Lock, 
  Unlock,
  KeyRound, 
  Home, 
  ArrowLeft, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  UserCheck,
  Headphones,
  Zap,
  Flame,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playChainLockSound, playChainUnlockSound } from '../../utils/chainSoundFX';

interface AdminLockScreenProps {
  onBackToHome?: () => void;
  onOpenAuth?: () => void;
  onUnlockSuccess?: () => void;
}

// Ultra-realistic 3D metallic dark-titanium & gold link SVG pattern
const GOLD_CHAIN_SVG = `data:image/svg+xml,%3Csvg width='96' height='60' viewBox='0 0 96 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='goldGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef08a'/%3E%3Cstop offset='30%25' stop-color='%23f59e0b'/%3E%3Cstop offset='70%25' stop-color='%23b45309'/%3E%3Cstop offset='100%25' stop-color='%2378350f'/%3E%3C/linearGradient%3E%3ClinearGradient id='steelGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2371717a'/%3E%3Cstop offset='50%25' stop-color='%2327272a'/%3E%3Cstop offset='100%25' stop-color='%2309090b'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeDropShadow dx='0' dy='4' stdDeviation='4' flood-color='%23000000' flood-opacity='0.9'/%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd' filter='url(%23glow)'%3E%3Crect x='4' y='16' width='56' height='28' rx='14' stroke='url(%23goldGrad)' stroke-width='6.5' fill='%2318181b'/%3E%3Crect x='10' y='21' width='44' height='18' rx='9' fill='%2327272a' stroke='%23fef08a' stroke-width='1.5'/%3E%3Ccircle cx='32' cy='30' r='4' fill='%23f59e0b'/%3E%3Ccircle cx='32' cy='30' r='2' fill='%23ffffff'/%3E%3Crect x='44' y='10' width='48' height='40' rx='12' stroke='url(%23steelGrad)' stroke-width='7' fill='%2309090b'/%3E%3Crect x='50' y='16' width='36' height='28' rx='8' stroke='%23a1a1aa' stroke-width='2' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E`;

// Ultra-realistic 3D metallic dark-titanium & crimson cyber link SVG pattern
const RED_CHAIN_SVG = `data:image/svg+xml,%3Csvg width='96' height='60' viewBox='0 0 96 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='redGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fecdd3'/%3E%3Cstop offset='30%25' stop-color='%23f43f5e'/%3E%3Cstop offset='70%25' stop-color='%23be123c'/%3E%3Cstop offset='100%25' stop-color='%23881337'/%3E%3C/linearGradient%3E%3ClinearGradient id='steelGrad2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2352525b'/%3E%3Cstop offset='50%25' stop-color='%2318181b'/%3E%3Cstop offset='100%25' stop-color='%23000000'/%3E%3C/linearGradient%3E%3Cfilter id='glow2'%3E%3CfeDropShadow dx='0' dy='4' stdDeviation='4' flood-color='%23000000' flood-opacity='0.9'/%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd' filter='url(%23glow2)'%3E%3Crect x='4' y='16' width='56' height='28' rx='14' stroke='url(%23redGrad)' stroke-width='6.5' fill='%2318181b'/%3E%3Crect x='10' y='21' width='44' height='18' rx='9' fill='%2327272a' stroke='%23fecdd3' stroke-width='1.5'/%3E%3Ccircle cx='32' cy='30' r='4' fill='%23f43f5e'/%3E%3Ccircle cx='32' cy='30' r='2' fill='%23ffffff'/%3E%3Crect x='44' y='10' width='48' height='40' rx='12' stroke='url(%23steelGrad2)' stroke-width='7' fill='%2309090b'/%3E%3Crect x='50' y='16' width='36' height='28' rx='8' stroke='%23fda4af' stroke-width='2' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E`;

export function AdminLockScreen({ onBackToHome, onOpenAuth, onUnlockSuccess }: AdminLockScreenProps) {
  const { user, accountId, role } = useAuth();
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Play subtle chain lock sound on initial screen render
    playChainLockSound();
  }, []);

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
      setPasskeyError('Vui lòng nhập mã bảo mật hoặc passkey quản trị.');
      return;
    }

    setIsVerifying(true);
    setPasskeyError('');

    setTimeout(() => {
      setIsVerifying(false);
      if (clean === 'ADMIN2026' || clean === 'HAEVYADMIN' || clean === 'HE2026' || clean === 'VIPADMIN') {
        setIsUnlocked(true);
        playChainUnlockSound();
        if (onUnlockSuccess) {
          setTimeout(() => {
            onUnlockSuccess();
          }, 850);
        }
      } else {
        setPasskeyError('Mã bảo mật không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ Super Admin.');
      }
    }, 600);
  };

  return (
    <div className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border border-amber-500/20 p-4 sm:p-8 text-center select-none shadow-2xl">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,rgba(239,68,68,0.1)_45%,transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2 DIAGONALLY CROSSING MOVING CHAINS (2 XÍCH CHÉO NHAU DI CHUYỂN) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Chain 1: Diagonal Top-Left to Bottom-Right (Moving forward) */}
        <div 
          className={`absolute w-[240%] h-16 sm:h-20 origin-center flex items-center shadow-[0_0_40px_rgba(0,0,0,0.95)] opacity-95 transition-all duration-700 ${
            isUnlocked ? 'animate-chain-diag-retract-1' : 'animate-chain-diag-enter-1'
          }`}
          style={{ zIndex: 1 }}
        >
          {/* Chain texture track with animated background position */}
          <div 
            className="w-full h-full animate-chain-slide-1 flex items-center"
            style={{
              backgroundImage: `url("${GOLD_CHAIN_SVG}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '96px 60px',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.9))'
            }}
          />
          {/* Glowing laser security line on chain */}
          <div className="absolute inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 animate-pulse" />
        </div>

        {/* Chain 2: Diagonal Top-Right to Bottom-Left (Moving opposite) */}
        <div 
          className={`absolute w-[240%] h-16 sm:h-20 origin-center flex items-center shadow-[0_0_40px_rgba(0,0,0,0.95)] opacity-95 transition-all duration-700 ${
            isUnlocked ? 'animate-chain-diag-retract-2' : 'animate-chain-diag-enter-2'
          }`}
          style={{ zIndex: 2 }}
        >
          {/* Chain texture track with animated reverse background position */}
          <div 
            className="w-full h-full animate-chain-slide-2 flex items-center"
            style={{
              backgroundImage: `url("${RED_CHAIN_SVG}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '96px 60px',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.9))'
            }}
          />
          {/* Glowing red laser security line on chain */}
          <div className="absolute inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80 animate-pulse" />
        </div>

        {/* Center Spark Aura */}
        <div className="absolute z-3 w-40 h-40 rounded-full bg-gradient-to-r from-amber-500/25 via-rose-500/25 to-amber-500/25 blur-2xl animate-pulse" />
      </div>

      {/* ========================================================================= */}
      {/* CENTRAL GLOWING PADLOCK AT INTERSECTION (Ổ KHOÁ Ở GIỮA) */}
      {/* ========================================================================= */}
      <div className="relative z-20 my-4 flex flex-col items-center">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Radar Scanning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute -inset-2 rounded-full border border-rose-500/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          
          {/* Main Floating Heavy Padlock */}
          <div className="relative animate-lock-float">
            {/* Shackle Top Ring (Ổ Khoá Càng Thép) */}
            <div className={`mx-auto w-16 h-14 rounded-t-full border-[5px] transition-all duration-300 relative ${
              isUnlocked
                ? 'border-emerald-400 -translate-y-3 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                : 'border-zinc-300 translate-y-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-shackle-snap'
            } bg-transparent`} />

            {/* Padlock Aura & Body */}
            <div className={`-mt-2 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-950 via-zinc-900 to-black border-2 ${
              isUnlocked ? 'border-emerald-500 shadow-emerald-500/50' : 'border-amber-500/80 shadow-amber-500/40'
            } p-3 flex flex-col items-center justify-center animate-lock-aura shadow-2xl relative overflow-hidden`}>
              
              {/* Inner Cyber Keyhole & Biometric scanner */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/90 border border-amber-500/60 flex flex-col items-center justify-center shadow-inner">
                {/* Laser scan line inside keyhole */}
                <div className={`absolute inset-x-1 h-[2px] ${
                  isUnlocked ? 'bg-emerald-400' : 'bg-rose-500'
                } animate-laser-scan blur-[0.5px]`} />
                
                {isUnlocked ? (
                  <Unlock size={30} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                ) : (
                  <Lock size={30} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                )}
              </div>

              {/* Status Badge on Padlock Base */}
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wider ${
                isUnlocked
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
                {isUnlocked ? 'UNLOCKED' : 'LOCKED 2X'}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mt-2 shadow-lg shadow-rose-950/40">
          <ShieldAlert size={15} className="text-rose-400" />
          <span>Haevy Admin Security • Khóa Bảo Mật 2 Xích</span>
        </div>
      </div>

      {/* Main Context Card */}
      <div className="relative z-20 max-w-lg mx-auto mt-2 space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isUnlocked ? 'Đã Mở Khóa Thành Công' : 'Quyền Truy Cập Bị Giới Hạn'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            {isUnlocked 
              ? 'Hệ thống đã nhận diện mã xác thực. Đang cấp quyền truy cập...'
              : 'Hệ thống nhận diện tài khoản của bạn chưa nằm trong danh sách Quản trị viên tối cao. Mọi quyền điều hành, duyệt tác giả, duyệt VIP & phát hành xu yêu cầu xác thực độc quyền từ Super Admin.'}
          </p>
        </div>

        {/* Current Account Information Box */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-left space-y-2.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800/80">
            <span className="text-zinc-400 font-medium">Tài khoản hiện tại:</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px]">
              {role === 'super_admin' ? 'Super Admin' : role === 'sub_admin' ? 'Sub Admin' : 'Thành Viên'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-500 text-[11px] block">Email đăng nhập:</span>
              <span className="font-semibold text-zinc-200 truncate block font-mono">
                {user?.email || (user?.isAnonymous ? 'Khách Ẩn Danh' : 'Chưa đăng nhập')}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Mã định danh ID:</span>
              <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold">
                <span>{accountId || 'CHƯA_CẤP'}</span>
                {accountId && (
                  <button 
                    onClick={handleCopyId}
                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    title="Sao chép ID"
                  >
                    {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 text-amber-400 mt-0.5" />
            <span>
              Chỉ tài khoản Quản trị viên tối cao (<strong className="text-white">kha78228@gmail.com</strong>) mới có quyền truy cập toàn quyền trung tâm điều khiển này.
            </span>
          </div>
        </div>

        {/* Emergency Passkey Form for Sub-Admins */}
        {!isUnlocked && (
          <form onSubmit={handleVerifyPasskey} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    setPasskeyError('');
                  }}
                  placeholder="Nhập Passkey Quản Trị Khẩn Cấp..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black transition-all shrink-0 cursor-pointer hover:brightness-110 flex items-center gap-1.5"
              >
                {isVerifying ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                <span>Mở Khóa</span>
              </button>
            </div>
            {passkeyError && (
              <p className="text-[11px] text-rose-400 text-left pl-1 font-medium">{passkeyError}</p>
            )}
          </form>
        )}

        {/* Action Buttons: Return Home or Audio Library */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Home size={15} />
              <span>Quay Về Trang Chủ</span>
            </button>
          )}

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <UserCheck size={15} />
              <span>Đăng Nhập Tài Khoản Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

