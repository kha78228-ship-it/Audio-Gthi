import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Heart, 
  MessageCircle, 
  Trash2, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Smile, 
  Send, 
  X, 
  Maximize2,
  Share2,
  Image as ImageIcon,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Disc3,
  Music,
  Check,
  Flame,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { FriendPhotoPost, FriendPhotoComment, Track } from '../../types';
import { 
  createFriendPhotoPost, 
  deleteFriendPhotoPost, 
  toggleLikePhotoPost, 
  addPhotoPostComment, 
  deletePhotoPostComment,
  toggleReactionPhotoPost,
  repostPhotoPost,
  PostReactionType
} from '../../services/socialService';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CameraCaptureModal } from './CameraCaptureModal';
import { SkeletonPostCard } from '../common/Skeleton';
import { InstagramStoriesBar } from './InstagramStoriesBar';

interface FeedTabProps {
  onOpenAuth: () => void;
  onPlayTrack?: (track: any) => void;
}

const MOOD_TAGS = [
  'Vui vẻ ✨', 
  'Chill cùng nhạc 🎧', 
  'Cà phê sáng ☕', 
  'Hẹn hò 💕', 
  'Du lịch ✈️', 
  'Tập gym 💪', 
  'Làm việc 💻'
];

const FACEBOOK_REACTIONS: Array<{ type: PostReactionType; emoji: string; label: string; color: string }> = [
  { type: 'like', emoji: '👍', label: 'Thích', color: 'text-sky-400' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích', color: 'text-rose-500' },
  { type: 'care', emoji: '🥰', label: 'Thương thương', color: 'text-amber-400' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-yellow-400' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-300' },
  { type: 'sad', emoji: '😢', label: 'Buồn', color: 'text-blue-400' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ', color: 'text-orange-500' }
];

export function FeedTab({ onOpenAuth, onPlayTrack }: FeedTabProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName, isAdmin } = useAuth();

  // Feed posts state
  const [posts, setPosts] = useState<FriendPhotoPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // New post staging state
  const [stagedPhoto, setStagedPhoto] = useState<string | null>(null);
  const [stagedSource, setStagedSource] = useState<'camera' | 'upload'>('upload');
  const [caption, setCaption] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Expanded comments drawer / post ID
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, FriendPhotoComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Facebook reaction popup hover state
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);
  const reactionTimerRef = useRef<any>(null);

  // Instagram double-tap heart burst animation
  const [doubleTapHeartPostId, setDoubleTapHeartPostId] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  // Saved bookmarks & copied toast
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [copiedLinkPostId, setCopiedLinkPostId] = useState<string | null>(null);

  // Fullscreen photo lightbox
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // 1. Subscribe to Friend Photo Posts
  useEffect(() => {
    setIsLoadingPosts(true);
    const qPosts = query(
      collection(db, 'friendPhotoPosts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(qPosts, (snapshot) => {
      const list: FriendPhotoPost[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as FriendPhotoPost));
      setPosts(list);
      setIsLoadingPosts(false);
    }, (err) => {
      console.warn('Feed posts error:', err);
      setIsLoadingPosts(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Comments for the active comments post
  useEffect(() => {
    if (!activeCommentsPostId) return;

    const qComments = query(
      collection(db, 'friendPhotoPosts', activeCommentsPostId, 'comments'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(qComments, (snap) => {
      const list: FriendPhotoComment[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as FriendPhotoComment));

      setComments(prev => ({
        ...prev,
        [activeCommentsPostId]: list
      }));
    });

    return () => unsubscribe();
  }, [activeCommentsPostId]);

  // Handle Double-tap on image to Like (Instagram Style)
  const handlePhotoDoubleTap = (postId: string) => {
    const now = Date.now();
    const last = lastTapRef.current[postId] || 0;

    if (now - last < 320) {
      // Double tap recognized!
      if (user) {
        toggleLikePhotoPost(postId, user.uid);
      }
      setDoubleTapHeartPostId(postId);
      setTimeout(() => setDoubleTapHeartPostId(null), 900);
    }
    lastTapRef.current[postId] = now;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setStagedPhoto(reader.result as string);
      setStagedSource('upload');
    };
    reader.readAsDataURL(file);
  };

  // Submit new photo post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!stagedPhoto) {
      alert('Vui lòng chọn hoặc chụp ảnh trước khi đăng.');
      return;
    }

    setIsSubmittingPost(true);
    setStatusNotice(null);

    const res = await createFriendPhotoPost({
      author: user,
      photoUrl: stagedPhoto,
      caption,
      captureSource: stagedSource,
      location: location.trim() || undefined,
      mood: selectedMood || undefined
    });

    setIsSubmittingPost(false);

    if (res.success) {
      setStatusNotice('🎉 Bài đăng đã được chia sẻ thành công lên Bản Tin!');
      setStagedPhoto(null);
      setCaption('');
      setSelectedMood('');
      setLocation('');
      setTimeout(() => setStatusNotice(null), 4000);
    } else {
      alert(res.message);
    }
  };

  // Add a new comment
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim() || !user) {
      if (!user) onOpenAuth();
      return;
    }

    const res = await addPhotoPostComment(postId, user, text);
    if (res.success) {
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } else {
      alert(res.message);
    }
  };

  // Threads Repost handler
  const handleRepost = async (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    await repostPhotoPost(postId, user.uid);
  };

  // Bookmark / Save toggle
  const handleToggleBookmark = (postId: string) => {
    setSavedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Copy post link
  const handleCopyLink = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/#post-${postId}`);
    setCopiedLinkPostId(postId);
    setTimeout(() => setCopiedLinkPostId(null), 2000);
  };

  // Format time ago
  const formatTimeAgo = (createdAt: any) => {
    if (!createdAt) return 'Vừa xong';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
      {/* 1. INSTAGRAM STORY CAROUSEL HIGHLIGHTS */}
      <InstagramStoriesBar
        onOpenCreateStory={() => {
          if (!user) {
            onOpenAuth();
            return;
          }
          setIsCameraModalOpen(true);
        }}
      />

      {/* 2. FACEBOOK & THREADS STYLE POST COMPOSER */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/80 shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                onOpenAuth();
                return;
              }
              setIsCameraModalOpen(true);
            }}
            className="flex-1 bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 rounded-full px-4 sm:px-5 py-2.5 text-left text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer truncate"
          >
            {user?.displayName ? `${user.displayName} ơi, bạn đang nghĩ gì thế?` : 'Đăng ảnh, chia sẻ khoảnh khắc cùng bạn bè...'}
          </button>
        </div>

        {/* Staged Photo Editing Form if photo selected */}
        {stagedPhoto ? (
          <form onSubmit={handleSubmitPost} className="space-y-4 pt-2 border-t border-zinc-800 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Xem trước ảnh sắp đăng</span>
              </span>
              <button
                type="button"
                onClick={() => setStagedPhoto(null)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo Preview */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[360px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img src={stagedPhoto} alt="Staged" className="w-full h-full object-contain" />
            </div>

            {/* Caption / Description Input */}
            <div className="space-y-1.5">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Viết cảm nghĩ, kỷ niệm hoặc miêu tả về bức ảnh này cùng bạn bè..."
                rows={3}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Google-Style Mood Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tâm trạng & Hoạt động:</label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedMood(selectedMood === tag ? '' : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedMood === tag
                        ? 'bg-amber-400 text-black font-bold border-amber-300 shadow'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Optional */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <MapPin size={14} className="text-zinc-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Thêm vị trí (ví dụ: Hà Nội, Phố Cổ, Quán Cà Phê...)"
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStagedPhoto(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingPost || !caption.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black hover:brightness-110 disabled:opacity-50 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>{isSubmittingPost ? 'Đang đăng tải...' : 'Đăng Lên Bản Tin'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Live Camera Button */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                    return;
                  }
                  setIsCameraModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
              >
                <Camera size={14} />
                <span>Chụp ảnh</span>
              </button>

              {/* Upload Image Button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sky-400 hover:text-sky-300 transition-colors font-medium cursor-pointer">
                <Upload size={14} />
                <span>Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Bảo mật E2EE & Cloud Firestore
            </span>
          </div>
        )}

        {statusNotice && (
          <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-2xl font-semibold">
            {statusNotice}
          </p>
        )}
      </div>

      {/* 3. PHOTO POSTS FEED STREAM WITH FACEBOOK/TIKTOK/INSTAGRAM/THREADS ENHANCEMENTS */}
      <div className="space-y-6">
        {isLoadingPosts && posts.length === 0 ? (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const hasLiked = user && post.likes && post.likes.includes(user.uid);
            const isAuthor = user && post.authorId === user.uid;
            const postComments = comments[post.id] || [];
            const userReaction = (post as any).reactions?.[user?.uid || ''] as PostReactionType | undefined;
            const currentReactionObj = FACEBOOK_REACTIONS.find(r => r.type === userReaction);

            // Compute unique top reaction emojis
            const reactionsMap: Record<string, number> = {};
            if ((post as any).reactions) {
              Object.values((post as any).reactions).forEach((type: any) => {
                reactionsMap[type] = (reactionsMap[type] || 0) + 1;
              });
            }
            const topReactions = Object.entries(reactionsMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type]) => FACEBOOK_REACTIONS.find(r => r.type === type)?.emoji)
              .filter(Boolean);

            return (
              <div
                key={post.id}
                className="bg-zinc-950/80 border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all hover:border-zinc-700/80 relative"
              >
                {/* Post Header: Facebook / Threads Style */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Instagram-style Ring for VIP/Authors */}
                    <div className={`w-11 h-11 rounded-full p-[2px] shadow-md ${
                      post.isAuthorVip 
                        ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600' 
                        : 'bg-zinc-800 border border-zinc-700'
                    }`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                        {post.authorPhoto ? (
                          <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {post.authorName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                          {post.authorStageName || post.authorName}
                        </h4>
                        {post.isAuthorVip && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40">
                            VIP
                          </span>
                        )}
                        {post.isAuthorVerified && (
                          <CheckCircle2 size={13} className="text-sky-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          {post.captureSource === 'camera' ? (
                            <>
                              <Camera size={11} className="text-amber-400" />
                              <span>Chụp từ App</span>
                            </>
                          ) : (
                            <>
                              <Upload size={11} className="text-sky-400" />
                              <span>Tải lên</span>
                            </>
                          )}
                        </span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-zinc-400 truncate max-w-[100px]">
                              <MapPin size={10} />
                              {post.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Options */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                      title="Sao chép liên kết bài đăng"
                    >
                      {copiedLinkPostId === post.id ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                    </button>

                    {(isAuthor || isAdmin) && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Bạn có chắc muốn xóa bài đăng này?')) {
                            await deleteFriendPhotoPost(post.id);
                          }
                        }}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Media Photo with Instagram Double-Tap & TikTok Sound Badge */}
                <div 
                  onClick={() => handlePhotoDoubleTap(post.id)}
                  className="relative aspect-[4/3] sm:aspect-[16/10] bg-black cursor-pointer group overflow-hidden select-none"
                >
                  <img
                    src={post.photoUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
                  />

                  {/* Instagram Double-Tap Heart Burst Overlay */}
                  <AnimatePresence>
                    {doubleTapHeartPostId === post.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.3, opacity: 1 }}
                        exit={{ scale: 1.8, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none text-rose-500 drop-shadow-2xl"
                      >
                        <Heart size={90} fill="currentColor" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* TikTok-Style Spinning Vinyl Record Disc Badge */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlayTrack) {
                        onPlayTrack({
                          id: 'chill-track',
                          title: post.caption.slice(0, 24) || 'Giai điệu thư giãn',
                          artist: post.authorName,
                          url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
                        } as Track);
                      }
                    }}
                    className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs hover:bg-black/80 transition-all cursor-pointer shadow-lg group/disc"
                    title="Bấm để nghe âm thanh nền bài đăng này"
                  >
                    <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-600 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                      <Disc3 size={13} className="text-amber-400" />
                    </div>
                    <span className="font-medium text-[11px] truncate max-w-[120px] sm:max-w-[160px]">
                      ♫ Âm thanh bài viết
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Zoom Fullscreen Lightbox Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhoto(post.photoUrl);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>

                {/* Post Interaction Section: Facebook Reactions + Threads Connectors */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Reaction counts bar (Facebook Style) */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      {topReactions.length > 0 ? (
                        <div className="flex items-center -space-x-1">
                          {topReactions.map((emoji, idx) => (
                            <span key={idx} className="text-sm drop-shadow">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Heart size={14} className="text-rose-500 fill-rose-500" />
                      )}
                      <span className="font-bold text-zinc-300">
                        {post.likes?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                      <span>{post.commentsCount || 0} bình luận</span>
                      {(post as any).repostsCount ? (
                        <span>• {(post as any).repostsCount} lượt đăng lại</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-1 relative">
                    {/* FACEBOOK FLOATING REACTION POPUP */}
                    <AnimatePresence>
                      {hoveredReactionPostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: -45 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          transition={{ duration: 0.15 }}
                          onMouseEnter={() => clearTimeout(reactionTimerRef.current)}
                          onMouseLeave={() => setHoveredReactionPostId(null)}
                          className="absolute left-0 bottom-full z-40 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/95 border border-zinc-700/90 rounded-full shadow-2xl backdrop-blur-md"
                        >
                          {FACEBOOK_REACTIONS.map((r) => (
                            <button
                              key={r.type}
                              type="button"
                              onClick={() => {
                                if (!user) {
                                  onOpenAuth();
                                  return;
                                }
                                toggleReactionPhotoPost(post.id, user.uid, r.type);
                                setHoveredReactionPostId(null);
                              }}
                              className="text-xl hover:scale-135 active:scale-95 transition-transform p-1 cursor-pointer"
                              title={r.label}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Like / Facebook Reaction Button */}
                      <button
                        type="button"
                        onMouseEnter={() => {
                          reactionTimerRef.current = setTimeout(() => {
                            setHoveredReactionPostId(post.id);
                          }, 250);
                        }}
                        onMouseLeave={() => {
                          clearTimeout(reactionTimerRef.current);
                        }}
                        onClick={() => {
                          if (!user) {
                            onOpenAuth();
                            return;
                          }
                          toggleReactionPhotoPost(post.id, user.uid, userReaction ? userReaction : 'like');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          userReaction
                            ? `${currentReactionObj?.color || 'text-rose-500'} bg-zinc-900`
                            : hasLiked
                            ? 'text-rose-500 bg-rose-500/10'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        {userReaction ? (
                          <span className="text-base">{currentReactionObj?.emoji}</span>
                        ) : (
                          <Heart size={17} fill={hasLiked ? 'currentColor' : 'none'} />
                        )}
                        <span>{userReaction ? currentReactionObj?.label : 'Thích'}</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <MessageCircle size={17} />
                        <span>Bình luận</span>
                      </button>

                      {/* Threads Repost Button */}
                      <button
                        type="button"
                        onClick={() => handleRepost(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors"
                        title="Đăng lại (Threads Repost)"
                      >
                        <Repeat2 size={17} />
                        <span className="hidden sm:inline">Đăng lại</span>
                      </button>
                    </div>

                    {/* Bookmark Save Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`p-2 rounded-full transition-colors ${
                        savedPosts[post.id] ? 'text-amber-400' : 'text-zinc-500 hover:text-white'
                      }`}
                      title={savedPosts[post.id] ? 'Đã lưu vào bộ sưu tập' : 'Lưu bài viết'}
                    >
                      <Bookmark size={17} fill={savedPosts[post.id] ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Caption with High Contrast Typography */}
                  <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
                    <span className="font-bold text-white mr-2">
                      {post.authorStageName || post.authorName}:
                    </span>
                    <span className="whitespace-pre-wrap">{post.caption}</span>
                  </div>

                  {/* THREADS CONVERSATION COMMENTS SECTION */}
                  {activeCommentsPostId === post.id && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-3 animate-in fade-in">
                      {/* Threaded Comments List */}
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {postComments.length > 0 ? (
                          postComments.map((cmt) => (
                            <div key={cmt.id} className="relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-zinc-800/80">
                              <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                                  {cmt.authorPhoto ? (
                                    <img src={cmt.authorPhoto} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                      {cmt.authorName?.charAt(0) || 'U'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">
                                      {cmt.authorName}
                                    </span>
                                    {(user?.uid === cmt.authorId || isAdmin) && (
                                      <button
                                        type="button"
                                        onClick={() => deletePhotoPostComment(post.id, cmt.id)}
                                        className="text-zinc-500 hover:text-rose-400 p-0.5"
                                        title="Xóa bình luận"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{cmt.text}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 text-center py-4">
                            Chưa có bình luận nào. Hãy là người đầu tiên để lại suy nghĩ!
                          </p>
                        )}
                      </div>

                      {/* Comment Input Box (Google & Facebook Style) */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                          {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                              {user?.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="Viết bình luận cho bài đăng..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-amber-400 hover:text-amber-300 hover:bg-zinc-800"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6">
            <ImageIcon size={40} className="mx-auto text-zinc-600 mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-zinc-300">Chưa có bài đăng nào trong Bản Tin</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Hãy chụp ngay một tấm ảnh hoặc tải ảnh từ thiết bị để trở thành người đầu tiên chia sẻ khoảnh khắc với bạn bè!
            </p>
          </div>
        )}
      </div>

      {/* Camera Capture In-App Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onPhotoCaptured={(photoData) => {
            setStagedPhoto(photoData);
            setStagedSource('camera');
            setIsCameraModalOpen(false);
          }}
        />
      )}

      {/* Lightbox Fullscreen Photo Preview */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="fixed inset-0" onClick={() => setLightboxPhoto(null)} />
            <div className="relative max-w-4xl max-h-[90vh] z-10">
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80"
              >
                <X size={20} />
              </button>
              <img
                src={lightboxPhoto}
                alt="Enlarged"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-zinc-800"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
