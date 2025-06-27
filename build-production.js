#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting production build...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });

// Build client first
console.log('⚙️ Building client assets...');
try {
  execSync('npx vite build --config vite.config.ts --outDir dist/public', {
    stdio: 'inherit',
    timeout: 60000 // 1 minute timeout
  });
  console.log('✅ Client build complete');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Build server with corrected esbuild command
console.log('⚙️ Building server...');
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
    timeout: 30000 // 30 second timeout
  });
  console.log('✅ Server build complete');
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

// Verify required files exist
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

// Check file sizes and provide build summary
const indexJsSize = fs.statSync('dist/index.js').size;
const indexHtmlExists = fs.existsSync('dist/public/index.html');

console.log('✅ Build verification complete!');
console.log('📊 Build Summary:');
console.log(`  - Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`  - Client assets: ${indexHtmlExists ? 'Generated' : 'Missing'}`);
console.log(`  - Production config: Created`);

// Count static assets
const publicDir = 'dist/public';
if (fs.existsSync(publicDir)) {
  const countFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
    return count;
  };
  
  const assetCount = countFiles(publicDir);
  console.log(`  - Static assets: ${assetCount} files`);
}

console.log('\n🚀 Production build complete! Ready for deployment.');
console.log('Structure created:');
console.log('  ├── dist/index.js (server entry point)');
console.log('  ├── dist/package.json (production dependencies)');
console.log('  └── dist/public/ (client assets)');