import { 
  ZodiacSignData, 
  NatalChartResult, 
  NatalPlanetPlacement, 
  ZodiacCompatibilityResult 
} from '../types';
import { ZODIAC_SIGNS } from '../data/spiritualData';

export function getZodiacSignByDate(day: number, month: number): ZodiacSignData {
  for (const sign of ZODIAC_SIGNS) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign;
    }
  }
  return ZODIAC_SIGNS[0];
}

export function calculateNatalChart(
  birthDateStr: string,
  birthTimeStr: string,
  birthPlace: string
): NatalChartResult {
  const [yearStr, monthStr, dayStr] = birthDateStr.split('-');
  const [hourStr, minStr] = (birthTimeStr || '12:00').split(':');

  const year = parseInt(yearStr, 10) || 2000;
  const month = parseInt(monthStr, 10) || 1;
  const day = parseInt(dayStr, 10) || 1;
  const hour = parseInt(hourStr, 10) || 12;

  const sunSignData = getZodiacSignByDate(day, month);

  // Approximate astrological planetary calculation for aesthetic interactive chart
  const signNames = ZODIAC_SIGNS.map(s => s.nameVi);
  
  // Moon sign (changes sign every ~2.5 days)
  const moonIndex = (day * 4 + month * 2 + Math.floor(hour / 2)) % 12;
  const moonSign = signNames[moonIndex];

  // Ascendant / Rising Sign (changes every ~2 hours based on birth time)
  const risingIndex = (Math.floor(hour / 2) + month + 2) % 12;
  const risingSign = signNames[risingIndex];

  const planets: NatalPlanetPlacement[] = [
    {
      planet: 'Sun',
      planetVi: 'Mặt Trời (Bản Ngã Cốt Lõi)',
      symbol: '☉',
      zodiacSign: sunSignData.nameVi,
      degree: ((day * 7) % 29) + 1,
      house: 1,
      interpretation: `Mặt Trời ở ${sunSignData.nameVi} định hình bản ngã mạnh mẽ, ý chí vươn lên và năng lượng sống cốt lõi của bạn.`
    },
    {
      planet: 'Moon',
      planetVi: 'Mặt Trăng (Thế Giới Cảm Xúc)',
      symbol: '☽',
      zodiacSign: moonSign,
      degree: ((day * 13 + hour) % 29) + 1,
      house: 4,
      interpretation: `Mặt Trăng ở ${moonSign} mang lại thế giới nội tâm phong phú, trực giác nhạy cảm và nhu cầu được yêu thương an toàn.`
    },
    {
      planet: 'Rising',
      planetVi: 'Điểm Mọc (Ascendant / Ấn Tượng Bên Ngoài)',
      symbol: 'Asc',
      zodiacSign: risingSign,
      degree: ((hour * 5 + 12) % 29) + 1,
      house: 1,
      interpretation: `Điểm Mọc ở ${risingSign} tạo nên phong thái cuốn hút, diện mạo độc đáo và cách bạn tương tác với thế giới xung quanh.`
    },
    {
      planet: 'Mercury',
      planetVi: 'Sao Thủy (Tư Duy & Giao Tiếp)',
      symbol: '☿',
      zodiacSign: signNames[(sunSignData.startMonth + 1) % 12],
      degree: ((day * 9) % 29) + 1,
      house: 3,
      interpretation: `Sao Thủy định hình tư duy logic, phản xạ ngôn từ sắc bén và khả năng học hỏi tiếp thu tri thức siêu tốc.`
    },
    {
      planet: 'Venus',
      planetVi: 'Sao Kim (Tình Yêu & Thẩm Mỹ)',
      symbol: '♀',
      zodiacSign: signNames[(sunSignData.startMonth + 2) % 12],
      degree: ((day * 11) % 29) + 1,
      house: 7,
      interpretation: `Sao Kim phản ánh gu thẩm mỹ tinh tế, sức hút lãng mạn quyến rũ và cách bạn trao nhận tình yêu trọn vẹn.`
    },
    {
      planet: 'Mars',
      planetVi: 'Sao Hỏa (Hành Động & Đam Mê)',
      symbol: '♂',
      zodiacSign: signNames[(sunSignData.startMonth + 4) % 12],
      degree: ((day * 15) % 29) + 1,
      house: 5,
      interpretation: `Sao Hỏa tiếp lửa cho lòng dũng cảm, sự quyết đoán bứt phá và đam mê theo đuổi mục tiêu đến cùng.`
    },
    {
      planet: 'Jupiter',
      planetVi: 'Sao Mộc (May Mắn & Mở Rộng)',
      symbol: '♃',
      zodiacSign: signNames[(year % 12)],
      degree: ((year * 3) % 29) + 1,
      house: 9,
      interpretation: `Sao Mộc mang đến phước lành dồi dào, tư duy triết học cởi mở và những vận may bất ngờ trong cuộc đời.`
    },
    {
      planet: 'Saturn',
      planetVi: 'Sao Thổ (Kỷ Luật & Thử Thách)',
      symbol: '♄',
      zodiacSign: signNames[(Math.floor(year / 2.5)) % 12],
      degree: ((year * 5) % 29) + 1,
      house: 10,
      interpretation: `Sao Thổ rèn giũa ý chí kiên định qua các bài học trưởng thành, giúp bạn xây dựng sự nghiệp bền vững đỉnh cao.`
    }
  ];

  // Element distribution
  const fireCount = planets.filter(p => ['Bạch Dương', 'Sư Tử', 'Nhân Mã'].includes(p.zodiacSign)).length;
  const earthCount = planets.filter(p => ['Kim Ngưu', 'Xử Nữ', 'Ma Kết'].includes(p.zodiacSign)).length;
  const airCount = planets.filter(p => ['Song Tử', 'Thiên Bình', 'Bảo Bình'].includes(p.zodiacSign)).length;
  const waterCount = planets.filter(p => ['Cự Giải', 'Bọ Cạp', 'Song Ngư'].includes(p.zodiacSign)).length;
  const total = planets.length;

  return {
    birthDateStr,
    birthTimeStr,
    birthPlace: birthPlace || 'Việt Nam',
    sunSign: sunSignData.nameVi,
    moonSign,
    risingSign,
    planets,
    elementDistribution: {
      fire: Math.round((fireCount / total) * 100),
      earth: Math.round((earthCount / total) * 100),
      air: Math.round((airCount / total) * 100),
      water: Math.round((waterCount / total) * 100)
    }
  };
}

