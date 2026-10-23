import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Check, 
  Volume2, 
  VolumeX, 
  Wallet, 
  Tag, 
  Calendar, 
  Heart, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Clock,
  Sparkle
} from 'lucide-react';
import { FinanceCategory, FinanceWallet, FinanceTransaction, FinanceTransactionType } from '../../types';
import { 
  parseVoiceExpense, 
  ParsedVoiceExpense, 
  speakVietnameseFeedback 
} from '../../utils/financeVoiceParser';
import { triggerHaptic } from '../../utils/haptics';

interface FinanceVoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: FinanceWallet[];
  categories: FinanceCategory[];
  currentUserId?: string;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => void;
  onNavigateToAll?: () => void;
}

// Sound synthesizer for audio cues
function playVoiceAudioCue(type: 'start' | 'match' | 'save' | 'stop') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'match') {
      [587.33, 739.99, 880.00].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.09, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } else if (type === 'save') {
      // Ascending triumphant chime
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    }
  } catch {}
}

const SAMPLE_VOICE_PHRASES = [
  'Ăn sáng phở bò 45 nghìn',
  'Đổ xăng xe máy 70k ví tiền mặt',
  'Uống cà phê 35k hẹn hò người yêu',
  'Đi siêu thị hết 350 nghìn tiền ăn',
  'Mua sách tiếng Anh 120k',
  'Tiền điện nước 650 ngàn ví ngân hàng',
  'Ăn trưa cơm văn phòng 50k',
  'Lương tháng này 18 triệu vào Vietcombank'
];

