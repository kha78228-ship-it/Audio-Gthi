// Thuật toán Can Chi, Ngũ Hành Nạp Âm và Phân Tích Cốt Cách Phả Tuệ AI Gia Phả 4.0

export interface CanChiInfo {
  year: number;
  can: string;
  chi: string;
  canChi: string;
  menhNguHanh: string;
  nguHanhElement: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
  conGiap: string;
  tuongSinh: string;
  tuongKhac: string;
  dacTinhCotCach: string[];
  phuongHuongPhuHop: string;
  mauSacMayMan: string[];
}

const THIEN_CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const DIA_CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
const CON_GIAP_NAMES = ['Khỉ', 'Gà', 'Chó', 'Lợn', 'Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê'];

// Bảng Nạp Âm 60 Hoa Giáp
const NAP_AM_TABLE: Record<string, { menh: string; element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ'; desc: string }> = {
  'Giáp Tý': { menh: 'Hải Trung Kim (Vàng trong biển)', element: 'Kim', desc: 'Trầm tĩnh, nội hàm thâm sâu, kiên định trước sóng gió.' },
  'Ất Sửu': { menh: 'Hải Trung Kim (Vàng trong biển)', element: 'Kim', desc: 'Chất chứa tài năng, nhẫn nại, tích lũy đại nghiệp.' },
  'Bính Dần': { menh: 'Lư Trung Hỏa (Lửa trong lò)', element: 'Hỏa', desc: 'Nhiệt huyết bùng cháy, dũng cảm tiên phong, trượng nghĩa.' },
  'Đinh Mão': { menh: 'Lư Trung Hỏa (Lửa trong lò)', element: 'Hỏa', desc: 'Tâm sáng, cầu tiến, giàu sức sáng tạo và lan tỏa.' },
  'Mậu Thìn': { menh: 'Đại Lâm Mộc (Gỗ rừng già)', element: 'Mộc', desc: 'Đức độ che chở, tầm nhìn bao quát, vững chãi như đại thụ.' },
  'Kỷ Tỵ': { menh: 'Đại Lâm Mộc (Gỗ rừng già)', element: 'Mộc', desc: 'Khéo léo, sâu sắc, phúc trạch đôn hậu nâng đỡ con cháu.' },
  'Canh Ngọ': { menh: 'Lộ Bàng Thổ (Đất ven đường)', element: 'Thổ', desc: 'Ngay thẳng, bao dung, quảng giao, đường đời rộng mở.' },
  'Tân Mùi': { menh: 'Lộ Bàng Thổ (Đất ven đường)', element: 'Thổ', desc: 'Hiền hòa, tín nghĩa, bền bỉ xây đắp tương lai.' },
  'Nhâm Thân': { menh: 'Kiếm Phong Kim (Vàng mũi kiếm)', element: 'Kim', desc: 'Sắc bén, quả quyết, tài năng xuất chúng, dám nghĩ dám làm.' },
  'Quý Dậu': { menh: 'Kiếm Phong Kim (Vàng mũi kiếm)', element: 'Kim', desc: 'Chính trực, minh bạch, có uy tín lãnh đạo trong dòng tộc.' },
  'Giáp Tuất': { menh: 'Sơn Đầu Hỏa (Lửa trên núi)', element: 'Hỏa', desc: 'Tỏa sáng từ xa, khí chất tôn quý, nhìn xa trông rộng.' },
  'Ất Hợi': { menh: 'Sơn Đầu Hỏa (Lửa trên núi)', element: 'Hỏa', desc: 'Nhiệt tình, thuần hậu, thường gặp quý nhân phù trợ.' },
  'Bính Tý': { menh: 'Giản Hạ Thủy (Nước dưới khe)', element: 'Thủy', desc: 'Uyển chuyển, thông minh lanh lợi, giàu lòng thấu cảm.' },
  'Đinh Sửu': { menh: 'Giản Hạ Thủy (Nước dưới khe)', element: 'Thủy', desc: 'Trí tuệ thầm lặng, chu đáo, hòa giải mâu thuẫn khéo léo.' },
  'Mậu Dần': { menh: 'Thành Đầu Thổ (Đất trên thành)', element: 'Thổ', desc: 'Vững như thành đồng, trung dũng, làm trụ cột gia đình.' },
  'Kỷ Mão': { menh: 'Thành Đầu Thổ (Đất trên thành)', element: 'Thổ', desc: 'Trật tự, nguyên tắc, gìn giữ gia phong tôn ti trật tự.' },
  'Canh Thìn': { menh: 'Bạch Lạp Kim (Vàng chân đèn)', element: 'Kim', desc: 'Tinh khiết, tinh tế, giàu nghệ thuật và thẩm mỹ.' },
  'Tân Tỵ': { menh: 'Bạch Lạp Kim (Vàng chân đèn)', element: 'Kim', desc: 'Linh hoạt, nhạy bén kinh doanh, mẫn tiệp trong học tập.' },
  'Nhâm Ngọ': { menh: 'Dương Liễu Mộc (Gỗ cây dương)', element: 'Mộc', desc: 'Mềm mại ngoài mặt nhưng dẻo dai bên trong, dễ thích nghi.' },
  'Quý Mùi': { menh: 'Dương Liễu Mộc (Gỗ cây dương)', element: 'Mộc', desc: 'Nhã nhặn, hướng thiện, chăm lo chu toàn cho tổ ấm.' },
  'Giáp Thân': { menh: 'Tuyền Trung Thủy (Nước trong giếng)', element: 'Thủy', desc: 'Nguồn nước mát trong lành, tư duy mạch lạc, trí tuệ thanh tân.' },
  'Ất Dậu': { menh: 'Tuyền Trung Thủy (Nước trong giếng)', element: 'Thủy', desc: 'Tĩnh tại, nhìn thấu sự việc, tài hoa nội hàm.' },
  'Bính Tuất': { menh: 'Ốc Thượng Thổ (Đất nóc nhà)', element: 'Thổ', desc: 'Mái che mưa nắng, bảo vệ người thân, đức hi sinh cao cả.' },
  'Đinh Hợi': { menh: 'Ốc Thượng Thổ (Đất nóc nhà)', element: 'Thổ', desc: 'Thành đạt an nhiên, hậu vận viên mãn, gia đình hòa thuận.' },
  'Mậu Tý': { menh: 'Tích Lịch Hỏa (Lửa sấm sét)', element: 'Hỏa', desc: 'Tốc độ, dứt khoát, khai phá cái mới, bộc trực mạnh mẽ.' },
  'Kỷ Sửu': { menh: 'Tích Lịch Hỏa (Lửa sấm sét)', element: 'Hỏa', desc: 'Bền bỉ đột phá, kiên định mục tiêu, không ngại gian lao.' },
  'Canh Dần': { menh: 'Tùng Bách Mộc (Gỗ tùng bách)', element: 'Mộc', desc: 'Khí tiết hiên ngang giữa sương gió, trường thọ, bền lòng.' },
  'Tân Mão': { menh: 'Tùng Bách Mộc (Gỗ tùng bách)', element: 'Mộc', desc: 'Thanh cao, trượng nghĩa, có tiếng thơm truyền đời.' },
  'Nhâm Thìn': { menh: 'Trường Lưu Thủy (Nước sông dài)', element: 'Thủy', desc: 'Chảy mãi không ngừng, chí lớn vươn xa bốn bể, phóng khoáng.' },
  'Quý Tỵ': { menh: 'Trường Lưu Thủy (Nước sông dài)', element: 'Thủy', desc: 'Trực giác nhạy bén, quảng đại, dễ đạt danh vọng lớn.' },
  'Giáp Ngọ': { menh: 'Sa Trung Kim (Vàng trong cát)', element: 'Kim', desc: 'Cần mẫn đãi cát tìm vàng, hậu vận phát tài, tâm tính đôn hậu.' },
  'Ất Mùi': { menh: 'Sa Trung Kim (Vàng trong cát)', element: 'Kim', desc: 'Từ tốn, lễ nghĩa, đức tính cần kiệm làm rạng danh dòng dõi.' },
  'Bính Thân': { menh: 'Sơn Hạ Hỏa (Lửa dưới núi)', element: 'Hỏa', desc: 'Ấm áp, hòa nhã, kết nối tình thân, lan tỏa sự nhiệt thành.' },
  'Đinh Dậu': { menh: 'Sơn Hạ Hỏa (Lửa dưới núi)', element: 'Hỏa', desc: 'Sáng suốt, trật tự, chỉn chu trong mọi công việc.' },
  'Mậu Tuất': { menh: 'Bình Địa Mộc (Gỗ đồng bằng)', element: 'Mộc', desc: 'Dễ hòa đồng, tươi tốt khắp nơi, đắc lộc tự nhiên.' },
  'Kỷ Hợi': { menh: 'Bình Địa Mộc (Gỗ đồng bằng)', element: 'Mộc', desc: 'Chân chất, thảo hiền, sống có trước có sau, thảo thơm hiếu đạo.' },
  'Canh Tý': { menh: 'Bích Thượng Thổ (Đất trên vách)', element: 'Thổ', desc: 'Ngăn gió chở che, trung kiên, giữ trọn chữ tín.' },
  'Tân Sửu': { menh: 'Bích Thượng Thổ (Đất trên vách)', element: 'Thổ', desc: 'Cần cù, nghiêm túc, làm gương sáng cho đàn em trong họ.' },
  'Nhâm Dần': { menh: 'Kim Bạch Kim (Vàng lá dát)', element: 'Kim', desc: 'Cao quý, hào sảng, uy phong đường bệ, có tài chỉ huy.' },
  'Quý Mão': { menh: 'Kim Bạch Kim (Vàng lá dát)', element: 'Kim', desc: 'Thanh lịch, nhu hòa, lời nói có trọng lượng và sức thuyết phục.' },
  'Giáp Thìn': { menh: 'Phúc Đăng Hỏa (Lửa đèn dầu)', element: 'Hỏa', desc: 'Ngọn đèn soi sáng bóng đêm, trí tuệ khai sáng, chỉ đường dẫn lối.' },
  'Ất Tỵ': { menh: 'Phúc Đăng Hỏa (Lửa đèn dầu)', element: 'Hỏa', desc: 'Tinh anh, thích nghiên cứu học hỏi, mang lại bình an ấm cúng.' },
  'Bính Ngọ': { menh: 'Thiên Hà Thủy (Nước trên trời)', element: 'Thủy', desc: 'Mưa thuận gió hòa tưới mát muôn loài, lòng dạ bao la nhân từ.' },
  'Đinh Mùi': { menh: 'Thiên Hà Thủy (Nước trên trời)', element: 'Thủy', desc: 'Thấu hiểu lòng người, bao dung hỷ xả, tích đức dày cho con cháu.' },
  'Mậu Thân': { menh: 'Đại Trạch Thổ (Đất bãi lầy lớn)', element: 'Thổ', desc: 'Nuôi dưỡng vạn vật, độ lượng dung chứa, thành công lớn ở hậu vận.' },
  'Kỷ Dậu': { menh: 'Đại Trạch Thổ (Đất bãi lầy lớn)', element: 'Thổ', desc: 'Khôn ngoan, tích lũy điền sản, lo toan chu toàn cho đại gia đình.' },
  'Canh Tuất': { menh: 'Thoa Xuyến Kim (Vàng trang sức)', element: 'Kim', desc: 'Vẻ đẹp lấp lánh, thanh tao, khiêm nhường nhưng đầy sức hút.' },
  'Tân Hợi': { menh: 'Thoa Xuyến Kim (Vàng trang sức)', element: 'Kim', desc: 'Vinh hiển sang trọng, giàu lòng vị tha, quý phái.' },
  'Nhâm Tý': { menh: 'Tang Đố Mộc (Gỗ cây dâu)', element: 'Mộc', desc: 'Biết hi sinh vì nghĩa lớn, chăm lo cho người khác, hiếu nghĩa vẹn toàn.' },
  'Quý Sửu': { menh: 'Tang Đố Mộc (Gỗ cây dâu)', element: 'Mộc', desc: 'Nhẫn nại chịu thương chịu khó, hậu vận được đền đáp xứng đáng.' },
  'Giáp Dần': { menh: 'Đại Khê Thủy (Nước khe lớn)', element: 'Thủy', desc: 'Sóng cuộn mênh mông, linh hoạt vô tận, sáng tạo không ngừng.' },
  'Ất Mão': { menh: 'Đại Khê Thủy (Nước khe lớn)', element: 'Thủy', desc: 'Hòa nhã, thông tuệ văn chương, giao tiếp duyên dáng.' },
  'Bính Thìn': { menh: 'Sa Trung Thổ (Đất trong cát)', element: 'Thổ', desc: 'Trầm mặc, kiên định lập trường, tự lực cánh sinh đạt thành quả.' },
  'Đinh Tỵ': { menh: 'Sa Trung Thổ (Đất trong cát)', element: 'Thổ', desc: 'Tư duy chiến lược, điềm tĩnh, nhìn thấy cơ hội trong khó khăn.' },
  'Mậu Ngọ': { menh: 'Thiên Thượng Hỏa (Lửa trên trời)', element: 'Hỏa', desc: 'Ánh thái dương chói lọi, công minh chính trực, nghĩa khí ngút trời.' },
  'Kỷ Mùi': { menh: 'Thiên Thượng Hỏa (Lửa trên trời)', element: 'Hỏa', desc: 'Tràn đầy sức sống, ấm áp, kết nối mọi người xung quanh.' },
  'Canh Thân': { menh: 'Thạch Lựu Mộc (Gỗ cây thạch lựu)', element: 'Mộc', desc: 'Quả ngọt sai cành, đông con nhiều cháu, gia đình hưng vượng.' },
  'Tân Dậu': { menh: 'Thạch Lựu Mộc (Gỗ cây thạch lựu)', element: 'Mộc', desc: 'Cứng cỏi trước thử thách, tài hoa bền bỉ, lưu danh tốt đẹp.' },
  'Nhâm Tuất': { menh: 'Đại Hải Thủy (Nước biển lớn)', element: 'Thủy', desc: 'Bao la khoáng đạt, chí hướng toàn cầu, tài năng xuất chúng.' },
  'Quý Hợi': { menh: 'Đại Hải Thủy (Nước biển lớn)', element: 'Thủy', desc: 'Thâm sâu khó lường, tấm lòng bồ tát, phúc lộc song toàn.' },
};

