import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mic,
  Compass,
  Layers,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Play,
  Gift,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  playMetallicCardTapSound,
  playChampagnePopSound
} from '../../utils/luxurySoundFX';
import { haptics } from '../../utils/haptics';

export interface HaevyPortalOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateVoiceCommand?: (command: string) => void;
  onToggleVoiceListen?: () => void;
  isVoiceListening?: boolean;
  onTriggerDemoAction?: (stepId: OnboardingStepId) => void;
}

export type OnboardingStepId =
  | 'living-portrait'
  | 'voice-navigation'
  | 'floating-dock'
  | 'ecosystem-bento'
  | 'floating-widgets';

interface OnboardingStepConfig {
  id: OnboardingStepId;
  index: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  interactionHint: string;
  demoButtonLabel: string;
  accentHex: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'living-portrait',
    index: '01',
    category: 'Sân khấu Thị giác 3D',
    title: 'Chân dung Sống động & Ánh sáng Chiaroscuro',
    subtitle: 'Tương tác nghiêng 3D theo cử chỉ chuột · Nghe thử tần số âm thanh',
    description:
      'Sân khấu trung tâm tái hiện chân dung nhân vật và không gian nghệ thuật theo thời gian thực. Di chuyển chuột lên khung hình để cảm nhận chiều sâu 3D và chuyển đổi giữa 3 bối cảnh.',
    interactionHint: 'Di chuột vào khung chân dung hoặc bấm chuyển bối cảnh 01 · 02 · 03 bên dưới.',
    demoButtonLabel: 'Chuyển thử bối cảnh & Nghe sóng âm',
    accentHex: '#F59E0B',
    icon: Sparkles
  },
  {
    id: 'voice-navigation',
    index: '02',
    category: 'Điều khiển Giọng nói AI',
    title: 'Voice Navigation Toàn Hệ Sinh Thái',
    subtitle: 'Ra lệnh bằng giọng nói tiếng Việt tự nhiên · Phản hồi tức thì',
    description:
      'Chỉ cần kích hoạt biểu tượng Micro hoặc nói câu lệnh tự nhiên như "Phát nhạc thư giãn", "Mở bàn học Edu" hay "Bản đồ gia đình" để di chuyển tức thì mà không cần chạm tay.',
    interactionHint: 'Bấm vào nút Micro trên thanh tiêu đề hoặc chạy thử câu lệnh mẫu bên dưới.',
    demoButtonLabel: 'Thử lệnh giọng nói: "Phát nhạc thư giãn"',
    accentHex: '#38BDF8',
    icon: Mic
  },
  {
    id: 'floating-dock',
    index: '03',
    category: 'Điều hướng Thông minh',
    title: 'Floating Dock Tự Thu Gọn & Quick Switcher',
    subtitle: 'Tự động thu gọn khi cuộn trang · Phím tắt toàn cục Alt + M',
    description:
      'Thanh Floating Dock nổi ở cạnh dưới màn hình tự động thu nhỏ khi bạn cuộn đọc nội dung và mở rộng ngay khi chạm vào, giúp chuyển đổi mượt mà giữa các không gian làm việc.',
    interactionHint: 'Thử thu gọn/mở rộng thanh Dock hoặc bấm nút Chuyển nhanh (Alt + M).',
    demoButtonLabel: 'Kích hoạt thử hiệu ứng Floating Dock',
    accentHex: '#A78BFA',
    icon: Command
  },
  {
    id: 'ecosystem-bento',
    index: '04',
    category: 'Kiến trúc Đa phân hệ',
    title: 'Lưới 12 Không Gian Chuyên Biệt',
    subtitle: 'Bố cục Bento bất đối xứng · Hoạt cảnh trực quan theo từng lĩnh vực',
    description:
      'Toàn bộ 12 phân hệ từ Phòng thu Audio 24-bit, Bàn học Haevy Edu, Bản đồ Người thân cho tới Trình duyệt nghiên cứu đều được kết nối đồng bộ. Bạn có thể lọc nhanh theo nhóm nhu cầu.',
    interactionHint: 'Bấm vào các bộ lọc danh mục hoặc biểu tượng chi tiết trên từng thẻ phân hệ.',
    demoButtonLabel: 'Lọc thử nhóm Phân hệ Trọng tâm',
    accentHex: '#10B981',
    icon: Layers
  },
  {
    id: 'floating-widgets',
    index: '05',
    category: 'Công cụ Tức thì',
    title: 'Trợ Lý AI Nổi & Sổ Tay Ghi Chú Nhanh',
    subtitle: 'Luôn sẵn sàng ở góc màn hình · Đồng bộ ý tưởng xuyên suốt',
    description:
      'Ghi lại mọi ý tưởng bất chợt với Sổ tay Ghi chú Nhanh hoặc gọi Trợ lý Phân tích AI bất kỳ lúc nào mà không cần rời khỏi không gian bạn đang làm việc.',
    interactionHint: 'Bấm mở thử hộp Ghi chú Nhanh ở góc dưới bên phải màn hình.',
    demoButtonLabel: 'Mở thử Sổ tay Ghi chú Nhanh',
    accentHex: '#F43F5E',
    icon: Lightbulb
  }
];

