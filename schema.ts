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
  name: varchar("name", { length: 256 }).notNull(),
  password: varchar("name", { length: 256 }).notNull(),
  email: varchar("name", { length: 256 }).notNull(),
  role: roleEnum("role"),
});

export const conference = pgTable("conference", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  location: varchar("name", { length: 256 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  description: text("description").notNull(),
  contactInfo: text("contact_info").notNull(),
});

export const article = pgTable("article", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  authors: text("authors").notNull(),
  abstract: text("abstract").notNull(),
  conferenceId: serial("conference_id").notNull(),
});

export const track = pgTable("track", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
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
