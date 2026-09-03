import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Upload, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Search, 
  Filter, 
  Check, 
  Flame, 
  Sliders, 
  Zap, 
  Layers, 
  HelpCircle, 
  Info,
  Edit2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  FileAudio
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AudioQuizTrack, AudioQuizOption } from '../../types';

interface AdminAudioQuizManagerProps {
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const GENRES = [
  'Tất Cả',
  'V-Pop Hot',
  'Rap & Hip-Hop',
  'Ballad Sâu Lắng',
  'EDM & Vinahouse',
  'US-UK Hits',
  'K-Pop',
  'Cổ Trang / Dân Gian Đương Đại',
  'Rock & Indie'
];

const PRESET_SAMPLE_TRACKS: Omit<AudioQuizTrack, 'id' | 'createdAt'>[] = [
  {
    songTitle: 'Lạc Trôi',
    artist: 'Sơn Tùng M-TP',
    genre: 'Cổ Trang / Dân Gian Đương Đại',
    difficulty: 'Dễ',
    audioUrl: 'https://cdn.freesound.org/previews/518/518305_10226521-lq.mp3',
    audioName: 'lac_troi_sample.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 440, duration: 0.35 },
      { freq: 493.88, duration: 0.35 },
      { freq: 523.25, duration: 0.4 },
      { freq: 587.33, duration: 0.35 },
      { freq: 523.25, duration: 0.3 },
      { freq: 493.88, duration: 0.45 },
      { freq: 440, duration: 0.6 },
    ],
    options: [
      { id: 'o1', title: 'Lạc Trôi', artist: 'Sơn Tùng M-TP', isCorrect: true },
      { id: 'o2', title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP', isCorrect: false },
      { id: 'o3', title: 'Bạc Phận', artist: 'Jack & K-ICM', isCorrect: false },
      { id: 'o4', title: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', isCorrect: false }
    ],
    triviaTip: 'Bản hit phát hành năm 2017 tạo nên cú sốc âm nhạc với phong cách cổ trang kết hợp EDM Future Bass.',
    isActive: true,
    playsCount: 420,
    correctCount: 388
  },
  {
    songTitle: 'See Tình',
    artist: 'Hoàng Thùy Linh',
    genre: 'V-Pop Hot',
    difficulty: 'Dễ',
    audioUrl: 'https://cdn.freesound.org/previews/456/456108_5121236-lq.mp3',
    audioName: 'see_tinh_snippet.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 523.25, duration: 0.25 },
      { freq: 587.33, duration: 0.25 },
      { freq: 659.25, duration: 0.3 },
      { freq: 783.99, duration: 0.3 },
      { freq: 659.25, duration: 0.25 },
      { freq: 587.33, duration: 0.25 },
      { freq: 523.25, duration: 0.5 },
    ],
    options: [
      { id: 'o1', title: 'Để Mị Nói Cho Mà Nghe', artist: 'Hoàng Thùy Linh', isCorrect: false },
      { id: 'o2', title: 'See Tình', artist: 'Hoàng Thùy Linh', isCorrect: true },
      { id: 'o3', title: 'Kẻ Cắp Gặp Bà Già', artist: 'Hoàng Thùy Linh', isCorrect: false },
      { id: 'o4', title: 'Gieo Quẻ', artist: 'Hoàng Thùy Linh & Đen', isCorrect: false }
    ],
    triviaTip: 'Ca khúc gây sốt toàn cầu trên TikTok do nhóm DTAP sản xuất, làm mưa làm gió khắp châu Á.',
    isActive: true,
    playsCount: 512,
    correctCount: 470
  },
  {
    songTitle: 'Cắt Đôi Nỗi Sầu',
    artist: 'Tăng Duy Tân',
    genre: 'EDM & Vinahouse',
    difficulty: 'Trung Bình',
    audioUrl: 'https://cdn.freesound.org/previews/682/682631_11861866-lq.mp3',
    audioName: 'cat_doi_noi_sau.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 392, duration: 0.2 },
      { freq: 440, duration: 0.2 },
      { freq: 493.88, duration: 0.2 },
      { freq: 587.33, duration: 0.35 },
      { freq: 493.88, duration: 0.25 },
      { freq: 440, duration: 0.3 },
      { freq: 392, duration: 0.5 },
    ],
    options: [
      { id: 'o1', title: 'Bên Trên Tầng Lầu', artist: 'Tăng Duy Tân', isCorrect: false },
      { id: 'o2', title: 'Dạ Vũ', artist: 'Tăng Duy Tân', isCorrect: false },
      { id: 'o3', title: 'Cắt Đôi Nỗi Sầu', artist: 'Tăng Duy Tân', isCorrect: true },
      { id: 'o4', title: 'Ngây Thơ', artist: 'Tăng Duy Tân & Phong Max', isCorrect: false }
    ],
    triviaTip: 'Hit bùng nổ cuối năm 2023 với tiết tấu bắt tai và điệp khúc "Cắt đôi nỗi sầu anh buông tay..."',
    isActive: true,
    playsCount: 390,
    correctCount: 310
  },
  {
    songTitle: 'Waiting For You',
    artist: 'MONO',
    genre: 'V-Pop Hot',
    difficulty: 'Trung Bình',
    audioUrl: 'https://cdn.freesound.org/previews/450/450942_5121236-lq.mp3',
    audioName: 'waiting_for_you_mono.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 659.25, duration: 0.25 },
      { freq: 587.33, duration: 0.25 },
      { freq: 523.25, duration: 0.3 },
      { freq: 440, duration: 0.3 },
      { freq: 493.88, duration: 0.35 },
      { freq: 523.25, duration: 0.4 },
      { freq: 440, duration: 0.6 },
    ],
    options: [
      { id: 'o1', title: 'Waiting For You', artist: 'MONO', isCorrect: true },
      { id: 'o2', title: 'Em Là', artist: 'MONO', isCorrect: false },
      { id: 'o3', title: 'Quên Anh Đi', artist: 'MONO', isCorrect: false },
      { id: 'o4', title: 'Chìm Sâu', artist: 'RPT MCK', isCorrect: false }
    ],
    triviaTip: 'Bản hit debut bùng nổ của tân binh MONO cùng nhà sản xuất Onionn với âm hưởng Synthwave thập niên 80.',
    isActive: true,
    playsCount: 460,
    correctCount: 395
  },
  {
    songTitle: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'US-UK Hits',
    difficulty: 'Dễ',
    audioUrl: 'https://cdn.freesound.org/previews/536/536108_11565147-lq.mp3',
    audioName: 'shape_of_you_snippet.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 554.37, duration: 0.25 },
      { freq: 554.37, duration: 0.25 },
      { freq: 659.25, duration: 0.3 },
      { freq: 554.37, duration: 0.25 },
      { freq: 493.88, duration: 0.25 },
      { freq: 440, duration: 0.3 },
      { freq: 493.88, duration: 0.5 },
    ],
    options: [
      { id: 'o1', title: 'Perfect', artist: 'Ed Sheeran', isCorrect: false },
      { id: 'o2', title: 'Shape of You', artist: 'Ed Sheeran', isCorrect: true },
      { id: 'o3', title: 'Bad Habits', artist: 'Ed Sheeran', isCorrect: false },
      { id: 'o4', title: 'Attention', artist: 'Charlie Puth', isCorrect: false }
    ],
    triviaTip: 'Một trong những ca khúc nhiều lượt nghe nhất lịch sử Spotify với tiếng marimba đặc trưng.',
    isActive: true,
    playsCount: 620,
    correctCount: 580
  }
];

