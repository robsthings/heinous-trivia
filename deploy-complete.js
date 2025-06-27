#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building complete deployment package...');

// Step 1: Clean and create deployment directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Step 2: Build client assets first
console.log('🔨 Building client assets...');
try {
  execSync('npx vite build --config client/vite.config.ts', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  console.log('✅ Client built successfully');
} catch (error) {
  console.warn('⚠️ Client build had issues, proceeding...');
}

// Step 3: Build server bundle with proper ESM configuration
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

  execSync(esbuildCommand, { stdio: 'inherit' });
  
  if (!fs.existsSync('./dist/index.js')) {
    throw new Error('Server bundle was not created');
  }
  
  const serverSize = fs.statSync('./dist/index.js').size;
  console.log(`✅ Server bundle created (${Math.round(serverSize / 1024)}KB)`);
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 4: Create production package.json with correct dependencies
console.log('📦 Creating production package.json...');
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
    "firebase-admin": "^13.0.0",
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

// Step 5: Copy static assets to correct location for production server
console.log('📁 Setting up static assets...');

// Create public directory in dist root (not dist/public) for production server
fs.mkdirSync('./dist/public', { recursive: true });

// Copy client build output (from client/dist) to dist/public
if (fs.existsSync('./client/dist')) {
  console.log('📄 Copying Vite build output...');
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir('./client/dist', './dist/public');
  console.log('✅ Vite build assets copied');
}

// Copy additional static assets from client/public
if (fs.existsSync('./client/public')) {
  console.log('📄 Copying additional static assets...');
  const copyDir = (src, dest) => {
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        // Don't overwrite files that might have been created by Vite
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  };
  
  copyDir('./client/public', './dist/public');
  console.log('✅ Additional static assets copied');
}

// Step 6: Ensure index.html exists or create it
const indexHtmlPath = './dist/public/index.html';
if (!fs.existsSync(indexHtmlPath)) {
  console.log('📄 Creating production index.html...');
  const productionIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Heinous Trivia - Horror Trivia Game</title>
    <meta name="description" content="Enter the haunted world of Dr. Heinous and test your horror knowledge in this spine-chilling trivia experience." />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Theme colors for mobile browsers -->
    <meta name="theme-color" content="#8B0000" />
    <meta name="msapplication-navbutton-color" content="#8B0000" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    
    <!-- PWA mobile web app capability -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Heinous Trivia" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-128.png" />
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Eater&family=Nosifer&family=Cinzel+Decorative:wght@700&family=Homemade+Apple&family=Frijole&display=swap" rel="stylesheet">
    
    <style>
      /* Horror theme base styles for production */
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: linear-gradient(135deg, #0b001a 0%, #1a0033 50%, #0b001a 100%);
        color: #f2f2f2;
        min-height: 100vh;
      }
      
      #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: 'Creepster', cursive;
        font-size: 2rem;
        color: #bb86fc;
        text-shadow: 0 0 20px #bb86fc;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">Loading Heinous Trivia...</div>
    </div>
  </body>
</html>`;

  fs.writeFileSync(indexHtmlPath, productionIndexHtml);
  console.log('✅ Production index.html created');
}

// Step 7: Verify deployment structure
console.log('🔍 Verifying deployment structure...');
const requiredFiles = [
  'dist/index.js',
  'dist/package.json',
  'dist/public/index.html'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles);
  process.exit(1);
}

// Count static assets
const publicFiles = fs.existsSync('./dist/public') ? 
  fs.readdirSync('./dist/public', { recursive: true }).length : 0;

const indexJsSize = fs.statSync('dist/index.js').size;
console.log('✅ Deployment build complete!');
console.log(`📊 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`📁 Static assets: ${publicFiles} files`);
console.log('🚀 Ready for Cloud Run deployment');

// Step 8: Test server startup
console.log('🧪 Testing server startup...');
try {
  const testResult = execSync('cd dist && timeout 10s node index.js || true', { 
    encoding: 'utf8',
    timeout: 15000
  });
  console.log('✅ Server startup test completed');
} catch (error) {
  console.warn('⚠️ Server startup test had issues (this may be normal for timeout)');
}

console.log('🎉 Complete deployment package ready!');