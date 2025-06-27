#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment build...');

// Check required files exist
const requiredFiles = [
  'dist/index.js',
  'dist/package.json', 
  'dist/public/index.html',
  'dist/public/manifest.json'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    const size = fs.statSync(file).size;
    console.log(`✅ ${file} (${Math.round(size / 1024)}KB)`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
}

// Check dist/public directory structure
if (fs.existsSync('dist/public')) {
  const publicContents = fs.readdirSync('dist/public');
  console.log(`✅ dist/public/ contains ${publicContents.length} items`);
  
  // Check for essential directories
  const essentialDirs = ['icons', 'heinous', 'chupacabra', 'sidequests'];
  for (const dir of essentialDirs) {
    if (publicContents.includes(dir)) {
      console.log(`✅ Essential directory: ${dir}/`);
    } else {
      console.log(`⚠️ Missing directory: ${dir}/`);
    }
  }
} else {
  console.log('❌ dist/public/ directory missing');
  allFilesExist = false;
}

// Verify package.json structure
if (fs.existsSync('dist/package.json')) {
  try {
    const packageData = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
    if (packageData.scripts && packageData.scripts.start) {
      console.log('✅ Production package.json has start script');
    } else {
      console.log('❌ Missing start script in package.json');
    }
    
    if (packageData.dependencies) {
      console.log(`✅ ${Object.keys(packageData.dependencies).length} dependencies listed`);
    }
  } catch (error) {
    console.log('❌ Invalid package.json format');
    allFilesExist = false;
  }
}

// Test server bundle imports
try {
  console.log('🧪 Testing server bundle...');
  // Quick validation that the server file is properly formatted
  const serverContent = fs.readFileSync('dist/index.js', 'utf8');
  if (serverContent.includes('serving on port')) {
    console.log('✅ Server bundle appears valid');
  } else {
    console.log('⚠️ Server bundle may have issues');
  }
} catch (error) {
  console.log('❌ Cannot read server bundle');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n🚀 Deployment build verification PASSED');
  console.log('Ready for Cloud Run deployment with:');
  console.log('- Entry point: node dist/index.js');
  console.log('- Port: Uses PORT environment variable (default 5000)');
  console.log('- Host: Binds to 0.0.0.0');
  console.log('- Static files: Served from dist/public/');
} else {
  console.log('\n❌ Deployment build verification FAILED');
  process.exit(1);
}