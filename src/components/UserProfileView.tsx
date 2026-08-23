import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Coins, 
  Clock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Headphones, 
  Radio, 
  Volume2, 
  Sliders, 
  CheckCircle2, 
  Copy, 
  Check, 
  LogOut, 
  LogIn, 
  Gift, 
  Flame, 
  ArrowRight, 
  KeyRound, 
  History, 
  Award, 
  Loader2, 
  Music, 
  Plus,
  Bot,
  ArrowLeft,
  Home,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PointTransaction } from '../types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminChainLockOverlay } from './admin/AdminChainLockOverlay';
import { SixLayerSecurityShield } from './account/SixLayerSecurityShield';
import { HaevySupportAiView } from './account/HaevySupportAiView';

interface UserProfileViewProps {
  onOpenAuth: () => void;
  onGoToTopup: () => void;
  onGoToHome?: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenAuthorStudio?: () => void;
  onOpenAuthorVerification?: () => void;
  onOpenPublishAudio?: () => void;
  onOpenGiftShop?: () => void;
  onOpenAdmin?: () => void;
}

export function UserProfileView({ 
  onOpenAuth, 
  onGoToTopup,
  onGoToHome,
  onSelectTab,
  onOpenAuthorStudio,
  onOpenAuthorVerification,
  onOpenPublishAudio,
  onOpenGiftShop,
  onOpenAdmin
}: UserProfileViewProps) {
  const { 
    user, 
    accountId, 
    isAdmin, 
    audioPoints, 
    totalEarnedPoints, 
    totalListenedMinutes, 
    lastDailyCheckin, 
    vipExpiresAt, 
    isVip, 
    vipSettings,
    anonymousVipSession,
    isAuthorVerified,
    authorStatus,
    authorStageName,
    updateVipSettings,
    performDailyCheckin,
    logout 
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'security' | 'transactions'>('overview');
  const [isSupportFullScreen, setIsSupportFullScreen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAdminChainLock, setShowAdminChainLock] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = lastDailyCheckin === todayStr;

  const handleCopyId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      setLoadingHistory(true);
      try {
        const q = query(
          collection(db, 'users', user.uid, 'pointTransactions'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        const txs: PointTransaction[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || '',
            amount: data.amount || 0,
            type: data.type || 'bonus',
            createdAt: data.createdAt,
          };
        });
        setTransactions(txs);
      } catch (err) {
        console.error('Error fetching point transactions:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchTransactions();
  }, [user, audioPoints]);

  const handleDailyCheckin = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setCheckinLoading(true);
    setCheckinMsg(null);
    const res = await performDailyCheckin();
    setCheckinLoading(false);
    setCheckinMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const formatExpiresDate = (isoStr: string | null) => {
    if (!isoStr) return 'Chưa kích hoạt';
    const d = new Date(isoStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} lúc ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Full-Screen Haevy Support AI Session
  if (isSupportFullScreen) {
    return (
      <HaevySupportAiView
        user={user}
        accountId={accountId}
        isVip={isVip}
        isFullScreen={true}
        onClose={() => setIsSupportFullScreen(false)}
        onNavigateToSecurity={() => {
          setIsSupportFullScreen(false);
          setActiveSubTab('security');
        }}
        onNavigateToVip={() => {
          setIsSupportFullScreen(false);
          onGoToTopup();
        }}
      />
    );
  }

  // Anonymous / Non-logged in State
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 px-3 sm:px-4 py-4">
        {/* Top return bar */}
        {onGoToHome && (
          <div className="flex items-center justify-between">
            <button
              onClick={onGoToHome}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft size={16} />
              <span>Quay lại Trang Chủ Âm Nhạc</span>
            </button>
          </div>
        )}

        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 mx-auto flex items-center justify-center text-zinc-400 shadow-xl">
            <UserIcon size={36} />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Tài Khoản Cá Nhân</h2>
            <p className="text-sm text-zinc-400">
              Đăng nhập để đồng bộ Điểm Audio, lưu danh sách bài hát, bảo lưu quyền VIP và quản lý bảo mật 6 lớp an toàn.
            </p>
          </div>

          {anonymousVipSession?.isActive && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start gap-3">
              <KeyRound size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đang dùng phiên VIP Ẩn Danh ({anonymousVipSession.guestId})</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Hạn dùng đến: {formatExpiresDate(anonymousVipSession.expiresAt)}. Hãy đăng nhập để lưu trữ vĩnh viễn quyền lợi.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              <span>Đăng nhập / Đăng ký</span>
            </button>

            <button
              onClick={onGoToTopup}
              className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} className="text-amber-400" />
              <span>Gói Nạp VIP</span>
            </button>

            <button
              onClick={() => setIsSupportFullScreen(true)}
              className="px-6 py-3.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot size={18} />
              <span>Haevy Support AI</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 px-3 sm:px-4 py-2 sm:py-4">
      {/* Top Breadcrumb / Return to Haevy Audio Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {onGoToHome && (
            <button
              onClick={onGoToHome}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="Quay lại giao diện nghe nhạc chính của Haevy Audio"
            >
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span>Quay lại Haevy Audio</span>
            </button>
          )}
          <span className="text-xs text-zinc-500 hidden sm:inline">•</span>
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Trang Quản Lý Cá Nhân</span>
        </div>

        {/* Live Support Trigger button */}
        <button
          onClick={() => setIsSupportFullScreen(true)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          title="Mở phiên chat toàn màn hình với Trợ lý AI và CSKH"
        >
          <Bot size={16} />
          <span>Haevy Support AI (Toàn Màn Hình)</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">24/7</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div 
        id="user-profile-header-card"
        className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all ${
          isVip 
            ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500/40 shadow-amber-500/10'
            : 'bg-zinc-900 border-zinc-800/90 shadow-xl'
        }`}
      >
        {isVip && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* User Info Left */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className={`w-24 h-24 rounded-3xl object-cover shadow-2xl ${
                    isVip ? 'ring-2 ring-amber-500/60' : 'ring-2 ring-zinc-700/80'
                  }`}
                />
              ) : (
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl ${
                  isVip ? 'bg-gradient-to-br from-amber-950/40 to-zinc-900 border-2 border-amber-500/50 text-amber-300' : 'bg-zinc-800 border-2 border-zinc-700 text-zinc-400'
                }`}>
                  <UserIcon size={44} />
                </div>
              )}
              {isVip && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-lg border-2 border-black">
                  <Crown size={15} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                  {user.displayName || 'Người Yêu Âm Nhạc'}
                </h2>
                {isVip ? (
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md flex items-center gap-1">
                    <Crown size={12} fill="currentColor" />
                    THÀNH VIÊN VIP (x3 ĐIỂM)
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                    <UserIcon size={11} className="text-zinc-400" />
                    Thành viên Thường (Bản Chuẩn)
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    Admin
                  </span>
                )}
              </div>

              {/* Account ID Pill with 1-Click Copy */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <div 
                  onClick={handleCopyId}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-xl text-xs font-mono cursor-pointer transition-colors group ${
                    isVip 
                      ? 'bg-zinc-950/80 hover:bg-zinc-800 border-amber-500/30 text-amber-300'
                      : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                  }`}
                  title="Bấm để sao chép ID tài khoản"
                >
                  <span className="text-zinc-500 text-[11px]">ID:</span>
                  <span className="font-bold">{accountId}</span>
                  {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500 group-hover:text-zinc-300" />}
                </div>
                {copiedId && <span className="text-[11px] text-emerald-400 font-semibold">Đã sao chép!</span>}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-400 pt-0.5">
                <Mail size={13} className="text-zinc-500" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Direct Action Buttons Right */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={onGoToTopup}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Crown size={15} fill="currentColor" />
              <span>Nạp VIP</span>
            </button>

            <button
              onClick={() => setShowAdminChainLock(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-zinc-950/90 hover:bg-zinc-850 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Truy cập hệ thống Haevy Admin"
            >
              <KeyRound size={15} className="text-amber-400" />
              <span>Admin</span>
            </button>

            <button
              onClick={async () => await logout()}
              className="px-3 py-2.5 rounded-2xl bg-zinc-950/80 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Clean Sub-Tab Navigation Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <UserIcon size={14} />
              <span>Tổng Quan & Âm Nhạc</span>
            </button>

            <button
              onClick={() => setActiveSubTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30'
              }`}
            >
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>Bảo Vệ Tài Khoản 6 Lớp</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => setActiveSubTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'transactions'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <History size={14} />
              <span>Lịch Sử Điểm</span>
            </button>

            <button
              onClick={() => setIsSupportFullScreen(true)}
              className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer bg-zinc-950 hover:bg-purple-950/40 text-purple-300 hover:text-purple-200 border border-purple-500/30"
              title="Mở phiên trò chuyện hỗ trợ khách hàng toàn màn hình"
            >
              <Bot size={14} className="text-purple-400" />
              <span>Haevy Support AI</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-200 px-1 rounded font-mono">Full</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock size={14} className={isVip ? 'text-amber-400' : 'text-zinc-400'} />
            <span>
              {isVip ? (
                <>VIP đến: <strong className="text-amber-300">{formatExpiresDate(vipExpiresAt)}</strong></>
              ) : (
                <>Bản Thường • <strong className="text-amber-400 cursor-pointer hover:underline" onClick={onGoToTopup}>Nâng cấp VIP x3 điểm</strong></>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 4 Clean Stats Bento Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Stat 1: Điểm Audio Khả Dụng */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-2 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Điểm Audio</span>
                  <Coins size={16} className={isVip ? 'text-amber-400' : 'text-zinc-400'} />
                </div>
                <p className={`text-2xl sm:text-3xl font-extrabold font-mono mt-1 ${
                  isVip ? 'text-amber-300' : 'text-zinc-100'
                }`}>
                  {audioPoints.toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {isVip ? 'Tích lũy x3 tốc độ VIP' : 'Số dư điểm hiện có'}
                </p>
              </div>

              {onOpenGiftShop && (
                <button
                  onClick={onOpenGiftShop}
                  className={`mt-2 text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    isVip ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Gift size={12} />
                  <span>Tặng quà tác giả</span>
                </button>
              )}
            </div>

            {/* Stat 2: Tổng Điểm Tích Lũy */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Tổng tích lũy</span>
                <Award size={16} className="text-indigo-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-300">
                {totalEarnedPoints.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-500">Toàn bộ điểm đã nhận</p>
            </div>

            {/* Stat 3: Thời Gian Nghe Nhạc */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Thời gian nghe</span>
                <Headphones size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">
                {totalListenedMinutes || 0}
                <span className="text-xs font-normal text-zinc-400 ml-1">phút</span>
              </p>
              <p className="text-[11px] text-zinc-500">
                {isVip ? '+3 điểm / phút nghe (x3)' : '+1 điểm / phút nghe'}
              </p>
            </div>

            {/* Stat 4: Điểm Danh Hàng Ngày */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Điểm danh hôm nay</span>
                <Flame size={16} className={hasCheckedInToday ? (isVip ? 'text-amber-400' : 'text-emerald-400') : 'text-zinc-500'} />
              </div>
              
              <div>
                <button
                  onClick={handleDailyCheckin}
                  disabled={checkinLoading || hasCheckedInToday}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    hasCheckedInToday
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isVip
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black shadow-md'
                      : 'bg-zinc-100 hover:bg-white text-black shadow-sm'
                  }`}
                >
                  {checkinLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : hasCheckedInToday ? (
                    <>
                      <Check size={14} />
                      <span>{isVip ? 'Đã nhận +150 pts' : 'Đã nhận +50 pts'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>{isVip ? 'Nhận +150 pts (x3)' : 'Nhận +50 pts'}</span>
                    </>
                  )}
                </button>
              </div>
              {checkinMsg && (
                <p className={`text-[10px] ${checkinMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {checkinMsg.text}
                </p>
              )}
            </div>
          </div>

          {/* Author & Creator Corner Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Music size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base sm:text-lg">
                      Góc Tác Giả & Phát Hành Âm Nhạc
                    </h3>
                    {isAuthorVerified ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck size={11} /> Tác Giả Đã Xác Minh ✓
                      </span>
                    ) : authorStatus === 'pending' ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Clock size={11} /> Đang Thẩm Định eKYC
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                        Chưa Xác Minh
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isAuthorVerified 
                      ? `Nghệ danh: ${authorStageName || 'Tác giả'} • Bạn có toàn quyền phát hành nhạc chất lượng cao lên hệ thống Haevy Audio`
                      : 'Xác minh eKYC (Gmail, SĐT, CCCD 12 số, quét khuôn mặt) để nhận huy hiệu Tác Giả chính thức và +300 Điểm Audio'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onOpenAuthorStudio && (
                  <button
                    type="button"
                    onClick={onOpenAuthorStudio}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Music size={15} className="text-amber-400" />
                    <span>Vào Studio</span>
                  </button>
                )}

                {onOpenPublishAudio && (
                  <button
                    type="button"
                    onClick={onOpenPublishAudio}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Đăng Audio Mới</span>
                  </button>
                )}

                {!isAuthorVerified && onOpenAuthorVerification && (
                  <button
                    type="button"
                    onClick={onOpenAuthorVerification}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={15} />
                    <span>{authorStatus === 'pending' ? 'Xem lại eKYC' : 'Xác Minh eKYC (+300 pts)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* VIP Audio Settings & Membership Perks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VIP Audio Settings & Tuning */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Sliders size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white text-base">Cấu Hình & Đặc Quyền VIP Toàn Diện</h3>
                </div>
                {isVip ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Crown size={12} className="fill-amber-400" />
                    Đang Kích Hoạt (VIP)
                  </span>
                ) : (
                  <button
                    onClick={onGoToTopup}
                    className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-xl border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Nâng cấp mở khóa</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                {/* Setting 1: Hi-Fi Lossless */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Radio size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">Chuẩn Hi-Fi Lossless (320kbps / FLAC)</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Studio</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Âm thanh trung thực, dải động sâu không nén suy hao</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={vipSettings.hifiMode}
                    disabled={!isVip}
                    onChange={(e) => updateVipSettings({ hifiMode: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Setting 2: Spatial 3D Audio */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Headphones size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">Spatial 3D Sound Không Gian 360°</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Master</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Tái tạo âm trường 3 chiều đa hướng sống động</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={vipSettings.spatial3D}
                    disabled={!isVip}
                    onChange={(e) => updateVipSettings({ spatial3D: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Setting 3: Bass Boost */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">Deep Bass Boost (Tăng Siêu Trầm)</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Punchy</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Tăng cường uy lực dải tần 20Hz - 80Hz</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={vipSettings.bassBoost}
                    disabled={!isVip}
                    onChange={(e) => updateVipSettings({ bassBoost: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Setting 4: Equalizer Presets */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <Sliders size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Smart Equalizer & Preset Dolby</p>
                        <p className="text-[11px] text-zinc-400">Tùy biến cấu hình âm thanh theo phong cách nghe</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">
                      {vipSettings.smartEqualizer || 'bass_ultra'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { id: 'flat', label: 'Chuẩn Gốc (Flat)' },
                      { id: 'bass_ultra', label: 'Bass Siêu Trầm' },
                      { id: 'vocal_clarity', label: 'Trong Trẻo Vocal' },
                      { id: 'electronic', label: 'EDM / Club' },
                      { id: 'acoustic', label: 'Acoustic / Jazz' },
                      { id: 'cinema_3d', label: 'Rạp Chiếu 3D' },
                    ].map((eq) => (
                      <button
                        key={eq.id}
                        type="button"
                        disabled={!isVip}
                        onClick={() => updateVipSettings({ smartEqualizer: eq.id as any })}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border cursor-pointer ${
                          (vipSettings.smartEqualizer || 'bass_ultra') === eq.id
                            ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40'
                        }`}
                      >
                        {eq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Perks Overview Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <h3 className="font-bold text-white text-base">Thông Tin Quyền Lợi Sử Dụng</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isVip ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {isVip ? 'Đang dùng VIP' : 'Bản Thường (Miễn phí)'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-zinc-200">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>Toàn Quyền Nghe Toàn Bộ Kho Audio</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Cả người dùng Thường và VIP đều được thưởng thức toàn bộ kho nhạc, không giới hạn lượt phát.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Crown size={15} className="text-amber-400" />
                      <span>Đặc Quyền Gói VIP Âm Nhạc</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Mở khóa bộ chỉnh âm Hi-Fi Lossless, Deep Bass Boost, Treble Clarity, Âm trường 3D, biểu tượng Vương Miện mạ vàng & x3 tốc độ tích lũy Điểm Audio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shortcut to Topup */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {isVip ? 'Gia hạn VIP duy trì hiệu ứng' : 'Nâng cấp lên VIP trải nghiệm Hi-Fi'}
                </span>
                <button
                  onClick={onGoToTopup}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{isVip ? 'Gia hạn' : 'Nâng cấp ngay'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: 6-LAYER SECURITY SHIELD */}
      {/* ========================================================================= */}
      {activeSubTab === 'security' && (
        <SixLayerSecurityShield
          user={user}
          accountId={accountId}
          isVip={isVip}
          onOpenSupport={() => setIsSupportFullScreen(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TRANSACTION HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'transactions' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <History size={18} className="text-amber-400" />
              <h3 className="font-bold text-white text-base">Lịch Sử Biến Động Điểm Audio</h3>
            </div>
            <span className="text-xs text-zinc-500">10 giao dịch gần nhất</span>
          </div>

          {loadingHistory ? (
            <div className="py-8 flex items-center justify-center gap-2 text-zinc-400 text-xs">
              <Loader2 size={16} className="animate-spin" />
              <span>Đang tải lịch sử...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Chưa có giao dịch điểm nào. Hãy nghe nhạc và điểm danh để nhận điểm ngay!
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{tx.title}</p>
                    <p className="text-[11px] text-zinc-500">
                      {tx.type === 'listen' ? 'Thưởng nghe nhạc' : tx.type === 'checkin' ? 'Điểm danh hàng ngày' : tx.type === 'bonus' ? 'Thưởng hệ thống / Mã code' : 'Giao dịch'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`font-mono font-bold text-xs ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Moving Chains & Central Padlock Overlay */}
      <AdminChainLockOverlay
        isOpen={showAdminChainLock}
        onClose={() => setShowAdminChainLock(false)}
        onSuccess={() => {
          setShowAdminChainLock(false);
          if (onOpenAdmin) onOpenAdmin();
        }}
      />
    </div>
  );
}
