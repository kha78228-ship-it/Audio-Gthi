import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Coins, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Play, 
  Flame, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  Smile, 
  HelpCircle,
  Clock,
  Shield,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { CardGameType, CardPlayer, PlayingCardData, BetAmount, AttackPair } from './cardTypes';
import { 
  createStandardDeck, 
  sortHand, 
  canBeatTLTrick, 
  evaluateTLTrick, 
  getBotTLMove,
  isValidPhom,
  findPossiblePhoms,
  calculatePhomScore,
  canEatCardForPhom,
  canDefendTanCard,
  canAttackTanCard,
  SUIT_SYMBOLS
} from './cardUtils';
import { PlayingCard } from './PlayingCard';
import { sound } from '../soundEffects';
import { useAuth } from '../../../context/AuthContext';

interface CardGameTableProps {
  gameType: CardGameType;
  onExit: () => void;
  onOpenAuth?: () => void;
  onOpenVipHub?: () => void;
}

const GAME_TITLES: Record<CardGameType, { title: string; subtitle: string; tag: string }> = {
  tienlen_nam: {
    title: 'Tiến Lên Miền Nam',
    subtitle: '13 Lá Tự Do - Chặt Heo Thả Ga',
    tag: '🃏 TLMN'
  },
  tienlen_bac: {
    title: 'Tiến Lên Miền Bắc',
    subtitle: 'Đồng Chất Đồng Màu - Chuẩn Luật Miền Bắc',
    tag: '🎴 TLMB'
  },
  tan: {
    title: 'Bài Tấn (Đấu Trưởng)',
    subtitle: 'Xác Định Chất Trưởng - Tấn & Đỡ Kịch Tính',
    tag: '⚔️ BÀI TẤN'
  },
  phom: {
    title: 'Bài Phỏm (Tá Lả)',
    subtitle: 'Ăn Bài Tạo Phỏm - Bốc Nọc - Đền Ù Rực Rỡ',
    tag: '🀄 TÁ LẢ'
  }
};

const BET_OPTIONS: BetAmount[] = [0, 50, 100, 200, 500, 1000, 5000];

const QUICK_EMOJIS = ['👍', '🔥', '😂', '😭', '🎉', '😡', '❤️', '🐷', '💣', '💸'];
const QUICK_CHATS = [
  'Đánh nhanh lên bạn ơi! ⏱️',
  'Heo nè em ơi! 🐷',
  'May mắn quá đi! 🍀',
  'Bài đẹp quá trời ơi! ✨',
  'Chặt chém tưng bừng nào! 🔥',
  'Căng thẳng quá nha! 😅'
];

