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
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.