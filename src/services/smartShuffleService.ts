import { Track } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type ShuffleMode = 'off' | 'shuffle' | 'smart_shuffle';
export type RepeatMode = 'off' | 'all' | 'one';

export interface TrackInteractionData {
  trackId: string;
  title: string;
  artist: string;
  genre: string;
  playCount: number;
  completeListens: number;
  skips: number;
  isFavorite: boolean;
  totalListenSec: number;
  lastPlayedTimestamp: number;
}

export interface GenreAffinityData {
  genre: string;
  score: number; // 0 - 100
  totalListenSec: number;
  listenCount: number;
  likesCount: number;
}

export interface UserAffinityProfile {
  interactions: Record<string, TrackInteractionData>;
  genreAffinities: Record<string, GenreAffinityData>;
  topGenres: { genre: string; score: number; percentage: number }[];
  totalListenedTracks: number;
  totalCompletedTracks: number;
  totalSkippedTracks: number;
  totalListeningTimeSec: number;
  lastUpdated: number;
}

export interface SmartTrackRecommendation {
  track: Track;
  affinityScore: number;
  reason: string;
  badges: string[];
}

const STORAGE_KEY = 'haevy_smart_affinity_profile_v2';
const SHUFFLE_MODE_KEY = 'haevy_playback_shuffle_mode_v2';
const REPEAT_MODE_KEY = 'haevy_playback_repeat_mode_v2';

// In-memory cache
let cachedProfile: UserAffinityProfile | null = null;
let currentTrackingSession: {
  trackId: string;
  track: Track;
  startTime: number;
  maxProgressSec: number;
  durationSec: number;
  completedRecorded: boolean;
} | null = null;

// Initialize empty profile
function createDefaultProfile(): UserAffinityProfile {
  return {
    interactions: {},
    genreAffinities: {},
    topGenres: [],
    totalListenedTracks: 0,
    totalCompletedTracks: 0,
    totalSkippedTracks: 0,
    totalListeningTimeSec: 0,
    lastUpdated: Date.now()
  };
}

// Load profile from localStorage
export function getStoredAffinityProfile(): UserAffinityProfile {
  if (cachedProfile) return cachedProfile;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedProfile = JSON.parse(raw);
      return cachedProfile!;
    }
  } catch (e) {
    console.warn('Failed to load stored affinity profile:', e);
  }

  cachedProfile = createDefaultProfile();
  return cachedProfile;
}

// Save profile to localStorage and sync to Firestore
export function saveAffinityProfile(profile: UserAffinityProfile, userId?: string | null): void {
  cachedProfile = profile;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save affinity profile to localStorage:', e);
  }

  // Sync to Firestore in background if logged in
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId, 'preferences', 'smartAffinity');
      setDoc(userRef, {
        topGenres: profile.topGenres,
        totalListenedTracks: profile.totalListenedTracks,
        totalCompletedTracks: profile.totalCompletedTracks,
        totalListeningTimeSec: profile.totalListeningTimeSec,
        lastUpdated: Date.now()
      }, { merge: true }).catch((err) => {
        console.warn('Silent Firestore affinity sync notice:', err);
      });
    } catch (err) {
      // ignore
    }
  }
}

// Recalculate genre affinities and top genres
function recalculateAffinities(profile: UserAffinityProfile): void {
  const genreTotals: Record<string, { totalListenSec: number; listenCount: number; likesCount: number; score: number }> = {};
  let totalScoreSum = 0;

  for (const trackId in profile.interactions) {
    const item = profile.interactions[trackId];
    const genre = item.genre || 'Khác';

    if (!genreTotals[genre]) {
      genreTotals[genre] = { totalListenSec: 0, listenCount: 0, likesCount: 0, score: 0 };
    }

    genreTotals[genre].totalListenSec += item.totalListenSec;
    genreTotals[genre].listenCount += item.playCount;
    if (item.isFavorite) genreTotals[genre].likesCount += 1;

    // Calculate item score
    const itemScore = 
      (item.isFavorite ? 35 : 0) +
      item.completeListens * 15 +
      item.playCount * 5 +
      Math.min(30, Math.floor(item.totalListenSec / 30)) -
      item.skips * 12;

    genreTotals[genre].score += Math.max(0, itemScore);
  }

  profile.genreAffinities = {};
  const genreScoresArray: { genre: string; rawScore: number }[] = [];

  for (const genre in genreTotals) {
    const data = genreTotals[genre];
    totalScoreSum += data.score;
    genreScoresArray.push({ genre, rawScore: data.score });
  }

  // Sort descending
  genreScoresArray.sort((a, b) => b.rawScore - a.rawScore);

  const maxScore = genreScoresArray[0]?.rawScore || 1;

  profile.topGenres = genreScoresArray.slice(0, 6).map((item) => {
    const normalizedScore = Math.min(100, Math.round((item.rawScore / maxScore) * 100));
    const percentage = totalScoreSum > 0 ? Math.round((item.rawScore / totalScoreSum) * 100) : 0;
    
    profile.genreAffinities[item.genre] = {
      genre: item.genre,
      score: normalizedScore,
      totalListenSec: genreTotals[item.genre].totalListenSec,
      listenCount: genreTotals[item.genre].listenCount,
      likesCount: genreTotals[item.genre].likesCount
    };

    return {
      genre: item.genre,
      score: normalizedScore,
      percentage
    };
  });

  profile.lastUpdated = Date.now();
}

