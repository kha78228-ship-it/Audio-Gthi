import React, { useState, useEffect, useRef } from 'react';
import {
  Dices,
  RotateCcw,
  Sparkles,
  Trophy,
  Crown,
  Coins,
  Gift,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Volume2,
  VolumeX,
  History,
  Flame,
  Zap
} from 'lucide-react';
import { sound } from './soundEffects';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface WheelSector {
  id: string;
  label: string;
  subLabel: string;
  color: string;
  textColor: string;
  type: 'coins' | 'vip_1d' | 'vip_3d' | 'jackpot' | 'crowd_ticket';
  value: number;
  probabilityWeight: number;
}

const SECTORS: WheelSector[] = [
  {
    id: 's1',
    label: '50 Xu',
    subLabel: 'Audio Xu',
    color: '#06b6d4', // Cyan
    textColor: '#ffffff',
    type: 'coins',
    value: 50,
    probabilityWeight: 30
  },
  {
    id: 's2',
    label: 'VIP 1 Ngày',
    subLabel: 'Hoàng Gia',
    color: '#f59e0b', // Amber Gold
    textColor: '#000000',
    type: 'vip_1d',
    value: 1,
    probabilityWeight: 10
  },
  {
    id: 's3',
    label: '100 Xu',
    subLabel: 'Audio Xu',
    color: '#10b981', // Emerald
    textColor: '#ffffff',
    type: 'coins',
    value: 100,
    probabilityWeight: 25
  },
  {
    id: 's4',
    label: '200 Xu',
    subLabel: 'Audio Xu',
    color: '#6366f1', // Indigo
    textColor: '#ffffff',
    type: 'coins',
    value: 200,
    probabilityWeight: 15
  },
  {
    id: 's5',
    label: 'VIP 3 Ngày',
    subLabel: 'Hoàng Gia',
    color: '#ec4899', // Pink / Rose
    textColor: '#ffffff',
    type: 'vip_3d',
    value: 3,
    probabilityWeight: 5
  },
  {
    id: 's6',
    label: '300 Xu',
    subLabel: 'May Mắn',
    color: '#8b5cf6', // Purple
    textColor: '#ffffff',
    type: 'coins',
    value: 300,
    probabilityWeight: 10
  },
  {
    id: 's7',
    label: '500 Xu',
    subLabel: 'Đại Thưởng',
    color: '#f43f5e', // Rose
    textColor: '#ffffff',
    type: 'coins',
    value: 500,
    probabilityWeight: 4
  },
  {
    id: 's8',
    label: 'JACKPOT',
    subLabel: '1,500 Xu',
    color: '#eab308', // Yellow Gold
    textColor: '#000000',
    type: 'jackpot',
    value: 1500,
    probabilityWeight: 1
  }
];

interface LuckyWheelGameProps {
  onBackToLobby?: () => void;
  onOpenAuth?: () => void;
  onOpenVipHub?: () => void;
}

