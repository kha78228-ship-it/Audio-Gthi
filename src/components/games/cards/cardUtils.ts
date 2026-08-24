import { CardGameType, PlayingCardData, Suit, AttackPair } from './cardTypes';

export const SUIT_ORDER: Record<Suit, number> = {
  spades: 1,   // Bích ♠
  clubs: 2,    // Chuồn/Tép ♣
  diamonds: 3, // Rô ♦
  hearts: 4,   // Cơ ♥
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
};

export const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Bích',
  clubs: 'Tép',
  diamonds: 'Rô',
  hearts: 'Cơ',
};

// Generates a 52 standard card deck
export function createStandardDeck(gameType: CardGameType = 'tienlen_nam'): PlayingCardData[] {
  const suits: Suit[] = ['spades', 'clubs', 'diamonds', 'hearts'];
  const deck: PlayingCardData[] = [];

  if (gameType === 'tienlen_nam' || gameType === 'tienlen_bac') {
    // 3 = 3, ..., 10=10, 11=J, 12=Q, 13=K, 14=A, 15=2 (Heo)
    const rankConfigs = [
      { rank: 3, label: '3' },
      { rank: 4, label: '4' },
      { rank: 5, label: '5' },
      { rank: 6, label: '6' },
      { rank: 7, label: '7' },
      { rank: 8, label: '8' },
      { rank: 9, label: '9' },
      { rank: 10, label: '10' },
      { rank: 11, label: 'J' },
      { rank: 12, label: 'Q' },
      { rank: 13, label: 'K' },
      { rank: 14, label: 'A' },
      { rank: 15, label: '2' },
    ];

    suits.forEach(suit => {
      rankConfigs.forEach(rc => {
        deck.push({
          id: `${rc.label}_${suit}_${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank: rc.rank,
          displayValue: rc.label,
          isRed: suit === 'diamonds' || suit === 'hearts',
        });
      });
    });
  } else {
    // Phỏm / Tấn: Standard A=1, 2=2, ..., 10=10, 11=J, 12=Q, 13=K
    const rankConfigs = [
      { rank: 1, label: 'A' },
      { rank: 2, label: '2' },
      { rank: 3, label: '3' },
      { rank: 4, label: '4' },
      { rank: 5, label: '5' },
      { rank: 6, label: '6' },
      { rank: 7, label: '7' },
      { rank: 8, label: '8' },
      { rank: 9, label: '9' },
      { rank: 10, label: '10' },
      { rank: 11, label: 'J' },
      { rank: 12, label: 'Q' },
      { rank: 13, label: 'K' },
    ];

    suits.forEach(suit => {
      rankConfigs.forEach(rc => {
        deck.push({
          id: `${rc.label}_${suit}_${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank: rc.rank,
          displayValue: rc.label,
          isRed: suit === 'diamonds' || suit === 'hearts',
        });
      });
    });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: PlayingCardData[]): PlayingCardData[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sort cards nicely for player hand
export function sortHand(cards: PlayingCardData[], gameType: CardGameType = 'tienlen_nam'): PlayingCardData[] {
  return [...cards].sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  });
}

// =========================================================================
// TIẾN LÊN MIỀN NAM & TIẾN LÊN MIỀN BẮC VALIDATORS
// =========================================================================

export type TLTrickType = 'single' | 'pair' | 'triple' | 'quad' | 'straight' | 'three_pairs_straight' | 'four_pairs_straight' | 'invalid';

export interface EvaluatedTrick {
  isValid: boolean;
  type: TLTrickType;
  highestRank: number;
  highestSuitOrder: number;
  highestCard: PlayingCardData;
  cardCount: number;
  description: string;
}

export function evaluateTLTrick(cards: PlayingCardData[], isNorth: boolean = false): EvaluatedTrick {
  if (!cards || cards.length === 0) {
    return { isValid: false, type: 'invalid', highestRank: 0, highestSuitOrder: 0, highestCard: {} as any, cardCount: 0, description: 'Chưa chọn bài' };
  }

  const sorted = [...cards].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  });

  const highestCard = sorted[sorted.length - 1];
  const count = sorted.length;

  // Single card
  if (count === 1) {
    return {
      isValid: true,
      type: 'single',
      highestRank: highestCard.rank,
      highestSuitOrder: SUIT_ORDER[highestCard.suit],
      highestCard,
      cardCount: 1,
      description: `Cây lẻ (${highestCard.displayValue}${SUIT_SYMBOLS[highestCard.suit]})`
    };
  }

  // Pair (2 cards same rank)
  if (count === 2 && sorted[0].rank === sorted[1].rank) {
    if (isNorth) {
      // Miền Bắc: đôi phải cùng màu (cùng đỏ hoặc cùng đen)
      const sameColor = sorted[0].isRed === sorted[1].isRed;
      if (!sameColor) {
        return { isValid: false, type: 'invalid', highestRank: 0, highestSuitOrder: 0, highestCard, cardCount: 2, description: 'Tiến Lên Miền Bắc: Đôi phải cùng màu (cùng đỏ hoặc cùng đen)' };
      }
    }
    return {
      isValid: true,
      type: 'pair',
      highestRank: highestCard.rank,
      highestSuitOrder: SUIT_ORDER[highestCard.suit],
      highestCard,
      cardCount: 2,
      description: `Đôi ${highestCard.displayValue}`
    };
  }

  // Triple (3 cards same rank)
  if (count === 3 && sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank) {
    return {
      isValid: true,
      type: 'triple',
      highestRank: highestCard.rank,
      highestSuitOrder: SUIT_ORDER[highestCard.suit],
      highestCard,
      cardCount: 3,
      description: `Sám cô ${highestCard.displayValue}`
    };
  }

  // Quad / Tứ quý (4 cards same rank)
  if (count === 4 && sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank && sorted[2].rank === sorted[3].rank) {
    return {
      isValid: true,
      type: 'quad',
      highestRank: highestCard.rank,
      highestSuitOrder: SUIT_ORDER[highestCard.suit],
      highestCard,
      cardCount: 4,
      description: `Tứ quý ${highestCard.displayValue}`
    };
  }

  // Sảnh (Straight >= 3 cards consecutive, not containing 2/15)
  if (count >= 3) {
    let isStraight = true;
    for (let i = 0; i < count - 1; i++) {
      if (sorted[i].rank === 15 || sorted[i + 1].rank === 15 || sorted[i + 1].rank !== sorted[i].rank + 1) {
        isStraight = false;
        break;
      }
    }

    if (isStraight) {
      if (isNorth) {
        // Miền Bắc: sảnh phải đồng chất
        const firstSuit = sorted[0].suit;
        const sameSuit = sorted.every(c => c.suit === firstSuit);
        if (!sameSuit) {
          return { isValid: false, type: 'invalid', highestRank: 0, highestSuitOrder: 0, highestCard, cardCount: count, description: 'Tiến Lên Miền Bắc: Sảnh phải đồng chất (cùng chất bài)' };
        }
      }
      return {
        isValid: true,
        type: 'straight',
        highestRank: highestCard.rank,
        highestSuitOrder: SUIT_ORDER[highestCard.suit],
        highestCard,
        cardCount: count,
        description: `Sảnh ${count} lá (${sorted[0].displayValue} đến ${highestCard.displayValue})`
      };
    }
  }

  // 3 đôi thông (6 cards = 3 consecutive pairs)
  if (count === 6) {
    if (
      sorted[0].rank === sorted[1].rank &&
      sorted[2].rank === sorted[3].rank &&
      sorted[4].rank === sorted[5].rank &&
      sorted[2].rank === sorted[0].rank + 1 &&
      sorted[4].rank === sorted[2].rank + 1 &&
      sorted[0].rank !== 15 && sorted[4].rank !== 15
    ) {
      return {
        isValid: true,
        type: 'three_pairs_straight',
        highestRank: highestCard.rank,
        highestSuitOrder: SUIT_ORDER[highestCard.suit],
        highestCard,
        cardCount: 6,
        description: '3 Đôi Thông'
      };
    }
  }

  // 4 đôi thông (8 cards = 4 consecutive pairs)
  if (count === 8) {
    if (
      sorted[0].rank === sorted[1].rank &&
      sorted[2].rank === sorted[3].rank &&
      sorted[4].rank === sorted[5].rank &&
      sorted[6].rank === sorted[7].rank &&
      sorted[2].rank === sorted[0].rank + 1 &&
      sorted[4].rank === sorted[2].rank + 1 &&
      sorted[6].rank === sorted[4].rank + 1 &&
      sorted[0].rank !== 15 && sorted[6].rank !== 15
    ) {
      return {
        isValid: true,
        type: 'four_pairs_straight',
        highestRank: highestCard.rank,
        highestSuitOrder: SUIT_ORDER[highestCard.suit],
        highestCard,
        cardCount: 8,
        description: '4 Đôi Thông (Chặt bất chấp)'
      };
    }
  }

  return { isValid: false, type: 'invalid', highestRank: 0, highestSuitOrder: 0, highestCard, cardCount: count, description: 'Tập hợp bài không hợp lệ' };
}

