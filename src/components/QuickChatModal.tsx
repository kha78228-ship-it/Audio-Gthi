import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Crown, 
  ShieldCheck, 
  User as UserIcon, 
  Gift, 
  ExternalLink,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Track } from '../types';
import { 
  getConversationId, 
  sendChatMessage, 
  markConversationAsRead 
} from '../services/socialService';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface QuickChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    uid: string;
    displayName?: string;
    photoURL?: string;
    accountId?: string;
    isVip?: boolean;
    isAuthorVerified?: boolean;
    stageName?: string;
  } | null;
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onOpenGiftShop?: (author?: any) => void;
  onGoToFullChat?: (recipientUid: string) => void;
}

export function QuickChatModal({
  isOpen,
  onClose,
  targetUser,
  tracks,
  onPlayTrack,
  onOpenGiftShop,
  onGoToFullChat
}: QuickChatModalProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convId = user && targetUser ? getConversationId(user.uid, targetUser.uid) : null;

  useEffect(() => {
    if (!isOpen || !convId || !user) return;

    markConversationAsRead(convId, user.uid);

    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgs);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      (err) => {
        console.warn('Quick chat messages listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, convId, user]);

  if (!isOpen || !targetUser) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendChatMessage({
        sender: user,
        recipient: targetUser,
        text: textToSend
      });
    } catch (err) {
      console.error('Error sending quick chat:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {targetUser.photoURL ? (
                <img 
                  src={targetUser.photoURL} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-700" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserIcon size={20} />
                </div>
              )}
              {targetUser.isVip && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                  <Crown size={10} fill="currentColor" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">
                  {targetUser.stageName || targetUser.displayName || 'Người Dùng'}
                </span>
                {targetUser.isAuthorVerified && (
                  <ShieldCheck size={14} className="text-emerald-400" />
                )}
                {targetUser.isVip && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                    VIP
                  </span>
                )}
                <span className="text-[9px] bg-indigo-500/20 text-sky-300 px-1.5 py-0.2 rounded font-bold border border-indigo-500/30 flex items-center gap-0.5">
                  <MessageSquare size={8} />
                  Haevy Message
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                {targetUser.accountId || `ID: ${targetUser.uid.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGoToFullChat && (
              <button
                type="button"
                onClick={() => onGoToFullChat(targetUser.uid)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Mở toàn màn hình Tin Nhắn"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Mở rộng</span>
              </button>
            )}

            {onOpenGiftShop && targetUser.isAuthorVerified && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGiftShop(targetUser);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                title="Tặng quà cho tác giả"
              >
                <Gift size={13} />
                <span>Tặng quà</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <MessageSquare size={36} className="text-zinc-600 animate-pulse" />
              <p className="text-sm font-bold text-zinc-300">Bắt đầu cuộc trò chuyện</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Gửi lời chào hoặc chia sẻ âm nhạc yêu thích với {targetUser.stageName || targetUser.displayName || 'bạn bè'}!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.uid;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      isMine
                        ? 'bg-amber-400 text-black font-medium rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                    }`}
                  >
                    {m.sharedTrack && (
                      <div 
                        onClick={() => onPlayTrack(m.sharedTrack)}
                        className="mb-2 p-2 rounded-xl bg-black/20 flex items-center gap-2 cursor-pointer hover:opacity-90"
                      >
                        <img 
                          src={m.sharedTrack.coverUrl} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover" 
                        />
                        <div className="min-w-0 text-left">
                          <p className="font-bold truncate text-[11px]">{m.sharedTrack.title}</p>
                          <p className="text-[9px] opacity-75 truncate">{m.sharedTrack.artist}</p>
                        </div>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn nhanh..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
