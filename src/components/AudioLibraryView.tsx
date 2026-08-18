import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  LayoutGrid, 
  List, 
  Disc3, 
  Music, 
  Sparkles,
  Filter,
  User,
  Crown,
  Lock,
  Download
} from 'lucide-react';
import { Track } from '../types';
import { GENRE_LIST } from '../data';
import { useAuth } from '../context/AuthContext';
import { UploadTrackModal } from './UploadTrackModal';

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
  onRefreshCustomTracks?: () => void;
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
  onRefreshCustomTracks,
}: AudioLibraryViewProps) {
  const { user, favorites, toggleFavorite, isVip, vipSettings } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [vipFilterOnly, setVipFilterOnly] = useState(false);

  const filteredTracks = tracks.filter((t) => {
    const matchesGenre = selectedGenre === 'Tất cả' || t.genre === selectedGenre;
    const matchesVip = vipFilterOnly ? Boolean(t.isVipOnly) : true;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGenre && matchesVip && matchesSearch;
  });

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:30';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFavorite = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleFavorite(trackId);
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
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-36 sm:pb-40">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Music size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Kho Audio & Nhạc
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Khám phá {tracks.length} bản nhạc chất lượng cao và podcast từ cộng đồng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* VIP Only filter switch */}
          <button
            onClick={() => setVipFilterOnly(!vipFilterOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
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
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Dạng lưới (Grid)"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
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
              } else {
                setIsUploadOpen(true);
              }
            }}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            <span>Thêm Audio (+100 pts)</span>
          </button>
        </div>
      </div>

      {/* Search & Genre Filters Bar */}
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

        {/* Genre Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {GENRE_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedGenre === genre
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Track List Results */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl flex flex-col items-center gap-3">
          <Disc3 size={40} className="text-zinc-600 animate-spin-slow" />
          <h3 className="text-lg font-bold text-zinc-300">Không tìm thấy bài hát</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn thể loại khác để khám phá thêm audio.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = favorites.includes(track.id);
            const isLocked = track.isVipOnly && !isVip;

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
                }`}
              >
                {/* Artwork */}
                <div className="aspect-square rounded-2xl overflow-hidden relative mb-3.5 bg-zinc-800 shadow-inner">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                  {/* VIP Exclusive badge */}
                  {track.isVipOnly && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Crown size={11} fill="currentColor" />
                      <span>VIP</span>
                    </div>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={(e) => handleFavorite(track.id, e)}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                      isFav
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-black/50 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 hover:bg-black/70'
                    }`}
                    title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                  >
                    <Heart size={14} className={isFav ? 'fill-white' : ''} />
                  </button>

                  {/* Genre badge */}
                  {track.genre && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-zinc-300">
                      {track.genre}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(track.durationSec)}
                  </span>
                  {track.bitrate && (
                    <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                      {track.bitrate}
                    </span>
                  )}
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
            const isFav = favorites.includes(track.id);
            const isLocked = track.isVipOnly && !isVip;

            return (
              <div
                key={track.id}
                id={`library-track-row-${track.id}`}
                onClick={() => handleTrackClick(track)}
                className={`group flex items-center justify-between py-3 px-2 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                  isCurrent ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/40'
                }`}
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
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-sm truncate ${isCurrent ? 'text-white font-bold' : 'text-zinc-200'}`}>
                        {track.title}
                      </h4>
                      {track.isVipOnly && (
                        <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded shrink-0">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {track.bitrate && (
                    <span className="text-xs text-amber-400/90 font-mono hidden md:inline">
                      {track.bitrate}
                    </span>
                  )}

                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                    {formatDuration(track.durationSec)}
                  </span>

                  <button
                    onClick={(e) => handleFavorite(track.id, e)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    <Heart size={16} className={isFav ? 'fill-rose-500' : ''} />
                  </button>
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
