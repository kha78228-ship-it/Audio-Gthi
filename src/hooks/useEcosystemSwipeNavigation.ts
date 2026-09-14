import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Headphones, 
  MessageSquare, 
  Heart, 
  Wallet, 
  Moon, 
  GitFork, 
  Mic, 
  Crown, 
  ShieldCheck, 
  LifeBuoy, 
  Gamepad2,
  Compass
} from 'lucide-react';
import { HaevyMode } from '../App';
import { haptics } from '../utils/haptics';

export interface SwipeEcosystemMode {
  id: HaevyMode;
  name: string;
  shortName: string;
  icon: any;
  badge: string;
  gradient: string;
  accentText: string;
  description: string;
}

// Master ordered list of ecosystem modes for horizontal swipe navigation
export const SWIPE_ECOSYSTEM_MODES: SwipeEcosystemMode[] = [
  {
    id: 'portal',
    name: 'Haevy Portal',
    shortName: 'Trang Chủ',
    icon: Compass,
    badge: 'Cổng Vũ Trụ',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    accentText: 'text-amber-400',
    description: 'Cổng tổng hợp đa chiều & trung tâm hệ sinh thái'
  },
  {
    id: 'haevy_lite',
    name: 'Xu Haevy Lite',
    shortName: 'Xu Lite',
    icon: Sparkles,
    badge: 'Vũ Trụ 🌌',
    gradient: 'from-purple-600 via-indigo-600 to-pink-500',
    accentText: 'text-purple-400',
    description: 'Sưu tập hiệu ứng hào quang & combo hoạt ảnh'
  },
  {
    id: 'haevy_ai',
    name: 'Haevy AI Master',
    shortName: 'Haevy AI',
    icon: BrainCircuit,
    badge: 'AI Toàn Năng',
    gradient: 'from-purple-500 via-indigo-500 to-pink-500',
    accentText: 'text-purple-400',
    description: 'Trí tuệ nhân tạo học sâu & tâm sự thấu cảm'
  },
  {
    id: 'audio',
    name: 'Haevy Audio',
    shortName: 'Audio Hi-Fi',
    icon: Headphones,
    badge: 'Lossless',
    gradient: 'from-indigo-500 via-blue-600 to-purple-600',
    accentText: 'text-indigo-400',
    description: 'Kho nhạc chất lượng cao, truyện đêm & podcast'
  },
  {
    id: 'messages',
    name: 'Haevy Message',
    shortName: 'Tin Nhắn',
    icon: MessageSquare,
    badge: 'Cộng Đồng',
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    accentText: 'text-sky-400',
    description: 'Trò chuyện kết nối & chia sẻ khoảnh khắc ảnh'
  },
  {
    id: 'couple',
    name: 'I Love Haevy',
    shortName: 'Cặp Đôi',
    icon: Heart,
    badge: 'Yêu Thương',
    gradient: 'from-rose-500 via-pink-500 to-red-600',
    accentText: 'text-rose-400',
    description: 'Không gian tình nhân, đếm ngày yêu & kỷ niệm'
  },
  {
    id: 'finance',
    name: 'Haevy Finance',
    shortName: 'Tài Chính',
    icon: Wallet,
    badge: '6 Hũ Tiền',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accentText: 'text-emerald-400',
    description: 'Quản lý thu chi thông minh & lập kế hoạch chi tiêu'
  },
  {
    id: 'spiritual',
    name: 'Haevy Spiritual',
    shortName: 'Tâm Linh',
    icon: Moon,
    badge: 'Tarot 3D',
    gradient: 'from-purple-600 via-indigo-600 to-pink-600',
    accentText: 'text-purple-300',
    description: 'Tarot 3D, tử vi, chiêm tinh & tần số Solfeggio'
  },
  {
    id: 'family_tree',
    name: 'Haevy Family Tree',
    shortName: 'Gia Phả',
    icon: GitFork,
    badge: 'Dòng Họ',
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    accentText: 'text-amber-500',
    description: 'Phả hệ dòng tộc, ngày giỗ tổ & gia huấn'
  },
  {
    id: 'studio',
    name: 'Haevy Studio',
    shortName: 'AI Voice',
    icon: Mic,
    badge: 'Phòng Thu',
    gradient: 'from-rose-500 via-pink-600 to-purple-600',
    accentText: 'text-pink-400',
    description: 'Sáng tác audio, chuyển văn bản thành giọng đọc AI'
  },
  {
    id: 'space',
    name: 'Haevy Space',
    shortName: 'Không Gian 3D',
    icon: Sparkles,
    badge: '3D AR',
    gradient: 'from-cyan-500 via-teal-500 to-blue-600',
    accentText: 'text-cyan-400',
    description: 'Bảng vẽ không gian 3D AR theo dõi khớp tay'
  },
  {
    id: 'games',
    name: 'Haevy Games',
    shortName: 'Đấu Trường',
    icon: Gamepad2,
    badge: 'Minigame',
    gradient: 'from-indigo-500 via-violet-600 to-purple-600',
    accentText: 'text-indigo-400',
    description: 'Game giải trí, vòng quay may mắn & nhiệm vụ'
  },
  {
    id: 'vip',
    name: 'Haevy VIP Club',
    shortName: 'VIP Club',
    icon: Crown,
    badge: 'Đặc Quyền',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    accentText: 'text-amber-400',
    description: 'Đặc quyền hội viên cao cấp & nạp xu Haevy'
  },
  {
    id: 'admin',
    name: 'Haevy Admin',
    shortName: 'Quản Trị',
    icon: ShieldCheck,
    badge: 'Admin 🛡️',
    gradient: 'from-red-500 via-rose-600 to-red-700',
    accentText: 'text-red-400',
    description: 'Bảng điều khiển quản trị hệ sinh thái'
  },
  {
    id: 'support',
    name: 'Haevy Support',
    shortName: 'Hỗ Trợ',
    icon: LifeBuoy,
    badge: '24/7',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    accentText: 'text-teal-400',
    description: 'Trung tâm trợ giúp & hỗ trợ kỹ thuật'
  }
];

