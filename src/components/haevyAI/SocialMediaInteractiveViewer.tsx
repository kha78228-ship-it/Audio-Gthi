import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Search, 
  Music, 
  CheckCircle2, 
  ThumbsUp, 
  Eye, 
  RotateCw,
  Send
} from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface SocialMediaInteractiveViewerProps {
  platform: 'tiktok' | 'facebook';
  currentUrl: string;
  onNavigateUrl?: (url: string) => void;
  onSwitchToProxy?: () => void;
}

interface TikTokVideo {
  id: string;
  creator: string;
  username: string;
  avatar: string;
  description: string;
  musicTitle: string;
  videoUrl: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
}

const SAMPLE_TIKTOK_VIDEOS: TikTokVideo[] = [
  {
    id: 'tt_1',
    creator: 'Haevy Tech AI',
    username: '@haevy.vietnam',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: 'Trải nghiệm MCP Protocol và trợ lý AI thế hệ mới trên Haevy 🚀 Xem được toàn bộ web, TikTok, Facebook trực tiếp mượt mà! #haevy #congnghe #mcp #ai #fyp',
    musicTitle: 'Nhạc nền xu hướng - Âm thanh gốc Haevy Studio',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-dancing-in-a-field-of-flowers-42211-large.mp4',
    likes: 18540,
    comments: 420,
    shares: 890,
    tags: ['#haevy', '#congnghe', '#mcp', '#ai', '#fyp']
  },
  {
    id: 'tt_2',
    creator: 'Vũ Trụ Khoa Học',
    username: '@firstprinciples.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Nguyên lý Đệ Nhất (First Principles) của Elon Musk giải thích trong 60 giây. Làm thế nào để tư duy vượt trội? 💡 #khoahoc #giaoduc #firstprinciples',
    musicTitle: 'Deep Focus Ambient - First Principles Audio',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-on-a-laptop-in-a-coffee-shop-41221-large.mp4',
    likes: 42100,
    comments: 1350,
    shares: 3100,
    tags: ['#khoahoc', '#giaoduc', '#firstprinciples']
  },
  {
    id: 'tt_3',
    creator: 'Góc Thiên Nhiên Chill',
    username: '@nature.relax.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Sóng biển hoàng hôn êm dịu giúp tái tạo năng lượng sau một ngày làm việc tập trung 🌊🌅 #chill #relax #nature #haevysound',
    musicTitle: 'Ocean Waves Lofi Chill - Haevy 639Hz',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-waves-in-the-sea-at-sunset-41481-large.mp4',
    likes: 31800,
    comments: 890,
    shares: 1450,
    tags: ['#chill', '#relax', '#nature', '#haevysound']
  }
];

interface FacebookPost {
  id: string;
  author: string;
  badge?: string;
  avatar: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
}

const SAMPLE_FB_POSTS: FacebookPost[] = [
  {
    id: 'fb_1',
    author: 'Cộng Đồng Trí Tuệ Nhân Tạo & MCP Việt Nam',
    badge: 'Nhóm Công Khai • 45.000 thành viên',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    timeAgo: '20 phút trước',
    content: '🎉 Cập nhật đột phá: Trình duyệt Haevy MCP AI đã hỗ trợ đọc toàn diện mọi trang web và tương tác trực tiếp với Facebook, TikTok! Giờ đây các bạn có thể vừa xem feed, lướt tin tức, xem video shorts, vừa để AI trích xuất phân tích First Principles ngay trên cùng một màn hình.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    likes: 1250,
    comments: 184,
    shares: 92
  },
  {
    id: 'fb_2',
    author: 'Tạp Chí Công Nghệ Số',
    badge: 'Trang Đã Xác Minh ✓',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    timeAgo: '2 giờ trước',
    content: 'Model Context Protocol (MCP) là gì và vì sao nó đang thay đổi hoàn toàn cách các mô hình AI kết nối với thế giới web bên ngoài? Đọc bài phân tích chuyên sâu bên dưới cùng góc nhìn từ các kỹ sư AI hàng đầu thế giới.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    likes: 3420,
    comments: 512,
    shares: 418
  }
];

