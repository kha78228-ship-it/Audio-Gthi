import { QueryClient, useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Track } from '../types';

export const TRACKS_CACHE_KEY = 'haevy_tracks_cache_v2';
export const TRACKS_CACHE_META_KEY = 'haevy_tracks_cache_meta_v2';

export interface TracksCacheMetadata {
  updatedAt: number;
  count: number;
  source: 'cache' | 'firestore' | 'preset';
}

// Global TanStack QueryClient optimized for minimal Firestore reads & instant cache paint
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory cache
      refetchOnWindowFocus: false, // Avoid redundant Firestore reads on tab focus / click
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

/**
 * Retrieve cached tracks from browser local storage synchronously
 * Returns an array of Track or empty array if none available
 */
export function getCachedTracks(): Track[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRACKS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Track[];
    }
  } catch (err) {
    console.warn('[TracksCache] Failed to read tracks from local cache:', err);
  }
  return [];
}

/**
 * Save tracks to browser local storage
 */
export function persistTracksToCache(tracks: Track[]) {
  if (typeof window === 'undefined' || !Array.isArray(tracks) || tracks.length === 0) return;
  try {
    localStorage.setItem(TRACKS_CACHE_KEY, JSON.stringify(tracks));
    const meta: TracksCacheMetadata = {
      updatedAt: Date.now(),
      count: tracks.length,
      source: 'firestore',
    };
    localStorage.setItem(TRACKS_CACHE_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn('[TracksCache] Failed to write tracks to local storage:', err);
  }
}

/**
 * Fetch tracks from Firestore with error handling and fallback
 */
export async function fetchTracksFromFirestore(): Promise<Track[]> {
  try {
    const tracksCollection = collection(db, 'tracks');
    const tracksQuery = query(tracksCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(tracksQuery);

    const list: Track[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Track));

    // Fallback check: if 'tracks' is empty, check 'customTracks' collection
    if (list.length === 0) {
      try {
        const customColl = collection(db, 'customTracks');
        const customQuery = query(customColl, orderBy('createdAt', 'desc'));
        const customSnap = await getDocs(customQuery);
        if (!customSnap.empty) {
          customSnap.docs.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() } as Track);
          });
        }
      } catch (customErr) {
        console.warn('[TracksCache] Fallback customTracks check warning:', customErr);
      }
    }

    if (list.length > 0) {
      persistTracksToCache(list);
      return list;
    }

    // If Firestore returned zero tracks, check if we have older cached tracks
    const existingCache = getCachedTracks();
    if (existingCache.length > 0) {
      return existingCache;
    }

    return [];
  } catch (error) {
    console.warn('[TracksCache] Firestore tracks read error (falling back to cache):', error);
    const existingCache = getCachedTracks();
    if (existingCache.length > 0) {
      return existingCache;
    }
    return [];
  }
}

/**
 * Custom hook providing cached tracks with React Query
 * - Shows cached tracks immediately (stale-while-revalidate)
 * - Refetches updates in background only when stale (> 5 minutes)
 * - Significantly minimizes Firestore read costs
 */
export function useTracksQuery() {
  const queryResult = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracksFromFirestore,
    initialData: () => {
      const cached = getCachedTracks();
      return cached.length > 0 ? cached : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  });

  const tracks = queryResult.data ?? [];
  // Loading is only true if we have no tracks at all and the query is currently fetching
  const isLoading = queryResult.isLoading && tracks.length === 0;

  return {
    tracks,
    isLoadingTracks: isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetchTracks: queryResult.refetch,
    dataUpdatedAt: queryResult.dataUpdatedAt,
  };
}

/**
 * Manually invalidate tracks query cache
 * Call this when a new track is uploaded, edited, or deleted
 */
export function invalidateTracksCache() {
  queryClient.invalidateQueries({ queryKey: ['tracks'] });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('haevy-invalidate-tracks'));
  }
}
