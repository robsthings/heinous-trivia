#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Creating Cloud Run deployment...');

// Clean and create deployment directory
if (fs.existsSync('deploy')) {
  fs.rmSync('deploy', { recursive: true, force: true });
}
fs.mkdirSync('deploy', { recursive: true });

// Step 1: Build server bundle with esbuild
console.log('📦 Building server bundle...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'deploy/index.js',
    external: [
      // Core Node modules
      'fs', 'path', 'url', 'os', 'crypto', 'events', 'stream', 'util',
      // Binary dependencies that need to be installed separately
      'multer',
      'bcrypt',
      'lightningcss',
      '@neondatabase/serverless',
      'firebase-admin',
      // Build tools and their dependencies
      '@babel/*',
      'babel-*',
      'esbuild',
      'vite',
      '@vitejs/*',
      'rollup',
      'postcss',
      'tailwindcss',
      // React and frontend dependencies
      'react',
      'react-dom',
      '@radix-ui/*',
      'lucide-react'
    ],
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    },
    minify: false,
    sourcemap: false,
    keepNames: true,
    packages: 'external'
  });
  
  const stats = fs.statSync('deploy/index.js');
  console.log(`✅ Server bundle created: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server bundle failed:', error);
  process.exit(1);
}

// Step 2: Create Cloud Run compatible package.json
console.log('📄 Creating Cloud Run package.json...');
const deployPackage = {
  name: "heinous-trivia-deploy",
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    start: "NODE_ENV=production node index.js"
  },
  dependencies: {
    "@neondatabase/serverless": "^1.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.44.2",
    "drizzle-zod": "^0.8.2",
    "express": "^4.18.2",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "multer": "^2.0.1",
    "bcrypt": "^6.0.0",
    "zod": "^3.25.67"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("deploy/package.json", JSON.stringify(deployPackage, null, 2));
console.log('✅ Cloud Run package.json created');

// Step 3: Copy static assets
console.log('📁 Copying static assets...');
const publicSrc = path.join(__dirname, 'client', 'public');
const publicDest = path.join(__dirname, 'deploy', 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  let fileCount = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fileCount += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      fileCount++;
    }
  }
  
  return fileCount;
}

// Copy existing client build if available
const clientDistSrc = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistSrc)) {
  console.log('📦 Copying existing client build...');
  const clientFileCount = copyDir(clientDistSrc, publicDest);
  console.log(`✅ Copied ${clientFileCount} client files`);
} else {
  console.log('⚠️  No client build found, copying public assets only');
}

// Always copy public assets
const publicFileCount = copyDir(publicSrc, publicDest);
console.log(`✅ Copied ${publicFileCount} public assets`);

// Step 4: Create Cloud Run compatible Dockerfile
console.log('🐳 Creating Dockerfile...');
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --only=production

# Copy application code
COPY index.js ./
COPY public ./public

# Expose port and start the application
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
`;

fs.writeFileSync('deploy/Dockerfile', dockerfile);
console.log('✅ Dockerfile created');

// Step 5: Create .dockerignore
const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.docker
`;

fs.writeFileSync('deploy/.dockerignore', dockerignore);
console.log('✅ .dockerignore created');

// Step 6: Verification
console.log('\n🔍 Deployment verification:');
const deployFiles = fs.readdirSync('deploy');
console.log('📂 Deploy directory contents:', deployFiles);

if (fs.existsSync('deploy/index.js')) {
  const serverStats = fs.statSync('deploy/index.js');
  console.log(`✅ Server bundle: ${(serverStats.size / 1024).toFixed(0)}KB`);
}

if (fs.existsSync('deploy/public')) {
  const publicFiles = fs.readdirSync('deploy/public');
  console.log(`✅ Public assets: ${publicFiles.length} files`);
}

console.log('\n🎉 Cloud Run deployment ready!');
console.log('📦 Deployment structure:');
console.log('   - deploy/index.js (server entry point)');
console.log('   - deploy/package.json (production config)');
console.log('   - deploy/public/ (static assets)');
console.log('   - deploy/Dockerfile (container config)');
console.log('\n📋 Cloud Run Configuration:');
console.log('   Build Command: npm install');
console.log('   Start Command: npm start');
console.log('   Port: Uses PORT environment variable (default 8080)');