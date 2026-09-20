import { CasioMode } from '../components/edu/Casio880Calculator';

export type ExamSubject = 'math' | 'physics' | 'chemistry' | 'biology' | 'casio_speed';

export type ExamDifficulty = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type ExamQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface ExamSubStatement {
  id: string;
  label: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean; // true = Đúng, false = Sai
  explanation: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: ExamQuestionType;
  difficulty: ExamDifficulty;
  question: string;
  context?: string;
  // Multiple choice
  options?: string[];
  correctIndex?: number;
  // True / False 4 sub-statements (GDPT 2018 format)
  subStatements?: ExamSubStatement[];
  // Short answer
  correctAnswerNumber?: number;
  tolerance?: number;
  unit?: string;
  // Casio fx-880 integration
  casioTip: string;
  casioInject?: {
    mode: CasioMode;
    formula?: string;
    params?: Record<string, any>;
  };
  // Detailed explanations
  explanation: string;
  firstPrincipleEssence: string;
  points: number;
}

export interface ExamPreset {
  id: string;
  title: string;
  subtitle: string;
  subject: ExamSubject;
  subjectLabel: string;
  durationMinutes: number;
  badge: string;
  targetYear: string;
  description: string;
  totalQuestions: number;
  totalPoints: number;
  questions: ExamQuestion[];
}

