#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Creating deployment build - using proper Vite client build...");

// Clean dist directory
const distPath = './dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Build client using Vite
console.log("📦 Building client with Vite...");
try {
  execSync("npx vite build", { stdio: "inherit" });
  console.log("✅ Client build complete");
} catch (error) {
  console.error("❌ Vite build failed:", error.message);
  process.exit(1);
}

// Copy server entry to dist/index.js
console.log("🔧 Copying server files...");
if (fs.existsSync("server/index.ts")) {
  fs.copyFileSync("server/index.ts", "dist/index.js");
  console.log("✅ Copied server/index.ts to dist/index.js");
} else if (fs.existsSync("server/index.js")) {
  fs.copyFileSync("server/index.js", "dist/index.js");
  console.log("✅ Copied server/index.js to dist/index.js");
} else {
  console.error("❌ No server entry point found");
  process.exit(1);
}

// Create production package.json
console.log("📝 Creating production package.json...");
const productionPackage = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@neondatabase/serverless": "^1.0.1",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "tsx": "^3.14.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));

// Verify build
console.log("🔍 Verifying build outputs...");
const distIndexExists = fs.existsSync("dist/index.js");
const distPackageExists = fs.existsSync("dist/package.json");
const distPublicExists = fs.existsSync("dist/public");

if (distIndexExists && distPackageExists && distPublicExists) {
  const serverSize = fs.statSync("dist/index.js").size;
  const packageSize = fs.statSync("dist/package.json").size;
  
  console.log("");
  console.log("✅ BUILD SUCCESSFUL");
  console.log(`📁 dist/index.js: ${(serverSize/1024).toFixed(1)}KB`);
  console.log(`📁 dist/package.json: ${(packageSize/1024).toFixed(1)}KB`);
  console.log("📁 dist/public/: Vite build output");
  console.log("");
  console.log("🚀 Deploy: node dist/index.js");
  console.log("⚡ Health: /api/health");
} else {
  console.error("❌ Build verification failed");
  console.error(`dist/index.js exists: ${distIndexExists}`);
  console.error(`dist/package.json exists: ${distPackageExists}`);
  console.error(`dist/public exists: ${distPublicExists}`);
  process.exit(1);
}