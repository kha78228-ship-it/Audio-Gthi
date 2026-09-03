import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Gift, 
  Users, 
  Crown, 
  Coins, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Sliders, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  Filter, 
  Activity, 
  Music, 
  MessageSquare, 
  Radio, 
  HeartHandshake
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ReferralCode, AnonymousPass, UserAccountData, AuthorVerification, Track, CommunityPost, SystemAuditLog } from '../types';

import { AdminLockScreen } from './admin/AdminLockScreen';
import { AdminPage1Overview } from './admin/AdminPage1Overview';
import { AdminPage2Privileges } from './admin/AdminPage2Privileges';
import { AdminPage3Authors } from './admin/AdminPage3Authors';
import { AdminPage4SupportAdmin } from './admin/AdminPage4SupportAdmin';
import { AdminPage5HomepageEditor } from './admin/AdminPage5HomepageEditor';
import { AdminPage6CrowdGame } from './admin/AdminPage6CrowdGame';
import { AdminPage7Events } from './admin/AdminPage7Events';

interface AdminDashboardViewProps {
  onBackToHome?: () => void;
  onOpenAuth?: () => void;
  adminSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7';
  onSelectAdminSubTab?: (tab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7') => void;
  allTracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
}

export function AdminDashboardView({
  onBackToHome,
  onOpenAuth,
  adminSubTab: controlledAdminSubTab,
  onSelectAdminSubTab,
  allTracks = [],
  onPlayTrack,
  currentTrack = null,
  isPlaying = false,
}: AdminDashboardViewProps) {
  const { 
    user, 
    isAdmin, 
    isSuperAdmin,
    systemAnnouncements,
    systemGlobalConfig,
    accountId
  } = useAuth();

  // Sub Tab state (controlled or uncontrolled fallback)
  const [internalSubTab, setInternalSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7'>('page1');
  const activePage = controlledAdminSubTab || internalSubTab;

  const handlePageChange = (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7') => {
    if (onSelectAdminSubTab) {
      onSelectAdminSubTab(page);
    }
    setInternalSubTab(page);
  };

  // Referral Codes State
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  // Anonymous Passes State
  const [anonymousPasses, setAnonymousPasses] = useState<AnonymousPass[]>([]);
  // Author Verifications Queue
  const [authorVerifications, setAuthorVerifications] = useState<AuthorVerification[]>([]);
  // Audio Tracks State
  const [customTracks, setCustomTracks] = useState<Track[]>([]);
  // Users State
  const [usersList, setUsersList] = useState<UserAccountData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // System Audit Logs State
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  // Community Posts State
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Realtime listen to referralCodes
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'referralCodes'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: ReferralCode[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setReferralCodes(list);
      }, (err) => {
        console.warn('Referral codes listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching referral codes:', e);
    }
  }, [isAdmin]);

