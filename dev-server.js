#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('Starting development server using deployment build...');

// Ensure build exists
if (!fs.existsSync('./dist/index.js')) {
  console.log('Building project first...');
  const build = spawn('node', ['build.js'], { stdio: 'inherit' });
  build.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error('Build failed');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('Starting development server on port 5000...');
  const server = spawn('node', ['index.js'], {
    cwd: './dist',
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', PORT: '5000' }
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Handle shutdown
  process.on('SIGINT', () => {
    server.kill();
    process.exit(0);
  });
}