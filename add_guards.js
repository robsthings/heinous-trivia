const fs = require('fs');

// Read the routes file
let content = fs.readFileSync('server/routes.ts', 'utf8');

// Guard clause to inject
const guardClause = `      // GUARD: Group mode disabled - prevent activeRound operations
      console.log(\`[GROUP MODE DISABLED] Blocked activeRound operation for haunt: \${req.params.hauntId}\`);
      res.status(403).json({ 
        error: "Group mode functionality is disabled", 
        message: "Individual play mode is now enforced across all haunts" 
      });
      return;
      
`;

// Replace all activeRound operations with guard clauses
// Pattern 1: Start round (POST)
content = content.replace(
  /(\s+)const roundRef = firestore\.collection\('activeRound'\)\.doc\(hauntId\);\s+await roundRef\.set\(roundData\);/g,
  `$1${guardClause}$1const roundRef = firestore.collection('activeRound').doc(hauntId);\n$1await roundRef.set(roundData);`
);

// Pattern 2: Update round (PUT)
content = content.replace(
  /(\s+)const roundRef = firestore\.collection\('activeRound'\)\.doc\(hauntId\);\s+await roundRef\.update\(updates\);/g,
  `$1${guardClause}$1const roundRef = firestore.collection('activeRound').doc(hauntId);\n$1await roundRef.update(updates);`
);

// Pattern 3: Get round (GET) - read operations should also be blocked
content = content.replace(
  /(\s+)const roundRef = firestore\.collection\('activeRound'\)\.doc\(hauntId\);\s+const roundDoc = await roundRef\.get\(\);/g,
  `$1${guardClause}$1const roundRef = firestore.collection('activeRound').doc(hauntId);\n$1const roundDoc = await roundRef.get();`
);

// Pattern 4: Delete round operations
content = content.replace(
  /(\s+)const roundRef = firestore\.collection\('activeRound'\)\.doc\(hauntId\);\s+await roundRef\.delete\(\);/g,
  `$1${guardClause}$1const roundRef = firestore.collection('activeRound').doc(hauntId);\n$1await roundRef.delete();`
);

// Write the updated content back
fs.writeFileSync('server/routes.ts', content);

console.log('Added guard clauses to all activeRound operations');