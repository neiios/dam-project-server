import express from "express";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";
import { and, asc, eq, or, sql } from "drizzle-orm";

import { z } from "zod";
import { validate, extractPaginationParameters } from "./utils.ts";

import userRouter from "./user";

// TODO: make sure dates are inside the conference date range
// applies to several endpoints

// get db instance
const queryClient = postgres(process.env.DB_URL!);
export const db = drizzle(queryClient, { schema });

// create express app
const app = express();
app.use(express.json());
const port = 8080;

app.use("/api/v1/users", userRouter);

app.get("/api/v1/conferences", async (req, res) => {
  const { pageSize, offset } = extractPaginationParameters(req);

  const conferences = await db.query.conference.findMany({
    with: { tracks: true },
    orderBy: (conference, { asc }) => asc(conference.id),
    limit: pageSize,
    offset: offset,
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

    // TODO: handle the edge cases
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

app.get(
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
app.get(
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
      }),
    })
  ),
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
  "/api/v1/conferences/:conferenceId/tracks/:trackId",
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

app.get(
  "/api/v1/conferences/:conferenceId/articles/:articleId",
  validate(
    z.object({
      params: z.object({
        conferenceId: z.coerce.number().int().gt(0),
        articleId: z.coerce.number().int().gt(0),
      }),
    })
  ),
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);
    const articleId = Number(req.params.articleId);

    const article = await db.query.article.findFirst({
      where: and(
        eq(schema.article.id, articleId),
        eq(schema.article.conferenceId, conferenceId)
      ),
      with: { track: true },
    });

    res.send(article);
  }
);

app.get(
  "/api/v1/conferences/:conferenceId/tracks/:trackId/articles",
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

app.get(
  "/api/v1/conferences/:conferenceId/tracks/:trackId/schedule",
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

app.post(
  "/api/v1/conferences/:conferenceId/tracks/:trackId/articles",
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
  async (req, res) => {
    const conferenceId = Number(req.params.conferenceId);
    const trackId = Number(req.params.trackId);
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
        trackId,
      })
      .returning();

    res.send(article);
  }
);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
