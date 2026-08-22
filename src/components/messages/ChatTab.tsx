import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Clock, 
  Plus, 
  Mic, 
  Square, 
  Trash2, 
  User, 
  Volume2, 
  Search, 
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Conversation, ChatMessage, Friendship, ThoughtBubble, ConversationParticipant } from '../../types';
import { 
  sendChatMessage, 
  markConversationAsRead, 
  toggleMessageReaction, 
  getOrCreateConversation 
} from '../../services/socialService';
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

interface ChatTabProps {
  onOpenAuth: () => void;
  onGoToFriendsTab: () => void;
  initialRecipientUid?: string | null;
  onClearInitialRecipient?: () => void;
}

export function ChatTab({
  onOpenAuth,
  onGoToFriendsTab,
  initialRecipientUid,
  onClearInitialRecipient
}: ChatTabProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [thoughtBubbles, setThoughtBubbles] = useState<ThoughtBubble[]>([]);
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [selectedThoughtFriend, setSelectedThoughtFriend] = useState<ThoughtBubble | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Emoji picker popup
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiList = ['❤️', '😂', '🔥', '👏', '😍', '🎉', '👍', '✨', '🎧', '💯', '🙏', '🥰'];

  // Mobile responsive active chat toggle
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current user's own thought bubble
  const myThoughtBubble = thoughtBubbles.find(b => b.userId === user?.uid) || null;

  // 1. Subscribe to Thought Bubbles
  useEffect(() => {
    const qBubbles = query(collection(db, 'thoughtBubbles'), limit(50));
    const unsubscribe = onSnapshot(qBubbles, (snap) => {
      const list: ThoughtBubble[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as ThoughtBubble));
      setThoughtBubbles(list);
    }, (err) => {
      console.warn('Thought bubbles listener:', err);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Conversations
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

      if (selectedConversation) {
        const found = list.find((c) => c.id === selectedConversation.id);
        if (found) setSelectedConversation(found);
      }
    }, (err) => {
      console.warn('Conversations snapshot listener error:', err);
    });

    return () => unsubscribe();
  }, [user, selectedConversation?.id]);

  // 3. Handle initialRecipientUid if triggered from outside
  useEffect(() => {
    if (!user || !initialRecipientUid) return;

    const conv = conversations.find(c => c.participants.includes(initialRecipientUid));
    if (conv) {
      setSelectedConversation(conv);
      setMobileShowChat(true);
      if (onClearInitialRecipient) onClearInitialRecipient();
    } else {
      // Create or get conversation
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
        if (onClearInitialRecipient) onClearInitialRecipient();
      });
    }
  }, [initialRecipientUid, user, conversations]);

  // 4. Subscribe to Real-Time Messages in active conversation
  useEffect(() => {
    if (!user || !selectedConversation) {
      setMessages([]);
      return;
    }

    markConversationAsRead(selectedConversation.id, user.uid);

    const msgQuery = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      msgQuery,
      (snapshot) => {
        const list: ChatMessage[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        } as ChatMessage));
        setMessages(list);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      (err) => {
        console.warn('Messages listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation?.id, user]);

  // Voice recording handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (selectedConversation && user) {
            await sendChatMessage({
              conversationId: selectedConversation.id,
              sender: {
                uid: user.uid,
                displayName: user.displayName || 'Người dùng',
                photoURL: user.photoURL || '',
                isVip
              },
              text: `[Tin nhắn thoại Voice Note 🎙️ ${recordingSeconds}s]`,
              attachments: [{ type: 'voice', url: base64Audio, durationSec: recordingSeconds }]
            });
          }
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recorder error:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Send text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user || !selectedConversation) return;

    const text = inputText;
    setInputText('');
    setShowEmojiPicker(false);

    await sendChatMessage({
      conversationId: selectedConversation.id,
      sender: {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng',
        photoURL: user.photoURL || '',
        isVip
      },
      text
    });
  };

  // Format timestamp
  const formatTime = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getRecipientInfo = (conv: Conversation) => {
    if (!user || !conv.participantDetails) {
      return { displayName: 'Người dùng', photoURL: '', isVip: false, isAuthorVerified: false };
    }
    const otherUid = conv.participants.find(p => p !== user.uid) || '';
    return conv.participantDetails[otherUid] || {
      displayName: 'Người dùng',
      photoURL: '',
      isVip: false,
      isAuthorVerified: false
    };
  };

  const filteredConversations = conversations.filter(conv => {
    const info = getRecipientInfo(conv);
    return info.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-3 sm:space-y-5 w-full max-w-full overflow-hidden">
      {/* 1. Friends Thought Bubbles Carousel Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl backdrop-blur-md space-y-2.5 sm:space-y-3 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
              Bong Bóng Suy Nghĩ Bạn Bè
            </h3>
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
            className="text-[10px] sm:text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-amber-500/30 transition-all cursor-pointer shrink-0"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">{myThoughtBubble ? 'Sửa bong bóng của bạn' : 'Tạo bong bóng suy nghĩ'}</span>
            <span className="sm:hidden">{myThoughtBubble ? 'Sửa' : '+ Tạo'}</span>
          </button>
        </div>

        {/* Horizontal Avatars with Thought Bubbles */}
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto pb-2 pt-6 sm:pt-7 px-1 no-scrollbar scroll-smooth w-full">
          {/* User's own avatar & Thought Bubble */}
          <div className="flex flex-col items-center shrink-0 relative group">
            {myThoughtBubble && (
              <div 
                style={{ backgroundColor: myThoughtBubble.bgColor || '#18181b' }}
                onClick={() => setIsThoughtModalOpen(true)}
                className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 px-2 sm:px-2.5 py-0.5 rounded-full border border-zinc-700 text-[9px] sm:text-[10px] text-white font-medium shadow-lg max-w-[100px] sm:max-w-[120px] truncate whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                title={myThoughtBubble.text}
              >
                <span>{myThoughtBubble.emoji || '💭'}</span> {myThoughtBubble.text}
              </div>
            )}
            <div 
              onClick={() => {
                if (!user) onOpenAuth();
                else setIsThoughtModalOpen(true);
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-dashed border-amber-400/80 p-0.5 flex items-center justify-center cursor-pointer hover:border-solid transition-all shadow-md"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user ? user.displayName?.charAt(0) || 'Tôi' : <Plus size={16} />}
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-amber-300 mt-1 truncate max-w-[65px]">
              {user ? 'Bạn' : 'Đăng nhập'}
            </span>
          </div>

          {/* Friends Thought Bubbles */}
          {thoughtBubbles
            .filter(b => b.userId !== user?.uid)
            .map((bubble) => (
              <div
                key={bubble.id}
                onClick={() => setSelectedThoughtFriend(bubble)}
                className="flex flex-col items-center shrink-0 relative group cursor-pointer"
              >
                {/* Floating Thought Bubble */}
                <div 
                  style={{ backgroundColor: bubble.bgColor || '#18181b' }}
                  className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 px-2 sm:px-2.5 py-0.5 rounded-full border border-zinc-700 text-[9px] sm:text-[10px] text-white font-semibold shadow-lg max-w-[100px] sm:max-w-[130px] truncate whitespace-nowrap group-hover:scale-105 transition-transform animate-in fade-in"
                  title={bubble.text}
                >
                  <span className="mr-0.5">{bubble.emoji || '💭'}</span>
                  <span>{bubble.text}</span>
                </div>

                {/* Avatar */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden p-0.5 border-2 shadow-md ${
                  bubble.isUserVip ? 'border-amber-400 bg-amber-500/20' : 'border-zinc-700 bg-zinc-800'
                }`}>
                  {bubble.userPhoto ? (
                    <img src={bubble.userPhoto} alt={bubble.userName} className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-zinc-900 flex items-center justify-center text-zinc-300 font-bold text-xs">
                      {bubble.userName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-zinc-300 mt-1 truncate max-w-[70px]">
                  {bubble.userName}
                </span>
              </div>
            ))}

          {thoughtBubbles.length <= 1 && (
            <div className="text-zinc-500 text-xs py-2 italic whitespace-nowrap pl-2">
              Chưa có bạn bè nào đăng bong bóng suy nghĩ. Hãy là người đầu tiên!
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Chat Layout: Conversations List (Left) + Active Conversation (Right) */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md h-[540px] sm:h-[600px] grid grid-cols-1 md:grid-cols-12 w-full max-w-full">
        {/* Left: Conversations Sidebar */}
        <div className={`md:col-span-4 border-r border-zinc-800 flex flex-col h-full overflow-hidden w-full ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Header */}
          <div className="p-3 sm:p-3.5 border-b border-zinc-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <MessageSquare size={15} className="text-sky-400" />
                <span>Hộp Thư Trực Tuyến</span>
              </h4>
              <button
                type="button"
                onClick={onGoToFriendsTab}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300"
              >
                + Kết bạn mới
              </button>
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm đoạn chat..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50 w-full">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const info = getRecipientInfo(conv);
                const isSelected = selectedConversation?.id === conv.id;
                const unread = user && conv.unreadCounts ? conv.unreadCounts[user.uid] || 0 : 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMobileShowChat(true);
                    }}
                    className={`p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-zinc-800/90 border-l-2 border-l-sky-400' : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
                        {info.photoURL ? (
                          <img src={info.photoURL} alt={info.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                            {info.displayName.charAt(0)}
                          </div>
                        )}
                      </div>
                      {info.isVip && (
                        <Crown size={12} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-white truncate max-w-[120px]">
                          {info.displayName}
                        </h5>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${
                        unread > 0 ? 'text-white font-bold' : 'text-zinc-400'
                      }`}>
                        {conv.lastMessageText || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 animate-pulse">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2 text-zinc-500">
                <MessageSquare size={28} className="mx-auto text-zinc-600" />
                <p className="text-xs">Chưa có cuộc trò chuyện nào.</p>
                <button
                  type="button"
                  onClick={onGoToFriendsTab}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Tìm bạn bè để bắt đầu nhắn tin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className={`md:col-span-8 flex flex-col bg-zinc-950/40 h-full overflow-hidden w-full min-w-0 ${
          mobileShowChat ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const info = getRecipientInfo(selectedConversation);
                return (
                  <div className="p-2.5 sm:p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setMobileShowChat(false)}
                        className="md:hidden p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white shrink-0"
                      >
                        <ArrowLeft size={16} />
                      </button>

                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                        {info.photoURL ? (
                          <img src={info.photoURL} alt={info.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                            {info.displayName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                            {info.displayName}
                          </h4>
                          {info.isVip && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/40 shrink-0">
                              VIP
                            </span>
                          )}
                          {info.isAuthorVerified && (
                            <CheckCircle2 size={12} className="text-sky-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          Đang trực tuyến realtime
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 w-full min-w-0">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid || msg.senderUid === user?.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 w-full`}
                      >
                        <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-[75%]`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-xl overflow-hidden bg-zinc-800 shrink-0 mb-1 border border-zinc-700">
                              {msg.senderPhoto ? (
                                <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                  {msg.senderName?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                          )}

                          <div className={`p-2.5 sm:p-3 rounded-2xl text-xs space-y-1 relative group break-words min-w-0 ${
                            isMe
                              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none shadow-md shadow-sky-600/20'
                              : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/80 shadow-md'
                          }`}>
                            {/* Message text */}
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>

                            {/* Voice note attachment if present */}
                            {msg.attachments?.map((att: any, idx: number) => {
                              if (att.type === 'voice') {
                                return (
                                  <div key={idx} className="pt-2 max-w-full">
                                    <audio src={att.url} controls className="h-8 max-w-full rounded-xl" />
                                  </div>
                                );
                              }
                              return null;
                            })}

                            {/* Message footer info */}
                            <div className={`flex items-center gap-1.5 text-[9px] pt-1 ${
                              isMe ? 'text-sky-200 justify-end' : 'text-zinc-400 justify-start'
                            }`}>
                              <span>{formatTime(msg.createdAt)}</span>
                            </div>

                            {/* Quick emoji reactions bar on hover */}
                            <div className="absolute -top-3 right-0 hidden group-hover:flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded-full shadow-lg z-10">
                              {['❤️', '👍', '🔥'].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    if (user && selectedConversation) {
                                      toggleMessageReaction(selectedConversation.id, msg.id, emoji, user.uid);
                                    }
                                  }}
                                  className="hover:scale-125 transition-transform text-[11px] p-0.5 cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Display Reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex items-center gap-1 px-1">
                            {Object.entries(msg.reactions).map(([emoji, uids]: [string, any]) => (
                              <span
                                key={emoji}
                                className="bg-zinc-800/90 border border-zinc-700 text-[10px] px-1.5 py-0.5 rounded-full text-zinc-300"
                              >
                                {emoji} {uids.length}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 py-10">
                    <Sparkles size={24} className="text-sky-400 animate-pulse" />
                    <p className="text-xs">Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-2 sm:p-3.5 border-t border-zinc-800 bg-zinc-900/70 relative shrink-0">
                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-2 sm:left-4 bg-zinc-900 border border-zinc-700 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 flex-wrap max-w-xs z-20 animate-in fade-in">
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setInputText((prev) => prev + emoji)}
                        className="p-1.5 hover:bg-zinc-800 rounded-xl text-base transition-transform hover:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Voice Note Recording State */}
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between bg-red-950/40 border border-red-500/50 rounded-2xl p-2 px-3 animate-pulse gap-2">
                    <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold truncate">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="truncate">Thu âm ({recordingSeconds}s)...</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCancelRecording}
                        className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="p-1.5 px-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Square size={11} fill="currentColor" />
                        <span>Gửi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors shrink-0"
                      title="Biểu tượng cảm xúc"
                    >
                      <Smile size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-sky-300 transition-colors shrink-0"
                      title="Gửi tin nhắn thoại Voice Note HD"
                    >
                      <Mic size={17} />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold transition-all disabled:opacity-40 shadow-md shadow-sky-600/20 shrink-0"
                      title="Gửi tin nhắn"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
              <MessageSquare size={36} className="text-zinc-600" />
              <h4 className="text-sm font-bold text-zinc-400">Chọn Một Cuộc Trò Chuyện</h4>
              <p className="text-xs max-w-xs leading-relaxed">
                Nhắn tin trực tuyến tức thì, gửi Voice Note chất lượng cao và giao lưu cùng bạn bè
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Thought Bubble Modal */}
      <ThoughtBubbleModal
        isOpen={isThoughtModalOpen}
        onClose={() => setIsThoughtModalOpen(false)}
        currentBubble={myThoughtBubble}
      />

      {/* Friend Thought Details Popup */}
      {selectedThoughtFriend && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedThoughtFriend(null)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedThoughtFriend.emoji || '💭'}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedThoughtFriend.userName}</h4>
                  <p className="text-[10px] text-zinc-400">Bong bóng suy nghĩ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedThoughtFriend(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>

            <div 
              style={{ backgroundColor: selectedThoughtFriend.bgColor || '#18181b' }}
              className="p-4 rounded-2xl border border-zinc-700 text-xs text-white font-medium shadow-inner"
            >
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
                  setMobileShowChat(true);
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
                  getOrCreateConversation(currentPart, otherPart).then(() => {
                    setMobileShowChat(true);
                  });
                }
              }}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <MessageSquare size={14} />
              <span>Nhắn tin với {selectedThoughtFriend.userName}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
