#!/usr/bin/env node

/**
 * Comprehensive Deployment Fix Script
 * Addresses all deployment failure issues identified in error report
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 HEINOUS TRIVIA - COMPREHENSIVE DEPLOYMENT FIX');
console.log('====================================================');

try {
  // Step 1: Clean previous build artifacts
  console.log('\n🧹 Cleaning previous build artifacts...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Removed existing dist directory');
  }

  // Step 2: Create deployment directory structure
  console.log('\n📁 Creating deployment directory structure...');
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/public', { recursive: true });
  console.log('✅ Created dist directory structure');

  // Step 3: Build server bundle with esbuild
  console.log('\n🔨 Building server bundle with esbuild...');
  
  const buildCommand = `npx esbuild server/index.ts \\
    --bundle \\
    --platform=node \\
    --target=node18 \\
    --format=esm \\
    --external:bcrypt \\
    --external:express \\
    --external:firebase \\
    --external:firebase-admin \\
    --external:drizzle-orm \\
    --external:drizzle-kit \\
    --external:@neondatabase/serverless \\
    --external:cors \\
    --external:ws \\
    --external:zod \\
    --external:passport \\
    --external:passport-local \\
    --external:express-session \\
    --external:connect-pg-simple \\
    --external:multer \\
    --external:dotenv \\
    --external:node-fetch \\
    --external:form-data \\
    --external:@babel/* \\
    --external:lightningcss \\
    --external:@vitejs/* \\
    --external:vite \\
    --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);" \\
    --outfile=dist/index.js`;

  execSync(buildCommand, { stdio: 'inherit' });
  
  const serverStats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle created: dist/index.js (${Math.round(serverStats.size / 1024)}KB)`);

  // Step 4: Copy client static assets to dist/public
  console.log('\n📦 Copying client static assets...');
  
  function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const items = fs.readdirSync(src);
      items.forEach(item => {
        copyRecursive(path.join(src, item), path.join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy client/public to dist/public
  if (fs.existsSync('client/public')) {
    const publicItems = fs.readdirSync('client/public');
    publicItems.forEach(item => {
      const srcPath = path.join('client/public', item);
      const destPath = path.join('dist/public', item);
      copyRecursive(srcPath, destPath);
    });
  }

  // Build client with Vite and copy to dist/public
  console.log('🔨 Building client with Vite...');
  execSync('cd client && npx vite build', { stdio: 'inherit' });
  
  // Copy client dist to dist/public
  if (fs.existsSync('client/dist')) {
    const clientDistItems = fs.readdirSync('client/dist');
    clientDistItems.forEach(item => {
      const srcPath = path.join('client/dist', item);
      const destPath = path.join('dist/public', item);
      if (fs.existsSync(destPath)) {
        if (fs.statSync(destPath).isDirectory()) {
          fs.rmSync(destPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(destPath);
        }
      }
      copyRecursive(srcPath, destPath);
    });
  }

  // Count static assets
  const countFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    });
    return count;
  };

  const assetCount = countFiles('dist/public');
  console.log(`✅ ${assetCount} static assets copied to dist/public/`);

  // Step 5: Create production package.json with correct configuration
  console.log('\n📄 Creating production package.json...');
  
  const productionPackageJson = {
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

  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));
  console.log('✅ Production package.json created with correct start script');

  // Step 6: Create Docker configuration for Cloud Run compatibility
  console.log('\n🐳 Creating Docker configuration...');
  
  const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --only=production

# Copy application files
COPY index.js ./
COPY public ./public

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Start command
CMD ["npm", "start"]
`;

  fs.writeFileSync('dist/Dockerfile', dockerfile);
  
  const dockerignore = `node_modules
.git
.gitignore
*.md
client
server
shared
*.ts
*.js.map
`;

  fs.writeFileSync('dist/.dockerignore', dockerignore);
  console.log('✅ Docker configuration created for Cloud Run deployment');

  // Step 7: Validate all required deployment files
  console.log('\n✅ Validating deployment build...');
  
  const requiredFiles = [
    'dist/index.js',
    'dist/package.json',
    'dist/public/index.html',
    'dist/Dockerfile'
  ];

  let allFilesValid = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ ${file} (${sizeKB}KB)`);
      
      // Validate minimum sizes
      if (file === 'dist/index.js' && stats.size < 50000) {
        console.error(`❌ ${file} is too small (${sizeKB}KB) - server bundle may be incomplete`);
        allFilesValid = false;
      }
      if (file === 'dist/public/index.html' && stats.size < 1000) {
        console.error(`❌ ${file} is too small (${sizeKB}KB) - HTML file may be incomplete`);
        allFilesValid = false;
      }
    } else {
      console.error(`❌ Missing required file: ${file}`);
      allFilesValid = false;
    }
  }

  if (!allFilesValid) {
    throw new Error('Build validation failed - required files missing or invalid');
  }

  // Step 8: Verify package.json configuration
  const packageJson = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
  const requiredFields = {
    'type': 'module',
    'main': 'index.js',
    'scripts.start': 'NODE_ENV=production node index.js'
  };

  console.log('\n📦 Validating package.json configuration:');
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
      allFilesValid = false;
    }
  }

  if (!allFilesValid) {
    throw new Error('Package.json validation failed');
  }

  // Step 9: Test server startup capability (syntax check)
  console.log('\n🧪 Testing server bundle syntax...');
  try {
    execSync('node --check dist/index.js', { stdio: 'pipe' });
    console.log('✅ Server bundle syntax validation passed');
  } catch (error) {
    console.error('❌ Server bundle syntax validation failed');
    throw error;
  }

  // Step 10: Update main package.json build command
  console.log('\n🔧 Updating main package.json build configuration...');
  const mainPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  mainPackageJson.scripts.build = 'node deploy-final-fixed.js';
  fs.writeFileSync('package.json', JSON.stringify(mainPackageJson, null, 2));
  console.log('✅ Updated main package.json build command');

  console.log('\n🎉 DEPLOYMENT BUILD SUCCESSFUL!');
  console.log('📋 Build Summary:');
  console.log(`   • Server entry point: dist/index.js (${Math.round(fs.statSync('dist/index.js').size / 1024)}KB)`);
  console.log(`   • Static assets: ${assetCount} files in dist/public/`);
  console.log(`   • Production config: dist/package.json`);
  console.log(`   • Start command: "NODE_ENV=production node index.js"`);
  console.log(`   • Server binding: 0.0.0.0:$PORT (Cloud Run compatible)`);
  console.log(`   • Docker ready: dist/Dockerfile created`);
  console.log('\n✅ ALL DEPLOYMENT FIXES APPLIED - READY FOR CLOUD RUN PROMOTION');

} catch (error) {
  console.error('\n❌ DEPLOYMENT BUILD FAILED');
  console.error('Error details:', error.message);
  console.error('\nTroubleshooting suggestions:');
  console.error('1. Ensure all dependencies are installed: npm install');
  console.error('2. Check for TypeScript compilation errors');
  console.error('3. Verify Firebase configuration is correct');
  console.error('4. Check that all required environment variables are set');
  process.exit(1);
}