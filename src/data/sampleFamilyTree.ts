import { FamilyTree, FamilyTreeMember, FamilyEvent, FamilyProposal, ClosureTableEntry, GraphNode, GraphEdge } from '../types';

export const SAMPLE_FAMILY_TREE: FamilyTree = {
  id: 'tree_nguyen_phuc_main',
  name: 'Dòng Họ Nguyễn Phúc - Chi Phái Đệ Tam',
  ancestralHall: 'Từ Đường Nguyễn Tộc - Thôn Đông, Xã Kim Bảng, Tỉnh Hà Nam',
  clanOrigin: 'Thủy Tổ phát tích từ Làng Cổ Bát Tràng (Hà Nội), định cư lập ấp tại Hà Nam thế kỷ 18',
  emblemUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
  motto: 'Ẩm Thủy Tư Nguyên - Vạn Đại Trường Tồn - Hiếu Đễ Tiên Vi Linh',
  creatorUid: 'admin_truong_ho',
  adminUids: ['admin_truong_ho', 'kha78228@gmail.com'],
  editorUids: ['bientap_ho_01'],
  memberUids: ['user_con_chau_01'],
  rootMemberId: 'mem_gen1_01',
  totalGenerations: 4,
  totalMembers: 14,
  branches: ['Chi Trưởng (Giáp)', 'Chi Thứ Hai (Ất)', 'Chi Thứ Ba (Bính)'],
  description: 'Gia phả chính thống của dòng họ Nguyễn Phúc, ghi chép thế thứ từ cụ Khởi Tổ đời thứ nhất đến hậu duệ hiện đại, bảo lưu đạo lý gia phong, khuyến học khuyến tài.',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2026-09-01T12:00:00Z'
};

