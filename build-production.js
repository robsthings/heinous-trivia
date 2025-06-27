#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for production deployment...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Step 1: Build the client with Vite
console.log('📦 Building client application...');
try {
  execSync('npx vite build --config vite.config.ts', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 2: Build the server with esbuild
console.log('⚙️ Building server bundle...');
try {
  const esbuildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outfile=dist/index.js',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--banner:js="import { fileURLToPath } from \'url\'; import { dirname } from \'path\'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"'
  ].join(' ');

  execSync(esbuildCommand, { 
    stdio: 'inherit',
    timeout: 60000 // 1 minute timeout
  });
  console.log('✅ Server bundle created');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production package.json
console.log('📋 Creating production package.json...');
const prodPackageJson = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production PORT=5000 node index.js"
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
console.log('✅ Production package.json created');

// Step 4: Copy static assets
console.log('📁 Setting up static assets...');

// Create public directory in dist
fs.mkdirSync('./dist/public', { recursive: true });

// If client build created assets in dist/client, move them to dist/public
if (fs.existsSync('./dist/client')) {
  console.log('📂 Moving Vite build assets...');
  const moveDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (fs.statSync(srcPath).isDirectory()) {
        moveDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  moveDir('./dist/client', './dist/public');
  fs.rmSync('./dist/client', { recursive: true, force: true });
}

// Copy any remaining static assets from client/public
if (fs.existsSync('./client/public')) {
  console.log('📂 Copying additional static assets...');
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      // Skip if file already exists from Vite build
      if (fs.existsSync(destPath)) continue;
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir('./client/public', './dist/public');
}

// Ensure index.html exists
if (!fs.existsSync('./dist/public/index.html')) {
  if (fs.existsSync('./client/index.html')) {
    fs.copyFileSync('./client/index.html', './dist/public/index.html');
  } else {
    // Create a basic index.html if none exists
    const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
    fs.writeFileSync('./dist/public/index.html', basicHtml);
  }
}

console.log('✅ Static assets configured');

// Step 5: Verify build outputs
console.log('🔍 Verifying build outputs...');
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html',
  'dist/package.json'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles);
  process.exit(1);
}

// Check file sizes
const indexJsSize = fs.statSync('dist/index.js').size;
const publicFiles = fs.readdirSync('dist/public').length;

console.log('✅ Production build complete!');
console.log(`📊 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`📁 Static files: ${publicFiles} files in public/`);
console.log('🚀 Ready for deployment');

// List key files for verification
console.log('\n📋 Deployment structure:');
console.log('  dist/');
console.log('  ├── index.js (server entry point)');
console.log('  ├── package.json (production dependencies)');
console.log('  └── public/ (static assets)');
console.log('      └── index.html (client application)');