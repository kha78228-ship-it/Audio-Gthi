import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  UploadCloud, 
  Repeat, 
  Trash2, 
  Music2, 
  Sparkles, 
  Headphones, 
  Radio, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  CheckCircle2,
  FileAudio
} from 'lucide-react';
import { eduStudyAudioService, EduStudyTrack } from '../../services/eduStudyAudioService';

interface EduMusicPlayerProps {
  compact?: boolean;
  className?: string;
}

export function EduMusicPlayer({ compact = false, className = '' }: EduMusicPlayerProps) {
  const [audioState, setAudioState] = useState(() => eduStudyAudioService.getState());
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = eduStudyAudioService.subscribe(() => {
      setAudioState(eduStudyAudioService.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadFeedback('Đang tải và xử lý file âm thanh...');
    try {
      const file = files[0];
      const track = await eduStudyAudioService.uploadAudioFile(file);
      setUploadFeedback(`Đã tải lên: "${track.title}"! Đang phát 🎶`);
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tải file nhạc:', err);
      setUploadFeedback('Không thể tải file âm thanh. Vui lòng thử file mp3/wav khác!');
      setTimeout(() => setUploadFeedback(null), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const { currentTrack, isPlaying, currentTimeSec, volume, isMuted, isLoop, customTracks, presetTracks } = audioState;
  const progressPercent = currentTrack && currentTrack.durationSec > 0 
    ? Math.min(100, (currentTimeSec / currentTrack.durationSec) * 100) 
    : 0;

  return (
    <div className={`w-full bg-zinc-950/90 border border-zinc-800/80 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden transition-all ${className}`}>
      {/* Hidden File Input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg"
        className="hidden"
      />

      {/* Top Banner / Compact Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3 border-b border-zinc-800/60 bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-amber-950/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Headphones size={18} className={isPlaying ? 'animate-pulse' : ''} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[300px]">
                {currentTrack ? currentTrack.title : 'Âm Nhạc Tập Trung & Tải Lên'}
              </span>
              {currentTrack?.isCustomUpload ? (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                  Tải lên
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                  Sóng Não
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {currentTrack ? currentTrack.artist : 'Nghe nhạc sóng não hoặc tải bài hát của bạn để ôn thi'}
            </div>
          </div>
        </div>

        {/* Action Controls & Upload Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-black shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Tải bài hát MP3/WAV từ điện thoại hoặc máy tính"
          >
            <UploadCloud size={14} />
            <span className="hidden xs:inline">Tải Nhạc Lên</span>
          </button>

          <button
            onClick={() => eduStudyAudioService.togglePlay()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md ${
              isPlaying 
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/40' 
                : 'bg-emerald-500 text-zinc-950 font-black hover:bg-emerald-400'
            }`}
            title={isPlaying ? 'Tạm dừng' : 'Bật nhạc'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng bảng điều khiển'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Sparkles size={14} className="shrink-0 text-amber-400" />
          <span className="truncate">{uploadFeedback}</span>
        </div>
      )}

      {/* Expanded Controls & Playlist Panel */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-4 animate-fadeIn">
          {/* Audio Visualizer & Scrubber */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="text-emerald-400 font-bold">{formatTime(currentTimeSec)}</span>
              {/* Visualizer bars */}
              <div className="flex items-center gap-1 h-3 px-2">
                {[40, 70, 95, 60, 85, 50, 90, 65, 80, 45].map((h, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, (h + (i % 3) * 15) % 100)}%` : '20%',
                    }}
                  />
                ))}
              </div>
              <span>{formatTime(currentTrack?.durationSec || 180)}</span>
            </div>

            {/* Progress Slider */}
            <div 
              onClick={(e) => {
                if (!currentTrack) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                eduStudyAudioService.seek(ratio * currentTrack.durationSec);
              }}
              className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden cursor-pointer relative group"
            >
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Secondary Controls: Skip, Volume, Loop */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => eduStudyAudioService.playPrev()}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition active:scale-95 cursor-pointer"
                title="Bài trước"
              >
                <SkipBack size={15} />
              </button>
              <button
                onClick={() => eduStudyAudioService.playNext()}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition active:scale-95 cursor-pointer"
                title="Bài tiếp theo"
              >
                <SkipForward size={15} />
              </button>
              <button
                onClick={() => eduStudyAudioService.toggleLoop()}
                className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                  isLoop 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title={isLoop ? 'Lặp lại đang BẬT' : 'Lặp lại đang TẮT'}
              >
                <Repeat size={15} />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 min-w-[130px]">
              <button
                onClick={() => eduStudyAudioService.toggleMute()}
                className="text-zinc-400 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => eduStudyAudioService.setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[10px] text-zinc-400 font-mono w-6 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Track Lists: Custom Uploads vs Built-in Brainwaves */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            {/* Custom Uploaded Tracks Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <FileAudio size={13} />
                  <span>Nhạc Của Bạn ({customTracks.length})</span>
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud size={12} />
                  <span>Thêm file mới</span>
                </button>
              </div>

              {customTracks.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl border border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/30 text-center cursor-pointer transition group"
                >
                  <p className="text-xs text-zinc-400 group-hover:text-amber-300">
                    Chưa có bài hát nào được tải lên. Nhấp vào đây để tải file MP3/WAV từ máy bạn! 📁
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {customTracks.map(track => {
                    const isSelected = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2 border transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div 
                          onClick={() => eduStudyAudioService.playTrack(track)}
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isSelected && isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{track.title}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{formatTime(track.durationSec)}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => eduStudyAudioService.deleteCustomTrack(track.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                          title="Xóa bài hát này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preset Study Tracks Section */}
            <div>
              <div className="text-xs font-black text-emerald-300 mb-2 flex items-center gap-1.5">
                <Radio size={13} />
                <span>Sóng Não Tập Trung & Lofi Chill Sĩ Tử</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {presetTracks.map(track => {
                  const isSelected = currentTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => eduStudyAudioService.playTrack(track)}
                      className={`p-2 rounded-xl flex items-center gap-2 text-left border transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-sm'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isSelected && isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{track.title}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{track.artist}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
