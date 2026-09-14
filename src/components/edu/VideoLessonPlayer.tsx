import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Film, 
  Layers, 
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';
import { EduVideoLesson, EduVideoScene } from '../../types';

interface VideoLessonPlayerProps {
  initialTopic?: string;
  initialSummary?: string;
  onOpenLabExperiment?: (subject: string, expId: string) => void;
}

// Default pre-generated video lessons
const SAMPLE_VIDEO_LESSONS: Record<string, EduVideoLesson> = {
  'Con Lắc Đơn & Bảo Toàn Năng Lượng': {
    id: 'vid-pendulum',
    lessonTitle: 'Bản Chất Con Lắc Đơn & Định Luật Bảo Toàn Cơ Năng',
    lessonSubtitle: 'Tại sao thời gian dao động không phụ thuộc vào độ nặng của quả lắc?',
    subject: 'Vật lý cổ điển',
    totalDurationSec: 45,
    createdAt: '2026-09-14',
    scenes: [
      {
        id: 's1',
        sceneIndex: 1,
        title: 'Phân Cảnh 1: Khởi Nguồn Hiện Tượng Thực Tế',
        subtitle: 'Khám phá của Galileo Galilei tại nhà thờ Pisa',
        narration: 'Năm 1581, nhà bác học Galileo Galilei quan sát chiếc đèn chùm đung đưa trong nhà thờ Pisa và nhận thấy một nghịch lý kỳ lạ: Dù đèn chùm đung đưa mạnh hay nhẹ, thời gian cho mỗi nhịp dao động đều hoàn toàn như nhau.',
        visualType: 'interactive_canvas',
        visualData: {
          headline: 'Nghịch Lý Đèn Chùm Galileo Galilei',
          bulletPoints: [
            'Quan sát đèn chùm nhà thờ Pisa đung đưa',
            'Đo thời gian bằng nhịp đập mạch cổ tay',
            'Dao động lớn hay nhỏ đều có cùng chu kỳ T'
          ],
          diagramType: 'pendulum',
          formula: 'T = 2\\pi \\sqrt{\\frac{L}{g}}',
          takeaway: 'Tính đẳng thời: Chu kỳ chỉ phụ thuộc chiều dài dây và trọng lực.'
        },
        durationSec: 10
      },
      {
        id: 's2',
        sceneIndex: 2,
        title: 'Phân Cảnh 2: Mổ Xẻ Bản Chất Lực & Gia Tốc',
        subtitle: 'Tại sao quả nặng 1kg và 100kg đung đưa nhanh như nhau?',
        narration: 'Khi ta kéo con lắc lệch góc alpha, lực kéo nó về là thành phần tiếp tuyến của trọng lực: P nhân sin alpha. Quả nặng càng nặng thì lực kéo càng lớn, NHƯNG quán tính cản trở chuyển động cũng tăng tương ứng gấp bấy nhiêu lần. Hai yếu tố này triệt tiêu nhau hoàn toàn!',
        visualType: 'diagram',
        visualData: {
          headline: 'Sự Triệt Tiêu Kỳ Diệu Của Khối Lượng',
          bulletPoints: [
            'Lực kéo về: F = m · g · sin(θ)',
            'Gia tốc hồi phục: a = F / m = g · sin(θ)',
            'Khối lượng m ở tử và mẫu triệt tiêu nhau 100%'
          ],
          diagramType: 'flowchart',
          formula: 'a = g \\cdot \\sin(\\theta)',
          takeaway: 'Mọi vật rơi tự do hoặc đung đưa trong cùng một trường trọng lực đều có cùng gia tốc.'
        },
        durationSec: 12
      },
      {
        id: 's3',
        sceneIndex: 3,
        title: 'Phân Cảnh 3: Chuyển Hóa Cơ Năng',
        subtitle: 'Vũ điệu giữa Động năng và Thế năng',
        narration: 'Khi con lắc ở điểm cao nhất, vận tốc bằng không, toàn bộ năng lượng là thế năng hấp dẫn mgh. Khi lao qua vị trí cân bằng, độ cao bằng không, thế năng biến hóa trọn vẹn thành động năng 1/2 m v bình phương. Tổng năng lượng luôn được bảo toàn tuyệt đối!',
        visualType: 'formula',
        visualData: {
          headline: 'Định Luật Bảo Toàn Cơ Năng Toàn Phần',
          bulletPoints: [
            'Tại biên cực đại: W = Wt(max) = m · g · h',
            'Tại vị trí cân bằng: W = Wđ(max) = 1/2 · m · v²',
            'Năng lượng không tự nhiên sinh ra hay mất đi'
          ],
          diagramType: 'formula_block',
          formula: 'W = \\frac{1}{2}mv^2 + mgh = \\text{Hằng số}',
          takeaway: 'Không có cỗ máy vĩnh cửu: Con lắc không bao giờ bay cao hơn điểm xuất phát ban đầu.'
        },
        durationSec: 13
      },
      {
        id: 's4',
        sceneIndex: 4,
        title: 'Phân Cảnh 4: Ứng Dụng Đời Sống & Đúc Kết',
        subtitle: 'Từ đồng hồ quả lắc đến con lắc cản địa chấn tháp Taipei 101',
        narration: 'Hiểu bản chất con lắc giúp loài người chế tạo đồng hồ cơ khí chính xác hàng trăm năm, và tạo nên con lắc giảm chấn nặng 660 tấn treo lơ lửng trên đỉnh tòa tháp Taipei 101 để chống lại bão tố và động đất dữ dội.',
        visualType: 'summary_card',
        visualData: {
          headline: 'Đúc Kết Bài Học & Ứng Dụng Kỹ Thuật',
          bulletPoints: [
            'Đồng hồ cơ học đo thời gian chuẩn xác thời trung cổ',
            'Con lắc giảm chấn Tuned Mass Damper tháp Taipei 101',
            'Ghi nhớ: T chỉ tăng khi nối dài dây hoặc mang lên Mặt Trăng'
          ],
          diagramType: 'pendulum',
          takeaway: 'Học bản chất logic giúp bạn giải thích mọi bài toán thực tế mà không cần học vẹt!'
        },
        durationSec: 10
      }
    ]
  },
  'Chuẩn Độ Axit Bazơ': {
    id: 'vid-titration',
    lessonTitle: 'Bản Chất Chuẩn Độ Axit - Bazơ & Bước Nhảy pH',
    lessonSubtitle: 'Giải mã tại sao 1 giọt dung dịch làm đổi màu cả bình tam giác',
    subject: 'Hóa học dung dịch',
    totalDurationSec: 40,
    createdAt: '2026-09-14',
    scenes: [
      {
        id: 'sc1',
        sceneIndex: 1,
        title: 'Phân Cảnh 1: Thang Đo pH Là Gì?',
        subtitle: 'Bản chất phi tuyến tính của nồng độ ion H+',
        narration: 'Thang đo pH là một hàm số logarit cơ số 10. Khi dung dịch có pH bằng 1, nồng độ H+ là 0.1 mol/l. Nhưng khi pH bằng 7, nồng độ chỉ còn một phần mười triệu mol/l. Mỗi đơn vị pH tăng lên là nồng độ giảm đi mười lần.',
        visualType: 'interactive_canvas',
        visualData: {
          headline: 'Bản Chất Logarit Của Thang Đo pH',
          bulletPoints: [
            'Công thức định nghĩa: pH = -log₁₀[H⁺]',
            'Chênh lệch 1 đơn vị pH = Nồng độ thay đổi 10 lần',
            'pH = 1 (axit cực mạnh) -> pH = 7 (nước tinh khiết trung tính)'
          ],
          diagramType: 'titration',
          formula: 'pH = -\\log_{10}[H^+]',
          takeaway: 'Thang logarit giúp nén dải nồng độ từ 1 đến 0.00000000000001 thành các con số từ 0 đến 14 dễ theo dõi.'
        },
        durationSec: 10
      },
      {
        id: 'sc2',
        sceneIndex: 2,
        title: 'Phân Cảnh 2: Bước Nhảy pH Tại Điểm Tương Đương',
        subtitle: 'Tại sao chỉ thêm 0.05ml mà pH nhảy vọt từ 4 lên 10?',
        narration: 'Khi nhỏ NaOH từ buret vào HCl, ion OH- triệt tiêu ion H+ tạo thành nước. Ở gần điểm tương đương 25ml, lượng ion H+ còn sót lại siêu nhỏ. Chỉ cần một giọt bazơ tiếp theo rơi xuống, toàn bộ H+ bị quét sạch và OH- tự do thừa ra, đẩy pH vọt lên đột ngột.',
        visualType: 'diagram',
        visualData: {
          headline: 'Cơ Chế Bước Nhảy pH (pH Jump)',
          bulletPoints: [
            'Phản ứng ion: H⁺ + OH⁻ → H₂O',
            'Lượng proton cạn kiệt đến mức vết (nanomol)',
            'Một giọt 0.05ml NaOH làm nồng độ OH⁻ thừa gấp hàng triệu lần'
          ],
          diagramType: 'titration',
          formula: 'H^+ + OH^- \\rightarrow H_2O',
          takeaway: 'Chất chỉ thị Phenolphthalein lập tức đổi sang màu hồng cánh sen rực rỡ tại điểm này.'
        },
        durationSec: 14
      },
      {
        id: 'sc3',
        sceneIndex: 3,
        title: 'Phân Cảnh 3: Đúc Kết Nguyên Lý Thực Hành',
        subtitle: 'Cách làm chủ kỹ thuật chuẩn độ trong phòng thí nghiệm',
        narration: 'Bí quyết chuẩn độ chính xác: Khi thể tích buret gần đến 24ml, phải điều chỉnh khóa vòi để dung dịch nhỏ từng giọt thật chậm, lắc đều bình tam giác cho đến khi màu hồng phớt nhạt tồn tại bền vững trong 30 giây.',
        visualType: 'summary_card',
        visualData: {
          headline: 'Kỹ Năng Chuẩn Độ Chuẩn Xác Tuyệt Đối',
          bulletPoints: [
            'Nhận diện màu hồng phớt nhạt, không để chuyển sang hồng đậm',
            'Áp dụng công thức C_axit · V_axit = C_bazo · V_bazo',
            'Ứng dụng kiểm tra độ chua của nước cam, sữa, nước mưa axit'
          ],
          diagramType: 'titration',
          takeaway: 'Chuẩn độ là phương pháp định lượng hóa học cổ điển nhưng có độ chính xác cao nhất.'
        },
        durationSec: 16
      }
    ]
  }
};

