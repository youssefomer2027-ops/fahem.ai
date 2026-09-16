export type UserRole = 'student' | 'teacher';

export interface BirthDate {
  day: string;
  month: string;
  year: string;
}

export interface UserProfile {
  id: string;
  identifier: string; // Email or phone
  role?: UserRole;
  birthDate?: BirthDate;
  isProfileCompleted: boolean;
  createdAt: string;
}

export interface BookContext {
  fileName: string;
  fileSize?: string;
  fileContent?: string;
  fileBase64?: string;
  fileMimeType?: string;
  pageCount?: number;
  uploadedAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionType?: 'explain' | 'summary' | 'quiz' | 'general';
  quizData?: QuizData;
  bookContext?: BookContext;
  isAnalyzing?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FeedbackData {
  id: string;
  rating: number;
  notes: string;
  submittedAt: string;
}
