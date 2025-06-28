import { createRequire } from "module"; const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
var __filename, __dirname, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    __filename = fileURLToPath(import.meta.url);
    __dirname = path2.dirname(__filename);
    vite_config_default = defineConfig({
      plugins: [react()],
      resolve: {
        alias: {
          "@": path2.resolve(__dirname, "client", "src"),
          "@shared": path2.resolve(__dirname, "shared"),
          "@assets": path2.resolve(__dirname, "attached_assets")
        }
      },
      root: path2.resolve(__dirname, "client"),
      build: {
        outDir: path2.resolve(__dirname, "dist/public"),
        emptyOutDir: true
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: /* @__PURE__ */ __name((msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }, "error")
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    viteLogger = createLogger();
    __name(log, "log");
    __name(setupVite, "setupVite");
    __name(serveStatic, "serveStatic");
  }
});

// server/vite-bypass.ts
var vite_bypass_exports = {};
__export(vite_bypass_exports, {
  log: () => log2,
  serveStatic: () => serveStatic2,
  setupVite: () => setupVite2
});
import express2 from "express";
import fs2 from "fs";
import path4 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite2(app2, server) {
  log2("Development mode: serving client files statically");
  const clientPublicPath = path4.resolve(__dirname2, "..", "client", "public");
  const clientSrcPath = path4.resolve(__dirname2, "..", "client", "src");
  if (fs2.existsSync(clientPublicPath)) {
    app2.use(express2.static(clientPublicPath));
    log2(`Serving static files from ${clientPublicPath}`);
  }
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api") || url.startsWith("/launcher")) {
      return next();
    }
    try {
      const indexPath = path4.resolve(clientPublicPath, "index.html");
      if (fs2.existsSync(indexPath)) {
        let template = await fs2.promises.readFile(indexPath, "utf-8");
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        const developmentHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Development</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23);
            color: white; 
            margin: 0; 
            padding: 2rem;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem;
            background: rgba(0,0,0,0.7);
            border-radius: 15px;
            border: 1px solid rgba(255,107,107,0.3);
        }
        h1 { 
            color: #ff6b6b; 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255,107,107,0.5);
        }
        .status {
            color: #4ade80;
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(74,222,128,0.1);
            border-radius: 8px;
        }
        .api-test {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(123,97,255,0.1);
            border-radius: 8px;
        }
        button {
            background: linear-gradient(45deg, #ff6b6b, #bb86fc);
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            margin: 0.5rem;
        }
        button:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Development Server Active</p>
        <div class="status">Backend API Running on Port ${process.env.PORT || 5e3}</div>
        
        <div class="api-test">
            <h3>API Test Panel</h3>
            <button onclick="testHealth()">Test Health Endpoint</button>
            <button onclick="testTrivia()">Test Trivia Questions</button>
            <button onclick="testAds()">Test Ads Endpoint</button>
            <div id="results" style="margin-top: 1rem; text-align: left; background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px;"></div>
        </div>
    </div>
    
    <script>
        async function testEndpoint(url, name) {
            const results = document.getElementById('results');
            try {
                const response = await fetch(url);
                const data = await response.json();
                results.innerHTML += \`<div style="color: #4ade80; margin-bottom: 0.5rem;">\u2705 \${name}: \${response.status}</div>\`;
                results.innerHTML += \`<pre style="color: #ccc; font-size: 0.8rem; margin-bottom: 1rem;">\${JSON.stringify(data, null, 2).slice(0, 200)}...</pre>\`;
            } catch (error) {
                results.innerHTML += \`<div style="color: #ff6b6b; margin-bottom: 1rem;">\u274C \${name}: \${error.message}</div>\`;
            }
        }
        
        function testHealth() {
            testEndpoint('/api/health', 'Health Check');
        }
        
        function testTrivia() {
            testEndpoint('/api/trivia-questions/headquarters', 'Trivia Questions');
        }
        
        function testAds() {
            testEndpoint('/api/ads/headquarters', 'Ads Endpoint');
        }
    </script>
</body>
</html>`;
        res.status(200).set({ "Content-Type": "text/html" }).end(developmentHtml);
      }
    } catch (e) {
      log2(`Error serving development page: ${e}`);
      next(e);
    }
  });
}
function serveStatic2(app2) {
  const distPath = path4.resolve(__dirname2, "..", "dist", "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}
var __filename2, __dirname2;
var init_vite_bypass = __esm({
  "server/vite-bypass.ts"() {
    "use strict";
    __filename2 = fileURLToPath2(import.meta.url);
    __dirname2 = path4.dirname(__filename2);
    __name(log2, "log");
    __name(setupVite2, "setupVite");
    __name(serveStatic2, "serveStatic");
  }
});

// server/production.ts
var production_exports = {};
__export(production_exports, {
  log: () => log3,
  serveStatic: () => serveStatic3
});
import express3 from "express";
import fs3 from "fs";
import path5 from "path";
function log3(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic3(app2) {
  const distPath = path5.resolve(process.cwd(), "dist", "public");
  const fallbackPath = path5.resolve(process.cwd(), "public");
  const staticPath = fs3.existsSync(distPath) ? distPath : fallbackPath;
  if (!fs3.existsSync(staticPath)) {
    log3(`Warning: Static directory not found at ${staticPath}`, "production");
    app2.use("*", (_req, res) => {
      res.status(200).json({ message: "Heinous Trivia API Server Running", status: "ok" });
    });
    return;
  }
  log3(`Serving static files from: ${staticPath}`, "production");
  app2.use(express3.static(staticPath));
  app2.use("*", (_req, res) => {
    const indexPath = path5.resolve(staticPath, "index.html");
    if (fs3.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Page not found", status: "error" });
    }
  });
}
var init_production = __esm({
  "server/production.ts"() {
    "use strict";
    __name(log3, "log");
    __name(serveStatic3, "serveStatic");
  }
});

// server/index.ts
import express4 from "express";

// server/routes.ts
import { createServer } from "http";

// server/firebase.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
var isFirebaseConfigured = /* @__PURE__ */ __name(() => {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
}, "isFirebaseConfigured");
var firebaseApp;
var firestore;
var storage;
var exportedFieldValue;
if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      const credential = cert(serviceAccount);
      firebaseApp = initializeApp({
        credential,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`,
        storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
      });
    } else {
      firebaseApp = getApps()[0];
    }
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    exportedFieldValue = FieldValue;
  } catch (error) {
    firestore = null;
    storage = null;
    exportedFieldValue = null;
  }
} else {
  firestore = null;
  storage = null;
  exportedFieldValue = null;
}
var COLLECTIONS = {
  HAUNTS: "haunts",
  LEADERBOARDS: "leaderboards",
  GAME_SESSIONS: "game-sessions",
  AD_INTERACTIONS: "ad-interactions",
  QUESTION_PERFORMANCE: "question-performance"
};
var FirebaseService = class {
  static {
    __name(this, "FirebaseService");
  }
  static async saveHauntConfig(hauntId, config) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const docRef = firestore.collection(COLLECTIONS.HAUNTS).doc(hauntId);
    await docRef.set(config, { merge: true });
    return config;
  }
  static async getHauntConfig(hauntId) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const docRef = firestore.collection(COLLECTIONS.HAUNTS).doc(hauntId);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
  }
  static async saveLeaderboardEntry(hauntId, entry) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const leaderboardRef = firestore.collection(COLLECTIONS.LEADERBOARDS).doc(hauntId).collection("entries");
    const docRef = await leaderboardRef.add({
      ...entry,
      timestamp: /* @__PURE__ */ new Date()
    });
    return { id: docRef.id, ...entry };
  }
  static async getLeaderboard(hauntId, limit = 10) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const leaderboardRef = firestore.collection(COLLECTIONS.LEADERBOARDS).doc(hauntId).collection("entries").orderBy("score", "desc").limit(limit);
    const snapshot = await leaderboardRef.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  static async getAllHaunts() {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const snapshot = await firestore.collection(COLLECTIONS.HAUNTS).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  // Analytics methods
  static async saveGameSession(hauntId, sessionData) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const docRef = await firestore.collection(COLLECTIONS.GAME_SESSIONS).add({
      ...sessionData,
      hauntId,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { id: docRef.id, ...sessionData };
  }
  static async updateGameSession(sessionId, updates) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    await firestore.collection(COLLECTIONS.GAME_SESSIONS).doc(sessionId).update({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  static async saveAdInteraction(hauntId, interactionData) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    await firestore.collection(COLLECTIONS.AD_INTERACTIONS).add({
      ...interactionData,
      hauntId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  static async saveQuestionPerformance(hauntId, performanceData) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    await firestore.collection(COLLECTIONS.QUESTION_PERFORMANCE).add({
      ...performanceData,
      hauntId,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  static async getAnalyticsData(hauntId, timeRange) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    const daysAgo = parseInt(timeRange.replace("d", ""));
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const sessionsSnapshot = await firestore.collection(COLLECTIONS.GAME_SESSIONS).where("hauntId", "==", hauntId).where("createdAt", ">=", startDate).get();
    const sessions = sessionsSnapshot.docs.map((doc) => doc.data());
    const adSnapshot = await firestore.collection(COLLECTIONS.AD_INTERACTIONS).where("hauntId", "==", hauntId).where("createdAt", ">=", startDate).get();
    const adInteractions2 = adSnapshot.docs.map((doc) => doc.data());
    const questionSnapshot = await firestore.collection(COLLECTIONS.QUESTION_PERFORMANCE).where("hauntId", "==", hauntId).where("createdAt", ">=", startDate).get();
    const questionData = questionSnapshot.docs.map((doc) => doc.data());
    const totalGames = sessions.length;
    const uniquePlayers = new Set(sessions.map((s) => s.playerId)).size;
    const completedSessions = sessions.filter((s) => s.completedAt);
    const returnPlayers = sessions.filter(
      (s) => sessions.some((other) => other.playerId === s.playerId && other.createdAt < s.createdAt)
    );
    const adViews = adInteractions2.filter((a) => a.interactionType === "view").length;
    const adClicks = adInteractions2.filter((a) => a.interactionType === "click").length;
    const correctAnswers = questionData.filter((q) => q.isCorrect).length;
    const totalAnswers = questionData.length;
    return {
      totalGames,
      uniquePlayers,
      returnPlayerRate: uniquePlayers > 0 ? returnPlayers.length / uniquePlayers * 100 : 0,
      adClickThrough: adViews > 0 ? adClicks / adViews * 100 : 0,
      bestQuestions: [],
      // Would need more complex aggregation
      competitiveMetrics: {
        averageScore: completedSessions.length > 0 ? completedSessions.reduce((sum, s) => sum + (s.finalScore || 0), 0) / completedSessions.length : 0,
        topScore: Math.max(...completedSessions.map((s) => s.finalScore || 0), 0),
        participationRate: totalAnswers > 0 ? correctAnswers / totalAnswers * 100 : 0
      },
      averageGroupSize: 1,
      // Would need group session tracking
      timeRangeData: {
        daily: [],
        weekly: []
      }
    };
  }
  static async uploadFile(buffer, filename, path7 = "") {
    if (!storage) {
      throw new Error("Firebase Storage not configured - please provide Firebase credentials");
    }
    console.log(`\u{1F525} Firebase Storage upload starting: ${path7}${filename}`);
    try {
      const bucket = storage.bucket();
      try {
        const [metadata] = await bucket.getMetadata();
        console.log(`\u{1F4E6} Bucket verified: ${metadata.name}`);
      } catch (bucketError) {
        console.error("\u274C Bucket verification failed:", bucketError);
        if (bucketError.code === 404) {
          throw new Error("Firebase Storage bucket not found. Please ensure the bucket exists in your Firebase console.");
        }
        if (bucketError.code === 403) {
          throw new Error("Firebase Storage access denied. Check your service account permissions.");
        }
        throw bucketError;
      }
      const file = bucket.file(`${path7}${filename}`);
      const getContentType = /* @__PURE__ */ __name((filename2) => {
        const ext = filename2.toLowerCase().split(".").pop();
        switch (ext) {
          case "gif":
            return "image/gif";
          case "png":
            return "image/png";
          case "jpg":
          case "jpeg":
            return "image/jpeg";
          case "webp":
            return "image/webp";
          case "svg":
            return "image/svg+xml";
          default:
            return "application/octet-stream";
        }
      }, "getContentType");
      const contentType = getContentType(filename);
      console.log(`\u{1F4C4} Content type: ${contentType}`);
      await file.save(buffer, {
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
          // 1 year cache
          metadata: {
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
            originalName: filename,
            uploadSource: "uber-admin"
          }
        },
        public: true,
        resumable: false
        // For better reliability with smaller files
      });
      console.log(`\u2705 File uploaded successfully`);
      try {
        await file.makePublic();
        console.log(`\u{1F310} File made public`);
      } catch (publicError) {
        console.warn("\u26A0\uFE0F Could not make file public, may already be public:", publicError.message);
      }
      const bucketName = bucket.name;
      const encodedPath = encodeURIComponent(path7 + filename);
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
      console.log(`\u{1F517} Generated URL: ${downloadURL}`);
      try {
        const testResponse = await fetch(downloadURL, { method: "HEAD" });
        if (testResponse.ok) {
          console.log(`\u2705 URL verified accessible`);
        } else {
          console.warn(`\u26A0\uFE0F URL test returned ${testResponse.status}`);
        }
      } catch (testError) {
        console.warn("\u26A0\uFE0F URL verification failed (may still work):", testError);
      }
      return {
        downloadURL,
        filename,
        path: path7 + filename,
        bucketName,
        contentType
      };
    } catch (error) {
      console.error("\u274C Firebase Storage upload error:", error);
      if (error.message?.includes("bucket does not exist") || error.message?.includes("bucket not found")) {
        throw new Error("Firebase Storage bucket not found. Please create the bucket in your Firebase console.");
      }
      if (error.code === 403 || error.message?.includes("access denied") || error.message?.includes("permission")) {
        throw new Error("Firebase Storage access denied. Please check your Firebase credentials and bucket permissions.");
      }
      if (error.code === "storage/unauthorized") {
        throw new Error("Firebase Storage unauthorized. Please verify your service account has Storage Admin role.");
      }
      if (error.message?.includes("CORS")) {
        throw new Error("CORS configuration error. Please configure CORS for your Firebase Storage bucket.");
      }
      if (error.code === "ENOTFOUND" || error.message?.includes("network")) {
        throw new Error("Network error connecting to Firebase Storage. Please check your internet connection.");
      }
      throw new Error(`Firebase Storage upload failed: ${error.message}`);
    }
  }
  static async saveBrandingAsset(assetId, assetData) {
    if (!firestore) {
      console.warn("Firebase not configured - branding asset not saved");
      return;
    }
    try {
      await firestore.collection("branding-assets").doc(assetId).set(assetData);
    } catch (error) {
      console.error("Error saving branding asset:", error);
      throw error;
    }
  }
  static async getBrandingAssets() {
    if (!firestore) {
      console.warn("Firebase not configured - returning empty branding assets");
      return { skins: [], progressBars: [] };
    }
    try {
      const snapshot = await firestore.collection("branding-assets").get();
      const assets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      const skins = assets.filter((asset) => asset.type === "skin");
      const progressBars = assets.filter((asset) => asset.type === "progressBar");
      return { skins, progressBars };
    } catch (error) {
      console.error("Error getting branding assets:", error);
      return { skins: [], progressBars: [] };
    }
  }
  static async deleteBrandingAsset(assetId) {
    if (!firestore) {
      throw new Error("Firebase not configured");
    }
    try {
      const assetDoc = await firestore.collection("branding-assets").doc(assetId).get();
      if (!assetDoc.exists) {
        throw new Error("Asset not found");
      }
      const assetData = assetDoc.data();
      if (assetData.url && storage) {
        try {
          const urlParts = assetData.url.split("/");
          const fileName = urlParts[urlParts.length - 1].split("?")[0];
          const assetType = assetData.type === "skin" ? "skins" : "progressBars";
          const filePath = `branding/${assetType}/${fileName}`;
          const bucket = storage.bucket();
          await bucket.file(filePath).delete();
        } catch (storageError) {
          console.warn("Could not delete file from storage:", storageError);
        }
      }
      await firestore.collection("branding-assets").doc(assetId).delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting branding asset:", error);
      throw error;
    }
  }
  // Sidequest management methods
  static async saveSidequest(sidequestId, sidequestData) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      await firestore.collection("sidequests").doc(sidequestId).set({
        ...sidequestData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error saving sidequest:", error);
      throw error;
    }
  }
  static async getSidequest(sidequestId) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const doc = await firestore.collection("sidequests").doc(sidequestId).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error("Error fetching sidequest:", error);
      throw error;
    }
  }
  static async getAllSidequests() {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const snapshot = await firestore.collection("sidequests").where("isActive", "==", true).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching sidequests:", error);
      throw error;
    }
  }
  static async getSidequestsByTier(requiredTier) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const tierHierarchy = { "Basic": 0, "Pro": 1, "Premium": 2 };
      const userTierLevel = tierHierarchy[requiredTier] || 0;
      const snapshot = await firestore.collection("sidequests").where("isActive", "==", true).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((sidequest) => {
        const sidequestTierLevel = tierHierarchy[sidequest.requiredTier] || 0;
        return sidequestTierLevel <= userTierLevel;
      });
    } catch (error) {
      console.error("Error fetching sidequests by tier:", error);
      throw error;
    }
  }
  static async saveSidequestProgress(progressData) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const progressId = `${progressData.hauntId}_${progressData.sidequestId}_${progressData.sessionId}`;
      await firestore.collection("sidequest-progress").doc(progressId).set({
        ...progressData,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error saving sidequest progress:", error);
      throw error;
    }
  }
  static async getSidequestProgress(hauntId, sidequestId, sessionId) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const progressId = `${hauntId}_${sidequestId}_${sessionId}`;
      const doc = await firestore.collection("sidequest-progress").doc(progressId).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error("Error fetching sidequest progress:", error);
      throw error;
    }
  }
};

// server/emailAuth.ts
var ServerEmailAuthService = class {
  static {
    __name(this, "ServerEmailAuthService");
  }
  /**
   * Add authorized email to a haunt
   */
  static async addAuthorizedEmail(hauntId, email) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntRef = firestore.collection("haunts").doc(hauntId);
      const hauntDoc = await hauntRef.get();
      if (!hauntDoc.exists) {
        console.error("Haunt not found:", hauntId);
        return false;
      }
      const hauntData = hauntDoc.data();
      const currentEmails = hauntData?.authorizedEmails || [];
      if (!currentEmails.includes(email.toLowerCase())) {
        await hauntRef.update({
          authorizedEmails: exportedFieldValue.arrayUnion(email.toLowerCase())
        });
        console.log(`Added authorized email ${email} to haunt ${hauntId}`);
      }
      return true;
    } catch (error) {
      console.error("Failed to add authorized email:", error);
      return false;
    }
  }
  /**
   * Remove authorized email from a haunt
   */
  static async removeAuthorizedEmail(hauntId, email) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntRef = firestore.collection("haunts").doc(hauntId);
      await hauntRef.update({
        authorizedEmails: exportedFieldValue.arrayRemove(email.toLowerCase())
      });
      console.log(`Removed authorized email ${email} from haunt ${hauntId}`);
      return true;
    } catch (error) {
      console.error("Failed to remove authorized email:", error);
      return false;
    }
  }
  /**
   * Get all authorized emails for a haunt
   */
  static async getAuthorizedEmails(hauntId) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntRef = firestore.collection("haunts").doc(hauntId);
      const hauntDoc = await hauntRef.get();
      if (!hauntDoc.exists) {
        return [];
      }
      const hauntData = hauntDoc.data();
      return hauntData?.authorizedEmails || [];
    } catch (error) {
      console.error("Failed to get authorized emails:", error);
      return [];
    }
  }
  /**
   * Check if email is authorized for haunt access
   */
  static async isEmailAuthorized(hauntId, email) {
    try {
      const authorizedEmails = await this.getAuthorizedEmails(hauntId);
      return authorizedEmails.includes(email.toLowerCase());
    } catch (error) {
      console.error("Failed to check email authorization:", error);
      return false;
    }
  }
  /**
   * Initialize haunt with first authorized email (for setup)
   */
  static async initializeHauntAuth(hauntId, email) {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntRef = firestore.collection("haunts").doc(hauntId);
      const hauntDoc = await hauntRef.get();
      if (!hauntDoc.exists) {
        console.error("Haunt not found:", hauntId);
        return false;
      }
      const hauntData = hauntDoc.data();
      if (hauntData?.authorizedEmails && hauntData.authorizedEmails.length > 0) {
        console.error("Haunt already has email authentication configured:", hauntId);
        return false;
      }
      if (hauntData?.authCode) {
        console.log("Migrating haunt from access code to email authentication:", hauntId);
      }
      await hauntRef.update({
        authorizedEmails: [email.toLowerCase()],
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log(`Initialized haunt ${hauntId} with first authorized email: ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to initialize haunt auth:", error);
      return false;
    }
  }
};

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  haunt: text("haunt").notNull(),
  questionsAnswered: integer("questions_answered").notNull(),
  correctAnswers: integer("correct_answers").notNull()
});
var hauntConfigs = pgTable("haunt_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logoPath: text("logo_path").notNull().default(""),
  triviaFile: text("trivia_file").notNull().default(""),
  adFile: text("ad_file").notNull().default(""),
  mode: text("mode").notNull().default("individual"),
  tier: text("tier").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(true),
  authCode: text("auth_code"),
  // Legacy: keep for backward compatibility
  authorizedEmails: text("authorized_emails").array(),
  // New: array of authorized admin emails
  themeData: text("theme_data").notNull(),
  skinUrl: text("skin_url"),
  // Pro/Premium only: custom background image
  progressBarTheme: text("progress_bar_theme"),
  // Pro/Premium only: progress bar color theme
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull(),
  // UUID or identifier for player
  haunt: text("haunt").notNull(),
  sessionType: text("session_type").notNull(),
  // "individual" or "group"
  groupId: text("group_id"),
  // for group sessions
  questionsAnswered: integer("questions_answered").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  finalScore: integer("final_score").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});
