import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Hash, 
  Triangle, 
  Award,
  Crown,
  Share2,
  Play,
  Palette,
  Flame,
  Zap,
  Orbit,
  Snowflake,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { CosmicPlanetBanner } from './CosmicPlanetBanner';
import { CosmicGothicText } from './CosmicGothicText';
import { CosmicAvatarFX } from './CosmicAvatarFX';
import { ProfileEntranceFX } from './ProfileEntranceFX';
import { 
  getAvatarFrame, 
  getNameBorder, 
  getNameFont, 
  getEntranceAnimation, 
  getChatBorder,
  getShopItem 
} from './themeBundles';
import { useAuth } from '../../context/AuthContext';

export interface CosmicProfileUserData {
  displayName?: string;
  username?: string;
  handle?: string;
  subtitle?: string;
  photoURL?: string | null;
  joinedDate?: string;
  isVip?: boolean;
  isAuthorVerified?: boolean;
  statusText?: string;
  uid?: string;
  activeAvatarFrame?: string;
  activeNameBorder?: string;
  activeNameFont?: string;
  activeEntranceAnimation?: string;
  activeChatBorder?: string;
  activeThemeBundle?: string;
  bio?: string;
  isOnline?: boolean;
}

interface CosmicProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: CosmicProfileUserData;
  onStartChat?: () => void;
  onOpenCustomizer?: () => void;
}

