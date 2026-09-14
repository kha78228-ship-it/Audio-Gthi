import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Copy, 
  Share2, 
  Check, 
  Sparkles, 
  Sliders, 
  Type, 
  Eye, 
  Moon, 
  Sun, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Feather, 
  Layers, 
  Radio, 
  CheckCircle, 
  ArrowLeft,
  Search,
  FileText,
  Clock,
  Flame,
  Star
} from 'lucide-react';
import { spiritualTextReader, TextParagraph, TextSentence } from '../../utils/spiritualTextReader';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualShareAttachment } from '../../types';

export interface FocusReadingItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'tuvi' | 'tarot' | 'astrology' | 'palmistry' | 'divination' | 'numerology' | 'sacred' | 'custom';
  content: string;
  tags?: string[];
  createdAt?: string;
}

const DEFAULT_SACRED_READINGS: FocusReadingItem[] = [
  {
    id: 'tuvi_sample_2026',
    title: 'Lá Số Tử Vi Năm 2026 (Bính Ngọ): Tổng Quan Vận Mệnh & Tài Lộc',
    subtitle: 'Mệnh Sa Trung Kim • Cung Mệnh tại Thìn • Vận Trình Bứt Phá',
    category: 'tuvi',
    tags: ['Tử Vi 2026', 'Cung Mệnh', 'Tài Lộc', 'Công Danh'],
    content: `### 📜 Luận Giải Tổng Quan Lá Số Tử Vi Năm 2026 (Bính Ngọ)

#### 🌟 1. Tổng Quan Bản Mệnh & Cốt Cách:
Bản mệnh ngũ hành Sa Trung Kim (Vàng trong cát), được hun đúc qua thử thách để tỏa sáng. Cung Mệnh tọa thủ tại Thìn, hội tụ các sao cát tinh Tử Vi, Thiên Phủ, Tả Phù, Hữu Bật chiếu rọi mang lại uy quyền, tư chất thông tuệ và bản lĩnh kiên cường trước mọi biến động.

#### 💼 2. Vận Trình Sự Nghiệp & Công Danh (Cung Quan Lộc):
Năm 2026 là năm bản lề mở ra nhiều vận hội thăng tiến vượt bậc. Cung Quan Lộc đắc Địa Không - Địa Kiếp hóa giải thành sự sáng tạo đột phá. Nếu bạn hoạt động trong các lĩnh vực kinh doanh, công nghệ, chiến lược hoặc nghệ thuật, đây là thời điểm vàng để triển khai các dự án quy mô lớn và khẳng định vị thế.

#### 💰 3. Tài Bạch & Tích Lũy Của Cải (Cung Tài Bạch):
Dòng tiền lưu chuyển hanh thông, lộc tồn tương chiếu giúp tích lũy tài sản vững chắc. Tuy nhiên, cần chú ý quản lý dòng tiền vào quý II và quý III để tránh hao tán do đầu tư cảm tính. Hãy ưu tiên các kênh tài chính bền vững và có giá trị thực.

#### 💖 4. Tình Duyên, Gia Đạo & Mối Quan Hệ (Cung Phu Thê):
Cung Phu Thê êm ấm, có sự thấu hiểu và đồng hành sâu sắc. Đối với người độc thân, nửa cuối năm 2026 sẽ xuất hiện mối lương duyên tiền định mang năng lượng chữa lành và nâng đỡ tâm hồn.

#### 🕊️ 5. Lời Khuyên Khai Mở Vận Khí & Tu Dưỡng Tâm Tính:
- Giữ tâm tĩnh lặng trước những biến cố bất ngờ.
- Hành thiện tích đức, phóng sinh và chia sẻ may mắn với cộng đồng để củng cố phước báu.
- Luôn tin tưởng vào trực giác và lộ trình phát triển của chính mình.`
  },
  {
    id: 'tarot_awakening',
    title: 'Bói Bài Tarot: Thông Điệp Thức Tỉnh & Định Hướng Năng Lượng Vũ Trụ',
    subtitle: 'The Star (Ngôi Sao Hi Vọng) • The Magician (Nhà Ảo Thuật) • The Sun (Mặt Trời)',
    category: 'tarot',
    tags: ['Tarot 3 Lá', 'Thức Tỉnh', 'Định Hướng', 'Chữa Lành'],
    content: `### 🔮 Thông Điệp Bài Tarot Thức Tỉnh Tâm Linh

#### ✨ 1. Năng Lượng Quá Khứ: Lá Bài The Magician (Nhà Ảo Thuật)
Bạn đã vượt qua giai đoạn tích lũy nội lực và nắm giữ đầy đủ 4 nguyên tố (Lửa - Nước - Khí - Đất). Mọi công cụ và tiềm năng sáng tạo đều đã sẵn sàng trong tay bạn. Những trải nghiệm trước đây chính là bước đệm hoàn hảo cho sự chuyển hóa hiện tại.

#### 🌟 2. Thực Tại & Thách Thức: Lá Bài The Star (Ngôi Sao Hi Vọng)
Một luồng năng lượng thanh lọc và tươi mới đang rót vào tâm trí bạn. Những nghi ngại, bất an hay cảm giác mất phương hướng dần tan biến, nhường chỗ cho niềm tin trong sáng và sự bình yên nội tại. Hãy lắng nghe tiếng gọi từ trực giác của bạn.

#### ☀️ 3. Kết Quả & Tương Lai: Lá Bài The Sun (Mặt Trời Rực Rỡ)
Sự thành công rực rỡ, niềm vui thuần khiết và sự công nhận từ mọi người xung quanh đang tiến về phía bạn. Mọi dự định ấp ủ bấy lâu sẽ đơm hoa kết trái một cách trọn vẹn nhất.

#### 🕊️ 4. Lời Khuyên Của Vũ Trụ:
Hãy mở rộng trái tim, buông bỏ nỗi sợ hãi và tự tin bước đi trên con đường của chính mình. Ánh sáng của bạn đủ sức xua tan mọi bóng tối.`
  },
  {
    id: 'astrology_natal_guide',
    title: 'Bản Đồ Sao Chiêm Tinh Học: Giải Mã Sun, Moon & Rising Sign',
    subtitle: 'Mặt Trời Sư Tử • Mặt Trăng Bạch Dương • Cung Mọc Nhân Mã',
    category: 'astrology',
    tags: ['Bản Đồ Sao', 'Cung Hoàng Đạo', 'Chiêm Tinh Học'],
    content: `### ☀️ Giải Mã Bản Đồ Sao Cá Nhân (Natal Chart Interpretation)

#### 🦁 1. Sun Sign (Dấu Hiệu Mặt Trời) - Bản Ngã & Mục Đích Sống:
Mặt Trời Sư Tử mang lại cho bạn nguồn năng lượng nhiệt huyết, ý chí lãnh đạo tự nhiên và khát khao khẳng định giá trị bản thân. Bạn tỏa sáng rực rỡ nhất khi được tự do sáng tạo và truyền cảm hứng cho mọi người.

#### 🌙 2. Moon Sign (Dấu Hiệu Mặt Trăng) - Thế Giới Cảm Xúc Nội Tâm:
Mặt Trăng Bạch Dương thúc đẩy cảm xúc bộc trực, chân thành và nhanh nhạy. Bạn khao khát sự độc lập, không thích bị trói buộc và luôn dũng cảm đối diện với những biến cố trong cuộc sống.

#### 🏹 3. Rising Sign / Ascendant (Cung Mọc) - Tấm Gương Ngoại Cảnh:
Cung Mọc Nhân Mã tạo nên phong thái cởi mở, phóng khoáng, thích phiêu lưu khám phá tri thức và luôn nhìn cuộc đời với lăng kính lạc quan, bao dung.

#### 🌌 4. Sự Tương Tác Giữa Các Nhà (Houses & Aspects):
- **Nhà 10 (Sự nghiệp & Danh tiếng)**: Chịu ảnh hưởng của sao Mộc, mang lại nhiều cơ hội thăng tiến và được quý nhân nâng đỡ.
- **Nhà 7 (Hôn nhân & Hợp tác)**: Cần sự công bằng, tôn trọng không gian riêng của nhau để duy trì hạnh phúc bền vững.

#### 🌿 5. Thông Điệp Chiêm Tinh Trọn Đời:
"Bạn sinh ra là một ngọn đuốc sáng rọi. Đừng bao giờ thu nhỏ chính mình chỉ để vừa vặn với kỳ vọng của người khác."`
  },
  {
    id: 'bat_nha_tam_kinh',
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh (Prajñāpāramitā Hṛdaya)',
    subtitle: 'Chiếu Kiến Ngũ Uẩn Giai Không • Độ Nhất Thiết Khổ Ách',
    category: 'sacred',
    tags: ['Kinh Phật', 'Tâm Kinh', 'Trí Tuệ Bát Nhã', 'Thiền Định'],
    content: `### ☸️ Bát Nhã Ba La Mật Đa Tâm Kinh

Quán Tự Tại Bồ Tát hành thâm Bát nhã Ba la mật đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.

Xá Lợi Tử! Sắc bất dị không, không bất dị sắc, sắc tức thị không, không tức thị sắc, thụ tưởng hành thức diệc phục như thị.

Xá Lợi Tử! Thị chư pháp không tướng, bất sinh bất diệt, bất cấu bất tịnh, bất tăng bất giảm. Thị cố không trung vô sắc, vô thụ tưởng hành thức. Vô nhãn nhĩ tỷ thiệt thân ý, vô sắc thanh hương vị xúc pháp, vô nhãn giới nãi chí vô ý thức giới.

Vô vô minh, diệc vô vô minh tận, nãi chí vô lão tử, diệc vô lão tử tận. Vô khổ, tập, diệt, đạo. Vô trí diệc vô đắc, dĩ vô sở đắc cố.

Bồ đề tát đỏa y Bát nhã Ba la mật đa cố, tâm vô quái ngại, vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết bàn.

Tam thế chư Phật, y Bát nhã Ba la mật đa cố, đắc A nậu đa la Tam miệu Tam bồ đề.

Cố tri Bát nhã Ba la mật đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chân thật bất hư.

Cố thuyết Bát nhã Ba la mật đa chú, tức thuyết chú viết:
> *Yết đế, yết đế, Ba la yết đế, Ba la tăng yết đế, Bồ đề tát bà ha.*`
  },
  {
    id: 'chu_dai_bi_sacred',
    title: 'Đại Bi Tâm Đà La Ni (Chú Đại Bi)',
    subtitle: 'Năng Lượng Từ Bi Vô Lượng • Quán Thế Âm Bồ Tát Bản Nguyện',
    category: 'sacred',
    tags: ['Chú Đại Bi', 'Mật Chú', 'Bình An', 'Thanh Lọc'],
    content: `### 🌸 Đại Bi Tâm Đà La Ni

Nam mô Hắc Ra Đát Na Đa Ra Dạ Da. Nam mô A Rị Da, Bà Lô Kiết Đế Thước Bát Ra Da, Bồ Đề Tát Đỏa Bà Da, Ma Ha Tát Đỏa Bà Da, Ma Ha Ca Lô Ni Ca Da.

Án, Tát Bàn Ra Phạt Duệ, Số Đát Na Đát Tỏa. Nam mô Tất Kiết Lật Đỏa Y Mông A Rị Da, Bà Lô Kiết Đế Thất Phật Ra Lăng Đà Bà.

Nam mô Na Ra Cẩn Trì, Hê Rị Ma Ha Bàn Đà Sa Mế, Tát Bà A Tha Đậu Thâu Bằng, A Thệ Dựng, Tát Bà Tát Đa, Na Ma Bà Tát Đa, Na Ma Bà Già, Ma Phạt Đạt Đậu.

Đát Điệt Tha: Án, A Bà Lô Hê, Lô Ca Đế, Ca Ra Đế, Di Hê Rị, Ma Ha Bồ Đề Tát Đỏa, Tát Bà Tát Bà, Ma Ra Ma Ra, Ma Hê Ma Hê, Rị Đà Dựng, Cu Lô Cu Lô Kiết Mông, Độ Lô Độ Lô Phạt Xà Da Đế, Ma Ha Phạt Xà Da Đế, Đà Ra Đà Ra, Địa Rị Ni, Thất Phật Ra Da.

Dữ tâm thanh tịnh, quán chiếu lòng từ bi vô lượng, hồi hướng bình an cho muôn loài.`
  },
  {
    id: 'thien_chanh_niem_mind',
    title: 'Minh Triết Thiền Định: Nghệ Thuật An Trú Trong Hiện Tại',
    subtitle: 'Thở Vào Tâm Tĩnh Lặng • Thở Ra Miệng Mỉm Cười',
    category: 'sacred',
    tags: ['Thiền Quán', 'Chánh Niệm', 'An Lạc', 'Tâm Trí'],
    content: `### 🌿 Nghệ Thuật Thiền Định & An Trú Trong Hiện Tại

#### 🪷 1. Hơi Thở Ý Thức:
Hít vào một hơi thật sâu và êm dịu, tôi nhận biết luồng sinh khí thanh khiết của vũ trụ đang tưới mát từng tế bào trong cơ thể.
Thở ra từ tốn và nhẹ nhàng, tôi buông xả tất cả những lo toan, vội vã và căng thẳng của cuộc sống thường nhật.

#### 🌊 2. Tâm Tĩnh Như Mặt Hồ:
Khi tâm trí lắng dịu, không còn phán xét hay cố chấp, chúng ta bắt đầu nhìn thấy mọi sự vật, hiện tượng đúng như bản chất chân thật của chúng. Không thêm, không bớt, trọn vẹn trong khoảnh khắc này.

#### 🕊️ 3. An Trú Trong Thực Tại:
Quá khứ đã qua đi, không thể nắm giữ. Tương lai chưa tới, chẳng cần hoang mang.
Chỉ có giây phút hiện tại là nơi duy nhất sự sống đang thực sự diễn ra.

Hãy nâng niu từng bước chân, từng chén trà và từng nụ cười trao đi mỗi ngày.`
  }
];

