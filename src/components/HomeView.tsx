import React, { useMemo } from 'react';
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
  Compass,
  Plus,
  BookOpen,
  CheckCircle2,
  Sliders,
  Pin,
  Crown,
  Bell,
  Zap,
  Tag,
  Layers,
  Music,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Track, ActiveTab } from '../types';
import { FEATURED_PLAYLISTS, GENRE_LIST } from '../data';
import { useAuth } from '../context/AuthContext';
import { HomeFriendsMessageSection } from './home/HomeFriendsMessageSection';
import { 
  Skeleton, 
  SkeletonHero, 
  SkeletonTrackCard, 
  SkeletonGrid, 
  SkeletonText 
} from './common/Skeleton';

interface HomeViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onFilterGenre: (genre: string) => void;
  onOpenAuth: () => void;
  onOpenPublishAudio?: () => void;
  onViewAuthorChannel?: (authorUid: string, authorName?: string) => void;
  isLoading?: boolean;
}

export function HomeViewSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="w-6 h-6" />
          <Skeleton variant="text" className="w-48 sm:w-80 h-4" />
        </div>
        <Skeleton variant="pill" className="w-24 h-6 hidden sm:block" />
      </div>

      {/* Hero Spotlight Skeleton */}
      <SkeletonHero />

      {/* Genre Pills Row Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="pill" className="w-24 sm:w-28 h-9 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Trending Tracks Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" className="w-7 h-7" />
            <Skeleton variant="text" className="w-40 sm:w-56 h-6" />
          </div>
          <Skeleton variant="pill" className="w-20 h-7" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTrackCard key={i} />
          ))}
        </div>
      </div>

      {/* Playlists & Collections Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" className="w-7 h-7" />
            <Skeleton variant="text" className="w-44 sm:w-60 h-6" />
          </div>
          <Skeleton variant="pill" className="w-20 h-7" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
              <Skeleton variant="rounded" className="w-full h-40 rounded-2xl" />
              <Skeleton variant="text" className="w-3/4 h-5" />
              <Skeleton variant="text" className="w-full h-3.5" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
  onOpenPublishAudio,
  onViewAuthorChannel,
  isLoading = false,
}: HomeViewProps) {
  const { user, isAdmin, isSuperAdmin, homeCustomConfig } = useAuth();

  // If initial load or explicit isLoading state with no cached tracks
  if (isLoading && tracks.length === 0) {
    return <HomeViewSkeleton />;
  }

  // Determine if current user qualifies for the custom admin configuration target audience
  const isAudienceMatched = useMemo(() => {
    if (!homeCustomConfig) return true;
    const audience = homeCustomConfig.targetAudience || 'all';
    if (audience === 'all') return true;
    if (isAdmin || isSuperAdmin) return true; // Admins always see changes
    if (audience === 'guests') return !user || user.isAnonymous;
    if (audience === 'users') return !!user && !user.isAnonymous;
    if (audience === 'vips' || audience === 'vip') return !!user && (user as any).isVip;
    if (audience === 'admins') return isAdmin || isSuperAdmin;
    return true;
  }, [homeCustomConfig, user, isAdmin, isSuperAdmin]);

  // Section visibility settings with defaults
  const showGenres = isAudienceMatched 
    ? (homeCustomConfig?.sectionVisibility?.genres ?? true) 
    : true;
  const showTrending = isAudienceMatched 
    ? (homeCustomConfig?.sectionVisibility?.trending ?? true) 
    : true;
  const showCollections = isAudienceMatched 
    ? (homeCustomConfig?.sectionVisibility?.collections ?? true) 
    : true;
  const showGreetingBanner = isAudienceMatched 
    ? (homeCustomConfig?.showGreetingBanner ?? false) 
    : false;

  // Custom hero resolution
  const heroSectionConfig = isAudienceMatched ? homeCustomConfig?.heroSection : null;
  const customHeroTrack = useMemo(() => {
    if (heroSectionConfig?.heroTrackId) {
      return tracks.find(t => t.id === heroSectionConfig.heroTrackId) || tracks[0] || null;
    }
    return tracks[0] || null;
  }, [heroSectionConfig?.heroTrackId, tracks]);

  const heroTrack = customHeroTrack;
  const heroTitle = (heroSectionConfig?.overrideHero && heroSectionConfig?.heroTitle) 
    ? heroSectionConfig.heroTitle 
    : heroTrack?.title || 'Haevy Audio Platform';
  const heroSubtitle = (heroSectionConfig?.overrideHero && heroSectionConfig?.heroSubtitle) 
    ? heroSectionConfig.heroSubtitle 
    : (heroTrack?.storylineSummary || heroTrack?.description || 'Nền tảng âm thanh lossless, podcast và radio trực tuyến.');
  const heroBadge = (heroSectionConfig?.overrideHero && heroSectionConfig?.heroBadgeText) 
    ? heroSectionConfig.heroBadgeText 
    : (heroTrack?.isSeries ? 'Cốt truyện nổi bật hôm nay' : 'Bản audio nổi bật hôm nay');
  const heroCtaText = (heroSectionConfig?.overrideHero && heroSectionConfig?.heroCtaText)
    ? heroSectionConfig.heroCtaText
    : 'Phát ngay';
  const heroCover = (heroSectionConfig?.overrideHero && heroSectionConfig?.heroCoverUrl)
    ? heroSectionConfig.heroCoverUrl
    : heroTrack?.coverUrl;
  const heroStyle = heroSectionConfig?.heroStyle || 'default';

  // Admin Pinned Tracks
  const pinnedTracks = useMemo(() => {
    if (!isAudienceMatched || !homeCustomConfig?.pinnedTrackIds?.length) return [];
    return homeCustomConfig.pinnedTrackIds
      .map(id => tracks.find(t => t.id === id))
      .filter((t): t is Track => !!t);
  }, [isAudienceMatched, homeCustomConfig?.pinnedTrackIds, tracks]);

  const trendingTracks = tracks.slice(0, 6);

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:45';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Hero Style Classes Mapping
  const getHeroWrapperStyle = () => {
    switch (heroStyle) {
      case 'cinema':
        return 'bg-gradient-to-br from-black via-zinc-950 to-zinc-900 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)]';
      case 'glass':
        return 'bg-zinc-900/60 backdrop-blur-xl border-zinc-700/60 shadow-2xl';
      case 'neon':
        return 'bg-zinc-950 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30';
      case 'minimal':
        return 'bg-zinc-900/80 border-zinc-800 shadow-lg';
      default:
        return 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border-zinc-800 shadow-2xl';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12">
      {/* Admin Notice Pill for Admins */}
      {(isAdmin || isSuperAdmin) && homeCustomConfig && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-amber-400 shrink-0 animate-spin-slow" />
            <span>
              Chế độ hiển thị Admin đang hoạt động • Phân khúc khán giả: <strong className="uppercase font-bold text-amber-300">
                {homeCustomConfig.targetAudience === 'all' ? 'Tất cả người dùng' :
                 homeCustomConfig.targetAudience === 'guests' ? 'Khách chưa đăng nhập' :
                 homeCustomConfig.targetAudience === 'users' ? 'Thành viên đã đăng nhập' :
                 homeCustomConfig.targetAudience === 'vips' ? 'Hội viên VIP' : 'Quản trị viên'}
              </strong>
            </span>
          </div>
          <button
            onClick={() => onSelectTab('admin')}
            className="px-3 py-1 rounded-xl bg-amber-500 text-black font-extrabold text-[11px] hover:bg-amber-400 transition-all cursor-pointer shadow-md"
          >
            Chỉnh sửa ngay
          </button>
        </div>
      )}

      {/* Dynamic Greeting Banner (Configurable by Admin) */}
      {showGreetingBanner && homeCustomConfig?.greetingBanner && (
        <section 
          id="home-greeting-banner"
          className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border transition-all shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            backgroundColor: homeCustomConfig.greetingBanner.bgColor || '#18181b',
            color: homeCustomConfig.greetingBanner.textColor || '#ffffff',
            borderColor: '#3f3f46'
          }}
        >
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            {homeCustomConfig.greetingBanner.badgeText && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 border border-white/20">
                <Sparkles size={12} className="text-amber-300" />
                {homeCustomConfig.greetingBanner.badgeText}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              {homeCustomConfig.greetingBanner.title}
            </h2>
            {homeCustomConfig.greetingBanner.subtitle && (
              <p className="text-xs sm:text-sm opacity-90 max-w-2xl leading-relaxed">
                {homeCustomConfig.greetingBanner.subtitle}
              </p>
            )}
          </div>

          {homeCustomConfig.greetingBanner.ctaText && (
            <button
              onClick={() => {
                const targetTab = (homeCustomConfig.greetingBanner?.ctaLinkTab || 'library') as ActiveTab;
                onSelectTab(targetTab);
              }}
              className="px-6 py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 font-extrabold text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{homeCustomConfig.greetingBanner.ctaText}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </section>
      )}

      {/* Hero Spotlight Section */}
      {heroTrack || heroSectionConfig?.overrideHero ? (
        <section 
          id="home-hero-spotlight"
          className={`relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-10 transition-all ${getHeroWrapperStyle()}`}
        >
          {heroStyle === 'neon' ? (
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          ) : (
            <>
              <div className="absolute -right-10 -bottom-10 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-1/3 top-0 w-48 sm:w-64 h-48 sm:h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
            <div className="flex-1 space-y-4 sm:space-y-5 text-center md:text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700 text-xs font-semibold text-zinc-300">
                <Sparkles size={14} className={heroStyle === 'neon' ? 'text-cyan-400' : 'text-amber-400'} />
                <span>{heroBadge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight break-words">
                {heroTitle}
              </h1>
              
              <p className="text-zinc-400 text-xs sm:text-base max-w-xl font-normal leading-relaxed">
                {heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
                {heroTrack && (
                  <button
                    id="hero-play-btn"
                    onClick={() => {
                      if (currentTrack?.id === heroTrack.id) {
                        onTogglePlay();
                      } else {
                        onPlayTrack(heroTrack);
                      }
                    }}
                    className={`flex items-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base ${
                      heroStyle === 'neon' 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black' 
                        : 'bg-white hover:bg-zinc-200 text-black'
                    }`}
                  >
                    {currentTrack?.id === heroTrack.id && isPlaying ? (
                      <>
                        <Pause size={18} fill="currentColor" />
                        <span>Tạm dừng phát</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                        <span>{heroCtaText}</span>
                      </>
                    )}
                  </button>
                )}

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
            {heroCover && (
              <div className={`w-44 sm:w-56 lg:w-72 aspect-square rounded-2xl overflow-hidden relative shadow-2xl border group shrink-0 ${
                heroStyle === 'neon' ? 'border-cyan-500/50' : 'border-zinc-700/50'
              }`}>
                <img
                  src={heroCover}
                  alt={heroTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 sm:p-4">
                  <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                    {heroTrack?.genre || 'Đặc sắc'}
                  </span>
                  {heroTrack && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAuthorChannel && heroTrack) {
                          onViewAuthorChannel(heroTrack.addedBy || heroTrack.artist, heroTrack.artist);
                        }
                      }}
                      className="text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition-colors truncate text-left"
                    >
                      {heroTrack.artist}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Empty State when no author tracks exist yet */
        <section className="relative overflow-hidden rounded-3xl bg-zinc-900/80 border border-zinc-800 p-8 sm:p-12 text-center shadow-xl flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <Radio size={32} />
          </div>
          <div className="max-w-md space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Chào Mừng Đến Với Haevy Audio Hub
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Hệ thống đã được làm sạch và chuyển đổi hoàn toàn sang Nền tảng Tác giả Tự Do & Cốt Truyện Audio.
            </p>
          </div>
          {onOpenPublishAudio && (
            <button
              onClick={onOpenPublishAudio}
              className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-extrabold text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Đăng Tác Phẩm / Bộ Truyện Đầu Tiên</span>
            </button>
          )}
        </section>
      )}

      {/* Haevy Message & Bạn Bè Trang Chủ (Combo Hoạt Ảnh Vũ Trụ & Xu Haevy Lite) */}
      <HomeFriendsMessageSection
        onOpenChatWithUser={(uid) => {
          onSelectTab('messages');
        }}
        onGoToMessages={() => onSelectTab('messages')}
        onGoToFriends={() => onSelectTab('messages')}
        onOpenAuth={onOpenAuth}
      />

      {/* Admin Pinned Tracks Showcase (Ghim Bởi Admin) */}
      {pinnedTracks.length > 0 && (
        <section id="home-pinned-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                <Pin size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Tuyển Chọn Đề Xuất Bởi Admin</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    {pinnedTracks.length} tác phẩm
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">Được lựa chọn và ghim trực tiếp bởi ban quản trị Haevy</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  id={`pinned-card-${track.id}`}
                  onClick={() => onPlayTrack(track)}
                  className={`group relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
                      : 'bg-zinc-900/90 border-amber-500/20 hover:border-amber-500/50 hover:bg-zinc-900'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1">
                        <Star size={10} className="fill-amber-400" />
                        Ghim
                      </span>
                      <span className="text-[10px] text-zinc-500">•</span>
                      <span className="text-[10px] text-zinc-400 font-semibold truncate">
                        {track.genre || 'Audio'}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm truncate mt-0.5 ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock size={11} />
                      {formatDuration(track.durationSec)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Genre Filter Pills */}
      {showGenres && (
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
      )}

      {/* Trending Audio Tracks */}
      {showTrending && (
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
      )}

      {/* Featured Curated Collections */}
      {showCollections && (
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
      )}
    </div>
  );
}