export function LuckyWheelGame({ onBackToLobby, onOpenAuth, onOpenVipHub }: LuckyWheelGameProps) {
  const { user, isVip, audioPoints, accountId } = useAuth();

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelSector | null>(null);
  const [spinHistory, setSpinHistory] = useState<Array<{ id: string; label: string; time: string; color: string }>>([]);
  const [hasFreeSpin, setHasFreeSpin] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [spinError, setSpinError] = useState<string | null>(null);

  // Check free daily spin status from local storage
  useEffect(() => {
    const lastFreeDate = localStorage.getItem('last_lucky_wheel_free_spin');
    const today = new Date().toDateString();
    if (lastFreeDate === today) {
      setHasFreeSpin(false);
    } else {
      setHasFreeSpin(true);
    }

    // Load saved spin history
    const saved = localStorage.getItem('lucky_wheel_history');
    if (saved) {
      try {
        setSpinHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Weighted random picker
  const pickRandomSector = (): { sector: WheelSector; index: number } => {
    const totalWeight = SECTORS.reduce((sum, s) => sum + s.probabilityWeight, 0);
    let randomVal = Math.random() * totalWeight;

    for (let i = 0; i < SECTORS.length; i++) {
      randomVal -= SECTORS[i].probabilityWeight;
      if (randomVal <= 0) {
        return { sector: SECTORS[i], index: i };
      }
    }
    return { sector: SECTORS[0], index: 0 };
  };

  // Perform Spin
  const handleSpin = async (mode: 'free' | 'coin') => {
    if (isSpinning) return;
    setSpinError(null);
    setWonPrize(null);

    // Validate coins if paid spin
    if (mode === 'coin') {
      if (!user) {
        if (onOpenAuth) onOpenAuth();
        return;
      }
      if ((audioPoints || 0) < 50) {
        setSpinError('Bạn không đủ 50 Xu để thực hiện lượt quay này. Hãy tích lũy thêm Xu hoặc nhận thưởng miễn phí!');
        return;
      }
    }

    setIsSpinning(true);

    // Deduct 50 Xu if paid spin
    if (mode === 'coin' && user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          audioPoints: increment(-50)
        });
        await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: 'Chi phí 1 lượt Vòng Quay May Mắn',
          amount: -50,
          type: 'spend',
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Deduct spin coins error:', e);
      }
    } else {
      // Mark free spin as used
      localStorage.setItem('last_lucky_wheel_free_spin', new Date().toDateString());
      setHasFreeSpin(false);
    }

    const { sector, index } = pickRandomSector();
    const sectorAngle = 360 / SECTORS.length;

    // Calculate rotation: add multiple full rotations (e.g. 5-7 turns)
    // Wheel pointer is at top (0 deg / 270 deg). Sector index i is centered at (i * sectorAngle + sectorAngle/2)
    const targetSectorCenter = (index * sectorAngle) + (sectorAngle / 2);
    // Align with top pointer (270 deg)
    const targetAngle = 360 - targetSectorCenter + 270;
    const totalNewAngle = rotationAngle + (360 * 6) + (targetAngle - (rotationAngle % 360));

    setRotationAngle(totalNewAngle);

    // Audio ticking interval while spinning
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playTick();
      tickCount++;
      if (tickCount > 35) clearInterval(tickInterval);
    }, 110);

    // Finish spinning after 4.5 seconds
    setTimeout(async () => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonPrize(sector);
      sound.playVictory();

      // Save to local history
      const newHistoryItem = {
        id: Date.now().toString(),
        label: `${sector.label} (${sector.subLabel})`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        color: sector.color
      };
      setSpinHistory(prev => {
        const updated = [newHistoryItem, ...prev.slice(0, 7)];
        localStorage.setItem('lucky_wheel_history', JSON.stringify(updated));
        return updated;
      });

      // Claim reward on Firestore
      if (user) {
        try {
          if (sector.type === 'coins' || sector.type === 'jackpot') {
            await updateDoc(doc(db, 'users', user.uid), {
              audioPoints: increment(sector.value),
              totalEarnedPoints: increment(sector.value)
            });
            await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
              title: `Trúng thưởng ${sector.label} từ Vòng Quay May Mắn`,
              amount: sector.value,
              type: 'bonus',
              createdAt: serverTimestamp()
            });
          } else if (sector.type === 'vip_1d' || sector.type === 'vip_3d') {
            const addDays = sector.value;
            const now = new Date();
            const futureDate = new Date(now.getTime() + addDays * 24 * 60 * 60 * 1000);
            await updateDoc(doc(db, 'users', user.uid), {
              vipTier: 'vip',
              vipExpiresAt: futureDate.toISOString()
            });
            await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
              title: `Kích hoạt VIP ${addDays} Ngày từ Vòng Quay May Mắn`,
              amount: 0,
              type: 'bonus',
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.warn('Error recording lucky wheel reward:', err);
        }
      }
    }, 4500);
  };

  const sectorAngle = 360 / SECTORS.length;

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

      {/* Main Wheel Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Wheel Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="space-y-1 mb-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider">
                Thử Vận May Hàng Ngày
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Vòng Quay May Mắn Audio 🎡
              </h1>
            </div>

            {/* Pointer / Needle Indicator at Top */}
            <div className="relative z-30 -mb-5 flex flex-col items-center">
              <div className="w-8 h-8 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-black font-black text-xs">
                ▼
              </div>
            </div>

            {/* SVG Interactive Wheel */}
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 my-4">
              <svg
                viewBox="0 0 300 300"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
                }}
                className="w-full h-full drop-shadow-2xl rounded-full"
              >
                {/* Outer rim */}
                <circle cx="150" cy="150" r="148" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />

                {/* Slices */}
                {SECTORS.map((sector, i) => {
                  const startAngle = i * sectorAngle;
                  const endAngle = (i + 1) * sectorAngle;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  const x1 = 150 + 140 * Math.cos(startRad);
                  const y1 = 150 + 140 * Math.sin(startRad);
                  const x2 = 150 + 140 * Math.cos(endRad);
                  const y2 = 150 + 140 * Math.sin(endRad);

                  const pathData = `M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`;

                  // Text angle
                  const midAngle = startAngle + sectorAngle / 2;
                  const textRad = (midAngle * Math.PI) / 180;
                  const textX = 150 + 95 * Math.cos(textRad);
                  const textY = 150 + 95 * Math.sin(textRad);

                  return (
                    <g key={sector.id}>
                      <path d={pathData} fill={sector.color} stroke="#18181b" strokeWidth="2" />
                      <text
                        x={textX}
                        y={textY}
                        fill={sector.textColor}
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      >
                        {sector.label}
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub Cap */}
                <circle cx="150" cy="150" r="28" fill="#09090b" stroke="#eab308" strokeWidth="3" />
                <circle cx="150" cy="150" r="18" fill="#eab308" />
              </svg>
            </div>

            {/* Error banner */}
            {spinError && (
              <div className="w-full max-w-md p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold text-center animate-in fade-in">
                {spinError}
              </div>
            )}

            {/* Spin Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-2">
              <button
                onClick={() => handleSpin('free')}
                disabled={isSpinning || !hasFreeSpin}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                  hasFreeSpin && !isSpinning
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/25 active:scale-95'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Sparkles size={16} />
                <span>{hasFreeSpin ? 'Quay Miễn Phí (1/1)' : 'Đã Dùng Lượt Free'}</span>
              </button>

              <button
                onClick={() => handleSpin('coin')}
                disabled={isSpinning}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                  !isSpinning
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/25 active:scale-95'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Coins size={16} />
                <span>Quay Thêm (50 Xu)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info & Winning History Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Won Prize Display Banner */}
          {wonPrize && (
            <div className="p-5 rounded-3xl border border-amber-500/50 bg-gradient-to-br from-amber-950/60 via-yellow-950/40 to-zinc-950 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl animate-bounce">
                <Gift size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Chúc Mừng Bạn Trúng Thưởng
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">{wonPrize.label}</h3>
                <p className="text-xs text-zinc-300">{wonPrize.subLabel}</p>
              </div>
              <p className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                Đã tự động cộng vào tài khoản của bạn!
              </p>
            </div>
          )}

          {/* Reward Prizes Breakdown */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              Cơ Cấu Giải Thưởng
            </h3>

            <div className="space-y-2">
              {SECTORS.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-bold text-zinc-200">{s.label}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{s.subLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Spins History */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={16} className="text-indigo-400" />
              Lịch Sử Quay Của Bạn
            </h3>

            {spinHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Chưa có lượt quay nào hôm nay</p>
            ) : (
              <div className="space-y-2">
                {spinHistory.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
                    <span className="font-bold text-zinc-300">{item.label}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