var adInteractions = pgTable("ad_interactions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => gameSessions.id),
  haunt: text("haunt").notNull(),
  adIndex: integer("ad_index").notNull(),
  action: text("action").notNull(),
  // "view" or "click"
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var questionPerformance = pgTable("question_performance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => gameSessions.id),
  haunt: text("haunt").notNull(),
  questionText: text("question_text").notNull(),
  questionPack: text("question_pack").notNull(),
  // "basic", "advanced", "elite"
  wasCorrect: boolean("was_correct").notNull(),
  timeToAnswer: integer("time_to_answer"),
  // milliseconds
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  name: true,
  score: true,
  haunt: true,
  questionsAnswered: true,
  correctAnswers: true
});
var insertHauntConfigSchema = createInsertSchema(hauntConfigs).pick({
  id: true,
  name: true,
  description: true,
  logoPath: true,
  triviaFile: true,
  adFile: true,
  mode: true,
  tier: true,
  isActive: true,
  isPublished: true,
  authCode: true,
  themeData: true
});
var insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  playerId: true,
  haunt: true,
  sessionType: true,
  groupId: true,
  questionsAnswered: true,
  correctAnswers: true,
  finalScore: true,
  completedAt: true
});
var insertAdInteractionSchema = createInsertSchema(adInteractions).pick({
  sessionId: true,
  haunt: true,
  adIndex: true,
  action: true
});
var insertQuestionPerformanceSchema = createInsertSchema(questionPerformance).pick({
  sessionId: true,
  haunt: true,
  questionText: true,
  questionPack: true,
  wasCorrect: true,
  timeToAnswer: true
});
var triviaQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
  difficulty: z.number().min(1).max(5),
  answers: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string(),
  points: z.number().default(100)
});
var hauntConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  logoPath: z.string(),
  triviaFile: z.string(),
  adFile: z.string(),
  mode: z.enum(["individual", "queue"]),
  tier: z.enum(["basic", "pro", "premium"]),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  authCode: z.string().optional(),
  // Legacy: keep for backward compatibility
  authorizedEmails: z.array(z.string().email()).optional(),
  // New: authorized admin emails
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string()
  }),
  // CUSTOM SKIN & PROGRESS BAR LOGIC
  skinUrl: z.string().optional(),
  // Pro/Premium only: custom background image
  progressBarTheme: z.string().optional()
  // Pro/Premium only: progress bar color theme
});
var adDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
  duration: z.number().default(5e3),
  timestamp: z.string().optional()
});
var leaderboardEntrySchema = z.object({
  name: z.string(),
  score: z.number(),
  date: z.string(),
  haunt: z.string(),
  questionsAnswered: z.number(),
  correctAnswers: z.number()
});
var sidequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert", "Impossible"]),
  estimatedTime: z.string(),
  componentType: z.string(),
  config: z.record(z.any()),
  isActive: z.boolean().default(true),
  requiredTier: z.enum(["Basic", "Pro", "Premium"]).default("Basic"),
  createdAt: z.string(),
  updatedAt: z.string()
});
var sidequestProgressSchema = z.object({
  sidequestId: z.string(),
  hauntId: z.string(),
  playerId: z.string().optional(),
  sessionId: z.string(),
  completed: z.boolean().default(false),
  score: z.number().default(0),
  timeSpent: z.number().default(0),
  data: z.record(z.any()).default({}),
  completedAt: z.string().optional(),
  createdAt: z.string()
});

