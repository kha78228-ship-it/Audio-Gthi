import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuickNote, QuickNoteTag } from '../types';

const LOCAL_STORAGE_KEY = 'haevy_quick_notes';
const EVENT_NAME = 'haevy_quick_notes_updated';

export const QUICK_NOTE_TAGS: { id: QuickNoteTag; label: string; icon: string; color: string; bg: string; border: string }[] = [
  { id: 'idea', label: 'Ý Tưởng', icon: '💡', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'thought', label: 'Suy Nghĩ', icon: '💭', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'spark', label: 'Tia Sáng', icon: '✨', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'todo', label: 'Cần Làm', icon: '⚡', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'question', label: 'Thắc Mắc', icon: '❓', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
];

export function getLocalQuickNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalQuickNotes(notes: QuickNote[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: notes }));
    }
  } catch (e) {
    console.warn('[QuickNotes] LocalStorage save warning:', e);
  }
}

/**
 * Saves a new fleeting thought directly to Firestore and local cache
 */
export async function createQuickNote(
  userId: string | undefined,
  params: {
    content: string;
    tag?: QuickNoteTag;
    color?: string;
    isStarred?: boolean;
  }
): Promise<QuickNote> {
  const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();
  const tag = params.tag || 'idea';
  const tagObj = QUICK_NOTE_TAGS.find(t => t.id === tag) || QUICK_NOTE_TAGS[0];

  const newNote: QuickNote = {
    id: noteId,
    userId: userId || 'anonymous',
    content: params.content.trim(),
    tag,
    tagLabel: tagObj.label,
    createdAt: nowIso,
    updatedAt: nowIso,
    isStarred: Boolean(params.isStarred),
    color: params.color || tagObj.color,
    syncedWithAI: true
  };

  // 1. Optimistic Local Save
  const current = getLocalQuickNotes();
  const updated = [newNote, ...current.filter(n => n.id !== noteId)];
  saveLocalQuickNotes(updated);

  // 2. Persistent Firestore Save (if user is authenticated)
  if (userId) {
    try {
      const noteDocRef = doc(db, 'users', userId, 'quickNotes', noteId);
      await setDoc(noteDocRef, newNote);
    } catch (err) {
      console.warn('[QuickNotes] Firestore save warning (retained in offline cache):', err);
    }
  }

  return newNote;
}

/**
 * Fetches all user quick notes from Firestore, falling back to local cache
 */
export async function fetchUserQuickNotes(userId: string | undefined): Promise<QuickNote[]> {
  const localNotes = getLocalQuickNotes();

  if (!userId) {
    return localNotes;
  }

  try {
    const notesCollRef = collection(db, 'users', userId, 'quickNotes');
    const q = query(notesCollRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const remoteNotes: QuickNote[] = [];
      snapshot.forEach(docSnap => {
        remoteNotes.push(docSnap.data() as QuickNote);
      });

      // Merge remote with any unsynced local
      const mergedMap = new Map<string, QuickNote>();
      localNotes.forEach(n => mergedMap.set(n.id, n));
      remoteNotes.forEach(n => mergedMap.set(n.id, n));
      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalQuickNotes(merged);
      return merged;
    }
  } catch (err) {
    console.warn('[QuickNotes] Firestore fetch warning, using local cache:', err);
  }

  return localNotes;
}

/**
 * Deletes a note permanently from Firestore and local cache
 */
export async function deleteQuickNote(userId: string | undefined, noteId: string): Promise<void> {
  const current = getLocalQuickNotes();
  const updated = current.filter(n => n.id !== noteId);
  saveLocalQuickNotes(updated);

  if (userId) {
    try {
      const noteDocRef = doc(db, 'users', userId, 'quickNotes', noteId);
      await deleteDoc(noteDocRef);
    } catch (err) {
      console.warn('[QuickNotes] Firestore delete warning:', err);
    }
  }
}

/**
 * Toggles starred/pinned status of a note
 */
export async function toggleStarQuickNote(
  userId: string | undefined, 
  noteId: string, 
  newStarred: boolean
): Promise<void> {
  const current = getLocalQuickNotes();
  const updated = current.map(n => n.id === noteId ? { ...n, isStarred: newStarred, updatedAt: new Date().toISOString() } : n);
  saveLocalQuickNotes(updated);

  if (userId) {
    try {
      const noteDocRef = doc(db, 'users', userId, 'quickNotes', noteId);
      await updateDoc(noteDocRef, { isStarred: newStarred, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('[QuickNotes] Firestore star update warning:', err);
    }
  }
}

/**
 * Realtime subscription to Quick Notes (Firestore onSnapshot + Local Event fallback)
 */
export function subscribeToQuickNotes(
  userId: string | undefined,
  callback: (notes: QuickNote[]) => void
): () => void {
  // Initial callback from local cache
  callback(getLocalQuickNotes());

  const handleLocalUpdate = (e: any) => {
    callback(e.detail || getLocalQuickNotes());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_NAME, handleLocalUpdate);
  }

  let unsubscribeFirestore: (() => void) | null = null;

  if (userId) {
    try {
      const notesCollRef = collection(db, 'users', userId, 'quickNotes');
      const q = query(notesCollRef, orderBy('createdAt', 'desc'));
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const notes: QuickNote[] = [];
        snapshot.forEach(docSnap => {
          notes.push(docSnap.data() as QuickNote);
        });
        if (notes.length > 0) {
          saveLocalQuickNotes(notes);
          callback(notes);
        }
      }, (err) => {
        console.warn('[QuickNotes] Firestore onSnapshot warning:', err);
      });
    } catch (e) {
      console.warn('[QuickNotes] Subscription setup error:', e);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_NAME, handleLocalUpdate);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

/**
 * Formats a quick note into a high-impact prompt for Haevy AI
 */
export function formatQuickNotePromptForAI(note: QuickNote): string {
  const tagIcon = QUICK_NOTE_TAGS.find(t => t.id === note.tag)?.icon || '💡';
  return `Tôi vừa lưu một ý tưởng/suy nghĩ thoáng qua trên Haevy Portal:\n"${note.content}" (${tagIcon} ${note.tagLabel})\n\nHãy giúp tôi phân tích bản chất logic theo phương pháp First Principles, đánh giá tính khả thi và gợi ý 3 bước triển khai cụ thể trong hệ sinh thái Haevy.`;
}
