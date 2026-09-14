import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Sparkles, 
  Orbit, 
  Coins, 
  Play, 
  ArrowRight, 
  Crown,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Friendship } from '../../types';
import { CosmicAvatarFX } from '../haevyLite/CosmicAvatarFX';
import { HaevyLiteHubModal } from '../haevyLite/HaevyLiteHubModal';
import { getThemeBundle } from '../haevyLite/themeBundles';

interface HomeFriendsMessageSectionProps {
  onOpenChatWithUser?: (uid: string) => void;
  onGoToMessages?: () => void;
  onGoToFriends?: () => void;
  onOpenAuth?: () => void;
}

export function HomeFriendsMessageSection({
  onOpenChatWithUser,
  onGoToMessages,
  onGoToFriends,
  onOpenAuth
}: HomeFriendsMessageSectionProps) {
  const { user, haevyLiteCoins = 0, activeThemeBundle } = useAuth();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isLiteHubOpen, setIsLiteHubOpen] = useState(false);
  const [hubInitialTab, setHubInitialTab] = useState<'shop' | 'watch_ad' | 'topup'>('shop');

  // Subscribe to real friendships from Firestore
  useEffect(() => {
    if (!user) {
      setFriendships([]);
      return;
    }

    const q = query(
      collection(db, 'friendships'),
      where('userIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: Friendship[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Friendship));
      setFriendships(list);
    }, (err) => {
      console.warn('Home friends listener notice:', err);
    });

    return () => unsubscribe();
  }, [user]);

  // Extract other user from each friendship
  const friendsList = friendships.map(f => {
    const partnerId = f.userIds?.find(id => id !== user?.uid) || '';
    const partnerData = f.users?.[partnerId];
    return {
      friendshipId: f.id,
      uid: partnerId,
      displayName: partnerData?.displayName || 'Bạn Bè Haevy',
      photoURL: partnerData?.photoURL || null,
      isVip: partnerData?.isVip || false,
      activeThemeBundle: (partnerData as any)?.activeThemeBundle || 'cosmic' // Enable cosmic for demonstration if unlocked
    };
  });

  // Showcase Demo Astronaut Friends if user hasn't added friends yet
  const DEMO_COSMIC_FRIENDS = [
    {
      uid: 'demo-starlight-1',
      displayName: 'Vũ Trụ Huyền Ảo',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isVip: true,
      activeThemeBundle: 'cosmic',
      status: 'Đang du hành không gian'
    },
    {
      uid: 'demo-starlight-2',
      displayName: 'Phi Hành Gia Orion',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isVip: false,
      activeThemeBundle: 'cosmic',
      status: 'Sở hữu Combo Vũ Trụ'
    },
    {
      uid: 'demo-starlight-3',
      displayName: 'Tinh Vân Galaxy',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      isVip: true,
      activeThemeBundle: 'cosmic',
      status: 'Hoạt ảnh động Avatar'
    }
  ];

  const handleFriendClick = (friendUid: string) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (onOpenChatWithUser) {
      onOpenChatWithUser(friendUid);
    } else if (onGoToMessages) {
      onGoToMessages();
    }
  };

  const displayFriends = friendsList.length > 0 ? friendsList : DEMO_COSMIC_FRIENDS;

  return (
    <section 
      id="home-friends-message-section"
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-zinc-900/80 border border-zinc-800/90 shadow-2xl backdrop-blur-md space-y-5"
    >
      {/* Background Cosmic Subtle Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Orbit size={16} className="animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Bạn Bè & Tin Nhắn Haevy Message</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                COMBO VŨ TRỤ
              </span>
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Khi kết bạn, avatar và tên bạn bè xuất hiện ngay tại đây với hoạt ảnh động đặc quyền. Bấm để mở khung chat!
          </p>
        </div>

        {/* Haevy Lite Currency & Hub Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setHubInitialTab('shop');
              setIsLiteHubOpen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Orbit size={14} className="animate-spin" />
            <span>Đổi Combo Chủ Đề</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHubInitialTab('watch_ad');
              setIsLiteHubOpen(true);
            }}
            className="px-3 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Coins size={14} className="text-amber-400" />
            <span>{haevyLiteCoins} Xu Lite (+50 Xem QC)</span>
          </button>
        </div>
      </div>

      {/* Friends Horizontal Carousel / Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {displayFriends.map((f) => {
          const isCosmic = f.activeThemeBundle === 'cosmic';

          return (
            <div
              key={f.uid}
              onClick={() => handleFriendClick(f.uid)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col items-center text-center gap-3 group relative overflow-hidden ${
                isCosmic 
                  ? 'bg-zinc-950/70 border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-1' 
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5'
              }`}
            >
              {/* Cosmic Subtle Backlight when hovered */}
              {isCosmic && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* Animated Avatar FX */}
              <div className="relative pt-1">
                <CosmicAvatarFX
                  photoURL={f.photoURL}
                  displayName={f.displayName}
                  avatarFrameId={(f as any).activeAvatarFrame}
                  themeId={f.activeThemeBundle}
                  isCurrentUser={false}
                  isVip={f.isVip}
                  size="md"
                />
              </div>

              {/* Friend Display Name with Cosmic Gradient */}
              <div className="min-w-0 w-full space-y-1">
                <h4 className={`text-xs font-black truncate ${
                  isCosmic
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 group-hover:brightness-125'
                    : 'text-zinc-200 group-hover:text-white'
                }`}>
                  {f.displayName}
                </h4>
                
                {isCosmic ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/20 border border-purple-400/40 text-purple-300">
                    <Sparkles size={9} />
                    <span>Combo Vũ Trụ</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 block">Bạn bè</span>
                )}
              </div>

              {/* Chat Quick Action Button */}
              <button
                type="button"
                className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 group-hover:bg-purple-600/80 text-zinc-400 group-hover:text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border border-zinc-800 group-hover:border-purple-500"
              >
                <MessageSquare size={12} />
                <span>Nhắn tin</span>
              </button>
            </div>
          );
        })}

        {/* Add More Friends Card */}
        <div
          onClick={() => {
            if (!user) {
              if (onOpenAuth) onOpenAuth();
            } else if (onGoToFriends) {
              onGoToFriends();
            }
          }}
          className="p-4 rounded-3xl border border-dashed border-zinc-800 hover:border-amber-400/60 bg-zinc-950/40 hover:bg-zinc-900/60 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-400/60 transition-colors shadow">
            <UserPlus size={18} />
          </div>
          <span className="text-xs font-bold text-zinc-400 group-hover:text-white">
            Thêm Bạn Mới
          </span>
          <span className="text-[10px] text-zinc-500">Kết nối & Chat</span>
        </div>
      </div>

      {/* Haevy Lite Modal */}
      <HaevyLiteHubModal
        isOpen={isLiteHubOpen}
        onClose={() => setIsLiteHubOpen(false)}
        initialTab={hubInitialTab}
      />
    </section>
  );
}
