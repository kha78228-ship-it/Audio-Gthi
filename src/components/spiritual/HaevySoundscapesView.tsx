import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  Pause, 
  Wind, 
  Heart, 
  Bell, 
  Activity,
  Compass,
  Radio,
  Clock,
  RotateCcw
} from 'lucide-react';
import { SpiritualSoundscape } from '../../types';
import { SPIRITUAL_SOUNDSCAPES } from '../../data/spiritualData';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

export function HaevySoundscapesView() {
  const [activeFrequency, setActiveFrequency] = useState<number | null>(null);
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [volume, setVolume] = useState(0.25);

  // Meditation Breathing Pacer State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState<'4-7-8' | '4-4-4-4'>('4-4-4-4');
  const [breathPhase, setBreathPhase] = useState<'Hít vào' | 'Giữ hơi' | 'Thở ra' | 'Tĩnh lặng'>('Hít vào');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Solfeggio sound loop toggle
  const toggleSolfeggioTone = (freq: number) => {
    haptics.impact('medium');
    if (isPlayingTone && activeFrequency === freq) {
      spiritualAudio.stopSolfeggioTone();
      setIsPlayingTone(false);
      setActiveFrequency(null);
    } else {
      spiritualAudio.startSolfeggioTone(freq, volume);
      setIsPlayingTone(true);
      setActiveFrequency(freq);
    }
  };

  // Trigger Tibetan Gong strike
  const playGongStrike = (freq: number) => {
    haptics.impact('heavy');
    spiritualAudio.playSingingBowl(freq);
  };

  // Breathing Pacer Loop
  useEffect(() => {
    if (!isBreathingActive) return;

    let interval: any;
    let step = 0;

    const runPattern = () => {
      if (breathingPattern === '4-4-4-4') {
        // Box breathing (4s in, 4s hold, 4s out, 4s hold)
        const cycle = step % 16;
        if (cycle < 4) {
          setBreathPhase('Hít vào');
        } else if (cycle < 8) {
          setBreathPhase('Giữ hơi');
        } else if (cycle < 12) {
          setBreathPhase('Thở ra');
        } else {
          setBreathPhase('Tĩnh lặng');
        }
      } else {
        // 4-7-8 Deep Relaxation
        const cycle = step % 19;
        if (cycle < 4) {
          setBreathPhase('Hít vào');
        } else if (cycle < 11) {
          setBreathPhase('Giữ hơi');
        } else {
          setBreathPhase('Thở ra');
        }
      }
      step++;
      setTimerSeconds(s => s + 1);
    };

    runPattern();
    interval = setInterval(runPattern, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPattern]);

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-950/70 via-teal-950/70 to-zinc-950 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              Sóng Chữa Lành Solfeggio & Chuông Xoay Tây Tạng
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              🔔 Âm Thanh Chữa Lành & Thiền Định
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
              Kích hoạt tần số năng lượng 7 Luân Xa (Chakras), thanh tẩy sóng não Theta, chuông xoay Tây Tạng và nhịp thở dẫn lưu tĩnh tâm thư giãn sâu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                spiritualAudio.playTempleBell();
                haptics.impact('medium');
              }}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-200 text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              Thỉnh Chuông Chùa
            </button>
            <button
              onClick={() => {
                spiritualAudio.playWindChime();
                haptics.impact('light');
              }}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-teal-500/30 hover:bg-teal-900/40 text-teal-200 text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Wind className="w-4 h-4 text-teal-400" />
              Chuông Gió Phong Thủy
            </button>
          </div>
        </div>
      </div>

      {/* Breathing Meditation Pacer Circle */}
      <div className="w-full bg-zinc-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-3 border-b border-zinc-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Nhịp Thở Thiền Định Tâm Thức
            </h3>
            <p className="text-xs text-zinc-400">Giúp điều hòa nhịp tim, giảm căng thẳng cortisol và kích hoạt hệ thần kinh phó giao cảm.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBreathingPattern('4-4-4-4')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                breathingPattern === '4-4-4-4' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Hộp 4-4-4-4
            </button>
            <button
              onClick={() => setBreathingPattern('4-7-8')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                breathingPattern === '4-7-8' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Sâu 4-7-8
            </button>
          </div>
        </div>

        {/* Visual Breathing Halo Indicator */}
        <div className="relative w-52 h-52 flex items-center justify-center my-4">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 border-4 ${
              breathPhase === 'Hít vào'
                ? 'scale-110 bg-emerald-500/20 border-emerald-400 shadow-2xl shadow-emerald-500/40'
                : breathPhase === 'Giữ hơi'
                ? 'scale-105 bg-amber-500/20 border-amber-400 shadow-2xl shadow-amber-500/40'
                : 'scale-90 bg-sky-500/20 border-sky-400 shadow-2xl shadow-sky-500/40'
            }`}
          />
          <div className="relative z-10 text-center space-y-1">
            <span className="text-xl sm:text-2xl font-black text-white">{breathPhase}</span>
            <p className="text-xs text-emerald-300 font-mono font-bold">
              {isBreathingActive ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}` : 'Sẵn Sàng'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            haptics.impact('medium');
            setIsBreathingActive(!isBreathingActive);
            if (!isBreathingActive) {
              setTimerSeconds(0);
              spiritualAudio.playTempleBell();
            }
          }}
          className={`px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
            isBreathingActive
              ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 hover:bg-rose-600/50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
          }`}
        >
          {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isBreathingActive ? 'Tạm Dừng Luyện Thở' : 'Bắt Đầu Phiên Thiền Thở'}
        </button>
      </div>

      {/* Solfeggio 7 Frequency Cards */}
      <div className="w-full space-y-4">
        <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          7 Tần Số Sóng Âm Solfeggio & Luân Xa (Chakras)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPIRITUAL_SOUNDSCAPES.map(s => {
            const freq = s.frequencyHz || s.frequency || 432;
            const isThisPlaying = isPlayingTone && activeFrequency === freq;
            return (
              <div
                key={s.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isThisPlaying
                    ? 'bg-gradient-to-b from-emerald-950/80 to-zinc-950 border-emerald-400 ring-2 ring-emerald-500/30 shadow-2xl'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-emerald-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {s.frequencyLabel || `${freq} Hz`}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{s.chakraName || s.chakra}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{s.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => toggleSolfeggioTone(freq)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      isThisPlaying
                        ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40'
                        : 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-600/50'
                    }`}
                  >
                    {isThisPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isThisPlaying ? 'Dừng Tần Số' : 'Phát Sóng Theta'}
                  </button>

                  <button
                    onClick={() => playGongStrike(freq / 2)}
                    title="Đánh tiếng chuông xoay Tây Tạng ở tần số này"
                    className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-xs font-bold border border-zinc-700/80 transition-all flex items-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Chuông
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
