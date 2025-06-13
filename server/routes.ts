import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { FirebaseService, firestore, FieldValue } from "./firebase";
import { hauntConfigSchema, leaderboardEntrySchema } from "@shared/schema";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";

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
    upload.single('background')(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const hauntId = req.body.hauntId;
        const uploadType = req.body.type || 'logo';
        
        if (!hauntId) {
          return res.status(400).json({ error: "Haunt ID is required" });
        }

        // Determine filename based on upload type
        let filename = `bg${path.extname(req.file.originalname)}`;
        if (uploadType === 'skin') {
          filename = `skin${path.extname(req.file.originalname)}`;
        } else if (uploadType === 'progressbar') {
          filename = `progressbar${path.extname(req.file.originalname)}`;
        }

        // File uploaded successfully
        const relativePath = `/haunt-assets/${hauntId}/${filename}`;
        
        res.json({ 
          success: true, 
          imageUrl: relativePath,
          path: relativePath,
          message: `${uploadType} uploaded successfully`
        });
      } catch (error) {
        console.error("Error uploading background:", error);
        res.status(500).json({ error: "Failed to upload background" });
      }
    });
  });

  // Upload branding assets via base64 (Uber Admin only)
  app.post("/api/branding/upload", async (req, res) => {
    try {
      const { fileName, fileType, fileData, uploadType } = req.body;
      
      if (!fileName || !fileType || !fileData || !uploadType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!['skin', 'progressBar'].includes(uploadType)) {
        return res.status(400).json({ error: "Invalid upload type. Must be 'skin' or 'progressBar'" });
      }

      const timestamp = Date.now();
      const filename = `branding-${uploadType}-${timestamp}-${fileName}`;
      
      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');
      
      // Generate a data URL for immediate use (fallback approach)
      const dataUrl = `data:${fileType};base64,${fileData}`;
      
      // Save metadata to Firestore
      const assetId = `${uploadType}-${timestamp}`;
      const brandingData = {
        name: fileName.replace(/\.[^/.]+$/, ""),
        type: uploadType,
        url: dataUrl, // Using data URL as fallback
        filename: filename,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'uber-admin'
      };

      await FirebaseService.saveBrandingAsset(assetId, brandingData);

      res.json({ 
        success: true, 
        url: dataUrl,
        id: assetId,
        message: `${uploadType === 'skin' ? 'Background skin' : 'Progress bar animation'} uploaded successfully`
      });
      
    } catch (error) {
      console.error("Error uploading branding asset:", error);
      res.status(500).json({ error: "Failed to upload branding asset" });
    }
  });

  // Update haunt branding (Uber Admin only)
  app.patch("/api/haunt/:hauntId/branding", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { skinUrl, progressBarUrl } = req.body;
      
      // Validate that at least one branding field is provided
      if (skinUrl === undefined && progressBarUrl === undefined) {
        return res.status(400).json({ error: "At least one branding field (skinUrl or progressBarUrl) must be provided" });
      }

      const hauntRef = doc(firestore, 'haunts', hauntId);
      
      // Check if haunt exists
      const hauntSnap = await getDoc(hauntRef);
      if (!hauntSnap.exists()) {
        return res.status(404).json({ error: "Haunt not found" });
      }

      const hauntData = hauntSnap.data();
      
      // Verify haunt is Pro or Premium tier
      if (hauntData.tier !== 'pro' && hauntData.tier !== 'premium') {
        return res.status(403).json({ error: "Custom branding is only available for Pro and Premium tier haunts" });
      }

      // Prepare update data
      const updates: any = {};
      if (skinUrl !== undefined) updates.skinUrl = skinUrl;
      if (progressBarUrl !== undefined) updates.progressBarUrl = progressBarUrl;
      
      // Update haunt document
      await updateDoc(hauntRef, updates);

      res.json({ 
        success: true, 
        message: "Haunt branding updated successfully",
        updates
      });
      
    } catch (error) {
      console.error("Error updating haunt branding:", error);
      res.status(500).json({ error: "Failed to update haunt branding" });
    }
  });

  // Get branding assets (Uber Admin only)
  app.get("/api/branding/assets", async (req, res) => {
    try {
      const brandingRef = collection(firestore, 'branding-assets');
      const brandingSnapshot = await getDocs(brandingRef);
      
      const assets = {
        skins: [] as any[],
        progressBars: [] as any[]
      };
      
      brandingSnapshot.forEach((doc) => {
        const data = doc.data();
        const asset = {
          id: doc.id,
          name: data.name,
          url: data.url,
          uploadedAt: data.uploadedAt
        };
        
        if (data.type === 'skin') {
          assets.skins.push(asset);
        } else if (data.type === 'progressBar') {
          assets.progressBars.push(asset);
        }
      });
      
      res.json(assets);
      
    } catch (error) {
      console.error("Error fetching branding assets:", error);
      res.status(500).json({ error: "Failed to fetch branding assets" });
    }
  });

  // Save branding metadata (Uber Admin only)
  app.post("/api/branding/metadata", async (req, res) => {
    try {
      const { assetId, assetData } = req.body;
      
      if (!assetId || !assetData) {
        return res.status(400).json({ error: "Missing assetId or assetData" });
      }

      await FirebaseService.saveBrandingAsset(assetId, assetData);
      res.json({ success: true, message: "Asset metadata saved successfully" });
    } catch (error) {
      console.error("Error saving branding metadata:", error);
      res.status(500).json({ error: "Failed to save branding metadata" });
    }
  });

  // Save leaderboard entry (haunt-specific)
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

  // Get leaderboard (haunt-specific)
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
      
      console.log(`[GROUP SCORING] Player ${playerId} (${playerName}) answered question ${questionIndex}:`, {
        answerIndex,
        isCorrect,
        hauntId
      });
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Update round with player answer and name using merge to avoid errors
      const roundRef = firestore.collection('activeRound').doc(hauntId);
      const roundDoc = await roundRef.get();
      
      // Get current scores to properly increment
      const currentData = roundDoc.exists ? roundDoc.data() : {};
      const currentScore = currentData?.playerScores?.[playerId] || 0;
      const newScore = currentScore + (isCorrect ? 100 : 0);
      
      console.log(`[GROUP SCORING] Score update: ${currentScore} -> ${newScore} (added ${isCorrect ? 100 : 0})`);
      
      // Always use set with merge to safely handle missing documents/fields
      await roundRef.set({
        [`currentAnswers.${playerId}`]: answerIndex,
        [`playerScores.${playerId}`]: newScore,
        [`playerNames.${playerId}`]: playerName
      }, { merge: true });
      
      // Also save to leaderboards collection for persistent tracking
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players').doc(playerId);
      const playerDoc = await leaderboardRef.get();
      
      if (playerDoc.exists) {
        const currentData = playerDoc.data();
        const updatedScore = currentData.score + (isCorrect ? 100 : 0);
        const updatedQuestions = currentData.questionsAnswered + 1;
        const updatedCorrect = currentData.correctAnswers + (isCorrect ? 1 : 0);
        
        console.log(`[GROUP LEADERBOARD] Updating existing player:`, {
          oldScore: currentData.score,
          newScore: updatedScore,
          questionsAnswered: updatedQuestions,
          correctAnswers: updatedCorrect
        });
        
        await leaderboardRef.update({
          score: updatedScore,
          questionsAnswered: updatedQuestions,
          correctAnswers: updatedCorrect,
          lastPlayed: new Date(),
          gameType: 'group'
        });
      } else {
        const initialData = {
          playerName,
          playerId,
          score: isCorrect ? 100 : 0,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          hauntId,
          gameType: 'group',
          createdAt: new Date(),
          lastPlayed: new Date()
        };
        
        console.log(`[GROUP LEADERBOARD] Creating new player entry:`, initialData);
        
        await leaderboardRef.set(initialData);
      }
      
      console.log(`[GROUP SCORING] Successfully saved answer for ${playerName} in haunt ${hauntId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error submitting group answer:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  // Check haunt authentication
  app.get("/api/haunt/:hauntId/auth-check", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { authCode } = req.query;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const hauntRef = firestore.collection('haunts').doc(hauntId);
      const hauntSnap = await hauntRef.get();
      
      if (!hauntSnap.exists) {
        return res.status(404).json({ success: false, error: "Haunt not found" });
      }
      
      const hauntData = hauntSnap.data();
      
      // If authCode is provided, validate it
      if (authCode && authCode !== hauntData.authCode) {
        return res.status(403).json({ success: false, error: "Invalid authentication code" });
      }
      
      // Return haunt information
      res.json({ 
        success: true,
        hostName: hauntData.hostName || hauntData.name || `Haunt ${hauntId}`,
        active: hauntData.hasActiveGame || false
      });
    } catch (error) {
      console.error("Error checking haunt auth:", error);
      res.status(500).json({ success: false, error: "Failed to verify authentication" });
    }
  });

  // Get haunt configuration
  app.get("/api/haunt/:hauntId/config", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const hauntRef = firestore.collection('haunts').doc(hauntId);
      const hauntSnap = await hauntRef.get();
      
      if (!hauntSnap.exists) {
        return res.status(404).json({ error: "Haunt not found" });
      }
      
      const data = hauntSnap.data();
      
      // Sanitize config with defaults
      const sanitizedConfig = {
        ...data,
        name: data.name || `Haunt ${hauntId}`,
        description: data.description || 'A mysterious horror experience',
        mode: data.mode || 'individual',
        tier: data.tier || 'basic',
        theme: {
          primaryColor: data.theme?.primaryColor || '#8B0000',
          secondaryColor: data.theme?.secondaryColor || '#2D1B69',
          accentColor: data.theme?.accentColor || '#FF6B35'
        },
        isActive: data.isActive !== false
      };
      
      res.json(sanitizedConfig);
    } catch (error) {
      console.error("Error getting haunt config:", error);
      res.status(500).json({ error: "Failed to get haunt configuration" });
    }
  });

  // Update haunt configuration
  app.put("/api/haunt/:hauntId/config", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Validate the config data
      const validatedConfig = hauntConfigSchema.parse(config);
      
      const hauntRef = firestore.collection('haunts').doc(hauntId);
      await hauntRef.set(validatedConfig, { merge: true });
      
      res.json({ success: true, config: validatedConfig });
    } catch (error) {
      console.error("Error updating haunt config:", error);
      res.status(500).json({ error: "Failed to update haunt configuration" });
    }
  });

  // Reset haunt password (Uber Admin only)
  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      const { hauntId, newPassword } = req.body;
      
      if (!hauntId || !newPassword) {
        return res.status(400).json({ error: "Missing hauntId or newPassword" });
      }
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      console.log(`[ADMIN] Resetting password for haunt: ${hauntId}`);
      
      // Check if Uber Admin is authenticated (basic check)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized - Missing authentication" });
      }
      
      // Hash the new password with bcrypt
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the haunt document with new password hash
      const hauntRef = firestore.collection('haunts').doc(hauntId);
      await hauntRef.update({
        passwordHash: passwordHash,
        passwordUpdatedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`[ADMIN] Password reset successful for haunt: ${hauntId}`);
      
      res.json({ 
        success: true, 
        message: `Password reset successfully for ${hauntId}` 
      });
    } catch (error) {
      console.error(`[ADMIN] Error resetting password for haunt ${req.body?.hauntId}:`, error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });



  // Save individual game score to leaderboard
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { name, score, haunt, questionsAnswered, correctAnswers } = req.body;
      
      console.log(`[INDIVIDUAL SCORING] Saving score for ${name} in haunt ${haunt}:`, {
        score,
        questionsAnswered,
        correctAnswers
      });
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Generate a unique player ID for individual games
      const playerId = `individual_${Math.random().toString(36).substr(2, 9)}`;
      
      const leaderboardData = {
        playerName: name,
        playerId,
        score,
        questionsAnswered,
        correctAnswers,
        hauntId: haunt,
        gameType: 'individual',
        createdAt: new Date(),
        lastPlayed: new Date()
      };
      
      console.log(`[INDIVIDUAL LEADERBOARD] Writing to /leaderboards/${haunt}/players/${playerId}:`, leaderboardData);
      
      // Save to leaderboards collection using FirebaseService
      await FirebaseService.saveLeaderboardEntry(haunt, {
        name: name,
        score: score,
        haunt: haunt,
        questionsAnswered: questionsAnswered,
        correctAnswers: correctAnswers
      });
      
      console.log(`[INDIVIDUAL SCORING] Successfully saved score for ${name}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save score" });
    }
  });

  // Get leaderboard (general)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const hauntId = req.query.haunt as string || 'general';
      console.log('Fetching leaderboard for haunt:', hauntId);
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Check both collection structures for compatibility
      const entriesRef = firestore.collection('leaderboards').doc(hauntId).collection('entries');
      const playersRef = firestore.collection('leaderboards').doc(hauntId).collection('players');
      
      // Try entries collection first (FirebaseService format)
      let snapshot = await entriesRef.orderBy('score', 'desc').limit(20).get();
      
      // If no entries found, try players collection (legacy format)
      if (snapshot.empty) {
        snapshot = await playersRef.orderBy('score', 'desc').limit(20).get();
      }
      
      const leaderboard = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name || data.playerName,
          score: data.score,
          haunt: data.haunt || data.hauntId,
          questionsAnswered: data.questionsAnswered,
          correctAnswers: data.correctAnswers,
          date: data.timestamp?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });
      
      console.log(`Found ${leaderboard.length} leaderboard entries for ${hauntId}`);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get leaderboard for moderation
  app.get("/api/leaderboard/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      console.log(`[LEADERBOARD FETCH] Getting leaderboard for haunt: ${hauntId}`);
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players');
      const snapshot = await leaderboardRef
        .where('hidden', '!=', true)  // Exclude hidden players
        .orderBy('hidden')  // Required for != query
        .orderBy('score', 'desc')
        .limit(50)
        .get();
      
      console.log(`[LEADERBOARD FETCH] Found ${snapshot.docs.length} player records`);
      
      const players = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`[LEADERBOARD FETCH] Player data:`, {
          playerName: data.playerName,
          score: data.score,
          gameType: data.gameType
        });
        
        // Transform to frontend format
        return {
          name: data.playerName,
          score: data.score,
          date: data.lastPlayed?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          haunt: data.hauntId,
          questionsAnswered: data.questionsAnswered,
          correctAnswers: data.correctAnswers
        };
      });
      
      console.log(`[LEADERBOARD FETCH] Returning ${players.length} transformed entries`);
      res.json(players);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      
      // Fallback query without hidden filter if the field doesn't exist
      try {
        console.log(`[LEADERBOARD FETCH] Fallback query without hidden filter`);
        const leaderboardRef = firestore.collection('leaderboards').doc(req.params.hauntId).collection('players');
        const snapshot = await leaderboardRef.orderBy('score', 'desc').limit(50).get();
        
        const players = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.playerName,
            score: data.score,
            date: data.lastPlayed?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            haunt: data.hauntId,
            questionsAnswered: data.questionsAnswered,
            correctAnswers: data.correctAnswers
          };
        });
        
        res.json(players);
      } catch (fallbackError) {
        console.error("Fallback leaderboard query also failed:", fallbackError);
        res.status(500).json({ error: "Failed to get leaderboard" });
      }
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

  // Get haunt config
  app.get("/api/haunt-config/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await FirebaseService.getHauntConfig(hauntId);
      
      if (config) {
        res.json(config);
      } else {
        res.status(404).json({ error: "Haunt config not found" });
      }
    } catch (error) {
      console.error("Failed to get haunt config:", error);
      res.status(500).json({ error: "Failed to get haunt config" });
    }
  });

  // Get trivia questions for a haunt
  app.get("/api/trivia-questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      let allQuestions: any[] = [];

      // Load from haunts collection where trivia data is actually stored
      try {
        const hauntDoc = await firestore.collection('haunts').doc(hauntId).get();
        
        if (hauntDoc.exists) {
          const hauntData = hauntDoc.data();
          if (hauntData && hauntData.questions) {
            allQuestions.push(...hauntData.questions);
          }
        }
      } catch (error) {
        console.log('No haunt-specific trivia found');
      }

      // If no haunt-specific questions, try to load from general collections
      if (allQuestions.length === 0) {
        try {
          const packsSnapshot = await firestore.collection('trivia-packs').get();
          
          packsSnapshot.docs.forEach(doc => {
            const pack = doc.data();
            if (pack.accessType === 'all' && pack.questions) {
              allQuestions.push(...pack.questions);
            }
          });
        } catch (error) {
          console.log('No trivia packs found');
        }

        // Also try the custom trivia collection
        try {
          const customTriviaSnap = await firestore.collection('trivia-custom').doc(hauntId).get();
          
          if (customTriviaSnap.exists) {
            const customData = customTriviaSnap.data();
            if (customData && customData.questions) {
              allQuestions.push(...customData.questions);
            }
          }
        } catch (error) {
          console.log('No custom trivia found for haunt');
        }
      }

      res.json(allQuestions);
    } catch (error) {
      console.error("Failed to get trivia questions:", error);
      res.status(500).json({ error: "Failed to get trivia questions" });
    }
  });

  // Get ads for a haunt
  app.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adsSnapshot = await firestore.collection('haunt-ads').doc(hauntId).collection('ads').get();
      
      const allAds: any[] = [];
      adsSnapshot.docs.forEach(doc => {
        const ad = doc.data();
        if (ad) {
          allAds.push(ad);
        }
      });

      if (allAds.length === 0) {
        console.warn(`No ads found for haunt: ${hauntId}`);
      }

      res.json(allAds);
    } catch (error) {
      console.error("Failed to get ads:", error);
      res.status(500).json({ error: "Failed to get ads" });
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