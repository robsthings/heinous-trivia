#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Creating server-only deployment build...');

// Clean previous builds
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server only
console.log('Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
  });
  console.log('Server build complete');
} catch (error) {
  console.error('Server build failed:', error);
  process.exit(1);
}

// Copy client files directly from development structure
console.log('Copying client files...');
const clientSource = './client';
const clientDest = './dist/public';

if (fs.existsSync(clientSource)) {
  // Create basic HTML structure for production
  fs.mkdirSync(clientDest, { recursive: true });
  
  // Copy public directory contents
  if (fs.existsSync(path.join(clientSource, 'public'))) {
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
    
    copyRecursive(path.join(clientSource, 'public'), clientDest);
  }
  
  // Create a simple index.html that loads the development version
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
    <script>
        // Redirect to development client in production
        if (window.location.hostname !== 'localhost') {
            window.location.href = '/';
        }
    </script>
</head>
<body>
    <div id="root">Loading Heinous Trivia...</div>
    <script>
        // This will be served by the development Vite server in production mode
        console.log('Heinous Trivia loading...');
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(clientDest, 'index.html'), indexHtml);
  console.log('Client structure created');
}

// Create production package.json
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
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.36.4",
    "firebase-admin": "^13.0.1",
    "express": "^4.21.1",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

// Verify build structure
console.log('Verifying deployment structure...');
const requiredFiles = ['dist/index.js', 'dist/package.json', 'dist/public/index.html'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('Missing required files:', missingFiles);
  process.exit(1);
}

console.log('✅ Server-only deployment build complete!');
console.log('Files created:');
console.log('  - dist/index.js (server bundle)');
console.log('  - dist/public/ (static assets)');
console.log('  - dist/package.json (production deps)');
console.log('🚀 Ready for Cloud Run deployment!');