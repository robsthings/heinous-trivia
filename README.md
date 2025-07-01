# Heinous Trivia - Horror Trivia Platform

A horror-themed trivia platform that allows haunts and entertainment venues to create customized trivia experiences for their visitors.

## Features

- Individual and group gameplay modes
- Custom branding and themes
- Real-time analytics tracking
- Tiered subscription features
- Interactive side quests
- Firebase integration for real-time data

## Tech Stack

### Frontend
- React with TypeScript
- Wouter for routing
- Tailwind CSS
- Radix UI components
- TanStack Query for state management

### Backend
- Node.js with Express
- Drizzle ORM with PostgreSQL
- Firebase (Storage, Firestore, Auth)
- TypeScript

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project setup

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see Firebase setup documentation)

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Production Deployment

### Start Command
```bash
npm start
```

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- Firebase configuration variables
- `NODE_ENV=production`

## Project Structure

```
├── client/          # React frontend
│   ├── src/         # Source files
│   └── public/      # Static assets
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── public/          # Public assets
```

## Game Features

### Core Gameplay
- 20-question trivia sessions
- Multiple choice answers
- Real-time scoring
- Leaderboards

### Admin Features
- Haunt management
- Custom question creation
- Analytics dashboard
- Branding customization

### Side Quests
- Interactive mini-games
- Tier-based unlocks
- Horror-themed challenges

## License

All rights reserved.