// Can beat current trick in Tiến Lên?
export function canBeatTLTrick(
  newCards: PlayingCardData[],
  lastTrickCards: PlayingCardData[] | undefined,
  isNorth: boolean = false
): { canBeat: boolean; message: string } {
  const newEval = evaluateTLTrick(newCards, isNorth);
  if (!newEval.isValid) {
    return { canBeat: false, message: newEval.description };
  }

  // First play in round
  if (!lastTrickCards || lastTrickCards.length === 0) {
    return { canBeat: true, message: 'Hợp lệ' };
  }

  const lastEval = evaluateTLTrick(lastTrickCards, isNorth);

  // Normal comparison (same type & same count)
  if (newEval.type === lastEval.type && newEval.cardCount === lastEval.cardCount) {
    if (isNorth) {
      // Miền Bắc: Single must have higher suit or higher rank of same suit
      if (newEval.type === 'single') {
        if (newEval.highestCard.suit !== lastEval.highestCard.suit) {
          // North rule: Must follow suit if possible, or higher suit
          if (SUIT_ORDER[newEval.highestCard.suit] > SUIT_ORDER[lastEval.highestCard.suit]) {
            return { canBeat: true, message: 'Đè được' };
          }
          if (newEval.highestCard.rank > lastEval.highestCard.rank) {
            return { canBeat: true, message: 'Đè được' };
          }
          return { canBeat: false, message: 'Không đè được quân bài trước' };
        }
      }
    }

    if (newEval.highestRank > lastEval.highestRank) {
      return { canBeat: true, message: 'Đè được' };
    }
    if (newEval.highestRank === lastEval.highestRank && newEval.highestSuitOrder > lastEval.highestSuitOrder) {
      return { canBeat: true, message: 'Đè được' };
    }
    return { canBeat: false, message: 'Quân bài nhỏ hơn bài trước' };
  }

  // Chặt hàng (Special Beats in TLMN)
  // 1 Heo bị chặt bởi: 3 đôi thông, Tứ quý, 4 đôi thông
  if (lastEval.type === 'single' && lastEval.highestRank === 15) {
    if (newEval.type === 'three_pairs_straight' || newEval.type === 'quad' || newEval.type === 'four_pairs_straight') {
      return { canBeat: true, message: 'Chặt Heo thành công! 🔥' };
    }
  }

  // Đôi Heo bị chặt bởi: Tứ quý, 4 đôi thông
  if (lastEval.type === 'pair' && lastEval.highestRank === 15) {
    if (newEval.type === 'quad' || newEval.type === 'four_pairs_straight') {
      return { canBeat: true, message: 'Chặt Đôi Heo thành công! 🔥🔥' };
    }
  }

  // 3 Đôi thông bị chặt bởi: 3 đôi thông lớn hơn, Tứ quý, 4 đôi thông
  if (lastEval.type === 'three_pairs_straight') {
    if (newEval.type === 'three_pairs_straight' && newEval.highestRank > lastEval.highestRank) {
      return { canBeat: true, message: 'Đè 3 đôi thông' };
    }
    if (newEval.type === 'quad' || newEval.type === 'four_pairs_straight') {
      return { canBeat: true, message: 'Chặt 3 đôi thông!' };
    }
  }

  // Tứ quý bị chặt bởi: Tứ quý lớn hơn, 4 đôi thông
  if (lastEval.type === 'quad') {
    if (newEval.type === 'quad' && newEval.highestRank > lastEval.highestRank) {
      return { canBeat: true, message: 'Đè Tứ quý' };
    }
    if (newEval.type === 'four_pairs_straight') {
      return { canBeat: true, message: '4 đôi thông Chặt Tứ Quý!' };
    }
  }

  return { canBeat: false, message: 'Bài không cùng loại hoặc không đủ sức đè bài trước' };
}

