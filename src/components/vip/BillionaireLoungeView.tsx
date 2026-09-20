import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Volume2, 
  Bot, 
  Send, 
  RotateCw, 
  Gift, 
  TrendingUp, 
  Flame, 
  Star, 
  Compass, 
  Radio, 
  Share2, 
  Eye, 
  ChevronRight,
  Gem,
  Award,
  Wallet,
  Building2,
  FileCheck2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { 
  playMetallicCardTapSound, 
  playChampagnePopSound, 
  playGoldCoinRainSound, 
  playVaultUnlockSound 
} from '../../utils/luxurySoundFX';

interface BillionaireLoungeViewProps {
  onOpenAuth: () => void;
  onNavigateMode?: (mode: string, params?: any) => void;
  onGoToTopupVip?: () => void;
  onGoToProfile?: () => void;
}

export const BillionaireLoungeView: React.FC<BillionaireLoungeViewProps> = ({
  onOpenAuth,
  onNavigateMode,
  onGoToTopupVip,
  onGoToProfile
}) => {
  const { user, isVip, vipExpiresAt, audioPoints, accountId } = useAuth();

  // Card Flip State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [copiedCardNumber, setCopiedCardNumber] = useState(false);

  // Luxury FX State
  const [showGoldRain, setShowGoldRain] = useState(false);
  const [activeGoldFlakes, setActiveGoldFlakes] = useState(true);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isAudioSuiteActive, setIsAudioSuiteActive] = useState(false);

  // Butler Concierge Chat State
  const [conciergeMessages, setConciergeMessages] = useState<Array<{ sender: 'butler' | 'user'; text: string; timestamp: string }>>([
    {
      sender: 'butler',
      text: 'Kính chào Quý Khách. Tôi là Sterling - Quản gia riêng cấp cao thuộc Haevy Billionaire Lounge. Mọi nhu cầu về trải nghiệm thượng lưu, kích hoạt phòng hòa nhạc riêng tư hoặc quản lý tài sản số của Ngài đã sẵn sàng.',
      timestamp: 'Vừa xong'
    }
  ]);
  const [inputButlerMessage, setInputButlerMessage] = useState('');
  const [isButlerTyping, setIsButlerTyping] = useState(false);

  // Client Display Name
  const ownerName = (user?.displayName || 'KHA TRAN').toUpperCase();
  const displayAccountId = accountId || 'HAEVY-8888-8888';
  const cardNumberFormatted = '8888 •••• •••• 9999';

  // Toggle Card Flip with Sound
  const handleFlipCard = () => {
    playMetallicCardTapSound();
    setIsCardFlipped(!isCardFlipped);
  };

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('8888 8888 8888 9999');
    setCopiedCardNumber(true);
    playMetallicCardTapSound();
    setTimeout(() => setCopiedCardNumber(false), 2000);
  };

  // Trigger Champagne & Gold Rain Celebration
  const handlePopChampagne = () => {
    playChampagnePopSound();
    setTimeout(() => {
      playGoldCoinRainSound();
    }, 400);

    setShowGoldRain(true);
    setTimeout(() => {
      setShowGoldRain(false);
    }, 4500);

    // Add Concierge message
    setConciergeMessages(prev => [
      ...prev,
      {
        sender: 'butler',
        text: '🍾 Đã bật nút chai sâm panh Dom Pérignon Vintage 2008 và rải mưa vàng 24K mừng thịnh vượng của Ngài! Chúc gia nghiệp Ngài vạn đại trường tồn.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Toggle Swiss Vault
  const handleToggleVault = () => {
    playVaultUnlockSound();
    setIsVaultUnlocked(!isVaultUnlocked);
  };

  // Toggle Private Audio Suite
  const handleToggleAudioSuite = () => {
    playMetallicCardTapSound();
    setIsAudioSuiteActive(!isAudioSuiteActive);
    if (!isAudioSuiteActive) {
      setConciergeMessages(prev => [
        ...prev,
        {
          sender: 'butler',
          text: '🎻 Đã kích hoạt Phòng Hòa Nhạc Riêng Tư (Acoustic Master Suite 32-bit DSD). Toàn bộ tạp âm môi trường đã bị triệt tiêu, âm tầng mở rộng 360° theo chuẩn Audiophile hoàng gia.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Send message to Butler
  const handleSendButlerMessage = (customText?: string) => {
    const textToSend = (customText || inputButlerMessage).trim();
    if (!textToSend) return;

    playMetallicCardTapSound();
    setConciergeMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputButlerMessage('');
    setIsButlerTyping(true);

    setTimeout(() => {
      let reply = 'Thưa Ngài, mệnh lệnh đã được chuyển thẳng tới đội ngũ quản lý chuyên trách. Toàn bộ đặc quyền tối cao đã được áp dụng tức thì.';
      const lower = textToSend.toLowerCase();

      if (lower.includes('sâm panh') || lower.includes('rượu') || lower.includes('vàng')) {
        reply = 'Dạ thưa Ngài, rượu sâm panh ướp lạnh và mưa vàng 24K đã sẵn sàng để dâng lên bữa tiệc vinh quang của Ngài.';
        handlePopChampagne();
      } else if (lower.includes('két sắt') || lower.includes('tài sản') || lower.includes('tiền')) {
        reply = 'Dạ thưa Ngài, Két sắt Lượng tử Thụy Sĩ đã mở. Danh mục tài sản ròng và chứng chỉ bản quyền của Ngài đều ở trạng thái an toàn tuyệt đối 100%.';
        setIsVaultUnlocked(true);
        playVaultUnlockSound();
      } else if (lower.includes('nhạc') || lower.includes('phòng trà') || lower.includes('âm thanh')) {
        reply = 'Dạ, phòng hòa nhạc cá nhân đã kích hoạt luồng truyền tải DSD Master 384kHz 32-bit Float riêng cho Ngài.';
        setIsAudioSuiteActive(true);
      } else if (lower.includes('gia phả') || lower.includes('dòng họ')) {
        reply = 'Gia phả của dòng họ Ngài đã được lưu trữ vĩnh cửu trên hạ tầng phi tập trung bất biến, bảo chứng cho ngàn đời sau.';
      }

      setConciergeMessages(prev => [
        ...prev,
        {
          sender: 'butler',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsButlerTyping(false);
    }, 700);
  };

  return (
    <div className="relative space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 24K Floating Gold Flakes Effect */}
      {activeGoldFlakes && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Champagne & Gold Coins Rain Animation */}
      <AnimatePresence>
        {showGoldRain && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
            
            {/* Falling Gold Coins & Sparkles Particles */}
            {Array.from({ length: 45 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  top: '-10%', 
                  left: `${(i * 2.3) % 100}%`,
                  rotate: 0,
                  scale: 0.6 + Math.random() * 0.7
                }}
                animate={{ 
                  top: '110%', 
                  rotate: 360 * (i % 2 === 0 ? 1 : -1),
                  x: (Math.random() - 0.5) * 120
                }}
                transition={{ 
                  duration: 2.2 + (i % 5) * 0.4, 
                  ease: 'linear',
                  delay: (i % 10) * 0.1
                }}
                className="absolute flex items-center justify-center"
              >
                {i % 3 === 0 ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-lg shadow-yellow-500/60 flex items-center justify-center text-[10px] font-black text-amber-950">
                    24K
                  </div>
                ) : i % 3 === 1 ? (
                  <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                ) : (
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
              </motion.div>
            ))}

            {/* Central Champagne Celebration Badge */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              className="relative p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border-2 border-yellow-400 text-center shadow-2xl shadow-yellow-500/50 max-w-md mx-4"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex items-center justify-center text-3xl shadow-xl shadow-yellow-400/40">
                🍾
              </div>
              <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent uppercase tracking-wider">
                Billionaire Celebration
              </h3>
              <p className="text-xs sm:text-sm text-amber-200 mt-2 font-medium">
                Vạn sự hanh thông • Phú quý trường tồn • Đẳng cấp Hoàng Tộc
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billionaire Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-amber-500/40 p-5 sm:p-7 shadow-2xl shadow-amber-950/50">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/10 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest shadow-sm">
              <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>HAEVY BILLIONAIRE CLUB • CENTURION SOVEREIGN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              Trải Nghiệm <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Thượng Lưu 24K</span>
              <span className="text-xs font-bold text-amber-400/90 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                Ultra-Wealthy VIP
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Khu vực thương gia độc quyền dành riêng cho giới tinh hoa: Quản gia riêng AI phục vụ 24/7, Thẻ Đen Centurion Titanium 3D, Két sắt bảo chứng Thụy Sĩ và chuẩn âm thanh Audiophile 32-bit DSD Master.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              id="btn-pop-champagne-gold"
              onClick={handlePopChampagne}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
              title="Khui sâm panh & tạo mưa vàng 24K"
            >
              <span>🍾</span>
              <span>Khui Sâm Panh 24K</span>
            </button>

            <button
              id="btn-toggle-gold-flakes"
              onClick={() => setActiveGoldFlakes(!activeGoldFlakes)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeGoldFlakes 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeGoldFlakes ? 'Hào Quang Vàng: Bật' : 'Hào Quang: Tắt'}</span>
            </button>
          </div>
        </div>

        {/* Wealth Portfolio Metric Cards */}
        <div className="mt-6 pt-5 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold block">Tài Khoản Xu Haevy</span>
              <span className="text-sm sm:text-base font-black text-amber-300 font-mono truncate block">
                {audioPoints.toLocaleString()} Xu
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-300 shrink-0">
              <Gem className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold block">Đá Quý Vũ Trụ</span>
              <span className="text-sm sm:text-base font-black text-yellow-200 font-mono truncate block">
                999+ Viên Ruby
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold block">Hạn Mức Chuyển Khoản</span>
              <span className="text-sm sm:text-base font-black text-emerald-300 font-mono truncate block">
                VÔ HẠN (0% Phí)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold block">Cấp Bậc Tinh Hoa</span>
              <span className="text-sm sm:text-base font-black text-rose-300 font-mono truncate block">
                Sovereign Elite
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Black Card & Private Butler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive 3D Centurion Black Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white">Thẻ Đen Centurion 3D</h3>
              </div>
              <button
                onClick={handleFlipCard}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 transition-all cursor-pointer active:scale-95"
              >
                <RotateCw className="w-3 h-3" />
                <span>Lật Thẻ ({isCardFlipped ? 'Mặt Sau' : 'Mặt Trước'})</span>
              </button>
            </div>

            {/* 3D Holographic Flip Card Container */}
            <div 
              onClick={handleFlipCard}
              className="relative w-full aspect-[1.586/1] cursor-pointer perspective-1000 select-none group"
              title="Nhấp để lật mặt thẻ đen Centurion"
            >
              <div 
                className={`relative w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-700 preserve-3d shadow-2xl ${
                  isCardFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* CARD FRONT */}
                <div 
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between backface-hidden overflow-hidden border-2 border-yellow-400/50 shadow-2xl"
                  style={{
                    background: 'radial-gradient(circle at 10% 20%, #1f1a14 0%, #0c0a09 90%)',
                    boxShadow: '0 20px 50px rgba(245, 158, 11, 0.25), inset 0 0 30px rgba(253, 224, 71, 0.15)'
                  }}
                >
                  {/* Subtle Brushed Metal Texture & Gold Hologram Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-500/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Card Top: Logo & Contactless NFC */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-md shadow-yellow-500/30">
                        <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                          <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-black tracking-widest text-yellow-200 block">HAEVY CENTURION</span>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Sovereign Edition</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-yellow-400/80">
                      <Radio className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold tracking-widest">NFC</span>
                    </div>
                  </div>

                  {/* Card Middle: Metallic Gold Chip & Holographic Emblem */}
                  <div className="relative z-10 flex items-center justify-between py-1">
                    <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200/80 shadow-md flex items-center justify-center">
                      <div className="w-full h-full border-t border-b border-amber-800/40 grid grid-cols-3 opacity-60">
                        <div className="border-r border-amber-800/40" />
                        <div className="border-r border-amber-800/40" />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase text-yellow-300/80 tracking-widest block">PRIVATE WEALTH</span>
                      <span className="text-xs font-black text-amber-300 tracking-wider">UNLIMITED RESERVE</span>
                    </div>
                  </div>

                  {/* Card Bottom: Embossed Card Number, Owner Name & Valid Thru */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base lg:text-lg font-mono font-black text-yellow-100 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {cardNumberFormatted}
                      </span>
                      <button
                        onClick={handleCopyCard}
                        className="p-1 rounded text-yellow-400 hover:text-white transition-colors"
                        title="Sao chép số thẻ"
                      >
                        {copiedCardNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-end justify-between pt-1 border-t border-yellow-500/20 text-zinc-300">
                      <div className="min-w-0">
                        <span className="text-[8px] font-mono uppercase text-zinc-400 block tracking-wider">CARDHOLDER</span>
                        <span className="text-xs sm:text-sm font-mono font-black text-yellow-200 tracking-wider truncate block">
                          {ownerName}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-mono uppercase text-zinc-400 block tracking-wider">VALID THRU</span>
                        <span className="text-xs font-mono font-black text-yellow-200 tracking-wider block">
                          ∞ LIFETIME
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD BACK */}
                <div 
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between backface-hidden overflow-hidden border-2 border-yellow-400/50 shadow-2xl"
                  style={{
                    background: 'radial-gradient(circle at 90% 80%, #1f1a14 0%, #0c0a09 90%)',
                    transform: 'rotateY(180deg)',
                    boxShadow: '0 20px 50px rgba(245, 158, 11, 0.25), inset 0 0 30px rgba(253, 224, 71, 0.15)'
                  }}
                >
                  {/* Magnetic Stripe */}
                  <div className="-mx-6 -mt-1 h-10 bg-zinc-950 border-t border-b border-zinc-800 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 opacity-80" />
                  </div>

                  {/* Signature Strip & CVC */}
                  <div className="space-y-1 my-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-8 rounded bg-zinc-200 px-3 flex items-center justify-end font-serif italic text-zinc-800 text-xs font-black tracking-widest">
                        {ownerName}
                      </div>
                      <div className="w-14 h-8 rounded bg-zinc-900 border border-yellow-500/40 flex items-center justify-center font-mono font-bold text-yellow-300 text-xs tracking-widest">
                        888
                      </div>
                    </div>
                    <span className="text-[8px] text-zinc-400 block text-right font-mono">AUTHORIZED SIGNATURE • CVC/CVV2</span>
                  </div>

                  {/* Card Back Footer Disclaimer */}
                  <div className="text-[8px] text-zinc-400 leading-tight space-y-1">
                    <p>
                      Thẻ danh dự Haevy Centurion Sovereign là tài sản độc bản của thành viên Câu lạc bộ Thượng lưu Haevy. Quyền truy cập VIP Master 32-bit & Quản gia AI 24/7.
                    </p>
                    <div className="flex items-center justify-between text-yellow-300 font-mono text-[9px] pt-1">
                      <span>SWISS VAULT PROTOCOL</span>
                      <span>ID: {displayAccountId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tap Instruction */}
            <p className="text-center text-[11px] text-zinc-400">
              💡 <span className="text-amber-300 font-semibold">Mẹo:</span> Nhấp trực tiếp vào thẻ để lật 3D mặt trước / mặt sau kèm âm thanh kim loại thật.
            </p>

            {/* Card Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleToggleAudioSuite}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                  isAudioSuiteActive
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAudioSuiteActive ? 'Phòng Master: BẬT' : 'Phòng Master 32-bit'}</span>
              </button>

              <button
                onClick={handleToggleVault}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                  isVaultUnlocked
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {isVaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{isVaultUnlocked ? 'Két Thụy Sĩ: MỞ' : 'Mở Két Sắt'}</span>
              </button>
            </div>
          </div>

          {/* Swiss Vault Detail View (Expandable) */}
          <AnimatePresence>
            {isVaultUnlocked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden p-5 rounded-3xl bg-zinc-950 border border-amber-500/40 space-y-3.5 shadow-xl shadow-amber-950/30"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Két Sắt Lượng Tử Thụy Sĩ</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    SECURED 100%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-zinc-400">Xu Haevy Phong Tỏa Bảo Hiểm:</span>
                    <strong className="text-amber-300 font-mono">{audioPoints.toLocaleString()} Xu</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-zinc-400">Cổ Phần Bản Quyền Nhạc Số:</span>
                    <strong className="text-emerald-300 font-mono">10.000 Shares (AA+)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-zinc-400">Bảo Hiểm Di Sản Gia Tộc:</span>
                    <strong className="text-yellow-300 font-mono">Vĩnh Viễn</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Executive AI Butler "Sterling" (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-amber-500/30 shadow-xl flex flex-col h-[560px]">
            {/* Butler Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/30">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-black text-white">Quản Gia Sterling AI</h3>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Private Concierge
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Trợ lý độc quyền 24/7 dành riêng cho chủ thẻ Centurion Sovereign
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Trực Tuyến</span>
              </div>
            </div>

            {/* Quick Butler Commands Chips */}
            <div className="py-3 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 -mx-1 px-1">
              <button
                onClick={() => handleSendButlerMessage('Khui sâm panh và bắn pháo hoa mừng thắng lợi')}
                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                🍾 Khui Sâm Panh
              </button>
              <button
                onClick={() => handleSendButlerMessage('Kích hoạt phòng hòa nhạc riêng Master Audiophile')}
                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border border-yellow-500/30 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                🎻 Phòng Nghe Nhạc Riêng
              </button>
              <button
                onClick={() => handleSendButlerMessage('Báo cáo tình trạng Két Sắt Gia Tộc Thụy Sĩ')}
                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                🛡️ Kiểm Tra Két Sắt
              </button>
              <button
                onClick={() => handleSendButlerMessage('Gợi ý thực đơn âm nhạc thư giãn tối nay')}
                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                🎵 Thực Đơn Âm Nhạc
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {conciergeMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'butler' && (
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 text-xs font-black">
                      S
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[9px] block mt-1 ${msg.sender === 'user' ? 'text-black/70' : 'text-zinc-500'} text-right`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isButlerTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs italic pl-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span>Quản gia Sterling đang phản hồi...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendButlerMessage();
              }}
              className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputButlerMessage}
                onChange={(e) => setInputButlerMessage(e.target.value)}
                placeholder="Nhập chỉ thị cho Quản gia Sterling (Ví dụ: đặt phòng trà riêng, mở két...)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!inputButlerMessage.trim() || isButlerTyping}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chỉ Thị</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 6 Sovereign Lifestyle Privileges Showcase */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-yellow-300" />
            <h2 className="text-base sm:text-lg font-black text-white">
              6 Đặc Quyền Độc Bản Của Giới Thượng Lưu Haevy
            </h2>
          </div>
          {onGoToTopupVip && (
            <button
              onClick={onGoToTopupVip}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Nâng Cấp Thẻ Đen</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              👑
            </div>
            <h4 className="text-sm font-black text-white">Thẻ Titanium Khắc Laser</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Phiên bản thẻ đen kim loại nguyên khối Titanium kèm chip NFC bảo mật cao cấp được chế tác và trao tặng độc quyền.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold">
              🎻
            </div>
            <h4 className="text-sm font-black text-white">Acoustic Suite 32-bit DSD</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mở khóa toàn quyền bộ giải mã âm thanh siêu phân giải DSD 11.2MHz & Spatial Audio 360° theo chuẩn phòng thu Abbey Road.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🛡️
            </div>
            <h4 className="text-sm font-black text-white">Miễn Thuế Phí 0% Vĩnh Viễn</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Không thu bất kỳ khoản phí giao dịch, phí chuyển đổi xu hay rút thưởng nào trong toàn bộ hệ sinh thái 12 phân hệ.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-black text-white">Priority Zero Queue</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mọi yêu cầu tác vụ AI Master, Studio tách lời vocal và xuất mô hình 3D AR đều chạy trên luồng GPU riêng biệt hàng đợi số 0.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              📜
            </div>
            <h4 className="text-sm font-black text-white">Di Sản Gia Tộc Bất Biến</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cây gia phả và di sản văn bia của dòng họ được bảo tồn trên máy chủ phân tán vĩnh cửu, không bao giờ mất dữ liệu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              💎
            </div>
            <h4 className="text-sm font-black text-white">Quà Tặng Thượng Lưu Bí Mật</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gửi tặng gói VIP và các rương quà kim cương tới người thân, đối tác với chữ ký danh dự và bảo mật danh tính tuyệt đối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BillionaireLoungeView;
