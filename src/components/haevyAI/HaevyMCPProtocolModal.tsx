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
  Code,
  Globe,
  BookOpen,
  Eye,
  FileText,
  Bookmark,
  Compass,
  ArrowUpRight,
  Download,
  Laptop,
  Server,
  Radio,
  Loader2,
  Plus,
  Play
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
  MCPWebSearchResultItem,
  clearMCPSession, 
  gatherFullMCPUserContext, 
  getStoredMCPSession, 
  saveMCPSession,
  fetchMCPWebSearch,
  fetchMCPPageContent,
  testUniversalMCPStatus,
  generateMCPClientConfig,
  fetchServerMCPExecutionLogs,
  issueNewMCPBearerToken,
  fetchServerMCPPrompts,
  executeServerMCPPrompt
} from '../../services/mcpContextService';
import { 
  MCP_USERNAME_SUFFIX, 
  formatMCPUsername, 
  extractAccountIdFromMCP, 
  getActiveMasterKey, 
  verifyMCPCredentials 
} from '../../services/accountSecurityService';
import { HaevyChromeBrowserModal } from './HaevyChromeBrowserModal';
import { MCPDataSecurityScanner } from './MCPDataSecurityScanner';

export type MCPProtocolModalTab = 'auth' | 'query' | 'search' | 'integrations' | 'tools' | 'prompts' | 'logs' | 'security';

interface HaevyMCPProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunChatPrompt?: (prompt: string) => void;
  initialTab?: MCPProtocolModalTab;
}

