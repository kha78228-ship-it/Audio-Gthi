import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Bookmark,
  Star,
  Sparkles,
  Share2,
  FileText,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronDown,
  List,
  Filter,
  Zap,
  Layers,
  Maximize2,
  Minimize2,
  BookOpen,
  Volume2,
  VolumeX,
  History,
  Compass,
  TrendingUp,
  Newspaper,
  BrainCircuit,
  Trash2,
  Clock,
  CheckCircle2,
  Download,
  Columns,
  Mic,
  MicOff,
  UserCheck,
  KeyRound,
  LogIn,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import {
  fetchMCPPageContent,
  fetchMCPWebSearch,
  MCPFetchPageResult,
  MCPWebSearchResultItem
} from '../services/mcpContextService';
import { SocialMediaInteractiveViewer } from './haevyAI/SocialMediaInteractiveViewer';
import { haptics } from '../utils/haptics';
import { useAuth } from '../context/AuthContext';
import { InternetSubTab } from '../types';
import Markdown from 'react-markdown';

export interface WebBrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading?: boolean;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: 'news' | 'knowledge' | 'tech' | 'social' | 'custom';
  icon: string;
  badge?: string;
}

export interface OfflineSavedPage {
  id: string;
  url: string;
  title: string;
  domain: string;
  contentMarkdown: string;
  wordCount: number;
  savedAt: string;
  accountId: string;
}

export interface UserSearchLogItem {
  id: string;
  query: string;
  engine: string;
  domainFilter?: string;
  resultsCount: number;
  timestamp: string;
  accountId: string;
}

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm_vnexpress', title: 'VnExpress - Báo Tiếng Việt Nhiều Người Đọc Nhất', url: 'https://vnexpress.net', domain: 'vnexpress.net', category: 'news', icon: '📰', badge: 'Tin nóng' },
  { id: 'bm_dantri', title: 'Dân Trí - Báo Điện Tử Tin Cậy 24/7', url: 'https://dantri.com.vn', domain: 'dantri.com.vn', category: 'news', icon: '⚡', badge: '24/7' },
  { id: 'bm_tuoitre', title: 'Tuổi Trẻ Online - Tin Tức Nóng Xã Hội', url: 'https://tuoitre.vn', domain: 'tuoitre.vn', category: 'news', icon: '🗞️' },
  { id: 'bm_cafef', title: 'CafeF - Kênh Thông Tin Kinh Tế & Tài Chính', url: 'https://cafef.vn', domain: 'cafef.vn', category: 'news', icon: '📈', badge: 'Tài chính' },
  { id: 'bm_wiki', title: 'Wikipedia Bách Khoa Toàn Thư Mở', url: 'https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh', domain: 'vi.wikipedia.org', category: 'knowledge', icon: '📖', badge: 'Bách khoa' },
  { id: 'bm_first_principles', title: 'Tư Duy Nguyên Lý Đầu Tiên (First Principles)', url: 'https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_%C4%91%E1%BA%A7u_ti%C3%AAn', domain: 'vi.wikipedia.org', category: 'knowledge', icon: '🧠', badge: 'Cốt lõi' },
  { id: 'bm_einstein', title: 'Thuyết Tương Đối & Albert Einstein', url: 'https://vi.wikipedia.org/wiki/Albert_Einstein', domain: 'vi.wikipedia.org', category: 'knowledge', icon: '🔬' },
  { id: 'bm_tinhte', title: 'Tinh Tế - Cộng Đồng Khoa Học & Công Nghệ', url: 'https://tinhte.vn', domain: 'tinhte.vn', category: 'tech', icon: '💻', badge: 'Công nghệ' },
  { id: 'bm_genk', title: 'GenK - Trang Tin Công Nghệ & AI Số', url: 'https://genk.vn', domain: 'genk.vn', category: 'tech', icon: '🚀' },
  { id: 'bm_github', title: 'GitHub - Kho Mã Nguồn Mở Thế Giới', url: 'https://github.com', domain: 'github.com', category: 'tech', icon: '🐙' },
  { id: 'bm_youtube', title: 'YouTube - Video Âm Nhạc & Học Thuật', url: 'https://www.youtube.com', domain: 'youtube.com', category: 'social', icon: '🔴' },
  { id: 'bm_tiktok', title: 'TikTok - Xu Hướng Video Ngắn Sáng Tạo', url: 'https://www.tiktok.com', domain: 'tiktok.com', category: 'social', icon: '🎵' }
];

export const POPULAR_DOMAINS: { label: string; url: string; domain: string; icon: string; category: string }[] = [
  { label: 'VnExpress', url: 'https://vnexpress.net', domain: 'vnexpress.net', icon: '📰', category: 'Báo chí' },
  { label: 'Dân Trí', url: 'https://dantri.com.vn', domain: 'dantri.com.vn', icon: '⚡', category: 'Báo chí' },
  { label: 'Tuổi Trẻ Online', url: 'https://tuoitre.vn', domain: 'tuoitre.vn', icon: '🗞️', category: 'Báo chí' },
  { label: 'CafeF Kinh Tế', url: 'https://cafef.vn', domain: 'cafef.vn', icon: '📈', category: 'Kinh tế' },
  { label: 'Wikipedia Tiếng Việt', url: 'https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh', domain: 'vi.wikipedia.org', icon: '📖', category: 'Bách khoa' },
  { label: 'Tinh Tế', url: 'https://tinhte.vn', domain: 'tinhte.vn', icon: '📱', category: 'Công nghệ' },
  { label: 'GenK AI', url: 'https://genk.vn', domain: 'genk.vn', icon: '💻', category: 'Công nghệ' },
  { label: 'BBC Tiếng Việt', url: 'https://www.bbc.com/vietnamese', domain: 'bbc.com', icon: '🌍', category: 'Quốc tế' },
  { label: 'YouTube', url: 'https://www.youtube.com', domain: 'youtube.com', icon: '🔴', category: 'Video' },
  { label: 'GitHub', url: 'https://github.com', domain: 'github.com', icon: '🐙', category: 'Lập trình' }
];

export const SEARCH_ENGINES: { id: 'haevy_ai' | 'google' | 'wikipedia' | 'bing' | 'duckduckgo'; name: string; icon: string; desc: string }[] = [
  { id: 'haevy_ai', name: 'Haevy Deep Search', icon: '🚀', desc: 'Tìm kiếm đa nguồn theo ID & bóc tách First Principles' },
  { id: 'google', name: 'Google Web', icon: '🔍', desc: 'Truy vấn chỉ mục web toàn cầu tốc độ cao' },
  { id: 'wikipedia', name: 'Wikipedia Tri Thức', icon: '📖', desc: 'Tra cứu bách khoa toàn thư & học thuật' },
  { id: 'bing', name: 'Bing Intelligence', icon: '⚡', desc: 'Tìm kiếm tin tức & dữ liệu trực tuyến' },
  { id: 'duckduckgo', name: 'DuckDuckGo Shield', icon: '🦆', desc: 'Tìm kiếm bảo mật không theo dõi quảng cáo' }
];

export interface AutocompleteSuggestion {
  id: string;
  type: 'website' | 'bookmark' | 'history' | 'engine';
  title: string;
  subtitle?: string;
  url?: string;
  query?: string;
  engine?: string;
  icon: string;
  badge?: string;
}

const CURATED_TRENDING_TOPICS = [
  { query: 'Trí tuệ nhân tạo tạo sinh & Bán dẫn 2026', category: 'Công nghệ', icon: '🤖' },
  { query: 'Nguyên lý Đầu tiên First Principles của Elon Musk & Aristotle', category: 'Tư duy gốc', icon: '🧠' },
  { query: 'Tin tức kinh tế vĩ mô Việt Nam & Lãi suất ngân hàng mới nhất', category: 'Kinh tế', icon: '📈' },
  { query: 'Vật lý lượng tử, Điện toán lượng tử & Ứng dụng y sinh', category: 'Khoa học', icon: '⚛️' },
  { query: 'Phương pháp quản lý tài chính 6 Hũ & Tự do tài chính FIRE', category: 'Tài chính', icon: '💎' },
  { query: 'Cấu trúc đề thi tốt nghiệp THPT chương trình mới GDPT 2018', category: 'Giáo dục', icon: '🎓' }
];

interface HaevyInternetViewProps {
  initialSubTab?: InternetSubTab;
  onSubTabChange?: (tab: InternetSubTab) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onBackToPortal?: () => void;
  onOpenAuth?: () => void;
  onAskAIAboutPage?: (pageTitle: string, pageUrl: string, pageContent: string) => void;
  className?: string;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 30
};

