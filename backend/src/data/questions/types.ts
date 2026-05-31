export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionSeed = {
  theme: string;
  difficulty: QuestionDifficulty;
  statement: string;
  alternatives: string[];
  correct: string;
  explanation: string;
  source?: string;
};
