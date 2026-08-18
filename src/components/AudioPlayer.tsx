import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music2, 
  Search, 
  Heart,
  Sparkles,
  ListMusic,
  Radio,
  Clock,
  Disc3,
  Crown,
  Download,
  Headphones,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Track } from '../types';
import { useAuth } from '../context/AuthContext';

interface AudioPlayerProps {
  playlist: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  filterFavorites: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSelectTrack: (track: Track) => void;
  onOpenAuth: () => void;
  onOpenVipHub?: () => void;
}

export function AudioPlayer({
  playlist,
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isMuted,
  filterFavorites,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSelectTrack,
  onOpenAuth,
  onOpenVipHub,
}: AudioPlayerProps) {
  const { user, favorites, toggleFavorite, isVip, vipSettings } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const activeTrack = currentTrack || playlist[0];

  const filteredPlaylist = playlist.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = filterFavorites ? favorites.includes(track.id) : true;
    return matchesSearch && matchesFavorites;
  });

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFavoriteClick = async (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    await toggleFavorite(trackId);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!isVip) {
      if (onOpenVipHub) onOpenVipHub();
      return;
    }

    if (activeTrack?.url) {
      setDownloadNotice(`Đang tải bản thu âm ${activeTrack.title} chất lượng cao 320kbps...`);
      const link = document.createElement('a');
      link.href = activeTrack.url;
      link.download = `${activeTrack.title} - ${activeTrack.artist}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setDownloadNotice(null), 3000);
    }
  };

  const isCurrentFavorite = activeTrack ? favorites.includes(activeTrack.id) : false;

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full pb-20">
      {/* Main Player Card */}
      <div 
        id="main-player-card"
        className={`flex-1 bg-zinc-900 border rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden transition-all ${
          isVip && vipSettings.showVipBadge
            ? 'border-amber-500/40 shadow-amber-500/5'
            : 'border-zinc-800'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* VIP Status & Sound Engine Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            {isVip && vipSettings.hifiMode ? (
              <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1 shadow-sm">
                <Crown size={12} className="text-amber-400 fill-amber-400" />
                Hi-Fi Lossless 320kbps
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg border border-zinc-700">
                Chuẩn 128kbps
              </span>
            )}

            {isVip && vipSettings.spatial3D && (
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1">
                <Headphones size={11} />
                Spatial 3D
              </span>
            )}

            {isVip && vipSettings.bassBoost && (
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/30 flex items-center gap-1">
                <Sliders size={11} />
                Bass Boost ON
              </span>
            )}
          </div>

          {/* Download offline button */}
          <button
            id="download-track-btn"
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              isVip
                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title={isVip ? "Tải bài hát chất lượng cao về máy" : "Nâng cấp VIP để tải nhạc"}
          >
            <Download size={13} />
            <span>{isVip ? 'Tải offline' : 'Mở khóa tải VIP'}</span>
          </button>
        </div>

        {downloadNotice && (
          <div className="mb-4 p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Big Artwork */}
        <div className="w-full aspect-square rounded-3xl overflow-hidden bg-zinc-800 mb-6 relative shadow-2xl group border border-zinc-800/80">
          {activeTrack?.coverUrl ? (
            <img 
              src={activeTrack.coverUrl} 
              alt={activeTrack.title} 
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <Music2 size={64} />
            </div>
          )}

          {/* Sound wave visualizer animation on artwork */}
          {isPlaying && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-2">
                <Disc3 size={18} className="text-amber-400 animate-spin" />
                <span className="text-xs font-semibold text-zinc-200">
                  {isVip && vipSettings.hifiMode ? 'Đang phát âm thanh Studio Hi-Fi' : 'Đang phát âm thanh gốc'}
                </span>
              </div>
              <div className="flex items-end gap-1 h-4">
                <span className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite] h-full rounded-full" />
                <span className="w-1 bg-amber-400 animate-[bounce_0.9s_infinite] h-3/4 rounded-full" />
                <span className="w-1 bg-amber-400 animate-[bounce_0.4s_infinite] h-4/5 rounded-full" />
                <span className="w-1 bg-amber-400 animate-[bounce_0.8s_infinite] h-2/3 rounded-full" />
                <span className="w-1 bg-amber-400 animate-[bounce_0.5s_infinite] h-full rounded-full" />
              </div>
            </div>
          )}

          {/* Quick Favorite Button on Cover */}
          <button
            id="cover-favorite-btn"
            onClick={(e) => activeTrack && handleFavoriteClick(activeTrack.id, e)}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all text-white border border-white/10 shadow-lg"
            title={isCurrentFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart
              size={20}
              className={`transition-colors ${
                isCurrentFavorite ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        </div>

        {/* Title & Artist */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {activeTrack?.genre && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  {activeTrack.genre}
                </span>
              )}
              {activeTrack?.isVipOnly && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded font-mono">
                  VIP ONLY
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
              {activeTrack?.title}
            </h2>
            <p className="text-zinc-400 font-medium text-sm sm:text-base truncate mt-0.5">
              {activeTrack?.artist}
            </p>
          </div>

          <button
            id="player-favorite-btn"
            onClick={(e) => activeTrack && handleFavoriteClick(activeTrack.id, e)}
            className={`p-3 rounded-2xl border transition-all ${
              isCurrentFavorite
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-zinc-800/80 border-zinc-700/70 text-zinc-400 hover:text-white'
            }`}
            title={isCurrentFavorite ? "Đã yêu thích" : "Yêu thích"}
          >
            <Heart
              size={22}
              className={isCurrentFavorite ? "fill-rose-500 text-rose-500" : ""}
            />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 px-1">
          <input
            id="audio-progress-bar"
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="flex justify-between mt-2.5 text-xs text-zinc-500 font-medium font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <button 
            id="prev-track-btn"
            onClick={onPlayPrev}
            className="p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800 active:scale-95"
            aria-label="Previous track"
          >
            <SkipBack size={26} fill="currentColor" />
          </button>
          
          <button 
            id="play-pause-btn"
            onClick={onTogglePlay}
            className={`p-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl ${
              isVip
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black shadow-amber-500/20'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause size={30} fill="currentColor" />
            ) : (
              <Play size={30} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          
          <button 
            id="next-track-btn"
            onClick={onPlayNext}
            className="p-3 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800 active:scale-95"
            aria-label="Next track"
          >
            <SkipForward size={26} fill="currentColor" />
          </button>
        </div>

        {/* Bottom Bar inside Player */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 px-1">
          <div className="flex items-center gap-3">
            <button 
              id="volume-mute-btn"
              onClick={onToggleMute} 
              className="text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Âm lượng"
            >
              {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-28 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          
          {user && (
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              {isVip ? '+2X Điểm Audio (VIP)' : '+5 Điểm Audio khi nghe'}
            </span>
          )}
        </div>
      </div>

      {/* Playlist / Queue Panel */}
      <div 
        id="playlist-card"
        className="flex-1 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col min-h-[460px] shadow-xl"
      >
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ListMusic size={20} className="text-zinc-400" />
            <span>{filterFavorites ? 'Danh sách yêu thích' : 'Danh sách bài hát'}</span>
          </h3>
          <span className="text-xs text-zinc-500 font-medium font-mono">
            {filteredPlaylist.length} bản nhạc
          </span>
        </div>

        {/* Search inside queue */}
        <div className="relative mb-5 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            id="playlist-search-input"
            type="text"
            placeholder="Lọc danh sách bài hát..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all"
          />
        </div>
        
        {/* Track List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1.5 custom-scrollbar max-h-[450px]">
          {filteredPlaylist.length === 0 ? (
            <div className="text-center text-zinc-500 py-16 px-4 flex flex-col items-center gap-2">
              <Heart size={28} className="text-zinc-600 mb-1 stroke-1" />
              <p className="text-sm font-medium">
                {filterFavorites
                  ? 'Chưa có bài hát nào trong danh sách yêu thích'
                  : 'Không tìm thấy bài hát phù hợp'}
              </p>
            </div>
          ) : (
            filteredPlaylist.map((track) => {
              const isCurrent = track.id === activeTrack?.id;
              const isFavorite = favorites.includes(track.id);

              return (
                <div
                  key={track.id}
                  id={`playlist-item-${track.id}`}
                  onClick={() => onSelectTrack(track)}
                  className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                    isCurrent 
                      ? 'bg-zinc-800/90 border-zinc-700 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-zinc-800/40 hover:border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 relative shadow-sm">
                      {track.coverUrl && (
                        <img 
                          src={track.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover opacity-90" 
                        />
                      )}
                      {isCurrent && isPlaying && (
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
                        <p className={`font-semibold text-xs sm:text-sm truncate ${
                          isCurrent ? 'text-white font-bold' : 'text-zinc-300'
                        }`}>
                          {track.title}
                        </p>
                        {track.isVipOnly && (
                          <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded shrink-0">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-500 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`favorite-btn-${track.id}`}
                      onClick={(e) => handleFavoriteClick(track.id, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite
                          ? 'text-rose-500'
                          : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-zinc-200'
                      }`}
                      title={isFavorite ? "Xóa khỏi yêu thích" : "Yêu thích"}
                    >
                      <Heart
                        size={16}
                        className={isFavorite ? "fill-rose-500 text-rose-500" : ""}
                      />
                    </button>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md hidden sm:inline border border-amber-500/30">
                        ĐANG PHÁT
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
