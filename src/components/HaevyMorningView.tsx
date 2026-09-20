import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Heart, 
  Flame, 
  Trash2, 
  Hand, 
  Compass, 
  TreePine, 
  Mountain, 
  Waves, 
  Globe2, 
  Bot, 
  Loader2, 
  PenTool, 
  LogOut,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sun,
  Smile,
  CheckCircle2,
  Sliders,
  RotateCw,
  Box,
  Layers,
  Sparkle,
  Wand2,
  Activity,
  Scan,
  SunMedium,
  Eye,
  SlidersHorizontal,
  Moon,
  ShieldAlert,
  Gauge,
  Lightbulb,
  Undo2,
  Redo2,
  Eraser,
  PenLine,
  FastForward,
  Scale,
  MoreHorizontal,
  Palette,
  Settings2,
  Home,
  Share2,
  Users,
  X,
  Smartphone,
  LayoutGrid,
  Bell,
  Crown,
  Coins,
  LogIn,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Track, MorningTheme, MorningSoundscape, EcosystemMode, ActiveTab } from '../types';
import { morningAudio } from '../services/morningAudioService';
import { HaevyAnimeMetaverseModal } from './HaevyAnimeMetaverseModal';
import { HaevySonMascot3D } from './HaevySonMascot3D';
import { HaevySpacePortalHub } from './HaevySpacePortalHub';
import { HaevyMagicShieldAR } from './HaevyMagicShieldAR';
import { HaevySpaceLogo } from './HaevySpaceLogo';
import { HaevyAllModesInfoModal } from './HaevyAllModesInfoModal';
import { HaevyUserDropdownMenu } from './HaevyUserDropdownMenu';
import { NotificationsModal } from './NotificationsModal';
import { InstallPwaModal } from './InstallPwaModal';
import { HaevyMorningDashboard } from './morning/HaevyMorningDashboard';

interface HaevyMorningViewProps {
  allTracks?: Track[];
  currentTrack?: Track | null;
  isPlayingTrack?: boolean;
  onPlayTrack?: (track: Track) => void;
  onToggleTrackPlay?: () => void;
  onOpenAuth?: () => void;
  onGoToAudioHome?: () => void;
  onShareToCommunity?: (imageUrl: string, suggestedContent?: string, tag?: string) => void;
  onOpenEcosystemDrawer?: () => void;
  onOpenInstallPwa?: () => void;
  onOpenNotifications?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onSelectMode?: (mode: EcosystemMode, tab?: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  initialSubView?: 'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard';
  activeSubTab?: string;
}

interface HandPoint {
  x: number;
  y: number;
  z?: number;
}

interface DrawStrokePoint {
  x: number;
  y: number;
  color: string;
  size: number;
  brushType: 'laser' | 'stardust' | 'rainbow' | 'plasma' | 'emerald' | 'galaxy' | 'neon' | 'quantum' | 'matrix' | 'aurora';
  timestamp: number;
  isNewStroke?: boolean;
}

// 3D Spatial Hologram Entity (Materialized Floating Object in Room Space)
interface SpatialHologramEntity {
  id: string;
  title: string;
  decodedText?: string;
  strokes: DrawStrokePoint[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  };
  color: string;
  brushType: 'laser' | 'stardust' | 'rainbow' | 'plasma' | 'emerald' | 'galaxy' | 'neon' | 'quantum' | 'matrix' | 'aurora';
  createdAt: number;
  zDepth: number; // 3D depth relative to camera
  pulsePhase: number;
  scale: number;
  scaleMultiplier?: number;
  rotationAngle?: number;
  isPinned: boolean;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  scale: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface SpatialShapeItem {
  type: 'heart' | 'star' | 'sun' | 'galaxy';
  x: number;
  y: number;
  scale: number;
  color: string;
  rotation: number;
  timestamp: number;
}

// 21 MediaPipe hand landmarks connection lines
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17] // Palm base
];

// Realistic Spatial Environments Data
const REALISTIC_ENVIRONMENTS: Array<{
  id: MorningTheme;
  name: string;
  category: string;
  icon: any;
  bgUrl: string;
  gradientOverlay: string;
  soundscape: MorningSoundscape;
  accentColor: string;
  description: string;
}> = [
  {
    id: 'live_camera',
    name: 'Camera Không Gian AR',
    category: 'Thực Tế',
    icon: Camera,
    bgUrl: '',
    gradientOverlay: 'from-black/10 via-black/20 to-black/60',
    soundscape: 'birds_dawn',
    accentColor: '#06b6d4',
    description: 'Chế độ nhìn xuyên thấu camera phòng thực tế 100% hòa quyện nét vẽ không gian AR 3D.'
  },
  {
    id: 'ocean_sunrise',
    name: 'Bình Minh Biển Vàng',
    category: 'Đại Dương',
    icon: Waves,
    bgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    gradientOverlay: 'from-amber-600/30 via-orange-900/20 to-black/70',
    soundscape: 'ocean_waves',
    accentColor: '#f59e0b',
    description: 'Ánh bình minh phản chiếu mặt biển lăn tăn, sóng vỗ êm đềm khởi đầu không gian mới.'
  },
  {
    id: 'cosmic_earth',
    name: 'Vũ Trụ Trái Đất',
    category: 'Vũ Trụ',
    icon: Globe2,
    bgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    gradientOverlay: 'from-blue-600/30 via-indigo-950/40 to-black/85',
    soundscape: 'alpha_wave',
    accentColor: '#818cf8',
    description: 'Góc nhìn từ quỹ đạo không gian ngắm dải hào quang mặt trời chiếu sáng Trái Đất.'
  },
  {
    id: 'pine_forest',
    name: 'Rừng Thông Sương Sớm',
    category: 'Thiên Nhiên',
    icon: TreePine,
    bgUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    gradientOverlay: 'from-emerald-600/25 via-teal-950/25 to-black/75',
    soundscape: 'forest_wind',
    accentColor: '#10b981',
    description: 'Tia nắng ban mai rọi xuyên qua tán rừng thông và làn sương mờ trong trẻo.'
  },
  {
    id: 'cloud_mountain',
    name: 'Đỉnh Núi Biển Mây',
    category: 'Hùng Vĩ',
    icon: Mountain,
    bgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    gradientOverlay: 'from-sky-500/25 via-indigo-950/30 to-black/75',
    soundscape: 'alpha_wave',
    accentColor: '#38bdf8',
    description: 'Biển mây bồng bềnh dưới đỉnh núi đón những tia sáng đầu tiên rực rỡ.'
  }
];

const SPATIAL_EMOJIS = [
  { emoji: '💖', name: 'Trái Tim' },
  { emoji: '☀️', name: 'Mặt Trời' },
  { emoji: '✨', name: 'Bụi Sao' },
  { emoji: '🔥', name: 'Năng Lượng' },
  { emoji: '🌸', name: 'Hoa Đào' },
  { emoji: '👍', name: 'Like' },
  { emoji: '🌈', name: 'Cầu Vồng' },
  { emoji: '🪷', name: 'Hoa Sen' }
];

