// Ultra-Reliable Spiritual Text-To-Speech (TTS) & Mindful Reader Engine
// Strictly enforces 100% Vietnamese Speech synthesis, Solfeggio Harmonization, & Chromium GC Protection

import { spiritualAudio } from './spiritualAudioSynthesizer';

export interface TextSentence {
  id: number;
  paragraphIndex: number;
  text: string;
  cleanText: string;
}

export interface TextParagraph {
  id: number;
  rawText: string;
  isHeading: boolean;
  headingLevel?: number;
  isQuote?: boolean;
  sentences: TextSentence[];
}

export interface SpiritualSpeechVoice {
  id: string;
  name: string;
  lang: string;
  nativeVoice?: SpeechSynthesisVoice;
  description: string;
  isVietnamese: boolean;
}

export function isVietnameseVoice(v: SpeechSynthesisVoice | null | undefined): boolean {
  if (!v) return false;
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  return (
    lang.startsWith('vi') || 
    lang.includes('vn') || 
    name.includes('vietnam') || 
    name.includes('tiếng việt') ||
    name.includes('tieng viet') ||
    name.includes('hoaimy') ||
    name.includes('namminh') ||
    name.includes('linh') ||
    name.includes('mai') ||
    name.includes('an')
  );
}

export class SpiritualTextReaderEngine {
  private static instance: SpiritualTextReaderEngine | null = null;
  private isPlaying = false;
  private isPaused = false;
  private currentSentenceIndex = 0;
  private sentences: TextSentence[] = [];
  private paragraphs: TextParagraph[] = [];
  private rate = 1.0;
  private pitch = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private ambientFrequency: number | null = 528; // Default 528Hz Solfeggio Love & Transformation
  private ambientVolume = 0.12;
  private isAmbientEnabled = true;

  // Chromium GC Protection: maintain strong reference to active utterance
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  // Event Callbacks
  private onSentenceChangeCallbacks: ((index: number, sentence: TextSentence | null) => void)[] = [];
  private onStateChangeCallbacks: ((isPlaying: boolean, isPaused: boolean) => void)[] = [];
  private onCompleteCallbacks: (() => void)[] = [];
  private onVoicesLoadedCallbacks: ((voices: SpiritualSpeechVoice[]) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  public static getInstance(): SpiritualTextReaderEngine {
    if (!SpiritualTextReaderEngine.instance) {
      SpiritualTextReaderEngine.instance = new SpiritualTextReaderEngine();
    }
    return SpiritualTextReaderEngine.instance;
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length > 0) {
      this.selectBestVietnameseVoice(voices);
      const available = this.getAvailableVoices();
      this.onVoicesLoadedCallbacks.forEach(cb => cb(available));
    }
  }

  // Strictly select Vietnamese voice
  public selectBestVietnameseVoice(voicesList?: SpeechSynthesisVoice[]) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = voicesList || window.speechSynthesis.getVoices() || [];
    if (voices.length === 0) {
      this.selectedVoice = null;
      return;
    }

    // 1. High priority: Native Vietnamese voice
    const viVoice = voices.find(v => isVietnameseVoice(v));

