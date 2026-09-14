import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Mic, 
  Search, 
  ArrowLeft,
  X,
  Clock,
  UserPlus,
  ShieldCheck,
  Lock,
  Orbit,
  Coins
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CosmicAvatarFX } from '../haevyLite/CosmicAvatarFX';
import { HaevyLiteHubModal } from '../haevyLite/HaevyLiteHubModal';
import { getNameBorder, getNameFont } from '../haevyLite/themeBundles';
import { CosmicAccountBannerRow } from '../haevyLite/CosmicAccountBannerRow';
import { CosmicProfileCardModal, CosmicProfileUserData } from '../haevyLite/CosmicProfileCardModal';
import { Conversation, ThoughtBubble, ConversationParticipant, Friendship, Track } from '../../types';
import { 
  getOrCreateConversation 
} from '../../services/socialService';
import { isEncryptedMessage, isSessionUnlocked } from '../../services/e2eeService';
import { useBatchUserPresence } from '../../services/presenceService';
import { 
  collection, 
  doc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ThoughtBubbleModal } from './ThoughtBubbleModal';
import { FullScreenChatView } from './FullScreenChatView';

interface ChatTabProps {
  onOpenAuth: () => void;
  onGoToFriendsTab: () => void;
  initialRecipientUid?: string | null;
  onClearInitialRecipient?: () => void;
  onPlayTrack?: (track: Track) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function ChatTab({
  onOpenAuth,
  onGoToFriendsTab,
  initialRecipientUid,
  onClearInitialRecipient,
  onPlayTrack,
  onNavigateToMode
}: ChatTabProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName, haevyLiteCoins = 0, activeThemeBundle, activeAvatarFrame } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawThoughtBubbles, setRawThoughtBubbles] = useState<ThoughtBubble[]>([]);
  const [friendUserIds, setFriendUserIds] = useState<Set<string>>(new Set());
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [selectedThoughtFriend, setSelectedThoughtFriend] = useState<ThoughtBubble | null>(null);
  const [isLiteHubOpen, setIsLiteHubOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<CosmicProfileUserData | null>(null);

  // 1. Subscribe to Accepted Friendships (to verify friend status for Thought Bubbles)
  useEffect(() => {
    if (!user) {
      setFriendUserIds(new Set());
      return;
    }

    const qFriends = query(
      collection(db, 'friendships'),
      where('userIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(qFriends, (snap) => {
      const uids = new Set<string>();
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.userIds && Array.isArray(data.userIds)) {
          data.userIds.forEach((uid: string) => {
            if (uid !== user.uid) uids.add(uid);
          });
        }
      });
      setFriendUserIds(uids);
    }, (err) => {
      console.warn('Friendships subscription notice:', err);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to Thought Bubbles & Filter only friends + self, remove expired (TTL)
  useEffect(() => {
    const qBubbles = query(collection(db, 'thoughtBubbles'), limit(80));
    const unsubscribe = onSnapshot(qBubbles, (snap) => {
      const list: ThoughtBubble[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as ThoughtBubble));
      setRawThoughtBubbles(list);
    }, (err) => {
      console.warn('Thought bubbles listener notice:', err);
    });

    return () => unsubscribe();
  }, []);

  // Filter thought bubbles: ONLY visible to friends and self, and active (expiresAt > now)
  const now = Date.now();
  const visibleThoughtBubbles = rawThoughtBubbles.filter((bubble) => {
    // Check if expired
    if (bubble.expiresAt) {
      const exp = new Date(bubble.expiresAt).getTime();
      if (exp <= now) return false;
    }
    // Only self or accepted friend
    const isSelf = user && bubble.userId === user.uid;
    const isFriend = friendUserIds.has(bubble.userId);
    return isSelf || isFriend;
  });

  // Current user's own active thought bubble
  const myThoughtBubble = visibleThoughtBubbles.find(b => b.userId === user?.uid) || null;

  // 3. Subscribe to Conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const convQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(convQuery, (snapshot) => {
      const list: Conversation[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Conversation));
      setConversations(list);

      // Keep active conversation reference fresh
      if (selectedConversation) {
        const found = list.find((c) => c.id === selectedConversation.id);
        if (found) setSelectedConversation(found);
      }
    }, (err) => {
      console.warn('Conversations snapshot listener notice:', err);
    });

    return () => unsubscribe();
  }, [user, selectedConversation?.id]);

  // 4. Handle initialRecipientUid triggered from outside (e.g. Friends tab, author channel)
  useEffect(() => {
    if (!user || !initialRecipientUid) return;

    const conv = conversations.find(c => c.participants.includes(initialRecipientUid));
    if (conv) {
      setSelectedConversation(conv);
      if (onClearInitialRecipient) onClearInitialRecipient();
    } else {
      // Create or get conversation then open full screen chat
      const currentPart: ConversationParticipant = {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng',
        accountId: accountId || 'HV-USER',
        photoURL: user.photoURL || '',
        isVip,
        isAuthorVerified,
        authorStageName
      };
      const otherPart: ConversationParticipant = {
        uid: initialRecipientUid,
        displayName: 'Bạn Bè',
        accountId: 'HV-USER',
        photoURL: '',
        isVip: false,
        isAuthorVerified: false
      };

      getOrCreateConversation(currentPart, otherPart).then((convId) => {
        const targetConv: Conversation = {
          id: convId,
          participants: [user.uid, initialRecipientUid],
          participantDetails: {
            [user.uid]: currentPart,
            [initialRecipientUid]: otherPart
          },
          lastMessageText: '',
          lastMessageSenderUid: '',
          lastMessageAt: new Date(),
          createdAt: new Date()
        };
        setSelectedConversation(targetConv);
        if (onClearInitialRecipient) onClearInitialRecipient();
      });
    }
  }, [initialRecipientUid, user, conversations]);

  // Get recipient information for conversation tile
  const getRecipientInfo = (conv: Conversation) => {
    if (!user || !conv.participantDetails) {
      return { displayName: 'Người dùng', photoURL: '', isVip: false, isAuthorVerified: false };
    }
    const otherUid = conv.participants.find(p => p !== user.uid) || '';
    return conv.participantDetails[otherUid] || {
      displayName: 'Bạn Bè',
      photoURL: '',
      isVip: false,
      isAuthorVerified: false
    };
  };

  const formatTileTime = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const isToday = new Date().toDateString() === date.toDateString();
      if (isToday) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const info = getRecipientInfo(conv);
    return info.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Track real-time presence (10-second offline threshold) for all partners and thought bubble users
  const allTargetUids = React.useMemo(() => {
    const uids = new Set<string>();
    conversations.forEach((c) => {
      c.participants.forEach((p) => {
        if (p && p !== user?.uid) uids.add(p);
      });
    });
    visibleThoughtBubbles.forEach((b) => {
      if (b.userId && b.userId !== user?.uid) uids.add(b.userId);
    });
    return Array.from(uids);
  }, [conversations, visibleThoughtBubbles, user?.uid]);

  const { getUserStatus, isUserOnline } = useBatchUserPresence(allTargetUids);

  // Real-time synchronization of partner user profiles (so purchased/equipped cosmetic frames update immediately)
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (allTargetUids.length === 0) return;

    const unsubs: (() => void)[] = [];
    allTargetUids.forEach((uid) => {
      if (!uid || uid === user?.uid) return;
      try {
        const uRef = doc(db, 'users', uid);
        const unsub = onSnapshot(uRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setPartnerProfiles((prev) => ({
              ...prev,
              [uid]: data
            }));
          }
        }, (err) => {
          console.warn('Partner profile sync notice:', uid, err);
        });
        unsubs.push(unsub);
      } catch (e) {
        // ignore
      }
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [allTargetUids, user?.uid]);

  // Calculate remaining hours for a bubble
  const getBubbleRemainingHours = (expiresAt: any) => {
    if (!expiresAt) return null;
    try {
      const exp = new Date(expiresAt).getTime();
      const diffMs = exp - Date.now();
      if (diffMs <= 0) return 'Hết hạn';
      const hours = Math.ceil(diffMs / (3600 * 1000));
      return `còn ${hours}h`;
    } catch {
      return null;
    }
  };

  // If a conversation is selected, display the FULL-SCREEN CHAT VIEW
  if (selectedConversation) {
    return (
      <FullScreenChatView
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        onPlayTrack={onPlayTrack}
        onOpenAuth={onOpenAuth}
        onNavigateToMode={onNavigateToMode}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. Friends Thought Bubbles Header (Chỉ hiện bạn bè & tự động hết hạn 3h/6h/12h/24h) */}
      <div className="relative bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border border-zinc-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 w-full max-w-full overflow-hidden">
        {/* Ambient Top Light Line & Subtle Corner Glows */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent pointer-events-none" />
        <div className="absolute -top-14 -left-14 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-14 -right-14 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header & Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.2)] shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-2">
                <span>Bong Bóng Suy Nghĩ</span>
                <span className="text-[10px] font-bold text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Bạn Bè
                </span>
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="truncate">Chỉ hiển thị với bạn bè • Tự hủy sau 3h, 6h, 12h, 24h</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLiteHubOpen(true)}
              className="text-xs font-semibold text-purple-200 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Mở Cửa Hàng Combo Vũ Trụ & Xu Haevy Lite"
            >
              <Orbit size={14} className="animate-spin text-purple-300" />
              <span>Combo Vũ Trụ ({haevyLiteCoins} Xu)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                setIsThoughtModalOpen(true);
              }}
              className="text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20 flex items-center gap-1 active:scale-95"
            >
              <Plus size={14} />
              <span>{myThoughtBubble ? 'Sửa suy nghĩ' : 'Đăng suy nghĩ'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Avatars with Thought Bubbles: Không bị cắt viền hoặc lệch lề */}
        <div className="relative z-10 flex items-center gap-6 sm:gap-8 overflow-x-auto pb-4 pt-12 sm:pt-14 px-6 sm:px-8 no-scrollbar scroll-smooth w-full">
          {/* User's Own Avatar & Thought Bubble */}
          <div className="flex flex-col items-center shrink-0 relative group">
            {myThoughtBubble ? (
              <div 
                style={{ backgroundColor: myThoughtBubble.bgColor || '#18181b' }}
                onClick={() => setIsThoughtModalOpen(true)}
                className="absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-2xl border border-white/20 text-[11px] text-white font-medium shadow-[0_8px_24px_rgba(0,0,0,0.6)] max-w-[130px] sm:max-w-[160px] truncate whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 z-30 flex items-center gap-1.5 backdrop-blur-md group-hover:border-amber-400/60"
                title={`${myThoughtBubble.text} (${getBubbleRemainingHours(myThoughtBubble.expiresAt)})`}
              >
                <span className="text-xs shrink-0">{myThoughtBubble.emoji || '💭'}</span>
                <span className="truncate">{myThoughtBubble.text}</span>
                {/* Pointer Tail */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white/20 bg-inherit pointer-events-none" />
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!user) onOpenAuth();
                  else setIsThoughtModalOpen(true);
                }}
                className="absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-dashed border-amber-400/50 bg-amber-950/40 hover:bg-amber-900/60 hover:border-amber-300 text-[10px] text-amber-300 font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95 z-30"
                title="Bấm để chia sẻ suy nghĩ mới"
              >
                <Plus size={11} className="text-amber-400 shrink-0" />
                <span>Chia sẻ</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b border-amber-400/50 bg-amber-950 pointer-events-none" />
              </div>
            )}

            <div 
              onClick={() => {
                if (!user) onOpenAuth();
                else setIsThoughtModalOpen(true);
              }}
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95 flex flex-col items-center relative mt-1"
            >
              <div className="relative">
                <CosmicAvatarFX
                  photoURL={user?.photoURL}
                  displayName={user?.displayName || 'Tôi'}
                  avatarFrameId={activeAvatarFrame}
                  isCurrentUser={true}
                  isVip={isVip}
                  size="md"
                  showBadge={false}
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs flex items-center justify-center border-2 border-zinc-900 shadow-md z-20 hover:scale-110 transition-transform" title="Viết suy nghĩ">
                  +
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-300 mt-2 truncate max-w-[80px] text-center">
              {user ? 'Bạn' : 'Đăng nhập'}
            </span>
            {myThoughtBubble?.expiresAt && (
              <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                {getBubbleRemainingHours(myThoughtBubble.expiresAt)}
              </span>
            )}
          </div>

          {/* Friends' Thought Bubbles */}
          {visibleThoughtBubbles
            .filter(b => b.userId !== user?.uid)
            .map((bubble) => {
              const isOnline = isUserOnline(bubble.userId);
              return (
                <div
                  key={bubble.id}
                  onClick={() => setSelectedThoughtFriend(bubble)}
                  className="flex flex-col items-center shrink-0 relative group cursor-pointer"
                >
                  {/* Floating Thought Bubble with Frosted Glass and Tail */}
                  <div 
                    style={{ backgroundColor: bubble.bgColor || '#18181b' }}
                    className="absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-2xl border border-white/20 text-[11px] text-white font-medium shadow-[0_8px_24px_rgba(0,0,0,0.6)] max-w-[130px] sm:max-w-[160px] truncate whitespace-nowrap group-hover:scale-105 active:scale-95 transition-all duration-200 z-30 flex items-center gap-1.5 backdrop-blur-md animate-in fade-in"
                    title={`${bubble.text} (${getBubbleRemainingHours(bubble.expiresAt)})`}
                  >
                    <span className="text-xs shrink-0">{bubble.emoji || '💭'}</span>
                    <span className="truncate">{bubble.text}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white/20 bg-inherit pointer-events-none" />
                  </div>

                  {/* Avatar with Presence Indicator and Friend's OWN Frame */}
                  <div className="relative mt-1">
                    <CosmicAvatarFX
                      photoURL={bubble.userPhoto}
                      displayName={bubble.userName}
                      avatarFrameId={bubble.activeAvatarFrame}
                      isCurrentUser={false}
                      isVip={bubble.isUserVip}
                      size="md"
                      showBadge={false}
                    />
                    {/* Presence Dot */}
                    {isOnline ? (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center z-20" title="Đang trực tuyến">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-950 z-20" title="Ngoại tuyến" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-300 mt-2 truncate max-w-[80px] text-center group-hover:text-white transition-colors">
                    {bubble.userName}
                  </span>
                  {bubble.expiresAt && (
                    <span className="text-[9px] text-amber-400/90 font-mono mt-0.5">
                      {getBubbleRemainingHours(bubble.expiresAt)}
                    </span>
                  )}
                </div>
              );
            })}

          {visibleThoughtBubbles.filter(b => b.userId !== user?.uid).length === 0 && (
            <div className="flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-zinc-400 text-xs shrink-0 select-none backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Clock size={15} />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-zinc-300 text-xs">Chưa có suy nghĩ từ bạn bè</p>
                <p className="text-[10px] text-zinc-500">Bong bóng của bạn bè sẽ tự động xuất hiện tại đây khi họ đăng</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Conversations Section (Clicking any conversation enters Full Screen Chat) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Section Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Tin Nhắn Trực Tuyến</h3>
              <p className="text-xs text-zinc-400">Chọn một người để mở phòng chat toàn màn hình HD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm cuộc trò chuyện..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="button"
              onClick={onGoToFriendsTab}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 border border-zinc-700"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Thêm bạn</span>
            </button>
          </div>
        </div>

        {/* Conversations Grid / List: Toàn bộ thẻ trò chuyện đều được đóng khung viền ngăn nắp, sang trọng */}
        <div className="space-y-2.5 sm:space-y-3">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const rawInfo = getRecipientInfo(conv);
              const unread = user && conv.unreadCounts ? conv.unreadCounts[user.uid] || 0 : 0;
              const otherUid = conv.participants.find(p => p !== user?.uid) || '';
              const isPartnerOnline = isUserOnline(otherUid);
              const partnerStatus = getUserStatus(otherUid);

              // Lấy thông tin thời gian thực của người nhận từ partnerProfiles (Đảm bảo người nào mua người đó mới được trang bị)
              const livePartner = partnerProfiles[otherUid] || {};
              const partnerAvatarFrame = livePartner.activeAvatarFrame !== undefined 
                ? livePartner.activeAvatarFrame 
                : (rawInfo as any)?.activeAvatarFrame;
              const partnerNameBorderId = livePartner.activeNameBorder !== undefined 
                ? livePartner.activeNameBorder 
                : (rawInfo as any)?.activeNameBorder;
              const partnerNameFontId = livePartner.activeNameFont !== undefined 
                ? livePartner.activeNameFont 
                : (rawInfo as any)?.activeNameFont;

              const partnerNameBorder = getNameBorder(partnerNameBorderId);
              const partnerNameFont = getNameFont(partnerNameFontId);
              const isTrooper = partnerAvatarFrame === 'frame_holo_trooper';

              const recipientDisplayName = livePartner.displayName || rawInfo.displayName || 'Người Dùng';
              const recipientPhotoURL = livePartner.photoURL !== undefined ? livePartner.photoURL : rawInfo.photoURL;
              const recipientIsVip = livePartner.isVip !== undefined ? Boolean(livePartner.isVip) : Boolean(rawInfo.isVip);
              const recipientIsAuthorVerified = livePartner.isAuthorVerified !== undefined ? Boolean(livePartner.isAuthorVerified) : Boolean(rawInfo.isAuthorVerified);

              // Khung viền toàn bộ theo vật phẩm người đó trang bị
              let cardBorderClasses = 'border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700/90 hover:bg-zinc-900/80 shadow-md';
              let cardTopGlow = null;

              if (partnerNameBorderId === 'name_royal_gold') {
                cardBorderClasses = 'border-amber-400/60 shadow-[0_4px_22px_rgba(245,158,11,0.22)] bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-zinc-950 hover:border-amber-300 hover:shadow-[0_6px_30px_rgba(245,158,11,0.35)]';
                cardTopGlow = 'from-amber-400/30 via-yellow-400/20 to-transparent';
              } else if (partnerNameBorderId === 'name_cyber_cyan') {
                cardBorderClasses = 'border-cyan-400/60 shadow-[0_4px_22px_rgba(6,182,212,0.22)] bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-zinc-950 hover:border-cyan-300 hover:shadow-[0_6px_30px_rgba(6,182,212,0.35)]';
                cardTopGlow = 'from-cyan-400/30 via-blue-400/20 to-transparent';
              } else if (partnerNameBorderId === 'name_galactic_stars') {
                cardBorderClasses = 'border-purple-400/60 shadow-[0_4px_22px_rgba(168,85,247,0.22)] bg-gradient-to-r from-purple-950/40 via-pink-950/20 to-zinc-950 hover:border-purple-300 hover:shadow-[0_6px_30px_rgba(168,85,247,0.35)]';
                cardTopGlow = 'from-purple-400/30 via-pink-400/20 to-transparent';
              } else if (partnerNameBorderId === 'name_frosted_crystal') {
                cardBorderClasses = 'border-sky-400/60 shadow-[0_4px_22px_rgba(56,189,248,0.22)] bg-gradient-to-r from-sky-950/40 via-teal-950/20 to-zinc-950 hover:border-sky-300 hover:shadow-[0_6px_30px_rgba(56,189,248,0.35)]';
                cardTopGlow = 'from-sky-400/30 via-teal-400/20 to-transparent';
              } else if (partnerNameBorderId === 'name_blazing_flame') {
                cardBorderClasses = 'border-orange-500/60 shadow-[0_4px_22px_rgba(249,115,22,0.22)] bg-gradient-to-r from-orange-950/40 via-red-950/20 to-zinc-950 hover:border-orange-400 hover:shadow-[0_6px_30px_rgba(249,115,22,0.35)]';
                cardTopGlow = 'from-orange-500/30 via-red-500/20 to-transparent';
              } else if (isTrooper) {
                cardBorderClasses = 'border-sky-400/50 shadow-[0_4px_22px_rgba(56,189,248,0.22)] bg-gradient-to-r from-blue-950/40 via-zinc-900/90 to-zinc-950 hover:border-cyan-300';
                cardTopGlow = 'from-cyan-400/30 via-blue-400/20 to-transparent';
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border flex items-center gap-3.5 cursor-pointer transition-all duration-200 active:scale-[0.99] relative overflow-hidden group backdrop-blur-sm ${cardBorderClasses}`}
                >
                  {/* Subtle top ambient glow for equipped custom cards */}
                  {cardTopGlow && (
                    <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${cardTopGlow} pointer-events-none`} />
                  )}

                  {/* Recipient Avatar with Cosmic / Theme FX (Click to open Cosmic Profile Card) */}
                  <div 
                    className="relative shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileModalUser({
                        displayName: recipientDisplayName,
                        photoURL: recipientPhotoURL,
                        isVip: recipientIsVip,
                        isAuthorVerified: recipientIsAuthorVerified,
                        statusText: partnerStatus.statusText,
                        activeAvatarFrame: partnerAvatarFrame,
                        activeNameBorder: partnerNameBorderId,
                        activeNameFont: partnerNameFontId,
                        uid: otherUid
                      });
                    }}
                    title="Bấm để xem Hồ Sơ Vũ Trụ và trang sức"
                  >
                    <CosmicAvatarFX
                      photoURL={recipientPhotoURL}
                      displayName={recipientDisplayName}
                      avatarFrameId={partnerAvatarFrame}
                      isCurrentUser={false}
                      isVip={recipientIsVip}
                      size="md"
                      showBadge={false}
                    />
                    {/* Presence Dot */}
                    {isPartnerOnline ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center z-20" title="Đang trực tuyến">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-900 z-20" title={partnerStatus.statusText} />
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate flex-wrap">
                        {partnerNameBorder ? (
                          <div className={`px-2.5 py-0.5 rounded-xl border flex items-center gap-1.5 shadow-sm transition-transform duration-200 group-hover:scale-[1.02] ${partnerNameBorder.nameplateBorderClass} ${partnerNameBorder.nameplateBgClass}`}>
                            <span className="text-xs">{partnerNameBorder.nameplateIcon}</span>
                            <h4 
                              className={`text-sm font-black truncate ${partnerNameFont?.fontGlowClass || partnerNameBorder.nameplateTextClass}`}
                              style={partnerNameFont ? { fontFamily: partnerNameFont.fontFamilyName } : undefined}
                            >
                              {recipientDisplayName}
                            </h4>
                          </div>
                        ) : partnerNameFont ? (
                          <h4 
                            className={`text-sm font-black truncate transition-colors ${partnerNameFont.fontGlowClass || 'text-white'}`}
                            style={{ fontFamily: partnerNameFont.fontFamilyName }}
                          >
                            {recipientDisplayName}
                          </h4>
                        ) : (
                          <h4 className="text-sm font-bold truncate text-white group-hover:text-sky-300 transition-colors">
                            {recipientDisplayName}
                          </h4>
                        )}

                        {isTrooper && (
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 font-black px-1.5 py-0.5 rounded-md border border-sky-400/40 shrink-0 flex items-center gap-0.5">
                            <span>🪖 Trooper</span>
                          </span>
                        )}

                        {recipientIsVip && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40 shrink-0">
                            VIP
                          </span>
                        )}
                        {recipientIsAuthorVerified && (
                          <CheckCircle2 size={13} className="text-sky-400 shrink-0" />
                        )}
                        {conv.isE2EEEnabled && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40 shrink-0 flex items-center gap-0.5" title="Mã hóa đầu cuối 6 lớp">
                            <ShieldCheck size={10} />
                            <span>6 Lớp</span>
                          </span>
                        )}
                        {isPartnerOnline && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30 shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Online
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {formatTileTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-1 flex items-center gap-1 ${
                      unread > 0 ? 'text-white font-bold' : 'text-zinc-400'
                    }`}>
                      {isEncryptedMessage(conv.lastMessageText) || conv.isE2EEEnabled ? (
                        <>
                          <Lock size={11} className="text-amber-400 shrink-0" />
                          <span className="text-amber-300/90 font-mono text-[11px]">[Tin nhắn mã hóa 6 lớp]</span>
                        </>
                      ) : (
                        conv.lastMessageText || 'Bấm để mở cuộc trò chuyện toàn màn hình...'
                      )}
                    </p>
                  </div>

                  {/* Unread badge or chevron */}
                  {unread > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-md shadow-rose-500/40 animate-pulse">
                      {unread}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold hidden sm:inline">
                      Mở chat ➔
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-3 text-zinc-500">
              <div className="w-14 h-14 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600 shadow-xl">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-sm font-bold text-zinc-300">Chưa có cuộc trò chuyện nào</h4>
              <p className="text-xs max-w-sm mx-auto text-zinc-400">
                Tìm kiếm bạn bè trong mục Bạn Bè hoặc bấm vào bong bóng suy nghĩ của bạn bè ở trên để bắt đầu nhắn tin!
              </p>
              <button
                type="button"
                onClick={onGoToFriendsTab}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <UserPlus size={14} />
                <span>Tìm Bạn Bè Ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thought Bubble Modal (Create/Edit Note with 3h, 6h, 12h, 24h) */}
      <ThoughtBubbleModal
        isOpen={isThoughtModalOpen}
        onClose={() => setIsThoughtModalOpen(false)}
        currentBubble={myThoughtBubble}
      />

      {/* Friend Thought Details Popup */}
      {selectedThoughtFriend && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedThoughtFriend(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                  {selectedThoughtFriend.userPhoto ? (
                    <img src={selectedThoughtFriend.userPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-sky-600 flex items-center justify-center text-white font-bold">
                      {selectedThoughtFriend.userName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedThoughtFriend.userName}</h4>
                  <p className="text-[10px] text-amber-400 font-mono">
                    {getBubbleRemainingHours(selectedThoughtFriend.expiresAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedThoughtFriend(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div 
              style={{ backgroundColor: selectedThoughtFriend.bgColor || '#18181b' }}
              className="p-4 rounded-2xl border border-zinc-700 text-xs text-white font-medium shadow-inner leading-relaxed"
            >
              <span className="text-base mr-1.5">{selectedThoughtFriend.emoji || '💭'}</span>
              "{selectedThoughtFriend.text}"
            </div>

            <button
              type="button"
              onClick={() => {
                const targetUid = selectedThoughtFriend.userId;
                setSelectedThoughtFriend(null);
                const conv = conversations.find(c => c.participants.includes(targetUid));
                if (conv) {
                  setSelectedConversation(conv);
                } else if (user) {
                  const currentPart: ConversationParticipant = {
                    uid: user.uid,
                    displayName: user.displayName || 'Người dùng',
                    accountId: accountId || 'HV-USER',
                    photoURL: user.photoURL || '',
                    isVip,
                    isAuthorVerified,
                    authorStageName
                  };
                  const otherPart: ConversationParticipant = {
                    uid: targetUid,
                    displayName: selectedThoughtFriend.userName,
                    accountId: selectedThoughtFriend.userAccountId,
                    photoURL: selectedThoughtFriend.userPhoto || '',
                    isVip: selectedThoughtFriend.isUserVip,
                    isAuthorVerified: selectedThoughtFriend.isAuthorVerified,
                    authorStageName: selectedThoughtFriend.authorStageName
                  };
                  getOrCreateConversation(currentPart, otherPart).then((convId) => {
                    setSelectedConversation({
                      id: convId,
                      participants: [user.uid, targetUid],
                      participantDetails: {
                        [user.uid]: currentPart,
                        [targetUid]: otherPart
                      },
                      lastMessageText: '',
                      lastMessageSenderUid: '',
                      lastMessageAt: new Date(),
                      createdAt: new Date()
                    });
                  });
                }
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Mở phòng chat với {selectedThoughtFriend.userName}</span>
            </button>
          </div>
        </div>
      )}

      {/* Haevy Lite Hub Modal for Themes, Watching 30s Ads, and Top-Up */}
      <HaevyLiteHubModal
        isOpen={isLiteHubOpen}
        onClose={() => setIsLiteHubOpen(false)}
        initialTab="shop"
      />

      {/* Cosmic Profile Card Modal when clicking conversation user avatar */}
      {profileModalUser && (
        <CosmicProfileCardModal
          isOpen={true}
          onClose={() => setProfileModalUser(null)}
          userData={profileModalUser}
          onStartChat={() => {
            const conv = conversations.find(c => c.participants.includes(profileModalUser.uid || ''));
            if (conv) {
              setSelectedConversation(conv);
            }
            setProfileModalUser(null);
          }}
        />
      )}
    </div>
  );
}
