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

## Critical Game Dependencies

### Required Routes (App.tsx)
- `/game/:hauntId` - Individual game sessions (CRITICAL: must match URL pattern)
- `/game` - Fallback game route
- Root route with haunt parameter handling

### Required GameManager Methods (client/src/lib/gameState.ts)
- `initializeGameState(haunt: string)` - Loads questions and ads for game sessions
- `createInitialState(haunt: string)` - Creates base game state
- All static methods must be properly exported from GameManager class

### Game Initialization Flow
1. Router matches `/game/:hauntId` pattern
2. Game component calls `GameManager.initializeGameState(haunt)`
3. Method fetches questions from `/api/trivia-questions/${haunt}`
4. Method fetches ads from `/api/ads/${haunt}`
5. Game state updates with loaded data

## Changelog
- June 17, 2025: **RESPONSIVE CERTIFICATE OF FAILURE** - Made certificate screen fully mobile-responsive with proper scaling (max-w-lg for optimal size), stacked mobile buttons, and touch-friendly sizing for Dr. Heinous's sarcastic failure award
- June 17, 2025: **BROKEN "I GIVE UP" BUTTON** - Enhanced chaos simulator with malfunctioning surrender button requiring 3 clicks and displaying "That's broken too" message, completing the everything-is-broken experience
- June 17, 2025: **AMPLIFIED FAKE TIMER PANIC MODE** - Enhanced red panic phases with vibration (bounce), intense red glow, scale increase, spinning rings, and "PANIC!" text transformation for maximum dramatic effect
- June 17, 2025: **ENHANCED CHUPACABRA AUTHENTICITY** - Replaced human speech with creature sounds (growls, hisses, grunts, chomping) for authentic cryptid wire theft experience
- June 17, 2025: **UPGRADED DR. HEINOUS COMMENTARY SYSTEM** - Expanded to 29 premium snarky taunts including "Error 666: Haunting Intensifies", "We are now operating entirely on vibes", and "You've achieved total un-circuitry", creating maximum personality-driven frustration experience
- June 17, 2025: **CREATED WRETCHED WIRING CHAOS SIMULATOR** - Built intentionally broken "puzzle" game with draggable/rotatable wires, fake countdown timer with panic flashes, Dr. Heinous taunts every 6-10 seconds, Chupacabra wire theft events, glowing "I Give Up" button leading to certificate screen, complete with terminal nodes and chaotic interactions
- June 17, 2025: **IMPLEMENTED MOON-FRAMED HAUNT BRANDING** - Replaced standalone logo watermark with wack-moon.png background and centered haunt logo overlay (75% size, 80% opacity), creating integrated moon-framed branding that feels natural within spooky atmosphere
- June 17, 2025: **ENHANCED WACK-A-CHUPACABRA TYPOGRAPHY** - Applied Frijole Google font to main title and header for authentic cryptid-themed typography, creating consistent spooky carnival atmosphere matching Chupacabra Challenge styling
- June 17, 2025: **ADDED HAUNT BRANDING TO WACK-A-CHUPACABRA** - Integrated haunt logo watermark positioned over moon in background (top-right corner), using same implementation as trivia cards with 30% opacity grayscale filter, fetches haunt configuration for custom branding per venue
- June 17, 2025: **POLISHED WACK-A-CHUPACABRA MINI-GAME** - Perfected sprite positioning (-top-1 for realistic hole emergence), increased hole and sprite sizes by 50% for better visibility, removed debugging interface, updated navigation to return players to main trivia game instead of side quests menu, creating seamless mini-game diversions
- June 17, 2025: **COMPLETED WACK-A-CHUPACABRA MINI-GAME** - Built complete reflex game with 5-hole grid layout, random sprite spawning system (70% Chupacabra +1pt, 20% decoy -1pt, 10% poison vial = game over), 1.2-second sprite visibility with bounce animations, instant game over with green goo splash overlay, responsive mobile design with proper click detection, full routing integration
- June 17, 2025: **REPLACED GHOUL YOUR OWN ADVENTURE WITH WACK-A-CHUPACABRA** - Removed GhoulYourOwnAdventure side quest and created new WackAChupacabra structure, updated sidequests index and metadata with proper game description ("Reflex hit game with Chupacabra taunts and trick targets"), prepared asset folder for future implementation
- June 17, 2025: **COMPLETED CURSE CRAFTING WITH GLOW EFFECTS AND SCREENSHOT** - Added toxic green glow effect behind revealed scroll with animated pulsing, implemented screenshot functionality using html2canvas for shareable curse images, updated curse generation to use randomized wordbanks instead of selected ingredients for consistent humor, complete theatrical experience with Eater font title and scroll reveal animation
- June 16, 2025: **IMPLEMENTED CURSE CRAFTING MINI-GAME** - Created complete potion brewing system with 18 unique mystical ingredients ("Easther of Wood Rossen", "Sneaker Worn Sock Lint", etc.), interactive cauldron interface for selecting up to 3 ingredients from 8 randomly chosen ones, random curse generation with creative names and effects, purple/green mystical color scheme with animated background effects, replaces Wheel of Misfortune as 9th side quest
- June 16, 2025: **ENHANCED CHUPACABRA CHALLENGE WITH PANIC MODE** - Added comprehensive panic system at 15 seconds: screen-wide red pulsing, enhanced contrast effects, timer changes from cyan to red with aggressive animations, "CONTAINMENT FAILING!" warning message with bounce animation, game grid pulses to simulate system instability, creates authentic tension as Chupacabra prepares to break free
- June 16, 2025: **COMPLETED CHUPACABRA CHALLENGE COUNTDOWN TIMER** - Added 90-second vertical countdown timer positioned on left edge, styled as glowing cyan liquid column that drains from top to bottom, game failure state when timer hits zero with "You failed the Chupacabra Challenge!" message, timer stops on victory/defeat, responsive sizing across mobile/desktop
- June 16, 2025: **COMPLETED CHUPACABRA CHALLENGE CARD FLIP ANIMATIONS** - Enhanced memory game with professional 3D card flip animations (600ms duration), mobile-first responsive design (gap-2 on mobile, gap-4 on desktop), dynamic visual feedback system (green glow for matches, red borders for mismatches), hover effects with scale transforms, pointer-events management during checking phase, brightness/contrast enhancement for matched cards
- June 16, 2025: **ADDED FRIJOLE GOOGLE FONT TO CHUPACABRA CHALLENGE** - Imported Frijole font family and applied to "CHUPACABRA CHALLENGE" title with proper styling, creating authentic cryptid-themed typography that matches the game's supernatural atmosphere
- June 16, 2025: **ENHANCED CHUPACABRA CHALLENGE STATE MANAGEMENT** - Implemented complete game state tracking with attempts counter, prevented 3rd card flipping during checking phase, auto-hide unmatched cards after 1 second, victory detection with performance stats display, proper game reset functionality
- June 16, 2025: **CREATED PHANTOM'S PUZZLE PATTERN MEMORIZATION GAME** - Built progressive 7-level pattern challenge with decreasing time limits (study 8-4s, input 12-6s), three-strike failure system with level retry mechanics, scoring system with performance bonuses, symbol sequences growing from 4-8 patterns, authentic memory test with ethereal phantom theme
- June 16, 2025: **CREATED SPECTRAL MEMORY SUPERNATURAL MATCHING GAME** - Built 60-second memory challenge with 6 pairs of supernatural symbols, random spectral interference events (ghostly shuffles, phantom reveals, spectral fog, ectoplasmic scrambling), dynamic difficulty with events every 8-15 seconds, visual feedback systems with blur effects and color-coded card states, move tracking and performance scoring
- June 16, 2025: **CREATED NECROMANCER'S GAMBIT CARD BATTLE MINI-GAME** - Built strategic best-of-3 card battle system with 6 unique player cards vs 6 necromancer cards, dynamic power calculations with card effect interactions (Holy Water vs undead, Silver Cross vs dark magic), intelligent AI opponent with random card selection, battle history tracking, victory/defeat animations with score displays
- June 16, 2025: **CREATED CHUPACABRA CHALLENGE STEALTH MINI-GAME** - Built 30-second survival game with strategic hiding spots rated 1-5 stars for safety, dynamic detection system based on proximity and location safety, real-time risk meter with color-coded danger levels, moving Chupacabra patrol system, heartbeat effects during high-risk moments, authentic tension-building stealth gameplay
- June 16, 2025: **CREATED CHUPACABRA CHALLENGE MEMORY GAME** - Built complete 4x4 card matching game with 8 cryptid pairs, 3D flip animations, match detection logic, and victory screen with background from challenge-bg.png, added Chupacabra reaction overlays (scheming for matches, taunting for mismatches) positioned in corner with pulse/bounce animations
- June 16, 2025: **REPLACED PHYSICAL CHALLENGE WITH MISSED CALL FROM THE VOID** - Simplified confusing Physical Challenge by replacing with "Missed Call from the Void" effect featuring voicemail from beyond with Dr. Heinous line "Probably another call about a car's extended warranty.", removed complex eye animation system for cleaner user experience
- June 16, 2025: **ENHANCED DOOMLIGHT SAVINGS TIME WITH DYNAMIC MESSAGING** - Updated "Doomlight Savings Time" effect to display random time between 0.001-1.000 seconds with message "We just sucked [X] seconds from your life!", generates new random time value on each wheel landing for variety and humor
- June 16, 2025: **FIXED WHEEL LANDING ACCURACY AND ENHANCED PHYSICAL CHALLENGE** - Corrected wheel rotation calculation for deterministic slice landing, redesigned Physical Challenge with eye-through-phone experience (2s zoom-out, 4s blinking, witnesseth button, YES/NO verification), added Dr. Heinous praise/disdain reactions based on challenge completion
- June 16, 2025: **ENHANCED WHEEL OF MISFORTUNE SPIN DRAMA** - Increased rotations to 5-8 spins with 8-second duration, added motion blur effect during spinning, implemented extreme deceleration curve (cubic-bezier 0.11,0,0.5,0) for maximum anticipation buildup, creates authentic game show wheel experience with dramatic slowdown to final decision
- June 16, 2025: **ENHANCED WHEEL OF MISFORTUNE LAYOUT** - Arranged Dr. Heinous presenting sprite and spinning wheel side by side on desktop with compact spacing (gap-4/gap-6), created intimate game show presentation where Dr. Heinous actively showcases wheel to players, maintained full responsiveness across mobile and desktop
- June 16, 2025: **CREATED WHEEL OF MISFORTUNE MINI-GAME** - Built complete spinning wheel game with 8 unique outcomes (Cursed, Mystery Prize, Ghosted, Doomlight Savings Time, Cringe Echo, Physical Challenge, Glory by Accident, Unknowable Insight), deterministic wheel rotation to selected slice, physical challenge mode with eye-blink animation and "Witnesseth" button, comprehensive CSS effect animations for each result, responsive layout with all required assets integrated
- June 16, 2025: **POLISHED CRYPTIC COMPLIMENTS BUTTON STYLING** - Unified button design with consistent px-6 py-3 padding, enhanced hover effects with shadows and scale transforms, converted "Return to Main Game" link to proper button styling, improved visual hierarchy with purple/gray color scheme
- June 16, 2025: **FINALIZED CRYPTIC COMPLIMENTS SIGNATURE TIMING** - Added 1.5 second delay so signature appears after compliment text with permanent visibility, signature GIF loops continuously but provides authentic handwriting animation effect, creates natural progression where Dr. Heinous reads compliment then signs scroll
- June 16, 2025: **COMPLETED CRYPTIC COMPLIMENTS SIGNATURE ANIMATION** - Replaced text-based signature animation with authentic signature.gif providing smooth handwriting effect, eliminated flash and positioning issues during animation reveal, maintains proper right alignment and timing in scroll sequence
- June 16, 2025: **COMPLETED CRYPTIC COMPLIMENTS SCROLL POLISH** - Enhanced paper reveal animation with authentic ink burn effects (orange flame glow to brown ink shadows), implemented Cinzel Decorative typography with Homemade Apple signature font, added floating scroll effects with -1.5° rotation and drop shadows, optimized text sizing (clamp 1.1rem-1.8rem) to fill parchment boundaries without overflow, created complete theatrical sequence: gift click → parchment unfurl → text burn → signature appear → floating effect
- June 15, 2025: **IMPLEMENTED ESCALATING CHAOS SYSTEM FOR GLORY GRAB** - Added progressive difficulty escalation where each "Play Again" increases chaos level, spawning more vials (8→11→14→17→20 max) with faster spawn rates (15% increase per level), level 3+ spawns multiple vials simultaneously, visual chaos level indicator with color progression (yellow→orange→red), Dr. Heinous chaos reactions ("MORE CHAOS! I LOVE IT!"), creates crowd-gathering social gameplay experience reaching chaos level 5+
- June 15, 2025: **ENHANCED GLORY GRAB WITH INDIVIDUAL SPRITE ASSETS** - Updated vial system to use individual PNG files (vial-1-normal.png through vial-4-exploding.png) instead of sprite sheet, added decoy vial mechanic with vial-empty.png (20% spawn chance, no points, triggers "You fool! That was empty!" reactions), implemented dynamic vial state visualization (normal → glowing when countdown <30% → exploding), improved visual polish with proper asset loading
- June 15, 2025: **CREATED GLORY GRAB SIDE QUEST MINI-GAME** - Built fast-paced laboratory vial collection game with 20-second timer, randomly spawning vials with 2-4 second countdown timers, Dr. Heinous reactive dialogue system with context-aware messages ("Impressive reflexes, worm!", "MELTDOWN! My laboratory!"), score-based gameplay with collection animations, explosion effects for missed vials, and responsive mobile-optimized tap targets
- June 15, 2025: **ENHANCED MONSTER NAME GENERATOR WITH FULL RESPONSIVE DESIGN** - Implemented full-screen scan line animation that moves from top to bottom over 4 seconds with blue glow effect, repositioned Dr. Heinous sprite with proper Replit bar clearance and speech bubble above head saying "Hold still. This won't hurt… much.", hidden monster card during scanning phase with smooth fade-in reveal, made all elements fully responsive for mobile with proper button sizing and layout optimization
- June 15, 2025: **CREATED SIDE QUESTS FEATURE SCAFFOLD** - Built complete modular structure for 10 self-contained mini-games: created client/src/sidequests/ components (MonsterNameGenerator, GloryGrab, ChupacabraChallenge, etc.) and client/public/sidequests/ asset folders - includes metadata system for dynamic loading with difficulty ratings and estimated play times
- June 15, 2025: **FIXED WELCOME SCREEN REDIRECT LOOP** - Resolved deployment issue where Start Game/Play Again buttons caused infinite redirect loops by implementing sessionStorage tracking to distinguish users coming from welcome screen vs direct game URL access
- June 15, 2025: **ADDED INTERACTIVE SPEECH BUBBLE SYSTEM** - Created typewriter effect speech bubble above Dr. Heinous sprite with cycling dialogue: first-time users see 3 messages ("Initializing Evil Protocols…", "Dare ye match wits with ME?!", "Prepare for HEINOUS challenges!"), returning users see 1 message ("Back for more punishment?") - text types out character by character then deletes before switching lines
- June 15, 2025: **COMPLETED WELCOME SCREEN FLOW FOR ALL USERS** - All users accessing /game/:hauntId now redirect to /welcome/:hauntId with appropriate experiences: first-time users see dramatic intro animations, returning users see "Back for more?" welcome with charming sprite and lab background
- June 15, 2025: **INTEGRATED WELCOME SCREEN INTO GAME FLOW** - Updated Game component to redirect first-time users from /game/:hauntId to /welcome/:hauntId, ensuring all new players experience dramatic intro animations before gameplay
- June 15, 2025: **ENHANCED WELCOME SCREEN ANIMATIONS** - Created dramatic CSS effects including lightning-flash (blue electrical strikes), glitch-lines (distorted horizontal shimmer), and sprite-glitch-in (character entrance with opacity/filter effects) for immersive horror atmosphere
- June 15, 2025: **IMPLEMENTED QR CODE REDIRECT SYSTEM** - Created RootRedirector component that detects ?haunt= query parameters and routes first-time users to /welcome/:hauntId or returning users to /game/:hauntId, maintaining backward compatibility with existing QR codes
- June 15, 2025: **CREATED DYNAMIC WELCOME SCREEN** - Built responsive Welcome component with localStorage-based first-time detection, character sprite integration, and horror-themed animations including lightning effects and glitch overlays for immersive user onboarding
- June 15, 2025: **MAJOR ATTACHED ASSETS CLEANUP** - Removed 90 unused screenshots and example images not referenced in codebase, freeing 31MB of storage space and reducing attached_assets directory from 35MB to 308KB (99% reduction)
- June 15, 2025: **CREATED DYNAMIC CHARACTER SPRITE LOADER** - Built utility at client/src/lib/characterLoader.ts using import.meta.glob to dynamically load PNG files from /public/heinous and /public/chupacabra directories, enabling extensible character asset management
- June 15, 2025: **REMOVED UPLOAD GUIDELINES FROM FOOTER** - Cleaned up game footer by removing Upload Guidelines link, simplifying navigation to only show Privacy Policy and Terms of Use
- June 15, 2025: **IMPLEMENTED CONDITIONAL CUSTOM BACKGROUND SYSTEM** - Fixed custom skins to only show when skinUrl is actually configured, maintaining original black/gradient backgrounds when no custom skin is present
- June 15, 2025: **FIXED MANAGE ADS BUTTON URL** - Corrected analytics dashboard "Manage Ads" button to point to https://heinoustrivia.com/haunt-admin/{hauntId} instead of broken relative path, enabling proper navigation to haunt admin panel
- June 15, 2025: **FIXED AD CAMPAIGN SUMMARY CALCULATIONS** - Updated Ad Campaign Summary to use analyticsData.adPerformanceData instead of separate query, displaying authentic metrics (19 total impressions, 50 total engagements) from Firebase data instead of zeros
- June 15, 2025: **FIXED ANALYTICS SESSION COMPLETION TRACKING** - Added missing AnalyticsTracker.completeSession call to GameManager.saveScore method, enabling real-time analytics updates when players finish games and save scores
- June 15, 2025: **FIXED VIEW FULL LEADERBOARD BUTTON** - Corrected API endpoint from query parameter (?haunt=) to path parameter (/:hauntId) format, enabling proper display of authentic player leaderboard data
- June 15, 2025: **FIXED AD PERFORMANCE METRICS TRACKING** - Resolved field name mismatch between analytics tracker (action) and dashboard query (interactionType) by updating calculation logic to check both field names, enabling accurate display of ad views, clicks, and CTR in analytics dashboard
- June 15, 2025: **FIXED LEADERBOARD BUTTON** - Corrected API parameter mismatch in handleViewLeaderboard function (changed hauntId to haunt) enabling "View Full Leaderboard" button to properly fetch and display leaderboard data after game completion
- June 15, 2025: **FIXED GAME COMPLETION FLOW** - Corrected game state progression after question 20 by updating nextQuestion logic to properly check for completion conditions and fixed game component to recognize gameComplete/showEndScreen flags instead of invalid gamePhase property, ensuring players reach end screen and leaderboard
- June 15, 2025: **COMPLETED ANALYTICS DASHBOARD IMPROVEMENTS** - Fixed performance badges to show meaningful data based on actual CTR (Excellent: 5%+, Good: 2-4%, Needs Improvement: <2%) and added comprehensive Ad Campaign Summary section with metrics, performance indicators, and call-to-action buttons for managing ads and refreshing data
- June 15, 2025: **IMPLEMENTED RANDOM AD SELECTION** - Updated ad display logic to randomly select from the entire ad pool at each break (questions 5, 10, 15) instead of sequential cycling, providing varied ad exposure across game sessions
- June 15, 2025: **FIXED AD ROTATION BUG** - Corrected handleCloseAd to use GameManager.closeAd method, enabling proper ad cycling so different ads show at questions 5, 10, and 15 instead of repeating the same ad
- June 15, 2025: **FIXED QUESTION REPETITION BUG IN AD FLOW** - Corrected game state logic where questions 5, 10, and 15 were being repeated after ads by ensuring question index is only advanced once during ad transitions
- June 15, 2025: **COMPLETED GAME FUNCTIONALITY RESTORATION** - Fixed click handler arguments in game component, resolving non-interactive answer buttons and enabling full 20-question gameplay with authentic 205 questions from Firebase trivia packs
- June 15, 2025: **FIXED CRITICAL GAME ROUTING AND INITIALIZATION** - Added missing `/game/:hauntId` route and restored `initializeGameState` method to GameManager, resolving 404 errors and function reference failures that prevented game loading
- June 15, 2025: **RESTORED AD PERFORMANCE METRICS DISPLAY** - Fixed missing Ad Performance section in analytics dashboard by correcting data structure alignment and adding fallback display for ads with zero interactions, ensuring all 6 uploaded ads appear in analytics table with current metrics
- June 15, 2025: **COMPLETED ANALYTICS DATA STRUCTURE ALIGNMENT** - Fixed frontend-backend data interface mismatches by updating AnalyticsData interface to match backend response structure (completionRate vs averageScore), enabling authentic display of 31 games, 14 players, 71% completion rate from real Firebase data
- June 15, 2025: **FIXED FIREBASE COLLECTION NAMING ALIGNMENT** - Updated all server-side collection references from camelCase (gameSessions, adInteractions) to snake_case (game_sessions, ad_interactions) matching Firebase console collection structure, resolving analytics endpoint failures and enabling authentic data retrieval with proper index utilization
- June 15, 2025: **COMPLETED COMPREHENSIVE GROUP MODE REMOVAL** - Eliminated all Group Mode Express routes (/api/host, /api/group), removed host-panel.tsx page, cleaned up 32+ GROUP_MODE comment blocks while preserving ads, analytics, and leaderboard functionality for individual-only gameplay
- June 15, 2025: Added Random Sidequests feature to all subscription tiers - Basic: 3, Pro: 5, Premium: 10 sidequests per tier
- June 15, 2025: Removed Group Party Mode and Real-time multiplayer references from Pro and Premium tier descriptions on /info page to accurately reflect individual-only functionality
- June 15, 2025: Removed Game Configuration section from haunt-admin panel since all haunts now operate in individual-only mode - streamlined interface eliminates redundant game mode selector
- June 15, 2025: Removed redundant mini leaderboard from game end screen, streamlining flow to comprehensive top 10 leaderboard
- June 15, 2025: Completed Individual Mode question loading audit - removed hardcoded fallback questions, fixed Firebase collection loading order, added proper server-side randomization with 205+ questions available from trivia-packs collections ensuring every 20-question session has unique randomized order
- June 15, 2025: Removed redundant client-side question shuffling since server now provides pre-randomized questions for each session
- June 15, 2025: Fixed analytics session and leaderboard endpoints returning HTML instead of JSON by adding explicit Content-Type headers and cache-busting - resolves "Unexpected token '<'" errors and enables proper 20-question individual gameplay
- June 15, 2025: Added missing `/api/analytics/session` and `/api/analytics/ad-interaction` endpoints preventing analytics tracking failures that were stopping games at 10 questions instead of running full 20-question sessions  
- June 15, 2025: Added missing `/api/leaderboard` query parameter endpoint for GameEndScreen leaderboard display functionality
- June 15, 2025: Labeled all group mode logic with // GROUP_MODE_START and // GROUP_MODE_END comment blocks enabling future search and removal if full purge needed later
- June 15, 2025: Added guard clauses in all activeRound-related Firebase functions to return early or throw harmless errors preventing legacy frontends from accidentally triggering group mode writes
- June 15, 2025: Fixed redeploy issue where headquarters haunt configuration was stuck in "queue" mode instead of "individual" by updating stored Firebase configuration
- June 15, 2025: Hidden host panel UI links from admin interfaces while keeping backend routes intact - soft disable prevents access to group hosting features while preserving code functionality
- June 15, 2025: Disabled client-side group mode detection forcing all users to individual play mode - removed group mode UI components, polling logic, and answer handling while preserving backend group functionality
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

**Critical Development Standards:**
- Always reference fieldGlossary.json before creating any API endpoints or database queries
- Field name consistency is mandatory - prevent mismatches between frontend/backend
- Use standardized field names: 'haunt' for queries, 'action' for ad interactions, etc.
- Reference comments added to all Firebase integration files pointing to fieldGlossary.json

## Upcoming Features

- Mini games to replace removed group mode functionality (planned for June 16, 2025)