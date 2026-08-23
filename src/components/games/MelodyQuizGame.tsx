import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Trophy,
  ChevronRight,
  ShieldAlert,
  Coins,
  ChevronLeft,
  FileAudio
} from 'lucide-react';
import { sound } from './soundEffects';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { AudioQuizTrack } from '../../types';

interface MelodyQuestion {
  id: string;
  songTitle: string;
  artist: string;
  genre: string;
  difficulty: 'Dễ' | 'Trung Bình' | 'Khó';
  audioUrl?: string;
  startOffsetSec?: number;
  durationSec?: number;
  melodyNotes?: Array<{ freq: number; duration: number }>;
  options: Array<{ id: string; title: string; artist: string; isCorrect: boolean }>;
  triviaTip: string;
}

const MELODY_DATABASE: MelodyQuestion[] = [
  {
    id: 'm1',
    songTitle: 'Lạc Trôi',
    artist: 'Sơn Tùng M-TP',
    genre: 'Future Bass / Cổ Trang',
    difficulty: 'Dễ',
    audioUrl: 'https://cdn.freesound.org/previews/518/518305_10226521-lq.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 440, duration: 0.35 },   // A4
      { freq: 493.88, duration: 0.35 },// B4
      { freq: 523.25, duration: 0.4 }, // C5
      { freq: 587.33, duration: 0.35 },// D5
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 493.88, duration: 0.45 },// B4
      { freq: 440, duration: 0.6 },    // A4
    ],
    options: [
      { id: 'o1', title: 'Lạc Trôi', artist: 'Sơn Tùng M-TP', isCorrect: true },
      { id: 'o2', title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP', isCorrect: false },
      { id: 'o3', title: 'Bạc Phận', artist: 'Jack & K-ICM', isCorrect: false },
      { id: 'o4', title: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', isCorrect: false }
    ],
    triviaTip: 'Bản hit phát hành năm 2017 tạo nên cú sốc âm nhạc với phong cách cổ trang kết hợp EDM Future Bass.'
  },
  {
    id: 'm2',
    songTitle: 'See Tình',
    artist: 'Hoàng Thùy Linh',
    genre: 'Dance-Pop / Folk',
    difficulty: 'Dễ',
    audioUrl: 'https://cdn.freesound.org/previews/456/456108_5121236-lq.mp3',
    startOffsetSec: 0,
    durationSec: 10,
    melodyNotes: [
      { freq: 523.25, duration: 0.25 }, // C5
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 659.25, duration: 0.3 },  // E5
      { freq: 783.99, duration: 0.3 },  // G5
      { freq: 659.25, duration: 0.25 }, // E5
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 523.25, duration: 0.5 },  // C5
    ],
    options: [
      { id: 'o1', title: 'Để Mị Nói Cho Mà Nghe', artist: 'Hoàng Thùy Linh', isCorrect: false },
      { id: 'o2', title: 'See Tình', artist: 'Hoàng Thùy Linh', isCorrect: true },
      { id: 'o3', title: 'Kẻ Cắp Gặp Bà Già', artist: 'Hoàng Thùy Linh', isCorrect: false },
      { id: 'o4', title: 'Gieo Quẻ', artist: 'Hoàng Thùy Linh & Đen', isCorrect: false }
    ],
    triviaTip: 'Ca khúc gây sốt toàn cầu trên TikTok do nhóm DTAP sản xuất, làm mưa làm gió khắp châu Á.'
  },
  {
    id: 'm3',
    songTitle: 'Cắt Đôi Nỗi Sầu',
    artist: 'Tăng Duy Tân',
    genre: 'Vinahouse / Pop',
    difficulty: 'Trung Bình',
    melodyNotes: [
      { freq: 392, duration: 0.2 },    // G4
      { freq: 440, duration: 0.2 },    // A4
      { freq: 493.88, duration: 0.2 }, // B4
      { freq: 587.33, duration: 0.35 },// D5
      { freq: 493.88, duration: 0.25 },// B4
      { freq: 440, duration: 0.3 },    // A4
      { freq: 392, duration: 0.5 },    // G4
    ],
    options: [
      { id: 'o1', title: 'Bên Trên Tầng Lầu', artist: 'Tăng Duy Tân', isCorrect: false },
      { id: 'o2', title: 'Dạ Vũ', artist: 'Tăng Duy Tân', isCorrect: false },
      { id: 'o3', title: 'Cắt Đôi Nỗi Sầu', artist: 'Tăng Duy Tân', isCorrect: true },
      { id: 'o4', title: 'Ngây Thơ', artist: 'Tăng Duy Tân & Phong Max', isCorrect: false }
    ],
    triviaTip: 'Hit bùng nổ cuối năm 2023 với tiết tấu bắt tai và điệp khúc "Cắt đôi nỗi sầu anh buông tay..."'
  },
  {
    id: 'm4',
    songTitle: 'Waiting For You',
    artist: 'MONO',
    genre: '80s Synthwave',
    difficulty: 'Trung Bình',
    melodyNotes: [
      { freq: 659.25, duration: 0.25 }, // E5
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 523.25, duration: 0.3 },  // C5
      { freq: 440, duration: 0.3 },     // A4
      { freq: 493.88, duration: 0.35 }, // B4
      { freq: 523.25, duration: 0.4 },  // C5
      { freq: 440, duration: 0.6 },     // A4
    ],
    options: [
      { id: 'o1', title: 'Waiting For You', artist: 'MONO', isCorrect: true },
      { id: 'o2', title: 'Em Là', artist: 'MONO', isCorrect: false },
      { id: 'o3', title: 'Quên Anh Đi', artist: 'MONO', isCorrect: false },
      { id: 'o4', title: 'Chìm Sâu', artist: 'RPT MCK', isCorrect: false }
    ],
    triviaTip: 'Bản hit debut bùng nổ của tân binh MONO cùng nhà sản xuất Onionn với âm hưởng Synthwave thập niên 80.'
  },
  {
    id: 'm5',
    songTitle: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'Pop / Dancehall',
    difficulty: 'Dễ',
    melodyNotes: [
      { freq: 554.37, duration: 0.25 }, // C#5
      { freq: 554.37, duration: 0.25 }, // C#5
      { freq: 659.25, duration: 0.3 },  // E5
      { freq: 554.37, duration: 0.25 }, // C#5
      { freq: 493.88, duration: 0.25 }, // B4
      { freq: 440, duration: 0.3 },     // A4
      { freq: 493.88, duration: 0.5 },  // B4
    ],
    options: [
      { id: 'o1', title: 'Perfect', artist: 'Ed Sheeran', isCorrect: false },
      { id: 'o2', title: 'Shape of You', artist: 'Ed Sheeran', isCorrect: true },
      { id: 'o3', title: 'Bad Habits', artist: 'Ed Sheeran', isCorrect: false },
      { id: 'o4', title: 'Attention', artist: 'Charlie Puth', isCorrect: false }
    ],
    triviaTip: 'Một trong những ca khúc nhiều lượt nghe nhất lịch sử Spotify với tiếng marimba đặc trưng.'
  },
  {
    id: 'm6',
    songTitle: 'Faded',
    artist: 'Alan Walker',
    genre: 'Electro House',
    difficulty: 'Trung Bình',
    melodyNotes: [
      { freq: 622.25, duration: 0.3 },  // D#5
      { freq: 554.37, duration: 0.3 },  // C#5
      { freq: 466.16, duration: 0.35 }, // A#4
      { freq: 415.30, duration: 0.35 }, // G#4
      { freq: 466.16, duration: 0.3 },  // A#4
      { freq: 554.37, duration: 0.5 },  // C#5
    ],
    options: [
      { id: 'o1', title: 'Alone', artist: 'Alan Walker', isCorrect: false },
      { id: 'o2', title: 'Spectre', artist: 'Alan Walker', isCorrect: false },
      { id: 'o3', title: 'Faded', artist: 'Alan Walker', isCorrect: true },
      { id: 'o4', title: 'Darkside', artist: 'Alan Walker', isCorrect: false }
    ],
    triviaTip: 'Bản hit EDM huyền thoại của DJ người Na Uy Alan Walker đạt hàng tỷ lượt xem toàn cầu.'
  },
  {
    id: 'm7',
    songTitle: 'Bật Tình Yêu Lên',
    artist: 'Tăng Duy Tân & Hòa Minzy',
    genre: 'Pop / RnB',
    difficulty: 'Dễ',
    melodyNotes: [
      { freq: 587.33, duration: 0.25 }, // D5
      { freq: 659.25, duration: 0.25 }, // E5
      { freq: 783.99, duration: 0.35 }, // G5
      { freq: 659.25, duration: 0.25 }, // E5
      { freq: 587.33, duration: 0.3 },  // D5
      { freq: 493.88, duration: 0.5 },  // B4
    ],
    options: [
      { id: 'o1', title: 'Thị Mầu', artist: 'Hòa Minzy', isCorrect: false },
      { id: 'o2', title: 'Rời Bỏ', artist: 'Hòa Minzy', isCorrect: false },
      { id: 'o3', title: 'Bật Tình Yêu Lên', artist: 'Tăng Duy Tân & Hòa Minzy', isCorrect: true },
      { id: 'o4', title: 'Không Thể Cùng Nhau Suốt Kiếp', artist: 'Hòa Minzy', isCorrect: false }
    ],
    triviaTip: 'Ca khúc song ca ngọt ngào đứng top thịnh hành nhiều tuần liên tiếp vào đầu năm 2023.'
  }
];

