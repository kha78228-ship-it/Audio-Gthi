import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Heart, 
  Send, 
  MessageSquare, 
  Smile, 
  Sparkles, 
  Calendar, 
  Trash2, 
  Image as ImageIcon, 
  Music, 
  Play, 
  Check, 
  Sun, 
  CloudRain, 
  Wind, 
  Moon, 
  Share2,
  Lock,
  UserCheck
} from 'lucide-react';
import { CoupleData, CoupleDiary, Track } from '../../types';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface CoupleDiaryTabProps {
  couple: CoupleData;
  userUid?: string;
  diaries: CoupleDiary[];
  effectiveTracks: Track[];
  onPlayTrack?: (track: Track) => void;
  onCreateDiary: (
    title: string, 
    content: string, 
    date: string, 
    mood: string, 
    weather: string, 
    photoUrl?: string, 
    trackId?: string
  ) => Promise<void>;
  onDeleteDiary: (diaryId: string) => Promise<void>;
  onAddDiaryComment: (diaryId: string, text: string) => Promise<void>;
  onToggleDiaryReaction: (diaryId: string, emoji: string) => Promise<void>;
}

const MOOD_PRESETS = [
  { id: 'happy', label: 'Hạnh Phúc', icon: '🥰', color: 'from-amber-500/20 to-orange-500/20 text-amber-300' },
  { id: 'sweet', label: 'Ngọt Ngào', icon: '💕', color: 'from-rose-500/20 to-pink-500/20 text-rose-300' },
  { id: 'missing', label: 'Nhớ Nhung', icon: '🥺', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300' },
  { id: 'peaceful', label: 'Bình Yên', icon: '🍃', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300' },
  { id: 'romantic', label: 'Lãng Mạn', icon: '🌹', color: 'from-pink-500/20 to-rose-500/20 text-pink-300' },
  { id: 'cozy', label: 'Ấm Áp', icon: '☕', color: 'from-amber-600/20 to-yellow-600/20 text-amber-200' },
  { id: 'sulking', label: 'Giận Hờn Nhẹ', icon: '😤', color: 'from-red-500/20 to-rose-500/20 text-rose-400' },
];

const WEATHER_PRESETS = [
  { id: 'sunny', label: 'Nắng Đẹp', icon: '☀️' },
  { id: 'rainy', label: 'Mưa Rơi', icon: '🌧️' },
  { id: 'cold', label: 'Se Lạnh', icon: '❄️' },
  { id: 'sunset', label: 'Hoàng Hôn', icon: '🌅' },
  { id: 'night', label: 'Đêm Sao', icon: '🌙' },
];

const REACTION_EMOJIS = ['💖', '💋', '🫂', '🌹', '🥺', '✨'];

export function CoupleDiaryTab({
  couple,
  userUid,
  diaries,
  effectiveTracks,
  onPlayTrack,
  onCreateDiary,
  onDeleteDiary,
  onAddDiaryComment,
  onToggleDiaryReaction
}: CoupleDiaryTabProps) {
  const isMePartner1 = couple.partner1.uid === userUid;
  const myNickname = isMePartner1 ? couple.partner1.nickname || 'Bạn' : couple.partner2?.nickname || 'Bạn';

  // New Diary Modal State
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaryDate, setDiaryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('sweet');
  const [weather, setWeather] = useState('sunny');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments state per diary
  const [activeCommentDiaryId, setActiveCommentDiaryId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onCreateDiary(
        title.trim(),
        content.trim(),
        diaryDate,
        mood,
        weather,
        photoUrl.trim() || undefined,
        selectedTrackId || undefined
      );
      setIsWriteOpen(false);
      setTitle('');
      setContent('');
      setPhotoUrl('');
      setSelectedTrackId('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (diaryId: string) => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      await onAddDiaryComment(diaryId, commentText.trim());
      setCommentText('');
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER & WRITE DIARY CTA */}
      <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <BookOpen size={12} className="text-rose-400" />
              <span>Sổ Nhật Ký Tình Yêu Đôi</span>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white">
              Ghi Lại Từng Khoảnh Khắc Cùng Nhau
            </h2>
            <p className="text-xs text-zinc-400">
              Nơi hai bạn cùng chia sẻ những dòng tâm sự, kỷ niệm thường nhật, cảm xúc ngọt ngào và giai điệu tình yêu.
            </p>
          </div>

          <button
            onClick={() => setIsWriteOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Viết Nhật Ký Mới</span>
          </button>
        </div>

        {/* Quick Quote / Motivation */}
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-rose-300/90 italic flex items-center gap-2">
          <span>📖</span>
          <span>"Mỗi ngày ở bên người ấy là một trang nhật ký đẹp nhất của cuộc đời."</span>
        </div>
      </div>

      {/* 2. MODAL: WRITE NEW DIARY */}
      {isWriteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative max-w-xl w-full max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen size={17} className="text-rose-400" />
                <span>Viết Trang Nhật Ký Tình Yêu</span>
              </h3>
              <button onClick={() => setIsWriteOpen(false)} className="text-zinc-400 hover:text-white text-xs">
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tiêu đề nhật ký</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Một buổi chiều dạo phố mưa bay, Ngày anh nấu ăn cho em..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày ghi nhớ</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Thời tiết hôm nay</label>
                  <div className="flex gap-1.5">
                    {WEATHER_PRESETS.map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWeather(w.id)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                          weather === w.id ? 'bg-rose-500/20 border-rose-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="text-sm">{w.icon}</span>
                        <span className="text-[9px] truncate">{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mood Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Cảm xúc / Tâm trạng</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {MOOD_PRESETS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        mood === m.id ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="text-[11px] truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nội dung tâm sự tình cảm</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hãy viết lại những cảm xúc chân thành, lời nhắn nhủ hay khoảnh khắc đáng nhớ nhất cùng người yêu hôm nay nhé..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Attach Photo Picker */}
              <ImageUploadPicker
                value={photoUrl}
                onChange={setPhotoUrl}
                label="Ảnh Kỷ Niệm Đính Kèm (Từ máy hoặc URL)"
                helperText="Chèn bức ảnh đẹp nhất của hai bạn trong ngày này"
                aspectRatio="video"
              />

              {/* Attach Background Song */}
              {effectiveTracks.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Music size={13} className="text-rose-400" />
                    <span>Bài Hát Kỷ Niệm Đính Kèm</span>
                  </label>
                  <select
                    value={selectedTrackId}
                    onChange={(e) => setSelectedTrackId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">-- Không đính kèm bài hát --</option>
                    {effectiveTracks.slice(0, 20).map(t => (
                      <option key={t.id} value={t.id}>{t.title} - {t.artist}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang Lưu...' : 'Lưu Trang Nhật Ký (+25đ)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DIARIES TIMELINE LIST */}
      <div className="space-y-4">
        {diaries.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              📖
            </div>
            <h3 className="text-base font-bold text-white">Sổ Nhật Ký Đôi Đang Chờ Đón Bạn</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Hãy cùng nhau viết trang nhật ký đầu tiên để lưu giữ những hồi ức tình yêu tuyệt đẹp theo năm tháng nhé!
            </p>
            <button
              onClick={() => setIsWriteOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Viết Trang Đầu Tiên</span>
            </button>
          </div>
        ) : (
          diaries.map(diary => {
            const isMe = diary.authorUid === userUid;
            const moodObj = MOOD_PRESETS.find(m => m.id === diary.mood) || MOOD_PRESETS[0];
            const weatherObj = WEATHER_PRESETS.find(w => w.id === diary.weather);
            const attachedTrack = diary.audioTrackId ? effectiveTracks.find(t => t.id === diary.audioTrackId) : null;
            const comments = diary.comments || [];
            const isCommentBoxOpen = activeCommentDiaryId === diary.id;

            return (
              <div 
                key={diary.id}
                className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 transition-all hover:border-zinc-700/80"
              >
                {/* Header of diary item */}
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-lg overflow-hidden shrink-0">
                      {diary.authorPhoto ? (
                        <img src={diary.authorPhoto} alt={diary.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{moodObj.icon}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white">
                          {diary.authorNickname || diary.authorName}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-bold">
                            Bạn viết
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-zinc-400 flex items-center gap-2">
                        <span>📅 {diary.date}</span>
                        {weatherObj && <span>• {weatherObj.icon} {weatherObj.label}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-current/20 bg-gradient-to-r ${moodObj.color} flex items-center gap-1`}>
                      <span>{moodObj.icon}</span>
                      <span>{moodObj.label}</span>
                    </span>

                    <button
                      onClick={() => onDeleteDiary(diary.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Xóa nhật ký"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Body of diary */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {diary.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {diary.content}
                  </p>

                  {/* Photo if attached */}
                  {diary.photoUrls && diary.photoUrls.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 max-h-80 bg-zinc-950">
                      <img 
                        src={diary.photoUrls[0]} 
                        alt={diary.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  {/* Attached Music Play bar */}
                  {attachedTrack && (
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950 border border-rose-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                          <Music size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{attachedTrack.title}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{attachedTrack.artist}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onPlayTrack && onPlayTrack(attachedTrack)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Phát Nhạc</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Reactions & Comment Toggle */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Reaction buttons */}
                  <div className="flex items-center gap-1">
                    {REACTION_EMOJIS.map(em => {
                      const userReacted = diary.reactions && Object.values(diary.reactions).includes(em);
                      return (
                        <button
                          key={em}
                          onClick={() => onToggleDiaryReaction(diary.id, em)}
                          className={`px-2 py-1 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 ${
                            userReacted ? 'bg-rose-500/20 border border-rose-500 scale-105' : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span>{em}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Comment toggle button */}
                  <button
                    onClick={() => setActiveCommentDiaryId(isCommentBoxOpen ? null : diary.id)}
                    className="px-3 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Tâm Sự Đôi ({comments.length})</span>
                  </button>
                </div>

                {/* Comment Section (Accordion) */}
                {isCommentBoxOpen && (
                  <div className="pt-3 space-y-3 animate-in slide-in-from-top-2">
                    {/* List of comments */}
                    {comments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {comments.map(cm => (
                          <div key={cm.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-300">{cm.authorNickname || cm.authorName}</span>
                              <span className="text-[9px] text-zinc-500">{new Date(cm.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-zinc-300">{cm.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 italic">Chưa có bình luận nào. Hãy gửi lời nhắn ngọt ngào cho người yêu dưới bài viết này nhé!</div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={`Trả lời người thương với tư cách "${myNickname}"...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCommentSubmit(diary.id);
                          }
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleCommentSubmit(diary.id)}
                        disabled={commentSubmitting || !commentText.trim()}
                        className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send size={12} />
                        <span>Gửi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
