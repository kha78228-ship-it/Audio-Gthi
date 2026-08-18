import React, { useState, useEffect } from 'react';
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
  Crown
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
}

const POST_TAGS = ['#ThảoLuận', '#GợiÝBàiHát', '#ĐánhGiá', '#CảmXúc', '#GócTậpTrung', '#Podcast'];

export function CommunityView({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenAuth,
}: CommunityViewProps) {
  const { user, isVip, addAudioPoints } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('#ThảoLuận');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('Tất cả');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            content: data.content || '',
            trackId: data.trackId || '',
            trackTitle: data.trackTitle || '',
            trackArtist: data.trackArtist || '',
            trackCover: data.trackCover || '',
            trackUrl: data.trackUrl || '',
            likes: Array.isArray(data.likes) ? data.likes : [],
            commentsCount: data.commentsCount || 0,
            tag: data.tag || '#ThảoLuận',
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung chia sẻ.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let attachedTrack: Track | undefined;
      if (selectedTrackId) {
        attachedTrack = tracks.find((t) => t.id === selectedTrackId);
      }

      await addDoc(collection(db, 'communityPosts'), {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Yêu Âm Nhạc',
        authorPhoto: user.photoURL || '',
        isAuthorVip: isVip,
        content: content.trim(),
        trackId: attachedTrack?.id || '',
        trackTitle: attachedTrack?.title || '',
        trackArtist: attachedTrack?.artist || '',
        trackCover: attachedTrack?.coverUrl || '',
        trackUrl: attachedTrack?.url || '',
        likes: [],
        commentsCount: 0,
        tag: selectedTag,
        createdAt: serverTimestamp(),
      });

      // Award +20 points for engaging in community
      await addAudioPoints(20, 'Chia sẻ bài viết cộng đồng', 'post');

      setContent('');
      setSelectedTrackId('');
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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilterTag === 'Tất cả') return true;
    return p.tag === activeFilterTag;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-36 sm:pb-40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cộng đồng Âm nhạc
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Không gian chia sẻ cảm xúc, review bản nhạc và kết nối cùng những người yêu nghệ thuật (+20 pts/bài)
            </p>
          </div>
        </div>
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
            {isVip && (
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
                ? 'Bạn đang lắng nghe điều gì? Hãy chia sẻ cảm xúc hoặc gợi ý bài hát tâm đắc...'
                : 'Vui lòng đăng nhập tài khoản để viết bài thảo luận cùng cộng đồng...'
            }
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all resize-none"
          />

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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              <span>Đăng bài (+20 pts)</span>
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
                  post.isAuthorVip ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-zinc-800'
                }`}
              >
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
                      {post.isAuthorVip && (
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
                        {post.isAuthorVip && (
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

                  {isAuthor && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Xóa bài viết"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

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
                        comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/60">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 text-xs font-bold relative">
                              {c.authorName[0]?.toUpperCase() || 'U'}
                              {c.isAuthorVip && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                  <Crown size={7} fill="currentColor" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-300 block">
                                  {c.authorName}
                                </span>
                                {c.isAuthorVip && (
                                  <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 px-1 rounded">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                {c.text}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={user ? "Viết bình luận của bạn (+5 pts)..." : "Đăng nhập để bình luận"}
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
                        className="bg-white hover:bg-zinc-200 text-black p-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
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
    </div>
  );
}
