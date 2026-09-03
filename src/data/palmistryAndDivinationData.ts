import { 
  PalmLineFeature, 
  IChingHexagramData, 
  KhongMinhStickData, 
  OracleAnswer 
} from '../types';

// ==========================================
// 1. PALMISTRY (XEM CHỈ TAY & TƯỚNG TAY)
// ==========================================

export const HAND_SHAPE_ELEMENTS = [
  {
    element: 'Kim (Thực tế & Quyết đoán)',
    description: 'Lòng bàn tay vuông vức, ngón tay ngắn và chắc khỏe. Bạn là người thực tế, kiên định, kỷ luật thép và có khả năng thực thi công việc xuất sắc.',
    careerMatch: 'Kỹ sư, Quản lý tài chính, Xây dựng, Công nghệ, Đầu tư bất động sản',
    color: 'text-amber-300'
  },
  {
    element: 'Mộc (Triết học & Trí tuệ)',
    description: 'Lòng bàn tay thuôn dài, ngón tay thanh mảnh với các khớp ngón tay rõ nét. Bạn là người giàu tri thức, thích nghiên cứu, có tư duy phân tích sâu sắc.',
    careerMatch: 'Nhà nghiên cứu, Giáo dục, Luật sư, Nhà văn, Cố vấn chiến lược',
    color: 'text-emerald-300'
  },
  {
    element: 'Thủy (Trực giác & Cảm xúc)',
    description: 'Lòng bàn tay dài mềm mại, các ngón tay thon dài mượt mà, nhiều đường vân chỉ tay đan xen. Bạn sở hữu linh cảm phi thường, giàu lòng trắc ẩn và khiếu nghệ thuật.',
    careerMatch: 'Nghệ thuật, Thiết kế, Tâm lý học, Chữa lành, Âm nhạc, Sáng tạo nội dung',
    color: 'text-sky-300'
  },
  {
    element: 'Hỏa (Nhiệt huyết & Tiên phong)',
    description: 'Lòng bàn tay dài, ngón tay ngắn và linh hoạt, mu bàn tay ấm áp hồng hào. Bạn tràn đầy năng lượng lãnh đạo, đam mê bùng cháy và thích dẫn đầu xu thế.',
    careerMatch: 'Doanh nhân khởi nghiệp, Giám đốc điều hành, Diễn giả, Marketing, Thể thao',
    color: 'text-rose-300'
  },
  {
    element: 'Thổ (Vững chãi & Chân thành)',
    description: 'Lòng bàn tay dày dặn, da tay ấm áp, các đường chỉ tay rõ nét ít vân phụ. Bạn là điểm tựa đáng tin cậy, trung thực, giàu tình cảm và hậu vận an khang.',
    careerMatch: 'Nông nghiệp sạch, Quản trị nhân sự, Chăm sóc sức khỏe, Kinh doanh truyền thống',
    color: 'text-amber-200'
  }
];

