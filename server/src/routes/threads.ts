import { Request, Response, Router } from "express";
import { z } from "zod";

import { authenticate, AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import { createOperation, createThread, getThreadsWithTree } from "../services/threadService.js";

const router = Router();

router.use(authenticate);

router.get("/", (_req: Request, res: Response) => {
  const threads = getThreadsWithTree();
  return res.json({ threads });
});

const createThreadSchema = z.object({
  initialValue: z.coerce.number()
});

router.post("/", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }
  const thread = createThread(parsed.data.initialValue, req.user!.id);
  return res.status(201).json({ thread });
});

const operationSchema = z.object({
  parentOperationId: z.number().nullable().optional(),
  operationType: z.enum(["add", "subtract", "multiply", "divide"] as const),
  operand: z.number()
});

router.post(
  "/:threadId/operations",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const threadId = Number(req.params.threadId);
    if (!Number.isFinite(threadId)) {
      return res.status(400).json({ message: "Invalid thread id" });
    }

    const parsed = operationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    }

    try {
      const operation = createOperation(
        threadId,
        parsed.data.parentOperationId ?? null,
        parsed.data.operationType,
        parsed.data.operand,
        req.user!.id
      );
      return res.status(201).json({ operation });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ message });
    }
  }
);

export const threadsRouter = router;
