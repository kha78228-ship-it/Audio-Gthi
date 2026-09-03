import React from 'react';
import { 
  Activity, 
  Crown, 
  Users, 
  Music, 
  Coins, 
  ShieldCheck, 
  MessageSquare, 
  Gift, 
  KeyRound, 
  Sparkles, 
  Sliders, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Layers, 
  Server, 
  Cpu, 
  Database, 
  TrendingUp,
  Heart,
  Wallet,
  Headphones,
  Zap,
  Calendar
} from 'lucide-react';
import { UserAccountData, Track, AuthorVerification, ReferralCode, AnonymousPass, CommunityPost, SystemAuditLog, SystemAnnouncement } from '../../types';

interface AdminPage1OverviewProps {
  usersList: UserAccountData[];
  customTracks: Track[];
  authorVerifications: AuthorVerification[];
  referralCodes: ReferralCode[];
  anonymousPasses: AnonymousPass[];
  communityPosts: CommunityPost[];
  auditLogs: SystemAuditLog[];
  systemAnnouncements: SystemAnnouncement[];
  onNavigateToPage: (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7') => void;
}

export function AdminPage1Overview({
  usersList,
  customTracks,
  authorVerifications,
  referralCodes,
  anonymousPasses,
  communityPosts,
  auditLogs,
  systemAnnouncements,
  onNavigateToPage
}: AdminPage1OverviewProps) {
  const pendingAuthorsCount = authorVerifications.filter(a => a.status === 'pending').length;
  const verifiedAuthorsCount = authorVerifications.filter(a => a.status === 'verified').length;
  const vipUsersCount = usersList.filter(u => u.vipTier === 'vip').length;
  const totalCoinsInCirculation = usersList.reduce((acc, curr) => acc + (curr.audioPoints || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner & Live Server Diagnostics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Activity size={14} className="animate-pulse text-amber-400" />
              <span>Trang 1 • Tổng Quan Hệ Thống & Lưu Lượng Thời Gian Thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trung Tâm Điều Hành Toàn Diện <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Haevy Ecosystem</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Theo dõi trực tiếp sức khỏe máy chủ, số lượng tài khoản, kho âm thanh Lossless, luồng duyệt tác giả eKYC và doanh thu quỹ Nuôi Admin thời gian thực.
            </p>
          </div>

          {/* Real-time Server Health Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shrink-0 space-y-2 shadow-xl backdrop-blur-sm min-w-[240px]">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 flex items-center gap-1.5 font-semibold">
                <Server size={13} className="text-emerald-400" />
                Firestore DB
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Hoạt động 100%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block">Độ trễ phản hồi:</span>
                <span className="text-emerald-300 font-bold font-mono">18ms (Cực nhanh)</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Phiên bản Admin:</span>
                <span className="text-amber-400 font-bold font-mono">v4.8 Heavy Master</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick 5-Page Quick Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-6 border-t border-zinc-800/80">
          <button
            onClick={() => onNavigateToPage('page1')}
            className="p-3 rounded-2xl bg-amber-500 text-black font-extrabold text-xs flex items-center justify-between shadow-lg shadow-amber-500/20 cursor-pointer text-left transition-all"
          >
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <span>Trang 1: Tổng Quan</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">Hiện tại</span>
          </button>

          <button
            onClick={() => onNavigateToPage('page2')}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-between cursor-pointer text-left transition-all"
          >
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              <span>Trang 2: Đặc Quyền</span>
            </div>
            <ArrowRight size={13} className="text-zinc-500" />
          </button>

          <button
            onClick={() => onNavigateToPage('page3')}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-between cursor-pointer text-left transition-all"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Trang 3: Duyệt Tác Giả</span>
            </div>
            {pendingAuthorsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse font-mono">
                {pendingAuthorsCount} mới
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigateToPage('page4')}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-between cursor-pointer text-left transition-all"
          >
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-cyan-400" />
              <span>Trang 4: Nuôi Admin</span>
            </div>
            <ArrowRight size={13} className="text-zinc-500" />
          </button>

          <button
            onClick={() => onNavigateToPage('page5')}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-between cursor-pointer text-left transition-all col-span-2 sm:col-span-1 shadow-lg shadow-amber-500/5"
          >
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-amber-400 animate-pulse" />
              <span>Trang 5: Sửa Trang Chủ</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">Mới</span>
          </button>
        </div>
      </div>

      {/* 8 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Users */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Tổng Tài Khoản</span>
            <Users size={17} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{usersList.length || '---'}</p>
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{vipUsersCount} VIP</span> • {usersList.length - vipUsersCount} Free
          </p>
        </div>

        {/* Metric 2: Active VIPs */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Hội Viên VIP</span>
            <Crown size={17} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono">{vipUsersCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Lossless & X3 Điểm thưởng</p>
        </div>

        {/* Metric 3: Custom Audio Tracks */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Kho Nhạc Tác Giả</span>
            <Music size={17} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300 font-mono">{customTracks.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Đã kiểm duyệt chất lượng</p>
        </div>

        {/* Metric 4: Audio Coins Circulation */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Xu Audio Lưu Hành</span>
            <Coins size={17} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-300 font-mono">{totalCoinsInCirculation.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Điểm thưởng tích lũy</p>
        </div>

        {/* Metric 5: Author Verifications */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Hồ Sơ Tác Giả</span>
            <ShieldCheck size={17} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 font-mono">{authorVerifications.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">
            <span className="text-rose-400 font-bold">{pendingAuthorsCount} chờ duyệt</span> • {verifiedAuthorsCount} đã duyệt
          </p>
        </div>

        {/* Metric 6: Community Posts */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-pink-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Bài Đăng Thảo Luận</span>
            <MessageSquare size={17} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-pink-300 font-mono">{communityPosts.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Tương tác thảo luận sôi nổi</p>
        </div>

        {/* Metric 7: VIP Passes & Codes */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-yellow-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Mã VIP & Giới Thiệu</span>
            <KeyRound size={17} className="text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-yellow-300 font-mono">{anonymousPasses.length + referralCodes.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {anonymousPasses.length} Ẩn danh • {referralCodes.length} Giới thiệu
          </p>
        </div>

        {/* Metric 8: System Audit Logs */}
        <div className="bg-zinc-900/80 border border-zinc-800 hover:border-sky-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold">Nhật Ký Bảo Mật</span>
            <Activity size={17} className="text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-300 font-mono">{auditLogs.length}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Audit trail bất biến 24/7</p>
        </div>
      </div>

      {/* Ecosystem Mode Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ecosystem Modes Traffic */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Phân Bổ Hệ Sinh Thái Haevy (5 Chế Độ)</h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Đồng bộ đa nền tảng</span>
          </div>

          <div className="space-y-3">
            {/* Audio Mode */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Headphones size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Haevy Audio & Sách Nói</h4>
                  <p className="text-[11px] text-zinc-400">Âm thanh Hi-Fi Lossless 320kbps & Spatial 3D Master</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">99.8% Online</span>
            </div>

            {/* Messages Mode */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Haevy Messages & Bạn Bè</h4>
                  <p className="text-[11px] text-zinc-400">Tin nhắn thời gian thực, bảng tin chia sẻ ảnh & kết bạn</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Hoạt Động</span>
            </div>

            {/* Couple Mode */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Haevy Couple Romance</h4>
                  <p className="text-[11px] text-zinc-400">Đếm ngày yêu, Lovelock đính ước, trắc nghiệm & hộp thư âm thanh</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Hoạt Động</span>
            </div>

            {/* Finance Mode */}
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Wallet size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Haevy Finance & Quỹ Gia Đình</h4>
                  <p className="text-[11px] text-zinc-400">Sổ thu chi, quỹ chung đôi lứa, ngân sách 50/30/20 & tính lãi kép</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Hoạt Động</span>
            </div>

            {/* Games & Crowd 2X Mode */}
            <div 
              onClick={() => onNavigateToPage('page6')}
              className="bg-zinc-950 p-3 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Zap size={20} className="text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Haevy Games • ×2 Đám Đông
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold">MỚI</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">Đấu trường dự đoán 2 phương án A vs B, phe số đông ăn x2 Xu</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Trang 6 <ArrowRight size={13} />
              </span>
            </div>

            {/* Events & Live Shows Customizer */}
            <div 
              onClick={() => onNavigateToPage('page7')}
              className="bg-zinc-950 p-3 rounded-2xl border border-rose-500/30 hover:border-rose-500/60 transition-all flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Calendar size={20} className="text-rose-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Tùy Chỉnh Sự Kiện & Live Shows
                    <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 text-[9px] rounded font-bold">HOT</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">Thêm, sửa, ghim các sự kiện sắp diễn ra trên trang chủ & nhận quà</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Trang 7 <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Security Audit Activity Feed */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-sky-400" />
              <h3 className="text-sm font-bold text-white">Hoạt Động Gần Đây</h3>
            </div>
            <button
              onClick={() => onNavigateToPage('page2')}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Chưa có sự kiện kiểm toán nào được ghi nhận.
              </div>
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div 
                  key={log.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white truncate max-w-[170px]">{log.actionTitle}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {log.createdAt ? new Date(log.createdAt?.seconds ? log.createdAt.seconds * 1000 : log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{log.details}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-0.5">
                    <span className="text-amber-400 font-medium">Bởi: {log.actorName}</span>
                    <span>•</span>
                    <span className="uppercase font-mono text-[9px] px-1 py-0.2 bg-zinc-900 rounded text-zinc-400 border border-zinc-800">
                      {log.severity || 'info'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
