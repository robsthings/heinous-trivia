import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