export const PALM_LINE_FEATURES: PalmLineFeature[] = [
  {
    id: 'life_line',
    nameVi: 'Đường Sinh Đạo (Địa Đạo)',
    nameEn: 'Life Line',
    category: 'primary',
    icon: '🌱',
    description: 'Bao quanh gò Kim Tinh ở gốc ngón cái, biểu thị sức sống, thể lực, tuổi thọ và sự thay đổi lớn trong môi trường sống.',
    options: [
      {
        label: 'Dài, sâu, rõ nét và cong tròn rộng',
        description: 'Sức sống dồi dào, hệ miễn dịch kiên cường, tràn đầy năng lượng sống và hậu vận trường thọ an vui.',
        score: 95,
        implication: 'Sinh lực phi thường, khả năng phục hồi nhanh trước áp lực.'
      },
      {
        label: 'Thẳng và áp sát vào gò ngón cái',
        description: 'Tính cách thận trọng, kín đáo, tiết kiệm năng lượng, thích cuộc sống ổn định trong vùng an toàn.',
        score: 75,
        implication: 'Cần chú trọng rèn luyện thể thao và giải tỏa căng thẳng định kỳ.'
      },
      {
        label: 'Có nhánh rẽ hướng lên trên ngón trỏ (Mộc Tinh)',
        description: 'Tướng vươn lên thành đạt, giàu ý chí phấn đấu, từ tay trắng lập nên cơ nghiệp lẫy lừng.',
        score: 92,
        implication: 'Ý chí kiên cường, quý nhân tương trợ thời điểm lập nghiệp.'
      },
      {
        label: 'Có đường đôi song hành (Sinh đạo phụ / Hộ Mệnh)',
        description: 'Được tổ tiên phù hộ, có quý nhân âm thầm che chở vượt qua mọi tai ương hoạn nạn trong cuộc đời.',
        score: 98,
        implication: 'Lá bùa hộ mệnh trời ban, luôn gặp may mắn trong gang tấc.'
      }
    ]
  },
  {
    id: 'head_line',
    nameVi: 'Đường Trí Đạo (Nhân Đạo)',
    nameEn: 'Head Line',
    category: 'primary',
    icon: '🧠',
    description: 'Bắt đầu từ giữa ngón cái và ngón trỏ chạy ngang lòng bàn tay, phản ánh tư duy, khả năng học hỏi và chiến lược.',
    options: [
      {
        label: 'Dài vừa phải, hơi cong nhẹ về gò Nguyệt Tinh',
        description: 'Cân bằng hoàn hảo giữa tư duy logic thực tế và trí tưởng tượng sáng tạo; xử lý tình huống cực kỳ nhạy bén.',
        score: 94,
        implication: 'Tư duy chiến lược cao cấp, giải quyết vấn đề xuất sắc.'
      },
      {
        label: 'Thẳng tắp chạy ngang suốt lòng bàn tay',
        description: 'Tư duy logic sắt đá, thực tế tuyệt đối, giỏi tính toán con số, không bị cảm xúc chi phối khi ra quyết định.',
        score: 88,
        implication: 'Thích hợp làm tài chính, kiểm toán, kỹ thuật và quản trị rủi ro.'
      },
      {
        label: 'Uốn cong sâu xuống đáy gò Nguyệt Tinh',
        description: 'Tâm hồn nghệ sĩ, trí tưởng tượng bay bổng, có khiếu văn chương, thiết kế hoặc giác quan thứ 6 đặc biệt.',
        score: 90,
        implication: 'Sáng tạo đột phá, trực giác tâm linh mạnh mẽ.'
      },
      {
        label: 'Đuôi đường chẻ đôi hình đuôi cá (Nhánh Nhà Văn)',
        description: 'Khả năng hùng biện, viết lách và thuyết phục đỉnh cao; nhìn nhận một vấn đề dưới nhiều góc độ đa chiều.',
        score: 96,
        implication: 'Tài năng truyền thông, đàm phán và truyền cảm hứng.'
      }
    ]
  },
  {
    id: 'heart_line',
    nameVi: 'Đường Tâm Đạo (Thiên Đạo)',
    nameEn: 'Heart Line',
    category: 'primary',
    icon: '💖',
    description: 'Nằm trên cùng dưới các gốc ngón tay, biểu thị tình cảm, lòng trắc ẩn, thái độ đối với tình yêu và hôn nhân.',
    options: [
      {
        label: 'Dài, cong nhẹ và kết thúc ở giữa ngón trỏ và ngón giữa',
        description: 'Mẫu người lý tưởng trong tình yêu: chân thành, chung thủy, biết cân bằng giữa lý trí và cảm xúc.',
        score: 95,
        implication: 'Hôn nhân viên mãn, tình duyên bền chặt theo năm tháng.'
      },
      {
        label: 'Kéo dài thẳng vào tận gốc ngón trỏ (Gò Mộc Tinh)',
        description: 'Lãng mạn tuyệt đối, đặt tiêu chuẩn cao trong tình cảm, hết lòng vì người mình yêu thương và có tinh thần trách nhiệm lớn.',
        score: 90,
        implication: 'Tình yêu cao đẹp, chung thủy son sắt.'
      },
      {
        label: 'Đuôi chẻ ba nhánh như cây đinh ba (Trident Tình Duyên)',
        description: 'Dấu hiệu của người có duyên lành lớn, được mọi người xung quanh yêu mến, hôn nhân mang lại phú quý và hạnh phúc.',
        score: 98,
        implication: 'Đào hoa quý nhân, nhân duyên đại cát.'
      },
      {
        label: 'Thẳng và ngắn dưới ngón giữa',
        description: 'Kín tiếng trong chuyện tình cảm, thể hiện tình yêu bằng hành động thực tế thay vì những lời hoa mỹ.',
        score: 80,
        implication: 'Nên cởi mở bộc lộ cảm xúc để đối phương thấu hiểu hơn.'
      }
    ]
  },
  {
    id: 'fate_line',
    nameVi: 'Đường Định Mệnh (Sự Nghiệp & Quý Nhân)',
    nameEn: 'Fate Line',
    category: 'primary',
    icon: '🏛️',
    description: 'Chạy dọc từ đáy lòng bàn tay hướng thẳng lên ngón giữa (Gò Thổ Tinh), biểu thị đường công danh, vận mệnh và sự tự lập.',
    options: [
      {
        label: 'Thẳng tắp, sâu đậm từ cổ tay lên tận ngón giữa',
        description: 'Định hướng cuộc đời rõ ràng từ sớm, sự nghiệp thăng tiến vững chắc, đạt được vị thế cao trong xã hội.',
        score: 96,
        implication: 'Đại tướng công danh, tự thân lập nghiệp hiển vinh.'
      },
      {
        label: 'Bắt đầu từ gò Nguyệt Tinh (Gốc bàn tay phía ngón út)',
        description: 'Thành công nhờ vào sự trợ lực của quý nhân bên ngoài, gia đình vợ/chồng hoặc sự ủng hộ đông đảo của công chúng.',
        score: 92,
        implication: 'Được lòng đám đông, phù hợp ngành dịch vụ, nghệ thuật, kinh doanh.'
      },
      {
        label: 'Bắt đầu xuất hiện rõ từ tuổi 30 trở đi',
        description: 'Tiền vận tôi luyện, trung niên và hậu vận bứt phá ngoạn mục; tích lũy tài sản đồ sộ sau những nỗ lực kiên trì.',
        score: 89,
        implication: 'Hậu vận đại phát, gặt hái quả ngọt vững bền.'
      },
      {
        label: 'Mờ nhạt hoặc nhiều đoạn nối tiếp nhau',
        description: 'Cuộc đời linh hoạt, thích khám phá nhiều lĩnh vực nghề nghiệp khác nhau, không bị gò bó trong một khuôn khổ cố định.',
        score: 82,
        implication: 'Thích ứng tuyệt vời với thời đại số và kinh tế tự do.'
      }
    ]
  },
  {
    id: 'sun_line',
    nameVi: 'Đường Thái Dương (Tài Lộc & Danh Tiếng)',
    nameEn: 'Sun / Apollo Line',
    category: 'secondary',
    icon: '☀️',
    description: 'Chạy hướng lên gò Thái Dương (dưới ngón áp út), biểu thị danh tiếng, tài lộc bất ngờ và thành tựu nghệ thuật.',
    options: [
      {
        label: 'Rõ nét chạy song song với đường Định Mệnh',
        description: 'Tài lộc dồi dào, làm việc gì cũng dễ được công nhận và tôn vinh, dễ tạo dựng thương hiệu cá nhân uy tín.',
        score: 97,
        implication: 'Danh vọng và tiền tài song hành viên mãn.'
      },
      {
        label: 'Bắt đầu từ đường Trí Đạo hướng lên',
        description: 'Thành công nhờ vào trí tuệ, phát minh sáng kiến hoặc những quyết định đầu tư nhạy bén của bản thân.',
        score: 93,
        implication: 'Trí tuệ sinh tài lộc, kinh doanh đắc lợi.'
      },
      {
        label: 'Chưa thấy rõ hoặc dạng vết đứt đoạn nhỏ',
        description: 'Tài năng tiềm ẩn đang trong giai đoạn tích lũy, cần mở rộng mạng lưới quan hệ và chủ động quảng bá giá trị bản thân.',
        score: 78,
        implication: 'Tập trung xây dựng uy tín cá nhân để kích hoạt cung tài lộc.'
      }
    ]
  }
];

