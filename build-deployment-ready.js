import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🚀 Creating Cloud Run deployment build...");

// Clean and create dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 1: Build server bundle with optimized configuration for Cloud Run
console.log('🖥️ Building server bundle...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      // Core Node modules
      'fs', 'path', 'url', 'os', 'crypto', 'events', 'stream', 'util', 'http', 'https',
      // All production dependencies - let Cloud Run install them
      '@neondatabase/serverless',
      'cors',
      'dotenv',
      'drizzle-orm',
      'drizzle-zod',
      'express',
      'firebase',
      'firebase-admin',
      'multer',
      'bcrypt',
      'zod',
      'html2canvas'
    ],
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    },
    minify: true,
    sourcemap: false,
    keepNames: false,
    packages: 'external'
  });
  
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle created: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Server bundle failed:', error);
  process.exit(1);
}

// Step 2: Create production package.json with exact dependencies for Cloud Run
console.log('📄 Creating Cloud Run package.json...');
const productionPackage = {
  name: "heinous-trivia-production",
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    start: "NODE_ENV=production node index.js"
  },
  dependencies: {
    "@neondatabase/serverless": "^1.0.1",
    "cors": "^2.8.5", 
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.44.2",
    "drizzle-zod": "^0.8.2",
    "express": "^4.18.2",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "multer": "^2.0.1",
    "bcrypt": "^6.0.0",
    "zod": "^3.25.67",
    "html2canvas": "^1.4.1"
  },
  engines: {
    "node": ">=18.0.0"
  }
};

fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created');

// Step 3: Copy static assets to dist/public
console.log('📁 Copying static assets...');
const publicSrc = path.join(process.cwd(), 'client', 'public');
const publicDest = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicSrc)) {
  execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
  console.log('✅ Static assets copied');
} else {
  console.log('⚠️ No public assets found');
}

// Step 4: Create Cloud Run compatible Dockerfile
console.log('🐳 Creating Dockerfile...');
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
`;

fs.writeFileSync('dist/Dockerfile', dockerfile);
console.log('✅ Dockerfile created');

// Step 5: Create .dockerignore
const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.tmp
`;

fs.writeFileSync('dist/.dockerignore', dockerignore);
console.log('✅ .dockerignore created');

// Step 6: Create deployment verification script
const verifyScript = `#!/bin/bash
echo "🔍 Verifying deployment structure..."

# Check required files
if [ ! -f "index.js" ]; then
  echo "❌ Missing index.js"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "❌ Missing package.json"
  exit 1
fi

if [ ! -d "public" ]; then
  echo "❌ Missing public directory"
  exit 1
fi

echo "✅ All required files present"

# Test server syntax
echo "🧪 Testing server syntax..."
node --check index.js
if [ $? -eq 0 ]; then
  echo "✅ Server syntax valid"
else
  echo "❌ Server syntax error"
  exit 1
fi

echo "🎉 Deployment structure verified!"
`;

fs.writeFileSync('dist/verify-deployment.sh', verifyScript);
execSync('chmod +x dist/verify-deployment.sh');
console.log('✅ Verification script created');

// Final verification
console.log('\n🔍 Build verification:');
const distFiles = fs.readdirSync('dist');
console.log('📂 Dist directory contents:', distFiles);

const indexStats = fs.statSync('dist/index.js');
console.log(`✅ Server bundle: ${(indexStats.size / 1024).toFixed(0)}KB`);

if (fs.existsSync('dist/public')) {
  const publicFiles = fs.readdirSync('dist/public');
  console.log(`✅ Public assets: ${publicFiles.length} files`);
}

console.log('\n🎉 Cloud Run deployment build completed successfully!');
console.log('📦 Ready for Cloud Run deployment with:');
console.log('   - index.js (server bundle)');
console.log('   - package.json (production dependencies)');
console.log('   - public/ (static assets)');
console.log('   - Dockerfile (container configuration)');
console.log('   - verify-deployment.sh (validation script)');