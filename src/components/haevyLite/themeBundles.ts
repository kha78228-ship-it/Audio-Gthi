import { HaevyLiteShopItem, HaevyLiteThemeBundle, HaevyLiteTopupPackage, HaevyLiteItemCategory } from '../../types';

export type { HaevyLiteShopItem, HaevyLiteThemeBundle, HaevyLiteItemCategory, HaevyLiteTopupPackage };

/**
 * Danh sách toàn bộ các vật phẩm bán trong Shop Haevy Lite theo 4 danh mục độc quyền:
 * 1. Khung hình Avatar (avatar_frame)
 * 2. Hoạt hình mở đầu khi vào tài khoản (entrance_animation)
 * 3. Viền chat trong Haevy Message (chat_border)
 * 4. Viền tên trước khi bấm vào phiên chat (name_border)
 *
 * Ghi chú: Đã loại bỏ hoàn toàn các vật phẩm combo cũ (cosmic, cyberpunk, aurora, phoenix) khỏi shop theo yêu cầu.
 */
export const HAEVY_LITE_SHOP_ITEMS: HaevyLiteShopItem[] = [
  // ==========================================
  // NHÓM 1: KHUNG HÌNH AVATAR (avatar_frame)
  // ==========================================
  {
    id: 'frame_dragon_gold',
    category: 'avatar_frame',
    name: 'Khung Rồng Vàng Hoàng Gia',
    tagline: 'Hào quang rồng vàng kim uy nghiêm, viền vàng 24K vương giả tỏa sáng',
    badge: '👑 HOÀNG GIA',
    priceLiteCoins: 150,
    icon: 'Crown',
    previewColor: 'from-amber-500 via-yellow-400 to-amber-600',
    frameRingClass: 'border-2 border-amber-400 ring-2 ring-amber-300/80 shadow-[0_0_20px_rgba(245,158,11,0.8)]',
    frameAuraClass: 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 opacity-80 animate-pulse blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_#f59e0b] border border-white animate-ping',
    frameDecorationEmoji: '👑',
    features: [
      'Hào quang rồng vàng kim 24K bao quanh avatar',
      'Hiệu ứng xoay tròn tinh anh ánh sáng hoàng tộc lộng lẫy',
      'Hiển thị đồng bộ tại Haevy Message, Trang chủ & Hồ sơ cá nhân'
    ]
  },
  {
    id: 'frame_cyber_neon',
    category: 'avatar_frame',
    name: 'Khung Cyber Matrix Laser',
    tagline: 'Mạch điện Neon lục lam tương lai, tia laser hologram quét dữ liệu',
    badge: '⚡ CYBERPUNK',
    priceLiteCoins: 160,
    icon: 'Zap',
    previewColor: 'from-cyan-400 via-teal-400 to-blue-600',
    frameRingClass: 'border-2 border-cyan-400 ring-2 ring-cyan-300/80 shadow-[0_0_22px_rgba(6,182,212,0.85)]',
    frameAuraClass: 'bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-500 opacity-85 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#06b6d4] border border-white',
    frameDecorationEmoji: '⚡',
    features: [
      'Viền mạch điện Neon công nghệ 2077 siêu sắc nét',
      'Vòng xoay laser số quét hào quang xung quanh avatar',
      'Huy hiệu Cyber độc quyền bên dưới góc avatar'
    ]
  },
  {
    id: 'frame_ice_crystal',
    category: 'avatar_frame',
    name: 'Khung Kim Cương Băng Tuyết',
    tagline: 'Tinh thể băng tuyết vĩnh cửu, pha lê xanh ngọc trong suốt lấp lánh',
    badge: '❄️ BĂNG GIÁ',
    priceLiteCoins: 140,
    icon: 'Snowflake',
    previewColor: 'from-sky-400 via-teal-300 to-indigo-500',
    frameRingClass: 'border-2 border-sky-300 ring-2 ring-teal-200/80 shadow-[0_0_20px_rgba(56,189,248,0.8)]',
    frameAuraClass: 'bg-gradient-to-tr from-sky-400 via-teal-200 to-indigo-400 opacity-75 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-sky-200 shadow-[0_0_10px_#38bdf8] border border-white',
    frameDecorationEmoji: '❄️',
    features: [
      'Tinh thể băng pha lê phát sáng thanh khiết',
      'Bông tuyết lấp lánh rơi nhẹ quanh viền avatar',
      'Hiệu ứng băng ngọc lộng lẫy tinh tế và sang trọng'
    ]
  },
  {
    id: 'frame_phoenix_fire',
    category: 'avatar_frame',
    name: 'Khung Ngọn Lửa Phượng Hoàng',
    tagline: 'Lửa đỏ cam rực cháy bất diệt, tàn tro ánh kim bốc lên kiêu hãnh',
    badge: '🔥 BẤT DIỆT',
    priceLiteCoins: 180,
    icon: 'Flame',
    previewColor: 'from-red-500 via-orange-500 to-amber-500',
    frameRingClass: 'border-2 border-orange-500 ring-2 ring-amber-400/80 shadow-[0_0_25px_rgba(249,115,22,0.9)]',
    frameAuraClass: 'bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 opacity-90 blur-md animate-pulse',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f97316] border border-white animate-bounce',
    frameDecorationEmoji: '🔥',
    features: [
      'Ngọn lửa phượng hoàng bùng cháy cuồn cuộn quanh khung viền',
      'Hào quang dung nham ánh đỏ cam thu hút mọi ánh nhìn',
      'Vệ tinh than hồng rực sáng quay quanh avatar'
    ]
  },
  {
    id: 'frame_cosmic_starlight',
    category: 'avatar_frame',
    name: 'Khung Thiên Hà Tinh Tú',
    tagline: 'Bụi sao tinh vân tím huyền ảo, 3 vệ tinh hành tinh quay quanh quỹ đạo',
    badge: '🌌 VŨ TRỤ',
    priceLiteCoins: 150,
    icon: 'Orbit',
    previewColor: 'from-purple-600 via-indigo-500 to-pink-500',
    frameRingClass: 'border-2 border-purple-400 ring-2 ring-pink-300/80 shadow-[0_0_22px_rgba(168,85,247,0.85)]',
    frameAuraClass: 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 opacity-80 blur-md animate-pulse',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-pink-300 shadow-[0_0_10px_#ec4899] border border-white',
    frameDecorationEmoji: '🌌',
    features: [
      '3 vệ tinh tinh cầu chuyển động quanh quỹ đạo avatar',
      'Hào quang tinh vân vũ trụ tím hồng mộng mơ',
      'Đồng bộ phong cách phi hành gia đẳng cấp'
    ]
  },
  {
    id: 'frame_sakura_blossom',
    category: 'avatar_frame',
    name: 'Khung Hoa Anh Đào Huyền Vũ',
    tagline: 'Cánh hoa anh đào phấn hồng nhẹ bay, viền ngọc lục bảo thanh nhã',
    badge: '🌸 DỊU ÊM',
    priceLiteCoins: 120,
    icon: 'Heart',
    previewColor: 'from-pink-400 via-rose-300 to-emerald-400',
    frameRingClass: 'border-2 border-pink-300 ring-2 ring-rose-200/80 shadow-[0_0_18px_rgba(244,114,182,0.8)]',
    frameAuraClass: 'bg-gradient-to-tr from-pink-400 via-rose-300 to-emerald-300 opacity-75 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-pink-200 shadow-[0_0_10px_#f472b6] border border-white',
    frameDecorationEmoji: '🌸',
    features: [
      'Cánh hoa đào hồng phất phới nhẹ nhàng bay lượn',
      'Ánh sáng ngọc bích viền mềm mại trang nhã',
      'Tạo cảm giác thư thái, thơ mộng khi nhắn tin'
    ]
  },
  {
    id: 'frame_holo_trooper',
    category: 'avatar_frame',
    name: 'Mũ Chiến Binh Vũ Trụ Hologram (Holo Trooper)',
    tagline: 'Mũ giáp chiến binh không gian trắng 3D Hologram đặt trên đế phát sáng ở góc avatar',
    badge: '🌌 VŨ TRỤ VIP',
    priceLiteCoins: 150,
    icon: 'Orbit',
    previewColor: 'from-cyan-400 via-sky-300 to-slate-200',
    frameRingClass: 'border-2 border-cyan-400 ring-2 ring-sky-300/80 shadow-[0_0_22px_rgba(6,182,212,0.85)]',
    frameAuraClass: 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 opacity-85 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#06b6d4] border border-white',
    frameDecorationEmoji: '🪖',
    features: [
      'Mũ chiến binh vũ trụ 3D Hologram gắn góc dưới avatar chân thực như ảnh mẫu',
      'Đế máy chiếu ánh sáng Laser Hologram phát tia sáng xanh vị lai',
      'Đồng bộ trên Avatar, danh bạ tin nhắn, và hồ sơ cá nhân'
    ]
  },

  // ==========================================
  // NHÓM 2: HOẠT HÌNH MỞ ĐẦU KHI VÀO TÀI KHOẢN (entrance_animation)
  // ==========================================
  {
    id: 'entrance_nebula_portal',
    category: 'entrance_animation',
    name: 'Cổng Không Gian Thiên Hà (Nebula Portal)',
    tagline: 'Cổng warp không gian xoay tròn hút mắt, mưa sao băng rực sáng bầu trời chào đón',
    badge: '🌌 VŨ TRỤ',
    priceLiteCoins: 200,
    icon: 'Orbit',
    previewColor: 'from-indigo-600 via-purple-600 to-pink-600',
    entranceTitle: 'Khai Mở Cổng Không Gian Thiên Hà',
    entranceSubtitle: 'Chiều không gian tinh cầu bừng sáng đón chào sự trở lại của bạn',
    entranceIcon: '🌌',
    entranceBackdropClass: 'from-indigo-950/90 via-purple-950/80 to-black',
    entranceGlowClass: 'shadow-[0_0_60px_rgba(147,51,234,0.5)] border-purple-500/50',
    features: [
      'Mưa sao băng xé toạc màn đêm vũ trụ khi mở tài khoản',
      'Vòng xoáy cổng Warp thiên hà huyền bí xoay chuyển 360 độ',
      'Tự động kích hoạt khi đăng nhập, chuyển tab hoặc mở trang cá nhân'
    ]
  },
  {
    id: 'entrance_thunder_zeus',
    category: 'entrance_animation',
    name: 'Lôi Thần Giáng Thế (Zeus Shockwave)',
    tagline: 'Sấm sét rạch ngang màn đêm, luồng xung kích điện trường bùng nổ uy quyền',
    badge: '⚡ SẤM SÉT',
    priceLiteCoins: 220,
    icon: 'Zap',
    previewColor: 'from-blue-600 via-indigo-500 to-amber-400',
    entranceTitle: 'Lôi Thần Điện Trường Giáng Thế',
    entranceSubtitle: 'Luồng điện vạn vôn bùng nổ xác lập vị thế chúa tể sấm sét tối thượng',
    entranceIcon: '⚡',
    entranceBackdropClass: 'from-blue-950/90 via-zinc-950/90 to-black',
    entranceGlowClass: 'shadow-[0_0_60px_rgba(59,130,246,0.6)] border-sky-400/60',
    features: [
      'Hiệu ứng tia chớp sấm sét quét ngang màn hình hoành tráng',
      'Làn sóng xung kích điện trường tím xanh bùng nổ dũng mãnh',
      'Hoạt ảnh giáng thế đầy uy quyền mỗi khi truy cập hồ sơ'
    ]
  },
  {
    id: 'entrance_phoenix_rebirth',
    category: 'entrance_animation',
    name: 'Cánh Phượng Hoàng Tái Sinh (Phoenix Rebirth)',
    tagline: 'Đôi cánh lửa phượng hoàng vỗ cánh tung tro tàn rực đỏ, tái sinh kiêu hãnh',
    badge: '🔥 TÁI SINH',
    priceLiteCoins: 250,
    icon: 'Flame',
    previewColor: 'from-red-600 via-orange-500 to-amber-400',
    entranceTitle: 'Hỏa Phượng Hoàng Vỗ Cánh Tái Sinh',
    entranceSubtitle: 'Ngọn lửa đam mê bất diệt bùng cháy thắp sáng toàn bộ tài khoản của bạn',
    entranceIcon: '🔥',
    entranceBackdropClass: 'from-red-950/90 via-orange-950/70 to-black',
    entranceGlowClass: 'shadow-[0_0_60px_rgba(249,115,22,0.6)] border-orange-500/60',
    features: [
      'Đôi cánh lửa phượng hoàng tung bay bốc cháy đỏ rực màn hình',
      'Mưa tro tàn ánh kim rơi rực rỡ và lộng lẫy',
      'Cảm giác nhiệt huyết, đam mê bùng cháy xua tan mỏi mệt'
    ]
  },
  {
    id: 'entrance_aurora_sky',
    category: 'entrance_animation',
    name: 'Cực Quang Bắc Cực Huyền Ảo (Aurora Horizon)',
    tagline: 'Dải lụa cực quang ngọc bích lượn sóng mềm mại, tuyết sao rơi lung linh',
    badge: '✨ HUYỀN BÍ',
    priceLiteCoins: 190,
    icon: 'Sparkles',
    previewColor: 'from-emerald-500 via-teal-400 to-sky-500',
    entranceTitle: 'Chân Trời Cực Quang Bắc Cực Khai Mở',
    entranceSubtitle: 'Dải lụa ngọc bích mềm mại ôm trọn không gian, xua tan mọi âu lo',
    entranceIcon: '✨',
    entranceBackdropClass: 'from-emerald-950/90 via-teal-950/70 to-black',
    entranceGlowClass: 'shadow-[0_0_60px_rgba(16,185,129,0.5)] border-emerald-400/50',
    features: [
      'Dải lụa phát quang xanh ngọc lướt qua màn hình cực kỳ êm dịu',
      'Bụi tuyết ánh sao rơi nhẹ nhàng thư giãn tâm hồn',
      'Gợi mở không gian tĩnh lặng, an yên tuyệt đối'
    ]
  },
  {
    id: 'entrance_cyber_matrix',
    category: 'entrance_animation',
    name: 'Ma Trận Hologram 3D (Cyber Grid 2077)',
    tagline: 'Lưới laser ma trận 3D quét toàn cảnh, giải mã dữ liệu sinh trắc học tối mật',
    badge: '🤖 MA TRẬN',
    priceLiteCoins: 210,
    icon: 'Cpu',
    previewColor: 'from-cyan-500 via-teal-400 to-fuchsia-500',
    entranceTitle: 'Kết Nối Lưới Ma Trận Hologram 3D',
    entranceSubtitle: 'Sinh trắc học đã xác thực thành công. Quyền truy cập cấp cao đã mở',
    entranceIcon: '🤖',
    entranceBackdropClass: 'from-cyan-950/90 via-zinc-950/90 to-black',
    entranceGlowClass: 'shadow-[0_0_60px_rgba(6,182,212,0.6)] border-cyan-400/60',
    features: [
      'Lưới laser ma trận số quét toàn bộ màn hình theo trục không gian 3D',
      'Hiệu ứng giải mã sinh trắc học công nghệ tương lai',
      'Tạo trải nghiệm mở tài khoản như một chuyên gia mật mã công nghệ'
    ]
  },

  // ==========================================
  // NHÓM 3: VIỀN CHAT TRONG HAEVY MESSAGE (chat_border)
  // ==========================================
  {
    id: 'chat_cyber_cyan',
    category: 'chat_border',
    name: 'Viền Neon Lục Lam Cyber',
    tagline: 'Bong bóng tin nhắn viền Neon Cyan phát sáng, nền đen công nghệ vị lai',
    badge: '⚡ NEON',
    priceLiteCoins: 120,
    icon: 'MessageSquare',
    previewColor: 'from-cyan-500 to-blue-600',
    bubbleBorderClass: 'border-2 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.45)]',
    bubbleBgClass: 'bg-cyan-950/40',
    bubbleShadowClass: 'shadow-[0_0_18px_rgba(6,182,212,0.3)]',
    bubbleTextGlowClass: 'text-cyan-100',
    features: [
      'Viền phát sáng Neon lục lam sắc nét trên từng bong bóng chat',
      'Đồng bộ trên tin nhắn đã gửi & tin nhắn nhận được trong Haevy Message',
      'Tạo điểm nhấn công nghệ cực chất trong phiên trò chuyện'
    ]
  },
  {
    id: 'chat_royal_gold',
    category: 'chat_border',
    name: 'Viền Vàng Kim Hoàng Gia',
    tagline: 'Viền ánh kim vàng 24K óng ả, hiệu ứng lấp lánh sang trọng đẳng cấp VIP',
    badge: '👑 HOÀNG KIM',
    priceLiteCoins: 150,
    icon: 'Crown',
    previewColor: 'from-amber-400 to-yellow-600',
    bubbleBorderClass: 'border-2 border-amber-400/90 shadow-[0_0_18px_rgba(245,158,11,0.5)]',
    bubbleBgClass: 'bg-amber-950/30',
    bubbleShadowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    bubbleTextGlowClass: 'text-amber-100',
    features: [
      'Viền vàng 24K quyền quý bọc lấy bong bóng tin nhắn',
      'Hiệu ứng ánh kim lấp lánh thu hút mọi ánh mắt trong cuộc hội thoại',
      'Biểu tượng của sự tinh tế và vị thế hàng đầu'
    ]
  },
  {
    id: 'chat_amethyst_purple',
    category: 'chat_border',
    name: 'Viền Thạch Anh Tím Huyền Bí',
    tagline: 'Viền tím thạch anh huyền diệu, làn khói tím mờ ảo bí ẩn quanh tin nhắn',
    badge: '🔮 THẠCH ANH',
    priceLiteCoins: 130,
    icon: 'Sparkles',
    previewColor: 'from-purple-500 to-indigo-600',
    bubbleBorderClass: 'border-2 border-purple-400/90 shadow-[0_0_18px_rgba(168,85,247,0.45)]',
    bubbleBgClass: 'bg-purple-950/40',
    bubbleShadowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    bubbleTextGlowClass: 'text-purple-100',
    features: [
      'Viền hào quang tím thạch anh mờ ảo lãng mạn',
      'Bong bóng chat phát sáng êm dịu, không gây chói mắt',
      'Rất thích hợp cho các cuộc trò chuyện tâm sự sâu sắc'
    ]
  },
  {
    id: 'chat_blazing_magma',
    category: 'chat_border',
    name: 'Viền Lửa Dung Nham Rực Cháy',
    tagline: 'Viền đỏ cam bùng cháy năng lượng nhiệt huyết, ngọn lửa sống động',
    badge: '🔥 DUNG NHAM',
    priceLiteCoins: 140,
    icon: 'Flame',
    previewColor: 'from-red-500 to-orange-500',
    bubbleBorderClass: 'border-2 border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.55)]',
    bubbleBgClass: 'bg-orange-950/40',
    bubbleShadowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
    bubbleTextGlowClass: 'text-orange-100',
    features: [
      'Khung viền đỏ cam nhiệt huyết bốc lửa',
      'Tôn vinh cá tính mạnh mẽ, dứt khoát trong từng câu chữ',
      'Hiệu ứng ngọn lửa phát sáng rực rỡ'
    ]
  },
  {
    id: 'chat_glacial_ice',
    category: 'chat_border',
    name: 'Viền Băng Giá Tuyết Trắng',
    tagline: 'Viền xanh ngọc băng tuyết trong suốt, tinh thể pha lê tuyết phủ trong veo',
    badge: '❄️ PHA LÊ',
    priceLiteCoins: 120,
    icon: 'Snowflake',
    previewColor: 'from-sky-400 to-teal-400',
    bubbleBorderClass: 'border-2 border-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.45)]',
    bubbleBgClass: 'bg-sky-950/30',
    bubbleShadowClass: 'shadow-[0_0_18px_rgba(56,189,248,0.3)]',
    bubbleTextGlowClass: 'text-sky-100',
    features: [
      'Viền xanh ngọc băng tuyết tinh khiết mát mắt',
      'Ánh sáng pha lê thanh tao nhẹ nhàng',
      'Tạo cảm giác êm dịu dễ đọc cho các đoạn tin dài'
    ]
  },

  // ==========================================
  // NHÓM 4: VIỀN TÊN TRƯỚC KHI BẤM VÀO PHIÊN CHAT (name_border)
  // ==========================================
  {
    id: 'name_royal_gold',
    category: 'name_border',
    name: 'Thẻ Viền Kim Tuyến Vàng Hoàng Gia',
    tagline: 'Khung viền mạ vàng tinh xảo bọc lấy tên trong danh sách, huy hiệu vương miện hoàng gia',
    badge: '👑 HOÀNG KIM',
    priceLiteCoins: 130,
    icon: 'Crown',
    previewColor: 'from-amber-400 to-yellow-500',
    nameplateBorderClass: 'border border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
    nameplateBgClass: 'bg-gradient-to-r from-amber-950/70 via-yellow-950/40 to-zinc-900',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-black',
    nameplateIcon: '👑',
    features: [
      'Khung viền kim tuyến bọc quanh tên trong danh sách hội thoại trước khi bấm vào chat',
      'Huy hiệu vương miện vàng khẳng định đẳng cấp cao quý',
      'Tên phát sáng nổi bật nhất trong danh bạ tin nhắn'
    ]
  },
  {
    id: 'name_cyber_cyan',
    category: 'name_border',
    name: 'Thẻ Viền Cyberpunk Băng Lam',
    tagline: 'Khung thẻ vát góc laser neon lục lam tương lai, hiệu ứng mạch điện quét ngang tên',
    badge: '⚡ CYBER',
    priceLiteCoins: 140,
    icon: 'Zap',
    previewColor: 'from-cyan-400 to-blue-500',
    nameplateBorderClass: 'border border-cyan-400/80 shadow-[0_0_14px_rgba(6,182,212,0.55)]',
    nameplateBgClass: 'bg-gradient-to-r from-cyan-950/70 via-blue-950/40 to-zinc-900',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-300 to-blue-300 font-black',
    nameplateIcon: '⚡',
    features: [
      'Khung viền sci-fi công nghệ tương lai hiển thị sắc nét trong danh sách',
      'Đường viền sắc nét nhấp nháy ánh sáng điện toán',
      'Dễ dàng nhận diện phong cách công nghệ nổi trội'
    ]
  },
  {
    id: 'name_galactic_stars',
    category: 'name_border',
    name: 'Thẻ Viền Ánh Sao Tinh Tú',
    tagline: 'Khung viền ánh sao tím hồng lấp lánh, huy hiệu ngôi sao chổi băng qua',
    badge: '🌌 TINH TÚ',
    priceLiteCoins: 130,
    icon: 'Orbit',
    previewColor: 'from-purple-400 to-pink-500',
    nameplateBorderClass: 'border border-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.55)]',
    nameplateBgClass: 'bg-gradient-to-r from-purple-950/70 via-pink-950/40 to-zinc-900',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-sky-200 font-black',
    nameplateIcon: '🌌',
    features: [
      'Khung viền tím ngân hà tỏa sáng dịu dàng quanh tên bạn bè',
      'Ngôi sao băng mini lấp lánh bên cạnh tên trong danh sách chat',
      'Tôn vinh vẻ đẹp vũ trụ thơ mộng và cuốn hút'
    ]
  },
  {
    id: 'name_frosted_crystal',
    category: 'name_border',
    name: 'Thẻ Viền Pha Lê Băng Tuyết',
    tagline: 'Khung viền pha lê xanh băng giá trong suốt, viền sương lạnh thanh tao',
    badge: '❄️ PHA LÊ',
    priceLiteCoins: 120,
    icon: 'Snowflake',
    previewColor: 'from-sky-300 to-teal-400',
    nameplateBorderClass: 'border border-sky-300/80 shadow-[0_0_14px_rgba(56,189,248,0.55)]',
    nameplateBgClass: 'bg-gradient-to-r from-sky-950/70 via-teal-950/40 to-zinc-900',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-teal-200 to-indigo-200 font-black',
    nameplateIcon: '❄️',
    features: [
      'Viền băng tinh khiết bọc lấy tên người dùng trong danh sách hội thoại',
      'Mang lại cảm giác thanh lịch, tao nhã và quý phái',
      'Huy hiệu bông tuyết băng giá tinh xảo bên cạnh tên'
    ]
  },
  {
    id: 'name_blazing_flame',
    category: 'name_border',
    name: 'Thẻ Viền Hỏa Diệm Kiêu Hùng',
    tagline: 'Khung viền lửa đỏ rực bốc cháy, năng lượng rực sáng nổi bật trong danh sách chat',
    badge: '🔥 HỎA DIỆM',
    priceLiteCoins: 140,
    icon: 'Flame',
    previewColor: 'from-orange-500 to-red-600',
    nameplateBorderClass: 'border border-orange-500/80 shadow-[0_0_14px_rgba(249,115,22,0.55)]',
    nameplateBgClass: 'bg-gradient-to-r from-orange-950/70 via-red-950/40 to-zinc-900',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 font-black',
    nameplateIcon: '🔥',
    features: [
      'Viền lửa rực rỡ bao quanh tên tạo ấn tượng mạnh mẽ',
      'Huy hiệu ngọn lửa bất diệt đầy nhiệt huyết',
      'Tạo sự chú ý tức thì trước khi đối phương bấm vào cuộc trò chuyện'
    ]
  },
  {
    id: 'name_cosmic_nebula',
    category: 'name_border',
    name: 'Bảng Viền Vũ Trụ & Font Gothic Băng Lam',
    tagline: 'Bảng viền không gian tinh vân rực rỡ và phông chữ Gothic Băng Lam huyền ảo trước khi vào chat',
    badge: '🌌 VŨ TRỤ VIP',
    priceLiteCoins: 150,
    icon: 'Sparkles',
    previewColor: 'from-sky-400 via-indigo-500 to-purple-600',
    nameplateBorderClass: 'border border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.7)]',
    nameplateBgClass: 'bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-slate-950',
    nameplateTextClass: 'font-serif text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-300 to-blue-300 font-black',
    nameplateIcon: '🌌',
    features: [
      'Toàn bộ khung hàng hội thoại chuyển thành Bảng Viền Vũ Trụ Tinh Cầu như ảnh mẫu',
      'Phông chữ Gothic Blackletter Băng Lam 3D tỏa hào quang cực sắc nét',
      'Mở khóa xem trước Hồ Sơ Vũ Trụ (Hành tinh & Mũ Chiến Binh) cho mọi người'
    ]
  },

  // ==========================================
  // NHÓM 5: PHÔNG CHỮ TÊN ĐỘC BẢN (name_font)
  // ==========================================
  {
    id: 'font_gothic_fraktur',
    category: 'name_font',
    name: 'Gothic Fraktur Băng Lam',
    tagline: 'Phông chữ Gothic trung cổ huyền bí, vệt sáng băng lam tuyết lạnh cổ điển',
    badge: '👑 GOTHIC VIP',
    priceLiteCoins: 120,
    icon: 'Sparkles',
    previewColor: 'from-cyan-400 via-sky-300 to-indigo-400',
    fontFamilyName: "'UnifrakturCook', 'Pirata One', cursive, serif",
    fontCssStyle: "font-family: 'UnifrakturCook', 'Pirata One', cursive, serif; letter-spacing: 0.05em;",
    fontPreviewText: 'Ha Khai 5429',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-300 to-indigo-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    features: [
      'Phông chữ Gothic Blackletter cổ điển uy nghi đúng chuẩn hình ảnh mẫu',
      'Đổ bóng ánh sáng Băng Lam huyền bí tỏa sáng giữa danh bạ',
      'Áp dụng đồng bộ trên bảng tên trước khi chat, header phòng chat và hồ sơ'
    ]
  },
  {
    id: 'font_imperial_roman',
    category: 'name_font',
    name: 'Hoàng Gia La Mã Đế Chế (Imperial Roman)',
    tagline: 'Chữ chạm khắc đền thờ La Mã tôn nghiêm, mạ viền vàng kim 24K quyền quý',
    badge: '🏛️ HOÀNG GIA',
    priceLiteCoins: 130,
    icon: 'Crown',
    previewColor: 'from-amber-300 via-yellow-400 to-amber-600',
    fontFamilyName: "'Cinzel Decorative', Georgia, serif",
    fontCssStyle: "font-family: 'Cinzel Decorative', Georgia, serif; font-weight: 900; letter-spacing: 0.08em;",
    fontPreviewText: 'EMPEROR HAEVY',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    features: [
      'Đường nét La Mã điêu khắc sắc sảo thể hiện đẳng cấp đế vương',
      'Hào quang vàng kim 24K hoàng gia lộng lẫy',
      'Giúp tên bạn trở thành tâm điểm của sự trang trọng và kính nể'
    ]
  },
  {
    id: 'font_cyber_orbitron',
    category: 'name_font',
    name: 'Cyberpunk Vị Lai (Orbitron Neon)',
    tagline: 'Phông chữ viễn tưởng khoa học 2077, nét góc cạnh số hóa phát quang Laser',
    badge: '⚡ VỊ LAI',
    priceLiteCoins: 120,
    icon: 'Cpu',
    previewColor: 'from-cyan-400 via-teal-300 to-fuchsia-500',
    fontFamilyName: "'Orbitron', monospace, sans-serif",
    fontCssStyle: "font-family: 'Orbitron', monospace, sans-serif; font-weight: 800; letter-spacing: 0.12em;",
    fontPreviewText: 'CYBER_X_2077',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]',
    features: [
      'Góc cạnh điện tử kỹ thuật số tương lai cực kỳ hiện đại',
      'Hiệu ứng phát sáng Laser Matrix công nghệ cao',
      'Định hình phong cách Hacker & Nhà du hành không gian số'
    ]
  },
  {
    id: 'font_medieval_magic',
    category: 'name_font',
    name: 'Phép Thuật Cổ Thư (Medieval Arcane)',
    tagline: 'Chữ viết từ cổ thư phép thuật thần bí, nét bút lông pháp sư huyền ảo',
    badge: '🔮 HUYỀN THUẬT',
    priceLiteCoins: 110,
    icon: 'BookOpen',
    previewColor: 'from-purple-400 via-fuchsia-300 to-pink-500',
    fontFamilyName: "'MedievalSharp', cursive, serif",
    fontCssStyle: "font-family: 'MedievalSharp', cursive, serif; letter-spacing: 0.04em;",
    fontPreviewText: 'Arcane Mage 99',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-fuchsia-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    features: [
      'Tái hiện nét chữ trong những cuốn sách cổ thuật ma pháp bí ẩn',
      'Khói tím thạch anh huyền diệu tôn lên cá tính nghệ thuật',
      'Thích hợp cho người yêu thích sự huyền bí, chiêm tinh và tâm linh'
    ]
  },
  {
    id: 'font_calligraphy_vibes',
    category: 'name_font',
    name: 'Thư Viết Tay Quý Tộc (Great Vibes)',
    tagline: 'Chữ ký viết tay lãng mạn bay bổng, nét mực quý tộc uốn lượn say đắm',
    badge: '✨ LÃNG MẠN',
    priceLiteCoins: 110,
    icon: 'Feather',
    previewColor: 'from-rose-300 via-pink-300 to-purple-400',
    fontFamilyName: "'Great Vibes', cursive, serif",
    fontCssStyle: "font-family: 'Great Vibes', cursive, serif; font-size: 1.15em; letter-spacing: 0.03em;",
    fontPreviewText: 'Princess Haevy',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]',
    features: [
      'Nét chữ ký quý tộc Pháp uốn lượn điệu đà, quý phái',
      'Ánh sáng hồng ngọt ngào và thơ mộng lan tỏa',
      'Làm cho tên của bạn mềm mại, thanh thoát và cuốn hút'
    ]
  },
  {
    id: 'font_syne_couture',
    category: 'name_font',
    name: 'Thời Trang Haute Couture (Syne Fashion)',
    tagline: 'Phông chữ đồ họa hiện đại xa xỉ, phong cách bìa tạp chí thời trang phá cách',
    badge: '💎 HAUTE COUTURE',
    priceLiteCoins: 125,
    icon: 'Gem',
    previewColor: 'from-zinc-100 via-stone-200 to-emerald-400',
    fontFamilyName: "'Syne', sans-serif",
    fontCssStyle: "font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: 0.05em;",
    fontPreviewText: 'AVANT GARDE',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-emerald-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]',
    features: [
      'Phong cách đồ họa tối giản hiện đại của các thương hiệu thời trang cao cấp',
      'Đường nét dày dặn, ấn tượng và cực kỳ thời thượng',
      'Dành cho những người dẫn đầu xu hướng và gu thẩm mỹ đỉnh cao'
    ]
  },
  {
    id: 'font_retro_pixel',
    category: 'name_font',
    name: 'Retro Pixel Arcade (8-Bit Gamer)',
    tagline: 'Phông chữ máy chơi game thùng 1980s, nét pixel hoài niệm cực chất',
    badge: '👾 8-BIT GAMER',
    priceLiteCoins: 100,
    icon: 'Gamepad2',
    previewColor: 'from-green-400 via-lime-300 to-emerald-500',
    fontFamilyName: "'Press Start 2P', monospace",
    fontCssStyle: "font-family: 'Press Start 2P', monospace; font-size: 0.8em; letter-spacing: 0.02em;",
    fontPreviewText: 'PLAYER ONE',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-lime-200 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]',
    features: [
      'Chuẩn nét Pixel 8-Bit máy điện tử gắp thú thế hệ hoàng kim',
      'Ánh sáng xanh ngọc lục bảo gameboy hoài niệm',
      'Biến bạn thành game thủ kỳ cựu nổi bật trong mọi phòng chat'
    ]
  },
  {
    id: 'font_metal_rock',
    category: 'name_font',
    name: 'Heavy Rock Quái Thú (Creepster Metal)',
    tagline: 'Phông chữ rocker gầm thét dữ dội, ma mị phá cách không khoan nhượng',
    badge: '🎸 ROCK METAL',
    priceLiteCoins: 115,
    icon: 'Flame',
    previewColor: 'from-red-500 via-orange-400 to-yellow-500',
    fontFamilyName: "'Creepster', cursive, display",
    fontCssStyle: "font-family: 'Creepster', cursive, display; letter-spacing: 0.06em;",
    fontPreviewText: 'ROCKSTAR HAEVY',
    fontGlowClass: 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]',
    features: [
      'Nét chữ chảy hoang dã dữ dội, đậm chất sân khấu nhạc Rock',
      'Hào quang lửa dung nham rực cháy bao quanh từng nét chữ',
      'Khẳng định cá tính mạnh mẽ, không hòa tan giữa đám đông'
    ]
  },

  // ==========================================
  // NHÓM BỔ SUNG: KHUNG AVATAR ĐẶC BIỆT MỚI
  // ==========================================
  {
    id: 'frame_black_hole',
    category: 'avatar_frame',
    name: 'Khung Hố Đen Hư Vô & Quasar',
    tagline: 'Lực hấp dẫn hố đen vũ trụ hút ánh sáng, tia chuẩn tinh Quasar đỏ rực bùng nổ',
    badge: '🌌 HƯ VÔ SIÊU CẤP',
    priceLiteCoins: 200,
    icon: 'Orbit',
    previewColor: 'from-purple-900 via-black to-red-600',
    frameRingClass: 'border-2 border-red-500 ring-2 ring-purple-600/90 shadow-[0_0_25px_rgba(239,68,68,0.9)]',
    frameAuraClass: 'bg-gradient-to-tr from-black via-purple-900 to-red-600 opacity-90 blur-md animate-pulse',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] border border-white',
    frameDecorationEmoji: '🕳️',
    features: [
      'Vòng xoáy chân không vũ trụ hút mọi ánh nhìn với sắc đỏ tím ma mị',
      'Tia Quasar siêu năng lượng phát sáng rực rỡ quanh viền',
      'Hiệu ứng bí ẩn, đẳng cấp tối thượng cho những tâm hồn thích sự sâu thẳm'
    ]
  },
  {
    id: 'frame_jade_lotus',
    category: 'avatar_frame',
    name: 'Khung Sen Ngọc Bích Thần Thoại',
    tagline: 'Cánh hoa sen ngọc bích phát sáng thanh tịnh, sương mai lấp lánh như ngọc thiêng',
    badge: '🪷 TIÊN CẢNH',
    priceLiteCoins: 160,
    icon: 'Sparkles',
    previewColor: 'from-emerald-400 via-teal-300 to-green-600',
    frameRingClass: 'border-2 border-emerald-400 ring-2 ring-teal-200/80 shadow-[0_0_20px_rgba(16,185,129,0.85)]',
    frameAuraClass: 'bg-gradient-to-tr from-emerald-500 via-teal-300 to-green-600 opacity-80 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-emerald-200 shadow-[0_0_10px_#10b981] border border-white',
    frameDecorationEmoji: '🪷',
    features: [
      'Cánh sen ngọc bích tỏa hào quang bình yên, tịnh tâm',
      'Hạt sương pha lê lấp lánh phản chiếu ánh sáng thần tiên',
      'Cực kỳ hòa hợp khi nghe nhạc thiền Solfeggio & tâm linh'
    ]
  },
  {
    id: 'frame_electric_storm',
    category: 'avatar_frame',
    name: 'Khung Lôi Điện Tử Quang Sấm Sét',
    tagline: 'Bão sét tím điện quang giật liên hồi, nguồn điện triệu Volt bao quanh avatar',
    badge: '⚡ SẤM SÉT',
    priceLiteCoins: 175,
    icon: 'Zap',
    previewColor: 'from-violet-600 via-purple-500 to-blue-500',
    frameRingClass: 'border-2 border-violet-400 ring-2 ring-purple-300/80 shadow-[0_0_22px_rgba(139,92,246,0.9)]',
    frameAuraClass: 'bg-gradient-to-tr from-violet-600 via-indigo-500 to-blue-600 opacity-85 blur-md animate-pulse',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-violet-300 shadow-[0_0_12px_#8b5cf6] border border-white',
    frameDecorationEmoji: '⚡',
    features: [
      'Tia sét tím chớp nhoáng tạo cảm giác bùng nổ năng lượng',
      'Trường điện từ cao tần kích hoạt âm thanh sống động',
      'Định hình phong cách game thủ và nhà sản xuất âm nhạc điện tử'
    ]
  },
  {
    id: 'frame_mecha_gundam',
    category: 'avatar_frame',
    name: 'Khung Mecha Gundam Thần Thánh',
    tagline: 'Giáp cơ giới Mecha siêu chiến binh tương lai, đèn neon đa giác đa sắc',
    badge: '🤖 MECHA 2077',
    priceLiteCoins: 190,
    icon: 'ShieldCheck',
    previewColor: 'from-blue-600 via-red-500 to-amber-400',
    frameRingClass: 'border-2 border-sky-400 ring-2 ring-blue-500/80 shadow-[0_0_22px_rgba(14,165,233,0.9)]',
    frameAuraClass: 'bg-gradient-to-tr from-sky-600 via-blue-700 to-red-500 opacity-80 blur-md',
    frameOrbClass: 'w-2.5 h-2.5 rounded-full bg-sky-300 shadow-[0_0_12px_#0284c7] border border-white',
    frameDecorationEmoji: '🤖',
    features: [
      'Khung giáp hợp kim Titanium tương lai bao bọc avatar',
      'Mắt cảm biến laser quét đa phổ góc nhìn 360 độ',
      'Thể hiện bản lĩnh công nghệ dẫn đầu thời đại'
    ]
  },

  // ==========================================
  // NHÓM BỔ SUNG: HOẠT ẢNH MỞ ĐẦU MỚI
  // ==========================================
  {
    id: 'entrance_supernova_burst',
    category: 'entrance_animation',
    name: 'Vụ Nổ Siêu Tân Tinh (Supernova)',
    tagline: 'Cổng không gian bùng nổ ánh sáng tinh cầu giải phóng năng lượng vô tận',
    badge: '💥 SIÊU TÂN TINH',
    priceLiteCoins: 280,
    icon: 'Flame',
    previewColor: 'from-amber-500 via-red-600 to-purple-700',
    entranceTitle: 'VỤ NỔ SIÊU TÂN TINH HAEVY',
    entranceSubtitle: 'Năng lượng vũ trụ cực đại hội tụ chào đón nhà du hành',
    entranceIcon: '💥',
    entranceBackdropClass: 'bg-gradient-to-tr from-amber-600/30 via-red-900/30 to-purple-950/30',
    entranceGlowClass: 'shadow-[0_0_40px_rgba(245,158,11,0.6)]',
    features: [
      'Chớp sáng Supernova rực rỡ toàn màn hình khi mở hồ sơ',
      'Hiệu ứng chùm sao nổ tung như một bữa tiệc thị giác',
      'Âm vang vũ trụ hùng tráng kích thích giác quan'
    ]
  },
  {
    id: 'entrance_golden_dragon',
    category: 'entrance_animation',
    name: 'Kim Long Xuất Hải Vàng 24K',
    tagline: 'Thần rồng hoàng kim cuộn mây giáng thế, uy linh phủ rợp muôn nơi',
    badge: '🐉 HOÀNG ĐẾ',
    priceLiteCoins: 300,
    icon: 'Crown',
    previewColor: 'from-amber-400 via-yellow-300 to-amber-600',
    entranceTitle: 'KIM LONG XUẤT HẢI TRIỀU NGHI',
    entranceSubtitle: 'Rồng vàng hoàng tộc xuất hiện ban phước lành và may mắn',
    entranceIcon: '🐉',
    entranceBackdropClass: 'bg-gradient-to-tr from-amber-600/30 via-yellow-700/30 to-zinc-950/40',
    entranceGlowClass: 'shadow-[0_0_45px_rgba(245,158,11,0.8)]',
    features: [
      'Rồng vàng hoàng gia bay lượn ngút trời với tiếng chuông cổ vang dội',
      'Cánh hoa sen vàng rơi lả tả trên nền trời',
      'Đẳng cấp vương giả không ai có thể sánh kịp'
    ]
  },

  // ==========================================
  // NHÓM BỔ SUNG: VIỀN CHAT MESSAGE MỚI
  // ==========================================
  {
    id: 'chat_holo_glass',
    category: 'chat_border',
    name: 'Viền Kính Thủy Tinh Hologram 3D',
    tagline: 'Kính thủy tinh siêu trong suốt mờ ảo, phản chiếu tán sắc 7 màu tương lai',
    badge: '🔮 HOLO GLASS',
    priceLiteCoins: 140,
    icon: 'Sparkles',
    previewColor: 'from-cyan-300 via-sky-400 to-indigo-400',
    bubbleBgClass: 'bg-white/10 backdrop-blur-xl',
    bubbleBorderClass: 'border border-cyan-300/60 shadow-[0_0_18px_rgba(6,182,212,0.4)]',
    bubbleShadowClass: 'shadow-lg shadow-cyan-500/20',
    bubbleTextGlowClass: 'text-cyan-100 font-medium',
    features: [
      'Hiệu ứng kính mờ thời thượng như giao diện Vision Pro',
      'Tán sắc ánh cầu vồng khi cuộn tin nhắn',
      'Đọc chữ siêu êm mắt trong mọi điều kiện ánh sáng'
    ]
  },
  {
    id: 'chat_dark_gothic',
    category: 'chat_border',
    name: 'Viền Khói Đêm Huyền Bí Dark Gothic',
    tagline: 'Làn khói tím đen mờ ảo cuộn tròn bao bọc dòng tin nhắn',
    badge: '🦇 GOTHIC DARK',
    priceLiteCoins: 135,
    icon: 'Moon',
    previewColor: 'from-purple-950 via-zinc-900 to-purple-800',
    bubbleBgClass: 'bg-zinc-950/90',
    bubbleBorderClass: 'border border-purple-500/60 shadow-[0_0_18px_rgba(168,85,247,0.4)]',
    bubbleShadowClass: 'shadow-lg shadow-purple-950/50',
    bubbleTextGlowClass: 'text-purple-200 font-medium',
    features: [
      'Viền khói ma mị tím khói huyền ảo',
      'Tạo sự bí ẩn và thu hút đặc biệt trong các cuộc trò chuyện',
      'Khẳng định gu thẩm mỹ khác biệt'
    ]
  },

  // ==========================================
  // NHÓM BỔ SUNG: VIỀN TÊN PHIÊN CHAT MỚI
  // ==========================================
  {
    id: 'name_prismatic_diamond',
    category: 'name_border',
    name: 'Viền Tên Kim Cương Đa Sắc Prism',
    tagline: 'Kim cương cắt giác giác cạnh hoàn hảo, tán sắc ánh sáng lấp lánh rực rỡ',
    badge: '💎 KIM CƯƠNG',
    priceLiteCoins: 110,
    icon: 'Sparkles',
    previewColor: 'from-sky-300 via-purple-300 to-pink-300',
    nameplateBorderClass: 'border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.7)] ring-1 ring-cyan-200/50',
    nameplateBgClass: 'bg-gradient-to-r from-sky-950/70 via-purple-950/70 to-pink-950/70 backdrop-blur-md',
    nameplateTextClass: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-pink-200 to-amber-200 font-black',
    nameplateIcon: '💎',
    features: [
      'Viền lấp lánh như viên kim cương nước D hoàn mỹ',
      'Chữ đổi màu đa sắc khi lướt qua danh sách tin nhắn',
      'Định danh nổi bật hàng đầu danh bạ'
    ]
  },
  {
    id: 'name_dark_obsidian',
    category: 'name_border',
    name: 'Viền Tên Hắc Diện Thạch Obsidian Ruby',
    tagline: 'Đá đen Obsidian ngàn năm viền máu đỏ Ruby uy lực bất khả xâm phạm',
    badge: '🗡️ SÁT THỦ',
    priceLiteCoins: 105,
    icon: 'Flame',
    previewColor: 'from-black via-zinc-900 to-red-600',
    nameplateBorderClass: 'border-red-500/80 shadow-[0_0_16px_rgba(239,68,68,0.7)] ring-1 ring-red-400/40',
    nameplateBgClass: 'bg-zinc-950/95',
    nameplateTextClass: 'text-red-400 font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    nameplateIcon: '🗡️',
    features: [
      'Đá đen bóng bẩy viền ánh đỏ máu lạnh lùng',
      'Cực kỳ ấn tượng cho các nickname phong cách hắc ám',
      'Độc nhất vô nhị trong cộng đồng Haevy'
    ]
  },

  // ==========================================
  // NHÓM 6: SÓNG ÂM VISUALIZER MÁY NGHE NHẠC (player_wave)
  // ==========================================
  {
    id: 'wave_cyber_cyan',
    category: 'player_wave',
    name: 'Sóng Âm Neon Cyber Matrix',
    tagline: 'Cột sóng âm thanh Laser xanh lục lam nhấp nhô theo từng nhịp bass Hi-Fi',
    badge: '⚡ CYBER BEAT',
    priceLiteCoins: 120,
    icon: 'Zap',
    previewColor: 'from-cyan-400 via-teal-300 to-blue-500',
    waveGradient: 'from-cyan-400 via-teal-300 to-blue-500',
    waveGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.8)]',
    waveStyle: 'cyber',
    waveBarCount: 32,
    features: [
      'Giao diện thanh sóng âm visualizer công nghệ tương lai',
      'Phản hồi tần số mượt mà theo từng beat nhạc lossless',
      'Đồng bộ ngay trên thanh nghe nhạc dưới đáy màn hình'
    ]
  },
  {
    id: 'wave_royal_gold',
    category: 'player_wave',
    name: 'Sóng Âm Hoàng Kim 24K',
    tagline: 'Dải sóng âm vàng rực quý tộc, tia ánh kim lung linh như dàn nhạc thính phòng',
    badge: '👑 VÀNG 24K',
    priceLiteCoins: 150,
    icon: 'Crown',
    previewColor: 'from-amber-400 via-yellow-300 to-amber-600',
    waveGradient: 'from-amber-400 via-yellow-300 to-amber-600',
    waveGlow: 'shadow-[0_0_18px_rgba(245,158,11,0.85)]',
    waveStyle: 'gold',
    waveBarCount: 32,
    features: [
      'Màu vàng kim 24K lộng lẫy đẳng cấp thượng lưu',
      'Hiệu ứng phát sáng vương giả khi nghe nhạc giao hưởng & vocal',
      'Nâng tầm trải nghiệm nghe nhạc lên hàng tuyệt phẩm'
    ]
  },
  {
    id: 'wave_aurora_sky',
    category: 'player_wave',
    name: 'Sóng Âm Cực Quang Bắc Cực',
    tagline: 'Dải lụa cực quang xanh ngọc lục bảo uốn lượn huyền diệu theo giai điệu',
    badge: '🌌 CỰC QUANG',
    priceLiteCoins: 130,
    icon: 'Orbit',
    previewColor: 'from-emerald-400 via-teal-300 to-purple-400',
    waveGradient: 'from-emerald-400 via-teal-300 to-purple-400',
    waveGlow: 'shadow-[0_0_16px_rgba(16,185,129,0.8)]',
    waveStyle: 'aurora',
    waveBarCount: 32,
    features: [
      'Hòa trộn êm ái giữa xanh ngọc bích và tím tinh vân',
      'Chuyển động sóng mềm mại mang lại cảm giác thư thái tuyệt đối',
      'Thích hợp nhất với các bản nhạc Lofi, Acoustic và Deep Sleep'
    ]
  },
  {
    id: 'wave_phoenix_fire',
    category: 'player_wave',
    name: 'Sóng Âm Lửa Phượng Hoàng',
    tagline: 'Ngọn lửa dung nham bùng cháy theo nhịp điệu EDM & Rock sôi động',
    badge: '🔥 HỎA DIỆM',
    priceLiteCoins: 140,
    icon: 'Flame',
    previewColor: 'from-red-500 via-orange-400 to-amber-400',
    waveGradient: 'from-red-500 via-orange-400 to-amber-400',
    waveGlow: 'shadow-[0_0_18px_rgba(239,68,68,0.85)]',
    waveStyle: 'fire',
    waveBarCount: 32,
    features: [
      'Nhiệt huyết bốc cháy cuồn cuộn theo từng tiếng trống kick & bass',
      'Tia lửa than hồng bung tỏa cực kỳ sống động',
      'Bùng nổ năng lượng cho các buổi tập gym hoặc tiệc tùng'
    ]
  },
  {
    id: 'wave_glacial_ice',
    category: 'player_wave',
    name: 'Sóng Âm Pha Lê Băng Tuyết',
    tagline: 'Những cột băng trong suốt phản chiếu âm thanh trong trẻo thuần khiết',
    badge: '❄️ BĂNG PHA LÊ',
    priceLiteCoins: 110,
    icon: 'Snowflake',
    previewColor: 'from-sky-300 via-indigo-300 to-teal-300',
    waveGradient: 'from-sky-300 via-indigo-300 to-teal-300',
    waveGlow: 'shadow-[0_0_14px_rgba(56,189,248,0.8)]',
    waveStyle: 'ice',
    waveBarCount: 32,
    features: [
      'Cột sóng như những tinh thể pha lê lạnh giá',
      'Làm dịu mọi giác quan, tái tạo tâm hồn sau ngày dài căng thẳng',
      'Âm thanh trong trẻo, tách bạch từng nốt nhạc'
    ]
  },

  // ==========================================
  // NHÓM 7: DANH HIỆU HỆ SINH THÁI HUYỀN THOẠI (title_badge)
  // ==========================================
  {
    id: 'title_cosmic_master',
    category: 'title_badge',
    name: 'Danh Hiệu: 🌌 BẬC THẦY VŨ TRỤ',
    tagline: 'Huy hiệu danh giá dành riêng cho những nhà thám hiểm hệ sinh thái Haevy',
    badge: '🌌 HUYỀN THOẠI',
    priceLiteCoins: 90,
    icon: 'Orbit',
    previewColor: 'from-purple-600 via-indigo-500 to-pink-500',
    titleBadgeText: '🌌 BẬC THẦY VŨ TRỤ',
    titleBadgeClass: 'bg-gradient-to-r from-purple-500/25 via-indigo-500/25 to-pink-500/25 text-purple-200 border border-purple-400/60 shadow-[0_0_14px_rgba(168,85,247,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Orbit',
    features: [
      'Gắn ngay cạnh tên trên Hồ Sơ Cá Nhân & Thẻ Thành Viên',
      'Xuất hiện huy hiệu lấp lánh trong bình luận và tin nhắn',
      'Được cộng đồng ngưỡng mộ và công nhận đẳng cấp'
    ]
  },
  {
    id: 'title_royal_sound',
    category: 'title_badge',
    name: 'Danh Hiệu: 👑 VƯƠNG GIẢ ÂM HƯỞNG',
    tagline: 'Danh hiệu vàng hoàng tộc cho những đôi tai thẩm âm tinh tế nhất',
    badge: '👑 HOÀNG TỘC',
    priceLiteCoins: 120,
    icon: 'Crown',
    previewColor: 'from-amber-400 via-yellow-300 to-amber-600',
    titleBadgeText: '👑 VƯƠNG GIẢ ÂM HƯỞNG',
    titleBadgeClass: 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-200 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Crown',
    features: [
      'Hào quang vương miện rạng ngời bên cạnh nghệ danh',
      'Đại diện cho tầng lớp nghe nhạc Hi-Fi đẳng cấp hàng đầu',
      'Tặng kèm huy hiệu vàng tại danh sách bảng xếp hạng'
    ]
  },
  {
    id: 'title_cyber_hacker',
    category: 'title_badge',
    name: 'Danh Hiệu: ⚡ CYBER HACKER 2077',
    tagline: 'Biểu tượng chiến binh số làm chủ ma trận dữ liệu tương lai',
    badge: '⚡ CYBERPUNK',
    priceLiteCoins: 85,
    icon: 'Zap',
    previewColor: 'from-cyan-400 via-teal-300 to-blue-600',
    titleBadgeText: '⚡ CYBER HACKER 2077',
    titleBadgeClass: 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_14px_rgba(6,182,212,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Zap',
    features: [
      'Mã nguồn số Matrix phát sáng dọc theo danh hiệu',
      'Phong cách công nghệ vượt trước thời đại',
      'Dành cho những tâm hồn đam mê khám phá thế giới số'
    ]
  },
  {
    id: 'title_soul_gem',
    category: 'title_badge',
    name: 'Danh Hiệu: 💎 TINH HOA TRI KỶ',
    tagline: 'Biểu tượng cho sự gắn kết bền chặt, thấu hiểu và chia sẻ âm nhạc',
    badge: '💎 TRI KỶ',
    priceLiteCoins: 95,
    icon: 'Heart',
    previewColor: 'from-teal-400 via-emerald-300 to-green-500',
    titleBadgeText: '💎 TINH HOA TRI KỶ',
    titleBadgeClass: 'bg-gradient-to-r from-teal-500/25 to-emerald-500/25 text-emerald-200 border border-emerald-400/60 shadow-[0_0_14px_rgba(16,185,129,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Heart',
    features: [
      'Biểu tượng trái tim pha lê ngọc bích ấm áp',
      'Thu hút những người bạn có cùng gu âm nhạc và tâm hồn',
      'Món quà tuyệt vời tự thưởng cho bản thân'
    ]
  },
  {
    id: 'title_melody_lord',
    category: 'title_badge',
    name: 'Danh Hiệu: 🔥 CHÚA TỂ GIAI ĐIỆU',
    tagline: 'Người làm chủ mọi nốt nhạc và điều khiển cảm xúc đám đông',
    badge: '🔥 BÙNG CHÁY',
    priceLiteCoins: 110,
    icon: 'Flame',
    previewColor: 'from-red-500 via-orange-400 to-amber-500',
    titleBadgeText: '🔥 CHÚA TỂ GIAI ĐIỆU',
    titleBadgeClass: 'bg-gradient-to-r from-red-500/25 to-orange-500/25 text-orange-200 border border-orange-400/60 shadow-[0_0_14px_rgba(249,115,22,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Flame',
    features: [
      'Ngọn lửa bất diệt rực sáng bên cạnh tên tài khoản',
      'Đại diện cho nguồn cảm hứng sáng tạo vô tận',
      'Nổi bật trong mọi phòng nghe nhạc chung'
    ]
  },
  {
    id: 'title_sakura_fairy',
    category: 'title_badge',
    name: 'Danh Hiệu: 🌸 TIÊN TỬ MỘNG MƠ',
    tagline: 'Vẻ đẹp dịu dàng, thơ mộng của cánh hoa anh đào trong gió xuân',
    badge: '🌸 MỘNG MƠ',
    priceLiteCoins: 80,
    icon: 'Sparkles',
    previewColor: 'from-pink-400 via-rose-300 to-purple-400',
    titleBadgeText: '🌸 TIÊN TỬ MỘNG MƠ',
    titleBadgeClass: 'bg-gradient-to-r from-pink-500/25 to-rose-500/25 text-pink-200 border border-pink-400/60 shadow-[0_0_14px_rgba(244,114,182,0.5)] font-black tracking-wider',
    titleBadgeIcon: 'Sparkles',
    features: [
      'Cánh hoa anh đào phấn hồng nhẹ nhàng trang nhã',
      'Tạo ấn tượng thân thiện, ngọt ngào và dễ mến',
      'Được nhiều bạn bè yêu thích bình chọn'
    ]
  },

  // ==========================================
  // NHÓM 8: HÀO QUANG CON TRỎ & CHẠM CẢM ỨNG (cursor_aura)
  // ==========================================
  {
    id: 'aura_stardust',
    category: 'cursor_aura',
    name: 'Hào Quang Bụi Sao Thiên Hà',
    tagline: 'Mỗi cú chạm hoặc di chuột để lại vệt bụi sao tím hồng lấp lánh như dải ngân hà',
    badge: '✨ BỤI SAO',
    priceLiteCoins: 100,
    icon: 'Orbit',
    previewColor: 'from-purple-400 to-pink-400',
    cursorAuraType: 'stardust',
    cursorAuraColor: 'from-purple-400 to-pink-400',
    cursorAuraGlow: 'rgba(168,85,247,0.6)',
    features: [
      'Tạo hiệu ứng vệt bụi sao lấp lánh sau mỗi cú di chuột và chạm tay',
      'Âm thanh chạm sao dịu êm thư giãn',
      'Trải nghiệm tương tác diệu kỳ trên toàn bộ hệ sinh thái'
    ]
  },
  {
    id: 'aura_golden_dragon',
    category: 'cursor_aura',
    name: 'Hào Quang Rồng Vàng Lượn Bay',
    tagline: 'Vệt sáng vàng hoàng kim 24K uốn lượn theo từng đường nét di chuyển',
    badge: '👑 RỒNG VÀNG',
    priceLiteCoins: 130,
    icon: 'Crown',
    previewColor: 'from-amber-400 to-yellow-300',
    cursorAuraType: 'dragon',
    cursorAuraColor: 'from-amber-400 to-yellow-300',
    cursorAuraGlow: 'rgba(245,158,11,0.6)',
    features: [
      'Vệt rồng vàng uốn lượn sang trọng',
      'Đốm sáng vàng kim rơi nhẹ theo nhịp thao tác',
      'Nâng tầm cảm giác chạm vuốt thượng lưu'
    ]
  },
  {
    id: 'aura_lightning_spark',
    category: 'cursor_aura',
    name: 'Lôi Điện Tử Quang Xoay Vần',
    tagline: 'Tia chớp điện quang tím neon bung nở ngay dưới đầu ngón tay của bạn',
    badge: '⚡ LÔI ĐIỆN',
    priceLiteCoins: 115,
    icon: 'Zap',
    previewColor: 'from-violet-400 to-cyan-300',
    cursorAuraType: 'lightning',
    cursorAuraColor: 'from-violet-400 to-cyan-300',
    cursorAuraGlow: 'rgba(139,92,246,0.6)',
    features: [
      'Tia lửa điện công nghệ tương lai sống động',
      'Tốc độ phản hồi tức thời cực kỳ phấn khích',
      'Cực chất cho game thủ và tín đồ Cyberpunk'
    ]
  },
  {
    id: 'aura_frost_snow',
    category: 'cursor_aura',
    name: 'Hoa Tuyết Băng Pha Lê Rơi Dịu',
    tagline: 'Bông tuyết pha lê tan chảy nhẹ nhàng sau mỗi lần nhấp chuột hoặc chạm màn hình',
    badge: '❄️ BĂNG TUYẾT',
    priceLiteCoins: 90,
    icon: 'Snowflake',
    previewColor: 'from-sky-300 to-teal-200',
    cursorAuraType: 'snow',
    cursorAuraColor: 'from-sky-300 to-teal-200',
    cursorAuraGlow: 'rgba(56,189,248,0.6)',
    features: [
      'Bông tuyết 6 cánh thanh khiết lững lờ rơi',
      'Cảm giác mát lành, dịu mắt trong đêm tối',
      'Tạo không gian thiền định, an yên'
    ]
  }
];

