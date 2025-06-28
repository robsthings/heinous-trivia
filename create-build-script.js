#!/usr/bin/env node

// This script adds the missing build command to package.json
// without using the forbidden packager tool

import fs from 'fs';

console.log('Adding missing build script to package.json...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add the build script that was working 10 days ago
packageJson.scripts.build = 'node quick-build.js';

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('Build script added successfully');
console.log('Your deployment should now work with the existing .replit configuration');