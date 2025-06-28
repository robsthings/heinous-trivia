#!/bin/bash

# Deployment build script for Cloud Run
echo "🚀 Starting deployment build process..."

# Execute the proven build-simple.js script
node build-simple.js

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment build completed successfully!"
    echo "📦 Ready for Cloud Run deployment"
    exit 0
else
    echo "❌ Deployment build failed"
    exit 1
fi