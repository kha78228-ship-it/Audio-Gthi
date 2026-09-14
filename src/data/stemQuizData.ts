import { StemModuleQuiz } from '../types';

export const STEM_MODULE_QUIZZES: StemModuleQuiz[] = [
  // --- VẬT LÝ (PHYSICS) ---
  {
    moduleId: 'physics-pendulum',
    moduleTitle: 'Con Lắc Đơn & Bảo Toàn Cơ Năng',
    subject: 'physics',
    experimentId: 'pendulum',
    badge: '⏱️ Vật Lý Cơ Học',
    description: 'Bóc tách sự độc lập của chu kỳ với khối lượng và chuyển hóa qua lại giữa thế năng - động năng.',
    questions: [
      {
        id: 'pen-1',
        question: 'Tại sao khi tăng khối lượng quả nặng của con lắc đơn lên gấp 4 lần (giữ nguyên chiều dài L và góc thả), chu kỳ dao động T lại KHÔNG đổi?',
        options: [
          'Vì lực cản không khí tỷ lệ nghịch với khối lượng quả nặng.',
          'Vì trọng lực kéo về tỷ lệ thuận với m (F=mg·sinθ), nhưng quán tính chống gia tốc cũng tỷ lệ với m (a=F/m). Khối lượng m ở tử và mẫu triệt tiêu nhau hoàn toàn.',
          'Vì năng lượng của con lắc không phụ thuộc vào trọng trường của Trái Đất.',
          'Vì dây treo con lắc hấp thụ toàn bộ lực quán tính của quả nặng.'
        ],
        correctIndex: 1,
        explanation: 'Theo định luật 2 Newton: F = m·a, với thành phần tiếp tuyến lực hồi phục F = -m·g·sinθ. Suy ra gia tốc a = -g·sinθ hoàn toàn không chứa m. Hai quả cầu nặng 10g và 10kg đều rơi tự do và dao động với cùng gia tốc.',
        firstPrincipleNote: 'Nguyên lý tương đương: Khối lượng hấp dẫn (tạo ra trọng lực) bằng chính xác khối lượng quán tính (kháng lại sự đổi vận tốc).'
      },
      {
        id: 'pen-2',
        question: 'Khi con lắc dao động qua vị trí cân bằng (thấp nhất), nhận định nào sau đây là chính xác nhất theo nguyên lý bảo toàn?',
        options: [
          'Động năng đạt cực đại, thế năng đạt cực tiểu, gia tốc tiếp tuyến bằng 0 nhưng gia tốc hướng tâm đạt cực đại.',
          'Cả động năng và thế năng đều bằng 0 vì lực hồi phục bị triệt tiêu.',
          'Gia tốc toàn phần của vật bằng 0 vì quả nặng không chịu tác dụng của lực nào.',
          'Vận tốc bằng 0 vì con lắc chuẩn bị đảo chiều chuyển động.'
        ],
        correctIndex: 0,
        explanation: 'Tại vị trí cân bằng, thế năng chuyển hóa hết thành động năng (v_max). Do vật đang chuyển động cong nên có gia tốc hướng tâm a_ht = v²/L > 0, do đó lực căng dây T = mg + m(v²/L) lớn hơn trọng lực P.',
        firstPrincipleNote: 'Định luật bảo toàn cơ năng E = Ek + Ep = const. Năng lượng chỉ biến đổi hình thức chứ không hề mất đi.'
      },
      {
        id: 'pen-3',
        question: 'Nếu đem con lắc đơn lên một hành tinh có gia tốc trọng trường g_planet = 4·g_earth, chu kỳ dao động T sẽ:',
        options: [
          'Tăng lên 4 lần (dao động chậm hơn)',
          'Tăng lên 2 lần',
          'Giảm đi 2 lần (dao động nhanh gấp đôi)',
          'Giảm đi 4 lần'
        ],
        correctIndex: 2,
        explanation: 'Chu kỳ T = 2π√(L/g). Khi g tăng 4 lần thì mẫu số căn bậc hai tăng 2 lần, làm cho chu kỳ T giảm đi 1/2. Con lắc sẽ dao động nhanh gấp đôi.',
        firstPrincipleNote: 'Gia tốc trọng trường g càng lớn, lực kéo quả lắc về vị trí cân bằng càng mạnh, khiến vật đổi chiều và tăng tốc nhanh hơn.'
      }
    ]
  },
  {
    moduleId: 'physics-circuits',
    moduleTitle: 'Mạch Điện Thông Minh & Định Luật Ohm',
    subject: 'physics',
    experimentId: 'circuits',
    badge: '⚡ Mạch Điện & Dòng Điện',
    description: 'Bản chất sự dịch chuyển có hướng của electron, điện thế U và sự phân chia dòng điện.',
    questions: [
      {
        id: 'cir-1',
        question: 'Bản chất vật lý thực sự của "Hiệu điện thế U" (Voltage) giữa hai đầu đoạn mạch là gì?',
        options: [
          'Là số lượng electron chạy qua tiết diện dây dẫn trong một giây.',
          'Là công cần thiết để di chuyển một đơn vị điện tích từ điểm này đến điểm kia (mức chênh lệch thế năng điện trường).',
          'Là vận tốc di chuyển tức thời của các hạt mang điện bên trong kim loại.',
          'Là sức cản trở của mạng tinh thể đối với các electron tự do.'
        ],
        correctIndex: 1,
        explanation: 'Hiệu điện thế U = A/q (Volt = Joule/Coulomb). Nó đo mức độ chênh lệch thế năng tĩnh điện thúc đẩy các electron dịch chuyển, giống như độ dốc độ cao trong dòng nước chảy.',
        firstPrincipleNote: 'Không có chênh lệch thế năng (U = 0), các hạt mang điện chỉ chuyển động hỗn loạn nhiệt mà không tạo thành dòng điện định hướng.'
      },
      {
        id: 'cir-2',
        question: 'Khi mắc thêm một điện trở song song vào mạch điện, tại sao điện trở tương đương của toàn mạch lại GIẢM đi?',
        options: [
          'Vì mắc song song mở thêm một "làn đường" dẫn mới, giúp tổng số hạt electron qua nguồn trong 1 giây tăng lên với cùng hiệu điện thế.',
          'Vì các điện trở hấp thụ năng lượng của nhau làm giảm nhiệt trở.',
          'Vì dòng điện bị nghẽn lại ở nút phân nhánh.',
          'Vì hiệu điện thế rơi trên mỗi điện trở bị giảm đi một nửa.'
        ],
        correctIndex: 0,
        explanation: 'Công thức 1/R_td = 1/R1 + 1/R2. Thêm một nhánh song song tương tự như việc mở thêm một làn đường cao tốc song song: lưu lượng xe (dòng điện I) tăng lên đối với cùng một áp lực đẩy U, nghĩa là độ cản trở tương đương R giảm.',
        firstPrincipleNote: 'Định luật bảo toàn điện tích tại nút mạng (Kirchhoff 1): Tổng dòng vào bằng tổng dòng ra I_total = I1 + I2.'
      }
    ]
  },
  {
    moduleId: 'physics-optics',
    moduleTitle: 'Khúc Xạ Ánh Sáng & Định Luật Snell',
    subject: 'physics',
    experimentId: 'optics',
    badge: '🌈 Quang Hình Học',
    description: 'Nguyên lý thời gian ngắn nhất Fermat, tốc độ ánh sáng thay đổi và hiện tượng phản xạ toàn phần.',
    questions: [
      {
        id: 'opt-1',
        question: 'Tại sao tia sáng lại bị bẻ cong (khúc xạ) khi truyền từ không khí sang thủy tinh?',
        options: [
          'Vì hạt photon bị khối lượng thủy tinh hút về phía pháp tuyến.',
          'Vì tốc độ truyền của ánh sáng trong thủy tinh chậm hơn trong không khí (v = c/n), và theo nguyên lý Fermat, ánh sáng đi theo con đường tốn ít thời gian nhất.',
          'Vì nhiệt độ của thủy tinh làm thay đổi bước sóng ánh sáng.',
          'Vì thủy tinh hấp thụ toàn bộ sóng ngang của ánh sáng.'
        ],
        correctIndex: 1,
        explanation: 'Định luật khúc xạ n1·sin(i) = n2·sin(r) thực chất bắt nguồn từ Nguyên lý Thời gian Cực tiểu Fermat. Giống như một nhân viên cứu hộ chạy trên cát nhanh hơn bơi dưới nước, đường đi tốn ít thời gian nhất không phải là đường thẳng mà là đường gấp khúc gập về phía môi trường đi chậm.',
        firstPrincipleNote: 'Chiết suất n của một môi trường phản ánh mức độ giảm tốc độ của sóng điện từ trong môi trường đó (n = c/v).'
      },
      {
        id: 'opt-2',
        question: 'Điều kiện ắt có và đủ để xảy ra hiện tượng "Phản xạ toàn phần" (ứng dụng trong cáp quang viễn thông) là gì?',
        options: [
          'Ánh sáng truyền từ môi trường chiết quang kém sang môi trường chiết quang hơn với góc tới bất kỳ.',
          'Ánh sáng phải truyền từ môi trường chiết quang hơn sang môi trường chiết quang kém (n1 > n2) và góc tới i ≥ i_gh (với sin i_gh = n2/n1).',
          'Môi trường phải được bọc gương phản xạ bạc ở mọi góc cạnh.',
          'Góc khúc xạ phải đạt giá trị chính xác bằng 45 độ.'
        ],
        correctIndex: 1,
        explanation: 'Khi truyền từ môi trường chiết quang hơn sang kém hơn (n1 > n2), góc khúc xạ r luôn lớn hơn góc tới i. Khi i tăng đến giá trị giới hạn i_gh, r đạt 90°. Nếu tiếp tục tăng i, tia khúc xạ không thể thoát ra môi trường thứ hai mà phản xạ 100% ngược trở lại.',
        firstPrincipleNote: 'Không một tia sáng nào bị khúc xạ ra ngoài, 100% năng lượng photon được giam giữ và truyền đi hàng nghìn km trong sợi cáp quang.'
      }
    ]
  },
  {
    moduleId: 'physics-projectile',
    moduleTitle: 'Chuyển Động Ném Ngang & Ném Xiên',
    subject: 'physics',
    experimentId: 'projectile',
    badge: '🚀 Động Học 2D',
    description: 'Sự độc lập giữa chuyển động thẳng đều phương ngang và rơi tự do phương thẳng đứng.',
    questions: [
      {
        id: 'proj-1',
        question: 'Thả một viên bi rơi tự do và đồng thời bắn một viên bi khác theo phương ngang ở cùng một độ cao ban đầu h (bỏ qua lực cản không khí). Viên bi nào chạm đất trước?',
        options: [
          'Viên bi bắn theo phương ngang chạm đất trước vì có vận tốc ban đầu lớn hơn.',
          'Viên bi rơi tự do chạm đất trước vì quãng đường chuyển động của nó ngắn hơn.',
          'Cả hai viên bi chạm đất CHÍNH XÁC CÙNG MỘT LÚC.',
          'Tùy thuộc vào khối lượng của hai viên bi.'
        ],
        correctIndex: 2,
        explanation: 'Hai chuyển động theo phương Ox và Oy hoàn toàn độc lập với nhau. Theo phương thẳng đứng Oy, cả hai viên bi đều chỉ chịu duy nhất gia tốc trọng trường g và có vận tốc đầu v0y = 0. Do đó thời gian rơi t = √(2h/g) của cả hai là hoàn toàn bằng nhau!',
        firstPrincipleNote: 'Nguyên lý độc lập của các chuyển động thành phần (Galileo Principle of Independence).'
      }
    ]
  },

  // --- HÓA HỌC (CHEMISTRY) ---
  {
    moduleId: 'chemistry-titration',
    moduleTitle: 'Chuẩn Độ Axit - Bazơ & Bước Nhảy pH',
    subject: 'chemistry',
    experimentId: 'titration',
    badge: '⚗️ Dung Dịch & Cân Bằng',
    description: 'Thang đo logarit pH, bản chất phản ứng H⁺ + OH⁻ và bước nhảy vọt quanh điểm tương đương.',
    questions: [
      {
        id: 'tit-1',
        question: 'Tại sao lại xuất hiện "Bước nhảy pH" đột ngột từ pH ~4 vọt lên pH ~10 quanh điểm tương đương (ví dụ 24.9ml đến 25.1ml NaOH) dù ta chỉ nhỏ từng giọt đều đặn?',
        options: [
          'Vì thang đo pH là hàm LOGARIT cơ số 10: pH = -log[H+]. Khi nồng độ H+ còn sót lại cực nhỏ (10⁻⁷ M), chỉ cần 1 giọt OH⁻ dư đã làm nồng độ H+ thay đổi hàng triệu lần.',
          'Vì chất chỉ thị Phenolphthalein làm tăng tốc độ phản ứng hóa học đột ngột.',
          'Vì nhiệt lượng tỏa ra từ phản ứng trung hòa làm sôi dung dịch.',
          'Vì axit HCl và bazơ NaOH lúc này tự động phân hủy thành muối khan.'
        ],
        correctIndex: 0,
        explanation: 'Trước điểm tương đương, nồng độ [H+] cỡ 10⁻³ M (pH 3). Chỉ cần 1 giọt bazơ trung hòa hết lượng H+ còn sót lại, [H+] tụt ngay xuống 10⁻⁷ M (pH 7), rồi dư 1 giọt OH- khiến [H+] tụt xuống 10⁻¹¹ M (pH 11). Do tính chất logarit, sự sụt giảm nồng độ theo cấp số nhân tạo thành bước nhảy thẳng đứng trên đồ thị.',
        firstPrincipleNote: 'pH là thước đo logarit âm của mật độ ion hydronium H3O+. Mỗi bước nhảy 1 đơn vị pH là sự biến thiên gấp 10 lần nồng độ thực tế.'
      },
      {
        id: 'tit-2',
        question: 'Bản chất ion thực sự diễn ra trong cốc phản ứng chuẩn độ HCl bằng NaOH là gì?',
        options: [
          'Ion Na+ liên kết trực tiếp với ion Cl- tạo kết tủa muối ăn.',
          'Chỉ có ion H⁺ kết hợp với ion OH⁻ tạo thành phân tử nước cực kỳ bền H₂O (H⁺ + OH⁻ → H₂O), còn Na⁺ và Cl⁻ là các ion khán giả (spectator ions) trôi nổi tự do.',
          'HCl bị phân hủy thành khí H2 và Cl2 thoát ra ngoài.',
          'Dung dịch chuyển sang thể plasma điện ly mạnh.'
        ],
        correctIndex: 1,
        explanation: 'Phương trình ion rút gọn là H⁺ + OH⁻ → H₂O. Do NaCl tan hoàn toàn và phân ly 100% trong nước, các ion Na⁺ và Cl⁻ hoàn toàn không tham gia biến đổi hóa học, chúng chỉ đóng vai trò ion đối kháng bảo toàn điện tích.',
        firstPrincipleNote: 'Nước lỏng H2O có tích số ion cực nhỏ Kw = 10⁻¹⁴, lực liên kết tạo H2O mạnh mẽ thúc đẩy phản ứng diễn ra gần như hoàn toàn 100%.'
      }
    ]
  },
  {
    moduleId: 'chemistry-reaction',
    moduleTitle: 'Phản Ứng Trao Đổi Ion Trong Dung Dịch',
    subject: 'chemistry',
    experimentId: 'reaction',
    badge: '🧪 Cân Bằng Hóa Học',
    description: 'Điều kiện xảy ra phản ứng trao đổi: tạo kết tủa, chất bay hơi hoặc chất điện ly yếu.',
    questions: [
      {
        id: 'rxn-1',
        question: 'Tại sao khi trộn dung dịch BaCl2 với Na2SO4 lại lập tức xuất hiện kết tủa trắng BaSO4 không tan?',
        options: [
          'Vì năng lượng mạng tinh thể của BaSO4 lớn hơn nhiều năng lượng hydrat hóa của nước đối với hai ion này, khiến tích nồng độ [Ba²⁺][SO₄²⁻] vượt quá tích số tan Ksp.',
          'Vì ion Cl- đẩy ion SO4 2- ra khỏi dung dịch.',
          'Vì dung dịch bị bay hơi hết nước làm kết tinh muối khô.',
          'Vì ion Ba2+ bị oxy hóa lên số oxy hóa cao hơn.'
        ],
        correctIndex: 0,
        explanation: 'Phản ứng xảy ra vì ion Ba²⁺ và SO₄²⁻ hút nhau bằng lực tĩnh điện cực mạnh tạo mạng tinh thể bền vững, không bị các lưỡng cực nước H2O xé tách (Ksp(BaSO4) ≈ 1.1 × 10⁻¹⁰).',
        firstPrincipleNote: 'Quy luật nhiệt động lực học: Phản ứng trao đổi ion tự phát theo chiều giảm năng lượng tự do Gibbs (hướng tạo chất bền hơn: kết tủa, khí hoặc chất ít điện ly).'
      }
    ]
  },
  {
    moduleId: 'chemistry-gas',
    moduleTitle: 'Khí Lý Tưởng & Thuyết Động Học Phân Tử',
    subject: 'chemistry',
    experimentId: 'gas',
    badge: '🎈 Nhiệt & Khí',
    description: 'Phương trình trạng thái PV = nRT và nguồn gốc vi mô của áp suất khí.',
    questions: [
      {
        id: 'gas-1',
        question: 'Dưới góc nhìn vi mô của thuyết động học phân tử, "Áp suất chất khí P" tác dụng lên thành bình được sinh ra từ đâu?',
        options: [
          'Từ lực hút tĩnh điện giữa các phân tử khí với nhau.',
          'Từ vô số va chạm đàn hồi của các phân tử khí chuyển động hỗn loạn không ngừng tác dụng xung lực lên diện tích thành bình.',
          'Từ khối lượng trọng lực của toàn bộ khối khí đè nén xuống đáy.',
          'Từ phản ứng phân hạch của các hạt nguyên tử khí.'
        ],
        correctIndex: 1,
        explanation: 'Mỗi phân tử khí khối lượng m bay với vận tốc v đập vào thành bình và bật ngược lại làm biến thiên động lượng Δp = 2mv. Hàng tỷ tỷ va chạm mỗi giây sinh ra lực trung bình F = dp/dt tác dụng lên diện tích A, tạo nên áp suất P = F/A.',
        firstPrincipleNote: 'Nhiệt độ T là thước đo động năng tịnh tiến trung bình của các phân tử (Ek = 3/2 kT). Khi tăng T, phân tử bay nhanh hơn và va chạm mạnh hơn làm tăng P.'
      }
    ]
  },

  // --- SINH HỌC (BIOLOGY) ---
  {
    moduleId: 'biology-microscope',
    moduleTitle: 'Kính Hiển Vi & Cấu Trúc Tế Bào',
    subject: 'biology',
    experimentId: 'microscope',
    badge: '🔬 Tế Bào Học',
    description: 'Sự khác biệt bản chất giữa thành tế bào cellulose thực vật và màng sinh chất động vật.',
    questions: [
      {
        id: 'bio-1',
        question: 'Khi quan sát tế bào biểu bì củ hành tím và tế bào hồng cầu người dưới kính hiển vi, đặc điểm cấu trúc then chốt nào giúp tế bào thực vật giữ nguyên hình dạng đa giác cố định?',
        options: [
          'Thành tế bào dày cấu tạo từ các sợi Cellulose vững chắc bao quanh màng sinh chất.',
          'Không bào chứa đầy sắc tố anthocyanin.',
          'Nhân tế bào thực vật lớn hơn nhân tế bào động vật.',
          'Tế bào thực vật không có màng tế bào nên không bị biến dạng.'
        ],
        correctIndex: 0,
        explanation: 'Tế bào thực vật có vách thành tế bào (Cell wall) bằng cellulose đàn hồi và cứng cáp, chịu được áp suất trương nước (turgor pressure) lớn mà không bị vỡ. Tế bào động vật như hồng cầu chỉ có màng phospholipid kép mềm dẻo.',
        firstPrincipleNote: 'Cấu trúc quyết định chức năng: Khung sợi liên kết beta-1,4-glucan của cellulose là vật liệu chịu lực tự nhiên bảo vệ mô thực vật.'
      }
    ]
  },
  {
    moduleId: 'biology-genetics',
    moduleTitle: 'Di Truyền Men-đen & Khung Punnett',
    subject: 'biology',
    experimentId: 'genetics',
    badge: '🧬 Di Truyền Học',
    description: 'Bản chất phân ly của các alen trong giảm phân và xác suất tổ hợp ngẫu nhiên.',
    questions: [
      {
        id: 'gen-1',
        question: 'Tại sao trong phép lai một cặp tính trạng của Men-đen (Aa x Aa), đời con F2 lại phân ly kiểu hình theo tỷ lệ kinh điển 3 Trội : 1 Lặn?',
        options: [
          'Vì alen trội tự động tiêu diệt alen lặn trong quá trình thụ tinh.',
          'Vì các giao tử A và a được tạo ra với xác suất ngang nhau (1/2 A : 1/2 a), khi thụ tinh ngẫu nhiên tạo ra 1/4 AA : 2/4 Aa : 1/4 aa. Kiểu hình trội gồm cả AA và Aa nên chiếm 1/4 + 2/4 = 3/4.',
          'Vì chỉ có giao tử mang alen trội mới có khả năng sống sót để thụ tinh.',
          'Vì alen lặn chỉ biểu hiện khi nhiệt độ môi trường giảm xuống thấp.'
        ],
        correctIndex: 1,
        explanation: 'Khung Punnett chứng minh tích xác suất độc lập: P(AA) = 1/2 × 1/2 = 1/4; P(Aa) = 2 × (1/2 × 1/2) = 2/4; P(aa) = 1/4. Do alen A át chế hoàn toàn kiểu hình của a, cả AA và Aa đều biểu hiện tính trạng trội (3/4 = 75%).',
        firstPrincipleNote: 'Quy luật phân ly phản ánh sự phân li đồng đều của cặp nhiễm sắc thể tương đồng trong kỳ sau giảm phân I.'
      }
    ]
  },
  {
    moduleId: 'biology-photosynthesis',
    moduleTitle: 'Quang Hợp & Chu Trình Năng Lượng',
    subject: 'biology',
    experimentId: 'photosynthesis',
    badge: '🍃 Sinh Lý Thực Vật',
    description: 'Bản chất kích thích electron của photon ánh sáng và tổng hợp phân tử đường.',
    questions: [
      {
        id: 'pho-1',
        question: 'Khí Oxy (O₂) sinh ra trong quá trình quang hợp có nguồn gốc nguyên tử thực sự từ phân tử nào?',
        options: [
          'Từ phân tử khí Carbonic (CO₂) hấp thụ qua khí khổng lá.',
          'Từ phân tử Nước (H₂O) thông qua phản ứng quang phân ly nước tại màng thylakoid trong pha sáng.',
          'Từ phân tử đường Glucose (C₆H₁₂O₆) bị phân giải.',
          'Từ phân tử diệp lục Chlorophyll bị đốt cháy bởi ánh sáng.'
        ],
        correctIndex: 1,
        explanation: 'Thí nghiệm dùng đồng vị phóng xạ Oxy-18 của Ruben và Kamen đã chứng minh 100% oxy phóng thích có nguồn gốc từ H2O: 2H2O + photon → 4H⁺ + 4e⁻ + O2. Oxy thực chất là "sản phẩm phụ" của việc tách electron để bù vào diệp lục.',
        firstPrincipleNote: 'Năng lượng photon ánh sáng được dùng để bẻ gãy liên kết cực mạnh H-O-H của nước, nạp electron năng lượng cao cho chuỗi truyền điện tử.'
      }
    ]
  },
  {
    moduleId: 'biology-dna',
    moduleTitle: 'Cấu Trúc Xoắn Kép DNA & Cơ Chế Nhân Đôi',
    subject: 'biology',
    experimentId: 'dna',
    badge: '🔬 Sinh Học Phân Tử',
    description: 'Nguyên tắc bổ sung A-T, G-C và cơ chế bán bảo tồn truyền đạt thông tin di truyền.',
    questions: [
      {
        id: 'dna-1',
        question: 'Tại sao chuỗi xoắn kép DNA lại ghép nối bắt buộc theo nguyên tắc bổ sung A liên kết với T (2 liên kết Hydro) và G liên kết với C (3 liên kết Hydro)?',
        options: [
          'Để giữ khoảng cách giữa hai mạch đơn luôn luôn không đổi (1 base lớn Purine liên kết với 1 base nhỏ Pyrimidine), và đảm bảo tính đối xứng tối ưu liên kết hydro.',
          'Vì A và G có cùng kích thước nên đẩy nhau ra xa.',
          'Vì enzyme DNA Polymerase chỉ có thể nhận diện duy nhất cặp nucleotide này.',
          'Vì liên kết hydro giữa A và T là liên kết cộng hóa trị không thể phá vỡ.'
        ],
        correctIndex: 0,
        explanation: 'A và G là Purine (2 vòng), T và C là Pyrimidine (1 vòng). Nếu Purine đi với Purine đường kính xoắn sẽ quá rộng, Pyrimidine đi với Pyrimidine đường kính sẽ quá hẹp. Cặp Purine-Pyrimidine duy trì đường kính xoắn ổn định 2nm, đồng thời định hướng chính xác số liên kết hydro (2 liên kết giữa A-T, 3 liên kết giữa G-C).',
        firstPrincipleNote: 'Nguyên tắc bán bảo tồn: Nhờ nguyên tắc bổ sung, mỗi mạch đơn của phân tử mẹ đóng vai trò khuôn mẫu để tổng hợp mạch con chính xác đến từng base.'
      }
    ]
  },

  // --- BỔ SUNG CÁC MÔ-ĐUN CTGDPT 2018 (VẬT LÝ, HÓA HỌC, SINH HỌC) ---
  {
    moduleId: 'physics-free-fall',
    moduleTitle: 'Sự Rơi Tự Do & Ống Chân Không Newton (Vật Lý 10)',
    subject: 'physics',
    experimentId: 'free_fall',
    badge: '🪶 Vật Lý 10 CTGDPT 2018',
    description: 'Bản chất gia tốc trọng trường g không phụ thuộc khối lượng khi loại bỏ sức cản không khí.',
    questions: [
      {
        id: 'ff-1',
        question: 'Trong ống chân không của Newton (đã rút hết 100% không khí), khi thả đồng thời một chiếc lông vũ (0.5g) và một viên bi chì (500g) từ cùng một độ cao, hiện tượng gì sẽ xảy ra?',
        options: [
          'Viên bi chì chạm đáy trước vì trọng lực tác dụng lên viên bi chì lớn gấp 1000 lần so với chiếc lông vũ.',
          'Cả hai chạm đáy cùng một thời điểm vì trong chân không, chỉ có trọng lực tác dụng và gia tốc rơi a = F/m = (mg)/m = g là như nhau cho mọi vật.',
          'Chiếc lông vũ chạm đáy trước vì nó nhẹ hơn nên quán tính cản trở gia tốc nhỏ hơn.',
          'Cả hai đều lơ lửng không rơi vì trong chân không không có áp suất khí quyển.'
        ],
        correctIndex: 1,
        explanation: 'Trọng lực tỷ lệ thuận với khối lượng: P = mg. Nhưng quán tính cản trở gia tốc cũng tỷ lệ thuận với m: a = F/m = (mg)/m = g. Khối lượng m tự triệt tiêu ở cả hai vế! Khi không có lực cản của không khí, mọi vật tại cùng một vị trí địa lý đều rơi với cùng một gia tốc trọng trường g ≈ 9.8 m/s².',
        firstPrincipleNote: 'Sự bằng nhau giữa khối lượng hấp dẫn và khối lượng quán tính là nền tảng khởi nguồn cho Thuyết Tương Đối Rộng của Einstein.'
      }
    ]
  },
  {
    moduleId: 'physics-wave-interference',
    moduleTitle: 'Hiện Tượng Giao Thoa Sóng & Sóng Dừng (Vật Lý 11)',
    subject: 'physics',
    experimentId: 'wave_interference',
    badge: '🌊 Vật Lý 11 CTGDPT 2018',
    description: 'Điều kiện giao thoa, sự cộng gộp pha dao động và phân bố vân cực đại, cực tiểu.',
    questions: [
      {
        id: 'wi-1',
        question: 'Tại các điểm cực tiểu giao thoa (nơi sóng hoàn toàn bị triệt tiêu, nước phẳng lặng hoặc vân tối ánh sáng), năng lượng dao động của sóng đã biến đi đâu?',
        options: [
          'Năng lượng đã bị tiêu tán thành nhiệt lượng do ma sát giữa các phân tử môi trường.',
          'Năng lượng không bị mất đi, mà được phân bố lại và tập trung mạnh mẽ vào các cực đại giao thoa lân cận do nguyên lý chồng chập sóng.',
          'Năng lượng bị bức xạ vào chân không dưới dạng sóng điện từ.',
          'Năng lượng bị hủy diệt hoàn toàn vì hai sóng ngược pha có năng lượng âm và dương triệt tiêu nhau.'
        ],
        correctIndex: 1,
        explanation: 'Giao thoa là sự phân bố lại năng lượng trong không gian. Định luật bảo toàn năng lượng luôn đúng: tổng năng lượng của trường sóng bằng tổng năng lượng do hai nguồn phát ra. Ở vân cực tiểu năng lượng bằng 0, thì ở vân cực đại năng lượng tăng gấp 4 lần năng lượng của một sóng đơn lẻ (do biên độ tăng gấp đôi, năng lượng tỷ lệ với bình phương biên độ).',
        firstPrincipleNote: 'Hiện tượng giao thoa là bằng chứng không thể chối cãi chứng minh tính chất sóng của một thực thể vật lý.'
      }
    ]
  },
  {
    moduleId: 'physics-thermodynamics',
    moduleTitle: 'Nhiệt Động Lực Học & Khí Lý Tưởng (Vật Lý 12)',
    subject: 'physics',
    experimentId: 'thermodynamics',
    badge: '🔥 Vật Lý 12 CTGDPT 2018',
    description: 'Định luật I ΔU = Q + A và bản chất vi mô của nhiệt độ, áp suất chất khí.',
    questions: [
      {
        id: 'td-1',
        question: 'Khi nén nhanh một lượng khí lý tưởng trong xilanh cách nhiệt tuyệt đối (quá trình đoạn nhiệt Q = 0), nhiệt độ của khối khí sẽ thay đổi như thế nào?',
        options: [
          'Nhiệt độ không đổi vì khối khí không trao đổi nhiệt với môi trường bên ngoài.',
          'Nhiệt độ giảm xuống vì áp suất khối khí tăng cản trở chuyển động nhiệt.',
          'Nhiệt độ tăng lên vì công do ngoại lực tác dụng (A > 0) làm tăng độ biến thiên nội năng ΔU = A > 0, gia tăng vận tốc chuyển động nhiệt vi mô của các phân tử khí.',
          'Nhiệt độ ban đầu giảm sau đó tăng dần về trạng thái ban đầu.'
        ],
        correctIndex: 2,
        explanation: 'Theo Nguyên lý I Nhiệt động lực học: ΔU = Q + A. Do cách nhiệt nên Q = 0, suy ra ΔU = A. Ngoại lực nén khí sinh công A > 0 làm nội năng ΔU tăng. Vì nội năng của khí lý tưởng tỷ lệ thuận trực tiếp với nhiệt độ tuyệt đối T (U = 3/2 nRT), nhiệt độ khối khí bắt buộc phải tăng vọt lên.',
        firstPrincipleNote: 'Nhiệt độ thực chất là thước đo động năng chuyển động hỗn loạn trung bình của các phân tử vi mô.'
      }
    ]
  },
  {
    moduleId: 'chemistry-reaction-rate',
    moduleTitle: 'Tốc Độ Phản Ứng & Hệ Số Van \'t Hoff (Hóa Học 10)',
    subject: 'chemistry',
    experimentId: 'reaction_rate',
    badge: '⏱️ Hóa Học 10 CTGDPT 2018',
    description: 'Thuyết va chạm hoạt động, năng lượng hoạt hóa và ảnh hưởng của nhiệt độ, nồng độ.',
    questions: [
      {
        id: 'rr-1',
        question: 'Theo quy tắc thực nghiệm Van \'t Hoff, khi tăng nhiệt độ thêm 10°C, tốc độ phản ứng thường tăng từ 2 đến 4 lần. Bản chất cơ học vi mô của hiện tượng này là gì?',
        options: [
          'Do thể tích dung dịch nở ra làm các phân tử va chạm nhau nhiều hơn.',
          'Do số lượng phân tử có động năng vượt qua ngưỡng năng lượng hoạt hóa (Ea) tăng vọt theo hàm số mũ, làm số va chạm hiệu quả tăng vọt.',
          'Do nhiệt độ làm giảm khối lượng mol của các chất tham gia phản ứng.',
          'Do nhiệt độ làm tăng độ nhớt của môi trường nước.'
        ],
        correctIndex: 1,
        explanation: 'Khi nhiệt độ tăng 10°C, vận tốc phân tử chỉ tăng khoảng 2-3%, nhưng phân bố năng lượng Maxwell-Boltzmann dịch chuyển khiến tỷ lệ phân tử đạt mức năng lượng ≥ Ea tăng theo cấp số nhân. Chỉ những va chạm có năng lượng vượt Ea và đúng hướng mới phá vỡ liên kết cũ để tạo liên kết mới (va chạm hiệu quả).',
        firstPrincipleNote: 'Năng lượng hoạt hóa Ea là rào cản thế năng tối thiểu để đưa các chất phản ứng lên trạng thái chuyển tiếp.'
      }
    ]
  },
  {
    moduleId: 'chemistry-le-chatelier',
    moduleTitle: 'Cân Bằng Hóa Học & Nguyên Lý Le Chatelier (Hóa Học 11)',
    subject: 'chemistry',
    experimentId: 'le_chatelier',
    badge: '⚖️ Hóa Học 11 CTGDPT 2018',
    description: 'Sự tự điều chỉnh của hệ cân bằng động trước biến đổi nhiệt độ, áp suất và nồng độ.',
    questions: [
      {
        id: 'lc-1',
        question: 'Xét hệ cân bằng trong ống tiêm: 2NO₂ (khí màu nâu đỏ) ⇌ N₂O₄ (khí không màu) có ΔH < 0 (phản ứng thuận tỏa nhiệt). Khi ngâm ống tiêm vào cốc nước đá lạnh (hạ nhiệt độ), màu sắc của khí trong ống sẽ biến đổi thế nào?',
        options: [
          'Màu nâu đỏ đậm dần lên vì các phân tử khí co lại.',
          'Màu nâu đỏ nhạt dần đi vì hệ tự điều chỉnh bằng cách chuyển dịch theo chiều thuận (chiều tỏa nhiệt) để bù lại lượng nhiệt bị mất, làm tăng lượng N₂O₄ không màu.',
          'Không đổi màu vì hằng số cân bằng Kc không đổi theo nhiệt độ.',
          'Khí chuyển sang màu xanh lam do hiện tượng ngưng tụ.'
        ],
        correctIndex: 1,
        explanation: 'Nguyên lý Le Chatelier: Khi ta hạ nhiệt độ của hệ, hệ sẽ tự chống lại tác động bằng cách ưu tiên chuyển dịch theo chiều tỏa nhiệt (ΔH < 0, chiều thuận) để sinh thêm nhiệt sưởi ấm hệ. Chiều thuận tiêu thụ khí nâu đỏ NO2 và sinh ra khí không màu N2O4, do đó hỗn hợp khí nhạt màu rõ rệt.',
        firstPrincipleNote: 'Cân bằng hóa học là cân bằng động: tại trạng thái cân bằng, phản ứng thuận và nghịch vẫn diễn ra liên tục với tốc độ bằng nhau (v_thuận = v_nghịch).'
      }
    ]
  },
  {
    moduleId: 'chemistry-electrochemical',
    moduleTitle: 'Pin Điện Hóa Daniell & Thế Điện Cực Chuẩn (Hóa Học 12)',
    subject: 'chemistry',
    experimentId: 'electrochemical',
    badge: '🔋 Hóa Học 12 CTGDPT 2018',
    description: 'Chuyển hóa hóa năng thành điện năng, vai trò của cầu muối và thế khử chuẩn.',
    questions: [
      {
        id: 'ec-1',
        question: 'Trong pin điện hóa Daniell (Zn-Cu), tại sao cần phải có cầu muối (chứa dung dịch chất điện ly trơ như KNO₃)? Nếu nhấc cầu muối ra thì kim vôn kế sẽ chỉ bao nhiêu?',
        options: [
          'Cầu muối dẫn electron trực tiếp giữa 2 cốc. Nhấc ra kim vôn kế vẫn chỉ 1.10V.',
          'Cầu muối trung hòa điện tích hai bán pin (ion K⁺ bù vào bên Cu²⁺ mất đi, ion NO₃⁻ bù vào bên Zn²⁺ sinh ra). Nhấc cầu muối ra, mạch hở, điện tích tích tụ làm hiệu điện thế tụt về 0V ngay lập tức.',
          'Cầu muối có nhiệm vụ hòa tan thêm kim loại đồng.',
          'Cầu muối làm tăng nhiệt độ của pin để phản ứng xảy ra nhanh hơn.'
        ],
        correctIndex: 1,
        explanation: 'Tại anot: Zn → Zn²⁺ + 2e⁻ (dương tích tụ). Tại catot: Cu²⁺ + 2e⁻ → Cu (âm tích tụ). Nếu không có ion K⁺ và NO3⁻ từ cầu muối di chuyển để trung hòa điện thế không gian ở hai cốc, điện trường ngược sẽ cản trở dòng electron chạy qua dây dẫn ngoài. Khi rút cầu muối, mạch điện bị ngắt, pin ngừng hoạt động lập tức.',
        firstPrincipleNote: 'Pin điện hóa tách biệt hai quá trình oxy hóa và khử trong không gian, buộc electron phải di chuyển qua dây dẫn ngoài để sinh công điện.'
      }
    ]
  },
  {
    moduleId: 'biology-plasmolysis',
    moduleTitle: 'Hiện Tượng Co & Phản Co Nguyên Sinh (Sinh Học 10)',
    subject: 'biology',
    experimentId: 'plasmolysis',
    badge: '💧 Sinh Học 10 CTGDPT 2018',
    description: 'Thẩm thấu nước qua màng sinh chất bán thấm, môi trường ưu trương vs nhược trương.',
    questions: [
      {
        id: 'pl-1',
        question: 'Tại sao khi ngâm tế bào biểu bì củ hành tím vào dung dịch muối ưu trương (nồng độ NaCl cao hơn dịch bào), màng sinh chất tách rời khỏi thành tế bào (co nguyên sinh), nhưng tế bào lại KHÔNG bị xẹp bẹp dí hoàn toàn như tế bào hồng cầu động vật?',
        options: [
          'Vì tế bào thực vật có thành tế bào bằng cellulose bền vững giữ nguyên khung hình dạng bên ngoài, chỉ có khối nguyên sinh chất bên trong co lại.',
          'Vì dung dịch muối không thể xâm nhập vào bên trong tế bào thực vật.',
          'Vì tế bào thực vật có khả năng tự tiết ra muối để cân bằng.',
          'Vì không bào của tế bào thực vật không chứa nước.'
        ],
        correctIndex: 0,
        explanation: 'Thành tế bào thực vật cấu tạo từ các vi sợi cellulose đan dệt chặt chẽ có tính chịu lực cơ học rất cao. Khi nước thẩm thấu ra ngoài do thế nước bên ngoài thấp hơn (ưu trương), màng sinh chất bán thấm co rút kéo theo không bào thu nhỏ, nhưng thành cellulose cứng cáp vẫn giữ vững cấu trúc thể tích tế bào.',
        firstPrincipleNote: 'Áp suất trương nước (Turgor pressure) giữa màng sinh chất và thành cellulose là cơ chế giúp thân cây non đứng thẳng không bị gãy rạp.'
      }
    ]
  },
  {
    moduleId: 'biology-transpiration',
    moduleTitle: 'Thoát Hơi Nước & Động Học Đóng Mở Khí Khổng (Sinh Học 11)',
    subject: 'biology',
    experimentId: 'transpiration',
    badge: '🍃 Sinh Học 11 CTGDPT 2018',
    description: 'Cơ chế bơm ion K+, sự chênh lệch số lượng khí khổng giữa hai mặt lá.',
    questions: [
      {
        id: 'tr-1',
        question: 'Khi dán hai mảnh giấy tẩm muối Coban Clorua (CoCl₂) sấy khô màu xanh da trời vào mặt trên và mặt dưới của một chiếc lá cây bàng ngoài nắng, mảnh giấy ở mặt nào sẽ chuyển sang màu hồng trước?',
        options: [
          'Mặt trên chuyển sang hồng trước vì tiếp xúc trực tiếp với ánh nắng mặt trời nên bốc hơi nhanh hơn.',
          'Mặt dưới chuyển sang hồng nhanh hơn rõ rệt vì ở phần lớn lá cây hai lá mầm, mật độ lỗ khí khổng tập trung chủ yếu ở biểu bì mặt dưới để hạn chế mất nước do bức xạ mặt trời trực tiếp.',
          'Cả hai mặt đổi màu với tốc độ hoàn toàn bằng nhau vì lớp cutin trên lá rất mỏng.',
          'Giấy không đổi màu vì hơi nước từ lá không thể làm biến đổi màu sắc của tinh thể muối CoCl₂.'
        ],
        correctIndex: 1,
        explanation: 'CoCl2 khan màu xanh lam, khi hút ẩm chuyển thành CoCl2·6H2O màu hồng phấn. Ở đa số lá cây trên cạn, mặt dưới có số lượng khí khổng gấp nhiều lần mặt trên (giúp tránh ánh nắng chiếu trực diện gây khô héo). Do đó, lượng hơi nước thoát ra từ mặt dưới lớn hơn nhiều, làm giấy đổi màu hồng nhanh hơn.',
        firstPrincipleNote: 'Thoát hơi nước tạo ra động lực hút nước từ rễ lên lá (lực hút đầu trên) và làm mát bề mặt lá dưới trời nắng gắt.'
      }
    ]
  },
  {
    moduleId: 'biology-hardy-weinberg',
    moduleTitle: 'Di Truyền Quần Thể & Trạng Thái Cân Bằng Hardy - Weinberg (Sinh Học 12)',
    subject: 'biology',
    experimentId: 'hardy_weinberg',
    badge: '📊 Sinh Học 12 CTGDPT 2018',
    description: 'Điều kiện nghiệm đúng của định luật cân bằng di truyền p²AA + 2pqAa + q²aa = 1.',
    questions: [
      {
        id: 'hw-1',
        question: 'Ý nghĩa tiến hóa sâu sắc nhất của Định luật Hardy - Weinberg là gì?',
        options: [
          'Chứng minh rằng đột biến gen xảy ra ở mọi thế hệ với tần số không đổi.',
          'Chỉ ra rằng nếu một quần thể ngẫu phối, vô hạn và không chịu tác động của các nhân tố tiến hóa thì tần số alen và thành phần kiểu gen sẽ được duy trì ổn định không đổi; do đó, TIẾN HÓA thực chất chính là quá trình các nhân tố tiến hóa (chọn lọc tự nhiên, đột biến, phiêu bạt gen) PHÁ VỠ trạng thái cân bằng này.',
          'Khẳng định các alen trội luôn luôn có xu hướng áp đảo và loại bỏ hoàn toàn các alen lặn sau nhiều thế hệ.',
          'Giúp xác định chính xác số lượng nhiễm sắc thể của loài trong môi trường tự nhiên.'
        ],
        correctIndex: 1,
        explanation: 'Định luật Hardy - Weinberg đóng vai trò như một "trạng thái chuẩn không tiến hóa" (Null model). Một sai lầm phổ biến là nghĩ alen trội sẽ tăng dần tần số theo thời gian. Hardy và Weinberg đã chứng minh toán học rằng trong điều kiện lý tưởng, tần số alen p(A) và q(a) được bảo tồn bất biến qua mọi thế hệ ngẫu phối.',
        firstPrincipleNote: 'Sự thay đổi tần số alen và thành phần kiểu gen của quần thể qua thời gian chính là định nghĩa nguyên lý cốt lõi của tiến hóa vi mô.'
      }
    ]
  }
];

export function getQuizForModule(subject: string, experimentId?: string): StemModuleQuiz | undefined {
  if (experimentId) {
    const found = STEM_MODULE_QUIZZES.find(q => q.subject === subject && q.experimentId === experimentId);
    if (found) return found;
  }
  return STEM_MODULE_QUIZZES.find(q => q.subject === subject);
}

export function getAllQuizzes(): StemModuleQuiz[] {
  return STEM_MODULE_QUIZZES;
}
