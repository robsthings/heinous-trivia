#!/bin/bash

echo "🚀 Starting Heinous Trivia deployment build (shell script)..."

# Exit on any error
set -e

# Create dist directory
mkdir -p dist

# Build server using esbuild
echo "🔨 Building server bundle..."
npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/index.js \
  --external:fs \
  --external:path \
  --external:url \
  --external:os \
  --external:crypto \
  --external:events \
  --external:stream \
  --external:util \
  --external:multer \
  --external:bcrypt \
  --external:lightningcss \
  --external:@neondatabase/serverless \
  --external:firebase-admin \
  --external:@babel/* \
  --external:babel-* \
  --external:esbuild \
  --external:vite \
  --external:@vitejs/* \
  --external:rollup \
  --external:postcss \
  --external:tailwindcss \
  --external:react \
  --external:react-dom \
  --external:@radix-ui/* \
  --external:lucide-react \
  --packages=external \
  --minify=false \
  --sourcemap=false \
  --keep-names

# Create production package.json
echo "📄 Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "heinous-trivia-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
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
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Copy static assets if they exist
echo "📁 Copying static assets..."
if [ -d "client/public" ]; then
  cp -r client/public dist/
fi

# Verify build outputs
echo "✅ Verifying build outputs..."
if [ ! -f "dist/index.js" ]; then
  echo "❌ Missing dist/index.js"
  exit 1
fi

if [ ! -f "dist/package.json" ]; then
  echo "❌ Missing dist/package.json"
  exit 1
fi

# Show build stats
SERVER_SIZE=$(du -k dist/index.js | cut -f1)
echo "✅ Build completed successfully!"
echo "📊 Server bundle: ${SERVER_SIZE}KB"
echo "🚀 Ready for deployment"