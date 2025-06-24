#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting development servers...');

// Start Express backend server
const backend = spawn('tsx', ['server/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Start Vite frontend server  
const frontend = spawn('npx', ['vite', '--config', 'vite.dev.config.ts', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

// Handle cleanup
const cleanup = () => {
  console.log('\nShutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle process exits
backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  if (code !== 0) {
    frontend.kill();
    process.exit(code);
  }
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
  if (code !== 0) {
    backend.kill();
    process.exit(code);
  }
});