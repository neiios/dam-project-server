import { Router, Response } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and, or, asc, sql } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

// gett all conference articles, supports pagination and search
router.get(
  "/",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = req.params.id;

    // TODO: handle parseInt error
    const page = req.query.page
      ? parseInt(req.query.page as string)
      : undefined;
    const pageSize = req.query.pageSize
      ? parseInt(req.query.pageSize as string)
      : undefined;
    const searchTerm = req.query.searchTerm;

    const query = db.select().from(schema.article);
    const matchConferenceId = eq(
      schema.article.conferenceId,
      Number(conferenceId)
    );

    if (searchTerm) {
      const likeTerm = `%${searchTerm}%`.toLowerCase();
      query.where(
        and(
          matchConferenceId,
          or(
            sql`lower(${schema.article.title}) ilike ${likeTerm}`,
            sql`lower(${schema.article.authors}) ilike ${likeTerm}`
          )
        )
      );
    } else {
      query.where(matchConferenceId);
    }

    if (page && pageSize) {
      const offset = (page - 1) * pageSize;
      query.orderBy(asc(schema.article.id)).limit(pageSize).offset(offset);
    }

    const articles = await query;

    res.send(articles);
  }
);

// get an article by id with track info
router.get(
  "/:articleId",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const articleId = Number(req.params.articleId);

    const article = await db.query.article.findFirst({
      where: and(eq(schema.article.id, articleId)),
      with: { track: true },
    });

    res.send(article);
  }
);

// update an article information, only admins can do this
router.patch(
  "/:articleId",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        title: z.string().max(255),
        authors: z.string().max(255),
        abstract: z.string(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const articleId = Number(req.params.articleId);
    const { title, authors, abstract } = req.body;

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const article = await db
      .update(schema.article)
      .set({
        title,
        authors,
        abstract,
      })
      .where(and(eq(schema.article.id, articleId)))
      .returning();

    res.send(article);
  }
);

// delete an article, only admins can do this
router.delete(
  "/:articleId",
  validate(
    z.object({
      params: z.object({
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const articleId = Number(req.params.articleId);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, req.user.id),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    await db.delete(schema.article).where(eq(schema.article.id, articleId));
  }
);

export default router;
