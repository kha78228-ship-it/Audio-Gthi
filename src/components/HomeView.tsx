import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  Headphones, 
  Disc3, 
  Heart, 
  MessageSquare, 
  ArrowRight,
  Radio,
  Clock,
  Compass
} from 'lucide-react';
import { Track, ActiveTab } from '../types';
import { FEATURED_PLAYLISTS, GENRE_LIST } from '../data';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onFilterGenre: (genre: string) => void;
  onOpenAuth: () => void;
}

export function HomeView({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onSelectTab,
  onFilterGenre,
  onOpenAuth,
}: HomeViewProps) {
  const { user, favorites, toggleFavorite } = useAuth();
  const heroTrack = tracks[0] || null;
  const trendingTracks = tracks.slice(0, 6);

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:45';
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-36 sm:pb-40">
      {/* Hero Spotlight Section */}
      {heroTrack && (
        <section 
          id="home-hero-spotlight"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-zinc-800 p-6 sm:p-10 shadow-2xl"
        >
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 space-y-5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700 text-xs font-semibold text-zinc-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>Bản nhạc nổi bật hôm nay</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {heroTrack.title}
              </h1>
              
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Được tuyển chọn đặc biệt để tối ưu hóa khả năng sáng tạo và thư giãn tinh thần với âm thanh vòm chất lượng cao.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  id="hero-play-btn"
                  onClick={() => {
                    if (currentTrack?.id === heroTrack.id) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(heroTrack);
                    }
                  }}
                  className="flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-7 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {currentTrack?.id === heroTrack.id && isPlaying ? (
                    <>
                      <Pause size={20} fill="currentColor" />
                      <span>Tạm dừng phát</span>
                    </>
                  ) : (
                    <>
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                      <span>Phát ngay</span>
                    </>
                  )}
                </button>

                <button
                  id="hero-explore-library-btn"
                  onClick={() => onSelectTab('library')}
                  className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-800 text-zinc-200 hover:text-white px-5 py-3.5 rounded-2xl font-semibold border border-zinc-700/70 transition-all"
                >
                  <Compass size={18} />
                  <span>Khám phá kho audio</span>
                </button>
              </div>
            </div>

            {/* Hero Cover Art Card */}
            <div className="w-56 sm:w-64 lg:w-72 aspect-square rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-700/50 group shrink-0">
              <img
                src={heroTrack.coverUrl}
                alt={heroTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-xs text-zinc-400 font-medium">{heroTrack.genre}</span>
                <span className="text-sm font-bold text-white truncate">{heroTrack.artist}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Genre Filter Pills */}
      <section id="home-genres-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio size={20} className="text-zinc-400" />
            <span>Khám phá theo thể loại</span>
          </h2>
          <button 
            onClick={() => onSelectTab('library')}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {GENRE_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                onFilterGenre(genre);
                onSelectTab('library');
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-2 shadow-sm"
            >
              <Disc3 size={15} className="text-zinc-500" />
              <span>{genre}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Audio Tracks */}
      <section id="home-trending-section" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Xu hướng nghe nhiều</h2>
              <p className="text-xs text-zinc-500">Các bản audio thịnh hành trong tuần</p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('library')}
            className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Toàn bộ kho nhạc</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = favorites.includes(track.id);

            return (
              <div
                key={track.id}
                id={`trending-card-${track.id}`}
                onClick={() => onPlayTrack(track)}
                className={`group relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-zinc-800/90 border-zinc-700 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800/70 hover:bg-zinc-800/60 hover:border-zinc-700/60'
                }`}
              >
                {/* Cover with overlay play button */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {isCurrent && isPlaying ? (
                      <Pause size={20} className="text-white" fill="currentColor" />
                    ) : (
                      <Play size={20} className="text-white ml-0.5" fill="currentColor" />
                    )}
                  </div>
                </div>

                {/* Track details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {track.genre || 'Audio'}
                  </span>
                  <h3 className={`font-semibold text-sm truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                    {track.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Right metadata & like */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button
                    onClick={(e) => handleFavorite(track.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                  >
                    <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
                  </button>
                  <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock size={11} />
                    {formatDuration(track.durationSec)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Curated Collections */}
      <section id="home-collections-section" className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bộ sưu tập chọn lọc</h2>
              <p className="text-xs text-zinc-500">Playlist tạo sẵn cho từng trạng thái tâm trí</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_PLAYLISTS.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onFilterGenre(item.genre);
                onSelectTab('library');
              }}
              className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl overflow-hidden p-4 flex flex-col justify-between transition-all cursor-pointer shadow-lg hover:shadow-2xl"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden relative mb-4 bg-zinc-800">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                  {item.trackCount} bài
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-purple-400 mb-1 block">
                  {item.genre}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-medium">
                <span>Khám phá bộ sưu tập</span>
                <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIP Topup Banner Callout */}
      <section 
        id="home-vip-topup-banner"
        className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-yellow-950/30 border border-amber-500/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            <Sparkles size={28} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                Ưu Đãi Đặc Quyền
              </span>
              <span className="text-xs text-zinc-400">Gói Tuần 15k • Gói Tháng 20k • 1 Năm 150k</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">Nâng Cấp Gói VIP & Nhập Mã Ưu Đãi</h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
              Tận hưởng âm thanh Hi-Fi Lossless, Spatial 3D Audio, huy hiệu VIP hoàng gia và thưởng hàng ngàn Audio Points.
            </p>
          </div>
        </div>

        <button
          id="home-topup-vip-btn"
          onClick={() => onSelectTab('topup')}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold px-6 py-3.5 rounded-2xl transition-all text-xs sm:text-sm shrink-0 whitespace-nowrap shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          Nạp VIP Ngay
        </button>
      </section>

      {/* Community Banner Callout */}
      <section 
        id="home-community-banner"
        className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/90 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <MessageSquare size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Góc cộng đồng yêu âm nhạc</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg">
              Tham gia thảo luận, đánh giá các bản thu âm mới, chia sẻ cảm xúc và đề xuất các bài hát tâm đắc với mọi người.
            </p>
          </div>
        </div>

        <button
          id="home-join-community-btn"
          onClick={() => onSelectTab('community')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-3 rounded-2xl border border-zinc-700/80 transition-all text-xs sm:text-sm shrink-0 whitespace-nowrap"
        >
          Tham gia thảo luận
        </button>
      </section>
    </div>
  );
}