// server/routes.ts
import path from "path";
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: /* @__PURE__ */ __name((req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }, "fileFilter")
});
async function registerRoutes(app2) {
  const server = createServer(app2);
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      mode: "development"
    });
  });
  app2.get("/launcher", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "public", "launcher.html"));
  });
  app2.post("/api/upload-background", (req, res) => {
    upload.single("background")(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const hauntId = req.body.hauntId;
        const uploadType = req.body.type || "logo";
        if (!hauntId) {
          return res.status(400).json({ error: "Haunt ID is required" });
        }
        let filename = `bg${path.extname(req.file.originalname)}`;
        if (uploadType === "skin") {
          filename = `skin${path.extname(req.file.originalname)}`;
        } else if (uploadType === "progressbar") {
          filename = `progressbar${path.extname(req.file.originalname)}`;
        }
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
  app2.patch("/api/haunt/:hauntId/branding", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { skinUrl, progressBarTheme, triviaPacks } = req.body;
      if (skinUrl === void 0 && progressBarTheme === void 0 && triviaPacks === void 0) {
        return res.status(400).json({ error: "At least one branding field must be provided" });
      }
      const updates = {};
      if (skinUrl !== void 0) updates.skinUrl = skinUrl;
      if (progressBarTheme !== void 0) updates.progressBarTheme = progressBarTheme;
      if (triviaPacks !== void 0) updates.triviaPacks = triviaPacks;
      console.log(`Updating branding for ${hauntId}:`, updates);
      await FirebaseService.saveHauntConfig(hauntId, updates);
      const action = skinUrl === "" || progressBarTheme === "" ? "removed" : "updated";
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
  app2.post("/api/branding/upload", upload.single("file"), async (req, res) => {
    console.log("\u{1F527} Branding upload endpoint hit:", req.method, req.url);
    console.log("\u{1F4C1} File received:", req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : "No");
    console.log("\u{1F4CB} Request body:", req.body);
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please select a file to upload"
        });
      }
      const maxSize = 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: "File too large",
          message: "File size must be less than 10MB"
        });
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: "Invalid file type",
          message: "Only JPG, PNG, GIF, and WebP images are allowed"
        });
      }
      const { type } = req.body;
      if (!type || !["skin", "progressBar"].includes(type)) {
        return res.status(400).json({
          error: "Invalid type",
          message: "Type must be 'skin' or 'progressBar'"
        });
      }
      const timestamp2 = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const filename = `${type}-${timestamp2}${fileExtension}`;
      const storagePath = type === "skin" ? "branding/skins/" : "branding/progressBars/";
      console.log(`\u{1F4E4} Uploading ${type} to Firebase Storage: ${storagePath}${filename}`);
      const uploadResult = await FirebaseService.uploadFile(
        req.file.buffer,
        filename,
        storagePath
      );
      console.log(`\u2705 Firebase upload successful: ${uploadResult.downloadURL}`);
      const verifiedUrl = uploadResult.downloadURL.includes("alt=media") ? uploadResult.downloadURL : `${uploadResult.downloadURL}${uploadResult.downloadURL.includes("?") ? "&" : "?"}alt=media`;
      console.log(`\u{1F517} Verified asset URL: ${verifiedUrl}`);
      const assetData = {
        id: `${type}-${timestamp2}`,
        name: req.file.originalname.replace(/\.[^/.]+$/, ""),
        url: verifiedUrl,
        originalUrl: uploadResult.downloadURL,
        type,
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        storagePath: storagePath + filename,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`\u{1F4BE} Saving asset metadata to Firestore...`);
      await FirebaseService.saveBrandingAsset(assetData.id, assetData);
      console.log(`\u{1F389} Asset upload completed successfully: ${assetData.id}`);
      res.json({
        success: true,
        id: assetData.id,
        name: assetData.name,
        url: verifiedUrl,
        asset: assetData,
        message: `${type === "skin" ? "Background skin" : "Progress bar"} uploaded successfully`
      });
    } catch (error) {
      console.error("\u274C Error uploading branding asset:", error);
      if (error.message?.includes("bucket does not exist") || error.message?.includes("bucket not found")) {
        return res.status(500).json({
          error: "Firebase Storage bucket not found",
          message: "Please create the Firebase Storage bucket in your Firebase console.",
          instructions: "Go to Firebase Console > Storage > Get Started > Create bucket",
          code: "BUCKET_NOT_FOUND"
        });
      }
      if (error.message?.includes("not configured") || error.message?.includes("Firebase Storage not configured")) {
        return res.status(500).json({
          error: "Firebase Storage not configured",
          message: "Firebase credentials are missing or invalid.",
          instructions: "Please ensure FIREBASE_SERVICE_ACCOUNT_JSON is properly set in environment variables.",
          code: "FIREBASE_NOT_CONFIGURED"
        });
      }
      if (error.code === 403 || error.message?.includes("access denied") || error.message?.includes("permission")) {
        return res.status(500).json({
          error: "Firebase Storage access denied",
          message: "Insufficient permissions to upload to Firebase Storage.",
          instructions: "Check your Firebase service account permissions and Storage Rules.",
          code: "ACCESS_DENIED"
        });
      }
      if (error.message?.includes("CORS")) {
        return res.status(500).json({
          error: "CORS configuration error",
          message: "Firebase Storage CORS policy needs to be configured.",
          instructions: "Please configure CORS for your Firebase Storage bucket.",
          code: "CORS_ERROR"
        });
      }
      res.status(500).json({
        error: "Failed to upload branding asset",
        message: error.message || "An unexpected error occurred during upload.",
        code: "UPLOAD_ERROR"
      });
    }
  });
  app2.get("/api/branding/assets", async (req, res) => {
    try {
      const assets = await FirebaseService.getBrandingAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching branding assets:", error);
      res.status(500).json({ error: "Failed to fetch branding assets" });
    }
  });
  app2.delete("/api/branding/assets/:assetId", async (req, res) => {
    try {
      const { assetId } = req.params;
      await FirebaseService.deleteBrandingAsset(assetId);
      res.json({ success: true, message: "Asset deleted successfully" });
    } catch (error) {
      console.error("Error deleting branding asset:", error);
      res.status(500).json({ error: "Failed to delete branding asset" });
    }
  });
  app2.post("/api/branding/metadata", async (req, res) => {
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
  app2.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const newAdsRef = firestore.collection("haunt-ads").doc(hauntId).collection("ads");
      const newAdsSnapshot = await newAdsRef.orderBy("createdAt", "asc").get();
      if (!newAdsSnapshot.empty) {
        const ads = newAdsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`\u{1F4E2} Found ${ads.length} ads in new structure for ${hauntId}`);
        return res.json(ads);
      }
      console.log(`\u{1F50D} Checking legacy ads collection for ${hauntId}...`);
      const legacyAdsRef = firestore.collection("haunt-ads").doc(hauntId).collection("ads");
      const legacySnapshot = await legacyAdsRef.get();
      if (!legacySnapshot.empty) {
        const legacyAds = legacySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`\u{1F4E2} Found ${legacyAds.length} legacy ads for ${hauntId}, migrating...`);
        return res.json(legacyAds);
      }
      const altAdsRef = firestore.collection("ads").doc(hauntId).collection("items");
      const altSnapshot = await altAdsRef.get();
      if (!altSnapshot.empty) {
        const altAds = altSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`\u{1F4E2} Found ${altAds.length} ads in alternative structure for ${hauntId}`);
        return res.json(altAds);
      }
      const directAdDoc = await firestore.collection("ads").doc(hauntId).get();
      if (directAdDoc.exists) {
        const adData = directAdDoc.data();
        if (adData && adData.ads && Array.isArray(adData.ads)) {
          console.log(`\u{1F4E2} Found ${adData.ads.length} ads in direct document for ${hauntId}`);
          return res.json(adData.ads.map((ad, index) => ({
            id: `ad-${index}`,
            ...ad
          })));
        }
      }
      if (hauntId === "headquarters") {
        console.log(`\u{1F4E2} Migrating headquarters ads from existing analytics data structure...`);
        const existingAds = [
          {
            id: "headquarters-ad-0",
            title: "Always Adding. . .",
            description: "Check this out!",
            link: "#",
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/heinous-trivia.appspot.com/o/branding%2Fskins%2Fskin-1749770249613.png?alt=media",
            createdAt: /* @__PURE__ */ new Date("2025-06-01"),
            updatedAt: /* @__PURE__ */ new Date()
          }
        ];
        const newAdsRef2 = firestore.collection("haunt-ads").doc(hauntId).collection("ads");
        for (const ad of existingAds) {
          const existingDoc = await newAdsRef2.doc(ad.id).get();
          if (!existingDoc.exists) {
            await newAdsRef2.doc(ad.id).set(ad);
            console.log(`\u{1F4E2} Migrated ad: ${ad.title}`);
          }
        }
        return res.json(existingAds);
      }
      console.log(`\u{1F4E2} No ads found for ${hauntId} in any collection structure`);
      res.json([]);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });
  app2.post("/api/ads/:hauntId", upload.single("image"), async (req, res) => {
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
        throw new Error("Firebase not configured");
      }
      const hauntConfig = await FirebaseService.getHauntConfig(hauntId);
      const adLimit = hauntConfig?.tier === "premium" ? 10 : hauntConfig?.tier === "pro" ? 5 : 3;
      const adsRef = firestore.collection("haunt-ads").doc(hauntId).collection("ads");
      const existingAds = await adsRef.get();
      if (existingAds.size >= adLimit) {
        return res.status(400).json({
          error: `Ad limit reached. Your ${hauntConfig?.tier || "basic"} tier allows up to ${adLimit} ads`
        });
      }
      const timestamp2 = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const filename = `ad-${timestamp2}${fileExtension}`;
      const storagePath = `haunt-assets/${hauntId}/ads/`;
      const uploadResult = await FirebaseService.uploadFile(
        req.file.buffer,
        filename,
        storagePath
      );
      const adData = {
        title: title.trim(),
        description: description?.trim() || "",
        link: link?.trim() || "#",
        imageUrl: uploadResult.downloadURL,
        filename,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
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
  app2.put("/api/ads/:hauntId/:adId", upload.single("image"), async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      const { title, description, link } = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const adRef = firestore.collection("haunt-ads").doc(hauntId).collection("ads").doc(adId);
      const adDoc = await adRef.get();
      if (!adDoc.exists) {
        return res.status(404).json({ error: "Ad not found" });
      }
      const updateData = {
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (title && title.trim()) {
        updateData.title = title.trim();
      }
      if (description !== void 0) {
        updateData.description = description.trim();
      }
      if (link !== void 0) {
        updateData.link = link.trim() || "#";
      }
      if (req.file) {
        const timestamp2 = Date.now();
        const fileExtension = path.extname(req.file.originalname);
        const filename = `ad-${timestamp2}${fileExtension}`;
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
  app2.delete("/api/ads/:hauntId/:adId", async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const adRef = firestore.collection("haunt-ads").doc(hauntId).collection("ads").doc(adId);
      const adDoc = await adRef.get();
      if (!adDoc.exists) {
        return res.status(404).json({ error: "Ad not found" });
      }
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
  app2.post("/api/leaderboard/:hauntId", async (req, res) => {
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
  app2.get("/api/leaderboard/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const leaderboard = await FirebaseService.getLeaderboard(hauntId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/haunt-config/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await FirebaseService.getHauntConfig(hauntId);
      res.json(config);
    } catch (error) {
      console.error("Error fetching haunt config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });
  app2.get("/api/trivia-questions/:haunt", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const { haunt } = req.params;
      const hauntId = haunt;
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      console.log(`Loading questions for haunt: ${hauntId}`);
      let questions = [];
      try {
        const hauntConfig = await FirebaseService.getHauntConfig(hauntId);
        console.log(`Loading questions for haunt: ${hauntId}`);
        const customQuestionsRef = firestore.collection("haunt-questions").doc(hauntId).collection("questions");
        const customSnapshot = await customQuestionsRef.get();
        if (!customSnapshot.empty) {
          const customQuestions = customSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          questions = [...questions, ...customQuestions];
          console.log(`\u2705 Loaded ${customQuestions.length} custom questions for ${hauntId}`);
        }
        if (hauntConfig?.triviaPacks && Array.isArray(hauntConfig.triviaPacks) && hauntConfig.triviaPacks.length > 0) {
          console.log(`Loading assigned trivia packs: ${hauntConfig.triviaPacks.join(", ")}`);
          for (const packId of hauntConfig.triviaPacks) {
            try {
              const packRef = firestore.collection("trivia-packs").doc(packId);
              const packDoc = await packRef.get();
              if (packDoc.exists) {
                const packData = packDoc.data();
                if (packData.questions && Array.isArray(packData.questions)) {
                  questions = [...questions, ...packData.questions];
                  console.log(`\u2705 Loaded ${packData.questions.length} questions from pack: ${packId}`);
                }
              }
            } catch (error) {
              console.warn(`Could not load pack ${packId}:`, error);
            }
          }
        }
        if (questions.length === 0) {
          console.log(`No questions found, loading starter-pack fallback...`);
          try {
            const starterPackRef = firestore.collection("trivia-packs").doc("starter-pack");
            const starterPackDoc = await starterPackRef.get();
            if (starterPackDoc.exists) {
              const starterData = starterPackDoc.data();
              if (starterData.questions && Array.isArray(starterData.questions)) {
                questions = [...starterData.questions];
                console.log(`\u2705 Loaded ${questions.length} questions from starter-pack fallback`);
              }
            }
          } catch (starterError) {
            console.error("Failed to load starter pack:", starterError);
          }
        }
      } catch (error) {
        console.error(`Error loading questions from Firebase for ${hauntId}:`, error);
        const emergencyQuestions = [
          { question: "What horror movie features the character Michael Myers?", choices: ["Friday the 13th", "Halloween", "Scream", "The Shining"], correct: "Halloween", explanation: "Michael Myers is the killer in the Halloween franchise." },
          { question: "Who wrote the novel 'Dracula'?", choices: ["Mary Shelley", "Edgar Allan Poe", "Bram Stoker", "H.P. Lovecraft"], correct: "Bram Stoker", explanation: "Bram Stoker published Dracula in 1897." }
        ];
        questions = [];
        for (let i = 0; i < 20; i++) {
          questions.push(emergencyQuestions[i % emergencyQuestions.length]);
        }
        console.log(`\u{1F6A8} Using emergency question set due to Firebase error. Provided ${questions.length} questions.`);
      }
      if (questions.length < 20) {
        console.error(`\u{1F6A8} CRITICAL: Still insufficient questions after all fallbacks: ${questions.length}`);
      }
      const normalizedQuestions = questions.map((q, index) => {
        const questionText = q.text || q.question || "";
        const questionAnswers = q.answers || q.choices || [];
        let correctAnswerIndex = q.correctAnswer;
        if (typeof correctAnswerIndex === "string") {
          const foundIndex = questionAnswers.findIndex((answer) => answer === correctAnswerIndex);
          correctAnswerIndex = foundIndex >= 0 ? foundIndex : 0;
        }
        if (typeof correctAnswerIndex !== "number" || correctAnswerIndex < 0 || correctAnswerIndex >= questionAnswers.length) {
          correctAnswerIndex = 0;
        }
        return {
          id: q.id || `question-${index}`,
          text: questionText,
          category: q.category || "General",
          difficulty: q.difficulty || 1,
          answers: questionAnswers,
          correctAnswer: correctAnswerIndex,
          explanation: q.explanation || "",
          points: q.points || 100
        };
      });
      const validQuestions = normalizedQuestions.filter(
        (q) => q.text && Array.isArray(q.answers) && q.answers.length >= 2 && q.answers.every((answer) => answer && answer.trim().length > 0) && typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < q.answers.length
      );
      console.log(`\u2705 Validated ${validQuestions.length} questions from ${questions.length} total (filtered ${questions.length - validQuestions.length} invalid)`);
      if (validQuestions.length < 20) {
        console.error(`\u{1F6A8} CRITICAL: Only ${validQuestions.length} valid questions available, need 20 minimum`);
        console.error(`\u{1F50D} Firebase connection status: ${firestore ? "Connected" : "Disconnected"}`);
        console.error(`\u{1F50D} Original questions loaded: ${questions.length}`);
        console.error(`\u{1F50D} Questions after validation: ${validQuestions.length}`);
        const emergencyQuestions = [
          {
            id: "emergency-1",
            text: "What horror movie features the character Michael Myers?",
            category: "Horror",
            difficulty: 1,
            answers: ["Friday the 13th", "Halloween", "Scream", "The Shining"],
            correctAnswer: 1,
            explanation: "Michael Myers is the killer in the Halloween franchise.",
            points: 100
          },
          {
            id: "emergency-2",
            text: "Who wrote the novel 'Dracula'?",
            category: "Literature",
            difficulty: 1,
            answers: ["Mary Shelley", "Edgar Allan Poe", "Bram Stoker", "H.P. Lovecraft"],
            correctAnswer: 2,
            explanation: "Bram Stoker published Dracula in 1897.",
            points: 100
          },
          {
            id: "emergency-3",
            text: "What creature is said to suck the blood of livestock?",
            category: "Cryptids",
            difficulty: 1,
            answers: ["Bigfoot", "Chupacabra", "Mothman", "Jersey Devil"],
            correctAnswer: 1,
            explanation: "The Chupacabra is known for attacking livestock.",
            points: 100
          },
          {
            id: "emergency-4",
            text: "In which state was the Salem witch trials held?",
            category: "History",
            difficulty: 1,
            answers: ["Massachusetts", "Virginia", "Pennsylvania", "Connecticut"],
            correctAnswer: 0,
            explanation: "The Salem witch trials occurred in Massachusetts in 1692.",
            points: 100
          },
          {
            id: "emergency-5",
            text: "What is the fear of ghosts called?",
            category: "Phobias",
            difficulty: 2,
            answers: ["Thanatophobia", "Phasmophobia", "Necrophobia", "Spectrophobia"],
            correctAnswer: 1,
            explanation: "Phasmophobia is the fear of ghosts and phantoms.",
            points: 100
          }
        ];
        const questionsNeeded = 20 - validQuestions.length;
        for (let i = 0; i < questionsNeeded; i++) {
          const emergencyQ = emergencyQuestions[i % emergencyQuestions.length];
          validQuestions.push({
            ...emergencyQ,
            id: `emergency-${Date.now()}-${i}`
          });
        }
        console.log(`\u{1F198} Added ${questionsNeeded} emergency questions to reach 20 total`);
      }
      const questionsToReturn = validQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
      console.log(`Returning ${questionsToReturn.length} randomized questions for ${hauntId} (from ${validQuestions.length} valid available)`);
      res.json(questionsToReturn);
    } catch (error) {
      console.error("Error fetching trivia questions:", error);
      res.status(500).json({ error: "Failed to fetch trivia questions" });
    }
  });
  app2.get("/api/debug/questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      if (!firestore) {
        return res.json({ error: "Firebase not configured", collections: [] });
      }
      const collections = [];
      const collectionsToCheck = [
        "horror-basics",
        "trivia-questions",
        "question-packs",
        `haunt-questions/${hauntId}/questions`
      ];
      for (const collectionName of collectionsToCheck) {
        try {
          let ref;
          if (collectionName.includes("/")) {
            const parts = collectionName.split("/");
            ref = firestore.collection(parts[0]).doc(parts[1]).collection(parts[2]);
          } else {
            ref = firestore.collection(collectionName);
          }
          const snapshot = await ref.get();
          collections.push({
            name: collectionName,
            documentCount: snapshot.docs.length,
            documents: snapshot.docs.map((doc) => ({
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
  app2.post("/api/initialize-data", async (req, res) => {
    try {
      await FirebaseService.saveHauntConfig("trivia-packs/horror-basics", {
        accessType: "all",
        name: "Horror Basics",
        description: "Classic horror trivia",
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
      await FirebaseService.saveHauntConfig("widowshollow", {
        name: "Widow's Hollow",
        theme: "Victorian Gothic",
        primaryColor: "#8B0000",
        secondaryColor: "#2F1B14",
        tier: "premium",
        logo: "/icons/icon-192.png"
      });
      await FirebaseService.saveHauntConfig("headquarters", {
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
  app2.post("/api/haunt-config/:hauntId", async (req, res) => {
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
  app2.post("/api/ad-metrics/:hauntId/:adIndex/:metric", async (req, res) => {
    try {
      const { hauntId, adIndex, metric } = req.params;
      if (!firestore || !["views", "clicks"].includes(metric)) {
        throw new Error("Invalid request");
      }
      const metricsRef = firestore.collection("ad-metrics").doc(hauntId).collection("ads").doc(`ad${adIndex}`);
      const doc = await metricsRef.get();
      if (doc.exists) {
        await metricsRef.update({ [metric]: (doc.data()[metric] || 0) + 1 });
      } else {
        await metricsRef.set({
          views: metric === "views" ? 1 : 0,
          clicks: metric === "clicks" ? 1 : 0
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad metric:", error);
      res.status(500).json({ error: "Failed to track ad metric" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    const hauntId = req.query.haunt;
    if (!hauntId) {
      return res.status(400).json({ error: "haunt parameter is required" });
    }
    res.redirect(`/api/leaderboard/${hauntId}`);
  });
  app2.post("/api/leaderboard", async (req, res) => {
    try {
      const entry = leaderboardEntrySchema.parse(req.body);
      await FirebaseService.saveLeaderboardEntry(entry.haunt, entry);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving leaderboard entry:", error);
      res.status(500).json({ error: "Failed to save leaderboard entry" });
    }
  });
  app2.get("/api/leaderboard/:hauntId", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const { hauntId } = req.params;
      console.log(`[LEADERBOARD FETCH] Getting leaderboard for haunt: ${hauntId}`);
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const leaderboardRef = firestore.collection("leaderboards").doc(hauntId).collection("players");
      const snapshot = await leaderboardRef.where("hidden", "!=", true).orderBy("hidden").orderBy("score", "desc").limit(10).get();
      console.log(`[LEADERBOARD FETCH] Found ${snapshot.docs.length} player records`);
      const players = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`[LEADERBOARD FETCH] Player data:`, {
          playerName: data.playerName,
          score: data.score,
          gameType: data.gameType
        });
        return {
          name: data.playerName,
          score: data.score,
          date: data.lastPlayed?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
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
  app2.post("/api/moderate/:hauntId/:playerId", async (req, res) => {
    try {
      const { hauntId, playerId } = req.params;
      const { hidden } = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const leaderboardRef = firestore.collection("leaderboards").doc(hauntId).collection("players").doc(playerId);
      await leaderboardRef.update({
        hidden,
        moderatedAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error moderating player:", error);
      res.status(500).json({ error: "Failed to moderate player" });
    }
  });
  app2.get("/api/custom-questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      const customQuestionsRef = firestore.collection("haunt-questions").doc(hauntId).collection("questions");
      const snapshot = await customQuestionsRef.orderBy("timestamp", "desc").get();
      if (snapshot.empty) {
        return res.json([]);
      }
      const customQuestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`\u{1F4DD} Loaded ${customQuestions.length} custom questions for ${hauntId}`);
      res.json(customQuestions);
    } catch (error) {
      console.error("Error fetching custom questions:", error);
      res.status(500).json({ error: "Failed to fetch custom questions" });
    }
  });
  app2.post("/api/custom-questions/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { questions } = req.body;
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions array is required" });
      }
      const customQuestionsRef = firestore.collection("haunt-questions").doc(hauntId).collection("questions");
      const existingSnapshot = await customQuestionsRef.get();
      const batch = firestore.batch();
      existingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      questions.forEach((question) => {
        const newQuestionRef = customQuestionsRef.doc();
        batch.set(newQuestionRef, {
          question: question.question,
          choices: question.choices,
          correct: question.correct,
          explanation: question.explanation || "",
          timestamp: /* @__PURE__ */ new Date()
        });
      });
      await batch.commit();
      console.log(`\u{1F4BE} Saved ${questions.length} custom questions for ${hauntId}`);
      res.json({ success: true, count: questions.length });
    } catch (error) {
      console.error("Error saving custom questions:", error);
      res.status(500).json({ error: "Failed to save custom questions" });
    }
  });
  app2.get("/api/haunt-config/:hauntId", async (req, res) => {
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
  app2.post("/api/haunt-config", async (req, res) => {
    try {
      const config = hauntConfigSchema.parse(req.body);
      await FirebaseService.saveHauntConfig(config.id, config);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });
  app2.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const sessionRef = firestore.collection("game_sessions").doc(sessionId);
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
  app2.post("/api/session", async (req, res) => {
    try {
      const sessionData = req.body;
      const sessionId = req.sessionID || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const sessionRef = firestore.collection("game_sessions").doc(sessionId);
      await sessionRef.set({
        ...sessionData,
        sessionId,
        startTime: /* @__PURE__ */ new Date(),
        status: "active"
      });
      res.json({ success: true, sessionId });
    } catch (error) {
      console.error("Error saving session:", error);
      res.status(500).json({ error: "Failed to save session" });
    }
  });
  app2.put("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const sessionRef = firestore.collection("game_sessions").doc(sessionId);
      await sessionRef.update({
        ...updates,
        endTime: /* @__PURE__ */ new Date(),
        status: "completed"
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });
  app2.get("/api/uber/trivia-packs", async (req, res) => {
    try {
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      const packsRef = firestore.collection("trivia-packs");
      const snapshot = await packsRef.get();
      const packs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        packs.push({
          id: doc.id,
          name: data.name || "Unnamed Pack",
          questionCount: data.questions ? data.questions.length : 0,
          description: data.description || ""
        });
      });
      res.json(packs);
    } catch (error) {
      console.error("Error fetching trivia packs:", error);
      res.status(500).json({ error: "Failed to fetch trivia packs" });
    }
  });
  app2.get("/api/uber/haunts", async (req, res) => {
    try {
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      const hauntsRef = firestore.collection("haunts");
      const snapshot = await hauntsRef.get();
      const haunts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        haunts.push({
          id: doc.id,
          name: data.name || "Unnamed Haunt",
          triviaPacks: data.triviaPacks || []
        });
      });
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });
  app2.post("/api/uber/assign-trivia-pack", async (req, res) => {
    try {
      const { hauntId, packId } = req.body;
      if (!hauntId || !packId) {
        return res.status(400).json({ error: "Both hauntId and packId are required" });
      }
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      const hauntRef = firestore.collection("haunts").doc(hauntId);
      const hauntDoc = await hauntRef.get();
      if (!hauntDoc.exists) {
        return res.status(404).json({ error: "Haunt not found" });
      }
      const hauntData = hauntDoc.data();
      const currentPacks = hauntData.triviaPacks || [];
      if (!currentPacks.includes(packId)) {
        const updatedPacks = [...currentPacks, packId];
        await hauntRef.update({ triviaPacks: updatedPacks });
        res.json({
          success: true,
          message: `Pack ${packId} assigned to ${hauntId}`,
          triviaPacks: updatedPacks
        });
      } else {
        res.json({
          success: true,
          message: `Pack ${packId} already assigned to ${hauntId}`,
          triviaPacks: currentPacks
        });
      }
    } catch (error) {
      console.error("Error assigning trivia pack:", error);
      res.status(500).json({ error: "Failed to assign trivia pack" });
    }
  });
  app2.delete("/api/uber/trivia-pack/:packId", async (req, res) => {
    try {
      const { packId } = req.params;
      if (!firestore) {
        return res.status(500).json({ error: "Firebase not configured" });
      }
      const packRef = firestore.collection("trivia-packs").doc(packId);
      await packRef.delete();
      res.json({ success: true, message: `Trivia pack ${packId} deleted successfully` });
    } catch (error) {
      console.error("Error deleting trivia pack:", error);
      res.status(500).json({ error: "Failed to delete trivia pack" });
    }
  });
  app2.post("/api/analytics/session", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const sessionData = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const sessionRef = firestore.collection("game_sessions").doc();
      await sessionRef.set({
        ...sessionData,
        startTime: /* @__PURE__ */ new Date(),
        status: "active"
      });
      res.json({ success: true, id: sessionRef.id });
    } catch (error) {
      console.error("Error creating analytics session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app2.put("/api/analytics/session/:sessionId", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const { sessionId } = req.params;
      const updateData = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const sessionRef = firestore.collection("game_sessions").doc(sessionId);
      await sessionRef.update({
        ...updateData,
        endTime: /* @__PURE__ */ new Date(),
        status: "completed"
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating analytics session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });
  app2.post("/api/analytics/ad-interaction", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const interactionData = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const interactionRef = firestore.collection("ad_interactions").doc();
      await interactionRef.set({
        ...interactionData,
        hauntId: interactionData.haunt,
        // Ensure both field names are available
        timestamp: /* @__PURE__ */ new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad interaction:", error);
      res.status(500).json({ error: "Failed to track interaction" });
    }
  });
  app2.post("/api/track-ad", async (req, res) => {
    try {
      const { hauntId, adData, interactionType, sessionId } = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const interactionRef = firestore.collection("ad_interactions").doc();
      await interactionRef.set({
        hauntId,
        adId: adData.id,
        interactionType,
        // 'view' or 'click'
        timestamp: /* @__PURE__ */ new Date(),
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
  app2.get("/api/analytics/:hauntId", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const { hauntId } = req.params;
      const { timeRange = "30d" } = req.query;
      console.log(`[ANALYTICS] Fetching analytics for haunt: ${hauntId}, timeRange: ${timeRange}`);
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const now = /* @__PURE__ */ new Date();
      const startDate = /* @__PURE__ */ new Date("2020-01-01");
      console.log(`[ANALYTICS] Date range: ${startDate.toISOString()} to ${now.toISOString()}`);
      const sessionsRef = firestore.collection("game_sessions").where("hauntId", "==", hauntId);
      const sessionsSnapshot = await sessionsRef.get();
      const allSessions = sessionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(data.startTime),
          endTime: data.endTime?.toDate?.() || new Date(data.endTime)
        };
      });
      const sessions = allSessions.filter((session) => {
        const sessionTime = session.startTime;
        return sessionTime >= startDate && sessionTime <= now;
      });
      console.log(`[ANALYTICS] Found ${sessions.length} sessions in range from ${allSessions.length} total`);
      if (allSessions.length > 0) {
        console.log(`[ANALYTICS] Sample session timestamps:`, allSessions.slice(0, 3).map((s) => ({
          startTime: s.startTime instanceof Date && !isNaN(s.startTime.getTime()) ? s.startTime.toISOString() : "Invalid Date",
          hauntId: s.hauntId,
          status: s.status
        })));
      }
      const adInteractionsRef = firestore.collection("ad_interactions").where("haunt", "==", hauntId);
      const adInteractionsSnapshot = await adInteractionsRef.get();
      const allAdInteractions = adInteractionsSnapshot.docs.map((doc) => doc.data());
      const adInteractions2 = allAdInteractions.filter((interaction) => {
        const interactionTime = interaction.timestamp?.toDate?.() || new Date(interaction.timestamp);
        return interactionTime >= startDate && interactionTime <= now;
      });
      console.log(`[ANALYTICS] Found ${adInteractions2.length} ad interactions in range`);
      if (adInteractions2.length > 0) {
        console.log(`[ANALYTICS] Sample ad interaction:`, adInteractions2[0]);
      }
      const leaderboardRef = firestore.collection("leaderboards").doc(hauntId).collection("players");
      const leaderboardSnapshot = await leaderboardRef.get();
      let leaderboardEntries2 = [];
      if (!leaderboardSnapshot.empty) {
        leaderboardEntries2 = leaderboardSnapshot.docs.map((doc) => {
          const data = doc.data();
          let timestamp2 = /* @__PURE__ */ new Date();
          try {
            if (data.timestamp && typeof data.timestamp._seconds === "number") {
              timestamp2 = new Date(data.timestamp._seconds * 1e3);
            } else if (data.timestamp?.toDate && typeof data.timestamp.toDate === "function") {
              timestamp2 = data.timestamp.toDate();
            } else if (data.lastPlayed?.toDate && typeof data.lastPlayed.toDate === "function") {
              timestamp2 = data.lastPlayed.toDate();
            } else if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
              timestamp2 = data.createdAt.toDate();
            }
          } catch (e) {
            console.log(`[ANALYTICS] Timestamp conversion error for entry:`, e);
          }
          return {
            id: doc.id,
            playerName: data.name || data.playerName,
            score: data.score || 0,
            questionsAnswered: data.questionsAnswered || 20,
            correctAnswers: data.correctAnswers || 0,
            haunt: data.haunt || hauntId,
            timestamp: timestamp2
          };
        }).filter((entry) => entry.playerName);
      }
      console.log(`[ANALYTICS] Processing ${leaderboardEntries2.length} leaderboard entries`);
      if (leaderboardEntries2.length > 0) {
        console.log(`[ANALYTICS] Sample entry timestamps:`, leaderboardEntries2.slice(0, 3).map((e) => ({
          playerName: e.playerName,
          score: e.score,
          timestamp: e.timestamp instanceof Date && !isNaN(e.timestamp.getTime()) ? e.timestamp.toISOString() : "Invalid Date"
        })));
      }
      const leaderboardEntriesInRange = leaderboardEntries2;
      console.log(`[ANALYTICS] Using ${leaderboardEntriesInRange.length} leaderboard entries for metrics`);
      const totalGames = leaderboardEntriesInRange.length || sessions.length;
      const uniquePlayers = leaderboardEntriesInRange.length > 0 ? new Set(leaderboardEntriesInRange.map((e) => e.playerName).filter(Boolean)).size : new Set(sessions.map((s) => s.playerId).filter(Boolean)).size;
      const avgScore = leaderboardEntriesInRange.length > 0 ? Math.round(leaderboardEntriesInRange.reduce((sum, e) => sum + (e.score || 0), 0) / leaderboardEntriesInRange.length) : 0;
      const completionRate = leaderboardEntriesInRange.length > 0 ? Math.round(leaderboardEntriesInRange.filter((e) => e.questionsAnswered >= 20).length / leaderboardEntriesInRange.length * 100) : sessions.length > 0 ? Math.round(sessions.filter((s) => s.status === "completed").length / sessions.length * 100) : 0;
      const adViews = adInteractions2.filter((interaction) => interaction.action === "view" || interaction.interactionType === "view").length;
      const adClicks = adInteractions2.filter((interaction) => interaction.action === "click" || interaction.interactionType === "click").length;
      const adClickThrough = adViews > 0 ? adClicks / adViews * 100 : 0;
      console.log(`[ANALYTICS] Ad metrics calculation: views=${adViews}, clicks=${adClicks}, CTR=${adClickThrough}%`);
      const sessionsWithDuration = sessions.filter((s) => s.startTime && s.endTime);
      const totalSessionTime = sessionsWithDuration.reduce((sum, s) => {
        const duration = s.endTime.getTime() - s.startTime.getTime();
        return sum + duration;
      }, 0);
      const avgSessionTime = sessionsWithDuration.length > 0 ? Math.round(totalSessionTime / sessionsWithDuration.length / 1e3 / 60) : leaderboardEntriesInRange.length > 0 ? 8 : 0;
      const actualDaysSpan = leaderboardEntriesInRange.length > 0 ? Math.max(1, Math.ceil((now.getTime() - Math.min(...leaderboardEntriesInRange.map((e) => e.timestamp.getTime()))) / (1e3 * 60 * 60 * 24))) : 30;
      const dailyAverage = Math.round(totalGames / actualDaysSpan * 10) / 10;
      const dataSource = leaderboardEntriesInRange.length > 0 ? leaderboardEntriesInRange : sessions;
      const sessionsByDay = {};
      dataSource.forEach((item) => {
        const timestamp2 = item.timestamp || item.startTime;
        const day = timestamp2.toISOString().split("T")[0];
        sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
      });
      const peakActivity = Object.keys(sessionsByDay).length > 0 ? Object.entries(sessionsByDay).reduce(
        (peak, [day, count]) => count > (sessionsByDay[peak] || 0) ? day : peak,
        Object.keys(sessionsByDay)[0]
      ) : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const returnPlayerRate = totalGames > 0 && uniquePlayers > 0 ? Math.round((totalGames - uniquePlayers) / totalGames * 100 * 10) / 10 : 0;
      const adPerformanceMap = {};
      adInteractions2.forEach((interaction) => {
        const adId = interaction.adId;
        if (!adId) return;
        if (!adPerformanceMap[adId]) {
          adPerformanceMap[adId] = { views: 0, clicks: 0 };
        }
        const action = interaction.action || interaction.interactionType;
        if (action === "view") {
          adPerformanceMap[adId].views++;
        } else if (action === "click") {
          adPerformanceMap[adId].clicks++;
        }
      });
      const adPerformanceData = Object.entries(adPerformanceMap).map(([adId, metrics]) => ({
        adId,
        views: metrics.views,
        clicks: metrics.clicks,
        ctr: metrics.views > 0 ? metrics.clicks / metrics.views * 100 : 0
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
  app2.get("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const adsRef = firestore.collection("ads").doc(hauntId).collection("adList");
      const snapshot = await adsRef.orderBy("position").get();
      const ads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });
  app2.post("/api/ads/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const adData = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const adsRef = firestore.collection("ads").doc(hauntId).collection("adList");
      if (adData.id) {
        await adsRef.doc(adData.id).update(adData);
      } else {
        await adsRef.add(adData);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving ad:", error);
      res.status(500).json({ error: "Failed to save ad" });
    }
  });
  app2.delete("/api/ads/:hauntId/:adId", async (req, res) => {
    try {
      const { hauntId, adId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const adRef = firestore.collection("ads").doc(hauntId).collection("adList").doc(adId);
      await adRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });
  app2.get("/api/haunts", async (req, res) => {
    try {
      const haunts = await FirebaseService.getAllHaunts();
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });
  app2.get("/api/haunt/:hauntId/check", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const config = await FirebaseService.getHauntConfig(hauntId);
      res.json({ exists: !!config, isActive: config?.isActive || false });
    } catch (error) {
      res.json({ exists: false, isActive: false });
    }
  });
  app2.post("/api/haunt/:hauntId/auth", async (req, res) => {
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
      if (config.authCode && config.authCode !== authCode) {
        return res.status(401).json({ error: "Invalid access code" });
      }
      res.json({ success: true, config });
    } catch (error) {
      console.error("Error authenticating haunt:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  app2.post("/api/haunt/:hauntId/email-auth/add", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const success = await ServerEmailAuthService.addAuthorizedEmail(hauntId, email);
      if (success) {
        res.json({ success: true, message: "Email authorized successfully" });
      } else {
        res.status(500).json({ error: "Failed to authorize email" });
      }
    } catch (error) {
      console.error("Error adding authorized email:", error);
      res.status(500).json({ error: "Failed to authorize email" });
    }
  });
  app2.post("/api/haunt/:hauntId/email-auth/remove", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const success = await ServerEmailAuthService.removeAuthorizedEmail(hauntId, email);
      if (success) {
        res.json({ success: true, message: "Email authorization removed" });
      } else {
        res.status(500).json({ error: "Failed to remove email authorization" });
      }
    } catch (error) {
      console.error("Error removing authorized email:", error);
      res.status(500).json({ error: "Failed to remove email authorization" });
    }
  });
  app2.get("/api/haunt/:hauntId/email-auth/emails", async (req, res) => {
    try {
      const { hauntId } = req.params;
      console.log(`Getting authorized emails for haunt: ${hauntId}`);
      const emails = await ServerEmailAuthService.getAuthorizedEmails(hauntId);
      console.log(`Found ${emails.length} authorized emails for ${hauntId}`);
      res.json({ emails });
    } catch (error) {
      console.error("Error fetching authorized emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });
  app2.get("/api/haunt/:hauntId/email-auth/list", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const emails = await ServerEmailAuthService.getAuthorizedEmails(hauntId);
      res.json({ emails });
    } catch (error) {
      console.error("Error listing authorized emails:", error);
      res.status(500).json({ error: "Failed to list authorized emails" });
    }
  });
  app2.post("/api/haunt/:hauntId/email-auth/validate", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const isAuthorized = await ServerEmailAuthService.isEmailAuthorized(hauntId, email);
      res.json({ authorized: isAuthorized });
    } catch (error) {
      console.error("Error validating email:", error);
      res.status(500).json({ error: "Failed to validate email" });
    }
  });
  app2.post("/api/haunt/:hauntId/email-auth/initialize", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const success = await ServerEmailAuthService.initializeHauntAuth(hauntId, email);
      if (success) {
        res.json({ success: true, message: "Haunt authentication initialized" });
      } else {
        res.status(400).json({ error: "Haunt already has authentication configured" });
      }
    } catch (error) {
      console.error("Error initializing haunt auth:", error);
      res.status(500).json({ error: "Failed to initialize authentication" });
    }
  });
  app2.post("/api/haunt/:hauntId/email-auth/send", async (req, res) => {
    try {
      const { hauntId } = req.params;
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      console.log(`Generating auth link for ${email} to access haunt ${hauntId}`);
      const hauntConfig = await FirebaseService.getHauntConfig(hauntId);
      const hauntName = hauntConfig?.name || hauntId;
      const { getAuth } = __require("firebase-admin/auth");
      const adminAuth = getAuth();
      const actionCodeSettings = {
        url: `${req.get("origin") || "http://localhost:5000"}/haunt-auth/${hauntId}?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true
      };
      const authLink = await adminAuth.generateSignInWithEmailLink(email, actionCodeSettings);
      console.log(`Generated Firebase auth link for ${email}: ${authLink.substring(0, 50)}...`);
      res.json({
        success: true,
        message: `Authentication link generated for ${email}`,
        authLink,
        hauntName,
        instructions: `Share this link with ${email} to grant them admin access to "${hauntName}". The link will authenticate them automatically when clicked.`
      });
    } catch (error) {
      console.error("Error generating auth link:", error);
      res.status(500).json({
        error: error.message || "Failed to generate authentication link",
        details: "Check Firebase admin configuration and email format"
      });
    }
  });
  app2.get("/api/uber/haunts", async (req, res) => {
    try {
      const haunts = await FirebaseService.getAllHaunts();
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts for uber admin:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });
  app2.post("/api/uber/haunt", async (req, res) => {
    try {
      const hauntData = req.body;
      await FirebaseService.saveHauntConfig(hauntData.id, hauntData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating haunt:", error);
      res.status(500).json({ error: "Failed to create haunt" });
    }
  });
  app2.put("/api/uber/haunt/:hauntId", async (req, res) => {
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
  app2.delete("/api/uber/haunt/:hauntId", async (req, res) => {
    try {
      const { hauntId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntRef = firestore.collection("hauntConfigs").doc(hauntId);
      await hauntRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting haunt:", error);
      res.status(500).json({ error: "Failed to delete haunt" });
    }
  });
  app2.get("/api/uber/trivia-packs", async (req, res) => {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const packsSnapshot = await firestore.collection("trivia-packs").get();
      const packs = packsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || doc.id,
          questionCount: data.questions ? data.questions.length : 0,
          description: data.description || ""
        };
      });
      res.json(packs);
    } catch (error) {
      console.error("Error fetching trivia packs:", error);
      res.status(500).json({ error: "Failed to fetch trivia packs" });
    }
  });
  app2.get("/api/uber/haunts", async (req, res) => {
    try {
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const hauntsSnapshot = await firestore.collection("hauntConfigs").get();
      const haunts = hauntsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || doc.id,
          tier: data.tier || "basic",
          triviaPacks: data.triviaPacks || []
        };
      });
      res.json(haunts);
    } catch (error) {
      console.error("Error fetching haunts:", error);
      res.status(500).json({ error: "Failed to fetch haunts" });
    }
  });
  app2.post("/api/uber/assign-trivia-pack", async (req, res) => {
    try {
      const { hauntId, triviaPacks } = req.body;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      if (!hauntId) {
        return res.status(400).json({ error: "hauntId is required" });
      }
      const hauntRef = firestore.collection("hauntConfigs").doc(hauntId);
      const hauntDoc = await hauntRef.get();
      if (!hauntDoc.exists) {
        return res.status(404).json({ error: "Haunt not found" });
      }
      await hauntRef.update({
        triviaPacks: triviaPacks || [],
        updatedAt: exportedFieldValue.serverTimestamp()
      });
      console.log(`\u2705 Successfully assigned trivia packs to ${hauntId}:`, triviaPacks);
      res.json({ success: true, hauntId, triviaPacks });
    } catch (error) {
      console.error("Error assigning trivia pack:", error);
      res.status(500).json({ error: "Failed to assign trivia pack" });
    }
  });
  app2.delete("/api/uber/trivia-pack/:packId", async (req, res) => {
    try {
      const { packId } = req.params;
      if (!firestore) {
        throw new Error("Firebase not configured");
      }
      const packRef = firestore.collection("trivia-packs").doc(packId);
      const packDoc = await packRef.get();
      if (!packDoc.exists) {
        return res.status(404).json({ error: "Trivia pack not found" });
      }
      await packRef.delete();
      console.log(`\u2705 Successfully deleted trivia pack: ${packId}`);
      res.json({ success: true, packId });
    } catch (error) {
      console.error("Error deleting trivia pack:", error);
      res.status(500).json({ error: "Failed to delete trivia pack" });
    }
  });
  app2.get("/api/sidequests", async (req, res) => {
    try {
      const { tier } = req.query;
      let sidequests;
      if (tier && typeof tier === "string") {
        sidequests = await FirebaseService.getSidequestsByTier(tier);
      } else {
        sidequests = await FirebaseService.getAllSidequests();
      }
      res.json(sidequests);
    } catch (error) {
      console.error("Error fetching sidequests:", error);
      res.status(500).json({ error: "Failed to fetch sidequests" });
    }
  });
  app2.get("/api/sidequests/:sidequestId", async (req, res) => {
    try {
      const { sidequestId } = req.params;
      const sidequest = await FirebaseService.getSidequest(sidequestId);
      if (!sidequest) {
        return res.status(404).json({ error: "Sidequest not found" });
      }
      res.json(sidequest);
    } catch (error) {
      console.error("Error fetching sidequest:", error);
      res.status(500).json({ error: "Failed to fetch sidequest" });
    }
  });
  app2.post("/api/sidequests/progress", async (req, res) => {
    try {
      const progressData = req.body;
      await FirebaseService.saveSidequestProgress(progressData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving sidequest progress:", error);
      res.status(500).json({ error: "Failed to save progress" });
    }
  });
  app2.get("/api/sidequests/:sidequestId/progress/:sessionId", async (req, res) => {
    try {
      const { sidequestId, sessionId } = req.params;
      const { hauntId } = req.query;
      const progress = await FirebaseService.getSidequestProgress(
        hauntId,
        sidequestId,
        sessionId
      );
      res.json(progress || {});
    } catch (error) {
      console.error("Error fetching sidequest progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });
  return server;
}
__name(registerRoutes, "registerRoutes");

// server/index.ts
import path6 from "path";
function log4(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
__name(log4, "log");
var app = express4();
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path7 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path7.startsWith("/api")) {
      let logLine = `${req.method} ${path7} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log4(logLine);
    }
  });
  next();
});
(async () => {
  app.get("/launcher", (req, res) => {
    res.sendFile(path6.resolve(process.cwd(), "client", "public", "launcher.html"));
  });
  app.get("/launcher/:hauntId", (req, res) => {
    res.sendFile(path6.resolve(process.cwd(), "client", "public", "launcher.html"));
  });
  const server = await registerRoutes(app);
  if (process.env.NODE_ENV === "development") {
    try {
      const { setupVite: setupVite3 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
      await setupVite3(app, server);
    } catch (error) {
      log4("Vite configuration error, using bypass mode");
      const { setupVite: setupVite3 } = await Promise.resolve().then(() => (init_vite_bypass(), vite_bypass_exports));
      await setupVite3(app, server);
    }
  } else {
    const { serveStatic: serveStatic4 } = await Promise.resolve().then(() => (init_production(), production_exports));
    serveStatic4(app);
  }
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5e3;
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    log4(`serving on ${host}:${port}`);
  });
})();
