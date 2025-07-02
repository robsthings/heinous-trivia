import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Safely resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: express.Express) {
  const publicPath = path.resolve(__dirname, "public");
  const distPublicPath = path.resolve(__dirname, "..", "dist", "public");
  const clientPublicPath = path.resolve(__dirname, "client", "public");

  const staticPath =
    fs.existsSync(distPublicPath)
      ? distPublicPath
      : fs.existsSync(publicPath)
      ? publicPath
      : fs.existsSync(clientPublicPath)
      ? clientPublicPath
      : null;

  if (!staticPath) {
    console.warn(
      `⚠️ Warning: No static directory found. Checked: ${publicPath}, ${distPublicPath}, ${clientPublicPath}`
    );
    return;
  }

  console.log(`✅ Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}
