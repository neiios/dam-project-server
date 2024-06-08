import express from "express";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";
import { eq } from "drizzle-orm";

import { z } from "zod";
import { validate } from "./utils/validate.ts";

// get db instance
const queryClient = postgres(process.env.DB_URL!);
const db = drizzle(queryClient);

// create express app
const app = express();
app.use(express.json());
const port = 8080;

app.get("/api/v1/conferences", async (req, res) => {
  const conferences = await db.select().from(schema.conference);
  res.send(conferences);
});

const conferenceValidation = z.object({
  body: z.object({
    name: z.string().max(255),
    location: z.string().max(255),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    description: z.string(),
  }),
});

app.post(
  "/api/v1/conferences",
  validate(conferenceValidation),
  async (req, res) => {
    const { name, location, startDate, endDate, description } = req.body;

    const conference = await db
      .insert(schema.conference)
      .values({
        name,
        location,
        startDate,
        endDate,
        description,
      })
      .returning();

    res.send(conference);
  }
);

const conferenceIdValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().gt(0),
  }),
});

app.get(
  "/api/v1/conferences/:id/tracks",
  validate(conferenceIdValidation),
  async (req, res) => {
    const conferenceId = Number(req.params.id);

    const tracks = await db
      .select()
      .from(schema.track)
      .where(eq(schema.track.conferenceId, conferenceId));

    res.send(tracks);
  }
);

const trackValidation = z.object({
  body: z.object({
    name: z.string().max(255),
    description: z.string(),
  }),
});

app.post(
  "/api/v1/conferences/:id/tracks",
  validate(conferenceIdValidation),
  validate(trackValidation),
  async (req, res) => {
    const conferenceId = Number(req.params.id);
    const { name, description } = req.body;

    const track = await db
      .insert(schema.track)
      .values({
        name,
        description,
        conferenceId,
      })
      .returning();

    res.send(track);
  }
);

app.get(
  "/api/v1/conferences/:id/articles",
  validate(conferenceIdValidation),
  async (req, res) => {
    const conferenceId = req.params.id;

    const articles = await db
      .select()
      .from(schema.article)
      .where(eq(schema.article.conferenceId, Number(conferenceId)));

    res.send(articles);
  }
);

const articleValidation = z.object({
  body: z.object({
    title: z.string().max(255),
    authors: z.string(),
    abstract: z.string(),
  }),
});

app.post(
  "/api/v1/conferences/:id/articles",
  validate(conferenceIdValidation),
  validate(articleValidation),
  async (req, res) => {
    const conferenceId = Number(req.params.id);
    const { title, authors, abstract } = req.body;

    const article = await db
      .insert(schema.article)
      .values({
        title,
        authors,
        abstract,
        conferenceId,
      })
      .returning();

    res.send(article);
  }
);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
