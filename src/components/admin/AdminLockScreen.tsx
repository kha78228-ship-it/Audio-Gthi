import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
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
  Headphones
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLockScreenProps {
  onBackToHome?: () => void;
  onOpenAuth?: () => void;
}

export function AdminLockScreen({ onBackToHome, onOpenAuth }: AdminLockScreenProps) {
  const { user, accountId, role } = useAuth();
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleVerifyPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setPasskeyError('Vui lòng nhập mã bảo mật hoặc passkey quản trị.');
      return;
    }
    setPasskeyError('Mã bảo mật không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ Super Admin.');
  };

  return (
    <div className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border border-red-950/60 p-4 sm:p-8 text-center select-none">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2 DIAGONALLY CROSSING MOVING CHAINS (2 XÍCH CHÉO NHAU DI CHUYỂN) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Chain 1: Diagonal Top-Left to Bottom-Right (Moving forward) */}
        <div 
          className="absolute w-[220%] h-14 -rotate-[32deg] flex items-center shadow-[0_0_30px_rgba(0,0,0,0.9)] opacity-90"
          style={{ zIndex: 1 }}
        >
          {/* Chain texture track with animated background position */}
          <div 
            className="w-full h-full animate-chain-slide-1 flex items-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='72' height='48' viewBox='0 0 72 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect x='4' y='14' width='44' height='20' rx='10' stroke='%23d97706' stroke-width='4' fill='%2318181b'/%3E%3Crect x='8' y='18' width='36' height='12' rx='6' fill='%2327272a' stroke='%23fbbf24' stroke-width='1.5'/%3E%3Ccircle cx='26' cy='24' r='3' fill='%23f59e0b'/%3E%3Crect x='34' y='10' width='34' height='28' rx='8' stroke='%2371717a' stroke-width='4.5' fill='%2309090b'/%3E%3Crect x='38' y='14' width='26' height='20' rx='5' stroke='%23a1a1aa' stroke-width='1' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '72px 48px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))'
            }}
          />
          {/* Glowing laser security line on chain */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
        </div>

        {/* Chain 2: Diagonal Top-Right to Bottom-Left (Moving opposite) */}
        <div 
          className="absolute w-[220%] h-14 rotate-[32deg] flex items-center shadow-[0_0_30px_rgba(0,0,0,0.9)] opacity-90"
          style={{ zIndex: 2 }}
        >
          {/* Chain texture track with animated reverse background position */}
          <div 
            className="w-full h-full animate-chain-slide-2 flex items-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='72' height='48' viewBox='0 0 72 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect x='4' y='14' width='44' height='20' rx='10' stroke='%23ef4444' stroke-width='4' fill='%2318181b'/%3E%3Crect x='8' y='18' width='36' height='12' rx='6' fill='%2327272a' stroke='%23f87171' stroke-width='1.5'/%3E%3Ccircle cx='26' cy='24' r='3' fill='%23ef4444'/%3E%3Crect x='34' y='10' width='34' height='28' rx='8' stroke='%2352525b' stroke-width='4.5' fill='%2309090b'/%3E%3Crect x='38' y='14' width='26' height='20' rx='5' stroke='%239ca3af' stroke-width='1' fill='%2318181b'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '72px 48px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))'
            }}
          />
          {/* Glowing red laser security line on chain */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENTRAL GLOWING PADLOCK AT INTERSECTION (Ổ KHOÁ Ở GIỮA) */}
      {/* ========================================================================= */}
      <div className="relative z-20 my-4 flex flex-col items-center">
        {/* Laser scanner vertical beam effect */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Radar Scanning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute -inset-2 rounded-full border border-rose-500/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          
          {/* Main Floating Heavy Padlock */}
          <div className="relative animate-lock-float">
            {/* Padlock Aura */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-950 via-zinc-900 to-black border-2 border-amber-500/80 p-3.5 flex flex-col items-center justify-center animate-lock-aura shadow-2xl relative overflow-hidden">
              {/* Shackle Top Ring (Ổ Khoá Càng Thép) */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-12 rounded-t-full border-4 border-zinc-300 bg-transparent shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
              
              {/* Inner Cyber Keyhole & Biometric scanner */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/90 border border-amber-500/60 flex flex-col items-center justify-center shadow-inner">
                {/* Laser scan line inside keyhole */}
                <div className="absolute inset-x-1 h-[2px] bg-rose-500 animate-laser-scan blur-[0.5px]" />
                
                <Lock size={28} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              </div>

              {/* Status Badge on Padlock Base */}
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-[10px] font-black text-rose-300 font-mono tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                LOCKED
              </div>
            </div>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mt-4 shadow-lg shadow-rose-950/40">
          <ShieldAlert size={15} className="text-rose-400" />
          <span>Haevy Admin Security • Khu Vực Bị Khóa</span>
        </div>
      </div>

      {/* Main Context Card */}
      <div className="relative z-20 max-w-lg mx-auto mt-2 space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quyền Truy Cập Bị Giới Hạn
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Hệ thống nhận diện tài khoản của bạn không nằm trong danh sách Quản trị viên tối cao. 
            Mọi quyền điều hành, duyệt tác giả, duyệt VIP & phát hành xu yêu cầu xác thực độc quyền từ Super Admin.
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
                    className="text-zinc-500 hover:text-white transition-colors"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              Mở Khóa
            </button>
          </div>
          {passkeyError && (
            <p className="text-[11px] text-rose-400 text-left pl-1 font-medium">{passkeyError}</p>
          )}
        </form>

        {/* Action Buttons: Return Home or Audio Library */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Home size={15} />
              <span>Quay Về Trang Chủ</span>
            </button>
          )}

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
