import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // In production deployment, static files are in dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  // Fallback to public directory if dist/public doesn't exist
  const fallbackPath = path.resolve(process.cwd(), "public");
  const staticPath = fs.existsSync(distPath) ? distPath : fallbackPath;

  if (!fs.existsSync(staticPath)) {
    log(`Warning: Static directory not found at ${staticPath}`, "production");
    // Create a minimal fallback
    app.use("*", (_req, res) => {
      res.status(200).json({ message: "Heinous Trivia API Server Running", status: "ok" });
    });
    return;
  }

  log(`Serving static files from: ${staticPath}`, "production");
  app.use(express.static(staticPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Page not found", status: "error" });
    }
  });
}