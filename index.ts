import express from "express";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";
import { eq } from "drizzle-orm";

import { z } from "zod";
import { validate } from "./utils/validate.ts";

// get db instance
const queryClient = postgres(process.env.DB_URL!);
const db = drizzle(queryClient, { schema });

// create express app
const app = express();
app.use(express.json());
const port = 8080;

app.get("/api/v1/conferences", async (req, res) => {
  const conferences = await db.select().from(schema.conference);
  res.send(conferences);
});

app.get("/api/v1/conferences/everything", async (req, res) => {
  const conferences = await db.query.conference.findMany({
    with: { tracks: true, articles: true },
  });
  res.send(conferences);
});

app.post(
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
  async (req, res) => {
    const {
      name,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl,
      description,
    } = req.body;

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
      })
      .returning();

    res.send(conference);
  }
);

app.get(
  "/api/v1/conferences/:id/tracks",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.id);

    const tracks = await db
      .select()
      .from(schema.track)
      .where(eq(schema.track.conferenceId, conferenceId));

    res.send(tracks);
  }
);

app.post(
  "/api/v1/conferences/:id/tracks",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
      body: z.object({
        name: z.string().max(255),
        description: z.string(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.id);
    const { name, description, startDate, endDate } = req.body;

    const track = await db
      .insert(schema.track)
      .values({
        name,
        description,
        startDate,
        endDate,
        conferenceId,
      })
      .returning();

    res.send(track);
  }
);

app.get(
  "/api/v1/conferences/:id/articles",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = req.params.id;

    const articles = await db
      .select()
      .from(schema.article)
      .where(eq(schema.article.conferenceId, Number(conferenceId)));

    res.send(articles);
  }
);

app.post(
  "/api/v1/conferences/:id/articles",
  validate(
    z.object({
      params: z.object({
        id: z.coerce.number().int().gt(0),
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
  async (req, res) => {
    const conferenceId = Number(req.params.id);
    const { title, authors, abstract, startDate, endDate } = req.body;

    const article = await db
      .insert(schema.article)
      .values({
        title,
        authors,
        abstract,
        startDate,
        endDate,
        conferenceId,
      })
      .returning();

    res.send(article);
  }
);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
