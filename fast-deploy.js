#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Creating fast deployment build...');

// Clean previous builds
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Copy static assets
console.log('📁 Copying static assets...');
if (fs.existsSync('./client/public')) {
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive('./client/public', './dist/public');
  
  // Create production index.html
  const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
</head>
<body>
    <div id="root">
        <h1>Heinous Trivia Server</h1>
        <p>API endpoints available at /api/*</p>
    </div>
</body>
</html>`;
  
  fs.writeFileSync('./dist/public/index.html', productionHtml);
}

// Build server with proper bundling
console.log('⚙️ Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --external:vite --external:@vitejs/plugin-react --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
  });
  console.log('✅ Server bundled successfully');
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
    "start": "NODE_ENV=production node index.js",
    "postinstall": "echo 'Dependencies ready for production'"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.36.4",
    "firebase-admin": "^13.0.1",
    "express": "^4.21.1",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.0",
    "cors": "^2.8.5",
    "express-session": "^1.18.1",
    "connect-pg-simple": "^9.0.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8",
    "drizzle-zod": "^0.5.1"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));

// Copy essential node_modules instead of installing
console.log('📋 Copying essential dependencies...');
fs.mkdirSync('./dist/node_modules', { recursive: true });

const essentialDeps = [
  '@neondatabase/serverless',
  'drizzle-orm', 
  'firebase-admin',
  'express',
  'bcrypt',
  'ws',
  'cors',
  'express-session',
  'connect-pg-simple',
  'passport',
  'passport-local',
  'multer',
  'zod',
  'drizzle-zod'
];

// Copy each dependency if it exists
for (const dep of essentialDeps) {
  const srcPath = `./node_modules/${dep}`;
  const destPath = `./dist/node_modules/${dep}`;
  
  if (fs.existsSync(srcPath)) {
    try {
      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyRecursive(srcPath, destPath);
      console.log(`  ✓ ${dep}`);
    } catch (error) {
      console.log(`  ⚠ Failed to copy ${dep}: ${error.message}`);
    }
  } else {
    console.log(`  ⚠ ${dep} not found in node_modules`);
  }
}

// Verify build
if (!fs.existsSync('./dist/index.js')) {
  console.error('❌ Server build failed - dist/index.js not found');
  process.exit(1);
}

console.log('✅ Fast deployment build complete!');
console.log('📋 Deployment structure:');
console.log('  ├── dist/index.js (server)');
console.log('  ├── dist/package.json (production config)');
console.log('  ├── dist/node_modules/ (dependencies)');
console.log('  └── dist/public/ (static assets)');
console.log('');
console.log('🚀 Ready for deployment! Use "cd dist && node index.js" to run');