import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  Play, 
  Pause, 
  User, 
  Sparkles, 
  Music2, 
  MessageCircle, 
  Clock, 
  Trash2, 
  Loader2,
  AlertCircle,
  Tag,
  Crown,
  Pin,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Maximize2,
  Upload,
  Layers,
  Sparkle
} from 'lucide-react';
import { CommunityPost, Track, CommunityComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CommunityViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenAuth: () => void;
  initialPendingImage?: string | null;
  initialPendingText?: string | null;
  initialPendingTag?: string | null;
  onClearPendingImage?: () => void;
}

const POST_TAGS = [
  '#HaevySpace',
  '#TranhVẽ3D',
  '#ThảoLuận',
  '#GợiÝBàiHát',
  '#ĐánhGiá',
  '#CảmXúc',
  '#GócTậpTrung',
  '#Podcast',
  '#ThôngBáoAdmin'
];

export function CommunityView({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenAuth,
  initialPendingImage,
  initialPendingText,
  initialPendingTag,
  onClearPendingImage
}: CommunityViewProps) {
  const { 
    user, 
    isVip, 
    isAdmin, 
    addAudioPoints,
    deleteCommentByAdmin,
    deleteCommunityPostByAdmin,
    pinCommunityPostByAdmin
  } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(initialPendingText || '');
  const [attachedImage, setAttachedImage] = useState<string | null>(initialPendingImage || null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>(initialPendingTag || (initialPendingImage ? '#HaevySpace' : '#ThảoLuận'));
  const [activeFilterTag, setActiveFilterTag] = useState<string>('Tất cả');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial pending image if prop updates
  useEffect(() => {
    if (initialPendingImage) {
      setAttachedImage(initialPendingImage);
      if (initialPendingTag) setSelectedTag(initialPendingTag);
      else setSelectedTag('#HaevySpace');
      if (initialPendingText && !content) setContent(initialPendingText);
    }
  }, [initialPendingImage, initialPendingText, initialPendingTag]);

  // Check localStorage for temporary shared spatial image on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('haevy_space_temp_share_image');
      if (stored && !attachedImage) {
        setAttachedImage(stored);
        setSelectedTag('#HaevySpace');
        if (!content) {
          setContent('✨ Vừa sáng tác tác phẩm Không Gian 3D trong Haevy Space! Mời mọi người cùng thưởng thức và chia sẻ cảm nghĩ nhé!');
        }
        localStorage.removeItem('haevy_space_temp_share_image');
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Active expanded comments per post
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [commentLoadingMap, setCommentLoadingMap] = useState<Record<string, boolean>>({});

  // Listen to community posts from Firestore
  useEffect(() => {
    const postsQuery = query(
      collection(db, 'communityPosts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const loadedPosts: CommunityPost[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Thành viên ẩn danh',
            authorPhoto: data.authorPhoto || '',
            isAuthorVip: data.isAuthorVip || false,
            isAuthorAdmin: data.isAuthorAdmin || false,
            content: data.content || '',
            imageUrl: data.imageUrl || '',
            spatialInfo: data.spatialInfo || undefined,
            trackId: data.trackId || '',
            trackTitle: data.trackTitle || '',
            trackArtist: data.trackArtist || '',
            trackCover: data.trackCover || '',
            trackUrl: data.trackUrl || '',
            likes: Array.isArray(data.likes) ? data.likes : [],
            commentsCount: data.commentsCount || 0,
            tag: data.tag || '#ThảoLuận',
            isPinned: Boolean(data.isPinned),
            createdAt: data.createdAt,
          };
        });
        setPosts(loadedPosts);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to comments of expanded post
  useEffect(() => {
    if (!expandedCommentsPostId) return;

    const commentsQuery = query(
      collection(db, 'communityPosts', expandedCommentsPostId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const comments: CommunityComment[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Người dùng',
            authorPhoto: data.authorPhoto || '',
            isAuthorVip: data.isAuthorVip || false,
            isAuthorAdmin: data.isAuthorAdmin || false,
            text: data.text || '',
            createdAt: data.createdAt,
          };
        });
        setCommentsMap((prev) => ({
          ...prev,
          [expandedCommentsPostId]: comments,
        }));
      },
      (err) => {
        console.error('Error fetching comments:', err);
      }
    );

    return () => unsubscribeComments();
  }, [expandedCommentsPostId]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAttachedImage(event.target.result);
        if (selectedTag === '#ThảoLuận') setSelectedTag('#HaevySpace');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClearPendingImage) onClearPendingImage();
    try {
      localStorage.removeItem('haevy_space_temp_share_image');
    } catch (e) {}
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!content.trim() && !attachedImage) {
      setError('Vui lòng nhập nội dung chia sẻ hoặc đính kèm ảnh.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let attachedTrack: Track | undefined;
      if (selectedTrackId) {
        attachedTrack = tracks.find((t) => t.id === selectedTrackId);
      }

      const isSpatialArtwork = selectedTag === '#HaevySpace' || selectedTag === '#TranhVẽ3D' || Boolean(attachedImage);

      await addDoc(collection(db, 'communityPosts'), {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Yêu Âm Nhạc',
        authorPhoto: user.photoURL || '',
        isAuthorVip: isVip,
        isAuthorAdmin: isAdmin,
        content: content.trim() || (attachedImage ? '✨ Chia sẻ tác phẩm nghệ thuật không gian 3D' : ''),
        imageUrl: attachedImage || '',
        trackId: attachedTrack?.id || '',
        trackTitle: attachedTrack?.title || '',
        trackArtist: attachedTrack?.artist || '',
        trackCover: attachedTrack?.coverUrl || '',
        trackUrl: attachedTrack?.url || '',
        likes: [],
        commentsCount: 0,
        tag: selectedTag,
        isPinned: false,
        createdAt: serverTimestamp(),
      });

      // Award +25 points for engaging with visual artwork or post
      const pointsToEarn = isSpatialArtwork ? 25 : 20;
      await addAudioPoints(pointsToEarn, isSpatialArtwork ? 'Chia sẻ tranh 3D Haevy Space' : 'Chia sẻ bài viết cộng đồng', 'post');

      setContent('');
      setSelectedTrackId('');
      handleClearAttachedImage();
      showToast(`Đã đăng bài viết thành công (+${pointsToEarn} pts)!`);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError('Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post: CommunityPost) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const postRef = doc(db, 'communityPosts', post.id);
    const hasLiked = post.likes.includes(user.uid);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = commentInputMap[postId]?.trim();
    if (!text) return;

    setCommentLoadingMap((prev) => ({ ...prev, [postId]: true }));

    try {
      await addDoc(collection(db, 'communityPosts', postId, 'comments'), {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Người nghe nhạc',
        authorPhoto: user.photoURL || '',
        isAuthorVip: isVip,
        isAuthorAdmin: isAdmin,
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'communityPosts', postId), {
        commentsCount: increment(1),
      });

      // Award +5 points for comment
      await addAudioPoints(5, 'Bình luận bài viết cộng đồng', 'comment');

      setCommentInputMap((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoadingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // ADMIN OR AUTHOR: Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(isAdmin ? 'Quản trị viên: Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này?' : 'Bạn có chắc chắn muốn xóa bài viết của mình không?')) return;
    if (isAdmin) {
      const res = await deleteCommunityPostByAdmin(postId);
      showToast(res.message);
    } else {
      try {
        await deleteDoc(doc(db, 'communityPosts', postId));
        showToast('Đã xóa bài viết thành công.');
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  // ADMIN: Pin / Unpin Post
  const handleTogglePinPost = async (post: CommunityPost) => {
    if (!isAdmin) return;
    const res = await pinCommunityPostByAdmin(post.id, !post.isPinned);
    showToast(res.message);
  };

  // ADMIN OR AUTHOR: Delete Comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm(isAdmin ? 'Quản trị viên: Bạn có chắc chắn muốn xóa bình luận này?' : 'Bạn có chắc chắn muốn xóa bình luận này?')) return;
    if (isAdmin) {
      const res = await deleteCommentByAdmin(postId, commentId);
      showToast(res.message);
    } else {
      try {
        await deleteDoc(doc(db, 'communityPosts', postId, 'comments', commentId));
        await updateDoc(doc(db, 'communityPosts', postId), {
          commentsCount: increment(-1),
        });
        showToast('Đã xóa bình luận.');
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    }
  };

  // Sort pinned posts first
  const filteredPosts = posts
    .filter((p) => {
      if (activeFilterTag === 'Tất cả') return true;
      return p.tag === activeFilterTag;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 bg-zinc-900 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Cộng đồng Âm nhạc
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={12} className="text-amber-400" />
                  Đặc Quyền Quản Trị
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Không gian chia sẻ cảm xúc, review bản nhạc và kết nối cùng những người yêu nghệ thuật (+20 pts/bài)
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <span>Admin có đặc quyền xóa mọi bài viết & bình luận</span>
          </div>
        )}
      </div>

      {/* Post Creation Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl relative">
        <div className="flex items-center gap-3 mb-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <User size={16} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {user ? `Chia sẻ với tư cách @${user.displayName || user.email?.split('@')[0]}` : 'Đăng nhập để tham gia thảo luận'}
            </span>
            {isAdmin && (
              <span className="text-[10px] font-black bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono shadow-sm flex items-center gap-0.5">
                <ShieldCheck size={10} />
                ADMIN
              </span>
            )}
            {isVip && !isAdmin && (
              <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5">
                <Crown size={10} className="fill-amber-400 text-amber-400" />
                VIP
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-2 text-red-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              user
                ? isAdmin
                  ? 'Viết bài viết hoặc thông báo cộng đồng với tư cách Quản trị viên...'
                  : 'Bạn đang lắng nghe điều gì? Hãy chia sẻ cảm xúc, tác phẩm không gian 3D hoặc bài hát tâm đắc...'
                : 'Vui lòng đăng nhập tài khoản để viết bài thảo luận cùng cộng đồng...'
            }
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all resize-none"
          />

          {/* Attached Image Preview in Composer */}
          {attachedImage && (
            <div className="relative p-2.5 rounded-2xl bg-zinc-950/80 border border-sky-500/40 flex items-center justify-between gap-3 animate-in zoom-in-95">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black border border-sky-400/40 shrink-0">
                  <img src={attachedImage} alt="Attached Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLightboxImage(attachedImage)}
                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    title="Xem phóng to"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-300">
                    <Sparkles size={13} className="text-amber-300" />
                    <span>Tác phẩm Không Gian 3D / Hình ảnh</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    File ảnh tạm thời đã sẵn sàng chia sẻ lên bảng tin cộng đồng
                  </p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {selectedTag}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearAttachedImage}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 transition-all shrink-0"
                title="Gỡ ảnh"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tag selector */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {POST_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Attach Track from Library */}
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none max-w-[200px] truncate cursor-pointer"
              >
                <option value="">+ Đính kèm bài hát</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    🎵 {t.title} - {t.artist}
                  </option>
                ))}
              </select>

              {/* Attach Image from File */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  attachedImage
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/80 hover:border-zinc-600'
                }`}
                title="Đính kèm ảnh hoặc ảnh chụp 3D Haevy Space"
              >
                <ImageIcon size={14} />
                <span className="hidden sm:inline">{attachedImage ? 'Đổi ảnh' : 'Đính kèm ảnh'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              <span>{isAdmin ? 'Đăng bài (Admin)' : (attachedImage ? 'Đăng tác phẩm (+25 pts)' : 'Đăng bài (+20 pts)')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Community Tags Navigation Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setActiveFilterTag('Tất cả')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilterTag === 'Tất cả'
              ? 'bg-zinc-200 text-black border-white shadow-sm'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          Tất cả chủ đề
        </button>
        {POST_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilterTag(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFilterTag === t
                ? 'bg-zinc-200 text-black border-white shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-zinc-500 animate-spin" />
            <p className="text-xs text-zinc-500">Đang tải các bài viết từ cộng đồng...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl flex flex-col items-center gap-3">
            <MessageCircle size={36} className="text-zinc-600" />
            <h3 className="text-base font-bold text-zinc-300">Chưa có bài viết nào</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Hãy là người đầu tiên chia sẻ cảm nghĩ hoặc bài hát bạn yêu thích với cộng đồng!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = user ? post.likes.includes(user.uid) : false;
            const isAuthor = user && user.uid === post.authorId;
            const isExpanded = expandedCommentsPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <article
                key={post.id}
                id={`community-post-${post.id}`}
                className={`bg-zinc-900 border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition-all hover:border-zinc-700/80 ${
                  post.isPinned
                    ? 'border-amber-500/60 ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-950/20 to-zinc-900'
                    : post.isAuthorVip
                    ? 'border-amber-500/30 ring-1 ring-amber-500/10'
                    : 'border-zinc-800'
                }`}
              >
                {/* Pinned Announcement Ribbon */}
                {post.isPinned && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-extrabold text-amber-300">
                    <Pin size={12} className="fill-amber-400 text-amber-400 rotate-45" />
                    <span>BÀI VIẾT ĐÃ ĐƯỢC QUẢN TRỊ VIÊN GHIM LÊN ĐẦU</span>
                  </div>
                )}

                {/* Author Info & Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {post.authorPhoto ? (
                        <img
                          src={post.authorPhoto}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 ring-1 ring-zinc-700">
                          <User size={18} />
                        </div>
                      )}
                      {post.isAuthorAdmin && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black shadow-md" title="Quản trị viên">
                          <ShieldCheck size={11} className="stroke-[2.5]" />
                        </div>
                      )}
                      {!post.isAuthorAdmin && post.isAuthorVip && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-black shadow-md">
                          <Crown size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {post.authorName}
                        </h4>
                        {post.isAuthorAdmin && (
                          <span className="text-[9px] font-black bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono shadow-sm">
                            ADMIN
                          </span>
                        )}
                        {!post.isAuthorAdmin && post.isAuthorVip && (
                          <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>{post.tag || '#ThảoLuận'}</span>
                        <span>•</span>
                        <span>vừa xong</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Admin / Author */}
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={() => handleTogglePinPost(post)}
                        className={`p-2 rounded-xl transition-colors ${
                          post.isPinned
                            ? 'bg-amber-500 text-black'
                            : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                        }`}
                        title={post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết lên đầu (Admin)'}
                      >
                        <Pin size={15} className={post.isPinned ? 'fill-current rotate-45' : ''} />
                      </button>
                    )}

                    {(isAuthor || isAdmin) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                        title={isAdmin ? 'Xóa bài viết vi phạm (Quyền Admin)' : 'Xóa bài viết'}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Attached Image / 3D Spatial Artwork */}
                {post.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-zinc-800/80 group">
                    <img 
                      src={post.imageUrl} 
                      alt="Tác phẩm đính kèm" 
                      className="w-full max-h-[460px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01] cursor-pointer"
                      onClick={() => setLightboxImage(post.imageUrl || null)}
                    />
                    
                    {/* Badge for Haevy Space 3D Artwork */}
                    {(post.tag === '#HaevySpace' || post.tag === '#TranhVẽ3D') && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-sky-400/40 text-sky-200 text-[11px] font-extrabold flex items-center gap-1.5 shadow-lg pointer-events-none">
                        <Sparkles size={13} className="text-amber-300 animate-pulse" />
                        <span>Tác Phẩm 3D Haevy Space</span>
                      </div>
                    )}

                    <button
                      onClick={() => setLightboxImage(post.imageUrl || null)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-white hover:text-black text-zinc-300 text-xs font-semibold backdrop-blur-md border border-zinc-700/80 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 shadow-lg"
                    >
                      <Maximize2 size={13} />
                      <span>Xem đầy đủ</span>
                    </button>
                  </div>
                )}

                {/* Embedded Attached Track Card */}
                {post.trackTitle && (
                  <div 
                    onClick={() => {
                      if (post.trackId) {
                        const targetTrack = tracks.find((t) => t.id === post.trackId);
                        if (targetTrack) {
                          onPlayTrack(targetTrack);
                        } else if (post.trackUrl) {
                          onPlayTrack({
                            id: post.trackId,
                            title: post.trackTitle!,
                            artist: post.trackArtist || 'Unknown',
                            coverUrl: post.trackCover || '',
                            url: post.trackUrl,
                          });
                        }
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0">
                        {post.trackCover ? (
                          <img src={post.trackCover} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Music2 size={20} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={18} fill="currentColor" className="text-white ml-0.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                          Đính kèm bài hát
                        </span>
                        <p className="text-sm font-bold text-white truncate">
                          {post.trackTitle}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {post.trackArtist}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-800 group-hover:bg-white group-hover:text-black text-zinc-300 transition-all shrink-0 ml-3">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Actions & Comment trigger */}
                <div className="flex items-center gap-6 pt-2 border-t border-zinc-800/80 text-xs font-semibold text-zinc-400">
                  <button
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-2 py-1 transition-colors ${
                      isLiked ? 'text-rose-500 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <Heart size={16} className={isLiked ? 'fill-rose-500' : ''} />
                    <span>{post.likes.length} Thích</span>
                  </button>

                  <button
                    onClick={() => {
                      setExpandedCommentsPostId(isExpanded ? null : post.id);
                    }}
                    className="flex items-center gap-2 py-1 hover:text-white transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>{post.commentsCount || 0} Bình luận</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-200">
                    {/* Existing Comments */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {comments.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-2">
                          Chưa có bình luận nào. Hãy chia sẻ ý kiến của bạn!
                        </p>
                      ) : (
                        comments.map((c) => {
                          const canDeleteComment = isAdmin || (user && user.uid === c.authorId);
                          return (
                            <div key={c.id} className="flex items-start justify-between gap-2.5 bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/70 group">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 text-xs font-bold relative">
                                  {c.authorName[0]?.toUpperCase() || 'U'}
                                  {c.isAuthorAdmin && (
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-black">
                                      <ShieldCheck size={9} className="stroke-[3]" />
                                    </div>
                                  )}
                                  {!c.isAuthorAdmin && c.isAuthorVip && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                      <Crown size={7} fill="currentColor" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-zinc-300 block">
                                      {c.authorName}
                                    </span>
                                    {c.isAuthorAdmin && (
                                      <span className="text-[8px] font-black bg-amber-400 text-black px-1 rounded">
                                        ADMIN
                                      </span>
                                    )}
                                    {!c.isAuthorAdmin && c.isAuthorVip && (
                                      <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 px-1 rounded">
                                        VIP
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed break-words">
                                    {c.text}
                                  </p>
                                </div>
                              </div>

                              {/* Delete Comment Button for Admin / Author */}
                              {canDeleteComment && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, c.id)}
                                  className={
                                    isAdmin
                                      ? "text-red-400 hover:text-white p-1.5 px-2 rounded-lg bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-sm"
                                      : "text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                                  }
                                  title={isAdmin ? 'Xóa bình luận này trực tiếp (Quyền Admin)' : 'Xóa bình luận'}
                                >
                                  <Trash2 size={13} />
                                  {isAdmin && <span>Xóa</span>}
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={user ? (isAdmin ? "Viết bình luận với tư cách Quản trị viên..." : "Viết bình luận của bạn (+5 pts)...") : "Đăng nhập để bình luận"}
                        disabled={!user}
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputMap((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!user || commentLoadingMap[post.id]}
                        className="bg-white hover:bg-zinc-200 text-black p-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                        title="Gửi"
                      >
                        {commentLoadingMap[post.id] ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Fullscreen Lightbox Modal for Shared Images */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls */}
            <div className="w-full flex items-center justify-between p-3 mb-2 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-sm font-bold">Chi Tiết Tác Phẩm Nghệ Thuật / Ảnh Đính Kèm</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage}
                  download={`haevy-art-${Date.now()}.png`}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Tải ảnh về máy"
                >
                  <span>Tải ảnh PNG</span>
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black/90 max-h-[78vh] flex items-center justify-center shadow-2xl">
              <img
                src={lightboxImage}
                alt="Enlarged Artwork"
                className="max-h-[78vh] w-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
