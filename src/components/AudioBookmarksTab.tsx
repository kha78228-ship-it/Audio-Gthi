import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookmarkPlus, 
  BookmarkCheck, 
  Trash2, 
  Edit3, 
  Play, 
  Clock, 
  Search, 
  Music, 
  Check, 
  Copy, 
  Plus, 
  Sparkles,
  Tag,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Info
} from 'lucide-react';
import { Track, AudioBookmark } from '../types';
import { audioBookmarkService } from '../services/audioBookmarkService';

interface AudioBookmarksTabProps {
  currentTrack: Track | null;
  playlist: Track[];
  progress: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onSelectTrack: (track: Track) => void;
  onTogglePlay?: () => void;
}

const PRESET_TAGS = [
  'Đoạn điệp khúc',
  'Đoạn hay nhất',
  'Giai điệu sâu lắng',
  'Lời bình ý nghĩa',
  'Solo ấn tượng',
  'Cần nghe lại'
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-400' },
};

export function AudioBookmarksTab({
  currentTrack,
  playlist,
  progress,
  duration,
  isPlaying,
  onSeek,
  onSelectTrack,
  onTogglePlay,
}: AudioBookmarksTabProps) {
  const [bookmarks, setBookmarks] = useState<AudioBookmark[]>([]);
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // New bookmark form state
  const [customTime, setCustomTime] = useState<number>(0);
  const [newLabel, setNewLabel] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('amber');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState('amber');

  // Toast / Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justJumpedId, setJustJumpedId] = useState<string | null>(null);

  // Subscribe to bookmark changes
  useEffect(() => {
    const updateList = () => {
      setBookmarks(audioBookmarkService.getAll());
    };
    updateList();
    const unsubscribe = audioBookmarkService.subscribe(updateList);
    return () => unsubscribe();
  }, []);

  // Sync customTime when opening add form
  const handleOpenAddForm = () => {
    setCustomTime(Math.floor(progress));
    setNewLabel(`Điểm nhấn tại ${audioBookmarkService.formatTimestamp(progress)}`);
    setNewNote('');
    setIsAdding(true);
  };

  const handleQuickAddCurrent = () => {
    if (!currentTrack) return;
    const time = Math.floor(progress);
    const added = audioBookmarkService.add({
      trackId: currentTrack.id,
      trackTitle: currentTrack.title,
      trackArtist: currentTrack.artist,
      trackCoverUrl: currentTrack.coverUrl,
      timestamp: time,
      label: `Mốc ${audioBookmarkService.formatTimestamp(time)}`,
      color: 'amber',
    });
    setJustJumpedId(added.id);
    setTimeout(() => setJustJumpedId(null), 2500);
  };

  const handleSaveNewBookmark = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTrack) return;

    const clampedTime = Math.max(0, Math.min(customTime, duration > 0 ? duration : customTime));
    const added = audioBookmarkService.add({
      trackId: currentTrack.id,
      trackTitle: currentTrack.title,
      trackArtist: currentTrack.artist,
      trackCoverUrl: currentTrack.coverUrl,
      timestamp: clampedTime,
      label: newLabel.trim() || `Mốc ${audioBookmarkService.formatTimestamp(clampedTime)}`,
      note: newNote.trim() || undefined,
      color: selectedColor,
    });

    setIsAdding(false);
    setJustJumpedId(added.id);
    setTimeout(() => setJustJumpedId(null), 2500);
  };

  const handleStartEdit = (bm: AudioBookmark) => {
    setEditingId(bm.id);
    setEditLabel(bm.label);
    setEditNote(bm.note || '');
    setEditColor(bm.color || 'amber');
  };

  const handleSaveEdit = (id: string) => {
    audioBookmarkService.update(id, {
      label: editLabel,
      note: editNote || undefined,
      color: editColor,
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    audioBookmarkService.remove(id);
    if (editingId === id) setEditingId(null);
  };

  const handleJumpToBookmark = (bm: AudioBookmark) => {
    setJustJumpedId(bm.id);
    setTimeout(() => setJustJumpedId(null), 2000);

    // If bookmark is for a different track, switch track first
    if (currentTrack?.id !== bm.trackId) {
      const targetTrack = playlist.find((t) => t.id === bm.trackId);
      if (targetTrack) {
        onSelectTrack(targetTrack);
        // Delay seek slightly to ensure audio element has loaded track
        setTimeout(() => {
          onSeek(bm.timestamp);
          if (!isPlaying && onTogglePlay) onTogglePlay();
        }, 150);
        return;
      }
    }

    // Same track: seek directly
    onSeek(bm.timestamp);
    if (!isPlaying && onTogglePlay) {
      onTogglePlay();
    }
  };

  const handleCopyBookmark = (bm: AudioBookmark) => {
    const text = `⏱ [${audioBookmarkService.formatTimestamp(bm.timestamp)}] ${bm.label} - "${bm.trackTitle}" (${bm.trackArtist})`;
    navigator.clipboard.writeText(text);
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter bookmarks
  const currentTrackBookmarks = bookmarks.filter((b) => b.trackId === currentTrack?.id);
  const activeList = filterMode === 'current' ? currentTrackBookmarks : bookmarks;

  const filteredBookmarks = activeList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.label.toLowerCase().includes(q) ||
      (b.note && b.note.toLowerCase().includes(q)) ||
      b.trackTitle.toLowerCase().includes(q) ||
      b.trackArtist.toLowerCase().includes(q) ||
      audioBookmarkService.formatTimestamp(b.timestamp).includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-Header: Filter Mode & Count */}
      <div className="flex flex-col gap-2.5 mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              type="button"
              id="bookmark-filter-current-btn"
              onClick={() => setFilterMode('current')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'current'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Bài hiện tại</span>
              <span className="text-[10px] bg-zinc-900 text-amber-300 font-mono px-1.5 py-0.2 rounded">
                {currentTrackBookmarks.length}
              </span>
            </button>

            <button
              type="button"
              id="bookmark-filter-all-btn"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Tất cả bài hát</span>
              <span className="text-[10px] bg-zinc-900 text-zinc-400 font-mono px-1.5 py-0.2 rounded">
                {bookmarks.length}
              </span>
            </button>
          </div>

          {/* Quick Action Button: Add Bookmark at current time */}
          <button
            type="button"
            id="quick-add-bookmark-btn"
            onClick={isAdding ? () => setIsAdding(false) : handleOpenAddForm}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            {isAdding ? (
              <span>Đóng biểu mẫu</span>
            ) : (
              <>
                <BookmarkPlus size={14} className="text-amber-400" />
                <span>+ Lưu mốc {audioBookmarkService.formatTimestamp(progress)}</span>
              </>
            )}
          </button>
        </div>

        {/* Search input (visible if more than 2 items) */}
        {activeList.length > 2 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              id="bookmark-search-input"
              type="text"
              placeholder="Tìm kiếm mốc thời gian, ghi chú, tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        )}
      </div>

      {/* Add Form Panel (Collapsible) */}
      {isAdding && (
        <div 
          id="add-bookmark-form-panel"
          className="mb-3.5 p-3.5 bg-zinc-950/90 border border-amber-500/30 rounded-2xl flex flex-col gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 shrink-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <BookmarkPlus size={14} className="text-amber-400" />
              <span>Đánh Dấu Mốc Thời Gian Mới</span>
            </span>
            <span className="text-[11px] text-zinc-400 truncate max-w-[180px]">
              {currentTrack?.title}
            </span>
          </div>

          {/* Time Picker & Fine-tuning */}
          <div className="flex items-center justify-between bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">Thời điểm:</span>
              <span className="font-mono text-sm font-extrabold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                {audioBookmarkService.formatTimestamp(customTime)}
              </span>
            </div>

            {/* -5s / +5s / Current */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setCustomTime((t) => Math.max(0, t - 5))}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-0.5 text-[11px] font-mono cursor-pointer"
                title="Lùi 5 giây"
              >
                <RotateCcw size={11} /> -5s
              </button>
              <button
                type="button"
                onClick={() => setCustomTime(Math.floor(progress))}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold cursor-pointer"
                title="Lấy thời gian đang phát hiện tại"
              >
                Hiện tại
              </button>
              <button
                type="button"
                onClick={() => setCustomTime((t) => Math.min(duration || 3600, t + 5))}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-0.5 text-[11px] font-mono cursor-pointer"
                title="Tiến 5 giây"
              >
                +5s <RotateCw size={11} />
              </button>
            </div>
          </div>

          {/* Label Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              Tiêu đề hoặc tên mốc thời gian:
            </label>
            <input
              id="bookmark-label-input"
              type="text"
              placeholder="VD: Điệp khúc cực cháy, Lời thoại tập trung..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-zinc-500">Gợi ý nhanh:</span>
            {PRESET_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setNewLabel(tag)}
                className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Note Input (Optional) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              Ghi chú thêm (tùy chọn):
            </label>
            <textarea
              id="bookmark-note-input"
              rows={2}
              placeholder="Ghi lại cảm xúc, chi tiết đoạn thoại hoặc lý do bạn yêu thích thời điểm này..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Color tag picker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Màu nhãn:</span>
              {Object.entries(COLOR_MAP).map(([colorKey, style]) => (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setSelectedColor(colorKey)}
                  className={`w-5 h-5 rounded-full ${style.dot} transition-transform cursor-pointer border ${
                    selectedColor === colorKey ? 'scale-125 ring-2 ring-white border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                id="submit-save-bookmark-btn"
                onClick={() => handleSaveNewBookmark()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Lưu Mốc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks List Container */}
      <div 
        id="bookmarks-list-container"
        className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 custom-scrollbar max-h-[440px]"
      >
        {filteredBookmarks.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 px-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
              <Bookmark size={24} className="text-amber-400/70" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-semibold text-zinc-300">
                {searchQuery ? 'Không tìm thấy mốc thời gian phù hợp' : 'Chưa có mốc thời gian nào'}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {searchQuery 
                  ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
                  : 'Lưu lại những giai điệu hay, đoạn podcast truyền cảm hứng hoặc phần lời ý nghĩa để nhảy lại ngay lập tức!'}
              </p>
            </div>

            {!searchQuery && currentTrack && (
              <button
                type="button"
                id="empty-state-add-bookmark-btn"
                onClick={handleQuickAddCurrent}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
              >
                <BookmarkPlus size={15} className="text-amber-400" />
                <span>Đánh dấu mốc hiện tại [{audioBookmarkService.formatTimestamp(progress)}]</span>
              </button>
            )}
          </div>
        ) : (
          filteredBookmarks.map((bm) => {
            const isCurrentTrack = currentTrack?.id === bm.trackId;
            const isPlayingHere = isCurrentTrack && Math.abs(progress - bm.timestamp) <= 2;
            const isJustJumped = justJumpedId === bm.id;
            const colorTheme = COLOR_MAP[bm.color || 'amber'] || COLOR_MAP.amber;
            const isEditing = editingId === bm.id;

            return (
              <div
                key={bm.id}
                id={`bookmark-item-${bm.id}`}
                className={`group relative p-3 rounded-2xl transition-all border flex flex-col gap-2 ${
                  isPlayingHere
                    ? 'bg-zinc-800/90 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : isJustJumped
                    ? 'bg-zinc-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                }`}
              >
                {/* Editing Inline Mode */}
                {isEditing ? (
                  <div className="space-y-2.5 p-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">
                        Chỉnh sửa mốc [{audioBookmarkService.formatTimestamp(bm.timestamp)}]
                      </span>
                      <span className="text-[10px] text-zinc-500">{bm.trackTitle}</span>
                    </div>

                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="Tên mốc..."
                    />

                    <textarea
                      rows={2}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                      placeholder="Ghi chú thêm..."
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        {Object.entries(COLOR_MAP).map(([colorKey, style]) => (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => setEditColor(colorKey)}
                            className={`w-4 h-4 rounded-full ${style.dot} transition-transform cursor-pointer border ${
                              editColor === colorKey ? 'scale-125 ring-1 ring-white' : 'opacity-60'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(bm.id)}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Card Mode */
                  <>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Timestamp Button - One click to jump! */}
                        <button
                          type="button"
                          id={`jump-to-bookmark-${bm.id}`}
                          onClick={() => handleJumpToBookmark(bm)}
                          className={`group/btn px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-extrabold transition-all cursor-pointer shrink-0 shadow-sm ${
                            isPlayingHere
                              ? 'bg-amber-500 text-black border-amber-400 scale-105 shadow-amber-500/20'
                              : `${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} hover:scale-105 hover:bg-amber-500 hover:text-black`
                          }`}
                          title="Bấm để nhảy tới mốc thời gian này ngay"
                        >
                          <Play size={12} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
                          <span>{audioBookmarkService.formatTimestamp(bm.timestamp)}</span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 
                              onClick={() => handleJumpToBookmark(bm)}
                              className="font-bold text-xs sm:text-sm text-zinc-100 hover:text-amber-300 transition-colors cursor-pointer truncate"
                            >
                              {bm.label}
                            </h4>

                            {isPlayingHere && (
                              <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                ĐANG Ở ĐÂY
                              </span>
                            )}
                          </div>

                          {/* Track info if in All Tracks view */}
                          {filterMode === 'all' && (
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 truncate">
                              <Music size={11} className="text-zinc-500 shrink-0" />
                              <span className="font-semibold text-zinc-300 truncate">{bm.trackTitle}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500 truncate">{bm.trackArtist}</span>
                            </div>
                          )}

                          {/* Note text if present */}
                          {bm.note && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 italic bg-black/30 p-1.5 rounded-lg border border-zinc-800/60">
                              "{bm.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyBookmark(bm)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Sao chép mốc thời gian"
                        >
                          {copiedId === bm.id ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(bm)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Chỉnh sửa ghi chú mốc này"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(bm.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa mốc này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info / Tip */}
      {filteredBookmarks.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1">
            <Info size={12} className="text-zinc-500" />
            <span>Bấm vào mốc [mm:ss] để nhảy ngay tới thời điểm đó</span>
          </span>
          <span className="font-mono text-zinc-400">
            {filteredBookmarks.length} mốc đã lưu
          </span>
        </div>
      )}
    </div>
  );
}
