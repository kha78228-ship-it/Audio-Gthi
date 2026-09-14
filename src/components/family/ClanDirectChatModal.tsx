import React, { useState, useEffect, useRef } from 'react';
import { FamilyTreeMember as FamilyMember } from '../../types';
import { 
  X, 
  Send, 
  MessageSquare, 
  User, 
  Heart, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Smile, 
  Volume2,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface ClanDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  currentUserId?: string;
  tracks?: any[];
  onPlayTrack?: (track: any) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onNavigateToMessages?: () => void;
}

export const ClanDirectChatModal: React.FC<ClanDirectChatModalProps> = ({
  isOpen,
  onClose,
  member,
  currentUserId,
  tracks = [],
  onPlayTrack,
  onNavigateToMode,
  onNavigateToMessages,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key for this member
  const storageKey = member ? `haevy_clan_chat_${member.id}` : null;

  useEffect(() => {
    if (!storageKey || !member) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    // Default initial welcoming family message
    setMessages([
      {
        id: 'msg_welcome',
        senderId: member.id,
        senderName: member.fullName,
        text: `Chào bạn! Rất vui được kết nối thân tộc cùng dòng họ trên Hệ sinh thái Haevy. Hãy gửi lời chào nhé!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
      }
    ]);
  }, [storageKey, member]);

  useEffect(() => {
    if (storageKey && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, storageKey]);

  if (!isOpen || !member) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: 'Tôi',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate smart auto reply from family member
    setTimeout(() => {
      const replies = [
        `Cảm ơn cháu/bác đã nhắn tin thăm hỏi! Chúc gia đình luôn dồi dào sức khỏe, an khang thịnh vượng!`,
        `Tuyệt vời quá! Hãy cùng nhau kết nối và gìn giữ truyền thống tốt đẹp của dòng họ mình trên Haevy nhé.`,
        `Đã nhận được tin nhắn! Dòng tộc ta thật ấm áp khi luôn nhớ về cội nguồn.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: member.id,
        senderName: member.fullName,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  const quickGreetings = [
    'Kính chúc Bác/Cô chú nhiều sức khỏe! 🙏',
    'Chào anh/chị em thân tộc! Cùng giữ liên lạc nhé ✨',
    'Hẹn gặp mặt gia tộc trong dịp lễ tới nhé! 🏮',
    'Ghé nghe audio tâm sự của mình trên Haevy nhé! 🎶'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[560px] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-slate-950">
              {member?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-bold text-sm text-amber-200 flex items-center gap-2">
                {member.fullName}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Thân tộc Online
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Đời thứ {member.generation} • {member.branch || 'Chi Trưởng'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onNavigateToMessages && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMessages();
                }}
                title="Mở toàn màn hình trong Haevy Messages"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-slate-500 mb-0.5 px-1">
                {msg.senderName} • {msg.timestamp}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.isSelf
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick greetings suggestions */}
        <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickGreetings.map((g, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(g)}
              className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition-all"
            >
              {g}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Nhắn tin với ${member.fullName}...`}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-amber-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
