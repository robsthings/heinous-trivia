# TAILWIND REMOVAL SCAN REPORT

## Files Still Using Tailwind className Properties

### Critical Files with Heavy Tailwind Usage:
1. **client/src/pages/info.tsx** - Landing page with extensive Tailwind classes
2. **client/src/components/TriviaCard.tsx** - Game component with Tailwind styling
3. **client/src/components/SpookyLoader.tsx** - Loading component
4. **client/src/components/CustomProgressBar.tsx** - Progress bar with some inline styles
5. **client/src/components/Leaderboard.tsx** - Game leaderboard
6. **client/src/components/GameEndScreen.tsx** - End game screen
7. **client/src/components/InterstitialAd.tsx** - Advertisement display
8. **client/src/components/SpeechBubble.tsx** - Speech bubble component
9. **client/src/components/PWAInstallButton.tsx** - PWA installation
10. **client/src/components/SimpleSelect.tsx** - Select dropdown
11. **client/src/components/CustomSelect.tsx** - Custom select
12. **client/src/components/DynamicSidequestLoader.tsx** - Sidequest loader
13. **client/src/components/MiniSpookyLoader.tsx** - Mini loader
14. **client/src/components/RootRedirector.tsx** - Root redirection

### Sidequest Components:
- Multiple sidequest files in client/src/pages/sidequests/
- Sidequest components in client/src/components/sidequests/

## Dependencies to Remove:

### Package.json Analysis:
- **clsx**: Used for className concatenation (line 25)
- **autoprefixer**: PostCSS plugin (line 56)

### Configuration Files:
- **components.json**: Contains Tailwind configuration references
- **No tailwind.config.ts found** (already removed)
- **No postcss.config.js found** (already removed)

## CSS Files Analysis:

### client/src/index.css:
- Clean of @tailwind directives
- Contains only custom CSS and animations
- No Tailwind dependencies found

### client/src/styles.css:
- Contains Tailwind utility class definitions
- Should be removed entirely as it duplicates Tailwind functionality

## Utility Functions:
- **client/src/lib/utils.ts**: Contains `cn()` function using clsx for className merging

## Recommended Removal Steps:

1. Convert all className usage to inline styles across 20+ component files
2. Remove clsx dependency from package.json
3. Remove autoprefixer dependency (if not needed for other CSS)
4. Delete client/src/styles.css file
5. Remove or modify client/src/lib/utils.ts
6. Update components.json to remove Tailwind references
7. Clean up any remaining Tailwind class references

## Priority Order:
1. High Priority: Game components (TriviaCard, SpookyLoader, GameEndScreen)
2. Medium Priority: UI components (Leaderboard, InterstitialAd, Selects)
3. Lower Priority: Sidequest components and utility components

## Estimated Files to Modify: 25+ component files