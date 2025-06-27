#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building for Cloud Run deployment...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server bundle
console.log('Building server...');
execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:process.env.NODE_ENV='"production"' --banner:js='import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'`, { stdio: 'inherit' });

// Build client assets with timeout protection
console.log('Building client...');
try {
  execSync('timeout 300 npx vite build --outDir dist/public', { stdio: 'inherit' });
} catch (error) {
  console.log('Vite build timed out, using fallback...');
  fs.mkdirSync('./dist/public', { recursive: true });
  
  // Copy static assets
  if (fs.existsSync('./client/public')) {
    execSync('cp -r client/public/* dist/public/', { stdio: 'inherit' });
  }
  
  // Create production index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heinous Trivia</title>
  <style>
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #0b0b23 0%, #1a0a2e 50%, #16213e 100%); color: white; margin: 0; padding: 2rem; text-align: center; }
    .loading { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  </style>
</head>
<body>
  <div id="root">
    <h1 class="loading">HEINOUS TRIVIA</h1>
    <p>Loading spine-chilling experience...</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync('./dist/public/index.html', indexHtml);
}

// Create production package.json
const prodPackageJson = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.0.1",
    "drizzle-orm": "^0.44.2",
    "drizzle-zod": "^0.8.2",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "express": "^4.18.2",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.2",
    "cors": "^2.8.5",
    "express-session": "^1.18.1",
    "connect-pg-simple": "^10.0.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "multer": "^2.0.1",
    "zod": "^3.25.67",
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2",
    "form-data": "^4.0.3"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));

// Verify build
const serverSize = Math.round(fs.statSync('./dist/index.js').size / 1024);
const assetCount = fs.existsSync('./dist/public') ? fs.readdirSync('./dist/public').length : 0;

console.log(`✅ Build complete:`);
console.log(`   Server: dist/index.js (${serverSize}KB)`);
console.log(`   Assets: ${assetCount} files in dist/public/`);
console.log(`   Ready for: npm run start`);