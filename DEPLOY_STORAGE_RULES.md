# Firebase Storage Rules Deployment Required

The background images aren't loading because Firebase Storage rules require authentication for branding files. I've updated the storage rules to allow public read access, but they need to be deployed.

## Manual Deployment Steps:

1. Open Firebase Console: https://console.firebase.google.com/
2. Navigate to your "heinous-trivia" project
3. Go to Storage > Rules
4. Replace the current rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /branding/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /ads/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

5. Click "Publish"

## What This Fixes:
- Allows public read access to branding/background images
- Keeps write access restricted to authenticated users
- Enables custom backgrounds to display in the trivia game

After deploying these rules, the uploaded background images will be publicly accessible and should display properly in the game.