export function calculateCanChi(year: number): CanChiInfo {
  const canIndex = year % 10;
  const chiIndex = year % 12;
  const can = THIEN_CAN[canIndex];
  const chi = DIA_CHI[chiIndex];
  const canChi = `${can} ${chi}`;
  const conGiap = CON_GIAP_NAMES[chiIndex];

  const napAm = NAP_AM_TABLE[canChi] || {
    menh: 'Bản Mệnh Trầm Ổn',
    element: 'Thổ',
    desc: 'Đôn hậu, cần kiệm, gìn giữ gia phong.'
  };

  const elementRelation: Record<string, { sinh: string; khac: string; huong: string; mau: string[] }> = {
    'Kim': {
      sinh: 'Thổ sinh Kim (Được nâng đỡ), Kim sinh Thủy (Tạo phúc đức)',
      khac: 'Hỏa khắc Kim (Cần kiềm chế nóng giận)',
      huong: 'Tây, Tây Bắc, Đông Bắc',
      mau: ['Trắng', 'Bạc', 'Vàng ánh kim', 'Nâu đất']
    },
    'Mộc': {
      sinh: 'Thủy sinh Mộc (Được bồi dưỡng), Mộc sinh Hỏa (Tỏa sáng)',
      khac: 'Kim khắc Mộc (Cần rèn ý chí dẻo dai)',
      huong: 'Đông, Đông Nam, Bắc',
      mau: ['Xanh lá cây', 'Xanh lam', 'Đen']
    },
    'Thủy': {
      sinh: 'Kim sinh Thủy (Nguồn tuôn chảy), Thủy sinh Mộc (Dưỡng mầm xanh)',
      khac: 'Thổ khắc Thủy (Cần kỷ luật bản thân)',
      huong: 'Bắc, Tây, Tây Bắc',
      mau: ['Xanh dương', 'Đen', 'Trắng', 'Ghi xám']
    },
    'Hỏa': {
      sinh: 'Mộc sinh Hỏa (Tiếp thêm ngọn lửa), Hỏa sinh Thổ (Tạo nền tảng)',
      khac: 'Thủy khắc Hỏa (Cần giữ tâm tĩnh lặng)',
      huong: 'Nam, Đông, Đông Nam',
      mau: ['Đỏ', 'Hồng', 'Tím', 'Xanh lục']
    },
    'Thổ': {
      sinh: 'Hỏa sinh Thổ (Vững chãi sinh sôi), Thổ sinh Kim (Khai mỏ ngọc)',
      khac: 'Mộc khắc Thổ (Cần linh hoạt thích ứng)',
      huong: 'Tây Nam, Đông Bắc, Nam',
      mau: ['Vàng đất', 'Nâu nhạt', 'Đỏ', 'Cam gạch']
    }
  };

  const relation = elementRelation[napAm.element] || elementRelation['Thổ'];

  return {
    year,
    can,
    chi,
    canChi,
    menhNguHanh: napAm.menh,
    nguHanhElement: napAm.element,
    conGiap,
    tuongSinh: relation.sinh,
    tuongKhac: relation.khac,
    dacTinhCotCach: [
      napAm.desc,
      `Tuổi ${conGiap} (${canChi}) mang khí chất của thiên nhiên và cội nguồn.`,
      `Ngũ Hành ${napAm.element} chủ về ${
        napAm.element === 'Kim' ? 'Nghĩa khí, sắc sảo và kỷ cương' :
        napAm.element === 'Mộc' ? 'Nhân từ, sinh trưởng và che chở' :
        napAm.element === 'Thủy' ? 'Trí tuệ, linh hoạt và hòa đồng' :
        napAm.element === 'Hỏa' ? 'Lễ độ, nhiệt huyết và tỏa sáng' :
        'Tín nghĩa, kiên định và nuôi dưỡng'
      }.`
    ],
    phuongHuongPhuHop: relation.huong,
    mauSacMayMan: relation.mau
  };
}

