// =========================================================================
// 🌟 HAEVY SON 5D CELESTIAL MASTERPIECE COMPANION (MÔ HÌNH 5D ĐA CHIỀU)
// -------------------------------------------------------------------------
// 1. Chiều 1-3 (3D Spatial High-Poly): Kim Long Chibi Siêu Nét & Đáng Yêu
//    - Sừng rồng hoàng kim pha lê, Ăng-ten ngôi sao tinh nghịch
//    - Tai cánh mềm mại, Mắt Anime 3 tầng ánh sáng lấp lánh (Iris Gradient)
//    - Cặp cánh rồng pha lê đập nhịp nhàng, Đuôi rồng plasma uốn lượn
//    - Bé Tinh Cầu Hộ Vệ (Baby Starlet Companion) bay lượn vòng quanh
// 2. Chiều 4 (4D Temporal Physics): 60-120 FPS Dao động bồng bềnh, Hô hấp sinh học
// 3. Chiều 5 (5D Quantum Luminescence): Vòng hào quang đa sắc, Hạt lượng tử xoay
// 4. Thu nhỏ gọn gàng, Kéo thả tự do mọi góc màn hình, 8 Cử chỉ & 4 Dạng biến hình
// =========================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Hand, 
  Camera, 
  Heart, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Zap, 
  Smile, 
  Flame,
  ThumbsUp,
  Camera as SnapshotIcon,
  CheckCircle2,
  ArrowLeft,
  Upload,
  RefreshCw,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Move,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Share2,
  Crown,
  Compass,
  Sun,
  Moon,
  Sparkle,
  Globe,
  Rocket,
  Trash2,
  Orbit,
  ShieldCheck,
  Footprints,
  Monitor,
  Keyboard,
  HelpCircle,
  Scan,
  RotateCcw,
  Target
} from 'lucide-react';
import { morningAudio } from '../services/morningAudioService';
import { spatialPhysics, GravityPreset, PhysicalObjectData } from '../services/spatialPhysicsEngine';
import { handTracking, HandTrackingResult } from '../services/handTrackingService';

export type MascotHandGesture = 
  | 'idle'
  | 'walking'          // 🐾 Bước đi khi úp bàn tay (chậm)
  | 'running'          // ⚡ Chạy nhanh nước rút (nhanh)
  | 'v_sign'           // ✌️ Dáng chữ V & Nháy mắt
  | 'reach_hand'       // ✋ Giơ tay chạm High-Five 5D
  | 'wave'             // 👋 Vẫy tay chào
  | 'dragon_power'     // 🐉 Kim Long Xuất Thế
  | 'thumbs_up'        // 👍 Giơ ngón cái số 1
  | 'zen_float'        // 🧘 Thiền Định Không Gian 5D
  | 'heart'            // 🫶 Bão tim yêu thương
  | 'petting'          // 🥰 Dụi đầu vuốt ve
  | 'dance_jump'       // 💃 Nhảy múa xoay tròn vui nhộn
  | 'shy_blush';       // 😳 Ngượng ngùng che mặt đáng yêu

export type MascotElementalForm = 
  | 'golden_dragon'    // 👑 Kim Long Hoàng Gia (Vàng Kim, Hổ Phách, Hào Quang Thái Dương)
  | 'cosmic_galaxy'    // 🌌 Thiên Hà Tinh Vân (Tím Huyền Ảo, Xanh Neon, Sao Băng)
  | 'frost_crystal'    // ❄️ Băng Tinh Kim Cương (Xanh Băng Cực Quang, Pha Lê Tuyết)
  | 'sakura_deity';    // 🌸 Anh Đào Tiên Giới (Hồng Ngọc Trai, Cánh Hoa Bay)

interface HaevySonMascot3DProps {
  isExternalCameraActive?: boolean;
  onEnterFullSpaceCanvas?: () => void;
  onBackToPortal?: () => void;
  isStandaloneFullscreen?: boolean;
  onShareToCommunity?: (imageUrl: string, suggestedContent?: string, tag?: string) => void;
}

