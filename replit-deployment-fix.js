#!/usr/bin/env node

/**
 * Replit Deployment Workarounds
 * These solutions keep your app hosted on Replit while fixing deployment issues
 */

import fs from 'fs';

console.log('🔧 Creating Replit deployment workarounds...');

// Workaround 1: Create a minimal production package.json that Replit expects
const minimalPackage = {
  name: "heinous-trivia",
  version: "1.0.0",
  type: "module",
  main: "server/index.ts",
  scripts: {
    start: "npx tsx server/index.ts"
  },
  dependencies: {
    "tsx": "^4.20.3",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  engines: {
    "node": "18"
  }
};

// Backup current package.json
if (fs.existsSync('package.json')) {
  fs.copyFileSync('package.json', 'package.json.backup');
  console.log('✅ Backed up current package.json');
}

fs.writeFileSync('package-minimal.json', JSON.stringify(minimalPackage, null, 2));
console.log('✅ Created minimal package.json for deployment');

// Workaround 2: Create startup script that handles dependencies
const startupScript = `#!/bin/bash

# Replit deployment startup script
echo "🚀 Starting Heinous Trivia on Replit..."

# Install only essential dependencies if needed
if [ ! -d "node_modules/tsx" ]; then
  echo "📦 Installing essential dependencies..."
  npm install tsx express cors dotenv
fi

# Set production environment
export NODE_ENV=production
export PORT=\${PORT:-5000}

# Start the server
echo "🎮 Starting Heinous Trivia server..."
npx tsx server/index.ts
`;

fs.writeFileSync('start-replit.sh', startupScript);
fs.chmodSync('start-replit.sh', '755');
console.log('✅ Created Replit startup script');

// Workaround 3: Create Dockerfile specifically for Replit
const replitDockerfile = `# Replit-optimized Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy only essential files first
COPY package*.json ./
COPY server/ ./server/
COPY client/public/ ./client/public/
COPY shared/ ./shared/

# Install minimal dependencies
RUN npm install tsx express cors dotenv firebase firebase-admin drizzle-orm @neondatabase/serverless

# Expose port
EXPOSE 5000

# Use simple start command
CMD ["npx", "tsx", "server/index.ts"]
`;

fs.writeFileSync('Dockerfile.replit', replitDockerfile);
console.log('✅ Created Replit-optimized Dockerfile');

console.log('\n🎯 Replit Deployment Workarounds Created:');
console.log('1. package-minimal.json - Simplified dependencies');
console.log('2. start-replit.sh - Bash startup script');
console.log('3. Dockerfile.replit - Container optimization');
console.log('\n📋 Next Steps:');
console.log('• Try deploying with package-minimal.json');
console.log('• Or use start-replit.sh as the run command');
console.log('• Or deploy using Dockerfile.replit');
console.log('• All keep your app hosted on Replit infrastructure');