export const SPECIAL_PALM_SIGNS = [
  {
    id: 'letter_m',
    name: 'Chữ M May Mắn (The Lucky M)',
    symbol: '✨ M',
    rarity: 'Hiếm (1/100 người)',
    meaning: 'Tạo thành từ 4 đường: Sinh đạo + Trí đạo + Định mệnh + Tâm đạo nối liền nhau. Chủ nhân sở hữu trực giác phi thường, giác quan thứ 6 mạnh, khả năng phát hiện cơ hội kiếm tiền và quý nhân phù trợ trọn đời.',
    blessing: 'Thành công vượt bậc trong kinh doanh và sự nghiệp.'
  },
  {
    id: 'mystic_cross',
    name: 'Chữ X Thần Bí (Mystic Cross / Croix Mystique)',
    symbol: '✝️ X',
    rarity: 'Cực hiếm (2% dân số)',
    meaning: 'Nằm ở khoảng trống giữa đường Trí Đạo và Tâm Đạo. Biểu tượng của người có năng lực ngoại cảm, khả năng thấu thị tâm can người khác, duyên tiền định với huyền học, tâm linh và triết lý.',
    blessing: 'Bảo hộ tâm linh mạnh mẽ, trực giác tiên tri chuẩn xác.'
  },
  {
    id: 'star_of_apollo',
    name: 'Hình Ngôi Sao Trên Gò Thái Dương',
    symbol: '⭐ Star',
    rarity: 'Rất hiếm',
    meaning: 'Các đường vân nhỏ giao nhau thành hình ngôi sao 5 hoặc 6 cánh dưới ngón áp út. Điềm báo của sự nổi tiếng bất ngờ, tài lộc thiên ban hoặc thành tựu rạng danh trong lĩnh vực nghệ thuật / giải trí.',
    blessing: 'Thu hút sự chú ý của vũ trụ, tài lộc dồi dào gõ cửa.'
  },
  {
    id: 'simian_line',
    name: 'Chỉ Tay Chữ Nhất (Simian Line)',
    symbol: '➖ Simian',
    rarity: 'Đặc biệt (1-3%)',
    meaning: 'Đường Trí Đạo và Tâm Đạo hợp nhất thành một đường thẳng duy nhất vắt ngang lòng bàn tay. Ý chí sắt đá phi thường, tập trung cao độ vào mục tiêu, có thể trở thành thiên tài hoặc nhà lãnh đạo kiệt xuất.',
    blessing: 'Sức mạnh biến điều không thể thành có thể.'
  },
  {
    id: 'fish_sign',
    name: 'Hình Con Cá May Mắn (Matsya Sign)',
    symbol: '🐟 Fish',
    rarity: 'Rất hiếm',
    meaning: 'Hai đường vân giao nhau tạo thành hình đuôi cá ở cuối đường Sinh Đạo hoặc gò Kim Tinh. Biểu thị hậu vận đại phú đại quý, con cháu thành đạt, bình an may mắn.',
    blessing: 'Phúc lộc mãn đường, an hưởng tuổi già vinh hiển.'
  }
];

// ==========================================
// 2. I CHING 64 QUẺ KINH DỊCH & QUẺ KHỔNG MINH
// ==========================================

export const I_CHING_TRIGRAMS = [
  { name: 'Càn (Thiên)', symbol: '☰', nature: 'Trời, Sức mạnh, Cương kiện, Người cha', element: 'Kim', number: 1 },
  { name: 'Đoài (Trạch)', symbol: '☱', nature: 'Đầm hồ, Vui tươi, Thu hút, Thiếu nữ', element: 'Kim', number: 2 },
  { name: 'Ly (Hỏa)', symbol: '☲', nature: 'Lửa, Sáng suốt, Văn minh, Trung nữ', element: 'Hỏa', number: 3 },
  { name: 'Chấn (Lôi)', symbol: '☳', nature: 'Sấm sét, Vận động, Khởi đầu, Trưởng nam', element: 'Mộc', number: 4 },
  { name: 'Tốn (Phong)', symbol: '☴', nature: 'Gió, Thẩm thấu, Uyển chuyển, Trưởng nữ', element: 'Mộc', number: 5 },
  { name: 'Khảm (Thủy)', symbol: '☵', nature: 'Nước, Hiểm trở, Trí tuệ sâu sắc, Trung nam', element: 'Thủy', number: 6 },
  { name: 'Cấn (Sơn)', symbol: '☶', nature: 'Núi, Ngưng đọng, Điềm tĩnh, Thiếu nam', element: 'Thổ', number: 7 },
  { name: 'Khôn (Địa)', symbol: '☷', nature: 'Đất, Nhu thuận, Nuôi dưỡng, Người mẹ', element: 'Thổ', number: 8 }
];

