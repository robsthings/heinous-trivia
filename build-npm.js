#!/usr/bin/env node

// NPM Build Script - Calls the proven build-simple.js
const { execSync } = require('child_process');

console.log('📦 Running npm build script...');

try {
  execSync('node build-simple.js', { stdio: 'inherit' });
  console.log('✅ NPM build completed successfully');
} catch (error) {
  console.error('❌ NPM build failed:', error.message);
  process.exit(1);
}