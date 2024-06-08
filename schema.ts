import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  date,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// entities

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: roleEnum("role"),
});

export const conference = pgTable("conference", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  description: text("description").notNull(),
});

export const article = pgTable("article", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  authors: text("authors").notNull(),
  abstract: text("abstract").notNull(),
  conferenceId: serial("conference_id").notNull(),
});

export const track = pgTable("track", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  conferenceId: serial("conference_id").notNull(),
});

// relations

export const conferenceRelations = relations(conference, ({ many }) => ({
  articles: many(article),
  tracks: many(track),
}));

export const articleRelations = relations(article, ({ one }) => ({
  conference: one(conference, {
    fields: [article.conferenceId],
    references: [conference.id],
  }),
}));

export const trackRelations = relations(track, ({ one }) => ({
  conference: one(conference, {
    fields: [track.conferenceId],
    references: [conference.id],
  }),
}));