export const SAMPLE_FAMILY_MEMBERS: FamilyTreeMember[] = [
  // ĐỜI 1: KHỞI TỔ (THỦY TỔ)
  {
    id: 'mem_gen1_01',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Đức Thọ',
    alternativeName: 'Tự Phúc An, Hiệu Tịnh Trai Tiên Sinh',
    gender: 'male',
    generation: 1,
    branch: 'Toàn tộc',
    orderInFamily: 1,
    isDeceased: true,
    birthDate: '1895-04-15',
    lunarBirthDate: '21/03 Ất Mùi',
    deathDate: '1972-11-20',
    lunarDeathDate: '15/10 Nhâm Tý',
    burialPlace: 'Đồi Mộ Tổ Gò Rùa, Xã Kim Bảng, Tỉnh Hà Nam (Hướng Nam ghé Đông 15 độ)',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Nho sư khai tâm, Đốc học phủ Lý Nhân',
    currentResidence: 'Từ Đường Nguyễn Tộc, Thôn Đông, Hà Nam',
    bio: 'Cụ Thủy tổ đời 1 của phân chi đệ tam. Nổi tiếng đức độ, thông tuệ kinh điển, mở trường dạy chữ Nho và bốc thuốc cứu người nghèo quanh vùng. Từng được triều đình ban sắc phong "Thuận Nghĩa Tiên Sinh".',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: null,
    spouseIds: ['mem_gen1_02'],
    childrenIds: ['mem_gen2_01', 'mem_gen2_02', 'mem_gen2_03'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01',
    depth: 0,
    documents: [
      {
        id: 'doc_01',
        title: 'Bản Dịch Sắc Phong Triều Nguyễn (Khải Định Niên Tự)',
        type: 'decree',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        description: 'Văn bia và sắc phong triều Nguyễn ghi nhận công lao cứu trợ bão lũ và mở trường nghĩa thục năm 1923.',
        date: '1923-08-15',
        fileSize: '4.2 MB'
      },
      {
        id: 'doc_02',
        title: 'Trích Lục Gia Phả Ký Chữ Hán - Nôm Khởi Thủy',
        type: 'genealogy_record',
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
        description: 'Bản chép tay của cụ Nguyễn Phúc Đức Thọ lưu truyền trong hòm gia bảo tại từ đường.',
        date: '1940-01-05',
        fileSize: '8.1 MB'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen1_02',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Trần Thị Đoan Trang',
    alternativeName: 'Hiệu Diệu Tâm Ý Đức',
    gender: 'female',
    generation: 1,
    branch: 'Toàn tộc',
    orderInFamily: 1,
    isDeceased: true,
    birthDate: '1898-09-02',
    lunarBirthDate: '17/07 Mậu Tuất',
    deathDate: '1979-05-18',
    lunarDeathDate: '23/04 Kỷ Mùi',
    burialPlace: 'Khu mộ tổ họ Trần - Nghĩa trang Đồi Thông (cạnh mộ Cụ Ông)',
    originPlace: 'Ý Yên, Nam Định',
    occupation: 'Hiền thê tần tảo, quản gia gia phong',
    currentResidence: 'Từ Đường Nguyễn Tộc, Hà Nam',
    bio: 'Chánh thất cụ Nguyễn Phúc Đức Thọ. Xuất thân gia giáo trâm anh thế phiệt huyện Ý Yên. Cả đời chăm lo chồng con đỗ đạt, phụng dưỡng tông đường trọn đạo hiếu nghĩa.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: null,
    spouseIds: ['mem_gen1_01'],
    childrenIds: ['mem_gen2_01', 'mem_gen2_02', 'mem_gen2_03'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_02',
    depth: 0,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },

  // ĐỜI 2: CON CỤ THỦY TỔ (3 người con: 2 trai 1 gái)
  {
    id: 'mem_gen2_01',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Quang Vinh',
    alternativeName: 'Tự Văn Minh, Hiệu Tùng Bách',
    gender: 'male',
    generation: 2,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 1,
    isDeceased: true,
    birthDate: '1922-02-14',
    lunarBirthDate: '18/01 Nhâm Tuất',
    deathDate: '2005-08-25',
    lunarDeathDate: '21/07 Ất Dậu',
    burialPlace: 'Nghĩa Trang Cán Bộ Tỉnh Hà Nam, Khu A, Hàng 3',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Đại tá Quân đội Nhân dân Việt Nam, Nguyên Trung đoàn trưởng',
    currentResidence: 'Quận Ba Đình, Hà Nội',
    bio: 'Trưởng nam của cụ Thủy Tổ. Tham gia kháng chiến chống Pháp và chống Mỹ, được trao tặng Huân chương Kháng chiến hạng Nhất, Huân chương Quân công.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen1_01',
    motherId: 'mem_gen1_02',
    spouseIds: ['mem_gen2_01_sp'],
    childrenIds: ['mem_gen3_01', 'mem_gen3_02'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01',
    depth: 1,
    documents: [
      {
        id: 'doc_03',
        title: 'Huân Chương Kháng Chiến Hạng Nhất',
        type: 'certificate',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
        description: 'Chứng nhận Huân chương do Chủ tịch nước trao tặng năm 1985.',
        date: '1985-09-02',
        fileSize: '3.1 MB'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen2_01_sp',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Lê Thị Thu Hà',
    alternativeName: 'Hiệu Thục Từ',
    gender: 'female',
    generation: 2,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 1,
    isDeceased: true,
    birthDate: '1926-06-10',
    deathDate: '2012-03-14',
    lunarDeathDate: '22/02 Nhâm Thìn',
    burialPlace: 'Nghĩa Trang Cán Bộ Tỉnh Hà Nam',
    originPlace: 'Đan Phượng, Hà Nội',
    occupation: 'Bác sĩ Quân y viện 108',
    currentResidence: 'Ba Đình, Hà Nội',
    bio: 'Vợ Cụ Nguyễn Phúc Quang Vinh. Tận tụy cứu chữa thương bệnh binh trong chiến dịch Điện Biên Phủ và Trường Sơn.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: null,
    spouseIds: ['mem_gen2_01'],
    childrenIds: ['mem_gen3_01', 'mem_gen3_02'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen2_01_sp',
    depth: 1,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen2_02',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Tiến Thành',
    alternativeName: 'Tự Quốc Hưng, Hiệu Bạch Mã',
    gender: 'male',
    generation: 2,
    branch: 'Chi Thứ Hai (Ất)',
    orderInFamily: 2,
    isDeceased: false,
    birthDate: '1935-10-12',
    lunarBirthDate: '16/09 Ất Hợi',
    burialPlace: '',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Giáo sư - Tiến sĩ Nông nghiệp, Nguyên Viện trưởng Viện Nghiên cứu Cây trồng',
    currentResidence: 'Khu Đô thị Ecopark, Hưng Yên',
    bio: 'Thứ nam đời 2, hiện là bậc cao niên uy tín của dòng họ. Có nhiều công trình lai tạo giống lúa cao sản đóng góp lớn cho an ninh lương thực quốc gia.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen1_01',
    motherId: 'mem_gen1_02',
    spouseIds: ['mem_gen2_02_sp'],
    childrenIds: ['mem_gen3_03', 'mem_gen3_04'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_02',
    depth: 1,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen2_02_sp',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Vũ Thị Minh Nguyệt',
    gender: 'female',
    generation: 2,
    branch: 'Chi Thứ Hai (Ất)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1938-12-05',
    originPlace: 'Thanh Miện, Hải Dương',
    occupation: 'Nhà giáo Ưu tú, Giảng viên ĐH Sư Phạm Hà Nội',
    currentResidence: 'Ecopark, Hưng Yên',
    bio: 'Vợ Giáo sư Nguyễn Phúc Tiến Thành. Nhiều thế hệ học trò thành đạt, gia đình gương mẫu hiếu học.',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: null,
    spouseIds: ['mem_gen2_02'],
    childrenIds: ['mem_gen3_03', 'mem_gen3_04'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen2_02_sp',
    depth: 1,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen2_03',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Thị Kim Loan',
    gender: 'female',
    generation: 2,
    branch: 'Chi Thứ Ba (Bính)',
    orderInFamily: 3,
    isDeceased: false,
    birthDate: '1942-05-20',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Dược sĩ Cao cấp',
    currentResidence: 'Quận 1, TP. Hồ Chí Minh',
    bio: 'Cô út đời 2. Xa quê vào Nam lập nghiệp từ những năm 1976, luôn hướng về cội nguồn và tài trợ quỹ khuyến học dòng họ hàng năm.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen1_01',
    motherId: 'mem_gen1_02',
    spouseIds: [],
    childrenIds: ['mem_gen3_05'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_03',
    depth: 1,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },

  // ĐỜI 3: THẾ HỆ TRƯỞNG THÀNH (Đời con cháu kế nghiệp)
  {
    id: 'mem_gen3_01',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Trọng Nghĩa',
    alternativeName: 'Trưởng Tộc Đương Nhiệm',
    gender: 'male',
    generation: 3,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1958-03-28',
    lunarBirthDate: '09/02 Mậu Tuất',
    burialPlace: '',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Kỹ sư Cầu đường, Nguyên Giám đốc Ban Quản lý Dự án Giao thông',
    currentResidence: 'Quận Tây Hồ, Hà Nội',
    bio: 'Trưởng chi Giáp, hiện giữ vai trò Trưởng Tộc điều hành việc từ đường, tôn tạo lăng mộ tổ và chủ trì các ngày tế tự dòng họ hàng năm.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen2_01',
    motherId: 'mem_gen2_01_sp',
    spouseIds: ['mem_gen3_01_sp'],
    childrenIds: ['mem_gen4_01', 'mem_gen4_02'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01/mem_gen3_01',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen3_01_sp',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Hoàng Bích Thủy',
    gender: 'female',
    generation: 3,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1962-11-19',
    originPlace: 'Tây Hồ, Hà Nội',
    occupation: 'Kiến trúc sư nội thất',
    currentResidence: 'Tây Hồ, Hà Nội',
    bio: 'Vợ Trưởng tộc Nguyễn Phúc Trọng Nghĩa. Cùng chồng quản xuyến công việc từ đường dòng tộc chu đáo ấm cúng.',
    photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: null,
    spouseIds: ['mem_gen3_01'],
    childrenIds: ['mem_gen4_01', 'mem_gen4_02'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen3_01_sp',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen3_02',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Hoài Nam',
    gender: 'male',
    generation: 3,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 2,
    isDeceased: false,
    birthDate: '1965-07-08',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Doanh nhân công nghệ, Nhà đầu tư',
    currentResidence: 'Quận 7, TP. Hồ Chí Minh & Singapore',
    bio: 'Con thứ của chi Trưởng. Thành lập tập đoàn logistics và công nghệ, tài trợ học bổng du học cho các cháu trong dòng họ.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen2_01',
    motherId: 'mem_gen2_01_sp',
    spouseIds: [],
    childrenIds: ['mem_gen4_03'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01/mem_gen3_02',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen3_03',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Hải Đăng',
    gender: 'male',
    generation: 3,
    branch: 'Chi Thứ Hai (Ất)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1970-01-15',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Tiến sĩ Sinh học Phân tử, Giảng viên ĐH Quốc Gia Hà Nội',
    currentResidence: 'Cầu Giấy, Hà Nội',
    bio: 'Trưởng chi Ất đời 3. Tiếp nối sự nghiệp khoa học của thân phụ GS. Nguyễn Phúc Tiến Thành, đạt nhiều giải thưởng khoa học sáng tạo.',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen2_02',
    motherId: 'mem_gen2_02_sp',
    spouseIds: [],
    childrenIds: ['mem_gen4_04'],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_02/mem_gen3_03',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen3_04',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Thị Diệu Huyền',
    gender: 'female',
    generation: 3,
    branch: 'Chi Thứ Hai (Ất)',
    orderInFamily: 2,
    isDeceased: false,
    birthDate: '1974-09-22',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Nghệ sĩ Piano, Giảng viên Học viện Âm nhạc Quốc gia',
    currentResidence: 'Đống Đa, Hà Nội',
    bio: 'Thứ nữ chi Ất. Biểu diễn nhiều chương trình giao hưởng trong và ngoài nước.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen2_02',
    motherId: 'mem_gen2_02_sp',
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_02/mem_gen3_04',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen3_05',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Trần Nguyễn Gia Bảo',
    gender: 'male',
    generation: 3,
    branch: 'Chi Thứ Ba (Bính)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1980-04-10',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Bác sĩ chuyên khoa Phẫu thuật Tim mạch',
    currentResidence: 'Quận 1, TP. Hồ Chí Minh',
    bio: 'Cháu ngoại của dòng họ Nguyễn Phúc, luôn tích cực tham gia các kỳ giỗ tổ và khám chữa bệnh từ thiện cho bà con quê hương.',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    fatherId: null,
    motherId: 'mem_gen2_03',
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_03/mem_gen3_05',
    depth: 2,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },

  // ĐỜI 4: THẾ HỆ TRẺ (CON CHÁU ĐANG HỌC TẬP VÀ LẬP NGHIỆP)
  {
    id: 'mem_gen4_01',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Minh Khang',
    alternativeName: 'Đích Tôn Đời 4',
    gender: 'male',
    generation: 4,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '1990-12-01',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Kỹ sư Trí tuệ Nhân tạo (AI Research Engineer)',
    currentResidence: 'Cầu Giấy, Hà Nội & Tokyo, Nhật Bản',
    bio: 'Đích tôn đời 4 của chi Trưởng. Đang nghiên cứu AI tại Viện Công nghệ Tokyo, người khởi xướng chuyển đổi số số hóa cây gia phả dòng họ trên nền tảng Haevy Family Tree.',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen3_01',
    motherId: 'mem_gen3_01_sp',
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01/mem_gen3_01/mem_gen4_01',
    depth: 3,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen4_02',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Thị Mai Phương',
    gender: 'female',
    generation: 4,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 2,
    isDeceased: false,
    birthDate: '1995-06-18',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Luật sư Thương mại Quốc tế',
    currentResidence: 'Quận Hoàn Kiếm, Hà Nội',
    bio: 'Thứ nữ chi Trưởng đời 4. Tốt nghiệp thủ khoa ĐH Luật Hà Nội, Thạc sĩ Luật tại ĐH Melbourne (Úc).',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen3_01',
    motherId: 'mem_gen3_01_sp',
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01/mem_gen3_01/mem_gen4_02',
    depth: 3,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen4_03',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Thiên Ân',
    alternativeName: 'Con nuôi hiếu thảo',
    gender: 'male',
    generation: 4,
    branch: 'Chi Trưởng (Giáp)',
    orderInFamily: 3,
    isDeceased: false,
    birthDate: '2002-08-10',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Sinh viên năm cuối ĐH Ngoại Thương',
    currentResidence: 'Quận 7, TP. Hồ Chí Minh',
    bio: 'Được chú Nguyễn Phúc Hoài Nam nhận nuôi từ nhỏ, chăm ngoan lễ phép, đạt giải Nhì sinh viên nghiên cứu khoa học toàn quốc.',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen3_02',
    motherId: null,
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'adopted_in',
    pathFromRoot: '/mem_gen1_01/mem_gen2_01/mem_gen3_02/mem_gen4_03',
    depth: 3,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'mem_gen4_04',
    treeId: 'tree_nguyen_phuc_main',
    fullName: 'Nguyễn Phúc Bảo Long',
    gender: 'male',
    generation: 4,
    branch: 'Chi Thứ Hai (Ất)',
    orderInFamily: 1,
    isDeceased: false,
    birthDate: '2005-02-20',
    originPlace: 'Kim Bảng, Hà Nam',
    occupation: 'Học sinh chuyên Toán ĐHQG Hà Nội',
    currentResidence: 'Cầu Giấy, Hà Nội',
    bio: 'Cháu đích tôn chi Ất. Đạt Huy chương Bạc Olympic Toán quốc tế năm 2023, mang lại niềm vinh dự lớn cho dòng họ.',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    fatherId: 'mem_gen3_03',
    motherId: null,
    spouseIds: [],
    childrenIds: [],
    adoptionType: 'none',
    pathFromRoot: '/mem_gen1_01/mem_gen2_02/mem_gen3_03/mem_gen4_04',
    depth: 3,
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  }
];

export const SAMPLE_FAMILY_EVENTS: FamilyEvent[] = [
  {
    id: 'evt_01',
    treeId: 'tree_nguyen_phuc_main',
    title: 'Ngày Giỗ Cụ Thủy Tổ Nguyễn Phúc Đức Thọ',
    memberId: 'mem_gen1_01',
    memberName: 'Cụ Nguyễn Phúc Đức Thọ (Đời 1)',
    eventType: 'death_anniversary',
    solarDate: '2026-11-20',
    lunarDate: '15/10 Nhâm Tý (Hàng năm vào rằm tháng 10 Âm Lịch)',
    recurringYearly: true,
    reminderDaysBefore: 7,
    location: 'Từ Đường Nguyễn Tộc, Thôn Đông, Xã Kim Bảng, Hà Nam',
    description: 'Đại lễ giỗ tổ thường niên của toàn thể con cháu chi phái Đệ Tam. Con cháu xa gần quy tụ dâng hương báo công và phát học bổng khuyến học.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'evt_02',
    treeId: 'tree_nguyen_phuc_main',
    title: 'Lễ Tế Tổ Thanh Minh & Tảo Mộ Mùa Xuân',
    eventType: 'clan_gathering',
    solarDate: '2026-04-05',
    lunarDate: '19/02 Bính Ngọ',
    recurringYearly: true,
    reminderDaysBefore: 5,
    location: 'Khu Đồi Mộ Tổ Gò Rùa, Hà Nam',
    description: 'Toàn tộc tập trung viếng mộ tiền nhân, tu sửa lăng tẩm, dâng lễ tạ ơn trời đất tổ tiên phù hộ gia tộc bình an.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'evt_03',
    treeId: 'tree_nguyen_phuc_main',
    title: 'Ngày Giỗ Cụ Bà Trần Thị Đoan Trang',
    memberId: 'mem_gen1_02',
    memberName: 'Cụ Bà Trần Thị Đoan Trang (Đời 1)',
    eventType: 'death_anniversary',
    solarDate: '2026-05-18',
    lunarDate: '23/04 Âm Lịch',
    recurringYearly: true,
    reminderDaysBefore: 3,
    location: 'Từ Đường Nguyễn Tộc, Hà Nam',
    description: 'Lễ giỗ Cụ Bà chính thất, con cháu làm mâm cơm chay thanh tịnh dâng cúng tổ tiên.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'evt_04',
    treeId: 'tree_nguyen_phuc_main',
    title: 'Mừng Thọ 91 Tuổi GS. Nguyễn Phúc Tiến Thành',
    memberId: 'mem_gen2_02',
    memberName: 'GS. Nguyễn Phúc Tiến Thành (Đời 2)',
    eventType: 'birthday',
    solarDate: '2026-10-12',
    lunarDate: '16/09 Âm Lịch',
    recurringYearly: true,
    reminderDaysBefore: 7,
    location: 'Khu Đô thị Ecopark, Hưng Yên',
    description: 'Lễ mừng đại thọ bậc cao niên uy tín nhất của dòng họ hiện nay, con cháu chúc thọ hoa và khánh vàng.',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const SAMPLE_FAMILY_PROPOSALS: FamilyProposal[] = [
  {
    id: 'prop_01',
    treeId: 'tree_nguyen_phuc_main',
    targetMemberId: 'mem_gen4_01',
    targetMemberName: 'Nguyễn Phúc Minh Khang (Đời 4)',
    proposalType: 'edit_member',
    proposedByUid: 'user_con_chau_01',
    proposedByName: 'Nguyễn Thị Mai Phương',
    proposedByEmail: 'phuong.nguyen@law.vn',
    proposedData: {
      bio: 'Đích tôn đời 4 của chi Trưởng. Đang hoàn thành luận án Tiến sĩ AI tại Viện Công nghệ Tokyo và vừa được nhận giải thưởng Sáng tạo Trẻ Việt Nam 2026.',
      occupation: 'Tiến sĩ Kỹ thuật AI, Nghiên cứu viên cấp cao Tokyo Tech'
    },
    reason: 'Kính gửi Bác Trưởng họ: Anh Minh Khang vừa bảo vệ thành công luận án Tiến sĩ xuất sắc tại Nhật Bản, kính mong Bác duyệt cập nhật học vị vào phả hệ để con cháu noi gương ạ.',
    status: 'pending',
    createdAt: '2026-08-28T09:15:00Z'
  },
  {
    id: 'prop_02',
    treeId: 'tree_nguyen_phuc_main',
    targetMemberName: 'Bé Nguyễn Phúc Gia Hân (Đời 5)',
    proposalType: 'add_member',
    proposedByUid: 'user_con_chau_02',
    proposedByName: 'Nguyễn Phúc Hải Đăng',
    proposedByEmail: 'haidang.bio@vnu.edu.vn',
    proposedData: {
      fullName: 'Nguyễn Phúc Gia Hân',
      gender: 'female',
      generation: 5,
      branch: 'Chi Thứ Hai (Ất)',
      birthDate: '2026-05-15',
      lunarBirthDate: '29/03 Bính Ngọ',
      fatherId: 'mem_gen4_04',
      bio: 'Cháu gái thế hệ đời thứ 5 vừa chào đời khỏe mạnh tại Hà Nội.'
    },
    reason: 'Kính gửi Trưởng tộc: Gia đình cháu vừa đón thêm thành viên mới, kính xin được ghi danh bé vào sổ phả hệ tộc Nguyễn Phúc ạ.',
    status: 'approved',
    reviewNote: 'Đã chuẩn y ghi tên cháu Gia Hân vào phả hệ, chúc mừng gia đình!',
    reviewedBy: 'Nguyễn Phúc Trọng Nghĩa (Trưởng Tộc)',
    createdAt: '2026-06-01T14:30:00Z',
    reviewedAt: '2026-06-02T10:00:00Z'
  }
];

// Helper: Convert member list to Closure Table Entries
export function generateClosureTable(members: FamilyTreeMember[]): ClosureTableEntry[] {
  const memberMap = new Map<string, FamilyTreeMember>();
  members.forEach(m => memberMap.set(m.id, m));

  const entries: ClosureTableEntry[] = [];

  members.forEach(member => {
    // Self entry (depth = 0)
    entries.push({
      ancestorId: member.id,
      ancestorName: member.fullName,
      descendantId: member.id,
      descendantName: member.fullName,
      depth: 0
    });

    // Traverse upwards via fatherId or motherId
    let currentId = member.fatherId || member.motherId;
    let depth = 1;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const ancestor = memberMap.get(currentId);
      if (ancestor) {
        entries.push({
          ancestorId: ancestor.id,
          ancestorName: ancestor.fullName,
          descendantId: member.id,
          descendantName: member.fullName,
          depth: depth
        });
        currentId = ancestor.fatherId || ancestor.motherId;
        depth++;
      } else {
        break;
      }
    }
  });

  return entries;
}

// Helper: Convert member list to Neo4j Graph format (Nodes & Edges)
export function generateGraphData(members: FamilyTreeMember[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = members.map(m => ({
    id: m.id,
    label: m.fullName,
    subLabel: m.alternativeName || `Đời thứ ${m.generation}`,
    gender: m.gender,
    generation: m.generation,
    branch: m.branch,
    isDeceased: m.isDeceased,
    avatar: m.photoUrl
  }));

  const edges: GraphEdge[] = [];
  let edgeCounter = 1;

  members.forEach(m => {
    // Parent-child edges (from father to child)
    if (m.fatherId) {
      edges.push({
        id: `edge_${edgeCounter++}`,
        from: m.fatherId,
        to: m.id,
        type: m.adoptionType === 'adopted_in' ? 'adopted_child' : 'parent_child',
        label: m.adoptionType === 'adopted_in' ? 'Con nuôi' : 'Cha - Con'
      });
    } else if (m.motherId) {
      edges.push({
        id: `edge_${edgeCounter++}`,
        from: m.motherId,
        to: m.id,
        type: m.adoptionType === 'adopted_in' ? 'adopted_child' : 'parent_child',
        label: m.adoptionType === 'adopted_in' ? 'Con nuôi' : 'Mẹ - Con'
      });
    }

    // Spouse edges (undirected / paired)
    if (m.spouseIds && m.spouseIds.length > 0) {
      m.spouseIds.forEach(spouseId => {
        // avoid duplicate reciprocal edges
        if (m.id < spouseId) {
          edges.push({
            id: `edge_${edgeCounter++}`,
            from: m.id,
            to: spouseId,
            type: 'spouse',
            label: 'Vợ - Chồng'
          });
        }
      });
    }
  });

  return { nodes, edges };
}
