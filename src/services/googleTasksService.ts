import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  getCachedDriveAccessToken,
  setCachedDriveAccessToken
} from './googleDriveService';

export const GOOGLE_TASKS_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file'
];

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp, e.g. '2026-09-20T00:00:00.000Z'
  completed?: string;
  updated?: string;
  parent?: string;
  position?: string;
  category?: 'study' | 'stem' | 'exam' | 'spiritual' | 'general';
  isLocalOnly?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  due?: string; // date string or RFC3339
  category?: 'study' | 'stem' | 'exam' | 'spiritual' | 'general';
}

// In-memory token cache (strictly adhering to Workspace Integration security rules)
let cachedTasksAccessToken: string | null = null;
let cachedTasksUser: User | null = null;
let isSigningIn = false;

// Configure provider with all requested Google Tasks scopes
const tasksProvider = new GoogleAuthProvider();
GOOGLE_TASKS_SCOPES.forEach(scope => tasksProvider.addScope(scope));
tasksProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sync auth state
onAuthStateChanged(auth, (user) => {
  cachedTasksUser = user;
  if (!user) {
    cachedTasksAccessToken = null;
  }
});

/**
 * Check if user is authenticated with Google Tasks
 */
export function isGoogleTasksConnected(): boolean {
  return !!(cachedTasksAccessToken || getCachedDriveAccessToken() || cachedTasksUser);
}

export function getGoogleTasksUser(): User | null {
  return cachedTasksUser || auth.currentUser;
}

export function getCachedTasksAccessToken(): string | null {
  return cachedTasksAccessToken || getCachedDriveAccessToken();
}

export function setCachedTasksAccessToken(token: string | null) {
  cachedTasksAccessToken = token;
  if (token) {
    setCachedDriveAccessToken(token);
  }
}

/**
 * Connect to Google Tasks via Firebase Auth Popup
 */
export async function connectGoogleTasks(): Promise<{ user: User; accessToken: string }> {
  if (isSigningIn) {
    throw new Error('Đang trong quá trình xác thực với Google. Vui lòng chờ giây lát...');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, tasksProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Không thể nhận access token từ Google Tasks OAuth.');
    }

    const token = credential.accessToken;
    setCachedTasksAccessToken(token);
    cachedTasksUser = result.user;

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('haevy-google-tasks-connected', {
      detail: { user: result.user, email: result.user.email }
    }));

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Tasks connect error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Disconnect Google Tasks
 */
export async function disconnectGoogleTasks(): Promise<void> {
  setCachedTasksAccessToken(null);
  cachedTasksUser = null;
  await signOut(auth).catch(() => {});
  window.dispatchEvent(new CustomEvent('haevy-google-tasks-disconnected'));
}

// ---------------------------------------------------------------------------
// DEFAULT CURATED PRESETS (STUDY, STEM, FIRST PRINCIPLES, MINDFULNESS)
// ---------------------------------------------------------------------------

