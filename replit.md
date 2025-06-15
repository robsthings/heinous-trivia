# Heinous Trivia - Horror Trivia Platform

## Overview

Heinous Trivia is a horror-themed trivia platform that allows haunts and entertainment venues to create customized trivia experiences for their visitors. The platform features individual and group gameplay modes, custom branding, analytics tracking, and tiered subscription features for different user levels.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom horror-themed design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React hooks and context for local state
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Development**: Vite for development server and hot module replacement
- **Build Tool**: esbuild for production builds
- **Static Assets**: Express static file serving

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Centralized schema definitions in `shared/schema.ts`

## Key Components

### Core Tables
- **users**: Basic authentication for admin users
- **leaderboardEntries**: Player scores and game results
- **hauntConfigs**: Haunt-specific configuration and branding
- **gameSessions**: Analytics tracking for individual game sessions

### Firebase Integration
- **Storage**: Custom background images and advertising assets
- **Firestore**: Real-time data for group gameplay and live sessions
- **Authentication**: Anonymous authentication for basic operations

### Tiered Subscription System
- **Basic Tier**: Standard trivia functionality
- **Pro Tier**: Custom background skins and advanced analytics
- **Premium Tier**: All Pro features plus custom progress bar themes and priority support

### Game Modes
- **Individual Mode**: Traditional single-player trivia experience
- **Group Mode**: Real-time multiplayer sessions with host controls

## Data Flow

1. **Haunt Configuration**: Admins configure their haunt through the admin panel, setting themes, uploading assets, and customizing questions
2. **Player Access**: Players access games through haunt-specific URLs with authentication codes
3. **Game Session**: Questions are loaded from database or Firestore custom collections, answers tracked in real-time
4. **Analytics**: Game completion data flows to analytics system for Pro/Premium users
5. **Leaderboards**: Scores are persisted to PostgreSQL and displayed in real-time

## External Dependencies

### Firebase Services
- **Storage**: Asset hosting for custom backgrounds and advertisements
- **Firestore**: Real-time database for group sessions and custom questions
- **Authentication**: Anonymous auth for basic operations

### Development Tools
- **Replit**: Primary development and hosting environment
- **Google Cloud SDK**: Firebase deployment and management
- **Tawk.to**: Customer support chat integration (production only)

## Deployment Strategy

### Development
- Runs on Replit with hot module replacement
- Development server on port 5000
- PostgreSQL module for database operations

### Production
- Build process: `npm run build` - Vite build + esbuild compilation
- Start command: `npm run start` - Runs compiled Node.js application
- Deployment target: Autoscale for handling variable traffic
- Static assets served from `dist/public`

### Firebase Storage
- Manual storage bucket creation required
- CORS configuration for Replit domains
- Public read access for branding assets
- Authenticated write access for admin uploads

## Changelog
- June 15, 2025: Added explicit Content-Type headers and cache-busting to trivia questions API endpoints to prevent HTML responses in production browsers
- June 15, 2025: Fixed group mode reveal-scores endpoint with proper error handling and validation for question data and scoring logic
- June 15, 2025: Removed duplicate reveal-scores route that was causing 500 errors
- June 15, 2025: Added legacy route pattern `/api/haunt/:hauntId/questions` for compatibility
- June 15, 2025: Restored original working trivia questions API endpoint by reverting routing changes that were interfering with existing functionality
- June 15, 2025: Fixed missing trivia questions endpoint causing JSON parsing errors - added `/api/trivia-questions/:hauntId` route that combines default horror pack with custom questions as additional question pools rather than giving custom questions preference
- June 15, 2025: Fixed group mode scoring logic - answers now recorded without immediate scoring, scores calculated only when host clicks "Reveal Answer" button, preventing premature score updates during gameplay
- June 15, 2025: Completed comprehensive Firebase audit confirming all 83 Firebase references properly connected across server routes including group mode, analytics, ad management, and branding assets
- June 14, 2025: Fixed Host panel crash by adding null safety checks to Object.keys() calls on currentAnswers - prevents "Cannot convert undefined or null to object" error when loading host interface
- June 14, 2025: Fixed Tawk.to customer support chat widget with correct widget ID (1it08ki7i) - now working on production domain for /info page and Pro/Premium haunt admin panels
- June 14, 2025: Removed broken question performance tracking system to eliminate console errors and improve stability - focusing analytics on business-critical ad engagement metrics only
- June 14, 2025: Fixed critical analytics dashboard bug - updated ad performance metrics to use unique Firebase document IDs instead of position-based tracking, ensuring accurate historical insights survive ad reordering and deletion
- June 14, 2025: Fixed critical analytics tracking system bug - corrected apiRequest parameter order (method, url, data) that was preventing all ad interactions from being recorded during gameplay  
- June 14, 2025: Updated ad tracking from position-based to unique ID-based analytics to handle randomized ad serving correctly  
- June 14, 2025: Completed individual ad management system with grid-based interface supporting hover controls for edit/delete operations on each ad - migrated existing headquarters ads from legacy Firebase collection structure to new individual management API endpoints
- June 14, 2025: Added Ad Performance Metrics section to analytics dashboard with professional table layout displaying ad thumbnails, views, clicks, CTR, and performance badges - integrates real interaction data from existing analytics system
- June 14, 2025: Enhanced analytics dashboard with professional design including gradient backgrounds, progress indicators, and comprehensive metric visualization
- June 14, 2025: Fixed analytics dashboard ad engagement display issue - corrected frontend data interface to match API response structure, enabling proper display of 200% ad click-through rate
- June 14, 2025: Completed comprehensive analytics tracking system with real Firebase data collection
- June 13, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.