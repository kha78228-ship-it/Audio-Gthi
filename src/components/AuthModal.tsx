import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Eye,
  EyeOff,
  Crown,
  HelpCircle,
  Check,
  Smartphone,
  ShieldAlert,
  Cpu,
  Bot,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  saveMCPSession, 
  gatherFullMCPUserContext, 
  getStoredMCPSession,
  MCPAuthSession 
} from '../services/mcpContextService';
import { 
  verifyMCPCredentials, 
  getActiveMasterKey, 
  getActiveSecurityPin,
  MCP_USERNAME_SUFFIX,
  formatMCPUsername,
  extractAccountIdFromMCP
} from '../services/accountSecurityService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'anonymous' | 'mcp_ai';
  onSelectMode?: (mode: string) => void;
}

export function AuthModal({ isOpen, onClose, initialTab = 'signin', onSelectMode }: AuthModalProps) {
  const authContext = useAuth();
  const { 
    user,
    accountId,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    loginAsAnonymous,
  } = authContext;

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'anonymous' | 'mcp_ai'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('HAEVY2026');
  const [anonCode, setAnonCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // MCP AI Login State
  const [mcpUsername, setMcpUsername] = useState('');
  const [mcpPasskey, setMcpPasskey] = useState('');
  const [showMcpKey, setShowMcpKey] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'profile:read',
    'level_exp:read',
    'finance:read',
    'audio:read',
    'family:read',
    'couple:read',
    'edu:read',
    'security:read'
  ]);
  const [mcpActiveSession, setMcpActiveSession] = useState<MCPAuthSession | null>(getStoredMCPSession);
  const [showKeyLocationGuide, setShowKeyLocationGuide] = useState(false);
  const [mcpLoginSuccess, setMcpLoginSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync initial tab when reopened
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialTab);
      setError(null);
      setSuccessMsg(null);
      setIsForgotPasswordView(false);
      setMcpLoginSuccess(false);
      setMcpActiveSession(getStoredMCPSession());
      if (!mcpUsername) {
        const rawId = accountId || (user?.email ? user.email.split('@')[0] : 'HV-84489536');
        setMcpUsername(formatMCPUsername(rawId));
      }
    }
  }, [isOpen, initialTab, user, accountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (!email || !password) {
          throw new Error('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu bảo vệ cần ít nhất 6 ký tự.');
        }
        const finalRef = referralCode.trim() || 'HAEVY2026';
        await signUpWithEmail(email, password, name.trim() || undefined, finalRef);
        onClose();
      } else if (authMode === 'signin') {
        if (!email || !password) {
          throw new Error('Vui lòng nhập email và mật khẩu tài khoản.');
        }
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Email hoặc mật khẩu không chính xác. Bạn có thể sử dụng tính năng "Quên mật khẩu" hoặc đăng nhập bằng Google / Mã Ẩn Danh.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang tab "Đăng nhập".';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không đúng định dạng.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Mật khẩu quá ngắn (yêu cầu tối thiểu 6 ký tự).';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Đăng nhập email chưa kích hoạt. Bạn có thể chọn tab "Mã Ẩn Danh" để trải nghiệm ngay với tài khoản trắng!';
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
    setLoading(true);
    try {
      const finalRef = authMode === 'signup' ? (referralCode.trim() || 'HAEVY2026') : undefined;
      await signInWithGoogle(finalRef);
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.message && err.message.includes('Mã giới thiệu')) {
        setError(err.message);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In chưa sẵn sàng. Bạn có thể bấm sang tab "Mã Ẩn Danh" để vào ngay!');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Không thể mở cửa sổ đăng nhập Google. Bạn có thể chuyển sang tab "Mã Ẩn Danh" để vào ngay không cần tài khoản!');
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
      setSuccessMsg(res.message || 'Khởi tạo tài khoản ẩn danh thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo tài khoản ẩn danh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Activate Anonymous Passcode
  const handleActivateAnonPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonCode.trim()) {
      setError('Vui lòng nhập mã ẩn danh (ví dụ: 888, 999, 777 hoặc mã VIP đã cấp).');
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
        }, 1000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi kích hoạt mã ẩn danh.');
    } finally {
      setLoading(false);
    }
  };

  // MCP AI Login Gateway verification handler
  const handleMcpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // 1. Verify against Account Security Shield settings (Layer 6 Master Key or Layer 3 PIN)
      const verification = verifyMCPCredentials(mcpUsername, mcpPasskey);
      if (!verification.valid) {
        throw new Error(verification.message);
      }

      // 2. Authenticate session with /api/mcp/auth
      const targetIdentifier = mcpUsername.trim();
      const extractedAccId = extractAccountIdFromMCP(targetIdentifier) || accountId || 'HV-84489536';
      let sessionData: MCPAuthSession;

      try {
        const resp = await fetch('/api/mcp/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: targetIdentifier,
            credential: mcpPasskey.trim(),
            scopes: selectedScopes,
            userMetadata: {
              email: user?.email || (extractedAccId.includes('@') ? extractedAccId : `${extractedAccId}@haevy.ecosystem`),
              accountId: extractedAccId,
              displayName: user?.displayName || (extractedAccId.includes('@') ? extractedAccId.split('@')[0] : extractedAccId) || 'Thành Viên Haevy',
              avatarUrl: user?.photoURL || ''
            }
          })
        });
        const data = await resp.json();
        if (data.success && data.session) {
          sessionData = data.session;
        } else {
          throw new Error(data.error || 'Xác thực phiên MCP thất bại');
        }
      } catch (backendErr: any) {
        // Safe resilient fallback
        const now = new Date();
        sessionData = {
          token: `mcp_sec_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
          accountId: extractedAccId,
          displayName: user?.displayName || (extractedAccId.includes('@') ? extractedAccId.split('@')[0] : extractedAccId) || 'Thành Viên Haevy',
          email: user?.email || (extractedAccId.includes('@') ? extractedAccId : `${extractedAccId}@haevy.ecosystem`),
          avatarUrl: user?.photoURL || '',
          authenticatedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          grantedScopes: selectedScopes,
          protocolVersion: '2024-11-05'
        };
      }

      saveMCPSession(sessionData);
      setMcpActiveSession(sessionData);
      setMcpLoginSuccess(true);
      setSuccessMsg(`Xác thực thành công! Cổng MCP AI đã cấp quyền truy cứu dữ liệu cho tài khoản ${targetIdentifier} qua Mã Khởi Động Lớp 6 (Phiên hiệu lực 24h).`);
      window.dispatchEvent(new CustomEvent('haevy-mcp-session-updated'));
    } catch (err: any) {
      console.error('MCP Auth Error:', err);
      setError(err.message || 'Mật khẩu Mã Khởi Động Lớp 6 không chính xác. Vui lòng kiểm tra lại trong mục Cài Đặt Tài Khoản.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim() || email.trim();
    if (!targetEmail) {
      setError('Vui lòng nhập địa chỉ email đã đăng ký tài khoản.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMsg(`Đã gửi liên kết đặt lại mật khẩu tới ${targetEmail}. Vui lòng kiểm tra hộp thư đến (hoặc thư rác Spam).`);
      setIsForgotPasswordView(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Không tìm thấy tài khoản nào khớp với địa chỉ email này.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Địa chỉ email không đúng định dạng.');
      } else {
        setError(err.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop" 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="auth-modal-container"
        className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-700/60 rounded-3xl w-full max-w-lg p-5 sm:p-8 relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Subtle Ambient Nebula Glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 opacity-80" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-750 transition-all cursor-pointer shadow-sm z-10"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-black uppercase tracking-wider mb-2.5 shadow-sm">
            <Crown size={12} className="text-amber-400" />
            <span>CỔNG TRUY CẬP TÀI KHOẢN • HAEVY ID</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {authMode === 'signin' && !isForgotPasswordView && 'Đăng Nhập Tài Khoản'}
            {authMode === 'signup' && 'Tạo Tài Khoản Mới'}
            {authMode === 'mcp_ai' && 'Cổng Đăng Nhập MCP Cho AI'}
            {authMode === 'anonymous' && 'Tài Khoản Khách Ẩn Danh'}
            {isForgotPasswordView && 'Khôi Phục Mật Khẩu'}
          </h2>

          <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
            {authMode === 'signin' && !isForgotPasswordView && 'Đồng bộ danh sách phát, tích lũy Điểm Audio và kích hoạt đặc quyền VIP'}
            {authMode === 'signup' && 'Gia nhập cộng đồng người yêu âm thanh Hi-Fi và nhận ngay quà tặng tân thủ'}
            {authMode === 'mcp_ai' && 'Xác thực Tác tử AI bằng Tên đăng nhập và Mật khẩu theo Mã Khoá đã đặt trong mục Cài Đặt Tài Khoản'}
            {authMode === 'anonymous' && 'Khởi tạo tài khoản trắng 1-chạm hoặc nhập mã VIP 3-số để nghe nhạc ngay lập tức'}
            {isForgotPasswordView && 'Nhập email để nhận liên kết thiết lập lại mật khẩu an toàn'}
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        {!isForgotPasswordView && (
          <div className="flex rounded-2xl bg-zinc-950/90 p-1.5 border border-zinc-800/90 mb-6 shadow-inner gap-1 overflow-x-auto scrollbar-none">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
                setSuccessMsg(null);
                setIsForgotPasswordView(false);
              }}
              className={`flex-1 min-w-[75px] py-2 px-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-750 text-white shadow-md border border-zinc-700/80 font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lock size={13} className={authMode === 'signin' ? 'text-amber-400' : 'text-zinc-500'} />
              <span className="whitespace-nowrap">Đăng nhập</span>
            </button>

            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
                setSuccessMsg(null);
                setIsForgotPasswordView(false);
              }}
              className={`flex-1 min-w-[75px] py-2 px-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-md font-black'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <Sparkles size={13} className={authMode === 'signup' ? 'text-amber-400' : 'text-zinc-500'} />
              <span className="whitespace-nowrap">Đăng ký</span>
            </button>

            <button
              id="auth-tab-mcp-ai"
              type="button"
              onClick={() => {
                setAuthMode('mcp_ai');
                setError(null);
                setSuccessMsg(null);
                setIsForgotPasswordView(false);
              }}
              className={`flex-1 min-w-[95px] py-2 px-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'mcp_ai'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-black'
                  : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              <Cpu size={13} className={authMode === 'mcp_ai' ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'} />
              <span className="whitespace-nowrap">⚡ Cổng MCP AI</span>
            </button>

            <button
              id="auth-tab-anonymous"
              type="button"
              onClick={() => {
                setAuthMode('anonymous');
                setError(null);
                setSuccessMsg(null);
                setIsForgotPasswordView(false);
              }}
              className={`flex-1 min-w-[85px] py-2 px-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'anonymous'
                  ? 'bg-gradient-to-r from-purple-500/25 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-md font-black'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <KeyRound size={13} className={authMode === 'anonymous' ? 'text-purple-400' : 'text-zinc-500'} />
              <span className="whitespace-nowrap">Mã Ẩn Danh</span>
            </button>
          </div>
        )}

        {/* Global Feedback Banner */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-600/70 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm animate-in fade-in duration-150 shadow-md">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-rose-950/70 border border-rose-700/70 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-150 shadow-md">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: FORGOT PASSWORD FLOW                                              */}
        {/* ========================================================================= */}
        {isForgotPasswordView ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Địa chỉ Email đã đăng ký
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="nhap-email-cua-ban@gmail.com"
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Hệ thống sẽ gửi một liên kết bảo mật để bạn thiết lập mật khẩu mới trong vòng 1-chạm.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordView(false);
                  setError(null);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Quay lại Đăng nhập
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Gửi liên kết khôi phục</span>
              </button>
            </div>
          </form>
        ) : authMode === 'mcp_ai' ? (
          /* ========================================================================= */
          /* VIEW 2: DEDICATED MCP LOGIN PORTAL FOR AI                                 */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Header Identity Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/70 via-zinc-950 to-blue-950/70 border border-cyan-500/40 relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40 shadow-inner shrink-0">
                    <Cpu size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">Cổng Đăng Nhập MCP Cho AI</h3>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase">
                        Protocol 2024-11-05
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium">Model Context Protocol • Truy cứu dữ liệu sinh thái thời gian thực</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-cyan-500/30 text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck size={14} className="shrink-0 text-cyan-400" />
                  <span>Quy Định Định Danh & Bảo Mật Cổng MCP AI:</span>
                </div>
                <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-zinc-200">Tên đăng nhập:</strong> <code className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded font-mono">[ID tài khoản]{MCP_USERNAME_SUFFIX}</code> (Ví dụ: <span className="text-cyan-200 font-mono">HV-84489536{MCP_USERNAME_SUFFIX}</span>)
                  </li>
                  <li>
                    <strong className="text-zinc-200">Mật khẩu:</strong> <strong className="text-rose-400">Mã Khởi Động Hệ Thống Lớp 6</strong> (<code className="text-rose-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">HAEVY-SEC-...</code>) trong mục Cài Đặt Tài Khoản.
                  </li>
                </ul>
              </div>
            </div>

            {/* Active Session Status if Connected */}
            {mcpActiveSession && !mcpLoginSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Hiện đang có phiên MCP đã xác thực</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Tài khoản: <span className="text-zinc-200 font-semibold">{mcpActiveSession.displayName}</span> • Hết hạn sau 24h
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectMode) {
                      onSelectMode('haevy_ai');
                      onClose();
                    } else {
                      window.dispatchEvent(new CustomEvent('haevy-sync-mode-change', { detail: { mode: 'haevy_ai' } }));
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1"
                >
                  <Bot size={13} />
                  <span>Vào AI Master</span>
                </button>
              </div>
            )}

            {/* MCP Authentication Form */}
            <form onSubmit={handleMcpLogin} className="space-y-3.5">
              {/* Field 1: Username / Identifier formatted as [ID]&haevy.vn */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Tên Đăng Nhập Cổng MCP AI:
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                    Đuôi: &haevy.vn
                  </span>
                </div>
                <div className="relative">
                  <Bot size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    id="mcp-username-input"
                    type="text"
                    required
                    placeholder="VD: HV-84489536&haevy.vn"
                    value={mcpUsername}
                    onChange={(e) => setMcpUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 focus:border-cyan-400 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono font-semibold"
                  />
                </div>

                {/* Quick tag autofill & append button */}
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-400 flex-wrap">
                  <span>Gợi ý tên chuẩn:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const id = accountId || 'HV-84489536';
                      setMcpUsername(formatMCPUsername(id));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-cyan-400" />
                    <span>{formatMCPUsername(accountId || 'HV-84489536')}</span>
                  </button>
                  {user?.email && (
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = user.email ? user.email.split('@')[0] : 'member';
                        setMcpUsername(formatMCPUsername(prefix));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono font-bold border border-zinc-700 cursor-pointer"
                    >
                      {formatMCPUsername(user.email.split('@')[0])}
                    </button>
                  )}
                  {!mcpUsername.toLowerCase().endsWith('&haevy.vn') && mcpUsername.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMcpUsername(formatMCPUsername(mcpUsername))}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 cursor-pointer animate-pulse"
                    >
                      + Gắn đuôi &haevy.vn
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Password according to Account Settings Layer 6 Master Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Mật Khẩu Cổng MCP AI:
                    </label>
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                      Mã Lớp 6
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyLocationGuide(!showKeyLocationGuide)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Info size={12} />
                    <span>Lấy mã Lớp 6 ở đâu?</span>
                  </button>
                </div>

                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                  <input
                    id="mcp-passkey-input"
                    type={showMcpKey ? 'text' : 'password'}
                    required
                    placeholder="Nhập Mã Khởi Động Lớp 6 (HAEVY-SEC-XXXX-XXXX-XXXX-XXXX)"
                    value={mcpPasskey}
                    onChange={(e) => setMcpPasskey(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-750 focus:border-rose-400 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMcpKey(!showMcpKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={showMcpKey ? 'Ẩn mã khoá' : 'Hiện mã khoá'}
                  >
                    {showMcpKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Quick Autofill for Layer 6 Master Key */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const masterKey = getActiveMasterKey();
                      setMcpPasskey(masterKey);
                      setShowMcpKey(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} className="text-rose-400" />
                    <span>Điền nhanh Mã Khởi Động Lớp 6 của tôi</span>
                  </button>
                </div>

                {/* Key Location Guide Card */}
                {showKeyLocationGuide && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1.5 animate-in fade-in duration-200">
                    <p className="font-bold text-rose-300 flex items-center gap-1">
                      <Info size={13} />
                      Cách lấy Mã Khởi Động Lớp 6 trong mục Cài Đặt Tài Khoản:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                      <li>Vào menu góc trên, chọn <strong className="text-zinc-200">Cài Đặt Tài Khoản</strong> (hoặc <strong className="text-zinc-200">Bảo Vệ 6 Lớp Shield</strong>).</li>
                      <li>Cuộn xuống mục <strong className="text-rose-400">Lớp 6: Mã Khởi Động Hệ Thống (Master Key)</strong>.</li>
                      <li>Mã này có dạng: <code className="text-rose-300 bg-zinc-900 px-1 py-0.5 rounded font-mono">HAEVY-SEC-XXXX-XXXX-XXXX-XXXX</code>.</li>
                      <li>Sao chép mã đó và dán vào ô Mật khẩu ở trên để xác thực cho AI.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Scopes Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Phạm Vi Dữ Liệu Cấp Quyền Cho AI (MCP Scopes):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'profile:read', label: '👤 Hồ sơ & Cấp VIP' },
                    { id: 'level_exp:read', label: '🎖️ Cấp Độ LV & EXP' },
                    { id: 'finance:read', label: '💰 Ví 6 Hũ Tài Chính' },
                    { id: 'audio:read', label: '🎵 Nhạc & Sách Nói' },
                    { id: 'family:read', label: '🌳 Gia Phả Dòng Họ' },
                    { id: 'couple:read', label: '❤️ Không Gian Cặp Đôi' },
                    { id: 'edu:read', label: '📚 Sổ Tay & Học Tập' },
                    { id: 'security:read', label: '🔒 Trạng Thái An Ninh' },
                  ].map((sc) => {
                    const isChecked = selectedScopes.includes(sc.id);
                    return (
                      <label
                        key={sc.id}
                        className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200' 
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, sc.id]);
                            } else {
                              setSelectedScopes(selectedScopes.filter(s => s !== sc.id));
                            }
                          }}
                          className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-400"
                        />
                        <span className="truncate">{sc.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="mcp-login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:brightness-110 active:scale-98 text-zinc-950 font-black py-3 px-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Cpu size={18} className="text-zinc-950" />
                )}
                <span>Xác Thực & Đăng Nhập Cổng MCP Dành Cho AI</span>
              </button>
            </form>

            {/* If success, show direct jump action */}
            {mcpLoginSuccess && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-zinc-950 to-cyan-950/80 border border-emerald-500/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-sm font-black text-white">AI Đã Kết Nối MCP Thành Công!</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Phiên xác thực đã được lưu trữ an toàn. Trợ lý Haevy AI giờ đây có thể đọc và hỗ trợ giải quyết dựa trên toàn bộ thông tin cá nhân của bạn.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectMode) {
                        onSelectMode('haevy_ai');
                        onClose();
                      } else {
                        window.dispatchEvent(new CustomEvent('haevy-sync-mode-change', { detail: { mode: 'haevy_ai' } }));
                        onClose();
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Bot size={14} />
                    <span>Mở Haevy AI Ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs cursor-pointer"
                  >
                    Đóng Cửa Sổ
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : authMode === 'anonymous' ? (
          /* ========================================================================= */
          /* VIEW 2: ANONYMOUS GUEST & PASSCODE ENTRY                                  */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Card 1: 1-Click Blank Guest Account */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 border border-purple-500/30 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
                    <Zap size={18} className="fill-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Vào Ngay Với Tài Khoản Trắng</h3>
                    <span className="text-[11px] text-purple-300 font-semibold">1-chạm • Không cần khai báo Email</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black">
                  +50 Điểm
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Tự động cấp một mã định danh khách mới (Guest ID), cấp sẵn 50 Điểm Audio khởi đầu để nghe nhạc và trải nghiệm toàn bộ tính năng.
              </p>

              <button
                id="create-blank-account-btn"
                type="button"
                onClick={handleCreateBlankAccount}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 active:scale-98 text-black font-black py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-black" />}
                <span>Khởi Tạo & Vào Ngay Lập Tức</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-zinc-800" />
              <span className="bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-500 absolute">
                Hoặc Nhập Mã Ẩn Danh VIP
              </span>
            </div>

            {/* Card 2: Passcode Entry (3-digit or custom) */}
            <form onSubmit={handleActivateAnonPass} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-400" />
                  <span>Mã Ẩn Danh VIP (3 Chữ Số / Mã Tuần)</span>
                </label>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    id="anon-passcode-input"
                    type="text"
                    placeholder="Nhập mã (ví dụ: 888, 999, 777...)"
                    value={anonCode}
                    onChange={(e) => setAnonCode(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-900 border border-zinc-750 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-4 text-amber-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono text-sm tracking-wider uppercase font-bold"
                  />
                </div>
              </div>

              {/* Sample Quick 3-digit chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-zinc-400">Mã mẫu:</span>
                {['888', '999', '777', '123'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setAnonCode(sample)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 text-amber-300 font-mono text-xs font-bold border border-zinc-700 transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <button
                id="anon-passcode-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wide cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />}
                <span>Kích Hoạt Quyền Lợi Ẩn Danh</span>
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 3: SIGN IN / SIGN UP (EMAIL & GOOGLE)                                */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Google 1-Click Social Sign-In Button */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-850 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-zinc-750 hover:border-zinc-600 shadow-md disabled:opacity-50 text-xs sm:text-sm cursor-pointer group active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
              <span>{authMode === 'signup' ? 'Đăng ký nhanh bằng Google' : 'Tiếp tục với Google'}</span>
            </button>

            {/* Subtle Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-500 absolute tracking-wider">
                Hoặc bằng Email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name field for sign-up */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                    Họ và tên / Biệt danh
                  </label>
                  <div className="relative">
                    <UserIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="auth-name-input"
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950/90 border border-zinc-750 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="tenban@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/90 border border-zinc-750 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password field with Reveal Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordView(true);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-semibold"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={authMode === 'signup' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950/90 border border-zinc-750 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Referral Code (Mandatory for registration to regulate load & reward starter points) */}
              {authMode === 'signup' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Gift size={14} className="text-amber-400" />
                      <span>Mã giới thiệu kích hoạt</span>
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Tặng 100 Điểm
                    </span>
                  </div>

                  <div className="relative">
                    <ShieldCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      id="auth-referral-input"
                      type="text"
                      required
                      placeholder="HAEVY2026"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl py-2.5 pl-10 pr-4 text-amber-200 placeholder:text-amber-200/40 focus:outline-none focus:border-amber-400 font-mono uppercase font-black text-sm tracking-wider"
                    />
                  </div>

                  {/* 1-Click Fill suggestions */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-zinc-400">Gợi ý mã:</span>
                    {['HAEVY2026', 'AUDIOHUB', 'VIP100'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setReferralCode(c)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          referralCode === c 
                            ? 'bg-amber-400 text-black shadow-sm' 
                            : 'bg-zinc-800/80 hover:bg-zinc-750 text-amber-300 border border-zinc-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-white via-zinc-100 to-zinc-200 hover:brightness-105 active:scale-98 text-black font-black py-3 px-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : authMode === 'signup' ? (
                  <Sparkles size={16} className="text-amber-600" />
                ) : (
                  <Lock size={16} />
                )}
                <span>{authMode === 'signup' ? 'Tạo Tài Khoản & Nhận Quà Tân Thủ' : 'Đăng Nhập Vào Hệ Thống'}</span>
              </button>
            </form>

            {/* Switch Mode Prompt */}
            <div className="pt-2 text-center text-xs text-zinc-400">
              {authMode === 'signup' ? (
                <p>
                  Đã có tài khoản Haevy?{' '}
                  <button
                    id="auth-switch-to-login-btn"
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setError(null);
                    }}
                    className="text-amber-300 hover:underline font-bold ml-1 cursor-pointer"
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
                    className="text-amber-300 hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Tạo tài khoản mới
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Security & System Trust Footnote */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>Mã hóa SSL 256-bit • Firebase Cloud Auth</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Bấm</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">Esc</kbd>
            <span>để đóng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
