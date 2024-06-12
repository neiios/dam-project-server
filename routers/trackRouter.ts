import { Router, Response } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { extractPaginationParameters, validate } from "../utils.ts";
import { z } from "zod";

const router: Router = Router();

router.get(
  "/",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);

    const tracks = await db
      .select()
      .from(schema.track)
      .where(eq(schema.track.conferenceId, conferenceId));

    res.send(tracks);
  }
);

router.post(
  "/",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        name: z.string().max(255),
        room: z.string().max(255),
        description: z.string(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const conferenceId = Number(req.params.conferenceId);
    const { name, room, description } = req.body;

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const track = await db
      .insert(schema.track)
      .values({
        name,
        room,
        description,
        conferenceId,
      })
      .returning();

    res.send(track);
  }
);

router.get(
  "/:trackId",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        trackId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);

    const track = await db.query.track.findFirst({
      where: and(
        eq(schema.track.id, trackId),
        eq(schema.track.conferenceId, conferenceId)
      ),
      with: { articles: true },
    });

    res.send(track);
  }
);

router.patch(
  "/:trackId",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        trackId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        name: z.string().max(255),
        room: z.string().max(255),
        description: z.string(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);
    const { name, room, description } = req.body;

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const track = await db
      .update(schema.track)
      .set({
        name,
        room,
        description,
      })
      .where(
        and(
          eq(schema.track.id, trackId),
          eq(schema.track.conferenceId, conferenceId)
        )
      )
      .returning();

    res.send(track);
  }
);

router.delete(
  "/:trackId",
  validate(
    z.object({
      params: z.object({
        trackId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const trackId = Number(req.params.trackId);

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const track = await db
      .delete(schema.track)
      .where(and(eq(schema.track.id, trackId)));
  }
);

// get tracks organized by date
router.get(
  "/:trackId/schedule",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        trackId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);

    const articles = await db
      .select()
      .from(schema.article)
      .where(
        and(
          eq(schema.article.conferenceId, conferenceId),
          eq(schema.article.trackId, trackId)
        )
      );

    const organizedByDate = articles.reduce((acc, article) => {
      const date = article.startDate.split(" ")[0]; // Extract date in yyyy-mm-dd format
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(article);
      return acc;
    }, {});

    res.send(organizedByDate);
  }
);

router.get(
  "/:trackId/articles",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        trackId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);

    const articles = await db
      .select()
      .from(schema.article)
      .where(
        and(
          eq(schema.article.conferenceId, conferenceId),
          eq(schema.article.trackId, trackId)
        )
      );

    res.send(articles);
  }
);

// add an article to a track
router.post(
  "/:trackId/articles",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        trackId: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        title: z.string().max(255),
        authors: z.string(),
        abstract: z.string(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);
    const { title, authors, abstract, startDate, endDate } = req.body;

    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const article = await db
      .insert(schema.article)
      .values({
        title,
        authors,
        abstract,
        startDate,
        endDate,
        conferenceId,
        trackId,
      })
      .returning();

    res.send(article);
  }
);

export default router;
