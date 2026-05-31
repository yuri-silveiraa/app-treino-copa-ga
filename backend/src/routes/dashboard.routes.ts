import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const [simulations, wrongAnswers] = await Promise.all([
      prisma.simulation.findMany({ where: { userId } }),
      prisma.answer.findMany({
        where: { userId, isCorrect: false },
        include: { question: true },
      }),
    ]);

    const totalSimulations = simulations.length;
    const averageCorrect =
      totalSimulations === 0
        ? 0
        : simulations.reduce((sum, simulation) => sum + simulation.correctAnswers, 0) /
          totalSimulations;
    const averageSimulationTimeMs =
      totalSimulations === 0
        ? 0
        : simulations.reduce((sum, simulation) => sum + simulation.totalTimeMs, 0) /
          totalSimulations;

    const errorsByTheme = wrongAnswers.reduce<Record<string, number>>((acc, answer) => {
      acc[answer.question.theme] = (acc[answer.question.theme] ?? 0) + 1;
      return acc;
    }, {});

    const themeWithMostErrors =
      Object.entries(errorsByTheme).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return res.json({
      user: req.user,
      totalSimulations,
      averageCorrect,
      averageSimulationTimeMs,
      themeWithMostErrors,
    });
  }),
);
