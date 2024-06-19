import { Router, Response } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

// admin can get all requests for all conferences
router.get(
  "/api/v1/requests",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const questions = await db.query.conferenceQuestions.findMany({
      with: { user: true, conference: true },
    });

    return res.status(200).json(questions);
  }
);

// admin can get a request by id
router.get(
  "/api/v1/requests/:requestId",
  validate(
    z.object({
      params: z.object({
        requestId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const requestId = Number(req.params.requestId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const question = await db.query.conferenceQuestions.findFirst({
      where: eq(schema.conferenceQuestions.id, requestId),
    });

    return res.status(200).json(question);
  }
);

// admin should be able to answer a request
router.patch(
  "/api/v1/requests/:requestId",
  validate(
    z.object({
      params: z.object({
        requestId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        answer: z.string().max(255),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const requestId = Number(req.params.requestId);
    const { answer } = req.body;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const question = await db.query.conferenceQuestions.findFirst({
      where: eq(schema.conferenceQuestions.id, requestId),
    });

    if (!question) {
      return res.status(401).json({ message: "Question not found" });
    }

    const updatedQuestion = await db
      .update(schema.conferenceQuestions)
      .set({ answer, status: "answered" })
      .where(eq(schema.conferenceQuestions.id, requestId))
      .returning();

    return res.status(200).json(updatedQuestion);
  }
);

// admin should be able to delete requests by id
router.delete(
  "/api/v1/requests/:requestId",
  validate(
    z.object({
      params: z.object({
        requestId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const requestId = Number(req.params.requestId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    await db
      .delete(schema.conferenceQuestions)
      .where(eq(schema.conferenceQuestions.id, requestId));

    return res.status(200).send();
  }
);

// user should be able to add a request to a conference
router.post(
  "/api/v1/conferences/:conferenceId/requests",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        question: z.string().max(255),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const conferenceId = Number(req.params.conferenceId);
    const { question } = req.body;

    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newRequest = await db
      .insert(schema.conferenceQuestions)
      .values({
        question,
        status: "pending",
        userId,
        conferenceId,
      })
      .returning();

    return res.status(200).json(newRequest);
  }
);

// get your own requests
router.get(
  "/api/v1/conferences/:conferenceId/requests",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const conferenceId = Number(req.params.conferenceId);
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

    return res.status(200).json(questions);
  }
);

// user should be able to retrieve a request by id
router.get(
  "/api/v1/conferences/:conferenceId/requests/:requestId",
  validate(
    z.object({
      params: z.object({
        requestId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = Number(req.params.requestId);

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const question = await db.query.conferenceQuestions.findFirst({
      where: and(
        eq(schema.conferenceQuestions.userId, userId),
        eq(schema.conferenceQuestions.id, requestId)
      ),
    });

    if (!question) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json(question);
  }
);

export default router;
