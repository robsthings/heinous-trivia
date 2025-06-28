#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function log(message, source = "dev") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

log('Starting development server with direct tsx execution...');

// Start server directly with tsx, bypassing Vite config issues
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    PORT: '5000'
  },
  stdio: 'inherit',
  shell: true
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    log(`Server exited with code ${code}`);
  }
  process.exit(code);
});

serverProcess.on('error', (err) => {
  log(`Failed to start server: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  log(`${signal} received, shutting down...`);
  serverProcess.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));