import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Firebase Storage and API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add cache-busting headers for development
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register API routes first to ensure they take priority over static serving
  const server = await registerRoutes(app);

  // Add launcher routes after API routes
  app.get("/launcher", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "public", "launcher.html"));
  });

  // Haunt-specific launcher route
  app.get("/launcher/:hauntId", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "public", "launcher.html"));
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });



  // Custom static serving for production that preserves API routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Add middleware to handle non-API routes with static serving
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        // Let API routes through to 404 if not found
        return next();
      }
      // Handle static files and SPA routing
      const distPath = path.resolve(import.meta.dirname, "server", "public");
      if (fs.existsSync(distPath)) {
        express.static(distPath)(req, res, () => {
          // If static file not found, serve index.html for SPA routes
          res.sendFile(path.resolve(distPath, "index.html"));
        });
      } else {
        next();
      }
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
