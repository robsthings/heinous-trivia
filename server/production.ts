import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "production") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Define the possible locations of the built static files
  const candidatePaths = [
    path.resolve(process.cwd(), "dist", "public"), // <- Most likely correct
    path.resolve(process.cwd(), "client", "public"),
    path.resolve(process.cwd(), "public"),
  ];

  let staticPath: string | null = null;

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      staticPath = candidate;
      break;
    }
  }

if (!staticPath) {
  log(`Warning: No static directory found. Checked: ${publicPath}, ${distPublicPath}, ${clientPublicPath}`, "production");

    app.use("*", (_req, res) => {
      res.status(200).json({ message: "Heinous Trivia API Server Running", status: "ok" });
    });
    return;
  }

  log(`Serving static files from: ${staticPath}`, "production");
  app.use(express.static(staticPath));

  // Serve index.html for SPA fallback (i.e. React Router)
  app.use("*", (_req, res) => {
    const indexPath = path.join(staticPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Page not found", status: "error" });
    }
  });
}
