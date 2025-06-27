#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment build...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });

// Build client
console.log('⚙️ Building client...');
try {
  execSync('npx vite build --config vite.config.ts --outDir dist/public', {
    stdio: 'inherit'
  });
  console.log('✅ Client build complete');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Build server
console.log('⚙️ Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
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
    "firebase": "^11.9.1",
    "firebase-admin": "^13.0.0",
    "express": "^4.18.2",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.0",
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

// Check file sizes
const indexJsSize = fs.statSync('dist/index.js').size;
const publicFiles = fs.readdirSync('dist/public').length;

console.log('✅ Build verification complete:');
console.log(`  - dist/index.js: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`  - dist/public/: ${publicFiles} files`);
console.log(`  - dist/package.json: Ready`);

console.log('🚀 Deployment build complete! Ready for deployment.');
console.log('');
console.log('Build structure:');
console.log('  dist/');
console.log('  ├── index.js         (server entry point)');
console.log('  ├── package.json     (production dependencies)');
console.log('  └── public/          (client assets)');
console.log('      └── index.html   (main app)');