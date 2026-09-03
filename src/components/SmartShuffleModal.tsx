import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Compass, 
  TrendingUp, 
  Heart, 
  Disc3, 
  X, 
  Play, 
  Check, 
  RotateCcw, 
  Headphones, 
  HelpCircle,
  Flame,
  Activity
} from 'lucide-react';
import { Track } from '../types';
import { 
  ShuffleMode, 
  RepeatMode, 
  UserAffinityProfile, 
  SmartTrackRecommendation,
  getStoredAffinityProfile, 
  generateSmartUpcomingQueue, 
  resetAffinityProfile,
  saveShuffleMode,
  saveRepeatMode
} from '../services/smartShuffleService';
import { useAuth } from '../context/AuthContext';

interface SmartShuffleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Track[];
  currentTrack: Track | null;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  onSetShuffleMode: (mode: ShuffleMode) => void;
  onSetRepeatMode: (mode: RepeatMode) => void;
  onSelectTrack: (track: Track) => void;
  recentHistoryIds?: string[];
}

export function SmartShuffleModal({
  isOpen,
  onClose,
  playlist,
  currentTrack,
  shuffleMode,
  repeatMode,
  onSetShuffleMode,
  onSetRepeatMode,
  onSelectTrack,
  recentHistoryIds = []
}: SmartShuffleModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserAffinityProfile>(getStoredAffinityProfile());
  const [smartQueue, setSmartQueue] = useState<SmartTrackRecommendation[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'insights'>('queue');

  // Refresh data whenever modal opens or currentTrack changes
  useEffect(() => {
    if (isOpen) {
      const currentProfile = getStoredAffinityProfile();
      setProfile(currentProfile);
      const queue = generateSmartUpcomingQueue(playlist, currentTrack, recentHistoryIds, 10);
      setSmartQueue(queue);
    }
  }, [isOpen, currentTrack, playlist, recentHistoryIds]);

  if (!isOpen) return null;

  const handleResetAffinity = () => {
    resetAffinityProfile(user?.uid);
    const refreshed = getStoredAffinityProfile();
    setProfile(refreshed);
    setSmartQueue(generateSmartUpcomingQueue(playlist, currentTrack, recentHistoryIds, 10));
    setShowResetConfirm(false);
  };

  const formatListeningTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} giờ`;
  };

  return (
    <div 
      id="smart-shuffle-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="smart-shuffle-modal-content"
        className="relative w-full max-w-2xl bg-zinc-950 border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/40 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Sparkles size={22} className="text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Smart Shuffle AI & Thấu Cảm Gu
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-extrabold text-purple-300">
                  AI Algorithmic
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tự động tối ưu thứ tự phát theo tương tác, thể loại yêu thích và tần suất nghe.
              </p>
            </div>
          </div>

          <button 
            id="close-smart-shuffle-modal-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Shuffle Mode Selector Buttons */}
        <div className="mt-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              id="mode-smart-shuffle-btn"
              onClick={() => {
                onSetShuffleMode('smart_shuffle');
                saveShuffleMode('smart_shuffle');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                shuffleMode === 'smart_shuffle'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-900/50'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <Sparkles size={14} className={shuffleMode === 'smart_shuffle' ? 'text-amber-300' : 'text-purple-400'} />
              <span>✨ Smart Shuffle (AI)</span>
            </button>

            <button
              id="mode-normal-shuffle-btn"
              onClick={() => {
                onSetShuffleMode('shuffle');
                saveShuffleMode('shuffle');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                shuffleMode === 'shuffle'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <Shuffle size={14} />
              <span>Ngẫu Nhiên</span>
            </button>

            <button
              id="mode-off-shuffle-btn"
              onClick={() => {
                onSetShuffleMode('off');
                saveShuffleMode('off');
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                shuffleMode === 'off'
                  ? 'bg-zinc-200 text-black border-white shadow-sm'
                  : 'bg-zinc-950 text-zinc-500 hover:text-white border-zinc-800'
              }`}
            >
              <span>Tuần Tự</span>
            </button>
          </div>

          {/* Repeat Mode Quick Toggle */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-zinc-400 font-semibold mr-1">Lặp lại:</span>
            <button
              id="repeat-mode-all-btn"
              onClick={() => {
                const next: RepeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                onSetRepeatMode(next);
                saveRepeatMode(next);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                repeatMode === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : repeatMode === 'one'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white'
              }`}
              title="Chuyển chế độ lặp lại"
            >
              {repeatMode === 'one' ? (
                <>
                  <Repeat1 size={14} className="text-amber-400" />
                  <span>Lặp 1 bài</span>
                </>
              ) : repeatMode === 'all' ? (
                <>
                  <Repeat size={14} className="text-emerald-400" />
                  <span>Lặp toàn bộ</span>
                </>
              ) : (
                <>
                  <Repeat size={14} className="opacity-50" />
                  <span>Tắt lặp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Hàng Đợi Thông Minh vs Phân Tích Gu Âm Nhạc */}
        <div className="flex items-center gap-2 mt-4 border-b border-zinc-800/80 pb-2 relative z-10">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Hàng Đợi Smart Shuffle ({smartQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Phân Tích Gu Âm Nhạc Của Bạn</span>
          </button>
        </div>

        {/* Tab 1: Smart Queue */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-2.5 custom-scrollbar relative z-10">
            {smartQueue.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <Disc3 size={32} className="mx-auto mb-2 opacity-40 animate-spin" />
                <p className="text-sm font-medium">Chưa có đủ dữ liệu để xếp hàng đợi Smart Shuffle.</p>
              </div>
            ) : (
              smartQueue.map((item, idx) => {
                const isTop1 = idx === 0;
                return (
                  <div
                    key={item.track.id}
                    onClick={() => {
                      onSelectTrack(item.track);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isTop1
                        ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border-purple-500/40 hover:border-purple-400'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        {item.track.coverUrl ? (
                          <img
                            src={item.track.coverUrl}
                            alt={item.track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Headphones size={18} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                            {item.track.title}
                          </span>
                          {item.badges.slice(0, 2).map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.track.artist} {item.track.genre ? `• ${item.track.genre}` : ''}
                        </p>
                        <p className="text-[10px] text-zinc-500 italic truncate mt-0.5 flex items-center gap-1">
                          <Sparkles size={10} className="text-amber-400 shrink-0" />
                          <span>{item.reason}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-mono text-purple-300 font-bold block">
                          Độ ưu tiên {item.affinityScore}đ
                        </span>
                        <span className="text-[9px] text-zinc-500">
                          {isTop1 ? 'Ưu tiên phát tiếp' : `#${idx + 1}`}
                        </span>
                      </div>
                      <button
                        className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white transition-all"
                        title="Phát ngay bài này"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Listening Insights & Top Genres Breakdown */}
        {activeTab === 'insights' && (
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4 custom-scrollbar relative z-10">
            {/* Listening Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-semibold block">Lượt nghe bài</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {profile.totalListenedTracks} bài
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-emerald-400 font-semibold block">Nghe trọn vẹn</span>
                <span className="text-lg font-black text-emerald-300 mt-1 block">
                  {profile.totalCompletedTracks} bài
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-indigo-400 font-semibold block">Thời lượng nghe</span>
                <span className="text-lg font-black text-indigo-300 mt-1 block">
                  {formatListeningTime(profile.totalListeningTimeSec)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-rose-400 font-semibold block">Bỏ qua nhanh</span>
                <span className="text-lg font-black text-rose-300 mt-1 block">
                  {profile.totalSkippedTracks} bài
                </span>
              </div>
            </div>

            {/* Top Genres Affinity Progression */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>Xếp Hạng Thể Loại Yêu Thích Của Bạn (Genre Affinity)</span>
                </h4>
                <span className="text-[10px] text-purple-300 font-bold">Học máy liên tục</span>
              </div>

              {profile.topGenres.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center">
                  Hãy nghe vài bài hát để hệ thống nhận diện gu âm nhạc của bạn!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {profile.topGenres.map((g, idx) => (
                    <div key={g.genre} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-200 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-mono font-black">
                            {idx + 1}
                          </span>
                          <span>{g.genre}</span>
                        </span>
                        <span className="text-purple-300 font-mono font-black text-xs">
                          {g.score}% ({g.percentage}% tổng lượt)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${g.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset / Recalibrate Preferences Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Dữ liệu gu âm nhạc được cập nhật tự động theo thời gian thực.
              </span>

              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Đặt lại dữ liệu?</span>
                  <button
                    onClick={handleResetAffinity}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Hiệu chỉnh lại từ đầu</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Activity size={13} className="text-emerald-400 animate-pulse" />
            <span>
              {shuffleMode === 'smart_shuffle'
                ? 'Đang bật Smart Shuffle AI (Ưu tiên thể loại & tương tác)'
                : shuffleMode === 'shuffle'
                ? 'Đang bật Ngẫu Nhiên thường'
                : 'Đang phát tuần tự theo danh sách'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
