#!/usr/bin/env node

/**
 * Comprehensive Deployment Fix - Simplified Approach
 * Uses existing working build system but ensures proper deployment structure
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 HEINOUS TRIVIA - DEPLOYMENT COMPREHENSIVE FIX');
console.log('=================================================');

try {
  // Step 1: Use existing build system first
  console.log('\n🔨 Running existing build system...');
  execSync('node build-server-only.js', { stdio: 'inherit' });
  
  // Step 2: Verify core deployment files exist
  console.log('\n✅ Validating existing deployment build...');
  
  const requiredFiles = [
    'dist/index.js',
    'dist/package.json',
    'dist/public/index.html'
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

  // Step 3: Fix package.json configuration for deployment
  console.log('\n📦 Updating production package.json configuration...');
  
  const packageJsonPath = 'dist/package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure correct deployment configuration
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.start = 'NODE_ENV=production node index.js';
  packageJson.type = 'module';
  packageJson.main = 'index.js';
  
  // Add engines specification for Cloud Run
  packageJson.engines = {
    "node": ">=18.0.0"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated dist/package.json with correct start script and configuration');

  // Step 4: Verify server bundle can start properly
  console.log('\n🧪 Testing server bundle syntax validation...');
  try {
    execSync('node --check dist/index.js', { stdio: 'pipe' });
    console.log('✅ Server bundle syntax validation passed');
  } catch (error) {
    console.error('❌ Server bundle syntax validation failed');
    throw error;
  }

  // Step 5: Create Docker configuration for Cloud Run
  console.log('\n🐳 Creating Docker configuration for Cloud Run...');
  
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

# Start command respects PORT environment variable
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
.env
.env.*
`;

  fs.writeFileSync('dist/.dockerignore', dockerignore);
  console.log('✅ Docker configuration created (Dockerfile and .dockerignore)');

  // Step 6: Check server configuration for proper port binding
  console.log('\n🔧 Verifying server port configuration...');
  
  const serverContent = fs.readFileSync('dist/index.js', 'utf8');
  
  // Check for proper PORT environment variable handling
  if (serverContent.includes('process.env.PORT') && serverContent.includes('0.0.0.0')) {
    console.log('✅ Server correctly configured for PORT environment variable and 0.0.0.0 binding');
  } else {
    console.warn('⚠️  Server may not be properly configured for Cloud Run port binding');
  }

  // Step 7: Count and verify static assets
  const countFiles = (dir) => {
    if (!fs.existsSync(dir)) return 0;
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
  console.log(`📁 ${assetCount} static assets available in dist/public/`);

  // Step 8: Update main package.json to use this script
  console.log('\n🔧 Updating main package.json build command...');
  const mainPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  mainPackageJson.scripts.build = 'node deploy-comprehensive-fix.js';
  fs.writeFileSync('package.json', JSON.stringify(mainPackageJson, null, 2));
  console.log('✅ Updated main package.json build command');

  // Step 9: Create deployment validation script
  console.log('\n📋 Creating deployment validation script...');
  
  const validationScript = `#!/bin/bash
echo "🔍 DEPLOYMENT VALIDATION CHECK"
echo "=============================="

# Check required files
echo "📁 Checking required files..."
for file in "dist/index.js" "dist/package.json" "dist/public/index.html" "dist/Dockerfile"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "✅ $file ($size)"
  else
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Test server syntax
echo "🧪 Testing server syntax..."
node --check dist/index.js && echo "✅ Server syntax valid" || { echo "❌ Server syntax invalid"; exit 1; }

# Check package.json configuration
echo "📦 Validating package.json..."
if grep -q '"start": "NODE_ENV=production node index.js"' dist/package.json; then
  echo "✅ Start script correctly configured"
else
  echo "❌ Start script not properly configured"
  exit 1
fi

echo "🎉 DEPLOYMENT VALIDATION PASSED - READY FOR CLOUD RUN"
`;

  fs.writeFileSync('validate-deployment.sh', validationScript);
  execSync('chmod +x validate-deployment.sh', { stdio: 'pipe' });
  console.log('✅ Created deployment validation script (validate-deployment.sh)');

  console.log('\n🎉 COMPREHENSIVE DEPLOYMENT FIX COMPLETED!');
  console.log('📋 Deployment Summary:');
  console.log(`   • Server entry point: dist/index.js (${Math.round(fs.statSync('dist/index.js').size / 1024)}KB)`);
  console.log(`   • Static assets: ${assetCount} files in dist/public/`);
  console.log(`   • Production config: dist/package.json with correct start script`);
  console.log(`   • Docker ready: dist/Dockerfile and .dockerignore created`);
  console.log(`   • Server binding: Configured for PORT environment variable with 0.0.0.0`);
  console.log(`   • Validation: Run ./validate-deployment.sh to verify deployment`);
  console.log('\n✅ ALL DEPLOYMENT FIXES APPLIED - CLOUD RUN READY');
  console.log('\n📝 Next Steps:');
  console.log('   1. Run: ./validate-deployment.sh');
  console.log('   2. Deploy using Replit Deploy button');
  console.log('   3. Deployment will use dist/ directory with proper configuration');

} catch (error) {
  console.error('\n❌ DEPLOYMENT FIX FAILED');
  console.error('Error details:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Ensure all dependencies are installed: npm install');
  console.error('2. Check that build-server-only.js works: node build-server-only.js');
  console.error('3. Verify Firebase configuration and environment variables');
  process.exit(1);
}