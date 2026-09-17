import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, BookOpen, Sparkles, FileText, GraduationCap, BookOpenCheck, LogOut, ChevronRight, ListChecks, Compass, CircleAlert as AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FahemLogo } from './FahemLogo';
import { ExamViewer } from './ExamViewer';
import { FaqSection } from './FaqSection';
import { FeedbackSection } from './FeedbackSection';
import { SAMPLE_BOOKS, SampleBook } from '../data/sampleBooks';
import { UserProfile, BookContext, ChatMessage, QuizData } from '../types';
import { analyzeBook, chatWithBook, isGeminiConfigured } from '../services/gemini';

interface ChatInterfaceProps {
  user: UserProfile;
  onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [currentBook, setCurrentBook] = useState<BookContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [geminiReady] = useState<boolean>(isGeminiConfigured());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'assistant',
      content: `أهلاً بك يا ${user.role === 'teacher' ? 'أستاذنا الفاضل' : 'بطل العلم'} في منصة **"فَهِم"**! 🎓

أنا مساعدك التعليمي الذكي لفهم وتلخيص الكتب والمناهج الدراسية واختبار استيعابك.

**لبدء الاستخدام:**
1. اضغط على زر **إرفاق ملف (📎)** أسفل الشاشة لرفع كتاب بصيغة **PDF** أو مستند نصي.
2. أو اختر أحد المناهج التجريبية الجاهزة أدناه للتجربة الفورية.

بمجرد رفع الكتاب، سأقوم بتحليله بالكامل وسؤالك عما إذا كنت تفضل: **شرح المحتوى**، أو **تلخيصه**، أو **خوض امتحان تدريبي تفاعلي**!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isUploading]);

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const fileName = file.name;
    const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`;
    const isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

