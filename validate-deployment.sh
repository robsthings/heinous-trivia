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

echo "🎉 DEPLOYMENT VALIDATION PASSED - READY FOR CLOUD RUN"
