import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  Shield, 
  Sliders, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  CheckCircle2,
  Info,
  Layers,
  HandMetal,
  Smartphone,
  Crosshair,
  Target,
  Scan,
  Activity,
  Flame,
  RefreshCw,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { morningAudio } from '../services/morningAudioService';

export interface HandPoint2D {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  z?: number;
}

export type MagicThemeType = 
  | 'doctor_strange' 
  | 'cyber_blue' 
  | 'neon_violet' 
  | 'emerald_matrix' 
  | 'divine_gold' 
  | 'crimson_phoenix' 
  | 'glacial_frost' 
  | 'holographic_rainbow';

export type HandSensitivityMode = 'ultra_fast' | 'balanced' | 'high_precision';

export interface MagicColorPalette {
  id: MagicThemeType;
  name: string;
  label: string;
  modelTag: string;
  primary: string;
  secondary: string;
  accent: string;
  core: string;
  glow: string;
  icon: string;
  description: string;
}

export const MAGIC_PALETTES: Record<MagicThemeType, MagicColorPalette> = {
  doctor_strange: {
    id: 'doctor_strange',
    name: '🔥 Doctor Strange (Cam Đỏ Rực Lửa)',
    label: 'Doctor Strange',
    modelTag: 'Eldritch Mystic 5D',
    primary: '#ff5500',
    secondary: '#ff9900',
    accent: '#ffcc00',
    core: '#fff7ed',
    glow: 'rgba(255, 85, 0, 0.85)',
    icon: '🔥',
    description: 'Hào quang ma thuật rực lửa, cổ ngữ Kamar-Taj và hồ quang cam vàng kinh điển.'
  },
  cyber_blue: {
    id: 'cyber_blue',
    name: '⚡ Cyber Blue (Lam Lượng Tử)',
    label: 'Cyber Blue',
    modelTag: 'Quantum Cyber 5D',
    primary: '#00d2ff',
    secondary: '#00f2fe',
    accent: '#a5f3fc',
    core: '#f0fdff',
    glow: 'rgba(0, 210, 255, 0.85)',
    icon: '⚡',
    description: 'Tia sét lượng tử xanh Cyberpunk, lưới số ma trận và khiên lượng tử băng giá.'
  },
  neon_violet: {
    id: 'neon_violet',
    name: '🔮 Neon Violet (Tím Huyền Bí)',
    label: 'Neon Violet',
    modelTag: 'Void Mystic 5D',
    primary: '#b026ff',
    secondary: '#d946ef',
    accent: '#f472b6',
    core: '#faf5ff',
    glow: 'rgba(176, 38, 255, 0.85)',
    icon: '🔮',
    description: 'Năng lượng hư không vũ trụ tím neon huyền bí, ma pháp hắc ám và vòng xoáy tinh vân.'
  },
  emerald_matrix: {
    id: 'emerald_matrix',
    name: '🟢 Emerald Matrix (Ngọc Lục Bảo)',
    label: 'Emerald Matrix',
    modelTag: 'Time Stone Agamotto',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#6ee7b7',
    core: '#ecfdf5',
    glow: 'rgba(16, 185, 129, 0.85)',
    icon: '🟢',
    description: 'Ngọc lục bảo thao túng thời gian Agamotto, tia laser ma trận số học xanh mướt.'
  },
  divine_gold: {
    id: 'divine_gold',
    name: '👑 Divine Gold (Hoàng Kim Thái Cực)',
    label: 'Divine Gold',
    modelTag: 'Solar Divine 5D',
    primary: '#eab308',
    secondary: '#f59e0b',
    accent: '#fef08a',
    core: '#fffbeb',
    glow: 'rgba(234, 179, 8, 0.85)',
    icon: '👑',
    description: 'Thái dương kim quang, tia sét thần thánh và hoa văn bảo hộ hoàng kim rực rỡ.'
  },
  crimson_phoenix: {
    id: 'crimson_phoenix',
    name: '🦅 Crimson Phoenix (Phép Thuật Hỗn Mang)',
    label: 'Crimson Phoenix',
    modelTag: 'Chaos Ruby Magic',
    primary: '#ef4444',
    secondary: '#e11d48',
    accent: '#fda4af',
    core: '#fff1f2',
    glow: 'rgba(239, 68, 68, 0.85)',
    icon: '🦅',
    description: 'Phép thuật hỗn mang đỏ thẫm Chaos Magic của Scarlet Witch & phượng hoàng lửa.'
  },
  glacial_frost: {
    id: 'glacial_frost',
    name: '❄️ Glacial Frost (Băng Tuyết Cực Bắc)',
    label: 'Glacial Frost',
    modelTag: 'Ice Diamond 5D',
    primary: '#0284c7',
    secondary: '#38bdf8',
    accent: '#e0f2fe',
    core: '#ffffff',
    glow: 'rgba(56, 189, 248, 0.85)',
    icon: '❄️',
    description: 'Băng tinh tuyết trắng nguyên sơ, vòng tròn băng giá tuyệt đối và tia hàn băng.'
  },
  holographic_rainbow: {
    id: 'holographic_rainbow',
    name: '🌈 Holographic Prism (Lăng Kính Đa Sắc)',
    label: 'Holographic Prism',
    modelTag: 'Spectral Rainbow 5D',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    core: '#fdf4ff',
    glow: 'rgba(236, 72, 153, 0.85)',
    icon: '🌈',
    description: 'Quang phổ lăng kính 7 màu biến ảo 5D, phản chiếu đa chiều thời không rực rỡ.'
  }
};

export const AVAILABLE_MAGIC_THEMES: MagicThemeType[] = [
  'doctor_strange',
  'cyber_blue',
  'neon_violet',
  'emerald_matrix',
  'divine_gold',
  'crimson_phoenix',
  'glacial_frost',
  'holographic_rainbow'
];

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface DataNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

interface SmoothedHandState {
  x: number;
  y: number;
  angle: number;
  radius: number;
  active: boolean;
}

interface HaevyMagicShieldARProps {
  onBackToPortal: () => void;
  isExternalCameraActive?: boolean;
  initialTheme?: MagicThemeType;
  onThemeChange?: (theme: MagicThemeType) => void;
}

