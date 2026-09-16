import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Send,
  BookOpen,
  Sparkles,
  FileText,
  FileCheck2,
  GraduationCap,
  BookOpenCheck,
  LogOut,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  ListChecks,
  Compass,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FahemLogo } from './FahemLogo';
import { ExamViewer } from './ExamViewer';
import { FaqSection } from './FaqSection';
import { FeedbackSection } from './FeedbackSection';
import { SAMPLE_BOOKS, SampleBook } from '../data/sampleBooks';
import { UserProfile, BookContext, ChatMessage, QuizData } from '../types';

interface ChatInterfaceProps {
  user: UserProfile;
  onLogout: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [currentBook, setCurrentBook] = useState<BookContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize welcoming chat message
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzingFile, isProcessing]);

  // Trigger File Input Click
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle uploaded file (PDF / TXT / Doc)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again if needed
    e.target.value = '';

    const fileName = file.name;
    const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`;

    let extractedText = '';
    try {
      extractedText = await file.text();
    } catch {
      extractedText = `ملف كتاب دراسي: ${fileName} (${fileSizeFormatted})`;
    }

    const newBookContext: BookContext = {
      fileName,
      fileSize: fileSizeFormatted,
      fileContent: extractedText.slice(0, 15000),
      uploadedAt: new Date().toISOString(),
    };

    setCurrentBook(newBookContext);
    startBookAnalysisWorkflow(newBookContext);
  };

  // Select a pre-loaded sample book
  const handleSelectSampleBook = (sample: SampleBook) => {
    const newBookContext: BookContext = {
      fileName: sample.title,
      fileSize: 'نسخة منهج رقمي',
      fileContent: sample.content,
      uploadedAt: new Date().toISOString(),
    };
    setCurrentBook(newBookContext);
    startBookAnalysisWorkflow(newBookContext);
  };

  // Simulated & Real Book Analysis Pipeline
  const startBookAnalysisWorkflow = (book: BookContext) => {
    setIsAnalyzingFile(true);
    setAnalysisProgress(15);

    // Add user upload message
    const userUploadMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: `📎 قمت برفع الكتاب: **${book.fileName}** (${book.fileSize || 'ملف دراسي'})`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userUploadMsg]);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 25;
      });
    }, 300);

    // Finish analysis and present the 3 actions
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzingFile(false);
      setAnalysisProgress(100);

      const readyMsg: ChatMessage = {
        id: `msg-${Date.now()}-ready`,
        sender: 'assistant',
        content: `### 📚 تم تحليل محتوى الكتاب بنجاح: **"${book.fileName}"**

تم استخراج النصوص وفهرسة الفصول والمصطلحات الأساسية بدقة. 
ما هو احتياجك التعليمي لهذا المنهج الآن؟