export const DEFAULT_HAEVY_TASK_PRESETS = [
  {
    taskListTitle: '📚 Haevy - Học Bài Theo Quá Trình (First Principles)',
    tasks: [
      {
        title: 'Hiểu bản chất Toán học: Ý nghĩa hình học của Đạo hàm & Tiếp tuyến',
        notes: 'Học theo phương pháp First Principles: Không chỉ ghi nhớ công thức f\'(x), hãy hiểu nguồn gốc từ tỉ số biến thiên dy/dx khi dx tiến tới 0. Sử dụng Casio fx-880 để vẽ bảng biến thiên kiểm chứng.',
        category: 'study' as const,
        dueDaysOffset: 1
      },
      {
        title: 'STEM Lab: Mô phỏng dao động điều hòa con lắc lò xo và năng lượng',
        notes: 'Truy cập tab Vật Lý trong Haevy STEM Lab. Thay đổi khối lượng m và độ cứng k để quan sát chu kỳ T = 2π√(m/k) và bảo toàn cơ năng E = Wt + Wđ.',
        category: 'stem' as const,
        dueDaysOffset: 2
      },
      {
        title: 'Spaced Repetition: Ôn tập ngắt quãng Flashcards chu kỳ ngày thứ 3',
        notes: 'Mở Haevy Edu Roadmap. Kiểm tra lại 15 flashcards công thức Hóa học hữu cơ (Ancol - Phenol) để kích hoạt trí nhớ dài hạn (Long-term potentiation).',
        category: 'study' as const,
        dueDaysOffset: 3
      },
      {
        title: 'Luyện đề tốc độ THPT 2027: 30 câu nhận biết - thông hiểu (25 phút)',
        notes: 'Thiết lập đồng hồ bấm giờ trong Haevy Edu. Mục tiêu: đạt độ chính xác 100% trong 25 phút đầu, không được chủ quan sai sót câu cơ bản.',
        category: 'exam' as const,
        dueDaysOffset: 5
      },
      {
        title: 'Thành thạo Casio fx-880: Bảng tính Bảng giá trị (Spreadsheet) và Thống kê',
        notes: 'Sử dụng phím QR code của fx-880 để quét đồ thị hàm số lên màn hình điện thoại, kiểm chứng nghiệm của phương trình vi phân.',
        category: 'stem' as const,
        dueDaysOffset: 7
      }
    ]
  },
  {
    taskListTitle: '🧘 Haevy - Tâm Thức & Cân Bằng Năng Lượng',
    tasks: [
      {
        title: '15 phút thiền định Soundscape sóng não Alpha sáng sớm',
        notes: 'Bật âm thanh chuông xoay Tây Tạng hoặc tiếng mưa rừng tại Haevy Soundscapes để thả lỏng hệ thần kinh trước giờ học.',
        category: 'spiritual' as const,
        dueDaysOffset: 1
      },
      {
        title: 'Rút 1 lá bài Tarot & Chiêm nghiệm thông điệp ngày mới',
        notes: 'Mở Haevy Tarot, tập trung đặt câu hỏi về hướng đi giải quyết vấn đề học tập/công việc trong ngày.',
        category: 'spiritual' as const,
        dueDaysOffset: 2
      }
    ]
  }
];

// Local backup storage keys
const LOCAL_TASKS_KEY = 'haevy_google_tasks_cache_v1';
const LOCAL_TASK_LISTS_KEY = 'haevy_google_task_lists_cache_v1';

export function getLocalStoredTaskLists(): GoogleTaskList[] {
  try {
    const raw = localStorage.getItem(LOCAL_TASK_LISTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading task lists cache:', e);
  }
  return [
    { id: '@default', title: 'Nhiệm vụ của tôi' },
    { id: 'haevy_study_list', title: '📚 Haevy - Học Bài Theo Quá Trình' },
    { id: 'haevy_mind_list', title: '🧘 Haevy - Tâm Thức & Năng Lượng' }
  ];
}

export function saveLocalStoredTaskLists(lists: GoogleTaskList[]) {
  try {
    localStorage.setItem(LOCAL_TASK_LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Error saving task lists cache:', e);
  }
}

export function getLocalStoredTasks(listId: string): GoogleTaskItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_TASKS_KEY}_${listId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading tasks cache:', e);
  }

  // Generate initial demo tasks if empty
  if (listId === 'haevy_study_list' || listId === '@default') {
    const now = new Date();
    return [
      {
        id: 'task_demo_1',
        title: 'Hiểu bản chất Đạo hàm & Khảo sát hàm số (First Principles)',
        notes: 'Không học vẹt công thức. Nắm vững tỉ số vi phân dy/dx khi dx -> 0 và ứng dụng thực tiễn trong đo vận tốc tức thời.',
        status: 'needsAction',
        due: new Date(now.getTime() + 86400000).toISOString(),
        category: 'study',
        isLocalOnly: true
      },
      {
        id: 'task_demo_2',
        title: 'Thực hành thí nghiệm con lắc lò xo trong Haevy STEM Lab',
        notes: 'Kiểm chứng định luật bảo toàn cơ năng E = Wt + Wđ và vẽ đồ thị dao động điều hòa.',
        status: 'needsAction',
        due: new Date(now.getTime() + 2 * 86400000).toISOString(),
        category: 'stem',
        isLocalOnly: true
      },
      {
        id: 'task_demo_3',
        title: 'Luyện 30 câu trắc nghiệm tốc độ nhận biết - thông hiểu',
        notes: 'Bấm giờ trong Haevy Edu: Tối đa 25 phút. Mục tiêu không sai sót câu cơ bản.',
        status: 'completed',
        completed: new Date().toISOString(),
        due: new Date().toISOString(),
        category: 'exam',
        isLocalOnly: true
      },
      {
        id: 'task_demo_4',
        title: 'Ôn tập ngắt quãng Spaced Repetition chu kỳ 3 ngày',
        notes: 'Ôn tập 20 Flashcards kiến thức trọng tâm đã lưu trong Haevy Roadmap.',
        status: 'needsAction',
        due: new Date(now.getTime() + 3 * 86400000).toISOString(),
        category: 'study',
        isLocalOnly: true
      }
    ];
  }

  return [];
}

