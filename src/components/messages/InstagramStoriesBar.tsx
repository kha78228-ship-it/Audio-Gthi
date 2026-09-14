import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Send, 
  Flame, 
  Smile, 
  Music2, 
  Volume2, 
  VolumeX,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  isAuthorVip?: boolean;
  isAuthorVerified?: boolean;
  mediaUrl: string;
  caption?: string;
  songTitle?: string;
  createdAt: any;
  hasViewed?: boolean;
}

interface InstagramStoriesBarProps {
  onOpenCreateStory?: () => void;
  onOpenChatWithUser?: (uid: string) => void;
}

// Curated starter stories to ensure vibrant immediate experience
const DEFAULT_STORIES: StoryItem[] = [
  {
    id: 'story-system-1',
    authorId: 'haevy_team',
    authorName: 'Haevy Official',
    authorPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isAuthorVip: true,
    isAuthorVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    caption: '✨ Khám phá diện mạo mới lấy cảm hứng từ các nền tảng hàng đầu thế giới trên Haevy Ecosystem!',
    songTitle: 'Haevy Acoustic Chill • Giai Điệu Mới',
    createdAt: new Date()
  },
  {
    id: 'story-demo-2',
    authorId: 'minh_haevy',
    authorName: 'Minh Hoàng',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isAuthorVip: true,
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    caption: 'Đêm nhạc acoustic cuối tuần cùng bạn bè tại phố đi bộ 🎸☕',
    songTitle: 'Đêm Lặng Yên • Acoustic Chill',
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: 'story-demo-3',
    authorId: 'lan_nguyen',
    authorName: 'Lan Hương',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isAuthorVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    caption: 'Tập luyện sáng sớm khởi động ngày mới tràn đầy năng lượng 🌅',
    songTitle: 'Morning Flow • Tần Số 432Hz',
    createdAt: new Date(Date.now() - 3600000 * 5)
  }
];

export function InstagramStoriesBar({
  onOpenCreateStory,
  onOpenChatWithUser
}: InstagramStoriesBarProps) {
  const { user, isVip } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>(DEFAULT_STORIES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const timerRef = useRef<any>(null);

  // Auto progression for story viewer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = 50; // update every 50ms
    const totalDuration = 5000; // 5 seconds per story
    const step = (interval / totalDuration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [activeStoryIndex, isPaused, stories.length]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 1200);
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <>
      {/* Instagram Story Circular Highlights Bar */}
      <div className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-3xl p-3 sm:p-4 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1">
          {/* 1. "Tin của bạn" (Your Story Add Button) */}
          <div 
            onClick={onOpenCreateStory}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-zinc-800 group-hover:bg-zinc-700 transition-all">
              <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden relative flex items-center justify-center border border-zinc-700">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="My Avatar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-sm bg-zinc-800">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                {/* Plus circle badge */}
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-black flex items-center justify-center shadow-md border-2 border-zinc-950 group-hover:scale-110 transition-transform">
                  <Plus size={12} strokeWidth={3} />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate max-w-[68px] text-center">
              Tin của bạn
            </span>
          </div>

          {/* 2. Stories from Community & Friends */}
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group select-none"
            >
              {/* Vibrant Instagram Gradient Ring */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md shadow-rose-500/10 group-hover:scale-105 transition-all">
                <div className="w-full h-full rounded-full bg-zinc-950 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
                    {story.authorPhoto ? (
                      <img
                        src={story.authorPhoto}
                        alt={story.authorName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {story.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5 max-w-[68px]">
                <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate text-center">
                  {story.authorName.split(' ').slice(-1)[0]}
                </span>
                {story.isAuthorVerified && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Fullscreen Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl">
            {/* Backdrop click dismiss */}
            <div className="fixed inset-0" onClick={() => setActiveStoryIndex(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="relative w-full max-w-md h-full sm:h-[88vh] sm:max-h-[820px] bg-zinc-950 sm:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col z-10 select-none"
            >
              {/* Progress Bars Header */}
              <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
                {stories.map((s, idx) => (
                  <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear"
                      style={{
                        width:
                          idx < (activeStoryIndex || 0)
                            ? '100%'
                            : idx === activeStoryIndex
                            ? `${progress}%`
                            : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Author Info Bar */}
              <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/80 shadow-md">
                    <img src={activeStory.authorPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white drop-shadow">
                        {activeStory.authorName}
                      </span>
                      {activeStory.isAuthorVip && (
                        <span className="text-[8px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/75 drop-shadow">
                      {activeStory.songTitle ? `♫ ${activeStory.songTitle}` : 'Vừa mới đăng'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Media Image */}
              <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activeStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />

                {/* Left/Right Tap Areas to switch */}
                <div
                  onClick={handlePrevStory}
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
                  title="Tin trước"
                />
                <div
                  onClick={handleNextStory}
                  className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer"
                  title="Tin tiếp theo"
                />

                {/* Heart Burst Animation */}
                <AnimatePresence>
                  {showHeartBurst && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute z-40 pointer-events-none text-rose-500"
                    >
                      <Heart size={80} fill="currentColor" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Story Caption Overlay */}
                {activeStory.caption && (
                  <div className="absolute bottom-20 left-4 right-4 z-30 p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm leading-relaxed">
                    {activeStory.caption}
                  </div>
                )}
              </div>

              {/* Instagram Bottom Action / Reply Bar */}
              <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Gửi tin nhắn cho ${activeStory.authorName}...`}
                    className="w-full bg-black/60 border border-white/30 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:border-amber-400"
                  />
                  {replyText && (
                    <button
                      onClick={() => {
                        alert('Đã gửi phản hồi tin nhắn trực tiếp!');
                        setReplyText('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-amber-400 font-bold text-xs"
                    >
                      <Send size={15} />
                    </button>
                  )}
                </div>

                {/* Quick Reaction Emojis */}
                <button
                  onClick={() => handleQuickReaction('❤️')}
                  className="w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-rose-400 backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
                <button
                  onClick={() => handleQuickReaction('🔥')}
                  className="w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-amber-400 backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
                >
                  <Flame size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