  // Realtime listen to anonymousPasses
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'anonymousPasses'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: AnonymousPass[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAnonymousPasses(list);
      }, (err) => {
        console.warn('Anonymous passes listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching anonymous passes:', e);
    }
  }, [isAdmin]);

  // Realtime listen to authorVerifications
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'authorVerifications'));
      const unsub = onSnapshot(q, (snap) => {
        const list: AuthorVerification[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        list.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          const timeA = a.submittedAt?.toMillis?.() || (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
          const timeB = b.submittedAt?.toMillis?.() || (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
          return timeB - timeA;
        });
        setAuthorVerifications(list);
      }, (err) => {
        console.warn('Author verifications listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching author verifications:', e);
    }
  }, [isAdmin]);

  // Realtime listen to customTracks
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'tracks'), orderBy('createdAt', 'desc'), limit(100));
      const unsub = onSnapshot(q, (snap) => {
        const list: Track[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setCustomTracks(list);
      }, (err) => {
        console.warn('Custom tracks listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching custom tracks:', e);
    }
  }, [isAdmin]);

  // Realtime listen to community posts
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(50));
      const unsub = onSnapshot(q, (snap) => {
        const list: CommunityPost[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setCommunityPosts(list);
      }, (err) => {
        console.warn('Community posts listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching community posts:', e);
    }
  }, [isAdmin]);

  // Realtime listen to System Audit Logs
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'systemAuditLogs'), orderBy('timestamp', 'desc'), limit(200));
      const unsub = onSnapshot(q, (snap) => {
        const list: SystemAuditLog[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAuditLogs(list);
      }, (err) => {
        console.warn('System audit logs listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.error('Error fetching system audit logs:', e);
    }
  }, [isAdmin]);

  // Fetch users list
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'), limit(100));
      const snap = await getDocs(q);
      const list: UserAccountData[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          uid: d.id,
          accountId: data.accountId || `AH-${d.id.slice(0, 6).toUpperCase()}`,
          email: data.email || null,
          displayName: data.displayName || null,
          role: data.role || 'user',
          vipTier: data.vipTier || 'free',
          vipExpiresAt: data.vipExpiresAt || null,
          audioPoints: data.audioPoints || 0,
          totalEarnedPoints: data.totalEarnedPoints || 0,
          totalListenedMinutes: data.totalListenedMinutes || 0,
          isBanned: data.isBanned || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || undefined,
        });
      });
      setUsersList(list);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // =========================================================================
  // ACCESS GATE: Non-admin users see the Moving Chains & Padlock Lock Screen
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
        <AdminLockScreen onBackToHome={onBackToHome} onOpenAuth={onOpenAuth} />
      </div>
    );
  }

  const pendingAuthorsCount = authorVerifications.filter(a => a.status === 'pending').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 sm:pb-16 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 1: TỔNG QUAN HỆ THỐNG */}
      {/* ========================================================================= */}
      {activePage === 'page1' && (
        <AdminPage1Overview
          usersList={usersList}
          customTracks={customTracks}
          authorVerifications={authorVerifications}
          referralCodes={referralCodes}
          anonymousPasses={anonymousPasses}
          communityPosts={communityPosts}
          auditLogs={auditLogs}
          systemAnnouncements={systemAnnouncements}
          onNavigateToPage={handlePageChange}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: CÁC ĐẶC QUYỀN CỦA ADMIN */}
      {/* ========================================================================= */}
      {activePage === 'page2' && (
        <AdminPage2Privileges
          referralCodes={referralCodes}
          anonymousPasses={anonymousPasses}
          auditLogs={auditLogs}
          onRefreshData={fetchUsers}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: XÉT DUYỆT TÁC GIẢ */}
      {/* ========================================================================= */}
      {activePage === 'page3' && (
        <AdminPage3Authors
          authorVerifications={authorVerifications}
          customTracks={customTracks}
          onRefreshData={fetchUsers}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: NUÔI ADMIN XÉT DUYỆT CÁC GÓI VIP, GÓI NẠP XU AUDIO CHO NGƯỜI DÙNG */}
      {/* ========================================================================= */}
      {activePage === 'page4' && (
        <AdminPage4SupportAdmin
          usersList={usersList}
          onRefreshUsers={fetchUsers}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: SỬA VÀ TÙY BIẾN TRANG CHỦ THEO Ý ADMIN (PHÂN KHÁCH HÀNG) */}
      {/* ========================================================================= */}
      {activePage === 'page5' && (
        <AdminPage5HomepageEditor
          allTracks={allTracks}
          usersList={usersList}
          onPlayTrack={onPlayTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 6: QUẢN LÝ VÒNG ĐẤU & KẾT TOÁN ×2 ĐÁM ĐÔNG */}
      {/* ========================================================================= */}
      {activePage === 'page6' && (
        <AdminPage6CrowdGame
          usersList={usersList}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 7: TÙY CHỈNH GIAO DIỆN CÁC SỰ KIỆN SẮP HIỆN & LIVE SHOWS */}
      {/* ========================================================================= */}
      {activePage === 'page7' && (
        <AdminPage7Events />
      )}
    </div>
  );
}
