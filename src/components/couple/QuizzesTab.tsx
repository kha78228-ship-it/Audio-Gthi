import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  Sparkle,
  Smile,
  Flame,
  Award
} from 'lucide-react';
import { CoupleData, CoupleCustomQuiz, CustomQuizOption } from '../../types';

interface QuizzesTabProps {
  couple: CoupleData;
  userUid?: string;
  customQuizzes: CoupleCustomQuiz[];
  onCreateQuiz: (question: string, options: CustomQuizOption[], explanation: string, sweetReward: string) => Promise<void>;
  onAnswerQuiz: (quiz: CoupleCustomQuiz, chosenOptId: string) => Promise<void>;
}

// Preset inspiration question prompts
const QUIZ_SUGGESTIONS = [
  { q: 'Món ăn yêu thích nhất của mình khi trời mưa lạnh?', opt1: 'Lẩu thái chua cay', opt2: 'Mì cay 7 cấp độ', opt3: 'Trà sữa nóng' },
  { q: 'Nơi mình muốn cùng bạn đi du lịch nhất trong năm nay?', opt1: 'Đà Lạt mộng mơ', opt2: 'Biển Phú Quốc / Nha Trang', opt3: 'Sapa săn mây' },
  { q: 'Hành động nhỏ nào của bạn khiến tim mình tan chảy nhất?', opt1: 'Cái ôm từ phía sau', opt2: 'Nắm tay khi sang đường', opt3: 'Mua món mình thích ăn' },
  { q: 'Cách dỗ dành mình nhanh nguôi giận nhất là gì?', opt1: 'Ôm chặt và xin lỗi ngọt ngào', opt2: 'Dẫn đi ăn ngon', opt3: 'Mua trà sữa / đồ ngọt' }
];