export const I_CHING_KEY_HEXAGRAMS: IChingHexagramData[] = [
  {
    number: 1,
    nameVi: 'Quẻ Thuần Càn (Bát Thuần Càn)',
    nameHán: '乾為天',
    pinyin: 'Qián',
    upperTrigram: 'Càn (Trời)',
    lowerTrigram: 'Càn (Trời)',
    element: 'Kim',
    overview: 'Thời vận đại cát hanh thông, rồng bay trên trời (Phi Long Tại Thiên), sức mạnh sáng tạo và năng lượng cương kiện ở mức cực thịnh.',
    thoanTu: 'Càn: Nguyên, Hanh, Lợi, Trinh. (Khởi đầu vĩ đại, thông suốt hanh thông, mang lại điều lợi, giữ vững chính đạo).',
    tuongTu: 'Thiên hành kiện, quân tử dĩ tự cường bất tức. (Trời vận hành mạnh mẽ, người quân tử noi theo mà tự lực tự cường không ngừng nghỉ).',
    meaning: 'Mọi kế hoạch lớn đều có cơ hội thành công vang dội. Bạn đang nắm trong tay ngọn lửa tiên phong và quyền chủ động tối cao.',
    actionAdvice: 'Hành động quyết đoán, giữ tâm chính trực, khiêm nhường khi ở đỉnh cao danh vọng để tránh "Kháng Long Hữu Hối" (Rồng bay quá cao tất có hối hận).',
    aspects: {
      career: 'Thăng quan tiến chức, khởi nghiệp đại thắng, ký kết hợp đồng lớn.',
      wealth: 'Tài chính dồi dào, các khoản đầu tư sinh lời vượt kỳ vọng.',
      love: 'Chủ động tỏ tình, tình cảm mãnh liệt và đầy ngưỡng mộ.',
      health: 'Thể lực tràn trề, chú ý điều hòa huyết áp và nghỉ ngơi.',
      travel: 'Xuất hành phương Tây Bắc đại cát đại lợi.',
      wish: 'Mưu sự lớn ắt thành, cần duy trì lòng kiên định.'
    }
  },
  {
    number: 2,
    nameVi: 'Quẻ Thuần Khôn (Bát Thuần Khôn)',
    nameHán: '坤為地',
    pinyin: 'Kūn',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Khôn (Đất)',
    element: 'Thổ',
    overview: 'Đức dày nâng đỡ vạn vật (Địa Thế Khôn), lấy tĩnh chế động, lấy nhu thắng cương, bao dung và nuôi dưỡng.',
    thoanTu: 'Khôn: Nguyên Hanh, Lợi tẫn mã chi trinh. (Vạn vật sinh sôi, hanh thông, thuận theo ngựa cái mà giữ vững sự bền bỉ).',
    tuongTu: 'Địa thế khôn, quân tử dĩ hậu đức tải vật. (Đất có thế dày dặn, người quân tử lấy đức dày mà nâng đỡ muôn loài).',
    meaning: 'Thời điểm thích hợp để lắng nghe, học hỏi, củng cố hậu phương và đi sau người khác thay vì đối đầu trực diện.',
    actionAdvice: 'Không nên vội vã dẫn đầu, hãy tìm kiếm sự hợp tác, nhẫn nại tích lũy nội lực rồi cơ hội lớn sẽ tự tìm đến.',
    aspects: {
      career: 'Hợp tác thành công, củng cố đội ngũ nội bộ vững mạnh.',
      wealth: 'Tích lũy ổn định, quản lý dòng tiền an toàn lâu dài.',
      love: 'Tình cảm dịu dàng, thấu hiểu, bền chặt như đất mẹ.',
      health: 'Ăn uống bồi bổ tỳ vị, dưỡng sinh an thần.',
      travel: 'Xuất hành phương Tây Nam đón nhiều bình an.',
      wish: 'Mọi việc thành tựu dần dần nhờ sự kiên nhẫn.'
    }
  },
  {
    number: 11,
    nameVi: 'Quẻ Địa Thiên Thái (Thái Bình Thịnh Trị)',
    nameHán: '地天泰',
    pinyin: 'Tài',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Càn (Trời)',
    element: 'Thổ / Kim',
    overview: 'Trời Đất giao hòa, âm dương tương hội, vạn vật hanh thông, thời kỳ thái bình thịnh trị và thăng hoa rực rỡ.',
    thoanTu: 'Thái: Tiểu vãng đại lai, cát hanh. (Cái nhỏ đi qua, cái lớn tìm đến, may mắn hanh thông).',
    tuongTu: 'Thiên địa giao thái, hậu dĩ tài thành thiên địa chi đạo. (Trời đất giao cảm tạo nên thời Thái, bậc vua chúa chế định đạo trời đất).',
    meaning: 'Một trong những quẻ đại cát nhất trong 64 quẻ. Bế tắc tan biến, các mối quan hệ hòa hảo, tài lộc tự nhiên tìm đến.',
    actionAdvice: 'Tận dụng thời vận hoàng kim này để mở rộng quy mô, giúp đỡ người khác và kiến tạo những giá trị bền vững.',
    aspects: {
      career: 'Công việc trôi chảy như nước xuôi dòng, mọi sự suôn sẻ.',
      wealth: 'Tài lộc dồi dào, kinh doanh đắc lợi, tiền bạc hanh thông.',
      love: 'Tình duyên thắm nồng, gia đạo ấm êm hạnh phúc viên mãn.',
      health: 'Thân tâm an lạc, bệnh tật tiêu trừ.',
      travel: 'Đi xa gặp quý nhân, đi đâu cũng được tiếp đón nồng hậu.',
      wish: 'Cầu gì được nấy, vạn sự như ý nguyện.'
    }
  },
  {
    number: 14,
    nameVi: 'Quẻ Hỏa Thiên Đại Hữu (Tài Lộc Dồi Dào)',
    nameHán: '火天大有',
    pinyin: 'Dà Yǒu',
    upperTrigram: 'Ly (Lửa)',
    lowerTrigram: 'Càn (Trời)',
    element: 'Hỏa / Kim',
    overview: 'Mặt trời chiếu sáng giữa trời cao, sở hữu muôn vàn của cải và danh tiếng lẫy lừng.',
    thoanTu: 'Đại Hữu: Nguyên Hanh. (Sở hữu lớn lao, khởi đầu tốt đẹp và hanh thông).',
    tuongTu: 'Hỏa tại thiên thượng, Đại Hữu; quân tử dĩ át ác dương thiện. (Lửa sáng trên trời là quẻ Đại Hữu; người quân tử ngăn chặn điều ác, tuyên dương việc thiện).',
    meaning: 'Thời cơ thu hoạch vụ mùa bội thu. Bạn được trao quyền hạn, tài chính và sự tin tưởng tuyệt đối từ tập thể.',
    actionAdvice: 'Dùng của cải và trí tuệ để làm việc thiện, chia sẻ thành quả với cộng sự để giữ vững phúc lộc lâu bền.',
    aspects: {
      career: 'Vị thế dẫn đầu, dự án đạt doanh thu kỷ lục.',
      wealth: 'Tiền bạc vào như nước, tích lũy tài sản lớn.',
      love: 'Mối quan hệ danh giá, được gia đình đôi bên ủng hộ.',
      health: 'Năng lượng dồi dào, chú ý tránh làm việc quá sức.',
      travel: 'Thuận lợi mọi bề, danh tiếng vang xa.',
      wish: 'Ước nguyện nhanh chóng thành hiện thực.'
    }
  },
  {
    number: 15,
    nameVi: 'Quẻ Địa Sơn Khiêm (Khiêm Tốn Sinh Phú Quý)',
    nameHán: '地山謙',
    pinyin: 'Qiān',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Cấn (Núi)',
    element: 'Thổ',
    overview: 'Núi cao chịu nép mình dưới lòng đất mẹ. Quẻ duy nhất trong 64 quẻ có cả 6 hào đều tốt lành (Lục Hào Giai Cát).',
    thoanTu: 'Khiêm: Hanh, quân tử hữu chung. (Khiêm tốn thì hanh thông, người quân tử giữ trọn vẹn trước sau).',
    tuongTu: 'Địa trung hữu sơn, Khiêm; quân tử dĩ phẫu đa ích quả, xưng vật bình thi. (Trong đất có núi là quẻ Khiêm; người quân tử bớt chỗ nhiều bù chỗ ít, làm cho mọi vật công bằng).',
    meaning: 'Khiêm nhường không phải là yếu đuối, mà là đỉnh cao của sự thông thái. Người biết khiêm tốn sẽ được trời đất và con người cùng ủng hộ.',
    actionAdvice: 'Lắng nghe nhiều hơn, hạ cái tôi xuống, đối đãi chân thành với mọi người, thành công tự khắc bền lâu.',
    aspects: {
      career: 'Được cấp trên tin cậy, đồng nghiệp yêu mến, thăng tiến êm đẹp.',
      wealth: 'Tài lộc vững bền, không lo thất thoát hay rủi ro tranh chấp.',
      love: 'Tình yêu sâu sắc, gắn bó keo sơn bởi sự tôn trọng lẫn nhau.',
      health: 'Tâm thái an nhiên, huyết khí điều hòa, trường thọ.',
      travel: 'Đi đường bình an, gặp nhiều bạn tốt.',
      wish: 'Cầu mưu sự thành công một cách nhẹ nhàng êm ái.'
    }
  },
  {
    number: 24,
    nameVi: 'Quẻ Địa Lôi Phục (Thời Cơ Phục Hồi)',
    nameHán: '地雷復',
    pinyin: 'Fù',
    upperTrigram: 'Khôn (Đất)',
    lowerTrigram: 'Chấn (Sấm)',
    element: 'Thổ / Mộc',
    overview: 'Sấm động dưới lòng đất, một luồng dương khí mới vừa hồi sinh (Đông chí nhất dương sinh), báo hiệu mùa xuân sắp tới.',
    thoanTu: 'Phục: Hanh, xuất nhập vô tật, bằng lai vô cữu. (Hồi phục thì hanh thông, ra vào không bệnh tật, bạn bè đến không có lỗi).',
    tuongTu: 'Lôi tại địa trung, Phục; tiên vương dĩ chí nhật bế quan. (Sấm trong lòng đất là quẻ Phục; các vị vua xưa đến ngày Đông chí thì đóng cửa quan ải nghỉ ngơi).',
    meaning: 'Giai đoạn khó khăn nhất đã qua đi. Ánh sáng hy vọng và những cơ hội phục hồi mới đang bắt đầu hé lộ.',
    actionAdvice: 'Bắt đầu từng bước nhỏ, cẩn trọng nhưng lạc quan, không nên nôn nóng đốt cháy giai đoạn.',
    aspects: {
      career: 'Công việc khởi sắc trở lại, tìm được hướng đi mới khả thi.',
      wealth: 'Dòng tiền phục hồi dần dần, trả hết các khoản nợ cũ.',
      love: 'Gương vỡ lại lành, hóa giải hiểu lầm trong quá khứ.',
      health: 'Sức khỏe bình phục nhanh chóng sau cơn ốm mệt.',
      travel: 'Chuyến đi mang lại cảm hứng tái tạo năng lượng.',
      wish: 'Ước nguyện đang trên đà chuyển biến tích cực.'
    }
  },
  {
    number: 63,
    nameVi: 'Quẻ Thủy Hỏa Ký Tế (Công Thành Danh Toại)',
    nameHán: '水火既濟',
    pinyin: 'Jì Jì',
    upperTrigram: 'Khảm (Nước)',
    lowerTrigram: 'Ly (Lửa)',
    element: 'Thủy / Hỏa',
    overview: 'Nước ở trên lửa, nồi nước đang sôi nấu chín thức ăn. Mọi việc đã hoàn thành trọn vẹn, âm dương cân đối tuyệt đối.',
    thoanTu: 'Ký Tế: Hanh tiểu, lợi trinh, sơ cát chung loạn. (Việc đã thành thì hanh thông nhỏ, lợi ở sự giữ gìn chính đạo; ban đầu tốt, về sau dễ rối loạn nếu chủ quan).',
    tuongTu: 'Thủy tại hỏa thượng, Ký Tế; quân tử dĩ tư hoạn nhi dự phòng chi. (Nước trên lửa là Ký Tế; người quân tử nghĩ đến hoạn nạn mà dự phòng từ sớm).',
    meaning: 'Bạn đã đạt được mục tiêu lớn đã đề ra. Tuy nhiên, khi việc đã thành thì thách thức tiếp theo là duy trì phong độ.',
    actionAdvice: 'Cẩn trọng phòng ngừa rủi ro tiềm ẩn, không được ngủ quên trên chiến thắng, bảo dưỡng thành quả chu đáo.',
    aspects: {
      career: 'Hoàn thành xuất sắc dự án lớn, nhận khen thưởng xứng đáng.',
      wealth: 'Thu hoạch tiền bạc trọn vẹn, cần cất giữ bảo mật.',
      love: 'Hôn lễ tưng bừng, tình cảm bước sang trang mới ổn định.',
      health: 'Cần duy trì lối sống lành mạnh, không chủ quan.',
      travel: 'Đi lại thuận buồm xuôi gió.',
      wish: 'Việc lớn đã xong, hãy chuẩn bị cho kế hoạch tiếp theo.'
    }
  }
];

