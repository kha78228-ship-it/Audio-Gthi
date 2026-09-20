import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, 
  Atom, 
  Scale, 
  Clock, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Zap, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Check, 
  Search, 
  ArrowRight, 
  Layers, 
  Compass, 
  TrendingUp, 
  Activity, 
  HelpCircle,
  Dna,
  FlaskConical,
  Flame,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  playFocusBellSound, 
  startBinauralBeat, 
  stopBinauralBeat, 
  startFocusPinkNoise, 
  stopFocusPinkNoise 
} from '../../utils/studyAudioSynthesizer';
import { Casio880Calculator } from './Casio880Calculator';

interface EduUtilitySuiteViewProps {
  onOpenLab?: (subject: 'physics' | 'chemistry' | 'biology', experimentId: string) => void;
  onOpenAiAssistant?: (prompt: string) => void;
  onOpenExamPrep?: () => void;
  onSaveToNotebook?: (title: string, content: string, tags: string[]) => void;
  onRecordActivity?: (params: {
    type: 'lab_run' | 'lab_adjust' | 'lab_export' | 'lab_switch';
    title: string;
    xpAmount?: number;
    category?: 'lab';
  }) => void;
  initialUtilityTab?: 'casio880' | 'calculator' | 'periodic' | 'converter' | 'pomodoro' | 'flashcards' | 'deconstructor';
}

// ==========================================
// 1. DATA: SCIENTIFIC CONSTANTS
// ==========================================
interface PhysicalConstant {
  symbol: string;
  name: string;
  value: string;
  unit: string;
  meaning: string;
  category: 'universal' | 'atomic' | 'thermo' | 'astro';
}

const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  { symbol: 'c', name: 'Tốc độ ánh sáng trong chân không', value: '299,792,458', unit: 'm/s', meaning: 'Giới hạn tốc độ truyền thông tin tối đa của vũ trụ. Không phụ thuộc hệ quy chiếu.', category: 'universal' },
  { symbol: 'h', name: 'Hằng số Planck', value: '6.62607015 × 10⁻³⁴', unit: 'J·s', meaning: 'Lượng tử hành động cơ bản, làm cầu nối giữa năng lượng và tần số photon E = hf.', category: 'atomic' },
  { symbol: 'ℏ', name: 'Hằng số Planck rút gọn (h/2π)', value: '1.054571817 × 10⁻³⁴', unit: 'J·s', meaning: 'Xuất hiện trong nguyên lý bất định Heisenberg Δx·Δp ≥ ℏ/2 và cơ học lượng tử.', category: 'atomic' },
  { symbol: 'G', name: 'Hằng số hấp dẫn vạn vật', value: '6.67430 × 10⁻¹¹', unit: 'N·m²/kg²', meaning: 'Đo lường cường độ lực hút hấp dẫn giữa các khối lượng trong không-thời gian.', category: 'universal' },
  { symbol: 'g₀', name: 'Gia tốc trọng trường tiêu chuẩn', value: '9.80665', unit: 'm/s²', meaning: 'Gia tốc rơi tự do trung bình trên bề mặt Trái Đất ở vĩ độ 45°.', category: 'universal' },
  { symbol: 'e', name: 'Điện tích nguyên tố', value: '1.602176634 × 10⁻¹⁹', unit: 'C', meaning: 'Điện tích của một proton hoặc độ lớn điện tích electron; điện tích lượng tử hóa.', category: 'atomic' },
  { symbol: 'N_A', name: 'Số Avogadro', value: '6.02214076 × 10²³', unit: 'mol⁻¹', meaning: 'Số hạt vi mô trong đúng 1 mol chất. Cầu nối giữa thế giới vi mô và vĩ mô.', category: 'thermo' },
  { symbol: 'R', name: 'Hằng số khí lý tưởng', value: '8.314462618', unit: 'J/(mol·K)', meaning: 'Tích số N_A · k_B. Xuất hiện trong phương trình trạng thái khí lý tưởng PV = nRT.', category: 'thermo' },
  { symbol: 'k_B', name: 'Hằng số Boltzmann', value: '1.380649 × 10⁻²³', unit: 'J/K', meaning: 'Quy đổi năng lượng nhiệt vi mô của phân tử sang nhiệt độ vĩ mô: E_k = 3/2 k_B T.', category: 'thermo' },
  { symbol: 'ε₀', name: 'Hằng số điện môi chân không', value: '8.8541878128 × 10⁻¹²', unit: 'F/m', meaning: 'Độ cho phép điện của chân không, quy định cường độ lực tĩnh điện Coulomb.', category: 'atomic' },
  { symbol: 'μ₀', name: 'Độ từ thẩm chân không', value: '1.256637062 × 10⁻⁶', unit: 'N/A²', meaning: 'Độ cho phép từ của chân không. Ta có c = 1/√(ε₀μ₀).', category: 'universal' },
  { symbol: 'σ', name: 'Hằng số Stefan-Boltzmann', value: '5.670374 × 10⁻⁸', unit: 'W/(m²·K⁴)', meaning: 'Bức xạ nhiệt của vật đen tuyệt đối tỉ lệ với lũy thừa bậc 4 của nhiệt độ.', category: 'thermo' },
];

// ==========================================
// 2. DATA: INTERACTIVE PERIODIC TABLE (Core STEM Elements)
// ==========================================
interface ChemicalElement {
  z: number;
  symbol: string;
  nameVi: string;
  nameEn: string;
  mass: number;
  category: 'alkali' | 'alkaline_earth' | 'transition' | 'post_transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble_gas';
  categoryLabel: string;
  electronConfig: string;
  shells: number[];
  electronegativity?: number;
  atomicRadiusPm?: number;
  meltingPointC?: number;
  boilingPointC?: number;
  firstPrincipleFact: string;
  realWorldApplication: string;
  relatedLab?: { subject: 'chemistry'; expId: string };
}