export function saveLocalStoredTasks(listId: string, tasks: GoogleTaskItem[]) {
  try {
    localStorage.setItem(`${LOCAL_TASKS_KEY}_${listId}`, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks cache:', e);
  }
}

// ---------------------------------------------------------------------------
// GOOGLE TASKS API CALLS (WITH AUTH TOKEN AND LOCAL CACHE FALLBACK)
// ---------------------------------------------------------------------------

/**
 * Fetch all task lists from Google Tasks API
 */
export async function fetchGoogleTaskLists(): Promise<GoogleTaskList[]> {
  const token = getCachedTasksAccessToken();

  if (!token) {
    return getLocalStoredTaskLists();
  }

  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      setCachedTasksAccessToken(null);
      return getLocalStoredTaskLists();
    }

    if (!res.ok) {
      throw new Error(`Google Tasks API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const lists: GoogleTaskList[] = data.items || [];
    saveLocalStoredTaskLists(lists);
    return lists;
  } catch (error) {
    console.warn('Fallback to local task lists due to API error:', error);
    return getLocalStoredTaskLists();
  }
}

/**
 * Create a new task list
 */
export async function createGoogleTaskList(title: string): Promise<GoogleTaskList> {
  const token = getCachedTasksAccessToken();

  if (!token) {
    const localLists = getLocalStoredTaskLists();
    const newList: GoogleTaskList = {
      id: `local_list_${Date.now()}`,
      title,
      updated: new Date().toISOString()
    };
    const updated = [newList, ...localLists];
    saveLocalStoredTaskLists(updated);
    return newList;
  }

  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (!res.ok) {
      throw new Error(`Không thể tạo danh sách: ${res.status}`);
    }

    const created: GoogleTaskList = await res.json();
    const localLists = getLocalStoredTaskLists();
    saveLocalStoredTaskLists([created, ...localLists.filter(l => l.id !== created.id)]);
    return created;
  } catch (error) {
    console.warn('API error creating task list, saving locally:', error);
    const localLists = getLocalStoredTaskLists();
    const newList: GoogleTaskList = {
      id: `local_list_${Date.now()}`,
      title,
      updated: new Date().toISOString()
    };
    saveLocalStoredTaskLists([newList, ...localLists]);
    return newList;
  }
}

/**
 * Fetch tasks for a given task list
 */
export async function fetchGoogleTasks(taskListId: string): Promise<GoogleTaskItem[]> {
  const token = getCachedTasksAccessToken();

  if (!token || taskListId.startsWith('local_') || taskListId === 'haevy_study_list' || taskListId === 'haevy_mind_list') {
    return getLocalStoredTasks(taskListId);
  }

  try {
    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.status === 401) {
      setCachedTasksAccessToken(null);
      return getLocalStoredTasks(taskListId);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.status}`);
    }

    const data = await res.json();
    const items: GoogleTaskItem[] = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      status: item.status,
      due: item.due,
      completed: item.completed,
      updated: item.updated,
      parent: item.parent,
      position: item.position
    }));

    saveLocalStoredTasks(taskListId, items);
    return items;
  } catch (error) {
    console.warn('Fallback to local tasks due to API error:', error);
    return getLocalStoredTasks(taskListId);
  }
}

/**
 * Add a new task to Google Tasks
 */
