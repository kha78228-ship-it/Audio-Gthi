import React, { useState, useEffect, useMemo } from 'react';
import {
  Headphones,
  GraduationCap,
  Heart,
  Sparkles,
  ArrowRight,
  Compass,
  BookOpen,
  Gamepad2,
  ChefHat,
  Search,
  Wallet,
  Globe,
  LogIn,
  Bell,
  User as UserIcon,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Calendar,
  MapPin,
  Mic,
  Maximize2,
  Minimize2,
  Clock,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { playMetallicCardTapSound } from '../utils/luxurySoundFX';
import { LivingPortraitShowcase } from './portal/LivingPortraitShowcase';

interface HaevyEcosystemLandingViewProps {
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onSelectMode: (mode: 'audio' | 'edu' | 'dating' | 'quiz' | 'study' | 'game' | 'cooking' | 'finance' | 'browser' | 'lite' | 'maps' | 'ai') => void;
  onToggleVoiceListen?: () => void;
  isVoiceListening?: boolean;
  isDesktop?: boolean;
  onOpenOnboardingTour?: () => void;
}

type CategoryFilter = 'all' | 'core' | 'lifestyle' | 'creative';

interface EcosystemModule {
  id: 'audio' | 'edu' | 'dating' | 'quiz' | 'study' | 'game' | 'cooking' | 'finance' | 'browser' | 'lite' | 'maps' | 'ai';
  index: string;
  name: string;
  subtitle: string;
  category: 'core' | 'lifestyle' | 'creative';
  categoryLabel: string;
  description: string;
  metricsLabel: string;
  metricsValue: string;
  accentHex: string;
  spanClass: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  sceneType: 'waveform' | 'constellation' | 'radar' | 'compass' | 'blocks' | 'pulse' | 'grid' | 'ledger';
}

const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    id: 'audio',
    index: '01',
    name: 'Haevy Audio Studio',
    subtitle: 'Không gian thính giác 3D · Podcast & Sách nói bản quyền',
    category: 'core',
    categoryLabel: 'Thính giác',
    description: 'Trải nghiệm âm thanh vòm Spatial Audio 24-bit cùng hệ thống cân bằng tần số thông minh, lời bài hát đồng bộ thời gian thực và phòng nghe chung.',
    metricsLabel: 'Độ phân giải',
    metricsValue: '24-bit / 96kHz',
    accentHex: '#F59E0B',
    spanClass: 'lg:col-span-7',
    icon: Headphones,
    features: ['Spatial Audio 3D', 'Đồng bộ Lyrics thực', 'Phòng nghe chung Live', 'EQ 10 dải tần'],
    sceneType: 'waveform'
  },
  {
    id: 'edu',
    index: '02',
    name: 'Haevy Edu & Học thuật',
    subtitle: 'Bàn học All-in-One · Sơ đồ tư duy & Luyện đề thực chiến',
    category: 'core',
    categoryLabel: 'Tri thức',
    description: 'Môi trường nghiên cứu chuyên sâu kết hợp Flashcard lặp lại ngắt quãng (Spaced Repetition), bảng kế hoạch Kanban, đồng hồ Pomodoro và kho học liệu chuẩn hóa.',
    metricsLabel: 'Kho học liệu',
    metricsValue: '12,400+ Chuyên đề',
    accentHex: '#10B981',
    spanClass: 'lg:col-span-5',
    icon: GraduationCap,
    features: ['Spaced Repetition', 'Mindmap tương tác', 'Pomodoro & Kanban', 'Phòng thi bấm giờ'],
    sceneType: 'constellation'
  },
  {
    id: 'maps',
    index: '03',
    name: 'Haevy Maps & Gia đình',
    subtitle: 'Bản đồ vị trí người thân · Vùng an toàn & Nhật ký hành trình',
    category: 'lifestyle',
    categoryLabel: 'Định vị',
    description: 'Kết nối vị trí thời gian thực với gia đình, người thương và bạn bè. Tự động thông báo khi đến trường, cơ quan và hỗ trợ dẫn đường đa phương thức.',
    metricsLabel: 'Độ chính xác',
    metricsValue: '< 3.5 Mét',
    accentHex: '#38BDF8',
    spanClass: 'lg:col-span-5',
    icon: MapPin,
    features: ['Chia sẻ vị trí nhóm', 'Cảnh báo vùng an toàn', 'Trạng thái pin & Tốc độ', 'SOS khẩn cấp 1 chạm'],
    sceneType: 'radar'
  },
  {
    id: 'browser',
    index: '04',
    name: 'Haevy Internet',
    subtitle: 'Trình duyệt toàn màn hình · Chia đôi màn hình & Chế độ đọc',
    category: 'core',
    categoryLabel: 'Trình duyệt',
    description: 'Trình duyệt nghiên cứu đa tab toàn màn hình tích hợp vượt chặn nhúng Proxy, ghi chú song song và lọc nhiễu văn bản giúp đọc tài liệu tập trung.',
    metricsLabel: 'Tốc độ tải',
    metricsValue: '0.18 Giây',
    accentHex: '#818CF8',
    spanClass: 'lg:col-span-7',
    icon: Globe,
    features: ['Đa tab toàn màn hình', 'Split-View Ghi chú', 'Reader Mode sạch', 'Lưu trang ngoại tuyến'],
    sceneType: 'compass'
  },
  {
    id: 'study',
    index: '05',
    name: 'Haevy Study Pro',
    subtitle: 'Lộ trình học tập cá nhân hóa · Thống kê chuyên cần',
    category: 'core',
    categoryLabel: 'Lộ trình',
    description: 'Theo dõi tiến độ mục tiêu dài hạn, phân tích biểu đồ giờ học sâu và xây dựng thói quen kỷ luật mỗi ngày.',
    metricsLabel: 'Tỷ lệ hoàn thành',
    metricsValue: '94.2%',
    accentHex: '#34D399',
    spanClass: 'lg:col-span-4',
    icon: BookOpen,
    features: ['Chuỗi ngày học Streak', 'Phân tích hiệu suất', 'Mục tiêu theo tuần'],
    sceneType: 'grid'
  },
  {
    id: 'finance',
    index: '06',
    name: 'Haevy Finance',
    subtitle: 'Quản trị tài chính cá nhân · Sổ thu chi & Quỹ tiết kiệm',
    category: 'lifestyle',
    categoryLabel: 'Tài chính',
    description: 'Kiểm soát dòng tiền minh bạch, phân bổ ngân sách theo quy tắc 6 chiếc lọ và dự báo mục tiêu tự do tài chính.',
    metricsLabel: 'Bảo mật sổ cái',
    metricsValue: 'AES-256',
    accentHex: '#FBBF24',
    spanClass: 'lg:col-span-4',
    icon: Wallet,
    features: ['Báo cáo dòng tiền', 'Quỹ mục tiêu', 'Cảnh báo vượt hạn mức'],
    sceneType: 'ledger'
  },
  {
    id: 'dating',
    index: '07',
    name: 'Haevy Dating & Tri kỷ',
    subtitle: 'Kết nối đồng điệu qua gu âm nhạc và tri thức',
    category: 'lifestyle',
    categoryLabel: 'Kết nối',
    description: 'Không gian trò chuyện tinh tế, ghép đôi dựa trên tần số cảm xúc, sách yêu thích và mục tiêu phát triển bản thân.',
    metricsLabel: 'Độ tương hợp',
    metricsValue: '98% Match',
    accentHex: '#F43F5E',
    spanClass: 'lg:col-span-4',
    icon: Heart,
    features: ['Ghép đôi theo Gu nghe', 'Phòng trò chuyện ẩn danh', 'Hồ sơ xác thực'],
    sceneType: 'pulse'
  },
  {
    id: 'cooking',
    index: '08',
    name: 'Haevy Kitchen',
    subtitle: 'Nghệ thuật ẩm thực · Thực đơn dinh dưỡng & Bấm giờ nấu',
    category: 'lifestyle',
    categoryLabel: 'Ẩm thực',
    description: 'Kho công thức món Việt và Á-Âu chuẩn vị, tự động quy đổi khẩu phần, tính toán Calo và hướng dẫn từng bước trực quan.',
    metricsLabel: 'Công thức chuẩn',
    metricsValue: '1,850+ Món',
    accentHex: '#FB923C',
    spanClass: 'lg:col-span-4',
    icon: ChefHat,
    features: ['Tính Macro & Calo', 'Bộ đếm giờ đa bếp', 'Danh sách đi chợ'],
    sceneType: 'blocks'
  },
  {
    id: 'quiz',
    index: '09',
    name: 'Haevy Quiz Arena',
    subtitle: 'Đấu trường phản xạ tư duy & Trắc nghiệm tốc độ',
    category: 'creative',
    categoryLabel: 'Phản xạ',
    description: 'Thử thách kiến thức đa lĩnh vực với bảng xếp hạng thời gian thực và giải thích chi tiết sau mỗi câu hỏi.',
    metricsLabel: 'Câu hỏi tuyển chọn',
    metricsValue: '25,000+',
    accentHex: '#A78BFA',
    spanClass: 'lg:col-span-4',
    icon: Sparkles,
    features: ['Đấu trường tốc độ', 'Giải thích chuyên sâu', 'Huy hiệu học thuật'],
    sceneType: 'constellation'
  },
  {
    id: 'game',
    index: '10',
    name: 'Haevy Arcade',
    subtitle: 'Tổ hợp giải trí rèn luyện trí nhớ và logic',
    category: 'creative',
    categoryLabel: 'Giải trí',
    description: 'Thư giãn lành mạnh sau giờ làm việc với các tựa game cờ thuật, giải đố không gian và rèn luyện phản xạ.',
    metricsLabel: 'Tốc độ khung hình',
    metricsValue: '60 FPS',
    accentHex: '#2DD4BF',
    spanClass: 'lg:col-span-4',
    icon: Gamepad2,
    features: ['Giải đố không gian', 'Cờ chiến thuật', 'Lưu điểm đám mây'],
    sceneType: 'blocks'
  },
  {
    id: 'lite',
    index: '11',
    name: 'Haevy Lite & Cửa hàng',
    subtitle: 'Bộ sưu tập khung viền, hiệu ứng trang bị & Nhiệm vụ ngày',
    category: 'creative',
    categoryLabel: 'Cá nhân hóa',
    description: 'Cá nhân hóa diện mạo hồ sơ với khung Avatar sống động, điểm danh nhận Lite Coin và vòng quay quà tặng.',
    metricsLabel: 'Vật phẩm độc quyền',
    metricsValue: '140+ Hiệu ứng',
    accentHex: '#E879F9',
    spanClass: 'lg:col-span-6',
    icon: Layers,
    features: ['Xem trước trang bị trực tiếp', 'Điểm danh nhận quà', 'Combo ưu đãi mùa'],
    sceneType: 'pulse'
  },
  {
    id: 'ai',
    index: '12',
    name: 'Trợ lý Phân tích Tài liệu',
    subtitle: 'Tổng hợp luận điểm, sơ đồ hóa kiến thức & Giải thích bản chất',
    category: 'core',
    categoryLabel: 'Nghiên cứu',
    description: 'Hỗ trợ phân tích nguyên lý từ tài liệu học tập, trích xuất ý chính cô đọng và đặt câu hỏi gợi mở tư duy phản biện.',
    metricsLabel: 'Phản hồi',
    metricsValue: 'Tức thì',
    accentHex: '#60A5FA',
    spanClass: 'lg:col-span-6',
    icon: Compass,
    features: ['Tóm tắt cốt lõi', 'Giải thích nguyên lý', 'Hỏi đáp theo ngữ cảnh'],
    sceneType: 'waveform'
  }
];