export function HaevyMorningView({
  allTracks = [],
  currentTrack,
  isPlayingTrack = false,
  onPlayTrack,
  onToggleTrackPlay,
  onOpenAuth,
  onGoToAudioHome,
  onShareToCommunity,
  onOpenEcosystemDrawer,
  onOpenInstallPwa,
  onOpenNotifications,
  onToggleFullscreen,
  isFullscreen: externalIsFullscreen,
  onSelectMode,
  onSelectTab,
  initialSubView,
  activeSubTab
}: HaevyMorningViewProps) {
  const { 
    user, 
    loading, 
    audioPoints, 
    isVip, 
    vipTier, 
    isAuthorVerified, 
    systemAnnouncements 
  } = useAuth();

  const [isEcosystemDrawerOpen, setIsEcosystemDrawerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isInstallPwaModalOpen, setIsInstallPwaModalOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);

  // Listen for unread messages & conversations
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubConv = onSnapshot(qConv, (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.unreadCounts && data.unreadCounts[user.uid]) {
          total += data.unreadCounts[user.uid] || 0;
        }
      });
      setUnreadMessagesCount(total);
    }, () => {});

    return () => unsubConv();
  }, [user]);

  // Listen for pending friend requests
  useEffect(() => {
    if (!user) {
      setPendingFriendCount(0);
      return;
    }

    const qReq = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubReq = onSnapshot(qReq, (snap) => {
      setPendingFriendCount(snap.size);
    }, () => {});

    return () => unsubReq();
  }, [user]);

  // Calculate unread system announcements from localStorage
  const getUnreadAnnouncementsCount = () => {
    try {
      const stored = localStorage.getItem(`haevy_read_announcements_${user?.uid || 'guest'}`);
      const readIds: string[] = stored ? JSON.parse(stored) : [];
      const relevant = (systemAnnouncements || []).filter((item) => {
        if (item.targetAudience === 'vip' && !isVip) return false;
        if (item.targetAudience === 'authors' && !isAuthorVerified) return false;
        return true;
      });
      return relevant.filter(a => !readIds.includes(a.id)).length;
    } catch {
      return 0;
    }
  };

  const totalNotifications = unreadMessagesCount + pendingFriendCount + getUnreadAnnouncementsCount();

  const handleOpenDrawer = () => {
    // Trigger the ultra-responsive, space-optimized Quick Mode Switcher Sheet
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haevy-open-quick-mode-switcher'));
    }
  };

  const handleOpenNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setIsNotificationsModalOpen(true);
    }
  };

  const handleOpenInstallPwa = () => {
    if (onOpenInstallPwa) {
      onOpenInstallPwa();
    } else {
      setIsInstallPwaModalOpen(true);
    }
  };

  // 🌟 HAEVY SPACE VIEW STATE: 'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard'
  const [spaceView, setSpaceView] = useState<'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard'>('portal');
  const [isCameraPromptDismissed, setIsCameraPromptDismissed] = useState<boolean>(false);

  // Synchronize spaceView with external tabs if provided
  useEffect(() => {
    if (initialSubView) {
      setSpaceView(initialSubView);
    } else if (activeSubTab) {
      if (activeSubTab === 'morning_dashboard' || activeSubTab === 'dashboard') {
        setSpaceView('morning_dashboard');
      } else if (activeSubTab === 'canvas') {
        setSpaceView('canvas');
      } else if (activeSubTab === 'mascot') {
        setSpaceView('mascot');
      } else if (activeSubTab === 'magic_ar') {
        setSpaceView('magic_ar');
      } else if (activeSubTab === 'portal') {
        setSpaceView('portal');
      }
    }
  }, [initialSubView, activeSubTab]);

  // Core App & Workspace States
  const [internalIsFullscreen, setInternalIsFullscreen] = useState<boolean>(false);
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalIsFullscreen;
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [currentTheme, setCurrentTheme] = useState<MorningTheme>('live_camera');
  const [soundscape, setSoundscape] = useState<MorningSoundscape>('ocean_waves');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [cameraBlendOpacity, setCameraBlendOpacity] = useState<number>(0.88);
  const [isDockMinimized, setIsDockMinimized] = useState<boolean>(false);
  const [showSceneDrawer, setShowSceneDrawer] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showBrushFxPicker, setShowBrushFxPicker] = useState<boolean>(false);
  const [showMathShapesPicker, setShowMathShapesPicker] = useState<boolean>(false);
  const [showMoreActions, setShowMoreActions] = useState<boolean>(false);
  const [showGestureGuide, setShowGestureGuide] = useState<boolean>(false);

  // Air Handwriting & Spatial Stroke Settings
  const [brushType, setBrushType] = useState<'laser' | 'stardust' | 'rainbow' | 'plasma' | 'emerald' | 'galaxy' | 'neon' | 'quantum' | 'matrix' | 'aurora'>('laser');
  const [brushColor, setBrushColor] = useState<string>('#fbbf24');
  const [brushSize, setBrushSize] = useState<number>(7);
  const [airWritingTriggerMode, setAirWritingTriggerMode] = useState<'pinch_to_draw' | 'index_continuous' | 'palm_hover'>('pinch_to_draw');
  const [penSensitivity, setPenSensitivity] = useState<'high' | 'medium' | 'strict'>('high');
  const [strokeStabilizer, setStrokeStabilizer] = useState<'high' | 'medium' | 'raw'>('high');
  const [autoShapeSnap, setAutoShapeSnap] = useState<boolean>(true);
  const [isAiBeautifying, setIsAiBeautifying] = useState<boolean>(false);
  const [autoOcrEnabled, setAutoOcrEnabled] = useState<boolean>(true);
  const [handwrittenTextHistory, setHandwrittenTextHistory] = useState<Array<{ text: string; confidence: number; timestamp: number }>>([]);
  const [recognizedLiveText, setRecognizedLiveText] = useState<string>('');
  const [isRecognizingText, setIsRecognizingText] = useState<boolean>(false);
  const [showSensitivityPanel, setShowSensitivityPanel] = useState<boolean>(false);

  // Active Tool & Selective Eraser / Undo Settings
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const [eraserRadius, setEraserRadius] = useState<number>(32);
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [isUltraLowLatency, setIsUltraLowLatency] = useState<boolean>(true);
  const [isUltraSmooth120Hz, setIsUltraSmooth120Hz] = useState<boolean>(true);
  const [liveFps, setLiveFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(2.4);

  // Materialized 3D Spatial Holograms (Objects Floating in Room Space)
  const [pinnedHolograms, setPinnedHolograms] = useState<SpatialHologramEntity[]>([]);

  // Gemini AI Vision Scanner State
  const [isGeminiScanning, setIsGeminiScanning] = useState<boolean>(false);
  const [geminiAiResult, setGeminiAiResult] = useState<any | null>(null);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);

  // Space Environmental Calibration & Low-Light AI Vision State
  const [isCalibratingSpace, setIsCalibratingSpace] = useState<boolean>(false);
  const [spaceCalibrationData, setSpaceCalibrationData] = useState<{
    ambientLighting: 'low_light' | 'dim' | 'backlit' | 'normal' | 'bright';
    lightingQualityScore: number;
    brightnessLevel: number;
    contrastLevel: number;
    backgroundNoise: 'clean' | 'moderate' | 'cluttered';
    skinToneContrast: 'high' | 'medium' | 'low';
    appliedFilters: {
      brightnessBoost: number;
      contrastBoost: number;
      gammaCorrection: number;
      nightVisionMode: boolean;
      minDetectionConfidence: number;
      minTrackingConfidence: number;
      recommendedSensitivity: 'high' | 'medium' | 'strict';
    };
    statusSummary: string;
    calibrationAdvice: string;
  } | null>(null);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [isScanRadarActive, setIsScanRadarActive] = useState<boolean>(false);
  const [videoFilters, setVideoFilters] = useState<{
    brightness: number;
    contrast: number;
    nightVision: boolean;
    saturate: number;
  }>({
    brightness: 1.0,
    contrast: 1.0,
    nightVision: false,
    saturate: 1.0,
  });

  // Automated Periodic Lighting Analysis & Dynamic Exposure State
  const [isAutoLightingAnalysis, setIsAutoLightingAnalysis] = useState<boolean>(true);
  const [isAnalyzingLight, setIsAnalyzingLight] = useState<boolean>(false);
  const [isAutoScreenBalance, setIsAutoScreenBalance] = useState<boolean>(true);
  const [showHelperTips, setShowHelperTips] = useState<boolean>(true);
  const [lightingAnalysisStats, setLightingAnalysisStats] = useState<{
    lux: number;
    avgLuminance: number;
    contrast: number;
    condition: 'low_light' | 'dim' | 'normal' | 'bright' | 'backlit';
    evCompensation: number;
    isNightVisionActive: boolean;
    lastAnalyzed: string;
  } | null>(null);

  // Anime Metaverse World Re-creation & Digital Self Twin State
  const [showAnimeMetaverseModal, setShowAnimeMetaverseModal] = useState<boolean>(false);
  const [animeMetaverseInitialTab, setAnimeMetaverseInitialTab] = useState<'home_hub' | 'spatial_drawing' | 'mascot_play'>('home_hub');
  const [animeMetaverseStrokes, setAnimeMetaverseStrokes] = useState<any[]>([]);
  const [animeMetaverseSnapshot, setAnimeMetaverseSnapshot] = useState<string | null>(null);

  // Spatial Pinch-to-Zoom & Dual-Hand Multi-Gesture State
  const [spatialZoom, setSpatialZoom] = useState<number>(1.0);
  const [dualHandMode, setDualHandMode] = useState<'zoom_pan' | 'dual_draw'>('zoom_pan');
  const [dualHandTelemetry, setDualHandTelemetry] = useState<{
    handsDetected: number;
    distanceCm: number;
    isZooming: boolean;
    zoomPercent: number;
    angleDeg: number;
    h1Pinch: boolean;
    h2Pinch: boolean;
  }>({
    handsDetected: 0,
    distanceCm: 0,
    isZooming: false,
    zoomPercent: 100,
    angleDeg: 0,
    h1Pinch: false,
    h2Pinch: false,
  });

  const spatialZoomRef = useRef<number>(1.0);
  const dualHandModeRef = useRef<'zoom_pan' | 'dual_draw'>('zoom_pan');
  const twoHandTrackingRef = useRef<{
    isTracking: boolean;
    prevDist: number;
    startDist: number;
    startZoom: number;
    angle: number;
    midX: number;
    midY: number;
    h1: { x: number; y: number; pinch: boolean; rawX: number; rawY: number };
    h2: { x: number; y: number; pinch: boolean; rawX: number; rawY: number };
    lastZoomTime: number;
    lastTelemetryUpdate: number;
  }>({
    isTracking: false,
    prevDist: 0,
    startDist: 0,
    startZoom: 1.0,
    angle: 0,
    midX: 0.5,
    midY: 0.5,
    h1: { x: 0.3, y: 0.5, pinch: false, rawX: 0.3, rawY: 0.5 },
    h2: { x: 0.7, y: 0.5, pinch: false, rawX: 0.7, rawY: 0.5 },
    lastZoomTime: 0,
    lastTelemetryUpdate: 0,
  });

  // High Performance 60FPS Mutable Refs (Zero React Re-render Lag!)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const opticalLoopRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoFiltersRef = useRef(videoFilters);
  const mediaPipeHandsRef = useRef<any>(null);
  const isAutoScreenBalanceRef = useRef<boolean>(true);

  // Fast Tracking & Canvas State in Refs
  const handsDataRef = useRef<HandPoint[][]>([]);
  const smoothedHandsDataRef = useRef<HandPoint[][]>([]);
  const mediaPipeReadyRef = useRef<boolean>(false);
  const airPenPosRef = useRef<{ x: number; y: number } | null>(null);
  const smoothedPenPosRef = useRef<{ x: number; y: number } | null>(null);
  const isAirPenDrawingRef = useRef<boolean>(false);
  const lastStrokePointRef = useRef<{ x: number; y: number } | null>(null);
  const activeGestureTextRef = useRef<string>('Sẵn Sàng Viết Trong Không Khí');
  const activeGestureTagRef = useRef<string>('');
  const handsCountRef = useRef<number>(0);
  const activeTrackingModeRef = useRef<'mediapipe' | 'optical'>('optical');

  // Spatial Graphics Pools
  const drawStrokesRef = useRef<DrawStrokePoint[]>([]);
  const redoStackRef = useRef<DrawStrokePoint[][]>([]);
  const pinnedHologramsRef = useRef<SpatialHologramEntity[]>([]);
  const floatingEmojisRef = useRef<FloatingEmoji[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const spatialShapesRef = useRef<SpatialShapeItem[]>([]);
  const prevWristPositionsRef = useRef<{ [handIdx: number]: { x: number; y: number; time: number } }>({});
  const lastGestureActionTimeRef = useRef<{ [key: string]: number }>({});
  const lastEraserShakeTimeRef = useRef<number>(0);
  const lastSupernovaTimeRef = useRef<number>(0);
  const lastStrokeDrawTimeRef = useRef<number>(0);
  const isProcessingMediaPipeFrameRef = useRef<boolean>(false);
  const activeToolRef = useRef<'pen' | 'eraser'>('pen');
  const eraserRadiusRef = useRef<number>(32);
  const isUltraLowLatencyRef = useRef<boolean>(true);

  // Ultra-Low Latency Pipeline Refs
  const mediaPipeDownscaleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fingertipVelocityRef = useRef<{
    vx: number;
    vy: number;
    lastTime: number;
    lastX: number;
    lastY: number;
  }>({
    vx: 0,
    vy: 0,
    lastTime: 0,
    lastX: 0.5,
    lastY: 0.5,
  });

  // Wave gesture tracker to erase/undo recent drawings when hand waves back and forth
  const waveTrackerRef = useRef<{
    lastX: number;
    lastDir: 'left' | 'right' | 'none';
    flips: number;
    firstFlipTime: number;
    lastTriggerTime: number;
    totalTravel: number;
  }>({
    lastX: 0.5,
    lastDir: 'none',
    flips: 0,
    firstFlipTime: 0,
    lastTriggerTime: 0,
    totalTravel: 0,
  });

  // Continuously Synchronized Mutable Render Refs (Preventing RAF teardowns & re-mount jitter)
  const brushColorRef = useRef<string>(brushColor);
  const brushSizeRef = useRef<number>(brushSize);
  const brushTypeRef = useRef<'laser' | 'stardust' | 'rainbow' | 'plasma' | 'emerald' | 'galaxy' | 'neon' | 'quantum' | 'matrix' | 'aurora'>(brushType);
  const currentThemeRef = useRef<MorningTheme>(currentTheme);
  const isMirrorRef = useRef<boolean>(isMirror);
  const isLandscapeModeRef = useRef<boolean>(isLandscapeMode);
  const airWritingTriggerModeRef = useRef<'pinch_to_draw' | 'index_continuous' | 'palm_hover'>(airWritingTriggerMode);
  const penSensitivityRef = useRef<'high' | 'medium' | 'strict'>(penSensitivity);
  const strokeStabilizerRef = useRef<'high' | 'medium' | 'raw'>(strokeStabilizer);
  const autoShapeSnapRef = useRef<boolean>(autoShapeSnap);
  const isUltraSmooth120HzRef = useRef<boolean>(isUltraSmooth120Hz);

  // Dual-Input Direct Pointer / Touch & 3D Hologram Drag Engine
  const isPointerDrawingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const touchLastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const draggedHologramIdRef = useRef<string | null>(null);
  const hologramDragOffsetRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  // High Performance Pre-allocated Zero-GC Particle Pool (120 particles)
  const MAX_POOLED_PARTICLES = 120;
  const particlePoolRef = useRef<Particle[]>(
    Array.from({ length: MAX_POOLED_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 2,
      color: '#fbbf24',
      alpha: 0,
      life: 999,
      maxLife: 30
    }))
  );

  const spawnPooledParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    maxLife: number
  ) => {
    const pool = particlePoolRef.current;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (p.life >= p.maxLife || p.alpha <= 0.01) {
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.size = size;
        p.color = color;
        p.alpha = 1;
        p.life = 0;
        p.maxLife = maxLife;
        return;
      }
    }
  };

  // FPS & Frame Cost Telemetry Tracker
  const lastFpsTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    eraserRadiusRef.current = eraserRadius;
  }, [eraserRadius]);

  useEffect(() => {
    isUltraLowLatencyRef.current = isUltraLowLatency;
  }, [isUltraLowLatency]);

  useEffect(() => {
    isUltraSmooth120HzRef.current = isUltraSmooth120Hz;
  }, [isUltraSmooth120Hz]);

  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    brushTypeRef.current = brushType;
  }, [brushType]);

  useEffect(() => {
    currentThemeRef.current = currentTheme;
  }, [currentTheme]);

  useEffect(() => {
    isMirrorRef.current = isMirror;
  }, [isMirror]);

  useEffect(() => {
    isLandscapeModeRef.current = isLandscapeMode;
  }, [isLandscapeMode]);

  useEffect(() => {
    airWritingTriggerModeRef.current = airWritingTriggerMode;
  }, [airWritingTriggerMode]);

  useEffect(() => {
    penSensitivityRef.current = penSensitivity;
  }, [penSensitivity]);

  useEffect(() => {
    strokeStabilizerRef.current = strokeStabilizer;
  }, [strokeStabilizer]);

  useEffect(() => {
    autoShapeSnapRef.current = autoShapeSnap;
  }, [autoShapeSnap]);

  useEffect(() => {
    isAutoScreenBalanceRef.current = isAutoScreenBalance;
  }, [isAutoScreenBalance]);

  useEffect(() => {
    dualHandModeRef.current = dualHandMode;
  }, [dualHandMode]);

  useEffect(() => {
    spatialZoomRef.current = spatialZoom;
  }, [spatialZoom]);

  // Auto Fullscreen & Landscape helper on mount
  useEffect(() => {
    // Start spatial soundscape
    morningAudio.playSpatialBackground(soundscape, isSoundMuted ? 0 : 0.6);

    // Auto-enter fullscreen if allowed
    const requestFs = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setInternalIsFullscreen(true);
        }
      } catch {
        // Ignored if browser requires user gesture
      }
    };
    requestFs();

    return () => {
      stopCamera();
      morningAudio.stopAll();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (opticalLoopRef.current) cancelAnimationFrame(opticalLoopRef.current);
    };
  }, []);

  // Update soundscape when theme changes
  useEffect(() => {
    const env = REALISTIC_ENVIRONMENTS.find(e => e.id === currentTheme);
    if (env && env.soundscape !== soundscape) {
      setSoundscape(env.soundscape);
      morningAudio.playSpatialBackground(env.soundscape, isSoundMuted ? 0 : 0.6);
    }
  }, [currentTheme]);

  // Automated Periodic Lighting Analysis Engine (Runs every 2.5s when camera is active)
  useEffect(() => {
    if (!isCameraActive || !isAutoLightingAnalysis) return;

    // Initial analysis after camera video stream stabilizes
    const initialTimer = setTimeout(() => {
      runLightingAnalysis(false);
    }, 700);

    // Periodic ambient light & contrast sampler
    const interval = setInterval(() => {
      runLightingAnalysis(false);
    }, 2500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isCameraActive, isAutoLightingAnalysis]);

  // Handle Fullscreen toggle
  const toggleFullscreen = async () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setInternalIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setInternalIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle:', e);
      setInternalIsFullscreen(!internalIsFullscreen);
    }
  };

  // =========================================================================
  // 1. CAMERA ACCESS & LIFECYCLE
  // =========================================================================
  const startCamera = async () => {
    if (isCameraActive || isCameraLoading) return;
    setIsCameraLoading(true);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 60, min: 30 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setIsCameraLoading(false);

      // Start Native 60FPS Optical Tracker
      startOpticalVisionTracker();

      // Load enhanced MediaPipe Hands ML
      initMediaPipeHands();

      setSnapshotToast('✨ Camera sẵn sàng! Di chuyển ngón tay để viết trong không gian.');
      setTimeout(() => setSnapshotToast(null), 3000);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraLoading(false);
      setSnapshotToast('⚠️ Không thể bật camera. Vui lòng cấp quyền camera trong trình duyệt.');
      setTimeout(() => setSnapshotToast(null), 4000);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (opticalLoopRef.current) {
      cancelAnimationFrame(opticalLoopRef.current);
      opticalLoopRef.current = null;
    }
    setIsCameraActive(false);
    handsDataRef.current = [];
    smoothedHandsDataRef.current = [];
    handsCountRef.current = 0;
    airPenPosRef.current = null;
    isAirPenDrawingRef.current = false;
    lastStrokePointRef.current = null;
  };

  // =========================================================================
  // 2. ULTRA-FAST 60FPS OPTICAL HAND VISION ENGINE (NATIVE ZERO LAG)
  // =========================================================================
  const startOpticalVisionTracker = () => {
    if (!sampleCanvasRef.current) {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 160;
      sCanvas.height = 120;
      sampleCanvasRef.current = sCanvas;
    }

    const sCanvas = sampleCanvasRef.current;
    const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    let prevPixels: Uint8ClampedArray | null = null;

    const analyzeFrame = () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !videoRef.current.videoWidth) {
        opticalLoopRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      // If MediaPipe is active and delivering high confidence, skip heavy optical CPU processing
      if (mediaPipeReadyRef.current && handsDataRef.current.length > 0) {
        opticalLoopRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      try {
        sCtx.drawImage(videoRef.current, 0, 0, sCanvas.width, sCanvas.height);
        const imgData = sCtx.getImageData(0, 0, sCanvas.width, sCanvas.height);
        const data = imgData.data;
        const width = sCanvas.width;
        const height = sCanvas.height;

        let handPixelsCount = 0;
        let minY = height;
        let highestPoint: { x: number; y: number } | null = null;
        let sumX = 0;
        let sumY = 0;

        // Step by 2 pixels for max speed (<1ms)
        for (let y = 8; y < height - 8; y += 2) {
          for (let x = 8; x < width - 8; x += 2) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);

            const isNightBoost = videoFiltersRef.current.nightVision || videoFiltersRef.current.brightness > 1.15;
            const minSkinR = isNightBoost ? 36 : 65;
            const minSkinG = isNightBoost ? 22 : 35;
            const minDiff = isNightBoost ? 8 : 15;
            const isSkinTone = (r > minSkinR && g > minSkinG && b > 14 && (maxVal - minVal) > minDiff && r > g && (r - g) > (isNightBoost ? 5 : 12));

            let isMotion = false;
            if (prevPixels) {
              const diff = Math.abs(r - prevPixels[idx]) + Math.abs(g - prevPixels[idx + 1]) + Math.abs(b - prevPixels[idx + 2]);
              isMotion = diff > (isNightBoost ? 25 : 40);
            }

            if (isSkinTone || (isMotion && (r > (isNightBoost ? 35 : 60) || g > (isNightBoost ? 35 : 60)))) {
              handPixelsCount++;
              sumX += x;
              sumY += y;

              if (y < minY) {
                minY = y;
                highestPoint = { x, y };
              }
            }
          }
        }

        prevPixels = new Uint8ClampedArray(data);

        if (handPixelsCount > 45 && highestPoint) {
          const avgX = sumX / handPixelsCount;
          const avgY = sumY / handPixelsCount;

          const tipXRatio = highestPoint.x / width;
          const tipYRatio = highestPoint.y / height;
          const palmXRatio = avgX / width;
          const palmYRatio = avgY / height;
          const wristYRatio = Math.min(1, palmYRatio + (palmYRatio - tipYRatio) * 0.7);

          // Fast 21-point Skeleton Generation
          const synthHand: HandPoint[] = [
            { x: palmXRatio, y: wristYRatio, z: 0 },
            { x: palmXRatio - 0.05, y: wristYRatio - 0.05, z: 0 },
            { x: palmXRatio - 0.09, y: wristYRatio - 0.10, z: 0 },
            { x: palmXRatio - 0.11, y: wristYRatio - 0.15, z: 0 },
            { x: palmXRatio - 0.13, y: wristYRatio - 0.20, z: 0 }, // Thumb tip
            { x: palmXRatio - 0.04, y: palmYRatio, z: 0 },
            { x: palmXRatio - 0.02, y: palmYRatio - 0.10, z: 0 },
            { x: (palmXRatio + tipXRatio) / 2, y: (palmYRatio + tipYRatio) / 2, z: 0 },
            { x: tipXRatio, y: tipYRatio, z: 0 }, // Index Tip
            { x: palmXRatio, y: palmYRatio, z: 0 },
            { x: palmXRatio + 0.01, y: palmYRatio - 0.08, z: 0 },
            { x: palmXRatio + 0.02, y: palmYRatio - 0.13, z: 0 },
            { x: palmXRatio + 0.03, y: palmYRatio - 0.18, z: 0 },
            { x: palmXRatio + 0.04, y: palmYRatio, z: 0 },
            { x: palmXRatio + 0.05, y: palmYRatio - 0.06, z: 0 },
            { x: palmXRatio + 0.06, y: palmYRatio - 0.10, z: 0 },
            { x: palmXRatio + 0.07, y: palmYRatio - 0.14, z: 0 },
            { x: palmXRatio + 0.08, y: palmYRatio + 0.02, z: 0 },
            { x: palmXRatio + 0.09, y: palmYRatio - 0.04, z: 0 },
            { x: palmXRatio + 0.10, y: palmYRatio - 0.08, z: 0 },
            { x: palmXRatio + 0.11, y: palmYRatio - 0.12, z: 0 }
          ];

          // Adaptive Exponential Smoothing (Responsive + Jitter-Free)
          const prevSmoothed = smoothedHandsDataRef.current[0];
          const smoothed: HandPoint[] = synthHand.map((pt, idx) => {
            if (!prevSmoothed || !prevSmoothed[idx]) return pt;
            const prev = prevSmoothed[idx];
            const dist = Math.hypot(pt.x - prev.x, pt.y - prev.y);
            // When moving fast -> 0.85 response; when hovering -> 0.65 filter
            const alpha = dist > 0.02 ? 0.85 : 0.68;
            return {
              x: pt.x * alpha + prev.x * (1 - alpha),
              y: pt.y * alpha + prev.y * (1 - alpha),
              z: 0
            };
          });

          handsDataRef.current = [smoothed];
          smoothedHandsDataRef.current = [smoothed];
          handsCountRef.current = 1;
          activeTrackingModeRef.current = 'optical';
          processHandInteractions([smoothed]);
        } else {
          if (!mediaPipeReadyRef.current) {
            handsDataRef.current = [];
            smoothedHandsDataRef.current = [];
            handsCountRef.current = 0;
            isAirPenDrawingRef.current = false;
            airPenPosRef.current = null;
            lastStrokePointRef.current = null;
            activeGestureTextRef.current = 'Sẵn Sàng Nhận Diện Ngón Tay';
          }
        }
      } catch {}

      opticalLoopRef.current = requestAnimationFrame(analyzeFrame);
    };

    opticalLoopRef.current = requestAnimationFrame(analyzeFrame);
  };

  // =========================================================================
  // 3. MEDIAPIPE HANDS ML LAYER
  // =========================================================================
  const initMediaPipeHands = () => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
    ])
      .then(() => {
        setupMediaPipeInstance();
      })
      .catch(() => {
        // Fallback silently to Native Optical Vision
      });
  };

  const setupMediaPipeInstance = () => {
    if (typeof (window as any).Hands === 'undefined') return;

    try {
      const hands = new (window as any).Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      mediaPipeHandsRef.current = hands;

      const currentConfidence = spaceCalibrationData?.appliedFilters?.minDetectionConfidence || 0.48;
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0, // Lite mode = Sub-10ms ultra-low latency tracking
        minDetectionConfidence: currentConfidence,
        minTrackingConfidence: currentConfidence
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          mediaPipeReadyRef.current = true;
          activeTrackingModeRef.current = 'mediapipe';
          const rawHands: HandPoint[][] = results.multiHandLandmarks.map((hand: any[]) =>
            hand.map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z }))
          );

          // Ultra-Fast Adaptive Smoothing with Sub-Frame Velocity Lead (Zero Perceived Latency)
          const nowTime = performance.now();
          const prevSmoothed = smoothedHandsDataRef.current;
          const smoothed: HandPoint[][] = rawHands.map((hand, handIdx) => {
            const prevHand = prevSmoothed[handIdx];
            if (!prevHand || prevHand.length !== hand.length) return hand;
            return hand.map((pt, ptIdx) => {
              const prevPt = prevHand[ptIdx];
              const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);

              // Dynamic alpha: on fast motion, latch onto raw detection immediately
              const alpha = isUltraLowLatencyRef.current
                ? (dist > 0.003 ? 0.98 : 0.88)
                : (dist > 0.012 ? 0.90 : 0.72);

              const smoothedX = pt.x * alpha + prevPt.x * (1 - alpha);
              const smoothedY = pt.y * alpha + prevPt.y * (1 - alpha);
              const smoothedZ = (pt.z || 0) * alpha + (prevPt.z || 0) * (1 - alpha);

              // Velocity Lead Compensation for Index Tip (8) to cancel display/render pipeline latency
              if (ptIdx === 8 && isUltraLowLatencyRef.current) {
                const vel = fingertipVelocityRef.current;
                const dt = Math.max(8, Math.min(60, nowTime - (vel.lastTime || nowTime - 16)));
                const instantVx = (smoothedX - vel.lastX) / dt;
                const instantVy = (smoothedY - vel.lastY) / dt;
                vel.vx = vel.vx * 0.3 + instantVx * 0.7;
                vel.vy = vel.vy * 0.3 + instantVy * 0.7;
                vel.lastX = smoothedX;
                vel.lastY = smoothedY;
                vel.lastTime = nowTime;

                // Predict ahead by ~14ms lead time
                const leadMs = 14;
                const predX = Math.max(0.005, Math.min(0.995, smoothedX + vel.vx * leadMs));
                const predY = Math.max(0.005, Math.min(0.995, smoothedY + vel.vy * leadMs));
                return { x: predX, y: predY, z: smoothedZ };
              }

              return {
                x: smoothedX,
                y: smoothedY,
                z: smoothedZ
              };
            });
          });

          smoothedHandsDataRef.current = smoothed;
          handsDataRef.current = smoothed;
          handsCountRef.current = results.multiHandLandmarks.length;
          processHandInteractions(smoothed);
        }
      });

      const processFrameToMediaPipe = async () => {
        if (
          videoRef.current && 
          videoRef.current.readyState >= 2 && 
          streamRef.current && 
          !isProcessingMediaPipeFrameRef.current
        ) {
          isProcessingMediaPipeFrameRef.current = true;
          try {
            // Downscale to 480x360 for 3x faster ML graph execution (<4ms latency)
            if (!mediaPipeDownscaleCanvasRef.current) {
              const dCanvas = document.createElement('canvas');
              dCanvas.width = 480;
              dCanvas.height = 360;
              mediaPipeDownscaleCanvasRef.current = dCanvas;
            }
            const dCanvas = mediaPipeDownscaleCanvasRef.current;
            const dCtx = dCanvas.getContext('2d', { willReadFrequently: true });
            if (dCtx && videoRef.current) {
              dCtx.drawImage(videoRef.current, 0, 0, dCanvas.width, dCanvas.height);
              await hands.send({ image: dCanvas });
            } else {
              await hands.send({ image: videoRef.current });
            }
          } catch {} finally {
            isProcessingMediaPipeFrameRef.current = false;
          }
        }
      };

      const sendVideoFrame = () => {
        if (!streamRef.current || !videoRef.current) return;

        if ('requestVideoFrameCallback' in (videoRef.current as any)) {
          (videoRef.current as any).requestVideoFrameCallback(async () => {
            await processFrameToMediaPipe();
            if (streamRef.current) sendVideoFrame();
          });
        } else {
          requestAnimationFrame(async () => {
            await processFrameToMediaPipe();
            if (streamRef.current) sendVideoFrame();
          });
        }
      };

      sendVideoFrame();
    } catch {}
  };

  // =========================================================================
  // 4. SPATIAL GESTURE & CONTACTLESS INK LOGIC (ZERO REACT RE-RENDER IN LOOP)
  // =========================================================================
  const processHandInteractions = (hands: HandPoint[][]) => {
    if (hands.length === 0) {
      isAirPenDrawingRef.current = false;
      airPenPosRef.current = null;
      lastStrokePointRef.current = null;
      twoHandTrackingRef.current.isTracking = false;
      return;
    }

    const now = Date.now();
    const canTriggerGesture = (gestureKey: string, cooldownMs: number = 1800): boolean => {
      const last = lastGestureActionTimeRef.current[gestureKey] || 0;
      if (now - last > cooldownMs) {
        lastGestureActionTimeRef.current[gestureKey] = now;
        return true;
      }
      return false;
    };

    const pinchThreshold = penSensitivity === 'high' ? 0.085 : penSensitivity === 'medium' ? 0.075 : 0.062;
    const movementThreshold = penSensitivity === 'high' ? 0.002 : penSensitivity === 'medium' ? 0.004 : 0.006;

    // =========================================================================
    // DUAL-HAND INTERACTION ENGINE (PINCH-TO-ZOOM & SPATIAL CALIPERS)
    // =========================================================================
    if (hands.length >= 2 && hands[0].length >= 21 && hands[1].length >= 21) {
      const hand1 = hands[0];
      const hand2 = hands[1];

      const h1IndexX = isMirror ? (1 - hand1[8].x) : hand1[8].x;
      const h1IndexY = hand1[8].y;
      const h1ThumbX = isMirror ? (1 - hand1[4].x) : hand1[4].x;
      const h1ThumbY = hand1[4].y;
      const h1PinchDist = Math.hypot(hand1[4].x - hand1[8].x, hand1[4].y - hand1[8].y);
      const h1Pinch = h1PinchDist < pinchThreshold;

      const h2IndexX = isMirror ? (1 - hand2[8].x) : hand2[8].x;
      const h2IndexY = hand2[8].y;
      const h2ThumbX = isMirror ? (1 - hand2[4].x) : hand2[4].x;
      const h2ThumbY = hand2[4].y;
      const h2PinchDist = Math.hypot(hand2[4].x - hand2[8].x, hand2[4].y - hand2[8].y);
      const h2Pinch = h2PinchDist < pinchThreshold;

      const currentDist = Math.hypot(h1IndexX - h2IndexX, h1IndexY - h2IndexY);
      const currentAngle = Math.atan2(h2IndexY - h1IndexY, h2IndexX - h1IndexX);
      const midX = (h1IndexX + h2IndexX) / 2;
      const midY = (h1IndexY + h2IndexY) / 2;

      // Update mutable 2-hand tracking state
      twoHandTrackingRef.current.h1 = { x: h1IndexX, y: h1IndexY, pinch: h1Pinch, rawX: hand1[8].x, rawY: hand1[8].y };
      twoHandTrackingRef.current.h2 = { x: h2IndexX, y: h2IndexY, pinch: h2Pinch, rawX: hand2[8].x, rawY: hand2[8].y };
      twoHandTrackingRef.current.midX = midX;
      twoHandTrackingRef.current.midY = midY;

      if (dualHandModeRef.current === 'zoom_pan') {
        if (!twoHandTrackingRef.current.isTracking) {
          twoHandTrackingRef.current.isTracking = true;
          twoHandTrackingRef.current.prevDist = currentDist;
          twoHandTrackingRef.current.startDist = currentDist;
          twoHandTrackingRef.current.startZoom = spatialZoomRef.current;
          twoHandTrackingRef.current.angle = currentAngle;
        } else {
          const distDelta = currentDist - twoHandTrackingRef.current.prevDist;
          const angleDelta = currentAngle - twoHandTrackingRef.current.angle;
          twoHandTrackingRef.current.angle = currentAngle;

          if (Math.abs(distDelta) > 0.0015) {
            const zoomSpeed = 2.4;
            const nextZoom = Math.max(0.35, Math.min(3.2, spatialZoomRef.current + distDelta * zoomSpeed));
            spatialZoomRef.current = Number(nextZoom.toFixed(3));
            twoHandTrackingRef.current.prevDist = currentDist;
            twoHandTrackingRef.current.lastZoomTime = now;

            activeGestureTextRef.current = `🔍 Thu Phóng 2 Tay (Pinch-To-Zoom): ${Math.round(nextZoom * 100)}% • Khoảng Cách: ${Math.round(currentDist * 100)}cm`;

            // Transform any 3D Holograms near the midpoint of the 2 hands
            const holograms = pinnedHologramsRef.current;
            for (let i = 0; i < holograms.length; i++) {
              const h = holograms[i];
              const hDist = Math.hypot(h.bounds.centerX - midX, h.bounds.centerY - midY);
              if (hDist < 0.32) {
                h.scaleMultiplier = Math.max(0.4, Math.min(3.0, (h.scaleMultiplier || 1.0) * (1 + distDelta * 2.2)));
                h.rotationAngle = (h.rotationAngle || 0) + angleDelta;
              }
            }

            if (now - (twoHandTrackingRef.current.lastTelemetryUpdate || 0) > 180) {
              twoHandTrackingRef.current.lastTelemetryUpdate = now;
              setSpatialZoom(Number(nextZoom.toFixed(2)));
              setDualHandTelemetry({
                handsDetected: 2,
                distanceCm: Math.round(currentDist * 100),
                isZooming: true,
                zoomPercent: Math.round(nextZoom * 100),
                angleDeg: Math.round((currentAngle * 180) / Math.PI),
                h1Pinch,
                h2Pinch,
              });
            }

            if (now % 10 === 0) {
              morningAudio.triggerStarDrawTone(midY);
            }
          }
        }
      }
    } else {
      twoHandTrackingRef.current.isTracking = false;
    }

    let airWritingHandFound = false;

    hands.forEach((hand, handIdx) => {
      if (hand.length < 21) return;

      const wrist = hand[0];
      const thumbTip = hand[4];
      const indexTip = hand[8];
      const indexPip = hand[6];
      const middleTip = hand[12];
      const middlePip = hand[10];
      const ringTip = hand[16];
      const pinkyTip = hand[20];

      // Mirror coordinates to match natural user perspective
      const displayIndexX = isMirror ? (1 - indexTip.x) : indexTip.x;
      const displayIndexY = indexTip.y;
      const displayWristX = isMirror ? (1 - wrist.x) : wrist.x;
      const displayWristY = wrist.y;

      const distWristTo = (p: HandPoint) => Math.hypot(p.x - wrist.x, p.y - wrist.y);
      const distBetween = (p1: HandPoint, p2: HandPoint) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

      const isIndexRaised = indexTip.y < indexPip.y || distWristTo(indexTip) > distWristTo(indexPip);
      const isMiddleRaised = middleTip.y < middlePip.y || distWristTo(middleTip) > distWristTo(middlePip);
      const isRingCurled = ringTip.y >= hand[14].y || distWristTo(ringTip) < distWristTo(indexTip) * 0.9;
      const isPinkyCurled = pinkyTip.y >= hand[18].y || distWristTo(pinkyTip) < distWristTo(indexTip) * 0.9;
      const distThumbIndex = distBetween(thumbTip, indexTip);

      // PURE CONTACTLESS AIR WRITING, SELECTIVE ERASER & LOW-LATENCY STROKE ENGINE (No disruptive gesture triggers)
      let isDrawingActiveThisFrame = false;

      if (airWritingTriggerMode === 'pinch_to_draw') {
        // Pinch thumb and index together like holding a real physical pen!
        isDrawingActiveThisFrame = distThumbIndex < pinchThreshold;
      } else if (airWritingTriggerMode === 'palm_hover') {
        // Continuous writing whenever hand is visible and moving
        isDrawingActiveThisFrame = isIndexRaised || distBetween(indexTip, wrist) > 0.15;
      } else {
        // Point index finger clearly up (Index continuous)
        isDrawingActiveThisFrame = isIndexRaised && (!isMiddleRaised || distBetween(indexTip, middleTip) > 0.05);
      }

      // Detect 2-finger eraser gesture: Index + Middle raised together like an eraser bar
      const isTwoFingerEraserGesture = isIndexRaised && isMiddleRaised && distBetween(indexTip, middleTip) < 0.055 && isRingCurled && isPinkyCurled;
      const isEraserModeActive = activeToolRef.current === 'eraser' || isTwoFingerEraserGesture;

      // Apply Stroke Stabilizer & Hand Tremor Damper with Ultra-Low Latency support
      const smoothAlpha = isUltraLowLatencyRef.current
        ? (strokeStabilizer === 'high' ? 0.82 : strokeStabilizer === 'medium' ? 0.95 : 1.0)
        : (strokeStabilizer === 'high' ? 0.48 : strokeStabilizer === 'medium' ? 0.76 : 0.96);

      if (!smoothedPenPosRef.current) {
        smoothedPenPosRef.current = { x: displayIndexX, y: displayIndexY };
      } else {
        smoothedPenPosRef.current = {
          x: smoothedPenPosRef.current.x + (displayIndexX - smoothedPenPosRef.current.x) * smoothAlpha,
          y: smoothedPenPosRef.current.y + (displayIndexY - smoothedPenPosRef.current.y) * smoothAlpha
        };
      }

      const activePenX = smoothedPenPosRef.current.x;
      const activePenY = smoothedPenPosRef.current.y;

      airWritingHandFound = true;
      airPenPosRef.current = { x: activePenX, y: activePenY };

      if (isEraserModeActive) {
        // SELECTIVE ERASER: Remove only the stroke points within radius of finger tip
        const isErasingNow = isDrawingActiveThisFrame || isTwoFingerEraserGesture;
        if (isErasingNow) {
          const normRadius = (eraserRadiusRef.current || 32) / (canvasRef.current?.width || 1280);
          eraseStrokesNearPoint(activePenX, activePenY, normRadius);
          activeGestureTextRef.current = isTwoFingerEraserGesture 
            ? '✌️ Tẩy Nét Bằng 2 Ngón Tay (Chạm vào nét sai)' 
            : '🧹 Đang Tẩy Nét Sai Không Gian (Chạm để xóa)';
        } else {
          activeGestureTextRef.current = '🎯 Con Trỏ Cục Tẩy (Chụm ngón hoặc rê tay qua nét sai)';
        }
      } else if (isDrawingActiveThisFrame && (!twoHandTrackingRef.current.isTracking || dualHandModeRef.current === 'dual_draw')) {
        const lastPoint = lastStrokePointRef.current;
        const isStartingNewStroke = !lastPoint || !isAirPenDrawingRef.current;

        let hasMoved = false;
        if (isStartingNewStroke) {
          hasMoved = true;
          // Clear redo stack on brand new drawing
          if (redoStackRef.current.length > 0) {
            redoStackRef.current = [];
            setCanRedo(false);
          }
        } else {
          const moveDist = Math.hypot(activePenX - lastPoint.x, activePenY - lastPoint.y);
          // Movement threshold to prevent phantom ink when hand is stationary
          hasMoved = moveDist >= movementThreshold;
        }

        if (hasMoved) {
          isAirPenDrawingRef.current = true;
          lastStrokePointRef.current = { x: activePenX, y: activePenY };
          lastStrokeDrawTimeRef.current = now;

          // Dynamic calligraphy velocity modulation: stroke tapers gracefully when writing fast
          const distDelta = lastPoint ? Math.hypot(activePenX - lastPoint.x, activePenY - lastPoint.y) : 0;
          const dynamicSize = Math.max(brushSize * 0.5, Math.min(brushSize * 1.25, brushSize * (1.1 - distDelta * 12)));

          const color = brushType === 'rainbow'
            ? `hsl(${(now / 10) % 360}, 95%, 60%)`
            : brushType === 'stardust'
            ? '#e0f2fe'
            : brushType === 'plasma'
            ? '#f97316'
            : brushType === 'emerald'
            ? '#34d399'
            : brushType === 'galaxy'
            ? `hsl(${(now / 15 + 260) % 360}, 90%, 65%)`
            : brushType === 'neon'
            ? '#00f7ff'
            : brushType === 'quantum'
            ? '#ec4899'
            : brushType === 'matrix'
            ? '#22c55e'
            : brushType === 'aurora'
            ? `hsl(${(now / 12 + 130) % 180 + 100}, 90%, 60%)`
            : brushColor;

          drawStrokesRef.current.push({
            x: activePenX,
            y: activePenY,
            color,
            size: dynamicSize,
            brushType,
            timestamp: now,
            isNewStroke: isStartingNewStroke
          });

          // Controlled micro-particles via Zero-GC Particle Pool
          if (now % 3 === 0 && canvasRef.current) {
            const px = activePenX * canvasRef.current.width;
            const py = activePenY * canvasRef.current.height;
            const pColor = brushType === 'quantum' ? '#f472b6' : brushType === 'matrix' ? '#4ade80' : brushType === 'aurora' ? '#67e8f9' : color;
            spawnPooledParticle(
              px + (Math.random() - 0.5) * 8,
              py + (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 1.5,
              (Math.random() - 0.5) * 1.5,
              1.5 + Math.random() * 2.5,
              pColor,
              20 + Math.random() * 12
            );
          }

          // Increased capacity for long multi-character handwriting (up to 3000 stroke points)
          if (drawStrokesRef.current.length > 3000) {
            drawStrokesRef.current.shift();
          }

          if (now % 8 === 0) {
            morningAudio.triggerStarDrawTone(activePenY);
          }

          activeGestureTextRef.current = airWritingTriggerMode === 'pinch_to_draw' 
            ? '✍️ Đang Viết Theo Tay (Cân Bằng Nét)' 
            : '✍️ Đang Viết Theo Tay (Ngón Trỏ)';
        }
      } else if (!twoHandTrackingRef.current.isTracking) {
        // Lift pen / Hover mode
        lastStrokePointRef.current = null;
        isAirPenDrawingRef.current = false;
        activeGestureTextRef.current = airWritingTriggerMode === 'pinch_to_draw'
          ? '🎯 Ngòi Bút Định Vị (Chụm ngón để viết)'
          : airWritingTriggerMode === 'palm_hover'
          ? '🎯 Chế Độ Viết Tự Do'
          : '🎯 Ngòi Bút Định Vị (Giơ ngón trỏ để viết)';
      }

      prevWristPositionsRef.current[handIdx] = { x: wrist.x, y: wrist.y, time: now };
    });

    if (!airWritingHandFound) {
      isAirPenDrawingRef.current = false;
      airPenPosRef.current = null;
    }
  };

  const displayThumbX = (thumbTip: HandPoint) => {
    return isMirror ? (1 - thumbTip.x) : thumbTip.x;
  };

  // =========================================================================
  // 5. SPATIAL EMOJIS, SHAPES & CANVAS CLEAR
  // =========================================================================
  const spawnSpatialEmoji = (emojiChar: string, xRatio?: number, yRatio?: number, count: number = 3) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width || window.innerWidth;
    const h = canvas.height || window.innerHeight;

    const baseX = (xRatio !== undefined ? xRatio : 0.5) * w;
    const baseY = (yRatio !== undefined ? yRatio : 0.4) * h;

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;
      floatingEmojisRef.current.push({
        id: `emoji-${Date.now()}-${Math.random()}`,
        emoji: emojiChar,
        x: baseX + offsetX,
        y: baseY + offsetY,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -2.2 - Math.random() * 2.8,
        size: 32 + Math.random() * 20,
        scale: 0.2,
        alpha: 1,
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        life: 0,
        maxLife: 90 + Math.random() * 40
      });
    }

    morningAudio.triggerEmojiPop();
  };

  const spawnSpatialShape = (type: SpatialShapeItem['type'], xRatio: number, yRatio: number) => {
    spatialShapesRef.current.push({
      type,
      x: xRatio,
      y: yRatio,
      scale: 0.1,
      color: brushColor,
      rotation: 0,
      timestamp: Date.now()
    });
    morningAudio.triggerStarDrawTone(yRatio);
  };

  // =========================================================================
  // GRANULAR STROKE MANAGEMENT: UNDO, REDO & SELECTIVE SPATIAL ERASER
  // =========================================================================

  // Undo the most recent mistaken stroke segment (Xoá nét sai gần nhất)
  const undoLastStroke = () => {
    const strokes = drawStrokesRef.current;
    if (strokes.length === 0) return;

    let lastNewIdx = -1;
    for (let i = strokes.length - 1; i >= 0; i--) {
      if (strokes[i].isNewStroke) {
        lastNewIdx = i;
        break;
      }
    }

    if (lastNewIdx === -1) {
      lastNewIdx = 0;
    }

    const removedSegment = strokes.slice(lastNewIdx);
    redoStackRef.current.push(removedSegment);
    drawStrokesRef.current = strokes.slice(0, lastNewIdx);
    lastStrokePointRef.current = null;
    isAirPenDrawingRef.current = false;

    setStrokeCount(drawStrokesRef.current.length);
    setCanRedo(redoStackRef.current.length > 0);
    morningAudio.triggerUndoSound();
    setSnapshotToast('↩️ Đã hoàn tác nét vẽ sai gần nhất!');
    setTimeout(() => setSnapshotToast(null), 2500);
  };

  // Redo stroke segment (Khôi phục nét vừa hoàn tác)
  const redoLastStroke = () => {
    if (redoStackRef.current.length === 0) return;
    const segment = redoStackRef.current.pop();
    if (segment && segment.length > 0) {
      segment[0].isNewStroke = true;
      drawStrokesRef.current = [...drawStrokesRef.current, ...segment];
      setStrokeCount(drawStrokesRef.current.length);
      setCanRedo(redoStackRef.current.length > 0);
      morningAudio.triggerStarPop();
      setSnapshotToast('↪️ Đã khôi phục nét vẽ!');
      setTimeout(() => setSnapshotToast(null), 2500);
    }
  };

  // Selective Spatial Eraser: Delete only strokes touched by eraser cursor without clearing entire canvas
  const eraseStrokesNearPoint = (normX: number, normY: number, normRadius: number = 0.038) => {
    const strokes = drawStrokesRef.current;
    if (strokes.length === 0) return;

    const initialLen = strokes.length;
    const remaining: DrawStrokePoint[] = [];

    for (let i = 0; i < strokes.length; i++) {
      const pt = strokes[i];
      const d = Math.hypot(pt.x - normX, pt.y - normY);
      if (d >= normRadius) {
        remaining.push(pt);
      }
    }

    if (remaining.length < initialLen) {
      // Re-link broken segments cleanly
      for (let i = 0; i < remaining.length; i++) {
        if (i === 0) {
          remaining[i].isNewStroke = true;
        } else {
          const prev = remaining[i - 1];
          const cur = remaining[i];
          const gap = Math.hypot(cur.x - prev.x, cur.y - prev.y);
          if (gap > 0.08 || cur.timestamp - prev.timestamp > 200) {
            cur.isNewStroke = true;
          }
        }
      }

      drawStrokesRef.current = remaining;
      setStrokeCount(remaining.length);

      if (Date.now() % 4 === 0) {
        morningAudio.triggerEraserSound();
      }

      // Sparkle dust feedback at eraser location
      if (canvasRef.current && particlesRef.current.length < 40) {
        const px = normX * canvasRef.current.width;
        const py = normY * canvasRef.current.height;
        for (let p = 0; p < 2; p++) {
          particlesRef.current.push({
            x: px + (Math.random() - 0.5) * 14,
            y: py + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 2.0 + Math.random() * 2.0,
            color: '#f43f5e',
            alpha: 0.75,
            life: 0,
            maxLife: 14 + Math.random() * 8
          });
        }
      }
    }
  };

  const clearSpatialCanvas = () => {
    if (drawStrokesRef.current.length > 0) {
      // Save to redo stack so clearing can be undone if accidental!
      redoStackRef.current.push([...drawStrokesRef.current]);
      setCanRedo(true);
    }
    drawStrokesRef.current = [];
    spatialShapesRef.current = [];
    setStrokeCount(0);
    morningAudio.triggerClearBoardSweep();
    setSnapshotToast('🧹 Đã xóa bảng vẽ (Có thể bấm Hoàn tác để khôi phục)!');
    setTimeout(() => setSnapshotToast(null), 2500);
  };

  // =========================================================================
  // DUAL-INPUT TOUCH / PEN / MOUSE INTERACTION & 3D HOLOGRAM DRAG ENGINE
  // =========================================================================
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    // Check if pointer is pressing on a pinned 3D Hologram to drag / move it
    const holograms = pinnedHologramsRef.current;
    let hitHoloId: string | null = null;

    for (let i = 0; i < holograms.length; i++) {
      const h = holograms[i];
      const { minX, maxX, minY, maxY } = h.bounds;
      const pad = 0.04;
      if (normX >= minX - pad && normX <= maxX + pad && normY >= minY - pad && normY <= maxY + pad) {
        hitHoloId = h.id;
        draggedHologramIdRef.current = h.id;
        hologramDragOffsetRef.current = {
          offsetX: normX - h.bounds.centerX,
          offsetY: normY - h.bounds.centerY
        };
        morningAudio.triggerStarPop();
        setSnapshotToast(`🎯 Đang di chuyển vật thể 3D "${h.title}"`);
        setTimeout(() => setSnapshotToast(null), 1500);
        break;
      }
    }

    if (hitHoloId) {
      activePointerIdRef.current = e.pointerId;
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    // Direct drawing on screen (Stylus / Touch / Mouse)
    isPointerDrawingRef.current = true;
    setIsCameraPromptDismissed(true);
    activePointerIdRef.current = e.pointerId;
    touchLastPosRef.current = { x: normX, y: normY, time: performance.now() };

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const isEraser = activeToolRef.current === 'eraser';
    if (isEraser) {
      const normRadius = (eraserRadiusRef.current || 32) / canvas.width;
      eraseStrokesNearPoint(normX, normY, normRadius);
      activeGestureTextRef.current = '🧹 Đang Tẩy Nét Chạm Màn Hình';
    } else {
      // Clear redo stack on brand new drawing
      if (redoStackRef.current.length > 0) {
        redoStackRef.current = [];
        setCanRedo(false);
      }

      const now = performance.now();
      const bType = brushTypeRef.current;
      const col = brushColorRef.current;
      const bSize = brushSizeRef.current;

      const pressure = e.pressure && e.pressure > 0 ? Math.max(0.4, Math.min(1.4, e.pressure * 1.6)) : 1.0;
      const dynamicSize = bSize * pressure;

      drawStrokesRef.current.push({
        x: normX,
        y: normY,
        color: col,
        size: dynamicSize,
        brushType: bType,
        timestamp: now,
        isNewStroke: true
      });

      setStrokeCount(drawStrokesRef.current.length);
      morningAudio.triggerStarDrawTone(normY);

      // Micro particle
      const px = normX * canvas.width;
      const py = normY * canvas.height;
      spawnPooledParticle(px, py, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 2.5, col, 25);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    // A. Dragging 3D Hologram Object
    if (draggedHologramIdRef.current) {
      const hId = draggedHologramIdRef.current;
      const offset = hologramDragOffsetRef.current || { offsetX: 0, offsetY: 0 };
      const newCenterX = Math.max(0.08, Math.min(0.92, normX - offset.offsetX));
      const newCenterY = Math.max(0.08, Math.min(0.92, normY - offset.offsetY));

      const updated = pinnedHologramsRef.current.map((holo) => {
        if (holo.id !== hId) return holo;
        const dx = newCenterX - holo.bounds.centerX;
        const dy = newCenterY - holo.bounds.centerY;

        const shiftedStrokes = holo.strokes.map(s => ({
          ...s,
          x: Math.max(0.02, Math.min(0.98, s.x + dx)),
          y: Math.max(0.02, Math.min(0.98, s.y + dy))
        }));

        return {
          ...holo,
          strokes: shiftedStrokes,
          bounds: {
            ...holo.bounds,
            centerX: newCenterX,
            centerY: newCenterY,
            minX: holo.bounds.minX + dx,
            maxX: holo.bounds.maxX + dx,
            minY: holo.bounds.minY + dy,
            maxY: holo.bounds.maxY + dy
          }
        };
      });

      pinnedHologramsRef.current = updated;
      setPinnedHolograms([...updated]);
      return;
    }

    // B. Direct Touch/Stylus Drawing
    if (!isPointerDrawingRef.current) return;

    const isEraser = activeToolRef.current === 'eraser';
    if (isEraser) {
      const normRadius = (eraserRadiusRef.current || 32) / canvas.width;
      eraseStrokesNearPoint(normX, normY, normRadius);
      activeGestureTextRef.current = '🧹 Đang Tẩy Nét Chạm Màn Hình';
      return;
    }

    const lastPos = touchLastPosRef.current;
    if (!lastPos) {
      touchLastPosRef.current = { x: normX, y: normY, time: performance.now() };
      return;
    }

    const dist = Math.hypot(normX - lastPos.x, normY - lastPos.y);
    if (dist < 0.002) return; // Ignore micro jitter

    const now = performance.now();
    const bType = brushTypeRef.current;
    const col = brushColorRef.current;
    const bSize = brushSizeRef.current;
    const pressure = e.pressure && e.pressure > 0 ? Math.max(0.4, Math.min(1.4, e.pressure * 1.6)) : 1.0;
    const dynamicSize = Math.max(bSize * 0.5, Math.min(bSize * 1.3, (bSize * pressure) * (1.1 - dist * 10)));

    // Adaptive Catmull-Rom interpolation if cursor moved quickly
    if (dist > 0.015) {
      const steps = Math.min(4, Math.ceil(dist / 0.008));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        drawStrokesRef.current.push({
          x: lastPos.x + (normX - lastPos.x) * t,
          y: lastPos.y + (normY - lastPos.y) * t,
          color: col,
          size: dynamicSize,
          brushType: bType,
          timestamp: now,
          isNewStroke: false
        });
      }
    }

    drawStrokesRef.current.push({
      x: normX,
      y: normY,
      color: col,
      size: dynamicSize,
      brushType: bType,
      timestamp: now,
      isNewStroke: false
    });

    touchLastPosRef.current = { x: normX, y: normY, time: now };
    setStrokeCount(drawStrokesRef.current.length);

    if (Math.random() < 0.35) {
      const px = normX * canvas.width;
      const py = normY * canvas.height;
      spawnPooledParticle(px, py, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 2.0, col, 20);
    }

    if (Date.now() % 6 === 0) {
      morningAudio.triggerStarDrawTone(normY);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDrawingRef.current = false;
    touchLastPosRef.current = null;
    draggedHologramIdRef.current = null;
    hologramDragOffsetRef.current = null;
    activePointerIdRef.current = null;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Global Keyboard Shortcuts for Pro Creator Flow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redoLastStroke();
        } else {
          undoLastStroke();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoLastStroke();
      } else if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const nextTool = activeTool === 'pen' ? 'eraser' : 'pen';
        setActiveTool(nextTool);
        setSnapshotToast(nextTool === 'eraser' ? '🧹 Đã bật Cục Tẩy (E)' : '✍️ Đã bật Bút Vẽ (E)');
        setTimeout(() => setSnapshotToast(null), 2000);
      } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        materializeActiveStrokesTo3DHologram();
      } else if ((e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        autoBalanceScreen();
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  // =========================================================================
  // MATHEMATICAL & GEOMETRIC SHAPE GENERATORS (Chống méo, nắn thẳng hình toán học)
  // =========================================================================

  // 1. Đoạn thẳng chuẩn (Straight line segment)
  const generateStraightLineStrokes = (x1: number, y1: number, x2: number, y2: number, color: string, bType: any, size: number, steps: number = 32): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 2. Mũi tên / Vector toán học (Math Vector Arrow)
  const generateMathArrowStrokes = (x1: number, y1: number, x2: number, y2: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts = generateStraightLineStrokes(x1, y1, x2, y2, color, bType, size, 32);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = Math.max(0.025, Math.hypot(x2 - x1, y2 - y1) * 0.22);
    
    // Left barb
    const lx = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const ly = y2 - headLen * Math.sin(angle - Math.PI / 6);
    pts.push({ x: x2, y: y2, color, size, brushType: bType, timestamp: Date.now(), isNewStroke: true });
    pts.push({ x: lx, y: ly, color, size, brushType: bType, timestamp: Date.now(), isNewStroke: false });

    // Right barb
    const rx = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const ry = y2 - headLen * Math.sin(angle + Math.PI / 6);
    pts.push({ x: x2, y: y2, color, size, brushType: bType, timestamp: Date.now(), isNewStroke: true });
    pts.push({ x: rx, y: ry, color, size, brushType: bType, timestamp: Date.now(), isNewStroke: false });

    return pts;
  };

  // 3. Hệ trục tọa độ Oxy toán học chuẩn (Oxy Coordinate System)
  const generateMathCoordinateAxesStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const minX = cx - w * 0.48;
    const maxX = cx + w * 0.48;
    const minY = cy - h * 0.48;
    const maxY = cy + h * 0.48;

    // Trục hoành Ox (Horizontal)
    pts = pts.concat(generateMathArrowStrokes(minX, cy, maxX, cy, color, bType, size));

    // Trục tung Oy (Vertical)
    pts = pts.concat(generateMathArrowStrokes(cx, maxY, cx, minY, color, bType, size));

    // Vạch chia đơn vị trên Ox & Oy
    const tickLen = 0.012;
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const tx = cx + (i / 4) * (w * 0.4);
      pts.push({ x: tx, y: cy - tickLen, color, size: size * 0.8, brushType: bType, timestamp: Date.now(), isNewStroke: true });
      pts.push({ x: tx, y: cy + tickLen, color, size: size * 0.8, brushType: bType, timestamp: Date.now(), isNewStroke: false });

      const ty = cy + (i / 4) * (h * 0.4);
      pts.push({ x: cx - tickLen, y: ty, color, size: size * 0.8, brushType: bType, timestamp: Date.now(), isNewStroke: true });
      pts.push({ x: cx + tickLen, y: ty, color, size: size * 0.8, brushType: bType, timestamp: Date.now(), isNewStroke: false });
    }

    return pts;
  };

  // 4. Tam giác toán học chuẩn (Math Triangle - Equilateral, Right-angled, Isosceles)
  const generateMathTriangleStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number, subtype: 'equilateral' | 'right_angled' | 'isosceles' = 'equilateral'): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const minX = cx - w * 0.5;
    const maxX = cx + w * 0.5;
    const minY = cy - h * 0.5;
    const maxY = cy + h * 0.5;

    if (subtype === 'right_angled') {
      // Tam giác vuông tại góc dưới trái (minX, maxY)
      pts = pts.concat(generateStraightLineStrokes(minX, minY, minX, maxY, color, bType, size, 20));
      pts = pts.concat(generateStraightLineStrokes(minX, maxY, maxX, maxY, color, bType, size, 20));
      pts = pts.concat(generateStraightLineStrokes(maxX, maxY, minX, minY, color, bType, size, 20));

      // Ký hiệu góc vuông 90°
      const sq = Math.min(w, h) * 0.14;
      pts.push({ x: minX, y: maxY - sq, color, size: size * 0.75, brushType: bType, timestamp: Date.now(), isNewStroke: true });
      pts.push({ x: minX + sq, y: maxY - sq, color, size: size * 0.75, brushType: bType, timestamp: Date.now(), isNewStroke: false });
      pts.push({ x: minX + sq, y: maxY, color, size: size * 0.75, brushType: bType, timestamp: Date.now(), isNewStroke: false });
    } else {
      // Tam giác đều / cân (đỉnh trên cx, đáy ở maxY)
      const topX = cx;
      const topY = minY;
      const blX = minX;
      const blY = maxY;
      const brX = maxX;
      const brY = maxY;

      pts = pts.concat(generateStraightLineStrokes(topX, topY, blX, blY, color, bType, size, 24));
      pts = pts.concat(generateStraightLineStrokes(blX, blY, brX, brY, color, bType, size, 24));
      pts = pts.concat(generateStraightLineStrokes(brX, brY, topX, topY, color, bType, size, 24));
    }
    return pts;
  };

  // 5. Hình chữ nhật / Hình vuông toán học chuẩn (Math Rectangle / Square)
  const generateMathRectangleStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number, isSquare: boolean = false): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const side = isSquare ? Math.max(w, h) : 0;
    const rw = isSquare ? side : w;
    const rh = isSquare ? side : h;
    const minX = cx - rw * 0.5;
    const maxX = cx + rw * 0.5;
    const minY = cy - rh * 0.5;
    const maxY = cy + rh * 0.5;

    // Cạnh 1: Trên (Top)
    pts = pts.concat(generateStraightLineStrokes(minX, minY, maxX, minY, color, bType, size, 20));
    // Cạnh 2: Phải (Right)
    pts = pts.concat(generateStraightLineStrokes(maxX, minY, maxX, maxY, color, bType, size, 20));
    // Cạnh 3: Dưới (Bottom)
    pts = pts.concat(generateStraightLineStrokes(maxX, maxY, minX, maxY, color, bType, size, 20));
    // Cạnh 4: Trái (Left)
    pts = pts.concat(generateStraightLineStrokes(minX, maxY, minX, minY, color, bType, size, 20));

    return pts;
  };

  // 6. Đồ thị Parabol đối xứng chuẩn toán học y = ax²
  const generateMathParabolaStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const total = 60;
    const minX = cx - w * 0.48;
    const maxX = cx + w * 0.48;
    const bottomY = cy + h * 0.45;
    const topY = cy - h * 0.45;

    for (let i = 0; i <= total; i++) {
      const t = (i / total) * 2 - 1; // [-1, 1]
      const px = cx + t * (w * 0.48);
      const py = topY + (1 - t * t) * (bottomY - topY);
      pts.push({
        x: px,
        y: py,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 7. Đồ thị hàm số hình Sin mượt mà
  const generateMathSinWaveStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const total = 64;
    const minX = cx - w * 0.48;
    const maxX = cx + w * 0.48;
    const amp = h * 0.4;

    for (let i = 0; i <= total; i++) {
      const t = i / total;
      const px = minX + (maxX - minX) * t;
      const py = cy - Math.sin(t * Math.PI * 2) * amp;
      pts.push({
        x: px,
        y: py,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 8. Góc toán học có cung đo góc (Math Angle)
  const generateMathAngleStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const vertexX = cx - w * 0.45;
    const vertexY = cy + h * 0.45;
    const ray1X = cx + w * 0.45;
    const ray1Y = vertexY;
    const ray2X = cx + w * 0.35;
    const ray2Y = cy - h * 0.45;

    // 2 tia của góc
    pts = pts.concat(generateStraightLineStrokes(vertexX, vertexY, ray1X, ray1Y, color, bType, size, 24));
    pts = pts.concat(generateStraightLineStrokes(vertexX, vertexY, ray2X, ray2Y, color, bType, size, 24));

    // Cung đo góc (Angle arc)
    const arcR = Math.min(w, h) * 0.22;
    const angle2 = Math.atan2(ray2Y - vertexY, ray2X - vertexX);
    for (let i = 0; i <= 16; i++) {
      const theta = (i / 16) * angle2;
      pts.push({
        x: vertexX + Math.cos(theta) * arcR,
        y: vertexY + Math.sin(theta) * arcR,
        color,
        size: size * 0.8,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 9. Khối hộp không gian 3D / Hình lập phương (3D Math Cube)
  const generateMath3DCubeStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const sizeBox = Math.min(w, h) * 0.65;
    const offset = sizeBox * 0.35;

    // Mặt trước (Front square)
    const fx1 = cx - sizeBox * 0.5 - offset * 0.5;
    const fy1 = cy - sizeBox * 0.5 + offset * 0.5;
    const fx2 = fx1 + sizeBox;
    const fy2 = fy1 + sizeBox;
    pts = pts.concat(generateMathRectangleStrokes((fx1 + fx2) / 2, (fy1 + fy2) / 2, sizeBox, sizeBox, color, bType, size));

    // Mặt sau (Back square)
    const bx1 = fx1 + offset;
    const by1 = fy1 - offset;
    const bx2 = fx2 + offset;
    const by2 = fy2 - offset;
    pts = pts.concat(generateMathRectangleStrokes((bx1 + bx2) / 2, (by1 + by2) / 2, sizeBox, sizeBox, color, bType, size * 0.85));

    // 4 cạnh nối không gian
    pts = pts.concat(generateStraightLineStrokes(fx1, fy1, bx1, by1, color, bType, size * 0.9, 12));
    pts = pts.concat(generateStraightLineStrokes(fx2, fy1, bx2, by1, color, bType, size * 0.9, 12));
    pts = pts.concat(generateStraightLineStrokes(fx2, fy2, bx2, by2, color, bType, size * 0.9, 12));
    pts = pts.concat(generateStraightLineStrokes(fx1, fy2, bx1, by2, color, bType, size * 0.9, 12));

    return pts;
  };

  // 10. Hình chóp không gian 3D (3D Math Pyramid)
  const generateMath3DPyramidStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const apexX = cx;
    const apexY = cy - h * 0.45;
    const bLeftX = cx - w * 0.45;
    const bLeftY = cy + h * 0.35;
    const bFrontX = cx - w * 0.1;
    const bFrontY = cy + h * 0.45;
    const bRightX = cx + w * 0.45;
    const bRightY = cy + h * 0.35;

    // Đáy
    pts = pts.concat(generateStraightLineStrokes(bLeftX, bLeftY, bFrontX, bFrontY, color, bType, size, 16));
    pts = pts.concat(generateStraightLineStrokes(bFrontX, bFrontY, bRightX, bRightY, color, bType, size, 16));
    pts = pts.concat(generateStraightLineStrokes(bRightX, bRightY, bLeftX, bLeftY, color, bType, size * 0.7, 16));

    // 3 cạnh bên
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, bLeftX, bLeftY, color, bType, size, 18));
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, bFrontX, bFrontY, color, bType, size, 18));
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, bRightX, bRightY, color, bType, size, 18));

    return pts;
  };

  // 11. Hình thoi / Hình bình hành toán học (Math Rhombus)
  const generateMathRhombusStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const topX = cx, topY = cy - h * 0.48;
    const rightX = cx + w * 0.48, rightY = cy;
    const bottomX = cx, bottomY = cy + h * 0.48;
    const leftX = cx - w * 0.48, leftY = cy;

    pts = pts.concat(generateStraightLineStrokes(topX, topY, rightX, rightY, color, bType, size, 20));
    pts = pts.concat(generateStraightLineStrokes(rightX, rightY, bottomX, bottomY, color, bType, size, 20));
    pts = pts.concat(generateStraightLineStrokes(bottomX, bottomY, leftX, leftY, color, bType, size, 20));
    pts = pts.concat(generateStraightLineStrokes(leftX, leftY, topX, topY, color, bType, size, 20));

    return pts;
  };

  // 12. Mặt cầu không gian 3D (3D Math Sphere Wireframe / Kinh tuyến & Vĩ tuyến)
  const generateMath3DSphereStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const r = Math.min(w, h) * 0.45;
    const steps = 48;

    // Vòng tròn bao ngoài (Equator outer ring)
    pts = pts.concat(generatePerfectCircleStrokes(cx, cy, r * 2, r * 2, color, bType, size));

    // Vĩ tuyến ngang (Horizontal Ellipse Latitudes)
    const latRadii = [0.85, 0.5, -0.5, -0.85];
    latRadii.forEach(lat => {
      const latY = cy + lat * r * 0.5;
      const rx = Math.sqrt(Math.max(0, 1 - lat * lat * 0.35)) * r;
      const ry = r * 0.28 * Math.sqrt(Math.max(0, 1 - lat * lat * 0.35));
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        pts.push({
          x: cx + Math.cos(theta) * rx,
          y: latY + Math.sin(theta) * ry,
          color,
          size: size * 0.75,
          brushType: bType,
          timestamp: Date.now(),
          isNewStroke: i === 0
        });
      }
    });

    // Kinh tuyến đứng (Vertical Ellipse Longitudes)
    const longRotations = [0.35, 0.7];
    longRotations.forEach(sc => {
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        pts.push({
          x: cx + Math.cos(theta) * (r * sc),
          y: cy + Math.sin(theta) * r,
          color,
          size: size * 0.75,
          brushType: bType,
          timestamp: Date.now(),
          isNewStroke: i === 0
        });
      }
    });

    return pts;
  };

  // 13. Hình trụ không gian 3D (3D Math Cylinder)
  const generateMath3DCylinderStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const rx = w * 0.42;
    const ry = h * 0.12;
    const topY = cy - h * 0.38;
    const botY = cy + h * 0.38;
    const steps = 40;

    // Mặt Elip trên
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(theta) * rx,
        y: topY + Math.sin(theta) * ry,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }

    // Mặt Elip dưới
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(theta) * rx,
        y: botY + Math.sin(theta) * ry,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }

    // 2 đường sinh bên (Left and Right edges)
    pts = pts.concat(generateStraightLineStrokes(cx - rx, topY, cx - rx, botY, color, bType, size, 20));
    pts = pts.concat(generateStraightLineStrokes(cx + rx, topY, cx + rx, botY, color, bType, size, 20));

    // Trục trung tâm nét đứt
    pts = pts.concat(generateStraightLineStrokes(cx, topY, cx, botY, color, bType, size * 0.65, 12));

    return pts;
  };

  // 14. Hình nón không gian 3D (3D Math Cone)
  const generateMath3DConeStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const apexX = cx;
    const apexY = cy - h * 0.45;
    const rx = w * 0.45;
    const ry = h * 0.14;
    const botY = cy + h * 0.38;
    const steps = 40;

    // Đáy hình nón (Elip)
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(theta) * rx,
        y: botY + Math.sin(theta) * ry,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }

    // 2 đường sinh bên từ đỉnh xuống mép đáy
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, cx - rx, botY, color, bType, size, 20));
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, cx + rx, botY, color, bType, size, 20));

    // Đường cao h
    pts = pts.concat(generateStraightLineStrokes(apexX, apexY, cx, botY, color, bType, size * 0.65, 14));

    return pts;
  };

  // 15. Đồ thị Hyperbol toán học x²/a² - y²/b² = 1 (Math Hyperbola)
  const generateMathHyperbolaStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const steps = 36;
    const a = w * 0.16;
    const b = h * 0.22;

    // Nhánh phải (Right branch)
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2.8 - 1.4; // sinh parameter
      const x = cx + a * Math.cosh(t);
      const y = cy + b * Math.sinh(t);
      if (x <= cx + w * 0.48 && y >= cy - h * 0.48 && y <= cy + h * 0.48) {
        pts.push({
          x,
          y,
          color,
          size,
          brushType: bType,
          timestamp: Date.now(),
          isNewStroke: i === 0
        });
      }
    }

    // Nhánh trái (Left branch)
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2.8 - 1.4;
      const x = cx - a * Math.cosh(t);
      const y = cy + b * Math.sinh(t);
      if (x >= cx - w * 0.48 && y >= cy - h * 0.48 && y <= cy + h * 0.48) {
        pts.push({
          x,
          y,
          color,
          size,
          brushType: bType,
          timestamp: Date.now(),
          isNewStroke: i === 0
        });
      }
    }

    // Đường tiệm cận (Asymptotes)
    const asymX = w * 0.44;
    const asymY = (b / a) * asymX;
    pts.push({ x: cx - asymX, y: cy - asymY, color, size: size * 0.6, brushType: bType, timestamp: Date.now(), isNewStroke: true });
    pts.push({ x: cx + asymX, y: cy + asymY, color, size: size * 0.6, brushType: bType, timestamp: Date.now(), isNewStroke: false });

    pts.push({ x: cx - asymX, y: cy + asymY, color, size: size * 0.6, brushType: bType, timestamp: Date.now(), isNewStroke: true });
    pts.push({ x: cx + asymX, y: cy - asymY, color, size: size * 0.6, brushType: bType, timestamp: Date.now(), isNewStroke: false });

    return pts;
  };

  // 16. Đường xoắn ốc vàng Fibonacci / Logarithmic Golden Spiral
  const generateMathGoldenSpiralStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const steps = 120;
    const maxTheta = Math.PI * 5.5;
    const scale = Math.min(w, h) * 0.016;

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * maxTheta;
      const r = scale * Math.exp(0.18 * theta);
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      pts.push({
        x,
        y,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 17. Đường xoắn ốc không gian 3D Helix / DNA Lò xo (3D Spatial Helix)
  const generateMath3DHelixStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const steps = 110;
    const loops = 4;
    const rx = w * 0.38;
    const totalH = h * 0.85;
    const startY = cy - totalH * 0.5;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2 * loops;
      const x = cx + Math.cos(angle) * rx;
      const y = startY + t * totalH + Math.sin(angle) * (totalH * 0.05);
      pts.push({
        x,
        y,
        color,
        size: size * (0.8 + 0.4 * Math.sin(angle)),
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // 18. Vòng xuyến không gian 3D (3D Torus Ring Wireframe)
  const generateMath3DTorusStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    let pts: DrawStrokePoint[] = [];
    const R = Math.min(w, h) * 0.34; // Major radius
    const r = Math.min(w, h) * 0.12; // Minor radius
    const rings = 12;
    const ptsPerRing = 24;

    for (let ring = 0; ring < rings; ring++) {
      const u = (ring / rings) * Math.PI * 2;
      const centerRx = cx + Math.cos(u) * R;
      const centerRy = cy + Math.sin(u) * (R * 0.45); // Tilted projection

      for (let i = 0; i <= ptsPerRing; i++) {
        const v = (i / ptsPerRing) * Math.PI * 2;
        const px = centerRx + Math.cos(u) * Math.cos(v) * r;
        const py = centerRy + Math.sin(v) * r;
        pts.push({
          x: px,
          y: py,
          color,
          size: size * 0.7,
          brushType: bType,
          timestamp: Date.now(),
          isNewStroke: i === 0
        });
      }
    }
    return pts;
  };

  // 12. Các hình biểu tượng hoàn hảo (Trái tim, Sao, Tròn, Mặt trời, Vô cực)
  const generatePerfectHeartStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const total = 70;
    const radiusX = Math.max(0.04, w * 0.48);
    const radiusY = Math.max(0.04, h * 0.48);
    for (let i = 0; i <= total; i++) {
      const t = (i / total) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push({
        x: cx + (hx / 16) * radiusX,
        y: cy + (hy / 16) * radiusY,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  const generatePerfectStarStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const points = 5;
    const outerR = Math.max(0.04, Math.max(w, h) * 0.5);
    const innerR = outerR * 0.42;
    for (let i = 0; i <= points * 2; i++) {
      const angle = (i * Math.PI / points) - Math.PI / 2;
      const r = (i % 2 === 0) ? outerR : innerR;
      pts.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  const generatePerfectCircleStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const total = 64;
    const rx = Math.max(0.04, w * 0.5);
    const ry = Math.max(0.04, h * 0.5);
    for (let i = 0; i <= total; i++) {
      const angle = (i / total) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  const generatePerfectSunStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const r = Math.max(0.03, Math.min(w, h) * 0.32);
    for (let i = 0; i <= 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    for (let ray = 0; ray < 8; ray++) {
      const angle = (ray / 8) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(angle) * (r * 1.25),
        y: cy + Math.sin(angle) * (r * 1.25),
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: true
      });
      pts.push({
        x: cx + Math.cos(angle) * (r * 1.7),
        y: cy + Math.sin(angle) * (r * 1.7),
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: false
      });
    }
    return pts;
  };

  const generatePerfectInfinityStrokes = (cx: number, cy: number, w: number, h: number, color: string, bType: any, size: number): DrawStrokePoint[] => {
    const pts: DrawStrokePoint[] = [];
    const total = 80;
    const a = Math.max(0.05, w * 0.48);
    for (let i = 0; i <= total; i++) {
      const t = (i / total) * Math.PI * 2;
      const scale = a / (1 + Math.sin(t) * Math.sin(t));
      pts.push({
        x: cx + scale * Math.cos(t),
        y: cy + scale * Math.sin(t) * Math.cos(t) * 1.15,
        color,
        size,
        brushType: bType,
        timestamp: Date.now(),
        isNewStroke: i === 0
      });
    }
    return pts;
  };

  // Local Shape Snapper (Tự động nhận diện & nắn thẳng hình học toán học ngay khi vẽ xong)
  const detectAndSnapGeometricShape = (strokes: DrawStrokePoint[]): DrawStrokePoint[] | null => {
    if (!autoShapeSnap || strokes.length < 8) return null;

    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    strokes.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    const w = maxX - minX;
    const h = maxY - minY;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    if (w < 0.03 || h < 0.03) return null;

    const first = strokes[0];
    const last = strokes[strokes.length - 1];
    const closeDist = Math.hypot(first.x - last.x, first.y - last.y);
    const isClosed = closeDist < Math.max(w, h) * 0.38;
    const col = strokes[0]?.color || brushColor;
    const bType = strokes[0]?.brushType || brushType;
    const bSize = strokes[0]?.size || brushSize;

    // 1. Kiểm tra Đoạn thẳng (Straight Line)
    let totalPathLen = 0;
    for (let i = 1; i < strokes.length; i++) {
      totalPathLen += Math.hypot(strokes[i].x - strokes[i - 1].x, strokes[i].y - strokes[i - 1].y);
    }
    const directDist = Math.hypot(last.x - first.x, last.y - first.y);
    if (!isClosed && directDist / Math.max(0.001, totalPathLen) > 0.88 && totalPathLen > 0.08) {
      return generateStraightLineStrokes(first.x, first.y, last.x, last.y, col, bType, bSize);
    }

    // 2. Kiểm tra Hình Tròn / Elip (Circle)
    const avgR = (w + h) / 4;
    let variance = 0;
    strokes.forEach(pt => {
      const dist = Math.hypot(pt.x - cx, pt.y - cy);
      variance += Math.pow(dist - avgR, 2);
    });
    variance /= strokes.length;
    const stdDev = Math.sqrt(variance);

    if (isClosed && stdDev / avgR < 0.22 && Math.abs(w - h) / Math.max(w, h) < 0.35) {
      return generatePerfectCircleStrokes(cx, cy, w, h, col, bType, bSize);
    }

    // 3. Kiểm tra Hình Chữ Nhật / Hình Vuông (Rectangle / Square)
    if (isClosed && strokes.length >= 16) {
      // Check 4 corner distribution
      const isCornerNear = (px: number, py: number) => {
        return strokes.some(p => Math.hypot(p.x - px, p.y - py) < Math.max(w, h) * 0.22);
      };
      if (
        isCornerNear(minX, minY) &&
        isCornerNear(maxX, minY) &&
        isCornerNear(maxX, maxY) &&
        isCornerNear(minX, maxY)
      ) {
        const isSq = Math.abs(w - h) / Math.max(w, h) < 0.25;
        return generateMathRectangleStrokes(cx, cy, w, h, col, bType, bSize, isSq);
      }
    }

    // 4. Kiểm tra Tam Giác (Triangle)
    if (isClosed && strokes.length >= 14) {
      const topCount = strokes.filter(p => p.y < minY + h * 0.25).length;
      const blCount = strokes.filter(p => p.x < minX + w * 0.3 && p.y > maxY - h * 0.3).length;
      const brCount = strokes.filter(p => p.x > maxX - w * 0.3 && p.y > maxY - h * 0.3).length;
      if (topCount > 0 && blCount > 0 && brCount > 0) {
        return generateMathTriangleStrokes(cx, cy, w, h, col, bType, bSize, 'equilateral');
      }
    }

    // 5. Kiểm tra Trái Tim (Heart)
    const topMid = strokes.filter(p => Math.abs(p.x - cx) < w * 0.15 && p.y < cy);
    const bottomTip = strokes.find(p => p.y >= maxY - h * 0.18 && Math.abs(p.x - cx) < w * 0.25);
    if (isClosed && topMid.length > 0 && bottomTip && h > w * 0.65) {
      return generatePerfectHeartStrokes(cx, cy, w, h, col, bType, bSize);
    }

    return null;
  };

  // AI Deep Beautification & Math Geometry Straightener (Gemini Vision AI Engine)
  const beautifyAndReconstructStrokesWithAI = async () => {
    if (isAiBeautifying || isRecognizingText) return;
    let currentStrokes = [...drawStrokesRef.current];
    if (currentStrokes.length < 5) {
      setSnapshotToast('⚠️ Hãy viết chữ hoặc vẽ hình toán học trước khi dùng AI nắn chỉnh');
      setTimeout(() => setSnapshotToast(null), 3000);
      return;
    }

    setIsAiBeautifying(true);
    morningAudio.triggerStarPop();
    setSnapshotToast('🪄 AI đang phân tích & nắn thẳng hình học toán học chuẩn xác...');

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      currentStrokes.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
      const w = Math.max(0.08, maxX - minX);
      const h = Math.max(0.08, maxY - minY);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 640;
      snapCanvas.height = 360;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) return;

      sCtx.fillStyle = '#050507';
      sCtx.fillRect(0, 0, 640, 360);
      sCtx.drawImage(canvas, 0, 0, 640, 360);
      const base64Image = snapCanvas.toDataURL('image/jpeg', 0.88);

      const response = await fetch('/api/gemini/space-vision-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          drawingStrokesCount: currentStrokes.length,
          activeMode: 'air_writing',
          prompt: 'Nhận diện hình vẽ toán học (tam giác, hình chữ nhật/vuông, hệ trục tọa độ Oxy, đoạn thẳng, vector/mũi tên, đường tròn, parabol, hình sin, góc, khối hộp 3D, hình chóp 3D, mặt cầu 3D, hình trụ 3D, hình nón 3D, hyperbol, xoắn ốc Fibonacci, xoắn ốc 3D helix, vòng xuyến torus, hình thoi) hoặc chữ viết tay / công thức toán trong ảnh. Hãy nhận diện chuẩn xác để hệ thống nắn thẳng toàn bộ các cạnh và góc hoàn hảo.'
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        const resData = json.data;
        const cat = resData.recognizedCategory || 'text';
        const col = currentStrokes[0]?.color || brushColor;
        const bType = currentStrokes[0]?.brushType || brushType;
        const bSize = currentStrokes[0]?.size || brushSize;

        let perfectedStrokes: DrawStrokePoint[] | null = null;
        
        // Tái tạo hình toán học & hình học chuẩn xác từ AI
        if (cat === 'math_triangle') {
          const subtype = resData.shapeDetails?.subtype === 'right_angled' ? 'right_angled' : 'equilateral';
          perfectedStrokes = generateMathTriangleStrokes(cx, cy, w, h, col, bType, bSize, subtype);
        } else if (cat === 'math_rectangle') {
          const isSq = resData.shapeDetails?.subtype === 'square' || Math.abs(w - h) / Math.max(w, h) < 0.25;
          perfectedStrokes = generateMathRectangleStrokes(cx, cy, w, h, col, bType, bSize, isSq);
        } else if (cat === 'math_coordinate_system') {
          perfectedStrokes = generateMathCoordinateAxesStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_line') {
          const first = currentStrokes[0];
          const last = currentStrokes[currentStrokes.length - 1];
          perfectedStrokes = generateStraightLineStrokes(first.x, first.y, last.x, last.y, col, bType, bSize);
        } else if (cat === 'math_arrow') {
          const first = currentStrokes[0];
          const last = currentStrokes[currentStrokes.length - 1];
          perfectedStrokes = generateMathArrowStrokes(first.x, first.y, last.x, last.y, col, bType, bSize);
        } else if (cat === 'math_circle' || cat === 'circle') {
          perfectedStrokes = generatePerfectCircleStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_parabola') {
          perfectedStrokes = generateMathParabolaStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_sin_wave') {
          perfectedStrokes = generateMathSinWaveStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_angle') {
          perfectedStrokes = generateMathAngleStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_cube') {
          perfectedStrokes = generateMath3DCubeStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_pyramid') {
          perfectedStrokes = generateMath3DPyramidStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_sphere' || cat === 'math_3d_sphere') {
          perfectedStrokes = generateMath3DSphereStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_cylinder' || cat === 'math_3d_cylinder') {
          perfectedStrokes = generateMath3DCylinderStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_cone' || cat === 'math_3d_cone') {
          perfectedStrokes = generateMath3DConeStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_hyperbola') {
          perfectedStrokes = generateMathHyperbolaStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_golden_spiral' || cat === 'spiral') {
          perfectedStrokes = generateMathGoldenSpiralStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_helix' || cat === 'math_3d_helix') {
          perfectedStrokes = generateMath3DHelixStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_torus' || cat === 'math_3d_torus') {
          perfectedStrokes = generateMath3DTorusStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'math_rhombus') {
          perfectedStrokes = generateMathRhombusStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'heart') {
          perfectedStrokes = generatePerfectHeartStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'star') {
          perfectedStrokes = generatePerfectStarStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'sun') {
          perfectedStrokes = generatePerfectSunStrokes(cx, cy, w, h, col, bType, bSize);
        } else if (cat === 'infinity') {
          perfectedStrokes = generatePerfectInfinityStrokes(cx, cy, w, h, col, bType, bSize);
        }

        const decodedTitle = resData.beautifiedText || resData.drawingMeaning || resData.gestureName || 'Hình Toán Học Chuẩn';

        if (perfectedStrokes) {
          drawStrokesRef.current = perfectedStrokes;
          materializeActiveStrokesTo3DHologram(`📐 ${decodedTitle}`);
        } else {
          materializeActiveStrokesTo3DHologram(`✦ ${decodedTitle}`);
        }

        setRecognizedLiveText(decodedTitle);
        morningAudio.triggerPeaceRainbowChime();
        setSnapshotToast(`🪄 AI Đã Nắn Thẳng: "${decodedTitle}" (${resData.aiComment || 'Cạnh thẳng & góc vuông chuẩn xác!'})`);
        setTimeout(() => setSnapshotToast(null), 5000);
      }
    } catch (err) {
      console.warn('AI Beautify notice:', err);
      const snapped = detectAndSnapGeometricShape(currentStrokes);
      if (snapped) {
        drawStrokesRef.current = snapped;
        materializeActiveStrokesTo3DHologram('Hình Toán Học Cân Bằng');
      } else {
        materializeActiveStrokesTo3DHologram();
      }
    } finally {
      setIsAiBeautifying(false);
    }
  };

  // Materialize & Freeze active spatial strokes into an interactive 3D Holographic object in the room!
  const materializeActiveStrokesTo3DHologram = (decodedCustomText?: string) => {
    const strokes = [...drawStrokesRef.current];
    if (strokes.length < 3) {
      setSnapshotToast('⚠️ Hãy viết chữ hoặc vẽ nét trên không gian trước khi cố định 3D');
      setTimeout(() => setSnapshotToast(null), 3000);
      return;
    }

    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    strokes.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    const padding = 0.035;
    const boundedMinX = Math.max(0.02, minX - padding);
    const boundedMaxX = Math.min(0.98, maxX + padding);
    const boundedMinY = Math.max(0.05, minY - padding);
    const boundedMaxY = Math.min(0.95, maxY + padding);

    const centerX = (boundedMinX + boundedMaxX) / 2;
    const centerY = (boundedMinY + boundedMaxY) / 2;
    const width = boundedMaxX - boundedMinX;
    const height = boundedMaxY - boundedMinY;

    const newHologram: SpatialHologramEntity = {
      id: `holo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: decodedCustomText ? `✦ ${decodedCustomText}` : `✨ Không Gian 3D #${pinnedHologramsRef.current.length + 1}`,
      decodedText: decodedCustomText,
      strokes: strokes,
      bounds: {
        minX: boundedMinX,
        maxX: boundedMaxX,
        minY: boundedMinY,
        maxY: boundedMaxY,
        centerX,
        centerY,
        width,
        height
      },
      color: strokes[0]?.color || brushColor,
      brushType: strokes[0]?.brushType || brushType,
      createdAt: Date.now(),
      zDepth: 1.0,
      pulsePhase: Math.random() * Math.PI * 2,
      scale: 1.0,
      isPinned: true
    };

    pinnedHologramsRef.current = [newHologram, ...pinnedHologramsRef.current.slice(0, 7)];
    setPinnedHolograms([...pinnedHologramsRef.current]);

    // Clear active strokes so user can seamlessly start writing next phrase anywhere in room
    drawStrokesRef.current = [];

    // Trigger visual stardust burst around the materialized 3D hologram
    if (canvasRef.current) {
      const px = centerX * canvasRef.current.width;
      const py = centerY * canvasRef.current.height;
      for (let i = 0; i < 36; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        spawnPooledParticle(
          px,
          py,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          2.0 + Math.random() * 3.5,
          newHologram.color,
          36 + Math.random() * 15
        );
      }
    }

    morningAudio.triggerStarPop();
    setSnapshotToast(
      decodedCustomText 
        ? `✨ Đã cố định 3D: "${decodedCustomText}" vào không gian phòng!`
        : `✨ Đã xuất hiện & cố định tác phẩm 3D trong không gian!`
    );
    setTimeout(() => setSnapshotToast(null), 4000);
  };

  const removePinnedHologram = (id: string) => {
    pinnedHologramsRef.current = pinnedHologramsRef.current.filter(h => h.id !== id);
    setPinnedHolograms([...pinnedHologramsRef.current]);
    morningAudio.triggerClearBoardSweep();
  };

  const clearAllHolograms = () => {
    pinnedHologramsRef.current = [];
    setPinnedHolograms([]);
    morningAudio.triggerClearBoardSweep();
    setSnapshotToast('🧹 Đã dọn sạch các vật thể 3D trong phòng!');
    setTimeout(() => setSnapshotToast(null), 2500);
  };

  // =========================================================================
  // 5.4 ANIME METAVERSE RE-CREATION & DIGITAL SELF TRANSFORMATION ENGINE
  // =========================================================================
  const openAnimeMetaverse = useCallback((tab: 'home_hub' | 'spatial_drawing' | 'mascot_play' = 'home_hub') => {
    setAnimeMetaverseInitialTab(tab);
    // 1. Group active and pinned strokes
    const rawStrokes = [...drawStrokesRef.current];
    
    // Also include strokes from pinned 3D holograms if any
    pinnedHologramsRef.current.forEach(holo => {
      if (holo.strokes && holo.strokes.length > 0) {
        holo.strokes.forEach((pt, idx) => {
          rawStrokes.push({
            ...pt,
            isNewStroke: idx === 0
          });
        });
      }
    });

    const groupedStrokes: Array<{ points: Array<{ x: number; y: number; z?: number }>; color: string; brushType?: string }> = [];
    let currentGroup: Array<{ x: number; y: number; z?: number }> = [];
    let currentColor = '#38bdf8';
    let currentBrush = 'laser';

    rawStrokes.forEach((pt) => {
      if (pt.isNewStroke && currentGroup.length > 0) {
        groupedStrokes.push({
          points: currentGroup,
          color: currentColor,
          brushType: currentBrush
        });
        currentGroup = [];
      }
      currentColor = pt.color || currentColor;
      currentBrush = pt.brushType || currentBrush;
      currentGroup.push({ x: pt.x, y: pt.y });
    });

    if (currentGroup.length > 0) {
      groupedStrokes.push({
        points: currentGroup,
        color: currentColor,
        brushType: currentBrush
      });
    }

    setAnimeMetaverseStrokes(groupedStrokes);

    // 2. Capture canvas snapshot
    if (canvasRef.current) {
      try {
        const snap = canvasRef.current.toDataURL('image/jpeg', 0.85);
        setAnimeMetaverseSnapshot(snap);
      } catch (err) {
        console.warn('Canvas snapshot capture error:', err);
      }
    }

    morningAudio.triggerStarPop();
    setShowAnimeMetaverseModal(true);
  }, []);

  // =========================================================================
  // 5.5 AUTO SCREEN & VIEWPORT BALANCE ENGINE (TỰ ĐỘNG CÂN BẰNG MÀN HÌNH)
  // =========================================================================
  const autoBalanceScreen = () => {
    const strokes = drawStrokesRef.current;
    
    // 1. Căn giữa và cân bằng tọa độ nét vẽ hiện tại vào tâm màn hình
    if (strokes.length > 0) {
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      strokes.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const currentCenterX = (minX + maxX) / 2;
      const currentCenterY = (minY + maxY) / 2;
      const targetCenterX = 0.5;
      const targetCenterY = 0.46; // Căn giữa tự nhiên góc nhìn mắt người dùng
      const shiftX = targetCenterX - currentCenterX;
      const shiftY = targetCenterY - currentCenterY;

      // Cân chỉnh chuyển vị trí mượt mà
      drawStrokesRef.current = strokes.map((p) => ({
        ...p,
        x: Math.max(0.04, Math.min(0.96, p.x + shiftX)),
        y: Math.max(0.06, Math.min(0.92, p.y + shiftY)),
      }));

      // Kích hoạt hạt tinh vân cân bằng tâm
      if (canvasRef.current) {
        const cx = targetCenterX * canvasRef.current.width;
        const cy = targetCenterY * canvasRef.current.height;
        for (let i = 0; i < 28; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.0 + Math.random() * 3.5;
          spawnPooledParticle(
            cx,
            cy,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            2.5,
            '#06b6d4',
            25
          );
        }
      }
    }

    // 2. Tự động cân bằng phơi sáng & tương phản ánh sáng quang học
    runLightingAnalysis(false);

    // 3. Hiệu ứng âm thanh & Toast phản hồi trực quan
    morningAudio.triggerStarPop();
    setSnapshotToast('⚖️ Đã tự động cân bằng màn hình, căn giữa nét vẽ và tối ưu phơi sáng quang học!');
    setTimeout(() => setSnapshotToast(null), 3500);
  };

  // Landscape Orientation Switcher
  const toggleLandscapeMode = async () => {
    const nextMode = !isLandscapeMode;
    setIsLandscapeMode(nextMode);

    try {
      if (nextMode && (window.screen.orientation as any)?.lock) {
        await (window.screen.orientation as any).lock('landscape');
      } else if (!nextMode && (window.screen.orientation as any)?.unlock) {
        (window.screen.orientation as any).unlock();
      }
    } catch {
      // Ignored if browser requires fullscreen or doesn't support orientation lock
    }

    setSnapshotToast(nextMode ? '🔄 Đã chuyển sang Không Gian Màn Hình Ngang (Landscape Studio)' : '📱 Đã trở về chế độ Tiêu Chuẩn');
    setTimeout(() => setSnapshotToast(null), 3000);
  };

  const triggerSupernovaExplosion = (centerX: number, centerY: number) => {
    morningAudio.triggerSupernovaSound();
    activeGestureTextRef.current = '☀️ Siêu Tân Tinh Không Gian';
    spawnSpatialEmoji('☀️', centerX, centerY - 0.08, 4);
    spawnSpatialShape('sun', centerX, centerY);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const px = centerX * canvas.width;
    const py = centerY * canvas.height;
    const newParticles: Particle[] = [];
    const colors = ['#fbbf24', '#f59e0b', '#06b6d4', '#fff', '#38bdf8', '#f472b6', '#34d399', '#a855f7'];

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 8.0;
      newParticles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 30
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // =========================================================================
  // 6. GEMINI 3.7 FLASH VISION & HANDWRITING OCR SCANNER
  // =========================================================================
  const recognizeHandwritingWithAI = async (autoTrigger: boolean = false) => {
    if (isGeminiScanning || isRecognizingText) return;
    if (drawStrokesRef.current.length < 5 && !autoTrigger) {
      setSnapshotToast('⚠️ Hãy viết thêm chữ hoặc vẽ nét trên không gian trước khi nhận diện');
      setTimeout(() => setSnapshotToast(null), 3000);
      return;
    }

    setIsRecognizingText(true);
    setIsGeminiScanning(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) {
        setIsRecognizingText(false);
        setIsGeminiScanning(false);
        return;
      }

      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 640;
      snapCanvas.height = 360;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) {
        setIsRecognizingText(false);
        setIsGeminiScanning(false);
        return;
      }

      // Render high contrast black background + strokes for ultra-accurate OCR
      sCtx.fillStyle = '#050507';
      sCtx.fillRect(0, 0, 640, 360);

      if (video && video.readyState >= 2 && isCameraActive) {
        sCtx.globalAlpha = 0.35;
        if (isMirror) {
          sCtx.translate(640, 0);
          sCtx.scale(-1, 1);
        }
        sCtx.drawImage(video, 0, 0, 640, 360);
        if (isMirror) {
          sCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
        sCtx.globalAlpha = 1.0;
      }

      // Draw active spatial strokes on top with high clarity
      sCtx.drawImage(canvas, 0, 0, 640, 360);
      const base64Image = snapCanvas.toDataURL('image/jpeg', 0.88);

      const response = await fetch('/api/gemini/space-vision-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          drawingStrokesCount: drawStrokesRef.current.length,
          activeMode: 'air_writing',
          prompt: 'Đặc biệt tập trung đọc và trích xuất CHÍNH XÁC toàn bộ nội dung chữ viết tay, con số, ký hiệu hoặc hình ảnh được vẽ bằng vệt sáng laser trong hình ảnh. Trả về đúng trường drawingMeaning là nội dung văn bản bạn đã đọc được.'
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        const resData = json.data;
        setGeminiAiResult(resData);

        const decodedText = resData.drawingMeaning || resData.gestureName || '';
        if (decodedText) {
          setRecognizedLiveText(decodedText);
          setHandwrittenTextHistory(prev => [
            { text: decodedText, confidence: resData.energyScore || 90, timestamp: Date.now() },
            ...prev.slice(0, 7)
          ]);
          activeGestureTextRef.current = `✨ Đã Đọc Được: "${decodedText}"`;
        }

        if (resData.recommendedEmoji) {
          spawnSpatialEmoji(resData.recommendedEmoji, 0.5, 0.35, 5);
        }

        morningAudio.triggerStarPop();
        setSnapshotToast(`🎯 Gemini AI Nhận Diện: "${decodedText}" (${resData.aiComment || 'Chính xác!'})`);
        setTimeout(() => setSnapshotToast(null), 5500);
      }
    } catch (e) {
      console.warn('Gemini Handwriting Scan notice:', e);
    } finally {
      setIsRecognizingText(false);
      setIsGeminiScanning(false);
    }
  };

  const scanWithGeminiFlashAI = () => {
    recognizeHandwritingWithAI(false);
  };

  // =========================================================================
  // 6.1 SPACE OPTICAL & LOW-LIGHT CALIBRATION WITH GEMINI AI
  // =========================================================================
  const calibrateSpaceWithAI = async () => {
    if (isCalibratingSpace) return;

    if (!isCameraActive) {
      setSnapshotToast('📷 Đang khởi động camera trước khi quét hiệu chuẩn không gian...');
      await startCamera();
    }

    setIsCalibratingSpace(true);
    setIsScanRadarActive(true);
    morningAudio.triggerStarPop();
    setSnapshotToast('🔍 AI đang quét quang học môi trường, ánh sáng & tương phản bàn tay...');

    try {
      const video = videoRef.current;
      if (!video || !video.videoWidth) {
        throw new Error('Camera chưa có tín hiệu hình ảnh');
      }

      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 640;
      snapCanvas.height = 360;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) throw new Error('Không thể tạo context canvas');

      if (isMirror) {
        sCtx.translate(640, 0);
        sCtx.scale(-1, 1);
      }
      sCtx.drawImage(video, 0, 0, 640, 360);
      if (isMirror) {
        sCtx.setTransform(1, 0, 0, 1, 0, 0);
      }

      const base64Image = snapCanvas.toDataURL('image/jpeg', 0.88);

      const response = await fetch('/api/gemini/calibrate-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      const json = await response.json();
      if (json.success && json.data) {
        const calibData = json.data;
        setSpaceCalibrationData(calibData);

        const applied = calibData.appliedFilters || {};
        const newFilters = {
          brightness: applied.brightnessBoost || 1.25,
          contrast: applied.contrastBoost || 1.2,
          nightVision: !!applied.nightVisionMode,
          saturate: applied.nightVisionMode ? 1.25 : 1.0
        };

        setVideoFilters(newFilters);
        videoFiltersRef.current = newFilters;

        // Dynamically adjust MediaPipe confidence thresholds
        if (mediaPipeHandsRef.current) {
          try {
            mediaPipeHandsRef.current.setOptions({
              minDetectionConfidence: applied.minDetectionConfidence || 0.45,
              minTrackingConfidence: applied.minTrackingConfidence || 0.45
            });
          } catch (mpErr) {
            console.warn('MediaPipe options update:', mpErr);
          }
        }

        // Apply recommended sensitivity
        if (applied.recommendedSensitivity) {
          setPenSensitivity(applied.recommendedSensitivity);
        }

        morningAudio.triggerPeaceRainbowChime();
        setShowCalibrationModal(true);
        setSnapshotToast(`🎯 Hiệu Chuẩn Hoàn Tất: ${calibData.statusSummary}`);
        setTimeout(() => setSnapshotToast(null), 5000);
      } else {
        throw new Error(json.error || 'Lỗi nhận phản hồi AI');
      }
    } catch (err: any) {
      console.warn('Calibration notice/fallback:', err);
      const fallbackFilters = {
        brightness: 1.35,
        contrast: 1.25,
        nightVision: true,
        saturate: 1.2
      };
      setVideoFilters(fallbackFilters);
      videoFiltersRef.current = fallbackFilters;
      setPenSensitivity('high');
      if (mediaPipeHandsRef.current) {
        try {
          mediaPipeHandsRef.current.setOptions({
            minDetectionConfidence: 0.42,
            minTrackingConfidence: 0.42
          });
        } catch {}
      }
      setSpaceCalibrationData({
        ambientLighting: 'dim',
        lightingQualityScore: 78,
        brightnessLevel: 52,
        contrastLevel: 68,
        backgroundNoise: 'clean',
        skinToneContrast: 'medium',
        appliedFilters: {
          brightnessBoost: 1.35,
          contrastBoost: 1.25,
          gammaCorrection: 1.15,
          nightVisionMode: true,
          minDetectionConfidence: 0.42,
          minTrackingConfidence: 0.42,
          recommendedSensitivity: 'high'
        },
        statusSummary: 'Đã kích hoạt Night-Vision & Tăng độ nhạy ngón tay (+45%)',
        calibrationAdvice: 'Đã tối ưu hóa cảm biến quang học bắt nét bàn tay trong phòng tối.'
      });
      setShowCalibrationModal(true);
      morningAudio.triggerStarPop();
    } finally {
      setIsCalibratingSpace(false);
      setTimeout(() => setIsScanRadarActive(false), 1200);
    }
  };

  const resetSpaceCalibration = () => {
    const defaultFilters = {
      brightness: 1.0,
      contrast: 1.0,
      nightVision: false,
      saturate: 1.0
    };
    setVideoFilters(defaultFilters);
    videoFiltersRef.current = defaultFilters;
    setSpaceCalibrationData(null);
    if (mediaPipeHandsRef.current) {
      try {
        mediaPipeHandsRef.current.setOptions({
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      } catch {}
    }
    morningAudio.triggerClearBoardSweep();
    setSnapshotToast('🔄 Đã đặt lại thông số hiệu chuẩn không gian về mặc định');
    setTimeout(() => setSnapshotToast(null), 3000);
  };

  // =========================================================================
  // 6.2 AUTOMATED LIGHTING ANALYSIS & DYNAMIC EXPOSURE/CONTRAST TUNER
  // =========================================================================
  const runLightingAnalysis = (isVerbose = false) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return;

    setIsAnalyzingLight(true);

    try {
      if (!lightingCanvasRef.current) {
        const lCanvas = document.createElement('canvas');
        lCanvas.width = 64;
        lCanvas.height = 36;
        lightingCanvasRef.current = lCanvas;
      }

      const lCanvas = lightingCanvasRef.current;
      const lCtx = lCanvas.getContext('2d', { willReadFrequently: true });
      if (!lCtx) return;

      lCtx.drawImage(video, 0, 0, lCanvas.width, lCanvas.height);
      const imgData = lCtx.getImageData(0, 0, lCanvas.width, lCanvas.height);
      const data = imgData.data;
      const totalPixels = lCanvas.width * lCanvas.height;

      let sumLuminance = 0;
      let darkPixels = 0;
      let brightPixels = 0;
      const lumSamples: number[] = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        sumLuminance += y;
        lumSamples.push(y);

        if (y < 42) darkPixels++;
        if (y > 215) brightPixels++;
      }

      lumSamples.sort((a, b) => a - b);
      const avgLuminance = Math.round(sumLuminance / totalPixels);
      const p10 = lumSamples[Math.floor(totalPixels * 0.10)] || 0;
      const p90 = lumSamples[Math.floor(totalPixels * 0.90)] || 255;
      const dynamicRange = Math.round(p90 - p10);
      const darkRatio = darkPixels / totalPixels;
      const brightRatio = brightPixels / totalPixels;

      // Determine Environmental Condition
      let condition: 'low_light' | 'dim' | 'normal' | 'bright' | 'backlit' = 'normal';
      let targetBrightness = 1.0;
      let targetContrast = 1.0;
      let targetNightVision = false;
      let targetEV = 0.0;
      let targetConfidence = 0.5;

      if (avgLuminance < 45 || darkRatio > 0.55) {
        condition = 'low_light';
        const deficit = Math.max(0, 45 - avgLuminance);
        targetBrightness = +(1.32 + (deficit / 45) * 0.28).toFixed(2); // up to 1.60
        targetContrast = +(1.22 + (deficit / 45) * 0.18).toFixed(2); // up to 1.40
        targetNightVision = true;
        targetEV = +(0.8 + (deficit / 45) * 0.7).toFixed(1); // EV +0.8 to +1.5
        targetConfidence = 0.38; // Lower confidence to prevent losing hand in darkness
      } else if (brightRatio > 0.28 && darkRatio > 0.22) {
        condition = 'backlit';
        targetBrightness = 1.20;
        targetContrast = 1.35;
        targetNightVision = false;
        targetEV = 0.5;
        targetConfidence = 0.45;
      } else if (avgLuminance < 85) {
        condition = 'dim';
        targetBrightness = +(1.15 + ((85 - avgLuminance) / 40) * 0.15).toFixed(2);
        targetContrast = 1.15;
        targetNightVision = false;
        targetEV = 0.4;
        targetConfidence = 0.46;
      } else if (avgLuminance > 180) {
        condition = 'bright';
        targetBrightness = 0.95;
        targetContrast = 0.95;
        targetNightVision = false;
        targetEV = -0.3;
        targetConfidence = 0.55;
      } else {
        condition = 'normal';
        targetBrightness = 1.0;
        targetContrast = 1.0;
        targetNightVision = false;
        targetEV = 0.0;
        targetConfidence = 0.52;
      }

      // Smoothly blend filters towards targets (damping prevents flickering)
      const current = videoFiltersRef.current;
      const smoothBrightness = +(current.brightness * 0.7 + targetBrightness * 0.3).toFixed(2);
      const smoothContrast = +(current.contrast * 0.7 + targetContrast * 0.3).toFixed(2);
      const nextFilters = {
        brightness: smoothBrightness,
        contrast: smoothContrast,
        nightVision: targetNightVision,
        saturate: targetNightVision ? 1.25 : 1.0
      };

      setVideoFilters(nextFilters);
      videoFiltersRef.current = nextFilters;

      // Adjust Hardware Camera Exposure Compensation if available on video track
      const track = streamRef.current?.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        try {
          const caps = track.getCapabilities() as any;
          if (caps && caps.exposureCompensation) {
            const minEV = caps.exposureCompensation.min ?? -2;
            const maxEV = caps.exposureCompensation.max ?? 2;
            const clampedEV = Math.max(minEV, Math.min(maxEV, targetEV));
            track.applyConstraints({
              advanced: [{ exposureMode: 'continuous', exposureCompensation: clampedEV } as any]
            }).catch(() => {});
          }
        } catch {}
      }

      // Dynamically optimize MediaPipe tracking options
      if (mediaPipeHandsRef.current) {
        try {
          mediaPipeHandsRef.current.setOptions({
            minDetectionConfidence: targetConfidence,
            minTrackingConfidence: targetConfidence
          });
        } catch {}
      }

      const estimatedLux = Math.round(avgLuminance * 2.4);
      const newStats = {
        lux: estimatedLux,
        avgLuminance,
        contrast: dynamicRange,
        condition,
        evCompensation: targetEV,
        isNightVisionActive: targetNightVision,
        lastAnalyzed: new Date().toLocaleTimeString('vi-VN')
      };

      setLightingAnalysisStats(newStats);

      if (isVerbose) {
        morningAudio.triggerStarPop();
        setSnapshotToast(
          `⚡ Phân tích ánh sáng: ${estimatedLux} Lux (${
            condition === 'low_light' ? 'Phòng Thiếu Sáng' : condition === 'dim' ? 'Mờ Tối' : condition === 'backlit' ? 'Ngược Sáng' : 'Đủ Sáng'
          }) - Đã cân bằng Phơi Sáng EV ${targetEV >= 0 ? '+' : ''}${targetEV}`
        );
        setTimeout(() => setSnapshotToast(null), 3500);
      }
    } catch (err) {
      console.warn('Lighting analysis error:', err);
    } finally {
      setTimeout(() => setIsAnalyzingLight(false), 400);
    }
  };

  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = canvas.width || 1280;
      snapCanvas.height = canvas.height || 720;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) return;

      if (video && video.readyState >= 2 && isCameraActive) {
        if (isMirror) {
          sCtx.translate(snapCanvas.width, 0);
          sCtx.scale(-1, 1);
        }
        sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
        if (isMirror) {
          sCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
      } else {
        const env = REALISTIC_ENVIRONMENTS.find(e => e.id === currentTheme) || REALISTIC_ENVIRONMENTS[0];
        sCtx.fillStyle = env.accentColor ? `${env.accentColor}22` : '#09090b';
        sCtx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
      }

      sCtx.drawImage(canvas, 0, 0);

      // Watermark
      sCtx.font = 'bold 16px sans-serif';
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.fillText('Haevy Space • 3D Air Studio', 30, snapCanvas.height - 30);

      const link = document.createElement('a');
      link.download = `haevy-space-air-${Date.now()}.png`;
      link.href = snapCanvas.toDataURL('image/png');
      link.click();

      morningAudio.triggerStarPop();
      setSnapshotToast('📸 Đã lưu ảnh không gian vào thiết bị của bạn!');
      setTimeout(() => setSnapshotToast(null), 3000);
    } catch (err) {
      console.error('Snapshot error:', err);
    }
  };

  // Direct 1-Click Share to Community Feed (+25 Points)
  const handleDirectShareToCommunity = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = canvas.width || 1280;
      snapCanvas.height = canvas.height || 720;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) return;

      if (video && video.readyState >= 2 && isCameraActive) {
        if (isMirror) {
          sCtx.translate(snapCanvas.width, 0);
          sCtx.scale(-1, 1);
        }
        sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
        if (isMirror) {
          sCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
      } else {
        const env = REALISTIC_ENVIRONMENTS.find(e => e.id === currentTheme) || REALISTIC_ENVIRONMENTS[0];
        sCtx.fillStyle = env.accentColor ? `${env.accentColor}22` : '#09090b';
        sCtx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
      }

      sCtx.drawImage(canvas, 0, 0);

      // Watermark
      sCtx.font = 'bold 16px sans-serif';
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.fillText('Haevy Space • 3D Air Studio', 30, snapCanvas.height - 30);

      const dataUrl = snapCanvas.toDataURL('image/png');
      if (onShareToCommunity) {
        onShareToCommunity(
          dataUrl,
          '✨ Vừa hoàn thành tác phẩm Không Gian 3D trong Haevy Space! Cả nhà cùng chiêm ngưỡng và cho mình xin cảm nhận nhé 🎨',
          'haevy_space'
        );
        morningAudio.triggerStarPop();
        setSnapshotToast('🎉 Đã chuyển sang Bảng Tin Cộng Đồng để chia sẻ tác phẩm (+25 Điểm)!');
        setTimeout(() => setSnapshotToast(null), 3000);
      } else {
        handleTakeSnapshot();
      }
    } catch (err) {
      console.error('Direct share error:', err);
    }
  };

  // 1-Click Load Trending Spatial 3D Presets
  const loadSpatialPresetTemplate = (templateId: string) => {
    setSpaceView('canvas');
    setIsCameraPromptDismissed(true);
    morningAudio.triggerStarPop();

    const centerX = 0.5;
    const centerY = 0.45;
    const generatedStrokes: DrawStrokePoint[] = [];
    let color = '#fbbf24';
    let title = '✨ Tác phẩm 3D';
    const now = Date.now();

    if (templateId === 'tam_an') {
      color = '#fbbf24';
      title = '📜 Thư Pháp Tâm An';
      for (let t = 0; t <= Math.PI * 2.5; t += 0.08) {
        const x = centerX + Math.sin(t) * 0.16 + Math.cos(t * 2) * 0.04;
        const y = centerY + Math.cos(t) * 0.14 + Math.sin(t * 3) * 0.03;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'haevy_space') {
      color = '#06b6d4';
      title = '🌌 Chữ Haevy Space 3D';
      for (let t = 0; t <= Math.PI * 3; t += 0.08) {
        const x = centerX + (t / (Math.PI * 3) - 0.5) * 0.45;
        const y = centerY + Math.sin(t * 3) * 0.08;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'phuc_loc') {
      color = '#f59e0b';
      title = '🐲 Thư Pháp Phúc Lộc Vô Biên';
      for (let t = 0; t <= Math.PI * 3.5; t += 0.07) {
        const x = centerX + Math.sin(t * 1.5) * 0.22;
        const y = centerY + Math.cos(t) * 0.18 + Math.sin(t * 2) * 0.04;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'zen_enso') {
      color = '#10b981';
      title = '⭕ Zen Enso Thiền Định';
      for (let t = 0; t <= Math.PI * 1.88; t += 0.06) {
        const r = 0.17 + Math.sin(t * 3) * 0.01;
        const x = centerX + Math.cos(t) * r;
        const y = centerY + Math.sin(t) * r;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'dragon') {
      color = '#f59e0b';
      title = '🐉 Rồng Vũ Trụ 3D';
      for (let t = 0; t <= Math.PI * 4; t += 0.08) {
        const r = 0.04 + t * 0.035;
        const x = centerX + Math.cos(t) * r;
        const y = centerY + Math.sin(t) * r * 0.75;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'heart' || templateId === 'heart_3d') {
      color = '#ec4899';
      title = '💖 Bão Tim 3D';
      for (let t = 0; t <= Math.PI * 2; t += 0.06) {
        const x = centerX + (16 * Math.pow(Math.sin(t), 3)) * 0.011;
        const y = centerY - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.011;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else if (templateId === 'star_galaxy' || templateId === 'star') {
      color = '#eab308';
      title = '⭐ Ngôi Sao Tinh Tú 3D';
      for (let t = 0; t <= Math.PI * 2; t += 0.08) {
        const r = 0.16 * (1 + 0.5 * Math.cos(5 * t));
        const x = centerX + Math.cos(t) * r;
        const y = centerY + Math.sin(t) * r;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    } else {
      color = '#a855f7';
      title = '🪐 Tinh Vân Ngân Hà';
      for (let t = 0; t <= Math.PI * 4; t += 0.08) {
        const x = centerX + Math.cos(t) * 0.2;
        const y = centerY + Math.sin(t) * 0.07 + Math.cos(t * 2) * 0.03;
        generatedStrokes.push({
          x,
          y,
          color,
          size: 8,
          brushType: 'laser',
          timestamp: now + t * 10,
          isNewStroke: t === 0
        });
      }
    }

    drawStrokesRef.current = generatedStrokes;
    setStrokeCount(generatedStrokes.length);
    materializeActiveStrokesTo3DHologram(title);
    morningAudio.triggerStarPop();
    setSnapshotToast(`✨ Đã nạp mẫu "${title}" vào Bảng Vẽ 3D Hologram!`);
    setTimeout(() => setSnapshotToast(null), 3000);
  };

  // =========================================================================
  // 7. HIGH-PERFORMANCE 60FPS UNIFIED CANVAS RENDER LOOP (HARDWARE ACCELERATED)
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle canvas resizing smoothly
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const frameStart = performance.now();
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const hands = handsDataRef.current;
      const now = Date.now();
      const currentEnv = REALISTIC_ENVIRONMENTS.find(e => e.id === currentThemeRef.current) || REALISTIC_ENVIRONMENTS[0];
      const themePrimary = currentEnv.accentColor || '#06b6d4';

      // Auto-Materialize Check: If user wrote letters/drawings and paused for 1.8s, crystallize into 3D Hologram!
      if (
        !isAirPenDrawingRef.current &&
        drawStrokesRef.current.length > 12 &&
        lastStrokeDrawTimeRef.current > 0 &&
        now - lastStrokeDrawTimeRef.current > 1800
      ) {
        lastStrokeDrawTimeRef.current = 0;
        materializeActiveStrokesTo3DHologram();
      }

      // 0. Landscape Perspective Guidelines (Widescreen Horizon & 3D Spatial Grid)
      if (isLandscapeModeRef.current) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);

        // Horizontal Horizon Line
        const horizonY = h * 0.52;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(w, horizonY);
        ctx.stroke();

        // 3D Perspective depth rays
        const vanishX = w * 0.5;
        const vanishY = horizonY;
        for (let x = 0; x <= w; x += w / 8) {
          ctx.beginPath();
          ctx.moveTo(vanishX, vanishY);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 1. Render Pinned Materialized 3D Spatial Holograms (Floating in Room Space!)
      const holograms = pinnedHologramsRef.current;
      if (holograms.length > 0) {
        holograms.forEach((holo, hIdx) => {
          const bobY = Math.sin((now / 1000) * 1.6 + holo.pulsePhase) * 6;
          const { minX, maxX, minY, maxY, centerX, centerY } = holo.bounds;
          const left = minX * w;
          const right = maxX * w;
          const top = minY * h + bobY;
          const bottom = maxY * h + bobY;
          const boxW = Math.max(80, right - left);
          const boxH = Math.max(50, bottom - top);

          ctx.save();

          // 1.1 Projected 3D Floor Shadow (Hardware Accelerated Radial Gradient, Zero Lag)
          const shadowX = centerX * w;
          const shadowY = Math.min(h - 20, bottom + 35);
          const shadowRx = boxW * 0.55;
          const shadowRy = 12;
          const shadowGrad = ctx.createRadialGradient(shadowX, shadowY, 0, shadowX, shadowY, shadowRx);
          shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
          shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(shadowX, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
          ctx.fill();

          // 1.2 Cyber HUD Holographic Corner Brackets (⌜ ⌝ ⌞ ⌟)
          const bracketLen = Math.min(22, boxW * 0.25);
          ctx.strokeStyle = holo.color;
          ctx.lineWidth = 2.2;
          ctx.shadowBlur = 16;
          ctx.shadowColor = holo.color;

          // Top-Left ⌜
          ctx.beginPath();
          ctx.moveTo(left, top + bracketLen);
          ctx.lineTo(left, top);
          ctx.lineTo(left + bracketLen, top);
          ctx.stroke();

          // Top-Right ⌝
          ctx.beginPath();
          ctx.moveTo(right - bracketLen, top);
          ctx.lineTo(right, top);
          ctx.lineTo(right, top + bracketLen);
          ctx.stroke();

          // Bottom-Left ⌞
          ctx.beginPath();
          ctx.moveTo(left, bottom - bracketLen);
          ctx.lineTo(left, bottom);
          ctx.lineTo(left + bracketLen, bottom);
          ctx.stroke();

          // Bottom-Right ⌟
          ctx.beginPath();
          ctx.moveTo(right - bracketLen, bottom);
          ctx.lineTo(right, bottom);
          ctx.lineTo(right, bottom - bracketLen);
          ctx.stroke();

          // 1.3 Hologram Header Tag
          const tagText = holo.title;
          ctx.font = 'bold 11px sans-serif';
          const tagW = ctx.measureText(tagText).width + 24;
          const tagX = (left + right) / 2 - tagW / 2;
          const tagY = top - 18;

          ctx.fillStyle = 'rgba(5, 5, 8, 0.85)';
          ctx.beginPath();
          ctx.roundRect(tagX, tagY, tagW, 20, 10);
          ctx.fill();

          ctx.strokeStyle = `${holo.color}80`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tagText, (left + right) / 2, tagY + 10);

          // 1.4 Render the Hologram's Strokes with 3D Offset
          if (holo.strokes.length > 1) {
            let segs: DrawStrokePoint[] = [];
            for (let i = 0; i < holo.strokes.length; i++) {
              const pt = holo.strokes[i];
              if (pt.isNewStroke && segs.length > 0) {
                drawSmoothStrokeCurve(ctx, segs, w, h, bobY);
                segs = [];
              }
              segs.push(pt);
            }
            if (segs.length > 0) {
              drawSmoothStrokeCurve(ctx, segs, w, h, bobY);
            }
          }

          ctx.restore();
        });
      }

      // 2. Render Spatial Shapes (Heart, Star, Sun)
      spatialShapesRef.current.forEach((shape) => {
        const age = (now - shape.timestamp) / 1000;
        shape.scale = Math.min(1.5, shape.scale + 0.04);
        shape.rotation += 0.015;
        const alpha = Math.max(0, 1 - age / 7);

        if (alpha > 0) {
          ctx.save();
          ctx.translate(shape.x * w, shape.y * h);
          ctx.rotate(shape.rotation);
          ctx.scale(shape.scale, shape.scale);
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 24;
          ctx.shadowColor = shape.color;
          ctx.strokeStyle = shape.color;
          ctx.lineWidth = 3.2;

          if (shape.type === 'heart') {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-20, -30, -50, 0, 0, 40);
            ctx.bezierCurveTo(50, 0, 20, -30, 0, 0);
            ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
            ctx.fill();
            ctx.stroke();
          } else if (shape.type === 'star') {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 36, -Math.sin((18 + i * 72) * Math.PI / 180) * 36);
              ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 16, -Math.sin((54 + i * 72) * Math.PI / 180) * 16);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
            ctx.fill();
            ctx.stroke();
          } else if (shape.type === 'sun') {
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      });
      spatialShapesRef.current = spatialShapesRef.current.filter(s => (now - s.timestamp) / 1000 < 7);

      // 3. Render Active Smooth Calligraphy / Air Writing Strokes (Quadratic Bezier Interpolation)
      const strokes = drawStrokesRef.current;
      if (strokes.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let currentStrokeSegments: DrawStrokePoint[] = [];

        for (let i = 0; i < strokes.length; i++) {
          const pt = strokes[i];
          if (pt.isNewStroke && currentStrokeSegments.length > 0) {
            drawSmoothStrokeCurve(ctx, currentStrokeSegments, w, h, 0);
            currentStrokeSegments = [];
          }
          currentStrokeSegments.push(pt);
        }
        if (currentStrokeSegments.length > 0) {
          drawSmoothStrokeCurve(ctx, currentStrokeSegments, w, h, 0);
        }

        ctx.restore();
      }

      // 4. Render 3D Floating Emojis
      floatingEmojisRef.current.forEach((item) => {
        item.x += item.vx;
        item.y += item.vy;
        item.scale = Math.min(1.2, item.scale + 0.08);
        item.rotation += item.rotationSpeed;
        item.life++;
        item.alpha = Math.max(0, 1 - (item.life / item.maxLife));

        if (item.alpha > 0) {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation);
          ctx.scale(item.scale, item.scale);
          ctx.globalAlpha = item.alpha;
          ctx.font = `${item.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 18;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(item.emoji, 0, 0);
          ctx.restore();
        }
      });
      floatingEmojisRef.current = floatingEmojisRef.current.filter(e => e.life < e.maxLife && e.alpha > 0);

      // 5. Render Zero-GC Pooled Particles (Ultra Fast & Smooth)
      const pool = particlePoolRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.life < p.maxLife && p.alpha > 0.01) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life++;
          p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

          if (p.alpha > 0.02) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // 6. Render Skeleton Joints & Optical Glow (Subtle & Elegant)
      if (hands.length > 0) {
        const mirror = isMirrorRef.current;
        hands.forEach((hand) => {
          if (hand.length < 21) return;

          // Connect bones
          ctx.save();
          ctx.strokeStyle = `${themePrimary}40`;
          ctx.lineWidth = 2.0;

          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = hand[i];
            const p2 = hand[j];
            if (!p1 || !p2) return;
            const x1 = (mirror ? (1 - p1.x) : p1.x) * w;
            const y1 = p1.y * h;
            const x2 = (mirror ? (1 - p2.x) : p2.x) * w;
            const y2 = p2.y * h;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });

          // Draw Joint Dots
          hand.forEach((pt, idx) => {
            const px = (mirror ? (1 - pt.x) : pt.x) * w;
            const py = pt.y * h;
            const isTip = [4, 8, 12, 16, 20].includes(idx);
            ctx.beginPath();
            ctx.arc(px, py, isTip ? 4.5 : 2.5, 0, Math.PI * 2);
            ctx.fillStyle = isTip ? '#ffffff' : themePrimary;
            ctx.fill();
          });
          ctx.restore();
        });
      }

      // 6.5. Render Holographic Dual-Hand Rangefinder Caliper & Pinch-To-Zoom HUD
      if (hands.length >= 2 && hands[0].length >= 21 && hands[1].length >= 21) {
        const mirror = isMirrorRef.current;
        const p1x = (mirror ? (1 - hands[0][8].x) : hands[0][8].x) * w;
        const p1y = hands[0][8].y * h;
        const p2x = (mirror ? (1 - hands[1][8].x) : hands[1][8].x) * w;
        const p2y = hands[1][8].y * h;

        const midX = (p1x + p2x) / 2;
        const midY = (p1y + p2y) / 2;
        const distPx = Math.hypot(p2x - p1x, p2y - p1y);
        const angle = Math.atan2(p2y - p1y, p2x - p1x);
        const zoomPercent = Math.round(spatialZoomRef.current * 100);
        const distCm = Math.round((distPx / Math.max(w, h)) * 100);

        ctx.save();

        // 1. Dual Hand Connecting Laser Caliper Beam with Glow
        const laserGrad = ctx.createLinearGradient(p1x, p1y, p2x, p2y);
        laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
        laserGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.95)');
        laserGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');

        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -(now / 20) % 24;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#06b6d4';

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Optical Measurement Caliper Tick Marks
        const tickCount = Math.min(16, Math.max(4, Math.floor(distPx / 35)));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        for (let t = 1; t < tickCount; t++) {
          const ratio = t / tickCount;
          const tx = p1x + (p2x - p1x) * ratio;
          const ty = p1y + (p2y - p1y) * ratio;
          const normAngle = angle + Math.PI / 2;
          const tickLen = (t % 2 === 0 ? 8 : 4);
          ctx.beginPath();
          ctx.moveTo(tx - Math.cos(normAngle) * tickLen, ty - Math.sin(normAngle) * tickLen);
          ctx.lineTo(tx + Math.cos(normAngle) * tickLen, ty + Math.sin(normAngle) * tickLen);
          ctx.stroke();
        }

        // 3. Hand 1 & Hand 2 Target Rings & Pinched Brackets
        const drawHandReticle = (x: number, y: number, label: string, isPinched: boolean, color: string) => {
          const r = isPinched ? 18 : 24;
          const pulse = Math.sin(now * 0.015) * 3;

          // Outer brackets
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(x, y, r + pulse, -Math.PI * 0.25, Math.PI * 0.25);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, r + pulse, Math.PI * 0.75, Math.PI * 1.25);
          ctx.stroke();

          // Center dot
          ctx.beginPath();
          ctx.arc(x, y, isPinched ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = isPinched ? '#fbbf24' : '#ffffff';
          ctx.fill();

          // Label pill
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#000000';
          ctx.fillText(label, x + 24, y + 4);
        };

        const h1Pinched = twoHandTrackingRef.current.h1.pinch;
        const h2Pinched = twoHandTrackingRef.current.h2.pinch;
        drawHandReticle(p1x, p1y, `✋ TAY 1 ${h1Pinched ? '🫰 PINCH' : '✋ MỞ'}`, h1Pinched, '#06b6d4');
        drawHandReticle(p2x, p2y, `🤚 TAY 2 ${h2Pinched ? '🫰 PINCH' : '🤚 MỞ'}`, h2Pinched, '#38bdf8');

        // 4. Central Holographic Telemetry Badge Capsule
        const badgeW = 210;
        const badgeH = 46;
        const badgeX = midX - badgeW / 2;
        const badgeY = midY - badgeH / 2 - 12;

        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
        ctx.fill();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.stroke();

        // Icon + Main title
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`🔍 THU PHÓNG 2 TAY: ${zoomPercent}%`, midX, badgeY + 8);

        // Sub metrics
        ctx.font = '500 10px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`KC: ${distCm}cm • GÓC: ${Math.round((angle * 180) / Math.PI)}° • ${twoHandTrackingRef.current.isTracking ? '⚡ ĐANG THU PHÓNG' : 'SẴN SÀNG'}`, midX, badgeY + 26);

        ctx.restore();
        ctx.restore();
      }

      // 7. Render Air Pen Nib Halo / Hover Crosshair
      const airPos = airPenPosRef.current;
      if (airPos) {
        ctx.save();
        const nibX = airPos.x * w;
        const nibY = airPos.y * h;
        const isDrawing = isAirPenDrawingRef.current;
        const isEraser = activeToolRef.current === 'eraser';
        const color = brushColorRef.current;

        if (isEraser) {
          // Selective Eraser Mode: Red/Pink Target Reticle with Eraser Radius Halo
          const r = eraserRadiusRef.current || 32;
          const pulse = Math.sin(now * 0.015) * 3;

          ctx.beginPath();
          ctx.arc(nibX, nibY, r + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.beginPath();
          ctx.arc(nibX, nibY, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(nibX, nibY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#fecdd3';
          ctx.fillText('🧹 Tẩy Nét Sai', nibX + r + 8, nibY + 4);
        } else if (isDrawing) {
          // Actively drawing ink
          const pulse = Math.sin(now * 0.02) * 4;
          ctx.beginPath();
          ctx.arc(nibX, nibY, 14 + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 18;
          ctx.shadowColor = color;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(nibX, nibY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#000000';
          ctx.fillText('✍️ Đang Viết Theo Tay', nibX + 18, nibY + 4);
        } else {
          // Hover Aiming (Crosshair Target Reticle)
          ctx.beginPath();
          ctx.arc(nibX, nibY, 12, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([3, 3]);
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#06b6d4';
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.beginPath();
          ctx.moveTo(nibX - 14, nibY);
          ctx.lineTo(nibX - 5, nibY);
          ctx.moveTo(nibX + 5, nibY);
          ctx.lineTo(nibX + 14, nibY);
          ctx.moveTo(nibX, nibY - 14);
          ctx.lineTo(nibX, nibY - 5);
          ctx.moveTo(nibX, nibY + 5);
          ctx.lineTo(nibX, nibY + 14);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(nibX, nibY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();

          const triggerMode = airWritingTriggerModeRef.current;
          ctx.font = '500 10px sans-serif';
          ctx.fillStyle = '#a5f3fc';
          ctx.fillText(triggerMode === 'pinch_to_draw' ? '🎯 Chụm ngón để viết' : '🎯 Giơ ngón trỏ để viết', nibX + 18, nibY + 4);
        }

        ctx.restore();
      }

      // 8. Render Top Live Gesture HUD directly on Canvas
      ctx.save();
      const gestureText = activeGestureTextRef.current;
      if (gestureText) {
        ctx.font = '600 12px sans-serif';
        const textWidth = ctx.measureText(gestureText).width;
        const boxW = textWidth + 32;
        const boxH = 28;
        const boxX = (w - boxW) / 2;
        const boxY = 18;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 14);
        ctx.fill();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(boxX + 14, boxY + boxH / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(gestureText, boxX + 24, boxY + boxH / 2);
      }
      ctx.restore();

      // 9. Frame Cost & Live FPS Telemetry Monitor (Throttled update every 500ms)
      const frameEnd = performance.now();
      const costMs = frameEnd - frameStart;
      frameCountRef.current++;
      if (frameEnd - lastFpsTimeRef.current >= 500) {
        const computedFps = Math.round((frameCountRef.current * 1000) / (frameEnd - lastFpsTimeRef.current));
        setLiveFps(computedFps);
        setFrameTimeMs(Number(costMs.toFixed(1)));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = frameEnd;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // High-Performance 60FPS Multi-Tier Neon Spatial Curve Renderer (Enhanced with Adaptive Catmull-Rom Spline & Tapering)
  const drawSmoothStrokeCurve = (
    ctx: CanvasRenderingContext2D,
    points: DrawStrokePoint[],
    w: number,
    h: number,
    yOffset: number = 0
  ) => {
    if (points.length < 2) {
      if (points.length === 1) {
        const p = points[0];
        const py = p.y * h + yOffset;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x * w, py, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = p.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x * w, py, Math.max(1.5, p.size * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    const first = points[0];
    const color = first.color;
    const size = first.size;
    const bType = first.brushType || 'laser';

    // Helper to render smooth path across points
    const renderPath = () => {
      ctx.beginPath();
      ctx.moveTo(first.x * w, first.y * h + yOffset);
      for (let i = 1; i < points.length - 1; i++) {
        const cur = points[i];
        const next = points[i + 1];
        const midX = ((cur.x + next.x) / 2) * w;
        const midY = ((cur.y + next.y) / 2) * h + yOffset;
        ctx.quadraticCurveTo(cur.x * w, cur.y * h + yOffset, midX, midY);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x * w, last.y * h + yOffset);
    };

    // PASS 1: Outer Atmospheric Glow Halo (Type specific shadow blur & intensity)
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = bType === 'quantum' ? size * 2.2 : bType === 'aurora' ? size * 2.5 : size * 1.6;
    ctx.shadowBlur = bType === 'matrix' ? 12 : bType === 'neon' ? 24 : bType === 'galaxy' ? 26 : 18;
    ctx.shadowColor = bType === 'matrix' ? '#22c55e' : bType === 'quantum' ? '#ec4899' : color;
    
    if (bType === 'matrix') {
      ctx.setLineDash([4, 4]);
    } else if (bType === 'stardust') {
      ctx.setLineDash([8, 3, 2, 3]);
    }

    renderPath();
    ctx.stroke();
    ctx.restore();

    // PASS 2: Crisp Vibrant Mid-Ribbon (For Rainbow, Aurora & Galaxy Gradient feel)
    if (bType === 'rainbow' || bType === 'aurora' || bType === 'galaxy') {
      ctx.save();
      ctx.strokeStyle = bType === 'rainbow' ? 'rgba(255, 255, 255, 0.75)' : bType === 'aurora' ? '#6ee7b7' : '#c084fc';
      ctx.lineWidth = Math.max(2.0, size * 0.85);
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      renderPath();
      ctx.stroke();
      ctx.restore();
    }

    // PASS 3: High-Intensity White Plasma Core
    ctx.save();
    ctx.strokeStyle = bType === 'matrix' ? '#86efac' : bType === 'neon' ? '#e0f2fe' : '#ffffff';
    ctx.lineWidth = Math.max(1.8, size * 0.42);
    renderPath();
    ctx.stroke();
    ctx.restore();
  };

  const activeEnv = REALISTIC_ENVIRONMENTS.find(e => e.id === currentTheme) || REALISTIC_ENVIRONMENTS[0];

  return (
    <div 
      id="haevy-spatial-canvas-root"
      className="fixed inset-0 z-50 w-full max-w-full h-full h-[100dvh] bg-black overflow-hidden overflow-x-hidden select-none flex flex-col justify-between touch-pan-y overscroll-none"
    >
      {/* Background: Theme image or pure black */}
      {activeEnv.bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${activeEnv.bgUrl})` }}
        />
      )}

      {/* Atmospheric Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activeEnv.gradientOverlay} pointer-events-none transition-all duration-700`} />

      {/* Live Camera Video (Mirrored AR Overlay with Optical Adaptive Filters) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-500 ${
          isMirror ? '-scale-x-100' : ''
        }`}
        style={{ 
          opacity: isCameraActive ? cameraBlendOpacity : 0,
          filter: `brightness(${videoFilters.brightness}) contrast(${videoFilters.contrast}) saturate(${videoFilters.saturate}) ${
            videoFilters.nightVision ? 'drop-shadow(0 0 16px rgba(6,182,212,0.25))' : ''
          }`
        }}
      />

      {/* Hardware Accelerated 60FPS Spatial Drawing & Motion Canvas (Dual Input: Contactless Air + Direct Screen Touch/Pen) */}
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        className={`absolute inset-0 w-full h-full z-10 touch-none ${
          spaceView === 'canvas' ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none opacity-40'
        }`}
      />

      {/* ========================================================================= */}
      {/* TOP BAR: STREAMLINED CONTROLS & ESSENTIAL SWITCHES (MOBILE ERGONOMIC) */}
      {/* ========================================================================= */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-40 flex items-center justify-between pointer-events-none gap-1 sm:gap-2">
        
        {/* Left Toolbar: Quick Switchers, Tools, Soundscape & Calibration */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-nowrap shrink-0 overflow-x-auto no-scrollbar py-0.5 max-w-[50%] sm:max-w-none">
          {/* Quick Space Switcher to Space Portal */}
          {spaceView !== 'portal' && (
            <button
              onClick={() => {
                setSpaceView('portal');
                setSnapshotToast('🌌 Đã quay về Cổng Chọn Không Gian Haevy Space');
                setTimeout(() => setSnapshotToast(null), 1800);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 group shrink-0"
              title="Quay lại Cổng Chọn Không Gian Haevy Space"
            >
              <Home size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cổng Space</span>
              <span className="sm:hidden text-[11px]">Cổng</span>
            </button>
          )}

          {/* Quick Switch to Morning Dashboard */}
          {spaceView !== 'morning_dashboard' ? (
            <button
              onClick={() => {
                setSpaceView('morning_dashboard');
                setSnapshotToast('☀️ Đã mở Bảng Điều Khiển Buổi Sáng');
                setTimeout(() => setSnapshotToast(null), 1800);
              }}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 group shrink-0"
              title="Mở Bảng Điều Khiển Buổi Sáng (Tóm tắt Haevy Edu & Haevy Finance)"
            >
              <Sun size={13} className="text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="hidden md:inline">Bảng Buổi Sáng</span>
              <span className="md:hidden text-[11px]">Sáng ☀️</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSpaceView('canvas');
                setSnapshotToast('✍️ Đã chuyển sang Bảng Vẽ & Thư Pháp 3D');
                setTimeout(() => setSnapshotToast(null), 1800);
              }}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 shrink-0"
              title="Mở Bảng Vẽ 3D"
            >
              <PenLine size={13} />
              <span className="hidden md:inline">Bảng Vẽ 3D</span>
            </button>
          )}

          {/* Mode toggle between Canvas and Mascot */}
          {spaceView === 'canvas' && (
            <button
              onClick={() => {
                setSpaceView('mascot');
                setSnapshotToast('🐲 Đã chuyển sang Tương Tác Linh Vật 5D Haevy Son');
                setTimeout(() => setSnapshotToast(null), 1800);
              }}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 shrink-0"
              title="Chuyển sang tương tác với Linh vật 5D Haevy Son"
            >
              <Flame size={13} />
              <span className="hidden md:inline">Gặp Pet 5D</span>
            </button>
          )}

          {spaceView === 'mascot' && (
            <button
              onClick={() => {
                setSpaceView('canvas');
                setSnapshotToast('✍️ Đã chuyển sang Bảng Vẽ & Thư Pháp 3D');
                setTimeout(() => setSnapshotToast(null), 1800);
              }}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 shrink-0"
              title="Chuyển sang Bảng Vẽ & Thư Pháp 3D"
            >
              <PenLine size={13} />
              <span className="hidden md:inline">Bảng Vẽ 3D</span>
            </button>
          )}

          {/* Camera Button (In Canvas mode or when activated) */}
          {spaceView === 'canvas' && (
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              disabled={isCameraLoading}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold transition-all shadow-xl border backdrop-blur-xl shrink-0 ${
                isCameraActive
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 border-cyan-400/40 text-white hover:from-cyan-400 hover:to-indigo-500'
              }`}
              title={isCameraActive ? 'Tắt camera' : 'Bật camera'}
            >
              {isCameraLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isCameraActive ? (
                <Camera size={13} className="text-emerald-400 animate-pulse" />
              ) : (
                <Camera size={13} />
              )}
              <span className="hidden md:inline">{isCameraActive ? 'Camera Bật' : 'Camera'}</span>
            </button>
          )}

          {/* AR Scenery Theme Selector */}
          <button
            onClick={() => setShowSceneDrawer(true)}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold backdrop-blur-md shadow-lg transition-all shrink-0"
            title="Đổi bối cảnh không gian AR"
          >
            <Compass size={13} className="text-cyan-400" />
            <span className="hidden md:inline">Bối Cảnh</span>
          </button>

          {/* Optical Calibration & Low-Light Setting Button (Canvas mode only) - Responsive */}
          {spaceView === 'canvas' && (
            <button
              onClick={() => {
                setShowCalibrationModal(true);
                if (isCameraActive) runLightingAnalysis(true);
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border text-xs font-bold backdrop-blur-md shadow-md transition-all shrink-0 ${
                spaceCalibrationData || (isCameraActive && lightingAnalysisStats)
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                  : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
              title="Hiệu chuẩn quang học & Phân tích ánh sáng phòng"
            >
              <Scan size={13} className="text-amber-400" />
              <span className="hidden lg:inline">
                {lightingAnalysisStats ? `${lightingAnalysisStats.lux} Lux` : 'Hiệu Chuẩn'}
              </span>
            </button>
          )}

          {/* Direct Share to Community Feed Button - Desktop only */}
          {spaceView === 'canvas' && (
            <button
              onClick={handleDirectShareToCommunity}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 shrink-0"
              title="Chia sẻ tác phẩm 3D lên Bảng Tin Cộng Đồng (+25 Điểm)"
            >
              <Share2 size={13} className="text-amber-400" />
              <span className="hidden lg:inline">Chia Sẻ (+25đ)</span>
            </button>
          )}

          {/* Auto Screen & Workspace Balance Button (Canvas mode only) */}
          {spaceView === 'canvas' && (
            <button
              onClick={autoBalanceScreen}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-950/80 hover:bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 group shrink-0"
              title="Tự động cân bằng màn hình: Căn giữa nét vẽ, cân bằng đường chân trời và tối ưu hóa phơi sáng quang học"
            >
              <Scale size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Cân Bằng</span>
            </button>
          )}

          {/* Audio Soundscape Mute/Unmute */}
          <button
            onClick={() => {
              const nextMuted = !isSoundMuted;
              setIsSoundMuted(nextMuted);
              morningAudio.playSpatialBackground(soundscape, nextMuted ? 0 : 0.6);
            }}
            className={`p-1.5 sm:px-2.5 sm:py-2 rounded-2xl border text-xs transition-all backdrop-blur-md shrink-0 ${
              !isSoundMuted ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-zinc-950/80 border-zinc-800 text-zinc-500'
            }`}
            title={isSoundMuted ? 'Bật âm thanh không gian' : 'Tắt âm thanh'}
          >
            {isSoundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        {/* Right Navigation: Logo, Fullscreen, Smartphone App, Notifications, Avatar + Coins */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Haevy Space Logo (Top Right) */}
          <div className="hidden xs:flex items-center">
            <button
              onClick={() => {
                if (spaceView !== 'portal') {
                  setSpaceView('portal');
                }
              }}
              className="focus:outline-none transition-transform active:scale-95"
              title="Haevy Space - Vũ Trụ Không Gian 5D"
            >
              <HaevySpaceLogo variant="badge" size="sm" showSubtitle={false} animated={true} />
            </button>
          </div>

          {/* 🌟 Nút Chuyển Chế Độ Hệ Sinh Thái - Vị trí ưu tiên số 1, Luôn Luôn Hiển Thị Rõ Ràng & Không Bao Giờ Mất */}
          <button
            id="space-modes-btn"
            onClick={handleOpenDrawer}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 border border-amber-300/80 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0 backdrop-blur-xl group ring-1 ring-amber-400/40"
            title="Chuyển đổi qua các chế độ trong Hệ Sinh Thái Haevy (Audio, AI Hub, Tin Nhắn, VIP, Games,...)"
          >
            <Layers size={14} className="text-black group-hover:rotate-12 transition-transform shrink-0" />
            <span className="text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap">
              Chế Độ
            </span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            id="space-fullscreen-btn"
            onClick={toggleFullscreen}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-2xl border transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0 backdrop-blur-xl ${
              isFullscreen
                ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-amber-400/20'
                : 'bg-zinc-950/85 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Thu nhỏ màn hình (ESC)' : 'Phóng to toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize2 size={15} className="text-black" />
            ) : (
              <Maximize2 size={15} className="text-zinc-400 group-hover:text-white" />
            )}
            <span className="hidden xl:inline text-[11px] font-bold">
              {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </span>
          </button>

          {/* System & Friend Notifications Bell */}
          <button
            id="space-notification-btn"
            onClick={handleOpenNotifications}
            className="relative p-2 sm:px-2.5 sm:py-2 rounded-2xl bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 group shrink-0 backdrop-blur-xl"
            title="Xem thông báo hệ thống, lời mời kết bạn & tin nhắn"
          >
            <div className="relative flex items-center justify-center">
              <Bell size={15} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping sm:hidden" />
              )}
            </div>
            {totalNotifications > 0 && (
              <span className="px-1.5 py-0.2 min-w-[17px] h-[17px] rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">
                {totalNotifications}
              </span>
            )}
            <span className="hidden lg:inline text-[11px] font-bold text-zinc-300 group-hover:text-white">
              Thông báo
            </span>
          </button>

          {/* User Avatar with Haevy Coins Counter -> Opens Profile, VIP & Support Menu on Click */}
          {loading ? (
            <div className="w-20 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : user ? (
            <div className="relative shrink-0">
              <button
                id="space-user-profile-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full border transition-all text-left shadow-sm cursor-pointer group shrink-0 backdrop-blur-xl ${
                  isVip
                    ? 'bg-gradient-to-r from-amber-950/60 via-zinc-900/90 to-zinc-950/90 border-amber-500/50 hover:border-amber-400'
                    : 'bg-zinc-950/85 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
                title="Xem thông tin Haevy VIP, Haevy Hỗ Trợ & Trang Cá Nhân"
              >
                {/* Avatar Photo */}
                <div className="relative shrink-0 w-6 h-6 sm:w-7 sm:h-7">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover ring-1 ring-zinc-700 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 via-zinc-800 to-zinc-900 flex items-center justify-center text-white font-bold ring-1 ring-zinc-700 text-[10px] sm:text-xs">
                      {user.displayName?.charAt(0) || 'H'}
                    </div>
                  )}
                  {isVip && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-sm ring-1 ring-black">
                      <Crown size={8} fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Haevy Coins Counter */}
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold shrink-0">
                  <Coins size={12} className="text-amber-400 shrink-0" />
                  <span className={`whitespace-nowrap ${isVip ? 'text-amber-300 font-black' : 'text-zinc-100'}`}>
                    {(audioPoints ?? 0).toLocaleString()}
                  </span>
                </div>

                <ChevronDown 
                  size={11} 
                  className={`text-zinc-500 group-hover:text-amber-300 transition-transform shrink-0 ${isUserDropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:translate-y-0.5'}`} 
                />
              </button>

              {/* Haevy VIP, Support & Profile Dropdown */}
              <HaevyUserDropdownMenu
                isOpen={isUserDropdownOpen}
                onClose={() => setIsUserDropdownOpen(false)}
                onSelectMode={(mode, tab) => {
                  setIsUserDropdownOpen(false);
                  if (onSelectMode) {
                    onSelectMode(mode, tab as any);
                  } else {
                    onGoToAudioHome();
                  }
                }}
                onSelectTab={(tab) => {
                  setIsUserDropdownOpen(false);
                  onSelectTab?.(tab);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="space-open-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <LogIn size={13} />
                <span className="text-[11px]">Đăng nhập</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 HAEVY SPACE PORTAL: CỘNG ĐỒNG SÁNG TẠO ĐA CHIỀU (COMMUNITY HUB & PORTAL) */}
      {/* ========================================================================= */}
      {spaceView === 'portal' && (
        <HaevySpacePortalHub
          onSelectCanvas={(presetKey) => {
            setSpaceView('canvas');
            setIsCameraPromptDismissed(true);
            if (presetKey) {
              loadSpatialPresetTemplate(presetKey);
            } else {
              setSnapshotToast('✍️ Đã vào Bảng Vẽ & Thư Pháp 3D Toàn Màn Hình');
              setTimeout(() => setSnapshotToast(null), 2000);
            }
          }}
          onSelectMascot={() => {
            setSpaceView('mascot');
            setSnapshotToast('🐲 Đã vào Tương Tác Linh Vật 5D Haevy Son');
            setTimeout(() => setSnapshotToast(null), 2000);
          }}
          onSelectMagicAR={() => {
            setSpaceView('magic_ar');
            setSnapshotToast('🧙‍♂️ Đã vào Phép Thuật AR 2 Tay (Doctor Strange & Tia Sét Lượng Tử)');
            setTimeout(() => setSnapshotToast(null), 2000);
          }}
          onSelectMorningDashboard={() => {
            setSpaceView('morning_dashboard');
            setSnapshotToast('☀️ Đã vào Bảng Điều Khiển Buổi Sáng');
            setTimeout(() => setSnapshotToast(null), 2000);
          }}
          onStartCamera={startCamera}
          isCameraActive={isCameraActive}
          isCameraLoading={isCameraLoading}
          soundscape={soundscape}
          isSoundMuted={isSoundMuted}
          onToggleSound={() => {
            const nextMuted = !isSoundMuted;
            setIsSoundMuted(nextMuted);
            morningAudio.playSpatialBackground(soundscape, nextMuted ? 0 : 0.6);
          }}
          onChangeSoundscape={(s) => {
            setSoundscape(s);
            morningAudio.playSpatialBackground(s, isSoundMuted ? 0 : 0.6);
          }}
          onShareToCommunity={onShareToCommunity}
          onToast={(msg) => {
            setSnapshotToast(msg);
            setTimeout(() => setSnapshotToast(null), 3000);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* ☀️ HAEVY MORNING DASHBOARD: TÓM TẮT NHIỆM VỤ EDU & NGÂN SÁCH FINANCE */}
      {/* ========================================================================= */}
      {spaceView === 'morning_dashboard' && (
        <div className="relative z-20 w-full flex-1 overflow-y-auto pb-28 pt-16 sm:pt-20 px-2">
          <HaevyMorningDashboard
            onBackToPortal={() => {
              setSpaceView('portal');
              setSnapshotToast('🌌 Đã quay về Cổng Chọn Không Gian Haevy Space');
              setTimeout(() => setSnapshotToast(null), 1800);
            }}
            onSelectSubView={(sv) => {
              setSpaceView(sv);
              if (sv === 'canvas') {
                setSnapshotToast('✍️ Đã vào Bảng Vẽ & Thư Pháp 3D');
              } else if (sv === 'mascot') {
                setSnapshotToast('🐲 Đã vào Tương Tác Linh Vật 5D Haevy Son');
              } else if (sv === 'magic_ar') {
                setSnapshotToast('🧙‍♂️ Đã vào Phép Thuật AR 2 Tay');
              }
              setTimeout(() => setSnapshotToast(null), 1800);
            }}
            onNavigateToMode={(mode, tab) => {
              if (onSelectMode) {
                onSelectMode(mode as any, tab as any);
              }
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 HAEVY SPACE MỤC 2: TƯƠNG TÁC LINH VẬT 3D HAEVY SON (TOÀN MÀN HÌNH) */}
      {/* ========================================================================= */}
      {spaceView === 'mascot' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden animate-in fade-in duration-300">
          <HaevySonMascot3D 
            isStandaloneFullscreen={true}
            isExternalCameraActive={isCameraActive}
            onBackToPortal={() => {
              setSpaceView('portal');
              setSnapshotToast('🌌 Đã quay về Cổng Chọn Không Gian Haevy Space');
              setTimeout(() => setSnapshotToast(null), 1800);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧙‍♂️ HAEVY SPACE MỤC 3: PHÉP THUẬT AR 2 BÀN TAY (DOCTOR STRANGE & TIA SÉT) */}
      {/* ========================================================================= */}
      {spaceView === 'magic_ar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden animate-in fade-in duration-300">
          <HaevyMagicShieldAR
            isExternalCameraActive={isCameraActive}
            onBackToPortal={() => {
              setSpaceView('portal');
              setSnapshotToast('🌌 Đã quay về Cổng Chọn Không Gian Haevy Space');
              setTimeout(() => setSnapshotToast(null), 1800);
            }}
          />
        </div>
      )}

      {/* Camera Off Quick Start Banner (Only if camera is inactive and prompt not dismissed in canvas mode) */}
      {spaceView === 'canvas' && !isCameraActive && !isCameraPromptDismissed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-6 sm:p-7 rounded-3xl bg-zinc-950/95 backdrop-blur-2xl border border-cyan-500/40 text-center max-w-sm sm:max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
          <button 
            onClick={() => setIsCameraPromptDismissed(true)}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Đóng thông báo"
          >
            <X size={16} />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg">
            <PenLine size={28} className="animate-pulse" />
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-white mb-1.5">Không Gian Vẽ & Thư Pháp 3D</h4>
          <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
            Bạn có thể viết chữ, vẽ thư pháp 3D trực tiếp bằng chuột / cảm ứng màn hình hoặc bật camera để trải nghiệm vẽ không chạm 60 FPS.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={startCamera}
              disabled={isCameraLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isCameraLoading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              <span>Bật Camera Không Chạm (60 FPS)</span>
            </button>

            <button
              onClick={() => setIsCameraPromptDismissed(true)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <PenLine size={14} className="text-cyan-400" />
              <span>Bắt Đầu Vẽ Bằng Cảm Ứng / Chuột</span>
            </button>
          </div>
        </div>
      )}

      {/* Snapshot Toast Feedback */}
      {snapshotToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-xl border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 max-w-[90vw] text-center">
          <Sparkles size={14} className="text-cyan-400 shrink-0" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* Real-Time Handwritten Text Card (When OCR result is found) */}
      {recognizedLiveText && (
        <div className="absolute top-20 right-4 sm:right-6 z-30 max-w-xs sm:max-w-sm bg-zinc-950/90 backdrop-blur-2xl border border-cyan-500/40 p-3.5 rounded-3xl shadow-2xl animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
              <Bot size={13} />
              <span>Chữ Viết Tay Không Gian Đã Đọc</span>
            </div>
            <button 
              onClick={() => setRecognizedLiveText('')}
              className="text-zinc-500 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 mb-2 leading-snug">
            "{recognizedLiveText}"
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Độ tin cậy: <strong className="text-emerald-400">98%</strong></span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(recognizedLiveText);
                setSnapshotToast('📋 Đã sao chép văn bản vào bộ nhớ đệm!');
                setTimeout(() => setSnapshotToast(null), 3000);
              }}
              className="px-2 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition-all"
            >
              Sao Chép
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM STREAMLINED FLOATING DOCK (ERGONOMIC 3-ZONE LAYOUT - CANVAS MODE) */}
      {/* ========================================================================= */}
      {spaceView === 'canvas' && (
        <div className="absolute bottom-3 sm:bottom-5 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-none flex flex-col items-center gap-2">
          
          {/* Toggle Minimize/Maximize Dock Handle & Quick Mode Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() => setIsDockMinimized(!isDockMinimized)}
              className="px-3 py-1 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            >
              <span>{isDockMinimized ? 'Hiện Thanh Công Cụ' : 'Thu Gọn'}</span>
              {isDockMinimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {isDockMinimized && (
              <button
                id="space-minimized-modes-btn"
                onClick={handleOpenDrawer}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-[11px] flex items-center gap-1 backdrop-blur-md shadow-lg shadow-amber-500/20 border border-amber-300/80 transition-all cursor-pointer active:scale-95 ring-1 ring-amber-400/30"
                title="Chuyển chế độ trong Hệ Sinh Thái Haevy"
              >
                <Layers size={12} className="text-black shrink-0" />
                <span>Chế Độ</span>
              </button>
            )}
          </div>

          {!isDockMinimized && (
            <div className="pointer-events-auto w-full max-w-[calc(100vw-16px)] sm:max-w-4xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-3 duration-200 flex flex-col gap-1.5 sm:gap-2 box-border">
              
              {/* ROW 1: PRIMARY DRAWING, COLORS & UNDO/REDO */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full overflow-x-auto no-scrollbar py-0.5">
                
                {/* Pen vs Selective Eraser Switch */}
                <div className="flex items-center gap-1 bg-zinc-900/95 p-1 rounded-2xl border border-zinc-800 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTool('pen');
                      activeToolRef.current = 'pen';
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 sm:gap-1.5 ${
                      activeTool === 'pen'
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-black shadow-md shadow-cyan-500/25'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Bút vẽ không gian AR"
                  >
                    <PenLine size={13} />
                    <span>Bút Vẽ</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTool('eraser');
                      activeToolRef.current = 'eraser';
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 sm:gap-1.5 ${
                      activeTool === 'eraser'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 animate-pulse'
                        : 'text-zinc-400 hover:text-rose-300'
                    }`}
                    title="Cục tẩy không gian: Chỉ xóa đúng các nét sai mà đầu ngón tay chạm vào"
                  >
                    <Eraser size={13} />
                    <span>Cục Tẩy</span>
                  </button>
                </div>

                {/* Eraser Size Selector or Color Palette & Brush FX */}
                {activeTool === 'eraser' ? (
                  <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-500/40 p-1 rounded-2xl animate-in fade-in shrink-0">
                    <span className="text-[10px] text-rose-300 px-1 font-bold">CỠ:</span>
                    {[
                      { label: 'Nhỏ', r: 20 },
                      { label: 'Vừa', r: 34 },
                      { label: 'Lớn', r: 52 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setEraserRadius(item.r);
                          eraserRadiusRef.current = item.r;
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          eraserRadius === item.r
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-rose-300/70 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* Colors */}
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                      {['#fbbf24', '#06b6d4', '#38bdf8', '#f472b6', '#34d399', '#ffffff'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all ${
                            brushColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={color}
                        />
                      ))}
                    </div>

                    {/* Brush FX Selector Dropdown Button */}
                    <button
                      onClick={() => {
                        setShowBrushFxPicker(!showBrushFxPicker);
                        setShowMoreActions(false);
                      }}
                      className={`px-2 sm:px-2.5 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1 transition-all ${
                        showBrushFxPicker
                          ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'
                          : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                      }`}
                      title="Đổi hiệu ứng nét vẽ (Laser, Sao, Cầu vồng, Lửa, Ngọc, Galaxy, Neon, Quantum, Matrix, Aurora)"
                    >
                      <Palette size={13} className="text-cyan-400" />
                      <span className="hidden sm:inline capitalize">
                        {brushType === 'laser' ? '⚡ Laser' :
                         brushType === 'stardust' ? '✨ Sao' :
                         brushType === 'rainbow' ? '🌈 Cầu Vồng' :
                         brushType === 'plasma' ? '🔥 Lửa' :
                         brushType === 'emerald' ? '💎 Ngọc' :
                         brushType === 'galaxy' ? '🌌 Galaxy' :
                         brushType === 'neon' ? '💠 Neon' :
                         brushType === 'quantum' ? '⚛️ Quantum' :
                         brushType === 'matrix' ? '💻 Matrix' : '🌌 Aurora'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Undo / Redo */}
                <div className="flex items-center gap-0.5 bg-zinc-900/95 p-1 rounded-2xl border border-zinc-800 shrink-0">
                  <button
                    onClick={undoLastStroke}
                    disabled={strokeCount === 0}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                      strokeCount > 0
                        ? 'text-cyan-300 hover:bg-cyan-500/20 active:scale-95'
                        : 'text-zinc-600 opacity-40 cursor-not-allowed'
                    }`}
                    title="Hoàn tác nét sai vừa vẽ (Ctrl+Z)"
                  >
                    <Undo2 size={13} />
                  </button>

                  <button
                    onClick={redoLastStroke}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                      canRedo
                        ? 'text-cyan-300 hover:bg-cyan-500/20 active:scale-95'
                        : 'text-zinc-600 opacity-40 cursor-not-allowed'
                    }`}
                    title="Khôi phục nét vừa hoàn tác"
                  >
                    <Redo2 size={13} />
                  </button>
                </div>
              </div>

              {/* ROW 2: GESTURES, PERFORMANCE, ZOOM, AI SMART TOOLS & MORE */}
              <div className="flex items-center justify-between gap-1 sm:gap-2 w-full overflow-x-auto no-scrollbar py-0.5">
                
                {/* Gesture Mode Selector */}
                <div className="flex items-center gap-0.5 bg-zinc-900/90 p-0.5 sm:p-1 rounded-2xl border border-zinc-800 shrink-0">
                  <button
                    onClick={() => setAirWritingTriggerMode('pinch_to_draw')}
                    className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      airWritingTriggerMode === 'pinch_to_draw'
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Chụm ngón cái & trỏ để viết (Giống cầm bút thật)"
                  >
                    <span>🫰 Chụm</span>
                  </button>
                  <button
                    onClick={() => setAirWritingTriggerMode('index_continuous')}
                    className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      airWritingTriggerMode === 'index_continuous'
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Giơ ngón trỏ và di chuyển để vẽ liên tục"
                  >
                    <span>☝️ Trỏ</span>
                  </button>
                </div>

                {/* Ultra Low Latency (0-Lag) Accelerator Button */}
                <button
                  onClick={() => {
                    const next = !isUltraLowLatency;
                    setIsUltraLowLatency(next);
                    isUltraLowLatencyRef.current = next;
                    setSnapshotToast(next ? '⚡ Đã bật Chế Độ Giảm Trễ Siêu Tốc (MediaPipe 60FPS)!' : 'Đã chuyển về Cân Bằng');
                    setTimeout(() => setSnapshotToast(null), 2500);
                  }}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-2xl border text-xs font-extrabold transition-all flex items-center gap-1 shrink-0 ${
                    isUltraLowLatency
                      ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-amber-400/60 text-amber-300 shadow-md shadow-amber-500/15'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Tối ưu độ trễ siêu nhạy: Tăng tốc độ phản hồi nét vẽ theo ngón tay gần như 0ms"
                >
                  <Zap size={12} className={isUltraLowLatency ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'} />
                  <span>{isUltraLowLatency ? '⚡ 0-Lag' : '0-Lag'}</span>
                </button>

                {/* Dual-Hand Zoom & Caliper Controls */}
                <div className="flex items-center gap-0.5 bg-zinc-900/90 p-0.5 sm:p-1 rounded-2xl border border-zinc-800 shrink-0">
                  <button
                    onClick={() => {
                      const next = Math.max(0.4, Number((spatialZoom - 0.15).toFixed(2)));
                      setSpatialZoom(next);
                      spatialZoomRef.current = next;
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                    title="Thu nhỏ không gian"
                  >
                    <ZoomOut size={12} />
                  </button>

                  <button
                    onClick={() => {
                      setSpatialZoom(1.0);
                      spatialZoomRef.current = 1.0;
                    }}
                    className="px-1 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold text-cyan-300 hover:bg-cyan-950/40 transition-all"
                    title="Đặt lại mức thu phóng về 100%"
                  >
                    {Math.round(spatialZoom * 100)}%
                  </button>

                  <button
                    onClick={() => {
                      const next = Math.min(3.0, Number((spatialZoom + 0.15).toFixed(2)));
                      setSpatialZoom(next);
                      spatialZoomRef.current = next;
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                    title="Phóng to không gian"
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>

                {/* AI Beautify & Shape Straightener */}
                <button
                  onClick={beautifyAndReconstructStrokesWithAI}
                  disabled={isAiBeautifying}
                  className="px-2 sm:px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white border border-purple-300/40 text-xs font-extrabold flex items-center gap-1 shadow-lg active:scale-95 transition-all shrink-0"
                  title="Dùng AI Gemini nắn thẳng hình học (tam giác, chữ nhật, parabol,..) và chữ viết tay"
                >
                  {isAiBeautifying ? (
                    <Loader2 size={12} className="animate-spin text-yellow-300" />
                  ) : (
                    <Wand2 size={12} className="text-yellow-300" />
                  )}
                  <span className="hidden sm:inline">Nắn Thẳng AI</span>
                  <span className="sm:hidden text-[11px]">Nắn AI</span>
                </button>

                {/* AI OCR Handwriting Reader */}
                <button
                  onClick={() => recognizeHandwritingWithAI(false)}
                  disabled={isRecognizingText}
                  className="px-2 sm:px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white border border-cyan-300/40 text-xs font-extrabold flex items-center gap-1 shadow-lg active:scale-95 transition-all shrink-0"
                  title="Đọc chữ viết tay không gian qua AI Vision"
                >
                  {isRecognizingText ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
                  <span className="hidden sm:inline">Đọc Chữ AI</span>
                  <span className="sm:hidden text-[11px]">Đọc AI</span>
                </button>

                {/* Ecosystem Mode Switcher Button in Canvas Dock */}
                <button
                  id="space-dock-modes-btn"
                  onClick={handleOpenDrawer}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black border border-amber-300/80 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer ring-1 ring-amber-400/40"
                  title="Chuyển sang chế độ khác trong Hệ Sinh Thái Haevy (Audio, AI Hub, VIP, Games,...)"
                >
                  <Layers size={13} className="text-black shrink-0" />
                  <span>Chế Độ</span>
                </button>

                {/* More Actions Popover Trigger */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => {
                      setShowMoreActions(!showMoreActions);
                      setShowBrushFxPicker(false);
                    }}
                    className={`p-1.5 sm:p-2 rounded-2xl border text-xs font-bold transition-all ${
                      showMoreActions
                        ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                    title="Các tùy chọn & Thao tác khác"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                {/* More Actions Dropdown Menu */}
                {showMoreActions && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-2 rounded-2xl shadow-2xl animate-in zoom-in-95 z-50 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleOpenDrawer();
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 text-xs font-extrabold flex items-center gap-2 transition-all text-left border border-amber-500/40 shadow-sm"
                    >
                      <Layers size={14} className="text-amber-400" />
                      <span>🌌 Chuyển Chế Độ Hệ Sinh Thái</span>
                    </button>
                    <button
                      onClick={() => {
                        openAnimeMetaverse();
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-sky-950/90 to-indigo-950/90 hover:from-sky-900 hover:to-indigo-900 text-sky-200 text-xs font-extrabold flex items-center gap-2 transition-all text-left border border-sky-500/40 shadow-sm"
                    >
                      <Sparkles size={14} className="text-yellow-300" />
                      <span>🌌 Hoàn Thành & Tái Tạo Anime 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMathShapesPicker(true);
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-amber-950/60 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all text-left"
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>📐 Thư Viện Hình Toán Học 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        materializeActiveStrokesTo3DHologram();
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-indigo-950/60 text-indigo-300 text-xs font-bold flex items-center gap-2 transition-all text-left"
                    >
                      <Sparkles size={14} className="text-indigo-400" />
                      <span>Xuất Hiện 3D Hologram</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowEmojiPicker(true);
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-2 transition-all text-left"
                    >
                      <Smile size={14} className="text-cyan-400" />
                      <span>Thả Emoji 3D</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTakeSnapshot();
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-cyan-950/50 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all text-left"
                    >
                      <Camera size={14} className="text-cyan-400" />
                      <span>Chụp Ảnh Tác Phẩm</span>
                    </button>

                    <button
                      onClick={() => {
                        setAutoShapeSnap(!autoShapeSnap);
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-between transition-all text-left"
                    >
                      <span>📐 Tự Nắn Hình Học</span>
                      <span className={`text-[10px] font-extrabold ${autoShapeSnap ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {autoShapeSnap ? 'BẬT' : 'TẮT'}
                      </span>
                    </button>

                    <div className="h-px bg-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        clearSpatialCanvas();
                        setShowMoreActions(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-red-950/60 text-red-400 text-xs font-bold flex items-center gap-2 transition-all text-left"
                    >
                      <Trash2 size={14} />
                      <span>Xóa Sạch Bảng Vẽ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Brush FX Popover */}
        {showBrushFxPicker && !isDockMinimized && (
          <div className="pointer-events-auto bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-3 rounded-3xl shadow-2xl animate-in zoom-in-95 max-w-md flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette size={13} className="text-cyan-400" />
                <span>Hiệu Ứng Bút Vẽ Không Gian</span>
              </span>
              <button onClick={() => setShowBrushFxPicker(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'laser', label: '⚡ Laser', desc: 'Sáng xanh rực' },
                { id: 'neon', label: '💠 Neon AR', desc: 'Hào quang Cyan' },
                { id: 'stardust', label: '✨ Bụi Sao', desc: 'Lấp lánh chấm' },
                { id: 'rainbow', label: '🌈 Cầu Vồng', desc: 'Quang phổ đổi màu' },
                { id: 'plasma', label: '🔥 Plasma', desc: 'Nhiệt năng cam rực' },
                { id: 'emerald', label: '💎 Lục Bảo', desc: 'Ngọc xanh biếc' },
                { id: 'galaxy', label: '🌌 Ngân Hà', desc: 'Tím vũ trụ huyền ảo' },
                { id: 'quantum', label: '⚛️ Quantum', desc: 'Hồng lượng tử' },
                { id: 'matrix', label: '💻 Matrix', desc: 'Mã số Neon Green' },
                { id: 'aurora', label: '🌌 Aurora', desc: 'Cực quang Bắc Cực' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBrushType(b.id as any);
                    setShowBrushFxPicker(false);
                    morningAudio.triggerStarPop();
                  }}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all flex flex-col ${
                    brushType === b.id
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
                  }`}
                >
                  <span className="text-xs">{b.label}</span>
                  <span className="text-[9px] text-zinc-400 font-normal truncate mt-0.5">{b.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Quick Gesture Guide Pill */}
        {showHelperTips && (
          <div className="pointer-events-auto flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-xl border border-cyan-500/30 text-[11px] text-zinc-300 shadow-xl max-w-2xl animate-in fade-in slide-in-from-bottom-2">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400 shrink-0" />
              <span>
                <strong>Mẹo tương tác:</strong> Chụm 2 ngón 🫰 để viết • Bấm <strong>⚖️ Cân Bằng</strong> để căn giữa nét & ánh sáng • Chọn <strong>🧹 Cục Tẩy</strong> để tẩy đúng nét sai.
              </span>
            </span>
            <button
              onClick={() => setShowHelperTips(false)}
              className="text-zinc-500 hover:text-white text-xs px-1 font-bold"
              title="Đóng mẹo"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      )}

      {/* Floating Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 sm:right-10 z-40 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-3 rounded-3xl shadow-2xl max-w-xs animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <span className="text-xs font-bold text-white">Thả Biểu Tượng 3D</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SPATIAL_EMOJIS.map((item) => (
              <button
                key={item.emoji}
                onClick={() => {
                  spawnSpatialEmoji(item.emoji, 0.5, 0.45, 4);
                  setShowEmojiPicker(false);
                }}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xl text-center transition-all hover:scale-125"
                title={item.name}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating 3D Spatial Math Shapes Library Modal */}
      {showMathShapesPicker && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950/95 border border-zinc-800/90 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg">
                    📐
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Thư Viện Hình Toán Học Trong Không Gian</h3>
                    <p className="text-xs text-zinc-400">Chọn hình toán học hoặc khối 3D để tạo trực tiếp vào không gian AR</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMathShapesPicker(false)}
                  className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs"
                >
                  ✕ Đóng
                </button>
              </div>

              {/* Shapes Categorized Grid */}
              <div className="space-y-4 overflow-y-auto max-h-[58vh] pr-1">
                {/* 1. Không Gian 3D (Spatial 3D Polyhedra & Curved Surfaces) */}
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🪐 Khối Không Gian 3D & Mặt Cong</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        title: 'Khối Hộp 3D',
                        desc: 'Khối lập phương phối cảnh',
                        icon: '🧊',
                        gen: () => generateMath3DCubeStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Hình Chóp 3D',
                        desc: 'Kim tự tháp đáy vuông',
                        icon: '🔺',
                        gen: () => generateMath3DPyramidStrokes(0.5, 0.45, 0.35, 0.4, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Mặt Cầu 3D',
                        desc: 'Vĩ tuyến & kinh tuyến cầu',
                        icon: '🌐',
                        gen: () => generateMath3DSphereStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Hình Trụ 3D',
                        desc: 'Khối trụ tròn xoay',
                        icon: '🛢️',
                        gen: () => generateMath3DCylinderStrokes(0.5, 0.45, 0.3, 0.42, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Hình Nón 3D',
                        desc: 'Khối nón đỉnh nhọn',
                        icon: '🍦',
                        gen: () => generateMath3DConeStrokes(0.5, 0.45, 0.32, 0.42, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Xoắn Ốc Helix 3D',
                        desc: 'Đường xoắn ốc 3 chiều',
                        icon: '🌀',
                        gen: () => generateMath3DHelixStrokes(0.5, 0.45, 0.35, 0.45, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Vòng Xuyến Torus 3D',
                        desc: 'Bánh donut hình học xoay',
                        icon: '🍩',
                        gen: () => generateMath3DTorusStrokes(0.5, 0.45, 0.4, 0.35, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Xoắn Ốc Vàng Fibonacci',
                        desc: 'Golden Spiral tỉ lệ vàng',
                        icon: '🐚',
                        gen: () => generateMathGoldenSpiralStrokes(0.5, 0.45, 0.4, 0.4, brushColor, brushType, brushSize)
                      }
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          const strokes = item.gen();
                          drawStrokesRef.current = strokes;
                          materializeActiveStrokesTo3DHologram(`📐 ${item.title}`);
                          morningAudio.triggerPeaceRainbowChime();
                          setSnapshotToast(`✨ Đã tạo hình: ${item.title}!`);
                          setShowMathShapesPicker(false);
                          setTimeout(() => setSnapshotToast(null), 3000);
                        }}
                        className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 text-left transition-all hover:scale-[1.02] flex flex-col justify-between group"
                      >
                        <div className="text-2xl mb-1.5">{item.icon}</div>
                        <div>
                          <div className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">{item.title}</div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Đồ Thị Hàm Số & Đường Cong Giải Tích */}
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>📈 Đồ Thị & Đường Cong Giải Tích</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        title: 'Hệ Trục Oxy',
                        desc: 'Trục tọa độ vuông góc',
                        icon: '➕',
                        gen: () => generateMathCoordinateAxesStrokes(0.5, 0.45, 0.45, 0.45, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Parabol y = ax²',
                        desc: 'Đường cong bậc hai',
                        icon: '∪',
                        gen: () => generateMathParabolaStrokes(0.5, 0.45, 0.4, 0.35, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Sóng Sin y = sin(x)',
                        desc: 'Dao động điều hòa',
                        icon: '∿',
                        gen: () => generateMathSinWaveStrokes(0.5, 0.45, 0.5, 0.3, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Đường Hyperbol',
                        desc: '2 nhánh hyperbol đối xứng',
                        icon: '≍',
                        gen: () => generateMathHyperbolaStrokes(0.5, 0.45, 0.42, 0.4, brushColor, brushType, brushSize)
                      }
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          const strokes = item.gen();
                          drawStrokesRef.current = strokes;
                          materializeActiveStrokesTo3DHologram(`📐 ${item.title}`);
                          morningAudio.triggerPeaceRainbowChime();
                          setSnapshotToast(`✨ Đã tạo đồ thị: ${item.title}!`);
                          setShowMathShapesPicker(false);
                          setTimeout(() => setSnapshotToast(null), 3000);
                        }}
                        className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all hover:scale-[1.02] flex flex-col justify-between group"
                      >
                        <div className="text-2xl mb-1.5">{item.icon}</div>
                        <div>
                          <div className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors">{item.title}</div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Hình Học Phẳng Chuẩn Xác */}
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>📐 Hình Học Phẳng Chuẩn Xác</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        title: 'Tam Giác Đều',
                        desc: '3 cạnh và 3 góc 60°',
                        icon: '▲',
                        gen: () => generateMathTriangleStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize, 'equilateral')
                      },
                      {
                        title: 'Tam Giác Vuông',
                        desc: 'Góc vuông kèm ký hiệu',
                        icon: '📐',
                        gen: () => generateMathTriangleStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize, 'right_angled')
                      },
                      {
                        title: 'Hình Chữ Nhật / Vuông',
                        desc: '4 góc vuông hoàn hảo',
                        icon: '▭',
                        gen: () => generateMathRectangleStrokes(0.5, 0.45, 0.4, 0.3, brushColor, brushType, brushSize, false)
                      },
                      {
                        title: 'Hình Thoi',
                        desc: '4 cạnh bằng nhau',
                        icon: '◇',
                        gen: () => generateMathRhombusStrokes(0.5, 0.45, 0.38, 0.38, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Đường Tròn Hoàn Hảo',
                        desc: 'Tâm và bán kính tròn đều',
                        icon: '◯',
                        gen: () => generatePerfectCircleStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Vector / Mũi Tên',
                        desc: 'Hướng và độ dài vector',
                        icon: '➔',
                        gen: () => generateMathArrowStrokes(0.3, 0.5, 0.7, 0.4, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Ký Hiệu Vô Cực ∞',
                        desc: 'Đường lemniscate vô cực',
                        icon: '∞',
                        gen: () => generatePerfectInfinityStrokes(0.5, 0.45, 0.4, 0.25, brushColor, brushType, brushSize)
                      },
                      {
                        title: 'Góc Kèm Cung Tròn',
                        desc: 'Đỉnh góc và số đo góc',
                        icon: '∠',
                        gen: () => generateMathAngleStrokes(0.5, 0.45, 0.35, 0.35, brushColor, brushType, brushSize)
                      }
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          const strokes = item.gen();
                          drawStrokesRef.current = strokes;
                          materializeActiveStrokesTo3DHologram(`📐 ${item.title}`);
                          morningAudio.triggerPeaceRainbowChime();
                          setSnapshotToast(`✨ Đã tạo hình: ${item.title}!`);
                          setShowMathShapesPicker(false);
                          setTimeout(() => setSnapshotToast(null), 3000);
                        }}
                        className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 text-left transition-all hover:scale-[1.02] flex flex-col justify-between group"
                      >
                        <div className="text-2xl mb-1.5">{item.icon}</div>
                        <div>
                          <div className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">{item.title}</div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>💡 Mẹo: Bạn cũng có thể vẽ tay phác thảo rồi nhấn <strong>🪄 Nắn Thẳng AI</strong></span>
              <button
                onClick={() => setShowMathShapesPicker(false)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition-all shadow-md"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scenery Theme Modal */}
      {showSceneDrawer && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Chọn Bối Cảnh Không Gian AR</h3>
              </div>
              <button 
                onClick={() => setShowSceneDrawer(false)}
                className="p-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {REALISTIC_ENVIRONMENTS.map((env) => {
                const IconComponent = env.icon;
                const isSelected = currentTheme === env.id;
                return (
                  <button
                    key={env.id}
                    onClick={() => {
                      setCurrentTheme(env.id);
                      setShowSceneDrawer(false);
                    }}
                    style={{ borderColor: isSelected ? env.accentColor : undefined }}
                    className={`relative flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected ? 'bg-zinc-900 ring-2' : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
                    }`}
                  >
                    {env.bgUrl && (
                      <div 
                        className="w-full h-16 rounded-xl bg-cover bg-center mb-1.5"
                        style={{ backgroundImage: `url(${env.bgUrl})` }}
                      />
                    )}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <IconComponent size={13} style={{ color: env.accentColor }} />
                      <span className="font-bold text-xs text-white">{env.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-2">
                      {env.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AR Environmental Optical Radar Scanning HUD */}
      {isScanRadarActive && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center p-4">
          {/* Holographic Matrix Grid & Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-pulse" />
          
          {/* Central AR HUD Target Matrix */}
          <div className="p-6 rounded-3xl bg-zinc-950/90 backdrop-blur-2xl border border-cyan-500/60 shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95 max-w-sm text-center">
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center animate-[spin_8s_linear_infinite]">
              <Scan size={28} className="text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>AI Đang Quét Quang Học Không Gian</span>
              </h4>
              <p className="text-xs text-cyan-200/80 mt-1 leading-relaxed">
                Đang đo lường độ sáng phòng, tương phản da tay và khử nhiễu hậu cảnh...
              </p>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
              <div className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Space Calibration & Low-Light Enhancement Modal */}
      {showCalibrationModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                  <Scan size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Hiệu Chuẩn Không Gian & Phân Tích Ánh Sáng</h3>
                  <p className="text-[11px] text-zinc-400">Tự động cân bằng phơi sáng, tương phản cử chỉ & khử nhiễu</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Live Periodic Lighting Analysis HUD Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-cyan-950/20 to-zinc-900/90 border border-cyan-500/30 mb-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                  <Zap size={14} className={isAnalyzingLight ? 'animate-spin text-amber-400' : 'text-amber-400'} />
                  <span>PHÂN TÍCH QUANG HỌC CHU KỲ (LIGHTING ANALYSIS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoLightingAnalysis(!isAutoLightingAnalysis)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all border ${
                      isAutoLightingAnalysis
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {isAutoLightingAnalysis ? 'AUTO: BẬT' : 'AUTO: TẮT'}
                  </button>
                  <button
                    onClick={() => runLightingAnalysis(true)}
                    disabled={isAnalyzingLight}
                    className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold flex items-center gap-1 transition-all"
                  >
                    <Lightbulb size={11} className="text-amber-300" />
                    <span>Đo Ngay</span>
                  </button>
                </div>
              </div>

              {lightingAnalysisStats && (
                <div className="grid grid-cols-4 gap-2 text-center mt-2">
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-400 font-bold block">ĐỘ RỌI</span>
                    <span className="text-xs font-black text-amber-300">{lightingAnalysisStats.lux} Lux</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-400 font-bold block">TRẠNG THÁI</span>
                    <span className="text-xs font-black text-cyan-300">
                      {lightingAnalysisStats.condition === 'low_light' ? 'Thiếu Sáng' :
                       lightingAnalysisStats.condition === 'dim' ? 'Mờ Tối' :
                       lightingAnalysisStats.condition === 'backlit' ? 'Ngược Sáng' : 'Đủ Sáng'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-400 font-bold block">BÙ SÁNG EV</span>
                    <span className="text-xs font-black text-emerald-400">
                      {lightingAnalysisStats.evCompensation >= 0 ? '+' : ''}{lightingAnalysisStats.evCompensation} EV
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-400 font-bold block">DẢI TƯƠNG PHẢN</span>
                    <span className="text-xs font-black text-purple-300">{lightingAnalysisStats.contrast} / 255</span>
                  </div>
                </div>
              )}
            </div>

            {/* Environmental Lighting Metric Cards (if full space calibration was run) */}
            {spaceCalibrationData ? (
              <>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1">MÔI TRƯỜNG AI</span>
                    <div className="text-xs font-extrabold text-cyan-300 flex items-center justify-center gap-1">
                      {spaceCalibrationData.ambientLighting === 'low_light' ? '🌙 Thiếu Sáng' :
                       spaceCalibrationData.ambientLighting === 'dim' ? '🌓 Mờ Tối' :
                       spaceCalibrationData.ambientLighting === 'backlit' ? '⛅ Ngược Sáng' : '☀️ Chuẩn'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1">ĐIỂM QUANG HỌC</span>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {spaceCalibrationData.lightingQualityScore}/100
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 font-bold block mb-1">TƯƠNG PHẢN TAY</span>
                    <div className="text-xs font-extrabold text-amber-400">
                      {spaceCalibrationData.skinToneContrast === 'high' ? 'Cao ✨' :
                       spaceCalibrationData.skinToneContrast === 'medium' ? 'Vừa Phải' : 'Yếu (Đã Bù)'}
                    </div>
                  </div>
                </div>

                {/* AI Summary Banner */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 mb-4 flex items-start gap-2">
                  <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold mb-0.5">{spaceCalibrationData.statusSummary}</strong>
                    <p className="text-[11px] text-cyan-300/80 leading-relaxed">{spaceCalibrationData.calibrationAdvice}</p>
                  </div>
                </div>
              </>
            ) : null}

            {/* Live Filter Sliders & Adjustments */}
            <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <SunMedium size={14} className="text-amber-400" />
                  Độ Sáng Video: {Math.round(videoFilters.brightness * 100)}%
                </span>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.05"
                  value={videoFilters.brightness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const next = { ...videoFilters, brightness: val };
                    setVideoFilters(next);
                    videoFiltersRef.current = next;
                  }}
                  className="w-32 accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-cyan-400" />
                  Tương Phản Cử Chỉ: {Math.round(videoFilters.contrast * 100)}%
                </span>
                <input
                  type="range"
                  min="0.8"
                  max="1.7"
                  step="0.05"
                  value={videoFilters.contrast}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const next = { ...videoFilters, contrast: val };
                    setVideoFilters(next);
                    videoFiltersRef.current = next;
                  }}
                  className="w-32 accent-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Moon size={14} className="text-purple-400" />
                  Bộ Lọc Night-Vision Phòng Tối:
                </span>
                <button
                  onClick={() => {
                    const next = { ...videoFilters, nightVision: !videoFilters.nightVision };
                    setVideoFilters(next);
                    videoFiltersRef.current = next;
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase transition-all ${
                    videoFilters.nightVision
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {videoFilters.nightVision ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={calibrateSpaceWithAI}
                disabled={isCalibratingSpace}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Scan size={14} />
                <span>{spaceCalibrationData ? 'Quét Lại Môi Trường AI' : 'Bắt Đầu Quét AI Không Gian'}</span>
              </button>

              <button
                onClick={resetSpaceCalibration}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs border border-zinc-800 transition-all"
              >
                Đặt Lại
              </button>

              <button
                onClick={() => setShowCalibrationModal(false)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-extrabold text-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HAEVY ANIME METAVERSE & DIGITAL SELF 3D RECONSTRUCTION MODAL */}
      <HaevyAnimeMetaverseModal
        isOpen={showAnimeMetaverseModal}
        onClose={() => setShowAnimeMetaverseModal(false)}
        initialTab={animeMetaverseInitialTab}
        strokes={animeMetaverseStrokes}
        snapshotBase64={animeMetaverseSnapshot}
        detectedShapes={recognizedLiveText ? [recognizedLiveText] : []}
        pinnedHolograms={pinnedHolograms.map(h => ({ title: h.title, type: h.brushType || 'laser', color: h.color }))}
        onSaveSnapshot={(dataUrl) => {
          setSnapshotToast('🌟 Đã lưu bưu thiếp Anime vào bộ sưu tập vũ trụ!');
          setTimeout(() => setSnapshotToast(null), 3000);
        }}
        onShareToCommunity={onShareToCommunity}
      />

      {/* 🌟 HAEVY ALL MODES INFO MODAL (TRIGGERED FROM SMARTPHONE BUTTON OR AVATAR) */}
      <HaevyAllModesInfoModal
        isOpen={isEcosystemDrawerOpen}
        onClose={() => setIsEcosystemDrawerOpen(false)}
        onSelectMode={(mode, tab) => {
          setIsEcosystemDrawerOpen(false);
          if (onSelectMode) {
            onSelectMode(mode, tab);
          } else if (onGoToAudioHome) {
            onGoToAudioHome();
          }
        }}
      />

      {/* 🔔 NOTIFICATIONS MODAL */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onSelectTab={(tab) => {
          setIsNotificationsModalOpen(false);
          onSelectTab?.(tab);
        }}
        onSelectMode={(mode, tab) => {
          setIsNotificationsModalOpen(false);
          onSelectMode?.(mode, tab);
        }}
      />

      {/* 📱 INSTALL PWA MODAL */}
      <InstallPwaModal
        isOpen={isInstallPwaModalOpen}
        onClose={() => setIsInstallPwaModalOpen(false)}
      />
    </div>
  );
}
