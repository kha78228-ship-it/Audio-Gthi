import React from 'react';
import { 
  Sparkles, 
  PenLine, 
  Flame, 
  Camera, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Zap, 
  Globe2, 
  Orbit, 
  ArrowRight, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { MorningSoundscape } from '../types';
import { HaevySpaceLogo } from './HaevySpaceLogo';

interface HaevySpacePortalHubProps {
  onSelectCanvas: (presetToLoad?: string) => void;
  onSelectMascot: () => void;
  onSelectMagicAR: () => void;
  onStartCamera: () => void;
  isCameraActive: boolean;
  isCameraLoading: boolean;
  soundscape: MorningSoundscape;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onChangeSoundscape: (sound: MorningSoundscape) => void;
  onShareToCommunity?: (imageUrl: string, suggestedContent?: string, tag?: string) => void;
  onToast: (msg: string) => void;
}

export function HaevySpacePortalHub({
  onSelectCanvas,
  onSelectMascot,
  onSelectMagicAR,
  onStartCamera,
  isCameraActive,
  isCameraLoading,
  soundscape,
  isSoundMuted,
  onToggleSound,
  onChangeSoundscape,
  onToast
}: HaevySpacePortalHubProps) {
  return (
    <div 
      id="haevy-space-portal-hub"
      className="absolute inset-0 z-30 flex flex-col items-center w-full max-w-full px-3.5 sm:px-6 md:px-8 pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-16 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white overflow-y-auto overflow-x-hidden touch-pan-y overscroll-x-none custom-scrollbar animate-in fade-in duration-300"
    >
      
      {/* Background Glows strictly clipped so they never bleed or cause horizontal overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-6xl w-full max-w-full flex flex-col items-center text-center py-2 sm:py-6 z-10 box-border overflow-x-hidden">
        
        {/* 🌌 FLAGSHIP HAEVY SPACE 5D HERO LOGO */}
        <div className="mb-5 sm:mb-8 max-w-full overflow-hidden">
          <HaevySpaceLogo variant="hero" size="xl" showSubtitle={true} animated={true} />
        </div>

        <p className="text-xs sm:text-base text-zinc-300 max-w-2xl leading-relaxed mb-4 sm:mb-6 px-2">
          Chọn 1 trong 3 không gian trải nghiệm thực tế ảo AR 5D độc bản bên dưới để bắt đầu:
        </p>

        {/* 🌟 Nút / Banner Chuyển Chế Độ Hệ Sinh Thái Haevy - Không bao giờ biến mất */}
        <div className="w-full max-w-4xl mb-6 sm:mb-8 p-3 sm:p-4 rounded-3xl bg-zinc-950/90 border border-amber-500/35 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/25 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <span>Hệ Sinh Thái Haevy</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/30">13 Chế Độ</span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400">Chuyển đổi tức thì sang Âm Nhạc, AI Hub, Tin Nhắn, VIP, Games...</p>
            </div>
          </div>

          <button
            id="portal-modes-btn"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('haevy-open-quick-mode-switcher'));
              }
            }}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ring-1 ring-amber-400/40"
            title="Mở bảng chọn 13 Chế độ trong Hệ Sinh Thái Haevy"
          >
            <Layers size={15} className="text-black shrink-0" />
            <span>Chuyển Chế Độ Ngay</span>
          </button>
        </div>

        {/* 🌟 3 MỤC CHÍNH ĐỘC BẢN (MỤC 1, MỤC 2 & MỤC 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-7 w-full max-w-full text-left mb-6 sm:mb-12">
          
          {/* ========================================================================= */}
          {/* MỤC 1: ✍️ BẢNG VẼ TRONG KHÔNG GIAN 3D & THƯ PHÁP QUANG HỌC */}
          {/* ========================================================================= */}
          <div 
            onClick={() => onSelectCanvas()}
            className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black border-2 border-cyan-500/40 hover:border-cyan-400 p-4 sm:p-6 md:p-7 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden gpu-accelerated w-full max-w-full box-border"
          >
            <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 border border-cyan-400/50 group-hover:scale-105 transition-transform p-2.5 sm:p-3">
                  <PenLine size={24} className="sm:w-[26px] sm:h-[26px]" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[11px] sm:text-xs font-black">
                  MỤC 1
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-200 transition-colors mb-2">
                ✍️ Vẽ 3D & Thư Pháp AR
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4 sm:mb-5">
                Phóng bút trong không gian 3 chiều bằng cử chỉ không chạm hoặc cảm ứng. 10 cọ hạt quang học sống động, nhận diện chữ viết AI OCR và xuất Hologram 360°.
              </p>

              <div className="space-y-2 mb-4 sm:mb-5">
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span>Vẽ không chạm 60-120 FPS qua cử chỉ Pinch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span>10 cọ quang học: Laser, Bụi sao, Plasma, Matrix</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                  <span>Thư pháp phong thủy: Tâm An, Phúc Lộc, Zen</span>
                </div>
              </div>

              {/* Quick Presets Buttons */}
              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 mb-4 sm:mb-5">
                <div className="text-[10px] font-bold text-cyan-400 mb-1.5">MẪU VẼ NHANH:</div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { key: 'tam_an', label: '🍃 Tâm An' },
                    { key: 'haevy_space', label: '✨ Haevy' },
                    { key: 'dragon', label: '🐉 Rồng 3D' }
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCanvas(p.key);
                      }}
                      className="py-1.5 px-1 rounded-xl bg-zinc-900 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/50 text-zinc-200 hover:text-cyan-300 font-bold transition-all text-center text-[10px] active:scale-95 truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCanvas();
              }}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 group-hover:from-cyan-400 group-hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <PenLine size={16} />
              <span>Vào Bảng Vẽ 3D →</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* MỤC 2: 🐲 TƯƠNG TÁC LINH VẬT 5D HAEVY SON & MÔ PHỎNG VẬT LÝ 3D */}
          {/* ========================================================================= */}
          <div 
            onClick={() => onSelectMascot()}
            className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black border-2 border-amber-500/40 hover:border-amber-400 p-4 sm:p-6 md:p-7 shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden gpu-accelerated w-full max-w-full box-border"
          >
            <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 border border-amber-400/50 group-hover:scale-105 transition-transform p-2.5 sm:p-3">
                  <Flame size={24} className="sm:w-[26px] sm:h-[26px] animate-pulse" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] sm:text-xs font-black">
                  MỤC 2
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-200 transition-colors mb-2">
                ✨ Linh Vật 5D & Vật Lý 3D
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4 sm:mb-5">
                1 Linh vật 5D Kim Long Chibi duy nhất kết hợp <strong>Động cơ Vật Lý 3D</strong> chân thực: trọng lực, khối lượng, quán tính ném, va chạm phản xạ ngọc cầu và kẹo sao.
              </p>

              <div className="space-y-2 mb-4 sm:mb-5">
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Động cơ Vật Lý: Trọng lực Trái Đất, Mặt Trăng, Quăng Ném</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Va chạm nảy: Ngọc Pha Lê, Kẹo Sao, Khối Lượng Tử</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-200">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>4 Dạng Biến Hình 5D & 8 Cử Chỉ: Chữ V ✌️, Chạm tay ✋, Thiền 🧘</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 mb-4 sm:mb-5">
                <div className="text-[10px] font-bold text-amber-400 mb-1">TÍNH NĂNG 5D:</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-300 gap-1 flex-wrap xs:flex-nowrap">
                  <span>⚛️ 3D Physics</span>
                  <span>🌌 4 Môi Trường</span>
                  <span>🔮 Phản hồi Rung</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectMascot();
              }}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 group-hover:from-amber-400 group-hover:to-orange-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-yellow-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Flame size={16} />
              <span>Gặp Linh Vật 5D →</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* MỤC 3: 🧙‍♂️ PHÉP THUẬT AR 2 BÀN TAY (DOCTOR STRANGE & TIA SÉT NĂNG LƯỢNG) */}
          {/* ========================================================================= */}
          <div 
            onClick={() => onSelectMagicAR()}
            className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black border-2 border-orange-500/50 hover:border-orange-400 p-4 sm:p-6 md:p-7 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden gpu-accelerated w-full max-w-full box-border"
          >
            <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/15 rounded-full blur-3xl group-hover:bg-orange-500/25 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/40 border border-orange-400/60 group-hover:scale-105 transition-transform p-2.5 sm:p-3">
                  <Zap size={24} className="sm:w-[26px] sm:h-[26px] animate-pulse text-yellow-300" />
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/60 text-orange-300 text-[11px] sm:text-xs font-black animate-pulse">
                  MỤC 3 • MỚI NHẤT
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-orange-200 transition-colors mb-2">
                🧙‍♂️ Phép Thuật AR 2 Tay
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4 sm:mb-5">
                Nhận diện <strong>đồng thời 2 bàn tay</strong> với 2 trạng thái phép thuật quang học huyền diệu chuẩn kỹ xảo điện ảnh Marvel:
              </p>

              <div className="space-y-2 mb-4 sm:mb-5">
                <div className="flex items-start gap-2 text-xs text-zinc-200">
                  <Zap size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                  <span><strong>2 Tay Chụm Lại:</strong> Khối tia sét hồ quang vàng cam & lưới dữ liệu chằng chịt</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-zinc-200">
                  <ShieldCheck size={14} className="text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>2 Tay Mở Rộng:</strong> 2 Vòng tròn phép thuật Doctor Strange xoay đa tầng rực lửa</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-zinc-200">
                  <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Tương tác Camera AR thật hoặc kéo mô phỏng cảm ứng 2 tay</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 mb-4 sm:mb-5">
                <div className="text-[10px] font-bold text-orange-400 mb-1">KỸ XẢO PHÉP THUẬT:</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-300 gap-1 flex-wrap xs:flex-nowrap">
                  <span>⚡ Tia Sét Hồ Quang</span>
                  <span>🛡️ Khiên Mandala</span>
                  <span>🔥 Doctor Strange</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectMagicAR();
              }}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 group-hover:from-orange-400 group-hover:to-red-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Zap size={16} />
              <span>Thi Triển Phép Thuật AR 2 Tay →</span>
            </button>
          </div>

        </div>

        {/* Ambient Soundscapes Quick Bar */}
        <div className="w-full max-w-full rounded-2xl bg-zinc-900/70 border border-zinc-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-left overflow-hidden box-border">
          <div className="flex items-center gap-2 shrink-0">
            <Volume2 size={16} className="text-cyan-400" />
            <span className="text-xs font-bold text-zinc-200">Âm Thanh Không Gian:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ocean_waves', label: '🌊 Sóng Tinh Vân' },
              { id: 'forest_birds', label: '🌲 Rừng Thiền Viện' },
              { id: 'singing_bowl', label: '🧘 Chuông Xoay Tây Tạng' },
              { id: 'rain_zen', label: '🌧️ Mưa Ngân Hà' }
            ].map(snd => (
              <button
                key={snd.id}
                onClick={() => onChangeSoundscape(snd.id as any)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                  soundscape === snd.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {snd.label}
              </button>
            ))}

            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-xl border text-xs transition-all ${
                !isSoundMuted ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isSoundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
