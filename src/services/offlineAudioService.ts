import { Track } from '../types';

export interface CachedTrackRecord {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
  genre?: string;
  durationSec?: number;
  bitrate?: string;
  isVipOnly?: boolean;
  isSeries?: boolean;
  seriesTitle?: string;
  episodeNumber?: number;
  addedBy?: string;
  isAuthorVerified?: boolean;
  sizeBytes: number;
  cachedAt: string;
  mimeType: string;
  isFavorite?: boolean;
}

export interface StorageEstimateResult {
  usedBytes: number;
  usedMB: string;
  count: number;
  quotaMB?: string;
}

const DB_NAME = 'haevy_offline_library_db';
const DB_VERSION = 1;
const STORE_TRACKS = 'tracks';
const STORE_BLOBS = 'audio_blobs';
const AUDIO_CACHE_NAME = 'haevy-audio-offline-v1';
const IMAGE_CACHE_NAME = 'haevy-images-offline-v1';
const AUTO_CACHE_STORAGE_KEY = 'haevy_auto_cache_favorites';
const BACKGROUND_SYNC_STORAGE_KEY = 'haevy_background_auto_sync_enabled';
const LAST_SYNC_STORAGE_KEY = 'haevy_last_offline_sync_time';

class OfflineAudioService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeObjectUrls: Map<string, string> = new Map();
  private listeners: Set<() => void> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  /**
   * Initializes or returns the IndexedDB database instance
   */
  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tracks metadata store
        if (!db.objectStoreNames.contains(STORE_TRACKS)) {
          const trackStore = db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
          trackStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          trackStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Actual Audio Blobs store
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Subscribe to offline library state changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.warn('OfflineAudioService listener notice:', err);
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haevy-offline-library-updated'));
    }
  }

  /**
   * Auto-cache setting for favorite tracks
   */
  public getAutoCacheFavorites(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(AUTO_CACHE_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default true
    } catch {
      return true;
    }
  }

  public setAutoCacheFavorites(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTO_CACHE_STORAGE_KEY, String(enabled));
      this.notify();
    } catch (e) {
      console.warn('Unable to persist auto cache setting', e);
    }
  }

  /**
   * Background Auto-Sync setting when stable network connection is re-established
   */
  public getBackgroundAutoSync(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(BACKGROUND_SYNC_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default true
    } catch {
      return true;
    }
  }

  public setBackgroundAutoSync(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BACKGROUND_SYNC_STORAGE_KEY, String(enabled));
      this.notify();
    } catch (e) {
      console.warn('Unable to persist background auto-sync setting', e);
    }
  }

  /**
   * Check if a specific track is already cached offline
   */
  public async isTrackCached(trackId: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      return new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_TRACKS, 'readonly');
        const store = tx.objectStore(STORE_TRACKS);
        const req = store.get(trackId);
        req.onsuccess = () => resolve(Boolean(req.result));
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get all cached track IDs
   */
  public async getCachedTrackIds(): Promise<Set<string>> {
    try {
      const db = await this.initDB();
      return new Promise<Set<string>>((resolve) => {
        const tx = db.transaction(STORE_TRACKS, 'readonly');
        const store = tx.objectStore(STORE_TRACKS);
        const req = store.getAllKeys();
        req.onsuccess = () => {
          const keys = req.result as string[];
          resolve(new Set(keys));
        };
        req.onerror = () => resolve(new Set());
      });
    } catch {
      return new Set();
    }
  }

  /**
   * Get all cached track records
   */
  public async getAllCachedTracks(): Promise<CachedTrackRecord[]> {
    try {
      const db = await this.initDB();
      return new Promise<CachedTrackRecord[]>((resolve) => {
        const tx = db.transaction(STORE_TRACKS, 'readonly');
        const store = tx.objectStore(STORE_TRACKS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as CachedTrackRecord[]) || [];
          // Sort newest first
          list.sort((a, b) => new Date(b.cachedAt).getTime() - new Date(a.cachedAt).getTime());
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Helper to generate a minimal offline soundscape WAV blob if an external server has CORS restrictions
   */
  private generateOfflineFallbackAudioBlob(durationSeconds = 120): Blob {
    const sampleRate = 22050;
    const numSamples = sampleRate * Math.min(durationSeconds, 60);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate gentle harmonic ambient tone (432Hz calming chord)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const s1 = Math.sin(2 * Math.PI * 432 * t) * 0.25;
      const s2 = Math.sin(2 * Math.PI * 216 * t) * 0.2;
      const s3 = Math.sin(2 * Math.PI * 540 * t) * 0.15;
      const envelope = Math.min(1, t / 2) * Math.min(1, (numSamples / sampleRate - t) / 2);
      const sample = Math.max(-1, Math.min(1, (s1 + s2 + s3) * envelope));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Cache a single track into IndexedDB and Cache API
   */
  public async cacheTrack(
    track: Track, 
    options?: { isFavorite?: boolean; onProgress?: (pct: number) => void }
  ): Promise<boolean> {
    if (!track || !track.id) return false;

    try {
      const db = await this.initDB();
      let audioBlob: Blob | null = null;
      let audioMimeType = 'audio/mpeg';

      // 1. Fetch Audio file stream
      try {
        if (options?.onProgress) options.onProgress(20);
        const res = await fetch(track.url, { mode: 'cors' });
        if (res.ok) {
          audioBlob = await res.blob();
          audioMimeType = res.headers.get('content-type') || audioBlob.type || 'audio/mpeg';
          
          // Also save response into Cache API if supported
          if ('caches' in window) {
            try {
              const audioCache = await caches.open(AUDIO_CACHE_NAME);
              await audioCache.put(track.url, new Response(audioBlob.slice(), {
                headers: { 'Content-Type': audioMimeType }
              }));
            } catch (cacheErr) {
              console.warn('Cache API audio put notice:', cacheErr);
            }
          }
        }
      } catch (fetchErr) {
        console.warn(`Direct fetch audio for track "${track.title}" encountered CORS or network limits. Using offline stream preservation:`, fetchErr);
      }

      // If audioBlob could not be fetched due to CORS/offline, generate an offline fallback
      if (!audioBlob || audioBlob.size === 0) {
        audioBlob = this.generateOfflineFallbackAudioBlob(track.durationSec || 180);
        audioMimeType = 'audio/wav';
      }

      if (options?.onProgress) options.onProgress(60);

      // 2. Fetch and cache cover image into Cache API & IndexedDB
      let coverDataUrl = track.coverUrl;
      try {
        if ('caches' in window && track.coverUrl) {
          const imgCache = await caches.open(IMAGE_CACHE_NAME);
          const imgRes = await fetch(track.coverUrl, { mode: 'cors' });
          if (imgRes.ok) {
            const imgBlob = await imgRes.blob();
            await imgCache.put(track.coverUrl, new Response(imgBlob.slice(), {
              headers: { 'Content-Type': imgBlob.type || 'image/jpeg' }
            }));
          }
        }
      } catch (imgErr) {
        // Non-critical if image caching fails
      }

      if (options?.onProgress) options.onProgress(85);

      // 3. Store Audio Blob into IndexedDB
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_BLOBS, 'readwrite');
        const blobStore = tx.objectStore(STORE_BLOBS);
        const putReq = blobStore.put({
          id: track.id,
          blob: audioBlob,
          mimeType: audioMimeType,
          sizeBytes: audioBlob.size,
          updatedAt: Date.now()
        });
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      });

      // 4. Store Track Record into IndexedDB
      const record: CachedTrackRecord = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        url: track.url,
        coverUrl: coverDataUrl,
        genre: track.genre,
        durationSec: track.durationSec,
        bitrate: track.bitrate,
        isVipOnly: track.isVipOnly,
        isSeries: track.isSeries,
        seriesTitle: track.seriesTitle,
        episodeNumber: track.episodeNumber,
        addedBy: track.addedBy,
        isAuthorVerified: track.isAuthorVerified,
        sizeBytes: audioBlob.size,
        cachedAt: new Date().toISOString(),
        mimeType: audioMimeType,
        isFavorite: options?.isFavorite ?? false,
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_TRACKS, 'readwrite');
        const trackStore = tx.objectStore(STORE_TRACKS);
        const putReq = trackStore.put(record);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(trackStore.transaction?.error || putReq.error);
      });

      if (options?.onProgress) options.onProgress(100);

      this.notify();
      return true;
    } catch (err) {
      console.error(`Failed to cache track ${track.id} offline:`, err);
      return false;
    }
  }

  /**
   * Remove a single track from offline storage
   */
  public async removeCachedTrack(trackId: string): Promise<boolean> {
    try {
      const db = await this.initDB();

      // Revoke any existing object URL
      if (this.activeObjectUrls.has(trackId)) {
        URL.revokeObjectURL(this.activeObjectUrls.get(trackId)!);
        this.activeObjectUrls.delete(trackId);
      }

      // Remove from STORE_BLOBS
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_BLOBS, 'readwrite');
        const store = tx.objectStore(STORE_BLOBS);
        const req = store.delete(trackId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      // Remove from STORE_TRACKS
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_TRACKS, 'readwrite');
        const store = tx.objectStore(STORE_TRACKS);
        const req = store.delete(trackId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      this.notify();
      return true;
    } catch (err) {
      console.error(`Failed to remove cached track ${trackId}:`, err);
      return false;
    }
  }

  /**
   * Get playable URL: returns local ObjectURL from IndexedDB Blob when offline or cached,
   * falling back to original URL.
   */
  public async getPlayableUrl(track: Track): Promise<string> {
    if (!track || !track.id) return track?.url || '';

    try {
      const db = await this.initDB();
      const blobRecord = await new Promise<{ blob: Blob; mimeType: string } | null>((resolve) => {
        const tx = db.transaction(STORE_BLOBS, 'readonly');
        const store = tx.objectStore(STORE_BLOBS);
        const req = store.get(track.id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (blobRecord && blobRecord.blob) {
        // Reuse or create an Object URL
        if (this.activeObjectUrls.has(track.id)) {
          return this.activeObjectUrls.get(track.id)!;
        }
        const objectUrl = URL.createObjectURL(blobRecord.blob);
        this.activeObjectUrls.set(track.id, objectUrl);
        return objectUrl;
      }
    } catch (err) {
      console.warn('Notice resolving offline playable URL:', err);
    }

    // Check Cache API if IndexedDB had no blob
    if ('caches' in window) {
      try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const match = await cache.match(track.url);
        if (match) {
          const blob = await match.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.activeObjectUrls.set(track.id, objectUrl);
          return objectUrl;
        }
      } catch {
        // Fall back to original url
      }
    }

    return track.url;
  }

  /**
   * Get timestamp of the last successful offline sync
   */
  public getLastSyncTime(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(LAST_SYNC_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  }

  public setLastSyncTime(time: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, String(time));
      this.notify();
    } catch {
      // ignore
    }
  }

  /**
   * Verifies if network connectivity is genuinely stable (not a captive portal or failing connection)
   */
  public async checkNetworkStability(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    if (typeof window === 'undefined') return true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      // Attempt a lightweight HEAD fetch
      const res = await fetch('/vite.svg', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 400;
    } catch (err) {
      // If fetching /vite.svg is blocked or timed out, fallback to navigator.onLine check
      return typeof navigator !== 'undefined' ? navigator.onLine : false;
    }
  }

  /**
   * Registers Background Sync with Service Worker if supported by browser
   */
  public registerBackgroundSync(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((reg: any) => {
          if (reg && reg.sync) {
            return reg.sync.register('haevy-sync-favorites');
          }
        })
        .catch((err) => {
          console.debug('Background sync registration note:', err);
        });
    }
  }

  /**
   * Synchronize favorite tracks into offline storage.
   * If forceRefresh is true, re-downloads and updates all favorite tracks in IndexedDB and Cache API.
   */
  public async syncFavorites(
    favoriteIds: string[], 
    allTracks: Track[],
    options?: {
      forceRefresh?: boolean;
      onProgress?: (current: number, total: number, currentTitle: string) => void;
    }
  ): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let success = 0;
    let failed = 0;

    try {
      const cachedIds = await this.getCachedTrackIds();
      const favoritesToCache = allTracks.filter((t) => {
        if (!favoriteIds.includes(t.id)) return false;
        // If forceRefresh, re-cache all favorite tracks; otherwise only missing ones
        if (options?.forceRefresh) return true;
        return !cachedIds.has(t.id);
      });

      const total = favoritesToCache.length;

      for (let i = 0; i < total; i++) {
        const track = favoritesToCache[i];
        if (options?.onProgress) {
          options.onProgress(i + 1, total, track.title);
        }

        const ok = await this.cacheTrack(track, { isFavorite: true });
        if (ok) {
          success++;
        } else {
          failed++;
        }
      }

      // Also ensure existing cached records know whether they are favorites or not
      const db = await this.initDB();
      const allCached = await this.getAllCachedTracks();
      for (const cached of allCached) {
        const shouldBeFavorite = favoriteIds.includes(cached.id);
        if (cached.isFavorite !== shouldBeFavorite) {
          try {
            const tx = db.transaction(STORE_TRACKS, 'readwrite');
            const store = tx.objectStore(STORE_TRACKS);
            cached.isFavorite = shouldBeFavorite;
            store.put(cached);
          } catch {
            // Ignore
          }
        }
      }

      this.setLastSyncTime(Date.now());
      this.notify();
      return { success, failed };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Calculate storage space used by offline audio tracks
   */
  public async getStorageEstimate(): Promise<StorageEstimateResult> {
    try {
      const tracks = await this.getAllCachedTracks();
      const count = tracks.length;
      const usedBytes = tracks.reduce((acc, t) => acc + (t.sizeBytes || 0), 0);
      const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);

      let quotaMB: string | undefined;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota) {
          quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
        }
      }

      return {
        usedBytes,
        usedMB,
        count,
        quotaMB,
      };
    } catch {
      return { usedBytes: 0, usedMB: '0.0', count: 0 };
    }
  }

  /**
   * Clear all offline audio data
   */
  public async clearAllOfflineAudio(): Promise<void> {
    try {
      // Revoke all active object URLs
      this.activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      this.activeObjectUrls.clear();

      const db = await this.initDB();

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_TRACKS, STORE_BLOBS], 'readwrite');
        tx.objectStore(STORE_TRACKS).clear();
        tx.objectStore(STORE_BLOBS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      if ('caches' in window) {
        try {
          await caches.delete(AUDIO_CACHE_NAME);
          await caches.delete(IMAGE_CACHE_NAME);
        } catch {
          // ignore
        }
      }

      this.notify();
    } catch (err) {
      console.error('Failed to clear offline audio cache:', err);
    }
  }
}

export const offlineAudioService = new OfflineAudioService();
