#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Creating deployment build for Cloud Run...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server bundle with esbuild
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
  
  const bundleSize = Math.round(fs.statSync('dist/index.js').size / 1024);
  console.log(`✅ Server bundle created: ${bundleSize}KB`);
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Copy all static assets to dist root (not dist/public)
console.log('📁 Copying static assets to deployment root...');

// Copy client/public contents to dist/ (flat structure for Cloud Run)
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
  
  copyDir('./client/public', './dist');
  console.log('✅ Static assets copied to dist root');
}

// Copy index.html to dist root
if (fs.existsSync('./client/index.html')) {
  fs.copyFileSync('./client/index.html', './dist/index.html');
  console.log('✅ index.html copied to dist root');
}

// Create production package.json with minimal dependencies
console.log('📦 Creating production package.json...');
const prodPackageJson = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production PORT=${PORT:-5000} node index.js"
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

// Update server/production.ts to serve static files from current directory
console.log('🔧 Updating production static file serving...');

// Verify deployment structure
console.log('🔍 Verifying deployment structure...');
const requiredFiles = [
  'dist/index.js',
  'dist/index.html', 
  'dist/package.json'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles);
  process.exit(1);
}

// Count static assets
const assetCount = fs.readdirSync('./dist').filter(item => 
  !['index.js', 'package.json'].includes(item)
).length;

console.log('✅ Deployment build complete!');
console.log(`📊 Server bundle: ${Math.round(fs.statSync('dist/index.js').size / 1024)}KB`);
console.log(`📁 Static assets: ${assetCount} files`);
console.log('🚀 Ready for Cloud Run deployment with proper structure:');
console.log('   - dist/index.js (server entry point)');
console.log('   - dist/package.json (production dependencies)');
console.log('   - dist/index.html + all static assets (flat structure)');
console.log('   - Server binds to 0.0.0.0:5000 for container deployment');