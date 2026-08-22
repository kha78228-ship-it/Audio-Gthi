import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Music, 
  Upload, 
  Play, 
  Pause, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Loader2,
  Volume2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PublishAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerification?: () => void;
  onOpenTextToAudio?: () => void;
  onPublishedSuccess?: () => void;
  initialData?: {
    title?: string;
    artist?: string;
    genre?: string;
    audioUrl?: string;
    durationSec?: number;
    description?: string;
    lyrics?: string;
    isSeries?: boolean;
    seriesId?: string;
    seriesTitle?: string;
    episodeNumber?: number;
    episodeTitle?: string;
    storylineSummary?: string;
  } | null;
  prefilledSeries?: {
    seriesId: string;
    seriesTitle: string;
    nextEpisodeNumber: number;
    genre: string;
  } | null;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Lo-Fi Neon
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', // Guitar Acoustic
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Stage EDM
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', // DJ Club
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80', // Piano Classical
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', // Ambient Nature
];

const GENRE_LIST = [
  'Truyện Tiên Hiệp & Kiếm Hiệp',
  'Truyện Ma & Trinh Thám',
  'Truyện Ngôn Tình & Đô Thị',
  'Sách Nói & Radio',
  'Lo-Fi Chill',
  'Deep Focus',
  'Acoustic',
  'Pop & Ballad',
  'Electronic & EDM',
  'R&B & Soul',
  'Rap & Hip-Hop',
  'Ambient & Zen',
  'Podcast & Talk',
  'Khác'
];

