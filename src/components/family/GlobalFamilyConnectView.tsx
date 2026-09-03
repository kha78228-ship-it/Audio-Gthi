import React, { useState } from 'react';
import { FamilyTree, FamilyTreeMember } from '../../types';
import { 
  Globe2, 
  Flame, 
  Heart, 
  Send, 
  MapPin, 
  Sparkles, 
  BellRing, 
  Users, 
  Award, 
  Compass, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface GlobalFamilyConnectViewProps {
  treeInfo: FamilyTree;
  members: FamilyTreeMember[];
}

interface ClanLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  memberCount: number;
  contactPerson: string;
  description: string;
}

interface ClanGuestbookEntry {
  id: string;
  authorName: string;
  location: string;
  generation: number;
  message: string;
  category: 'blessing' | 'congratulation' | 'incense';
  timestamp: string;
  incenseCount?: number;
}

const GLOBAL_CLAN_LOCATIONS: ClanLocation[] = [
  {
    id: 'loc_01',
    name: 'Chi Phái Gốc - Từ Đường Hà Nam',
    region: 'Kim Bảng, Hà Nam',
    country: 'Việt Nam',
    flag: '🇻🇳',
    memberCount: 8,
    contactPerson: 'Cụ Trưởng Tộc Nguyễn Phúc Đức Thọ',
    description: 'Nơi đặt Từ đường chính bản tộc, phụng thờ Thủy Tổ và lưu giữ văn bia sắc phong triều Nguyễn.'
  },
  {
    id: 'loc_02',
    name: 'Phân Chi Hà Nội & Vùng Kinh Kỳ',
    region: 'Quận Ba Đình & Cầu Giấy',
    country: 'Việt Nam',
    flag: '🇻🇳',
    memberCount: 14,
    contactPerson: 'Bác Nguyễn Phúc Quang Minh',
    description: 'Chi nhánh tập trung nhiều con cháu công tác tại các viện nghiên cứu, trường đại học và bệnh viện.'
  },
  {
    id: 'loc_03',
    name: 'Phân Chi Phương Nam (TP. Hồ Chí Minh & Đông Nam Bộ)',
    region: 'Quận 1 & TP. Thủ Đức',
    country: 'Việt Nam',
    flag: '🇻🇳',
    memberCount: 12,
    contactPerson: 'Anh Nguyễn Phúc Nam Sơn',
    description: 'Chi nhánh doanh nhân và sáng tạo công nghệ, hàng năm tổ chức họp mặt kiều bào đầu xuân.'
  },
  {
    id: 'loc_04',
    name: 'Bà Con Kiều Bào Hoa Kỳ (Bắc Mỹ)',
    region: 'California & Texas',
    country: 'Hoa Kỳ',
    flag: '🇺🇸',
    memberCount: 7,
    contactPerson: 'Chị Nguyễn Phúc Tuệ Mẫn',
    description: 'Con cháu du học và định cư, luôn duy trì lễ giỗ tổ vọng bái online và ủng hộ quỹ khuyến học.'
  },
  {
    id: 'loc_05',
    name: 'Bà Con Kiều Bào Châu Âu (Pháp & Đức)',
    region: 'Paris & Berlin',
    country: 'Châu Âu',
    flag: '🇪🇺',
    memberCount: 5,
    contactPerson: 'Anh Nguyễn Phúc Hoàng Long',
    description: 'Gia đình kiều bào tri thức, hướng về cội nguồn và giữ gìn tiếng Việt cho các cháu đời thứ 4.'
  },
  {
    id: 'loc_06',
    name: 'Con Cháu Tại Nhật Bản & Đông Bắc Á',
    region: 'Tokyo & Osaka',
    country: 'Nhật Bản',
    flag: '🇯🇵',
    memberCount: 4,
    contactPerson: 'Cháu Nguyễn Phúc Bảo Ngọc',
    description: 'Thế hệ trẻ du học sinh công nghệ cao, kết nối thường xuyên qua nền tảng Gia Phả 4.0.'
  }
];

