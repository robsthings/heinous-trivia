/**
 * Sidequest Asset Management System
 * 
 * Handles uploading and organizing sidequest assets in Firebase Storage
 * using the existing server authentication infrastructure.
 */

import { FirebaseService } from './firebase.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SidequestAssetManager {
  
  /**
   * Upload all sidequest assets to Firebase Storage
   */
  static async uploadAllSidequestAssets() {
    const sidequestsDir = path.join(__dirname, '../client/public/sidequests');
    const results = [];
    
    console.log('Starting sidequest asset upload...');
    
    try {
      const sidequestFolders = fs.readdirSync(sidequestsDir)
        .filter(item => fs.statSync(path.join(sidequestsDir, item)).isDirectory());
      
      for (const folder of sidequestFolders) {
        console.log(`Processing ${folder}...`);
        const folderPath = path.join(sidequestsDir, folder);
        const assets = await this.uploadSidequestFolder(folder, folderPath);
        results.push({ sidequest: folder, assets });
      }
      
      // Save the asset mapping for reference
      await this.saveSidequestAssetMapping(results);
      
      console.log(`Successfully uploaded assets for ${results.length} sidequests`);
      return results;
      
    } catch (error) {
      console.error('Failed to upload sidequest assets:', error);
      throw error;
    }
  }
  
  /**
   * Upload assets for a specific sidequest folder
   */
  static async uploadSidequestFolder(sidequestName, folderPath) {
    const assets = [];
    
    try {
      const files = fs.readdirSync(folderPath)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
        });
      
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const buffer = fs.readFileSync(filePath);
        const fileName = path.parse(file).name;
        
        // Upload to Firebase Storage with organized path structure
        const storagePath = `sidequests/${sidequestName}/${file}`;
        const downloadURL = await FirebaseService.uploadFile(buffer, file, `sidequests/${sidequestName}`);
        
        assets.push({
          fileName,
          originalFile: file,
          storagePath,
          downloadURL
        });
        
        console.log(`  ✓ Uploaded ${file}`);
      }
      
      return assets;
      
    } catch (error) {
      console.error(`Failed to upload assets for ${sidequestName}:`, error);
      return [];
    }
  }
  
  /**
   * Save asset mapping to Firebase for easy retrieval
   */
  static async saveSidequestAssetMapping(assetData) {
    try {
      const mapping = {};
      
      assetData.forEach(({ sidequest, assets }) => {
        mapping[sidequest] = {};
        assets.forEach(asset => {
          mapping[sidequest][asset.fileName] = asset.downloadURL;
        });
      });
      
      // Save to Firebase as a special branding asset
      await FirebaseService.saveBrandingAsset('sidequest-assets', {
        type: 'sidequest-mapping',
        mapping,
        uploadedAt: new Date().toISOString(),
        totalSidequests: Object.keys(mapping).length,
        totalAssets: Object.values(mapping).reduce((sum, assets) => sum + Object.keys(assets).length, 0)
      });
      
      console.log('Asset mapping saved to Firebase');
      
    } catch (error) {
      console.error('Failed to save asset mapping:', error);
    }
  }
  
  /**
   * Get asset URLs for a specific sidequest
   */
  static async getSidequestAssets(sidequestName) {
    try {
      const assets = await FirebaseService.getBrandingAssets();
      const sidequestMapping = assets.find(asset => asset.id === 'sidequest-assets');
      
      if (sidequestMapping && sidequestMapping.mapping && sidequestMapping.mapping[sidequestName]) {
        return sidequestMapping.mapping[sidequestName];
      }
      
      return {};
      
    } catch (error) {
      console.error(`Failed to get assets for ${sidequestName}:`, error);
      return {};
    }
  }
  
  /**
   * Get all sidequest assets organized by game
   */
  static async getAllSidequestAssets() {
    try {
      const assets = await FirebaseService.getBrandingAssets();
      const sidequestMapping = assets.find(asset => asset.id === 'sidequest-assets');
      
      if (sidequestMapping && sidequestMapping.mapping) {
        return sidequestMapping.mapping;
      }
      
      return {};
      
    } catch (error) {
      console.error('Failed to get all sidequest assets:', error);
      return {};
    }
  }
}

/**
 * CLI runner for uploading assets
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  SidequestAssetManager.uploadAllSidequestAssets()
    .then(() => {
      console.log('Migration complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}