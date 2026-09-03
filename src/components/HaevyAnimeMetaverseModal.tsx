import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  X, 
  Sun, 
  Moon, 
  Camera, 
  Share2, 
  Download, 
  RotateCw, 
  Zap, 
  Eye, 
  Heart, 
  Palette, 
  Flame, 
  Maximize2,
  Minimize2,
  Crown,
  Hand,
  CheckCircle2,
  Layers,
  Play,
  RotateCcw,
  PenTool,
  Grid,
  Lightbulb,
  ZoomIn,
  ZoomOut,
  Focus,
  Box,
  Undo2,
  Trash2,
  Smile,
  MousePointer,
  Send,
  Loader2,
  Check,
  ExternalLink,
  Sliders,
  Compass,
  Move,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Wand2,
  Atom
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { morningAudio } from '../services/morningAudioService';
import { HaevySonMascotDrawer } from './HaevySonMascotDrawer';
import {
  generate3DHeartPreset,
  generate3DStarPreset,
  generate3DZenEnsoPreset,
  generate3DHaevyLogoPreset,
  generate3DTamAnPreset,
  generate3DHelixPreset,
  generate3DCyberCubePreset,
  generate3DInfinityPreset,
  PresetStroke
} from '../utils/spatialDrawingPresets';
import {
  reconstructStrokeWithPhysics,
  reconstructAllStrokesWithPhysics,
  PhysicsReconstructConfig,
  DEFAULT_PHYSICS_CONFIG
} from '../utils/strokePhysicsEngine';

export interface StrokePoint3D {
  x: number;
  y: number;
  z?: number;
  color?: string;
  time?: number;
}

export interface Stroke3D {
  id?: string;
  points: StrokePoint3D[];
  color: string;
  brushType?: string;
  zLayer?: number;
}

interface HaevyAnimeMetaverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  strokes: Stroke3D[];
  snapshotBase64?: string | null;
  detectedShapes?: string[];
  pinnedHolograms?: Array<{ title: string; type: string; color: string }>;
  onSaveSnapshot?: (dataUrl: string) => void;
  onShareToCommunity?: (imageUrl: string, suggestedContent?: string, tag?: string) => void;
  initialTab?: 'spatial_drawing' | 'mascot_play' | 'home_hub';
}

export type AnimeThemeId = 'cosmic_gallery' | 'zen_studio' | 'obsidian_dark' | 'cyberpunk' | 'astral';

export const ANIME_THEMES: Array<{
  id: AnimeThemeId;
  name: string;
  sub: string;
  icon: string;
  bgGrad: string;
  primaryAura: string;
  badge: string;
}> = [
  {
    id: 'cosmic_gallery',
    name: 'Triển Lãm Tinh Không',
    sub: 'Phòng tranh vũ trụ pha lê & sao băng',
    icon: '🏛️',
    bgGrad: 'linear-gradient(135deg, #090d16 0%, #030712 50%, #0f172a 100%)',
    primaryAura: '#38bdf8',
    badge: 'Trưng Bày Không Gian'
  },
  {
    id: 'zen_studio',
    name: 'Thiền Thư Phòng 3D',
    sub: 'Không gian tĩnh lặng ngắm nét thư pháp',
    icon: '🍃',
    bgGrad: 'linear-gradient(135deg, #051b14 0%, #020f0b 50%, #064e3b 100%)',
    primaryAura: '#34d399',
    badge: 'Nghệ Thuật Thiền Tịnh'
  },
  {
    id: 'obsidian_dark',
    name: 'Hắc Thạch Vô Cực',
    sub: 'Nền đen tương phản 4K tôn vinh nét phát sáng',
    icon: '🔮',
    bgGrad: 'linear-gradient(135deg, #000000 0%, #050505 50%, #0a0a0a 100%)',
    primaryAura: '#fbbf24',
    badge: 'Độ Tương Phản 4K'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neo-Tokyo',
    sub: 'Thành phố tương lai & ánh đèn neon rực rỡ',
    icon: '🌆',
    bgGrad: 'linear-gradient(135deg, #450a0a 0%, #1f2937 50%, #581c87 100%)',
    primaryAura: '#f43f5e',
    badge: 'Cyberpunk 2077'
  },
  {
    id: 'astral',
    name: 'Thiên Hà Thần Thoại',
    sub: 'Cổng không gian & các vì sao tinh vân huyền bí',
    icon: '🌌',
    bgGrad: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #030712 100%)',
    primaryAura: '#c084fc',
    badge: 'Vũ Trụ Vô Tận'
  }
];

// 🌟 HAEVY SON MASCOT CONSTANTS & TYPES
export type HaevySonVariant = 'divine_dragon' | 'spirit_fox' | 'cyber_bot' | 'lucky_cat' | 'blossom_fairy' | 'cosmic_king';
export type HaevySonHandMode = 'palm_perch' | 'orbit_guardian' | 'finger_wand' | 'free_roam';
export type HaevySonAccessory = 'none' | 'crown' | 'ar_visor' | 'angel_wings' | 'magic_wand' | 'bell_collar';
export type HaevySonMood = 'happy' | 'excited' | 'sleepy' | 'curious' | 'loving';

export const HAEVY_SON_VARIANTS: Array<{
  id: HaevySonVariant;
  name: string;
  title: string;
  icon: string;
  color: string;
  glow: string;
  lore: string;
}> = [
  {
    id: 'divine_dragon',
    name: 'Long Nhi Thần Long 🐲',
    title: 'Hộ Vệ Thần Thú Cổ Đại',
    icon: '🐲',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.6)',
    lore: 'Rồng thần hộ mệnh sinh ra từ tinh tú, biết nhào lộn và phun bụi sao may mắn theo bàn tay.'
  },
  {
    id: 'spirit_fox',
    name: 'Hồ Ly Ánh Sáng 🦊',
    title: 'Linh Thú Chín Đuôi',
    icon: '🦊',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.6)',
    lore: 'Linh hồ tinh nghịch với đôi tai phát sáng, luôn ngoan ngoãn sà vào lòng bàn tay để được cưng nựng.'
  },
  {
    id: 'cyber_bot',
    name: 'Chibi Mecha Bot 🤖',
    title: 'Trợ Lý Tương Lai AI',
    icon: '🤖',
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.6)',
    lore: 'Robot thám hiểm vũ trụ với màn hình biểu cảm chibi, có thể tạo khiên năng lượng bảo vệ bạn.'
  },
  {
    id: 'lucky_cat',
    name: 'Mèo Chiêu Tài 🐱',
    title: 'Thần Tài May Mắn',
    icon: '🐱',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.6)',
    lore: 'Chú mèo vẫy tay mang lại phúc lộc và bình an, rất thích được thưởng kẹo ngôi sao.'
  },
  {
    id: 'blossom_fairy',
    name: 'Tiên Hoa Anh Đào 🌸',
    title: 'Tinh Linh Rừng Hoa',
    icon: '🌸',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.6)',
    lore: 'Tiên nữ nhỏ với đôi cánh trong suốt, bay lượn nhẹ nhàng và rải hoa thơm quanh ngón tay bạn.'
  },
  {
    id: 'cosmic_king',
    name: 'Tiểu Vương Tinh Vân 👑',
    title: 'Chúa Tể Không Gian Nhí',
    icon: '👑',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.6)',
    lore: 'Đội vương miện hoàng gia ngọc bích, sở hữu quyền năng dẫn lối năng lượng sáng tạo trong không gian 3D.'
  }
];

export const HAEVY_SON_HAND_MODES: Array<{
  id: HaevySonHandMode;
  name: string;
  desc: string;
  icon: string;
}> = [
  {
    id: 'palm_perch',
    name: 'Đậu Lòng Bàn Tay',
    desc: 'Linh vật đáp nhẹ nhàng xuống lòng bàn tay bạn và nhún nhảy làm duyên khi bạn đưa tay lên.',
    icon: '🤲'
  },
  {
    id: 'orbit_guardian',
    name: 'Vệ Sĩ Quanh Tay',
    desc: 'Bay lượn vòng cung bảo vệ quanh vị trí bàn tay với vệt sao lấp lánh.',
    icon: '🧚'
  },
  {
    id: 'finger_wand',
    name: 'Bám Ngón Tay',
    desc: 'Bám nhẹ nhàng theo đầu ngón tay như một chiếc đũa thần kỳ phát quang.',
    icon: '🎯'
  },
  {
    id: 'free_roam',
    name: 'Bay Tự Do',
    desc: 'Linh vật tự do thám hiểm khắp không gian 3D và thỉnh thoảng sà xuống chào bạn.',
    icon: '🕊️'
  }
];

