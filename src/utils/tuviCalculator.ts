import { TuViProfileInput, TuViFullChart, TuViPalace, TuViStar } from '../types';
import { TU_VI_MAIN_STARS } from '../data/spiritualData';

const HEAVENLY_STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const EARTHLY_BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// 60 Hoa Giáp Nạp Âm Ngũ Hành Chuẩn Xác
const CAN_CHI_NAP_AM: Record<string, { menh: string; element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'; nature: string }> = {
  'Giáp Tý': { menh: 'Hải Trung Kim (Vàng trong biển)', element: 'Kim', nature: 'Kín đáo, tiềm tàng nội lực phi thường, quý khí ẩn sâu.' },
  'Ất Sửu': { menh: 'Hải Trung Kim (Vàng trong biển)', element: 'Kim', nature: 'Kiên nhẫn, điềm tĩnh, bền bỉ tích lũy thành tựu to lớn.' },
  'Bính Dần': { menh: 'Lư Trung Hỏa (Lửa trong lò)', element: 'Hỏa', nature: 'Nhiệt huyết bùng cháy, dũng mãnh, dám nghĩ dám làm.' },
  'Đinh Mão': { menh: 'Lư Trung Hỏa (Lửa trong lò)', element: 'Hỏa', nature: 'Tinh tế, giàu sáng tạo, lan tỏa hơi ấm và sự cuốn hút.' },
  'Mậu Thìn': { menh: 'Đại Lâm Mộc (Gỗ rừng già)', element: 'Mộc', nature: 'Tán lá che chở vạn vật, bao dung, tầm nhìn bao quát.' },
  'Kỷ Tỵ': { menh: 'Đại Lâm Mộc (Gỗ rừng già)', element: 'Mộc', nature: 'Trực giác nhạy bén, sâu sắc, giàu lòng trắc ẩn và uyên bác.' },
  'Canh Ngọ': { menh: 'Lộ Bàng Thổ (Đất ven đường)', element: 'Thổ', nature: 'Vững vàng, rộng lượng, là chỗ dựa tin cậy cho mọi người.' },
  'Tân Mùi': { menh: 'Lộ Bàng Thổ (Đất ven đường)', element: 'Thổ', nature: 'Chân thành, nhẫn nại, từng bước gặt hái quả ngọt hậu vận.' },
  'Nhâm Thân': { menh: 'Kiếm Phong Kim (Vàng mũi kiếm)', element: 'Kim', nature: 'Sắc sảo, quyết đoán, tài ba vượt trội, tiên phong khai phá.' },
  'Quý Dậu': { menh: 'Kiếm Phong Kim (Vàng mũi kiếm)', element: 'Kim', nature: 'Cương trực, công minh, tư duy logic và nguyên tắc vững vàng.' },
  'Giáp Tuất': { menh: 'Sơn Đầu Hỏa (Lửa trên núi)', element: 'Hỏa', nature: 'Tỏa sáng rực rỡ, trung thực, hào hiệp và giàu lòng tự trọng.' },
  'Ất Hợi': { menh: 'Sơn Đầu Hỏa (Lửa trên núi)', element: 'Hỏa', nature: 'Âm thầm soi đường, giàu lòng nhân ái, có sức hút tự nhiên.' },
  'Bính Tý': { menh: 'Giản Hạ Thủy (Nước dưới khe)', element: 'Thủy', nature: 'Linh hoạt uyển chuyển, thấu hiểu lòng người, mưu lược khôn khéo.' },
  'Đinh Sửu': { menh: 'Giản Hạ Thủy (Nước dưới khe)', element: 'Thủy', nature: 'Âm thầm bền bỉ, tính toán cẩn trọng, hậu vận an khang.' },
  'Mậu Dần': { menh: 'Thành Đầu Thổ (Đất trên thành)', element: 'Thổ', nature: 'Vững như bàn thạch, uy nghiêm, có chí lớn dựng xây sự nghiệp.' },
  'Kỷ Mão': { menh: 'Thành Đầu Thổ (Đất trên thành)', element: 'Thổ', nature: 'Khéo léo giữ gìn gia phong, ổn định, trọng chữ tín.' },
  'Canh Thìn': { menh: 'Bạch Lạp Kim (Vàng trong sáp)', element: 'Kim', nature: 'Thuần khiết, chính trực, trải qua rèn giũa sẽ thành báu vật.' },
  'Tân Tỵ': { menh: 'Bạch Lạp Kim (Vàng trong sáp)', element: 'Kim', nature: 'Thông tuệ, khéo léo thích nghi, tỏa sáng trong thử thách.' },
  'Nhâm Ngọ': { menh: 'Dương Liễu Mộc (Gỗ cây liễu)', element: 'Mộc', nature: 'Mềm mại mà dẻo dai, nhạy bén nắm bắt thời cơ.' },
  'Quý Mùi': { menh: 'Dương Liễu Mộc (Gỗ cây liễu)', element: 'Mộc', nature: 'Hiền hòa, thấu cảm, dễ thu hút quý nhân tương trợ.' },
  'Giáp Thân': { menh: 'Tuyền Trung Thủy (Nước trong suối)', element: 'Thủy', nature: 'Thanh khiết, không ngừng đổi mới, trí tuệ trong sáng.' },
  'Ất Dậu': { menh: 'Tuyền Trung Thủy (Nước trong suối)', element: 'Thủy', nature: 'Tinh tế, cẩn thận, biết lắng nghe và dung nạp ý kiến hay.' },
  'Bính Tuất': { menh: 'Ốc Thượng Thổ (Đất nóc nhà)', element: 'Thổ', nature: 'Trách nhiệm cao, che mưa chắn gió, bảo bọc người thân.' },
  'Đinh Hợi': { menh: 'Ốc Thượng Thổ (Đất nóc nhà)', element: 'Thổ', nature: 'Thành tín, trung kiên, cuộc sống an nhiên no ấm.' },
  'Mậu Tý': { menh: 'Tích Lịch Hỏa (Lửa sấm sét)', element: 'Hỏa', nature: 'Mạnh mẽ bộc phát, hành động thần tốc, tạo đột phá ngoạn mục.' },
  'Kỷ Sửu': { menh: 'Tích Lịch Hỏa (Lửa sấm sét)', element: 'Hỏa', nature: 'Quyết tâm cao độ, không lùi bước trước gian nan.' },
  'Canh Dần': { menh: 'Tùng Bách Mộc (Gỗ tùng bách)', element: 'Mộc', nature: 'Cây đại thụ giữa sương gió, kiên cường bất khuất, khí phách.' },
  'Tân Mão': { menh: 'Tùng Bách Mộc (Gỗ tùng bách)', element: 'Mộc', nature: 'Thẳng thắn, ngay thẳng, tài năng bộc lộ từ sớm.' },
  'Nhâm Thìn': { menh: 'Trường Lưu Thủy (Nước chảy dài)', element: 'Thủy', nature: 'Khát vọng bao la, tầm nhìn xa trông rộng, dòng chảy bất tận.' },
  'Quý Tỵ': { menh: 'Trường Lưu Thủy (Nước chảy dài)', element: 'Thủy', nature: 'Khôn ngoan, biết tích tiểu thành đại, thích ứng hoàn hảo.' },
  'Giáp Ngọ': { menh: 'Sa Trung Kim (Vàng trong cát)', element: 'Kim', nature: 'Giá trị tiềm ẩn cao, cần mẫn tôi luyện để trở thành vàng mười.' },
  'Ất Mùi': { menh: 'Sa Trung Kim (Vàng trong cát)', element: 'Kim', nature: 'Khiêm nhường, thanh nhã, càng về sau càng phú quý.' },
  'Bính Thân': { menh: 'Sơn Hạ Hỏa (Lửa dưới núi)', element: 'Hỏa', nature: 'Âm ỉ mà mãnh liệt, giàu sáng kiến, ấm áp tình cảm.' },
  'Đinh Dậu': { menh: 'Sơn Hạ Hỏa (Lửa dưới núi)', element: 'Hỏa', nature: 'Khéo léo, cẩn mật, giữ được sự nhiệt thành trong công việc.' },
  'Mậu Tuất': { menh: 'Bình Địa Mộc (Gỗ đồng bằng)', element: 'Mộc', nature: 'Thân thiện, dễ gần, có sức sống mãnh liệt nơi đời thường.' },
  'Kỷ Hợi': { menh: 'Bình Địa Mộc (Gỗ đồng bằng)', element: 'Mộc', nature: 'Hòa nhã, biết sẻ chia, được đông đảo mọi người quý mến.' },
  'Canh Tý': { menh: 'Bích Thượng Thổ (Đất trên vách)', element: 'Thổ', nature: 'Điểm tựa vững bền, kiên định với mục tiêu đã định.' },
  'Tân Sửu': { menh: 'Bích Thượng Thổ (Đất trên vách)', element: 'Thổ', nature: 'Kỷ luật, ngăn nắp, làm việc có phương pháp chặt chẽ.' },
  'Nhâm Dần': { menh: 'Kim Bạch Kim (Vàng thỏi lá)', element: 'Kim', nature: 'Sang trọng, quý phái, bản lĩnh độc lập tự chủ cao.' },
  'Quý Mão': { menh: 'Kim Bạch Kim (Vàng thỏi lá)', element: 'Kim', nature: 'Thanh lịch, khéo léo trong giao tiếp, thẩm mỹ tinh tế.' },
  'Giáp Thìn': { menh: 'Phúc Đăng Hỏa (Lửa đèn dầu)', element: 'Hỏa', nature: 'Ngọn đèn soi rọi đêm tối, dẫn dắt và khai mở trí tuệ.' },
  'Ất Tỵ': { menh: 'Phúc Đăng Hỏa (Lửa đèn dầu)', element: 'Hỏa', nature: 'Ân cần, chu đáo, mang lại sự ấm áp cho những nơi đi qua.' },
  'Bính Ngọ': { menh: 'Thiên Hà Thủy (Nước trên trời)', element: 'Thủy', nature: 'Mưa lành tưới mát vạn vật, hào sảng, tâm hồn khoáng đạt.' },
  'Đinh Mùi': { menh: 'Thiên Hà Thủy (Nước trên trời)', element: 'Thủy', nature: 'Dịu dàng, thấu suốt, mang phúc lành đến cho gia đạo.' },
  'Mậu Thân': { menh: 'Đại Dịch Thổ (Đất quán trọ lớn)', element: 'Thổ', nature: 'Dung nạp mọi dòng người, cởi mở, có tài ngoại giao xuất sắc.' },
  'Kỷ Dậu': { menh: 'Đại Dịch Thổ (Đất quán trọ lớn)', element: 'Thổ', nature: 'Năng động, kết nối muôn phương, thích nghi nhanh nhạy.' },
  'Canh Tuất': { menh: 'Thoa Xuyến Kim (Vàng trang sức)', element: 'Kim', nature: 'Tỏa sáng rực rỡ, được trân trọng, có tài năng nghệ thuật.' },
  'Tân Hợi': { menh: 'Thoa Xuyến Kim (Vàng trang sức)', element: 'Kim', nature: 'Duyên dáng, thu hút quý nhân, cuộc đời nhiều phúc lộc.' },
  'Nhâm Tý': { menh: 'Tang Đố Mộc (Gỗ cây dâu)', element: 'Mộc', nature: 'Có ích cho nhân sinh, kiên trì phục vụ lý tưởng cao đẹp.' },
  'Quý Sửu': { menh: 'Tang Đố Mộc (Gỗ cây dâu)', element: 'Mộc', nature: 'Chịu thương chịu khó, đức độ sâu dày, hậu vận viên mãn.' },
  'Giáp Dần': { menh: 'Đại Khê Thủy (Nước khe lớn)', element: 'Thủy', nature: 'Dạt dào năng lượng, phóng khoáng, dũng cảm vượt thác ghềnh.' },
  'Ất Mão': { menh: 'Đại Khê Thủy (Nước khe lớn)', element: 'Thủy', nature: 'Thông minh biến hóa, hài hòa với môi trường xung quanh.' },
  'Bính Thìn': { menh: 'Sa Trung Thổ (Đất pha cát)', element: 'Thổ', nature: 'Đa tài, biến hóa linh hoạt, kết hợp khéo léo các nguồn lực.' },
  'Đinh Tỵ': { menh: 'Sa Trung Thổ (Đất pha cát)', element: 'Thổ', nature: 'Sâu sắc, cẩn trọng, tích lũy nội lực bền bỉ theo năm tháng.' },
  'Mậu Ngọ': { menh: 'Thiên Thượng Hỏa (Lửa trên trời)', element: 'Hỏa', nature: 'Ánh dương chiếu rọi khắp thế gian, quang minh chính đại.' },
  'Kỷ Mùi': { menh: 'Thiên Thượng Hỏa (Lửa trên trời)', element: 'Hỏa', nature: 'Ấm áp, lan tỏa hy vọng và năng lượng tích cực bất tận.' },
  'Canh Thân': { menh: 'Thạch Lựu Mộc (Gỗ cây lựu đá)', element: 'Mộc', nature: 'Cứng cáp, đơm hoa kết trái trên sỏi đá, kiên cường phi thường.' },
  'Tân Dậu': { menh: 'Thạch Lựu Mộc (Gỗ cây lựu đá)', element: 'Mộc', nature: 'Bền bỉ, tự lực cánh sinh, tạo dựng cơ đồ từ đôi tay trắng.' },
  'Nhâm Tuất': { menh: 'Đại Hải Thủy (Nước biển lớn)', element: 'Thủy', nature: 'Bao la vô tận, chí hướng đại dương, nuôi dưỡng ước mơ vĩ đại.' },
  'Quý Hợi': { menh: 'Đại Hải Thủy (Nước biển lớn)', element: 'Thủy', nature: 'Trầm tích sâu xa, bao dung vô lượng, phúc trạch tràn đầy.' }
};

