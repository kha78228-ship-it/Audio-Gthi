import React, { useState } from 'react';
import { 
  Users, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Heart, 
  Sparkles, 
  Clock, 
  Flame, 
  Send, 
  ShieldCheck, 
  Plus, 
  ChevronRight, 
  Smile, 
  Award,
  Volume2,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { DEFAULT_STUDY_ROOMS, SunStudyRoom } from '../../../services/sunStudyStorageService';

interface SunStudyRoomsProps {
  onJoinDeskWithTopic?: (topic: string) => void;
}

export function SunStudyRooms({ onJoinDeskWithTopic }: SunStudyRoomsProps) {
  const [rooms, setRooms] = useState<SunStudyRoom[]>(DEFAULT_STUDY_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room_thpt_a00');
  const [isJoined, setIsJoined] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [reactionsCount, setReactionsCount] = useState<number>(342);
  const [recentReaction, setRecentReaction] = useState<string | null>(null);

  // Chat message in room
  const [roomMessages, setRoomMessages] = useState<Array<{ id: string; user: string; text: string; time: string; avatar: string }>>([
    { id: '1', user: 'Minh Khoa (Chuyên Sư Phạm)', text: 'Chào cả phòng! Mình bắt đầu ca học Toán 2 tiếng đây, chúc mọi người năng suất!', time: '19:30', avatar: '👨‍🎓' },
    { id: '2', user: 'Hải Yến (K12)', text: 'Cố lên các bạn ơi! Sắp đến kỳ thi rồi, kiên trì từng ngày nha! 💪', time: '19:34', avatar: '👩‍🎓' },
    { id: '3', user: 'Quốc Bảo', text: 'Vừa xong 1 ca Pomodoro Lý, phòng đông thế này học có động lực hẳn!', time: '19:42', avatar: '🧑‍💻' },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Sample Online Peers in Active Room
  const samplePeers = [
    { name: 'Bạn (Người Dùng)', status: 'Đang Tập Trung 🔥', studyTime: '1h45m', avatar: '☀️', isMe: true },
    { name: 'Minh Khoa', status: 'Cày Đề Toán 📐', studyTime: '2h15m', avatar: '👨‍🎓', isMe: false },
    { name: 'Hải Yến', status: 'Hóa Học L12 🧪', studyTime: '1h30m', avatar: '👩‍🎓', isMe: false },
    { name: 'Đức Huy', status: 'Luyện fx-880 ⚡', studyTime: '3h05m', avatar: '🧑‍🔬', isMe: false },
    { name: 'Thảo My', status: 'Ôn Chuyên Văn 📖', studyTime: '2h40m', avatar: '🌸', isMe: false },
    { name: 'Hoàng Long', status: 'Cú Đêm STEM 🦉', studyTime: '4h10m', avatar: '🌙', isMe: false },
    { name: 'Ngọc Ánh', status: 'ĐGNL ĐHQG 🎯', studyTime: '1h15m', avatar: '✨', isMe: false },
    { name: 'Tuấn Kiệt', status: 'Giải Đề Sinh 🧬', studyTime: '2h00m', avatar: '🌱', isMe: false }
  ];

  const currentRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  const handleSendReaction = (emoji: string) => {
    setReactionsCount(prev => prev + 1);
    setRecentReaction(emoji);
    setTimeout(() => setRecentReaction(null), 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      user: 'Bạn',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      avatar: '☀️'
    };
    setRoomMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Room Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-2xl shadow-inner">
            👥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Phòng Học Chung (Study With Me)</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live Trực Tuyến
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Cùng hàng trăm sĩ tử toàn quốc bật đèn cày đề mỗi tối • Tự học nhưng không bao giờ cô đơn.
            </p>
          </div>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeRoomId === room.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{room.name.split(' ')[0]}</span>
              <span>{room.name.split(' ').slice(1, 3).join(' ')}</span>
              <span className="text-[10px] bg-zinc-900/80 px-1 rounded font-mono">
                {room.currentUsers}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Room Arena Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Virtual Study Hall Video Grid (Avatar Cams) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col gap-4">
            {/* Room Title Strip */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 flex-wrap gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{currentRoom.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                    {currentRoom.subjectCategory}
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Host: <span className="text-zinc-200 font-semibold">{currentRoom.hostName}</span> • {currentRoom.description}
                </p>
              </div>

              {/* Study Hall Camera & Mic Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCamOn(!isCamOn)}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    isCamOn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title={isCamOn ? 'Tắt Avatar Cam' : 'Bật Avatar Cam'}
                >
                  {isCamOn ? <Video size={14} /> : <VideoOff size={14} />}
                  <span className="hidden sm:inline">{isCamOn ? 'Cam Bật' : 'Cam Tắt'}</span>
                </button>

                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    isMicOn
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title={isMicOn ? 'Tắt Mic Yên Lặng' : 'Bật Mic'}
                >
                  {isMicOn ? <Mic size={14} /> : <MicOff size={14} />}
                  <span className="hidden sm:inline">{isMicOn ? 'Mic Bật' : 'Yên Lặng'}</span>
                </button>
              </div>
            </div>

            {/* Student Avatar Cam Tiles Grid (3x3 or 4x2) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {samplePeers.map((peer, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between min-h-[120px] relative transition-all group ${
                    peer.isMe
                      ? 'bg-gradient-to-b from-amber-950/40 to-zinc-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Status Dot */}
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">#{idx + 1}</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>

                  {/* Big Character Avatar */}
                  <div className="my-1.5 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {peer.avatar}
                    </div>
                    <span className="text-xs font-bold text-white mt-1 truncate max-w-[110px]">
                      {peer.name}
                    </span>
                    <span className="text-[10px] text-amber-300/90 font-medium">
                      {peer.status}
                    </span>
                  </div>

                  {/* Study Timer Badge */}
                  <div className="w-full text-center text-[10px] text-zinc-400 font-mono bg-zinc-950/60 rounded-lg py-0.5">
                    ⏱️ {peer.studyTime}
                  </div>
                </div>
              ))}
            </div>

            {/* Cheer / Encouragement Reactions Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <span>Cổ vũ bạn bè:</span>
                </span>
                {['👏 Cố lên!', '🌻 Tặng hoa', '☕ Uống nước nha', '🔥 Cháy quá!', '❤️ Thả tim'].map(r => (
                  <button
                    key={r}
                    onClick={() => handleSendReaction(r.split(' ')[0])}
                    className="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition active:scale-95 cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Reaction Counter */}
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Heart size={14} className="text-rose-500 fill-rose-500" />
                <span>{reactionsCount} lượt cổ vũ</span>
                {recentReaction && (
                  <span className="text-lg animate-bounce ml-1">{recentReaction}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Room Chat & Motivation */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col h-[480px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Trò Chuyện Phòng Học</h4>
              </div>
              <span className="text-[10px] text-zinc-500">Giữ yên tĩnh & lịch sự</span>
            </div>

            {/* Chat Message Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs no-scrollbar">
              {roomMessages.map(msg => (
                <div key={msg.id} className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <span>{msg.avatar}</span>
                      <span>{msg.user}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-normal">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Send Chat Form */}
            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Gửi lời chúc, chia sẻ tiến độ học..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
