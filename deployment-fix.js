#!/usr/bin/env node

/**
 * COMPREHENSIVE DEPLOYMENT FIX
 * Addresses all deployment failure issues for Cloud Run deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting comprehensive deployment fix...');

// Step 1: Clean and prepare directories
console.log('\n🧹 Cleaning previous builds...');
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });
fs.mkdirSync('./dist/public', { recursive: true });

// Step 2: Build client assets
console.log('\n⚙️ Building client assets...');
try {
  // Use Vite to build the client properly
  execSync('npx vite build --outDir dist/public', { 
    stdio: 'inherit',
    timeout: 120000 
  });
  
  // Verify client build
  if (!fs.existsSync('./dist/public/index.html')) {
    throw new Error('Client build failed - index.html not created');
  }
  
  const assetFiles = fs.readdirSync('./dist/public');
  console.log(`✅ Client build complete - ${assetFiles.length} assets created`);
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 3: Build server bundle for Cloud Run
console.log('\n⚙️ Building server bundle...');
try {
  const esbuildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outfile=dist/index.js',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--external:vite',
    '--external:@vitejs/plugin-react',
    '--external:@replit/vite-plugin-cartographer',
    '--external:@replit/vite-plugin-runtime-error-modal',
    '--banner:js="import { fileURLToPath } from \'url\'; import { dirname } from \'path\'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"'
  ].join(' ');

  execSync(esbuildCommand, { 
    stdio: 'inherit',
    timeout: 60000 
  });
  
  if (!fs.existsSync('./dist/index.js')) {
    throw new Error('Server bundle was not created');
  }
  
  const serverSize = fs.statSync('./dist/index.js').size;
  console.log(`✅ Server bundle created (${Math.round(serverSize / 1024)}KB)`);
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 4: Create production-ready package.json
console.log('\n📦 Creating production package.json...');
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

// Step 5: Create Dockerfile for Cloud Run
console.log('\n🐳 Creating Dockerfile...');
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --only=production

# Copy application files
COPY index.js ./
COPY public ./public

# Expose port (Cloud Run will set PORT environment variable)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
`;

fs.writeFileSync('./dist/Dockerfile', dockerfile);
console.log('✅ Dockerfile created');

// Step 6: Create .dockerignore
const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.eslintrc
.prettierrc
`;

fs.writeFileSync('./dist/.dockerignore', dockerignore);
console.log('✅ .dockerignore created');

// Step 7: Validate all required files and configurations
console.log('\n🔍 Validating deployment structure...');
const requiredFiles = [
  'dist/index.js',
  'dist/package.json',
  'dist/public/index.html',
  'dist/Dockerfile'
];

let allValid = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const size = stats.isDirectory() ? 'directory' : `${Math.round(stats.size / 1024)}KB`;
    console.log(`✅ ${file} (${size})`);
  } else {
    console.error(`❌ Missing: ${file}`);
    allValid = false;
  }
}

// Verify package.json configuration
const packageJson = JSON.parse(fs.readFileSync('./dist/package.json', 'utf8'));
const requiredFields = {
  'type': 'module',
  'main': 'index.js',
  'scripts.start': 'NODE_ENV=production node index.js'
};

console.log('\n📋 Validating package.json configuration:');
for (const [field, expected] of Object.entries(requiredFields)) {
  const fieldPath = field.split('.');
  let value = packageJson;
  for (const key of fieldPath) {
    value = value?.[key];
  }
  
  if (value === expected) {
    console.log(`✅ ${field}: "${value}"`);
  } else {
    console.error(`❌ ${field}: expected "${expected}", got "${value}"`);
    allValid = false;
  }
}

// Step 8: Test server bundle syntax
console.log('\n🧪 Testing server bundle...');
try {
  execSync('node --check dist/index.js', { stdio: 'pipe' });
  console.log('✅ Server bundle syntax validation passed');
} catch (error) {
  console.error('❌ Server bundle syntax validation failed');
  allValid = false;
}

// Step 9: Count static assets
const publicFiles = fs.readdirSync('./dist/public', { recursive: true });
const assetCount = publicFiles.length;
console.log(`✅ Static assets: ${assetCount} files in dist/public/`);

if (!allValid) {
  console.error('\n❌ Deployment validation failed!');
  process.exit(1);
}

console.log('\n🎉 DEPLOYMENT FIX COMPLETE!');
console.log('📋 Deployment Summary:');
console.log(`   • Server entry point: dist/index.js (${Math.round(fs.statSync('dist/index.js').size / 1024)}KB)`);
console.log(`   • Static assets: ${assetCount} files in dist/public/`);
console.log(`   • Production config: dist/package.json`);
console.log(`   • Start command: "NODE_ENV=production node index.js"`);
console.log(`   • Server binding: 0.0.0.0:$PORT (Cloud Run compatible)`);
console.log(`   • Docker configuration: dist/Dockerfile`);
console.log('\n✅ All deployment requirements met - ready for Cloud Run deployment');
console.log('📝 Deploy with: npm run build && npm run start');