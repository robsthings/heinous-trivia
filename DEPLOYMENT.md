# Deployment Guide - Heinous Trivia

## Build Commands Available

The deployment system now has multiple build command options to handle the missing `npm run build` script:

### Option 1: Shell Script (Recommended)
```bash
./build.sh
```

### Option 2: Node Script
```bash
node build
```

### Option 3: npm Alternative
```bash
./npm-build
```

### Option 4: Direct Build Script
```bash
node build-simple.js
```

## Build Output

All build commands generate the same production-ready structure:

```
dist/
├── index.js          # 109KB server bundle (ESM format)
├── package.json      # Production dependencies
└── public/           # Static assets (237+ files)
    ├── index.html    # Fallback for client-side routing
    ├── backgrounds/  # Game assets
    ├── sidequests/   # Mini-game assets
    └── ...          # All other static files
```

## Deployment Commands

For Cloud Run deployment, use any of these commands in your build configuration:

1. **Shell script**: `./build.sh`
2. **Node script**: `node build`
3. **Direct build**: `node build-simple.js`

## Production Server

- **Entry Point**: `dist/index.js`
- **Start Command**: `NODE_ENV=production node index.js`
- **Port**: Configured via `PORT` environment variable (defaults to 5000)
- **Binding**: `0.0.0.0` for Cloud Run compatibility

## Dependencies

All required production dependencies are included in `dist/package.json`:
- Express server framework
- Firebase integration
- Database connectivity
- Core business logic dependencies

## Verification

After build completion, verify the following files exist:
- ✅ `dist/index.js` (server bundle)
- ✅ `dist/package.json` (production config)  
- ✅ `dist/public/` (static assets directory)

## Troubleshooting

If deployment fails:
1. Ensure build script has execute permissions: `chmod +x build.sh`
2. Verify Node.js version >= 18.0.0
3. Check that all environment variables are properly configured
4. Test locally: `cd dist && npm install && npm start`

The deployment system is now fully operational with multiple build command options.