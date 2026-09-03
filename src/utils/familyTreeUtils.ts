import { FamilyTreeMember as FamilyMember } from '../types';

export interface MemberAgeInfo {
  ageNumber: number | null;
  display: string;
  yearText: string;
  isDeceased: boolean;
  statusText: string;
}

/**
 * Tính toán tuổi chính xác theo phong tục truyền thống Việt Nam
 * Nếu đã mất: >= 60 tuổi gọi là Hưởng thọ, < 60 tuổi gọi là Hưởng dương
 * Nếu còn sống: tính số tuổi hiện tại (năm hiện tại - năm sinh)
 */
export function getMemberAgeInfo(member: FamilyMember): MemberAgeInfo {
  if (!member.birthDate) {
    return {
      ageNumber: null,
      display: member.isDeceased ? 'Đã quy tiên' : 'Đang sinh sống',
      yearText: 'Niên đại chưa rõ',
      isDeceased: member.isDeceased,
      statusText: member.isDeceased ? 'Đã quy tiên' : 'Đang sinh sống'
    };
  }

  const birthYear = parseInt(member.birthDate.substring(0, 4), 10);
  if (isNaN(birthYear)) {
    return {
      ageNumber: null,
      display: member.isDeceased ? 'Đã quy tiên' : 'Đang sinh sống',
      yearText: 'Niên đại chưa rõ',
      isDeceased: member.isDeceased,
      statusText: member.isDeceased ? 'Đã quy tiên' : 'Đang sinh sống'
    };
  }

  if (member.isDeceased) {
    let deathYear = member.deathDate ? parseInt(member.deathDate.substring(0, 4), 10) : null;
    if (deathYear && !isNaN(deathYear)) {
      const age = Math.max(1, deathYear - birthYear);
      const prefix = age >= 60 ? 'Hưởng thọ' : 'Hưởng dương';
      return {
        ageNumber: age,
        display: `${prefix} ${age} tuổi`,
        yearText: `${birthYear} - ${deathYear}`,
        isDeceased: true,
        statusText: `${prefix} ${age} tuổi`
      };
    } else {
      return {
        ageNumber: null,
        display: 'Đã quy tiên',
        yearText: `Sinh ${birthYear}`,
        isDeceased: true,
        statusText: 'Đã quy tiên'
      };
    }
  } else {
    // Current year: 2026
    const currentYear = 2026;
    const age = Math.max(0, currentYear - birthYear);
    return {
      ageNumber: age,
      display: `${age} tuổi`,
      yearText: `Sinh năm ${birthYear}`,
      isDeceased: false,
      statusText: `${age} tuổi (Đang sống)`
    };
  }
}

/**
 * Trích xuất quê quán / nguyên quán của thành viên
 */
export function getMemberHometown(member: FamilyMember): string {
  if (member.originPlace && member.originPlace.trim()) {
    return member.originPlace.trim();
  }
  if (member.birthPlace && member.birthPlace.trim()) {
    return member.birthPlace.trim();
  }
  if (member.burialPlace && member.burialPlace.includes('Hà Nam')) {
    return 'Kim Bảng, Hà Nam';
  }
  if (member.currentResidence) {
    if (member.currentResidence.includes('Hà Nam')) return 'Kim Bảng, Hà Nam';
    if (member.currentResidence.includes('Ý Yên') || member.currentResidence.includes('Nam Định')) return 'Ý Yên, Nam Định';
    if (member.currentResidence.includes('Hải Dương')) return 'Thanh Miện, Hải Dương';
    if (member.currentResidence.includes('Hà Nội')) return 'Hà Nội';
    if (member.currentResidence.includes('Hồ Chí Minh')) return 'TP. Hồ Chí Minh';
  }
  return 'Kim Bảng, Hà Nam';
}

/**
 * Thông tin mối quan hệ tình cảm / hôn phối
 */
export interface MemberRelationshipStatus {
  statusKey: 'single' | 'married' | 'dating' | 'widowed' | 'divorced' | 'unknown';
  label: string;
  badgeColor: string;
  partnerDisplay?: string;
  detailsText: string;
}

