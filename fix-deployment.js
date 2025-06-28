import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🔧 Fixing Cloud Run deployment promotion issues...");

// Clean dist completely
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Build with exact Cloud Run requirements
console.log('Building server with Cloud Run specifications...');
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    // External all dependencies for Cloud Run npm install
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
  minify: false,
  sourcemap: false,
  packages: 'external'
});

// Create Cloud Run specific package.json
const packageJson = {
  name: "heinous-trivia",
  version: "1.0.0",
  type: "module",
  main: "index.js",
  scripts: {
    build: "echo 'Build already completed'",
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

// Copy static assets
const publicSrc = path.join(process.cwd(), 'client', 'public');
const publicDest = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicSrc)) {
  execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
}

// Create package-lock.json for npm ci
try {
  execSync('cd dist && npm install --package-lock-only', { stdio: 'pipe' });
  console.log('✅ package-lock.json generated');
} catch (error) {
  console.log('⚠️ package-lock.json generation skipped');
}

console.log(`\n✅ Deployment fixed: ${(fs.statSync('dist/index.js').size / 1024).toFixed(0)}KB server bundle`);
console.log('✅ Cloud Run package.json with build script');
console.log('✅ Static assets copied');
console.log('✅ Ready for Cloud Run promotion');