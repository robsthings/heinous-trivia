#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting simplified deployment build...');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Step 1: Build server bundle with esbuild
console.log('📦 Building server bundle...');
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
    // Ignore all packages in node_modules to avoid bundling issues
    packages: 'external'
  });
  
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle created: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server bundle failed:', error);
  process.exit(1);
}

// Step 2: Create production package.json
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
    "zod": "^3.25.67"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created');

// Step 3: Copy static assets to dist/public
console.log('📁 Copying static assets...');
const publicSrc = path.join(__dirname, 'client', 'public');
const publicDest = path.join(__dirname, 'dist', 'public');

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

// Step 4: Create fallback index.html for client-side routing
console.log('🌐 Creating fallback index.html...');
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Horror Trivia Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Creepster', cursive;
            background: linear-gradient(135deg, #0b001a 0%, #1a1a1a 50%, #0b001a 100%);
            color: #f2f2f2;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 2rem;
        }
        h1 { 
            font-size: 3rem; 
            color: #ff5500; 
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        p { 
            font-size: 1.2rem; 
            margin-bottom: 2rem; 
            color: #bb86fc;
        }
        .loading {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid #bb86fc;
            border-radius: 50%;
            border-top-color: #ff5500;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Horror Trivia Platform Loading...</p>
        <div class="loading"></div>
    </div>
    <script>
        // Simple client-side routing fallback
        setTimeout(() => {
            if (!window.location.pathname || window.location.pathname === '/') {
                window.location.href = '/game';
            }
        }, 2000);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDest, 'index.html'), fallbackHtml);
console.log('✅ Fallback index.html created');

// Step 5: Verification
console.log('\n🔍 Build verification:');
const distFiles = fs.readdirSync('dist');
console.log('📂 Dist directory contents:', distFiles);

if (fs.existsSync('dist/index.js')) {
  const serverStats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(serverStats.size / 1024).toFixed(0)}KB`);
}

if (fs.existsSync('dist/public')) {
  const publicFiles = fs.readdirSync('dist/public');
  console.log(`✅ Public assets: ${publicFiles.length} files`);
}

console.log('\n🎉 Simplified deployment build completed successfully!');
console.log('📦 Ready for Cloud Run deployment with:');
console.log('   - dist/index.js (server bundle)');
console.log('   - dist/package.json (production dependencies)');
console.log('   - dist/public/ (static assets)');