/**
 * Record when a track starts playing
 */
export function recordTrackPlayStart(track: Track, userId?: string | null): void {
  if (!track || !track.id) return;

  // Flush previous session if uncompleted
  flushCurrentTrackingSession(userId);

  currentTrackingSession = {
    trackId: track.id,
    track,
    startTime: Date.now(),
    maxProgressSec: 0,
    durationSec: track.durationSec || 180,
    completedRecorded: false
  };

  const profile = getStoredAffinityProfile();
  if (!profile.interactions[track.id]) {
    profile.interactions[track.id] = {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre || 'Khác',
      playCount: 1,
      completeListens: 0,
      skips: 0,
      isFavorite: false,
      totalListenSec: 0,
      lastPlayedTimestamp: Date.now()
    };
  } else {
    profile.interactions[track.id].playCount += 1;
    profile.interactions[track.id].lastPlayedTimestamp = Date.now();
  }

  profile.totalListenedTracks += 1;
  recalculateAffinities(profile);
  saveAffinityProfile(profile, userId);
}

/**
 * Record real-time progress update
 */
export function recordTrackProgress(progressSec: number, durationSec?: number): void {
  if (!currentTrackingSession) return;
  if (durationSec && durationSec > 0) {
    currentTrackingSession.durationSec = durationSec;
  }
  if (progressSec > currentTrackingSession.maxProgressSec) {
    currentTrackingSession.maxProgressSec = progressSec;
  }

  // If listened to >80% or >120s -> count as complete
  const duration = currentTrackingSession.durationSec;
  if (
    !currentTrackingSession.completedRecorded &&
    duration > 0 &&
    (progressSec / duration >= 0.8 || (duration > 60 && progressSec >= duration - 10))
  ) {
    currentTrackingSession.completedRecorded = true;
    const profile = getStoredAffinityProfile();
    const item = profile.interactions[currentTrackingSession.trackId];
    if (item) {
      item.completeListens += 1;
      profile.totalCompletedTracks += 1;
      recalculateAffinities(profile);
      saveAffinityProfile(profile);
    }
  }
}

/**
 * Flush and finalize the current track session
 */
export function flushCurrentTrackingSession(userId?: string | null): void {
  if (!currentTrackingSession) return;

  const { trackId, maxProgressSec, durationSec, completedRecorded } = currentTrackingSession;
  const profile = getStoredAffinityProfile();
  const item = profile.interactions[trackId];

  if (item) {
    item.totalListenSec += Math.round(maxProgressSec);
    profile.totalListeningTimeSec += Math.round(maxProgressSec);

    // If user listened <18 seconds and track is >40s, classify as Skip
    if (!completedRecorded && maxProgressSec < 18 && durationSec > 40) {
      item.skips += 1;
      profile.totalSkippedTracks += 1;
    }

    recalculateAffinities(profile);
    saveAffinityProfile(profile, userId);
  }

  currentTrackingSession = null;
}

/**
 * Record Favorite Toggled for affinity calculation
 */
export function recordFavoriteState(trackId: string, isFav: boolean, track?: Track, userId?: string | null): void {
  const profile = getStoredAffinityProfile();
  if (!profile.interactions[trackId] && track) {
    profile.interactions[trackId] = {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre || 'Khác',
      playCount: 1,
      completeListens: 0,
      skips: 0,
      isFavorite: isFav,
      totalListenSec: 0,
      lastPlayedTimestamp: Date.now()
    };
  } else if (profile.interactions[trackId]) {
    profile.interactions[trackId].isFavorite = isFav;
  }

  recalculateAffinities(profile);
  saveAffinityProfile(profile, userId);
}