export function AdminAudioQuizManager({ showToast }: AdminAudioQuizManagerProps) {
  const { user, isAdmin, accountId, logSystemActivity } = useAuth();

  // Audio Tracks State
  const [tracks, setTracks] = useState<AudioQuizTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('V-Pop Hot');
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung Bình' | 'Khó'>('Dễ');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [startOffsetSec, setStartOffsetSec] = useState(0);
  const [durationSec, setDurationSec] = useState(10);
  const [triviaTip, setTriviaTip] = useState('');

  // 4 Options
  const [opt2Title, setOpt2Title] = useState('');
  const [opt2Artist, setOpt2Artist] = useState('');
  const [opt3Title, setOpt3Title] = useState('');
  const [opt3Artist, setOpt3Artist] = useState('');
  const [opt4Title, setOpt4Title] = useState('');
  const [opt4Artist, setOpt4Artist] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('Tất Cả');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Dễ' | 'Trung Bình' | 'Khó'>('all');

  // Preview Audio Player
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [isPlayingFormAudio, setIsPlayingFormAudio] = useState(false);
  const [formAudioDuration, setFormAudioDuration] = useState(0);
  const [formAudioCurrentTime, setFormAudioCurrentTime] = useState(0);
  const formAudioRef = useRef<HTMLAudioElement | null>(null);
  const listAudioRef = useRef<HTMLAudioElement | null>(null);

  // Realtime listen to audioQuizTracks
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'audioQuizTracks'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: AudioQuizTrack[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setTracks(list);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching audioQuizTracks:', err);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error in audioQuizTracks listener:', e);
      setLoading(false);
    }
  }, [isAdmin]);

  // Handle local file upload (.mp3, .wav, .m4a, .ogg)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      showToast('Vui lòng chọn đúng định dạng tệp âm thanh (.mp3, .wav, .m4a, .ogg)', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showToast('Dung lượng tệp âm thanh tối đa 12MB', 'error');
      return;
    }

    setAudioFileName(file.name);

    // Auto extract suggested song title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    if (!songTitle) {
      setSongTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Audio = uploadEvent.target?.result as string;
      setAudioUrl(base64Audio);
      showToast(`Đã tải lên tệp: ${file.name} thành công!`);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Form Audio Preview
  const handleToggleFormAudio = () => {
    if (!audioUrl) {
      showToast('Vui lòng tải file hoặc nhập URL âm thanh để nghe thử', 'error');
      return;
    }

    if (!formAudioRef.current) {
      formAudioRef.current = new Audio(audioUrl);
      formAudioRef.current.onended = () => setIsPlayingFormAudio(false);
      formAudioRef.current.ontimeupdate = () => {
        if (formAudioRef.current) {
          setFormAudioCurrentTime(formAudioRef.current.currentTime);
          if (durationSec > 0 && formAudioRef.current.currentTime >= startOffsetSec + durationSec) {
            formAudioRef.current.pause();
            formAudioRef.current.currentTime = startOffsetSec;
            setIsPlayingFormAudio(false);
          }
        }
      };
      formAudioRef.current.onloadedmetadata = () => {
        if (formAudioRef.current) {
          setFormAudioDuration(formAudioRef.current.duration);
        }
      };
    }

    if (isPlayingFormAudio) {
      formAudioRef.current.pause();
      setIsPlayingFormAudio(false);
    } else {
      formAudioRef.current.src = audioUrl;
      formAudioRef.current.currentTime = startOffsetSec;
      formAudioRef.current.play().then(() => {
        setIsPlayingFormAudio(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
        showToast('Không thể phát âm thanh. Vui lòng kiểm tra định dạng/URL', 'error');
      });
    }
  };

  // Toggle List Item Audio Preview
  const handleToggleListAudio = (track: AudioQuizTrack) => {
    if (previewingTrackId === track.id) {
      if (listAudioRef.current) {
        listAudioRef.current.pause();
      }
      setPreviewingTrackId(null);
      return;
    }

    if (!track.audioUrl) {
      showToast('Bài hát này sử dụng nốt tổng hợp MIDI/Synthesizer', 'error');
      return;
    }

    if (listAudioRef.current) {
      listAudioRef.current.pause();
    }

    listAudioRef.current = new Audio(track.audioUrl);
    listAudioRef.current.currentTime = track.startOffsetSec || 0;
    listAudioRef.current.play().then(() => {
      setPreviewingTrackId(track.id);
    }).catch(() => {
      showToast('Không thể phát tệp âm thanh này', 'error');
      setPreviewingTrackId(null);
    });

    listAudioRef.current.onended = () => setPreviewingTrackId(null);
  };

  // Auto generate options suggestions
  const handleAutoFillWrongOptions = () => {
    if (!songTitle || !artist) {
      showToast('Vui lòng điền Tên bài hát và Ca sĩ trước để hệ thống gợi ý', 'error');
      return;
    }

    const suggestions = [
      { title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP' },
      { title: 'Bên Trên Tầng Lầu', artist: 'Tăng Duy Tân' },
      { title: 'Để Mị Nói Cho Mà Nghe', artist: 'Hoàng Thùy Linh' },
      { title: 'Ánh Nắng Của Anh', artist: 'Đức Phúc' },
      { title: 'Chìm Sâu', artist: 'RPT MCK' },
      { title: 'Từng Là', artist: 'Vũ Cát Tường' },
      { title: 'Em Đồng Ý (I Do)', artist: 'Đức Phúc x 911' },
      { title: 'Cơn Mưa Ngang Qua', artist: 'Sơn Tùng M-TP' }
    ].filter(s => s.title.toLowerCase() !== songTitle.toLowerCase());

    const shuffled = suggestions.sort(() => Math.random() - 0.5);
    setOpt2Title(shuffled[0]?.title || 'Bên Trên Tầng Lầu');
    setOpt2Artist(shuffled[0]?.artist || 'Tăng Duy Tân');
    setOpt3Title(shuffled[1]?.title || 'Để Mị Nói Cho Mà Nghe');
    setOpt3Artist(shuffled[1]?.artist || 'Hoàng Thùy Linh');
    setOpt4Title(shuffled[2]?.title || 'Chìm Sâu');
    setOpt4Artist(shuffled[2]?.artist || 'RPT MCK');

    showToast('Đã tự động tạo các phương án gây nhiễu!');
  };

  // Reset Form
  const resetForm = () => {
    setSongTitle('');
    setArtist('');
    setGenre('V-Pop Hot');
    setDifficulty('Dễ');
    setAudioUrl('');
    setAudioFileName('');
    setStartOffsetSec(0);
    setDurationSec(10);
    setTriviaTip('');
    setOpt2Title('');
    setOpt2Artist('');
    setOpt3Title('');
    setOpt3Artist('');
    setOpt4Title('');
    setOpt4Artist('');
    setEditingId(null);
    if (formAudioRef.current) {
      formAudioRef.current.pause();
      setIsPlayingFormAudio(false);
    }
  };

  // Submit Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artist.trim()) {
      showToast('Vui lòng nhập đầy đủ tên bài hát và ca sĩ chính xác', 'error');
      return;
    }

    if (!opt2Title.trim() || !opt3Title.trim() || !opt4Title.trim()) {
      showToast('Vui lòng điền đủ 3 phương án gây nhiễu', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const options: AudioQuizOption[] = [
        { id: 'o1', title: songTitle.trim(), artist: artist.trim(), isCorrect: true },
        { id: 'o2', title: opt2Title.trim(), artist: opt2Artist.trim() || artist.trim(), isCorrect: false },
        { id: 'o3', title: opt3Title.trim(), artist: opt3Artist.trim() || 'Nhiều Nghệ Sĩ', isCorrect: false },
        { id: 'o4', title: opt4Title.trim(), artist: opt4Artist.trim() || 'Nhiều Nghệ Sĩ', isCorrect: false },
      ];

      const payload = {
        songTitle: songTitle.trim(),
        artist: artist.trim(),
        genre,
        difficulty,
        audioUrl: audioUrl.trim() || '',
        audioName: audioFileName || '',
        startOffsetSec: Number(startOffsetSec) || 0,
        durationSec: Number(durationSec) || 10,
        options,
        triviaTip: triviaTip.trim() || `Ca khúc nổi tiếng của nghệ sĩ ${artist.trim()}`,
        isActive: true,
        updatedAt: serverTimestamp(),
        uploadedBy: accountId || user?.email || 'Admin',
      };

      if (editingId) {
        await updateDoc(doc(db, 'audioQuizTracks', editingId), payload);
        showToast(`Đã cập nhật bài hát "${songTitle}" thành công!`);
        if (logSystemActivity) {
          logSystemActivity({
            action: 'system_config_update',
            actionTitle: 'Cập nhật bài hát câu đố',
            targetType: 'setting',
            details: `Admin cập nhật câu hỏi bài hát: ${songTitle}`
          });
        }
      } else {
        await addDoc(collection(db, 'audioQuizTracks'), {
          ...payload,
          playsCount: 0,
          correctCount: 0,
          createdAt: serverTimestamp(),
        });
        showToast(`Đã thêm bài hát "${songTitle}" vào Haevy Games!`);
        if (logSystemActivity) {
          logSystemActivity({
            action: 'system_config_update',
            actionTitle: 'Thêm bài hát câu đố',
            targetType: 'setting',
            details: `Admin thêm bài hát đố vui mới: ${songTitle} (${artist})`
          });
        }
      }

      resetForm();
    } catch (err) {
      console.error('Error saving audio quiz track:', err);
      showToast('Lỗi khi lưu bài hát. Vui lòng thử lại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Track
  const handleEditTrack = (track: AudioQuizTrack) => {
    setEditingId(track.id);
    setSongTitle(track.songTitle);
    setArtist(track.artist);
    setGenre(track.genre || 'V-Pop Hot');
    setDifficulty(track.difficulty || 'Dễ');
    setAudioUrl(track.audioUrl || '');
    setAudioFileName(track.audioName || '');
    setStartOffsetSec(track.startOffsetSec || 0);
    setDurationSec(track.durationSec || 10);
    setTriviaTip(track.triviaTip || '');

    const wrongOpts = track.options.filter(o => !o.isCorrect);
    setOpt2Title(wrongOpts[0]?.title || '');
    setOpt2Artist(wrongOpts[0]?.artist || '');
    setOpt3Title(wrongOpts[1]?.title || '');
    setOpt3Artist(wrongOpts[1]?.artist || '');
    setOpt4Title(wrongOpts[2]?.title || '');
    setOpt4Artist(wrongOpts[2]?.artist || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Đang chỉnh sửa bài hát: ${track.songTitle}`);
  };

  // Toggle Track Status
  const handleToggleStatus = async (track: AudioQuizTrack) => {
    try {
      await updateDoc(doc(db, 'audioQuizTracks', track.id), {
        isActive: !track.isActive,
        updatedAt: serverTimestamp()
      });
      showToast(`Đã ${!track.isActive ? 'kích hoạt' : 'tạm dừng'} bài hát "${track.songTitle}"`);
    } catch (e) {
      showToast('Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  // Delete Track
  const handleDeleteTrack = async (trackId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${title}" khỏi hệ thống câu đố?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'audioQuizTracks', trackId));
      showToast(`Đã xóa bài hát "${title}" thành công`);
      if (logSystemActivity) {
        logSystemActivity({
          action: 'system_config_update',
          actionTitle: 'Xóa bài hát câu đố',
          targetType: 'setting',
          details: `Admin xóa bài hát câu đố: ${title}`
        });
      }
    } catch (e) {
      showToast('Lỗi khi xóa bài hát', 'error');
    }
  };

  // Seed default sample tracks
  const handleSeedPresets = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      let count = 0;
      for (const sample of PRESET_SAMPLE_TRACKS) {
        await addDoc(collection(db, 'audioQuizTracks'), {
          ...sample,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          uploadedBy: 'System Auto-Seed'
        });
        count++;
      }
      showToast(`Đã nạp thành công ${count} bài hát mẫu có sẵn âm thanh vào game!`);
    } catch (e) {
      console.error('Error seeding tracks:', e);
      showToast('Lỗi khi nạp dữ liệu mẫu', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    const matchSearch = t.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = genreFilter === 'Tất Cả' || t.genre === genreFilter;
    const matchDifficulty = difficultyFilter === 'all' || t.difficulty === difficultyFilter;
    return matchSearch && matchGenre && matchDifficulty;
  });

  const totalTracksCount = tracks.length;
  const activeTracksCount = tracks.filter(t => t.isActive).length;
  const realAudioCount = tracks.filter(t => Boolean(t.audioUrl)).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-indigo-950/40 border border-purple-500/20 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
              <Music size={14} className="animate-pulse" />
              <span>Haevy Games • Melody Quiz Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Tải Âm Thanh & Quản Lý Đoán Bài Hát
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Tải tệp âm thanh trực tiếp, thiết lập đoạn trích nghe thử và tạo bộ câu hỏi trắc nghiệm tự động xuất bản vào game.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSeedPresets}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={16} className={isSeeding ? 'animate-spin' : 'text-purple-400'} />
              <span>{isSeeding ? 'Đang nạp mẫu...' : 'Nạp 5 Bài Hit Mẫu'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5">
            <div className="text-xs text-zinc-400 font-medium">Tổng Bài Hát Đố Vui</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{totalTracksCount}</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5">
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Đang Kích Hoạt
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">{activeTracksCount}</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5">
            <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
              <FileAudio size={12} /> Có File Âm Thanh
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">{realAudioCount}</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5">
            <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Zap size={12} /> Nốt Synthesizer
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">{totalTracksCount - realAudioCount}</div>
          </div>
        </div>
      </div>

      {/* Main Creation & Upload Form */}
      <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {editingId ? 'Chỉnh Sửa Bài Hát Đoán Giai Điệu' : 'Thêm Bài Hát & Tải Âm Thanh Mới'}
              </h3>
              <p className="text-xs text-zinc-400">
                {editingId ? 'Cập nhật thông tin đoạn trích hoặc câu hỏi trắc nghiệm' : 'Nhập tệp âm thanh và thiết lập 4 phương án trả lời'}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw size={14} /> Hủy sửa
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1: Audio Upload & Audio URL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-purple-300 flex items-center gap-2">
                <Upload size={16} /> 1. Tải Lên File Âm Thanh Hoặc Nhập URL
              </label>
              {audioFileName && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Check size={12} /> {audioFileName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drag Drop File Input */}
              <div className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-4 text-center cursor-pointer transition bg-purple-950/10 hover:bg-purple-950/20 group">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                    <FileAudio size={20} />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                      Bấm để chọn hoặc kéo thả tệp âm thanh
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">MP3, WAV, M4A, OGG (Tối đa 12MB)</p>
                  </div>
                </div>
              </div>

              {/* Direct Audio URL */}
              <div className="flex flex-col justify-between space-y-2">
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Hoặc dán Direct Audio URL:</label>
                  <input
                    type="url"
                    value={audioUrl.startsWith('data:') ? '' : audioUrl}
                    onChange={(e) => {
                      setAudioUrl(e.target.value);
                      if (e.target.value) setAudioFileName('direct_url_audio.mp3');
                    }}
                    placeholder="https://example.com/audio/my-song.mp3"
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Audio Preview & Controls */}
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleToggleFormAudio}
                    disabled={!audioUrl}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    {isPlayingFormAudio ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlayingFormAudio ? 'Tạm dừng' : 'Nghe thử đoạn trích'}</span>
                  </button>

                  <div className="text-[11px] text-zinc-400 font-mono">
                    {Math.floor(formAudioCurrentTime)}s / {formAudioDuration ? `${Math.floor(formAudioDuration)}s` : `${durationSec}s`}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Trimmer Settings */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Bắt đầu từ (Giây):</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={startOffsetSec}
                  onChange={(e) => setStartOffsetSec(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Thời lượng phát đố:</label>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white text-xs"
                >
                  <option value={5}>5 Giây (Rất khó 🔥)</option>
                  <option value={8}>8 Giây (Thử thách ⚡)</option>
                  <option value={10}>10 Giây (Tiêu chuẩn ⭐)</option>
                  <option value={15}>15 Giây (Dễ nghe)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] text-zinc-400 font-medium">Độ Khó Thưởng:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white text-xs"
                >
                  <option value="Dễ">Dễ (+100 Xu)</option>
                  <option value="Trung Bình">Trung Bình (+150 Xu)</option>
                  <option value="Khó">Khó (+250 Xu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Song Info & Correct Answer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} /> 2. Tên Bài Hát & Ca Sĩ (Đáp Án Đúng)
              </label>
              <button
                type="button"
                onClick={handleAutoFillWrongOptions}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium underline flex items-center gap-1"
              >
                <Sparkles size={12} /> Tự động gợi ý 3 đáp án sai
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Tên Bài Hát (Chính xác):</label>
                <input
                  type="text"
                  required
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Ví dụ: Lạc Trôi, See Tình..."
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/50 text-white placeholder-zinc-500 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Ca sĩ / Nghệ sĩ:</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ví dụ: Sơn Tùng M-TP, Hoàng Thùy Linh..."
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/50 text-white placeholder-zinc-500 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Thể Loại Âm Nhạc:</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs sm:text-sm"
                >
                  {GENRES.filter(g => g !== 'Tất Cả').map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: 3 Wrong Options for Multiple Choice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <label className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
              <HelpCircle size={16} /> 3. Ba Phương Án Gây Nhiễu (Đáp Án Sai)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[11px] font-bold text-rose-400">Phương Án B (Sai):</span>
                <input
                  type="text"
                  required
                  value={opt2Title}
                  onChange={(e) => setOpt2Title(e.target.value)}
                  placeholder="Tên bài hát sai 1"
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={opt2Artist}
                  onChange={(e) => setOpt2Artist(e.target.value)}
                  placeholder="Tên ca sĩ (tùy chọn)"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[11px] font-bold text-rose-400">Phương Án C (Sai):</span>
                <input
                  type="text"
                  required
                  value={opt3Title}
                  onChange={(e) => setOpt3Title(e.target.value)}
                  placeholder="Tên bài hát sai 2"
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={opt3Artist}
                  onChange={(e) => setOpt3Artist(e.target.value)}
                  placeholder="Tên ca sĩ (tùy chọn)"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[11px] font-bold text-rose-400">Phương Án D (Sai):</span>
                <input
                  type="text"
                  required
                  value={opt4Title}
                  onChange={(e) => setOpt4Title(e.target.value)}
                  placeholder="Tên bài hát sai 3"
                  className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={opt4Artist}
                  onChange={(e) => setOpt4Artist(e.target.value)}
                  placeholder="Tên ca sĩ (tùy chọn)"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs"
                />
              </div>
            </div>

            {/* Trivia Fact */}
            <div className="pt-2">
              <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                <Info size={12} className="text-purple-400" /> Thông tin bên lề / Fact thú vị (Hiển thị khi giải đố xong):
              </label>
              <input
                type="text"
                value={triviaTip}
                onChange={(e) => setTriviaTip(e.target.value)}
                placeholder="Ví dụ: Bản hit gây sốt TikTok với hàng triệu lượt xem trên toàn cầu năm 2023..."
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-semibold transition"
            >
              Làm lại
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Đang lưu vào Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{editingId ? 'Cập Nhật Câu Đố' : 'Lưu & Phát Hành Vào Game'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Track Library & Management List */}
      <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-zinc-800/80">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-purple-400" /> Kho Câu Đố Âm Thanh Đoán Bài Hát ({filteredTracks.length})
            </h3>
            <p className="text-xs text-zinc-400">Danh sách các bài hát đang có trong hệ thống câu đố thời gian thực</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát, ca sĩ..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs"
            >
              <option value="all">Mọi độ khó</option>
              <option value="Dễ">Dễ</option>
              <option value="Trung Bình">Trung Bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
        </div>

        {/* Tracks List */}
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-purple-400" /> Đang tải danh sách bài hát...
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
            <Music size={32} className="mx-auto mb-2 opacity-30 text-purple-400" />
            Chưa có bài hát đố vui nào phù hợp. Hãy tải lên tệp âm thanh đầu tiên hoặc bấm "Nạp 5 Bài Hit Mẫu"!
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50 mt-2">
            {filteredTracks.map((track) => {
              const isPlayingThis = previewingTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`py-3.5 px-3 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPlayingThis ? 'bg-purple-950/30 border border-purple-500/30' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Play / Pause button */}
                    <button
                      onClick={() => handleToggleListAudio(track)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                        isPlayingThis
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/50 animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                      title={track.audioUrl ? "Nghe thử đoạn trích" : "Giai điệu Synthesizer"}
                    >
                      {isPlayingThis ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{track.songTitle}</span>
                        <span className="text-xs text-zinc-400">• {track.artist}</span>
                        
                        {track.audioUrl ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                            <FileAudio size={10} /> MP3 Audio ({track.durationSec || 10}s)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                            Synth MIDI
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          track.difficulty === 'Dễ' ? 'bg-emerald-500/10 text-emerald-300' :
                          track.difficulty === 'Trung Bình' ? 'bg-amber-500/10 text-amber-300' :
                          'bg-rose-500/10 text-rose-300'
                        }`}>
                          {track.difficulty}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                        Thể loại: {track.genre} • Đáp án sai: {track.options.filter(o => !o.isCorrect).map(o => o.title).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleStatus(track)}
                      className={`p-1.5 rounded-lg transition ${
                        track.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-800'
                      }`}
                      title={track.isActive ? 'Đang bật trong game' : 'Đang tạm dừng'}
                    >
                      {track.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>

                    <button
                      onClick={() => handleEditTrack(track)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                      title="Chỉnh sửa bài hát"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteTrack(track.id, track.songTitle)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs transition border border-rose-500/20"
                      title="Xóa bài hát"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
