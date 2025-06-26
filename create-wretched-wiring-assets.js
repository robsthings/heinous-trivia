/**
 * Create Wretched Wiring Assets for Firebase Storage
 * 
 * This script creates the missing SVG assets needed for the Wretched Wiring sidequest
 */

import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const bucket = getStorage().bucket();
const firestore = getFirestore();

// SVG asset templates
const createWireSVG = (color, type) => `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${color}Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color === 'red' ? '#dc2626' : '#2563eb'};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color === 'red' ? '#7f1d1d' : '#1e3a8a'};stop-opacity:1" />
    </linearGradient>
  </defs>
  ${type === 'straight' 
    ? `<rect x="10" y="45" width="80" height="10" fill="url(#${color}Gradient)" rx="5"/>`
    : `<path d="M 10 50 Q 50 10 90 50" stroke="url(#${color}Gradient)" stroke-width="10" fill="none" stroke-linecap="round"/>`
  }
</svg>`;

const createTerminalSVG = (color, side) => `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${color}Terminal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="48" height="48" fill="url(#${color}Terminal)" rx="4" stroke="#6b7280" stroke-width="2"/>
  <circle cx="32" cy="32" r="8" fill="${color === 'red' ? '#dc2626' : '#2563eb'}" opacity="0.8"/>
  <circle cx="32" cy="32" r="4" fill="${color === 'red' ? '#fca5a5' : '#93c5fd'}"/>
</svg>`;

const createPullChainSVG = () => `
<svg width="32" height="80" viewBox="0 0 32 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="14" y="0" width="4" height="60" fill="url(#chainGradient)"/>
  <circle cx="16" cy="70" r="8" fill="url(#chainGradient)" stroke="#92400e" stroke-width="2"/>
  <text x="16" y="75" text-anchor="middle" fill="#1f2937" font-size="8" font-weight="bold">PULL</text>
</svg>`;

const createCertificateSVG = () => `
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="certGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="380" height="280" fill="url(#certGradient)" rx="10" stroke="#92400e" stroke-width="3"/>
  <text x="200" y="50" text-anchor="middle" fill="#92400e" font-size="24" font-weight="bold">CERTIFICATE OF FAILURE</text>
  <text x="200" y="100" text-anchor="middle" fill="#1f2937" font-size="16">Awarded to:</text>
  <text x="200" y="130" text-anchor="middle" fill="#1f2937" font-size="20" font-weight="bold">WRETCHED WIRE WARRIOR</text>
  <text x="200" y="170" text-anchor="middle" fill="#1f2937" font-size="14">For outstanding achievement in</text>
  <text x="200" y="190" text-anchor="middle" fill="#1f2937" font-size="14">Making Everything Worse</text>
  <text x="200" y="240" text-anchor="middle" fill="#92400e" font-size="12">Dr. Heinous, Chief of Chaos</text>
</svg>`;

async function uploadAsset(svgContent, filename) {
  try {
    const file = bucket.file(`sidequests/wretched-wiring/${filename}`);
    await file.save(svgContent, {
      metadata: {
        contentType: 'image/svg+xml',
      },
    });
    
    // Make file publicly readable
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/sidequests/wretched-wiring/${filename}`;
    console.log(`✓ Uploaded: ${filename} -> ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`✗ Failed to upload ${filename}:`, error.message);
    return null;
  }
}

async function createWretchedWiringAssets() {
  console.log('Creating Wretched Wiring assets...');
  
  const assets = {};
  
  // Create wire assets
  const wireTypes = ['straight', 'curved'];
  const wireColors = ['red', 'blue'];
  
  for (const color of wireColors) {
    for (const type of wireTypes) {
      const filename = `wire-${color}-${type}.svg`;
      const svgContent = createWireSVG(color, type);
      const url = await uploadAsset(svgContent, filename);
      if (url) {
        assets[`wire-${color}-${type}`] = url;
      }
    }
  }
  
  // Create terminal node assets
  const terminalColors = ['red', 'blue'];
  const terminalSides = ['left', 'right'];
  
  for (const color of terminalColors) {
    for (const side of terminalSides) {
      const filename = `node-${color}-${side}.svg`;
      const svgContent = createTerminalSVG(color, side);
      const url = await uploadAsset(svgContent, filename);
      if (url) {
        assets[`node-${color}-${side}`] = url;
      }
    }
  }
  
  // Create pull chain
  const pullChainUrl = await uploadAsset(createPullChainSVG(), 'Pull-Chain.svg');
  if (pullChainUrl) {
    assets['Pull-Chain'] = pullChainUrl;
  }
  
  // Create certificate
  const certificateUrl = await uploadAsset(createCertificateSVG(), 'Certificate-of-Failure.svg');
  if (certificateUrl) {
    assets['Certificate-of-Failure'] = certificateUrl;
  }
  
  // Save asset mappings to Firestore
  try {
    await firestore.collection('sidequest-assets').doc('wretched-wiring').set({
      assets: assets,
      createdAt: new Date(),
      description: 'SVG assets for Wretched Wiring chaos simulator'
    });
    console.log('✓ Asset mappings saved to Firestore');
  } catch (error) {
    console.error('✗ Failed to save asset mappings:', error.message);
  }
  
  console.log('\nWretched Wiring assets created successfully!');
  console.log('Assets created:', Object.keys(assets));
  
  return assets;
}

// Run the asset creation
createWretchedWiringAssets()
  .then(() => {
    console.log('Asset creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Asset creation failed:', error);
    process.exit(1);
  });