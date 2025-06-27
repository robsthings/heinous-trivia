
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for production deployment...');

// Clean and create dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Verify entry point exists
if (!fs.existsSync('./server/index.ts')) {
  console.error('❌ Entry point server/index.ts not found!');
  process.exit(1);
}

// Build server bundle
console.log('Building server...');
try {
  const buildCommand = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--packages=external', 
    '--bundle',
    '--format=esm',
    '--outfile=dist/index.js',
    '--define:process.env.NODE_ENV=\'"production"\'',
    '--banner:js="import { fileURLToPath } from \'url\'; import { dirname } from \'path\'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"',
    '--resolve-extensions=.ts,.js',
    '--target=node18'
  ].join(' ');
  
  console.log('Executing build command...');
  execSync(buildCommand, { stdio: 'inherit', cwd: process.cwd() });
  
  // Verify the output file was created
  if (!fs.existsSync('./dist/index.js')) {
    console.error('❌ Build failed: dist/index.js was not created!');
    process.exit(1);
  }
  
  const fileSize = Math.round(fs.statSync('./dist/index.js').size / 1024);
  console.log(`✅ Server bundle created successfully (${fileSize}KB)`);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create production directory structure
fs.mkdirSync('./dist/public', { recursive: true });

// Copy static assets
if (fs.existsSync('./client/public')) {
  console.log('Copying static assets...');
  try {
    execSync('cp -r client/public/* dist/public/ 2>/dev/null || true', { stdio: 'inherit' });
  } catch (error) {
    console.log('Note: Some static assets may not have copied, continuing...');
  }
}

// Create production index.html
console.log('Creating production index.html...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heinous Trivia - Horror Trivia Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      background: linear-gradient(135deg, #0b0b23 0%, #1a0a2e 50%, #16213e 100%); 
      color: white; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container { max-width: 600px; padding: 2rem; }
    h1 { 
      font-size: clamp(2rem, 8vw, 4rem);
      color: #ff6b35;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
      margin-bottom: 1rem;
    }
    p { font-size: 1.2rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div id="root">
    <div class="container">
      <h1>HEINOUS TRIVIA</h1>
      <p>Production server is running...</p>
      <p>API available at /api/*</p>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('./dist/public/index.html', indexHtml);

// Create production package.json
console.log('Creating production package.json...');
const prodPackageJson = {
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(prodPackageJson, null, 2));

// Final verification
const serverSize = Math.round(fs.statSync('./dist/index.js').size / 1024);
const assetCount = fs.readdirSync('./dist/public').length;

console.log('✅ Production build complete:');
console.log(`   Server: dist/index.js (${serverSize}KB)`);
console.log(`   Assets: ${assetCount} files in dist/public/`);

// Test that the built file is valid JavaScript
try {
  console.log('🧪 Testing built file syntax...');
  execSync('node --check dist/index.js', { stdio: 'pipe' });
  console.log('✅ Built file syntax is valid');
} catch (error) {
  console.error('❌ Built file has syntax errors:', error.message);
  process.exit(1);
}

console.log('🚀 Ready for deployment');
