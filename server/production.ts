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
  // In deployment, static files are served from public directory relative to the deployed server location
  const staticPath = path.resolve(process.cwd(), "public");
  const indexPath = path.resolve(staticPath, "index.html");

  log(`Attempting to serve static files from: ${staticPath}`);
  log(`Looking for index.html at: ${indexPath}`);

  // Check if files exist in the expected location
  if (!fs.existsSync(staticPath)) {
    // Try alternative path structure for deployment
    const altStaticPath = path.resolve(process.cwd(), "dist", "public");
    const altIndexPath = path.resolve(altStaticPath, "index.html");
    
    log(`Static directory not found at ${staticPath}, trying alternative: ${altStaticPath}`);
    
    if (fs.existsSync(altStaticPath) && fs.existsSync(altIndexPath)) {
      log(`Using alternative static path: ${altStaticPath}`);
      app.use(express.static(altStaticPath));
      app.use("*", (_req, res) => {
        res.sendFile(altIndexPath);
      });
      return;
    }
    
    throw new Error(
      `Static directory not found at either ${staticPath} or ${altStaticPath}. Make sure build process creates public directory.`,
    );
  }

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find index.html in: ${staticPath}. Make sure build process creates public/index.html.`,
    );
  }

  // Serve static files from public directory
  app.use(express.static(staticPath));
  log(`Static files configured from: ${staticPath}`);

  // Fall through to index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}