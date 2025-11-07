import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config.js";
import { db } from "../db.js";
import { PublicUser } from "../types.js";

export type AuthenticatedRequest = Request & {
  user?: PublicUser;
};

const tokenFromRequest = (req: Request) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
};

const findUserById = (id: number): PublicUser | null => {
  const row = db
    .prepare("SELECT id, username, created_at as createdAt FROM users WHERE id = ?")
    .get(id) as PublicUser | undefined;
  return row ?? null;
};

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = tokenFromRequest(req);
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    const user = findUserById(payload.userId);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.warn("Invalid JWT", error);
  }
  return next();
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  return next();
};
