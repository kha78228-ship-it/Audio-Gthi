import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { getAvatarFrame, getShopItem, getThemeBundle } from './themeBundles';
import { useAuth } from '../../context/AuthContext';
import { HoloTrooperHelmet } from './HoloTrooperHelmet';

interface CosmicAvatarFXProps {
  photoURL?: string | null;
  displayName: string;
  avatarFrameId?: string | null;
  themeId?: string | null;
  isVip?: boolean;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  isCurrentUser?: boolean;
}

export function CosmicAvatarFX({
  photoURL,
  displayName,
  avatarFrameId,
  themeId,
  isVip,
  size = 'md',
  className = '',
  showBadge = true,
  isCurrentUser = false
}: CosmicAvatarFXProps) {
  const { activeAvatarFrame } = useAuth();
  
  // Normalize frame ID: Only use activeAvatarFrame if this is explicitly currentUser or if avatarFrameId is provided
  // CRITICAL: Other users in chat/system must NOT inherit the logged-in user's avatar frame!
  let effectiveFrameId = avatarFrameId || (themeId && themeId !== 'cosmic' ? themeId : null) || (isCurrentUser ? activeAvatarFrame : null);
  if (effectiveFrameId === 'frame-gold') effectiveFrameId = 'frame_dragon_gold';
  else if (effectiveFrameId === 'frame-neon' || effectiveFrameId === 'frame-cyber') effectiveFrameId = 'frame_cyber_neon';
  else if (effectiveFrameId === 'frame-fire') effectiveFrameId = 'frame_phoenix_fire';
  else if (effectiveFrameId === 'frame-galaxy') effectiveFrameId = 'frame_cosmic_starlight';
  else if (effectiveFrameId === 'frame-sakura') effectiveFrameId = 'frame_sakura_blossom';

  const frameItem = getAvatarFrame(effectiveFrameId) || getShopItem(effectiveFrameId);
  const legacyTheme = !frameItem && effectiveFrameId ? getThemeBundle(effectiveFrameId) : null;

  // Size mapping
  const sizeClasses = {
    xxs: 'w-6 h-6 rounded-lg text-[9px]',
    xs: 'w-8 h-8 rounded-xl text-xs',
    sm: 'w-10 h-10 rounded-2xl text-sm',
    md: 'w-12 h-12 rounded-2xl text-base',
    lg: 'w-16 h-16 rounded-3xl text-xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl text-3xl'
  };

  const ringSizes = {
    xxs: '-inset-0.5',
    xs: '-inset-1',
    sm: '-inset-1.5',
    md: '-inset-2',
    lg: '-inset-2.5',
    xl: '-inset-3.5'
  };

  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const frameId = frameItem?.id;

  // Scale factor for particles and helmet
  const isMini = size === 'xxs' || size === 'xs';
  const isLarge = size === 'lg' || size === 'xl';

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {/* ========================================================================= */}
      {/* 1. VÒNG HÀO QUANG VÀ CÁC LỚP KỸ XẢO ĐỒ HỌA ĐỘC QUYỀN                     */}
      {/* ========================================================================= */}
      {frameItem && (
        <>
          {/* Lớp Hào Quang Nền Đa Tầng (Deep Backlight Halo) */}
          <div 
            className={`absolute ${ringSizes[size]} rounded-full blur-md opacity-85 pointer-events-none transition-all duration-700 animate-pulse ${
              frameItem.frameAuraClass || 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600'
            }`} 
          />

          {/* Lớp Hào Quang Tỏa Sâu Siêu Rộng (Ambient Atmospheric Glow) */}
          <div 
            className={`absolute -inset-2.5 sm:-inset-3.5 rounded-full blur-xl opacity-40 pointer-events-none ${
              frameItem.frameAuraClass || 'bg-gradient-to-tr from-cyan-400 to-purple-600'
            }`}
          />

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 1: MŨ CHIẾN BINH VŨ TRỤ HAEVY (HOLO TROOPER)             */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_holo_trooper' && (
            <>
              {/* Tia chiếu Laser Hologram hình nón phát ra từ góc dưới */}
              <div className="absolute -bottom-1 -left-1 w-12 h-16 sm:w-16 sm:h-20 pointer-events-none overflow-hidden z-20 opacity-70">
                <div 
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(45deg, rgba(6,182,212,0.6) 0%, rgba(56,189,248,0.2) 50%, transparent 80%)',
                    clipPath: 'polygon(0% 100%, 100% 15%, 45% 0%)'
                  }}
                />
              </div>

              {/* Vòng quét quỹ đạo Hologram công nghệ tương lai */}
              <div className="absolute -inset-2 sm:-inset-2.5 rounded-full border border-dashed border-cyan-400/50 pointer-events-none animate-[spin_12s_linear_infinite]" />

              {/* Mũ Chiến Binh Hologram 3D bay bồng bềnh ở góc dưới trái */}
              <div className={`absolute ${
                size === 'xxs' ? '-bottom-1.5 -left-1.5' :
                size === 'xs' ? '-bottom-2 -left-2' :
                size === 'sm' ? '-bottom-2.5 -left-2.5' :
                size === 'md' ? '-bottom-3 -left-3' :
                size === 'lg' ? '-bottom-3.5 -left-3.5' :
                '-bottom-4 -left-4'
              } z-30 pointer-events-none transition-transform duration-300 hover:scale-110`}>
                <div className="animate-[bounce_4s_ease-in-out_infinite]">
                  <HoloTrooperHelmet 
                    size={size === 'xxs' || size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'md' ? 'md' : size === 'lg' ? 'lg' : 'xl'} 
                    showPedestal={true} 
                  />
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 2: THIÊN HÀ TINH TÚ (COSMIC STARLIGHT)                  */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_cosmic_starlight' && (
            <>
              {/* Quỹ đạo hành tinh 1 & 2 xoay vòng 360 độ */}
              <div className="absolute -inset-2.5 sm:-inset-3 pointer-events-none animate-[spin_7s_linear_infinite]">
                {/* Vệ tinh Cyan Tinh Cầu */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] flex items-center justify-center border border-white">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                </div>
                {/* Vệ tinh Hồng Thiên Hà */}
                <div className="absolute bottom-0 right-1 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6] border border-white/80" />
                {/* Vệ tinh Tím Tinh Vân */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#c084fc]" />
              </div>

              {/* Vòng hào quang bụi sao vũ trụ xoay ngược chiều */}
              <div className="absolute -inset-1.5 rounded-full border border-purple-400/40 pointer-events-none animate-[spin_12s_linear_infinite_reverse]" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 3: RỒNG VÀNG HOÀNG GIA (DRAGON GOLD)                    */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_dragon_gold' && (
            <>
              {/* Vòng hào quang kim quang 24K xoay chuyển */}
              <div className="absolute -inset-2.5 sm:-inset-3 pointer-events-none animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-300 shadow-[0_0_14px_#f59e0b] border-2 border-white flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-yellow-100 animate-ping" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] border border-white/80" />
              </div>

              {/* Vương Miện Rồng Hoàng Kim ở đỉnh đầu avatar */}
              {!isMini && (
                <div className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
                  <span className="text-xs sm:text-sm animate-pulse">👑</span>
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 4: NGỌN LỬA PHƯỢNG HOÀNG (PHOENIX FIRE)                 */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_phoenix_fire' && (
            <>
              {/* Tàn tro ngọn lửa bùng cháy */}
              <div className="absolute -inset-2.5 sm:-inset-3.5 pointer-events-none animate-[pulse_1.2s_ease-in-out_infinite]">
                <div className="absolute -top-1.5 right-1/4 w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_14px_#f97316] border border-yellow-200 animate-bounce" />
                <div className="absolute -bottom-1 left-1/4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] border border-orange-200" />
                <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]" />
              </div>

              {/* Ngọn lửa phượng hoàng ở góc */}
              {!isMini && (
                <div className="absolute -top-2 -right-1 z-30 pointer-events-none animate-bounce">
                  <span className="text-xs sm:text-sm drop-shadow-[0_0_8px_#ea580c]">🔥</span>
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 5: KIM CƯƠNG BĂNG TUYẾT (ICE CRYSTAL)                   */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_ice_crystal' && (
            <>
              <div className="absolute -inset-2.5 sm:-inset-3 pointer-events-none animate-[spin_12s_linear_infinite]">
                <div className="absolute top-0 right-1 text-[10px] sm:text-xs drop-shadow-[0_0_8px_#38bdf8]">❄️</div>
                <div className="absolute bottom-0 left-1 text-[9px] sm:text-xs drop-shadow-[0_0_8px_#7dd3fc]">💎</div>
                <div className="absolute top-1/2 -left-1 text-[8px] sm:text-[10px]">✨</div>
              </div>

              {/* Lớp sương giá băng tuyết */}
              <div className="absolute -inset-1 rounded-full border border-sky-300/40 pointer-events-none animate-pulse" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 6: CYBER MATRIX NEON LASER                               */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_cyber_neon' && (
            <>
              {/* Viền góc ngắm HUD tương lai */}
              <div className="absolute -inset-2 pointer-events-none border border-cyan-400/90 rounded-2xl animate-pulse shadow-[0_0_16px_rgba(6,182,212,0.85)]">
                {/* Góc ngắm HUD Cyber */}
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-white" />
              </div>

              {/* Tia Laser quét dữ liệu ngang */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_8px_#06b6d4] pointer-events-none animate-[pulse_2s_ease-in-out_infinite] top-1/2 -translate-y-1/2" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 7: HOA ANH ĐÀO HUYỀN VŨ (SAKURA BLOSSOM)                */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_sakura_blossom' && (
            <>
              <div className="absolute -inset-2.5 pointer-events-none animate-[spin_15s_linear_infinite]">
                <div className="absolute top-0 left-1 text-[10px] sm:text-xs drop-shadow-[0_0_6px_#f472b6]">🌸</div>
                <div className="absolute bottom-1 right-0 text-[10px] sm:text-xs drop-shadow-[0_0_6px_#fb7185]">🌸</div>
                <div className="absolute top-1/2 right-0 text-[8px] sm:text-[10px]">✨</div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-pink-300/50 pointer-events-none animate-pulse" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 8: HỐ ĐEN TỬ THẦN (BLACK HOLE)                          */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_black_hole' && (
            <>
              <div className="absolute -inset-2.5 pointer-events-none animate-[spin_4s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-violet-400 blur-[1px] shadow-[0_0_10px_#a855f7]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-fuchsia-500 blur-[1px] shadow-[0_0_8px_#d946ef]" />
              </div>
              <div className="absolute -inset-1 rounded-full border border-violet-500/60 pointer-events-none animate-[spin_8s_linear_infinite_reverse]" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 9: HOA SEN NGỌC BÍCH (JADE LOTUS)                       */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_jade_lotus' && (
            <>
              <div className="absolute -inset-2.5 pointer-events-none animate-[spin_16s_linear_infinite]">
                <div className="absolute top-0 right-1 text-[10px] sm:text-xs drop-shadow-[0_0_8px_#10b981]">🪷</div>
                <div className="absolute bottom-0 left-1 text-[8px] sm:text-[10px] drop-shadow-[0_0_6px_#34d399]">🍃</div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-emerald-400/40 pointer-events-none animate-pulse" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 10: BÃO SẤM SÉT (ELECTRIC STORM)                        */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_electric_storm' && (
            <>
              <div className="absolute -inset-2.5 pointer-events-none animate-[spin_6s_linear_infinite]">
                <div className="absolute top-0 left-1 text-[10px] sm:text-xs drop-shadow-[0_0_8px_#eab308]">⚡</div>
                <div className="absolute bottom-0 right-1 text-[10px] sm:text-xs drop-shadow-[0_0_8px_#38bdf8]">⚡</div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-yellow-400/50 pointer-events-none animate-ping opacity-30" />
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* KHUNG 11: MECHA GUNDAM CHIẾN HẠM                              */}
          {/* ------------------------------------------------------------- */}
          {frameId === 'frame_mecha_gundam' && (
            <>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-xs drop-shadow-[0_0_8px_#ef4444] animate-bounce">
                🛡️
              </div>
              <div className="absolute -inset-1.5 rounded-2xl border border-red-500/60 pointer-events-none animate-pulse" />
            </>
          )}

          {/* Fallback orbiting orb for any custom frame */}
          {frameItem?.frameOrbClass && !['frame_holo_trooper', 'frame_cosmic_starlight', 'frame_dragon_gold', 'frame_phoenix_fire', 'frame_ice_crystal', 'frame_cyber_neon', 'frame_sakura_blossom', 'frame_black_hole', 'frame_jade_lotus', 'frame_electric_storm', 'frame_mecha_gundam'].includes(frameId || '') && (
            <div className="absolute -inset-2 pointer-events-none animate-[spin_8s_linear_infinite]">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${frameItem.frameOrbClass}`} />
            </div>
          )}
        </>
      )}

      {/* Legacy fallback halo */}
      {!frameItem && legacyTheme && (
        <div 
          className={`absolute ${ringSizes[size]} rounded-full blur-md opacity-70 pointer-events-none transition-all duration-700 animate-pulse ${legacyTheme.avatarAuraClass || 'bg-purple-600'}`} 
        />
      )}

      {/* ========================================================================= */}
      {/* 2. HỘP AVATAR CHÍNH (ẢNH HOẶC CHỮ CÁI ĐẦU)                                */}
      {/* ========================================================================= */}
      <div 
        className={`relative z-10 overflow-hidden shadow-2xl flex items-center justify-center font-bold text-white transition-all duration-300 group-hover:scale-105 ${sizeClasses[size]} ${
          frameItem 
            ? `${frameItem.frameRingClass || 'border-2 border-amber-400 ring-2 ring-amber-300'}`
            : legacyTheme 
            ? `ring-2 ${legacyTheme.avatarRingClass}`
            : 'border border-zinc-700 bg-zinc-800'
        }`}
      >
        {photoURL ? (
          <img 
            src={photoURL} 
            alt={displayName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-black ${
            frameItem 
              ? `bg-gradient-to-tr ${frameItem.previewColor}`
              : legacyTheme 
              ? `bg-gradient-to-tr ${legacyTheme.previewColor}`
              : 'bg-gradient-to-tr from-sky-600 to-indigo-600'
          }`}>
            {initial}
          </div>
        )}

        {/* Shimmer Light Sweep Effect (Ánh sáng quét qua mặt gương kính) */}
        {frameItem && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none mix-blend-overlay -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        )}
        
        {/* Subtle Vignette Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 3. HUY HIỆU GÓC KHUNG AVATAR                                              */}
      {/* ========================================================================= */}
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 z-30 flex items-center gap-0.5">
          {frameItem?.frameDecorationEmoji && (
            <span 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shadow-xl border border-white/40 bg-zinc-950/95 backdrop-blur-md transition-transform hover:scale-125"
              title={frameItem.name}
            >
              {frameItem.frameDecorationEmoji}
            </span>
          )}
          {!frameItem && legacyTheme && (
            <span 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shadow-xl border border-white/40 bg-zinc-950/95 backdrop-blur-md"
              title={legacyTheme.name}
            >
              {legacyTheme.entranceIcon}
            </span>
          )}
          {isVip && !frameItem && !legacyTheme && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg border border-zinc-900">
              <Crown size={10} className="text-zinc-950 fill-zinc-950" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

