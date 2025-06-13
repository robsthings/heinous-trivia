import fs from 'fs';
import https from 'https';

async function getAccessToken() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  
  // Create JWT for Google OAuth
  const jwt = require('jsonwebtoken');
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });
  
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }).toString();
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function deployStorageRules() {
  try {
    console.log('Reading storage rules...');
    const rulesContent = fs.readFileSync('storage.rules', 'utf8');
    
    console.log('Getting access token...');
    const accessToken = await getAccessToken();
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const projectId = serviceAccount.project_id;
    
    console.log(`Deploying storage rules to project: ${projectId}`);
    
    const payload = JSON.stringify({
      source: {
        files: [{
          name: 'storage.rules',
          content: rulesContent
        }]
      }
    });
    
    const options = {
      hostname: 'firebaserules.googleapis.com',
      path: `/v1/projects/${projectId}/rulesets`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Response status:', res.statusCode);
          console.log('Response:', data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
    
  } catch (error) {
    console.error('Error deploying storage rules:', error.message);
    
    console.log('\nManual deployment required:');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Select your project');
    console.log('3. Navigate to Storage > Rules');
    console.log('4. Replace the rules with:');
    console.log('\nrules_version = \'2\';');
    console.log('service firebase.storage {');
    console.log('  match /b/{bucket}/o {');
    console.log('    match /branding/{allPaths=**} {');
    console.log('      allow read: if true;');
    console.log('      allow write: if request.auth != null;');
    console.log('    }');
    console.log('    match /ads/{allPaths=**} {');
    console.log('      allow read: if true;');
    console.log('    }');
    console.log('  }');
    console.log('}');
    console.log('\n5. Click "Publish"');
  }
}

deployStorageRules();