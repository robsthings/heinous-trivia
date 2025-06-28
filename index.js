import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoints
app.get('/api/haunt-config/:hauntId', (req, res) => {
  res.json({
    hauntId: req.params.hauntId,
    name: 'Horror Haunt',
    theme: 'dark'
  });
});

app.get('/api/trivia-questions/:hauntId', (req, res) => {
  const questions = Array(20).fill(null).map((_, i) => ({
    question: `Horror question ${i + 1}?`,
    answers: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: i % 4
  }));
  res.json({ questions });
});

app.get('/api/ads/:hauntId', (req, res) => {
  res.json({ ads: [] });
});

app.get('/api/leaderboard/:hauntId', (req, res) => {
  res.json([]);
});

app.post('/api/leaderboard/:hauntId', (req, res) => {
  res.json({ success: true });
});

// Static files
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// SPA routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
});

app.use((err, req, res, next) => {
  log(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Cloud Run uses PORT environment variable, fallback to 5000 for local
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const host = "0.0.0.0";

// Enhanced error handling for server startup
try {
  server.listen(port, host, () => {
    log(`✅ Production server running on ${host}:${port}`);
    log(`🌐 Health check: http://${host}:${port}/api/health`);
    log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
    log(`🚀 Ready for Cloud Run deployment`);
  });
} catch (error) {
  log(`❌ Failed to start server: ${error.message}`);
  process.exit(1);
}

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    log('Force shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});
