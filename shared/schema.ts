import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  haunt: text("haunt").notNull(),
  questionsAnswered: integer("questions_answered").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  name: true,
  score: true,
  haunt: true,
  questionsAnswered: true,
  correctAnswers: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntryDb = typeof leaderboardEntries.$inferSelect;

// Trivia game schemas
export const triviaQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
  difficulty: z.number().min(1).max(5),
  answers: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string(),
  points: z.number().default(100),
});

export const hauntConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  logoPath: z.string(),
  triviaFile: z.string(),
  adFile: z.string(),
  mode: z.enum(["individual", "queue"]),
  tier: z.enum(["basic", "pro", "premium"]),
  authCode: z.string().optional(),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
  }),
});

export const adDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  link: z.string().optional(),
  duration: z.number().default(5000),
});

export const leaderboardEntrySchema = z.object({
  name: z.string(),
  score: z.number(),
  date: z.string(),
  haunt: z.string(),
  questionsAnswered: z.number(),
  correctAnswers: z.number(),
});

export type TriviaQuestion = z.infer<typeof triviaQuestionSchema>;
export type HauntConfig = z.infer<typeof hauntConfigSchema>;
export type AdData = z.infer<typeof adDataSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
