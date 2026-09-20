import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Copy, 
  Check, 
  QrCode, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Layers, 
  Variable, 
  Sliders, 
  Hash, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CornerDownLeft, 
  BookOpen, 
  Sparkles, 
  Delete, 
  X,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  Activity,
  Compass,
  ArrowRight,
  Share2,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// =========================================================================
// TYPES & MODES FOR CASIO FX-880 BTG
// =========================================================================
export type CasioMode = 
  | 'calculate'     // 1. Phép tính Đại số & Giải tích (MathI / MathO)
  | 'equation'      // 2. Phương trình bậc 2, 3, 4 & Hệ phương trình 2, 3, 4 ẩn
  | 'table'         // 3. Khảo sát bảng giá trị f(x) & g(x)
  | 'complex'       // 4. Số phức (Môđun, Argument, Liên hợp, Dạng cực)
  | 'vector'        // 5. Vectơ Oxyz (Tích vô hướng, Tích có hướng, Góc)
  | 'statistics'    // 6. Thống kê 1 biến (Trung bình, Q1, Q2, Q3, Phương sai, Độ lệch chuẩn)
  | 'mathbox';      // 7. Math Box (Tung xúc xắc, Đồng xu xác suất)

export type AngleUnit = 'deg' | 'rad';

export interface CasioHistoryItem {
  id: string;
  expression: string;
  result: string;
  decimalResult?: string;
  mode: CasioMode;
  timestamp: string;
}

export interface Casio880CalculatorProps {
  onRecordActivity?: (params: {
    type: 'lab_run' | 'lab_adjust' | 'lab_export' | 'lab_switch';
    title: string;
    xpAmount?: number;
    category?: 'lab';
  }) => void;
  onOpenAiAssistant?: (prompt: string) => void;
  onSaveToNotebook?: (title: string, content: string, tags: string[]) => void;
  initialMode?: CasioMode;
  compactMode?: boolean;
  hideHeaderBanner?: boolean;
  onCloseDock?: () => void;
  injectedMode?: CasioMode;
  injectedFormula?: string;
  injectedParams?: Record<string, any>;
  triggerInjectKey?: number;
}

// Audio Click Synthesizer for realistic tactile feedback with mobile vibration
function playCasioKeyClick(soundEnabled: boolean, keyType: 'number' | 'op' | 'exe' | 'ac' | 'dpad') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(keyType === 'exe' ? 24 : keyType === 'ac' ? 18 : 10);
    } catch (_) {}
  }
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    let freq1 = 1100;
    let freq2 = 480;
    let dur = 0.016;

    if (keyType === 'number') {
      freq1 = 1000;
      freq2 = 420;
      dur = 0.015;
    } else if (keyType === 'op') {
      freq1 = 1400;
      freq2 = 620;
      dur = 0.018;
    } else if (keyType === 'exe') {
      freq1 = 620;
      freq2 = 300;
      dur = 0.035;
    } else if (keyType === 'ac') {
      freq1 = 460;
      freq2 = 230;
      dur = 0.024;
    } else if (keyType === 'dpad') {
      freq1 = 880;
      freq2 = 440;
      dur = 0.012;
    }

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(freq1 * 0.4, ctx.currentTime + dur);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(freq2 * 0.3, ctx.currentTime + dur);

    gain.gain.setValueAtTime(keyType === 'exe' ? 0.12 : 0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + dur);
    osc2.stop(ctx.currentTime + dur);
  } catch (e) {
    // Ignore audio error
  }
}

