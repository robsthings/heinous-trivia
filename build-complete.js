#!/usr/bin/env node

import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting complete deployment build...');

// Clean and create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 1: Build client React application with Vite
console.log('⚛️ Building React client...');
try {
  await viteBuild({
    root: 'client',
    build: {
      outDir: '../dist/public',
      emptyOutDir: true,
      rollupOptions: {
        input: 'client/index.html'
      }
    }
  });
  console.log('✅ Client build completed');
} catch (error) {
  console.error('❌ Client build failed:', error);
  // Continue with server build even if client fails
  console.log('⚠️ Continuing with server-only build...');
}

// Step 2: Build server bundle with esbuild
console.log('🖥️ Building server bundle...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
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
      // React and frontend dependencies (these should be bundled in client build)
      'react',
      'react-dom',
      '@radix-ui/*',
      'lucide-react'
    ],
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    },
    minify: true,
    sourcemap: false,
    keepNames: false,
    packages: 'external'
  });
  
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle created: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server bundle failed:', error);
  process.exit(1);
}

// Step 3: Create production package.json with all required dependencies
console.log('📄 Creating production package.json...');
const productionPackage = {
  name: "heinous-trivia-production",
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
    "zod": "^3.25.67",
    "html2canvas": "^1.4.1"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created');

// Step 4: Copy additional static assets if needed
console.log('📁 Copying additional static assets...');
const publicSrc = path.join(__dirname, 'client', 'public');

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
      // Don't overwrite Vite-built files
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        fileCount++;
      }
    }
  }
  
  return fileCount;
}

// Copy public assets that Vite might have missed
const publicDest = path.join(__dirname, 'dist', 'public');
const additionalAssets = copyDir(publicSrc, publicDest);
console.log(`✅ Copied ${additionalAssets} additional assets`);

// Step 5: Create environment configuration
console.log('⚙️ Creating environment configuration...');
const envConfig = `# Production Environment Variables
NODE_ENV=production
PORT=8080
`;

fs.writeFileSync('dist/.env', envConfig);
console.log('✅ Environment configuration created');

// Step 6: Verification and summary
console.log('\n🔍 Build verification:');
const distFiles = fs.readdirSync('dist');
console.log('📂 Dist directory contents:', distFiles);

if (fs.existsSync('dist/index.js')) {
  const serverStats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(serverStats.size / 1024).toFixed(0)}KB`);
}

if (fs.existsSync('dist/package.json')) {
  console.log('✅ Production package.json: Ready for npm install');
}

if (fs.existsSync('dist/public')) {
  const publicFiles = fs.readdirSync('dist/public');
  console.log(`✅ Public assets: ${publicFiles.length} files`);
  
  // List key files
  const keyFiles = ['index.html', 'assets'];
  keyFiles.forEach(file => {
    const filePath = path.join('dist/public', file);
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        const subFiles = fs.readdirSync(filePath);
        console.log(`   📁 ${file}/: ${subFiles.length} files`);
      } else {
        console.log(`   📄 ${file}: ✅`);
      }
    } else {
      console.log(`   📄 ${file}: ❌ Missing`);
    }
  });
}

console.log('\n🎉 Complete deployment build finished!');
console.log('📦 Deployment structure:');
console.log('   ├── dist/index.js (server bundle)');
console.log('   ├── dist/package.json (production dependencies)');
console.log('   ├── dist/public/ (React client + static assets)');
console.log('   └── dist/.env (environment configuration)');
console.log('\n🚀 Ready for Cloud Run deployment!');
console.log('\n📋 Deployment instructions:');
console.log('   1. Upload dist/ directory to Cloud Run');
console.log('   2. Set build command: npm install');
console.log('   3. Set start command: npm start');
console.log('   4. Configure PORT environment variable');