import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  AlertCircle, 
  Gift, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'anonymous';
}

export function AuthModal({ isOpen, onClose, initialTab = 'signin' }: AuthModalProps) {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    loginAsAnonymous,
    createBlankAnonymousAccount, 
    activateAnonymousPass 
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'anonymous'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [anonCode, setAnonCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!email || !password) {
          throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu cần ít nhất 6 ký tự.');
        }
        if (!referralCode.trim()) {
          throw new Error('Vui lòng nhập Mã giới thiệu (bắt buộc khi tạo tài khoản mới để hệ thống kiểm soát tải).');
        }
        await signUpWithEmail(email, password, name.trim() || undefined, referralCode.trim());
        onClose();
      } else if (authMode === 'signin') {
        if (!email || !password) {
          throw new Error('Vui lòng nhập email và mật khẩu.');
        }
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email này đã được đăng ký tài khoản.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Mật khẩu quá ngắn (tối thiểu 6 ký tự).';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Đăng nhập email chưa mở trên dự án Firebase. Bạn có thể dùng tab "Mã Ẩn Danh" để trải nghiệm ngay với tài khoản trắng!';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (authMode === 'signup' && !referralCode.trim()) {
      setError('Vui lòng nhập Mã giới thiệu (bắt buộc khi tạo tài khoản mới kể cả đăng ký bằng Google để hệ thống kiểm soát tải).');
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle(authMode === 'signup' ? referralCode.trim() : undefined);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.message && err.message.includes('Mã giới thiệu')) {
        setError(err.message);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In chưa được kích hoạt trong Firebase Console. Bạn có thể sử dụng chế độ "Mã Ẩn Danh" để vào ngay!');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Không thể đăng nhập bằng Google. Bạn có thể chuyển sang tab "Mã Ẩn Danh" để trải nghiệm ngay!');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Anonymous Blank Account creation
  const handleCreateBlankAccount = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginAsAnonymous();
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo tài khoản ẩn danh.');
    } finally {
      setLoading(false);
    }
  };

  // Activate Anonymous Passcode
  const handleActivateAnonPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonCode.trim()) {
      setError('Vui lòng nhập mã ẩn danh (ví dụ: mã 3 số VIP 1 tháng hoặc mã trắng).');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await loginAsAnonymous(anonCode.trim());
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi kích hoạt mã ẩn danh.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="auth-modal-container"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 sm:p-7 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        {/* 3-Mode Navigation Tabs */}
        <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800 mb-6">
          <button
            id="auth-tab-signin"
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signin'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Đăng nhập
          </button>
          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tạo tài khoản
          </button>
          <button
            id="auth-tab-anonymous"
            type="button"
            onClick={() => {
              setAuthMode('anonymous');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              authMode === 'anonymous'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-extrabold'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <KeyRound size={13} className={authMode === 'anonymous' ? 'text-amber-400' : 'text-zinc-500'} />
            <span>Mã Ẩn Danh</span>
          </button>
        </div>

        {/* Heading based on mode */}
        <div className="text-center mb-5">
          {authMode === 'signup' ? (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tạo Tài Khoản Mới
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Nhập mã giới thiệu để kích hoạt tài khoản (hệ thống kiểm soát tải chống quá tải người mới)
              </p>
            </>
          ) : authMode === 'signin' ? (
            <>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Đăng Nhập Haevy Audio
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Tiếp tục đồng bộ kho nhạc, tích lũy Điểm Audio và trải nghiệm đặc quyền VIP
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                <Sparkles size={13} className="text-amber-400" />
                <span>Không cần đăng ký Email</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tài Khoản Ẩn Danh (Trắng Thông Tin)
              </h2>
              <p className="text-zinc-400 text-xs mt-1">
                Dành cho người dùng không muốn đăng nhập tài khoản mà muốn 1 tài khoản mới trắng thông tin để nghe nhạc ngay
              </p>
            </>
          )}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-950/60 border border-red-800/60 rounded-2xl flex items-start gap-2.5 text-red-300 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= MODE: ANONYMOUS (TRẮNG THÔNG TIN) ================= */}
        {authMode === 'anonymous' ? (
          <div className="space-y-5">
            {/* Quick 1-Click Blank Account Option */}
            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap size={16} className="text-amber-400" />
                <span>Khởi tạo 1 tài khoản trắng mới ngay</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tự động cấp 1 mã định danh khách mới (Guest ID), không lưu email, nhận ngay 50 Điểm Audio ban đầu và vào thẳng ứng dụng.
              </p>
              <button
                id="create-blank-account-btn"
                type="button"
                onClick={handleCreateBlankAccount}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95"
              >
                <Zap size={16} className="fill-black" />
                <span>Vào ngay với Tài khoản Trắng</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="bg-zinc-900 px-3 text-[11px] uppercase font-bold text-zinc-500 absolute">
                Hoặc Nhập Mã Ẩn Danh VIP
              </span>
            </div>

            {/* Enter Anonymous Passcode */}
            <form onSubmit={handleActivateAnonPass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Mã ẩn danh (3 số VIP 1 tháng / Mã 1 tuần)
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="anon-passcode-input"
                    type="text"
                    placeholder="Ví dụ: 888, 999, 777..."
                    value={anonCode}
                    onChange={(e) => setAnonCode(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 font-mono text-sm tracking-wider uppercase"
                  />
                </div>
              </div>

              {/* Sample Quick 3-digit chips */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500">Mã mẫu:</span>
                {['888', '999', '777', '123'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setAnonCode(sample)}
                    className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 font-mono text-xs border border-zinc-700"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <button
                id="anon-passcode-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={16} />}
                <span>Kích hoạt Mã Ẩn Danh</span>
              </button>
            </form>
          </div>
        ) : (
          /* ================= MODE: SIGN IN / SIGN UP ================= */
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700/80 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors border border-zinc-700/50 shadow-sm disabled:opacity-50 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-zinc-900 px-3 text-zinc-500 font-semibold tracking-wider">
                  Hoặc bằng Email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="auth-name-input"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="tenban@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all text-sm"
                  />
                </div>
              </div>

              {/* MÃ GIỚI THIỆU: BẮT BUỘC KHI TẠO TÀI KHOẢN MỚI ĐỂ TRÁNH QUÁ TẢI */}
              {authMode === 'signup' && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gift size={14} className="text-amber-400" />
                      <span>Mã giới thiệu (Bắt buộc)</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      Chống quá tải
                    </span>
                  </div>

                  <div className="relative">
                    <ShieldCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      id="auth-referral-input"
                      type="text"
                      required
                      placeholder="Nhập mã giới thiệu (ví dụ: VIP100)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-amber-500/10 border border-amber-500/40 rounded-xl py-2.5 pl-10 pr-4 text-amber-200 placeholder:text-amber-200/50 focus:outline-none focus:border-amber-400 focus:bg-zinc-900 transition-all text-sm font-mono uppercase font-bold"
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-tight">
                    🛡️ Mã giới thiệu là mã nhập khi tạo tài khoản mới để tránh hệ thống quá tải người mới.
                  </p>

                  {/* Sample Referral Code suggestions */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-zinc-500">Mã có sẵn:</span>
                    {['AUDIO2026', 'VIP100', 'AUDIOHUB', 'VN2026'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setReferralCode(code)}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 font-mono text-[11px] border border-zinc-700"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>{authMode === 'signup' ? 'Kích Hoạt Tài Khoản' : 'Đăng Nhập'}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-zinc-400">
              {authMode === 'signup' ? (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    id="auth-switch-to-login-btn"
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setError(null);
                    }}
                    className="text-white hover:underline font-bold ml-1"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              ) : (
                <p>
                  Chưa có tài khoản?{' '}
                  <button
                    id="auth-switch-to-signup-btn"
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError(null);
                    }}
                    className="text-white hover:underline font-bold ml-1"
                  >
                    Tạo tài khoản mới
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

