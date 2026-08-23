import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  Coins,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Award,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { sound } from './soundEffects';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface TriviaQuestion {
  id: string;
  question: string;
  category: string;
  options: string[];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't1',
    question: 'Ai là người sáng tác và thể hiện bản hit quốc dân "Nơi Này Có Anh"?',
    category: 'V-Pop',
    options: ['Sơn Tùng M-TP', 'Vũ Cát Tường', 'Soobin Hoàng Sơn', 'Trịnh Thăng Bình'],
    correctIndex: 0,
    explanation: '"Nơi Này Có Anh" được Sơn Tùng M-TP phát hành vào dịp Valentine 2017 và nhanh chóng đạt hàng trăm triệu lượt xem.'
  },
  {
    id: 't2',
    question: 'Nhạc cụ truyền thống nào của Việt Nam chỉ có duy nhất một dây nhưng tạo ra âm sắc vô cùng phong phú?',
    category: 'Nhạc Cụ',
    options: ['Đàn Tranh', 'Đàn Bầu (Độc Huyền Cầm)', 'Đàn Tỳ Bà', 'Đàn Nguyệt'],
    correctIndex: 1,
    explanation: 'Đàn Bầu (Độc huyền cầm) là nhạc cụ độc đáo chỉ có một dây căng trên thân đàn bằng tre hoặc gỗ, dùng cần đàn để rung tạo nốt.'
  },
  {
    id: 't3',
    question: 'Ca khúc "See Tình" của Hoàng Thùy Linh do nhóm sản xuất âm nhạc nào thực hiện?',
    category: 'Nhà Sản Xuất',
    options: ['SpaceSpeakers', 'DTAP', '1989s Entertainment', '1337 Battle'],
    correctIndex: 1,
    explanation: 'DTAP là nhóm 3 nhà sản xuất trẻ tài năng đứng sau thành công của album Hoàng và LINK của Hoàng Thùy Linh.'
  },
  {
    id: 't4',
    question: 'Bản hit huyền thoại "Thriller" (1982) thuộc về nghệ sĩ nào sau đây?',
    category: 'Âm Nhạc Thế Giới',
    options: ['Prince', 'Freddie Mercury', 'Michael Jackson', 'David Bowie'],
    correctIndex: 2,
    explanation: 'Album "Thriller" của Vua nhạc Pop Michael Jackson là album bán chạy nhất mọi thời đại với hơn 70 triệu bản.'
  },
  {
    id: 't5',
    question: 'Quán quân Rap Việt mùa 1 (năm 2020) là ai?',
    category: 'Rap Việt',
    options: ['GDucky', 'Dế Choắt', 'MCK', 'Ricky Star'],
    correctIndex: 1,
    explanation: 'Dế Choắt (đội HLV Wowy) đã xuất sắc giành ngôi vị Quán quân của Rap Việt mùa đầu tiên.'
  },
  {
    id: 't6',
    question: 'Trong âm nhạc phương Tây cơ bản, một quãng tám (Octave) tiêu chuẩn bao gồm bao nhiêu nửa cung?',
    category: 'Lý Thuyết Âm Nhạc',
    options: ['8 nửa cung', '10 nửa cung', '12 nửa cung', '14 nửa cung'],
    correctIndex: 2,
    explanation: 'Hệ thống thang âm bình quân phương Tây chia một quãng tám thành 12 nửa cung (Semitones).'
  },
  {
    id: 't7',
    question: 'Ca khúc "Chạm Khẽ Tim Anh Một Chút Thôi" gắn liền với tên tuổi của nam ca sĩ nào?',
    category: 'V-Pop',
    options: ['Noo Phước Thịnh', 'Erik', 'Đức Phúc', 'Quân A.P'],
    correctIndex: 0,
    explanation: 'Bản Ballad cảm xúc của Noo Phước Thịnh được phát hành vào năm 2017 và là một trong những hit lớn nhất của anh.'
  },
  {
    id: 't8',
    question: 'Giải thưởng âm nhạc danh giá nhất thế giới do Viện hàn lâm Thu âm Hoa Kỳ trao tặng hàng năm có tên là gì?',
    category: 'Giải Thưởng',
    options: ['Billboard Music Awards', 'Grammy Awards', 'American Music Awards', 'BRIT Awards'],
    correctIndex: 1,
    explanation: 'Giải Grammy (Grammy Awards) được coi là giải thưởng âm nhạc uy tín và danh giá nhất toàn cầu.'
  },
  {
    id: 't9',
    question: 'Nhạc sĩ nào là tác giả của bản "Tiến Quân Ca" - Quốc ca nước Cộng hòa Xã hội Chủ nghĩa Việt Nam?',
    category: 'Lịch Sử Âm Nhạc',
    options: ['Văn Cao', 'Trịnh Công Sơn', 'Phạm Tuyên', 'Lưu Hữu Phước'],
    correctIndex: 0,
    explanation: 'Nhạc sĩ Văn Cao sáng tác "Tiến Quân Ca" vào năm 1944, sau đó được chọn làm Quốc ca Việt Nam.'
  },
  {
    id: 't10',
    question: 'Nghệ sĩ nữ nào sở hữu nhiều giải Grammy nhất trong lịch sử âm nhạc thế giới tính đến nay?',
    category: 'Kỷ Lục Âm Nhạc',
    options: ['Taylor Swift', 'Adele', 'Beyoncé', 'Whitney Houston'],
    correctIndex: 2,
    explanation: 'Beyoncé nắm giữ kỷ lục lịch sử với hơn 32 giải thưởng Grammy danh giá.'
  }
];

