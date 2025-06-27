const fs = require('fs');
const path = require('path');

console.log('🚀 Creating deployment build...');

// Create dist directory in workspace root where deployment expects it
const distPath = '/home/runner/workspace/dist';
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
app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port', port);
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

console.log('✅ Deployment build created in workspace root');
console.log('📦 File location:', path.join(distPath, 'index.js'));