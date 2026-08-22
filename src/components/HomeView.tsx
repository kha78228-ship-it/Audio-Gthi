import React from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  Headphones, 
  Disc3, 
  ArrowRight, 
  Radio, 
  Clock, 
  Compass 
} from 'lucide-react';
import { Track, ActiveTab } from '../types';
import { FEATURED_PLAYLISTS, GENRE_LIST } from '../data';

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
}: HomeViewProps) {
  const heroTrack = tracks[0] || null;
  const trendingTracks = tracks.slice(0, 6);

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:45';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12">
      {/* Hero Spotlight Section */}
      {heroTrack && (
        <section 
          id="home-hero-spotlight"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-zinc-800 p-5 sm:p-8 md:p-10 shadow-2xl"
        >
          <div className="absolute -right-10 -bottom-10 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 top-0 w-48 sm:w-64 h-48 sm:h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
            <div className="flex-1 space-y-4 sm:space-y-5 text-center md:text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700 text-xs font-semibold text-zinc-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>Bản nhạc nổi bật hôm nay</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight break-words">
                {heroTrack.title}
              </h1>
              
              <p className="text-zinc-400 text-xs sm:text-base max-w-xl font-normal leading-relaxed">
                Được tuyển chọn đặc biệt để tối ưu hóa khả năng sáng tạo và thư giãn tinh thần với âm thanh vòm chất lượng cao.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
                <button
                  id="hero-play-btn"
                  onClick={() => {
                    if (currentTrack?.id === heroTrack.id) {
                      onTogglePlay();
                    } else {
                      onPlayTrack(heroTrack);
                    }
                  }}
                  className="flex items-center gap-2.5 sm:gap-3 bg-white hover:bg-zinc-200 text-black px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
                >
                  {currentTrack?.id === heroTrack.id && isPlaying ? (
                    <>
                      <Pause size={18} fill="currentColor" />
                      <span>Tạm dừng phát</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                      <span>Phát ngay</span>
                    </>
                  )}
                </button>

                <button
                  id="hero-explore-library-btn"
                  onClick={() => onSelectTab('library')}
                  className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-800 text-zinc-200 hover:text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl font-semibold border border-zinc-700/70 transition-all text-xs sm:text-sm"
                >
                  <Compass size={16} />
                  <span>Khám phá kho audio</span>
                </button>
              </div>
            </div>

            {/* Hero Cover Art Card */}
            <div className="w-44 sm:w-56 lg:w-72 aspect-square rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-700/50 group shrink-0">
              <img
                src={heroTrack.coverUrl}
                alt={heroTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 sm:p-4">
                <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">{heroTrack.genre}</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate">{heroTrack.artist}</span>
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

                {/* Right metadata */}
                <div className="flex flex-col items-end gap-1 shrink-0">
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
                <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