export const ONBOARDING_COMPLETED_KEY = 'haevy_portal_onboarding_v1_completed';
export const ONBOARDING_REWARD_CLAIMED_KEY = 'haevy_portal_onboarding_v1_reward_claimed';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const HaevyPortalOnboardingTour: React.FC<HaevyPortalOnboardingTourProps> = ({
  isOpen,
  onClose,
  onSimulateVoiceCommand,
  onToggleVoiceListen,
  onTriggerDemoAction
}) => {
  const { user, addAudioPoints, earnHaevyLiteCoins } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900
  });
  const [isCompletedView, setIsCompletedView] = useState(false);
  const [rewardGrantedThisSession, setRewardGrantedThisSession] = useState(false);
  const [demoFeedbackText, setDemoFeedbackText] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const getUserScopedKey = useCallback(
    (baseKey: string) => {
      return user?.uid ? `${baseKey}_${user.uid}` : baseKey;
    },
    [user?.uid]
  );

  // Reset step state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsCompletedView(false);
      setDemoFeedbackText(null);
    }
  }, [isOpen]);

  // Measure target element bounding rect & scroll smoothly into view
  const updateTargetMeasurement = useCallback(
    (shouldScroll = false) => {
      if (!isOpen || isCompletedView || typeof document === 'undefined') return;
      const step = ONBOARDING_STEPS[currentStepIndex];
      if (!step) return;

      const el = document.querySelector(`[data-onboarding="${step.id}"]`) as HTMLElement | null;
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      if (!el) {
        setSpotlightRect(null);
        return;
      }

      if (shouldScroll) {
        try {
          const rawRect = el.getBoundingClientRect();
          const isFixed =
            window.getComputedStyle(el).position === 'fixed' ||
            Boolean(el.closest('.fixed, header.sticky'));

          if (!isFixed && (rawRect.top < 80 || rawRect.bottom > window.innerHeight - 80)) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          }
        } catch {
          // Ignore scroll errors in restricted containers
        }
      }

      const rect = el.getBoundingClientRect();
      const pad = 10;
      const top = Math.max(8, rect.top - pad);
      const left = Math.max(8, rect.left - pad);
      const width = Math.min(window.innerWidth - left - 8, rect.width + pad * 2);
      const height = Math.min(window.innerHeight - 16, rect.height + pad * 2);

      setSpotlightRect({
        top,
        left,
        width: Math.max(48, width),
        height: Math.max(40, height)
      });
    },
    [isOpen, isCompletedView, currentStepIndex]
  );

  // Trigger scroll & measurement when step changes
  useEffect(() => {
    if (!isOpen || isCompletedView) return;
    setDemoFeedbackText(null);
    updateTargetMeasurement(true);

    const timer1 = setTimeout(() => updateTargetMeasurement(false), 320);
    const timer2 = setTimeout(() => updateTargetMeasurement(false), 650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, isCompletedView, currentStepIndex, updateTargetMeasurement]);

  // Keep spotlight synced on scroll & resize
  useEffect(() => {
    if (!isOpen || isCompletedView) return;

    const handleScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateTargetMeasurement(false);
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, isCompletedView, updateTargetMeasurement]);

  // Keyboard navigation support (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleDismissTour();
      } else if (e.key === 'ArrowRight' && !isCompletedView) {
        e.preventDefault();
        e.stopPropagation();
        handleNextStep();
      } else if (e.key === 'ArrowLeft' && !isCompletedView && currentStepIndex > 0) {
        e.preventDefault();
        e.stopPropagation();
        handlePrevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  });

  const markOnboardingCompleted = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      localStorage.setItem(getUserScopedKey(ONBOARDING_COMPLETED_KEY), 'true');
    } catch {
      // ignore storage errors
    }
  }, [getUserScopedKey]);

  const handleDismissTour = () => {
    playMetallicCardTapSound();
    haptics.light();
    markOnboardingCompleted();
    onClose();
  };

  const handleCompleteAndClaimReward = async () => {
    playChampagnePopSound();
    haptics.success();
    markOnboardingCompleted();

    let newlyRewarded = false;
    try {
      const globalClaimed = localStorage.getItem(ONBOARDING_REWARD_CLAIMED_KEY) === 'true';
      const userClaimed =
        localStorage.getItem(getUserScopedKey(ONBOARDING_REWARD_CLAIMED_KEY)) === 'true';

      if (!globalClaimed || (user?.uid && !userClaimed)) {
        localStorage.setItem(ONBOARDING_REWARD_CLAIMED_KEY, 'true');
        localStorage.setItem(getUserScopedKey(ONBOARDING_REWARD_CLAIMED_KEY), 'true');
        newlyRewarded = true;

        try {
          await addAudioPoints(
            200,
            'Thưởng hoàn thành Hành trình Khám phá Haevy Portal',
            'bonus'
          );
        } catch {
          // fallback if guest
        }
        try {
          await earnHaevyLiteCoins(50, 'Hoàn thành hướng dẫn Haevy Portal lần đầu');
        } catch {
          // fallback if guest
        }
      }
    } catch {
      // ignore
    }

    setRewardGrantedThisSession(newlyRewarded);
    setIsCompletedView(true);
  };

  const handleNextStep = () => {
    playMetallicCardTapSound();
    haptics.selection();
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleCompleteAndClaimReward();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      playMetallicCardTapSound();
      haptics.selection();
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRunLiveDemo = () => {
    playMetallicCardTapSound();
    haptics.medium();

    if (currentStep.id === 'voice-navigation') {
      if (onSimulateVoiceCommand) {
        onSimulateVoiceCommand('Phát nhạc thư giãn');
        setDemoFeedbackText('Đã gửi lệnh mẫu: "Phát nhạc thư giãn" tới hệ thống Voice HUD.');
      } else if (onToggleVoiceListen) {
        onToggleVoiceListen();
        setDemoFeedbackText('Đã bật bộ thu nhận giọng nói trực tiếp.');
      }
    } else if (onTriggerDemoAction) {
      onTriggerDemoAction(currentStep.id);
      const feedbackMap: Record<OnboardingStepId, string> = {
        'living-portrait': 'Đã chuyển đổi bối cảnh chân dung 3D & kích hoạt sóng âm.',
        'voice-navigation': 'Đã kích hoạt thử nghiệm điều khiển giọng nói.',
        'floating-dock': 'Đã chuyển đổi trạng thái thanh Floating Dock thông minh.',
        'ecosystem-bento': 'Đã lọc danh mục phân hệ & làm nổi bật kiến trúc Bento.',
        'floating-widgets': 'Đã mở khung Sổ tay Ghi chú Nhanh ở góc dưới màn hình.'
      };
      setDemoFeedbackText(feedbackMap[currentStep.id]);
    }

    setTimeout(() => {
      updateTargetMeasurement(false);
    }, 250);
  };

  if (!isOpen) return null;

  // Compute smart position for the floating Atelier card so it never covers the spotlight target
  const getCardPositionStyle = (): React.CSSProperties => {
    if (!spotlightRect || viewportSize.width < 768) {
      return {
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)'
      };
    }

    const cardWidth = 430;
    const cardApproxHeight = 330;
    const margin = 20;

    const spaceBelow = viewportSize.height - (spotlightRect.top + spotlightRect.height);
    const spaceAbove = spotlightRect.top;
    const spaceLeft = spotlightRect.left;
    const spaceRight = viewportSize.width - (spotlightRect.left + spotlightRect.width);

    // Prefer placing beside large vertical targets (like Living Portrait) if space permits
    if (spaceLeft >= cardWidth + margin * 2 && spotlightRect.height > 260) {
      return {
        top: `${Math.max(24, Math.min(viewportSize.height - cardApproxHeight - 24, spotlightRect.top + 16))}px`,
        left: `${Math.max(24, spotlightRect.left - cardWidth - margin)}px`
      };
    }

    if (spaceRight >= cardWidth + margin * 2 && spotlightRect.height > 260) {
      return {
        top: `${Math.max(24, Math.min(viewportSize.height - cardApproxHeight - 24, spotlightRect.top + 16))}px`,
        left: `${Math.min(viewportSize.width - cardWidth - 24, spotlightRect.left + spotlightRect.width + margin)}px`
      };
    }

    // Place below target if enough space below
    if (spaceBelow >= cardApproxHeight + margin) {
      const clampedLeft = Math.max(
        24,
        Math.min(
          viewportSize.width - cardWidth - 24,
          spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2
        )
      );
      return {
        top: `${spotlightRect.top + spotlightRect.height + margin}px`,
        left: `${clampedLeft}px`
      };
    }

    // Place above target if enough space above
    if (spaceAbove >= cardApproxHeight + margin) {
      const clampedLeft = Math.max(
        24,
        Math.min(
          viewportSize.width - cardWidth - 24,
          spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2
        )
      );
      return {
        top: `${Math.max(24, spotlightRect.top - cardApproxHeight - margin)}px`,
        left: `${clampedLeft}px`
      };
    }

    // Fallback: anchored top-left or bottom-left away from target center
    const targetCenterX = spotlightRect.left + spotlightRect.width / 2;
    return {
      bottom: '28px',
      left: targetCenterX > viewportSize.width / 2 ? '32px' : `${viewportSize.width - cardWidth - 32}px`
    };
  };

  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] pointer-events-none select-none"
        role="dialog"
        aria-modal="false"
        aria-label="Hướng dẫn khám phá Haevy Portal"
      >
        {/* 1. SVG Spotlight Cutout Overlay (Dims background, leaves target interactive!) */}
        {!isCompletedView && spotlightRect ? (
          <>
            <svg
              className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300"
              width={viewportSize.width}
              height={viewportSize.height}
            >
              <defs>
                <mask id="haevy-onboarding-spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlightRect.left}
                    y={spotlightRect.top}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx="16"
                    ry="16"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(8, 9, 13, 0.78)"
                mask="url(#haevy-onboarding-spotlight-mask)"
              />
            </svg>

            {/* Glowing Atelier Frame around the live interactive target */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{
                opacity: 1,
                scale: 1,
                top: spotlightRect.top,
                left: spotlightRect.left,
                width: spotlightRect.width,
                height: spotlightRect.height
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed rounded-2xl pointer-events-none"
              style={{
                border: `1.5px solid ${currentStep.accentHex}`,
                boxShadow: `0 0 0 1px rgba(245, 242, 235, 0.12), 0 0 36px -4px ${currentStep.accentHex}55`
              }}
            >
              {/* Subtle corner editorial label */}
              <div
                className="absolute -top-3 left-4 px-2.5 py-0.5 rounded bg-[#08090D] border border-white/15 text-[10px] font-mono-tabular uppercase tracking-widest text-[#F5F2EB] flex items-center gap-1.5"
                style={{ borderColor: `${currentStep.accentHex}66` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: currentStep.accentHex }}
                />
                <span>Vùng tương tác trực tiếp · Bước {currentStep.index}</span>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="fixed inset-0 bg-[#08090D]/80 backdrop-blur-sm pointer-events-auto" />
        )}

        {/* 2. Guided Step Popover Card OR Completion Reward Modal */}
        {!isCompletedView ? (
          <motion.div
            key={`onboarding-step-${currentStep.id}`}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={getCardPositionStyle()}
            className="fixed z-[130] w-[calc(100vw-2rem)] sm:w-[430px] rounded-2xl bg-[#10131A]/95 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-[0_28px_70px_rgba(0,0,0,0.85)] pointer-events-auto text-[#F5F2EB]"
          >
            {/* Top Meta Line: Unboxed Editorial Step Counter & Skip */}
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span
                  className="font-mono-tabular font-semibold"
                  style={{ color: currentStep.accentHex }}
                >
                  {currentStep.index} / 05
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentStep.category}</span>
              </div>

              <button
                type="button"
                onClick={handleDismissTour}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng hướng dẫn (Esc)"
              >
                <span>Bỏ qua</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step Header & Description */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5"
                  style={{ color: currentStep.accentHex }}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#F5F2EB] leading-tight">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{currentStep.subtitle}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300/95 leading-relaxed pt-1">
                {currentStep.description}
              </p>
            </div>

            {/* Interactive Live Try Box */}
            <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
              <div className="text-[11px] text-zinc-400 leading-snug">
                <span className="text-amber-300 font-medium">Thao tác trực tiếp: </span>
                {currentStep.interactionHint}
              </div>

              <button
                type="button"
                onClick={handleRunLiveDemo}
                className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-medium text-[#F5F2EB] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" style={{ color: currentStep.accentHex }} />
                <span>{currentStep.demoButtonLabel}</span>
              </button>

              {demoFeedbackText && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{demoFeedbackText}</span>
                </div>
              )}
            </div>

            {/* Step Progress Dots & Navigation Controls */}
            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between gap-3">
              {/* Step Selector Dots */}
              <div className="flex items-center gap-1.5">
                {ONBOARDING_STEPS.map((st, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        playMetallicCardTapSound();
                        setCurrentStepIndex(idx);
                      }}
                      aria-label={`Chuyển tới bước ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? 'w-6 bg-amber-300'
                          : isPassed
                          ? 'w-2 bg-amber-300/45'
                          : 'w-2 bg-white/15 hover:bg-white/30'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F5F2EB] hover:bg-white text-[#08090D] text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <span>
                    {currentStepIndex === ONBOARDING_STEPS.length - 1
                      ? 'Hoàn tất & Nhận quà'
                      : 'Tiếp theo'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3. Completion & Reward Celebration Modal */
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-md rounded-2xl bg-[#10131A] border border-white/15 p-6 sm:p-8 shadow-2xl text-[#F5F2EB] space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Gift className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-amber-300 font-medium">
                  Hoàn tất Hành trình Khám phá
                </div>
                <h3 className="font-editorial text-3xl font-semibold text-[#F5F2EB]">
                  Chào mừng bạn đến với Haevy Atelier
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Bạn đã nắm vững các công cụ điều hướng trọng tâm: Chân dung Sống động 3D, Voice Navigation, Floating Dock, Lưới 12 Phân hệ và Sổ tay AI Nổi.
                </p>
              </div>

              {/* Reward Summary Box */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="text-xs text-zinc-400">
                  {rewardGrantedThisSession
                    ? 'Phần thưởng chào mừng thành viên mới đã được cộng vào tài khoản:'
                    : 'Bạn đã nhận phần thưởng chào mừng trong lần hướng dẫn trước:'}
                </div>
                <div className="flex items-center justify-between pt-1 text-sm font-medium text-[#F5F2EB]">
                  <span>Điểm Thính Giác (Audio Points)</span>
                  <span className="font-mono-tabular text-amber-300 font-semibold">+200 Điểm</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-[#F5F2EB]">
                  <span>Xu Cá nhân hóa (Haevy Lite Coin)</span>
                  <span className="font-mono-tabular text-emerald-300 font-semibold">+50 Xu</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompletedView(false);
                    setCurrentStepIndex(0);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Xem lại từ đầu
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5F2EB] hover:bg-white text-[#08090D] text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Bắt đầu Trải nghiệm</span>
                  <Compass className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