export function CosmicProfileCardModal({
  isOpen,
  onClose,
  userData,
  onStartChat,
  onOpenCustomizer
}: CosmicProfileCardModalProps) {
  const { 
    user, 
    equipHaevyLiteItem, 
    activeAvatarFrame, 
    activeNameBorder,
    activeNameFont,
    activeEntranceAnimation,
    activeChatBorder
  } = useAuth();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingEntranceFX, setIsPlayingEntranceFX] = useState(false);
  const [equippedNotice, setEquippedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Resolve target details
  const isOwnProfile = !userData?.uid || userData.uid === user?.uid;
  const targetName = userData?.displayName || user?.displayName || 'Ha Khai 5429';
  const targetHandle = userData?.handle || (userData?.displayName ? `@${userData.displayName.toLowerCase().replace(/\s+/g, '_')}` : '@hakhai_5429');
  const targetSubtitle = userData?.subtitle || (userData?.isVip ? 'Thành Viên VIP Hoàng Kim' : 'Khải HQ');
  const targetPhoto = userData?.photoURL !== undefined ? userData.photoURL : user?.photoURL;
  const targetJoinedDate = userData?.joinedDate || '17 thg 4, 2022';
  const targetIsVip = userData?.isVip !== undefined ? userData.isVip : false;
  const targetIsVerified = userData?.isAuthorVerified !== undefined ? userData.isAuthorVerified : true;
  const targetIsOnline = userData?.isOnline !== undefined ? userData.isOnline : true;
  const targetStatus = userData?.statusText || 'Đang trực tuyến trên Haevy';

  // Resolve cosmetics for this profile: Items only belong to the specific user, not shared
  const effectiveAvatarFrameId = isOwnProfile ? activeAvatarFrame : (userData?.activeAvatarFrame || '');
  const effectiveNameBorderId = isOwnProfile ? activeNameBorder : (userData?.activeNameBorder || '');
  const effectiveNameFontId = isOwnProfile ? activeNameFont : (userData?.activeNameFont || '');
  const effectiveEntranceAnimId = isOwnProfile ? activeEntranceAnimation : (userData?.activeEntranceAnimation || '');
  const effectiveChatBorderId = isOwnProfile ? activeChatBorder : (userData?.activeChatBorder || '');

  const avatarFrameItem = getAvatarFrame(effectiveAvatarFrameId) || getShopItem(effectiveAvatarFrameId);
  const nameBorderItem = getNameBorder(effectiveNameBorderId);
  const nameFontItem = getNameFont(effectiveNameFontId);
  const entranceAnimItem = getEntranceAnimation(effectiveEntranceAnimId) || getShopItem(effectiveEntranceAnimId);
  const chatBorderItem = getChatBorder(effectiveChatBorderId);

  // Check if current logged-in user already has this exact combo equipped
  const isAlreadyEquipped = 
    activeAvatarFrame === effectiveAvatarFrameId && 
    activeNameBorder === effectiveNameBorderId;

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}?profile=${targetHandle.replace('@', '')}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleEquipMatchingCombo = async () => {
    try {
      if (effectiveAvatarFrameId) await equipHaevyLiteItem('avatar_frame', effectiveAvatarFrameId);
      if (effectiveNameBorderId) await equipHaevyLiteItem('name_border', effectiveNameBorderId);
      if (effectiveNameFontId) await equipHaevyLiteItem('name_font', effectiveNameFontId);
      if (effectiveEntranceAnimId) await equipHaevyLiteItem('entrance_animation', effectiveEntranceAnimId);
      
      setEquippedNotice('✓ Đã đồng bộ & trang bị combo vũ trụ này vào hồ sơ của bạn!');
      setTimeout(() => setEquippedNotice(null), 3000);
    } catch (err) {
      console.error('Error equipping combo:', err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        {/* Background Click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Main Modal Card */}
        <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#0f142b] border border-sky-400/40 shadow-[0_0_60px_rgba(2,132,199,0.45)] overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
          
          {/* Top Modal Header */}
          <div className="p-3.5 sm:p-4 border-b border-sky-950/80 flex items-center justify-between bg-slate-950/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                  <span>Hồ Sơ Vũ Trụ Haevy</span>
                  {avatarFrameItem && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      {avatarFrameItem.name}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">Không gian số & Thẻ danh tính cá nhân hóa</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                title="Sao chép liên kết chia sẻ hồ sơ"
              >
                {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto p-3 sm:p-5 space-y-4">
            
            {/* Equipping feedback toast notice */}
            {equippedNotice && (
              <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-lg">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{equippedNotice}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* THE DISCORD-STYLE COSMIC PROFILE CARD SHOWCASE                            */}
            {/* ========================================================================= */}
            <div className="relative rounded-3xl overflow-hidden bg-[#161b3b] border border-sky-400/30 shadow-2xl">
              
              {/* Top Vista Banner */}
              <div className="relative">
                <CosmicPlanetBanner variant="card" className="h-44 sm:h-52" />

                {/* Floating Action: Play Entrance FX Button */}
                {entranceAnimItem && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingEntranceFX(true)}
                    className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-purple-400/60 text-purple-300 hover:text-white text-xs font-black flex items-center gap-1.5 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Xem hoạt ảnh mở đầu tài khoản của người này"
                  >
                    <Play size={12} className="fill-purple-300 text-purple-300" />
                    <span>Xem Hoạt Ảnh Mở Đầu</span>
                  </button>
                )}
              </div>

              {/* Profile Body with Dynamic Avatar & Nameplate */}
              <div className="relative px-5 pb-6 pt-0 bg-gradient-to-b from-[#181d3d] via-[#121633] to-[#0c1029]">
                
                {/* Avatar with Dynamic CosmicAvatarFX */}
                <div className="relative -mt-16 sm:-mt-20 mb-3.5 inline-block">
                  <div className="cursor-pointer" onClick={() => setIsPlayingEntranceFX(true)} title="Bấm để kích hoạt hiệu ứng mở đầu">
                    <CosmicAvatarFX
                      photoURL={targetPhoto}
                      displayName={targetName}
                      avatarFrameId={effectiveAvatarFrameId}
                      isVip={targetIsVip}
                      size="xl"
                      showBadge={true}
                    />
                  </div>

                  {/* Online Presence Beacon */}
                  <div className="absolute -top-1 -right-1 z-30">
                    {targetIsOnline ? (
                      <span className="flex h-5 w-5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-[#181d3d] shadow-[0_0_10px_#10b981] items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-600 border-2 border-[#181d3d] block shadow" />
                    )}
                  </div>
                </div>

                {/* Name & Custom Nameplate Container */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* If user has a name border equipped, wrap in custom nameplate chip */}
                    {nameBorderItem ? (
                      <div className={`px-3 py-1 rounded-2xl border flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02] ${nameBorderItem.nameplateBorderClass} ${nameBorderItem.nameplateBgClass}`}>
                        <span className="text-base">{nameBorderItem.nameplateIcon}</span>
                        {/* Custom Name Typography */}
                        {nameFontItem && nameFontItem.id === 'font_gothic_fraktur' ? (
                          <CosmicGothicText text={targetName} size="xl" />
                        ) : (
                          <h3 
                            className={`text-lg sm:text-xl font-black ${nameFontItem?.fontGlowClass || nameBorderItem.nameplateTextClass}`}
                            style={nameFontItem ? { fontFamily: nameFontItem.fontFamilyName } : undefined}
                          >
                            {targetName}
                          </h3>
                        )}
                      </div>
                    ) : (
                      /* Standard / Legacy Font Display */
                      <>
                        {nameFontItem && nameFontItem.id === 'font_gothic_fraktur' ? (
                          <CosmicGothicText text={targetName} size="xl" />
                        ) : nameFontItem ? (
                          <h3 
                            className={`text-xl font-black ${nameFontItem.fontGlowClass || 'text-white'}`}
                            style={{ fontFamily: nameFontItem.fontFamilyName }}
                          >
                            {targetName}
                          </h3>
                        ) : (
                          <h3 className="text-xl font-extrabold text-white tracking-tight">
                            {targetName}
                          </h3>
                        )}
                      </>
                    )}

                    {/* VIP Badge */}
                    {targetIsVip && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-black flex items-center gap-1 shadow-sm">
                        <Crown size={12} className="fill-amber-400 text-amber-400" />
                        <span>VIP HOÀNG KIM</span>
                      </span>
                    )}

                    {/* Author Verified Badge */}
                    {targetIsVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-sky-400" />
                        <span>Đã Xác Thực</span>
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Handle Row */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium flex-wrap">
                    <span className="text-cyan-200 font-mono">{targetHandle}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{targetSubtitle}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 text-xs font-semibold">{targetStatus}</span>
                  </div>
                </div>

                {/* 5 Distinctive Badges Row */}
                <div className="mt-4 pt-3.5 border-t border-slate-700/50 flex items-center gap-2.5 flex-wrap">
                  {/* Blender / 3D Icon */}
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm transition-transform hover:scale-110" title="3D Hi-Fi Sound Enthusiast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>

                  {/* Purple Triangle */}
                  <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-sm transition-transform hover:scale-110" title="Trí Tuệ Nhân Tạo Haevy AI Studio">
                    <Triangle size={15} className="fill-purple-400/80 text-purple-300" />
                  </div>

                  {/* Teal Hashtag */}
                  <div className="w-8 h-8 rounded-xl bg-teal-950/60 border border-teal-500/50 flex items-center justify-center text-teal-300 shadow-sm transition-transform hover:scale-110" title="Kênh Thảo Luận #5429">
                    <Hash size={15} className="text-teal-300" />
                  </div>

                  {/* Celestial Star Award */}
                  <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-500/50 flex items-center justify-center text-sky-300 shadow-sm transition-transform hover:scale-110" title="Thành Viên Tinh Cầu Vũ Trụ">
                    <Award size={15} className="text-sky-300" />
                  </div>

                  {/* 6-Layer Security Shield */}
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-sm transition-transform hover:scale-110" title="Đã Xác Thực Bảo Mật 6 Lớp An Toàn">
                    <ShieldCheck size={15} className="text-emerald-300" />
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* ACTIVE HAEVY LITE COSMETICS SHELF (Kho Trang Sức Đang Đeo)                 */}
                {/* ========================================================================= */}
                <div className="mt-4 pt-3.5 border-t border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-300 flex items-center gap-1.5">
                      <Palette size={14} className="text-amber-400" />
                      <span>Trang Sức Haevy Lite Đang Sử Dụng</span>
                    </span>
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                      Đồng bộ 100%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Frame */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Khung Avatar</span>
                      <span className="font-extrabold text-cyan-300 flex items-center gap-1 truncate">
                        <span>{avatarFrameItem?.frameDecorationEmoji || '👑'}</span>
                        <span className="truncate">{avatarFrameItem?.name || 'Khung Mặc Định'}</span>
                      </span>
                    </div>

                    {/* Name Border */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Bảng Tên</span>
                      <span className="font-extrabold text-purple-300 flex items-center gap-1 truncate">
                        <span>{nameBorderItem?.nameplateIcon || '🏷️'}</span>
                        <span className="truncate">{nameBorderItem?.name || 'Tiêu Chuẩn'}</span>
                      </span>
                    </div>

                    {/* Name Font */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Kiểu Chữ</span>
                      <span className="font-extrabold text-amber-300 flex items-center gap-1 truncate">
                        <span>🔤</span>
                        <span className="truncate">{nameFontItem?.name || 'Gothic Fraktur'}</span>
                      </span>
                    </div>

                    {/* Entrance Animation */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Hoạt Ảnh Mở Đầu</span>
                      <span className="font-extrabold text-emerald-300 flex items-center gap-1 truncate">
                        <span>🎬</span>
                        <span className="truncate">{entranceAnimItem?.name || 'Cổng Không Gian'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Joined Date Box */}
                <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gia Nhập Haevy Từ
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Calendar size={13} className="text-cyan-400" />
                    <span>{targetJoinedDate}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              {onStartChat && (
                <button
                  type="button"
                  onClick={() => {
                    onStartChat();
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-98"
                >
                  <MessageSquare size={16} />
                  <span>Bắt Đầu Phiên Trò Chuyện</span>
                </button>
              )}

              {/* If viewing own profile, open customizer */}
              {isOwnProfile && onOpenCustomizer ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomizer();
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-sky-400/40"
                >
                  <Palette size={16} className="text-cyan-400" />
                  <span>Tùy Biến Thêm Hiệu Ứng</span>
                </button>
              ) : (
                /* If viewing someone else, allow equipping their combo */
                <button
                  type="button"
                  onClick={handleEquipMatchingCombo}
                  className={`w-full sm:w-auto py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isAlreadyEquipped
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-sky-400/40 hover:border-cyan-300'
                  }`}
                >
                  {isAlreadyEquipped ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span>Đang Dùng Cho Tôi</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-cyan-400" />
                      <span>Trang Bị Bộ Này Cho Tôi</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Full-Screen Interactive Entrance Animation FX Player */}
      {isPlayingEntranceFX && (
        <ProfileEntranceFX
          isOpen={true}
          animationId={effectiveEntranceAnimId}
          userName={targetName}
          userPhoto={targetPhoto}
          onClose={() => setIsPlayingEntranceFX(false)}
          onComplete={() => setIsPlayingEntranceFX(false)}
        />
      )}
    </>
  );
}

