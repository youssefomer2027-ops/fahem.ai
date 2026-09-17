import { GoogleGenAI, Type } from '@google/genai';
import type { QuizData } from '../types';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('مفتاح Gemini API غير مهيأ. يرجى التأكد من إعداد VITE_GEMINI_API_KEY في ملف .env');
  }
  if (!client) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }
  return client;
}

const MODEL = 'gemini-2.5-flash';

function buildSystemInstruction(role: 'student' | 'teacher' | undefined): string {
  const isTeacher = role === 'teacher';
  const audience = isTeacher ? 'معلم' : 'طالب';
  const styleGuide = isTeacher
    ? 'استخدم أسلوباً أكاديمياً تربوياً موجهاً للمعلم، مع الإشارة إلى نواتج التعلم ومستويات هرم بلوم حيث مناسب.'
    : 'استخدم أسلوباً مبسطاً شيقاً ومتفاعلاً موجهاً للطالب، مع أمثلة من الحياة اليومية لتقريب المفاهيم.';

  return `أنت المساعد التعليمي الذكي في منصة "فَهِم" (Fahem).
مهمتك تحليل الكتب والمناهج التعليمية وتقديم محتوى تعليمي عالي الجودة باللغة العربية الفصحى الواضحة.
المستخدم الحالي هو ${audience}. ${styleGuide}

قواعد صارمة:
- اعتمد حصرياً على محتوى الكتاب المرفوع لإنشاء الإجابة. لا تخترع معلومات غير موجودة في النص.
- إن كان النص غير كافٍ للإجابة الشاملة، اذكر ما هو متاح ووضح أن المرفق لا يحتوي على تفاصيل إضافية.
- استخدم تنسيق Markdown العربي السليم (عناوين، قوائم، خط عريض، اقتباسات).
- لا تُرجع أبداً ردوداً تأكيدية نمطية مثل "تم حفظ طلبك" أو "تم إعداد الاستجابة" أو "تم إنشاء المحتوى بنجاح". أجب مباشرة بالمحتوى التعليمي المفصل.`;
}

interface BookPayload {
  fileName: string;
  fileContent?: string;
  fileBase64?: string;
  fileMimeType?: string;
}

function buildContentParts(book: BookPayload, taskPrompt: string): any[] {
  const parts: any[] = [];
  let prompt = `اسم الملف: ${book.fileName || 'كتاب تعليمي'}\n\n`;

  if (book.fileBase64 && book.fileMimeType === 'application/pdf') {
    parts.push({
      inlineData: { mimeType: 'application/pdf', data: book.fileBase64 },
    });
    prompt += `=== محتوى الكتاب (مرفق كملف PDF أعلاه) ===\n`;
    if (book.fileContent) {
      prompt += `نص مستخرج مسبقاً (للمساعدة، قد يكون غير مكتمل):\n${book.fileContent.slice(0, 30000)}\n`;
    }
    prompt += `=== نهاية محتوى الكتاب ===\n\n`;
  } else {
    prompt += `=== محتوى الكتاب الكامل ===\n`;
    prompt += book.fileContent ? book.fileContent.slice(0, 50000) : '(لا يوجد محتوى مرفق)';
    prompt += `\n=== نهاية محتوى الكتاب ===\n\n`;
  }

  prompt += taskPrompt;
  parts.push({ text: prompt });
  return parts;
}

export async function analyzeBook(
  book: BookPayload,
  action: 'explain' | 'summary' | 'quiz',
  role?: 'student' | 'teacher',
): Promise<{ type: 'explain' | 'summary'; content: string } | { type: 'quiz'; data: QuizData }> {
  const ai = getClient();
  const systemInstruction = buildSystemInstruction(role);

  if (action === 'quiz') {
    const taskPrompt = `المطلوب: توليد اختبار تفاعلي من 5 إلى 10 أسئلة اختيار من متعدد بناءً على محتوى الكتاب أعلاه حصراً.
كل سؤال يجب أن يحتوي على 4 خيارات، ورقم الإجابة الصحيحة (0-3)، وشرح تفصيلي لسبب صحة الإجابة ولماذا الخيارات الأخرى خاطئة.
تنوع مستوى الأسئلة بين الفهم والتطبيق والتحليل.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: buildContentParts(book, taskPrompt) }],
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
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
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

    const parsed = JSON.parse(response.text || '{}') as QuizData;
    return { type: 'quiz', data: parsed };
  }

  const taskPrompt =
    action === 'summary'
      ? `المطلوب: تقديم تلخيص شامل ومفصل لمحتوى الكتاب أعلاه.
نظّم التلخيص في أقسام واضحة تغطي:
1. الفكرة العامة والمحاور الرئيسية للكتاب.
2. أهم المفاهيم والمصطلحات والتعريفات الواردة (مع شرح موجز لكل منها).
3. القواعد والقوانين والعلاقات الأساسية (إن وُجدت).
4. خلاصة استنتاجية تربط بين أجزاء الكتاب.
استخدم التنسيق Markdown العنواني والقوائم النقطية. كن مفصلاً ودقيقاً ولا تختزل بشكل يفقد المعلومة.`
      : `المطلوب: تقديم شرح تفصيلي شامل لمحتوى الكتاب أعلاه.
نظّم الشرح في أقسام منطقية تغطي:
1. تمهيد يشرح أهمية موضوع الكتاب وسياقه العام.
2. شرح كل مفهوم ومصطلح ورد في الكتاب بأسلوب مبسط وواضح، مع أمثلة تطبيقية حيث مناسب.
3. تحليل العلاقات بين المفاهيم وكيفية ارتباطها ببعضها البعض.
4. نصائح تعليمية لاستيعاب المحتوى وتثبيته في الذاكرة.
استخدم التنسيق Markdown العنواني والقوائم والاقتباسات. كن مفصلاً وشاملاً ولا تختزل.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: buildContentParts(book, taskPrompt) }],
    config: { systemInstruction },
  });

  return { type: action, content: response.text || '' };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithBook(
  messages: ChatTurn[],
  book: BookPayload,
  role?: 'student' | 'teacher',
): Promise<string> {
  const ai = getClient();
  const systemInstruction = buildSystemInstruction(role);

  const chatHistory: any[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  if (book.fileBase64 && book.fileMimeType === 'application/pdf' && chatHistory.length > 0) {
    const firstUserIdx = chatHistory.findIndex((m) => m.role === 'user');
    if (firstUserIdx !== -1) {
      chatHistory[firstUserIdx].parts.unshift({
        inlineData: { mimeType: 'application/pdf', data: book.fileBase64 },
      });
    }
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: chatHistory,
    config: { systemInstruction },
  });

  return response.text || '';
}

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}
