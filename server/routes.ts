import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { FirebaseService } from "./firebase";
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
      
      const analyticsData = await FirebaseService.getAnalyticsData(hauntId, timeRange as string || '30d');
      res.json(analyticsData);
    } catch (error) {
      console.error("Failed to get analytics data:", error);
      res.status(500).json({ error: "Failed to get analytics data" });
    }
  });

  // API routes for tracking analytics events
  app.post("/api/analytics/session", async (req, res) => {
    try {
      const { hauntId, ...sessionData } = req.body;
      const session = await FirebaseService.saveGameSession(hauntId, sessionData);
      res.json(session);
    } catch (error) {
      console.error("Failed to create game session:", error);
      res.status(500).json({ error: "Failed to create game session" });
    }
  });

  app.put("/api/analytics/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await FirebaseService.updateGameSession(sessionId, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update game session:", error);
      res.status(500).json({ error: "Failed to update game session" });
    }
  });

  app.post("/api/analytics/ad-interaction", async (req, res) => {
    try {
      const { hauntId, ...interactionData } = req.body;
      await FirebaseService.saveAdInteraction(hauntId, interactionData);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track ad interaction:", error);
      res.status(500).json({ error: "Failed to track ad interaction" });
    }
  });

  app.post("/api/analytics/question-performance", async (req, res) => {
    try {
      const { hauntId, ...performanceData } = req.body;
      await FirebaseService.saveQuestionPerformance(hauntId, performanceData);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track question performance:", error);
      res.status(500).json({ error: "Failed to track question performance" });
    }
  });

  // Dynamic manifest generation for PWA
  app.get("/api/manifest/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await storage.getHauntConfig(hauntId);
      
      const manifest = {
        name: config?.name || "Heinous Trivia",
        short_name: config?.name || "Heinous",
        description: config?.description || "Horror-themed trivia game hosted by the villainous Dr. Heinous",
        theme_color: config?.theme?.primaryColor || "#8B0000",
        background_color: "#0A0A0A",
        display: "standalone",
        scope: "/",
        start_url: `/launcher/${hauntId}`,
        orientation: "portrait-primary",
        categories: ["games", "entertainment", "trivia"],
        icons: [
          {
            src: "/icons/icon-128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        screenshots: [
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow"
          }
        ]
      };

      res.setHeader('Content-Type', 'application/manifest+json');
      res.json(manifest);
    } catch (error) {
      console.error("Error generating manifest:", error);
      res.status(500).json({ error: "Failed to generate manifest" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