export function HaevyAnimeMetaverseModal({
  isOpen,
  onClose,
  strokes = [],
  snapshotBase64,
  detectedShapes = [],
  pinnedHolograms = [],
  onSaveSnapshot,
  onShareToCommunity,
  initialTab = 'spatial_drawing'
}: HaevyAnimeMetaverseModalProps) {
  const { user, isVip, isAdmin, addAudioPoints } = useAuth();

  // 🌟 Main Functional Tabs: Spatial 3D Drawing vs Mascot Interactive Play
  const [haevySpaceTab, setHaevySpaceTab] = useState<'spatial_drawing' | 'mascot_play'>(
    initialTab === 'mascot_play' ? 'mascot_play' : 'spatial_drawing'
  );

  useEffect(() => {
    if (isOpen) {
      setHaevySpaceTab(initialTab === 'mascot_play' ? 'mascot_play' : 'spatial_drawing');
    }
  }, [isOpen, initialTab]);

  // Mode Selection for Background: 'ar_mirror' vs 'metaverse_3d'
  const [activeMode, setActiveMode] = useState<'ar_mirror' | 'metaverse_3d'>('metaverse_3d');

  // Active isolated 3D strokes state (strictly non-sticking, segmented)
  const [liveStrokes, setLiveStrokes] = useState<Stroke3D[]>([]);

  // 🌟 Community Sharing & Snapshot State
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareImageSnapshot, setShareImageSnapshot] = useState<string | null>(null);
  const [shareCaption, setShareCaption] = useState<string>('');
  const [shareTag, setShareTag] = useState<string>('#HaevySpace');
  const [isSharingToFeed, setIsSharingToFeed] = useState<boolean>(false);
  const [shareFeedSuccess, setShareFeedSuccess] = useState<boolean>(false);

  // Themes & Environment
  const [selectedTheme, setSelectedTheme] = useState<AnimeThemeId>('cosmic_gallery');
  const [activeCameraView, setActiveCameraView] = useState<'front_view' | 'angle_45' | 'macro_zoom' | 'top_down' | 'orbit_free'>('front_view');
  const [postcardToast, setPostcardToast] = useState<string | null>(null);

  // Exhibition & 3D Lighting Controls
  const [showExhibitionPedestal, setShowExhibitionPedestal] = useState<boolean>(true);
  const [showSpatialGrid, setShowSpatialGrid] = useState<boolean>(false);
  const [showSpotlight, setShowSpotlight] = useState<boolean>(true);
  const [spotlightIntensity, setSpotlightIntensity] = useState<number>(2.0);
  const [cameraDistanceZoom, setCameraDistanceZoom] = useState<number>(3.6);

  // 🌟 3D SPATIAL BRUSH & DEPTH STATE
  const [drawingInputMode, setDrawingInputMode] = useState<'draw' | 'orbit'>('orbit');
  const [brushColor, setBrushColor] = useState<string>('#38bdf8');
  const [strokeMaterialStyle, setStrokeMaterialStyle] = useState<'neon_laser' | 'anime_ribbon' | 'stardust_comet' | 'quantum_crystal' | 'gold_sacred' | 'plasma_fire'>('neon_laser');
  const [strokeThickness, setStrokeThickness] = useState<number>(0.045); // 0.015 to 0.12
  const [strokeDepthScale, setStrokeDepthScale] = useState<number>(1.0); // 0.2 to 2.5
  const [currentZDepth, setCurrentZDepth] = useState<number>(0.5); // 0.0 to 1.0
  const [isAutoZStep, setIsAutoZStep] = useState<boolean>(true); // Auto steps Z slightly per character so letters never stick or collide

  // ⚛️ AI & PHYSICAL KINEMATICS ENGINE STATE
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsReconstructConfig>(DEFAULT_PHYSICS_CONFIG);
  const [isPhysicsReconstructing, setIsPhysicsReconstructing] = useState<boolean>(false);
  const [showPhysicsSettingsModal, setShowPhysicsSettingsModal] = useState<boolean>(false);

  // 🎛️ COLLAPSIBLE & COMPACT TOOLBARS STATE (Thu nhỏ các bảng điều chỉnh)
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState<boolean>(false);
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState<boolean>(false);
  
  // 360-Degree Spatial Orbiting & Rotation
  const [isAutoRotateStrokes, setIsAutoRotateStrokes] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.4);
  const [drawProgress, setDrawProgress] = useState<number>(1.0);
  const [isReplayingDraw, setIsReplayingDraw] = useState<boolean>(false);
  const [isAirDrawing, setIsAirDrawing] = useState<boolean>(false);

  // 🌟 HAEVY SON MASCOT STATE
  const [showHaevySon, setShowHaevySon] = useState<boolean>(false);
  const [haevySonVariant, setHaevySonVariant] = useState<HaevySonVariant>('divine_dragon');
  const [haevySonHandMode, setHaevySonHandMode] = useState<HaevySonHandMode>('palm_perch');
  const [haevySonAccessory, setHaevySonAccessory] = useState<HaevySonAccessory>('crown');
  const [haevySonScale, setHaevySonScale] = useState<number>(1.0);
  const [haevySonMood, setHaevySonMood] = useState<HaevySonMood>('happy');
  const [showHaevySonPanel, setShowHaevySonPanel] = useState<boolean>(false);
  const [haevySonAffection, setHaevySonAffection] = useState<number>(100);
  const [haevySonActionEffect, setHaevySonActionEffect] = useState<string | null>(null);

  // Hand Gestures & Tracking
  const [detectedGesture, setDetectedGesture] = useState<'wave' | 'open_palm' | 'point' | 'peace' | 'heart' | 'fist' | 'pinch' | null>(null);
  const [mascotSpeech, setMascotSpeech] = useState<string | null>('Chào bạn nhé! Đưa tay trước camera để chơi cùng mình nào~ 🐲👋');
  const [mascotScreenPos, setMascotScreenPos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isHandDetected, setIsHandDetected] = useState(false);

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Live Drawing Tracking Refs (Stroke segmentation logic)
  const isPointerDownRef = useRef<boolean>(false);
  const currentActiveStrokeIdRef = useRef<string | null>(null);
  const currentLiveStrokePointsRef = useRef<StrokePoint3D[]>([]);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const strokeManualRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoZCounterRef = useRef<number>(0);

  // Mascot Mesh Refs
  const wingLMeshRef = useRef<THREE.Mesh | null>(null);
  const wingRMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeLMeshRef = useRef<THREE.Mesh | null>(null);
  const eyeRMeshRef = useRef<THREE.Mesh | null>(null);
  const haloMeshRef = useRef<THREE.Mesh | null>(null);
  const mascotSpeechTimeoutRef = useRef<any>(null);

  // 3D Three.js Object Groups
  const spatialStrokesRootGroupRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const spatialGridRef = useRef<THREE.GridHelper | null>(null);
  const spotlightRef = useRef<THREE.SpotLight | null>(null);
  const weatherParticlesRef = useRef<THREE.Points | null>(null);
  const haevySonGroupRef = useRef<THREE.Group | null>(null);
  const haevySonFlipProgressRef = useRef<number>(0);
  const haevySonTargetCoordRef = useRef<{ x: number; y: number; z: number }>({ x: 0.65, y: 0.8, z: 0.4 });
  const userHandPosRef = useRef<{ x: number; y: number; z: number; isPresent: boolean }>({ x: 0, y: 0, z: 0, isPresent: false });
  const lastGestureActionTimeRef = useRef<{ [key: string]: number }>({});

  // Sync state refs for rendering loop
  const haevySpaceTabRef = useRef(haevySpaceTab);
  haevySpaceTabRef.current = haevySpaceTab;

  const showHaevySonRef = useRef(showHaevySon);
  showHaevySonRef.current = showHaevySon;

  const haevySonHandModeRef = useRef(haevySonHandMode);
  haevySonHandModeRef.current = haevySonHandMode;

  const isAutoRotateStrokesRef = useRef(isAutoRotateStrokes);
  isAutoRotateStrokesRef.current = isAutoRotateStrokes;

  const rotationSpeedRef = useRef(rotationSpeed);
  rotationSpeedRef.current = rotationSpeed;

  const activeCameraViewRef = useRef(activeCameraView);
  activeCameraViewRef.current = activeCameraView;

  const showExhibitionPedestalRef = useRef(showExhibitionPedestal);
  showExhibitionPedestalRef.current = showExhibitionPedestal;

  const showSpatialGridRef = useRef(showSpatialGrid);
  showSpatialGridRef.current = showSpatialGrid;

  const showSpotlightRef = useRef(showSpotlight);
  showSpotlightRef.current = showSpotlight;

  const cameraDistanceZoomRef = useRef(cameraDistanceZoom);
  cameraDistanceZoomRef.current = cameraDistanceZoom;

  // Initialize live strokes on mount or when props change
  useEffect(() => {
    if (strokes && strokes.length > 0) {
      setLiveStrokes(strokes);
    } else {
      // Default initial preset: "HAEVY SPACE" with clean separated characters
      setLiveStrokes(generate3DHaevyLogoPreset('#38bdf8'));
    }
  }, [strokes]);

  // Load preset helper
  const handleLoadPreset = (presetName: string) => {
    let newStrokes: PresetStroke[] = [];
    if (presetName === 'haevy_logo') {
      newStrokes = generate3DHaevyLogoPreset(brushColor);
      setPostcardToast('✨ Đã tải chữ 3D "HAEVY" & "SPACE" từng ký tự độc lập!');
    } else if (presetName === 'tam_an') {
      newStrokes = generate3DTamAnPreset(brushColor);
      setPostcardToast('🍃 Đã tải Thư Pháp 3D "Tâm An" 3 nét bay bổng!');
    } else if (presetName === 'heart') {
      newStrokes = generate3DHeartPreset(brushColor);
      setPostcardToast('💖 Đã tải Trái Tim 3D Parametric Heart!');
    } else if (presetName === 'star') {
      newStrokes = generate3DStarPreset(brushColor);
      setPostcardToast('⭐ Đã tải Ngôi Sao Tinh Tú 3D Constellation!');
    } else if (presetName === 'helix') {
      newStrokes = generate3DHelixPreset(brushColor);
      setPostcardToast('🧬 Đã tải Chuỗi Xoắn DNA 3D Helix!');
    } else if (presetName === 'cube') {
      newStrokes = generate3DCyberCubePreset(brushColor);
      setPostcardToast('🧊 Đã tải Khối Lập Phương 3D Cyber Wireframe!');
    } else if (presetName === 'infinity') {
      newStrokes = generate3DInfinityPreset(brushColor);
      setPostcardToast('♾️ Đã tải Vòng Xoắn Vô Cực 3D Möbius!');
    } else if (presetName === 'enso') {
      newStrokes = generate3DZenEnsoPreset(brushColor);
      setPostcardToast('⭕ Đã tải Vòng Tròn Zen Enso Thư Pháp!');
    }

    setLiveStrokes(newStrokes);
    morningAudio.triggerStarPop();
    setTimeout(() => setPostcardToast(null), 3000);
  };

  // ⚛️ AI & Physical Kinematics Reconstruction Handler
  const handleReconstructWithPhysics = (customConfig?: Partial<PhysicsReconstructConfig>) => {
    if (!liveStrokes || liveStrokes.length === 0) {
      setPostcardToast('✍️ Hãy vẽ nét hoặc chọn một mẫu 3D trước!');
      setTimeout(() => setPostcardToast(null), 2000);
      return;
    }

    setIsPhysicsReconstructing(true);
    morningAudio.triggerStarPop();

    const cfg = { ...physicsConfig, ...(customConfig || {}) };
    const physicallyEnhanced = reconstructAllStrokesWithPhysics(liveStrokes, cfg);

    setLiveStrokes(physicallyEnhanced);
    morningAudio.triggerPeaceRainbowChime();
    setPostcardToast('⚛️ Đã tái tạo nét bằng AI & Phương Trình Vật Lý (Quán Tính, Độ Cong & Khởi-Thu Bút)!');

    setTimeout(() => {
      setIsPhysicsReconstructing(false);
      setTimeout(() => setPostcardToast(null), 3200);
    }, 450);
  };

  // Undo last stroke
  const handleUndoStroke = () => {
    if (liveStrokes.length === 0) return;
    setLiveStrokes(prev => prev.slice(0, -1));
    morningAudio.triggerUndoSound();
    setPostcardToast('↩️ Đã hoàn tác nét vẽ cuối');
    setTimeout(() => setPostcardToast(null), 1500);
  };

  // Clear all strokes
  const handleClearStrokes = () => {
    setLiveStrokes([]);
    morningAudio.triggerClearBoardSweep();
    setPostcardToast('🧹 Đã xóa sạch toàn bộ nét vẽ');
    setTimeout(() => setPostcardToast(null), 1500);
  };

  // -------------------------------------------------------------
  // THREE.JS SCENE INITIALIZATION & RENDER LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Theme Background Color
    const themeObj = ANIME_THEMES.find(t => t.id === selectedTheme) || ANIME_THEMES[0];
    if (selectedTheme === 'obsidian_dark') {
      scene.background = new THREE.Color(0x020204);
      scene.fog = new THREE.FogExp2(0x020204, 0.08);
    } else if (selectedTheme === 'zen_studio') {
      scene.background = new THREE.Color(0x03120d);
      scene.fog = new THREE.FogExp2(0x03120d, 0.06);
    } else if (selectedTheme === 'cyberpunk') {
      scene.background = new THREE.Color(0x0c0614);
      scene.fog = new THREE.FogExp2(0x0c0614, 0.07);
    } else {
      scene.background = new THREE.Color(0x060911);
      scene.fog = new THREE.FogExp2(0x060911, 0.05);
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.35, cameraDistanceZoom);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // 3. Renderer with high color fidelity
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Spotlight pointing at artwork
    const spotlight = new THREE.SpotLight(0x38bdf8, spotlightIntensity, 15, Math.PI / 4, 0.35, 1);
    spotlight.position.set(0, 4.5, 3.5);
    spotlight.target.position.set(0, 0.2, 0);
    scene.add(spotlight);
    scene.add(spotlight.target);
    spotlightRef.current = spotlight;

    // Rim lighting
    const rimLight = new THREE.PointLight(new THREE.Color(themeObj.primaryAura), 1.5, 8);
    rimLight.position.set(-2.5, 2.0, -2.0);
    scene.add(rimLight);

    // 5. Exhibition Pedestal (Bục Pha Lê 3D)
    const pedestalGroup = new THREE.Group();
    const diskGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.12, 48);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15
    });
    const pedestalDisk = new THREE.Mesh(diskGeo, diskMat);
    pedestalDisk.position.y = -0.65;
    pedestalDisk.receiveShadow = true;
    pedestalGroup.add(pedestalDisk);

    // Inner glowing ring
    const ringGeo = new THREE.RingGeometry(1.35, 1.45, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(themeObj.primaryAura),
      side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = -0.58;
    pedestalGroup.add(glowRing);

    scene.add(pedestalGroup);
    pedestalRef.current = pedestalGroup;

    // 6. Spatial Grid Helper
    const grid = new THREE.GridHelper(5, 16, new THREE.Color(themeObj.primaryAura), 0x1e293b);
    grid.position.y = -0.64;
    scene.add(grid);
    spatialGridRef.current = grid;

    // 7. Hand Drawn Spatial Strokes Root Group (Independent 360° rotation)
    const spatialStrokesRoot = new THREE.Group();
    spatialStrokesRoot.position.set(0, 0, 0);
    scene.add(spatialStrokesRoot);
    spatialStrokesRootGroupRef.current = spatialStrokesRoot;

    // 8. Mascot Group
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0.65, 0.8, 0.4);
    scene.add(mascotGroup);
    haevySonGroupRef.current = mascotGroup;

    // 9. Floating Ambient Stardust Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArr[i] = (Math.random() - 0.5) * 6;
      posArr[i + 1] = (Math.random() - 0.5) * 4 + 0.5;
      posArr[i + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(themeObj.primaryAura),
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    weatherParticlesRef.current = particles;

    // 10. High-Performance Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Pedestal visibility & slow spin
      if (pedestalRef.current) {
        pedestalRef.current.visible = showExhibitionPedestalRef.current;
        pedestalRef.current.rotation.y += 0.15 * delta;
      }

      // Grid visibility
      if (spatialGridRef.current) {
        spatialGridRef.current.visible = showSpatialGridRef.current;
      }

      // Spotlight visibility & color sync
      if (spotlightRef.current) {
        spotlightRef.current.visible = showSpotlightRef.current;
      }

      // 360-Degree Rotation of Spatial Strokes Root Group
      if (spatialStrokesRootGroupRef.current) {
        if (isAutoRotateStrokesRef.current) {
          spatialStrokesRootGroupRef.current.rotation.y += rotationSpeedRef.current * delta;
        } else {
          // Manual Orbit (Yaw and Pitch)
          spatialStrokesRootGroupRef.current.rotation.y = strokeManualRotRef.current.y;
          spatialStrokesRootGroupRef.current.rotation.x = strokeManualRotRef.current.x;
        }
      }

      // Mascot Physics & Motion Loop
      if (haevySonGroupRef.current) {
        haevySonGroupRef.current.visible = showHaevySonRef.current;

        if (showHaevySonRef.current) {
          const handMode = haevySonHandModeRef.current;
          const isHand = userHandPosRef.current.isPresent;
          const handX = userHandPosRef.current.x;
          const handY = userHandPosRef.current.y;

          let targetX = haevySonTargetCoordRef.current.x;
          let targetY = haevySonTargetCoordRef.current.y;
          let targetZ = haevySonTargetCoordRef.current.z;
          let lerpSpeed = 5.5;

          if (isHand) {
            if (handMode === 'palm_perch') {
              targetX = handX;
              targetY = handY + 0.22;
              targetZ = 0.5;
              lerpSpeed = 8.0;
            } else if (handMode === 'orbit_guardian') {
              const angle = elapsedTime * 2.4;
              targetX = handX + Math.cos(angle) * 0.55;
              targetY = handY + Math.sin(angle) * 0.35 + 0.2;
              targetZ = 0.5 + Math.sin(angle * 1.5) * 0.3;
              lerpSpeed = 6.0;
            } else if (handMode === 'finger_wand') {
              targetX = handX + 0.1;
              targetY = handY + 0.15;
              targetZ = 0.55;
              lerpSpeed = 9.5;
            } else {
              targetX = Math.sin(elapsedTime * 0.8) * 1.6;
              targetY = 0.6 + Math.cos(elapsedTime * 1.2) * 0.6;
              targetZ = Math.cos(elapsedTime * 0.6) * 0.8;
              lerpSpeed = 3.5;
            }
          } else {
            targetX = Math.sin(elapsedTime * 0.9) * 0.85;
            targetY = 0.65 + Math.sin(elapsedTime * 2.0) * 0.12;
            targetZ = 0.35 + Math.cos(elapsedTime * 0.7) * 0.35;
            lerpSpeed = 3.0;
          }

          const posFactor = 1 - Math.exp(-lerpSpeed * delta);
          haevySonGroupRef.current.position.x += (targetX - haevySonGroupRef.current.position.x) * posFactor;
          haevySonGroupRef.current.position.y += (targetY - haevySonGroupRef.current.position.y) * posFactor;
          haevySonGroupRef.current.position.z += (targetZ - haevySonGroupRef.current.position.z) * posFactor;

          if (haevySonFlipProgressRef.current > 0) {
            haevySonFlipProgressRef.current = Math.max(0, haevySonFlipProgressRef.current - delta * 2.8);
            haevySonGroupRef.current.rotation.x = (1.0 - haevySonFlipProgressRef.current) * Math.PI * 2;
            haevySonGroupRef.current.rotation.y = elapsedTime * 4.0;
          } else {
            haevySonGroupRef.current.rotation.x = Math.sin(elapsedTime * 2.5) * 0.08;
            haevySonGroupRef.current.rotation.y = Math.sin(elapsedTime * 1.4) * 0.25;
            haevySonGroupRef.current.rotation.z = Math.sin(elapsedTime * 2.0) * 0.06;
          }

          if (wingLMeshRef.current && wingRMeshRef.current) {
            const flapSpeed = 10.0;
            const flapAngle = Math.sin(elapsedTime * flapSpeed) * 0.45;
            wingLMeshRef.current.rotation.y = 0.4 + flapAngle;
            wingRMeshRef.current.rotation.y = -0.4 - flapAngle;
          }

          if (eyeLMeshRef.current && eyeRMeshRef.current) {
            const blinkCycle = elapsedTime % 3.5;
            const isBlinking = blinkCycle < 0.12;
            const eyeScaleY = isBlinking ? 0.1 : 1.0;
            eyeLMeshRef.current.scale.set(1.0, eyeScaleY, 1.0);
            eyeRMeshRef.current.scale.set(1.0, eyeScaleY, 1.0);
          }

          if (haloMeshRef.current) {
            haloMeshRef.current.rotation.z += 1.2 * delta;
          }

          // Project Mascot Screen Position for Speech Bubble
          if (cameraRef.current && container) {
            const worldPos = new THREE.Vector3();
            haevySonGroupRef.current.getWorldPosition(worldPos);
            worldPos.y += 0.38 * haevySonScale;
            worldPos.project(cameraRef.current);
            const sx = (worldPos.x * 0.5 + 0.5) * container.clientWidth;
            const sy = (-(worldPos.y * 0.5) + 0.5) * container.clientHeight;
            setMascotScreenPos({ x: sx, y: sy, visible: true });
          }
        }
      }

      // Camera Perspective Lerp
      if (cameraRef.current) {
        const view = activeCameraViewRef.current;
        const zoom = cameraDistanceZoomRef.current;
        let targetCamPos = new THREE.Vector3(0, 0.35, zoom);

        if (view === 'angle_45') {
          targetCamPos = new THREE.Vector3(zoom * 0.72, zoom * 0.55, zoom * 0.72);
        } else if (view === 'macro_zoom') {
          targetCamPos = new THREE.Vector3(0, 0.25, Math.max(1.1, zoom * 0.45));
        } else if (view === 'top_down') {
          targetCamPos = new THREE.Vector3(0, zoom * 1.15, 0.01);
        } else if (view === 'orbit_free') {
          targetCamPos = new THREE.Vector3(
            Math.sin(elapsedTime * 0.35) * zoom,
            0.45 + Math.sin(elapsedTime * 0.2) * 0.3,
            Math.cos(elapsedTime * 0.35) * zoom
          );
        }

        cameraRef.current.position.lerp(targetCamPos, 1 - Math.exp(-6 * delta));
        cameraRef.current.lookAt(0, 0.2, 0);
      }

      // Particles Drift
      if (weatherParticlesRef.current) {
        const pGeo = weatherParticlesRef.current.geometry;
        const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] -= 0.008;
          if (arr[i * 3 + 1] < -2.0) {
            arr[i * 3 + 1] = 4.0;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isOpen, selectedTheme]);

  // -------------------------------------------------------------
  // RENDER SEPARATE 3D STROKES (NON-STICKING PIPELINE)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current || !spatialStrokesRootGroupRef.current) return;

    const rootGroup = spatialStrokesRootGroupRef.current;

    // Clean old stroke meshes and geometries
    while (rootGroup.children.length > 0) {
      const child = rootGroup.children[0] as THREE.Mesh;
      rootGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    if (!liveStrokes || liveStrokes.length === 0) return;

    const strokeCountToRender = Math.max(1, Math.floor(liveStrokes.length * drawProgress));
    const strokesSubset = liveStrokes.slice(0, strokeCountToRender);

    strokesSubset.forEach((stroke, strokeIdx) => {
      if (!stroke.points || stroke.points.length < 2) return;

      // Calculate smooth 3D points with genuine depth
      const strokeZOffset = stroke.zLayer !== undefined 
        ? stroke.zLayer 
        : (isAutoZStep ? (strokeIdx % 10) * 0.04 - 0.2 : 0);

      const curvePoints: THREE.Vector3[] = stroke.points.map((pt, ptIdx) => {
        const x3d = (pt.x - 0.5) * 3.4;
        const y3d = (0.5 - pt.y) * 2.4 + 0.35;
        const rawZ = pt.z !== undefined ? pt.z : 0.5;
        const z3d = (rawZ - 0.5) * 1.8 * strokeDepthScale + strokeZOffset;
        return new THREE.Vector3(x3d, y3d, z3d);
      });

      // CatmullRom Curve for smooth handwriting / geometric contour
      const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.5);
      const strokeColor = new THREE.Color(stroke.color || brushColor);
      const tubularSegments = Math.min(120, Math.max(24, stroke.points.length * 4));
      const radius = strokeThickness;

      // TubeGeometry with smooth caps
      const tubeGeo = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);

      let tubeMat: THREE.Material;
      const curStyle = stroke.brushType || strokeMaterialStyle;

      if (curStyle === 'neon_laser') {
        tubeMat = new THREE.MeshStandardMaterial({
          color: strokeColor,
          emissive: strokeColor,
          emissiveIntensity: 2.4,
          roughness: 0.1,
          metalness: 0.8
        });
      } else if (curStyle === 'anime_ribbon') {
        tubeMat = new THREE.MeshPhysicalMaterial({
          color: strokeColor,
          emissive: strokeColor,
          emissiveIntensity: 1.3,
          transmission: 0.65,
          opacity: 0.9,
          transparent: true,
          roughness: 0.12,
          ior: 1.45
        });
      } else if (curStyle === 'stardust_comet') {
        tubeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: strokeColor,
          emissiveIntensity: 2.0,
          roughness: 0.25,
          metalness: 0.4
        });
      } else if (curStyle === 'quantum_crystal') {
        tubeMat = new THREE.MeshPhysicalMaterial({
          color: strokeColor,
          transmission: 0.92,
          opacity: 0.96,
          transparent: true,
          roughness: 0.05,
          metalness: 0.1,
          ior: 1.62
        });
      } else if (curStyle === 'gold_sacred') {
        tubeMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0x996515,
          emissiveIntensity: 0.9,
          metalness: 0.95,
          roughness: 0.15
        });
      } else {
        // plasma_fire
        tubeMat = new THREE.MeshStandardMaterial({
          color: 0xff4500,
          emissive: strokeColor,
          emissiveIntensity: 2.8,
          roughness: 0.1,
          metalness: 0.6
        });
      }

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.castShadow = true;
      tubeMesh.receiveShadow = true;
      tubeMesh.name = stroke.id || `stroke-${strokeIdx}`;
      rootGroup.add(tubeMesh);
    });
  }, [liveStrokes, drawProgress, strokeMaterialStyle, strokeThickness, strokeDepthScale, brushColor, isAutoZStep]);

  // -------------------------------------------------------------
  // BUILD 3D HAEVY SON MASCOT MESHES
  // -------------------------------------------------------------
  useEffect(() => {
    if (!haevySonGroupRef.current) return;
    const group = haevySonGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }

    const currentVarObj = HAEVY_SON_VARIANTS.find(v => v.id === haevySonVariant) || HAEVY_SON_VARIANTS[0];
    const mainColor = new THREE.Color(currentVarObj.color);

    // Mascot Body
    const bodyGeo = new THREE.SphereGeometry(0.24 * haevySonScale, 24, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: mainColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Mascot Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04 * haevySonScale, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.08 * haevySonScale, 0.05 * haevySonScale, 0.21 * haevySonScale);
    group.add(eyeL);
    eyeLMeshRef.current = eyeL;

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.08 * haevySonScale, 0.05 * haevySonScale, 0.21 * haevySonScale);
    group.add(eyeR);
    eyeRMeshRef.current = eyeR;

    // Mascot Cheek Blush
    const blushGeo = new THREE.SphereGeometry(0.03 * haevySonScale, 12, 12);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(-0.13 * haevySonScale, -0.01 * haevySonScale, 0.19 * haevySonScale);
    group.add(blushL);

    const blushR = new THREE.Mesh(blushGeo, blushMat);
    blushR.position.set(0.13 * haevySonScale, -0.01 * haevySonScale, 0.19 * haevySonScale);
    group.add(blushR);

    // Horns / Ears
    const earGeo = new THREE.ConeGeometry(0.06 * haevySonScale, 0.16 * haevySonScale, 16);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, emissiveIntensity: 0.5 });
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.12 * haevySonScale, 0.22 * haevySonScale, 0);
    earL.rotation.z = 0.3;
    group.add(earL);

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.12 * haevySonScale, 0.22 * haevySonScale, 0);
    earR.rotation.z = -0.3;
    group.add(earR);

    // Tiny Wings
    const wingGeo = new THREE.BoxGeometry(0.14 * haevySonScale, 0.08 * haevySonScale, 0.02);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.2 * haevySonScale, 0.06 * haevySonScale, -0.1 * haevySonScale);
    wingL.rotation.y = 0.4;
    group.add(wingL);
    wingLMeshRef.current = wingL;

    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0.2 * haevySonScale, 0.06 * haevySonScale, -0.1 * haevySonScale);
    wingR.rotation.y = -0.4;
    group.add(wingR);
    wingRMeshRef.current = wingR;

    // Accessory Rendering
    if (haevySonAccessory === 'crown') {
      const crownGeo = new THREE.CylinderGeometry(0.08 * haevySonScale, 0.06 * haevySonScale, 0.08 * haevySonScale, 6);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.7, metalness: 0.8 });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.position.set(0, 0.28 * haevySonScale, 0);
      group.add(crownMesh);
    } else if (haevySonAccessory === 'ar_visor') {
      const visorGeo = new THREE.BoxGeometry(0.26 * haevySonScale, 0.07 * haevySonScale, 0.06 * haevySonScale);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.05 * haevySonScale, 0.22 * haevySonScale);
      group.add(visorMesh);
    }

    // Glow Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.32 * haevySonScale, 0.015, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({ color: mainColor, transparent: true, opacity: 0.8 });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    group.add(haloMesh);
    haloMeshRef.current = haloMesh;

  }, [haevySonVariant, haevySonAccessory, haevySonScale]);

  // Replay animation loop
  useEffect(() => {
    if (!isReplayingDraw) return;
    let step = drawProgress;
    const interval = setInterval(() => {
      step += 0.03;
      if (step >= 1.0) {
        setDrawProgress(1.0);
        setIsReplayingDraw(false);
        clearInterval(interval);
      } else {
        setDrawProgress(step);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isReplayingDraw, drawProgress]);

  // -------------------------------------------------------------
  // CANVAS POINTER HANDLERS (SEPARATED STROKES & 360° ORBIT)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    isPointerDownRef.current = true;

    if (drawingInputMode === 'draw') {
      const normX = clientX / rect.width;
      const normY = clientY / rect.height;

      // Auto Z-depth stepping if enabled so each letter/stroke sits on its own depth plane
      const zOffset = isAutoZStep ? (autoZCounterRef.current % 10) * 0.04 - 0.2 : 0;
      autoZCounterRef.current += 1;

      const newPt: StrokePoint3D = {
        x: normX,
        y: normY,
        z: currentZDepth + zOffset,
        color: brushColor,
        time: Date.now()
      };

      const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      currentActiveStrokeIdRef.current = strokeId;
      currentLiveStrokePointsRef.current = [newPt];

      setLiveStrokes(prev => [
        ...prev,
        {
          id: strokeId,
          points: [newPt],
          color: brushColor,
          brushType: strokeMaterialStyle,
          zLayer: zOffset
        }
      ]);
      morningAudio.triggerStarPop();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();

    if (drawingInputMode === 'draw') {
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const normX = clientX / rect.width;
      const normY = clientY / rect.height;

      const lastPt = currentLiveStrokePointsRef.current[currentLiveStrokePointsRef.current.length - 1];
      if (lastPt) {
        const dist = Math.hypot(normX - lastPt.x, normY - lastPt.y);
        // Avoid redundant points
        if (dist < 0.003) return;

        // Auto-segmentation if rapid leap occurs (pen-lift without mouseup)
        if (dist > 0.15) {
          const zOffset = isAutoZStep ? (autoZCounterRef.current % 10) * 0.04 - 0.2 : 0;
          autoZCounterRef.current += 1;
          const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          currentActiveStrokeIdRef.current = strokeId;
          const startPt: StrokePoint3D = {
            x: normX,
            y: normY,
            z: currentZDepth + zOffset,
            color: brushColor,
            time: Date.now()
          };
          currentLiveStrokePointsRef.current = [startPt];
          setLiveStrokes(prev => [
            ...prev,
            {
              id: strokeId,
              points: [startPt],
              color: brushColor,
              brushType: strokeMaterialStyle,
              zLayer: zOffset
            }
          ]);
          return;
        }
      }

      const zVal = lastPt?.z !== undefined ? lastPt.z : currentZDepth;
      const newPt: StrokePoint3D = {
        x: normX,
        y: normY,
        z: zVal,
        color: brushColor,
        time: Date.now()
      };

      currentLiveStrokePointsRef.current.push(newPt);

      // Append point to the active stroke in state
      setLiveStrokes(prev => {
        if (prev.length === 0) return prev;
        const lastStroke = prev[prev.length - 1];
        const updatedStroke: Stroke3D = {
          ...lastStroke,
          points: [...lastStroke.points, newPt]
        };
        return [...prev.slice(0, -1), updatedStroke];
      });
    } else {
      // 360-DEGREE ROTATION (ORBIT MODE)
      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      strokeManualRotRef.current = {
        y: strokeManualRotRef.current.y + dx * 0.008,
        x: Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, strokeManualRotRef.current.x + dy * 0.008))
      };
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    currentActiveStrokeIdRef.current = null;
    currentLiveStrokePointsRef.current = [];
  };

  // -------------------------------------------------------------
  // PREPARE 3D SNAPSHOT FOR DOWNLOAD OR COMMUNITY SHARING
  // -------------------------------------------------------------
  const handlePrepareShareSnapshot = (openModal: boolean = true) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 0.95);
      setShareImageSnapshot(dataUrl);

      if (openModal) {
        setShareModalOpen(true);
        setShareFeedSuccess(false);
        setShareCaption('✨ Tác phẩm Không Gian 3D tuyệt mỹ xoay 360° trong Haevy Space!');
      } else {
        // Direct Download PNG
        const link = document.createElement('a');
        link.download = `haevy-space-3d-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setPostcardToast('💾 Đã tải ảnh tác phẩm 3D PNG thành công!');
        setTimeout(() => setPostcardToast(null), 3000);
      }
    } catch (err) {
      console.warn('Snapshot capture error:', err);
    }
  };

  // Direct Community Feed Post
  const handleDirectPostToCommunity = async () => {
    if (!shareImageSnapshot || isSharingToFeed) return;
    setIsSharingToFeed(true);

    try {
      if (db) {
        await addDoc(collection(db, 'community_posts'), {
          userId: user?.uid || 'anonymous',
          authorName: user?.displayName || 'Nghệ Sĩ Không Gian 3D',
          authorAvatar: user?.photoURL || null,
          content: shareCaption || '✨ Tác phẩm Không Gian 3D tuyệt mỹ trong Haevy Space!',
          tag: shareTag || '#HaevySpace',
          imageUrl: shareImageSnapshot,
          category: 'art',
          likesCount: 0,
          commentsCount: 0,
          createdAt: serverTimestamp()
        });

        if (addAudioPoints) {
          addAudioPoints(25, 'Tác phẩm Không Gian 3D (+25 Điểm)', 'post');
        }

        setShareFeedSuccess(true);
        morningAudio.triggerPeaceRainbowChime();
        setPostcardToast('🎉 Đã đăng bài lên Bảng Tin Cộng Đồng (+25 Điểm)!');
        setTimeout(() => {
          setPostcardToast(null);
          setShareModalOpen(false);
        }, 2200);
      }
    } catch (err) {
      console.warn('Post error:', err);
      setPostcardToast('⚠️ Không thể đăng bài lúc này, vui lòng thử lại.');
      setTimeout(() => setPostcardToast(null), 3000);
    } finally {
      setIsSharingToFeed(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden animate-in fade-in duration-300 select-none">
      
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={canvasContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full touch-none ${
          drawingInputMode === 'draw' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* ========================================================================= */}
      {/* TOP HEADER: NAVIGATION, AI PHYSICS TRIGGER & COMPACT TOGGLE */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-6 sm:right-6 z-30 flex items-center justify-between pointer-events-none gap-2">
        
        {/* Left: Studio Mode Tabs & AI Physics Reconstruct */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-zinc-950/90 backdrop-blur-2xl border border-sky-500/40 p-1 sm:p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => {
              setHaevySpaceTab('spatial_drawing');
              setShowHaevySon(false);
              morningAudio.triggerStarPop();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              haevySpaceTab === 'spatial_drawing'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PenTool size={13} />
            <span>Vẽ 3D 360°</span>
          </button>

          <button
            onClick={() => {
              setHaevySpaceTab('mascot_play');
              setShowHaevySon(true);
              morningAudio.triggerStarPop();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              haevySpaceTab === 'mascot_play'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame size={13} />
            <span>Linh Vật 3D</span>
          </button>

          {/* Direct AI Physics Reconstruct Button */}
          {haevySpaceTab === 'spatial_drawing' && (
            <button
              onClick={() => handleReconstructWithPhysics()}
              disabled={isPhysicsReconstructing}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                isPhysicsReconstructing
                  ? 'bg-amber-500/40 text-amber-200 border-amber-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-500/10'
              }`}
              title="Tái tạo nét chữ bằng AI & Phương trình động lực học vật lý (quán tính, chiều sâu Z, vuốt nhọn đầu ngọn bút)"
            >
              {isPhysicsReconstructing ? (
                <Loader2 size={13} className="animate-spin text-amber-300" />
              ) : (
                <Atom size={13} className="text-amber-400 animate-spin-slow" />
              )}
              <span className="hidden sm:inline font-black">AI Vật Lý 3D</span>
            </button>
          )}
        </div>

        {/* Center: Real-time 360° Status Badge & Compact Mode Indicator */}
        <div className="hidden lg:flex items-center gap-2 pointer-events-auto bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 px-3.5 py-1.5 rounded-2xl text-xs shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-zinc-300 font-bold">
            {drawingInputMode === 'draw' ? '✍️ Chế Độ Vẽ Nét 3D Tách Rời' : '🔄 Kéo Chuột / Cảm Ứng Để Xoay 360°'}
          </span>
          <span className="text-[10px] text-zinc-500 ml-1">| Quán Tính & Trọng Trường Z</span>
        </div>

        {/* Right: Master Compact Toggle, Theme & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Master Compact Toggle (Thu nhỏ / Mở rộng toàn bộ bảng) */}
          <button
            onClick={() => {
              const next = !isCompactMode;
              setIsCompactMode(next);
              setIsLeftPanelCollapsed(next);
              setIsRightPanelCollapsed(next);
              setIsBottomDockCollapsed(next);
              morningAudio.triggerStarPop();
              setPostcardToast(next ? '🎛️ Đã thu nhỏ các bảng điều khiển để không gian 3D rộng thoáng' : '🎛️ Đã mở rộng toàn bộ bảng điều khiển');
              setTimeout(() => setPostcardToast(null), 2000);
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border transition-all shadow-xl flex items-center gap-1.5 text-xs font-bold ${
              isCompactMode
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                : 'bg-zinc-950/90 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title={isCompactMode ? 'Mở rộng bảng điều khiển' : 'Thu nhỏ các bảng điều khiển'}
          >
            {isCompactMode ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
            <span className="hidden md:inline text-[11px]">
              {isCompactMode ? 'Mở Rộng Bảng' : 'Thu Nhỏ Bảng'}
            </span>
          </button>

          {/* Environment Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 p-1 rounded-2xl shadow-xl">
            {ANIME_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme.id);
                  morningAudio.triggerStarPop();
                }}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedTheme === theme.id
                    ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={theme.name}
              >
                <span>{theme.icon}</span>
                <span className="hidden xl:inline text-[11px]">{theme.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all shadow-xl"
            title="Đóng không gian 3D"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: 3D SPATIAL PRESETS & GEOMETRIES (COLLAPSIBLE / COMPACT) */}
      {/* ========================================================================= */}
      {haevySpaceTab === 'spatial_drawing' && (
        <div 
          className={`absolute top-16 sm:top-20 left-3 sm:left-6 z-20 pointer-events-auto transition-all duration-300 ${
            isLeftPanelCollapsed || isCompactMode
              ? 'bg-zinc-950/90 backdrop-blur-2xl border border-sky-500/30 p-1.5 rounded-2xl shadow-2xl'
              : 'max-w-[170px] sm:max-w-[210px] bg-zinc-950/90 backdrop-blur-2xl border border-sky-500/30 p-2 sm:p-3 rounded-2xl shadow-2xl'
          }`}
        >
          {/* Header with collapse button */}
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80 gap-1.5">
            {!(isLeftPanelCollapsed || isCompactMode) && (
              <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} />
                Mẫu 3D Tách Nét:
              </span>
            )}
            
            <button
              onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
              className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] transition-all ml-auto"
              title={isLeftPanelCollapsed ? 'Mở rộng mẫu 3D' : 'Thu nhỏ bảng mẫu 3D'}
            >
              {isLeftPanelCollapsed || isCompactMode ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>

          {/* Compact Mini Pill Mode */}
          {(isLeftPanelCollapsed || isCompactMode) ? (
            <div className="flex flex-col gap-1.5 pt-1 items-center">
              <button
                onClick={() => handleLoadPreset('haevy_logo')}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-sky-950/70 border border-zinc-800 hover:border-sky-500/50 flex items-center justify-center text-sm transition-all"
                title='Chữ 3D "HAEVY SPACE"'
              >
                ✨
              </button>
              <button
                onClick={() => handleLoadPreset('tam_an')}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-amber-950/70 border border-zinc-800 hover:border-amber-500/50 flex items-center justify-center text-sm transition-all"
                title='Thư Pháp 3D "Tâm An"'
              >
                🍃
              </button>
              <button
                onClick={() => handleLoadPreset('heart')}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-800 hover:border-rose-500/50 flex items-center justify-center text-sm transition-all"
                title="Trái Tim Đa Chiều"
              >
                💖
              </button>
              <button
                onClick={() => handleLoadPreset('cube')}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-cyan-950/70 border border-zinc-800 hover:border-cyan-500/50 flex items-center justify-center text-sm transition-all"
                title="Khối Lập Phương 3D"
              >
                🧊
              </button>
              <button
                onClick={() => setIsLeftPanelCollapsed(false)}
                className="text-[9px] font-black text-sky-400 hover:underline pt-0.5"
                title="Xem tất cả mẫu"
              >
                +Xem
              </button>
            </div>
          ) : (
            /* Expanded Full List */
            <div className="flex flex-col gap-1 text-xs pt-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => handleLoadPreset('haevy_logo')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-sky-950/70 border border-zinc-800 hover:border-sky-500/50 text-left font-bold text-sky-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>✨</span>
                <span>Chữ "HAEVY SPACE"</span>
              </button>

              <button
                onClick={() => handleLoadPreset('tam_an')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-amber-950/70 border border-zinc-800 hover:border-amber-500/50 text-left font-bold text-amber-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>🍃</span>
                <span>Thư Pháp "Tâm An"</span>
              </button>

              <button
                onClick={() => handleLoadPreset('heart')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-800 hover:border-rose-500/50 text-left font-bold text-rose-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>💖</span>
                <span>Trái Tim Đa Chiều</span>
              </button>

              <button
                onClick={() => handleLoadPreset('star')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-amber-950/70 border border-zinc-800 hover:border-amber-500/50 text-left font-bold text-amber-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>⭐</span>
                <span>Ngôi Sao Tinh Tú</span>
              </button>

              <button
                onClick={() => handleLoadPreset('helix')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-indigo-950/70 border border-zinc-800 hover:border-indigo-500/50 text-left font-bold text-indigo-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>🧬</span>
                <span>Chuỗi Xoắn DNA</span>
              </button>

              <button
                onClick={() => handleLoadPreset('cube')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-cyan-950/70 border border-zinc-800 hover:border-cyan-500/50 text-left font-bold text-cyan-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>🧊</span>
                <span>Khối Lập Phương 3D</span>
              </button>

              <button
                onClick={() => handleLoadPreset('infinity')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-fuchsia-950/70 border border-zinc-800 hover:border-fuchsia-500/50 text-left font-bold text-fuchsia-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>♾️</span>
                <span>Vòng Xoắn Vô Cực</span>
              </button>

              <button
                onClick={() => handleLoadPreset('enso')}
                className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-emerald-950/70 border border-zinc-800 hover:border-emerald-500/50 text-left font-bold text-emerald-300 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>⭕</span>
                <span>Zen Enso Thư Pháp</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR: CAMERA PRESETS, LIGHTING & 360° CONTROLS (COLLAPSIBLE) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute top-16 sm:top-20 right-3 sm:right-6 z-20 pointer-events-auto transition-all duration-300 ${
          isRightPanelCollapsed || isCompactMode
            ? 'bg-zinc-950/90 backdrop-blur-2xl border border-sky-500/30 p-1.5 rounded-2xl shadow-2xl'
            : 'flex flex-col gap-2 bg-zinc-950/90 backdrop-blur-2xl border border-sky-500/30 p-2 sm:p-3 rounded-2xl shadow-2xl'
        }`}
      >
        {/* Header with collapse button */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80 gap-1.5">
          {!(isRightPanelCollapsed || isCompactMode) && (
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider px-1">
              Góc Nhìn 3D:
            </span>
          )}
          
          <button
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] transition-all ml-auto"
            title={isRightPanelCollapsed ? 'Mở rộng góc nhìn' : 'Thu nhỏ bảng góc nhìn'}
          >
            {isRightPanelCollapsed || isCompactMode ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>

        {/* Compact Right Dock Mode */}
        {(isRightPanelCollapsed || isCompactMode) ? (
          <div className="flex flex-col gap-1.5 pt-1 items-center">
            {[
              { id: 'front_view', icon: '🎯', label: 'Chính Diện' },
              { id: 'angle_45', icon: '📐', label: 'Nghiêng 45°' },
              { id: 'macro_zoom', icon: '🔍', label: 'Cận Cảnh' },
              { id: 'orbit_free', icon: '🔄', label: 'Quỹ Đạo 360°' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveCameraView(v.id as any);
                  morningAudio.triggerStarPop();
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                  activeCameraView === v.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={v.label}
              >
                {v.icon}
              </button>
            ))}

            <div className="w-5 h-[1px] bg-zinc-800 my-0.5" />

            <button
              onClick={() => {
                const next = !isAutoRotateStrokes;
                setIsAutoRotateStrokes(next);
                setPostcardToast(next ? '🔄 Đã bật Xoay 360°' : 'Đã dừng xoay');
                setTimeout(() => setPostcardToast(null), 1500);
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                isAutoRotateStrokes ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
              title="Tự động xoay 360°"
            >
              <RotateCw size={13} className={isAutoRotateStrokes ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setShowSpotlight(!showSpotlight)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                showSpotlight ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
              title="Đèn rọi điểm"
            >
              💡
            </button>
          </div>
        ) : (
          /* Expanded Right Panel */
          <div className="flex flex-col gap-1.5 text-xs">
            {[
              { id: 'front_view', label: 'Chính Diện', icon: '🎯' },
              { id: 'angle_45', label: 'Nghiêng 45°', icon: '📐' },
              { id: 'macro_zoom', label: 'Cận Cảnh', icon: '🔍' },
              { id: 'top_down', label: 'Trên Xuống', icon: '🔝' },
              { id: 'orbit_free', label: 'Quỹ Đạo 360°', icon: '🔄' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveCameraView(v.id as any);
                  morningAudio.triggerStarPop();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeCameraView === v.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            ))}

            <div className="h-[1px] bg-zinc-800 my-0.5" />

            {/* 360 Auto-Rotate Toggle */}
            <button
              onClick={() => {
                const next = !isAutoRotateStrokes;
                setIsAutoRotateStrokes(next);
                setPostcardToast(next ? '🔄 Đã bật Xoay 360° Tự Động' : 'Đã dừng xoay tự động');
                setTimeout(() => setPostcardToast(null), 1800);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isAutoRotateStrokes ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <RotateCw size={13} className={isAutoRotateStrokes ? 'animate-spin' : ''} />
              <span>Tự Xoay 360°</span>
            </button>

            <button
              onClick={() => setShowSpotlight(!showSpotlight)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                showSpotlight ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>💡</span>
              <span>Đèn Rọi Điểm</span>
            </button>

            <button
              onClick={() => setShowExhibitionPedestal(!showExhibitionPedestal)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                showExhibitionPedestal ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🔮</span>
              <span>Bục Pha Lê</span>
            </button>

            <button
              onClick={() => setShowSpatialGrid(!showSpatialGrid)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                showSpatialGrid ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📐</span>
              <span>Lưới Tọa Độ</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM DOCK: DRAWING TOOLS, PALETTE, AI PHYSICS & COMMUNITY (COLLAPSIBLE) */}
      {/* ========================================================================= */}
      {haevySpaceTab === 'spatial_drawing' && (
        <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-6 sm:right-6 z-20 pointer-events-none flex flex-col items-center gap-1.5">
          <div className="pointer-events-auto w-full max-w-4xl flex flex-col gap-2 bg-zinc-950/95 backdrop-blur-2xl border border-sky-500/40 p-2 sm:p-2.5 rounded-3xl shadow-2xl transition-all duration-300">
            
            {/* Main Action Bar (Compact vs Expanded) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              
              {/* Draw vs Orbit Switcher */}
              <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setDrawingInputMode('draw')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    drawingInputMode === 'draw'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <PenTool size={13} />
                  <span>Vẽ 3D</span>
                </button>

                <button
                  onClick={() => setDrawingInputMode('orbit')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    drawingInputMode === 'orbit'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MousePointer size={13} />
                  <span>Xoay 360°</span>
                </button>
              </div>

              {/* Glowing Color Palette */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
                {['#38bdf8', '#f43f5e', '#fbbf24', '#34d399', '#a855f7', '#ffffff', '#ef4444'].map(color => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all ${
                      brushColor === color ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              {/* AI Physics Enhancement Action Button */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReconstructWithPhysics()}
                  disabled={isPhysicsReconstructing}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg ${
                    isPhysicsReconstructing
                      ? 'bg-amber-500 text-zinc-950 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-zinc-950 font-black hover:opacity-90 active:scale-95 shadow-amber-500/20'
                  }`}
                  title="Tái tạo nét bằng phương trình động lực học vật lý & AI chiều sâu Z"
                >
                  {isPhysicsReconstructing ? (
                    <Loader2 size={14} className="animate-spin text-zinc-950" />
                  ) : (
                    <Zap size={14} className="fill-zinc-950 text-zinc-950" />
                  )}
                  <span>Tái Tạo AI Vật Lý</span>
                </button>

                <button
                  onClick={() => setShowPhysicsSettingsModal(true)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-all"
                  title="Mở bảng thông số phương trình vật lý"
                >
                  <Sliders size={14} />
                </button>
              </div>

              {/* Actions: Undo, Replay, Share, Download, Clear & Collapse */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={handleUndoStroke}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                  title="Hoàn tác nét vẽ cuối"
                >
                  <Undo2 size={13} />
                </button>

                <button
                  onClick={() => {
                    setDrawProgress(0.02);
                    setIsReplayingDraw(true);
                    morningAudio.triggerStarPop();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/30 transition-all cursor-pointer"
                  title="Tái hiện nét vẽ xuất hiện từng bước trong không gian 3D"
                >
                  <Play size={11} />
                  <span className="hidden sm:inline">Tái Hiện</span>
                </button>

                <button
                  onClick={() => handlePrepareShareSnapshot(true)}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  title="Lưu ảnh 3D và chia sẻ lên Bảng tin cộng đồng"
                >
                  <Share2 size={13} className="text-amber-200" />
                  <span className="hidden sm:inline">Lưu & Chia Sẻ</span>
                  <span className="sm:hidden">Chia Sẻ</span>
                </button>

                <button
                  onClick={() => handlePrepareShareSnapshot(false)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                  title="Tải ảnh PNG 3D"
                >
                  <Download size={13} />
                </button>

                <button
                  onClick={handleClearStrokes}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                  title="Xóa tất cả nét vẽ"
                >
                  <Trash2 size={13} />
                </button>

                {/* Bottom Dock Collapse Toggle */}
                <button
                  onClick={() => setIsBottomDockCollapsed(!isBottomDockCollapsed)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                  title={isBottomDockCollapsed ? 'Mở rộng bảng chất liệu' : 'Thu nhỏ bảng'}
                >
                  {isBottomDockCollapsed || isCompactMode ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Expanded Secondary Bar: 3D Material Styles & Sliders (Only if not collapsed) */}
            {!(isBottomDockCollapsed || isCompactMode) && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80 text-xs animate-in fade-in duration-200">
                {/* 3D Glowing Material Styles */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-400 mr-1 hidden md:inline">Chất Liệu:</span>
                  {[
                    { id: 'neon_laser', label: '⚡ Laser' },
                    { id: 'anime_ribbon', label: '🌌 Lụa Quang Học' },
                    { id: 'stardust_comet', label: '✨ Bụi Sao' },
                    { id: 'quantum_crystal', label: '💎 Pha Lê' },
                    { id: 'gold_sacred', label: '👑 Hoàng Kim' },
                    { id: 'plasma_fire', label: '🔥 Plasma' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setStrokeMaterialStyle(st.id as any);
                        morningAudio.triggerStarPop();
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                        strokeMaterialStyle === st.id
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Micro Physics Controls */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span>Độ Dày:</span>
                    <input
                      type="range"
                      min={0.015}
                      max={0.09}
                      step={0.005}
                      value={strokeThickness}
                      onChange={(e) => setStrokeThickness(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span>Độ Sâu Z:</span>
                    <input
                      type="range"
                      min={0.4}
                      max={2.4}
                      step={0.1}
                      value={strokeDepthScale}
                      onChange={(e) => setStrokeDepthScale(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <label className="flex items-center gap-1 cursor-pointer select-none text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isAutoZStep}
                      onChange={(e) => setIsAutoZStep(e.target.checked)}
                      className="rounded accent-sky-400 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[10px]">Tự Tách Lớp Z</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: TÙY CHỈNH PHƯƠNG TRÌNH VẬT LÝ & AI ĐỘNG LỰC HỌC 3D */}
      {/* ========================================================================= */}
      {showPhysicsSettingsModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setShowPhysicsSettingsModal(false)}
        >
          <div 
            className="bg-zinc-950 border border-amber-500/50 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
                  <Atom size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Phương Trình Vật Lý & AI Chiều Sâu 3D</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Mô hình hóa động lực học thư pháp: Vận tốc, Quán tính & Độ cong
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPhysicsSettingsModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sliders for Kinematic & Physics Parameters */}
            <div className="space-y-3.5 text-xs text-zinc-300">
              
              {/* 1. Curvature Depth Push */}
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>⚡ Lực Đè Khúc Cua (Curvature Push $F_k$):</span>
                  </span>
                  <span className="text-amber-400 font-mono">{physicsConfig.curvaturePush.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.8}
                  step={0.05}
                  value={physicsConfig.curvaturePush}
                  onChange={(e) => setPhysicsConfig(prev => ({ ...prev, curvaturePush: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <p className="text-[10px] text-zinc-400">
                  Tại các góc cua gập nét hoặc nét móc thư pháp, nét sẽ tự đè sâu vào trục Z tạo độ nổi khối mạnh mẽ.
                </p>
              </div>

              {/* 2. Spring-Damper Inertia */}
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-sky-300 flex items-center gap-1">
                    <span>🍃 Quán Tính Lò Xo Giảm Chấn (Inertia Smoothing):</span>
                  </span>
                  <span className="text-sky-400 font-mono">{physicsConfig.inertiaSmoothing.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.95}
                  step={0.05}
                  value={physicsConfig.inertiaSmoothing}
                  onChange={(e) => setPhysicsConfig(prev => ({ ...prev, inertiaSmoothing: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <p className="text-[10px] text-zinc-400">
                  Triệt tiêu rung tay cơ học và tạo độ lướt mượt mà như bút lông trên giấy lụa 3D.
                </p>
              </div>

              {/* 3. Overall 3D Depth Intensity */}
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-purple-300 flex items-center gap-1">
                    <span>🌌 Biên Độ Chiều Sâu 3D (Z-Depth Amplitude):</span>
                  </span>
                  <span className="text-purple-400 font-mono">{physicsConfig.depthIntensity.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.8}
                  step={0.1}
                  value={physicsConfig.depthIntensity}
                  onChange={(e) => setPhysicsConfig(prev => ({ ...prev, depthIntensity: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <p className="text-[10px] text-zinc-400">
                  Điều chỉnh khoảng cách giữa các lớp nét trước và nét sau trong không gian đa chiều.
                </p>
              </div>

              {/* 4. Calligraphy Tip Tapering Toggle */}
              <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
                <div>
                  <span className="font-bold text-emerald-300 block">Vuốt Nhọn Khởi Bút & Thu Bút</span>
                  <span className="text-[10px] text-zinc-400">Tự động thu nhọn đầu ngọn bút mượt mà theo phương trình Hermite</span>
                </div>
                <input
                  type="checkbox"
                  checked={physicsConfig.calligraphyTaper}
                  onChange={(e) => setPhysicsConfig(prev => ({ ...prev, calligraphyTaper: e.target.checked }))}
                  className="w-4 h-4 rounded accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setPhysicsConfig(DEFAULT_PHYSICS_CONFIG);
                  morningAudio.triggerStarPop();
                }}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all"
              >
                Mặc Định
              </button>

              <button
                onClick={() => {
                  setShowPhysicsSettingsModal(false);
                  handleReconstructWithPhysics();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Áp Dụng Tái Tạo Ngay ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MASCOT INTERACTIVE PLAY MODE */}
      {/* ========================================================================= */}
      {haevySpaceTab === 'mascot_play' && (
        <>
          {/* Floating Speech Bubble for Mascot */}
          {mascotSpeech && mascotScreenPos.visible && (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-150 ease-out"
              style={{
                left: `${mascotScreenPos.x}px`,
                top: `${mascotScreenPos.y - 12}px`
              }}
            >
              <div className="relative bg-zinc-950/95 backdrop-blur-2xl border border-amber-400/80 px-4 py-2 rounded-2xl shadow-2xl shadow-amber-500/20 max-w-[260px] text-center animate-in zoom-in-95 fade-in duration-200">
                <div className="text-xs font-black text-amber-200 flex items-center justify-center gap-1.5 leading-snug">
                  <span>{mascotSpeech}</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 border-r border-b border-amber-400/80 rotate-45" />
              </div>
            </div>
          )}

          {/* Top Mascot Controls */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-1.5 bg-zinc-950/90 backdrop-blur-2xl border border-amber-500/40 p-2 sm:px-4 sm:py-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
            <span className="text-[11px] font-black text-amber-300">
              Chọn Cử Chỉ Chơi Cùng Bé Haevy Son 3D:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              {[
                { id: 'wave', label: '👋 Chào hỏi', text: 'Chào bé!' },
                { id: 'open_palm', label: '🖐️ Đậu tay', text: 'Sà vào tay' },
                { id: 'point', label: '👉 Dẫn đường', text: 'Bay theo ngón' },
                { id: 'peace', label: '✌️ Nhào lộn', text: 'Lộn 360°' },
                { id: 'heart', label: '🫰 Bắn tim', text: 'Yêu thương' },
                { id: 'pinch', label: '🍬 Cho ăn kẹo', text: 'Kẹo sao' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    morningAudio.triggerStarPop();
                    setMascotSpeech(g.text);
                    if (g.id === 'peace') haevySonFlipProgressRef.current = 1.0;
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer active:scale-95"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TOAST BANNER */}
      {postcardToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-sky-400/60 text-sky-200 text-xs font-black shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles size={16} className="text-amber-400" />
          <span>{postcardToast}</span>
        </div>
      )}

      {/* DIALOG: LƯU & CHIA SẺ BẢNG TIN CỘNG ĐỒNG */}
      {shareModalOpen && shareImageSnapshot && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setShareModalOpen(false)}
        >
          <div 
            className="bg-zinc-950 border border-sky-500/50 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Lưu & Chia Sẻ Lên Bảng Tin Cộng Đồng</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      +25 Điểm
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Lưu tác phẩm 3D không gian và chia sẻ cùng cộng đồng Haevy
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-sky-400/30 bg-black shadow-inner">
              <img
                src={shareImageSnapshot}
                alt="Tác phẩm không gian 3D"
                className="w-full max-h-64 sm:max-h-80 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Nội dung chia sẻ bài viết:
              </label>
              <textarea
                rows={3}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                placeholder="Nhập cảm nhận về tác phẩm 3D của bạn..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 transition-all resize-none"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => handlePrepareShareSnapshot(false)}
                className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>Tải File PNG</span>
              </button>

              <button
                onClick={handleDirectPostToCommunity}
                disabled={isSharingToFeed || shareFeedSuccess}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-sky-500/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSharingToFeed ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>{shareFeedSuccess ? 'Đã Đăng Lên Bảng Tin' : 'Đăng Ngay (+25 Điểm)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
