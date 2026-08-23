import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  Award,
  ChevronLeft,
  Coins,
  Sparkles,
  Heart,
  Music2,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { sound } from './soundEffects';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface NoteItem {
  id: number;
  lane: number; // 0, 1, 2, 3
  timeSec: number; // time when it should hit target line
  hit: boolean;
  missed: boolean;
}

interface SongTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  difficulty: 'Dễ' | 'Trung Bình' | 'Khó';
  durationSec: number;
  notesCount: number;
  baseReward: number;
  color: string;
}

const SONG_TRACKS: SongTrack[] = [
  {
    id: 'lofi_chill',
    title: 'Midnight Lo-Fi Dreams',
    artist: 'AudioHub Chillroom',
    genre: 'Lo-Fi Chill / Jazzy',
    bpm: 90,
    difficulty: 'Dễ',
    durationSec: 30,
    notesCount: 38,
    baseReward: 60,
    color: 'from-emerald-500/20 via-teal-950/40 to-zinc-950'
  },
  {
    id: 'electro_cyber',
    title: 'Neon Cyberpunk 2088',
    artist: 'Haevy Sound Lab',
    genre: 'Synthwave / Electro',
    bpm: 128,
    difficulty: 'Trung Bình',
    durationSec: 35,
    notesCount: 65,
    baseReward: 120,
    color: 'from-indigo-500/20 via-purple-950/40 to-zinc-950'
  },
  {
    id: 'hyper_frenzy',
    title: 'Speed Star Hyper Rush',
    artist: 'Bass Master DJ',
    genre: 'Drum & Bass / Speedcore',
    bpm: 160,
    difficulty: 'Khó',
    durationSec: 40,
    notesCount: 95,
    baseReward: 200,
    color: 'from-rose-500/20 via-pink-950/40 to-zinc-950'
  }
];

const LANE_KEYS = ['D', 'F', 'J', 'K'];
const LANE_COLORS = [
  'bg-cyan-500 text-cyan-200 border-cyan-400',
  'bg-indigo-500 text-indigo-200 border-indigo-400',
  'bg-purple-500 text-purple-200 border-purple-400',
  'bg-pink-500 text-pink-200 border-pink-400'
];

interface RhythmRushGameProps {
  onBackToLobby?: () => void;
  onOpenAuth?: () => void;
}

