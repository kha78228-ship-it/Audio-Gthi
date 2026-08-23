import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  MessageSquare, 
  LifeBuoy, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Phone, 
  Video,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Smile,
  Square,
  Trash2,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { SupportMessage, SupportTicketItem } from '../../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface HaevySupportAiViewProps {
  user: any;
  accountId: string;
  isVip: boolean;
  onClose?: () => void;
  isFullScreen?: boolean;
  onNavigateToSecurity?: () => void;
  onNavigateToVip?: () => void;
}

const EMOJIS = ['❤️', '🔥', '👍', '💡', '😂', '🎉', '✨', '🎧', '💯', '🙏', '🛡️', '⚡', '👑', '🚀', '⭐', '🥰'];

const FAQS = [
  {
    q: '1. Hệ thống bảo vệ 6 lớp gồm những phương thức nào?',
    a: 'Bao gồm: Lớp 1 (Mật khẩu cá nhân), Lớp 2 (OTP 6 số qua Gmail), Lớp 3 (Mã PIN 6 số), Lớp 4 (Gmail dự phòng cứu hộ), Lớp 5 (Nhận diện khuôn mặt Face ID bằng AI), và Lớp 6 (Mã khởi động Master Key).'
  },
  {
    q: '2. Nút kích hoạt 1-Click tự động 6 lớp có an toàn không?',
    a: 'Tuyệt đối an toàn. Hệ thống tự động thiết lập mã PIN an toàn, liên kết Gmail, cấp mã khởi động phần cứng và bật sinh trắc học để tài khoản đạt điểm 100/100 tối đa.'
  },
  {
    q: '3. Mã khởi động hệ thống cấp (Lớp 6) dùng khi nào?',
    a: 'Mã khởi động có thẩm quyền cao nhất để khôi phục tài khoản khi mất quyền truy cập Gmail hoặc quên mã PIN. Bạn nên tải bản sao lưu .txt và lưu giữ an toàn.'
  },
  {
    q: '4. Gói VIP âm nhạc mang lại những lợi ích gì?',
    a: 'Mở khóa âm thanh Hi-Fi Lossless (320kbps/FLAC), dải siêu trầm Deep Bass, âm trường 3D, x3 tốc độ tích lũy Điểm Audio và biểu tượng Vương Miện mạ vàng.'
  }
];