// Interactive Micro-Scene Renderer inside Bento Cards
const ModuleSceneGraphic: React.FC<{ type: EcosystemModule['sceneType']; accent: string; isHovered: boolean }> = ({
  type,
  accent,
  isHovered
}) => {
  if (type === 'waveform') {
    return (
      <div className="relative h-16 w-full flex items-end gap-1.5 px-2 overflow-hidden opacity-85">
        {Array.from({ length: 24 }).map((_, idx) => {
          const baseHeight = 25 + Math.sin(idx * 0.6) * 18 + ((idx * 13) % 25);
          return (
            <motion.div
              key={idx}
              animate={{
                height: isHovered
                  ? [`${baseHeight}%`, `${Math.min(95, baseHeight + 35)}%`, `${Math.max(18, baseHeight - 15)}%`, `${baseHeight}%`]
                  : `${baseHeight}%`
              }}
              transition={{
                duration: 1.2 + (idx % 4) * 0.2,
                repeat: isHovered ? Infinity : 0,
                ease: 'easeInOut'
              }}
              style={{
                backgroundColor: idx % 3 === 0 ? accent : 'rgba(255,255,255,0.16)'
              }}
              className="flex-1 rounded-t-sm min-w-[3px] transition-colors duration-300"
            />
          );
        })}
      </div>
    );
  }

  if (type === 'radar') {
    return (
      <div className="relative h-16 w-full flex items-center justify-end pr-4 overflow-hidden">
        <div className="relative w-14 h-14 rounded-full border border-white/15 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-white/10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: isHovered ? 2.4 : 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 70%, ${accent}55 100%)`
            }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
          />
        </div>
      </div>
    );
  }

  if (type === 'constellation') {
    return (
      <svg className="h-16 w-full overflow-visible opacity-80" viewBox="0 0 240 60">
        <motion.path
          d="M 16 44 L 68 18 L 124 38 L 178 14 L 222 34"
          fill="none"
          stroke={accent}
          strokeWidth="1.2"
          strokeOpacity="0.5"
          animate={{ pathLength: isHovered ? [0.4, 1, 0.4] : 1 }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {[
          { cx: 16, cy: 44 },
          { cx: 68, cy: 18 },
          { cx: 124, cy: 38 },
          { cx: 178, cy: 14 },
          { cx: 222, cy: 34 }
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.cx} cy={pt.cy} r={isHovered ? 4 : 3} fill={accent} />
            <circle cx={pt.cx} cy={pt.cy} r={8} fill={accent} fillOpacity="0.15" />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div className="relative h-16 w-full flex items-center justify-between gap-2 px-1 opacity-75">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
        <motion.div
          animate={{ x: isHovered ? ['0%', '85%', '0%'] : '20%' }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-[2px] -top-[0.5px] absolute rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
    </div>
  );
};

export const HaevyEcosystemLandingView: React.FC<HaevyEcosystemLandingViewProps> = ({
  onOpenAuth,
  onOpenNotifications,
  unreadNotificationCount,
  onToggleFullscreen,
  isFullscreen,
  onSelectMode,
  onToggleVoiceListen,
  isVoiceListening,
  onOpenOnboardingTour
}) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);
  const [previewModule, setPreviewModule] = useState<EcosystemModule | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDockCompact, setIsDockCompact] = useState(false);
  const [isDockHovered, setIsDockHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Auto-compact the Floating Dock when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setIsDockCompact(window.scrollY > 180);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for live onboarding demo actions
  useEffect(() => {
    const handleDemoDock = () => {
      setIsDockCompact((prev) => !prev);
      if (soundEnabled) playMetallicCardTapSound();
    };
    const handleDemoBento = () => {
      setActiveCategory((prev) =>
        prev === 'all'
          ? 'core'
          : prev === 'core'
          ? 'lifestyle'
          : prev === 'lifestyle'
          ? 'creative'
          : 'all'
      );
      if (soundEnabled) playMetallicCardTapSound();
    };

    window.addEventListener('haevy-onboarding-demo-dock', handleDemoDock);
    window.addEventListener('haevy-onboarding-demo-bento', handleDemoBento);
    return () => {
      window.removeEventListener('haevy-onboarding-demo-dock', handleDemoDock);
      window.removeEventListener('haevy-onboarding-demo-bento', handleDemoBento);
    };
  }, [soundEnabled]);

  const filteredModules = useMemo(() => {
    return ECOSYSTEM_MODULES.filter((mod) => {
      const matchesCategory = activeCategory === 'all' || mod.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        mod.name.toLowerCase().includes(q) ||
        mod.subtitle.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.features.some((f) => f.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const greetingText = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const handleModuleLaunch = (modeId: EcosystemModule['id']) => {
    if (soundEnabled) playMetallicCardTapSound();
    onSelectMode(modeId);
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F2EB] selection:bg-amber-500/30 selection:text-amber-100 relative overflow-x-hidden">
      {/* Subtle Architectural Background Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-48 left-1/4 w-[680px] h-[680px] rounded-full opacity-20 blur-[150px] animate-breathe-light"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[540px] h-[540px] rounded-full opacity-15 blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%)' }}
        />
      </div>

      {/* Top Editorial Navigation Bar (Strictly 3 Zones) */}
      <header className="sticky top-0 z-40 h-16 bg-[#08090D]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark & Time */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 text-left group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/15 flex items-center justify-center group-hover:border-amber-400/50 transition-colors">
                <span className="font-editorial text-lg font-semibold tracking-tight text-amber-300">H</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl font-semibold tracking-tight text-[#F5F2EB]">
                  Haevy
                </span>
                <span className="text-xs text-zinc-500 hidden sm:inline">·</span>
                <span className="text-xs text-zinc-400 hidden sm:inline font-medium">
                  Atelier Không gian số
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Category Anchor Filter Links (Max 4 top-level links) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-lg p-1">
            {[
              { id: 'all', label: 'Toàn cảnh (12)' },
              { id: 'core', label: 'Trọng tâm' },
              { id: 'lifestyle', label: 'Gia đình & Đời sống' },
              { id: 'creative', label: 'Sáng tạo & Giải trí' }
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (soundEnabled) playMetallicCardTapSound();
                    setActiveCategory(tab.id as CategoryFilter);
                  }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#F5F2EB] text-[#08090D] shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Actions & User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xl:inline-block text-xs text-zinc-400 font-mono-tabular mr-2">
              {greetingText} · {formattedTime}
            </span>

            {onOpenOnboardingTour && (
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playMetallicCardTapSound();
                  onOpenOnboardingTour();
                }}
                title="Hướng dẫn tương tác Haevy Portal"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Hướng dẫn</span>
              </button>
            )}

            {onToggleVoiceListen && (
              <button
                type="button"
                data-onboarding="voice-navigation"
                onClick={onToggleVoiceListen}
                title="Điều khiển giọng nói"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isVoiceListening
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : 'bg-white/[0.03] border-white/[0.07] text-zinc-300 hover:text-white hover:border-white/15'
                }`}
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span className="hidden lg:inline text-xs font-medium">
                  {isVoiceListening ? 'Đang nghe...' : 'Giọng nói'}
                </span>
              </button>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm phản hồi' : 'Bật âm phản hồi'}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/15 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenNotifications}
              title="Thông báo hệ thống"
              className="relative p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/15 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-400 text-[#08090D] text-[10px] font-bold font-mono-tabular rounded">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ màn hình' : 'Toàn màn hình'}
              className="hidden sm:flex p-2 rounded-lg bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/15 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-xs font-medium text-[#F5F2EB] whitespace-nowrap shrink-0 transition-all"
            >
              {user ? (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span className="max-w-[110px] truncate">{user.displayName || user.email || 'Thành viên'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tài khoản</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-24">
        {/* HERO SECTION: Editorial Split Layout + Interactive Living Portrait Stage */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-14 border-b border-white/[0.08]">
          {/* Left Column: Editorial Typography & Command Launcher (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              {/* Unboxed Editorial Meta Line */}
              <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.16em] text-amber-300/90 font-medium">
                <span>Kiến trúc Đa phân hệ</span>
                <span className="text-zinc-600">·</span>
                <span className="font-mono-tabular text-zinc-400">Phiên bản 4.2 Studio</span>
              </div>

              <h1
                className="font-editorial font-semibold text-[#F5F2EB] tracking-[-0.02em] leading-[1.05]"
                style={{ fontSize: 'clamp(2.5rem, 4.5vw + 0.5rem, 4.4rem)' }}
              >
                Chạm vào nhịp sống của <span className="italic font-normal text-amber-200">tri thức</span> & cảm xúc.
              </h1>

              <p className="text-base sm:text-lg text-zinc-300/90 leading-relaxed font-normal max-w-[54ch]">
                Không còn những giao diện rời rạc. Haevy kết hợp phòng thu âm thanh 3D, bàn học học thuật chuyên sâu, bản đồ kết nối người thân và trình duyệt toàn màn hình trong một không gian điêu khắc ánh sáng sống động.
              </p>
            </div>

            {/* Instant Search & Quick Filter Bar */}
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phân hệ: Audio 3D, Bản đồ người thân, Bàn học Edu, Trình duyệt..."
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5F2EB] placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.06] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Primary Launch Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => handleModuleLaunch('audio')}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#F5F2EB] hover:bg-white text-[#08090D] font-semibold text-sm whitespace-nowrap shrink-0 transition-all shadow-sm"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Mở Phòng thu Audio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleModuleLaunch('edu')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-[#F5F2EB] font-medium text-sm whitespace-nowrap shrink-0 transition-all"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-300" />
                  <span>Bàn học Haevy Edu</span>
                </button>

                <button
                  onClick={() => handleModuleLaunch('maps')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-[#F5F2EB] font-medium text-sm whitespace-nowrap shrink-0 transition-all"
                >
                  <MapPin className="w-4 h-4 text-sky-300" />
                  <span>Bản đồ Người thân</span>
                </button>
              </div>
            </div>

            {/* Editorial Footnote Details */}
            <div className="pt-2 border-t border-white/[0.07] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Đồng bộ thời gian thực đa thiết bị</span>
              </div>
              <span className="text-zinc-700">·</span>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-300" />
                <span>Chân dung tương tác theo ánh nhìn chuột</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Living Portrait & Scene Stage (7 cols) */}
          <div className="lg:col-span-7">
            <LivingPortraitShowcase onSelectMode={onSelectMode} />
          </div>
        </section>

        {/* FULL-WIDTH QUANTITATIVE METRICS STRIP */}
        <section className="py-8 border-b border-white/[0.08] grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              index: '01',
              label: 'Tác phẩm Âm thanh & Podcast',
              value: '48+',
              unit: 'Bản thu Master',
              note: 'Hỗ trợ Spatial Audio 3D'
            },
            {
              index: '02',
              label: 'Chuyên đề & Thẻ nhớ Học thuật',
              value: '12,400',
              unit: 'Học liệu số',
              note: 'Tích hợp Spaced Repetition'
            },
            {
              index: '03',
              label: 'Định vị Bản đồ Gia đình',
              value: '99.8%',
              unit: 'Độ ổn định GPS',
              note: 'Cập nhật vị trí thời gian thực'
            },
            {
              index: '04',
              label: 'Phân hệ Hoạt động Đồng bộ',
              value: '12',
              unit: 'Không gian chuyên biệt',
              note: 'Chuyển đổi tức thì 0 độ trễ'
            }
          ].map((stat) => (
            <div
              key={stat.index}
              className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{stat.label}</span>
                <span className="font-mono-tabular text-zinc-600">{stat.index}</span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F5F2EB] font-mono-tabular">
                  {stat.value}
                </span>
                <span className="text-xs text-amber-300/90 font-medium">{stat.unit}</span>
              </div>
              <p className="text-xs text-zinc-500">{stat.note}</p>
            </div>
          ))}
        </section>

        {/* ASYMMETRIC BENTO ARCHITECTURE: All 12 Subsystems */}
        <section data-onboarding="ecosystem-bento" className="pt-14 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.16em] text-amber-300/90 font-medium">
                Danh mục Không gian Chuyên biệt
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F5F2EB] tracking-tight">
                Kiến trúc 12 Phân hệ Tương tác
              </h2>
            </div>

            {/* Mobile/Tablet Category Selector */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'Tất cả (12)' },
                { id: 'core', label: 'Trọng tâm (5)' },
                { id: 'lifestyle', label: 'Đời sống & Gia đình (4)' },
                { id: 'creative', label: 'Sáng tạo & Giải trí (3)' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CategoryFilter)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#F5F2EB] text-[#08090D] border-[#F5F2EB]'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.07] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {filteredModules.map((mod) => {
              const IconComponent = mod.icon;
              const isHovered = hoveredModuleId === mod.id;

              return (
                <motion.article
                  key={mod.id}
                  layout
                  onMouseEnter={() => {
                    setHoveredModuleId(mod.id);
                  }}
                  onMouseLeave={() => setHoveredModuleId(null)}
                  className={`${mod.spanClass} group relative rounded-2xl bg-[#10131A]/90 hover:bg-[#141822] border border-white/[0.08] hover:border-white/20 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 overflow-hidden`}
                >
                  {/* Ambient radial glow on hover */}
                  <div
                    className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-3xl"
                    style={{ backgroundColor: mod.accentHex }}
                  />

                  {/* Top Row: Index Number, Category Unboxed Text & Preview Button */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/[0.04]"
                        style={{ color: mod.accentHex }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span className="font-mono-tabular font-semibold text-zinc-300">
                            {mod.index}
                          </span>
                          <span>·</span>
                          <span>{mod.categoryLabel}</span>
                          <span>·</span>
                          <span className="font-mono-tabular text-zinc-300">{mod.metricsValue}</span>
                        </div>
                        <h3 className="font-editorial text-2xl font-semibold text-[#F5F2EB] tracking-tight mt-0.5">
                          {mod.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModule(mod);
                      }}
                      title="Xem chi tiết tính năng"
                      className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] text-zinc-400 hover:text-white transition-colors shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Interactive Animated Scene Visual */}
                  <div className="relative z-10 my-5 py-2 border-y border-white/[0.05]">
                    <ModuleSceneGraphic
                      type={mod.sceneType}
                      accent={mod.accentHex}
                      isHovered={isHovered}
                    />
                  </div>

                  {/* Description & Unboxed Feature List + Action */}
                  <div className="relative z-10 space-y-5">
                    <p className="text-sm text-zinc-300/90 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="text-xs text-zinc-400 truncate">
                        {mod.features.slice(0, 3).join(' · ')}
                      </div>

                      <button
                        onClick={() => handleModuleLaunch(mod.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] group-hover:bg-[#F5F2EB] text-[#F5F2EB] group-hover:text-[#08090D] text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
                      >
                        <span>Mở không gian</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* LIVE SCHEDULE & EDITORIAL CURATION SECTION */}
        <section className="mt-16 pt-12 border-t border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs uppercase tracking-[0.16em] text-amber-300/90 font-medium">
              Lịch trình & Sự kiện Trực tuyến
            </div>
            <h3 className="font-editorial text-3xl font-semibold text-[#F5F2EB] tracking-tight">
              Hoạt cảnh Đang diễn ra trong Hệ sinh thái
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tham gia các buổi thảo luận học thuật, phòng nghe nhạc Spatial 3D hoặc thử thách đấu trường tư duy cùng cộng đồng thành viên Haevy.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                time: '20:00 Tối nay',
                title: 'Phòng nghe Giao hưởng Đêm & Phân tích Âm học',
                host: 'Lâm Vũ Minh Anh',
                mode: 'audio' as const,
                participants: '142 đang nghe'
              },
              {
                time: '21:00 Tối nay',
                title: 'Chuyên đề Giải đề Toán & Tư duy Hệ thống',
                host: 'TS. Trần Hoàng Bách',
                mode: 'edu' as const,
                participants: '89 học viên'
              },
              {
                time: 'Cả ngày',
                title: 'Kết nối Bản đồ Gia đình & Chia sẻ Hành trình',
                host: 'Haevy Maps Live',
                mode: 'maps' as const,
                participants: 'Trực tuyến 24/7'
              }
            ].map((ev, idx) => (
              <div
                key={idx}
                onClick={() => handleModuleLaunch(ev.mode)}
                className="cursor-pointer group rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/20 p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono-tabular">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Calendar className="w-3.5 h-3.5" />
                      {ev.time}
                    </span>
                    <span>{ev.participants}</span>
                  </div>
                  <h4 className="font-editorial text-xl font-semibold text-[#F5F2EB] group-hover:text-amber-200 transition-colors">
                    {ev.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                  <span>Điều phối: {ev.host}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-white/[0.07] py-8 pb-24 px-4 sm:px-8 lg:px-12 text-xs text-zinc-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-base text-[#F5F2EB] font-semibold">Haevy Atelier</span>
            <span>·</span>
            <span>Hệ sinh thái Số Đa phương thức</span>
          </div>
          <div className="flex items-center gap-4 font-mono-tabular">
            <span>Spatial Audio 24-bit</span>
            <span>·</span>
            <span>Haevy Edu Pro</span>
            <span>·</span>
            <span>Haevy Maps Live</span>
          </div>
        </div>
      </footer>

      {/* Smart Auto-Compacting Floating Dock (Center-Bottom of Portal) */}
      <div
        data-onboarding="floating-dock"
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw]"
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-[#10131A]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        >
          {/* Quick Switcher Trigger (Alt + M) */}
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) playMetallicCardTapSound();
              window.dispatchEvent(new CustomEvent('haevy-open-quick-mode-switcher'));
            }}
            title="Mở bảng chuyển nhanh toàn bộ hệ sinh thái (Alt + M)"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-300 shrink-0" />
            {(!isDockCompact || isDockHovered) && (
              <span>Chuyển nhanh · Alt+M</span>
            )}
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Core Quick-Jump Spaces */}
          {[
            { id: 'audio' as const, label: 'Audio 3D', icon: Headphones, color: '#F59E0B' },
            { id: 'edu' as const, label: 'Haevy Edu', icon: GraduationCap, color: '#10B981' },
            { id: 'maps' as const, label: 'Bản đồ', icon: MapPin, color: '#38BDF8' },
            { id: 'browser' as const, label: 'Internet', icon: Globe, color: '#818CF8' }
          ].map((item) => {
            const DockIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleModuleLaunch(item.id)}
                title={item.label}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-transparent hover:border-white/15 text-xs font-medium text-[#F5F2EB] whitespace-nowrap transition-all cursor-pointer"
              >
                <DockIcon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                {(!isDockCompact || isDockHovered) && (
                  <span className="hidden sm:inline">{item.label}</span>
                )}
              </button>
            );
          })}

          {onToggleVoiceListen && (
            <>
              <div className="w-px h-5 bg-white/10 mx-0.5" />
              <button
                type="button"
                onClick={onToggleVoiceListen}
                title="Ra lệnh bằng giọng nói"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isVoiceListening
                    ? 'bg-amber-500/25 border-amber-400/50 text-amber-300'
                    : 'bg-white/[0.03] hover:bg-white/[0.1] border-transparent text-zinc-300 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* Feature Inspection Modal */}
      <AnimatePresence>
        {previewModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModule(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#10131A] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-tabular text-amber-300">
                    PHÂN HỆ {previewModule.index} · {previewModule.categoryLabel.toUpperCase()}
                  </div>
                  <h3 className="font-editorial text-3xl font-semibold text-[#F5F2EB] mt-1">
                    {previewModule.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{previewModule.subtitle}</p>
                </div>
                <button
                  onClick={() => setPreviewModule(null)}
                  className="p-2 rounded-lg bg-white/[0.05] text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">{previewModule.description}</p>

              <div className="space-y-2.5">
                <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                  Tính năng cốt lõi
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {previewModule.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: previewModule.accentHex }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setPreviewModule(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xs font-medium text-zinc-300 hover:text-white"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const id = previewModule.id;
                    setPreviewModule(null);
                    handleModuleLaunch(id);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5F2EB] text-[#08090D] text-xs font-semibold hover:bg-white transition-all"
                >
                  <span>Truy cập ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
