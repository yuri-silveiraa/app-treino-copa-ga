import { User } from "@prisma/client";

export type AuthUser = Pick<User, "id" | "username" | "name">;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
