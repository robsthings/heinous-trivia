#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Creating optimized production build...');

// Clean previous builds
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
}

// Build server first (faster)
console.log('Building server...');
try {
  execSync(`npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname=__dirname --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"`, {
    stdio: 'inherit'
  });
  console.log('✅ Server build complete');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}

// Build client with timeout handling
console.log('Building client (this may take a few minutes)...');
try {
  // Use spawn with timeout for better control
  const { spawn } = await import('child_process');
  
  const buildProcess = spawn('npx', ['vite', 'build'], {
    cwd: './client',
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  const buildPromise = new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build process exited with code ${code}`));
      }
    });

    buildProcess.on('error', reject);
  });

  // Set 10 minute timeout for client build
  const timeout = setTimeout(() => {
    buildProcess.kill('SIGTERM');
    console.log('⚠️ Build timeout - attempting graceful termination');
    setTimeout(() => buildProcess.kill('SIGKILL'), 5000);
  }, 10 * 60 * 1000);

  await buildPromise;
  clearTimeout(timeout);

  // Move client build to correct location
  if (fs.existsSync('./client/dist')) {
    fs.mkdirSync('./dist', { recursive: true });
    fs.renameSync('./client/dist', './dist/public');
    console.log('✅ Client build complete');
  } else {
    throw new Error('Client build directory not found');
  }
} catch (error) {
  console.error('❌ Client build failed:', error);
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
console.log('✅ Production package.json created');

// Verify build outputs
const requiredFiles = ['dist/index.js', 'dist/public/index.html', 'dist/package.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles);
  process.exit(1);
}

console.log('🚀 Production build complete! Ready for Cloud Run deployment.');
console.log('Files created:');
console.log('  - dist/index.js (server)');
console.log('  - dist/public/ (client assets)');
console.log('  - dist/package.json (production dependencies)');