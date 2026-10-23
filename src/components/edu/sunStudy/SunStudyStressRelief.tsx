import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Smile, 
  Sparkles, 
  Music, 
  Coffee, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw,
  Zap
} from 'lucide-react';

export function SunStudyStressRelief() {
  // 4-7-8 Breathing Guide State
  // 4s Inhale -> 7s Hold -> 8s Exhale
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [breathSeconds, setBreathSeconds] = useState<number>(0);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Mini Riddle State
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const riddles = [
    {
      q: 'Cái gì càng lấy đi nhiều thì nó lại càng to ra?',
      a: 'Cái hố (cái lỗ)! Càng đào lấy đất đi thì nó càng to ra đó! 😂'
    },
    {
      q: 'Con số nào không bao giờ đứng yên một chỗ?',
      a: 'Số đo tốc độ (hoặc con số trên đồng hồ)! ⏱️'
    },
    {
      q: 'Có một cây cầu chịu được trọng tải 10 tấn, xe tải nặng 10 tấn chạy qua thì cây cầu không sập, nhưng một chú chim sẻ đậu lên thì cầu gãy. Vì sao?',
      a: 'Vì cây cầu đã được xây từ thời nhà Đinh (hoặc cầu đã quá cũ rồi)! 🐦'
    },
    {
      q: 'Điều gì xảy ra khi bạn ném một viên phấn màu đỏ xuống biển Đen?',
      a: 'Viên phấn sẽ bị ướt chìm xuống đáy biển! Đừng suy nghĩ phức tạp nha! 🌊'
    }
  ];

  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSeconds(prev => {
          if (breathPhase === 'inhale') {
            if (prev >= 4) {
              setBreathPhase('hold');
              return 1;
            }
            return prev + 1;
          } else if (breathPhase === 'hold') {
            if (prev >= 7) {
              setBreathPhase('exhale');
              return 1;
            }
            return prev + 1;
          } else if (breathPhase === 'exhale') {
            if (prev >= 8) {
              setBreathPhase('inhale');
              setCyclesCompleted(c => c + 1);
              return 1;
            }
            return prev + 1;
          }
          return 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  const handleStartBreathing = () => {
    setIsBreathingActive(true);
    setBreathPhase('inhale');
    setBreathSeconds(1);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('ready');
    setBreathSeconds(0);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-2xl shadow-inner">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Trạm Xả Stress & Phục Hồi Năng Lượng (2 Phút)</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                Thư Giãn Não Bộ
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Giải tỏa căng thẳng sau những giờ cày đề căng thẳng với bài tập thở 4-7-8 chuẩn y khoa và đố vui hài hước.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4-7-8 Medical Breathing Exercise */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <Wind size={18} className="text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Liệu Pháp Thở 4-7-8 (Cân Bằng Thần Kinh)</h4>
          </div>

          <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
            Hít vào sâu 4 giây qua mũi • Nín thở giữ oxi 7 giây • Thở ra nhẹ nhàng 8 giây qua miệng để đưa não bộ về tần số Alpha thư thái.
          </p>

          {/* Pulsing Breathing Circle */}
          <div className="relative my-4 flex items-center justify-center">
            <div className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
              breathPhase === 'inhale' 
                ? 'scale-110 border-cyan-400 bg-cyan-500/20 shadow-cyan-500/30'
                : breathPhase === 'hold'
                ? 'scale-110 border-amber-400 bg-amber-500/20 shadow-amber-500/30'
                : breathPhase === 'exhale'
                ? 'scale-90 border-emerald-400 bg-emerald-500/20 shadow-emerald-500/30'
                : 'border-zinc-700 bg-zinc-900'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                {breathPhase === 'inhale' ? 'HÍT VÀO TỪ TỪ (4s)' :
                 breathPhase === 'hold' ? 'GIỮ HƠI THỞ (7s)' :
                 breathPhase === 'exhale' ? 'THỞ RA NHẸ NHÀNG (8s)' : 'SẴN SÀNG'}
              </span>

              <span className="font-mono text-5xl font-black text-white my-1">
                {breathSeconds > 0 ? `${breathSeconds}s` : '🧘'}
              </span>

              <span className="text-[11px] text-zinc-400">
                Chu kỳ đã xong: <span className="text-amber-300 font-bold">{cyclesCompleted}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            {!isBreathingActive ? (
              <button
                onClick={handleStartBreathing}
                className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/20 active:scale-95"
              >
                <Play size={14} fill="currentColor" />
                <span>Bắt Đầu Thở 4-7-8</span>
              </button>
            ) : (
              <button
                onClick={handleStopBreathing}
                className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Pause size={14} />
                <span>Dừng Lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Fun Brain Riddle & Lofi Relax */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Fun Riddle Card */}
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl flex flex-col justify-between gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Smile size={14} />
                <span>Đố Vui Cười Xả Stress #{currentRiddleIdx + 1}</span>
              </span>
              <button
                onClick={() => {
                  setCurrentRiddleIdx((currentRiddleIdx + 1) % riddles.length);
                  setShowAnswer(false);
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Đổi Câu ↻
              </button>
            </div>

            <div className="my-auto">
              <p className="text-sm font-bold text-white leading-relaxed">
                "{riddles[currentRiddleIdx].q}"
              </p>

              {showAnswer ? (
                <div className="mt-4 p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed animate-fadeIn">
                  💡 <strong>Đáp án:</strong> {riddles[currentRiddleIdx].a}
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-800 transition cursor-pointer"
                >
                  Bấm Xem Đáp Án 🙈
                </button>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 text-[11px] text-zinc-400 text-center">
              Sau khi cười sảng khoái, bạn đã sẵn sàng cho hiệp Pomodoro tiếp theo chưa? 🚀
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