export function SocialMediaInteractiveViewer({
  platform,
  currentUrl,
  onNavigateUrl,
  onSwitchToProxy
}: SocialMediaInteractiveViewerProps) {
  // TikTok State
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customEmbedId, setCustomEmbedId] = useState<string | null>(null);
  
  // Facebook State
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [commentsList, setCommentsList] = useState<Record<string, string[]>>({
    fb_1: ['Trình duyệt quá đỉnh, vừa đọc web vừa nghe nhạc được!', 'Giao diện mượt mà hơn mong đợi.']
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse TikTok Video ID if direct video URL is passed
  React.useEffect(() => {
    if (currentUrl.includes('tiktok.com')) {
      const match = currentUrl.match(/video\/(\d+)/);
      if (match && match[1]) {
        setCustomEmbedId(match[1]);
      }
    }
  }, [currentUrl]);

  const currentTikTok = SAMPLE_TIKTOK_VIDEOS[activeVideoIdx];

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    haptics.impact('light');
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    haptics.impact('light');
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleToggleLikeVideo = (id: string) => {
    haptics.impact('medium');
    setLikedVideos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleLikePost = (id: string) => {
    haptics.impact('medium');
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (postId: string) => {
    const text = (newCommentText[postId] || '').trim();
    if (!text) return;
    haptics.impact('light');
    setCommentsList(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), text]
    }));
    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = customUrlInput.trim();
    if (!raw) return;
    if (onNavigateUrl) {
      onNavigateUrl(raw.startsWith('http') ? raw : `https://${raw}`);
    }
  };

  // =========================================================================
  // TIKTOK INTERACTIVE VIEW
  // =========================================================================
  if (platform === 'tiktok') {
    return (
      <div className="w-full flex flex-col items-center justify-start space-y-4 py-2 px-1 sm:px-4">
        {/* Top Control Banner */}
        <div className="w-full max-w-2xl bg-zinc-900/90 border border-pink-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center font-black text-black shrink-0 text-sm">
              🎵
            </span>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white truncate">TikTok Studio &amp; Video Shorts Player</h3>
              <p className="text-[11px] text-zinc-400 truncate">Xem được video shorts đầy đủ âm thanh, thao tác tương tác &amp; khám phá xu hướng</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSwitchToProxy && (
              <button
                type="button"
                onClick={onSwitchToProxy}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Chuyển sang chế độ duyệt web mobile TikTok"
              >
                <Eye size={13} />
                <span className="hidden sm:inline">Duyệt Web Proxy</span>
              </button>
            )}
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <span>Mở TikTok Tab Ngoài</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* If user provided a specific video embed */}
        {customEmbedId ? (
          <div className="w-full max-w-lg aspect-[9/16] max-h-[640px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
            <iframe
              src={`https://www.tiktok.com/embed/v2/${customEmbedId}?lang=vi`}
              title="TikTok Embed"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          /* Interactive TikTok Video Player Shell */
          <div className="w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[640px] relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col justify-between select-none">
            {/* Background Video */}
            <video
              ref={videoRef}
              src={currentTikTok.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={handleTogglePlay}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            />

            {/* Dark Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" 
            />

            {/* Top Bar inside Video Player */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">Đang Theo Dõi</span>
                <span className="text-white border-b-2 border-white pb-0.5">Dành Cho Bạn</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all cursor-pointer"
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                >
                  {isMuted ? <VolumeX size={16} className="text-amber-400" /> : <Volume2 size={16} className="text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all cursor-pointer"
                  title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="text-pink-400" />}
                </button>
              </div>
            </div>

            {/* Right Action Bar (Heart, Comment, Share, Audio) */}
            <div className="relative z-10 self-end mr-3 flex flex-col items-center gap-4 mb-16">
              {/* Creator Avatar with Follow Plus */}
              <div className="relative cursor-pointer group">
                <img
                  src={currentTikTok.avatar}
                  alt={currentTikTok.creator}
                  className="w-11 h-11 rounded-full border-2 border-white object-cover"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
                  +
                </span>
              </div>

              {/* Like Button */}
              <button
                type="button"
                onClick={() => handleToggleLikeVideo(currentTikTok.id)}
                className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <div className={`p-2.5 rounded-full ${likedVideos[currentTikTok.id] ? 'bg-pink-600 text-white' : 'bg-black/40 text-white backdrop-blur-sm'}`}>
                  <Heart size={20} fill={likedVideos[currentTikTok.id] ? 'currentColor' : 'none'} className={likedVideos[currentTikTok.id] ? 'animate-bounce' : ''} />
                </div>
                <span className="text-[11px] font-bold">
                  {(currentTikTok.likes + (likedVideos[currentTikTok.id] ? 1 : 0)).toLocaleString()}
                </span>
              </button>

              {/* Comment Button */}
              <button
                type="button"
                onClick={() => haptics.impact('light')}
                className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <MessageCircle size={20} />
                </div>
                <span className="text-[11px] font-bold">{currentTikTok.comments.toLocaleString()}</span>
              </button>

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={() => haptics.impact('light')}
                className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <Bookmark size={20} />
                </div>
                <span className="text-[11px] font-bold">Lưu</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => haptics.impact('light')}
                className="flex flex-col items-center gap-1 text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <div className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <Share2 size={20} />
                </div>
                <span className="text-[11px] font-bold">{currentTikTok.shares.toLocaleString()}</span>
              </button>

              {/* Spinning Disc Record */}
              <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center p-1.5 animate-spin shadow-lg">
                <div className="w-full h-full rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Music size={14} className="text-pink-400" />
                </div>
              </div>
            </div>

            {/* Bottom Details (Creator Name, Description, Music Bar) */}
            <div className="relative z-10 p-4 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white">{currentTikTok.creator}</span>
                <CheckCircle2 size={14} className="text-cyan-400 fill-cyan-400/20" />
                <span className="text-xs text-zinc-400 font-mono">{currentTikTok.username}</span>
              </div>

              <p className="text-xs text-zinc-100 line-clamp-3 leading-relaxed">
                {currentTikTok.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <Music size={12} className="text-pink-400 animate-pulse" />
                <span className="truncate">{currentTikTok.musicTitle}</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Selector Carousel below */}
        <div className="w-full max-w-2xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              <span>Video Xu Hướng Khác:</span>
            </span>
            <span className="text-[11px]">Bấm vào để chuyển video</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_TIKTOK_VIDEOS.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  haptics.impact('medium');
                  setActiveVideoIdx(idx);
                  setCustomEmbedId(null);
                  setIsPlaying(true);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className={`p-2 rounded-xl text-left transition-all border ${
                  activeVideoIdx === idx && !customEmbedId
                    ? 'bg-pink-500/10 border-pink-500 text-white shadow-md'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-bold truncate text-white">{v.creator}</div>
                <div className="text-[10px] text-zinc-500 truncate">{v.description.slice(0, 30)}...</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FACEBOOK INTERACTIVE VIEW
  // =========================================================================
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 py-2 px-1 sm:px-3">
      {/* Facebook Control Banner */}
      <div className="bg-zinc-900/90 border border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0 text-base shadow-md">
            f
          </span>
          <div>
            <h3 className="font-extrabold text-white text-sm">Facebook Feed &amp; Portal Tương Tác</h3>
            <p className="text-[11px] text-zinc-400">Xem bài viết, thảo luận cộng đồng, video Watch và lướt web Facebook mượt mà</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSwitchToProxy && (
            <button
              type="button"
              onClick={onSwitchToProxy}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye size={13} />
              <span>Duyệt M.Facebook Proxy</span>
            </button>
          )}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <span>Mở Facebook Gốc ↗</span>
          </a>
        </div>
      </div>

      {/* Quick Post Creator / Search Box */}
      <form onSubmit={handleLoadCustomUrl} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 flex items-center gap-2">
        <Search size={15} className="text-zinc-400 ml-2" />
        <input
          type="text"
          value={customUrlInput}
          onChange={(e) => setCustomUrlInput(e.target.value)}
          placeholder="Dán link bài viết, Fanpage hoặc Video Facebook cần xem trực tiếp..."
          className="w-full bg-transparent border-none text-white text-xs placeholder:text-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
        >
          Mở Link
        </button>
      </form>

      {/* Facebook Feed Posts */}
      <div className="space-y-4">
        {SAMPLE_FB_POSTS.map((post) => (
          <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
            {/* Header: Author + Timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white hover:underline cursor-pointer">
                    {post.author}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                    <span>{post.timeAgo}</span>
                    <span>•</span>
                    <span>{post.badge}</span>
                  </div>
                </div>
              </div>

              <span className="p-1 rounded-full text-zinc-400 hover:bg-zinc-800 cursor-pointer">•••</span>
            </div>

            {/* Post Content */}
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Media Image if present */}
            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-zinc-800 max-h-[380px] bg-black">
                <img
                  src={post.imageUrl}
                  alt="Post visual"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            )}

            {/* Engagement Counters */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                  👍
                </span>
                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
                  ❤️
                </span>
                <span>{(post.likes + (likedPosts[post.id] ? 1 : 0)).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span>{(post.comments + (commentsList[post.id]?.length || 0)).toLocaleString()} bình luận</span>
                <span>{post.shares} lượt chia sẻ</span>
              </div>
            </div>

            {/* Action Buttons: Like, Comment, Share */}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-zinc-800/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleToggleLikePost(post.id)}
                className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  likedPosts[post.id]
                    ? 'bg-blue-500/10 text-blue-400 font-bold'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <ThumbsUp size={16} fill={likedPosts[post.id] ? 'currentColor' : 'none'} />
                <span>{likedPosts[post.id] ? 'Đã Thích' : 'Thích'}</span>
              </button>

              <button
                type="button"
                onClick={() => haptics.impact('light')}
                className="py-2 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Bình luận</span>
              </button>

              <button
                type="button"
                onClick={() => haptics.impact('light')}
                className="py-2 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 size={16} />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Comment Section */}
            <div className="pt-2 space-y-2">
              {/* Existing comments */}
              {commentsList[post.id]?.map((cmt, cIdx) => (
                <div key={cIdx} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs space-y-1">
                  <span className="font-bold text-zinc-300">Thành viên Cộng Đồng:</span>
                  <p className="text-zinc-400">{cmt}</p>
                </div>
              ))}

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newCommentText[post.id] || ''}
                  onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment(post.id);
                  }}
                  placeholder="Viết bình luận công khai..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(post.id)}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shrink-0"
                  title="Gửi bình luận"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
