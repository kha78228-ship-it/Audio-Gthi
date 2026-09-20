import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Pin, 
  PinOff, 
  Pencil, 
  Check, 
  X, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Bookmark, 
  Download, 
  Share2,
  TreePine,
  Wallet,
  Heart,
  Headphones,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  FileText
} from 'lucide-react';
import { HaevyAIChatSession, HaevyAIMessage } from '../types';
import { haptics } from '../utils/haptics';

interface HaevyAIChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HaevyAIChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onTogglePinSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  onSaveCurrentSession: () => void;
  isSaving?: boolean;
  currentMessageCount: number;
  onExportSessionToDocs?: (session: HaevyAIChatSession) => void;
}

export function HaevyAIChatHistorySidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onClearAllSessions,
  onSaveCurrentSession,
  isSaving = false,
  currentMessageCount,
  onExportSessionToDocs
}: HaevyAIChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Helper to choose dynamic icon based on chat title/content
  const getSessionIcon = (session: HaevyAIChatSession) => {
    const text = (session.title + ' ' + (session.previewText || '')).toLowerCase();
    if (text.includes('gia phả') || text.includes('dòng họ') || text.includes('tổ tiên')) {
      return <TreePine size={14} className="text-amber-400" />;
    }
    if (text.includes('lương') || text.includes('tiền') || text.includes('ví') || text.includes('hũ') || text.includes('chi tiêu')) {
      return <Wallet size={14} className="text-emerald-400" />;
    }
    if (text.includes('yêu') || text.includes('kỷ niệm') || text.includes('cặp đôi') || text.includes('ngày')) {
      return <Heart size={14} className="text-rose-400" />;
    }
    if (text.includes('nhạc') || text.includes('nghe') || text.includes('audio') || text.includes('bài hát')) {
      return <Headphones size={14} className="text-cyan-400" />;
    }
    return <MessageSquare size={14} className="text-purple-400" />;
  };

  // Grouping sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s => 
      s.title.toLowerCase().includes(q) || 
      (s.previewText && s.previewText.toLowerCase().includes(q)) ||
      s.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  const { pinnedSessions, todaySessions, yesterdaySessions, olderSessions } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const pinned: HaevyAIChatSession[] = [];
    const today: HaevyAIChatSession[] = [];
    const yest: HaevyAIChatSession[] = [];
    const older: HaevyAIChatSession[] = [];

    filteredSessions.forEach(session => {
      if (session.isPinned) {
        pinned.push(session);
        return;
      }
      const date = new Date(session.updatedAt || session.createdAt);
      if (date.toDateString() === todayStr) {
        today.push(session);
      } else if (date.toDateString() === yesterdayStr) {
        yest.push(session);
      } else {
        older.push(session);
      }
    });

    return {
      pinnedSessions: pinned,
      todaySessions: today,
      yesterdaySessions: yest,
      olderSessions: older
    };
  }, [filteredSessions]);

  const handleStartEdit = (session: HaevyAIChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.selection();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
  };

  const handleSaveEdit = (sessionId: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitleInput.trim()) {
      onRenameSession(sessionId, editTitleInput.trim());
      haptics.success();
    }
    setEditingSessionId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const handleSaveCurrentClick = () => {
    haptics.success();
    onSaveCurrentSession();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  // Format relative or date string
  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Vừa xong';
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return 'Vừa xong';
    }
  };

  const renderSessionItem = (session: HaevyAIChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingSessionId === session.id;
    const isConfirmingDelete = confirmDeleteId === session.id;

    return (
      <div
        key={session.id}
        id={`chat_session_${session.id}`}
        onClick={() => {
          if (!isEditing && !isConfirmingDelete) {
            haptics.selection();
            onSelectSession(session.id);
          }
        }}
        className={`group relative flex flex-col p-2.5 rounded-2xl transition-all duration-200 cursor-pointer border ${
          isActive
            ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40 text-white'
            : 'bg-zinc-900/50 hover:bg-zinc-800/80 border-zinc-800/70 hover:border-zinc-700 text-zinc-300'
        }`}
      >
        {/* Active glowing indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500 shadow-sm shadow-purple-400" />
        )}

        <div className="flex items-center justify-between gap-2">
          {/* Icon & Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1.5 rounded-xl shrink-0 transition-colors ${
              isActive ? 'bg-purple-500/20' : 'bg-zinc-800/80 group-hover:bg-zinc-700/80'
            }`}>
              {getSessionIcon(session)}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitleInput}
                  onChange={e => setEditTitleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit(session.id);
                    if (e.key === 'Escape') setEditingSessionId(null);
                  }}
                  autoFocus
                  className="w-full bg-zinc-950 text-white text-xs px-2 py-1 rounded-lg border border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={(e) => handleSaveEdit(session.id, e)}
                  className="p-1 rounded-md bg-purple-600 text-white hover:bg-purple-500 shrink-0"
                  title="Lưu tên mới"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white shrink-0"
                  title="Hủy"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                {session.title}
              </span>
            )}
          </div>

          {/* Quick action buttons (Pin, Edit, Delete) */}
          {!isEditing && (
            <div className="flex items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Pin button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.selection();
                  onTogglePinSession(session.id);
                }}
                className={`p-1 rounded-lg hover:bg-zinc-700/80 transition-colors ${
                  session.isPinned ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                }`}
                title={session.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
              >
                {session.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>

              {/* Export to Google Docs button */}
              {onExportSessionToDocs && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.impact('light');
                    onExportSessionToDocs(session);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-700/80 transition-colors"
                  title="Xuất cuộc hội thoại này sang Google Docs"
                >
                  <FileText size={13} />
                </button>
              )}

              {/* Edit button */}
              <button
                type="button"
                onClick={(e) => handleStartEdit(session, e)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-colors"
                title="Đổi tên cuộc trò chuyện"
              >
                <Pencil size={13} />
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.warning();
                  if (confirmDeleteId === session.id) {
                    onDeleteSession(session.id);
                    setConfirmDeleteId(null);
                  } else {
                    setConfirmDeleteId(session.id);
                    setTimeout(() => setConfirmDeleteId(null), 3000);
                  }
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isConfirmingDelete 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/80'
                }`}
                title={isConfirmingDelete ? 'Bấm lần nữa để xác nhận xóa' : 'Xóa hội thoại'}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Confirmation banner if delete clicked */}
        {isConfirmingDelete && (
          <div className="mt-1.5 px-2 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-[10px] text-rose-300 flex items-center justify-between animate-fadeIn">
            <span>Xác nhận xóa cuộc hội thoại này?</span>
            <span className="font-bold underline text-rose-200">Xóa ngay</span>
          </div>
        )}

        {/* Subtitle / Preview and message count */}
        {!isEditing && (
          <div className="flex items-center justify-between gap-2 mt-1 pl-7 text-[10px] text-zinc-400">
            <span className="truncate max-w-[150px]">
              {session.previewText || `${session.messages.length} tin nhắn`}
            </span>
            <span className="font-mono text-zinc-500 shrink-0">
              {formatTimestamp(session.updatedAt || session.createdAt)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside 
        id="haevy_ai_chat_history_sidebar"
        className={`fixed md:relative top-0 md:top-auto left-0 h-full max-h-[100dvh] z-40 md:z-20 w-72 sm:w-80 bg-zinc-950/95 backdrop-blur-3xl border-r border-zinc-800/80 flex flex-col transition-all duration-300 ease-in-out shrink-0 shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-72 md:sm:-ml-80'
        }`}
      >
        {/* Header */}
        <div className="flex-none p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-900/40">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Clock size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Lịch Sử Chat</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {sessions.length}
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400 truncate">
                Lưu & tiếp tục mọi cuộc hội thoại
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
            title="Đóng sidebar lịch sử"
          >
            <X size={15} />
          </button>
        </div>

        {/* Primary Action: New Chat & Save Current buttons */}
        <div className="p-3 flex flex-col gap-2 border-b border-zinc-800/60 bg-zinc-950/40">
          <button
            type="button"
            id="haevy_ai_new_chat_sidebar_btn"
            onClick={() => {
              haptics.medium();
              onNewSession();
            }}
            className="group relative flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Đoạn Chat Mới</span>
          </button>

          <button
            type="button"
            id="haevy_ai_save_chat_btn"
            onClick={handleSaveCurrentClick}
            disabled={isSaving || currentMessageCount <= 1}
            className={`flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
              saveSuccessNotice
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : currentMessageCount <= 1
                ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 hover:bg-purple-950/40 border-zinc-800 hover:border-purple-500/50 text-zinc-300 hover:text-white cursor-pointer'
            }`}
            title="Lưu hoặc đồng bộ cuộc trò chuyện hiện tại"
          >
            {saveSuccessNotice ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Bookmark size={13} className={currentMessageCount > 1 ? "text-purple-400" : "text-zinc-500"} />
                <span>Lưu Cuộc Hội Thoại Này</span>
              </>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pt-2.5 pb-1">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
                <MessageSquare size={22} />
              </div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">
                Chưa có hội thoại nào được lưu
              </p>
              <p className="text-[11px] text-zinc-500 max-w-[200px]">
                Gửi tin nhắn hoặc bấm &quot;Lưu Cuộc Hội Thoại&quot; để lưu lại các phản hồi thông minh từ Haevy AI.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Không tìm thấy hội thoại phù hợp với &quot;{searchQuery}&quot;
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <Pin size={11} />
                    <span>Đã Ghim ({pinnedSessions.length})</span>
                  </div>
                  {pinnedSessions.map(renderSessionItem)}
                </div>
              )}

              {/* Today Section */}
              {todaySessions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Hôm nay
                  </div>
                  {todaySessions.map(renderSessionItem)}
                </div>
              )}

              {/* Yesterday Section */}
              {yesterdaySessions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Hôm qua
                  </div>
                  {yesterdaySessions.map(renderSessionItem)}
                </div>
              )}

              {/* Older Section */}
              {olderSessions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Cũ hơn
                  </div>
                  {olderSessions.map(renderSessionItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Bar: Clear All & Cloud Sync status */}
        <div className="flex-none p-3 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px]">Đồng bộ tự động</span>
          </div>

          {sessions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                haptics.warning();
                if (window.confirm('Bạn có chắc muốn xóa toàn bộ tất cả lịch sử cuộc trò chuyện đã lưu? Thao tác này không thể hoàn tác.')) {
                  onClearAllSessions();
                }
              }}
              className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              title="Xóa toàn bộ lịch sử trò chuyện"
            >
              <Trash2 size={11} />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
