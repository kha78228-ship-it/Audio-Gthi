import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Volume2, 
  Mic, 
  Music, 
  Sliders, 
  FileText, 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCcw, 
  Radio, 
  Layers, 
  Headphones,
  Send,
  Zap,
  BookOpen,
  Ghost,
  HeartHandshake,
  Moon,
  Compass
} from 'lucide-react';
import { 
  TTS_VOICES, 
  AMBIENT_BACKGROUNDS, 
  generateGeminiSpeech, 
  TtsVoiceOption,
  AmbientBackgroundOption
} from '../services/ttsService';
import { useAuth } from '../context/AuthContext';

interface TextToAudioStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToPublish?: (data: {
    title: string;
    genre: string;
    audioUrl: string;
    durationSec: number;
    description: string;
    lyrics: string;
  }) => void;
}

const PRESET_SCRIPTS = [
  {
    category: 'Tiên Hiệp & Kiếm Hiệp',
    icon: Compass,
    title: 'Cửu Long Thần Kiếm - Mở Màn',
    genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
    voice: 'Fenrir',
    ambient: 'zen',
    text: 'Đêm trăng thanh vắng trên đỉnh Cửu Long Sơn, sương mây bao phủ mịt mùng. Giữa làn phong ba cuồn cuộn, một luồng kim quang rực rỡ xé toạc màn đêm u tối. Thanh kiếm cổ xưa sau vạn năm phong ấn, nay bỗng phát ra tiếng ngân vang chấn động tam giới...'
  },
  {
    category: 'Podcast & Thư Giãn',
    icon: HeartHandshake,
    title: 'Lắng Đọng Tâm Hồn Giữa Phố Thị',
    genre: 'Podcast & Talk',
    voice: 'Kore',
    ambient: 'piano',
    text: 'Chào bạn, cảm ơn bạn đã dừng lại một chút giữa nhịp sống hối hả. Hãy nhắm mắt lại, hít một hơi thật sâu và thở ra thật chậm rãi. Dù ngày hôm nay có bộn bề ra sao, bạn xứng đáng có được những phút giây bình yên cho chính tâm hồn mình...'
  },
  {
    category: 'Truyện Ma Đêm Khuya',
    icon: Ghost,
    title: 'Căn Nhà Cổ Ven Bìa Rừng',
    genre: 'Truyện Ma & Trinh Thám',
    voice: 'Charon',
    ambient: 'rain',
    text: 'Trời đổ mưa tầm tã suốt đêm rằm tháng bảy. Ánh chớp lập lòe soi rọi cánh cổng gỗ rêu phong của ngôi nhà cổ nằm trơ trọi ven bìa rừng. Từ tầng gác xép u tối, từng tiếng gõ cộc cộc vang lên đều đặn, không một bóng người...'
  },
  {
    category: 'Radio Thư Giãn & Ngủ Ngon',
    icon: Moon,
    title: 'Khúc Hát Ru Của Màn Đêm',
    genre: 'Sách Nói & Radio',
    voice: 'Zephyr',
    ambient: 'lofi',
    text: 'Đêm đã về khuya, những ngọn đèn đường ngoài kia dần tắt. Hãy buông bỏ mọi muộn phiền của ngày hôm nay, cuộn mình trong chiếc chăn ấm áp. Chúc bạn có một giấc ngủ thật sâu và những giấc mơ ngọt ngào nhất...'
  },
];