export function getRelationshipStatusInfo(member: FamilyMember, allMembers: FamilyMember[]): MemberRelationshipStatus {
  // Check explicit spouseIds first
  const spouses = allMembers.filter(m => (member.spouseIds || []).includes(m.id));
  const hasSpouses = spouses.length > 0;
  const spouseNames = spouses.map(s => s.fullName).join(', ');

  if (member.relationshipStatus === 'married' || hasSpouses) {
    const partnerName = member.relationshipPartnerName || spouseNames || 'Phối ngẫu dòng tộc';
    return {
      statusKey: 'married',
      label: 'Đã kết hôn',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      partnerDisplay: partnerName,
      detailsText: `Đã kết hôn cùng ${partnerName}${member.relationshipAnniversary ? ` (Kỷ niệm: ${member.relationshipAnniversary})` : ''}`
    };
  }

  if (member.relationshipStatus === 'dating') {
    return {
      statusKey: 'dating',
      label: 'Đang hẹn hò',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      partnerDisplay: member.relationshipPartnerName,
      detailsText: `Đang trong mối quan hệ hẹn hò${member.relationshipPartnerName ? ` với ${member.relationshipPartnerName}` : ''}`
    };
  }

  if (member.relationshipStatus === 'widowed') {
    return {
      statusKey: 'widowed',
      label: 'Góa bụa',
      badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600',
      partnerDisplay: member.relationshipPartnerName || spouseNames,
      detailsText: `Tưởng nhớ người bạn đời${spouseNames ? ` (${spouseNames})` : ''}`
    };
  }

  if (member.relationshipStatus === 'divorced') {
    return {
      statusKey: 'divorced',
      label: 'Độc thân / Ly hôn',
      badgeColor: 'bg-amber-900/30 text-amber-300 border-amber-600/30',
      detailsText: 'Hiện đang độc lập'
    };
  }

  if (member.relationshipStatus === 'single') {
    return {
      statusKey: 'single',
      label: 'Độc thân',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      detailsText: 'Đang độc thân (Tập trung công danh sự nghiệp)'
    };
  }

  // If age >= 25 and no spouse recorded
  const age = getMemberAgeInfo(member).ageNumber;
  if (age !== null && age < 20) {
    return {
      statusKey: 'single',
      label: 'Tuổi học trò / Độc thân',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      detailsText: 'Tuổi trẻ đèn sách'
    };
  }

  return {
    statusKey: 'unknown',
    label: 'Chưa cập nhật',
    badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    detailsText: 'Chưa ghi nhận tình trạng gia đạo'
  };
}

/**
 * Tính toán quan hệ xưng hô thân tộc giữa 2 thành viên
 */
export interface KinshipAnalysis {
  relationship: string;
  suggestedTitle: string; // Tên xưng hô: ví dụ "Bác", "Chú", "Cô", "Anh họ", "Cháu"
  callingPrompt: string;  // Câu hướng dẫn: ví dụ "Thành viên A gọi Thành viên B là Bác"
  generationDiff: number;
  isSameBranch: boolean;
  bloodlineType: 'direct_ancestor' | 'direct_descendant' | 'spouse' | 'sibling' | 'collateral' | 'self';
}

