const fs = require('fs');

console.log('🚀 Creating zero-complexity deployment...');

// Clean and create dist
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Create the absolute simplest Express server possible
const serverCode = `const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(\`Server running on port \${port}\`);
});`;

fs.writeFileSync('./dist/index.js', serverCode);

// Create the absolute minimal package.json
const packageJson = {
  "name": "heinous-trivia",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "4.18.2"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));

// Create public folder with basic HTML
fs.mkdirSync('./dist/public', { recursive: true });

const html = `<!DOCTYPE html>
<html>
<head>
    <title>Heinous Trivia</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background: #000; color: #fff; font-family: Arial; text-align: center; padding: 50px;">
    <h1 style="color: #ff6b6b;">🎃 Heinous Trivia</h1>
    <p>Server is running!</p>
    <p>Deployed successfully at: ${new Date().toISOString()}</p>
</body>
</html>`;

fs.writeFileSync('./dist/public/index.html', html);

console.log('✅ Zero-complexity deployment ready');
console.log('📦 Pure CommonJS, minimal dependencies');
console.log('🚀 Should work on any Node.js hosting platform');