export function TextToAudioStudioModal({
  isOpen,
  onClose,
  onSendToPublish
}: TextToAudioStudioModalProps) {
  const { user, isAuthorVerified, authorStageName, audioPoints, isVip, isAdmin, deductAudioPoints } = useAuth();

  const [title, setTitle] = useState('Bản Đọc Âm Thanh Mới');
  const [text, setText] = useState(PRESET_SCRIPTS[1].text);
  const [selectedVoice, setSelectedVoice] = useState<string>('kore');
  const [selectedAmbient, setSelectedAmbient] = useState<string>('piano');
  const [selectedGenre, setSelectedGenre] = useState<string>('Podcast & Talk');
  const [speechStyle, setSpeechStyle] = useState<string>('Diễn cảm, trầm ấm, tốc độ vừa phải');

  // Fee for TTS Audio Synthesis (Points) - Tăng gấp 5 lần theo yêu cầu: VIP: 50 pts, Bản Thường: 75 pts, Admin: 0 pts
  const ttsPointsCost = isAdmin ? 0 : isVip ? 50 : 75;

  // Audio generation state
  const [isProcessingTts, setIsProcessingTts] = useState(false);
  const [synthProgressPercent, setSynthProgressPercent] = useState<number>(0);
  const [synthStageText, setSynthStageText] = useState<string>('');
  const [synthElapsedSec, setSynthElapsedSec] = useState<number>(0);
  const [synthEstimatedSec, setSynthEstimatedSec] = useState<number>(0);
  const synthTimerRef = useRef<any>(null);

  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [generationSource, setGenerationSource] = useState<'gemini' | 'browser_speech'>('gemini');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio url on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_SCRIPTS[0]) => {
    setTitle(preset.title);
    setText(preset.text);
    setSelectedGenre(preset.genre);
    const vObj = TTS_VOICES.find(v => v.geminiVoiceName === preset.voice);
    if (vObj) setSelectedVoice(vObj.id);
    setSelectedAmbient(preset.ambient);
  };

  const handleSynthesizeAudio = async () => {
    if (!text.trim()) {
      alert('Vui lòng nhập nội dung văn bản để chuyển thành giọng đọc.');
      return;
    }

    if (!user && ttsPointsCost > 0) {
      setErrorMsg('Vui lòng đăng nhập để sử dụng tính năng Chuyển văn bản thành âm thanh bằng Điểm Audio.');
      return;
    }

    if (!isAdmin && audioPoints < ttsPointsCost) {
      setErrorMsg(
        `Số dư Điểm Audio không đủ! Bạn cần ${ttsPointsCost} Điểm Audio để tạo giọng đọc AI (Hiện có: ${audioPoints.toLocaleString()} pts). Hãy tích lũy thêm điểm hoặc nạp VIP.`
      );
      return;
    }

    setIsProcessingTts(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setSynthProgressPercent(5);
    setSynthElapsedSec(0);

    const estimatedTime = Math.max(
      5, 
      Math.min(22, Math.round(text.length / 45) + (selectedAmbient !== 'none' ? 3 : 1) + 3)
    );
    setSynthEstimatedSec(estimatedTime);
    setSynthStageText('Đang phân tích cấu trúc văn bản & giọng đọc...');

    const startTime = Date.now();
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);

    synthTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setSynthElapsedSec(Math.floor(elapsed));

      const ratio = elapsed / estimatedTime;
      const calculatedPct = Math.min(94, Math.round(6 + ratio * 88));
      setSynthProgressPercent((prev) => Math.max(prev, calculatedPct));

      if (calculatedPct < 25) {
        setSynthStageText('1/4: Đang phân tích ngữ điệu và chuẩn hóa câu chữ...');
      } else if (calculatedPct < 60) {
        setSynthStageText('2/4: Gemini AI đang tổng hợp luồng giọng đọc...');
      } else if (calculatedPct < 85) {
        setSynthStageText(
          selectedAmbient !== 'none'
            ? '3/4: Đang hòa âm lớp nhạc nền Ambient...'
            : '3/4: Đang tối ưu bộ lọc âm thanh Studio...'
        );
      } else {
        setSynthStageText('4/4: Đang đóng gói Master WAV 24-bit...');
      }
    }, 100);

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const voiceObj = TTS_VOICES.find(v => v.id === selectedVoice) || TTS_VOICES[0];

    try {
      if (ttsPointsCost > 0 && user) {
        const deductResult = await deductAudioPoints(
          ttsPointsCost,
          `Chuyển văn bản thành giọng đọc AI: "${title.slice(0, 30)}..."`,
          'tts_synthesis'
        );

        if (!deductResult.success) {
          setErrorMsg(deductResult.message);
          setIsProcessingTts(false);
          if (synthTimerRef.current) clearInterval(synthTimerRef.current);
          return;
        }
      }

      const result = await generateGeminiSpeech({
        text: text.trim(),
        voiceName: voiceObj.geminiVoiceName,
        stylePrompt: speechStyle,
        ambientType: selectedAmbient,
        onProgress: (pct, stage) => {
          setSynthProgressPercent((prev) => Math.max(prev, pct));
          if (stage) setSynthStageText(stage);
        }
      });

      if (synthTimerRef.current) clearInterval(synthTimerRef.current);

      if (result && result.audioUrl) {
        setSynthProgressPercent(100);
        setSynthStageText('Hoàn tất 100%! Xuất bản ghi âm thành công.');
        setGeneratedAudioUrl(result.audioUrl);
        setAudioDuration(result.durationSec);
        setGenerationSource(result.source);
        setSuccessMsg(`Chuyển đổi hoàn tất 100%! ${ttsPointsCost > 0 ? `(Đã trừ -${ttsPointsCost} Điểm Audio)` : '(Miễn phí đặc quyền)'}`);
      } else {
        setErrorMsg('Có lỗi xảy ra khi chuyển văn bản thành giọng nói.');
      }
    } catch (err: any) {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      console.error('Synthesize audio error:', err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi chuyển văn bản thành giọng nói.');
    } finally {
      setIsProcessingTts(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current || !generatedAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.warn('Audio play error:', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const handleDownloadAudio = () => {
    if (!generatedAudioUrl) return;
    const a = document.createElement('a');
    a.href = generatedAudioUrl;
    a.download = `${title.replace(/\s+/g, '_')}_HaevyAudio.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePushToPublish = () => {
    if (!generatedAudioUrl) {
      alert('Vui lòng tạo âm thanh trước khi phát hành.');
      return;
    }

    if (onSendToPublish) {
      onSendToPublish({
        title,
        genre: selectedGenre,
        audioUrl: generatedAudioUrl,
        durationSec: audioDuration || 60,
        description: `Tác phẩm audio được sáng tạo bởi ${authorStageName || user?.displayName || 'Tác giả'} qua công nghệ Haevy AI Studio Voice.`,
        lyrics: text,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estSeconds = Math.round((wordCount / 130) * 60);

  return (
    <div 
      id="text-to-audio-studio-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="text-to-audio-studio-modal-content"
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg relative">
              <Mic size={24} className="text-amber-400" />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-lg sm:text-xl">
                  Haevy AI Voice Studio
                </h3>
                <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Zap size={11} className="text-yellow-400 fill-yellow-400" /> Chuyển Văn Bản Ra Âm Thanh
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1">
                  ⭐ VIP: 50 pts &amp; Master 24-bit
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Biến mọi bài viết, tiểu thuyết, podcast hoặc lời thơ thành tác phẩm âm thanh sống động chỉ trong tích tắc
              </p>
            </div>
          </div>

          <button
            id="close-tts-studio-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Preset Templates Bar */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-400" />
                Mẫu Kịch Bản Khởi Đầu Nhanh
              </span>
              <span className="text-[11px] text-zinc-500">Bấm để nạp sẵn kịch bản mẫu & giọng đọc tối ưu</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_SCRIPTS.map((preset, idx) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                        <IconComponent size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white truncate">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-400 group-hover:text-amber-300 truncate">
                      {preset.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Title & Textarea Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tiêu Đề Tác Phẩm Audio
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tên bài đọc, podcast, truyện..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Thể Loại Âm Thanh
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Podcast & Talk">Podcast & Talk</option>
                  <option value="Sách Nói & Radio">Sách Nói & Radio</option>
                  <option value="Truyện Tiên Hiệp & Kiếm Hiệp">Truyện Tiên Hiệp & Kiếm Hiệp</option>
                  <option value="Truyện Ma & Trinh Thám">Truyện Ma & Trinh Thám</option>
                  <option value="Truyện Ngôn Tình & Đô Thị">Truyện Ngôn Tình & Đô Thị</option>
                  <option value="Ambient & Zen">Ambient & Zen (Thiền Định / Ngủ)</option>
                  <option value="Lo-Fi Chill">Lo-Fi Chill & Lời Tự Sự</option>
                  <option value="Acoustic">Acoustic & Thơ Ca</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Text Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-400" />
                  Nội Dung Văn Bản Cần Đọc (Text-to-Speech)
                </label>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span>{wordCount} từ ({text.length} ký tự)</span>
                  <span>•</span>
                  <span>Ước tính: ~{Math.floor(estSeconds / 60)}p {estSeconds % 60}s</span>
                </div>
              </div>

              <textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập hoặc dán nội dung truyện, thơ, kịch bản podcast, tâm sự..."
                className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-y"
              />
            </div>
          </div>

          {/* Voice & Background Options */}
          <div className="space-y-4">
            {/* Voice Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Volume2 size={14} className="text-amber-400" />
                Chọn Giọng Đọc AI (Gemini Studio Voices)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TTS_VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedVoice === v.id
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                        : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-extrabold ${selectedVoice === v.id ? 'text-amber-300' : 'text-white'}`}>
                          {v.name}
                        </span>
                        {selectedVoice === v.id && (
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {v.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                      {v.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Background Music Mix */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Music size={14} className="text-amber-400" />
                Hòa Âm Nhạc Nền Không Gian (Ambient Mix)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AMBIENT_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSelectedAmbient(bg.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedAmbient === bg.id
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-200'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{bg.icon}</div>
                    <div>
                      <p className="text-xs font-bold truncate">{bg.name}</p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{bg.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Prompt Instruction */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Gợi ý cảm xúc đọc (Tùy chọn)
              </label>
              <input
                type="text"
                value={speechStyle}
                onChange={(e) => setSpeechStyle(e.target.value)}
                placeholder="VD: Giọng kể huyền bí, thì thầm trầm lắng, truyền cảm..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Real-time Percentage & Progress Bar Card */}
          {(isProcessingTts || (synthProgressPercent > 0 && synthProgressPercent < 100)) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-amber-500/50 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
              {/* Header: Percentage Badge, Title & Live Stage */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-xl border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <span className="font-black text-xs font-mono text-amber-300">
                      {synthProgressPercent}%
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-white">Đang Chuyển Văn Bản Thành Âm Thanh</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 animate-pulse">
                        Haevy Studio Pipeline
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                      {synthStageText || 'Đang xử lý dữ liệu âm thanh...'}
                    </p>
                  </div>
                </div>

                {/* Time Counters: Elapsed and Estimated Completion */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
                  <span>{synthElapsedSec}s</span>
                  <span className="text-zinc-500">/ ~{Math.max(synthElapsedSec + 1, synthEstimatedSec)}s</span>
                  <span className="text-[10px] text-amber-400 font-semibold ml-1">({synthProgressPercent}%)</span>
                </div>
              </div>

              {/* Primary Progress Bar with Gradient Glow */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-zinc-400">Tiến độ chuyển đổi âm thanh</span>
                  <span className="text-amber-300 font-mono text-xs font-black">{synthProgressPercent}%</span>
                </div>

                <div className="relative w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-150 relative shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    style={{ width: `${synthProgressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Generate TTS Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isProcessingTts || !text.trim()}
              onClick={handleSynthesizeAudio}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:brightness-110 disabled:opacity-50 text-black font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              {isProcessingTts ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang tổng hợp giọng nói AI và phối nhạc nền...</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>Chuyển Đổi Thành Âm Thanh {ttsPointsCost > 0 ? `(-${ttsPointsCost} pts)` : '(Miễn phí)'}</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Output Result Section */}
          {generatedAudioUrl && (
            <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-amber-500/40 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Đã Tạo Xong Bản Thu Âm Thanh!
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Thời lượng: {Math.floor(audioDuration / 60)}:{('0' + (audioDuration % 60)).slice(-2)} • {generationSource === 'gemini' ? 'Gemini Studio High-Res Audio' : 'Web Speech Synthesizer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadAudio}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Tải Về (.WAV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushToPublish}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Send size={14} />
                    <span>Đăng Lên Kho Audio</span>
                  </button>
                </div>
              </div>

              {/* Hidden HTML Audio */}
              <audio
                ref={audioRef}
                src={generatedAudioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
              />

              {/* Player Waveform UI */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-transform active:scale-90"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-black" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{Math.floor(playbackTime / 60)}:{('0' + Math.floor(playbackTime % 60)).slice(-2)}</span>
                    <span className="text-zinc-300 font-bold">{title}</span>
                    <span>{Math.floor(audioDuration / 60)}:{('0' + Math.floor(audioDuration % 60)).slice(-2)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div 
                    className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
                    onClick={(e) => {
                      if (!audioRef.current || !audioDuration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      const newTime = clickPos * audioDuration;
                      audioRef.current.currentTime = newTime;
                      setPlaybackTime(newTime);
                    }}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all rounded-full"
                      style={{ width: `${(playbackTime / (audioDuration || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