export function HaevyInternetView({
  initialSubTab = 'search',
  onSubTabChange,
  onNavigateToMode,
  onBackToPortal,
  onOpenAuth,
  onAskAIAboutPage,
  className = ''
}: HaevyInternetViewProps) {
  const {
    user,
    authStatus,
    isAuthenticated,
    isAnonymousAccount,
    anonymousVipSession,
    clearAnonymousVipSession,
    accountId,
    displayName,
    photoURL,
    isVip,
    vipTier
  } = useAuth();

  // ============================================================================
  // 1. STRICT ZERO-ANONYMOUS & REAL USER ID VERIFICATION GATE
  // ============================================================================
  const userUid = user?.uid || '';
  const isBlockedAnonymousOrUnauthenticated = useMemo(() => {
    if (!isAuthenticated || !user || !userUid) return true;
    if (isAnonymousAccount || authStatus === 'anonymous' || Boolean(anonymousVipSession)) return true;
    if ((user as any)?.isAnonymous) return true;
    if (userUid.startsWith('anon_') || userUid.startsWith('guest_')) return true;
    if (String(accountId || '').toUpperCase().startsWith('GUEST') || String(accountId || '').toUpperCase().startsWith('ANON')) return true;
    return false;
  }, [isAuthenticated, user, userUid, isAnonymousAccount, authStatus, anonymousVipSession, accountId]);

  // Storage key helper strictly scoped to the verified User UID
  const getStorageKey = useCallback(
    (suffix: string) => `haevy_internet_v4_${userUid || 'unverified'}_${suffix}`,
    [userUid]
  );

  // ============================================================================
  // 2. CORE NAVIGATION & WORKSPACE STATE
  // ============================================================================
  const [activeTab, setActiveTab] = useState<InternetSubTab>(initialSubTab || 'search');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSelectTab = (tab: InternetSubTab) => {
    haptics.light();
    setActiveTab(tab);
    onSubTabChange?.(tab);
  };

  // ============================================================================
  // 3. USER-ID-SCOPED SEARCH STATE & ENGINE
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'haevy_ai' | 'google' | 'wikipedia' | 'bing' | 'duckduckgo'>('haevy_ai');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [searchFocusCategory, setSearchFocusCategory] = useState<'all' | 'principles' | 'news' | 'science' | 'finance'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLatencyMs, setSearchLatencyMs] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<MCPWebSearchResultItem[]>([]);
  const [lastExecutedQuery, setLastExecutedQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Quick Peek Drawer State (Inspect any search result instantly without leaving Search view)
  const [peekResult, setPeekResult] = useState<MCPWebSearchResultItem | null>(null);
  const [peekPageContent, setPeekPageContent] = useState<MCPFetchPageResult | null>(null);
  const [isPeekLoading, setIsPeekLoading] = useState(false);

  // User-ID-Scoped Search History
  const [userSearchHistory, setUserSearchHistory] = useState<UserSearchLogItem[]>([]);
  // User-ID-Scoped Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(DEFAULT_BOOKMARKS);
  // User-ID-Scoped Offline Pages Vault
  const [offlinePages, setOfflinePages] = useState<OfflineSavedPage[]>([]);
  // User-ID-Scoped Per-URL Research Notes
  const [userNotesMap, setUserNotesMap] = useState<Record<string, string>>({});

  // Load User-ID-scoped persistent data whenever `userUid` changes
  useEffect(() => {
    if (isBlockedAnonymousOrUnauthenticated || !userUid) return;
    try {
      const savedHistory = localStorage.getItem(getStorageKey('search_history'));
      if (savedHistory) setUserSearchHistory(JSON.parse(savedHistory));
      else setUserSearchHistory([]);

      const savedBookmarks = localStorage.getItem(getStorageKey('bookmarks'));
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      else setBookmarks(DEFAULT_BOOKMARKS);

      const savedOffline = localStorage.getItem(getStorageKey('offline_vault'));
      if (savedOffline) setOfflinePages(JSON.parse(savedOffline));
      else setOfflinePages([]);

      const savedNotes = localStorage.getItem(getStorageKey('page_notes'));
      if (savedNotes) setUserNotesMap(JSON.parse(savedNotes));
      else setUserNotesMap({});
    } catch (e) {
      console.warn('Failed to load User-ID Internet storage:', e);
    }
  }, [userUid, isBlockedAnonymousOrUnauthenticated, getStorageKey]);

  // Save helpers bound to User UID
  const saveUserHistory = useCallback(
    (next: UserSearchLogItem[]) => {
      setUserSearchHistory(next);
      if (userUid && !isBlockedAnonymousOrUnauthenticated) {
        try {
          localStorage.setItem(getStorageKey('search_history'), JSON.stringify(next.slice(0, 60)));
        } catch {}
      }
    },
    [userUid, isBlockedAnonymousOrUnauthenticated, getStorageKey]
  );

  const saveUserBookmarks = useCallback(
    (next: BookmarkItem[]) => {
      setBookmarks(next);
      if (userUid && !isBlockedAnonymousOrUnauthenticated) {
        try {
          localStorage.setItem(getStorageKey('bookmarks'), JSON.stringify(next));
        } catch {}
      }
    },
    [userUid, isBlockedAnonymousOrUnauthenticated, getStorageKey]
  );

  const saveUserOfflinePages = useCallback(
    (next: OfflineSavedPage[]) => {
      setOfflinePages(next);
      if (userUid && !isBlockedAnonymousOrUnauthenticated) {
        try {
          localStorage.setItem(getStorageKey('offline_vault'), JSON.stringify(next.slice(0, 40)));
        } catch {}
      }
    },
    [userUid, isBlockedAnonymousOrUnauthenticated, getStorageKey]
  );

  const updateUserNoteForUrl = useCallback(
    (url: string, text: string) => {
      setUserNotesMap((prev) => {
        const next = { ...prev, [url]: text };
        if (userUid && !isBlockedAnonymousOrUnauthenticated) {
          try {
            localStorage.setItem(getStorageKey('page_notes'), JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    [userUid, isBlockedAnonymousOrUnauthenticated, getStorageKey]
  );

  // ============================================================================
  // 4. MULTI-TAB BROWSER & READER STATE
  // ============================================================================
  const [tabs, setTabs] = useState<WebBrowserTab[]>([
    {
      id: 'tab_main',
      url: 'https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_%C4%91%E1%BA%A7u_ti%C3%AAn',
      title: 'Nguyên lý đầu tiên - Wikipedia',
      favicon: '🧠'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_main');
  const [historyMap, setHistoryMap] = useState<Record<string, string[]>>({
    tab_main: ['https://vi.wikipedia.org/wiki/Nguy%C3%AAn_l%C3%BD_%C4%91%E1%BA%A7u_ti%C3%AAn']
  });
  const [historyIndexMap, setHistoryIndexMap] = useState<Record<string, number>>({
    tab_main: 0
  });

  const currentTab = useMemo(() => tabs.find((t) => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const currentHistory = historyMap[activeTabId] || [currentTab.url];
  const currentHistoryIndex = historyIndexMap[activeTabId] ?? 0;
  const currentUrl = currentHistory[currentHistoryIndex] || currentTab.url;

  const [addressInput, setAddressInput] = useState<string>(currentUrl);
  const [pageData, setPageData] = useState<MCPFetchPageResult | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [pageFetchError, setPageFetchError] = useState<string | null>(null);
  const [browserViewMode, setBrowserViewMode] = useState<'reader' | 'iframe' | 'social'>('reader');

  // Fullscreen & Split-Screen Workspace State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [splitPaneTab, setSplitPaneTab] = useState<'notes' | 'principles'>('notes');

  // Typography & Reader Controls
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');
  const [inPageFindQuery, setInPageFindQuery] = useState('');
  const [showInPageFind, setShowInPageFind] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Vault & News Sub-filters
  const [vaultSection, setVaultSection] = useState<'bookmarks' | 'offline' | 'history'>('bookmarks');
  const [vaultFilterText, setVaultFilterText] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');
  const [newsCategory, setNewsCategory] = useState<'all' | 'vietnam' | 'tech' | 'finance' | 'science'>('all');
  const [liveNewsItems, setLiveNewsItems] = useState<MCPWebSearchResultItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 3200);
  };

  // ============================================================================
  // 5. LIVE WEB SEARCH EXECUTION (BOUND TO USER ID)
  // ============================================================================
  const executeUserWebSearch = useCallback(
    async (rawQuery: string, customDomain?: string, switchToSearchTab = true) => {
      if (isBlockedAnonymousOrUnauthenticated) return;
      const trimmed = rawQuery.trim();
      if (!trimmed) return;

      haptics.medium();
      if (switchToSearchTab && activeTab !== 'search') {
        setActiveTab('search');
        onSubTabChange?.('search');
      }

      setIsSearching(true);
      setIsSearchFocused(false);
      setLastExecutedQuery(trimmed);

      // Enhance query based on selected focus mode
      let effectiveQuery = trimmed;
      if (searchFocusCategory === 'principles') {
        effectiveQuery = `${trimmed} bản chất nguyên lý cốt lõi khoa học logic`;
      } else if (searchFocusCategory === 'news') {
        effectiveQuery = `${trimmed} tin tức mới nhất hôm nay`;
      } else if (searchFocusCategory === 'science') {
        effectiveQuery = `${trimmed} nghiên cứu khoa học công nghệ học thuật`;
      } else if (searchFocusCategory === 'finance') {
        effectiveQuery = `${trimmed} phân tích kinh tế tài chính thị trường`;
      }

      const activeDomain = customDomain !== undefined ? customDomain : domainFilter || undefined;

      const res = await fetchMCPWebSearch(effectiveQuery, 9, activeDomain, {
        uid: userUid,
        accountId: accountId || userUid.slice(0, 10),
        displayName: displayName || 'Thành viên Haevy',
        searchMode: searchEngine
      });

      setSearchLatencyMs(res.latencyMs ?? 120);

      let finalResults = res.results || [];
      if (finalResults.length === 0) {
        // Guaranteed high-signal fallback results if offline or external search engine rate-limits
        const encoded = encodeURIComponent(trimmed);
        finalResults = [
          {
            title: `${trimmed} — Tổng hợp Phân tích Chuyên sâu & Nguyên lý Cốt lõi`,
            snippet: `Báo cáo tổng hợp đa chiều về "${trimmed}": phân tích từ định nghĩa nền tảng, số liệu thực tiễn, bối cảnh cập nhật 2026 và các ứng dụng quan trọng nhất.`,
            url: `https://vi.wikipedia.org/w/index.php?search=${encoded}`,
            source: 'vi.wikipedia.org',
            pubDate: 'Cập nhật tức thì'
          },
          {
            title: `Tin tức & Sự kiện mới nhất về "${trimmed}" trên VnExpress`,
            snippet: `Cập nhật toàn cảnh diễn biến, góc nhìn chuyên gia và phân tích chuyên sâu liên quan đến chủ đề "${trimmed}" tại Việt Nam và thế giới.`,
            url: `https://timkiem.vnexpress.net/?q=${encoded}`,
            source: 'vnexpress.net',
            pubDate: 'Hôm nay'
          },
          {
            title: `Góc nhìn Công nghệ & Khoa học về "${trimmed}" — Tinh Tế & GenK`,
            snippet: `Khám phá các đánh giá thực nghiệm, xu hướng công nghệ mới và thảo luận chuyên môn xoay quanh "${trimmed}".`,
            url: `https://tinhte.vn/search/?q=${encoded}`,
            source: 'tinhte.vn',
            pubDate: 'Mới nhất'
          }
        ];
      }

      setSearchResults(finalResults);
      setIsSearching(false);

      // Log search to User-ID-bound history
      const logEntry: UserSearchLogItem = {
        id: `srch_${Date.now()}`,
        query: trimmed,
        engine: searchEngine,
        domainFilter: activeDomain,
        resultsCount: finalResults.length,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('vi-VN'),
        accountId: accountId || userUid.slice(0, 8)
      };
      saveUserHistory([logEntry, ...userSearchHistory.filter((h) => h.query.toLowerCase() !== trimmed.toLowerCase())]);
    },
    [
      isBlockedAnonymousOrUnauthenticated,
      activeTab,
      onSubTabChange,
      searchFocusCategory,
      domainFilter,
      userUid,
      accountId,
      displayName,
      searchEngine,
      saveUserHistory,
      userSearchHistory
    ]
  );

  // Run initial curated search when authenticated user opens Search tab for the first time
  useEffect(() => {
    if (!isBlockedAnonymousOrUnauthenticated && searchResults.length === 0 && !isSearching) {
      executeUserWebSearch('Trí tuệ nhân tạo & Tư duy Nguyên lý đầu tiên First Principles', undefined, false);
    }
  }, [isBlockedAnonymousOrUnauthenticated]);

  // ============================================================================
  // 6. LOAD PAGE IN BROWSER / READER (BOUND TO USER ID)
  // ============================================================================
  const loadWebPage = useCallback(
    async (targetUrl: string) => {
      if (isBlockedAnonymousOrUnauthenticated || !targetUrl) return;
      setIsLoadingPage(true);
      setPageFetchError(null);
      setAddressInput(targetUrl);

      // Detect social media URLs
      const lower = targetUrl.toLowerCase();
      if (
        lower.includes('youtube.com/watch') ||
        lower.includes('youtu.be/') ||
        lower.includes('tiktok.com/')
      ) {
        setBrowserViewMode('social');
      }

      const res = await fetchMCPPageContent(targetUrl, 60000, {
        uid: userUid,
        accountId: accountId || userUid.slice(0, 10)
      });

      if (res.success && res.data) {
        setPageData(res.data);
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId
              ? { ...t, url: targetUrl, title: res.data?.title || targetUrl, isLoading: false }
              : t
          )
        );
      } else {
        setPageFetchError(res.error || 'Trang web chặn nhúng trực tiếp. Đã kích hoạt chế độ tóm tắt thông minh.');
        let domainHost = 'web';
        try {
          domainHost = new URL(targetUrl).hostname.replace(/^www\./, '');
        } catch {}
        setPageData({
          title: `Nội dung trích xuất từ ${domainHost}`,
          url: targetUrl,
          domain: domainHost,
          description: `Đường dẫn: ${targetUrl}`,
          wordCount: 180,
          contentMarkdown: `### 🌐 Trang web: ${domainHost}\n\nĐường dẫn gốc: [${targetUrl}](${targetUrl})\n\nTrang web này áp dụng chính sách bảo mật khung nhúng (X-Frame-Options / CSP). Bạn có thể:\n- Sử dụng **Tìm Kiếm Mạng Đa Chiều** của Haevy Internet để quét toàn bộ bài viết từ tên miền **${domainHost}**.\n- Hoặc nhấn **Mở Cửa Sổ Trực Tiếp** để xem trên tab trình duyệt gốc.`,
          success: true
        });
      }
      setIsLoadingPage(false);
    },
    [isBlockedAnonymousOrUnauthenticated, userUid, accountId, activeTabId]
  );

  useEffect(() => {
    if (!isBlockedAnonymousOrUnauthenticated && currentUrl) {
      loadWebPage(currentUrl);
    }
  }, [currentUrl, isBlockedAnonymousOrUnauthenticated]);

  const navigateBrowserToUrl = (rawInput: string, openInNewTab = false) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    let finalUrl = trimmed;
    const isUrlLike =
      /^https?:\/\//i.test(trimmed) ||
      (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed) && !trimmed.includes(' '));

    if (!isUrlLike) {
      // Treat as a search query in our Search Engine!
      setSearchQuery(trimmed);
      executeUserWebSearch(trimmed, undefined, true);
      return;
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    let domainTitle = finalUrl;
    try {
      domainTitle = new URL(finalUrl).hostname.replace(/^www\./, '');
    } catch {}

    if (openInNewTab) {
      const newTabId = `tab_${Date.now()}`;
      const newTab: WebBrowserTab = {
        id: newTabId,
        url: finalUrl,
        title: domainTitle,
        favicon: '🌐'
      };
      setTabs((prev) => [...prev, newTab]);
      setHistoryMap((prev) => ({ ...prev, [newTabId]: [finalUrl] }));
      setHistoryIndexMap((prev) => ({ ...prev, [newTabId]: 0 }));
      setActiveTabId(newTabId);
      setActiveTab('browser');
      onSubTabChange?.('browser');
      return;
    }

    const hist = historyMap[activeTabId] || [currentTab.url];
    const idx = historyIndexMap[activeTabId] ?? 0;
    const nextHist = [...hist.slice(0, idx + 1), finalUrl];
    setHistoryMap((prev) => ({ ...prev, [activeTabId]: nextHist }));
    setHistoryIndexMap((prev) => ({ ...prev, [activeTabId]: nextHist.length - 1 }));
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: finalUrl, title: domainTitle } : t))
    );
  };

  // Open Quick Peek Drawer for a search result
  const handleQuickPeekResult = async (item: MCPWebSearchResultItem) => {
    haptics.light();
    setPeekResult(item);
    setPeekPageContent(null);
    setIsPeekLoading(true);
    const res = await fetchMCPPageContent(item.url, 35000, {
      uid: userUid,
      accountId: accountId || userUid.slice(0, 10)
    });
    if (res.success && res.data) {
      setPeekPageContent(res.data);
    } else {
      setPeekPageContent({
        title: item.title,
        url: item.url,
        domain: item.source || 'web',
        description: item.snippet,
        wordCount: item.snippet.split(/\s+/).length,
        contentMarkdown: `### ${item.title}\n\n${item.snippet}\n\n---\n*Nguồn trích dẫn trực tiếp:* [${item.url}](${item.url})`,
        success: true
      });
    }
    setIsPeekLoading(false);
  };

  // Save current page or peeked page to User-ID Offline Vault
  const handleSaveToOfflineVault = (target: MCPFetchPageResult) => {
    const newOffline: OfflineSavedPage = {
      id: `off_${Date.now()}`,
      url: target.url,
      title: target.title,
      domain: target.domain,
      contentMarkdown: target.contentMarkdown,
      wordCount: target.wordCount,
      savedAt: new Date().toLocaleString('vi-VN'),
      accountId: accountId || userUid.slice(0, 8)
    };
    const next = [newOffline, ...offlinePages.filter((p) => p.url !== target.url)];
    saveUserOfflinePages(next);
    showToast(`Đã lưu bài viết vào Kho Ngoại Tuyến của ID ${accountId || userUid.slice(0, 8)}`);
  };

  // Toggle Bookmark for current URL
  const isCurrentUrlBookmarked = useMemo(
    () => bookmarks.some((b) => b.url === currentUrl),
    [bookmarks, currentUrl]
  );

  const handleToggleCurrentBookmark = () => {
    if (isCurrentUrlBookmarked) {
      saveUserBookmarks(bookmarks.filter((b) => b.url !== currentUrl));
      showToast('Đã xóa trang khỏi Dấu trang cá nhân');
    } else {
      let domain = 'web';
      try {
        domain = new URL(currentUrl).hostname.replace(/^www\./, '');
      } catch {}
      const newBm: BookmarkItem = {
        id: `bm_${Date.now()}`,
        title: pageData?.title || currentTab.title || currentUrl,
        url: currentUrl,
        domain,
        category: 'custom',
        icon: '⭐',
        badge: `ID:${(accountId || userUid).slice(0, 6)}`
      };
      saveUserBookmarks([newBm, ...bookmarks]);
      showToast(`Đã lưu dấu trang vào hồ sơ ID ${accountId || userUid.slice(0, 8)}`);
    }
  };

  // Voice Search Handler
  const handleToggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Trình duyệt hiện tại không hỗ trợ nhận diện giọng nói trực tiếp.');
      return;
    }
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsVoiceListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        setIsVoiceListening(false);
        if (transcript.trim()) {
          setSearchQuery(transcript.trim());
          executeUserWebSearch(transcript.trim(), undefined, true);
        }
      };
      recognition.onerror = () => setIsVoiceListening(false);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Web Speech TTS for Reader Mode
  const handleToggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Thiết bị không hỗ trợ đọc giọng nói.');
      return;
    }
    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }
    const textToRead = (pageData?.contentMarkdown || '')
      .replace(/[#>*_`~-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 4000);
    if (!textToRead.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);
    setIsSpeakingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  // Load Live News when switching to `news` tab
  useEffect(() => {
    if (isBlockedAnonymousOrUnauthenticated || activeTab !== 'news') return;
    let isCancelled = false;
    const loadNews = async () => {
      setIsLoadingNews(true);
      const qMap: Record<typeof newsCategory, string> = {
        all: 'Tin tức nổi bật Việt Nam và Thế giới hôm nay',
        vietnam: 'Thời sự xã hội Việt Nam nóng nhất hôm nay VnExpress Tuổi Trẻ',
        tech: 'Trí tuệ nhân tạo AI công nghệ bán dẫn phần mềm mới nhất',
        finance: 'Thị trường tài chính chứng khoán ngân hàng kinh tế vĩ mô',
        science: 'Khám phá khoa học vũ trụ y sinh vật lý lượng tử mới nhất'
      };
      const res = await fetchMCPWebSearch(qMap[newsCategory], 9, undefined, {
        uid: userUid,
        accountId: accountId || userUid.slice(0, 10)
      });
      if (!isCancelled) {
        setLiveNewsItems(res.results || []);
        setIsLoadingNews(false);
      }
    };
    loadNews();
    return () => {
      isCancelled = true;
    };
  }, [activeTab, newsCategory, isBlockedAnonymousOrUnauthenticated, userUid, accountId]);

  // First Principles Synthesis derived from current `searchResults` & `lastExecutedQuery`
  const firstPrinciplesSynthesis = useMemo(() => {
    if (!lastExecutedQuery || searchResults.length === 0) return null;
    const topSnippets = searchResults
      .slice(0, 3)
      .map((r) => r.snippet)
      .join(' ');
    const sources = Array.from(new Set(searchResults.map((r) => r.source))).slice(0, 4);

    return {
      topic: lastExecutedQuery,
      coreAxiom:
        searchResults[0]?.snippet ||
        `Bản chất cốt lõi của "${lastExecutedQuery}" xoay quanh các quy luật nền tảng và dữ liệu thực nghiệm đã được kiểm chứng.`,
      practicalImpact:
        searchResults[1]?.snippet ||
        `Tác động trực tiếp đến hiệu suất công việc, tư duy ra quyết định và khả năng tối ưu hóa nguồn lực.`,
      verifiedSources: sources,
      combinedSummary: topSnippets.slice(0, 420)
    };
  }, [lastExecutedQuery, searchResults]);

  // Auto-extracted Table of Contents headings from `pageData.contentMarkdown`
  const readerHeadings = useMemo(() => {
    if (!pageData?.contentMarkdown) return [];
    const lines = pageData.contentMarkdown.split('\n');
    const extracted: { level: number; text: string }[] = [];
    for (const line of lines) {
      const m = line.match(/^(#{1,3})\s+(.+)$/);
      if (m) {
        extracted.push({
          level: m[1].length,
          text: m[2].replace(/[*_`]/g, '').trim()
        });
      }
    }
    return extracted.slice(0, 18);
  }, [pageData?.contentMarkdown]);

  // Autocomplete Suggestions for Search Omnibar
  const omnibarSuggestions = useMemo<AutocompleteSuggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: AutocompleteSuggestion[] = [];

    // 1. User's personal search history matching query
    for (const h of userSearchHistory) {
      if (!q || h.query.toLowerCase().includes(q)) {
        list.push({
          id: h.id,
          type: 'history',
          title: h.query,
          subtitle: `Lịch sử ID ${h.accountId} • ${h.timestamp}`,
          query: h.query,
          icon: '🕒',
          badge: 'Cá nhân'
        });
      }
      if (list.length >= 4) break;
    }

    // 2. Matching Bookmarks & Popular Domains
    for (const d of POPULAR_DOMAINS) {
      if (!q || d.label.toLowerCase().includes(q) || d.domain.toLowerCase().includes(q)) {
        list.push({
          id: `dom_${d.domain}`,
          type: 'website',
          title: d.label,
          subtitle: d.url,
          url: d.url,
          icon: d.icon,
          badge: d.category
        });
      }
      if (list.length >= 8) break;
    }

    return list;
  }, [searchQuery, userSearchHistory]);

  // ============================================================================
  // RENDER GATE: STRICT PROHIBITION OF ANONYMOUS / GUEST ACCOUNTS
  // ============================================================================
  if (isBlockedAnonymousOrUnauthenticated) {
    return (
      <div className={`relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-zinc-950 text-zinc-100 ${className}`}>
        {/* Animated Ambient Security Aura */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.22, 0.38, 0.22]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[520px] h-[520px] rounded-full bg-radial from-rose-500/25 via-indigo-500/10 to-transparent blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springTransition}
          className="relative z-10 w-full max-w-xl rounded-3xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-2xl p-6 sm:p-9 shadow-2xl"
        >
          {/* Top Shield Icon with Radar Pulse */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border border-rose-500/50"
              />
              <ShieldAlert size={32} />
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Cổng Kiểm Soát Định Danh Thực
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Haevy Internet 4.0 • Zero-Anonymous Policy
              </div>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            Nghiêm Cấm Tài Khoản Ẩn Danh Truy Cập Thực
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            Hệ thống tìm kiếm thông tin mạng và trình duyệt chuyên sâu <strong>Haevy Internet</strong> vận hành độc quyền dựa trên <strong>ID Đăng Nhập Thực</strong> của người dùng để cá nhân hóa thuật toán tìm kiếm, mã hóa lịch sử tra cứu, đồng bộ hóa dấu trang và sổ tay nguyên lý.
          </p>

          {/* Detected Session Status Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Trạng thái phiên hiện tại:</span>
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <Lock size={13} />
                {isAnonymousAccount || authStatus === 'anonymous' || anonymousVipSession
                  ? `Tài Khoản Ẩn Danh / Khách (${accountId || 'GUEST'}) — Bị Chặn`
                  : 'Chưa Đăng Nhập Tài Khoản Thực'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Yêu cầu bắt buộc:</span>
              <span className="font-semibold text-emerald-400">
                ID Người Dùng Đã Xác Thực (Google / Email Chính Chủ)
              </span>
            </div>
          </div>

          {/* Feature Pillars Unlocked by Real User ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-start gap-2.5">
              <UserCheck size={16} className="text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-zinc-100">Định Danh ID Cá Nhân Hóa</div>
                <div className="text-zinc-400 mt-0.5">Mọi truy vấn web & ghi chú gắn liền với UID duy nhất của bạn.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-start gap-2.5">
              <BrainCircuit size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-zinc-100">Bóc Tách First Principles</div>
                <div className="text-zinc-400 mt-0.5">Tổng hợp bản chất gốc và lưu ngoại tuyến không giới hạn.</div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                haptics.medium();
                if (isAnonymousAccount || anonymousVipSession) {
                  clearAnonymousVipSession();
                }
                if (onOpenAuth) {
                  onOpenAuth();
                } else {
                  window.dispatchEvent(new CustomEvent('haevy-open-auth-modal'));
                }
              }}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={17} />
              <span>
                {isAnonymousAccount || anonymousVipSession
                  ? 'Thoát Ẩn Danh & Đăng Nhập Tài Khoản Thực'
                  : 'Đăng Nhập Tài Khoản Thực Ngay'}
              </span>
            </motion.button>

            {onBackToPortal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onBackToPortal}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Về Cổng Chính</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // AUTHENTICATED REAL USER INTERFACE (REBUILT FROM FIRST PRINCIPLES)
  // ============================================================================
  const currentNoteForUrl = userNotesMap[currentUrl] || '';

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-[120] h-screen w-screen bg-zinc-950'
          : 'relative w-full min-h-[calc(100vh-80px)] bg-zinc-950 rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden'
      } flex flex-col text-zinc-100 transition-colors ${className}`}
    >
      {/* Dynamic Ambient Motion Aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: activeTab === 'search' ? '0%' : activeTab === 'browser' ? '25%' : '-15%',
            y: activeTab === 'ai_reader' ? '15%' : '0%',
            scale: [1, 1.08, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[600px] h-[600px] -top-48 left-1/4 rounded-full bg-radial from-sky-500/12 via-indigo-500/6 to-transparent blur-3xl"
        />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastBanner && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={springTransition}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-sky-500/40 text-sky-200 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{toastBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================================= */}
      {/* TOP IDENTITY & SPATIAL NAVIGATION BAR                                   */}
      {/* ======================================================================= */}
      <header className="relative z-20 px-3 sm:px-5 py-2.5 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Brand + Verified User ID Passport */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToPortal && !isFullscreen && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onBackToPortal}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
              title="Quay lại Cổng Vũ Trụ"
            >
              <ArrowLeft size={15} />
            </motion.button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.06 }}
              transition={springTransition}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0"
            >
              <Globe size={19} />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  Haevy Internet
                </span>
                <span className="text-xs text-sky-400 font-medium hidden sm:inline">
                  · Định Danh Thực
                </span>
              </div>
              {/* Unboxed clean metadata per Frontend Design Constitution */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                <UserCheck size={11} className="text-emerald-400 shrink-0" />
                <span className="font-semibold text-zinc-200 truncate">{displayName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-400">
                  ID: {accountId || userUid.slice(0, 8)}
                </span>
                {searchLatencyMs !== null && (
                  <>
                    <span aria-hidden="true" className="hidden md:inline">·</span>
                    <span className="font-mono text-zinc-400 hidden md:inline">
                      {searchLatencyMs}ms
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Spring-Animated Morphing Workspace Switcher */}
        <nav className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-x-auto max-w-full">
          {(
            [
              { id: 'search', label: 'Tìm Kiếm Mạng', icon: Search },
              { id: 'browser', label: `Trình Duyệt (${tabs.length})`, icon: Compass },
              { id: 'ai_reader', label: 'Đọc Sâu Nguyên Lý', icon: BookOpen },
              { id: 'bookmarks', label: `Kho ID (${bookmarks.length + offlinePages.length})`, icon: Bookmark },
              { id: 'news', label: 'Tin Nóng 24h', icon: Newspaper }
            ] as { id: InternetSubTab; label: string; icon: any }[]
          ).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="haevy-internet-active-pill"
                    transition={springTransition}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/25 via-blue-600/25 to-indigo-600/25 border border-sky-500/40"
                  />
                )}
                <Icon size={13} className={`relative z-10 ${isActive ? 'text-sky-400' : ''}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Workspace Utilities (Split-Screen & Fullscreen) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              setIsSplitScreen(!isSplitScreen);
              if (activeTab !== 'browser' && activeTab !== 'ai_reader') {
                handleSelectTab('browser');
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isSplitScreen
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Chia đôi màn hình: Vừa lướt web vừa ghi chú theo ID"
          >
            <Columns size={14} />
            <span className="hidden xl:inline">Chia Đôi</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isFullscreen
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Chế độ toàn màn hình 100%"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
          </motion.button>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* MAIN ANIMATED WORKSPACE STAGE                                           */}
      {/* ======================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* =================================================================== */}
          {/* WORKSPACE 1: DEEP WEB SEARCH ENGINE (TÌM KIẾM MẠNG THEO ID)          */}
          {/* =================================================================== */}
          {activeTab === 'search' && (
            <motion.div
              key="workspace-search"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={springTransition}
              className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
            >
              {/* Hero Search Command Header */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      <span>Truy Vấn Mạng Bảo Mật Gắn Với ID: {accountId || userUid.slice(0, 8)}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                      Khám Phá Tri Thức & Tin Tức Toàn Cầu Theo Nguyên Lý Gốc
                    </h2>
                  </div>

                  {/* Engine Selector Buttons */}
                  <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 self-start">
                    {SEARCH_ENGINES.slice(0, 3).map((eng) => (
                      <button
                        key={eng.id}
                        type="button"
                        onClick={() => setSearchEngine(eng.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          searchEngine === eng.id
                            ? 'bg-zinc-800 text-sky-300 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {eng.icon} {eng.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spatial Search Omnibar */}
                <div className="relative">
                  <motion.div
                    animate={{
                      boxShadow: isSearchFocused
                        ? '0 0 0 2px rgba(56, 189, 248, 0.5), 0 18px 40px -10px rgba(14, 165, 233, 0.25)'
                        : '0 8px 24px -8px rgba(0, 0, 0, 0.5)'
                    }}
                    className="flex items-center gap-2 bg-zinc-900/95 border border-zinc-800 rounded-2xl px-4 py-3"
                  >
                    <Search size={19} className="text-sky-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          executeUserWebSearch(searchQuery, undefined, false);
                        }
                      }}
                      placeholder="Nhập từ khóa tìm kiếm, câu hỏi học thuật hoặc dán đường link URL..."
                      className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleVoiceSearch}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isVoiceListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                      title="Tìm kiếm bằng giọng nói tiếng Việt"
                    >
                      {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => executeUserWebSearch(searchQuery || lastExecutedQuery, undefined, false)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Zap size={14} />
                      <span>Tìm Kiếm</span>
                    </motion.button>
                  </motion.div>

                  {/* Live Autocomplete Dropdown */}
                  <AnimatePresence>
                    {isSearchFocused && omnibarSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16 }}
                        className="absolute left-0 right-0 top-full mt-2 z-30 bg-zinc-900/98 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800/60"
                      >
                        {omnibarSuggestions.map((sug) => (
                          <button
                            key={sug.id}
                            type="button"
                            onMouseDown={() => {
                              if (sug.url) {
                                navigateBrowserToUrl(sug.url, false);
                                handleSelectTab('browser');
                              } else if (sug.query) {
                                setSearchQuery(sug.query);
                                executeUserWebSearch(sug.query, undefined, false);
                              }
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-zinc-800/80 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-base">{sug.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-zinc-100 truncate">
                                  {sug.title}
                                </div>
                                {sug.subtitle && (
                                  <div className="text-[11px] text-zinc-400 truncate">
                                    {sug.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-sky-400 font-medium shrink-0">
                              {sug.badge}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Focus Mode + Domain Quick Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(
                      [
                        { id: 'all', label: 'Tất Cả Nguồn' },
                        { id: 'principles', label: 'Bản Chất First Principles' },
                        { id: 'news', label: 'Tin Nóng 24h' },
                        { id: 'science', label: 'Khoa Học & STEM' },
                        { id: 'finance', label: 'Kinh Tế & Tài Chính' }
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSearchFocusCategory(cat.id);
                          if (lastExecutedQuery) {
                            executeUserWebSearch(lastExecutedQuery, undefined, false);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          searchFocusCategory === cat.id
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Domain Filter Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-400">Lọc tên miền:</span>
                    <select
                      value={domainFilter}
                      onChange={(e) => {
                        setDomainFilter(e.target.value);
                        if (lastExecutedQuery) {
                          executeUserWebSearch(lastExecutedQuery, e.target.value, false);
                        }
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Mọi trang web</option>
                      <option value="vi.wikipedia.org">Wikipedia Tiếng Việt</option>
                      <option value="vnexpress.net">VnExpress</option>
                      <option value="dantri.com.vn">Dân Trí</option>
                      <option value="tuoitre.vn">Tuổi Trẻ</option>
                      <option value="tinhte.vn">Tinh Tế</option>
                      <option value="cafef.vn">CafeF Kinh Tế</option>
                    </select>
                  </div>
                </div>

                {/* Curated Trending Prompts Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-semibold text-zinc-400 shrink-0 flex items-center gap-1">
                    <TrendingUp size={12} className="text-amber-400" />
                    <span>Xu hướng:</span>
                  </span>
                  {CURATED_TRENDING_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(t.query);
                        executeUserWebSearch(t.query, undefined, false);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {t.icon} {t.query}
                    </button>
                  ))}
                </div>
              </div>

              {/* =============================================================== */}
              {/* SEARCH RESULTS & FIRST PRINCIPLES SYNTHESIS                     */}
              {/* =============================================================== */}
              <div className="max-w-5xl mx-auto space-y-5">
                {isSearching ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 rounded-2xl border-2 border-sky-400 border-t-transparent flex items-center justify-center"
                    />
                    <div className="text-sm font-bold text-white">
                      Đang quét mạng toàn cầu theo ID {accountId || userUid.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-zinc-400">
                      Đang phân tách dữ liệu, lọc rác quảng cáo và tổng hợp nguyên lý cốt lõi
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. First Principles Synthesis Card */}
                    {firstPrinciplesSynthesis && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={springTransition}
                        className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                              <BrainCircuit size={17} />
                            </div>
                            <div>
                              <h3 className="text-sm font-extrabold text-white">
                                01. Bóc Tách Bản Chất First Principles: "{firstPrinciplesSynthesis.topic}"
                              </h3>
                              <div className="text-xs text-zinc-400">
                                Tổng hợp từ {searchResults.length} nguồn dữ liệu xác thực · Lưu theo ID {accountId || userUid.slice(0, 8)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {onAskAIAboutPage && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAskAIAboutPage(
                                    firstPrinciplesSynthesis.topic,
                                    `https://haevy.internet/search?q=${encodeURIComponent(firstPrinciplesSynthesis.topic)}`,
                                    firstPrinciplesSynthesis.combinedSummary
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles size={13} />
                                <span>Hỏi Sâu Haevy AI</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70">
                            <div className="font-bold text-emerald-400 mb-1">
                              Tiên Đề & Bản Chất Gốc
                            </div>
                            <p className="text-zinc-300">{firstPrinciplesSynthesis.coreAxiom}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70">
                            <div className="font-bold text-sky-400 mb-1">
                              Bối Cảnh & Dẫn Chứng Thực Tế
                            </div>
                            <p className="text-zinc-300">{firstPrinciplesSynthesis.practicalImpact}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 2. Staggered Animated Search Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {searchResults.map((item, idx) => (
                        <motion.article
                          key={`${item.url}-${idx}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            ...springTransition,
                            delay: Math.min(idx * 0.04, 0.3)
                          }}
                          whileHover={{ y: -2 }}
                          className="p-4 rounded-2xl bg-zinc-900/65 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 flex flex-col justify-between gap-3 transition-colors group"
                        >
                          <div className="space-y-1.5">
                            {/* Clean unboxed metadata line */}
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span className="font-semibold text-sky-400">{item.source || 'Web'}</span>
                              {item.pubDate && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{item.pubDate}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[11px] text-zinc-500">#{idx + 1}</span>
                            </div>

                            <h4
                              onClick={() => handleQuickPeekResult(item)}
                              className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-sky-300 transition-colors cursor-pointer line-clamp-2"
                            >
                              {item.title}
                            </h4>

                            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                              {item.snippet}
                            </p>
                          </div>

                          {/* Card Action Bar */}
                          <div className="pt-2.5 border-t border-zinc-800/70 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickPeekResult(item)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} className="text-sky-400" />
                                <span>Xem Nhanh</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigateBrowserToUrl(item.url, false);
                                  handleSelectTab('ai_reader');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <BookOpen size={12} className="text-emerald-400" />
                                <span>Đọc Sâu</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => navigateBrowserToUrl(item.url, true)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={12} className="text-amber-400" />
                                <span>Mở Tab</span>
                              </button>
                            </div>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-0.5"
                              title="Mở trang gốc"
                            >
                              <ArrowUpRight size={14} />
                            </a>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* =================================================================== */}
          {/* WORKSPACE 2: MULTI-TAB BROWSER & SPLIT-SCREEN WORKSPACE             */}
          {/* =================================================================== */}
          {activeTab === 'browser' && (
            <motion.div
              key="workspace-browser"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={springTransition}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Multi-Tab Bar with Spring Animations */}
              <div className="px-3 pt-2 bg-zinc-900/70 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto">
                <AnimatePresence initial={false}>
                  {tabs.map((tab) => {
                    const isAct = tab.id === activeTabId;
                    return (
                      <motion.div
                        key={tab.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={springTransition}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`group relative px-3 py-1.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 max-w-[210px] cursor-pointer border-t border-x ${
                          isAct
                            ? 'bg-zinc-950 border-zinc-800 text-white'
                            : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>{tab.favicon || '🌐'}</span>
                        <span className="truncate">{tab.title}</span>
                        {tabs.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const remaining = tabs.filter((t) => t.id !== tab.id);
                              setTabs(remaining);
                              if (activeTabId === tab.id) {
                                setActiveTabId(remaining[remaining.length - 1].id);
                              }
                            }}
                            className="w-4 h-4 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() =>
                    navigateBrowserToUrl('https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh', true)
                  }
                  className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
                  title="Mở tab mới"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Browser Address & Mode Controls Bar */}
              <div className="p-2.5 bg-zinc-950 border-b border-zinc-800/80 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentHistoryIndex <= 0}
                    onClick={() =>
                      setHistoryIndexMap((prev) => ({
                        ...prev,
                        [activeTabId]: Math.max(0, currentHistoryIndex - 1)
                      }))
                    }
                    className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={currentHistoryIndex >= currentHistory.length - 1}
                    onClick={() =>
                      setHistoryIndexMap((prev) => ({
                        ...prev,
                        [activeTabId]: Math.min(currentHistory.length - 1, currentHistoryIndex + 1)
                      }))
                    }
                    className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => loadWebPage(currentUrl)}
                    className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
                  >
                    <RotateCw size={14} className={isLoadingPage ? 'animate-spin text-sky-400' : ''} />
                  </button>
                </div>

                {/* URL / Search Input */}
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <Lock size={12} className="text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && navigateBrowserToUrl(addressInput, false)}
                    placeholder="Nhập địa chỉ web hoặc từ khóa..."
                    className="flex-1 bg-transparent text-xs text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleToggleCurrentBookmark}
                    className={`cursor-pointer ${
                      isCurrentUrlBookmarked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Lưu dấu trang theo ID"
                  >
                    <Star size={14} className={isCurrentUrlBookmarked ? 'fill-amber-400' : ''} />
                  </button>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setBrowserViewMode('reader')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      browserViewMode === 'reader'
                        ? 'bg-zinc-800 text-emerald-300'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Đọc Sạch Proxy
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowserViewMode('iframe')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      browserViewMode === 'iframe'
                        ? 'bg-zinc-800 text-sky-300'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Khung Web Thực
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrowserViewMode('social')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      browserViewMode === 'social'
                        ? 'bg-zinc-800 text-rose-300'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Media / Video
                  </button>
                </div>

                {/* Save Offline & TTS */}
                {pageData && (
                  <button
                    type="button"
                    onClick={() => handleSaveToOfflineVault(pageData)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1 cursor-pointer"
                    title="Lưu bài viết ngoại tuyến theo ID"
                  >
                    <Download size={13} className="text-sky-400" />
                    <span className="hidden md:inline">Lưu Ngoại Tuyến</span>
                  </button>
                )}
              </div>

              {/* Main Browser Content + Optional Split-Screen Research Pane */}
              <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                {/* Left / Primary Web Viewport */}
                <div className="flex-1 overflow-y-auto relative bg-zinc-950">
                  {browserViewMode === 'reader' && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
                      {isLoadingPage ? (
                        <div className="py-20 text-center space-y-3">
                          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs text-zinc-400">
                            Đang tải & lọc sạch nội dung trang web qua Proxy bảo mật...
                          </p>
                        </div>
                      ) : pageData ? (
                        <article className="space-y-4">
                          <div className="border-b border-zinc-800 pb-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span className="text-sky-400 font-semibold">{pageData.domain}</span>
                              <span aria-hidden="true">·</span>
                              <span>{pageData.wordCount} từ</span>
                              <span aria-hidden="true">·</span>
                              <span>ID: {accountId || userUid.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                              {pageData.title}
                            </h1>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleToggleTTS}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                  isSpeakingTTS
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                                }`}
                              >
                                {isSpeakingTTS ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                <span>{isSpeakingTTS ? 'Dừng Đọc' : 'Nghe Đọc Bài Viết'}</span>
                              </button>

                              <a
                                href={currentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1"
                              >
                                <span>Mở Trang Gốc</span>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>

                          <div
                            className={`prose prose-invert max-w-none leading-relaxed text-zinc-200 ${
                              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                            } ${
                              fontSize === 'sm'
                                ? 'text-xs'
                                : fontSize === 'base'
                                ? 'text-sm'
                                : fontSize === 'lg'
                                ? 'text-base'
                                : fontSize === 'xl'
                                ? 'text-lg'
                                : 'text-xl'
                            }`}
                          >
                            <Markdown>{pageData.contentMarkdown}</Markdown>
                          </div>
                        </article>
                      ) : null}
                    </div>
                  )}

                  {browserViewMode === 'iframe' && (
                    <div className="w-full h-full min-h-[500px] flex flex-col">
                      <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                        <span>
                          Nếu trang web từ chối nhúng khung trực tiếp, hãy chuyển sang tab <strong>Đọc Sạch Proxy</strong>.
                        </span>
                        <button
                          type="button"
                          onClick={() => setBrowserViewMode('reader')}
                          className="text-sky-400 font-semibold hover:underline cursor-pointer"
                        >
                          Chuyển sang Đọc Sạch Proxy
                        </button>
                      </div>
                      <iframe
                        src={currentUrl}
                        title={currentTab.title}
                        className="w-full flex-1 bg-white border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  )}

                  {browserViewMode === 'social' && (
                    <div className="p-4">
                      <SocialMediaInteractiveViewer
                        platform={currentUrl.toLowerCase().includes('facebook') ? 'facebook' : 'tiktok'}
                        currentUrl={currentUrl}
                        onNavigateUrl={(nextUrl) => navigateBrowserToUrl(nextUrl, false)}
                        onSwitchToProxy={() => setBrowserViewMode('reader')}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Animated Split-Screen Research Notebook (Bound to User ID) */}
                <AnimatePresence>
                  {isSplitScreen && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 380, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={springTransition}
                      className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/90 flex flex-col shrink-0 overflow-hidden"
                    >
                      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSplitPaneTab('notes')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              splitPaneTab === 'notes'
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Sổ Ghi Chú ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setSplitPaneTab('principles')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              splitPaneTab === 'principles'
                                ? 'bg-zinc-800 text-emerald-300'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            Tóm Tắt Nhanh
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSplitScreen(false)}
                          className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {splitPaneTab === 'notes' ? (
                        <div className="flex-1 p-3 flex flex-col gap-2">
                          <div className="text-[11px] text-zinc-400">
                            Ghi chú tự động lưu theo ID <strong>{accountId || userUid.slice(0, 8)}</strong> cho trang này:
                          </div>
                          <textarea
                            value={currentNoteForUrl}
                            onChange={(e) => updateUserNoteForUrl(currentUrl, e.target.value)}
                            placeholder="Ghi lại ý chính, công thức, dẫn chứng hoặc suy nghĩ của bạn khi đọc trang này..."
                            className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                          <div className="font-bold text-white">
                            Cấu trúc đề mục & Ý chính của trang:
                          </div>
                          {readerHeadings.length > 0 ? (
                            <div className="space-y-1.5">
                              {readerHeadings.map((h, i) => (
                                <div
                                  key={i}
                                  className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/70 text-zinc-300"
                                >
                                  {h.text}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-zinc-400">
                              {pageData?.description || 'Đang trích xuất tóm tắt nội dung trang...'}
                            </p>
                          )}
                        </div>
                      )}
                    </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* =================================================================== */}
          {/* WORKSPACE 3: IMMERSIVE FIRST PRINCIPLES READER (ai_reader)          */}
          {/* =================================================================== */}
          {activeTab === 'ai_reader' && (
            <motion.div
              key="workspace-reader"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={springTransition}
              className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden"
            >
              {/* Left Sidebar: Interactive Table of Contents & Typography Controls */}
              <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-zinc-900/50 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto max-h-60 lg:max-h-full">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-300">Tùy Chỉnh Hiển Thị Đọc Sâu</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFontFamily('sans')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        fontFamily === 'sans'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      Sans Hiện Đại
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('serif')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-serif cursor-pointer ${
                        fontFamily === 'serif'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      Serif Học Thuật
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold uppercase cursor-pointer ${
                          fontSize === sz
                            ? 'bg-zinc-800 text-white'
                            : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In-Page Keyword Search */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-zinc-300">Tìm Từ Khóa Trong Bài</div>
                  <input
                    type="text"
                    value={inPageFindQuery}
                    onChange={(e) => setInPageFindQuery(e.target.value)}
                    placeholder="Gõ từ khóa cần lọc..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Auto Table of Contents */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-xs font-bold text-zinc-300">Mục Lục Bài Viết ({readerHeadings.length})</div>
                  {readerHeadings.length === 0 ? (
                    <div className="text-xs text-zinc-500">Tự động nhận diện các đề mục chính...</div>
                  ) : (
                    <div className="space-y-1">
                      {readerHeadings.map((h, i) => (
                        <div
                          key={i}
                          className={`text-xs text-zinc-400 hover:text-sky-300 truncate py-1 ${
                            h.level === 2 ? 'pl-2' : h.level === 3 ? 'pl-4' : 'font-semibold text-zinc-200'
                          }`}
                        >
                          {h.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Clean Distraction-Free Article Canvas */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-12 py-8 bg-zinc-950">
                <div className="max-w-3xl mx-auto space-y-6">
                  {pageData ? (
                    <>
                      <div className="border-b border-zinc-800 pb-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span className="text-emerald-400 font-semibold">{pageData.domain}</span>
                          <span aria-hidden="true">·</span>
                          <span>{pageData.wordCount} từ</span>
                          <span aria-hidden="true">·</span>
                          <span>Chế độ Đọc Sâu First Principles</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {pageData.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleToggleTTS}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSpeakingTTS ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-sky-400" />}
                            <span>{isSpeakingTTS ? 'Dừng Đọc Giọng Nói' : 'Nghe Đọc Tự Nhiên'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveToOfflineVault(pageData)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={14} className="text-emerald-400" />
                            <span>Lưu Ngoại Tuyến Theo ID</span>
                          </button>

                          {onAskAIAboutPage && (
                            <button
                              type="button"
                              onClick={() =>
                                onAskAIAboutPage(pageData.title, pageData.url, pageData.contentMarkdown)
                              }
                              className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-xs font-bold text-sky-300 flex items-center gap-1.5 cursor-pointer"
                            >
                              <BrainCircuit size={14} />
                              <span>Phân Tích Cùng Haevy AI</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className={`prose prose-invert max-w-none leading-relaxed text-zinc-200 ${
                          fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                        } ${
                          fontSize === 'sm'
                            ? 'text-xs'
                            : fontSize === 'base'
                            ? 'text-sm'
                            : fontSize === 'lg'
                            ? 'text-base'
                            : fontSize === 'xl'
                            ? 'text-lg'
                            : 'text-xl'
                        }`}
                      >
                        <Markdown>
                          {inPageFindQuery.trim()
                            ? pageData.contentMarkdown
                                .split('\n')
                                .filter((line) =>
                                  line.toLowerCase().includes(inPageFindQuery.trim().toLowerCase())
                                )
                                .join('\n\n') ||
                              `*Không tìm thấy đoạn văn nào khớp với từ khóa "${inPageFindQuery}".*`
                            : pageData.contentMarkdown}
                        </Markdown>
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center text-sm text-zinc-400">
                      Hãy chọn một bài viết từ tab Tìm Kiếm Mạng hoặc Trình Duyệt để bắt đầu đọc sâu.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* =================================================================== */}
          {/* WORKSPACE 4: USER-ID VAULT (BOOKMARKS, OFFLINE & SEARCH HISTORY)    */}
          {/* =================================================================== */}
          {activeTab === 'bookmarks' && (
            <motion.div
              key="workspace-bookmarks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={springTransition}
              className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
            >
              <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-emerald-400">
                      Kho Lưu Trữ Cá Nhân Hóa Theo ID: {accountId || userUid.slice(0, 8)}
                    </div>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Dấu Trang, Bài Viết Ngoại Tuyến & Lịch Sử Tìm Kiếm
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setVaultSection('bookmarks')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        vaultSection === 'bookmarks' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                      }`}
                    >
                      Dấu Trang ({bookmarks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultSection('offline')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        vaultSection === 'offline' ? 'bg-zinc-800 text-sky-300' : 'text-zinc-400'
                      }`}
                    >
                      Ngoại Tuyến ({offlinePages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultSection('history')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        vaultSection === 'history' ? 'bg-zinc-800 text-emerald-300' : 'text-zinc-400'
                      }`}
                    >
                      Lịch Sử ID ({userSearchHistory.length})
                    </button>
                  </div>
                </div>

                {/* Filter & Add Custom Bookmark Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                    <Search size={14} className="text-zinc-400" />
                    <input
                      type="text"
                      value={vaultFilterText}
                      onChange={(e) => setVaultFilterText(e.target.value)}
                      placeholder="Lọc nhanh trong kho dữ liệu ID của bạn..."
                      className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  {vaultSection === 'bookmarks' && (
                    <button
                      type="button"
                      onClick={() => setIsAddingBookmark(!isAddingBookmark)}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Thêm Dấu Trang</span>
                    </button>
                  )}

                  {vaultSection === 'history' && userSearchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        saveUserHistory([]);
                        showToast('Đã xóa lịch sử tìm kiếm của ID');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Xóa Lịch Sử</span>
                    </button>
                  )}
                </div>

                {/* Add Bookmark Form */}
                {isAddingBookmark && vaultSection === 'bookmarks' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="text"
                      value={newBmTitle}
                      onChange={(e) => setNewBmTitle(e.target.value)}
                      placeholder="Tên trang web (VD: Tài liệu Vật lý Lượng tử)"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newBmUrl}
                      onChange={(e) => setNewBmUrl(e.target.value)}
                      placeholder="Đường dẫn URL (VD: https://vi.wikipedia.org)"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBmTitle.trim() || !newBmUrl.trim()) return;
                        const formattedUrl = /^https?:\/\//i.test(newBmUrl.trim())
                          ? newBmUrl.trim()
                          : `https://${newBmUrl.trim()}`;
                        let dom = 'web';
                        try {
                          dom = new URL(formattedUrl).hostname.replace(/^www\./, '');
                        } catch {}
                        saveUserBookmarks([
                          {
                            id: `bm_${Date.now()}`,
                            title: newBmTitle.trim(),
                            url: formattedUrl,
                            domain: dom,
                            category: 'custom',
                            icon: '⭐'
                          },
                          ...bookmarks
                        ]);
                        setNewBmTitle('');
                        setNewBmUrl('');
                        setIsAddingBookmark(false);
                        showToast('Đã thêm dấu trang mới vào ID của bạn');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer"
                    >
                      Lưu Ngay
                    </button>
                  </motion.div>
                )}

                {/* Vault Items Grid */}
                {vaultSection === 'bookmarks' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookmarks
                      .filter(
                        (b) =>
                          !vaultFilterText.trim() ||
                          b.title.toLowerCase().includes(vaultFilterText.toLowerCase()) ||
                          b.domain.toLowerCase().includes(vaultFilterText.toLowerCase())
                      )
                      .map((bm) => (
                        <motion.div
                          key={bm.id}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            navigateBrowserToUrl(bm.url, false);
                            handleSelectTab('browser');
                          }}
                          className="p-3.5 rounded-2xl bg-zinc-900/75 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-xl shrink-0">{bm.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{bm.title}</div>
                              <div className="text-[11px] text-zinc-400 truncate mt-0.5">{bm.domain}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveUserBookmarks(bookmarks.filter((x) => x.id !== bm.id));
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                  </div>
                )}

                {vaultSection === 'offline' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {offlinePages.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-xs text-zinc-400">
                        Chưa có bài viết ngoại tuyến nào. Hãy nhấn "Lưu Ngoại Tuyến" khi đang đọc bài viết bất kỳ!
                      </div>
                    ) : (
                      offlinePages.map((pg) => (
                        <div
                          key={pg.id}
                          onClick={() => {
                            setPageData({
                              title: pg.title,
                              url: pg.url,
                              domain: pg.domain,
                              description: `Đã lưu ngoại tuyến (${pg.savedAt})`,
                              wordCount: pg.wordCount,
                              contentMarkdown: pg.contentMarkdown,
                              success: true
                            });
                            handleSelectTab('ai_reader');
                          }}
                          className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{pg.title}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              {pg.domain} · {pg.wordCount} từ · Lưu lúc {pg.savedAt}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveUserOfflinePages(offlinePages.filter((x) => x.id !== pg.id));
                            }}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {vaultSection === 'history' && (
                  <div className="space-y-2">
                    {userSearchHistory.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-400">
                        Chưa có lịch sử tìm kiếm nào được ghi nhận cho ID {accountId || userUid.slice(0, 8)}.
                      </div>
                    ) : (
                      userSearchHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSearchQuery(item.query);
                            executeUserWebSearch(item.query, item.domainFilter, true);
                          }}
                          className="p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Clock size={14} className="text-sky-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{item.query}</div>
                              <div className="text-[11px] text-zinc-400">
                                ID: {item.accountId} · Bộ máy: {item.engine} · {item.resultsCount} kết quả
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500 shrink-0">{item.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* =================================================================== */}
          {/* WORKSPACE 5: LIVE CURATED NEWS MATRIX (TIN NÓNG 24/7)               */}
          {/* =================================================================== */}
          {activeTab === 'news' && (
            <motion.div
              key="workspace-news"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={springTransition}
              className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
            >
              <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-amber-400">
                      Bản Tin Thời Gian Thực · Cá Nhân Hóa Theo ID {accountId || userUid.slice(0, 8)}
                    </div>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">
                      Toàn Cảnh Tin Nóng Việt Nam & Thế Giới 24/7
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(
                      [
                        { id: 'all', label: 'Tất Cả' },
                        { id: 'vietnam', label: 'Thời Sự Việt Nam' },
                        { id: 'tech', label: 'Công Nghệ & AI' },
                        { id: 'finance', label: 'Kinh Tế & Tài Chính' },
                        { id: 'science', label: 'Khoa Học & Đời Sống' }
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewsCategory(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                          newsCategory === c.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingNews ? (
                  <div className="py-16 text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400">Đang tổng hợp tin nóng trực tiếp...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {liveNewsItems.map((news, i) => (
                      <motion.article
                        key={`${news.url}-${i}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springTransition, delay: i * 0.04 }}
                        whileHover={{ y: -2 }}
                        onClick={() => handleQuickPeekResult(news)}
                        className="p-4 rounded-2xl bg-zinc-900/75 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 flex flex-col justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="font-semibold text-amber-400">{news.source}</span>
                            {news.pubDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{news.pubDate}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-2">{news.title}</h3>
                          <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                            {news.snippet}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between text-xs">
                          <span className="text-sky-400 font-semibold flex items-center gap-1">
                            <Eye size={12} />
                            <span>Đọc nhanh</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateBrowserToUrl(news.url, false);
                              handleSelectTab('ai_reader');
                            }}
                            className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                          >
                            Mở Phòng Đọc Sâu →
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ======================================================================= */}
      {/* SLIDE-OVER QUICK PEEK DRAWER (XEM NHANH TRỰC TIẾP TRONG TRANG TÌM KIẾM) */}
      {/* ======================================================================= */}
      <AnimatePresence>
        {peekResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPeekResult(null)}
            className="fixed inset-0 z-[130] bg-black/65 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={springTransition}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-sky-400 font-semibold truncate">
                    Xem Nhanh Trực Tiếp · {peekResult.source}
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{peekResult.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigateBrowserToUrl(peekResult.url, false);
                      setPeekResult(null);
                      handleSelectTab('ai_reader');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer"
                  >
                    Mở Toàn Màn Đọc Sâu
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeekResult(null)}
                    className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isPeekLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400">Đang trích xuất toàn văn bài viết...</p>
                  </div>
                ) : peekPageContent ? (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-200">
                    <Markdown>{peekPageContent.contentMarkdown}</Markdown>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
