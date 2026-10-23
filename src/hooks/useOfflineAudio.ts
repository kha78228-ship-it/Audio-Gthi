import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  offlineAudioService, 
  CachedTrackRecord, 
  StorageEstimateResult 
} from '../services/offlineAudioService';
import { Track } from '../types';

export function useOfflineAudio() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isConnectionStable, setIsConnectionStable] = useState<boolean>(true);
  const [cachedTrackIds, setCachedTrackIds] = useState<Set<string>>(new Set());
  const [cachedTracks, setCachedTracks] = useState<CachedTrackRecord[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageEstimateResult>({
    usedBytes: 0,
    usedMB: '0.0',
    count: 0
  });
  const [autoCacheFavorites, setAutoCacheFavoritesState] = useState<boolean>(() => {
    return offlineAudioService.getAutoCacheFavorites();
  });
  const [backgroundAutoSync, setBackgroundAutoSyncState] = useState<boolean>(() => {
    return offlineAudioService.getBackgroundAutoSync();
  });
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    return offlineAudioService.getLastSyncTime();
  });
  const [isSyncingFavorites, setIsSyncingFavorites] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);

  // Triggered when transitioning from offline -> online
  const [reconnectionDetected, setReconnectionDetected] = useState<boolean>(false);
  const wasOfflineRef = useRef<boolean>(!isOnline);

  // Refresh cached state from IndexedDB
  const refreshCacheState = useCallback(async () => {
    try {
      const [ids, tracks, storage] = await Promise.all([
        offlineAudioService.getCachedTrackIds(),
        offlineAudioService.getAllCachedTracks(),
        offlineAudioService.getStorageEstimate()
      ]);
      setCachedTrackIds(ids);
      setCachedTracks(tracks);
      setStorageInfo(storage);
      setAutoCacheFavoritesState(offlineAudioService.getAutoCacheFavorites());
      setBackgroundAutoSyncState(offlineAudioService.getBackgroundAutoSync());
      setLastSyncTime(offlineAudioService.getLastSyncTime());
    } catch (err) {
      console.warn('Error refreshing offline cache state:', err);
    }
  }, []);

  // Check connection stability
  const verifyConnectionStability = useCallback(async (): Promise<boolean> => {
    try {
      const stable = await offlineAudioService.checkNetworkStability();
      setIsConnectionStable(stable);
      return stable;
    } catch {
      setIsConnectionStable(false);
      return false;
    }
  }, []);

  // Online / Offline window listeners & reconnection detection
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const stable = await verifyConnectionStability();
      
      // If we were previously offline and connection is restored
      if (wasOfflineRef.current) {
        setReconnectionDetected(true);
        wasOfflineRef.current = false;
        offlineAudioService.registerBackgroundSync();
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('haevy-connection-restored', {
            detail: { isStable: stable }
          }));
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnectionStable(false);
      wasOfflineRef.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      verifyConnectionStability();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [verifyConnectionStability]);

  // Subscribe to changes in offline audio service
  useEffect(() => {
    refreshCacheState();
    const unsubscribe = offlineAudioService.subscribe(() => {
      refreshCacheState();
    });
    return () => unsubscribe();
  }, [refreshCacheState]);

  // Toggle auto cache
  const setAutoCacheFavorites = useCallback((enabled: boolean) => {
    offlineAudioService.setAutoCacheFavorites(enabled);
    setAutoCacheFavoritesState(enabled);
  }, []);

  // Toggle background auto-sync upon stable reconnection
  const setBackgroundAutoSync = useCallback((enabled: boolean) => {
    offlineAudioService.setBackgroundAutoSync(enabled);
    setBackgroundAutoSyncState(enabled);
  }, []);

  // Cache single track
  const cacheTrack = useCallback(async (track: Track, isFavorite = false): Promise<boolean> => {
    const ok = await offlineAudioService.cacheTrack(track, { isFavorite });
    await refreshCacheState();
    return ok;
  }, [refreshCacheState]);

  // Remove single track
  const removeCachedTrack = useCallback(async (trackId: string): Promise<boolean> => {
    const ok = await offlineAudioService.removeCachedTrack(trackId);
    await refreshCacheState();
    return ok;
  }, [refreshCacheState]);

  // Sync favorites (default incremental sync)
  const syncFavorites = useCallback(async (
    favoriteIds: string[], 
    allTracks: Track[],
    options?: { forceRefresh?: boolean }
  ) => {
    if (favoriteIds.length === 0 || allTracks.length === 0) return { success: 0, failed: 0 };

    setIsSyncingFavorites(true);
    setSyncProgress(null);

    try {
      const result = await offlineAudioService.syncFavorites(
        favoriteIds, 
        allTracks, 
        {
          forceRefresh: options?.forceRefresh,
          onProgress: (current, total, title) => {
            setSyncProgress({ current, total, title });
          }
        }
      );
      await refreshCacheState();
      setLastSyncTime(offlineAudioService.getLastSyncTime());
      return result;
    } finally {
      setIsSyncingFavorites(false);
      setSyncProgress(null);
    }
  }, [refreshCacheState]);

  // Force Refresh entire Favorites Cache
  const refreshFavoritesCache = useCallback(async (
    favoriteIds: string[], 
    allTracks: Track[]
  ) => {
    return syncFavorites(favoriteIds, allTracks, { forceRefresh: true });
  }, [syncFavorites]);

  // Clear all
  const clearAllOfflineAudio = useCallback(async () => {
    await offlineAudioService.clearAllOfflineAudio();
    await refreshCacheState();
    setLastSyncTime(null);
  }, [refreshCacheState]);

  return {
    isOnline,
    isConnectionStable,
    verifyConnectionStability,
    cachedTrackIds,
    cachedTracks,
    storageInfo,
    autoCacheFavorites,
    setAutoCacheFavorites,
    backgroundAutoSync,
    setBackgroundAutoSync,
    lastSyncTime,
    isSyncingFavorites,
    syncProgress,
    reconnectionDetected,
    setReconnectionDetected,
    cacheTrack,
    removeCachedTrack,
    syncFavorites,
    refreshFavoritesCache,
    clearAllOfflineAudio,
    refreshCacheState
  };
}
