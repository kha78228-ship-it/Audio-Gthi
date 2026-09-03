import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Music, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  Headphones, 
  Heart, 
  Sparkles, 
  Crown, 
  Layers, 
  Radio,
  Mic,
  Volume2,
  Download,
  Upload,
  Wand2,
  Sliders,
  FileText,
  Camera,
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
  Lock,
  RefreshCw,
  UserCheck,
  Image as ImageIcon,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  LayoutGrid
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

export type StudioTab = 'tts' | 'publish' | 'ekyc' | 'my-tracks';

interface AuthorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: StudioTab;
  onSelectTrack?: (track: Track) => void;
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

export function AuthorStudioModal({
  isOpen,
  onClose,
  initialTab = 'tts',
  onSelectTrack
}: AuthorStudioModalProps) {
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

  // Master Active Tab inside Studio Audio
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // ==========================================
  // 1. STATE: MY TRACKS & STATS
  // ==========================================
  const [myTracks, setMyTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
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
  }, [isOpen, user, authorStageName]);

  const handleDeleteTrack = async (trackId: string, trackTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tác phẩm "${trackTitle}" khỏi hệ thống không?`)) {
      return;
    }
    setDeletingId(trackId);
    await deleteAuthorTrack(trackId);
    setDeletingId(null);
  };

  const totalPlays = myTracks.reduce((acc, t) => acc + (t.plays || 0), 0);

  // ==========================================
  // 2. STATE: AI VOICE STUDIO (TEXT-TO-AUDIO)
  // ==========================================
  const [ttsTitle, setTtsTitle] = useState('Bản Đọc Âm Thanh Mới');
  const [ttsText, setTtsText] = useState(PRESET_SCRIPTS[1].text);
  const [ttsGenre, setTtsGenre] = useState(PRESET_SCRIPTS[1].genre);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedAmbient, setSelectedAmbient] = useState<string>('piano');
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.25);
  const [stylePrompt, setStylePrompt] = useState<string>('');

  // TTS Output
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [ttsDurationSec, setTtsDurationSec] = useState<number>(0);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsSuccess, setTtsSuccess] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fee for TTS Audio Synthesis (Points) - Tăng gấp 5 lần theo yêu cầu (VIP: 50 pts, Bản Thường: 75 pts, Admin: 0 pts)
  const ttsPointsCost = isAdmin ? 0 : isVip ? 50 : 75;

  // Handle Speech Synthesis
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
        `Số dư Điểm Audio không đủ! Bạn cần ${ttsPointsCost} Điểm Audio để tạo giọng đọc AI (Hiện có: ${audioPoints.toLocaleString()} pts). Hãy điểm danh hằng ngày hoặc nghe nhạc để tích lũy thêm điểm.`
      );
      return;
    }

    setIsSynthesizing(true);
    setTtsError(null);
    setTtsSuccess(null);
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      setIsPlayingTts(false);
    }

    let pointsDeducted = false;

    try {
      // Deduct audio points if applicable
      if (ttsPointsCost > 0 && user) {
        const deductResult = await deductAudioPoints(
          ttsPointsCost,
          `Chuyển văn bản thành giọng đọc AI: "${ttsTitle.slice(0, 30)}..."`,
          'tts_synthesis'
        );

        if (!deductResult.success) {
          setTtsError(deductResult.message);
          setIsSynthesizing(false);
          return;
        }
        pointsDeducted = true;
      }

      const result = await generateGeminiSpeech({
        text: ttsText,
        voiceName: selectedVoice,
        stylePrompt,
        ambientType: selectedAmbient,
      });

      if (result && result.audioUrl) {
        setTtsAudioUrl(result.audioUrl);
        setTtsDurationSec(result.durationSec);
        setTtsSuccess(
          `Chuyển đổi thành công! ${ttsPointsCost > 0 ? `(Đã trừ -${ttsPointsCost} Điểm Audio).` : '(Miễn phí đặc quyền Quản trị viên).'} Thời lượng ~${result.durationSec}s. Hãy nghe thử hoặc nhấn "Đăng Lên Kho Audio".`
        );
      } else {
        // Refund if synthesis produced no audio
        if (pointsDeducted && ttsPointsCost > 0) {
          await addAudioPoints(ttsPointsCost, 'Hoàn điểm do lỗi tổng hợp âm thanh', 'bonus');
        }
        setTtsError('Lỗi khi tạo file âm thanh. Điểm Audio đã được hoàn lại.');
      }
    } catch (err: any) {
      // Refund if error occurred
      if (pointsDeducted && ttsPointsCost > 0) {
        try {
          await addAudioPoints(ttsPointsCost, 'Hoàn điểm do lỗi kết nối tổng hợp âm thanh', 'bonus');
        } catch (refundErr) {
          console.error('Error refunding points:', refundErr);
        }
      }
      setTtsError((err.message || 'Đã có lỗi xảy ra khi tạo giọng đọc.') + (pointsDeducted ? ' (Đã hoàn lại Điểm Audio).' : ''));
    } finally {
      setIsSynthesizing(false);
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
    a.download = `${ttsTitle.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}_haevy_audio.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 1-Click Send from TTS to Publish Tab
  const handleSendTtsToPublish = () => {
    if (!ttsAudioUrl) return;
    setPubTitle(ttsTitle);
    setPubGenre(ttsGenre);
    setPubAudioUrl(ttsAudioUrl);
    setPubAudioFileName(`${ttsTitle}.wav (Từ AI Voice Studio)`);
    setPubDurationSec(ttsDurationSec || 180);
    setPubLyrics(ttsText);
    setPubDescription(`Tác phẩm giọng đọc AI truyền cảm, tạo bởi Studio Audio với giọng ${selectedVoice}.`);
    setPubSuccessMsg(null);
    setPubErrorMsg(null);
    setActiveTab('publish');
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
    if (!pubTitle.trim()) {
      setPubErrorMsg('Vui lòng nhập tiêu đề tác phẩm.');
      return;
    }
    if (!pubAudioUrl) {
      setPubErrorMsg('Vui lòng tải lên tệp âm thanh hoặc tạo từ tab "AI Voice Studio".');
      return;
    }

    setPubSubmitting(true);
    setPubErrorMsg(null);
    setPubSuccessMsg(null);

    try {
      const result = await publishAuthorTrack({
        title: pubTitle.trim(),
        artist: pubArtist.trim() || authorStageName || user?.displayName || 'Tác giả',
        genre: pubGenre,
        url: pubAudioUrl,
        coverUrl: pubCoverUrl,
        durationSec: pubDurationSec,
        isVipOnly: pubIsVipOnly,
        bitrate: pubBitrate,
        description: pubDescription.trim(),
        lyrics: pubLyrics.trim(),
      });

      if (result.success) {
        setPubSuccessMsg(result.message);
        setTimeout(() => {
          setActiveTab('my-tracks');
        }, 1200);
      } else {
        setPubErrorMsg(result.message);
      }
    } catch (err: any) {
      setPubErrorMsg(err.message || 'Lỗi khi đăng bài hát.');
    } finally {
      setPubSubmitting(false);
    }
  };

  // ==========================================
  // 4. STATE: AUTHOR EKYC VERIFICATION
  // ==========================================
  const [ekycStep, setEkycStep] = useState<1 | 2 | 3 | 4>(1);
  const [ekycSubmitting, setEkycSubmitting] = useState(false);
  const [ekycError, setEkycError] = useState<string | null>(null);
  const [ekycSuccess, setEkycSuccess] = useState<string | null>(null);

  // Step 1: Contact
  const [ekycEmail, setEkycEmail] = useState('');
  const [ekycEmailOtpSent, setEkycEmailOtpSent] = useState(false);
  const [ekycEmailVerified, setEkycEmailVerified] = useState(false);
  const [ekycEmailOtpInput, setEkycEmailOtpInput] = useState('');

  const [ekycPhone, setEkycPhone] = useState('');
  const [ekycPhoneOtpSent, setEkycPhoneOtpSent] = useState(false);
  const [ekycPhoneVerified, setEkycPhoneVerified] = useState(false);
  const [ekycPhoneOtpInput, setEkycPhoneOtpInput] = useState('');

  const [ekycStageName, setEkycStageName] = useState('');
  const [ekycMusicGenre, setEkycMusicGenre] = useState('Lo-Fi Chill');
  const [ekycBio, setEkycBio] = useState('');
  const [ekycSocialLink, setEkycSocialLink] = useState('');

  // Step 2: CCCD
  const [ekycFullName, setEkycFullName] = useState('');
  const [ekycIdNumber, setEkycIdNumber] = useState('');
  const [ekycIdDate, setEkycIdDate] = useState('');
  const [ekycFrontUrl, setEkycFrontUrl] = useState('');
  const [ekycBackUrl, setEkycBackUrl] = useState('');

  // Step 3: Face Scan
  const [ekycFaceUrl, setEkycFaceUrl] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (user) {
      setEkycEmail(user.email || '');
      setEkycEmailVerified(Boolean(user.email));
      setEkycStageName(authorStageName || user.displayName || '');
      setEkycBio(authorBio || '');
    }
    if (authorVerificationData) {
      setEkycFullName(authorVerificationData.fullName || '');
      setEkycStageName(authorVerificationData.stageName || '');
      setEkycEmail(authorVerificationData.email || user?.email || '');
      setEkycPhone(authorVerificationData.phoneNumber || '');
      setEkycIdNumber(authorVerificationData.idCardNumber || '');
      setEkycIdDate(authorVerificationData.idCardIssueDate || '');
      setEkycFrontUrl(authorVerificationData.idCardFrontUrl || '');
      setEkycBackUrl(authorVerificationData.idCardBackUrl || '');
      setEkycFaceUrl(authorVerificationData.facePhotoUrl || '');
      setEkycMusicGenre(authorVerificationData.musicGenre || 'Lo-Fi Chill');
      setEkycBio(authorVerificationData.bio || '');
      setEkycSocialLink(authorVerificationData.socialLink || '');
      setEkycEmailVerified(true);
      setEkycPhoneVerified(true);
    }
  }, [user, authorVerificationData, authorStageName, authorBio]);

  // Clean up camera stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Trình duyệt không hỗ trợ truy cập camera. Bạn có thể tải ảnh chân dung từ máy.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Không thể mở camera. Vui lòng cho phép quyền truy cập camera hoặc tải ảnh chụp từ máy.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setEkycFaceUrl(dataUrl);
      stopCamera();
    }
  };

  const handleEkycFileUpload = (file: File, target: 'front' | 'back' | 'face') => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'front') setEkycFrontUrl(result);
      if (target === 'back') setEkycBackUrl(result);
      if (target === 'face') setEkycFaceUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const canProceedEkyc1 = ekycEmail.trim().length > 5 && ekycPhone.trim().length >= 10 && ekycStageName.trim().length >= 2;
  const canProceedEkyc2 = ekycFullName.trim().length >= 3 && ekycIdNumber.replace(/[^0-9]/g, '').length === 12 && ekycFrontUrl.length > 0 && ekycBackUrl.length > 0;
  const canProceedEkyc3 = ekycFaceUrl.length > 0;

  const handleEkycSubmit = async () => {
    if (!canProceedEkyc1 || !canProceedEkyc2 || !canProceedEkyc3) {
      setEkycError('Vui lòng hoàn thành đầy đủ thông tin ở cả 3 bước xác thực.');
      return;
    }
    if (!agreedTerms) {
      setEkycError('Vui lòng đồng ý với Điều khoản và Cam kết Bản quyền Tác giả.');
      return;
    }

    setEkycSubmitting(true);
    setEkycError(null);

    const result = await submitAuthorVerification({
      fullName: ekycFullName,
      stageName: ekycStageName,
      email: ekycEmail,
      phoneNumber: ekycPhone,
      idCardNumber: ekycIdNumber,
      idCardIssueDate: ekycIdDate || '01/01/2023',
      idCardFrontUrl: ekycFrontUrl,
      idCardBackUrl: ekycBackUrl,
      facePhotoUrl: ekycFaceUrl,
      musicGenre: ekycMusicGenre,
      bio: ekycBio,
      socialLink: ekycSocialLink,
    });

    setEkycSubmitting(false);

    if (result.success) {
      setEkycSuccess(result.message);
    } else {
      setEkycError(result.message);
    }
  };

  // Clean audios when closing modal
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      if (pubAudioPreviewRef.current) {
        pubAudioPreviewRef.current.pause();
        pubAudioPreviewRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="author-studio-master-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="author-studio-master-modal-content"
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* ========================================================================= */}
        {/* TOP HEADER: UNIFIED STUDIO AUDIO BRAND & METRICS */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/25 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center text-cyan-300">
                <Mic size={22} className="text-cyan-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-1.5">
                  <span>Haey</span>
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">Studio</span>
                  <span className="text-zinc-500 font-normal text-xs sm:text-sm">| AI Audio Creator</span>
                </h3>
                {isAuthorVerified ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck size={11} /> Tác Giả Đã Xác Minh ✓
                  </span>
                ) : authorStatus === 'pending' ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                    <Clock size={11} /> eKYC Đang Thẩm Định
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                    Chưa eKYC
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
                Chuyển văn bản ra giọng đọc AI, đăng tác phẩm lên Kho Audio và xác thực eKYC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-author-studio-master-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Đóng Studio Audio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED 4 MAIN TABS NAVIGATION */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-950/80 border-b border-zinc-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Tab 1: AI Voice Studio */}
            <button
              id="studio-tab-tts-btn"
              type="button"
              onClick={() => setActiveTab('tts')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tts'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
              }`}
            >
              <Mic size={15} className={activeTab === 'tts' ? 'text-amber-400 animate-pulse' : 'text-zinc-400'} />
              <span className="truncate">1. Văn Bản Ra Audio</span>
              <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-black uppercase hidden sm:inline">
                AI
              </span>
            </button>

            {/* Tab 2: Publish Audio */}
            <button
              id="studio-tab-publish-btn"
              type="button"
              onClick={() => setActiveTab('publish')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'publish'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
              }`}
            >
              <Upload size={15} className={activeTab === 'publish' ? 'text-amber-400' : 'text-zinc-400'} />
              <span className="truncate">2. Đăng Audio Mới</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono hidden sm:inline">
                +50 pts
              </span>
            </button>

            {/* Tab 3: Author eKYC */}
            <button
              id="studio-tab-ekyc-btn"
              type="button"
              onClick={() => setActiveTab('ekyc')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ekyc'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
              }`}
            >
              <ShieldCheck size={15} className={activeTab === 'ekyc' ? 'text-amber-400' : 'text-zinc-400'} />
              <span className="truncate">3. Xác Minh eKYC</span>
              {isAuthorVerified ? (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded-full font-bold">
                  ✓
                </span>
              ) : (
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full font-mono hidden sm:inline">
                  +300 pts
                </span>
              )}
            </button>

            {/* Tab 4: My Tracks & Stats */}
            <button
              id="studio-tab-mytracks-btn"
              type="button"
              onClick={() => setActiveTab('my-tracks')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-tracks'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
              }`}
            >
              <LayoutGrid size={15} className={activeTab === 'my-tracks' ? 'text-amber-400' : 'text-zinc-400'} />
              <span className="truncate">4. Kho Tác Phẩm</span>
              <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded-full font-mono">
                {myTracks.length}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI VOICE STUDIO (CHUYỂN VĂN BẢN THÀNH ÂM THANH) */}
        {/* ========================================================================= */}
        {activeTab === 'tts' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 animate-in fade-in duration-150">
            {/* Quick Banner with Action to Switch */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Chuyển Văn Bản Ra Âm Thanh Với Giọng Đọc AI & Phối Nhạc Nền
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                      Phí: {ttsPointsCost === 0 ? '0 pts (Admin)' : `${ttsPointsCost} pts/lần`}
                    </span>
                    {user && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                        Số dư: {audioPoints.toLocaleString()} pts
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tạo radio, sách nói, truyện tiên hiệp, truyện ma đêm khuya với công nghệ Gemini TTS Hi-Fi. Thu phí bằng Điểm Audio.
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Mẫu Kịch Bản Có Sẵn
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SCRIPTS.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTtsTitle(p.title);
                        setTtsGenre(p.genre);
                        setTtsText(p.text);
                        setSelectedVoice(p.voice);
                        setSelectedAmbient(p.ambient);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                        <Icon size={13} />
                        <span className="truncate">{p.category}</span>
                      </div>
                      <p className="text-[11px] font-medium text-zinc-300 truncate mt-1 group-hover:text-white">
                        {p.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form for TTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Title, Text, Style */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300">Tiêu đề tác phẩm</label>
                    <input
                      type="text"
                      value={ttsTitle}
                      onChange={(e) => setTtsTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300">Thể loại</label>
                    <select
                      value={ttsGenre}
                      onChange={(e) => setTtsGenre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      {GENRE_LIST.map((g) => (
                        <option key={g} value={g} className="bg-zinc-900 text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-300">Nội dung văn bản để đọc *</label>
                    <span className="text-[10px] text-zinc-500 font-mono">{ttsText.length} ký tự</span>
                  </div>
                  <textarea
                    rows={6}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Nhập hoặc dán văn bản truyện, sách nói, radio, thơ hoặc lời thoại cần chuyển thành âm thanh..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-2xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400">
                    Chỉ dẫn sắc thái đọc (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    placeholder="VD: Đọc thì thầm ấm áp, huyền bí rùng rợn, hoặc giọng vui tươi tràn đầy năng lượng..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-zinc-300 placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Voice Selection & Ambient Music */}
              <div className="lg:col-span-5 space-y-3">
                {/* Voice Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span>Chọn Giọng Đọc Gemini Hi-Fi</span>
                    <span className="text-[10px] text-amber-400 font-mono">5 Giọng Chuẩn</span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {TTS_VOICES.map((v) => {
                      const isSelected = selectedVoice === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVoice(v.id)}
                          className={`p-2 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                              : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{v.name}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                {v.gender === 'female' ? 'Nữ' : 'Nam'}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">{v.description}</p>
                          </div>
                          {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ambient Background Music */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300">
                    Hòa Âm Nhạc Nền Không Gian (Ambient Mix)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AMBIENT_BACKGROUNDS.map((amb) => {
                      const isSelected = selectedAmbient === amb.id;
                      return (
                        <button
                          key={amb.id}
                          type="button"
                          onClick={() => setSelectedAmbient(amb.id)}
                          className={`p-2 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                              : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <p className="font-bold truncate">{amb.name}</p>
                          <p className="text-[9px] text-zinc-500 truncate">{amb.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Error or Success Notification */}
            {ttsError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{ttsError}</span>
              </div>
            )}

            {ttsSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{ttsSuccess}</span>
              </div>
            )}

            {/* Synthesis Action & Audio Player Strip */}
            <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                disabled={isSynthesizing}
                onClick={handleSynthesizeSpeech}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang tổng hợp giọng đọc AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Tạo Giọng Đọc & Âm Thanh {ttsPointsCost > 0 ? `(-${ttsPointsCost} pts)` : '(Miễn phí)'}</span>
                  </>
                )}
              </button>

              {/* Audio Result Controls if Generated */}
              {ttsAudioUrl && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={handleToggleTtsPlay}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPlayingTts ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlayingTts ? 'Tạm dừng' : 'Nghe Thử'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTtsWav}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Tải tệp WAV về máy"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Tải WAV</span>
                  </button>

                  {/* Highlighted Button: Send to Publish Tab in same Studio */}
                  <button
                    type="button"
                    onClick={handleSendTtsToPublish}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Upload size={14} />
                    <span>Đăng Tác Phẩm Này Lên Kho Audio →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PUBLISH AUDIO (ĐĂNG TÁC PHẨM MỚI LÊN KHO AUDIO) */}
        {/* ========================================================================= */}
        {activeTab === 'publish' && (
          <form onSubmit={handlePublishSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 animate-in fade-in duration-150">
            {/* Status & Points info */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white">Phát hành tác phẩm âm nhạc mới lên hệ thống Haevy Audio</span>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                Thưởng +50 pts
              </span>
            </div>

            {pubErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{pubErrorMsg}</span>
              </div>
            )}

            {pubSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{pubSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Audio File & Cover */}
              <div className="md:col-span-5 space-y-4">
                {/* Audio File Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Tệp âm thanh (Audio File) *</span>
                    {pubAudioUrl && <span className="text-emerald-400 text-[10px] font-bold">Đã có tệp ✓</span>}
                  </label>

                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/80 text-center space-y-2 relative">
                    {pubAudioFileName ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold">
                          <Music size={16} />
                          <span className="truncate max-w-[200px]">{pubAudioFileName}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleTogglePubPreview}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                          >
                            {pubIsPlayingPreview ? <Pause size={12} /> : <Play size={12} />}
                            <span>{pubIsPlayingPreview ? 'Dừng' : 'Nghe thử'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload size={24} className="text-zinc-500" />
                        <span className="text-xs text-zinc-300 font-bold">Tải lên tệp âm thanh từ máy</span>
                        <span className="text-[10px] text-zinc-500">MP3, WAV, FLAC, M4A (Tối đa 50MB)</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handlePubAudioFileUpload(e.target.files[0]);
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Or Option to jump to AI Voice Studio */}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('tts')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto font-medium"
                    >
                      <Sparkles size={12} />
                      <span>Chưa có file âm thanh? Tạo bằng AI Voice Studio →</span>
                    </button>
                  </div>
                </div>

                {/* Album Cover Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Ảnh bìa tác phẩm (Album Cover)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 shadow-md">
                      <img src={pubCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <label className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold border border-zinc-700 flex items-center gap-1.5 cursor-pointer">
                      <ImageIcon size={14} />
                      <span>Tải ảnh bìa tùy chỉnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handlePubCoverUpload(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {PRESET_COVERS.map((cov, i) => (
                      <div
                        key={i}
                        onClick={() => setPubCoverUrl(cov)}
                        className={`h-10 rounded-lg overflow-hidden cursor-pointer border transition-all ${
                          pubCoverUrl === cov ? 'border-amber-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={cov} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Settings */}
              <div className="md:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Tiêu đề tác phẩm *</label>
                    <input
                      type="text"
                      required
                      value={pubTitle}
                      onChange={(e) => setPubTitle(e.target.value)}
                      placeholder="VD: Cơn Mưa Mùa Hạ"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Tác giả / Nghệ danh</label>
                    <input
                      type="text"
                      value={pubArtist}
                      onChange={(e) => setPubArtist(e.target.value)}
                      placeholder="Tên nghệ danh"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Thể loại âm nhạc</label>
                    <select
                      value={pubGenre}
                      onChange={(e) => setPubGenre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      {GENRE_LIST.map((g) => (
                        <option key={g} value={g} className="bg-zinc-900 text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Chất lượng âm thanh (Bitrate)</label>
                    <select
                      value={pubBitrate}
                      onChange={(e) => setPubBitrate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="320kbps Hi-Fi">320kbps Hi-Fi (Khuyên dùng)</option>
                      <option value="Lossless FLAC">Lossless FLAC 24-bit</option>
                      <option value="128kbps Standard">128kbps Standard</option>
                    </select>
                  </div>
                </div>

                {/* VIP Exclusive Toggle */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Đặc quyền dành riêng cho thành viên VIP</p>
                      <p className="text-[10px] text-zinc-400">Chỉ người dùng có gói VIP mới có thể phát bản đầy đủ</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pubIsVipOnly}
                    onChange={(e) => setPubIsVipOnly(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Description & Lyrics */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Mô tả tác phẩm</label>
                  <textarea
                    rows={2}
                    value={pubDescription}
                    onChange={(e) => setPubDescription(e.target.value)}
                    placeholder="Giới thiệu đôi nét về cảm hứng sáng tác tác phẩm..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Lời bài hát / Lời đọc (Lyrics)</label>
                  <textarea
                    rows={3}
                    value={pubLyrics}
                    onChange={(e) => setPubLyrics(e.target.value)}
                    placeholder="Dán toàn bộ lời bài hát hoặc văn bản đọc..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white outline-none resize-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
              <button
                type="submit"
                disabled={pubSubmitting}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
              >
                {pubSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang phát hành lên Kho Audio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Xuất Bản Tác Phẩm Ngay (+50 pts)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUTHOR EKYC (XÁC THỰC DANH TÍNH TÁC GIẢ) */}
        {/* ========================================================================= */}
        {activeTab === 'ekyc' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 animate-in fade-in duration-150">
            {/* Status Banner */}
            {authorStatus === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Hồ sơ eKYC của bạn đã được duyệt chính thức ✓</p>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Nghệ danh: <span className="text-white font-semibold">{authorStageName || 'Tác giả'}</span>. Tác phẩm của bạn có huy hiệu Tác Giả Đã Xác Minh.
                  </p>
                </div>
              </div>
            )}

            {authorStatus === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Hồ sơ eKYC đang được Admin thẩm định</p>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Hồ sơ gồm CCCD, Gmail, SĐT và Khuôn mặt của bạn đang được xét duyệt.
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Header */}
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-zinc-800">
              {[
                { num: 1, label: 'Gmail & SĐT', icon: Mail },
                { num: 2, label: 'CCCD 12 Số', icon: CreditCard },
                { num: 3, label: 'Quét Mặt', icon: Camera },
                { num: 4, label: 'Xem Lại & Nộp', icon: CheckCircle2 },
              ].map((st) => {
                const isCurrent = ekycStep === st.num;
                const isCompleted = ekycStep > st.num;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => setEkycStep(st.num as any)}
                    className={`p-2 rounded-xl text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : isCompleted
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent ? 'bg-amber-400 text-black' : isCompleted ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isCompleted ? '✓' : st.num}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold truncate">{st.label}</span>
                  </button>
                );
              })}
            </div>

            {ekycError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{ekycError}</span>
              </div>
            )}

            {ekycSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{ekycSuccess}</span>
              </div>
            )}

            {/* Step 1: Contact */}
            {ekycStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Địa chỉ Gmail chính chủ *</label>
                    <input
                      type="email"
                      value={ekycEmail}
                      onChange={(e) => setEkycEmail(e.target.value)}
                      placeholder="tacgia@gmail.com"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Số điện thoại di động *</label>
                    <input
                      type="tel"
                      value={ekycPhone}
                      onChange={(e) => setEkycPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Nghệ danh tác giả (Stage Name) *</label>
                    <input
                      type="text"
                      value={ekycStageName}
                      onChange={(e) => setEkycStageName(e.target.value)}
                      placeholder="Nghệ danh biểu diễn"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Thể loại chính</label>
                    <select
                      value={ekycMusicGenre}
                      onChange={(e) => setEkycMusicGenre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      {GENRE_LIST.map((g) => (
                        <option key={g} value={g} className="bg-zinc-900 text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEkycStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Tiếp tục Bước 2 (CCCD) →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: CCCD */}
            {ekycStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Họ và tên thật (Trên CCCD) *</label>
                    <input
                      type="text"
                      value={ekycFullName}
                      onChange={(e) => setEkycFullName(e.target.value.toUpperCase())}
                      placeholder="NGUYỄN VĂN A"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Số Căn cước công dân (12 số) *</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={ekycIdNumber}
                      onChange={(e) => setEkycIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="001201012345"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-amber-300 outline-none"
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 text-center space-y-2">
                    <span className="text-xs font-bold text-zinc-300">Ảnh Mặt Trước CCCD</span>
                    {ekycFrontUrl ? (
                      <div className="relative h-28 rounded-xl overflow-hidden">
                        <img src={ekycFrontUrl} alt="Mặt trước" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEkycFrontUrl('')}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-rose-400 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-1 py-4">
                        <Upload size={20} className="text-zinc-500" />
                        <span className="text-xs text-zinc-400">Tải ảnh mặt trước</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleEkycFileUpload(e.target.files[0], 'front');
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 text-center space-y-2">
                    <span className="text-xs font-bold text-zinc-300">Ảnh Mặt Sau CCCD</span>
                    {ekycBackUrl ? (
                      <div className="relative h-28 rounded-xl overflow-hidden">
                        <img src={ekycBackUrl} alt="Mặt sau" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEkycBackUrl('')}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-rose-400 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-1 py-4">
                        <Upload size={20} className="text-zinc-500" />
                        <span className="text-xs text-zinc-400">Tải ảnh mặt sau</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleEkycFileUpload(e.target.files[0], 'back');
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setEkycStep(1)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    ← Quay lại Bước 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setEkycStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Tiếp tục Bước 3 (Khuôn Mặt) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Face Scan */}
            {ekycStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  {cameraActive ? (
                    <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-amber-400 aspect-[4/3] flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-44 h-56 rounded-full border-2 border-dashed border-amber-300/80 animate-pulse" />
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg cursor-pointer"
                        >
                          Chụp Ảnh Ngay
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2 rounded-full bg-zinc-900 text-zinc-300 text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : ekycFaceUrl ? (
                    <div className="space-y-2">
                      <div className="w-40 h-40 rounded-full mx-auto overflow-hidden border-4 border-emerald-400 shadow-xl">
                        <img src={ekycFaceUrl} alt="Chân dung" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-emerald-400 font-bold">Đã quét khuôn mặt thành công ✓</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-zinc-800 text-amber-300 text-xs rounded-xl cursor-pointer"
                      >
                        Chụp lại
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <Camera size={32} className="text-amber-400 mx-auto" />
                      <p className="text-xs text-zinc-300 font-bold">Quét khuôn mặt qua Camera hoặc tải ảnh chân dung</p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
                        >
                          Mở Camera
                        </button>
                        <label className="px-4 py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-bold cursor-pointer">
                          Tải ảnh từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleEkycFileUpload(e.target.files[0], 'face');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setEkycStep(2)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    ← Quay lại Bước 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setEkycStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Tiếp tục Bước 4 (Hoàn tất) →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {ekycStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                      {ekycFaceUrl && <img src={ekycFaceUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{ekycStageName}</p>
                      <p className="text-zinc-400">Tên thật: {ekycFullName} | CCCD: {ekycIdNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-zinc-300">
                    <p>Gmail: <span className="text-white font-mono">{ekycEmail}</span></p>
                    <p>SĐT: <span className="text-white font-mono">{ekycPhone}</span></p>
                    <p>Thể loại: <span className="text-amber-400">{ekycMusicGenre}</span></p>
                    <p>Trạng thái: <span className="text-emerald-400">Đã đủ 3 điều kiện</span></p>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-400"
                  />
                  <span>Tôi cam kết thông tin CCCD và khuôn mặt là chính chủ, chịu hoàn toàn trách nhiệm về bản quyền tác phẩm âm nhạc đăng tải.</span>
                </label>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setEkycStep(3)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="button"
                    disabled={ekycSubmitting}
                    onClick={handleEkycSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {ekycSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Đang gửi hồ sơ...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Nộp Hồ Sơ Xác Minh (+300 pts)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MY TRACKS & METRICS (KHO TÁC PHẨM CỦA TÔI) */}
        {/* ========================================================================= */}
        {activeTab === 'my-tracks' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 animate-in fade-in duration-150">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Nghệ danh</span>
                <p className="text-sm font-bold text-white truncate">
                  {authorStageName || user?.displayName || 'Tác giả'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Tổng tác phẩm</span>
                <p className="text-sm font-bold text-amber-300 font-mono">
                  {myTracks.length} bài hát
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Lượt nghe cộng đồng</span>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {totalPlays.toLocaleString()} lượt
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-[11px] text-zinc-400 font-medium">Trạng thái eKYC</span>
                <div className="flex items-center gap-1 text-xs font-bold">
                  {isAuthorVerified ? (
                    <span className="text-emerald-400">Đã duyệt ✓</span>
                  ) : authorStatus === 'pending' ? (
                    <span className="text-amber-400">Đang thẩm định</span>
                  ) : (
                    <span className="text-zinc-400">Chưa nộp</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Danh sách tác phẩm đã phát hành ({myTracks.length})
              </h4>
              <button
                type="button"
                onClick={() => setActiveTab('publish')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Đăng bài hát mới</span>
              </button>
            </div>

            {/* Tracks List */}
            {loadingTracks ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Đang tải danh sách bài hát của bạn...
              </div>
            ) : myTracks.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                <Music size={32} className="text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">Bạn chưa đăng tải bài hát nào</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Hãy dùng tab "1. Văn Bản Ra Audio" hoặc "2. Đăng Audio Mới" để chia sẻ bài hát đầu tiên của bạn.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tts')}
                    className="px-4 py-2 bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Tạo bằng AI Voice Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('publish')}
                    className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Tải file lên
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {myTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-md">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        {onSelectTrack && (
                          <button
                            type="button"
                            onClick={() => onSelectTrack(track)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                          >
                            <Play size={16} className="fill-white" />
                          </button>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">{track.title}</p>
                          {track.isVipOnly && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                              <Crown size={10} /> VIP
                            </span>
                          )}
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                            {track.genre}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Headphones size={12} className="text-zinc-500" />
                            <span>{(track.plays || 0).toLocaleString()} lượt nghe</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-zinc-500">{track.bitrate || '320kbps'}</span>
                          <span>•</span>
                          <span>{Math.floor((track.durationSec || 210) / 60)}:{('0' + ((track.durationSec || 210) % 60)).slice(-2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectTrack && (
                        <button
                          type="button"
                          onClick={() => onSelectTrack(track)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Play size={13} />
                          <span className="hidden sm:inline">Phát</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={deletingId === track.id}
                        onClick={() => handleDeleteTrack(track.id, track.title)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa bài hát"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
