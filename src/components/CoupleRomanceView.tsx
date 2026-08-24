import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  HelpCircle, 
  Layers, 
  Mic, 
  ImageIcon, 
  Settings, 
  HeartHandshake, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Share2,
  Droplets,
  BookOpen,
  Lock,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { 
  Track, 
  CoupleData, 
  CoupleRelationshipType, 
  CoupleAnniversaryGuess, 
  CoupleCustomQuiz, 
  CoupleLoveCard, 
  CoupleVoiceMoment, 
  CoupleMemory,
  CoupleEvent,
  CouplePeriodCycleConfig,
  CouplePeriodLog,
  CoupleDiary,
  CustomQuizOption,
  LoveCardCategory
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

import { 
  RomanticHeroHeader, 
  RomanceThemeKey, 
  ROMANCE_THEMES 
} from './couple/RomanticHeroHeader';
import { AnniversaryDaysWidget } from './couple/AnniversaryDaysWidget';
import { AnniversaryTab } from './couple/AnniversaryTab';
import { PeriodTrackerTab } from './couple/PeriodTrackerTab';
import { CoupleCalendarAndDiaryTab } from './couple/CoupleCalendarAndDiaryTab';
import { QuizzesTab } from './couple/QuizzesTab';
import { LoveCardsTab } from './couple/LoveCardsTab';
import { VoiceMomentsTab } from './couple/VoiceMomentsTab';
import { SharedGalleryTab } from './couple/SharedGalleryTab';
import { CoupleSettingsModal } from './couple/CoupleSettingsModal';
import { LoveNotesWidget } from './couple/LoveNotesWidget';

// Preset Love Card prompts for initializing deck
const PRESET_LOVE_CARDS: { category: LoveCardCategory; promptText: string }[] = [
  {
    category: 'sweet_romance',
    promptText: 'Khoảnh khắc nào đầu tiên khiến bạn nhận ra trái tim mình đã hoàn toàn thuộc về người ấy?'
  },
  {
    category: 'sweet_romance',
    promptText: 'Một thói quen nhỏ xíu nhưng vô cùng đáng yêu của người ấy mà bạn ngắm hoài không chán là gì?'
  },
  {
    category: 'deep_secrets',
    promptText: 'Điều gì về bản thân bạn mà trước đây bạn nghĩ sẽ không kể cho ai, nhưng lại có thể mở lòng với người ấy?'
  },
  {
    category: 'deep_secrets',
    promptText: 'Mỗi khi cảm thấy mệt mỏi hay áp lực với thế giới bên ngoài, một cái ôm hay câu nói nào của người ấy sẽ cứu rỗi bạn?'
  },
  {
    category: 'future_promises',
    promptText: 'Hãy miêu tả ngôi nhà tương lai và một buổi sáng chủ nhật lý tưởng mà hai đứa mình sẽ cùng nhau trải qua?'
  },
  {
    category: 'future_promises',
    promptText: 'Một lời hứa chân thành nhất từ đáy lòng mà bạn muốn dành trọn cả cuộc đời này để thực hiện cho người ấy?'
  },
  {
    category: 'gratitude_bonding',
    promptText: 'Điều gì ở người ấy khiến bạn cảm thấy biết ơn và tự hào nhất khi được đồng hành cùng nhau?'
  },
  {
    category: 'gratitude_bonding',
    promptText: 'Kỷ niệm vượt qua khó khăn nào cùng nhau khiến bạn tin chắc rằng hai đứa sẽ không bao giờ buông tay?'
  }
];

// Helper to generate unique system pair code e.g. "HV-74921X"
const generateSystemPairCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HV-${randomPart}`;
};

interface CoupleRomanceViewProps {
  allTracks?: Track[];
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  onOpenAuth: () => void;
  onOpenGiftShop?: (author?: { uid: string; stageName: string; trackTitle?: string; trackId?: string }) => void;
  activePage?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectPage?: (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
}

export function CoupleRomanceView({
  allTracks,
  tracks,
  onPlayTrack,
  currentTrack,
  isPlaying,
  onOpenAuth,
  onOpenGiftShop,
  activePage,
  onSelectPage
}: CoupleRomanceViewProps) {
  const effectiveTracks = allTracks || tracks || [];
  const { user, accountId } = useAuth();

  // Active Main 5-Page System
  const [localPage, setLocalPage] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const currentPage = activePage || localPage;

  const handleSetPage = (p: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => {
    setLocalPage(p);
    if (onSelectPage) onSelectPage(p);
  };

  // Sub-tabs for Page 5 (Kỷ Niệm & Trò Chơi: Quizzes / Cards / Voice / Gallery)
  const [page5SubTab, setPage5SubTab] = useState<'quizzes' | 'cards' | 'voice' | 'gallery'>('quizzes');

  // Couple Data Realtime
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [loadingCouple, setLoadingCouple] = useState(true);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Unpaired / Setup Form States
  const [setupMode, setSetupMode] = useState<'create' | 'join'>('create');
  const [systemGeneratedCode, setSystemGeneratedCode] = useState<string>(() => generateSystemPairCode());
  const [createPasscode, setCreatePasscode] = useState('');
  const [joinPairCode, setJoinPairCode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [copiedGeneratedCode, setCopiedGeneratedCode] = useState(false);

  const [partnerIdentifier, setPartnerIdentifier] = useState('');
  const [relationshipType, setRelationshipType] = useState<CoupleRelationshipType>('dating');
  const [anniversaryDate, setAnniversaryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [myNickname, setMyNickname] = useState('Anh Yêu');
  const [partnerNickname, setPartnerNickname] = useState('Em Yêu');
  const [coupleTitle, setCoupleTitle] = useState('Mái Ấm Hạnh Phúc');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [invitations, setInvitations] = useState<CoupleData[]>([]);

  // Subcollections data
  const [anniversaryGuesses, setAnniversaryGuesses] = useState<CoupleAnniversaryGuess[]>([]);
  const [customQuizzes, setCustomQuizzes] = useState<CoupleCustomQuiz[]>([]);
  const [loveCards, setLoveCards] = useState<CoupleLoveCard[]>([]);
  const [voiceMoments, setVoiceMoments] = useState<CoupleVoiceMoment[]>([]);
  const [memories, setMemories] = useState<CoupleMemory[]>([]);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>([]);
  const [periodLogs, setPeriodLogs] = useState<CouplePeriodLog[]>([]);
  const [diaries, setDiaries] = useState<CoupleDiary[]>([]);

  // Quick Love Ping Floating Toast / Animation
  const [activeLovePingNotification, setActiveLovePingNotification] = useState<string | null>(null);

  // Regenerate system code
  const handleRegenerateCode = () => {
    setSystemGeneratedCode(generateSystemPairCode());
  };

  const handleCopyGeneratedCode = () => {
    navigator.clipboard.writeText(systemGeneratedCode);
    setCopiedGeneratedCode(true);
    setTimeout(() => setCopiedGeneratedCode(false), 2500);
  };

  // Listen to user's Couple space in Firestore
  useEffect(() => {
    if (!user) {
      setCouple(null);
      setLoadingCouple(false);
      return;
    }

    setLoadingCouple(true);
    const q1 = query(collection(db, 'couples'), where('partner1.uid', '==', user.uid));
    const q2 = query(collection(db, 'couples'), where('partner2.uid', '==', user.uid));

    const unsub1 = onSnapshot(q1, (snap1) => {
      if (!snap1.empty) {
        const docData = snap1.docs[0].data() as CoupleData;
        if (docData.status !== 'cancelled') {
          setCouple({ ...docData, id: snap1.docs[0].id });
          setLoadingCouple(false);
          return;
        }
      }
      
      getDocs(q2).then((snap2) => {
        if (!snap2.empty) {
          const docData = snap2.docs[0].data() as CoupleData;
          if (docData.status !== 'cancelled') {
            setCouple({ ...docData, id: snap2.docs[0].id });
          } else {
            setCouple(null);
          }
        } else {
          setCouple(null);
        }
        setLoadingCouple(false);
      }).catch((e) => {
        console.warn('Error fetching couple partner2:', e);
        setLoadingCouple(false);
      });
    }, (err) => {
      console.warn('Couple listener q1 warning:', err);
      setLoadingCouple(false);
    });

    // Check for incoming invitations by accountId or pairCode
    const qInvites = query(
      collection(db, 'couples'),
      where('status', '==', 'pending')
    );
    const unsubInvites = onSnapshot(qInvites, (snap) => {
      const list: CoupleData[] = [];
      snap.docs.forEach(d => {
        const data = d.data() as CoupleData;
        if (
          data.partner1.uid !== user.uid && 
          (data.partner2?.uid === user.uid || data.partner2?.accountId === accountId)
        ) {
          list.push({ ...data, id: d.id });
        }
      });
      setInvitations(list);
    }, (err) => {
      console.warn('Invitations listener warning:', err);
    });

    return () => {
      unsub1();
      unsubInvites();
    };
  }, [user, accountId]);

  // Listen to subcollections when couple is active
  useEffect(() => {
    if (!couple || !couple.id || couple.status === 'cancelled') {
      setAnniversaryGuesses([]);
      setCustomQuizzes([]);
      setLoveCards([]);
      setVoiceMoments([]);
      setMemories([]);
      setCoupleEvents([]);
      setPeriodLogs([]);
      setDiaries([]);
      return;
    }

    const coupleId = couple.id;

    // 1. Anniversary Guesses
    const unsubGuesses = onSnapshot(
      query(collection(db, 'couples', coupleId, 'anniversaryGuesses'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list: CoupleAnniversaryGuess[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleAnniversaryGuess));
        setAnniversaryGuesses(list);
      },
      (err) => console.warn('anniversaryGuesses listener warning:', err)
    );

    // 2. Custom Quizzes
    const unsubQuizzes = onSnapshot(
      query(collection(db, 'couples', coupleId, 'customQuizzes'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list: CoupleCustomQuiz[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleCustomQuiz));
        setCustomQuizzes(list);
      },
      (err) => console.warn('customQuizzes listener warning:', err)
    );

    // 3. Love Cards
    const unsubCards = onSnapshot(
      query(collection(db, 'couples', coupleId, 'loveCards'), orderBy('createdAt', 'asc')),
      (snap) => {
        const list: CoupleLoveCard[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleLoveCard));
        setLoveCards(list);
      },
      (err) => console.warn('loveCards listener warning:', err)
    );

    // 4. Voice Moments
    const unsubVoices = onSnapshot(
      query(collection(db, 'couples', coupleId, 'voiceMoments'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list: CoupleVoiceMoment[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleVoiceMoment));
        setVoiceMoments(list);
      },
      (err) => console.warn('voiceMoments listener warning:', err)
    );

    // 5. Memories
    const unsubMemories = onSnapshot(
      query(collection(db, 'couples', coupleId, 'memories'), orderBy('date', 'desc')),
      (snap) => {
        const list: CoupleMemory[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleMemory));
        setMemories(list);
      },
      (err) => console.warn('memories listener warning:', err)
    );

    // 6. Custom Events
    const unsubEvents = onSnapshot(
      query(collection(db, 'couples', coupleId, 'events'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list: CoupleEvent[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleEvent));
        setCoupleEvents(list);
      },
      (err) => console.warn('events listener warning:', err)
    );

    // 7. Period Logs
    const unsubPeriods = onSnapshot(
      query(collection(db, 'couples', coupleId, 'periodLogs'), orderBy('startDate', 'desc')),
      (snap) => {
        const list: CouplePeriodLog[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CouplePeriodLog));
        setPeriodLogs(list);
      },
      (err) => console.warn('periodLogs listener warning:', err)
    );

    // 8. Diaries
    const unsubDiaries = onSnapshot(
      query(collection(db, 'couples', coupleId, 'diaries'), orderBy('date', 'desc')),
      (snap) => {
        const list: CoupleDiary[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as CoupleDiary));
        setDiaries(list);
      },
      (err) => console.warn('diaries listener warning:', err)
    );

    return () => {
      unsubGuesses();
      unsubQuizzes();
      unsubCards();
      unsubVoices();
      unsubMemories();
      unsubEvents();
      unsubPeriods();
      unsubDiaries();
    };
  }, [couple?.id, couple?.status]);

  // Handle Creating Couple Space (System-generated Pair Code + Creator Passcode)
  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!createPasscode.trim()) {
      setFormError('Vui lòng thiết lập Mật khẩu phòng đôi để bảo vệ không gian của bạn!');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const generatedCode = systemGeneratedCode.trim().toUpperCase();
      const coupleDocRef = doc(collection(db, 'couples'));

      const newCouple: Partial<CoupleData> = {
        id: coupleDocRef.id,
        pairCode: generatedCode,
        passcode: createPasscode.trim(),
        partner1: {
          uid: user.uid,
          name: user.displayName || 'Bạn',
          accountId: accountId || 'AH-ME',
          photoURL: user.photoURL || '',
          nickname: myNickname.trim() || 'Người Yêu',
          isVip: true
        },
        status: partnerIdentifier ? 'pending' : 'active',
        relationshipType,
        anniversaryDate,
        coupleTitle: coupleTitle.trim() || 'Tình Yêu Của Chúng Mình',
        theme: 'rose_romance',
        lovePoints: 100, // initial bonus
        sharedSongIds: (effectiveTracks || []).slice(0, 3).map(t => t.id),
        cycleConfig: {
          lastPeriodStartDate: anniversaryDate,
          cycleLengthDays: 28,
          periodDurationDays: 5
        },
        createdAt: serverTimestamp(),
      };

      if (partnerIdentifier) {
        newCouple.partner2 = {
          uid: '',
          name: partnerNickname.trim() || 'Đối Phương',
          accountId: partnerIdentifier.trim().toUpperCase(),
          nickname: partnerNickname.trim() || 'Em Yêu'
        };
      }

      await setDoc(coupleDocRef, newCouple);

      // Seed Initial Love Card
      const initialCardRef = doc(collection(db, 'couples', coupleDocRef.id, 'loveCards'));
      await setDoc(initialCardRef, {
        id: initialCardRef.id,
        coupleId: coupleDocRef.id,
        cardIndex: 1,
        category: 'sweet_romance',
        promptText: PRESET_LOVE_CARDS[0].promptText,
        isRevealed: false,
        createdAt: serverTimestamp()
      });

      setCouple({ ...newCouple, id: coupleDocRef.id } as CoupleData);
    } catch (err: any) {
      console.error('Error creating couple:', err);
      setFormError(err.message || 'Không thể tạo không gian đôi. Vui lòng thử lại!');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Joining by System-generated Code & Creator-provided Passcode
  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!joinPairCode.trim()) {
      setFormError('Vui lòng nhập Mã mời do hệ thống cấp!');
      return;
    }

    if (!joinPasscode.trim()) {
      setFormError('Vui lòng nhập Mật khẩu do người tạo phòng cung cấp!');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const q = query(
        collection(db, 'couples'),
        where('pairCode', '==', joinPairCode.trim().toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setFormError('Không tìm thấy không gian cặp đôi với mã mời này. Hãy kiểm tra lại!');
        setFormLoading(false);
        return;
      }

      const coupleDoc = snap.docs[0];
      const data = coupleDoc.data() as CoupleData;

      if (data.status === 'cancelled') {
        setFormError('Không gian đôi này đã bị hủy hoặc không còn tồn tại.');
        setFormLoading(false);
        return;
      }

      if (data.partner1.uid === user.uid) {
        setFormError('Đây là mã phòng do chính bạn tạo.');
        setFormLoading(false);
        return;
      }

      // Check Passcode Security
      if (data.passcode && data.passcode !== joinPasscode.trim()) {
        setFormError('Mật khẩu phòng đôi không chính xác! Hãy hỏi người tạo để nhận mật khẩu phòng.');
        setFormLoading(false);
        return;
      }

      const partner2Info = {
        uid: user.uid,
        name: user.displayName || 'Đối Phương',
        accountId: accountId || 'AH-YOU',
        photoURL: user.photoURL || '',
        nickname: myNickname.trim() || 'Người Thương',
        isVip: true
      };

      await updateDoc(doc(db, 'couples', coupleDoc.id), {
        partner2: partner2Info,
        status: 'active',
        lovePoints: (data.lovePoints || 0) + 50,
        updatedAt: serverTimestamp()
      });

      setCouple({
        ...data,
        id: coupleDoc.id,
        partner2: partner2Info,
        status: 'active'
      });
    } catch (err: any) {
      console.error('Error joining couple:', err);
      setFormError(err.message || 'Lỗi khi tham gia không gian đôi.');
    } finally {
      setFormLoading(false);
    }
  };

  // Accept Invitation
  const handleAcceptInvite = async (targetCouple: CoupleData) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'couples', targetCouple.id), {
        partner2: {
          uid: user.uid,
          name: user.displayName || 'Đối Phương',
          accountId: accountId || 'AH-YOU',
          photoURL: user.photoURL || '',
          nickname: myNickname || 'Em Yêu',
          isVip: true
        },
        status: 'active',
        lovePoints: (targetCouple.lovePoints || 0) + 50,
        updatedAt: serverTimestamp()
      });
      setCouple({ ...targetCouple, status: 'active' });
    } catch (err) {
      console.error('Error accepting couple invite:', err);
    }
  };

  // Theme Change Handler
  const handleChangeTheme = async (themeKey: RomanceThemeKey) => {
    if (!couple) return;
    try {
      await updateDoc(doc(db, 'couples', couple.id), {
        theme: themeKey
      });
      setCouple({ ...couple, theme: themeKey });
    } catch (err) {
      console.error('Error changing theme:', err);
    }
  };

  // Quick Love Ping Reaction Handler
  const handleSendLovePing = async (type: 'kiss' | 'hug' | 'heartbeat' | 'rose' | 'coffee') => {
    if (!couple) return;
    const messages = {
      kiss: '💋 Bạn vừa gửi một nụ hôn ngọt ngào đến người ấy! (+5đ)',
      hug: '🫂 Bạn vừa gửi một cái ôm thật chặt và ấm áp! (+5đ)',
      heartbeat: '💖 Nhịp đập trái tim đã rung động tới đối phương! (+5đ)',
      rose: '🌹 Một đóa hồng tình yêu đã được trao tặng! (+5đ)',
      coffee: '☕ Đã gửi lời nhắc uống nước/trà sữa ngọt ngào! (+5đ)'
    };
    setActiveLovePingNotification(messages[type]);
    setTimeout(() => setActiveLovePingNotification(null), 3500);

    try {
      await updateDoc(doc(db, 'couples', couple.id), {
        lovePoints: (couple.lovePoints || 100) + 5
      });
    } catch (err) {
      console.error('Error sending love ping:', err);
    }
  };

  // 1. Period Tracker Handlers
  const handleUpdateCycleConfig = async (config: CouplePeriodCycleConfig) => {
    if (!couple) return;
    await updateDoc(doc(db, 'couples', couple.id), {
      cycleConfig: config,
      updatedAt: serverTimestamp()
    });
    setCouple({ ...couple, cycleConfig: config });
  };

  const handleAddPeriodLog = async (logData: Omit<CouplePeriodLog, 'id' | 'coupleId' | 'createdAt'>) => {
    if (!couple || !user) return;
    const ref = collection(db, 'couples', couple.id, 'periodLogs');
    await addDoc(ref, {
      ...logData,
      coupleId: couple.id,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 15
    });
  };

  const handleSendBoyfriendCarePing = async (careType: string, customMessage?: string) => {
    if (!couple) return;
    setActiveLovePingNotification(customMessage || '🧸 Đã gửi sự quan tâm ấm áp tới bạn gái! (+10đ)');
    setTimeout(() => setActiveLovePingNotification(null), 4000);

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 10
    });
  };

  // 2. Custom Events & Calendar Handlers
  const handleCreateCustomEvent = async (
    title: string, 
    targetDate: string, 
    icon: string, 
    category: CoupleEvent['category'], 
    badge: string, 
    note: string, 
    isYearlyRecurring: boolean
  ) => {
    if (!couple || !user) return;
    const ref = collection(db, 'couples', couple.id, 'events');
    await addDoc(ref, {
      coupleId: couple.id,
      createdById: user.uid,
      createdByName: user.displayName || 'Người Thương',
      title,
      targetDate,
      icon,
      category,
      badge,
      note,
      isYearlyRecurring,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 15
    });
  };

  const handleUpdateCustomEvent = async (eventId: string, data: Partial<CoupleEvent>) => {
    if (!couple) return;
    await updateDoc(doc(db, 'couples', couple.id, 'events', eventId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const handleDeleteCustomEvent = async (eventId: string) => {
    if (!couple) return;
    await deleteDoc(doc(db, 'couples', couple.id, 'events', eventId));
  };

  // 3. Couple Shared Diary Handlers
  const handleCreateDiary = async (
    title: string, 
    content: string, 
    date: string, 
    mood: string, 
    weather: string, 
    photoUrl?: string, 
    trackId?: string
  ) => {
    if (!couple || !user) return;
    const isPartner1 = couple.partner1.uid === user.uid;
    const myNick = isPartner1 ? couple.partner1.nickname : couple.partner2?.nickname;
    const attachedTrack = trackId ? effectiveTracks.find(t => t.id === trackId) : undefined;

    const ref = collection(db, 'couples', couple.id, 'diaries');
    await addDoc(ref, {
      coupleId: couple.id,
      authorUid: user.uid,
      authorName: user.displayName || 'Người Thương',
      authorNickname: myNick || undefined,
      authorPhoto: user.photoURL || undefined,
      title,
      content,
      date,
      mood,
      weather,
      photoUrls: photoUrl ? [photoUrl] : [],
      audioTrackId: trackId || undefined,
      audioTrackTitle: attachedTrack?.title,
      audioTrackArtist: attachedTrack?.artist,
      reactions: {},
      comments: [],
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 25
    });
  };

  const handleDeleteDiary = async (diaryId: string) => {
    if (!couple) return;
    await deleteDoc(doc(db, 'couples', couple.id, 'diaries', diaryId));
  };

  const handleAddDiaryComment = async (diaryId: string, text: string) => {
    if (!couple || !user) return;
    const targetDiary = diaries.find(d => d.id === diaryId);
    if (!targetDiary) return;

    const isPartner1 = couple.partner1.uid === user.uid;
    const myNick = isPartner1 ? couple.partner1.nickname : couple.partner2?.nickname;

    const newComment = {
      id: `comment-${Date.now()}`,
      authorUid: user.uid,
      authorName: user.displayName || 'Người Thương',
      authorNickname: myNick,
      authorPhoto: user.photoURL || undefined,
      text,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(targetDiary.comments || []), newComment];
    await updateDoc(doc(db, 'couples', couple.id, 'diaries', diaryId), {
      comments: updatedComments
    });
  };

  const handleToggleDiaryReaction = async (diaryId: string, emoji: string) => {
    if (!couple || !user) return;
    const targetDiary = diaries.find(d => d.id === diaryId);
    if (!targetDiary) return;

    const currentReactions = { ...(targetDiary.reactions || {}) };
    if (currentReactions[user.uid] === emoji) {
      delete currentReactions[user.uid];
    } else {
      currentReactions[user.uid] = emoji;
    }

    await updateDoc(doc(db, 'couples', couple.id, 'diaries', diaryId), {
      reactions: currentReactions
    });
  };

  // 4. Anniversary Guesses Handlers
  const handleCreateGuess = async (title: string, actualDate: string, hint: string) => {
    if (!couple || !user) return;
    const ref = collection(db, 'couples', couple.id, 'anniversaryGuesses');
    await addDoc(ref, {
      coupleId: couple.id,
      createdById: user.uid,
      createdByName: user.displayName || 'Đối phương',
      questionTitle: title,
      actualDate,
      hint,
      createdAt: serverTimestamp()
    });
  };

  const handleSubmitGuessAnswer = async (item: CoupleAnniversaryGuess, guessedDate: string) => {
    if (!couple || !user) return;

    const actual = new Date(item.actualDate).getTime();
    const guessed = new Date(guessedDate).getTime();
    const diffDays = Math.abs(Math.round((actual - guessed) / (1000 * 60 * 60 * 24)));
    const isCorrect = diffDays === 0;

    let reaction = '';
    let reward = 0;

    if (isCorrect) {
      reaction = '🎉 Tuyệt vời! Bạn nhớ chính xác 100% không lệch một ngày nào! Thưởng +50 Điểm Yêu!';
      reward = 50;
    } else if (diffDays <= 3) {
      reaction = `💖 Rất sát! Bạn chỉ lệch có ${diffDays} ngày thôi. Thưởng +20 Điểm Yêu!`;
      reward = 20;
    } else {
      reaction = `😅 Lệch ${diffDays} ngày rồi nè! Phải đền một buổi hẹn hò lãng mạn nha! (+5đ)`;
      reward = 5;
    }

    await updateDoc(doc(db, 'couples', couple.id, 'anniversaryGuesses', item.id), {
      guessedById: user.uid,
      guessedDate,
      isCorrect,
      daysDifference: diffDays,
      rewardPoints: reward,
      reactionMessage: reaction,
      answeredAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + reward
    });
  };

  // 5. Custom Quizzes Handlers
  const handleCreateQuiz = async (question: string, options: CustomQuizOption[], explanation: string, sweetReward: string) => {
    if (!couple || !user) return;
    const ref = collection(db, 'couples', couple.id, 'customQuizzes');
    await addDoc(ref, {
      coupleId: couple.id,
      createdById: user.uid,
      createdByName: user.displayName || 'Đối phương',
      question,
      options,
      explanation,
      sweetRewardNote: sweetReward,
      createdAt: serverTimestamp()
    });
  };

  const handleAnswerQuiz = async (quiz: CoupleCustomQuiz, chosenOptId: string) => {
    if (!couple || !user) return;
    const chosen = quiz.options.find(o => o.id === chosenOptId);
    const isPassed = Boolean(chosen?.isCorrect);

    await updateDoc(doc(db, 'couples', couple.id, 'customQuizzes', quiz.id), {
      answeredById: user.uid,
      chosenOptionId: chosenOptId,
      isPassed,
      answeredAt: serverTimestamp()
    });

    if (isPassed) {
      await updateDoc(doc(db, 'couples', couple.id), {
        lovePoints: (couple.lovePoints || 0) + 30
      });
    }
  };

  // 6. Love Cards Handlers
  const handleDrawLoveCard = async (category: LoveCardCategory) => {
    if (!couple) return;
    const matching = PRESET_LOVE_CARDS.filter(c => c.category === category);
    const prompt = matching[Math.floor(Math.random() * matching.length)] || PRESET_LOVE_CARDS[0];

    const ref = collection(db, 'couples', couple.id, 'loveCards');
    await addDoc(ref, {
      coupleId: couple.id,
      cardIndex: loveCards.length + 1,
      category,
      promptText: prompt.promptText,
      isRevealed: false,
      createdAt: serverTimestamp()
    });
  };

  const handleSubmitCardAnswer = async (card: CoupleLoveCard, answerText: string) => {
    if (!couple || !user) return;
    const isPartner1 = couple.partner1.uid === user.uid;
    const answerPayload = {
      uid: user.uid,
      name: user.displayName || 'Đối phương',
      text: answerText,
      submittedAt: new Date().toISOString()
    };

    const updatePayload: Record<string, any> = {};
    if (isPartner1) {
      updatePayload.partner1Answer = answerPayload;
      if (card.partner2Answer) {
        updatePayload.isRevealed = true;
      }
    } else {
      updatePayload.partner2Answer = answerPayload;
      if (card.partner1Answer) {
        updatePayload.isRevealed = true;
      }
    }

    await updateDoc(doc(db, 'couples', couple.id, 'loveCards', card.id), updatePayload);
  };

  const handleToggleCardReveal = async (card: CoupleLoveCard) => {
    if (!couple) return;
    await updateDoc(doc(db, 'couples', couple.id, 'loveCards', card.id), {
      isRevealed: !card.isRevealed
    });
  };

  // 7. Voice Moments Handlers
  const handleSaveVoiceMoment = async (title: string, audioBlob: Blob | null, audioUrl: string, durationSec: number, type: any, note: string) => {
    if (!couple || !user) return;

    let base64Audio = audioUrl || '';
    if (audioBlob) {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          base64Audio = reader.result as string;
          resolve();
        };
      });
    }

    const ref = collection(db, 'couples', couple.id, 'voiceMoments');
    await addDoc(ref, {
      coupleId: couple.id,
      authorUid: user.uid,
      authorName: user.displayName || 'Người Thương',
      title,
      audioUrl: base64Audio,
      durationSec,
      type,
      note,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 40
    });
  };

  // 8. Shared Memory & Songs Handlers
  const handleCreateMemory = async (title: string, photoUrl: string, date: string, location: string, desc: string) => {
    if (!couple || !user) return;
    const ref = collection(db, 'couples', couple.id, 'memories');
    await addDoc(ref, {
      coupleId: couple.id,
      authorUid: user.uid,
      authorName: user.displayName || 'Người Thương',
      title,
      description: desc,
      photoUrl,
      date,
      location,
      likesCount: 1,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'couples', couple.id), {
      lovePoints: (couple.lovePoints || 0) + 25
    });
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!couple) return;
    await deleteDoc(doc(db, 'couples', couple.id, 'memories', memoryId));
  };

  const handleToggleSharedSong = async (trackId: string) => {
    if (!couple) return;
    const current = couple.sharedSongIds || [];
    let updated = [];
    if (current.includes(trackId)) {
      updated = current.filter(id => id !== trackId);
    } else {
      updated = [...current, trackId];
    }
    await updateDoc(doc(db, 'couples', couple.id), {
      sharedSongIds: updated
    });
    setCouple({ ...couple, sharedSongIds: updated });
  };

  const handleUpdateCoupleSettings = async (updatedData: Partial<CoupleData>) => {
    if (!couple) return;
    await updateDoc(doc(db, 'couples', couple.id), {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    setCouple({ ...couple, ...updatedData });
  };

  const handleUnpairCouple = async () => {
    if (!couple) return;
    await updateDoc(doc(db, 'couples', couple.id), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    setCouple(null);
    setIsSettingsOpen(false);
  };

  // 9. DELETE RELATIONSHIP TO START A NEW ONE (Xoá mối quan hệ để sang mối quan hệ mới)
  const handleDeleteRelationship = async () => {
    if (!couple) return;
    try {
      const targetCoupleId = couple.id;
      // 1. Delete document from Firestore
      await deleteDoc(doc(db, 'couples', targetCoupleId));
      
      // 2. Clear state
      setCouple(null);
      setIsSettingsOpen(false);
      setSystemGeneratedCode(generateSystemPairCode());
      setCreatePasscode('');
      setJoinPairCode('');
      setJoinPasscode('');
      setActiveLovePingNotification('Đã xoá mối quan hệ thành công. Bạn có thể bắt đầu tạo không gian mới!');
      setTimeout(() => setActiveLovePingNotification(null), 4000);
    } catch (err) {
      console.warn('Error deleting relationship doc, fallback cancelling:', err);
      // Fallback update status
      try {
        await updateDoc(doc(db, 'couples', couple.id), {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
      } catch (e2) {
        console.error('Fallback cancel error:', e2);
      }
      setCouple(null);
      setIsSettingsOpen(false);
      setSystemGeneratedCode(generateSystemPairCode());
      setCreatePasscode('');
      setJoinPairCode('');
      setJoinPasscode('');
      setActiveLovePingNotification('Đã xoá không gian đôi. Sẵn sàng tạo hoặc ghép đôi mới!');
      setTimeout(() => setActiveLovePingNotification(null), 4000);
    }
  };

  // Loading state
  if (loadingCouple) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
          <Heart size={32} className="animate-bounce fill-rose-500" />
        </div>
        <p className="text-zinc-400 text-sm font-medium">Đang kết nối không gian tình yêu đôi...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW A: NOT PAIRED YET (Setup & Join Screen)
  // -------------------------------------------------------------
  if (!couple || couple.status === 'cancelled') {
    return (
      <div className="w-full max-w-4xl mx-auto px-0 xs:px-1 sm:px-4 py-2 sm:py-8 space-y-4 sm:space-y-8 animate-in fade-in duration-300 overflow-x-hidden">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-950/70 via-zinc-900 to-amber-950/40 border border-rose-500/30 p-4 xs:p-6 sm:p-12 shadow-2xl text-center space-y-3.5 sm:space-y-6">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Heart size={12} className="fill-rose-400 text-rose-400 animate-pulse" />
            <span>Chế Độ Cặp Đôi & Hôn Nhân Độc Quyền</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
            <h1 className="text-xl xs:text-2xl sm:text-5xl font-black text-white tracking-tight">
              Không Gian Tình Yêu <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">I Love Haevy</span>
            </h1>
            <p className="text-zinc-300 text-xs sm:text-base leading-relaxed">
              Kết nối hai trái tim với mã mời hệ thống bảo mật bằng mật khẩu, theo dõi chu kỳ kinh nguyệt bạn gái, lịch hẹn hò đôi, nhật ký tình yêu chung và trò chơi thấu hiểu.
            </p>
          </div>

          {/* Pending Invitations Banner if any */}
          {invitations.length > 0 && (
            <div className="max-w-xl mx-auto p-3 sm:p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                <HeartHandshake size={15} />
                <span>Bạn nhận được {invitations.length} lời mời kết đôi tình yêu:</span>
              </div>
              {invitations.map(inv => (
                <div key={inv.id} className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">{inv.coupleTitle}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-400 truncate">Từ: {inv.partner1.name} ({inv.partner1.accountId}) • Mã: <span className="font-mono text-rose-300 font-bold">{inv.pairCode}</span></div>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(inv)}
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-bold text-[11px] sm:text-xs shadow-lg cursor-pointer shrink-0"
                  >
                    Đồng ý 💕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Switch Create / Join */}
          <div className="flex items-center justify-center gap-1 max-w-xs mx-auto p-1 rounded-2xl bg-zinc-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => setSetupMode('create')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                setupMode === 'create' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tạo Không Gian
            </button>
            <button
              type="button"
              onClick={() => setSetupMode('join')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                setupMode === 'join' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Gia Nhập Phòng
            </button>
          </div>
        </div>

        {/* Setup Form */}
        <div className="max-w-xl mx-auto p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-5">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {setupMode === 'create' ? (
            <form onSubmit={handleCreateCouple} className="space-y-3.5 sm:space-y-5">
              {/* 1. System-generated Pair Code Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider">
                      Mã Mời Phòng Đôi (Hệ thống tự động cấp)
                    </span>
                    <div className="text-base sm:text-xl font-mono font-black text-white tracking-widest">
                      {systemGeneratedCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                      title="Đổi mã khác"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyGeneratedCode}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedGeneratedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedGeneratedCode ? 'Đã Chép' : 'Sao Chép'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500">
                  *Mã mời được tạo ngẫu nhiên bảo mật bởi hệ thống. Bạn chỉ cần gửi mã này và mật khẩu bên dưới cho người yêu.
                </p>
              </div>

              {/* 2. Creator Passcode Field (Required) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <Lock size={13} />
                    <span>Mật Khẩu Phòng Đôi (Do bạn tự đặt) *</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">Cần cung cấp cho đối phương</span>
                </label>
                <input
                  type="text"
                  value={createPasscode}
                  onChange={(e) => setCreatePasscode(e.target.value)}
                  placeholder="VD: 123456, emyeuanh, ngayhenho..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên Không Gian / Gia Đình</label>
                <input
                  type="text"
                  value={coupleTitle}
                  onChange={(e) => setCoupleTitle(e.target.value)}
                  placeholder="VD: Mái Ấm Hạnh Phúc, Cặp Đôi Son 2026..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Mối Quan Hệ Hiện Tại</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: 'dating', label: 'Người Yêu', icon: '💖' },
                    { id: 'engaged', label: 'Đã Đính Hôn', icon: '💍' },
                    { id: 'married', label: 'Vợ Chồng', icon: '👰🤵' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRelationshipType(r.id as CoupleRelationshipType)}
                      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        relationshipType === r.id 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-base sm:text-xl">{r.icon}</span>
                      <span className="text-[10px] sm:text-xs font-bold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">
                  {relationshipType === 'married' ? 'Ngày Cưới / Kỷ Niệm Hôn Nhân' : 'Ngày Bắt Đầu Yêu Nhau'}
                </label>
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Biệt danh của bạn</label>
                  <input
                    type="text"
                    value={myNickname}
                    onChange={(e) => setMyNickname(e.target.value)}
                    placeholder="VD: Anh Yêu, Chồng Ơi..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Biệt danh người ấy</label>
                  <input
                    type="text"
                    value={partnerNickname}
                    onChange={(e) => setPartnerNickname(e.target.value)}
                    placeholder="VD: Em Yêu, Vợ Ơi..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || !createPasscode.trim()}
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} className="fill-white" />}
                <span>Khởi Tạo Không Gian Cặp Đôi</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinCouple} className="space-y-3.5 sm:space-y-5">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
                Nhập Mã mời do hệ thống cấp và Mật khẩu phòng do người yêu bạn đã đặt để ghép đôi an toàn.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Mã Mời Phòng Đôi (Do hệ thống cấp)</label>
                <input
                  type="text"
                  value={joinPairCode}
                  onChange={(e) => setJoinPairCode(e.target.value.toUpperCase())}
                  placeholder="VD: HV-74921X"
                  maxLength={12}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:py-3.5 text-sm sm:text-base font-mono font-black text-white placeholder-zinc-600 uppercase tracking-widest outline-none text-center"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 text-rose-300">
                  <KeyRound size={13} />
                  <span>Mật Khẩu Phòng Đôi (Do người tạo cấp) *</span>
                </label>
                <input
                  type="password"
                  value={joinPasscode}
                  onChange={(e) => setJoinPasscode(e.target.value)}
                  placeholder="Nhập mật khẩu do người tạo phòng cung cấp..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Biệt danh của bạn trong phòng đôi</label>
                <input
                  type="text"
                  value={myNickname}
                  onChange={(e) => setMyNickname(e.target.value)}
                  placeholder="VD: Em Yêu, Vợ Ơi, Anh Yêu..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !joinPairCode.trim() || !joinPasscode.trim()}
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
              >
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Xác Thực & Ghép Đôi Ngay</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: ACTIVE COUPLE ROMANCE SPACE (5 TABS SYSTEM)
  // -------------------------------------------------------------
  const currentTheme: RomanceThemeKey = (couple.theme as RomanceThemeKey) || 'rose_romance';

  return (
    <div className="w-full max-w-6xl mx-auto px-0 xs:px-1 sm:px-4 py-1.5 sm:py-6 space-y-3.5 sm:space-y-6 pb-28 sm:pb-32 animate-in fade-in duration-300 overflow-x-hidden">
      {/* Toast Notification for Quick Love Pings */}
      {activeLovePingNotification && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 px-3.5 sm:px-6 py-2 sm:py-3 rounded-full bg-zinc-900/95 border border-rose-500/60 shadow-2xl text-white font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 max-w-[92vw] truncate">
          <Heart size={14} className="text-rose-500 fill-rose-500 animate-bounce shrink-0" />
          <span className="truncate">{activeLovePingNotification}</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* PAGE 1: YÊU THƯƠNG & CẢM XÚC (Bộ đếm thời gian, Tương tác cảm xúc, Lời nhắc) */}
      {/* ============================================================= */}
      {currentPage === 'page1' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
          {/* 1.1 Motion Milestone Anniversary Days Widget */}
          <AnniversaryDaysWidget
            couple={couple}
            userUid={user?.uid}
            theme={currentTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            lovePoints={couple.lovePoints || 100}
          />

          {/* 1.2 Romantic Hero Header & Emotional Interactions */}
          <RomanticHeroHeader
            couple={couple}
            userUid={user?.uid}
            theme={currentTheme}
            onChangeTheme={handleChangeTheme}
            onSendLovePing={handleSendLovePing}
            onOpenSettings={() => setIsSettingsOpen(true)}
            lovePoints={couple.lovePoints || 100}
          />

          {/* 1.3 Love Memos & Daily Reminders Widget */}
          <LoveNotesWidget
            couple={couple}
            userUid={user?.uid}
            onSendLovePing={handleSendLovePing}
          />
        </div>
      )}

      {/* ============================================================= */}
      {/* PAGE 2: CHU KỲ & SỨC KHỎE BẠN GÁI (Menstrual Tracker & Boyfriend Care) */}
      {/* ============================================================= */}
      {currentPage === 'page2' && (
        <PeriodTrackerTab
          couple={couple}
          userUid={user?.uid}
          periodLogs={periodLogs}
          onUpdateCycleConfig={handleUpdateCycleConfig}
          onAddPeriodLog={handleAddPeriodLog}
          onSendBoyfriendCarePing={handleSendBoyfriendCarePing}
        />
      )}

      {/* ============================================================= */}
      {/* PAGE 3: LỊCH ĐÔI & NHẬT KÝ TÌNH YÊU (Combined Calendar & Love Diary) */}
      {/* ============================================================= */}
      {currentPage === 'page3' && (
        <CoupleCalendarAndDiaryTab
          couple={couple}
          userUid={user?.uid}
          customEvents={coupleEvents}
          diaries={diaries}
          effectiveTracks={effectiveTracks}
          onPlayTrack={onPlayTrack}
          onCreateCustomEvent={handleCreateCustomEvent}
          onUpdateCustomEvent={handleUpdateCustomEvent}
          onDeleteCustomEvent={handleDeleteCustomEvent}
          onCreateDiary={handleCreateDiary}
          onDeleteDiary={handleDeleteDiary}
          onAddDiaryComment={handleAddDiaryComment}
          onToggleDiaryReaction={handleToggleDiaryReaction}
        />
      )}

      {/* ============================================================= */}
      {/* PAGE 4 / PAGE 5: KỶ NIỆM & TRÒ CHƠI (Quizzes, Cards, Voice Moments, Gallery) */}
      {/* ============================================================= */}
      {(currentPage === 'page4' || currentPage === 'page5') && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
          {/* Sub-selector for Page 5 */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/80 pb-2">
            {[
              { id: 'quizzes', label: '❓ Trả Lời Câu Hỏi Thấu Hiểu', shortLabel: '❓ Trắc Nghiệm', badge: customQuizzes.length },
              { id: 'cards', label: '🎴 Thẻ Bài Tình Yêu Đôi', shortLabel: '🎴 Thẻ Bài', badge: loveCards.length },
              { id: 'voice', label: '🎙️ Audio Lời Hứa & Hộp Thư Thoại', shortLabel: '🎙️ Audio Lời Hứa', badge: voiceMoments.length },
              { id: 'gallery', label: '📸 Bộ Sưu Tập Ảnh & Nhạc Kỷ Niệm', shortLabel: '📸 Ảnh & Nhạc', badge: memories.length + (couple.sharedSongIds?.length || 0) },
            ].map(sub => {
              const isActive = page5SubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setPage5SubTab(sub.id as any)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  <span className="hidden sm:inline">{sub.label}</span>
                  <span className="sm:hidden">{sub.shortLabel}</span>
                  {sub.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-rose-600' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {sub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {page5SubTab === 'quizzes' && (
            <QuizzesTab
              couple={couple}
              userUid={user?.uid}
              customQuizzes={customQuizzes}
              onCreateQuiz={handleCreateQuiz}
              onAnswerQuiz={handleAnswerQuiz}
            />
          )}

          {page5SubTab === 'cards' && (
            <LoveCardsTab
              couple={couple}
              userUid={user?.uid}
              loveCards={loveCards}
              onDrawCard={handleDrawLoveCard}
              onSubmitAnswer={handleSubmitCardAnswer}
              onToggleReveal={handleToggleCardReveal}
            />
          )}

          {page5SubTab === 'voice' && (
            <VoiceMomentsTab
              couple={couple}
              userUid={user?.uid}
              voiceMoments={voiceMoments}
              onSaveVoiceMoment={handleSaveVoiceMoment}
            />
          )}

          {page5SubTab === 'gallery' && (
            <SharedGalleryTab
              couple={couple}
              userUid={user?.uid}
              effectiveTracks={effectiveTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={onPlayTrack}
              onToggleSharedSong={handleToggleSharedSong}
              memories={memories}
              onCreateMemory={handleCreateMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          )}
        </div>
      )}

      {/* 6. SETTINGS MODAL */}
      <CoupleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        couple={couple}
        userUid={user?.uid}
        onUpdateCouple={handleUpdateCoupleSettings}
        onUnpairCouple={handleUnpairCouple}
        onDeleteRelationship={handleDeleteRelationship}
      />
    </div>
  );
}
