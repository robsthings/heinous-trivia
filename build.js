#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building client and server for production...');

// Build client with Vite
console.log('Building client...');
try {
  execSync('npx vite build', { 
    cwd: './client',
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Move client build to correct location
  if (fs.existsSync('./client/dist')) {
    if (fs.existsSync('./dist/public')) {
      fs.rmSync('./dist/public', { recursive: true });
    }
    fs.mkdirSync('./dist', { recursive: true });
    fs.renameSync('./client/dist', './dist/public');
  }
  console.log('Client build complete');
} catch (error) {
  console.error('Client build failed:', error);
  process.exit(1);
}

// Build server with esbuild
console.log('Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname=__dirname --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
  });
  console.log('Server build complete');
} catch (error) {
  console.error('Server build failed:', error);
  process.exit(1);
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
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.36.4",
    "firebase-admin": "^13.0.1",
    "express": "^4.21.1",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.0",
    "cors": "^2.8.5"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
console.log('Production package.json created');

console.log('Build complete! Ready for deployment.');