import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Creating deployment build...");

// Step 1: Build client assets
execSync("npx vite build", { stdio: "inherit" });

// Step 2: Create dist folder if not exists
if (!fs.existsSync("dist")) fs.mkdirSync("dist");

// Step 3: Copy server entry to dist/index.js
const serverEntry = "server/index.js"; // adjust if your server file is elsewhere
if (!fs.existsSync(serverEntry)) {
  throw new Error(`Server entrypoint ${serverEntry} does not exist!`);
}
fs.copyFileSync(serverEntry, "dist/index.js");

// Step 4: Write minimal package.json into dist/
fs.writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      type: "module",
      dependencies: {
        express: "^4.18.2",
        dotenv: "^16.3.1"
      },
      scripts: {
        start: "node index.js"
      }
    },
    null,
    2
  )
);

console.log("✅ Build complete. Ready for deployment.");