export const KHONG_MINH_STICKS: KhongMinhStickData[] = [
  {
    number: 1,
    tier: 'Thượng Thượng',
    poemHan: 'Thiên khai địa tịch định càn khôn / Nhật nguyệt tinh quang chiếu vạn môn / Phú quý vinh hoa tự nhiên chí / Gia đình hòa mục hưởng trường tôn.',
    poemVi: 'Trời mở đất yên định thế càn / Trăng sao soi chiếu khắp muôn ngàn / Vinh hoa phú quý tự nhiên tới / Con cháu vinh hiển sống bình an.',
    overview: 'Quẻ Thượng Thượng đắc cách nhất trong 100 quẻ. Âm dương hòa hợp, thiên thời địa lợi nhân hòa đều tụ hội.',
    verdicts: {
      taiLoc: 'Tiền tài vào như nước chảy, đầu tư kinh doanh đại thắng.',
      congDanh: 'Được cất nhắc lên vị trí cao, thi cử đỗ đạt hiển vinh.',
      honNhan: 'Lương duyên tiền định, đôi lứa xứng đôi vừa lứa.',
      giaDao: 'Trong ấm ngoài êm, gia đình đón thêm tin vui hỷ sự.',
      xuatHanh: 'Đi xa gặp quý nhân tương trợ, trăm sự hanh thông.',
      benhTat: 'Gặp thầy gặp thuốc, mau chóng bình phục khang kiện.',
      cauMuon: 'Cầu tài đắc tài, cầu danh đắc danh, ước gì được nấy.'
    },
    khuyenHoc: 'Nên tích đức hành thiện, cúng dường làm việc nghĩa để phúc trạch lưu truyền dài lâu.'
  },
  {
    number: 8,
    tier: 'Thượng Cát',
    poemHan: 'Nhất phiến thành tâm thướng bích tiêu / Thần tiên mặc hựu giải tai tiêu / Xuân lai thảo mộc câu sinh ý / Khởi đãi đông phong nhất dạ phiêu.',
    poemVi: 'Một tấm lòng thành hướng cõi cao / Ơn trên che chở giải phong ba / Xuân về cây cỏ đâm chồi biếc / Gió thoảng đêm lành lộc nở hoa.',
    overview: 'Tấm lòng chí thành cảm động đến trời đất. Mọi khó khăn tai ương cũ đều tiêu tan theo gió xuân.',
    verdicts: {
      taiLoc: 'Nguồn thu mới khai mở, buôn may bán đắt.',
      congDanh: 'Có quý nhân nâng đỡ, tài năng được công nhận.',
      honNhan: 'Tình cảm ngày càng gắn bó thấu hiểu và nồng thắm.',
      giaDao: 'Hóa giải mọi bất đồng, không khí gia đình ấm cúng.',
      xuatHanh: 'Thuận lợi, an toàn, có lộc mang về.',
      benhTat: 'Thuyên giảm rõ rệt, tinh thần phấn chấn.',
      cauMuon: 'Mưu tính việc gì cũng có cơ may thành tựu 8-9 phần.'
    },
    khuyenHoc: 'Giữ tâm an tịnh, kiên trì theo đuổi mục tiêu chính đạo.'
  },
  {
    number: 18,
    tier: 'Trung Cát',
    poemHan: 'Vân tán nguyệt minh kiến thái bình / Tiền trình vạn lý khả đồng hành / Lao tâm khổ tứ chung hữu ích / Khổ tận cam lai phúc tự sinh.',
    poemVi: 'Mây tan trăng sáng thấy thanh bình / Muôn dặm đường dài vững bước chân / Vất vả gian nan không uổng phí / Khổ ải qua rồi phúc tới gần.',
    overview: 'Giai đoạn trui rèn bản lĩnh đã xong. Bầu trời mây mù tan biến, trăng sáng soi tỏ con đường phía trước.',
    verdicts: {
      taiLoc: 'Thu hồi được nợ cũ, tài chính bắt đầu có tích lũy.',
      congDanh: 'Công sức bỏ ra bấy lâu nay bắt đầu kết trái ngọt.',
      honNhan: 'Cần lắng nghe và bao dung, tình cảm sẽ đơm hoa.',
      giaDao: 'Bình an, cần chú ý chăm sóc người lớn tuổi.',
      xuatHanh: 'Nên chuẩn bị chu đáo trước khi khởi hành.',
      benhTat: 'Nghỉ ngơi dưỡng sức là khỏi, không nên lo âu.',
      cauMuon: 'Cần thêm thời gian kiên nhẫn, không nên nôn nóng.'
    },
    khuyenHoc: 'Đừng vội nản lòng trước bước ngoặt cuối cùng của thử thách.'
  },
  {
    number: 28,
    tier: 'Bình An',
    poemHan: 'Tri túc tâm thường lạc / Vô cầu phẩm tự cao / Thận ngôn thủ bổn phận / Nhàn hạ độ thanh tiêu.',
    poemVi: 'Biết đủ lòng thường thấy thảnh thơi / Không màng danh lợi sống vui tươi / Giữ gìn lời nói tròn bổn phận / Ngày tháng an nhiên nở nụ cười.',
    overview: 'Quẻ khuyên lấy chữ "Bình An" làm trọng. Thích hợp thủ thế, an cư lạc nghiệp hơn là mạo hiểm đầu cơ.',
    verdicts: {
      taiLoc: 'Thu chi cân đối, không nên vay mượn mạo hiểm.',
      congDanh: 'Duy trì công việc hiện tại, củng cố chuyên môn.',
      honNhan: 'Tình cảm êm đềm giản dị mà chan chứa yêu thương.',
      giaDao: 'Hòa thuận, không có biến động bất ngờ.',
      xuatHanh: 'Đi gần thuận lợi hơn đi xa.',
      benhTat: 'Ăn uống thanh đạm, tập luyện thể thao hàng ngày.',
      cauMuon: 'Được như ý ở mức độ vừa phải, vừa lòng với hiện tại.'
    },
    khuyenHoc: 'Nuôi dưỡng tâm hồn an tịnh, trân trọng những gì đang có.'
  }
];

