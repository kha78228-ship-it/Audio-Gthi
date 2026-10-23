// Service for Haevy Edu Focus Music & User Audio Upload Engine
// Supports persistent IndexedDB storage for uploaded MP3/WAV files and Web Audio procedural study ambients

export interface EduStudyTrack {
  id: string;
  title: string;
  artist: string;
  category: 'uploaded' | 'lofi' | 'binaural' | 'ambient';
  durationSec: number;
  url?: string;
  isCustomUpload?: boolean;
  blob?: Blob;
  addedAt?: number;
}

const PRESET_TRACKS: EduStudyTrack[] = [
  {
    id: 'preset-lofi-1',
    title: 'Lofi Chill Ôn Thi THPT 🎧',
    artist: 'Haevy Study Beats',
    category: 'lofi',
    durationSec: 180,
  },
  {
    id: 'preset-binaural-alpha',
    title: 'Sóng Não Alpha 14Hz (Tập Trung Sâu) 🧠',
    artist: 'Sóng Âm Học Tập GDPT 2018',
    category: 'binaural',
    durationSec: 300,
  },
  {
    id: 'preset-binaural-theta',
    title: 'Sóng Theta 6Hz (Khơi Nguồn Sáng Tạo & Trí Nhớ) 💡',
    artist: 'Khoa Học Trí Não',
    category: 'binaural',
    durationSec: 300,
  },
  {
    id: 'preset-rain',
    title: 'Mưa Rơi Bên Cửa Sổ Phòng Học 🌧️',
    artist: 'Tiếng Ồn Trắng Tĩnh Lặng',
    category: 'ambient',
    durationSec: 240,
  },
  {
    id: 'preset-cafe',
    title: 'Góc Quán Cafe Tự Học Yên Tĩnh ☕',
    artist: 'Không Gian Kỷ Luật',
    category: 'ambient',
    durationSec: 210,
  }
];

class EduStudyAudioService {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private proceduralNodes: {
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    gainNode?: GainNode;
    filterNode?: BiquadFilterNode;
    noiseBufferSource?: AudioBufferSourceNode;
  } | null = null;

