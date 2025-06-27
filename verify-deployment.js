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
const sizeKB = Math.round(serverSize / 1024);

if (serverSize > 50000) { // Minimum 50KB for a valid bundle
  console.log(`✅ Server bundle: ${sizeKB}KB (adequate size)`);
} else {
  console.log(`❌ Server bundle: ${sizeKB}KB (too small, likely build error)`);
  allFilesExist = false;
}

// Final verification
if (allFilesExist) {
  console.log('\n🚀 DEPLOYMENT READY!');
  console.log('\nNext steps:');
  console.log('1. Upload dist/ folder to your cloud platform');
  console.log('2. Set NODE_ENV=production');
  console.log('3. Set PORT environment variable (default: 5000)');
  console.log('4. Run: npm start');
  console.log('\nThe application will serve:');
  console.log('- Static assets from dist/public/');
  console.log('- API routes from dist/index.js');
  console.log('- Client-side routing via index.html fallback');
} else {
  console.log('\n❌ DEPLOYMENT NOT READY');
  console.log('Run "npm run build" to fix missing files');
  process.exit(1);
}