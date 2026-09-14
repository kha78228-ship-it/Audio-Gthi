import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleDriveRoadmapFile } from '../types';

// Workspace Scope for Google Drive file creation & access
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

// Memory-only cache for OAuth access token (as strictly instructed by Workspace Integration skill)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let isSigningIn = false;

// Initialize Google Auth Provider with Drive Scope
const driveProvider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach(scope => driveProvider.addScope(scope));
driveProvider.setCustomParameters({
  prompt: 'select_account'
});

// Listener for auth state changes
onAuthStateChanged(auth, (user) => {
  cachedUser = user;
  if (!user) {
    cachedAccessToken = null;
  }
});

/**
 * Get current cached access token or return null
 */
export function getCachedDriveAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Get current authenticated user
 */
export function getDriveUser(): User | null {
  return cachedUser || auth.currentUser;
}

/**
 * Check if Google Drive is currently authorized and ready
 */
export function isDriveConnected(): boolean {
  return Boolean(cachedAccessToken && (cachedUser || auth.currentUser));
}

/**
 * Sign in to Google and authorize Google Drive scope
 */
export async function connectGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  if (isSigningIn) {
    throw new Error('Đang thực hiện đăng nhập...');
  }

  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Không nhận được Access Token từ Google OAuth. Vui lòng thử lại.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('Google Drive sign in error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Disconnect Google Drive and sign out
 */
export async function disconnectGoogleDrive(): Promise<void> {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    cachedUser = null;
  } catch (err) {
    console.error('Error disconnecting Google Drive:', err);
  }
}

/**
 * Save / Export a concise First Principles STEM Roadmap to Google Drive
 * Uses Google Drive REST API multipart upload
 */
export async function exportRoadmapToGoogleDrive({
  fileName,
  title,
  subject,
  markdownContent,
  summary
}: {
  fileName: string;
  title: string;
  subject: string;
  markdownContent: string;
  summary: string;
}): Promise<GoogleDriveRoadmapFile> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Chưa kết nối Google Drive. Vui lòng nhấn "Kết nối Google Drive" trước.');
  }

  // Sanitize filename
  const safeName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

  // Prepare full document content with rich First Principles layout
  const fullDocument = `# 🎓 HAEVY EDU - LỘ TRÌNH HỌC TẬP FIRST PRINCIPLES (TINH GỌN)
**Chủ đề:** ${title}  
**Lĩnh vực:** ${subject}  
**Thời gian xuất:** ${new Date().toLocaleString('vi-VN')}  
**Hệ sinh thái:** Haevy Audio & Haevy Edu STEM Platform  

---

## 📌 Tóm Tắt Nguyên Lý Gốc Rễ (Core First Principles)
${summary || 'Lộ trình được cấu trúc để hiểu rõ bản chất "Tại sao" và "Như thế nào", loại bỏ tư duy học vẹt công thức.'}

---

## 🗺️ Nội Dung Lộ Trình Chi Tiết
${markdownContent}

---
*Tài liệu được tạo tự động bởi Haevy Edu AI Study Assistant & Virtual Labs.*
`;

  // Multipart body format for Google Drive API
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: safeName,
    mimeType: 'text/markdown',
    description: `Lộ trình học tập tinh gọn First Principles - Haevy Edu: ${title}`,
    properties: {
      source: 'haevy_edu',
      subject: subject
    }
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    fullDocument +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,modifiedTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Lỗi Google Drive API (${response.status})`;
    throw new Error(message);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    mimeType: result.mimeType,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    createdTime: result.createdTime,
    modifiedTime: result.modifiedTime,
    size: result.size
  };
}

/**
 * List files saved by Haevy Edu in user's Google Drive
 */
export async function listGoogleDriveRoadmapFiles(): Promise<GoogleDriveRoadmapFile[]> {
  const token = cachedAccessToken;
  if (!token) {
    return [];
  }

  try {
    const q = encodeURIComponent("trashed = false and mimeType = 'text/markdown'");
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,mimeType,webViewLink,createdTime,modifiedTime,size)`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      console.warn('Failed to list files from Google Drive:', res.status);
      return [];
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      size: f.size
    }));
  } catch (err) {
    console.error('Error listing Google Drive files:', err);
    return [];
  }
}

/**
 * Read the content of a text/markdown file from Google Drive
 */
export async function fetchGoogleDriveFileContent(fileId: string): Promise<string> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Chưa kết nối Google Drive');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Không thể tải nội dung file (${res.status})`);
  }

  return await res.text();
}