interface MelodyQuizGameProps {
  onBackToLobby?: () => void;
  onOpenAuth?: () => void;
}

export function MelodyQuizGame({ onBackToLobby, onOpenAuth }: MelodyQuizGameProps) {
  const { user, isVip, audioPoints } = useAuth();

  // Firestore tracks state
  const [firestoreTracks, setFirestoreTracks] = useState<MelodyQuestion[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  // Game States
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'round_result' | 'game_over'>('intro');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [coinsReward, setCoinsReward] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Audio HTML5 player ref
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioSnippetTimerRef = useRef<any>(null);

  // Audio wave animation state
  const [waveBars, setWaveBars] = useState<number[]>([40, 65, 30, 85, 95, 45, 70, 55, 90, 60, 40, 80]);

  // Realtime listen to Firestore audioQuizTracks
  useEffect(() => {
    try {
      const q = query(collection(db, 'audioQuizTracks'), where('isActive', '==', true));
      const unsub = onSnapshot(q, (snapshot) => {
        const list: MelodyQuestion[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as AudioQuizTrack;
          list.push({
            id: d.id,
            songTitle: data.songTitle,
            artist: data.artist,
            genre: data.genre || 'V-Pop Hot',
            difficulty: data.difficulty || 'Dễ',
            audioUrl: data.audioUrl,
            startOffsetSec: data.startOffsetSec || 0,
            durationSec: data.durationSec || 10,
            melodyNotes: data.melodyNotes || [
              { freq: 440, duration: 0.35 },
              { freq: 523.25, duration: 0.4 },
              { freq: 587.33, duration: 0.35 },
              { freq: 659.25, duration: 0.45 },
            ],
            options: data.options || [
              { id: 'o1', title: data.songTitle, artist: data.artist, isCorrect: true },
              { id: 'o2', title: 'Bên Trên Tầng Lầu', artist: 'Tăng Duy Tân', isCorrect: false },
              { id: 'o3', title: 'Để Mị Nói Cho Mà Nghe', artist: 'Hoàng Thùy Linh', isCorrect: false },
              { id: 'o4', title: 'Ánh Nắng Của Anh', artist: 'Đức Phúc', isCorrect: false }
            ],
            triviaTip: data.triviaTip || `Ca khúc nổi tiếng của nghệ sĩ ${data.artist}`
          });
        });
        setFirestoreTracks(list);
        setLoadingTracks(false);
      }, (err) => {
        console.warn('Firestore audioQuizTracks subscription notice:', err);
        setLoadingTracks(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore tracks listen error:', e);
      setLoadingTracks(false);
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudioSnippet();
    };
  }, []);

  // Stop active audio player
  const stopAudioSnippet = () => {
    if (audioSnippetTimerRef.current) {
      clearTimeout(audioSnippetTimerRef.current);
      audioSnippetTimerRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  // Combine database: prioritize Admin uploaded tracks + fallback to presets
  const combinedQuestionPool = useMemo(() => {
    if (firestoreTracks.length > 0) {
      return [...firestoreTracks, ...MELODY_DATABASE];
    }
    return MELODY_DATABASE;
  }, [firestoreTracks]);

  // Shuffle 5 questions for each match
  const matchQuestions = useMemo(() => {
    return [...combinedQuestionPool].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [gameState === 'intro', combinedQuestionPool]);

  const currentQuestion = matchQuestions[currentRoundIndex] || matchQuestions[0] || MELODY_DATABASE[0];

  // Play audio snippet or synthetic melody notes
  const playTrackAudioSnippet = (question: MelodyQuestion) => {
    stopAudioSnippet();
    if (isMuted) return;

    setIsPlayingAudio(true);

    if (question.audioUrl) {
      try {
        const audio = new Audio(question.audioUrl);
        audioPlayerRef.current = audio;
        audio.currentTime = question.startOffsetSec || 0;
        
        audio.play().then(() => {
          const playDuration = (question.durationSec || 10) * 1000;
          audioSnippetTimerRef.current = setTimeout(() => {
            stopAudioSnippet();
          }, playDuration);
        }).catch((err) => {
          console.warn('Could not play audio track URL, falling back to synthesizer:', err);
          // Synthesizer fallback
          if (question.melodyNotes && question.melodyNotes.length > 0) {
            sound.playMelodySequence(question.melodyNotes, () => {
              setIsPlayingAudio(false);
            });
          } else {
            setIsPlayingAudio(false);
          }
        });

        audio.onended = () => {
          stopAudioSnippet();
        };
      } catch (e) {
        console.warn('Audio snippet creation failed:', e);
        if (question.melodyNotes && question.melodyNotes.length > 0) {
          sound.playMelodySequence(question.melodyNotes, () => {
            setIsPlayingAudio(false);
          });
        } else {
          setIsPlayingAudio(false);
        }
      }
    } else if (question.melodyNotes && question.melodyNotes.length > 0) {
      sound.playMelodySequence(question.melodyNotes, () => {
        setIsPlayingAudio(false);
      });
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Play the melody snippet on demand
  const playCurrentMelody = () => {
    if (isPlayingAudio) {
      stopAudioSnippet();
    } else {
      playTrackAudioSnippet(currentQuestion);
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Audio wave randomizer effect during playback
  useEffect(() => {
    if (!isPlayingAudio) return;
    const interval = setInterval(() => {
      setWaveBars(Array.from({ length: 14 }, () => Math.floor(Math.random() * 70) + 30));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Start new game match
  const handleStartGame = () => {
    stopAudioSnippet();
    setGameState('playing');
    setCurrentRoundIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectAnswersCount(0);
    setSelectedOptionId(null);
    setTimeLeft(10);
    setRewardClaimed(false);
    setCoinsReward(0);

    // Auto play first melody after 400ms
    setTimeout(() => {
      if (matchQuestions[0]) {
        playTrackAudioSnippet(matchQuestions[0]);
      }
    }, 400);
  };

  // User selects an option
  const handleSelectOption = (option: { id: string; isCorrect: boolean }) => {
    if (selectedOptionId !== null || gameState !== 'playing') return;

    stopAudioSnippet();
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      sound.playCorrect();
      const speedBonus = Math.max(10, timeLeft * 15);
      const comboMultiplier = 1 + combo * 0.25;
      const roundScore = Math.round((100 + speedBonus) * comboMultiplier);

      setScore(prev => prev + roundScore);
      setCombo(prev => {
        const nextCombo = prev + 1;
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);
        return nextCombo;
      });
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      sound.playWrong();
      setCombo(0);
    }

    setGameState('round_result');
  };

  // Time Out Handler
  const handleTimeOut = () => {
    if (gameState !== 'playing') return;
    stopAudioSnippet();
    sound.playWrong();
    setSelectedOptionId('timeout');
    setCombo(0);
    setGameState('round_result');
  };

  // Move to next round
  const handleNextRound = () => {
    stopAudioSnippet();
    if (currentRoundIndex + 1 < matchQuestions.length) {
      const nextIdx = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIdx);
      setSelectedOptionId(null);
      setTimeLeft(10);
      setGameState('playing');

      // Auto play next melody
      setTimeout(() => {
        if (matchQuestions[nextIdx]) {
          playTrackAudioSnippet(matchQuestions[nextIdx]);
        }
      }, 350);
    } else {
      // Finish Match
      sound.playVictory();
      const totalEarnedCoins = Math.round(score / 8) + (correctAnswersCount >= 4 ? 50 : 20);
      setCoinsReward(totalEarnedCoins);
      setGameState('game_over');

      // Claim reward if logged in
      if (user && totalEarnedCoins > 0 && !rewardClaimed) {
        setRewardClaimed(true);
        try {
          updateDoc(doc(db, 'users', user.uid), {
            audioPoints: increment(totalEarnedCoins),
            totalEarnedPoints: increment(totalEarnedCoins)
          });
          addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
            title: `Thưởng Thắng Game Đoán Giai Điệu (${correctAnswersCount}/5 đúng)`,
            amount: totalEarnedCoins,
            type: 'bonus',
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.warn('Error recording game points:', e);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation & Sound Bar */}
      <div className="flex items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xl">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-zinc-800"
        >
          <ChevronLeft size={18} />
          <span>Về Sảnh Game</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
            <Coins size={14} className="text-amber-400" />
            <span>{(audioPoints || 0).toLocaleString('vi-VN')} Xu</span>
          </div>

          <button
            onClick={() => {
              sound.isMuted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: INTRO / LOBBY */}
      {/* ========================================================================= */}
      {gameState === 'intro' && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl animate-bounce">
              <Music size={38} />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider">
              Thử Thách Nhĩ Lực Âm Nhạc
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Đoán Giai Điệu Bài Hát 🎵
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Hệ thống sẽ phát 5 đoạn giai điệu đặc trưng của các bản hit đình đám. Hãy lắng nghe và chọn nhanh đáp án đúng trước khi hết 10 giây!
            </p>
          </div>

          {/* Rule Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1.5">
              <Clock size={20} className="text-indigo-400 mx-auto" />
              <p className="text-xs font-bold text-white">10 Giây / Câu</p>
              <p className="text-[11px] text-zinc-400">Trả lời càng nhanh càng nhiều điểm</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1.5">
              <Flame size={20} className="text-rose-400 mx-auto" />
              <p className="text-xs font-bold text-white">Combo Chuỗi Thắng</p>
              <p className="text-[11px] text-zinc-400">Nhân hệ số điểm thưởng lên tới x2.5</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1.5">
              <Coins size={20} className="text-amber-400 mx-auto" />
              <p className="text-xs font-bold text-white">Thưởng Xu Tức Thì</p>
              <p className="text-[11px] text-zinc-400">Cộng trực tiếp vào ví Xu Audio</p>
            </div>
          </div>

          <div className="text-center pt-2 max-w-sm mx-auto">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-base transition-all duration-200 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={20} className="fill-current" />
              <span>BẮT ĐẦU VÀO TRẬN NGAY</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2 & 3: PLAYING & ROUND RESULT */}
      {/* ========================================================================= */}
      {(gameState === 'playing' || gameState === 'round_result') && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400">Vòng đấu</span>
              <p className="text-lg font-black text-white">
                {currentRoundIndex + 1} <span className="text-xs text-zinc-500 font-normal">/ {matchQuestions.length}</span>
              </p>
            </div>

            {/* Timer Circular / Pill */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-base sm:text-lg transition-all ${
              timeLeft <= 3 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
                : 'bg-zinc-950 border-zinc-800 text-amber-400'
            }`}>
              <Clock size={18} className={timeLeft <= 3 ? 'text-rose-400 animate-spin' : 'text-amber-400'} />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>

            {/* Score & Combo */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1.5 justify-end">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-sm font-black text-amber-400 font-mono">{score}</span>
              </div>
              {combo > 1 && (
                <span className="text-[11px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-bounce">
                  🔥 Combo x{combo}!
                </span>
              )}
            </div>
          </div>

          {/* Audio Synthesizer Player Visualizer Box */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Thể Loại: {currentQuestion.genre} • Độ Khó: {currentQuestion.difficulty}
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                Giai Điệu Này Thuộc Về Bài Hát Nào?
              </h2>
            </div>

            {/* Equalizer Visualizer Waves */}
            <div className="flex items-end justify-center gap-1.5 sm:gap-2.5 h-20 sm:h-28 py-2">
              {waveBars.map((height, idx) => (
                <div
                  key={idx}
                  style={{ height: isPlayingAudio ? `${height}%` : '15%' }}
                  className={`w-2 sm:w-3.5 rounded-full transition-all duration-100 ${
                    isPlayingAudio
                      ? 'bg-gradient-to-t from-indigo-500 via-purple-500 to-amber-400 shadow-lg shadow-indigo-500/40'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Play/Replay Melody Button */}
            <div className="flex justify-center">
              <button
                onClick={playCurrentMelody}
                disabled={isPlayingAudio}
                className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                <Play size={18} className={isPlayingAudio ? 'animate-spin' : 'fill-current'} />
                <span>{isPlayingAudio ? 'Đang phát giai điệu...' : 'Nghe lại giai điệu 🎵'}</span>
              </button>
            </div>
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isRevealed = gameState === 'round_result';
              let buttonStyle = 'bg-zinc-900/90 border-zinc-800 hover:border-indigo-500 hover:bg-zinc-800/80 text-zinc-200';

              if (isRevealed) {
                if (opt.isCorrect) {
                  buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50';
                } else if (isSelected && !opt.isCorrect) {
                  buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                } else {
                  buttonStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  disabled={gameState !== 'playing'}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 shadow-md cursor-pointer ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div>
                      <p className="text-sm sm:text-base font-black tracking-tight">{opt.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{opt.artist}</p>
                    </div>
                  </div>

                  {isRevealed && opt.isCorrect && (
                    <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                  )}
                  {isRevealed && isSelected && !opt.isCorrect && (
                    <XCircle size={22} className="text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Round Result Details & Next Button */}
          {gameState === 'round_result' && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">Thông tin bài hát:</span>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl">{currentQuestion.triviaTip}</p>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>{currentRoundIndex + 1 < matchQuestions.length ? 'Câu Tiếp Theo' : 'Xem Kết Quả Trận'}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: GAME OVER SUMMARY */}
      {/* ========================================================================= */}
      {gameState === 'game_over' && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl animate-bounce">
            <Trophy size={42} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase">
              Hoàn Thành Thử Thách
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Kết Quả Trận Đấu 🏆
            </h2>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Tổng Điểm</span>
              <p className="text-xl font-black text-amber-400 font-mono">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Chính Xác</span>
              <p className="text-xl font-black text-emerald-400 font-mono">{correctAnswersCount}/5 ({Math.round(correctAnswersCount / 5 * 100)}%)</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Max Combo</span>
              <p className="text-xl font-black text-rose-400 font-mono">x{maxCombo}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 bg-amber-500/10 space-y-1">
              <span className="text-[11px] text-amber-300 font-semibold">Xu Nhận Được</span>
              <p className="text-xl font-black text-amber-400 font-mono">+{coinsReward} Xu</p>
            </div>
          </div>

          {/* Login prompt if not signed in */}
          {!user && (
            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 max-w-md mx-auto flex items-center justify-between gap-3 text-left">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-indigo-200">Đăng nhập để tích lũy Xu</p>
                <p className="text-[11px] text-zinc-400">Lưu điểm và đổi quà VIP</p>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                Đăng Nhập
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Chơi Trận Mới</span>
            </button>
            <button
              onClick={onBackToLobby}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Về Sảnh Game</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
