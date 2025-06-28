import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🚀 Creating final Cloud Run deployment...");

// Clean dist directory completely
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build optimized server bundle for Cloud Run
console.log('📦 Building server bundle...');
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    // All production dependencies external for Cloud Run npm install
    '@neondatabase/serverless',
    'bcrypt',
    'cors', 
    'dotenv',
    'drizzle-orm',
    'drizzle-zod',
    'express',
    'firebase',
    'firebase-admin',
    'html2canvas',
    'multer',
    'zod'
  ],
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  },
  minify: true,
  packages: 'external'
});

const stats = fs.statSync('dist/index.js');
console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(0)}KB`);

// Create Cloud Run package.json with exact dependency versions
const packageJson = {
  name: "heinous-trivia-deployment",
  version: "1.0.0", 
  type: "module",
  main: "index.js",
  scripts: {
    start: "node index.js"
  },
  dependencies: {
    "@neondatabase/serverless": "^1.0.1",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.44.2",
    "drizzle-zod": "^0.8.2", 
    "express": "^4.18.2",
    "firebase": "^11.9.1",
    "firebase-admin": "^11.11.1",
    "html2canvas": "^1.4.1",
    "multer": "^2.0.1",
    "zod": "^3.25.67"
  },
  engines: {
    "node": "18"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json created');

// Copy static assets to dist/public
const publicSrc = path.join(process.cwd(), 'client', 'public');
const publicDest = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicSrc)) {
  execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
  console.log('✅ Static assets copied');
}

// Create startup test script
const testScript = `#!/bin/bash
echo "Testing Cloud Run deployment..."
PORT=8080 timeout 10s node index.js &
PID=$!
sleep 5
if ps -p $PID > /dev/null; then
  echo "✅ Server started successfully"
  kill $PID
  exit 0
else
  echo "❌ Server failed to start" 
  exit 1
fi
`;

fs.writeFileSync('dist/test-deployment.sh', testScript);
execSync('chmod +x dist/test-deployment.sh');

console.log('\n🔍 Deployment verification:');
console.log(`📂 index.js: ${(fs.statSync('dist/index.js').size / 1024).toFixed(0)}KB`);
console.log(`📄 package.json: ${fs.existsSync('dist/package.json') ? 'Present' : 'Missing'}`);
console.log(`📁 public/: ${fs.existsSync('dist/public') ? fs.readdirSync('dist/public').length + ' files' : 'Missing'}`);

// Validate server syntax
try {
  execSync('node --check dist/index.js', { stdio: 'pipe' });
  console.log('✅ Server syntax valid');
} catch (error) {
  console.error('❌ Server syntax error');
  process.exit(1);
}

console.log('\n🎉 Cloud Run deployment ready!');
console.log('📦 Deploy the dist/ directory to Cloud Run');