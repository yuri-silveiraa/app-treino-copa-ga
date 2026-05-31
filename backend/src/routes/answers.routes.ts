import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export const answersRouter = Router();

answersRouter.use(requireAuth);

type ErrorItem = {
  theme: string;
  questionId: number;
  statement: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  wrongCount: number;
};

answersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { questionId, selectedAlternativeId, responseTimeMs } = req.body as {
      questionId?: number;
      selectedAlternativeId?: number;
      responseTimeMs?: number;
    };

    if (!questionId || !selectedAlternativeId || typeof responseTimeMs !== "number") {
      throw new HttpError(400, "Dados da resposta incompletos");
    }

    const alternative = await prisma.alternative.findFirst({
      where: { id: selectedAlternativeId, questionId },
      include: { question: { include: { alternatives: true } } },
    });

    if (!alternative) {
      throw new HttpError(400, "Alternativa inválida para esta questão");
    }

    await prisma.answer.create({
      data: {
        userId: req.user!.id,
        questionId,
        selectedAlternativeId,
        isCorrect: alternative.isCorrect,
        responseTimeMs: Math.max(Math.round(responseTimeMs), 0),
        mode: "TRAINING",
      },
    });

    const correctAlternative = alternative.question.alternatives.find((item) => item.isCorrect);

    return res.status(201).json({
      isCorrect: alternative.isCorrect,
      correctAlternative: correctAlternative
        ? { id: correctAlternative.id, text: correctAlternative.text }
        : null,
      explanation: alternative.question.explanation,
    });
  }),
);

answersRouter.post(
  "/check",
  asyncHandler(async (req, res) => {
    const { questionId, selectedAlternativeId } = req.body as {
      questionId?: number;
      selectedAlternativeId?: number;
    };

    if (!questionId || !selectedAlternativeId) {
      throw new HttpError(400, "Dados da resposta incompletos");
    }

    const alternative = await prisma.alternative.findFirst({
      where: { id: selectedAlternativeId, questionId },
      include: { question: { include: { alternatives: true } } },
    });

    if (!alternative) {
      throw new HttpError(400, "Alternativa inválida para esta questão");
    }

    const correctAlternative = alternative.question.alternatives.find((item) => item.isCorrect);

    return res.json({
      isCorrect: alternative.isCorrect,
      correctAlternative: correctAlternative
        ? { id: correctAlternative.id, text: correctAlternative.text }
        : null,
      explanation: alternative.question.explanation,
    });
  }),
);

answersRouter.get(
  "/my-errors",
  asyncHandler(async (req, res) => {
    const wrongAnswers = await prisma.answer.findMany({
      where: { userId: req.user!.id, isCorrect: false },
      include: {
        selectedAlternative: true,
        question: { include: { alternatives: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byQuestion = new Map<number, ErrorItem>();

    for (const answer of wrongAnswers) {
      const correctAlternative = answer.question.alternatives.find((item) => item.isCorrect);
      const current = byQuestion.get(answer.questionId);

      if (current) {
        current.wrongCount += 1;
        continue;
      }

      byQuestion.set(answer.questionId, {
        theme: answer.question.theme,
        questionId: answer.questionId,
        statement: answer.question.statement,
        selectedAnswer: answer.selectedAlternative.text,
        correctAnswer: correctAlternative?.text ?? "",
        explanation: answer.question.explanation,
        wrongCount: 1,
      });
    }

    const grouped = Array.from(byQuestion.values()).reduce<
      Array<{ theme: string; errors: ErrorItem[] }>
    >((acc, error) => {
      const group = acc.find((item) => item.theme === error.theme);
      if (group) {
        group.errors.push(error);
      } else {
        acc.push({ theme: error.theme, errors: [error] });
      }
      return acc;
    }, []);

    return res.json({
      groups: grouped,
      message: grouped.length === 0 ? "Você ainda não possui erros registrados" : undefined,
    });
  }),
);
