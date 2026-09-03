import React, { useState, useMemo } from 'react';
import { FamilyTreeMember, FamilyTree } from '../../types';
import { calculateCanChi, analyzeTwoMembersHarmony, CanChiInfo } from '../../utils/phatueAstrology';
import { 
  Sparkles, 
  Brain, 
  Compass, 
  HeartHandshake, 
  FileText, 
  Printer, 
  Download, 
  UserCheck, 
  RefreshCw, 
  Share2, 
  Award, 
  BookOpen, 
  Sun, 
  Moon, 
  Flame, 
  Droplet, 
  Trees, 
  ShieldAlert, 
  CheckCircle2,
  Users
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PhaTueAIViewProps {
  members: FamilyTreeMember[];
  treeInfo: FamilyTree;
  selectedMemberId?: string;
  onSelectMember?: (member: FamilyMember) => void;
}

type FamilyMember = FamilyTreeMember;

export const PhaTueAIView: React.FC<PhaTueAIViewProps> = ({
  members,
  treeInfo,
  selectedMemberId,
}) => {
  // Primary member selection
  const [primaryMemberId, setPrimaryMemberId] = useState<string>(() => {
    if (selectedMemberId && members.some(m => m.id === selectedMemberId)) {
      return selectedMemberId;
    }
    return members[0]?.id || '';
  });

  // Secondary member for Harmony Analysis
  const [secondaryMemberId, setSecondaryMemberId] = useState<string>(() => {
    return members.find(m => m.id !== primaryMemberId)?.id || '';
  });

  // Mode: 'individual' (Cốt cách & Vận mệnh) | 'harmony' (Thấu hiểu & Hóa giải xung đột)
  const [activeMode, setActiveMode] = useState<'individual' | 'harmony'>('individual');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [lastAnalyzedId, setLastAnalyzedId] = useState<string>('');

  const primaryMember = useMemo(() => {
    return members.find(m => m.id === primaryMemberId) || members[0];
  }, [members, primaryMemberId]);

  const secondaryMember = useMemo(() => {
    return members.find(m => m.id === secondaryMemberId);
  }, [members, secondaryMemberId]);

  // Compute Can Chi and Astrology
  const primaryYear = useMemo(() => {
    if (!primaryMember?.birthDate) return 1990;
    const y = parseInt(primaryMember.birthDate.slice(0, 4), 10);
    return isNaN(y) ? 1990 : y;
  }, [primaryMember]);

  const primaryCanChi = useMemo(() => {
    return calculateCanChi(primaryYear);
  }, [primaryYear]);

  const secondaryYear = useMemo(() => {
    if (!secondaryMember?.birthDate) return 1995;
    const y = parseInt(secondaryMember.birthDate.slice(0, 4), 10);
    return isNaN(y) ? 1995 : y;
  }, [secondaryMember]);

  const secondaryCanChi = useMemo(() => {
    return calculateCanChi(secondaryYear);
  }, [secondaryYear]);

  const harmonyData = useMemo(() => {
    if (!primaryMember || !secondaryMember) return null;
    return analyzeTwoMembersHarmony(
      primaryCanChi, 
      secondaryCanChi, 
      primaryMember.fullName, 
      secondaryMember.fullName
    );
  }, [primaryCanChi, secondaryCanChi, primaryMember, secondaryMember]);

  // Generate Phả Tuệ AI Analysis
  const handleGeneratePhaTueAI = async (mode = activeMode) => {
    if (!primaryMember) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/pha-tue-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: primaryMember,
          secondaryMember: mode === 'harmony' ? secondaryMember : undefined,
          analysisMode: mode,
          clanContext: {
            clanName: treeInfo.name,
            motto: treeInfo.motto,
            ancestralHall: treeInfo.ancestralHall
          }
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAiReport(data.analysis);
        setLastAnalyzedId(`${primaryMember.id}_${mode}_${mode === 'harmony' ? secondaryMember?.id : ''}`);
      } else {
        throw new Error(data.error || 'Không nhận được kết quả phân tích');
      }
    } catch (err) {
      console.warn('Fallback local astrology generation:', err);
      // Generate immediate local rich fallback
      if (mode === 'harmony' && secondaryMember && harmonyData) {
        setAiReport(`### ☯️ PHẢ TUỆ AI: ĐỐI CHIẾU HÒA HỢP & HÓA GIẢI XUNG ĐỘT
**Thành viên 1**: **${primaryMember.fullName}** (${primaryCanChi.canChi} - Mệnh ${primaryCanChi.menhNguHanh})  
**Thành viên 2**: **${secondaryMember.fullName}** (${secondaryCanChi.canChi} - Mệnh ${secondaryCanChi.menhNguHanh})  
**Chỉ số hòa hợp ngũ hành**: **${harmonyData.harmonyScore}%** (${harmonyData.relationshipNature})

---

#### 1. Thấu Hiểu Căn Nguyên Tâm Lý & Góc Nhìn
- **${primaryMember.fullName}** (Đời thứ ${primaryMember.generation}): Thừa hưởng khí chất ${primaryCanChi.nguHanhElement}, trọng ${primaryCanChi.dacTinhCotCach[0]}. Trong công việc và đối nhân xử thế luôn cầu toàn, gìn giữ nền nếp.
- **${secondaryMember.fullName}** (Đời thứ ${secondaryMember.generation}): Mang năng lượng ${secondaryCanChi.nguHanhElement}, phong cách ${secondaryCanChi.dacTinhCotCach[0]}. Thích ứng nhanh, cởi mở với cái mới.

#### 2. Nút Thắt Dễ Gây Bất Đồng
- Sự chênh lệch thế hệ (${primaryMember.generation === secondaryMember.generation ? 'Cùng trang lứa nhưng khác biệt bản mệnh' : `Cách nhau ${Math.abs(primaryMember.generation - secondaryMember.generation)} thế hệ`}) dễ gây hiểu nhầm về cách diễn đạt.
- Một bên muốn mọi sự theo quy củ đã định, một bên mong muốn linh hoạt và có không gian sáng tạo.

#### 3. Phương Thức Hóa Giải Đắc Lợi (Theo Di Huấn Dòng Tộc)
1. **Lắng nghe thấu cảm**: ${harmonyData.advice}
2. **Chọn thời điểm vàng**: Không tranh luận khi đang mệt mỏi hoặc trước mặt người ngoài. Hãy mở lời bằng sự quan tâm chân thành.
3. **Lấy tổ tiên làm điểm tựa**: Cùng hướng về cội nguồn dòng họ ${treeInfo.name}, lấy câu châm ngôn *« ${treeInfo.motto} »* làm thước đo gìn giữ hòa khí.

---
*“Anh em cốt nhục tình thâm – Hòa thuận một nhà phúc trạch ngàn năm.”*`);
      } else {
        setAiReport(`### 🌟 HỒ SƠ PHẢ TUỆ AI: HIỂU CON NGƯỜI TỪ GỐC RỄ
**Họ tên**: **${primaryMember.fullName}** (Đời thứ ${primaryMember.generation} - ${primaryMember.branch || 'Toàn tộc'})  
**Can Chi**: **${primaryCanChi.canChi}** (${primaryCanChi.conGiap}) | **Bản Mệnh**: **${primaryCanChi.menhNguHanh}**  
**Dòng tộc**: ${treeInfo.name}

---

#### I. CỐT CÁCH & BẢN NGUYÊN TÍNH CÁCH
- **Bản mệnh ngũ hành**: ${primaryCanChi.dacTinhCotCach[0]}
- **Ưu thế thiên bẩm**: Trung thực, có trách nhiệm cao với gia đình, giàu nghị lực và luôn giữ chữ "Tín".
- **Điểm mù cần tôi luyện**: Đôi khi gánh vác quá nhiều trọng trách một mình; cần học cách chia sẻ và đón nhận sự hỗ trợ từ người thân.

#### II. VẬN MỆNH & XU HƯỚNG CUỘC ĐỜI
- **Năng lượng tương sinh**: ${primaryCanChi.tuongSinh}.
- **Thận trọng**: ${primaryCanChi.tuongKhac}.
- **Đại cục**: Cuộc đời là hành trình tích lũy từ gốc rễ, trung vận vững vàng, hậu vận hưng thịnh nhờ phúc đức tổ tiên che chở.

#### III. HƯỚNG NGHIỆP & PHÁT HUY TIỀM NĂNG
- Hướng hợp: ${primaryCanChi.phuongHuongPhuHop}.
- Màu sắc bản mệnh hỗ trợ may mắn: ${primaryCanChi.mauSacMayMan.join(', ')}.
- Nghề nghiệp đắc thế: Các ngành quản trị, giáo dục, xây dựng, kinh doanh bền vững hoặc công nghệ phát triển cộng đồng.

#### IV. LỜI KHUYÊN GIA TỘC & BẢO TỒN GIA PHONG
- Thường xuyên tham gia các ngày giỗ tổ, gắn kết con cháu đời sau.
- Duy trì truyền thống hiếu học của họ Nguyễn Phúc, lấy tri thức và đạo đức làm gia bảo truyền đời.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger print/export for professional PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Element badge icon
  const renderElementBadge = (element: string) => {
    switch (element) {
      case 'Kim':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono"><Sun className="w-3 h-3" /> Mệnh Kim</span>;
      case 'Mộc':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono"><Trees className="w-3 h-3" /> Mệnh Mộc</span>;
      case 'Thủy':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono"><Droplet className="w-3 h-3" /> Mệnh Thủy</span>;
      case 'Hỏa':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono"><Flame className="w-3 h-3" /> Mệnh Hỏa</span>;
      case 'Thổ':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-600/40 text-xs font-bold font-mono"><Moon className="w-3 h-3" /> Mệnh Thổ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Exclusive Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-900/40 border border-amber-500/30 relative overflow-hidden shadow-xl shadow-amber-950/20">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TÍNH NĂNG AI ĐỘC QUYỀN GIA PHẢ 4.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-tight flex items-center gap-2">
              <span>🤖 Phả Tuệ AI – Hiểu Con Người Từ Gốc Rễ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kết hợp tinh hoa <strong>Ngũ Hành, Bát Tự, Can Chi</strong> với <strong>dữ liệu huyết thống gia phả</strong> để thấu hiểu bản mệnh, định hướng tương lai và hóa giải mâu thuẫn gia đình.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              title="In hoặc xuất file PDF làm quà tặng hoặc lưu trữ"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Xuất Hồ Sơ PDF</span>
            </button>
          </div>
        </div>

        {/* 2 Modes Switcher Tabs */}
        <div className="flex items-center gap-2 pt-5 border-t border-amber-500/20 mt-4">
          <button
            onClick={() => setActiveMode('individual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'individual'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Phân Tích Cốt Cách & Vận Mệnh Bản Thân</span>
          </button>

          <button
            onClick={() => setActiveMode('harmony')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMode === 'harmony'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Thấu Hiểu Người Thân & Hóa Giải Xung Đột</span>
          </button>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Side: Member Selection Card */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Chọn Thành Viên Khảo Sát</span>
            </h3>

            {/* Primary Member Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Thành viên chính {activeMode === 'harmony' ? '(Người thứ nhất)' : ''}:
              </label>
              <select
                value={primaryMemberId}
                onChange={(e) => setPrimaryMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 text-xs focus:border-amber-400 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    Đời {m.generation} - {m.fullName} ({m.gender === 'male' ? 'Nam' : 'Nữ'} - {m.birthDate?.slice(0, 4) || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Member Select (If in Harmony Mode) */}
            {activeMode === 'harmony' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-medium text-slate-400">
                  Thành viên thứ hai (Để đối chiếu tương hợp & giải xung đột):
                </label>
                <select
                  value={secondaryMemberId}
                  onChange={(e) => setSecondaryMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-slate-200 border border-slate-700 text-xs focus:border-amber-400 focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.id === primaryMemberId}>
                      Đời {m.generation} - {m.fullName} ({m.gender === 'male' ? 'Nam' : 'Nữ'} - {m.birthDate?.slice(0, 4) || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Can Chi / Element Card */}
            {primaryMember && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Can Chi:</span>
                  <span className="font-bold text-amber-200">{primaryCanChi.canChi} ({primaryCanChi.conGiap})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nạp Âm:</span>
                  <span className="font-bold text-slate-200">{primaryCanChi.menhNguHanh}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hành:</span>
                  {renderElementBadge(primaryCanChi.nguHanhElement)}
                </div>
              </div>
            )}

            {/* Harmony Badge Preview if Mode Harmony */}
            {activeMode === 'harmony' && harmonyData && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs text-center">
                <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">Chỉ Số Tương Hợp</div>
                <div className="text-2xl font-black text-amber-400 font-mono">{harmonyData.harmonyScore}%</div>
                <div className="text-xs text-amber-200 font-medium">{harmonyData.relationshipNature}</div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleGeneratePhaTueAI()}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Luận Giải Phả Tuệ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{aiReport ? 'Luận Giải Lại Bằng AI' : 'Bắt Đầu Luận Giải Phả Tuệ'}</span>
                </>
              )}
            </button>
          </div>

          {/* Core Philosophy Box */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-center space-y-2">
            <BookOpen className="w-5 h-5 text-amber-400 mx-auto" />
            <p className="text-xs italic text-amber-200 font-serif leading-relaxed">
              “Con người có tổ, có tông<br />
              Như cây có cội, như sông có nguồn.”
            </p>
            <p className="text-[11px] text-slate-400">
              Gia phả không chỉ để ghi danh, mà để soi sáng phẩm hạnh và chắp cánh tương lai cho hậu thế.
            </p>
          </div>
        </div>

        {/* Right Side: Phả Tuệ AI Report & Presentation */}
        <div className="md:col-span-8 space-y-4">
          {/* Printable Report Document Container */}
          <div id="pha-tue-report-container" className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-6 shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            {/* Traditional Decorative Header for Export */}
            <div className="text-center space-y-2 border-b border-amber-500/20 pb-5">
              <div className="text-[10px] sm:text-xs font-mono tracking-widest text-amber-400 uppercase">
                GIA PHẢ 4.0 • HỆ THỐNG TRÍ TUỆ GIA TỘC ĐỘC QUYỀN
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-200 font-serif tracking-tight">
                {activeMode === 'individual' ? 'HỒ SƠ PHẢ TUỆ AI & BẢN NGUYÊN MỆNH CÁCH' : 'LUẬN BÀI TƯƠNG HỢP & HÒA GIẢI GIA ĐÌNH'}
              </h1>
              <div className="text-xs text-slate-300 italic font-serif">
                « {treeInfo.name} • Từ Đường: {treeInfo.ancestralHall || 'Từ Đường Bản Tộc'} »
              </div>
            </div>

            {/* Content Body */}
            {isGenerating ? (
              <div className="py-16 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-amber-200">Đang đối chiếu dữ liệu Bát Tự & Huyết Thống...</div>
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    Hệ thống Phả Tuệ AI đang phân tích Ngũ Hành Nạp Âm kết hợp công đức gia phong dòng họ {treeInfo.name}.
                  </div>
                </div>
              </div>
            ) : aiReport ? (
              <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm leading-relaxed space-y-4 print:text-black">
                <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-amber-200">Chưa Khởi Tạo Luận Giải Phả Tuệ</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Vui lòng chọn thành viên bên trái và nhấn <strong>"Bắt Đầu Luận Giải Phả Tuệ"</strong> để AI phân tích tính cách, vận mệnh, ngũ hành và lời khuyên gia huấn trọn đời.
                  </p>
                </div>
                <button
                  onClick={() => handleGeneratePhaTueAI()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Khởi Tạo Ngay Cho {primaryMember?.fullName}</span>
                </button>
              </div>
            )}

            {/* Bottom Stamp / Seal of Clan */}
            <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Chứng Thực Phả Tuệ AI • Lưu Truyền Trong Gia Phả Điện Tử 4.0</span>
              </div>
              <div className="font-mono text-amber-400/80">
                {new Date().toLocaleDateString('vi-VN')} • Bản In Di Sản
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
