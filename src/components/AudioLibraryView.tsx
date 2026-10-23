import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  LayoutGrid, 
  List, 
  Disc3, 
  Music, 
  Crown, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Heart,
  Wifi,
  WifiOff,
  Download,
  HardDrive,
  RefreshCw,
  Check,
  Loader2,
  ChevronDown,
  Sparkles,
  Database
} from 'lucide-react';
import { Track } from '../types';
import { GENRE_LIST } from '../data';
import { useAuth } from '../context/AuthContext';
import { UploadTrackModal } from './UploadTrackModal';
import { SkeletonGrid, SkeletonList } from './common/Skeleton';
import { useOfflineAudio } from '../hooks/useOfflineAudio';

interface AudioLibraryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  onOpenAuth: () => void;
  onOpenVipHub?: () => void;
  onOpenPublishAudio?: () => void;
  onOpenAuthorStudio?: () => void;
  onRefreshCustomTracks?: () => void;
  onViewAuthorChannel?: (authorUid: string, authorName?: string) => void;
  isLoading?: boolean;
}

export function AudioLibraryView({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  selectedGenre,
  onSelectGenre,
  onOpenAuth,
  onOpenVipHub,
  onOpenPublishAudio,
  onOpenAuthorStudio,
  onRefreshCustomTracks,
  onViewAuthorChannel,
  isLoading = false,
}: AudioLibraryViewProps) {
  const { 
    user, 
    isVip, 
    isAuthorVerified, 
    isAdmin, 
    favorites,
    toggleFavorite,
    deleteAudioTrackByAdmin, 
    toggleTrackVipStatusByAdmin 
  } = useAuth();

  const {
    isOnline,
    isConnectionStable,
    verifyConnectionStability,
    cachedTrackIds,
    cachedTracks,
    storageInfo,
    autoCacheFavorites,
    setAutoCacheFavorites,
    backgroundAutoSync,
    setBackgroundAutoSync,
    lastSyncTime,
    isSyncingFavorites,
    syncProgress,
    reconnectionDetected,
    setReconnectionDetected,
    cacheTrack,
    removeCachedTrack,
    syncFavorites,
    refreshFavoritesCache,
    clearAllOfflineAudio
  } = useOfflineAudio();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [vipFilterOnly, setVipFilterOnly] = useState(false);
  const [activeSpecialFilter, setActiveSpecialFilter] = useState<'all' | 'favorites' | 'offline'>('all');
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [isProcessingAdmin, setIsProcessingAdmin] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Chưa đồng bộ';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Merge network tracks and cached tracks so when disconnected, all offline-available tracks are visible
  const allAvailableTracks = useMemo(() => {
    const map = new Map<string, Track>();
    if (Array.isArray(tracks)) {
      tracks.forEach((t) => map.set(t.id, t));
    }
    if (Array.isArray(cachedTracks)) {
      cachedTracks.forEach((ct) => {
        if (!map.has(ct.id)) {
          map.set(ct.id, ct);
        }
      });
    }
    return Array.from(map.values());
  }, [tracks, cachedTracks]);

  // Auto-sync favorite tracks to offline storage if enabled and online
  useEffect(() => {
    if (!autoCacheFavorites || !isOnline || !favorites || favorites.length === 0 || allAvailableTracks.length === 0) return;

    // Check if there are favorite tracks not yet cached
    const uncachedFavoriteCount = favorites.filter((id) => !cachedTrackIds.has(id)).length;
    if (uncachedFavoriteCount > 0 && !isSyncingFavorites) {
      syncFavorites(favorites, allAvailableTracks).then((res) => {
        if (res && res.success > 0) {
          showToast(`Đã tự động lưu ${res.success} bài hát Yêu thích vào bộ nhớ ngoại tuyến`, 'success');
        }
      }).catch((err) => {
        console.warn('Auto favorites sync notice:', err);
      });
    }
  }, [autoCacheFavorites, isOnline, favorites, cachedTrackIds, isSyncingFavorites, allAvailableTracks, syncFavorites]);

  // Background Sync triggered automatically when reconnection is re-established (only when backgroundAutoSync is enabled)
  useEffect(() => {
    if (reconnectionDetected && isOnline) {
      if (backgroundAutoSync) {
        if (favorites && favorites.length > 0 && allAvailableTracks.length > 0) {
          showToast('📶 Mạng ổn định! Đang chạy Background Auto-Sync đồng bộ bài hát Yêu thích...', 'success');
          syncFavorites(favorites, allAvailableTracks).then((res) => {
            if (res && res.success > 0) {
              showToast(`Đã tự động đồng bộ ${res.success} bài hát Yêu thích sau khi có mạng`, 'success');
            }
          }).catch((err) => {
            console.warn('Background sync on reconnection error:', err);
          });
        }
      } else {
        showToast('📶 Kết nối Internet đã khôi phục. Background Auto-Sync đang tắt (có thể bật trong Cài đặt)', 'info');
      }
    }
  }, [reconnectionDetected, isOnline, backgroundAutoSync, favorites, allAvailableTracks, syncFavorites]);

  const handleAdminDeleteAudio = async (track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingTrack(track);
  };

  const confirmDeleteTrack = async () => {
    if (!deletingTrack) return;
    setIsProcessingAdmin(true);
    try {
      const res = await deleteAudioTrackByAdmin(deletingTrack.id);
      if (res.success) {
        showToast(res.message, 'success');
        // If it was cached offline, remove it from cache as well
        if (cachedTrackIds.has(deletingTrack.id)) {
          await removeCachedTrack(deletingTrack.id);
        }
        if (onRefreshCustomTracks) onRefreshCustomTracks();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi khi xóa track audio: ' + (err.message || ''), 'error');
    } finally {
      setIsProcessingAdmin(false);
      setDeletingTrack(null);
    }
  };

  const handleAdminToggleVip = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleTrackVipStatusByAdmin(track.id, Boolean(track.isVipOnly));
      if (res.success) {
        showToast(res.message, 'success');
        if (onRefreshCustomTracks) onRefreshCustomTracks();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Lỗi khi cập nhật VIP: ' + (err.message || ''), 'error');
    }
  };

  // Toggle favorite on a track, with automatic offline caching
  const handleToggleFavoriteTrack = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }

    const isFav = favorites.includes(track.id);
    try {
      await toggleFavorite(track.id);
      if (!isFav) {
        showToast(`Đã thêm "${track.title}" vào Yêu thích ❤️`, 'success');
        // Persistently save to offline storage if enabled
        if (autoCacheFavorites && isOnline) {
          await cacheTrack(track, true);
        }
      } else {
        showToast(`Đã bỏ "${track.title}" khỏi Yêu thích`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật yêu thích', 'error');
    }
  };

  // Manual download / remove from offline storage (IndexedDB / Cache API)
  const handleToggleCacheTrack = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyCached = cachedTrackIds.has(track.id);

    if (isCurrentlyCached) {
      setDownloadingTrackId(track.id);
      try {
        const ok = await removeCachedTrack(track.id);
        if (ok) {
          showToast(`Đã xóa "${track.title}" khỏi bộ nhớ ngoại tuyến`, 'success');
        }
      } catch (err: any) {
        showToast('Không thể xóa khỏi bộ nhớ ngoại tuyến: ' + (err.message || ''), 'error');
      } finally {
        setDownloadingTrackId(null);
      }
    } else {
      setDownloadingTrackId(track.id);
      try {
        const ok = await cacheTrack(track, favorites.includes(track.id));
        if (ok) {
          showToast(`Đã lưu "${track.title}" vào bộ nhớ ngoại tuyến (IndexedDB)`, 'success');
        } else {
          showToast(`Không thể tải "${track.title}" về máy`, 'error');
        }
      } catch (err: any) {
        showToast('Lỗi khi tải bài hát về máy: ' + (err.message || ''), 'error');
      } finally {
        setDownloadingTrackId(null);
      }
    }
  };

  // Manual Sync All Favorites
  const handleManualSyncFavorites = async () => {
    if (!favorites || favorites.length === 0) {
      showToast('Bạn chưa có bài hát nào trong danh sách Yêu thích', 'error');
      return;
    }
    if (!isOnline) {
      showToast('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để tải bài hát về máy', 'error');
      return;
    }

    try {
      const res = await syncFavorites(favorites, allAvailableTracks);
      if (res.success > 0) {
        showToast(`Đã đồng bộ thành công ${res.success} bài hát Yêu thích vào máy`, 'success');
      } else {
        showToast('Tất cả bài hát Yêu thích đã được lưu ngoại tuyến từ trước', 'success');
      }
    } catch (err: any) {
      showToast('Lỗi khi đồng bộ yêu thích: ' + (err.message || ''), 'error');
    }
  };

  // Manual 'Refresh Cache' Handler: Force re-downloads and updates all favorite tracks
  const handleManualRefreshCache = async () => {
    if (!isOnline) {
      showToast('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để làm mới và đồng bộ lại cache', 'error');
      return;
    }
    if (!favorites || favorites.length === 0) {
      showToast('Danh sách Yêu thích đang trống. Vui lòng thêm bài hát vào Yêu thích trước khi làm mới cache', 'error');
      return;
    }

    showToast(`Đang làm mới cache cho ${favorites.length} bài hát Yêu thích...`, 'success');
    try {
      const res = await refreshFavoritesCache(favorites, allAvailableTracks);
      if (res && res.success > 0) {
        showToast(`Đã làm mới và cập nhật thành công ${res.success} bài hát Yêu thích vào IndexedDB`, 'success');
      } else {
        showToast('Đã làm mới và đồng bộ toàn bộ cache thành công!', 'success');
      }
    } catch (err: any) {
      showToast('Lỗi khi làm mới cache: ' + (err.message || ''), 'error');
    }
  };

  // Clear Offline Storage
  const handleClearCache = async () => {
    if (cachedTrackIds.size === 0) {
      showToast('Bộ nhớ ngoại tuyến hiện đang trống', 'success');
      return;
    }
    setIsClearingCache(true);
    try {
      await clearAllOfflineAudio();
      showToast('Đã dọn dẹp sạch toàn bộ kho nhạc ngoại tuyến trong IndexedDB', 'success');
    } catch (err: any) {
      showToast('Lỗi khi dọn dẹp bộ nhớ: ' + (err.message || ''), 'error');
    } finally {
      setIsClearingCache(false);
    }
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return allAvailableTracks.filter((t) => {
      const matchesGenre = selectedGenre === 'Tất cả' || t.genre === selectedGenre;
      const matchesVip = vipFilterOnly ? Boolean(t.isVipOnly) : true;
      
      let matchesSpecial = true;
      if (activeSpecialFilter === 'favorites') {
        matchesSpecial = favorites.includes(t.id);
      } else if (activeSpecialFilter === 'offline') {
        matchesSpecial = cachedTrackIds.has(t.id);
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.genre && t.genre.toLowerCase().includes(q));

      return matchesGenre && matchesVip && matchesSpecial && matchesSearch;
    });
  }, [allAvailableTracks, selectedGenre, vipFilterOnly, activeSpecialFilter, favorites, cachedTrackIds, searchQuery]);

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:30';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (track: Track) => {
    if (track.isVipOnly && !isVip) {
      if (onOpenVipHub) {
        onOpenVipHub();
      }
      return;
    }
    if (currentTrack?.id === track.id) {
      onTogglePlay();
    } else {
      onPlayTrack(track);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 relative">
      {/* Toast Notification */}
      {adminToast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
          adminToast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
            : adminToast.type === 'info'
            ? 'bg-sky-950/95 border-sky-500/50 text-sky-200'
            : 'bg-red-950/95 border-red-500/50 text-red-200'
        }`}>
          {adminToast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : adminToast.type === 'info' ? (
            <Wifi size={18} className="text-sky-400 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{adminToast.message}</span>
          <button onClick={() => setAdminToast(null)} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Admin Confirmation Modal for Track Deletion */}
      {deletingTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Xác nhận xóa Audio (Quyền Admin)</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Bạn có chắc muốn xóa trực tiếp bài hát <strong className="text-white font-semibold">"{deletingTrack.title}"</strong> của <strong className="text-white font-semibold">{deletingTrack.artist}</strong> khỏi kho Audio?
              </p>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-2xl text-[11px] text-red-300">
              ⚠️ Hành động xóa audio này sẽ được ghi lại trong Hệ thống Minh bạch (Audit Log) không để xót bất kỳ thông tin nào.
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTrack(null)}
                disabled={isProcessingAdmin}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteTrack}
                disabled={isProcessingAdmin}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessingAdmin ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Restored & Background Sync Notification Banner */}
      {reconnectionDetected && isOnline && (
        <div className="p-4 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Wifi size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                <span>Đã khôi phục kết nối Internet</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-black uppercase">
                  Connected
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  backgroundAutoSync
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  Auto-Sync: {backgroundAutoSync ? 'BẬT' : 'TẮT'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                {backgroundAutoSync ? (
                  isSyncingFavorites
                    ? 'Đang tự động chạy Background Sync đồng bộ lại kho bài hát Yêu thích...'
                    : 'Kết nối mạng ổn định! Background Auto-Sync đã sẵn sàng.'
                ) : (
                  'Kết nối mạng ổn định! Background Auto-Sync đang tắt. Bạn có thể nhấn "Làm mới Cache" hoặc bật lại tính năng tự động.'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {!backgroundAutoSync && (
              <button
                type="button"
                onClick={() => {
                  setBackgroundAutoSync(true);
                  showToast('Đã bật tính năng Background Auto-Sync khi có kết nối mạng (Lưu vào localStorage)', 'success');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 cursor-pointer transition-colors"
                title="Bật tính năng tự động đồng bộ ngầm khi phát hiện mạng"
              >
                Bật Auto-Sync
              </button>
            )}
            <button
              id="reconnection-refresh-cache-btn"
              onClick={handleManualRefreshCache}
              disabled={isSyncingFavorites}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isSyncingFavorites ? 'animate-spin' : ''} />
              <span>{isSyncingFavorites ? 'Đang đồng bộ...' : 'Làm mới Cache'}</span>
            </button>
            <button
              onClick={() => setReconnectionDetected(false)}
              className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-500/20 cursor-pointer"
              title="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Disconnected / Offline Mode Alert Banner */}
      {!isOnline && (
        <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <WifiOff size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                <span>Chế độ Ngoại Tuyến (Offline Mode)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase">
                  Mất kết nối mạng
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                Tất cả các bài hát đã đánh dấu <strong>'Yêu thích'</strong> và lưu trong IndexedDB / Cache API ({cachedTracks.length} bài) vẫn phát trơn tru mà không cần mạng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSpecialFilter('offline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeSpecialFilter === 'offline'
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                  : 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              Chỉ xem bài hát Ngoại tuyến ({cachedTrackIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Music size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Kho Audio & Nhạc
                </h1>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black tracking-wider uppercase shadow-sm">
                    Admin Moderation
                  </span>
                )}
                {!isOnline && (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                    <WifiOff size={10} />
                    <span>Ngoại tuyến</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                {isAdmin 
                  ? 'Quản trị viên có đặc quyền xóa audio trực tiếp hoặc chuyển đổi chế độ VIP cho bất kỳ bản thu nào' 
                  : `Khám phá ${allAvailableTracks.length} bản nhạc chất lượng cao với lưu trữ ngoại tuyến IndexedDB`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Manual Refresh Cache Button */}
          <button
            id="refresh-cache-btn"
            onClick={handleManualRefreshCache}
            disabled={isSyncingFavorites || !isOnline}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isSyncingFavorites
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : !isOnline
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
            title={
              !isOnline 
                ? 'Cần kết nối mạng để làm mới và đồng bộ lại cache' 
                : 'Làm mới & Đồng bộ lại Cache yêu thích vào IndexedDB'
            }
          >
            <RefreshCw size={13} className={isSyncingFavorites ? 'animate-spin text-amber-400' : 'text-zinc-400'} />
            <span className="hidden sm:inline">Làm mới Cache</span>
            <span className="sm:hidden">Refresh</span>
          </button>

          {/* Offline Storage Manager Toggle Button */}
          <button
            id="offline-manager-toggle-btn"
            onClick={() => setShowOfflineManager(!showOfflineManager)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showOfflineManager
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                : cachedTrackIds.size > 0
                ? 'bg-zinc-900 border-zinc-800 text-emerald-400 hover:border-emerald-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Quản lý Lưu trữ Ngoại tuyến IndexedDB / Cache API"
          >
            <HardDrive size={14} className={cachedTrackIds.size > 0 ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>Ngoại tuyến ({cachedTrackIds.size})</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showOfflineManager ? 'rotate-180' : ''}`} />
          </button>

          {/* VIP Only filter switch */}
          <button
            onClick={() => setVipFilterOnly(!vipFilterOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              vipFilterOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Crown size={14} className={vipFilterOnly ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'} />
            <span>Kho nhạc VIP</span>
          </button>

          {/* View toggle */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Dạng lưới (Grid)"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Dạng danh sách (List)"
            >
              <List size={17} />
            </button>
          </div>

          {/* Upload Button */}
          <button
            id="upload-track-btn"
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else if (onOpenPublishAudio) {
                onOpenPublishAudio();
              } else {
                setIsUploadOpen(true);
              }
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Đăng Audio Tác Giả</span>
          </button>
        </div>
      </div>

      {/* Offline Storage & Favorite Synchronization Management Panel */}
      {showOfflineManager && (
        <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/95 border border-emerald-500/30 shadow-2xl space-y-4 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>Kho Lưu Trữ Ngoại Tuyến (IndexedDB & Cache API)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Offline Ready
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold ${
                    isOnline && isConnectionStable
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : !isOnline
                      ? 'bg-red-950/80 border-red-500/40 text-red-300'
                      : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline && isConnectionStable ? 'bg-emerald-400 animate-pulse' : !isOnline ? 'bg-red-400' : 'bg-amber-400'}`} />
                    {isOnline && isConnectionStable ? 'Kết nối ổn định' : !isOnline ? 'Ngoại tuyến' : 'Đang kiểm tra mạng'}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tất cả các bài hát được lưu vào IndexedDB và Cache API để bạn nghe mượt mà trên máy bay, tàu xe hoặc khi mất mạng.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                <Clock size={12} className="text-zinc-500" />
                <span>Đồng bộ: <strong className="text-zinc-200">{formatLastSync(lastSyncTime)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-emerald-400">
                <HardDrive size={12} />
                <span className="text-zinc-300">Đã lưu: <strong>{storageInfo.count} bài</strong> ({storageInfo.usedMB} MB)</span>
              </div>
            </div>
          </div>

          {/* Sync Progress Indicator if active */}
          {isSyncingFavorites && syncProgress && (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-semibold flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                  Đang đồng bộ bài Yêu thích ({syncProgress.current}/{syncProgress.total}): {syncProgress.title}
                </span>
                <span className="text-zinc-400 font-mono">
                  {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Configurable Sync & Offline Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
            {/* Setting 1: Auto Cache on Favorite */}
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-rose-400 fill-rose-400/20" />
                  <span className="text-xs font-bold text-white">Tự động tải khi 'Yêu thích'</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    autoCacheFavorites ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {autoCacheFavorites ? 'BẬT' : 'TẮT'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tự động tải file âm thanh vào IndexedDB ngay khi bạn nhấn tim yêu thích một bài hát.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={autoCacheFavorites}
                  onChange={(e) => {
                    setAutoCacheFavorites(e.target.checked);
                    showToast(e.target.checked ? 'Đã bật tự động tải khi nhấn Yêu thích' : 'Đã tắt tự động tải khi Yêu thích', 'success');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {/* Setting 2: Background Auto-Sync on Stable Reconnection */}
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RefreshCw size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white">Background Auto-Sync khi có mạng</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    backgroundAutoSync ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {backgroundAutoSync ? 'BẬT' : 'TẮT'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400 font-mono border border-zinc-700/60">
                    localStorage
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tự động kích hoạt đồng bộ hóa kho bài hát yêu thích khi mạng Internet chuyển sang trực tuyến ổn định.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  id="toggle-background-auto-sync"
                  type="checkbox"
                  checked={backgroundAutoSync}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBackgroundAutoSync(checked);
                    showToast(
                      checked 
                        ? 'Đã bật tính năng Background Auto-Sync khi có kết nối mạng ổn định (Lưu vào localStorage)' 
                        : 'Đã tắt tính năng Background Auto-Sync khi có kết nối mạng', 
                      'success'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span>Hành động thủ công:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Incremental sync */}
              <button
                type="button"
                onClick={handleManualSyncFavorites}
                disabled={isSyncingFavorites || !isOnline}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:cursor-not-allowed"
                title="Tải về các bài hát Yêu thích chưa được lưu trong máy"
              >
                {isSyncingFavorites ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    <span>Đồng bộ bài mới ({favorites.filter((id) => !cachedTrackIds.has(id)).length})</span>
                  </>
                )}
              </button>

              {/* Force Refresh All Cache */}
              <button
                type="button"
                onClick={handleManualRefreshCache}
                disabled={isSyncingFavorites || !isOnline || favorites.length === 0}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-500/30 cursor-pointer disabled:cursor-not-allowed"
                title="Tải lại và làm mới chất lượng toàn bộ danh sách bài hát yêu thích"
              >
                <RefreshCw size={13} className={isSyncingFavorites ? 'animate-spin' : ''} />
                <span>Làm mới toàn bộ Cache</span>
              </button>

              {/* Clear storage */}
              <button
                type="button"
                onClick={handleClearCache}
                disabled={isClearingCache || cachedTrackIds.size === 0}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-xs font-bold transition-all border border-zinc-700 cursor-pointer disabled:cursor-not-allowed"
                title="Giải phóng dung lượng bộ nhớ IndexedDB"
              >
                {isClearingCache ? 'Đang xóa...' : 'Dọn dẹp bộ nhớ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            id="library-search-input"
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ, phong cách âm nhạc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/80 transition-all shadow-inner"
          />
        </div>

        {/* Special Filter Pills (Tất cả / Yêu thích / Ngoại tuyến) & Genre Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {/* All */}
          <button
            type="button"
            onClick={() => {
              setActiveSpecialFilter('all');
              onSelectGenre('Tất cả');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeSpecialFilter === 'all' && selectedGenre === 'Tất cả'
                ? 'bg-white text-black border-white shadow-md'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Tất cả ({allAvailableTracks.length})
          </button>

          {/* Favorites & Offline Filter */}
          <button
            type="button"
            onClick={() => {
              setActiveSpecialFilter('favorites');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeSpecialFilter === 'favorites'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                : 'bg-zinc-900/80 text-rose-300/80 border-rose-500/30 hover:text-white hover:bg-rose-500/20'
            }`}
          >
            <Heart size={13} fill={activeSpecialFilter === 'favorites' ? 'currentColor' : 'none'} className="text-rose-400" />
            <span>Yêu thích ({favorites.length})</span>
          </button>

          {/* Saved in IndexedDB Offline Filter */}
          <button
            type="button"
            onClick={() => {
              setActiveSpecialFilter('offline');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeSpecialFilter === 'offline'
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-md font-extrabold'
                : 'bg-zinc-900/80 text-emerald-400 border-emerald-500/30 hover:text-white hover:bg-emerald-500/20'
            }`}
          >
            <HardDrive size={13} className={activeSpecialFilter === 'offline' ? 'text-black' : 'text-emerald-400'} />
            <span>Đã tải ngoại tuyến ({cachedTrackIds.size})</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />

          {/* Genre Tags */}
          {GENRE_LIST.filter(g => g !== 'Tất cả').map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setActiveSpecialFilter('all');
                onSelectGenre(genre);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedGenre === genre && activeSpecialFilter === 'all'
                  ? 'bg-zinc-100 text-black border-zinc-100 shadow-md font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Track List Results */}
      {isLoading && allAvailableTracks.length === 0 ? (
        viewMode === 'grid' ? (
          <SkeletonGrid count={8} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
        ) : (
          <SkeletonList count={8} />
        )
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl flex flex-col items-center gap-3">
          <Disc3 size={40} className="text-zinc-600 animate-spin-slow" />
          <h3 className="text-lg font-bold text-zinc-300">
            {activeSpecialFilter === 'offline' 
              ? 'Chưa có bài hát nào được tải ngoại tuyến' 
              : activeSpecialFilter === 'favorites'
              ? 'Chưa có bài hát yêu thích nào'
              : 'Không tìm thấy bài hát'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            {activeSpecialFilter === 'offline' 
              ? 'Nhấn vào biểu tượng Tải về hoặc thả tim Yêu thích trên bất kỳ bài hát nào để lưu vào máy nghe khi không có mạng.'
              : activeSpecialFilter === 'favorites'
              ? 'Nhấn vào biểu tượng trái tim trên các bài hát bạn thích để lưu trữ và tự động đồng bộ ngoại tuyến.'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn thể loại khác để khám phá thêm audio.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isLocked = track.isVipOnly && !isVip;
            const isFav = favorites.includes(track.id);
            const isCached = cachedTrackIds.has(track.id);
            const isDownloading = downloadingTrackId === track.id;
            const isPlayableOffline = isCached;

            return (
              <div
                key={track.id}
                id={`library-track-card-${track.id}`}
                onClick={() => handleTrackClick(track)}
                className={`group bg-zinc-900 border rounded-3xl p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg hover:shadow-2xl relative ${
                  track.isVipOnly
                    ? 'border-amber-500/30 hover:border-amber-500/60'
                    : isCurrent
                      ? 'border-zinc-600 bg-zinc-800/90 ring-1 ring-zinc-500/50'
                      : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                } ${!isOnline && !isPlayableOffline ? 'opacity-60 hover:opacity-80' : ''}`}
              >
                {/* Artwork */}
                <div className="aspect-square rounded-2xl overflow-hidden relative mb-3.5 bg-zinc-800 shadow-inner">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Play Overlay or Lock */}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all ${
                    isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-105 active:scale-95 transition-all ${
                      isLocked ? 'bg-amber-500 text-black' : 'bg-white text-black'
                    }`}>
                      {isLocked ? (
                        <Lock size={20} />
                      ) : isCurrent && isPlaying ? (
                        <Pause size={20} fill="currentColor" />
                      ) : (
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Top Action Overlay (Favorite + Offline Cache + Admin) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavoriteTrack(track, e)}
                      className={`p-1.5 rounded-xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
                        isFav 
                          ? 'bg-rose-500/90 text-white' 
                          : 'bg-black/60 text-zinc-300 hover:text-rose-400 hover:bg-black/80'
                      }`}
                      title={isFav ? 'Bỏ yêu thích' : 'Lưu vào Yêu thích & Ngoại tuyến'}
                    >
                      <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    {/* Offline Download / Stored Indicator Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCacheTrack(track, e)}
                      disabled={isDownloading}
                      className={`p-1.5 rounded-xl backdrop-blur-md transition-all shadow-md cursor-pointer ${
                        isDownloading
                          ? 'bg-amber-500/80 text-black'
                          : isCached
                          ? 'bg-emerald-500/90 text-black hover:bg-emerald-400'
                          : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
                      }`}
                      title={
                        isDownloading
                          ? 'Đang tải vào bộ nhớ máy...'
                          : isCached
                          ? 'Đã lưu ngoại tuyến (Nhấn để xóa khỏi máy)'
                          : 'Tải về nghe ngoại tuyến'
                      }
                    >
                      {isDownloading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isCached ? (
                        <Check size={13} className="stroke-[3]" />
                      ) : (
                        <Download size={13} />
                      )}
                    </button>

                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleAdminToggleVip(track, e)}
                          className={`p-1.5 rounded-xl text-[10px] font-bold shadow-md transition-all cursor-pointer ${
                            track.isVipOnly
                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                              : 'bg-zinc-900/90 text-zinc-300 hover:text-amber-300 border border-zinc-700'
                          }`}
                          title={track.isVipOnly ? 'Đang là VIP (Nhấn để mở Miễn Phí)' : 'Đang Miễn Phí (Nhấn để đặt VIP)'}
                        >
                          <Crown size={12} className={track.isVipOnly ? 'fill-current' : ''} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAdminDeleteAudio(track, e)}
                          className="p-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
                          title="Xóa Audio trực tiếp (Quyền Admin)"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Top Left Badges: VIP and Offline Ready */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {track.isVipOnly && (
                      <div className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                        <Crown size={11} fill="currentColor" />
                        <span>VIP</span>
                      </div>
                    )}
                    {isCached && (
                      <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-black text-[9px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-sm">
                        <HardDrive size={10} />
                        <span>Offline</span>
                      </div>
                    )}
                    {!isOnline && !isPlayableOffline && (
                      <div className="px-1.5 py-0.5 rounded-md bg-zinc-900/90 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-1 shadow-md">
                        <WifiOff size={9} />
                        <span>Cần mạng</span>
                      </div>
                    )}
                  </div>

                  {/* Genre badge */}
                  {track.genre && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-zinc-300">
                      {track.genre}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {track.isSeries && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-500/30">
                        {track.episodeNumber ? `Tập ${track.episodeNumber}` : 'Bộ truyện'}
                      </span>
                    )}
                    {track.seriesTitle && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 font-medium px-1.5 py-0.5 rounded truncate max-w-[120px]">
                        {track.seriesTitle}
                      </span>
                    )}
                  </div>

                  <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                    {track.title}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAuthorChannel) {
                          onViewAuthorChannel(track.addedBy || track.artist, track.artist);
                        }
                      }}
                      className="text-xs text-zinc-400 hover:text-amber-300 transition-colors truncate text-left font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      title="Xem trang tác giả"
                    >
                      <span>{track.artist}</span>
                      {track.isAuthorVerified && (
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Bar: Duration & Offline indicator */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(track.durationSec)}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isCached && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5" title="Sẵn sàng phát khi mất mạng">
                        <Check size={11} />
                        <span>Offline OK</span>
                      </span>
                    )}
                    {track.bitrate && (
                      <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                        {track.bitrate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 divide-y divide-zinc-800/80 shadow-xl">
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isLocked = track.isVipOnly && !isVip;
            const isFav = favorites.includes(track.id);
            const isCached = cachedTrackIds.has(track.id);
            const isDownloading = downloadingTrackId === track.id;
            const isPlayableOffline = isCached;

            return (
              <div
                key={track.id}
                id={`library-track-row-${track.id}`}
                onClick={() => handleTrackClick(track)}
                className={`group flex items-center justify-between py-3 px-2 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                  isCurrent ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/40'
                } ${!isOnline && !isPlayableOffline ? 'opacity-60 hover:opacity-80' : ''}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                  <span className="text-xs text-zinc-600 font-mono w-5 text-right hidden sm:inline">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>

                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isLocked ? (
                        <Lock size={18} className="text-amber-400" />
                      ) : isCurrent && isPlaying ? (
                        <Pause size={18} className="text-white" fill="currentColor" />
                      ) : (
                        <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {track.isSeries && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30 shrink-0">
                          {track.episodeNumber ? `Tập ${track.episodeNumber}` : 'Bộ truyện'}
                        </span>
                      )}
                      <h4 className={`font-semibold text-sm truncate ${isCurrent ? 'text-white font-bold' : 'text-zinc-200'}`}>
                        {track.title}
                      </h4>
                      {track.isVipOnly && (
                        <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded shrink-0">
                          VIP
                        </span>
                      )}
                      {isCached && (
                        <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1">
                          <HardDrive size={10} />
                          <span>Offline</span>
                        </span>
                      )}
                      {!isOnline && !isPlayableOffline && (
                        <span className="text-[9px] font-bold bg-zinc-800 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1">
                          <WifiOff size={9} />
                          <span>Cần mạng</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewAuthorChannel) {
                            onViewAuthorChannel(track.addedBy || track.artist, track.artist);
                          }
                        }}
                        className="hover:text-amber-300 transition-colors hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{track.artist}</span>
                        {track.isAuthorVerified && (
                          <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        )}
                      </button>
                      {track.seriesTitle && (
                        <span className="text-[11px] text-zinc-500 truncate hidden sm:inline">
                          • Bộ: {track.seriesTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavoriteTrack(track, e)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isFav 
                        ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' 
                        : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
                    }`}
                    title={isFav ? 'Bỏ yêu thích' : 'Lưu vào Yêu thích & Ngoại tuyến'}
                  >
                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  {/* Offline Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleCacheTrack(track, e)}
                    disabled={isDownloading}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isDownloading
                        ? 'text-amber-400 bg-amber-500/10'
                        : isCached
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    }`}
                    title={
                      isDownloading
                        ? 'Đang lưu vào bộ nhớ...'
                        : isCached
                        ? 'Đã lưu ngoại tuyến (Nhấn để xóa khỏi máy)'
                        : 'Tải về nghe ngoại tuyến'
                    }
                  >
                    {isDownloading ? (
                      <Loader2 size={15} className="animate-spin text-amber-400" />
                    ) : isCached ? (
                      <Check size={15} className="stroke-[3]" />
                    ) : (
                      <Download size={15} />
                    )}
                  </button>

                  {track.bitrate && (
                    <span className="text-xs text-amber-400/90 font-mono hidden md:inline">
                      {track.bitrate}
                    </span>
                  )}

                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                    {formatDuration(track.durationSec)}
                  </span>

                  {/* Admin Direct Actions in Row */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                      <button
                        onClick={(e) => handleAdminToggleVip(track, e)}
                        className={`p-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          track.isVipOnly
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-amber-300'
                        }`}
                        title={track.isVipOnly ? 'Đang VIP (Nhấn để mở Miễn Phí)' : 'Đang Miễn Phí (Nhấn để đặt VIP)'}
                      >
                        <Crown size={13} className={track.isVipOnly ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleAdminDeleteAudio(track, e)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="Xóa Audio trực tiếp (Admin)"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadTrackModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTrackUploaded={onRefreshCustomTracks}
      />
    </div>
  );
}
