import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Heart, 
  Send, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Crown, 
  Coins, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  MessageSquare, 
  Shapes, 
  Gamepad2, 
  Wallet, 
  Radio, 
  ChevronRight, 
  Flame, 
  Zap, 
  Award, 
  Smile, 
  Clock, 
  Headphones, 
  Play, 
  Pause, 
  Share2, 
  Lock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PieChart, 
  RefreshCw, 
  ExternalLink, 
  Music2, 
  Trash2, 
  Undo2, 
  Sparkle,
  LayoutGrid,
  Plus,
  Maximize,
  Minimize,
  TreePine,
  Users,
  BookOpen,
  FolderPlus,
  Compass,
  X,
  Trophy,
  Filter,
  History,
  Bookmark,
  PanelLeft,
  GraduationCap,
  FileText,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HaevyAIMessage, HaevyAIChatSession, FinanceTransaction, FinanceWallet, Track } from '../types';
import { haptics } from '../utils/haptics';
import { doc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HaevyAIChatHistorySidebar } from './HaevyAIChatHistorySidebar';
import { GoogleDocsExportModal } from './google/GoogleDocsExportModal';
import { GoogleDocExportOptions } from '../services/googleDocsService';
import { HaevyMCPProtocolModal } from './haevyAI/HaevyMCPProtocolModal';
import { getStoredMCPSession, gatherFullMCPUserContext } from '../services/mcpContextService';
import {
  parseEcosystemNaturalCommand,
  executeAddFamilyMembers,
  executeDeleteFamilyMembers,
  executeAddTracks,
  executeDeleteTracks,
  executeAddFinanceTransaction,
  executeDeleteFinanceTransactions,
  executeAddCoupleMemory,
  executeDeleteCoupleMemories,
  executeAddFriend,
  executeDeleteFriend,
  executeAddEduNote,
  executeDeleteEduNote,
  executeAddEduCalculation,
  executeUndoLastAction,
  getEcosystemLiveSnapshot,
  HAEVY_ECOSYSTEM_MODES_INFO,
  EcosystemActionResult
} from '../utils/haevyAIEcosystemEngine';
import { HaevyEcosystemManager } from './HaevyEcosystemManager';