// Helper functions tìm kiếm vật phẩm
export function getShopItem(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id) || null;
}

export function getAvatarFrame(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'avatar_frame') || null;
}

export function getEntranceAnimation(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'entrance_animation') || null;
}

export function getChatBorder(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'chat_border') || null;
}

export function getNameBorder(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'name_border') || null;
}

export function getNameFont(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'name_font') || null;
}

export function getPlayerWave(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'player_wave') || null;
}

export function getTitleBadge(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'title_badge') || null;
}

export function getCursorAura(id?: string | null): HaevyLiteShopItem | null {
  if (!id || id === 'none') return null;
  return HAEVY_LITE_SHOP_ITEMS.find(item => item.id === id && item.category === 'cursor_aura') || null;
}

/**
 * Tương thích ngược: HAEVY_LITE_THEMES và getThemeBundle
 * Không còn chứa các item cũ trong shop. Nếu có ai truyền cosmic, nó map sang item tương ứng.
 */
export const HAEVY_LITE_THEMES: HaevyLiteThemeBundle[] = [];

export function getThemeBundle(id?: string | null): HaevyLiteThemeBundle | null {
  if (!id || id === 'none') return null;
  const item = getShopItem(id);
  if (item) {
    return {
      id: 'cosmic',
      name: item.name,
      tagline: item.tagline,
      badge: item.badge,
      priceLiteCoins: item.priceLiteCoins,
      icon: item.icon,
      previewColor: item.previewColor,
      entranceTitle: item.entranceTitle || item.name,
      entranceSubtitle: item.entranceSubtitle || item.tagline,
      entranceIcon: item.entranceIcon || item.frameDecorationEmoji || '✨',
      avatarAuraClass: item.frameAuraClass || 'ring-4 ring-purple-500/70',
      avatarRingClass: item.frameRingClass || 'border-purple-400',
      nameGlowClass: item.nameplateTextClass || 'text-purple-300 font-bold',
      messageBubbleGlowClass: item.bubbleBorderClass || '',
      features: item.features
    };
  }
  return null;
}

