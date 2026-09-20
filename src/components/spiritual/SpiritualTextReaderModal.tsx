import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  SkipForward, 
  SkipBack, 
  Sliders, 
  Type, 
  Radio, 
  Compass, 
  ChevronRight, 
  Bell,
  Maximize2,
  Minimize2,
  Bookmark,
  Layers,
  Edit3,
  FileText
} from 'lucide-react';
import { 
  spiritualTextReader, 
  TextParagraph, 
  TextSentence, 
  SpiritualSpeechVoice 
} from '../../utils/spiritualTextReader';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';
import { GoogleDocsExportModal } from '../google/GoogleDocsExportModal';
import { GoogleDocExportOptions } from '../../services/googleDocsService';

const SACRED_TEXT_PRESETS = [
  {
    id: 'bat_nha',
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh',
    category: 'soundscape' as const,
    content: `### ☸️ Bát Nhã Ba La Mật Đa Tâm Kinh (Prajñāpāramitā Hṛdaya)

Quán Tự Tại Bồ Tát hành thâm Bát nhã Ba la mật đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.

Xá Lợi Tử! Sắc bất dị không, không bất dị sắc, sắc tức thị không, không tức thị sắc, thụ tưởng hành thức diệc phục như thị.

Xá Lợi Tử! Thị chư pháp không tướng, bất sinh bất diệt, bất cấu bất tịnh, bất tăng bất giảm. Thị cố không trung vô sắc, vô thụ tưởng hành thức. Vô nhãn nhĩ tỷ thiệt thân ý, vô sắc thanh hương vị xúc pháp, vô nhãn giới nãi chí vô ý thức giới.

Vô vô minh, diệc vô vô minh tận, nãi chí vô lão tử, diệc vô lão tử tận. Vô khổ, tập, diệt, đạo. Vô trí diệc vô đắc, dĩ vô sở đắc cố.

Bồ đề tát đỏa y Bát nhã Ba la mật đa cố, tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết bàn.

Tam thế chư Phật, y Bát nhã Ba la mật đa cố, đắc A nậu đa la Tam miệu Tam bồ đề.

Cố tri Bát nhã Ba la mật đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.

Cố thuyết Bát nhã Ba la mật đa chú, tức thuyết chú viết:
> *Yết đế, yết đế, Ba la yết đế, Ba la tăng yết đế, Bồ đề tát bà ha.*`
  },
  {
    id: 'chu_dai_bi',
    title: 'Đại Bi Tâm Đà La Ni (Chú Đại Bi)',
    category: 'soundscape' as const,
    content: `### 🌸 Đại Bi Tâm Đà La Ni (Quán Thế Âm Bồ Tát Bản Nguyện)

Nam mô Hắc Ra Đát Na Đa Ra Dạ Da. Nam mô A Rị Da, Bà Lô Kiết Đế Thước Bát Ra Da, Bồ Đề Tát Đỏa Bà Da, Ma Ha Tát Đỏa Bà Da, Ma Ha Ca Lô Ni Ca Da.

Án, Tát Bàn Ra Phạt Duệ, Số Đát Na Đát Tỏa. Nam mô Tất Kiết Lật Đỏa Y Mông A Rị Da, Bà Lô Kiết Đế Thất Phật Ra Lăng Đà Bà.

Nam mô Na Ra Cẩn Trì, Hê Rị Ma Ha Bàn Đà Sa Mế, Tát Bà A Tha Đậu Thâu Bằng, A Thệ Dựng, Tát Bà Tát Đa, Na Ma Bà Tát Đa, Na Ma Bà Già, Ma Phạt Đạt Đậu.

Đát Điệt Tha: Án, A Bà Lô Hê, Lô Ca Đế, Ca Ra Đế, Di Hê Rị, Ma Ha Bồ Đề Tát Đỏa, Tát Bà Tát Bà, Ma Ra Ma Ra, Ma Hê Ma Hê, Rị Đà Dựng, Cu Lô Cu Lô Kiết Mông, Độ Lô Độ Lô Phạt Xà Da Đế, Ma Ha Phạt Xà Da Đế, Đà Ra Đà Ra, Địa Rị Ni, Thất Phật Ra Da.

Dữ tâm thanh tịnh, quán chiếu lòng từ bi vô lượng, hồi hướng bình an cho muôn loài.`
  },
  {
    id: 'thien_chanh_niem',
    title: 'Nghệ Thuật Thiền Định & An Trú Trong Hiện Tại',
    category: 'general' as const,
    content: `### 🌿 Nghệ Thuật Thiền Định & An Trú Trong Hiện Tại

Hít vào một hơi thật sâu, tôi biết tôi đang hít vào một nguồn năng lượng trong lành của vũ trụ.
Thở ra từ tốn, tôi mỉm cười và buông bỏ tất cả những căng thẳng, lo âu trong tâm trí.

Khi tâm ta tĩnh lặng như mặt hồ không gợn sóng, ta bắt đầu nhìn thấy vạn vật đúng như bản chất chân thật của chúng.
Mỗi khoảnh khắc của hiện tại đều là một món quà vô giá mà đất trời ban tặng.

Không nuối tiếc quá khứ, không âu lo tương lai.
Ngay tại đây và lúc này, tâm ta an định, tràn đầy lòng biết ơn và tình yêu thương đối với sự sống.`
  }
];

