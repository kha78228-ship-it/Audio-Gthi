import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Send, 
  Image as ImageIcon, 
  Film,
  Paperclip,
  Mic, 
  Smile, 
  Square, 
  Trash2, 
  X, 
  Crown, 
  CheckCircle2, 
  PhoneOff, 
  MicOff, 
  Volume2, 
  VolumeX, 
  VideoOff, 
  Camera, 
  RefreshCw, 
  Play, 
  Pause, 
  Sparkles,
  Heart,
  Flame,
  ThumbsUp,
  Download,
  Maximize2,
  Bot,
  Copy,
  Check,
  CheckCheck,
  AtSign,
  Wand2,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lock,
  Unlock,
  Key,
  Layers,
  Fingerprint,
  FileVideo,
  Loader2,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { FullEmotionEmojiPicker } from './FullEmotionEmojiPicker';
import { useAuth } from '../../context/AuthContext';
import { Conversation, ChatMessage, ConversationParticipant, Track, ActiveCallSession } from '../../types';
import { useUserPresence } from '../../services/presenceService';
import { 
  sendChatMessage, 
  markConversationAsRead, 
  toggleMessageReaction 
} from '../../services/socialService';
import { 
  initiateDirectCall, 
  listenToActiveCall 
} from '../../services/callService';
import { DirectCallModal } from './DirectCallModal';
import { 
  isEncryptedMessage, 
  encryptMessage6Layers, 
  decryptMessage6Layers, 
  getSessionPasskey, 
  isSessionUnlocked, 
  getConversationE2EEConfig, 
  lockSessionPasskey, 
  calculatePasskeyFingerprint 
} from '../../services/e2eeService';
import { E2EESecurityModal } from './E2EESecurityModal';
import { E2EEUnlockModal } from './E2EEUnlockModal';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface FullScreenChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onPlayTrack?: (track: Track) => void;
  onOpenAuth?: () => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function FullScreenChatView({
  conversation,
  onBack,
  onPlayTrack,
  onOpenAuth,
  onNavigateToMode
}: FullScreenChatViewProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputFieldRef = useRef<HTMLInputElement>(null);

  // Selected media (Photo or Video) preview before sending
  interface SelectedMedia {
    type: 'image' | 'video';
    dataUrl: string;
    name: string;
    sizeMb: string;
    durationSec?: number;
  }
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // AI Assistant states
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Media Lightbox zoom state (Image & Video)
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [zoomedVideoUrl, setZoomedVideoUrl] = useState<string | null>(null);

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiList = ['❤️', '😂', '🔥', '👏', '😍', '🎉', '👍', '✨', '🎧', '💯', '🙏', '🥰', '🌹', '🚀', '💖', '⭐'];

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Playback state for voice messages
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Calling States (Voice & Video)
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallSession | null>(null);

  // Listen to active call updates
  useEffect(() => {
    if (!activeCallSession?.id) return;
    const unsub = listenToActiveCall(activeCallSession.id, (updated) => {
      if (updated) {
        setActiveCallSession(updated);
      } else {
        setActiveCallSession(null);
      }
    });
    return () => unsub();
  }, [activeCallSession?.id]);

  // E2EE 6-Layer Security State
  const [isE2EESecurityModalOpen, setIsE2EESecurityModalOpen] = useState(false);
  const [isE2EEUnlockModalOpen, setIsE2EEUnlockModalOpen] = useState(false);
  const [isE2EEUnlocked, setIsE2EEUnlocked] = useState<boolean>(() => isSessionUnlocked(conversation.id));
  const [e2eeConfig, setE2EEConfig] = useState(() => getConversationE2EEConfig(conversation.id));
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [currentFingerprint, setCurrentFingerprint] = useState<string>('');

  // Determine recipient details
  const getRecipient = (): ConversationParticipant => {
    const currentUid = user?.uid || `guest_${accountId || 'user'}`;
    const otherUid = conversation.participants.find(p => p !== currentUid) || conversation.participants[0] || '';
    if (!conversation.participantDetails) {
      return { 
        uid: otherUid, 
        displayName: 'Bạn Bè', 
        accountId: 'HV-USER', 
        photoURL: '', 
        isVip: false, 
        isAuthorVerified: false 
      };
    }
    const details: any = conversation.participantDetails[otherUid] || {};
    return {
      uid: details.uid || otherUid,
      displayName: details.displayName || details.stageName || 'Bạn Bè',
      accountId: details.accountId || 'HV-USER',
      photoURL: details.photoURL || '',
      isVip: Boolean(details.isVip),
      isAuthorVerified: Boolean(details.isAuthorVerified),
      authorStageName: details.authorStageName || details.stageName || ''
    };
  };

  const recipient = getRecipient();
  const { isOnline: isRecipientOnline, statusDetails: recipientPresenceDetails } = useUserPresence(recipient.uid);

  // 1. Subscribe to conversation messages
  useEffect(() => {
    if (!conversation.id) return;

    if (user?.uid) {
      markConversationAsRead(conversation.id, user.uid);
    }

    const msgQuery = query(
      collection(db, 'conversations', conversation.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(150)
    );

    const unsubscribe = onSnapshot(
      msgQuery,
      (snapshot) => {
        const list: ChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            conversationId: data.conversationId || conversation.id,
            senderUid: data.senderUid || data.senderId || '',
            senderName: data.senderName || 'Người dùng',
            senderPhoto: data.senderPhoto || '',
            isSenderVip: Boolean(data.isSenderVip),
            isSenderAuthor: Boolean(data.isSenderAuthor),
            senderAuthorStageName: data.senderAuthorStageName || '',
            isSenderAI: Boolean(data.isSenderAI || data.senderUid === 'haevy_ai_assistant'),
            aiModelUsed: data.aiModelUsed || (data.isSenderAI ? 'Gemini 2.5 Flash' : undefined),
            text: data.text || '',
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            videoDurationSec: data.videoDurationSec,
            videoThumbnail: data.videoThumbnail,
            voiceUrl: data.voiceUrl,
            voiceDurationSec: data.voiceDurationSec,
            callLog: data.callLog,
            sharedTrack: data.sharedTrack || data.trackAttachment,
            reactions: data.reactions || {},
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date())
          } as ChatMessage;
        });
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
  }, [conversation.id, user?.uid]);

  // E2EE Lock change listener & auto-decryption effect
  useEffect(() => {
    const handleLockEvent = (e: any) => {
      if (!e.detail || e.detail.conversationId === conversation.id) {
        setIsE2EEUnlocked(isSessionUnlocked(conversation.id));
      }
    };
    window.addEventListener('haevy_e2ee_lock_change', handleLockEvent);
    return () => window.removeEventListener('haevy_e2ee_lock_change', handleLockEvent);
  }, [conversation.id]);

  useEffect(() => {
    const passkey = getSessionPasskey(conversation.id);
    const unlocked = Boolean(passkey);
    setIsE2EEUnlocked(unlocked);
    const cfg = getConversationE2EEConfig(conversation.id);
    setE2EEConfig(cfg);

    if (passkey) {
      calculatePasskeyFingerprint(passkey, conversation.id).then(setCurrentFingerprint);
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
            const res = await decryptMessage6Layers(rawContent, passkey, conversation.id);
            if (res.success && res.text) {
              nextCache[msg.id] = res.text;
            }
          } catch (e) {
            console.warn('Decryption fail for msg:', msg.id, e);
          }
        }
      }
      if (isMounted) {
        setDecryptedCache(nextCache);
      }
    };

    decryptAll();
    return () => { isMounted = false; };
  }, [messages, conversation.id, isE2EEUnlocked]);

  // 2. Voice recording setup
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
          const senderUid = user?.uid || `guest_${accountId || 'user'}`;
          const senderName = user?.displayName || authorStageName || 'Người dùng';
          const senderPhoto = user?.photoURL || '';

          await sendChatMessage({
            conversationId: conversation.id,
            sender: {
              uid: senderUid,
              displayName: senderName,
              photoURL: senderPhoto,
              isVip,
              isAuthorVerified,
              authorStageName
            },
            recipientUid: recipient.uid,
            voiceUrl: base64Audio,
            voiceDurationSec: recordingSeconds || 1,
            text: `[Đoạn ghi âm 🎙️ ${recordingSeconds}s]`
          });
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
      alert('Không thể truy cập Microphone. Vui lòng cấp quyền ghi âm.');
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

  // 3. Media (Image & Video) file selection & upload
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.webm');
    const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg') || file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.webp');

    if (!isImage && !isVideo) {
      alert('Vui lòng chọn tệp ảnh hoặc video hợp lệ.');
      return;
    }

    // Check size limit: 80MB
    if (file.size > 80 * 1024 * 1024) {
      alert('Kích thước tệp tối đa là 80MB để đảm bảo tốc độ gửi tin nhắn.');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      if (isVideo) {
        // Try getting video duration
        const tempVid = document.createElement('video');
        tempVid.preload = 'metadata';
        tempVid.src = dataUrl;
        tempVid.onloadedmetadata = () => {
          const dur = Math.round(tempVid.duration) || 0;
          setSelectedMedia({
            type: 'video',
            dataUrl,
            name: file.name,
            sizeMb,
            durationSec: dur
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
    if (!selectedMedia || sending) return;
    if (!user && onOpenAuth) {
      onOpenAuth();
      return;
    }
    setSending(true);
    setUploadProgressText(selectedMedia.type === 'video' ? 'Đang tải và lưu video...' : 'Đang tải và lưu ảnh...');

    try {
      const senderUid = user?.uid || `guest_${accountId || 'user'}`;
      const senderName = user?.displayName || authorStageName || 'Người dùng';
      const senderPhoto = user?.photoURL || '';

      let res: { success: boolean; message?: string };

      if (selectedMedia.type === 'image') {
        res = await sendChatMessage({
          conversationId: conversation.id,
          sender: {
            uid: senderUid,
            displayName: senderName,
            photoURL: senderPhoto,
            isVip,
            isAuthorVerified,
            authorStageName
          },
          recipientUid: recipient.uid,
          imageUrl: selectedMedia.dataUrl,
          text: mediaCaption.trim()
        });
      } else {
        res = await sendChatMessage({
          conversationId: conversation.id,
          sender: {
            uid: senderUid,
            displayName: senderName,
            photoURL: senderPhoto,
            isVip,
            isAuthorVerified,
            authorStageName
          },
          recipientUid: recipient.uid,
          videoUrl: selectedMedia.dataUrl,
          videoDurationSec: selectedMedia.durationSec,
          text: mediaCaption.trim()
        });
      }

      if (res.success) {
        setSelectedMedia(null);
        setMediaCaption('');
      } else {
        alert(res.message || 'Không thể gửi tệp. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Error sending media:', err);
      alert('Đã xảy ra lỗi khi gửi video hoặc hình ảnh. Vui lòng thử lại.');
    } finally {
      setSending(false);
      setUploadProgressText('');
    }
  };

  // TTS Speech Reader for AI & Messages
  const speakText = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, ' ')
        .replace(/[*_#`~>\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices() || [];
      const viVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vn')));
      if (viVoice) {
        utterance.voice = viVoice;
        utterance.lang = viVoice.lang;
      } else {
        utterance.lang = 'vi-VN';
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingMsgId(null);
    }
  };

  // Copy message helper
  const copyMessage = (msgId: string, text: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedMsgId(msgId);
        setTimeout(() => setCopiedMsgId(null), 2000);
      }
    } catch (e) {
      console.warn('Clipboard copy notice:', e);
    }
  };

  // Mention selection helper
  const selectMention = (mentionTag: string) => {
    if (inputText.endsWith('@')) {
      setInputText(inputText.slice(0, -1) + mentionTag + ' ');
    } else if (inputText.trim() === '') {
      setInputText(mentionTag + ' ');
    } else {
      setInputText(inputText + ' ' + mentionTag + ' ');
    }
    setShowMentionMenu(false);
  };

  // Trigger Gemini Context-Aware AI Chat Assistant
  const triggerAiResponse = async (promptText: string, contextMessages: ChatMessage[]) => {
    setIsAiProcessing(true);
    try {
      const payload = {
        prompt: promptText,
        conversationMessages: contextMessages.slice(-25).map((m) => ({
          senderName: m.senderName,
          senderUid: m.senderUid,
          isMe: m.senderUid === (user?.uid || `guest_${accountId || 'user'}`),
          isSenderAI: Boolean(m.isSenderAI || m.senderUid === 'haevy_ai_assistant'),
          text: m.text,
          imageUrl: Boolean(m.imageUrl),
          voiceUrl: Boolean(m.voiceUrl),
          sharedTrack: m.sharedTrack,
          callLog: m.callLog,
          createdAt: m.createdAt
        })),
        userContext: {
          displayName: user?.displayName || authorStageName || 'Người dùng',
          accountId: accountId || 'HV-USER',
          isVip,
          isAuthorVerified
        },
        recipientContext: {
          displayName: recipient.displayName,
          accountId: recipient.accountId,
          isVip: recipient.isVip
        },
        conversationTitle: `Trò chuyện cùng ${recipient.displayName}`
      };

      const res = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.reply) {
        await sendChatMessage({
          conversationId: conversation.id,
          sender: {
            uid: 'haevy_ai_assistant',
            displayName: 'Haevy AI Assistant',
            photoURL: '',
            isVip: true,
            isAuthorVerified: false
          },
          recipientUid: recipient.uid,
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

  // 4. Send standard text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sending) return;

    if (!user && onOpenAuth) {
      onOpenAuth();
      return;
    }

    const isAiSummon = /@(ai|haevyai|bot|gemini)\b/i.test(textToSend) || textToSend.startsWith('@');

    setInputText('');
    setShowEmojiPicker(false);
    setShowMentionMenu(false);
    setSending(true);

    const senderUid = user?.uid || `guest_${accountId || 'user'}`;
    const senderName = user?.displayName || authorStageName || 'Người dùng';
    const senderPhoto = user?.photoURL || '';

    // Optimistic message update for immediate responsive feel
    const tempMsgId = `temp_${Date.now()}`;
    const passkey = getSessionPasskey(conversation.id);
    const isE2EEActive = Boolean(e2eeConfig.enabled && passkey);

    let encryptedPayload: string | undefined = undefined;
    let encryptionFingerprint: string | undefined = undefined;

    if (e2eeConfig.enabled) {
      if (!passkey) {
        setIsE2EEUnlockModalOpen(true);
        setSending(false);
        return;
      }
      try {
        const encRes = await encryptMessage6Layers(textToSend, passkey, conversation.id);
        encryptedPayload = encRes.armoredPayload;
        encryptionFingerprint = encRes.fingerprint;
      } catch (err) {
        console.error('Encryption failed:', err);
      }
    }

    const optimisticMsg: ChatMessage = {
      id: tempMsgId,
      conversationId: conversation.id,
      senderUid,
      senderName,
      senderPhoto,
      isSenderVip: isVip,
      isSenderAuthor: isAuthorVerified,
      senderAuthorStageName: authorStageName,
      text: textToSend,
      isEncrypted: Boolean(encryptedPayload),
      encryptedPayload: encryptedPayload,
      encryptionFingerprint: encryptionFingerprint,
      reactions: {},
      createdAt: new Date()
    };
    
    // Store in local decrypted cache for instant display
    if (encryptedPayload) {
      setDecryptedCache(prev => ({ ...prev, [tempMsgId]: textToSend }));
    }

    const updatedMessages = [...messages, optimisticMsg];
    setMessages(updatedMessages);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await sendChatMessage({
        conversationId: conversation.id,
        sender: {
          uid: senderUid,
          displayName: senderName,
          photoURL: senderPhoto,
          isVip,
          isAuthorVerified,
          authorStageName
        },
        recipientUid: recipient.uid,
        recipient: {
          uid: recipient.uid,
          displayName: recipient.displayName,
          photoURL: recipient.photoURL
        },
        text: encryptedPayload || textToSend,
        isEncrypted: Boolean(encryptedPayload),
        encryptedPayload: encryptedPayload,
        encryptionFingerprint: encryptionFingerprint,
        encryptionVersion: 'e2ee_6l_v1'
      });

      if (!res.success) {
        console.error('Send message failed:', res.message);
      }

      if (isAiSummon) {
        triggerAiResponse(textToSend, updatedMessages);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // 5. Calling features (Voice & Video)
  const startCall = async (type: 'voice' | 'video') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    try {
      const callId = await initiateDirectCall({
        caller: {
          uid: user.uid,
          displayName: user.displayName || authorStageName || 'Người dùng',
          photoURL: user.photoURL || '',
          isVip,
          isAuthorVerified,
          authorStageName
        },
        recipient: {
          uid: recipient.uid,
          displayName: recipient.displayName,
          photoURL: recipient.photoURL || '',
          isVip: recipient.isVip,
          isAuthorVerified: recipient.isAuthorVerified,
          authorStageName: recipient.authorStageName
        },
        type,
        conversationId: conversation.id
      });

      setActiveCallSession({
        id: callId,
        caller: {
          uid: user.uid,
          displayName: user.displayName || authorStageName || 'Người dùng',
          photoURL: user.photoURL || '',
          isVip,
          isAuthorVerified,
          authorStageName
        },
        recipient: {
          uid: recipient.uid,
          displayName: recipient.displayName,
          photoURL: recipient.photoURL || '',
          isVip,
          isAuthorVerified,
          authorStageName
        },
        type,
        status: 'ringing',
        conversationId: conversation.id,
        startedAt: new Date(),
        durationSec: 0
      });
    } catch (err) {
      console.error('Error starting direct call:', err);
    }
  };

  // 6. Voice note audio player helper
  const handlePlayVoice = (msgId: string, url: string) => {
    if (playingVoiceId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(url);
    } else {
      audioPlayerRef.current.src = url;
    }

    audioPlayerRef.current.playbackRate = playbackSpeed;
    audioPlayerRef.current.play().then(() => {
      setPlayingVoiceId(msgId);
    }).catch(console.warn);

    audioPlayerRef.current.onended = () => {
      setPlayingVoiceId(null);
    };
  };

  // Format timestamp helper
  const formatMessageTime = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatCallTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const chatModal = (
    <div className="fixed inset-0 z-[999999] bg-zinc-950 flex flex-col w-full h-[100dvh] max-h-[100dvh] text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. Full Screen Top Header Bar */}
      <header 
        style={{ paddingTop: 'max(0.375rem, env(safe-area-inset-top))' }}
        className="min-h-[3.75rem] sm:min-h-[4.5rem] pb-2 sm:pb-3 bg-zinc-900/95 border-b border-zinc-800/80 px-2.5 sm:px-6 flex items-center justify-between shrink-0 shadow-2xl backdrop-blur-xl z-20"
      >
        {/* Left Side: Exit Button + Recipient Avatar & Name */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-2">
          {/* Exit / Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 shadow-md active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Thoát phiên chat"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Recipient Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700/80 shadow-md flex items-center justify-center">
              {recipient.photoURL ? (
                <img src={recipient.photoURL} alt={recipient.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm">
                  {recipient.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {/* VIP Crown if VIP */}
            {recipient.isVip && (
              <Crown size={12} className="absolute -top-1.5 -right-1 text-amber-400 fill-amber-400 drop-shadow-md" />
            )}
            {/* Online Green Indicator or Offline Dot */}
            {isRecipientOnline ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex items-center justify-center" title="Đang trực tuyến">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-600 border-2 border-zinc-950 shadow-sm flex items-center justify-center" title="Ngoại tuyến">
                <span className="w-1 h-1 rounded-full bg-zinc-400" />
              </span>
            )}
          </div>

          {/* Recipient Name & Online Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h2 className="text-xs sm:text-base font-black text-white truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[260px]">
                {recipient.displayName}
              </h2>
              {recipient.isVip && (
                <span className="text-[8px] sm:text-[9px] bg-amber-400/20 text-amber-300 font-black px-1.5 py-0.5 rounded-full border border-amber-400/40 shrink-0">
                  VIP
                </span>
              )}
              {recipient.isAuthorVerified && (
                <CheckCircle2 size={13} className="text-sky-400 shrink-0" />
              )}
            </div>
            {isRecipientOnline ? (
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] border border-emerald-400 shrink-0" />
                <span className="truncate">Đang trực tuyến</span>
              </p>
            ) : (
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                <span className="truncate">{recipientPresenceDetails.statusText}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Voice Call & Video Call & E2EE Actions */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* E2EE 6-Layer Security Button */}
          <button
            type="button"
            onClick={() => {
              if (!isE2EEUnlocked && e2eeConfig.enabled) {
                setIsE2EEUnlockModalOpen(true);
              } else {
                setIsE2EESecurityModalOpen(true);
              }
            }}
            className={`p-2 sm:px-3 sm:py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer active:scale-95 ${
              isE2EEUnlocked
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                : e2eeConfig.enabled
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
            title={isE2EEUnlocked ? 'Mã Hóa 6 Lớp: Đang Mở Khóa' : e2eeConfig.enabled ? 'Mã Hóa 6 Lớp: Đang Khóa' : 'Thiết Lập Mã Hóa 6 Lớp'}
          >
            {isE2EEUnlocked ? (
              <>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="hidden md:inline font-bold">6 Lớp: Mở</span>
              </>
            ) : e2eeConfig.enabled ? (
              <>
                <Lock size={16} className="text-amber-400" />
                <span className="hidden md:inline font-bold">6 Lớp: Khóa</span>
              </>
            ) : (
              <>
                <Shield size={16} className="text-zinc-400" />
                <span className="hidden md:inline">Mã Hóa 6 Lớp</span>
              </>
            )}
          </button>

          {/* Voice Call Button */}
          <button
            type="button"
            onClick={() => startCall('voice')}
            className="p-2 sm:p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/60 shadow-lg active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            title="Gọi thoại HD"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">Gọi Thoại</span>
          </button>

          {/* Video Call Button */}
          <button
            type="button"
            onClick={() => startCall('video')}
            className="p-2 sm:p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:border-sky-400/60 shadow-lg active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            title="Gọi video HD"
          >
            <Video size={16} />
            <span className="hidden sm:inline">Gọi Video</span>
          </button>
        </div>
      </header>

      {/* 2. Messages Canvas / Message Feed */}
      <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 w-full max-w-4xl mx-auto scroll-smooth touch-momentum">
        {/* Encryption & Security Banner */}
        <div className="text-center py-2">
          <button
            type="button"
            onClick={() => setIsE2EESecurityModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] sm:text-xs transition-all shadow-sm cursor-pointer ${
              isE2EEUnlocked
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : e2eeConfig.enabled
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isE2EEUnlocked ? (
              <>
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Mã hóa đầu cuối 6 lớp đang kích hoạt {currentFingerprint ? `(${currentFingerprint})` : ''}</span>
              </>
            ) : e2eeConfig.enabled ? (
              <>
                <Lock size={13} className="text-amber-400" />
                <span>Phiên chat được mã hóa 6 lớp • Chạm để mở khóa</span>
              </>
            ) : (
              <>
                <Sparkles size={12} className="text-amber-400" />
                <span>Mã hóa bảo mật 6 lớp theo thời gian thực • Chạm để cài đặt</span>
              </>
            )}
          </button>
        </div>

        {messages.length > 0 ? (
          messages.map((msg) => {
            const isAI = Boolean(msg.isSenderAI || msg.senderUid === 'haevy_ai_assistant');
            const isMe = !isAI && (msg.senderId === user?.uid || msg.senderUid === user?.uid);
            const timeStr = formatMessageTime(msg.createdAt);

            // Distinct AI Message Rendering
            if (isAI) {
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-2.5 sm:gap-3.5 w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {/* AI Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30 shrink-0 mt-0.5">
                    <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-cyan-300">
                      <Bot size={18} />
                    </div>
                  </div>

                  {/* AI Message Bubble */}
                  <div className="flex flex-col items-start max-w-[90%] sm:max-w-[82%] min-w-[260px]">
                    <div className="flex items-center gap-2 px-1 mb-1">
                      <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-300 flex items-center gap-1">
                        <Sparkles size={12} className="text-cyan-400" />
                        Haevy AI Assistant
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold">
                        {msg.aiModelUsed || 'Gemini AI'}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-3xl rounded-tl-sm bg-gradient-to-b from-zinc-900 to-zinc-950 border border-indigo-500/30 text-zinc-100 shadow-2xl shadow-indigo-950/30 w-full relative group">
                      {/* Markdown AI Content */}
                      <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed text-zinc-200 space-y-2">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {/* AI Bottom Action Toolbar */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-zinc-500">{timeStr}</span>
                          <span className="text-[9px] text-indigo-400 font-medium hidden sm:inline-flex items-center gap-1">
                            <Sparkles size={10} /> Đã phân tích ngữ cảnh chat
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakText(msg.id, msg.text)}
                            className={`p-1.5 px-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              speakingMsgId === msg.id
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:text-white'
                            }`}
                            title="Đọc to bằng giọng nói TTS"
                          >
                            {speakingMsgId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                            <span>{speakingMsgId === msg.id ? 'Dừng đọc' : 'Đọc'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => copyMessage(msg.id, msg.text)}
                            className="p-1.5 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Sao chép câu trả lời"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 sm:gap-3 w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Left: Sender avatar for incoming messages */}
                {!isMe && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/80 shrink-0 mb-1 shadow-md">
                    {msg.senderPhoto ? (
                      <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-bold">
                        {msg.senderName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                  {/* Sender Name on top of incoming message if needed */}
                  {!isMe && (
                    <span className="text-[10px] text-zinc-400 font-medium px-1 mb-0.5">
                      {msg.senderName}
                    </span>
                  )}

                  <div className={`p-3 sm:p-4 rounded-3xl relative group shadow-xl transition-all break-words ${
                    isMe
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-md shadow-sky-600/10'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-md'
                  }`}>
                    {/* 1. Image Attachment */}
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group/img max-w-sm">
                        <img 
                          src={msg.imageUrl} 
                          alt="Đính kèm ảnh" 
                          onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                          className="w-full max-h-72 object-contain hover:scale-102 transition-transform duration-300 cursor-pointer" 
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <a
                            href={msg.imageUrl}
                            download="haevy_photo"
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1 shadow-lg"
                            title="Tải ảnh về"
                          >
                            <Download size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                            className="p-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1 shadow-lg cursor-pointer"
                            title="Xem kích thước đầy đủ"
                          >
                            <Maximize2 size={13} />
                            <span>Xem ảnh</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Video Attachment */}
                    {msg.videoUrl && (
                      <div className="mb-2 rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 relative group/vid max-w-sm shadow-xl">
                        <video
                          src={msg.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-72 rounded-t-2xl object-contain bg-black"
                        />
                        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800 text-[11px] text-zinc-300">
                          <span className="flex items-center gap-1.5 font-medium text-sky-400">
                            <Film size={13} />
                            <span>Video {msg.videoDurationSec ? `(${Math.floor(msg.videoDurationSec / 60)}:${(msg.videoDurationSec % 60).toString().padStart(2, '0')})` : ''}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <a
                              href={msg.videoUrl}
                              download="haevy_video"
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                              title="Tải video về"
                            >
                              <Download size={13} />
                            </a>
                            <button
                              type="button"
                              onClick={() => setZoomedVideoUrl(msg.videoUrl || null)}
                              className="text-zinc-300 hover:text-white flex items-center gap-1 p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                              title="Xem toàn màn hình"
                            >
                              <Maximize2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Voice Note Recording Attachment */}
                    {msg.voiceUrl && (
                      <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-3 my-1 min-w-[200px] sm:min-w-[240px]">
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(msg.id, msg.voiceUrl!)}
                          className="w-9 h-9 rounded-xl bg-white text-black hover:bg-amber-300 transition-all flex items-center justify-center shrink-0 shadow-md active:scale-95"
                        >
                          {playingVoiceId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>

                        <div className="flex-1 space-y-1">
                          {/* Animated Waveform Visualizer */}
                          <div className="flex items-center gap-0.5 h-4">
                            {[12, 20, 8, 24, 16, 28, 14, 22, 10, 18, 26, 12, 20, 15].map((h, i) => (
                              <div
                                key={i}
                                style={{ height: `${h}px` }}
                                className={`w-1 rounded-full ${
                                  playingVoiceId === msg.id 
                                    ? 'bg-amber-300 animate-pulse' 
                                    : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
                            <span>Đoạn ghi âm</span>
                            <span>{msg.voiceDurationSec ? `${msg.voiceDurationSec}s` : 'HD Voice'}</span>
                          </div>
                        </div>

                        {/* Speed Toggle (1x, 1.5x, 2x) */}
                        <button
                          type="button"
                          onClick={() => {
                            const speeds = [1, 1.5, 2];
                            const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                            setPlaybackSpeed(next);
                            if (audioPlayerRef.current) audioPlayerRef.current.playbackRate = next;
                          }}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                        >
                          {playbackSpeed}x
                        </button>
                      </div>
                    )}

                    {/* 3. Call Log Message (Voice / Video Call Completed) */}
                    {msg.callLog && (
                      <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 my-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          msg.callLog.type === 'video' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {msg.callLog.type === 'video' ? <Video size={16} /> : <Phone size={16} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {msg.callLog.type === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại'}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Thời lượng: {Math.floor(msg.callLog.durationSec / 60)} phút {(msg.callLog.durationSec % 60).toString().padStart(2, '0')} giây
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 4. Shared Track Attachment */}
                    {msg.sharedTrack && (
                      <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-black/40 border border-white/10 mb-1.5 max-w-xs">
                        <img 
                          src={msg.sharedTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} 
                          alt="" 
                          className="w-10 h-10 rounded-xl object-cover" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{msg.sharedTrack.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{msg.sharedTrack.artist}</p>
                        </div>
                        {onPlayTrack && (
                          <button
                            type="button"
                            onClick={() => onPlayTrack(msg.sharedTrack as any)}
                            className="p-1.5 rounded-xl bg-amber-400 text-black hover:scale-105 transition-transform"
                          >
                            <Play size={13} fill="currentColor" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* 4.5. Spiritual Attachment (Tarot, TuVi, Astrology, Cosmic Affirmation) */}
                    {msg.spiritualAttachment && (
                      <div className="mb-2 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-zinc-950/90 to-black border border-purple-500/40 max-w-sm shadow-xl space-y-2.5 text-zinc-200">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                          <div className="flex items-center gap-2">
                            {msg.spiritualAttachment.type === 'tarot' && <Sparkles className="w-4 h-4 text-purple-400" />}
                            {msg.spiritualAttachment.type === 'tuvi' && <Compass className="w-4 h-4 text-amber-400" />}
                            {String(msg.spiritualAttachment.type).startsWith('astrology') && <Sun className="w-4 h-4 text-sky-400" />}
                            {msg.spiritualAttachment.type === 'couple_synastry' && <Heart className="w-4 h-4 text-pink-400" />}
                            {msg.spiritualAttachment.type === 'cosmic_affirmation' && <Moon className="w-4 h-4 text-amber-300" />}
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                              Haevy Spiritual Sync
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-400/30 font-bold">
                            {msg.spiritualAttachment.type === 'tarot' && 'Tarot 3D'}
                            {msg.spiritualAttachment.type === 'tuvi' && 'Lá Số Tử Vi'}
                            {String(msg.spiritualAttachment.type).startsWith('astrology') && 'Chiêm Tinh'}
                            {msg.spiritualAttachment.type === 'couple_synastry' && 'Tình Duyên Cặp Đôi'}
                            {msg.spiritualAttachment.type === 'cosmic_affirmation' && 'Thông Điệp Vũ Trụ'}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {msg.spiritualAttachment.title}
                          </h4>
                          {msg.spiritualAttachment.subtitle && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {msg.spiritualAttachment.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Tarot Cards Preview Grid */}
                        {msg.spiritualAttachment.tarotCards && msg.spiritualAttachment.tarotCards.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                            {msg.spiritualAttachment.tarotCards.slice(0, 3).map((c, idx) => (
                              <div key={idx} className="flex-shrink-0 w-20 rounded-xl bg-purple-900/30 border border-purple-500/30 p-1.5 text-center">
                                {c.imageUrl ? (
                                  <img 
                                    src={c.imageUrl} 
                                    alt={c.nameVi} 
                                    className={`w-full h-16 object-cover rounded-lg mb-1 shadow-md ${c.isReversed ? 'rotate-180' : ''}`} 
                                  />
                                ) : (
                                  <div className="w-full h-16 rounded-lg mb-1 bg-purple-950/60 flex items-center justify-center text-2xl shadow-md border border-purple-500/20">
                                    {c.imageSymbol || '🃏'}
                                  </div>
                                )}
                                <span className="text-[9px] font-bold text-white block truncate">{c.nameVi}</span>
                                <span className="text-[8px] text-purple-300 block truncate">{c.positionName || (c.isReversed ? 'Ngược' : 'Xuôi')}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Compatibility Score Meter if present */}
                        {typeof msg.spiritualAttachment.compatibilityScore === 'number' && (
                          <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-between">
                            <span className="text-xs font-bold text-pink-300">Độ Hòa Hợp Vũ Trụ:</span>
                            <span className="text-base font-black text-pink-400">{msg.spiritualAttachment.compatibilityScore}%</span>
                          </div>
                        )}

                        {/* AI Excerpt */}
                        {msg.spiritualAttachment.aiVerdictExcerpt && (
                          <p className="text-[11px] text-zinc-300 bg-black/40 p-2 rounded-xl border border-white/5 line-clamp-3 leading-relaxed italic">
                            "{msg.spiritualAttachment.aiVerdictExcerpt}"
                          </p>
                        )}

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateToMode) {
                                const typeStr = String(msg.spiritualAttachment?.type || '');
                                if (typeStr.startsWith('astrology')) {
                                  onNavigateToMode('spiritual', 'astrology');
                                } else if (typeStr === 'couple_synastry') {
                                  onNavigateToMode('spiritual', 'couple_spiritual');
                                } else if (typeStr === 'tuvi') {
                                  onNavigateToMode('spiritual', 'tuvi');
                                } else {
                                  onNavigateToMode('spiritual', 'tarot');
                                }
                              }
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <Sparkles size={12} className="text-amber-300" />
                            <span>Mở Trong Haevy Tâm Linh</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5. Message Text / E2EE Encrypted State */}
                    {(() => {
                      const rawContent = msg.encryptedPayload || msg.text || '';
                      const isMsgEncrypted = Boolean(msg.isEncrypted || isEncryptedMessage(rawContent));
                      const decryptedText = decryptedCache[msg.id];

                      if (isMsgEncrypted) {
                        if (decryptedText) {
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold opacity-90">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                <span>Mã hóa 6 lớp</span>
                              </div>
                              <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                                {decryptedText}
                              </p>
                            </div>
                          );
                        }

                        // Locked Encrypted Card
                        return (
                          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-amber-500/40 text-zinc-300 space-y-2.5 my-1 min-w-[220px]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                                <Lock size={14} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white block truncate">Tin nhắn mã hóa 6 lớp</span>
                                <span className="text-[9px] text-zinc-400 font-mono">
                                  {msg.encryptionFingerprint ? `Khóa: ${msg.encryptionFingerprint}` : 'AES-256-GCM'}
                                </span>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono text-xs tracking-widest text-zinc-500 select-none">
                              ••••••••••••••••
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsE2EEUnlockModalOpen(true)}
                              className="w-full py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                            >
                              <Unlock size={12} />
                              <span>Mở khóa để xem</span>
                            </button>
                          </div>
                        );
                      }

                      if (msg.text) {
                        return (
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </p>
                        );
                      }

                      return null;
                    })()}

                    {/* Timestamp & read receipt inside/bottom of bubble */}
                    <div className={`flex items-center gap-1.5 text-[9px] pt-1.5 ${
                      isMe ? 'text-sky-200/90 justify-end' : 'text-zinc-400 justify-start'
                    }`}>
                      <span>{timeStr}</span>
                      {isMe && (
                        <span title="Đã gửi & đã nhận" className="inline-flex">
                          <CheckCheck size={13} className="text-sky-200" />
                        </span>
                      )}
                    </div>

                    {/* Hover Reaction Toolbar */}
                    <div className={`absolute -top-3.5 ${isMe ? 'right-2' : 'left-2'} hidden group-hover:flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-full shadow-2xl z-10 animate-in fade-in`}>
                      {['❤️', '🔥', '👍', '😂', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            if (user) toggleMessageReaction(conversation.id, msg.id, emoji, user.uid);
                          }}
                          className="hover:scale-130 transition-transform text-xs p-0.5 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex items-center gap-1 px-1.5 mt-1 flex-wrap">
                      {Object.entries(msg.reactions).map(([emoji, uids]: [string, any]) => {
                        const count = Array.isArray(uids) ? uids.length : 1;
                        if (count <= 0) return null;
                        return (
                          <span
                            key={emoji}
                            className="bg-zinc-900 border border-zinc-700 text-[10px] px-2 py-0.5 rounded-full text-zinc-300 flex items-center gap-1 shadow-sm"
                          >
                            <span>{emoji}</span>
                            <span className="font-bold">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Sender avatar for own messages */}
                {isMe && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden bg-zinc-800 border border-sky-500/40 shrink-0 mb-1 shadow-md">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-xs text-white font-bold">
                        {user?.displayName?.charAt(0) || 'Tôi'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-zinc-500">
            <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bắt đầu cuộc trò chuyện</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Gửi lời chào, ảnh kỷ niệm hoặc bấm <strong>@AI</strong> để gọi Trợ lý AI đọc tin nhắn & phân tích dữ liệu!
              </p>
            </div>
          </div>
        )}

        {/* AI Processing / Thinking Card in real time */}
        {isAiProcessing && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-purple-950/70 border border-indigo-500/40 text-indigo-200 animate-pulse shadow-2xl max-w-md">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 flex items-center justify-center text-white shrink-0">
              <Bot size={18} className="animate-spin" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={13} className="text-cyan-400 animate-spin" />
                Haevy AI đang đọc tin nhắn & phân tích...
              </p>
              <p className="text-[10px] text-indigo-300/80 truncate">
                Đang tổng hợp thông tin cuộc hội thoại để trả lời
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Media Selection Preview Drawer (If User Picked An Image or Video) */}
      {selectedMedia && (
        <div className="bg-zinc-900/95 border-t border-zinc-800 p-3 sm:p-4 max-w-4xl mx-auto w-full flex items-center gap-3 animate-in slide-in-from-bottom backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black border border-zinc-700 shrink-0 relative flex items-center justify-center">
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.dataUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-sky-400 relative">
                <video src={selectedMedia.dataUrl} className="w-full h-full object-cover opacity-60" />
                <Film size={20} className="absolute text-sky-300 drop-shadow" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSelectedMedia(null)}
              className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-500 rounded-full text-white shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Xóa tệp"
            >
              <X size={12} />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <input
              type="text"
              value={mediaCaption}
              onChange={(e) => setMediaCaption(e.target.value)}
              placeholder={`Thêm lời nhắn cho ${selectedMedia.type === 'video' ? 'video' : 'ảnh'}...`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 shadow-inner"
            />
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                {selectedMedia.type === 'video' ? <Film size={11} /> : <ImageIcon size={11} />}
                {selectedMedia.type === 'video' ? 'Video đính kèm' : 'Hình ảnh đính kèm'}
              </span>
              <span>•</span>
              <span>{selectedMedia.sizeMb} MB</span>
              {selectedMedia.durationSec !== undefined && selectedMedia.durationSec > 0 && (
                <>
                  <span>•</span>
                  <span>{Math.floor(selectedMedia.durationSec / 60)}:{Math.floor(selectedMedia.durationSec % 60).toString().padStart(2, '0')}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendMedia}
            disabled={sending}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 hover:brightness-110 disabled:opacity-75 shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            {sending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{uploadProgressText || 'Đang gửi...'}</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Gửi {selectedMedia.type === 'video' ? 'Video' : 'Ảnh'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4. Bottom Input Action Bar */}
      <footer className="bg-zinc-900/95 border-t border-zinc-800/80 px-2 sm:px-4 pt-2 sm:pt-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl shrink-0 z-20">
        <div className="max-w-4xl mx-auto w-full relative">
          {/* Mention Menu Popup (@ Trigger) */}
          {showMentionMenu && (
            <div className="absolute bottom-16 left-0 right-0 max-w-sm sm:max-w-md bg-zinc-900 border border-indigo-500/40 p-2 rounded-2xl shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-zinc-400 border-b border-zinc-800 mb-1">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <AtSign size={13} />
                  Nhắc đến / Gọi Trợ Lý
                </span>
                <button
                  type="button"
                  onClick={() => setShowMentionMenu(false)}
                  className="p-0.5 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              {/* 1. Haevy AI Assistant Option */}
              <button
                type="button"
                onClick={() => selectMention('@AI')}
                className="w-full p-2 rounded-xl hover:bg-indigo-950/60 border border-transparent hover:border-indigo-500/30 flex items-center gap-2.5 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shrink-0">
                  <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-cyan-300">
                    <Bot size={15} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Haevy AI Assistant
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded-md font-mono font-bold">
                      @AI
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Đọc tin nhắn, phân tích & trả lời thông minh
                  </p>
                </div>
                <Sparkles size={14} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              </button>

              {/* 2. Recipient Friend Option */}
              <button
                type="button"
                onClick={() => selectMention(`@${recipient.displayName}`)}
                className="w-full p-2 rounded-xl hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/50 flex items-center gap-2.5 text-left transition-all group cursor-pointer mt-0.5"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                  {recipient.photoURL ? (
                    <img src={recipient.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-300">
                      {recipient.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300">
                      {recipient.displayName}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-md font-mono font-bold">
                      @{recipient.displayName}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Nhắc đến bạn bè trong cuộc hội thoại
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Full Emotion Emoji Picker Dock */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-0 sm:right-10 z-40 animate-in fade-in zoom-in-95 duration-150">
              <FullEmotionEmojiPicker
                onSelectEmoji={(emoji) => {
                  setInputText((prev) => prev + emoji);
                  inputFieldRef.current?.focus();
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          {/* Hidden File Input for Combined Image & Video Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Voice Recording Active Bar */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between bg-red-950/50 border border-red-500/60 rounded-2xl p-2 sm:p-2.5 px-3 sm:px-4 animate-pulse gap-2 sm:gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-red-300 text-xs sm:text-sm font-bold min-w-0 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="truncate">Ghi âm ({recordingSeconds}s)...</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span className="hidden xs:inline">Hủy</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="p-1.5 sm:p-2 px-2.5 sm:px-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-red-500/30 cursor-pointer"
                >
                  <Square size={13} fill="currentColor" />
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0">
              {/* Unified Media Upload Button (Image & Video) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-sky-400 border border-zinc-700/60 transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                title="Gửi Ảnh hoặc Video (Tối đa 30MB)"
              >
                <div className="flex items-center gap-0.5">
                  <ImageIcon size={17} />
                  <Film size={12} className="text-sky-400" />
                </div>
              </button>

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={handleStartRecording}
                className="p-2 sm:p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm"
                title="Ghi âm giọng nói HD"
              >
                <Mic size={17} />
              </button>

              {/* Quick @AI Button */}
              <button
                type="button"
                onClick={() => {
                  if (showMentionMenu) {
                    setShowMentionMenu(false);
                  } else {
                    selectMention('@AI');
                  }
                }}
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 text-cyan-300 border border-cyan-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Bấm @ để gọi AI Assistant"
              >
                <Sparkles size={13} className="text-cyan-400" />
                <span className="font-mono">@AI</span>
              </button>

              {/* Text Input with Integrated Emoji Trigger inside the frame */}
              <div className="flex-1 min-w-[100px] xs:min-w-[130px] relative flex items-center">
                <input
                  ref={inputFieldRef}
                  type="text"
                  autoFocus
                  value={inputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputText(val);
                    if (val.endsWith('@') || val.includes('@')) {
                      setShowMentionMenu(true);
                    } else if (showMentionMenu && !val.includes('@')) {
                      setShowMentionMenu(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhắn tin hoặc gõ @AI..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-400 rounded-2xl pl-3 sm:pl-4 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none shadow-inner"
                />

                {/* Emoji trigger embedded inside the chat input box */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`absolute right-2 p-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                    showEmojiPicker 
                      ? 'text-amber-400 bg-amber-400/20' 
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80'
                  }`}
                  title="Biểu tượng cảm xúc đầy đủ"
                >
                  <Smile size={18} />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2 sm:p-2.5 sm:px-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold transition-all disabled:opacity-30 shadow-lg shadow-sky-600/30 shrink-0 cursor-pointer active:scale-95 flex items-center justify-center"
                title="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </footer>

      {/* 5. Fullscreen Direct Call Modal */}
      {activeCallSession && (
        <DirectCallModal
          callSession={activeCallSession}
          currentUserId={user?.uid || ''}
          onClose={() => setActiveCallSession(null)}
        />
      )}

      {/* 6. Image Lightbox Zoom Modal */}
      {zoomedImageUrl && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-3">
              <span className="text-xs text-zinc-400 font-medium">Xem ảnh chất lượng cao</span>
              <div className="flex items-center gap-2">
                <a
                  href={zoomedImageUrl}
                  download="haevy_photo"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download size={14} />
                  <span>Tải ảnh</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomedImageUrl(null)}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 shadow-md cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <img src={zoomedImageUrl} alt="Zoomed" className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-zinc-800" />
          </div>
        </div>
      )}

      {/* 7. Video Fullscreen Modal */}
      {zoomedVideoUrl && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedVideoUrl(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between pb-3">
              <span className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
                <Film size={14} />
                <span>Xem Video HD</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={zoomedVideoUrl}
                  download="haevy_video"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download size={14} />
                  <span>Tải video</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomedVideoUrl(null)}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 shadow-md cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <video
              src={zoomedVideoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-full object-contain rounded-2xl shadow-2xl bg-black border border-zinc-800"
            />
          </div>
        </div>
      )}

      {/* 8. E2EE 6-Layer Security & Passkey Modals */}
      <E2EESecurityModal
        isOpen={isE2EESecurityModalOpen}
        onClose={() => setIsE2EESecurityModalOpen(false)}
        conversationId={conversation.id}
        recipientName={recipient.displayName}
        onPasskeyChanged={() => {
          setIsE2EEUnlocked(isSessionUnlocked(conversation.id));
          setE2EEConfig(getConversationE2EEConfig(conversation.id));
        }}
      />

      <E2EEUnlockModal
        isOpen={isE2EEUnlockModalOpen}
        onClose={() => setIsE2EEUnlockModalOpen(false)}
        conversationId={conversation.id}
        recipientName={recipient.displayName}
        onUnlocked={() => {
          setIsE2EEUnlocked(true);
        }}
        onOpenSettings={() => setIsE2EESecurityModalOpen(true)}
      />
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(chatModal, document.body) : chatModal;
}
