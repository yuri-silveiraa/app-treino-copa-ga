import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      throw new HttpError(400, "Usuário e senha são obrigatórios");
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new HttpError(401, "Credenciais inválidas");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new HttpError(401, "Credenciais inválidas");
    }

    const publicUser = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    const token = jwt.sign(publicUser, env.jwtSecret, { expiresIn: "7d" });

    return res.json({ token, user: publicUser });
  }),
);
