export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank' | 'image-based';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  options?: string[]; // Optional for fill-in-the-blank
  correctAnswer: string;
  explanation: string;
}

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export type QuizState = 'start' | 'loading' | 'playing' | 'result';

export interface QuizContextType {
  state: QuizState;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  topic: string;
  category: string;
  difficulty: QuizDifficulty;
  answers: Record<string, string>; // questionId -> selectedOption
  setTopic: (topic: string) => void;
  startQuiz: (topic: string, category: string, difficulty: QuizDifficulty) => Promise<void>;
  answerQuestion: (option: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}
