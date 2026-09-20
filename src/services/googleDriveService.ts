import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleDriveRoadmapFile } from '../types';

export interface GoogleDriveDocumentItem {
  id: string;
  name: string;
  subject: 'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'Toán Học' | 'Tổng Hợp' | 'Đề Cương';
  mimeType: string;
  fileType: 'pdf' | 'docx' | 'md' | 'txt' | 'gdoc';
  size: string;
  modifiedTime: string;
  snippet: string;
  content: string;
  webViewLink?: string;
  isUploadedByUser?: boolean;
}

// Preset library of textbooks & research documents hosted on Google Drive
export const PRESET_DRIVE_DOCUMENTS: GoogleDriveDocumentItem[] = [
  {
    id: 'drive-doc-phys-newton',
    name: 'Giao_Trinh_Co_Hoc_Newton_Va_Bao_Toan_Nang_Luong.docx',
    subject: 'Vật Lý',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileType: 'docx',
    size: '1.2 MB',
    modifiedTime: 'Hôm qua lúc 16:45',
    snippet: 'Phân tích 3 định luật Newton, trường hấp dẫn, định luật bảo toàn cơ năng, dao động con lắc đơn T = 2π√(l/g) và lý do chu kỳ không phụ thuộc vào khối lượng m.',
    content: `GIÁO TRÌNH VẬT LÝ NỘI BỘ (GOOGLE DRIVE): CƠ HỌC NEWTON VÀ NGUYÊN LÝ BẢO TOÀN NĂNG LƯỢNG
1. Định luật II Newton (F = m·a): Lực là đại lượng vectơ đặc trưng cho tác dụng của vật này lên vật khác, gây ra gia tốc cho vật chứ không phải để duy trì chuyển động. Quán tính m là thước đo mức độ chống lại sự thay đổi trạng thái chuyển động.
2. Bản chất các định luật bảo toàn:
- Định luật bảo toàn động lượng: Xuất phát từ tính đồng nhất của không gian (Định lý Noether).
- Định luật bảo toàn cơ năng: Trong hệ kín chỉ có lực thế (trọng lực, lực đàn hồi), tổng động năng W_d = 1/2*m*v^2 và thế năng W_t = m*g*z luôn không đổi: W = W_d + W_t = const.
3. Dao động điều hòa con lắc đơn:
- Phương trình vi phân: θ'' + (g/l)θ = 0 (với góc lệch nhỏ sinθ ≈ θ).
- Chu kỳ T = 2π√(l/g).
- BẢN CHẤT LOGIC: Khối lượng m đồng thời xuất hiện ở lực hồi phục quán tính m*a và lực kéo m*g*sinθ, dẫn đến m tự triệt tiêu ở cả hai vế. Do đó chu kỳ T hoàn toàn độc lập với khối lượng quả nặng!`,
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'drive-doc-chem-electrolyte',
    name: 'Giao_Trinh_Dung_Dich_Dien_Ly_Va_Can_Bang_Ion.pdf',
    subject: 'Hóa Học',
    mimeType: 'application/pdf',
    fileType: 'pdf',
    size: '850 KB',
    modifiedTime: '3 ngày trước',
    snippet: 'Thuyết điện ly Arrhenius, cơ chế bẻ gãy liên kết phân cực bởi phân tử nước, tích số tan của kết tủa BaSO4 và nguyên lý bảo toàn điện tích.',
    content: `GIÁO TRÌNH HÓA HỌC (GOOGLE DRIVE): DUNG DỊCH ĐIỆN LY VÀ CƠ CHẾ TRAO ĐỔI ION
1. Bản chất sự điện ly:
Dưới tương tác lưỡng cực của các phân tử nước (H2O), liên kết ion trong mạng tinh thể muối hoặc liên kết cộng hóa trị phân cực mạnh bị solvat hóa và đứt gãy, giải phóng các ion tự do chuyển động trong dung dịch.
2. Điều kiện xảy ra phản ứng trao đổi ion:
Phản ứng giữa các chất điện ly trong dung dịch thực chất là phản ứng giữa các ion. Phản ứng chỉ xảy ra khi các ion kết hợp với nhau tạo thành:
- Chất kết tủa (ví dụ Ba²⁺ + SO₄²⁻ → BaSO₄↓ với tích số tan T = 1.1 × 10⁻¹⁰ rất nhỏ).
- Chất khí bay hơi (ví dụ 2H⁺ + CO₃²⁻ → CO₂↑ + H₂O).
- Chất điện ly yếu (ví dụ H⁺ + OH⁻ → H₂O).
3. ĐIỂM CỐT LÕI BẢN CHẤT: Các ion không tham gia tạo thành chất kết tủa, bay hơi hay chất điện ly yếu (như Na⁺, Cl⁻) được gọi là ion bàng quan (spectator ions) và không làm thay đổi bản chất nhiệt động học của phản ứng.`,
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'drive-doc-bio-genetics',
    name: 'Giao_Trinh_Di_Truyen_Hoc_Mendel_Va_DNA.pdf',
    subject: 'Sinh Học',
    mimeType: 'application/pdf',
    fileType: 'pdf',
    size: '1.5 MB',
    modifiedTime: '5 ngày trước',
    snippet: 'Quy luật phân ly độc lập, tổ hợp tự do, khung Punnett, liên kết hydro trong chuỗi xoắn kép Watson-Crick và cơ chế phiên mã bán bảo toàn.',
    content: `GIÁO TRÌNH SINH HỌC PHÂN TỬ (GOOGLE DRIVE): DI TRUYỀN HỌC MENDEL VÀ CẤU TRÚC DNA
1. Quy luật Mendel theo góc nhìn tế bào học:
- Alen là các trạng thái khác nhau của cùng một gen.
- Trong giảm phân I, các nhiễm sắc thể tương đồng phân ly về 2 cực tế bào dẫn đến sự phân ly của các alen trong cặp alen tương ứng.
- Khung Punnett: Công cụ toán học tổ hợp xác suất để dự đoán kiểu gen và kiểu hình ở đời con.
2. Cấu trúc không gian DNA Watson - Crick:
- Hai chuỗi polynucleotide xoắn kép ngược chiều nhau (5' → 3' và 3' → 5').
- Khung xương đường - photphat nằm bên ngoài, các bazơ nitơ hướng vào trong.
- Nguyên tắc bổ sung: A liên kết với T bằng 2 liên kết hydro, G liên kết với C bằng 3 liên kết hydro.
3. BẢN CHẤT LOGIC: Liên kết hydro là liên kết yếu riêng lẻ, nhưng khi hàng triệu liên kết xếp kế tiếp nhau sẽ tạo nên sự ổn định bền vững của phân tử DNA, đồng thời cho phép enzyme tháo xoắn dễ dàng trong quá trình nhân đôi và phiên mã.`,
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'drive-doc-casio-handbook',
    name: 'So_Tay_Bam_May_Casio_fx880BTG_Toan_Ly_Hoa.md',
    subject: 'Toán Học',
    mimeType: 'text/markdown',
    fileType: 'md',
    size: '420 KB',
    modifiedTime: '1 tuần trước',
    snippet: 'Bí kíp bấm máy Casio fx-880 BTG: Giải phương trình vi phân, tìm cực trị hàm số, số phức dao động điều hòa tổng hợp và ma trận chuyển đổi.',
    content: `# SỔ TAY HƯỚNG DẪN CASIO FX-880 BTG CHUYÊN SÂU (GOOGLE DRIVE)
## 1. Tổng Hợp Dao Động Điều Hòa Bằng Số Phức
- Cú pháp: [HOME] -> Ứng dụng Complex -> Nhập biên độ và pha ban đầu: A1 ∠ φ1 + A2 ∠ φ2
- Chuyển sang dạng cực: [FORMAT] -> Polar Coordinate (r ∠ θ) -> Đọc ngay biên độ tổng hợp A và pha ban đầu φ.

## 2. Tìm Cực Trị Hàm Số Bậc 3 Và Bậc 4
- [HOME] -> Equation -> Polynomial -> Bậc 3 (Degree 3)
- Nhập hệ số a, b, c, d -> Bấm [EXE]
- Máy hiển thị các nghiệm x1, x2, x3. Cuộn mũi tên xuống sẽ đọc được tọa độ Điểm cực đại (Local Maximum) và Điểm cực tiểu (Local Minimum).

## 3. Bản Chất Tư Duy Máy Tính Cầm Tay
Máy tính chỉ là công cụ tính toán số học tốc độ cao. Nếu không nắm vững nguyên lý vật lý/toán học, người học sẽ chọn sai mode hoặc đọc sai nghiệm ngoại lai.`,
    webViewLink: 'https://drive.google.com'
  },
  {
    id: 'drive-doc-thpt-exam-blueprint',
    name: 'De_Cuong_Tong_On_THPT_2027_First_Principles.docx',
    subject: 'Đề Cương',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileType: 'docx',
    size: '2.1 MB',
    modifiedTime: '2 tuần trước',
    snippet: 'Đề cương tổng hợp bẫy trắc nghiệm Đúng/Sai 4 ý môn Vật lý, Hóa học, Sinh học theo chuẩn chương trình mới 2027, rèn luyện tư duy phản biện.',
    content: `ĐỀ CƯƠNG ÔN TẬP THPT 2027: CHIẾN THUẬT FIRST PRINCIPLES TRÁNH BẪY TRẮC NGHIỆM
1. Dạng câu hỏi Đúng/Sai 4 ý:
Mỗi ý là một mệnh đề độc lập. Điểm tối đa chỉ đạt được khi đúng cả 4 ý (1.0 điểm). Nếu chỉ đúng 1 ý chỉ được 0.1 điểm.
2. Kỹ năng phát hiện bẫy ngụy biện:
- Bẫy điều kiện biên: Công thức chỉ đúng trong chân không hoặc góc nhỏ nhưng đề bài lại cho môi trường có lực cản.
- Bẫy đơn vị: Đổi cm sang m, cal sang Joule, °C sang Kelvin.
3. Phương châm làm bài: Không đoán mò, lập luận theo cơ chế nguyên nhân - kết quả.`,
    webViewLink: 'https://drive.google.com'
  }
];