const LADDER_PRIZES = [10, 25, 50, 100, 200, 350, 550, 800, 1100, 1500];
const SAFE_CHECKPOINTS = [4, 9]; // index 4 (câu 5 = 200 Xu) & index 9 (câu 10 = 1500 Xu)

interface MusicTriviaGameProps {
  onBackToLobby?: () => void;
  onOpenAuth?: () => void;
}

export function MusicTriviaGame({ onBackToLobby, onOpenAuth }: MusicTriviaGameProps) {
  const { user, audioPoints } = useAuth();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'round_result' | 'game_over'>('intro');
  const [currentLevel, setCurrentLevel] = useState(0); // 0 to 9
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  // Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [lifelineTimeUsed, setLifelineTimeUsed] = useState(false);
  const [lifelineHintUsed, setLifelineHintUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const currentQ = TRIVIA_QUESTIONS[currentLevel] || TRIVIA_QUESTIONS[0];

  // Timer effect
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

  // Start match
  const handleStartGame = () => {
    setCurrentLevel(0);
    setTimeLeft(20);
    setSelectedOptionIdx(null);
    setIsAnswerRevealed(false);
    setLifeline5050Used(false);
    setLifelineTimeUsed(false);
    setLifelineHintUsed(false);
    setHiddenOptions([]);
    setHintMessage(null);
    setEarnedCoins(0);
    setGameState('playing');
  };

  // Use 50:50 Lifeline
  const handleUse5050 = () => {
    if (lifeline5050Used || gameState !== 'playing') return;
    setLifeline5050Used(true);

    const wrongIndexes = [0, 1, 2, 3].filter(idx => idx !== currentQ.correctIndex);
    const removeIndices = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(removeIndices);
    sound.playTick();
  };

  // Use Time Extension Lifeline (+15s)
  const handleUseTime = () => {
    if (lifelineTimeUsed || gameState !== 'playing') return;
    setLifelineTimeUsed(true);
    setTimeLeft(prev => prev + 15);
    sound.playTick();
  };

  // Use Expert Hint
  const handleUseHint = () => {
    if (lifelineHintUsed || gameState !== 'playing') return;
    setLifelineHintUsed(true);
    sound.playTick();
    setHintMessage(`💡 Gợi ý chuyên gia: Đáp án đúng liên quan trực tiếp đến "${currentQ.options[currentQ.correctIndex]}".`);
  };

  // Select Option
  const handleSelectOption = (idx: number) => {
    if (selectedOptionIdx !== null || gameState !== 'playing') return;

    setSelectedOptionIdx(idx);
    setIsAnswerRevealed(true);

    if (idx === currentQ.correctIndex) {
      sound.playCorrect();
      const prize = LADDER_PRIZES[currentLevel];
      setEarnedCoins(prize);
      setGameState('round_result');
    } else {
      sound.playWrong();
      // Compute safe fallback prize
      let fallbackPrize = 0;
      if (currentLevel >= 5) fallbackPrize = LADDER_PRIZES[4]; // 200 Xu
      setEarnedCoins(fallbackPrize);
      setGameState('round_result');
    }
  };

  // Time Out
  const handleTimeOut = () => {
    if (gameState !== 'playing') return;
    sound.playWrong();
    setSelectedOptionIdx(-1); // Timeout
    setIsAnswerRevealed(true);
    let fallbackPrize = 0;
    if (currentLevel >= 5) fallbackPrize = LADDER_PRIZES[4];
    setEarnedCoins(fallbackPrize);
    setGameState('round_result');
  };

  // Move to next question or claim victory
  const handleNextStep = () => {
    if (selectedOptionIdx === currentQ.correctIndex) {
      if (currentLevel + 1 < TRIVIA_QUESTIONS.length) {
        setCurrentLevel(prev => prev + 1);
        setTimeLeft(20);
        setSelectedOptionIdx(null);
        setIsAnswerRevealed(false);
        setHiddenOptions([]);
        setHintMessage(null);
        setGameState('playing');
      } else {
        // Grand Master Victory (All 10 questions)
        finishGame(LADDER_PRIZES[9]);
      }
    } else {
      // Game Over on wrong answer
      finishGame(earnedCoins);
    }
  };

  // Cash Out early to keep current prize
  const handleCashOut = () => {
    const safePrize = currentLevel > 0 ? LADDER_PRIZES[currentLevel - 1] : 0;
    finishGame(safePrize);
  };

  // Finish Game & Record Rewards
  const finishGame = (finalCoins: number) => {
    setEarnedCoins(finalCoins);
    sound.playVictory();
    setGameState('game_over');

    if (user && finalCoins > 0) {
      try {
        updateDoc(doc(db, 'users', user.uid), {
          audioPoints: increment(finalCoins),
          totalEarnedPoints: increment(finalCoins)
        });
        addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: `Thưởng Thử Tài Tri Thức Âm Nhạc (Cấp ${currentLevel + 1})`,
          amount: finalCoins,
          type: 'bonus',
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Error recording trivia reward:', e);
      }
    }
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
      {/* SCREEN 1: INTRO */}
      {/* ========================================================================= */}
      {gameState === 'intro' && (
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl animate-bounce">
            <Target size={38} />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-black uppercase tracking-wider">
              Đấu Trí Tri Thức
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Thử Tài Tri Thức Âm Nhạc 🎯
            </h1>
            <p className="text-sm text-zinc-300">
              Vượt qua 10 câu hỏi thử thách với 2 mốc an toàn. Chinh phục danh hiệu "Học Giả Âm Nhạc" và rinh trọn 1,500 Xu!
            </p>
          </div>

          {/* Ladder Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-400 font-bold">10 Câu Hỏi</span>
              <p className="text-sm font-black text-white mt-1">Độ Khó Tăng Dần</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-400 font-bold">3 Trợ Giúp</span>
              <p className="text-sm font-black text-sky-400 mt-1">50:50, Thời Gian, Gợi Ý</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-400 font-bold">Mốc An Toàn</span>
              <p className="text-sm font-black text-emerald-400 mt-1">Câu 5 (200 Xu)</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 bg-amber-500/10 text-center">
              <span className="text-[11px] text-amber-300 font-bold">Giải Cao Nhất</span>
              <p className="text-sm font-black text-amber-400 mt-1">1,500 Xu Thưởng</p>
            </div>
          </div>

          <div className="max-w-sm mx-auto pt-2">
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-base transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap size={18} className="fill-current" />
              <span>BẮT ĐẦU CHINH PHỤC</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2 & 3: PLAYING & ROUND RESULT */}
      {/* ========================================================================= */}
      {(gameState === 'playing' || gameState === 'round_result') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Question Panel */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top HUD */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-400">Chủ đề: {currentQ.category}</span>
                <p className="text-lg font-black text-white">
                  Câu hỏi {currentLevel + 1} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
                </p>
              </div>

              {/* Countdown Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-base ${
                timeLeft <= 5 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
                  : 'bg-zinc-950 border-zinc-800 text-sky-400'
              }`}>
                <Clock size={16} />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              </div>

              {/* Current Value */}
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 font-semibold">Giá trị câu hỏi</span>
                <p className="text-base font-black text-amber-400 font-mono">+{LADDER_PRIZES[currentLevel]} Xu</p>
              </div>
            </div>

            {/* Question Text Box */}
            <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl space-y-4">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                {currentQ.question}
              </h2>

              {hintMessage && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-in fade-in">
                  {hintMessage}
                </div>
              )}
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((optText, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                const isSelected = selectedOptionIdx === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let buttonStyle = 'bg-zinc-900/90 border-zinc-800 hover:border-sky-500 hover:bg-zinc-800/80 text-zinc-200';

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                  } else {
                    buttonStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60';
                  }
                }

                if (isHidden) {
                  return (
                    <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-zinc-900 bg-zinc-950/30 opacity-30 cursor-not-allowed">
                      <span className="text-xs text-zinc-600 font-bold">[Phương án bị loại 50:50]</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={gameState !== 'playing'}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 shadow-md cursor-pointer ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <p className="text-sm sm:text-base font-bold">{optText}</p>
                    </div>

                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle size={20} className="text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lifelines Toolbar */}
            {gameState === 'playing' && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <span className="text-xs font-bold text-zinc-400">Quyền Trợ Giúp:</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUse5050}
                    disabled={lifeline5050Used}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !lifeline5050Used
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                        : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
                    }`}
                  >
                    50:50
                  </button>

                  <button
                    onClick={handleUseTime}
                    disabled={lifelineTimeUsed}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !lifelineTimeUsed
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                        : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
                    }`}
                  >
                    +15 Giây
                  </button>

                  <button
                    onClick={handleUseHint}
                    disabled={lifelineHintUsed}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !lifelineHintUsed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
                    }`}
                  >
                    Gợi Ý
                  </button>
                </div>
              </div>
            )}

            {/* Explanation & Next Step Button */}
            {gameState === 'round_result' && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-sky-300">Giải thích chi tiết:</p>
                  <p className="text-xs text-zinc-300 max-w-md">{currentQ.explanation}</p>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-sm transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>
                    {selectedOptionIdx === currentQ.correctIndex
                      ? currentLevel + 1 < TRIVIA_QUESTIONS.length
                        ? 'Câu Tiếp Theo'
                        : 'Hoàn Thành Xuất Sắc!'
                      : 'Xem Tổng Kết Thưởng'}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Ladder Progression Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                Thang Tiền Thưởng Xu
              </h3>

              <div className="space-y-1.5">
                {LADDER_PRIZES.map((prize, idx) => {
                  const isCurrent = idx === currentLevel;
                  const isSafe = SAFE_CHECKPOINTS.includes(idx);
                  const isPassed = idx < currentLevel;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30 ring-2 ring-sky-300 scale-105'
                          : isPassed
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : isSafe
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-950/60 text-zinc-400 border border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>Câu {idx + 1}</span>
                        {isSafe && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">MỐC AN TOÀN</span>}
                      </div>
                      <span>+{prize} Xu</span>
                    </div>
                  );
                }).reverse()}
              </div>

              {/* Cash out option */}
              {gameState === 'playing' && currentLevel > 0 && (
                <button
                  onClick={handleCashOut}
                  className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer transition-all"
                >
                  Dừng chơi & Nhận an toàn (+{LADDER_PRIZES[currentLevel - 1]} Xu)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: GAME OVER */}
      {/* ========================================================================= */}
      {gameState === 'game_over' && (
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-b from-sky-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-2xl animate-bounce">
            <Trophy size={42} />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full text-xs font-black uppercase">
              Tổng Kết Thử Thách
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Kết Quả Tri Thức Âm Nhạc 🎯
            </h2>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Cấp Độ Đạt Được</span>
              <p className="text-xl font-black text-white font-mono">Câu {currentLevel + 1} / 10</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-400 font-semibold">Danh Hiệu</span>
              <p className="text-base font-black text-sky-400">
                {currentLevel >= 9 ? 'Đại Học Giả 👑' : currentLevel >= 5 ? 'Chuyên Gia Nhạc ⚔️' : 'Tập Sự Âm Nhạc 🛡️'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 bg-amber-500/10 space-y-1">
              <span className="text-[11px] text-amber-300 font-semibold">Xu Nhận Được</span>
              <p className="text-xl font-black text-amber-400 font-mono">+{earnedCoins} Xu</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-sm transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Chinh Phục Lại</span>
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