const INITIAL_GUESTBOOK: ClanGuestbookEntry[] = [
  {
    id: 'gb_01',
    authorName: 'Nguyễn Phúc Bảo Ngọc (Đời 4)',
    location: 'Tokyo, Nhật Bản 🇯🇵',
    generation: 4,
    message: 'Hôm nay ngày giỗ Cụ Cố mà con đang ở Tokyo không kịp về, con xin kính cẩn dâng nén tâm nhang online bái vọng Từ đường. Kính chúc toàn thể ông bà cô bác ở quê nhà dồi dào sức khỏe, gia tộc vạn đại trường tồn!',
    category: 'incense',
    timestamp: 'Hôm nay lúc 08:30',
    incenseCount: 12
  },
  {
    id: 'gb_02',
    authorName: 'Nguyễn Phúc Tuệ Mẫn (Đời 3)',
    location: 'California, Hoa Kỳ 🇺🇸',
    generation: 3,
    message: 'Chúc mừng cháu Tuấn Anh (Đời 4) vừa đỗ thủ khoa đại học! Quỹ khuyến học hải ngoại họ Nguyễn Phúc sẽ gửi học bổng vinh danh cháu trong đợt lễ tế thu tới.',
    category: 'congratulation',
    timestamp: 'Hôm qua lúc 19:45',
    incenseCount: 8
  },
  {
    id: 'gb_03',
    authorName: 'Nguyễn Phúc Nam Sơn (Đời 3)',
    location: 'TP. Hồ Chí Minh 🇻🇳',
    generation: 3,
    message: 'Chi nhánh phương Nam xin gửi lời kính chúc Đại Thọ Cụ Cụ Bà tròn 85 tuổi. Kính chúc Cụ phúc như Đông Hải, thọ tỷ Nam Sơn!',
    category: 'blessing',
    timestamp: '3 ngày trước',
    incenseCount: 15
  }
];

