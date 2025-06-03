import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { FirebaseService, firestore, FieldValue } from "./firebase";
import { hauntConfigSchema, leaderboardEntrySchema } from "@shared/schema";
import path from "path";
import multer from "multer";

// Configure multer for memory storage (for Firebase upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Specific route for launcher (without .html extension) - must come before static serving
  app.get("/launcher", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "public", "launcher.html"));
  });

  // Upload background image for haunt
  app.post("/api/upload-background", (req, res) => {
    console.log("📁 Upload endpoint hit");
    
    upload.single('background')(req, res, async (err) => {
      try {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          console.log("❌ No file uploaded");
          return res.status(400).json({ error: "No file uploaded" });
        }

        const hauntId = req.body.hauntId;
        if (!hauntId) {
          console.log("❌ No haunt ID provided");
          return res.status(400).json({ error: "Haunt ID is required" });
        }

        console.log("✅ File uploaded:", req.file.filename, "for haunt:", hauntId);
        const relativePath = `/haunt-assets/${hauntId}/bg${path.extname(req.file.originalname)}`;
        
        res.json({ 
          success: true, 
          path: relativePath,
          message: "Background uploaded successfully"
        });
      } catch (error) {
        console.error("Error uploading background:", error);
        res.status(500).json({ error: "Failed to upload background" });
      }
    });
  });

  // Save leaderboard entry
  app.post("/api/leaderboard/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const entryData = leaderboardEntrySchema.parse(req.body);
      
      const entry = await FirebaseService.saveLeaderboardEntry(hauntId, entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error saving leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save leaderboard entry" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const leaderboard = await FirebaseService.getLeaderboard(hauntId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get haunt configuration
  app.get("/api/haunt-config/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await FirebaseService.getHauntConfig(hauntId);
      res.json(config);
    } catch (error) {
      console.error("Error fetching haunt config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  // Initialize database with sample data
  app.post("/api/initialize-data", async (req, res) => {
    try {
      // Create initial trivia pack
      await FirebaseService.saveHauntConfig('trivia-packs/horror-basics', {
        accessType: 'all',
        name: 'Horror Basics',
        description: 'Classic horror trivia',
        questions: [
          {
            question: "Which horror movie features the character Freddy Krueger?",
            choices: ["Halloween", "Friday the 13th", "A Nightmare on Elm Street", "Scream"],
            correct: "A Nightmare on Elm Street",
            explanation: "Freddy Krueger is the main antagonist of the A Nightmare on Elm Street series."
          },
          {
            question: "What is the name of the hotel in Stephen King's 'The Shining'?",
            choices: ["Bates Motel", "The Overlook Hotel", "Hotel California", "The Stanley Hotel"],
            correct: "The Overlook Hotel",
            explanation: "The Overlook Hotel is the haunted location where the Torrance family stays."
          },
          {
            question: "In which movie does the phrase 'Here's Johnny!' appear?",
            choices: ["Psycho", "The Shining", "Halloween", "The Exorcist"],
            correct: "The Shining",
            explanation: "Jack Nicholson's character says this iconic line in The Shining."
          }
        ]
      });

      // Create sample haunt configs
      await FirebaseService.saveHauntConfig('widowshollow', {
        name: "Widow's Hollow",
        theme: "Victorian Gothic",
        primaryColor: "#8B0000",
        secondaryColor: "#2F1B14",
        tier: "premium",
        logo: "/icons/icon-192.png"
      });

      await FirebaseService.saveHauntConfig('headquarters', {
        name: "Dr. Heinous HQ",
        theme: "Classic Horror",
        primaryColor: "#8B0000",
        secondaryColor: "#2F1B14",
        tier: "basic",
        logo: "/icons/icon-192.png"
      });

      res.json({ success: true, message: "Initial data created" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ error: "Failed to initialize data" });
    }
  });

  // Save haunt configuration
  app.post("/api/haunt-config/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = hauntConfigSchema.parse(req.body);
      
      await FirebaseService.saveHauntConfig(hauntId, config);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving haunt config:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // Host panel - start new round
  app.post("/api/host/:hauntId/start-round", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const roundData = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const roundRef = firestore.collection('activeRound').doc(hauntId);
      await roundRef.set(roundData);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error starting round:", error);
      res.status(500).json({ error: "Failed to start round" });
    }
  });

  // Host panel - update round
  app.put("/api/host/:hauntId/round", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const updates = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const roundRef = firestore.collection('activeRound').doc(hauntId);
      await roundRef.update(updates);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating round:", error);
      res.status(500).json({ error: "Failed to update round" });
    }
  });

  // Host panel - get active round
  app.get("/api/host/:hauntId/round", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const roundRef = firestore.collection('activeRound').doc(hauntId);
      const roundDoc = await roundRef.get();
      
      if (roundDoc.exists) {
        res.json(roundDoc.data());
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error getting round:", error);
      res.status(500).json({ error: "Failed to get round" });
    }
  });

  // Track ad metrics
  app.post("/api/ad-metrics/:hauntId/:adIndex/:metric", async (req, res) => {
    try {
      const { hauntId, adIndex, metric } = req.params;
      
      if (!firestore || !['views', 'clicks'].includes(metric)) {
        throw new Error('Invalid request');
      }
      
      const metricsRef = firestore.collection('ad-metrics').doc(hauntId).collection('ads').doc(`ad${adIndex}`);
      const doc = await metricsRef.get();
      
      if (doc.exists) {
        await metricsRef.update({ [metric]: (doc.data()[metric] || 0) + 1 });
      } else {
        await metricsRef.set({
          views: metric === 'views' ? 1 : 0,
          clicks: metric === 'clicks' ? 1 : 0
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad metric:", error);
      res.status(500).json({ error: "Failed to track ad metric" });
    }
  });

  // Submit group game answer
  app.post("/api/group/:hauntId/answer", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { playerId, playerName, questionIndex, answerIndex, isCorrect } = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Update round with player answer and name
      const roundRef = firestore.collection('activeRound').doc(hauntId);
      await roundRef.update({
        [`currentAnswers.${playerId}`]: answerIndex,
        [`playerScores.${playerId}`]: FieldValue.increment(isCorrect ? 100 : 0),
        [`playerNames.${playerId}`]: playerName
      });
      
      // Also save to leaderboards collection for persistent tracking
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players').doc(playerId);
      const playerDoc = await leaderboardRef.get();
      
      if (playerDoc.exists) {
        const currentData = playerDoc.data();
        await leaderboardRef.update({
          score: currentData.score + (isCorrect ? 100 : 0),
          questionsAnswered: currentData.questionsAnswered + 1,
          correctAnswers: currentData.correctAnswers + (isCorrect ? 1 : 0),
          lastPlayed: new Date()
        });
      } else {
        await leaderboardRef.set({
          playerName,
          playerId,
          score: isCorrect ? 100 : 0,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          hauntId,
          createdAt: new Date(),
          lastPlayed: new Date()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error submitting group answer:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // Save individual game score to leaderboard
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { name, score, haunt, questionsAnswered, correctAnswers } = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Generate a unique player ID for individual games
      const playerId = `individual_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to leaderboards collection
      const leaderboardRef = firestore.collection('leaderboards').doc(haunt).collection('players').doc(playerId);
      await leaderboardRef.set({
        playerName: name,
        playerId,
        score,
        questionsAnswered,
        correctAnswers,
        hauntId: haunt,
        gameType: 'individual',
        createdAt: new Date(),
        lastPlayed: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save score" });
    }
  });

  // Get leaderboard for moderation
  app.get("/api/leaderboard/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players');
      const snapshot = await leaderboardRef.orderBy('score', 'desc').limit(50).get();
      
      const players = snapshot.docs.map(doc => doc.data());
      
      res.json(players);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Moderate player (hide from public leaderboards permanently)
  app.post("/api/moderate/:hauntId/:playerId", async (req, res) => {
    try {
      const { hauntId, playerId } = req.params;
      const { hidden } = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Update player's hidden status in leaderboard
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players').doc(playerId);
      await leaderboardRef.update({
        hidden: hidden,
        moderatedAt: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error moderating player:", error);
      res.status(500).json({ error: "Failed to moderate player" });
    }
  });

  // Get all haunts
  app.get("/api/haunts", async (req, res) => {
    try {
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

  // Global analytics for admin panel
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const { timeRange } = req.query;
      const haunts = await FirebaseService.getAllHaunts();
      
      const globalAnalytics: {
        totalHaunts: number;
        proHaunts: number;
        premiumHaunts: number;
        hauntBreakdown: any[];
      } = {
        totalHaunts: haunts.length,
        proHaunts: haunts.filter((h: any) => h.tier === 'pro').length,
        premiumHaunts: haunts.filter((h: any) => h.tier === 'premium').length,
        hauntBreakdown: []
      };

      // Get analytics for each haunt
      for (const haunt of haunts) {
        try {
          const hauntAnalytics = await FirebaseService.getAnalyticsData((haunt as any).id, timeRange as string || '30d');
          globalAnalytics.hauntBreakdown.push({
            hauntId: (haunt as any).id,
            name: (haunt as any).name || (haunt as any).id,
            tier: (haunt as any).tier || 'basic',
            ...hauntAnalytics
          });
        } catch (error) {
          console.warn(`Failed to get analytics for haunt ${(haunt as any).id}:`, error);
        }
      }

      res.json(globalAnalytics);
    } catch (error) {
      console.error("Failed to get global analytics:", error);
      res.status(500).json({ error: "Failed to get global analytics" });
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
      const config = await FirebaseService.getHauntConfig(hauntId);
      
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