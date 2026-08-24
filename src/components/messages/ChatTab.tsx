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
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Conversation, ThoughtBubble, ConversationParticipant, Friendship, Track } from '../../types';
import { 
  getOrCreateConversation 
} from '../../services/socialService';
import { useBatchUserPresence } from '../../services/presenceService';
import { 
  collection, 
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
}

export function ChatTab({
  onOpenAuth,
  onGoToFriendsTab,
  initialRecipientUid,
  onClearInitialRecipient,
  onPlayTrack
}: ChatTabProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawThoughtBubbles, setRawThoughtBubbles] = useState<ThoughtBubble[]>([]);
  const [friendUserIds, setFriendUserIds] = useState<Set<string>>(new Set());
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [selectedThoughtFriend, setSelectedThoughtFriend] = useState<ThoughtBubble | null>(null);

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
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* 1. Friends Thought Bubbles Header (Chỉ hiện bạn bè & tự động hết hạn 3h/6h/12h/24h) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                Bong Bóng Suy Nghĩ Bạn Bè
              </h3>
              <p className="text-[10px] text-zinc-400">Chỉ hiển thị với bạn bè • Tự hủy trong 3h, 6h, 12h, 24h</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                onOpenAuth();
                return;
              }
              setIsThoughtModalOpen(true);
            }}
            className="text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-amber-400/20 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>{myThoughtBubble ? 'Sửa bong bóng' : 'Đăng suy nghĩ'}</span>
          </button>
        </div>

        {/* Horizontal Avatars with Thought Bubbles */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-7 sm:pt-8 px-1 no-scrollbar scroll-smooth w-full">
          {/* User's Own Avatar & Thought Bubble */}
          <div className="flex flex-col items-center shrink-0 relative group">
            {myThoughtBubble && (
              <div 
                style={{ backgroundColor: myThoughtBubble.bgColor || '#18181b' }}
                onClick={() => setIsThoughtModalOpen(true)}
                className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-zinc-700 text-[10px] text-white font-semibold shadow-xl max-w-[110px] sm:max-w-[140px] truncate whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                title={`${myThoughtBubble.text} (${getBubbleRemainingHours(myThoughtBubble.expiresAt)})`}
              >
                <span>{myThoughtBubble.emoji || '💭'}</span> {myThoughtBubble.text}
              </div>
            )}
            <div 
              onClick={() => {
                if (!user) onOpenAuth();
                else setIsThoughtModalOpen(true);
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-dashed border-amber-400 p-0.5 flex items-center justify-center cursor-pointer hover:border-solid transition-all shadow-md relative"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user ? user.displayName?.charAt(0) || 'Tôi' : <Plus size={18} />}
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-amber-300 mt-1 truncate max-w-[70px]">
              {user ? 'Bạn' : 'Đăng nhập'}
            </span>
            {myThoughtBubble?.expiresAt && (
              <span className="text-[9px] text-zinc-500 font-mono">
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
                  {/* Floating Thought Bubble */}
                  <div 
                    style={{ backgroundColor: bubble.bgColor || '#18181b' }}
                    className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-zinc-700 text-[10px] text-white font-semibold shadow-xl max-w-[110px] sm:max-w-[140px] truncate whitespace-nowrap group-hover:scale-105 transition-transform animate-in fade-in"
                    title={`${bubble.text} (${getBubbleRemainingHours(bubble.expiresAt)})`}
                  >
                    <span className="mr-1">{bubble.emoji || '💭'}</span>
                    <span>{bubble.text}</span>
                  </div>

                  {/* Avatar with Presence Indicator */}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 border-2 shadow-md ${
                    bubble.isUserVip ? 'border-amber-400 bg-amber-500/20' : isOnline ? 'border-emerald-500/80 bg-zinc-800' : 'border-zinc-700 bg-zinc-800'
                  }`}>
                    <div className="w-full h-full rounded-[14px] overflow-hidden">
                      {bubble.userPhoto ? (
                        <img src={bubble.userPhoto} alt={bubble.userName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                          {bubble.userName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    {/* Presence Dot (10s threshold) */}
                    {isOnline ? (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-sm flex items-center justify-center" title="Đang trực tuyến">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-950" title="Ngoại tuyến" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-300 mt-1 truncate max-w-[75px]">
                    {bubble.userName}
                  </span>
                  {bubble.expiresAt && (
                    <span className="text-[9px] text-amber-400/80 font-mono">
                      {getBubbleRemainingHours(bubble.expiresAt)}
                    </span>
                  )}
                </div>
              );
            })}

          {visibleThoughtBubbles.length <= 1 && (
            <div className="text-zinc-500 text-xs py-3 italic whitespace-nowrap pl-2 flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-600" />
              <span>Chỉ bạn bè của bạn mới thấy suy nghĩ này. Hãy kết nối thêm bạn bè!</span>
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

        {/* Conversations Grid / List */}
        <div className="divide-y divide-zinc-800/60">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const info = getRecipientInfo(conv);
              const unread = user && conv.unreadCounts ? conv.unreadCounts[user.uid] || 0 : 0;
              const otherUid = conv.participants.find(p => p !== user?.uid) || '';
              const isPartnerOnline = isUserOnline(otherUid);
              const partnerStatus = getUserStatus(otherUid);

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="p-3 sm:p-4 rounded-2xl flex items-center gap-3.5 hover:bg-zinc-800/60 cursor-pointer transition-all active:scale-99 group"
                >
                  {/* Recipient Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700/80 shadow-md">
                      {info.photoURL ? (
                        <img src={info.photoURL} alt={info.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                          {info.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {info.isVip && (
                      <Crown size={13} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400 drop-shadow" />
                    )}
                    {/* Presence Dot (10s threshold) */}
                    {isPartnerOnline ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-sm flex items-center justify-center" title="Đang trực tuyến">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-900" title={partnerStatus.statusText} />
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                          {info.displayName}
                        </h4>
                        {info.isVip && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40 shrink-0">
                            VIP
                          </span>
                        )}
                        {info.isAuthorVerified && (
                          <CheckCircle2 size={13} className="text-sky-400 shrink-0" />
                        )}
                        {isPartnerOnline && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30 shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {formatTileTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-1 ${
                      unread > 0 ? 'text-white font-bold' : 'text-zinc-400'
                    }`}>
                      {conv.lastMessageText || 'Bấm để mở cuộc trò chuyện toàn màn hình...'}
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
    </div>
  );
}
