import { users, leaderboardEntries, hauntConfigs, type User, type InsertUser, type InsertLeaderboardEntry, type LeaderboardEntryDb, type HauntConfig, type InsertHauntConfig, type HauntConfigDb } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
