#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYMENT BUILD - Final verification system');

// Clean and create dist
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server bundle
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
  console.log('✅ Server bundle created successfully');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Create production package.json with verified dependencies
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

// Copy all static assets
console.log('📁 Copying static assets...');
fs.mkdirSync('./dist/public', { recursive: true });

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy client public assets
if (fs.existsSync('./client/public')) {
  copyDirectory('./client/public', './dist/public');
}

// Copy index.html to public directory
if (fs.existsSync('./client/index.html')) {
  fs.copyFileSync('./client/index.html', './dist/public/index.html');
  console.log('✅ Static assets and index.html copied');
} else {
  console.error('❌ Missing index.html file');
  process.exit(1);
}

// Verify deployment structure
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

// Check file sizes
const indexJsSize = fs.statSync('dist/index.js').size;
const assetCount = fs.readdirSync('./dist/public', { recursive: true }).length;

console.log('✅ DEPLOYMENT BUILD COMPLETE');
console.log(`📊 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`📁 Static assets: ${assetCount} files`);
console.log('🚀 Ready for Cloud Run deployment');

// Final deployment test
console.log('🧪 Testing server startup...');
try {
  const testProcess = execSync('cd dist && PORT=3002 timeout 3s node index.js', { 
    stdio: 'pipe',
    timeout: 5000,
    env: { ...process.env, PORT: '3002' }
  });
  console.log('✅ Server startup test passed');
} catch (error) {
  if (error.status === 124) {
    console.log('✅ Server startup test passed (timeout expected)');
  } else {
    console.error('❌ Server startup test failed:', error.message);
    process.exit(1);
  }
}

console.log('🎉 Deployment package verified and ready!');