export function PublishAudioModal({ 
  isOpen, 
  onClose, 
  onOpenVerification,
  onOpenTextToAudio,
  onPublishedSuccess,
  initialData,
  prefilledSeries
}: PublishAudioModalProps) {
  const { 
    user, 
    isAdmin, 
    isAuthorVerified, 
    authorStatus, 
    authorStageName, 
    publishAuthorTrack 
  } = useAuth();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Truyện Tiên Hiệp & Kiếm Hiệp');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [customCoverFile, setCustomCoverFile] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number>(210);
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [bitrate, setBitrate] = useState('320kbps Hi-Fi');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');

  // Series & Episodic Progression
  const [isSeries, setIsSeries] = useState(false);
  const [seriesId, setSeriesId] = useState('');
  const [seriesTitle, setSeriesTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState<number>(10);
  const [storylineSummary, setStorylineSummary] = useState('');

  // Audio Preview State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize from initialData if provided or defaults
  useEffect(() => {
    if (!isOpen) return;

    if (prefilledSeries) {
      setIsSeries(true);
      setSeriesId(prefilledSeries.seriesId);
      setSeriesTitle(prefilledSeries.seriesTitle);
      setEpisodeNumber(prefilledSeries.nextEpisodeNumber);
      setGenre(prefilledSeries.genre || 'Truyện Tiên Hiệp & Kiếm Hiệp');
      setTitle(`${prefilledSeries.seriesTitle} - Tập ${('0' + prefilledSeries.nextEpisodeNumber).slice(-2)}`);
      setEpisodeTitle(`Tập ${('0' + prefilledSeries.nextEpisodeNumber).slice(-2)}`);
    } else if (initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.artist) setArtist(initialData.artist);
      if (initialData.genre) setGenre(initialData.genre);
      if (initialData.audioUrl) {
        setAudioUrl(initialData.audioUrl);
        setAudioFileName(`${initialData.title || 'audio_voice'}.wav (Tạo từ AI Voice Studio)`);
      }
      if (initialData.durationSec) setDurationSec(initialData.durationSec);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.lyrics) setLyrics(initialData.lyrics);
      if (initialData.isSeries) setIsSeries(true);
      if (initialData.seriesId) setSeriesId(initialData.seriesId);
      if (initialData.seriesTitle) setSeriesTitle(initialData.seriesTitle);
      if (initialData.episodeNumber) setEpisodeNumber(initialData.episodeNumber);
      if (initialData.episodeTitle) setEpisodeTitle(initialData.episodeTitle);
      if (initialData.storylineSummary) setStorylineSummary(initialData.storylineSummary);
    } else if (user) {
      setArtist(authorStageName || user.displayName || 'Tác giả');
    }
  }, [isOpen, initialData, prefilledSeries, user, authorStageName]);

  // Clean audio on unmount / close
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, [isOpen]);

  const handleAudioFileUpload = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
      alert('Vui lòng chọn tệp âm thanh hợp lệ (MP3, WAV, M4A, OGG, FLAC).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Kích thước tệp âm thanh tối đa là 50MB.');
      return;
    }

    setAudioFileName(file.name);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    // Measure duration
    const tempAudio = new Audio();
    tempAudio.src = objectUrl;
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDurationSec(Math.round(tempAudio.duration));
      }
    };
  };

  const handleCoverUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp ảnh hợp lệ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomCoverFile(result);
      setCoverUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleAudioPreview = () => {
    if (!audioUrl) return;

    if (isPlayingPreview) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(audioUrl);
        audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        audioPreviewRef.current.src = audioUrl;
      }
      audioPreviewRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => {
        console.warn('Audio preview play prevented:', e);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập Tiêu đề bài hát / tên tập audio.');
      return;
    }

    if (!audioUrl.trim()) {
      setErrorMsg('Vui lòng tải lên tệp âm thanh hoặc nhập đường dẫn URL bài hát.');
      return;
    }

    if (isSeries && !seriesTitle.trim()) {
      setErrorMsg('Vui lòng nhập Tên Bộ Truyện / Cốt Truyện.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const result = await publishAuthorTrack({
      title: title.trim(),
      artist: artist.trim(),
      genre,
      url: audioUrl.trim(),
      coverUrl: coverUrl.trim(),
      durationSec,
      isVipOnly,
      bitrate,
      description: description.trim(),
      lyrics: lyrics.trim(),
      isSeries,
      seriesId: seriesId || (isSeries ? `series-${Date.now()}` : undefined),
      seriesTitle: isSeries ? seriesTitle.trim() : undefined,
      episodeNumber: isSeries ? Number(episodeNumber) : undefined,
      episodeTitle: isSeries ? (episodeTitle.trim() || `Tập ${episodeNumber}`) : undefined,
      totalEpisodes: isSeries ? Number(totalEpisodes) : undefined,
      storylineSummary: isSeries ? storylineSummary.trim() : undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setTimeout(() => {
        onClose();
        if (onPublishedSuccess) onPublishedSuccess();
      }, 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="publish-audio-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="publish-audio-modal-content"
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Music size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg sm:text-xl">
                  Đăng Tác Phẩm Audio
                </h3>
                {isAuthorVerified ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck size={11} /> Tác Giả Đã Xác Minh
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Góc Tác Giả
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Phát hành bài hát chất lượng cao lên Kho Audio và Bảng xếp hạng Cộng đồng
              </p>
            </div>
          </div>

          <button
            id="close-publish-audio-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Not Verified Warning Banner */}
        {!isAuthorVerified && !isAdmin && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-3 shrink-0">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Bạn chưa hoàn tất Xác Minh Tác Giả (eKYC)</p>
                <p className="text-zinc-300 text-[11px] mt-0.5">
                  Xác minh bằng Gmail, SĐT, CCCD và Khuôn mặt để nhận tích xanh tác giả chính thức và +300 Điểm Audio.
                </p>
              </div>
            </div>
            {onOpenVerification && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerification();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs whitespace-nowrap shadow-md cursor-pointer shrink-0"
              >
                Xác Minh Ngay
              </button>
            )}
          </div>
        )}

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Audio File Upload / URL */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 size={15} className="text-amber-400" />
                <span>Tệp Âm Thanh Audio (MP3 / WAV / M4A / FLAC) *</span>
              </span>
              {audioUrl && (
                <button
                  type="button"
                  onClick={toggleAudioPreview}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isPlayingPreview ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingPreview ? 'Dừng phát thử' : 'Nghe thử'}</span>
                </button>
              )}
            </label>

            <div className="border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-2xl p-4 bg-zinc-950/60 transition-all text-center">
              {audioFileName ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Music size={18} />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs font-bold text-white truncate">{audioFileName}</p>
                      <p className="text-[10px] text-zinc-400">
                        Thời lượng: {Math.floor(durationSec / 60)}:{('0' + (durationSec % 60)).slice(-2)} phút
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAudioUrl('');
                      setAudioFileName('');
                      if (isPlayingPreview) toggleAudioPreview();
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-400 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Upload size={22} className="text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">
                    Nhấn để tải lên tệp Audio từ thiết bị của bạn
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Hỗ trợ tệp MP3, WAV, AAC, M4A, FLAC tối đa 50MB
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleAudioFileUpload(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>

            {/* Direct URL input fallback */}
            <div className="relative">
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Hoặc dán liên kết URL tệp Audio trực tiếp (https://.../song.mp3)"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
              />
            </div>

            {/* AI Text to Audio Studio shortcut */}
            {onOpenTextToAudio && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-zinc-900 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Chưa có file thu âm sẵn?</p>
                    <p className="text-[11px] text-zinc-400 truncate">Chuyển văn bản / kịch bản thành giọng đọc AI chất lượng cao</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTextToAudio();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-extrabold text-xs shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  Tạo Giọng Đọc AI
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Track Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Tiêu đề bài hát / Tác phẩm *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cơn Mưa Mùa Hạ (Lo-Fi Chill)"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm font-bold text-white placeholder-zinc-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Tác giả / Nghệ danh *
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nghệ danh tác giả"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none font-semibold"
              />
            </div>
          </div>

          {/* Section 2.5: Story Series & Episode Progression (Cốt truyện & Tập tiếp theo) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Thuộc Bộ Truyện / Cốt Truyện Nhiều Tập
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Bật nếu audio là một tập tiếp theo trong chuỗi truyện của bạn
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isSeries}
                onChange={(e) => setIsSeries(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-zinc-700 bg-zinc-900 cursor-pointer"
              />
            </div>

            {isSeries && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      Tên Bộ Truyện / Cốt Truyện *
                    </label>
                    <input
                      type="text"
                      value={seriesTitle}
                      onChange={(e) => setSeriesTitle(e.target.value)}
                      placeholder="VD: Phàm Nhân Tu Tiên, Huyết Án Làng Ma..."
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">
                        Tập số (Episode #) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={episodeNumber}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setEpisodeNumber(val);
                          if (!episodeTitle || episodeTitle.startsWith('Tập ')) {
                            setEpisodeTitle(`Tập ${('0' + val).slice(-2)}`);
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none font-bold text-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300">
                        Tổng số tập (Dự kiến)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={totalEpisodes}
                        onChange={(e) => setTotalEpisodes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Tiêu đề riêng của tập này (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="VD: Tập 01: Nhập Thôn Thất Huyền Môn"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Tóm tắt cốt truyện của bộ truyện (Story Synopsis)
                  </label>
                  <textarea
                    rows={2}
                    value={storylineSummary}
                    onChange={(e) => setStorylineSummary(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn diễn biến cốt truyện chính giúp người nghe dễ nắm bắt..."
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-2xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Section 2.8: Genre & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Thể loại âm nhạc
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-xs text-white outline-none cursor-pointer"
              >
                {GENRE_LIST.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900 text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Chất lượng âm thanh
              </label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="320kbps Hi-Fi" className="bg-zinc-900 text-white">
                  320kbps Hi-Fi (Chất lượng cao)
                </option>
                <option value="256kbps" className="bg-zinc-900 text-white">
                  256kbps HQ
                </option>
                <option value="192kbps" className="bg-zinc-900 text-white">
                  192kbps Chuẩn
                </option>
                <option value="Lossless FLAC" className="bg-zinc-900 text-white">
                  Lossless FLAC Master Studio
                </option>
              </select>
            </div>
          </div>

          {/* Section 3: Cover Art */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={15} className="text-amber-400" />
                <span>Ảnh bìa tác phẩm (Cover Art)</span>
              </span>
              <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-bold flex items-center gap-1">
                <Upload size={12} />
                <span>Tải ảnh bìa riêng</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]);
                  }}
                />
              </label>
            </label>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 shadow-md">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-6 gap-2 flex-1">
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverUrl(preset)}
                    className={`h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      coverUrl === preset ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: VIP Exclusive Toggle */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Độc quyền cho Thành viên VIP</p>
                <p className="text-[11px] text-zinc-400">
                  Chỉ thành viên gói VIP mới có thể phát và tải xuống bản thu chất lượng cao này
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isVipOnly}
              onChange={(e) => setIsVipOnly(e.target.checked)}
              className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </label>

          {/* Description & Lyrics */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Mô tả / Thông điệp của tác giả
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chia sẻ hoàn cảnh sáng tác, nguồn cảm hứng hoặc câu chuyện đằng sau bài hát..."
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Lời bài hát (Lyrics / Tùy chọn)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Dán lời bài hát để người nghe có thể hát theo và theo dõi giai điệu..."
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>

          {/* Reward Footer info */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>Phần thưởng khi phát hành bài hát:</span>
            </div>
            <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
              +50 Audio Points
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting || !title || !audioUrl}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang đăng Audio...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Đăng Tác Phẩm Lên Hệ Thống</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
