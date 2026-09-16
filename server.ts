import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// File Upload & Text Extraction Endpoint
// Client sends raw file bytes as base64 with metadata; server extracts text
app.post('/api/extract-text', async (req, res) => {
  try {
    const { fileName, fileBase64, mimeType } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ success: false, error: 'لم يتم استلام الملف' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';
    let pageCount: number | undefined;

    const ext = (fileName || '').toLowerCase().split('.').pop() || '';

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      pageCount = pdfData.numpages;
    } else if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      extractedText = result.value;
    } else {
      // TXT, MD, or unknown — try reading as text
      extractedText = buffer.toString('utf-8');
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();

    if (!extractedText || extractedText.length < 10) {
      return res.json({
        success: false,
        error: 'لم يتم العثور على نص قابل للقراءة في الملف. تأكد من أن الملف يحتوي على نص قابل للتحديد وليس صوراً ممسوحة ضوئياً.',
      });
    }

    return res.json({
      success: true,
      fileName,
      text: extractedText,
      pageCount,
      charCount: extractedText.length,
    });
  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    return res.status(500).json({
      success: false,
      error: `فشل في قراءة الملف: ${error?.message || 'خطأ غير معروف'}`,
    });
  }
});

// Book Analysis Endpoint — Explain, Summary, or Quiz
app.post('/api/analyze-book', async (req, res) => {
  try {
    const { fileName, fileContent, role, action } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً. تأكد من إعداد مفتاح Gemini API.',
      });
    }

    const isTeacher = role === 'teacher';
    const audience = isTeacher ? 'معلم' : 'طالب';
    const styleGuide = isTeacher
      ? 'استخدم أسلوباً أكاديمياً تربوياً موجهاً للمعلم، مع الإشارة إلى نواتج التعلم ومستويات هرم بلوم حيث مناسب.'
      : 'استخدم أسلوباً مبسطاً شيقاً ومتفاعلاً موجهاً للطالب، مع أمثلة من الحياة اليومية لتقريب المفاهيم.';

    const systemInstruction = `أنت المساعد التعليمي الذكي في منصة "فَهِم" (Fahem).
مهمتك تحليل الكتب والمناهج التعليمية وتقديم محتوى تعليمي عالي الجودة باللغة العربية الفصحى الواضحة.
المستخدم الحالي هو ${audience}. ${styleGuide}

قواعد صارمة:
- اعتمد حصرياً على محتوى الكتاب المرفوع لإنشاء الإجابة. لا تخترع معلومات غير موجودة في النص.
- إن كان النص غير كافٍ للإجابة الشاملة، اذكر ما هو متاح ووضح أن المرفق لا يحتوي على تفاصيل إضافية.
- استخدم تنسيق Markdown العربي السليم (عناوين، قوائم، خط عريض، اقتباسات).
- لا تُرجع أبداً ردوداً تأكيدية نمطية مثل "تم حفظ طلبك" أو "تم إعداد الاستجابة" أو "تم إنشاء المحتوى بنجاح". أجب مباشرة بالمحتوى التعليمي المفصل.`;

    let prompt = `اسم الملف: ${fileName || 'كتاب تعليمي'}\n\n`;
    prompt += `=== محتوى الكتاب الكامل ===\n`;
    prompt += fileContent ? fileContent.slice(0, 50000) : '(لا يوجد محتوى مرفق)';
    prompt += `\n=== نهاية محتوى الكتاب ===\n\n`;

    if (action === 'quiz') {
      prompt += `المطلوب: توليد اختبار تفاعلي من 5 إلى 10 أسئلة اختيار من متعدد بناءً على محتوى الكتاب أعلاه حصراً.
كل سؤال يجب أن يحتوي على 4 خيارات، ورقم الإجابة الصحيحة (0-3)، وشرح تفصيلي لسبب صحة الإجابة ولماذا الخيارات الأخرى خاطئة.
تنوع مستوى الأسئلة بين الفهم والتطبيق والتحليل.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'questionText', 'options', 'correctAnswerIndex', 'explanation'],
                },
              },
            },
            required: ['title', 'description', 'questions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        type: 'quiz',
        data: parsed,
      });
    } else if (action === 'summary') {
      prompt += `المطلوب: تقديم تلخيص شامل ومفصل لمحتوى الكتاب أعلاه.
نظّم التلخيص في أقسام واضحة تغطي:
1. الفكرة العامة والمحاور الرئيسية للكتاب.
2. أهم المفاهيم والمصطلحات والتعريفات الواردة (مع شرح موجز لكل منها).
3. القواعد والقوانين والعلاقات الأساسية (إن وُجدت).
4. خلاصة استنتاجية تربط بين أجزاء الكتاب.
استخدم التنسيق Markdown العنواني والقوائم النقطية. كن مفصلاً ودقيقاً ولا تختزل بشكل يفقد المعلومة.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction },
      });

      return res.json({
        success: true,
        type: 'summary',
        content: response.text,
      });
    } else {
      // explain (default)
      prompt += `المطلوب: تقديم شرح تفصيلي شامل لمحتوى الكتاب أعلاه.
نظّم الشرح في أقسام منطقية تغطي:
1. تمهيد يشرح أهمية موضوع الكتاب وسياقه العام.
2. شرح كل مفهوم ومصطلح ورد في الكتاب بأسلوب مبسط وواضح، مع أمثلة تطبيقية حيث مناسب.
3. تحليل العلاقات بين المفاهيم وكيفية ارتباطها ببعضها البعض.
4. نصائح تعليمية لاستيعاب المحتوى وتثبيته في الذاكرة.
استخدم التنسيق Markdown العنواني والقوائم والاقتباسات. كن مفصلاً وشاملاً ولا تختزل.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction },
      });

      return res.json({
        success: true,
        type: 'explain',
        content: response.text,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/analyze-book:', error);
    return res.status(500).json({
      success: false,
      error: `حدث خطأ أثناء التحليل: ${error?.message || 'خطأ غير معروف'}`,
    });
  }
});

// Chat Endpoint for Follow-up Inquiries — sends full book content every time
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, bookContext, role } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً.',
      });
    }

    const isTeacher = role === 'teacher';
    const audience = isTeacher ? 'معلم' : 'طالب';
    const styleGuide = isTeacher
      ? 'استخدم أسلوباً أكاديمياً تربوياً موجهاً للمعلم.'
      : 'استخدم أسلوباً مبسطاً شيقاً موجهاً للطالب مع أمثلة من الحياة اليومية.';

    const systemInstruction = `أنت المساعد التعليمي الذكي في منصة "فَهِم" (Fahem).
المستخدم الحالي هو ${audience}. ${styleGuide}

قواعد صارمة:
- اعتمد حصرياً على محتوى الكتاب المرفوع للإجابة على أسئلة المستخدم. لا تخترع معلومات غير موجودة في النص.
- إن كان السؤال خارج نطاق محتوى الكتاب، وضح ذلك بأدب ووجّه المستخدم لطرح أسئلة متعلقة بالكتاب.
- أجب مباشرة وبشكل مفصل وشامل. لا تُرجع ردوداً تأكيدية نمطية مثل "تم حفظ طلبك" أو "تم إعداد الاستجابة".
- استخدم تنسيق Markdown العربي السليم عند الحاجة (عناوين، قوائم، خط عريض، اقتباسات).

=== محتوى الكتاب المرفوع حالياً: "${bookContext?.fileName || 'لا يوجد كتاب مرفوع'}" ===
${bookContext?.fileContent ? bookContext.fileContent.slice(0, 50000) : '(لا يوجد محتوى مرفوع بعد)'}
=== نهاية محتوى الكتاب ===`;

    const chatHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatHistory,
      config: { systemInstruction },
    });

    return res.json({
      success: true,
      reply: response.text,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({
      success: false,
      error: `حدث خطأ أثناء معالجة المحادثة: ${err?.message || 'خطأ غير معروف'}`,
    });
  }
});

// Vite middleware & Static serving
async function setupServer() {
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
    console.log(`Fahem Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
