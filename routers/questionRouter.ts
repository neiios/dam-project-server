import { Router, Response, Request } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and, count } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

// adds a new question
router.post(
  "/api/v1/articles/:articleId/questions",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        question: z.string().max(255),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const articleId = Number(req.params.articleId);
    const { question } = req.body;

    const userId = req.user.id;
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
    const questionId = Number(req.params.questionId);

    const userId = req.user.id;
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

// anyone can get answered questions for an article
router.get(
  "/api/v1/articles/:articleId/questions",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req: Request, res: Response) => {
    const articleId = Number(req.params.articleId);

    const questions = await db.query.articleQuestions.findMany({
      where: and(
        eq(schema.articleQuestions.articleId, articleId),
        eq(schema.articleQuestions.status, "answered")
      ),
    });

    return res.status(200).json(questions);
  }
);

router.get(
  "/api/v1/articles/:articleId/questions/count",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req: Request, res: Response) => {
    const articleId = Number(req.params.articleId);

    const articleCount = await db
      .select({ count: count() })
      .from(schema.articleQuestions)
      .where(
        and(
          eq(schema.articleQuestions.articleId, articleId),
          eq(schema.articleQuestions.status, "answered")
        )
      )
      .then((res) => res[0].count);

    return res.status(200).json(articleCount);
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
    const questionId = Number(req.params.questionId);
    const { answer } = req.body;

    const userId = req.user.id;
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
    const questionId = Number(req.params.questionId);

    console.log("questionId", questionId);

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    await db
      .delete(schema.articleQuestions)
      .where(eq(schema.articleQuestions.id, questionId));

    return res.status(200).send();
  }
);

export default router;
