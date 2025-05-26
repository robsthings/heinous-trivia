import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public directory
  app.use("/", express.static(path.resolve(process.cwd(), "client", "public")));

  // API route to get haunt configuration (tries Firebase first, falls back to JSON files)
  app.get("/api/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      // Try Firebase first
      try {
        const firebaseConfig = await storage.getHauntConfig(hauntId);
        if (firebaseConfig) {
          return res.json(firebaseConfig);
        }
      } catch (firebaseError) {
        console.log("Firebase unavailable, falling back to JSON files");
      }
      
      // Fallback to JSON files
      const configPath = path.resolve(process.cwd(), "client", "public", "haunt-config", `${hauntId}.json`);
      
      if (!fs.existsSync(configPath)) {
        return res.status(404).json({ error: `Haunt configuration for '${hauntId}' not found` });
      }

      const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      res.json(configData);
    } catch (error) {
      res.status(500).json({ error: "Failed to load haunt configuration" });
    }
  });

  // API route to get trivia questions
  app.get("/api/questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const questionsPath = path.resolve(process.cwd(), "client", "public", "questions", `${hauntId}-trivia.json`);
      
      if (!fs.existsSync(questionsPath)) {
        return res.status(404).json({ error: `Trivia questions for '${hauntId}' not found` });
      }

      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      res.json(questionsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to load trivia questions" });
    }
  });

  // API route to get ad data
  app.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const adsPath = path.resolve(process.cwd(), "client", "public", "haunt-config", `${hauntId}-ads.json`);
      
      if (!fs.existsSync(adsPath)) {
        return res.status(404).json({ error: `Ad data for '${hauntId}' not found` });
      }

      const adsData = JSON.parse(fs.readFileSync(adsPath, "utf-8"));
      res.json(adsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to load ad data" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
