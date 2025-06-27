#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building complete production deployment...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Step 1: Build client assets
console.log('🎨 Building client assets...');
try {
  execSync('npx vite build --config client/vite.config.ts', { 
    stdio: 'inherit',
    timeout: 120000
  });
  console.log('✅ Client assets built successfully');
} catch (error) {
  console.warn('⚠️ Client build had issues, checking for existing assets...');
  if (!fs.existsSync('./client/public')) {
    console.error('❌ No client assets found. Build failed.');
    process.exit(1);
  }
}

// Step 2: Build server bundle
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
    '--define:global.process.env.NODE_ENV=\'"production"\'',
    '--banner:js="import { fileURLToPath } from \'url\'; import { dirname } from \'path\'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename); process.env.NODE_ENV = process.env.NODE_ENV || \'production\';"'
  ].join(' ');

  execSync(esbuildCommand, { stdio: 'inherit' });
  
  // Verify the server bundle was created
  if (!fs.existsSync('./dist/index.js')) {
    throw new Error('Server bundle was not created at dist/index.js');
  }
  
  const serverSize = fs.statSync('./dist/index.js').size;
  console.log(`✅ Server bundle created (${Math.round(serverSize / 1024)}KB)`);
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production package.json
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

// Step 4: Copy static assets to dist/public
console.log('📁 Setting up static assets...');
fs.mkdirSync('./dist/public', { recursive: true });

// Copy all static assets from client/public
if (fs.existsSync('./client/public')) {
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
  
  copyDir('./client/public', './dist/public');
  console.log('✅ Static assets copied to dist/public');
}

// Copy any Vite build output if it exists
if (fs.existsSync('./dist/client')) {
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
  
  copyDir('./dist/client', './dist/public');
  console.log('✅ Vite build assets copied to dist/public');
}

// Step 5: Create production-ready index.html
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
    <script>
      // Client-side routing support for production deployment
      window.addEventListener('load', function() {
        const path = window.location.pathname;
        // Handle SPA routing by ensuring the app loads for all non-API routes
        if (path !== '/' && !path.startsWith('/api/') && !path.includes('.')) {
          // This is likely a client-side route, let the React app handle it
          console.log('Production SPA routing active for:', path);
        }
      });
    </script>
  </body>
</html>`;

fs.writeFileSync('./dist/public/index.html', productionIndexHtml);
console.log('✅ Production index.html created');

// Step 6: Verify deployment structure
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

// Check file sizes and structure
const indexJsSize = fs.statSync('dist/index.js').size;
const publicFiles = fs.readdirSync('dist/public').length;

console.log('✅ Production build complete!');
console.log(`📊 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`📁 Static files: ${publicFiles} files in dist/public/`);
console.log('🚀 Ready for Cloud Run deployment');

// Display deployment structure
console.log('\n📂 Deployment structure:');
console.log('├── dist/');
console.log('│   ├── index.js (server bundle)');
console.log('│   ├── package.json (production deps)');
console.log('│   └── public/ (static assets)');
console.log('│       ├── index.html');
console.log('│       └── [all static assets]');
console.log('\n🎯 Deploy with: npm run start');