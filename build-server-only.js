#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building server for deployment...');

// Clean and create dist
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server with corrected esbuild command
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
  console.log('✅ Server bundle created');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Create production package.json
console.log('📦 Creating production package.json...');
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

// Copy static assets from existing public directory if it exists
if (fs.existsSync('./client/public')) {
  console.log('📁 Copying static assets...');
  fs.mkdirSync('./dist/public', { recursive: true });
  
  // Copy index.html
  if (fs.existsSync('./client/index.html')) {
    fs.copyFileSync('./client/index.html', './dist/public/index.html');
  }
  
  // Copy public assets recursively
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = `${src}/${item}`;
      const destPath = `${dest}/${item}`;
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir('./client/public', './dist/public');
  console.log('✅ Static assets copied');
}

// Verify build
const indexJsSize = fs.statSync('dist/index.js').size;
console.log('✅ Server-only build complete!');
console.log(`📊 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log('🚀 Ready for deployment with existing static assets');