export function calculateZodiacCompatibility(sign1Id: string, sign2Id: string): ZodiacCompatibilityResult {
  const s1 = ZODIAC_SIGNS.find(s => s.id === sign1Id) || ZODIAC_SIGNS[0];
  const s2 = ZODIAC_SIGNS.find(s => s.id === sign2Id) || ZODIAC_SIGNS[1];

  let baseScore = 75;
  
  // Same element (Fire+Fire, Water+Water, etc.)
  if (s1.element === s2.element) {
    baseScore = 92;
  } 
  // Complementary elements (Fire+Air, Earth+Water)
  else if (
    (s1.element === 'Lửa' && s2.element === 'Khí') ||
    (s1.element === 'Khí' && s2.element === 'Lửa') ||
    (s1.element === 'Đất' && s2.element === 'Nước') ||
    (s1.element === 'Nước' && s2.element === 'Đất')
  ) {
    baseScore = 88;
  }
  // Neutral or challenging elements
  else {
    baseScore = 72;
  }

  // Same sign
  if (s1.id === s2.id) {
    baseScore = 85;
  }

  const emotionalScore = Math.min(99, baseScore + ((s1.nameVi.length * 3 + s2.nameVi.length) % 9));
  const communicationScore = Math.min(99, baseScore + ((s1.nameVi.length * 2 + 5) % 11));
  const romanceScore = Math.min(99, baseScore + ((s2.nameVi.length * 4) % 10));
  const longTermScore = Math.min(99, Math.round((emotionalScore + communicationScore + romanceScore) / 3));

  const strengths = [
    `Sự kết hợp giữa ${s1.element} (${s1.nameVi}) và ${s2.element} (${s2.nameVi}) tạo nên sự bù trừ độc đáo về mặt năng lượng.`,
    `Cả hai cùng tìm thấy niềm vui trong việc chia sẻ mục tiêu chung và hỗ trợ đối phương phát triển thế mạnh.`,
    `Sự tôn trọng không gian riêng và phong cách sống giúp mối quan hệ luôn giữ được sự tươi mới hấp dẫn.`
  ];

  const challenges = [
    `Đôi khi sự khác biệt trong cách bộc lộ cảm xúc (${s1.nameVi} vs ${s2.nameVi}) có thể gây ra những hiểu lầm nho nhỏ.`,
    `Cần lắng nghe kiên nhẫn hơn và tránh để cái tôi lấn át trong các cuộc tranh luận quan trọng.`
  ];

  const cosmicVerdict = `Tỷ lệ hòa hợp đạt **${longTermScore}%**! Vũ trụ ban tặng cho hai bạn một sợi dây liên kết đầy tiềm năng. Khi biết tôn trọng sự khác biệt và cùng hướng về tương lai, tình cảm của ${s1.nameVi} và ${s2.nameVi} sẽ ngày càng đơm hoa kết trái ngọt ngào.`;

  const advice = `Hãy luôn dành cho nhau những lời khen chân thành, chia sẻ thẳng thắn những âu lo và tổ chức những buổi hẹn hò lãng mạn để giữ ngọn lửa tình yêu luôn rực sáng.`;

  return {
    sign1: s1.nameVi,
    sign2: s2.nameVi,
    overallScore: longTermScore,
    emotionalScore,
    communicationScore,
    romanceScore,
    longTermScore,
    strengths,
    challenges,
    cosmicVerdict,
    advice
  };
}
