import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck, 
  Zap,
  MessageSquare,
  Mic,
  MicOff,
  LifeBuoy,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  X,
  Minus,
  Maximize2,
  Clock,
  RefreshCw,
  Headphones,
  Heart,
  Wallet,
  Compass,
  TreePine,
  Gamepad2,
  Orbit,
  Sun,
  Crown,
  Flame,
  Radio,
  Music,
  Coins,
  Camera,
  TrendingUp,
  GraduationCap,
  MapPin,
  Layers,
  Globe,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';
import { EcosystemMode } from '../types';
import { 
  getContextSuggestionsForMode, 
  ContextQuickSuggestion 
} from '../utils/contextSuggestions';

interface HaevyAIFloatingWidgetProps {
  currentMode?: EcosystemMode | string;
  activeTab?: string;
  onOpenFullAI?: (subTab?: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes', initialPrompt?: string) => void;
  onSelectMode?: (mode: string, initialTab?: string) => void;
  onSelectTab?: (tab: string) => void;
  onToggleVoiceListening?: () => void;
  isVoiceListening?: boolean;
  hasActiveTrack?: boolean;
}

export function HaevyAIFloatingWidget({
  currentMode = 'portal',
  activeTab,
  onOpenFullAI,
  onSelectMode,
  onSelectTab,
  onToggleVoiceListening,
  isVoiceListening = false,
  hasActiveTrack = false
}: HaevyAIFloatingWidgetProps) {
  const { user } = useAuth();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('haevy_ai_widget_collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('haevy_ai_widget_autohide');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isDismissed, setIsDismissed] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Context-aware configuration based on currentMode and activeTab
  const contextConfig = useMemo(() => {
    return getContextSuggestionsForMode(currentMode, activeTab, hasActiveTrack);
  }, [currentMode, activeTab, hasActiveTrack]);

  // Rotate through suggestions if mode has more than 2
  const displayedSuggestions = useMemo(() => {
    const all = contextConfig.suggestions;
    if (all.length <= 2) return all;
    const startIdx = (suggestionOffset * 2) % all.length;
    return [all[startIdx], all[(startIdx + 1) % all.length]];
  }, [contextConfig, suggestionOffset]);

  const handleCycleSuggestions = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.selection();
    setSuggestionOffset(prev => prev + 1);
    resetInactivityTimer();
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    // Do not auto-hide if disabled, dismissed, or voice is currently listening
    if (!isAutoHideEnabled || isDismissed || isVoiceListening) {
      return;
    }

    // Do not auto-hide while the user is actively hovering or has the quick-action menu open
    if (isHovered || isMenuOpen) {
      return;
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoHidden(true);
      setIsMenuOpen(false);
    }, 5000);
  }, [isAutoHideEnabled, isDismissed, isVoiceListening, isHovered, isMenuOpen]);

  // Track inactivity countdown
  useEffect(() => {
    if (!isAutoHideEnabled || isDismissed) {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      return;
    }

    if (isHovered || isMenuOpen || isVoiceListening) {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      return;
    }

    if (isAutoHidden) {
      return;
    }

    resetInactivityTimer();

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isAutoHideEnabled, isDismissed, isHovered, isMenuOpen, isVoiceListening, isAutoHidden, resetInactivityTimer]);

  const handleWakeUp = () => {
    haptics.selection();
    setIsAutoHidden(false);
    setIsCollapsed(false);
    resetInactivityTimer();
  };

  // Close menu when tapping outside or pressing Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.selection();
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (nextState) setIsMenuOpen(false);
    try {
      localStorage.setItem('haevy_ai_widget_collapsed', String(nextState));
    } catch {}
    resetInactivityTimer();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.light();
    setIsDismissed(true);
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
  };

  const handleToggleMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.selection();
    setIsMenuOpen(prev => !prev);
    resetInactivityTimer();
  };

  const handleOpenAIChat = (subTab: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes' = 'chat') => {
    haptics.medium();
    setIsMenuOpen(false);
    if (onOpenFullAI) {
      onOpenFullAI(subTab);
    } else if (onSelectMode) {
      onSelectMode('haevy_ai', subTab);
    }
  };

  const handleOpenAIChatWithPrompt = (prompt: string, subTab: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes' = 'chat') => {
    haptics.medium();
    setIsMenuOpen(false);
    if (onOpenFullAI) {
      onOpenFullAI(subTab, prompt);
    } else if (onSelectMode) {
      onSelectMode('haevy_ai', subTab);
    }
  };

  const handleExecuteSuggestion = (suggestion: ContextQuickSuggestion) => {
    haptics.medium();
    setIsMenuOpen(false);
    if (suggestion.actionType === 'prompt' && suggestion.prompt) {
      handleOpenAIChatWithPrompt(suggestion.prompt, 'chat');
    } else if (suggestion.actionType === 'navigate') {
      if (suggestion.targetMode && onSelectMode) {
        onSelectMode(suggestion.targetMode, suggestion.targetTab);
      }
      if (suggestion.targetTab && onSelectTab) {
        onSelectTab(suggestion.targetTab);
      }
    } else if (suggestion.actionType === 'action') {
      if (onToggleVoiceListening) {
        onToggleVoiceListening();
      }
    }
  };

  const renderSuggestionIcon = (name: string, className = "w-3.5 h-3.5") => {
    switch (name) {
      case 'Headphones': return <Headphones className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Wallet': return <Wallet className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'TreePine': return <TreePine className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'Gamepad2': return <Gamepad2 className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'Orbit': return <Orbit className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Music': return <Music className={className} />;
      case 'Coins': return <Coins className={className} />;
      case 'Camera': return <Camera className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const handleVoiceCommandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.medium();
    if (onToggleVoiceListening) {
      onToggleVoiceListening();
      setIsMenuOpen(false);
    } else {
      handleOpenAIChat('chat');
    }
  };

  if (isDismissed) {
    return null;
  }

  // Dynamic bottom positioning to ensure it never overlaps the BottomTaskbar mini player
  const bottomPositionClass = hasActiveTrack 
    ? 'bottom-28 sm:bottom-32' 
    : 'bottom-20 sm:bottom-24';

  // Quick action menu is visible when explicitly tapped/opened OR hovered on desktop
  const isActionMenuVisible = isMenuOpen || isHovered;

  // Subtle Edge Indicator State (Auto-hidden after 5s of inactivity to keep the screen cleaner)
  if (isAutoHidden) {
    return (
      <div 
        className={`fixed ${bottomPositionClass} right-0 z-40 flex items-center pointer-events-auto select-none`}
      >
        <motion.button
          id="haevy_ai_edge_indicator_btn"
          type="button"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={handleWakeUp}
          onMouseEnter={handleWakeUp}
          className="group relative flex items-center gap-1.5 pl-2.5 pr-1.5 py-2 rounded-l-2xl rounded-r-none bg-zinc-950/90 backdrop-blur-3xl border-l border-y border-zinc-800/80 hover:border-purple-500/50 text-white shadow-2xl shadow-purple-950/50 hover:shadow-purple-700/30 transition-all duration-300 cursor-pointer"
          title="Trợ lý Haevy AI (Tự động ẩn sau 5s - Chạm hoặc rê chuột để mở)"
        >
          {/* Glowing Left Accent Line */}
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-500 group-hover:scale-y-125 transition-transform duration-300 shadow-sm shadow-purple-500/60 animate-pulse" />
          
          {/* Icon with Glowing Ping */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 group-hover:text-white group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300">
            <BrainCircuit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-zinc-950">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          </div>

          {/* Peek Chevron Left */}
          <ChevronLeft size={13} className="text-zinc-500 group-hover:text-purple-300 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </motion.button>
      </div>
    );
  }

  // Compact Minimalist Orb State (does not block reading or tapping underneath)
  if (isCollapsed) {
    return (
      <div 
        className={`fixed ${bottomPositionClass} right-2.5 sm:right-4 z-40 flex items-center pointer-events-auto animate-fadeIn`}
        onMouseEnter={() => {
          setIsHovered(true);
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          resetInactivityTimer();
        }}
      >
        <button
          id="haevy_ai_floating_orb_btn"
          type="button"
          onClick={() => {
            haptics.selection();
            setIsCollapsed(false);
            setIsMenuOpen(true);
            try {
              localStorage.setItem('haevy_ai_widget_collapsed', 'false');
            } catch {}
            resetInactivityTimer();
          }}
          className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-zinc-950/90 backdrop-blur-3xl border border-zinc-800/80 hover:border-purple-500/50 text-white shadow-xl shadow-purple-900/50 hover:scale-110 active:scale-95 transition-all duration-300"
          title="Mở menu Trợ lý Haevy AI"
        >
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-40 blur-sm group-hover:opacity-100 transition duration-300 -z-10 animate-pulse" />
          <BrainCircuit className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={widgetRef}
      className={`fixed ${bottomPositionClass} right-2.5 sm:right-4 z-40 flex flex-col items-end pointer-events-auto select-none`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
          inactivityTimeoutRef.current = null;
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        resetInactivityTimer();
      }}
    >
      {/* Collapsible Floating Action Menu (Expands on Tap or Hover) */}
      <AnimatePresence>
        {isActionMenuVisible && (
          <motion.div
            key="haevy_ai_action_menu"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-72 sm:w-80 max-h-[82vh] overflow-y-auto no-scrollbar bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800/80 hover:border-purple-500/50 shadow-2xl shadow-purple-950/50 rounded-2xl p-2.5 mb-2 flex flex-col gap-2 transition-colors duration-300"
          >
            {/* Header / Menu Title */}
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-zinc-800/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200">
                  Haevy AI Quick Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded-md hover:bg-zinc-900 cursor-pointer"
                title="Thu gọn menu"
              >
                <X size={13} />
              </button>
            </div>

            {/* Context-Aware Quick Suggestions Section */}
            <div className={`flex flex-col gap-1.5 p-2 rounded-xl bg-gradient-to-b ${contextConfig.gradient} border border-zinc-800/80`}>
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={12} className="text-amber-400 shrink-0 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-200 truncate">
                    Gợi ý nhanh
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${contextConfig.badgeBg} ${contextConfig.badgeText} border-zinc-700/60 truncate max-w-[120px]`}>
                    {contextConfig.displayName}
                  </span>
                </div>

                {contextConfig.suggestions.length > 2 && (
                  <button
                    type="button"
                    onClick={handleCycleSuggestions}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium text-zinc-400 hover:text-purple-300 hover:bg-purple-950/40 border border-zinc-800/80 hover:border-purple-500/40 transition-all cursor-pointer shrink-0"
                    title="Đổi sang các gợi ý khác của chế độ này"
                  >
                    <RefreshCw size={9} className="hover:rotate-180 transition-transform duration-500" />
                    <span>Đổi gợi ý</span>
                  </button>
                )}
              </div>

              {/* Suggestions Cards List */}
              <div className="flex flex-col gap-1 mt-0.5">
                {displayedSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => handleExecuteSuggestion(sug)}
                    className="group flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900/85 hover:bg-purple-950/40 border border-zinc-800/80 hover:border-purple-500/50 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
                    title={`Bấm để thực thi: ${sug.prompt || sug.title}`}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-purple-300 group-hover:border-purple-500/40 group-hover:scale-105 transition-all shrink-0 mt-0.5">
                        {renderSuggestionIcon(sug.iconName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                            {sug.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                            {sug.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 line-clamp-1 group-hover:text-zinc-300 transition-colors">
                          {sug.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action 1: Talk to AI */}
            <button
              type="button"
              id="haevy_ai_action_talk"
              onClick={() => handleOpenAIChat('chat')}
              className="group flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900/60 hover:bg-purple-950/40 border border-zinc-800/80 hover:border-purple-500/50 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:text-purple-200 transition-all">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <span>Talk to AI</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Chat 1-1
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Trò chuyện & tham vấn thông minh
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>

            {/* Quick Action 2: Voice Commands */}
            <button
              type="button"
              id="haevy_ai_action_voice"
              onClick={handleVoiceCommandClick}
              className={`group flex items-center justify-between w-full p-2 rounded-xl border transition-all duration-200 text-left active:scale-[0.98] cursor-pointer ${
                isVoiceListening 
                  ? 'bg-emerald-950/50 border-emerald-500/60 shadow-lg shadow-emerald-950/40' 
                  : 'bg-zinc-900/60 hover:bg-emerald-950/40 border-zinc-800/80 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  isVoiceListening
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 animate-pulse'
                    : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300 group-hover:scale-110 group-hover:text-emerald-200'
                }`}>
                  {isVoiceListening ? <Mic size={16} className="animate-bounce" /> : <Mic size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>Voice Commands</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${
                      isVoiceListening 
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isVoiceListening ? 'Đang nghe...' : 'Lệnh thoại'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {isVoiceListening ? 'Bấm để dừng nhận diện giọng nói' : 'Điều khiển rảnh tay bằng giọng nói'}
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>

            {/* Quick Action 3: Support */}
            <button
              type="button"
              id="haevy_ai_action_support"
              onClick={() => handleOpenAIChat('troubleshoot')}
              className="group flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900/60 hover:bg-amber-950/40 border border-zinc-800/80 hover:border-amber-500/50 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:text-amber-200 transition-all">
                  <LifeBuoy size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>Support</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cứu hộ 24/7
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Giải đáp thắc mắc & hỗ trợ kỹ thuật
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>

            {/* Quick Action 4: First Principles Deep Study (Gemini 3.5 Flash) */}
            <button
              type="button"
              id="haevy_ai_action_first_principles"
              onClick={() => {
                haptics.impact('medium');
                setIsMenuOpen(false);
                if (onSelectMode) {
                  onSelectMode('edu', 'assistant');
                } else {
                  handleOpenAIChatWithPrompt('Hãy phân tích nguyên lý gốc rễ (First Principles), bản chất logic và tóm tắt cô đọng giúp tôi.', 'chat');
                }
              }}
              className="group flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900/60 hover:bg-cyan-950/40 border border-zinc-800/80 hover:border-cyan-500/50 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:text-cyan-200 transition-all">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <span>Deep Study AI</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      First Principles
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Phân tích nguyên lý bản chất & tránh học vẹt
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>

            {/* Quick Action 5: Haevy Internet (Web Browser Pro) */}
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsMenuOpen(false);
                if (onSelectMode) {
                  onSelectMode('internet', 'browser');
                } else {
                  handleOpenAIChatWithPrompt('Mở trình duyệt web Haevy Internet để tra cứu và đọc tin tức.', 'chat');
                }
              }}
              className="group flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900/60 hover:bg-sky-950/40 border border-zinc-800/80 hover:border-sky-500/50 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 group-hover:scale-110 group-hover:text-sky-200 transition-all">
                  <Globe size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                    <span>Haevy Internet</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Web 4.0
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Trình duyệt đa thẻ, tìm kiếm AI & đọc sạch
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>

            {/* Auto-hide (5s) Setting Row */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock size={12} className={isAutoHideEnabled ? "text-purple-400" : "text-zinc-500"} />
                <span>Auto-hide (5s)</span>
              </div>
              <button
                type="button"
                id="haevy_ai_autohide_toggle_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.selection();
                  const next = !isAutoHideEnabled;
                  setIsAutoHideEnabled(next);
                  try {
                    localStorage.setItem('haevy_ai_widget_autohide', String(next));
                  } catch {}
                  if (!next) {
                    setIsAutoHidden(false);
                  }
                  resetInactivityTimer();
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                  isAutoHideEnabled 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30' 
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
                }`}
                title={isAutoHideEnabled ? 'Tự động ẩn về mép màn hình sau 5 giây không thao tác' : 'Tắt tự động ẩn'}
              >
                {isAutoHideEnabled ? 'Đang bật' : 'Đã tắt'}
              </button>
            </div>

            {/* Footer Quick Launch to Full Hub */}
            <button
              type="button"
              onClick={() => handleOpenAIChat('overview')}
              className="mt-0.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-purple-500/40 text-[11px] text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Maximize2 size={12} className="text-purple-400" />
              <span>Mở Toàn Cảnh Haevy AI Hub</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Full-Screen AI Trigger Button with Built-in Collapse/Menu Toggle */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950/90 backdrop-blur-3xl border border-zinc-800/80 hover:border-purple-500/50 shadow-2xl shadow-purple-950/40 transition-all duration-300">
        <button
          type="button"
          id="haevy_ai_widget_chat_btn"
          onClick={handleToggleMenu}
          className="group relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs shadow-xl shadow-purple-900/50 ring-1 ring-purple-400/50 hover:ring-purple-300 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
          title="Chạm hoặc di chuột để mở Menu Thao Tác Nhanh Haevy AI"
        >
          {/* Glowing Luminous Pulse */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-50 blur-sm group-hover:opacity-90 transition duration-300 -z-10 animate-pulse" />

          <div className="relative">
            <BrainCircuit className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-purple-900 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <span className="tracking-wide">
            Haevy AI
          </span>

          {/* Dynamic Expand/Collapse Chevron Indicator */}
          <ChevronUp 
            size={13} 
            className={`transition-transform duration-300 text-purple-200 ${
              isActionMenuVisible ? 'rotate-180 text-amber-300' : 'rotate-0'
            }`} 
          />
        </button>

        {/* Minimize Button: Shrinks to subtle orb */}
        <button
          type="button"
          id="haevy_ai_widget_minimize_btn"
          onClick={toggleCollapsed}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 hover:border-purple-500/50 text-zinc-400 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
          title="Thu nhỏ thành bong bóng nổi (Tránh che màn hình)"
        >
          <Minus size={12} />
        </button>

        {/* Dismiss / Close Button */}
        <button
          type="button"
          id="haevy_ai_widget_dismiss_btn"
          onClick={handleDismiss}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-rose-950/80 border border-zinc-800/80 hover:border-purple-500/50 text-zinc-400 hover:text-rose-300 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Đóng trợ lý nổi"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}