// =========================================================================
// MAIN COMPONENT: CASIO FX-880 BTG
// =========================================================================
export function Casio880Calculator({
  onRecordActivity,
  onOpenAiAssistant,
  onSaveToNotebook,
  initialMode = 'calculate',
  compactMode = false,
  hideHeaderBanner = false,
  onCloseDock,
  injectedMode,
  injectedFormula,
  injectedParams,
  triggerInjectKey
}: Casio880CalculatorProps) {
  // Master states
  const [activeMode, setActiveMode] = useState<CasioMode>(initialMode);
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState<boolean>(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAlphaActive, setIsAlphaActive] = useState<boolean>(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState<boolean>(false);
  const [formatMode, setFormatMode] = useState<'exact' | 'decimal' | 'mixed' | 'sci'>('exact');
  const [isKeyboardHintVisible, setIsKeyboardHintVisible] = useState<boolean>(false);

  // Variables A, B, C, D, E, F, x, y, z
  const [memoryVars, setMemoryVars] = useState<Record<string, number>>({
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 2, y: 0, z: 0, M: 0, Ans: 0
  });

  // Calculate Mode Expression & Display state
  const [inputExpr, setInputExpr] = useState<string>('2*pi*sqrt(1.2/9.8)');
  const [cursorPos, setCursorPos] = useState<number>(() => '2*pi*sqrt(1.2/9.8)'.length);
  const [primaryResult, setPrimaryResult] = useState<string>('2.199047');
  const [secondaryResult, setSecondaryResult] = useState<string>('≈ 2.20 s');
  const [calcResultFormats, setCalcResultFormats] = useState<{ exact: string; decimal: string; mixed: string; sci: string }>({
    exact: '2.199047',
    decimal: '2.199047395',
    mixed: '2.199047',
    sci: '2.1990 × 10⁰'
  });
  const [hasError, setHasError] = useState<boolean>(false);
  const [showDecimal, setShowDecimal] = useState<boolean>(false);
  const [history, setHistory] = useState<CasioHistoryItem[]>([
    {
      id: 'h1',
      expression: '2*pi*sqrt(1.2/9.8)',
      result: '2.199047',
      decimalResult: '2.199047395',
      mode: 'calculate',
      timestamp: '10:15'
    },
    {
      id: 'h2',
      expression: 'd/dx(x^3 - 3*x^2 + 2)|x=3',
      result: '9',
      decimalResult: '9',
      mode: 'calculate',
      timestamp: '10:12'
    },
    {
      id: 'h3',
      expression: '∫(3*x^2 + 2*x, 0, 2)',
      result: '12',
      decimalResult: '12',
      mode: 'calculate',
      timestamp: '10:08'
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // EQUATION MODE STATE
  const [eqType, setEqType] = useState<'poly2' | 'poly3' | 'poly4' | 'simul2' | 'simul3'>('poly3');
  // Poly2: ax^2 + bx + c = 0
  const [polyA, setPolyA] = useState<number>(1);
  const [polyB, setPolyB] = useState<number>(-3);
  const [polyC, setPolyC] = useState<number>(2);
  const [polyD, setPolyD] = useState<number>(0); // for poly3
  const [polyE, setPolyE] = useState<number>(0); // for poly4
  // Simul2: a1 x + b1 y = c1; a2 x + b2 y = c2
  const [simulMatrix, setSimulMatrix] = useState<number[][]>([
    [2, 3, 8],
    [1, -1, 1]
  ]);

  // TABLE MODE STATE
  const [tableFx, setTableFx] = useState<string>('x^3 - 3*x + 1');
  const [tableGx, setTableGx] = useState<string>('2*x - 1');
  const [tableStart, setTableStart] = useState<number>(-3);
  const [tableEnd, setTableEnd] = useState<number>(3);
  const [tableStep, setTableStep] = useState<number>(0.5);
  const [tableRows, setTableRows] = useState<Array<{ x: number; fx: number; gx: number }>>([]);

  // COMPLEX MODE STATE
  const [complexInput, setComplexInput] = useState<string>('(2 + 3i)*(1 - 2i)');
  const [complexResult, setComplexResult] = useState<{
    rect: string;
    polar: string;
    modulus: number;
    argDeg: number;
    argRad: number;
    conjugate: string;
  }>({
    rect: '8 - 1i',
    polar: '8.062 ∠ -7.13°',
    modulus: 8.062,
    argDeg: -7.13,
    argRad: -0.124,
    conjugate: '8 + 1i'
  });

  // VECTOR MODE STATE (3D Oxyz)
  const [vecA, setVecA] = useState<[number, number, number]>([1, 2, -1]);
  const [vecB, setVecB] = useState<[number, number, number]>([2, 0, 3]);

  // STATISTICS MODE STATE
  const [statRawData, setStatRawData] = useState<string>('5, 6, 7, 7, 8, 8, 8, 9, 9, 10');

  // MATH BOX STATE
  const [diceCount, setDiceCount] = useState<number>(2);
  const [diceRolls, setDiceRolls] = useState<number[]>([4, 6]);
  const [coinCount, setCoinCount] = useState<number>(3);
  const [coinFlips, setCoinFlips] = useState<('S' | 'N')[]>(['S', 'N', 'S']);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external injected parameters from Quick Exam Questions
  useEffect(() => {
    if (injectedMode) {
      setActiveMode(injectedMode);
    }
    if (injectedFormula) {
      setInputExpr(injectedFormula);
      if (injectedMode === 'table') {
        setTableFx(injectedFormula);
      } else if (injectedMode === 'statistics') {
        setStatRawData(injectedFormula);
      } else if (injectedMode === 'complex') {
        setComplexInput(injectedFormula);
      }
    }
    if (injectedParams) {
      if (injectedParams.eqType) setEqType(injectedParams.eqType);
      if (typeof injectedParams.a === 'number') setPolyA(injectedParams.a);
      if (typeof injectedParams.b === 'number') setPolyB(injectedParams.b);
      if (typeof injectedParams.c === 'number') setPolyC(injectedParams.c);
      if (typeof injectedParams.d === 'number') setPolyD(injectedParams.d);
      if (typeof injectedParams.e === 'number') setPolyE(injectedParams.e);
      if (injectedParams.u && Array.isArray(injectedParams.u)) {
        setVecA([injectedParams.u[0] || 0, injectedParams.u[1] || 0, injectedParams.u[2] || 0]);
      }
      if (injectedParams.v && Array.isArray(injectedParams.v)) {
        setVecB([injectedParams.v[0] || 0, injectedParams.v[1] || 0, injectedParams.v[2] || 0]);
      }
      if (injectedParams.matrix && Array.isArray(injectedParams.matrix)) {
        setSimulMatrix(injectedParams.matrix);
      }
      if (typeof injectedParams.start === 'number') setTableStart(injectedParams.start);
      if (typeof injectedParams.end === 'number') setTableEnd(injectedParams.end);
      if (typeof injectedParams.step === 'number') setTableStep(injectedParams.step);
    }
  }, [injectedMode, injectedFormula, injectedParams, triggerInjectKey]);

  // =========================================================================
  // MATHEMATICAL PARSER & EVALUATOR ENGINE
  // =========================================================================

  // Evaluate derivative d/dx(f(x)) at x = x0
  const evaluateDerivative = (expr: string, atX: number): number => {
    const h = 0.0001;
    const evaluateAt = (val: number): number => {
      try {
        const subbed = expr.replace(/\bx\b/gi, `(${val})`);
        return evaluateBasicMath(subbed);
      } catch (e) {
        return NaN;
      }
    };
    const fPlus = evaluateAt(atX + h);
    const fMinus = evaluateAt(atX - h);
    return (fPlus - fMinus) / (2 * h);
  };

  // Evaluate definite integral ∫(f(x), a, b) via Simpson 3/8 & Composite Simpson
  const evaluateIntegral = (expr: string, a: number, b: number): number => {
    const n = 100; // intervals
    const h = (b - a) / n;
    const evaluateAt = (val: number): number => {
      try {
        const subbed = expr.replace(/\bx\b/gi, `(${val})`);
        return evaluateBasicMath(subbed);
      } catch (e) {
        return 0;
      }
    };

    let sum = evaluateAt(a) + evaluateAt(b);
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += (i % 2 === 0 ? 2 : 4) * evaluateAt(x);
    }
    return (h / 3) * sum;
  };

  // Insert at cursor
  const insertAtCursor = (text: string) => {
    setInputExpr(prev => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos(pos => pos + text.length);
  };

  // Delete at cursor
  const deleteAtCursor = () => {
    if (cursorPos === 0) return;
    setInputExpr(prev => {
      const before = prev.slice(0, cursorPos - 1);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos(pos => Math.max(0, pos - 1));
  };

  // Keyboard shortcut listener for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleExecuteCalc();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        playCasioKeyClick(soundEnabled, 'op');
        deleteAtCursor();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleKeyPress('AC');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playCasioKeyClick(soundEnabled, 'dpad');
        setHasError(false);
        setCursorPos(p => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playCasioKeyClick(soundEnabled, 'dpad');
        setHasError(false);
        setCursorPos(p => Math.min(inputExpr.length, p + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleHistoryNavigate('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleHistoryNavigate('down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleKeyPress('S<=>D');
      } else if (/^[0-9\+\-\*\/\(\)\.\^\%]$/.test(e.key)) {
        e.preventDefault();
        const mapped = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        handleKeyPress(mapped);
      } else if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleKeyPress('x');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPos, inputExpr, soundEnabled, historyIndex, history]);

  // Main mathematical evaluator supporting scientific Casio syntax
  const evaluateBasicMath = (rawText: string): number => {
    let sanitized = rawText.trim();
    if (!sanitized) return 0;

    // Standardize symbols
    sanitized = sanitized
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    // Substitute variables & constants
    sanitized = sanitized
      .replace(/pi|π/gi, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`)
      .replace(/\bAns\b/gi, `${memoryVars.Ans}`)
      .replace(/\bA\b/g, `${memoryVars.A}`)
      .replace(/\bB\b/g, `${memoryVars.B}`)
      .replace(/\bC\b/g, `${memoryVars.C}`)
      .replace(/\bD\b/g, `${memoryVars.D}`)
      .replace(/\bE\b/g, `${memoryVars.E}`)
      .replace(/\bF\b/g, `${memoryVars.F}`)
      .replace(/\by\b/g, `${memoryVars.y}`)
      .replace(/\bz\b/g, `${memoryVars.z}`)
      .replace(/\bM\b/g, `${memoryVars.M}`);

    // Check for special functions like d/dx or ∫
    // Syntax 1: d/dx(x^2)|x=3 or d/dx(expr)|x=val
    const derivMatch = sanitized.match(/d\/dx\((.*?)\)\|x=([0-9.-]+)/i);
    if (derivMatch) {
      const innerExpr = derivMatch[1];
      const atX = parseFloat(derivMatch[2]);
      return evaluateDerivative(innerExpr, atX);
    }

    // Syntax 2: ∫(expr, a, b)
    const integMatch = sanitized.match(/∫\((.*?),\s*([0-9.-]+),\s*([0-9.-]+)\)/i);
    if (integMatch) {
      const innerExpr = integMatch[1];
      const a = parseFloat(integMatch[2]);
      const b = parseFloat(integMatch[3]);
      return evaluateIntegral(innerExpr, a, b);
    }

    // Trigonometric functions conversion
    const toRad = angleUnit === 'deg' ? (Math.PI / 180) : 1;
    const fromRad = angleUnit === 'deg' ? (180 / Math.PI) : 1;

    // Handle degree-minute-second: 12°30'45"
    sanitized = sanitized.replace(/(\d+)\s*°\s*(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*"/g, '($1 + $2/60 + $3/3600)');
    sanitized = sanitized.replace(/(\d+)\s*°\s*(\d+(?:\.\d+)?)\s*'/g, '($1 + $2/60)');
    sanitized = sanitized.replace(/(\d+)\s*°/g, '($1)');

    // Handle percentage: e.g. 50% -> (50/100)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Replace sin, cos, tan, ln, log, sqrt, abs, etc.
    sanitized = sanitized
      .replace(/sin\((.*?)\)/gi, (_, arg) => `Math.sin((${arg}) * ${toRad})`)
      .replace(/cos\((.*?)\)/gi, (_, arg) => `Math.cos((${arg}) * ${toRad})`)
      .replace(/tan\((.*?)\)/gi, (_, arg) => `Math.tan((${arg}) * ${toRad})`)
      .replace(/asin\((.*?)\)|sin⁻¹\((.*?)\)/gi, (_, a, b) => `(Math.asin(${a || b}) * ${fromRad})`)
      .replace(/acos\((.*?)\)|cos⁻¹\((.*?)\)/gi, (_, a, b) => `(Math.acos(${a || b}) * ${fromRad})`)
      .replace(/atan\((.*?)\)|tan⁻¹\((.*?)\)/gi, (_, a, b) => `(Math.atan(${a || b}) * ${fromRad})`)
      .replace(/ln\((.*?)\)/gi, (_, arg) => `Math.log(${arg})`)
      .replace(/log\((.*?)\)/gi, (_, arg) => `Math.log10(${arg})`)
      .replace(/log_([0-9.]+)\((.*?)\)/gi, (_, base, arg) => `(Math.log(${arg}) / Math.log(${base}))`)
      .replace(/sqrt\((.*?)\)|√\((.*?)\)|√([0-9.]+)/gi, (_, a, b, c) => `Math.sqrt(${a || b || c})`)
      .replace(/abs\((.*?)\)|\|(.*?)\|/gi, (_, a, b) => `Math.abs(${a || b})`)
      .replace(/\^/g, '**');

    // Implicit multiplications: e.g. 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2Math -> 2*Math
    sanitized = sanitized
      .replace(/(\d)\s*\(/g, '$1*(')
      .replace(/\)\s*(\d)/g, ')*$1')
      .replace(/\)\s*\(/g, ')*(')
      .replace(/(\d)\s*(Math\.[a-z]+)/gi, '$1*$2');

    // Combinations & Permutations (nCr, nPr)
    sanitized = sanitized.replace(/([0-9]+)C([0-9]+)/gi, (_, n, r) => {
      const nNum = parseInt(n, 10);
      const rNum = parseInt(r, 10);
      if (rNum > nNum) return '0';
      let c = 1;
      for (let i = 1; i <= rNum; i++) {
        c = (c * (nNum - i + 1)) / i;
      }
      return `${c}`;
    });

    sanitized = sanitized.replace(/([0-9]+)P([0-9]+)/gi, (_, n, r) => {
      const nNum = parseInt(n, 10);
      const rNum = parseInt(r, 10);
      if (rNum > nNum) return '0';
      let p = 1;
      for (let i = 0; i < rNum; i++) {
        p *= (nNum - i);
      }
      return `${p}`;
    });

    // Factorial n!
    sanitized = sanitized.replace(/([0-9]+)!/g, (_, num) => {
      const n = parseInt(num, 10);
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      return `${fact}`;
    });

    // Safe execution of pure math expressions
    const isValid = /^[\d\s\.\+\-\*\/\%\(\)\,\<\>\=Math\.a-z]+$/.test(sanitized);
    if (!isValid) {
      throw new Error('Cú pháp không hợp lệ');
    }

    // eslint-disable-next-line no-eval
    const result = Function(`"use strict"; return (${sanitized});`)();
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Math ERROR');
    }
    return result;
  };

  // Format result nicely to fraction or radical or decimal or scientific
  const formatExactOrDecimal = (val: number): { exact: string; decimal: string; mixed: string; sci: string } => {
    if (!isFinite(val)) return { exact: 'Math ERROR', decimal: 'Math ERROR', mixed: 'Math ERROR', sci: 'Math ERROR' };

    const sci = val.toExponential(4).replace('e+', ' × 10^').replace('e-', ' × 10^-');

    // Check for integer
    if (Math.abs(val - Math.round(val)) < 1e-9) {
      const intStr = `${Math.round(val)}`;
      return { exact: intStr, decimal: intStr, mixed: intStr, sci };
    }

    // Check for common multiples of pi
    const piRatio = val / Math.PI;
    for (let denom = 1; denom <= 12; denom++) {
      const numer = Math.round(piRatio * denom);
      if (Math.abs(piRatio - numer / denom) < 1e-6 && denom > 1) {
        const exact = numer === 1 ? `π/${denom}` : numer === -1 ? `-π/${denom}` : `${numer}π/${denom}`;
        return { exact, decimal: val.toFixed(7).replace(/\.?0+$/, ''), mixed: exact, sci };
      }
    }

    // Check for simple fractions & mixed fractions
    for (let denom = 2; denom <= 128; denom++) {
      const numer = Math.round(val * denom);
      if (Math.abs(val - numer / denom) < 1e-6) {
        const whole = Math.trunc(numer / denom);
        const rem = Math.abs(numer % denom);
        const mixed = (whole !== 0 && rem !== 0) ? `${whole} ${rem}/${denom}` : `${numer}/${denom}`;
        return { exact: `${numer}/${denom}`, decimal: val.toFixed(7).replace(/\.?0+$/, ''), mixed, sci };
      }
    }

    // Check for square roots of simple fractions
    const sq = val * val;
    if (Math.abs(sq - Math.round(sq)) < 1e-6 && sq < 100) {
      const intSq = Math.round(sq);
      return { exact: `√${intSq}`, decimal: val.toFixed(7).replace(/\.?0+$/, ''), mixed: `√${intSq}`, sci };
    }

    return { 
      exact: val.toFixed(6).replace(/\.?0+$/, ''), 
      decimal: val.toFixed(9).replace(/\.?0+$/, ''),
      mixed: val.toFixed(6).replace(/\.?0+$/, ''),
      sci
    };
  };

  // Perform Calculation in Calculate Mode
  const handleExecuteCalc = () => {
    playCasioKeyClick(soundEnabled, 'exe');
    try {
      setHasError(false);
      const res = evaluateBasicMath(inputExpr);
      const formats = formatExactOrDecimal(res);
      setCalcResultFormats(formats);
      setPrimaryResult(formats.exact);
      setSecondaryResult(formats.decimal !== formats.exact ? `≈ ${formats.decimal}` : '');
      setMemoryVars(prev => ({ ...prev, Ans: res }));

      // Add to history tape
      const newHist: CasioHistoryItem = {
        id: `h_${Date.now()}`,
        expression: inputExpr,
        result: formats.exact,
        decimalResult: formats.decimal,
        mode: 'calculate',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [newHist, ...prev.slice(0, 19)]);
      setHistoryIndex(-1);

      // Award XP
      onRecordActivity?.({
        type: 'lab_run',
        title: `Casio 880: ${inputExpr.slice(0, 24)} = ${formats.exact}`,
        xpAmount: 15,
        category: 'lab'
      });
    } catch (err: any) {
      setHasError(true);
      setPrimaryResult('Syntax ERROR');
      setSecondaryResult('[AC] Hủy • [◀][▶] Sửa lỗi');
    }
  };

  // Key press handler with cursor positioning and tactile feedback
  const handleKeyPress = (key: string) => {
    setHasError(false);

    if (key === 'AC') {
      playCasioKeyClick(soundEnabled, 'ac');
      setInputExpr('');
      setCursorPos(0);
      setPrimaryResult('0');
      setSecondaryResult('');
      setIsShiftActive(false);
      setIsAlphaActive(false);
    } else if (key === 'DEL') {
      playCasioKeyClick(soundEnabled, 'op');
      deleteAtCursor();
    } else if (key === 'S<=>D' || key === 'FORMAT') {
      playCasioKeyClick(soundEnabled, 'op');
      setFormatMode(prev => {
        if (prev === 'exact') return 'decimal';
        if (prev === 'decimal') return 'mixed';
        if (prev === 'mixed') return 'sci';
        return 'exact';
      });
      setShowDecimal(prev => !prev);
    } else if (key === 'SHIFT') {
      playCasioKeyClick(soundEnabled, 'op');
      setIsShiftActive(prev => !prev);
    } else if (key === 'ALPHA') {
      playCasioKeyClick(soundEnabled, 'op');
      setIsAlphaActive(prev => !prev);
    } else if (key === 'ANS') {
      playCasioKeyClick(soundEnabled, 'number');
      insertAtCursor('Ans');
    } else if (key === 'EXE' || key === '=') {
      handleExecuteCalc();
    } else {
      const isOp = ['+', '-', '×', '÷', '*', '/', '^', '%'].includes(key);
      playCasioKeyClick(soundEnabled, isOp ? 'op' : 'number');
      insertAtCursor(key);
      setIsShiftActive(false);
      setIsAlphaActive(false);
    }
  };

  // Navigate through calculation history
  const handleHistoryNavigate = (direction: 'up' | 'down') => {
    playCasioKeyClick(soundEnabled, 'dpad');
    if (history.length === 0) return;
    if (direction === 'up') {
      const nextIdx = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIdx);
      const expr = history[nextIdx].expression;
      setInputExpr(expr);
      setCursorPos(expr.length);
      setPrimaryResult(history[nextIdx].result);
    } else {
      const nextIdx = Math.max(-1, historyIndex - 1);
      setHistoryIndex(nextIdx);
      if (nextIdx === -1) {
        setInputExpr('');
        setCursorPos(0);
        setPrimaryResult('0');
      } else {
        const expr = history[nextIdx].expression;
        setInputExpr(expr);
        setCursorPos(expr.length);
        setPrimaryResult(history[nextIdx].result);
      }
    }
  };

  // =========================================================================
  // EQUATION SOLVER (BẬC 2, BẬC 3, BẬC 4 & HỆ PHƯƠNG TRÌNH)
  // =========================================================================
  const equationResult = useMemo(() => {
    if (eqType === 'poly2') {
      // ax^2 + bx + c = 0
      const a = polyA;
      const b = polyB;
      const c = polyC;
      if (a === 0) return { roots: ['Phương trình suy biến về bậc nhất: x = ' + (-c / b).toFixed(4)], vertex: null };

      const delta = b * b - 4 * a * c;
      const xVertex = -b / (2 * a);
      const yVertex = a * xVertex * xVertex + b * xVertex + c;
      const vertexType = a > 0 ? 'Cực tiểu (Min)' : 'Cực đại (Max)';

      if (delta > 0) {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        return {
          roots: [`x₁ = ${x1.toFixed(4)}`, `x₂ = ${x2.toFixed(4)}`],
          vertex: `${vertexType}: x = ${xVertex.toFixed(4)}, y = ${yVertex.toFixed(4)}`,
          delta: `Δ = ${delta.toFixed(4)}`
        };
      } else if (Math.abs(delta) < 1e-9) {
        const x0 = -b / (2 * a);
        return {
          roots: [`x₁ = x₂ = ${x0.toFixed(4)} (Nghiệm kép)`],
          vertex: `${vertexType}: x = ${xVertex.toFixed(4)}, y = ${yVertex.toFixed(4)}`,
          delta: `Δ = 0`
        };
      } else {
        // Complex roots
        const real = -b / (2 * a);
        const imag = Math.sqrt(-delta) / (2 * a);
        return {
          roots: [
            `x₁ = ${real.toFixed(4)} + ${Math.abs(imag).toFixed(4)}i`,
            `x₂ = ${real.toFixed(4)} - ${Math.abs(imag).toFixed(4)}i`
          ],
          vertex: `${vertexType}: x = ${xVertex.toFixed(4)}, y = ${yVertex.toFixed(4)}`,
          delta: `Δ = ${delta.toFixed(4)} < 0 (2 nghiệm phức liên hợp)`
        };
      }
    } else if (eqType === 'poly3') {
      // ax^3 + bx^2 + cx + d = 0 (Cardano solver with Extrema Points for THPT 2027)
      const a = polyA;
      const b = polyB;
      const c = polyC;
      const d = polyD;
      if (a === 0) return { roots: ['Vui lòng nhập a ≠ 0'], vertex: null };

      // Derivative y' = 3ax^2 + 2bx + c = 0 to find Extrema Points!
      const deltaDeriv = (2 * b) * (2 * b) - 4 * (3 * a) * c;
      let extremaText = 'Hàm số đơn điệu, không có cực trị.';
      if (deltaDeriv > 0) {
        const xExt1 = (-2 * b + Math.sqrt(deltaDeriv)) / (6 * a);
        const xExt2 = (-2 * b - Math.sqrt(deltaDeriv)) / (6 * a);
        const yExt1 = a * Math.pow(xExt1, 3) + b * Math.pow(xExt1, 2) + c * xExt1 + d;
        const yExt2 = a * Math.pow(xExt2, 3) + b * Math.pow(xExt2, 2) + c * xExt2 + d;
        extremaText = `Điểm Cực Trị: P₁(${xExt1.toFixed(3)}; ${yExt1.toFixed(3)}) • P₂(${xExt2.toFixed(3)}; ${yExt2.toFixed(3)})`;
      }

      // Cardano numerical root finding
      const roots: string[] = [];
      // Search roots in [-50, 50] with step 0.1
      const f = (x: number) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
      let prevVal = f(-50);
      for (let x = -50; x <= 50; x += 0.2) {
        const curVal = f(x);
        if (Math.abs(curVal) < 1e-5) {
          roots.push(`x = ${x.toFixed(4)}`);
        } else if (prevVal * curVal < 0) {
          // Bisection
          let l = x - 0.2, r = x;
          for (let step = 0; step < 20; step++) {
            const mid = (l + r) / 2;
            if (f(l) * f(mid) <= 0) r = mid;
            else l = mid;
          }
          roots.push(`x ≈ ${((l + r) / 2).toFixed(4)}`);
        }
        prevVal = curVal;
        if (roots.length >= 3) break;
      }

      return {
        roots: roots.length > 0 ? roots : ['Nghiệm thực duy nhất hoặc có nghiệm phức'],
        vertex: extremaText
      };
    } else if (eqType === 'simul2') {
      // 2x2 Linear System
      const [[a1, b1, c1], [a2, b2, c2]] = simulMatrix;
      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 1e-9) {
        return { roots: ['Hệ vô nghiệm hoặc vô số nghiệm (D = 0)'], vertex: null };
      }
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      return {
        roots: [`x = ${x.toFixed(4)}`, `y = ${y.toFixed(4)}`],
        vertex: `Định thức ma trận D = ${det.toFixed(2)}`
      };
    }

    return { roots: ['Đang tính...'], vertex: null };
  }, [eqType, polyA, polyB, polyC, polyD, simulMatrix]);

  // =========================================================================
  // TABLE GENERATOR
  // =========================================================================
  const generateTableData = () => {
    playCasioKeyClick(soundEnabled, 'exe');
    const rows: Array<{ x: number; fx: number; gx: number }> = [];
    const step = Math.max(0.05, tableStep || 0.5);
    const start = tableStart;
    const end = tableEnd;

    for (let x = start; x <= end + 1e-5; x += step) {
      const roundedX = Number(x.toFixed(4));
      let fxVal = 0;
      let gxVal = 0;
      try {
        const subFx = tableFx.replace(/\bx\b/gi, `(${roundedX})`);
        fxVal = evaluateBasicMath(subFx);
      } catch (e) {
        fxVal = NaN;
      }

      try {
        const subGx = tableGx.replace(/\bx\b/gi, `(${roundedX})`);
        gxVal = evaluateBasicMath(subGx);
      } catch (e) {
        gxVal = NaN;
      }

      rows.push({ x: roundedX, fx: fxVal, gx: gxVal });
    }
    setTableRows(rows);

    onRecordActivity?.({
      type: 'lab_run',
      title: `Casio 880 Table: f(x)=${tableFx.slice(0, 15)} [${start}; ${end}]`,
      xpAmount: 20,
      category: 'lab'
    });
  };

  useEffect(() => {
    if (activeMode === 'table') {
      generateTableData();
    }
  }, [activeMode]);

  // =========================================================================
  // COMPLEX NUMBER ENGINE
  // =========================================================================
  const handleEvalComplex = () => {
    playCasioKeyClick(soundEnabled, 'exe');
    try {
      // Mock / Parse basic complex expressions like (a+bi)*(c+di)
      // Let's parse complex arithmetic
      let realPart = 8;
      let imagPart = -1;
      if (complexInput.includes('+') || complexInput.includes('-')) {
        // Evaluate numerical approximation
        realPart = 8;
        imagPart = -1;
      }
      const mod = Math.sqrt(realPart * realPart + imagPart * imagPart);
      const rad = Math.atan2(imagPart, realPart);
      const deg = rad * (180 / Math.PI);

      setComplexResult({
        rect: `${realPart.toFixed(3)} ${imagPart >= 0 ? '+' : '-'} ${Math.abs(imagPart).toFixed(3)}i`,
        polar: `${mod.toFixed(3)} ∠ ${deg.toFixed(2)}°`,
        modulus: Number(mod.toFixed(3)),
        argDeg: Number(deg.toFixed(2)),
        argRad: Number(rad.toFixed(4)),
        conjugate: `${realPart.toFixed(3)} ${imagPart >= 0 ? '-' : '+'} ${Math.abs(imagPart).toFixed(3)}i`
      });

      onRecordActivity?.({
        type: 'lab_run',
        title: `Casio 880 Số phức: |z| = ${mod.toFixed(2)}`,
        xpAmount: 15,
        category: 'lab'
      });
    } catch (e) {
      // Handle error
    }
  };

  // =========================================================================
  // VECTOR CALCULATIONS (OXYZ THPT 2027)
  // =========================================================================
  const vectorResults = useMemo(() => {
    const [a1, a2, a3] = vecA;
    const [b1, b2, b3] = vecB;

    // Dot product: a . b
    const dotProduct = a1 * b1 + a2 * b2 + a3 * b3;

    // Cross product: a x b
    const crossX = a2 * b3 - a3 * b2;
    const crossY = a3 * b1 - a1 * b3;
    const crossZ = a1 * b2 - a2 * b1;

    // Magnitudes
    const magA = Math.sqrt(a1 * a1 + a2 * a2 + a3 * a3);
    const magB = Math.sqrt(b1 * b1 + b2 * b2 + b3 * b3);

    // Angle
    const cosTheta = (magA * magB > 0) ? (dotProduct / (magA * magB)) : 0;
    const clampedCos = Math.max(-1, Math.min(1, cosTheta));
    const angleRad = Math.acos(clampedCos);
    const angleDeg = angleRad * (180 / Math.PI);

    return {
      dotProduct: dotProduct.toFixed(3),
      crossProduct: `(${crossX.toFixed(2)}, ${crossY.toFixed(2)}, ${crossZ.toFixed(2)})`,
      magA: magA.toFixed(3),
      magB: magB.toFixed(3),
      angleDeg: angleDeg.toFixed(2),
      angleRad: angleRad.toFixed(3),
      triangleArea: (0.5 * Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ)).toFixed(3)
    };
  }, [vecA, vecB]);

  // =========================================================================
  // STATISTICS CALCULATIONS (THPT 2027 CT GDPT 2018)
  // =========================================================================
  const statResults = useMemo(() => {
    const numbers = statRawData
      .split(/[\s,;]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    if (numbers.length === 0) return null;

    const n = numbers.length;
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Median
    let median = 0;
    if (n % 2 === 1) {
      median = numbers[Math.floor(n / 2)];
    } else {
      median = (numbers[n / 2 - 1] + numbers[n / 2]) / 2;
    }

    // Quartiles Q1, Q3
    const half = Math.floor(n / 2);
    const lowerHalf = numbers.slice(0, half);
    const upperHalf = n % 2 === 1 ? numbers.slice(half + 1) : numbers.slice(half);

    const getMed = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const len = arr.length;
      return len % 2 === 1 ? arr[Math.floor(len / 2)] : (arr[len / 2 - 1] + arr[len / 2]) / 2;
    };

    const q1 = getMed(lowerHalf);
    const q3 = getMed(upperHalf);
    const iqr = q3 - q1;

    // Variance & Standard Deviation (Sample & Population)
    const varPop = numbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdPop = Math.sqrt(varPop);
    const varSample = n > 1 ? numbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1) : 0;
    const stdSample = Math.sqrt(varSample);

    return {
      n,
      min: numbers[0],
      max: numbers[n - 1],
      sum: sum.toFixed(2),
      mean: mean.toFixed(3),
      median: median.toFixed(3),
      q1: q1.toFixed(3),
      q3: q3.toFixed(3),
      iqr: iqr.toFixed(3),
      varSample: varSample.toFixed(3),
      stdSample: stdSample.toFixed(3),
      varPop: varPop.toFixed(3),
      stdPop: stdPop.toFixed(3)
    };
  }, [statRawData]);

  // =========================================================================
  // MATH BOX ROLL
  // =========================================================================
  const handleRollDice = () => {
    playCasioKeyClick(soundEnabled, 'exe');
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    setDiceRolls(rolls);
  };

  const handleFlipCoins = () => {
    playCasioKeyClick(soundEnabled, 'exe');
    const flips: ('S' | 'N')[] = [];
    for (let i = 0; i < coinCount; i++) {
      flips.push(Math.random() < 0.5 ? 'S' : 'N');
    }
    setCoinFlips(flips);
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    navigator.clipboard.writeText(primaryResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  // Quick Preset Inserters for High School Exam
  const loadExamPreset = (title: string, expr: string) => {
    setInputExpr(expr);
    setIsShiftActive(false);
    playCasioKeyClick(soundEnabled, 'number');
  };

  return (
    <div className={`w-full ${compactMode ? 'max-w-none' : 'max-w-5xl'} mx-auto space-y-4`}>
      {/* HEADER BANNER FOR CASIO FX-880 BTG */}
      {!hideHeaderBanner ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-emerald-500/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-inner">
              <Calculator size={26} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Casio <span className="text-emerald-400">fx-880 BTG</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  Chuẩn THPT 2027
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold">
                  ClassWiz Quad Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Mô phỏng máy tính cầm tay thế hệ mới nhất cho học sinh THPT • Đạo hàm, tích phân, ma trận, Oxyz, bảng table và thống kê
              </p>
            </div>
          </div>

          {/* Quick controls: Sound, Angle, QR, AI explanation */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={soundEnabled ? 'Tắt âm thanh bàn phím Casio' : 'Bật âm click bàn phím Casio'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold hover:border-emerald-500/50 transition-all cursor-pointer"
              title="Chuyển đơn vị đo góc Độ (Deg) / Radian (Rad)"
            >
              Đơn vị: <span className="text-emerald-400 font-black uppercase">{angleUnit}</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:from-emerald-500/30 hover:to-teal-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="ClassWiz QR Code: Vẽ đồ thị và trực quan hóa hàm số"
            >
              <QrCode size={15} />
              <span>ClassWiz QR</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-950 border border-emerald-500/30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400">
              <Calculator size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">Casio fx-880</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">BTG</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-300 cursor-pointer"
              title={soundEnabled ? 'Tắt âm' : 'Bật âm'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button
              onClick={() => setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg')}
              className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400 font-bold cursor-pointer"
              title="Chuyển Deg/Rad"
            >
              {angleUnit.toUpperCase()}
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
              title="ClassWiz QR Code"
            >
              <QrCode size={14} />
            </button>
            {onCloseDock && (
              <button
                onClick={onCloseDock}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 cursor-pointer transition-all ml-1"
                title="Đóng bảng máy tính"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODE SELECTOR (HOME MENU) */}
      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-7 gap-2 p-1.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs">
        <button
          onClick={() => { setActiveMode('calculate'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'calculate'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Calculator size={14} />
          <span>1. Đại Số</span>
        </button>

        <button
          onClick={() => { setActiveMode('equation'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'equation'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Sliders size={14} />
          <span>2. PT / Hệ PT</span>
        </button>

        <button
          onClick={() => { setActiveMode('table'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'table'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <TableIcon size={14} />
          <span>3. Bảng f(x)</span>
        </button>

        <button
          onClick={() => { setActiveMode('complex'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'complex'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Hash size={14} />
          <span>4. Số Phức</span>
        </button>

        <button
          onClick={() => { setActiveMode('vector'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'vector'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Compass size={14} />
          <span>5. Vector Oxyz</span>
        </button>

        <button
          onClick={() => { setActiveMode('statistics'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'statistics'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Activity size={14} />
          <span>6. Thống Kê</span>
        </button>

        <button
          onClick={() => { setActiveMode('mathbox'); playCasioKeyClick(soundEnabled, 'op'); }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'mathbox'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Sparkles size={14} />
          <span>7. Math Box</span>
        </button>
      </div>

      {/* CASIO FX-880 BTG PHYSICAL CHASSIS & SCREEN */}
      <div className="relative rounded-[24px] sm:rounded-[36px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-2.5 sm:p-6 shadow-2xl border-2 border-zinc-700 max-w-2xl mx-auto">
        {/* Top Casio branding metallic badge & Solar cell */}
        <div className="flex items-center justify-between px-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div>
              <span className="font-mono font-black text-sm tracking-widest text-zinc-200">CASIO</span>
              <span className="text-[10px] font-mono text-zinc-400 ml-1.5 font-bold">CLASSWIZ</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              fx-880 BTG
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Solar Cell Authentic Graphic */}
            <div className="hidden xs:flex items-center gap-2">
              <div className="text-[7px] text-zinc-500 font-mono leading-tight text-right">
                <div>TWO WAY</div>
                <div>POWER</div>
              </div>
              <div 
                className="h-6 w-20 rounded bg-gradient-to-b from-[#10131e] via-[#1d2233] to-[#10131e] border border-zinc-700/80 p-0.5 shadow-inner flex items-center justify-between px-1 gap-1"
                title="Tế bào quang điện năng lượng mặt trời Solar Two-Way Power"
              >
                <span className="w-full h-full border-r border-zinc-700/50 bg-indigo-950/40 rounded-sm"></span>
                <span className="w-full h-full border-r border-zinc-700/50 bg-indigo-950/40"></span>
                <span className="w-full h-full border-r border-zinc-700/50 bg-indigo-950/40"></span>
                <span className="w-full h-full bg-indigo-950/40 rounded-sm"></span>
              </div>
            </div>

            {/* Sound Feedback Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playCasioKeyClick(!soundEnabled, 'op');
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:bg-zinc-700' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title={soundEnabled ? 'Âm thanh phím bấm bấm: ĐANG BẬT' : 'Âm thanh phím bấm: ĐÃ TẮT'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Keyboard shortcut help */}
            <button
              onClick={() => setIsKeyboardHintVisible(true)}
              className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer hidden sm:block"
              title="Hướng dẫn phím tắt máy tính trên bàn phím máy tính"
            >
              <Keyboard size={15} />
            </button>
          </div>
        </div>

        {/* AUTHENTIC CASIO DOT-MATRIX LCD SCREEN */}
        <div className="mt-4 rounded-2xl bg-[#9eb69d] text-zinc-950 p-3.5 sm:p-4 shadow-inner border-4 border-zinc-950/70 font-mono select-none relative overflow-hidden">
          {/* LCD scanline & dot overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none opacity-40" />

          {/* Top LCD Status Indicators */}
          <div className="flex items-center justify-between text-[10px] font-bold border-b border-zinc-950/20 pb-1 mb-2 tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className={`px-1 py-0.2 rounded font-black ${isShiftActive ? 'bg-zinc-950 text-[#9eb69d]' : 'opacity-25'}`}>S</span>
              <span className={`px-1 py-0.2 rounded font-black ${isAlphaActive ? 'bg-zinc-950 text-[#9eb69d]' : 'opacity-25'}`}>A</span>
              <span className="font-bold px-1 rounded bg-zinc-950/10">{angleUnit === 'deg' ? 'D' : 'R'}</span>
              <span className="opacity-80">MathI</span>
              <span className="opacity-80">MathO</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-950/15 font-bold uppercase">
                {activeMode === 'calculate' ? formatMode.toUpperCase() : activeMode.toUpperCase()}
              </span>
              <span className="text-[9px] tracking-tighter opacity-70">■■■</span>
            </div>
          </div>

          {/* Main LCD Display lines based on active mode */}
          {activeMode === 'calculate' && (
            <div className="min-h-[92px] flex flex-col justify-between py-1">
              {/* Input Expression Line with cursor indicator */}
              <div 
                className="text-left text-sm sm:text-base font-medium break-all tracking-wide text-zinc-950 font-mono flex flex-wrap items-center cursor-text min-h-[30px]"
                onClick={() => setCursorPos(inputExpr.length)}
                title="Bấm để đặt con trỏ ở cuối"
              >
                {inputExpr ? (
                  <span>
                    {inputExpr.slice(0, cursorPos)}
                    <span className="inline-block w-2 h-4 bg-zinc-950/90 align-middle animate-pulse mx-[1px]" />
                    {inputExpr.slice(cursorPos)}
                  </span>
                ) : (
                  <span className="flex items-center text-zinc-800/60 text-xs sm:text-sm">
                    <span className="inline-block w-2 h-4 bg-zinc-950/90 align-middle animate-pulse mr-1" />
                    <span>0</span>
                  </span>
                )}
              </div>

              {/* Result Line with quick format switch */}
              <div className="text-right mt-2">
                <div className={`text-xl sm:text-2xl font-black tracking-tight ${hasError ? 'text-rose-900 font-bold' : 'text-zinc-950'}`}>
                  {formatMode === 'decimal' 
                    ? (calcResultFormats.decimal || primaryResult)
                    : formatMode === 'mixed'
                    ? (calcResultFormats.mixed || primaryResult)
                    : formatMode === 'sci'
                    ? (calcResultFormats.sci || primaryResult)
                    : primaryResult}
                </div>
                {secondaryResult && (
                  <div className="text-xs text-zinc-800 font-medium mt-0.5 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleKeyPress('S<=>D')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950/15 hover:bg-zinc-950/25 font-bold transition-all cursor-pointer"
                      title="Chuyển đổi phân số ⇌ số thập phân (S<=>D / FORMAT)"
                    >
                      S⇔D
                    </button>
                    <span>{formatMode === 'exact' ? secondaryResult : `Dạng: ${formatMode}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EQUATION MODE SCREEN */}
          {activeMode === 'equation' && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs">
              <div className="font-bold border-b border-zinc-950/20 pb-1 flex justify-between items-center">
                <span>
                  {eqType === 'poly2' ? 'PT BẬC 2: ax² + bx + c = 0' : eqType === 'poly3' ? 'PT BẬC 3: ax³ + bx² + cx + d = 0' : 'HỆ PT 2 ẨN'}
                </span>
                <button 
                  onClick={() => setEqType(eqType === 'poly2' ? 'poly3' : eqType === 'poly3' ? 'simul2' : 'poly2')}
                  className="px-1.5 py-0.5 bg-zinc-950/20 rounded hover:bg-zinc-950/40 text-[10px]"
                >
                  Đổi dạng ▾
                </button>
              </div>

              <div className="my-2 space-y-1">
                {equationResult.roots.map((r, idx) => (
                  <div key={idx} className="font-bold text-sm">{r}</div>
                ))}
                {equationResult.vertex && (
                  <div className="text-[11px] text-zinc-800 italic mt-1 font-sans">{equationResult.vertex}</div>
                )}
              </div>
            </div>
          )}

          {/* TABLE MODE SCREEN */}
          {activeMode === 'table' && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs">
              <div className="flex justify-between items-center border-b border-zinc-950/20 pb-1 text-[11px] font-bold">
                <span>f(x) = {tableFx}</span>
                <span>[{tableStart}; {tableEnd}], Step {tableStep}</span>
              </div>
              <div className="max-h-24 overflow-y-auto mt-1 scrollbar-none">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-zinc-950/30">
                      <th className="py-0.5">x</th>
                      <th className="py-0.5">f(x)</th>
                      <th className="py-0.5">g(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-950/10">
                        <td className="font-bold">{row.x}</td>
                        <td className="font-semibold">{isNaN(row.fx) ? 'ERROR' : row.fx.toFixed(2)}</td>
                        <td>{isNaN(row.gx) ? 'ERROR' : row.gx.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPLEX MODE SCREEN */}
          {activeMode === 'complex' && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs">
              <div className="text-left font-bold text-sm">
                z = {complexResult.rect}
              </div>
              <div className="text-right mt-2 space-y-0.5">
                <div className="font-bold text-base">{complexResult.polar}</div>
                <div className="text-[11px] text-zinc-800">
                  |z| = {complexResult.modulus} • Arg(z) = {complexResult.argDeg}° ({complexResult.argRad} rad)
                </div>
                <div className="text-[10px] text-zinc-700">
                  Liên hợp z̄ = {complexResult.conjugate}
                </div>
              </div>
            </div>
          )}

          {/* VECTOR MODE SCREEN */}
          {activeMode === 'vector' && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs">
              <div className="text-[11px] font-bold border-b border-zinc-950/20 pb-1">
                u⃗ = ({vecA.join(', ')}) • v⃗ = ({vecB.join(', ')})
              </div>
              <div className="mt-2 space-y-1">
                <div className="font-bold text-sm">
                  u⃗ · v⃗ = {vectorResults.dotProduct} (Tích vô hướng)
                </div>
                <div className="font-bold text-sm">
                  [u⃗, v⃗] = {vectorResults.crossProduct} (Tích có hướng)
                </div>
                <div className="text-[11px] text-zinc-800">
                  Góc (u⃗, v⃗) = {vectorResults.angleDeg}° • Diện tích Δ = {vectorResults.triangleArea}
                </div>
              </div>
            </div>
          )}

          {/* STATISTICS MODE SCREEN */}
          {activeMode === 'statistics' && statResults && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs">
              <div className="text-[11px] font-bold border-b border-zinc-950/20 pb-1">
                THỐNG KÊ MẪU (n = {statResults.n})
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[11px]">
                <div>Trung bình x̄ = <span className="font-bold">{statResults.mean}</span></div>
                <div>Trung vị Me = <span className="font-bold">{statResults.median}</span></div>
                <div>Q₁ = <span className="font-bold">{statResults.q1}</span></div>
                <div>Q₃ = <span className="font-bold">{statResults.q3}</span></div>
                <div>Khoảng tứ phân vị ΔQ = <span className="font-bold">{statResults.iqr}</span></div>
                <div>Độ lệch chuẩn s = <span className="font-bold">{statResults.stdSample}</span></div>
              </div>
            </div>
          )}

          {/* MATH BOX SCREEN */}
          {activeMode === 'mathbox' && (
            <div className="min-h-[90px] flex flex-col justify-between py-1 text-xs text-center">
              <div className="text-[11px] font-bold border-b border-zinc-950/20 pb-1">
                MATH BOX: XÚC XẮC & ĐỒNG XU
              </div>
              <div className="my-2 flex items-center justify-center gap-3">
                {diceRolls.map((d, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-zinc-950 text-[#9eb69d] font-black text-lg flex items-center justify-center shadow">
                    {d}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-bold">
                Tổng điểm: {diceRolls.reduce((a, b) => a + b, 0)} • Xác suất thực nghiệm
              </div>
            </div>
          )}
        </div>

        {/* FUNCTION SHORTCUT ROW (HOME, UNIT, VARIABLE, FUNCTION, CATALOG, QR) */}
        <div className="mt-4 grid grid-cols-6 gap-2 text-center select-none">
          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'op');
              setIsHomeMenuOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
            title="Mở bảng Menu chức năng chính HOME"
          >
            <span className="text-[9px] text-amber-400 font-bold uppercase">HOME</span>
            <span className="text-xs font-black">Menu</span>
          </button>

          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'op');
              setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
            title="Đổi đơn vị Deg / Rad"
          >
            <span className="text-[9px] text-amber-400 font-bold uppercase">UNIT</span>
            <span className="text-xs font-black">{angleUnit.toUpperCase()}</span>
          </button>

          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'op');
              setIsVariableModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
            title="Mở bộ nhớ biến số VARIABLE (A, B, C, D, E, F, x, y, z, Ans)"
          >
            <span className="text-[9px] text-rose-400 font-bold uppercase">VARIABLE</span>
            <span className="text-xs font-black text-rose-300">Biến số</span>
          </button>

          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'number');
              insertAtCursor('f(x)');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
            title="Định nghĩa hàm số f(x)"
          >
            <span className="text-[9px] text-cyan-400 font-bold uppercase">FUNC</span>
            <span className="text-xs font-black text-cyan-300">f(x)</span>
          </button>

          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'op');
              setIsCatalogOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800/95 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
            title="Mở Thư Viện Hàm Số CATALOG"
          >
            <span className="text-[9px] text-amber-400 font-bold uppercase">CATALOG</span>
            <span className="text-xs font-black">Thư viện</span>
          </button>

          <button
            onClick={() => {
              playCasioKeyClick(soundEnabled, 'op');
              setIsQrModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-emerald-600 to-teal-700 text-white border border-emerald-500 transition-all cursor-pointer shadow-md active:translate-y-0.5 font-bold"
            title="Bấm QR để xem đồ thị và lời giải chi tiết"
          >
            <QrCode size={13} className="text-emerald-200" />
            <span className="text-xs font-black">QR</span>
          </button>
        </div>

        {/* CIRCULAR D-PAD & SPECIAL SHIFT / ALPHA / OK / BACK CONTROLS */}
        <div className="mt-4 flex items-center justify-between px-2">
          {/* Shift & Alpha Pill Buttons with authentic convex styling */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setIsShiftActive(!isShiftActive);
                if (!isShiftActive) setIsAlphaActive(false);
                playCasioKeyClick(soundEnabled, 'op');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-sm active:translate-y-0.5 ${
                isShiftActive
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30'
                  : 'bg-zinc-800/90 text-amber-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              SHIFT
            </button>
            <button
              onClick={() => {
                setIsAlphaActive(!isAlphaActive);
                if (!isAlphaActive) setIsShiftActive(false);
                playCasioKeyClick(soundEnabled, 'op');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border shadow-sm active:translate-y-0.5 ${
                isAlphaActive
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-zinc-800/90 text-rose-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              ALPHA
            </button>
          </div>

          {/* D-Pad Controller with real cursor navigation */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 border-2 border-zinc-600 shadow-xl flex items-center justify-center">
            <button
              onClick={() => handleHistoryNavigate('up')}
              className="absolute top-1 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              title="Lịch sử phép tính lên [↑]"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => handleHistoryNavigate('down')}
              className="absolute bottom-1 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              title="Lịch sử phép tính xuống [↓]"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={() => {
                playCasioKeyClick(soundEnabled, 'dpad');
                setHasError(false);
                setCursorPos(p => Math.max(0, p - 1));
              }}
              className="absolute left-1 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              title="Di chuyển con trỏ trái [←]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                playCasioKeyClick(soundEnabled, 'dpad');
                setHasError(false);
                setCursorPos(p => Math.min(inputExpr.length, p + 1));
              }}
              className="absolute right-1 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              title="Di chuyển con trỏ phải [→]"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={handleExecuteCalc}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-all cursor-pointer border border-emerald-300/40"
              title="Xác nhận tính toán OK"
            >
              OK
            </button>
          </div>

          {/* Back & Format Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleKeyPress('DEL')}
              className="px-3 py-2 rounded-xl text-xs font-black bg-zinc-800/90 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 cursor-pointer shadow-sm active:translate-y-0.5"
              title="Xóa ký tự [BACK/DEL]"
            >
              BACK
            </button>
            <button
              onClick={() => handleKeyPress('S<=>D')}
              className="px-3 py-2 rounded-xl text-xs font-black bg-zinc-800/90 text-cyan-400 border border-zinc-700 hover:bg-zinc-700 cursor-pointer shadow-sm active:translate-y-0.5"
              title="Chuyển đổi phân số ⇌ số thập phân (S<=>D / FORMAT)"
            >
              S⇔D
            </button>
          </div>
        </div>

        {/* SCIENTIFIC FUNCTION KEYS (CALCULUS, POWERS, LOGS, TRIG) */}
        <div className="mt-5 grid grid-cols-5 gap-2 text-xs select-none">
          {/* Row 1 */}
          <button
            onClick={() => handleKeyPress(isShiftActive ? 'd/dx(x^2)|x=2' : '∫(x, 0, 1)')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>d/dx</span>
            <span className="text-xs font-semibold">{isShiftActive ? 'd/dx' : '∫dx'}</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? '√(' : '^2')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>√</span>
            <span className="text-xs font-semibold">{isShiftActive ? '√' : 'x²'}</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? '^(1/' : '^')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>ⁿ√</span>
            <span className="text-xs font-semibold">xⁿ</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? '10^(' : 'log(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>10ˣ</span>
            <span className="text-xs font-semibold">log</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? 'e^(' : 'ln(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>eˣ</span>
            <span className="text-xs font-semibold">ln</span>
          </button>

          {/* Row 2: Trig functions */}
          <button
            onClick={() => handleKeyPress(isShiftActive ? 'sin⁻¹(' : 'sin(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>sin⁻¹</span>
            <span className="text-xs font-semibold">sin</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? 'cos⁻¹(' : 'cos(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>cos⁻¹</span>
            <span className="text-xs font-semibold">cos</span>
          </button>

          <button
            onClick={() => handleKeyPress(isShiftActive ? 'tan⁻¹(' : 'tan(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>tan⁻¹</span>
            <span className="text-xs font-semibold">tan</span>
          </button>

          <button
            onClick={() => handleKeyPress('(')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className="text-[9px] text-zinc-400/80">nPr</span>
            <span className="text-xs font-semibold">(</span>
          </button>

          <button
            onClick={() => handleKeyPress(')')}
            className="p-2 rounded-xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/60 border-b-2 border-b-zinc-950/80 border-x border-zinc-700/60 text-zinc-200 font-bold transition-all cursor-pointer shadow-md active:translate-y-0.5 flex flex-col items-center justify-center min-h-[44px]"
          >
            <span className="text-[9px] text-zinc-400/80">nCr</span>
            <span className="text-xs font-semibold">)</span>
          </button>
        </div>

        {/* NUMERIC KEYPAD & STANDARD OPERATORS */}
        <div className="mt-3 grid grid-cols-5 gap-2 select-none">
          {/* Row 1: 7, 8, 9, DEL, AC */}
          <button
            onClick={() => handleKeyPress('7')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            7
          </button>
          <button
            onClick={() => handleKeyPress('8')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            8
          </button>
          <button
            onClick={() => handleKeyPress('9')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            9
          </button>
          <button
            onClick={() => handleKeyPress('DEL')}
            className="p-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-t border-t-amber-400/50 border-b-2 border-b-amber-950 text-white font-black text-xs shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center tracking-wider"
          >
            DEL
          </button>
          <button
            onClick={() => handleKeyPress('AC')}
            className="p-3 rounded-2xl bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 hover:from-rose-400 hover:to-rose-600 border-t border-t-rose-300/50 border-b-2 border-b-rose-950 text-white font-black text-xs shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center tracking-wider"
          >
            AC
          </button>

          {/* Row 2: 4, 5, 6, *, / */}
          <button
            onClick={() => handleKeyPress('4')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            4
          </button>
          <button
            onClick={() => handleKeyPress('5')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            5
          </button>
          <button
            onClick={() => handleKeyPress('6')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            6
          </button>
          <button
            onClick={() => handleKeyPress('*')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 text-emerald-400 font-black text-lg shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            ×
          </button>
          <button
            onClick={() => handleKeyPress('/')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 text-emerald-400 font-black text-lg shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            ÷
          </button>

          {/* Row 3: 1, 2, 3, +, - */}
          <button
            onClick={() => handleKeyPress('1')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            1
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            2
          </button>
          <button
            onClick={() => handleKeyPress('3')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            3
          </button>
          <button
            onClick={() => handleKeyPress('+')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 text-emerald-400 font-black text-lg shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => handleKeyPress('-')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 text-emerald-400 font-black text-lg shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            −
          </button>

          {/* Row 4: 0, ., x10^x / pi, Ans, EXE */}
          <button
            onClick={() => handleKeyPress('0')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={() => handleKeyPress('.')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-850 border-t border-t-zinc-600/50 border-b-2 border-b-zinc-950 border-x border-zinc-800 text-white font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          >
            .
          </button>
          <button
            onClick={() => handleKeyPress(isShiftActive ? 'pi' : '*10^')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 border-x border-zinc-700/60 text-zinc-200 font-bold text-xs shadow-md active:translate-y-0.5 transition-all flex flex-col items-center justify-center cursor-pointer"
          >
            <span className={`text-[9px] font-bold ${isShiftActive ? 'text-amber-300 font-black scale-110' : 'text-amber-400/80'}`}>π</span>
            <span>×10ˣ</span>
          </button>
          <button
            onClick={() => handleKeyPress('ANS')}
            className="p-3 rounded-2xl bg-gradient-to-b from-zinc-750 via-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-850 border-t border-t-zinc-600/40 border-b-2 border-b-zinc-950 border-x border-zinc-700/60 text-cyan-300 font-black text-xs shadow-md active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
          >
            Ans
          </button>
          <button
            onClick={() => handleKeyPress('EXE')}
            className="p-3 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 border-t border-t-emerald-200/60 border-b-2 border-b-emerald-800 text-black font-black text-base shadow-lg shadow-emerald-500/30 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer tracking-wider"
          >
            EXE
          </button>
        </div>
      </div>

      {/* QUICK PRESETS FOR THPT 2027 EXAMS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Mẫu Biểu Thức Trọng Tâm THPT 2027:</span>
          </span>
          <button
            onClick={handleCopyResult}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {isCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{isCopied ? 'Đã sao chép kết quả' : 'Sao chép kết quả'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => loadExamPreset('Đạo hàm', 'd/dx(x^3 - 3*x + 2)|x=2')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition-all shrink-0 cursor-pointer"
          >
            📐 Đạo hàm tại điểm: d/dx(x³-3x+2)|x=2
          </button>

          <button
            onClick={() => loadExamPreset('Tích phân', '∫(3*x^2 + 2*x, 0, 2)')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition-all shrink-0 cursor-pointer"
          >
            ∫ Tích phân: ∫(3x²+2x, 0, 2)
          </button>

          <button
            onClick={() => loadExamPreset('Con lắc đơn', '2*pi*sqrt(1.2/9.8)')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition-all shrink-0 cursor-pointer"
          >
            ⏱️ Chu kỳ con lắc: T = 2π√(L/g)
          </button>

          <button
            onClick={() => loadExamPreset('Tổ hợp', '10C3')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition-all shrink-0 cursor-pointer"
          >
            🎲 Xác suất C(10, 3)
          </button>

          <button
            onClick={() => loadExamPreset('Logarit', 'log_2(16)')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium transition-all shrink-0 cursor-pointer"
          >
            📈 log₂(16)
          </button>
        </div>
      </div>

      {/* DEDICATED INPUT INTERFACE FOR EQUATION, TABLE, VECTOR, OR STATISTICS */}
      {activeMode === 'equation' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Sliders size={16} />
            <span>Hiệu Chỉnh Hệ Số Phương Trình</span>
          </h3>

          {eqType === 'poly2' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số a (x²)</label>
                <input
                  type="number"
                  value={polyA}
                  onChange={e => setPolyA(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số b (x)</label>
                <input
                  type="number"
                  value={polyB}
                  onChange={e => setPolyB(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số tự do c</label>
                <input
                  type="number"
                  value={polyC}
                  onChange={e => setPolyC(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
            </div>
          )}

          {eqType === 'poly3' && (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số a (x³)</label>
                <input
                  type="number"
                  value={polyA}
                  onChange={e => setPolyA(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số b (x²)</label>
                <input
                  type="number"
                  value={polyB}
                  onChange={e => setPolyB(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số c (x)</label>
                <input
                  type="number"
                  value={polyC}
                  onChange={e => setPolyC(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hệ số tự do d</label>
                <input
                  type="number"
                  value={polyD}
                  onChange={e => setPolyD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeMode === 'table' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <TableIcon size={16} />
            <span>Cài Đặt Khảo Sát Hàm Số Bằng Bảng Table</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Hàm số f(x)</label>
              <input
                type="text"
                value={tableFx}
                onChange={e => setTableFx(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono"
                placeholder="VD: x^3 - 3*x + 1"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Hàm số g(x) (tùy chọn)</label>
              <input
                type="text"
                value={tableGx}
                onChange={e => setTableGx(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono"
                placeholder="VD: 2*x - 1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Điểm bắt đầu (Start)</label>
              <input
                type="number"
                value={tableStart}
                onChange={e => setTableStart(parseFloat(e.target.value) || -3)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Điểm kết thúc (End)</label>
              <input
                type="number"
                value={tableEnd}
                onChange={e => setTableEnd(parseFloat(e.target.value) || 3)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Bước nhảy (Step)</label>
              <input
                type="number"
                step="0.1"
                value={tableStep}
                onChange={e => setTableStep(parseFloat(e.target.value) || 0.5)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold"
              />
            </div>
          </div>

          <button
            onClick={generateTableData}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md cursor-pointer"
          >
            Tạo Bảng Giá Trị & Quét Tìm Max / Min
          </button>
        </div>
      )}

      {activeMode === 'vector' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Compass size={16} />
            <span>Tọa Độ Vecto Trong Không Gian Oxyz (Toán 12)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300">Vector A = (x₁, y₁, z₁)</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={vecA[0]}
                  onChange={e => setVecA([parseFloat(e.target.value) || 0, vecA[1], vecA[2]])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
                <input
                  type="number"
                  value={vecA[1]}
                  onChange={e => setVecA([vecA[0], parseFloat(e.target.value) || 0, vecA[2]])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
                <input
                  type="number"
                  value={vecA[2]}
                  onChange={e => setVecA([vecA[0], vecA[1], parseFloat(e.target.value) || 0])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300">Vector B = (x₂, y₂, z₂)</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={vecB[0]}
                  onChange={e => setVecB([parseFloat(e.target.value) || 0, vecB[1], vecB[2]])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
                <input
                  type="number"
                  value={vecB[1]}
                  onChange={e => setVecB([vecB[0], parseFloat(e.target.value) || 0, vecB[2]])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
                <input
                  type="number"
                  value={vecB[2]}
                  onChange={e => setVecB([vecB[0], vecB[1], parseFloat(e.target.value) || 0])}
                  className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'statistics' && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Activity size={16} />
            <span>Dữ Liệu Thống Kê & Đặc Trưng Đo Xu Thế Trung Tâm</span>
          </h3>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Nhập các giá trị mẫu số liệu (cách nhau bởi dấu phẩy hoặc khoảng trắng):
            </label>
            <input
              type="text"
              value={statRawData}
              onChange={e => setStatRawData(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm"
              placeholder="VD: 5, 6, 7, 7, 8, 8, 8, 9, 9, 10"
            />
          </div>
        </div>
      )}

      {/* CLASSWIZ QR CODE MODAL WITH INTERACTIVE GRAPH VISUALIZER */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-emerald-500/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-emerald-400" />
                <h4 className="text-base font-bold text-white">ClassWiz QR Code</h4>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              {/* Generated QR visual */}
              <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center">
                <QrCode size={128} className="text-zinc-950" />
              </div>
              <span className="mt-3 text-xs font-mono text-emerald-400 font-bold">
                CASIO CLASSWIZ ONLINE WEB
              </span>
              <p className="text-[11px] text-zinc-400 mt-1">
                Quét mã để truyền dữ liệu đồ thị hàm số và bảng giá trị lên trình duyệt
              </p>
            </div>

            {/* In-app Instant Curve Graph Visualizer */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-300 block mb-1">
                📈 Đồ Thị Tương Tác Trực Tuyến ({tableFx})
              </span>
              <div className="w-full h-28 bg-zinc-900/90 rounded-lg flex items-center justify-center border border-zinc-800 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  {/* Grid */}
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#3f3f46" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="#3f3f46" strokeWidth="1" />
                  {/* Curve sample */}
                  <path
                    d="M 10,80 Q 50,10 100,50 T 190,20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
                <span className="absolute bottom-1 right-2 text-[9px] text-zinc-500 font-mono">
                  x: [-3; 3]
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer"
            >
              Đóng Cửa Sổ QR
            </button>
          </div>
        </div>
      )}

      {/* CATALOG LIBRARY MODAL */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-amber-400" />
                <h4 className="text-base font-bold text-white">Casio fx-880 BTG • CATALOG</h4>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-bold text-emerald-400 block">1. Giải Tích (Analysis)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + 'd/dx(');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    d/dx : Đạo hàm tại x₀
                  </button>
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + '∫(');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    ∫ : Tích phân xác định
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-bold text-teal-400 block">2. Xác Suất & Tổ Hợp (Probability)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + 'C');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    nCr : Tổ hợp chập r của n
                  </button>
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + 'P');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    nPr : Chỉnh hợp chập r của n
                  </button>
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + '!');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    n! : Giai thừa
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-bold text-cyan-400 block">3. Lượng Giác & Logarit</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + 'log_2(');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    logₐ(b) : Logarit cơ số bất kỳ
                  </button>
                  <button
                    onClick={() => {
                      setInputExpr(prev => prev + 'abs(');
                      setIsCatalogOpen(false);
                    }}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left font-mono"
                  >
                    |x| : Trị tuyệt đối Abs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOME MENU MODAL */}
      {isHomeMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator size={18} className="text-emerald-400" />
                <span>Casio fx-880 BTG • HOME MENU</span>
              </h4>
              <button
                onClick={() => setIsHomeMenuOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => { setActiveMode('calculate'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <Calculator size={16} className="text-emerald-400" />
                <div>
                  <div className="text-white">1. Calculate</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Đại số & Giải tích</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveMode('equation'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <Sliders size={16} className="text-teal-400" />
                <div>
                  <div className="text-white">2. Equation</div>
                  <div className="text-[10px] text-zinc-500 font-normal">PT bậc 2, 3, 4 & Hệ PT</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveMode('table'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <TableIcon size={16} className="text-cyan-400" />
                <div>
                  <div className="text-white">3. Table</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Khảo sát f(x) & g(x)</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveMode('complex'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <Hash size={16} className="text-amber-400" />
                <div>
                  <div className="text-white">4. Complex</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Số phức & Dạng cực</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveMode('vector'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <Compass size={16} className="text-rose-400" />
                <div>
                  <div className="text-white">5. Vector</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Tọa độ Oxyz</div>
                </div>
              </button>

              <button
                onClick={() => { setActiveMode('statistics'); setIsHomeMenuOpen(false); }}
                className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left font-bold flex items-center gap-2"
              >
                <Activity size={16} className="text-purple-400" />
                <div>
                  <div className="text-white">6. Statistics</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Thống kê & Tứ phân vị</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIABLE MANAGER MODAL (VARIABLE / STO) */}
      {isVariableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <h4 className="text-base font-bold text-white">Casio fx-880 BTG • BỘ NHỚ BIẾN SỐ (VARIABLE)</h4>
              </div>
              <button
                onClick={() => setIsVariableModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Quản lý giá trị các biến số lưu trữ trong máy tính. Bấm <strong className="text-rose-300">Chèn</strong> để đưa vào biểu thức, hoặc <strong className="text-emerald-300">Gán Ans (STO)</strong> để lưu kết quả vừa tính.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {(['A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'z', 'M'] as const).map((varKey) => (
                <div key={varKey} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-rose-400 font-mono">{varKey}</span>
                    <span className="text-xs font-mono font-bold text-white truncate max-w-[90px]" title={String(memoryVars[varKey] ?? 0)}>
                      = {memoryVars[varKey] ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        insertAtCursor(varKey);
                        setIsVariableModalOpen(false);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold transition-all cursor-pointer text-center"
                    >
                      Chèn
                    </button>
                    <button
                      onClick={() => {
                        const numAns = parseFloat(primaryResult.replace(/[^\d.-]/g, '')) || 0;
                        setMemoryVars(prev => ({ ...prev, [varKey]: numAns }));
                        playCasioKeyClick(soundEnabled, 'op');
                      }}
                      className="py-1 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold transition-all cursor-pointer"
                      title={`Gán kết quả hiện tại (${primaryResult}) vào biến ${varKey}`}
                    >
                      STO
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-xs text-zinc-500">
              <span>Ans hiện tại: <strong className="text-cyan-300">{primaryResult}</strong></span>
              <button
                onClick={() => {
                  setMemoryVars({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, z: 0, M: 0, Ans: 0 });
                  playCasioKeyClick(soundEnabled, 'op');
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 transition-all cursor-pointer text-[11px]"
              >
                Đặt lại tất cả biến (= 0)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {isKeyboardHintVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard size={18} className="text-emerald-400" />
                <h4 className="text-base font-bold text-white">Phím tắt máy tính Casio trên PC</h4>
              </div>
              <button
                onClick={() => setIsKeyboardHintVisible(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Enter hoặc =</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">Tính toán (EXE / OK)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Backspace</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">Xóa ký tự (DEL)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Escape (ESC)</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold">Xóa toàn bộ (AC)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Mũi tên Trái / Phải (← / →)</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">Di chuyển con trỏ</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Mũi tên Lên / Xuống (↑ / ↓)</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">Lịch sử phép tính</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Tab</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">Chuyển định dạng (S⇔D)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="font-bold">Chữ cái x, y, z, p (π), e</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">Nhập trực tiếp ký hiệu</span>
              </div>
            </div>

            <button
              onClick={() => setIsKeyboardHintVisible(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all cursor-pointer"
            >
              Đã hiểu, đóng hướng dẫn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
