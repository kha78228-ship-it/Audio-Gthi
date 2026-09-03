import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  setSessionPasskey, 
  getConversationE2EEConfig, 
  calculatePasskeyFingerprint,
  recordFailedAttempt,
  resetFailedAttempts,
  checkBruteForceLock
} from '../../services/e2eeService';

interface E2EEUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  recipientName: string;
  onUnlocked: () => void;
  onOpenSettings?: () => void;
}

export function E2EEUnlockModal({
  isOpen,
  onClose,
  conversationId,
  recipientName,
  onUnlocked,
  onOpenSettings
}: E2EEUnlockModalProps) {
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSecs, setLockoutSecs] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    setPasskeyInput('');
    setErrorMessage(null);
    const lockStatus = checkBruteForceLock(conversationId);
    if (lockStatus.locked) {
      setLockoutSecs(lockStatus.remainingSecs);
    } else {
      setLockoutSecs(0);
    }
  }, [isOpen, conversationId]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSecs <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecs]);

  if (!isOpen) return null;

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutSecs > 0) return;

    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập mã bảo mật.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const config = getConversationE2EEConfig(conversationId);
      const calculatedFp = await calculatePasskeyFingerprint(trimmed, conversationId);

      // If configuration has a known fingerprint, check match
      if (config.fingerprint && config.fingerprint !== calculatedFp) {
        const attempt = recordFailedAttempt(conversationId);
        if (attempt.locked) {
          setLockoutSecs(attempt.remainingSecs);
          setErrorMessage(`Đã nhập sai nhiều lần. Tạm khóa trong ${attempt.remainingSecs}s.`);
        } else {
          setErrorMessage(`Mã bảo mật không chính xác (Đã thử ${attempt.count}/5 lần).`);
        }
        setIsSubmitting(false);
        return;
      }

      // Unlock successfully
      resetFailedAttempts(conversationId);
      setSessionPasskey(conversationId, trimmed, config.autoLockMinutes || 15);
      setIsSubmitting(false);
      onUnlocked();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage('Lỗi xác thực: ' + (err.message || 'Thử lại'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mở Khóa Phiên Chat 6 Lớp</h3>
              <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">Trò chuyện với {recipientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUnlock} className="p-4 sm:p-5 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-zinc-300">
              Nhập mã bảo mật (PIN 6 số hoặc mật mã) bạn đã thiết lập để giải mã tin nhắn.
            </p>
          </div>

          {/* Lockout alert */}
          {lockoutSecs > 0 && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Clock size={16} className="shrink-0 text-rose-400 animate-spin" />
              <span>Tạm khóa bảo vệ chống dò mã. Vui lòng chờ {lockoutSecs}s...</span>
            </div>
          )}

          {/* Error alert */}
          {errorMessage && lockoutSecs === 0 && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Passkey Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passkeyInput}
              disabled={lockoutSecs > 0 || isSubmitting}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Nhập mã bảo mật (vd: 849201)..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 tracking-wider font-mono focus:outline-none pr-11 disabled:opacity-50 text-center text-lg font-bold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={lockoutSecs > 0 || !passkeyInput.trim() || isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <Unlock size={16} />
              <span>{isSubmitting ? 'Đang giải mã...' : 'Mở Khóa Phiên Chat'}</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-amber-300 transition-colors"
              >
                Cài đặt lại mã bảo mật 6 lớp
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
