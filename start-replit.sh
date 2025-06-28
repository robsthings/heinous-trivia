#!/bin/bash

# Replit deployment startup script
echo "🚀 Starting Heinous Trivia on Replit..."

# Install only essential dependencies if needed
if [ ! -d "node_modules/tsx" ]; then
  echo "📦 Installing essential dependencies..."
  npm install tsx express cors dotenv
fi

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Start the server
echo "🎮 Starting Heinous Trivia server..."
npx tsx server/index.ts
