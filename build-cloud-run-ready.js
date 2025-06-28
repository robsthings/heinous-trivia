#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Creating Cloud Run deployment...');

// Clean and create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build server bundle optimized for Cloud Run
console.log('📦 Building Cloud Run server...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      // Keep all dependencies external for Cloud Run npm install
      '@neondatabase/serverless',
      'bcrypt',
      'cors',
      'dotenv',
      'drizzle-orm',
      'drizzle-zod',
      'express',
      'firebase',
      'firebase-admin',
      'html2canvas',
      'multer',
      'zod'
    ],
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    },
    minify: true,
    sourcemap: false,
    keepNames: true,
    packages: 'external',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}

// Create Cloud Run compatible package.json
console.log('📄 Creating Cloud Run package.json...');
const cloudRunPackage = {
  name: "heinous-trivia-cloud-run",
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    start: "node index.js"
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
    "node": "18"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(cloudRunPackage, null, 2));
console.log('✅ Cloud Run package.json created');

// Copy static assets
console.log('📁 Copying static assets...');
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

// Copy public assets to dist/public
const publicSrc = path.join(__dirname, 'client', 'public');
const publicDest = path.join(__dirname, 'dist', 'public');
const publicFileCount = copyDir(publicSrc, publicDest);
console.log(`✅ Copied ${publicFileCount} public assets`);

// Copy client build if available
const clientDistSrc = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistSrc)) {
  console.log('📦 Copying client build...');
  const clientFileCount = copyDir(clientDistSrc, publicDest);
  console.log(`✅ Copied ${clientFileCount} client files`);
}

// Create Cloud Run optimized index.html
console.log('🌐 Creating Cloud Run index.html...');
const cloudRunHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Horror Trivia Platform</title>
    <meta name="description" content="Immersive horror-themed trivia platform for haunts and entertainment venues">
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
            font-size: clamp(2rem, 8vw, 4rem); 
            color: #ff5500; 
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        p { 
            font-size: clamp(1rem, 4vw, 1.5rem); 
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
        .status {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #888;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Horror Trivia Platform</p>
        <div class="loading"></div>
        <div class="status">Cloud Run Deployment</div>
    </div>
    <script>
        // Health check for Cloud Run
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('Health check:', data);
                // Redirect to game if health check passes
                setTimeout(() => {
                    if (window.location.pathname === '/') {
                        window.location.href = '/game';
                    }
                }, 1500);
            })
            .catch(error => {
                console.error('Health check failed:', error);
            });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDest, 'index.html'), cloudRunHtml);
console.log('✅ Cloud Run index.html created');

// Create .gcloudignore for optimal deployment
const gcloudIgnore = `node_modules/
.git/
.env*
*.log
.tmp/
coverage/
client/
server/
*.md
*.txt
build*.js
deploy*.js
fix*.js
Dockerfile
.dockerignore
`;
fs.writeFileSync('dist/.gcloudignore', gcloudIgnore);
console.log('✅ .gcloudignore created');

// Final verification
console.log('\n🔍 Cloud Run deployment verification:');
const distFiles = fs.readdirSync('dist');
console.log('📂 Dist contents:', distFiles);

const serverSize = fs.statSync('dist/index.js').size;
const publicFiles = fs.readdirSync('dist/public').length;

console.log(`✅ Server bundle: ${(serverSize / 1024).toFixed(0)}KB`);
console.log(`✅ Static assets: ${publicFiles} files`);
console.log(`✅ Package.json: ${fs.existsSync('dist/package.json') ? 'created' : 'missing'}`);

// Test server syntax
console.log('\n🧪 Testing server syntax...');
try {
  const { execSync } = await import('child_process');
  execSync('cd dist && node --check index.js', { stdio: 'pipe' });
  console.log('✅ Server syntax valid');
} catch (error) {
  console.error('❌ Server syntax error:', error.message);
  process.exit(1);
}

console.log('\n🎉 Cloud Run deployment ready!');
console.log('📦 Deploy with: gcloud run deploy --source=./dist');
console.log('🔧 Build command: npm run build');
console.log('🚀 Start command: npm start');