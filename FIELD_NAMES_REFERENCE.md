# Field Names Reference

This document defines the standard field names used throughout the application to prevent mismatches between frontend and backend systems.

## Analytics System

### Ad Interactions
- **action**: Type of interaction ('view' or 'click') - STANDARD FIELD
- **haunt**: Haunt identifier for queries - STANDARD FIELD  
- **sessionId**: Game session identifier
- **adIndex**: Position of ad in array
- **adId**: Unique identifier for specific ad
- **timestamp**: When interaction occurred

### Game Sessions
- **hauntId**: Haunt identifier for sessions - STANDARD FIELD
- **playerId**: Player identifier
- **sessionType**: 'individual' or 'group'
- **startTime**: Session start timestamp
- **endTime**: Session completion timestamp
- **status**: 'active' or 'completed'

### Leaderboard Entries
- **haunt**: Haunt identifier for leaderboard queries - STANDARD FIELD
- **playerName**: Display name (also stored as 'name' in some collections)
- **score**: Player's final score
- **questionsAnswered**: Number of questions completed
- **correctAnswers**: Number of correct responses
- **timestamp**: When score was recorded

## API Endpoints Standard Parameters

### Query Parameters
- **haunt**: Used for haunt-specific data queries (NOT hauntId)
- **timeRange**: Analytics time period ('7days', '30days', etc.)
- **limit**: Maximum number of results to return

### Route Parameters  
- **:hauntId**: Used in URL paths (/api/analytics/:hauntId)
- **:sessionId**: Used for session-specific operations

## Common Mismatch Points (AVOID THESE)

❌ **Wrong**: Using 'hauntId' in query parameters
✅ **Correct**: Use 'haunt' in query parameters

❌ **Wrong**: Using 'interactionType' for ad actions  
✅ **Correct**: Use 'action' for ad interactions

❌ **Wrong**: Mixing 'name' and 'playerName' inconsistently
✅ **Correct**: Use 'playerName' for display, 'name' for Firebase storage

## Validation Rules

1. **Before creating any new API endpoint**: Check this reference
2. **Before adding database queries**: Verify field names match
3. **Before updating analytics logic**: Ensure consistent field usage
4. **When debugging data flow**: Check for field name mismatches first

## Update Protocol

When adding new fields:
1. Add to this reference file first
2. Use consistent naming across all systems
3. Update any related endpoints simultaneously
4. Test data flow end-to-end before deployment