/**
 * Calculate individual Affinity Score & Recommendation Reason for a track
 */
export function calculateTrackAffinity(
  track: Track,
  currentTrack?: Track | null,
  recentHistoryIds: string[] = []
): { score: number; reason: string; badges: string[] } {
  const profile = getStoredAffinityProfile();
  const item = profile.interactions[track.id];
  const genre = track.genre || 'Khác';
  const genreData = profile.genreAffinities[genre];

  let score = 15; // Base probability weight
  const badges: string[] = [];
  let reason = 'Đề xuất danh sách chuẩn';

  // 1. Favorites Bonus
  if (item?.isFavorite) {
    score += 45;
    badges.push('Yêu thích ❤️');
    reason = 'Bài hát nằm trong danh sách Yêu thích của bạn';
  }

  // 2. High Repeat / Complete Listens
  if (item && item.completeListens > 0) {
    const completeBonus = Math.min(30, item.completeListens * 6);
    score += completeBonus;
    if (item.completeListens >= 3) {
      badges.push(`Nghe lại ${item.completeListens} lần 🔁`);
      reason = `Bạn thường xuyên nghe trọn vẹn bài này (${item.completeListens} lần)`;
    }
  }

  // 3. Genre Affinity Multiplier
  if (genreData && genreData.score > 0) {
    const genreBonus = Math.round((genreData.score / 100) * 35);
    score += genreBonus;
    if (genreData.score >= 50 && !badges.includes('Yêu thích ❤️')) {
      badges.push(`Gu ${genre} (${genreData.score}%) ✨`);
      reason = `Hợp gu âm nhạc thể loại ${genre} của bạn`;
    }
  }

  // 4. Flow Continuity with currently playing genre
  if (currentTrack?.genre && currentTrack.genre === track.genre && currentTrack.id !== track.id) {
    score += 15;
    if (badges.length < 2) {
      badges.push(`Cùng thể loại ${track.genre} 🎶`);
    }
  }

  // 5. Smart Discovery for Unplayed Tracks in Favorite Genres
  if (!item || item.playCount === 0) {
    if (genreData && genreData.score >= 40) {
      score += 25;
      badges.push('Khám phá mới 🌟');
      reason = `Gợi ý mới mẻ theo thể loại ${genre} bạn yêu thích`;
    }
  }

  // 6. Skip Penalty
  if (item && item.skips > 0) {
    score -= Math.min(35, item.skips * 12);
  }

  // 7. Recency Penalty (Dynamic Cooldown to prevent immediate loops)
  const historyIndex = recentHistoryIds.indexOf(track.id);
  if (historyIndex !== -1) {
    const recencyDistance = recentHistoryIds.length - historyIndex;
    if (recencyDistance <= 2) {
      score *= 0.05; // Played 1-2 tracks ago
    } else if (recencyDistance <= 5) {
      score *= 0.3; // Played recently
    } else if (recencyDistance <= 10) {
      score *= 0.6;
    }
  }

  score = Math.max(1, Math.round(score));
  return { score, reason, badges };
}

/**
 * Weighted Random Selection (Smart Shuffle Picker)
 */
export function pickSmartNextTrack(
  playlist: Track[],
  currentTrack: Track | null,
  recentHistoryIds: string[] = []
): Track | null {
  if (!playlist || playlist.length === 0) return null;
  if (playlist.length === 1) return playlist[0];

  // Exclude current track from candidate pool if possible
  const candidatePool = playlist.filter((t) => !currentTrack || t.id !== currentTrack.id);
  if (candidatePool.length === 0) return playlist[0];

  // Calculate weights for each track
  const weightedCandidates = candidatePool.map((track) => {
    const { score, reason, badges } = calculateTrackAffinity(track, currentTrack, recentHistoryIds);
    return { track, weight: score, reason, badges };
  });

  // Calculate cumulative sum
  const totalWeight = weightedCandidates.reduce((sum, item) => sum + item.weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const item of weightedCandidates) {
    if (randomValue <= item.weight) {
      return item.track;
    }
    randomValue -= item.weight;
  }

  return weightedCandidates[0]?.track || playlist[0];
}

/**
 * Generate Smart Queue preview of upcoming recommended tracks
 */