export function HaevySupportAiView({
  user,
  accountId,
  isVip,
  onClose,
  isFullScreen = false,
  onNavigateToSecurity,
  onNavigateToVip,
}: HaevySupportAiViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket' | 'faq'>('chat');

  // Handle ESC key to exit full screen
  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào ${user?.displayName || 'bạn'}! Tôi là **Haevy Support AI** — Trợ lý Trí Tuệ Nhân Tạo hỗ trợ khách hàng & an ninh tài khoản 24/7 trong phiên chat **Haevy Message**.

Tôi sẵn sàng hỗ trợ bạn tức thì:
• 🛡️ **Hệ Thống Bảo Vệ 6 Lớp**: Hướng dẫn OTP Gmail, mã PIN 6 số, Gmail cứu hộ, Face ID và Mã Khởi Động Tối Cao.
• 👑 **Đặc Quyền Hội Viên VIP**: Âm thanh Hi-Fi Lossless, Deep Bass Boost, âm trường 3D và x3 điểm thưởng.
• 🎵 **Studio Tác Giả & Âm Nhạc**: Xác minh eKYC nghệ sĩ, phát hành bài hát và Studio lồng tiếng AI TTS.
• 🎮 **Haevy Games & Khiếu Nại**: Hỗ trợ khắc phục sự cố nạp điểm, kết nối tin nhắn và đấu trường trò chơi.

Hãy nhập thắc mắc hoặc gửi tin nhắn thoại/ảnh chụp màn hình bất cứ lúc nào!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🛡️ Bảo vệ tài khoản 6 lớp', action: 'security_guide' },
        { label: '⚡ Kích hoạt tự động 6 lớp (1-Click)', action: 'auto_setup_guide' },
        { label: '🔑 Quên mã PIN / Mật khẩu', action: 'forgot_security' },
        { label: '👑 Quyền lợi gói VIP', action: 'vip_benefits' },
        { label: '📸 Hướng dẫn quét Face ID', action: 'face_id_guide' },
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment states
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Voice recording simulation
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Calling simulation
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video' | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const callTimerRef = useRef<any>(null);

  // Message Reactions
  const [messageReactions, setMessageReactions] = useState<{ [msgId: string]: { [emoji: string]: number } }>({});

  // Ticket creation state
  const [ticketCategory, setTicketCategory] = useState<'security' | 'vip' | 'points' | 'technical' | 'author' | 'games'>('security');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketContent, setTicketContent] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [userTickets, setUserTickets] = useState<SupportTicketItem[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping, selectedImageBase64]);

  const handleSendMessage = async (textToSend?: string, attachedImgUrl?: string) => {
    const text = (textToSend || inputMessage).trim();
    if ((!text && !attachedImgUrl) || isAiTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SupportMessage & { imageUrl?: string } = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text || (attachedImgUrl ? 'Đã gửi một hình ảnh cần hỗ trợ.' : ''),
      timestamp: timeStr,
      imageUrl: attachedImgUrl
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setSelectedImageBase64(null);
    setImageCaption('');
    setShowEmojiPicker(false);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/gemini/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text + (attachedImgUrl ? ' [Người dùng có đính kèm ảnh chụp màn hình sự cố]' : ''),
          conversationHistory: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          userContext: { displayName: user?.displayName, email: user?.email, accountId, isVip }
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || data.fallbackReply || 'Haevy Support AI đã tiếp nhận câu hỏi của bạn. Chúng tôi luôn sẵn sàng hỗ trợ 24/7.';

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: '🛡️ Bảo Vệ 6 Lớp', action: 'security_guide' },
            { label: '⚡ Kích Hoạt 1-Click', action: 'auto_setup_guide' },
            { label: '👑 Quyền Lợi VIP', action: 'vip_benefits' }
          ]
        }
      ]);
    } catch (err) {
      console.error('Support message error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Hệ thống AI đang phản hồi tự động: Bạn có thể sử dụng nút **⚡ Kích Hoạt Tự Động Toàn Bộ 6 Lớp (1-Click)** trong tab Bảo Vệ 6 Lớp để được hệ thống tự động hoàn thiện an ninh 100% ngay lập tức!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionPrompts: Record<string, string> = {
      security_guide: 'Hãy giải thích chi tiết cơ chế hoạt động của từng lớp trong Hệ Thống Bảo Vệ Tài Khoản 6 Lớp của Haevy.',
      auto_setup_guide: 'Nút kích hoạt tự động 1-Click toàn bộ 6 lớp hoạt động như thế nào? Nó có an toàn không?',
      forgot_security: 'Tôi bị quên mã PIN 6 số hoặc mật khẩu thì làm thế nào để dùng Mã Khởi Động Lớp 6 khôi phục tài khoản?',
      vip_benefits: 'Gói thành viên VIP của Haevy mang lại những đặc quyền âm thanh và x3 điểm như thế nào?',
      face_id_guide: 'Hướng dẫn tôi cách bật và quét nhận diện khuôn mặt Face ID Lớp 5 an toàn trên thiết bị.'
    };
    handleSendMessage(actionPrompts[action] || action);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedImageBase64(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
  };

  const handleCancelRecording = () => {
    setIsRecordingVoice(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setRecordingSeconds(0);
  };

  const handleStopAndSendRecording = () => {
    const dur = recordingSeconds || 3;
    handleCancelRecording();

    setMessages(prev => [
      ...prev,
      {
        id: `voice_${Date.now()}`,
        sender: 'user',
        text: `[Đã gửi ghi âm giọng nói • ${dur}s]`,
        voiceUrl: 'simulated_voice_blob',
        voiceDurationSec: dur,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      } as any
    ]);
    setIsAiTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Haevy Support AI đã nghe xong đoạn ghi âm giọng nói (${dur} giây) của bạn. Mọi yêu cầu hỗ trợ về an ninh 6 lớp hoặc khắc phục lỗi tài khoản đã được tiếp nhận và xử lý chuẩn xác!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: '🛡️ Bảo Vệ 6 Lớp', action: 'security_guide' },
            { label: '⚡ Kích Hoạt 1-Click', action: 'auto_setup_guide' },
          ]
        }
      ]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessageReactions(prev => {
      const cur = prev[msgId] || {};
      return {
        ...prev,
        [msgId]: { ...cur, [emoji]: (cur[emoji] || 0) > 0 ? 0 : 1 }
      };
    });
  };

  const startCall = (type: 'voice' | 'video') => {
    setActiveCallType(type);
    setCallStatus('connecting');
    setCallDurationSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(true);

    setTimeout(() => {
      setCallStatus('connected');
      callTimerRef.current = setInterval(() => setCallDurationSeconds(prev => prev + 1), 1000);
    }, 2000);
  };

  const endCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const dur = callDurationSeconds;
    const type = activeCallType;
    setActiveCallType(null);
    setCallStatus('ended');

    if (type) {
      setMessages(prev => [
        ...prev,
        {
          id: `call_${Date.now()}`,
          sender: 'ai',
          text: `[${type === 'video' ? 'Cuộc gọi Video HD AI' : 'Cuộc gọi Thoại HD AI'} • Hoàn tất ${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}]`,
          callLog: { type, durationSec: dur, status: dur > 0 ? 'completed' : 'missed' },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        } as any
      ]);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketContent.trim()) return;

    setIsSubmittingTicket(true);
    setTicketSuccess(null);

    const newTicket: SupportTicketItem = {
      id: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.uid || 'guest',
      userEmail: user?.email || '',
      userAccountId: accountId || 'N/A',
      userName: user?.displayName || 'Người dùng',
      category: ticketCategory,
      title: ticketTitle.trim(),
      status: 'open',
      priority: ticketPriority,
      messages: [{ id: Date.now().toString(), sender: 'user', text: ticketContent.trim(), timestamp: new Date().toLocaleTimeString() }],
      createdAt: new Date().toISOString(),
    };

    try {
      if (user) {
        await addDoc(collection(db, 'supportTickets'), newTicket);
      }
      setUserTickets(prev => [newTicket, ...prev]);
      setTicketSuccess(`Gửi yêu cầu hỗ trợ thành công! Mã phiếu của bạn là: ${newTicket.id}`);
      setTicketTitle('');
      setTicketContent('');
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setUserTickets(prev => [newTicket, ...prev]);
      setTicketSuccess(`Đã ghi nhận phiếu hỗ trợ (Mã: ${newTicket.id}). Đội ngũ kỹ sư sẽ xử lý ngay.`);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className={`w-full ${isFullScreen ? 'fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-2xl flex flex-col p-3 sm:p-5 md:p-6 overflow-hidden' : 'space-y-4'} animate-in fade-in duration-300`}>
      {/* Header Bar */}
      <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 shadow-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/40">
              <Bot size={26} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white">Haevy Support AI</h2>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1">
                <MessageSquare size={10} />
                Haevy Message
              </span>
              {isFullScreen && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                  Toàn Màn Hình
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Chuyên gia an ninh & CSKH đang trực tuyến 24/7</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => startCall('voice')}
            className="px-3 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">Gọi Thoại AI</span>
          </button>
          <button
            type="button"
            onClick={() => startCall('video')}
            className="px-3 py-2 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Video size={14} />
            <span className="hidden sm:inline">Gọi Video AI</span>
          </button>
          {onNavigateToSecurity && (
            <button
              type="button"
              onClick={onNavigateToSecurity}
              className="px-3 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Bảo Vệ 6 Lớp</span>
            </button>
          )}

          {/* Prominent Exit Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-750 hover:from-rose-950/40 hover:to-zinc-800 text-white hover:text-rose-200 font-extrabold text-xs flex items-center gap-2 border border-zinc-700 hover:border-rose-500/50 shadow-xl cursor-pointer transition-all active:scale-95 group ml-1"
              title="Thoát phiên hỗ trợ và quay lại trang cá nhân (Phím ESC)"
            >
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-rose-400 transition-colors" />
              <span>Thoát Phiên Hỗ Trợ</span>
              <span className="hidden md:inline-block text-[10px] bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-mono">ESC</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 max-w-md shrink-0 my-1">
        {[
          { key: 'chat', label: 'Chat Trực Tuyến', icon: MessageSquare },
          { key: 'ticket', label: 'Gửi Ticket', icon: FileText },
          { key: 'faq', label: 'FAQ', icon: HelpCircle }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === t.key
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon size={13} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Chat View */}
      {activeTab === 'chat' && (
        <div className={`rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col ${isFullScreen ? 'flex-1 min-h-0 h-full' : 'h-[580px] sm:h-[620px]'} relative`}>
          <div className="p-2 bg-zinc-900/90 border-b border-zinc-800/80 text-center shrink-0 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
            <Lock size={12} className="text-amber-400" />
            <span>Phiên trò chuyện được bảo vệ bởi Hệ Thống An Ninh 6 Lớp thời gian thực</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const reactions = messageReactions[msg.id] || {};
              const vMsg = msg as any;

              return (
                <div key={msg.id} className={`flex items-end gap-2.5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 border border-indigo-400/40 shrink-0 mb-1 shadow flex items-center justify-center text-white">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[75%]`}>
                    {!isUser && (
                      <span className="text-[10px] text-zinc-400 font-bold px-1 mb-1 flex items-center gap-1">
                        <span>Haevy Support AI</span>
                        <Sparkles size={10} className="text-amber-400" />
                      </span>
                    )}

                    <div className={`p-3.5 rounded-3xl relative group shadow-xl break-words ${
                      isUser
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-md'
                        : 'bg-zinc-900 border border-zinc-800/90 text-zinc-100 rounded-bl-md'
                    }`}>
                      {msg.imageUrl && (
                        <div className="mb-2 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative group/img cursor-pointer max-w-xs">
                          <img 
                            src={msg.imageUrl} 
                            alt="Ảnh đính kèm" 
                            onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                            className="w-full max-h-56 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setZoomedImageUrl(msg.imageUrl || null)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/70 text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1"
                          >
                            <Maximize2 size={12} />
                            <span>Xem</span>
                          </button>
                        </div>
                      )}

                      {vMsg.voiceUrl && (
                        <div className="p-2 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-2.5 my-1 min-w-[200px]">
                          <button
                            type="button"
                            onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                            className="w-8 h-8 rounded-xl bg-white text-black hover:bg-amber-300 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            {playingVoiceId === msg.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-0.5 h-3">
                              {[10, 16, 8, 20, 12, 22, 10, 18, 14].map((h, i) => (
                                <div
                                  key={i}
                                  style={{ height: `${h}px` }}
                                  className={`w-1 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-pulse' : 'bg-white/40'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] text-white/80 font-mono">Ghi âm • {vMsg.voiceDurationSec || 3}s</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPlaybackSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
                            className="text-[9px] font-bold px-1 py-0.5 rounded bg-white/10 text-white"
                          >
                            {playbackSpeed}x
                          </button>
                        </div>
                      )}

                      {vMsg.callLog && (
                        <div className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-950/70 border border-zinc-800 my-1">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${vMsg.callLog.type === 'video' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {vMsg.callLog.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
                          </div>
                          <div className="text-[11px]">
                            <p className="font-bold text-white">{vMsg.callLog.type === 'video' ? 'Cuộc gọi Video HD AI' : 'Cuộc gọi Thoại HD AI'}</p>
                            <p className="text-zinc-400 text-[10px]">{Math.floor(vMsg.callLog.durationSec / 60)}m {(vMsg.callLog.durationSec % 60).toString().padStart(2, '0')}s</p>
                          </div>
                        </div>
                      )}

                      {msg.text && <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>}

                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-zinc-800/80 flex flex-wrap gap-1">
                          {msg.suggestedActions.map((act, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleQuickAction(act.action)}
                              className="px-2 py-0.5 rounded-lg bg-zinc-950/80 hover:bg-indigo-600 hover:text-white border border-zinc-700/80 text-[10px] font-bold text-indigo-300 transition-all cursor-pointer"
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-1 text-[9px] pt-1 ${isUser ? 'text-sky-200/90 justify-end' : 'text-zinc-500 justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {isUser && <CheckCircle2 size={9} />}
                      </div>

                      {/* Emoji reaction floating bar */}
                      <div className={`absolute -top-3 ${isUser ? 'right-2' : 'left-2'} hidden group-hover:flex items-center gap-0.5 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded-full z-10`}>
                        {['❤️', '🔥', '👍', '💡', '⚡'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="hover:scale-125 text-xs p-0.5 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reaction tags */}
                    {Object.entries(reactions).filter(([_, c]) => Number(c) > 0).length > 0 && (
                      <div className="flex items-center gap-1 px-1 mt-1 flex-wrap">
                        {Object.entries(reactions).map(([emoji, count]) => {
                          const cnt = Number(count);
                          if (cnt <= 0) return null;
                          return (
                            <span
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="bg-zinc-900 border border-zinc-700 text-[10px] px-1.5 py-0.5 rounded-full text-zinc-300 flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{emoji}</span>
                              <span className="font-bold">{cnt}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-2xl overflow-hidden bg-zinc-800 border border-sky-500/40 shrink-0 mb-1 shadow flex items-center justify-center text-xs text-white font-bold">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.displayName?.charAt(0) || 'U'
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-sky-400" />
                  <span>Haevy Support AI đang soạn câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached image preview */}
          {selectedImageBase64 && (
            <div className="bg-zinc-900 border-t border-zinc-800 p-2.5 flex items-center gap-2 shrink-0 z-20">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0 relative">
                <img src={selectedImageBase64} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSelectedImageBase64(null)} className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 rounded-full text-white">
                  <X size={10} />
                </button>
              </div>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Ghi chú ảnh chụp màn hình sự cố..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage(imageCaption || 'Đã gửi ảnh đính kèm', selectedImageBase64)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send size={12} />
                <span>Gửi</span>
              </button>
            </div>
          )}

          {/* Input engine */}
          <div className="bg-zinc-900/95 border-t border-zinc-800/90 p-2.5 shadow-2xl backdrop-blur shrink-0 z-20">
            <div className="relative">
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 bg-zinc-900 border border-zinc-700 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 flex-wrap max-w-xs z-30">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-base cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <input type="file" ref={fileInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />

              {isRecordingVoice ? (
                <div className="flex items-center justify-between bg-red-950/60 border border-red-500/60 rounded-2xl p-2 px-3 gap-2">
                  <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Đang ghi âm ({recordingSeconds}s)...</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handleCancelRecording} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
                      <Trash2 size={12} />
                      <span>Hủy</span>
                    </button>
                    <button type="button" onClick={handleStopAndSendRecording} className="p-1.5 px-3 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Square size={11} fill="currentColor" />
                      <span>Gửi</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-sky-400 border border-zinc-700/60 cursor-pointer">
                    <ImageIcon size={16} />
                  </button>
                  <button type="button" onClick={handleStartRecording} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 cursor-pointer">
                    <Mic size={16} />
                  </button>
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 border border-zinc-700/60 cursor-pointer">
                    <Smile size={16} />
                  </button>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Nhập câu hỏi hỗ trợ (vd: Mã Khởi Động Lớp 6)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isAiTyping}
                    className="p-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Send size={14} />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Support Tickets */}
      {activeTab === 'ticket' && (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${isFullScreen ? 'flex-1 min-h-0 overflow-y-auto pr-1' : ''}`}>
          <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-sm">Gửi Phiếu Yêu Cầu Hỗ Trợ</h3>
              <p className="text-xs text-zinc-400">Đội ngũ kỹ sư an ninh & CSKH Haevy tiếp nhận và phản hồi ưu tiên</p>
            </div>

            {ticketSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>{ticketSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Chuyên Mục</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="security">🛡️ An Ninh & Bảo Vệ 6 Lớp</option>
                    <option value="vip">👑 Gói Nạp VIP & Hi-Fi Audio</option>
                    <option value="points">🪙 Điểm Audio & Nhiệm Vụ</option>
                    <option value="author">🎵 Góc Tác Giả & Audio Upload</option>
                    <option value="games">🎮 Haevy Games & Đấu Trường</option>
                    <option value="technical">⚙️ Lỗi Kỹ Thuật / Ứng Dụng</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Mức Độ Ưu Tiên</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="normal">Bình thường (2h)</option>
                    <option value="high">Cao (30p)</option>
                    <option value="urgent">Khẩn Cấp (Sự cố bảo mật/mã khởi động)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Tiêu Đề Yêu Cầu</label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn gọn sự cố..."
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Chi Tiết Sự Cố</label>
                <textarea
                  rows={4}
                  placeholder="Ghi rõ tình trạng, thiết bị sử dụng, các bước gặp lỗi..."
                  value={ticketContent}
                  onChange={(e) => setTicketContent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingTicket ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /><span>Gửi Phiếu Hỗ Trợ</span></>}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <LifeBuoy size={14} className="text-sky-400" />
                <span>Kênh Hỗ Trợ Chính Thức</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <p className="text-zinc-500 text-[10px]">Email CSKH:</p>
                  <p className="font-mono font-bold text-sky-300">support@haevy.audio</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <p className="text-zinc-500 text-[10px]">Hotline 24/7:</p>
                  <p className="font-mono font-bold text-emerald-400">1900 8824 (Miễn phí)</p>
                </div>
              </div>
            </div>

            {userTickets.length > 0 && (
              <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" />
                  <span>Phiếu Hỗ Trợ Đã Gửi</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {userTickets.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300 text-[11px]">{t.id}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {t.status === 'open' ? 'Đang tiếp nhận' : 'Đã xử lý'}
                        </span>
                      </div>
                      <p className="text-white font-medium truncate text-[11px]">{t.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className={`p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3 ${isFullScreen ? 'flex-1 min-h-0 overflow-y-auto pr-1' : ''}`}>
          <div>
            <h3 className="font-extrabold text-white text-sm">Cẩm Nang Giải Đáp An Ninh & Tài Khoản</h3>
            <p className="text-xs text-zinc-400">Những thắc mắc phổ biến nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-sky-400 shrink-0" />
                  <span>{faq.q}</span>
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Simulator Modal */}
      {activeCallType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{callStatus === 'connecting' ? 'Đang kết nối...' : `Đang trong cuộc gọi (${Math.floor(callDurationSeconds / 60)}:${(callDurationSeconds % 60).toString().padStart(2, '0')})`}</span>
            </div>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl">
              <Bot size={40} />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Haevy Support AI Specialist</h3>
              <p className="text-xs text-zinc-400">{activeCallType === 'video' ? 'Cuộc gọi Video HD' : 'Cuộc gọi Thoại HD'}</p>
            </div>

            {callStatus === 'connected' && (
              <div className="flex items-center justify-center gap-1 h-6 px-4 bg-zinc-950 rounded-xl border border-zinc-800">
                {[10, 20, 14, 24, 16, 26, 12, 22, 16].map((h, i) => (
                  <div key={i} style={{ height: `${h}px` }} className="w-1 bg-gradient-to-t from-sky-500 to-indigo-400 rounded-full animate-pulse" />
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl border cursor-pointer ${isMuted ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3 rounded-2xl border cursor-pointer ${isSpeakerOn ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
              >
                {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                type="button"
                onClick={endCall}
                className="p-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <PhoneOff size={18} />
                <span className="text-xs">Kết Thúc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {zoomedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button type="button" onClick={() => setZoomedImageUrl(null)} className="absolute -top-10 right-0 p-1.5 bg-zinc-800 text-white rounded-full cursor-pointer">
              <X size={18} />
            </button>
            <img src={zoomedImageUrl} alt="" className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
