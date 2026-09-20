import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Crown, 
  Edit3, 
  Check, 
  Copy, 
  User as UserIcon, 
  ShieldCheck, 
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Eye,
  EyeOff,
  ShieldAlert,
  Award,
  TrendingUp,
  Zap,
  Gift
} from 'lucide-react';
import { AvatarFrame, AvatarFrameId, AVATAR_FRAMES, COVER_PRESETS, UserProfileData } from './types';
import { maskAccountId } from '../../utils/privacyMask';
import { useAuth } from '../../context/AuthContext';
import { calculateLevelFromExp } from '../../data/levelMilestones';
import { CosmicAvatarFX } from '../haevyLite/CosmicAvatarFX';
import { HAEVY_LITE_SHOP_ITEMS } from '../haevyLite/themeBundles';
import { CosmicProfileCardModal } from '../haevyLite/CosmicProfileCardModal';

interface ProfileHeaderCoverProps {
  user: any;
  accountId: string;
  isVip: boolean;
  profileData: UserProfileData;
  coverUrl: string;
  avatarFrameId: AvatarFrameId;
  onUpdateCoverUrl: (url: string) => void;
  onUpdateAvatarFrame: (frameId: AvatarFrameId) => void;
  onOpenEditProfile: () => void;
  onGoToTopup: () => void;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
}

