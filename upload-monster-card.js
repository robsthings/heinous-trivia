/**
 * Upload Monster Card to Firebase Storage
 * 
 * Simple script to upload the monster card asset to Firebase Storage
 * for the Monster Name Generator sidequest
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
}

const bucket = admin.storage().bucket();

async function uploadMonsterCard() {
  try {
    console.log('Starting monster card upload...');
    
    // Read the monster card file
    const filePath = join(__dirname, 'attached_assets', 'monster-card_1750900915378.png');
    const fileBuffer = readFileSync(filePath);
    
    // Upload to Firebase Storage
    const fileName = 'monster-card_1750900915378.png';
    const storagePath = `sidequests/monster-name-generator/${fileName}`;
    
    const file = bucket.file(storagePath);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
      }
    });
    
    // Make the file publicly readable
    await file.makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    
    console.log('Monster card uploaded successfully!');
    console.log('Public URL:', publicUrl);
    
    // Now save the asset mapping to Firestore
    const firestore = admin.firestore();
    const assetDoc = firestore.collection('sidequest-assets').doc('monster-name-generator');
    
    await assetDoc.set({
      sidequestId: 'monster-name-generator',
      assets: {
        'monster-card_1750900915378': publicUrl
      }
    }, { merge: true });
    
    console.log('Asset mapping saved to Firestore');
    
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

uploadMonsterCard().then(() => {
  console.log('Upload complete!');
  process.exit(0);
});