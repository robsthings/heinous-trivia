#!/bin/bash
set -e

echo "Creating production build..."

# Clean previous builds
rm -rf dist client/dist

# Build client directly with correct configuration
cd client
echo "Building client..."
npx vite build --mode production --config vite.config.ts
cd ..

# Move client build to correct location for deployment
mkdir -p dist
mv client/dist dist/public

# Build server
echo "Building server..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/index.js \
  --define:import.meta.dirname=__dirname \
  --banner:js="import { fileURLToPath } from 'url'; import { dirname } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"

# Create production package.json
cat > dist/package.json << 'EOF'
{
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.36.4",
    "firebase-admin": "^13.0.1",
    "express": "^4.21.1",
    "bcrypt": "^6.0.0",
    "ws": "^8.18.0",
    "cors": "^2.8.5"
  }
}
EOF

echo "Production build complete in dist/ directory"
echo "Ready for deployment with 'npm start' command"