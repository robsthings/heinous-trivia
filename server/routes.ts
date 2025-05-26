import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public directory
  app.use("/", express.static(path.resolve(process.cwd(), "client", "public")));

  // API route to get haunt configuration
  app.get("/api/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
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

  // API route to get leaderboard
  app.get("/api/leaderboard/:hauntId?", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const entries = await storage.getLeaderboard(hauntId);
      res.json(entries);
    } catch (error) {
      console.error("Failed to get leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
