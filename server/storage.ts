import { users, leaderboardEntries, hauntConfigs, gameSessions, adInteractions, questionPerformance, type User, type InsertUser, type InsertLeaderboardEntry, type LeaderboardEntryDb, type HauntConfig, type InsertHauntConfig, type HauntConfigDb, type InsertGameSession, type GameSessionDb, type InsertAdInteraction, type InsertQuestionPerformance } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntryDb>;
  getLeaderboard(haunt?: string): Promise<LeaderboardEntryDb[]>;
  saveHauntConfig(hauntId: string, config: HauntConfig): Promise<HauntConfig>;
  getHauntConfig(hauntId: string): Promise<HauntConfig | null>;
  // Analytics tracking methods
  createGameSession(session: InsertGameSession): Promise<GameSessionDb>;
  updateGameSession(sessionId: number, updates: Partial<InsertGameSession>): Promise<void>;
  trackAdInteraction(interaction: InsertAdInteraction): Promise<void>;
  trackQuestionPerformance(performance: InsertQuestionPerformance): Promise<void>;
  getAnalyticsData(hauntId: string, timeRange: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntryDb> {
    const [savedEntry] = await db
      .insert(leaderboardEntries)
      .values(entry)
      .returning();
    return savedEntry;
  }

  async getLeaderboard(haunt?: string): Promise<LeaderboardEntryDb[]> {
    if (haunt) {
      return await db.select()
        .from(leaderboardEntries)
        .where(eq(leaderboardEntries.haunt, haunt))
        .orderBy(desc(leaderboardEntries.score))
        .limit(10);
    }
    
    return await db.select()
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.score))
      .limit(10);
  }

  async saveHauntConfig(hauntId: string, config: HauntConfig): Promise<HauntConfig> {
    const insertData: InsertHauntConfig = {
      id: hauntId,
      name: config.name,
      description: config.description,
      logoPath: config.logoPath || "",
      triviaFile: config.triviaFile || "",
      adFile: config.adFile || "",
      mode: config.mode,
      tier: config.tier,
      isActive: config.isActive,
      isPublished: config.isPublished ?? true,
      authCode: config.authCode,
      themeData: JSON.stringify(config.theme),
    };

    await db.insert(hauntConfigs)
      .values(insertData)
      .onConflictDoUpdate({
        target: hauntConfigs.id,
        set: {
          name: config.name,
          description: config.description,
          logoPath: config.logoPath || "",
          triviaFile: config.triviaFile || "",
          adFile: config.adFile || "",
          mode: config.mode,
          tier: config.tier,
          isActive: config.isActive,
          isPublished: config.isPublished ?? true,
          authCode: config.authCode,
          themeData: JSON.stringify(config.theme),
          updatedAt: new Date(),
        }
      });

    return config;
  }

  async getHauntConfig(hauntId: string): Promise<HauntConfig | null> {
    const [result] = await db.select().from(hauntConfigs).where(eq(hauntConfigs.id, hauntId));
    
    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      logoPath: result.logoPath,
      triviaFile: result.triviaFile,
      adFile: result.adFile,
      mode: (result.mode === "queue" ? "queue" : "individual") as "individual" | "queue",
      tier: (["basic", "pro", "premium"].includes(result.tier) ? result.tier : "basic") as "basic" | "pro" | "premium",
      isActive: result.isActive,
      isPublished: result.isPublished,
      authCode: result.authCode ?? undefined,
      theme: JSON.parse(result.themeData),
    };
  }

  // Analytics tracking implementation
  async createGameSession(session: InsertGameSession): Promise<GameSessionDb> {
    const [newSession] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateGameSession(sessionId: number, updates: Partial<InsertGameSession>): Promise<void> {
    await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.id, sessionId));
  }

  async trackAdInteraction(interaction: InsertAdInteraction): Promise<void> {
    await db.insert(adInteractions).values(interaction);
  }

  async trackQuestionPerformance(performance: InsertQuestionPerformance): Promise<void> {
    await db.insert(questionPerformance).values(performance);
  }

  async getAnalyticsData(hauntId: string, timeRange: string): Promise<any> {
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get total games and unique players
    const sessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.haunt, hauntId));

    const recentSessions = sessions.filter(s => new Date(s.startedAt) >= startDate);
    const uniquePlayers = new Set(recentSessions.map(s => s.playerId)).size;
    
    // Calculate return player rate
    const allPlayerIds = Array.from(new Set(sessions.map(s => s.playerId)));
    const returnPlayers = allPlayerIds.filter(playerId => 
      sessions.filter(s => s.playerId === playerId).length > 1
    ).length;
    const returnPlayerRate = allPlayerIds.length > 0 ? Math.round((returnPlayers / allPlayerIds.length) * 100) : 0;

    // Get ad interaction data
    const adViews = await db
      .select()
      .from(adInteractions)
      .where(eq(adInteractions.haunt, hauntId));
    
    const recentAdViews = adViews.filter(a => new Date(a.timestamp) >= startDate);
    const totalViews = recentAdViews.filter(a => a.action === 'view').length;
    const totalClicks = recentAdViews.filter(a => a.action === 'click').length;
    const adClickThrough = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

    // Get question performance
    const questionData = await db
      .select()
      .from(questionPerformance)
      .where(eq(questionPerformance.haunt, hauntId));

    const recentQuestions = questionData.filter(q => new Date(q.timestamp) >= startDate);
    const questionStats = recentQuestions.reduce((acc, q) => {
      if (!acc[q.questionText]) {
        acc[q.questionText] = { total: 0, correct: 0, pack: q.questionPack };
      }
      acc[q.questionText].total++;
      if (q.wasCorrect) acc[q.questionText].correct++;
      return acc;
    }, {} as Record<string, { total: number; correct: number; pack: string }>);

    const bestQuestions = Object.entries(questionStats)
      .map(([question, stats]) => ({
        question,
        correctRate: Math.round((stats.correct / stats.total) * 100),
        pack: stats.pack
      }))
      .sort((a, b) => b.correctRate - a.correctRate)
      .slice(0, 5);

    // Calculate competitive metrics
    const completedSessions = recentSessions.filter(s => s.completedAt);
    const averageScore = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + s.finalScore, 0) / completedSessions.length)
      : 0;
    const topScore = completedSessions.length > 0 
      ? Math.max(...completedSessions.map(s => s.finalScore))
      : 0;
    const participationRate = recentSessions.length > 0 
      ? Math.round((completedSessions.length / recentSessions.length) * 100)
      : 0;

    // Calculate average group size
    const groupSessions = recentSessions.filter(s => s.sessionType === 'group');
    const averageGroupSize = groupSessions.length > 0 
      ? Math.round(groupSessions.length / new Set(groupSessions.map(s => s.groupId)).size)
      : 0;

    return {
      totalGames: recentSessions.length,
      uniquePlayers,
      returnPlayerRate,
      adClickThrough,
      bestQuestions,
      competitiveMetrics: {
        averageScore,
        topScore,
        participationRate,
      },
      averageGroupSize,
      timeRangeData: {
        daily: [],
        weekly: [],
      },
    };
  }
}

export const storage = new DatabaseStorage();
