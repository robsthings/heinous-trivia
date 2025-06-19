# Heinous Trivia - Deployment Guide

## Project Overview
Heinous Trivia is a horror-themed trivia platform with individual gameplay, custom branding, analytics tracking, and side quests mini-games.

## Quick Start (Replit)
1. **Install Dependencies**: `npm install`
2. **Start Development**: `npm run dev`
3. **Deploy**: Click "Deploy" button in Replit

## Essential Files Structure
```
heinous-trivia/
├── client/                 # React frontend
├── server/                 # Express.js backend
├── shared/                 # Type definitions and schemas
├── public/                 # Static assets (images, icons)
├── fieldGlossary.json     # Firebase field naming reference
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project settings
├── storage.rules         # Firebase storage security rules
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── replit.md            # Project documentation
```

## Environment Variables Required
Set these in Replit Secrets:
- `DATABASE_URL` - PostgreSQL connection string
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase admin credentials

## Firebase Setup
1. Create Firebase project at console.firebase.google.com
2. Enable Firestore and Storage
3. Configure authentication (anonymous auth)
4. Upload storage.rules for security
5. Add Replit domain to authorized domains

## Database Setup
- PostgreSQL database automatically configured
- Schema defined in `shared/schema.ts`
- Migrations handled by Drizzle ORM
- Run `npm run db:push` to sync schema

## Key Features
- **Individual Trivia Mode**: 20-question sessions with haunt-specific content
- **Side Quests**: 10 mini-games for enhanced engagement
- **Analytics Dashboard**: Pro/Premium tier analytics tracking
- **Custom Branding**: Haunt-specific themes and logos
- **Leaderboards**: Top 10 scoring system per haunt

## Production Deployment
1. Build process: `npm run build`
2. Start command: `npm run start`
3. Static assets served from `dist/public`
4. Autoscale deployment for traffic handling

## File Structure Notes
- `client/` contains React frontend with Vite
- `server/` contains Express.js backend with Firebase integration
- `fieldGlossary.json` is critical for Firebase field consistency
- All haunts use individual-only mode (group mode removed)

## Support
- Technical documentation in `replit.md`
- Firebase field naming reference in `fieldGlossary.json`
- Error handling built into all critical paths