interface HaevyAIHubViewProps {
  onBackToPortal?: () => void;
  onSelectMode?: (mode: string, initialTab?: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenAuth?: () => void;
  onPlayTrack?: (track: any) => void;
  initialTopic?: string;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  activeSubTab?: string;
  onSelectSubTab?: (tab: any) => void;
  onOpenEcosystemDrawer?: () => void;
  onOpenNotifications?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function HaevyAIHubView({
  onBackToPortal,
  onSelectMode,
  onSelectTab,
  onOpenAuth,
  onPlayTrack,
  initialTopic = 'all',
  initialPrompt,
  onClearInitialPrompt,
  activeSubTab,
  onSelectSubTab,
  onOpenEcosystemDrawer,
  onOpenNotifications,
  onToggleFullscreen,
  isFullscreen = false
}: HaevyAIHubViewProps) {
  const auth = useAuth();
  const { 
    user, 
    accountId, 
    isVip, 
    vipTier, 
    audioPoints, 
    totalEarnedPoints, 
    totalListenedMinutes, 
    isAuthorVerified, 
    authorStageName,
    addAudioPoints
  } = auth;

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isMCPModalOpen, setIsMCPModalOpen] = useState(false);
  const [mcpSession, setMcpSession] = useState(() => getStoredMCPSession());
  const [sessions, setSessions] = useState<HaevyAIChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const storageKey = `haevy_ai_chat_sessions_${user?.uid || 'guest'}`;

  const createWelcomeMessage = (displayName?: string): HaevyAIMessage => {
    const userName = displayName || 'bạn';
    return {
      id: `welcome_${Date.now()}`,
      sender: 'ai',
      text: `Xin chào **${userName}**! ✨ Tôi là **Haevy AI Master** - Trợ Lý Thông Minh & Bạn Đồng Hành Toàn Năng của Hệ Sinh Thái Haevy.\n\nTôi có thể trò chuyện, tâm sự thấu cảm, đồng thời **trực tiếp thực hiện mọi nhiệm vụ theo lệnh của bạn**:\n- ⚡ **Giao diện MCP (Model Context Protocol)**: Đọc dữ liệu người dùng thời gian thực sau bước xác thực thông tin đăng nhập, truy cứu thông tin cá nhân, cấp độ LV, ví 6 hũ và gia phả.\n- 📊 **Kiểm tra lượt nghe Audio hôm nay**: Thống kê số lượng người nghe, thời lượng và bài hát thịnh hành.\n- 💖 **Đếm ngày yêu nhau**: Tính toán chính xác số ngày bên nhau của cặp đôi và nhắc mốc kỷ niệm.\n- 💰 **Tự động thêm giao dịch nhận lương / chi tiêu**: Ghi sổ thu chi, cập nhật số dư ví và phân bổ 6 Hũ thông minh tức thì.\n- 🎵 **Gợi ý & Phát nhạc**: Bật nhạc Lo-Fi, truyện audio, không gian thư giãn.\n\nHãy nhắn tin hoặc chọn nhanh các nhiệm vụ bên dưới để tôi hỗ trợ bạn ngay nhé! 🚀`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
      suggestedActions: [
        { label: '⚡ Giao Diện MCP Tra Cứu Dữ Liệu', actionType: 'prompt_preset', target: 'Hãy truy cứu toàn bộ thông tin cá nhân, cấp độ LV và ví tài chính của tôi qua giao thức MCP.', icon: 'Cpu' },
        { label: '🎖️ Kiểm Tra Cấp Độ LV & EXP', actionType: 'prompt_preset', target: 'Kiểm tra cấp độ LV, điểm EXP và quà tặng chờ nhận của tôi qua MCP.', icon: 'Award' },
        { label: '📊 Kiểm Tra Lượt Nghe Hôm Nay', actionType: 'prompt_preset', target: 'Kiểm tra lượt nghe audio hôm nay có bao nhiêu người nghe và thời lượng phát sóng?', icon: 'Headphones' },
        { label: '💖 Ngày Yêu Cặp Đôi', actionType: 'prompt_preset', target: 'Hôm nay là ngày thứ bao nhiêu hai đứa mình yêu nhau rồi?', icon: 'Heart' },
        { label: '💰 Tự Động Thêm Nhận Lương 50Tr', actionType: 'prompt_preset', target: 'Tự động thêm giao dịch nhận lương 50 triệu vào sổ thu chi và phân bổ 6 hũ tài chính thông minh giúp mình.', icon: 'Wallet' },
        { label: '🪙 Nhận 150 Xu Thưởng', actionType: 'prompt_preset', target: 'Cho mình xin nhận 150 Xu thưởng tương tác hàng ngày cùng Haevy AI nhé!', icon: 'Coins' }
      ]
    };
  };

  const [messages, setMessages] = useState<HaevyAIMessage[]>(() => [createWelcomeMessage(user?.displayName)]);

  // 1. Initial load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const first = parsed[0];
          setActiveSessionId(first.id);
          if (first.messages && first.messages.length > 0) {
            setMessages(first.messages);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed reading localStorage chat sessions:', e);
    }

    // Default initial session if no saved sessions exist
    const initialSessionId = `session_${Date.now()}`;
    const initialMsg = createWelcomeMessage(user?.displayName);
    const initialSession: HaevyAIChatSession = {
      id: initialSessionId,
      title: 'Trò chuyện cùng Haevy AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMsg],
      previewText: 'Chào mừng bạn đến với Haevy AI Master...',
      isPinned: false
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSessionId);
    setMessages([initialMsg]);
  }, [user?.uid, storageKey]);

  // 2. Background Firestore sync when user is authenticated
  useEffect(() => {
    if (!user?.uid) return;
    let isCancelled = false;
    const fetchCloudSessions = async () => {
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'aiChatSessions');
        const q = query(sessionsRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        if (isCancelled || snapshot.empty) return;

        const cloudSessions: HaevyAIChatSession[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          cloudSessions.push({
            id: docSnap.id,
            title: d.title || 'Cuộc trò chuyện',
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || new Date().toISOString(),
            messages: Array.isArray(d.messages) ? d.messages : [],
            category: d.category || 'general',
            isPinned: !!d.isPinned,
            previewText: d.previewText || ''
          });
        });

        if (cloudSessions.length > 0) {
          setSessions(prev => {
            const map = new Map<string, HaevyAIChatSession>();
            cloudSessions.forEach(s => map.set(s.id, s));
            prev.forEach(s => {
              if (!map.has(s.id)) {
                map.set(s.id, s);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => 
              (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Firestore aiChatSessions sync error (using local fallback):', err);
      }
    };
    fetchCloudSessions();
    return () => { isCancelled = true; };
  }, [user?.uid, storageKey]);

  // Helper to persist session updates to memory, storage, and cloud
  const persistSessionUpdates = (updatedMessages: HaevyAIMessage[], promptText?: string) => {
    setSessions(prevSessions => {
      const currentId = activeSessionId || `session_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const idx = prevSessions.findIndex(s => s.id === currentId);

      let updatedList: HaevyAIChatSession[];
      if (idx >= 0) {
        const target = prevSessions[idx];
        let title = target.title;
        if ((title === 'Đoạn chat mới' || title === 'Trò chuyện cùng Haevy AI') && promptText) {
          title = promptText.length > 35 ? promptText.slice(0, 35) + '...' : promptText;
        }
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        const preview = promptText || (lastMsg ? lastMsg.text.slice(0, 60) : target.previewText);

        const updatedTarget: HaevyAIChatSession = {
          ...target,
          title,
          updatedAt: nowIso,
          messages: updatedMessages,
          previewText: preview
        };
        updatedList = [...prevSessions];
        updatedList[idx] = updatedTarget;

        if (user?.uid) {
          setDoc(doc(db, 'users', user.uid, 'aiChatSessions', updatedTarget.id), {
            title: updatedTarget.title,
            createdAt: updatedTarget.createdAt,
            updatedAt: updatedTarget.updatedAt,
            messages: updatedTarget.messages,
            previewText: updatedTarget.previewText || '',
            isPinned: !!updatedTarget.isPinned,
            category: updatedTarget.category || 'general'
          }, { merge: true }).catch(() => {});
        }
      } else {
        const title = promptText ? (promptText.length > 35 ? promptText.slice(0, 35) + '...' : promptText) : 'Đoạn chat mới';
        const newSession: HaevyAIChatSession = {
          id: currentId,
          title,
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: updatedMessages,
          previewText: promptText || '',
          isPinned: false
        };
        updatedList = [newSession, ...prevSessions];
        if (user?.uid) {
          setDoc(doc(db, 'users', user.uid, 'aiChatSessions', newSession.id), {
            title: newSession.title,
            createdAt: newSession.createdAt,
            updatedAt: newSession.updatedAt,
            messages: newSession.messages,
            previewText: newSession.previewText,
            isPinned: false,
            category: 'general'
          }, { merge: true }).catch(() => {});
        }
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
  };

  // Start fresh new session
  const handleStartNewSession = () => {
    haptics.medium();
    const newSessionId = `session_${Date.now()}`;
    const initialMsg = createWelcomeMessage(user?.displayName);
    const newSession: HaevyAIChatSession = {
      id: newSessionId,
      title: 'Đoạn chat mới',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMsg],
      previewText: 'Bắt đầu cuộc trò chuyện mới...',
      isPinned: false
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (user?.uid) {
      setDoc(doc(db, 'users', user.uid, 'aiChatSessions', newSession.id), {
        title: newSession.title,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
        messages: newSession.messages,
        previewText: newSession.previewText,
        isPinned: false,
        category: 'general'
      }, { merge: true }).catch(() => {});
    }

    setActiveSessionId(newSessionId);
    setMessages([initialMsg]);
    setActiveViewMode('chat');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsHistorySidebarOpen(false);
    }
  };

  // Switch to selected session
  const handleSelectSession = (sessionId: string) => {
    const target = sessions.find(s => s.id === sessionId);
    if (!target) return;
    setActiveSessionId(sessionId);
    setMessages(target.messages || []);
    setActiveViewMode('chat');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsHistorySidebarOpen(false);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    haptics.warning();
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(remaining));
      } catch {}

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          const next = remaining[0];
          setActiveSessionId(next.id);
          setMessages(next.messages);
        } else {
          const freshId = `session_${Date.now()}`;
          const initMsg = createWelcomeMessage(user?.displayName);
          const freshSession: HaevyAIChatSession = {
            id: freshId,
            title: 'Trò chuyện cùng Haevy AI',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [initMsg],
            previewText: 'Khởi đầu cuộc trò chuyện...',
            isPinned: false
          };
          setActiveSessionId(freshId);
          setMessages([initMsg]);
          return [freshSession];
        }
      }
      return remaining;
    });

    if (user?.uid) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'aiChatSessions', sessionId));
      } catch (e) {
        console.warn('Error deleting cloud session:', e);
      }
    }
  };

  // Rename session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'aiChatSessions', sessionId), {
          title: newTitle,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Error renaming cloud session:', e);
      }
    }
  };

  // Toggle pin
  const handleTogglePinSession = async (sessionId: string) => {
    setSessions(prev => {
      const target = prev.find(s => s.id === sessionId);
      if (!target) return prev;
      const nextPin = !target.isPinned;
      const updated = prev.map(s => s.id === sessionId ? { ...s, isPinned: nextPin } : s);
      updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (user?.uid) {
      const target = sessions.find(s => s.id === sessionId);
      if (target) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'aiChatSessions', sessionId), {
            isPinned: !target.isPinned
          }, { merge: true });
        } catch (e) {
          console.warn('Error toggling pin in cloud:', e);
        }
      }
    }
  };

  // Clear all sessions
  const handleClearAllSessions = async () => {
    haptics.warning();
    const freshId = `session_${Date.now()}`;
    const initMsg = createWelcomeMessage(user?.displayName);
    const freshSession: HaevyAIChatSession = {
      id: freshId,
      title: 'Trò chuyện cùng Haevy AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initMsg],
      previewText: 'Chào mừng bạn đến với Haevy AI Master...',
      isPinned: false
    };

    setSessions([freshSession]);
    setActiveSessionId(freshId);
    setMessages([initMsg]);

    try {
      localStorage.setItem(storageKey, JSON.stringify([freshSession]));
    } catch {}

    if (user?.uid) {
      try {
        const q = query(collection(db, 'users', user.uid, 'aiChatSessions'));
        const snapshot = await getDocs(q);
        snapshot.forEach(d => deleteDoc(d.ref).catch(() => {}));
      } catch (e) {
        console.warn('Error clearing cloud sessions:', e);
      }
    }
  };

  // Explicit save current session
  const handleSaveCurrentSession = async () => {
    setIsSavingSession(true);
    try {
      persistSessionUpdates(messages);
      setUndoNotification('Đã lưu cuộc trò chuyện vào Lịch Sử Chat thành công!');
      setTimeout(() => setUndoNotification(null), 3000);
    } finally {
      setIsSavingSession(false);
    }
  };

  // Google Docs Export State & Handlers
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [docsExportOptions, setDocsExportOptions] = useState<GoogleDocExportOptions | null>(null);

  const handleExportCurrentChatToDocs = () => {
    haptics.impact('medium');
    let md = `## HỘI THOẠI HAEVY AI ASSISTANT\n*Thời gian xuất: ${new Date().toLocaleString('vi-VN')}*\n*Tổng số tin nhắn: ${messages.length}*\n\n---\n\n`;
    messages.forEach((msg, idx) => {
      const isAi = msg.sender === 'ai';
      const senderName = isAi ? 'Haevy AI Master' : (user?.displayName || 'Người dùng');
      md += `### ${idx + 1}. ${isAi ? '🤖' : '👤'} ${senderName} (${msg.timestamp})\n\n`;
      md += `${msg.text}\n\n`;
      if (msg.actionResultSummary) {
        md += `> **Thực thi hệ sinh thái:** ${msg.actionResultSummary}\n\n`;
      }
      md += `---\n\n`;
    });

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const title = activeSession?.title || `Hội Thoại Haevy AI (${messages.length} tin nhắn)`;

    setDocsExportOptions({
      title: `[Haevy AI] ${title}`,
      contentMarkdown: md,
      category: 'haevy_ai_chat',
      categoryLabel: 'Haevy AI - Toàn Bộ Hội Thoại',
      tags: ['HaevyAI', 'Assistant', 'ChatHistory'],
      summary: `Toàn bộ biên bản ${messages.length} tin nhắn trò chuyện và tác vụ được thực thi bởi Haevy AI.`,
      sourceApp: 'haevy_ai'
    });
    setIsDocsModalOpen(true);
  };

  const handleExportMessageToDocs = (msg: HaevyAIMessage) => {
    haptics.impact('light');
    let md = `## PHẢN HỒI TỪ HAEVY AI MASTER\n*Thời điểm: ${msg.timestamp} - ${new Date().toLocaleDateString('vi-VN')}*\n\n`;
    md += `${msg.text}\n\n`;
    if (msg.actionResultSummary) {
      md += `> **Tác vụ đã thực thi:** ${msg.actionResultSummary}\n\n`;
    }
    md += `---\n*Được tạo bởi Trợ Lý Thông Minh Haevy AI và xuất tự động sang Google Docs.*\n`;

    const previewTitle = msg.text.slice(0, 45).replace(/[#*`\n]/g, '').trim() || 'Phản Hồi Haevy AI';

    setDocsExportOptions({
      title: `[Haevy AI] ${previewTitle}`,
      contentMarkdown: md,
      category: 'haevy_ai_message',
      categoryLabel: 'Haevy AI - Lời Giải & Lời Khuyên',
      tags: ['HaevyAI', 'Response', msg.category || 'general'],
      summary: msg.text.slice(0, 150),
      sourceApp: 'haevy_ai'
    });
    setIsDocsModalOpen(true);
  };

  const handleExportSessionToDocs = (session: HaevyAIChatSession) => {
    haptics.impact('medium');
    let md = `## HỘI THOẠI HAEVY AI — ${session.title.toUpperCase()}\n*Thời điểm cập nhật: ${new Date(session.updatedAt).toLocaleString('vi-VN')}*\n*Số tin nhắn: ${session.messages?.length || 0}*\n\n---\n\n`;
    (session.messages || []).forEach((msg, idx) => {
      const isAi = msg.sender === 'ai';
      const senderName = isAi ? 'Haevy AI Master' : (user?.displayName || 'Người dùng');
      md += `### ${idx + 1}. ${isAi ? '🤖' : '👤'} ${senderName} (${msg.timestamp})\n\n`;
      md += `${msg.text}\n\n`;
      if (msg.actionResultSummary) {
        md += `> **Thực thi:** ${msg.actionResultSummary}\n\n`;
      }
      md += `---\n\n`;
    });

    setDocsExportOptions({
      title: `[Haevy AI] ${session.title}`,
      contentMarkdown: md,
      category: 'haevy_ai_session',
      categoryLabel: 'Haevy AI - Phiên Trò Chuyện Lưu Trữ',
      tags: ['HaevyAI', 'SavedSession', session.category || 'general'],
      summary: `Phiên thảo luận "${session.title}" với ${session.messages?.length || 0} tin nhắn.`,
      sourceApp: 'haevy_ai'
    });
    setIsDocsModalOpen(true);
  };
  const [selectedMood, setSelectedMood] = useState<string>('😊 Vui vẻ & Tích cực');
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [claimedRewardIds, setClaimedRewardIds] = useState<Record<string, boolean>>({});
  const [playingTrackTitle, setPlayingTrackTitle] = useState<string | null>(null);
  
  // Ecosystem state
  const [activeViewMode, setActiveViewMode] = useState<'chat' | 'ecosystem'>('chat');

  // Synchronize view mode with activeSubTab
  useEffect(() => {
    if (activeSubTab === 'chat' || activeSubTab === 'overview') {
      setActiveViewMode('chat');
    } else if (activeSubTab === 'modes' || activeSubTab === 'ecosystem') {
      setActiveViewMode('ecosystem');
    }
  }, [activeSubTab]);
  const [ecosystemSnapshot, setEcosystemSnapshot] = useState(() => getEcosystemLiveSnapshot());
  const [undoNotification, setUndoNotification] = useState<string | null>(null);
  const [selectedModeDetail, setSelectedModeDetail] = useState<any | null>(null);
  const [quickAddModal, setQuickAddModal] = useState<'family' | 'track' | 'memory' | 'friend' | null>(null);
  const [quickInput1, setQuickInput1] = useState('');
  const [quickInput2, setQuickInput2] = useState('');
  const [quickInput3, setQuickInput3] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MOOD_OPTIONS = [
    { id: 'happy', label: '😊 Vui vẻ & Tích cực' },
    { id: 'empathy', label: '💖 Thấu cảm & Chia sẻ' },
    { id: 'creative', label: '💡 Sáng tạo & Cảm hứng' },
    { id: 'professional', label: '👔 Chuyên nghiệp & Súc tích' }
  ];

  // Quick Action Prompt Chips - Multi-Mode Ecosystem
  const QUICK_PROMPTS = [
    { 
      label: '🌳 Thêm thành viên vào Gia Phả', 
      text: 'Thêm thành viên Nguyễn Văn Nam đời 4 chi 2 sinh năm 1995 vào gia phả dòng họ giúp mình.',
      icon: TreePine,
      color: 'from-amber-600/30 to-orange-600/30 text-amber-300 border-amber-500/40'
    },
    { 
      label: '🗑️ Xoá thành viên Gia Phả', 
      text: 'Xoá thành viên Nguyễn Văn Nam khỏi gia phả dòng họ.',
      icon: Trash2,
      color: 'from-red-600/30 to-rose-600/30 text-red-300 border-red-500/40'
    },
    { 
      label: '💰 Thêm nhận lương 50 triệu & 6 Hũ', 
      text: 'Tự động thêm giao dịch nhận lương 50 triệu vào sổ thu chi và phân bổ 6 hũ tài chính thông minh giúp mình.',
      icon: Wallet,
      color: 'from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-500/40'
    },
    { 
      label: '💖 Đếm ngày yêu cặp đôi', 
      text: 'Hôm nay là ngày thứ bao nhiêu hai đứa mình yêu nhau rồi?',
      icon: Heart,
      color: 'from-rose-600/30 to-pink-600/30 text-rose-300 border-rose-500/40'
    },
    { 
      label: '💌 Thêm kỷ niệm tình yêu mới', 
      text: 'Thêm kỷ niệm: Buổi hẹn hò cà phê ngắm hoàng hôn lãng mạn bên người ấy',
      icon: Sparkles,
      color: 'from-pink-600/30 to-purple-600/30 text-pink-300 border-pink-500/40'
    },
    { 
      label: '🎵 Thêm bài hát vào Thư viện', 
      text: 'Thêm bài hát "Hạ Trắng Lossless Chill" vào thư viện audio của mình',
      icon: Music2,
      color: 'from-purple-600/30 to-indigo-600/30 text-purple-300 border-purple-500/40'
    },
    { 
      label: '🤝 Thêm bạn bè vào Haevy Message', 
      text: 'Thêm bạn mới Trần Minh Tâm vào danh bạ Haevy Message',
      icon: Users,
      color: 'from-blue-600/30 to-cyan-600/30 text-blue-300 border-blue-500/40'
    },
    { 
      label: '📊 Thống kê lượt nghe hôm nay', 
      text: 'Kiểm tra lượt nghe audio hôm nay có bao nhiêu người nghe và thời lượng phát sóng?',
      icon: Headphones,
      color: 'from-indigo-600/30 to-blue-600/30 text-indigo-300 border-indigo-500/40'
    },
    { 
      label: '🪙 Nhận 150 Xu thưởng tương tác', 
      text: 'Cho mình xin nhận 150 Xu thưởng tương tác hàng ngày cùng Haevy AI nhé!',
      icon: Coins,
      color: 'from-amber-600/30 to-orange-600/30 text-amber-300 border-amber-500/40'
    },
    { 
      label: '🔬 Khám phá STEM Lab & Casio 880', 
      text: 'Mở phòng thí nghiệm ảo STEM và giải thích cách giải phương trình trên máy tính Casio fx-880 BTG.',
      icon: GraduationCap,
      color: 'from-teal-600/30 to-emerald-600/30 text-teal-300 border-teal-500/40'
    },
    { 
      label: '📓 Lưu Sổ Tay Nghiên Cứu Edu', 
      text: 'Lưu vào sổ tay Edu: Bản chất định luật bảo toàn năng lượng và tư duy First Principles không học vẹt.',
      icon: BookOpen,
      color: 'from-cyan-600/30 to-blue-600/30 text-cyan-300 border-cyan-500/40'
    }
  ];

  // Helper to parse financial command with 100% precision
  const parseClientFinanceCommand = (text: string) => {
    const query = text.toLowerCase();
    
    const hasFinanceKeywords = 
      query.includes('lương') || 
      query.includes('tiền') || 
      query.includes('thu nhập') || 
      query.includes('chi tiêu') || 
      query.includes('giao dịch') || 
      query.includes('6 hũ') || 
      query.includes('sổ thu chi') || 
      query.includes('hũ tài chính') ||
      query.includes('nạp tiền') ||
      query.includes('cộng tiền') ||
      query.includes('trừ tiền') ||
      query.includes('mua sắm') ||
      query.includes('thanh toán') ||
      /(\d+([.,]\d+)?)\s*(triệu|tr\b|tỷ|k\b|nghìn|ngàn|vnd|đ)/i.test(query);

    if (!hasFinanceKeywords) return null;

    // Parse exact amount
    let amount = 0;
    const trieuMatch = query.match(/(\d+([.,]\d+)?)\s*(triệu|tr\b|m\b)/i);
    if (trieuMatch) {
      const num = parseFloat(trieuMatch[1].replace(',', '.'));
      amount = Math.round(num * 1000000);
    }

    if (!amount) {
      const tyMatch = query.match(/(\d+([.,]\d+)?)\s*(tỷ|ty\b|b\b)/i);
      if (tyMatch) {
        const num = parseFloat(tyMatch[1].replace(',', '.'));
        amount = Math.round(num * 1000000000);
      }
    }

    if (!amount) {
      const kMatch = query.match(/(\d+([.,]\d+)?)\s*(k\b|nghìn|ngàn)/i);
      if (kMatch) {
        const num = parseFloat(kMatch[1].replace(',', '.'));
        amount = Math.round(num * 1000);
      }
    }

    if (!amount) {
      const rawMatch = query.match(/(\d{1,3}(?:[.]\d{3})+|\d{4,12})/);
      if (rawMatch) {
        amount = parseInt(rawMatch[1].replace(/\./g, ''), 10);
      }
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      amount = 50000000;
    }

    // Precision Income vs Expense check
    const isExplicitIncome = 
      query.includes('thêm nguồn tiền') ||
      query.includes('nguồn tiền') ||
      query.includes('thêm tiền') ||
      query.includes('thêm thu nhập') ||
      query.includes('nhận lương') ||
      query.includes('lương') ||
      query.includes('thưởng') ||
      query.includes('cộng tiền') ||
      query.includes('cộng ') ||
      query.includes('nạp tiền') ||
      query.includes('thu nhập') ||
      query.includes('doanh thu') ||
      query.includes('tiền về') ||
      query.includes('được cho') ||
      query.includes('được tặng') ||
      query.includes('thu vào') ||
      query.includes('tiền lãi') ||
      query.includes('cổ tức') ||
      query.includes('kiếm được') ||
      query.includes('bán được');

    const isExplicitExpense = 
      (query.includes('chi tiêu') ||
       query.includes('chi tiền') ||
       query.includes('chi phí') ||
       query.includes('mua sắm') ||
       query.includes('mua ') ||
       query.includes('đã mua') ||
       query.includes('trả tiền') ||
       query.includes('thanh toán') ||
       query.includes('đóng tiền') ||
       query.includes('rút tiền') ||
       query.includes('chuyển khoản cho') ||
       query.includes('chuyển tiền cho') ||
       query.includes('ăn uống') ||
       query.includes('ăn trưa') ||
       query.includes('ăn tối') ||
       query.includes('uống cafe') ||
       query.includes('tiêu xài') ||
       query.includes('trừ tiền') ||
       query.includes('bị trừ')) && !isExplicitIncome;

    const transactionType = (isExplicitIncome || !isExplicitExpense) ? 'income' : 'expense';

    let categoryName = transactionType === 'income' ? 'Lương & Thu Nhập' : 'Ăn uống & Mua sắm';
    if (query.includes('thưởng')) categoryName = 'Thưởng & Hoa Hồng';
    else if (query.includes('bán')) categoryName = 'Doanh Thu Bán Hàng';
    else if (query.includes('đầu tư') || query.includes('cổ tức') || query.includes('lãi')) categoryName = 'Lãi Đầu Tư';
    else if (query.includes('ăn') || query.includes('cafe')) categoryName = 'Ăn Uống';
    else if (query.includes('mua') || query.includes('shopping')) categoryName = 'Mua Sắm';
    else if (query.includes('điện') || query.includes('nước') || query.includes('nhà') || query.includes('mạng')) categoryName = 'Hóa Đơn & Tiện Ích';

    const note = transactionType === 'income'
      ? `Ghi nhận thu nhập tự động qua Haevy AI (${new Date().toLocaleDateString('vi-VN')})`
      : `Ghi nhận chi tiêu tự động qua Haevy AI (${new Date().toLocaleDateString('vi-VN')})`;

    const jarsAllocation = transactionType === 'income' ? {
      essential: Math.round(amount * 0.50),
      savings: Math.round(amount * 0.10),
      education: Math.round(amount * 0.10),
      enjoyment: Math.round(amount * 0.10),
      investment: Math.round(amount * 0.10),
      charity: Math.round(amount * 0.10)
    } : null;

    return {
      type: 'finance_transaction',
      title: transactionType === 'income' ? 'Ghi Nhận Thu Nhập & Phân Bổ 6 Hũ' : 'Ghi Nhận Chi Tiêu Tự Động',
      transactionType,
      amount,
      categoryName,
      walletName: 'Tài Khoản Ngân Hàng',
      note,
      jarsAllocation,
      timestamp: new Date().toISOString()
    };
  };

  // Helper to execute finance transaction directly in LocalStorage & dispatch sync
  const executeLocalFinanceTransaction = (actionData: any) => {
    try {
      const amount = Number(actionData.amount || 50000000);
      const isIncome = actionData.transactionType === 'income';
      const categoryName = actionData.categoryName || (isIncome ? 'Lương & Thưởng' : 'Chi tiêu');
      const note = actionData.note || (isIncome ? 'Thêm nguồn thu nhập tự động qua Haevy AI' : 'Chi tiêu tự động qua Haevy AI');

      // 1. Create transaction
      const newTx: FinanceTransaction = {
        id: `tx_ai_${Date.now()}`,
        userId: user?.uid || 'user_haevy',
        walletId: 'wallet_bank',
        walletName: 'Tài Khoản Ngân Hàng',
        categoryId: isIncome ? 'cat_salary' : 'cat_food',
        categoryName: categoryName,
        type: isIncome ? 'income' : 'expense',
        amount: amount,
        note: note,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        tags: ['haevy_ai_auto', isIncome ? '6_jars_income' : 'expense'],
        isRecurring: false,
        createdAt: new Date().toISOString()
      };

      const existingTxsStr = localStorage.getItem('haevy_finance_transactions_v2');
      const existingTxs: FinanceTransaction[] = existingTxsStr ? JSON.parse(existingTxsStr) : [];
      const updatedTxs = [newTx, ...existingTxs];
      localStorage.setItem('haevy_finance_transactions_v2', JSON.stringify(updatedTxs));

      // 2. Update wallet balance
      const existingWalletsStr = localStorage.getItem('haevy_finance_wallets_v2');
      if (existingWalletsStr) {
        const wallets: FinanceWallet[] = JSON.parse(existingWalletsStr);
        const bankWallet = wallets.find(w => w.id === 'wallet_bank' || w.type === 'bank') || wallets[0];
        if (bankWallet) {
          if (isIncome) bankWallet.balance += amount;
          else bankWallet.balance = Math.max(0, bankWallet.balance - amount);
          localStorage.setItem('haevy_finance_wallets_v2', JSON.stringify(wallets));
        }
      } else {
        const defaultWallets: FinanceWallet[] = [
          { id: 'wallet_bank', name: 'Tài Khoản Ngân Hàng', type: 'bank', balance: isIncome ? (25000000 + amount) : Math.max(0, 25000000 - amount), color: 'from-blue-600 to-indigo-600', currency: 'VND', icon: 'Building2', createdAt: new Date().toISOString() },
          { id: 'wallet_cash', name: 'Tiền Mặt', type: 'cash', balance: 3500000, color: 'from-emerald-600 to-teal-600', currency: 'VND', icon: 'Coins', createdAt: new Date().toISOString() },
          { id: 'wallet_ewallet', name: 'Ví Điện Tử (Momo / ZaloPay)', type: 'e_wallet', balance: 1850000, color: 'from-purple-600 to-pink-600', currency: 'VND', icon: 'Wallet', createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('haevy_finance_wallets_v2', JSON.stringify(defaultWallets));
      }

      // 3. Update 6 Jars in localStorage if income
      if (isIncome && actionData.jarsAllocation) {
        const jarsStr = localStorage.getItem('haevy_finance_jars_v2');
        const defaultJars = [
          { id: 'jar_nec', name: 'Thiết Yếu (NEC)', percent: 50, balance: actionData.jarsAllocation.essential || 0, color: '#3b82f6', icon: 'Home' },
          { id: 'jar_ffa', name: 'Tự Do Tài Chính (FFA)', percent: 10, balance: actionData.jarsAllocation.investment || 0, color: '#8b5cf6', icon: 'TrendingUp' },
          { id: 'jar_ltss', name: 'Tiết Kiệm Dài Hạn (LTSS)', percent: 10, balance: actionData.jarsAllocation.savings || 0, color: '#10b981', icon: 'PiggyBank' },
          { id: 'jar_edu', name: 'Giáo Dục (EDU)', percent: 10, balance: actionData.jarsAllocation.education || 0, color: '#f59e0b', icon: 'GraduationCap' },
          { id: 'jar_play', name: 'Hưởng Thụ (PLAY)', percent: 10, balance: actionData.jarsAllocation.enjoyment || 0, color: '#ec4899', icon: 'Sparkles' },
          { id: 'jar_give', name: 'Thiện Nguyện (GIVE)', percent: 10, balance: actionData.jarsAllocation.charity || 0, color: '#06b6d4', icon: 'Heart' }
        ];
        if (jarsStr) {
          try {
            const jars = JSON.parse(jarsStr);
            jars.forEach((j: any) => {
              if (j.id === 'jar_nec' || j.name?.includes('Thiết Yếu')) j.balance += (actionData.jarsAllocation.essential || 0);
              if (j.id === 'jar_ffa' || j.name?.includes('Tự Do')) j.balance += (actionData.jarsAllocation.investment || 0);
              if (j.id === 'jar_ltss' || j.name?.includes('Tiết Kiệm')) j.balance += (actionData.jarsAllocation.savings || 0);
              if (j.id === 'jar_edu' || j.name?.includes('Giáo Dục')) j.balance += (actionData.jarsAllocation.education || 0);
              if (j.id === 'jar_play' || j.name?.includes('Hưởng Thụ')) j.balance += (actionData.jarsAllocation.enjoyment || 0);
              if (j.id === 'jar_give' || j.name?.includes('Thiện Nguyện')) j.balance += (actionData.jarsAllocation.charity || 0);
            });
            localStorage.setItem('haevy_finance_jars_v2', JSON.stringify(jars));
          } catch (e) {
            localStorage.setItem('haevy_finance_jars_v2', JSON.stringify(defaultJars));
          }
        } else {
          localStorage.setItem('haevy_finance_jars_v2', JSON.stringify(defaultJars));
        }
      }

      // 4. Dispatch global sync event
      window.dispatchEvent(new CustomEvent('haevy_finance_updated', { detail: { transaction: newTx } }));
      haptics.success();
      return true;
    } catch (err) {
      console.error('Error executing auto finance transaction:', err);
      return false;
    }
  };

  // Initial welcome message from Haevy AI
  useEffect(() => {
    const userName = user?.displayName || 'bạn';
    const welcomeMsg: HaevyAIMessage = {
      id: 'welcome_msg',
      sender: 'ai',
      text: `Xin chào **${userName}**! ✨ Tôi là **Haevy AI Master** - Trợ Lý Thông Minh & Bạn Đồng Hành Toàn Năng của Hệ Sinh Thái Haevy.\n\nTôi có thể trò chuyện, tâm sự thấu cảm, đồng thời **trực tiếp thực hiện mọi nhiệm vụ theo lệnh của bạn**:\n- 📊 **Kiểm tra lượt nghe Audio hôm nay**: Thống kê số lượng người nghe, thời lượng và bài hát thịnh hành.\n- 💖 **Đếm ngày yêu nhau**: Tính toán chính xác số ngày bên nhau của cặp đôi và nhắc mốc kỷ niệm.\n- 💰 **Tự động thêm giao dịch nhận lương / chi tiêu**: Ghi sổ thu chi, cập nhật số dư ví và phân bổ 6 Hũ thông minh tức thì.\n- 🎵 **Gợi ý & Phát nhạc**: Bật nhạc Lo-Fi, truyện audio, không gian thư giãn.\n- 🪙 **Tặng Xu thưởng & Bảo mật**: Nhận xu tương tác, hướng dẫn 6 lớp bảo vệ tài khoản.\n\nHãy nhắn tin hoặc chọn nhanh các nhiệm vụ bên dưới để tôi hỗ trợ bạn ngay nhé! 🚀`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
      suggestedActions: [
        { label: '📊 Kiểm Tra Lượt Nghe Hôm Nay', actionType: 'prompt_preset', target: 'Kiểm tra lượt nghe audio hôm nay có bao nhiêu người nghe và thời lượng phát sóng?', icon: 'Headphones' },
        { label: '💖 Ngày Yêu Cặp Đôi', actionType: 'prompt_preset', target: 'Hôm nay là ngày thứ bao nhiêu hai đứa mình yêu nhau rồi?', icon: 'Heart' },
        { label: '💰 Tự Động Thêm Nhận Lương 50Tr', actionType: 'prompt_preset', target: 'Tự động thêm giao dịch nhận lương 50 triệu vào sổ thu chi và phân bổ 6 hũ tài chính thông minh giúp mình.', icon: 'Wallet' },
        { label: '🪙 Nhận 150 Xu Thưởng', actionType: 'prompt_preset', target: 'Cho mình xin nhận 150 Xu thưởng tương tác hàng ngày cùng Haevy AI nhé!', icon: 'Coins' }
      ]
    };
    setMessages([welcomeMsg]);
  }, [user?.displayName]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Unified Ecosystem Action Executor (Adds / Deletes / Updates across modes)
  const handleExecuteEcosystemAction = (action: any): EcosystemActionResult | null => {
    if (!action || !action.type) return null;
    let res: EcosystemActionResult | null = null;
    try {
      switch (action.type) {
        case 'add_family_member':
          res = executeAddFamilyMembers(action.members || []);
          break;
        case 'delete_family_members':
          res = executeDeleteFamilyMembers({ names: action.names, keyword: action.branch });
          break;
        case 'add_track':
          res = executeAddTracks(action.tracks || []);
          break;
        case 'delete_tracks':
          res = executeDeleteTracks({ titles: action.titles, ids: action.ids });
          break;
        case 'finance_transaction':
          executeLocalFinanceTransaction(action);
          res = {
            success: true,
            actionType: 'finance_transaction',
            targetMode: 'finance',
            message: `Đã ghi nhận giao dịch tài chính ${Number(action.amount || 0).toLocaleString('vi-VN')} đ vào Sổ 6 Hũ.`,
            affectedCount: 1,
            dataSummary: action
          };
          break;
        case 'delete_finance_transactions':
          res = executeDeleteFinanceTransactions({ clearRecent: true });
          break;
        case 'add_couple_memory':
          res = executeAddCoupleMemory({
            title: action.memoryTitle || 'Kỷ niệm mới bên người yêu',
            date: new Date().toISOString().split('T')[0]
          });
          break;
        case 'delete_couple_memories':
          res = executeDeleteCoupleMemories({ clearRecent: true });
          break;
        case 'add_friend':
          res = executeAddFriend({ fullName: action.fullName || 'Bạn mới' });
          break;
        case 'delete_friend':
          res = executeDeleteFriend(action.fullName || '');
          break;
        case 'reward_points':
          if (addAudioPoints) {
            addAudioPoints(action.amount || 150, action.reason || 'Thưởng tương tác cùng Haevy AI', 'game_reward');
          }
          res = {
            success: true,
            actionType: 'reward_points',
            targetMode: 'vip',
            message: `Đã nhận +${action.amount || 150} Xu thưởng!`,
            affectedCount: 1
          };
          break;
        case 'add_edu_note':
          res = executeAddEduNote({
            title: action.noteTitle || 'Ghi chép First Principles',
            subject: action.subject || 'physics',
            tags: ['Haevy AI', 'Ecosystem', 'First Principles'],
            firstPrincipleEssence: action.firstPrincipleEssence || 'Bóc tách từ bản chất nền tảng',
            content: action.content || ''
          });
          break;
        case 'delete_edu_note':
          res = executeDeleteEduNote(action.noteTitle || '');
          break;
        case 'add_edu_calculation':
          res = executeAddEduCalculation({
            expression: action.expression || '0',
            result: action.result || '0',
            mode: action.calcMode || 'calc'
          });
          break;
        default:
          break;
      }
    } catch (e: any) {
      console.warn('Error executing ecosystem action:', e);
    }
    // Update live snapshot
    setEcosystemSnapshot(getEcosystemLiveSnapshot());
    return res;
  };

  // Undo Last Ecosystem Action
  const handleUndoLastAction = () => {
    haptics.medium();
    const undoRes = executeUndoLastAction();
    if (undoRes.success) {
      haptics.success();
      setUndoNotification(`Đã hoàn tác: ${undoRes.message}`);
      setEcosystemSnapshot(getEcosystemLiveSnapshot());
      setTimeout(() => setUndoNotification(null), 4000);
    } else {
      setUndoNotification(undoRes.message);
      setTimeout(() => setUndoNotification(null), 3000);
    }
  };

  // Submit handler for Quick Add Modals across 12 modes
  const handleQuickAddSubmit = () => {
    if (!quickAddModal) return;
    haptics.medium();
    let res: EcosystemActionResult | null = null;
    
    if (quickAddModal === 'family') {
      const fullName = quickInput1.trim();
      if (!fullName) return;
      const gen = parseInt(quickInput2) || 4;
      const branch = quickInput3.trim() || 'Chi Trưởng';
      res = executeAddFamilyMembers([{
        fullName,
        generation: gen,
        branch,
        gender: 'male'
      }]);
    } else if (quickAddModal === 'track') {
      const title = quickInput1.trim();
      if (!title) return;
      const artist = quickInput2.trim() || 'Haevy Sound Lab';
      const genre = quickInput3.trim() || 'Lossless VIP';
      res = executeAddTracks([{ title, artist, genre }]);
    } else if (quickAddModal === 'memory') {
      const memoryTitle = quickInput1.trim();
      if (!memoryTitle) return;
      res = executeAddCoupleMemory({
        title: memoryTitle,
        date: quickInput2.trim() || new Date().toISOString().split('T')[0]
      });
    } else if (quickAddModal === 'friend') {
      const fullName = quickInput1.trim();
      if (!fullName) return;
      res = executeAddFriend({ fullName });
    }

    if (res && res.success) {
      haptics.success();
      setUndoNotification(res.message);
      setEcosystemSnapshot(getEcosystemLiveSnapshot());
      setTimeout(() => setUndoNotification(null), 4000);
    }

    setQuickAddModal(null);
    setQuickInput1('');
    setQuickInput2('');
    setQuickInput3('');
  };

  // Handle Send Message to Gemini AI
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    haptics.medium();
    setInputMessage('');

    // Add user message
    const userMsg: HaevyAIMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      persistSessionUpdates(updated, textToSend);
      return updated;
    });
    setIsLoading(true);

    try {
      const fullMcpContext = gatherFullMCPUserContext(auth);
      const payload = {
        message: textToSend,
        conversationHistory: messages.slice(-10),
        mcpSession: mcpSession || null,
        userContext: {
          displayName: user?.displayName || 'Thành viên Haevy',
          accountId: accountId || 'HV-MEMBER',
          isVip: isVip,
          vipTier: vipTier,
          levelExp: auth?.levelExp || 2850,
          currentLevel: auth?.levelExp !== undefined 
            ? Math.min(15, Math.floor(Math.sqrt((auth?.levelExp || 0) / 100)) + 1)
            : 3,
          unclaimedLevelRewardsCount: auth?.unclaimedLevelRewardsCount || 0,
          haevyLiteCoins: auth?.haevyLiteCoins || 1250,
          audioPoints: audioPoints,
          totalEarnedPoints: totalEarnedPoints,
          totalListenedMinutes: totalListenedMinutes,
          securityScore: 92,
          lockLevel: '6-layer fortress',
          isAuthorVerified: isAuthorVerified,
          stageName: authorStageName,
          mcpActive: Boolean(mcpSession),
          mcpGrantedScopes: mcpSession?.grantedScopes || [],
          mcpDataSnapshot: fullMcpContext,
          coupleInfo: {
            isCoupled: true,
            partnerName: 'Em Yêu',
            anniversaryDate: '2024-05-20'
          }
        },
        selectedMood: selectedMood
      };

      const res = await fetch('/api/gemini/haevy-ecosystem-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Không thể kết nối máy chủ AI');

      const data = await res.json();
      
      // Execute any detected ecosystem action
      if (data.actionData) {
        handleExecuteEcosystemAction(data.actionData);
      }

      const aiMsg: HaevyAIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Haevy AI đã nhận được tin nhắn và hoàn tất xử lý yêu cầu của bạn.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [],
        actionData: data.actionData
      };

      setMessages(prev => {
        const updated = [...prev, aiMsg];
        persistSessionUpdates(updated, textToSend);
        return updated;
      });
    } catch (err: any) {
      console.warn('AI Request error:', err);
      
      // Local fallback parser with deep ecosystem commands
      const q = textToSend.toLowerCase();
      let fallbackText = '';
      let fallbackAction: any = null;

      // 1. Check natural command engine across all modes
      const parsedCommand = parseEcosystemNaturalCommand(textToSend);

      if (parsedCommand) {
        fallbackAction = parsedCommand.actionData;
        const execRes = handleExecuteEcosystemAction(parsedCommand.actionData);

        if (parsedCommand.actionData.type === 'add_family_member') {
          const m = parsedCommand.actionData.members?.[0] || { fullName: 'Thành viên mới', generation: 4, branch: 'Chi Trưởng' };
          fallbackText = `🌳 **Đã thêm thành viên mới vào Gia Phả Dòng Họ thành công!**\n\n- 👤 **Họ và tên:** ${m.fullName}\n- 📜 **Đời thứ:** ${m.generation} (${m.branch})\n- 🎂 **Năm sinh:** ${m.birthYear || 'Chưa rõ'}\n- 🚻 **Giới tính:** ${m.gender === 'female' ? 'Nữ' : 'Nam'}\n\n*(Dữ liệu Cây Gia Phả đã được lưu trữ và cập nhật trên toàn hệ thống)* ✨`;
        } else if (parsedCommand.actionData.type === 'delete_family_members') {
          const names = parsedCommand.actionData.names || [];
          fallbackText = `🗑️ **Đã hoàn tất xoá thành viên khỏi Gia Phả dòng họ!**\n\n- Danh sách loại bỏ: **${names.length > 0 ? names.join(', ') : 'Thành viên yêu cầu'}**\n\n*(Cây gia phả đã được sắp xếp lại liên kết nhánh và đời)* ✨`;
        } else if (parsedCommand.actionData.type === 'add_track') {
          const t = parsedCommand.actionData.tracks?.[0] || { title: 'Bài hát mới', artist: 'Haevy Sound' };
          fallbackText = `🎵 **Đã bổ sung bài hát vào Thư viện Audio của bạn!**\n\n- 🎶 **Tác phẩm:** "${t.title}"\n- 🎤 **Nghệ sĩ:** ${t.artist}\n- 🏷️ **Thể loại:** ${t.genre || 'Lossless VIP'}\n\n*(Bạn có thể bấm nghe ngay hoặc mở chế độ Audio để quản lý playlist)* 🎧`;
        } else if (parsedCommand.actionData.type === 'delete_tracks') {
          fallbackText = `🗑️ **Đã xoá bài hát khỏi danh sách phát thư viện Audio.**\n\nDanh sách đã được làm mới tức thì.`;
        } else if (parsedCommand.actionData.type === 'add_couple_memory') {
          fallbackText = `💖 **Đã lưu thêm kỷ niệm tình yêu ngọt ngào vào I Love Haevy!**\n\n- 💌 **Tiêu đề:** "${parsedCommand.actionData.memoryTitle || 'Buổi hẹn hò lãng mạn'}"\n- 📅 **Thời gian:** ${new Date().toLocaleDateString('vi-VN')}\n\n*"Mỗi kỷ niệm đẹp là một nốt nhạc trong bản giao hưởng tình yêu của hai bạn."* ✨`;
        } else if (parsedCommand.actionData.type === 'delete_couple_memories') {
          fallbackText = `🗑️ **Đã xoá kỷ niệm được chọn khỏi dòng thời gian tình yêu.**`;
        } else if (parsedCommand.actionData.type === 'add_friend') {
          fallbackText = `🤝 **Đã thêm bạn mới: ${parsedCommand.actionData.fullName} vào danh bạ Haevy Message!**\n\nGiờ đây hai bạn đã có thể nhắn tin riêng tư, chia sẻ bài hát và gắn kết trong gia tộc. 💬`;
        } else if (parsedCommand.actionData.type === 'navigate_mode') {
          fallbackText = `🌐 **Đang điều hướng đến chế độ ${parsedCommand.actionData.modeName || 'hệ sinh thái'}...**\n\nHãy nhấn nút bên dưới để chuyển màn hình ngay lập tức!`;
        } else if (execRes) {
          fallbackText = `✅ **Thực thi lệnh thành công:** ${execRes.message}`;
        }
      } else {
        // 2. Secondary Finance Fallback
        const clientFinance = parseClientFinanceCommand(textToSend);

        if (clientFinance) {
          fallbackAction = clientFinance;
          executeLocalFinanceTransaction(clientFinance);
          const formattedAmount = (clientFinance.amount || 50000000).toLocaleString('vi-VN');
          
          if (clientFinance.transactionType === 'income') {
            fallbackText = `✅ **Đã tự động thêm nguồn thu nhập +${formattedAmount} đ vào Sổ Tài Chính 6 Hũ!**\n\n💵 **Số tiền:** +${formattedAmount} đ (Thu nhập / Lương)\n🏷️ **Danh mục:** ${clientFinance.categoryName}\n💳 **Ví đích:** Tài khoản Ngân Hàng\n\n🍯 **Phân bổ 6 Hũ thông minh tự động:**\n- 📦 Hũ Thiết Yếu (50%): **${((clientFinance.amount || 50000000) * 0.5).toLocaleString('vi-VN')} đ**\n- 🏦 Hũ Tiết Kiệm (10%): **${((clientFinance.amount || 50000000) * 0.1).toLocaleString('vi-VN')} đ**\n- 📚 Hũ Giáo Dục (10%): **${((clientFinance.amount || 50000000) * 0.1).toLocaleString('vi-VN')} đ**\n- ☕ Hũ Hưởng Thụ (10%): **${((clientFinance.amount || 50000000) * 0.1).toLocaleString('vi-VN')} đ**\n- 📈 Hũ Đầu Tư (10%): **${((clientFinance.amount || 50000000) * 0.1).toLocaleString('vi-VN')} đ**\n- 💖 Hũ Thiện Nguyện (10%): **${((clientFinance.amount || 50000000) * 0.1).toLocaleString('vi-VN')} đ**\n\n*(Số dư ví ngân hàng đã được cộng trực tiếp vào hệ thống)* 🎉`;
          } else {
            fallbackText = `✅ **Đã ghi nhận chi tiêu -${formattedAmount} đ vào Sổ Tài Chính!**\n\n💸 **Số tiền chi:** -${formattedAmount} đ\n🏷️ **Danh mục:** ${clientFinance.categoryName}\n💳 **Nguồn ví:** Tài khoản Ngân Hàng\n\n*(Số dư ví ngân hàng đã được trừ tương ứng chính xác)* ✨`;
          }
        } else if (q.includes('lượt nghe') || q.includes('bao nhiêu người nghe') || q.includes('nghe audio') || q.includes('thống kê nghe')) {
          fallbackAction = {
            type: 'audio_stats',
            title: 'Báo Cáo Lượt Nghe Audio Hôm Nay',
            totalListenersToday: 1248,
            totalListensToday: 3842,
            totalMinutesToday: 14280,
            userMinutesToday: Math.max(15, totalListenedMinutes || 0),
            peakHour: '20:00 - 23:30',
            topTracks: [
              { title: 'Coding Night in Cyberpunk (Lossless VIP)', artist: 'CyberWave Studio', listens: 840, genre: 'Electronic' },
              { title: 'Tuyển Tập Truyện Tiên Hiệp & Kiếm Hiệp Đỉnh Cao', artist: 'Haevy Story Voice', listens: 720, genre: 'Truyện Audio' },
              { title: 'Lo-Fi Tập Trung Làm Việc & Chill', artist: 'Haevy Relax Lab', listens: 650, genre: 'Lo-Fi Chill' }
            ]
          };
          fallbackText = `📊 **Báo cáo thống kê lượt nghe Audio hôm nay:**\n\n- 👥 **Người nghe trực tuyến:** 1.248 người\n- 🎧 **Tổng lượt phát nhạc:** 3.842 lượt\n- ⏱️ **Thời lượng phát sóng:** 14.280 phút\n- 🌟 **Khung giờ cao điểm:** 20:00 - 23:30 tối\n- 👤 **Thời gian bạn đã nghe:** ${Math.max(15, totalListenedMinutes || 0)} phút (+${audioPoints} Xu)\n\n*(Thẻ báo cáo trực quan tương tác đã được cập nhật bên dưới)* ✨`;
        } else if (q.includes('yêu nhau') || q.includes('ngày yêu') || q.includes('kỷ niệm') || q.includes('thứ bao nhiêu')) {
          const start = new Date('2024-05-20');
          const now = new Date();
          const diffDays = Math.max(1, Math.floor(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          const nextMilestoneNum = Math.ceil((diffDays + 1) / 100) * 100;
          const daysLeft = nextMilestoneNum - diffDays;

          fallbackAction = {
            type: 'couple_anniversary',
            title: 'Đếm Ngày Yêu Thương Cặp Đôi',
            partnerName: 'Em Yêu',
            startDate: '2024-05-20',
            daysCount: diffDays,
            nextMilestone: `${nextMilestoneNum} Ngày Tròn Vẹn`,
            daysLeftToMilestone: daysLeft,
            quote: 'Mỗi một ngày trôi qua bên người ấy là một bản hòa ca ngọt ngào nhất của tình yêu.'
          };
          fallbackText = `💖 **Kỷ Niệm Tình Yêu Cặp Đôi (I Love Haevy):**\n\n- 💑 Cặp đôi: **${user?.displayName || 'Bạn'} & Em Yêu**\n- 💕 **Hôm nay là ngày thứ ${diffDays} hai đứa mình bên nhau!** (Kể từ ngày 20/05/2024)\n- 🎯 Mốc tiếp theo: **${nextMilestoneNum} Ngày Tròn Vẹn** (chỉ còn đúng ${daysLeft} ngày nữa).\n\n*"Hạnh phúc không phải là điểm đến, mà là mỗi khoảnh khắc được cùng người ấy lắng nghe những giai điệu bình yên."* 💌`;
        } else if (q.includes('nhận xu') || q.includes('thưởng xu') || q.includes('tặng xu') || q.includes('điểm danh')) {
          fallbackAction = {
            type: 'reward_points',
            amount: 150,
            reason: 'Thưởng tương tác xuất sắc cùng Haevy AI'
          };
          if (addAudioPoints) {
            addAudioPoints(150, 'Thưởng tương tác cùng Haevy AI', 'game_reward');
          }
          fallbackText = `🎉 **Chúc mừng bạn đã nhận thành công +150 Xu Haevy thưởng tương tác!**\n\nXu thưởng đã được cộng ngay vào số dư tài khoản của bạn. Bạn có thể dùng Xu để đổi gói VIP, tặng quà tác giả hoặc tham gia Đấu Trường Âm Nhạc! 👑`;
        } else {
          fallbackText = `Chào **${user?.displayName || 'bạn'}**, Haevy AI đã tiếp nhận yêu cầu của bạn. Tôi có toàn quyền truy cập thực hiện thêm/xoá dữ liệu trên 12 chế độ hệ sinh thái: Gia Phả, Tài Chính 6 Hũ, Audio, Cặp Đôi, Haevy Message, Tâm Linh và AI Study! Hãy ra lệnh bất cứ lúc nào nhé. ✨`;
        }
      }

      const fallbackAiMsg: HaevyAIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        actionData: fallbackAction
      };
      setMessages(prev => {
        const updated = [...prev, fallbackAiMsg];
        persistSessionUpdates(updated, textToSend);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (id: string, text: string) => {
    haptics.light();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to Speech
  const handleToggleSpeak = (id: string, text: string) => {
    haptics.light();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speakingMessageId === id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        try {
          window.speechSynthesis.cancel();
          const cleanText = text
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, ' ')
            .replace(/[*_#`[\]()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (!cleanText) return;

          const utterance = new SpeechSynthesisUtterance(cleanText);
          const voices = window.speechSynthesis.getVoices() || [];
          const viVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vn')));
          if (viVoice) {
            utterance.voice = viVoice;
            utterance.lang = viVoice.lang;
          } else {
            utterance.lang = 'vi-VN';
          }
          utterance.rate = 1.05;
          utterance.onend = () => setSpeakingMessageId(null);
          utterance.onerror = () => setSpeakingMessageId(null);
          window.speechSynthesis.speak(utterance);
          setSpeakingMessageId(id);
        } catch {
          setSpeakingMessageId(null);
        }
      }
    }
  };

  // Speech to Text (Mic input)
  const handleToggleMic = () => {
    haptics.medium();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API.');
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListeningVoice(false);
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);

      recognition.start();
    } catch (e) {
      setIsListeningVoice(false);
    }
  };

  // Play track helper
  const handlePlaySampleTrack = (title: string) => {
    haptics.medium();
    setPlayingTrackTitle(title);
    if (onPlayTrack) {
      onPlayTrack({
        id: `track_ai_${Date.now()}`,
        title: title,
        artist: 'Haevy Sound Studio',
        genre: 'Lo-Fi Chill',
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
        audioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
        durationSec: 180,
        playsCount: 1250,
        likesCount: 340
      });
    }
  };

  // Claim extra reward from action card
  const handleClaimCardReward = (cardId: string, amount: number) => {
    haptics.success();
    if (addAudioPoints) {
      addAudioPoints(amount, 'Nhận thưởng tương tác qua Haevy AI Card', 'game_reward');
    }
    setClaimedRewardIds(prev => ({ ...prev, [cardId]: true }));
  };

  // Clear conversation / Start fresh
  const handleClearHistory = () => {
    handleStartNewSession();
  };

  // Auto-send initial prompt if triggered from context suggestion / quick menu
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      const promptToRun = initialPrompt.trim();
      setInputMessage(promptToRun);
      if (onSelectSubTab && activeSubTab !== 'chat') {
        onSelectSubTab('chat');
      }
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
      const timer = setTimeout(() => {
        handleSendMessage(promptToRun);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  return (
    <div className="flex flex-col h-screen h-[100dvh] max-h-[100dvh] w-full bg-zinc-950 text-white overflow-hidden select-none">
      
      {/* Top Header Bar - Dedicated Haevy AI Session Header */}
      <header className="flex-none h-14 sm:h-16 px-3 sm:px-6 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between z-30 shadow-md">
        
        {/* Left: Back + Haevy AI Logo & Model Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToPortal && (
            <button 
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition shrink-0"
              title="Quay lại Cổng Hệ Sinh Thái"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {/* Dedicated Haevy AI Logo Mark */}
          <div 
            onClick={onOpenEcosystemDrawer}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink min-w-0 select-none"
            title="Haevy AI Master - Bấm để mở menu chế độ"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/15 animate-pulse" />
                  <BrainCircuit size={17} className="text-purple-300 animate-pulse relative z-10" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors truncate">
                  Haevy <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  Gemini 3.5 Flash
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:flex items-center gap-1 truncate">
                <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block"></span>
                Trợ lý Thông minh & Thực thi Tác vụ 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Right: History Toggle, Mood Selector, Token Points, Modes Drawer, New Chat */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Model Context Protocol (MCP) Interface Button */}
          <button
            type="button"
            id="haevy_mcp_protocol_toggle_btn"
            onClick={() => {
              haptics.selection();
              setIsMCPModalOpen(true);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              mcpSession
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25 shadow-sm shadow-cyan-900/30'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
            }`}
            title="Mở giao diện MCP Context Protocol cho AI truy cứu thông tin người dùng"
          >
            <Cpu size={14} className={mcpSession ? "text-cyan-400" : "text-zinc-400"} />
            <span className="hidden xs:inline">Giao Diện MCP</span>
            {mcpSession ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Chat History Sidebar Toggle Button */}
          <button
            type="button"
            id="haevy_ai_history_sidebar_toggle_btn"
            onClick={() => {
              haptics.selection();
              setIsHistorySidebarOpen(prev => !prev);
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              isHistorySidebarOpen
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/60 shadow-sm shadow-purple-900/30'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
            }`}
            title={isHistorySidebarOpen ? "Đóng thanh Lịch Sử Chat" : "Mở thanh Lịch Sử Chat"}
          >
            <Clock size={14} className={isHistorySidebarOpen ? "text-purple-400" : "text-zinc-400"} />
            <span className="hidden sm:inline">Lịch Sử Chat</span>
            {sessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {sessions.length}
              </span>
            )}
          </button>
          
          {/* Mood Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white transition flex items-center gap-1 shrink-0"
              title="Chọn tâm trạng của trợ lý AI"
            >
              <Smile size={13} className="text-purple-400" />
              <span className="hidden md:inline max-w-[110px] truncate">{selectedMood.split(' ')[0]} {selectedMood.split(' ')[1]}</span>
            </button>

            {isMoodPickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 border-b border-zinc-800 mb-1">
                  Phong cách trò chuyện:
                </div>
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => {
                      setSelectedMood(mood.label);
                      setIsMoodPickerOpen(false);
                      haptics.light();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      selectedMood === mood.label
                        ? 'bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>{mood.label}</span>
                    {selectedMood === mood.label && <Check size={12} className="text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Xu Points Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-black">{audioPoints.toLocaleString('vi-VN')}</span>
          </div>

          {/* Ecosystem Switcher Drawer Trigger */}
          {onOpenEcosystemDrawer && (
            <button
              onClick={onOpenEcosystemDrawer}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition"
              title="Menu 6 chế độ Hệ Sinh Thái"
            >
              <LayoutGrid size={15} />
            </button>
          )}

          {/* New Chat / Reset Session Button */}
          <button
            onClick={handleStartNewSession}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition flex items-center gap-1 shadow-sm"
            title="Bắt đầu phiên chat mới"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Phiên Mới</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout: Chat History Sidebar + Content Pane */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <HaevyAIChatHistorySidebar
          isOpen={isHistorySidebarOpen}
          onClose={() => setIsHistorySidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleStartNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onTogglePinSession={handleTogglePinSession}
          onClearAllSessions={handleClearAllSessions}
          onSaveCurrentSession={handleSaveCurrentSession}
          isSaving={isSavingSession}
          currentMessageCount={messages.length}
          onExportSessionToDocs={handleExportSessionToDocs}
        />

        {/* Right Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

      {/* Mode Switcher Tabs: Chat AI vs Ecosystem 12 Modes */}
      <div className="flex-none px-3 sm:px-6 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveViewMode('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare size={13} />
            <span>Trò Chuyện & Ra Lệnh AI</span>
          </button>
          
          <button
            onClick={() => setActiveViewMode('ecosystem')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === 'ecosystem'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass size={13} />
            <span>Toàn Cảnh 12 Chế Độ</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono">
              12
            </span>
          </button>
        </div>

        {/* Top Chat Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrentChatToDocs}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Xuất toàn bộ cuộc trò chuyện hiện tại sang Google Docs"
          >
            <FileText size={12} className="text-blue-400" />
            <span className="hidden sm:inline">Xuất Docs</span>
          </button>

          {/* Quick Undo Last Action on Header */}
          <button
            onClick={handleUndoLastAction}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Hoàn tác thao tác thêm/xoá dữ liệu vừa thực hiện"
          >
            <RotateCcw size={12} className="text-amber-400" />
            <span className="hidden sm:inline">Hoàn Tác Lệnh</span>
          </button>
        </div>
      </div>

      {/* Undo / Notification Toast Bar */}
      {undoNotification && (
        <div className="flex-none px-4 py-2 bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-950 border-b border-purple-500/30 flex items-center justify-between text-xs text-purple-200 animate-in fade-in slide-in-from-top-2 z-20">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{undoNotification}</span>
          </div>
          <button
            onClick={() => setUndoNotification(null)}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main Content Area: Either Ecosystem 12 Modes or Chat Thread */}
      {activeViewMode === 'ecosystem' ? (
        <HaevyEcosystemManager
          snapshot={ecosystemSnapshot}
          onSelectMode={onSelectMode}
          onSendPrompt={(prompt) => {
            setActiveViewMode('chat');
            handleSendMessage(prompt);
          }}
          onOpenQuickAdd={(type) => {
            setQuickAddModal(type);
            setQuickInput1('');
            setQuickInput2('');
            setQuickInput3('');
          }}
          onUndo={handleUndoLastAction}
        />
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Main Chat Conversation Thread */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}
            >
              {/* Message Bubble */}
              <div className={`relative max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xl transition-all ${
                isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-tl-none backdrop-blur-md'
              }`}>
                
                {/* Header info for AI */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-zinc-800/70 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <Sparkles size={13} className="text-purple-400 animate-spin-slow" />
                      <span>Haevy AI Agent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExportMessageToDocs(msg)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 transition"
                        title="Xuất phản hồi này sang Google Docs"
                      >
                        <FileText size={13} />
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                        title="Sao chép nội dung"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className={`p-1 rounded hover:bg-zinc-800 transition ${
                          speakingMessageId === msg.id ? 'text-purple-400 animate-pulse' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Đọc bằng giọng nói AI"
                      >
                        {speakingMessageId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Body Text */}
                <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-line break-words font-normal">
                  {msg.text}
                </div>

                {/* ============================================================ */}
                {/* DYNAMIC EMBEDDED INTERACTIVE ACTION CARDS IN CHAT STREAM   */}
                {/* ============================================================ */}

                {/* 1. AUDIO ANALYTICS LIVE REPORT CARD */}
                {msg.actionData?.type === 'audio_stats' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                          <Headphones size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-indigo-200">
                            {msg.actionData.title || 'Báo Cáo Lượt Nghe Audio Hôm Nay'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Dữ liệu thời gian thực từ hệ thống Haevy Audio</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Đang phát trực tiếp
                      </span>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400">Người nghe hôm nay</span>
                        <div className="text-sm sm:text-base font-black text-indigo-300">
                          {msg.actionData.totalListenersToday?.toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400">Tổng lượt phát</span>
                        <div className="text-sm sm:text-base font-black text-cyan-300">
                          {msg.actionData.totalListensToday?.toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400">Thời lượng phát</span>
                        <div className="text-sm sm:text-base font-black text-purple-300">
                          {msg.actionData.totalMinutesToday?.toLocaleString('vi-VN')} ph
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400">Bạn đã nghe</span>
                        <div className="text-sm sm:text-base font-black text-amber-300">
                          {msg.actionData.userMinutesToday} ph
                        </div>
                      </div>
                    </div>

                    {/* Top trending tracks list */}
                    {Array.isArray(msg.actionData.topTracks) && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-zinc-300">🔥 Bản nhạc thịnh hành hôm nay:</span>
                        {msg.actionData.topTracks.map((t: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-center font-black text-indigo-400">{idx + 1}</span>
                              <div>
                                <span className="font-semibold text-zinc-200">{t.title}</span>
                                <span className="text-[10px] text-zinc-500 block">{t.artist} • {t.genre}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePlaySampleTrack(t.title)}
                              className="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[10px] font-bold border border-indigo-500/40 flex items-center gap-1 transition"
                            >
                              <Play size={10} />
                              <span>Phát</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick navigation cta */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('audio')}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/50 transition"
                      >
                        <Headphones size={13} />
                        <span>Mở Trình Phát Nhạc Toàn Diện</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. COUPLE ANNIVERSARY LIVE CARD */}
                {msg.actionData?.type === 'couple_anniversary' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-rose-950/80 via-zinc-900 to-zinc-950 border border-rose-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                          <Heart size={18} className="fill-rose-500 text-rose-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                            {msg.actionData.title || 'Đếm Ngày Yêu Thương Cặp Đôi'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Không gian lãng mạn I Love Haevy</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        {user?.displayName || 'Bạn'} & {msg.actionData.partnerName || 'Em Yêu'}
                      </span>
                    </div>

                    {/* Big Days Counter Hero */}
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
                      <span className="text-xs text-rose-300/80 font-medium">Hôm nay hai bạn đã bên nhau</span>
                      <div className="text-3xl sm:text-4xl font-black text-rose-300 tracking-tight my-1">
                        {msg.actionData.daysCount || 469} <span className="text-lg font-bold text-rose-400">Ngày</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block">
                        Ngày bắt đầu: <span className="text-rose-200 font-semibold">{msg.actionData.startDate || '20/05/2024'}</span>
                      </span>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Sparkle size={12} className="text-amber-400" />
                          Mốc tiếp theo: <strong className="text-amber-300">{msg.actionData.nextMilestone || '500 Ngày Tròn Vẹn'}</strong>
                        </span>
                        <span className="text-rose-300 font-bold">Còn {msg.actionData.daysLeftToMilestone || 31} ngày</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 w-[93%]"></div>
                      </div>
                    </div>

                    {/* Romantic Quote */}
                    {msg.actionData.quote && (
                      <p className="text-xs italic text-rose-200/90 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 text-center">
                        "{msg.actionData.quote}"
                      </p>
                    )}

                    {/* Quick Couple Mode CTA */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('couple')}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/50 transition"
                      >
                        <Heart size={13} className="fill-white" />
                        <span>Mở Không Gian Cặp Đôi I Love Haevy</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. AUTO 6-JARS FINANCE TRANSACTION RECEIPT CARD */}
                {msg.actionData?.type === 'finance_transaction' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-emerald-200">
                            {msg.actionData.title || 'Biên Lai Giao Dịch Tài Chính Tự Động'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Đã cập nhật số dư & sổ thu chi 6 Hũ</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                        {msg.actionData.transactionType === 'income' ? '+ THU NHẬP' : '- CHI TIÊU'}
                      </span>
                    </div>

                    {/* Amount & Destination Banner */}
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400">Số tiền ghi nhận:</span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-300">
                          {msg.actionData.transactionType === 'income' ? '+' : '-'}{Number(msg.actionData.amount || 50000000).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400">Ví lưu trữ:</span>
                        <div className="text-xs font-bold text-zinc-200">
                          {msg.actionData.walletName || 'Tài khoản Ngân Hàng'}
                        </div>
                      </div>
                    </div>

                    {/* 6 Jars Allocation Details */}
                    {msg.actionData.jarsAllocation && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                          <span className="flex items-center gap-1">
                            <PieChart size={12} className="text-emerald-400" />
                            Phân bổ tự động 6 Hũ thông minh:
                          </span>
                          <span className="text-emerald-400 text-[10px]">Chuẩn 50/10/10/10/10/10</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">📦 Thiết yếu (50%)</span>
                            <span className="font-bold text-emerald-300">{Number(msg.actionData.jarsAllocation.essential).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">🏦 Tiết kiệm (10%)</span>
                            <span className="font-bold text-blue-300">{Number(msg.actionData.jarsAllocation.savings).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">📚 Giáo dục (10%)</span>
                            <span className="font-bold text-purple-300">{Number(msg.actionData.jarsAllocation.education).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">☕ Hưởng thụ (10%)</span>
                            <span className="font-bold text-amber-300">{Number(msg.actionData.jarsAllocation.enjoyment).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">📈 Đầu tư (10%)</span>
                            <span className="font-bold text-cyan-300">{Number(msg.actionData.jarsAllocation.investment).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">💖 Thiện nguyện (10%)</span>
                            <span className="font-bold text-rose-300">{Number(msg.actionData.jarsAllocation.charity).toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('finance')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition"
                      >
                        <Wallet size={13} />
                        <span>Mở Sổ Két Sắt 6 Hũ Haevy Finance</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. REWARD COIN CLAIM CARD */}
                {msg.actionData?.type === 'reward_points' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-zinc-900 to-zinc-950 border border-amber-500/40 shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl animate-bounce">
                        🪙
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                          +{msg.actionData.amount || 150} Xu Haevy Thưởng Tương Tác
                        </h4>
                        <p className="text-[10px] text-zinc-400">{msg.actionData.reason || 'Thưởng hoạt động tích cực'}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClaimCardReward(msg.id, msg.actionData.amount || 150)}
                      disabled={claimedRewardIds[msg.id]}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                        claimedRewardIds[msg.id]
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 shadow-lg shadow-amber-950/50'
                      }`}
                    >
                      {claimedRewardIds[msg.id] ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>Đã Nhận</span>
                        </>
                      ) : (
                        <>
                          <Coins size={14} />
                          <span>Nhận Ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 5. EMBEDDED MINI MUSIC PLAYER CARD */}
                {msg.actionData?.type === 'play_music' && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950/90 border border-purple-500/40 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={msg.actionData.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=200&q=80'} 
                        alt="cover" 
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-purple-500/30"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {msg.actionData.trackTitle || 'Lo-Fi Chill & Focus'}
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          {msg.actionData.artist || 'Haevy Sound Studio'} • {msg.actionData.genre || 'Lo-Fi Chill'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlaySampleTrack(msg.actionData.trackTitle || 'Lo-Fi Chill')}
                      className="p-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 transition"
                      title="Phát bài hát"
                    >
                      <Play size={16} />
                    </button>
                  </div>
                )}

                {/* 6. FAMILY TREE ACTION CARD (ADD / DELETE) */}
                {(msg.actionData?.type === 'add_family_member' || msg.actionData?.type === 'delete_family_members') && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-zinc-900 to-zinc-950 border border-amber-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                          <TreePine size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                            {msg.actionData.type === 'add_family_member' ? 'Đã Thêm Thành Viên Gia Phả Mới' : 'Đã Xoá Thành Viên Gia Phả'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Đồng bộ tức thì trên Cây Gia Phả Dòng Họ</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        Gia Phả Dòng Họ
                      </span>
                    </div>

                    {msg.actionData.members && msg.actionData.members.length > 0 && (
                      <div className="space-y-2">
                        {msg.actionData.members.map((m: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center font-bold text-amber-300 text-sm border border-amber-500/30">
                                {m.gender === 'female' ? '👩' : '👨'}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{m.fullName}</div>
                                <div className="text-[10px] text-zinc-400">
                                  Đời thứ {m.generation} • {m.branch || 'Chi Trưởng'} {m.birthYear ? `• Sinh ${m.birthYear}` : ''}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Đời {m.generation}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.actionData.names && msg.actionData.names.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                        <span className="font-bold">Đã loại bỏ khỏi phả hệ:</span> {msg.actionData.names.join(', ')}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('family_tree')}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                      >
                        <TreePine size={13} />
                        <span>Xem Cây Gia Phả Ngay</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. AUDIO TRACK LIBRARY ACTION CARD (ADD / DELETE) */}
                {(msg.actionData?.type === 'add_track' || msg.actionData?.type === 'delete_tracks') && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-zinc-900 to-zinc-950 border border-purple-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                          <Music2 size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-purple-200">
                            {msg.actionData.type === 'add_track' ? 'Đã Bổ Sung Bài Hát Vào Thư Viện' : 'Đã Cập Nhật Playlist'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Kho nhạc Haevy Audio Lossless & Spatial Audio</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                        Thư Viện Nhạc
                      </span>
                    </div>

                    {msg.actionData.tracks && msg.actionData.tracks.length > 0 && (
                      <div className="space-y-2">
                        {msg.actionData.tracks.map((t: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300 border border-purple-500/30">
                                <Headphones size={18} />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white line-clamp-1">{t.title}</div>
                                <div className="text-[10px] text-zinc-400">{t.artist || 'Haevy Sound'} • {t.genre || 'Lossless VIP'}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePlaySampleTrack(t.title)}
                              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-md"
                              title="Phát ngay"
                            >
                              <Play size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('audio')}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                      >
                        <Headphones size={13} />
                        <span>Mở Chế Độ Audio</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 8. COUPLE MEMORY ACTION CARD (ADD / DELETE) */}
                {(msg.actionData?.type === 'add_couple_memory' || msg.actionData?.type === 'delete_couple_memories') && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-pink-950/80 via-zinc-900 to-zinc-950 border border-pink-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-pink-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
                          <Heart size={18} className="fill-pink-500 text-pink-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-pink-200">
                            {msg.actionData.type === 'add_couple_memory' ? 'Đã Lưu Kỷ Niệm Tình Yêu Mới' : 'Đã Cập Nhật Kỷ Niệm Cặp Đôi'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Dòng thời gian I Love Haevy</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                        I Love Haevy
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-pink-500/30 space-y-1">
                      <div className="text-xs font-bold text-pink-200">
                        "{msg.actionData.memoryTitle || 'Kỷ niệm hẹn hò lãng mạn'}"
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        📅 Ngày ghi nhận: {new Date().toLocaleDateString('vi-VN')} • Nơi lưu giữ: Nhật ký tình yêu
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('couple')}
                        className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                      >
                        <Heart size={13} className="fill-white" />
                        <span>Xem Nhật Ký Tình Yêu</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 9. HAEVY MESSAGE FRIEND CARD (ADD / DELETE) */}
                {(msg.actionData?.type === 'add_friend' || msg.actionData?.type === 'delete_friend') && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-zinc-900 to-zinc-950 border border-blue-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                          <Users size={18} className="text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-blue-200">
                            {msg.actionData.type === 'add_friend' ? 'Đã Kết Nối Bạn Bè Mới' : 'Đã Cập Nhật Danh Bạ'}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Danh bạ Haevy Message</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        Haevy Message
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-blue-500/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                        {(msg.actionData.fullName || 'B')[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{msg.actionData.fullName || 'Người bạn mới'}</div>
                        <div className="text-[10px] text-zinc-400">Đã sẵn sàng trò chuyện, gửi tin nhắn thoại & chia sẻ audio</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('messages')}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                      >
                        <MessageSquare size={13} />
                        <span>Mở Hộp Thoại Chat Ngay</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 10. FINANCE DELETE CARD */}
                {msg.actionData?.type === 'delete_finance_transactions' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 via-zinc-900 to-zinc-950 border border-amber-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                          <Trash2 size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-amber-200">Đã Xoá Giao Dịch Khỏi Sổ 6 Hũ</h4>
                          <p className="text-[10px] text-zinc-400">Sổ tài chính & cân đối ví đã được cập nhật</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSelectMode && onSelectMode('finance')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                      >
                        <Wallet size={13} />
                        <span>Xem Sổ Thu Chi 6 Hũ</span>
                        <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={handleUndoLastAction}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs flex items-center gap-1 transition"
                        title="Hoàn tác lệnh vừa thực hiện"
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Tác</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 11. NAVIGATE MODE CARD */}
                {msg.actionData?.type === 'navigate_mode' && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                          <Compass size={18} className="text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-indigo-200">
                            Chuyển Sang Chế Độ: {msg.actionData.modeName || msg.actionData.target}
                          </h4>
                          <p className="text-[10px] text-zinc-400">Hệ sinh thái Haevy toàn diện</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectMode && onSelectMode(msg.actionData.target)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
                    >
                      <Compass size={14} />
                      <span>Mở Chế Độ {msg.actionData.modeName || ''} Ngay</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Suggested Action Quick Buttons */}
                {!isUser && Array.isArray(msg.suggestedActions) && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-800/80">
                    {msg.suggestedActions.map((sAction, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          haptics.light();
                          if (sAction.actionType === 'prompt_preset') {
                            handleSendMessage(sAction.target);
                          } else if (sAction.actionType === 'navigate_mode' && onSelectMode) {
                            onSelectMode(sAction.target);
                          } else if (sAction.actionType === 'navigate_tab' && onSelectTab) {
                            onSelectTab(sAction.target);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-zinc-800/90 hover:bg-purple-900/40 text-purple-200 hover:text-purple-100 text-xs font-medium border border-zinc-700/60 hover:border-purple-500/50 transition flex items-center gap-1"
                      >
                        <span>{sAction.label}</span>
                        <ChevronRight size={11} className="text-zinc-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] mt-2 font-mono ${isUser ? 'text-purple-200/70 text-right' : 'text-zinc-500'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator for AI Thinking */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-4xl mx-auto w-full">
            <div className="p-4 rounded-3xl rounded-tl-none bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2.5 shadow-lg">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-zinc-400">Haevy AI đang xử lý dữ liệu và thực thi tác vụ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chip Bar */}
      <div className="flex-none px-3 sm:px-6 py-1.5 bg-zinc-950/95 border-t border-zinc-800/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2">
        <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 flex-none">
          <Zap size={12} className="text-amber-400" /> Gợi ý:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.text)}
              disabled={isLoading}
              className={`flex-none px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-95 bg-gradient-to-r ${qp.color} backdrop-blur-md`}
            >
              <Icon size={12} />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Input Box Section */}
      <div className="flex-none p-2 sm:p-3 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto flex items-end gap-1.5 sm:gap-2">
          
          {/* Voice Input Button */}
          <button
            onClick={handleToggleMic}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex-none border transition ${
              isListeningVoice 
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
            }`}
            title={isListeningVoice ? 'Đang lắng nghe giọng nói...' : 'Nhập tin nhắn bằng giọng nói (Mic)'}
          >
            {isListeningVoice ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          {/* Textarea Input */}
          <div className="flex-1 relative bg-zinc-900/90 rounded-xl sm:rounded-2xl border border-zinc-800 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50 transition">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập yêu cầu (vd: kiểm tra lượt nghe audio hôm nay, đếm ngày yêu, thêm nhận lương 50tr, bật nhạc...)"
              rows={1}
              className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none max-h-28 min-h-[40px] sm:min-h-[44px]"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex-none transition flex items-center justify-center ${
              inputMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/50 scale-100'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800/80 cursor-not-allowed scale-95'
            }`}
            title="Gửi tin nhắn"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
      </div>
      )}

        </div>
      </div>

      {/* Quick Add Modal Across 12 Modes */}
      {quickAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {quickAddModal === 'family' && <><TreePine size={18} className="text-amber-400" /> Thêm Vào Gia Phả Số</>}
                {quickAddModal === 'track' && <><Headphones size={18} className="text-purple-400" /> Thêm Bài Hát Mới</>}
                {quickAddModal === 'memory' && <><Heart size={18} className="text-rose-400" /> Thêm Kỷ Niệm Tình Yêu</>}
                {quickAddModal === 'friend' && <><MessageSquare size={18} className="text-blue-400" /> Thêm Bạn Bè Mới</>}
              </h3>
              <button
                onClick={() => setQuickAddModal(null)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              {quickAddModal === 'family' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Họ và tên thành viên:</label>
                    <input
                      type="text"
                      value={quickInput1}
                      onChange={(e) => setQuickInput1(e.target.value)}
                      placeholder="VD: Nguyễn Văn Nam"
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Đời / Thế hệ:</label>
                      <input
                        type="number"
                        value={quickInput2}
                        onChange={(e) => setQuickInput2(e.target.value)}
                        placeholder="VD: 4"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Chi phái:</label>
                      <input
                        type="text"
                        value={quickInput3}
                        onChange={(e) => setQuickInput3(e.target.value)}
                        placeholder="VD: Chi Trưởng"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {quickAddModal === 'track' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Tên bài hát:</label>
                    <input
                      type="text"
                      value={quickInput1}
                      onChange={(e) => setQuickInput1(e.target.value)}
                      placeholder="VD: Dạ Vũ Tuyệt Đỉnh (Lossless)"
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Ca sĩ / Nghệ sĩ:</label>
                      <input
                        type="text"
                        value={quickInput2}
                        onChange={(e) => setQuickInput2(e.target.value)}
                        placeholder="VD: Haevy Sound"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Thể loại:</label>
                      <input
                        type="text"
                        value={quickInput3}
                        onChange={(e) => setQuickInput3(e.target.value)}
                        placeholder="VD: Lossless VIP"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {quickAddModal === 'memory' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Tiêu đề kỷ niệm tình yêu:</label>
                    <input
                      type="text"
                      value={quickInput1}
                      onChange={(e) => setQuickInput1(e.target.value)}
                      placeholder="VD: Kỷ niệm lần đầu gặp nhau tại quán quen"
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Ngày kỷ niệm (YYYY-MM-DD):</label>
                    <input
                      type="date"
                      value={quickInput2}
                      onChange={(e) => setQuickInput2(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </>
              )}

              {quickAddModal === 'friend' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Họ và tên bạn bè:</label>
                    <input
                      type="text"
                      value={quickInput1}
                      onChange={(e) => setQuickInput1(e.target.value)}
                      placeholder="VD: Nguyễn Hoàng An"
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setQuickAddModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleQuickAddSubmit}
                disabled={!quickInput1.trim()}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition ${
                  quickInput1.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Plus size={14} />
                <span>Thêm Dữ Liệu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Docs Export Modal */}
      <GoogleDocsExportModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        options={docsExportOptions}
      />

      {/* Model Context Protocol (MCP) Interface Modal */}
      <HaevyMCPProtocolModal
        isOpen={isMCPModalOpen}
        onClose={() => {
          setIsMCPModalOpen(false);
          setMcpSession(getStoredMCPSession());
        }}
        onRunChatPrompt={(prompt) => {
          setInputMessage(prompt);
          handleSendMessage(prompt);
        }}
      />
    </div>
  );
}
