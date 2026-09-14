import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Plus, 
  Play, 
  Eye, 
  Heart, 
  X, 
  Share2, 
  Download, 
  Sparkles, 
  Calendar,
  Check,
  Film
} from 'lucide-react';
import { ProfileMediaItem } from './types';

interface ProfileMediaGalleryTabProps {
  user: any;
}

const DEFAULT_MEDIA_ITEMS: ProfileMediaItem[] = [
  {
    id: 'media_1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    title: 'Rừng Thông & Cực Quang Bắc Âu',
    caption: 'Khoảnh khắc tĩnh lặng giữa màn đêm ngập tràn ánh sáng thiên nhiên kỳ diệu.',
    likesCount: 142,
    viewsCount: 1250,
    createdAt: '3 ngày trước'
  },
  {
    id: 'media_2',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    title: 'Sóng Biển Chiều Hoàng Hôn 4K',
    caption: 'Tiếng sóng vỗ bờ êm dịu kết hợp cùng tần số âm thanh 432Hz chữa lành.',
    duration: '01:45',
    likesCount: 210,
    viewsCount: 3400,
    createdAt: '5 ngày trước'
  },
  {
    id: 'media_3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    title: 'Studio Âm Thanh Lo-Fi Haevy',
    caption: 'Góc thu âm mộc mạc lưu giữ những thanh âm cảm xúc nhất.',
    likesCount: 89,
    viewsCount: 980,
    createdAt: '1 tuần trước'
  },
  {
    id: 'media_4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    title: 'Hành Trình Tinh Vân Vũ Trụ',
    caption: 'Hình ảnh thiên văn sắc nét ghi lại dải tinh vân màu tím huyền bí.',
    likesCount: 312,
    viewsCount: 4200,
    createdAt: '2 tuần trước'
  },
  {
    id: 'media_5',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    title: 'Suối Rừng Nắng Sớm Tĩnh Tâm',
    caption: 'Video phong cảnh thiền định kèm âm thanh róc rách trong trẻo.',
    duration: '02:20',
    likesCount: 175,
    viewsCount: 2100,
    createdAt: '3 tuần trước'
  },
  {
    id: 'media_6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    title: 'Nghệ Thuật Lụa Vàng Trừu Tượng',
    caption: 'Đường nét uốn lượn phong cách sang trọng và thanh lịch.',
    likesCount: 96,
    viewsCount: 1100,
    createdAt: '1 tháng trước'
  }
];