// ==========================================
// 3. NUMEROLOGY PROFILES (THẦN SỐ HỌC)
// ==========================================

export const LIFE_PATH_PROFILES: Record<number, {
  title: string;
  keywords: string[];
  element: string;
  summary: string;
  strengths: string[];
  challenges: string[];
  careerSuggestions: string[];
  loveAdvice: string;
  year2026Forecast: string;
}> = {
  1: {
    title: 'Số 1: Nhà Lãnh Đạo Tiên Phong',
    keywords: ['Độc lập', 'Tiên phong', 'Ý chí thép', 'Tự tin', 'Sáng tạo'],
    element: 'Dương Hỏa',
    summary: 'Bạn sinh ra để dẫn đầu, mở đường cho những ý tưởng mới và truyền cảm hứng tự lực tự cường cho mọi người xung quanh.',
    strengths: ['Quyết đoán cao độ', 'Dũng cảm đối mặt rủi ro', 'Tự chủ và không phụ thuộc'],
    challenges: ['Cái tôi quá lớn', 'Đôi khi thiếu kiên nhẫn với người đi chậm hơn'],
    careerSuggestions: ['CEO / Nhà sáng lập', 'Giám đốc chiến lược', 'Chuyên gia đổi mới sáng tạo', 'Chính trị gia'],
    loveAdvice: 'Học cách nhường nhịn và lắng nghe cảm xúc của bạn đời thay vì luôn muốn làm người quyết định tất cả.',
    year2026Forecast: 'Năm 2026 mở ra chu kỳ bứt phá 9 năm mới; thời cơ vàng để khởi động các dự án ấp ủ từ lâu.'
  },
  2: {
    title: 'Số 2: Sứ Giả Hòa Bình & Trực Giác',
    keywords: ['Lắng nghe', 'Thấu cảm', 'Ngoại giao', 'Trực giác', 'Hợp tác'],
    element: 'Âm Thủy',
    summary: 'Bạn mang năng lượng của sự chữa lành, nhạy bén kết nối lòng người và sở hữu giác quan thứ sáu tinh tế.',
    strengths: ['Khả năng lắng nghe kiệt xuất', 'Giải quyết mâu thuẫn êm thấm', 'Tâm hồn nghệ sĩ'],
    challenges: ['Dễ tổn thương vì lời nói người khác', 'Hay do dự không dám từ chối'],
    careerSuggestions: ['Nhà ngoại giao', 'Chuyên gia tâm lý', 'Nghệ thuật & Thiết kế', 'Cố vấn nhân sự'],
    loveAdvice: 'Mở lòng chia sẻ nguyện vọng chân thật của bạn, đừng hy sinh quá mức dẫn đến cảm giác kiệt sức.',
    year2026Forecast: 'Năm 2026 là năm của các mối quan hệ đối tác bền chặt và tình cảm thăng hoa viên mãn.'
  },
  3: {
    title: 'Số 3: Ngọn Lửa Sáng Tạo & Truyền Cảm Hứng',
    keywords: ['Giao tiếp', 'Lạc quan', 'Hài hước', 'Nghệ thuật', 'Sáng tạo'],
    element: 'Dương Mộc',
    summary: 'Bạn là linh hồn của mọi cuộc gặp gỡ, mang lại niềm vui, tiếng cười và khả năng biểu đạt ngôn từ xuất chúng.',
    strengths: ['Hoạt ngôn duyên dáng', 'Ý tưởng phong phú vô tận', 'Lan tỏa năng lượng tích cực'],
    challenges: ['Dễ mất tập trung', 'Đôi khi chi tiêu theo cảm hứng bất chợt'],
    careerSuggestions: ['Truyền thông / MC', 'Content Creator', 'Biên kịch', 'Marketing sáng tạo', 'Diễn viên'],
    loveAdvice: 'Chân thành trong từng lời hứa và cùng người ấy xây dựng những kế hoạch tương lai thực tế.',
    year2026Forecast: 'Năm 2026 đánh dấu sự bùng nổ danh tiếng và các cơ hội xuất hiện trên các phương tiện truyền thông.'
  },
  4: {
    title: 'Số 4: Bậc Thầy Kiến Tạo & Kỷ Luật Vững Bền',
    keywords: ['Kỷ luật', 'Thực tế', 'Chắc chắn', 'Tổ chức', 'Trung thực'],
    element: 'Dương Thổ',
    summary: 'Bạn là móng nhà vững chãi, luôn làm việc có hệ thống, biến những ước mơ viển vông thành cấu trúc hiện thực kiên cố.',
    strengths: ['Tinh thần trách nhiệm tuyệt đối', 'Kỹ năng quản trị chi tiết', 'Đáng tin cậy bậc nhất'],
    challenges: ['Đôi khi quá cứng nhắc', 'Ngại thay đổi phương pháp quen thuộc'],
    careerSuggestions: ['Kỹ sư công trình', 'Quản lý tài chính', 'Luật sư', 'Kiểm toán viên', 'Chuyên gia vận hành'],
    loveAdvice: 'Dành thêm thời gian cho những phút giây lãng mạn bất ngờ để làm ấm ngọn lửa tình yêu.',
    year2026Forecast: 'Năm 2026 củng cố nền tảng tài sản, thích hợp mua nhà, tích lũy đất đai và đầu tư an toàn.'
  },
  5: {
    title: 'Số 5: Nhà Thám Hiểm Tự Do & Đột Phá',
    keywords: ['Tự do', 'Thích ứng', 'Phiêu lưu', 'Đa tài', 'Cách tân'],
    element: 'Dương Kim',
    summary: 'Bạn khao khát tự do, ghét sự gò bó đơn điệu và luôn là người đầu tiên nắm bắt các xu hướng đổi mới công nghệ của thời đại.',
    strengths: ['Khả năng thích ứng siêu phàm', 'Đa tài nhiều lĩnh vực', 'Dám dấn thân khám phá'],
    challenges: ['Cả thèm chóng chán', 'Khó duy trì kỷ luật dài hạn nếu thiếu mục tiêu rõ ràng'],
    careerSuggestions: ['Du lịch / Hướng dẫn viên', 'Thương mại quốc tế', 'Phóng viên tác nghiệp', 'Công nghệ số'],
    loveAdvice: 'Tìm kiếm người bạn đời tôn trọng không gian riêng và cùng bạn chia sẻ niềm đam mê khám phá thế giới.',
    year2026Forecast: 'Năm 2026 ngập tràn những chuyến đi xa, chuyển biến công việc đầy thú vị và cơ duyên mới.'
  },
  6: {
    title: 'Số 6: Trái Tim Yêu Thương & Người Nuôi Dưỡng',
    keywords: ['Trách nhiệm', 'Yêu thương', 'Gia đình', 'Thẩm mỹ', 'Bảo bọc'],
    element: 'Âm Thổ',
    summary: 'Bạn mang sứ mệnh của tình mẫu tử và lòng nhân ái, luôn chăm lo cho mái ấm gia đình và kiến tạo cái đẹp cho cuộc đời.',
    strengths: ['Giàu đức hy sinh', 'Gu thẩm mỹ tinh tế', 'Khả năng kết nối các thành viên gia đình'],
    challenges: ['Hay lo lắng thái quá', 'Dễ can thiệp quá sâu vào chuyện của người khác vì quá thương'],
    careerSuggestions: ['Bác sĩ / Y tá', 'Giáo dục mầm non & kỹ năng', 'Thiết kế nội thất', 'Hoạt động xã hội'],
    loveAdvice: 'Học cách yêu thương chính mình trước khi chăm sóc cả thế giới.',
    year2026Forecast: 'Năm 2026 gia đạo hỷ sự, đón nhận sự đền đáp xứng đáng từ những người bạn từng cưu mang.'
  },
  7: {
    title: 'Số 7: Nhà Triết Học & Tìm Kiếm Chân Lý',
    keywords: ['Trí tuệ', 'Tâm linh', 'Chiêm nghiệm', 'Độc lập', 'Phân tích'],
    element: 'Âm Mộc',
    summary: 'Bạn có cái nhìn sâu sắc vào bản chất vũ trụ, thích tĩnh lặng chiêm nghiệm và tìm kiếm quy luật vận hành của cuộc đời.',
    strengths: ['Trực giác tâm linh thâm sâu', 'Tư duy phản biện logic', 'Khả năng tự chữa lành vết thương'],
    challenges: ['Có xu hướng khép kín cô lập', 'Đa nghi và khó đặt trọn niềm tin vào người khác'],
    careerSuggestions: ['Nhà nghiên cứu khoa học', 'Chuyên gia dữ liệu', 'Triết gia / Tác giả sách', 'Học giả huyền học'],
    loveAdvice: 'Mở rộng cánh cửa tâm hồn để đối phương bước vào thế giới nội tâm phong phú của bạn.',
    year2026Forecast: 'Năm 2026 là năm của sự thức tỉnh tâm linh, nâng cao tri thức và đạt bước tiến lớn về trí tuệ.'
  },
  8: {
    title: 'Số 8: Bậc Thầy Tài Chính & Quyền Lực Hiện Thực',
    keywords: ['Thịnh vượng', 'Điều hành', 'Tài chính', 'Thực tế', 'Kiên cường'],
    element: 'Âm Kim',
    summary: 'Bạn làm chủ quy luật của tiền bạc và sự thịnh vượng vật chất, có tầm nhìn chiến lược vĩ mô và tinh thần không chịu khuất phục.',
    strengths: ['Bản lĩnh thương trường', 'Quản lý tài sản quy mô lớn', 'Khả năng vực dậy sau thất bại'],
    challenges: ['Dễ bị cuốn vào vòng xoáy công việc', 'Đôi khi quá thực dụng trong tình cảm'],
    careerSuggestions: ['Nhà đầu tư mạo hiểm', 'Giám đốc tài chính (CFO)', 'Chủ doanh nghiệp', 'Bất động sản cao cấp'],
    loveAdvice: 'Cân bằng giữa sự nghiệp và tình cảm; người bên cạnh cần sự ấm áp hơn là những món quà đắt tiền.',
    year2026Forecast: 'Năm 2026 gặt hái thành quả tài chính rực rỡ, dòng tiền đổ về mạnh mẽ từ các thương vụ đầu tư.'
  },
  9: {
    title: 'Số 9: Trái Tim Vị Tha & Người Phục Vụ Nhân Loại',
    keywords: ['Nhân đạo', 'Vị tha', 'Lý tưởng', 'Trách nhiệm cộng đồng', 'Bao dung'],
    element: 'Âm Hỏa',
    summary: 'Bạn mang tầm nhìn toàn cầu, tấm lòng bao la hướng về lợi ích chung của xã hội và truyền cảm hứng thiện nguyện.',
    strengths: ['Lòng trắc ẩn bao la', 'Thu hút sự kính trọng của mọi người', 'Tầm nhìn vượt thời đại'],
    challenges: ['Khó buông bỏ quá khứ', 'Dễ bị lợi dụng lòng tốt nếu thiếu sự tỉnh táo'],
    careerSuggestions: ['Tổ chức phi chính phủ (NGO)', 'Chính khách cộng đồng', 'Nghệ thuật nhân văn', 'Thầy thuốc'],
    loveAdvice: 'Học cách tha thứ cho những lỗi lầm cũ và đón nhận tình yêu hiện tại bằng cả trái tim thanh thản.',
    year2026Forecast: 'Năm 2026 khép lại chu kỳ cũ để đón nhận những chân trời rực rỡ mới.'
  },
  11: {
    title: 'Master 11/2: Người Dẫn Đường Ánh Sáng Tâm Linh',
    keywords: ['Trực giác tối cao', 'Ánh sáng', 'Thấu cảm', 'Khai sáng', 'Thần bí'],
    element: 'Thiên Hỏa',
    summary: 'Con số Master mang sứ mệnh đánh thức nhận thức tâm linh, cầu nối giữa thế giới vô hình và hiện thực hữu hình.',
    strengths: ['Linh cảm chuẩn xác đến kinh ngạc', 'Khả năng chữa lành cảm xúc', 'Tầm nhìn trực giác'],
    challenges: ['Hệ thần kinh nhạy cảm cao độ', 'Dễ bị quá tải năng lượng nếu không biết thiền định'],
    careerSuggestions: ['Chuyên gia tâm lý trị liệu', 'Diễn giả tâm linh', 'Nghệ sĩ truyền cảm hứng', 'Cố vấn tinh thần'],
    loveAdvice: 'Cần một người bạn đời biết chia sẻ và bảo bọc hệ năng lượng nhạy cảm của bạn.',
    year2026Forecast: 'Năm 2026 khai mở luân xa trực giác, thu hút những mối lương duyên tâm linh tiền định.'
  },
  22: {
    title: 'Master 22/4: Kiến Trúc Sư Vĩ Đại Của Thời Đại',
    keywords: ['Vĩ đại', 'Kiến tạo', 'Thực thi tối thượng', 'Quy mô quốc tế', 'Tầm nhìn'],
    element: 'Thiên Thổ',
    summary: 'Số Master quyền lực nhất trong Thần Số Học — kết hợp giữa tầm nhìn siêu việt của số 11 và năng lực thực thi sắt đá của số 4.',
    strengths: ['Biến những dự án không tưởng thành hiện thực', 'Quy mô xây dựng vĩ mô', 'Bản lĩnh phi thường'],
    challenges: ['Áp lực trách nhiệm khổng lồ', 'Dễ kiệt sức nếu ôm đồm tất cả việc'],
    careerSuggestions: ['Kiến trúc sư trưởng', 'Tổng thống / Thủ tướng', 'Chủ tịch tập đoàn đa quốc gia', 'Nhà từ thiện lớn'],
    loveAdvice: 'Chia sẻ bớt gánh nặng với người thân yêu để có điểm tựa tinh thần vững chắc.',
    year2026Forecast: 'Năm 2026 đặt những viên gạch nền móng đầu tiên cho một công trình để đời.'
  }
};

