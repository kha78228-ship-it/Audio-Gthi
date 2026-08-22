import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Plus, 
  Trash2, 
  Pin, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  Info, 
  Clock, 
  Send,
  Users,
  Crown,
  ShieldCheck,
  CheckCircle2,
  X,
  Type,
  Palette,
  Sliders,
  Maximize2,
  Flame,
  Bell,
  Megaphone,
  Star,
  Heart,
  Eye,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SystemAnnouncement } from '../../types';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SystemAnnouncementsTabProps {
  showToast: (msg: string) => void;
}

const PRESET_COLORS = [
  { label: 'Vàng Kim', hex: '#fbbf24' },
  { label: 'Xanh Neon', hex: '#38bdf8' },
  { label: 'Đỏ Rực', hex: '#ef4444' },
  { label: 'Xanh Ngọc', hex: '#10b981' },
  { label: 'Tím Huyền', hex: '#c084fc' },
  { label: 'Hồng Neon', hex: '#f43f5e' },
  { label: 'Cam Lửa', hex: '#f97316' },
  { label: 'Trắng Sáng', hex: '#ffffff' },
];

const PRESET_BG_COLORS = [
  { label: 'Đen Huyền Bí', hex: 'rgba(24, 24, 27, 0.95)' },
  { label: 'Đỏ Đậm Lửa', hex: 'rgba(69, 10, 10, 0.9)' },
  { label: 'Tím Thiên Hà', hex: 'rgba(59, 7, 100, 0.9)' },
  { label: 'Xanh Lam Đậm', hex: 'rgba(8, 47, 73, 0.9)' },
  { label: 'Xanh Rừng Rậm', hex: 'rgba(6, 78, 59, 0.9)' },
  { label: 'Vàng Kim Đậm', hex: 'rgba(113, 63, 18, 0.9)' },
];