interface SpiritualTextReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  category?: 'tarot' | 'tuvi' | 'astrology' | 'couple' | 'soundscape' | 'general';
  contentMarkdown: string;
  onShare?: () => void;
}

type ReaderTheme = 'midnight' | 'parchment' | 'emerald';

export function SpiritualTextReaderModal({
  isOpen,
  onClose,
  title: initialTitle,
  subtitle: initialSubtitle,
  category = 'general',
  contentMarkdown: initialContentMarkdown,
  onShare
}: SpiritualTextReaderModalProps) {
  const [activeTitle, setActiveTitle] = useState(initialTitle);
  const [activeContent, setActiveContent] = useState(initialContentMarkdown);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
  const [parsedData, setParsedData] = useState<{ paragraphs: TextParagraph[]; sentences: TextSentence[] }>({
    paragraphs: [],
    sentences: []
  });

  // Custom text input mode
  const [isEditingCustomText, setIsEditingCustomText] = useState(false);
  const [customInputDraft, setCustomInputDraft] = useState('');
  const [customTitleDraft, setCustomTitleDraft] = useState('');

  // Reader Settings
  const [theme, setTheme] = useState<ReaderTheme>('midnight');
  const [fontSize, setFontSize] = useState<number>(22); // 16 to 34px large legible text
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isAmbientOn, setIsAmbientOn] = useState<boolean>(true);
  const [ambientFreq, setAmbientFreq] = useState<number>(528);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.12);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showTOC, setShowTOC] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpiritualSpeechVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Google Docs Export State
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);
  const [googleDocsExportOptions, setGoogleDocsExportOptions] = useState<GoogleDocExportOptions | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeSentenceRef = useRef<HTMLSpanElement | null>(null);

  // Sync initial content
  useEffect(() => {
    setActiveTitle(initialTitle);
    setActiveContent(initialContentMarkdown);
  }, [initialTitle, initialContentMarkdown]);

  // Parse text whenever content changes or modal opens
  useEffect(() => {
    if (isOpen && activeContent) {
      const data = spiritualTextReader.parseText(activeContent);
      setParsedData(data);
      setCurrentSentenceIdx(-1);
      setIsPlaying(false);
      setIsPaused(false);

      // Load available voices
      const voices = spiritualTextReader.getAvailableVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        setSelectedVoiceName(voices[0].name);
      }
    } else {
      spiritualTextReader.stop();
    }
  }, [isOpen, activeContent]);

  // Subscribe to speech engine events
  useEffect(() => {
    const unsubSentence = spiritualTextReader.onSentenceChange((idx) => {
      setCurrentSentenceIdx(idx);
    });

    const unsubState = spiritualTextReader.onStateChange((playing, paused) => {
      setIsPlaying(playing);
      setIsPaused(paused);
    });

    const unsubComplete = spiritualTextReader.onComplete(() => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIdx(-1);
    });

    const unsubVoices = spiritualTextReader.onVoicesLoaded((voices) => {
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceName) {
        const viVoice = voices.find(v => v.isVietnamese) || voices[0];
        setSelectedVoiceName(viVoice.name);
      }
    });

    return () => {
      unsubSentence();
      unsubState();
      unsubComplete();
      unsubVoices();
      spiritualTextReader.stop();
    };
  }, [selectedVoiceName]);

  // Keyboard Shortcuts (Space: Play/Pause, Left/Right: skip, Esc: Close)
  useEffect(() => {
    if (!isOpen || isEditingCustomText) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkipNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkipPrev();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        spiritualTextReader.stop();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditingCustomText, isPlaying, isPaused, currentSentenceIdx, parsedData]);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (isAutoScroll && currentSentenceIdx >= 0 && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSentenceIdx, isAutoScroll]);

  if (!isOpen) return null;

  // Toggle playback
  const handleTogglePlay = () => {
    haptics.impact('medium');
    if (isPlaying && !isPaused) {
      spiritualTextReader.pause();
    } else if (isPaused) {
      spiritualTextReader.resume();
    } else {
      const startIdx = currentSentenceIdx >= 0 ? currentSentenceIdx : 0;
      spiritualTextReader.start(startIdx);
    }
  };

  const handleSentenceClick = (sentenceId: number) => {
    haptics.selection();
    spiritualTextReader.jumpToSentence(sentenceId);
  };

  const handleSkipNext = () => {
    haptics.impact('light');
    if (currentSentenceIdx < parsedData.sentences.length - 1) {
      spiritualTextReader.jumpToSentence(currentSentenceIdx + 1);
    }
  };

  const handleSkipPrev = () => {
    haptics.impact('light');
    if (currentSentenceIdx > 0) {
      spiritualTextReader.jumpToSentence(currentSentenceIdx - 1);
    }
  };

  const handleResetAudio = () => {
    haptics.impact('medium');
    spiritualTextReader.stop();
    setCurrentSentenceIdx(-1);
  };

  const handleRateChange = (newRate: number) => {
    haptics.selection();
    setSpeechRate(newRate);
    spiritualTextReader.setRate(newRate);
  };

  const handleToggleAmbient = () => {
    haptics.selection();
    const next = !isAmbientOn;
    setIsAmbientOn(next);
    spiritualTextReader.setAmbientSound(next, ambientFreq, ambientVolume);
  };

  const handleChangeAmbientFreq = (freq: number) => {
    haptics.selection();
    setAmbientFreq(freq);
    spiritualTextReader.setAmbientSound(isAmbientOn, freq, ambientVolume);
  };

  const handleVoiceChange = (voiceName: string) => {
    haptics.selection();
    setSelectedVoiceName(voiceName);
    const found = availableVoices.find(v => v.name === voiceName);
    if (found) {
      spiritualTextReader.setVoice(found.nativeVoice);
    }
  };

  const handleCopyText = async () => {
    haptics.success();
    try {
      await navigator.clipboard.writeText(activeContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadText = () => {
    haptics.impact('medium');
    const blob = new Blob([activeContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTitle.replace(/\s+/g, '_')}_HaevySpiritual.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleDocsExport = () => {
    haptics.impact('light');
    setGoogleDocsExportOptions({
      title: activeTitle || 'Văn Bản Tri Thức Tâm Linh - Haevy',
      contentMarkdown: activeContent,
      category: category,
      categoryLabel: `Haevy Tâm Linh - ${category.toUpperCase()}`,
      tags: ['HaevyTamLinh', category, 'TriThucHuyenHoc'],
      summary: initialSubtitle || 'Trích xuất văn bản tâm linh và thông điệp vũ trụ từ Haevy Spiritual.',
      sourceApp: 'haevy_spiritual'
    });
    setIsGoogleDocsModalOpen(true);
  };

  const handleApplyCustomText = () => {
    if (!customInputDraft.trim()) return;
    haptics.success();
    spiritualAudio.playTempleBell();
    setActiveTitle(customTitleDraft.trim() || 'Văn Bản Tâm Linh Tùy Chỉnh');
    setActiveContent(customInputDraft);
    setIsEditingCustomText(false);
  };

  const handleSelectPreset = (preset: typeof SACRED_TEXT_PRESETS[0]) => {
    haptics.impact('medium');
    spiritualAudio.playCrystalResonance();
    setActiveTitle(preset.title);
    setActiveContent(preset.content);
    setIsEditingCustomText(false);
  };

  // Extract headings for Table of Contents
  const headings = parsedData.paragraphs.filter(p => p.isHeading);

  // Approximate total reading time
  const totalWords = activeContent.split(/\s+/).length;
  const estimatedMinutes = Math.max(1, Math.ceil(totalWords / 160));

  // Visual Theme Classes
  const themeClasses = {
    midnight: {
      bg: 'bg-zinc-950',
      text: 'text-zinc-200',
      subtext: 'text-zinc-400',
      panel: 'bg-zinc-900/95 border-amber-500/20 shadow-2xl backdrop-blur-xl',
      card: 'bg-zinc-950/80 border-zinc-800',
      activeSentence: 'bg-amber-500/25 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] rounded-md px-1 py-0.5 border-b border-amber-400',
      heading: 'text-amber-400 font-bold',
      quote: 'border-l-4 border-amber-500 bg-amber-950/30 text-amber-200 italic pl-4 py-2 my-3 rounded-r-lg',
      accent: 'text-amber-400',
      buttonGlow: 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20'
    },
    parchment: {
      bg: 'bg-[#1c1813]',
      text: 'text-[#f5ebd7]',
      subtext: 'text-[#c2b299]',
      panel: 'bg-[#29221a]/95 border-[#8c6b3e]/30 shadow-2xl backdrop-blur-xl',
      card: 'bg-[#241e17] border-[#5e482b]/50',
      activeSentence: 'bg-[#d4af37]/25 text-[#fff8eb] shadow-[0_0_15px_rgba(212,175,55,0.3)] rounded-md px-1 py-0.5 border-b border-[#d4af37]',
      heading: 'text-[#e5c158] font-bold',
      quote: 'border-l-4 border-[#d4af37] bg-[#3a2d1f]/40 text-[#ebd4a0] italic pl-4 py-2 my-3 rounded-r-lg',
      accent: 'text-[#e5c158]',
      buttonGlow: 'bg-gradient-to-r from-[#d4af37] to-[#b89128] text-zinc-950 shadow-lg shadow-[#d4af37]/20'
    },
    emerald: {
      bg: 'bg-[#091512]',
      text: 'text-emerald-50',
      subtext: 'text-emerald-300/70',
      panel: 'bg-[#0e211d]/95 border-emerald-500/30 shadow-2xl backdrop-blur-xl',
      card: 'bg-[#0c1c18] border-emerald-900/60',
      activeSentence: 'bg-emerald-500/25 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-md px-1 py-0.5 border-b border-emerald-400',
      heading: 'text-emerald-300 font-semibold',
      quote: 'border-l-4 border-emerald-500 bg-emerald-950/40 text-emerald-200 italic pl-4 py-2 my-3 rounded-r-lg',
      accent: 'text-emerald-400',
      buttonGlow: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
    }
  }[theme];

  const categoryBadges = {
    tarot: { icon: '🔮', label: 'Luận Giải Tarot Vũ Trụ', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30' },
    tuvi: { icon: '📜', label: 'Tử Vi Đẩu Số & Vận Mệnh', color: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30' },
    astrology: { icon: '🌌', label: 'Chiêm Tinh & Cung Hoàng Đạo', color: 'from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30' },
    couple: { icon: '💖', label: 'Tình Duyên & Hòa Hợp Tâm Hồn', color: 'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30' },
    soundscape: { icon: '🔔', label: 'Tần Số Chữa Lành & Chuông Xoay', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
    general: { icon: '✨', label: 'Haevy Tâm Linh Chuẩn Xác', color: 'from-amber-500/20 to-amber-600/20 text-amber-300 border-amber-500/30' }
  }[category];

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md bg-black/80 animate-fadeIn ${themeClasses.bg}`}>
      <div 
        id="spiritual-text-reader-modal"
        className={`w-full flex flex-col rounded-3xl border ${themeClasses.panel} overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-full max-h-screen rounded-none' : 'max-w-5xl h-[92vh] max-h-[920px]'
        }`}
      >
        {/* ========================================== */}
        {/* TOP BAR: HEADER & CONTROLS */}
        {/* ========================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-xl shadow-inner">
              {categoryBadges.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border bg-gradient-to-r ${categoryBadges.color}`}>
                  {categoryBadges.label}
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline-flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  ~{estimatedMinutes} phút đọc ({totalWords} từ)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[240px] sm:max-w-md md:max-w-lg mt-0.5">
                {activeTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Custom text paste/edit toggle */}
            <button
              id="btn_reader_custom_text_toggle"
              onClick={() => {
                haptics.selection();
                setCustomTitleDraft(activeTitle);
                setCustomInputDraft(activeContent);
                setIsEditingCustomText(!isEditingCustomText);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all border text-xs font-bold flex items-center gap-1.5 ${
                isEditingCustomText 
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md' 
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
              title="Dán văn bản dài hoặc chọn kinh điển mẫu"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nhập Văn Bản</span>
            </button>

            {/* Table of contents toggle */}
            {headings.length > 0 && !isEditingCustomText && (
              <button
                id="btn_toc_toggle"
                onClick={() => {
                  haptics.selection();
                  setShowTOC(!showTOC);
                }}
                className={`p-2 rounded-xl transition-all border ${showTOC ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'}`}
                title="Mục Lục Nhanh"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Settings Drawer Toggle */}
            <button
              id="btn_settings_drawer_toggle"
              onClick={() => {
                haptics.selection();
                setShowSettingsDrawer(!showSettingsDrawer);
              }}
              className={`p-2 rounded-xl transition-all border ${showSettingsDrawer ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'}`}
              title="Tùy Chỉnh Giọng Đọc & Giao Diện"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Copy Button */}
            <button
              id="btn_copy_reading_text"
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all"
              title="Sao chép toàn bộ văn bản"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <button
              id="btn_download_reading_file"
              onClick={handleDownloadText}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all hidden sm:flex"
              title="Tải tệp văn bản (.md)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Google Docs Export Button */}
            <button
              id="btn_export_docs_reading_modal"
              onClick={handleOpenGoogleDocsExport}
              className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Xuất sang Google Docs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Xuất Docs</span>
            </button>

            {/* Share Button if available */}
            {onShare && (
              <button
                id="btn_share_reading_modal"
                onClick={() => {
                  haptics.impact('light');
                  onShare();
                }}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all hidden sm:flex items-center gap-1.5 text-xs font-medium"
              >
                <Share2 className="w-3.5 h-3.5" />
                Chia sẻ
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              id="btn_fullscreen_reading_toggle"
              onClick={() => {
                haptics.selection();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-all hidden md:flex"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              id="btn_close_reading_modal"
              onClick={() => {
                haptics.impact('light');
                spiritualTextReader.stop();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* AUDIO PLAYER BAR (PERSISTENT TOP CONTROL) */}
        {/* ========================================== */}
        <div className="bg-gradient-to-r from-black/60 via-zinc-950/80 to-black/60 border-b border-white/10 px-4 sm:px-6 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Main Controls: Play/Pause, Prev, Next, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn_reader_toggle_play"
              onClick={handleTogglePlay}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all transform active:scale-95 cursor-pointer ${
                isPlaying && !isPaused
                  ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300 animate-pulse'
                  : themeClasses.buttonGlow
              }`}
            >
              {isPlaying && !isPaused ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm dừng đọc</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Tiếp tục đọc</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>🎙️ Nghe Đọc Giọng AI</span>
                </>
              )}
            </button>

            <button
              id="btn_reader_skip_prev"
              onClick={handleSkipPrev}
              disabled={currentSentenceIdx <= 0}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Câu trước đó (Phím ←)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="btn_reader_skip_next"
              onClick={handleSkipNext}
              disabled={currentSentenceIdx >= parsedData.sentences.length - 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Câu kế tiếp (Phím →)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              id="btn_reader_reset_audio"
              onClick={handleResetAudio}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all hidden sm:flex cursor-pointer"
              title="Dừng và đọc lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audio Progress & Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Speed Quick Selector */}
            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateChange(speed)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    speechRate === speed 
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Solfeggio Healing Ambient Sound Toggle */}
            <button
              id="btn_reader_toggle_ambient"
              onClick={handleToggleAmbient}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isAmbientOn
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
              title="Bật/Tắt sóng tần số Solfeggio 528Hz chữa lành nền"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Sóng 528Hz</span>
              <span className="md:hidden">528Hz</span>
            </button>

            {/* Sentence Progress Indicator */}
            {parsedData.sentences.length > 0 && (
              <div className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 hidden sm:block">
                {currentSentenceIdx >= 0 ? `${currentSentenceIdx + 1}/${parsedData.sentences.length}` : `0/${parsedData.sentences.length}`} câu
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* MAIN BODY: TOC + CONTENT / EDITOR + SETTINGS */}
        {/* ========================================== */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* 1. TABLE OF CONTENTS SIDEBAR (COLLAPSIBLE) */}
          {showTOC && headings.length > 0 && !isEditingCustomText && (
            <div className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl p-4 overflow-y-auto shrink-0 animate-fadeIn z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  Mục Lục Đoạn
                </span>
                <button 
                  onClick={() => setShowTOC(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col space-y-1 mt-2">
                {headings.map((h) => {
                  const headingText = h.rawText.replace(/^#+\s*/, '');
                  const firstSentence = h.sentences[0];
                  return (
                    <button
                      key={h.id}
                      onClick={() => {
                        haptics.selection();
                        if (firstSentence) {
                          handleSentenceClick(firstSentence.id);
                        }
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/10 truncate cursor-pointer ${
                        currentSentenceIdx >= 0 && firstSentence && currentSentenceIdx >= firstSentence.id && currentSentenceIdx < firstSentence.id + 10
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                          : 'text-zinc-300'
                      }`}
                    >
                      {headingText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SETTINGS DRAWER (COLLAPSIBLE) */}
          {showSettingsDrawer && (
            <div className="w-80 border-r border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-5 overflow-y-auto shrink-0 animate-fadeIn z-20 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Cấu Hình Trải Nghiệm Đọc
                </span>
                <button 
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theme selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Giao Diện Không Gian</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      haptics.selection();
                      setTheme('midnight');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'midnight'
                        ? 'bg-zinc-900 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-950 border border-amber-400 mx-auto mb-1" />
                    <span className="text-[11px] font-medium block">Màn Đêm</span>
                  </button>

                  <button
                    onClick={() => {
                      haptics.selection();
                      setTheme('parchment');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'parchment'
                        ? 'bg-[#29221a] border-[#e5c158] text-[#e5c158] ring-1 ring-[#e5c158]/50'
                        : 'bg-[#1e1913] border-[#3d3122] text-zinc-400 hover:bg-[#29221a]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#3a2d1f] border border-[#e5c158] mx-auto mb-1" />
                    <span className="text-[11px] font-medium block">Cổ Kinh</span>
                  </button>

                  <button
                    onClick={() => {
                      haptics.selection();
                      setTheme('emerald');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === 'emerald'
                        ? 'bg-[#0e211d] border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-[#091512] border-emerald-950 text-zinc-400 hover:bg-[#0e211d]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] font-medium block">Ngọc Bích</span>
                  </button>
                </div>
              </div>

              {/* Font Size & Family */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">Cỡ Chữ Đọc</label>
                  <span className="text-xs font-bold text-amber-400">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(s => Math.max(14, s - 2))}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:bg-white/10 cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="26"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => setFontSize(s => Math.min(26, s + 2))}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:bg-white/10 cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Font Style */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Kiểu Chữ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`py-2 px-3 rounded-xl border text-xs font-serif transition-all cursor-pointer ${
                      fontFamily === 'serif'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    Chữ Cổ Điển (Serif)
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`py-2 px-3 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
                      fontFamily === 'sans'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    Chữ Hiện Đại (Sans)
                  </button>
                </div>
              </div>

              {/* Voice Selector */}
              {availableVoices.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Giọng Đọc Hệ Thống</label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Solfeggio Frequency Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Tần Số Chữa Lành Nền</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { freq: 528, label: '528Hz (Chuyển Hóa)' },
                    { freq: 432, label: '432Hz (Vũ Trụ)' },
                    { freq: 639, label: '639Hz (Trái Tim)' },
                    { freq: 963, label: '963Hz (Luân Xa 7)' }
                  ].map((item) => (
                    <button
                      key={item.freq}
                      onClick={() => handleChangeAmbientFreq(item.freq)}
                      className={`text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                        ambientFreq === item.freq && isAmbientOn
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Scroll Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-zinc-300">Tự động cuộn theo giọng</span>
                <input
                  type="checkbox"
                  checked={isAutoScroll}
                  onChange={(e) => setIsAutoScroll(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Keyboard shortcuts tips */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-zinc-400">
                <div className="font-bold text-amber-300">Phím Tắt Đọc Nhanh:</div>
                <div className="flex justify-between">
                  <span>Phát / Tạm dừng:</span>
                  <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Space</span>
                </div>
                <div className="flex justify-between">
                  <span>Câu kế tiếp / trước:</span>
                  <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">← / →</span>
                </div>
                <div className="flex justify-between">
                  <span>Đóng cửa sổ:</span>
                  <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Esc</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. CUSTOM TEXT INPUT / PRESETS MODE */}
          {isEditingCustomText ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 animate-fadeIn">
              <div className="max-w-3xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      Nhập / Dán Văn Bản Dài Cần Đọc
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Hỗ trợ toàn bộ văn bản dài, kinh điển, bài luận giải hoặc các câu thần chú tâm linh
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditingCustomText(false)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preset Fast Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Hoặc chọn nhanh bài kinh điển mẫu:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SACRED_TEXT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                      >
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 block mb-1">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Bấm để nạp và đọc ngay
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Tiêu đề bài đọc:
                    </label>
                    <input
                      type="text"
                      value={customTitleDraft}
                      onChange={(e) => setCustomTitleDraft(e.target.value)}
                      placeholder="Nhập tiêu đề tài liệu..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Nội dung văn bản (Markdown hoặc văn bản thô):
                    </label>
                    <textarea
                      rows={12}
                      value={customInputDraft}
                      onChange={(e) => setCustomInputDraft(e.target.value)}
                      placeholder="Dán hoặc soạn thảo văn bản dài tại đây..."
                      className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-zinc-200 text-sm focus:border-amber-400 outline-none leading-relaxed font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsEditingCustomText(false)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleApplyCustomText}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      Bắt Đầu Đọc Văn Bản Này
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 4. CENTER CONTENT SCROLLABLE CANVAS */
            <div 
              ref={containerRef}
              className={`flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-8 scroll-smooth transition-all ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {/* Decorative Header Banner inside text */}
                <div className="text-center space-y-2 pt-2 pb-6 border-b border-white/10">
                  <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase font-sans">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Haevy Spiritual Master Edition
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${themeClasses.heading} tracking-tight`}>
                    {activeTitle}
                  </h1>
                  {initialSubtitle && (
                    <p className={`text-sm sm:text-base ${themeClasses.subtext} font-sans max-w-xl mx-auto italic`}>
                      {initialSubtitle}
                    </p>
                  )}
                </div>

                {/* Render Structured Paragraphs */}
                <div 
                  className="space-y-4"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                >
                  {parsedData.paragraphs.map((para) => {
                    if (para.isHeading) {
                      const headingText = para.rawText.replace(/^#+\s*/, '');
                      return (
                        <h2 
                          key={para.id} 
                          className={`pt-6 pb-2 text-xl sm:text-2xl font-bold ${themeClasses.heading} border-b border-white/10 flex items-center gap-2`}
                        >
                          <span className="text-amber-400">❖</span>
                          {headingText}
                        </h2>
                      );
                    }

                    if (para.isQuote) {
                      return (
                        <blockquote key={para.id} className={themeClasses.quote}>
                          {para.sentences.map((sent) => {
                            const isActive = currentSentenceIdx === sent.id;
                            return (
                              <span
                                key={sent.id}
                                ref={isActive ? activeSentenceRef : null}
                                onClick={() => handleSentenceClick(sent.id)}
                                className={`cursor-pointer transition-all duration-200 ${
                                  isActive ? themeClasses.activeSentence : 'hover:opacity-80'
                                }`}
                                title="Bấm để nghe từ câu này"
                              >
                                {sent.text}{' '}
                              </span>
                            );
                          })}
                        </blockquote>
                      );
                    }

                    return (
                      <p key={para.id} className={`${themeClasses.text} leading-relaxed my-3`}>
                        {para.sentences.map((sent) => {
                          const isActive = currentSentenceIdx === sent.id;
                          return (
                            <span
                              key={sent.id}
                              ref={isActive ? activeSentenceRef : null}
                              onClick={() => handleSentenceClick(sent.id)}
                              className={`cursor-pointer transition-all duration-200 ${
                                isActive ? themeClasses.activeSentence : 'hover:underline decoration-amber-500/30'
                              }`}
                              title="Bấm để nghe từ câu này"
                            >
                              {sent.text}{' '}
                            </span>
                          );
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* End of Scripture Blessing */}
                <div className="pt-10 pb-6 text-center border-t border-white/10 space-y-2 font-sans">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-3" />
                  <p className="text-xs text-amber-400/80 uppercase tracking-widest font-semibold">
                    Tâm Thành Tắc Ứng • Vạn Sự Tùy Duyên
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    © 2026 Haevy Ecosystem • Bản quyền giải thuật tâm linh & tần số âm thanh
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Docs Export Modal */}
      <GoogleDocsExportModal
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
        options={googleDocsExportOptions}
      />
    </div>
  );
}
