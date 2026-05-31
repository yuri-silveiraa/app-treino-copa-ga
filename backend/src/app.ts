import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { answersRouter } from "./routes/answers.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { questionsRouter } from "./routes/questions.routes.js";
import { simulationsRouter } from "./routes/simulations.routes.js";
import { errorHandler, HttpError } from "./utils/http.js";
import "./types.js";

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/questions", questionsRouter);
app.use("/answers", answersRouter);
app.use("/simulations", simulationsRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Rota não encontrada"));
});

app.use(errorHandler);
