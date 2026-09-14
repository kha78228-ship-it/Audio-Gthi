import { AudioBookmark } from '../types';

const STORAGE_KEY = 'haevy_audio_bookmarks_v1';

// Pre-seeded bookmarks for the default demo tracks so users instantly see how it works
const INITIAL_DEMO_BOOKMARKS: AudioBookmark[] = [
  {
    id: 'bm-demo-1',
    trackId: '1',
    trackTitle: 'Lạc Giữa Rừng Thông',
    trackArtist: 'Chill Beats VN',
    trackCoverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60',
    timestamp: 45,
    label: 'Đoạn piano du dương mở đầu',
    note: 'Giai điệu piano lãng mạn kết hợp tiếng mưa thông rơi, rất thích hợp khi tập trung làm việc.',
    color: 'emerald',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'bm-demo-2',
    trackId: '1',
    trackTitle: 'Lạc Giữa Rừng Thông',
    trackArtist: 'Chill Beats VN',
    trackCoverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60',
    timestamp: 110,
    label: 'Cao trào bass & tiếng chim hót',
    note: 'Tiếng suối và chim hót trong không gian 3D, độ mở âm hình rất rộng.',
    color: 'amber',
    createdAt: Date.now() - 3600000,
  }
];

class AudioBookmarkService {
  private bookmarks: AudioBookmark[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.bookmarks = parsed;
          return;
        }
      }
      // If nothing stored yet, initialize with demo bookmarks
      this.bookmarks = [...INITIAL_DEMO_BOOKMARKS];
      this.save();
    } catch (e) {
      console.warn('Failed to load audio bookmarks from localStorage:', e);
      this.bookmarks = [...INITIAL_DEMO_BOOKMARKS];
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
      this.notify();
    } catch (e) {
      console.warn('Failed to save audio bookmarks to localStorage:', e);
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in audio bookmark listener:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAll(): AudioBookmark[] {
    return [...this.bookmarks].sort((a, b) => b.createdAt - a.createdAt);
  }

  public getForTrack(trackId: string): AudioBookmark[] {
    return this.bookmarks
      .filter((b) => b.trackId === trackId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  public add(item: Omit<AudioBookmark, 'id' | 'createdAt'>): AudioBookmark {
    const newBookmark: AudioBookmark = {
      ...item,
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      label: item.label?.trim() || `Mốc ${this.formatTimestamp(item.timestamp)}`,
    };

    // Prevent duplicate bookmark at nearly identical timestamp (within 0.5s) for same track
    const existingIdx = this.bookmarks.findIndex(
      (b) => b.trackId === item.trackId && Math.abs(b.timestamp - item.timestamp) < 0.5
    );

    if (existingIdx !== -1) {
      // Update existing instead
      this.bookmarks[existingIdx] = {
        ...this.bookmarks[existingIdx],
        ...newBookmark,
        id: this.bookmarks[existingIdx].id,
      };
      this.save();
      return this.bookmarks[existingIdx];
    }

    this.bookmarks.unshift(newBookmark);
    this.save();
    return newBookmark;
  }

  public update(
    id: string,
    updates: Partial<Pick<AudioBookmark, 'label' | 'note' | 'color' | 'timestamp'>>
  ): AudioBookmark | null {
    const idx = this.bookmarks.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.bookmarks[idx] = {
      ...this.bookmarks[idx],
      ...updates,
      label: updates.label !== undefined ? updates.label.trim() : this.bookmarks[idx].label,
    };
    this.save();
    return this.bookmarks[idx];
  }

  public remove(id: string): boolean {
    const prevLen = this.bookmarks.length;
    this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
    if (this.bookmarks.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public clearForTrack(trackId: string): void {
    this.bookmarks = this.bookmarks.filter((b) => b.trackId !== trackId);
    this.save();
  }

  public clearAll(): void {
    this.bookmarks = [];
    this.save();
  }

  public formatTimestamp(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const audioBookmarkService = new AudioBookmarkService();
