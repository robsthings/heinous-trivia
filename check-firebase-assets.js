/**
 * Check Firebase Assets via Server API
 * This checks what assets are actually returned by our API endpoints
 */

import fetch from 'node-fetch';

async function checkSidequestAssets() {
  const sidequests = [
    'wretched-wiring',
    'curse-crafting', 
    'wack-a-chupacabra',
    'monster-name-generator',
    'chupacabra-challenge',
    'cryptic-compliments',
    'glory-grab',
    'lab-escape'
  ];

  console.log('Checking sidequest assets via API...\n');

  for (const sidequest of sidequests) {
    try {
      const response = await fetch(`http://localhost:5000/api/sidequests/${sidequest}/assets`);
      const data = await response.json();
      
      console.log(`=== ${sidequest} ===`);
      if (data.assets && Object.keys(data.assets).length > 0) {
        console.log('Assets found:');
        Object.entries(data.assets).forEach(([name, url]) => {
          const isFirebase = url.includes('googleapis.com') || url.includes('firebasestorage');
          const isLocal = url.startsWith('/sidequests/');
          console.log(`  ${name}: ${isFirebase ? '🔥 Firebase' : isLocal ? '📁 Local fallback' : '❓ Unknown'} - ${url}`);
        });
      } else {
        console.log('No assets found');
      }
      console.log('');
      
      // Test if first asset actually loads
      if (data.assets && Object.values(data.assets).length > 0) {
        const firstAsset = Object.values(data.assets)[0];
        try {
          const assetResponse = await fetch(`http://localhost:5000${firstAsset}`);
          console.log(`  Asset test: ${assetResponse.status === 200 ? '✅ Accessible' : '❌ Not found'} (${assetResponse.status})`);
        } catch (e) {
          console.log(`  Asset test: ❌ Failed to load`);
        }
        console.log('');
      }
    } catch (error) {
      console.log(`=== ${sidequest} ===`);
      console.log(`Error: ${error.message}\n`);
    }
  }
}

checkSidequestAssets();