// Phân tích tương hợp giữa 2 thành viên trong gia phả để hòa giải xung đột
export function analyzeTwoMembersHarmony(m1CanChi: CanChiInfo, m2CanChi: CanChiInfo, m1Name: string, m2Name: string) {
  const e1 = m1CanChi.nguHanhElement;
  const e2 = m2CanChi.nguHanhElement;

  const sinhPairs: Record<string, string> = {
    'Kim-Thủy': 'Kim sinh Thủy - Tương trợ tự nhiên',
    'Thủy-Mộc': 'Thủy sinh Mộc - Nuôi dưỡng và thăng hoa',
    'Mộc-Hỏa': 'Mộc sinh Hỏa - Đồng lòng tạo nên nghiệp lớn',
    'Hỏa-Thổ': 'Hỏa sinh Thổ - Bồi đắp nền móng gia đình',
    'Thổ-Kim': 'Thổ sinh Kim - Hậu thuẫn vững chãi'
  };

  const khacPairs: Record<string, string> = {
    'Kim-Mộc': 'Kim khắc Mộc - Dễ bất đồng ý kiến hoặc nguyên tắc',
    'Mộc-Thổ': 'Mộc khắc Thổ - Một bên dễ áp đặt hoặc kỳ vọng quá cao',
    'Thổ-Thủy': 'Thổ khắc Thủy - Dễ thiếu sự lắng nghe và linh hoạt',
    'Thủy-Hỏa': 'Thủy khắc Hỏa - Tính khí đối nghịch, lúc nóng lúc lạnh',
    'Hỏa-Kim': 'Hỏa khắc Kim - Dễ xảy ra tranh cãi khi cùng quyết định'
  };

  const key1 = `${e1}-${e2}`;
  const key2 = `${e2}-${e1}`;

  let harmonyScore = 78;
  let relationshipNature = 'Đồng hành & Cân bằng';
  let advice = '';

  if (e1 === e2) {
    harmonyScore = 88;
    relationshipNature = `Lưỡng ${e1} tương hòa - Cùng chung suy nghĩ và chí hướng`;
    advice = 'Hai người có cùng tần số cảm xúc và quan điểm. Tuy nhiên cần chú ý tránh bảo thủ khi cùng khăng khăng bảo vệ ý kiến cá nhân.';
  } else if (sinhPairs[key1] || sinhPairs[key2]) {
    harmonyScore = 95;
    relationshipNature = sinhPairs[key1] || sinhPairs[key2];
    advice = 'Mối quan hệ có sự tương sinh thiên phú! Một người đem lại cảm hứng và nguồn lực, người kia hiện thực hóa. Hãy tận dụng sự thấu hiểu này để gắn kết gia đình.';
  } else if (khacPairs[key1] || khacPairs[key2]) {
    harmonyScore = 68;
    relationshipNature = khacPairs[key1] || khacPairs[key2];
    advice = 'Có sự khác biệt trong phong cách tư duy và cách biểu đạt. Khắc không phải là xấu, mà là cơ hội để rèn luyện sự lắng nghe. Nên tránh đối thoại khi đang nóng giận; hãy dùng văn bản hoặc nhờ người thứ ba có mệnh trung gian hòa giải.';
  } else {
    harmonyScore = 82;
    relationshipNature = 'Bình hòa - Tương trợ dung dị';
    advice = 'Mối quan hệ phát triển rất êm ấm nếu cả hai tôn trọng không gian riêng và luôn ghi nhớ lời răn dạy gia phong của dòng tộc.';
  }

  return {
    harmonyScore,
    relationshipNature,
    advice,
    m1Info: `${m1Name} (${m1CanChi.canChi} - Mệnh ${m1CanChi.menhNguHanh})`,
    m2Info: `${m2Name} (${m2CanChi.canChi} - Mệnh ${m2CanChi.menhNguHanh})`
  };
}
