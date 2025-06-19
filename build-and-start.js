import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const distPath = path.resolve("dist/index.js");

try {
  console.log("🔨 Creating server-only deployment build...");
  
  // Create dist directory
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true });
  }
  fs.mkdirSync('./dist', { recursive: true });

  // Copy client assets directly (bypass Vite timeout)
  if (fs.existsSync('./client/public')) {
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyRecursive('./client/public', './dist/public');
    
    // Create minimal index.html for production
    const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
</head>
<body>
    <div id="root">
        <h1>Heinous Trivia Server</h1>
        <p>API endpoints available at /api/*</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('./dist/public/index.html', productionHtml);
    console.log("📁 Client assets copied");
  }

  console.log("⚙️  Building server...");
  execSync(
    `npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --banner:js='import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'`,
    { stdio: "inherit" }
  );

  // Create production package.json
  const prodPackageJson = {
    name: "heinous-trivia-production",
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: {
      start: "NODE_ENV=production node index.js"
    },
    engines: {
      node: ">=18.0.0"
    },
    dependencies: {
      "@neondatabase/serverless": "^0.10.4",
      "drizzle-orm": "^0.36.4", 
      "firebase-admin": "^13.0.1",
      "express": "^4.21.1",
      "bcrypt": "^6.0.0",
      "ws": "^8.18.0"
    }
  };
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  console.log("📦 Production package.json created");

  if (!fs.existsSync(distPath)) {
    console.error("❌ dist/index.js not found after build. Aborting.");
    process.exit(1);
  }

  console.log("🚀 Starting server...");
  execSync("node dist/index.js", { stdio: "inherit" });
} catch (err) {
  console.error("💥 Error in build-and-start:", err);
  process.exit(1);
}