    const userUploadMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: `📎 قمت برفع الكتاب: **${fileName}** (${fileSizeFormatted})`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userUploadMsg]);

    setIsUploading(true);

    try {
      let fileContent = '';
      let fileBase64: string | undefined;
      let fileMimeType: string | undefined;

      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        fileBase64 = btoa(
          new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
        );
        fileMimeType = 'application/pdf';
      } else {
        fileContent = await file.text();
        fileContent = fileContent.replace(/\r\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
        if (!fileContent || fileContent.length < 10) {
          throw new Error('لم يتم العثور على نص قابل للقراءة في الملف. تأكد من أن الملف يحتوي على نص قابل للتحديد وليس صوراً ممسوحة ضوئياً.');
        }
      }

      const newBookContext: BookContext = {
        fileName,
        fileSize: fileSizeFormatted,
        fileContent,
        fileBase64,
        fileMimeType,
        uploadedAt: new Date().toISOString(),
      };

      setCurrentBook(newBookContext);
      setIsUploading(false);

      const readyMsg: ChatMessage = {
        id: `msg-${Date.now()}-ready`,
        sender: 'assistant',
        content: isPdf
          ? `### 📚 تم استلام ملف PDF بنجاح: **"${fileName}"**\n\nتم تجهيز الملف للتحليل. سيقوم المساعد الذكي بقراءة محتوى الكتاب بصرياً عند اختيار أي من العمليات التالية:\n\n1. 💡 **شرح محتوى الكتاب**: تفكيك المفاهيم الصعبة وضرب أمثلة شارحة.\n2. 📑 **تلخيص المحتوى**: أبرز القواعد والتعريفات والأفكار المحورية.\n3. 📝 **امتحان وأسئلة تدريبية**: بنك أسئلة لقياس مستوى الفهم وتصحيح الإجابات مع الشرح.`
          : `### 📚 تم تحليل محتوى الكتاب بنجاح: **"${fileName}"**\n\nتم استخراج ${fileContent.length.toLocaleString('ar-EG')} حرف من النص الكامل وجاهز للتحليل.\n\nما هو احتياجك التعليمي لهذا المنهج الآن؟\n\n1. 💡 **شرح محتوى الكتاب**: تفكيك المفاهيم الصعبة وضرب أمثلة شارحة.\n2. 📑 **تلخيص المحتوى**: أبرز القواعد والتعريفات والأفكار المحورية.\n3. 📝 **امتحان وأسئلة تدريبية**: بنك أسئلة لقياس مستوى الفهم وتصحيح الإجابات مع الشرح.`,
        actionType: 'general',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        bookContext: newBookContext,
      };
      setMessages((prev) => [...prev, readyMsg]);
    } catch (err: any) {
      setIsUploading(false);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'assistant',
        content: `### ⚠️ تعذر قراءة الملف\n\n${err?.message || 'حدث خطأ غير معروف أثناء قراءة الملف.'}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleSelectSampleBook = (sample: SampleBook) => {
    const newBookContext: BookContext = {
      fileName: sample.title,
      fileSize: 'نسخة منهج رقمي',
      fileContent: sample.content,
      uploadedAt: new Date().toISOString(),
    };
    setCurrentBook(newBookContext);

    const userUploadMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: `📎 قمت برفع الكتاب: **${sample.title}** (${newBookContext.fileSize})`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const readyMsg: ChatMessage = {
      id: `msg-${Date.now()}-ready`,
      sender: 'assistant',
      content: `### 📚 تم تحليل محتوى الكتاب بنجاح: **"${sample.title}"**

تم استخراج النصوص وفهرسة الفصول والمصطلحات الأساسية بدقة. 
ما هو احتياجك التعليمي لهذا المنهج الآن؟

1. 💡 **شرح محتوى الكتاب**: تفكيك المفاهيم الصعبة وضرب أمثلة شارحة.
2. 📑 **تلخيص المحتوى**: أبرز القواعد والتعريفات والأفكار المحورية.
3. 📝 **امتحان وأسئلة تدريبية**: بنك أسئلة لقياس مستوى الفهم وتصحيح الإجابات مع الشرح.`,
      actionType: 'general',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      bookContext: newBookContext,
    };

    setMessages((prev) => [...prev, userUploadMsg, readyMsg]);
  };

  const handleExecuteAction = async (action: 'explain' | 'summary' | 'quiz') => {
    if (!currentBook) return;
    setIsProcessing(true);

    const actionLabel =
      action === 'explain'
        ? 'شرح محتوى الكتاب'
        : action === 'summary'
        ? 'تلخيص المحتوى'
        : 'امتحان وأسئلة تدريبية على المنهج';

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user-action`,
      sender: 'user',
      content: `أرغب في: **${actionLabel}**`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await analyzeBook(
        {
          fileName: currentBook.fileName,
          fileContent: currentBook.fileContent,
          fileBase64: currentBook.fileBase64,
          fileMimeType: currentBook.fileMimeType,
        },
        action,
        user.role,
      );

      if (result.type === 'quiz') {
        const quizData: QuizData = result.data;
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-quiz`,
          sender: 'assistant',
          content: `أهلاً بك! إليك الاختبار التفاعلي بناءً على محتوى **${currentBook.fileName}**. أجب عن الأسئلة ثم اضغط على **تسليم الامتحان** لعرض درجتك وتصحيح كل إجابة مع الشرح:`,
          actionType: 'quiz',
          quizData,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-${action}`,
          sender: 'assistant',
          content: result.content,
          actionType: action,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'assistant',
        content: `### ⚠️ تعذر إكمال العملية\n\n${err?.message || 'حدث خطأ غير معروف.'}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isProcessing) return;

    setInputQuery('');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsProcessing(true);

    try {
      const reply = await chatWithBook(
        updatedMessages.map((m) => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        })),
        currentBook
          ? {
              fileName: currentBook.fileName,
              fileContent: currentBook.fileContent,
              fileBase64: currentBook.fileBase64,
              fileMimeType: currentBook.fileMimeType,
            }
          : { fileName: '' },
        user.role,
      );

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        content: reply || '',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'assistant',
        content: `### ⚠️ تعذر إكمال المحادثة\n\n${err?.message || 'حدث خطأ غير معروف.'}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col text-neutral-900" id="fahem-chat-app">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,.md,.doc,.docx"
        className="hidden"
        id="book-file-picker"
      />

      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FahemLogo size="sm" />
        </div>

        <div className="flex items-center gap-2.5">
          {currentBook && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800">
              <BookOpen className="w-3.5 h-3.5 text-black" />
              <span className="truncate max-w-[140px] md:max-w-[200px]">{currentBook.fileName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-xl border border-neutral-200">
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                user.role === 'teacher' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {user.role === 'teacher' ? (
                <BookOpenCheck className="w-3.5 h-3.5" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
            </span>
            <div className="text-right flex flex-col">
              <span className="text-xs font-black text-black">
                {user.role === 'teacher' ? 'حساب معلم' : 'حساب طالب'}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium truncate max-w-[90px]">
                {user.identifier}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            id="logout-btn"
            title="تسجيل الخروج"
            className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {!geminiReady && (
        <div className="mx-4 mt-4 max-w-4xl w-full self-center bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">مفتاح Gemini API غير مهيأ</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              لكي يعمل التحليل والمحادثة، يجب إضافة مفتاح Gemini API في ملف .env باسم <code className="bg-amber-100 px-1 rounded">VITE_GEMINI_API_KEY</code>. أعد تشغيل الخادم بعد إضافته.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {!currentBook && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs" id="sample-books-selector">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-black" />
              <h3 className="text-sm font-black text-black">
                اختر نموذج كتاب تعليمي للتجربة الفورية أو ارفع كتابك الخاص:
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_BOOKS.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  id={`sample-book-${book.id}`}
                  onClick={() => handleSelectSampleBook(book)}
                  className="text-right p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-black transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {book.category}
                    </span>
                    <h4 className="text-xs font-black text-black mt-2 leading-snug group-hover:text-black">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] font-bold text-neutral-900">
                    <span>تحليل المنهج الآن</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180 text-neutral-400 group-hover:text-black" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentBook && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  الكتاب النشط للتحليل
                </span>
                <h4 className="text-sm font-black text-black">{currentBook.fileName}</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-quick-explain"
                disabled={isProcessing || isUploading}
                onClick={() => handleExecuteAction('explain')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-xs font-bold text-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. شرح المحتوى</span>
              </button>

              <button
                type="button"
                id="btn-quick-summary"
                disabled={isProcessing || isUploading}
                onClick={() => handleExecuteAction('summary')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-xs font-bold text-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. تلخيص شامل</span>
              </button>

              <button
                type="button"
                id="btn-quick-quiz"
                disabled={isProcessing || isUploading}
                onClick={() => handleExecuteAction('quiz')}
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>3. امتحان تدريبي</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-3xl p-4 md:p-6 shadow-xs flex-1 flex flex-col gap-6 min-h-[420px]" id="chat-messages-container">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black select-none ${
                    isUser ? 'bg-neutral-200 text-neutral-800' : 'bg-black text-white'
                  }`}
                >
                  {isUser ? 'أنت' : 'فَهِم'}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-neutral-900 text-white rounded-tr-xs'
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-tl-xs'
                  }`}
                >
                  <div className="prose prose-sm max-w-none text-inherit">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-black text-black my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-black text-black my-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold text-black my-1.5">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pr-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pr-2">{children}</ol>,
                        li: ({ children }) => <li className="text-xs md:text-sm">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-r-4 border-black pr-3 py-1 my-2 bg-neutral-100 rounded-l text-neutral-800 text-xs italic">
                            {children}
                          </blockquote>
                        ),
                        strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {msg.actionType === 'general' && currentBook && (
                    <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-wrap gap-2">
                      <button
                        type="button"
                        id="prompt-action-explain"
                        onClick={() => handleExecuteAction('explain')}
                        className="px-3.5 py-2 bg-white hover:bg-black hover:text-white text-xs font-bold text-black border border-neutral-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>1. شرح محتوى الكتاب</span>
                      </button>

                      <button
                        type="button"
                        id="prompt-action-summary"
                        onClick={() => handleExecuteAction('summary')}
                        className="px-3.5 py-2 bg-white hover:bg-black hover:text-white text-xs font-bold text-black border border-neutral-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>2. تلخيص المحتوى</span>
                      </button>

                      <button
                        type="button"
                        id="prompt-action-quiz"
                        onClick={() => handleExecuteAction('quiz')}
                        className="px-3.5 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                        <span>3. امتحان/أسئلة تدريبية</span>
                      </button>
                    </div>
                  )}

                  {msg.quizData && (
                    <ExamViewer
                      quiz={msg.quizData}
                      onAskFollowup={(prompt) => {
                        setInputQuery(prompt);
                        setTimeout(() => handleSendChat(), 50);
                      }}
                      onResetExam={() => handleExecuteAction('quiz')}
                    />
                  )}

                  <span
                    className={`block text-[10px] mt-2 font-medium ${
                      isUser ? 'text-neutral-400 text-left' : 'text-neutral-400 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isUploading && (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800" id="file-reading-card">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                <h4 className="text-xs md:text-sm font-black text-black">
                  جاري قراءة الملف وتحويله للتحليل...
                </h4>
              </div>
            </div>
          )}

          {isProcessing && !isUploading && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 py-2 pr-11">
              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="mr-1">جاري تجهيز الشرح والتحليل...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-4 z-20 bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-md">
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <button
              type="button"
              id="upload-file-btn"
              onClick={handleTriggerUpload}
              title="رفع كتاب أو ملف دراسي (PDF / TXT)"
              className="p-2.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            <input
              type="text"
              id="chat-input-query"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                currentBook
                  ? `اطرح أي استفسار حول "${currentBook.fileName}"...`
                  : 'اطرح سؤالاً أو اضغط 📎 لرفع كتاب أو منهج دراسي...'
              }
              className="flex-1 bg-transparent text-sm py-2 px-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
            />

            <button
              type="submit"
              id="chat-send-btn"
              disabled={!inputQuery.trim() || isProcessing}
              className={`p-2.5 rounded-xl text-white transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                inputQuery.trim() && !isProcessing
                  ? 'bg-black hover:bg-neutral-800 shadow-xs active:scale-95'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-neutral-400">
            <span>يدعم ملفات الكتب PDF والمستندات النصية</span>
            <span>منصة فَهِم — بالذكاء الاصطناعي</span>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-neutral-200 space-y-6" id="bottom-fixed-section">
          <FaqSection />
          <FeedbackSection />
        </div>
      </main>
    </div>
  );
};
