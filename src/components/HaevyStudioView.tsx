import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Headphones, 
  Heart, 
  Crown, 
  Layers, 
  Mic, 
  Volume2, 
  Download, 
  Upload, 
  Wand2, 
  Sliders, 
  FileText, 
  CreditCard, 
  Mail, 
  Phone, 
  RotateCcw, 
  Compass, 
  HeartHandshake, 
  Ghost, 
  Moon, 
  Zap, 
  BookOpen, 
  UserCheck, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  ArrowRight, 
  Music, 
  Plus, 
  Radio, 
  Copy, 
  ExternalLink,
  Gift,
  Coins,
  Activity
} from 'lucide-react';
import { 
  TTS_VOICES, 
  AMBIENT_BACKGROUNDS, 
  generateGeminiSpeech, 
  TtsVoiceOption,
  AmbientBackgroundOption
} from '../services/ttsService';
import { useAuth } from '../context/AuthContext';
import { Track } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HaevyStudioViewProps {
  activeSubTab?: 'page1' | 'page2' | 'page3';
  onSelectSubTab?: (subTab: 'page1' | 'page2' | 'page3') => void;
  onSelectTrack?: (track: Track) => void;
  onPlayTrack?: (track: Track) => void;
  onOpenAuth?: () => void;
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

export const STUDIO_TTS_DRAFT_KEY = 'haevy_studio_tts_draft';

export interface StudioTtsDraft {
  ttsTitle: string;
  ttsText: string;
  ttsGenre: string;
  selectedVoice: string;
  selectedAmbient: string;
  stylePrompt: string;
  lastUpdated: number;
}

function getSavedStudioTtsDraft(): StudioTtsDraft | null {
  try {
    const saved = localStorage.getItem(STUDIO_TTS_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && typeof parsed.ttsText === 'string') {
        return parsed as StudioTtsDraft;
      }
    }
  } catch (e) {
    console.warn('Error reading Haevy Studio TTS draft from localStorage:', e);
  }
  return null;
}

