import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Award, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Mail, 
  Phone, 
  CreditCard, 
  Camera, 
  Trash2, 
  Sparkles, 
  Filter, 
  Search,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthorVerification, Track } from '../../types';

interface AdminPage3AuthorsProps {
  authorVerifications: AuthorVerification[];
  customTracks: Track[];
  onRefreshData?: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export function AdminPage3Authors({
  authorVerifications,
  customTracks,
  onRefreshData,
  showToast
}: AdminPage3AuthorsProps) {
  const { 
    approveAuthorVerification, 
    rejectAuthorVerification, 
    revokeAuthorStatus,
    deleteAudioTrackByAdmin,
    toggleTrackVipStatusByAdmin
  } = useAuth();

  const [activeAuthorTab, setActiveAuthorTab] = useState<'ekyc_queue' | 'verified_authors' | 'custom_tracks'>('ekyc_queue');
  const [authorFilter, setAuthorFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [authorSearch, setAuthorSearch] = useState('');
  const [selectedVerifDetail, setSelectedVerifDetail] = useState<AuthorVerification | null>(null);
  const [rejectingVerif, setRejectingVerif] = useState<AuthorVerification | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [inspectImageUrl, setInspectImageUrl] = useState<string | null>(null);

  // Audio preview player
  const [trackPlayingId, setTrackPlayingId] = useState<string | null>(null);
  const [audioPlayerEl, setAudioPlayerEl] = useState<HTMLAudioElement | null>(null);

  const pendingCount = authorVerifications.filter(a => a.status === 'pending').length;
  const verifiedCount = authorVerifications.filter(a => a.status === 'verified').length;

  const handleTogglePlay = (track: Track) => {
    if (trackPlayingId === track.id) {
      if (audioPlayerEl) {
        audioPlayerEl.pause();
        setTrackPlayingId(null);
      }
    } else {
      if (audioPlayerEl) {
        audioPlayerEl.pause();
      }
      const audio = new Audio(track.url);
      audio.play();
      audio.onended = () => setTrackPlayingId(null);
      setAudioPlayerEl(audio);
      setTrackPlayingId(track.id);
    }
  };

  const handleApprove = async (verif: AuthorVerification) => {
    const res = await approveAuthorVerification(verif.id, verif.userId, verif.stageName);
    if (res.success) {
      showToast(res.message);
      setSelectedVerifDetail(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingVerif) return;
    const res = await rejectAuthorVerification(rejectingVerif.id, rejectingVerif.userId, rejectReasonInput);
    if (res.success) {
      showToast(res.message);
      setRejectingVerif(null);
      setRejectReasonInput('');
      setSelectedVerifDetail(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi danh hiệu Tác Giả của tài khoản này?')) return;
    const res = await revokeAuthorStatus(userId);
    if (res.success) {
      showToast(res.message);
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredVerifications = authorVerifications.filter((v) => {
    const matchesFilter = authorFilter === 'all' || v.status === authorFilter;
    const matchesSearch = !authorSearch || 
      v.fullName.toLowerCase().includes(authorSearch.toLowerCase()) ||
      v.stageName.toLowerCase().includes(authorSearch.toLowerCase()) ||
      v.email.toLowerCase().includes(authorSearch.toLowerCase()) ||
      v.phoneNumber.includes(authorSearch) ||
      v.idCardNumber.includes(authorSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              Trang 3 • Author Verification & Content Studio
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Xét Duyệt Tác Giả & Kiểm Duyệt Tác Phẩm Audio</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Thẩm định căn cước CCCD 12 số, đối chiếu khuôn mặt KYC, cấp tích xanh nghệ sĩ và quản lý nhạc độc quyền.
            </p>
          </div>
        </div>

        {/* Tab Switcher: eKYC Queue vs Verified Authors vs Tracks */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveAuthorTab('ekyc_queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAuthorTab === 'ekyc_queue'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Duyệt eKYC</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAuthorTab('verified_authors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAuthorTab === 'verified_authors'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>Nghệ Sĩ Đã Duyệt ({verifiedCount})</span>
          </button>

          <button
            onClick={() => setActiveAuthorTab('custom_tracks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAuthorTab === 'custom_tracks'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music size={14} />
            <span>Kho Nhạc Tác Giả ({customTracks.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: eKYC Verification Queue */}
      {activeAuthorTab === 'ekyc_queue' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter & Search Toolbar */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                placeholder="Tìm tên thật, bút danh, CCCD, Email, SĐT..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'pending', 'verified', 'rejected'] as const).map((filterType) => {
                const count = filterType === 'all' 
                  ? authorVerifications.length 
                  : authorVerifications.filter(a => a.status === filterType).length;
                const labels: Record<string, string> = {
                  all: 'Tất cả',
                  pending: 'Chờ duyệt',
                  verified: 'Đã duyệt',
                  rejected: 'Từ chối'
                };

                return (
                  <button
                    key={filterType}
                    onClick={() => setAuthorFilter(filterType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      authorFilter === filterType
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <span>{labels[filterType]}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-black/20">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards of Verifications */}
          <div className="space-y-4">
            {filteredVerifications.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
                Không tìm thấy hồ sơ tác giả nào phù hợp.
              </div>
            ) : (
              filteredVerifications.map((verif) => (
                <div
                  key={verif.id}
                  className={`p-5 rounded-3xl border transition-all shadow-xl space-y-4 ${
                    verif.status === 'pending'
                      ? 'bg-zinc-900/90 border-amber-500/40 hover:border-amber-500'
                      : verif.status === 'verified'
                      ? 'bg-zinc-900/70 border-emerald-500/30'
                      : 'bg-zinc-900/40 border-zinc-800 opacity-75'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Author Identity & Avatar */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        {verif.facePhotoUrl ? (
                          <img
                            src={verif.facePhotoUrl}
                            alt="Face KYC"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/60 shadow-md cursor-pointer hover:opacity-80"
                            onClick={() => setInspectImageUrl(verif.facePhotoUrl)}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                            <Camera size={24} />
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase font-mono ${
                          verif.status === 'pending'
                            ? 'bg-amber-500 text-black animate-pulse'
                            : verif.status === 'verified'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {verif.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-white">{verif.stageName}</h3>
                          <span className="text-xs text-zinc-400">({verif.fullName})</span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-bold text-[10px] border border-zinc-700">
                            {verif.musicGenre}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-zinc-500" />
                            {verif.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-zinc-500" />
                            {verif.phoneNumber}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-amber-300/90">
                            <CreditCard size={12} className="text-amber-500" />
                            CCCD: {verif.idCardNumber} (Cấp: {verif.idCardIssueDate})
                          </span>
                        </div>

                        {verif.bio && (
                          <p className="text-xs text-zinc-300 mt-1 line-clamp-2 italic bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                            "{verif.bio}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* eKYC Documents Thumbnails & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                      {/* CCCD Photos preview */}
                      <div className="flex items-center gap-2">
                        {verif.idCardFrontUrl && (
                          <div 
                            onClick={() => setInspectImageUrl(verif.idCardFrontUrl)}
                            className="cursor-pointer group relative"
                            title="Xem CCCD mặt trước"
                          >
                            <img
                              src={verif.idCardFrontUrl}
                              alt="CCCD trước"
                              className="w-16 h-11 rounded-xl object-cover border border-zinc-700 group-hover:border-amber-500 transition-all"
                            />
                            <span className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                              Trước
                            </span>
                          </div>
                        )}

                        {verif.idCardBackUrl && (
                          <div 
                            onClick={() => setInspectImageUrl(verif.idCardBackUrl)}
                            className="cursor-pointer group relative"
                            title="Xem CCCD mặt sau"
                          >
                            <img
                              src={verif.idCardBackUrl}
                              alt="CCCD sau"
                              className="w-16 h-11 rounded-xl object-cover border border-zinc-700 group-hover:border-amber-500 transition-all"
                            />
                            <span className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                              Sau
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Approval Actions */}
                      {verif.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(verif)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                            <span>Duyệt eKYC</span>
                          </button>
                          <button
                            onClick={() => setRejectingVerif(verif)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <X size={15} />
                            <span>Từ Chối</span>
                          </button>
                        </div>
                      ) : verif.status === 'verified' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            <CheckCircle2 size={14} />
                            Đã Cấp Tích Xanh
                          </span>
                          <button
                            onClick={() => handleRevoke(verif.userId)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-950 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-zinc-800 text-xs font-bold transition-all cursor-pointer"
                          >
                            Thu Hồi
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30">
                          <AlertCircle size={14} />
                          Đã Từ Chối
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: Verified Artists List */}
      {activeAuthorTab === 'verified_authors' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorVerifications
              .filter((v) => v.status === 'verified')
              .map((verif) => (
                <div key={verif.id} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={verif.facePhotoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                      alt="Artist Face"
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-500/60 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-white">{verif.stageName}</h4>
                        <Award size={14} className="text-amber-400 fill-amber-400" />
                      </div>
                      <p className="text-xs text-zinc-400">{verif.fullName}</p>
                      <span className="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                        {verif.musicGenre}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 italic">
                    "{verif.bio || 'Tác giả chính thức của hệ thống Haevy.'}"
                  </p>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono">UID: {verif.userId.slice(0, 8)}...</span>
                    <button
                      onClick={() => handleRevoke(verif.userId)}
                      className="text-rose-400 hover:text-rose-300 font-bold text-[11px] cursor-pointer"
                    >
                      Thu Hồi Danh Hiệu
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Custom Tracks Moderation */}
      {activeAuthorTab === 'custom_tracks' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-2">
            {customTracks.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
                Chưa có bài hát nào được đăng tải bởi tác giả.
              </div>
            ) : (
              customTracks.map((track) => (
                <div 
                  key={track.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{track.title}</h4>
                        {track.isVipOnly && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Crown size={10} /> VIP Only
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {track.bitrate || '320kbps'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{track.artist} • Thể loại: {track.genre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePlay(track)}
                      className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black transition-all cursor-pointer"
                      title={trackPlayingId === track.id ? 'Dừng phát' : 'Nghe thử'}
                    >
                      {trackPlayingId === track.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <button
                      onClick={() => toggleTrackVipStatusByAdmin(track.id, Boolean(track.isVipOnly))}
                      className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-zinc-300 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      {track.isVipOnly ? 'Mở Miễn Phí' : 'Khóa VIP Only'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa bài hát "${track.title}"?`)) {
                          deleteAudioTrackByAdmin(track.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      title="Xóa bài hát"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inspect Image Modal */}
      {inspectImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl p-3 overflow-hidden">
            <button
              onClick={() => setInspectImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10 cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={inspectImageUrl}
              alt="Inspect Document"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl mx-auto"
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVerif && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400" />
              <span>Từ Chối Xác Minh Tác Giả</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Vui lòng nhập lý do từ chối để thông báo cho người dùng (<strong className="text-white">{rejectingVerif.fullName}</strong>):
            </p>

            <textarea
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="VD: Ảnh CCCD bị mờ, không khớp khuôn mặt, hoặc thông tin chưa chính xác..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 min-h-[100px]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingVerif(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
