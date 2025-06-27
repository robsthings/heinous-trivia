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
  // In deployment, static files are in the public directory within dist/
  const staticPath = path.resolve(process.cwd(), "public");
  const indexPath = path.resolve(staticPath, "index.html");

  // Check if we're in the correct deployment structure
  if (!fs.existsSync(staticPath)) {
    // Fallback: serve from current directory if public doesn't exist
    const fallbackStaticPath = process.cwd();
    const fallbackIndexPath = path.resolve(fallbackStaticPath, "index.html");
    
    if (fs.existsSync(fallbackIndexPath)) {
      app.use(express.static(fallbackStaticPath));
      app.use("*", (_req, res) => {
        res.sendFile(fallbackIndexPath);
      });
      return;
    }
  }

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find index.html in: ${staticPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(staticPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}