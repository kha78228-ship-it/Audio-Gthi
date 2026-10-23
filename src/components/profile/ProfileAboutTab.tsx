import React, { useState } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Heart, 
  Music, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Coins, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Check, 
  Sparkles,
  ExternalLink,
  Award,
  Eye,
  EyeOff,
  Copy,
  Lock
} from 'lucide-react';
import { UserProfileData } from './types';
import { maskEmail, maskAccountId, maskPoints, maskText } from '../../utils/privacyMask';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

interface ProfileAboutTabProps {
  user: any;
  accountId: string;
  isVip: boolean;
  audioPoints: number;
  totalEarnedPoints: number;
  totalListenedMinutes: number;
  profileData: UserProfileData;
  onUpdateProfileData: (data: UserProfileData) => void;
  isEditingInitially?: boolean;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
}

export function ProfileAboutTab({
  user,
  accountId,
  isVip,
  audioPoints,
  totalEarnedPoints,
  totalListenedMinutes,
  profileData,
  onUpdateProfileData,
  isEditingInitially = false,
  isPrivacyMode = true,
  onTogglePrivacyMode
}: ProfileAboutTabProps) {
  const [isEditing, setIsEditing] = useState(isEditingInitially);
  const [formData, setFormData] = useState<UserProfileData>({ ...profileData });
  const [newHobbyInput, setNewHobbyInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleReveal = (field: string) => {
    setRevealedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCopyText = (key: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfileData(formData);
    setIsEditing(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleAddHobby = () => {
    if (newHobbyInput.trim() && !formData.hobbies.includes(newHobbyInput.trim())) {
      setFormData({
        ...formData,
        hobbies: [...formData.hobbies, newHobbyInput.trim()]
      });
      setNewHobbyInput('');
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter(h => h !== hobby)
    });
  };

  const toggleGenre = (genre: string) => {
    if (formData.favoriteGenres.includes(genre)) {
      setFormData({
        ...formData,
        favoriteGenres: formData.favoriteGenres.filter(g => g !== genre)
      });
    } else {
      setFormData({
        ...formData,
        favoriteGenres: [...formData.favoriteGenres, genre]
      });
    }
  };

  const MUSIC_GENRES_OPTIONS = [
    'Lo-Fi Chill',
    'Acoustic & Guitar',
    'Nhạc Thiền 528Hz',
    'Sách Nói & Radio',
    'Truyện Audio',
    'Electronic / EDM',
    'Deep Focus',
    'Pop Ballad',
    'Nhạc Không Lời',
    'Nhạc Cổ Điển'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span>Giới Thiệu Thông Tin Cá Nhân</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Tùy Chỉnh
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Quản lý hồ sơ công khai, sở thích, thông tin liên lạc và phong cách âm nhạc của bạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onTogglePrivacyMode && (
            <button
              type="button"
              onClick={onTogglePrivacyMode}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border ${
                isPrivacyMode
                  ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title="Ẩn hoặc hiện toàn bộ thông tin nhạy cảm (Email, ID, Điểm số, Nơi ở)"
            >
              {isPrivacyMode ? (
                <>
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>Chế độ ẩn thông tin: BẬT</span>
                </>
              ) : (
                <>
                  <EyeOff size={15} className="text-zinc-400" />
                  <span>Chế độ ẩn thông tin: TẮT</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setFormData({ ...profileData });
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isEditing ? (
              <>
                <X size={14} className="text-rose-400" />
                <span>Hủy chỉnh sửa</span>
              </>
            ) : (
              <>
                <Edit3 size={14} className="text-amber-400" />
                <span>Tùy chỉnh thông tin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Privacy Notice Pill Banner */}
      {isPrivacyMode && !isEditing && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                Chế Độ Bảo Vệ Thông Tin Nhạy Cảm Đang Hoạt Động
              </p>
              <p className="text-[11px] text-zinc-400">
                Email, ID, số dư điểm và thông tin cá nhân đang được che giấu. Bấm vào biểu tượng mắt 👁️ ở từng mục để xem nhanh.
              </p>
            </div>
          </div>

          {onTogglePrivacyMode && (
            <button
              onClick={onTogglePrivacyMode}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/30 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Hiện tất cả thông tin
            </button>
          )}
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span className="font-bold">Đã lưu thông tin cá nhân tùy chỉnh thành công!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MODE FORM                                                            */}
      {/* ========================================================================= */}
      {isEditing ? (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-zinc-900 border border-amber-500/40 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>Chỉnh Sửa Hồ Sơ Tùy Biến</span>
            </h4>
            <span className="text-xs text-zinc-400">Mọi thay đổi sẽ cập nhật ngay lập tức</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên hiển thị */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tên hiển thị</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Nhập tên hiển thị..."
                required
              />
            </div>

            {/* Biệt danh / Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Biệt danh / Handle</label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus-within:border-amber-500">
                <span className="text-zinc-500 mr-1">@</span>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                  placeholder="biệt danh..."
                />
              </div>
            </div>

            {/* Châm ngôn sống / Quote */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Châm ngôn sống yêu thích (Quote)</label>
              <input
                type="text"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Ví dụ: Âm nhạc là sự chữa lành cho tâm hồn..."
              />
            </div>

            {/* Tiểu sử / Bio */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Tiểu sử (Bio)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                placeholder="Giới thiệu đôi nét về bản thân, phong cách âm nhạc hoặc sở thích..."
              />
            </div>

            {/* Ngày sinh & Cung hoàng đạo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Ngày sinh</label>
              <input
                type="text"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: 15/08/2000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Cung hoàng đạo</label>
              <input
                type="text"
                value={formData.zodiac}
                onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: Sư Tử ♌"
              />
            </div>

            {/* Nơi ở hiện tại & Quê quán */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nơi ở hiện tại</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: Hà Nội, Việt Nam"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Quê quán</label>
              <input
                type="text"
                value={formData.hometown}
                onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: Đà Nẵng"
              />
            </div>

            {/* Nghề nghiệp */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Nghề nghiệp / Lĩnh vực</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: Nhà sản xuất âm nhạc / Thiết kế sáng tạo"
              />
            </div>

            {/* Sở thích (Hobbies) */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Sở thích cá nhân</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHobbyInput}
                  onChange={(e) => setNewHobbyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHobby())}
                  placeholder="Thêm sở thích mới (VD: Chụp ảnh phim, Đọc sách...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddHobby}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Thêm</span>
                </button>
              </div>

              {formData.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700"
                    >
                      <span>{hobby}</span>
                      <X
                        size={12}
                        className="cursor-pointer text-zinc-400 hover:text-rose-400"
                        onClick={() => handleRemoveHobby(hobby)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thể loại nhạc yêu thích */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Thể loại nhạc yêu thích</label>
              <div className="flex flex-wrap gap-2">
                {MUSIC_GENRES_OPTIONS.map((genre) => {
                  const isSelected = formData.favoriteGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="space-y-2.5 sm:col-span-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-300">Liên kết mạng xã hội</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Facebook URL"
                  value={formData.socialLinks.facebook || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="TikTok URL"
                  value={formData.socialLinks.tiktok || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Instagram URL"
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="YouTube URL"
                  value={formData.socialLinks.youtube || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Save size={15} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE BENTO GRID                                                      */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1 & 2: Main Bio & Details */}
          <div className="md:col-span-2 space-y-6">

            {/* Giao Diện Hệ Thống & Màn Hình Điện Thoại (Theo máy / Ban ngày / Ban đêm) */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <h4 className="font-bold text-white text-base">Giao Diện Hệ Thống & Màn Hình Điện Thoại</h4>
                </div>
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Tự động đồng bộ
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Tùy chỉnh giao diện theo thói quen của bạn. Lựa chọn chế độ <strong>Ban ngày ('light')</strong> hoặc <strong>Ban đêm ('dark')</strong> sẽ được lưu vĩnh viễn trên cơ sở dữ liệu Firestore và tự động đồng bộ tức thời xuyên suốt tất cả các thiết bị trong hệ sinh thái Haevy Hub của bạn.
              </p>
              <ThemeSwitcher variant="cards" />
            </div>
            
            {/* Bio Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserIcon size={18} className="text-amber-400" />
                  <h4 className="font-bold text-white text-base">Tiểu Sử Cá Nhân</h4>
                </div>
                {profileData.nickname && (
                  <span className="text-xs text-zinc-400 font-mono">@{profileData.nickname}</span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {profileData.bio || 'Chưa cập nhật tiểu sử. Bấm nút "Tùy chỉnh thông tin" để viết đôi nét về bản thân.'}
              </p>

              {profileData.quote && (
                <div className="p-4 rounded-2xl bg-zinc-950 border-l-4 border-amber-500 text-xs italic text-amber-200/90 shadow-sm">
                  "{profileData.quote}"
                </div>
              )}
            </div>

            {/* Basic Info & Background Bento */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-indigo-400" />
                  <h4 className="font-bold text-white text-base">Thông Tin Cơ Bản & Địa Điểm</h4>
                </div>
                {isPrivacyMode && (
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                    <Lock size={10} />
                    <span>Đang che giấu</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Ngày sinh */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1 relative group">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-amber-400" />
                      <span>Ngày sinh & Hoàng đạo</span>
                    </div>
                    {isPrivacyMode && (
                      <button
                        type="button"
                        onClick={() => toggleReveal('birthday')}
                        className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title={revealedFields['birthday'] ? "Ẩn ngày sinh" : "Xem ngày sinh"}
                      >
                        {revealedFields['birthday'] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-white font-mono">
                    {isPrivacyMode && !revealedFields['birthday'] ? (
                      <span className="text-zinc-500 tracking-wider">••••••••••</span>
                    ) : (
                      `${profileData.birthday || 'Chưa cập nhật'} ${profileData.zodiac ? `(${profileData.zodiac})` : ''}`
                    )}
                  </p>
                </div>

                {/* Nơi ở hiện tại */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1 relative group">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-rose-400" />
                      <span>Nơi ở hiện tại</span>
                    </div>
                    {isPrivacyMode && (
                      <button
                        type="button"
                        onClick={() => toggleReveal('location')}
                        className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title={revealedFields['location'] ? "Ẩn địa chỉ" : "Xem địa chỉ"}
                      >
                        {revealedFields['location'] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-white">
                    {isPrivacyMode && !revealedFields['location'] ? (
                      <span className="text-zinc-500 font-mono tracking-wider">••••••••••</span>
                    ) : (
                      profileData.location || 'Chưa cập nhật'
                    )}
                  </p>
                </div>

                {/* Quê quán */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1 relative group">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-emerald-400" />
                      <span>Quê quán</span>
                    </div>
                    {isPrivacyMode && (
                      <button
                        type="button"
                        onClick={() => toggleReveal('hometown')}
                        className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title={revealedFields['hometown'] ? "Ẩn quê quán" : "Xem quê quán"}
                      >
                        {revealedFields['hometown'] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-white">
                    {isPrivacyMode && !revealedFields['hometown'] ? (
                      <span className="text-zinc-500 font-mono tracking-wider">••••••••••</span>
                    ) : (
                      profileData.hometown || 'Chưa cập nhật'
                    )}
                  </p>
                </div>

                {/* Nghề nghiệp */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Briefcase size={13} className="text-cyan-400" />
                    <span>Nghề nghiệp / Lĩnh vực</span>
                  </div>
                  <p className="font-bold text-white">{profileData.occupation || 'Người nghe âm nhạc'}</p>
                </div>
              </div>
            </div>

            {/* Hobbies & Music Genres */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Music size={18} className="text-amber-400" />
                  <h4 className="font-bold text-white text-base">Gu Âm Nhạc Yêu Thích</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.favoriteGenres.length > 0 ? (
                    profileData.favoriteGenres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                      >
                        🎵 {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Chưa chọn thể loại yêu thích</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-rose-400" />
                  <h4 className="font-bold text-white text-base">Sở Thích Cá Nhân</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.hobbies.length > 0 ? (
                    profileData.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="px-3 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium"
                      >
                        ✨ {hobby}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Chưa cập nhật sở thích</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Account & Social Sidebar Bento */}
          <div className="space-y-6">
            
            {/* Account Credentials Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h4 className="font-bold text-white text-base">Thông Tin Tài Khoản</h4>
                </div>
                {isPrivacyMode && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Bảo Vệ
                  </span>
                )}
              </div>

              <div className="space-y-3.5 text-xs">
                {/* ID Tài khoản */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">ID Tài Khoản:</span>
                    <div className="flex items-center gap-1">
                      {isPrivacyMode && (
                        <button
                          type="button"
                          onClick={() => toggleReveal('accountId')}
                          className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title={revealedFields['accountId'] ? "Ẩn ID" : "Xem ID"}
                        >
                          {revealedFields['accountId'] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyText('id', accountId)}
                        className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Sao chép ID"
                      >
                        {copiedKey === 'id' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-amber-400 tracking-wider">
                    {isPrivacyMode && !revealedFields['accountId'] ? maskAccountId(accountId) : accountId}
                  </p>
                  {copiedKey === 'id' && (
                    <span className="text-[10px] text-emerald-400 font-bold block animate-fadeIn">
                      ✓ Đã sao chép ID!
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Địa Chỉ Email:</span>
                    <div className="flex items-center gap-1">
                      {isPrivacyMode && (
                        <button
                          type="button"
                          onClick={() => toggleReveal('email')}
                          className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title={revealedFields['email'] ? "Ẩn Email" : "Xem Email"}
                        >
                          {revealedFields['email'] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                      {user?.email && (
                        <button
                          type="button"
                          onClick={() => handleCopyText('email', user.email)}
                          className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Sao chép Email"
                        >
                          {copiedKey === 'email' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-zinc-200 font-medium truncate font-mono">
                    {isPrivacyMode && !revealedFields['email'] ? maskEmail(user?.email) : (user?.email || 'Chưa liên kết')}
                  </p>
                  {copiedKey === 'email' && (
                    <span className="text-[10px] text-emerald-400 font-bold block animate-fadeIn">
                      ✓ Đã sao chép Email!
                    </span>
                  )}
                </div>

                {/* Cấp bậc thành viên */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px]">Cấp Bậc:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                    isVip 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-zinc-850 text-zinc-300'
                  }`}>
                    {isVip ? 'VIP Hoàng Kim (x3 Điểm)' : 'Thành Viên Thường'}
                  </span>
                </div>

                {/* Điểm Audio Hiện Có */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Điểm Audio Hiện Có:</span>
                    {isPrivacyMode && (
                      <button
                        type="button"
                        onClick={() => toggleReveal('points')}
                        className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title={revealedFields['points'] ? "Ẩn số điểm" : "Xem số điểm"}
                      >
                        {revealedFields['points'] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                  <p className="font-mono font-bold text-emerald-400 text-sm">
                    {isPrivacyMode && !revealedFields['points'] ? (
                      <span className="text-zinc-500 tracking-wider">•••••• pts</span>
                    ) : (
                      `${audioPoints.toLocaleString()} pts`
                    )}
                  </p>
                </div>

                {/* Thời gian nghe nhạc */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px]">Thời Gian Nghe Nhạc:</span>
                  <span className="text-zinc-200 font-bold">{totalListenedMinutes} phút</span>
                </div>

                {/* Ngày tham gia */}
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px]">Ngày Tham Gia:</span>
                  <span className="text-zinc-300">{profileData.joinedDate || 'Tháng 1, 2024'}</span>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Globe size={18} className="text-cyan-400" />
                <h4 className="font-bold text-white text-base">Mạng Xã Hội</h4>
              </div>

              <div className="space-y-2 text-xs">
                {profileData.socialLinks.facebook && (
                  <a
                    href={profileData.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>Facebook</span>
                    <ExternalLink size={13} className="text-zinc-500" />
                  </a>
                )}
                {profileData.socialLinks.tiktok && (
                  <a
                    href={profileData.socialLinks.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>TikTok</span>
                    <ExternalLink size={13} className="text-zinc-500" />
                  </a>
                )}
                {profileData.socialLinks.youtube && (
                  <a
                    href={profileData.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>YouTube</span>
                    <ExternalLink size={13} className="text-zinc-500" />
                  </a>
                )}
                {profileData.socialLinks.instagram && (
                  <a
                    href={profileData.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>Instagram</span>
                    <ExternalLink size={13} className="text-zinc-500" />
                  </a>
                )}

                {!profileData.socialLinks.facebook && !profileData.socialLinks.tiktok && !profileData.socialLinks.youtube && !profileData.socialLinks.instagram && (
                  <p className="text-xs text-zinc-500 italic">
                    Chưa liên kết tài khoản mạng xã hội.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
