import React, { useState } from 'react';
import { X, Music2, Image as ImageIcon, User, Tag, Link2, Plus, Loader2, AlertCircle, Sparkles, Crown } from 'lucide-react';
import { GENRE_LIST } from '../data';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackUploaded?: () => void;
}

const PRESET_AUDIO_STREAMS = [
  {
    title: 'Cyber Synthwave Drive',
    artist: 'RetroFuture Lab',
    genre: 'Electronic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    isVipOnly: false,
  },
  {
    title: 'Coffee & Rainy Afternoon',
    artist: 'Misty Lofi Study',
    genre: 'Lo-Fi Chill',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isVipOnly: false,
  },
  {
    title: 'Campfire Acoustic Night',
    artist: 'Pine Wood Guitar',
    genre: 'Acoustic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=400&q=80',
    isVipOnly: true,
  }
];

export function UploadTrackModal({ isOpen, onClose, onTrackUploaded }: UploadTrackModalProps) {
  const { user, addAudioPoints, isVip } = useAuth();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState<string>('Lo-Fi Chill');
  const [url, setUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập trước khi đóng góp audio.');
      return;
    }
    if (!title.trim() || !artist.trim() || !url.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề, nghệ sĩ và đường dẫn audio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fallbackCover = coverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
      await addDoc(collection(db, 'customTracks'), {
        title: title.trim(),
        artist: artist.trim(),
        genre: genre || 'Khác',
        url: url.trim(),
        coverUrl: fallbackCover,
        isVipOnly: isVipOnly,
        addedBy: user.uid,
        addedByName: user.displayName || user.email?.split('@')[0] || 'Thành viên AudioHub',
        durationSec: 210,
        plays: 1,
        createdAt: serverTimestamp(),
      });

      // Award +100 points for contributing audio
      await addAudioPoints(100, `Đóng góp bài hát: ${title.trim()}`, 'upload');

      // Reset
      setTitle('');
      setArtist('');
      setUrl('');
      setCoverUrl('');
      setIsVipOnly(false);
      if (onTrackUploaded) onTrackUploaded();
      onClose();
    } catch (err: any) {
      console.error('Error adding track:', err);
      setError('Không thể thêm bài hát. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_AUDIO_STREAMS[0]) => {
    setTitle(preset.title);
    setArtist(preset.artist);
    setGenre(preset.genre);
    setUrl(preset.url);
    setCoverUrl(preset.coverUrl);
    setIsVipOnly(preset.isVipOnly);
  };

  return (
    <div 
      id="upload-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="upload-modal-container"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2.5 text-white mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Đóng góp Audio mới</h2>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Thêm bài hát để chia sẻ vào kho audio chung và nhận ngay <strong className="text-amber-400">+100 Điểm Audio</strong>.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mb-5 p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-300">
            <Sparkles size={14} className="text-amber-400" />
            <span>Gợi ý nhanh (Preset demo)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_AUDIO_STREAMS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors border border-zinc-700/50"
              >
                + {p.title} {p.isVipOnly ? '(VIP)' : ''}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Tên bài hát / Tiêu đề Audio *
            </label>
            <div className="relative">
              <Music2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="VD: Midnight Melancholy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Tên Nghệ sĩ / Tác giả *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="VD: Minh & The Band"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Thể loại
              </label>
              <div className="relative">
                <Tag size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-zinc-500 text-sm appearance-none cursor-pointer"
                >
                  {GENRE_LIST.filter(g => g !== 'Tất cả').map((g) => (
                    <option key={g} value={g} className="bg-zinc-900 text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Ảnh bìa URL (Tùy chọn)
              </label>
              <div className="relative">
                <ImageIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Đường dẫn Audio (MP3 / Stream URL) *
            </label>
            <div className="relative">
              <Link2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="url"
                required
                placeholder="https://example.com/audio.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
              />
            </div>
          </div>

          {/* VIP Exclusive Checkbox */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crown size={18} className="text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Chỉ dành cho thành viên VIP</p>
                <p className="text-[11px] text-zinc-400">Giới hạn đặc quyền cho tài khoản VIP nghe và tải</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isVipOnly}
              onChange={(e) => setIsVipOnly(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Thêm vào kho (+100 pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