// ==========================================
// 4. CRYSTAL BALL ORACLES (QUẢ CẦU PHA LÊ)
// ==========================================

export const CRYSTAL_ORACLE_RESPONSES: OracleAnswer[] = [
  {
    category: 'decision',
    sentiment: 'positive',
    shortAnswer: 'VŨ TRỤ ĐỒNG THUẬN — CÓ!',
    cosmicMessage: 'Mọi tinh tú đang xếp thẳng hàng để hỗ trợ quyết định này của bạn. Hãy dũng cảm tiến bước không do dự.',
    actionGuidance: 'Lên kế hoạch chi tiết và bắt tay thực hiện ngay trong vòng 48 giờ tới để nắm bắt luồng năng lượng đỉnh cao.',
    affirmation: 'Tôi hoàn toàn tin tưởng vào quyết định của mình và sẵn sàng đón nhận quả ngọt.'
  },
  {
    category: 'decision',
    sentiment: 'caution',
    shortAnswer: 'HÃY TĨNH TÂM — CHƯA PHẢI LÚC!',
    cosmicMessage: 'Vẫn còn những thông tin ẩn giấu dưới đáy hồ chưa lộ diện. Nếu vội vàng hành động, bạn có thể phải trả giá bằng sự hối tiếc.',
    actionGuidance: 'Dành thêm 7 ngày để quan sát, thu thập thêm dữ liệu và hỏi ý kiến của một người có kinh nghiệm trước khi ký kết.',
    affirmation: 'Sự kiên nhẫn hôm nay là lá chắn bảo vệ tương lai vững vàng của tôi.'
  },
  {
    category: 'love',
    sentiment: 'positive',
    shortAnswer: 'DUYÊN LÀNH GÕ CỬA 💖',
    cosmicMessage: 'Người ấy đang mang theo nguồn năng lượng chân thành và mong muốn xây dựng mối liên kết sâu sắc với bạn.',
    actionGuidance: 'Hãy cởi mở chia sẻ cảm xúc thật của mình, một cử chỉ quan tâm nhỏ sẽ phá vỡ mọi khoảng cách ngại ngùng.',
    affirmation: 'Tôi xứng đáng được yêu thương trọn vẹn và đón nhận tình yêu đích thực.'
  },
  {
    category: 'love',
    sentiment: 'timing',
    shortAnswer: 'HÃY YÊU THƯƠNG CHÍNH MÌNH TRƯỚC 🌸',
    cosmicMessage: 'Chiếc cốc của bạn cần được lấp đầy tình yêu từ bên trong trước khi có thể rót sang cho người khác.',
    actionGuidance: 'Dành cuối tuần này để nuông chiều bản thân, đi dạo thiên nhiên và tái tạo lại tần số rung động tích cực.',
    affirmation: 'Tôi là nguồn cội của tình yêu thương và sự bình an thuần khiết.'
  },
  {
    category: 'career',
    sentiment: 'positive',
    shortAnswer: 'BỨT PHÁ NGOẠN MỤC 🚀',
    cosmicMessage: 'Những hạt giống nỗ lực âm thầm bấy lâu nay của bạn đang chuẩn bị đâm chồi nảy lộc thành quả ngọt khổng lồ.',
    actionGuidance: 'Tự tin trình bày ý tưởng mới trước cấp trên hoặc khách hàng lớn; bạn đang nắm giữ hào quang chiến thắng.',
    affirmation: 'Tài năng và sự cống hiến của tôi luôn được vũ trụ ghi nhận và đền đáp xứng đáng.'
  },
  {
    category: 'wealth',
    sentiment: 'positive',
    shortAnswer: 'DÒNG CHẢY THỊNH VƯỢNG 💰',
    cosmicMessage: 'Một cơ hội gia tăng thu nhập hoặc khoản lộc bất ngờ đang trên đường tìm đến bạn.',
    actionGuidance: 'Quản lý dòng tiền kỷ luật, trích một phần làm từ thiện hoặc tích lũy tài sản dài hạn để giữ lộc bền lâu.',
    affirmation: 'Tôi mở lòng đón nhận dòng chảy tiền tài và sự trù phú vô hạn của vũ trụ.'
  }
];
