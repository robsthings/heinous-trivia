import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Creating deployment build...');

// Clean dist directory
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}
fs.mkdirSync('./dist', { recursive: true });

// Build server with maximum compatibility
console.log('Building server bundle...');
const buildCommand = [
  'npx esbuild server/index.ts',
  '--platform=node',
  '--bundle',
  '--format=cjs', // Use CommonJS for maximum compatibility
  '--outfile=dist/index.js',
  '--external:esbuild',
  '--define:process.env.NODE_ENV=\'"production"\'',
  '--target=node18'
].join(' ');

execSync(buildCommand, { stdio: 'inherit' });

// Create ultra-simple package.json for deployment
const deployPackage = {
  "name": "heinous-trivia-deploy",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync('./dist/package.json', JSON.stringify(deployPackage, null, 2));

// Copy static assets
fs.mkdirSync('./dist/public', { recursive: true });
if (fs.existsSync('./client/public')) {
  execSync('cp -r client/public/* dist/public/', { stdio: 'inherit' });
}

// Verify build
const stats = fs.statSync('./dist/index.js');
console.log(`✅ Build complete: ${Math.round(stats.size / 1024)}KB`);
console.log('🚀 Ready for deployment');