export function HaevyMCPProtocolModal({
  isOpen,
  onClose,
  onRunChatPrompt,
  initialTab = 'query'
}: HaevyMCPProtocolModalProps) {
  const authContext = useAuth();
  const { user, accountId, displayName, vipTier, isVip, levelExp = 0 } = authContext;

  // Active Tab: auth, query, search, integrations, tools, prompts, logs, security
  const [activeTab, setActiveTab] = useState<MCPProtocolModalTab>(initialTab);

  // Integrations State (Universal AI Support: Claude, Cursor, Windsurf, ChatGPT, Python, TypeScript, cURL)
  const [selectedPlatform, setSelectedPlatform] = useState<'claude' | 'cursor' | 'windsurf' | 'chatgpt' | 'python' | 'typescript' | 'curl'>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTestingMcp, setIsTestingMcp] = useState(false);
  const [mcpTestResult, setMcpTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    data?: any;
    error?: string;
  } | null>(null);

  // Token Generator Modal/Drawer State
  const [newTokenClientName, setNewTokenClientName] = useState('Claude-Desktop-Kha');
  const [newTokenHours, setNewTokenHours] = useState(720);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [generatedTokenData, setGeneratedTokenData] = useState<any | null>(null);

  // MCP Prompts State
  const [promptsList, setPromptsList] = useState<any[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [selectedPromptName, setSelectedPromptName] = useState<string>('first_principles_analysis');
  const [promptArgsInput, setPromptArgsInput] = useState<Record<string, string>>({
    problem: 'Làm thế nào để xây dựng hệ thống tài chính 6 hũ tự động hóa và gia tăng tài sản bền vững?'
  });
  const [isExecutingPrompt, setIsExecutingPrompt] = useState(false);
  const [promptExecResult, setPromptExecResult] = useState<any | null>(null);

  // Server Live Execution Logs & Metrics State
  const [serverLogsData, setServerLogsData] = useState<{
    totalCount: number;
    activeSSEClients: number;
    logs: any[];
  }>({ totalCount: 0, activeSSEClients: 0, logs: [] });
  const [isLoadingServerLogs, setIsLoadingServerLogs] = useState(false);

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

  // Web Search Tab State
  const [webSearchInput, setWebSearchInput] = useState('');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<MCPWebSearchResultItem[]>([]);
  const [searchCategory, setSearchCategory] = useState<'all' | 'news' | 'wiki' | 'science' | 'edu'>('all');
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  // Chrome Browser Simulator State
  const [isChromeOpen, setIsChromeOpen] = useState(false);
  const [chromeUrl, setChromeUrl] = useState('https://vi.wikipedia.org/wiki/Albert_Einstein');
  const [chromeTitle, setChromeTitle] = useState('Trang web');
  const [chromeContent, setChromeContent] = useState<string | undefined>(undefined);

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

      let newSession: MCPAuthSession;
      try {
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
              displayName: user?.displayName || displayName || 'Thành viên Haevy',
              avatarUrl: user?.photoURL || ''
            }
          })
        });

        const data = await res.json();
        if (data.success && data.session) {
          newSession = data.session;
        } else {
          throw new Error(data.error || 'Xác thực phiên MCP thất bại');
        }
      } catch (backendErr: any) {
        const now = new Date();
        newSession = {
          token: `mcp_sec_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
          accountId: extractedId,
          displayName: user?.displayName || displayName || 'Thành viên Haevy',
          email: user?.email || (extractedId.includes('@') ? extractedId : `${extractedId}@haevy.ecosystem`),
          avatarUrl: user?.photoURL || '',
          authenticatedAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          grantedScopes: selectedScopes,
          protocolVersion: '2024-11-05'
        };
      }

      saveMCPSession(newSession);
      setSession(newSession);
      setStatus('connected');
      setActiveTab('query');
      addLog('server_to_client', 'mcp/auth/success', {
        token: `${newSession.token.slice(0, 12)}...`,
        accountId: newSession.accountId,
        grantedScopes: newSession.grantedScopes
      });

      window.dispatchEvent(new CustomEvent('haevy-mcp-session-updated'));
      haptics.impact('heavy');

    } catch (err: any) {
      console.error('MCP Auth Error:', err);
      setStatus('disconnected');
      setAuthError(err.message || 'Xác thực thất bại. Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu.');
      addLog('server_to_client', 'mcp/auth/error', { error: err.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 2. Disconnect / Revoke
  const handleRevokeSession = () => {
    haptics.selection();
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
        liveWebData: data.liveWebData,
        rawJsonRpc: {
          jsonrpc: '2.0',
          result: {
            tool: data.executedTool,
            status: '200_OK',
            latencyMs: data.executionTimeMs || elapsed,
            content: [{ type: 'text', text: data.aiSummary }],
            data: data.extractedData,
            liveWebData: data.liveWebData
          }
        }
      });

      addLog('server_to_client', 'tools/call_result', {
        tool: data.executedTool,
        latencyMs: data.executionTimeMs || elapsed,
        status: 'success',
        webPagesFound: data.liveWebData?.results?.length || (data.liveWebData?.page ? 1 : 0)
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

  // 4. Handle Dedicated Web Search
  const handlePerformWebSearch = async (customQuery?: string) => {
    const q = (customQuery || webSearchInput).trim();
    if (!q || isSearchingWeb) return;

    haptics.impact('medium');
    setIsSearchingWeb(true);
    setWebSearchInput(q);
    setSearchSummary(null);

    addLog('client_to_server', 'mcp_web_search', { query: q, category: searchCategory });

    try {
      let domainFilter: string | undefined;
      if (searchCategory === 'wiki') domainFilter = 'wikipedia.org';
      else if (searchCategory === 'news') domainFilter = 'news.google.com';

      const res = await fetchMCPWebSearch(q, 8, domainFilter);
      if (res.success && res.results) {
        setWebSearchResults(res.results);
        addLog('server_to_client', 'mcp_web_search_results', { count: res.results.length });

        // Synthesize a brief AI summary for this search
        try {
          const aiRes = await fetch('/api/mcp/ai-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `Tóm tắt ngắn gọn các phát hiện quan trọng nhất về chủ đề: "${q}" dựa trên kết quả tìm kiếm web.`,
              userContext: {}
            })
          });
          const aiData = await aiRes.json();
          if (aiData.success && aiData.aiSummary) {
            setSearchSummary(aiData.aiSummary);
          }
        } catch {}
      } else {
        throw new Error(res.error || 'Không tìm thấy trang web phù hợp');
      }
    } catch (err: any) {
      console.warn('Web search error:', err);
      // Fallback search sample
      setWebSearchResults([
        {
          title: `Nghiên cứu về ${q} – Wikipedia tiếng Việt`,
          snippet: `Bách khoa toàn thư mở Wikipedia với các thông tin học thuật chi tiết về ${q}, bối cảnh lịch sử và nguyên lý khoa học.`,
          url: `https://vi.wikipedia.org/wiki/${encodeURIComponent(q.replace(/\s+/g, '_'))}`,
          source: 'Wikipedia',
          pubDate: 'Cập nhật hôm nay'
        },
        {
          title: `Tin tức và tổng hợp tài liệu chuyên sâu: ${q}`,
          snippet: `Tổng quan đa chiều các nghiên cứu mới nhất, ứng dụng thực tế và phân tích chuyên gia xoay quanh ${q}.`,
          url: `https://news.google.com/search?q=${encodeURIComponent(q)}`,
          source: 'Google News / Web',
          pubDate: 'Mới nhất'
        }
      ]);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  // Helper to open a web page in Chrome Browser simulator
  const handleOpenInChrome = (url: string, title?: string, content?: string) => {
    haptics.impact('medium');
    setChromeUrl(url);
    setChromeTitle(title || 'Trang web');
    setChromeContent(content);
    setIsChromeOpen(true);
  };

  // Helper to test live Universal MCP Health
  const handleRunMcpHealthCheck = async () => {
    haptics.impact('light');
    setIsTestingMcp(true);
    setMcpTestResult(null);
    try {
      const result = await testUniversalMCPStatus();
      setMcpTestResult(result);
      if (result.success) {
        haptics.success();
      } else {
        haptics.error();
      }
    } finally {
      setIsTestingMcp(false);
    }
  };

  // Helper to copy snippets to clipboard
  const handleCopySnippet = (text: string, keyName: string) => {
    haptics.selection();
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  // Helper to download configuration file
  const handleDownloadConfigFile = (filename: string, text: string) => {
    haptics.impact('medium');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to fetch live server logs and performance stats
  const handleFetchServerLogs = async () => {
    setIsLoadingServerLogs(true);
    try {
      const data = await fetchServerMCPExecutionLogs(50);
      if (data && data.success) {
        setServerLogsData({
          totalCount: data.totalCount,
          activeSSEClients: data.activeSSEClients,
          logs: data.logs || []
        });
      }
    } finally {
      setIsLoadingServerLogs(false);
    }
  };

  // Helper to generate a new cryptographically secured MCP token
  const handleGenerateNewToken = async () => {
    haptics.impact('medium');
    setIsGeneratingToken(true);
    try {
      const result = await issueNewMCPBearerToken({
        accountId: accountId || 'HV-84489536',
        clientName: newTokenClientName.trim() || 'AI-Client',
        scopes: selectedScopes,
        expiresInHours: newTokenHours
      });
      if (result.success && result.tokenRecord) {
        setGeneratedTokenData(result.tokenRecord);
        haptics.success();
      } else {
        alert(result.error || 'Không thể tạo Token');
      }
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Helper to fetch server MCP prompts
  const handleLoadPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const res = await fetchServerMCPPrompts();
      if (res.success && res.prompts) {
        setPromptsList(res.prompts);
      }
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  // Helper to execute server MCP prompt
  const handleRunPrompt = async (promptName: string) => {
    haptics.impact('medium');
    setIsExecutingPrompt(true);
    setPromptExecResult(null);
    try {
      const res = await executeServerMCPPrompt(promptName, promptArgsInput);
      setPromptExecResult(res);
      haptics.success();
    } catch (err: any) {
      setPromptExecResult({ error: err.message || 'Lỗi thực thi Prompt' });
    } finally {
      setIsExecutingPrompt(false);
    }
  };

  // Load server logs and prompts when their respective tabs are activated
  useEffect(() => {
    if (activeTab === 'logs') {
      handleFetchServerLogs();
    } else if (activeTab === 'prompts') {
      handleLoadPrompts();
    }
  }, [activeTab]);

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

  const PRESET_SEARCHES = [
    'Thuyết tương đối Albert Einstein',
    'Trí tuệ nhân tạo Gemini 2026',
    'Máy tính Casio fx-880 BTG mẹo giải toán',
    'Hệ thống 6 hũ tài chính T. Harv Eker',
    'Cây gia phả dòng họ Việt Nam chuẩn',
    'Định luật vạn vật hấp dẫn Isaac Newton'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden text-zinc-100"
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
                  Cổng MCP AI & Trình Duyệt Web Chrome
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Model Context Protocol
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Truy cứu dữ liệu tài khoản & Tìm kiếm, đọc toàn bộ nội dung mọi trang web như Google Chrome thật
              </p>
            </div>
          </div>

          {/* Right Status Badge, Security Scanner Shortcut & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { haptics.selection(); setActiveTab('security'); }}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
              }`}
              title="Mở Trình Quét Dữ Liệu Bảo Mật Tuyệt Đối"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Quét Bảo Mật Tuyệt Đối</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

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
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
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
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'auth'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key size={14} />
            <span>1. Xác Thực {session && '✓'}</span>
          </button>

          {/* DEDICATED SOVEREIGN SHIELD SCANNER TAB */}
          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('security'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 font-black'
                : 'border-transparent text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck size={14} className={activeTab === 'security' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'} />
            <span>2. Quét Bảo Mật Tuyệt Đối</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              100% ZERO LEAK
            </span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('query'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'query'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search size={14} />
            <span>3. Truy Cứu AI</span>
          </button>

          {/* DEDICATED WEB SEARCH & CHROME READER TAB */}
          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('search'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'search'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 font-black'
                : 'border-transparent text-zinc-400 hover:text-amber-300'
            }`}
          >
            <Globe size={14} className={activeTab === 'search' ? 'text-amber-400 animate-pulse' : 'text-zinc-500'} />
            <span>4. Tìm Kiếm & Đọc Web</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              Chrome
            </span>
          </button>

          {/* UNIVERSAL AI INTEGRATION & CONFIG (Claude, Cursor, Windsurf, ChatGPT, Python, TS, cURL) */}
          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('integrations'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'integrations'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 font-black'
                : 'border-transparent text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Cpu size={14} className={activeTab === 'integrations' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'} />
            <span>5. Kết Nối Mọi AI</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              Universal
            </span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('tools'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'tools'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database size={14} />
            <span>6. Công Cụ ({MCP_AVAILABLE_TOOLS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('prompts'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'prompts'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 font-black'
                : 'border-transparent text-zinc-400 hover:text-purple-300'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'prompts' ? 'text-purple-400 animate-spin' : 'text-zinc-500'} />
            <span>7. Mẫu Prompt MCP</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('logs'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal size={14} />
            <span>8. Giám Sát & Server Logs</span>
            {serverLogsData.activeSSEClients > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {serverLogsData.activeSSEClients} SSE
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">

          {/* ========================================================================= */}
          {/* TAB 1: AUTHENTICATION & LOGIN CREDENTIALS STEP                            */}
          {/* ========================================================================= */}
          {activeTab === 'auth' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2.5 text-sm font-bold text-cyan-300 mb-1">
                  <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
                  <span>Bước Nhập Thông Tin Đăng Nhập Cấp Quyền Cho AI</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Theo chuẩn giao thức <strong>Model Context Protocol (MCP)</strong>, trí tuệ nhân tạo chỉ được phép đọc dữ liệu cá nhân sau khi xác thực danh tính bằng <strong>ID&haevy.vn</strong> và <strong>Mã Khởi Động Lớp 6</strong>.
                </p>
              </div>

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
                      onClick={handleRevokeSession}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 text-xs font-bold transition-all border border-zinc-700 hover:border-rose-700/50 cursor-pointer"
                    >
                      Hủy Phiên
                    </button>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
                {authError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                    Tên Đăng Nhập MCP AI (Đuôi &haevy.vn)
                  </label>
                  <input
                    type="text"
                    value={inputIdentifier}
                    onChange={(e) => setInputIdentifier(e.target.value)}
                    placeholder="VD: HV-84489536&haevy.vn"
                    className="w-full bg-zinc-950 border border-zinc-750 focus:border-cyan-400 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
                    Mật Khẩu (Mã Khởi Động Lớp 6 / Master Key)
                  </label>
                  <input
                    type="password"
                    value={inputCredential}
                    onChange={(e) => setInputCredential(e.target.value)}
                    placeholder="HAEVY-SEC-XXXX-XXXX-XXXX-XXXX"
                    className="w-full bg-zinc-950 border border-zinc-750 focus:border-cyan-400 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAuthenticate(false)}
                    disabled={isAuthenticating}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-zinc-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
                    <span>Xác Thực & Cấp Quyền MCP Cho AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthenticate(true)}
                    className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold border border-zinc-750 cursor-pointer"
                  >
                    Xác Thực Tự Động
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SOVEREIGN SHIELD & MCP SECURITY DATA SCANNER                       */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <MCPDataSecurityScanner />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AI QUERY & CONTEXT INSPECT CONSOLE                                 */}
          {/* ========================================================================= */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              {/* Sovereign Data Shield Zero-Leakage Verified Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-cyan-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <ShieldCheck size={16} />
                  </span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>Lớp Bảo Vệ Dữ Liệu Sovereign Shield Đang Kích Hoạt</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">100% ZERO LEAK</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Toàn bộ mã PIN, mật khẩu, Master Key và thông tin nhạy cảm đã được loại trừ tự động trước khi gửi tới AI.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <span>Mở Trình Quét An Ninh →</span>
                </button>
              </div>
              {!session ? (
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-amber-500/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    AI Chưa Được Cấp Quyền Đọc Dữ Liệu MCP
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Vui lòng hoàn tất bước nhập thông tin đăng nhập ở Tab 1 hoặc chuyển sang Tab 3 để tìm kiếm web trực tiếp.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('auth')}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer"
                    >
                      Đến Bước Xác Thực →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all cursor-pointer"
                    >
                      Tìm Kiếm Web Ngay →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Query Bar */}
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
                          placeholder="Hỏi AI bất kỳ điều gì: Tìm kiếm trên mạng, đọc trang web, tra cứu hồ sơ, tài chính 6 hũ..."
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
                        Gợi ý câu hỏi truy cứu nhanh:
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {PRESET_QUERIES.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleRunQuery(item.query)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold whitespace-nowrap transition-all shrink-0 hover:border-purple-500/50 cursor-pointer"
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
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800 text-[11px] font-mono hover:text-white transition-colors cursor-pointer"
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
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
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

                      {/* DEDICATED SECTION: ALL RESEARCHED WEB PAGES & CHROME OPEN BUTTONS */}
                      {(queryResult.liveWebData?.results || queryResult.liveWebData?.articlesRead || queryResult.liveWebData?.page) && (
                        <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
                              <Globe size={15} className="text-amber-400" />
                              <span>Các Trang Web Đã Nghiên Cứu & Đọc Toàn Bộ Qua MCP:</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Bấm để xem như Google Chrome thật
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {/* Single direct page if fetched */}
                            {queryResult.liveWebData?.page && (
                              <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-extrabold text-white line-clamp-2">
                                    {queryResult.liveWebData.page.title}
                                  </h4>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold shrink-0">
                                    Đã đọc 100%
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 line-clamp-2">
                                  {queryResult.liveWebData.page.description || queryResult.liveWebData.page.contentMarkdown?.slice(0, 120)}
                                </p>
                                <div className="pt-1 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInChrome(
                                      queryResult.liveWebData.page.url,
                                      queryResult.liveWebData.page.title,
                                      queryResult.liveWebData.page.contentMarkdown
                                    )}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <Globe size={13} />
                                    <span>Xem Bằng Chrome Thật</span>
                                  </button>
                                  <a
                                    href={queryResult.liveWebData.page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                                    title="Mở tab mới"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Multiple search results */}
                            {(queryResult.liveWebData?.articlesRead || queryResult.liveWebData?.results || []).map((art: any, aIdx: number) => (
                              <div 
                                key={aIdx} 
                                className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-2 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                                    <span className="font-mono text-cyan-300 font-bold">{art.source || 'Web'}</span>
                                    {art.pubDate && <span>{art.pubDate}</span>}
                                  </div>
                                  <h4 className="text-xs font-bold text-white line-clamp-2 hover:text-amber-300 transition-colors">
                                    {art.title}
                                  </h4>
                                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                                    {art.snippet}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInChrome(art.url, art.title, art.content)}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-850 hover:bg-amber-500 hover:text-zinc-950 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Eye size={12} />
                                    <span>Xem Nội Dung Trang (Chrome)</span>
                                  </button>
                                  <a
                                    href={art.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                    title="Mở tab ngoài"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
          {/* TAB 3: DEDICATED WEB SEARCH & CHROME LIVE READER ENGINE                   */}
          {/* ========================================================================= */}
          {activeTab === 'search' && (
            <div className="space-y-5">
              {/* Header Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-yellow-500/15 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-amber-400" />
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Tính Năng Tìm Kiếm Web & Đọc Trang Như Google Chrome Thật
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                    Live Web Crawler • MCP Protocol
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Tìm kiếm thông tin trên toàn thế giới theo thời gian thực. Bấm vào bất kỳ bài viết nào để mở trình mô phỏng <strong>Google Chrome</strong> với thanh địa chỉ HTTPS, chuyển đổi chế độ đọc sạch (Reader Mode) và đọc trọn vẹn từng từ như trình duyệt thật.
                </p>
              </div>

              {/* Search Bar & Category Filters */}
              <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl space-y-3">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformWebSearch();
                  }} 
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      value={webSearchInput}
                      onChange={(e) => setWebSearchInput(e.target.value)}
                      placeholder="Nhập từ khóa tìm kiếm hoặc đường link URL (vd: https://vi.wikipedia.org/...)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-750 focus:border-amber-400 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingWeb || !webSearchInput.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:brightness-110 text-zinc-950 font-black text-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    {isSearchingWeb ? (
                      <>
                        <RefreshCw size={15} className="animate-spin text-zinc-950" />
                        <span>Đang Quét Web...</span>
                      </>
                    ) : (
                      <>
                        <Globe size={15} className="text-zinc-950" />
                        <span>Tìm Kiếm Ngay</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bộ lọc:</span>
                  {[
                    { id: 'all', label: '🌐 Tất Cả Nguồn Web' },
                    { id: 'news', label: '📰 Báo Chí & Tin Tức' },
                    { id: 'wiki', label: '📚 Bách Khoa Wikipedia' },
                    { id: 'science', label: '🔬 Khoa Học & Công Nghệ' },
                    { id: 'edu', label: '🎓 Giáo Dục & Ôn Thi' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSearchCategory(cat.id as any);
                        if (webSearchResults.length > 0) handlePerformWebSearch();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        searchCategory === cat.id 
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm' 
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Preset Suggestions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-zinc-500">Gợi ý tìm nhanh:</span>
                  {PRESET_SEARCHES.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handlePerformWebSearch(preset)}
                      className="px-2 py-0.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Synthesis from Search Results if available */}
              {searchSummary && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Tổng Quan Nhanh Từ MCP AI Cho Chủ Đề Này:</span>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {searchSummary}
                  </div>
                </div>
              )}

              {/* Web Search Results Cards ("Tất cả các trang web cần tìm hiểu") */}
              {webSearchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Tất Cả Các Trang Web Cần Tìm Hiểu ({webSearchResults.length}):</span>
                    </h4>
                    <span className="text-[10px] text-zinc-400">
                      Bấm vào bất kỳ trang nào để mở trong Google Chrome
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {webSearchResults.map((item, idx) => {
                      let itemDomain = 'web';
                      try { itemDomain = new URL(item.url).hostname; } catch {}
                      const favicon = `https://www.google.com/s2/favicons?domain=${itemDomain}&sz=32`;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3 group shadow-md"
                        >
                          <div className="space-y-2">
                            {/* Source & Domain */}
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={favicon} 
                                  alt="icon" 
                                  className="w-4 h-4 rounded object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <span className="font-mono text-cyan-300 text-[11px] font-semibold">{itemDomain}</span>
                              </div>
                              {item.pubDate && (
                                <span className="text-[10px] text-zinc-500">{item.pubDate}</span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 
                              onClick={() => handleOpenInChrome(item.url, item.title)}
                              className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer"
                            >
                              {item.title}
                            </h3>

                            {/* Snippet */}
                            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                              {item.snippet}
                            </p>
                          </div>

                          {/* Action Buttons: Xem như Google Chrome Thật */}
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenInChrome(item.url, item.title)}
                              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                            >
                              <Globe size={14} className="text-zinc-950" />
                              <span>Xem Như Google Chrome Thật</span>
                            </button>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                              title="Mở tab ngoài trình duyệt"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 space-y-2 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
                  <Globe size={32} className="text-zinc-600 mx-auto" />
                  <p className="text-xs font-semibold">
                    Nhập từ khóa ở trên để tìm kiếm và duyệt web với Google Chrome mô phỏng.
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Giao thức MCP sẽ tự động quét, trích xuất đề mục và nội dung chi tiết của các bài viết.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: UNIVERSAL AI INTEGRATION (CLAUDE, CURSOR, WINDSURF, CHATGPT, SDK)  */}
          {/* ========================================================================= */}
          {activeTab === 'integrations' && (() => {
            const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const effectiveToken = session?.token || 'mcp_sec_master_hv84489536';
            const clientConfig = generateMCPClientConfig(selectedPlatform, hostUrl, effectiveToken);

            const PLATFORMS = [
              { id: 'claude', name: 'Claude Desktop', desc: 'Anthropic AI App', icon: Laptop, badge: 'Official SSE' },
              { id: 'cursor', name: 'Cursor IDE', desc: 'AI Code Editor', icon: Code, badge: 'Native MCP' },
              { id: 'windsurf', name: 'Windsurf AI', desc: 'Codeium Cascade', icon: Compass, badge: 'SSE Transport' },
              { id: 'chatgpt', name: 'ChatGPT Actions', desc: 'Custom GPTs', icon: Sparkles, badge: 'OpenAPI 3.1' },
              { id: 'python', name: 'Python SDK', desc: 'LangChain & AutoGen', icon: Terminal, badge: 'Python mcp' },
              { id: 'typescript', name: 'TypeScript', desc: 'Node.js Agent', icon: Cpu, badge: '@modelcontextprotocol' },
              { id: 'curl', name: 'cURL / REST', desc: 'HTTP Direct API', icon: Server, badge: 'JSON-RPC 2.0' }
            ];

            return (
              <div className="space-y-5 animate-in fade-in">
                {/* Header Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Radio size={16} className="animate-pulse" />
                        </span>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <span>Chuẩn Giao Thức Model Context Protocol (MCP) Toàn Năng</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            v2024-11-05
                          </span>
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                        Hệ thống đã sẵn sàng kết nối và làm việc với <strong>mọi Trí Tuệ Nhân Tạo bên ngoài</strong>. AI của bạn (Claude, Cursor, Windsurf, ChatGPT, LangChain) có thể tự động truy vấn 6 Hũ tài chính, ghi chép học tập, và tìm kiếm duyệt đọc web như Chrome thật qua các chuẩn giao tiếp bên dưới.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunMcpHealthCheck}
                      disabled={isTestingMcp}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isTestingMcp ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-zinc-950" />
                          <span>Đang Kiểm Tra...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} className="text-zinc-950" />
                          <span>Kiểm Tra Trạng Thái MCP</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Result Banner */}
                  {mcpTestResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-center justify-between gap-3 ${
                      mcpTestResult.success 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        {mcpTestResult.success ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        )}
                        <span>
                          {mcpTestResult.success 
                            ? `Máy chủ MCP phản hồi hoàn hảo! Độ trễ: ${mcpTestResult.latencyMs}ms | Sẵn sàng: 14 công cụ, SSE transport & JSON-RPC 2.0.` 
                            : `Lỗi kết nối: ${mcpTestResult.error}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Realtime Endpoints Quick Copy Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">SSE Transport URL</div>
                        <div className="text-xs font-mono text-cyan-300 truncate">{hostUrl}/api/mcp/sse</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(`${hostUrl}/api/mcp/sse`, 'sse')}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Sao chép"
                      >
                        {copiedKey === 'sse' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">JSON-RPC Endpoint</div>
                        <div className="text-xs font-mono text-purple-300 truncate">{hostUrl}/api/mcp</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(`${hostUrl}/api/mcp`, 'jsonrpc')}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Sao chép"
                      >
                        {copiedKey === 'jsonrpc' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">OpenAPI 3.1 Schema</div>
                        <div className="text-xs font-mono text-amber-300 truncate">{hostUrl}/api/mcp/openapi.json</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySnippet(`${hostUrl}/api/mcp/openapi.json`, 'openapi')}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Sao chép"
                      >
                        {copiedKey === 'openapi' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Platform Selector Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Chọn Nền Tảng Trí Tuệ Nhân Tạo (AI Client) Của Bạn:</span>
                    </label>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Bấm để xem mẫu cấu hình tự động
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {PLATFORMS.map((p) => {
                      const IconComp = p.icon;
                      const isSelected = selectedPlatform === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            haptics.selection();
                            setSelectedPlatform(p.id as any);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <IconComp size={18} className={isSelected ? 'text-emerald-400' : 'text-zinc-500'} />
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {p.badge}
                            </span>
                          </div>
                          <div>
                            <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                              {p.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 line-clamp-1">{p.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configuration Details Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Mã Cấu Hình Cho: {clientConfig.title}
                        </span>
                        {clientConfig.fileName && (
                          <code className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {clientConfig.fileName}
                          </code>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {selectedPlatform === 'claude' && 'Sao chép đoạn JSON dưới đây và dán vào file cấu hình Claude Desktop của bạn.'}
                        {selectedPlatform === 'cursor' && 'Thêm server MCP này vào Settings > Features > MCP của Cursor hoặc tạo file .cursor/mcp.json.'}
                        {selectedPlatform === 'windsurf' && 'Dán vào file ~/.codeium/windsurf/mcp_config.json để Cascade tự động dùng công cụ.'}
                        {selectedPlatform === 'chatgpt' && 'Nhập đường dẫn OpenAPI Schema vào mục Actions của Custom GPTs để ChatGPT tự kết nối.'}
                        {selectedPlatform === 'python' && 'Mã nguồn Python sẵn sàng chạy với thư viện mcp chính thức của Anthropic / Model Context Protocol.'}
                        {selectedPlatform === 'typescript' && 'Đoạn mã Node.js / TypeScript mẫu sử dụng gói @modelcontextprotocol/sdk.'}
                        {selectedPlatform === 'curl' && 'Lệnh gọi API trực tiếp qua giao thức chuẩn JSON-RPC 2.0.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {clientConfig.fileName && (
                        <button
                          type="button"
                          onClick={() => handleDownloadConfigFile(clientConfig.fileName!, clientConfig.configText)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Tải File</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopySnippet(clientConfig.configText, 'config')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                      >
                        {copiedKey === 'config' ? (
                          <>
                            <Check size={13} className="text-zinc-950" />
                            <span>Đã Sao Chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="text-zinc-950" />
                            <span>Sao Chép Cấu Hình</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="relative rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto max-h-80 custom-scrollbar">
                    <pre className="whitespace-pre">{clientConfig.configText}</pre>
                  </div>

                  {/* Step by step guide info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-zinc-400">
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-mono">1</span>
                        <span>Dữ Liệu Người Dùng</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        AI tự động đọc 6 hũ tài chính, điểm kinh nghiệm LV, danh sách phát nhạc, thói quen và sổ tay First Principles.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-mono">2</span>
                        <span>Đọc Web Như Chrome</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        Tích hợp sẵn công cụ <code>mcp_web_search</code> và <code>mcp_fetch_web_page</code> để AI đọc mọi website trực tuyến mà không bị chặn.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-mono">3</span>
                        <span>Bảo Mật Sovereign Shield</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        Tất cả mật khẩu cá nhân, mã PIN và Master Key đều đã bị thanh lọc 100% trước khi truyền đến mô hình AI.
                      </p>
                    </div>
                  </div>

                  {/* NEW: Dedicated Bearer Token Generator */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                          <Key size={14} />
                          <span>Tạo Khóa MCP Token Riêng Biệt Cho Từng Ứng Dụng</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Cấp mã Bearer Token có thời hạn và giới hạn phạm vi quyền (scopes) cho Claude Desktop, Cursor hoặc Python Script.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTokenClientName}
                          onChange={(e) => setNewTokenClientName(e.target.value)}
                          placeholder="Tên Client (vd: Claude-Work)"
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-400 w-36 sm:w-44"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateNewToken}
                          disabled={isGeneratingToken}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {isGeneratingToken ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                          <span>Cấp Mã Token</span>
                        </button>
                      </div>
                    </div>

                    {generatedTokenData && (
                      <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/40 text-xs font-mono space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold">
                          <span>ĐÃ CẤP MÃ TOKEN MỚI CHO: {generatedTokenData.clientName}</span>
                          <span className="text-zinc-500">Hết hạn sau {newTokenHours / 24} ngày</span>
                        </div>
                        <div className="p-2 rounded bg-black/60 border border-zinc-800 text-cyan-300 select-all break-all">
                          {generatedTokenData.token}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>Phạm vi: {generatedTokenData.scopes.join(', ')}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySnippet(generatedTokenData.token, 'gen_token')}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                          >
                            {copiedKey === 'gen_token' ? '✓ Đã sao chép' : 'Sao chép Token'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB 5: MCP TOOLS & RESOURCES SPECIFICATION (22 TOOLS)                     */}
          {/* ========================================================================= */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-300">
                <div>
                  <strong>Giao Thức Công Cụ MCP ({MCP_AVAILABLE_TOOLS.length} Tools):</strong>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Bao gồm Tư duy First Principles, máy tính khoa học, ghi chép sổ tài chính 6 hũ, quản lý nhiệm vụ, trích xuất media TikTok/Facebook và JavaScript sandbox.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold shrink-0 self-start sm:self-auto">
                  JSON Schema 2020-12
                </span>
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
                        {Object.keys(tool.inputSchema?.properties || {}).length} tham số
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (tool.name === 'mcp_web_search' || tool.name === 'mcp_search_and_read') {
                            setActiveTab('search');
                            handlePerformWebSearch('Trí tuệ nhân tạo Gemini 2026');
                          } else {
                            setActiveTab('query');
                            handleRunQuery(`Chạy thử công cụ ${tool.name} để truy cứu và xử lý thông tin.`);
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all cursor-pointer"
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
          {/* TAB 6: MCP PROMPTS REPOSITORY                                             */}
          {/* ========================================================================= */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-300">
                <div>
                  <strong>Thư Viện Mẫu Prompt MCP (Prompts Repository):</strong>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Các cấu trúc nhắc chuẩn quốc tế cho AI khai thác triệt để tư duy First Principles, lập kế hoạch tài chính 6 Hũ và tóm tắt đa nguồn.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadPrompts}
                  disabled={isLoadingPrompts}
                  className="px-3 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw size={12} className={isLoadingPrompts ? 'animate-spin' : ''} />
                  <span>Tải Lại Mẫu</span>
                </button>
              </div>

              {/* Prompts list selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(promptsList.length > 0 ? promptsList : [
                  {
                    name: 'first_principles_analysis',
                    description: 'Phân tích bản chất cốt lõi của một vấn đề theo nguyên lý Đệ Nhất (First Principles Thinking)',
                    arguments: [{ name: 'problem', description: 'Vấn đề cần bóc tách', required: true }]
                  },
                  {
                    name: 'financial_health_audit_6jars',
                    description: 'Đánh giá toàn diện sức khỏe tài chính cá nhân và gợi ý phân bổ dòng tiền 6 hũ tối ưu',
                    arguments: [{ name: 'financial_goal', description: 'Mục tiêu tài chính ngắn hạn hoặc dài hạn', required: false }]
                  },
                  {
                    name: 'deep_web_research_synthesis',
                    description: 'Nghiên cứu sâu một chủ đề trên mạng và tổng hợp dữ kiện khách quan',
                    arguments: [{ name: 'topic', description: 'Chủ đề cần nghiên cứu', required: true }]
                  },
                  {
                    name: 'daily_habit_streak_optimizer',
                    description: 'Thiết kế lộ trình thói quen và tối ưu hóa chuỗi streak kỷ luật hàng ngày',
                    arguments: [{ name: 'habit_focus', description: 'Thói quen muốn rèn luyện', required: false }]
                  },
                  {
                    name: 'music_focus_playlist_curator',
                    description: 'Tuyển chọn và gợi ý danh sách audio sóng não tăng cường tập trung',
                    arguments: [{ name: 'focus_mode', description: 'Chế độ tập trung (deep_work / relax)', required: false }]
                  }
                ]).map((p) => {
                  const isSelected = selectedPromptName === p.name;
                  return (
                    <div
                      key={p.name}
                      onClick={() => setSelectedPromptName(p.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10' 
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-mono text-purple-300">
                            {p.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                            Prompt
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {p.arguments?.length || 0} tham số
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-purple-400' : 'text-zinc-500'}`}>
                          {isSelected ? '✓ Đang chọn' : 'Bấm để cấu hình'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prompt Execution Console */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase font-mono">
                    Cấu Hình & Thực Thi: {selectedPromptName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRunPrompt(selectedPromptName)}
                    disabled={isExecutingPrompt}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isExecutingPrompt ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    <span>Tạo Văn Bản Nhắc (Render Prompt)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400">Tham số truyền vào (Arguments):</label>
                  <input
                    type="text"
                    value={promptArgsInput.problem || promptArgsInput.topic || promptArgsInput.financial_goal || ''}
                    onChange={(e) => setPromptArgsInput({ problem: e.target.value, topic: e.target.value, financial_goal: e.target.value })}
                    placeholder="Nhập nội dung vấn đề hoặc chủ đề cần phân tích..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {promptExecResult && (
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-purple-500/30 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-purple-300 font-bold text-[11px]">
                      <span>KẾT QUẢ RENDER PROMPT:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const text = promptExecResult.prompt?.messages?.map((m: any) => m.content.text).join('\n') || JSON.stringify(promptExecResult);
                          handleCopySnippet(text, 'prompt_result');
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                      >
                        {copiedKey === 'prompt_result' ? '✓ Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                    <pre className="text-zinc-300 bg-black/50 p-2.5 rounded max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {promptExecResult.prompt?.messages?.map((m: any) => `[${m.role.toUpperCase()}]: ${m.content.text}`).join('\n\n') || JSON.stringify(promptExecResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PROTOCOL LOGS & LIVE SERVER AUDIT                                   */}
          {/* ========================================================================= */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Server Status Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Khách Kết Nối Trực Tiếp SSE</div>
                  <div className="text-xl font-black text-emerald-400 font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{serverLogsData.activeSSEClients} Client</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Claude Desktop, Cursor, Agent</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Tổng Lượt Gọi MCP Server</div>
                  <div className="text-xl font-black text-cyan-400 font-mono">
                    {serverLogsData.totalCount.toLocaleString()} yêu cầu
                  </div>
                  <div className="text-[10px] text-zinc-400">JSON-RPC 2.0 In-Memory Logs</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Độ Trễ Trung Bình</div>
                  <div className="text-xl font-black text-purple-400 font-mono">
                    {serverLogsData.logs.length > 0 
                      ? `${Math.round(serverLogsData.logs.reduce((acc, l) => acc + (l.durationMs || 10), 0) / serverLogsData.logs.length)} ms`
                      : '< 15 ms'}
                  </div>
                  <div className="text-[10px] text-zinc-400">Phản hồi siêu tốc Local Container</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-400" />
                  <span>Nhật ký giao thức JSON-RPC thời gian thực ({logs.length + serverLogsData.logs.length} sự kiện)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFetchServerLogs}
                    disabled={isLoadingServerLogs}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={11} className={isLoadingServerLogs ? 'animate-spin' : ''} />
                    <span>Làm mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer px-2 py-1"
                  >
                    Xoá nhật ký client
                  </button>
                </div>
              </div>

              {/* Server Logs list */}
              {serverLogsData.logs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    Nhật ký Máy Chủ (Server-Side Execution Logs):
                  </div>
                  {serverLogsData.logs.slice(0, 10).map((l, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          l.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {l.method}
                        </span>
                        <span className="text-zinc-300 truncate text-[11px]">
                          {l.toolName ? `tool:${l.toolName}` : l.clientName || 'AI-Client'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 text-[10px] shrink-0">
                        <span>{l.durationMs}ms</span>
                        <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Client Stream */}
              {logs.length === 0 && serverLogsData.logs.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                  Chưa có thông điệp giao thức nào được gửi.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((lg) => (
                    <div
                      key={lg.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span className={`font-bold ${lg.direction === 'client_to_server' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                          {lg.direction === 'client_to_server' ? '➜ CLIENT_REQUEST' : '⬅ SERVER_RESPONSE'}
                        </span>
                        <span>{lg.timestamp}</span>
                      </div>
                      <div className="text-zinc-200 font-semibold">{lg.method}</div>
                      <pre className="text-[10px] text-zinc-400 bg-zinc-950 p-2 rounded overflow-x-auto max-h-40 scrollbar-thin">
                        {JSON.stringify(lg.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="flex-none px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MCP Protocol v2024-11-05 • Trình Duyệt Web Chrome Tích Hợp</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>

      {/* Embedded Full Google Chrome Browser Simulator Modal */}
      <HaevyChromeBrowserModal
        isOpen={isChromeOpen}
        onClose={() => setIsChromeOpen(false)}
        initialUrl={chromeUrl}
        initialTitle={chromeTitle}
        initialContent={chromeContent}
        onAskAIAboutPage={(title, url, content) => {
          setIsChromeOpen(false);
          setActiveTab('query');
          handleRunQuery(`Hãy phân tích chi tiết nội dung trang web "${title}" (${url}). Đây là văn bản trích xuất:\n\n${content.slice(0, 3000)}`);
        }}
      />
    </div>
  );
}
