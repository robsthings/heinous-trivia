/**
 * Migrate Sidequest Assets to Firebase Storage
 * 
 * This script uploads all sidequest assets from client/public/sidequests/ 
 * to Firebase Storage under the /sidequests/ path structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Upload a file to Firebase Storage
 */
async function uploadFile(filePath) {
  try {
    const { FirebaseService } = await import('./server/firebase.ts');
    
    const fileBuffer = fs.readFileSync(filePath);
    const relativePath = path.relative(path.join(__dirname, 'client/public'), filePath);
    const filename = path.basename(filePath);
    const storagePath = path.dirname(relativePath);
    
    console.log(`Uploading ${relativePath}...`);
    
    const url = await FirebaseService.uploadFile(fileBuffer, filename, storagePath);
    console.log(`✓ Uploaded: ${url}`);
    
    return {
      path: relativePath,
      url: url,
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
async function migrateSidequests() {
  try {
    console.log('🚀 Starting sidequest asset migration...');
    
    const sidequestsDir = path.join(__dirname, 'client/public/sidequests');
    
    if (!fs.existsSync(sidequestsDir)) {
      console.error('❌ Sidequests directory not found:', sidequestsDir);
      return;
    }
    
    const allFiles = getAllFiles(sidequestsDir);
    const imageFiles = allFiles.filter(file => 
      /\.(png|jpg|jpeg|gif|svg)$/i.test(file)
    );
    
    console.log(`📁 Found ${imageFiles.length} image files to migrate`);
    
    const assetMapping = {};
    let uploadedCount = 0;
    
    for (const filePath of imageFiles) {
      try {
        const result = await uploadFile(filePath);
        
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
      } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
      }
    }
    
    // Save the asset mapping to Firebase for API access
    if (Object.keys(assetMapping).length > 0) {
      console.log('💾 Saving asset mapping to Firebase...');
      const { FirebaseService } = await import('./server/firebase.ts');
      
      await FirebaseService.saveBrandingAsset('sidequest-assets', {
        mapping: assetMapping,
        uploadedAt: new Date().toISOString(),
        totalAssets: uploadedCount
      });
      
      console.log('✓ Asset mapping saved successfully');
    }
    
    console.log(`🎉 Migration complete! Uploaded ${uploadedCount} assets across ${Object.keys(assetMapping).length} sidequests`);
    console.log('📊 Asset breakdown:');
    
    Object.entries(assetMapping).forEach(([sidequestName, assets]) => {
      console.log(`  ${sidequestName}: ${Object.keys(assets).length} assets`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSidequests();
}

export { migrateSidequests };