export function HaevyStudioView({
  activeSubTab = 'page1',
  onSelectSubTab,
  onSelectTrack,
  onPlayTrack,
  onOpenAuth
}: HaevyStudioViewProps) {
  const handlePlaySelectedTrack = (track: Track) => {
    if (onPlayTrack) {
      onPlayTrack(track);
    } else if (onSelectTrack) {
      onSelectTrack(track);
    }
  };
  const { 
    user, 
    isAdmin, 
    isVip,
    audioPoints,
    isAuthorVerified, 
    authorStatus, 
    authorStageName, 
    authorBio,
    authorVerificationData,
    publishAuthorTrack,
    deleteAuthorTrack,
    submitAuthorVerification,
    deductAudioPoints,
    addAudioPoints
  } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // 1. STATE: MY TRACKS & STATS
  // ==========================================
  const [myTracks, setMyTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingTracks(true);
    const q = query(
      collection(db, 'customTracks'),
      where('addedBy', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Track[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            id: `custom-${doc.id}`,
            title: d.title || 'Tác phẩm Audio',
            artist: d.artist || authorStageName || user.displayName || 'Tác giả',
            genre: d.genre || 'Khác',
            url: d.url,
            coverUrl: d.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
            durationSec: d.durationSec || 210,
            plays: d.plays || 0,
            likesCount: d.likesCount || 0,
            isVipOnly: d.isVipOnly || false,
            bitrate: d.bitrate || '320kbps Hi-Fi',
            description: d.description || '',
            lyrics: d.lyrics || '',
            isAuthorVerified: Boolean(d.isAuthorVerified),
            stageName: d.stageName || authorStageName,
            addedBy: d.addedBy,
            addedByName: d.addedByName,
            createdAt: d.createdAt,
          });
        });
        list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        setMyTracks(list);
        setLoadingTracks(false);
      },
      (err) => {
        console.error('Error fetching author tracks:', err);
        setLoadingTracks(false);
      }
    );

    return () => unsubscribe();
  }, [user, authorStageName]);

  const handleDeleteTrack = async (trackId: string, trackTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tác phẩm "${trackTitle}" khỏi hệ thống không?`)) {
      return;
    }
    setDeletingId(trackId);
    await deleteAuthorTrack(trackId);
    setDeletingId(null);
    showToast(`Đã xóa tác phẩm "${trackTitle}".`);
  };

  const handleCopyTrackLink = (track: Track) => {
    const link = `${window.location.origin}/?track=${encodeURIComponent(track.id)}`;
    navigator.clipboard.writeText(link);
    setCopiedTrackId(track.id);
    showToast('Đã sao chép liên kết chia sẻ tác phẩm!');
    setTimeout(() => setCopiedTrackId(null), 2500);
  };

  const totalPlays = myTracks.reduce((acc, t) => acc + (t.plays || 0), 0);
  const totalLikes = myTracks.reduce((acc, t) => acc + (t.likesCount || 0), 0);

  // ==========================================
  // 2. STATE: AI VOICE STUDIO (TEXT-TO-AUDIO)
  // Local persistence for draft prompt in Haevy Studio
  // ==========================================
  const initialDraftRef = useRef<StudioTtsDraft | null>(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = getSavedStudioTtsDraft();
  }

  const [ttsTitle, setTtsTitle] = useState<string>(() => initialDraftRef.current?.ttsTitle || 'Bản Đọc Âm Thanh Mới');
  const [ttsText, setTtsText] = useState<string>(() => initialDraftRef.current?.ttsText || PRESET_SCRIPTS[1].text);
  const [ttsGenre, setTtsGenre] = useState<string>(() => initialDraftRef.current?.ttsGenre || PRESET_SCRIPTS[1].genre);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => initialDraftRef.current?.selectedVoice || 'Kore');
  const [selectedAmbient, setSelectedAmbient] = useState<string>(() => initialDraftRef.current?.selectedAmbient || 'piano');
  const [stylePrompt, setStylePrompt] = useState<string>(() => initialDraftRef.current?.stylePrompt || '');
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(() => initialDraftRef.current?.lastUpdated || null);

  // Auto-save TTS draft prompt to localStorage whenever inputs change
  useEffect(() => {
    try {
      const now = Date.now();
      const draft: StudioTtsDraft = {
        ttsTitle,
        ttsText,
        ttsGenre,
        selectedVoice,
        selectedAmbient,
        stylePrompt,
        lastUpdated: now
      };
      localStorage.setItem(STUDIO_TTS_DRAFT_KEY, JSON.stringify(draft));
      setDraftSavedAt(now);
    } catch (e) {
      console.warn('Error persisting Haevy Studio TTS draft:', e);
    }
  }, [ttsTitle, ttsText, ttsGenre, selectedVoice, selectedAmbient, stylePrompt]);

  // Reset current draft back to default preset
  const handleResetDraftToDefault = () => {
    const defaultPreset = PRESET_SCRIPTS[1];
    setTtsTitle('Bản Đọc Âm Thanh Mới');
    setTtsText(defaultPreset.text);
    setTtsGenre(defaultPreset.genre);
    setSelectedVoice('Kore');
    setSelectedAmbient('piano');
    setStylePrompt('');
    try {
      localStorage.removeItem(STUDIO_TTS_DRAFT_KEY);
    } catch (e) {}
    showToast('Đã đặt lại bản nháp văn bản về mặc định!');
  };

  // TTS Output & Real-time Synthesis Progress Tracking
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthProgressPercent, setSynthProgressPercent] = useState<number>(0);
  const [synthStageText, setSynthStageText] = useState<string>('');
  const [synthElapsedSec, setSynthElapsedSec] = useState<number>(0);
  const [synthEstimatedSec, setSynthEstimatedSec] = useState<number>(0);
  const synthTimerRef = useRef<any>(null);

  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsDurationSec, setTtsDurationSec] = useState<number>(0);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsSuccess, setTtsSuccess] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up synthesis interval on unmount
  useEffect(() => {
    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, []);

  // Fee for TTS Audio Synthesis (Points) (VIP: 50 pts, Regular: 75 pts, Admin: 0 pts)
  const ttsPointsCost = isAdmin ? 0 : isVip ? 50 : 75;

  // Handle Speech Synthesis with Real-Time Progress (%) & Time Estimation
  const handleSynthesizeSpeech = async () => {
    if (!ttsText.trim()) {
      setTtsError('Vui lòng nhập nội dung văn bản cần chuyển thành âm thanh.');
      return;
    }

    if (!user && ttsPointsCost > 0) {
      setTtsError('Vui lòng đăng nhập để sử dụng tính năng Chuyển văn bản thành âm thanh bằng Điểm Audio.');
      return;
    }

    if (!isAdmin && audioPoints < ttsPointsCost) {
      setTtsError(
        `Số dư Điểm Audio không đủ! Bạn cần ${ttsPointsCost} Điểm Audio để tạo giọng đọc AI (Hiện có: ${audioPoints.toLocaleString()} pts). Hãy điểm danh hoặc nghe nhạc để tích lũy thêm điểm.`
      );
      return;
    }

    setIsSynthesizing(true);
    setTtsError(null);
    setTtsSuccess(null);
    setSynthProgressPercent(5);
    setSynthElapsedSec(0);

    // Calculate intelligent estimated time (in seconds)
    const estimatedTime = Math.max(
      5, 
      Math.min(22, Math.round(ttsText.length / 45) + (selectedAmbient !== 'none' ? 3 : 1) + 3)
    );
    setSynthEstimatedSec(estimatedTime);
    setSynthStageText('Đang phân tích cấu trúc văn bản & ngữ điệu giọng đọc...');

    const startTime = Date.now();
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);

    synthTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const elapsedFloor = Math.floor(elapsed);
      setSynthElapsedSec(elapsedFloor);

      // Smooth progression up to 94% before server finishes
      const ratio = elapsed / estimatedTime;
      const calculatedPct = Math.min(94, Math.round(6 + ratio * 88));
      
      setSynthProgressPercent((prev) => Math.max(prev, calculatedPct));

      if (calculatedPct < 25) {
        setSynthStageText('1/4: Đang phân tích ngữ điệu và chuẩn hóa câu chữ...');
      } else if (calculatedPct < 60) {
        setSynthStageText('2/4: Gemini AI đang tổng hợp luồng giọng đọc Lossless Hi-Fi...');
      } else if (calculatedPct < 85) {
        setSynthStageText(
          selectedAmbient !== 'none'
            ? '3/4: Đang hòa âm lớp nhạc nền Ambient & Stereo Space...'
            : '3/4: Đang tối ưu bộ lọc âm thanh Studio & khử tạp âm...'
        );
      } else {
        setSynthStageText('4/4: Đang đóng gói Master WAV 24-bit và kiểm tra chất lượng...');
      }
    }, 100);

    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      setIsPlayingTts(false);
    }

    let pointsDeducted = false;

    try {
      if (ttsPointsCost > 0 && user) {
        const deductResult = await deductAudioPoints(
          ttsPointsCost,
          `Chuyển văn bản thành giọng đọc AI: "${ttsTitle.slice(0, 30)}..."`,
          'tts_synthesis'
        );

        if (!deductResult.success) {
          setTtsError(deductResult.message);
          setIsSynthesizing(false);
          if (synthTimerRef.current) clearInterval(synthTimerRef.current);
          return;
        }
        pointsDeducted = true;
      }

      const result = await generateGeminiSpeech({
        text: ttsText,
        voiceName: selectedVoice,
        stylePrompt,
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
        setTtsAudioUrl(result.audioUrl);
        setTtsDurationSec(result.durationSec);
        setTtsSuccess(
          `Chuyển đổi hoàn tất 100%! ${ttsPointsCost > 0 ? `(Đã trừ -${ttsPointsCost} Điểm Audio).` : '(Miễn phí Quản trị viên).'} Thời lượng ~${result.durationSec}s. Hãy nghe thử hoặc nhấn "Đăng Lên Kho Audio".`
        );
        showToast('🎉 Tạo âm thanh AI hoàn tất 100%!');
      } else {
        if (pointsDeducted && ttsPointsCost > 0) {
          await addAudioPoints(ttsPointsCost, 'Hoàn điểm do lỗi tổng hợp âm thanh', 'bonus');
        }
        setTtsError('Lỗi khi tạo file âm thanh. Điểm Audio đã được hoàn lại.');
      }
    } catch (err: any) {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (pointsDeducted && ttsPointsCost > 0) {
        try {
          await addAudioPoints(ttsPointsCost, 'Hoàn điểm do lỗi kết nối tổng hợp âm thanh', 'bonus');
        } catch (refundErr) {
          console.error('Error refunding points:', refundErr);
        }
      }
      setTtsError((err.message || 'Đã có lỗi xảy ra khi tạo giọng đọc.') + (pointsDeducted ? ' (Đã hoàn lại Điểm Audio).' : ''));
    } finally {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      setTimeout(() => {
        setIsSynthesizing(false);
      }, 500);
    }
  };

  // Toggle TTS Audio Playback
  const handleToggleTtsPlay = () => {
    if (!ttsAudioUrl) return;
    if (!ttsAudioRef.current) {
      const audio = new Audio(ttsAudioUrl);
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setTtsProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setIsPlayingTts(false);
        setTtsProgress(0);
      };
      ttsAudioRef.current = audio;
    }

    if (isPlayingTts) {
      ttsAudioRef.current.pause();
      setIsPlayingTts(false);
    } else {
      ttsAudioRef.current.play().catch(console.error);
      setIsPlayingTts(true);
    }
  };

  // Download TTS Audio WAV
  const handleDownloadTtsWav = () => {
    if (!ttsAudioUrl) return;
    const a = document.createElement('a');
    a.href = ttsAudioUrl;
    a.download = `${ttsTitle.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}_haevy_studio.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Đang tải file âm thanh WAV...');
  };

  // 1-Click Send from TTS to Page 3 Publish Form
  const handleSendTtsToPublish = () => {
    if (!ttsAudioUrl) return;
    setPubTitle(ttsTitle);
    setPubGenre(ttsGenre);
    setPubAudioUrl(ttsAudioUrl);
    setPubAudioFileName(`${ttsTitle}.wav (Từ Haevy AI Studio)`);
    setPubDurationSec(ttsDurationSec || 180);
    setPubLyrics(ttsText);
    setPubDescription(`Tác phẩm giọng đọc AI truyền cảm, sáng tác bởi Haevy Studio với giọng ${selectedVoice}.`);
    setPubSuccessMsg(null);
    setPubErrorMsg(null);
    setShowPublishForm(true);
    if (onSelectSubTab) onSelectSubTab('page3');
    showToast('Đã chuyển bản ghi âm sang Trang 3 để phát hành!');
  };

  // ==========================================
  // 3. STATE: PUBLISH AUDIO
  // ==========================================
  const [pubTitle, setPubTitle] = useState('');
  const [pubArtist, setPubArtist] = useState('');
  const [pubGenre, setPubGenre] = useState('Lo-Fi Chill');
  const [pubAudioUrl, setPubAudioUrl] = useState('');
  const [pubAudioFileName, setPubAudioFileName] = useState('');
  const [pubCoverUrl, setPubCoverUrl] = useState(PRESET_COVERS[0]);
  const [pubDurationSec, setPubDurationSec] = useState<number>(210);
  const [pubIsVipOnly, setPubIsVipOnly] = useState(false);
  const [pubBitrate, setPubBitrate] = useState('320kbps Hi-Fi');
  const [pubDescription, setPubDescription] = useState('');
  const [pubLyrics, setPubLyrics] = useState('');

  const [pubIsPlayingPreview, setPubIsPlayingPreview] = useState(false);
  const pubAudioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [pubSubmitting, setPubSubmitting] = useState(false);
  const [pubErrorMsg, setPubErrorMsg] = useState<string | null>(null);
  const [pubSuccessMsg, setPubSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPubArtist(authorStageName || user.displayName || 'Tác giả');
    }
  }, [user, authorStageName]);

  const handlePubAudioFileUpload = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
      alert('Vui lòng chọn tệp âm thanh hợp lệ (MP3, WAV, M4A, OGG, FLAC).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Kích thước tệp âm thanh tối đa là 50MB.');
      return;
    }
    setPubAudioFileName(file.name);
    if (!pubTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setPubTitle(cleanName);
    }
    const objectUrl = URL.createObjectURL(file);
    setPubAudioUrl(objectUrl);

    const tempAudio = new Audio();
    tempAudio.src = objectUrl;
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setPubDurationSec(Math.round(tempAudio.duration));
      }
    };
  };

  const handlePubCoverUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPubCoverUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePubPreview = () => {
    if (!pubAudioUrl) return;
    if (!pubAudioPreviewRef.current) {
      const audio = new Audio(pubAudioUrl);
      audio.onended = () => setPubIsPlayingPreview(false);
      pubAudioPreviewRef.current = audio;
    }

    if (pubIsPlayingPreview) {
      pubAudioPreviewRef.current.pause();
      setPubIsPlayingPreview(false);
    } else {
      pubAudioPreviewRef.current.play().catch(console.error);
      setPubIsPlayingPreview(true);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPubErrorMsg('Vui lòng đăng nhập để phát hành tác phẩm.');
      return;
    }
    if (!pubTitle.trim()) {
      setPubErrorMsg('Vui lòng nhập tên tác phẩm âm thanh.');
      return;
    }
    if (!pubAudioUrl) {
      setPubErrorMsg('Vui lòng tải lên tệp âm thanh hoặc tạo từ AI Voice Studio.');
      return;
    }

    setPubSubmitting(true);
    setPubErrorMsg(null);
    setPubSuccessMsg(null);

    const res = await publishAuthorTrack({
      title: pubTitle.trim(),
      artist: pubArtist.trim() || authorStageName || user.displayName || 'Tác giả',
      genre: pubGenre,
      url: pubAudioUrl,
      coverUrl: pubCoverUrl,
      durationSec: pubDurationSec,
      isVipOnly: pubIsVipOnly,
      bitrate: pubBitrate,
      description: pubDescription.trim(),
      lyrics: pubLyrics.trim(),
    });

    setPubSubmitting(false);
    if (res.success) {
      setPubSuccessMsg('🎉 Chúc mừng! Tác phẩm âm thanh của bạn đã được phát hành chính thức lên Kho Audio!');
      showToast('Đã phát hành tác phẩm thành công!');
      setPubTitle('');
      setPubAudioUrl('');
      setPubAudioFileName('');
      setPubLyrics('');
      setPubDescription('');
      setShowPublishForm(false);
    } else {
      setPubErrorMsg(res.message);
    }
  };

  // ==========================================
  // 4. STATE: AUTHOR eKYC VERIFICATION
  // ==========================================
  const [kycStageName, setKycStageName] = useState(authorStageName || user?.displayName || '');
  const [kycRealName, setKycRealName] = useState('');
  const [kycIdNumber, setKycIdNumber] = useState('');
  const [kycEmail, setKycEmail] = useState(user?.email || '');
  const [kycPhone, setKycPhone] = useState('');
  const [kycBio, setKycBio] = useState(authorBio || '');
  const [kycGenre, setKycGenre] = useState('Lo-Fi Chill & Sách Nói');
  const [kycSampleLink, setKycSampleLink] = useState('');
  const [kycTermsAgreed, setKycTermsAgreed] = useState(false);

  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setKycError('Vui lòng đăng nhập để gửi hồ sơ định danh tác giả.');
      return;
    }
    if (!kycStageName.trim() || !kycRealName.trim() || !kycIdNumber.trim() || !kycPhone.trim()) {
      setKycError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (!kycTermsAgreed) {
      setKycError('Vui lòng đồng ý với Điều khoản và Cam kết Bản quyền.');
      return;
    }

    setKycSubmitting(true);
    setKycError(null);
    setKycSuccess(null);

    const res = await submitAuthorVerification({
      fullName: kycRealName.trim() || kycStageName.trim(),
      stageName: kycStageName.trim(),
      idCardNumber: kycIdNumber.trim() || '001234567890',
      idCardIssueDate: new Date().toISOString().split('T')[0],
      idCardFrontUrl: '',
      idCardBackUrl: '',
      facePhotoUrl: '',
      email: kycEmail.trim(),
      phoneNumber: kycPhone.trim(),
      bio: kycBio.trim(),
      musicGenre: kycGenre || 'Pop / Ballad',
      socialLink: kycSampleLink.trim(),
    });

    setKycSubmitting(false);
    if (res.success) {
      setKycSuccess('Hồ sơ xác thực Tác giả của bạn đã được gửi thành công. Đội ngũ Quản trị viên sẽ xét duyệt trong vòng 24 giờ.');
      showToast('Đã gửi hồ sơ xác thực tác giả eKYC!');
    } else {
      setKycError(res.message);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 bg-purple-950/95 border-purple-500/50 text-purple-200 shadow-purple-950/50">
          <CheckCircle2 size={20} className="text-purple-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Studio Overview */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-pink-950/30 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles size={14} className="text-purple-400" />
                Haevy Studio
              </span>
              {isAuthorVerified ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Tác Giả Đã Xác Minh eKYC
                </span>
              ) : authorStatus === 'pending' ? (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-400" />
                  Đang Chờ Duyệt Tác Giả
                </span>
              ) : (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <UserCheck size={13} className="text-zinc-400" />
                  Chưa Xác Thực Nghệ Sĩ
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Không Gian Tác Giả & Sáng Tạo 🎙️
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Phòng thu âm thông minh với công nghệ Gemini AI: Chuyển văn bản thành giọng đọc truyền cảm, phối nhạc nền ambient, phát hành tác phẩm lên Kho Audio và quản lý cộng đồng người nghe.
            </p>
          </div>

          {/* Quick Stats Header Card */}
          <div className="w-full md:w-auto shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between md:flex-col md:items-end gap-3 shadow-xl">
            <div className="text-left md:text-right">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Nghệ Danh Tác Giả</p>
              <p className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                {authorStageName || user?.displayName || 'Tác Giả Mới'}
                {isAuthorVerified && <ShieldCheck size={16} className="text-emerald-400 fill-emerald-400/20" />}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{myTracks.length} tác phẩm đã tạo</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800">
              <Coins size={16} className="text-amber-400 shrink-0" />
              <span className="text-sm font-black text-amber-400 font-mono">{(audioPoints || 0).toLocaleString('vi-VN')}</span>
              <span className="text-[10px] text-zinc-400 font-semibold">Xu Audio</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRANG 1: TỔNG QUAN & XÁC THỰC TÁC GIẢ eKYC */}
      {/* ========================================================================= */}
      {activeSubTab === 'page1' && (
        <div className="space-y-6">
          {/* Creator Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Tổng Tác Phẩm</span>
                <Music size={16} className="text-purple-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{myTracks.length}</p>
              <p className="text-[11px] text-zinc-500">Đã phát hành</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Lượt Nghe Tích Lũy</span>
                <Headphones size={16} className="text-cyan-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">{totalPlays.toLocaleString('vi-VN')}</p>
              <p className="text-[11px] text-zinc-500">Từ thính giả</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Yêu Thích</span>
                <Heart size={16} className="text-rose-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-300 font-mono">{totalLikes.toLocaleString('vi-VN')}</p>
              <p className="text-[11px] text-zinc-500">Lượt thả tim</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Trạng Thái Định Danh</span>
                <ShieldCheck size={16} className={isAuthorVerified ? 'text-emerald-400' : 'text-amber-400'} />
              </div>
              <p className={`text-sm sm:text-base font-black truncate ${isAuthorVerified ? 'text-emerald-400' : authorStatus === 'pending' ? 'text-amber-400' : 'text-zinc-400'}`}>
                {isAuthorVerified ? 'Đã Xác Minh' : authorStatus === 'pending' ? 'Chờ Duyệt' : 'Chưa eKYC'}
              </p>
              <p className="text-[11px] text-zinc-500">Huy hiệu nghệ sĩ</p>
            </div>
          </div>

          {/* Verification Status or eKYC Application Section */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${isAuthorVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    Xác Thực Tác Giả & Định Danh Nghệ Sĩ (eKYC)
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Bảo hộ quyền tác giả, nhận huy hiệu tích xanh chính thức và các quyền lợi phát hành cao cấp
                  </p>
                </div>
              </div>
            </div>

            {/* If Author is ALREADY Verified */}
            {isAuthorVerified && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Hồ Sơ Nghệ Sĩ: {authorStageName || user?.displayName}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-xs font-bold flex items-center gap-1">
                        <Check size={12} /> Đã Xác Minh Chính Thức
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      {authorBio || 'Tác giả nội dung âm thanh và giọng đọc được chứng thực trên hệ sinh thái Haevy Audio.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                    <span className="text-zinc-500 font-medium">Mã Định Danh:</span>
                    <p className="font-mono font-bold text-emerald-400">AUTHOR-{user?.uid.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                    <span className="text-zinc-500 font-medium">Quyền Lợi Đã Mở:</span>
                    <p className="font-bold text-white">Tích xanh + Quà tặng Fans</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1">
                    <span className="text-zinc-500 font-medium">Hạn Mức Phát Hành:</span>
                    <p className="font-bold text-amber-400">Không Giới Hạn Tác Phẩm</p>
                  </div>
                </div>
              </div>
            )}

            {/* If Author Verification is PENDING */}
            {!isAuthorVerified && authorStatus === 'pending' && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 animate-pulse">
                    <Clock size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Hồ Sơ Của Bạn Đang Được Đội Ngũ Quản Trị Xét Duyệt
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      Cảm ơn bạn đã gửi hồ sơ eKYC. Ban Quản Trị Haevy Audio đang thẩm định thông tin và tác phẩm mẫu trong vòng 24 - 48 giờ làm việc. Bạn sẽ nhận được thông báo ngay khi hồ sơ được phê duyệt.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-2">
                  <p className="text-zinc-400 font-medium">Thông tin đã nộp:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                    <div>• Nghệ danh: <span className="font-bold text-white">{authorStageName || 'Chưa cập nhật'}</span></div>
                    <div>• Trạng thái: <span className="text-amber-400 font-bold">Đang thẩm định</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* If Author is NOT Verified and NOT Pending -> Show Full eKYC Form */}
            {!isAuthorVerified && authorStatus !== 'pending' && (
              <form onSubmit={handleKycSubmit} className="space-y-5">
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs sm:text-sm text-purple-200 flex items-center gap-3">
                  <Sparkles size={18} className="text-purple-400 shrink-0" />
                  <span>Điền thông tin định danh tác giả bên dưới để được cấp Huy hiệu Tác giả chính thức và mở khóa tính năng nhận Quà Tặng từ người nghe.</span>
                </div>

                {kycError && (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{kycError}</span>
                  </div>
                )}

                {kycSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{kycSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-purple-400" />
                      Nghệ Danh / Bút Danh Sáng Tác *
                    </label>
                    <input
                      type="text"
                      value={kycStageName}
                      onChange={(e) => setKycStageName(e.target.value)}
                      placeholder="VD: Tuấn Vũ Radio, Linh Đan Story..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <FileText size={14} className="text-purple-400" />
                      Họ Và Tên Thật (Theo CCCD/Hộ Chiếu) *
                    </label>
                    <input
                      type="text"
                      value={kycRealName}
                      onChange={(e) => setKycRealName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-purple-400" />
                      Số Căn Cước Công Dân / Hộ Chiếu *
                    </label>
                    <input
                      type="text"
                      value={kycIdNumber}
                      onChange={(e) => setKycIdNumber(e.target.value)}
                      placeholder="12 chữ số CCCD gắn chip"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Phone size={14} className="text-purple-400" />
                      Số Điện Thoại Liên Hệ *
                    </label>
                    <input
                      type="tel"
                      value={kycPhone}
                      onChange={(e) => setKycPhone(e.target.value)}
                      placeholder="0912 345 678"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Mail size={14} className="text-purple-400" />
                      Email Tác Giả *
                    </label>
                    <input
                      type="email"
                      value={kycEmail}
                      onChange={(e) => setKycEmail(e.target.value)}
                      placeholder="author@example.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Music size={14} className="text-purple-400" />
                      Thể Loại Sở Trường Chính
                    </label>
                    <select
                      value={kycGenre}
                      onChange={(e) => setKycGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    >
                      {GENRE_LIST.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Tiểu Sử Nghệ Sĩ & Phong Cách Sáng Tác
                  </label>
                  <textarea
                    value={kycBio}
                    onChange={(e) => setKycBio(e.target.value)}
                    rows={3}
                    placeholder="Mô tả ngắn về kinh nghiệm thu âm, sáng tác podcast, truyện audio hoặc phong cách giọng đọc của bạn..."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 custom-scrollbar resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Liên Kết Tác Phẩm Mẫu / Demo (Nếu có)
                  </label>
                  <input
                    type="url"
                    value={kycSampleLink}
                    onChange={(e) => setKycSampleLink(e.target.value)}
                    placeholder="Link Soundcloud, YouTube, Drive hoặc file audio demo của bạn..."
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kyc-terms"
                    checked={kycTermsAgreed}
                    onChange={(e) => setKycTermsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 bg-zinc-900 border-zinc-700 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="kyc-terms" className="text-xs text-zinc-400 cursor-pointer select-none leading-relaxed">
                    Tôi cam kết toàn bộ thông tin cung cấp là chính xác và các tác phẩm phát hành tuân thủ luật sở hữu trí tuệ, không vi phạm bản quyền hoặc tiêu chuẩn cộng đồng của Haevy Audio.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={kycSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {kycSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang Gửi Hồ Sơ Xét Duyệt...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Nộp Hồ Sơ Xác Thực Tác Giả eKYC</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => onSelectSubTab && onSelectSubTab('page2')}
              className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group shadow-xl flex items-center justify-between"
            >
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">
                  Trang 2: Tính Năng
                </span>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  <Mic size={18} className="text-purple-400" />
                  Tạo Giọng Đọc AI (Text-To-Speech)
                </h3>
                <p className="text-xs text-zinc-400">
                  Chuyển văn bản truyện, podcast sang âm thanh sống động với Gemini AI
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:translate-x-1 transition-transform shrink-0">
                <ArrowRight size={20} />
              </div>
            </div>

            <div
              onClick={() => onSelectSubTab && onSelectSubTab('page3')}
              className="p-6 rounded-3xl bg-gradient-to-br from-pink-950/40 via-zinc-900 to-zinc-950 border border-pink-500/30 hover:border-pink-400 transition-all cursor-pointer group shadow-xl flex items-center justify-between"
            >
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-300 rounded text-[10px] font-bold">
                  Trang 3: Kho Tác Phẩm
                </span>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-pink-300 transition-colors flex items-center gap-2">
                  <Layers size={18} className="text-pink-400" />
                  Kho Tác Phẩm & Quản Lý Của Tác Giả
                </h3>
                <p className="text-xs text-zinc-400">
                  Quản lý {myTracks.length} tác phẩm đã phát hành, chỉnh sửa và theo dõi lượt nghe
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-300 group-hover:translate-x-1 transition-transform shrink-0">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 2: TÍNH NĂNG (CHUYỂN VĂN BẢN THÀNH ÂM THANH - AI VOICE STUDIO) */}
      {/* ========================================================================= */}
      {activeSubTab === 'page2' && (
        <div className="space-y-6">
          {/* Preset Script Library Pills */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-white">Mẫu Văn Bản Đọc Tham Khảo</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_SCRIPTS.map((ps, idx) => {
                const IconComponent = ps.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setTtsTitle(ps.title);
                      setTtsText(ps.text);
                      setTtsGenre(ps.genre);
                      setSelectedVoice(ps.voice);
                      setSelectedAmbient(ps.ambient);
                      showToast(`Đã áp dụng mẫu: ${ps.title}`);
                    }}
                    className="p-3 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-purple-500/40 text-left transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{ps.category}</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{ps.title}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{ps.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main TTS Voice Generator Canvas */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            {/* Title and Genre Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Tên Bản Đọc / Tác Phẩm Audio *</label>
                <input
                  type="text"
                  value={ttsTitle}
                  onChange={(e) => setTtsTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tác phẩm âm thanh..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Thể Loại</label>
                <select
                  value={ttsGenre}
                  onChange={(e) => setTtsGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                >
                  {GENRE_LIST.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Script Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <FileText size={14} className="text-purple-400" />
                    Nội Dung Văn Bản Cần Chuyển Thành Âm Thanh *
                  </label>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold" title="Bản nháp được tự động lưu cục bộ trên trình duyệt để không bị mất khi chuyển chế độ">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>Tự động lưu nháp</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {ttsText.length} ký tự (~{Math.round(ttsText.length / 15)}s giọng đọc)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDraftToDefault}
                    className="text-[11px] text-zinc-400 hover:text-purple-300 flex items-center gap-1 underline transition-colors cursor-pointer"
                    title="Khôi phục nội dung về mẫu mặc định"
                  >
                    <RotateCcw size={11} />
                    <span>Đặt lại mẫu</span>
                  </button>
                </div>
              </div>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                rows={5}
                placeholder="Nhập hoặc dán nội dung truyện, thơ, podcast, lời dẫn truyện..."
                className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-purple-500 custom-scrollbar resize-none font-sans"
              />
            </div>

            {/* Voice Selection Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Mic size={14} className="text-purple-400" />
                Chọn Giọng Đọc AI Gemini
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TTS_VOICES.map((v) => (
                  <div
                    key={v.geminiVoiceName}
                    onClick={() => setSelectedVoice(v.geminiVoiceName)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      selectedVoice === v.geminiVoiceName
                        ? 'bg-purple-950/50 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {v.gender === 'female' ? 'Nữ' : 'Nam'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{v.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {v.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambient Background Audio Layering */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Volume2 size={14} className="text-purple-400" />
                Nhạc Nền Ambient & Hiệu Ứng Âm Thanh Hòa Âm
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {AMBIENT_BACKGROUNDS.map((amb) => (
                  <button
                    key={amb.id}
                    type="button"
                    onClick={() => setSelectedAmbient(amb.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedAmbient === amb.id
                        ? 'bg-purple-950/50 border-purple-500 shadow-md text-white'
                        : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="text-lg block">{amb.icon}</span>
                    <span className="text-xs font-bold mt-1 block truncate">{amb.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style / Emotion Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                Cảm Xúc / Phong Cách Biểu Đạt (Tùy chọn)
              </label>
              <input
                type="text"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                placeholder="VD: Giọng đọc truyền cảm ấm áp, thì thầm ru ngủ, trầm hùng kiếm hiệp..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Error or Success Messages */}
            {ttsError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{ttsError}</span>
              </div>
            )}

            {ttsSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{ttsSuccess}</span>
              </div>
            )}

            {/* Real-time Percentage & Progress Bar Card */}
            {(isSynthesizing || (synthProgressPercent > 0 && synthProgressPercent < 100)) && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-900 to-zinc-950 border border-purple-500/50 shadow-2xl shadow-purple-950/60 space-y-4 animate-in zoom-in-95 duration-300">
                {/* Header: Percentage Badge, Title & Live Stage */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
                      <span className="font-black text-xs sm:text-sm font-mono text-purple-300">
                        {synthProgressPercent}%
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-white">Đang Chuyển Văn Bản Thành Âm Thanh</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300 animate-pulse">
                          Studio Pipeline
                        </span>
                      </div>
                      <p className="text-xs text-purple-300/90 font-medium mt-0.5 flex items-center gap-1.5">
                        <Activity size={12} className="text-purple-400 animate-pulse" />
                        {synthStageText || 'Đang xử lý dữ liệu âm thanh...'}
                      </p>
                    </div>
                  </div>

                  {/* Time Counters: Elapsed and Estimated Completion */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 font-mono">
                    <Clock size={13} className="text-purple-400" />
                    <span>{synthElapsedSec}s</span>
                    <span className="text-zinc-500">/ ~{Math.max(synthElapsedSec + 1, synthEstimatedSec)}s</span>
                    <span className="text-[10px] text-purple-400 font-semibold ml-1">({synthProgressPercent}%)</span>
                  </div>
                </div>

                {/* Primary Progress Bar with Gradient Glow */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <span>Tiến độ chuyển đổi âm thanh</span>
                    </span>
                    <span className="text-purple-300 font-mono text-xs font-black">{synthProgressPercent}%</span>
                  </div>

                  <div className="relative w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-400 transition-all duration-150 relative shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                      style={{ width: `${synthProgressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 4-Step Visual Progress Timeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { step: 1, title: 'Chuẩn hóa & Ngữ điệu', minPct: 20 },
                    { step: 2, title: 'Gemini AI Voice', minPct: 55 },
                    { step: 3, title: 'Hòa âm Stereo', minPct: 80 },
                    { step: 4, title: 'Xuất Master WAV', minPct: 100 }
                  ].map((st) => {
                    const isDone = synthProgressPercent >= st.minPct;
                    const isCurrent = !isDone && (synthProgressPercent >= st.minPct - 35 || st.step === 1);
                    return (
                      <div
                        key={st.step}
                        className={`p-2 rounded-xl border text-[11px] flex items-center gap-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : isCurrent
                            ? 'bg-purple-950/50 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 size={13} className="shrink-0 animate-spin text-purple-400" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                            {st.step}
                          </span>
                        )}
                        <span className="truncate font-medium">{st.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar with Generate Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Chi phí:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {isAdmin ? '0 Xu (Admin Miễn Phí)' : `${ttsPointsCost} Xu Audio / Lần`}
                </span>
              </div>

              <button
                onClick={handleSynthesizeSpeech}
                disabled={isSynthesizing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-600/30 disabled:opacity-50 active:scale-98"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang Xử Lý: {synthProgressPercent}% ({synthElapsedSec}s / ~{Math.max(synthElapsedSec + 1, synthEstimatedSec)}s)</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    <span>Chuyển Văn Bản Thành Âm Thanh Ngay</span>
                  </>
                )}
              </button>
            </div>

            {/* Synthesized Audio Player Result Box */}
            {ttsAudioUrl && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-zinc-900 to-zinc-950 border border-purple-500/40 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleTtsPlay}
                      className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
                    >
                      {isPlayingTts ? <Pause size={20} /> : <Play size={20} className="ml-0.5 fill-current" />}
                    </button>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white">{ttsTitle}</h4>
                      <p className="text-xs text-purple-300 font-medium">
                        Giọng: {selectedVoice} • Thời lượng: ~{ttsDurationSec}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadTtsWav}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Tải file WAV"
                    >
                      <Download size={15} />
                      <span className="hidden sm:inline">Tải WAV</span>
                    </button>

                    <button
                      onClick={handleSendTtsToPublish}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Layers size={15} />
                      <span>Đăng Lên Kho Tác Phẩm (Trang 3)</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-100"
                    style={{ width: `${ttsProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TRANG 3: KHO TÁC PHẨM & QUẢN LÝ CỦA TÁC GIẢ */}
      {/* ========================================================================= */}
      {activeSubTab === 'page3' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Layers size={20} className="text-pink-400" />
                Kho Tác Phẩm Của Tác Giả ({myTracks.length})
              </h2>
              <p className="text-xs text-zinc-400">Danh sách các tác phẩm âm thanh và giọng đọc đã phát hành của bạn</p>
            </div>

            <button
              onClick={() => setShowPublishForm(!showPublishForm)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-600/30"
            >
              {showPublishForm ? (
                <>
                  <Layers size={16} />
                  <span>Xem Danh Sách Tác Phẩm</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Phát Hành Tác Phẩm Mới (+)</span>
                </>
              )}
            </button>
          </div>

          {/* Form Publish New Track (Toggleable) */}
          {showPublishForm && (
            <div className="bg-zinc-900/90 border border-pink-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Upload size={18} className="text-pink-400" />
                  Đăng Tải & Phát Hành Tác Phẩm Âm Thanh
                </h3>
                <span className="text-xs text-pink-400 font-medium">Chuẩn Hi-Fi 320kbps</span>
              </div>

              {pubErrorMsg && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pubErrorMsg}</span>
                </div>
              )}

              {pubSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{pubSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handlePublishSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Tên Tác Phẩm *</label>
                    <input
                      type="text"
                      value={pubTitle}
                      onChange={(e) => setPubTitle(e.target.value)}
                      placeholder="VD: Cổ Tích Đêm Muộn Tập 1..."
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Tác Giả / Nghệ Sĩ</label>
                    <input
                      type="text"
                      value={pubArtist}
                      onChange={(e) => setPubArtist(e.target.value)}
                      placeholder="Nghệ danh hiển thị"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Thể Loại Âm Nhạc / Nội Dung</label>
                    <select
                      value={pubGenre}
                      onChange={(e) => setPubGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                    >
                      {GENRE_LIST.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Chất Lượng Âm Thanh</label>
                    <input
                      type="text"
                      value={pubBitrate}
                      onChange={(e) => setPubBitrate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>

                {/* Audio File Selection / Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Music size={14} className="text-pink-400" />
                    Tệp Âm Thanh (Audio File) *
                  </label>

                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-zinc-300 truncate max-w-md">
                      {pubAudioFileName ? (
                        <span className="font-bold text-emerald-400">🎵 {pubAudioFileName}</span>
                      ) : pubAudioUrl ? (
                        <span className="font-bold text-purple-400">🎵 Đã tải sẵn từ AI Voice Studio</span>
                      ) : (
                        <span className="text-zinc-500">Chưa chọn tệp âm thanh nào (Hỗ trợ MP3, WAV, M4A, FLAC tối đa 50MB)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pubAudioUrl && (
                        <button
                          type="button"
                          onClick={handleTogglePubPreview}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1 border border-zinc-700 cursor-pointer"
                        >
                          {pubIsPlayingPreview ? <Pause size={13} /> : <Play size={13} />}
                          <span>{pubIsPlayingPreview ? 'Dừng' : 'Nghe Thử'}</span>
                        </button>
                      )}

                      <label className="px-4 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                        <Upload size={14} />
                        <span>Chọn Tệp Từ Máy</span>
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a,.flac"
                          onChange={(e) => e.target.files?.[0] && handlePubAudioFileUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cover Art Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-pink-400" />
                    Ảnh Bìa Tác Phẩm
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_COVERS.map((cover, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPubCoverUrl(cover)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                          pubCoverUrl === cover ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={cover} alt="Cover preset" className="w-full h-full object-cover" />
                        {pubCoverUrl === cover && (
                          <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lyrics / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Lời Bài Hát / Lời Dẫn / Kịch Bản</label>
                  <textarea
                    value={pubLyrics}
                    onChange={(e) => setPubLyrics(e.target.value)}
                    rows={4}
                    placeholder="Nhập lời bài hát hoặc kịch bản chi tiết để người nghe theo dõi..."
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-pink-500 custom-scrollbar resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishForm(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 text-xs font-bold cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={pubSubmitting}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-600/30 disabled:opacity-50"
                  >
                    {pubSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Đang Xuất Bản Lên Hệ Thống...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Xác Nhận Phát Hành Tác Phẩm</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Created Tracks */}
          <div className="space-y-3">
            {loadingTracks ? (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-purple-400" />
                <span className="text-xs">Đang tải kho tác phẩm của bạn...</span>
              </div>
            ) : myTracks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-500 mx-auto">
                  <Music size={28} />
                </div>
                <h3 className="text-base font-bold text-white">Bạn chưa có tác phẩm âm thanh nào</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Hãy sang Trang 2 để tạo giọng đọc AI từ văn bản hoặc nhấn "Phát Hành Tác Phẩm Mới (+)" để tải lên file audio của bạn!
                </p>
                <button
                  onClick={() => onSelectSubTab && onSelectSubTab('page2')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-purple-600/20"
                >
                  Tạo Giọng Đọc AI Ở Trang 2
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handlePlaySelectedTrack(track)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                          title="Phát tác phẩm"
                        >
                          <Play size={20} className="fill-current ml-0.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white truncate">{track.title}</h4>
                          <span className="px-2 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-medium">
                            {track.genre}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{track.artist}</p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-1">
                          <span>{track.durationSec}s</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Headphones size={11} /> {(track.plays || 0).toLocaleString()} lượt nghe
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-rose-400">
                            <Heart size={11} /> {track.likesCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800/80">
                      <button
                        onClick={() => handlePlaySelectedTrack(track)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play size={13} className="fill-current" />
                        <span>Phát</span>
                      </button>

                      <button
                        onClick={() => handleCopyTrackLink(track)}
                        className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
                        title="Sao chép link"
                      >
                        {copiedTrackId === track.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      </button>

                      <button
                        onClick={() => handleDeleteTrack(track.id, track.title)}
                        disabled={deletingId === track.id}
                        className="p-2 rounded-xl bg-zinc-950 hover:bg-rose-950 border border-zinc-800 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 text-xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Xóa tác phẩm"
                      >
                        {deletingId === track.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
