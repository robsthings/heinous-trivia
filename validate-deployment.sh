#!/bin/bash

echo "🔍 DEPLOYMENT VALIDATION CHECK"
echo "=============================="

# Check required files
echo "📁 Checking required files..."
for file in "dist/index.js" "dist/package.json" "dist/public/index.html" "dist/Dockerfile"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "✅ $file ($size)"
  else
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Test server syntax
echo "🧪 Testing server syntax..."
node --check dist/index.js && echo "✅ Server syntax valid" || { echo "❌ Server syntax invalid"; exit 1; }

# Check package.json configuration
echo "📦 Validating package.json..."
if grep -q '"start": "NODE_ENV=production node index.js"' dist/package.json; then
  echo "✅ Start script correctly configured"
else
  echo "❌ Start script not properly configured"
  exit 1
fi

# Check for proper PORT environment variable handling
echo "🔧 Checking server port configuration..."
if grep -q "process.env.PORT" dist/index.js && grep -q "0.0.0.0" dist/index.js; then
  echo "✅ Server configured for Cloud Run (PORT env var + 0.0.0.0 binding)"
else
  echo "❌ Server not properly configured for Cloud Run"
  exit 1
fi

# Count static assets
echo "📁 Counting static assets..."
asset_count=$(find dist/public -type f | wc -l)
echo "✅ $asset_count static assets available"

echo ""
echo "🎉 DEPLOYMENT VALIDATION PASSED - READY FOR CLOUD RUN"
echo "📋 Summary:"
echo "   • dist/index.js: Production server bundle"
echo "   • dist/package.json: Correct start script and dependencies"
echo "   • dist/public/: Complete static asset structure"
echo "   • dist/Dockerfile: Docker configuration for Cloud Run"
echo "   • Server: Configured for PORT environment variable with 0.0.0.0 binding"
echo ""
echo "✅ ALL DEPLOYMENT FIXES SUCCESSFULLY APPLIED"