export function calculateKinship(
  source: FamilyMember,
  target: FamilyMember,
  allMembers: FamilyMember[]
): KinshipAnalysis {
  if (source.id === target.id) {
    return {
      relationship: 'Chính bản thân',
      suggestedTitle: 'Bản thân',
      callingPrompt: 'Là chính mình',
      generationDiff: 0,
      isSameBranch: true,
      bloodlineType: 'self'
    };
  }

  const genDiff = target.generation - source.generation;
  const isSameBranch = source.branch === target.branch;

  // Check direct spouse
  if ((source.spouseIds || []).includes(target.id) || (target.spouseIds || []).includes(source.id)) {
    const isMale = target.gender === 'male';
    return {
      relationship: isMale ? 'Chồng' : 'Vợ',
      suggestedTitle: isMale ? 'Chồng' : 'Vợ',
      callingPrompt: `${source.fullName} gọi ${target.fullName} là ${isMale ? 'Chồng / Phu quân' : 'Vợ / Hiền thê'}`,
      generationDiff: 0,
      isSameBranch: true,
      bloodlineType: 'spouse'
    };
  }

  // Check parent
  if (source.fatherId === target.id) {
    return {
      relationship: 'Thân phụ (Cha ruột)',
      suggestedTitle: 'Bố / Cha',
      callingPrompt: `${source.fullName} gọi ${target.fullName} là Cha`,
      generationDiff: -1,
      isSameBranch: true,
      bloodlineType: 'direct_ancestor'
    };
  }
  if (source.motherId === target.id) {
    return {
      relationship: 'Thân mẫu (Mẹ ruột)',
      suggestedTitle: 'Mẹ',
      callingPrompt: `${source.fullName} gọi ${target.fullName} là Mẹ`,
      generationDiff: -1,
      isSameBranch: true,
      bloodlineType: 'direct_ancestor'
    };
  }

  // Check children
  if (target.fatherId === source.id || target.motherId === source.id) {
    const isMale = target.gender === 'male';
    return {
      relationship: isMale ? 'Con trai' : 'Con gái',
      suggestedTitle: 'Con',
      callingPrompt: `${source.fullName} gọi ${target.fullName} là Con`,
      generationDiff: 1,
      isSameBranch: true,
      bloodlineType: 'direct_descendant'
    };
  }

  // Check siblings (same father or same mother)
  const isSibling = (source.fatherId && source.fatherId === target.fatherId) ||
                    (source.motherId && source.motherId === target.motherId);
  if (isSibling) {
    const targetOlder = (target.orderInFamily || 1) < (source.orderInFamily || 1);
    const title = target.gender === 'male' ? (targetOlder ? 'Anh trai' : 'Em trai') : (targetOlder ? 'Chị gái' : 'Em gái');
    return {
      relationship: 'Anh chị em ruột',
      suggestedTitle: title,
      callingPrompt: `${source.fullName} gọi ${target.fullName} là ${title}`,
      generationDiff: 0,
      isSameBranch: true,
      bloodlineType: 'sibling'
    };
  }

  // Generation differences
  if (genDiff === 0) {
    // Same generation: anh em họ
    const isTargetOlder = (target.orderInFamily || 1) < (source.orderInFamily || 1);
    const title = target.gender === 'male' ? (isTargetOlder ? 'Bác / Anh họ' : 'Chú / Em họ') : (isTargetOlder ? 'Chị họ' : 'Em họ');
    return {
      relationship: 'Anh chị em họ cùng đời',
      suggestedTitle: title,
      callingPrompt: `${source.fullName} xưng hô với ${target.fullName} là ${title}`,
      generationDiff: 0,
      isSameBranch,
      bloodlineType: 'collateral'
    };
  }

  if (genDiff === -1) {
    // Target is 1 generation above: Bác, Chú, Cô, Cậu, Dì, Thím, Mợ
    let title = 'Bác / Chú';
    if (target.gender === 'male') {
      title = (target.orderInFamily || 1) <= 1 ? 'Bác' : 'Chú';
    } else {
      title = 'Cô / Dì';
    }
    return {
      relationship: `Bậc tiền bối đời trên (Đời ${target.generation})`,
      suggestedTitle: title,
      callingPrompt: `${source.fullName} gọi ${target.fullName} là ${title} (Xưng Cháu)`,
      generationDiff: -1,
      isSameBranch,
      bloodlineType: 'collateral'
    };
  }

  if (genDiff === 1) {
    // Target is 1 generation below: Cháu
    return {
      relationship: `Hậu duệ đời dưới (Đời ${target.generation})`,
      suggestedTitle: 'Cháu',
      callingPrompt: `${source.fullName} gọi ${target.fullName} là Cháu (Xưng Chú/Bác/Cô)`,
      generationDiff: 1,
      isSameBranch,
      bloodlineType: 'collateral'
    };
  }

  if (genDiff <= -2) {
    // Ông, Bà, Cụ, Kỵ, Tiên tổ
    const absDiff = Math.abs(genDiff);
    let title = 'Ông / Bà';
    if (absDiff === 2) title = target.gender === 'male' ? 'Ông nội / Ông' : 'Bà nội / Bà';
    else if (absDiff === 3) title = target.gender === 'male' ? 'Cụ' : 'Cụ bà';
    else if (absDiff === 4) title = 'Kỵ';
    else title = 'Thủy Tổ / Tiên linh tiền bối';

    return {
      relationship: `Tiền nhân dòng tộc (Cách biệt ${absDiff} thế hệ)`,
      suggestedTitle: title,
      callingPrompt: `${source.fullName} kính cẩn gọi ${target.fullName} là ${title} (Xưng Con/Cháu)`,
      generationDiff: genDiff,
      isSameBranch,
      bloodlineType: 'direct_ancestor'
    };
  }

  // genDiff >= 2: Cháu chắt
  const absDiff = Math.abs(genDiff);
  const title = absDiff === 2 ? 'Cháu nội / Cháu ngoại' : 'Chắt / Chút';
  return {
    relationship: `Hậu duệ đời sau (Cách biệt ${absDiff} thế hệ)`,
    suggestedTitle: title,
    callingPrompt: `${source.fullName} gọi ${target.fullName} là ${title}`,
    generationDiff: genDiff,
    isSameBranch,
    bloodlineType: 'direct_descendant'
  };
}

/**
 * Tìm kiếm các bài audio trong Haevy Ecosystem gắn liền với thành viên gia tộc
 */
export function getMemberAudioTracks(member: FamilyMember, allTracks: any[] = []): any[] {
  if (!allTracks || allTracks.length === 0) return [];
  const normalizedName = member.fullName.toLowerCase().trim();

  return allTracks.filter(track => {
    // Explicit ID match
    if (member.haevyAudioTrackIds && member.haevyAudioTrackIds.includes(track.id)) {
      return true;
    }
    // Match addedBy user id
    if (member.haevyUserId && track.addedBy === member.haevyUserId) {
      return true;
    }
    // Match artist or author name
    const artist = (track.artist || '').toLowerCase();
    const addedByName = (track.addedByName || '').toLowerCase();
    const title = (track.title || '').toLowerCase();
    return artist.includes(normalizedName) || addedByName.includes(normalizedName) || title.includes(normalizedName);
  });
}
