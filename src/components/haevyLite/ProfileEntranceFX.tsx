import React, { useEffect, useState } from 'react';
import { X, Sparkles, Orbit, Rocket, Star, Zap, Flame, Snowflake, Cpu } from 'lucide-react';
import { getEntranceAnimation, getShopItem, getThemeBundle } from './themeBundles';
import { useAuth } from '../../context/AuthContext';

interface ProfileEntranceFXProps {
  animationId?: string | null;
  entranceAnimId?: string | null;
  themeId?: string | null;
  userName?: string;
  userPhoto?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export function ProfileEntranceFX({
  animationId,
  entranceAnimId,
  themeId,
  userName,
  userPhoto,
  isOpen = true,
  onClose,
  onComplete
}: ProfileEntranceFXProps) {
  const { user, activeEntranceAnimation } = useAuth();
  const effectiveAnimId = animationId || entranceAnimId || themeId || activeEntranceAnimation;
  const effectiveUserName = userName || user?.displayName || 'Phi Hành Gia Haevy';
  const effectiveUserPhoto = userPhoto !== undefined ? userPhoto : user?.photoURL;
  
  const animItem = getEntranceAnimation(effectiveAnimId) || getShopItem(effectiveAnimId);
  const legacyTheme = !animItem && effectiveAnimId ? getThemeBundle(effectiveAnimId) : null;

  const [progress, setProgress] = useState(100);

  // Tự động đóng hoạt ảnh sau 4.2 giây
  useEffect(() => {
    if (!isOpen || (!animItem && !legacyTheme)) return;
    setProgress(100);

    const totalDuration = 4200;
    const intervalTime = 50;
    const step = (intervalTime / totalDuration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev > step ? prev - step : 0));
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      onClose?.();
      onComplete?.();
    }, totalDuration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [isOpen, animItem, legacyTheme, onClose, onComplete]);

  if (!isOpen || (!animItem && !legacyTheme)) return null;

  const animId = animItem?.id;

  const title = animItem?.entranceTitle || legacyTheme?.entranceTitle || 'Khai Mở Không Gian';
  const subtitle = animItem?.entranceSubtitle || legacyTheme?.entranceSubtitle || 'Chào mừng bạn quay trở lại';
  const iconEmoji = animItem?.entranceIcon || legacyTheme?.entranceIcon || '✨';
  const badge = animItem?.badge || legacyTheme?.badge || '✨ ĐẶC BIỆT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto overflow-hidden animate-in fade-in duration-500">
      {/* Nền làm mờ sâu */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" />

      {/* 1. Hiệu ứng môi trường riêng cho từng Hoạt ảnh mở đầu */}
      
      {/* Cổng Không Gian Vũ Trụ (Nebula Stargate) */}
      {animId === 'entrance_nebula_portal' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-80 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-white -rotate-45 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute top-1/2 -right-20 w-96 h-0.5 bg-gradient-to-r from-purple-500 via-pink-400 to-white rotate-12 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          <div className="absolute bottom-1/3 left-10 w-72 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-white -rotate-12 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-900/40 via-indigo-900/50 to-pink-900/30 blur-3xl animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-purple-500/30 animate-pulse" />
        </div>
      )}

