import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Plus, 
  Sparkles, 
  Trash2, 
  Volume2, 
  Radio, 
  Clock, 
  Heart,
  Flame,
  Check
} from 'lucide-react';
import { CoupleData, CoupleVoiceMoment } from '../../types';

interface VoiceMomentsTabProps {
  couple: CoupleData;
  userUid?: string;
  voiceMoments: CoupleVoiceMoment[];
  onSaveVoiceMoment: (title: string, audioBlob: Blob | null, audioUrl: string, durationSec: number, type: any, note: string) => Promise<void>;
  onDeleteVoiceMoment?: (momentId: string) => Promise<void>;
}

export function VoiceMomentsTab({
  couple,
  userUid,
  voiceMoments,
  onSaveVoiceMoment,
  onDeleteVoiceMoment
}: VoiceMomentsTabProps) {
  const [isAddVoiceOpen, setIsAddVoiceOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [voiceTitle, setVoiceTitle] = useState('');
  const [voiceType, setVoiceType] = useState<'promise' | 'night_whisper' | 'sweet_song' | 'anniversary_capsule'>('promise');
  const [voiceNote, setVoiceNote] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const voiceAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current.pause();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSec(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSec(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Vui lòng cấp quyền Microphone trên trình duyệt để ghi âm lời hứa & tâm sự!');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceTitle.trim() || (!recordedAudioUrl && !recordedAudioBlob)) return;

    setSubmitting(true);
    try {
      await onSaveVoiceMoment(voiceTitle.trim(), recordedAudioBlob, recordedAudioUrl || '', recordingSec || 30, voiceType, voiceNote.trim());
      setVoiceTitle('');
      setVoiceNote('');
      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);
      setRecordingSec(0);
      setIsAddVoiceOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayVoice = (moment: CoupleVoiceMoment) => {
    if (playingVoiceId === moment.id) {
      if (voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current.pause();
      }
      setPlayingVoiceId(null);
    } else {
      if (voiceAudioPlayerRef.current) {
        voiceAudioPlayerRef.current.pause();
      }
      const audio = new Audio(moment.audioUrl);
      voiceAudioPlayerRef.current = audio;
      audio.play();
      setPlayingVoiceId(moment.id);
      audio.onended = () => setPlayingVoiceId(null);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-sm xs:text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <Mic size={17} className="text-rose-400 shrink-0" />
            <span>Audio Lời Hứa & Khoảnh Khắc Kỷ Niệm</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
            Thu âm trực tiếp giọng nói tâm sự đêm khuya, hát tặng, lời chúc ngọt ngào và hẹn ước tương lai
          </p>
        </div>
        <button
          onClick={() => setIsAddVoiceOpen(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Ghi Âm Mới</span>
        </button>
      </div>

      {/* Recording Modal */}
      {isAddVoiceOpen && (
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-3 sm:space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Mic size={14} className="text-rose-400 shrink-0" />
              <span>Thu Âm Lời Hứa / Tâm Sự Mới</span>
            </h3>
            <button onClick={() => setIsAddVoiceOpen(false)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
          </div>

          {/* Live Mic Recorder Animation */}
          <div className="p-4 sm:p-8 rounded-xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-2.5 sm:space-y-4">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30 pointer-events-none" />
              )}
              <button
                type="button"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isRecording ? <Square size={20} /> : <Mic size={22} />}
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-white">
                {isRecording ? 'Đang thu âm giọng nói của bạn...' : (recordedAudioUrl ? 'Đã thu âm xong!' : 'Bấm nút mic để bắt đầu thu âm')}
              </div>
              <div className="text-xs font-mono text-rose-300">
                {Math.floor(recordingSec / 60)}:{(recordingSec % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Soundwave animation simulation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-5 sm:h-8 pt-1">
                {[40, 70, 90, 60, 100, 80, 50, 90, 60, 40].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1 sm:w-1.5 bg-rose-500 rounded-full animate-pulse" 
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {recordedAudioUrl && (
              <div className="max-w-md mx-auto pt-1 sm:pt-2">
                <audio src={recordedAudioUrl} controls className="w-full h-10 rounded-xl" />
              </div>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Tiêu đề khoảnh khắc</label>
              <input
                type="text"
                value={voiceTitle}
                onChange={(e) => setVoiceTitle(e.target.value)}
                placeholder="VD: Lời hứa bên nhau mãi mãi, Hát tặng em bài này..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Thể loại</label>
                <select
                  value={voiceType}
                  onChange={(e) => setVoiceType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="promise">🤝 Lời Hứa Tình Yêu</option>
                  <option value="night_whisper">🌙 Tâm Sự Đêm Khuya</option>
                  <option value="sweet_song">🎵 Hát Tặng Người Thương</option>
                  <option value="anniversary_capsule">⏳ Hẹn Ước Kỷ Niệm</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ghi chú kèm theo</label>
                <input
                  type="text"
                  value={voiceNote}
                  onChange={(e) => setVoiceNote(e.target.value)}
                  placeholder="VD: Nghe trước khi đi ngủ nha..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setIsAddVoiceOpen(false)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !recordedAudioUrl || !voiceTitle.trim()}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                Lưu Khoảnh Khắc (+40đ)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voice Moments List */}
      {voiceMoments.length === 0 ? (
        <div className="p-6 sm:p-12 rounded-xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-2.5 sm:space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Mic size={18} />
          </div>
          <p className="text-xs sm:text-sm font-bold text-white">Chưa có bản ghi âm lời hứa nào</p>
          <p className="text-[10px] sm:text-xs text-zinc-400 max-w-md mx-auto">
            Hãy thu âm những lời thì thầm ngọt ngào, lời hứa hẹn và giai điệu tình yêu để lưu giữ mãi mãi trong không gian đôi!
          </p>
          <button
            onClick={() => setIsAddVoiceOpen(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs cursor-pointer"
          >
            + Thu âm bản đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {voiceMoments.map(moment => {
            const isPlayingThis = playingVoiceId === moment.id;
            return (
              <div
                key={moment.id}
                className="p-3 xs:p-3.5 sm:p-5 rounded-xl sm:rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/40 transition-all space-y-2.5 sm:space-y-4 shadow-xl flex items-center justify-between gap-2.5 sm:gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => handlePlayVoice(moment)}
                    className={`w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 ${
                      isPlayingThis 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-rose-300 active:scale-95'
                    }`}
                  >
                    {isPlayingThis ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>

                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">{moment.title}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-400 flex items-center gap-1 sm:gap-2">
                      <span className="truncate max-w-[80px] sm:max-w-none">👤 {moment.authorName}</span>
                      <span>•</span>
                      <span>⏳ {moment.durationSec}s</span>
                    </div>
                    {moment.note && (
                      <div className="text-[10px] sm:text-[11px] text-rose-300 italic truncate max-w-[150px] sm:max-w-none">“{moment.note}”</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[9px] sm:text-[10px] font-extrabold">
                    {moment.type === 'promise' ? '🤝 Lời Hứa' : (moment.type === 'night_whisper' ? '🌙 Tâm Sự' : '🎵 Hát Tặng')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
