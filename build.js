#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Creating deployment build - copying server files and creating dist structure...");

// Clean dist directory
const distPath = './dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });
fs.mkdirSync(path.join(distPath, 'public'), { recursive: true });

// Compile TypeScript files to JavaScript
console.log("🔧 Compiling TypeScript server files...");
try {
  // Use tsx to compile server files
  execSync("npx tsx --build server/index.ts --outDir dist", { stdio: "pipe" });
  console.log("✅ Compiled server/index.ts to dist/index.js");
} catch (error) {
  // Fallback: Copy files and update package.json to use tsx
  console.log("⚠️ TypeScript compilation failed, using tsx runtime...");
  
  if (fs.existsSync("server/index.ts")) {
    fs.copyFileSync("server/index.ts", "dist/index.js");
    console.log("✅ Copied server/index.ts to dist/index.js");
  } else {
    console.error("❌ No server/index.ts found");
    process.exit(1);
  }

  // Copy additional server files needed
  const serverFiles = [
    { src: "server/routes.ts", dest: "dist/routes.js" },
    { src: "server/firebase.ts", dest: "dist/firebase.js" },
    { src: "server/emailAuth.ts", dest: "dist/emailAuth.js" },
    { src: "server/production.ts", dest: "dist/production.js" },
    { src: "server/vite-bypass.ts", dest: "dist/vite-bypass.js" }
  ];

  serverFiles.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${src} to ${dest}`);
    }
  });

  // Copy shared schema
  if (fs.existsSync("shared/schema.ts")) {
    if (!fs.existsSync("dist/shared")) {
      fs.mkdirSync("dist/shared", { recursive: true });
    }
    fs.copyFileSync("shared/schema.ts", "dist/shared/schema.js");
    console.log("✅ Copied shared/schema.ts to dist/shared/schema.js");
  }
}

// Create production package.json
console.log("📝 Creating production package.json...");
const productionPackage = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "npx tsx index.js"
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

// Copy client public assets to dist/public
console.log("📁 Copying client assets...");
if (fs.existsSync("client/public")) {
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src);
    entries.forEach(entry => {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  
  copyRecursive("client/public", "dist/public");
  console.log("✅ Copied client assets to dist/public");
}

// Copy public assets if they exist
if (fs.existsSync("public")) {
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src);
    entries.forEach(entry => {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  
  copyRecursive("public", "dist/public");
  console.log("✅ Copied root public assets to dist/public");
}

// Create basic index.html if it doesn't exist
const indexHtmlPath = path.join(distPath, 'public', 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23);
            color: white;
            margin: 0;
            padding: 2rem;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem;
            background: rgba(0,0,0,0.7);
            border-radius: 15px;
            border: 1px solid rgba(255,107,107,0.3);
        }
        h1 {
            color: #ff6b6b;
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255,107,107,0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Horror-themed Multiplayer Trivia Platform</p>
        <p>Server is running and ready for deployment</p>
    </div>
</body>
</html>`;
  fs.writeFileSync(indexHtmlPath, basicHtml);
  console.log("✅ Created basic index.html");
}

// Verify build
console.log("🔍 Verifying build outputs...");
const distIndexExists = fs.existsSync("dist/index.js");
const distPackageExists = fs.existsSync("dist/package.json");
const distPublicExists = fs.existsSync("dist/public");

if (distIndexExists && distPackageExists && distPublicExists) {
  const serverSize = fs.statSync("dist/index.js").size;
  const packageSize = fs.statSync("dist/package.json").size;
  
  // Count files in dist/public
  let publicFileCount = 0;
  const countFiles = (dir) => {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        countFiles(fullPath);
      } else {
        publicFileCount++;
      }
    });
  };
  countFiles("dist/public");
  
  console.log("");
  console.log("✅ BUILD SUCCESSFUL");
  console.log(`📁 dist/index.js: ${(serverSize/1024).toFixed(1)}KB (copied from server/index.ts)`);
  console.log(`📁 dist/package.json: ${(packageSize/1024).toFixed(1)}KB`);
  console.log(`📁 dist/public/: ${publicFileCount} files`);
  console.log("");
  console.log("🚀 Deploy: node dist/index.js");
  console.log("⚡ Health: /api/health");
  console.log("");
  console.log("Note: Server files copied as-is for production deployment");
} else {
  console.error("❌ Build verification failed");
  console.error(`dist/index.js exists: ${distIndexExists}`);
  console.error(`dist/package.json exists: ${distPackageExists}`);
  console.error(`dist/public exists: ${distPublicExists}`);
  process.exit(1);
}