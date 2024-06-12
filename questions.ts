import { Router, Response } from "express";

import { db } from "./index";
import * as schema from "./schema.ts";
import { eq, and } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./user.ts";
import { validate } from "./utils.ts";
import { z } from "zod";

const router: Router = Router();

router.get(
  "/admin/conferences/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const conferenceId = Number(req.params.id);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    // admins see all questions about the conference
    const questions = await db.query.conferenceQuestions.findMany({
      where: eq(schema.conferenceQuestions.conferenceId, conferenceId),
    });

    return res.json(questions);
  }
);

router.patch(
  "/admin/conferences/:questionId",
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

    const question = await db.query.conferenceQuestions.findFirst({
      where: eq(schema.conferenceQuestions.id, questionId),
    });

    if (!question) {
      return res.status(401).json({ message: "Question not found" });
    }

    const updatedQuestion = await db
      .update(schema.conferenceQuestions)
      .set({ answer, status: "answered" })
      .where(eq(schema.conferenceQuestions.id, questionId))
      .returning();

    return res.json(updatedQuestion);
  }
);

router.delete(
  "/admin/conferences/:questionId",
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

    const question = await db.query.conferenceQuestions.findFirst({
      where: eq(schema.conferenceQuestions.id, questionId),
    });

    if (!question) {
      return res.status(401).json({ message: "Question not found" });
    }

    await db
      .delete(schema.conferenceQuestions)
      .where(eq(schema.conferenceQuestions.id, questionId));
  }
);

router.get(
  "/conferences/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const conferenceId = Number(req.params.id);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // users see only their own questions about the conference
    const questions = await db.query.conferenceQuestions.findMany({
      where: and(
        eq(schema.conferenceQuestions.conferenceId, conferenceId),
        eq(schema.conferenceQuestions.userId, userId)
      ),
    });
    return res.json(questions);
  }
);

router.post(
  "/conferences/:id",
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
    const conferenceId = Number(req.params.id);
    const { question } = req.body;

    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newQuestion = await db
      .insert(schema.conferenceQuestions)
      .values({
        question,
        status: "pending",
        userId,
        conferenceId,
      })
      .returning();

    return res.json(newQuestion);
  }
);

router.get(
  "/admin/articles/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const articleId = Number(req.params.id);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const questions = await db.query.articleQuestions.findMany({
      where: eq(schema.articleQuestions.articleId, articleId),
    });

    return res.json(questions);
  }
);

router.get(
  "/articles/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const articleId = Number(req.params.id);
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
    return res.json(questions);
  }
);

router.patch(
  "/admin/articles/:questionId",
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

    return res.json(updatedQuestion);
  }
);

router.delete(
  "/admin/articles/:questionId",
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
  }
);

router.post(
  "/articles/:id",
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

    return res.json(newQuestion);
  }
);

export default router;
