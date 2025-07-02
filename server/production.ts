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
  // In Cloud Run deployment, we're running from the dist directory
  // So static files are in ./public relative to the dist/index.js
  const topPublicPath = path.resolve(process.cwd(), "public");
  
  // Fallback paths for different deployment scenarios
  const distPublicPath = path.resolve(process.cwd(), "dist", "public");
  const clientPublicPath = path.resolve(process.cwd(), "client", "public");
  
  let staticPath;
  if (fs.existsSync(topPublicPath)) {
    staticPath = topPublicPath;
  } else if (fs.existsSync(distPublicPath)) {
    staticPath = distPublicPath;
  } else if (fs.existsSync(clientPublicPath)) {
    staticPath = clientPublicPath;
  } else {
    staticPath = null;
  }

  if (!staticPath) {
    log(`Warning: No static directory found. Checked: ${topPublicPath}, ${distPublicPath}, ${clientPublicPath}`, "production");
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
