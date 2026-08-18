import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  serverTimestamp, 
  collection, 
  addDoc, 
  increment 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { VipTier, VipSettings, PointTransaction, VipPackage, VipOrder } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  favorites: string[];
  audioPoints: number;
  totalEarnedPoints: number;
  totalListenedMinutes: number;
  lastDailyCheckin: string | null;
  vipTier: VipTier;
  vipExpiresAt: string | null;
  isVip: boolean;
  vipSettings: VipSettings;
  toggleFavorite: (trackId: string) => Promise<void>;
  addAudioPoints: (amount: number, title: string, type: PointTransaction['type']) => Promise<void>;
  incrementListenTime: (minutes: number) => Promise<void>;
  performDailyCheckin: () => Promise<{ success: boolean; message: string; pointsAwarded: number }>;
  redeemVipWithPoints: (tier: VipTier, durationDays: number, pointsCost: number) => Promise<{ success: boolean; message: string }>;
  purchaseVipPlan: (params: {
    pkg: VipPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: VipOrder['paymentMethod'];
  }) => Promise<{ success: boolean; message: string; orderId?: string }>;
  activateTrialVip: () => Promise<void>;
  updateVipSettings: (settings: Partial<VipSettings>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_VIP_SETTINGS: VipSettings = {
  hifiMode: true,
  bassBoost: true,
  spatial3D: true,
  showVipBadge: true,
  autoDownloadOffline: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [audioPoints, setAudioPoints] = useState<number>(0);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState<number>(0);
  const [totalListenedMinutes, setTotalListenedMinutes] = useState<number>(0);
  const [lastDailyCheckin, setLastDailyCheckin] = useState<string | null>(null);
  const [vipTier, setVipTier] = useState<VipTier>('free');
  const [vipExpiresAt, setVipExpiresAt] = useState<string | null>(null);
  const [vipSettings, setVipSettings] = useState<VipSettings>(DEFAULT_VIP_SETTINGS);

  // Derive isVip boolean
  const isVip = 
    vipTier !== 'free' && 
    (vipExpiresAt === null || new Date(vipExpiresAt).getTime() > Date.now());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // New user registration bonus: 100 free Audio Points!
            const now = new Date().toISOString();
            await setDoc(userRef, {
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Người dùng',
              photoURL: currentUser.photoURL || '',
              audioPoints: 100,
              totalEarnedPoints: 100,
              totalListenedMinutes: 0,
              lastDailyCheckin: null,
              vipTier: 'free',
              vipExpiresAt: null,
              vipSettings: DEFAULT_VIP_SETTINGS,
              favoriteTrackIds: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            // Log welcome bonus
            await addDoc(collection(db, 'users', currentUser.uid, 'pointTransactions'), {
              title: 'Thưởng đăng ký thành viên mới',
              amount: 100,
              type: 'bonus',
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Error ensuring user doc:', err);
        }
      } else {
        setFavorites([]);
        setAudioPoints(0);
        setTotalEarnedPoints(0);
        setVipTier('free');
        setVipExpiresAt(null);
        setVipSettings(DEFAULT_VIP_SETTINGS);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to user profile, points, and VIP in Firestore
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeDoc = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.favoriteTrackIds)) {
            setFavorites(data.favoriteTrackIds);
          }
          setAudioPoints(typeof data.audioPoints === 'number' ? data.audioPoints : 0);
          setTotalEarnedPoints(typeof data.totalEarnedPoints === 'number' ? data.totalEarnedPoints : 0);
          setTotalListenedMinutes(typeof data.totalListenedMinutes === 'number' ? data.totalListenedMinutes : 0);
          setLastDailyCheckin(data.lastDailyCheckin || null);
          setVipTier((data.vipTier as VipTier) || 'free');
          setVipExpiresAt(data.vipExpiresAt || null);
          if (data.vipSettings) {
            setVipSettings({ ...DEFAULT_VIP_SETTINGS, ...data.vipSettings });
          }
        }
      },
      (error) => {
        console.error('Error fetching user snapshot:', error);
      }
    );

    return () => unsubscribeDoc();
  }, [user]);

  const addAudioPoints = async (amount: number, title: string, type: PointTransaction['type']) => {
    if (!user) return;

    // Apply VIP 2X point multiplier for earning points
    const finalAmount = isVip && amount > 0 ? amount * 2 : amount;
    const finalTitle = isVip && amount > 0 ? `${title} (x2 Đặc quyền VIP)` : title;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(finalAmount),
          totalEarnedPoints: finalAmount > 0 ? increment(finalAmount) : increment(0),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Record transaction
      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: finalTitle,
        amount: finalAmount,
        type,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding audio points:', err);
    }
  };

  const incrementListenTime = async (minutes: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          totalListenedMinutes: increment(minutes),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error incrementing listen time:', err);
    }
  };

  const performDailyCheckin = async (): Promise<{ success: boolean; message: string; pointsAwarded: number }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để điểm danh.', pointsAwarded: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (lastDailyCheckin === todayStr) {
      return { success: false, message: 'Bạn đã điểm danh ngày hôm nay rồi! Hãy quay lại vào ngày mai.', pointsAwarded: 0 };
    }

    const basePoints = 50;
    const pointsAwarded = isVip ? basePoints * 2 : basePoints;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          lastDailyCheckin: todayStr,
          audioPoints: increment(pointsAwarded),
          totalEarnedPoints: increment(pointsAwarded),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: isVip ? 'Điểm danh hằng ngày (+2x VIP Bonus)' : 'Điểm danh hằng ngày',
        amount: pointsAwarded,
        type: 'checkin',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Điểm danh thành công! Nhận ngay +${pointsAwarded} Điểm Audio${isVip ? ' (Đã nhân đôi đặc quyền VIP)' : ''}.`,
        pointsAwarded,
      };
    } catch (err: any) {
      console.error('Error performing daily checkin:', err);
      return { success: false, message: 'Có lỗi xảy ra khi điểm danh.', pointsAwarded: 0 };
    }
  };

  const redeemVipWithPoints = async (
    tier: VipTier,
    durationDays: number,
    pointsCost: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    if (audioPoints < pointsCost) {
      return { 
        success: false, 
        message: `Bạn không đủ Điểm Audio (cần ${pointsCost} điểm, hiện có ${audioPoints} điểm). Hãy nghe nhạc để tích lũy thêm!` 
      };
    }

    try {
      // Calculate new expiration date
      let baseTime = Date.now();
      if (vipExpiresAt && new Date(vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          audioPoints: increment(-pointsCost),
          vipTier: tier,
          vipExpiresAt: newExpiresAt,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
        title: `Đổi gói VIP ${durationDays} ngày (${tier === 'vip_master' ? 'Master' : 'Standard'})`,
        amount: -pointsCost,
        type: 'redeem_vip',
        createdAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Chúc mừng bạn đã kích hoạt thành công gói VIP ${durationDays} ngày! Toàn bộ đặc quyền cao cấp đã được mở khóa.`,
      };
    } catch (err: any) {
      console.error('Error redeeming VIP:', err);
      return { success: false, message: 'Đổi đặc quyền VIP thất bại. Vui lòng thử lại.' };
    }
  };

  const purchaseVipPlan = async (params: {
    pkg: VipPackage;
    finalAmount: number;
    originalAmount: number;
    discountAmount: number;
    promoCodeApplied?: string;
    paymentMethod: VipOrder['paymentMethod'];
  }): Promise<{ success: boolean; message: string; orderId?: string }> => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để tiến hành nạp VIP.' };
    }

    try {
      const { pkg, finalAmount, originalAmount, discountAmount, promoCodeApplied, paymentMethod } = params;
      
      // Calculate new expiration date
      let baseTime = Date.now();
      if (vipExpiresAt && new Date(vipExpiresAt).getTime() > Date.now()) {
        baseTime = new Date(vipExpiresAt).getTime();
      }
      const newExpiresAt = new Date(baseTime + pkg.durationDays * 24 * 60 * 60 * 1000).toISOString();
      const newTier: VipTier = pkg.tier || 'vip';

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          vipTier: newTier,
          vipExpiresAt: newExpiresAt,
          audioPoints: increment(pkg.bonusPoints),
          totalEarnedPoints: increment(pkg.bonusPoints),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add order record
      const orderRef = await addDoc(collection(db, 'users', user.uid, 'vipOrders'), {
        packageId: pkg.id,
        packageName: pkg.name,
        durationDays: pkg.durationDays,
        originalAmount,
        discountAmount,
        finalAmount,
        promoCodeApplied: promoCodeApplied || '',
        paymentMethod,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // Add bonus points transaction if any
      if (pkg.bonusPoints > 0) {
        await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
          title: `Thưởng ${pkg.bonusPoints} pts khi nạp ${pkg.name}`,
          amount: pkg.bonusPoints,
          type: 'bonus',
          createdAt: serverTimestamp(),
        });
      }

      return {
        success: true,
        message: `Kích hoạt thành công ${pkg.name} (${pkg.durationDays} ngày)! Hạn VIP mới đến ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}.`,
        orderId: orderRef.id,
      };
    } catch (err: any) {
      console.error('Error purchasing VIP:', err);
      return {
        success: false,
        message: 'Thanh toán và kích hoạt VIP thất bại. Vui lòng thử lại.',
      };
    }
  };

  const activateTrialVip = async () => {
    if (!user) return;
    const newExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        vipTier: 'vip',
        vipExpiresAt: newExpiresAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(collection(db, 'users', user.uid, 'pointTransactions'), {
      title: 'Kích hoạt thử nghiệm 3 ngày VIP Miễn phí',
      amount: 0,
      type: 'bonus',
      createdAt: serverTimestamp(),
    });
  };

  const updateVipSettings = async (settings: Partial<VipSettings>) => {
    if (!user) return;
    const merged = { ...vipSettings, ...settings };
    setVipSettings(merged);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        vipSettings: merged,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để lưu bài hát yêu thích.');
    }

    const newFavorites = favorites.includes(trackId)
      ? favorites.filter((id) => id !== trackId)
      : [...favorites, trackId];

    setFavorites(newFavorites);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        favoriteTrackIds: newFavorites,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        favorites,
        audioPoints,
        totalEarnedPoints,
        totalListenedMinutes,
        lastDailyCheckin,
        vipTier,
        vipExpiresAt,
        isVip,
        vipSettings,
        toggleFavorite,
        addAudioPoints,
        incrementListenTime,
        performDailyCheckin,
        redeemVipWithPoints,
        purchaseVipPlan,
        activateTrialVip,
        updateVipSettings,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
