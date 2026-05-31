import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

type TokenPayload = {
  id: number;
  username: string;
  name: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, "Token não informado"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    req.user = {
      id: payload.id,
      username: payload.username,
      name: payload.name,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Token inválido"));
  }
}
