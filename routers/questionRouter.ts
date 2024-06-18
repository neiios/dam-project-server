import { Router, Response } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

// adds a new question
router.post(
  "/api/v1/questions/:id",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        question: z.string().max(255),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const articleId = Number(req.params.id);
    const { question } = req.body;

    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newQuestion = await db
      .insert(schema.articleQuestions)
      .values({
        question,
        status: "pending",
        userId,
        articleId,
      })
      .returning();

    return res.status(200).json(newQuestion);
  }
);

// lets admin retrieve a question by id
router.get(
  "/api/v1/questions/:questionId",
  validate(
    z.object({
      params: z.object({
        questionId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const questionId = Number(req.params.questionId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const question = await db.query.articleQuestions.findFirst({
      where: eq(schema.articleQuestions.id, questionId),
    });

    return res.status(200).json(question);
  }
);

// regular users can get answered questions for an article
router.get(
  "/api/v1/articles/:articleId/questions",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const articleId = Number(req.params.articleId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const questions = await db.query.articleQuestions.findMany({
      where: and(
        eq(schema.articleQuestions.articleId, articleId),
        eq(schema.articleQuestions.status, "answered")
      ),
    });

    return res.status(200).json(questions);
  }
);

// lets admin answer an article question by id
router.patch(
  "/api/v1/questions/:questionId",
  validate(
    z.object({
      params: z.object({
        questionId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        answer: z.string().max(255),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const questionId = Number(req.params.questionId);
    const { answer } = req.body;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    // only admins should be able to update the question
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const question = await db.query.articleQuestions.findFirst({
      where: eq(schema.articleQuestions.id, questionId),
    });

    if (!question) {
      return res.status(401).json({ message: "Question not found" });
    }

    const updatedQuestion = await db
      .update(schema.articleQuestions)
      .set({ answer, status: "answered" })
      .where(eq(schema.articleQuestions.id, questionId))
      .returning();

    return res.status(200).json(updatedQuestion);
  }
);

router.delete(
  "/api/v1/questions/:questionId",
  validate(
    z.object({
      params: z.object({
        questionId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const questionId = Number(req.params.questionId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const question = await db.query.articleQuestions.findFirst({
      where: eq(schema.articleQuestions.id, questionId),
    });

    if (!question) {
      return res.status(401).json({ message: "Question not found" });
    }

    await db
      .delete(schema.articleQuestions)
      .where(eq(schema.articleQuestions.id, questionId));

    return res.status(200);
  }
);

export default router;
