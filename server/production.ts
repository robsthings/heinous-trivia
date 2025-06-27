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
  // In deployment, static files are served from the dist/public directory
  const staticPath = path.resolve(process.cwd(), "dist", "public");
  const indexPath = path.resolve(staticPath, "index.html");

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