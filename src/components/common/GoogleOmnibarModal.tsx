import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Mic, 
  MicOff, 
  Music, 
  Compass, 
  MessageSquare, 
  Wallet, 
  GitFork, 
  Sparkles, 
  Gamepad2, 
  Heart, 
  Radio, 
  Sun, 
  Orbit, 
  ShieldCheck, 
  Crown, 
  Clock, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Flame, 
  CornerDownLeft,
  Command,
  GraduationCap,
  MapPin,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EcosystemMode, ActiveTab, Track } from '../../types';
import { toast } from '../../utils/toast';

export interface GoogleOmnibarModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
}

interface SearchItem {
  id: string;
  category: 'track' | 'mode' | 'tool' | 'action';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
  track?: Track;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'track', label: 'Âm nhạc & Bài hát' },
  { id: 'mode', label: 'Phân hệ Sinh thái' },
  { id: 'tool', label: 'Tiện ích & Tính năng' }
];

export function GoogleOmnibarModal({
  isOpen,
  onClose,
  tracks = [],
  onPlayTrack,
  onSelectMode,
  onSelectTab
}: GoogleOmnibarModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haevy_omnibar_recents');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter(s => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('haevy_omnibar_recents', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent search:', e);
    }
  };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Voice Search using Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warning('Trình duyệt của bạn chưa hỗ trợ tìm kiếm bằng giọng nói trực tiếp.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        saveRecentSearch(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Pre-configured ecosystem modes search items
  const ecosystemSearchItems: SearchItem[] = useMemo(() => [
    {
      id: 'mode-audio',
      category: 'mode',
      title: 'Haevy Audio (Nghe nhạc & Podcast)',
      subtitle: 'Khám phá kho audio, bảng xếp hạng, nghệ sĩ và danh sách phát',
      icon: Music,
      badge: 'Chính',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      action: () => {
        onSelectMode?.('audio', 'home');
        onClose();
      }
    },
    {
      id: 'mode-messages',
      category: 'mode',
      title: 'Haevy Messages & Social Feed',
      subtitle: 'Tin nhắn mã hóa E2EE, bảng tin ảnh bạn bè, câu chuyện 24h',
      icon: MessageSquare,
      badge: 'Cộng đồng',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      action: () => {
        onSelectMode?.('messages', 'feed' as any);
        onClose();
      }
    },
    {
      id: 'mode-family',
      category: 'mode',
      title: 'Gia Phả Dòng Họ & Lịch Giỗ Tổ',
      subtitle: 'Cây phả hệ đa thế hệ, tra cứu ngày giỗ Âm-Dương, quỹ khuyến học tộc',
      icon: GitFork,
      badge: 'Dòng Họ',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      action: () => {
        onSelectMode?.('family_tree');
        onClose();
      }
    },
    {
      id: 'mode-finance',
      category: 'mode',
      title: 'Ví Xu & Quản Lý Tài Chính Gia Đình',
      subtitle: 'Theo dõi chi tiêu thông minh, nạp/rút Xu Haevy, quỹ chung người thương',
      icon: Wallet,
      badge: 'Ví Xu',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      action: () => {
        onSelectMode?.('finance');
        onClose();
      }
    },
    {
      id: 'mode-ai',
      category: 'mode',
      title: 'Haevy AI & Trợ Lý Học Tập',
      subtitle: 'Tư duy chuyên sâu, hỏi đáp Gemini 2.0 Flash, tóm tắt tài liệu',
      icon: Sparkles,
      badge: 'AI Trí tuệ',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      action: () => {
        onSelectMode?.('haevy_ai');
        onClose();
      }
    },
    {
      id: 'mode-games',
      category: 'mode',
      title: 'Haevy Games & Giải Đố',
      subtitle: 'Đố vui âm nhạc, mini-games giải trí, đua top bảng vàng nhận Xu',
      icon: Gamepad2,
      badge: 'Giải trí',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      action: () => {
        onSelectMode?.('games');
        onClose();
      }
    },
    {
      id: 'mode-spiritual',
      category: 'mode',
      title: 'Tâm Linh, Bói Tarot & Gieo Quẻ',
      subtitle: 'Giải đoán năng lượng ngày mới, gieo quẻ kinh dịch, âm thanh tần số thiền',
      icon: Orbit,
      badge: 'Tâm linh',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      action: () => {
        onSelectMode?.('spiritual');
        onClose();
      }
    },
    {
      id: 'mode-morning',
      category: 'mode',
      title: 'Haevy Morning & Đồng Hồ Sinh Học',
      subtitle: 'Thức giấc cùng podcast ngày mới, thời tiết, lịch trình và danh ngôn',
      icon: Sun,
      badge: 'Buổi sáng',
      badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      action: () => {
        onSelectMode?.('space');
        onClose();
      }
    },
    {
      id: 'mode-couple',
      category: 'mode',
      title: 'I Love Haevy & Không Gian Cặp Đôi',
      subtitle: 'Đồng hồ đếm ngày yêu, nhật ký hẹn hò, nghe nhạc đôi đồng bộ thời gian thực',
      icon: Heart,
      badge: 'Cặp Đôi 💕',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      action: () => {
        onSelectMode?.('couple');
        onClose();
      }
    },
    {
      id: 'mode-maps',
      category: 'mode',
      title: 'Haevy Maps (Định Vị Gia Đình & Bạn Đời)',
      subtitle: 'Định vị GPS trực tiếp, chia sẻ mức pin, gửi tim yêu thương và vùng an toàn Geofencing',
      icon: MapPin,
      badge: 'Live GPS 📍',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      action: () => {
        onSelectMode?.('maps');
        onClose();
      }
    },
    {
      id: 'mode-edu',
      category: 'mode',
      title: 'Haevy Edu (STEM Labs & Lộ Trình Học)',
      subtitle: 'AI gia sư First Principles, 11+ phòng lab ảo tương tác vật lý hóa học, luyện thi 2027',
      icon: GraduationCap,
      badge: 'STEM 🎓',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      action: () => {
        onSelectMode?.('edu');
        onClose();
      }
    },
    {
      id: 'mode-studio',
      category: 'mode',
      title: 'Haevy Studio (Phòng Thu & AI Voice TTS)',
      subtitle: 'Chuyển văn bản thành giọng đọc truyền cảm Gemini TTS, eKYC tác giả & phát hành nhạc',
      icon: Radio,
      badge: 'Sáng Tạo 🎙️',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      action: () => {
        onSelectMode?.('studio');
        onClose();
      }
    },
    {
      id: 'mode-lite',
      category: 'mode',
      title: 'Xu Haevy Lite & Cửa Hàng Vũ Trụ',
      subtitle: 'Xem quảng cáo nhận Xu thưởng, hào quang avatar quỹ đạo 3D, hiệu ứng cổng chào',
      icon: Orbit,
      badge: 'Vũ Trụ 🌌',
      badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
      action: () => {
        onSelectMode?.('haevy_lite');
        onClose();
      }
    },
    {
      id: 'mode-vip',
      category: 'mode',
      title: 'Haevy VIP Club & Đặc Quyền Hoàng Gia',
      subtitle: 'Âm thanh Spatial 3D Hi-Fi Lossless, biểu tượng vương miện vàng phát sáng, VIP Intelligence',
      icon: Crown,
      badge: 'VIP Club 👑',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      action: () => {
        onSelectMode?.('vip');
        onClose();
      }
    },
    {
      id: 'mode-portal',
      category: 'mode',
      title: 'Cổng Hệ Sinh Thái Haevy (Trang Chủ HUB)',
      subtitle: 'Cổng khám phá 15+ phân hệ toàn diện, bảng tin sự kiện đại lễ và nhận 500 Xu tân thủ',
      icon: Home,
      badge: 'Cổng Trung Tâm',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      action: () => {
        onSelectMode?.('portal');
        onClose();
      }
    }
  ], [onSelectMode, onClose]);

  // Track search items
  const trackSearchItems: SearchItem[] = useMemo(() => {
    return tracks.map((t) => ({
      id: `track-${t.id}`,
      category: 'track',
      title: t.title,
      subtitle: `${t.artist || 'Nghệ sĩ Haevy'} • ${t.genre || 'Âm nhạc'}`,
      icon: Music,
      badge: 'Audio',
      badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
      track: t,
      action: () => {
        onPlayTrack?.(t);
        saveRecentSearch(t.title);
        onClose();
      }
    }));
  }, [tracks, onPlayTrack, onClose]);

  // Combine and filter search items
  const filteredItems = useMemo(() => {
    const all = [...trackSearchItems, ...ecosystemSearchItems];
    const q = query.trim().toLowerCase();

    return all.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Query filter
      if (!q) return true;
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle.toLowerCase().includes(q);
      return matchTitle || matchSub;
    }).slice(0, 15);
  }, [query, activeCategory, trackSearchItems, ecosystemSearchItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-3xl sm:max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        {/* Google-Style Omnibar Input Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <Search size={20} className="text-amber-400 shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm bài hát, bạn bè, gia phả, ví Xu, trợ lý AI..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none font-medium"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Voice Search Button with Google Wave Animation */}
          <button
            onClick={handleToggleVoice}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
            }`}
            title={isListening ? 'Đang lắng nghe... Bấm để dừng' : 'Tìm kiếm bằng giọng nói'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 text-xs hidden sm:flex items-center gap-1 border border-zinc-800"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Google Category Pills */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-800/60 overflow-x-auto no-scrollbar text-xs">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recent Searches (if query is empty) */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 sm:px-6 py-2 border-b border-zinc-800/40 bg-zinc-950/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-500 flex items-center gap-1 text-[11px] shrink-0">
              <Clock size={12} />
              Gần đây:
            </span>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(term);
                  inputRef.current?.focus();
                }}
                className="px-2.5 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs shrink-0 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto px-2 sm:px-3 py-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <Search size={28} className="mx-auto mb-2 text-zinc-600 opacity-60" />
              <p className="font-semibold text-zinc-400">Không tìm thấy kết quả phù hợp cho "{query}"</p>
              <p className="text-zinc-600 mt-1">Thử từ khóa khác hoặc chuyển danh mục tìm kiếm</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 text-white shadow-md border border-zinc-700/80'
                      : 'hover:bg-zinc-900/60 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === 'track' 
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.category === 'track' ? <Play size={16} className="fill-current" /> : <Icon size={18} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-zinc-100'}`}>
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider shrink-0 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-700">
                        <span>Chọn</span>
                        <CornerDownLeft size={10} />
                      </span>
                    )}
                    <ArrowRight size={14} className={`text-zinc-500 ${isSelected ? 'text-amber-400 translate-x-0.5' : ''} transition-transform`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Quick Shortcuts */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono text-[10px]">↓</kbd>
              <span>Di chuyển</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 font-mono text-[10px]">↵</kbd>
              <span>Mở</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400/80 font-medium">
            <Sparkles size={12} />
            <span>Google Universal Omnibar Engine</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