export function RhythmRushGame({ onBackToLobby, onOpenAuth }: RhythmRushGameProps) {
  const { user, audioPoints } = useAuth();

  const [gameState, setGameState] = useState<'select_song' | 'playing' | 'game_over'>('select_song');
  const [selectedSong, setSelectedSong] = useState<SongTrack>(SONG_TRACKS[0]);

  // Rhythm Engine States
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [health, setHealth] = useState(100);
  const [perfectCount, setPerfectCount] = useState(0);
  const [greatCount, setGreatCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<{ text: string; color: string } | null>(null);
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);
  const [coinsReward, setCoinsReward] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Animation & Notes tracking
  const notesRef = useRef<NoteItem[]>([]);
  const [visibleNotes, setVisibleNotes] = useState<Array<{ id: number; lane: number; progress: number }>>([]);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const beatIntervalRef = useRef<any>(null);

  // Sound Synth & Beat Loop
  const playRhythmBeat = useCallback((beatIndex: number) => {
    if (isMuted) return;
    if (beatIndex % 2 === 0) {
      sound.playKick();
    } else {
      sound.playSnare();
    }
  }, [isMuted]);

  // Generate note map according to Song BPM & Duration
  const generateSongNotes = (song: SongTrack): NoteItem[] => {
    const notes: NoteItem[] = [];
    const beatDuration = 60 / song.bpm;
    let currentTime = 1.5; // initial lead-in time 1.5s
    let id = 1;

    while (currentTime < song.durationSec - 1) {
      const lane = Math.floor(Math.random() * 4);
      notes.push({
        id: id++,
        lane,
        timeSec: currentTime,
        hit: false,
        missed: false
      });

      // Chance of double notes on medium/hard
      if (song.difficulty !== 'Dễ' && Math.random() > 0.65) {
        const secondLane = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
        notes.push({
          id: id++,
          lane: secondLane,
          timeSec: currentTime,
          hit: false,
          missed: false
        });
      }

      currentTime += beatDuration * (Math.random() > 0.4 ? 1 : 0.5);
    }
    return notes;
  };

  // Start Playing Game
  const handleStartGame = (song: SongTrack) => {
    setSelectedSong(song);
    const newNotes = generateSongNotes(song);
    notesRef.current = newNotes;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHealth(100);
    setPerfectCount(0);
    setGreatCount(0);
    setMissCount(0);
    setHitFeedback(null);
    setCoinsReward(0);
    setGameState('playing');

    startTimeRef.current = performance.now() / 1000;

    // Start Beat Synthesizer
    let beatIdx = 0;
    const beatMs = (60 / song.bpm) * 1000;
    if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    beatIntervalRef.current = setInterval(() => {
      playRhythmBeat(beatIdx++);
    }, beatMs);
  };

  // Handle Note Hit on a lane
  const handleLaneHit = useCallback((laneIndex: number) => {
    if (gameState !== 'playing') return;

    // Flash lane UI
    setActiveLanes(prev => {
      const next = [...prev];
      next[laneIndex] = true;
      return next;
    });
    setTimeout(() => {
      setActiveLanes(prev => {
        const next = [...prev];
        next[laneIndex] = false;
        return next;
      });
    }, 120);

    const currentTime = (performance.now() / 1000) - startTimeRef.current;

    // Look for the closest unhit note in this lane
    const targetNote = notesRef.current.find(
      n => n.lane === laneIndex && !n.hit && !n.missed && Math.abs(n.timeSec - currentTime) <= 0.35
    );

    if (targetNote) {
      const diff = Math.abs(targetNote.timeSec - currentTime);
      targetNote.hit = true;

      if (diff <= 0.1) {
        // PERFECT
        sound.playHitPerfect();
        setHitFeedback({ text: 'PERFECT! ✨', color: 'text-amber-300' });
        setScore(prev => prev + 100 + combo * 10);
        setCombo(prev => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
        setPerfectCount(prev => prev + 1);
        setHealth(prev => Math.min(100, prev + 2));
      } else if (diff <= 0.22) {
        // GREAT
        sound.playHitGreat();
        setHitFeedback({ text: 'GREAT! ⚡', color: 'text-cyan-300' });
        setScore(prev => prev + 60 + combo * 5);
        setCombo(prev => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
        setGreatCount(prev => prev + 1);
        setHealth(prev => Math.min(100, prev + 1));
      } else {
        // GOOD
        sound.playHitGreat();
        setHitFeedback({ text: 'GOOD 👍', color: 'text-emerald-300' });
        setScore(prev => prev + 30);
        setCombo(prev => prev + 1);
      }
    }
  }, [gameState, combo, maxCombo]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key.toUpperCase();
      const laneIdx = LANE_KEYS.indexOf(key);
      if (laneIdx !== -1) {
        e.preventDefault();
        handleLaneHit(laneIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleLaneHit]);

  // Game Loop: note falling and miss detection
  useEffect(() => {
    if (gameState !== 'playing') return;

    const SPEED_LOOKAHEAD = 1.6; // Time in seconds for a note to fall from top to bottom

    const loop = () => {
      const now = performance.now() / 1000;
      const elapsed = now - startTimeRef.current;

      // Check if song completed
      if (elapsed >= selectedSong.durationSec) {
        finishGame();
        return;
      }

      // Check for missed notes
      notesRef.current.forEach(note => {
        if (!note.hit && !note.missed && elapsed > note.timeSec + 0.25) {
          note.missed = true;
          sound.playHitMiss();
          setHitFeedback({ text: 'MISS ❌', color: 'text-rose-400' });
          setCombo(0);
          setMissCount(prev => prev + 1);
          setHealth(prev => {
            const next = prev - 8;
            if (next <= 0) {
              // Failed game if health drops to 0
              finishGame(true);
            }
            return Math.max(0, next);
          });
        }
      });

      // Calculate visible notes for rendering
      const activeRenderingNotes: Array<{ id: number; lane: number; progress: number }> = [];
      notesRef.current.forEach(note => {
        if (!note.hit && !note.missed) {
          const timeUntilHit = note.timeSec - elapsed;
          if (timeUntilHit <= SPEED_LOOKAHEAD && timeUntilHit >= -0.2) {
            // progress 0 (top) to 1 (hit line)
            const progress = 1 - (timeUntilHit / SPEED_LOOKAHEAD);
            activeRenderingNotes.push({
              id: note.id,
              lane: note.lane,
              progress: Math.min(1.1, Math.max(0, progress))
            });
          }
        }
      });

      setVisibleNotes(activeRenderingNotes);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    };
  }, [gameState, selectedSong]);

  // Finish Game & Record Rewards
  const finishGame = (isFailed = false) => {
    if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    cancelAnimationFrame(animFrameRef.current);

    sound.playVictory();
    setGameState('game_over');

    const totalNotes = notesRef.current.length || 1;
    const hitNotes = perfectCount + greatCount;
    const accuracy = Math.round((hitNotes / totalNotes) * 100);

    let calculatedReward = 0;
    if (!isFailed && accuracy >= 50) {
      calculatedReward = Math.round(selectedSong.baseReward * (accuracy / 100)) + (maxCombo >= 20 ? 30 : 0);
    }
    setCoinsReward(calculatedReward);

    // Save reward to Firestore
    if (user && calculatedReward > 0) {
      try {
        updateDoc(doc(db, 'users', user.uid), {
          audioPoints: increment(calculatedReward),
          totalEarnedPoints: increment(calculatedReward)
        });
        addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: `Thưởng Đấu Nhịp Điệu (${selectedSong.title} - ${accuracy}%)`,
          amount: calculatedReward,
          type: 'bonus',
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Error recording rhythm reward:', e);
      }
    }
  };

  // Compute Rank Grade
  const getRankGrade = () => {
    const totalNotes = notesRef.current.length || 1;
    const hitNotes = perfectCount + greatCount;
    const acc = (hitNotes / totalNotes) * 100;

    if (health <= 0) return { rank: 'FAILED', color: 'text-rose-500' };
    if (acc >= 95) return { rank: 'RANK S+ 👑', color: 'text-amber-400' };
    if (acc >= 85) return { rank: 'RANK S 💎', color: 'text-cyan-400' };
    if (acc >= 75) return { rank: 'RANK A ⚔️', color: 'text-indigo-400' };
    if (acc >= 60) return { rank: 'RANK B 🛡️', color: 'text-emerald-400' };
    return { rank: 'RANK C ⚡', color: 'text-zinc-400' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
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
      {/* SCREEN 1: SONG SELECTION */}
      {/* ========================================================================= */}
      {gameState === 'select_song' && (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl">
              <Zap size={32} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Đấu Nhịp Điệu (Rhythm Tap) ⚡
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
              Chạm hoặc gõ các phím <strong>[D] [F] [J] [K]</strong> theo tiết tấu nốt nhạc rơi trúng vạch đích. Đạt combo và độ chuẩn xác cao để nhận Xu thưởng!
            </p>
          </div>

          {/* Song Tracks Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SONG_TRACKS.map(song => (
              <div
                key={song.id}
                className={`relative overflow-hidden rounded-3xl border border-zinc-800 hover:border-purple-500/50 bg-gradient-to-b ${song.color} p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02]`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      song.difficulty === 'Dễ' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      song.difficulty === 'Trung Bình' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {song.difficulty} • BPM {song.bpm}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">{song.durationSec}s</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">{song.title}</h3>
                    <p className="text-xs text-zinc-400">{song.artist}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80 text-xs font-bold text-amber-400">
                    <div className="flex items-center gap-1">
                      <Coins size={14} />
                      <span>Thưởng: Lên tới +{song.baseReward} Xu</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartGame(song)}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={16} className="fill-current" />
                  <span>Vào Chơi Ngay</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: ACTIVE GAMEPLAY ARENA */}
      {/* ========================================================================= */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Header HUD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400">Bài hát</span>
              <p className="text-sm sm:text-base font-black text-white truncate max-w-[140px] sm:max-w-xs">
                {selectedSong.title}
              </p>
            </div>

            {/* Health Bar */}
            <div className="flex-1 max-w-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart size={12} className="fill-rose-400" /> Năng Lượng
                </span>
                <span className="text-zinc-300 font-mono">{health}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                <div
                  style={{ width: `${health}%` }}
                  className={`h-full transition-all duration-150 ${
                    health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* Score & Combo */}
            <div className="text-right space-y-0.5">
              <p className="text-sm sm:text-lg font-black text-amber-400 font-mono">{score}</p>
              {combo > 2 && (
                <p className="text-xs font-black text-rose-400 animate-bounce">
                  Combo x{combo}!
                </p>
              )}
            </div>
          </div>

          {/* 4 Lanes Rhythm Track Canvas */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-zinc-950 shadow-2xl h-[420px] sm:h-[480px] flex flex-col justify-between p-3">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
              <div className="border-r border-indigo-500/50" />
              <div className="border-r border-indigo-500/50" />
              <div className="border-r border-indigo-500/50" />
              <div />
            </div>

            {/* Floating Hit Feedback Text */}
            {hitFeedback && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-100">
                <span className={`text-2xl sm:text-3xl font-black font-mono drop-shadow-md ${hitFeedback.color}`}>
                  {hitFeedback.text}
                </span>
              </div>
            )}

            {/* Falling Note Items */}
            <div className="absolute inset-0 pointer-events-none">
              {visibleNotes.map(note => {
                const laneLeftPercent = note.lane * 25;
                const topPercent = note.progress * 80; // 80% is the target hit line

                return (
                  <div
                    key={note.id}
                    style={{
                      left: `calc(${laneLeftPercent}% + 1.5%)`,
                      top: `${topPercent}%`,
                      width: '22%'
                    }}
                    className="absolute h-7 rounded-xl shadow-lg flex items-center justify-center transition-transform"
                  >
                    <div className={`w-full h-full rounded-xl border ${LANE_COLORS[note.lane]} flex items-center justify-center shadow-lg font-black text-xs`}>
                      🎵
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Target Hit Line at Bottom */}
            <div className="relative z-10 mt-auto pt-6">
              <div className="w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-500/50 mb-3" />

              {/* 4 Interactive Tap Buttons / Lane Keys */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {LANE_KEYS.map((keyName, idx) => (
                  <button
                    key={keyName}
                    onClick={() => handleLaneHit(idx)}
                    className={`py-4 sm:py-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xl ${
                      activeLanes[idx]
                        ? 'bg-indigo-500 text-white border-white scale-105 shadow-indigo-500/50 ring-2 ring-white'
                        : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-base sm:text-xl font-black">{keyName}</span>
                    <span className="text-[10px] text-zinc-400 uppercase">Chạm</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: GAME OVER RESULT */}
      {/* ========================================================================= */}
      {gameState === 'game_over' && (
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-2xl animate-bounce">
            <Trophy size={42} />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-black uppercase">
              {selectedSong.title}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Kết Quả Màn Chơi ⚡
            </h2>
            <p className={`text-2xl font-black tracking-wider ${getRankGrade().color}`}>
              {getRankGrade().rank}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Điểm Số</span>
              <p className="text-xl font-black text-amber-400 font-mono">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Perfect / Great</span>
              <p className="text-xl font-black text-cyan-400 font-mono">{perfectCount} / {greatCount}</p>
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <button
              onClick={() => handleStartGame(selectedSong)}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition-all shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Chơi Lại Bài Này</span>
            </button>
            <button
              onClick={() => setGameState('select_song')}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Chọn Bài Khác</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
