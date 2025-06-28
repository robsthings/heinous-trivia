import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Creating simple deployment build...");

// Create dist folder if not exists
if (!fs.existsSync("dist")) fs.mkdirSync("dist");

// Compile TypeScript server to JavaScript using esbuild
console.log("Compiling server...");
try {
  execSync("npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.js --external:express --external:cors --external:dotenv --external:drizzle-orm --external:firebase --external:firebase-admin --external:@neondatabase/serverless --external:drizzle-zod --external:zod --external:multer --external:bcrypt --external:lightningcss --external:@babel/preset-typescript", { stdio: "inherit" });
} catch (error) {
  console.error("Server compilation failed:", error.message);
  process.exit(1);
}

// Write production package.json into dist/
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

// Copy existing client build if it exists, otherwise create minimal fallback
if (fs.existsSync("client/dist")) {
  console.log("Copying existing client assets...");
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
  
  if (fs.existsSync("dist/public")) {
    fs.rmSync("dist/public", { recursive: true, force: true });
  }
  copyRecursive("client/dist", "dist/public");
} else {
  // Create minimal public folder with fallback
  if (!fs.existsSync("dist/public")) {
    fs.mkdirSync("dist/public", { recursive: true });
  }
  
  const fallbackIndex = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Building...</title>
    <style>
        body { background: #1a1a1a; color: #fff; font-family: Arial, sans-serif; 
               display: flex; align-items: center; justify-content: center; 
               height: 100vh; margin: 0; text-align: center; }
        .container { max-width: 400px; }
        h1 { color: #ff6b35; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>System is building... Please try again in a few minutes.</p>
        <p>API endpoints are active at /api/*</p>
    </div>
</body>
</html>`;
  
  fs.writeFileSync("dist/public/index.html", fallbackIndex);
}

console.log("✅ Simple build complete. Ready for deployment.");
console.log("📁 Deployment structure:");
console.log("  - dist/index.js (server)");
console.log("  - dist/package.json (production deps)");
console.log("  - dist/public/ (static assets)");