import { EduDailyPlanItem } from '../../types';

export const DEFAULT_PHYSICS_DAILY_PLAN: EduDailyPlanItem[] = [
  {
    id: 'phys-day-1',
    dayNumber: 1,
    title: 'Khối Lượng Quán Tính & 3 Định Luật Chuyển Động Newton',
    timeEstimateMinutes: 45,
    documentSummary: 'Tài liệu Ngày 1 mổ xẻ bản chất chuyển động: Lực không phải là năng lượng chứa trong vật thể, mà là thước đo mức độ tương tác giữa 2 vật thể. Khối lượng quán tính m quyết định khả năng chống lại sự biến đổi vận tốc (a = F/m). Trọng lượng thay đổi tùy theo vị trí, nhưng khối lượng quán tính là đại lượng bảo toàn bất biến.',
    corePrinciples: [
      'Định luật 1 & 2 Newton: F = m · a (Gia tốc tỷ lệ thuận với lực, nghịch với quán tính).',
      'Định luật 3 Newton: Lực luôn xuất hiện theo từng cặp trực đối, không tồn tại lực đơn lẻ.'
    ],
    actionItems: [
      'Đọc mục Động lực học chất điểm trong tài liệu',
      'Chứng minh tại sao cùng một lực đẩy thì vật nặng 10kg lại tăng tốc chậm gấp đôi vật 5kg',
      'Vẽ sơ đồ phân tích các lực tác dụng lên quả cầu treo dây'
    ],
    practiceLab: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Con Lắc Đơn & Quán Tính',
      mission: 'Quan sát chuyển động của quả cầu và kiểm tra ảnh hưởng của góc lệch ban đầu'
    },
    keyFormulas: ['F = m · a', 'p = m · v'],
    selfReflectionPrompt: 'Nếu bạn đẩy một phi thuyền trong vũ trụ không trọng lực, lực đẩy của bạn có đẩy cả người bạn lùi lại theo Định luật 3 không? Tại sao?',
    quickQuiz: [
      {
        id: 'qq-p-1',
        question: 'Khi không có bất kỳ lực nào tác dụng, một vật đang chuyển động sẽ như thế nào?',
        options: [
          'Dừng lại ngay lập tức',
          'Chuyển động chậm dần đều rồi dừng lại',
          'Tiếp tục chuyển động thẳng đều mãi mãi với vận tốc không đổi',
          'Chuyển động nhanh dần'
        ],
        correctIndex: 2,
        explanation: 'Theo Định luật I Newton (Quán tính), nếu không có hợp lực tác dụng thì vật đứng yên sẽ tiếp tục đứng yên, vật đang chuyển động sẽ tiếp tục chuyển động thẳng đều.',
        firstPrincipleNote: 'Vận tốc là một trạng thái tự nhiên được bảo toàn, chỉ có gia tốc mới cần đến lực.'
      }
    ]
  },
  {
    id: 'phys-day-2',
    dayNumber: 2,
    title: 'Bản Chất Công Cơ Học & Thế Năng Trọng Trường',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 2 tập trung vào bản chất công cơ học A = F·s·cosα và thế năng hấp dẫn Ep = mgh. Trọng lực là lực thế: công thực hiện chỉ phụ thuộc vào vị trí điểm đầu và điểm cuối chứ không phụ thuộc vào hình dạng đường đi ngoằn ngoèo. Khi nâng vật lên cao, công tiêu tốn đã được nạp tích lũy thành thế năng hấp dẫn.',
    corePrinciples: [
      'Công là thước đo sự chuyển hóa năng lượng giữa các dạng vật chất.',
      'Thế năng trọng trường Ep = m·g·h tỷ lệ thuận với độ cao hình học trong trường trọng lực.'
    ],
    actionItems: [
      'Đọc phần Công cơ học và Năng lượng trong tài liệu',
      'Tính toán công của trọng lực khi con lắc rơi từ góc 45 độ xuống đáy',
      'Ghi lại định nghĩa Lực thế vào sổ tay nghiên cứu'
    ],
    practiceLab: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Đo Thế Năng Trọng Trường Cực Đại',
      mission: 'Kéo con lắc lên góc 30° và 60°, ghi nhận sự biến thiên của thế năng Ep'
    },
    keyFormulas: ['A = F · s · cos(α)', 'Ep = m · g · h'],
    selfReflectionPrompt: 'Tại sao khi mang một hòn đá lên đỉnh núi rồi lại mang về chỗ cũ, tổng công của trọng lực thực hiện lại bằng đúng 0?'
  },
  {
    id: 'phys-day-3',
    dayNumber: 3,
    title: 'Định Luật Bảo Toàn Cơ Năng: Thế Năng & Động Năng',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 3 giải mã định luật bất biến của vũ trụ: Cơ năng toàn phần E = Ep + Ek = const. Khi con lắc lao từ vị trí biên về vị trí cân bằng, thế năng chuyển hóa thành động năng với hiệu suất 100% trong điều kiện lý tưởng. Tại điểm thấp nhất, vận tốc đạt cực đại (v = √(2gh)) và thế năng bằng 0.',
    corePrinciples: [
      'Năng lượng không tự sinh ra hay mất đi, chỉ luân chuyển giữa các dạng thể.',
      'Vận tốc cực đại tại đáy chỉ phụ thuộc độ cao h, hoàn toàn không phụ thuộc khối lượng m.'
    ],
    actionItems: [
      'Thiết lập phương trình bảo toàn cơ năng: mgh = 1/2 mv²',
      'Rút gọn triệt tiêu m ở hai vế để chứng minh v_max = √(2gh)',
      'Thực hiện bài mô phỏng con lắc đo vận tốc ở đáy'
    ],
    practiceLab: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Mô Phỏng Chuyển Hóa Cơ Năng',
      mission: 'Quan sát đồ thị chuyển hóa qua lại giữa thanh Động năng (Ek) và Thế năng (Ep)'
    },
    keyFormulas: ['E = Ep + Ek = const', 'v_max = √(2 · g · h)'],
    selfReflectionPrompt: 'Nếu thả con lắc từ độ cao 1m, liệu nó có thể dao động vọt lên độ cao 1.1m ở phía đối diện không? Tại sao điều này vi phạm nguyên lý nhiệt động học?'
  },
  {
    id: 'phys-day-4',
    dayNumber: 4,
    title: 'Dao Động Điều Hòa & Nghịch Lý Chu Kỳ Con Lắc Đơn',
    timeEstimateMinutes: 45,
    documentSummary: 'Ngày 4 làm sáng tỏ nghịch lý nổi tiếng của Galileo: Chu kỳ dao động của con lắc đơn T = 2π√(L/g) không hề phụ thuộc vào khối lượng quả nặng. Dù quả cầu nặng 100g hay 100kg, chúng dao động đồng pha với cùng một tần số nếu có cùng chiều dài dây L.',
    corePrinciples: [
      'Khối lượng quán tính và khối lượng hấp dẫn triệt tiêu nhau hoàn toàn trong phương trình dao động.',
      'Góc lệch nhỏ (< 10 độ) đảm bảo sin(α) ≈ α, đưa hệ về dao động điều hòa tuyến tính.'
    ],
    actionItems: [
      'Đọc chương Dao động điều hòa và con lắc đơn',
      'Đo đạc chu kỳ T với các chiều dài dây L = 0.5m, 1.0m, 2.0m',
      'Giải thích hiện tượng triệt tiêu khối lượng cho bạn học cùng nhóm'
    ],
    practiceLab: {
      subject: 'physics',
      experimentId: 'pendulum',
      experimentName: 'Thí Nghiệm Triệt Tiêu Khối Lượng',
      mission: 'Thay đổi khối lượng quả nặng từ 0.5kg lên 5.0kg và bấm đồng hồ đo chu kỳ T'
    },
    keyFormulas: ['T = 2π · √(L / g)', 'f = 1 / T'],
    selfReflectionPrompt: 'Tại sao khi mang đồng hồ quả lắc lên trạm vũ trụ không trọng lực ISS, đồng hồ lại ngừng chạy hoàn toàn?'
  },
  {
    id: 'phys-day-5',
    dayNumber: 5,
    title: 'Chuyển Động Ném Xiên & Tối Ưu Hóa Góc 45°',
    timeEstimateMinutes: 55,
    documentSummary: 'Ngày 5 áp dụng phương pháp phân rã chuyển động độc lập: Trục Ox chuyển động thẳng đều với vận tốc không đổi vx = v0·cosα; Trục Oy chuyển động biến đổi đều chịu gia tốc rơi tự do vy = v0·sinα - gt. Tích của sin(α) và cos(α) đạt giá trị cực đại khi và chỉ khi α = 45°.',
    corePrinciples: [
      'Nguyên lý độc lập của các thành phần chuyển động vuông góc.',
      'Góc 45 độ cân bằng tối ưu giữa thời gian bay trên không và vận tốc tịnh tiến phương ngang.'
    ],
    actionItems: [
      'Thiết lập phương trình quỹ đạo parabol y(x)',
      'Chứng minh công thức tầm xa L = (v0² · sin 2α) / g',
      'Tổng kết toàn bộ 5 ngày học vào Sổ tay nghiên cứu'
    ],
    practiceLab: {
      subject: 'physics',
      experimentId: 'projectile',
      experimentName: 'Mô Phỏng Quỹ Đạo Ném Xiên',
      mission: 'Thử nghiệm bắn ở các góc 30°, 45°, 60° với cùng vận tốc ban đầu v0'
    },
    keyFormulas: ['L = (v₀² · sin 2α) / g', 'H_max = (v₀² · sin² α) / 2g'],
    selfReflectionPrompt: 'Trong thực tế có lực cản không khí, góc ném tối ưu cho tầm xa nhất sẽ lớn hơn hay nhỏ hơn 45 độ? Tại sao?'
  }
];