    if (viVoice) {
      this.selectedVoice = viVoice;
    } else {
      // CRITICAL: NEVER assign an English voice to selectedVoice!
      // Keeping selectedVoice = null allows the browser's native Vietnamese language engine to activate via lang="vi-VN"
      this.selectedVoice = null;
    }
  }

  public getAvailableVoices(): SpiritualSpeechVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    const voices = window.speechSynthesis.getVoices() || [];
    const result: SpiritualSpeechVoice[] = [];

    // Vietnamese voices ONLY / Primary
    voices.forEach((v, idx) => {
      if (isVietnameseVoice(v)) {
        result.push({
          id: `voice_vi_${idx}`,
          name: v.name,
          lang: v.lang,
          nativeVoice: v,
          description: `🇻🇳 ${v.name} (Chuẩn Tiếng Việt)`,
          isVietnamese: true
        });
      }
    });

    // If no Vietnamese voice is registered in the list, provide standard Vietnamese system option
    if (result.length === 0) {
      result.push({
        id: 'voice_vi_default',
        name: 'Giọng Đọc Tiếng Việt Mặc Định (vi-VN)',
        lang: 'vi-VN',
        description: '🇻🇳 Giọng Đọc Tiếng Việt Tự Động Trình Duyệt',
        isVietnamese: true
      });
    }

    return result;
  }

  public setVoice(voice: SpeechSynthesisVoice | null) {
    if (voice && isVietnameseVoice(voice)) {
      this.selectedVoice = voice;
    } else {
      this.selectedVoice = null;
    }
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentSentence();
    }
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.6, Math.min(1.8, newRate));
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentSentence();
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public setPitch(newPitch: number) {
    this.pitch = Math.max(0.8, Math.min(1.2, newPitch));
  }

  public setAmbientSound(enabled: boolean, frequency: number | null = 528, volume: number = 0.12) {
    this.isAmbientEnabled = enabled;
    this.ambientFrequency = frequency;
    this.ambientVolume = volume;

    if (this.isPlaying && !this.isPaused) {
      if (this.isAmbientEnabled && this.ambientFrequency) {
        spiritualAudio.startSolfeggioTone(this.ambientFrequency, this.ambientVolume);
      } else {
        spiritualAudio.stopSolfeggioTone();
      }
    }
  }

  // Clean raw markdown text for smooth spoken audio without glitchy symbols
  private sanitizeForSpeech(text: string): string {
    if (!text) return '';

    return text
      // Remove URLs
      .replace(/https?:\/\/\S+/gi, '')
      // Remove emojis & special pictographs that break TTS
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, ' ')
      // Remove symbols like ☸️ 🌸 🌿 ✨ ❖ 🔮 📜 💖 🔔 👉 • ➔ ✦ ✧ ✋ 🧠 🏛️ 🌱
      .replace(/[☸🌸🌿✨❖🔮📜💖🔔👉•➔✦✧★☆◆◇■□▲▼►◄✓✗❌✔✋🧠🏛🌱]/g, ' ')
      // Remove markdown headings, quotes, bold, italics, strikethrough, backticks
      .replace(/^#+\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove dividers
      .replace(/[-=_*]{3,}/g, ' ')
      // Clean duplicate spaces and trim
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Parse raw Markdown into structured paragraphs and clean sentences for TTS
  public parseText(markdownText: string): { paragraphs: TextParagraph[]; sentences: TextSentence[] } {
    if (!markdownText) {
      this.paragraphs = [];
      this.sentences = [];
      return { paragraphs: [], sentences: [] };
    }

    const lines = markdownText.split('\n');
    const parsedParagraphs: TextParagraph[] = [];
    const parsedSentences: TextSentence[] = [];
    let sentenceCounter = 0;
    let paragraphCounter = 0;

    let currentParagraphLines: string[] = [];

    const flushParagraph = () => {
      if (currentParagraphLines.length === 0) return;
      const rawText = currentParagraphLines.join(' ').trim();
      currentParagraphLines = [];
      if (!rawText) return;

      const isHeading = rawText.startsWith('#');
      const isQuote = rawText.startsWith('>');
      let headingLevel = 0;
      if (isHeading) {
        const match = rawText.match(/^(#+)/);
        headingLevel = match ? match[1].length : 1;
      }

      const cleanForSpeech = this.sanitizeForSpeech(rawText);
      if (!cleanForSpeech) return;

      // Smart segmentation: split by sentence delimiters while keeping meaningful clauses
      const rawSentenceTokens = cleanForSpeech
        .split(/(?<=[.?!…;:\n])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const paragraphSentences: TextSentence[] = [];

      rawSentenceTokens.forEach(st => {
        // If a single segment is unusually long (>160 chars), split by comma or dash for natural breathing pauses
        if (st.length > 160) {
          const subClauses = st.split(/(?<=[,–—])\s+/).filter(c => c.trim().length > 0);
          if (subClauses.length > 1) {
            subClauses.forEach(clause => {
              const cleaned = clause.trim();
              if (cleaned.length > 0) {
                const sObj: TextSentence = {
                  id: sentenceCounter++,
                  paragraphIndex: paragraphCounter,
                  text: cleaned,
                  cleanText: cleaned
                };
                paragraphSentences.push(sObj);
                parsedSentences.push(sObj);
              }
            });
            return;
          }
        }

        const sentenceObj: TextSentence = {
          id: sentenceCounter++,
          paragraphIndex: paragraphCounter,
          text: st,
          cleanText: st
        };

        if (sentenceObj.cleanText.length > 0) {
          paragraphSentences.push(sentenceObj);
          parsedSentences.push(sentenceObj);
        }
      });

      if (paragraphSentences.length > 0) {
        parsedParagraphs.push({
          id: paragraphCounter++,
          rawText,
          isHeading,
          headingLevel,
          isQuote,
          sentences: paragraphSentences
        });
      }
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
      } else if (trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('===') || trimmed.startsWith('>')) {
        flushParagraph();
        currentParagraphLines.push(trimmed);
        flushParagraph();
      } else {
        currentParagraphLines.push(trimmed);
      }
    });

    flushParagraph();

    this.paragraphs = parsedParagraphs;
    this.sentences = parsedSentences;
    this.currentSentenceIndex = 0;

    return { paragraphs: parsedParagraphs, sentences: parsedSentences };
  }

  // Start or resume reading
  public start(startIndex: number = 0) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser environment.');
      return;
    }

    if (this.sentences.length === 0) return;

    this.clearWatchdog();
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentSentenceIndex = Math.max(0, Math.min(startIndex, this.sentences.length - 1));

    // Start background healing Solfeggio tone if enabled
    if (this.isAmbientEnabled && this.ambientFrequency) {
      spiritualAudio.startSolfeggioTone(this.ambientFrequency, this.ambientVolume);
    }

    this.notifyStateChange();
    
    // Micro-pause before speaking to ensure audio hardware is ready
    setTimeout(() => {
      if (this.isPlaying && !this.isPaused) {
        this.speakCurrentSentence();
      }
    }, 70);
  }

  // Speak current sentence with robust error handling, GC retention & 100% Vietnamese guarantee
  private speakCurrentSentence() {
    if (!this.isPlaying || this.isPaused) return;

    this.clearWatchdog();

    if (this.currentSentenceIndex >= this.sentences.length) {
      this.complete();
      return;
    }

    const currentSentence = this.sentences[this.currentSentenceIndex];
    if (!currentSentence || !currentSentence.cleanText) {
      this.currentSentenceIndex++;
      this.speakCurrentSentence();
      return;
    }

    this.notifySentenceChange(this.currentSentenceIndex, currentSentence);

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(currentSentence.cleanText);
    this.activeUtterance = utterance; // Strong reference prevents GC premature cutoff

    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // STRICT VIETNAMESE ENFORCEMENT
    utterance.lang = 'vi-VN';

    if (this.selectedVoice && isVietnameseVoice(this.selectedVoice)) {
      utterance.voice = this.selectedVoice;
    } else {
      // Double check if any Vietnamese voice is present
      const voices = window.speechSynthesis.getVoices() || [];
      const viVoice = voices.find(v => isVietnameseVoice(v));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      // If no explicit voice is found, leave utterance.voice = null so browser uses vi-VN synthesizer!
    }

    let isHandled = false;

    const advanceNext = (delayMs: number = 180) => {
      if (isHandled) return;
      isHandled = true;
      this.clearWatchdog();
      this.activeUtterance = null;

      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIndex++;
        setTimeout(() => {
          this.speakCurrentSentence();
        }, delayMs);
      }
    };

    utterance.onend = () => {
      advanceNext(180);
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('[TTS Notice] Proceeding past segment:', e.error || e);
      advanceNext(220);
    };

    // Watchdog fallback: prevents getting stuck if browser audio engine hangs
    const wordCount = currentSentence.cleanText.split(/\s+/).length;
    const estimatedMaxMs = Math.max(4000, ((wordCount / this.rate) * 1200) + 3000);

    this.watchdogTimer = setTimeout(() => {
      if (this.isPlaying && !this.isPaused && !isHandled) {
        console.warn('[TTS Watchdog] Sentence timeout reached, advancing gracefully...');
        advanceNext(100);
      }
    }, estimatedMaxMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS Speak Error]', err);
      advanceNext(200);
    }
  }

  private clearWatchdog() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  public pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    this.clearWatchdog();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
    this.notifyStateChange();
  }

  public resume() {
    if (!this.isPlaying || !this.isPaused) return;
    this.isPaused = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {
          this.speakCurrentSentence();
        }
      } else {
        this.speakCurrentSentence();
      }
    }

    if (this.isAmbientEnabled && this.ambientFrequency) {
      spiritualAudio.startSolfeggioTone(this.ambientFrequency, this.ambientVolume);
    }

    this.notifyStateChange();
  }

  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.clearWatchdog();
    this.activeUtterance = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    spiritualAudio.stopSolfeggioTone();
    this.notifyStateChange();
    this.notifySentenceChange(-1, null);
  }

  public jumpToSentence(index: number) {
    if (index < 0 || index >= this.sentences.length) return;
    this.currentSentenceIndex = index;
    if (this.isPlaying) {
      this.isPaused = false;
      this.speakCurrentSentence();
    } else {
      this.start(index);
    }
  }

  public nextSentence() {
    if (this.currentSentenceIndex < this.sentences.length - 1) {
      this.jumpToSentence(this.currentSentenceIndex + 1);
    }
  }

  public prevSentence() {
    if (this.currentSentenceIndex > 0) {
      this.jumpToSentence(this.currentSentenceIndex - 1);
    }
  }

  private complete() {
    this.stop();
    spiritualAudio.playSingingBowl(288);
    this.onCompleteCallbacks.forEach(cb => cb());
  }

  // Subscribe to changes
  public onSentenceChange(cb: (index: number, sentence: TextSentence | null) => void) {
    this.onSentenceChangeCallbacks.push(cb);
    return () => {
      this.onSentenceChangeCallbacks = this.onSentenceChangeCallbacks.filter(c => c !== cb);
    };
  }

  public onStateChange(cb: (isPlaying: boolean, isPaused: boolean) => void) {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  public onComplete(cb: () => void) {
    this.onCompleteCallbacks.push(cb);
    return () => {
      this.onCompleteCallbacks = this.onCompleteCallbacks.filter(c => c !== cb);
    };
  }

  public onVoicesLoaded(cb: (voices: SpiritualSpeechVoice[]) => void) {
    this.onVoicesLoadedCallbacks.push(cb);
    return () => {
      this.onVoicesLoadedCallbacks = this.onVoicesLoadedCallbacks.filter(c => c !== cb);
    };
  }

  private notifySentenceChange(index: number, sentence: TextSentence | null) {
    this.onSentenceChangeCallbacks.forEach(cb => cb(index, sentence));
  }

  private notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => cb(this.isPlaying, this.isPaused));
  }

  public getCurrentSentenceIndex(): number {
    return this.currentSentenceIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const spiritualTextReader = SpiritualTextReaderEngine.getInstance();
