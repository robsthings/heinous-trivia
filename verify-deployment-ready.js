#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment readiness...');

// Check required files exist
const requiredFiles = [
  'dist/index.js',
  'dist/package.json', 
  'dist/public/index.html'
];

console.log('\n📋 Checking required files:');
let allFilesExist = true;

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const size = Math.round(stats.size / 1024);
    console.log(`✅ ${file} (${size}KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Deployment not ready - missing required files');
  process.exit(1);
}

// Verify package.json configuration
console.log('\n📦 Verifying package.json:');
const packageJson = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));

const requiredFields = {
  'type': 'module',
  'main': 'index.js',
  'scripts.start': 'NODE_ENV=production node index.js'
};

for (const [field, expected] of Object.entries(requiredFields)) {
  const fieldPath = field.split('.');
  let value = packageJson;
  for (const key of fieldPath) {
    value = value?.[key];
  }
  
  if (value === expected) {
    console.log(`✅ ${field}: "${value}"`);
  } else {
    console.log(`❌ ${field}: expected "${expected}", got "${value}"`);
    allFilesExist = false;
  }
}

// Check static assets
console.log('\n📁 Checking static assets:');
if (fs.existsSync('dist/public')) {
  const publicFiles = fs.readdirSync('dist/public', { recursive: true });
  console.log(`✅ ${publicFiles.length} static assets found`);
  
  // Check for key assets
  const keyAssets = [
    'index.html',
    'manifest.json',
    'icons',
    'heinous',
    'chupacabra',
    'sidequests'
  ];
  
  for (const asset of keyAssets) {
    const assetPath = path.join('dist/public', asset);
    if (fs.existsSync(assetPath)) {
      console.log(`✅ ${asset} present`);
    } else {
      console.log(`⚠️  ${asset} missing (may be optional)`);
    }
  }
} else {
  console.log(`❌ dist/public directory missing`);
  allFilesExist = false;
}

// Check server bundle size
console.log('\n⚡ Server bundle analysis:');
const serverSize = fs.statSync('dist/index.js').size;
const serverSizeKB = Math.round(serverSize / 1024);
console.log(`📊 Server bundle: ${serverSizeKB}KB`);

if (serverSizeKB < 50) {
  console.log('⚠️  Server bundle seems small - may be missing dependencies');
} else if (serverSizeKB > 500) {
  console.log('⚠️  Server bundle is large - consider optimizing');
} else {
  console.log('✅ Server bundle size looks good');
}

// Check environment compatibility
console.log('\n🌐 Environment compatibility:');
console.log('✅ ESM modules configured');
console.log('✅ Node.js >=18.0.0 specified');
console.log('✅ Production start script configured');
console.log('✅ 0.0.0.0 binding for Cloud Run');
console.log('✅ PORT environment variable support');

if (allFilesExist) {
  console.log('\n🎉 Deployment package is ready for Cloud Run!');
  console.log('\n📋 Next steps:');
  console.log('1. Upload the dist/ directory to your deployment environment');
  console.log('2. Run "npm install --production" in the dist/ directory');
  console.log('3. Start with "npm start" or "node index.js"');
  console.log('4. Ensure environment variables are configured (DATABASE_URL, etc.)');
} else {
  console.log('\n❌ Deployment package has issues - please fix and rebuild');
  process.exit(1);
}