export const DEFAULT_CHEMISTRY_DAILY_PLAN: EduDailyPlanItem[] = [
  {
    id: 'chem-day-1',
    dayNumber: 1,
    title: 'Bản Chất Thang Đo pH & Nồng Độ Ion H⁺ Trong Dung Dịch',
    timeEstimateMinutes: 45,
    documentSummary: 'Ngày 1 phân tích cội nguồn của khái niệm pH: pH = -log[H⁺] là một thang đo logarit thập phân phản ánh hoạt độ của proton tự do. Mỗi một đơn vị pH giảm đi tương ứng với nồng độ H⁺ tăng vọt gấp 10 lần. Nước tinh khiết tự ion hóa ở 25°C sinh ra tích số ion Kw = [H⁺][OH⁻] = 10⁻¹⁴, thiết lập mức trung hòa pH = 7.',
    corePrinciples: [
      'Thang đo pH có tính phi tuyến tính (logarit thập phân).',
      'Tích số ion của nước Kw = 10⁻¹⁴ là hằng số nhiệt động học không đổi ở nhiệt độ xác định.'
    ],
    actionItems: [
      'Đọc phần Sự điện ly và Thang đo pH trong giáo trình',
      'Tính toán nồng độ H⁺ của dung dịch giấm ăn (pH = 3) so với nước cất (pH = 7)',
      'Lập bảng so sánh độ đậm đặc của ion H⁺ theo từng nấc thang pH'
    ],
    practiceLab: {
      subject: 'chemistry',
      experimentId: 'titration',
      experimentName: 'Đo Thang pH & Điện Ly',
      mission: 'Sử dụng máy đo pH điện tử thử nghiệm các mẫu dung dịch axit và bazơ'
    },
    keyFormulas: ['pH = -log₁₀[H⁺]', 'Kw = [H⁺] · [OH⁻] = 10⁻¹⁴'],
    selfReflectionPrompt: 'Dung dịch pH = 1 có tính axit gấp bao nhiêu lần dung dịch pH = 4? Hãy giải thích theo cơ chế số lượng phân tử ion.'
  },
  {
    id: 'chem-day-2',
    dayNumber: 2,
    title: 'Phản Ứng Trung Hòa: H⁺ + OH⁻ → H₂O & Cơ Chế Chỉ Thị Màu',
    timeEstimateMinutes: 45,
    documentSummary: 'Ngày 2 giải mã thực chất của phản ứng trung hòa: Về bản chất ion thu gọn, toàn bộ phản ứng giữa axit mạnh và bazơ mạnh chỉ là sự kết hợp giữa ion hiđrô H⁺ và hiđroxit OH⁻ tạo thành phân tử nước H₂O bền vững. Các chất chỉ thị màu như Phenolphthalein hay Quỳ tím thay đổi cấu trúc phân tử khi mất hoặc nhận proton, qua đó biến đổi màu sắc quang học.',
    corePrinciples: [
      'Phản ứng trung hòa giải phóng nhiệt enthalpy do sự hình thành liên kết cộng hóa trị của H₂O.',
      'Chỉ thị màu là các axit/bazơ hữu cơ yếu có dạng axit và dạng bazơ khác màu nhau.'
    ],
    actionItems: [
      'Viết phương trình phân tử và phương trình ion rút gọn của HCl + NaOH',
      'Đọc tài liệu về khoảng đổi màu của chất chỉ thị Phenolphthalein (8.2 - 10.0)',
      'Giải thích tại sao muối ăn NaCl sinh ra lại có môi trường trung tính'
    ],
    practiceLab: {
      subject: 'chemistry',
      experimentId: 'titration',
      experimentName: 'Thí Nghiệm Trung Hòa & Chỉ Thị Màu',
      mission: 'Thêm chất chỉ thị phenolphthalein vào dung dịch HCl và quan sát biến thiên màu khi nhỏ NaOH'
    },
    keyFormulas: ['H⁺ + OH⁻ → H₂O', 'ΔH = -57.3 kJ/mol'],
    selfReflectionPrompt: 'Tại sao tại điểm tương đương, dung dịch trung hòa giữa axit mạnh và bazơ mạnh lại không còn tính dẫn điện của H⁺ hay OH⁻?'
  },
  {
    id: 'chem-day-3',
    dayNumber: 3,
    title: 'Kỹ Thuật Chuẩn Độ Dung Dịch & Hiện Tượng Bước Nhảy pH',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 3 tìm hiểu kỹ thuật định lượng nồng độ chuẩn xác nhất trong hóa phân tích: Phương pháp chuẩn độ thể tích buret (C1·V1 = C2·V2). Tại điểm tương đương, toàn bộ H⁺ vừa đủ phản ứng hết với OH⁻. Chỉ cần vượt thêm 0.05 ml NaOH (nửa giọt), pH sẽ nhảy vọt từ 4.5 lên 9.5 do nồng độ H⁺ đã cạn kiệt đến mức siêu vi (10⁻⁷ M).',
    corePrinciples: [
      'Định luật đương lượng nồng độ: n_H⁺ = n_OH⁻ tại điểm tương đương.',
      'Bước nhảy pH xảy ra vì trục pH đo theo thang logarit, cực kỳ nhạy cảm khi nồng độ tiến về 0.'
    ],
    actionItems: [
      'Đọc hướng dẫn hiệu chuẩn buret và bình tam giác',
      'Vẽ đường cong chuẩn độ pH theo thể tích dung dịch chuẩn NaOH thêm vào',
      'Tính nồng độ dung dịch HCl chưa biết nồng độ từ thể tích chuẩn độ'
    ],
    practiceLab: {
      subject: 'chemistry',
      experimentId: 'titration',
      experimentName: 'Chuẩn Độ Axit - Bazơ Ảo',
      mission: 'Điều chỉnh van buret nhỏ từng giọt NaOH và dừng lại ngay khi dung dịch xuất hiện màu hồng nhạt bền vững'
    },
    keyFormulas: ['C_A · V_A = C_B · V_B'],
    selfReflectionPrompt: 'Nếu chọn một chất chỉ thị đổi màu ở pH = 4 thay vì pH = 8.2 khi chuẩn độ axit yếu bằng bazơ mạnh, kết quả đo nồng độ sẽ bị sai số thừa hay thiếu? Tại sao?'
  },
  {
    id: 'chem-day-4',
    dayNumber: 4,
    title: 'Phản Ứng Trao Đổi Ion Trong Dung Dịch: Bản Chất Tạo Kết Tủa',
    timeEstimateMinutes: 45,
    documentSummary: 'Ngày 4 khảo sát điều kiện xảy ra phản ứng trao đổi ion: Các ion hòa tan trong dung dịch luôn chuyển động nhiệt hỗn loạn. Chúng chỉ phản ứng với nhau nếu sản phẩm tạo thành làm giảm nồng độ ion tự do (tạo chất kết tủa không tan, khí bay hơi, hoặc chất điện ly yếu). Nếu các ion sinh ra đều tan và phân ly hoàn toàn, thực chất không có phản ứng hóa học nào xảy ra.',
    corePrinciples: [
      'Điều kiện phản ứng trao đổi ion: Phải có ít nhất một sản phẩm tách ra khỏi dung dịch.',
      'Tích số tan Ks quyết định ranh giới giữa dung dịch chưa bão hòa và kết tủa tách lớp.'
    ],
    actionItems: [
      'Tra cứu bảng tính tan của các muối vô cơ',
      'Viết phương trình ion rút gọn của BaCl2 + Na2SO4 và AgNO3 + NaCl',
      'Giải thích tại sao trộn NaCl với KNO3 lại không có phản ứng xảy ra'
    ],
    practiceLab: {
      subject: 'chemistry',
      experimentId: 'reactions',
      experimentName: 'Bàn Trộn Phản Ứng Ống Nghiệm',
      mission: 'Trộn BaCl2 và Na2SO4 trong ống nghiệm ảo để quan sát kết tủa trắng BaSO4'
    },
    keyFormulas: ['Ba²⁺ + SO₄²⁻ → BaSO₄↓', 'Ks = [Ba²⁺] · [SO₄²⁻]'],
    selfReflectionPrompt: 'Tại sao kết tủa BaSO4 lại không tan trong axit mạnh như HCl, trong khi kết tủa CaCO3 lại tan sủi bọt khí?'
  },
  {
    id: 'chem-day-5',
    dayNumber: 5,
    title: 'Phản Ứng Sinh Khí & Ứng Dụng Tổng Hợp First Principles',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 5 hoàn thiện bức tranh hóa học vô cơ: Phản ứng giữa kim loại đứng trước hiđrô với axit giải phóng khí H2 (Fe + 2H⁺ → Fe²⁺ + H2↑), và phản ứng phân hủy muối cacbonat tạo khí CO2 (CaCO3 + 2H⁺ → Ca²⁺ + CO2↑ + H2O). Tổng kết hệ thống hóa toàn bộ các nguyên lý bảo toàn điện tích và bảo toàn khối lượng.',
    corePrinciples: [
      'Định luật bảo toàn điện tích: Tổng điện tích dương luôn bằng tổng điện tích âm trong dung dịch.',
      'Khí bay ra kéo theo sự dịch chuyển cân bằng theo nguyên lý Le Chatelier.'
    ],
    actionItems: [
      'Viết các phản ứng sinh khí H2 và CO2 trong giáo trình',
      'Tính thể tích khí thoát ra ở điều kiện tiêu chuẩn (V = n · 24.79)',
      'Tổng kết sổ tay 5 ngày học Hóa Học First Principles'
    ],
    practiceLab: {
      subject: 'chemistry',
      experimentId: 'reactions',
      experimentName: 'Phản Ứng Tạo Bọt Khí Sôi',
      mission: 'Thả kim loại Kẽm hoặc Sắt vào dung dịch axit HCl và thu khí'
    },
    keyFormulas: ['Zn + 2H⁺ → Zn²⁺ + H₂↑', 'CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O'],
    selfReflectionPrompt: 'Tại sao phản ứng sinh khí lại diễn ra một chiều triệt để mà không bị giới hạn bởi cân bằng hóa học thuận nghịch?'
  }
];