type ReaderTheme = 'onyx_gold' | 'parchment' | 'emerald' | 'indigo' | 'soft_light';
type ReaderFontFamily = 'serif' | 'sans' | 'mono';
type ReaderSpacing = 'spacious' | 'luxurious' | 'zen';
type ReadingMode = 'paginated' | 'continuous';

interface HaevyFocusReaderViewProps {
  initialContent?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onEarnCoins?: (amount: number, reason: string) => void;
}

export function HaevyFocusReaderView({
  initialContent,
  initialTitle,
  initialSubtitle,
  onNavigateToMode,
  onEarnCoins
}: HaevyFocusReaderViewProps) {
  // Reading Content Selection
  const [readingsList, setReadingsList] = useState<FocusReadingItem[]>(() => {
    // Try loading recent readings from localStorage if available
    const list = [...DEFAULT_SACRED_READINGS];
    try {
      const savedCustom = localStorage.getItem('haevy_focus_custom_readings');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list.unshift(...parsed);
        }
      }
    } catch {
      // ignore
    }
    return list;
  });

  const [selectedReadingId, setSelectedReadingId] = useState<string>(() => {
    return readingsList[0]?.id || 'tuvi_sample_2026';
  });

  const activeReading = readingsList.find(r => r.id === selectedReadingId) || readingsList[0];

  // Custom Input State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [customSubtitleInput, setCustomSubtitleInput] = useState('');
  const [customContentInput, setCustomContentInput] = useState('');

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(26); // Default large 26px font for comfort
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState<number>(2.0); // Generous line height
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('light')) {
      return 'parchment';
    }
    return 'onyx_gold';
  });
  const [readingMode, setReadingMode] = useState<ReadingMode>('paginated');
  const [isTrueFullscreen, setIsTrueFullscreen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1); // 1 = slow & gentle

  // Sync reader theme when global HTML light/dark mode changes
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      if (isLight && (theme === 'onyx_gold' || theme === 'indigo' || theme === 'emerald')) {
        setTheme('parchment');
      }
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [theme]);

  // Pagination for non-scroll mode (avoiding complex dragging)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [paragraphs, setParagraphs] = useState<TextParagraph[]>([]);
  const [pages, setPages] = useState<{ id: number; title: string; paragraphs: TextParagraph[] }[]>([]);

  // TTS & Audio
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPausedVoice, setIsPausedVoice] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientFreq, setAmbientFreq] = useState<number>(528);

  // Share & Copy
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If initial content provided from parent (e.g. from Tarot or TuVi view), inject it
  useEffect(() => {
    if (initialContent) {
      const customItem: FocusReadingItem = {
        id: `custom_injected_${Date.now()}`,
        title: initialTitle || 'Bài Luận Giải Tâm Linh Cá Nhân',
        subtitle: initialSubtitle || 'Trích xuất trực tiếp từ trải nghiệm vừa xem',
        category: 'custom',
        content: initialContent,
        createdAt: new Date().toISOString()
      };
      setReadingsList(prev => [customItem, ...prev.filter(i => i.id !== customItem.id)]);
      setSelectedReadingId(customItem.id);
    }
  }, [initialContent, initialTitle, initialSubtitle]);

  // Parse text whenever activeReading changes
  useEffect(() => {
    if (!activeReading?.content) return;

    const { paragraphs: parsedParagraphs } = spiritualTextReader.parseText(activeReading.content);
    setParagraphs(parsedParagraphs);

    // Group into readable pages by headings or every 2-3 paragraphs for paginated mode
    const generatedPages: { id: number; title: string; paragraphs: TextParagraph[] }[] = [];
    let curPageTitle = activeReading.title;
    let curPageParas: TextParagraph[] = [];
    let pageCounter = 0;

    parsedParagraphs.forEach((p, idx) => {
      if (p.isHeading && curPageParas.length > 0) {
        generatedPages.push({
          id: pageCounter++,
          title: curPageTitle,
          paragraphs: [...curPageParas]
        });
        curPageParas = [p];
        curPageTitle = p.rawText.replace(/^#+\s*/, '') || `Phần ${pageCounter + 1}`;
      } else {
        curPageParas.push(p);
        if (p.isHeading) {
          curPageTitle = p.rawText.replace(/^#+\s*/, '');
        }
        // If accumulated more than 4 non-heading paragraphs without a heading, break into a page
        if (curPageParas.length >= 4) {
          generatedPages.push({
            id: pageCounter++,
            title: curPageTitle,
            paragraphs: [...curPageParas]
          });
          curPageParas = [];
        }
      }
    });

    if (curPageParas.length > 0) {
      generatedPages.push({
        id: pageCounter++,
        title: curPageTitle,
        paragraphs: [...curPageParas]
      });
    }

    if (generatedPages.length === 0 && parsedParagraphs.length > 0) {
      generatedPages.push({
        id: 0,
        title: activeReading.title,
        paragraphs: parsedParagraphs
      });
    }

    setPages(generatedPages);
    setCurrentPageIndex(0);

    // Stop voice reader when switching reading
    spiritualTextReader.stop();
    setIsPlayingVoice(false);
    setIsPausedVoice(false);
    setActiveSentenceIndex(-1);
  }, [activeReading]);

  // Voice Reader subscriptions
  useEffect(() => {
    const unsubSentence = spiritualTextReader.onSentenceChange((idx) => {
      setActiveSentenceIndex(idx);
    });

    const unsubState = spiritualTextReader.onStateChange((playing, paused) => {
      setIsPlayingVoice(playing);
      setIsPausedVoice(paused);
    });

    const unsubComplete = spiritualTextReader.onComplete(() => {
      setIsPlayingVoice(false);
      setIsPausedVoice(false);
      setActiveSentenceIndex(-1);
      showToast('Đã đọc xong toàn bộ văn bản.');
      if (onEarnCoins) {
        onEarnCoins(40, 'Đọc xong bài kinh văn tâm linh ở Chế độ Tập Trung (+40 Xu)');
      }
    });

    return () => {
      unsubSentence();
      unsubState();
      unsubComplete();
      spiritualTextReader.stop();
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, []);

  // Keyboard navigation for page flip (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleTrueFullscreen();
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZenMode(prev => !prev);
      } else if (e.key === ' ') {
        if (isPlayingVoice) {
          e.preventDefault();
          handleToggleVoice();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, pages.length, isPlayingVoice]);

  // Auto Scroll Engine
  useEffect(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    if (isAutoScrollActive && contentContainerRef.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollBy({
            top: autoScrollSpeed,
            behavior: 'smooth'
          });
        }
      }, 50);
    }

    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, [isAutoScrollActive, autoScrollSpeed]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      haptics.impact('light');
      spiritualAudio.playCardFlipChime();
      setCurrentPageIndex(prev => prev + 1);
      if (contentContainerRef.current) {
        contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      haptics.impact('light');
      spiritualAudio.playCardFlipChime();
      setCurrentPageIndex(prev => prev - 1);
      if (contentContainerRef.current) {
        contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const toggleTrueFullscreen = () => {
    haptics.impact('medium');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsTrueFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsTrueFullscreen(false);
    }
  };

  // Toggle Voice TTS (100% Vietnamese)
  const handleToggleVoice = () => {
    haptics.impact('medium');
    if (!activeReading?.content) return;

    if (isPlayingVoice && !isPausedVoice) {
      spiritualTextReader.pause();
    } else if (isPausedVoice) {
      spiritualTextReader.resume();
    } else {
      spiritualTextReader.parseText(activeReading.content);
      spiritualTextReader.start(0);
      showToast('Đang phát giọng đọc Tiếng Việt chuẩn...');
    }
  };

  const handleStopVoice = () => {
    haptics.impact('light');
    spiritualTextReader.stop();
  };

  const handleToggleAmbient = () => {
    haptics.impact('light');
    if (isAmbientPlaying) {
      spiritualAudio.stopSolfeggioTone();
      setIsAmbientPlaying(false);
    } else {
      spiritualAudio.startSolfeggioTone(ambientFreq, 0.12);
      spiritualAudio.playSingingBowl(216);
      setIsAmbientPlaying(true);
    }
  };

  const handleCopyAll = () => {
    if (!activeReading?.content) return;
    navigator.clipboard.writeText(activeReading.content);
    haptics.impact('light');
    showToast('Đã sao chép toàn bộ nội dung văn bản!');
  };

  const handleShareReading = () => {
    haptics.impact('light');
    setShareAttachment({
      type: 'cosmic_affirmation',
      title: activeReading.title,
      subtitle: activeReading.subtitle,
      affirmationText: activeReading.title,
      aiVerdictExcerpt: activeReading.content.slice(0, 300) + '...',
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  const handleSaveCustomReading = () => {
    if (!customContentInput.trim()) {
      showToast('Vui lòng nhập nội dung văn bản');
      return;
    }

    haptics.success();
    spiritualAudio.playCrystalResonance();

    const newItem: FocusReadingItem = {
      id: `custom_${Date.now()}`,
      title: customTitleInput.trim() || 'Văn Bản Tâm Linh Tùy Chỉnh',
      subtitle: customSubtitleInput.trim() || 'Được nhập bởi bạn',
      category: 'custom',
      content: customContentInput.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...readingsList];
    setReadingsList(updated);
    setSelectedReadingId(newItem.id);
    setIsInputModalOpen(false);
    setCustomTitleInput('');
    setCustomSubtitleInput('');
    setCustomContentInput('');
    showToast('Đã lưu văn bản vào Chế độ Đọc tập trung!');

    try {
      const customs = updated.filter(i => i.category === 'custom');
      localStorage.setItem('haevy_focus_custom_readings', JSON.stringify(customs));
    } catch {
      // ignore
    }
  };

  // Theme Styles Dictionary
  const themeClasses: Record<ReaderTheme, { bg: string; text: string; heading: string; accent: string; cardBg: string; border: string }> = {
    onyx_gold: {
      bg: 'bg-[#09090b]',
      text: 'text-[#e4e4e7]',
      heading: 'text-[#fef08a]',
      accent: 'text-[#facc15] border-[#ca8a04]/40 bg-[#ca8a04]/15',
      cardBg: 'bg-[#121215]',
      border: 'border-[#27272a]'
    },
    parchment: {
      bg: 'bg-[#fbf7ee]',
      text: 'text-[#292524]',
      heading: 'text-[#78350f]',
      accent: 'text-[#9a3412] border-[#ea580c]/30 bg-[#ffedd5]',
      cardBg: 'bg-[#f5eedc]',
      border: 'border-[#e7d8be]'
    },
    emerald: {
      bg: 'bg-[#022c22]',
      text: 'text-[#ecfdf5]',
      heading: 'text-[#6ee7b7]',
      accent: 'text-[#34d399] border-[#059669]/40 bg-[#065f46]/40',
      cardBg: 'bg-[#064e3b]',
      border: 'border-[#047857]'
    },
    indigo: {
      bg: 'bg-[#0f172a]',
      text: 'text-[#f1f5f9]',
      heading: 'text-[#93c5fd]',
      accent: 'text-[#60a5fa] border-[#2563eb]/40 bg-[#1e3a8a]/40',
      cardBg: 'bg-[#1e293b]',
      border: 'border-[#334155]'
    },
    soft_light: {
      bg: 'bg-[#f8fafc]',
      text: 'text-[#0f172a]',
      heading: 'text-[#1e293b]',
      accent: 'text-[#475569] border-[#cbd5e1] bg-[#e2e8f0]',
      cardBg: 'bg-[#ffffff]',
      border: 'border-[#e2e8f0]'
    }
  };

  const currentTheme = themeClasses[theme];

  // Font family helper
  const fontFamilyStyle = {
    fontFamily: fontFamily === 'serif' 
      ? '"Merriweather", "Playfair Display", "Times New Roman", Georgia, serif'
      : fontFamily === 'mono'
      ? '"JetBrains Mono", "Fira Code", monospace'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  // Get active page content or full content
  const currentPage = pages[currentPageIndex] || pages[0];

  return (
    <div className={`w-full min-h-[85vh] rounded-2xl sm:rounded-3xl transition-colors duration-500 overflow-hidden flex flex-col relative shadow-2xl ${currentTheme.bg} ${isTrueFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 text-amber-300 text-xs font-bold px-4 py-2 rounded-full border border-amber-500/40 shadow-2xl animate-fadeIn flex items-center gap-2">
          <Sparkles size={14} className="text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP BAR & CONTROLS (Hidden in Zen Mode unless hovered) */}
      {/* ========================================================================= */}
      {!isZenMode && (
        <div className={`p-3 sm:p-4 border-b ${currentTheme.border} ${currentTheme.cardBg} backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 z-20`}>
          
          {/* Left: Reading Selector & Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shrink-0 shadow-inner">
              <BookOpen size={20} />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-500/30">
                  Chế Độ Đọc Tập Trung
                </span>
                <span className={`text-[10px] ${currentTheme.text} opacity-60 hidden sm:inline-block`}>
                  {readingMode === 'paginated' ? `Trang ${currentPageIndex + 1}/${pages.length || 1}` : 'Cuộn Liên Tục'}
                </span>
              </div>
              <h2 className={`text-sm sm:text-base font-black truncate mt-0.5 ${currentTheme.heading}`}>
                {activeReading?.title || 'Đọc Tập Trung'}
              </h2>
            </div>
          </div>

          {/* Right: Essential Control Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Vietnamese Voice Audio Reader Button */}
            <button
              onClick={handleToggleVoice}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
                isPlayingVoice && !isPausedVoice
                  ? 'bg-emerald-500 text-zinc-950 animate-pulse font-black'
                  : isPausedVoice
                  ? 'bg-amber-500 text-zinc-950 font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/40'
              }`}
              title="Đọc toàn bộ văn bản bằng giọng Tiếng Việt chuẩn"
            >
              {isPlayingVoice && !isPausedVoice ? (
                <>
                  <Pause size={14} />
                  <span className="hidden sm:inline">Tạm Dừng</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} />
                  <span className="hidden sm:inline">Đọc Tiếng Việt</span>
                </>
              )}
            </button>

            {/* Solfeggio 528Hz Ambient Music */}
            <button
              onClick={handleToggleAmbient}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAmbientPlaying
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30 animate-pulse'
                  : 'bg-zinc-900/90 text-purple-300 border-purple-500/30 hover:bg-zinc-800'
              }`}
              title="Sóng âm Solfeggio 528Hz chữa lành nền"
            >
              {isAmbientPlaying ? <Radio size={16} className="text-white" /> : <VolumeX size={16} className="opacity-60" />}
            </button>

            {/* Font Size Decrement / Increment */}
            <div className={`flex items-center rounded-xl border ${currentTheme.border} bg-zinc-950/40 p-0.5`}>
              <button
                onClick={() => {
                  haptics.impact('light');
                  setFontSize(prev => Math.max(18, prev - 2));
                }}
                className="px-2 py-1 text-xs font-black opacity-80 hover:opacity-100 hover:text-amber-400 cursor-pointer"
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <span className="text-[11px] font-bold px-1.5 opacity-60">
                {fontSize}px
              </span>
              <button
                onClick={() => {
                  haptics.impact('light');
                  setFontSize(prev => Math.min(42, prev + 2));
                }}
                className="px-2 py-1 text-xs font-black opacity-80 hover:opacity-100 hover:text-amber-400 cursor-pointer"
                title="Tăng cỡ chữ lớn"
              >
                A+
              </button>
            </div>

            {/* Change Theme Selector */}
            <div className="relative group">
              <button
                className={`p-2 rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} text-xs font-bold hover:opacity-80 transition-all cursor-pointer`}
                title="Chọn màu nền dịu mắt"
              >
                <Moon size={16} className={currentTheme.heading} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl bg-zinc-950/95 border border-zinc-700 shadow-2xl backdrop-blur-xl hidden group-hover:flex flex-col gap-1 z-30">
                <div className="text-[10px] font-bold text-zinc-400 uppercase px-2 py-1">Giao Diện Mắt Êm</div>
                <button onClick={() => setTheme('onyx_gold')} className="px-2.5 py-1.5 rounded-lg text-xs text-left font-bold text-yellow-300 hover:bg-zinc-900 flex items-center justify-between">
                  <span>🌌 Đêm Huyền Bí</span>
                  {theme === 'onyx_gold' && <Check size={12} />}
                </button>
                <button onClick={() => setTheme('parchment')} className="px-2.5 py-1.5 rounded-lg text-xs text-left font-bold text-amber-800 hover:bg-zinc-900 flex items-center justify-between">
                  <span>📜 Giấy Trầm Hương</span>
                  {theme === 'parchment' && <Check size={12} />}
                </button>
                <button onClick={() => setTheme('emerald')} className="px-2.5 py-1.5 rounded-lg text-xs text-left font-bold text-emerald-300 hover:bg-zinc-900 flex items-center justify-between">
                  <span>🎋 Rừng Trúc Tịnh Độ</span>
                  {theme === 'emerald' && <Check size={12} />}
                </button>
                <button onClick={() => setTheme('indigo')} className="px-2.5 py-1.5 rounded-lg text-xs text-left font-bold text-blue-300 hover:bg-zinc-900 flex items-center justify-between">
                  <span>🌙 Ánh Trăng Thiền</span>
                  {theme === 'indigo' && <Check size={12} />}
                </button>
                <button onClick={() => setTheme('soft_light')} className="px-2.5 py-1.5 rounded-lg text-xs text-left font-bold text-zinc-300 hover:bg-zinc-900 flex items-center justify-between">
                  <span>🤍 Bạch Ngọc Tối Giản</span>
                  {theme === 'soft_light' && <Check size={12} />}
                </button>
              </div>
            </div>

            {/* Reading Mode Switcher: Paginated (Flip) vs Continuous */}
            <button
              onClick={() => {
                haptics.impact('light');
                setReadingMode(prev => prev === 'paginated' ? 'continuous' : 'paginated');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${currentTheme.border} ${currentTheme.cardBg} hover:opacity-80 transition-all cursor-pointer hidden md:flex items-center gap-1.5`}
              title="Chuyển chế độ lật từng trang hoặc cuộn"
            >
              <Layers size={14} />
              <span>{readingMode === 'paginated' ? 'Lật Trang' : 'Cuộn Dài'}</span>
            </button>

            {/* Zen Mode Button (Full Distraction-free) */}
            <button
              onClick={() => {
                haptics.impact('medium');
                setIsZenMode(true);
                showToast('Đã kích hoạt Chế Độ Thiền Định (Chạm bất kỳ đâu để hiện lại thanh công cụ)');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${currentTheme.border} ${currentTheme.cardBg} text-amber-300 hover:opacity-80 transition-all cursor-pointer flex items-center gap-1`}
              title="Chế độ thiền định tĩnh tâm (Ẩn toàn bộ nút bấm)"
            >
              <Feather size={14} />
              <span className="hidden lg:inline">Zen Mode</span>
            </button>

            {/* True Fullscreen Toggle */}
            <button
              onClick={toggleTrueFullscreen}
              className={`p-2 rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} text-xs font-bold hover:opacity-80 transition-all cursor-pointer`}
              title="Phóng to toàn màn hình (F11)"
            >
              {isTrueFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK READING SELECTOR / DRAWER TABS (When not in Zen Mode) */}
      {/* ========================================================================= */}
      {!isZenMode && (
        <div className={`px-3 py-2 border-b ${currentTheme.border} ${currentTheme.cardBg} flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar shrink-0 text-xs`}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
              Chọn Bài Đọc:
            </span>
            {readingsList.map(item => {
              const isSelected = item.id === selectedReadingId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    haptics.selection();
                    setSelectedReadingId(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? `${currentTheme.accent} font-black shadow-md border`
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span>
                    {item.category === 'tuvi' ? '📜' : item.category === 'tarot' ? '🔮' : item.category === 'astrology' ? '☀️' : item.category === 'sacred' ? '☸️' : '✍️'}
                  </span>
                  <span>{item.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsInputModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/50 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>+</span>
            <span>Dán Văn Bản Khác</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TEXT READING CANVAS (Generous Spacing, High Legibility, No Complex Dragging) */}
      {/* ========================================================================= */}
      <div 
        ref={contentContainerRef}
        onClick={() => {
          if (isZenMode) {
            setIsZenMode(false);
          }
        }}
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-8 sm:py-12 custom-scrollbar transition-all duration-300 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl mx-auto space-y-8">
          
          {/* Document Header in Reading View */}
          <div className="border-b border-dashed border-zinc-700/60 pb-6 space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              ✨ {activeReading?.category.toUpperCase()} • TẬP TRUNG TỊNH TÂM
            </div>
            <h1 
              style={{ ...fontFamilyStyle, fontSize: `${fontSize * 1.3}px`, lineHeight: 1.3 }} 
              className={`font-black tracking-tight ${currentTheme.heading}`}
            >
              {activeReading?.title}
            </h1>
            {activeReading?.subtitle && (
              <p className={`text-sm sm:text-base opacity-75 font-medium ${currentTheme.text}`}>
                {activeReading?.subtitle}
              </p>
            )}
          </div>

          {/* Paginated vs Continuous Reading View */}
          {readingMode === 'paginated' ? (
            /* Paginated Section */
            <div className="space-y-6 animate-fadeIn min-h-[400px]">
              {currentPage?.paragraphs.map((para) => (
                <div key={para.id} className="space-y-2">
                  {para.isHeading ? (
                    <h3 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize * 1.15}px` }} 
                      className={`font-black mt-6 mb-2 ${currentTheme.heading}`}
                    >
                      {para.rawText.replace(/^#+\s*/, '')}
                    </h3>
                  ) : para.isQuote ? (
                    <blockquote 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize}px`, lineHeight: lineHeightMultiplier }} 
                      className="pl-4 border-l-4 border-amber-400 italic my-4 opacity-90"
                    >
                      {para.sentences.map((sent) => {
                        const isSpeaking = activeSentenceIndex === sent.id;
                        return (
                          <span 
                            key={sent.id}
                            className={`transition-all duration-200 ${
                              isSpeaking 
                                ? 'bg-amber-400/30 text-amber-200 px-1 rounded shadow-md ring-2 ring-amber-400 font-bold' 
                                : ''
                            }`}
                          >
                            {sent.text}{' '}
                          </span>
                        );
                      })}
                    </blockquote>
                  ) : (
                    <p 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize}px`, lineHeight: lineHeightMultiplier }} 
                      className={`leading-relaxed text-justify ${currentTheme.text}`}
                    >
                      {para.sentences.map((sent) => {
                        const isSpeaking = activeSentenceIndex === sent.id;
                        return (
                          <span 
                            key={sent.id}
                            onClick={() => {
                              if (isPlayingVoice) {
                                spiritualTextReader.jumpToSentence(sent.id);
                              }
                            }}
                            className={`transition-all duration-200 cursor-pointer hover:opacity-100 ${
                              isSpeaking 
                                ? 'bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded shadow-lg ring-2 ring-amber-400 font-bold' 
                                : ''
                            }`}
                          >
                            {sent.text}{' '}
                          </span>
                        );
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Continuous Smooth View */
            <div className="space-y-6 animate-fadeIn">
              {paragraphs.map((para) => (
                <div key={para.id} className="space-y-2">
                  {para.isHeading ? (
                    <h3 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize * 1.15}px` }} 
                      className={`font-black mt-8 mb-3 ${currentTheme.heading}`}
                    >
                      {para.rawText.replace(/^#+\s*/, '')}
                    </h3>
                  ) : para.isQuote ? (
                    <blockquote 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize}px`, lineHeight: lineHeightMultiplier }} 
                      className="pl-4 border-l-4 border-amber-400 italic my-4 opacity-90"
                    >
                      {para.sentences.map((sent) => (
                        <span 
                          key={sent.id}
                          className={activeSentenceIndex === sent.id ? 'bg-amber-400/30 text-amber-200 px-1 rounded ring-2 ring-amber-400 font-bold' : ''}
                        >
                          {sent.text}{' '}
                        </span>
                      ))}
                    </blockquote>
                  ) : (
                    <p 
                      style={{ ...fontFamilyStyle, fontSize: `${fontSize}px`, lineHeight: lineHeightMultiplier }} 
                      className={`leading-relaxed text-justify ${currentTheme.text}`}
                    >
                      {para.sentences.map((sent) => (
                        <span 
                          key={sent.id}
                          className={activeSentenceIndex === sent.id ? 'bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded ring-2 ring-amber-400 font-bold' : ''}
                        >
                          {sent.text}{' '}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* End of Page / Content Footer Note */}
          <div className="pt-10 pb-6 border-t border-zinc-800/60 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopyAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} />
                <span>Sao Chép Toàn Bộ</span>
              </button>

              <button
                onClick={handleShareReading}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950/40"
              >
                <Share2 size={14} />
                <span>Chia Sẻ Thông Điệp</span>
              </button>
            </div>
            
            <p className="text-xs opacity-50">
              Chế độ Đọc Tập Trung • Haevy Spiritual Focus Reader
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM PAGINATION BAR (For easy 1-click flipping without scrolling) */}
      {/* ========================================================================= */}
      {readingMode === 'paginated' && pages.length > 1 && !isZenMode && (
        <div className={`p-3 sm:p-4 border-t ${currentTheme.border} ${currentTheme.cardBg} backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20`}>
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              currentPageIndex === 0
                ? 'opacity-30 cursor-not-allowed bg-zinc-900 text-zinc-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 shadow-md active:scale-95'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Trang Trước</span>
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1.5">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  haptics.impact('light');
                  setCurrentPageIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentPageIndex === idx 
                    ? 'w-6 bg-amber-400 shadow-lg shadow-amber-500/50' 
                    : 'bg-zinc-600/60 hover:bg-zinc-400'
                }`}
                title={`Đến trang ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPageIndex >= pages.length - 1}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              currentPageIndex >= pages.length - 1
                ? 'opacity-30 cursor-not-allowed bg-zinc-900 text-zinc-500'
                : 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/30 hover:bg-amber-300 active:scale-95'
            }`}
          >
            <span>Trang Kế Tiếp</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM TEXT INPUT MODAL */}
      {/* ========================================================================= */}
      {isInputModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Dán Hoặc Nhập Văn Bản Của Bạn
              </h3>
              <button
                onClick={() => setIsInputModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400">Tiêu đề bài đọc:</label>
                <input
                  type="text"
                  value={customTitleInput}
                  onChange={e => setCustomTitleInput(e.target.value)}
                  placeholder="VD: Luận Giải Lá Số Của Tôi..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400">Phụ đề (Tùy chọn):</label>
                <input
                  type="text"
                  value={customSubtitleInput}
                  onChange={e => setCustomSubtitleInput(e.target.value)}
                  placeholder="VD: Ghi chú ngày tháng, chủ đề..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400">Nội dung văn bản (Hỗ trợ Markdown):</label>
                <textarea
                  value={customContentInput}
                  onChange={e => setCustomContentInput(e.target.value)}
                  rows={8}
                  placeholder="Dán toàn bộ bài giải tử vi, tarot, chiêm tinh hoặc kinh văn vào đây..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 mt-1 custom-scrollbar leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsInputModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCustomReading}
                className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Lưu & Đọc Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <SpiritualShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        attachment={shareAttachment}
        onNavigateToMode={onNavigateToMode}
      />
    </div>
  );
}
