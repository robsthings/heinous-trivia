const fs = require('fs');
const path = require('path');

console.log('🚀 Creating deployment build...');

// Create dist directory relative to project root
const distPath = './dist';
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Create the exact server deployment expects
const serverCode = `const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple response
app.get('/', (req, res) => {
  res.send('Server is running!');
});

const port = process.env.PORT || 5000;
const host = '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(\`Server running on \${host}:\${port}\`);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});`;

fs.writeFileSync(path.join(distPath, 'index.js'), serverCode);

// Create package.json in the deployment directory  
const packageJson = {
  "name": "heinous-trivia",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('✅ Deployment build created');
console.log('📦 File location:', path.join(distPath, 'index.js'));