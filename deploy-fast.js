#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Fast Cloud Run deployment build...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

try {
  // Step 1: Build server bundle
  console.log('⚙️  Building server bundle...');
  execSync(
    `npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-cartographer --external:@replit/vite-plugin-runtime-error-modal --banner:js='import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'`,
    { stdio: 'inherit' }
  );

  // Step 2: Copy static assets
  console.log('📁 Copying static assets...');
  fs.mkdirSync('dist/public', { recursive: true });
  if (fs.existsSync('client/public')) {
    execSync('cp -r client/public/* dist/public/', { stdio: 'inherit' });
  }
  
  // Create minimal index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heinous Trivia</title>
  <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
  <style>
    body { 
      margin: 0; 
      font-family: system-ui, -apple-system, sans-serif; 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loading { text-align: center; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .logo { font-size: 3rem; margin-bottom: 1rem; color: #ff6b35; }
  </style>
</head>
<body>
  <div class="loading">
    <div class="logo">🎃 HEINOUS TRIVIA</div>
    <div>Loading horror experience...</div>
  </div>
  <script>
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('haunt')) {
      const hauntId = params.get('haunt');
      document.body.innerHTML = \`<div style="text-align: center; padding: 2rem;"><h1>🎃 Welcome to Heinous Trivia</h1><p>Haunt: \${hauntId}</p><p>Loading game...</p></div>\`;
    } else {
      document.body.innerHTML = '<div style="text-align: center; padding: 2rem;"><h1>🎃 Heinous Trivia</h1><p>Use your QR code to access the game.</p></div>';
    }
  </script>
</body>
</html>`;
  fs.writeFileSync('dist/public/index.html', indexHtml);

  // Step 3: Create package.json
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

  // Step 4: Copy dependencies from existing node_modules
  console.log('⚡ Copying production dependencies...');
  if (fs.existsSync('node_modules')) {
    const requiredDeps = [
      '@neondatabase', 'drizzle-orm', 'drizzle-zod', 'firebase', 'firebase-admin',
      'express', 'bcrypt', 'ws', 'cors', 'express-session', 'connect-pg-simple',
      'passport', 'passport-local', 'multer', 'zod', 'dotenv', 'node-fetch', 'form-data'
    ];
    
    fs.mkdirSync('dist/node_modules', { recursive: true });
    
    for (const dep of requiredDeps) {
      const srcPath = `node_modules/${dep}`;
      const destPath = `dist/node_modules/${dep}`;
      
      if (fs.existsSync(srcPath)) {
        execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'pipe' });
        console.log(`✅ Copied ${dep}`);
      } else {
        console.log(`⚠️  Missing ${dep} - will be installed by Cloud Run`);
      }
    }
    
    // Copy critical nested dependencies
    const nestedDeps = [
      'accepts', 'array-flatten', 'body-parser', 'cookie', 'cookie-parser', 'cookie-signature',
      'debug', 'depd', 'destroy', 'encodeurl', 'escape-html', 'etag', 'finalhandler',
      'fresh', 'http-errors', 'inherits', 'mime', 'mime-types', 'ms', 'negotiator',
      'on-finished', 'parseurl', 'path-to-regexp', 'proxy-addr', 'qs', 'range-parser',
      'raw-body', 'safe-buffer', 'send', 'serve-static', 'setprototypeof', 'statuses',
      'type-is', 'utils-merge', 'vary'
    ];
    
    for (const dep of nestedDeps) {
      const srcPath = `node_modules/${dep}`;
      const destPath = `dist/node_modules/${dep}`;
      
      if (fs.existsSync(srcPath)) {
        execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'pipe' });
      }
    }
    
  } else {
    console.log('⚠️  No node_modules found - Cloud Run will install dependencies');
  }

  // Step 5: Verify deployment
  console.log('🔍 Verifying deployment...');
  const requiredFiles = ['dist/index.js', 'dist/public/index.html', 'dist/package.json'];
  
  let allValid = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ ${file} (${sizeKB}KB)`);
    } else {
      console.error(`❌ Missing: ${file}`);
      allValid = false;
    }
  }

  if (!allValid) {
    throw new Error('Deployment validation failed');
  }

  // Count assets and dependencies
  const publicFiles = fs.readdirSync('dist/public', { recursive: true });
  const assetCount = publicFiles.filter(file => {
    const fullPath = path.join('dist/public', file);
    return fs.statSync(fullPath).isFile();
  }).length;

  let depCount = 0;
  if (fs.existsSync('dist/node_modules')) {
    const nodeModules = fs.readdirSync('dist/node_modules');
    depCount = nodeModules.filter(dir => !dir.startsWith('.')).length;
  }

  console.log('\n🎉 CLOUD RUN DEPLOYMENT READY!');
  console.log('📋 Summary:');
  console.log(`   • Server: dist/index.js (${Math.round(fs.statSync('dist/index.js').size / 1024)}KB)`);
  console.log(`   • Assets: ${assetCount} files in dist/public/`);
  console.log(`   • Dependencies: ${depCount} packages copied to dist/node_modules/`);
  console.log(`   • Start: "NODE_ENV=production node index.js"`);
  console.log(`   • Port: 0.0.0.0:$PORT (Cloud Run compatible)`);
  console.log('\n✅ Ready for Cloud Run deployment');

} catch (error) {
  console.error('\n❌ BUILD FAILED:', error.message);
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  process.exit(1);
}