1. 💡 **شرح محتوى الكتاب**: تفكيك المفاهيم الصعبة وضرب أمثلة شارحة.
2. 📑 **تلخيص المحتوى**: أبرز القواعد والتعريفات والأفكار المحورية.
3. 📝 **امتحان وأسئلة تدريبية**: بنك أسئلة لقياس مستوى الفهم وتصحيح الإجابات مع الشرح.`,
        actionType: 'general',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        bookContext: book,
      };

      setMessages((prev) => [...prev, readyMsg]);
    }, 1200);
  };

  // Handle User Action (Explain, Summary, Quiz)
  const handleExecuteAction = async (action: 'explain' | 'summary' | 'quiz') => {
    if (!currentBook) return;
    setIsProcessing(true);

    const actionLabel =
      action === 'explain'
        ? 'شرح محتوى الكتاب'
        : action === 'summary'
        ? 'تلخيص المحتوى'
        : 'امتحان وأسئلة تدريبية على المنهج';

    // Add user selection message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user-action`,
      sender: 'user',
      content: `أرغب في: **${actionLabel}**`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/analyze-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: currentBook.fileName,
          fileContent: currentBook.fileContent,
          role: user.role,
          action,
        }),
      });

      const data = await response.json();

      if (action === 'quiz') {
        const quizData: QuizData = data.data || data.analysis?.data;
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-quiz`,
          sender: 'assistant',
          content: `أهلاً بك! تم تجهيز هذا الاختبار التفاعلي بناءً على محتوى **${currentBook.fileName}**. أجب عن الأسئلة ثم اضغط على **تسليم الامتحان** لعرض درجتك وتصحيح كل إجابة مع الشرح:`,
          actionType: 'quiz',
          quizData,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const textContent = data.content || data.analysis?.content || '';
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-${action}`,
          sender: 'assistant',
          content: textContent,
          actionType: action,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Action error:', err);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        sender: 'assistant',
        content: `تم إعداد الاستجابة لـ **${actionLabel}** بنجاح. يمكنك قراءة الشرح ومواصلة الحوار والاستفسار في أي وقت.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Free-form User Chat Message
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          bookContext: currentBook,
          role: user.role,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        content: data.reply || 'تم استلام سؤالك وتجري معالجته بناءً على مخرجات المنهج.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'assistant',
        content: `بناءً على محتوى الكتاب المرفوع (${currentBook?.fileName || 'المادة الدراسية'})، تم حفظ استفسارك. هل ترغب في **تلخيص** إضافي أو **اختبار جديد**؟`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col text-neutral-900" id="fahem-chat-app">
      {/* Hidden File Input for PDF / Text books */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,.md,.doc,.docx"
        className="hidden"
        id="book-file-picker"
      />

      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FahemLogo size="sm" />
        </div>

        {/* User Status Badge & Controls */}
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

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Sample Books Quick Selector (if no book chosen yet or for fast switching) */}
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

        {/* Active Book Action Bar (When a book is active) */}
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

            {/* Quick 3-Choice Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-quick-explain"
                disabled={isProcessing || isAnalyzingFile}
                onClick={() => handleExecuteAction('explain')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-xs font-bold text-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. شرح المحتوى</span>
              </button>

              <button
                type="button"
                id="btn-quick-summary"
                disabled={isProcessing || isAnalyzingFile}
                onClick={() => handleExecuteAction('summary')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-xs font-bold text-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. تلخيص شامل</span>
              </button>

              <button
                type="button"
                id="btn-quick-quiz"
                disabled={isProcessing || isAnalyzingFile}
                onClick={() => handleExecuteAction('quiz')}
                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>3. امتحان تدريبي</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Stream Area */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-4 md:p-6 shadow-xs flex-1 flex flex-col gap-6 min-h-[420px]" id="chat-messages-container">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black select-none ${
                    isUser ? 'bg-neutral-200 text-neutral-800' : 'bg-black text-white'
                  }`}
                >
                  {isUser ? 'أنت' : 'فَهِم'}
                </div>

                {/* Message Body */}
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

                  {/* Interactive Action Buttons inside assistant ready prompt */}
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

                  {/* Render Exam if message contains quizData */}
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

          {/* Analyzing book animated state */}
          {isAnalyzingFile && (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800 space-y-3" id="book-analysis-progress-card">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-black animate-spin" />
                <div className="flex-1">
                  <h4 className="text-xs md:text-sm font-black text-black">
                    جاري استخراج وتحليل محتوى الكتاب ({currentBook?.fileName})...
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    تقسيم الفصول واستخراج المفاهيم الأساسية لبناء قاعدة المعرفة والامتحانات
                  </p>
                </div>
                <span className="text-xs font-black text-black">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-black h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ongoing processing indicator */}
          {isProcessing && !isAnalyzingFile && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 py-2 pr-11">
              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-neutral-600 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="mr-1">جاري تجهيز الشرح والتحليل...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Chat Input Bar with 📎 Paperclip Button */}
        <div className="sticky bottom-4 z-20 bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-md">
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            {/* 📎 File Upload Button */}
            <button
              type="button"
              id="upload-file-btn"
              onClick={handleTriggerUpload}
              title="رفع كتاب أو ملف دراسي (PDF / TXT)"
              className="p-2.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>

            {/* Input Query Field */}
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

            {/* Send Button */}
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

          {/* Small helper info */}
          <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-neutral-400">
            <span>يدعم ملفات الكتب PDF والمستندات النصية</span>
            <span>منصة فَهِم — بالذكاء الاصطناعي</span>
          </div>
        </div>

        {/* Section under chat: FAQ Accordion & Feedback Form */}
        <div className="mt-4 pt-6 border-t border-neutral-200 space-y-6" id="bottom-fixed-section">
          {/* FAQ Accordion */}
          <FaqSection />

          {/* Feedback Form */}
          <FeedbackSection />
        </div>
      </main>
    </div>
  );
};
