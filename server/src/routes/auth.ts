import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { config } from "../config.js";
import { db } from "../db.js";
import { authenticate, AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { PublicUser } from "../types.js";

const router = Router();

const credentialsSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128)
});

const toPublicUser = (user: {
  id: number;
  username: string;
  created_at: string;
}): PublicUser => ({
  id: user.id,
  username: user.username,
  createdAt: user.created_at
});

const issueToken = (userId: number) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });

router.post("/register", (req: Request, res: Response) => {
  const parseResult = credentialsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid credentials", issues: parseResult.error.issues });
  }
  const { username, password } = parseResult.data;

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username) as { id: number } | undefined;
  if (existing) {
    return res.status(409).json({ message: "Username already taken" });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const result = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);

  const userRow = db
    .prepare("SELECT id, username, created_at FROM users WHERE id = ?")
    .get(result.lastInsertRowid) as { id: number; username: string; created_at: string };
  const user = toPublicUser(userRow);
  const token = issueToken(user.id);

  return res.status(201).json({ token, user });
});

router.post("/login", (req: Request, res: Response) => {
  const parseResult = credentialsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid credentials", issues: parseResult.error.issues });
  }
  const { username, password } = parseResult.data;

  const userRow = db
    .prepare("SELECT id, username, password_hash, created_at FROM users WHERE username = ?")
    .get(username) as { id: number; username: string; password_hash: string; created_at: string } | undefined;

  if (!userRow) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const valid = bcrypt.compareSync(password, userRow.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const user = toPublicUser(userRow);
  const token = issueToken(user.id);

  return res.json({ token, user });
});

router.get("/me", authenticate, requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

export const authRouter = router;
