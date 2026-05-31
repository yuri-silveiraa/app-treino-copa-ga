export type User = {
  id: number;
  username: string;
  name: string;
};

export type Alternative = {
  id: number;
  text: string;
};

export type Question = {
  id: number;
  statement: string;
  theme: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  source?: string | null;
  alternatives: Alternative[];
};

export type DashboardData = {
  user: User;
  totalSimulations: number;
  averageCorrect: number;
  averageSimulationTimeMs: number;
  themeWithMostErrors: string | null;
};

export type MyErrorsGroup = {
  theme: string;
  errors: Array<{
    theme: string;
    questionId: number;
    statement: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    wrongCount: number;
  }>;
};

export type SimulationResult = {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTimeMs: number;
  accuracyPercent: number;
  wrongQuestions: Array<{
    questionId: number;
    theme: string;
    statement: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
};

export type RankingItem = {
  position: number;
  userId: number;
  username: string;
  name: string;
  simulationsCount: number;
  averageCorrect: number;
  averageTimeMs: number;
};
