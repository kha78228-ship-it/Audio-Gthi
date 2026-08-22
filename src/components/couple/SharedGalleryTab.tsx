import React, { useState } from 'react';
import { 
  ImageIcon, 
  Music2, 
  Plus, 
  Play, 
  Trash2, 
  Disc3, 
  Maximize2, 
  X, 
  Calendar, 
  Heart, 
  Sparkles,
  MapPin,
  Upload,
  Camera
} from 'lucide-react';
import { Track, CoupleData, CoupleMemory } from '../../types';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface SharedGalleryTabProps {
  couple: CoupleData;
  userUid?: string;
  effectiveTracks: Track[];
  currentTrack?: Track | null;
  isPlaying?: boolean;
  onPlayTrack?: (track: Track) => void;
  onToggleSharedSong: (trackId: string) => Promise<void>;
  memories: CoupleMemory[];
  onCreateMemory: (title: string, photoUrl: string, date: string, location: string, desc: string) => Promise<void>;
  onDeleteMemory?: (memoryId: string) => Promise<void>;
}

export function SharedGalleryTab({
  couple,
  userUid,
  effectiveTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleSharedSong,
  memories,
  onCreateMemory,
  onDeleteMemory
}: SharedGalleryTabProps) {
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [songSearchQuery, setSongSearchQuery] = useState('');

  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDesc, setMemoryDesc] = useState('');
  const [memoryDate, setMemoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [memoryLocation, setMemoryLocation] = useState('');
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Photo Lightbox modal
  const [lightboxPhoto, setLightboxPhoto] = useState<CoupleMemory | null>(null);

  const sharedTracks = effectiveTracks.filter(t => couple.sharedSongIds?.includes(t.id));

  const handleCreateMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle.trim() || !memoryPhotoUrl.trim()) return;

    setSubmitting(true);
    try {
      await onCreateMemory(memoryTitle.trim(), memoryPhotoUrl.trim(), memoryDate, memoryLocation.trim(), memoryDesc.trim());
      setMemoryTitle('');
      setMemoryDesc('');
      setMemoryLocation('');
      setMemoryPhotoUrl('');
      setIsAddMemoryOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMemoryClick = async (e: React.MouseEvent, memoryId: string, title: string) => {
    e.stopPropagation();
    if (!onDeleteMemory) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa kỷ niệm "${title}" không?`)) {
      await onDeleteMemory(memoryId);
      if (lightboxPhoto?.id === memoryId) {
        setLightboxPhoto(null);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-300">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: BÀI HÁT CỦA CHÚNG MÌNH & VINYL PLAYER */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <Music2 size={18} className="text-rose-400 shrink-0" />
              <span>Giai Điệu & Bản Nhạc Kỷ Niệm</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Danh sách những bài hát gắn liền với tình yêu của hai bạn
            </p>
          </div>
          <button
            onClick={() => setIsAddSongOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Thêm Bài Hát Đôi</span>
          </button>
        </div>

        {/* Modal / Add Song from Library */}
        {isAddSongOpen && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-3 sm:space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Music2 size={15} className="text-rose-400 shrink-0" />
                <span>Chọn Bài Hát Thêm Vào Danh Sách Đôi</span>
              </h3>
              <button onClick={() => setIsAddSongOpen(false)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
            </div>

            <input
              type="text"
              value={songSearchQuery}
              onChange={(e) => setSongSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài hát theo tên hoặc ca sĩ..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
            />

            <div className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 scrollbar-thin">
              {effectiveTracks
                .filter(t => t.title.toLowerCase().includes(songSearchQuery.toLowerCase()) || t.artist.toLowerCase().includes(songSearchQuery.toLowerCase()))
                .slice(0, 10)
                .map(track => {
                  const isAdded = couple.sharedSongIds?.includes(track.id);
                  return (
                    <div key={track.id} className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={track.coverUrl} alt={track.title} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{track.title}</div>
                          <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{track.artist}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleSharedSong(track.id)}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isAdded 
                            ? 'bg-zinc-800 text-zinc-400 hover:text-rose-300' 
                            : 'bg-rose-500 hover:bg-rose-400 text-white'
                        }`}
                      >
                        {isAdded ? 'Đã Thêm ✓' : '+ Thêm'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Vinyl Player & Shared Songs Grid */}
        {sharedTracks.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-2.5">
            <Music2 size={22} className="text-rose-400 mx-auto" />
            <p className="text-xs text-zinc-400">Chưa có bài hát nào trong danh sách đôi. Bấm "Thêm Bài Hát Đôi" để lưu giữ giai điệu của hai bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {sharedTracks.map(track => {
              const isThisPlaying = isPlaying && currentTrack?.id === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => onPlayTrack?.(track)}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                    isThisPlaying 
                      ? 'bg-rose-500/20 border-rose-500/60 shadow-lg' 
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      {/* Spinning Vinyl overlay when playing */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`}>
                        {isThisPlaying ? (
                          <Disc3 size={18} className="text-rose-400 animate-spin" />
                        ) : (
                          <Play size={14} className="text-white fill-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{track.title}</div>
                      <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSharedSong(track.id);
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 cursor-pointer shrink-0"
                    title="Xóa khỏi danh sách đôi"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: BỘ SƯU TẬP ẢNH & DÒNG THỜI GIAN KỶ NIỆM */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-rose-400 shrink-0" />
              <h2 className="text-base sm:text-xl font-bold text-white">
                Album Kỷ Niệm & Thước Phim Tình Yêu
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                {memories.length} Bức ảnh
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Lưu giữ từng bức ảnh từ máy, chuyến đi và câu chuyện tình yêu theo dòng thời gian
            </p>
          </div>
          <button
            onClick={() => setIsAddMemoryOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Thêm Ảnh Kỷ Niệm</span>
          </button>
        </div>

        {/* Modal / Add Memory with Device Upload */}
        {isAddMemoryOpen && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon size={15} className="text-rose-400 shrink-0" />
                <span>Thêm Bức Ảnh Kỷ Niệm Mới Từ Thiết Bị</span>
              </h3>
              <button onClick={() => setIsAddMemoryOpen(false)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
            </div>

            <form onSubmit={handleCreateMemorySubmit} className="space-y-4">
              {/* Local Device Image Picker */}
              <ImageUploadPicker
                value={memoryPhotoUrl}
                onChange={setMemoryPhotoUrl}
                label="Chọn Bức Ảnh Tình Yêu (Từ máy hoặc kéo thả)"
                helperText="Chọn ảnh chụp chung, đi chơi, kỷ niệm của hai bạn"
                aspectRatio="auto"
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tiêu đề khoảnh khắc *</label>
                <input
                  type="text"
                  value={memoryTitle}
                  onChange={(e) => setMemoryTitle(e.target.value)}
                  placeholder="VD: Chuyến du lịch Đà Lạt đầu tiên cùng em..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày diễn ra *</label>
                  <input
                    type="date"
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Địa điểm</label>
                  <input
                    type="text"
                    value={memoryLocation}
                    onChange={(e) => setMemoryLocation(e.target.value)}
                    placeholder="VD: Đà Lạt, Phố Cổ Hội An, Quán Cà Phê..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nhật ký kỷ niệm & Cảm xúc</label>
                <textarea
                  value={memoryDesc}
                  onChange={(e) => setMemoryDesc(e.target.value)}
                  placeholder="Viết vài dòng cảm xúc ngọt ngào về khoảnh khắc này..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemoryOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || !memoryTitle.trim() || !memoryPhotoUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Lưu Vào Album Đôi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Memories Gallery Grid */}
        {memories.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ImageIcon size={20} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">Chưa có hình ảnh kỷ niệm nào</p>
            <p className="text-[11px] sm:text-xs text-zinc-400 max-w-md mx-auto">
              Hãy tải lên bức ảnh ngọt ngào đầu tiên từ thiết bị để lưu giữ câu chuyện tình yêu của hai bạn!
            </p>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              + Tải ảnh từ máy lên ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {memories.map(mem => (
              <div 
                key={mem.id}
                onClick={() => setLightboxPhoto(mem)}
                className="group rounded-2xl sm:rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl hover:border-rose-500/40 transition-all flex flex-col justify-between cursor-pointer relative"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                  <img 
                    src={mem.photoUrl} 
                    alt={mem.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-white">
                    📅 {mem.date}
                  </div>
                  
                  {/* Delete button on top left */}
                  {onDeleteMemory && (
                    <button
                      onClick={(e) => handleDeleteMemoryClick(e, mem.id, mem.title)}
                      className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3 sm:p-4">
                    <span className="text-xs text-white font-bold flex items-center gap-1.5">
                      <Maximize2 size={13} />
                      <span>Xem toàn màn hình</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {mem.title}
                  </h3>
                  {mem.location && (
                    <div className="text-[11px] sm:text-xs text-rose-400 font-medium flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{mem.location}</span>
                    </div>
                  )}
                  {mem.description && (
                    <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-2">{mem.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
              {onDeleteMemory && (
                <button
                  onClick={(e) => handleDeleteMemoryClick(e, lightboxPhoto.id, lightboxPhoto.title)}
                  className="p-1.5 sm:p-2 rounded-full bg-black/70 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                  title="Xóa kỷ niệm này"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1.5 sm:p-2 rounded-full bg-black/70 text-white hover:bg-black/90 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[55vh] sm:max-h-[70vh] overflow-hidden flex items-center justify-center bg-black">
              <img 
                src={lightboxPhoto.photoUrl} 
                alt={lightboxPhoto.title} 
                className="max-h-[55vh] sm:max-h-[70vh] w-auto object-contain" 
              />
            </div>

            <div className="p-4 sm:p-6 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400">
                <span>📅 {lightboxPhoto.date}</span>
                {lightboxPhoto.location && <span>📍 {lightboxPhoto.location}</span>}
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white">{lightboxPhoto.title}</h3>
              {lightboxPhoto.description && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{lightboxPhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
