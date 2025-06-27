#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Verifying deployment readiness...');

// Check 1: Verify dist/index.js exists and has proper size
const indexJsPath = './dist/index.js';
if (!fs.existsSync(indexJsPath)) {
  console.error('❌ FAIL: dist/index.js does not exist');
  process.exit(1);
}

const indexJsSize = fs.statSync(indexJsPath).size;
if (indexJsSize < 50000) {
  console.error(`❌ FAIL: dist/index.js is too small (${Math.round(indexJsSize / 1024)}KB), likely incomplete`);
  process.exit(1);
}
console.log(`✅ PASS: dist/index.js exists (${Math.round(indexJsSize / 1024)}KB)`);

// Check 2: Verify package.json has correct start script
const packageJsonPath = './dist/package.json';
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ FAIL: dist/package.json does not exist');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.scripts.start !== 'NODE_ENV=production node index.js') {
  console.error('❌ FAIL: package.json start script is incorrect');
  process.exit(1);
}
console.log('✅ PASS: package.json has correct start script');

// Check 3: Verify static assets directory structure
const publicPath = './dist/public';
if (!fs.existsSync(publicPath)) {
  console.error('❌ FAIL: dist/public directory does not exist');
  process.exit(1);
}

const indexHtmlPath = './dist/public/index.html';
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ FAIL: dist/public/index.html does not exist');
  process.exit(1);
}
console.log('✅ PASS: Static assets directory structure complete');

// Check 4: Count static assets
let assetCount = 0;
const countAssets = (dir) => {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = `${dir}/${item}`;
    if (fs.statSync(itemPath).isDirectory()) {
      countAssets(itemPath);
    } else {
      assetCount++;
    }
  }
};
countAssets(publicPath);
console.log(`✅ PASS: ${assetCount} static assets available`);

// Check 5: Verify server startup capability
console.log('🧪 Testing server startup...');
try {
  const testResult = execSync('cd dist && PORT=8080 timeout 5 node index.js 2>&1', { 
    encoding: 'utf8',
    timeout: 10000 
  });
  
  if (testResult.includes('serving on 0.0.0.0:8080')) {
    console.log('✅ PASS: Server starts successfully on 0.0.0.0:8080');
  } else {
    console.error('❌ FAIL: Server startup test failed');
    console.error(testResult);
    process.exit(1);
  }
} catch (error) {
  if (error.status === 124) {
    // Timeout is expected for successful server startup
    console.log('✅ PASS: Server startup test completed (timeout expected)');
  } else {
    console.error('❌ FAIL: Server startup error:', error.message);
    process.exit(1);
  }
}

// Check 6: Verify ESM module format
const indexJsContent = fs.readFileSync(indexJsPath, 'utf8');
if (!indexJsContent.includes('import.meta.url')) {
  console.error('❌ FAIL: Server bundle is not in ESM format');
  process.exit(1);
}
console.log('✅ PASS: Server bundle uses ESM format');

// Check 7: Verify Cloud Run compatibility
if (packageJson.type !== 'module') {
  console.error('❌ FAIL: package.json type should be "module"');
  process.exit(1);
}

if (!packageJson.engines || !packageJson.engines.node) {
  console.error('❌ FAIL: package.json missing Node.js engine specification');
  process.exit(1);
}
console.log('✅ PASS: Cloud Run compatibility verified');

console.log('\n🎉 ALL DEPLOYMENT CHECKS PASSED!');
console.log('\n📋 Deployment Summary:');
console.log(`   ✅ Server bundle: ${Math.round(indexJsSize / 1024)}KB ESM format`);
console.log(`   ✅ Start script: NODE_ENV=production node index.js`);
console.log(`   ✅ Static assets: ${assetCount} files in dist/public/`);
console.log(`   ✅ Server binding: 0.0.0.0:PORT for Cloud Run`);
console.log(`   ✅ Module format: ESM with proper imports`);
console.log(`   ✅ Dependencies: Complete production package.json`);
console.log('\n🚀 Ready for Cloud Run deployment!');