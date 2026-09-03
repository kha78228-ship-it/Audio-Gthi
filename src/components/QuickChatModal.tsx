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
  CheckCircle2,
  Bot,
  Lock,
  Unlock,
  Shield,
  Smile,
  Image as ImageIcon,
  Film,
  Maximize2,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserPresence } from '../services/presenceService';
import { Track } from '../types';
import { 
  getConversationId, 
  sendChatMessage, 
  markConversationAsRead 
} from '../services/socialService';
import { 
  isEncryptedMessage, 
  encryptMessage6Layers, 
  decryptMessage6Layers, 
  getSessionPasskey, 
  isSessionUnlocked, 
  getConversationE2EEConfig, 
  calculatePasskeyFingerprint 
} from '../services/e2eeService';
import { E2EESecurityModal } from './messages/E2EESecurityModal';
import { E2EEUnlockModal } from './messages/E2EEUnlockModal';
import { FullEmotionEmojiPicker } from './messages/FullEmotionEmojiPicker';
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
  const { user, isVip, isAuthorVerified, authorStageName } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputFieldRef = useRef<HTMLInputElement>(null);

  // Media & Emoji states
  interface SelectedMedia {
    type: 'image' | 'video';
    dataUrl: string;
    name: string;
    sizeMb: string;
    durationSec?: number;
  }
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [zoomedVideoUrl, setZoomedVideoUrl] = useState<string | null>(null);

  // E2EE States
  const convId = user && targetUser ? getConversationId(user.uid, targetUser.uid) : null;
  const [isE2EESecurityModalOpen, setIsE2EESecurityModalOpen] = useState(false);
  const [isE2EEUnlockModalOpen, setIsE2EEUnlockModalOpen] = useState(false);
  const [isE2EEUnlocked, setIsE2EEUnlocked] = useState<boolean>(() => convId ? isSessionUnlocked(convId) : false);
  const [e2eeConfig, setE2EEConfig] = useState(() => convId ? getConversationE2EEConfig(convId) : { enabled: false, autoLockMinutes: 15 });
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [currentFingerprint, setCurrentFingerprint] = useState<string>('');

  const { isOnline: isTargetOnline, statusDetails: targetStatusDetails } = useUserPresence(targetUser?.uid);

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

  // E2EE auto-decryption effect
  useEffect(() => {
    if (!convId) return;
    const passkey = getSessionPasskey(convId);
    const unlocked = Boolean(passkey);
    setIsE2EEUnlocked(unlocked);
    const cfg = getConversationE2EEConfig(convId);
    setE2EEConfig(cfg);

    if (passkey) {
      calculatePasskeyFingerprint(passkey, convId).then(setCurrentFingerprint);
    } else if (cfg.fingerprint) {
      setCurrentFingerprint(cfg.fingerprint);
    }

    if (!unlocked || !passkey) {
      setDecryptedCache({});
      return;
    }

    let isMounted = true;
    const decryptAll = async () => {
      const nextCache: Record<string, string> = {};
      for (const msg of messages) {
        const rawContent = msg.encryptedPayload || msg.text;
        if (msg.isEncrypted || isEncryptedMessage(rawContent)) {
          try {
            const res = await decryptMessage6Layers(rawContent, passkey, convId);
            if (res.success && res.text) {
              nextCache[msg.id] = res.text;
            }
          } catch (e) {
            console.warn('Decryption fail:', msg.id, e);
          }
        }
      }
      if (isMounted) {
        setDecryptedCache(nextCache);
      }
    };

    decryptAll();
    return () => { isMounted = false; };
  }, [messages, convId, isE2EEUnlocked]);

  if (!isOpen || !targetUser) return null;

  const triggerAiResponse = async (promptText: string, contextMessages: any[]) => {
    if (!convId) return;
    setIsAiProcessing(true);
    try {
      const payload = {
        prompt: promptText,
        conversationMessages: contextMessages.slice(-20).map((m) => ({
          senderName: m.senderName,
          senderUid: m.senderUid || m.senderId,
          isMe: (m.senderUid || m.senderId) === user?.uid,
          isSenderAI: Boolean(m.isSenderAI || m.senderUid === 'haevy_ai_assistant'),
          text: m.text,
          imageUrl: Boolean(m.imageUrl),
          voiceUrl: Boolean(m.voiceUrl),
          sharedTrack: m.sharedTrack,
          createdAt: m.createdAt
        })),
        userContext: {
          displayName: user?.displayName || authorStageName || 'Người dùng',
          accountId: user?.uid?.slice(0, 8) || 'HV-USER',
          isVip,
          isAuthorVerified
        },
        recipientContext: {
          displayName: targetUser.stageName || targetUser.displayName || 'Bạn Bè',
          accountId: targetUser.accountId,
          isVip: targetUser.isVip
        },
        conversationTitle: `Trò chuyện cùng ${targetUser.displayName}`
      };

      const res = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.reply) {
        await sendChatMessage({
          conversationId: convId,
          sender: {
            uid: 'haevy_ai_assistant',
            displayName: 'Haevy AI Assistant',
            photoURL: '',
            isVip: true,
            isAuthorVerified: false
          },
          recipientUid: targetUser.uid,
          text: data.reply,
          isSenderAI: true,
          aiModelUsed: 'Gemini 2.5 Flash'
        });
      }
    } catch (err) {
      console.error('Trigger AI response error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Vui lòng chọn tệp ảnh hoặc video hợp lệ.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('Kích thước tệp tối đa là 30MB.');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isVideo) {
        const tempVid = document.createElement('video');
        tempVid.preload = 'metadata';
        tempVid.src = dataUrl;
        tempVid.onloadedmetadata = () => {
          setSelectedMedia({
            type: 'video',
            dataUrl,
            name: file.name,
            sizeMb,
            durationSec: Math.round(tempVid.duration) || 0
          });
        };
        tempVid.onerror = () => {
          setSelectedMedia({
            type: 'video',
            dataUrl,
            name: file.name,
            sizeMb
          });
        };
      } else {
        setSelectedMedia({
          type: 'image',
          dataUrl,
          name: file.name,
          sizeMb
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !user || sending || !convId) return;
    setSending(true);

    try {
      if (selectedMedia.type === 'image') {
        await sendChatMessage({
          conversationId: convId,
          sender: user,
          recipient: targetUser,
          imageUrl: selectedMedia.dataUrl,
          text: inputText.trim()
        });
      } else {
        await sendChatMessage({
          conversationId: convId,
          sender: user,
          recipient: targetUser,
          videoUrl: selectedMedia.dataUrl,
          videoDurationSec: selectedMedia.durationSec,
          text: inputText.trim()
        });
      }

      setSelectedMedia(null);
      setInputText('');
    } catch (err) {
      console.error('Error sending media:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedia) {
      handleSendMedia();
      return;
    }
    if (!inputText.trim() || !user || sending || !convId) return;

    const textToSend = inputText.trim();
    const isAiSummon = /@(ai|haevyai|bot|gemini)\b/i.test(textToSend) || textToSend.startsWith('@');

    const passkey = getSessionPasskey(convId);
    let encryptedPayload: string | undefined = undefined;
    let encryptionFingerprint: string | undefined = undefined;

    if (e2eeConfig.enabled) {
      if (!passkey) {
        setIsE2EEUnlockModalOpen(true);
        return;
      }
      try {
        const encRes = await encryptMessage6Layers(textToSend, passkey, convId);
        encryptedPayload = encRes.armoredPayload;
        encryptionFingerprint = encRes.fingerprint;
      } catch (err) {
        console.error('Encryption failed:', err);
      }
    }

    setInputText('');
    setSending(true);

    const tempMsg = {
      id: `temp_${Date.now()}`,
      senderId: user.uid,
      senderUid: user.uid,
      senderName: user.displayName || 'Tôi',
      text: textToSend,
      isEncrypted: Boolean(encryptedPayload),
      encryptedPayload: encryptedPayload,
      encryptionFingerprint: encryptionFingerprint,
      createdAt: new Date()
    };

    if (encryptedPayload) {
      setDecryptedCache(prev => ({ ...prev, [tempMsg.id]: textToSend }));
    }

    const updated = [...messages, tempMsg];
    setMessages(updated);

    try {
      await sendChatMessage({
        conversationId: convId,
        sender: user,
        recipient: targetUser,
        text: encryptedPayload || textToSend,
        isEncrypted: Boolean(encryptedPayload),
        encryptedPayload: encryptedPayload,
        encryptionFingerprint: encryptionFingerprint,
        encryptionVersion: 'e2ee_6l_v1'
      });

      if (isAiSummon) {
        triggerAiResponse(textToSend, updated);
      }
    } catch (err) {
      console.error('Error sending quick chat:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85dvh] sm:h-[520px] max-h-[92dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              {targetUser.photoURL ? (
                <img 
                  src={targetUser.photoURL} 
                  alt="" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-zinc-700" 
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserIcon size={20} />
                </div>
              )}
              {targetUser.isVip && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                  <Crown size={10} fill="currentColor" />
                </div>
              )}
              {isTargetOnline ? (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center" title="Đang trực tuyến">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zinc-600 border-2 border-zinc-950" title={targetStatusDetails.statusText} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                  {targetUser.stageName || targetUser.displayName || 'Người Dùng'}
                </span>
                {targetUser.isAuthorVerified && (
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                )}
                {targetUser.isVip && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30 shrink-0">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono truncate">
                {targetUser.accountId || `ID: ${targetUser.uid.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* E2EE 6-Layer Security Button */}
            {convId && (
              <button
                type="button"
                onClick={() => {
                  if (!isE2EEUnlocked && e2eeConfig.enabled) {
                    setIsE2EEUnlockModalOpen(true);
                  } else {
                    setIsE2EESecurityModalOpen(true);
                  }
                }}
                className={`p-1.5 px-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  isE2EEUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : e2eeConfig.enabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
                title="Mã hóa đầu cuối 6 lớp"
              >
                {isE2EEUnlocked ? (
                  <>
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">6 Lớp: Mở</span>
                  </>
                ) : e2eeConfig.enabled ? (
                  <>
                    <Lock size={13} className="text-amber-400" />
                    <span className="hidden sm:inline">6 Lớp: Khóa</span>
                  </>
                ) : (
                  <>
                    <Shield size={13} className="text-zinc-400" />
                    <span className="hidden sm:inline">6 Lớp</span>
                  </>
                )}
              </button>
            )}

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
                Gửi lời chào hoặc bấm <strong>@AI</strong> để nhờ AI phân tích & phản hồi!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isAI = Boolean(m.isSenderAI || m.senderUid === 'haevy_ai_assistant');
              const isMine = !isAI && (m.senderId === user?.uid || m.senderUid === user?.uid);
              const rawContent = m.encryptedPayload || m.text || '';
              const isMsgEncrypted = Boolean(m.isEncrypted || isEncryptedMessage(rawContent));
              const decryptedText = decryptedCache[m.id];

              if (isAI) {
                return (
                  <div key={m.id} className="flex flex-col items-start max-w-[90%]">
                    <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold mb-1">
                      <Sparkles size={11} />
                      <span>Haevy AI Assistant</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-none p-3 text-xs bg-zinc-900 border border-indigo-500/40 text-zinc-200 shadow-lg">
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      isMine
                        ? 'bg-amber-400 text-black font-medium rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                    }`}
                  >
                    {/* Media Attachments in Message */}
                    {m.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group/img max-w-xs">
                        <img 
                          src={m.imageUrl} 
                          alt="Đính kèm" 
                          onClick={() => setZoomedImageUrl(m.imageUrl)}
                          className="w-full max-h-48 object-contain hover:scale-102 transition-transform cursor-pointer" 
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImageUrl(m.imageUrl)}
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-white text-[10px] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1"
                        >
                          <Maximize2 size={11} />
                        </button>
                      </div>
                    )}

                    {m.videoUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black border border-white/15 relative group/vid max-w-xs">
                        <video
                          src={m.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-48 object-contain"
                        />
                        <div className="flex items-center justify-between px-2 py-1 bg-zinc-900 text-[10px] text-zinc-300">
                          <span className="flex items-center gap-1 text-sky-400">
                            <Film size={11} />
                            <span>Video</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setZoomedVideoUrl(m.videoUrl)}
                            className="p-0.5 text-zinc-400 hover:text-white"
                          >
                            <Maximize2 size={11} />
                          </button>
                        </div>
                      </div>
                    )}

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

                    {isMsgEncrypted ? (
                      decryptedText ? (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <ShieldCheck size={10} /> 6 Lớp E2EE
                          </span>
                          <p className="whitespace-pre-wrap break-words">{decryptedText}</p>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold opacity-90">
                            <Lock size={11} />
                            <span>Tin nhắn mã hóa 6 lớp</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsE2EEUnlockModalOpen(true)}
                            className="px-2 py-0.5 rounded-lg bg-black/30 text-[10px] font-bold border border-white/20 hover:bg-black/40 cursor-pointer"
                          >
                            Mở khóa
                          </button>
                        </div>
                      )
                    ) : (
                      m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isAiProcessing && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs animate-pulse">
              <Bot size={14} className="animate-spin text-cyan-400" />
              <span>Haevy AI đang đọc tin nhắn & phân tích...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Media Selection Preview Drawer */}
        {selectedMedia && (
          <div className="bg-zinc-950 border-t border-zinc-800 p-2.5 px-3 flex items-center gap-2.5 animate-in slide-in-from-bottom">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0 relative flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <img src={selectedMedia.dataUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-sky-400">
                  <Film size={18} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 rounded-full text-white cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{selectedMedia.name}</p>
              <p className="text-[10px] text-zinc-400">
                {selectedMedia.type === 'video' ? 'Video' : 'Ảnh'} • {selectedMedia.sizeMb} MB
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendMedia}
              disabled={sending}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Send size={12} />
              <span>Gửi</span>
            </button>
          </div>
        )}

        {/* Full Emotion Emoji Picker Dock */}
        {showEmojiPicker && (
          <div className="relative px-3 pt-2 bg-zinc-950 border-t border-zinc-800/80 z-30">
            <div className="flex justify-end pb-1">
              <FullEmotionEmojiPicker
                onSelectEmoji={(emoji) => {
                  setInputText((prev) => prev + emoji);
                  inputFieldRef.current?.focus();
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleMediaFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-zinc-950 border-t border-zinc-800 flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          {/* Combined Image / Video Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-sky-400 border border-zinc-800 flex items-center gap-0.5 shrink-0 cursor-pointer active:scale-95"
            title="Gửi Ảnh hoặc Video (Tối đa 30MB)"
          >
            <ImageIcon size={15} />
            <Film size={10} className="text-sky-400" />
          </button>

          {/* Quick @AI Button */}
          <button
            type="button"
            onClick={() => setInputText((prev) => prev.trim() ? `${prev} @AI ` : '@AI ')}
            className="px-2 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-cyan-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            title="Bấm để gọi @AI"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span className="font-mono text-[11px]">@AI</span>
          </button>

          {/* Text Input with embedded emoji trigger */}
          <div className="flex-1 min-w-[100px] relative flex items-center">
            <input
              ref={inputFieldRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={e2eeConfig.enabled && !isE2EEUnlocked ? "Đang khóa E2EE - Mở khóa để gửi..." : "Nhập tin nhắn hoặc gõ @AI..."}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl pl-3 pr-8 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute right-1.5 p-1 rounded-lg transition-all cursor-pointer ${
                showEmojiPicker 
                  ? 'text-amber-400 bg-amber-400/20' 
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
              title="Biểu tượng cảm xúc đầy đủ"
            >
              <Smile size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedMedia) || sending}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Gửi</span>
          </button>
        </form>

        {/* Zoom Lightbox Modals */}
        {zoomedImageUrl && (
          <div 
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setZoomedImageUrl(null)}
          >
            <div className="relative max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-full bg-zinc-800 text-white"
              >
                <X size={16} />
              </button>
              <img src={zoomedImageUrl} alt="" className="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl shadow-2xl" />
            </div>
          </div>
        )}

        {zoomedVideoUrl && (
          <div 
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setZoomedVideoUrl(null)}
          >
            <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoomedVideoUrl(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-full bg-zinc-800 text-white"
              >
                <X size={16} />
              </button>
              <video src={zoomedVideoUrl} controls autoPlay className="max-h-[75vh] w-full object-contain rounded-2xl shadow-2xl bg-black" />
            </div>
          </div>
        )}

        {/* Modals */}
        {convId && (
          <>
            <E2EESecurityModal
              isOpen={isE2EESecurityModalOpen}
              onClose={() => setIsE2EESecurityModalOpen(false)}
              conversationId={convId}
              recipientName={targetUser.stageName || targetUser.displayName || 'Người Dùng'}
              onPasskeyChanged={() => {
                setIsE2EEUnlocked(isSessionUnlocked(convId));
                setE2EEConfig(getConversationE2EEConfig(convId));
              }}
            />

            <E2EEUnlockModal
              isOpen={isE2EEUnlockModalOpen}
              onClose={() => setIsE2EEUnlockModalOpen(false)}
              conversationId={convId}
              recipientName={targetUser.stageName || targetUser.displayName || 'Người Dùng'}
              onUnlocked={() => setIsE2EEUnlocked(true)}
              onOpenSettings={() => setIsE2EESecurityModalOpen(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}