export function SystemAnnouncementsTab({ showToast }: SystemAnnouncementsTabProps) {
  const { user, logSystemActivity } = useAuth();
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemAnnouncement | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<SystemAnnouncement['type']>('general');
  const [targetAudience, setTargetAudience] = useState<SystemAnnouncement['targetAudience']>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [isMarquee, setIsMarquee] = useState(true);
  const [marqueeSpeed, setMarqueeSpeed] = useState<SystemAnnouncement['marqueeSpeed']>('normal');
  const [fontFamily, setFontFamily] = useState<SystemAnnouncement['fontFamily']>('sans');
  const [fontSize, setFontSize] = useState<SystemAnnouncement['fontSize']>('sm');
  const [fontWeight, setFontWeight] = useState<SystemAnnouncement['fontWeight']>('bold');
  const [textColor, setTextColor] = useState('#fbbf24');
  const [bgColor, setBgColor] = useState('rgba(24, 24, 27, 0.95)');
  const [isBlinking, setIsBlinking] = useState(false);
  const [customIcon, setCustomIcon] = useState<SystemAnnouncement['customIcon']>('megaphone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'systemAnnouncements'),
      (snapshot) => {
        const list: SystemAnnouncement[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as SystemAnnouncement);
        });
        // Sort: Marquee / Pinned first, then newest
        list.sort((a, b) => {
          if (a.isMarquee && !b.isMarquee) return -1;
          if (!a.isMarquee && b.isMarquee) return 1;
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
        });
        setAnnouncements(list);
      },
      (err) => {
        console.warn('System announcements listener notice:', err);
      }
    );

    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setType('general');
    setTargetAudience('all');
    setIsPinned(false);
    setIsMarquee(true);
    setMarqueeSpeed('normal');
    setFontFamily('sans');
    setFontSize('sm');
    setFontWeight('bold');
    setTextColor('#fbbf24');
    setBgColor('rgba(24, 24, 27, 0.95)');
    setIsBlinking(false);
    setCustomIcon('megaphone');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SystemAnnouncement) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setType(item.type);
    setTargetAudience(item.targetAudience);
    setIsPinned(item.isPinned);
    setIsMarquee(item.isMarquee ?? true);
    setMarqueeSpeed(item.marqueeSpeed ?? 'normal');
    setFontFamily(item.fontFamily ?? 'sans');
    setFontSize(item.fontSize ?? 'sm');
    setFontWeight(item.fontWeight ?? 'bold');
    setTextColor(item.textColor ?? '#fbbf24');
    setBgColor(item.bgColor ?? 'rgba(24, 24, 27, 0.95)');
    setIsBlinking(item.isBlinking ?? false);
    setCustomIcon(item.customIcon ?? 'megaphone');
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Vui lòng điền nội dung thông báo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<SystemAnnouncement> = {
        title: title.trim(),
        content: content.trim(),
        type,
        targetAudience,
        isPinned,
        isMarquee,
        marqueeSpeed,
        fontFamily,
        fontSize,
        fontWeight,
        textColor,
        bgColor,
        borderColor: `${textColor}40`,
        isBlinking,
        customIcon,
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Quản Trị Viên',
        createdAt: editingItem?.createdAt || serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'systemAnnouncements', editingItem.id), payload);
        await logSystemActivity({
          action: 'CREATE_ANNOUNCEMENT',
          actionTitle: 'Cập Nhật Bản Tin Hệ Thống',
          targetType: 'system_announcement',
          targetId: editingItem.id,
          targetName: title.trim() || 'Bản tin',
          details: `Đã cập nhật bản tin [${isMarquee ? 'BẢNG CHẠY CHỮ' : 'TĨNH'}]: "${title.trim()} - ${content.trim()}"`,
          severity: 'info'
        });
        showToast('Đã cập nhật thông báo thành công!');
      } else {
        const docRef = await addDoc(collection(db, 'systemAnnouncements'), payload);
        await logSystemActivity({
          action: 'CREATE_ANNOUNCEMENT',
          actionTitle: 'Phát Bản Tin Chạy Chữ / Thông Báo',
          targetType: 'system_announcement',
          targetId: docRef.id,
          targetName: title.trim() || 'Bản tin',
          details: `Đã phát thông báo mới [${isMarquee ? 'BẢNG CHẠY CHỮ' : 'TĨNH'} - Màu: ${textColor}]: "${content.trim()}"`,
          severity: type === 'urgent' ? 'warning' : 'info'
        });
        showToast('Đã phát thông báo toàn sàn thành công!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (item: SystemAnnouncement) => {
    if (!window.confirm(`Xóa thông báo "${item.title || item.content}"?`)) return;

    try {
      await deleteDoc(doc(db, 'systemAnnouncements', item.id));
      await logSystemActivity({
        action: 'DELETE_ANNOUNCEMENT',
        actionTitle: 'Xóa Bản Tin Hệ Thống',
        targetType: 'system_announcement',
        targetId: item.id,
        targetName: item.title || item.content,
        details: `Đã xóa thông báo: "${item.title || item.content}"`,
        severity: 'info'
      });
      showToast('Đã xóa thông báo.');
    } catch (err: any) {
      showToast(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const renderIcon = (iconName?: string, size = 16, className = '') => {
    switch (iconName) {
      case 'megaphone':
        return <Megaphone size={size} className={className} />;
      case 'flame':
        return <Flame size={size} className={className} />;
      case 'bell':
        return <Bell size={size} className={className} />;
      case 'crown':
        return <Crown size={size} className={className} />;
      case 'sparkles':
        return <Sparkles size={size} className={className} />;
      case 'alert':
        return <AlertTriangle size={size} className={className} />;
      case 'heart':
        return <Heart size={size} className={className} />;
      case 'star':
        return <Star size={size} className={className} />;
      case 'radio':
      default:
        return <Radio size={size} className={className} />;
    }
  };

  const getFontFamilyClass = (font?: string) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono tracking-tight';
      case 'display':
        return 'font-sans tracking-wide uppercase font-black';
      case 'handwriting':
        return 'font-serif italic';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getFontSizeClass = (size?: string) => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      case 'sm':
      default:
        return 'text-sm';
    }
  };

  const getFontWeightClass = (weight?: string) => {
    switch (weight) {
      case 'normal':
        return 'font-normal';
      case 'semibold':
        return 'font-semibold';
      case 'black':
        return 'font-black';
      case 'bold':
      default:
        return 'font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Bảng Thông Báo Chạy Chữ & Bản Tin Toàn Sàn</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live Marquee Ticker
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tùy biến chữ chạy ngang màn hình, phông chữ, bảng màu sắc rực rỡ, cỡ chữ và tốc độ chuyển động.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Tạo Bảng Chạy Chữ / Bản Tin</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Radio size={16} className="text-cyan-400" />
            <span>Danh Sách Bản Tin & Bảng Chạy Đang Hoạt Động ({announcements.length})</span>
          </h3>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
            <Radio size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 font-medium">Chưa có thông báo nào được phát.</p>
            <p className="text-xs text-zinc-500 mt-1">Bấm "Tạo Bảng Chạy Chữ / Bản Tin" để tạo thông báo với phong cách tùy chỉnh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((item) => {
              const fontClass = getFontFamilyClass(item.fontFamily);
              const sizeClass = getFontSizeClass(item.fontSize);
              const weightClass = getFontWeightClass(item.fontWeight);

              return (
                <div
                  key={item.id}
                  style={{
                    borderColor: item.borderColor || (item.textColor ? `${item.textColor}50` : '#3f3f46'),
                    backgroundColor: item.bgColor || 'rgba(24, 24, 27, 0.95)',
                  }}
                  className="p-5 border rounded-2xl space-y-3 relative hover:scale-[1.01] transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div 
                        style={{ color: item.textColor || '#fbbf24' }} 
                        className={`p-1.5 rounded-xl bg-black/40 border border-white/10 ${item.isBlinking ? 'animate-bounce' : ''}`}
                      >
                        {renderIcon(item.customIcon, 15)}
                      </div>

                      {item.isMarquee && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          ✦ CHẠY CHỮ ({item.marqueeSpeed?.toUpperCase() || 'NORMAL'})
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 text-zinc-300 border border-white/10">
                        {item.fontFamily?.toUpperCase() || 'SANS'} • {item.fontSize?.toUpperCase() || 'SM'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1">
                        {item.targetAudience === 'all' ? 'Tất cả' : item.targetAudience === 'vip' ? 'Chỉ VIP' : 'Chỉ Tác Giả'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(item)}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950 text-zinc-300 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    {item.title && (
                      <h4 
                        style={{ color: item.textColor || '#fbbf24' }} 
                        className={`text-sm font-black leading-snug ${fontClass}`}
                      >
                        {item.title}
                      </h4>
                    )}
                    <p 
                      style={{ color: item.textColor || '#e4e4e7' }} 
                      className={`mt-1 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-black/30 border border-white/5 ${fontClass} ${sizeClass} ${weightClass}`}
                    >
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                    <span>Đăng bởi: {item.createdByName}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {item.createdAt ? new Date(item.createdAt.toDate?.() || item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL WITH LIVE PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Chỉnh Sửa Bảng Thông Báo' : 'Soạn Bảng Thông Báo Chạy Chữ & Bản Tin'}
                  </h3>
                  <p className="text-xs text-zinc-400">Tùy biến phông chữ, màu sắc, kích thước và biểu tượng trực quan</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs custom-scrollbar">
              {/* LIVE REAL-TIME PREVIEW BOX */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={13} />
                    <span>Xem Trước Trực Tiếp (Live Preview)</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">Hiển thị chuẩn giao diện người dùng</span>
                </div>

                <div
                  style={{
                    color: textColor,
                    backgroundColor: bgColor,
                    borderColor: `${textColor}50`,
                  }}
                  className={`w-full p-3 sm:p-4 rounded-2xl border shadow-xl flex items-center gap-3 overflow-hidden transition-all ${
                    isBlinking ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded-xl bg-black/40 border border-white/10 ${isBlinking ? 'animate-bounce' : ''}`}>
                    {renderIcon(customIcon, 16)}
                  </div>

                  {isMarquee ? (
                    <div className="flex-1 overflow-hidden relative">
                      <div className={marqueeSpeed === 'slow' ? 'animate-marquee-slow' : marqueeSpeed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee-normal'}>
                        <div className={`flex items-center gap-12 pr-12 whitespace-nowrap ${getFontFamilyClass(fontFamily)} ${getFontSizeClass(fontSize)} ${getFontWeightClass(fontWeight)}`}>
                          <span>{title ? `【${title.toUpperCase()}】: ` : ''}{content || 'Nội dung thông báo chạy chữ mẫu...'}</span>
                          <span className="opacity-50">✦</span>
                          <span>{title ? `【${title.toUpperCase()}】: ` : ''}{content || 'Nội dung thông báo chạy chữ mẫu...'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      {title && <p className="font-bold text-xs mb-0.5">{title}</p>}
                      <p className={`${getFontFamilyClass(fontFamily)} ${getFontSizeClass(fontSize)} ${getFontWeightClass(fontWeight)}`}>
                        {content || 'Nội dung bản tin mẫu...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: TEXT CONTENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Tiêu Đề Bản Tin (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: KHUYẾN MÃI VIP LỄ HỘI, BẢO TRÌ NÂNG CẤP..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Nội Dung Chữ Hiển Thị *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung chi tiết chạy chữ hoặc hiển thị bản tin..."
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500 resize-none"
                    required
                  />
                </div>
              </div>

              {/* SECTION: TYPOGRAPHY CUSTOMIZATION (PHÔNG CHỮ, CỠ CHỮ, ĐỘ ĐẬM) */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Type size={15} className="text-amber-400" />
                  <span>Tùy Chỉnh Phông Chữ & Kích Thước</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Font Family */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      1. Phông Chữ (Font Family)
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="sans">Sans-Serif (Hiện đại / Chuẩn)</option>
                      <option value="serif">Serif (Cổ điển / Sang trọng)</option>
                      <option value="mono">Monospace (Lập trình / Số liệu)</option>
                      <option value="display">Display (Nổi bật / In hoa)</option>
                      <option value="handwriting">Handwriting (Nghệ thuật / Thư pháp)</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      2. Cỡ Chữ (Font Size)
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="xs">XS - 12px (Rất nhỏ)</option>
                      <option value="sm">SM - 14px (Nhỏ gọn)</option>
                      <option value="base">BASE - 16px (Chuẩn)</option>
                      <option value="lg">LG - 18px (Lớn)</option>
                      <option value="xl">XL - 20px (Rất lớn)</option>
                      <option value="2xl">2XL - 24px (Cực đại)</option>
                    </select>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      3. Độ Đậm (Font Weight)
                    </label>
                    <select
                      value={fontWeight}
                      onChange={(e) => setFontWeight(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="normal">Normal (Bình thường)</option>
                      <option value="semibold">Semibold (Vừa phải)</option>
                      <option value="bold">Bold (Đậm nổi bật)</option>
                      <option value="black">Black (Siêu dày)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: COLOR CUSTOMIZATION (MÀU CHỮ & MÀU NỀN) */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Palette size={15} className="text-cyan-400" />
                  <span>Tùy Chỉnh Màu Sắc & Nền Bảng Chạy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Text Color Swatches & Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Màu Chữ (Text Color)
                      </label>
                      <span className="font-mono text-[10px] text-zinc-400">{textColor}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setTextColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                            textColor === c.hex ? 'ring-2 ring-white scale-110 border-white' : 'border-black/40 hover:scale-105'
                          }`}
                          title={c.label}
                        />
                      ))}
                      <div className="flex items-center gap-1.5 ml-1">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-7 h-7 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Color Swatches */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Màu Nền (Background)
                      </label>
                      <span className="font-mono text-[10px] text-zinc-400">Nền Tối Sang Trọng</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {PRESET_BG_COLORS.map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setBgColor(b.hex)}
                          style={{ backgroundColor: b.hex }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            bgColor === b.hex ? 'border-cyan-400 text-white ring-1 ring-cyan-400' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: MARQUEE MOTION & ICONS */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Sliders size={15} className="text-emerald-400" />
                  <span>Hiệu Ứng Chuyển Động & Biểu Tượng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mode Toggle */}
                  <label className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-bold text-xs text-white">Chạy Chữ (Marquee)</p>
                      <p className="text-[10px] text-zinc-400">Chuyển động liên tục</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isMarquee}
                      onChange={(e) => setIsMarquee(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                  </label>

                  {/* Marquee Speed */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Tốc Độ Chạy
                    </label>
                    <select
                      value={marqueeSpeed}
                      onChange={(e) => setMarqueeSpeed(e.target.value as any)}
                      disabled={!isMarquee}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 disabled:opacity-40"
                    >
                      <option value="slow">Chậm (Slow - 35s)</option>
                      <option value="normal">Vừa (Normal - 20s)</option>
                      <option value="fast">Nhanh (Fast - 10s)</option>
                    </select>
                  </div>

                  {/* Choose Icon */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Biểu Tượng (Icon)
                    </label>
                    <select
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="megaphone">📣 Loa Thông Báo (Megaphone)</option>
                      <option value="radio">📻 Đài Phát Thanh (Radio)</option>
                      <option value="flame">🔥 Ngọn Lửa Hot (Flame)</option>
                      <option value="crown">👑 Vương Miện VIP (Crown)</option>
                      <option value="sparkles">✨ Ánh Sao Tri Ân (Sparkles)</option>
                      <option value="bell">🔔 Chuông Báo (Bell)</option>
                      <option value="alert">⚠️ Cảnh Báo (Alert)</option>
                      <option value="heart">❤️ Trái Tim Yêu Thương (Heart)</option>
                      <option value="star">⭐ Ngôi Sao Ưu Đãi (Star)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-bold text-xs text-white">Hiệu Ứng Nhấp Nháy (Blink)</p>
                      <p className="text-[10px] text-zinc-400">Gây chú ý mạnh mẽ</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBlinking}
                      onChange={(e) => setIsBlinking(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                  </label>

                  <label className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-bold text-xs text-white">Ghim Lên Đầu Trang</p>
                      <p className="text-[10px] text-zinc-400">Ưu tiên hiển thị trước</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* AUDIENCE & TYPE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Loại Bản Tin
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="general">Bản Tin Chung</option>
                    <option value="event">Sự Kiện & Ưu Đãi</option>
                    <option value="urgent">Khẩn Cấp</option>
                    <option value="maintenance">Bảo Trì Hệ Thống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Đối Tượng Nhận
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  >
                    <option value="all">Tất Cả Người Dùng</option>
                    <option value="vip">Chỉ Thành Viên VIP</option>
                    <option value="authors">Chỉ Tác Giả eKYC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Sparkles size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{editingItem ? 'Lưu Bản Tin' : 'Phát Thông Báo Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