export function ProfileHeaderCover({
  user,
  accountId,
  isVip,
  profileData,
  coverUrl,
  avatarFrameId,
  onUpdateCoverUrl,
  onUpdateAvatarFrame,
  onOpenEditProfile,
  onGoToTopup,
  isPrivacyMode = true,
  onTogglePrivacyMode
}: ProfileHeaderCoverProps) {
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [isCosmicModalOpen, setIsCosmicModalOpen] = useState(false);
  const [customCoverInput, setCustomCoverInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showAccountId, setShowAccountId] = useState(false);

  const { 
    activeAvatarFrame, 
    unlockedHaevyLiteItems = [], 
    equipHaevyLiteItem, 
    unequipHaevyLiteItem,
    levelExp = 0,
    unclaimedLevelRewardsCount = 0,
    setIsLevelModalOpen
  } = useAuth();

  const levelState = calculateLevelFromExp(levelExp);

  const currentFrame = AVATAR_FRAMES.find(f => f.id === avatarFrameId) || AVATAR_FRAMES[0];

  const handleCopyId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleApplyCustomCover = () => {
    if (customCoverInput.trim()) {
      onUpdateCoverUrl(customCoverInput.trim());
      setIsCoverModalOpen(false);
      setCustomCoverInput('');
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateCoverUrl(reader.result);
          setIsCoverModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl relative">
      {/* ========================================================================= */}
      {/* 1. COVER PHOTO BANNER (ẢNH BÌA)                                           */}
      {/* ========================================================================= */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-zinc-950 group">
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/20" />

        {/* Change Cover Button (Corner top-right) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <button
            onClick={() => setIsCoverModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 hover:border-amber-400/60 font-semibold text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
            title="Đổi ảnh bìa trang cá nhân"
          >
            <Camera size={15} className="text-amber-400" />
            <span className="hidden xs:inline">Đổi ảnh bìa</span>
          </button>
        </div>

        {/* Subtle VIP / Aesthetic badge on cover */}
        {isVip && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-zinc-950 text-[11px] font-black shadow-lg backdrop-blur-sm">
            <Crown size={13} fill="currentColor" />
            <span>HAEVY VIP PASS</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. AVATAR & USER PROFILE METADATA SECTION                                  */}
      {/* ========================================================================= */}
      <div className="px-4 sm:px-8 pb-6 sm:pb-7 pt-0 relative">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-16 sm:-mt-20 md:-mt-24 mb-4">
          
          {/* Left: Avatar with Frame & Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            
            {/* Avatar with Custom Frame Wrapper */}
            <div className="relative group shrink-0">
              {activeAvatarFrame && activeAvatarFrame !== 'none' ? (
                <div className="relative cursor-pointer" onClick={() => setIsFrameModalOpen(true)}>
                  <CosmicAvatarFX
                    photoURL={user?.photoURL}
                    displayName={profileData.displayName || user?.displayName || 'Avatar'}
                    avatarFrameId={activeAvatarFrame}
                    isVip={isVip}
                    size="xl"
                    showBadge={isVip}
                  />
                  {/* Frame Name Pill Tooltip on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-center p-2 backdrop-blur-[2px] cursor-pointer">
                    <div className="text-[10px] font-bold text-white bg-zinc-900/90 px-2.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <Palette size={12} className="text-amber-400" />
                      <span>Đổi khung Haevy Lite</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-1 bg-zinc-950 transition-all duration-300 ${currentFrame.ringClass} ${currentFrame.glowStyle} ${currentFrame.auraAnimation}`}
                >
                  {/* Crown / Top Badge of the frame */}
                  {currentFrame.crownIcon && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-lg sm:text-xl drop-shadow-md select-none animate-bounce">
                      {currentFrame.crownIcon}
                    </div>
                  )}

                  {/* Actual Avatar Image */}
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center relative border border-white/20">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={profileData.displayName || user?.displayName || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                        <UserIcon size={52} />
                      </div>
                    )}

                    {/* Frame Name Pill Tooltip on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2 backdrop-blur-[2px] cursor-pointer" onClick={() => setIsFrameModalOpen(true)}>
                      <div className="text-[10px] font-bold text-white bg-zinc-900/90 px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-lg">
                        <Palette size={12} className="text-amber-400" />
                        <span>Đổi khung</span>
                      </div>
                    </div>
                  </div>

                  {/* VIP Indicator Badge bottom right of avatar */}
                  {isVip && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-lg border-2 border-zinc-950 z-20">
                      <Crown size={15} fill="currentColor" />
                    </div>
                  )}
                </div>
              )}

              {/* Quick Change Frame Button */}
              <button
                onClick={() => setIsFrameModalOpen(true)}
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-30 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/50 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Chọn khung avatar hoàng kim & hiệu ứng"
              >
                <Palette size={14} />
              </button>
            </div>

            {/* Profile Identity Details */}
            <div className="space-y-1.5 sm:mb-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profileData.displayName || user?.displayName || 'Người Dùng Haevy'}
                </h1>
                
                {/* Frame Badge */}
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800/90 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
                  <span>{currentFrame.badge}</span>
                </span>

                {isVip && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-sm">
                    VIP x3
                  </span>
                )}
              </div>

              {/* Sub-handle & Quick Info */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400">
                {profileData.nickname && (
                  <span className="text-zinc-300 font-medium">@{profileData.nickname}</span>
                )}
                {profileData.occupation && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>{profileData.occupation}</span>
                  </>
                )}
                {profileData.location && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span>📍 {profileData.location}</span>
                  </>
                )}
              </div>

              {/* Account ID Pill with 1-Click Copy & Privacy Mask */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <div 
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-xl text-[11px] font-mono transition-colors group ${
                    isVip 
                      ? 'bg-zinc-950/90 hover:bg-zinc-900 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-950/90 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className="text-zinc-500 font-sans">ID:</span>
                  <span 
                    onClick={handleCopyId}
                    className="font-bold tracking-wider cursor-pointer hover:underline" 
                    title="Bấm để sao chép mã ID"
                  >
                    {isPrivacyMode && !showAccountId ? maskAccountId(accountId) : accountId}
                  </span>

                  {/* Eye Toggle to Peek / Hide ID */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAccountId(!showAccountId);
                    }}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={showAccountId ? "Ẩn ID tài khoản" : "Hiện ID tài khoản"}
                  >
                    {showAccountId ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Sao chép ID"
                  >
                    {copiedId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="group-hover:text-zinc-200" />}
                  </button>
                </div>

                {copiedId && (
                  <span className="text-[10px] text-emerald-400 font-bold animate-fadeIn">
                    ✓ Đã chép ID!
                  </span>
                )}

                {/* Privacy Mode Status Badge in Header */}
                {onTogglePrivacyMode && (
                  <button
                    type="button"
                    onClick={onTogglePrivacyMode}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer active:scale-95 border ${
                      isPrivacyMode
                        ? 'bg-indigo-950/70 hover:bg-indigo-900/90 border-indigo-500/40 text-indigo-300 shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Bấm để chuyển đổi chế độ ẩn / hiện toàn bộ thông tin cá nhân"
                  >
                    {isPrivacyMode ? (
                      <>
                        <ShieldCheck size={13} className="text-emerald-400" />
                        <span>Riêng tư: BẬT</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} className="text-zinc-400" />
                        <span>Riêng tư: TẮT</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Bio Quote */}
              {profileData.quote && (
                <p className="text-xs text-zinc-300 italic pt-1 max-w-xl">
                  "{profileData.quote}"
                </p>
              )}

              {/* Interactive User Level & EXP Progress Bar */}
              <div 
                onClick={() => setIsLevelModalOpen(true)}
                className="mt-2.5 p-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-purple-500/15 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-xl"
                title="Bấm để mở Trung Tâm Cấp Độ & Đặc Quyền LV"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md shrink-0">
                    {levelState.currentMilestone.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-amber-300">
                        LV.{levelState.currentLevel}
                      </span>
                      <span className="text-[11px] font-bold text-white truncate">
                        {levelState.currentMilestone.title}
                      </span>
                      {unclaimedLevelRewardsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black animate-pulse">
                          +{unclaimedLevelRewardsCount} Quà
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {!levelState.nextMilestone 
                        ? 'Cấp Tối Thượng (Max Level)' 
                        : `${levelState.expInCurrentLevel.toLocaleString()} / ${levelState.expRequiredForNext.toLocaleString()} EXP (${levelState.progressPercentage}%)`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:w-44 shrink-0">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                      style={{ width: `${levelState.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Chi tiết →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons (Chỉnh sửa thông tin, Đổi ảnh bìa, Đổi khung, Cấp độ LV, Nạp VIP) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto shrink-0 sm:mb-2">
            <button
              onClick={() => setIsLevelModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer group"
              title="Xem cấp độ LV, điểm EXP và nhận đặc quyền"
            >
              <Award size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Cấp Độ LV.{levelState.currentLevel}</span>
              {unclaimedLevelRewardsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setIsCosmicModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-600/30 to-indigo-600/30 hover:from-sky-600/50 hover:to-indigo-600/50 text-cyan-300 font-bold text-xs border border-sky-400/40 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Xem thẻ hồ sơ vũ trụ hiệu ứng đặc biệt"
            >
              <Sparkles size={14} className="text-cyan-300 animate-pulse" />
              <span>Thẻ Vũ Trụ</span>
            </button>

            <button
              onClick={onOpenEditProfile}
              className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 size={14} className="text-amber-400" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            <button
              onClick={() => setIsFrameModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 font-bold text-xs border border-purple-500/40 shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Palette size={14} />
              <span>Khung Avatar</span>
            </button>

            {!isVip && (
              <button
                onClick={onGoToTopup}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Crown size={14} fill="currentColor" />
                <span>Nâng VIP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: CHỌN ẢNH BÌA (COVER PHOTO PRESETS & UPLOAD)                     */}
      {/* ========================================================================= */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-amber-400" size={20} />
                <h3 className="text-base sm:text-lg font-bold">Thay Đổi Ảnh Bìa Trang Cá Nhân</h3>
              </div>
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-zinc-300">Chọn ảnh bìa nghệ thuật có sẵn:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COVER_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onUpdateCoverUrl(preset.url);
                      setIsCoverModalOpen(false);
                    }}
                    className={`group relative rounded-2xl overflow-hidden aspect-[16/9] border-2 cursor-pointer transition-all hover:scale-102 ${
                      coverUrl === preset.url ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                      <span className="text-[9px] text-amber-300">{preset.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom URL or File Upload */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <p className="text-xs font-bold text-zinc-300">Hoặc tải lên từ thiết bị / nhập URL:</p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCoverInput}
                  onChange={(e) => setCustomCoverInput(e.target.value)}
                  placeholder="Dán đường dẫn ảnh bìa (https://...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleApplyCustomCover}
                  disabled={!customCoverInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>

              <div className="relative">
                <label className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-amber-500/60 bg-zinc-950/60 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-zinc-300 font-medium">
                  <Upload size={16} className="text-amber-400" />
                  <span>Chọn tệp ảnh từ máy tính hoặc điện thoại</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CHỌN KHUNG ĐẠI DIỆN (AVATAR FRAME SELECTOR)                     */}
      {/* ========================================================================= */}
      {isFrameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="text-base sm:text-lg font-bold">Kho Khung Đại Diện & Hào Quang</h3>
              </div>
              <button
                onClick={() => setIsFrameModalOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Khung đại diện tạo vầng hào quang phát sáng và biểu tượng vương quyền hiển thị trên toàn bộ hệ thống Haevy (Trang cá nhân, Tin nhắn & Thanh điều hướng).
            </p>

            {/* Haevy Lite Exclusive Shop Frames */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={14} />
                  Khung Avatar Haevy Lite Shop
                </span>
                {activeAvatarFrame && activeAvatarFrame !== 'none' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await unequipHaevyLiteItem('avatar_frame');
                    }}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Gỡ khung Haevy Lite
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HAEVY_LITE_SHOP_ITEMS.filter(i => i.category === 'avatar_frame').map((shopFrame) => {
                  const isOwned = unlockedHaevyLiteItems.includes(shopFrame.id);
                  const isEquipped = activeAvatarFrame === shopFrame.id;

                  return (
                    <div
                      key={shopFrame.id}
                      onClick={async () => {
                        if (isOwned) {
                          await equipHaevyLiteItem('avatar_frame', shopFrame.id);
                          setIsFrameModalOpen(false);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isEquipped
                          ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-500/20'
                          : isOwned
                          ? 'bg-zinc-950/80 hover:bg-zinc-800/80 border-purple-800/40 cursor-pointer'
                          : 'bg-zinc-950/40 border-zinc-850 opacity-60'
                      }`}
                    >
                      <div className="shrink-0">
                        <CosmicAvatarFX
                          photoURL={user?.photoURL}
                          displayName={profileData.displayName || user?.displayName || 'Avatar'}
                          avatarFrameId={shopFrame.id}
                          size="sm"
                          showBadge={false}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-white truncate">{shopFrame.name}</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                            {shopFrame.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{shopFrame.tagline}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {isEquipped ? (
                            <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1">
                              <Check size={12} /> Đang trang bị
                            </span>
                          ) : isOwned ? (
                            <span className="text-[10px] text-purple-300 font-bold">
                              Đã sở hữu • Bấm để dùng
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">
                              Chưa sở hữu ({shopFrame.priceLiteCoins} Xu Lite)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 block mb-3">
                Khung Thẻ Cổ Điển Trang Cá Nhân
              </span>
            </div>

            {/* Frames Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVATAR_FRAMES.map((frame) => {
                const isSelected = avatarFrameId === frame.id;
                return (
                  <div
                    key={frame.id}
                    onClick={() => {
                      onUpdateAvatarFrame(frame.id);
                      setIsFrameModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'bg-zinc-850 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-950/70 hover:bg-zinc-800/80 border-zinc-800'
                    }`}
                  >
                    {/* Frame Preview Orb */}
                    <div className={`relative w-14 h-14 rounded-full p-0.5 bg-zinc-900 shrink-0 ${frame.ringClass} ${frame.glowStyle}`}>
                      {frame.crownIcon && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                          {frame.crownIcon}
                        </div>
                      )}
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={24} className="text-zinc-400" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-white truncate">{frame.name}</p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {frame.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                        {frame.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cosmic Profile Card Modal */}
      <CosmicProfileCardModal
        isOpen={isCosmicModalOpen}
        onClose={() => setIsCosmicModalOpen(false)}
        userData={{
          displayName: profileData.displayName || user?.displayName || 'Người Dùng Haevy',
          photoURL: user?.photoURL,
          isVip,
          isAuthorVerified: true,
          statusText: 'Đang trực tuyến trên Haevy',
          handle: profileData.nickname ? `@${profileData.nickname}` : undefined,
          subtitle: profileData.occupation || (isVip ? 'Thành Viên VIP' : 'Khải HQ'),
          joinedDate: profileData.joinedDate || '17 thg 4, 2022',
          uid: user?.uid
        }}
      />
    </div>
  );
}