export function ProfileMediaGalleryTab({ user }: ProfileMediaGalleryTabProps) {
  const storageKey = `haevy_profile_media_${user?.uid || 'guest'}`;

  const [mediaList, setMediaList] = useState<ProfileMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_MEDIA_ITEMS;
  });

  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<ProfileMediaItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadDuration, setUploadDuration] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(mediaList));
    } catch (e) {
      console.warn(e);
    }
  }, [mediaList, storageKey]);

  const filteredMedia = mediaList.filter(item => {
    if (activeTypeFilter === 'all') return true;
    return item.type === activeTypeFilter;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadTitle.trim()) return;

    const newItem: ProfileMediaItem = {
      id: `media_${Date.now()}`,
      type: uploadType,
      url: uploadUrl.trim(),
      thumbnailUrl: uploadUrl.trim(),
      title: uploadTitle.trim(),
      caption: uploadCaption.trim() || undefined,
      duration: uploadType === 'video' ? (uploadDuration.trim() || '01:30') : undefined,
      likesCount: 0,
      viewsCount: 1,
      createdAt: 'Vừa xong'
    };

    setMediaList([newItem, ...mediaList]);
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setUploadCaption('');
    setUploadUrl('');
    setUploadDuration('');
  };

  const imagesCount = mediaList.filter(m => m.type === 'image').length;
  const videosCount = mediaList.filter(m => m.type === 'video').length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & FILTER BAR                                                */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Film className="text-amber-400" size={20} />
              <span>Kho Tổng Hợp Ảnh & Video Đã Đăng</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Toàn bộ phương tiện thị giác, khoảnh khắc và video do bạn đăng tải lên trang cá nhân
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Tải ảnh / video mới</span>
          </button>
        </div>

        {/* Filter subtabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTypeFilter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Tất cả ({mediaList.length})
          </button>

          <button
            onClick={() => setActiveTypeFilter('image')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTypeFilter === 'image'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ImageIcon size={13} />
            <span>Hình ảnh ({imagesCount})</span>
          </button>

          <button
            onClick={() => setActiveTypeFilter('video')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTypeFilter === 'video'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Video size={13} />
            <span>Video ({videosCount})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MEDIA GRID GALLERY                                                     */}
      {/* ========================================================================= */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-xs space-y-2">
          <ImageIcon size={32} className="mx-auto text-zinc-600" />
          <p className="font-bold text-zinc-400">Kho phương tiện đang trống</p>
          <p>Nhấn nút "Tải ảnh / video mới" để lưu trữ bộ sưu tập của bạn!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square bg-zinc-950 border border-zinc-800 hover:border-amber-400/60 shadow-xl cursor-pointer transition-all hover:scale-102 hover:shadow-2xl"
            >
              {/* Thumbnail */}
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />

              {/* Type Badge top left */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
                {item.type === 'video' ? (
                  <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-purple-500/50 text-purple-300 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Video size={11} />
                    <span>{item.duration || 'VIDEO'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <ImageIcon size={11} className="text-amber-400" />
                    <span>ẢNH HD</span>
                  </span>
                )}
              </div>

              {/* Play icon overlay for videos */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-115 transition-transform shadow-xl">
                    <Play size={18} fill="currentColor" className="ml-0.5 text-amber-400" />
                  </div>
                </div>
              )}

              {/* Hover Dark Overlay with Title & Stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-end text-white z-20">
                <p className="text-xs font-bold truncate drop-shadow-md">{item.title}</p>
                {item.caption && (
                  <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5 drop-shadow">
                    {item.caption}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-white/15 mt-2">
                  <span className="flex items-center gap-1 text-rose-300">
                    <Heart size={11} fill="currentColor" />
                    {item.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Eye size={11} />
                    {item.viewsCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIGHTBOX PREVIEW MODAL                                                 */}
      {/* ========================================================================= */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                {selectedMedia.type === 'video' ? (
                  <Video size={18} className="text-purple-400 shrink-0" />
                ) : (
                  <ImageIcon size={18} className="text-amber-400 shrink-0" />
                )}
                <h4 className="text-sm sm:text-base font-bold truncate">{selectedMedia.title}</h4>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Media Viewer Body */}
            <div className="flex-1 overflow-y-auto bg-black flex items-center justify-center p-2 sm:p-4 min-h-[300px]">
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] max-w-full rounded-2xl shadow-2xl border border-zinc-800"
                >
                  Trình duyệt không hỗ trợ phát video này.
                </video>
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Modal Footer Metadata & Actions */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
              <div className="space-y-1">
                {selectedMedia.caption && (
                  <p className="text-zinc-200">{selectedMedia.caption}</p>
                )}
                <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                  <span>Đăng ngày: {selectedMedia.createdAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart size={12} fill="currentColor" /> {selectedMedia.likesCount} lượt thích
                  </span>
                  <span>•</span>
                  <span>{selectedMedia.viewsCount} lượt xem</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Tải về</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: UPLOAD NEW IMAGE OR VIDEO                                       */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleAddMedia}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-amber-400" />
                <h4 className="font-bold text-base">Thêm Ảnh / Video Vào Kho Phương Tiện</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type selector: Image vs Video */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadType('image')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadType === 'image'
                    ? 'bg-amber-500 text-black font-extrabold shadow-md'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }`}
              >
                <ImageIcon size={14} />
                <span>Hình Ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadType('video')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadType === 'video'
                    ? 'bg-purple-500 text-white font-extrabold shadow-md shadow-purple-500/30'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }`}
              >
                <Video size={14} />
                <span>Video Clip</span>
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Tiêu đề phương tiện</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="VD: Hoàng hôn trên biển Tây Hồ..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* URL or Upload */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Đường dẫn tệp (URL) hoặc tải lên</label>
              <input
                type="text"
                required
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://... ảnh hoặc video"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="relative">
              <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500 bg-zinc-950 flex items-center justify-center gap-2 cursor-pointer text-xs text-zinc-300 font-medium">
                <Upload size={14} className="text-amber-400" />
                <span>Chọn tệp từ máy của bạn</span>
                <input
                  type="file"
                  accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadType === 'video' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Thời lượng video (ví dụ: 01:45)</label>
                <input
                  type="text"
                  value={uploadDuration}
                  onChange={(e) => setUploadDuration(e.target.value)}
                  placeholder="02:15"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Caption */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Mô tả / Chú thích (tùy chọn)</label>
              <textarea
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={2}
                placeholder="Cảm xúc hoặc thông điệp về bức ảnh/video..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!uploadUrl.trim() || !uploadTitle.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-40 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Thêm vào kho
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
