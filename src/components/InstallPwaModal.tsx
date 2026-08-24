import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Maximize, 
  Share2, 
  PlusSquare, 
  Check, 
  X, 
  Sparkles, 
  Monitor, 
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function InstallPwaModal({
  isOpen,
  onClose,
  onToggleFullscreen,
  isFullscreen = false
}: InstallPwaModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Detect iOS vs Android
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    if (isIosDevice) {
      setActiveInstructionTab('ios');
    } else if (isAndroidDevice) {
      setActiveInstructionTab('android');
    } else {
      setActiveInstructionTab('desktop');
    }

    // Check if already in standalone display mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction
      if (isIOS) {
        setActiveInstructionTab('ios');
      } else {
        setActiveInstructionTab('android');
      }
    }
  };

  const handleCopyAppUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Smartphone size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Tải Ứng Dụng Toàn Màn Hình
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
                  Không URL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Chạy độc lập như App Native, ẩn thanh địa chỉ trình duyệt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick 1-Click Browser Fullscreen Action */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Maximize size={14} className="text-amber-400" />
                <span>Chế Độ Toàn Màn Hình Tức Thì</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isFullscreen 
                  ? 'Ứng dụng đang hiển thị chế độ toàn màn hình.' 
                  : 'Bật toàn màn hình ngay trên trình duyệt hiện tại.'}
              </p>
            </div>

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={() => {
                  onToggleFullscreen();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <Maximize size={14} />
                <span>{isFullscreen ? 'Thu nhỏ' : 'Bật Fullscreen'}</span>
              </button>
            )}
          </div>

          {/* Native PWA Prompt Install Button (Android / Chrome) */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-emerald-300">Sẵn Sàng Cài Đặt Tự Động</span>
              </div>
              <p className="text-xs text-zinc-300">
                Thiết bị của bạn hỗ trợ cài đặt tự động. Nhấn bên dưới để thêm Haevy vào màn hình chính ngay!
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 cursor-pointer active:scale-98 transition-all"
              >
                <Download size={15} />
                <span>Cài Đặt Ứng Dụng Haevy (1 Chạm)</span>
              </button>
            </div>
          )}

          {/* Instruction Device Platform Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Smartphone size={14} className="text-amber-400" />
                Hướng dẫn ghim ra màn hình chính (Ẩn thanh link):
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setActiveInstructionTab('android')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeInstructionTab === 'android'
                    ? 'bg-amber-400 text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Android / Chrome</span>
              </button>

              <button
                onClick={() => setActiveInstructionTab('ios')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeInstructionTab === 'ios'
                    ? 'bg-amber-400 text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>iPhone / Safari</span>
              </button>

              <button
                onClick={() => setActiveInstructionTab('desktop')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeInstructionTab === 'desktop'
                    ? 'bg-amber-400 text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Máy Tính / PC</span>
              </button>
            </div>

            {/* Android Instructions */}
            {activeInstructionTab === 'android' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Mở menu trình duyệt Chrome</p>
                    <p className="text-zinc-400">Nhấn vào biểu tượng <strong>3 dấu chấm (⋮)</strong> ở góc trên bên phải màn hình.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính"</p>
                    <p className="text-zinc-400">Chọn mục <strong>"Cài đặt ứng dụng" (Install App)</strong> hoặc <strong>"Thêm vào Màn hình chính" (Add to Home screen)</strong>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-emerald-400">Mở ứng dụng từ màn hình điện thoại</p>
                    <p className="text-zinc-400">Biểu tượng Haevy Audio sẽ xuất hiện trên màn hình điện thoại. Khi mở lên, app sẽ chạy <strong>toàn màn hình 100%, không hiện thanh link web</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {activeInstructionTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Mở trên trình duyệt Safari của iPhone</p>
                    <p className="text-zinc-400">Nhấn vào nút <strong>Chia sẻ (Biểu tượng ô vuông mũi tên lên <Share2 size={12} className="inline text-sky-400" />)</strong> ở thanh dưới cùng Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Chọn "Thêm vào MH chính" (Add to Home Screen)</p>
                    <p className="text-zinc-400">Cuộn xuống và bấm chọn dòng có dấu cộng: <strong>"Thêm vào MH chính"</strong> <PlusSquare size={12} className="inline text-amber-400" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-emerald-400">Trải nghiệm ứng dụng không thanh đường link</p>
                    <p className="text-zinc-400">Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải. Từ lúc này, mở app từ màn hình chính sẽ hoàn toàn không có thanh URL Safari.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Instructions */}
            {activeInstructionTab === 'desktop' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Cài đặt từ thanh địa chỉ trình duyệt</p>
                    <p className="text-zinc-400">Trên Chrome/Edge máy tính, nhấn vào biểu tượng <strong>Cài đặt (Màn hình máy tính có mũi tên xuống <Monitor size={12} className="inline text-amber-400" />)</strong> ở cuối thanh địa chỉ URL.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-emerald-400">Cửa sổ độc lập như ứng dụng Windows/Mac</p>
                    <p className="text-zinc-400">App sẽ mở trong một cửa sổ chuyên dụng không có tab hay thanh tìm kiếm trình duyệt.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Copy Link to open in Safari/Chrome */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopyAppUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Đã sao chép đường link ứng dụng!</span>
                </>
              ) : (
                <>
                  <Globe size={14} className="text-amber-400" />
                  <span>Sao chép link để dán vào Safari / Chrome chính thức</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>PWA Standalone • Không tốn dung lượng</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
