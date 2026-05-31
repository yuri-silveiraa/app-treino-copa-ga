import { Alternative, Question } from "@prisma/client";

type QuestionWithAlternatives = Question & { alternatives: Alternative[] };

export function sanitizeQuestion(question: QuestionWithAlternatives) {
  return {
    id: question.id,
    statement: question.statement,
    theme: question.theme,
    difficulty: question.difficulty,
    explanation: question.explanation,
    source: question.source,
    alternatives: question.alternatives.map((alternative) => ({
      id: alternative.id,
      text: alternative.text,
    })),
  };
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function msToSeconds(ms: number) {
  return Math.round(ms / 1000);
}