export function generateSmartUpcomingQueue(
  playlist: Track[],
  currentTrack: Track | null,
  recentHistoryIds: string[] = [],
  limit = 8
): SmartTrackRecommendation[] {
  if (!playlist || playlist.length === 0) return [];

  const candidates = playlist.filter((t) => !currentTrack || t.id !== currentTrack.id);
  const scored = candidates.map((track) => {
    const { score, reason, badges } = calculateTrackAffinity(track, currentTrack, recentHistoryIds);
    return {
      track,
      affinityScore: score,
      reason,
      badges
    };
  });

  // Sort by affinity score descending
  scored.sort((a, b) => b.affinityScore - a.affinityScore);
  return scored.slice(0, limit);
}

/**
 * Get Saved Shuffle and Repeat Modes
 */
export function getPlaybackModes(): { shuffleMode: ShuffleMode; repeatMode: RepeatMode } {
  let shuffleMode: ShuffleMode = 'smart_shuffle';
  let repeatMode: RepeatMode = 'off';

  try {
    const savedShuffle = localStorage.getItem(SHUFFLE_MODE_KEY);
    if (savedShuffle === 'off' || savedShuffle === 'shuffle' || savedShuffle === 'smart_shuffle') {
      shuffleMode = savedShuffle as ShuffleMode;
    }
    const savedRepeat = localStorage.getItem(REPEAT_MODE_KEY);
    if (savedRepeat === 'off' || savedRepeat === 'all' || savedRepeat === 'one') {
      repeatMode = savedRepeat as RepeatMode;
    }
  } catch (e) {
    // fallback
  }

  return { shuffleMode, repeatMode };
}

/**
 * Save Shuffle Mode
 */
export function saveShuffleMode(mode: ShuffleMode): void {
  try {
    localStorage.setItem(SHUFFLE_MODE_KEY, mode);
  } catch (e) {
    // ignore
  }
}

/**
 * Save Repeat Mode
 */
export function saveRepeatMode(mode: RepeatMode): void {
  try {
    localStorage.setItem(REPEAT_MODE_KEY, mode);
  } catch (e) {
    // ignore
  }
}

/**
 * Reset user affinity profile
 */
export function resetAffinityProfile(userId?: string | null): void {
  cachedProfile = createDefaultProfile();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId, 'preferences', 'smartAffinity');
      setDoc(userRef, {
        topGenres: [],
        totalListenedTracks: 0,
        totalCompletedTracks: 0,
        totalListeningTimeSec: 0,
        lastUpdated: Date.now()
      }).catch(() => {});
    } catch (e) {}
  }
}

/**
 * Load user affinity profile from Firestore
 */
export async function loadAffinityFromFirestore(userId: string): Promise<UserAffinityProfile | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId, 'preferences', 'smartAffinity');
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserAffinityProfile>;
      const current = getStoredAffinityProfile();
      // Merge cloud stats with local cache
      const merged: UserAffinityProfile = {
        ...current,
        totalListenedTracks: Math.max(current.totalListenedTracks, data.totalListenedTracks || 0),
        totalCompletedTracks: Math.max(current.totalCompletedTracks, data.totalCompletedTracks || 0),
        totalListeningTimeSec: Math.max(current.totalListeningTimeSec, data.totalListeningTimeSec || 0),
        topGenres: data.topGenres && data.topGenres.length > 0 ? data.topGenres : current.topGenres,
        genreAffinities: { ...current.genreAffinities, ...(data.genreAffinities || {}) },
        interactions: { ...current.interactions, ...(data.interactions || {}) },
        lastUpdated: Math.max(current.lastUpdated, data.lastUpdated || 0)
      };
      saveAffinityProfile(merged);
      return merged;
    }
  } catch (e) {
    console.warn('Could not load smart affinity from Firestore:', e);
  }
  return null;
}

/**
 * Sync user affinity profile to Firestore
 */
export async function syncAffinityToFirestore(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const profile = getStoredAffinityProfile();
    const userRef = doc(db, 'users', userId, 'preferences', 'smartAffinity');
    await setDoc(userRef, {
      topGenres: profile.topGenres,
      totalListenedTracks: profile.totalListenedTracks,
      totalCompletedTracks: profile.totalCompletedTracks,
      totalSkippedTracks: profile.totalSkippedTracks,
      totalListeningTimeSec: profile.totalListeningTimeSec,
      lastUpdated: profile.lastUpdated
    }, { merge: true });
  } catch (e) {
    // Non-blocking sync
  }
}

