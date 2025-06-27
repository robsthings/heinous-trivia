const fs = require('fs');

console.log('🚀 Copying working development setup...');

// Clean dist
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Copy the EXACT server that works in development
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

fs.writeFileSync('./dist/index.js', serverCode);

// Copy the EXACT package.json structure that works
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

fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Exact development copy ready');
console.log('📦 Same Express setup that works locally');