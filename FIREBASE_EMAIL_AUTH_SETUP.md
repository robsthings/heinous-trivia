# Firebase Email Authentication Setup

## Issue with Domain Configuration

The Firebase Email Link authentication is currently configured to redirect to `heinous-trivia.firebaseapp.com` instead of the Replit development domain. This causes the authentication flow to fail.

## Required Firebase Console Configuration

To fix this issue, you need to add the Replit domain to Firebase's authorized domains list:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your "heinous-trivia" project
3. Navigate to **Authentication** > **Settings** > **Authorized domains**
4. Add the following domains:
   - `e7e1ab62-01cc-4aba-97d3-1a8f1e8fdf98-00-27ck2q6bfkqpp.worf.replit.dev` (current Replit domain)
   - `localhost` (for local development)
   - Any custom domains you plan to use

## Troubleshooting Email Delivery Issues

If emails are not being received, check these Firebase settings:

### 1. Email/Password Authentication Enabled
- Go to Firebase Console > Authentication > Sign-in method
- Ensure "Email/Password" is enabled
- Check that "Email link (passwordless sign-in)" is enabled

### 2. Email Templates
- Go to Firebase Console > Authentication > Templates
- Verify the "Email address sign-in" template is configured
- Check that the sender email is properly set

### 3. Domain Configuration  
- Ensure all domains are added to authorized domains list
- Current domains should include: localhost, your-replit-domain.dev

### 4. SMTP Configuration
- Firebase uses its own SMTP for email delivery
- No additional SMTP configuration should be needed
- If emails still don't arrive, check spam/junk folders

## Current Email Link Flow

The email link contains these parameters:
- `continueUrl`: Points back to your Replit domain `/haunt-auth/headquarters`
- `mode=signIn`: Indicates this is a sign-in operation
- `oobCode`: The one-time authentication code

## Testing After Configuration

Once you've added the Replit domain to Firebase authorized domains:

1. Try sending a new authentication email
2. The email link should properly redirect to your Replit environment
3. The authentication flow should complete successfully and redirect to the admin dashboard

## Authorized Email for Testing

The system is currently configured with:
- **Authorized Email**: admin@heinoustrivia.com
- **Haunt ID**: headquarters

Use this email address when testing the authentication flow.