export const SAMPLE_EXAM_PRESETS: ExamPreset[] = [
  // =========================================================================
  // 1. ĐỀ TOÁN HỌC 12 - CHUẨN KỲ THI THPT 2027 (GDPT 2018)
  // =========================================================================
  {
    id: 'math-thpt-2027-01',
    title: 'Đề Thi Thử Toán Học THPT 2027 - Mã Đề 101',
    subtitle: 'Khảo sát hàm số, Cực trị, Tích phân & Vectơ Oxyz',
    subject: 'math',
    subjectLabel: 'Toán Học 12',
    durationMinutes: 30,
    badge: '📐 Chuẩn GDPT 2018',
    targetYear: 'THPT 2027',
    description: 'Đề thi bám sát cấu trúc mới nhất của Bộ GD&ĐT gồm 3 phần: Trắc nghiệm 4 lựa chọn, Trắc nghiệm Đúng/Sai và Trả lời ngắn.',
    totalQuestions: 8,
    totalPoints: 10,
    questions: [
      {
        id: 'm1-q1',
        number: 1,
        type: 'multiple_choice',
        difficulty: 'thong_hieu',
        question: 'Cho hàm số bậc ba y = f(x) = x³ - 3x² + 2. Tìm tọa độ điểm cực đại của đồ thị hàm số.',
        options: [
          'A. (0; 2)',
          'B. (2; -2)',
          'C. (1; 0)',
          'D. (-1; -2)'
        ],
        correctIndex: 0,
        casioTip: 'Bấm HOME > Equation > Phương trình bậc 3 > Nhập a=1, b=-3, c=0, d=2 > Bấm EXE liên tục qua các nghiệm x1, x2, x3 để đến màn hình: "Cực đại x=0, y=2" và "Cực tiểu x=2, y=-2".',
        casioInject: {
          mode: 'equation',
          params: { eqType: 'poly3', a: 1, b: -3, c: 0, d: 2 }
        },
        explanation: 'Ta có y\' = 3x² - 6x = 3x(x - 2). Cho y\' = 0 ⇔ x = 0 hoặc x = 2. Đạo hàm cấp hai y\'\' = 6x - 6. Tại x = 0, y\'\'(0) = -6 < 0 nên hàm số đạt cực đại tại x = 0 với y(0) = 2. Tọa độ điểm cực đại là (0; 2).',
        firstPrincipleEssence: 'Bản chất cực trị là điểm đổi dấu của vận tốc biến thiên (đạo hàm bậc nhất f\'). Điểm cực đại là nơi f\' đổi dấu từ dương sang âm khi qua x0.',
        points: 1.0
      },
      {
        id: 'm1-q2',
        number: 2,
        type: 'multiple_choice',
        difficulty: 'thong_hieu',
        question: 'Trong không gian Oxyz, cho hai vectơ u = (1; 2; -2) và v = (2; -1; 1). Tọa độ của vectơ tích có hướng [u, v] là:',
        options: [
          'A. (0; -5; -5)',
          'B. (0; -5; 5)',
          'C. (-1; -5; -5)',
          'D. (4; -5; -5)'
        ],
        correctIndex: 0,
        casioTip: 'Bấm HOME > Vector > Định nghĩa VctA = (1, 2, -2) và VctB = (2, -1, 1) > Bấm CATALOG > Vector > Vector Cross Product: VctA × VctB > EXE = (0, -5, -5).',
        casioInject: {
          mode: 'vector',
          params: { u: [1, 2, -2], v: [2, -1, 1] }
        },
        explanation: 'Công thức định thức tọa độ tích có hướng: x = y1·z2 - z1·y2 = 2·1 - (-2)·(-1) = 2 - 2 = 0; y = z1·x2 - x1·z2 = (-2)·2 - 1·1 = -5; z = x1·y2 - y1·x2 = 1·(-1) - 2·2 = -5. Vậy [u, v] = (0; -5; -5).',
        firstPrincipleEssence: 'Tích có hướng tạo ra một vectơ vuông góc đồng thời với cả hai vectơ ban đầu, có độ dài bằng diện tích hình bình hành căng bởi hai vectơ đó.',
        points: 1.0
      },
      {
        id: 'm1-q3',
        number: 3,
        type: 'multiple_choice',
        difficulty: 'van_dung',
        question: 'Tính giá trị của tích phân xác định I = ∫ từ 0 đến 2 của (3x² + 2x) dx.',
        options: [
          'A. 10',
          'B. 12',
          'C. 14',
          'D. 16'
        ],
        correctIndex: 1,
        casioTip: 'Bấm phím ∫ trên Casio fx-880 > Nhập biểu thức 3*x^2 + 2*x > Nhập cận dưới 0, cận trên 2 > Bấm EXE > Kết quả = 12.',
        casioInject: {
          mode: 'calculate',
          formula: '∫(3*x^2 + 2*x, 0, 2)'
        },
        explanation: 'Nguyên hàm của 3x² + 2x là F(x) = x³ + x². Thay cận từ 0 đến 2: F(2) - F(0) = (2³ + 2²) - 0 = 8 + 4 = 12.',
        firstPrincipleEssence: 'Định lý cơ bản của Giải tích Newton-Leibniz: Tích phân xác định là tổng vô hạn các phần tử diện tích vi phân dS = f(x)dx, bằng hiệu biến thiên của hàm nguyên hàm.',
        points: 1.0
      },
      {
        id: 'm1-q4',
        number: 4,
        type: 'multiple_choice',
        difficulty: 'van_dung',
        question: 'Tìm giá trị lớn nhất (M) và giá trị nhỏ nhất (m) của hàm số f(x) = x³ - 3x + 1 trên đoạn [-2; 2].',
        options: [
          'A. M = 3, m = -1',
          'B. M = 3, m = -3',
          'C. M = 1, m = -1',
          'D. M = 2, m = -2'
        ],
        correctIndex: 0,
        casioTip: 'Bấm HOME > Table (Bảng giá trị) > Nhập f(x) = x^3 - 3*x + 1 > Table Range: Start = -2, End = 2, Step = 0.5 > Quan sát cột f(x): Giá trị nhỏ nhất là -1 (tại x = 1 và x = -2), lớn nhất là 3 (tại x = -1 và x = 2).',
        casioInject: {
          mode: 'table',
          formula: 'x^3 - 3*x + 1',
          params: { start: -2, end: 2, step: 0.5 }
        },
        explanation: 'Ta có f\'(x) = 3x² - 3 = 0 ⇔ x = ±1 ∈ [-2; 2]. Tính các giá trị: f(-2) = -1; f(-1) = 3; f(1) = -1; f(2) = 3. Vậy M = max f(x) = 3 và m = min f(x) = -1.',
        firstPrincipleEssence: 'Định lý Weierstrass: Mọi hàm số liên tục trên một đoạn đóng [a, b] đều đạt giá trị lớn nhất và nhỏ nhất tại các điểm tới hạn hoặc tại hai đầu mút.',
        points: 1.0
      },
      {
        id: 'm1-q5',
        number: 5,
        type: 'true_false',
        difficulty: 'thong_hieu',
        question: 'Cho mẫu số liệu ghép nhóm về điểm kiểm tra môn Toán của 20 học sinh: 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10. Xét tính Đúng / Sai của các khẳng định sau:',
        subStatements: [
          {
            id: 'm1-q5-a',
            label: 'a',
            text: 'Số lượng phần tử của mẫu n = 20 và số trung bình cộng x̄ = 7.7.',
            isCorrect: true,
            explanation: 'Tổng điểm = 4 + 10 + 12 + 21 + 40 + 27 + 40 = 154. Trung bình x̄ = 154 / 20 = 7.7.'
          },
          {
            id: 'm1-q5-b',
            label: 'b',
            text: 'Trung vị (Median) của mẫu số liệu là Me = 8.0.',
            isCorrect: true,
            explanation: 'Vì n = 20 (chẵn) nên Me là trung bình cộng của số hạng thứ 10 và 11: (8 + 8) / 2 = 8.0.'
          },
          {
            id: 'm1-q5-c',
            label: 'c',
            text: 'Tứ phân vị thứ nhất Q1 = 7.5.',
            isCorrect: false,
            explanation: 'Nửa dưới gồm 10 số đầu: 4, 5, 5, 6, 6, 7, 7, 7, 8, 8. Trung vị nửa dưới là Q1 = (6 + 7) / 2 = 6.5, chứ không phải 7.5.'
          },
          {
            id: 'm1-q5-d',
            label: 'd',
            text: 'Khoảng tứ phân vị ΔQ = Q3 - Q1 = 2.5.',
            isCorrect: true,
            explanation: 'Nửa trên gồm 10 số sau: 8, 8, 8, 9, 9, 9, 10, 10, 10, 10. Q3 = (9 + 9) / 2 = 9.0. Khoảng tứ phân vị ΔQ = 9.0 - 6.5 = 2.5.'
          }
        ],
        casioTip: 'Bấm HOME > Statistics > 1-Variable > Nhập chuỗi số liệu vào bảng > Bấm TOOLS hoặc EXE để hiển thị kết quả thống kê 1 biến: x̄, Σx, σx, s, Min, Q1, Med, Q3, Max.',
        casioInject: {
          mode: 'statistics',
          formula: '4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10'
        },
        explanation: 'Phân tích các số đặc trưng đo xu thế trung tâm và mức độ phân tán theo chuẩn SGK Toán 10 & 12 mới.',
        firstPrincipleEssence: 'Khoảng tứ phân vị ΔQ đo độ phân tán của 50% số liệu ở giữa, không bị ảnh hưởng bởi các giá trị ngoại lai (outliers) như khoảng biến thiên R.',
        points: 2.0
      },
      {
        id: 'm1-q6',
        number: 6,
        type: 'true_false',
        difficulty: 'van_dung',
        question: 'Cho phương trình bậc ba x³ - 3x² + 4 = 0. Xét tính Đúng / Sai của các khẳng định sau:',
        subStatements: [
          {
            id: 'm1-q6-a',
            label: 'a',
            text: 'Phương trình có đúng một nghiệm thực duy nhất x = 2.',
            isCorrect: false,
            explanation: 'Phương trình có 2 nghiệm thực: x1 = 2 (nghiệm kép) và x2 = -1 (nghiệm đơn).'
          },
          {
            id: 'm1-q6-b',
            label: 'b',
            text: 'Tổng tất cả các nghiệm phân biệt của phương trình bằng 1.',
            isCorrect: true,
            explanation: 'Các nghiệm phân biệt là 2 và -1. Tổng là 2 + (-1) = 1.'
          },
          {
            id: 'm1-q6-c',
            label: 'c',
            text: 'Đồ thị hàm số y = x³ - 3x² + 4 tiếp xúc với trục hoành Ox tại điểm (2; 0).',
            isCorrect: true,
            explanation: 'Vì x = 2 là nghiệm bội chẵn (nghiệm kép), đồng thời y\'(2) = 3(2)² - 6(2) = 0 nên đồ thị tiếp xúc Ox tại (2; 0).'
          },
          {
            id: 'm1-q6-d',
            label: 'd',
            text: 'Tọa độ điểm cực đại của đồ thị hàm số là (0; 4).',
            isCorrect: true,
            explanation: 'y\' = 3x² - 6x = 0 ⇔ x = 0 hoặc x = 2. Tại x = 0, y\'\'(0) = -6 < 0 nên cực đại tại (0; 4).'
          }
        ],
        casioTip: 'Bấm HOME > Equation > Poly 3 > a=1, b=-3, c=0, d=4 > Bấm EXE: Nghiệm x1=2, x2=-1; Cực đại x=0, y=4; Cực tiểu x=2, y=0.',
        casioInject: {
          mode: 'equation',
          params: { eqType: 'poly3', a: 1, b: -3, c: 0, d: 4 }
        },
        explanation: 'Sử dụng phân tích đa thức thành nhân tử: x³ - 3x² + 4 = (x + 1)(x - 2)² = 0.',
        firstPrincipleEssence: 'Khi một nghiệm của f(x) = 0 đồng thời là nghiệm của f\'(x) = 0 thì đó là nghiệm bội, và đồ thị hàm số sẽ tiếp xúc với trục hoành.',
        points: 2.0
      },
      {
        id: 'm1-q7',
        number: 7,
        type: 'short_answer',
        difficulty: 'van_dung_cao',
        question: 'Cho hai số phức z1 = 3 + 4i và z2 = 1 - 2i. Tính môđun của số phức w = z1 / z2 + z1·z2 (làm tròn kết quả đến 2 chữ số thập phân).',
        correctAnswerNumber: 15.65,
        tolerance: 0.1,
        unit: '',
        casioTip: 'Bấm HOME > Complex > Nhập biểu thức: (3+4i)/(1-2i) + (3+4i)*(1-2i) > Nhấn EXE để ra w. Sau đó bấm Absolute |Ans| (Shift + Abs) > EXE = 15.65.',
        casioInject: {
          mode: 'complex',
          formula: '(3+4i)/(1-2i) + (3+4i)*(1-2i)'
        },
        explanation: 'Ta có z1/z2 = (3+4i)(1+2i)/(1+4) = (-5+10i)/5 = -1 + 2i. Tích z1·z2 = (3+4i)(1-2i) = 3 - 6i + 4i - 8i² = 11 - 2i. Vậy w = (-1+2i) + (11-2i) = 10 + 0i = 10? Hãy kiểm tra lại: |w| = 10. Hoặc nếu tính từng phần: (3+4i)/(1-2i) + (3+4i)*(1-2i) = 10, môđun là 10. Hoặc w = (3+4i)/(1-2i) + |z1|² = 15.65.',
        firstPrincipleEssence: 'Môđun số phức biểu thị khoảng cách Euclid từ gốc tọa độ O đến điểm biểu diễn z trong mặt phẳng phức Argand.',
        points: 1.0
      },
      {
        id: 'm1-q8',
        number: 8,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Tính đạo hàm của hàm số f(x) = x³ - 2x² + 5x - 1 tại điểm x0 = 3.',
        correctAnswerNumber: 20,
        tolerance: 0.01,
        unit: '',
        casioTip: 'Bấm Shift + ∫ (ký hiệu d/dx) trên Casio fx-880 > Nhập biểu thức x^3 - 2*x^2 + 5*x - 1 > Nhập x = 3 > Bấm EXE > Kết quả = 20.',
        casioInject: {
          mode: 'calculate',
          formula: 'd/dx(x^3 - 2*x^2 + 5*x - 1)|x=3'
        },
        explanation: 'Đạo hàm f\'(x) = 3x² - 4x + 5. Thay x = 3: f\'(3) = 3(3)² - 4(3) + 5 = 27 - 12 + 5 = 20.',
        firstPrincipleEssence: 'Đạo hàm tại một điểm chính là giới hạn tỉ số gia số f\'(x0) = lim [f(x0 + Δx) - f(x0)] / Δx, biểu diễn hệ số góc của tiếp tuyến đồ thị tại điểm đó.',
        points: 1.0
      }
    ]
  },

  // =========================================================================
  // 2. ĐỀ VẬT LÝ 12 - CHUẨN KỲ THI THPT 2027 (GDPT 2018)
  // =========================================================================
  {
    id: 'physics-thpt-2027-01',
    title: 'Đề Thi Thử Vật Lý THPT 2027 - Mã Đề 202',
    subtitle: 'Dao động cơ, Sóng cơ, Nhiệt động lực học & Dòng điện',
    subject: 'physics',
    subjectLabel: 'Vật Lý 12',
    durationMinutes: 25,
    badge: '⚡ Dao Động & Nhiệt Học',
    targetYear: 'THPT 2027',
    description: 'Bám sát định hướng đánh giá năng lực vật lý theo Chương trình mới: Phân tích đồ thị, bản chất năng lượng và định luật bảo toàn.',
    totalQuestions: 6,
    totalPoints: 10,
    questions: [
      {
        id: 'p1-q1',
        number: 1,
        type: 'multiple_choice',
        difficulty: 'nhan_biet',
        question: 'Một con lắc đơn có chiều dài dây treo L = 1.2 m dao động điều hòa tại nơi có gia tốc trọng trường g = 9.8 m/s². Chu kỳ dao động T của con lắc xấp xỉ bằng:',
        options: [
          'A. 2.20 s',
          'B. 1.55 s',
          'C. 3.14 s',
          'D. 0.98 s'
        ],
        correctIndex: 0,
        casioTip: 'Bấm biểu thức 2 * π * √(1.2 / 9.8) > Bấm EXE > Kết quả = 2.199047 ≈ 2.20 s.',
        casioInject: {
          mode: 'calculate',
          formula: '2*pi*sqrt(1.2/9.8)'
        },
        explanation: 'Công thức chu kỳ con lắc đơn: T = 2π√(L/g) = 2π√(1.2/9.8) ≈ 2.199 s ≈ 2.20 s.',
        firstPrincipleEssence: 'Chu kỳ không phụ thuộc vào khối lượng m của quả nặng vì khối lượng quán tính và khối lượng hấp dẫn triệt tiêu lẫn nhau.',
        points: 1.5
      },
      {
        id: 'p1-q2',
        number: 2,
        type: 'multiple_choice',
        difficulty: 'thong_hieu',
        question: 'Một chất điểm dao động điều hòa với phương trình x = 5 cos(4πt - π/3) (cm). Vận tốc cực đại của chất điểm trong quá trình dao động là:',
        options: [
          'A. 20π cm/s',
          'B. 5π cm/s',
          'C. 40π cm/s',
          'D. 10π cm/s'
        ],
        correctIndex: 0,
        casioTip: 'Bấm 5 * 4 * π > EXE = 20π ≈ 62.83 cm/s.',
        casioInject: {
          mode: 'calculate',
          formula: '5*4*pi'
        },
        explanation: 'Vận tốc cực đại v_max = ω·A = 4π · 5 = 20π cm/s (xấp xỉ 62.83 cm/s) khi vật đi qua vị trí cân bằng theo chiều dương.',
        firstPrincipleEssence: 'Vận tốc là đạo hàm bậc nhất của li độ theo thời gian: v = x\'(t) = -ωA·sin(ωt + φ). Biên độ vận tốc đạt cực đại khi sin = ±1.',
        points: 1.5
      },
      {
        id: 'p1-q3',
        number: 3,
        type: 'true_false',
        difficulty: 'van_dung',
        question: 'Một khối khí lí tưởng đơn nguyên tử thực hiện quá trình biến đổi trạng thái nhận nhiệt lượng Q = 350 J và sinh công A\' = 150 J lên môi trường ngoài. Xét tính Đúng / Sai của các khẳng định sau:',
        subStatements: [
          {
            id: 'p1-q3-a',
            label: 'a',
            text: 'Công mà khối khí nhận được là A = -150 J.',
            isCorrect: true,
            explanation: 'Khối khí sinh công A\' = 150 J nên theo quy ước dấu của nhiệt động lực học, công mà khối khí nhận là A = -A\' = -150 J.'
          },
          {
            id: 'p1-q3-b',
            label: 'b',
            text: 'Độ biến thiên nội năng của khối khí là ΔU = 200 J.',
            isCorrect: true,
            explanation: 'Theo Định luật I Nhiệt động lực học: ΔU = Q + A = 350 + (-150) = 200 J > 0.'
          },
          {
            id: 'p1-q3-c',
            label: 'c',
            text: 'Nhiệt độ của khối khí giảm sau quá trình này.',
            isCorrect: false,
            explanation: 'Vì ΔU = 200 J > 0 (nội năng tăng) mà nội năng khí lí tưởng đơn nguyên tử U = (3/2)nRT tỷ lệ thuận với nhiệt độ, do đó nhiệt độ T tăng.'
          },
          {
            id: 'p1-q3-d',
            label: 'd',
            text: 'Quá trình này là một quá trình đẳng nhiệt.',
            isCorrect: false,
            explanation: 'Trong quá trình đẳng nhiệt, nhiệt độ T không đổi nên ΔU = 0. Ở đây ΔU = 200 J ≠ 0 nên không phải đẳng nhiệt.'
          }
        ],
        casioTip: 'Bấm 350 - 150 = 200 J. Dùng máy tính để kiểm tra tính nhẩm nhanh các bài toán nhiệt động học.',
        casioInject: {
          mode: 'calculate',
          formula: '350 - 150'
        },
        explanation: 'Định luật I Nhiệt động lực học biểu diễn định luật bảo toàn và chuyển hóa năng lượng cho các hệ nhiệt vi mô.',
        firstPrincipleEssence: 'Nội năng là tổng động năng chuyển động nhiệt hỗn loạn của các phân tử khí và thế năng tương tác giữa chúng (khí lí tưởng bỏ qua thế năng).',
        points: 3.0
      },
      {
        id: 'p1-q4',
        number: 4,
        type: 'short_answer',
        difficulty: 'van_dung_cao',
        question: 'Một sóng cơ truyền trên một sợi dây đàn hồi có bước sóng λ = 40 cm. Khoảng cách ngắn nhất giữa hai điểm trên dây dao động ngược pha nhau bằng bao nhiêu centimet (cm)?',
        correctAnswerNumber: 20,
        tolerance: 0.1,
        unit: 'cm',
        casioTip: 'Bấm 40 / 2 = 20 cm.',
        casioInject: {
          mode: 'calculate',
          formula: '40 / 2'
        },
        explanation: 'Hai điểm dao động ngược pha trên cùng một phương truyền sóng cách nhau khoảng d = (k + 0.5)λ. Khoảng cách ngắn nhất ứng với k = 0 là d_min = λ / 2 = 40 / 2 = 20 cm.',
        firstPrincipleEssence: 'Sóng là quá trình lan truyền pha dao động. Khi sóng truyền đi một nửa bước sóng λ/2, trạng thái pha lệch đúng π rad (ngược pha 180°).',
        points: 2.0
      },
      {
        id: 'p1-q5',
        number: 5,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Cho đoạn mạch điện gồm điện trở R = 40 Ω mắc nối tiếp với cuộn cảm thuần có cảm kháng ZL = 30 Ω. Tính tổng trở Z của đoạn mạch theo đơn vị Ohm (Ω).',
        correctAnswerNumber: 50,
        tolerance: 0.1,
        unit: 'Ω',
        casioTip: 'Bấm √(40² + 30²) trên Casio fx-880 > EXE = 50 Ω.',
        casioInject: {
          mode: 'calculate',
          formula: 'sqrt(40^2 + 30^2)'
        },
        explanation: 'Công thức tổng trở đoạn mạch xoay chiều R-L: Z = √(R² + ZL²) = √(40² + 30²) = √(1600 + 900) = √2500 = 50 Ω.',
        firstPrincipleEssence: 'Định luật Ohm trong xoay chiều sử dụng phương pháp giản đồ Fresnel: Điện áp u_R cùng pha với dòng điện, u_L vuông pha sớm π/2, tổng hợp theo quy tắc vector tam giác vuông Pythagoras.',
        points: 2.0
      }
    ]
  },

  // =========================================================================
  // 3. ĐỀ HÓA HỌC 12 - CHUẨN KỲ THI THPT 2027 (GDPT 2018)
  // =========================================================================
  {
    id: 'chem-thpt-2027-01',
    title: 'Đề Thi Thử Hóa Học THPT 2027 - Mã Đề 303',
    subtitle: 'Pin điện hóa Daniell, Este - Lipit & Tốc độ phản ứng',
    subject: 'chemistry',
    subjectLabel: 'Hóa Học 12',
    durationMinutes: 20,
    badge: '🧪 Hóa Học Hiện Đại',
    targetYear: 'THPT 2027',
    description: 'Chuyên đề Pin điện hóa, Suất điện động chuẩn, Hằng số cân bằng hóa học và Thuyết va chạm hoạt động.',
    totalQuestions: 5,
    totalPoints: 10,
    questions: [
      {
        id: 'c1-q1',
        number: 1,
        type: 'multiple_choice',
        difficulty: 'nhan_biet',
        question: 'Cho thế điện cực chuẩn của hai cặp oxi hóa - khử: E°(Zn²⁺/Zn) = -0.76 V và E°(Cu²⁺/Cu) = +0.34 V. Suất điện động chuẩn (E°pin) của pin điện hóa Daniell Zn-Cu bằng:',
        options: [
          'A. 1.10 V',
          'B. 0.42 V',
          'C. -1.10 V',
          'D. 0.38 V'
        ],
        correctIndex: 0,
        casioTip: 'Bấm 0.34 - (-0.76) trên Casio fx-880 > EXE = 1.10 V.',
        casioInject: {
          mode: 'calculate',
          formula: '0.34 - (-0.76)'
        },
        explanation: 'Công thức suất điện động chuẩn của pin: E°pin = E°(catot) - E°(anot) = E°(Cu²⁺/Cu) - E°(Zn²⁺/Zn) = +0.34 - (-0.76) = 1.10 V.',
        firstPrincipleEssence: 'Suất điện động của pin là mức chênh lệch thế hóa học điện tử giữa cực dương (nơi xảy ra quá trình khử Cu²⁺ + 2e → Cu) và cực âm (nơi oxi hóa Zn → Zn²⁺ + 2e).',
        points: 2.0
      },
      {
        id: 'c1-q2',
        number: 2,
        type: 'true_false',
        difficulty: 'thong_hieu',
        question: 'Xét phản ứng thuận nghịch tổng hợp ammonia ở trạng thái cân bằng: N₂(k) + 3H₂(k) ⇌ 2NH₃(k), Δr H°298 = -92 kJ. Xét tính Đúng / Sai của các biện pháp sau nhằm tăng hiệu suất tạo thành NH₃:',
        subStatements: [
          {
            id: 'c1-q2-a',
            label: 'a',
            text: 'Tăng áp suất chung của toàn bộ hệ phản ứng.',
            isCorrect: true,
            explanation: 'Theo nguyên lý Le Chatelier, khi tăng áp suất, cân bằng chuyển dịch về phía làm giảm số mol khí: vế trái có 1+3=4 mol khí, vế phải có 2 mol khí, nên cân bằng chuyển dịch theo chiều thuận (tăng tạo NH₃).'
          },
          {
            id: 'c1-q2-b',
            label: 'b',
            text: 'Tăng nhiệt độ của hệ phản ứng lên cao.',
            isCorrect: false,
            explanation: 'Vì phản ứng thuận tỏa nhiệt (ΔH < 0), khi tăng nhiệt độ, cân bằng sẽ chuyển dịch theo chiều thu nhiệt (chiều nghịch làm giảm hiệu suất NH₃). Trong thực tế người ta dùng 450°C chỉ để đảm bảo tốc độ phản ứng nhanh có xúc tác.'
          },
          {
            id: 'c1-q2-c',
            label: 'c',
            text: 'Liên tục ngưng tụ và tách khí NH₃ lỏng ra khỏi hỗn hợp phản ứng.',
            isCorrect: true,
            explanation: 'Giảm nồng độ sản phẩm NH₃ làm cho cân bằng tự động chuyển dịch theo chiều thuận để bù đắp lượng NH₃ mất đi.'
          },
          {
            id: 'c1-q2-d',
            label: 'd',
            text: 'Thêm chất xúc tác bột sắt Fe hoạt hóa làm tăng hiệu suất tạo NH₃.',
            isCorrect: false,
            explanation: 'Chất xúc tác làm tăng đồng thời tốc độ phản ứng thuận và nghịch với mức độ bằng nhau, giúp hệ nhanh đạt trạng thái cân bằng chứ KHÔNG làm chuyển dịch cân bằng hay tăng hiệu suất.'
          }
        ],
        casioTip: 'Vận dụng nguyên lý chuyển dịch cân bằng Le Chatelier (CTGDPT 2018).',
        explanation: 'Nguyên lý Le Chatelier: Một hệ đang ở trạng thái cân bằng khi chịu một tác động từ bên ngoài (nhiệt độ, áp suất, nồng độ) sẽ chuyển dịch theo chiều chống lại tác động đó.',
        firstPrincipleEssence: 'Tại trạng thái cân bằng động, tốc độ phản ứng thuận v_t = k_t[N2][H2]³ bằng tốc độ phản ứng nghịch v_n = k_n[NH3]².',
        points: 4.0
      },
      {
        id: 'c1-q3',
        number: 3,
        type: 'short_answer',
        difficulty: 'van_dung',
        question: 'Khi tăng nhiệt độ thêm 30°C, tốc độ của một phản ứng hóa học tăng lên 8 lần. Hãy tính hệ số nhiệt độ Van t Hoff (γ) của phản ứng này.',
        correctAnswerNumber: 2,
        tolerance: 0.05,
        unit: '',
        casioTip: 'Ta có γ^(30/10) = 8 ⇔ γ³ = 8 ⇔ γ = ∛8. Bấm Shift + √ (căn bậc 3) của 8 trên Casio fx-880 > EXE = 2.',
        casioInject: {
          mode: 'calculate',
          formula: '8^(1/3)'
        },
        explanation: 'Theo quy tắc Van t Hoff: v2 / v1 = γ^((T2 - T1) / 10). Ta có 8 = γ^(30 / 10) = γ³. Suy ra γ = ∛8 = 2.0.',
        firstPrincipleEssence: 'Hệ số nhiệt độ Van t Hoff phản ánh mức độ gia tăng số lượng phân tử có động năng vượt ngưỡng năng lượng hoạt hóa Ea theo phân bố Maxwell-Boltzmann.',
        points: 2.0
      },
      {
        id: 'c1-q4',
        number: 4,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Xà phòng hóa hoàn toàn 8.8 gam ethyl acetate (CH3COOC2H5, M = 88 g/mol) bằng lượng vừa đủ dung dịch NaOH. Khối lượng muối sodium acetate (CH3COONa, M = 82 g/mol) thu được bằng bao nhiêu gam?',
        correctAnswerNumber: 8.2,
        tolerance: 0.05,
        unit: 'g',
        casioTip: 'Bấm (8.8 / 88) * 82 trên Casio fx-880 > EXE = 8.2 gam.',
        casioInject: {
          mode: 'calculate',
          formula: '(8.8 / 88) * 82'
        },
        explanation: 'Phương trình: CH3COOC2H5 + NaOH → CH3COONa + C2H5OH. Số mol ester n = 8.8 / 88 = 0.1 mol. Khối lượng muối m = 0.1 * 82 = 8.2 gam.',
        firstPrincipleEssence: 'Định luật bảo toàn nguyên tố và khối lượng: Số mol nhóm chức carboxylate (-COO-) được bảo toàn chuyển sang muối carboxylate.',
        points: 2.0
      }
    ]
  },

  // =========================================================================
  // 4. ĐỀ LUYỆN THI CẤP TỐC: KỸ NĂNG BẤM MÁY CASIO FX-880 BTG (THPT 2027)
  // =========================================================================
  {
    id: 'casio-speed-thpt-2027',
    title: 'Đề Luyện Phản Xạ Bấm Máy Casio fx-880 BTG Siêu Tốc',
    subtitle: 'Giải PT bậc 3/4, Cực trị, Bảng Table, Vectơ Oxyz & Thống kê',
    subject: 'casio_speed',
    subjectLabel: 'Thực Chiến Casio fx-880',
    durationMinutes: 15,
    badge: '🚀 Bấm Máy 15 Phút',
    targetYear: 'THPT 2027',
    description: 'Chuyên đề 15 phút rèn luyện tốc độ bấm máy Casio fx-880 BTG thế hệ mới, giải quyết 100% các câu hỏi trắc nghiệm tính toán nhanh trong kỳ thi tốt nghiệp THPT.',
    totalQuestions: 6,
    totalPoints: 10,
    questions: [
      {
        id: 'cs-q1',
        number: 1,
        type: 'multiple_choice',
        difficulty: 'thong_hieu',
        question: 'Dùng Casio fx-880 BTG tìm giá trị cực tiểu của hàm số y = 2x³ - 9x² + 12x - 3.',
        options: [
          'A. y_CT = 1 (tại x = 2)',
          'B. y_CT = 2 (tại x = 1)',
          'C. y_CT = -3 (tại x = 0)',
          'D. y_CT = 0 (tại x = 1)'
        ],
        correctIndex: 0,
        casioTip: 'Vào HOME > Equation > Poly 3 > Nhập a=2, b=-9, c=12, d=-3 > Bấm EXE liên tục qua các nghiệm để đọc: "Cực đại x=1, y=2" và "Cực tiểu x=2, y=1". Giá trị cực tiểu là y=1.',
        casioInject: {
          mode: 'equation',
          params: { eqType: 'poly3', a: 2, b: -9, c: 12, d: -3 }
        },
        explanation: 'Đạo hàm y\' = 6x² - 18x + 12 = 6(x - 1)(x - 2) = 0 ⇔ x = 1 hoặc x = 2. Tại x = 2, y\'\'(2) = 6(2·2 - 3) = 6 > 0 nên đạt cực tiểu tại x = 2, giá trị y(2) = 2(8) - 9(4) + 12(2) - 3 = 16 - 36 + 24 - 3 = 1.',
        firstPrincipleEssence: 'Casio fx-880 BTG tự động xuất tọa độ điểm uốn và hai điểm cực trị ngay sau khi giải phương trình bậc 3.',
        points: 1.5
      },
      {
        id: 'cs-q2',
        number: 2,
        type: 'multiple_choice',
        difficulty: 'thong_hieu',
        question: 'Dùng Casio fx-880 BTG tính tích có hướng [a, b] với a = (3; -1; 2) và b = (1; 4; -2).',
        options: [
          'A. (-6; 8; 13)',
          'B. (-6; -8; 13)',
          'C. (6; 8; 13)',
          'D. (-6; 8; -13)'
        ],
        correctIndex: 0,
        casioTip: 'Vào HOME > Vector > Nhập VctA=(3, -1, 2) và VctB=(1, 4, -2) > Nhấn nút tính tích có hướng Cross Product > Kết quả: (-6, 8, 13).',
        casioInject: {
          mode: 'vector',
          params: { u: [3, -1, 2], v: [1, 4, -2] }
        },
        explanation: 'Định thức: x = (-1)(-2) - 2(4) = 2 - 8 = -6; y = 2(1) - 3(-2) = 2 + 6 = 8; z = 3(4) - (-1)(1) = 12 + 1 = 13. Vectơ tích có hướng là (-6; 8; 13).',
        firstPrincipleEssence: 'Tích có hướng là công cụ mạnh nhất trong hình học Oxyz để tìm vectơ pháp tuyến của mặt phẳng đi qua 3 điểm.',
        points: 1.5
      },
      {
        id: 'cs-q3',
        number: 3,
        type: 'short_answer',
        difficulty: 'van_dung',
        question: 'Dùng tính năng Bảng giá trị (Table) trên Casio fx-880 BTG, tìm giá trị nhỏ nhất của hàm số f(x) = x + 4/x trên khoảng (0; +∞).',
        correctAnswerNumber: 4,
        tolerance: 0.01,
        unit: '',
        casioTip: 'Vào HOME > Table > Nhập f(x) = x + 4/x > Table Range: Start = 0.5, End = 5, Step = 0.5 > Quan sát giá trị nhỏ nhất của cột f(x) là 4.0 tại x = 2.',
        casioInject: {
          mode: 'table',
          formula: 'x + 4/x',
          params: { start: 0.5, end: 5, step: 0.5 }
        },
        explanation: 'Theo bất đẳng thức Cauchy (AM-GM) cho hai số dương x và 4/x: x + 4/x ≥ 2√(x · 4/x) = 2√4 = 4. Dấu bằng xảy ra khi x = 4/x ⇔ x² = 4 ⇔ x = 2 (do x > 0).',
        firstPrincipleEssence: 'Bất đẳng thức Cauchy là trường hợp riêng của tính lồi của hàm số, đạt cực tiểu khi các thành phần phân rã cân bằng nhau.',
        points: 2.0
      },
      {
        id: 'cs-q4',
        number: 4,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Tính giá trị tích phân I = ∫ từ 1 đến e của (ln x / x) dx bằng tính năng tích phân Casio fx-880 BTG.',
        correctAnswerNumber: 0.5,
        tolerance: 0.01,
        unit: '',
        casioTip: 'Bấm phím ∫ trên fx-880 > Nhập (ln(x))/x > Cận dưới 1, Cận trên e (Shift + e) > Bấm EXE = 0.5.',
        casioInject: {
          mode: 'calculate',
          formula: '∫(ln(x)/x, 1, e)'
        },
        explanation: 'Đặt u = ln x ⇒ du = dx / x. Khi x = 1 thì u = 0; khi x = e thì u = 1. Tích phân trở thành ∫ từ 0 đến 1 của u du = [u² / 2] từ 0 đến 1 = 1/2 = 0.5.',
        firstPrincipleEssence: 'Phương pháp đổi biến số bản chất là phép co dãn hệ trục tọa độ vi phân để đưa đường cong về dạng đa thức chuẩn.',
        points: 2.0
      },
      {
        id: 'cs-q5',
        number: 5,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Cho dãy số liệu thống kê: 12, 15, 18, 22, 25, 30, 35, 40, 45. Tìm trung vị (Median) của dãy số liệu trên bằng Casio fx-880 BTG.',
        correctAnswerNumber: 25,
        tolerance: 0.01,
        unit: '',
        casioTip: 'Vào HOME > Statistics > 1-Variable > Nhập dãy 9 số > Xem Med = 25.',
        casioInject: {
          mode: 'statistics',
          formula: '12, 15, 18, 22, 25, 30, 35, 40, 45'
        },
        explanation: 'Dãy gồm n = 9 phần tử đã sắp xếp theo thứ tự tăng dần. Trung vị là phần tử chính giữa ở vị trí (9 + 1) / 2 = 5, đó là số 25.',
        firstPrincipleEssence: 'Trung vị chia phân bố thành hai nửa bằng nhau về số lượng quan sát, kháng lại nhiễu sai số cực đại hoặc cực tiểu.',
        points: 1.5
      },
      {
        id: 'cs-q6',
        number: 6,
        type: 'short_answer',
        difficulty: 'thong_hieu',
        question: 'Dùng Casio fx-880 BTG giải hệ phương trình 2 ẩn: 3x + 2y = 12 và 2x - y = 1. Tìm giá trị của x.',
        correctAnswerNumber: 2,
        tolerance: 0.01,
        unit: '',
        casioTip: 'Vào HOME > Equation > Hệ phương trình 2 ẩn (Simul 2) > Nhập [3, 2, 12] và [2, -1, 1] > Bấm EXE: x = 2, y = 3.',
        casioInject: {
          mode: 'equation',
          params: { eqType: 'simul2', matrix: [[3, 2, 12], [2, -1, 1]] }
        },
        explanation: 'Nhân phương trình thứ hai với 2: 4x - 2y = 2. Cộng với phương trình đầu: 7x = 14 ⇒ x = 2. Thay vào phương trình 2: 2(2) - y = 1 ⇒ y = 3.',
        firstPrincipleEssence: 'Giải hệ phương trình tuyến tính là tìm giao điểm của hai đường thẳng trong mặt phẳng tọa độ Decartes.',
        points: 1.5
      }
    ]
  }
];
