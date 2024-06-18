import express from "express";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

import userRouter from "./routers/userRouter.ts";
import questionRouter from "./routers/questionRouter.ts";
import conferenceRouter from "./routers/conferenceRouter.ts";
import tracksRouter from "./routers/trackRouter.ts";
import articleRouter from "./routers/articleRouter.ts";
import requestsRouter from "./routers/requestsRouter.ts";

// get db instance
const queryClient = postgres(process.env.DB_URL!);
export const db = drizzle(queryClient, { schema });

// create express app
const app = express();
app.use(express.json());
const port = 8080;

app.use("/", userRouter);
app.use("/", questionRouter);
app.use("/", requestsRouter);
app.use("/", conferenceRouter);
app.use("/", tracksRouter);
app.use("/", articleRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