export function CardGameTable({
  gameType,
  onExit,
  onOpenAuth,
  onOpenVipHub
}: CardGameTableProps) {
  const { user, isVip, audioPoints, addAudioPoints } = useAuth();

  // Mode Selection: 'select_mode' | 'room_lobby' | 'playing' | 'game_settlement'
  const [tableState, setTableState] = useState<'select_mode' | 'room_lobby' | 'playing' | 'game_settlement'>('select_mode');
  const [playMode, setPlayMode] = useState<'matchmaking' | 'friends'>('matchmaking');
  const [betAmount, setBetAmount] = useState<BetAmount>(0);
  const [customRoomCode, setCustomRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Landscape & Fullscreen & Auto Orientation
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth && window.innerWidth < 768;
    }
    return false;
  });
  const [forceRotateLandscape, setForceRotateLandscape] = useState<boolean>(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Auto request landscape orientation
  const tryLockLandscape = async () => {
    try {
      // @ts-ignore
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        // @ts-ignore
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Fallback silently if orientation lock is restricted by browser/iframe
    }
  };

  // Orientation Detection & Auto Lock Lifecycle
  useEffect(() => {
    const handleCheckOrientation = () => {
      if (typeof window !== 'undefined') {
        const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
        setIsPortrait(portrait);
      }
    };

    handleCheckOrientation();
    window.addEventListener('resize', handleCheckOrientation);
    window.addEventListener('orientationchange', handleCheckOrientation);

    // Auto lock to landscape on entry
    tryLockLandscape();

    return () => {
      window.removeEventListener('resize', handleCheckOrientation);
      window.removeEventListener('orientationchange', handleCheckOrientation);
      try {
        // @ts-ignore
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          // @ts-ignore
          screen.orientation.unlock();
        }
      } catch {}
    };
  }, []);

  // Players State
  const [players, setPlayers] = useState<CardPlayer[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [turnTimer, setTurnTimer] = useState<number>(15);

  // Trick / Discard State
  const [lastTrick, setLastTrick] = useState<{ playerId: string; cards: PlayingCardData[]; trickType: string } | undefined>(undefined);
  const [passedPlayerIds, setPassedPlayerIds] = useState<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  
  // Tấn specific
  const [trumpCard, setTrumpCard] = useState<PlayingCardData | undefined>(undefined);
  const [attackPairs, setAttackPairs] = useState<AttackPair[]>([]);
  const [tanDeck, setTanDeck] = useState<PlayingCardData[]>([]);

  // Phỏm specific
  const [phomDeck, setPhomDeck] = useState<PlayingCardData[]>([]);
  const [discardPile, setDiscardPile] = useState<{ playerId: string; card: PlayingCardData }[]>([]);
  const [phomPhase, setPhomPhase] = useState<'draw_or_eat' | 'discard' | 'done'>('draw_or_eat');
  const [userPhoms, setUserPhoms] = useState<PlayingCardData[][]>([]);

  // Settlement results
  const [roundResults, setRoundResults] = useState<Array<{
    playerId: string;
    name: string;
    rank: number;
    rankLabel: string;
    rewardXu: number;
    isWinner: boolean;
  }>>([]);

  // In-game Emoji Popups
  const [activeReaction, setActiveReaction] = useState<{ senderName: string; emoji: string; text?: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      tableRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Generate Room Code
  useEffect(() => {
    const randomCode = `HAEVY-${Math.floor(1000 + Math.random() * 9000)}`;
    setCustomRoomCode(randomCode);
  }, [gameType]);

  // Turn Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tableState === 'playing') {
      interval = setInterval(() => {
        setTurnTimer((prev) => {
          if (prev <= 1) {
            // Auto pass or play for current player
            handleTimeoutTurn();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tableState, currentTurnIndex, players]);

  // Bot Turn Automation
  useEffect(() => {
    if (tableState !== 'playing') return;
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer) return;

    if (currentPlayer.isBot) {
      const delay = 1200 + Math.random() * 1000;
      const timer = setTimeout(() => {
        handleBotAction(currentTurnIndex);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [tableState, currentTurnIndex, players, lastTrick, attackPairs, phomPhase]);

  // Setup / Start Game
  const startNewGame = (chosenBet: BetAmount = betAmount) => {
    if (chosenBet > 0 && (!user || (audioPoints || 0) < chosenBet)) {
      showToast(`Bạn không đủ ${chosenBet.toLocaleString('vi-VN')} Xu để tham gia phòng cược này!`);
      if (onOpenAuth && !user) onOpenAuth();
      return;
    }

    // Auto lock orientation to landscape and start sound
    tryLockLandscape();
    if (isPortrait) {
      setForceRotateLandscape(true);
    }

    sound.playChips();
    sound.playCardDeal();

    const fullDeck = createStandardDeck(gameType);
    let myCards: PlayingCardData[] = [];
    let bot1Cards: PlayingCardData[] = [];
    let bot2Cards: PlayingCardData[] = [];
    let bot3Cards: PlayingCardData[] = [];
    let remainingDeck: PlayingCardData[] = [];
    let trump: PlayingCardData | undefined = undefined;

    if (gameType === 'tienlen_nam' || gameType === 'tienlen_bac') {
      // 13 cards each
      myCards = sortHand(fullDeck.slice(0, 13), gameType);
      bot1Cards = sortHand(fullDeck.slice(13, 26), gameType);
      bot2Cards = sortHand(fullDeck.slice(26, 39), gameType);
      bot3Cards = sortHand(fullDeck.slice(39, 52), gameType);
    } else if (gameType === 'tan') {
      // 8 cards each, 1 trump card revealed
      myCards = sortHand(fullDeck.slice(0, 8), gameType);
      bot1Cards = sortHand(fullDeck.slice(8, 16), gameType);
      bot2Cards = sortHand(fullDeck.slice(16, 24), gameType);
      bot3Cards = sortHand(fullDeck.slice(24, 32), gameType);
      trump = fullDeck[32];
      remainingDeck = fullDeck.slice(33);
      setTrumpCard(trump);
      setTanDeck(remainingDeck);
      setAttackPairs([]);
    } else if (gameType === 'phom') {
      // 9 cards each (player 1 gets 10 cards to start)
      myCards = sortHand(fullDeck.slice(0, 10), gameType);
      bot1Cards = sortHand(fullDeck.slice(10, 19), gameType);
      bot2Cards = sortHand(fullDeck.slice(19, 28), gameType);
      bot3Cards = sortHand(fullDeck.slice(28, 37), gameType);
      remainingDeck = fullDeck.slice(37);
      setPhomDeck(remainingDeck);
      setDiscardPile([]);
      setPhomPhase('discard'); // player has 10 cards, must discard first
      setUserPhoms([]);
    }

    const initialPlayers: CardPlayer[] = [
      {
        id: 'me',
        uid: user?.uid || 'guest_me',
        name: user?.displayName || 'Bạn (Tôi)',
        avatarUrl: user?.photoURL,
        isBot: false,
        isHost: true,
        cards: myCards,
        points: audioPoints || 0,
        isTurn: true,
        hasPassed: false,
        ready: true,
        phoms: [],
        eatenCards: []
      },
      {
        id: 'bot1',
        uid: 'bot_1',
        name: 'Tuấn Sát Thủ ♠',
        isBot: true,
        isHost: false,
        cards: bot1Cards,
        points: 15400,
        isTurn: false,
        hasPassed: false,
        ready: true,
        phoms: [],
        eatenCards: []
      },
      {
        id: 'bot2',
        uid: 'bot_2',
        name: 'Linh Hoàng Gia 👑',
        isBot: true,
        isHost: false,
        cards: bot2Cards,
        points: 28900,
        isTurn: false,
        hasPassed: false,
        ready: true,
        phoms: [],
        eatenCards: []
      },
      {
        id: 'bot3',
        uid: 'bot_3',
        name: 'Đạt Thần Bài 🎲',
        isBot: true,
        isHost: false,
        cards: bot3Cards,
        points: 8200,
        isTurn: false,
        hasPassed: false,
        ready: true,
        phoms: [],
        eatenCards: []
      }
    ];

    setPlayers(initialPlayers);
    setCurrentTurnIndex(0);
    setTurnTimer(15);
    setLastTrick(undefined);
    setPassedPlayerIds([]);
    setSelectedCardIds([]);
    setTableState('playing');
  };

  // Bot Turn Handler
  const handleBotAction = (botIndex: number) => {
    const currentBot = players[botIndex];
    if (!currentBot || !currentBot.isBot || currentBot.cards.length === 0) return;

    if (gameType === 'tienlen_nam' || gameType === 'tienlen_bac') {
      const isNorth = gameType === 'tienlen_bac';
      const move = getBotTLMove(currentBot.cards, lastTrick?.cards, isNorth);

      if (move && move.length > 0) {
        // Play cards
        sound.playCardPlay();
        const remaining = currentBot.cards.filter(c => !move.some(m => m.id === c.id));
        const updated = [...players];
        updated[botIndex].cards = remaining;
        setPlayers(updated);

        const evalRes = evaluateTLTrick(move, isNorth);
        setLastTrick({
          playerId: currentBot.id,
          cards: move,
          trickType: evalRes.description
        });

        // Check if Bot Wins
        if (remaining.length === 0) {
          finishRound(currentBot.id);
          return;
        }

        nextTurn();
      } else {
        // Bot Passes
        sound.playPass();
        passTurn(botIndex);
      }
    } else if (gameType === 'phom') {
      // Phỏm bot: bốc 1 lá hoặc đánh 1 lá rác
      sound.playCardPlay();
      if (currentBot.cards.length > 9) {
        // Discard 1 card
        const cardToDiscard = currentBot.cards[currentBot.cards.length - 1];
        const remaining = currentBot.cards.slice(0, currentBot.cards.length - 1);
        const updated = [...players];
        updated[botIndex].cards = remaining;
        setPlayers(updated);
        setDiscardPile(prev => [...prev, { playerId: currentBot.id, card: cardToDiscard }]);
        nextTurn();
      } else {
        // Draw from deck then discard
        if (phomDeck.length > 0) {
          const drawn = phomDeck[0];
          const newDeck = phomDeck.slice(1);
          setPhomDeck(newDeck);
          const newCards = sortHand([...currentBot.cards, drawn], 'phom');
          const cardToDiscard = newCards[newCards.length - 1];
          const remaining = newCards.filter(c => c.id !== cardToDiscard.id);
          const updated = [...players];
          updated[botIndex].cards = remaining;
          setPlayers(updated);
          setDiscardPile(prev => [...prev, { playerId: currentBot.id, card: cardToDiscard }]);
          nextTurn();
        } else {
          // Finish round
          finishPhomRound();
        }
      }
    } else if (gameType === 'tan') {
      // Tấn Bot action
      sound.playCardPlay();
      if (attackPairs.length === 0) {
        // Attack with first lowest card
        const cardToAttack = currentBot.cards[0];
        const remaining = currentBot.cards.slice(1);
        const updated = [...players];
        updated[botIndex].cards = remaining;
        setPlayers(updated);
        setAttackPairs([{ attackCard: cardToAttack, attackerId: currentBot.id }]);
        nextTurn();
      } else {
        // Try to defend or pass
        const lastPair = attackPairs[attackPairs.length - 1];
        if (!lastPair.defendCard && trumpCard) {
          const defendCard = currentBot.cards.find(c => canDefendTanCard(c, lastPair.attackCard, trumpCard.suit));
          if (defendCard) {
            const remaining = currentBot.cards.filter(c => c.id !== defendCard.id);
            const updated = [...players];
            updated[botIndex].cards = remaining;
            setPlayers(updated);
            const updatedPairs = [...attackPairs];
            updatedPairs[updatedPairs.length - 1].defendCard = defendCard;
            setAttackPairs(updatedPairs);
            nextTurn();
          } else {
            // Cannot defend -> Take all cards (Ôm bài)
            const allOnTable: PlayingCardData[] = [];
            attackPairs.forEach(p => {
              allOnTable.push(p.attackCard);
              if (p.defendCard) allOnTable.push(p.defendCard);
            });
            const updated = [...players];
            updated[botIndex].cards = sortHand([...updated[botIndex].cards, ...allOnTable], 'tan');
            setPlayers(updated);
            setAttackPairs([]);
            nextTurn();
          }
        } else {
          nextTurn();
        }
      }
    }
  };

  // Next Turn cycler
  const nextTurn = () => {
    setTurnTimer(15);
    setCurrentTurnIndex((prev) => (prev + 1) % players.length);
  };

  // Pass Turn
  const passTurn = (playerIdx: number) => {
    const passedPlayer = players[playerIdx];
    if (!passedPlayer) return;

    const newPassed = [...passedPlayerIds, passedPlayer.id];
    setPassedPlayerIds(newPassed);

    // If 3 players passed -> Clear trick for new round
    if (newPassed.length >= players.length - 1) {
      showToast('Vòng đánh kết thúc! Người giữ bài cao nhất bắt đầu vòng mới ✨');
      setLastTrick(undefined);
      setPassedPlayerIds([]);
    }

    nextTurn();
  };

  // Auto handle timeout
  const handleTimeoutTurn = () => {
    if (currentTurnIndex === 0) {
      // User timeout -> pass if can pass
      if (lastTrick) {
        passTurn(0);
      } else {
        // Must play first card
        if (players[0].cards.length > 0) {
          handlePlaySelectedCards([players[0].cards[0]]);
        }
      }
    }
  };

  // User Play Cards
  const handlePlaySelectedCards = (cardsToPlay?: PlayingCardData[]) => {
    const myPlayer = players[0];
    if (!myPlayer || currentTurnIndex !== 0) {
      showToast('Chưa đến lượt của bạn!');
      return;
    }

    const cards = cardsToPlay || myPlayer.cards.filter(c => selectedCardIds.includes(c.id));
    if (cards.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 lá bài để đánh!');
      return;
    }

    if (gameType === 'tienlen_nam' || gameType === 'tienlen_bac') {
      const isNorth = gameType === 'tienlen_bac';
      const check = canBeatTLTrick(cards, lastTrick?.cards, isNorth);

      if (!check.canBeat) {
        sound.playWrong();
        showToast(check.message);
        return;
      }

      sound.playCardPlay();
      const evalRes = evaluateTLTrick(cards, isNorth);
      const remaining = myPlayer.cards.filter(c => !cards.some(sc => sc.id === c.id));
      
      const updated = [...players];
      updated[0].cards = remaining;
      setPlayers(updated);
      setSelectedCardIds([]);

      setLastTrick({
        playerId: 'me',
        cards,
        trickType: evalRes.description
      });

      // Win check
      if (remaining.length === 0) {
        finishRound('me');
        return;
      }

      nextTurn();
    } else if (gameType === 'phom') {
      if (phomPhase === 'discard') {
        if (cards.length !== 1) {
          showToast('Vui lòng chọn đúng 1 lá bài để đánh rác!');
          return;
        }
        sound.playCardPlay();
        const discarded = cards[0];
        const remaining = myPlayer.cards.filter(c => c.id !== discarded.id);
        const updated = [...players];
        updated[0].cards = remaining;
        setPlayers(updated);
        setSelectedCardIds([]);
        setDiscardPile(prev => [...prev, { playerId: 'me', card: discarded }]);
        setPhomPhase('draw_or_eat');
        nextTurn();
      } else {
        showToast('Vui lòng bốc bài từ nọc hoặc ăn bài trước khi đánh!');
      }
    } else if (gameType === 'tan') {
      if (!trumpCard) return;
      if (attackPairs.length === 0) {
        // First attack
        sound.playCardPlay();
        const attackCard = cards[0];
        const remaining = myPlayer.cards.filter(c => c.id !== attackCard.id);
        const updated = [...players];
        updated[0].cards = remaining;
        setPlayers(updated);
        setSelectedCardIds([]);
        setAttackPairs([{ attackCard, attackerId: 'me' }]);
        nextTurn();
      } else {
        // Try to defend
        const lastPair = attackPairs[attackPairs.length - 1];
        if (!lastPair.defendCard) {
          const defendCard = cards[0];
          if (canDefendTanCard(defendCard, lastPair.attackCard, trumpCard.suit)) {
            sound.playCardPlay();
            const remaining = myPlayer.cards.filter(c => c.id !== defendCard.id);
            const updated = [...players];
            updated[0].cards = remaining;
            setPlayers(updated);
            setSelectedCardIds([]);
            const updatedPairs = [...attackPairs];
            updatedPairs[updatedPairs.length - 1].defendCard = defendCard;
            setAttackPairs(updatedPairs);
            nextTurn();
          } else {
            sound.playWrong();
            showToast('Lá bài không đủ lớn hoặc không đúng chất để đỡ!');
          }
        }
      }
    }
  };

  // Phỏm User Draw
  const handlePhomDrawDeck = () => {
    if (currentTurnIndex !== 0 || phomPhase !== 'draw_or_eat') return;
    if (phomDeck.length === 0) {
      finishPhomRound();
      return;
    }

    sound.playCardFlip();
    const drawn = phomDeck[0];
    setPhomDeck(prev => prev.slice(1));
    const myPlayer = players[0];
    const newCards = sortHand([...myPlayer.cards, drawn], 'phom');
    const updated = [...players];
    updated[0].cards = newCards;
    setPlayers(updated);
    setPhomPhase('discard');
    showToast('Đã bốc 1 lá từ nọc! Hãy chọn 1 lá bài rác để đánh.');
  };

  // Phỏm User Eat Card
  const handlePhomEatCard = () => {
    if (currentTurnIndex !== 0 || phomPhase !== 'draw_or_eat' || discardPile.length === 0) return;
    const lastDiscard = discardPile[discardPile.length - 1];
    const myPlayer = players[0];
    const canEat = canEatCardForPhom(myPlayer.cards, lastDiscard.card);

    if (canEat.length > 0) {
      sound.playVictory();
      setDiscardPile(prev => prev.slice(0, -1));
      const newCards = sortHand([...myPlayer.cards, lastDiscard.card], 'phom');
      const updated = [...players];
      updated[0].cards = newCards;
      updated[0].eatenCards = [...(updated[0].eatenCards || []), lastDiscard.card];
      setPlayers(updated);
      setPhomPhase('discard');
      showToast('Ăn bài thành công! 🎉 Hãy chọn 1 lá bài rác để đánh.');
    } else {
      sound.playWrong();
      showToast('Không có tổ hợp bài để ăn lá này tạo Phỏm!');
    }
  };

  // Phỏm Finish Round Calculation
  const finishPhomRound = () => {
    sound.playVictory();
    const results = players.map((p, idx) => {
      const phoms = findPossiblePhoms(p.cards);
      let matchedCardIds = new Set<string>();
      phoms.forEach(ph => ph.forEach(c => matchedCardIds.add(c.id)));
      const trash = p.cards.filter(c => !matchedCardIds.has(c.id));
      const score = calculatePhomScore(trash);
      return {
        playerId: p.id,
        name: p.name,
        score,
        phomCount: phoms.length
      };
    });

    results.sort((a, b) => a.score - b.score);

    const settlement = results.map((r, idx) => {
      const isWinner = idx === 0;
      const rewardXu = isWinner ? betAmount * 3 : -betAmount;
      return {
        playerId: r.playerId,
        name: r.name,
        rank: idx + 1,
        rankLabel: idx === 0 ? '🏆 Ù / Nhất Bàn' : idx === 1 ? '🥈 Về Nhì' : idx === 2 ? '🥉 Về Ba' : '💥 Về Bét',
        rewardXu,
        isWinner
      };
    });

    setRoundResults(settlement);
    applyXuSettlement(settlement);
    setTableState('game_settlement');
  };

  // Finish Round for Tiến Lên / Tấn
  const finishRound = (winnerId: string) => {
    sound.playVictory();
    const isUserWinner = winnerId === 'me';

    const settlement = players.map((p) => {
      const isWinner = p.id === winnerId;
      const rewardXu = isWinner ? betAmount * 3 : -betAmount;
      return {
        playerId: p.id,
        name: p.name,
        rank: isWinner ? 1 : 2,
        rankLabel: isWinner ? '🏆 Quán Quân (Tới Nhất)' : '🥈 Thua Cuộc',
        rewardXu,
        isWinner
      };
    });

    setRoundResults(settlement);
    applyXuSettlement(settlement);
    setTableState('game_settlement');
  };

  // Apply real Xu settlement to AuthContext
  const applyXuSettlement = (settlement: Array<{ playerId: string; rewardXu: number; isWinner: boolean }>) => {
    const myResult = settlement.find(s => s.playerId === 'me');
    if (myResult && myResult.rewardXu !== 0 && user) {
      if (myResult.rewardXu > 0) {
        addAudioPoints(myResult.rewardXu, `Thắng cược ${GAME_TITLES[gameType].title}`, 'game_reward');
      } else {
        addAudioPoints(myResult.rewardXu, `Thua cược ${GAME_TITLES[gameType].title}`, 'game_bet');
      }
    }
  };

  // Card Selection toggle
  const toggleCardSelect = (cardId: string) => {
    sound.playCardFlip();
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  // Auto Sort Hand for user
  const handleSortHand = () => {
    sound.playCardDeal();
    const myPlayer = players[0];
    if (!myPlayer) return;
    const sorted = sortHand(myPlayer.cards, gameType);
    const updated = [...players];
    updated[0].cards = sorted;
    setPlayers(updated);
    showToast('Đã xếp bài theo thứ tự giá trị & chất ✨');
  };

  // Quick Emoji Reactions
  const handleSendReaction = (emoji: string, text?: string) => {
    sound.playTone(800, 'sine', 0.08, 0.1);
    setActiveReaction({
      senderName: user?.displayName || 'Bạn',
      emoji,
      text
    });
    setShowEmojiPicker(false);
    setTimeout(() => setActiveReaction(null), 3000);
  };

  return (
    <div
      ref={tableRef}
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-2 sm:p-4'
          : 'min-h-[620px] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3 sm:p-5 flex flex-col justify-between'
      }`}
    >
      {/* Toast popup */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500 text-black font-black text-xs sm:text-sm rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border border-yellow-300">
          {toastMsg}
        </div>
      )}

      {/* Auto Landscape Reminder / Quick Toggle on Mobile */}
      {isPortrait && tableState === 'playing' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 border border-amber-500/60 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-pulse max-w-[90vw]">
          <RotateCw size={14} className="text-amber-400 animate-spin shrink-0" />
          <span className="text-[11px] text-zinc-200 font-medium whitespace-nowrap truncate">
            Đã bật chế độ ngang tự động
          </span>
          <button
            type="button"
            onClick={() => {
              setForceRotateLandscape(prev => !prev);
              tryLockLandscape();
            }}
            className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/30 whitespace-nowrap cursor-pointer"
          >
            {forceRotateLandscape ? 'Tắt Xoay' : 'Xoay Ngang'}
          </button>
        </div>
      )}

      {/* Floating Emoji Animation */}
      {activeReaction && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-75 duration-200 backdrop-blur-md">
          <span className="text-3xl animate-bounce">{activeReaction.emoji}</span>
          <div className="text-left">
            <span className="text-[10px] text-amber-400 font-bold block">{activeReaction.senderName}</span>
            {activeReaction.text && (
              <span className="text-xs text-white font-semibold">{activeReaction.text}</span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER CONTROL BAR                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 px-4 shadow-xl backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Thoát Bàn</span>
          </button>

          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-black">
            {GAME_TITLES[gameType].tag}
          </span>
        </div>

        {/* Center Game Room Info */}
        <div className="text-center hidden md:block">
          <h3 className="text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5">
            {GAME_TITLES[gameType].title}
            <span className="text-zinc-500 font-mono text-[11px]">({customRoomCode})</span>
          </h3>
          <p className="text-[10px] text-zinc-400">
            Mức cược: <strong className="text-amber-400 font-mono">{betAmount === 0 ? 'Miễn Phí (0 Xu)' : `${betAmount.toLocaleString('vi-VN')} Xu`}</strong>
          </p>
        </div>

        {/* Right Tools: Fullscreen / Sound / Balance */}
        <div className="flex items-center gap-2">
          {/* User Balance */}
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
            <Coins size={14} className="text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-400 font-mono">
              {(audioPoints || 0).toLocaleString('vi-VN')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              sound.isMuted = !isMuted;
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Landscape Orientation Toggle */}
          <button
            type="button"
            onClick={() => {
              setForceRotateLandscape(prev => !prev);
              tryLockLandscape();
            }}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              forceRotateLandscape
                ? 'bg-amber-500 text-black font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Tự Động Xoay Ngang Màn Hình / Chế Độ Bàn Casino"
          >
            <RotateCw size={15} className={forceRotateLandscape ? 'animate-spin' : ''} />
            <span className="text-[11px] font-bold hidden sm:inline">
              {forceRotateLandscape ? 'Đang Xoay' : 'Xoay Ngang'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Toàn Màn Hình"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: CHỌN CHẾ ĐỘ & MỨC CƯỢC (SELECT MODE & BET)                      */}
      {/* ========================================================================= */}
      {tableState === 'select_mode' && (
        <div className="my-auto py-8 max-w-xl mx-auto w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Sảnh Game Bài Haevy VIP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{GAME_TITLES[gameType].title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400">{GAME_TITLES[gameType].subtitle}</p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setPlayMode('matchmaking')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                playMode === 'matchmaking'
                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap size={16} />
              <span>Ghép Đấu Nhanh</span>
            </button>

            <button
              type="button"
              onClick={() => setPlayMode('friends')}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                playMode === 'friends'
                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Chơi Với Bạn Bè</span>
            </button>
          </div>

          {/* Bet Level Selector */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Coins size={15} className="text-amber-400" />
                Chọn Mức Cược Xu Haevy
              </label>
              <span className="text-[11px] text-zinc-400">
                {betAmount === 0 ? 'Chơi Thử Miễn Phí' : `Thắng nhận ×3: +${(betAmount * 3).toLocaleString('vi-VN')} Xu`}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {BET_OPTIONS.map((bet) => (
                <button
                  key={bet}
                  type="button"
                  onClick={() => setBetAmount(bet)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    betAmount === bet
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-md shadow-amber-500/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <span className="font-mono text-sm">
                    {bet === 0 ? '0 Xu' : bet.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-normal">
                    {bet === 0 ? 'Miễn Phí' : 'Xu / Ván'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Friends Room Options */}
          {playMode === 'friends' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <p className="text-xs font-bold text-zinc-300 mb-1.5">Mã Phòng Riêng Của Bạn</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-sm font-black text-amber-400 tracking-wider flex items-center justify-between">
                    <span>{customRoomCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(customRoomCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                        showToast('Đã sao chép mã phòng vào bộ nhớ tạm!');
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-300 mb-1.5">Hoặc Nhập Mã Phòng Bạn Bè</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="VD: HAEVY-8899"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!inputRoomCode.trim()) {
                        showToast('Vui lòng nhập mã phòng!');
                        return;
                      }
                      startNewGame(betAmount);
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Vào Bàn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Launch Button */}
          <button
            type="button"
            onClick={() => startNewGame(betAmount)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base transition-all shadow-xl shadow-amber-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play size={20} className="fill-black" />
            <span>{playMode === 'matchmaking' ? 'BẮT ĐẦU GHÉP BÀN NGAY' : 'TẠO BÀN & MỜI BẠN BÈ'}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: BÀN CHƠI GAME CASINO LANDSCAPE (ACTIVE PLAYING TABLE)            */}
      {/* ========================================================================= */}
      {tableState === 'playing' && (
        <div className="relative flex-1 flex flex-col justify-between py-2 sm:py-3 select-none">
          {/* Table Green Felt Oval Canvas */}
          <div className="absolute inset-2 sm:inset-4 rounded-[40px] sm:rounded-[60px] bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 border-4 sm:border-8 border-amber-900/60 shadow-inner flex flex-col justify-between p-3 sm:p-6 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            
            {/* Center Felt Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-25 pointer-events-none">
              <Crown size={48} className="text-amber-400" />
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase font-serif mt-1">
                HAEVY VIP CLUB
              </span>
            </div>
          </div>

          {/* TOP PLAYER (BOT 2) */}
          <div className="relative z-10 flex flex-col items-center">
            {players[2] && (
              <div className={`flex items-center gap-2 p-1.5 px-3 rounded-2xl border transition-all ${
                currentTurnIndex === 2
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-zinc-900/80 border-zinc-800'
              }`}>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {players[2].name.slice(0, 1)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white flex items-center gap-1">
                    {players[2].name}
                    {currentTurnIndex === 2 && (
                      <span className="text-[10px] font-mono text-amber-400 animate-pulse">({turnTimer}s)</span>
                    )}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono font-bold">
                    {players[2].cards.length} lá bài
                  </p>
                </div>
              </div>
            )}
            {/* Face down cards representation */}
            <div className="flex -space-x-4 mt-1">
              {players[2]?.cards.slice(0, 6).map((c, i) => (
                <PlayingCard key={i} isFaceDown size="xs" />
              ))}
            </div>
          </div>

          {/* MIDDLE ROW (BOT 3 LEFT, TABLE CENTER TRICK, BOT 1 RIGHT) */}
          <div className="relative z-10 flex items-center justify-between px-2 sm:px-8">
            {/* LEFT PLAYER (BOT 3) */}
            <div className="flex flex-col items-start">
              {players[3] && (
                <div className={`p-2 rounded-2xl border transition-all ${
                  currentTurnIndex === 3
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : 'bg-zinc-900/80 border-zinc-800'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-1">
                    {players[3].name.slice(0, 1)}
                  </div>
                  <p className="text-[11px] font-black text-white text-center">{players[3].name}</p>
                  <p className="text-[9px] text-amber-400 font-mono text-center font-bold">
                    {players[3].cards.length} lá
                  </p>
                  {currentTurnIndex === 3 && (
                    <span className="text-[9px] font-mono text-amber-400 block text-center animate-pulse">({turnTimer}s)</span>
                  )}
                </div>
              )}
            </div>

            {/* TABLE CENTER: TRICK / ATTACK / DISCARD / TRUMP */}
            <div className="flex flex-col items-center justify-center min-h-[140px] max-w-sm w-full mx-auto">
              {/* Tấn Trump Card Indicator */}
              {gameType === 'tan' && trumpCard && (
                <div className="flex items-center gap-2 mb-2 bg-black/50 px-3 py-1 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-zinc-300 font-bold">Chất Trưởng:</span>
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1 font-mono">
                    {SUIT_SYMBOLS[trumpCard.suit]} {trumpCard.displayValue}
                  </span>
                </div>
              )}

              {/* Tiến Lên Center Trick */}
              {(gameType === 'tienlen_nam' || gameType === 'tienlen_bac') && (
                <div className="flex flex-col items-center gap-1.5">
                  {lastTrick ? (
                    <>
                      <span className="text-[11px] font-bold text-amber-300 bg-black/60 px-3 py-0.5 rounded-full border border-amber-500/40">
                        {lastTrick.trickType}
                      </span>
                      <div className="flex items-center -space-x-4 sm:-space-x-5 animate-in zoom-in-90 duration-150">
                        {lastTrick.cards.map((card) => (
                          <PlayingCard key={card.id} card={card} size="sm" />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-3 rounded-2xl border border-dashed border-emerald-600/40 bg-emerald-950/40 text-emerald-300 text-xs font-semibold text-center">
                      Vòng Mới — Đánh bài tự do ✨
                    </div>
                  )}
                </div>
              )}

              {/* Tấn Center Attack Pairs */}
              {gameType === 'tan' && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {attackPairs.map((pair, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      <PlayingCard card={pair.attackCard} size="xs" />
                      {pair.defendCard && (
                        <div className="-mt-6">
                          <PlayingCard card={pair.defendCard} size="xs" />
                        </div>
                      )}
                    </div>
                  ))}
                  {attackPairs.length === 0 && (
                    <span className="text-xs text-emerald-300 font-semibold bg-black/40 px-3 py-1 rounded-xl">
                      Chờ lượt tấn đầu tiên ⚔️
                    </span>
                  )}
                </div>
              )}

              {/* Phỏm Center Deck & Discard */}
              {gameType === 'phom' && (
                <div className="flex items-center gap-4">
                  {/* Deck / Nọc */}
                  <div
                    onClick={handlePhomDrawDeck}
                    className={`cursor-pointer group flex flex-col items-center ${
                      currentTurnIndex === 0 && phomPhase === 'draw_or_eat' ? 'ring-2 ring-amber-400 rounded-xl p-1 animate-pulse' : ''
                    }`}
                  >
                    <PlayingCard isFaceDown size="sm" />
                    <span className="text-[10px] text-zinc-300 font-mono mt-1 font-bold">
                      Nọc ({phomDeck.length})
                    </span>
                  </div>

                  {/* Discard Pile */}
                  {discardPile.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <PlayingCard card={discardPile[discardPile.length - 1].card} size="sm" />
                      <span className="text-[10px] text-amber-400 font-mono mt-1 font-bold">
                        Cây Vừa Đánh
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-14 rounded-lg border border-dashed border-zinc-600 flex items-center justify-center text-[9px] text-zinc-500">
                      Rác
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT PLAYER (BOT 1) */}
            <div className="flex flex-col items-end">
              {players[1] && (
                <div className={`p-2 rounded-2xl border transition-all ${
                  currentTurnIndex === 1
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : 'bg-zinc-900/80 border-zinc-800'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-1">
                    {players[1].name.slice(0, 1)}
                  </div>
                  <p className="text-[11px] font-black text-white text-center">{players[1].name}</p>
                  <p className="text-[9px] text-amber-400 font-mono text-center font-bold">
                    {players[1].cards.length} lá
                  </p>
                  {currentTurnIndex === 1 && (
                    <span className="text-[9px] font-mono text-amber-400 block text-center animate-pulse">({turnTimer}s)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM PLAYER (YOU / ME) */}
          <div className="relative z-20 flex flex-col items-center gap-2 pt-2">
            {/* Turn & Action Bar */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Turn Timer Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 font-mono ${
                currentTurnIndex === 0
                  ? 'bg-amber-500 text-black border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/30'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
              }`}>
                <Clock size={14} className={currentTurnIndex === 0 ? 'animate-spin' : ''} />
                <span>{currentTurnIndex === 0 ? `LƯỢT CỦA BẠN: ${turnTimer}s` : `Lượt đối thủ (${turnTimer}s)`}</span>
              </div>

              {/* Tiến Lên Action Buttons */}
              {(gameType === 'tienlen_nam' || gameType === 'tienlen_bac') && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePlaySelectedCards()}
                    disabled={currentTurnIndex !== 0 || selectedCardIds.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Flame size={14} className="fill-black" />
                    <span>Đánh Bài</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => passTurn(0)}
                    disabled={currentTurnIndex !== 0 || !lastTrick}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Bỏ Lượt
                  </button>
                </>
              )}

              {/* Phỏm Action Buttons */}
              {gameType === 'phom' && (
                <>
                  <button
                    type="button"
                    onClick={handlePhomEatCard}
                    disabled={currentTurnIndex !== 0 || phomPhase !== 'draw_or_eat' || discardPile.length === 0}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Ăn Bài</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePhomDrawDeck}
                    disabled={currentTurnIndex !== 0 || phomPhase !== 'draw_or_eat'}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 font-black text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Layers size={14} />
                    <span>Bốc Nọc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlaySelectedCards()}
                    disabled={currentTurnIndex !== 0 || phomPhase !== 'discard' || selectedCardIds.length !== 1}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs shadow-md cursor-pointer transition-all"
                  >
                    Đánh Rác
                  </button>
                </>
              )}

              {/* Tấn Action Buttons */}
              {gameType === 'tan' && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePlaySelectedCards()}
                    disabled={currentTurnIndex !== 0 || selectedCardIds.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs shadow-md cursor-pointer transition-all"
                  >
                    {attackPairs.length === 0 ? 'Tấn Bài ⚔️' : 'Đỡ Bài 🛡️'}
                  </button>
                </>
              )}

              {/* Utility buttons: Sort & Emoji Picker */}
              <button
                type="button"
                onClick={handleSortHand}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Tự động xếp bài"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Xếp Bài</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-amber-400 text-xs font-bold transition-all cursor-pointer"
                title="Biểu cảm & Chat nhanh"
              >
                <Smile size={16} />
              </button>
            </div>

            {/* Emoji Quick Picker Bar */}
            {showEmojiPicker && (
              <div className="bg-zinc-900/95 border border-zinc-700 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 flex-wrap justify-center animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-lg transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-full border-t border-zinc-800 mt-1 pt-1 flex flex-wrap gap-1">
                  {QUICK_CHATS.map((chat, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendReaction('💬', chat)}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-200 cursor-pointer"
                    >
                      {chat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Your Hand (Cards Carousel / Fan) */}
            <div className="w-full max-w-2xl flex items-center justify-center overflow-x-auto py-2 px-4 no-scrollbar">
              <div className="flex items-center -space-x-3 sm:-space-x-5 hover:-space-x-2 sm:hover:-space-x-3 transition-all duration-200">
                {players[0]?.cards.map((card) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    isSelected={selectedCardIds.includes(card.id)}
                    onClick={() => toggleCardSelect(card.id)}
                    size="md"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: KẾT QUẢ VÁN BÀI & CỘNG TRỪ XU (ROUND SETTLEMENT MODAL)           */}
      {/* ========================================================================= */}
      {tableState === 'game_settlement' && (
        <div className="my-auto py-6 max-w-lg mx-auto w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" />
              Tổng Kết Ván Bài
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Kết Quả Thi Đấu 🏆</h2>
            <p className="text-xs text-zinc-400">
              {roundResults.some(r => r.playerId === 'me' && r.isWinner)
                ? 'Chúc mừng bạn đã chiến thắng ngoạn mục! 🎉'
                : 'Cố gắng lên ở ván tiếp theo nhé! 💪'}
            </p>
          </div>

          {/* Results List */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-2xl">
            {roundResults.map((res) => {
              const isMe = res.playerId === 'me';
              return (
                <div
                  key={res.playerId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    res.isWinner
                      ? 'bg-amber-500/20 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-950/70 border border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black font-mono">
                      {res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        {res.name}
                        {isMe && (
                          <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-black rounded">
                            BẠN
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-400">{res.rankLabel}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-black font-mono ${
                      res.rewardXu > 0 ? 'text-emerald-400' : res.rewardXu < 0 ? 'text-rose-400' : 'text-zinc-400'
                    }`}>
                      {res.rewardXu > 0 ? `+${res.rewardXu.toLocaleString('vi-VN')} Xu` : res.rewardXu < 0 ? `${res.rewardXu.toLocaleString('vi-VN')} Xu` : '0 Xu'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => startNewGame(betAmount)}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play size={16} className="fill-black" />
              <span>Chơi Ván Mới</span>
            </button>

            <button
              type="button"
              onClick={() => setTableState('select_mode')}
              className="py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCw size={16} />
              <span>Đổi Mức Cược / Mode</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