const CHEMICAL_ELEMENTS: ChemicalElement[] = [
  { z: 1, symbol: 'H', nameVi: 'Hiđrô (Hydrogen)', nameEn: 'Hydrogen', mass: 1.008, category: 'nonmetal', categoryLabel: 'Phi kim', electronConfig: '1s¹', shells: [1], electronegativity: 2.20, atomicRadiusPm: 53, meltingPointC: -259.1, boilingPointC: -252.9, firstPrincipleFact: 'Nguyên tố đơn giản nhất, dồi dào nhất vũ trụ (75% khối lượng thường). Nguồn gốc tạo ra mọi nguyên tố khác qua phản ứng nhiệt hạch trong lõi các ngôi sao.', realWorldApplication: 'Nhiên liệu tương lai sạch (pin nhiên liệu), tổng hợp amoniac (phân bón nuôi sống 50% dân số toàn cầu).' },
  { z: 2, symbol: 'He', nameVi: 'Heli (Helium)', nameEn: 'Helium', mass: 4.0026, category: 'noble_gas', categoryLabel: 'Khí hiếm', electronConfig: '1s²', shells: [2], atomicRadiusPm: 31, meltingPointC: -272.2, boilingPointC: -268.9, firstPrincipleFact: 'Lớp electron 1s đầy đủ (duet bền vững). Năng lượng ion hóa thứ nhất cao nhất trong mọi nguyên tố (24.6 eV), trơ hoàn toàn về mặt hóa học ở điều kiện chuẩn.', realWorldApplication: 'Làm mát nam châm siêu dẫn máy chụp cộng hưởng từ MRI, khí cầu thám không không cháy.' },
  { z: 3, symbol: 'Li', nameVi: 'Liti (Lithium)', nameEn: 'Lithium', mass: 6.94, category: 'alkali', categoryLabel: 'Kim loại kiềm', electronConfig: '[He] 2s¹', shells: [2, 1], electronegativity: 0.98, atomicRadiusPm: 167, meltingPointC: 180.5, boilingPointC: 1342, firstPrincipleFact: 'Bán kính ion cực nhỏ, thế điện cực chuẩn âm nhất (-3.04V). Xu hướng nhường 1 electron cực kỳ mãnh liệt, tạo mật độ năng lượng pin cao nhất.', realWorldApplication: 'Trái tim của cuộc cách mạng xe điện và điện thoại thông minh (Pin Lithium-ion).' },
  { z: 6, symbol: 'C', nameVi: 'Cacbon (Carbon)', nameEn: 'Carbon', mass: 12.011, category: 'nonmetal', categoryLabel: 'Phi kim', electronConfig: '[He] 2s² 2p²', shells: [2, 4], electronegativity: 2.55, atomicRadiusPm: 67, meltingPointC: 3550, boilingPointC: 4027, firstPrincipleFact: 'Có 4 electron hóa trị, khả năng lai hóa sp, sp², sp³ tạo chuỗi mạch polymer vô tận. Xương sống của toàn bộ hóa học hữu cơ và mọi dạng sống trên Trái Đất.', realWorldApplication: 'Vật liệu siêu dẫn tương lai (Graphene, Carbon Nanotube), kim cương công nghiệp, dược phẩm sinh học.' },
  { z: 7, symbol: 'N', nameVi: 'Nitơ (Nitrogen)', nameEn: 'Nitrogen', mass: 14.007, category: 'nonmetal', categoryLabel: 'Phi kim', electronConfig: '[He] 2s² 2p³', shells: [2, 5], electronegativity: 3.04, atomicRadiusPm: 56, meltingPointC: -210.0, boilingPointC: -195.8, firstPrincipleFact: 'Phân tử N₂ chứa liên kết ba cộng hóa trị siêu bền (năng lượng liên kết 945 kJ/mol), khiến khí quyển 78% trơ, bảo vệ sinh quyển khỏi cháy nổ.', realWorldApplication: 'Sản xuất phân đạm nuôi cây trồng, chất bảo quản trơ cho thực phẩm, nitơ lỏng y tế.', relatedLab: { subject: 'chemistry', expId: 'le_chatelier' } },
  { z: 8, symbol: 'O', nameVi: 'Oxi (Oxygen)', nameEn: 'Oxygen', mass: 15.999, category: 'nonmetal', categoryLabel: 'Phi kim', electronConfig: '[He] 2s² 2p⁴', shells: [2, 6], electronegativity: 3.44, atomicRadiusPm: 48, meltingPointC: -218.8, boilingPointC: -182.9, firstPrincipleFact: 'Độ âm điện cao thứ 2 (chỉ sau Flo). Kẻ thâu tóm electron mạnh mẽ nhất sinh quyển, vận hành chu trình hô hấp tế bào và phản ứng cháy tỏa năng lượng.', realWorldApplication: 'Hô hấp y tế, luyện kim thép, nhiên liệu oxy lỏng cho tên lửa đẩy vũ trụ.' },
  { z: 11, symbol: 'Na', nameVi: 'Natri (Sodium)', nameEn: 'Sodium', mass: 22.990, category: 'alkali', categoryLabel: 'Kim loại kiềm', electronConfig: '[Ne] 3s¹', shells: [2, 8, 1], electronegativity: 0.93, atomicRadiusPm: 190, meltingPointC: 97.8, boilingPointC: 883, firstPrincipleFact: 'Một electron hóa trị lớp 3s rất xa hạt nhân và bị chắn mạnh, dễ dàng tách ra tạo cation Na⁺ bền vững. Phản ứng nổ mãnh liệt khi chạm nước.', realWorldApplication: 'Muối ăn NaCl cân bằng áp suất thẩm thấu màng tế bào thần kinh, pin Natri-ion thế hệ mới.' },
  { z: 12, symbol: 'Mg', nameVi: 'Magie (Magnesium)', nameEn: 'Magnesium', mass: 24.305, category: 'alkaline_earth', categoryLabel: 'Kiềm thổ', electronConfig: '[Ne] 3s²', shells: [2, 8, 2], electronegativity: 1.31, atomicRadiusPm: 145, meltingPointC: 650, boilingPointC: 1090, firstPrincipleFact: 'Trung tâm phối trí của phân tử diệp lục (Chlorophyll). Bắt giữ photon ánh sáng mặt trời để khởi động quang hợp chuyển CO₂ và H₂O thành đường.', realWorldApplication: 'Hợp kim hàng không vũ trụ siêu nhẹ, pháo sáng cứu hộ, ion thiết yếu cho enzyme ADN.' },
  { z: 13, symbol: 'Al', nameVi: 'Nhôm (Aluminium)', nameEn: 'Aluminium', mass: 26.982, category: 'post_transition', categoryLabel: 'Kim loại sau chuyển tiếp', electronConfig: '[Ne] 3s² 3p¹', shells: [2, 8, 3], electronegativity: 1.61, atomicRadiusPm: 118, meltingPointC: 660.3, boilingPointC: 2470, firstPrincipleFact: 'Bị thụ động hóa bởi lớp màng oxit Al₂O₃ cực mỏng (khoảng vài nanomet) nhưng liên kết ion siêu bền, tự bảo vệ kim loại bên trong khỏi ăn mòn vĩnh viễn.', realWorldApplication: 'Vỏ máy bay, dây dẫn điện cao thế, linh kiện tản nhiệt máy tính và xe điện.' },
  { z: 14, symbol: 'Si', nameVi: 'Silic (Silicon)', nameEn: 'Silicon', mass: 28.085, category: 'metalloid', categoryLabel: 'Bán kim', electronConfig: '[Ne] 3s² 3p²', shells: [2, 8, 4], electronegativity: 1.90, atomicRadiusPm: 111, meltingPointC: 1414, boilingPointC: 3265, firstPrincipleFact: 'Chất bán dẫn có vùng cấm (Bandgap) 1.1 eV lý tưởng. Pha tạp P hoặc B tạo bán dẫn loại n và p, nền tảng vi mạch transistor của kỷ nguyên số.', realWorldApplication: 'Chip CPU máy tính, tế bào quang điện pin mặt trời, gốm vi mạch chịu nhiệt.' },
  { z: 17, symbol: 'Cl', nameVi: 'Clo (Chlorine)', nameEn: 'Chlorine', mass: 35.45, category: 'halogen', categoryLabel: 'Halogen', electronConfig: '[Ne] 3s² 3p⁵', shells: [2, 8, 7], electronegativity: 3.16, atomicRadiusPm: 79, meltingPointC: -101.5, boilingPointC: -34.04, firstPrincipleFact: 'Ái lực electron cực lớn (-349 kJ/mol). Chỉ thiếu 1 electron để đạt bát thể Octet khí hiếm [Ar], tính oxi hóa cực kỳ hung hãn.', realWorldApplication: 'Khử trùng nước sinh hoạt cứu sống hàng triệu người khỏi dịch bệnh tả, sản xuất nhựa PVC.' },
  { z: 26, symbol: 'Fe', nameVi: 'Sắt (Iron)', nameEn: 'Iron', mass: 55.845, category: 'transition', categoryLabel: 'Kim loại chuyển tiếp', electronConfig: '[Ar] 3d⁶ 4s²', shells: [2, 8, 14, 2], electronegativity: 1.83, atomicRadiusPm: 156, meltingPointC: 1538, boilingPointC: 2862, firstPrincipleFact: 'Hạt nhân sắt Fe-56 có năng lượng liên kết trên mỗi nucleon cao nhất vũ trụ. Là điểm kết thúc của phản ứng nhiệt hạch trong các siêu tân tinh.', realWorldApplication: 'Nguyên tố cấu tạo nhân Trái Đất tạo từ trường che chắn bức xạ, lõi Hemoglobin vận chuyển oxy trong máu, 95% công nghiệp luyện kim thế giới.' },
  { z: 29, symbol: 'Cu', nameVi: 'Đồng (Copper)', nameEn: 'Copper', mass: 63.546, category: 'transition', categoryLabel: 'Kim loại chuyển tiếp', electronConfig: '[Ar] 3d¹⁰ 4s¹', shells: [2, 8, 18, 1], electronegativity: 1.90, atomicRadiusPm: 145, meltingPointC: 1084.6, boilingPointC: 2562, firstPrincipleFact: 'Cấu hình phân lớp 3d bão hòa bền vững [Ar] 3d¹⁰ 4s¹. Một electron hóa trị 4s chuyển động tự do trong biển electron kim loại, dẫn điện và dẫn nhiệt xuất sắc.', realWorldApplication: 'Toàn bộ hạ tầng lưới điện thế giới, ống dẫn nhiệt, pin Daniell hóa học.', relatedLab: { subject: 'chemistry', expId: 'electrochemical' } },
  { z: 30, symbol: 'Zn', nameVi: 'Kẽm (Zinc)', nameEn: 'Zinc', mass: 65.38, category: 'transition', categoryLabel: 'Kim loại chuyển tiếp', electronConfig: '[Ar] 3d¹⁰ 4s²', shells: [2, 8, 18, 2], electronegativity: 1.65, atomicRadiusPm: 142, meltingPointC: 419.5, boilingPointC: 907, firstPrincipleFact: 'Cấu hình bão hòa 3d¹⁰ 4s², chỉ có số oxi hóa duy nhất +2. Thế điện cực chuẩn -0.76V âm hơn đồng (+0.34V), làm cực âm tan trong pin Daniell.', realWorldApplication: 'Mạ kẽm chống gỉ cho thép, cực anot trong pin điện hóa, vi chất thiết yếu cho miễn dịch người.', relatedLab: { subject: 'chemistry', expId: 'electrochemical' } },
  { z: 79, symbol: 'Au', nameVi: 'Vàng (Gold)', nameEn: 'Gold', mass: 196.97, category: 'transition', categoryLabel: 'Kim loại chuyển tiếp', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', shells: [2, 8, 18, 32, 18, 1], electronegativity: 2.54, atomicRadiusPm: 174, meltingPointC: 1064.2, boilingPointC: 2970, firstPrincipleFact: 'Hiệu ứng tương đối tính làm electron 6s chuyển động gần tốc độ ánh sáng, khối lượng tăng làm co bán kính 6s, hấp thụ ánh sáng xanh lam và phản xạ màu vàng óng ánh độc nhất.', realWorldApplication: 'Lớp mạ tiếp điểm vi mạch độ tin cậy tuyệt đối, kính chắn bức xạ mũ phi hành gia Apollo.' }
];

// ==========================================
// 3. DATA: FIRST PRINCIPLES FLASHCARDS
// ==========================================
interface FlashcardItem {
  id: string;
  subject: 'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'Toán Học';
  question: string;
  firstPrincipleAnswer: string;
  roteTrap: string;
  status?: 'new' | 'learning' | 'mastered';
}

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    subject: 'Vật Lý',
    question: 'Tại sao chu kỳ con lắc đơn T = 2π√(L/g) không phụ thuộc vào khối lượng m của vật nặng?',
    firstPrincipleAnswer: 'Khối lượng m đóng đồng thời 2 vai trò đối kháng nhau hoàn hảo: (1) Khối lượng quán tính m_i cản trở gia tốc a = F/m_i; (2) Khối lượng hấp dẫn m_g tạo ra trọng lực kéo về F = m_g · g · sin(θ). Khi tính toán, m_i và m_g triệt tiêu nhau chính xác (Nguyên lý tương đương Einstein).',
    roteTrap: 'Học vẹt chỉ nhớ công thức không có m nên đoán mò, hoặc nghĩ rằng vật nặng hơn sẽ rơi nhanh hơn kéo con lắc nhanh hơn.'
  },
  {
    id: 'fc-2',
    subject: 'Vật Lý',
    question: 'Bản chất lực và phản lực (Định luật III Newton) tại sao cùng độ lớn, ngược chiều mà không tự triệt tiêu nhau?',
    firstPrincipleAnswer: 'Vì lực và phản lực tác dụng lên HAI VẬT KHÁC NHAU, chứ không cùng đặt lên một vật. Điều kiện để hai lực triệt tiêu (lực cân bằng) là chúng phải cùng tác dụng lên MỘT vật duy nhất.',
    roteTrap: 'Nhầm lẫn giữa "cặp lực trực đối tương tác (hai vật)" với "cặp lực cân bằng (một vật đứng yên)".'
  },
  {
    id: 'fc-3',
    subject: 'Hóa Học',
    question: 'Bản chất nhiệt động lực học: Tại sao tăng nhiệt độ làm chuyển dịch cân bằng theo chiều phản ứng thu nhiệt (ΔH > 0)?',
    firstPrincipleAnswer: 'Phản ứng thu nhiệt có năng lượng hoạt hóa xuôi (E_a,thu) cao hơn phản ứng tỏa nhiệt (E_a,toa). Theo phương trình Arrhenius k = A·exp(-E_a/RT), khi T tăng thì phản ứng có E_a cao hơn sẽ tăng tốc độ mạnh mẽ hơn, làm chiều thu nhiệt chiếm ưu thế.',
    roteTrap: 'Chỉ học vẹt câu khẩu hiệu "Tăng thu giảm tỏa" của Le Chatelier mà không hiểu bản chất động học phân tử và phân bố năng lượng Maxwell-Boltzmann.'
  },
  {
    id: 'fc-4',
    subject: 'Hóa Học',
    question: 'Tại sao nước đá (băng) lại nở ra và nhẹ hơn nước lỏng, nổi lên trên mặt nước?',
    firstPrincipleAnswer: 'Dưới 4°C, các liên kết hydro định hướng không gian cố định 4 nguyên tử oxy quanh mỗi phân tử nước tạo mạng tinh thể lục giác rỗng có nhiều khoảng trống. Trong nước lỏng, năng lượng nhiệt phá vỡ một phần liên kết hydro giúp các phân tử trượt sát vào nhau hơn.',
    roteTrap: 'Nghĩ rằng chất rắn luôn có mật độ lớn hơn chất lỏng. Nếu nước không có tính chất dị thường này, các hồ nước sẽ đóng băng từ đáy lên tiêu diệt toàn bộ sinh vật thủy sinh mùa đông.'
  },
  {
    id: 'fc-5',
    subject: 'Sinh Học',
    question: 'Tại sao ATP được coi là đồng tiền năng lượng phổ quát của toàn bộ sinh giới?',
    firstPrincipleAnswer: '3 nhóm phosphat của ATP đều mang điện tích âm (-), nằm san sát nhau tạo lực đẩy tĩnh điện Coulomb rất mạnh như một chiếc lò xo bị nén căng. Khi thủy phân tách 1 nhóm phosphat tạo ADP + Pi, thế năng tĩnh điện được giải phóng để kéo phản ứng sinh hóa khác.',
    roteTrap: 'Nghĩ rằng liên kết cao năng P-O chứa "kho dự trữ năng lượng thần kỳ" bên trong liên kết, thay vì hiểu do trạng thái bất ổn định và lực đẩy tĩnh điện giữa các nhóm phosphat tích điện âm.'
  },
  {
    id: 'fc-6',
    subject: 'Toán Học',
    question: 'Bản chất hình học và vật lý của đạo hàm f\'(x₀) là gì?',
    firstPrincipleAnswer: 'Đạo hàm là giới hạn tỷ số Δy/Δx khi khoảng quan sát Δx tiến về 0. Về hình học: là hệ số góc (độ dốc) của tiếp tuyến tại điểm đó. Về vật lý: là tốc độ biến thiên tức thời (đạo hàm quãng đường theo thời gian là vận tốc, đạo hàm vận tốc là gia tốc).',
    roteTrap: 'Học thuộc quy tắc đạo hàm cơ học (xⁿ → n xⁿ⁻¹) mà không hiểu ý nghĩa tốc độ biến thiên tức thời, dẫn đến thất bại khi áp dụng vào giải các bài toán thực tiễn.'
  }
];

