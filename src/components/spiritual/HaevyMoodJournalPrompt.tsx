import React, { useState } from 'react';
import { Smile, Sparkles, Heart, ChevronRight, Check, Send, RefreshCw } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';
import { useAuth } from '../../context/AuthContext';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';
import { MOOD_OPTIONS, MoodOption, QUICK_NOTE_SUGGESTIONS } from './HaevyMoodJournalView';

interface HaevyMoodJournalPromptProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onOpenFullJournal?: () => void;
}

export function HaevyMoodJournalPrompt({ onEarnCoins, onOpenFullJournal }: HaevyMoodJournalPromptProps) {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'guest_user';

  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[1]); // default 'Vui tươi'
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedToday, setSubmittedToday] = useState<boolean>(() => {
    try {
      const lastDate = localStorage.getItem(`haevy_spiritual_mood_last_date_${currentUserId}`);
      return lastDate === new Date().toISOString().split('T')[0];
    } catch {
      return false;
    }
  });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    haptics.impact('medium');
    setIsSubmitting(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const newPayload = {
      userId: currentUserId,
      emoji: selectedMood.emoji,
      moodLabel: selectedMood.label,
      sentimentScore: selectedMood.sentimentScore,
      note: note.trim().slice(0, 140),
      tag: 'Biết Ơn',
      date: todayStr,
      createdAt: new Date().toISOString()
    };

    try {
      if (user && user.uid) {
        const path = `users/${user.uid}/moodJournals`;
        try {
          await addDoc(collection(db, 'users', user.uid, 'moodJournals'), {
            ...newPayload,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        const storageKey = `haevy_spiritual_moods_${currentUserId}`;
        try {
          const prev = JSON.parse(localStorage.getItem(storageKey) || '[]');
          prev.unshift({ ...newPayload, id: `local-${Date.now()}` });
          localStorage.setItem(storageKey, JSON.stringify(prev));
        } catch {
          // ignore
        }
      }

      spiritualAudio.playSingingBowl(320);
      haptics.rewardClaim();
      setSubmittedToday(true);
      try {
        localStorage.setItem(`haevy_spiritual_mood_last_date_${currentUserId}`, todayStr);
      } catch {
        // ignore
      }

      if (onEarnCoins) {
        onEarnCoins(15, 'Ghi Nhật Ký Tâm Trạng Đầu Ngày (+15 Xu)');
      }
    } catch (err) {
      console.error('Error submitting quick mood prompt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedToday) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-950/60 via-zinc-950/80 to-indigo-950/60 border border-purple-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 text-purple-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Bạn đã ghi nhận tâm trạng hôm nay: <strong className="text-white">{selectedMood.emoji} {selectedMood.label}</strong>
          </span>
        </div>
        {onOpenFullJournal && (
          <button
            onClick={onOpenFullJournal}
            className="flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 transition-colors shrink-0 cursor-pointer"
          >
            <span>Xem Biểu Đồ Xu Hướng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/80 via-zinc-950/90 to-indigo-950/80 border border-purple-500/40 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
            <Smile className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>Hôm Nay Tâm Hồn Bạn Thế Nào?</span>
              <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                +15 Xu
              </span>
            </h4>
          </div>
        </div>

        {onOpenFullJournal && (
          <button
            onClick={onOpenFullJournal}
            className="text-[11px] font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Biểu Đồ Xu Hướng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Emoji Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood.label === mood.label;
          return (
            <button
              key={mood.label}
              type="button"
              onClick={() => {
                haptics.impact('light');
                setSelectedMood(mood);
              }}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? `${mood.bgGlow} ${mood.borderActive} text-white shadow-md scale-105`
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>{mood.emoji}</span>
              <span className="text-[11px]">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1-Sentence Note Inline Form */}
      <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
        <input
          type="text"
          maxLength={140}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Một câu ngắn về ngày hôm nay (hoặc chọn: "${QUICK_NOTE_SUGGESTIONS[0].slice(0, 32)}...")`}
          className="flex-1 bg-zinc-900/90 border border-zinc-800 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
        />

        <button
          type="button"
          onClick={() => setNote(QUICK_NOTE_SUGGESTIONS[0])}
          className="hidden md:inline-flex text-[11px] text-zinc-400 hover:text-purple-300 px-2 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 shrink-0"
        >
          Gợi ý
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !note.trim()}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 ${
            !note.trim()
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-purple-600 text-white active:scale-95 shadow-purple-900/40'
          }`}
        >
          {isSubmitting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