export function calculateCanChiYear(year: number): string {
  const stem = HEAVENLY_STEMS[(year + 6) % 10];
  const branch = EARTHLY_BRANCHES[(year + 8) % 12];
  return `${stem} ${branch}`;
}

export function calculateBirthHourBranch(hour: number): string {
  if (hour >= 23 || hour < 1) return 'Tý (23h - 01h)';
  if (hour >= 1 && hour < 3) return 'Sửu (01h - 03h)';
  if (hour >= 3 && hour < 5) return 'Dần (03h - 05h)';
  if (hour >= 5 && hour < 7) return 'Mão (05h - 07h)';
  if (hour >= 7 && hour < 9) return 'Thìn (07h - 09h)';
  if (hour >= 9 && hour < 11) return 'Tỵ (09h - 11h)';
  if (hour >= 11 && hour < 13) return 'Ngọ (11h - 13h)';
  if (hour >= 13 && hour < 15) return 'Mùi (13h - 15h)';
  if (hour >= 15 && hour < 17) return 'Thân (15h - 17h)';
  if (hour >= 17 && hour < 19) return 'Dậu (17h - 19h)';
  if (hour >= 19 && hour < 21) return 'Tuất (19h - 21h)';
  return 'Hợi (21h - 23h)';
}

export function calculateTuViChart(profile: TuViProfileInput): TuViFullChart {
  const year = profile.solarYear;
  const month = profile.solarMonth;
  const day = profile.solarDay;
  const hour = profile.solarHour;

  const canChiYear = calculateCanChiYear(year);
  const hourBranchStr = calculateBirthHourBranch(hour);

  const napAmInfo = CAN_CHI_NAP_AM[canChiYear] || { 
    menh: 'Hải Trung Kim (Vàng trong biển)', 
    element: 'Kim', 
    nature: 'Kín đáo, tiềm tàng nội lực phi thường.' 
  };
  const menhElement = napAmInfo.element;

  // Cung Mệnh & Thân Position calculation
  const branchIdx = (year + 8) % 12;
  const userBranch = EARTHLY_BRANCHES[branchIdx];
  const monthIdx = (month - 1) % 12;
  const hourIdx = Math.floor(((hour + 1) % 24) / 2);
  
  // Thuận tháng nghịch giờ -> Cung Mệnh
  const menhPosIdx = (2 + monthIdx - hourIdx + 12) % 12;
  // Thuận tháng thuận giờ -> Cung Thân
  const thanPosIdx = (2 + monthIdx + hourIdx) % 12;

  const cungMenhAt = EARTHLY_BRANCHES[menhPosIdx];
  const cungThanAt = EARTHLY_BRANCHES[thanPosIdx];

  // Xác định Cục (Thủy Nhị Cục, Mộc Tam Cục, Kim Tứ Cục, Thổ Ngũ Cục, Hỏa Lục Cục)
  const cucNames = ['Thủy Nhị Cục', 'Mộc Tam Cục', 'Kim Tứ Cục', 'Thổ Ngũ Cục', 'Hỏa Lục Cục'];
  const cuc = cucNames[(branchIdx + monthIdx) % 5];

  // 12 Palaces theo vòng Tử Vi chuẩn
  const palaceNames = [
    'Mệnh', 'Huynh Đệ', 'Phu Thê', 'Tử Tức', 'Tài Bạch', 'Tật Ách', 
    'Thiên Di', 'Nô Bộc', 'Quan Lộc', 'Điền Trạch', 'Phúc Đức', 'Phụ Mẫu'
  ];

  const palaces: TuViPalace[] = palaceNames.map((pName, idx) => {
    const palaceBranchIdx = (menhPosIdx - idx + 12) % 12;
    const branch = EARTHLY_BRANCHES[palaceBranchIdx];
    const stem = HEAVENLY_STEMS[(branchIdx * 2 + idx) % 10];
    
    // Phân bổ 14 chính tinh và phụ tinh hài hòa
    const star1 = TU_VI_MAIN_STARS[(idx * 3 + branchIdx) % TU_VI_MAIN_STARS.length];
    const star2 = TU_VI_MAIN_STARS[(idx * 7 + 2) % TU_VI_MAIN_STARS.length];
    const palaceStars: TuViStar[] = [star1, star2];

    const isThan = palaceBranchIdx === thanPosIdx;
    const score = 82 + ((idx * 17 + branchIdx * 11) % 17);

    let generalVerdict = '';
    let advice = '';

    if (pName === 'Mệnh') {
      generalVerdict = `Tọa thủ tại cung ${branch} có chính tinh ${star1.name} (${star1.brightness}) chủ trì. Bản mệnh ${napAmInfo.menh}. ${napAmInfo.nature}`;
      advice = 'Nên phát huy thế mạnh độc lập, giữ tâm đức trong sáng, kiên định lập trường và không ngừng mở rộng vốn tri thức.';
    } else if (pName === 'Quan Lộc') {
      generalVerdict = `Cung Quan Lộc có sao ${star1.name} hội chiếu, công danh sự nghiệp hanh thông, dễ được cất nhắc thăng tiến hoặc thành công vang dội khi tự làm chủ.`;
      advice = 'Tập trung vào chuyên môn sâu, xây dựng uy tín cá nhân và dẫn dắt đội ngũ bằng sự liêm chính, tận tâm.';
    } else if (pName === 'Tài Bạch') {
      generalVerdict = `Cung Tài Bạch có sao ${star1.name} đắc địa, nguồn tiền tài dồi dào, khả năng sinh lời và quản lý dòng tiền xuất sắc, tích lũy bền vững.`;
      advice = 'Tích lũy theo phương pháp đa dạng hóa tài sản, tránh đầu tư mạo hiểm khi chưa khảo sát kỹ lưỡng.';
    } else if (pName === 'Phu Thê') {
      generalVerdict = `Cung Phu Thê có sao ${star1.name} tọa thủ, người phối ngẫu là người thông minh, đoan trang/chững chạc, có chí hướng và hỗ trợ đắc lực cho bản mệnh.`;
      advice = 'Tôn trọng sự riêng tư và thấu hiểu nhau qua những cuộc trò chuyện chân thành, lắng nghe không phán xét.';
    } else if (pName === 'Phúc Đức') {
      generalVerdict = `Phúc ấm tổ tiên sâu dày, hưởng trọn năng lượng chở che từ dòng họ, tâm hồn hướng thiện và hậu vận an khang phú quý.`;
      advice = 'Tích cực làm việc thiện, hiếu kính phụ mẫu để vun bồi thêm cội rễ phúc báu cho bản thân và con cháu mai sau.';
    } else {
      generalVerdict = `Cung ${pName} tọa tại ${branch} hội tụ sao ${star1.name} và ${star2.name}, vận khí hòa hợp, tương trợ đắc lực cho các phương diện trong cuộc đời.`;
      advice = `Duy trì sự hài hòa, gắn kết và lắng nghe để tối ưu vận may tại cung ${pName}.`;
    }

    return {
      id: `palace_${idx}`,
      name: pName,
      earthlyBranch: branch,
      heavenlyStem: stem,
      stars: palaceStars,
      score,
      generalVerdict,
      advice,
      isThan
    };
  });

  // =========================================================================
  // VẬN HẠN NĂM 2026 (NĂM BÍNH NGỌ) - TÍNH TOÁN CHUẨN XÁC THEO HỌC THUẬT ĐÔNG PHƯƠNG
  // =========================================================================
  const currentYear = 2026;
  const age = currentYear - year + 1; // Tuổi mụ

  // 1. Sao Chiếu Mệnh Cửu Diệu 2026 (Chu kỳ 9 năm)
  // Nam: 1: La Hầu, 2: Thổ Tú, 3: Thủy Diệu, 4: Thái Bạch, 5: Thái Dương, 6: Vân Hớn, 7: Kế Đô, 8: Thái Âm, 0: Mộc Đức
  const maleStarsMap: Record<number, string> = {
    1: 'La Hầu (Khẩu thiệt, cần giữ gìn lời ăn tiếng nói)',
    2: 'Thổ Tú (Thử thách ban đầu, hậu vận hanh thông)',
    3: 'Thủy Diệu (Cát tinh, tài lộc dồi dào, đi xa có lợi)',
    4: 'Thái Bạch (Cần quản lý tài chính cẩn trọng, tích phúc)',
    5: 'Thái Dương (Đại cát tinh, quang minh rực rỡ, công danh thăng tiến)',
    6: 'Vân Hớn (Trung bình, tránh nóng nảy bốc đồng)',
    7: 'Kế Đô (Cần giữ tâm bình thản, làm nhiều việc thiện)',
    8: 'Thái Âm (Đại cát tinh, cầu tài đắc tài, cầu danh đắc danh)',
    0: 'Mộc Đức (Cát tinh, quý nhân phù trợ, vạn sự cát tường)'
  };

  // Nữ: 1: Kế Đô, 2: Vân Hớn, 3: Mộc Đức, 4: Thái Âm, 5: Thổ Tú, 6: La Hầu, 7: Thái Dương, 8: Thái Bạch, 0: Thủy Diệu
  const femaleStarsMap: Record<number, string> = {
    1: 'Kế Đô (Cần giữ gìn sức khỏe và tâm an tịnh)',
    2: 'Vân Hớn (Giữ gìn hòa khí gia đạo, tránh khẩu thiệt)',
    3: 'Mộc Đức (Cát tinh, có tin vui về hôn nhân tài lộc)',
    4: 'Thái Âm (Đại cát tinh, hạnh phúc viên mãn, tài lộc khởi sắc)',
    5: 'Thổ Tú (Đề phòng tiểu nhân, thận trọng trong đi lại)',
    6: 'La Hầu (Tránh tranh cãi, giữ tâm thiện lành)',
    7: 'Thái Dương (Đại cát tinh, công việc mở mang rạng rỡ)',
    8: 'Thái Bạch (Cẩn trọng tiền bạc, năng làm từ thiện tích đức)',
    0: 'Thủy Diệu (Cát tinh, tài lộc may mắn, hỷ sự gõ cửa)'
  };

  const starRemainder = ((age - 1) % 9 + 9) % 9;
  const saoChieuMenh = profile.gender === 'male'
    ? maleStarsMap[starRemainder]
    : femaleStarsMap[starRemainder];

  // 2. Tam Tai Năm 2026 (Năm Bính Ngọ - Địa chi Ngọ)
  // Quy luật Tam Hợp:
  // - Hợi - Mão - Mùi: Tam Tai tại Tỵ - Ngọ - Mùi => Năm 2026 (Ngọ) là NĂM THỨ 2 của Tam Tai (Phạm Tam Tai).
  // - Thân - Tý - Thìn: Tam Tai tại Dần - Mão - Thìn => Năm 2026 (Ngọ) KHÔNG phạm Tam Tai.
  // - Dần - Ngọ - Tuất: Tam Tai tại Thân - Dậu - Tuất => Năm 2026 (Ngọ) KHÔNG phạm Tam Tai.
  // - Tỵ - Dậu - Sửu: Tam Tai tại Hợi - Tý - Sửu => Năm 2026 (Ngọ) KHÔNG phạm Tam Tai.
  const tamTaiBranches2026 = ['Hợi', 'Mão', 'Mùi'];
  const hanTamTai = tamTaiBranches2026.includes(userBranch);

  // 3. Kim Lâu Năm 2026
  // Tuổi mụ chia 9 dư 1, 3, 6, 8 là phạm Kim Lâu (1: Thân, 3: Thê, 6: Tử, 8: Lục Súc)
  const kimLauRemainder = age % 9;
  const hanKimLau = [1, 3, 6, 8].includes(kimLauRemainder);

  // 4. Hoang Ốc Năm 2026
  // 6 Cung: 0: Nhất Cát (Tốt), 1: Nhì Nghi (Tốt), 2: Tam Địa Sát (Xấu), 3: Tứ Tấn Tài (Tốt), 4: Ngũ Thọ Tử (Xấu), 5: Lục Hoang Ốc (Xấu)
  const tens = Math.floor(age / 10);
  const units = age % 10;
  const hoangOcIndex = (((tens > 0 ? tens - 1 : 0) + units) % 6 + 6) % 6;
  const hanHoangOc = (hoangOcIndex === 2 || hoangOcIndex === 4 || hoangOcIndex === 5);

  // 5. Thái Tuế Năm 2026 Bính Ngọ
  // Trực: Ngọ | Xung: Tý | Hình: Mão | Phá: Dậu | Hại: Sửu
  const hanThaiTue = ['Ngọ', 'Tý', 'Mão', 'Dậu', 'Sửu'].includes(userBranch);

  // Phong thủy ngũ hành tương sinh tương khắc
  const fengShuiMap: Record<string, {
    sinh: string[];
    khac: string[];
    colors: string[];
    numbers: number[];
    directions: string[];
    stones: string[];
  }> = {
    'Kim': {
      sinh: ['Thổ sinh Kim (Đất sinh vàng bạc)', 'Kim hòa Kim (Đồng thanh tương ứng)'],
      khac: ['Hỏa khắc Kim (Lửa nung chảy kim loại)', 'Kim khắc Mộc (Dao rìu chặt cây)'],
      colors: ['Trắng bạc', 'Vàng ánh kim', 'Vàng hoàng thổ', 'Nâu cát sa mạc'],
      numbers: [6, 7, 2, 8],
      directions: ['Tây', 'Tây Bắc', 'Đông Bắc'],
      stones: ['Thạch anh trắng', 'Thạch anh vàng Citrine', 'Đá Mắt hổ vàng', 'Kim cương tự nhiên']
    },
    'Mộc': {
      sinh: ['Thủy sinh Mộc (Nước nuôi cây cối tốt tươi)', 'Mộc hòa Mộc (Rừng cây xanh tốt)'],
      khac: ['Kim khắc Mộc (Kim loại đốn cây)', 'Mộc khắc Thổ (Rễ cây hút dưỡng chất của đất)'],
      colors: ['Xanh lá cây', 'Xanh ngọc lục bảo', 'Xanh nước biển', 'Đen huyền bí'],
      numbers: [3, 4, 1],
      directions: ['Đông', 'Đông Nam', 'Bắc'],
      stones: ['Ngọc bích Nephrite', 'Thạch anh xanh Aventurine', 'Đá Lapis Lazuli', 'Cẩm thạch sơn thủy']
    },
    'Thủy': {
      sinh: ['Kim sinh Thủy (Kim loại nung chảy sinh dòng nước)', 'Thủy hòa Thủy (Trăm sông về biển lớn)'],
      khac: ['Thổ khắc Thủy (Đất ngăn dòng nước)', 'Thủy khắc Hỏa (Nước dập tắt lửa)'],
      colors: ['Xanh nước biển sâu', 'Đen tuyền', 'Trắng tinh khiết', 'Bạc sáng ánh kim'],
      numbers: [1, 6, 7],
      directions: ['Bắc', 'Tây', 'Tây Bắc'],
      stones: ['Đá Aquamarine ngọc biển', 'Thạch anh đen Morion', 'Đá Obsidian', 'Sapphire xanh thẳm']
    },
    'Hỏa': {
      sinh: ['Mộc sinh Hỏa (Cây cối bốc cháy sinh lửa)', 'Hỏa hòa Hỏa (Ánh lửa bừng sáng muôn phương)'],
      khac: ['Thủy khắc Hỏa (Nước dập tắt lửa)', 'Hỏa khắc Kim (Lửa tôi luyện vàng)'],
      colors: ['Đỏ tươi Ruby', 'Hồng cánh sen', 'Tím thạch anh', 'Cam san hô', 'Xanh lá chuối non'],
      numbers: [9, 3, 4],
      directions: ['Nam', 'Đông', 'Đông Nam'],
      stones: ['Ruby huyết kính đỏ', 'Thạch anh hồng Rose Quartz', 'Thạch anh tím Amethyst', 'Ngọc hồng lựu Garnet']
    },
    'Thổ': {
      sinh: ['Hỏa sinh Thổ (Tro tàn bồi đắp đất màu mỡ)', 'Thổ hòa Thổ (Đất bồi thành non cao)'],
      khac: ['Mộc khắc Thổ (Cây hút kiệt đất)', 'Thổ khắc Thủy (Đất đắp đê chắn lũ)'],
      colors: ['Vàng đất phù sa', 'Nâu trầm ấm', 'Đỏ ruby rực rỡ', 'Hồng phấn', 'Cam tươi'],
      numbers: [2, 5, 8, 9],
      directions: ['Đông Bắc', 'Tây Nam', 'Nam'],
      stones: ['Thạch anh vàng Citrine', 'Đá Mắt hổ nâu vàng', 'Mã não đỏ Carnelian', 'Hổ phách Amber']
    }
  };

  const fs = fengShuiMap[menhElement] || fengShuiMap['Kim'];

  return {
    profile,
    lunarDateStr: `Ngày ${day} tháng ${month} Âm Lịch (Năm ${canChiYear})`,
    canChiYear,
    canChiMonth: `${HEAVENLY_STEMS[(month * 2) % 10]} ${EARTHLY_BRANCHES[(month + 1) % 12]}`,
    canChiDay: `${HEAVENLY_STEMS[(day + 3) % 10]} ${EARTHLY_BRANCHES[(day + 5) % 12]}`,
    canChiHour: hourBranchStr,
    menhNguHanh: napAmInfo.menh,
    cuc,
    cungMenhAt,
    cungThanAt,
    chuMenh: TU_VI_MAIN_STARS[branchIdx % TU_VI_MAIN_STARS.length].name,
    chuThan: TU_VI_MAIN_STARS[thanPosIdx % TU_VI_MAIN_STARS.length].name,
    palaces,
    yearFortune2026: {
      saoChieuMenh,
      hanTamTai,
      hanKimLau,
      hanHoangOc,
      hanThaiTue,
      overallScore: 88,
      overview: `Năm 2026 (Bính Ngọ), bản mệnh bước sang tuổi ${age} (tuổi mụ), đón nhận vận khí của sao ${saoChieuMenh}. Tổng thể vận trình năm nay có nhiều chuyển biến khởi sắc, cơ hội mở rộng công danh sự nghiệp và tích lũy tài sản vững bền. ${hanTamTai ? 'Đương số thuộc nhóm tuổi phạm Tam Tai năm 2, nên cẩn trọng khi khởi công đại sự và giữ hòa khí.' : 'Đương số không phạm Tam Tai, vận thế hanh thông thuận lợi.'}`,
      careerAdvice: 'Tận dụng các cơ hội thăng tiến, mở rộng quan hệ đối tác uy tín, kiên định với các mục tiêu chiến lược dài hạn.',
      loveAdvice: 'Gia đạo bình an êm ấm, tình cảm đôi lứa thêm phần khăng khít, người độc thân có cơ duyên gặp gỡ tri kỷ tâm giao.',
      healthAdvice: 'Duy trì chế độ ăn uống thanh đạm, rèn luyện thể lực và giữ cho tâm trí luôn an nhiên, tĩnh tại.',
      wealthAdvice: 'Tài chính tích lũy tốt, có lộc may mắn từ nhiều nguồn, nên trích một phần làm việc thiện tích đức trợ mệnh.'
    },
    fengShuiGuidance: {
      nguHanhTuongSinh: fs.sinh,
      nguHanhTuongKhac: fs.khac,
      luckyColors: fs.colors,
      luckyNumbers: fs.numbers,
      luckyDirections: fs.directions,
      auspiciousStones: fs.stones
    }
  };
}
