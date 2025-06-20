/**
 * Migrate Sidequest Assets to Firebase Storage
 * 
 * This script uploads all sidequest assets from client/public/sidequests/ 
 * to Firebase Storage under the /sidequests/ path structure.
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZpb5TwM4ZGwbzRYy5O0-oXTmJt3iOG8I",
  authDomain: "heinous-trivia.firebaseapp.com",
  projectId: "heinous-trivia",
  storageBucket: "heinous-trivia.appspot.com",
  messagingSenderId: "331549664886",
  appId: "1:331549664886:web:8b85b1c49ec7e5b36b5f62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
 * Upload a file to Firebase Storage
 */
async function uploadFile(filePath) {
  try {
    // Get relative path from sidequests directory
    const relativePath = path.relative(sidequestsDir, filePath);
    const storagePath = `sidequests/${relativePath.replace(/\\/g, '/')}`;
    
    console.log(`Uploading: ${relativePath} -> ${storagePath}`);
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✓ Uploaded: ${relativePath}`);
    return {
      path: relativePath,
      storagePath,
      downloadURL
    };
    
  } catch (error) {
    console.error(`✗ Failed to upload ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main migration function
 */
async function migrateSidequests() {
  console.log('🎮 Starting sidequest asset migration to Firebase Storage...\n');
  
  // Get all asset files
  const assetFiles = getAllFiles(sidequestsDir);
  console.log(`Found ${assetFiles.length} asset files to migrate\n`);
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  // Upload files one by one to avoid overwhelming Firebase
  for (const filePath of assetFiles) {
    const result = await uploadFile(filePath);
    if (result) {
      results.push(result);
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✓ Successfully uploaded: ${successCount} files`);
  console.log(`✗ Failed uploads: ${failCount} files`);
  
  // Save mapping file for reference
  const mappingFile = path.join(__dirname, 'sidequest-asset-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Asset mapping saved to: ${mappingFile}`);
  
  console.log('\n🎉 Sidequest migration complete!');
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});

// Run migration
migrateSidequests();