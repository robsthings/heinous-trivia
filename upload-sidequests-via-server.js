/**
 * Upload Sidequest Assets via Server API
 * 
 * This script uses the existing server API endpoints to upload sidequest assets
 * to Firebase Storage through the authenticated admin routes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = 'http://localhost:5000';
const sidequestsDir = path.join(__dirname, 'client/public/sidequests');

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Skip README.md and placeholder files
      if (!file.endsWith('.md') && !file.includes('placeholder') && !file.includes('README')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Upload a file via server API
 */
async function uploadFileViaServer(filePath) {
  try {
    // Get relative path from sidequests directory
    const relativePath = path.relative(sidequestsDir, filePath);
    const pathParts = relativePath.split(path.sep);
    const sidequestName = pathParts[0];
    const fileName = pathParts[pathParts.length - 1];
    
    console.log(`Uploading: ${relativePath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('asset', fs.createReadStream(filePath));
    
    // Upload to branding assets endpoint (which handles Firebase Storage)
    const response = await fetch(`${SERVER_URL}/api/branding/assets`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✓ Uploaded: ${relativePath} -> ${result.id}`);
    
    return {
      path: relativePath,
      assetId: result.id,
      downloadURL: result.downloadURL,
      sidequestName,
      fileName
    };
    
  } catch (error) {
    console.error(`✗ Failed to upload ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main migration function
 */
async function uploadSidequests() {
  console.log('🎮 Starting sidequest asset upload via server API...\n');
  
  // Get all asset files
  const assetFiles = getAllFiles(sidequestsDir);
  console.log(`Found ${assetFiles.length} asset files to upload\n`);
  
  const results = [];
  const sidequestAssets = {};
  let successCount = 0;
  let failCount = 0;
  
  // Upload files one by one to avoid overwhelming the server
  for (const filePath of assetFiles) {
    const result = await uploadFileViaServer(filePath);
    if (result) {
      results.push(result);
      
      // Group by sidequest
      if (!sidequestAssets[result.sidequestName]) {
        sidequestAssets[result.sidequestName] = [];
      }
      sidequestAssets[result.sidequestName].push(result);
      
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n📊 Upload Summary:');
  console.log(`✓ Successfully uploaded: ${successCount} files`);
  console.log(`✗ Failed uploads: ${failCount} files`);
  
  // Save detailed mapping
  const mappingFile = path.join(__dirname, 'sidequest-asset-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(results, null, 2));
  
  // Save organized by sidequest
  const organizedFile = path.join(__dirname, 'sidequest-assets-by-game.json');
  fs.writeFileSync(organizedFile, JSON.stringify(sidequestAssets, null, 2));
  
  console.log(`\n📝 Asset mapping saved to: ${mappingFile}`);
  console.log(`📝 Organized assets saved to: ${organizedFile}`);
  
  console.log('\n🎉 Sidequest upload complete!');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Upload failed:', error);
  process.exit(1);
});

// Run upload
uploadSidequests();