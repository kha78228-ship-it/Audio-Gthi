import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Pause, 
  BookOpen, 
  Music, 
  Gift, 
  Heart, 
  Share2, 
  UserCheck, 
  UserPlus, 
  Clock, 
  Headphones, 
  Layers, 
  ChevronRight, 
  Crown, 
  Lock, 
  Check, 
  Search,
  Plus,
  ArrowLeft,
  ExternalLink,
  Info,
  Radio,
  FileText,
  Volume2
} from 'lucide-react';
import { Track, AudioSeriesItem, AuthorProfileInfo } from '../types';
import { useAuth } from '../context/AuthContext';

interface AuthorChannelViewProps {
  authorUid?: string;
  authorStageName?: string;
  allTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onClose?: () => void;
  onOpenGiftShop?: (author: { uid: string; stageName: string; trackTitle?: string }) => void;
  onOpenPublishAudio?: (prefilledSeries?: { seriesId: string; seriesTitle: string; nextEpisodeNumber: number; genre: string }) => void;
  onOpenAuth: () => void;
  onOpenVipHub?: () => void;
}

export function AuthorChannelView({
  authorUid,
  authorStageName,
  allTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onClose,
  onOpenGiftShop,
  onOpenPublishAudio,
  onOpenAuth,
  onOpenVipHub,
}: AuthorChannelViewProps) {
  const { user, isVip, favorites, toggleFavorite } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'series' | 'tracks' | 'about'>('series');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Filter tracks belonging to this author
  const authorTracks = useMemo(() => {
    return allTracks.filter((t) => {
      if (authorUid && t.addedBy === authorUid) return true;
      if (authorStageName) {
        const cleanTarget = authorStageName.trim().toLowerCase();
        return (
          (t.stageName && t.stageName.trim().toLowerCase() === cleanTarget) ||
          (t.artist && t.artist.trim().toLowerCase() === cleanTarget) ||
          (t.addedByName && t.addedByName.trim().toLowerCase() === cleanTarget)
        );
      }
      return false;
    });
  }, [allTracks, authorUid, authorStageName]);

  // Aggregate author information
  const authorInfo = useMemo(() => {
    const firstWithBio = authorTracks.find(t => t.authorBio || t.description);
    const firstTrack = authorTracks[0];
    const isVerified = authorTracks.some(t => t.isAuthorVerified);
    const stageName = authorStageName || firstTrack?.stageName || firstTrack?.artist || firstTrack?.addedByName || 'Tác giả Haevy Audio';
    const mainGenre = firstTrack?.genre || 'Truyện Audio & Cốt Truyện';
    const coverUrl = firstTrack?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
    const bio = firstTrack?.authorBio || firstWithBio?.description || `Kênh chính thức của tác giả ${stageName} trên nền tảng Haevy Audio. Khám phá các bộ truyện audio, cốt truyện hấp dẫn và tác phẩm âm thanh đặc sắc.`;

    const totalPlays = authorTracks.reduce((acc, t) => acc + (t.plays || 0), 0);
    const totalLikes = authorTracks.reduce((acc, t) => acc + (t.likesCount || 0), 0);

    return {
      uid: authorUid || firstTrack?.addedBy || '',
      stageName,
      isVerified,
      mainGenre,
      coverUrl,
      bio,
      totalPlays,
      totalLikes,
      tracksCount: authorTracks.length,
    };
  }, [authorTracks, authorStageName, authorUid]);

  // Group tracks into Series / Storylines
  const seriesList = useMemo(() => {
    const map = new Map<string, {
      id: string;
      title: string;
      coverUrl: string;
      genre: string;
      storylineSummary: string;
      episodes: Track[];
    }>();

    authorTracks.forEach((t) => {
      if (t.isSeries || t.seriesTitle || t.seriesId) {
        const sKey = t.seriesId || t.seriesTitle || 'default-series';
        const sTitle = t.seriesTitle || t.title.split('-')[0].trim() || 'Bộ Truyện Đặc Sắc';
        
        if (!map.has(sKey)) {
          map.set(sKey, {
            id: sKey,
            title: sTitle,
            coverUrl: t.coverUrl,
            genre: t.genre || 'Truyện Audio & Cốt Truyện',
            storylineSummary: t.storylineSummary || t.description || 'Bộ truyện audio diễn đọc cảm xúc nhiều tập.',
            episodes: [],
          });
        }
        map.get(sKey)!.episodes.push(t);
      }
    });

    // Sort episodes inside each series by episodeNumber
    return Array.from(map.values()).map(s => ({
      ...s,
      authorId: authorInfo.uid,
      authorName: authorInfo.stageName,
      isAuthorVerified: authorInfo.isVerified,
      totalEpisodes: s.episodes.length,
      totalPlays: s.episodes.reduce((acc, ep) => acc + (ep.plays || 0), 0),
      totalLikes: s.episodes.reduce((acc, ep) => acc + (ep.likesCount || 0), 0),
      episodes: s.episodes.sort((a, b) => (a.episodeNumber || 1) - (b.episodeNumber || 1))
    }));
  }, [authorTracks, authorInfo]);

  const isOwner = user && authorInfo.uid && user.uid === authorInfo.uid;

  const filteredTracks = useMemo(() => {
    return authorTracks.filter(t => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.episodeTitle && t.episodeTitle.toLowerCase().includes(q)) ||
        (t.seriesTitle && t.seriesTitle.toLowerCase().includes(q)) ||
        (t.genre && t.genre.toLowerCase().includes(q))
      );
    });
  }, [authorTracks, searchQuery]);

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:30';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShareChannel = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleFollowToggle = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsFollowing(!isFollowing);
  };

  const handleTrackClick = (track: Track) => {
    if (track.isVipOnly && !isVip) {
      if (onOpenVipHub) onOpenVipHub();
      return;
    }
    if (currentTrack?.id === track.id) {
      onTogglePlay();
    } else {
      onPlayTrack(track);
    }
  };

  return (
    <div id="author-channel-view" className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header Back / Close */}
      <div className="flex items-center justify-between">
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        )}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Radio size={14} className="animate-pulse" />
          <span>Kênh Audio Tác Giả Chính Thức</span>
        </div>
      </div>

      {/* Author Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-8 md:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Author Avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-amber-500/40 shadow-2xl shrink-0 relative group">
            <img
              src={authorInfo.coverUrl}
              alt={authorInfo.stageName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {authorInfo.isVerified && (
              <div className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-emerald-500 text-black shadow-lg">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>

          {/* Author Details & Bio */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {authorInfo.stageName}
              </h1>
              {authorInfo.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  <ShieldCheck size={13} /> Tác Giả Đã Xác Minh
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">
                  Tác Giả Cộng Đồng
                </span>
              )}
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {authorInfo.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-zinc-400">
              <span className="px-3 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-medium">
                Thể loại: <strong className="text-white">{authorInfo.mainGenre}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              {/* Donate Gift */}
              <button
                onClick={() => {
                  if (onOpenGiftShop) {
                    onOpenGiftShop({
                      uid: authorInfo.uid,
                      stageName: authorInfo.stageName,
                    });
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Gift size={16} />
                <span>Tặng Quà Ủng Hộ</span>
              </button>

              {/* Follow / Unfollow */}
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  isFollowing 
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Theo dõi tác giả</span>
                  </>
                )}
              </button>

              {/* Share link */}
              <button
                onClick={handleShareChannel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép link</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Chia sẻ</span>
                  </>
                )}
              </button>

              {/* If owner: Add new track / episode */}
              {isOwner && onOpenPublishAudio && (
                <button
                  onClick={() => onOpenPublishAudio()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Đăng Tác Phẩm / Tập Mới</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800 text-center">
            <span className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Headphones size={14} className="text-indigo-400" /> Lượt nghe
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {authorInfo.totalPlays.toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800 text-center">
            <span className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <BookOpen size={14} className="text-amber-400" /> Bộ truyện & Cốt truyện
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {seriesList.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800 text-center">
            <span className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Music size={14} className="text-purple-400" /> Tổng số tập audio
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {authorInfo.tracksCount}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800 text-center">
            <span className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Heart size={14} className="text-rose-400" /> Lượt yêu thích
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {authorInfo.totalLikes.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'series'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <BookOpen size={16} />
            <span>Bộ Truyện & Cốt Truyện ({seriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Music size={16} />
            <span>Tất Cả Tác Phẩm / Tập ({authorTracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Info size={16} />
            <span>Giới Thiệu</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BỘ TRUYỆN & CỐT TRUYỆN */}
      {activeTab === 'series' && (
        <div className="space-y-6">
          {seriesList.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Chưa có bộ truyện nhiều tập nào</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Tác giả hiện chưa xuất bản bộ truyện theo cốt truyện nhiều tập. Hãy khám phá các tác phẩm audio đơn lẻ của tác giả ở tab bên cạnh.
              </p>
              {isOwner && onOpenPublishAudio && (
                <button
                  onClick={() => onOpenPublishAudio()}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Tạo Bộ Truyện Đầu Tiên</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {seriesList.map((series) => {
                const isExpanded = expandedSeriesId === series.id;
                const firstEp = series.episodes[0];
                const isSeriesPlaying = series.episodes.some(ep => currentTrack?.id === ep.id && isPlaying);

                return (
                  <div
                    key={series.id}
                    className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl hover:border-zinc-700 transition-all"
                  >
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start">
                      {/* Series Cover */}
                      <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md">
                        <img
                          src={series.coverUrl}
                          alt={series.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-[11px] border border-amber-500/30 flex items-center gap-1.5">
                          <BookOpen size={12} />
                          <span>{series.totalEpisodes} Tập</span>
                        </div>
                      </div>

                      {/* Series Meta */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                            {series.genre}
                          </span>
                          <span className="text-xs text-zinc-400">
                            🎧 {series.totalPlays.toLocaleString()} lượt nghe
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {series.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                          {series.storylineSummary}
                        </p>

                        {/* Series Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {firstEp && (
                            <button
                              onClick={() => {
                                if (firstEp.isVipOnly && !isVip) {
                                  if (onOpenVipHub) onOpenVipHub();
                                  return;
                                }
                                if (currentTrack?.id === firstEp.id) {
                                  onTogglePlay();
                                } else {
                                  onPlayTrack(firstEp);
                                }
                              }}
                              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                            >
                              {isSeriesPlaying ? (
                                <>
                                  <Pause size={15} fill="currentColor" />
                                  <span>Tạm dừng</span>
                                </>
                              ) : (
                                <>
                                  <Play size={15} fill="currentColor" />
                                  <span>Phát từ Tập 01</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedSeriesId(isExpanded ? null : series.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                          >
                            <Layers size={15} />
                            <span>{isExpanded ? 'Ẩn danh sách tập' : `Xem tất cả ${series.totalEpisodes} tập`}</span>
                          </button>

                          {isOwner && onOpenPublishAudio && (
                            <button
                              onClick={() => onOpenPublishAudio({
                                seriesId: series.id,
                                seriesTitle: series.title,
                                nextEpisodeNumber: series.totalEpisodes + 1,
                                genre: series.genre
                              })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                            >
                              <Plus size={15} />
                              <span>Thêm Tập {series.totalEpisodes + 1}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Episodes List */}
                    {isExpanded && (
                      <div className="border-t border-zinc-800 bg-zinc-950/60 p-4 sm:p-6 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Danh Sách Các Tập Trong Cốt Truyện
                          </h4>
                          <span className="text-xs text-amber-400 font-semibold">
                            Tự động phát tập tiếp theo khi nghe hết
                          </span>
                        </div>

                        <div className="space-y-2">
                          {series.episodes.map((ep, idx) => {
                            const isCurrentEp = currentTrack?.id === ep.id;
                            const isEpPlaying = isCurrentEp && isPlaying;

                            return (
                              <div
                                key={ep.id}
                                onClick={() => handleTrackClick(ep)}
                                className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                  isCurrentEp
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                    : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 font-extrabold text-xs text-zinc-400">
                                    {isEpPlaying ? (
                                      <div className="flex gap-0.5 items-end h-3">
                                        <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                                        <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                                        <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                                      </div>
                                    ) : (
                                      <span>{ep.episodeNumber || idx + 1}</span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                                        {ep.episodeTitle || ep.title}
                                      </h5>
                                      {ep.isVipOnly && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 shrink-0 flex items-center gap-0.5">
                                          <Crown size={10} /> VIP
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                      {ep.bitrate || '320kbps Hi-Fi'} • 🎧 {(ep.plays || 0).toLocaleString()} lượt nghe
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                  <span className="text-xs text-zinc-500 font-mono">
                                    {formatDuration(ep.durationSec)}
                                  </span>
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                    isEpPlaying ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:text-white'
                                  }`}>
                                    {isEpPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TẤT CẢ TÁC PHẨM & TẬP AUDIO */}
      {activeTab === 'tracks' && (
        <div className="space-y-4">
          {/* Search bar inside channel */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm tác phẩm, tên tập, cốt truyện trong kênh tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {filteredTracks.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
              <p className="text-sm text-zinc-400">Không tìm thấy tác phẩm nào phù hợp với từ khóa.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isTrackPlaying = isCurrent && isPlaying;
                const isFav = favorites.includes(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackClick(track)}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-zinc-900/70 hover:bg-zinc-850 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Track Cover */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isTrackPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex gap-0.5 items-end h-3">
                              <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                              <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                              <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                            {track.title}
                          </h4>
                          {track.isVipOnly && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 shrink-0 flex items-center gap-0.5">
                              <Crown size={10} /> VIP
                            </span>
                          )}
                          {track.episodeNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/30 shrink-0">
                              Tập {track.episodeNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 truncate">
                          <span>{track.genre || 'Truyện Audio'}</span>
                          <span>•</span>
                          <span>{track.bitrate || '320kbps'}</span>
                          <span>•</span>
                          <span>🎧 {(track.plays || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user) {
                            onOpenAuth();
                            return;
                          }
                          await toggleFavorite(track.id);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        <Heart size={16} className={isFav ? 'fill-rose-500' : ''} />
                      </button>

                      <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
                        {formatDuration(track.durationSec)}
                      </span>

                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isTrackPlaying
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-800 text-zinc-300 group-hover:bg-white group-hover:text-black'
                      }`}>
                        {isTrackPlaying ? (
                          <Pause size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GIỚI THIỆU TÁC GIẢ */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-amber-400" />
              <span>Tiểu Sử & Phong Cách Diễn Đọc</span>
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {authorInfo.bio}
            </p>
          </div>

          <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Thông Tin Xác Thực</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/60">
                <span className="text-zinc-400">Trạng thái eKYC</span>
                {authorInfo.isVerified ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={14} /> Đã Xác Thực
                  </span>
                ) : (
                  <span className="text-zinc-400 font-medium">Chưa xác thực</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/60">
                <span className="text-zinc-400">Chuyên môn</span>
                <span className="text-white font-semibold">{authorInfo.mainGenre}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/60">
                <span className="text-zinc-400">Nền tảng</span>
                <span className="text-amber-400 font-bold">Haevy Audio Studio</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