export const GlobalFamilyConnectView: React.FC<GlobalFamilyConnectViewProps> = ({
  treeInfo,
  members
}) => {
  const [guestbook, setGuestbook] = useState<ClanGuestbookEntry[]>(() => {
    const saved = localStorage.getItem('haevy_global_guestbook');
    return saved ? JSON.parse(saved) : INITIAL_GUESTBOOK;
  });

  const [incenseLitCount, setIncenseLitCount] = useState<number>(() => {
    const saved = localStorage.getItem('haevy_incense_total');
    return saved ? parseInt(saved, 10) : 128;
  });

  const [hasLitIncenseToday, setHasLitIncenseToday] = useState(false);
  const [incensePrayer, setIncensePrayer] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderLocation, setSenderLocation] = useState('Bà con xa xứ');

  // Handle Lit Online Incense
  const handleLightIncense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) return;

    const newCount = incenseLitCount + 1;
    setIncenseLitCount(newCount);
    localStorage.setItem('haevy_incense_total', newCount.toString());
    setHasLitIncenseToday(true);

    const newEntry: ClanGuestbookEntry = {
      id: `gb_${Date.now()}`,
      authorName: senderName.trim(),
      location: senderLocation.trim(),
      generation: 4,
      message: incensePrayer.trim() || 'Kính cẩn dâng nén tâm nhang thành kính lên bàn thờ tổ tiên dòng tộc họ Nguyễn Phúc, kính nguyện gia đình vạn sự an khang!',
      category: 'incense',
      timestamp: 'Vừa xong',
      incenseCount: 1
    };

    const updated = [newEntry, ...guestbook];
    setGuestbook(updated);
    localStorage.setItem('haevy_global_guestbook', JSON.stringify(updated));
    setIncensePrayer('');
  };

  return (
    <div className="space-y-6">
      {/* Exclusive Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-900/50 border border-amber-500/30 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>KẾT NỐI TOÀN CẦU & VỌNG BÁI TỔ TIÊN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-tight flex items-center gap-2">
              <span>🌐 Kết Nối Gia Đình Toàn Cầu</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dù ở bất kỳ phương trời nào trên thế giới, con cháu <strong>{treeInfo.name}</strong> luôn cập nhật phả hệ tức thời, thắp nén tâm nhang vọng bái và gửi lời chúc phúc gắn kết muôn đời.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Nén Nhang Đã Dâng</div>
            <div className="text-xl font-black text-amber-400 font-mono flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>{incenseLitCount} Nén Tâm Nhang</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Main Columns: Altar / Incense Online & Global Network Map */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Thắp Nén Tâm Nhang Online & Vọng Bái (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-5 shadow-2xl relative overflow-hidden text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                ÁNG THỜ TỔ TIÊN ẢO • VỌNG BÁI TỪ XA
              </span>
              <h3 className="text-lg font-black text-amber-200 font-serif">
                🕯️ Thắp Nén Tâm Nhang Hiếu Đạo
              </h3>
              <p className="text-xs text-slate-300 italic">
                Dành cho con cháu xa xứ dâng lòng thành kính ngày giỗ chạp
              </p>
            </div>

            {/* Sacred Altar Visual Representation */}
            <div className="py-6 px-4 rounded-xl bg-slate-950/90 border border-amber-500/30 relative">
              <div className="text-2xl mb-2">🏛️</div>
              <div className="text-sm font-serif font-bold text-amber-300">
                TỪ ĐƯỜNG NGUYỄN TỘC
              </div>
              <div className="text-[11px] text-amber-400/80 italic mb-4">
                « Ẩm Thủy Tư Nguyên • Vạn Đại Hưng Thịnh »
              </div>

              {/* Incense Burner Visualization */}
              <div className="relative w-28 h-20 mx-auto flex flex-col items-center justify-end">
                {/* Smoke animation */}
                <div className="flex gap-2 mb-1">
                  <span className="inline-block w-1.5 h-6 bg-gradient-to-t from-orange-400 via-amber-200 to-transparent rounded-full animate-pulse opacity-90" />
                  <span className="inline-block w-1.5 h-8 bg-gradient-to-t from-orange-400 via-amber-200 to-transparent rounded-full animate-pulse delay-100 opacity-90" />
                  <span className="inline-block w-1.5 h-6 bg-gradient-to-t from-orange-400 via-amber-200 to-transparent rounded-full animate-pulse delay-200 opacity-90" />
                </div>
                {/* Burner Base */}
                <div className="w-24 h-8 rounded-t-lg bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 border-t-2 border-amber-300 flex items-center justify-center shadow-lg">
                  <span className="text-[10px] font-black text-amber-100 font-serif">ĐỒNG LƯ</span>
                </div>
              </div>

              {hasLitIncenseToday ? (
                <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Nén tâm nhang của bạn đã được dâng lên Tiên Tổ!</span>
                </div>
              ) : (
                <div className="mt-4 text-[11px] text-amber-300/80">
                  Khói trầm quyện tỏa, chứng giám lòng hiếu nghĩa muôn dặm xa xôi.
                </div>
              )}
            </div>

            {/* Form to Light Incense */}
            <form onSubmit={handleLightIncense} className="space-y-3 text-xs text-left">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Họ tên con cháu:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Phúc Bảo An..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nơi đang sinh sống (Thành phố, Quốc gia):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: California, Hoa Kỳ 🇺🇸 hoặc Tokyo, Nhật Bản 🇯🇵..."
                  value={senderLocation}
                  onChange={(e) => setSenderLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Lời khấn nguyện & tâm nguyện gửi Tiên Tổ:</label>
                <textarea
                  rows={3}
                  placeholder="Kính lạy tiên tổ chứng giám, con cháu xin dâng nén hương thơm..."
                  value={incensePrayer}
                  onChange={(e) => setIncensePrayer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
              >
                <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Dâng Nén Tâm Nhang Vọng Bái</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Global Locations & Guestbook (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Global Branches Grid */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-400" />
                Mạng Lưới Chi Phái & Kiều Bào Dòng Họ
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {GLOBAL_CLAN_LOCATIONS.length} Vùng Địa Lý
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GLOBAL_CLAN_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{loc.flag}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      {loc.memberCount} thành viên
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">
                      {loc.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{loc.region}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {loc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sổ Vàng Lưu Bút Dòng Tộc */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sổ Vàng Lưu Bút & Lời Chúc Phúc Dòng Tộc</span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>{entry.authorName}</span>
                      <span className="text-slate-400 font-normal">({entry.location})</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">{entry.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    « {entry.message} »
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
