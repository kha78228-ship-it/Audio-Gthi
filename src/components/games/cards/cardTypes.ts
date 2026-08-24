export type CardGameType = 'tienlen_nam' | 'tienlen_bac' | 'tan' | 'phom';

export type Suit = 'spades' | 'clubs' | 'diamonds' | 'hearts';

export interface PlayingCardData {
  id: string;
  suit: Suit;
  rank: number; // 3..15 (3=3, ..., 13=K, 14=A, 15=2) for Tiến Lên; 1..13 (1=A..13=K) for Phỏm/Tấn
  displayValue: string; // '3', '4', ..., '10', 'J', 'Q', 'K', 'A', '2'
  isRed: boolean;
}

export type BetAmount = 0 | 50 | 100 | 200 | 500 | 1000 | 5000;

export interface CardPlayer {
  id: string;
  uid: string;
  name: string;
  avatarUrl?: string;
  isBot: boolean;
  isHost: boolean;
  cards: PlayingCardData[];
  points: number; // in-game coin or score
  isTurn: boolean;
  hasPassed: boolean;
  rankResult?: number; // 1 = Nhất, 2 = Nhì, 3 = Ba, 4 = Bét
  ready: boolean;
  // Phỏm specific
  phoms?: PlayingCardData[][];
  eatenCards?: PlayingCardData[];
  haPhom?: boolean;
  scorePhom?: number;
  isU?: boolean;
  // Tấn specific
  isDefender?: boolean;
  isAttacker?: boolean;
}

export interface AttackPair {
  attackCard: PlayingCardData;
  defendCard?: PlayingCardData;
  attackerId: string;
}

export interface CardGameRoomState {
  roomId: string;
  roomName: string;
  gameType: CardGameType;
  betAmount: BetAmount;
  isPrivate: boolean;
  passcode?: string;
  hostUid: string;
  players: CardPlayer[];
  status: 'lobby' | 'dealing' | 'playing' | 'round_end' | 'game_over';
  turnIndex: number;
  roundNumber: number;
  // Tiến Lên
  lastTrick?: {
    playerId: string;
    cards: PlayingCardData[];
    trickType: string;
  };
  passedPlayerIds: string[];
  // Tấn
  trumpSuit?: Suit;
  trumpCard?: PlayingCardData;
  deck: PlayingCardData[];
  attackPairs?: AttackPair[];
  // Phỏm
  discardPile: { playerId: string; card: PlayingCardData }[];
  currentTurnEaten: boolean;
  turnPhase?: 'draw_or_eat' | 'discard' | 'ha_phom_action';
  // Logs
  logs: { text: string; time: string; color?: string }[];
  winnerId?: string;
  settlement?: {
    results: Array<{
      playerId: string;
      name: string;
      rank: number;
      rankLabel: string;
      rewardPoints: number;
      isWinner: boolean;
    }>;
  };
}
