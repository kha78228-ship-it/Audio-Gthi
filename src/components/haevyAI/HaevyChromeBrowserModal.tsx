import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Lock, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Maximize2, 
  Minimize2, 
  Search, 
  FileText, 
  Eye, 
  Sparkles, 
  Share2, 
  Bookmark, 
  Plus, 
  Loader2, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut,
  ChevronDown,
  Layers
} from 'lucide-react';
import { fetchMCPPageContent, fetchMCPWebSearch, MCPFetchPageResult } from '../../services/mcpContextService';
import { haptics } from '../../utils/haptics';
import { SocialMediaInteractiveViewer } from './SocialMediaInteractiveViewer';

interface HaevyChromeBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialTitle?: string;
  initialContent?: string;
  onAskAIAboutPage?: (pageTitle: string, pageUrl: string, pageContent: string) => void;
  onOpenHaevyInternetMode?: () => void;
}

const CHROME_BOOKMARKS = [
  { name: 'VnExpress', url: 'https://vnexpress.net', icon: '📰', domain: 'vnexpress.net', color: 'hover:text-amber-400' },
  { name: 'Dân Trí', url: 'https://dantri.com.vn', icon: '⚡', domain: 'dantri.com.vn', color: 'hover:text-cyan-400' },
  { name: 'Tuổi Trẻ', url: 'https://tuoitre.vn', icon: '🗞️', domain: 'tuoitre.vn', color: 'hover:text-red-400' },
  { name: 'Google Tin Tức', url: 'https://news.google.com', icon: '🌐', domain: 'news.google.com', color: 'hover:text-emerald-400' },
  { name: 'Wikipedia Tiếng Việt', url: 'https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh', icon: '📖', domain: 'wikipedia.org', color: 'hover:text-zinc-200' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '🔴', domain: 'youtube.com', color: 'hover:text-red-500' },
  { name: 'TikTok', url: 'https://www.tiktok.com', icon: '🎵', domain: 'tiktok.com', color: 'hover:text-pink-400' },
  { name: 'Facebook', url: 'https://www.facebook.com', icon: '🔵', domain: 'facebook.com', color: 'hover:text-blue-400' },
  { name: 'X / Twitter', url: 'https://x.com', icon: '🖤', domain: 'x.com', color: 'hover:text-zinc-300' }
];

