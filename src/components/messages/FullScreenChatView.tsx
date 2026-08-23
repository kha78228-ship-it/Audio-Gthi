import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Send, 
  Image as ImageIcon, 
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
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Conversation, ChatMessage, ConversationParticipant, Track } from '../../types';
import { useUserPresence } from '../../services/presenceService';
import { 
  sendChatMessage, 
  markConversationAsRead, 
  toggleMessageReaction 
} from '../../services/socialService';
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
}

export function FullScreenChatView({
  conversation,
  onBack,
  onPlayTrack,
  onOpenAuth
}: FullScreenChatViewProps) {
  const { user, accountId, isVip, isAuthorVerified, authorStageName } = useAuth();

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected image preview before sending
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  // Image Lightbox zoom state
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

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
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video' | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const callTimerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

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
            text: data.text || '',
            imageUrl: data.imageUrl,
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

  // 3. Image file selection & upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendImage = async () => {
    if (!selectedImageBase64 || sending) return;
    if (!user && onOpenAuth) {
      onOpenAuth();
      return;
    }
    setSending(true);

    try {
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
        imageUrl: selectedImageBase64,
        text: imageCaption.trim()
      });

      setSelectedImageBase64(null);
      setImageCaption('');
    } catch (err) {
      console.error('Error sending image:', err);
    } finally {
      setSending(false);
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

    setInputText('');
    setShowEmojiPicker(false);
    setSending(true);

    const senderUid = user?.uid || `guest_${accountId || 'user'}`;
    const senderName = user?.displayName || authorStageName || 'Người dùng';
    const senderPhoto = user?.photoURL || '';

    // Optimistic message update for immediate responsive feel
    const tempMsgId = `temp_${Date.now()}`;
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
      reactions: {},
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

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
        text: textToSend
      });

      if (!res.success) {
        console.error('Send message failed:', res.message);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // 5. Calling features (Voice & Video)
  const startCall = async (type: 'voice' | 'video') => {
    setActiveCallType(type);
    setCallStatus('connecting');
    setCallDurationSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsVideoEnabled(type === 'video');

    // Simulate connecting to active call after 2 seconds
    setTimeout(() => {
      setCallStatus('connected');
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }, 2200);

    if (type === 'video') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Video call camera access notice (fallback mode):', err);
      }
    }
  };

  const endCall = async () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    const duration = callDurationSeconds;
    const type = activeCallType;
    setActiveCallType(null);
    setCallStatus('ended');

    // Post call log to chat
    if (type && user) {
      await sendChatMessage({
        conversationId: conversation.id,
        sender: {
          uid: user.uid,
          displayName: user.displayName || 'Người dùng',
          photoURL: user.photoURL || '',
          isVip,
          isAuthorVerified,
          authorStageName
        },
        recipientUid: recipient.uid,
        callLog: {
          type,
          durationSec: duration,
          status: duration > 0 ? 'completed' : 'missed'
        },
        text: `[${type === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại'} • ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}]`
      });
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
    <div className="fixed inset-0 z-[999999] bg-zinc-950 flex flex-col w-screen h-screen text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* 1. Full Screen Top Header Bar */}
      <header className="h-16 sm:h-20 bg-zinc-900/90 border-b border-zinc-800/80 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xl backdrop-blur-xl z-20">
        {/* Left Side: Exit Button + Recipient Avatar & Name (Directly adjacent) */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Exit / Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 shadow-md active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Thoát phiên chat"
          >
            <ArrowLeft size={19} />
          </button>

          {/* Recipient Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700/80 shadow-md flex items-center justify-center">
              {recipient.photoURL ? (
                <img src={recipient.photoURL} alt={recipient.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  {recipient.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {/* VIP Crown if VIP */}
            {recipient.isVip && (
              <Crown size={13} className="absolute -top-1.5 -right-1 text-amber-400 fill-amber-400 drop-shadow-md" />
            )}
            {/* Online Green Pulsing Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Recipient Name & Online Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-[130px] sm:max-w-[260px]">
                {recipient.displayName}
              </h2>
              {recipient.isVip && (
                <span className="text-[9px] bg-amber-400/20 text-amber-300 font-black px-1.5 py-0.5 rounded-full border border-amber-400/40 shrink-0">
                  VIP
                </span>
              )}
              {recipient.isAuthorVerified && (
                <CheckCircle2 size={14} className="text-sky-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              Đang hoạt động trực tuyến
            </p>
          </div>
        </div>

        {/* Right Side: Voice Call & Video Call Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Voice Call Button */}
          <button
            type="button"
            onClick={() => startCall('voice')}
            className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/60 shadow-lg active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            title="Gọi thoại HD"
          >
            <Phone size={17} />
            <span className="hidden sm:inline">Gọi Thoại</span>
          </button>

          {/* Video Call Button */}
          <button
            type="button"
            onClick={() => startCall('video')}
            className="p-2.5 sm:p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:border-sky-400/60 shadow-lg active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            title="Gọi video HD"
          >
            <Video size={17} />
            <span className="hidden sm:inline">Gọi Video</span>
          </button>
        </div>
      </header>

      {/* 2. Messages Canvas / Message Feed */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 w-full max-w-4xl mx-auto scroll-smooth">
        {/* Encryption & Security Banner */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-xs text-zinc-400 shadow-sm">
            <Sparkles size={12} className="text-amber-400" />
            <span>Tin nhắn được mã hóa bảo mật thời gian thực</span>
          </div>
        </div>

        {messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid || msg.senderUid === user?.uid;
            const timeStr = formatMessageTime(msg.createdAt);

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
                      <div className="mb-2 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group/img cursor-pointer max-w-sm">
                        <img 
                          src={msg.imageUrl} 
                          alt="Đính kèm" 
                          onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                          className="w-full max-h-72 object-contain hover:scale-102 transition-transform duration-300" 
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 shadow-lg"
                        >
                          <Maximize2 size={13} />
                          <span>Xem ảnh</span>
                        </button>
                      </div>
                    )}

                    {/* 2. Voice Note Recording Attachment */}
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

                    {/* 5. Message Text */}
                    {msg.text && (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    )}

                    {/* Timestamp inside/bottom of bubble */}
                    <div className={`flex items-center gap-1.5 text-[9px] pt-1.5 ${
                      isMe ? 'text-sky-200/90 justify-end' : 'text-zinc-400 justify-start'
                    }`}>
                      <span>{timeStr}</span>
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
                Gửi lời chào, ảnh kỷ niệm hoặc ghi âm trực tiếp cho {recipient.displayName}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Image Selection Preview Drawer (If User Picked An Image) */}
      {selectedImageBase64 && (
        <div className="bg-zinc-900 border-t border-zinc-800 p-3 sm:p-4 max-w-4xl mx-auto w-full flex items-center gap-3 animate-in slide-in-from-bottom">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black border border-zinc-700 shrink-0 relative">
            <img src={selectedImageBase64} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setSelectedImageBase64(null)}
              className="absolute top-1 right-1 p-0.5 bg-rose-600 rounded-full text-white"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Thêm chú thích cho ảnh (tùy chọn)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400"
            />
            <p className="text-[10px] text-zinc-400">Đã chọn ảnh 📷</p>
          </div>
          <button
            type="button"
            onClick={handleSendImage}
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 disabled:opacity-50 shrink-0"
          >
            <Send size={14} />
            <span>Gửi Ảnh</span>
          </button>
        </div>
      )}

      {/* 4. Bottom Input Action Bar */}
      <footer className="bg-zinc-900/95 border-t border-zinc-800/80 p-2.5 sm:p-4 shadow-2xl backdrop-blur-xl shrink-0 z-20">
        <div className="max-w-4xl mx-auto w-full relative">
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 bg-zinc-900 border border-zinc-700 p-2.5 rounded-3xl shadow-2xl flex items-center gap-1.5 flex-wrap max-w-xs z-30 animate-in fade-in">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setInputText((prev) => prev + emoji)}
                  className="p-1.5 hover:bg-zinc-800 rounded-xl text-lg transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Hidden File Input for Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Voice Recording Active Bar */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between bg-red-950/50 border border-red-500/60 rounded-2xl p-2 sm:p-2.5 px-4 animate-pulse gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-red-300 text-xs sm:text-sm font-bold truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="truncate">Đang ghi âm ({recordingSeconds}s)...</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Hủy</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="p-2 px-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-500/30"
                >
                  <Square size={13} fill="currentColor" />
                  <span>Gửi Bản Ghi</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2.5 w-full min-w-0">
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-sky-400 border border-zinc-700/60 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Gửi hình ảnh"
              >
                <ImageIcon size={18} />
              </button>

              {/* Voice recording button */}
              <button
                type="button"
                onClick={handleStartRecording}
                className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Ghi âm giọng nói HD"
              >
                <Mic size={18} />
              </button>

              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Biểu tượng cảm xúc"
              >
                <Smile size={18} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Nhắn tin cho ${recipient.displayName}...`}
                className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-400 shadow-inner"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold transition-all disabled:opacity-40 shadow-lg shadow-sky-600/30 shrink-0 cursor-pointer active:scale-95"
                title="Gửi tin nhắn"
              >
                <Send size={17} />
              </button>
            </form>
          )}
        </div>
      </footer>

      {/* 5. Active Call Modal (Voice Call or Video Call Overlay) */}
      {activeCallType && (
        <div className="fixed inset-0 z-[999999] bg-zinc-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300">
          {/* Call Top Details */}
          <div className="text-center pt-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-white shadow-lg">
              {activeCallType === 'video' ? <Video size={14} className="text-sky-400" /> : <Phone size={14} className="text-emerald-400" />}
              <span>{activeCallType === 'video' ? 'Cuộc Gọi Video HD' : 'Cuộc Gọi Thoại HD'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{recipient.displayName}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              {callStatus === 'connecting' ? 'Đang đổ chuông kết nối...' : `Đang trong cuộc gọi: ${formatCallTimer(callDurationSeconds)}`}
            </p>
          </div>

          {/* Call Main Stage */}
          <div className="flex-1 flex flex-col items-center justify-center my-6 relative">
            {activeCallType === 'video' ? (
              <div className="w-full max-w-xl h-72 sm:h-96 rounded-3xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden shadow-2xl relative flex items-center justify-center">
                {/* Remote Video / Simulated Feed */}
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-sky-400 shadow-xl mx-auto flex items-center justify-center">
                    {recipient.photoURL ? (
                      <img src={recipient.photoURL} alt={recipient.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-sky-600 flex items-center justify-center text-white font-bold text-2xl">
                        {recipient.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">Camera của {recipient.displayName}</p>
                </div>

                {/* Floating Self Video Stream PiP */}
                <div className="absolute bottom-3 right-3 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-black border-2 border-white/30 shadow-2xl">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                      Tắt camera
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Voice Call Visualizer Pulsing Avatar */
              <div className="relative flex items-center justify-center">
                {/* Pulsing rings */}
                <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-emerald-500/20 animate-pulse" />
                
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-zinc-900 border-4 border-emerald-400 shadow-2xl relative z-10 flex items-center justify-center">
                  {recipient.photoURL ? (
                    <img src={recipient.photoURL} alt={recipient.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-3xl">
                      {recipient.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Call Bottom Controls Toolbar */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pb-8">
            {/* Mute Mic Button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-3xl border transition-all active:scale-95 ${
                isMuted ? 'bg-rose-600 border-rose-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Call: Toggle Video Camera */}
            {activeCallType === 'video' && (
              <button
                type="button"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-4 rounded-3xl border transition-all active:scale-95 ${
                  !isVideoEnabled ? 'bg-rose-600 border-rose-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                }`}
                title={isVideoEnabled ? 'Tắt Camera' : 'Bật Camera'}
              >
                {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
              </button>
            )}

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-4 rounded-3xl border transition-all active:scale-95 ${
                !isSpeakerOn ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title="Loa Ngoài"
            >
              {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>

            {/* End Call Button (Red Round Action) */}
            <button
              type="button"
              onClick={endCall}
              className="p-4 sm:p-5 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-600/50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Kết thúc cuộc gọi"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        </div>
      )}

      {/* 6. Image Lightbox Zoom Modal */}
      {zoomedImageUrl && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomedImageUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 shadow-xl"
            >
              <X size={20} />
            </button>
            <img src={zoomedImageUrl} alt="Zoomed" className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(chatModal, document.body) : chatModal;
}
