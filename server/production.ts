import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Correct public path to Vite output
const staticPath = path.resolve(__dirname, "..", "dist", "public");

if (fs.existsSync(staticPath)) {
  console.log(`✅ Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  console.warn(`⚠️ No static files found in ${staticPath}`);
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`[production] listening on port ${port}`);
});
