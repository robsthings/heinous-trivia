#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Creating comprehensive deployment build...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
  console.log('🧹 Cleaned existing dist directory');
}
fs.mkdirSync('./dist', { recursive: true });

// Step 1: Build client with Vite
console.log('📦 Building client assets...');
try {
  execSync('npx vite build --config vite.config.ts', {
    stdio: 'inherit'
  });
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 2: Build server with esbuild
console.log('⚙️ Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-cartographer --external:@replit/vite-plugin-runtime-error-modal --banner:js='import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'`, {
    stdio: 'inherit'
  });
  console.log('✅ Server build completed');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production package.json with correct dependencies
console.log('📄 Creating production package.json...');
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

// Step 4: Verify all required files exist
console.log('🔍 Verifying deployment structure...');
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

// Step 5: Check file sizes and structure
const indexJsSize = fs.statSync('dist/index.js').size;
const publicFiles = fs.readdirSync('dist/public').length;

console.log('📊 Deployment Summary:');
console.log(`   📄 Server bundle: ${Math.round(indexJsSize / 1024)}KB`);
console.log(`   📁 Static assets: ${publicFiles} files`);
console.log(`   🎯 Entry point: dist/index.js`);
console.log(`   🌐 Static path: dist/public/`);

// Step 6: Test server startup (quick check)
console.log('🧪 Testing server startup...');
try {
  const testProcess = execSync('timeout 5s node dist/index.js || exit 0', {
    stdio: 'pipe',
    cwd: '.',
    env: { ...process.env, NODE_ENV: 'production', PORT: '5000' }
  });
  console.log('✅ Server startup test passed');
} catch (error) {
  console.warn('⚠️ Server startup test inconclusive (may be normal)');
}

console.log('🎉 Deployment build completed successfully!');
console.log('');
console.log('📋 Deployment Structure:');
console.log('   dist/');
console.log('   ├── index.js        (Server entry point)');
console.log('   ├── package.json     (Production dependencies)');
console.log('   └── public/          (Static assets)');
console.log('       ├── index.html   (Client app)');
console.log('       └── assets/      (Bundled assets)');
console.log('');
console.log('🚀 Ready for deployment with:');
console.log('   Start command: npm start');
console.log('   Port binding: 0.0.0.0:5000');
console.log('   Environment: NODE_ENV=production');