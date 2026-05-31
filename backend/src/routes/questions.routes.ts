import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";
import { sanitizeQuestion, shuffle } from "../utils/question.js";

export const questionsRouter = Router();

questionsRouter.use(requireAuth);

questionsRouter.get(
  "/themes",
  asyncHandler(async (_req, res) => {
    const themes = await prisma.question.findMany({
      distinct: ["theme"],
      orderBy: { theme: "asc" },
      select: { theme: true },
    });

    return res.json({
      themes: themes.map((item) => item.theme),
      message: themes.length === 0 ? "Nenhuma questão cadastrada ainda" : undefined,
    });
  }),
);

questionsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const theme = typeof req.query.theme === "string" ? req.query.theme : undefined;
    const questions = await prisma.question.findMany({
      where: theme ? { theme } : undefined,
      include: { alternatives: true },
      orderBy: { id: "asc" },
    });

    return res.json({
      questions: questions.map(sanitizeQuestion),
      message: questions.length === 0 ? "Nenhuma questão cadastrada ainda" : undefined,
    });
  }),
);

questionsRouter.get(
  "/random",
  asyncHandler(async (req, res) => {
    const theme = typeof req.query.theme === "string" ? req.query.theme : undefined;
    const limit = Math.max(Number(req.query.limit ?? 1), 1);
    const questions = await prisma.question.findMany({
      where: theme ? { theme } : undefined,
      include: { alternatives: true },
    });
    const selected = shuffle(questions).slice(0, limit);

    return res.json({
      questions: selected.map(sanitizeQuestion),
      message: selected.length === 0 ? "Nenhuma questão cadastrada ainda" : undefined,
    });
  }),
);

questionsRouter.get(
  "/simulation",
  asyncHandler(async (_req, res) => {
    const questions = await prisma.question.findMany({
      include: { alternatives: true },
    });

    if (questions.length < 10) {
      return res.json({
        questions: [],
        message:
          questions.length === 0
            ? "Nenhuma questão cadastrada ainda"
            : "São necessárias 10 questões cadastradas para iniciar o simulado oficial",
      });
    }

    return res.json({
      questions: shuffle(questions).slice(0, 10).map(sanitizeQuestion),
    });
  }),
);