// =========================================================================
// PHỎM (TÁ LẢ) HELPER FUNCTIONS
// =========================================================================

// Check if a group of 3 or more cards forms a valid Phỏm
export function isValidPhom(cards: PlayingCardData[]): boolean {
  if (!cards || cards.length < 3) return false;

  // Case 1: Cùng số (Same Rank, >= 3 cards)
  const firstRank = cards[0].rank;
  const isSameRank = cards.every(c => c.rank === firstRank);
  if (isSameRank && cards.length <= 4) return true;

  // Case 2: Sảnh cùng chất (Same Suit consecutive, >= 3 cards)
  const firstSuit = cards[0].suit;
  const isSameSuit = cards.every(c => c.suit === firstSuit);
  if (!isSameSuit) return false;

  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].rank !== sorted[i].rank + 1) {
      return false;
    }
  }

  return true;
}

// Find all valid phoms in a hand
export function findPossiblePhoms(hand: PlayingCardData[]): PlayingCardData[][] {
  const phoms: PlayingCardData[][] = [];
  const n = hand.length;

  // Check 3-card combinations
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        const combo = [hand[i], hand[j], hand[k]];
        if (isValidPhom(combo)) {
          phoms.push(combo);
        }
      }
    }
  }

  // Check 4-card combinations
  for (let i = 0; i < n - 3; i++) {
    for (let j = i + 1; j < n - 2; j++) {
      for (let k = j + 1; k < n - 1; k++) {
        for (let l = k + 1; l < n; l++) {
          const combo = [hand[i], hand[j], hand[k], hand[l]];
          if (isValidPhom(combo)) {
            phoms.push(combo);
          }
        }
      }
    }
  }

  return phoms;
}

