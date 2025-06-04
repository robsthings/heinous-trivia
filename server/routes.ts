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
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
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
        questions: [
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
      
      const db = FirebaseService.getFirestore();
      const roundRef = db.collection('activeRound').doc(hauntId);
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
      
      const db = FirebaseService.getFirestore();
      const roundRef = db.collection('activeRound').doc(hauntId);
      
      // If status is changing to "reveal", award pending points
      if (updates.status === "reveal") {
        const roundDoc = await roundRef.get();
        if (roundDoc.exists) {
          const roundData = roundDoc.data();
          const { pendingPoints = {}, playerScores = {} } = roundData as any;
          
          // Calculate updated scores
          const updatedScores: Record<string, number> = { ...playerScores };
          Object.entries(pendingPoints).forEach(([playerId, points]) => {
            updatedScores[playerId] = (updatedScores[playerId] || 0) + Number(points);
          });
          
          // Update scores using dot notation and clear pending points
          Object.entries(updatedScores).forEach(([playerId, score]) => {
            (updates as any)[`playerScores.${playerId}`] = score;
          });
          
          Object.keys(pendingPoints).forEach(playerId => {
            (updates as any)[`pendingPoints.${playerId}`] = 0; // Clear pending points after awarding
          });
        }
      }
      
      await roundRef.update(updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating round:", error);
      res.status(500).json({ error: "Failed to update round" });
    }
  });

  // Host panel - get current round
  app.get("/api/host/:hauntId/round", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      const db = FirebaseService.getFirestore();
      const roundRef = db.collection('activeRound').doc(hauntId);
      const doc = await roundRef.get();
      
      if (doc.exists) {
        res.json(doc.data());
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error getting round:", error);
      res.status(500).json({ error: "Failed to get round data" });
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

  // Update haunt subscription/settings
  app.patch("/api/haunt/:hauntId/subscription", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const updates = req.body;
      
      const db = FirebaseService.getFirestore();
      const hauntRef = db.collection('haunts').doc(hauntId);
      await hauntRef.update(updates);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update haunt subscription:", error);
      res.status(500).json({ error: "Failed to update haunt subscription" });
    }
  });

  // Delete haunt
  app.delete("/api/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      const db = FirebaseService.getFirestore();
      const hauntRef = db.collection('haunts').doc(hauntId);
      await hauntRef.delete();
      
      // Also delete related data
      try {
        const questionsRef = db.collection('trivia-custom').doc(hauntId).collection('questions');
        const questionsSnapshot = await questionsRef.get();
        const deletePromises = questionsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('No custom questions to delete');
      }

      try {
        const adsRef = db.collection('haunt-ads').doc(hauntId).collection('ads');
        const adsSnapshot = await adsRef.get();
        const deletePromises = adsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      } catch (error) {
        console.warn('No ads to delete');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete haunt:", error);
      res.status(500).json({ error: "Failed to delete haunt" });
    }
  });

  // Reset haunt access code
  app.patch("/api/haunt/:hauntId/reset-access-code", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      const db = FirebaseService.getFirestore();
      const hauntRef = db.collection('haunts').doc(hauntId);
      await hauntRef.update({
        authCode: null,
        authCodeResetAt: new Date().toISOString(),
        authCodeResetBy: 'uber-admin'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to reset access code:", error);
      res.status(500).json({ error: "Failed to reset access code" });
    }
  });

  // Get trivia packs
  app.get("/api/trivia-packs", async (req, res) => {
    try {
      const db = FirebaseService.getFirestore();
      const packsRef = db.collection('trivia-packs');
      const snapshot = await packsRef.get();
      
      const packs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        packs.push({
          id: doc.id,
          name: data.name || 'Unnamed Pack',
          description: data.description || '',
          questions: data.questions || [],
          accessType: data.accessType || 'all',
          allowedTiers: data.allowedTiers || [],
          allowedHaunts: data.allowedHaunts || []
        });
      });
      
      res.json(packs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Failed to get trivia packs:", error);
      res.status(500).json({ error: "Failed to get trivia packs" });
    }
  });

  // Create trivia pack
  app.post("/api/trivia-packs", async (req, res) => {
    try {
      const packData = req.body;
      
      const db = FirebaseService.getFirestore();
      const packsRef = db.collection('trivia-packs');
      
      let docRef;
      if (packData.name === "starter-pack") {
        docRef = packsRef.doc('starter-pack');
        await docRef.set(packData);
      } else {
        docRef = await packsRef.add(packData);
      }
      
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error("Failed to create trivia pack:", error);
      res.status(500).json({ error: "Failed to create trivia pack" });
    }
  });

  // Get default ads
  app.get("/api/default-ads", async (req, res) => {
    try {
      const db = FirebaseService.getFirestore();
      const adsRef = db.collection('default-ads');
      const snapshot = await adsRef.get();
      
      const ads: any[] = [];
      snapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() });
      });
      
      res.json(ads);
    } catch (error) {
      console.error("Failed to get default ads:", error);
      res.status(500).json({ error: "Failed to get default ads" });
    }
  });

  // Save default ads
  app.post("/api/default-ads", async (req, res) => {
    try {
      const adsData = req.body;
      
      const db = FirebaseService.getFirestore();
      const adsRef = db.collection('default-ads');
      
      // Clear existing default ads
      const existingAds = await adsRef.get();
      for (const adDoc of existingAds.docs) {
        await adDoc.ref.delete();
      }
      
      // Save new default ads
      for (const ad of adsData) {
        await adsRef.add({
          title: ad.title || "Default Ad",
          description: ad.description || "Discover more!",
          link: ad.link || "#",
          imageUrl: ad.imageUrl,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save default ads:", error);
      res.status(500).json({ error: "Failed to save default ads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}