import { build } from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🚀 Creating production Cloud Run deployment...");

// Step 1: Clean and prepare deployment directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Step 2: Build server with Cloud Run optimizations
console.log('📦 Building server for Cloud Run...');
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [
    // Keep dependencies external for Cloud Run npm install
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
  keepNames: true,
  packages: 'external'
});

console.log(`✅ Server bundle created: ${(fs.statSync('dist/index.js').size / 1024).toFixed(0)}KB`);

// Step 3: Create Cloud Run compatible package.json
console.log('📄 Creating production package.json...');
const productionPackage = {
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
    "node": ">=18.0.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));
console.log('✅ Production package.json created');

// Step 4: Copy static assets
console.log('📁 Copying static assets...');
const publicSrc = path.join(process.cwd(), 'client', 'public');
const publicDest = path.join(process.cwd(), 'dist', 'public');

if (fs.existsSync(publicSrc)) {
  execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
  const assetCount = fs.readdirSync('dist/public').length;
  console.log(`✅ ${assetCount} static assets copied`);
}

// Step 5: Create .gcloudignore for deployment
const gcloudignore = `node_modules/
.git/
.env*
*.log
coverage/
.nyc_output/
`;
fs.writeFileSync('dist/.gcloudignore', gcloudignore);
console.log('✅ .gcloudignore created');

// Step 6: Create app.yaml for App Engine (alternative deployment)
const appYaml = `runtime: nodejs18

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 0
  max_instances: 10
`;
fs.writeFileSync('dist/app.yaml', appYaml);
console.log('✅ app.yaml created');

// Step 7: Final verification and testing
console.log('\n🔍 Deployment verification:');

// Check required files
const requiredFiles = ['index.js', 'package.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(`dist/${file}`));

if (missingFiles.length > 0) {
  console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Validate server syntax
try {
  execSync('node --check dist/index.js', { stdio: 'pipe' });
  console.log('✅ Server syntax validated');
} catch (error) {
  console.error('❌ Server syntax error');
  process.exit(1);
}

// Test server startup
console.log('🧪 Testing server startup...');
try {
  const testProcess = execSync('cd dist && PORT=8080 timeout 3s node index.js', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  console.log('✅ Server startup test passed');
} catch (error) {
  // Timeout is expected
  if (error.status === 124) {
    console.log('✅ Server startup test passed (timeout expected)');
  } else {
    console.error('❌ Server startup failed:', error.stderr || error.stdout);
    process.exit(1);
  }
}

console.log('\n📊 Deployment summary:');
console.log(`📂 Server bundle: ${(fs.statSync('dist/index.js').size / 1024).toFixed(0)}KB`);
console.log(`📄 Package.json: ${fs.existsSync('dist/package.json') ? 'Ready' : 'Missing'}`);
console.log(`📁 Static assets: ${fs.existsSync('dist/public') ? fs.readdirSync('dist/public').length : 0} files`);
console.log(`🔧 Configuration: .gcloudignore + app.yaml included`);

console.log('\n🎉 Production deployment ready for Cloud Run!');
console.log('📦 Deploy from dist/ directory');
console.log('🚀 Build command: npm run build');
console.log('🎯 Start command: npm start');