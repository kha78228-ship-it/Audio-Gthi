import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FriendPhotoPost, FriendPhotoComment } from '../../types';
import { 
  createFriendPhotoPost, 
  deleteFriendPhotoPost, 
  toggleLikePhotoPost, 
  addPhotoPostComment, 
  deletePhotoPostComment 
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

interface FeedTabProps {
  onOpenAuth: () => void;
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

export function FeedTab({ onOpenAuth }: FeedTabProps) {
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

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tập tin hình ảnh.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStagedPhoto(reader.result as string);
      setStagedSource('upload');
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture confirmation
  const handleCameraCapture = (base64Photo: string) => {
    setStagedPhoto(base64Photo);
    setStagedSource('camera');
  };

  // Submit new photo post
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!stagedPhoto) return;

    setIsSubmittingPost(true);
    setStatusNotice(null);

    const res = await createFriendPhotoPost({
      author: {
        uid: user.uid,
        displayName: user.displayName,
        accountId: accountId,
        photoURL: user.photoURL,
        isVip,
        isAuthorVerified,
        stageName: authorStageName
      },
      photoUrl: stagedPhoto,
      caption: caption.trim(),
      captureSource: stagedSource,
      location: location.trim(),
      mood: selectedMood
    });

    setIsSubmittingPost(false);
    if (res.success) {
      setStagedPhoto(null);
      setCaption('');
      setSelectedMood('');
      setLocation('');
      setStatusNotice('Đã đăng ảnh lên Bản Tin Bạn Bè thành công! 🎉');
      setTimeout(() => setStatusNotice(null), 3500);
    } else {
      setStatusNotice(res.message || 'Lỗi khi đăng ảnh.');
    }
  };

  // Add comment
  const handleAddComment = async (postId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    await addPhotoPostComment(postId, user, text);
  };

  // Format time
  const formatTimeAgo = (ts: any) => {
    if (!ts) return 'Vừa xong';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. Create Photo Post Card (Camera or Device Upload) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl backdrop-blur-md space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <ImageIcon size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white truncate">Bản Tin Hình Ảnh Bạn Bè</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">Chụp trực tiếp trong app hoặc tải ảnh từ thiết bị kèm miêu tả</p>
            </div>
          </div>
        </div>

        {/* Post Creation Staging Area */}
        {stagedPhoto ? (
          <form onSubmit={handleSubmitPost} className="space-y-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                {stagedSource === 'camera' ? <Camera size={14} /> : <Upload size={14} />}
                <span>{stagedSource === 'camera' ? 'Ảnh Chụp Trực Tiếp' : 'Ảnh Tải Từ Máy'}</span>
              </span>
              <button
                type="button"
                onClick={() => setStagedPhoto(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
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
              <label className="text-xs font-bold text-zinc-300">Miêu tả bên dưới ảnh:</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Viết cảm nghĩ, kỷ niệm hoặc miêu tả về bức ảnh này cùng bạn bè..."
                rows={3}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Mood Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tâm trạng / Hoạt động:</label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedMood(selectedMood === tag ? '' : tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedMood === tag
                        ? 'bg-amber-400 text-black font-bold shadow'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
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
                placeholder="Thêm vị trí (ví dụ: Hà Nội, TP. Hồ Chí Minh, Quán Cà Phê...)"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Action 1: In-App Live Camera */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                setIsCameraModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-400/60 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
                <Camera size={22} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Chụp Ảnh Trực Tiếp
                </h4>
                <p className="text-xs text-zinc-400">Mở máy ảnh trong ứng dụng</p>
              </div>
            </button>

            {/* Action 2: Upload from Device */}
            <label className="p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-sky-400/60 transition-all flex items-center gap-3.5 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center transition-colors">
                <Upload size={22} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  Tải Ảnh Từ Điện Thoại
                </h4>
                <p className="text-xs text-zinc-400">Chọn ảnh từ thư viện thiết bị</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {statusNotice && (
          <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-2xl font-semibold">
            {statusNotice}
          </p>
        )}
      </div>

      {/* 2. Photo Posts Feed Stream */}
      <div className="space-y-6">
        {isLoadingPosts && posts.length === 0 ? (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const hasLiked = user && post.likes && post.likes.includes(user.uid);
            const isAuthor = user && post.authorId === user.uid;
            const postComments = comments[post.id] || [];

            return (
              <div
                key={post.id}
                className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md transition-all hover:border-zinc-700/80"
              >
                {/* Post Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl overflow-hidden p-0.5 border shadow-md ${
                      post.isAuthorVip ? 'border-amber-400 bg-amber-500/20' : 'border-zinc-700 bg-zinc-800'
                    }`}>
                      {post.authorPhoto ? (
                        <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover rounded-[14px]" />
                      ) : (
                        <div className="w-full h-full rounded-[14px] bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                          {post.authorName?.charAt(0) || 'U'}
                        </div>
                      )}
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
                              <span>Tải từ thiết bị</span>
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

                  {/* Actions (Delete if author/admin) */}
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

                {/* Post Photo */}
                <div 
                  onClick={() => setLightboxPhoto(post.photoUrl)}
                  className="relative aspect-[4/3] sm:aspect-[16/10] bg-black cursor-pointer group overflow-hidden"
                >
                  <img
                    src={post.photoUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                  </div>
                </div>

                {/* Post Footer & Caption */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Action Buttons: Like & Comments */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            onOpenAuth();
                            return;
                          }
                          toggleLikePhotoPost(post.id, user.uid);
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-90 ${
                          hasLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                        <span>{post.likes?.length || 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id);
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>{post.commentsCount || 0} Bình luận</span>
                      </button>
                    </div>

                    {post.mood && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                        {post.mood}
                      </span>
                    )}
                  </div>

                  {/* Caption / Description below photo */}
                  <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80">
                    <span className="font-bold text-white mr-2">
                      {post.authorStageName || post.authorName}:
                    </span>
                    <span className="whitespace-pre-wrap">{post.caption}</span>
                  </div>

                  {/* Comments Section */}
                  {activeCommentsPostId === post.id && (
                    <div className="pt-2 border-t border-zinc-800 space-y-3 animate-in fade-in">
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {postComments.length > 0 ? (
                          postComments.map((cmt) => (
                            <div key={cmt.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-950/50">
                              <div className="w-7 h-7 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
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
                                  <span className="text-[11px] font-bold text-white">
                                    {cmt.authorName}
                                  </span>
                                  {(user?.uid === cmt.authorId || isAdmin) && (
                                    <button
                                      type="button"
                                      onClick={() => deletePhotoPostComment(post.id, cmt.id)}
                                      className="text-zinc-500 hover:text-rose-400 p-0.5"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-300 mt-0.5">{cmt.text}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic py-2 text-center">
                            Chưa có bình luận nào. Hãy gửi lời nhắn đầu tiên!
                          </p>
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Viết bình luận cho bức ảnh..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold shadow"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <ImageIcon size={36} className="text-zinc-600 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-300">Chưa Có Bài Đăng Hình Ảnh Nào</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Hãy chụp một bức ảnh trực tiếp hoặc tải ảnh từ điện thoại lên để chia sẻ khoảnh khắc với bạn bè!
            </p>
          </div>
        )}
      </div>

      {/* Live In-App Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handleCameraCapture}
      />

      {/* Fullscreen Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-zinc-800/80 text-white hover:bg-zinc-700 z-10"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Full Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