interface UseEcosystemSwipeNavigationOptions {
  currentMode: HaevyMode;
  onSelectMode: (mode: HaevyMode) => void;
  isAdmin?: boolean;
  disabled?: boolean;
}

export function useEcosystemSwipeNavigation({
  currentMode,
  onSelectMode,
  isAdmin = false,
  disabled = false
}: UseEcosystemSwipeNavigationOptions) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('haevy_swipe_nav_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [hudVisible, setHudVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<number>(1); // +1: right to left (next), -1: left to right (prev)
  const [targetPreviewMode, setTargetPreviewMode] = useState<SwipeEcosystemMode | null>(null);

  const hudTimeoutRef = useRef<any>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: EventTarget | null } | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Available modes filtered by permissions
  const availableModes = SWIPE_ECOSYSTEM_MODES.filter(m => {
    if (m.id === 'admin' && !isAdmin) return false;
    return true;
  });

  const currentIndex = availableModes.findIndex(m => m.id === currentMode);
  const currentActiveMode = availableModes[currentIndex !== -1 ? currentIndex : 0];

  const prevIndex = (currentIndex - 1 + availableModes.length) % availableModes.length;
  const nextIndex = (currentIndex + 1) % availableModes.length;

  const prevMode = availableModes[prevIndex];
  const nextMode = availableModes[nextIndex];

  // Helper to trigger HUD briefly
  const triggerHUD = useCallback((duration = 2400) => {
    if (hudTimeoutRef.current) {
      clearTimeout(hudTimeoutRef.current);
    }
    setHudVisible(true);
    hudTimeoutRef.current = setTimeout(() => {
      setHudVisible(false);
    }, duration);
  }, []);

  const goToNextMode = useCallback(() => {
    if (nextMode) {
      setSlideDirection(1);
      haptics.modeSwitch();
      onSelectMode(nextMode.id);
      triggerHUD();
    }
  }, [nextMode, onSelectMode, triggerHUD]);

  const goToPrevMode = useCallback(() => {
    if (prevMode) {
      setSlideDirection(-1);
      haptics.modeSwitch();
      onSelectMode(prevMode.id);
      triggerHUD();
    }
  }, [prevMode, onSelectMode, triggerHUD]);

  const toggleSwipeNav = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haevy_swipe_nav_enabled', String(next));
      } catch {}
      haptics.selection();
      return next;
    });
  }, []);

  // Utility to check if touch begins in an element that should not trigger horizontal navigation
  const isInsideInteractiveOrScrollable = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;

    // Check for interactive elements or drawing canvases
    if (target.closest('input, textarea, select, canvas, [data-no-swipe], .no-swipe, [role="slider"], button.dragging, .audio-waveform, audio, video')) {
      return true;
    }

    // Check if within modal or popups that handle their own gestures
    if (target.closest('[role="dialog"], .modal-container, .drawer-content')) {
      return true;
    }

    // Check if any ancestor is horizontally scrollable (e.g., subtabs, song lists, horizontal carousels)
    let el: HTMLElement | null = target;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const overflowX = style.overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 16) {
        return true;
      }
      el = el.parentElement;
    }

    return false;
  };

  useEffect(() => {
    if (!isEnabled || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchStartRef.current = null;
        isCancelledRef.current = true;
        return;
      }

      const touch = e.touches[0];

      // Edge guard: ignore if starting within 12px of screen edge to prevent fighting iOS Safari back gestures
      if (touch.clientX < 12 || touch.clientX > window.innerWidth - 12) {
        touchStartRef.current = null;
        isCancelledRef.current = true;
        return;
      }

      if (isInsideInteractiveOrScrollable(e.target)) {
        touchStartRef.current = null;
        isCancelledRef.current = true;
        return;
      }

      isCancelledRef.current = false;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        target: e.target
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isCancelledRef.current || !touchStartRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // If vertical movement is dominant, this is a normal scroll -> cancel swipe navigation
      if (absY > 15 && absY > absX * 0.9) {
        isCancelledRef.current = true;
        setIsSwiping(false);
        setSwipeOffset(0);
        setSwipeDirection(null);
        setTargetPreviewMode(null);
        return;
      }

      // If horizontal movement starts to dominate and passes initial threshold
      if (absX > 18 && absX > absY * 1.3) {
        setIsSwiping(true);
        setSwipeOffset(deltaX);
        const dir = deltaX < 0 ? 'left' : 'right';
        setSwipeDirection(dir);
        setTargetPreviewMode(dir === 'left' ? nextMode : prevMode);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || isCancelledRef.current) {
        setIsSwiping(false);
        setSwipeOffset(0);
        setSwipeDirection(null);
        setTargetPreviewMode(null);
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Thresholds:
      // Minimum distance: 52px
      // Horizontal dominance: absX > absY * 1.25
      // Time: under 850ms (quick flick) or distance > 110px
      const isQuickFlick = elapsed < 850 && absX >= 52;
      const isLongDrag = absX >= 110;

      if ((isQuickFlick || isLongDrag) && absX > absY * 1.25) {
        if (deltaX < 0) {
          // Swiped left -> Go to Next Mode
          setSlideDirection(1);
          haptics.modeSwitch();
          onSelectMode(nextMode.id);
          triggerHUD();
        } else {
          // Swiped right -> Go to Previous Mode
          setSlideDirection(-1);
          haptics.modeSwitch();
          onSelectMode(prevMode.id);
          triggerHUD();
        }
      }

      // Reset swipe gesture state
      setIsSwiping(false);
      setSwipeOffset(0);
      setSwipeDirection(null);
      setTargetPreviewMode(null);
      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      setIsSwiping(false);
      setSwipeOffset(0);
      setSwipeDirection(null);
      setTargetPreviewMode(null);
      touchStartRef.current = null;
      isCancelledRef.current = true;
    };

    // Attach passive listeners to window for seamless touch tracking
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
    };
  }, [isEnabled, disabled, nextMode, prevMode, onSelectMode, triggerHUD]);

  return {
    isEnabled,
    toggleSwipeNav,
    isSwiping,
    swipeOffset,
    swipeDirection,
    targetPreviewMode,
    hudVisible,
    setHudVisible,
    triggerHUD,
    slideDirection,
    currentActiveMode,
    prevMode,
    nextMode,
    goToNextMode,
    goToPrevMode,
    availableModes,
    currentIndex
  };
}
