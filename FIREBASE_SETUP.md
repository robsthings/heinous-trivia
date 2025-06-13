# Firebase Storage Setup Instructions

## Required: Create Firebase Storage Bucket

The branding upload system requires a Firebase Storage bucket to be created manually in the Firebase Console.

### Steps to Create the Storage Bucket:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `heinous-trivia`
3. Navigate to **Storage** in the left sidebar
4. Click **Get Started**
5. Choose **Start in production mode**
6. Select location: **us-central1 (Iowa)**
7. Click **Done**

### Configure Storage Security Rules:

Replace the default rules with these rules in the Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /branding/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /ads/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

### Apply CORS Configuration:

The bucket needs CORS configuration for Replit domains. This is automatically handled by the application.

### Verify Setup:

After creating the bucket, test the branding upload functionality in the Uber Admin dashboard. You should be able to upload background skins and progress bar animations successfully.

## Troubleshooting:

- **403 Errors**: Check Firebase credentials and permissions
- **CORS Errors**: Ensure the bucket allows requests from *.replit.dev domains
- **Upload Failures**: Verify the bucket name matches: `heinous-trivia.appspot.com`