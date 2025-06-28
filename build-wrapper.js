#!/usr/bin/env node

// Simple wrapper to ensure build-simple.js can be called as npm run build
// This allows deployment systems to use standard npm build commands

import { spawn } from 'child_process';

console.log('Starting build process...');

const buildProcess = spawn('node', ['build-simple.js'], {
  stdio: 'inherit',
  shell: false
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully');
    process.exit(0);
  } else {
    console.error(`Build failed with exit code ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
});