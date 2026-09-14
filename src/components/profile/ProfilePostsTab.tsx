import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Music, 
  Heart, 
  MessageCircle, 
  Share2, 
  Trash2, 
  Smile, 
  Globe, 
  Users, 
  Lock, 
  Play, 
  Pause, 
  Sparkles,
  X,
  Upload,
  User as UserIcon,
  Check
} from 'lucide-react';
import { ProfilePost, AvatarFrame, AVATAR_FRAMES, AvatarFrameId } from './types';
import { Track } from '../../types';

interface ProfilePostsTabProps {
  user: any;
  displayName: string;
  avatarFrameId: AvatarFrameId;
  tracks: Track[];
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

const DEFAULT_POSTS: ProfilePost[] = [
  {
    id: 'post_sample_1',
    content: 'Hôm nay nghe lại bản nhạc Lo-Fi hoàng hôn tại Haevy Audio thấy tâm hồn thật nhẹ nhàng và an yên. Một ngày trọn vẹn với những tần số tích cực! 🌿✨',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
    audioTrackTitle: 'Hoàng Hôn Tây Hồ (Lo-Fi Healing)',
    audioTrackArtist: 'Haevy Sound Studio',
    audioTrackCover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    mood: '🌿 Thư giãn',
    privacy: 'public',
    createdAt: '2 giờ trước',
    likesCount: 28,
    isLiked: true,
    commentsCount: 3,
    comments: [
      {
        id: 'c1',
        authorName: 'Minh Anh',
        content: 'Bản này hay thật sự bạn ơi, giai điệu 528Hz nghe rất thư thái!',
        createdAt: '1 giờ trước'
      },
      {
        id: 'c2',
        authorName: 'Quốc Bảo',
        content: 'Tuyệt vời, chúc bạn một ngày năng lượng tích cực nhé!',
        createdAt: '45 phút trước'
      }
    ]
  },
  {
    id: 'post_sample_2',
    content: 'Vừa hoàn thiện xong góc làm việc mới cùng dàn loa chất lượng cao Hi-Fi Lossless. Chuẩn bị cho những dự án âm thanh sáng tạo sắp tới cùng cộng đồng Haevy! 🎧💻',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
    mood: '🔥 Hào hứng',
    privacy: 'public',
    createdAt: 'Hôm qua lúc 19:30',
    likesCount: 45,
    isLiked: false,
    commentsCount: 5,
    comments: [
      {
        id: 'c3',
        authorName: 'Hoàng Long',
        content: 'Góc setup đỉnh quá bro, dùng tai nghe hay loa ngoài đấy?',
        createdAt: 'Hôm qua'
      }
    ]
  }
];

export function ProfilePostsTab({
  user,
  displayName,
  avatarFrameId,
  tracks,
  onPlayTrack,
  currentTrack,
  isPlaying
}: ProfilePostsTabProps) {
  const currentFrame = AVATAR_FRAMES.find(f => f.id === avatarFrameId) || AVATAR_FRAMES[0];
  const storageKey = `haevy_profile_posts_${user?.uid || 'guest'}`;

  const [posts, setPosts] = useState<ProfilePost[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_POSTS;
  });

  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('🌿 Thư giãn');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch (e) {
      console.warn(e);
    }
  }, [posts, storageKey]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() && !newImageUrl.trim() && !selectedTrack) return;

    const newPost: ProfilePost = {
      id: `post_${Date.now()}`,
      content: newContent.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      audioTrackId: selectedTrack?.id,
      audioTrackTitle: selectedTrack?.title,
      audioTrackArtist: selectedTrack?.artist,
      audioTrackCover: selectedTrack?.coverUrl,
      mood: selectedMood,
      privacy,
      createdAt: 'Vừa xong',
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewContent('');
    setNewImageUrl('');
    setSelectedTrack(null);
    setShowImageInput(false);
    setShowTrackPicker(false);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newC = {
          id: `comment_${Date.now()}`,
          authorName: displayName || 'Bạn',
          content: text,
          createdAt: 'Vừa xong'
        };
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...post.comments, newC]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleSharePost = (post: ProfilePost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(post.content);
      setCopiedToast(post.id);
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CREATE NEW POST CARD                                                   */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-start gap-3">
          {/* User mini avatar with frame */}
          <div className={`w-11 h-11 rounded-full p-0.5 bg-zinc-900 shrink-0 ${currentFrame.ringClass} ${currentFrame.glowStyle}`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-zinc-400" />
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì hôm nay? Chia sẻ cảm xúc, trạng thái hoặc giai điệu âm nhạc..."
              rows={3}
              className="w-full bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Selected Attachments Preview */}
        {(newImageUrl || selectedTrack) && (
          <div className="space-y-2.5 pt-1">
            {newImageUrl && (
              <div className="relative rounded-2xl overflow-hidden max-h-56 bg-black border border-zinc-800 group">
                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setNewImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedTrack && (
              <div className="p-3 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={selectedTrack.coverUrl} alt="Cover" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{selectedTrack.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{selectedTrack.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Inline Media Selector Toggles */}
        {showImageInput && !newImageUrl && (
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 animate-fadeIn">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dán liên kết ảnh (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <label className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload size={13} />
                <span>Tải ảnh</span>
                <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {showTrackPicker && !selectedTrack && (
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 animate-fadeIn max-h-48 overflow-y-auto custom-scrollbar">
            <p className="text-[11px] font-bold text-zinc-400">Chọn bài hát muốn chia sẻ cùng bài viết:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {tracks.slice(0, 8).map(track => (
                <div
                  key={track.id}
                  onClick={() => {
                    setSelectedTrack(track);
                    setShowTrackPicker(false);
                  }}
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <img src={track.coverUrl} alt="Cover" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showImageInput || newImageUrl ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon size={14} className="text-amber-400" />
              <span>Thêm ảnh</span>
            </button>

            {/* Attach Audio Track Button */}
            <button
              type="button"
              onClick={() => setShowTrackPicker(!showTrackPicker)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showTrackPicker || selectedTrack ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Music size={14} className="text-purple-400" />
              <span>Gắn bài hát</span>
            </button>

            {/* Mood selector */}
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="🌿 Thư giãn">🌿 Thư giãn</option>
              <option value="🔥 Hào hứng">🔥 Hào hứng</option>
              <option value="🎧 Say mê âm nhạc">🎧 Say mê âm nhạc</option>
              <option value="☕ Bình yên">☕ Bình yên</option>
              <option value="🌙 Tâm trạng">🌙 Tâm trạng</option>
            </select>

            {/* Privacy */}
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="public">🌐 Công khai</option>
              <option value="friends">👥 Bạn bè</option>
              <option value="private">🔒 Riêng tư</option>
            </select>
          </div>

          {/* Submit Post Button */}
          <button
            onClick={handleCreatePost}
            disabled={!newContent.trim() && !newImageUrl.trim() && !selectedTrack}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-40 text-black font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Send size={13} />
            <span>Đăng bài</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. POSTS FEED LIST                                                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-sm space-y-2">
            <Sparkles size={32} className="mx-auto text-zinc-600" />
            <p className="font-semibold text-zinc-400">Chưa có bài đăng nào</p>
            <p className="text-xs">Hãy viết bài đăng đầu tiên của bạn để kết nối cùng mọi người!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isPlayingThisTrack = isPlaying && currentTrack?.title === post.audioTrackTitle;
            const isCommentsOpen = !!expandedComments[post.id];

            return (
              <div
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3.5 transition-all hover:border-zinc-700/80"
              >
                {/* Post Author Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full p-0.5 bg-zinc-900 shrink-0 ${currentFrame.ringClass} ${currentFrame.glowStyle}`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Author" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={20} className="text-zinc-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{displayName || 'Người Dùng Haevy'}</h4>
                        {post.mood && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 border border-zinc-700 text-amber-300 font-medium">
                            {post.mood}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>{post.createdAt}</span>
                        <span>•</span>
                        {post.privacy === 'public' ? (
                          <span className="flex items-center gap-1"><Globe size={11} /> Công khai</span>
                        ) : post.privacy === 'friends' ? (
                          <span className="flex items-center gap-1"><Users size={11} /> Bạn bè</span>
                        ) : (
                          <span className="flex items-center gap-1"><Lock size={11} /> Riêng tư</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete option */}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Xóa bài đăng này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Post Image Attachment */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 max-h-96 bg-black">
                    <img
                      src={post.imageUrl}
                      alt="Post Attachment"
                      className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Post Audio Track Attachment */}
                {post.audioTrackTitle && (
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-purple-500/30 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.audioTrackCover ? (
                        <img src={post.audioTrackCover} alt="Cover" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                          <Music size={22} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{post.audioTrackTitle}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-black">Hi-Fi</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{post.audioTrackArtist}</p>
                      </div>
                    </div>

                    {/* Play Track Trigger Button */}
                    <button
                      onClick={() => {
                        const matched = tracks.find(t => t.id === post.audioTrackId || t.title === post.audioTrackTitle);
                        if (matched && onPlayTrack) {
                          onPlayTrack(matched);
                        } else if (tracks[0] && onPlayTrack) {
                          onPlayTrack(tracks[0]);
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                      title={isPlayingThisTrack ? 'Đang phát' : 'Nghe bài hát này'}
                    >
                      {isPlayingThisTrack ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                  </div>
                )}

                {/* Reaction Bar & Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.isLiked ? 'text-rose-400 font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} className={post.isLiked ? 'animate-bounce' : ''} />
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Comments Toggle Button */}
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      <span>{post.commentsCount} bình luận</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Sao chép nội dung bài viết"
                    >
                      <Share2 size={16} />
                      <span>Chia sẻ</span>
                    </button>
                    {copiedToast === post.id && (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={12} /> Đã sao chép!
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-zinc-800/80 space-y-3 animate-fadeIn">
                    {/* Existing Comments List */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 text-xs font-bold">
                              {comment?.authorName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                <span className="text-[10px] text-zinc-500">{comment.createdAt}</span>
                              </div>
                              <p className="text-xs text-zinc-300 mt-0.5">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs transition-colors cursor-pointer"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
