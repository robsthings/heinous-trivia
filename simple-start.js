#!/usr/bin/env node

/**
 * Ultra-simple deployment strategy: Just run the existing server directly
 * No building, no bundling, no complexity - just start the actual server
 */

import { spawn } from 'child_process';

console.log('🚀 Starting Heinous Trivia server directly...');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '8080'
  },
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});