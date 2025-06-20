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
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * Upload a file via server API
 */
async function uploadFileViaServer(filePath) {
  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const relativePath = path.relative(path.join(__dirname, 'client/public'), filePath);
    const filename = path.basename(filePath);
    
    form.append('file', fileStream);
    form.append('path', path.dirname(relativePath));
    
    console.log(`Uploading ${relativePath}...`);
    
    const response = await fetch(`${SERVER_URL}/api/upload-asset`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✓ Uploaded: ${result.url}`);
    
    return {
      path: relativePath,
      url: result.url,
      filename: filename,
      assetName: filename.replace(/\.[^/.]+$/, '') // Remove extension
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function uploadSidequests() {
  try {
    console.log('🚀 Starting sidequest asset upload via server API...');
    
    const sidequestsDir = path.join(__dirname, 'client/public/sidequests');
    
    if (!fs.existsSync(sidequestsDir)) {
      console.error('❌ Sidequests directory not found:', sidequestsDir);
      return;
    }
    
    const allFiles = getAllFiles(sidequestsDir);
    const imageFiles = allFiles.filter(file => 
      /\.(png|jpg|jpeg|gif|svg)$/i.test(file)
    );
    
    console.log(`📁 Found ${imageFiles.length} image files to upload`);
    
    const assetMapping = {};
    let uploadedCount = 0;
    
    for (const filePath of imageFiles) {
      try {
        const result = await uploadFileViaServer(filePath);
        
        // Organize by sidequest name
        const pathParts = result.path.split('/');
        if (pathParts.length >= 2 && pathParts[0] === 'sidequests') {
          const sidequestName = pathParts[1];
          
          if (!assetMapping[sidequestName]) {
            assetMapping[sidequestName] = {};
          }
          
          assetMapping[sidequestName][result.assetName] = result.url;
        }
        
        uploadedCount++;
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
      }
    }
    
    // Save the asset mapping via API
    if (Object.keys(assetMapping).length > 0) {
      console.log('💾 Saving asset mapping via server API...');
      
      const response = await fetch(`${SERVER_URL}/api/branding-assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assetId: 'sidequest-assets',
          assetData: {
            mapping: assetMapping,
            uploadedAt: new Date().toISOString(),
            totalAssets: uploadedCount
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save asset mapping: ${response.status}`);
      }
      
      console.log('✓ Asset mapping saved successfully');
    }
    
    console.log(`🎉 Upload complete! Uploaded ${uploadedCount} assets across ${Object.keys(assetMapping).length} sidequests`);
    console.log('📊 Asset breakdown:');
    
    Object.entries(assetMapping).forEach(([sidequestName, assets]) => {
      console.log(`  ${sidequestName}: ${Object.keys(assets).length} assets`);
    });
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

// Run upload if called directly
uploadSidequests();