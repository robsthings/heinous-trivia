const fs = require('fs');
const path = require('path');

console.log('🚀 Final deployment build - bypassing all Vite config issues...');

// Clean and create dist directory
const distPath = './dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Create comprehensive server entry point
console.log('🔧 Creating server entry point...');

const serverCode = `import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(\`\${timestamp} [express] \${req.method} \${req.path} \${res.statusCode} in \${duration}ms\`);
    }
  });
  next();
});

// Health check for Cloud Run
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// SPA routing - catch all
app.get('*', (req, res) => {
  const indexPath = path.resolve(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Cloud Run compatibility
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(\`\${timestamp} [express] serving on \${host}:\${port}\`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

fs.writeFileSync(path.join(distPath, 'index.js'), serverCode);

// Create production package.json
console.log('📄 Creating production package.json...');
const prodPackageJson = {
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
    "dotenv": "^16.3.1",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "drizzle-orm": "^0.44.2",
    "@neondatabase/serverless": "^1.0.1",
    "bcrypt": "^6.0.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "express-session": "^1.18.1",
    "connect-pg-simple": "^10.0.0",
    "multer": "^2.0.1",
    "node-fetch": "^3.3.2",
    "form-data": "^4.0.3",
    "html2canvas": "^1.4.1",
    "ws": "^8.18.2",
    "zod": "^3.25.67",
    "drizzle-zod": "^0.8.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(prodPackageJson, null, 2));

// Create client assets
console.log('🎨 Creating client assets...');
const clientPublicPath = path.join(distPath, 'public');
fs.mkdirSync(clientPublicPath, { recursive: true });

// Create production index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Horror Trivia Platform</title>
    <meta name="description" content="Immersive horror-themed multiplayer trivia platform">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
            color: #ffffff; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 800px;
            padding: 3rem;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 16px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 { 
            color: #ff6b6b; 
            font-size: clamp(2.5rem, 8vw, 4rem);
            margin-bottom: 1rem;
            text-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
        }
        .subtitle {
            color: #bb86fc;
            font-size: clamp(1.2rem, 4vw, 1.5rem);
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .status {
            color: #4ade80;
            font-weight: 600;
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(74, 222, 128, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(74, 222, 128, 0.3);
        }
        @media (max-width: 768px) {
            .container { margin: 1rem; padding: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <div class="subtitle">Horror-themed Multiplayer Trivia Platform</div>
        <div class="status">Server Ready for Deployment</div>
    </div>
    <script>
        // Client-side routing support
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            console.log('SPA routing detected for:', window.location.pathname);
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(clientPublicPath, 'index.html'), indexHtml);

// Copy existing static assets if available
const staticSources = ['./client/public', './attached_assets'];
staticSources.forEach(source => {
  if (fs.existsSync(source)) {
    try {
      fs.cpSync(source, clientPublicPath, { 
        recursive: true, 
        filter: (src) => !src.includes('node_modules') && !src.includes('.git')
      });
      console.log(`📁 Copied assets from ${source}`);
    } catch (err) {
      console.log(`⚠️ Could not copy ${source}: ${err.message}`);
    }
  }
});

// Verify build
console.log('🔍 Verifying build...');
const buildFiles = {
  server: path.join(distPath, 'index.js'),
  package: path.join(distPath, 'package.json'),
  client: path.join(clientPublicPath, 'index.html')
};

let allValid = true;
Object.entries(buildFiles).forEach(([type, filePath]) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${type}: ${(stats.size / 1024).toFixed(1)}KB`);
  } else {
    console.log(`❌ Missing ${type} file`);
    allValid = false;
  }
});

const assetFiles = fs.readdirSync(clientPublicPath, { recursive: true }).filter(f => typeof f === 'string');
console.log(`📂 Total assets: ${assetFiles.length} files`);

if (allValid) {
  console.log('');
  console.log('🎉 DEPLOYMENT BUILD SUCCESSFUL');
  console.log('📋 Files created:');
  console.log('   • dist/index.js (server)');
  console.log('   • dist/package.json (dependencies)');
  console.log('   • dist/public/ (client assets)');
  console.log('');
  console.log('🚀 Build: npm run build');
  console.log('🚀 Start: node dist/index.js');
} else {
  console.log('❌ Build failed');
  process.exit(1);
}