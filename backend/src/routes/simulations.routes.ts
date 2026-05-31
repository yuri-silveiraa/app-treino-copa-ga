import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export const simulationsRouter = Router();

simulationsRouter.use(requireAuth);

type ValidatedSimulationAnswer = {
  questionId: number;
  selectedAlternativeId: number;
  responseTimeMs: number;
  isCorrect: boolean;
  question: {
    theme: string;
    statement: string;
    explanation: string;
  };
  selectedText: string;
  correctText: string;
};

simulationsRouter.post(
  "/finish",
  asyncHandler(async (req, res) => {
    const { answers, totalTimeMs } = req.body as {
      answers?: Array<{
        questionId?: number;
        selectedAlternativeId?: number;
        responseTimeMs?: number;
      }>;
      totalTimeMs?: number;
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      throw new HttpError(400, "Nenhuma resposta enviada");
    }

    if (answers.length !== 10) {
      throw new HttpError(400, "O simulado oficial deve ter exatamente 10 respostas");
    }

    const validatedAnswers: ValidatedSimulationAnswer[] = [];

    for (const answer of answers) {
      if (
        !answer.questionId ||
        !answer.selectedAlternativeId ||
        typeof answer.responseTimeMs !== "number"
      ) {
        throw new HttpError(400, "Dados de resposta incompletos");
      }

      const alternative = await prisma.alternative.findFirst({
        where: {
          id: answer.selectedAlternativeId,
          questionId: answer.questionId,
        },
        include: { question: { include: { alternatives: true } } },
      });

      if (!alternative) {
        throw new HttpError(400, "Alternativa inválida para uma das questões");
      }

      validatedAnswers.push({
        questionId: answer.questionId,
        selectedAlternativeId: answer.selectedAlternativeId,
        responseTimeMs: Math.max(Math.round(answer.responseTimeMs), 0),
        isCorrect: alternative.isCorrect,
        question: alternative.question,
        selectedText: alternative.text,
        correctText:
          alternative.question.alternatives.find((item) => item.isCorrect)?.text ?? "",
      });
    }

    const correctAnswers = validatedAnswers.filter((answer) => answer.isCorrect).length;
    const calculatedTotalTimeMs = validatedAnswers.reduce(
      (sum, answer) => sum + answer.responseTimeMs,
      0,
    );

    const simulation = await prisma.$transaction(async (tx) => {
      const createdSimulation = await tx.simulation.create({
        data: {
          userId: req.user!.id,
          totalQuestions: validatedAnswers.length,
          correctAnswers,
          wrongAnswers: validatedAnswers.length - correctAnswers,
          totalTimeMs: Math.max(Math.round(totalTimeMs ?? calculatedTotalTimeMs), 0),
        },
      });

      await tx.answer.createMany({
        data: validatedAnswers.map((answer) => ({
          userId: req.user!.id,
          questionId: answer.questionId,
          selectedAlternativeId: answer.selectedAlternativeId,
          isCorrect: answer.isCorrect,
          responseTimeMs: answer.responseTimeMs,
          mode: "SIMULATION",
          simulationId: createdSimulation.id,
        })),
      });

      return createdSimulation;
    });

    const wrongQuestions = validatedAnswers
      .filter((answer) => !answer.isCorrect)
      .map((answer) => ({
        questionId: answer.questionId,
        theme: answer.question.theme,
        statement: answer.question.statement,
        selectedAnswer: answer.selectedText,
        correctAnswer: answer.correctText,
        explanation: answer.question.explanation,
      }));

    return res.status(201).json({
      simulation,
      result: {
        totalQuestions: simulation.totalQuestions,
        correctAnswers: simulation.correctAnswers,
        wrongAnswers: simulation.wrongAnswers,
        totalTimeMs: simulation.totalTimeMs,
        accuracyPercent: Math.round((simulation.correctAnswers / simulation.totalQuestions) * 100),
        wrongQuestions,
      },
    });
  }),
);

simulationsRouter.get(
  "/ranking",
  asyncHandler(async (_req, res) => {
    const simulations = await prisma.simulation.findMany({
      include: { user: true },
    });

    const rankingMap = new Map<
      number,
      {
        userId: number;
        username: string;
        name: string;
        simulationsCount: number;
        bestCorrectAnswers: number;
        bestTotalTimeMs: number;
        bestWrongAnswers: number;
        bestTotalQuestions: number;
      }
    >();

    for (const simulation of simulations) {
      const current = rankingMap.get(simulation.userId);
      const candidate = {
        userId: simulation.userId,
        username: simulation.user.username,
        name: simulation.user.name,
        simulationsCount: 1,
        bestCorrectAnswers: simulation.correctAnswers,
        bestTotalTimeMs: simulation.totalTimeMs,
        bestWrongAnswers: simulation.wrongAnswers,
        bestTotalQuestions: simulation.totalQuestions,
      };

      if (!current) {
        rankingMap.set(simulation.userId, candidate);
        continue;
      }

      current.simulationsCount += 1;

      const isBetter =
        simulation.correctAnswers > current.bestCorrectAnswers ||
        (simulation.correctAnswers === current.bestCorrectAnswers &&
          simulation.totalTimeMs < current.bestTotalTimeMs);

      if (isBetter) {
        current.bestCorrectAnswers = simulation.correctAnswers;
        current.bestTotalTimeMs = simulation.totalTimeMs;
        current.bestWrongAnswers = simulation.wrongAnswers;
        current.bestTotalQuestions = simulation.totalQuestions;
      }
    }

    const ranking = Array.from(rankingMap.values())
      .map((item) => ({
        userId: item.userId,
        username: item.username,
        name: item.name,
        simulationsCount: item.simulationsCount,
        bestCorrectAnswers: item.bestCorrectAnswers,
        bestWrongAnswers: item.bestWrongAnswers,
        bestTotalQuestions: item.bestTotalQuestions,
        bestTotalTimeMs: item.bestTotalTimeMs,
      }))
      .sort((a, b) => {
        if (b.bestCorrectAnswers !== a.bestCorrectAnswers) {
          return b.bestCorrectAnswers - a.bestCorrectAnswers;
        }
        return a.bestTotalTimeMs - b.bestTotalTimeMs;
      })
      .map((item, index) => ({
        position: index + 1,
        ...item,
      }));

    return res.json({
      ranking,
      message: ranking.length === 0 ? "Nenhum simulado oficial foi feito ainda" : undefined,
    });
  }),
);
