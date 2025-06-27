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
  // In deployment, static files are served from dist/public directory
  const staticPath = path.resolve(process.cwd(), "dist", "public");
  const indexPath = path.resolve(staticPath, "index.html");

  log(`Attempting to serve static files from: ${staticPath}`);
  log(`Looking for index.html at: ${indexPath}`);

  if (!fs.existsSync(staticPath)) {
    throw new Error(
      `Static directory not found: ${staticPath}. Make sure build process creates dist/public.`,
    );
  }

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find index.html in: ${staticPath}. Make sure build process creates dist/public/index.html.`,
    );
  }

  // Serve static files from dist/public
  app.use(express.static(staticPath));
  log(`Static files configured from: ${staticPath}`);

  // Fall through to index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}