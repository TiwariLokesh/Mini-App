import cors from "cors";
import express, { Request, Response } from "express";

import { authRouter } from "./routes/auth.js";
import { threadsRouter } from "./routes/threads.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

  app.use("/auth", authRouter);
  app.use("/threads", threadsRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Route ${req.path} not found` });
  });

  return app;
};
