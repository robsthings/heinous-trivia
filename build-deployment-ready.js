#!/usr/bin/env node

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting deployment-ready build...');

// Clean and create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 1: Build optimized server bundle
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
      'fs', 'path', 'url', 'os', 'crypto', 'events', 'stream', 'util', 'http', 'https',
      // All npm dependencies - let Cloud Run install them
      '@neondatabase/serverless',
      'cors',
      'dotenv', 
      'drizzle-orm',
      'drizzle-zod',
      'express',
      'firebase',
      'firebase-admin',
      'multer',
      'bcrypt',
      'zod',
      'html2canvas'
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
  console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server build failed:', error);
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
    "zod": "^3.25.67",
    "html2canvas": "^1.4.1"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created');

// Step 3: Create client-side assets directory
console.log('📁 Setting up client assets...');
const publicDir = path.join(__dirname, 'dist', 'public');
fs.mkdirSync(publicDir, { recursive: true });

// Copy existing static assets from client/public
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

// Copy public assets
const clientPublicSrc = path.join(__dirname, 'client', 'public');
const assetCount = copyDir(clientPublicSrc, publicDir);
console.log(`✅ Copied ${assetCount} static assets`);

// Step 4: Create optimized index.html for production
console.log('🌐 Creating production index.html...');
const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Horror Trivia Platform</title>
    <meta name="description" content="Spine-chilling multiplayer trivia platform for haunts and entertainment venues. Custom branding, real-time gameplay, and horrifying fun await.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Eater&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; }
        body {
            font-family: 'Creepster', cursive;
            background: linear-gradient(135deg, #0b001a 0%, #1a1a1a 50%, #0b001a 100%);
            color: #f2f2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 90vw;
            padding: 2rem;
            animation: fadeIn 1s ease-in;
        }
        h1 { 
            font-size: clamp(2rem, 8vw, 4rem);
            color: #ff5500; 
            margin-bottom: 1rem;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
            animation: pulse 3s infinite;
        }
        p { 
            font-size: clamp(1rem, 3vw, 1.5rem);
            margin-bottom: 2rem; 
            color: #bb86fc;
        }
        .loading {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 4px solid #bb86fc;
            border-radius: 50%;
            border-top-color: #ff5500;
            animation: spin 1s ease-in-out infinite;
            margin: 1rem 0;
        }
        .status {
            font-size: 1rem;
            color: #bb86fc;
            margin-top: 1rem;
            opacity: 0.8;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Horror Trivia Platform</p>
        <div class="loading"></div>
        <div class="status" id="status">Summoning the darkness...</div>
    </div>
    
    <script>
        // Production app loader
        const statusEl = document.getElementById('status');
        const messages = [
            'Summoning the darkness...',
            'Loading horror database...',
            'Connecting to the void...',
            'Preparing spine-chilling trivia...',
            'Almost ready to terrify...'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            statusEl.textContent = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
        }, 1500);
        
        // Check server health and redirect
        function checkServer() {
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    clearInterval(messageInterval);
                    statusEl.textContent = 'Server ready! Redirecting...';
                    
                    // Determine where to redirect based on URL
                    const params = new URLSearchParams(window.location.search);
                    const haunt = params.get('haunt');
                    
                    setTimeout(() => {
                        if (haunt) {
                            window.location.href = '/welcome/' + haunt;
                        } else {
                            window.location.href = '/admin';
                        }
                    }, 1000);
                })
                .catch(error => {
                    console.log('Server still starting...', error);
                    setTimeout(checkServer, 2000);
                });
        }
        
        // Start checking after 2 seconds
        setTimeout(checkServer, 2000);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), productionHtml);
console.log('✅ Production index.html created');

// Step 5: Create Dockerfile for Cloud Run
console.log('🐳 Creating Dockerfile...');
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --only=production

# Copy application files
COPY index.js ./
COPY public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD node -e "fetch('http://localhost:8080/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Start the application
CMD ["npm", "start"]
`;

fs.writeFileSync('dist/Dockerfile', dockerfile);
console.log('✅ Dockerfile created');

// Step 6: Create .dockerignore
const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env.local
.env.development
.nyc_output
coverage
.docker
*.log
.DS_Store
`;

fs.writeFileSync('dist/.dockerignore', dockerignore);
console.log('✅ .dockerignore created');

// Step 7: Create deployment script
console.log('📜 Creating deployment script...');
const deployScript = `#!/bin/bash

echo "🚀 Deploying Heinous Trivia to Cloud Run..."

# Install dependencies
npm install --only=production

# Start the application
npm start
`;

fs.writeFileSync('dist/deploy.sh', deployScript);
fs.chmodSync('dist/deploy.sh', 0o755);
console.log('✅ Deployment script created');

// Step 8: Verification
console.log('\n🔍 Deployment verification:');

// Check all required files
const requiredFiles = [
    'index.js',
    'package.json', 
    'public/index.html',
    'Dockerfile',
    '.dockerignore',
    'deploy.sh'
];

let allFilesPresent = true;
requiredFiles.forEach(file => {
    const filePath = path.join('dist', file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            console.log(`✅ ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
        } else {
            console.log(`✅ ${file}: Directory`);
        }
    } else {
        console.log(`❌ ${file}: Missing`);
        allFilesPresent = false;
    }
});

if (fs.existsSync('dist/public')) {
    const publicFiles = fs.readdirSync('dist/public');
    console.log(`✅ Public assets: ${publicFiles.length} files`);
}

console.log('\n🎉 Deployment build completed!');
console.log('📦 Cloud Run deployment structure:');
console.log('   ├── index.js (optimized server bundle)');
console.log('   ├── package.json (production dependencies)');
console.log('   ├── public/ (static assets + index.html)');
console.log('   ├── Dockerfile (container configuration)');
console.log('   ├── .dockerignore (build optimization)');
console.log('   └── deploy.sh (deployment script)');

if (allFilesPresent) {
    console.log('\n✅ All required files present - READY FOR DEPLOYMENT');
    console.log('\n📋 Cloud Run deployment instructions:');
    console.log('   1. Upload entire dist/ directory');
    console.log('   2. Build command: npm install');
    console.log('   3. Start command: npm start');
    console.log('   4. Port: Automatic (uses PORT env var)');
    console.log('   5. Alternative: Use Dockerfile for container deployment');
} else {
    console.log('\n❌ Some files missing - deployment may fail');
    process.exit(1);
}