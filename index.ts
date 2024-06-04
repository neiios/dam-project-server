import express from "express";

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema.ts';

// for migrations
const migrationClient = postgres("postgres://dam:password@localhost:5432/dam-project", { max: 1 });
migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' })

// for query purposes
const queryClient = postgres("postgres://dam:password@localhost:5432/dam-project");
const db = drizzle(queryClient);

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});