export function FinanceVoiceExpenseModal({
  isOpen,
  onClose,
  wallets,
  categories,
  currentUserId = 'user_haevy',
  onAddTransaction,
  onNavigateToAll
}: FinanceVoiceExpenseModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [parsedExpense, setParsedExpense] = useState<ParsedVoiceExpense | null>(null);
  const [enableTts, setEnableTts] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number>(3);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [isEditingParsed, setIsEditingParsed] = useState(false);

  // Editable parsed fields
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editWalletId, setEditWalletId] = useState<string>('');
  const [editType, setEditType] = useState<FinanceTransactionType>('expense');

  const recognitionRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Check speech recognition capability
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  // Initialize SpeechRecognition instance
  const startListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsSavedSuccessfully(false);
        setIsAutoSaving(false);
        cancelAutoSave();
        playVoiceAudioCue('start');
        triggerHaptic('light');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += trans;
          } else {
            currentInterim += trans;
          }
        }

        const fullText = (finalTrans || currentInterim || '').trim();
        if (fullText) {
          setInterimTranscript(currentInterim);
          if (finalTrans) {
            setTranscript(finalTrans);
            processSpokenText(finalTrans);
          } else {
            // Live parsing while speaking for snappy feedback
            processSpokenText(fullText, false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  // Process text into a parsed expense
  const processSpokenText = (text: string, isFinal = true) => {
    if (!text || text.trim().length < 2) return;

    const parsed = parseVoiceExpense(text, categories, wallets);
    setParsedExpense(parsed);
    setEditAmount(parsed.amount);
    setEditNote(parsed.note);
    setEditCategoryId(parsed.categoryId);
    setEditWalletId(parsed.walletId);
    setEditType(parsed.type);

    if (isFinal) {
      playVoiceAudioCue('match');
      triggerHaptic('medium');

      // Trigger automatic save countdown
      startAutoSaveCountdown(parsed);
    }
  };

  // Auto-save countdown logic (gives user 3.5s to view/cancel/edit)
  const startAutoSaveCountdown = (currentParsed: ParsedVoiceExpense) => {
    cancelAutoSave();
    setIsAutoSaving(true);
    let count = 3;
    setAutoSaveCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setAutoSaveCountdown(count);
      if (count <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    autoSaveTimerRef.current = setTimeout(() => {
      commitTransaction(currentParsed);
    }, 3200);
  };

  const cancelAutoSave = () => {
    setIsAutoSaving(false);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Finalize saving transaction
  const commitTransaction = (dataToSave?: ParsedVoiceExpense) => {
    cancelAutoSave();
    const source = dataToSave || parsedExpense;
    if (!source) return;

    const amount = isEditingParsed ? editAmount : source.amount;
    const note = isEditingParsed ? editNote : source.note;
    const categoryId = isEditingParsed ? editCategoryId : source.categoryId;
    const walletId = isEditingParsed ? editWalletId : source.walletId;
    const type = isEditingParsed ? editType : source.type;

    const chosenCat = categories.find(c => c.id === categoryId);
    const chosenWallet = wallets.find(w => w.id === walletId);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx: Omit<FinanceTransaction, 'id' | 'createdAt'> = {
      userId: currentUserId,
      amount,
      type,
      categoryId: chosenCat?.id || categoryId,
      categoryName: chosenCat?.name || source.categoryName,
      walletId: chosenWallet?.id || walletId,
      walletName: chosenWallet?.name || source.walletName,
      date: now.toISOString().slice(0, 10),
      time: timeStr,
      note: note || (type === 'income' ? 'Khoản thu nhập' : 'Khoản chi tiêu'),
      tags: source.tags,
      isCoupleShared: source.isCoupleShared,
      isFamilyFund: source.isFamilyFund,
    };

    onAddTransaction(newTx);
    playVoiceAudioCue('save');
    triggerHaptic('success');
    setIsSavedSuccessfully(true);

    // Optional Vietnamese Voice Feedback (TTS)
    if (enableTts) {
      const typeLabel = type === 'income' ? 'Đã ghi nhận thu nhập' : 'Đã ghi nhận chi tiêu';
      const formattedNum = new Intl.NumberFormat('vi-VN').format(amount);
      const walletNameShort = chosenWallet?.name || 'Ví của bạn';
      const ttsPhrase = `${typeLabel}: ${note}, ${formattedNum} đồng từ ${walletNameShort}`;
      speakVietnameseFeedback(ttsPhrase);
    }

    // Auto-close or reset after 2.2 seconds
    setTimeout(() => {
      setIsSavedSuccessfully(false);
      setParsedExpense(null);
      setTranscript('');
      setInterimTranscript('');
      setIsEditingParsed(false);
    }, 2200);
  };

  // Handle clicking sample phrases
  const handleSelectSample = (sample: string) => {
    stopListening();
    cancelAutoSave();
    setTranscript(sample);
    processSpokenText(sample, true);
  };

  // Reset and auto-start on open
  useEffect(() => {
    if (isOpen) {
      setIsSavedSuccessfully(false);
      setParsedExpense(null);
      setTranscript('');
      setInterimTranscript('');
      setIsEditingParsed(false);
      // Automatically prompt microphone on desktop/mobile
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      stopListening();
      cancelAutoSave();
    }
    return () => {
      stopListening();
      cancelAutoSave();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Ghi Nhanh Chi Tiêu Giọng Nói</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  Tiếng Việt
                </span>
              </div>
              <p className="text-xs text-zinc-400">Nói tự nhiên: tên món + số tiền + ví (nếu có)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle TTS Sound */}
            <button
              type="button"
              onClick={() => setEnableTts(!enableTts)}
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                enableTts 
                  ? 'bg-zinc-800 border-zinc-700 text-emerald-300' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={enableTts ? 'Tắt đọc phản hồi bằng giọng nói' : 'Bật đọc phản hồi bằng giọng nói'}
            >
              {enableTts ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Microphone Interactive Pulse Hub */}
          <div className="flex flex-col items-center justify-center py-4 text-center relative">
            {/* Animated Sound Wave Rings */}
            <div className="relative flex items-center justify-center my-3">
              {isListening && (
                <>
                  <div className="absolute w-32 h-32 rounded-full bg-emerald-500/15 animate-ping duration-1000" />
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/25 animate-pulse" />
                </>
              )}

              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-xl ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/30 ring-4 ring-rose-500/30'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-emerald-500/25 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff size={32} className="animate-bounce" />
                ) : (
                  <Mic size={32} />
                )}
              </button>
            </div>

            {/* Listening Status & Transcript */}
            <div className="mt-2 space-y-1 max-w-md">
              <span className={`text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5 ${
                isListening ? 'text-emerald-400' : 'text-zinc-400'
              }`}>
                {isListening && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                {isListening ? 'Đang lắng nghe giọng nói của bạn...' : 'Bấm mic để bắt đầu nói'}
              </span>

              {/* Real-time transcribed text display */}
              <div className="min-h-[50px] p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center text-center">
                {transcript || interimTranscript ? (
                  <p className="text-sm font-semibold text-white">
                    <span>"{transcript}"</span>
                    {interimTranscript && (
                      <span className="text-emerald-300 italic opacity-80"> {interimTranscript}...</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    {speechSupported 
                      ? 'Ví dụ: "Ăn phở tái 45k", "Đổ xăng 70 nghìn tiền mặt", "Cà phê 35k hẹn hò"...'
                      : 'Trình duyệt chưa bật mic, bạn có thể bấm các mẫu câu thử nghiệm bên dưới'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parsed Result Card (If transaction parsed) */}
          {parsedExpense && (
            <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
              isSavedSuccessfully 
                ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg shadow-emerald-500/20' 
                : 'bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-emerald-500/40 shadow-xl'
            }`}>
              {/* Success Overlay Banner */}
              {isSavedSuccessfully && (
                <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center mb-2 shadow-lg">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-base font-black text-white">Đã Ghi Nhận Thành Công!</h4>
                  <p className="text-xs text-emerald-200 mt-1 max-w-xs">
                    Giao dịch đã được cập nhật vào {parsedExpense.matchedJar} và trừ số dư tự động.
                  </p>
                </div>
              )}

              {/* Parsed Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${
                    parsedExpense.type === 'income' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {parsedExpense.type === 'income' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{parsedExpense.type === 'income' ? 'Khoản Thu' : 'Khoản Chi'}</span>
                  </span>

                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    {parsedExpense.matchedJar}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingParsed(!isEditingParsed)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-bold cursor-pointer transition"
                >
                  <Edit3 size={13} />
                  <span>{isEditingParsed ? 'Thu gọn' : 'Chỉnh sửa'}</span>
                </button>
              </div>

              {/* Main Amount & Title */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold">Tên khoản:</span>
                  {isEditingParsed ? (
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <h4 className="text-lg font-black text-white">{parsedExpense.note}</h4>
                  )}
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-zinc-400 font-semibold">Số tiền:</span>
                  {isEditingParsed ? (
                    <input
                      type="number"
                      step={1000}
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      className="mt-1 w-full sm:w-36 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-base font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parsedExpense.amount)}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-details (Category & Wallet) */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block mb-1">Danh mục:</span>
                  {isEditingParsed ? (
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-xs text-zinc-200"
                    >
                      {categories.filter(c => c.type === (isEditingParsed ? editType : parsedExpense.type)).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5 truncate">
                      <Tag size={13} className="text-amber-400 shrink-0" />
                      <span>{parsedExpense.categoryName}</span>
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block mb-1">Ví thanh toán:</span>
                  {isEditingParsed ? (
                    <select
                      value={editWalletId}
                      onChange={(e) => setEditWalletId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-xs text-zinc-200"
                    >
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5 truncate">
                      <Wallet size={13} className="text-emerald-400 shrink-0" />
                      <span>{parsedExpense.walletName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Couple / Family Tags if detected */}
              {(parsedExpense.isCoupleShared || parsedExpense.isFamilyFund) && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {parsedExpense.isCoupleShared && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
                      <Heart size={11} className="fill-rose-400 text-rose-400" />
                      <span>Chia sẻ Cặp Đôi (I Love Haevy)</span>
                    </span>
                  )}
                  {parsedExpense.isFamilyFund && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center gap-1">
                      <Users size={11} className="text-teal-400" />
                      <span>Chi tiêu Gia Đình</span>
                    </span>
                  )}
                </div>
              )}

              {/* Auto-Save Countdown Bar & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isAutoSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black animate-spin">
                      {autoSaveCountdown}
                    </div>
                    <span className="text-xs text-zinc-300">
                      Tự động lưu sau <strong className="text-emerald-400">{autoSaveCountdown}s</strong>...
                    </span>
                    <button
                      type="button"
                      onClick={cancelAutoSave}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer ml-1"
                    >
                      Dừng lại
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Độ tin cậy nhận diện: {Math.round(parsedExpense.confidence * 100)}%</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      cancelAutoSave();
                      setParsedExpense(null);
                      setTranscript('');
                      startListening();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-zinc-800"
                  >
                    <RefreshCw size={13} />
                    <span>Nói Lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => commitTransaction()}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={15} />
                    <span>Lưu Giao Dịch Ngay</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Voice Sample Carousel */}
          <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkle size={13} className="text-amber-400" />
                Mẫu Câu Chi Tiêu Phổ Biến (Bấm để thử ngay):
              </span>
              <span className="text-[10px] text-zinc-500">1-Chạm</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_PHRASES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-emerald-950/50 text-zinc-300 hover:text-emerald-300 border border-zinc-800 hover:border-emerald-500/40 text-xs font-medium transition-all text-left flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Zap size={11} className="text-amber-400 shrink-0" />
                  <span>{sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Phân tích chuẩn công thức 6 Hũ tiền & Quy tắc 50/30/20</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-zinc-300 hover:text-white cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