export function HaevyMagicShieldAR({
  onBackToPortal,
  isExternalCameraActive = false,
  initialTheme,
  onThemeChange
}: HaevyMagicShieldARProps) {
  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // AR & Camera Tracking States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(isExternalCameraActive);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  
  // Hand Tracking Sensitivity Engine & Calibration
  const [handSensitivity, setHandSensitivity] = useState<HandSensitivityMode>(() => {
    try {
      const saved = localStorage.getItem('haevy_ar_hand_sensitivity');
      if (saved === 'ultra_fast' || saved === 'balanced' || saved === 'high_precision') {
        return saved;
      }
    } catch {}
    return 'ultra_fast'; // Default to Ultra-Fast for instantaneous zero-lag response
  });
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [handTrackingStatus, setHandTrackingStatus] = useState<{
    hand1Found: boolean;
    hand2Found: boolean;
    totalHands: number;
  }>({
    hand1Found: false,
    hand2Found: false,
    totalHands: 0
  });

  // Persistent Theme State
  const [selectedTheme, setSelectedTheme] = useState<MagicThemeType>(() => {
    if (initialTheme && MAGIC_PALETTES[initialTheme]) return initialTheme;
    try {
      const saved = localStorage.getItem('haevy_ar_magic_theme');
      if (saved && MAGIC_PALETTES[saved as MagicThemeType]) return saved as MagicThemeType;
    } catch {}
    return 'doctor_strange';
  });

  const [distanceThreshold, setDistanceThreshold] = useState<number>(0.32);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);

  // Throttled UI Display States (Updated at ~10Hz to prevent 60FPS React re-render freezing)
  const [uiState, setUiState] = useState<{
    activeHandState: 'close_lightning' | 'spread_shields' | 'single_hand' | 'none';
    distancePercent: number;
    fps: number;
    power: number;
  }>({
    activeHandState: 'none',
    distancePercent: 0,
    fps: 60,
    power: 85
  });

  // Simulation Dual Hands
  const [isSimulatingHands, setIsSimulatingHands] = useState<boolean>(!isExternalCameraActive);
  const simHand1Ref = useRef<{ x: number; y: number }>({ x: 0.32, y: 0.55 });
  const simHand2Ref = useRef<{ x: number; y: number }>({ x: 0.68, y: 0.55 });
  const activePointersRef = useRef<Map<number, 'hand1' | 'hand2'>>(new Map());

  // Animation Loop & Particle Buffers (Local Refs, Zero-GC Leak)
  const animationFrameIdRef = useRef<number>(0);
  const sparksRef = useRef<SparkParticle[]>([]);
  const dataNodesRef = useRef<DataNode[]>([]);
  const shieldAngle1Ref = useRef<number>(0);
  const shieldAngle2Ref = useRef<number>(0);

  // Smoothed Hand Coordinates to Damper Hand Jitter & Hold Buffer (Anti-Flicker)
  const smoothedHand1Ref = useRef<SmoothedHandState>({ x: 0, y: 0, angle: 0, radius: 100, active: false });
  const smoothedHand2Ref = useRef<SmoothedHandState>({ x: 0, y: 0, angle: 0, radius: 100, active: false });
  const lastSeenHand1TimeRef = useRef<number>(0);
  const lastSeenHand2TimeRef = useRef<number>(0);

  // State Management with Hysteresis Schmitt Trigger
  const internalHandStateRef = useRef<'close_lightning' | 'spread_shields' | 'single_hand' | 'none'>('none');
  const lastStateChangeTimeRef = useRef<number>(0);
  const lastAudioTriggerTimeRef = useRef<number>(0);
  const lastHapticTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  // FPS Telemetry
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());
  const currentFpsRef = useRef<number>(60);

  // MediaPipe Hands Instance & Watchdog
  const mediaPipeHandsRef = useRef<any>(null);
  const isProcessingMediaPipeFrameRef = useRef<boolean>(false);
  const lastMediaPipeSendTimeRef = useRef<number>(0);
  const detectedHandsLandmarksRef = useRef<Array<HandPoint2D[]>>([]);

  // Change hand sensitivity mode
  const handleChangeSensitivity = useCallback((mode: HandSensitivityMode) => {
    setHandSensitivity(mode);
    try {
      localStorage.setItem('haevy_ar_hand_sensitivity', mode);
    } catch {}

    if (mediaPipeHandsRef.current) {
      try {
        const conf = mode === 'ultra_fast' ? 0.32 : mode === 'high_precision' ? 0.65 : 0.45;
        const comp = mode === 'ultra_fast' ? 0 : 1;
        mediaPipeHandsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: comp,
          minDetectionConfidence: conf,
          minTrackingConfidence: conf
        });
      } catch {}
    }

    const labels = {
      ultra_fast: '⚡ Siêu Nhạy (Bắt tay tức thì)',
      balanced: '🎯 Cân Bằng Chuẩn',
      high_precision: '🛡️ Chuẩn Xác Cao'
    };
    setSnapshotToast(`✋ Đã chuyển chế độ: ${labels[mode]}`);
    setTimeout(() => setSnapshotToast(null), 2500);
  }, []);

  // Theme change handler
  const handleSelectTheme = useCallback((theme: MagicThemeType) => {
    const validTheme = MAGIC_PALETTES[theme] ? theme : 'doctor_strange';
    setSelectedTheme(validTheme);
    try {
      localStorage.setItem('haevy_ar_magic_theme', validTheme);
    } catch {}
    if (onThemeChange) {
      onThemeChange(validTheme);
    }
    const pal = MAGIC_PALETTES[validTheme];
    setSnapshotToast(`${pal.icon} Đã kích hoạt: ${pal.label} (${pal.modelTag})`);
    setTimeout(() => setSnapshotToast(null), 2500);
  }, [onThemeChange]);

  // Sync with prop
  useEffect(() => {
    if (initialTheme && MAGIC_PALETTES[initialTheme] && initialTheme !== selectedTheme) {
      setSelectedTheme(initialTheme);
    }
  }, [initialTheme]);

  // Initialize Data Nodes
  useEffect(() => {
    const nodes: DataNode[] = [];
    for (let i = 0; i < 32; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 140,
        y: (Math.random() - 0.5) * 140,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        alpha: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2 + 1.5
      });
    }
    dataNodesRef.current = nodes;
  }, []);

  // Initialize MediaPipe with CDN check & retry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isCancelled = false;
    let retryInterval: any = null;

    const setupHands = () => {
      const windowAny = window as any;
      const HandsConstructor = windowAny.Hands;
      if (!HandsConstructor) return false;

      try {
        const hands = new HandsConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        });

        const conf = handSensitivity === 'ultra_fast' ? 0.32 : handSensitivity === 'high_precision' ? 0.65 : 0.45;
        const comp = handSensitivity === 'ultra_fast' ? 0 : 1;

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: comp,
          minDetectionConfidence: conf,
          minTrackingConfidence: conf
        });

        hands.onResults((results: any) => {
          isProcessingMediaPipeFrameRef.current = false;
          if (isCancelled) return;
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            detectedHandsLandmarksRef.current = results.multiHandLandmarks;
          } else {
            detectedHandsLandmarksRef.current = [];
          }
        });

        mediaPipeHandsRef.current = hands;
        return true;
      } catch (err) {
        console.warn('Error setting up MediaPipe Hands:', err);
        return false;
      }
    };

    if (!setupHands()) {
      retryInterval = setInterval(() => {
        if (setupHands()) {
          clearInterval(retryInterval);
        }
      }, 400);
    }

    return () => {
      isCancelled = true;
      if (retryInterval) clearInterval(retryInterval);
      if (mediaPipeHandsRef.current) {
        try {
          mediaPipeHandsRef.current.close();
        } catch {}
      }
    };
  }, [handSensitivity]);

  // Start Camera with Fast 60FPS user constraint
  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 60, min: 30 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsCameraLoading(false);
          setIsSimulatingHands(false);
          setSnapshotToast('📷 Camera Nhận Diện Bàn Tay đã kích hoạt! Giơ 2 tay trước ống kính');
          setTimeout(() => setSnapshotToast(null), 3000);
        };
      }
    } catch (err) {
      console.warn('Camera access fallback to simulation:', err);
      setIsCameraLoading(false);
      setIsCameraActive(false);
      setIsSimulatingHands(true);
      setSnapshotToast('✋ Camera chưa bật. Đã kích hoạt chế độ Cảm Ứng Đa Điểm 2 Tay');
      setTimeout(() => setSnapshotToast(null), 3500);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    detectedHandsLandmarksRef.current = [];
    setIsSimulatingHands(true);
  };

  // Automatically start camera on mount for immediate hand tracking experience
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Haptic & Sound Trigger on State Transition
  const triggerStateFeedback = useCallback((newState: 'close_lightning' | 'spread_shields' | 'single_hand' | 'none') => {
    const now = performance.now();
    if (now - lastAudioTriggerTimeRef.current > 350) {
      lastAudioTriggerTimeRef.current = now;
      if (!isMuted) {
        try {
          if (newState === 'close_lightning') {
            morningAudio.triggerLightningArcCrackle();
          } else if (newState === 'spread_shields') {
            morningAudio.triggerDoctorStrangeShieldHum();
          }
        } catch {}
      }
    }

    if (hapticEnabled && now - lastHapticTimeRef.current > 350) {
      lastHapticTimeRef.current = now;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          if (newState === 'close_lightning') {
            navigator.vibrate([35, 20, 50, 20, 70]);
          } else if (newState === 'spread_shields') {
            navigator.vibrate([40, 30, 40]);
          }
        } catch {}
      }
    }
  }, [hapticEnabled, isMuted]);

  // Main 60-120 FPS AR Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isSubscribed = true;

    const renderFrame = () => {
      if (!isSubscribed) return;

      const now = performance.now();

      // Handle Canvas Sizing
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas Cleanly
      ctx.clearRect(0, 0, width, height);

      // FPS Measurement
      fpsFrameCountRef.current++;
      if (now - fpsLastTimeRef.current >= 1000) {
        currentFpsRef.current = fpsFrameCountRef.current;
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      // MediaPipe Watchdog & Frame Sending
      if (isProcessingMediaPipeFrameRef.current && now - lastMediaPipeSendTimeRef.current > 350) {
        isProcessingMediaPipeFrameRef.current = false;
      }

      if (isCameraActive && videoRef.current && videoRef.current.readyState >= 2 && mediaPipeHandsRef.current) {
        if (!isProcessingMediaPipeFrameRef.current && now - lastMediaPipeSendTimeRef.current > 25) {
          lastMediaPipeSendTimeRef.current = now;
          isProcessingMediaPipeFrameRef.current = true;
          try {
            mediaPipeHandsRef.current.send({ image: videoRef.current }).catch(() => {
              isProcessingMediaPipeFrameRef.current = false;
            });
          } catch {
            isProcessingMediaPipeFrameRef.current = false;
          }
        }
      }

      const palette = MAGIC_PALETTES[selectedTheme] || MAGIC_PALETTES.doctor_strange;
      const detected = detectedHandsLandmarksRef.current;

      // Raw Target Centers
      let rawH1: { x: number; y: number; angle: number; radius: number } | null = null;
      let rawH2: { x: number; y: number; angle: number; radius: number } | null = null;

      if (isCameraActive && detected.length >= 2) {
        const h1 = detected[0];
        const h2 = detected[1];

        const p1x = (1 - (h1[0].x + h1[5].x + h1[17].x) / 3) * width;
        const p1y = ((h1[0].y + h1[5].y + h1[17].y) / 3) * height;
        const p2x = (1 - (h2[0].x + h2[5].x + h2[17].x) / 3) * width;
        const p2y = ((h2[0].y + h2[5].y + h2[17].y) / 3) * height;

        const a1 = Math.atan2(h1[12].y - h1[0].y, -(h1[12].x - h1[0].x));
        const a2 = Math.atan2(h2[12].y - h2[0].y, -(h2[12].x - h2[0].x));

        const r1 = Math.hypot((h1[9].x - h1[0].x) * width, (h1[9].y - h1[0].y) * height) * 1.65;
        const r2 = Math.hypot((h2[9].x - h2[0].x) * width, (h2[9].y - h2[0].y) * height) * 1.65;

        rawH1 = { x: p1x, y: p1y, angle: a1, radius: Math.max(70, Math.min(180, r1)) };
        rawH2 = { x: p2x, y: p2y, angle: a2, radius: Math.max(70, Math.min(180, r2)) };
        lastSeenHand1TimeRef.current = now;
        lastSeenHand2TimeRef.current = now;

        if (showSkeleton) {
          drawHandSkeleton(ctx, h1, width, height, palette.accent);
          drawHandSkeleton(ctx, h2, width, height, palette.accent);
        }
      } else if (isCameraActive && detected.length === 1) {
        const h1 = detected[0];
        const p1x = (1 - (h1[0].x + h1[5].x + h1[17].x) / 3) * width;
        const p1y = ((h1[0].y + h1[5].y + h1[17].y) / 3) * height;
        const a1 = Math.atan2(h1[12].y - h1[0].y, -(h1[12].x - h1[0].x));
        const r1 = Math.hypot((h1[9].x - h1[0].x) * width, (h1[9].y - h1[0].y) * height) * 1.65;

        rawH1 = { x: p1x, y: p1y, angle: a1, radius: Math.max(70, Math.min(180, r1)) };
        lastSeenHand1TimeRef.current = now;

        if (showSkeleton) {
          drawHandSkeleton(ctx, h1, width, height, palette.accent);
        }

        // Draw Smart Locator Reticle for the missing 2nd hand
        const guideX = p1x < width * 0.5 ? width * 0.72 : width * 0.28;
        const guideY = height * 0.52;
        drawSmartHandTargetReticle(
          ctx, 
          guideX, 
          guideY, 
          '🤚 ĐƯA THÊM TAY 2 VÀO ĐÂY ĐỂ TẠO TIA SÉT', 
          palette.secondary, 
          true,
          now
        );
      } else if (isCameraActive && detected.length === 0) {
        // Draw Pre-Detection Hologram Guidance Reticles for Both Hands
        drawSmartHandTargetReticle(
          ctx, 
          width * 0.30, 
          height * 0.52, 
          '✋ ĐẶT TAY TRÁI VÀO ĐÂY', 
          palette.primary, 
          false,
          now
        );
        drawSmartHandTargetReticle(
          ctx, 
          width * 0.70, 
          height * 0.52, 
          '🤚 ĐẶT TAY PHẢI VÀO ĐÂY', 
          palette.secondary, 
          false,
          now
        );
      } else if (isSimulatingHands || !isCameraActive) {
        const p1x = simHand1Ref.current.x * width;
        const p1y = simHand1Ref.current.y * height;
        const p2x = simHand2Ref.current.x * width;
        const p2y = simHand2Ref.current.y * height;

        rawH1 = { x: p1x, y: p1y, angle: 0, radius: 105 };
        rawH2 = { x: p2x, y: p2y, angle: 0, radius: 105 };

        drawSimulatedHandHandle(ctx, p1x, p1y, '✋ TAY 1 (Kéo / Chạm)', palette.secondary);
        drawSimulatedHandHandle(ctx, p2x, p2y, '🤚 TAY 2 (Kéo / Chạm)', palette.secondary);
      }

      // Jitter Damper & Exponential Moving Average (EMA) Smoothing with Hold Buffer
      const smoothAlpha = 0.78;
      if (rawH1) {
        if (!smoothedHand1Ref.current.active) {
          smoothedHand1Ref.current = { ...rawH1, active: true };
        } else {
          smoothedHand1Ref.current.x += (rawH1.x - smoothedHand1Ref.current.x) * smoothAlpha;
          smoothedHand1Ref.current.y += (rawH1.y - smoothedHand1Ref.current.y) * smoothAlpha;
          smoothedHand1Ref.current.angle += (rawH1.angle - smoothedHand1Ref.current.angle) * smoothAlpha;
          smoothedHand1Ref.current.radius += (rawH1.radius - smoothedHand1Ref.current.radius) * smoothAlpha;
        }
      } else if (isCameraActive && now - lastSeenHand1TimeRef.current < 160 && smoothedHand1Ref.current.active) {
        // Keep active for 160ms hold buffer to bridge frame dropouts
      } else {
        smoothedHand1Ref.current.active = false;
      }

      if (rawH2) {
        if (!smoothedHand2Ref.current.active) {
          smoothedHand2Ref.current = { ...rawH2, active: true };
        } else {
          smoothedHand2Ref.current.x += (rawH2.x - smoothedHand2Ref.current.x) * smoothAlpha;
          smoothedHand2Ref.current.y += (rawH2.y - smoothedHand2Ref.current.y) * smoothAlpha;
          smoothedHand2Ref.current.angle += (rawH2.angle - smoothedHand2Ref.current.angle) * smoothAlpha;
          smoothedHand2Ref.current.radius += (rawH2.radius - smoothedHand2Ref.current.radius) * smoothAlpha;
        }
      } else if (isCameraActive && now - lastSeenHand2TimeRef.current < 160 && smoothedHand2Ref.current.active) {
        // Keep active for 160ms hold buffer to bridge frame dropouts
      } else {
        smoothedHand2Ref.current.active = false;
      }

      // Spin shield rotation angles
      shieldAngle1Ref.current += 0.024;
      shieldAngle2Ref.current -= 0.024;

      let currentActiveState: 'close_lightning' | 'spread_shields' | 'single_hand' | 'none' = 'none';
      let currentDistNorm = 0;
      let calculatedPower = 85;

      const h1Active = smoothedHand1Ref.current.active;
      const h2Active = smoothedHand2Ref.current.active;
      const h1Center = smoothedHand1Ref.current;
      const h2Center = smoothedHand2Ref.current;

      if (h1Active && h2Active) {
        const dx = (h1Center.x - h2Center.x) / width;
        const dy = (h1Center.y - h2Center.y) / height;
        currentDistNorm = Math.hypot(dx, dy);

        const midX = (h1Center.x + h2Center.x) / 2;
        const midY = (h1Center.y + h2Center.y) / 2;

        // Hysteresis buffer to completely eliminate rapid fluttering near distance threshold
        const hystBuffer = 0.035;
        const prevState = internalHandStateRef.current;

        let shouldBeLightning = false;
        if (prevState === 'close_lightning') {
          shouldBeLightning = currentDistNorm <= distanceThreshold + hystBuffer;
        } else {
          shouldBeLightning = currentDistNorm <= distanceThreshold - hystBuffer;
        }

        if (shouldBeLightning) {
          // =========================================================================
          // TRẠNG THÁI 1: 2 BÀN TAY CHỤM LẠI -> TIA SÉT NĂNG LƯỢNG & LƯỚI SỐ
          // =========================================================================
          currentActiveState = 'close_lightning';
          calculatedPower = Math.min(100, Math.round(92 + Math.max(0, 1 - currentDistNorm / distanceThreshold) * 8));

          // 1. Draw Golden Central Plasma Core
          const intensity = Math.max(0.2, 1 - currentDistNorm / distanceThreshold);
          drawCentralPlasmaOrb(ctx, midX, midY, palette, intensity);

          // 2. Draw Branching Fractal Lightning Arcs
          drawLightningArcs(ctx, h1Center.x, h1Center.y, h2Center.x, h2Center.y, palette);

          // 3. Draw Cybernetic Digital Data Grid Nodes
          drawCyberDataGrid(ctx, midX, midY, dataNodesRef.current, palette);

          // 4. Emit Sparks into local buffer (Hard capped)
          emitSparksLocal(sparksRef.current, h1Center.x, h1Center.y, 2, palette);
          emitSparksLocal(sparksRef.current, h2Center.x, h2Center.y, 2, palette);
          emitSparksLocal(sparksRef.current, midX, midY, 4, palette);
        } else {
          // =========================================================================
          // TRẠNG THÁI 2: 2 BÀN TAY MỞ RỘNG -> 2 VÒNG TRÒN PHÉP THUẬT DOCTOR STRANGE
          // =========================================================================
          currentActiveState = 'spread_shields';
          calculatedPower = 88;

          // Draw Doctor Strange Shield 1
          drawDoctorStrangeMagicShield(
            ctx,
            h1Center.x,
            h1Center.y,
            h1Center.radius,
            shieldAngle1Ref.current,
            palette
          );

          // Draw Doctor Strange Shield 2
          drawDoctorStrangeMagicShield(
            ctx,
            h2Center.x,
            h2Center.y,
            h2Center.radius,
            shieldAngle2Ref.current,
            palette
          );

          // Emit Centrifugal Sparks
          emitShieldCentrifugalSparksLocal(sparksRef.current, h1Center.x, h1Center.y, h1Center.radius, shieldAngle1Ref.current, palette);
          emitShieldCentrifugalSparksLocal(sparksRef.current, h2Center.x, h2Center.y, h2Center.radius, shieldAngle2Ref.current, palette);
        }
      } else if (h1Active) {
        currentActiveState = 'single_hand';
        calculatedPower = 75;
        drawDoctorStrangeMagicShield(
          ctx,
          h1Center.x,
          h1Center.y,
          h1Center.radius,
          shieldAngle1Ref.current,
          palette
        );
        emitShieldCentrifugalSparksLocal(sparksRef.current, h1Center.x, h1Center.y, h1Center.radius, shieldAngle1Ref.current, palette);
      } else {
        currentActiveState = 'none';
        calculatedPower = 0;
      }

      // Check State Transition & Trigger Audio/Haptic once
      if (currentActiveState !== internalHandStateRef.current) {
        internalHandStateRef.current = currentActiveState;
        lastStateChangeTimeRef.current = now;
        triggerStateFeedback(currentActiveState);
      }

      // Update & Draw All Sparks Particles
      updateAndDrawSparksLocal(ctx, sparksRef.current);

      // Throttled UI state updates (~10Hz) to keep React UI synchronized without frame lag
      if (now - lastUiUpdateRef.current >= 100) {
        lastUiUpdateRef.current = now;
        setUiState({
          activeHandState: currentActiveState,
          distancePercent: Math.round(currentDistNorm * 100),
          fps: currentFpsRef.current,
          power: calculatedPower
        });
        setHandTrackingStatus({
          hand1Found: h1Active,
          hand2Found: h2Active,
          totalHands: (h1Active ? 1 : 0) + (h2Active ? 1 : 0)
        });
      }

      animationFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      isSubscribed = false;
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isCameraActive, selectedTheme, distanceThreshold, showSkeleton, isSimulatingHands, triggerStateFeedback]);

  // Multi-Touch & Pointer Handlers for Seamless Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const d1 = Math.hypot(x - simHand1Ref.current.x, y - simHand1Ref.current.y);
    const d2 = Math.hypot(x - simHand2Ref.current.x, y - simHand2Ref.current.y);

    let assignedHand: 'hand1' | 'hand2' = 'hand1';
    if (d1 <= d2) {
      simHand1Ref.current = { x, y };
      assignedHand = 'hand1';
    } else {
      simHand2Ref.current = { x, y };
      assignedHand = 'hand2';
    }

    activePointersRef.current.set(e.pointerId, assignedHand);
    if (!isCameraActive) setIsSimulatingHands(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const assignedHand = activePointersRef.current.get(e.pointerId);
    if (!assignedHand || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0.06, Math.min(0.94, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.08, Math.min(0.92, (e.clientY - rect.top) / rect.height));

    if (assignedHand === 'hand1') {
      simHand1Ref.current = { x, y };
    } else {
      simHand2Ref.current = { x, y };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
  };

  // Snapshot Capture
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = canvasRef.current.width;
      snapCanvas.height = canvasRef.current.height;
      const sCtx = snapCanvas.getContext('2d');
      if (!sCtx) return;

      if (videoRef.current && isCameraActive && videoRef.current.readyState >= 2) {
        sCtx.save();
        sCtx.scale(-1, 1);
        sCtx.drawImage(videoRef.current, -snapCanvas.width, 0, snapCanvas.width, snapCanvas.height);
        sCtx.restore();
      } else {
        sCtx.fillStyle = '#09090b';
        sCtx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);
      }

      sCtx.drawImage(canvasRef.current, 0, 0);

      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 15px sans-serif';
      sCtx.fillText('🧙‍♂️ Haevy Space • Doctor Strange 5D AR Magic', 24, snapCanvas.height - 24);

      const dataUrl = snapCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `HaevySpace_MagicAR_${Date.now()}.png`;
      a.click();

      setSnapshotToast('📸 Đã chụp & lưu ảnh Phép Thuật AR thành công!');
      setTimeout(() => setSnapshotToast(null), 3000);
    } catch {
      setSnapshotToast('⚠️ Lỗi khi chụp ảnh AR');
      setTimeout(() => setSnapshotToast(null), 2500);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      switch (key) {
        case 'escape':
          onBackToPortal();
          break;
        case 'c':
          if (isCameraActive) stopCamera();
          else startCamera();
          break;
        case 'h':
          setShowSkeleton(prev => !prev);
          break;
        case 'm':
          setIsMuted(prev => !prev);
          break;
        case 'v':
          setHapticEnabled(prev => !prev);
          break;
        case 's':
          setIsSimulatingHands(prev => !prev);
          break;
        case 't': {
          const currentIndex = AVAILABLE_MAGIC_THEMES.indexOf(selectedTheme);
          const nextIndex = (currentIndex + 1) % AVAILABLE_MAGIC_THEMES.length;
          handleSelectTheme(AVAILABLE_MAGIC_THEMES[nextIndex]);
          break;
        }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8': {
          const num = parseInt(key, 10);
          if (num >= 1 && num <= AVAILABLE_MAGIC_THEMES.length) {
            handleSelectTheme(AVAILABLE_MAGIC_THEMES[num - 1]);
          }
          break;
        }
        case ' ':
          handleTakeSnapshot();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraActive, onBackToPortal, selectedTheme, handleSelectTheme]);

  const currentPalette = MAGIC_PALETTES[selectedTheme] || MAGIC_PALETTES.doctor_strange;

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col justify-between select-none animate-in fade-in duration-300 touch-none"
    >
      {/* 📷 LIVE VIDEO CAMERA BACKGROUND */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none transition-opacity duration-500 ${
          isCameraActive ? 'opacity-85' : 'opacity-0'
        }`}
      />

      {/* Cyber Grid Background if Camera is Off */}
      {!isCameraActive && (
        <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      )}

      {/* 🔮 MAIN AR MAGIC CANVAS (60-120 FPS HIGH PERFORMANCE ZERO-LAG RENDER) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* ========================================================================= */}
      {/* 🌌 TOP NAVIGATION & TELEMETRY HUD BAR */}
      {/* ========================================================================= */}
      <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        {/* Left: Back to Portal + Title Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToPortal}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white text-xs font-bold transition-all shadow-xl active:scale-95 flex items-center gap-1.5 backdrop-blur-xl"
            title="Quay lại Cổng Chọn Không Gian Haevy Space"
          >
            <ArrowLeft size={16} className="text-amber-400" />
            <span className="hidden sm:inline">Cổng Haevy Space</span>
          </button>

          <div className="px-3 py-1.5 rounded-2xl bg-zinc-950/90 border border-amber-500/40 shadow-xl backdrop-blur-xl flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              🧙‍♂️ MỤC 3: PHÉP THUẬT AR 2 TAY
            </span>
          </div>
        </div>

        {/* Center: Live Gesture Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl text-xs font-extrabold shadow-xl">
          {uiState.activeHandState === 'close_lightning' ? (
            <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
              <Zap size={15} className="text-yellow-400" />
              <span>⚡ TRẠNG THÁI 1: TIA SÉT NĂNG LƯỢNG & LƯỚI SỐ</span>
            </span>
          ) : uiState.activeHandState === 'spread_shields' ? (
            <span className="text-orange-400 flex items-center gap-1.5">
              <Shield size={15} className="text-amber-400" />
              <span>🛡️ TRẠNG THÁI 2: VÒNG TRÒN PHÉP THUẬT DOCTOR STRANGE</span>
            </span>
          ) : uiState.activeHandState === 'single_hand' ? (
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={15} />
              <span>✨ 1 TAY: KHIÊN PHÉP THUẬT HUYỀN BÍ</span>
            </span>
          ) : (
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Info size={14} />
              <span>Đưa 2 bàn tay trước camera hoặc chạm kéo 2 tay trên màn hình</span>
            </span>
          )}
        </div>

        {/* Right: Theme Picker Pill, Camera Toggle, Audio & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 🎨 Dedicated Active Theme Picker Pill */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border text-xs font-black transition-all shadow-xl backdrop-blur-xl flex items-center gap-2 active:scale-95 group"
            style={{
              borderColor: currentPalette.primary,
              boxShadow: `0 0 16px ${currentPalette.glow}`
            }}
            title="Đổi màu quang phổ phép thuật AR (Phím T hoặc 1-8)"
          >
            <span className="text-sm">{currentPalette.icon}</span>
            <span className="text-white hidden sm:inline">{currentPalette.label}</span>
            <div 
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: currentPalette.primary }}
            />
          </button>

          {/* Camera Toggle Button */}
          <button
            onClick={() => {
              if (isCameraActive) stopCamera();
              else startCamera();
            }}
            disabled={isCameraLoading}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xl flex items-center gap-1.5 backdrop-blur-xl ${
              isCameraActive 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20' 
                : 'bg-zinc-950/90 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title="Bật/Tắt Camera nhận diện bàn tay (Phím C)"
          >
            {isCameraActive ? <Camera size={15} /> : <CameraOff size={15} />}
            <span className="hidden sm:inline">{isCameraActive ? 'Camera' : 'Tắt Cam'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-amber-300 text-xs font-bold transition-all shadow-xl backdrop-blur-xl flex items-center gap-1"
            title="Tùy chỉnh màu phép thuật và độ nhạy khoảng cách"
          >
            <Sliders size={15} />
            <span className="hidden md:inline">Cài Đặt</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`p-2 rounded-2xl border text-xs transition-all backdrop-blur-xl ${
              !isMuted ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-zinc-950/90 border-zinc-800 text-zinc-500'
            }`}
            title={isMuted ? 'Bật âm thanh phép thuật (Phím M)' : 'Tắt âm thanh (Phím M)'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleTakeSnapshot}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-xl shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-1.5"
            title="Chụp ảnh khoảnh khắc AR (Phím Space)"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Chụp AR</span>
          </button>

          {/* Help Modal Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all backdrop-blur-xl"
            title="Hướng dẫn tương tác & phím tắt"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ✋ DUAL HAND TRACKING RADAR & CALIBRATION BAR */}
      {/* ========================================================================= */}
      <div className="relative z-30 px-3 sm:px-4 -mt-1 sm:mt-0 flex items-center justify-between gap-2 pointer-events-auto flex-wrap sm:flex-nowrap">
        {/* Dual Hand Detection LED Radar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-1.5 backdrop-blur-xl shadow-xl">
          {/* Hand 1 Status */}
          <div className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all ${
            handTrackingStatus.hand1Found 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20 animate-pulse' 
              : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${handTrackingStatus.hand1Found ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
            <span>✋ Tay Trái: {handTrackingStatus.hand1Found ? 'Đã Khóa' : 'Đang tìm...'}</span>
          </div>

          {/* Hand 2 Status */}
          <div className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all ${
            handTrackingStatus.hand2Found 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20 animate-pulse' 
              : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${handTrackingStatus.hand2Found ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
            <span>🤚 Tay Phải: {handTrackingStatus.hand2Found ? 'Đã Khóa' : 'Đang tìm...'}</span>
          </div>
        </div>

        {/* Quick Sensitivity Mode Selector & Calibration Modal Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <div className="flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-1 backdrop-blur-xl shadow-xl">
            {(['ultra_fast', 'balanced', 'high_precision'] as HandSensitivityMode[]).map((mode) => {
              const labels = {
                ultra_fast: '⚡ Siêu Nhạy',
                balanced: '🎯 Chuẩn',
                high_precision: '🛡️ Lọc Nhiễu'
              };
              const isSel = handSensitivity === mode;
              return (
                <button
                  key={mode}
                  onClick={() => handleChangeSensitivity(mode)}
                  className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-extrabold transition-all ${
                    isSel 
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-[1.02]' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={mode === 'ultra_fast' ? 'Tối đa hóa tốc độ nhận diện tay 60FPS' : mode === 'high_precision' ? 'Độ chính xác cao, khử nhiễu' : 'Cân bằng tốc độ và độ chính xác'}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowCalibrationModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black transition-all backdrop-blur-xl flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Mở bảng chẩn đoán và hiệu chuẩn 21 khớp xương bàn tay"
          >
            <Crosshair size={13} className="text-amber-400" />
            <span className="hidden xs:inline sm:inline">Hiệu Chuẩn Tay</span>
          </button>
        </div>
      </div>

      {/* Snapshot Toast Feedback */}
      {snapshotToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-2xl border border-amber-500/50 text-amber-300 text-xs font-extrabold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 max-w-[90vw] text-center">
          <Sparkles size={15} className="text-yellow-400 shrink-0" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧭 BOTTOM FLOATING TELEMETRY & CONTROLS DOCK */}
      {/* ========================================================================= */}
      <div className="relative z-30 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        {/* Left Telemetry Widgets */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {/* FPS Counter */}
          <div className="px-3 py-1.5 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-xl flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 shadow-md shrink-0">
            <span className="text-emerald-400 font-bold">FPS:</span>
            <strong className="text-emerald-400">{uiState.fps}</strong>
          </div>

          {/* Distance Indicator */}
          <div className="px-3 py-1.5 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-xl flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 shadow-md shrink-0">
            <span className="text-amber-400 font-bold">📏 Khoảng Cách:</span>
            <strong className={uiState.distancePercent <= distanceThreshold * 100 ? 'text-amber-400' : 'text-cyan-400'}>
              {uiState.distancePercent}%
            </strong>
          </div>

          {/* Power Level Output */}
          <div className="px-3 py-1.5 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-xl flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 shadow-md shrink-0">
            <Zap size={13} className="text-yellow-400" />
            <span>Năng lượng: <strong className="text-yellow-400">{uiState.power} MW</strong></span>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Selector Carousel */}
          <div className="flex items-center gap-1 bg-zinc-950/90 p-1 rounded-2xl border border-zinc-800 backdrop-blur-xl">
            {AVAILABLE_MAGIC_THEMES.map((t) => {
              const pal = MAGIC_PALETTES[t];
              const isSel = selectedTheme === t;
              return (
                <button
                  key={t}
                  onClick={() => handleSelectTheme(t)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all ${
                    isSel 
                      ? 'scale-110 shadow-lg ring-2 ring-white/50' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: `${pal.primary}40` }}
                  title={pal.name}
                >
                  <span>{pal.icon}</span>
                </button>
              );
            })}
          </div>

          {/* Hand Skeleton Visual Toggle */}
          <button
            onClick={() => setShowSkeleton(prev => !prev)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all backdrop-blur-xl shadow-md ${
              showSkeleton ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-zinc-950/90 text-zinc-500 border-zinc-800'
            }`}
            title="Bật/Tắt hiển thị khung xương ngón tay"
          >
            <span>{showSkeleton ? '🦴 Khung Xương' : '🦴 Ẩn Khung'}</span>
          </button>

          {/* Simulation Mode Toggle */}
          <button
            onClick={() => {
              setIsSimulatingHands(prev => {
                const nextVal = !prev;
                setSnapshotToast(nextVal ? '✋ Đã BẬT Chế độ Kéo Mô Phỏng 2 Tay Cảm Ứng!' : '✋ Đã TẮT Chế độ Kéo Giả Lập');
                setTimeout(() => setSnapshotToast(null), 2500);
                return nextVal;
              });
            }}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all backdrop-blur-xl shadow-md ${
              isSimulatingHands ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-zinc-950/90 text-zinc-400 border-zinc-800'
            }`}
            title="Kéo thả 2 bàn tay trên màn hình"
          >
            <span>{isSimulatingHands ? '🎮 Mô Phỏng' : '🎮 Tắt Giả Lập'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚙️ MAGIC SETTINGS & THEME PICKER MODAL */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg border"
                  style={{
                    backgroundColor: `${currentPalette.primary}20`,
                    borderColor: `${currentPalette.primary}60`,
                    color: currentPalette.accent
                  }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Bảng Chọn Màu Sắc & Tinh Chỉnh Phép Thuật AR</h3>
                  <p className="text-[11px] text-zinc-400">8 mô hình quang phổ phép thuật Doctor Strange & tia sét 5D</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 🎨 THEME PICKER SECTION */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black text-zinc-200 tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Chọn Mô Hình Màu Sắc Hiệu Ứng (8 Themes):</span>
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">Phím tắt: T hoặc 1-8</span>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_MAGIC_THEMES.map((themeId, idx) => {
                  const pal = MAGIC_PALETTES[themeId];
                  const isSelected = selectedTheme === themeId;
                  return (
                    <button
                      key={themeId}
                      onClick={() => handleSelectTheme(themeId)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                        isSelected 
                          ? 'bg-zinc-900/90 shadow-xl ring-2' 
                          : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/70 hover:border-zinc-700'
                      }`}
                      style={{
                        borderColor: isSelected ? pal.primary : undefined,
                        boxShadow: isSelected ? `0 0 20px ${pal.glow}` : undefined,
                        outlineColor: isSelected ? pal.primary : undefined
                      }}
                    >
                      {/* Top Row: Icon, Name & Shortcut key */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{pal.icon}</span>
                          <div>
                            <div className="text-xs font-black text-white">{pal.label}</div>
                            <div className="text-[10px] font-mono font-bold" style={{ color: pal.accent }}>
                              {pal.modelTag}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-zinc-400 leading-snug mb-3">
                        {pal.description}
                      </p>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm" 
                            style={{ backgroundColor: pal.core }} 
                            title="Lõi năng lượng"
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm" 
                            style={{ backgroundColor: pal.accent }} 
                            title="Tia lửa & hào quang"
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm" 
                            style={{ backgroundColor: pal.primary }} 
                            title="Màu chính vòng phép"
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-black/40 shadow-sm" 
                            style={{ backgroundColor: pal.secondary }} 
                            title="Màu phụ tia sét"
                          />
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Đang Dùng
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            Nhấn để chọn →
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance Threshold Slider */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-200 mb-2">
                <span>Ngưỡng Kích Hoạt Tia Sét (Khoảng cách giữa 2 bàn tay):</span>
                <span className="font-mono text-sm font-black" style={{ color: currentPalette.accent }}>
                  {Math.round(distanceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.55"
                step="0.01"
                value={distanceThreshold}
                onChange={(e) => setDistanceThreshold(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Gần (15%)</span>
                <span>Chuẩn Cân Bằng (32%)</span>
                <span>Rộng (55%)</span>
              </div>
            </div>

            {/* Quick Actions / Close Button */}
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3.5 rounded-2xl text-black font-black text-sm shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${currentPalette.accent}, ${currentPalette.primary})`,
                boxShadow: `0 0 20px ${currentPalette.glow}`
              }}
            >
              <CheckCircle2 size={16} />
              <span>Áp Dụng Tùy Chỉnh & Trở Lại AR</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📖 HELP & SHORTCUTS MODAL */}
      {/* ========================================================================= */}
      {showHelpModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Nguyên Lý Phép Thuật AR 2 Bàn Tay</h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed mb-5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <strong className="text-amber-300 block mb-1 text-sm">⚡ Trạng Thái 1: Hai Bàn Tay Chụm Lại</strong>
                <p>
                  Khi đưa 2 bàn tay lại gần nhau, hệ thống tạo năng lượng phát sáng rực rỡ ở giữa gồm các đường tia sét hồ quang fractal, đan xen cùng mạng lưới nút dữ liệu lượng tử và rung phản hồi haptic.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <strong className="text-orange-300 block mb-1 text-sm">🛡️ Trạng Thái 2: Hai Bàn Tay Mở Rộng</strong>
                <p>
                  Khi mở rộng 2 bàn tay ra xa hướng về camera, trên mỗi lòng bàn tay sẽ xuất hiện vòng tròn phép thuật xoay nhiều tầng (Eldritch Magic Mandala Shields) với các tia lửa bắn tung ra ngoài viền theo phong cách phim Doctor Strange.
                </p>
              </div>

              {/* Keyboard Shortcuts List */}
              <div className="space-y-1.5 pt-2">
                <div className="text-zinc-400 font-bold mb-1">⌨️ Phím tắt nhanh:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>🎨 Đổi Theme Màu</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">T / 1-8</kbd>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>📷 Bật/Tắt Camera</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">C</kbd>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>🦴 Khung xương tay</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">H</kbd>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>🎮 Kéo 2 tay giả lập</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">S</kbd>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>🔊 Bật/Tắt Âm thanh</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">M</kbd>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                    <span>📸 Chụp ảnh AR</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">Space</kbd>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs transition-all"
            >
              Đã Hiểu & Bắt Đầu Trải Nghiệm
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 HAND TRACKING CALIBRATION & DIAGNOSTICS MODAL */}
      {/* ========================================================================= */}
      {showCalibrationModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Crosshair size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Hiệu Chuẩn & Tối Ưu Nhận Diện Bàn Tay</h3>
                  <p className="text-[11px] text-zinc-400">Tùy chỉnh thuật toán MediaPipe AI theo điều kiện camera & ánh sáng</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCalibrationModal(false)}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Live Dual-Hand Status Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 mb-4">
              <div className="text-xs font-black text-zinc-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Trạng Thái Nhận Diện Thời Gian Thực:</span>
                <span className="text-[10px] text-emerald-400 font-mono">60 FPS Hardware-Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  handTrackingStatus.hand1Found 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold">✋ Bàn Tay Trái (Hand 1)</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${handTrackingStatus.hand1Found ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
                  </div>
                  <div className="text-[11px] font-mono">
                    {handTrackingStatus.hand1Found ? '🟢 ĐÃ KHÓA 21 KHỚP (100%)' : '🟡 Đang quét lòng bàn tay...'}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  handTrackingStatus.hand2Found 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold">🤚 Bàn Tay Phải (Hand 2)</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${handTrackingStatus.hand2Found ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
                  </div>
                  <div className="text-[11px] font-mono">
                    {handTrackingStatus.hand2Found ? '🟢 ĐÃ KHÓA 21 KHỚP (100%)' : '🟡 Đang quét lòng bàn tay...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="space-y-2.5 mb-5">
              <label className="text-xs font-black text-zinc-200 uppercase tracking-wider block">
                Chọn Chế Độ Độ Nhạy Nhận Diện (Sensitivity Engine):
              </label>

              {([
                {
                  id: 'ultra_fast',
                  title: '⚡ Siêu Nhạy (Ultra-Fast 60FPS) - KHUYÊN DÙNG',
                  desc: 'Độ nhạy cực cao (0.32), bắt bàn tay tức thì ngay cả khi chuyển động nhanh, khoảng cách xa hoặc phòng thiếu sáng.',
                  badge: 'Phản Hồi Nhanh Nhất'
                },
                {
                  id: 'balanced',
                  title: '🎯 Cân Bằng Chuẩn (Balanced)',
                  desc: 'Mô hình chuẩn (0.45) tối ưu giữa tốc độ và độ ổn định hình học bàn tay.',
                  badge: 'Chuẩn Studio'
                },
                {
                  id: 'high_precision',
                  title: '🛡️ Chuẩn Xác Cao (High-Precision)',
                  desc: 'Khử nhiễu mạnh (0.65), chỉ kích hoạt khi lòng bàn tay mở hoàn toàn trước camera.',
                  badge: 'Chống Rung Lắc'
                }
              ] as const).map(item => {
                const isSelected = handSensitivity === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleChangeSensitivity(item.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all relative flex flex-col gap-1 ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50' 
                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-white">{item.title}</div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Quick Tips Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed mb-5">
              <strong className="block text-cyan-300 font-bold mb-1">💡 Mẹo định vị nhận diện tay chuẩn 100%:</strong>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300">
                <li>Đặt 2 bàn tay mở vào 2 vòng tròn Hologram ngắm màu vàng/cam trên màn hình.</li>
                <li>Giữ khoảng cách 40cm - 80cm trước camera máy tính/điện thoại.</li>
                <li>Chụm 2 tay lại gần nhau để kích hoạt Tia Sét & Lưới Số; mở rộng 2 tay để kích hoạt 2 Khiên Phép Thuật.</li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowCalibrationModal(false)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>Lưu Cấu Hình & Trở Lại Trải Nghiệm Phép Thuật</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 🎨 CANADIAN / ELDRITCH MAGIC GRAPHICS RENDERING SUBROUTINES
// =========================================================================

/**
 * 1. Draws Doctor Strange Eldritch Mandala Magic Shield
 */
function drawDoctorStrangeMagicShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  palette: MagicColorPalette
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer Glowing Corona Blur
  ctx.shadowColor = palette.primary;
  ctx.shadowBlur = 20;

  // Layer 1: Outermost Ring with Spark notches
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Outer segmented notches & magic runes
  const numNotches = 16;
  for (let i = 0; i < numNotches; i++) {
    const a = angle + (i * Math.PI * 2) / numNotches;
    const x1 = Math.cos(a) * (radius - 8);
    const y1 = Math.sin(a) * (radius - 8);
    const x2 = Math.cos(a) * (radius + 8);
    const y2 = Math.sin(a) * (radius + 8);
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Layer 2: Middle Concentric Ring
  ctx.strokeStyle = palette.secondary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Layer 3: Rotating Inscribed Concentric Octagrams / Squares (Bát giác lồng nhau)
  ctx.save();
  ctx.rotate(-angle * 1.5);
  drawInscribedSquare(ctx, radius * 0.76, palette.accent, 2);
  drawInscribedSquare(ctx, radius * 0.76, palette.accent, 2, Math.PI / 4);
  drawInscribedSquare(ctx, radius * 0.76, palette.secondary, 1.5, Math.PI / 8);
  drawInscribedSquare(ctx, radius * 0.76, palette.secondary, 1.5, (3 * Math.PI) / 8);
  ctx.restore();

  // Layer 4: Inner Star Mandala Ring
  ctx.save();
  ctx.rotate(angle * 2);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  drawInscribedSquare(ctx, radius * 0.44, palette.core, 2);
  drawInscribedSquare(ctx, radius * 0.44, palette.core, 2, Math.PI / 4);
  ctx.restore();

  // Layer 5: Blazing Core Orb
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
  grad.addColorStop(0, palette.core);
  grad.addColorStop(0.3, palette.accent);
  grad.addColorStop(0.7, palette.primary);
  grad.addColorStop(1, 'transparent');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Helper to draw inscribed rotated regular square
 */
function drawInscribedSquare(
  ctx: CanvasRenderingContext2D,
  r: number,
  color: string,
  lineWidth = 2,
  rotation = 0
) {
  ctx.save();
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  const half = r * 0.707;
  ctx.rect(-half, -half, half * 2, half * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * 2. Draws Golden Central Plasma Energy Core (Trạng thái 1: 2 tay chụm lại)
 */
function drawCentralPlasmaOrb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  palette: MagicColorPalette,
  intensity: number
) {
  ctx.save();
  const pulse = Math.sin(performance.now() * 0.015) * 8;
  const coreRadius = Math.max(35, 60 * intensity + pulse);

  ctx.shadowColor = palette.primary;
  ctx.shadowBlur = 32;

  // Radial Blazing Gradient
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2);
  grad.addColorStop(0, palette.core);
  grad.addColorStop(0.2, palette.accent);
  grad.addColorStop(0.6, palette.primary);
  grad.addColorStop(1, 'transparent');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Radiating plasma circles
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = palette.secondary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius * 1.4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * 3. Draws Fractal Branching Lightning Arcs between Hand 1 and Hand 2
 */
function drawLightningArcs(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  palette: MagicColorPalette
) {
  ctx.save();
  ctx.shadowColor = palette.primary;
  ctx.shadowBlur = 16;

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = i === 0 ? palette.core : i % 2 === 0 ? palette.accent : palette.primary;
    ctx.lineWidth = i === 0 ? 3.5 : 2;
    drawSingleLightningBranch(ctx, x1, y1, x2, y2, 28, 4);
  }

  ctx.restore();
}

function drawSingleLightningBranch(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displace: number,
  depth: number
) {
  if (depth === 0) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }

  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;

  drawSingleLightningBranch(ctx, x1, y1, midX, midY, displace / 1.7, depth - 1);
  drawSingleLightningBranch(ctx, midX, midY, x2, y2, displace / 1.7, depth - 1);

  if (depth === 3 && Math.random() > 0.45) {
    const forkX = midX + (Math.random() - 0.5) * displace * 1.5;
    const forkY = midY + (Math.random() - 0.5) * displace * 1.5;
    drawSingleLightningBranch(ctx, midX, midY, forkX, forkY, displace / 2, depth - 2);
  }
}

/**
 * 4. Draws Cybernetic Digital Data Grid Nodes
 */
function drawCyberDataGrid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  nodes: DataNode[],
  palette: MagicColorPalette
) {
  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    n.x += n.vx;
    n.y += n.vy;

    if (Math.abs(n.x) > 130) n.vx *= -1;
    if (Math.abs(n.y) > 130) n.vy *= -1;

    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < nodes.length; j++) {
      const n2 = nodes[j];
      const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
      if (dist < 65) {
        ctx.strokeStyle = palette.secondary;
        ctx.lineWidth = (1 - dist / 65) * 1.4;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * 5. Hand Skeleton Overlay
 */
const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17]
];

function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: HandPoint2D[],
  w: number,
  h: number,
  boneColor: string
) {
  ctx.save();
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = boneColor;
  ctx.shadowBlur = 8;

  HAND_BONES.forEach(([i, j]) => {
    if (!landmarks[i] || !landmarks[j]) return;
    const x1 = (1 - landmarks[i].x) * w;
    const y1 = landmarks[i].y * h;
    const x2 = (1 - landmarks[j].x) * w;
    const y2 = landmarks[j].y * h;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  landmarks.forEach((p, idx) => {
    const px = (1 - p.x) * w;
    const py = p.y * h;
    ctx.fillStyle = idx === 0 || idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? '#ffffff' : boneColor;
    ctx.beginPath();
    ctx.arc(px, py, idx === 0 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * 6. Simulation Mode Hand Draggable Handle
 */
function drawSimulatedHandHandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 42);
  ctx.restore();
}

/**
 * 7. Particle System: Local Bounded Sparks
 */
function emitSparksLocal(
  sparks: SparkParticle[],
  x: number,
  y: number,
  count: number,
  palette: MagicColorPalette
) {
  if (sparks.length > 180) return; // Hard cap to prevent memory leak
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2.8 + 1.5,
      alpha: 1,
      color: Math.random() > 0.4 ? palette.accent : palette.primary,
      life: 0,
      maxLife: Math.random() * 22 + 12
    });
  }
}

function emitShieldCentrifugalSparksLocal(
  sparks: SparkParticle[],
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  palette: MagicColorPalette
) {
  if (sparks.length > 180) return;
  for (let i = 0; i < 2; i++) {
    const a = angle + Math.random() * Math.PI * 2;
    const sx = cx + Math.cos(a) * radius;
    const sy = cy + Math.sin(a) * radius;
    const tangentAngle = a + Math.PI / 2;
    const speed = Math.random() * 4.5 + 2.5;

    sparks.push({
      x: sx,
      y: sy,
      vx: Math.cos(tangentAngle) * speed + (Math.random() - 0.5) * 1.5,
      vy: Math.sin(tangentAngle) * speed + (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.5 + 1,
      alpha: 1,
      color: Math.random() > 0.5 ? palette.secondary : palette.accent,
      life: 0,
      maxLife: Math.random() * 18 + 10
    });
  }
}

function updateAndDrawSparksLocal(
  ctx: CanvasRenderingContext2D,
  sparks: SparkParticle[]
) {
  if (sparks.length === 0) return;

  ctx.save();
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life++;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);

    if (p.life >= p.maxLife || p.alpha <= 0) {
      sparks.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 8. Smart Pre-Detection Hand Locator Target Reticle
 * Guides user to position their hands for optimal tracking
 */
function drawSmartHandTargetReticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string,
  isSecondary: boolean,
  timestamp: number
) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(timestamp * 0.005) * 6;
  const baseRadius = (isSecondary ? 70 : 80) + pulse;
  const rot = (timestamp * 0.0015) % (Math.PI * 2);

  // Outer Dashed Targeting Ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.65;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, baseRadius, rot, rot + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner HUD Brackets
  const bracketSize = 24;
  const offset = baseRadius - 10;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.85;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(-offset, -offset + bracketSize);
  ctx.lineTo(-offset, -offset);
  ctx.lineTo(-offset + bracketSize, -offset);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(offset - bracketSize, -offset);
  ctx.lineTo(offset, -offset);
  ctx.lineTo(offset, -offset + bracketSize);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(-offset, offset - bracketSize);
  ctx.lineTo(-offset, offset);
  ctx.lineTo(-offset + bracketSize, offset);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(offset - bracketSize, offset);
  ctx.lineTo(offset, offset);
  ctx.lineTo(offset, offset - bracketSize);
  ctx.stroke();

  // Center Crosshair
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // Guidance Hand Icon & Text Badge
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  const textWidth = ctx.measureText ? 190 : 180;
  const badgeY = baseRadius + 18;

  // Badge background pill
  ctx.beginPath();
  ctx.roundRect(-textWidth / 2, badgeY - 14, textWidth, 28, 14);
  ctx.fill();
  ctx.stroke();

  // Badge Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, badgeY);

  ctx.restore();
}