export function VideoLessonPlayer({
  initialTopic,
  initialSummary,
  onOpenLabExperiment
}: VideoLessonPlayerProps) {
  // Active lesson
  const [currentLesson, setCurrentLesson] = useState<EduVideoLesson>(
    SAMPLE_VIDEO_LESSONS['Con Lắc Đơn & Bảo Toàn Năng Lượng']
  );

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);

  // Custom prompt modal
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneTimerRef = useRef<any>(null);

  // Active scene
  const activeScene: EduVideoScene = currentLesson.scenes[currentSceneIndex] || currentLesson.scenes[0];

  // If initialTopic passed, switch lesson if available
  useEffect(() => {
    if (initialTopic) {
      if (SAMPLE_VIDEO_LESSONS[initialTopic]) {
        setCurrentLesson(SAMPLE_VIDEO_LESSONS[initialTopic]);
        setCurrentSceneIndex(0);
        setProgressSec(0);
      } else {
        // Auto create lesson for custom topic
        handleGenerateLesson(initialTopic, initialSummary || 'Giải thích bản chất logic của chủ đề.');
      }
    }
  }, [initialTopic]);

  // Voice narration using Web Speech API
  const speakNarration = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = playbackSpeed;
    
    // Pick best Vietnamese voice if present
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Scene Timer Controller
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(sceneTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Start narration
    speakNarration(activeScene.narration);

    sceneTimerRef.current = setInterval(() => {
      setProgressSec(prev => {
        if (prev >= activeScene.durationSec) {
          // Go to next scene
          if (currentSceneIndex < currentLesson.scenes.length - 1) {
            setCurrentSceneIndex(curr => curr + 1);
            return 0;
          } else {
            // End of video
            setIsPlaying(false);
            return activeScene.durationSec;
          }
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(sceneTimerRef.current);
  }, [isPlaying, currentSceneIndex, activeScene, playbackSpeed, isMuted]);

  // Canvas Dynamic Background & Visuals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Deep Dark Modern Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient light glow
      const glowGrad = ctx.createRadialGradient(
        width * 0.7,
        height * 0.3,
        10,
        width * 0.7,
        height * 0.3,
        350
      );
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Floating Particle Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 25; i++) {
        const x = (i * 97 + frame * 0.3) % width;
        const y = (i * 71 + Math.sin(frame * 0.02 + i) * 20) % height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Draw custom animated diagram on the right half of the canvas
      const diagType = activeScene.visualData.diagramType;
      const rightCenterX = width * 0.75;
      const rightCenterY = height * 0.5;

      if (diagType === 'pendulum') {
        // Animated Pendulum
        const theta = 0.4 * Math.sin(frame * 0.05);
        const l = 120;
        const bobX = rightCenterX + l * Math.sin(theta);
        const bobY = rightCenterY - 60 + l * Math.cos(theta);

        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightCenterX, rightCenterY - 60);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#10b981';
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (diagType === 'titration') {
        // Animated Flask & Drop
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rightCenterX - 40, rightCenterY + 70);
        ctx.lineTo(rightCenterX + 40, rightCenterY + 70);
        ctx.lineTo(rightCenterX + 20, rightCenterY);
        ctx.lineTo(rightCenterX + 20, rightCenterY - 40);
        ctx.lineTo(rightCenterX - 20, rightCenterY - 40);
        ctx.lineTo(rightCenterX - 20, rightCenterY);
        ctx.closePath();
        ctx.stroke();

        // Liquid with pulsating pink glow
        const pinkAlpha = 0.3 + 0.3 * Math.sin(frame * 0.04);
        ctx.fillStyle = `rgba(244, 63, 94, ${pinkAlpha})`;
        ctx.fillRect(rightCenterX - 35, rightCenterY + 30, 70, 38);
      } else {
        // Rotating scientific helix / rings
        ctx.save();
        ctx.translate(rightCenterX, rightCenterY);
        ctx.rotate(frame * 0.015);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-50, -50, 100, 100);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = '#06b6d4';
        ctx.strokeRect(-45, -45, 90, 90);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeScene]);

  // Jump Scene
  const handleJumpScene = (index: number) => {
    setCurrentSceneIndex(index);
    setProgressSec(0);
    if (isPlaying) {
      speakNarration(currentLesson.scenes[index].narration);
    }
  };

  // Generate Lesson via Gemini API
  const handleGenerateLesson = async (topic: string, summary: string) => {
    setIsGenerating(true);

    try {
      const res = await fetch('/api/edu/generate-video-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content: summary,
          style: 'Sư phạm trực quan & First Principles'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.scenes && data.scenes.length > 0) {
          setCurrentLesson(data);
          setCurrentSceneIndex(0);
          setProgressSec(0);
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback to local lesson generator:', e);
    }

    // High quality local fallback
    setTimeout(() => {
      const newLesson: EduVideoLesson = {
        id: `vid-${Date.now()}`,
        lessonTitle: `Bản Chất Khoa Học: ${topic}`,
        lessonSubtitle: `Giải mã toàn diện từ nguyên lý đầu tiên đến ứng dụng thực tiễn`,
        subject: 'STEM Deep Dive',
        totalDurationSec: 40,
        createdAt: '2026-09-14',
        scenes: [
          {
            id: 'gen-s1',
            sceneIndex: 1,
            title: 'Phân Cảnh 1: Vấn Đề Gốc Rễ & Đặt Câu Hỏi',
            subtitle: 'Tại sao hiện tượng này tồn tại trong tự nhiên?',
            narration: `Chào mừng bạn đến với bài học trực quan về ${topic}. Để hiểu sâu mà không cần học vẹt, ta cần đặt câu hỏi về bản chất cơ chế hoạt động đằng sau các hiện tượng thường ngày.`,
            visualType: 'interactive_canvas',
            visualData: {
              headline: `Khám Phá Bản Chất: ${topic}`,
              bulletPoints: [
                'Quan sát quy luật vận hành trong tự nhiên',
                'Tách nhỏ bài toán theo nguyên lý First Principles',
                'Tìm mối liên hệ nhân quả giữa nguyên nhân và kết quả'
              ],
              diagramType: 'pendulum',
              takeaway: 'Hiểu bản chất giúp nhớ lâu gấp 10 lần học vẹt công thức.'
            },
            durationSec: 10
          },
          {
            id: 'gen-s2',
            sceneIndex: 2,
            title: 'Phân Cảnh 2: Mổ Xẻ Cơ Chế Hoạt Động',
            subtitle: 'Các định luật và lực chi phối',
            narration: `Mọi hiện tượng đều tuân theo các định luật bảo toàn bất biến. Khi ta nhìn sâu vào cấu trúc phân tử và lực tương tác, mọi công thức phức tạp đều trở nên giản dị và logic.`,
            visualType: 'diagram',
            visualData: {
              headline: 'Sơ Đồ Dòng Chảy Logic (First Principles)',
              bulletPoints: [
                'Bảo toàn năng lượng và khối lượng',
                'Mối quan hệ tỷ lệ thuận và tỷ lệ nghịch',
                'Điều kiện biên và các yếu tố ảnh hưởng trực tiếp'
              ],
              diagramType: 'flowchart',
              formula: 'F_{net} = \\sum F_i = m \\cdot a',
              takeaway: 'Mọi định luật đều xuất phát từ sự cân bằng của tự nhiên.'
            },
            durationSec: 14
          },
          {
            id: 'gen-s3',
            sceneIndex: 3,
            title: 'Phân Cảnh 3: Đúc Kết & Chuyển Hóa Kỹ Năng',
            subtitle: 'Vận dụng tư duy logic vào thực tế',
            narration: `Chúc mừng bạn đã hoàn thành bài học về ${topic}. Hãy mở phòng thí nghiệm ảo tương ứng để tự tay tinh chỉnh các thông số và kiểm chứng lại các kết luận vừa học!`,
            visualType: 'summary_card',
            visualData: {
              headline: 'Đúc Kết Bài Học & Thực Hành Lab',
              bulletPoints: [
                'Nắm vững 3 nguyên lý cốt lõi',
                'Tránh các sai lầm phổ biến khi giải quyết vấn đề',
                'Sẵn sàng thử nghiệm trong phòng lab ảo'
              ],
              diagramType: 'titration',
              takeaway: 'Học tập hiệu quả là kết hợp giữa lý thuyết bản chất và thực nghiệm tương tác!'
            },
            durationSec: 16
          }
        ]
      };

      setCurrentLesson(newLesson);
      setCurrentSceneIndex(0);
      setProgressSec(0);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Video Presentation Cinema Player Container */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Cinema Screen (16:9 Aspect Ratio) */}
        <div className="w-full relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Foreground Visual Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between pointer-events-none">
            {/* Top Video Header HUD */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  {currentLesson.subject}
                </span>
                <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                  {currentLesson.lessonTitle}
                </span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-zinc-300">
                Phân cảnh {activeScene.sceneIndex}/{currentLesson.scenes.length}
              </div>
            </div>

            {/* Center Left Slide Content */}
            <div className="max-w-[65%] space-y-3">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider block">
                {activeScene.title}
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-zinc-100 leading-tight">
                {activeScene.visualData.headline}
              </h2>

              {/* Bullet Points */}
              {activeScene.visualData.bulletPoints && (
                <div className="space-y-1.5 pt-1">
                  {activeScene.visualData.bulletPoints.map((bp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{bp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Formula Badge */}
              {activeScene.visualData.formula && (
                <div className="inline-block p-2 rounded-xl bg-zinc-900/90 border border-emerald-500/40 font-mono text-xs sm:text-sm text-emerald-300 shadow-md">
                  {activeScene.visualData.formula}
                </div>
              )}
            </div>

            {/* Bottom Subtitles / Narration Teleprompter */}
            <div className="w-full bg-zinc-950/90 backdrop-blur-md border border-zinc-800/90 p-3.5 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block">
                Thuyết Minh AI (Giọng Đọc Trực Quan)
              </span>
              <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed max-w-3xl mx-auto">
                "{activeScene.narration}"
              </p>
            </div>
          </div>
        </div>

        {/* Video Control Bar */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-col gap-3">
          {/* Progress Timeline Scrubber */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">
              {progressSec}s / {activeScene.durationSec}s
            </span>
            <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.min(100, (progressSec / activeScene.durationSec) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Tổng: {currentLesson.totalDurationSec}s
            </span>
          </div>

          {/* Controls & Scene Jump Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Play/Pause & Skips */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center transition-all shadow-md"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              <button
                onClick={() => handleJumpScene(Math.max(0, currentSceneIndex - 1))}
                disabled={currentSceneIndex === 0}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                title="Phân cảnh trước"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={() => handleJumpScene(Math.min(currentLesson.scenes.length - 1, currentSceneIndex + 1))}
                disabled={currentSceneIndex === currentLesson.scenes.length - 1}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40"
                title="Phân cảnh tiếp theo"
              >
                <SkipForward size={16} />
              </button>

              <button
                onClick={() => { setProgressSec(0); setIsPlaying(true); }}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title="Phát lại từ đầu phân cảnh"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Scene Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {currentLesson.scenes.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpScene(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    currentSceneIndex === idx
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  Cảnh {s.sceneIndex}
                </button>
              ))}
            </div>

            {/* Audio & Speed Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                title={isMuted ? 'Bật âm thanh thuyết minh' : 'Tắt tiếng'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
              </button>

              {/* Speed dropdown */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x Chuẩn</option>
                <option value="1.25">1.25x Nhanh</option>
                <option value="1.5">1.5x Siêu tốc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Video Generation Tool Card */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center">
              <Film size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100">Tạo Video Bài Giảng Mới Với AI</h3>
              <p className="text-xs text-zinc-400">Nhập bất kỳ chủ đề khoa học hoặc nội dung file để tạo video thuyết minh tự động</p>
            </div>
          </div>

          {/* Quick preset switch */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentLesson(SAMPLE_VIDEO_LESSONS['Con Lắc Đơn & Bảo Toàn Năng Lượng']);
                setCurrentSceneIndex(0);
                setProgressSec(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-medium"
            >
              Con Lắc Đơn
            </button>
            <button
              onClick={() => {
                setCurrentLesson(SAMPLE_VIDEO_LESSONS['Chuẩn Độ Axit Bazơ']);
                setCurrentSceneIndex(0);
                setProgressSec(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-medium"
            >
              Chuẩn Độ Axit Bazơ
            </button>
          </div>
        </div>

        {/* Prompt Input Form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập chủ đề muốn làm video (Ví dụ: Định luật khúc xạ Snell, Cấu trúc xoắn kép DNA, Quang hợp...)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={() => handleGenerateLesson(customTopic, 'Phân tích bản chất logic và ứng dụng thực tiễn.')}
            disabled={!customTopic.trim() || isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 shrink-0"
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Đang Tạo Kịch Bản...' : 'Tạo Video Ngay'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
