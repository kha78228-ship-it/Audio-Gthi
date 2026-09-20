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

export const GOOGLE_DOCS_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

export interface GoogleDocExportResult {
  id: string;
  name: string;
  webViewLink: string;
  editUrl: string;
  createdTime?: string;
  authorEmail?: string;
}

export interface GoogleDocExportOptions {
  title: string;
  contentMarkdown: string;
  category?: string;
  categoryLabel?: string;
  tags?: string[];
  summary?: string;
  sourceApp?: 'haevy_edu' | 'haevy_spiritual' | 'haevy_ai' | 'haevy_general';
  metadataNotes?: string;
}

// In-memory token cache (strictly adhering to Workspace Integration security rules)
let cachedDocsAccessToken: string | null = null;
let cachedDocsUser: User | null = null;
let isSigningIn = false;

// Configure provider with all requested Google Docs & Drive scopes
const docsProvider = new GoogleAuthProvider();
GOOGLE_DOCS_SCOPES.forEach(scope => docsProvider.addScope(scope));
docsProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sync auth state
onAuthStateChanged(auth, (user) => {
  cachedDocsUser = user;
  if (!user) {
    cachedDocsAccessToken = null;
  }
});

/**
 * Check if the user is connected and token is available
 */
export function isGoogleDocsConnected(): boolean {
  const token = cachedDocsAccessToken || getCachedDriveAccessToken();
  const user = cachedDocsUser || auth.currentUser;
  return Boolean(token && user);
}

/**
 * Get current authenticated user
 */
export function getGoogleDocsUser(): User | null {
  return cachedDocsUser || auth.currentUser;
}

/**
 * Get current in-memory access token
 */
export function getGoogleDocsAccessToken(): string | null {
  return cachedDocsAccessToken || getCachedDriveAccessToken();
}

/**
 * Sign in with Google and acquire access token for Google Docs & Drive
 */