      {/* Lôi Thần Giáng Thế (Zeus Thunder Shockwave) */}
      {animId === 'entrance_thunder_zeus' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
          <div className="absolute top-10 left-1/4 w-0.5 h-72 bg-sky-300 shadow-[0_0_20px_#38bdf8] rotate-45 animate-[ping_1.8s_ease-in-out_infinite]" />
          <div className="absolute bottom-10 right-1/4 w-0.5 h-80 bg-indigo-300 shadow-[0_0_25px_#818cf8] -rotate-30 animate-[ping_2s_ease-in-out_infinite_0.7s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border-2 border-sky-400/40 animate-ping opacity-30" />
        </div>
      )}

      {/* Cánh Phượng Hoàng Tái Sinh (Phoenix Wings) */}
      {animId === 'entrance_phoenix_rebirth' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-red-600/30 via-orange-600/30 to-amber-500/20 blur-3xl animate-pulse" />
          {/* Tàn tro lửa bay */}
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_15px_#f97316] animate-bounce" />
          <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-ping" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#ef4444] animate-bounce" />
        </div>
      )}

      {/* Cực Quang Bắc Cực (Aurora Sky) */}
      {animId === 'entrance_aurora_sky' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/20 via-teal-500/15 to-transparent blur-2xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-emerald-600/20 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 text-emerald-200 text-lg animate-pulse">✨</div>
          <div className="absolute top-1/3 right-1/4 text-teal-200 text-sm animate-ping">❄️</div>
          <div className="absolute bottom-1/4 left-1/3 text-sky-200 text-base animate-pulse">✨</div>
        </div>
      )}

      {/* Ma Trận Hologram 3D (Cyber Grid) */}
      {animId === 'entrance_cyber_matrix' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-3xl" />
        </div>
      )}

      {/* 2. Hộp Card Hoạt Ảnh Trung Tâm */}
      <div className={`relative z-10 max-w-md w-full mx-4 p-6 sm:p-8 rounded-3xl bg-zinc-950/85 border backdrop-blur-xl text-center space-y-6 animate-in zoom-in-95 duration-500 ${
        animItem?.entranceGlowClass || 'border-purple-500/40 shadow-[0_0_50px_rgba(147,51,234,0.4)]'
      }`}>
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-white flex items-center gap-1.5 shadow-sm">
            <Orbit size={13} className="animate-spin text-amber-300" />
            {badge}
          </span>
          <button
            onClick={() => {
              onClose?.();
              onComplete?.();
            }}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Đóng hoạt ảnh"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar Trung tâm với vòng xoay hoành tráng */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className={`absolute -inset-4 rounded-full blur-xl opacity-75 animate-ping ${
            animId === 'entrance_thunder_zeus' ? 'bg-blue-500/40' :
            animId === 'entrance_phoenix_rebirth' ? 'bg-orange-500/40' :
            animId === 'entrance_aurora_sky' ? 'bg-emerald-500/40' :
            animId === 'entrance_cyber_matrix' ? 'bg-cyan-500/40' :
            'bg-purple-500/40'
          }`} />

          <div className={`absolute -inset-2 rounded-full animate-[spin_6s_linear_infinite] ${
            animId === 'entrance_thunder_zeus' ? 'bg-gradient-to-r from-blue-500 via-sky-300 to-indigo-500' :
            animId === 'entrance_phoenix_rebirth' ? 'bg-gradient-to-r from-red-500 via-orange-400 to-amber-500' :
            animId === 'entrance_aurora_sky' ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400' :
            animId === 'entrance_cyber_matrix' ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400' :
            'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500'
          }`} />

          <div className="relative w-full h-full rounded-full overflow-hidden p-1 bg-zinc-950 border-2 border-white/40 shadow-2xl">
            {effectiveUserPhoto ? (
              <img src={effectiveUserPhoto} alt={effectiveUserName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-white font-black text-2xl">
                {(effectiveUserName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Icon nổi bên góc avatar */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center text-sm shadow-xl animate-bounce">
            {iconEmoji}
          </div>
        </div>

        {/* Tiêu đề & Lời chào hoạt ảnh */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            {title}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            {effectiveUserName}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300/90 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Badge xác nhận hoạt ảnh đã mở */}
        <div className="py-2 px-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-[11px] text-zinc-300 font-medium flex items-center justify-center gap-2">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span>Hoạt Ảnh Mở Đầu Đã Kích Hoạt ({animItem?.name || 'Hiệu ứng mở tài khoản'})</span>
        </div>

        {/* Nút hành động & Thanh tiến trình tự động đóng */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose?.();
              onComplete?.();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Rocket size={16} />
            <span>Vào Tài Khoản Ngay</span>
          </button>

          {/* Thanh đếm ngược đóng */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500">Tự động hoàn tất sau vài giây</p>
        </div>
      </div>
    </div>
  );
}
