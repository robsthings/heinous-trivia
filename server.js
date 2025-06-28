
// Production deployment - uses CommonJS for compatibility
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cloud Run uses PORT environment variable, with fallback for local development
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

function log(message, source = "deployment") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Check if we have a built application in dist/
const distPath = path.join(__dirname, 'dist');
const distIndexExists = fs.existsSync(path.join(distPath, 'index.js'));

if (distIndexExists) {
  log('Found built application, starting production server');
  
  // Start the built server directly
  const serverProcess = spawn('node', ['dist/index.js'], {
    env: { ...process.env, PORT: PORT.toString() },
    stdio: 'inherit'
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Production server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  serverProcess.on('error', (err) => {
    log(`Failed to start production server: ${err.message}`);
    process.exit(1);
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
  log('No built application found - please run "npm run build" first');
  process.exit(1);
}

function startFallbackServer() {
  // Serve static files from dist/public if it exists, otherwise current directory
  const publicPath = fs.existsSync(path.join(distPath, 'public')) 
    ? path.join(distPath, 'public')
    : path.join(__dirname, 'client', 'public');
  
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    log(`Serving static files from ${publicPath}`);
  }

  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      mode: 'fallback'
    });
  });

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    const indexPath = fs.existsSync(path.join(distPath, 'public', 'index.html'))
      ? path.join(distPath, 'public', 'index.html')
      : path.join(__dirname, 'client', 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Application not found - please run build first' });
    }
  });

  // Error handling
  app.use((err, req, res, next) => {
    log(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    log(`Fallback server listening on 0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}
