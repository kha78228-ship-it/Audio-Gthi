import React, { useState } from 'react';
import { FamilyTree, FamilyTreeMember, FamilyRole } from '../../types';
import { 
  BookOpen, 
  ScrollText, 
  Landmark, 
  Sparkles, 
  Plus, 
  History, 
  Flame, 
  Award, 
  Heart, 
  Share2, 
  Compass, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface FamilyHistoryHeritageViewProps {
  treeInfo: FamilyTree;
  members: FamilyTreeMember[];
  userRole?: FamilyRole;
}

interface HeritageStory {
  id: string;
  title: string;
  period: string;
  category: 'origin' | 'achievement' | 'legend' | 'family_value';
  author: string;
  content: string;
  imageUrl?: string;
  date: string;
}

const DEFAULT_HERITAGE_STORIES: HeritageStory[] = [
  {
    id: 'story_01',
    title: 'Nguồn Gốc Phát Tích & Thủy Tổ Khai Sáng',
    period: 'Thế kỷ 18 (Thời Vua Lê - Chúa Trịnh)',
    category: 'origin',
    author: 'Cụ Trưởng Tộc đời thứ 2 ghi chép',
    content: `Khởi thủy dòng họ Nguyễn Phúc vốn phát tích từ làng gốm cổ Bát Tràng (Gia Lâm, Hà Nội). Đến giữa thế kỷ 18, cụ Thủy Tổ vốn là bậc túc nho thông tuệ thiên văn địa lý, nhận thấy vùng đất Kim Bảng (Hà Nam) non xanh nước biếc, thế đất tựa rùa vàng hướng biển, bèn đưa gia quyến về đây khai hoang lập ấp, lập nên Từ đường họ Nguyễn Phúc đệ tam chi phái.

Các cụ truyền dạy con cháu: dù sông cạn đá mòn, người họ Nguyễn Phúc phải lấy đạo chữ "Đức" làm gốc, chữ "Tâm" làm sáng, luôn hòa mục yêu thương xóm giềng và giữ vững lễ nghi tiên tổ.`,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    date: '1785-06-15'
  },
  {
    id: 'story_02',
    title: 'Sắc Phong Thuận Nghĩa Tiên Sinh & Nghĩa Thục Cứu Dân',
    period: 'Năm 1923 (Triều Vua Khải Định)',
    category: 'achievement',
    author: 'Gia Phả Ký Chép Lại',
    content: `Năm Quý Hợi (1923), vùng châu thổ sông Hồng gặp trận lụt lớn vỡ đê, mùa màng mất trắng. Cụ Khởi Tổ Nguyễn Phúc Đức Thọ đã mở hết kho thóc gia đình phát chẩn cho hơn 300 hộ dân nghèo quanh vùng, đồng thời lập lớp học chữ Nho và bốc thuốc miễn phí cứu sống hàng trăm người.

Cảm kích trước tấm lòng nhân nghĩa cao cả, Triều đình Nhà Nguyễn đã ban sắc phong tặng danh hiệu "Thuận Nghĩa Tiên Sinh", khắc biển vàng treo trang trọng tại chính điện Từ đường dòng họ.`,
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    date: '1923-08-15'
  },
  {
    id: 'story_03',
    title: 'Truyền Thống Khuyến Học & Tiếp Bước Thời Đại 4.0',
    period: 'Giai đoạn Hiện Đại (Thế kỷ 21)',
    category: 'family_value',
    author: 'Hội Đồng Dòng Tộc Họ Nguyễn Phúc',
    content: `Trải qua hơn 200 năm thăng trầm, con cháu các đời sau luôn noi gương sáng tiền nhân, miệt mài đèn sách. Dòng họ đã sản sinh nhiều tiến sĩ, kỹ sư, bác sĩ và doanh nhân thành đạt trong và ngoài nước. 

Bước vào kỷ nguyên số 4.0, gia phả dòng họ được số hóa thành "Di Sản Số", ứng dụng Phả Tuệ AI kết nối con cháu trên khắp toàn cầu, để dù ở bất kỳ phương trời nào, con cháu vẫn luôn tự hào mang trong mình dòng máu tổ tiên anh dũng, nhân ái.`,
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
    date: '2026-01-01'
  }
];

const GIA_HUAN_10_DIEU = [
  { no: 1, title: 'Đạo Hiếu Hàng Đầu', text: 'Hiếu kính phụ mẫu, phụng dưỡng tổ tiên trọn vẹn, không để cha mẹ phải phiền lòng.' },
  { no: 2, title: 'Cốt Nhục Tương Thân', text: 'Anh em một nhà phải nhường nhịn yêu thương, chị ngã em nâng, tuyệt đối không tranh chấp tài vật.' },
  { no: 3, title: 'Tôn Sư Trọng Đạo', text: 'Kính trọng thầy cô, chăm chỉ học tập, lấy tri thức làm rạng rỡ tông môn.' },
  { no: 4, title: 'Cần Kiệm Liêm Chính', text: 'Làm việc chăm chỉ, chi tiêu tiết kiệm, không tham của phi nghĩa, giữ tâm trong sáng.' },
  { no: 5, title: 'Giữ Vẹn Chữ Tín', text: 'Lời nói đi đôi với việc làm, một lần mất tín vạn sự bất thành.' },
  { no: 6, title: 'Hòa Mục Xóm Giềng', text: 'Bán anh em xa mua láng giềng gần, cư xử từ tốn, chan hòa với cộng đồng.' },
  { no: 7, title: 'Tuân Phép Nước', text: 'Sống và làm việc theo pháp luật, rèn luyện nhân cách, là công dân mẫu mực.' },
  { no: 8, title: 'Khuyến Khích Nhân Tài', text: 'Gia đình cùng dòng họ lập quỹ khuyến học, nâng đỡ con cháu vượt khó vươn lên.' },
  { no: 9, title: 'Nhớ Ngày Giỗ Chạp', text: 'Dù đi bốn phương trời, ngày giỗ tổ, giỗ họ phải hướng lòng thành kính về cội nguồn.' },
  { no: 10, title: 'Lưu Truyền Gia Phả', text: 'Thế hệ trước có trách nhiệm ghi chép gia sử, thế hệ sau có bổn phận học hỏi và gìn giữ.' }
];

export const FamilyHistoryHeritageView: React.FC<FamilyHistoryHeritageViewProps> = ({
  treeInfo,
  members,
  userRole = 'admin'
}) => {
  const [stories, setStories] = useState<HeritageStory[]>(() => {
    const saved = localStorage.getItem('haevy_heritage_stories');
    return saved ? JSON.parse(saved) : DEFAULT_HERITAGE_STORIES;
  });

  const [activeSubTab, setActiveSubTab] = useState<'chronicle' | 'gia_huan' | 'van_te'>('chronicle');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newStory: HeritageStory = {
      id: `story_${Date.now()}`,
      title: newTitle.trim(),
      period: newPeriod.trim() || 'Giai đoạn cận đại',
      category: 'legend',
      author: newAuthor.trim() || 'Thành viên dòng họ',
      content: newContent.trim(),
      date: new Date().toISOString().substring(0, 10)
    };

    const updated = [newStory, ...stories];
    setStories(updated);
    localStorage.setItem('haevy_heritage_stories', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPeriod('');
    setNewAuthor('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-900/50 border border-amber-500/30 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              <span>DI SẢN SỐ & BIÊN NIÊN SỬ GIA TỘC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-tight flex items-center gap-2">
              <span>📖 Lưu Giữ Gia Sử – Truyền Lại Cho Đời Sau</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Ghi chép câu chuyện cội nguồn, bảo tồn văn hóa, 10 điều gia huấn truyền đời của <strong>{treeInfo.name}</strong> để xây dựng di sản số trường tồn cho muôn đời con cháu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Chép Câu Chuyện Mới</span>
            </button>
          </div>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex items-center gap-2 pt-5 border-t border-amber-500/20 mt-4">
          <button
            onClick={() => setActiveSubTab('chronicle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'chronicle'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Biên Niên Sử & Ký Ức Dòng Họ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gia_huan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'gia_huan'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>10 Điều Gia Huấn Tiên Nhân</span>
          </button>

          <button
            onClick={() => setActiveSubTab('van_te')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'van_te'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Văn Bia & Câu Đối Cổ Từ Đường</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Biên niên sử & Ký ức */}
      {activeSubTab === 'chronicle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <div
                key={story.id}
                className="rounded-2xl bg-slate-900/90 border border-amber-500/20 overflow-hidden flex flex-col hover:border-amber-500/40 transition-all shadow-lg"
              >
                {story.imageUrl && (
                  <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {story.period}
                    </div>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-amber-200 font-serif leading-snug">
                      {story.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 italic">
                      Chép bởi: {story.author} • Ngày ghi: {story.date}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-6 whitespace-pre-line">
                      {story.content}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-400">
                    <span className="flex items-center gap-1 font-mono">
                      <ScrollText className="w-3.5 h-3.5" /> Bản Ghi Di Sản #{idx + 1}
                    </span>
                    <span className="text-slate-400">Đã lưu trữ số</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: 10 Điều Gia Huấn */}
      {activeSubTab === 'gia_huan' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="text-xl font-black text-amber-200 font-serif">
              📜 MƯỜI ĐIỀU GIA HUẤN DÒNG TỘC
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              Lời vàng ngọc của tiên tổ răn dạy con cháu các đời sau giữ tròn cương thường đạo lý, tích phúc tích đức cho muôn đời hưng vượng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {GIA_HUAN_10_DIEU.map((item) => (
              <div
                key={item.no}
                className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 flex items-start gap-3.5 hover:border-amber-500/40 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                  {item.no}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Văn Bia & Câu Đối Cổ */}
      {activeSubTab === 'van_te' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Câu Đối Cột Từ Đường */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-amber-500/20 pb-3">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>Câu Đối Cổ Tiền Tế Từ Đường</span>
            </h3>

            <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center space-y-4">
              <div className="text-sm sm:text-base font-serif font-black text-amber-200 tracking-widest leading-loose">
                « TỔ ĐỨC THIÊN THU PHÚC KHÍ THỊNH »<br />
                « TỬ TÔN VẠN ĐẠI CÔNG DANH TRƯỜNG »
              </div>
              <div className="text-xs text-slate-300 italic">
                (Dịch nghĩa: Đức tổ tông ngàn năm phúc khí hưng thịnh - Con cháu vạn đời công danh sáng ngời dài lâu)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center space-y-4">
              <div className="text-sm sm:text-base font-serif font-black text-amber-200 tracking-widest leading-loose">
                « MỘC XUẤT THIÊN CHI DO HỮU BẢN »<br />
                « THỦY LƯU VẠN PHÁI TỐNG TƯ NGUYÊN »
              </div>
              <div className="text-xs text-slate-300 italic">
                (Dịch nghĩa: Cây trổ ngàn cành nhờ có cội rễ - Nước chảy muôn nhánh luôn nhớ về nguồn)
              </div>
            </div>
          </div>

          {/* Bài Văn Tế Giỗ Tổ */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-amber-500/20 pb-3">
              <ScrollText className="w-4 h-4 text-amber-400" />
              <span>Trích Lục Văn Tế Giỗ Tổ Hằng Niên</span>
            </h3>

            <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300 font-serif">
              <p className="font-bold text-amber-200">
                Kính lạy: Liệt vị Tiên Tổ, Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ họ Nguyễn Phúc!
              </p>
              <p>
                Hôm nay nhằm ngày giỗ tổ trang trọng, con cháu nội ngoại ba miền tề tựu trước án tiền từ đường, kính cẩn dâng nén tâm nhang, hoa đăng lễ vật, khấu đầu vọng bái tri ân công đức trời biển của tổ tiên.
              </p>
              <p>
                Kính nguyện anh linh tiên tổ chứng giám lòng thành, phù hộ độ trì cho dòng tộc hưng vượng, con cháu bình an khang thái, học hành tấn tới, rạng rỡ gia phong!
              </p>
              <div className="pt-2 text-right text-amber-400 font-bold italic">
                — Thượng Hưởng —
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Story */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-amber-200 font-serif">
              ✍️ Ghi Chép Ký Ức / Câu Chuyện Dòng Họ Mới
            </h3>

            <form onSubmit={handleAddStory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Tiêu đề câu chuyện / sự kiện:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kỷ niệm ngày khánh thành nhà thờ tổ..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Thời kỳ / Niên đại:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Năm 1975, Giai đoạn 1990..."
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Người ghi chép:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cháu Nguyễn Phúc An..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nội dung câu chuyện:</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Ghi lại chi tiết lời kể của cha ông, ký ức xưa..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Lưu Vào Di Sản Số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
