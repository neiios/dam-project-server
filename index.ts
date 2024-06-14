import express from "express";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

import userRouter from "./routers/userRouter.ts";
import questionRouter from "./routers/questionRouter.ts";
import conferenceRouter from "./routers/conferenceRouter.ts";
import tracksRouter from "./routers/trackRouter.ts";
import articleRouter from "./routers/articleRouter.ts";

// get db instance
const queryClient = postgres(process.env.DB_URL!);
export const db = drizzle(queryClient, { schema });

// create express app
const app = express();
app.use(express.json());
const port = 8080;

app.use("/api/v1/users", userRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/conferences", conferenceRouter);
app.use("/", tracksRouter);
app.use("/api/v1/conferences/:conferenceId/articles", articleRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