  private currentTrack: EduStudyTrack | null = null;
  private isPlaying: boolean = false;
  private currentTimeSec: number = 0;
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private isLoop: boolean = true;
  private customTracks: EduStudyTrack[] = [];
  private listeners: Set<() => void> = new Set();
  private timerInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIndexedDB();
      this.setupAudioElement();
    }
  }

  private setupAudioElement() {
    this.audioEl = new Audio();
    this.audioEl.volume = this.volume;
    this.audioEl.loop = this.isLoop;

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.audioEl && !isNaN(this.audioEl.currentTime)) {
        this.currentTimeSec = this.audioEl.currentTime;
        this.notify();
      }
    });

    this.audioEl.addEventListener('ended', () => {
      if (!this.isLoop) {
        this.playNext();
      }
    });

    this.audioEl.addEventListener('pause', () => {
      if (this.currentTrack?.isCustomUpload) {
        this.isPlaying = false;
        this.notify();
      }
    });

    this.audioEl.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });
  }

  // IndexedDB for persistent storage of uploaded audio files
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('haevy_edu_audio_db', 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('user_tracks')) {
          db.createObjectStore('user_tracks', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async initIndexedDB() {
    try {
      const db = await this.openDB();
      const tx = db.transaction('user_tracks', 'readonly');
      const store = tx.objectStore('user_tracks');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        this.customTracks = items.map((item: any) => {
          let url = item.url;
          if (item.blob) {
            url = URL.createObjectURL(item.blob);
          }
          return {
            id: item.id,
            title: item.title,
            artist: item.artist || 'Nhạc Của Bạn',
            category: 'uploaded' as const,
            durationSec: item.durationSec || 180,
            url,
            blob: item.blob,
            isCustomUpload: true,
            addedAt: item.addedAt || Date.now()
          };
        });
        this.notify();
      };
    } catch (err) {
      console.warn('Could not initialize IndexedDB for Edu audio:', err);
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      currentTimeSec: this.currentTimeSec,
      volume: this.volume,
      isMuted: this.isMuted,
      isLoop: this.isLoop,
      allTracks: [...this.customTracks, ...PRESET_TRACKS],
      customTracks: this.customTracks,
      presetTracks: PRESET_TRACKS
    };
  }

  // Upload an audio file from user's phone or computer
  public async uploadAudioFile(file: File): Promise<EduStudyTrack> {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const url = URL.createObjectURL(file);

    // Get approximate duration
    const tempAudio = new Audio();
    tempAudio.src = url;
    const duration = await new Promise<number>((resolve) => {
      tempAudio.onloadedmetadata = () => {
        resolve(Math.round(tempAudio.duration) || 180);
      };
      tempAudio.onerror = () => resolve(180);
      setTimeout(() => resolve(180), 2000);
    });

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').trim() || 'Bài Hát Học Tập';
    const newTrack: EduStudyTrack = {
      id,
      title: cleanTitle,
      artist: 'Tải Lên Từ Thiết Bị 📱',
      category: 'uploaded',
      durationSec: duration,
      url,
      blob: file,
      isCustomUpload: true,
      addedAt: Date.now()
    };

    // Save to memory
    this.customTracks.unshift(newTrack);

    // Save to IndexedDB
    try {
      const db = await this.openDB();
      const tx = db.transaction('user_tracks', 'readwrite');
      const store = tx.objectStore('user_tracks');
      store.put({
        id,
        title: cleanTitle,
        artist: 'Tải Lên Từ Thiết Bị 📱',
        category: 'uploaded',
        durationSec: duration,
        blob: file,
        addedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to save to IndexedDB:', e);
    }

    this.notify();
    // Auto play newly uploaded track
    await this.playTrack(newTrack);
    return newTrack;
  }

  public async deleteCustomTrack(trackId: string) {
    if (this.currentTrack?.id === trackId) {
      this.stop();
      this.currentTrack = null;
    }
    this.customTracks = this.customTracks.filter(t => t.id !== trackId);
    try {
      const db = await this.openDB();
      const tx = db.transaction('user_tracks', 'readwrite');
      tx.objectStore('user_tracks').delete(trackId);
    } catch (e) {
      console.warn('Failed to delete from IndexedDB:', e);
    }
    this.notify();
  }

  // Procedural Sound synthesis using Web Audio API for presets
  private startProceduralSound(type: string) {
    this.stopProceduralSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const masterGain = ctx.createGain();
      const effectiveVol = this.isMuted ? 0 : this.volume * 0.45;
      masterGain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'preset-binaural-alpha') {
        // Alpha Waves: Left ear 200Hz, Right ear 214Hz (14Hz Alpha difference for deep concentration)
        const merger = ctx.createChannelMerger(2);
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscRight.type = 'sine';
        oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
        oscRight.frequency.setValueAtTime(214, ctx.currentTime);

        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        leftGain.gain.setValueAtTime(0.3, ctx.currentTime);
        rightGain.gain.setValueAtTime(0.3, ctx.currentTime);

        oscLeft.connect(leftGain);
        leftGain.connect(merger, 0, 0);

        oscRight.connect(rightGain);
        rightGain.connect(merger, 0, 1);

        merger.connect(masterGain);
        oscLeft.start();
        oscRight.start();

        this.proceduralNodes = { osc1: oscLeft, osc2: oscRight, gainNode: masterGain };
      } else if (type === 'preset-binaural-theta') {
        // Theta Waves: 194Hz & 200Hz (6Hz Theta difference for memory retention)
        const merger = ctx.createChannelMerger(2);
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscRight.type = 'sine';
        oscLeft.frequency.setValueAtTime(194, ctx.currentTime);
        oscRight.frequency.setValueAtTime(200, ctx.currentTime);

        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        leftGain.gain.setValueAtTime(0.28, ctx.currentTime);
        rightGain.gain.setValueAtTime(0.28, ctx.currentTime);

        oscLeft.connect(leftGain);
        leftGain.connect(merger, 0, 0);

        oscRight.connect(rightGain);
        rightGain.connect(merger, 0, 1);

        merger.connect(masterGain);
        oscLeft.start();
        oscRight.start();

        this.proceduralNodes = { osc1: oscLeft, osc2: oscRight, gainNode: masterGain };
      } else if (type === 'preset-rain') {
        // Rain Pink Noise Generator with low-pass filter
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        this.proceduralNodes = { noiseBufferSource: whiteNoise, gainNode: masterGain, filterNode: filter };
      } else {
        // Lofi chord drone / Cafe ambient warmth
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
        osc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);
        osc1.start();
        osc2.start();

        this.proceduralNodes = { osc1, osc2, gainNode: masterGain, filterNode: filter };
      }
    } catch (e) {
      console.warn('Web Audio synthesis not available:', e);
    }
  }

  private stopProceduralSound() {
    if (this.proceduralNodes) {
      try {
        if (this.proceduralNodes.osc1) this.proceduralNodes.osc1.stop();
        if (this.proceduralNodes.osc2) this.proceduralNodes.osc2.stop();
        if (this.proceduralNodes.noiseBufferSource) this.proceduralNodes.noiseBufferSource.stop();
      } catch {}
      this.proceduralNodes = null;
    }
  }

  public async playTrack(track: EduStudyTrack) {
    this.currentTrack = track;
    this.currentTimeSec = 0;

    if (track.isCustomUpload && track.url) {
      this.stopProceduralSound();
      if (this.timerInterval) clearInterval(this.timerInterval);

      if (this.audioEl) {
        this.audioEl.src = track.url;
        this.audioEl.currentTime = 0;
        this.audioEl.volume = this.isMuted ? 0 : this.volume;
        this.audioEl.loop = this.isLoop;
        try {
          await this.audioEl.play();
          this.isPlaying = true;
        } catch (e) {
          console.warn('Audio play request interrupted:', e);
          this.isPlaying = true;
        }
      }
    } else {
      // Procedural preset track
      if (this.audioEl) {
        this.audioEl.pause();
      }
      this.startProceduralSound(track.id);
      this.isPlaying = true;

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.isPlaying) {
          this.currentTimeSec += 1;
          if (this.currentTrack && this.currentTimeSec >= this.currentTrack.durationSec) {
            if (this.isLoop) {
              this.currentTimeSec = 0;
            } else {
              this.playNext();
            }
          }
          this.notify();
        }
      }, 1000);
    }

    this.notify();
  }

  public togglePlay() {
    if (!this.currentTrack) {
      const all = [...this.customTracks, ...PRESET_TRACKS];
      if (all.length > 0) {
        this.playTrack(all[0]);
      }
      return;
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.currentTrack?.isCustomUpload && this.audioEl) {
      this.audioEl.pause();
    }
    this.stopProceduralSound();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.notify();
  }

  public resume() {
    if (!this.currentTrack) return;
    this.isPlaying = true;
    if (this.currentTrack.isCustomUpload && this.audioEl) {
      this.audioEl.play().catch(() => {});
    } else {
      this.startProceduralSound(this.currentTrack.id);
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.isPlaying) {
          this.currentTimeSec += 1;
          if (this.currentTrack && this.currentTimeSec >= this.currentTrack.durationSec) {
            if (this.isLoop) {
              this.currentTimeSec = 0;
            } else {
              this.playNext();
            }
          }
          this.notify();
        }
      }, 1000);
    }
    this.notify();
  }

  public stop() {
    this.pause();
    this.currentTimeSec = 0;
    if (this.audioEl) {
      this.audioEl.currentTime = 0;
    }
    this.notify();
  }

  public seek(sec: number) {
    this.currentTimeSec = sec;
    if (this.currentTrack?.isCustomUpload && this.audioEl) {
      this.audioEl.currentTime = sec;
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.proceduralNodes?.gainNode && this.audioCtx) {
      this.proceduralNodes.gainNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume * 0.45,
        this.audioCtx.currentTime
      );
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    this.notify();
  }

  public toggleLoop() {
    this.isLoop = !this.isLoop;
    if (this.audioEl) {
      this.audioEl.loop = this.isLoop;
    }
    this.notify();
  }

  public playNext() {
    const all = [...this.customTracks, ...PRESET_TRACKS];
    if (all.length === 0) return;
    const currentIndex = all.findIndex(t => t.id === this.currentTrack?.id);
    const nextIndex = (currentIndex + 1) % all.length;
    this.playTrack(all[nextIndex]);
  }

  public playPrev() {
    const all = [...this.customTracks, ...PRESET_TRACKS];
    if (all.length === 0) return;
    const currentIndex = all.findIndex(t => t.id === this.currentTrack?.id);
    const prevIndex = (currentIndex - 1 + all.length) % all.length;
    this.playTrack(all[prevIndex]);
  }
}

export const eduStudyAudioService = new EduStudyAudioService();
