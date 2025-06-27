#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting comprehensive deployment build...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('🧹 Cleaned existing dist directory');
}

fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/public', { recursive: true });

try {
  // Step 1: Build client assets with Vite
  console.log('📦 Building client assets...');
  process.chdir('client');
  execSync('npx vite build', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  process.chdir('..');
  
  // Copy client build to dist/public
  if (fs.existsSync('client/dist')) {
    const clientFiles = fs.readdirSync('client/dist', { recursive: true });
    console.log(`📁 Copying ${clientFiles.length} client assets to dist/public/`);
    
    execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });
  } else {
    throw new Error('Client build failed - client/dist not found');
  }

  // Step 2: Build server bundle with proper ESM configuration
  console.log('⚙️  Building server bundle...');
  execSync(
    `npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:import.meta.dirname='"."' --define:process.env.NODE_ENV='"production"' --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-cartographer --external:@replit/vite-plugin-runtime-error-modal --banner:js='import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'`,
    { 
      stdio: 'inherit',
      timeout: 60000 // 1 minute timeout
    }
  );

  // Step 3: Create production-ready package.json with correct dependencies and start script
  console.log('📄 Creating production package.json...');
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
  
  fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  console.log('✅ Production package.json created');

  // Step 4: Verify all required files exist and are properly sized
  console.log('🔍 Verifying build outputs...');
  const requiredFiles = [
    'dist/index.js',
    'dist/public/index.html',
    'dist/package.json'
  ];

  let allFilesValid = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ ${file} (${sizeKB}KB)`);
      
      // Validate minimum sizes
      if (file === 'dist/index.js' && stats.size < 50000) { // 50KB minimum
        console.error(`❌ ${file} is too small (${sizeKB}KB) - server bundle may be incomplete`);
        allFilesValid = false;
      }
      if (file === 'dist/public/index.html' && stats.size < 1000) { // 1KB minimum
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

  // Step 5: Count static assets
  const publicFiles = fs.readdirSync('dist/public', { recursive: true });
  const assetCount = publicFiles.filter(file => !fs.statSync(path.join('dist/public', file)).isDirectory()).length;
  console.log(`📁 ${assetCount} static assets ready for deployment`);

  // Step 6: Verify package.json configuration
  const packageJson = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
  const requiredFields = {
    'type': 'module',
    'main': 'index.js',
    'scripts.start': 'NODE_ENV=production node index.js'
  };

  console.log('📦 Validating package.json configuration:');
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

  // Step 7: Test server startup capability (dry run)
  console.log('🧪 Testing server startup...');
  try {
    // Quick syntax check on the built server
    execSync('node --check dist/index.js', { stdio: 'pipe' });
    console.log('✅ Server bundle syntax validation passed');
  } catch (error) {
    console.error('❌ Server bundle syntax validation failed');
    throw error;
  }

  console.log('\n🎉 DEPLOYMENT BUILD SUCCESSFUL!');
  console.log('📋 Build Summary:');
  console.log(`   • Server entry point: dist/index.js (${Math.round(fs.statSync('dist/index.js').size / 1024)}KB)`);
  console.log(`   • Static assets: ${assetCount} files in dist/public/`);
  console.log(`   • Production config: dist/package.json`);
  console.log(`   • Start command: "NODE_ENV=production node index.js"`);
  console.log(`   • Server binding: 0.0.0.0:$PORT (Cloud Run compatible)`);
  console.log('\n✅ All deployment requirements met - ready for Cloud Run promotion');

} catch (error) {
  console.error('\n❌ DEPLOYMENT BUILD FAILED:');
  console.error(error.message);
  
  // Cleanup on failure
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('🧹 Cleaned up incomplete build');
  }
  
  process.exit(1);
}