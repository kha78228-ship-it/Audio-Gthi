import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Lock, 
  Unlock, 
  Sparkle, 
  Heart, 
  Flame, 
  Shuffle, 
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { CoupleData, CoupleLoveCard, LoveCardCategory } from '../../types';

interface LoveCardsTabProps {
  couple: CoupleData;
  userUid?: string;
  loveCards: CoupleLoveCard[];
  onDrawCard: (category: LoveCardCategory) => Promise<void>;
  onSubmitAnswer: (card: CoupleLoveCard, answerText: string) => Promise<void>;
  onToggleReveal: (card: CoupleLoveCard) => Promise<void>;
}

const CATEGORY_META: Record<LoveCardCategory, { label: string; icon: string; bg: string; border: string }> = {
  sweet_romance: {
    label: 'Ngọt Ngào Lãng Mạn',
    icon: '🌹',
    bg: 'from-rose-950/60 to-pink-950/40',
    border: 'border-rose-500/40 hover:border-rose-500/80'
  },
  deep_secrets: {
    label: 'Tâm Sự & Bí Mật Đêm Khuya',
    icon: '🌙',
    bg: 'from-indigo-950/60 to-purple-950/40',
    border: 'border-indigo-500/40 hover:border-indigo-500/80'
  },
  future_promises: {
    label: 'Hẹn Ước Tương Lai',
    icon: '💍',
    bg: 'from-amber-950/60 to-orange-950/40',
    border: 'border-amber-500/40 hover:border-amber-500/80'
  },
  gratitude_bonding: {
    label: 'Tri Ân & Gắn Kết',
    icon: '💖',
    bg: 'from-emerald-950/60 to-teal-950/40',
    border: 'border-emerald-500/40 hover:border-emerald-500/80'
  }
};

