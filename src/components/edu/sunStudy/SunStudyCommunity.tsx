import React, { useState } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Share2, 
  Sparkles, 
  Plus, 
  Smile, 
  Flame, 
  CheckCircle2, 
  HelpCircle,
  Filter,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { 
  loadCommunityPosts, 
  saveCommunityPosts, 
  SunCommunityPost 
} from '../../../services/sunStudyStorageService';

export function SunStudyCommunity() {
  const [posts, setPosts] = useState<SunCommunityPost[]>(() => loadCommunityPosts());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'qa' | 'stress_relief' | 'tips' | 'motivation'>('all');
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);

  // New Post Form
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [postCategory, setPostCategory] = useState<'qa' | 'stress_relief' | 'tips' | 'motivation'>('stress_relief');

  // Comment input per post
  const [commentInputMap, setCommentInputMap] = useState<{ [postId: string]: string }>({});

  const handleLike = (postId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const wasLiked = p.likedByMe;
          return {
            ...p,
            likes: wasLiked ? p.likes - 1 : p.likes + 1,
            likedByMe: !wasLiked
          };
        }
        return p;
      });
      saveCommunityPosts(updated);
      return updated;
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: SunCommunityPost = {
      id: `post_${Date.now()}`,
      authorName: 'Bạn (Sĩ Tử Sun Study)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      authorRank: 'Ánh Dương ☀️',
      authorBadge: 'Học Sinh',
      title: postTitle.trim(),
      content: postContent.trim(),
      category: postCategory,
      createdAt: 'Vừa xong',
      likes: 1,
      likedByMe: true,
      commentsCount: 0,
      comments: []
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveCommunityPosts(updated);

    setPostTitle('');
    setPostContent('');
    setIsCreatingPost(false);
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputMap[postId]?.trim();
    if (!text) return;

    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const newComments = [
            ...p.comments,
            {
              id: `c_${Date.now()}`,
              author: 'Bạn',
              content: text,
              time: 'Vừa xong'
            }
          ];
          return {
            ...p,
            commentsCount: newComments.length,
            comments: newComments
          };
        }
        return p;
      });
      saveCommunityPosts(updated);
      return updated;
    });

    setCommentInputMap(prev => ({ ...prev, [postId]: '' }));
  };

  const filteredPosts = posts.filter(p => {
    if (activeCategoryFilter === 'all') return true;
    return p.category === activeCategoryFilter;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Community Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 text-2xl shadow-inner">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Box Cộng Đồng & Góc Chém Gió Xả Stress</h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                Giao Lưu 24/7
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Không gian chia sẻ kinh nghiệm ôn thi, giải đáp thắc mắc và xả stress lành mạnh sau giờ cày cuốc.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingPost(!isCreatingPost)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-zinc-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95 shrink-0"
        >
          <Plus size={15} />
          <span>Đăng Bài Tâm Sự</span>
        </button>
      </div>

      {/* Create Post Popover Form */}
      {isCreatingPost && (
        <form onSubmit={handleCreatePost} className="p-5 rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span>Đăng Bài Viết Lên Cộng Đồng Sun Study</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Hủy
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Tiêu đề bài viết (VD: Mẹo ôn thi Sử nhớ lâu, Vừa làm xong đề Toán...)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400 font-bold"
            />

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              placeholder="Nội dung chia sẻ, tâm sự hoặc hỏi đáp với các bạn học..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-400 resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Chủ đề:</span>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
              >
                <option value="stress_relief">😂 Chém Gió & Xả Stress</option>
                <option value="tips">💡 Mẹo Học & Bí Quyết</option>
                <option value="qa">❓ Hỏi Đáp Bài Tập</option>
                <option value="motivation">🔥 Tiếp Lửa Quyết Tâm</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!postTitle.trim() || !postContent.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 text-xs font-black disabled:opacity-40"
              >
                Đăng Bài Ngay
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
        {[
          { id: 'all', label: 'Tất Cả Bài Viết' },
          { id: 'stress_relief', label: '😂 Chém Gió & Xả Stress' },
          { id: 'tips', label: '💡 Mẹo Học & Bí Quyết' },
          { id: 'qa', label: '❓ Hỏi Đáp Bài Tập' },
          { id: 'motivation', label: '🔥 Tiếp Lửa Quyết Tâm' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategoryFilter === cat.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col gap-4">
        {filteredPosts.map(post => (
          <div
            key={post.id}
            className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col gap-3.5 transition-all hover:border-zinc-700"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-2xl object-cover border border-zinc-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{post.authorName}</span>
                    <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      {post.authorRank}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{post.createdAt}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {post.category === 'qa' ? 'Hỏi Đáp' :
                 post.category === 'tips' ? 'Bí Quyết' :
                 post.category === 'motivation' ? 'Động Lực' : 'Xả Stress'}
              </span>
            </div>

            {/* Post Content */}
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                {post.title}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                {post.content}
              </p>
            </div>

            {/* Post Actions (Like, Comments, Share) */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer active:scale-95 ${
                    post.likedByMe
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  <Heart size={14} className={post.likedByMe ? 'fill-rose-400 text-rose-400' : ''} />
                  <span>{post.likes} Yêu thích</span>
                </button>

                <span className="text-zinc-500 flex items-center gap-1">
                  <MessageCircle size={14} />
                  <span>{post.commentsCount} Bình luận</span>
                </span>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80 flex flex-col gap-2 mt-1">
                {post.comments.map(c => (
                  <div key={c.id} className="text-xs">
                    <span className="font-bold text-amber-300 mr-2">{c.author}:</span>
                    <span className="text-zinc-300">{c.content}</span>
                    <span className="text-[10px] text-zinc-500 ml-2 font-mono">{c.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentInputMap[post.id] || ''}
                onChange={(e) => setCommentInputMap({ ...commentInputMap, [post.id]: e.target.value })}
                placeholder="Viết bình luận động viên bạn bè..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                disabled={!(commentInputMap[post.id] || '').trim()}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer active:scale-95"
              >
                Gửi
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
