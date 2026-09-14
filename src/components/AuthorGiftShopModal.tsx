import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Sparkles, 
  Coins, 
  Send, 
  CheckCircle2, 
  Crown, 
  Heart, 
  Star, 
  Flame, 
  Music, 
  User as UserIcon, 
  X, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GIFT_CATALOG } from '../data';
import { GiftItem, AuthorGiftDonation, Track } from '../types';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthorGiftShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onGoToTopup: () => void;
  currentTrack?: Track;
  allTracks?: Track[];
  preselectedAuthor?: {
    uid: string;
    stageName: string;
    trackTitle?: string;
    trackId?: string;
  };
}

const QUICK_WISHES = [
  'Bài hát quá tuyệt vời, tiếp tục phát huy nhé tác giả!',
  'Giai điệu chạm đến trái tim, mong chờ tác phẩm tiếp theo!',
  'Tiếp thêm năng lượng sáng tác bài hát mới nhé!',
  'Ủng hộ nghệ sĩ hết mình, chúc ca khúc sớm lên Top 1 Trending!',
  'Món quà nhỏ tri ân giọng hát và tài năng của bạn!'
];

export function AuthorGiftShopModal({
  isOpen,
  onClose,
  onOpenAuth,
  onGoToTopup,
  currentTrack,
  allTracks = [],
  preselectedAuthor
}: AuthorGiftShopModalProps) {
  const { user, audioPoints, isVip, vipTier, sendGiftToAuthor } = useAuth();

  const [selectedGift, setSelectedGift] = useState<GiftItem>(GIFT_CATALOG[0]);
  const [selectedAuthor, setSelectedAuthor] = useState<{
    uid: string;
    stageName: string;
    trackTitle?: string;
    trackId?: string;
  }>({
    uid: preselectedAuthor?.uid || currentTrack?.addedBy || 'author-featured-01',
    stageName: preselectedAuthor?.stageName || currentTrack?.artist || 'ChillHop Vibes',
    trackTitle: preselectedAuthor?.trackTitle || currentTrack?.title || 'Midnight Lo-fi Beats',
    trackId: preselectedAuthor?.trackId || currentTrack?.id || '1'
  });

  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<{
    gift: GiftItem;
    authorName: string;
    points: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'leaderboard' | 'history'>('shop');
  const [recentGifts, setRecentGifts] = useState<AuthorGiftDonation[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  // Update selected author if props change
  useEffect(() => {
    if (preselectedAuthor) {
      setSelectedAuthor(preselectedAuthor);
    } else if (currentTrack) {
      setSelectedAuthor({
        uid: currentTrack.addedBy || 'author-featured-01',
        stageName: currentTrack.artist || 'ChillHop Vibes',
        trackTitle: currentTrack.title,
        trackId: currentTrack.id
      });
    }
  }, [preselectedAuthor, currentTrack]);

  // Subscribe to real-time gift donations
  useEffect(() => {
    if (!isOpen) return;

    setLoadingGifts(true);
    const q = query(
      collection(db, 'giftDonations'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: AuthorGiftDonation[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          senderUid: d.senderUid || '',
          senderName: d.senderName || 'Người nghe yêu nhạc',
          senderAccountId: d.senderAccountId,
          senderPhoto: d.senderPhoto,
          isSenderVip: d.isSenderVip || false,
          authorUid: d.authorUid || '',
          authorStageName: d.authorStageName || 'Tác giả',
          giftId: d.giftId || 'gift',
          giftName: d.giftName || 'Quà tặng',
          giftIcon: d.giftIcon || '🎁',
          pointsCost: d.pointsCost || 0,
          message: d.message,
          trackTitle: d.trackTitle,
          createdAt: d.createdAt
        };
      });
      setRecentGifts(list);
      setLoadingGifts(false);
    }, (err) => {
      console.warn('Gift donations fetch listener fallback:', err);
      setLoadingGifts(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract unique authors from all tracks for author dropdown
  const authorOptions = Array.from(
    new Map(
      allTracks.map((t) => [
        t.artist,
        {
          uid: t.addedBy || `author-${t.artist}`,
          stageName: t.artist,
          trackTitle: t.title,
          trackId: t.id
        }
      ])
    ).values()
  );

  const canAfford = audioPoints >= selectedGift.pointsCost;

  const handleSendGift = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!canAfford) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendGiftToAuthor({
        authorUid: selectedAuthor.uid,
        authorStageName: selectedAuthor.stageName,
        giftId: selectedGift.id,
        giftName: selectedGift.name,
        giftIcon: selectedGift.iconEmoji,
        pointsCost: selectedGift.pointsCost,
        message: customMessage || 'Tặng tác giả món quà ủng hộ nhiệt tình từ thính giả!',
        trackId: selectedAuthor.trackId,
        trackTitle: selectedAuthor.trackTitle
      });

      if (res.success) {
        setSendSuccess({
          gift: selectedGift,
          authorName: selectedAuthor.stageName,
          points: selectedGift.pointsCost
        });
        setCustomMessage('');
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert('Không thể gửi quà: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="author-gift-shop-modal"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                  Cửa Hàng Quà Tặng Tác Giả
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Điểm Audio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gửi quà tặng bằng Điểm Audio để khích lệ và đồng hành cùng các nghệ sĩ & tác giả Haevy Audio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Point Pill */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-amber-500/30 rounded-xl">
                <Coins className="w-4 h-4 text-amber-400" />
                <div className="text-xs">
                  <span className="text-slate-400">Số dư: </span>
                  <span className="font-bold text-amber-400">{audioPoints.toLocaleString()} pts</span>
                </div>
                {isVip && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                    VIP
                  </span>
                )}
              </div>
            ) : (
              <button
                id="btn-gift-shop-login-prompt"
                onClick={onOpenAuth}
                className="hidden sm:inline-flex text-xs px-3 py-1.5 font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
              >
                Đăng nhập để tặng quà
              </button>
            )}

            <button
              id="btn-close-gift-shop"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-sm">
          <button
            id="tab-gift-catalog"
            onClick={() => { setActiveTab('shop'); setSendSuccess(null); }}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'shop'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gift className="w-4 h-4" />
            Kho Quà Tặng ({GIFT_CATALOG.length})
          </button>
          <button
            id="tab-gift-recent"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Bảng Tin Tặng Quà Cộng Đồng
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GIFT CATALOG & DONATION FORM */}
          {activeTab === 'shop' && (
            <>
              {/* Success celebration banner */}
              {sendSuccess && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-amber-950/40 border border-emerald-500/30 flex items-start gap-4 animate-in zoom-in-95 duration-200">
                  <div className="text-4xl animate-bounce">
                    {sendSuccess.gift.iconEmoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-emerald-300">
                        Tặng quà thành công cho tác giả {sendSuccess.authorName}!
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Bạn đã gửi tặng <strong>{sendSuccess.gift.name}</strong> (-{sendSuccess.points.toLocaleString()} Điểm Audio). 
                      Tác giả đã nhận được trọn vẹn điểm thưởng và lời chúc tri ân của bạn.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => setSendSuccess(null)}
                        className="text-xs px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium rounded-lg transition-colors border border-emerald-500/30"
                      >
                        Tặng thêm quà khác
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs text-slate-400 hover:text-slate-200 underline"
                      >
                        Xem trên bảng tin cộng đồng
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Author Target Selection & Balance Bar */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md">
                    {selectedAuthor?.stageName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Đang tặng quà cho tác giả:</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        id="select-gift-author"
                        value={selectedAuthor.stageName}
                        onChange={(e) => {
                          const found = authorOptions.find((a) => a.stageName === e.target.value);
                          if (found) setSelectedAuthor(found);
                        }}
                        className="bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        {authorOptions.map((opt, idx) => (
                          <option key={idx} value={opt.stageName}>
                            {opt.stageName} {opt.trackTitle ? `(Tác phẩm: ${opt.trackTitle})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Điểm Audio khả dụng</div>
                    <div className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      {user ? `${audioPoints.toLocaleString()} pts` : '0 pts (Chưa đăng nhập)'}
                    </div>
                  </div>
                  <button
                    id="btn-quick-topup-points"
                    onClick={onGoToTopup}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold rounded-xl transition-all shadow-md flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Nạp / Nhận thêm điểm
                  </button>
                </div>
              </div>

              {/* Gift Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Chọn Món Quà Âm Nhạc
                  </h3>
                  <span className="text-xs text-slate-400">
                    Bấm vào từng món quà để xem hiệu ứng và lời chúc
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {GIFT_CATALOG.map((gift) => {
                    const isSelected = selectedGift.id === gift.id;
                    const canAffordThis = audioPoints >= gift.pointsCost;

                    const rarityBorder = {
                      common: isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-800/40',
                      rare: isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-blue-500/40 bg-slate-800/40',
                      epic: isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 hover:border-purple-500/40 bg-slate-800/40',
                      legendary: isSelected ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10' : 'border-slate-800 hover:border-amber-500/40 bg-slate-800/40'
                    }[gift.rarity];

                    return (
                      <div
                        key={gift.id}
                        id={`gift-card-${gift.id}`}
                        onClick={() => setSelectedGift(gift)}
                        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${rarityBorder} ${
                          isSelected ? 'ring-2 ring-amber-500/50 scale-[1.02]' : 'hover:bg-slate-800/70'
                        }`}
                      >
                        {/* Rarity Tag */}
                        <div className="flex items-center justify-between text-[10px] font-medium mb-1">
                          <span className={`px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                            gift.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            gift.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            gift.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-slate-700/40 text-slate-400'
                          }`}>
                            {gift.tag}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>

                        {/* Gift Icon & Emoji */}
                        <div className="my-2 text-center">
                          <span className="text-3xl filter drop-shadow-md select-none inline-block transform hover:scale-110 transition-transform">
                            {gift.iconEmoji}
                          </span>
                          <div className="font-semibold text-xs text-slate-200 mt-1 line-clamp-1">
                            {gift.name}
                          </div>
                        </div>

                        {/* Cost & Bonus */}
                        <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                          <div className="font-bold text-amber-400 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            {gift.pointsCost.toLocaleString()} pts
                          </div>
                          <span className="text-[10px] text-slate-400">
                            +{gift.authorExpBonus} exp
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Gift Details & Custom Message Form */}
              <div className="p-4.5 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                      {selectedGift.iconEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-sm">{selectedGift.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-300 font-semibold rounded-md border border-amber-500/20">
                          {selectedGift.pointsCost.toLocaleString()} Điểm Audio
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {selectedGift.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Wish Chips */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    Lời chúc & Thông điệp gửi kèm (Tùy chọn)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_WISHES.map((wish, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomMessage(wish)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/90 text-slate-300 hover:text-slate-100 border border-slate-700/50 transition-colors text-left"
                      >
                        {wish}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="input-gift-message"
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Gửi lời nhắn động viên ấm áp đến tác giả ${selectedAuthor.stageName}...`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>

                {/* Send Button Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      Tác giả nhận 100% số điểm ({selectedGift.pointsCost} pts) để tích lũy doanh thu sáng tác.
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!user ? (
                      <button
                        id="btn-login-to-send-gift"
                        onClick={onOpenAuth}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        Đăng nhập để tặng quà
                      </button>
                    ) : !canAfford ? (
                      <button
                        id="btn-not-enough-points"
                        onClick={onGoToTopup}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Thiếu {(selectedGift.pointsCost - audioPoints).toLocaleString()} pts - Nạp / Kiếm điểm
                      </button>
                    ) : (
                      <button
                        id="btn-confirm-send-gift"
                        disabled={isSubmitting}
                        onClick={handleSendGift}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang gửi tặng...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Gửi Tặng {selectedGift.iconEmoji} ({selectedGift.pointsCost.toLocaleString()} pts)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: RECENT COMMUNITY GIFTS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Bảng Tin Tặng Quà Thời Gian Thực
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cộng đồng thính giả Haevy Audio cùng tri ân và chắp cánh cho các nghệ sĩ
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="text-xs px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-medium rounded-lg border border-amber-500/30 transition-colors"
                >
                  + Tặng quà ngay
                </button>
              </div>

              {loadingGifts ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs">Đang tải bảng tin quà tặng...</span>
                </div>
              ) : recentGifts.length === 0 ? (
                <div className="py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800 p-6">
                  <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-300 text-sm">Chưa có quà tặng nào gần đây</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Hãy là người đầu tiên gửi tặng cà phê hay vương miện tri ân cho tác giả yêu thích của bạn!
                  </p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="mt-4 text-xs px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                  >
                    Mở Kho Quà Tặng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 hover:bg-slate-800 transition-colors"
                    >
                      <div className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-700/80 shrink-0">
                        {gift.giftIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-xs text-slate-200 truncate">
                              {gift.senderName}
                            </span>
                            {gift.isSenderVip && (
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-amber-400 shrink-0">
                            +{gift.pointsCost.toLocaleString()} pts
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                          <span className="text-slate-400">Đã tặng cho:</span>
                          <strong className="text-amber-300 font-medium truncate">{gift.authorStageName}</strong>
                        </div>

                        {gift.message && (
                          <div className="mt-1.5 p-1.5 bg-slate-900/80 rounded-lg text-[11px] text-slate-300 italic border border-slate-800">
                            "{gift.message}"
                          </div>
                        )}

                        {gift.trackTitle && (
                          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                            <Music className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{gift.trackTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mọi đóng góp Điểm Audio trực tiếp hỗ trợ nghệ sĩ phát triển tác phẩm mới.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
