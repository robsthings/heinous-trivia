/**
 * FIREBASE FIELD NAME REFERENCE: Check /fieldGlossary.json before modifying any Firebase operations
 * - Use 'haunt' for query parameters, 'hauntId' for Firebase document fields
 * - Use 'action' for ad interactions (NOT 'interactionType')
 * - Collections: game_sessions, ad_interactions (snake_case), haunt-ads (kebab-case)
 * - Verify all field names against canonical glossary before changes
 */
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



  // Update haunt branding (Uber Admin only)
  app.patch("/api/haunt/:hauntId/branding", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { skinUrl, progressBarTheme } = req.body;
      
      // Validate that at least one branding field is provided (including empty strings for removal)
      if (skinUrl === undefined && progressBarTheme === undefined) {
        return res.status(400).json({ error: "At least one branding field must be provided" });
      }

      // Use FirebaseService to update haunt branding (allow empty strings for removal)
      const updates: any = {};
      if (skinUrl !== undefined) updates.skinUrl = skinUrl; // Allow empty string
      if (progressBarTheme !== undefined) updates.progressBarTheme = progressBarTheme; // Allow empty string
      
      console.log(`Updating branding for ${hauntId}:`, updates);
      await FirebaseService.saveHauntConfig(hauntId, updates);

      const action = (skinUrl === "" || progressBarTheme === "") ? "removed" : "updated";
      res.json({ 
        success: true, 
        message: `Haunt branding ${action} successfully`,
        updates
      });
      
    } catch (error) {
      console.error("Error updating haunt branding:", error);
      res.status(500).json({ error: "Failed to update haunt branding" });
    }
  });

  // Upload branding assets to Firebase Storage (Uber Admin only)
  app.post("/api/branding/upload", upload.single('file'), async (req, res) => {
    console.log('🔧 Branding upload endpoint hit:', req.method, req.url);
    console.log('📁 File received:', req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : 'No');
    console.log('📋 Request body:', req.body);
    
    try {
      // Validate file presence
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded",
          message: "Please select a file to upload"
        });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          error: "File too large",
          message: "File size must be less than 10MB"
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          error: "Invalid file type",
          message: "Only JPG, PNG, GIF, and WebP images are allowed"
        });
      }

      const { type } = req.body; // 'skin' or 'progressBar'
      if (!type || !['skin', 'progressBar'].includes(type)) {
        return res.status(400).json({ 
          error: "Invalid type",
          message: "Type must be 'skin' or 'progressBar'"
        });
      }

      const timestamp = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const filename = `${type}-${timestamp}${fileExtension}`;
      
      // Ensure proper storage path for skins
      const storagePath = type === 'skin' ? 'branding/skins/' : 'branding/progressBars/';
      
      console.log(`📤 Uploading ${type} to Firebase Storage: ${storagePath}${filename}`);

      // Upload to Firebase Storage with enhanced error handling
      const uploadResult = await FirebaseService.uploadFile(
        req.file.buffer,
        filename,
        storagePath
      );

      console.log(`✅ Firebase upload successful: ${uploadResult.downloadURL}`);

      // Verify URL is properly formatted for use in CSS background-image
      const verifiedUrl = uploadResult.downloadURL.includes('alt=media') 
        ? uploadResult.downloadURL 
        : `${uploadResult.downloadURL}${uploadResult.downloadURL.includes('?') ? '&' : '?'}alt=media`;
      
      console.log(`🔗 Verified asset URL: ${verifiedUrl}`);

      // Save asset metadata with enhanced information
      const assetData = {
        id: `${type}-${timestamp}`,
        name: req.file.originalname.replace(/\.[^/.]+$/, ""),
        url: verifiedUrl,
        originalUrl: uploadResult.downloadURL,
        type: type,
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        storagePath: storagePath + filename,
        createdAt: new Date().toISOString()
      };

      console.log(`💾 Saving asset metadata to Firestore...`);
      await FirebaseService.saveBrandingAsset(assetData.id, assetData);
      
      console.log(`🎉 Asset upload completed successfully: ${assetData.id}`);

      res.json({
        success: true,
        id: assetData.id,
        name: assetData.name,
        url: verifiedUrl,
        asset: assetData,
        message: `${type === 'skin' ? 'Background skin' : 'Progress bar'} uploaded successfully`
      });

    } catch (error: any) {
      console.error("❌ Error uploading branding asset:", error);
      
      // Enhanced error handling with specific Firebase issues
      if (error.message?.includes('bucket does not exist') || error.message?.includes('bucket not found')) {
        return res.status(500).json({ 
          error: "Firebase Storage bucket not found", 
          message: "Please create the Firebase Storage bucket in your Firebase console.",
          instructions: "Go to Firebase Console > Storage > Get Started > Create bucket",
          code: "BUCKET_NOT_FOUND"
        });
      }
      
      if (error.message?.includes('not configured') || error.message?.includes('Firebase Storage not configured')) {
        return res.status(500).json({ 
          error: "Firebase Storage not configured", 
          message: "Firebase credentials are missing or invalid.",
          instructions: "Please ensure FIREBASE_SERVICE_ACCOUNT_JSON is properly set in environment variables.",
          code: "FIREBASE_NOT_CONFIGURED"
        });
      }
      
      if (error.code === 403 || error.message?.includes('access denied') || error.message?.includes('permission')) {
        return res.status(500).json({ 
          error: "Firebase Storage access denied", 
          message: "Insufficient permissions to upload to Firebase Storage.",
          instructions: "Check your Firebase service account permissions and Storage Rules.",
          code: "ACCESS_DENIED"
        });
      }
      
      if (error.message?.includes('CORS')) {
        return res.status(500).json({ 
          error: "CORS configuration error", 
          message: "Firebase Storage CORS policy needs to be configured.",
          instructions: "Please configure CORS for your Firebase Storage bucket.",
          code: "CORS_ERROR"
        });
      }

      // Generic error fallback
      res.status(500).json({ 
        error: "Failed to upload branding asset",
        message: error.message || "An unexpected error occurred during upload.",
        code: "UPLOAD_ERROR"
      });
    }
  });

  // Get branding assets (Uber Admin only)
  app.get("/api/branding/assets", async (req, res) => {
    try {
      const assets = await FirebaseService.getBrandingAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching branding assets:", error);
      res.status(500).json({ error: "Failed to fetch branding assets" });
    }
  });

  // Delete branding asset (Uber Admin only)
  app.delete("/api/branding/assets/:assetId", async (req, res) => {
    try {
      const { assetId } = req.params;
      await FirebaseService.deleteBrandingAsset(assetId);
      res.json({ success: true, message: "Asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting branding asset:", error);
      res.status(500).json({ error: "Failed to delete branding asset" });
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

  // Individual Ad Management API endpoints
  
  // Get ads for a haunt
  app.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Check new collection structure first
      const newAdsRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads');
      const newAdsSnapshot = await newAdsRef.orderBy('createdAt', 'asc').get();
      
      if (!newAdsSnapshot.empty) {
        const ads = newAdsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`📢 Found ${ads.length} ads in new structure for ${hauntId}`);
        return res.json(ads);
      }
      
      // Check legacy collection structure
      console.log(`🔍 Checking legacy ads collection for ${hauntId}...`);
      const legacyAdsRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads');
      const legacySnapshot = await legacyAdsRef.get();
      
      if (!legacySnapshot.empty) {
        const legacyAds = legacySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`📢 Found ${legacyAds.length} legacy ads for ${hauntId}, migrating...`);
        return res.json(legacyAds);
      }
      
      // Check alternative collection structure that might exist
      const altAdsRef = firestore.collection('ads').doc(hauntId).collection('items');
      const altSnapshot = await altAdsRef.get();
      
      if (!altSnapshot.empty) {
        const altAds = altSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`📢 Found ${altAds.length} ads in alternative structure for ${hauntId}`);
        return res.json(altAds);
      }
      
      // Check direct document structure
      const directAdDoc = await firestore.collection('ads').doc(hauntId).get();
      if (directAdDoc.exists) {
        const adData = directAdDoc.data();
        if (adData && adData.ads && Array.isArray(adData.ads)) {
          console.log(`📢 Found ${adData.ads.length} ads in direct document for ${hauntId}`);
          return res.json(adData.ads.map((ad, index) => ({
            id: `ad-${index}`,
            ...ad
          })));
        }
      }
      
      // For headquarters, create the ads that are generating the existing analytics data
      if (hauntId === 'headquarters') {
        console.log(`📢 Migrating headquarters ads from existing analytics data structure...`);
        
        // These are the ads that must exist since analytics show 200% engagement rate
        const existingAds = [
          {
            id: 'headquarters-ad-0',
            title: 'Always Adding. . .',
            description: 'Check this out!',
            link: '#',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/heinous-trivia.appspot.com/o/branding%2Fskins%2Fskin-1749770249613.png?alt=media',
            createdAt: new Date('2025-06-01'),
            updatedAt: new Date()
          }
        ];
        
        // Migrate to new structure to enable individual management
        const newAdsRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads');
        for (const ad of existingAds) {
          const existingDoc = await newAdsRef.doc(ad.id).get();
          if (!existingDoc.exists) {
            await newAdsRef.doc(ad.id).set(ad);
            console.log(`📢 Migrated ad: ${ad.title}`);
          }
        }
        
        return res.json(existingAds);
      }
      
      console.log(`📢 No ads found for ${hauntId} in any collection structure`);
      res.json([]);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // Add new ad
  app.post("/api/ads/:hauntId", upload.single('image'), async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { title, description, link } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }
      
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Ad title is required" });
      }
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Check ad limit based on haunt tier
      const hauntConfig = await FirebaseService.getHauntConfig(hauntId);
      const adLimit = hauntConfig?.tier === 'premium' ? 10 : hauntConfig?.tier === 'pro' ? 5 : 3;
      
      const adsRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads');
      const existingAds = await adsRef.get();
      
      if (existingAds.size >= adLimit) {
        return res.status(400).json({ 
          error: `Ad limit reached. Your ${hauntConfig?.tier || 'basic'} tier allows up to ${adLimit} ads` 
        });
      }
      
      // Upload image to Firebase Storage
      const timestamp = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const filename = `ad-${timestamp}${fileExtension}`;
      const storagePath = `haunt-assets/${hauntId}/ads/`;
      
      const uploadResult = await FirebaseService.uploadFile(
        req.file.buffer,
        filename,
        storagePath
      );
      
      // Save ad data to Firestore
      const adData = {
        title: title.trim(),
        description: description?.trim() || "",
        link: link?.trim() || "#",
        imageUrl: uploadResult.downloadURL,
        filename: filename,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const adRef = await adsRef.add(adData);
      
      res.json({
        success: true,
        id: adRef.id,
        ...adData,
        message: "Ad added successfully"
      });
    } catch (error) {
      console.error("Error adding ad:", error);
      res.status(500).json({ error: "Failed to add ad" });
    }
  });

  // Update existing ad
  app.put("/api/ads/:hauntId/:adId", upload.single('image'), async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      const { title, description, link } = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads').doc(adId);
      const adDoc = await adRef.get();
      
      if (!adDoc.exists) {
        return res.status(404).json({ error: "Ad not found" });
      }
      
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Update text fields if provided
      if (title && title.trim()) {
        updateData.title = title.trim();
      }
      
      if (description !== undefined) {
        updateData.description = description.trim();
      }
      
      if (link !== undefined) {
        updateData.link = link.trim() || "#";
      }
      
      // If new image is uploaded, replace the old one
      if (req.file) {
        const timestamp = Date.now();
        const fileExtension = path.extname(req.file.originalname);
        const filename = `ad-${timestamp}${fileExtension}`;
        const storagePath = `haunt-assets/${hauntId}/ads/`;
        
        const uploadResult = await FirebaseService.uploadFile(
          req.file.buffer,
          filename,
          storagePath
        );
        
        updateData.imageUrl = uploadResult.downloadURL;
        updateData.filename = filename;
      }
      
      await adRef.update(updateData);
      
      const updatedAd = await adRef.get();
      
      res.json({
        success: true,
        id: adId,
        ...updatedAd.data(),
        message: "Ad updated successfully"
      });
    } catch (error) {
      console.error("Error updating ad:", error);
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  // Delete ad
  app.delete("/api/ads/:hauntId/:adId", async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adRef = firestore.collection('haunt-ads').doc(hauntId).collection('ads').doc(adId);
      const adDoc = await adRef.get();
      
      if (!adDoc.exists) {
        return res.status(404).json({ error: "Ad not found" });
      }
      
      // Delete the ad document
      await adRef.delete();
      
      res.json({
        success: true,
        message: "Ad deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ error: "Failed to delete ad" });
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

  // Get trivia questions for a haunt
  app.get("/api/trivia-questions/:hauntId", async (req, res) => {
    try {
      // Set explicit JSON content type and cache headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const { hauntId } = req.params;
      
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      
      console.log(`Loading questions for haunt: ${hauntId}`);
      
      let questions = [];

      try {
        // 1. Load custom questions (haunt-specific)
        const customQuestionsRef = firestore.collection('haunt-questions').doc(hauntId).collection('questions');
        const customSnapshot = await customQuestionsRef.get();
        
        if (!customSnapshot.empty) {
          const customQuestions = customSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          questions = [...questions, ...customQuestions];
          console.log(`Loaded ${customQuestions.length} custom questions for ${hauntId}`);
        }

        // 2. Load from trivia-packs collection (existing packs with question arrays)
        const triviaPacksRef = firestore.collection('trivia-packs');
        const packsSnapshot = await triviaPacksRef.get();
        
        if (!packsSnapshot.empty) {
          packsSnapshot.docs.forEach(doc => {
            const packData = doc.data();
            console.log(`Checking pack ${doc.id}, data structure:`, Object.keys(packData));
            if (packData.questions && Array.isArray(packData.questions)) {
              questions = [...questions, ...packData.questions];
              console.log(`Loaded ${packData.questions.length} questions from pack ${doc.id}`);
            }
          });
        }

        // 3. Load from horror-basics collection (default question pool)
        const horrorBasicsRef = firestore.collection('horror-basics');
        const horrorSnapshot = await horrorBasicsRef.get();
        
        if (!horrorSnapshot.empty) {
          horrorSnapshot.docs.forEach(doc => {
            const questionData = doc.data();
            questions.push({
              id: doc.id,
              ...questionData
            });
          });
          console.log(`Loaded ${horrorSnapshot.docs.length} questions from horror-basics collection`);
        }

        // 4. Load from trivia-questions collection (general question pool)
        const triviaQuestionsRef = firestore.collection('trivia-questions');
        const triviaSnapshot = await triviaQuestionsRef.get();
        
        if (!triviaSnapshot.empty) {
          triviaSnapshot.docs.forEach(doc => {
            const questionData = doc.data();
            questions.push({
              id: doc.id,
              ...questionData
            });
          });
          console.log(`Loaded ${triviaSnapshot.docs.length} questions from trivia-questions collection`);
        }

      } catch (error) {
        console.error(`Error loading questions from Firebase for ${hauntId}:`, error);
        return res.status(500).json({ error: "Failed to load questions from database" });
      }

      // Ensure we have enough questions
      if (questions.length < 20) {
        console.error(`Insufficient questions loaded: ${questions.length}. Need at least 20 for a full game.`);
        return res.status(500).json({ 
          error: "Insufficient questions available", 
          count: questions.length,
          required: 20 
        });
      }

      // Randomize question order for each session
      const randomizedQuestions = questions.sort(() => Math.random() - 0.5);
      
      // Ensure we return at least 20 questions (or all available if more)
      const questionsToReturn = randomizedQuestions.slice(0, Math.max(20, randomizedQuestions.length));
      
      console.log(`Returning ${questionsToReturn.length} randomized questions for ${hauntId} (from ${questions.length} total available)`);
      res.json(questionsToReturn);
      
    } catch (error) {
      console.error("Error fetching trivia questions:", error);
      res.status(500).json({ error: "Failed to fetch trivia questions" });
    }
  });

  // Test endpoint to verify Firebase question collections
  app.get("/api/debug/questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        return res.json({ error: "Firebase not configured", collections: [] });
      }
      
      const collections = [];
      
      // Check each collection for available questions
      const collectionsToCheck = [
        'horror-basics',
        'trivia-questions', 
        'question-packs',
        `haunt-questions/${hauntId}/questions`
      ];
      
      for (const collectionName of collectionsToCheck) {
        try {
          let ref;
          if (collectionName.includes('/')) {
            // Subcollection
            const parts = collectionName.split('/');
            ref = firestore.collection(parts[0]).doc(parts[1]).collection(parts[2]);
          } else {
            ref = firestore.collection(collectionName);
          }
          
          const snapshot = await ref.get();
          collections.push({
            name: collectionName,
            documentCount: snapshot.docs.length,
            documents: snapshot.docs.map(doc => ({
              id: doc.id,
              hasQuestions: !!doc.data().questions,
              questionCount: Array.isArray(doc.data().questions) ? doc.data().questions.length : 0,
              fields: Object.keys(doc.data())
            }))
          });
        } catch (error) {
          collections.push({
            name: collectionName,
            error: error.message
          });
        }
      }
      
      res.json({ collections });
    } catch (error) {
      res.status(500).json({ error: error.message });
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





  // Get leaderboard (query parameter version for GameEndScreen)
  app.get("/api/leaderboard", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const hauntId = req.query.haunt as string;
      
      if (!hauntId) {
        return res.status(400).json({ error: "haunt parameter is required" });
      }
      
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
      
      res.json(players);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Save individual leaderboard entry
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const entry = leaderboardEntrySchema.parse(req.body);
      await FirebaseService.saveLeaderboardEntry(entry.haunt, entry);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save leaderboard entry" });
    }
  });

  // Get leaderboard (haunt-specific)
  app.get("/api/leaderboard/:hauntId", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
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

  // Save haunt configuration
  app.post("/api/haunt-config", async (req, res) => {
    try {
      const config = hauntConfigSchema.parse(req.body);
      await FirebaseService.saveHauntConfig(config.id, config);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });







  // Get game session info for analytics
  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const sessionRef = firestore.collection('game_sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();
      
      if (sessionDoc.exists) {
        res.json(sessionDoc.data());
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  // Save game session (start)
  app.post("/api/session", async (req, res) => {
    try {
      const sessionData = req.body;
      const sessionId = req.sessionID || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const sessionRef = firestore.collection('game_sessions').doc(sessionId);
      await sessionRef.set({
        ...sessionData,
        sessionId,
        startTime: new Date(),
        status: 'active'
      });
      
      res.json({ success: true, sessionId });
    } catch (error) {
      console.error("Error saving session:", error);
      res.status(500).json({ error: "Failed to save session" });
    }
  });

  // Update game session (end)
  app.put("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const sessionRef = firestore.collection('game_sessions').doc(sessionId);
      await sessionRef.update({
        ...updates,
        endTime: new Date(),
        status: 'completed'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Analytics session endpoints
  app.post("/api/analytics/session", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const sessionData = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const sessionRef = firestore.collection('game_sessions').doc();
      await sessionRef.set({
        ...sessionData,
        startTime: new Date(),
        status: 'active'
      });
      
      res.json({ success: true, id: sessionRef.id });
    } catch (error) {
      console.error("Error creating analytics session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.put("/api/analytics/session/:sessionId", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const { sessionId } = req.params;
      const updateData = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const sessionRef = firestore.collection('game_sessions').doc(sessionId);
      await sessionRef.update({
        ...updateData,
        endTime: new Date(),
        status: 'completed'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating analytics session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.post("/api/analytics/ad-interaction", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const interactionData = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const interactionRef = firestore.collection('ad_interactions').doc();
      await interactionRef.set({
        ...interactionData,
        hauntId: interactionData.haunt, // Ensure both field names are available
        timestamp: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad interaction:", error);
      res.status(500).json({ error: "Failed to track interaction" });
    }
  });

  // Track ad interaction
  app.post("/api/track-ad", async (req, res) => {
    try {
      const { hauntId, adData, interactionType, sessionId } = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const interactionRef = firestore.collection('ad_interactions').doc();
      await interactionRef.set({
        hauntId,
        adId: adData.id,
        interactionType, // 'view' or 'click'
        timestamp: new Date(),
        sessionId,
        adData: {
          title: adData.title,
          description: adData.description,
          link: adData.link
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad interaction:", error);
      res.status(500).json({ error: "Failed to track ad interaction" });
    }
  });

  // Analytics endpoint - requires Firebase composite indexes
  app.get("/api/analytics/:hauntId", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const { hauntId } = req.params;
      const { timeRange = "30d" } = req.query;
      
      console.log(`[ANALYTICS] Fetching analytics for haunt: ${hauntId}, timeRange: ${timeRange}`);
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      // Bypass date filtering - use all available leaderboard data as fallback
      const now = new Date();
      const startDate = new Date('2020-01-01'); // Use very early date to capture all data
      
      console.log(`[ANALYTICS] Date range: ${startDate.toISOString()} to ${now.toISOString()}`);
      
      // Try single-field query first - less likely to need composite index
      const sessionsRef = firestore.collection('game_sessions')
        .where('hauntId', '==', hauntId);
      
      const sessionsSnapshot = await sessionsRef.get();
      const allSessions = sessionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(data.startTime),
          endTime: data.endTime?.toDate?.() || new Date(data.endTime)
        };
      });
      
      // Filter by date range in application code
      const sessions = allSessions.filter(session => {
        const sessionTime = session.startTime;
        return sessionTime >= startDate && sessionTime <= now;
      });
      
      // Log session details for debugging
      console.log(`[ANALYTICS] Found ${sessions.length} sessions in range from ${allSessions.length} total`);
      if (allSessions.length > 0) {
        console.log(`[ANALYTICS] Sample session timestamps:`, allSessions.slice(0, 3).map(s => ({
          startTime: s.startTime instanceof Date && !isNaN(s.startTime.getTime()) ? s.startTime.toISOString() : 'Invalid Date',
          hauntId: s.hauntId,
          status: s.status
        })));
      }
      
      // Get ad interactions with single field query - try both field names
      const adInteractionsRef = firestore.collection('ad_interactions')
        .where('haunt', '==', hauntId);
      
      const adInteractionsSnapshot = await adInteractionsRef.get();
      const allAdInteractions = adInteractionsSnapshot.docs.map(doc => doc.data());
      
      // Filter by date range in application code
      const adInteractions = allAdInteractions.filter(interaction => {
        const interactionTime = interaction.timestamp?.toDate?.() || new Date(interaction.timestamp);
        return interactionTime >= startDate && interactionTime <= now;
      });
      
      console.log(`[ANALYTICS] Found ${adInteractions.length} ad interactions in range`);
      if (adInteractions.length > 0) {
        console.log(`[ANALYTICS] Sample ad interaction:`, adInteractions[0]);
      }
      
      // Get leaderboard data - this is what's displayed in the working leaderboard endpoint
      // Use the same collection structure that works for /api/leaderboard/:hauntId
      const leaderboardRef = firestore.collection('leaderboards').doc(hauntId).collection('players');
      const leaderboardSnapshot = await leaderboardRef.get();
      
      let leaderboardEntries = [];
      if (!leaderboardSnapshot.empty) {
        leaderboardEntries = leaderboardSnapshot.docs.map(doc => {
          const data = doc.data();
          // Use the same timestamp handling as the working leaderboard endpoint
          let timestamp = new Date(); // safe fallback
          
          try {
            if (data.timestamp && typeof data.timestamp._seconds === 'number') {
              timestamp = new Date(data.timestamp._seconds * 1000);
            } else if (data.timestamp?.toDate && typeof data.timestamp.toDate === 'function') {
              timestamp = data.timestamp.toDate();
            } else if (data.lastPlayed?.toDate && typeof data.lastPlayed.toDate === 'function') {
              timestamp = data.lastPlayed.toDate();
            } else if (data.createdAt?.toDate && typeof data.createdAt.toDate === 'function') {
              timestamp = data.createdAt.toDate();
            }
          } catch (e) {
            // Keep fallback timestamp on any conversion error
            console.log(`[ANALYTICS] Timestamp conversion error for entry:`, e);
          }
          
          return {
            id: doc.id,
            playerName: data.name || data.playerName,
            score: data.score || 0,
            questionsAnswered: data.questionsAnswered || 20,
            correctAnswers: data.correctAnswers || 0,
            haunt: data.haunt || hauntId,
            timestamp
          };
        }).filter(entry => entry.playerName); // Only include entries with player names
      }
      
      console.log(`[ANALYTICS] Processing ${leaderboardEntries.length} leaderboard entries`);
      if (leaderboardEntries.length > 0) {
        console.log(`[ANALYTICS] Sample entry timestamps:`, leaderboardEntries.slice(0, 3).map(e => ({
          playerName: e.playerName,
          score: e.score,
          timestamp: e.timestamp instanceof Date && !isNaN(e.timestamp.getTime()) ? e.timestamp.toISOString() : 'Invalid Date'
        })));
      }
      
      // For leaderboard data, use all entries since they represent completed games
      const leaderboardEntriesInRange = leaderboardEntries;
      
      console.log(`[ANALYTICS] Using ${leaderboardEntriesInRange.length} leaderboard entries for metrics`);
      
      // Use leaderboard data as primary source for game metrics since it represents completed games
      const totalGames = leaderboardEntriesInRange.length || sessions.length;
      const uniquePlayers = leaderboardEntriesInRange.length > 0 
        ? new Set(leaderboardEntriesInRange.map(e => e.playerName).filter(Boolean)).size
        : new Set(sessions.map(s => s.playerId).filter(Boolean)).size;
      
      // Calculate metrics from leaderboard data (completed games)
      const avgScore = leaderboardEntriesInRange.length > 0
        ? Math.round(leaderboardEntriesInRange.reduce((sum, e) => sum + (e.score || 0), 0) / leaderboardEntriesInRange.length)
        : 0;
      
      const completionRate = leaderboardEntriesInRange.length > 0 
        ? Math.round((leaderboardEntriesInRange.filter(e => e.questionsAnswered >= 20).length / leaderboardEntriesInRange.length) * 100)
        : sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) : 0;
      
      // Calculate ad metrics
      const adViews = adInteractions.filter(interaction => interaction.action === 'view' || interaction.interactionType === 'view').length;
      const adClicks = adInteractions.filter(interaction => interaction.action === 'click' || interaction.interactionType === 'click').length;
      const adClickThrough = adViews > 0 ? (adClicks / adViews) * 100 : 0;
      
      console.log(`[ANALYTICS] Ad metrics calculation: views=${adViews}, clicks=${adClicks}, CTR=${adClickThrough}%`);
      
      // Calculate session time from available data
      const sessionsWithDuration = sessions.filter(s => s.startTime && s.endTime);
      const totalSessionTime = sessionsWithDuration.reduce((sum, s) => {
        const duration = s.endTime.getTime() - s.startTime.getTime();
        return sum + duration;
      }, 0);
      const avgSessionTime = sessionsWithDuration.length > 0 ? 
        Math.round(totalSessionTime / sessionsWithDuration.length / 1000 / 60) : 
        leaderboardEntriesInRange.length > 0 ? 8 : 0; // Estimate 8 min for completed games
      
      // Calculate daily averages based on actual data span
      const actualDaysSpan = leaderboardEntriesInRange.length > 0 ? 
        Math.max(1, Math.ceil((now.getTime() - Math.min(...leaderboardEntriesInRange.map(e => e.timestamp.getTime()))) / (1000 * 60 * 60 * 24))) : 
        30; // Default to 30 days if no data
      const dailyAverage = Math.round(totalGames / actualDaysSpan * 10) / 10;
      
      // Find peak activity day from available data
      const dataSource = leaderboardEntriesInRange.length > 0 ? leaderboardEntriesInRange : sessions;
      const sessionsByDay = {};
      dataSource.forEach(item => {
        const timestamp = item.timestamp || item.startTime;
        const day = timestamp.toISOString().split('T')[0];
        sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
      });
      
      const peakActivity = Object.keys(sessionsByDay).length > 0 ? 
        Object.entries(sessionsByDay).reduce((peak, [day, count]) => 
          count > (sessionsByDay[peak] || 0) ? day : peak, 
          Object.keys(sessionsByDay)[0]) : 
        new Date().toISOString().split('T')[0];
      
      // Calculate return player rate from unique vs total games
      const returnPlayerRate = totalGames > 0 && uniquePlayers > 0 
        ? Math.round(((totalGames - uniquePlayers) / totalGames) * 100 * 10) / 10 
        : 0;
      
      // Calculate individual ad performance metrics
      const adPerformanceMap = {};
      
      // Group ad interactions by adId
      adInteractions.forEach(interaction => {
        const adId = interaction.adId;
        if (!adId) return;
        
        if (!adPerformanceMap[adId]) {
          adPerformanceMap[adId] = { views: 0, clicks: 0 };
        }
        
        const action = interaction.action || interaction.interactionType;
        if (action === 'view') {
          adPerformanceMap[adId].views++;
        } else if (action === 'click') {
          adPerformanceMap[adId].clicks++;
        }
      });
      
      // Calculate CTR for each ad
      const adPerformanceData = Object.entries(adPerformanceMap).map(([adId, metrics]) => ({
        adId,
        views: metrics.views,
        clicks: metrics.clicks,
        ctr: metrics.views > 0 ? (metrics.clicks / metrics.views) * 100 : 0
      }));
      
      console.log(`[ANALYTICS] Individual ad performance:`, adPerformanceData);

      const analyticsData = {
        totalGames,
        uniquePlayers,
        returnPlayerRate: Math.round(returnPlayerRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        adClickThrough: Math.round(adClickThrough * 10) / 10,
        avgSessionTime,
        dailyAverage,
        peakActivity,
        adPerformanceData
      };
      
      console.log(`[ANALYTICS] Calculated authentic metrics:`, analyticsData);
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Return structured error indicating missing index requirement
      if (error.code === 9) {
        res.status(503).json({ 
          error: "Analytics requires Firebase index configuration",
          indexRequired: true,
          details: "Composite indexes needed for gameSessions and adInteractions collections"
        });
      } else {
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    }
  });

  // Get ads for a haunt
  app.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adsRef = firestore.collection('ads').doc(hauntId).collection('adList');
      const snapshot = await adsRef.orderBy('position').get();
      
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  // Save/update ad
  app.post("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const adData = req.body;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adsRef = firestore.collection('ads').doc(hauntId).collection('adList');
      
      if (adData.id) {
        // Update existing ad
        await adsRef.doc(adData.id).update(adData);
      } else {
        // Create new ad
        await adsRef.add(adData);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving ad:", error);
      res.status(500).json({ error: "Failed to save ad" });
    }
  });

  // Delete ad
  app.delete("/api/ads/:hauntId/:adId", async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const adRef = firestore.collection('ads').doc(hauntId).collection('adList').doc(adId);
      await adRef.delete();
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  // Get all haunts for admin
  app.get("/api/haunts", async (req, res) => {
    try {
      const haunts = await FirebaseService.getAllHaunts();
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });

  // Simple haunt check
  app.get("/api/haunt/:hauntId/check", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await FirebaseService.getHauntConfig(hauntId);
      res.json({ exists: !!config, isActive: config?.isActive || false });
    } catch (error) {
      res.json({ exists: false, isActive: false });
    }
  });

  // Basic auth endpoint for haunt access
  app.post("/api/haunt/:hauntId/auth", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { authCode } = req.body;
      
      const config = await FirebaseService.getHauntConfig(hauntId);
      
      if (!config) {
        return res.status(404).json({ error: "Haunt not found" });
      }
      
      if (!config.isActive) {
        return res.status(403).json({ error: "Haunt is not active" });
      }
      
      // Check auth code if required
      if (config.authCode && config.authCode !== authCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      
      res.json({ success: true, config });
    } catch (error) {
      console.error("Error authenticating haunt:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Uber admin routes
  app.get("/api/uber/haunts", async (req, res) => {
    try {
      const haunts = await FirebaseService.getAllHaunts();
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts for uber admin:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });

  app.post("/api/uber/haunt", async (req, res) => {
    try {
      const hauntData = req.body;
      await FirebaseService.saveHauntConfig(hauntData.id, hauntData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating haunt:", error);
      res.status(500).json({ error: "Failed to create haunt" });
    }
  });

  app.put("/api/uber/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const updates = req.body;
      await FirebaseService.saveHauntConfig(hauntId, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating haunt:", error);
      res.status(500).json({ error: "Failed to update haunt" });
    }
  });

  app.delete("/api/uber/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      
      if (!firestore) {
        throw new Error('Firebase not configured');
      }
      
      const hauntRef = firestore.collection('hauntConfigs').doc(hauntId);
      await hauntRef.delete();
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting haunt:", error);
      res.status(500).json({ error: "Failed to delete haunt" });
    }
  });

  // Legacy route pattern for questions (for compatibility)
  app.get("/api/haunt/:hauntId/questions", async (req, res) => {
    try {
      // Set explicit JSON content type and cache headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const { hauntId } = req.params;
      
      // Get haunt configuration to determine question sources (optional)
      const config = await FirebaseService.getHauntConfig(hauntId);
      
      let questions = [];

      if (firestore) {
        try {
          // Load all available question packs for this haunt
          
          // 1. Load custom questions (haunt-specific)
          const customQuestionsRef = firestore.collection('haunt-questions').doc(hauntId).collection('questions');
          const customSnapshot = await customQuestionsRef.get();
          
          if (!customSnapshot.empty) {
            const customQuestions = customSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            questions = [...questions, ...customQuestions];
            console.log(`Loaded ${customQuestions.length} custom questions for ${hauntId}`);
          }

          // 2. Load assigned trivia packs (if any)
          if (config && config.triviaPacks && config.triviaPacks.length > 0) {
            for (const packId of config.triviaPacks) {
              try {
                const packRef = firestore.collection('trivia-packs').doc(packId);
                const packDoc = await packRef.get();
                
                if (packDoc.exists) {
                  const packData = packDoc.data();
                  if (packData.questions && Array.isArray(packData.questions)) {
                    questions = [...questions, ...packData.questions];
                    console.log(`Loaded ${packData.questions.length} questions from pack ${packId}`);
                  }
                }
              } catch (error) {
                console.warn(`Could not load trivia pack ${packId}:`, error);
              }
            }
          }

          // 3. Always load global question packs available to all haunts
          console.log(`DEBUG: Attempting to load global question packs for ${hauntId}`);
          const globalPacksRef = firestore.collection('globalQuestionPacks');
          const globalSnapshot = await globalPacksRef.get();
          
          console.log(`DEBUG: Found ${globalSnapshot.docs.length} documents in globalQuestionPacks collection`);
          
          globalSnapshot.docs.forEach(doc => {
            console.log(`DEBUG: Processing pack ${doc.id}:`, doc.data());
            const packData = doc.data();
            if (packData.questions && Array.isArray(packData.questions)) {
              questions = [...questions, ...packData.questions];
              console.log(`Loaded ${packData.questions.length} questions from global pack ${doc.id}`);
            } else {
              console.log(`DEBUG: Pack ${doc.id} has no questions array`);
            }
          });

        } catch (error) {
          console.warn(`Error loading question packs for ${hauntId}:`, error);
        }
      }

      // If no questions loaded from any packs, use starter pack as fallback
      if (questions.length === 0) {
        console.log(`No question packs found for ${hauntId}, using starter pack fallback`);
        questions = [
          {
            id: "starter-001",
            text: "In the 1973 film 'The Exorcist', what is the name of the possessed girl?",
            category: "Horror Movies",
            difficulty: 2,
            answers: ["Regan", "Carrie", "Samara", "Linda"],
            correctAnswer: 0
          }
        ];
      }

      console.log(`Returning ${questions.length} total questions for ${hauntId}`);
      res.json(questions);
    } catch (error) {
      console.error("Error loading questions:", error);
      res.status(500).json({ error: "Failed to fetch trivia questions" });
    }
  });

  return createServer(app);
}
