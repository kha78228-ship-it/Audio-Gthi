import express from 'express';
import path from 'path';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to encode raw PCM 16-bit 24kHz Mono to standard WAV Buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  // file length minus 8 bytes
  buffer.writeUInt32LE(36 + dataSize, 4);
  // RIFF type & format chunk identifier
  buffer.write('WAVEfmt ', 8);
  // format chunk length
  buffer.writeUInt32LE(16, 16);
  // sample format (1 = PCM)
  buffer.writeUInt16LE(1, 20);
  // channel count
  buffer.writeUInt16LE(numChannels, 22);
  // sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // byte rate
  buffer.writeUInt32LE(byteRate, 28);
  // block align
  buffer.writeUInt16LE(blockAlign, 32);
  // bits per sample
  buffer.writeUInt16LE(bitsPerSample, 34);
  // data chunk identifier
  buffer.write('data', 36);
  // data chunk length
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Shared Gemini client
  let geminiClient: GoogleGenAI | null = null;
  function getGemini(): GoogleGenAI {
    if (!geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      }
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return geminiClient;
  }

  // Health API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Haevy Audio API' });
  });

  // Text-To-Speech API endpoint
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text, voiceName = 'Kore', stylePrompt = '' } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'Nội dung văn bản (text) không được để trống' });
        return;
      }

      const ai = getGemini();
      const validVoice = ['Kore', 'Fenrir', 'Puck', 'Zephyr', 'Charon'].includes(voiceName) 
        ? voiceName 
        : 'Kore';

      // Enhance text with emotion/style prompt if provided
      const promptContent = stylePrompt 
        ? `Tone and style instruction: ${stylePrompt}\nText to speak:\n${text.trim()}`
        : text.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: promptContent }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: validVoice },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart?.data) {
        res.status(502).json({ error: 'Không nhận được dữ liệu âm thanh từ Gemini TTS' });
        return;
      }

      const rawPcm = Buffer.from(audioPart.data, 'base64');
      const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
      const wavBase64 = wavBuffer.toString('base64');
      const durationEstimate = Math.max(1, Math.round(rawPcm.length / (24000 * 2)));

      res.json({
        success: true,
        audioBase64: wavBase64,
        mimeType: 'audio/wav',
        durationSec: durationEstimate,
        voiceUsed: validVoice,
      });
    } catch (err: any) {
      console.error('TTS generation error:', err);
      res.status(500).json({ 
        error: err.message || 'Lỗi xử lý chuyển văn bản thành giọng nói',
        fallbackNeeded: true
      });
    }
  });

  // Script & Story Generator API endpoint
  app.post('/api/gemini/generate-script', async (req, res) => {
    try {
      const { topic, genre = 'Sách Nói & Radio', durationType = 'medium' } = req.body;

      if (!topic || typeof topic !== 'string') {
        res.status(400).json({ error: 'Vui lòng nhập chủ đề hoặc ý tưởng' });
        return;
      }

      const ai = getGemini();
      const lengthHint = durationType === 'short' 
        ? 'khoảng 80-120 từ (1 phút đọc)' 
        : durationType === 'long' 
        ? 'khoảng 350-450 từ (3-4 phút đọc)' 
        : 'khoảng 200-250 từ (2 phút đọc)';

      const prompt = `Bạn là một biên kịch và chuyên gia sáng tạo âm thanh cho nền tảng Haevy Audio.
Hãy viết một kịch bản đọc âm thanh hấp dẫn, giàu cảm xúc và nhịp điệu tự nhiên bằng tiếng Việt theo yêu cầu sau:
- Thể loại: ${genre}
- Chủ đề/Ý tưởng: ${topic}
- Độ dài mục tiêu: ${lengthHint}
- Phong cách: Diễn cảm, cuốn hút, câu từ trau chuốt, phù hợp để chuyển thành giọng đọc audio (Text-to-Speech).

Hãy trả về phản hồi theo định dạng văn bản thuần túy (không kèm tiêu đề rườm rà hay ký tự Markdown phức tạp), gồm:
Dòng 1: [Tiêu Đề Tác Phẩm]: Tên bài hát/câu chuyện/podcast ngắn gọn, hấp dẫn
Các dòng tiếp theo: Nội dung kịch bản văn bản để đọc.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      const fullText = response.text || '';
      let title = 'Tác phẩm Audio Mới';
      let script = fullText;

      const titleMatch = fullText.match(/^\[?Tiêu Đề[^:\]]*[:\]]\s*(.+)$/im);
      if (titleMatch) {
        title = titleMatch[1].trim();
        script = fullText.replace(/^\[?Tiêu Đề[^:\]]*[:\]].+$/im, '').trim();
      }

      res.json({
        success: true,
        title,
        script,
      });
    } catch (err: any) {
      console.error('Script generation error:', err);
      res.status(500).json({ error: err.message || 'Lỗi sáng tác kịch bản' });
    }
  });

  // Vite middleware in development or Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Haevy Audio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
