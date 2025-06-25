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

export const hauntConfigs = pgTable("haunt_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logoPath: text("logo_path").notNull().default(""),
  triviaFile: text("trivia_file").notNull().default(""),
  adFile: text("ad_file").notNull().default(""),
  mode: text("mode").notNull().default("individual"),
  tier: text("tier").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(true),
  authCode: text("auth_code"), // Legacy: keep for backward compatibility
  authorizedEmails: text("authorized_emails").array(), // New: array of authorized admin emails
  themeData: text("theme_data").notNull(),
  skinUrl: text("skin_url"), // Pro/Premium only: custom background image
  progressBarTheme: text("progress_bar_theme"), // Pro/Premium only: progress bar color theme
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(), // UUID or identifier for player
  haunt: text("haunt").notNull(),
  sessionType: text("session_type").notNull(), // "individual" or "group"
  groupId: text("group_id"), // for group sessions
  questionsAnswered: integer("questions_answered").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  finalScore: integer("final_score").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const adInteractions = pgTable("ad_interactions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => gameSessions.id),
  haunt: text("haunt").notNull(),
  adIndex: integer("ad_index").notNull(),
  action: text("action").notNull(), // "view" or "click"
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const questionPerformance = pgTable("question_performance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => gameSessions.id),
  haunt: text("haunt").notNull(),
  questionText: text("question_text").notNull(),
  questionPack: text("question_pack").notNull(), // "basic", "advanced", "elite"
  wasCorrect: boolean("was_correct").notNull(),
  timeToAnswer: integer("time_to_answer"), // milliseconds
  timestamp: timestamp("timestamp").notNull().defaultNow(),
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

export const insertHauntConfigSchema = createInsertSchema(hauntConfigs).pick({
  id: true,
  name: true,
  description: true,
  logoPath: true,
  triviaFile: true,
  adFile: true,
  mode: true,
  tier: true,
  isActive: true,
  isPublished: true,
  authCode: true,
  themeData: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  playerId: true,
  haunt: true,
  sessionType: true,
  groupId: true,
  questionsAnswered: true,
  correctAnswers: true,
  finalScore: true,
  completedAt: true,
});

export const insertAdInteractionSchema = createInsertSchema(adInteractions).pick({
  sessionId: true,
  haunt: true,
  adIndex: true,
  action: true,
});

export const insertQuestionPerformanceSchema = createInsertSchema(questionPerformance).pick({
  sessionId: true,
  haunt: true,
  questionText: true,
  questionPack: true,
  wasCorrect: true,
  timeToAnswer: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntryDb = typeof leaderboardEntries.$inferSelect;
export type InsertHauntConfig = z.infer<typeof insertHauntConfigSchema>;
export type HauntConfigDb = typeof hauntConfigs.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSessionDb = typeof gameSessions.$inferSelect;
export type InsertAdInteraction = z.infer<typeof insertAdInteractionSchema>;
export type AdInteractionDb = typeof adInteractions.$inferSelect;
export type InsertQuestionPerformance = z.infer<typeof insertQuestionPerformanceSchema>;
export type QuestionPerformanceDb = typeof questionPerformance.$inferSelect;

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
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  authCode: z.string().optional(), // Legacy: keep for backward compatibility
  authorizedEmails: z.array(z.string().email()).optional(), // New: authorized admin emails
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
  }),
  // CUSTOM SKIN & PROGRESS BAR LOGIC
  skinUrl: z.string().optional(), // Pro/Premium only: custom background image
  progressBarTheme: z.string().optional(), // Pro/Premium only: progress bar color theme
});

export const adDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
  duration: z.number().default(5000),
  timestamp: z.string().optional(),
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

// Sidequest schemas
export const sidequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert", "Impossible"]),
  estimatedTime: z.string(),
  componentType: z.string(),
  config: z.record(z.any()),
  isActive: z.boolean().default(true),
  requiredTier: z.enum(["Basic", "Pro", "Premium"]).default("Basic"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sidequestProgressSchema = z.object({
  sidequestId: z.string(),
  hauntId: z.string(),
  playerId: z.string().optional(),
  sessionId: z.string(),
  completed: z.boolean().default(false),
  score: z.number().default(0),
  timeSpent: z.number().default(0),
  data: z.record(z.any()).default({}),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export type Sidequest = z.infer<typeof sidequestSchema>;
export type SidequestProgress = z.infer<typeof sidequestProgressSchema>;