// Calculate residual score in Phỏm (A=1, 2=2, ..., J=11, Q=12, K=13)
export function calculatePhomScore(unmatchedCards: PlayingCardData[]): number {
  return unmatchedCards.reduce((acc, card) => acc + card.rank, 0);
}

// Check if player can eat a card to form a Phỏm
export function canEatCardForPhom(hand: PlayingCardData[], candidateCard: PlayingCardData): PlayingCardData[][] {
  const validPhomsWithCard: PlayingCardData[][] = [];
  const combined = [...hand, candidateCard];

  // Try 3-card combinations containing candidateCard
  for (let i = 0; i < hand.length - 1; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      const combo = [hand[i], hand[j], candidateCard];
      if (isValidPhom(combo)) {
        validPhomsWithCard.push(combo);
      }
    }
  }

  return validPhomsWithCard;
}

// =========================================================================
// BÀI TẤN (DURAK / TẤN) HELPER FUNCTIONS
// =========================================================================

// Can defender beat the attacking card?
export function canDefendTanCard(
  defendCard: PlayingCardData,
  attackCard: PlayingCardData,
  trumpSuit: Suit
): boolean {
  // Case 1: Same suit and higher rank
  if (defendCard.suit === attackCard.suit && defendCard.rank > attackCard.rank) {
    return true;
  }
  // Case 2: Defend card is Trump card, attack card is NOT Trump
  if (defendCard.suit === trumpSuit && attackCard.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// Can attacker / side players attack with this card? (Must match ranks already on table)
export function canAttackTanCard(
  card: PlayingCardData,
  attackPairs: AttackPair[]
): boolean {
  if (!attackPairs || attackPairs.length === 0) {
    return true; // First attack card is always free
  }

  // Must match the rank of any attack or defend card on table
  const ranksOnTable = new Set<number>();
  attackPairs.forEach(p => {
    ranksOnTable.add(p.attackCard.rank);
    if (p.defendCard) {
      ranksOnTable.add(p.defendCard.rank);
    }
  });

  return ranksOnTable.has(card.rank);
}

// =========================================================================
// AI BOT ENGINE
// =========================================================================

// Simple smart AI Bot for Tiến Lên
export function getBotTLMove(
  hand: PlayingCardData[],
  lastTrickCards: PlayingCardData[] | undefined,
  isNorth: boolean = false
): PlayingCardData[] | null {
  const sorted = sortHand(hand, isNorth ? 'tienlen_bac' : 'tienlen_nam');

  // If first in round -> Play smallest single or pair
  if (!lastTrickCards || lastTrickCards.length === 0) {
    // Check if has pair of 3s or lowest
    if (sorted.length >= 2 && sorted[0].rank === sorted[1].rank) {
      return [sorted[0], sorted[1]];
    }
    return [sorted[0]];
  }

  const lastEval = evaluateTLTrick(lastTrickCards, isNorth);

  // Single card response
  if (lastEval.type === 'single') {
    for (const card of sorted) {
      const beatCheck = canBeatTLTrick([card], lastTrickCards, isNorth);
      if (beatCheck.canBeat) {
        return [card];
      }
    }
  }

  // Pair response
  if (lastEval.type === 'pair') {
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].rank === sorted[i + 1].rank) {
        const pair = [sorted[i], sorted[i + 1]];
        const beatCheck = canBeatTLTrick(pair, lastTrickCards, isNorth);
        if (beatCheck.canBeat) {
          return pair;
        }
      }
    }
  }

  // Triple response
  if (lastEval.type === 'triple') {
    for (let i = 0; i < sorted.length - 2; i++) {
      if (sorted[i].rank === sorted[i + 1].rank && sorted[i + 1].rank === sorted[i + 2].rank) {
        const triple = [sorted[i], sorted[i + 1], sorted[i + 2]];
        const beatCheck = canBeatTLTrick(triple, lastTrickCards, isNorth);
        if (beatCheck.canBeat) {
          return triple;
        }
      }
    }
  }

  // Straight response
  if (lastEval.type === 'straight') {
    const len = lastEval.cardCount;
    for (let i = 0; i <= sorted.length - len; i++) {
      const slice = sorted.slice(i, i + len);
      const beatCheck = canBeatTLTrick(slice, lastTrickCards, isNorth);
      if (beatCheck.canBeat) {
        return slice;
      }
    }
  }

  // Otherwise pass
  return null;
}
