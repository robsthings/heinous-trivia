#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Heinous Trivia deployment build...');

try {
  // Check if build-simple.js exists and use it, otherwise use the inline build logic
  const buildSimplePath = path.join(__dirname, 'build-simple.js');
  
  if (fs.existsSync(buildSimplePath)) {
    console.log('📦 Using existing build-simple.js...');
    execSync('node build-simple.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  } else {
    console.log('📦 Running inline build process...');
    
    // Create dist directory
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }

    // Build server using esbuild
    console.log('🔨 Building server bundle...');
    const esbuildCommand = `npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/index.js --external:fs --external:path --external:url --external:os --external:crypto --external:events --external:stream --external:util --external:multer --external:bcrypt --external:lightningcss --external:@neondatabase/serverless --external:firebase-admin --external:@babel/* --external:babel-* --external:esbuild --external:vite --external:@vitejs/* --external:rollup --external:postcss --external:tailwindcss --external:react --external:react-dom --external:@radix-ui/* --external:lucide-react --packages=external --minify=false --sourcemap=false --keep-names`;
    
    execSync(esbuildCommand, { stdio: 'inherit' });

    // Create production package.json
    console.log('📄 Creating production package.json...');
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
        "zod": "^3.25.67"
      },
      engines: {
        "node": ">=18.0.0"
      }
    };

    fs.writeFileSync("dist/package.json", JSON.stringify(productionPackage, null, 2));

    // Copy static assets
    console.log('📁 Copying static assets...');
    const publicSrc = path.join(__dirname, 'client', 'public');
    const publicDest = path.join(__dirname, 'dist', 'public');
    
    if (fs.existsSync(publicSrc)) {
      execSync(`cp -r "${publicSrc}" "${publicDest}"`, { stdio: 'inherit' });
    }
  }

  // Verify build outputs
  console.log('✅ Verifying build outputs...');
  const requiredFiles = [
    'dist/index.js',
    'dist/package.json'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }

  const serverStats = fs.statSync('dist/index.js');
  console.log(`✅ Build completed successfully!`);
  console.log(`📊 Server bundle: ${(serverStats.size / 1024).toFixed(0)}KB`);
  console.log('🚀 Ready for deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}