export const HAEVY_LITE_TOPUP_PACKAGES: HaevyLiteTopupPackage[] = [
  {
    id: 'lite-100',
    name: 'Gói Trải Nghiệm',
    coins: 100,
    bonusCoins: 10,
    priceVnd: 10000,
    description: 'Thích hợp đổi khung avatar hoặc viền chat trải nghiệm',
    tag: 'TIẾT KIỆM'
  },
  {
    id: 'lite-300',
    name: 'Gói Khám Phá Vũ Trụ',
    coins: 300,
    bonusCoins: 50,
    priceVnd: 30000,
    originalPriceVnd: 40000,
    isPopular: true,
    description: 'Đủ đổi ngay Khung Avatar Rồng Vàng + Viền Chat Hoàng Gia',
    tag: 'PHỔ BIẾN NHẤT'
  },
  {
    id: 'lite-700',
    name: 'Gói Phi Hành Gia Cao Cấp',
    coins: 700,
    bonusCoins: 150,
    priceVnd: 60000,
    originalPriceVnd: 85000,
    isBestValue: true,
    description: 'Sở hữu trọn bộ combo 4 món: Khung Avatar + Hoạt Ảnh Mở Đầu + Viền Chat + Viền Tên',
    tag: 'ƯU ĐÃI NHẤT'
  },
  {
    id: 'lite-1500',
    name: 'Gói Chủ Tế Vũ Trụ Tối Thượng',
    coins: 1500,
    bonusCoins: 500,
    priceVnd: 120000,
    originalPriceVnd: 180000,
    description: 'Mở khóa toàn bộ bộ sưu tập các khung hình & hoạt ảnh mở đầu vĩnh viễn',
    tag: 'TRỌN BỘ SƯU TẬP'
  },
  {
    id: 'lite-3500',
    name: 'Gói Vô Cực Vũ Trụ (Cosmic Master)',
    coins: 3500,
    bonusCoins: 1500,
    priceVnd: 250000,
    originalPriceVnd: 400000,
    description: 'Nhận ngay 5.000 Xu Lite (+43% thưởng) - Đỉnh cao vũ trụ & hào quang vô hạn',
    tag: 'SIÊU ĐẠI GIA 🌌'
  }
];
