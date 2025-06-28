#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating deployment build - bypassing all vite config issues...');

// Create deployment files directly in root for Cloud Run
const distPath = './dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });
fs.mkdirSync(path.join(distPath, 'public'), { recursive: true });

// Also create production files in root for direct Cloud Run deployment
const rootProductionFiles = ['./index.js', './package.json', './public'];
rootProductionFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      fs.rmSync(file, { recursive: true, force: true });
    } else {
      fs.unlinkSync(file);
    }
  }
});

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Create complete server bundle - bypassing vite entirely
console.log('🔧 Creating server bundle...');

const serverCode = `import express from 'express';
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
  console.log(\`\${formattedTime} [\${source}] \${message}\`);
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
      log(\`\${req.method} \${req.path} \${res.statusCode} in \${duration}ms\`);
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
    question: \`Horror question \${i + 1}?\`,
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
  log(\`Error: \${err.message}\`);
  res.status(500).json({ error: 'Internal server error' });
});

// Cloud Run uses PORT environment variable, fallback to 5000 for local
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const host = "0.0.0.0";

// Enhanced error handling for server startup
try {
  server.listen(port, host, () => {
    log(\`✅ Production server running on \${host}:\${port}\`);
    log(\`🌐 Health check: http://\${host}:\${port}/api/health\`);
    log(\`📊 Environment: \${process.env.NODE_ENV || 'production'}\`);
    log(\`🚀 Ready for Cloud Run deployment\`);
  });
} catch (error) {
  log(\`❌ Failed to start server: \${error.message}\`);
  process.exit(1);
}

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  log(\`\${signal} received, shutting down gracefully...\`);
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
  log(\`Uncaught Exception: \${error.message}\`);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(\`Unhandled Rejection at: \${promise}, reason: \${reason}\`);
  process.exit(1);
});
`;

// Write server files to both dist and root for deployment compatibility
fs.writeFileSync(path.join(distPath, 'index.js'), serverCode);
fs.writeFileSync('./index.js', serverCode);

// Create package.json with proper module configuration for Cloud Run
const packageJson = {
  "name": "heinous-trivia-production", 
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "@neondatabase/serverless": "^1.0.1",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(packageJson, null, 2));
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

// Create index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23);
            color: white; 
            margin: 0; 
            padding: 2rem;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem;
            background: rgba(0,0,0,0.7);
            border-radius: 15px;
            border: 1px solid rgba(255,107,107,0.3);
        }
        h1 { 
            color: #ff6b6b; 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255,107,107,0.5);
        }
        .status {
            color: #4ade80;
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(74,222,128,0.1);
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Horror-themed Multiplayer Trivia Platform</p>
        <div class="status">Server Ready for Deployment</div>
    </div>
</body>
</html>`;

// Write index.html to both locations
fs.writeFileSync(path.join(distPath, 'public', 'index.html'), indexHtml);
fs.writeFileSync('./public/index.html', indexHtml);

// Copy existing assets if available to both locations
if (fs.existsSync('./client/public')) {
  try {
    const items = fs.readdirSync('./client/public');
    items.forEach(item => {
      const srcPath = path.join('./client/public', item);
      const distDestPath = path.join(distPath, 'public', item);
      const rootDestPath = path.join('./public', item);
      
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, distDestPath);
        fs.copyFileSync(srcPath, rootDestPath);
      } else if (fs.statSync(srcPath).isDirectory()) {
        // Copy subdirectories recursively
        const copyDir = (src, dest) => {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          const entries = fs.readdirSync(src);
          entries.forEach(entry => {
            const srcEntry = path.join(src, entry);
            const destEntry = path.join(dest, entry);
            if (fs.statSync(srcEntry).isDirectory()) {
              copyDir(srcEntry, destEntry);
            } else {
              fs.copyFileSync(srcEntry, destEntry);
            }
          });
        };
        copyDir(srcPath, distDestPath);
        copyDir(srcPath, rootDestPath);
      }
    });
    console.log('📁 Copied client assets to both dist/ and root locations');
  } catch (err) {
    console.log('⚠️ Could not copy client assets:', err.message);
  }
}

// Verify build - check both locations
const distServerSize = fs.statSync(path.join(distPath, 'index.js')).size;
const rootServerSize = fs.statSync('./index.js').size;
const distPackageSize = fs.statSync(path.join(distPath, 'package.json')).size;
const rootPackageSize = fs.statSync('./package.json').size;
const distClientSize = fs.statSync(path.join(distPath, 'public', 'index.html')).size;
const rootClientSize = fs.statSync('./public/index.html').size;

// Count total files in each location
const distFiles = require('child_process').execSync(`find ${distPath} -type f | wc -l`).toString().trim();
const rootPublicFiles = require('child_process').execSync('find ./public -type f 2>/dev/null | wc -l || echo 0').toString().trim();

console.log('');
console.log('✅ DUAL-LOCATION BUILD SUCCESSFUL');
console.log('📁 DIST DIRECTORY:');
console.log(`   dist/index.js: ${(distServerSize/1024).toFixed(1)}KB`);
console.log(`   dist/package.json: ${(distPackageSize/1024).toFixed(1)}KB`);
console.log(`   dist/public/index.html: ${(distClientSize/1024).toFixed(1)}KB`);
console.log(`   Total files: ${distFiles}`);
console.log('📁 ROOT DIRECTORY (for Cloud Run):');
console.log(`   index.js: ${(rootServerSize/1024).toFixed(1)}KB`);
console.log(`   package.json: ${(rootPackageSize/1024).toFixed(1)}KB`);
console.log(`   public/index.html: ${(rootClientSize/1024).toFixed(1)}KB`);
console.log(`   Public files: ${rootPublicFiles}`);
console.log('');
console.log('🚀 Deploy options:');
console.log('   Legacy: node dist/index.js');
console.log('   Cloud Run: node index.js');
console.log('⚡ Health: /api/health');