export const HaevySonMascot3D: React.FC<HaevySonMascot3DProps> = ({
  onBackToPortal,
  isStandaloneFullscreen = false,
  onShareToCommunity
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [currentGesture, setCurrentGesture] = useState<MascotHandGesture>('idle');
  const [mascotForm, setMascotForm] = useState<MascotElementalForm>('golden_dragon');
  const [mascotStatusText, setMascotStatusText] = useState<string>('Haevy Son 5D đang dõi theo ánh nhìn của bạn với tình yêu thương!');
  const [affection, setAffection] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [isCameraTracking, setIsCameraTracking] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [activeSpecialFX, setActiveSpecialFX] = useState<string>('none');
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [touchRipples, setTouchRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // 🌟 KHUNG TAY NHẬN DIỆN & DESKTOP MÀN HÌNH LỚN
  const [showHandSkeleton, setShowHandSkeleton] = useState<boolean>(true);
  const [isDesktopSplitMode, setIsDesktopSplitMode] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  
  // 📳 PHẢN HỒI RUNG HAPTIC & HIỆU ỨNG THỊ GIÁC (RUNG MÀN HÌNH / ĐỔI MÀU VIỀN / XUNG ÁNH SÁNG)
  const [isHapticShakeActive, setIsHapticShakeActive] = useState<boolean>(false);
  const [gestureAuraFlash, setGestureAuraFlash] = useState<{ active: boolean; gesture: MascotHandGesture; color: string } | null>(null);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState<boolean>(true);

  const [trackingTelemetry, setTrackingTelemetry] = useState<{
    orientation: string;
    isWalking: boolean;
    speed: number;
    gestureName: string;
  }>({
    orientation: 'vertical',
    isWalking: false,
    speed: 0,
    gestureName: 'idle'
  });

  // 🌟 COLLAPSE & ZEN VIEW STATES (THU GỌN GIAO DIỆN & BẢNG ĐIỀU KHIỂN)
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // 🌟 3D PHYSICS ENGINE STATES & TABS
  const [activeDockTab, setActiveDockTab] = useState<'gestures' | 'physics'>('gestures');
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>('earth');
  const [isPetPhysicsFree, setIsPetPhysicsFree] = useState<boolean>(false);
  const [spawnedCount, setSpawnedCount] = useState<number>(0);

  // 🌟 SIZE & FREE DRAG POSITION ON SCREEN (MẶC ĐỊNH GỌN GÀNG 0.48X DỄ QUAN SÁT CAMERA)
  const [petScale, setPetScale] = useState<number>(0.48);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0
  });

  // 3D Direct Raycast Manipulation & Momentum Throwing
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const grabStateRef = useRef<{
    isGrabbing3D: boolean;
    targetType: 'mascot' | 'object' | null;
    targetObj: PhysicalObjectData | null;
    dragPlane: THREE.Plane;
    planeIntersect: THREE.Vector3;
    offset: THREE.Vector3;
    history: Array<{ pos: THREE.Vector3; time: number }>;
  }>({
    isGrabbing3D: false,
    targetType: null,
    targetObj: null,
    dragPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    planeIntersect: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    history: []
  });

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const leftEyeRef = useRef<THREE.Group | null>(null);
  const rightEyeRef = useRef<THREE.Group | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const leftArmGroupRef = useRef<THREE.Group | null>(null);
  const rightArmGroupRef = useRef<THREE.Group | null>(null);
  const leftLegGroupRef = useRef<THREE.Group | null>(null);
  const rightLegGroupRef = useRef<THREE.Group | null>(null);
  const leftWingRef = useRef<THREE.Group | null>(null);
  const rightWingRef = useRef<THREE.Group | null>(null);
  const tailGroupRef = useRef<THREE.Group | null>(null);
  const tailFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const ahogeStarRef = useRef<THREE.Group | null>(null);
  const babyStarletRef = useRef<THREE.Group | null>(null);
  const haloRingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});
  const lastFootstepCycleRef = useRef<number>(0);
  
  const mousePosRef = useRef<{ x: number; y: number; isDown: boolean; startX: number; rotY: number }>({
    x: 0,
    y: 0,
    isDown: false,
    startX: 0,
    rotY: 0
  });

  const gestureTargetRef = useRef<MascotHandGesture>('idle');
  gestureTargetRef.current = currentGesture;

  const lastSpokenTimeRef = useRef<number>(0);
  // Speak companion voice with spam protection cooldown (minimum 4.5s between speeches)
  const speakCompanionVoice = useCallback((text: string, force = false) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const now = Date.now();
    if (!force && now - lastSpokenTimeRef.current < 4500) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.pitch = 1.38;
      utterance.rate = 1.06;
      window.speechSynthesis.speak(utterance);
      lastSpokenTimeRef.current = now;
    } catch {}
  }, [isMuted]);

  // =========================================================================
  // 🎨 THREE.JS 5D SCENE INITIALIZATION & CELESTIAL DRAGON CHIBI MESH
  // =========================================================================
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 360;
    const height = mountRef.current.clientHeight || 420;

    // 1. Scene & Camera Setup (Framed for compact, ultra-sharp rendering)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 4.8);
    cameraRef.current = camera;

    // 2. WebGL Renderer with High-Performance Settings & ACES Tone Mapping (Ultra-Sharp 4K Retina)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 3. 5D Dimensional Studio Lighting Rig (Soft Velvet Anime Glow)
    const ambientLight = new THREE.AmbientLight(0xfff5ed, 1.8);
    scene.add(ambientLight);

    const keySunLight = new THREE.DirectionalLight(0xffedd5, 2.8);
    keySunLight.position.set(3.5, 5.5, 4.5);
    keySunLight.castShadow = true;
    keySunLight.shadow.mapSize.width = 2048;
    keySunLight.shadow.mapSize.height = 2048;
    keySunLight.shadow.bias = -0.0001;
    scene.add(keySunLight);

    const rimGoldLight = new THREE.DirectionalLight(0xfbbf24, 2.4);
    rimGoldLight.position.set(-3.5, 3.5, -3.5);
    scene.add(rimGoldLight);

    const softPeachFill = new THREE.PointLight(0xffd1dc, 1.6, 12);
    softPeachFill.position.set(0, -0.8, 3.5);
    scene.add(softPeachFill);

    const headHaloPointLight = new THREE.PointLight(0xfde047, 2.0, 8);
    headHaloPointLight.position.set(0, 1.6, 0.8);
    scene.add(headHaloPointLight);

    // 4. Ultra-Detailed Materials Library - Cute Porcelain Mochi Skin
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfff8f4,
      roughness: 0.18,
      metalness: 0.0,
      clearcoat: 0.42,
      clearcoatRoughness: 0.1,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xffb3c6),
      sheenRoughness: 0.25,
      reflectivity: 0.3
    });
    materialsRef.current['skin'] = skinMaterial;

    const goldHornMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.85
    });
    materialsRef.current['horn'] = goldHornMaterial;

    const robeMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.15
    });
    materialsRef.current['robe'] = robeMaterial;

    const robeAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.75
    });
    materialsRef.current['robe_accent'] = robeAccentMaterial;

    const crystalWingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.75,
      opacity: 0.9,
      transparent: true,
      ior: 1.5
    });
    materialsRef.current['wing'] = crystalWingMaterial;

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x271911,
      roughness: 0.35,
      metalness: 0.08
    });
    materialsRef.current['hair'] = hairMaterial;

    const haloMaterial = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    materialsRef.current['halo'] = haloMaterial;

    const tailFlameMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.1
    });
    materialsRef.current['tail_flame'] = tailFlameMaterial;

    // Anime Eye Materials
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisGradientMaterial = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.08,
      metalness: 0.2
    });
    materialsRef.current['iris'] = irisGradientMaterial;

    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x050814 });
    const eyeHighlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blushMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b8b,
      transparent: true,
      opacity: 0.68
    });
    const blushGlintMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });
    const pawPadMaterial = new THREE.MeshStandardMaterial({
      color: 0xff758f,
      roughness: 0.2,
      metalness: 0.05
    });

    // 5. Build ONE Central Character Hierarchy Group
    const characterGroup = new THREE.Group();
    characterGroupRef.current = characterGroup;
    scene.add(characterGroup);

    // 🌟 Register Mascot Body to Spatial Physics Engine
    spatialPhysics.mascot.mesh = characterGroup;
    spatialPhysics.mascot.pos.set(0, 0, 0);
    spatialPhysics.mascot.vel.set(0, 0, 0);
    spatialPhysics.mascot.isPhysicsActive = isPetPhysicsFree;
    spatialPhysics.gravityPreset = gravityPreset;

    spatialPhysics.onCollisionCallback = (type: string, intensity: number) => {
      if (type === 'mascot_hit' || type === 'mascot_floor') {
        if (!isMuted && intensity > 0.8) {
          try { morningAudio.triggerPetPurr(); } catch {}
        }
      }
    };

    // Ground Soft Glowing Shadow Ring
    const shadowGeo = new THREE.RingGeometry(0.2, 1.4, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.48;
    characterGroup.add(groundShadow);

    // --- 🌟 TORSO & CELESTIAL CYBER ROBE ---
    const torsoGroup = new THREE.Group();
    characterGroup.add(torsoGroup);

    // Main Chibi Body/Robe (Cute rounded bell shape)
    const bodyGeo = new THREE.CylinderGeometry(0.42, 0.64, 0.88, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, robeMaterial);
    bodyMesh.position.y = -0.32;
    bodyMesh.castShadow = true;
    torsoGroup.add(bodyMesh);

    // Golden Dragon Collar & Royal Choker
    const collarGeo = new THREE.TorusGeometry(0.28, 0.055, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeo, robeAccentMaterial);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = 0.14;
    torsoGroup.add(collarMesh);

    // Glowing Heart/Star Talisman on Chest
    const chestGemGeo = new THREE.OctahedronGeometry(0.1, 0);
    const chestGemMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9
    });
    const chestGem = new THREE.Mesh(chestGemGeo, chestGemMat);
    chestGem.position.set(0, 0.02, 0.48);
    chestGem.rotation.z = Math.PI / 4;
    torsoGroup.add(chestGem);

    // Dragon Robe Bottom Golden Trim
    const bottomTrimGeo = new THREE.TorusGeometry(0.63, 0.035, 16, 32);
    const bottomTrimMesh = new THREE.Mesh(bottomTrimGeo, robeAccentMaterial);
    bottomTrimMesh.rotation.x = Math.PI / 2;
    bottomTrimMesh.position.y = -0.74;
    torsoGroup.add(bottomTrimMesh);

    // --- CUTE CHIBI ARTICULATED LEGS & BOOTS (Pivoted for Walking Stride) ---
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 24);
    const bootGeo = new THREE.SphereGeometry(0.16, 24, 16);
    bootGeo.scale(1, 0.8, 1.4);

    // Left Leg Group (Hip pivot)
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.22, -0.65, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, robeMaterial);
    leftLegMesh.position.set(0, -0.27, 0);
    leftLegGroup.add(leftLegMesh);

    const leftBoot = new THREE.Mesh(bootGeo, robeAccentMaterial);
    leftBoot.position.set(0, -0.57, 0.08);
    leftLegGroup.add(leftBoot);

    torsoGroup.add(leftLegGroup);
    leftLegGroupRef.current = leftLegGroup;

    // Right Leg Group (Hip pivot)
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.22, -0.65, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, robeMaterial);
    rightLegMesh.position.set(0, -0.27, 0);
    rightLegGroup.add(rightLegMesh);

    const rightBoot = new THREE.Mesh(bootGeo, robeAccentMaterial);
    rightBoot.position.set(0, -0.57, 0.08);
    rightLegGroup.add(rightBoot);

    torsoGroup.add(rightLegGroup);
    rightLegGroupRef.current = rightLegGroup;

    // --- 🌟 CRYSTAL DRAGON WINGS (ON BACK) ---
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-0.35, 0.05, -0.32);
    torsoGroup.add(leftWingGroup);
    leftWingRef.current = leftWingGroup;

    const wingBone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.65, 12), robeAccentMaterial);
    wingBone1.rotation.z = -0.65;
    wingBone1.position.set(-0.25, 0.2, 0);
    leftWingGroup.add(wingBone1);

    const wingFeatherGeo = new THREE.ConeGeometry(0.22, 0.65, 4);
    wingFeatherGeo.rotateZ(Math.PI / 2 + 0.3);
    const leftWingFeather = new THREE.Mesh(wingFeatherGeo, crystalWingMaterial);
    leftWingFeather.position.set(-0.32, 0.15, 0);
    leftWingFeather.scale.set(0.6, 1, 0.1);
    leftWingGroup.add(leftWingFeather);

    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.35, 0.05, -0.32);
    torsoGroup.add(rightWingGroup);
    rightWingRef.current = rightWingGroup;

    const wingBone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.65, 12), robeAccentMaterial);
    wingBone2.rotation.z = 0.65;
    wingBone2.position.set(0.25, 0.2, 0);
    rightWingGroup.add(wingBone2);

    const rightWingFeather = new THREE.Mesh(wingFeatherGeo, crystalWingMaterial);
    rightWingFeather.rotation.y = Math.PI;
    rightWingFeather.position.set(0.32, 0.15, 0);
    rightWingFeather.scale.set(0.6, 1, 0.1);
    rightWingGroup.add(rightWingFeather);

    // --- 🌟 GOLDEN PLASMA DRAGON TAIL ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.62, -0.35);
    torsoGroup.add(tailGroup);
    tailGroupRef.current = tailGroup;

    const tailGeo = new THREE.TorusGeometry(0.42, 0.09, 16, 24, Math.PI * 0.85);
    const tailMesh = new THREE.Mesh(tailGeo, robeAccentMaterial);
    tailMesh.rotation.y = Math.PI / 2;
    tailMesh.rotation.x = 0.4;
    tailGroup.add(tailMesh);

    const tailFlameGeo = new THREE.ConeGeometry(0.16, 0.45, 16);
    tailFlameGeo.rotateX(Math.PI / 2);
    const tailFlameMesh = new THREE.Mesh(tailFlameGeo, tailFlameMaterial);
    tailFlameMesh.position.set(0, 0.18, -0.68);
    tailGroup.add(tailFlameMesh);
    tailFlameMeshRef.current = tailFlameMesh;

    // --- 🌟 ARMS & CUTE CHIBI PAWS ---
    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.06, 0);
    torsoGroup.add(leftArmGroup);
    leftArmGroupRef.current = leftArmGroup;

    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.38, 24), robeMaterial);
    leftSleeve.position.y = -0.15;
    leftArmGroup.add(leftSleeve);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), skinMaterial);
    leftHand.position.y = -0.38;
    leftArmGroup.add(leftHand);

    // Pink Paw Pad (Soft Strawberry Jelly)
    const pawPad = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), pawPadMaterial);
    pawPad.position.set(0, -0.38, 0.115);
    leftArmGroup.add(pawPad);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.48, 0.06, 0);
    torsoGroup.add(rightArmGroup);
    rightArmGroupRef.current = rightArmGroup;

    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.38, 24), robeMaterial);
    rightSleeve.position.y = -0.15;
    rightArmGroup.add(rightSleeve);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), skinMaterial);
    rightHand.position.y = -0.38;
    rightArmGroup.add(rightHand);

    const rightPawPad = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), pawPadMaterial);
    rightPawPad.position.set(0, -0.38, 0.115);
    rightArmGroup.add(rightPawPad);

    // --- 🌟 5D CHIBI HEAD HIERARCHY (ULTRA-CUTE 64-POLY MOCHI SKIN) ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.68, 0);
    characterGroup.add(headGroup);
    headGroupRef.current = headGroup;

    // Main Chibi Head (Chubby, smooth, kawaii porcelain mochi proportions)
    const headGeo = new THREE.SphereGeometry(0.74, 64, 64);
    headGeo.scale(1.03, 0.95, 0.99);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 🌟 GOLDEN CRYSTALLINE DRAGON HORNS (Left & Right - 32-Poly Faceted Gem)
    const hornGeo = new THREE.ConeGeometry(0.14, 0.72, 32);
    hornGeo.translate(0, 0.36, 0);

    const leftHornGroup = new THREE.Group();
    leftHornGroup.position.set(-0.42, 0.65, -0.05);
    leftHornGroup.rotation.z = 0.55;
    leftHornGroup.rotation.x = -0.35;
    headGroup.add(leftHornGroup);

    const leftHornMesh = new THREE.Mesh(hornGeo, goldHornMaterial);
    leftHornGroup.add(leftHornMesh);

    // Sub-horn branch
    const subHornGeo = new THREE.ConeGeometry(0.08, 0.38, 24);
    subHornGeo.translate(0, 0.19, 0);
    const leftSubHorn = new THREE.Mesh(subHornGeo, goldHornMaterial);
    leftSubHorn.position.set(-0.06, 0.25, 0.05);
    leftSubHorn.rotation.z = -0.65;
    leftHornGroup.add(leftSubHorn);

    const rightHornGroup = new THREE.Group();
    rightHornGroup.position.set(0.42, 0.65, -0.05);
    rightHornGroup.rotation.z = -0.55;
    rightHornGroup.rotation.x = -0.35;
    headGroup.add(rightHornGroup);

    const rightHornMesh = new THREE.Mesh(hornGeo, goldHornMaterial);
    rightHornGroup.add(rightHornMesh);

    const rightSubHorn = new THREE.Mesh(subHornGeo, goldHornMaterial);
    rightSubHorn.position.set(0.06, 0.25, 0.05);
    rightSubHorn.rotation.z = 0.65;
    rightHornGroup.add(rightSubHorn);

    // 🌟 FLUFFY DRAGON WINGED EARS (Soft Pink Velvet Lining)
    const earGeo = new THREE.ConeGeometry(0.2, 0.48, 32);
    earGeo.scale(1, 0.45, 1);

    const leftEar = new THREE.Mesh(earGeo, skinMaterial);
    leftEar.position.set(-0.68, 0.12, -0.08);
    leftEar.rotation.z = 1.35;
    leftEar.rotation.y = 0.4;
    headGroup.add(leftEar);

    const leftEarInner = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), blushMaterial);
    leftEarInner.position.set(-0.72, 0.12, -0.015);
    leftEarInner.rotation.y = -Math.PI / 2.5;
    headGroup.add(leftEarInner);

    const rightEar = new THREE.Mesh(earGeo, skinMaterial);
    rightEar.position.set(0.68, 0.12, -0.08);
    rightEar.rotation.z = -1.35;
    rightEar.rotation.y = -0.4;
    headGroup.add(rightEar);

    const rightEarInner = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), blushMaterial);
    rightEarInner.position.set(0.72, 0.12, -0.015);
    rightEarInner.rotation.y = Math.PI / 2.5;
    headGroup.add(rightEarInner);

    // 🌟 STAR AHOGE (ĂNG-TEN NGÔI SAO TRÊN ĐỈNH ĐẦU)
    const ahogeGroup = new THREE.Group();
    ahogeGroup.position.set(0, 0.72, 0.1);
    headGroup.add(ahogeGroup);
    ahogeStarRef.current = ahogeGroup;

    const ahogeStemGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.45, 16);
    const ahogeStem = new THREE.Mesh(ahogeStemGeo, hairMaterial);
    ahogeStem.rotation.z = 0.35;
    ahogeStem.position.set(0.08, 0.2, 0);
    ahogeGroup.add(ahogeStem);

    const starOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), goldHornMaterial);
    starOrb.position.set(0.18, 0.4, 0);
    ahogeGroup.add(starOrb);

    // 🌟 SILKY LAYERED CHIBI HAIR
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    const backHairGeo = new THREE.SphereGeometry(0.78, 48, 48);
    backHairGeo.scale(1.03, 1.05, 1.06);
    const backHair = new THREE.Mesh(backHairGeo, hairMaterial);
    backHair.position.set(0, 0.05, -0.09);
    hairGroup.add(backHair);

    // Front Cute Bangs
    const bangGeo = new THREE.ConeGeometry(0.24, 0.55, 24);
    const bang1 = new THREE.Mesh(bangGeo, hairMaterial);
    bang1.position.set(-0.16, 0.32, 0.68);
    bang1.rotation.x = 0.45;
    bang1.rotation.z = 0.1;
    hairGroup.add(bang1);

    const bang2 = new THREE.Mesh(bangGeo, hairMaterial);
    bang2.position.set(0.16, 0.32, 0.68);
    bang2.rotation.x = 0.45;
    bang2.rotation.z = -0.1;
    hairGroup.add(bang2);

    const centerTuft = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 24), hairMaterial);
    centerTuft.position.set(0, 0.38, 0.72);
    centerTuft.rotation.x = 0.55;
    hairGroup.add(centerTuft);

    // 🌟 ROSY BLUSH CHEEKS & SWEET CAT SMILE (WITH CUTE CHEEK GLINTS)
    const blushGeo = new THREE.CircleGeometry(0.14, 32);
    const leftBlush = new THREE.Mesh(blushGeo, blushMaterial);
    leftBlush.position.set(-0.36, -0.14, 0.69);
    leftBlush.rotation.y = -0.32;
    headGroup.add(leftBlush);

    // Cute Cheek Glint Stars
    const leftGlint1 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), blushGlintMaterial);
    leftGlint1.position.set(-0.33, -0.11, 0.71);
    headGroup.add(leftGlint1);

    const leftGlint2 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 10), blushGlintMaterial);
    leftGlint2.position.set(-0.39, -0.16, 0.70);
    headGroup.add(leftGlint2);

    const rightBlush = new THREE.Mesh(blushGeo, blushMaterial);
    rightBlush.position.set(0.36, -0.14, 0.69);
    rightBlush.rotation.y = 0.32;
    headGroup.add(rightBlush);

    const rightGlint1 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), blushGlintMaterial);
    rightGlint1.position.set(0.33, -0.11, 0.71);
    headGroup.add(rightGlint1);

    const rightGlint2 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 10), blushGlintMaterial);
    rightGlint2.position.set(0.39, -0.16, 0.70);
    headGroup.add(rightGlint2);

    // Cute Chibi Cat Smile `:3` with Strawberry Rose Mouth Accent
    const smileGeo = new THREE.TorusGeometry(0.055, 0.016, 12, 24, Math.PI * 0.92);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x9f1239 });
    const leftSmile = new THREE.Mesh(smileGeo, smileMat);
    leftSmile.position.set(-0.045, -0.21, 0.715);
    leftSmile.rotation.x = Math.PI;
    leftSmile.rotation.z = -0.15;
    headGroup.add(leftSmile);

    const rightSmile = new THREE.Mesh(smileGeo, smileMat);
    rightSmile.position.set(0.045, -0.21, 0.715);
    rightSmile.rotation.x = Math.PI;
    rightSmile.rotation.z = 0.15;
    headGroup.add(rightSmile);

    // Cute Tiny Tongue/Inner Rose Accent
    const tongueGeo = new THREE.SphereGeometry(0.024, 16, 16);
    tongueGeo.scale(1.2, 0.8, 0.6);
    const tongueMesh = new THREE.Mesh(tongueGeo, pawPadMaterial);
    tongueMesh.position.set(0, -0.23, 0.712);
    headGroup.add(tongueMesh);

    // 🌟 SPARKLING ANIME LEFT EYE (48-POLY NEBULA IRIS & QUADRUPLE GLEAM)
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.25, 0.02, 0.68);
    headGroup.add(leftEyeGroup);
    leftEyeRef.current = leftEyeGroup;

    const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 32, 32);
    eyeWhiteGeo.scale(1, 1.22, 0.35);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    leftEyeGroup.add(leftEyeWhite);

    const irisGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 48);
    irisGeo.rotateX(Math.PI / 2);
    const leftIris = new THREE.Mesh(irisGeo, irisGradientMaterial);
    leftIris.position.z = 0.05;
    leftEyeGroup.add(leftIris);

    const pupilGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 32);
    pupilGeo.rotateX(Math.PI / 2);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
    leftPupil.position.z = 0.06;
    leftEyeGroup.add(leftPupil);

    // Quadruple Specular Anime Sparkles
    const sparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), eyeHighlightMaterial);
    sparkle1.position.set(0.035, 0.045, 0.08);
    leftEyeGroup.add(sparkle1);

    const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 14), eyeHighlightMaterial);
    sparkle2.position.set(-0.035, -0.03, 0.08);
    leftEyeGroup.add(sparkle2);

    const sparkle3 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), eyeHighlightMaterial);
    sparkle3.position.set(0.02, -0.04, 0.08);
    leftEyeGroup.add(sparkle3);

    const sparkle4 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), eyeHighlightMaterial);
    sparkle4.position.set(-0.02, 0.035, 0.08);
    leftEyeGroup.add(sparkle4);

    // Upper Eyelash
    const lashGeo = new THREE.TorusGeometry(0.16, 0.024, 12, 32, Math.PI * 0.78);
    const eyelashMesh = new THREE.Mesh(lashGeo, new THREE.MeshBasicMaterial({ color: 0x18181b }));
    eyelashMesh.rotation.z = Math.PI * 0.11;
    eyelashMesh.position.set(0, 0.09, 0.06);
    leftEyeGroup.add(eyelashMesh);

    // Left Animated Eyelid
    const eyelidGeo = new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    eyelidGeo.scale(1, 1.22, 0.4);
    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
    leftEyelid.position.set(0, 0.04, 0.02);
    leftEyelid.rotation.x = -Math.PI * 0.48; // Open
    leftEyeGroup.add(leftEyelid);
    leftEyelidRef.current = leftEyelid;

    // 🌟 SPARKLING ANIME RIGHT EYE
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.25, 0.02, 0.68);
    headGroup.add(rightEyeGroup);
    rightEyeRef.current = rightEyeGroup;

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    rightEyeGroup.add(rightEyeWhite);

    const rightIris = new THREE.Mesh(irisGeo, irisGradientMaterial);
    rightIris.position.z = 0.05;
    rightEyeGroup.add(rightIris);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMaterial);
    rightPupil.position.z = 0.06;
    rightEyeGroup.add(rightPupil);

    const rightSparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), eyeHighlightMaterial);
    rightSparkle1.position.set(0.035, 0.045, 0.08);
    rightEyeGroup.add(rightSparkle1);

    const rightSparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 14), eyeHighlightMaterial);
    rightSparkle2.position.set(-0.035, -0.03, 0.08);
    rightEyeGroup.add(rightSparkle2);

    const rightSparkle3 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), eyeHighlightMaterial);
    rightSparkle3.position.set(0.02, -0.04, 0.08);
    rightEyeGroup.add(rightSparkle3);

    const rightSparkle4 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), eyeHighlightMaterial);
    rightSparkle4.position.set(-0.02, 0.035, 0.08);
    rightEyeGroup.add(rightSparkle4);

    const rightEyelash = new THREE.Mesh(lashGeo, new THREE.MeshBasicMaterial({ color: 0x18181b }));
    rightEyelash.rotation.z = -Math.PI * 0.89;
    rightEyelash.position.set(0, 0.09, 0.06);
    rightEyeGroup.add(rightEyelash);

    const rightEyelid = new THREE.Mesh(eyelidGeo, skinMaterial);
    rightEyelid.position.set(0, 0.04, 0.02);
    rightEyelid.rotation.x = -Math.PI * 0.48; // Open
    rightEyeGroup.add(rightEyelid);
    rightEyelidRef.current = rightEyelid;

    // 🌟 5D QUANTUM LIGHT HALO (VÒNG HÀO QUANG ĐA SẮC QUANH ĐẦU)
    const haloGeo = new THREE.TorusGeometry(0.85, 0.035, 16, 48);
    const haloMesh = new THREE.Mesh(haloGeo, haloMaterial);
    haloMesh.rotation.x = Math.PI / 2.3;
    haloMesh.position.set(0, 0.95, -0.05);
    headGroup.add(haloMesh);
    haloRingRef.current = haloMesh;

    // 🌟 5D BABY STARLET COMPANION (BÉ TINH CẦU HỘ VỆ BAY KÈM)
    const babyGroup = new THREE.Group();
    babyGroup.position.set(0.85, 0.6, 0.3);
    scene.add(babyGroup);
    babyStarletRef.current = babyGroup;

    const babyGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const babyMesh = new THREE.Mesh(babyGeo, goldHornMaterial);
    babyGroup.add(babyMesh);

    // Baby Mini Wings
    const babyWingGeo = new THREE.ConeGeometry(0.08, 0.22, 8);
    babyWingGeo.rotateZ(Math.PI / 2);
    const bWing1 = new THREE.Mesh(babyWingGeo, crystalWingMaterial);
    bWing1.position.set(-0.12, 0.04, 0);
    babyGroup.add(bWing1);

    const bWing2 = new THREE.Mesh(babyWingGeo, crystalWingMaterial);
    bWing2.position.set(0.12, 0.04, 0);
    bWing2.rotation.y = Math.PI;
    babyGroup.add(bWing2);

    // --- 🌟 120 ORBITING 5D QUANTUM STARDUST PARTICLES ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.3 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) + 0.2;
      particlePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // --- 🌟 5D TEMPORAL PHYSICS & RENDER LOOP ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const dt = clock.getDelta();

      // 1. 3D Spatial Physics Simulation Step (Realistic Gravity & Multi-body Collisions)
      spatialPhysics.update(dt || 0.016);

      // Biological Breathing (4D)
      const breathScale = 1 + Math.sin(elapsedTime * 3.6) * 0.015;

      // When Pet is in hover mode (not in free gravity toss mode and not being grabbed), float gently
      if (!spatialPhysics.mascot.isPhysicsActive && !spatialPhysics.mascot.isGrabbed && characterGroupRef.current) {
        const hoverY = Math.sin(elapsedTime * 2.4) * 0.05;
        characterGroupRef.current.position.set(0, hoverY, 0);
        spatialPhysics.mascot.pos.set(0, hoverY, 0);
        spatialPhysics.mascot.vel.set(0, 0, 0);
      }

      // Safety Clamp & Auto-Recovery: guarantee characterGroup never drifts out of camera view or has NaN
      if (characterGroupRef.current) {
        const p = characterGroupRef.current.position;
        if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z) || Math.abs(p.x) > 1.2 || Math.abs(p.y) > 1.2 || Math.abs(p.z) > 0.9) {
          p.set(0, 0, 0);
          spatialPhysics.mascot.pos.set(0, 0, 0);
          spatialPhysics.mascot.vel.set(0, 0, 0);
        }
      }

      // Squash and stretch deformation on impact & breath scaling
      if (characterGroupRef.current) {
        const sq = spatialPhysics.mascot.squash;
        characterGroupRef.current.scale.set(sq.x, sq.y, sq.z);
        torsoGroup.scale.set(breathScale, breathScale, breathScale);
      }

      // 2. Parallax Gaze Tracking for Head & Eyes
      const targetHeadRotY = mousePosRef.current.x * 0.32 + (mousePosRef.current.rotY || 0);
      const targetHeadRotX = -mousePosRef.current.y * 0.2;

      if (headGroupRef.current) {
        headGroupRef.current.rotation.y += (targetHeadRotY - headGroupRef.current.rotation.y) * 0.09;
        headGroupRef.current.rotation.x += (targetHeadRotX - headGroupRef.current.rotation.x) * 0.09;
      }

      if (leftEyeRef.current) {
        leftEyeRef.current.position.x = -0.25 + mousePosRef.current.x * 0.025;
        leftEyeRef.current.position.y = 0.02 - mousePosRef.current.y * 0.018;
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.position.x = 0.25 + mousePosRef.current.x * 0.025;
        rightEyeRef.current.position.y = 0.02 - mousePosRef.current.y * 0.018;
      }

      // 3. Fluid Ahoge, Horns, Wings & Tail Sway
      const wingFlap = Math.sin(elapsedTime * 5.2) * 0.28;
      if (leftWingRef.current && rightWingRef.current) {
        leftWingRef.current.rotation.y = -wingFlap;
        rightWingRef.current.rotation.y = wingFlap;
      }

      const tailWag = Math.sin(elapsedTime * 3.2) * 0.35;
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.y = tailWag;
      }
      if (tailFlameMeshRef.current) {
        const flamePulse = 1 + Math.sin(elapsedTime * 12) * 0.15;
        tailFlameMeshRef.current.scale.set(flamePulse, flamePulse, flamePulse);
      }

      if (ahogeStarRef.current) {
        ahogeStarRef.current.rotation.z = Math.sin(elapsedTime * 3.8) * 0.18;
      }

      // 4. Baby Starlet Orbiting Companion
      if (babyStarletRef.current) {
        const orbitRadius = 1.1;
        const orbitSpeed = elapsedTime * 1.8;
        babyStarletRef.current.position.x = Math.cos(orbitSpeed) * orbitRadius;
        babyStarletRef.current.position.z = Math.sin(orbitSpeed) * orbitRadius * 0.7 + 0.2;
        babyStarletRef.current.position.y = 0.65 + Math.sin(elapsedTime * 3) * 0.15;
        babyStarletRef.current.rotation.y = -orbitSpeed;
      }

      // 5. Halo Ring 5D Luminescent Rotation
      if (haloRingRef.current) {
        haloRingRef.current.rotation.z = elapsedTime * 0.45;
      }

      // 6. Gesture Skeletal Interpolations & Dynamic Walking Engine
      const gesture = gestureTargetRef.current;
      
      // Articulated Leg Movement (Walking vs Running vs Idle)
      if (leftLegGroupRef.current && rightLegGroupRef.current) {
        if (gesture === 'walking') {
          const walkSpeed = 8.5;
          const walkSin = Math.sin(elapsedTime * walkSpeed);
          leftLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftLegGroupRef.current.rotation.x, walkSin * 0.75, 0.28);
          rightLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightLegGroupRef.current.rotation.x, -walkSin * 0.75, 0.28);

          // Audio Footstep rhythm trigger (Walking)
          const currentStep = Math.floor(elapsedTime * (walkSpeed / Math.PI));
          if (currentStep !== lastFootstepCycleRef.current) {
            lastFootstepCycleRef.current = currentStep;
            if (!isMuted) {
              try {
                morningAudio.triggerCuteFootstep(currentStep % 2 === 0);
              } catch {}
            }
          }
        } else if (gesture === 'running') {
          const runSpeed = 17.5;
          const runSin = Math.sin(elapsedTime * runSpeed);
          leftLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftLegGroupRef.current.rotation.x, runSin * 1.35, 0.35);
          rightLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightLegGroupRef.current.rotation.x, -runSin * 1.35, 0.35);

          // Rapid Sprint Footsteps
          const currentStep = Math.floor(elapsedTime * (runSpeed / Math.PI));
          if (currentStep !== lastFootstepCycleRef.current) {
            lastFootstepCycleRef.current = currentStep;
            if (!isMuted) {
              try {
                morningAudio.triggerCuteFootstep(currentStep % 2 === 0);
              } catch {}
            }
          }
        } else {
          leftLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftLegGroupRef.current.rotation.x, 0, 0.15);
          rightLegGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightLegGroupRef.current.rotation.x, 0, 0.15);
        }
      }

      if (leftArmGroupRef.current && rightArmGroupRef.current) {
        if (gesture === 'walking') {
          const walkSpeed = 8.5;
          const walkSin = Math.sin(elapsedTime * walkSpeed);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, -walkSin * 0.6, 0.28);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, walkSin * 0.6, 0.28);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.3, 0.15);
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.3, 0.15);
          if (headGroupRef.current) {
            headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, Math.sin(elapsedTime * walkSpeed * 0.5) * 0.08, 0.2);
            headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, 0, 0.15);
          }
          if (characterGroupRef.current && !spatialPhysics.mascot.isGrabbed && !spatialPhysics.mascot.isPhysicsActive) {
            characterGroupRef.current.rotation.x = THREE.MathUtils.lerp(characterGroupRef.current.rotation.x, -0.05, 0.2);
          }
        } else if (gesture === 'running') {
          const runSpeed = 17.5;
          const runSin = Math.sin(elapsedTime * runSpeed);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, -runSin * 1.15, 0.35);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, runSin * 1.15, 0.35);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.42, 0.2);
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.42, 0.2);
          if (headGroupRef.current) {
            headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, Math.sin(elapsedTime * runSpeed * 0.5) * 0.12, 0.25);
            headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, 0.18, 0.2);
          }
          if (characterGroupRef.current && !spatialPhysics.mascot.isGrabbed && !spatialPhysics.mascot.isPhysicsActive) {
            // Leaning forward while sprinting
            characterGroupRef.current.rotation.x = THREE.MathUtils.lerp(characterGroupRef.current.rotation.x, -0.24, 0.25);
            characterGroupRef.current.position.y = THREE.MathUtils.lerp(characterGroupRef.current.position.y, Math.abs(Math.sin(elapsedTime * runSpeed)) * 0.12, 0.3);
          }
        } else if (gesture === 'dance_jump') {
          const danceSpeed = 10.5;
          const jumpSin = Math.abs(Math.sin(elapsedTime * danceSpeed));
          const swayCos = Math.cos(elapsedTime * (danceSpeed * 0.5));
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -1.8 + swayCos * 0.5, 0.25);
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 1.8 + swayCos * 0.5, 0.25);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.5, 0.2);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0.5, 0.2);
          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = Math.sin(elapsedTime * danceSpeed) * 0.6;
            rightLegGroupRef.current.rotation.x = -Math.sin(elapsedTime * danceSpeed) * 0.6;
          }
          if (headGroupRef.current) {
            headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, swayCos * 0.25, 0.25);
          }
          if (characterGroupRef.current && !spatialPhysics.mascot.isGrabbed && !spatialPhysics.mascot.isPhysicsActive) {
            characterGroupRef.current.position.y = THREE.MathUtils.lerp(characterGroupRef.current.position.y, jumpSin * 0.18, 0.25);
            characterGroupRef.current.rotation.y = THREE.MathUtils.lerp(characterGroupRef.current.rotation.y, swayCos * 0.35, 0.2);
          }
        } else if (gesture === 'shy_blush') {
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.65, 0.15);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 1.6, 0.15);
          leftArmGroupRef.current.rotation.y = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.y, -0.45, 0.15);
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.65, 0.15);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 1.6, 0.15);
          rightArmGroupRef.current.rotation.y = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.y, 0.45, 0.15);
          if (headGroupRef.current) {
            headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, -0.15, 0.12);
            headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, 0.18, 0.12);
          }
        } else if (gesture === 'v_sign') {
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 2.1, 0.12);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0.6, 0.12);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.35, 0.1);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.1, 0.1);
        } else if (gesture === 'reach_hand') {
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 1.45, 0.14);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, 0.22, 0.14);
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.35, 0.1);
        } else if (gesture === 'wave') {
          const waveRot = Math.sin(elapsedTime * 9) * 0.45 + 1.8;
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -waveRot, 0.22);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.25, 0.12);
        } else if (gesture === 'dragon_power') {
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 1.6, 0.18);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -1.6, 0.18);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0.6, 0.18);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.6, 0.18);
        } else if (gesture === 'zen_float') {
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.9, 0.1);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.9, 0.1);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0.4, 0.1);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.4, 0.1);
        } else if (gesture === 'petting') {
          if (headGroupRef.current) {
            headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, 0.28, 0.12);
          }
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.65, 0.12);
        } else if (gesture === 'heart') {
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 1.25, 0.12);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -1.25, 0.12);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0.7, 0.12);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0.7, 0.12);
        } else {
          rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.18 + Math.sin(elapsedTime * 2.2) * 0.05, 0.08);
          rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(rightArmGroupRef.current.rotation.x, 0, 0.08);
          leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.18 - Math.sin(elapsedTime * 2.2) * 0.05, 0.08);
          leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(leftArmGroupRef.current.rotation.x, 0, 0.08);
        }
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.18;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Natural Eyelid Blinking Loop (Randomized for cute life-like feel)
    const blinkInterval = setInterval(() => {
      if (leftEyelidRef.current && rightEyelidRef.current) {
        leftEyelidRef.current.rotation.x = 0; // Closed
        if (gestureTargetRef.current !== 'v_sign') {
          rightEyelidRef.current.rotation.x = 0; // Closed
        }
        setTimeout(() => {
          if (leftEyelidRef.current) leftEyelidRef.current.rotation.x = -Math.PI * 0.48; // Open
          if (rightEyelidRef.current && gestureTargetRef.current !== 'v_sign') {
            rightEyelidRef.current.rotation.x = -Math.PI * 0.48; // Open
          }
        }, 130);
      }
    }, 3600);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(blinkInterval);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 5D Elemental Form Materials Dynamically
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats['horn'] || !mats['robe'] || !mats['robe_accent'] || !mats['wing'] || !mats['halo'] || !mats['iris']) return;

    if (mascotForm === 'cosmic_galaxy') {
      (mats['horn'] as THREE.MeshStandardMaterial).color.setHex(0x818cf8);
      (mats['horn'] as THREE.MeshStandardMaterial).emissive.setHex(0x4338ca);
      (mats['robe'] as THREE.MeshStandardMaterial).color.setHex(0x0f172a);
      (mats['robe_accent'] as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
      (mats['wing'] as THREE.MeshPhysicalMaterial).color.setHex(0x818cf8);
      (mats['wing'] as THREE.MeshPhysicalMaterial).emissive.setHex(0x6366f1);
      (mats['halo'] as THREE.MeshStandardMaterial).color.setHex(0xc084fc);
      (mats['halo'] as THREE.MeshStandardMaterial).emissive.setHex(0x9333ea);
      (mats['iris'] as THREE.MeshStandardMaterial).color.setHex(0x818cf8);
      (mats['iris'] as THREE.MeshStandardMaterial).emissive.setHex(0x4338ca);
    } else if (mascotForm === 'frost_crystal') {
      (mats['horn'] as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
      (mats['horn'] as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
      (mats['robe'] as THREE.MeshStandardMaterial).color.setHex(0xf0f9ff);
      (mats['robe_accent'] as THREE.MeshStandardMaterial).color.setHex(0x0284c7);
      (mats['wing'] as THREE.MeshPhysicalMaterial).color.setHex(0xbae6fd);
      (mats['wing'] as THREE.MeshPhysicalMaterial).emissive.setHex(0x38bdf8);
      (mats['halo'] as THREE.MeshStandardMaterial).color.setHex(0xe0f2fe);
      (mats['halo'] as THREE.MeshStandardMaterial).emissive.setHex(0x0284c7);
      (mats['iris'] as THREE.MeshStandardMaterial).color.setHex(0x06b6d4);
      (mats['iris'] as THREE.MeshStandardMaterial).emissive.setHex(0x0891b2);
    } else if (mascotForm === 'sakura_deity') {
      (mats['horn'] as THREE.MeshStandardMaterial).color.setHex(0xf472b6);
      (mats['horn'] as THREE.MeshStandardMaterial).emissive.setHex(0xdb2777);
      (mats['robe'] as THREE.MeshStandardMaterial).color.setHex(0xfff1f2);
      (mats['robe_accent'] as THREE.MeshStandardMaterial).color.setHex(0xf43f5e);
      (mats['wing'] as THREE.MeshPhysicalMaterial).color.setHex(0xfbcfe8);
      (mats['wing'] as THREE.MeshPhysicalMaterial).emissive.setHex(0xf472b6);
      (mats['halo'] as THREE.MeshStandardMaterial).color.setHex(0xfda4af);
      (mats['halo'] as THREE.MeshStandardMaterial).emissive.setHex(0xe11d48);
      (mats['iris'] as THREE.MeshStandardMaterial).color.setHex(0xec4899);
      (mats['iris'] as THREE.MeshStandardMaterial).emissive.setHex(0xbe185d);
    } else {
      // Golden Celestial Dragon
      (mats['horn'] as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
      (mats['horn'] as THREE.MeshStandardMaterial).emissive.setHex(0xd97706);
      (mats['robe'] as THREE.MeshStandardMaterial).color.setHex(0x18181b);
      (mats['robe_accent'] as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
      (mats['wing'] as THREE.MeshPhysicalMaterial).color.setHex(0xfef08a);
      (mats['wing'] as THREE.MeshPhysicalMaterial).emissive.setHex(0xeab308);
      (mats['halo'] as THREE.MeshStandardMaterial).color.setHex(0xfde047);
      (mats['halo'] as THREE.MeshStandardMaterial).emissive.setHex(0xf59e0b);
      (mats['iris'] as THREE.MeshStandardMaterial).color.setHex(0x0284c7);
      (mats['iris'] as THREE.MeshStandardMaterial).emissive.setHex(0x0369a1);
    }
  }, [mascotForm]);

  // Sync Physics Properties Dynamically
  useEffect(() => {
    spatialPhysics.gravityPreset = gravityPreset;
  }, [gravityPreset]);

  useEffect(() => {
    spatialPhysics.mascot.isPhysicsActive = isPetPhysicsFree;
  }, [isPetPhysicsFree]);

  // 🌟 3D Pointer Interaction & Raycasting Manipulation (Scoped strictly to mountRef 3D canvas viewport)
  const handlePointerMove = (e: React.PointerEvent) => {
    const mount = mountRef.current;
    if (!mount || !cameraRef.current) return;
    const rect = mount.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    mousePosRef.current.x = THREE.MathUtils.clamp(x, -1, 1);
    mousePosRef.current.y = THREE.MathUtils.clamp(y, -1, 1);

    // 3D Object / Mascot Dragging with physics plane projection
    if (grabStateRef.current.isGrabbing3D) {
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(new THREE.Vector2(mousePosRef.current.x, -mousePosRef.current.y), cameraRef.current);
      const planeIntersect = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(grabStateRef.current.dragPlane, planeIntersect)) {
        const targetPos = planeIntersect.clone().add(grabStateRef.current.offset);
        // Clamp strictly in safe visible 3D bounds
        targetPos.x = THREE.MathUtils.clamp(targetPos.x, -spatialPhysics.bounds.wallX + 0.2, spatialPhysics.bounds.wallX - 0.2);
        targetPos.y = THREE.MathUtils.clamp(targetPos.y, spatialPhysics.bounds.floorY + 0.25, spatialPhysics.bounds.ceilingY - 0.25);
        targetPos.z = THREE.MathUtils.clamp(targetPos.z, spatialPhysics.bounds.farZ, spatialPhysics.bounds.nearZ);

        const now = performance.now();
        grabStateRef.current.history.push({ pos: targetPos.clone(), time: now });
        if (grabStateRef.current.history.length > 6) {
          grabStateRef.current.history.shift();
        }

        if (grabStateRef.current.targetType === 'object' && grabStateRef.current.targetObj) {
          grabStateRef.current.targetObj.pos.copy(targetPos);
          grabStateRef.current.targetObj.mesh.position.copy(targetPos);
        } else if (grabStateRef.current.targetType === 'mascot' && characterGroupRef.current) {
          spatialPhysics.mascot.pos.copy(targetPos);
          characterGroupRef.current.position.copy(targetPos);
        }
      }
      return;
    }

    if (mousePosRef.current.isDown && !isDragging) {
      const deltaX = e.clientX - mousePosRef.current.startX;
      mousePosRef.current.rotY += deltaX * 0.006;
      mousePosRef.current.startX = e.clientX;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const mount = mountRef.current;
    if (!mount || !cameraRef.current || !sceneRef.current) return;
    const rect = mount.getBoundingClientRect();
    if (
      e.clientX < rect.left || 
      e.clientX > rect.right || 
      e.clientY < rect.top || 
      e.clientY > rect.bottom
    ) {
      return;
    }
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    raycasterRef.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

    // 1. Raycast Check on Spawned 3D Objects
    if (spatialPhysics.objects.length > 0) {
      const meshes = spatialPhysics.objects.map(o => o.mesh);
      const hits = raycasterRef.current.intersectObjects(meshes, true);
      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        const targetObj = spatialPhysics.objects.find(o => 
          o.mesh === hitMesh || 
          o.mesh.children.includes(hitMesh) || 
          hitMesh.parent === o.mesh
        );

        if (targetObj) {
          targetObj.isGrabbed = true;
          targetObj.vel.set(0, 0, 0);
          targetObj.angVel.set(0, 0, 0);

          const dragPlane = new THREE.Plane();
          const camDir = cameraRef.current.getWorldDirection(new THREE.Vector3()).negate();
          dragPlane.setFromNormalAndCoplanarPoint(camDir, targetObj.pos);

          const planePoint = new THREE.Vector3();
          raycasterRef.current.ray.intersectPlane(dragPlane, planePoint);
          const offset = new THREE.Vector3().subVectors(targetObj.pos, planePoint);

          grabStateRef.current = {
            isGrabbing3D: true,
            targetType: 'object',
            targetObj,
            dragPlane,
            planeIntersect: planePoint,
            offset,
            history: [{ pos: targetObj.pos.clone(), time: performance.now() }]
          };
          return;
        }
      }
    }

    // 2. Raycast Check on 3D Mascot Character Group
    if (characterGroupRef.current) {
      const mascotHits = raycasterRef.current.intersectObject(characterGroupRef.current, true);
      if (mascotHits.length > 0) {
        spatialPhysics.mascot.isGrabbed = true;
        spatialPhysics.mascot.isPhysicsActive = true;
        setIsPetPhysicsFree(true);
        spatialPhysics.mascot.vel.set(0, 0, 0);
        spatialPhysics.mascot.angVel.set(0, 0, 0);

        const dragPlane = new THREE.Plane();
        const camDir = cameraRef.current.getWorldDirection(new THREE.Vector3()).negate();
        dragPlane.setFromNormalAndCoplanarPoint(camDir, spatialPhysics.mascot.pos);

        const planePoint = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(dragPlane, planePoint);
        const offset = new THREE.Vector3().subVectors(spatialPhysics.mascot.pos, planePoint);

        grabStateRef.current = {
          isGrabbing3D: true,
          targetType: 'mascot',
          targetObj: null,
          dragPlane,
          planeIntersect: planePoint,
          offset,
          history: [{ pos: spatialPhysics.mascot.pos.clone(), time: performance.now() }]
        };

        if (!isMuted) {
          try { morningAudio.triggerPetPurr(); } catch {}
        }
        return;
      }
    }

    mousePosRef.current.isDown = true;
    mousePosRef.current.startX = e.clientX;
  };

  const handlePointerUp = () => {
    // Release 3D Grab and apply fling momentum
    if (grabStateRef.current.isGrabbing3D) {
      const history = grabStateRef.current.history;
      let throwVel = new THREE.Vector3(0, 0, 0);

      if (history.length >= 2) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const dt = Math.max(0.016, (newest.time - oldest.time) / 1000);
        throwVel.subVectors(newest.pos, oldest.pos).divideScalar(dt);
        throwVel.clampLength(0, 16.0);
      }

      if (grabStateRef.current.targetType === 'object' && grabStateRef.current.targetObj) {
        grabStateRef.current.targetObj.isGrabbed = false;
        grabStateRef.current.targetObj.vel.copy(throwVel);
        grabStateRef.current.targetObj.angVel.set(
          throwVel.y * 1.5,
          throwVel.x * -1.5,
          (Math.random() - 0.5) * 6
        );
      } else if (grabStateRef.current.targetType === 'mascot') {
        spatialPhysics.mascot.isGrabbed = false;
        spatialPhysics.mascot.vel.copy(throwVel);
        spatialPhysics.mascot.angVel.set(
          throwVel.y * 0.4,
          (Math.random() - 0.5) * 2,
          -throwVel.x * 0.4
        );
        if (throwVel.length() > 3.5) {
          setSnapshotToast('🚀 Haevy Son 5D tung bay theo quán tính vật lý!');
          setTimeout(() => setSnapshotToast(null), 2000);
          if (!isMuted) {
            try { morningAudio.triggerDragonSparkleBurst(); } catch {}
          }
        }
      }

      grabStateRef.current.isGrabbing3D = false;
      grabStateRef.current.targetType = null;
      grabStateRef.current.targetObj = null;
      grabStateRef.current.history = [];
    }

    mousePosRef.current.isDown = false;
  };

  // =========================================================================
  // 🖐️ FREE DRAGGABLE SCREEN MOVEMENT SYSTEM (WITH SCREEN BOUNDS CLAMPING)
  // =========================================================================
  const handleDragStart = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y
    };
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const maxLimitX = typeof window !== 'undefined' ? Math.max(100, (window.innerWidth / 2) - 100) : 320;
      const maxLimitY = typeof window !== 'undefined' ? Math.max(80, (window.innerHeight / 2) - 120) : 260;

      const nextX = Math.max(-maxLimitX, Math.min(maxLimitX, dragStartRef.current.initialPosX + deltaX));
      const nextY = Math.max(-maxLimitY, Math.min(maxLimitY, dragStartRef.current.initialPosY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging]);

  // Center & Reset Pet Mascot to Screen Center
  const handleResetToCenter = () => {
    setPosition({ x: 0, y: 0 });
    spatialPhysics.resetMascotToCenter();
    setIsPetPhysicsFree(false);
    if (characterGroupRef.current) {
      characterGroupRef.current.position.set(0, 0, 0);
      characterGroupRef.current.rotation.set(0, 0, 0);
    }
    setSnapshotToast('🎯 Haevy Son 5D đã được căn chính giữa màn hình!');
    setTimeout(() => setSnapshotToast(null), 2000);
    if (!isMuted) {
      try { morningAudio.triggerPeaceRainbowChime(); } catch {}
    }
  };

  // Preset Dock Positions
  const setDockPosition = (preset: 'center' | 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left') => {
    if (preset === 'center') {
      handleResetToCenter();
    } else if (preset === 'bottom_right') {
      setPosition({ x: 220, y: 110 });
    } else if (preset === 'bottom_left') {
      setPosition({ x: -220, y: 110 });
    } else if (preset === 'top_right') {
      setPosition({ x: 220, y: -110 });
    } else if (preset === 'top_left') {
      setPosition({ x: -220, y: -110 });
    }
  };

  // Direct 5D Petting & Affection Reaction
  const handlePetCharacter = (e: React.MouseEvent) => {
    if (isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0);
    const y = e.clientY - (rect?.top || 0);

    const newRipple = { id: Date.now(), x, y };
    setTouchRipples(prev => [...prev.slice(-2), newRipple]);
    setTimeout(() => {
      setTouchRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    setAffection(prev => Math.min(100, prev + 1));
    setCurrentGesture('petting');
    setMascotStatusText('🥰 Haevy Son 5D ửng hồng má khi được bạn vuốt ve yêu thương!');

    if (!isMuted) {
      try {
        morningAudio.triggerPetPurr();
        speakCompanionVoice('Hi hi! Cảm giác ấm áp quá à! Haevy Son yêu bạn nhiều lắm!');
      } catch {}
    }
  };

  const lastGestureAudioTimeRef = useRef<number>(0);
  const lastHapticTimeRef = useRef<number>(0);

  // Trigger Gestures with camera vs manual interaction audio throttle, Haptic Feedback & Screen Visuals
  const triggerGesture = useCallback((gesture: MascotHandGesture, fromCamera = false) => {
    const isNewGesture = gesture !== currentGesture;
    setCurrentGesture(gesture);
    const now = performance.now();
    const shouldPlayVoice = !fromCamera || (now - lastGestureAudioTimeRef.current > 5000);

    // 📳 HAPTIC VIBRATION & VISUAL RECOGNITION FEEDBACK (WHEN DETECTED/SWITCHED)
    if (gesture !== 'idle' && (isNewGesture || now - lastHapticTimeRef.current > 1200)) {
      lastHapticTimeRef.current = now;

      // 1. Hardware Haptic Feedback (Vibration API for mobile / tablet devices)
      if (hapticFeedbackEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          if (gesture === 'running' || gesture === 'dragon_power') {
            navigator.vibrate([40, 30, 60]); // Nhịp rung dồn dập
          } else if (gesture === 'walking') {
            navigator.vibrate(25); // Nhịp rung nhẹ nhàng
          } else {
            navigator.vibrate([35, 25, 35]); // Nhịp đôi xác nhận thành công
          }
        } catch {}
      }

      // 2. Subtle Audio Blip Feedback
      if (!isMuted && isNewGesture) {
        try {
          morningAudio.triggerHapticGestureBlip();
        } catch {}
      }

      // 3. Screen Haptic Shake (Nhẹ nhàng tạo cảm giác vật lý sống động)
      setIsHapticShakeActive(true);
      setTimeout(() => setIsHapticShakeActive(false), 420);

      // 4. Dynamic Aura Border Flash & Color Shift
      const colorMap: Record<string, string> = {
        walking: '#10b981',      // Emerald Green
        running: '#06b6d4',      // Cyan Sprint
        v_sign: '#38bdf8',       // Sky Blue
        reach_hand: '#f59e0b',   // Amber Gold
        thumbs_up: '#eab308',    // Yellow Sun
        heart: '#ec4899',        // Pink Love
        wave: '#a855f7',         // Purple Wave
        dragon_power: '#f97316', // Orange Fire
        zen_float: '#6366f1',    // Indigo Zen
        dance_jump: '#14b8a6',   // Teal Dance
        shy_blush: '#f43f5e',    // Rose Blush
        petting: '#fbbf24',      // Warm Amber
      };

      const glowColor = colorMap[gesture] || '#f59e0b';
      setGestureAuraFlash({ active: true, gesture, color: glowColor });
      setTimeout(() => {
        setGestureAuraFlash(null);
      }, 700);
    }

    if (!isMuted && shouldPlayVoice) {
      try {
        if (gesture === 'walking') {
          morningAudio.triggerHaevySonHappy();
          speakCompanionVoice('Haevy Son đang đi bộ cùng bạn nè!');
        } else if (gesture === 'running') {
          morningAudio.triggerOverjoyedTrill();
          speakCompanionVoice('Chạy nhanh thôi nào! Gió vút bên tai sướng quá!');
        } else if (gesture === 'v_sign') {
          morningAudio.triggerPeaceRainbowChime();
          speakCompanionVoice('Làm dáng chữ V nháy mắt cùng tớ nhé!');
        } else if (gesture === 'thumbs_up') {
          morningAudio.triggerThumbsUpChime();
          speakCompanionVoice('Bạn là số một luôn đó!');
        } else if (gesture === 'reach_hand') {
          morningAudio.triggerThumbsUpChime();
          speakCompanionVoice('Chạm tay High-Five 5D siêu đã!');
        } else if (gesture === 'petting') {
          morningAudio.triggerPetPurr();
          speakCompanionVoice('Dụi đầu thích quá đi à!');
        } else if (gesture === 'dance_jump') {
          morningAudio.triggerOverjoyedTrill();
          speakCompanionVoice('Cùng quẩy tưng bừng với Haevy Son nào! Vui ơi là vui!');
        } else if (gesture === 'shy_blush') {
          morningAudio.triggerCuriousChirp();
          speakCompanionVoice('Bạn nhìn tớ làm tớ ngượng chín cả má rồi nè hi hi!');
        } else if (gesture === 'dragon_power') {
          morningAudio.triggerDragonBreathFire();
          speakCompanionVoice('Kim Long Thần Uy! Bứt phá mọi giới hạn!');
        } else if (gesture === 'zen_float') {
          morningAudio.triggerPeaceRainbowChime();
          speakCompanionVoice('Tâm an lạc, hòa mình vào vũ trụ bao la.');
        } else if (gesture === 'heart') {
          morningAudio.triggerPeaceRainbowChime();
          speakCompanionVoice('Gửi triệu triệu trái tim đến bạn nè!');
        } else if (gesture === 'wave') {
          morningAudio.triggerCuriousChirp();
          speakCompanionVoice('Haevy Son 5D xin chào bạn! Ngày mới tràn đầy may mắn nha!');
        }
        lastGestureAudioTimeRef.current = now;
      } catch {}
    }

    switch (gesture) {
      case 'walking':
        setMascotStatusText('🐾 Haevy Son 5D rảo bước chân lon ton theo cử chỉ úp tay của bạn!');
        break;
      case 'running':
        setMascotStatusText('⚡ Haevy Son 5D đang chạy nước rút siêu tốc cùng bạn!');
        break;
      case 'v_sign':
        setMascotStatusText('✌️ Haevy Son 5D làm dáng chữ V nháy mắt 😉 tinh nghịch!');
        break;
      case 'reach_hand':
        setMascotStatusText('✋ Haevy Son đưa tay High-Five 5D phát ra làn sóng lượng tử!');
        break;
      case 'wave':
        setMascotStatusText('👋 Haevy Son mỉm cười vẫy tay chào bạn thật tươi!');
        break;
      case 'dragon_power':
        setMascotStatusText('🐉 Kim Long Thần Uy! Haevy Son tung hào quang bảo hộ dũng sĩ!');
        break;
      case 'zen_float':
        setMascotStatusText('🧘 Haevy Son thiền định lơ lửng, lan tỏa năng lượng bình an!');
        break;
      case 'thumbs_up':
        setMascotStatusText('👍 Haevy Son cổ vũ: Bạn là tuyệt vời nhất!');
        break;
      case 'heart':
        setMascotStatusText('🫶 Haevy Son thả cơn mưa tim siêu tân tinh gửi trọn yêu thương!');
        break;
      case 'petting':
        setMascotStatusText('🥰 Haevy Son thích thú dụi đầu khi bạn vuốt ve!');
        break;
      case 'dance_jump':
        setMascotStatusText('💃 Haevy Son nhảy cẫng lên xoay tròn phấn khích cùng bạn!');
        break;
      case 'shy_blush':
        setMascotStatusText('😳 Haevy Son ngượng ngùng lấy hai tay che mặt đáng yêu!');
        break;
      default:
        setMascotStatusText('✨ Haevy Son 5D đang lơ lửng chờ tương tác cùng bạn');
        break;
    }
  }, [isMuted, currentGesture, hapticFeedbackEnabled, speakCompanionVoice]);

  // Magic Special FX
  const triggerSpecialFX = (fx: string) => {
    setActiveSpecialFX(fx);
    if (!isMuted) {
      try {
        if (fx === 'fire') morningAudio.triggerDragonBreathFire();
        else if (fx === 'lightning') morningAudio.triggerFistLightningSound();
        else if (fx === 'heart') morningAudio.triggerPeaceRainbowChime();
        else if (fx === 'rainbow') morningAudio.triggerDragonSparkleBurst();
      } catch {}
    }
    setTimeout(() => setActiveSpecialFX('none'), 4000);
  };

  // Camera Hand Tracking Engine Loop & Visual Frame Rendering
  useEffect(() => {
    if (!isCameraTracking) {
      handTracking.reset();
      if (handCanvasRef.current) {
        const ctx = handCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, handCanvasRef.current.width, handCanvasRef.current.height);
      }
      setTrackingTelemetry({
        orientation: 'vertical',
        isWalking: false,
        speed: 0,
        gestureName: 'idle'
      });
      return;
    }

    let animFrameId: number;
    let lastWalkingCheck = 0;

    const processTrackingFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = handCanvasRef.current;

        // Perform full hand skeleton & gesture analysis
        const result: HandTrackingResult = handTracking.analyzeVideoFrame(video);

        // Update telemetry
        if (result.detected) {
          setTrackingTelemetry({
            orientation: result.palmOrientation,
            isWalking: result.isFingerWalking,
            speed: Math.round(result.walkingSpeed * 100),
            gestureName: result.gesture
          });
        } else {
          setTrackingTelemetry({
            orientation: 'vertical',
            isWalking: false,
            speed: 0,
            gestureName: 'idle'
          });
        }

        // Draw Cyber Skeleton Frame HUD on Canvas (guaranteed frame clearing)
        if (canvas && showHandSkeleton) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }
          const ctx = canvas.getContext('2d');
          if (ctx) {
            handTracking.drawCyberSkeletonOverlay(ctx, result, canvas.width, canvas.height, true);
          }
        } else if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Automatic gesture triggering based on recognized hand poses (with camera throttle)
        const now = performance.now();
        if (result.gesture === 'running' || result.isFingerRunning) {
          if (gestureTargetRef.current !== 'running') {
            triggerGesture('running', true);
          }
          lastWalkingCheck = now;
        } else if (result.gesture === 'walking' || result.isFingerWalking) {
          if (gestureTargetRef.current !== 'walking') {
            triggerGesture('walking', true);
          }
          lastWalkingCheck = now;
        } else if (result.gesture !== 'idle' && result.gesture !== gestureTargetRef.current) {
          triggerGesture(result.gesture, true);
        } else if (result.gesture === 'idle' && (gestureTargetRef.current === 'walking' || gestureTargetRef.current === 'running') && (now - lastWalkingCheck > 600)) {
          triggerGesture('idle', true);
        }
      }

      animFrameId = requestAnimationFrame(processTrackingFrame);
    };

    animFrameId = requestAnimationFrame(processTrackingFrame);
    return () => {
      cancelAnimationFrame(animFrameId);
      handTracking.reset();
      if (handCanvasRef.current) {
        const ctx = handCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, handCanvasRef.current.width, handCanvasRef.current.height);
      }
    };
  }, [isCameraTracking, showHandSkeleton, triggerGesture]);

  // Desktop Keyboard Shortcuts (1-9, W, C, H, M, Z, D, F, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case '1': triggerGesture('v_sign'); break;
        case '2': triggerGesture('reach_hand'); break;
        case '3': triggerGesture('wave'); break;
        case '4': triggerGesture('dragon_power'); break;
        case '5': triggerGesture('thumbs_up'); break;
        case '6': triggerGesture('zen_float'); break;
        case '7': triggerGesture('heart'); break;
        case '8': triggerGesture('petting'); break;
        case '9': triggerGesture('dance_jump'); break;
        case '0': triggerGesture('shy_blush'); break;
        case 'w': triggerGesture(currentGesture === 'walking' ? 'idle' : 'walking'); break;
        case 'r': triggerGesture(currentGesture === 'running' ? 'idle' : 'running'); break;
        case 'c':
          if (isCameraTracking) stopCameraTracking();
          else startCameraTracking();
          break;
        case 'h': setShowHandSkeleton(prev => !prev); break;
        case 'v':
          setHapticFeedbackEnabled(prev => {
            const nextVal = !prev;
            setSnapshotToast(nextVal ? '📳 Đã BẬT Phản hồi rung Haptic & Hiệu ứng màn hình!' : '📴 Đã TẮT Phản hồi rung Haptic');
            setTimeout(() => setSnapshotToast(null), 2000);
            return nextVal;
          });
          break;
        case 'm': setIsMuted(prev => !prev); break;
        case 'z': setIsZenMode(prev => !prev); break;
        case 'd': setIsDesktopSplitMode(prev => !prev); break;
        case 'f': setIsFullscreenMode(prev => !prev); break;
        case '?': setShowShortcutsModal(prev => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGesture, isCameraTracking, triggerGesture]);

  // Camera Hand Tracking Start/Stop
  const startCameraTracking = async () => {
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraTracking(true);
        setSnapshotToast('📷 Camera AR & Khung tay nhận diện đã sẵn sàng!');
        setTimeout(() => setSnapshotToast(null), 2500);
      }
    } catch {
      setSnapshotToast('⚠️ Không thể truy cập camera!');
      setTimeout(() => setSnapshotToast(null), 2500);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCameraTracking = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraTracking(false);
  };

  const takeARSnapshot = () => {
    setSnapshotToast('📸 Đã lưu khoảnh khắc 5D kỷ niệm cùng Haevy Son!');
    if (!isMuted) {
      try { morningAudio.triggerHaevySonHappy(); } catch {}
    }
    setTimeout(() => setSnapshotToast(null), 2500);
  };

  // 🌟 3D PHYSICS ENGINE ACTION HANDLERS
  const handleSpawnObject = (type: 'crystal_sphere' | 'star_gem' | 'quantum_cube' | 'heart_gem' | 'celestial_snack') => {
    if (!sceneRef.current) return;
    spatialPhysics.spawnPhysicalObject(sceneRef.current, type);
    setSpawnedCount(spatialPhysics.objects.length);
    
    const names = {
      crystal_sphere: '🔮 Ngọc Cầu Pha Lê 5D',
      star_gem: '⭐ Kẹo Sao Tinh Tú',
      quantum_cube: '🧊 Khối Lượng Tử 3D',
      heart_gem: '💖 Trái Tim Plasma',
      celestial_snack: '🍖 Bánh Thần Tiên'
    };
    setSnapshotToast(`✨ Đã thả ${names[type]} vào không gian! (Chạm & ném tự do)`);
    setTimeout(() => setSnapshotToast(null), 2200);

    if (!isMuted) {
      try { morningAudio.triggerDragonSparkleBurst(); } catch {}
    }
  };

  const handleTossMascot = () => {
    setIsPetPhysicsFree(true);
    const vx = (Math.random() - 0.5) * 8.0;
    const vy = 7.5 + Math.random() * 4.0;
    const vz = (Math.random() - 0.5) * 3.0;
    spatialPhysics.tossMascot(vx, vy, vz);
    setSnapshotToast('🚀 Haevy Son 5D được phóng lên cao với gia tốc cực đại!');
    setTimeout(() => setSnapshotToast(null), 2500);

    if (!isMuted) {
      try { morningAudio.triggerDragonSparkleBurst(); } catch {}
    }
  };

  const handleClearObjects = () => {
    if (sceneRef.current) {
      spatialPhysics.clearObjects(sceneRef.current);
      setSpawnedCount(0);
      setSnapshotToast('🧹 Đã dọn sạch tất cả vật thể trong không gian!');
      setTimeout(() => setSnapshotToast(null), 2000);
    }
  };

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`w-full h-full bg-black overflow-hidden relative select-none transition-all duration-300 ${
        isHapticShakeActive ? 'animate-screen-shake' : ''
      } ${
        gestureAuraFlash ? 'animate-gesture-flash' : ''
      } ${
        isFullscreenMode || isStandaloneFullscreen 
          ? 'fixed inset-0 z-50 h-screen w-screen' 
          : 'rounded-3xl border border-amber-500/40 shadow-2xl'
      }`}
      style={
        gestureAuraFlash ? {
          borderColor: gestureAuraFlash.color,
          boxShadow: `0 0 35px ${gestureAuraFlash.color}aa, inset 0 0 45px ${gestureAuraFlash.color}44`
        } : undefined
      }
    >
      {/* 📳 HAPTIC GESTURE SUCCESS FULLSCREEN AURA RING PULSE */}
      {gestureAuraFlash && (
        <div 
          className="absolute inset-0 pointer-events-none z-35 animate-ping opacity-75 border-4 rounded-3xl"
          style={{
            borderColor: gestureAuraFlash.color,
            boxShadow: `inset 0 0 100px ${gestureAuraFlash.color}66`
          }}
        />
      )}

      {/* 📷 LIVE CAMERA FEED (AR MODE) */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-500 pointer-events-none z-0 ${
          isCameraTracking ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ filter: 'brightness(0.95) contrast(1.08) saturate(1.05)' }}
      />

      {/* 🦴 AI HAND TRACKING SKELETON & RECOGNITION FRAME CANVAS OVERLAY */}
      <canvas
        ref={handCanvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 transition-opacity duration-300 ${
          isCameraTracking && showHandSkeleton ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 🎯 HAND RECOGNITION FRAME GUIDANCE HUD (MỤC 2 KHUNG TAY NHẬN DIỆN) */}
      {isCameraTracking && (
        <div className="absolute inset-0 pointer-events-none z-15 flex flex-col items-center justify-center p-4">
          {/* Holographic Guide Box */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-amber-400/40 rounded-3xl flex flex-col items-center justify-between p-4 bg-amber-500/5 backdrop-blur-[1px] animate-pulse">
            {/* 4 Cyber Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-xl" />

            {/* Top Frame Status Tag */}
            <div className="px-3 py-1 rounded-full bg-zinc-950/90 border border-amber-400/70 text-amber-300 text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-lg">
              <Scan size={13} className="text-amber-400 animate-spin" />
              <span>KHUNG NHẬN DIỆN TAY 5D</span>
            </div>

            {/* Live Telemetry Indicator inside frame */}
            <div className="w-full flex items-center justify-between px-2 py-1 rounded-2xl bg-zinc-950/85 border border-zinc-800 text-[10px] sm:text-[11px] font-bold text-zinc-300">
              <div className="flex items-center gap-1">
                <span className="text-amber-400">🖐️</span>
                <span>Thế tay:</span>
                <span className={`font-black ${
                  trackingTelemetry.orientation === 'down' 
                    ? 'text-emerald-400' 
                    : trackingTelemetry.orientation === 'up' 
                    ? 'text-sky-400' 
                    : 'text-amber-300'
                }`}>
                  {trackingTelemetry.orientation === 'down' ? 'Úp tay (Đi bộ)' : trackingTelemetry.orientation === 'up' ? 'Ngửa tay (Chào)' : 'Nghiêng tay'}
                </span>
              </div>

              {trackingTelemetry.isWalking && (
                <div className="flex items-center gap-1 text-emerald-400 animate-bounce">
                  <Footprints size={13} />
                  <span>Bước đi {trackingTelemetry.speed}%</span>
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] sm:text-xs font-bold text-amber-200/90 bg-zinc-950/80 px-4 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md text-center">
            💡 Úp bàn tay xuống & di chuyển các ngón tay để Haevy Son rảo bước lon ton!
          </p>
        </div>
      )}

      {/* 🌌 DEEP SPACE 5D DIMENSIONAL ATMOSPHERIC BACKDROP */}
      {!isCameraTracking && (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.22),transparent_75%)]" />
          <div className="absolute top-1/4 right-1/4 w-[380px] h-[380px] bg-amber-500/12 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[380px] h-[380px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* 🌟 SPECIAL FX OVERLAYS */}
      {activeSpecialFX === 'heart' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-400 animate-bounce"
              style={{
                left: `${(i * 3.8) % 100}%`,
                top: `${(i * 15) % 85}%`,
                fontSize: `${18 + (i % 4) * 6}px`,
                animationDuration: `${1.1 + (i % 3) * 0.3}s`,
                opacity: 0.95
              }}
            >
              💖
            </div>
          ))}
        </div>
      )}

      {activeSpecialFX === 'rainbow' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-500/25 via-amber-500/25 to-cyan-500/25 blur-3xl animate-spin" style={{ animationDuration: '5s' }} />
        </div>
      )}

      {activeSpecialFX === 'fire' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full bg-gradient-to-t from-orange-600/30 to-amber-400/30 blur-3xl animate-pulse" />
        </div>
      )}

      {activeSpecialFX === 'lightning' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full bg-yellow-400/30 blur-3xl animate-ping" />
        </div>
      )}

      {/* 🌟 TOUCH RIPPLES */}
      {touchRipples.map(r => (
        <div 
          key={r.id}
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/90 bg-amber-400/25 animate-ping"
          style={{ left: r.x, top: r.y, width: 90, height: 90 }}
        />
      ))}

      {/* ========================================================================= */}
      {/* 🌟 FLOATING DRAGGABLE 5D PET STAGE (GỌN GÀNG, ĐẸP XUẤT SẮC, KÉO THẢ TỰ DO) */}
      {/* ========================================================================= */}
      <div 
        className="absolute z-20 flex flex-col items-center justify-center transition-transform duration-75"
        style={{
          left: '50%',
          top: '46%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${petScale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* DRAGGABLE TOP HANDLE BADGE & QUICK RESET */}
        <div className="flex items-center gap-1.5 mb-1 z-30">
          <div 
            onPointerDown={handleDragStart}
            className="cursor-move px-3.5 py-1.5 rounded-full bg-zinc-950/90 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all"
            title="Bấm giữ và kéo để di chuyển Pet 5D đến bất kỳ đâu trên màn hình"
          >
            <Move size={13} className="text-amber-400 animate-pulse" />
            <span>🖐️ Kéo Thả Pet 5D</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/25 text-[10px] text-amber-200">
              {affection}% Yêu Thích
            </span>
          </div>

          <button
            onClick={handleResetToCenter}
            className="p-1.5 rounded-full bg-zinc-950/90 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 hover:text-white shadow-2xl backdrop-blur-xl active:scale-90 transition-all flex items-center justify-center"
            title="🎯 Căn giữa & phục hồi Pet ngay lập tức"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* 5D WEBGL PET CANVAS (KÍCH THƯỚC CHUẨN GỌN GÀNG, SẮC NÉT & ĐÁNG YÊU) */}
        <div 
          ref={mountRef} 
          onClick={handlePetCharacter}
          className="w-[360px] h-[410px] cursor-grab active:cursor-grabbing flex items-center justify-center relative drop-shadow-[0_20px_50px_rgba(245,158,11,0.35)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* 🌟 ZEN MODE FLOATING RESTORE BUTTON (KHI THU GỌN TOÀN BỘ GIAO DIỆN) */}
      {/* ========================================================================= */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="absolute top-4 right-4 z-40 px-3.5 py-2 rounded-2xl bg-zinc-950/90 hover:bg-amber-500/20 border border-amber-400/80 text-amber-300 text-xs font-extrabold shadow-2xl backdrop-blur-xl transition-all flex items-center gap-2 active:scale-95 animate-in fade-in"
          title="Bấm để mở lại đầy đủ thanh công cụ & giao diện"
        >
          <Eye size={14} className="text-amber-400 animate-pulse" />
          <span>✨ Mở Lại Giao Diện</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* 🌟 TOP NAVIGATION & CONTROL BAR */}
      {/* ========================================================================= */}
      {!isZenMode && (
        <div className="absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 z-30 flex items-center justify-between pointer-events-none animate-in fade-in duration-200">
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-700/90 text-white text-xs sm:text-sm font-extrabold backdrop-blur-xl shadow-2xl transition-all active:scale-95 group hover:border-amber-400"
                title="Thoát Mục 2 & Trở về Cổng Không Gian"
              >
                <ArrowLeft size={16} className="text-amber-400 group-hover:-translate-x-1 transition-transform" />
                <span>Thoát Mục 2</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-xl text-xs font-bold text-zinc-200 shadow-xl">
              <span className="text-amber-400">🐲</span>
              <span>Haevy Son 5D Celestial</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-extrabold border border-amber-500/30">
                1 Pet 5D
              </span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Quick Position Dock Presets */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl">
              <button 
                onClick={() => setDockPosition('top_left')} 
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-amber-300 hover:bg-zinc-800"
                title="Góc trên trái"
              >
                ↖ Trái
              </button>
              <button 
                onClick={() => setDockPosition('center')} 
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30"
                title="Chính giữa"
              >
                ✦ Giữa
              </button>
              <button 
                onClick={() => setDockPosition('bottom_right')} 
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-amber-300 hover:bg-zinc-800"
                title="Góc phải dưới"
              >
                Phải ↘
              </button>
            </div>

            {/* 5D Form Selector Toggle */}
            <button
              onClick={() => setShowFormModal(!showFormModal)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all shadow-xl active:scale-95 backdrop-blur-xl"
              title="Đổi 4 Dạng Biến Hình 5D Thần Thú"
            >
              <Crown size={14} className="text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Dạng 5D</span>
            </button>

            {/* Camera AR Toggle */}
            <button
              onClick={isCameraTracking ? stopCameraTracking : startCameraTracking}
              disabled={isCameraLoading}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-xl active:scale-95 backdrop-blur-xl ${
                isCameraTracking
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-emerald-500/10'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-300/80 shadow-amber-500/20'
              }`}
            >
              <Camera size={14} />
              <span>{isCameraLoading ? 'Đang mở...' : isCameraTracking ? 'Camera: BẬT' : 'Bật Camera'}</span>
            </button>

            {/* AR Snapshot */}
            <button
              onClick={takeARSnapshot}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-xl backdrop-blur-xl flex items-center gap-1.5"
              title="Chụp ảnh AR kỷ niệm cùng Haevy Son 5D"
            >
              <SnapshotIcon size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Chụp Ảnh</span>
            </button>

            {/* Zen Mode Toggle (Thu gọn giao diện toàn cảnh) */}
            <button
              onClick={() => {
                setIsZenMode(true);
                setSnapshotToast('👁️ Đã chuyển sang Chế độ Toàn Cảnh (Giao diện đã thu gọn)');
                setTimeout(() => setSnapshotToast(null), 2500);
              }}
              className="p-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-all active:scale-95 shadow-xl backdrop-blur-xl"
              title="Thu gọn toàn bộ giao diện để xem Pet rõ nét"
            >
              <EyeOff size={15} />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-2xl border transition-all active:scale-95 shadow-xl backdrop-blur-xl ${
                isMuted ? 'bg-zinc-950/90 text-zinc-500 border-zinc-800' : 'bg-zinc-950/90 text-amber-400 border-amber-500/40'
              }`}
              title={isMuted ? "Bật âm thanh hiệu ứng & giọng nói" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* AI Skeleton Overlay HUD Toggle */}
            {isCameraTracking && (
              <button
                onClick={() => setShowHandSkeleton(!showHandSkeleton)}
                className={`p-2 sm:px-3 sm:py-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 shadow-xl backdrop-blur-xl flex items-center gap-1.5 ${
                  showHandSkeleton 
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/80 shadow-amber-500/10' 
                    : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="Bật/Tắt Khung Xương Tay Nhận Diện AI 5D"
              >
                <Scan size={14} className={showHandSkeleton ? 'text-amber-400 animate-pulse' : ''} />
                <span className="hidden sm:inline">Khung AI</span>
              </button>
            )}

            {/* Desktop Mode Hotkeys Helper */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-xl backdrop-blur-xl flex items-center gap-1.5"
              title="Xem danh sách phím tắt máy tính (1-8, W, C, H, Z, M...)"
            >
              <Keyboard size={14} className="text-amber-400" />
              <span className="hidden xl:inline">Bản Máy Tính</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreenMode(!isFullscreenMode)}
              className="p-2 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white transition-all active:scale-95 shadow-xl backdrop-blur-xl"
              title="Toàn màn hình"
            >
              {isFullscreenMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Snapshot Toast Feedback */}
      {snapshotToast && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-emerald-500/30 border border-emerald-400/80 text-emerald-100 font-bold text-xs shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <span>{snapshotToast}</span>
        </div>
      )}

      {/* Mascot Live Status Bubble */}
      {!isZenMode && (
        <div className="absolute top-16 sm:top-20 left-3 sm:left-6 z-30 pointer-events-none max-w-xs sm:max-w-md animate-in fade-in">
          <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-amber-500/40 text-xs text-zinc-200 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-medium truncate">{mascotStatusText}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 5D ELEMENTAL FORM SELECTION MODAL */}
      {/* ========================================================================= */}
      {showFormModal && (
        <div className="absolute top-16 sm:top-20 right-3 sm:right-6 z-40 w-76 sm:w-80 bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Crown size={14} />
              <span>4 Dạng Biến Hình 5D Thần Thú</span>
            </span>
            <button onClick={() => setShowFormModal(false)} className="text-xs text-zinc-400 hover:text-white">✕</button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setMascotForm('golden_dragon');
                setShowFormModal(false);
                setSnapshotToast('👑 Đã biến hình sang: Kim Long Hoàng Gia 5D!');
                setTimeout(() => setSnapshotToast(null), 2000);
              }}
              className={`p-2.5 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                mascotForm === 'golden_dragon'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="text-xl">👑</span>
              <div>
                <div className="font-extrabold text-white">Kim Long Hoàng Gia</div>
                <div className="text-[10px] text-zinc-400">Sừng vàng óng, đuôi lửa hổ phách, hào quang thái dương</div>
              </div>
            </button>

            <button
              onClick={() => {
                setMascotForm('cosmic_galaxy');
                setShowFormModal(false);
                setSnapshotToast('🌌 Đã biến hình sang: Thiên Hà Tinh Vân 5D!');
                setTimeout(() => setSnapshotToast(null), 2000);
              }}
              className={`p-2.5 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                mascotForm === 'cosmic_galaxy'
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-lg'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="text-xl">🌌</span>
              <div>
                <div className="font-extrabold text-white">Thiên Hà Tinh Vân</div>
                <div className="text-[10px] text-zinc-400">Sừng thạch anh xanh tím, hào quang tinh vân neon</div>
              </div>
            </button>

            <button
              onClick={() => {
                setMascotForm('frost_crystal');
                setShowFormModal(false);
                setSnapshotToast('❄️ Đã biến hình sang: Băng Tinh Kim Cương 5D!');
                setTimeout(() => setSnapshotToast(null), 2000);
              }}
              className={`p-2.5 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                mascotForm === 'frost_crystal'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="text-xl">❄️</span>
              <div>
                <div className="font-extrabold text-white">Băng Tinh Kim Cương</div>
                <div className="text-[10px] text-zinc-400">Pha lê tuyết Bắc Cực, ánh sáng cực quang lung linh</div>
              </div>
            </button>

            <button
              onClick={() => {
                setMascotForm('sakura_deity');
                setShowFormModal(false);
                setSnapshotToast('🌸 Đã biến hình sang: Anh Đào Tiên Giới 5D!');
                setTimeout(() => setSnapshotToast(null), 2000);
              }}
              className={`p-2.5 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                mascotForm === 'sakura_deity'
                  ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-lg'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="text-xl">🌸</span>
              <div>
                <div className="font-extrabold text-white">Anh Đào Tiên Giới</div>
                <div className="text-[10px] text-zinc-400">Cánh tiên hoa ngọc trai, mưa hoa anh đào bay lượn</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 BOTTOM INTERACTIVE DOCK (CÓ NÚT THU GỌN / MỞ RỘNG TRỰC QUAN) */}
      {/* ========================================================================= */}
      {!isZenMode && (
        <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 z-30 pointer-events-none flex flex-col items-center gap-2 animate-in fade-in duration-200">
          
          {/* 🌟 WHEN DOCK IS COLLAPSED: COMPACT FLOATING PILL */}
          {isDockCollapsed ? (
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/50 shadow-2xl animate-in zoom-in-95 duration-150">
              <span className="text-xs text-amber-400 font-extrabold flex items-center gap-1 mr-1">
                <span>🐲 Pet 5D:</span>
              </span>

              {/* Quick Compact Gesture Buttons */}
              <button
                onClick={() => triggerGesture('walking')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'walking' ? 'bg-amber-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Úp bàn tay di chuyển chậm để Haevy Son đi bộ lon ton"
              >
                <span>🐾</span>
                <span className="hidden md:inline text-[11px]">Đi bộ</span>
              </button>

              <button
                onClick={() => triggerGesture('running')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'running' ? 'bg-cyan-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Úp bàn tay di chuyển nhanh để Haevy Son chạy nước rút"
              >
                <span>⚡</span>
                <span className="hidden md:inline text-[11px]">Chạy</span>
              </button>

              <button
                onClick={() => triggerGesture('v_sign')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'v_sign' ? 'bg-amber-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Làm dáng chữ V & Nháy mắt"
              >
                <span>✌️</span>
                <span className="hidden md:inline text-[11px]">Chữ V</span>
              </button>

              <button
                onClick={() => triggerGesture('reach_hand')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'reach_hand' ? 'bg-amber-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="High-Five Chạm tay 5D"
              >
                <span>✋</span>
                <span className="hidden md:inline text-[11px]">Chạm tay</span>
              </button>

              <button
                onClick={() => triggerGesture('dragon_power')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'dragon_power' ? 'bg-amber-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Kim Long Thần Uy"
              >
                <span>🐉</span>
                <span className="hidden md:inline text-[11px]">Kim Long</span>
              </button>

              <button
                onClick={() => triggerGesture('zen_float')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'zen_float' ? 'bg-emerald-500 text-black' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Thiền 5D"
              >
                <span>🧘</span>
                <span className="hidden md:inline text-[11px]">Thiền</span>
              </button>

              <button
                onClick={() => triggerGesture('heart')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'heart' ? 'bg-pink-500 text-white' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Bão tim yêu thương"
              >
                <span>🫶</span>
                <span className="hidden md:inline text-[11px]">Bão tim</span>
              </button>

              <button
                onClick={() => triggerGesture('petting')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'petting' ? 'bg-rose-500 text-white' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Dụi đầu vuốt ve"
              >
                <span>🥰</span>
                <span className="hidden md:inline text-[11px]">Vuốt ve</span>
              </button>

              <button
                onClick={() => triggerGesture('dance_jump')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'dance_jump' ? 'bg-violet-500 text-white' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Nhảy múa xoay tròn"
              >
                <span>💃</span>
                <span className="hidden md:inline text-[11px]">Nhảy múa</span>
              </button>

              <button
                onClick={() => triggerGesture('shy_blush')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  currentGesture === 'shy_blush' ? 'bg-fuchsia-500 text-white' : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Ngượng ngùng che mặt"
              >
                <span>😳</span>
                <span className="hidden md:inline text-[11px]">Ngượng</span>
              </button>

              {/* Expand Full Dock Button */}
              <button
                onClick={() => setIsDockCollapsed(false)}
                className="ml-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-1 active:scale-95 transition-all"
                title="Mở rộng đầy đủ bảng điều khiển tính năng"
              >
                <ChevronUp size={13} />
                <span>Mở Rộng</span>
              </button>
            </div>
          ) : (
            /* 🌟 WHEN DOCK IS EXPANDED: FULL FEATURE CONTROLS */
            <div className="pointer-events-auto w-full max-w-2xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom-3 duration-200">
              
              {/* Header row: Size Control, Presets & Minimize Button */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                {/* Size scale controller */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-zinc-300 flex items-center gap-1">
                    <Sliders size={13} className="text-amber-400" />
                    <span>Kích Cỡ:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPetScale(0.48)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                        petScale <= 0.52
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Mini (0.5x)
                    </button>
                    <button
                      onClick={() => setPetScale(0.65)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                        petScale > 0.52 && petScale < 0.8
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Vừa Vặn (0.65x)
                    </button>
                    <button
                      onClick={() => setPetScale(0.9)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                        petScale >= 0.8
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Lớn (0.9x)
                    </button>
                  </div>
                </div>

                {/* Right controls: Haptic toggle + Center preset + Collapse button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setHapticFeedbackEnabled(prev => !prev);
                      setSnapshotToast(!hapticFeedbackEnabled ? '📳 Đã BẬT Phản hồi rung Haptic & Hiệu ứng rung màn hình!' : '📴 Đã TẮT Phản hồi rung Haptic');
                      setTimeout(() => setSnapshotToast(null), 2200);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 active:scale-95 transition-all ${
                      hapticFeedbackEnabled 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                    title="Bật/Tắt Phản hồi rung & Hiệu ứng thị giác khi nhận diện cử chỉ"
                  >
                    <span>{hapticFeedbackEnabled ? '📳 Rung: BẬT' : '📴 Rung: TẮT'}</span>
                  </button>

                  <button
                    onClick={() => setDockPosition('center')}
                    className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-amber-300 border border-zinc-700/80 flex items-center gap-1 active:scale-95"
                    title="Đưa Pet về chính giữa màn hình"
                  >
                    <RotateCw size={11} />
                    <span>Về Giữa</span>
                  </button>

                  <button
                    onClick={() => setIsDockCollapsed(true)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white border border-zinc-700/80 flex items-center gap-1 active:scale-95 transition-all"
                    title="Thu gọn bảng điều khiển"
                  >
                    <ChevronDown size={12} />
                    <span>Thu Gọn</span>
                  </button>
                </div>
              </div>

              {/* 🌟 TAB SELECTOR: [ 🎭 Cử Chỉ 5D ] vs [ 🪐 Vật Lý 3D ] */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setActiveDockTab('gestures')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    activeDockTab === 'gestures'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>🎭</span>
                  <span>Cử Chỉ & Biểu Cảm 5D</span>
                </button>
                <button
                  onClick={() => setActiveDockTab('physics')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    activeDockTab === 'physics'
                      ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Orbit size={13} className={activeDockTab === 'physics' ? 'text-black' : 'text-cyan-400'} />
                  <span>Vật Lý 3D & Trọng Lực</span>
                  {spawnedCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      activeDockTab === 'physics' ? 'bg-black/20 text-black' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {spawnedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB CONTENT: GESTURES */}
              {activeDockTab === 'gestures' && (
                <>
                  {/* 9 Cử chỉ 5D tương tác */}
                  <div className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => triggerGesture('walking')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'walking'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                      title="Úp bàn tay di chuyển chậm để Haevy Son đi bộ lon ton"
                    >
                      <span>🐾</span>
                      <span>Đi Bộ</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('running')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'running'
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                      title="Úp bàn tay di chuyển nhanh để Haevy Son chạy nước rút"
                    >
                      <span>⚡</span>
                      <span>Chạy Nhanh</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('v_sign')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'v_sign'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>✌️</span>
                      <span>Chữ V</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('reach_hand')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'reach_hand'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>✋</span>
                      <span>High-Five 5D</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('wave')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'wave'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>👋</span>
                      <span>Vẫy Tay</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('dragon_power')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'dragon_power'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🐉</span>
                      <span>Kim Long</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('zen_float')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'zen_float'
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🧘</span>
                      <span>Thiền 5D</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('heart')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'heart'
                          ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🫶</span>
                      <span>Bão Tim</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('thumbs_up')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'thumbs_up'
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>👍</span>
                      <span>Số 1</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('petting')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'petting'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🥰</span>
                      <span>Vuốt Ve</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('dance_jump')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'dance_jump'
                          ? 'bg-violet-500 text-white border-violet-400 shadow-lg shadow-violet-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                      title="Haevy Son nhảy cẫng lên và múa xoay tròn"
                    >
                      <span>💃</span>
                      <span>Nhảy Múa</span>
                    </button>

                    <button
                      onClick={() => triggerGesture('shy_blush')}
                      className={`px-2.5 sm:px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                        currentGesture === 'shy_blush'
                          ? 'bg-fuchsia-500 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                      }`}
                      title="Haevy Son ngượng ngùng lấy tay che mặt"
                    >
                      <span>😳</span>
                      <span>Ngượng</span>
                    </button>
                  </div>

                  {/* Phép thuật đặc biệt 5D */}
                  <div className="flex items-center justify-center gap-2 pt-1 border-t border-zinc-800/80 text-xs">
                    <span className="text-[11px] text-zinc-400 font-bold hidden sm:inline">Phép Thuật 5D:</span>
                    <button
                      onClick={() => triggerSpecialFX('heart')}
                      className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-[11px] font-bold transition-all active:scale-95"
                    >
                      💖 Mưa Tim Siêu Tân Tinh
                    </button>
                    <button
                      onClick={() => triggerSpecialFX('rainbow')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all active:scale-95"
                    >
                      🌈 Cầu Vồng Tinh Tú
                    </button>
                    <button
                      onClick={() => triggerSpecialFX('fire')}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition-all active:scale-95"
                    >
                      🔥 Hào Quang Kim Long
                    </button>
                    <button
                      onClick={() => triggerSpecialFX('lightning')}
                      className="px-3 py-1.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold transition-all active:scale-95"
                    >
                      ⚡ Sấm Sét Lượng Tử
                    </button>
                  </div>
                </>
              )}

              {/* 🪐 TAB CONTENT: 3D PHYSICS ENGINE & INTERACTIVE OBJECTS */}
              {activeDockTab === 'physics' && (
                <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
                  {/* Row 1: Gravity Presets */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
                      <Globe size={13} className="text-cyan-400" />
                      <span>Trọng Lực:</span>
                    </span>

                    {[
                      { id: 'earth', label: '🌍 Trái Đất (9.8m/s²)' },
                      { id: 'moon', label: '🌕 Mặt Trăng (1.6m/s²)' },
                      { id: 'zero_g', label: '🌌 0-G Vũ Trụ' },
                      { id: 'jupiter', label: '🪐 Sao Mộc (24.8m/s²)' },
                      { id: 'vortex', label: '🧲 Xoáy Trọng Lực' }
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setGravityPreset(g.id as GravityPreset);
                          setSnapshotToast(`🪐 Đã chuyển sang trọng lực: ${g.label.split(' ')[1]}`);
                          setTimeout(() => setSnapshotToast(null), 2000);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all active:scale-95 ${
                          gravityPreset === g.id
                            ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/25'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  {/* Row 2: Spawn 3D Physical Objects */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0 mr-1">Thả Vật Thể:</span>
                    
                    <button
                      onClick={() => handleSpawnObject('crystal_sphere')}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
                      title="Thả Ngọc Cầu Pha Lê 5D có độ nảy cao"
                    >
                      <span>🔮</span>
                      <span>Ngọc Cầu</span>
                    </button>

                    <button
                      onClick={() => handleSpawnObject('star_gem')}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
                      title="Thả Ngôi Sao Tinh Tú bay lượn"
                    >
                      <span>⭐</span>
                      <span>Sao Tinh Tú</span>
                    </button>

                    <button
                      onClick={() => handleSpawnObject('quantum_cube')}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
                      title="Thả Khối Lượng Tử 3D nặng trịch"
                    >
                      <span>🧊</span>
                      <span>Khối Lượng Tử</span>
                    </button>

                    <button
                      onClick={() => handleSpawnObject('heart_gem')}
                      className="px-2.5 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
                      title="Thả Trái Tim Plasma nảy bập bùng"
                    >
                      <span>💖</span>
                      <span>Tim Plasma</span>
                    </button>

                    <button
                      onClick={() => handleSpawnObject('celestial_snack')}
                      className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
                      title="Thả Thức Ăn Tiên Giới cho Haevy Son"
                    >
                      <span>🍖</span>
                      <span>Bánh Thần</span>
                    </button>
                  </div>

                  {/* Row 3: Super Toss, Pet Physics Mode & Clean Up */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTossMascot}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-[11px] font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Phóng Pet bay vút lên cao với gia tốc ném tự do"
                      >
                        <Rocket size={13} />
                        <span>🚀 Bắn Phóng Pet 5D</span>
                      </button>

                      <button
                        onClick={() => {
                          const nextState = !isPetPhysicsFree;
                          setIsPetPhysicsFree(nextState);
                          setSnapshotToast(nextState ? '🤹 Pet đang rơi & nảy tự do theo vật lý!' : '🧘 Pet đã chuyển về chế độ bồng bềnh thiền định!');
                          setTimeout(() => setSnapshotToast(null), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
                          isPetPhysicsFree
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                        title="Chuyển đổi giữa chế độ Rơi Vật Lý và Bồng Bềnh"
                      >
                        {isPetPhysicsFree ? '🤹 Vật Lý: Bay & Nảy Tự Do' : '🧘 Vật Lý: Bồng Bềnh'}
                      </button>
                    </div>

                    <button
                      onClick={handleClearObjects}
                      disabled={spawnedCount === 0}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                        spawnedCount > 0
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                      title="Dọn dẹp các đồ vật đã thả trong không gian"
                    >
                      <Trash2 size={12} />
                      <span>Dọn Vật Thể ({spawnedCount})</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* ⌨️ DESKTOP KEYBOARD SHORTCUTS MODAL (BẢN CHO MÁY TÍNH MÀN HÌNH LỚN) */}
      {/* ========================================================================= */}
      {showShortcutsModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Monitor size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Phím Tắt Máy Tính 5D</h3>
                  <p className="text-[11px] text-zinc-400">Điều khiển nhanh trên màn hình lớn</p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">🐾 Đi bộ / Lon ton</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">W</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">⚡ Chạy Nước Rút</span>
                <kbd className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">R</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">📷 Bật / Tắt Camera</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">C</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">🦴 Khung Xương AI</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">H</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">👁️ Toàn cảnh (Zen)</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">Z</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">🔊 Âm thanh</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">M</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">📳 Rung Haptic & Thị giác</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">V</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">⛶ Toàn màn hình</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">F</kbd>
              </div>

              <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-zinc-300">🎭 Cử chỉ & Điệu nhảy (1-8, 9, 0)</span>
                <kbd className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">Phím 1 - 0</kbd>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
              💡 <strong>Mẹo:</strong> Bản máy tính hỗ trợ rê chuột để ném đồ vật 3D, phóng to màn hình và tương tác thời gian thực với độ phân giải Retina 4K.
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs shadow-lg active:scale-95 transition-all"
            >
              Đã Hiểu & Bắt Đầu Trải Nghiệm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