export async function connectGoogleDocs(): Promise<{ user: User; accessToken: string }> {
  if (isSigningIn) {
    throw new Error('Đang trong quá trình kết nối Google...');
  }

  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, docsProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Không nhận được Access Token từ Google. Vui lòng thử lại.');
    }

    cachedDocsAccessToken = credential.accessToken;
    cachedDocsUser = result.user;

    // Cross-sync with drive service
    setCachedDriveAccessToken(credential.accessToken, result.user);

    return { user: result.user, accessToken: cachedDocsAccessToken };
  } catch (err: any) {
    console.error('Google Docs Sign-In Error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Sign out and clear cached token
 */
export async function disconnectGoogleDocs(): Promise<void> {
  try {
    await signOut(auth);
    cachedDocsAccessToken = null;
    cachedDocsUser = null;
    setCachedDriveAccessToken(null, null);
  } catch (err) {
    console.error('Error disconnecting Google Docs:', err);
  }
}

/**
 * Simple markdown-to-HTML converter for clean Google Docs document rendering
 */
function markdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid #f59e0b; padding-left: 10px; color: #475569; margin: 8px 0;">$1</blockquote>')
    // Unordered lists
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
    // Horizontal rule
    .replace(/^(---|\*\*\*|___)$/gim, '<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 16px 0;" />')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px;">$1</pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code style="background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>')
    // Paragraphs
    .replace(/\n\s*\n/gim, '</p><p style="margin: 8px 0; line-height: 1.6;">');

  // Wrap list items
  html = html.replace(/(<li>.*<\/li>)/gis, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>');

  return `<p style="margin: 8px 0; line-height: 1.6;">${html}</p>`;
}

/**
 * Creates a native Google Doc in the user's Google Drive via multipart upload
 * Converted automatically into a rich Google Docs document with headings, tables and styled blocks.
 */
export async function createGoogleDoc(options: GoogleDocExportOptions): Promise<GoogleDocExportResult> {
  const token = getGoogleDocsAccessToken();
  if (!token) {
    throw new Error('Chưa kết nối Google Docs. Vui lòng đăng nhập Google trước.');
  }

  const user = getGoogleDocsUser();
  const title = options.title.trim() || 'Tài liệu Haevy Export';
  const categoryLabel = options.categoryLabel || options.category || 'Tài liệu';
  const formattedDate = new Date().toLocaleString('vi-VN');

  // Theme accent colors based on source
  let themeColor = '#2563eb'; // blue default
  let themeBadge = 'HAEVY ECOSYSTEM DOCUMENT';

  if (options.sourceApp === 'haevy_edu') {
    themeColor = '#d97706'; // amber
    themeBadge = 'HAEVY EDU - STEM RESEARCH & FIRST PRINCIPLES';
  } else if (options.sourceApp === 'haevy_spiritual') {
    themeColor = '#9333ea'; // purple
    themeBadge = 'HAEVY TÂM LINH - BẢN ĐỒ VŨ TRỤ & TRI THỨC HUYỀN HỌC';
  } else if (options.sourceApp === 'haevy_ai') {
    themeColor = '#4f46e5'; // indigo
    themeBadge = 'HAEVY AI - BÁO CÁO PHÂN TÍCH & TRỢ LÝ THÔNG MINH';
  }

  const tagsHtml = options.tags && options.tags.length > 0
    ? `<div style="margin: 10px 0;">
        ${options.tags.map(t => `<span style="display: inline-block; background: #e2e8f0; color: #334155; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 6px; font-weight: 600;">#${t}</span>`).join('')}
       </div>`
    : '';

  const summaryHtml = options.summary
    ? `<div style="background: #f8fafc; border-left: 4px solid ${themeColor}; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
        <div style="font-size: 11px; font-weight: bold; color: ${themeColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Tóm Tắt Cốt Lõi / Bản Chất</div>
        <div style="font-size: 13px; color: #1e293b; line-height: 1.5; font-style: italic;">${options.summary}</div>
       </div>`
    : '';

  const bodyHtml = markdownToHtml(options.contentMarkdown);

  // Full styled HTML template for Google Docs conversion
  const fullHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 24px; max-width: 800px; margin: auto;">
  
  <!-- Header Banner -->
  <div style="border-bottom: 2px solid ${themeColor}; padding-bottom: 12px; margin-bottom: 20px;">
    <div style="font-size: 11px; font-weight: bold; color: ${themeColor}; letter-spacing: 1px; text-transform: uppercase;">
      ${themeBadge}
    </div>
    <h1 style="font-size: 24px; color: #0f172a; margin: 8px 0 6px 0; font-weight: 800; line-height: 1.3;">
      ${title}
    </h1>
    <div style="font-size: 12px; color: #64748b;">
      <span><b>Phân loại:</b> ${categoryLabel}</span> &nbsp;|&nbsp; 
      <span><b>Ngày tạo:</b> ${formattedDate}</span> &nbsp;|&nbsp; 
      <span><b>Tác giả:</b> ${user?.displayName || user?.email || 'Người dùng Haevy'}</span>
    </div>
    ${tagsHtml}
  </div>

  ${summaryHtml}

  <!-- Main Content -->
  <div style="font-size: 14px; line-height: 1.65; color: #1e293b;">
    ${bodyHtml}
  </div>

  <!-- Footer -->
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 36px 0 16px 0;" />
  <div style="font-size: 11px; color: #94a3b8; text-align: center; font-style: italic;">
    Tài liệu này được xuất tự động từ Hệ Sinh Thái Haevy (Haevy Edu &bull; Haevy Tâm Linh &bull; Haevy AI).<br/>
    Bảo lưu bản quyền tri thức theo các nguyên lý gốc rễ (First Principles).
  </div>

</body>
</html>`;

  // Multipart request setup
  const boundary = '-------HaevyDocsBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document',
    description: `Tài liệu xuất từ Haevy: ${title} (${categoryLabel})`,
    properties: {
      source: options.sourceApp || 'haevy',
      category: options.category || 'general'
    }
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    fullHtmlContent +
    closeDelimiter;

  // Call Google Drive API multipart upload to convert HTML into a native Google Doc
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `Lỗi khi tạo Google Doc (${response.status})`;
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const editUrl = `https://docs.google.com/document/d/${result.id}/edit`;

  return {
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink || editUrl,
    editUrl: editUrl,
    createdTime: result.createdTime,
    authorEmail: user?.email || undefined
  };
}

/**
 * Export Haevy Edu Research Notebook (all notes or selected notes) to Google Docs
 */
export async function exportEduNotebookToGoogleDoc({
  notebookTitle,
  notes,
  subjectFilter
}: {
  notebookTitle?: string;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    subject?: string;
    tags?: string[];
    createdAt?: string;
    firstPrincipleEssence?: string;
    labBridge?: any;
  }>;
  subjectFilter?: string;
}): Promise<GoogleDocExportResult> {
  const title = notebookTitle || `Sổ Tay Nghiên Cứu First Principles ${subjectFilter ? `(${subjectFilter})` : ''} - Haevy Edu`;

  let mdContent = `## Tổng Quan Sổ Tay Nghiên Cứu STEM\n\nSổ tay gồm **${notes.length} luận điểm / ghi chép** đã được đúc kết từ quá trình học tập thực hành, bóc tách nguyên lý gốc (First Principles) và kiểm chứng thí nghiệm ảo.\n\n---\n\n`;

  notes.forEach((note, index) => {
    mdContent += `### ${index + 1}. ${note.title}\n\n`;
    mdContent += `**Môn học:** ${note.subject || 'Tổng Hợp STEM'} &nbsp;|&nbsp; **Ngày ghi chép:** ${note.createdAt || 'Gần đây'}\n\n`;

    if (note.firstPrincipleEssence) {
      mdContent += `> **Bản chất nguyên lý gốc (First Principles):**\n> ${note.firstPrincipleEssence}\n\n`;
    }

    if (note.tags && note.tags.length > 0) {
      mdContent += `**Tags:** ${note.tags.map(t => `#${t}`).join(', ')}\n\n`;
    }

    mdContent += `#### Nội Dung Phân Tích Chi Tiết\n\n${note.content}\n\n`;

    if (note.labBridge) {
      mdContent += `*Thí nghiệm ảo kiểm chứng:* **${note.labBridge.experimentName || 'Phòng Lab'}**\n\n`;
    }

    mdContent += `---\n\n`;
  });

  return createGoogleDoc({
    title,
    contentMarkdown: mdContent,
    category: 'haevy_edu_notebook',
    categoryLabel: 'Haevy Edu - Sổ Tay Nghiên Cứu',
    tags: ['HaevyEdu', 'STEM', 'FirstPrinciples', subjectFilter || 'All'],
    summary: `Tổng hợp ${notes.length} ghi chép nghiên cứu First Principles, tập trung vào bản chất logic loại bỏ học vẹt.`,
    sourceApp: 'haevy_edu'
  });
}

/**
 * Export a single Haevy Edu Note to Google Doc
 */
export async function exportSingleEduNoteToGoogleDoc(note: {
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  createdAt?: string;
  firstPrincipleEssence?: string;
  labBridge?: any;
}): Promise<GoogleDocExportResult> {
  let md = `**Lĩnh vực:** ${note.subject || 'STEM'} &nbsp;|&nbsp; **Ngày lập:** ${note.createdAt || new Date().toLocaleDateString('vi-VN')}\n\n`;

  if (note.firstPrincipleEssence) {
    md += `> **Nguyên lý gốc rễ:** ${note.firstPrincipleEssence}\n\n`;
  }

  md += `${note.content}\n\n`;

  if (note.labBridge) {
    md += `\n---\n*Liên kết thí nghiệm ảo:* **${note.labBridge.experimentName}**\n`;
  }

  return createGoogleDoc({
    title: `[Haevy Edu] ${note.title}`,
    contentMarkdown: md,
    category: 'haevy_edu_single_note',
    categoryLabel: `Haevy Edu (${note.subject || 'STEM'})`,
    tags: note.tags || ['HaevyEdu', 'STEM'],
    summary: note.firstPrincipleEssence || `Bóc tách bản chất khoa học: ${note.title}`,
    sourceApp: 'haevy_edu'
  });
}

/**
 * Export Haevy Tâm Linh Reading or Sacred Text to Google Doc
 */
export async function exportSpiritualReadingToGoogleDoc({
  title,
  subtitle,
  category,
  contentMarkdown,
  tags,
  author
}: {
  title: string;
  subtitle?: string;
  category?: string;
  contentMarkdown: string;
  tags?: string[];
  author?: string;
}): Promise<GoogleDocExportResult> {
  const categoryLabelMap: Record<string, string> = {
    tarot: 'Tarot Cổ Điển & Hiện Đại',
    tuvi: 'Lá Số Tử Vi Đẩu Số',
    astrology: 'Chiêm Tinh Học & Bản Đồ Sao',
    numerology: 'Thần Số Học Pythagore',
    divination: 'Kinh Dịch & Gieo Quẻ Vũ Trụ',
    couple: 'Tương Hợp Duyên Khí & Tâm Linh Đôi',
    palmistry: 'Thuật Xem Tướng Tay',
    soundscape: 'Thanh Âm Tần Số Chữa Lành'
  };

  const catLabel = category ? (categoryLabelMap[category] || category) : 'Tri Thức Tâm Linh';

  let md = '';
  if (subtitle) {
    md += `*${subtitle}*\n\n`;
  }
  md += contentMarkdown;

  return createGoogleDoc({
    title: `[Haevy Tâm Linh] ${title}`,
    contentMarkdown: md,
    category: category || 'spiritual',
    categoryLabel: `Haevy Tâm Linh - ${catLabel}`,
    tags: tags || ['HaevyTamLinh', category || 'Spiritual', 'TamLinh'],
    summary: subtitle || `Bản phân tích tri thức tâm linh và định hướng năng lượng: ${title}`,
    sourceApp: 'haevy_spiritual'
  });
}

/**
 * Export Haevy AI Hub Chat Session or AI Analysis to Google Doc
 */
export async function exportAiChatToGoogleDoc({
  sessionTitle,
  messages,
  modelName,
  summary
}: {
  sessionTitle: string;
  messages: Array<{
    id: string;
    text: string;
    isUser?: boolean;
    sender?: string;
    timestamp?: string;
    model?: string;
  }>;
  modelName?: string;
  summary?: string;
}): Promise<GoogleDocExportResult> {
  let md = `## Phiên Đối Thoại Với Haevy AI\n\n`;
  md += `**Mô hình sử dụng:** ${modelName || 'Gemini 3.5 Flash'}\n`;
  md += `**Số lượng lượt trao đổi:** ${messages.length} tin nhắn\n\n---\n\n`;

  messages.forEach((msg, idx) => {
    const isUser = msg.isUser ?? (msg.sender === 'user');
    const speaker = isUser ? '👤 Bạn' : '🤖 Haevy AI Assistant';
    md += `### ${idx + 1}. ${speaker}\n\n`;
    md += `${msg.text}\n\n`;
    md += `---\n\n`;
  });

  return createGoogleDoc({
    title: `[Haevy AI] ${sessionTitle}`,
    contentMarkdown: md,
    category: 'haevy_ai_chat',
    categoryLabel: 'Haevy AI Assistant - Báo Cáo Hội Thoại',
    tags: ['HaevyAI', 'Gemini', 'AiResearch'],
    summary: summary || `Biên bản làm việc và kết quả phân tích cùng Haevy AI (${sessionTitle})`,
    sourceApp: 'haevy_ai'
  });
}

/**
 * Export a single AI response/insight to Google Doc
 */
export async function exportAiResponseToGoogleDoc({
  title,
  prompt,
  responseText,
  modelName
}: {
  title?: string;
  prompt?: string;
  responseText: string;
  modelName?: string;
}): Promise<GoogleDocExportResult> {
  const docTitle = title || 'Báo Cáo Phân Tích Chuyên Sâu - Haevy AI';

  let md = '';
  if (prompt) {
    md += `### Câu Hỏi / Yêu Cầu Đầu Vào\n\n> ${prompt}\n\n---\n\n`;
  }
  md += `### Kết Quả Phân Tích & Giải Pháp Từ Haevy AI\n\n`;
  md += responseText;

  return createGoogleDoc({
    title: `[Haevy AI] ${docTitle}`,
    contentMarkdown: md,
    category: 'haevy_ai_insight',
    categoryLabel: 'Haevy AI - Báo Cáo Phân Tích',
    tags: ['HaevyAI', 'Gemini', 'TriThuc'],
    summary: prompt ? `Phân tích cho câu hỏi: ${prompt.slice(0, 100)}...` : 'Báo cáo giải pháp trí tuệ nhân tạo từ Haevy AI.',
    sourceApp: 'haevy_ai'
  });
}
