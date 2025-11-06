
export interface Choice {
  _id: string;
  label: string;      // Ví dụ: "A", "B", "C", "D"
  text: string;       // Nội dung đáp án
  isCorrect?: boolean; // Đúng hay sai
  isUserChoice?: boolean;
}

export interface Group {
  image?: string;
  audio?: string;
  text?: string;
}

export interface Question {
  _id: string;
  question: string;
  questionNumber: number;
  globalQuestionNumber: number; // số thứ tự toàn bài
  partNumber: number;           // part nào
  group: Group;
  choices: Choice[];
  userAnswer?: {                // nên dùng object để tương thích với API
    selectedAnswer?: 'A' | 'B' | 'C' | 'D' | null;    // index của choice đã chọn
    timeSpent?: number;
    isSkipped?: boolean;
    isFlagged?: boolean;
  } | null;
}

export interface SessionProgress {
  answeredCount: number;
  completionPercentage: number; // dạng number
  totalQuestions: number;
}

export interface SessionTestConfig {
  allowReview: boolean;
  selectedParts: number[];
  shuffleQuestions: boolean;
  timeLimit: number; // phút
}

export interface TestId {
  _id: string;
  audio: string;
  title: string;
  testCode: string;
}

export interface Session {
  id: string;
  sessionType: "full-test" | "practice";
  sessionCode?: string; // từ API trả về ở getSessionQuestions
  testConfig: SessionTestConfig;
  progress: SessionProgress;
  testId: TestId;
  timeRemaining: number; // milliseconds còn lại
}

export interface UserAnswer {
  questionId: {
    _id: string;
    questionNumber: number;
    question: string;
    partNumber: number;
    group: Group;
    choices: Choice[];
    correctAnswer: string;
    explanation?: string;
  };
  questionNumber: number;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeSpent: number;
  isSkipped: boolean;
  isFlagged: boolean;
}

export interface UnsentAnswer {
  questionId: string;
  selectedAnswer: string | null;
  timeSpent?: number;
  isFlagged?: boolean;
}