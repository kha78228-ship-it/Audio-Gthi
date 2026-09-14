import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, 
  Atom, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  Scale, 
  Flame, 
  Layers, 
  FileText, 
  Copy, 
  Download, 
  Check, 
  ChevronRight, 
  Info, 
  Compass, 
  Gauge, 
  Lightbulb, 
  Power, 
  Maximize2, 
  ArrowRight,
  BrainCircuit,
  Eye
} from 'lucide-react';
import { VirtualLabPreset, LabExperimentRecord } from '../../types';

// =========================================================================
// PRESET CONFIGURATIONS FOR QUICK SELECTION
// =========================================================================
const LAB_PRESETS: VirtualLabPreset[] = [
  // Physics Presets - Pendulum
  {
    id: 'pendulum_earth',
    name: 'Con Lắc Đơn Trái Đất',
    category: 'physics',
    simulationType: 'pendulum',
    badge: 'Cơ Học Cổ Điển',
    description: 'Khảo sát bảo toàn cơ năng và chu kỳ T = 2π√(L/g) trong trường trọng lực Trái Đất (9.81 m/s²).',
    principleSummary: 'Chu kỳ dao động chỉ phụ thuộc chiều dài dây L và gia tốc trọng trường g, không phụ thuộc khối lượng quả nặng.',
    initialParams: { length: 1.2, mass: 1.0, angle: 30, gravity: 9.81, damping: 0.002, gravityName: 'Trái Đất' }
  },
  {
    id: 'pendulum_moon',
    name: 'Con Lắc Trên Mặt Trăng',
    category: 'physics',
    simulationType: 'pendulum',
    badge: 'Trọng Lực Thấp',
    description: 'Quan sát chuyển động chậm rãi kỳ thú của con lắc trong môi trường trọng lực Mặt Trăng (g = 1.62 m/s²).',
    principleSummary: 'Gia tốc g giảm ~6 lần khiến chu kỳ T tăng gấp ~2.46 lần, con lắc đung đưa rất chậm và bay bổng.',
    initialParams: { length: 1.0, mass: 1.5, angle: 45, gravity: 1.62, damping: 0.001, gravityName: 'Mặt Trăng' }
  },
  {
    id: 'pendulum_damper',
    name: 'Con Lắc Cản Chấn Taipei 101',
    category: 'physics',
    simulationType: 'pendulum',
    badge: 'Kỹ Thuật Công Trình',
    description: 'Mô phỏng quả cầu thép 660 tấn treo lơ lửng trên tầng 88 tháp Taipei 101 để hấp thụ dao động động đất.',
    principleSummary: 'Sử dụng hiện tượng dao động cản dịu (Tuned Mass Damper) để triệt tiêu năng lượng rung lắc của tòa nhà chọc trời.',
    initialParams: { length: 4.0, mass: 15.0, angle: 20, gravity: 9.81, damping: 0.045, gravityName: 'Hệ Giảm Chấn' }
  },

  // Physics Presets - Circuits
  {
    id: 'circuit_series',
    name: 'Mạch Nối Tiếp (Series)',
    category: 'physics',
    simulationType: 'circuit',
    badge: 'Điện Học',
    description: 'Mô phỏng 2 bóng đèn mắc nối tiếp. Dòng điện qua mọi điểm là như nhau, hiệu điện thế chia đều theo tỷ lệ R.',
    principleSummary: 'Rtđ = R1 + R2. Khi tháo 1 bóng đèn, toàn bộ mạch hở và ngắt điện hoàn toàn.',
    initialParams: { mode: 'series', voltage: 12, r1: 10, r2: 15, switchOn: true }
  },
  {
    id: 'circuit_parallel',
    name: 'Mạch Song Song Gia Đình (Parallel)',
    category: 'physics',
    simulationType: 'circuit',
    badge: 'Điện Dân Dụng',
    description: 'Mô phỏng mạng điện gia đình với các nhánh độc lập. Hiệu điện thế mỗi nhánh bằng hiệu điện thế nguồn.',
    principleSummary: '1/Rtđ = 1/R1 + 1/R2. Điện trở tương đương nhỏ hơn từng nhánh, thiết bị bật/tắt không ảnh hưởng nhau.',
    initialParams: { mode: 'parallel', voltage: 24, r1: 12, r2: 12, switchOn: true }
  },
  {
    id: 'circuit_overload',
    name: 'Cảnh Báo Quá Tải / Đoản Mạch',
    category: 'physics',
    simulationType: 'circuit',
    badge: 'An Toàn Điện',
    description: 'Thử nghiệm khi điện trở tải quá bé khiến cường độ dòng điện I tăng vọt, kích hoạt rơ le nhiệt an toàn.',
    principleSummary: 'I = U/R. Khi R tiến về 0, dòng điện tiến tới vô cực, nhiệt lượng Q = I²Rt tỏa ra cực nhanh gây cháy nổ.',
    initialParams: { mode: 'series', voltage: 24, r1: 1.5, r2: 1.0, switchOn: true }
  },

  // Chemistry Presets - Reaction Visualizers
  {
    id: 'reaction_baso4',
    name: 'Kết Tủa Trắng BaSO₄',
    category: 'chemistry',
    simulationType: 'reaction',
    badge: 'Phản Ứng Trao Đổi',
    description: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ (kết tủa trắng không tan trong axit) + 2NaCl. Quan sát ion liên kết và lắng đọng.',
    principleSummary: 'Tích số tan [Ba²⁺][SO₄²⁻] vượt quá tích số tan T_BaSO4 = 1.1 × 10⁻¹⁰ làm kết tủa lập tức xuất hiện.',
    initialParams: { reactantA: 'BaCl2', reactantB: 'Na2SO4', concA: 0.2, concB: 0.2, volA: 40, volB: 40, temp: 25 }
  },
  {
    id: 'reaction_h2',
    name: 'Kim Loại Fe Phản Ứng HCl Thoát Khí H₂',
    category: 'chemistry',
    simulationType: 'reaction',
    badge: 'Oxi Hóa - Khử',
    description: 'Fe + 2HCl → FeCl₂ + H₂↑. Quan sát bề mặt sắt sủi bọt khí không màu và dung dịch hóa xanh nhạt.',
    principleSummary: 'Fe có thế điện cực âm hơn 2H⁺ nên đẩy ion H⁺ ra khỏi dung dịch axit giải phóng khí Hydro tự do.',
    initialParams: { reactantA: 'Fe', reactantB: 'HCl', concA: 1.0, concB: 1.0, volA: 30, volB: 50, temp: 25 }
  },
  {
    id: 'reaction_silver_tree',
    name: 'Cây Tinh Thể Bạc: Cu + AgNO₃',
    category: 'chemistry',
    simulationType: 'reaction',
    badge: 'Đẩy Kim Loại',
    description: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag↓. Các tinh thể kim loại bạc lấp lánh bám quanh sợi đồng, dung dịch hóa xanh lam.',
    principleSummary: 'Tính khử của Cu mạnh hơn Ag (cặp Cu²⁺/Cu &lt; Ag⁺/Ag), electron chuyển giao trực tiếp từ nguyên tử Cu sang ion Ag⁺.',
    initialParams: { reactantA: 'Cu', reactantB: 'AgNO3', concA: 0.5, concB: 0.5, volA: 35, volB: 45, temp: 25 }
  },
  {
    id: 'reaction_neutralization',
    name: 'Trung Hòa Tỏa Nhiệt: NaOH + HCl',
    category: 'chemistry',
    simulationType: 'reaction',
    badge: 'Nhiệt Hóa Học',
    description: 'NaOH + HCl → NaCl + H₂O + Q. Quan sát nhiệt độ dung dịch tăng vọt từ 25°C lên 38°C do tỏa nhiệt mạnh.',
    principleSummary: 'Phản ứng trung hòa H⁺ + OH⁻ → H₂O có biến thiên entanpy âm (ΔH = -57.3 kJ/mol), giải phóng nhiệt lượng lớn.',
    initialParams: { reactantA: 'NaOH', reactantB: 'HCl', concA: 1.0, concB: 1.0, volA: 50, volB: 50, temp: 25 }
  }
];

