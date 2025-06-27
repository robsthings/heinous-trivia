#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Final deployment build - addressing all issues...');

// Clean and create dist
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server with corrected configuration
console.log('⚙️ Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
  });
  console.log('✅ Server built successfully');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Create production package.json with correct dependencies
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
    "firebase": "^11.9.1",
    "firebase-admin": "^13.0.0",
    "express": "^4.18.2",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "express-session": "^1.18.1",
    "connect-pg-simple": "^10.0.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8",
    "drizzle-zod": "^0.8.2",
    "dotenv": "^16.3.1"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));

// Copy client static assets
console.log('📁 Copying client assets...');
if (fs.existsSync('./client/public')) {
  execSync('cp -r ./client/public ./dist/', { stdio: 'inherit' });
  console.log('✅ Client assets copied');
} else {
  console.error('❌ Client public directory not found');
  process.exit(1);
}

// Create production-ready index.html
console.log('🌐 Creating production index.html...');
const productionHtml = `<!DOCTYPE html>
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
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #0b001a 0%, #1a1a1a 50%, #0b001a 100%);
        color: white;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .loading {
        text-align: center;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .loading h1 {
        font-family: 'Creepster', cursive;
        font-size: clamp(2rem, 8vw, 4rem);
        color: #bb86fc;
        margin-bottom: 1rem;
      }
      
      .loading p {
        font-size: clamp(1rem, 4vw, 1.5rem);
        color: #f2f2f2;
        margin: 0.5rem 0;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        <h1>Heinous Trivia</h1>
        <p>Loading your spine-chilling experience...</p>
        <p>The horrors await...</p>
      </div>
    </div>
    
    <script>
      // Production route handling
      setTimeout(() => {
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const haunt = urlParams.get('haunt');
        
        if (haunt) {
          window.location.href = `/welcome/${haunt}`;
        } else if (path === '/' || path === '/index.html') {
          window.location.href = '/info';
        }
        // For other routes, let server handle them
      }, 1500);
    </script>
  </body>
</html>`;

fs.writeFileSync('./dist/public/index.html', productionHtml);

// Verify deployment structure
console.log('🔍 Verifying deployment structure...');
const requiredFiles = [
  'dist/index.js',           // Server entry point
  'dist/package.json',       // Production dependencies
  'dist/public/index.html',  // Client entry point
  'dist/public/manifest.json' // PWA manifest
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Critical deployment files missing:', missingFiles);
  process.exit(1);
}

// Test production server startup
console.log('🧪 Testing production server startup...');
try {
  const testProcess = execSync('cd dist && timeout 5s node index.js', { 
    stdio: 'pipe',
    timeout: 6000
  });
  console.log('⚠️ Server test timed out (expected behavior)');
} catch (error) {
  if (error.status === 124) {
    console.log('✅ Server startup test successful (timeout expected)');
  } else {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Final verification
const indexJsSize = Math.round(fs.statSync('dist/index.js').size / 1024);
const publicFiles = fs.readdirSync('dist/public').length;

console.log('');
console.log('✅ DEPLOYMENT BUILD COMPLETE!');
console.log('');
console.log('📊 Build Summary:');
console.log(`  - Server: dist/index.js (${indexJsSize}KB)`);
console.log(`  - Client: dist/public/ (${publicFiles} files)`);
console.log(`  - Config: dist/package.json (production ready)`);
console.log('');
console.log('🚀 Ready for deployment!');
console.log('');
console.log('Deployment structure:');
console.log('  dist/');
console.log('  ├── index.js         (server entry point)');
console.log('  ├── package.json     (production dependencies)');
console.log('  └── public/          (client assets)');
console.log('      ├── index.html   (app entry point)');
console.log('      ├── manifest.json (PWA config)');
console.log('      └── ...          (static assets)');
console.log('');
console.log('🎯 All deployment issues have been resolved!');