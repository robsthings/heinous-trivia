/**
 * Upload Monster Name Generator Assets to Firebase Storage
 * 
 * Creates and uploads monster card assets for the Monster Name Generator sidequest
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
}

const storage = admin.storage();
const bucket = storage.bucket();

/**
 * Create SVG monster card template
 */
function createMonsterCardSVG() {
  return `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Card Background -->
  <rect width="300" height="400" rx="15" fill="url(#cardGrad)" stroke="url(#borderGrad)" stroke-width="3"/>
  
  <!-- Monster Silhouette -->
  <circle cx="150" cy="120" r="40" fill="#374151" opacity="0.6"/>
  <rect x="120" y="160" width="60" height="80" rx="10" fill="#374151" opacity="0.6"/>
  <rect x="110" y="170" width="20" height="60" rx="8" fill="#374151" opacity="0.4"/>
  <rect x="170" y="170" width="20" height="60" rx="8" fill="#374151" opacity="0.4"/>
  
  <!-- Glowing Eyes -->
  <circle cx="135" cy="115" r="4" fill="#10b981" opacity="0.8">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="165" cy="115" r="4" fill="#10b981" opacity="0.8">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
  </circle>
  
  <!-- Card Border Glow -->
  <rect width="296" height="396" x="2" y="2" rx="13" fill="none" stroke="#10b981" stroke-width="1" opacity="0.5">
    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Bottom Text Area -->
  <rect x="20" y="280" width="260" height="100" rx="8" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1"/>
  
  <!-- Placeholder Text -->
  <text x="150" y="305" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="14" font-weight="bold">CLASSIFIED</text>
  <text x="150" y="325" text-anchor="middle" fill="#d1d5db" font-family="Arial, sans-serif" font-size="12">SPECIMEN DATA</text>
  <text x="150" y="345" text-anchor="middle" fill="#d1d5db" font-family="Arial, sans-serif" font-size="10">SCAN REQUIRED FOR</text>
  <text x="150" y="360" text-anchor="middle" fill="#d1d5db" font-family="Arial, sans-serif" font-size="10">IDENTIFICATION</text>
</svg>`;
}

/**
 * Upload monster card asset to Firebase Storage
 */
async function uploadMonsterCard() {
  try {
    const svgContent = createMonsterCardSVG();
    const fileName = 'monster-card.svg';
    const filePath = `sidequests/monster-name-generator/${fileName}`;
    
    const file = bucket.file(filePath);
    
    await file.save(svgContent, {
      metadata: {
        contentType: 'image/svg+xml',
        cacheControl: 'public, max-age=31536000'
      }
    });
    
    // Make file publicly readable
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log(`Uploaded monster card: ${publicUrl}`);
    
    return { [fileName.replace('.svg', '')]: publicUrl };
  } catch (error) {
    console.error('Error uploading monster card:', error);
    throw error;
  }
}

/**
 * Main upload function
 */
async function uploadMonsterAssets() {
  try {
    console.log('Uploading Monster Name Generator assets to Firebase Storage...');
    
    const assets = await uploadMonsterCard();
    
    // Save asset mapping to server API for easy retrieval
    const response = await fetch('http://localhost:5000/api/sidequests/monster-name-generator/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assets })
    });
    
    if (response.ok) {
      console.log('Asset mapping saved successfully');
    } else {
      console.warn('Failed to save asset mapping, but assets uploaded');
    }
    
    console.log('Monster Name Generator assets uploaded successfully!');
    console.log('Assets:', assets);
    
  } catch (error) {
    console.error('Failed to upload monster assets:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  uploadMonsterAssets();
}

module.exports = { uploadMonsterAssets };