export const EduUtilitySuiteView: React.FC<EduUtilitySuiteViewProps> = ({
  onOpenLab,
  onOpenAiAssistant,
  onOpenExamPrep,
  onSaveToNotebook,
  onRecordActivity,
  initialUtilityTab = 'casio880'
}) => {
  // Main Utility Sub-tab
  const [utilityTab, setUtilityTab] = useState<'casio880' | 'calculator' | 'periodic' | 'converter' | 'pomodoro' | 'flashcards' | 'deconstructor'>(initialUtilityTab);

  useEffect(() => {
    if (initialUtilityTab) {
      setUtilityTab(initialUtilityTab);
    }
  }, [initialUtilityTab]);

  // =========================================================================
  // UTILITY 1: CALCULATOR & GRAPHING STATE
  // =========================================================================
  const [calcInput, setCalcInput] = useState<string>('sin(x)');
  const [calcXVal, setCalcXVal] = useState<number>(1.57); // ~ pi/2
  const [calcPreset, setCalcPreset] = useState<string>('sin(x)');
  const [hoveredGraphPoint, setHoveredGraphPoint] = useState<{ x: number; y: number } | null>(null);

  // Graph Evaluation Helper
  const evaluateFx = (expr: string, x: number): number => {
    try {
      // Safe sanitized math evaluator
      const safeExpr = expr
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/log/g, 'Math.log10')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e\b/g, 'Math.E')
        .replace(/\^/g, '**')
        .replace(/x/g, `(${x})`);
      
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return ${safeExpr};`);
      const res = fn();
      return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : 0;
    } catch {
      return 0;
    }
  };

  // Numerical Derivative at calcXVal: f'(x) ≈ (f(x+h) - f(x-h))/(2h)
  const numericalDerivative = useMemo(() => {
    const h = 0.0001;
    const yPlus = evaluateFx(calcInput, calcXVal + h);
    const yMinus = evaluateFx(calcInput, calcXVal - h);
    return ((yPlus - yMinus) / (2 * h));
  }, [calcInput, calcXVal]);

  const currentYVal = useMemo(() => evaluateFx(calcInput, calcXVal), [calcInput, calcXVal]);

  // Generate SVG Graph points for x in [-6, 6]
  const graphPoints = useMemo(() => {
    const pts: Array<{ x: number; y: number; svgX: number; svgY: number }> = [];
    const minX = -6;
    const maxX = 6;
    const step = 0.1;
    for (let x = minX; x <= maxX; x += step) {
      const y = evaluateFx(calcInput, x);
      // Map [-6, 6] to [0, 400]
      const svgX = ((x - minX) / (maxX - minX)) * 400;
      // Map [-3, 3] to [200, 0] with clamp
      const clampedY = Math.max(-3.5, Math.min(3.5, y));
      const svgY = 100 - (clampedY / 3.5) * 90;
      pts.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(3)), svgX, svgY });
    }
    return pts;
  }, [calcInput]);

  const svgPolylinePoints = useMemo(() => {
    return graphPoints.map(p => `${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(' ');
  }, [graphPoints]);

  // =========================================================================
  // UTILITY 2: PERIODIC TABLE STATE
  // =========================================================================
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(CHEMICAL_ELEMENTS[11]); // Default Fe Iron
  const [elementSearchQuery, setElementSearchQuery] = useState('');
  const [elementCategoryFilter, setElementCategoryFilter] = useState<string>('all');

  const filteredElements = useMemo(() => {
    return CHEMICAL_ELEMENTS.filter(el => {
      const matchSearch = el.nameVi.toLowerCase().includes(elementSearchQuery.toLowerCase()) ||
                          el.symbol.toLowerCase().includes(elementSearchQuery.toLowerCase()) ||
                          el.z.toString() === elementSearchQuery.trim();
      const matchCat = elementCategoryFilter === 'all' || el.category === elementCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [elementSearchQuery, elementCategoryFilter]);

  // =========================================================================
  // UTILITY 3: UNIT CONVERTER STATE
  // =========================================================================
  const [converterType, setConverterType] = useState<'length' | 'mass' | 'energy' | 'pressure' | 'temp'>('energy');
  const [converterInputVal, setConverterInputVal] = useState<number>(1);
  const [converterFromUnit, setConverterFromUnit] = useState<string>('J');
  const [converterToUnit, setConverterToUnit] = useState<string>('eV');
  const [copiedConstantSymbol, setCopiedConstantSymbol] = useState<string | null>(null);

  // Conversion rates (normalized to base SI unit)
  const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
    energy: {
      'J': 1,
      'kJ': 1000,
      'cal': 4.184,
      'kcal': 4184,
      'eV': 1.602176634e-19,
      'MeV': 1.602176634e-13,
      'kWh': 3.6e6
    },
    length: {
      'm': 1,
      'km': 1000,
      'cm': 0.01,
      'mm': 0.001,
      'inch': 0.0254,
      'foot': 0.3048,
      'nm': 1e-9,
      'ly (Năm ánh sáng)': 9.4607e15
    },
    mass: {
      'kg': 1,
      'g': 0.001,
      'mg': 1e-6,
      'tấn': 1000,
      'lb (pound)': 0.45359237,
      'u (khối lượng ng/tử)': 1.660539066e-27
    },
    pressure: {
      'Pa': 1,
      'kPa': 1000,
      'bar': 100000,
      'atm': 101325,
      'mmHg (Torr)': 133.322,
      'psi': 6894.76
    }
  };

  const convertedResult = useMemo(() => {
    if (converterType === 'temp') {
      // Temperature special case
      const val = converterInputVal;
      if (converterFromUnit === converterToUnit) return val;
      let celsius = val;
      if (converterFromUnit === '°F') celsius = (val - 32) * (5 / 9);
      if (converterFromUnit === 'K') celsius = val - 273.15;

      if (converterToUnit === '°C') return celsius;
      if (converterToUnit === '°F') return (celsius * (9 / 5)) + 32;
      if (converterToUnit === 'K') return celsius + 273.15;
      return celsius;
    }

    const rates = CONVERSION_FACTORS[converterType];
    if (!rates) return converterInputVal;
    const baseVal = converterInputVal * (rates[converterFromUnit] || 1);
    const result = baseVal / (rates[converterToUnit] || 1);
    return result;
  }, [converterType, converterInputVal, converterFromUnit, converterToUnit]);

  // =========================================================================
  // UTILITY 4: POMODORO & BINAURAL AUDIO STATE
  // =========================================================================
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [completedPomoCount, setCompletedPomoCount] = useState(0);
  const [activeAudioMode, setActiveAudioMode] = useState<'none' | 'alpha' | 'beta' | 'gamma' | 'pink_noise'>('none');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(prev => prev - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(prev => prev - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          playFocusBellSound();
          setIsPomoRunning(false);
          if (pomoMode === 'focus') {
            setCompletedPomoCount(prev => prev + 1);
            setPomoMode('short_break');
            setPomoMinutes(5);
            setPomoSeconds(0);
          } else {
            setPomoMode('focus');
            setPomoMinutes(25);
            setPomoSeconds(0);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomoRunning, pomoMinutes, pomoSeconds, pomoMode]);

  const handleTogglePomo = () => {
    setIsPomoRunning(!isPomoRunning);
  };

  const handleResetPomo = () => {
    setIsPomoRunning(false);
    if (pomoMode === 'focus') setPomoMinutes(25);
    if (pomoMode === 'short_break') setPomoMinutes(5);
    if (pomoMode === 'long_break') setPomoMinutes(15);
    setPomoSeconds(0);
  };

  const handleSelectAudioMode = (mode: 'none' | 'alpha' | 'beta' | 'gamma' | 'pink_noise') => {
    setActiveAudioMode(mode);
    stopBinauralBeat();
    stopFocusPinkNoise();

    if (mode === 'alpha' || mode === 'beta' || mode === 'gamma') {
      startBinauralBeat(mode);
    } else if (mode === 'pink_noise') {
      startFocusPinkNoise();
    }
  };

  useEffect(() => {
    return () => {
      stopBinauralBeat();
      stopFocusPinkNoise();
    };
  }, []);

  // =========================================================================
  // UTILITY 5: FLASHCARDS STATE
  // =========================================================================
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(DEFAULT_FLASHCARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const activeCard = flashcards[currentCardIndex] || flashcards[0];

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  };

  // =========================================================================
  // UTILITY 6: DOCUMENT PRINCIPLE EXTRACTOR STATE
  // =========================================================================
  const [rawDocumentText, setRawDocumentText] = useState(
    `ĐỊNH LUẬT BẢO TOÀN VÀ CHUYỂN HÓA NĂNG LƯỢNG (VẬT LÝ 10 & 12):\nNăng lượng không tự nhiên sinh ra cũng không tự nhiên mất đi, nó chỉ chuyển hóa từ dạng này sang dạng khác hoặc truyền từ vật này sang vật khác. Trong nhiệt động lực học, độ biến thiên nội năng ΔU = Q + A. Nhiệt không thể tự truyền từ vật lạnh sang vật nóng hơn mà không có tác động từ bên ngoài (Nguyên lý II).`
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<{
    rootAxiom: string;
    derivationChain: string[];
    roteTraps: string[];
    onePageSummary: string;
  } | null>({
    rootAxiom: 'Tính đối xứng thời gian của các định luật vật lý (Định lý Noether). Khi không gian và thời gian đồng nhất, một đại lượng vô hướng bất biến xuất hiện - gọi là Năng Lượng.',
    derivationChain: [
      '1. Phương trình chuyển động Newton F = ma kết hợp định nghĩa công dW = F·ds suy ra định lý động năng ΔW_d = A.',
      '2. Với trường lực thế (lực hấp dẫn, lực đàn hồi), công chỉ phụ thuộc vị trí đầu và cuối, xuất hiện hàm thế năng W_t.',
      '3. Cơ năng toàn phần W = W_d + W_t không đổi nếu chỉ có lực thế (bảo toàn cơ năng).',
      '4. Khi có ma sát hoặc va chạm không đàn hồi, cơ năng vĩ mô phân rã thành chuyển động hỗn loạn của các phân tử vi mô (Nhiệt năng / Nội năng U).'
    ],
    roteTraps: [
      'Cạm bẫy 1: Quên rằng cơ năng chỉ bảo toàn khi HỆ KÍN và CHỈ CÓ LỰC THẾ. Có ma sát thì cơ năng giảm (biến thành nhiệt).',
      'Cạm bẫy 2: Nhầm lẫn dấu công A và nhiệt lượng Q trong ΔU = Q + A (Quy ước: Nhận vào là Dương, Nhả ra/Thực hiện là Âm).'
    ],
    onePageSummary: 'Năng lượng là thước đo năng lực biến đổi của vật chất. Bảo toàn năng lượng thực chất là định luật bất biến đối với sự tịnh tiến thời gian. Hiệu suất chuyển hóa nhiệt thành cơ năng luôn bị giới hạn bởi định luật II (chu trình Carnot).'
  });

  const handleRunDocumentExtraction = () => {
    if (!rawDocumentText.trim()) return;
    setIsExtracting(true);

    setTimeout(() => {
      // Rule-based semantic extractor simulating Gemini 3.5 Flash Document Processor
      const text = rawDocumentText.toLowerCase();
      let axiom = 'Bản chất tiên đề gốc: Tương tác vi mô và đối xứng vật lý bảo toàn trong hệ kín.';
      let chain = [
        '1. Xác định hệ quy chiếu và các đối tượng tương tác cốt lõi.',
        '2. Thiết lập phương trình cân bằng bảo toàn từ định luật bảo toàn tương ứng.',
        '3. Giải tìm đại lượng đặc trưng và kiểm tra điều kiện biên cực trị.'
      ];
      let traps = [
        'Học sinh hay nhầm lẫn giữa định nghĩa hiện tượng với nguyên nhân gốc rễ sinh ra hiện tượng.',
        'Áp dụng công thức mà không kiểm tra xem hệ có thỏa mãn điều kiện lý tưởng ban đầu hay không.'
      ];
      let summary = rawDocumentText.slice(0, 180) + '... Bản chất logic đã được cô đọng.';

      if (text.includes('sóng') || text.includes('giao thoa')) {
        axiom = 'Bản chất sự truyền pha dao động và nguyên lý chồng chập sóng Huygens-Fresnel.';
        chain = [
          '1. Hai nguồn sóng kết hợp có cùng tần số và độ lệch pha không đổi theo thời gian.',
          '2. Tại mỗi điểm trong không gian, dao động tổng hợp là tổng hợp vecto của hai sóng tới.',
          '3. Cực đại giao thoa khi hiệu đường đi d2 - d1 = kλ (hai sóng tới cùng pha củng cố nhau).'
        ];
        traps = ['Nhầm cực đại của hai nguồn cùng pha và hai nguồn ngược pha.'];
      } else if (text.includes('hóa') || text.includes('phản ứng') || text.includes('axit')) {
        axiom = 'Bản chất trao đổi electron hoặc dịch chuyển proton để đạt trạng thái năng lượng tự do Gibbs tối thiểu (ΔG < 0).';
        chain = [
          '1. Tương tác mây electron hóa trị phá vỡ liên kết cũ và hình thành liên kết mới.',
          '2. Tốc độ phản ứng phụ thuộc số va chạm hiệu quả vượt qua năng lượng hoạt hóa E_a.'
        ];
        traps = ['Nghĩ rằng phản ứng tỏa nhiệt luôn tự diễn ra mà bỏ qua biến thiên entropy TΔS.'];
      }

      setExtractedResult({
        rootAxiom: axiom,
        derivationChain: chain,
        roteTraps: traps,
        onePageSummary: summary
      });
      setIsExtracting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Haevy STEM Utility Suite (Refined Academic Styling) */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Calculator size={12} className="text-emerald-400" />
              <span>HAEVY EDU • SUITE TIỆN ÍCH STEM ĐA NĂNG</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              Tiện Ích Học Tập <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Chuyên Sâu</span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                fx-880 + 6-in-1 Toolkit
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-zinc-400 max-w-2xl leading-relaxed">
              Tổ hợp công cụ phụ trợ thông minh: Máy tính Casio fx-880 BTG chuẩn kỳ thi THPT 2027 (Giải PT bậc 2/3/4, Cực trị, Table, Oxyz, Số phức, Thống kê), Máy tính khảo sát hàm số & đạo hàm, Bảng tuần hoàn 2026 nguyên tử 3D, Đổi đơn vị quốc tế, Pomodoro sóng não và Flashcards.
            </p>
          </div>

          {/* Quick Audio Beats Switcher in Banner */}
          <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800 px-3 py-2 rounded-xl shrink-0">
            <span className="text-xs text-zinc-400 font-medium">Sóng Não:</span>
            <button
              onClick={() => handleSelectAudioMode(activeAudioMode === 'alpha' ? 'none' : 'alpha')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeAudioMode === 'alpha'
                  ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
              title="Sóng Alpha 10Hz - Thư giãn tập trung cao độ"
            >
              Alpha (10Hz)
            </button>
            <button
              onClick={() => handleSelectAudioMode(activeAudioMode === 'pink_noise' ? 'none' : 'pink_noise')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeAudioMode === 'pink_noise'
                  ? 'bg-zinc-800 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
              title="Tiếng ồn hồng chặn tạp âm môi trường"
            >
              Pink Noise
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Segmented Control Bar */}
      <div className="bg-zinc-950/90 border border-zinc-800/90 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x shadow-sm">
        <button
          onClick={() => setUtilityTab('casio880')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'casio880'
              ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Calculator size={15} className={utilityTab === 'casio880' ? 'text-emerald-400' : 'text-zinc-500'} />
          <span>Casio fx-880 BTG</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">
            THPT 2027
          </span>
        </button>

        {onOpenExamPrep && (
          <button
            onClick={onOpenExamPrep}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
          >
            <Zap size={15} className="text-amber-400" />
            <span>Luyện Thi Cấp Tốc (Đếm Giờ + fx-880)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-200 font-mono font-bold">
              GDPT 2018
            </span>
          </button>
        )}

        <button
          onClick={() => setUtilityTab('calculator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'calculator'
              ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Calculator size={15} className={utilityTab === 'calculator' ? 'text-emerald-400' : 'text-zinc-500'} />
          <span>Khảo Sát Đồ Thị f(x)</span>
        </button>

        <button
          onClick={() => setUtilityTab('periodic')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'periodic'
              ? 'bg-zinc-800 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Atom size={15} className={utilityTab === 'periodic' ? 'text-teal-400' : 'text-zinc-500'} />
          <span>Bảng Tuần Hoàn 2026</span>
        </button>

        <button
          onClick={() => setUtilityTab('converter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'converter'
              ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Scale size={15} className={utilityTab === 'converter' ? 'text-cyan-400' : 'text-zinc-500'} />
          <span>Đổi Đơn Vị & Hằng Số</span>
        </button>

        <button
          onClick={() => setUtilityTab('pomodoro')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'pomodoro'
              ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Clock size={15} className={utilityTab === 'pomodoro' ? 'text-amber-400' : 'text-zinc-500'} />
          <span>Pomodoro & Sóng Não</span>
        </button>

        <button
          onClick={() => setUtilityTab('flashcards')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'flashcards'
              ? 'bg-zinc-800 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <BookOpen size={15} className={utilityTab === 'flashcards' ? 'text-purple-400' : 'text-zinc-500'} />
          <span>Flashcard Nguyên Lý Gốc</span>
        </button>

        <button
          onClick={() => setUtilityTab('deconstructor')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            utilityTab === 'deconstructor'
              ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <FileText size={15} className={utilityTab === 'deconstructor' ? 'text-emerald-400' : 'text-zinc-500'} />
          <span>Bóc Tách Bản Chất AI</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 0. TAB: CASIO FX-880 BTG (THPT 2027)                                     */}
      {/* ========================================================================= */}
      {utilityTab === 'casio880' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Casio880Calculator
            onRecordActivity={onRecordActivity}
            onOpenAiAssistant={onOpenAiAssistant}
            onSaveToNotebook={onSaveToNotebook}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TAB: CALCULATOR & GRAPHING                                             */}
      {/* ========================================================================= */}
      {utilityTab === 'calculator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Calculator size={16} className="text-emerald-400" />
                    <span>Hàm Số & Đạo Hàm Tức Thời</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    f(x) Realtime Plotter
                  </span>
                </div>

                {/* Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Hàm mẫu chuẩn STEM:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Dao động điều hòa', expr: 'sin(x)' },
                      { label: 'Dao động tắt dần', expr: 'exp(-0.3*x)*cos(2*x)' },
                      { label: 'Parabol quỹ đạo', expr: '-(x-1)^2 + 4' },
                      { label: 'Đường cong Gauss', expr: 'exp(-x^2)' },
                      { label: 'Định luật Coulomb/Ohm', expr: '1/x' },
                      { label: 'Bậc ba uốn lượn', expr: '0.2*x^3 - x' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setCalcPreset(preset.expr);
                          setCalcInput(preset.expr);
                        }}
                        className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all border cursor-pointer truncate ${
                          calcInput === preset.expr
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formula Input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Nhập hàm số f(x):</label>
                  <input
                    type="text"
                    value={calcInput}
                    onChange={(e) => setCalcInput(e.target.value)}
                    placeholder="VD: sin(x), x^2 - 4, exp(-x)*cos(x)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Point x0 Slider */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Điểm khảo sát x₀:</span>
                    <strong className="text-emerald-400 font-mono">{calcXVal.toFixed(2)}</strong>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={5}
                    step={0.05}
                    value={calcXVal}
                    onChange={(e) => setCalcXVal(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>-5.0</span>
                    <span>0.0</span>
                    <span>+5.0</span>
                  </div>
                </div>

                {/* Instant Numerical Results */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Giá trị f(x₀):</span>
                    <span className="text-base font-black font-mono text-white block truncate">
                      {currentYVal.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Đạo hàm f'(x₀) (Độ dốc):</span>
                    <span className="text-base font-black font-mono text-emerald-400 block truncate">
                      {numericalDerivative.toFixed(4)}
                    </span>
                  </div>
                </div>

                {onOpenAiAssistant && (
                  <button
                    onClick={() => onOpenAiAssistant(`Giải thích bản chất vật lý và ý nghĩa toán học của hàm số f(x) = ${calcInput}. Đạo hàm f'(x) tại sao lại biểu diễn tốc độ biến thiên tức thời?`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Hỏi AI về Bản Chất Hàm Này</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Graph Canvas & Physical Meaning (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span>Đồ Thị Không Gian f(x) Trên Khoảng [-6, 6]</span>
                  </h4>
                  {hoveredGraphPoint && (
                    <span className="text-xs font-mono text-emerald-300">
                      x: {hoveredGraphPoint.x} | y: {hoveredGraphPoint.y}
                    </span>
                  )}
                </div>

                {/* Interactive SVG Plot */}
                <div className="relative w-full h-56 bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                  <svg 
                    viewBox="0 0 400 200" 
                    className="w-full h-full"
                    onMouseLeave={() => setHoveredGraphPoint(null)}
                  >
                    {/* Grid lines */}
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#3f3f46" strokeWidth="1.5" />
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#3f3f46" strokeWidth="1.5" />
                    
                    {/* Axis Labels */}
                    <text x="390" y="95" fill="#a1a1aa" fontSize="10" fontFamily="monospace">x</text>
                    <text x="205" y="12" fill="#a1a1aa" fontSize="10" fontFamily="monospace">y</text>
                    
                    {/* Graph Curve */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={svgPolylinePoints}
                    />

                    {/* Point x0 on curve */}
                    {(() => {
                      const svgX = ((calcXVal - (-6)) / 12) * 400;
                      const clampedY = Math.max(-3.5, Math.min(3.5, currentYVal));
                      const svgY = 100 - (clampedY / 3.5) * 90;
                      
                      // Tangent line segment
                      const tangentSlope = numericalDerivative;
                      const dx = 30;
                      const dy = -(tangentSlope * (90 / 3.5) * (12 / 400)) * dx;

                      return (
                        <g>
                          {/* Tangent line */}
                          <line
                            x1={svgX - dx}
                            y1={svgY - dy}
                            x2={svgX + dx}
                            y2={svgY + dy}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          {/* Point marker */}
                          <circle cx={svgX} cy={svgY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* First Principles Insight Box */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sparkles size={14} />
                    <span>Ý Nghĩa Bản Chất First Principles:</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    <strong className="text-white">Độ dốc tiếp tuyến (Đường nét đứt màu cam):</strong> Đại diện cho <span className="text-emerald-400 font-mono">f'(x₀) = {numericalDerivative.toFixed(2)}</span>. 
                    Nếu đồ thị mô tả quãng đường theo thời gian s(t), độ dốc chính là vận tốc tức thời v(t). Nếu mô tả từ thông qua cuộn dây Φ(t), độ dốc âm chính là suất điện động cảm ứng e = -dΦ/dt (Định luật Faraday).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: PERIODIC TABLE 2026                                              */}
      {/* ========================================================================= */}
      {utilityTab === 'periodic' && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={elementSearchQuery}
                onChange={(e) => setElementSearchQuery(e.target.value)}
                placeholder="Tìm nguyên tố theo tên, ký hiệu (H, Fe, Cu...)"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'alkali', label: 'Kiềm' },
                { id: 'alkaline_earth', label: 'Kiềm thổ' },
                { id: 'transition', label: 'Chuyển tiếp' },
                { id: 'nonmetal', label: 'Phi kim' },
                { id: 'noble_gas', label: 'Khí hiếm' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setElementCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    elementCategoryFilter === cat.id
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Periodic Grid & Selected Element Detailed Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Elements Matrix (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {filteredElements.map(el => (
                <button
                  key={el.z}
                  onClick={() => setSelectedElement(el)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                    selectedElement.z === el.z
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/10 scale-105 z-10'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">{el.z}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{el.mass.toFixed(1)}</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono mt-1 group-hover:text-emerald-400 transition-colors">
                    {el.symbol}
                  </div>
                  <div className="text-[11px] text-zinc-300 font-medium truncate mt-0.5">
                    {el.nameVi.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-emerald-400/90 font-mono mt-1">
                    {el.electronConfig}
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Inspector Card (5 cols) */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase mb-1">
                    {selectedElement.categoryLabel} • Z = {selectedElement.z}
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {selectedElement.nameVi}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Khối lượng nguyên tử: {selectedElement.mass} u
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-black font-black text-2xl flex items-center justify-center font-mono shadow-lg shadow-emerald-500/30">
                  {selectedElement.symbol}
                </div>
              </div>

              {/* Animated Bohr Electron Shells */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-2">
                  Mô Hình Lớp Vỏ Electron Bohr: {selectedElement.shells.join(' - ')}
                </span>
                
                <svg viewBox="0 0 160 160" className="w-36 h-36">
                  {/* Nucleus */}
                  <circle cx="80" cy="80" r="12" fill="#10b981" />
                  <text x="80" y="84" textAnchor="middle" fill="#000" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    +{selectedElement.z}
                  </text>

                  {/* Concentric Shells */}
                  {selectedElement.shells.map((count, shellIdx) => {
                    const radius = 22 + (shellIdx + 1) * 14;
                    return (
                      <g key={shellIdx}>
                        <circle cx="80" cy="80" r={radius} fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
                        {/* Electrons around shell */}
                        {Array.from({ length: Math.min(count, 8) }).map((_, eIdx) => {
                          const angle = (eIdx / Math.min(count, 8)) * 2 * Math.PI;
                          const eX = 80 + radius * Math.cos(angle);
                          const eY = 80 + radius * Math.sin(angle);
                          return (
                            <circle key={eIdx} cx={eX} cy={eY} r="3" fill="#38bdf8" />
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
                <span className="text-[10px] text-zinc-400 font-mono mt-1">
                  Cấu hình electron: <strong className="text-emerald-400">{selectedElement.electronConfig}</strong>
                </span>
              </div>

              {/* Scientific Properties Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Độ âm điện Pauling:</span>
                  <strong className="text-white font-mono">{selectedElement.electronegativity ?? 'Không xác định'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Bán kính nguyên tử:</span>
                  <strong className="text-white font-mono">{selectedElement.atomicRadiusPm ? `${selectedElement.atomicRadiusPm} pm` : 'N/A'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Nhiệt độ nóng chảy:</span>
                  <strong className="text-white font-mono">{selectedElement.meltingPointC ? `${selectedElement.meltingPointC} °C` : 'N/A'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Nhiệt độ sôi:</span>
                  <strong className="text-white font-mono">{selectedElement.boilingPointC ? `${selectedElement.boilingPointC} °C` : 'N/A'}</strong>
                </div>
              </div>

              {/* First Principles Insight */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Sparkles size={13} />
                  <span>Bản Chất Hóa Học & Vật Lý:</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {selectedElement.firstPrincipleFact}
                </p>
                <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                  <strong className="text-emerald-300">Ứng dụng:</strong> {selectedElement.realWorldApplication}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {selectedElement.relatedLab && onOpenLab && (
                  <button
                    onClick={() => onOpenLab(selectedElement.relatedLab!.subject, selectedElement.relatedLab!.expId)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FlaskConical size={14} />
                    <span>Mở Lab Liên Quan</span>
                  </button>
                )}

                {onOpenAiAssistant && (
                  <button
                    onClick={() => onOpenAiAssistant(`Giải thích chi tiết bản chất phản ứng hóa học và cấu hình electron của nguyên tố ${selectedElement.nameVi} (${selectedElement.symbol}). Tại sao các electron ở lớp ngoài cùng lại quyết định toàn bộ tính chất hóa học của nó?`)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Hỏi AI Về {selectedElement.symbol}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: SCIENTIFIC CONVERTER & CONSTANTS                                  */}
      {/* ========================================================================= */}
      {utilityTab === 'converter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Unit Converter Form (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Scale size={16} className="text-emerald-400" />
                  <span>Bộ Đổi Đơn Vị Đo Khoa Học</span>
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  SI Standard
                </span>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                {[
                  { id: 'energy', label: 'Năng lượng' },
                  { id: 'length', label: 'Chiều dài' },
                  { id: 'mass', label: 'Khối lượng' },
                  { id: 'pressure', label: 'Áp suất' },
                  { id: 'temp', label: 'Nhiệt độ' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setConverterType(t.id as any);
                      if (t.id === 'energy') { setConverterFromUnit('J'); setConverterToUnit('eV'); }
                      if (t.id === 'length') { setConverterFromUnit('m'); setConverterToUnit('nm'); }
                      if (t.id === 'mass') { setConverterFromUnit('kg'); setConverterToUnit('u (khối lượng ng/tử)'); }
                      if (t.id === 'pressure') { setConverterFromUnit('atm'); setConverterToUnit('Pa'); }
                      if (t.id === 'temp') { setConverterFromUnit('°C'); setConverterToUnit('K'); }
                    }}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                      converterType === t.id
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Input Value */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold block">Giá trị cần đổi:</label>
                <input
                  type="number"
                  value={converterInputVal}
                  onChange={(e) => setConverterInputVal(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-base font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Unit Selection Selects */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Từ đơn vị:</label>
                  <select
                    value={converterFromUnit}
                    onChange={(e) => setConverterFromUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    {converterType === 'temp' ? (
                      ['°C', '°F', 'K'].map(u => <option key={u} value={u}>{u}</option>)
                    ) : (
                      Object.keys(CONVERSION_FACTORS[converterType] || {}).map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold block">Sang đơn vị:</label>
                  <select
                    value={converterToUnit}
                    onChange={(e) => setConverterToUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    {converterType === 'temp' ? (
                      ['°C', '°F', 'K'].map(u => <option key={u} value={u}>{u}</option>)
                    ) : (
                      Object.keys(CONVERSION_FACTORS[converterType] || {}).map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Conversion Result Box */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-1 text-center">
                <span className="text-xs text-zinc-400 font-medium">Kết quả chuyển đổi:</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 truncate">
                  {typeof convertedResult === 'number' && Math.abs(convertedResult) < 1e-4 || Math.abs(convertedResult) > 1e6 
                    ? convertedResult.toExponential(6) 
                    : convertedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} {converterToUnit}
                </div>
              </div>
            </div>

            {/* Constants Library (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Compass size={16} className="text-amber-400" />
                  <span>Thư Viện Hằng Số Vũ Trụ & Ý Nghĩa Bản Chất</span>
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">12 Fundamental Constants</span>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {PHYSICAL_CONSTANTS.map(c => (
                  <div 
                    key={c.symbol}
                    className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-emerald-400 font-mono">{c.symbol}</span>
                        <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        = {c.value} <span className="text-zinc-400 font-normal">{c.unit}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {c.meaning}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(c.value.replace(/× 10/g, 'e').replace(/[⁻¹²³⁴⁰]/g, ''));
                        setCopiedConstantSymbol(c.symbol);
                        setTimeout(() => setCopiedConstantSymbol(null), 1500);
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
                      title="Sao chép giá trị số"
                    >
                      {copiedConstantSymbol === c.symbol ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: POMODORO & BINAURAL AUDIO                                         */}
      {/* ========================================================================= */}
      {utilityTab === 'pomodoro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Pomodoro Timer Centerpiece (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            {/* Mode Switcher */}
            <div className="inline-flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
              <button
                onClick={() => { setPomoMode('focus'); setPomoMinutes(25); setPomoSeconds(0); setIsPomoRunning(false); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pomoMode === 'focus' ? 'bg-emerald-500 text-black shadow font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Học Sâu (25p)
              </button>
              <button
                onClick={() => { setPomoMode('short_break'); setPomoMinutes(5); setPomoSeconds(0); setIsPomoRunning(false); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pomoMode === 'short_break' ? 'bg-emerald-500 text-black shadow font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Nghỉ Ngắn (5p)
              </button>
              <button
                onClick={() => { setPomoMode('long_break'); setPomoMinutes(15); setPomoSeconds(0); setIsPomoRunning(false); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pomoMode === 'long_break' ? 'bg-emerald-500 text-black shadow font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Nghỉ Dài (15p)
              </button>
            </div>

            {/* Giant Circular Digital Timer Display */}
            <div className="relative w-56 h-56 mx-auto rounded-full bg-zinc-900/90 border-4 border-emerald-500/40 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/10">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-widest">
                {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">
                {pomoMode === 'focus' ? 'DEEP STUDY' : 'RECHARGE BREAK'}
              </span>
              {isPomoRunning && (
                <span className="absolute bottom-6 flex items-center gap-1 text-[10px] text-emerald-300 animate-pulse">
                  <Activity size={12} />
                  <span>Đang Đếm Ngược...</span>
                </span>
              )}
            </div>

            {/* Timer Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleTogglePomo}
                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 ${
                  isPomoRunning 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
                }`}
              >
                {isPomoRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPomoRunning ? 'Tạm Dừng' : 'Bắt Đầu Học Sâu'}</span>
              </button>

              <button
                onClick={handleResetPomo}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Đặt lại"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-around text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Phiên hoàn thành hôm nay:</span>
                <strong className="text-emerald-400 text-base font-mono">{completedPomoCount} Pomodoros</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Thời gian tập trung:</span>
                <strong className="text-white text-base font-mono">{completedPomoCount * 25} phút</strong>
              </div>
            </div>
          </div>

          {/* Binaural Beats & Brainwave Studio (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 size={18} className="text-cyan-400" />
                <h3 className="text-sm font-black text-white">Sóng Não Binaural & Âm Thanh Học Tập</h3>
              </div>
              {activeAudioMode !== 'none' && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                  PLAYING AUDIO
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Tổng hợp trực tiếp bằng Web Audio API theo thời gian thực. Đeo tai nghe (Headphones) để kích hoạt hiệu ứng đồng bộ bán cầu não trái - phải:
            </p>

            <div className="space-y-2.5">
              {[
                { id: 'alpha', title: 'Sóng Alpha (10 Hz)', desc: 'Thư giãn tỉnh táo, hấp thu kiến thức tự nhiên, giảm lo âu khi học bài dài.' },
                { id: 'beta', title: 'Sóng Beta (18 Hz)', desc: 'Tư duy logic, phản xạ tính toán, phân tích bài toán khó và lập luận khoa học.' },
                { id: 'gamma', title: 'Sóng Gamma (40 Hz)', desc: 'Đồng bộ não bộ tối đa, kích hoạt trực giác và sự thông tuệ giải quyết nghịch lý.' },
                { id: 'pink_noise', title: 'Pink Noise (Tiếng Ồn Hồng)', desc: 'Dải tần số năng lượng 1/f triệt tiêu tiếng ồn môi trường, bảo vệ dòng suy nghĩ.' }
              ].map(audio => (
                <div
                  key={audio.id}
                  onClick={() => handleSelectAudioMode(activeAudioMode === audio.id ? 'none' : audio.id as any)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    activeAudioMode === audio.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-white">{audio.title}</h5>
                    <p className="text-[11px] text-zinc-400 leading-tight">{audio.desc}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeAudioMode === audio.id ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activeAudioMode === audio.id ? <Pause size={14} /> : <Play size={14} />}
                  </div>
                </div>
              ))}
            </div>

            {activeAudioMode !== 'none' && (
              <button
                onClick={() => handleSelectAudioMode('none')}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-rose-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <VolumeX size={14} />
                <span>Tắt Toàn Bộ Âm Thanh Sóng Não</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: FIRST PRINCIPLES FLASHCARDS                                       */}
      {/* ========================================================================= */}
      {utilityTab === 'flashcards' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen size={18} className="text-purple-400" />
                <span>Thẻ Ghi Nhớ Bản Chất (First Principles Flashcards)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Thẻ {currentCardIndex + 1} / {flashcards.length} • Môn: <strong className="text-emerald-400">{activeCard.subject}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevCard}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button
                onClick={handleNextCard}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-black transition-colors cursor-pointer"
              >
                Tiếp Theo
              </button>
            </div>
          </div>

          {/* 3D Flip Flashcard */}
          <div 
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="w-full min-h-[300px] p-6 sm:p-8 rounded-3xl bg-zinc-950 border-2 border-purple-500/40 cursor-pointer select-none transition-all duration-300 shadow-2xl flex flex-col justify-between hover:border-purple-400 relative group"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                {isCardFlipped ? 'MẶT SAU: BẢN CHẤT GỐC RỄ' : 'MẶT TRƯỚC: CÂU HỎI TƯ DUY'}
              </span>
              <span className="text-xs text-zinc-500 font-semibold group-hover:text-purple-300 transition-colors">
                (Chạm để lật thẻ ↻)
              </span>
            </div>

            <div className="my-auto py-4">
              {!isCardFlipped ? (
                <div className="space-y-3">
                  <h4 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                    {activeCard.question}
                  </h4>
                  <p className="text-xs text-zinc-400 italic">
                    Hãy thử tự diễn giải bằng lời của mình theo các tiên đề gốc trước khi lật mặt sau...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>Lời Giải Thích Bản Chất First Principles:</span>
                    </span>
                    <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                      {activeCard.firstPrincipleAnswer}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      ⚠️ Cạm bẫy học vẹt thường gặp:
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {activeCard.roteTrap}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Đánh giá mức hiểu:</span>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleNextCard}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-300 border border-rose-500/30 text-[11px] font-bold"
                >
                  Chưa hiểu rõ
                </button>
                <button
                  onClick={handleNextCard}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                >
                  Hiểu tương đối
                </button>
                <button
                  onClick={handleNextCard}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
                >
                  Đã khắc sâu logic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: DOCUMENT PRINCIPLE EXTRACTOR                                      */}
      {/* ========================================================================= */}
      {utilityTab === 'deconstructor' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <span>Bộ Bóc Tách Bản Chất Tài Liệu & Nguyên Lý Gốc AI</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dán nội dung tài liệu, đoạn giáo trình hoặc công thức phức tạp để trích xuất 3 tầng logic, tránh học vẹt.
                </p>
              </div>
              <button
                onClick={handleRunDocumentExtraction}
                disabled={isExtracting || !rawDocumentText.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isExtracting ? (
                  <>
                    <Sparkles size={14} className="animate-spin" />
                    <span>Đang Bóc Tách...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Bóc Tách Bản Chất</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              value={rawDocumentText}
              onChange={(e) => setRawDocumentText(e.target.value)}
              placeholder="Dán nội dung tài liệu học tập vào đây..."
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
            />
          </div>

          {/* Extracted 3-Layer Results */}
          {extractedResult && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-emerald-500/40 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Kết Quả Bóc Tách 3 Tầng Kiến Thức (First Principles Breakdown)</span>
                </span>

                {onSaveToNotebook && (
                  <button
                    onClick={() => {
                      onSaveToNotebook(
                        'Bóc Tách Bản Chất Tài Liệu',
                        `Nguyên lý gốc:\n${extractedResult.rootAxiom}\n\nChuỗi diễn dịch:\n${extractedResult.derivationChain.join('\n')}\n\nCạm bẫy học vẹt:\n${extractedResult.roteTraps.join('\n')}`,
                        ['First Principles', 'Tài liệu']
                      );
                      alert('Đã lưu kết quả bóc tách vào Sổ Tay Nghiên Cứu!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen size={13} />
                    <span>Lưu Vào Sổ Tay</span>
                  </button>
                )}
              </div>

              {/* Layer 1: Root Axiom */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-1.5">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
                  Tầng 1: Tiên Đề & Nguyên Lý Gốc (Root Axiom)
                </span>
                <p className="text-sm text-zinc-100 font-semibold leading-relaxed">
                  {extractedResult.rootAxiom}
                </p>
              </div>

              {/* Layer 2: Derivation Chain */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wider block">
                  Tầng 2: Chuỗi Diễn Dịch Logic (Derivation Chain)
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {extractedResult.derivationChain.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Layer 3: Anti-Rote Traps */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider block">
                  Tầng 3: Cạm Bẫy Học Vẹt Cần Tránh (Anti-Rote Traps)
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {extractedResult.roteTraps.map((trap, idx) => (
                    <li key={idx} className="leading-relaxed">
                      • {trap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* One-page summary */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                <strong className="text-zinc-200">Tóm tắt cô đọng:</strong> {extractedResult.onePageSummary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default EduUtilitySuiteView;
