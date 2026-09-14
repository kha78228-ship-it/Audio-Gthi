import React, { useState } from 'react';
import { 
  Music, 
  Heart, 
  Play, 
  Pause, 
  Headphones, 
  Radio, 
  Plus, 
  Search, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Crown,
  Volume2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { Track } from '../../types';

interface ProfileAudioTabProps {
  tracks: Track[];
  favorites: string[];
  onToggleFavorite: (trackId: string) => void;
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  totalListenedMinutes: number;
  isVip: boolean;
  onOpenPublishAudio?: () => void;
  onOpenAuthorStudio?: () => void;
  onGoToTopup?: () => void;
}

export function ProfileAudioTab({
  tracks,
  favorites,
  onToggleFavorite,
  onPlayTrack,
  currentTrack,
  isPlaying,
  totalListenedMinutes,
  isVip,
  onOpenPublishAudio,
  onOpenAuthorStudio,
  onGoToTopup
}: ProfileAudioTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'my_uploads' | 'recent'>('favorites');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered tracks based on selected category & search query
  const filteredTracks = tracks.filter((track) => {
    // Category filter
    if (activeFilter === 'favorites') {
      if (!favorites.includes(track.id)) return false;
    } else if (activeFilter === 'my_uploads') {
      // If user uploaded or marked as author
      if (!track.addedBy && !track.isAuthorVerified) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = track.title.toLowerCase().includes(q);
      const matchArtist = track.artist.toLowerCase().includes(q);
      const matchGenre = track.genre ? track.genre.toLowerCase().includes(q) : false;
      return matchTitle || matchArtist || matchGenre;
    }

    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '03:45';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. AUDIO METRICS BENTO CARDS                                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Yêu thích */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Bài hát yêu thích</span>
            <Heart size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {favorites.length}
          </p>
          <p className="text-[11px] text-zinc-500">Đã lưu vào danh mục cá nhân</p>
        </div>

        {/* Metric 2: Thời gian nghe */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Thời gian thưởng thức</span>
            <Headphones size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">
            {totalListenedMinutes} <span className="text-xs font-normal text-zinc-400">phút</span>
          </p>
          <p className="text-[11px] text-zinc-500">{isVip ? 'Tích lũy x3 tốc độ VIP' : '+1 điểm / phút nghe'}</p>
        </div>

        {/* Metric 3: Chuẩn âm thanh */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Chuẩn âm thanh</span>
            <Radio size={16} className="text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-300">
            {isVip ? 'Hi-Fi 320kbps' : 'Standard 128k'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {isVip ? 'Lossless không nén suy hao' : 'Chuẩn gốc phổ thông'}
          </p>
        </div>

        {/* Metric 4: Âm trường 3D */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Spatial Audio</span>
            <Volume2 size={16} className="text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-300">
            {isVip ? '360° Sound' : 'Stereo 2.0'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {isVip ? 'Tái tạo vòm âm thanh' : 'Nâng cấp VIP để mở 3D'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTROLS BAR: SEARCH, FILTER TABS & UPLOAD SHORTCUT                     */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Sub-tabs: Yêu thích, Tất cả, Tải lên, Gần đây */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('favorites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilter === 'favorites'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Heart size={13} fill={activeFilter === 'favorites' ? 'currentColor' : 'none'} />
              <span>Yêu thích ({favorites.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Music size={13} />
              <span>Tất cả kho nhạc ({tracks.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('my_uploads')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilter === 'my_uploads'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Sparkles size={13} />
              <span>Nhạc của tôi</span>
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenPublishAudio && (
              <button
                onClick={onOpenPublishAudio}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                <span>Đăng Audio mới</span>
              </button>
            )}

            {onOpenAuthorStudio && (
              <button
                onClick={onOpenAuthorStudio}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal size={13} className="text-amber-400" />
                <span className="hidden xs:inline">Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát theo tiêu đề, nghệ sĩ hoặc thể loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRACKS LIST RENDERING                                                  */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl overflow-hidden">
        {filteredTracks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <Music size={32} className="mx-auto text-zinc-600" />
            <p className="font-bold text-zinc-400">Không tìm thấy bài hát nào</p>
            <p className="text-[11px]">
              {activeFilter === 'favorites'
                ? 'Bạn chưa đánh dấu thích bài hát nào. Hãy duyệt kho nhạc và nhấn tim để lưu!'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredTracks.map((track, idx) => {
              const isCurrentlyPlaying = isPlaying && currentTrack?.id === track.id;
              const isFav = favorites.includes(track.id);

              return (
                <div
                  key={track.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-colors group ${
                    isCurrentlyPlaying ? 'bg-amber-500/10' : 'hover:bg-zinc-850/60'
                  }`}
                >
                  {/* Left: Index + Cover + Title + Artist */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Index / Audio wave indicator */}
                    <div className="w-5 text-center shrink-0">
                      {isCurrentlyPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5">
                          <span className="w-0.5 bg-amber-400 h-full animate-bounce [animation-delay:0.1s]" />
                          <span className="w-0.5 bg-amber-400 h-2/3 animate-bounce [animation-delay:0.3s]" />
                          <span className="w-0.5 bg-amber-400 h-4/5 animate-bounce [animation-delay:0.2s]" />
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-zinc-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                      )}
                      {!isCurrentlyPlaying && (
                        <Play
                          size={13}
                          fill="currentColor"
                          className="text-amber-400 hidden group-hover:block mx-auto cursor-pointer"
                          onClick={() => onPlayTrack && onPlayTrack(track)}
                        />
                      )}
                    </div>

                    {/* Album Cover */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 group/cover">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      <button
                        onClick={() => onPlayTrack && onPlayTrack(track)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                      >
                        {isCurrentlyPlaying ? (
                          <Pause size={16} fill="currentColor" />
                        ) : (
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs sm:text-sm font-bold truncate ${
                          isCurrentlyPlaying ? 'text-amber-400' : 'text-white'
                        }`}>
                          {track.title}
                        </p>
                        {track.isVipOnly && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black shrink-0">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate">
                        <span className="truncate">{track.artist}</span>
                        {track.genre && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500">{track.genre}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration + Favorite Button + Play Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                      {formatDuration(track.durationSec)}
                    </span>

                    {/* Favorite Heart Toggle */}
                    <button
                      onClick={() => onToggleFavorite(track.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-500 hover:text-white'
                      }`}
                      title={isFav ? 'Bỏ thích' : 'Yêu thích bài hát này'}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    {/* Direct Play/Pause Button */}
                    <button
                      onClick={() => onPlayTrack && onPlayTrack(track)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isCurrentlyPlaying
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