export function HaevyChromeBrowserModal({
  isOpen,
  onClose,
  initialUrl = 'https://vi.wikipedia.org/wiki/Albert_Einstein',
  initialTitle,
  initialContent,
  onAskAIAboutPage,
  onOpenHaevyInternetMode
}: HaevyChromeBrowserModalProps) {
  // Navigation & History
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentUrl = history[historyIndex] || initialUrl;

  const isTikTok = currentUrl.toLowerCase().includes('tiktok.com');
  const isFacebook = currentUrl.toLowerCase().includes('facebook.com') || currentUrl.toLowerCase().includes('fb.com');
  const isSocial = isTikTok ? 'tiktok' : isFacebook ? 'facebook' : null;

  const [addressBarInput, setAddressBarInput] = useState(currentUrl);
  const [displayTitle, setDisplayTitle] = useState(initialTitle || 'Đang tải trang web...');
  
  // Page Data & View State: reader (MCP), proxy (Live Web Proxy), social (FB & TikTok), iframe (Native)
  const [pageData, setPageData] = useState<MCPFetchPageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'reader' | 'proxy' | 'social' | 'iframe'>('reader');
  
  // UI Controls & Spacious Screen Display
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideView, setIsWideView] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'>('lg');
  
  // In-Page Search (Ctrl+F)
  const [showFindInPage, setShowFindInPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  // AI Quick Summary
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Sync when initialUrl changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const startUrl = initialUrl || 'https://vi.wikipedia.org/wiki/Albert_Einstein';
      setHistory([startUrl]);
      setHistoryIndex(0);
      setAddressBarInput(startUrl);
      setDisplayTitle(initialTitle || 'Trang web');
      setAiSummary(null);
      setShowFindInPage(false);

      if (initialContent) {
        // We already have preloaded content
        let domain = '';
        try { domain = new URL(startUrl).hostname; } catch {}
        setPageData({
          title: initialTitle || 'Bài viết',
          url: startUrl,
          domain: domain || 'web',
          description: '',
          wordCount: initialContent.split(/\s+/).filter(Boolean).length,
          contentMarkdown: initialContent,
          success: true
        });
      } else {
        loadPage(startUrl);
      }
    }
  }, [isOpen, initialUrl]);

  // Load a URL via MCP Engine
  const loadPage = async (urlToLoad: string) => {
    if (!urlToLoad) return;
    setIsLoading(true);
    setFetchError(null);
    setAiSummary(null);

    // If it's a search term rather than a URL, redirect to search
    if (!urlToLoad.startsWith('http://') && !urlToLoad.startsWith('https://')) {
      if (urlToLoad.includes('.') && !urlToLoad.includes(' ')) {
        urlToLoad = `https://${urlToLoad}`;
      } else {
        // Search query mode
        try {
          const searchRes = await fetchMCPWebSearch(urlToLoad, 5);
          if (searchRes.success && searchRes.results.length > 0) {
            const firstResult = searchRes.results[0];
            urlToLoad = firstResult.url;
            setDisplayTitle(firstResult.title);
          } else {
            throw new Error(`Không tìm thấy kết quả phù hợp cho "${urlToLoad}"`);
          }
        } catch (searchErr: any) {
          setIsLoading(false);
          setFetchError(searchErr.message || 'Lỗi tìm kiếm');
          return;
        }
      }
    }

    setAddressBarInput(urlToLoad);

    try {
      const res = await fetchMCPPageContent(urlToLoad, 45000);
      if (res.success && res.data) {
        setPageData(res.data);
        setDisplayTitle(res.data.title || urlToLoad);
      } else {
        throw new Error(res.error || 'Không thể tải toàn bộ nội dung từ trang web này.');
      }
    } catch (err: any) {
      console.warn('Load page error:', err);
      setFetchError(err.message || 'Lỗi kết nối trang web.');
      // Create minimal fallback
      let fallbackDomain = 'web';
      try { fallbackDomain = new URL(urlToLoad).hostname; } catch {}
      setPageData({
        title: urlToLoad,
        url: urlToLoad,
        domain: fallbackDomain,
        description: '',
        wordCount: 0,
        contentMarkdown: `Không thể đọc trực tiếp nội dung từ ${urlToLoad}.\nBạn có thể thử bấm vào tab "Trang Web Trực Tiếp" hoặc "Mở bằng Tab Ngoài" để xem trang này.`,
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a new URL
  const navigateTo = (newUrl: string) => {
    haptics.impact('light');
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newUrl);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setAddressBarInput(newUrl);
    loadPage(newUrl);
  };

  // Back button
  const handleBack = () => {
    if (historyIndex > 0) {
      haptics.impact('light');
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevUrl = history[prevIndex];
      setAddressBarInput(prevUrl);
      loadPage(prevUrl);
    }
  };

  // Forward button
  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      haptics.impact('light');
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextUrl = history[nextIndex];
      setAddressBarInput(nextUrl);
      loadPage(nextUrl);
    }
  };

  // Refresh
  const handleReload = () => {
    haptics.impact('light');
    loadPage(currentUrl);
  };

  // Address bar submit
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressBarInput.trim()) return;
    navigateTo(addressBarInput.trim());
  };

  // Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    haptics.impact('light');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Open in real external tab
  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  // Generate Quick AI Summary
  const handleSummarizeWithAI = async () => {
    if (!pageData?.contentMarkdown || isSummarizing) return;
    haptics.impact('medium');
    setIsSummarizing(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/mcp/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Hãy tóm tắt cô đọng 4 ý cốt lõi quan trọng nhất của bài viết này: "${pageData.title}" (${pageData.url}). Trình bày ngắn gọn, súc tích bằng tiếng Việt.`,
          userContext: {}
        })
      });
      const data = await res.json();
      if (data.success && data.aiSummary) {
        setAiSummary(data.aiSummary);
      } else {
        throw new Error('Không thể tóm tắt');
      }
    } catch {
      // Local fallback summary
      setAiSummary(`📌 **Tóm tắt nhanh qua MCP AI:**\n- **Tiêu đề:** ${pageData.title}\n- **Nguồn:** ${pageData.domain}\n- **Quy mô:** ~${pageData.wordCount.toLocaleString()} từ\n- **Nội dung chính:** ${pageData.contentMarkdown.slice(0, 350)}...`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Calculate search matches in page text
  useEffect(() => {
    if (!searchQuery.trim() || !pageData?.contentMarkdown) {
      setMatchCount(0);
      return;
    }
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = pageData.contentMarkdown.match(regex);
    setMatchCount(matches ? matches.length : 0);
  }, [searchQuery, pageData]);

  if (!isOpen) return null;

  // Extract domain for display and favicon
  let currentDomain = 'google.com';
  try {
    currentDomain = new URL(currentUrl).hostname;
  } catch {}

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`;

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-relaxed font-normal',
    '2xl': 'text-2xl sm:text-3xl leading-relaxed font-normal',
    '3xl': 'text-3xl sm:text-4xl leading-relaxed font-normal'
  };

  return (
    <div 
      id="chrome-browser-modal"
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-1 sm:p-3 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`bg-[#202124] text-[#e8eaed] rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col border border-[#3c4043] overflow-hidden transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'w-[98vw] max-w-[1600px] h-[95vh] max-h-[1150px]'
        }`}
      >
        {/* ========================================================================= */}
        {/* CHROME TOP TAB BAR                                                        */}
        {/* ========================================================================= */}
        <div className="flex-none bg-[#171717] px-3 pt-2 flex items-center justify-between border-b border-[#282a2d] select-none">
          {/* Chrome Tab Items */}
          <div className="flex items-center gap-1 min-w-0 max-w-[80%]">
            {/* Active Tab */}
            <div className="flex items-center gap-2 bg-[#202124] text-white px-3.5 py-2 rounded-t-xl text-xs font-semibold max-w-[280px] shadow-sm border-t border-x border-[#3c4043]/80 group relative">
              <img 
                src={faviconUrl} 
                alt="favicon" 
                className="w-4 h-4 rounded shrink-0 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%239aa0a6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
                }}
              />
              <span className="truncate font-medium text-[12px]">{displayTitle || currentDomain}</span>
              <button
                type="button"
                onClick={onClose}
                className="p-0.5 rounded-full hover:bg-[#3c4043] text-zinc-400 hover:text-white transition-colors ml-1"
                title="Đóng thẻ"
              >
                <X size={12} />
              </button>
            </div>

            {/* New Tab Button */}
            <button
              type="button"
              onClick={() => navigateTo('https://news.google.com')}
              className="p-1.5 rounded-full hover:bg-[#2e3134] text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Thẻ mới"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Google Chrome • MCP Engine</span>
            </span>

            {onOpenHaevyInternetMode && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  onClose();
                  onOpenHaevyInternetMode();
                }}
                className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Mở toàn màn hình trong chế độ Haevy Internet riêng biệt"
              >
                <Globe size={13} className="text-sky-400" />
                <span className="hidden md:inline">Mở Chế Độ Haevy Internet</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-[#3c4043] text-zinc-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-rose-900/50 hover:text-rose-200 text-zinc-400 transition-colors"
              title="Đóng trình duyệt"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHROME TOOLBAR & OMNIBOX (ADDRESS BAR)                                    */}
        {/* ========================================================================= */}
        <div className="flex-none bg-[#202124] px-3 py-2 flex items-center gap-2 border-b border-[#303134]">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-2 rounded-full hover:bg-[#303134] text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Quay lại (Alt+Left)"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Forward Button */}
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-full hover:bg-[#303134] text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Tiến lên (Alt+Right)"
          >
            <ArrowRight size={16} />
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleReload}
            className={`p-2 rounded-full hover:bg-[#303134] text-zinc-300 transition-colors cursor-pointer ${
              isLoading ? 'text-amber-400 animate-spin' : ''
            }`}
            title="Tải lại trang (Ctrl+R)"
          >
            <RotateCw size={15} />
          </button>

          {/* Home Button */}
          <button
            type="button"
            onClick={() => navigateTo('https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh')}
            className="p-2 rounded-full hover:bg-[#303134] text-zinc-300 transition-colors cursor-pointer hidden sm:inline-flex"
            title="Trang chủ"
          >
            <Home size={16} />
          </button>

          {/* Chrome Omnibox (Address Bar) */}
          <form 
            onSubmit={handleAddressSubmit}
            className="flex-1 flex items-center bg-[#282a2d] hover:bg-[#303134] focus-within:bg-[#202124] focus-within:ring-2 focus-within:ring-[#8ab4f8] focus-within:border-transparent border border-[#3c4043] rounded-full px-3 py-1.5 transition-all min-w-0"
          >
            {/* Security SSL Lock Icon */}
            <div className="flex items-center gap-1.5 text-emerald-400 pr-2 select-none shrink-0" title="Bảo mật kết nối SSL/TLS">
              <Lock size={13} className="text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">https</span>
            </div>

            {/* Input */}
            <input
              type="text"
              value={addressBarInput}
              onChange={(e) => setAddressBarInput(e.target.value)}
              placeholder="Nhập URL trang web hoặc tìm kiếm với Google..."
              className="w-full bg-transparent border-none text-white text-xs placeholder:text-zinc-500 focus:outline-none font-mono selection:bg-[#8ab4f8] selection:text-[#202124]"
            />

            {/* Address Bar Actions */}
            <div className="flex items-center gap-1 pl-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Sao chép liên kết"
              >
                {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>

              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-1 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Mở tab mới trên trình duyệt thật"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          </form>

          {/* View Mode Toggle: Reader Mode vs Live Proxy vs Social App vs Iframe */}
          <div className="flex items-center bg-[#282a2d] p-0.5 rounded-xl border border-[#3c4043] shrink-0">
            <button
              type="button"
              onClick={() => {
                haptics.impact('light');
                setViewMode('reader');
              }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-[#8ab4f8] text-[#202124] shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Chế độ Đọc Chi Tiết: Trích xuất toàn bộ văn bản, đề mục, hình ảnh, lọc sạch quảng cáo"
            >
              <BookOpen size={12} />
              <span className="hidden sm:inline">Chế Độ Đọc</span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.impact('light');
                setViewMode('proxy');
              }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'proxy'
                  ? 'bg-[#8ab4f8] text-[#202124] shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Web Proxy Trực Tiếp: Tải trang web qua Proxy, vượt rào cản X-Frame-Options/CSP"
            >
              <Globe size={12} />
              <span className="hidden sm:inline">Web Proxy</span>
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.impact('light');
                setViewMode('social');
              }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer relative ${
                viewMode === 'social'
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-sm font-extrabold'
                  : (isTikTok || isFacebook) ? 'text-pink-300 hover:text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Mạng Xã Hội Tương Tác: Xem và dùng Facebook, TikTok đầy đủ âm thanh và giao diện"
            >
              <Layers size={12} />
              <span className="hidden sm:inline">Mạng Xã Hội</span>
              {(isTikTok || isFacebook) && viewMode !== 'social' && (
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                haptics.impact('light');
                setViewMode('iframe');
              }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'iframe'
                  ? 'bg-[#8ab4f8] text-[#202124] shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Iframe Gốc: Tải trực tiếp trong khung Iframe"
            >
              <Eye size={12} />
              <span className="hidden md:inline">Iframe</span>
            </button>
          </div>

          {/* Tool Options (Zoom, Find, AI Summary, Ask AI) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls for Larger Display */}
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl bg-[#282a2d] border border-[#3c4043] text-xs text-zinc-300">
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setZoomLevel(prev => Math.max(70, prev - 15));
                }}
                className="p-1 hover:text-white hover:bg-zinc-700/60 rounded cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setZoomLevel(100);
                }}
                className="px-1.5 text-[11px] font-mono hover:text-[#8ab4f8] font-bold cursor-pointer"
                title="Đặt lại cỡ 100%"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setZoomLevel(prev => Math.min(220, prev + 15));
                }}
                className="p-1 hover:text-white hover:bg-zinc-700/60 rounded cursor-pointer"
                title="Phóng to màn hình (+)"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFindInPage(!showFindInPage)}
              className={`p-1.5 rounded-lg hover:bg-[#303134] text-zinc-300 transition-colors cursor-pointer ${
                showFindInPage ? 'bg-[#303134] text-[#8ab4f8]' : ''
              }`}
              title="Tìm kiếm trong trang (Ctrl+F)"
            >
              <Search size={15} />
            </button>

            <button
              type="button"
              onClick={handleSummarizeWithAI}
              disabled={isSummarizing || !pageData}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Trợ lý AI tóm tắt nhanh nội dung trang web này"
            >
              {isSummarizing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-purple-400" />}
              <span className="hidden md:inline">AI Tóm Tắt</span>
            </button>

            {onAskAIAboutPage && pageData && (
              <button
                type="button"
                onClick={() => {
                  haptics.impact('medium');
                  onAskAIAboutPage(
                    pageData.title || displayTitle,
                    currentUrl,
                    pageData.contentMarkdown ? pageData.contentMarkdown.slice(0, 3000) : ''
                  );
                  onClose();
                }}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Chuyển trang này vào Trợ Lý Haevy AI để trao đổi & nghiên cứu sâu"
              >
                <span>Hỏi AI Về Trang Này</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chrome Bookmarks Bar */}
        <div className="flex-none bg-[#202124] px-3 py-1.5 border-b border-[#303134] flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none text-[11px]">
          <div className="flex items-center gap-1 text-zinc-400 pl-1 pr-2 border-r border-zinc-700/60 shrink-0">
            <Bookmark size={12} className="text-[#8ab4f8]" />
            <span className="font-semibold text-zinc-300">Dấu Trang:</span>
          </div>

          {CHROME_BOOKMARKS.map((bm) => {
            const isActive = currentUrl.includes(bm.domain);
            return (
              <button
                key={bm.name}
                type="button"
                onClick={() => {
                  navigateTo(bm.url);
                  if (bm.domain.includes('tiktok') || bm.domain.includes('facebook')) {
                    setViewMode('social');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#303134] text-white font-bold ring-1 ring-[#8ab4f8]/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2c2d30]'
                }`}
                title={`Mở trang ${bm.name} (${bm.url})`}
              >
                <span className="text-xs">{bm.icon}</span>
                <span className={bm.color}>{bm.name}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Progress Bar (Top of Web View) */}
        {isLoading && (
          <div className="w-full h-1 bg-zinc-800 overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-[#8ab4f8] via-purple-400 to-emerald-400 animate-pulse w-2/3" />
          </div>
        )}

        {/* Find In Page Floating Toolbar */}
        {showFindInPage && (
          <div className="flex-none bg-[#292a2d] border-b border-[#3c4043] px-4 py-2 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={14} className="text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ khóa trong trang này..."
                className="w-full bg-[#1e1f22] border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#8ab4f8]"
              />
              <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                {matchCount > 0 ? `${matchCount} kết quả` : searchQuery ? '0 kết quả' : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowFindInPage(false);
                setSearchQuery('');
              }}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN WEB CONTENT AREA ("Xem được trang web ghi những gì")                  */}
        {/* ========================================================================= */}
        <div 
          ref={contentScrollRef}
          style={{ zoom: `${zoomLevel}%` }}
          className="flex-1 overflow-y-auto bg-[#18191c] p-4 sm:p-7 space-y-5 custom-scrollbar select-text transition-all"
        >
          {/* AI Quick Summary Banner */}
          {aiSummary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-zinc-900 to-indigo-950/70 border border-purple-500/50 shadow-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400 animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Bản Tóm Tắt Nhanh Từ Trợ Lý MCP AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiSummary(null)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                {aiSummary}
              </div>
            </div>
          )}

          {/* VIEW MODE: SOCIAL INTERACTIVE (TIKTOK & FACEBOOK) */}
          {viewMode === 'social' ? (
            <div className="w-full flex flex-col space-y-4">
              {isSocial ? (
                <SocialMediaInteractiveViewer
                  platform={isSocial}
                  currentUrl={currentUrl}
                  onNavigateUrl={navigateTo}
                  onSwitchToProxy={() => setViewMode('proxy')}
                />
              ) : (
                <div className="max-w-2xl mx-auto w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
                  <div className="space-y-2">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center text-2xl mx-auto shadow-lg">
                      📱
                    </span>
                    <h3 className="text-lg font-black text-white">Trung Tâm Mạng Xã Hội Tương Tác</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Chọn nền tảng mạng xã hội bạn muốn xem và tương tác trực tiếp với đầy đủ âm thanh, video shorts và bài viết.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigateTo('https://www.tiktok.com');
                        setViewMode('social');
                      }}
                      className="p-5 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-pink-500/30 hover:border-pink-500 text-left transition-all hover:scale-[1.02] shadow-xl group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
                          🎵
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                          Shorts &amp; Audio
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-pink-300 transition-colors">
                        TikTok Studio Shorts
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        Xem video shorts dọc, nghe âm thanh xu hướng, thả tim, bình luận và khám phá hashtag.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigateTo('https://www.facebook.com');
                        setViewMode('social');
                      }}
                      className="p-5 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-blue-500/30 hover:border-blue-500 text-left transition-all hover:scale-[1.02] shadow-xl group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                          🔵
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          Feed &amp; Watch
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-blue-300 transition-colors">
                        Facebook Feed Portal
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        Lướt bảng tin công khai, xem bài đăng cộng đồng, hình ảnh, video Watch và bình luận.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'proxy' ? (
            /* VIEW MODE: LIVE WEB PROXY (Bypasses CSP & X-Frame-Options) */
            <div className="w-full h-full min-h-[580px] flex flex-col space-y-2">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-cyan-500/40 flex items-center justify-between text-xs text-zinc-300 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
                  <span>
                    Đang hiển thị qua <strong>Haevy Web Proxy</strong> (Đã gỡ bỏ giới hạn CSP &amp; X-Frame-Options để duyệt web bình thường).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReload}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Tải lại trang"
                  >
                    <RotateCw size={12} />
                  </button>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mở Tab Gốc</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <iframe
                key={`proxy-${currentUrl}`}
                src={`/api/web-proxy?url=${encodeURIComponent(currentUrl)}`}
                title={displayTitle}
                className="w-full flex-1 rounded-xl border border-zinc-800 bg-white min-h-[580px]"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              />
            </div>
          ) : viewMode === 'iframe' ? (
            /* VIEW MODE: NATIVE IFRAME */
            <div className="w-full h-full min-h-[550px] flex flex-col space-y-2">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 gap-2">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-cyan-400" />
                  <span>
                    Đang hiển thị trực tiếp từ <strong>{currentDomain}</strong>. Nếu trang bị trắng do bảo mật CSP, hãy chuyển sang tab <strong>Web Proxy</strong> hoặc <strong>Chế Độ Đọc</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('proxy')}
                  className="px-2.5 py-1 rounded-lg bg-[#8ab4f8] text-[#202124] text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  Đổi Sang Web Proxy
                </button>
              </div>

              <iframe
                key={`raw-${currentUrl}`}
                src={currentUrl}
                title={displayTitle}
                className="w-full flex-1 rounded-xl border border-zinc-800 bg-white min-h-[550px]"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            /* VIEW MODE: FULL MCP READER (Xem trọn vẹn những gì trang web ghi) */
            <div className={isWideView ? "w-full max-w-6xl mx-auto space-y-6 transition-all" : "max-w-4xl mx-auto space-y-6 transition-all"}>
              {/* Web Page Meta Header */}
              <div className="pb-5 border-b border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 font-mono">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-cyan-300 font-bold border border-zinc-700">
                    {currentDomain}
                  </span>
                  {pageData?.wordCount ? (
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                      📄 Quy mô: ~{pageData.wordCount.toLocaleString()} từ
                    </span>
                  ) : null}
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                    ⏱️ ~{Math.max(1, Math.round((pageData?.wordCount || 800) / 200))} phút đọc
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
                    ✓ Đã trích xuất trọn vẹn qua MCP
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  {pageData?.title || displayTitle}
                </h1>

                {pageData?.description && (
                  <p className="text-sm text-zinc-300 italic border-l-2 border-[#8ab4f8] pl-3 py-0.5 bg-zinc-900/50 rounded-r-lg">
                    {pageData.description}
                  </p>
                )}

                {/* Font Size Adjusters & Tools Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-wrap">
                    <span>Cỡ chữ đọc:</span>
                    {(['sm', 'base', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                          fontSize === size 
                            ? 'bg-[#8ab4f8] text-black shadow-sm font-black' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsWideView(!isWideView)}
                      className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        isWideView
                          ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                      title={isWideView ? "Thu gọn về cột đọc tiêu chuẩn" : "Mở rộng toàn màn hình đọc thoáng"}
                    >
                      {isWideView ? "Khung Rộng Tối Đa" : "Khung Tiêu Chuẩn"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenExternal}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Mở bài gốc tại nguồn</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Main Extracted Article Content */}
              {isLoading && !pageData ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 size={32} className="text-[#8ab4f8] animate-spin mx-auto" />
                  <p className="text-sm text-zinc-400">Đang đọc toàn bộ nội dung từ trang web qua giao thức MCP...</p>
                </div>
              ) : pageData?.contentMarkdown ? (
                <article className={`space-y-4 text-zinc-200 ${fontSizeClasses[fontSize]}`}>
                  {pageData.contentMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Heading 1
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h2 key={pIdx} className="text-xl sm:text-2xl font-black text-white mt-6 mb-2 border-b border-zinc-800 pb-2">
                          {trimmed.replace('# ', '')}
                        </h2>
                      );
                    }
                    // Heading 2
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h3 key={pIdx} className="text-lg sm:text-xl font-extrabold text-cyan-200 mt-5 mb-1.5">
                          {trimmed.replace('## ', '')}
                        </h3>
                      );
                    }
                    // Heading 3
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-base sm:text-lg font-bold text-amber-300 mt-4 mb-1">
                          {trimmed.replace('### ', '')}
                        </h4>
                      );
                    }
                    // Bullet list item
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      const items = trimmed.split('\n');
                      return (
                        <ul key={pIdx} className="list-disc list-inside space-y-1 my-2 pl-2">
                          {items.map((it, iIdx) => (
                            <li key={iIdx} className="text-zinc-300">
                              {it.replace(/^[-*]\s+/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    // Numbered list
                    if (/^\d+\.\s+/.test(trimmed)) {
                      const items = trimmed.split('\n');
                      return (
                        <ol key={pIdx} className="list-decimal list-inside space-y-1 my-2 pl-2">
                          {items.map((it, iIdx) => (
                            <li key={iIdx} className="text-zinc-300">
                              {it.replace(/^\d+\.\s+/, '')}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    // Blockquote
                    if (trimmed.startsWith('> ')) {
                      return (
                        <blockquote key={pIdx} className="border-l-4 border-amber-400 bg-amber-500/10 p-3 rounded-r-xl my-3 text-amber-100 italic">
                          {trimmed.replace(/^>\s+/, '')}
                        </blockquote>
                      );
                    }

                    // Standard paragraph
                    return (
                      <p key={pIdx} className="leading-relaxed text-zinc-300">
                        {trimmed}
                      </p>
                    );
                  })}
                </article>
              ) : (
                <div className="py-12 text-center text-zinc-400 space-y-3">
                  <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                  <p className="text-sm">Không thể trích xuất văn bản từ trang web này.</p>
                  <button
                    type="button"
                    onClick={() => setViewMode('iframe')}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
                  >
                    Xem bằng Iframe trực tiếp
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CHROME FOOTER & ASK AI BAR                                                */}
        {/* ========================================================================= */}
        <div className="flex-none bg-[#202124] px-4 py-2.5 border-t border-[#303134] flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[260px] sm:max-w-md font-mono text-[11px]">
              {currentUrl}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onAskAIAboutPage && pageData && (
              <button
                type="button"
                onClick={() => {
                  onAskAIAboutPage(
                    pageData.title || displayTitle,
                    currentUrl,
                    pageData.contentMarkdown || ''
                  );
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Thảo Luận Với Haevy AI Về Trang Này</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Đóng Trình Duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