interface VirtualLabDashboardProps {
  onOpenVideoLesson?: (topic: string) => void;
  onOpenRoadmapTopic?: (topic: string) => void;
  onOpenAiAssistant?: (topic: string, principle?: string) => void;
}

export function VirtualLabDashboard({ onOpenVideoLesson, onOpenRoadmapTopic, onOpenAiAssistant }: VirtualLabDashboardProps) {
  // Active Filter & Active Preset
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'physics' | 'chemistry'>('all');
  const [activePreset, setActivePreset] = useState<VirtualLabPreset>(LAB_PRESETS[0]);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // 0.5x, 1x, 2x

  // Student Experiment Notebook & Report State
  const [experimentRecords, setExperimentRecords] = useState<LabExperimentRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('haevy_edu_lab_records_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [studentNoteInput, setStudentNoteInput] = useState<string>('');

  // Save records to localStorage
  const saveRecord = (record: LabExperimentRecord) => {
    const updated = [record, ...experimentRecords.slice(0, 19)];
    setExperimentRecords(updated);
    try {
      localStorage.setItem('haevy_edu_lab_records_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving lab record', e);
    }
  };

  // =========================================================================
  // 1. PENDULUM SIMULATION STATE
  // =========================================================================
  const [pendulumLength, setPendulumLength] = useState<number>(1.2); // meters
  const [pendulumMass, setPendulumMass] = useState<number>(1.0); // kg
  const [pendulumGravity, setPendulumGravity] = useState<number>(9.81); // m/s²
  const [pendulumDamping, setPendulumDamping] = useState<number>(0.002);
  const [pendulumAngleDeg, setPendulumAngleDeg] = useState<number>(30); // current angle in degrees
  const [pendulumInitialAngle, setPendulumInitialAngle] = useState<number>(30);
  const [gravityLocationName, setGravityLocationName] = useState<string>('Trái Đất (9.81 m/s²)');

  // Runtime dynamic pendulum physics state (ref for 60fps canvas loop)
  const pendulumStateRef = useRef<{
    theta: number; // radians
    omega: number; // angular velocity rad/s
    time: number;
    cycleCount: number;
    lastZeroCross: number;
  }>({
    theta: (30 * Math.PI) / 180,
    omega: 0,
    time: 0,
    cycleCount: 0,
    lastZeroCross: 0
  });

  const pendulumCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Computed Pendulum Theoretical Values
  const pendulumPeriod = 2 * Math.PI * Math.sqrt(pendulumLength / Math.max(0.1, pendulumGravity));
  const pendulumFrequency = 1 / pendulumPeriod;

  // =========================================================================
  // 2. CIRCUIT SIMULATION STATE
  // =========================================================================
  const [circuitMode, setCircuitMode] = useState<'series' | 'parallel'>('series');
  const [circuitVoltage, setCircuitVoltage] = useState<number>(12); // Volts
  const [circuitR1, setCircuitR1] = useState<number>(10); // Ohms
  const [circuitR2, setCircuitR2] = useState<number>(15); // Ohms
  const [circuitSwitchOn, setCircuitSwitchOn] = useState<boolean>(true);

  // Computed Circuit Calculations
  const circuitReq = circuitMode === 'series'
    ? circuitR1 + circuitR2
    : (circuitR1 * circuitR2) / Math.max(0.01, circuitR1 + circuitR2);

  const circuitItotal = circuitSwitchOn ? circuitVoltage / Math.max(0.1, circuitReq) : 0;
  const circuitPower = circuitVoltage * circuitItotal;
  const isCircuitOverload = circuitItotal > 8.0 || circuitPower > 90;

  // Voltages on individual components
  const vBulb1 = circuitSwitchOn 
    ? (circuitMode === 'series' ? circuitItotal * circuitR1 : circuitVoltage)
    : 0;
  const vBulb2 = circuitSwitchOn 
    ? (circuitMode === 'series' ? circuitItotal * circuitR2 : circuitVoltage)
    : 0;
  const iBulb1 = circuitSwitchOn 
    ? (circuitMode === 'series' ? circuitItotal : circuitVoltage / Math.max(0.1, circuitR1))
    : 0;
  const iBulb2 = circuitSwitchOn 
    ? (circuitMode === 'series' ? circuitItotal : circuitVoltage / Math.max(0.1, circuitR2))
    : 0;

  // =========================================================================
  // 3. CHEMICAL REACTION VISUALIZER STATE
  // =========================================================================
  const [reactionA, setReactionA] = useState<string>('BaCl2');
  const [reactionB, setReactionB] = useState<string>('Na2SO4');
  const [concA, setConcA] = useState<number>(0.2); // mol/L
  const [concB, setConcB] = useState<number>(0.2); // mol/L
  const [volA, setVolA] = useState<number>(40); // mL
  const [volB, setVolB] = useState<number>(40); // mL
  const [reactionStage, setReactionStage] = useState<'unmixed' | 'reacting' | 'equilibrium'>('reacting');
  const [reactionTemp, setReactionTemp] = useState<number>(25); // Celsius
  const [isStirrerActive, setIsStirrerActive] = useState<boolean>(true);

  const chemistryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Preset Handler
  const handleSelectPreset = (preset: VirtualLabPreset) => {
    setActivePreset(preset);
    setIsSimRunning(true);

    if (preset.simulationType === 'pendulum') {
      const p = preset.initialParams;
      setPendulumLength(p.length || 1.2);
      setPendulumMass(p.mass || 1.0);
      setPendulumAngleDeg(p.angle || 30);
      setPendulumInitialAngle(p.angle || 30);
      setPendulumGravity(p.gravity || 9.81);
      setPendulumDamping(p.damping || 0.002);
      setGravityLocationName(p.gravityName || 'Trái Đất');
      pendulumStateRef.current = {
        theta: ((p.angle || 30) * Math.PI) / 180,
        omega: 0,
        time: 0,
        cycleCount: 0,
        lastZeroCross: 0
      };
    } else if (preset.simulationType === 'circuit') {
      const p = preset.initialParams;
      setCircuitMode(p.mode || 'series');
      setCircuitVoltage(p.voltage || 12);
      setCircuitR1(p.r1 || 10);
      setCircuitR2(p.r2 || 15);
      setCircuitSwitchOn(p.switchOn ?? true);
    } else if (preset.simulationType === 'reaction') {
      const p = preset.initialParams;
      setReactionA(p.reactantA || 'BaCl2');
      setReactionB(p.reactantB || 'Na2SO4');
      setConcA(p.concA || 0.2);
      setConcB(p.concB || 0.2);
      setVolA(p.volA || 40);
      setVolB(p.volB || 40);
      setReactionTemp(p.temp || 25);
      setReactionStage('reacting');
    }
  };

  // Reset current active simulation
  const handleResetSim = () => {
    if (activePreset.simulationType === 'pendulum') {
      pendulumStateRef.current = {
        theta: (pendulumInitialAngle * Math.PI) / 180,
        omega: 0,
        time: 0,
        cycleCount: 0,
        lastZeroCross: 0
      };
      setPendulumAngleDeg(pendulumInitialAngle);
    } else if (activePreset.simulationType === 'circuit') {
      setCircuitSwitchOn(true);
      setCircuitVoltage(12);
    } else if (activePreset.simulationType === 'reaction') {
      setReactionStage('unmixed');
      setReactionTemp(25);
      setTimeout(() => setReactionStage('reacting'), 200);
    }
  };

  // Trigger recording experiment
  const handleRecordSnapshot = () => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let inputs: Record<string, any> = {};
    let results: Record<string, any> = {};

    if (activePreset.simulationType === 'pendulum') {
      inputs = {
        'Chiều dài L': `${pendulumLength} m`,
        'Khối lượng m': `${pendulumMass} kg`,
        'Góc ban đầu θ': `${pendulumInitialAngle}°`,
        'Gia tốc g': `${pendulumGravity} m/s² (${gravityLocationName})`
      };
      results = {
        'Chu kỳ lý thuyết T': `${pendulumPeriod.toFixed(2)} s`,
        'Tần số f': `${pendulumFrequency.toFixed(2)} Hz`,
        'Số chu kỳ đo được': pendulumStateRef.current.cycleCount
      };
    } else if (activePreset.simulationType === 'circuit') {
      inputs = {
        'Chế độ mạch': circuitMode === 'series' ? 'Nối tiếp' : 'Song song',
        'Hiệu điện thế U': `${circuitVoltage} V`,
        'Điện trở R1': `${circuitR1} Ω`,
        'Điện trở R2': `${circuitR2} Ω`
      };
      results = {
        'Điện trở tương đương': `${circuitReq.toFixed(2)} Ω`,
        'Dòng điện I toàn mạch': `${circuitItotal.toFixed(2)} A`,
        'Công suất tiêu thụ P': `${circuitPower.toFixed(1)} W`,
        'Trạng thái': isCircuitOverload ? 'Cảnh báo quá tải' : 'An toàn'
      };
    } else if (activePreset.simulationType === 'reaction') {
      inputs = {
        'Chất phản ứng A': `${reactionA} (${concA}M, ${volA}mL)`,
        'Chất phản ứng B': `${reactionB} (${concB}M, ${volB}mL)`,
        'Nhiệt độ phòng': '25°C'
      };
      results = {
        'Nhiệt độ kết thúc': `${reactionTemp.toFixed(1)}°C`,
        'Hiện tượng quan sát': reactionA === 'BaCl2' 
          ? 'Kết tủa trắng BaSO4 lắng đáy'
          : reactionA === 'Fe'
          ? 'Sủi bọt khí H2 bay lên'
          : reactionA === 'Cu'
          ? 'Tinh thể Ag bám cọng đồng, dung dịch xanh lam'
          : 'Tỏa nhiệt mạnh ΔT > 10°C',
        'Trạng thái': 'Đã hoàn tất phản ứng cân bằng'
      };
    }

    const newRecord: LabExperimentRecord = {
      id: `rec-${Date.now()}`,
      presetId: activePreset.id,
      title: activePreset.name,
      category: activePreset.category,
      timestamp,
      inputs,
      results,
      notes: studentNoteInput.trim() || activePreset.principleSummary
    };

    saveRecord(newRecord);
    setStudentNoteInput('');
    setIsReportDrawerOpen(true);
  };

  // =========================================================================
  // ANIMATION LOOP 1: PENDULUM CANVAS (PHYSICS ENGINE)
  // =========================================================================
  useEffect(() => {
    if (activePreset.simulationType !== 'pendulum') return;
    const canvas = pendulumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05) * simSpeed;
      lastTime = now;

      if (isSimRunning) {
        // Physics update (Verlet/Euler integration with damping)
        const g = pendulumGravity;
        const L = pendulumLength;
        const d = pendulumDamping;

        const theta = pendulumStateRef.current.theta;
        const omega = pendulumStateRef.current.omega;

        // Angular acceleration: alpha = -(g/L) * sin(theta) - d * omega
        const alpha = -(g / L) * Math.sin(theta) - d * omega;
        const nextOmega = omega + alpha * dt;
        const nextTheta = theta + nextOmega * dt;

        // Cycle count tracker (cross zero going in same direction)
        if (theta < 0 && nextTheta >= 0 && nextOmega > 0) {
          pendulumStateRef.current.cycleCount += 1;
        }

        pendulumStateRef.current.theta = nextTheta;
        pendulumStateRef.current.omega = nextOmega;
        pendulumStateRef.current.time += dt;

        setPendulumAngleDeg(Math.round((nextTheta * 180) / Math.PI));
      }

      // Render Canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Deep scientific dark background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Coordinate Grid Lines
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Pivot Base (Top Center)
      const pivotX = width / 2;
      const pivotY = 50;

      // Draw Support Ceiling Mount
      ctx.fillStyle = '#27272a';
      ctx.fillRect(pivotX - 60, pivotY - 14, 120, 14);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(pivotX - 60, pivotY - 14, 120, 14);

      // Protractor Arc (Angle Guide)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 80, 0, Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical Equilibrium Reference Line
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, height - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bob Coordinates
      const currentTheta = pendulumStateRef.current.theta;
      // Visual scale: 1 meter = 180 pixels on canvas
      const visualPixelLength = Math.min(240, pendulumLength * 160);
      const bobX = pivotX + visualPixelLength * Math.sin(currentTheta);
      const bobY = pivotY + visualPixelLength * Math.cos(currentTheta);

      // Draw String
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw Pivot Pin
      ctx.fillStyle = '#e4e4e7';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity Vector Arrow (Tangential)
      const currentOmega = pendulumStateRef.current.omega;
      const vTangential = currentOmega * visualPixelLength * 0.25; // scaled for visibility
      const vArrowX = bobX + vTangential * Math.cos(currentTheta);
      const vArrowY = bobY - vTangential * Math.sin(currentTheta);

      if (Math.abs(vTangential) > 2) {
        ctx.strokeStyle = '#38bdf8'; // Sky blue velocity arrow
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(vArrowX, vArrowY);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(vArrowX, vArrowY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Metallic Pendulum Bob
      const bobRadius = Math.min(32, Math.max(16, 16 + pendulumMass * 4));
      const bobGrad = ctx.createRadialGradient(
        bobX - bobRadius * 0.3,
        bobY - bobRadius * 0.3,
        bobRadius * 0.1,
        bobX,
        bobY,
        bobRadius
      );
      bobGrad.addColorStop(0, '#34d399');
      bobGrad.addColorStop(0.5, '#059669');
      bobGrad.addColorStop(1, '#064e3b');

      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bob Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(bobX - bobRadius * 0.3, bobY - bobRadius * 0.3, bobRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Angle indicator text near pivot
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px monospace';
      const displayAngle = Math.round((currentTheta * 180) / Math.PI);
      ctx.fillText(`θ = ${displayAngle}°`, pivotX + 15, pivotY + 30);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activePreset.simulationType, pendulumLength, pendulumMass, pendulumGravity, pendulumDamping, simSpeed, isSimRunning]);

  // =========================================================================
  // ANIMATION LOOP 2: CHEMICAL REACTION COLLISION & PRECIPITATE/GAS ENGINE
  // =========================================================================
  useEffect(() => {
    if (activePreset.simulationType !== 'reaction') return;
    const canvas = chemistryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // 40 interactive floating ions / molecules
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'A' | 'B' | 'product_solid' | 'gas';
      radius: number;
      color: string;
      label: string;
      settled?: boolean;
    }> = [];

    const width = canvas.width;
    const height = canvas.height;
    const beakerLeft = 80;
    const beakerRight = width - 80;
    const beakerBottom = height - 40;
    const beakerTop = 110;
    const liquidSurfaceY = beakerTop + 70;

    // Seed initial reactant ions
    for (let i = 0; i < 24; i++) {
      particles.push({
        x: beakerLeft + 20 + Math.random() * (beakerRight - beakerLeft - 40),
        y: liquidSurfaceY + 20 + Math.random() * (beakerBottom - liquidSurfaceY - 40),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: i % 2 === 0 ? 'A' : 'B',
        radius: 6,
        color: i % 2 === 0 ? '#38bdf8' : '#fbbf24',
        label: i % 2 === 0 
          ? (reactionA === 'BaCl2' ? 'Ba²⁺' : reactionA === 'Fe' ? 'Fe²⁺' : reactionA === 'Cu' ? 'Cu²⁺' : 'H⁺')
          : (reactionB === 'Na2SO4' ? 'SO₄²⁻' : reactionB === 'HCl' ? 'Cl⁻' : reactionB === 'AgNO3' ? 'Ag⁺' : 'OH⁻')
      });
    }

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Clean lab bench backdrop
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Glass Beaker (250ml Erlenmeyer / Beaker)
      ctx.save();
      // Liquid Fill inside Beaker
      let liquidColor = 'rgba(56, 189, 248, 0.15)';
      if (reactionA === 'BaCl2') {
        // Milky white precipitate suspension
        liquidColor = reactionStage === 'reacting' || reactionStage === 'equilibrium'
          ? 'rgba(244, 244, 245, 0.45)'
          : 'rgba(56, 189, 248, 0.12)';
      } else if (reactionA === 'Cu') {
        // Turns deep blue due to Cu(NO3)2
        liquidColor = 'rgba(14, 165, 233, 0.4)';
      } else if (reactionA === 'Fe') {
        // Pale greenish yellow
        liquidColor = 'rgba(163, 230, 53, 0.25)';
      } else if (reactionA === 'NaOH') {
        // Pink if phenolphthalein or warm amber
        liquidColor = 'rgba(244, 114, 182, 0.35)';
      }

      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.moveTo(beakerLeft, liquidSurfaceY);
      ctx.lineTo(beakerLeft, beakerBottom - 15);
      ctx.quadraticCurveTo(beakerLeft, beakerBottom, beakerLeft + 15, beakerBottom);
      ctx.lineTo(beakerRight - 15, beakerBottom);
      ctx.quadraticCurveTo(beakerRight, beakerBottom, beakerRight, beakerBottom - 15);
      ctx.lineTo(beakerRight, liquidSurfaceY);
      ctx.closePath();
      ctx.fill();

      // Meniscus / Surface wave
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beakerLeft, liquidSurfaceY);
      ctx.quadraticCurveTo((beakerLeft + beakerRight) / 2, liquidSurfaceY + Math.sin(frame * 0.05) * 2, beakerRight, liquidSurfaceY);
      ctx.stroke();

      // Beaker Glass Outlines
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(beakerLeft - 8, beakerTop - 15); // Beaker rim lip
      ctx.lineTo(beakerLeft, beakerTop);
      ctx.lineTo(beakerLeft, beakerBottom - 15);
      ctx.quadraticCurveTo(beakerLeft, beakerBottom, beakerLeft + 15, beakerBottom);
      ctx.lineTo(beakerRight - 15, beakerBottom);
      ctx.quadraticCurveTo(beakerRight, beakerBottom, beakerRight, beakerBottom - 15);
      ctx.lineTo(beakerRight, beakerTop);
      ctx.lineTo(beakerRight + 8, beakerTop - 15);
      ctx.stroke();

      // Measurement Graduations on Glass
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let markY = beakerBottom - 30; markY >= liquidSurfaceY - 10; markY -= 30) {
        ctx.beginPath();
        ctx.moveTo(beakerLeft, markY);
        ctx.lineTo(beakerLeft + 15, markY);
        ctx.stroke();
      }
      ctx.restore();

      // Magnetic Stirring Bar on Beaker Bottom
      if (isStirrerActive) {
        const stirAngle = frame * 0.2;
        ctx.save();
        ctx.translate((beakerLeft + beakerRight) / 2, beakerBottom - 8);
        ctx.rotate(stirAngle);
        ctx.fillStyle = '#e4e4e7';
        ctx.fillRect(-18, -4, 36, 8);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -4, 36, 8);
        ctx.restore();
      }

      // Settled Precipitate Layer at bottom (BaSO4 or Ag crystals)
      if (reactionA === 'BaCl2' || reactionA === 'Cu') {
        ctx.fillStyle = reactionA === 'BaCl2' ? '#f4f4f5' : '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(beakerLeft + 5, beakerBottom);
        ctx.lineTo(beakerLeft + 5, beakerBottom - 12);
        for (let x = beakerLeft + 5; x <= beakerRight - 5; x += 15) {
          ctx.lineTo(x, beakerBottom - 10 - Math.sin((x + frame) * 0.1) * 3);
        }
        ctx.lineTo(beakerRight - 5, beakerBottom);
        ctx.closePath();
        ctx.fill();
      }

      // Update and Draw Particles
      particles.forEach((p, idx) => {
        if (isSimRunning) {
          // Brown motion & agitation
          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;

          // Stirrer convection current
          if (isStirrerActive) {
            const centerX = (beakerLeft + beakerRight) / 2;
            const distFromCenter = p.x - centerX;
            p.vy += distFromCenter * 0.003;
            p.vx += (p.y - liquidSurfaceY) * 0.002 * (p.x < centerX ? 1 : -1);
          }

          // Boundary checks
          if (p.x < beakerLeft + 10) { p.x = beakerLeft + 10; p.vx *= -1; }
          if (p.x > beakerRight - 10) { p.x = beakerRight - 10; p.vx *= -1; }
          if (p.y < liquidSurfaceY + 5) { p.y = liquidSurfaceY + 5; p.vy *= -1; }
          if (p.y > beakerBottom - 12) { p.y = beakerBottom - 12; p.vy *= -1; }

          // Particle collision between A and B
          if (p.type === 'A') {
            for (let j = 0; j < particles.length; j++) {
              const other = particles[j];
              if (other.type === 'B') {
                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 14) {
                  // Collision & Product Formation!
                  if (reactionA === 'BaCl2' && Math.random() < 0.2) {
                    p.type = 'product_solid';
                    p.label = 'BaSO₄↓';
                    p.color = '#ffffff';
                    p.vy = 0.8; // settle down to bottom
                  } else if (reactionA === 'Fe' && Math.random() < 0.25) {
                    other.type = 'gas';
                    other.label = 'H₂↑';
                    other.color = 'rgba(255, 255, 255, 0.8)';
                    other.vy = -1.8; // bubble up!
                  }
                }
              }
            }
          }

          // Gas bubbles floating up and popping
          if (p.type === 'gas') {
            p.vy = -1.5;
            if (p.y <= liquidSurfaceY + 4) {
              // Pop! Re-seed at bottom of metal strip
              p.y = beakerBottom - 20;
              p.x = (beakerLeft + beakerRight) / 2 + (Math.random() - 0.5) * 40;
            }
          }
        }

        // Draw particle circle with label
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ion text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, p.x, p.y);
      });

      // Digital Thermometer dipped into Beaker
      const thermoX = beakerRight - 35;
      ctx.fillStyle = '#27272a';
      ctx.fillRect(thermoX - 4, 60, 8, liquidSurfaceY + 50 - 60);
      ctx.fillStyle = '#ef4444'; // Red alcohol bulb
      ctx.beginPath();
      ctx.arc(thermoX, liquidSurfaceY + 50, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(thermoX - 2, 80, 4, liquidSurfaceY + 50 - 80);

      // Temperature display tag
      ctx.fillStyle = '#18181b';
      ctx.fillRect(thermoX - 25, 45, 50, 18);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(thermoX - 25, 45, 50, 18);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${reactionTemp.toFixed(1)}°C`, thermoX, 58);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activePreset.simulationType, reactionA, reactionB, reactionStage, reactionTemp, isStirrerActive, simSpeed, isSimRunning]);

  // Filter Presets
  const filteredPresets = LAB_PRESETS.filter(p => {
    if (selectedFilter === 'all') return true;
    return p.category === selectedFilter;
  });

  return (
    <div className="w-full flex flex-col gap-6 text-zinc-100">
      {/* Top Banner & Quick Presets Carousel */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <FlaskConical size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Phòng Thí Nghiệm Ảo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Virtual Lab</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  STEM 60 FPS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Tương tác trực tiếp với các kịch bản mô phỏng vật lý (con lắc, mạch điện) và hóa học (phản ứng phân tử)
              </p>
            </div>
          </div>

          {/* Quick Actions (Report Drawer Toggle & Category Filter) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Tất Cả ({LAB_PRESETS.length})
              </button>
              <button
                onClick={() => setSelectedFilter('physics')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'physics'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Atom size={13} />
                <span>Vật Lý (6)</span>
              </button>
              <button
                onClick={() => setSelectedFilter('chemistry')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedFilter === 'chemistry'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FlaskConical size={13} />
                <span>Hóa Học (4)</span>
              </button>
            </div>

            <button
              onClick={() => setIsReportDrawerOpen(!isReportDrawerOpen)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <FileText size={15} className="text-emerald-400" />
              <span>Báo Cáo ({experimentRecords.length})</span>
            </button>
          </div>
        </div>

        {/* Pre-Configured Simulation Cards Horizontal Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredPresets.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        preset.category === 'physics'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 size={12} /> Đang chạy
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-mono text-zinc-300">
                    {preset.simulationType === 'pendulum' ? 'Con Lắc Đơn' : preset.simulationType === 'circuit' ? 'Mạch Điện' : 'Phản Ứng'}
                  </span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Khám phá <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage & Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (Col 1-8): Live Simulation Canvas Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            {/* Stage Header & Simulation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{activePreset.name}</span>
                    <span className="text-xs font-mono font-normal text-zinc-400">
                      [{activePreset.category.toUpperCase()}]
                    </span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-normal">
                    Mô phỏng thời gian thực 60 FPS • Động lực học & hạt phân tử
                  </span>
                </div>
              </div>

              {/* Master Playback Controls */}
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSimRunning
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}
                  title={isSimRunning ? 'Tạm dừng' : 'Tiếp tục'}
                >
                  {isSimRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isSimRunning ? 'Dừng' : 'Chạy'}</span>
                </button>

                <button
                  onClick={handleResetSim}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  title="Đặt lại thông số ban đầu"
                >
                  <RotateCcw size={15} />
                </button>

                {/* Speed selector */}
                <div className="flex items-center gap-1 pl-1 border-l border-zinc-800 text-[11px] font-mono">
                  {[0.5, 1.0, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded ${
                        simSpeed === spd
                          ? 'bg-zinc-700 text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SIMULATION CANVAS 1: PENDULUM */}
            {activePreset.simulationType === 'pendulum' && (
              <div className="flex flex-col gap-4">
                <div className="w-full h-[360px] bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-800 shadow-inner">
                  <canvas
                    ref={pendulumCanvasRef}
                    width={720}
                    height={360}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Pendulum Telemetry HUD */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Chu kỳ lý thuyết T</span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      {pendulumPeriod.toFixed(2)} s
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Tần số f = 1/T</span>
                    <span className="text-base font-mono font-black text-cyan-400">
                      {pendulumFrequency.toFixed(2)} Hz
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Góc lệch hiện thời θ</span>
                    <span className="text-base font-mono font-black text-amber-400">
                      {pendulumAngleDeg}°
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Số chu kỳ đã đếm</span>
                    <span className="text-base font-mono font-black text-purple-400">
                      {pendulumStateRef.current.cycleCount} vòng
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATION CANVAS 2: CIRCUITS */}
            {activePreset.simulationType === 'circuit' && (
              <div className="flex flex-col gap-4">
                {/* Circuit Schematic Visual Stage */}
                <div className="w-full h-[360px] bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${circuitSwitchOn ? (isCircuitOverload ? 'bg-rose-500 animate-ping' : 'bg-emerald-400') : 'bg-zinc-600'}`}></span>
                      <span className="text-xs font-bold text-zinc-200">
                        Mạch: {circuitMode === 'series' ? 'Nối tiếp 2 đèn' : 'Song song 2 đèn'}
                      </span>
                    </div>

                    <button
                      onClick={() => setCircuitSwitchOn(!circuitSwitchOn)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        circuitSwitchOn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <Power size={14} />
                      <span>{circuitSwitchOn ? 'Công Tắc: ĐANG ĐÓNG (ON)' : 'Công Tắc: ĐANG MỞ (OFF)'}</span>
                    </button>
                  </div>

                  {/* Visual Circuit Diagram Wire Frame */}
                  <div className="w-[85%] mx-auto h-[220px] border-4 border-zinc-600 rounded-3xl relative flex items-center justify-between px-10">
                    {/* Battery (Left Source) */}
                    <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 bg-zinc-950 p-2.5 border-2 border-amber-500 rounded-2xl text-center flex flex-col items-center shadow-lg">
                      <span className="text-xs text-amber-400 font-bold">+</span>
                      <Zap size={22} className={`text-amber-400 ${circuitSwitchOn ? 'animate-pulse' : 'opacity-40'}`} />
                      <span className="text-xs font-mono font-bold text-white mt-1">{circuitVoltage}V</span>
                      <span className="text-xs text-zinc-400 font-bold">-</span>
                    </div>

                    {/* Circuit Components in Middle */}
                    {circuitMode === 'series' ? (
                      <div className="w-full flex items-center justify-around">
                        {/* Bulb 1 */}
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300 shadow-xl"
                            style={{
                              backgroundColor: circuitSwitchOn ? `rgba(251, 191, 36, ${Math.min(1, (iBulb1 * vBulb1) / 30)})` : '#18181b',
                              boxShadow: circuitSwitchOn ? `0 0 ${(iBulb1 * vBulb1) * 1.5}px rgba(251, 191, 36, 0.8)` : 'none'
                            }}
                          >
                            <Lightbulb size={28} className={circuitSwitchOn ? 'text-zinc-950' : 'text-zinc-600'} />
                          </div>
                          <span className="text-xs font-bold text-zinc-200">Đèn 1 ({circuitR1}Ω)</span>
                          <span className="text-[11px] font-mono text-zinc-400">{vBulb1.toFixed(1)}V • {iBulb1.toFixed(2)}A</span>
                        </div>

                        {/* Bulb 2 */}
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300 shadow-xl"
                            style={{
                              backgroundColor: circuitSwitchOn ? `rgba(251, 191, 36, ${Math.min(1, (iBulb2 * vBulb2) / 30)})` : '#18181b',
                              boxShadow: circuitSwitchOn ? `0 0 ${(iBulb2 * vBulb2) * 1.5}px rgba(251, 191, 36, 0.8)` : 'none'
                            }}
                          >
                            <Lightbulb size={28} className={circuitSwitchOn ? 'text-zinc-950' : 'text-zinc-600'} />
                          </div>
                          <span className="text-xs font-bold text-zinc-200">Đèn 2 ({circuitR2}Ω)</span>
                          <span className="text-[11px] font-mono text-zinc-400">{vBulb2.toFixed(1)}V • {iBulb2.toFixed(2)}A</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col justify-around h-full py-2">
                        {/* Branch 1 */}
                        <div className="flex items-center justify-between border-b border-dashed border-zinc-700 pb-2">
                          <span className="text-xs font-bold text-zinc-300">Nhánh 1 ({circuitR1}Ω)</span>
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300"
                            style={{
                              backgroundColor: circuitSwitchOn ? `rgba(251, 191, 36, ${Math.min(1, (iBulb1 * vBulb1) / 30)})` : '#18181b',
                              boxShadow: circuitSwitchOn ? `0 0 ${(iBulb1 * vBulb1) * 1.2}px rgba(251, 191, 36, 0.8)` : 'none'
                            }}
                          >
                            <Lightbulb size={20} className={circuitSwitchOn ? 'text-zinc-950' : 'text-zinc-600'} />
                          </div>
                          <span className="text-xs font-mono text-amber-300 font-bold">{vBulb1.toFixed(1)}V • {iBulb1.toFixed(2)}A</span>
                        </div>

                        {/* Branch 2 */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-bold text-zinc-300">Nhánh 2 ({circuitR2}Ω)</span>
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center transition-all duration-300"
                            style={{
                              backgroundColor: circuitSwitchOn ? `rgba(251, 191, 36, ${Math.min(1, (iBulb2 * vBulb2) / 30)})` : '#18181b',
                              boxShadow: circuitSwitchOn ? `0 0 ${(iBulb2 * vBulb2) * 1.2}px rgba(251, 191, 36, 0.8)` : 'none'
                            }}
                          >
                            <Lightbulb size={20} className={circuitSwitchOn ? 'text-zinc-950' : 'text-zinc-600'} />
                          </div>
                          <span className="text-xs font-mono text-amber-300 font-bold">{vBulb2.toFixed(1)}V • {iBulb2.toFixed(2)}A</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overload Alert Warning */}
                  {isCircuitOverload && circuitSwitchOn && (
                    <div className="bg-rose-950/80 border border-rose-500 rounded-xl p-2.5 flex items-center gap-2 text-rose-300 text-xs">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0 animate-bounce" />
                      <span><strong>Cảnh Báo Dòng Điện Vượt Ngưỡng An Toàn ({circuitItotal.toFixed(2)}A &gt; 8A):</strong> Công suất tỏa nhiệt Q = I²Rt cực lớn!</span>
                    </div>
                  )}
                </div>

                {/* Circuit Telemetry HUD */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Điện trở tương đương Rtđ</span>
                    <span className="text-base font-mono font-black text-cyan-400">
                      {circuitReq.toFixed(2)} Ω
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Dòng điện tổng I</span>
                    <span className="text-base font-mono font-black text-amber-400">
                      {circuitItotal.toFixed(2)} A
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Công suất toàn mạch P</span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      {circuitPower.toFixed(1)} W
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Trạng thái rơ le</span>
                    <span className={`text-base font-mono font-black ${isCircuitOverload ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isCircuitOverload ? 'Nguy Hiểm' : 'Bình Thường'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATION CANVAS 3: CHEMICAL REACTION VISUALIZER */}
            {activePreset.simulationType === 'reaction' && (
              <div className="flex flex-col gap-4">
                <div className="w-full h-[360px] bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-800 shadow-inner">
                  <canvas
                    ref={chemistryCanvasRef}
                    width={720}
                    height={360}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Reaction Telemetry HUD */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Nhiệt độ dung dịch T</span>
                    <span className="text-base font-mono font-black text-rose-400 flex items-center gap-1">
                      <Thermometer size={16} />
                      {reactionTemp.toFixed(1)} °C
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Trạng thái phản ứng</span>
                    <span className="text-base font-mono font-black text-emerald-400">
                      {reactionStage === 'reacting' ? 'Đang phản ứng' : 'Cân bằng'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Máy khuấy từ (Stirrer)</span>
                    <button
                      onClick={() => setIsStirrerActive(!isStirrerActive)}
                      className={`text-xs font-bold mt-1 px-2.5 py-1 rounded-lg border transition-all ${
                        isStirrerActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {isStirrerActive ? 'Đang Bật (Tăng va chạm)' : 'Đang Tắt'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">Sản phẩm đặc trưng</span>
                    <span className="text-sm font-bold text-amber-300 mt-1 block">
                      {reactionA === 'BaCl2' ? 'BaSO₄ Kết tủa trắng' : reactionA === 'Fe' ? 'H₂ Khí thoát ra' : reactionA === 'Cu' ? 'Ag Bám tinh thể' : 'NaCl + Nước'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* First Principles Deep Explanation Panel */}
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <BrainCircuit size={18} />
                <span>Bản Chất Nguyên Lý (First Principles - Tránh Học Vẹt)</span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenAiAssistant && (
                  <button
                    onClick={() => onOpenAiAssistant?.(activePreset.name, activePreset.principleSummary)}
                    className="text-xs text-teal-300 hover:text-teal-200 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>Hỏi AI Gia Sư 🤖</span>
                    <ArrowRight size={13} />
                  </button>
                )}
                <button
                  onClick={() => onOpenVideoLesson?.(activePreset.name)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Tạo Video Bài Giảng AI</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {activePreset.principleSummary}
            </p>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
              <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider text-emerald-400">
                Câu Hỏi Tư Duy Nghiên Cứu:
              </span>
              {activePreset.simulationType === 'pendulum' && (
                <p>
                  Nếu đem con lắc này lên đỉnh Fansipan (nơi g giảm nhẹ do xa tâm Trái Đất hơn), đồng hồ quả lắc sẽ chạy nhanh hơn hay chậm hơn bình thường?
                  <em> (Gợi ý: T = 2π√(L/g), khi g giảm thì T tăng, đồng hồ sẽ chạy chậm lại!)</em>
                </p>
              )}
              {activePreset.simulationType === 'circuit' && (
                <p>
                  Tại sao các ổ cắm điện trong nhà bạn luôn được đấu song song thay vì nối tiếp?
                  <em> (Gợi ý: Đấu song song để khi bạn tắt đèn phòng ngủ, tủ lạnh và quạt vẫn tiếp tục có điện 220V hoạt động!)</em>
                </p>
              )}
              {activePreset.simulationType === 'reaction' && (
                <p>
                  Tại sao khuấy đều dung dịch lại làm phản ứng xảy ra nhanh hơn?
                  <em> (Gợi ý: Tăng động năng và tần số va chạm hiệu dụng giữa các ion ngược dấu theo thuyết va chạm hoạt hóa Arrhenius!)</em>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side (Col 9-12): Real-Time Interactive Parameter Controls & Student Observation Journal */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Parameter Tuning Sliders Box */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <Sliders size={16} className="text-emerald-400" />
              <span>Điều Chỉnh Tham Số Trực Tiếp</span>
            </div>

            {/* PENDULUM PARAMETERS */}
            {activePreset.simulationType === 'pendulum' && (
              <div className="space-y-4">
                {/* Length L */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Chiều dài dây L:</span>
                    <span className="font-mono text-emerald-400 font-bold">{pendulumLength.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="4.0"
                    step="0.1"
                    value={pendulumLength}
                    onChange={(e) => setPendulumLength(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Mass m */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Khối lượng quả nặng m:</span>
                    <span className="font-mono text-amber-400 font-bold">{pendulumMass.toFixed(1)} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="10.0"
                    step="0.2"
                    value={pendulumMass}
                    onChange={(e) => setPendulumMass(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <span className="text-[10px] text-zinc-500 block italic">
                    *Thay đổi m không ảnh hưởng đến chu kỳ T
                  </span>
                </div>

                {/* Gravity selection */}
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400 block">Trường trọng lực g:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => { setPendulumGravity(9.81); setGravityLocationName('Trái Đất'); }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        pendulumGravity === 9.81
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>🌍 Trái Đất</span>
                      <span className="block text-[10px] font-mono text-zinc-400">9.81 m/s²</span>
                    </button>

                    <button
                      onClick={() => { setPendulumGravity(1.62); setGravityLocationName('Mặt Trăng'); }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        pendulumGravity === 1.62
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>🌕 Mặt Trăng</span>
                      <span className="block text-[10px] font-mono text-zinc-400">1.62 m/s²</span>
                    </button>

                    <button
                      onClick={() => { setPendulumGravity(3.71); setGravityLocationName('Sao Hỏa'); }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        pendulumGravity === 3.71
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>🔴 Sao Hỏa</span>
                      <span className="block text-[10px] font-mono text-zinc-400">3.71 m/s²</span>
                    </button>

                    <button
                      onClick={() => { setPendulumGravity(24.79); setGravityLocationName('Sao Mộc'); }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        pendulumGravity === 24.79
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>🪐 Sao Mộc</span>
                      <span className="block text-[10px] font-mono text-zinc-400">24.79 m/s²</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CIRCUIT PARAMETERS */}
            {activePreset.simulationType === 'circuit' && (
              <div className="space-y-4">
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    onClick={() => setCircuitMode('series')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      circuitMode === 'series'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-zinc-400'
                    }`}
                  >
                    Mạch Nối Tiếp
                  </button>
                  <button
                    onClick={() => setCircuitMode('parallel')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      circuitMode === 'parallel'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400'
                    }`}
                  >
                    Mạch Song Song
                  </button>
                </div>

                {/* Voltage U */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Hiệu điện thế nguồn U:</span>
                    <span className="font-mono text-amber-400 font-bold">{circuitVoltage} V</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    step="1"
                    value={circuitVoltage}
                    onChange={(e) => setCircuitVoltage(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Resistor 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Điện trở Đèn 1 (R₁):</span>
                    <span className="font-mono text-emerald-400 font-bold">{circuitR1} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={circuitR1}
                    onChange={(e) => setCircuitR1(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Resistor 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Điện trở Đèn 2 (R₂):</span>
                    <span className="font-mono text-cyan-400 font-bold">{circuitR2} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={circuitR2}
                    onChange={(e) => setCircuitR2(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* REACTION PARAMETERS */}
            {activePreset.simulationType === 'reaction' && (
              <div className="space-y-4">
                {/* Concentration A */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Nồng độ {reactionA}:</span>
                    <span className="font-mono text-sky-400 font-bold">{concA.toFixed(1)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={concA}
                    onChange={(e) => setConcA(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Concentration B */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Nồng độ {reactionB}:</span>
                    <span className="font-mono text-amber-400 font-bold">{concB.toFixed(1)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={concB}
                    onChange={(e) => setConcB(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Volume of A */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Thể tích dung dịch V(A):</span>
                    <span className="font-mono text-emerald-400 font-bold">{volA} mL</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={volA}
                    onChange={(e) => setVolA(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                <button
                  onClick={() => {
                    setReactionStage('unmixed');
                    setReactionTemp(25);
                    setTimeout(() => {
                      setReactionStage('reacting');
                      if (reactionA === 'NaOH') {
                        setReactionTemp(38.5);
                      }
                    }, 300);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Flame size={14} />
                  <span>Rót Thuốc Thử & Bắt Đầu Phản Ứng</span>
                </button>
              </div>
            )}
          </div>

          {/* Student Experiment Journal & Snapshot Box */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <FileText size={16} className="text-cyan-400" />
                <span>Ghi Nhận Vào Báo Cáo Thí Nghiệm</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Tự động lưu</span>
            </div>

            <textarea
              rows={3}
              value={studentNoteInput}
              onChange={(e) => setStudentNoteInput(e.target.value)}
              placeholder="Ghi nhận nhận xét của bạn khi thử nghiệm (ví dụ: chu kỳ tăng khi nới dài dây, nhiệt độ tăng vọt khi trung hòa...)"
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />

            <button
              onClick={handleRecordSnapshot}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <CheckCircle2 size={15} />
              <span>Chụp Kết Quả Thí Nghiệm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over / Modal for Experiment Reports */}
      {isReportDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sổ Báo Cáo Thí Nghiệm Học Sinh</h3>
                  <p className="text-xs text-zinc-400">Đã lưu {experimentRecords.length} lần thử nghiệm thực hành</p>
                </div>
              </div>

              <button
                onClick={() => setIsReportDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* List of records */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {experimentRecords.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Chưa có báo cáo nào. Hãy thực hiện mô phỏng và nhấn "Chụp Kết Quả Thí Nghiệm"!
                </div>
              ) : (
                experimentRecords.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-300">{rec.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{rec.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                        <span className="text-[10px] text-zinc-400 font-bold block mb-1">Tham Số Đầu Vào:</span>
                        {Object.entries(rec.inputs).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 text-zinc-300">
                            <span>{k}:</span>
                            <span className="font-mono font-bold text-zinc-100">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                        <span className="text-[10px] text-emerald-400 font-bold block mb-1">Kết Quả Đo Đạc:</span>
                        {Object.entries(rec.results).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 text-zinc-300">
                            <span>{k}:</span>
                            <span className="font-mono font-bold text-emerald-300">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs text-zinc-300">
                      <span className="font-bold text-amber-400 mr-1">Nhận xét:</span>
                      {rec.notes}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <button
                onClick={() => {
                  const text = experimentRecords.map(r => `[BÁO CÁO: ${r.title} - ${r.timestamp}]\n` +
                    Object.entries(r.inputs).map(([k, v]) => `- ${k}: ${v}`).join('\n') + '\n' +
                    Object.entries(r.results).map(([k, v]) => `- ${k}: ${v}`).join('\n') + '\n' +
                    `- Nhận xét: ${r.notes}\n`
                  ).join('\n---\n\n');
                  navigator.clipboard.writeText(text);
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2500);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-colors"
              >
                {copiedReport ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedReport ? 'Đã sao chép báo cáo' : 'Sao chép toàn bộ báo cáo'}</span>
              </button>

              <button
                onClick={() => setIsReportDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
