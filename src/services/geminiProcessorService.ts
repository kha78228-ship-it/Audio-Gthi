/**
 * GeminiProcessorService
 * Hệ sinh thái Haevy Audio & Edu AI
 * 
 * Mô hình tối ưu: gemini-3.5-flash
 * System Instruction: 'Bạn là trợ lý AI học tập chuyên sâu. Nhiệm vụ của bạn là nhận dữ liệu tài liệu từ thư mục nội bộ, tiến hành phân tích nguyên lý, giải thích bản chất logic và tóm tắt cô đọng, tránh học vẹt.'
 */

export class GeminiProcessorService {
  private model: string = 'gemini-3.5-flash';
  private apiKey: string = '';
  private isInitialized: boolean = false;

  public initializeModel(apiKey?: string): void {
    if (apiKey) {
      this.apiKey = apiKey;
    }
    this.model = 'gemini-3.5-flash';
    this.isInitialized = true;
  }

  /**
   * Hàm xử lý dữ liệu từ file đã trích xuất
   * Gửi tài liệu và yêu cầu xử lý đến API server Haevy Edu
   */
  public async processDocumentData(fileContent: string, userRequest: string): Promise<string | null> {
    try {
      const response = await fetch('/api/edu/process-document-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent,
          userRequest,
          model: this.model,
          apiKey: this.apiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.success && typeof data.response === 'string') {
        return data.response;
      }
      return null;
    } catch (e) {
      console.error('Lỗi xử lý dữ liệu qua API:', e);
      return null;
    }
  }
}

// Singleton export
export const geminiProcessorService = new GeminiProcessorService();
