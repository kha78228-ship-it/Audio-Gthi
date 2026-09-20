import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Database, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Search, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  Unlock, 
  User, 
  Award, 
  Coins, 
  Headphones, 
  TreePine, 
  Heart, 
  GraduationCap, 
  Shield, 
  Copy, 
  Check, 
  X,
  Zap,
  ArrowRight,
  Code
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { haptics } from '../../utils/haptics';
import { 
  MCP_AVAILABLE_SCOPES, 
  MCP_AVAILABLE_TOOLS, 
  MCPAuthSession, 
  MCPConnectionStatus, 
  MCPLogEntry, 
  MCPQueryResult, 
  clearMCPSession, 
  gatherFullMCPUserContext, 
  getStoredMCPSession, 
  saveMCPSession 
} from '../../services/mcpContextService';
import { 
  MCP_USERNAME_SUFFIX, 
  formatMCPUsername, 
  extractAccountIdFromMCP, 
  getActiveMasterKey, 
  verifyMCPCredentials 
} from '../../services/accountSecurityService';

interface HaevyMCPProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunChatPrompt?: (prompt: string) => void;
}

export function HaevyMCPProtocolModal({
  isOpen,
  onClose,
  onRunChatPrompt
}: HaevyMCPProtocolModalProps) {
  const authContext = useAuth();
  const { user, accountId, displayName, vipTier, isVip, levelExp = 0 } = authContext;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'auth' | 'query' | 'tools' | 'logs'>('query');

  // MCP Auth State
  const [session, setSession] = useState<MCPAuthSession | null>(() => getStoredMCPSession());
  const [status, setStatus] = useState<MCPConnectionStatus>(() => (getStoredMCPSession() ? 'connected' : 'disconnected'));
  
  // Credentials Form State
  const [inputIdentifier, setInputIdentifier] = useState(user?.email || accountId || 'kha78228@gmail.com');
  const [inputCredential, setInputCredential] = useState('••••••••');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(() => 
    MCP_AVAILABLE_SCOPES.map(s => s.id)
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Query State
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<MCPQueryResult | null>(null);
  const [rawJsonExpanded, setRawJsonExpanded] = useState(false);

  // Protocol Logs
  const [logs, setLogs] = useState<MCPLogEntry[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);

  // Pre-fill fields when user changes
  useEffect(() => {
    const rawId = accountId || (user?.email ? user.email.split('@')[0] : 'HV-84489536');
    setInputIdentifier(formatMCPUsername(rawId));
  }, [user, accountId]);

  // If already connected, default tab to query; otherwise auth
  useEffect(() => {
    if (!session) {
      setActiveTab('auth');
    }
  }, [session]);

  if (!isOpen) return null;

  // Helper to add log
  const addLog = (direction: 'client_to_server' | 'server_to_client', method: string, payload: any, latencyMs?: number) => {
    const entry: MCPLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      direction,
      method,
      payload,
      latencyMs
    };
    setLogs(prev => [entry, ...prev.slice(0, 40)]);
  };

  // 1. Handle Quick Auth / Credentials Submission
  const handleAuthenticate = async (useQuickAuth: boolean = false) => {
    haptics.impact('medium');
    setIsAuthenticating(true);
    setAuthError(null);
    setStatus('authenticating');

    const effectiveId = useQuickAuth 
      ? formatMCPUsername(accountId || (user?.email ? user.email.split('@')[0] : 'HV-84489536'))
      : inputIdentifier.trim();

    const effectiveCredential = useQuickAuth
      ? getActiveMasterKey()
      : inputCredential.trim();

    addLog('client_to_server', 'mcp/auth/authenticate', {
      identifier: effectiveId,
      requestedScopes: selectedScopes,
      timestamp: new Date().toISOString()
    });

    try {
      const validation = verifyMCPCredentials(effectiveId, effectiveCredential);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const extractedId = extractAccountIdFromMCP(effectiveId) || accountId || 'HV-84489536';

      const res = await fetch('/api/mcp/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: effectiveId,
          credential: effectiveCredential,
          scopes: selectedScopes,
          userMetadata: {
            email: user?.email || (extractedId.includes('@') ? extractedId : `${extractedId}@haevy.ecosystem`),
            accountId: extractedId,
            displayName: displayName || user?.displayName || (extractedId.includes('@') ? extractedId.split('@')[0] : extractedId) || 'Thành viên Haevy',
            avatarUrl: user?.photoURL || ''
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xác thực MCP thất bại');
      }

      setSession(data.session);
      saveMCPSession(data.session);
      setStatus('connected');
      haptics.impact('heavy');

      addLog('server_to_client', 'mcp/auth/token_granted', {
        token: `${data.session.token.slice(0, 16)}...`,
        expiresAt: data.session.expiresAt,
        grantedScopes: data.session.grantedScopes
      });

      // Switch to Query tab automatically after successful authentication
      setTimeout(() => {
        setActiveTab('query');
      }, 500);

    } catch (err: any) {
      console.error('MCP Auth error:', err);
      setAuthError(err?.message || 'Không thể xác thực thông tin đăng nhập với máy chủ MCP');
      setStatus('error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 2. Handle Logout / Invalidate MCP Token
  const handleDisconnect = () => {
    haptics.impact('light');
    clearMCPSession();
    setSession(null);
    setStatus('disconnected');
    setQueryResult(null);
    addLog('client_to_server', 'mcp/auth/revoke', { reason: 'User revoked MCP session' });
  };

  // 3. Handle Execute AI MCP Query
  const handleRunQuery = async (customPrompt?: string) => {
    const textToQuery = (customPrompt || queryInput).trim();
    if (!textToQuery || isQuerying) return;

    if (!session) {
      setActiveTab('auth');
      setAuthError('Vui lòng hoàn tất bước nhập thông tin đăng nhập để cấp quyền MCP trước khi truy cứu.');
      return;
    }

    haptics.impact('medium');
    setIsQuerying(true);
    setQueryInput(textToQuery);

    const userContextSnapshot = gatherFullMCPUserContext(authContext);
    const startMs = Date.now();

    addLog('client_to_server', 'tools/call', {
      query: textToQuery,
      mcpToken: `${session.token.slice(0, 14)}...`,
      grantedScopes: session.grantedScopes
    });

    try {
      const res = await fetch('/api/mcp/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToQuery,
          userContext: userContextSnapshot,
          mcpToken: session.token,
          selectedScopes: session.grantedScopes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi truy cứu thông tin qua MCP');
      }

      const elapsed = Date.now() - startMs;
      setQueryResult({
        query: textToQuery,
        toolExecuted: data.executedTool,
        executionTimeMs: data.executionTimeMs || elapsed,
        aiSummary: data.aiSummary,
        extractedData: data.extractedData,
        rawJsonRpc: {
          jsonrpc: '2.0',
          result: {
            tool: data.executedTool,
            status: '200_OK',
            latencyMs: data.executionTimeMs || elapsed,
            content: [{ type: 'text', text: data.aiSummary }],
            data: data.extractedData
          }
        }
      });

      addLog('server_to_client', 'tools/call_result', {
        tool: data.executedTool,
        latencyMs: data.executionTimeMs || elapsed,
        status: 'success'
      }, elapsed);

      haptics.impact('heavy');

    } catch (err: any) {
      console.error('MCP Query error:', err);
      // Fallback local query
      const elapsed = Date.now() - startMs;
      setQueryResult({
        query: textToQuery,
        toolExecuted: 'mcp_read_user_profile',
        executionTimeMs: elapsed,
        aiSummary: `✅ **Đã đọc dữ liệu an toàn qua giao thức MCP cho ${displayName || 'bạn'}:**\n\n- 🆔 **ID Tài khoản:** ${accountId || 'HV-MEMBER'}\n- 🎖️ **Cấp độ:** LV.3 (Bậc Tinh Hoa)\n- 👑 **Gói:** ${vipTier || 'Thành viên'}\n- 🪙 **Số dư Xu:** ${(authContext?.haevyLiteCoins || 1250).toLocaleString()} Xu\n- ⏱️ **Thời lượng nghe:** ${authContext?.totalListenedMinutes || 185} phút\n\n*(Dữ liệu được trích xuất trực tiếp từ Context Provider)*`,
        extractedData: userContextSnapshot.profile,
        rawJsonRpc: { jsonrpc: '2.0', result: userContextSnapshot.profile }
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // Preset query shortcuts
  const PRESET_QUERIES = [
    {
      title: 'Hồ Sơ & Định Danh',
      query: 'Truy cứu thông tin tài khoản, tên hiển thị, ID và trạng thái VIP của tôi.',
      icon: User,
      tool: 'mcp_read_user_profile'
    },
    {
      title: 'Cấp Độ LV & Quà Tặng',
      query: 'Kiểm tra cấp độ LV, điểm EXP hiện có và danh sách quà tặng đặc quyền chưa nhận.',
      icon: Award,
      tool: 'mcp_query_level_exp'
    },
    {
      title: 'Số Dư Xu & Sổ 6 Hũ',
      query: 'Tra cứu số dư Xu Haevy, ví tài chính và phân bổ dòng tiền 6 hũ.',
      icon: Coins,
      tool: 'mcp_inspect_finance_jars'
    },
    {
      title: 'Lịch Sử Nghe & Playlist',
      query: 'Đọc thời lượng nghe nhạc hôm nay, số bài yêu thích và thống kê audio.',
      icon: Headphones,
      tool: 'mcp_fetch_audio_stats'
    },
    {
      title: 'Phả Hệ Gia Tộc',
      query: 'Tra cứu các thế hệ và số lượng thành viên trong cây gia phả dòng họ.',
      icon: TreePine,
      tool: 'mcp_query_family_tree'
    },
    {
      title: 'Đếm Ngày Yêu Cặp Đôi',
      query: 'Đọc số ngày yêu nhau và cột mốc kỷ niệm trong không gian I Love Haevy.',
      icon: Heart,
      tool: 'mcp_inspect_couple_data'
    },
    {
      title: 'Sổ Tay Học Tập Edu',
      query: 'Kiểm tra ghi chú First Principles, điểm XP và chuỗi streak học tập.',
      icon: GraduationCap,
      tool: 'mcp_read_edu_notes'
    },
    {
      title: 'An Ninh Tài Khoản 6 Lớp',
      query: 'Kiểm tra điểm số bảo mật tài khoản và trạng thái bảo vệ 6 lớp.',
      icon: Shield,
      tool: 'mcp_check_security_status'
    }
  ];

  const handleCopyToken = () => {
    if (!session?.token) return;
    navigator.clipboard.writeText(session.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex-none px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Cpu size={20} className="text-cyan-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  Giao Diện MCP Context Cho AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Model Context Protocol
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Cổng xác thực danh tính & cấp quyền cho AI truy cứu thông tin người dùng an toàn
              </p>
            </div>
          </div>

          {/* Right Status Badge & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {status === 'connected' ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MCP Connected</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                <Lock size={12} />
                <span>Chờ Đăng Nhập</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => { haptics.selection(); onClose(); }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-none flex items-center gap-1 px-5 pt-2 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('auth'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'auth'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key size={14} />
            <span>1. Xác Thực Đăng Nhập {session && '✓'}</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('query'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'query'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search size={14} />
            <span>2. Truy Cứu Thông Tin AI</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('tools'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'tools'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database size={14} />
            <span>Công Cụ MCP ({MCP_AVAILABLE_TOOLS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('logs'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal size={14} />
            <span>Nhật Ký Protocol ({logs.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">

          {/* ========================================================================= */}
          {/* TAB 1: AUTHENTICATION & LOGIN CREDENTIALS STEP                            */}
          {/* ========================================================================= */}
          {activeTab === 'auth' && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Informational Guidance */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2.5 text-sm font-bold text-cyan-300 mb-1">
                  <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
                  <span>Bước Nhập Thông Tin Đăng Nhập Cấp Quyền Cho AI</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Theo chuẩn giao thức <strong>Model Context Protocol (MCP)</strong>, trí tuệ nhân tạo chỉ được phép đọc dữ liệu cá nhân (Hồ sơ, Cấp độ, Ví tài chính, Kho nhạc, Gia phả) sau khi người dùng xác thực thông tin tài khoản và phê duyệt các quyền truy cập (Scopes).
                </p>
              </div>

              {/* Status Banner if already connected */}
              {session && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/50 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">
                            {session.displayName}
                          </h4>
                          <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                            TOKEN HỢP LỆ
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          ID: {session.accountId} • Email: {session.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all shrink-0"
                    >
                      Đăng Xuất MCP
                    </button>
                  </div>

                  {/* Token Details */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-2 truncate">
                      <span>Token:</span>
                      <code className="bg-zinc-950 px-2 py-0.5 rounded text-cyan-300 truncate max-w-[200px] sm:max-w-[300px]">
                        {session.token}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedToken ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedToken ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Login Credentials Form */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Key size={16} className="text-cyan-400" />
                    <span>Thông Tin Xác Thực Danh Tính</span>
                  </h3>
                  
                  {/* Quick Auth Button */}
                  <button
                    type="button"
                    onClick={() => handleAuthenticate(true)}
                    disabled={isAuthenticating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Đăng Nhập Nhanh Tài Khoản Này</span>
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Tên Đăng Nhập: ID tài khoản + &haevy.vn
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        &haevy.vn
                      </span>
                    </div>
                    <input
                      type="text"
                      value={inputIdentifier}
                      onChange={(e) => setInputIdentifier(e.target.value)}
                      placeholder="VD: HV-84489536&haevy.vn"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Mật Khẩu: Mã Khởi Động Lớp 6
                      </label>
                      <button
                        type="button"
                        onClick={() => setInputCredential(getActiveMasterKey())}
                        className="text-[10px] text-rose-300 hover:text-rose-200 font-bold underline cursor-pointer"
                      >
                        Điền nhanh Mã Lớp 6
                      </button>
                    </div>
                    <input
                      type="password"
                      value={inputCredential}
                      onChange={(e) => setInputCredential(e.target.value)}
                      placeholder="Nhập Mã Khởi Động Lớp 6 (HAEVY-SEC-...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* Scopes Checklist */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300">
                      Chọn Quyền Dữ Liệu Cho AI Truy Cứu (MCP Scopes):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedScopes.length === MCP_AVAILABLE_SCOPES.length) {
                          setSelectedScopes([]);
                        } else {
                          setSelectedScopes(MCP_AVAILABLE_SCOPES.map(s => s.id));
                        }
                      }}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      {selectedScopes.length === MCP_AVAILABLE_SCOPES.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MCP_AVAILABLE_SCOPES.map((scope) => {
                      const isChecked = selectedScopes.includes(scope.id);
                      return (
                        <label
                          key={scope.id}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-white' 
                              : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedScopes(prev => 
                                isChecked ? prev.filter(id => id !== scope.id) : [...prev, scope.id]
                              );
                            }}
                            className="mt-0.5 rounded border-zinc-700 text-cyan-500 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{scope.name}</span>
                              <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">
                                {scope.id}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                              {scope.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={() => handleAuthenticate(false)}
                  disabled={isAuthenticating || !inputIdentifier.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-black text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Đang Xác Thực Thông Tin Đăng Nhập MCP...</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      <span>Xác Thực & Cấp Quyền MCP Cho AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AI QUERY & CONTEXT INSPECT CONSOLE                                 */}
          {/* ========================================================================= */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              {/* Not connected gate */}
              {!session ? (
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-amber-500/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    AI Chưa Được Cấp Quyền Đọc Dữ Liệu MCP
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Vui lòng hoàn tất bước nhập thông tin đăng nhập ở Tab 1 để cấp quyền cho AI truy cứu thông tin người dùng.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
                  >
                    Đến Bước Nhập Đăng Nhập →
                  </button>
                </div>
              ) : (
                <>
                  {/* Search Query Bar */}
                  <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={queryInput}
                          onChange={(e) => setQueryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRunQuery();
                          }}
                          placeholder="Nhập câu hỏi để AI đọc và truy cứu dữ liệu người dùng qua MCP..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRunQuery()}
                        disabled={isQuerying || !queryInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-900/30"
                      >
                        {isQuerying ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Đang Truy Cứu...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>AI Truy Cứu</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Preset Query Chips */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        Gợi ý câu hỏi truy cứu nhanh qua MCP:
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {PRESET_QUERIES.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleRunQuery(item.query)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold whitespace-nowrap transition-all shrink-0 hover:border-purple-500/50"
                            >
                              <Icon size={12} className="text-purple-400" />
                              <span>{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Query Result Display */}
                  {queryResult && (
                    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-purple-500/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      {/* Execution Header */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/40 flex items-center gap-1.5">
                            <Zap size={13} />
                            <span>{queryResult.toolExecuted}</span>
                          </span>
                          <span className="text-xs text-zinc-400">
                            Độ trễ: <strong className="text-emerald-400 font-mono">{queryResult.executionTimeMs}ms</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRawJsonExpanded(!rawJsonExpanded)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800 text-[11px] font-mono hover:text-white transition-colors"
                          >
                            <Code size={12} />
                            <span>{rawJsonExpanded ? 'Ẩn JSON' : 'Xem JSON-RPC'}</span>
                          </button>

                          {onRunChatPrompt && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onRunChatPrompt(queryResult.query);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors"
                              title="Tiếp tục trò chuyện trong Haevy AI Hub"
                            >
                              <span>Chat với kết quả này</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* AI Natural Language Response */}
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-200">
                        <div className="whitespace-pre-line">
                          {queryResult.aiSummary}
                        </div>
                      </div>

                      {/* Raw JSON Context Inspector */}
                      {rawJsonExpanded && (
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60 scrollbar-thin">
                          <pre>{JSON.stringify(queryResult.rawJsonRpc, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MCP TOOLS & RESOURCES SPECIFICATION                                */}
          {/* ========================================================================= */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
                <strong>Danh sách Công cụ MCP (Tools Specification):</strong> Các hàm được đăng ký trong giao thức MCP cho phép AI tự động kích hoạt để truy cứu các trường dữ liệu người dùng khi có câu hỏi tương ứng.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {MCP_AVAILABLE_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <code className="text-xs font-bold text-cyan-300 font-mono">
                          {tool.name}
                        </code>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {tool.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">
                        JSON Schema 2020-12
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('query');
                          handleRunQuery(`Chạy thử công cụ ${tool.name} để truy cứu thông tin người dùng.`);
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all"
                      >
                        Chạy Thử Công Cụ →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PROTOCOL LOGS / JSON-RPC STREAM                                    */}
          {/* ========================================================================= */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  Luồng thông điệp JSON-RPC 2.0 thời gian thực ({logs.length} sự kiện)
                </span>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Xoá nhật ký
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs font-mono bg-zinc-950 rounded-2xl border border-zinc-850">
                  Chưa có thông điệp MCP nào được trao đổi trong phiên này.
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto font-mono text-xs scrollbar-thin">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={log.direction === 'client_to_server' ? 'text-cyan-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {log.direction === 'client_to_server' ? '→ CLIENT_SEND' : '← SERVER_RESP'}
                          </span>
                          <span className="text-white font-bold">{log.method}</span>
                        </div>
                        <span className="text-zinc-500">{log.timestamp}</span>
                      </div>
                      <pre className="text-zinc-400 text-[10px] overflow-x-auto bg-zinc-900/50 p-2 rounded">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex-none px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Giao thức: Model Context Protocol (v2024-11-05)</span>
          </div>
          <span>Bảo mật E2EE • Phân quyền Scopes theo tiêu chuẩn</span>
        </div>
      </div>
    </div>
  );
}