export const DEFAULT_BIOLOGY_DAILY_PLAN: EduDailyPlanItem[] = [
  {
    id: 'bio-day-1',
    dayNumber: 1,
    title: 'Tế Bào - Đơn Vị Cơ Bản Của Sự Sống & Màng Bán Thấm',
    timeEstimateMinutes: 45,
    documentSummary: 'Ngày 1 khảo sát nền tảng sinh học: Mọi sinh vật sống từ vi khuẩn đến con người đều cấu tạo từ tế bào. Màng tế bào là một lớp kép phospholipid bán thấm, kiểm soát dòng vật chất và ion đi vào và ra bằng cơ chế thẩm thấu và vận chuyển chủ động tiêu tốn ATP.',
    corePrinciples: [
      'Học thuyết tế bào: Tế bào chỉ sinh ra từ tế bào có trước.',
      'Cơ chế thẩm thấu: Nước di chuyển từ nơi có thế nước cao (nồng độ chất tan thấp) sang nơi thế nước thấp.'
    ],
    actionItems: [
      'Đọc chương Cấu trúc tế bào và màng sinh chất',
      'Vẽ sơ đồ màng kép phospholipid và các kênh protein xuyên màng',
      'Giải thích hiện tượng tế bào hồng cầu bị vỡ khi thả vào nước cất'
    ],
    practiceLab: {
      subject: 'biology',
      experimentId: 'cell_division',
      experimentName: 'Quan Sát Cấu Trúc Tế Bào',
      mission: 'Phóng đại tế bào thực vật và động vật dưới kính hiển vi ảo'
    },
    keyFormulas: ['Ψ = Ψs + Ψp (Thế nước)'],
    selfReflectionPrompt: 'Nếu màng tế bào không có tính chọn lọc mà cho phép mọi chất tự do đi qua, sự sống có thể duy trì được nội môi ổn định không?'
  },
  {
    id: 'bio-day-2',
    dayNumber: 2,
    title: 'Cấu Trúc Phân Tử DNA & Nguyên Tắc Bổ Sung Watson-Crick',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 2 khám phá bản chất vật lý của thông tin di truyền: Phân tử DNA là chuỗi xoắn kép gồm 2 mạch đơn polynucleotide chạy đối song song (5\'-3\' và 3\'-5\'). Bốn loại bazơ nitơ ghép cặp theo nguyên tắc bổ sung tuyệt đối: Adenine liên kết với Thymine bằng 2 liên kết Hydro (A=T), Guanine liên kết với Cytosine bằng 3 liên kết Hydro (G≡C).',
    corePrinciples: [
      'Nguyên tắc bổ sung đảm bảo thông tin di truyền được bảo toàn khi nhân đôi bán bảo toàn.',
      'Liên kết hydro yếu cho phép tách mạch dễ dàng trong quá trình phiên mã và sao chép.'
    ],
    actionItems: [
      'Đọc chương Axit Nuclêic và mã di truyền',
      'Tính tỉ lệ phần trăm các loại nuclêôtit khi biết %A = 20%',
      'Xác định số liên kết hiđrô của một đoạn gen dài 5100 Å'
    ],
    practiceLab: {
      subject: 'biology',
      experimentId: 'dna_synthesis',
      experimentName: 'Mô Phỏng Tổng Hợp Chuỗi Xoắn Kép DNA',
      mission: 'Ghép cặp các nucleotide tự do A, T, G, C vào mạch khuôn theo đúng nguyên tắc bổ sung'
    },
    keyFormulas: ['%A = %T; %G = %C', 'H = 2A + 3G'],
    selfReflectionPrompt: 'Tại sao tự nhiên lại chọn liên kết Hydro yếu thay vì liên kết cộng hóa trị bền vững để nối 2 mạch đơn của phân tử DNA?'
  },
  {
    id: 'bio-day-3',
    dayNumber: 3,
    title: 'Phiên Mã, Dịch Mã & Dòng Chảy Thông Tin Trung Tâm (Central Dogma)',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 3 tìm hiểu cơ chế biểu hiện thông tin: DNA → mRNA → Protein → Tính trạng. Quá trình phiên mã sao chép gen thành phân tử mRNA truyền tin. Ribosome sau đó đọc các bộ ba mã di truyền (codon) trên mRNA để tổng hợp chuỗi polypeptide tương ứng, tạo nên các protein enzyme điều hành toàn bộ cơ thể sống.',
    corePrinciples: [
      'Central Dogma: Chiều truyền thông tin từ vật chất di truyền sang cấu trúc chức năng protein.',
      'Tính thoái hóa của mã di truyền: Nhiều bộ ba cùng mã hóa cho một loại axit amin, tăng khả năng chống chịu đột biến.'
    ],
    actionItems: [
      'Tra bảng 64 mã di truyền tìm codon khởi đầu AUG và codon kết thúc',
      'Mô phỏng quá trình dịch mã từ một đoạn gen mẫu',
      'Phân tích hậu quả nếu xảy ra đột biến thay thế nucleotide ở vị trí thứ 3 của bộ ba'
    ],
    practiceLab: {
      subject: 'biology',
      experimentId: 'dna_synthesis',
      experimentName: 'Dịch Mã Protein Trên Ribosome',
      mission: 'Đọc chuỗi mRNA và gắn kết tRNA mang axit amin tương ứng'
    },
    keyFormulas: ['N_aa = (N_nucleotide / 6) - 1'],
    selfReflectionPrompt: 'Tại sao một đột biến thay thế nucleotide đơn lẻ ở gen hemoglobin lại có thể biến đổi hình dạng hồng cầu thành hình liềm?'
  },
  {
    id: 'bio-day-4',
    dayNumber: 4,
    title: 'Quy Luật Di Truyền Men-đen: Bản Chất Alen & Phân Ly Độc Lập',
    timeEstimateMinutes: 50,
    documentSummary: 'Ngày 4 giải mã phát kiến vĩ đại của Gregor Mendel: Tính trạng di truyền không bị hòa tan nhạt nhòa như trộn hai giọt sơn. Thay vào đó, mỗi tính trạng do một cặp nhân tố di truyền (Alen) quy định. Khi giảm phân hình thành giao tử, các alen trong cặp phân ly đồng đều về từng giao tử với xác suất 50-50.',
    corePrinciples: [
      'Alen là các trạng thái biến dị khác nhau của cùng một gen.',
      'Sự phân ly độc lập của các cặp nhiễm sắc thể tương đồng trong kỳ sau giảm phân 1 tạo nên tính đa dạng di truyền.'
    ],
    actionItems: [
      'Vẽ khung Punnett cho phép lai dị hợp tử Aa x Aa',
      'Chứng minh tỉ lệ kiểu hình 3:1 ở F2 thực chất là tỉ lệ kiểu gen 1 AA : 2 Aa : 1 aa',
      'Thực hiện thí nghiệm lai đậu Hà Lan trên mô phỏng'
    ],
    practiceLab: {
      subject: 'biology',
      experimentId: 'mendel_genetics',
      experimentName: 'Phòng Thí Nghiệm Lai Di Truyền Men-đen',
      mission: 'Lai hai giống đậu hoa đỏ và hoa trắng, thống kê số lượng hạt thu được ở thế hệ F2'
    },
    keyFormulas: ['Tỉ lệ F2: 1/4 AA : 2/4 Aa : 1/4 aa', 'Kiểu hình: 3 Trội : 1 Lặn'],
    selfReflectionPrompt: 'Tại sao Men-đen lại kiên trì đếm hàng nghìn hạt đậu để tìm ra tỉ lệ toán học, thay vì chỉ quan sát định tính như các nhà tự nhiên học thời đó?'
  },
  {
    id: 'bio-day-5',
    dayNumber: 5,
    title: 'Phân Bào Giảm Phân, Đột Biến & Tiến Hóa First Principles',
    timeEstimateMinutes: 55,
    documentSummary: 'Ngày 5 đúc kết chu trình tiến hóa: Quá trình giảm phân tạo giao tử kết hợp với thụ tinh ngẫu nhiên tạo ra vô số biến dị tổ hợp. Đột biến gen là nguồn nguyên liệu sơ cấp, trong khi Chọn lọc Tự nhiên đóng vai trò sàng lọc những biến dị có lợi thích nghi với môi trường sống.',
    corePrinciples: [
      'Tiến hóa là sự thay đổi tần số alen của quần thể qua các thế hệ.',
      'Chọn lọc tự nhiên không tạo ra biến dị mới mà chỉ giữ lại các cá thể có độ thích nghi cao hơn.'
    ],
    actionItems: [
      'So sánh điểm khác biệt bản chất giữa nguyên phân và giảm phân',
      'Vẽ sơ đồ trao đổi chéo (Crossing-over) giữa hai cromatit khác nguồn',
      'Viết bài thu hoạch 5 ngày học Sinh Học First Principles'
    ],
    practiceLab: {
      subject: 'biology',
      experimentId: 'cell_division',
      experimentName: 'Mô Phỏng Phân Bào Giảm Phân',
      mission: 'Quan sát sự tiếp hợp và trao đổi chéo ở kỳ đầu của Giảm phân I'
    },
    keyFormulas: ['Số loại giao tử tối đa = 2ⁿ (n là số cặp NST dị hợp)'],
    selfReflectionPrompt: 'Nếu sinh sản vô tính sao chép nguyên vẹn 100% gen mẹ giúp tiết kiệm năng lượng, tại sao các sinh vật phức tạp lại tiến hóa sang sinh sản hữu tính tốn kém hơn?'
  }
];
