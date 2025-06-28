#!/usr/bin/env node

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 5000;

function log(message, source = "dev-server") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Check if we have TypeScript server files
const serverIndexPath = path.join(__dirname, 'server', 'index.ts');
const serverExists = fs.existsSync(serverIndexPath);

if (serverExists) {
  log('Starting development server with tsx...');
  
  // Start the server using tsx directly to bypass Vite config issues
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: PORT.toString()
    },
    stdio: 'inherit'
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Development server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  serverProcess.on('error', (err) => {
    log(`Failed to start development server: ${err.message}`);
    log('Falling back to production build...');
    startProductionFallback();
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down...');
    serverProcess.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    log('SIGINT received, shutting down...');
    serverProcess.kill('SIGINT');
  });
  
} else {
  log('No TypeScript server found, starting production fallback');
  startProductionFallback();
}

function startProductionFallback() {
  // Check if we have a production build
  const distPath = path.join(__dirname, 'dist', 'index.js');
  
  if (fs.existsSync(distPath)) {
    log('Starting production build server...');
    
    const prodProcess = spawn('node', ['dist/index.js'], {
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: PORT.toString()
      },
      stdio: 'inherit'
    });
    
    prodProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Production server exited with code ${code}`);
        process.exit(code);
      }
    });
    
  } else {
    log('No production build found. Running build first...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit'
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        log('Build completed. Starting server...');
        startProductionFallback();
      } else {
        log('Build failed. Creating minimal server...');
        startMinimalServer();
      }
    });
  }
}

function startMinimalServer() {
  const app = express();
  
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'client', 'public')));
  
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      mode: 'minimal',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('*', (req, res) => {
    res.send(`
      <html>
        <head><title>Development Server</title></head>
        <body>
          <h1>Development Server Running</h1>
          <p>Minimal fallback server active on port ${PORT}</p>
          <p>Build your application with 'npm run build' for full functionality</p>
        </body>
      </html>
    `);
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    log(`Minimal server running on 0.0.0.0:${PORT}`);
  });
}