export function QuizzesTab({
  couple,
  userUid,
  customQuizzes,
  onCreateQuiz,
  onAnswerQuiz
}: QuizzesTabProps) {
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOpt1, setQuizOpt1] = useState('');
  const [quizOpt2, setQuizOpt2] = useState('');
  const [quizOpt3, setQuizOpt3] = useState('');
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizSweetReward, setQuizSweetReward] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const applySuggestion = (s: typeof QUIZ_SUGGESTIONS[0]) => {
    setQuizQuestion(s.q);
    setQuizOpt1(s.opt1);
    setQuizOpt2(s.opt2);
    setQuizOpt3(s.opt3);
    setQuizCorrectIdx(0);
    setQuizExplanation('Đúng chuẩn người yêu của tui!');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion.trim() || !quizOpt1.trim() || !quizOpt2.trim()) return;

    setSubmitting(true);
    try {
      const options: CustomQuizOption[] = [
        { id: 'opt_1', text: quizOpt1.trim(), isCorrect: quizCorrectIdx === 0 },
        { id: 'opt_2', text: quizOpt2.trim(), isCorrect: quizCorrectIdx === 1 },
      ];
      if (quizOpt3.trim()) {
        options.push({ id: 'opt_3', text: quizOpt3.trim(), isCorrect: quizCorrectIdx === 2 });
      }

      await onCreateQuiz(quizQuestion.trim(), options, quizExplanation.trim(), quizSweetReward.trim());

      setQuizQuestion('');
      setQuizOpt1('');
      setQuizOpt2('');
      setQuizOpt3('');
      setQuizExplanation('');
      setQuizSweetReward('');
      setIsAddQuizOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-sm xs:text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle size={17} className="text-rose-400 shrink-0" />
            <span>Trắc Nghiệm Thấu Hiểu Tùy Chuẩn</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
            Tự đặt câu hỏi trắc nghiệm về sở thích, thói quen và tính cách riêng của bạn để đối phương giải đố
          </p>
        </div>
        <button
          onClick={() => setIsAddQuizOpen(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tạo Câu Hỏi Mới</span>
        </button>
      </div>

      {/* Modal / Add Quiz Form */}
      {isAddQuizOpen && (
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-3xl bg-zinc-900 border border-rose-500/40 shadow-2xl space-y-3 sm:space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 sm:pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={14} className="text-rose-400 shrink-0" />
              <span>Tạo Câu Hỏi Thấu Hiểu Mới</span>
            </h3>
            <button onClick={() => setIsAddQuizOpen(false)} className="text-xs text-zinc-400 hover:text-white cursor-pointer">Đóng</button>
          </div>

          {/* Prompt Chips Suggestions */}
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold text-zinc-400">Gợi ý câu hỏi nhanh:</label>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {QUIZ_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="px-2 py-1 rounded-lg sm:rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/40 text-[9px] xs:text-[10px] sm:text-[11px] text-zinc-300 transition-all text-left truncate max-w-full"
                >
                  💡 {s.q.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3 sm:space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Nội dung câu hỏi của bạn</label>
              <input
                type="text"
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                placeholder="VD: Món ăn anh thích nhất khi trời mưa? Điều gì dỗ em nguôi giận nhanh nhất?"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-1.5 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300">Các phương án (Tích chọn vào phương án ĐÚNG):</label>
              
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctOpt" 
                  checked={quizCorrectIdx === 0} 
                  onChange={() => setQuizCorrectIdx(0)}
                  className="accent-rose-500 w-4 h-4 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={quizOpt1}
                  onChange={(e) => setQuizOpt1(e.target.value)}
                  placeholder="Đáp án A (VD: Lẩu gà lá é)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctOpt" 
                  checked={quizCorrectIdx === 1} 
                  onChange={() => setQuizCorrectIdx(1)}
                  className="accent-rose-500 w-4 h-4 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={quizOpt2}
                  onChange={(e) => setQuizOpt2(e.target.value)}
                  placeholder="Đáp án B (VD: Mì cay 7 cấp độ)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correctOpt" 
                  checked={quizCorrectIdx === 2} 
                  onChange={() => setQuizCorrectIdx(2)}
                  className="accent-rose-500 w-4 h-4 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={quizOpt3}
                  onChange={(e) => setQuizOpt3(e.target.value)}
                  placeholder="Đáp án C (Tùy chọn - VD: Trà sữa trân châu)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-1.5 sm:py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Lời giải thích ngọt ngào khi trả lời đúng / sai</label>
              <input
                type="text"
                value={quizExplanation}
                onChange={(e) => setQuizExplanation(e.target.value)}
                placeholder="VD: Chuẩn luôn, trời lạnh ăn lẩu với em là ấm nhất trên đời!"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-1.5 sm:py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => setIsAddQuizOpen(false)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                Lưu & Thử Thách
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Custom Quizzes */}
      {customQuizzes.length === 0 ? (
        <div className="p-6 sm:p-12 rounded-xl sm:rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-2.5 sm:space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <HelpCircle size={18} />
          </div>
          <p className="text-xs sm:text-sm font-bold text-white">Chưa có câu hỏi trắc nghiệm nào</p>
          <p className="text-[10px] sm:text-xs text-zinc-400 max-w-md mx-auto">
            Hãy tạo bộ câu đố chuẩn vị riêng để kiểm tra mức độ thấu hiểu và tâm đầu ý hợp của hai bạn!
          </p>
          <button
            onClick={() => setIsAddQuizOpen(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs cursor-pointer"
          >
            + Tạo câu hỏi đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {customQuizzes.map((quiz, idx) => {
            const isCreatedByMe = quiz.createdById === userUid;
            const isAnswered = Boolean(quiz.answeredById);

            return (
              <div
                key={quiz.id}
                className="p-3.5 xs:p-4 sm:p-5 rounded-xl sm:rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/40 transition-all space-y-2.5 sm:space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-rose-300 truncate max-w-[60%]">
                      Câu #{idx + 1} • Bởi: {isCreatedByMe ? 'Bạn' : quiz.createdByName}
                    </span>
                    {isAnswered && (
                      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1 ${
                        quiz.isPassed ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950 border border-rose-500/40 text-rose-300'
                      }`}>
                        {quiz.isPassed ? <Award size={11} /> : null}
                        <span>{quiz.isPassed ? 'Tâm Đầu Ý Hợp (+30đ)' : 'Chưa Chuẩn'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs xs:text-sm sm:text-base font-bold text-white leading-snug">{quiz.question}</h3>

                  {/* Options */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {quiz.options.map((opt, optIdx) => {
                      const isChosen = quiz.chosenOptionId === opt.id;
                      const showCorrectness = isAnswered || isCreatedByMe;

                      let optStyle = 'bg-zinc-950 border-zinc-800 text-zinc-300';
                      if (showCorrectness && opt.isCorrect) {
                        optStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold';
                      } else if (isChosen && !opt.isCorrect) {
                        optStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-bold line-through';
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={isAnswered || isCreatedByMe}
                          onClick={() => onAnswerQuiz(quiz, opt.id)}
                          className={`w-full p-2 xs:p-2.5 sm:p-3 rounded-lg sm:rounded-2xl border text-left text-[10px] xs:text-[11px] sm:text-xs flex items-center justify-between transition-all ${optStyle} ${
                            !isAnswered && !isCreatedByMe ? 'hover:border-rose-500 hover:bg-rose-500/10 cursor-pointer active:scale-[0.99]' : ''
                          }`}
                        >
                          <span className="leading-snug">{String.fromCharCode(65 + optIdx)}. {opt.text}</span>
                          {showCorrectness && opt.isCorrect && (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-2" />
                          )}
                          {isChosen && !opt.isCorrect && (
                            <AlertCircle size={14} className="text-rose-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isAnswered && quiz.explanation && (
                  <div className="p-2 xs:p-2.5 sm:p-3 rounded-lg sm:rounded-2xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-xs text-rose-300 italic">
                    💬 Lời nhắn: “{quiz.explanation}”
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
