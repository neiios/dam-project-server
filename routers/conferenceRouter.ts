import { Router, Response } from "express";

import { db } from "../index";
import * as schema from "../schema.ts";
import { eq, and } from "drizzle-orm";

import { AuthenticatedRequest, authenticateToken } from "./userRouter.ts";
import { extractPaginationParameters, validate } from "../utils.ts";
import { z } from "zod";

// TODO: make sure dates are inside the conference date range
// this is needed for all 3 main entities

const router: Router = Router();

// get all conferences with tracks
router.get("/api/v1/conferences", async (req, res) => {
  const { pageSize, offset } = extractPaginationParameters(req);

  const conferences = await db.query.conference.findMany({
    with: { tracks: true },
    orderBy: (conference, { asc }) => asc(conference.id),
    limit: pageSize,
    offset: offset,
  });

  res.send(conferences);
});

// add conference
router.post(
  "/api/v1/conferences",
  validate(
    z.object({
      body: z.object({
        name: z.string().max(255),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        imageUrl: z.string(),
        description: z.string(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl,
      description,
    } = req.body;
    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    // TODO: this can probably break in spectacular ways
    const locationData = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    const city = await locationData.json().then((data) => data?.address?.city);

    const conference = await db
      .insert(schema.conference)
      .values({
        name,
        latitude,
        longitude,
        startDate,
        endDate,
        imageUrl,
        description,
        city,
      })
      .returning();

    res.send(conference);
  }
);

// update conference info
router.patch(
  "/api/v1/conferences/:id",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        name: z.string().max(255),
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        imageUrl: z.string(),
        description: z.string(),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const conferenceId = Number(req.params.id);
    const {
      name,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl,
      description,
    } = req.body;
    const userId = req.user.id;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    const conference = await db
      .update(schema.conference)
      .set({
        name,
        latitude,
        longitude,
        startDate,
        endDate,
        imageUrl,
        description,
      })
      .where(eq(schema.conference.id, conferenceId))
      .returning();

    res.send(conference);
  }
);

// delete a conference, only admins can do this, does a cascade delete
router.delete(
  "/api/v1/conferences/:id",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const conferenceId = Number(req.params.id);
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, req.user.id),
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    await db
      .delete(schema.conference)
      .where(eq(schema.conference.id, conferenceId));
  }
);

// get conference by id with tracks and articles
router.get(
  "/api/v1/conferences/:id",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.id);

    const conference = await db.query.conference.findFirst({
      where: eq(schema.conference.id, conferenceId),
      with: {
        tracks: { with: { articles: true } },
      },
    });

    res.send(conference);
  }
);

// get conference lat and long only
router.get(
  "/api/v1/conferences/:id/location",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.id);

    const coords = await db.query.conference.findFirst({
      where: eq(schema.conference.id, conferenceId),
      columns: {
        latitude: true,
        longitude: true,
      },
    });

    res.send(coords);
  }
);

export default router;
