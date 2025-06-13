const { execSync } = require('child_process');
const fs = require('fs');

// Deploy Firebase Storage rules
try {
  console.log('Deploying Firebase Storage rules...');
  
  // Read the storage rules
  const rulesContent = fs.readFileSync('storage.rules', 'utf8');
  console.log('Storage rules content:');
  console.log(rulesContent);
  
  // Use Firebase REST API to deploy rules
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const projectId = serviceAccount.project_id;
  
  console.log(`Deploying to project: ${projectId}`);
  
  // For now, we'll output instructions since we need proper auth
  console.log('\nTo deploy these rules manually:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log(`2. Select project: ${projectId}`);
  console.log('3. Go to Storage > Rules');
  console.log('4. Replace rules with the content above');
  console.log('5. Click "Publish"');
  
} catch (error) {
  console.error('Error:', error.message);
}