export async function addGoogleTask(
  taskListId: string,
  payload: CreateTaskPayload
): Promise<GoogleTaskItem> {
  const token = getCachedTasksAccessToken();

  // Format due date to RFC3339 if provided
  let dueRfc3339: string | undefined = undefined;
  if (payload.due) {
    try {
      const dateObj = new Date(payload.due);
      if (!isNaN(dateObj.getTime())) {
        dueRfc3339 = dateObj.toISOString();
      }
    } catch {
      dueRfc3339 = undefined;
    }
  }

  const localNewItem: GoogleTaskItem = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: payload.title,
    notes: payload.notes,
    status: 'needsAction',
    due: dueRfc3339,
    updated: new Date().toISOString(),
    category: payload.category || 'study'
  };

  if (!token || taskListId.startsWith('local_') || taskListId === 'haevy_study_list' || taskListId === 'haevy_mind_list') {
    const current = getLocalStoredTasks(taskListId);
    const updated = [localNewItem, ...current];
    saveLocalStoredTasks(taskListId, updated);
    return localNewItem;
  }

  try {
    const bodyPayload: any = {
      title: payload.title,
      notes: payload.notes
    };
    if (dueRfc3339) {
      bodyPayload.due = dueRfc3339;
    }

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      }
    );

    if (!res.ok) {
      throw new Error(`Không thể tạo nhiệm vụ: ${res.status}`);
    }

    const created: GoogleTaskItem = await res.json();
    const current = getLocalStoredTasks(taskListId);
    saveLocalStoredTasks(taskListId, [created, ...current.filter(t => t.id !== created.id)]);
    return created;
  } catch (error) {
    console.warn('API error creating task, saved to local cache:', error);
    const current = getLocalStoredTasks(taskListId);
    saveLocalStoredTasks(taskListId, [localNewItem, ...current]);
    return localNewItem;
  }
}

/**
 * Toggle task completion status
 */
export async function toggleGoogleTaskStatus(
  taskListId: string,
  taskId: string,
  isCompleted: boolean
): Promise<GoogleTaskItem> {
  const token = getCachedTasksAccessToken();
  const nextStatus: 'completed' | 'needsAction' = isCompleted ? 'completed' : 'needsAction';
  const completedTimestamp = isCompleted ? new Date().toISOString() : undefined;

  // Update local cache first
  const current = getLocalStoredTasks(taskListId);
  const updatedList = current.map(t => {
    if (t.id === taskId) {
      return {
        ...t,
        status: nextStatus,
        completed: completedTimestamp
      };
    }
    return t;
  });
  saveLocalStoredTasks(taskListId, updatedList);

  const matched = updatedList.find(t => t.id === taskId);

  if (!token || taskId.startsWith('task_') || taskListId.startsWith('local_')) {
    return matched || {
      id: taskId,
      title: '',
      status: nextStatus
    };
  }

  try {
    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: nextStatus,
          completed: completedTimestamp || null
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Cập nhật trạng thái thất bại: ${res.status}`);
    }

    const updatedItem: GoogleTaskItem = await res.json();
    return updatedItem;
  } catch (err) {
    console.warn('API update failed, local status kept:', err);
    return matched || { id: taskId, title: '', status: nextStatus };
  }
}

/**
 * Delete a task
 * MANDATORY: Workspace Integration requires user confirmation before calling this!
 */
export async function deleteGoogleTask(
  taskListId: string,
  taskId: string
): Promise<boolean> {
  const token = getCachedTasksAccessToken();

  // Delete from local cache
  const current = getLocalStoredTasks(taskListId);
  const updatedList = current.filter(t => t.id !== taskId);
  saveLocalStoredTasks(taskListId, updatedList);

  if (!token || taskId.startsWith('task_') || taskListId.startsWith('local_')) {
    return true;
  }

  try {
    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.ok || res.status === 204;
  } catch (error) {
    console.warn('API delete failed:', error);
    return true;
  }
}

/**
 * Batch import Study/Process Roadmap into Google Tasks
 */
export async function importStudyRoadmapToGoogleTasks(
  taskListId: string,
  items: Array<{ title: string; notes?: string; dueDaysOffset?: number; category?: any }>
): Promise<number> {
  let count = 0;
  for (const item of items) {
    const dueDate = item.dueDaysOffset 
      ? new Date(Date.now() + item.dueDaysOffset * 86400000).toISOString()
      : undefined;

    await addGoogleTask(taskListId, {
      title: item.title,
      notes: item.notes,
      due: dueDate,
      category: item.category || 'study'
    });
    count++;
  }
  return count;
}