export function LoveCardsTab({
  couple,
  userUid,
  loveCards,
  onDrawCard,
  onSubmitAnswer,
  onToggleReveal
}: LoveCardsTabProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<LoveCardCategory | 'all'>('all');
  const [activeCardForAnswer, setActiveCardForAnswer] = useState<CoupleLoveCard | null>(null);
  const [cardAnswerText, setCardAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMePartner1 = couple.partner1.uid === userUid;
  const me = isMePartner1 ? couple.partner1 : couple.partner2;
  const myPartner = isMePartner1 ? couple.partner2 : couple.partner1;

  const filteredCards = activeCategoryFilter === 'all' 
    ? loveCards 
    : loveCards.filter(c => c.category === activeCategoryFilter);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCardForAnswer || !cardAnswerText.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitAnswer(activeCardForAnswer, cardAnswerText.trim());
      setActiveCardForAnswer(null);
      setCardAnswerText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header & Quick Action Draw Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-rose-400 shrink-0" />
            <span>Bộ Thẻ Bài Tình Yêu & Bí Mật Đôi</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
            Cả hai cùng trả lời câu hỏi lãng mạn. Câu trả lời chỉ được mở khóa khi cả hai đã cùng viết xong!
          </p>
        </div>

        {/* Draw Buttons */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => onDrawCard('sweet_romance')}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-extrabold text-[11px] sm:text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>🌹 Thẻ Lãng Mạn</span>
          </button>
          <button
            onClick={() => onDrawCard('deep_secrets')}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-extrabold text-[11px] sm:text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>🌙 Thẻ Bí Mật</span>
          </button>
          <button
            onClick={() => onDrawCard('future_promises')}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-extrabold text-[11px] sm:text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>💍 Thẻ Hẹn Ước</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeCategoryFilter === 'all'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Tất cả ({loveCards.length})
        </button>
        {(Object.keys(CATEGORY_META) as LoveCardCategory[]).map(cat => {
          const meta = CATEGORY_META[cat];
          const count = loveCards.filter(c => c.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Active Card Answering Modal */}
      {activeCardForAnswer && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-3 sm:space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={15} className="text-rose-400 shrink-0" />
              <span>Trả Lời Thẻ Bài #{activeCardForAnswer.cardIndex}</span>
            </h3>
            <button onClick={() => setActiveCardForAnswer(null)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-bold text-white leading-relaxed">
            {activeCardForAnswer.promptText}
          </div>

          <form onSubmit={handleAnswerSubmit} className="space-y-3">
            <textarea
              value={cardAnswerText}
              onChange={(e) => setCardAnswerText(e.target.value)}
              placeholder="Viết câu trả lời chân thành từ trái tim bạn..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs text-white placeholder-zinc-600 outline-none resize-none leading-relaxed"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveCardForAnswer(null)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                Gửi Câu Trả Lời Bí Mật
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Layers size={20} />
          </div>
          <p className="text-xs sm:text-sm font-bold text-white">Chưa có thẻ bài tình yêu nào trong danh mục này</p>
          <p className="text-[11px] sm:text-xs text-zinc-400 max-w-md mx-auto">
            Hãy bấm vào các nút rút thẻ bên trên để khám phá những chủ đề lãng mạn và bí mật cùng nhau!
          </p>
          <button
            onClick={() => onDrawCard('sweet_romance')}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer"
          >
            + Rút Thẻ Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredCards.map((card) => {
            const myAnswer = isMePartner1 ? card.partner1Answer : card.partner2Answer;
            const partnerAnswer = isMePartner1 ? card.partner2Answer : card.partner1Answer;
            const bothAnswered = Boolean(card.partner1Answer && card.partner2Answer);
            const isUnlocked = card.isRevealed || bothAnswered;
            const catMeta = CATEGORY_META[card.category] || CATEGORY_META.sweet_romance;

            return (
              <div 
                key={card.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${catMeta.bg} border ${catMeta.border} shadow-xl space-y-3 sm:space-y-4 flex flex-col justify-between transition-all duration-300`}
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                      <span>{catMeta.icon}</span>
                      <span>Thẻ #{card.cardIndex} • {catMeta.label}</span>
                    </span>
                    <button
                      onClick={() => onToggleReveal(card)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer bg-black/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10"
                      title="Lật mở bí mật"
                    >
                      {isUnlocked ? <Unlock size={12} className="text-emerald-400" /> : <Lock size={12} className="text-amber-400" />}
                      <span className="text-[9px] sm:text-[10px] font-bold">{isUnlocked ? 'Đã Mở' : 'Bí Mật'}</span>
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">{card.promptText}</h3>

                  {/* Partner 1 & 2 Answers */}
                  <div className="space-y-2 pt-1">
                    {/* My Answer Box */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-extrabold text-rose-300 flex items-center justify-between">
                        <span>Câu trả lời của bạn ({me?.nickname || 'Bạn'}):</span>
                        {myAnswer && <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">Đã xong ✓</span>}
                      </div>
                      {myAnswer ? (
                        <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed font-medium">{myAnswer.text}</p>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveCardForAnswer(card);
                            setCardAnswerText('');
                          }}
                          className="text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                        >
                          + Bấm vào đây để viết câu trả lời
                        </button>
                      )}
                    </div>

                    {/* Partner Answer Box */}
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-white/10 space-y-1">
                      <div className="text-[10px] sm:text-[11px] font-extrabold text-pink-300 flex items-center justify-between">
                        <span>Câu trả lời của {myPartner?.nickname || 'Người ấy'}:</span>
                        {partnerAnswer && <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">Đã viết ✓</span>}
                      </div>
                      {partnerAnswer ? (
                        isUnlocked ? (
                          <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed font-medium">{partnerAnswer.text}</p>
                        ) : (
                          <div className="text-[11px] sm:text-xs text-zinc-500 italic flex items-center gap-1.5 blur-[3px] select-none py-0.5">
                            Người ấy đã hoàn tất. Hãy trả lời để mở khóa cùng nhau!
                          </div>
                        )
                      ) : (
                        <p className="text-[11px] sm:text-xs text-zinc-500 italic">Đang chờ đối phương trả lời...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