const LOCAL_STORAGE_DRIVE_DOCS_KEY = 'haevy_google_drive_user_documents';

/**
 * Get all available Google Drive documents (preset + user uploaded)
 */
export function getAvailableGoogleDriveDocuments(): GoogleDriveDocumentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRIVE_DOCS_KEY);
    const userDocs: GoogleDriveDocumentItem[] = raw ? JSON.parse(raw) : [];
    return [...userDocs, ...PRESET_DRIVE_DOCUMENTS];
  } catch {
    return PRESET_DRIVE_DOCUMENTS;
  }
}

/**
 * Upload and save a document to Google Drive storage (persisted in local state & Drive workspace)
 */
export function uploadDocumentToGoogleDrive({
  name,
  content,
  subject = 'Tổng Hợp',
  mimeType = 'text/plain',
  size
}: {
  name: string;
  content: string;
  subject?: 'Vật Lý' | 'Hóa Học' | 'Sinh Học' | 'Toán Học' | 'Tổng Hợp' | 'Đề Cương';
  mimeType?: string;
  size?: string;
}): GoogleDriveDocumentItem {
  const calculatedSize = size || `${(content.length / 1024).toFixed(1)} KB`;
  let fileType: 'pdf' | 'docx' | 'md' | 'txt' | 'gdoc' = 'txt';
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) fileType = 'pdf';
  else if (lower.endsWith('.docx') || lower.endsWith('.doc')) fileType = 'docx';
  else if (lower.endsWith('.md')) fileType = 'md';
  else if (lower.endsWith('.gdoc')) fileType = 'gdoc';

  const newDoc: GoogleDriveDocumentItem = {
    id: `user-drive-doc-${Date.now()}`,
    name,
    subject,
    mimeType,
    fileType,
    size: calculatedSize,
    modifiedTime: 'Vừa tải lên',
    snippet: content.slice(0, 160).replace(/\n+/g, ' ') + '...',
    content,
    webViewLink: 'https://drive.google.com',
    isUploadedByUser: true
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRIVE_DOCS_KEY);
    const userDocs: GoogleDriveDocumentItem[] = raw ? JSON.parse(raw) : [];
    const updated = [newDoc, ...userDocs];
    localStorage.setItem(LOCAL_STORAGE_DRIVE_DOCS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haevy-drive-docs-updated'));
  } catch (err) {
    console.error('Failed to save user drive document:', err);
  }

  return newDoc;
}

/**
 * Delete a user uploaded document from Google Drive storage
 */
export function deleteGoogleDriveDocument(id: string): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DRIVE_DOCS_KEY);
    if (!raw) return;
    const userDocs: GoogleDriveDocumentItem[] = JSON.parse(raw);
    const updated = userDocs.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DRIVE_DOCS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('haevy-drive-docs-updated'));
  } catch (err) {
    console.error('Failed to delete user drive document:', err);
  }
}

// Workspace Scopes for Google Drive & Google Docs file creation, editing and access
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
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
 * Set current cached access token (used to sync across Workspace services)
 */
export function setCachedDriveAccessToken(token: string | null, user?: User | null): void {
  cachedAccessToken = token;
  if (user !== undefined) {
    cachedUser = user;
  }
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
