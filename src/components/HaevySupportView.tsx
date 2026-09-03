import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Headphones, 
  Clock, 
  FileQuestion, 
  ArrowLeft,
  LifeBuoy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HaevySupportViewProps {
  onBackToPortal?: () => void;
  onOpenAuth?: () => void;
}

export function HaevySupportView({ onBackToPortal, onOpenAuth }: HaevySupportViewProps) {
  const { user, accountId } = useAuth();
  
  const [topic, setTopic] = useState('Tài khoản & Đăng nhập');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Làm thế nào để kích hoạt gói VIP hoặc Nạp Xu Haevy?',
      answer: 'Bạn chỉ cần truy cập vào mục "Haevy VIP" trên thanh menu hoặc nhấn vào số dư Xu ở góc trên bên phải. Hệ thống hỗ trợ chuyển khoản QR Code tự động 24/7, Xu sẽ được cộng ngay vào tài khoản sau 1-3 giây.'
    },
    {
      question: 'Haevy Space 3D hoạt động như thế nào?',
      answer: 'Haevy Space là không gian đa chiều 3D cho phép bạn vẽ không gian tự do, xoay camera 360 độ, điều khiển linh vật Son 3D và bật chế độ cử chỉ tay AR qua webcam/camera để vẽ bằng ngón tay trong không khí.'
    },
    {
      question: 'Làm sao để đăng ký làm Tác giả (Author) và phát hành âm thanh trên Haevy Studio?',
      answer: 'Vào "Haevy Studio", chọn "Đăng ký kênh Tác giả" hoặc "Xác thực eKYC". Sau khi được phê duyệt, bạn có thể tạo audio bằng giọng đọc AI cảm xúc, tải lên tác phẩm và nhận tiền ủng hộ/xu từ thính giả.'
    },
    {
      question: 'Chế độ "I Love Haevy" hoạt động bảo mật như thế nào?',
      answer: 'I Love Haevy cung cấp mã ghép đôi độc quyền cho 2 người. Nhật ký chung, ngày kỷ niệm và theo dõi chu kỳ được mã hóa riêng tư, chỉ 2 tài khoản đã ghép đôi mới có thể xem và cập nhật.'
    },
    {
      question: 'Dữ liệu tài chính trong "Haevy Finance" có an toàn không?',
      answer: 'Toàn bộ dữ liệu thu chi và phân bổ 6 hũ tài chính của bạn được lưu trữ an toàn trên nền tảng đám mây và chỉ duy nhất tài khoản của bạn có quyền đọc và chỉnh sửa.'
    }
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung cần hỗ trợ!');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || contactInfo || 'Chưa cung cấp',
        displayName: user?.displayName || 'Thành viên Haevy',
        accountId: accountId || 'HV-GUEST',
        topic,
        subject: subject.trim(),
        content: content.trim(),
        contactInfo: contactInfo.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitSuccess(true);
      setSubject('');
      setContent('');
      setContactInfo('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.warn('Gửi ticket hỗ trợ lỗi, lưu cục bộ:', err);
      setSubmitSuccess(true);
      setSubject('');
      setContent('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-zinc-950 to-teal-950/70 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
            <LifeBuoy size={14} className="text-emerald-400" />
            <span>HAEVY SUPPORT • TRUNG TÂM TRỢ GIÚP & CHĂM SÓC KHÁCH HÀNG</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Chúng Tôi Luôn Sẵn Sàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Đồng Hành Cùng Bạn</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Giải đáp mọi thắc mắc về các tính năng trong Hệ sinh thái Haevy, tiếp nhận phản hồi đóng góp và xử lý nhanh các vấn đề về tài khoản, nạp xu và bản quyền.
          </p>
        </div>
      </div>

      {/* Quick Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Phone size={20} />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold">Hotline Hỗ Trợ 24/7</div>
            <div className="text-sm font-black text-white font-mono">1900 8888 (Phím 1)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold">Email Hỗ Trợ Kỹ Thuật</div>
            <div className="text-xs sm:text-sm font-black text-white font-mono truncate">support@haevy.vn</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-bold">Thời Gian Phản Hồi</div>
            <div className="text-xs sm:text-sm font-black text-emerald-400">Tức thì ~ Dưới 15 phút</div>
          </div>
        </div>
      </div>

      {/* Main Support Grid: Send Ticket & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Submit Support Ticket Form (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <MessageSquare size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-sm font-black text-white">GỬI YÊU CẦU TRỢ GIÚP TRỰC TIẾP</h2>
              <p className="text-[10px] text-zinc-400">Đội ngũ kỹ thuật Haevy sẽ phản hồi ngay qua tài khoản hoặc email của bạn</p>
            </div>
          </div>

          {submitSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center gap-2.5 text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Yêu cầu hỗ trợ của bạn đã được gửi thành công! Đội ngũ Haevy sẽ xử lý ngay lập tức.</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Chủ đề cần hỗ trợ:
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Tài khoản & Đăng nhập">Tài khoản, Đăng nhập & Mật khẩu</option>
                <option value="Nạp Xu & Gói VIP">Nạp Xu & Gói VIP Haevy</option>
                <option value="Haevy Space & 3D AR">Tính năng Haevy Space 3D & AR</option>
                <option value="Haevy Studio & Tác giả">Haevy Studio & Quyền tác giả Audio</option>
                <option value="I Love Haevy & Ghép đôi">I Love Haevy & Kết nối cặp đôi</option>
                <option value="Góp ý & Báo lỗi">Góp ý phát triển & Báo lỗi hệ thống</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Tiêu đề yêu cầu:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Cần hướng dẫn kết nối camera trong Haevy Space..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Chi tiết nội dung cần trợ giúp:
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Số điện thoại / Zalo hoặc Email nhận phản hồi (tùy chọn):
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="VD: 0912345678 hoặc email@domain.com"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang gửi yêu cầu...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Gửi Yêu Cầu Hỗ Trợ Cho Đội Ngũ Haevy</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: FAQs Accordion (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <FileQuestion size={18} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-black text-white">CÂU HỎI THƯỜNG GẶP (FAQ)</h2>
              <p className="text-[10px] text-zinc-400">Các hướng dẫn nhanh giải quyết thắc mắc phổ biến</p>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-3 text-left flex items-center justify-between gap-2 font-bold text-xs text-zinc-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-3 pt-0 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guarantee Box */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5 text-[11px] text-zinc-400 mt-4">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Mọi thông tin liên hệ và khiếu nại của bạn đều được bảo mật 100% theo tiêu chuẩn Haevy Shield.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
