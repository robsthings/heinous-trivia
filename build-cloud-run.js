import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🚀 Creating definitive Cloud Run deployment...");

// Step 1: Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 2: Create minimal server bundle optimized for Cloud Run
console.log('📦 Building optimized server bundle...');
try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      // Keep ALL dependencies external for Cloud Run npm install
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
    sourcemap: false,
    keepNames: false,
    packages: 'external'
  });
  
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Server bundle: ${(stats.size / 1024).toFixed(0)}KB`);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Step 3: Create Cloud Run specific package.json
console.log('📄 Creating Cloud Run package.json...');
const cloudRunPackage = {
  name: "heinous-trivia-cloud-run",
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

fs.writeFileSync('dist/package.json', JSON.stringify(cloudRunPackage, null, 2));
console.log('✅ package.json created');

// Step 4: Copy static assets
console.log('📁 Copying static assets...');
const publicSrc = path.join(process.cwd(), 'client', 'public');
const publicDest = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicSrc)) {
  execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
  const publicFiles = fs.readdirSync('dist/public');
  console.log(`✅ ${publicFiles.length} static files copied`);
}

// Step 5: Verify deployment structure
console.log('\n🔍 Final verification:');
const requiredFiles = ['index.js', 'package.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(`dist/${file}`));

if (missingFiles.length > 0) {
  console.error(`❌ Missing files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ All required files present');

// Test server syntax
try {
  execSync('node --check dist/index.js', { stdio: 'pipe' });
  console.log('✅ Server syntax validated');
} catch (error) {
  console.error('❌ Server syntax error');
  process.exit(1);
}

console.log('\n🎉 Cloud Run deployment ready!');
console.log('📂 Deployment structure:');
console.log('   ├── index.js (server)');
console.log('   ├── package.json (dependencies)');
console.log('   └── public/ (static assets)');
console.log('\n🚀 Use: npm run build-cloud-run && deploy from dist/');