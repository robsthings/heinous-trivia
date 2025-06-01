import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Specific route for launcher (without .html extension) - must come before static serving
  app.get("/launcher", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "public", "launcher.html"));
  });

  // Serve static files from client/public directory
  app.use("/", express.static(path.resolve(process.cwd(), "client", "public")));



  // API route to save leaderboard entry
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const entry = req.body;
      const savedEntry = await storage.saveLeaderboardEntry(entry);
      res.json(savedEntry);
    } catch (error) {
      console.error("Failed to save leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save leaderboard entry" });
    }
  });

  // API route to get leaderboard (hybrid: Firebase + PostgreSQL)
  app.get("/api/leaderboard/:hauntId?", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      // Get entries from both sources
      const dbEntries = await storage.getLeaderboard(hauntId);
      
      let firebaseEntries = [];
      try {
        if (hauntId) {
          const { FirebaseService } = await import("./firebase");
          firebaseEntries = await FirebaseService.getLeaderboard(hauntId);
        }
      } catch (firebaseError) {
        console.log("Firebase unavailable for leaderboard");
      }
      
      // Combine and sort entries
      const allEntries = [...dbEntries, ...firebaseEntries]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      res.json(allEntries);
    } catch (error) {
      console.error("Failed to get leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // API route to save haunt configuration to Firebase
  app.post("/api/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = req.body;
      const savedConfig = await storage.saveHauntConfig(hauntId, config);
      res.json(savedConfig);
    } catch (error) {
      console.error("Failed to save haunt configuration:", error);
      res.status(500).json({ error: "Failed to save haunt configuration" });
    }
  });

  // API route to get all haunts
  app.get("/api/haunts", async (req, res) => {
    try {
      const { FirebaseService } = await import("./firebase");
      const haunts = await FirebaseService.getAllHaunts();
      res.json(haunts);
    } catch (error) {
      console.error("Failed to get haunts:", error);
      res.status(500).json({ error: "Failed to get haunts" });
    }
  });

  // API route to get analytics data (Pro/Premium feature)
  app.get("/api/analytics/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { timeRange } = req.query;
      
      // For now, return structure with zero values until data collection is implemented
      // This shows the dashboard structure for Pro/Premium members
      const analyticsData = {
        totalGames: 0,
        uniquePlayers: 0,
        returnPlayerRate: 0,
        adClickThrough: 0,
        bestQuestions: [],
        competitiveMetrics: {
          averageScore: 0,
          topScore: 0,
          participationRate: 0,
        },
        averageGroupSize: 0,
        timeRangeData: {
          daily: [],
          weekly: [],
        },
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Failed to get analytics data:", error);
      res.status(500).json({ error: "Failed to get analytics data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
