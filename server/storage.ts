import { users, leaderboardEntries, type User, type InsertUser, type InsertLeaderboardEntry, type LeaderboardEntryDb } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
