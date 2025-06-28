import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Creating deployment build...");

// Step 1: Build client assets
console.log("Building client assets...");
try {
  execSync("npx vite build", { stdio: "inherit" });
} catch (error) {
  console.error("Client build failed:", error.message);
  process.exit(1);
}

// Step 2: Create dist folder if not exists
if (!fs.existsSync("dist")) fs.mkdirSync("dist");

// Step 3: Compile TypeScript server to JavaScript
console.log("Compiling server...");
try {
  // Use tsx to compile the TypeScript server
  execSync("npx tsx build server/index.ts --outfile=dist/index.js", { stdio: "inherit" });
} catch (error) {
  console.log("tsx build failed, trying esbuild...");
  try {
    execSync("npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.js --external:express --external:cors --external:dotenv --external:drizzle-orm --external:firebase --external:firebase-admin --external:@neondatabase/serverless --external:drizzle-zod --external:zod", { stdio: "inherit" });
  } catch (esbuildError) {
    console.error("Server compilation failed:", esbuildError.message);
    process.exit(1);
  }
}

// Step 4: Write production package.json into dist/
const productionPackage = {
  name: "heinous-trivia-production",
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    start: "NODE_ENV=production node index.js"
  },
  dependencies: {
    "@neondatabase/serverless": "^1.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.44.2",
    "drizzle-zod": "^0.8.2",
    "express": "^4.18.2",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "zod": "^3.25.67"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));

// Step 5: Copy static assets to dist/public if they exist
if (fs.existsSync("client/dist")) {
  console.log("Copying static assets...");
  if (fs.existsSync("dist/public")) {
    fs.rmSync("dist/public", { recursive: true, force: true });
  }
  
  // Copy all client build assets to dist/public
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive("client/dist", "dist/public");
}

console.log("✅ Build complete. Ready for deployment.");
console.log("📁 Deployment structure:");
console.log("  - dist/index.js (server)");
console.log("  - dist/package.json (production deps)");
console.log("  - dist/public/ (static assets)");
