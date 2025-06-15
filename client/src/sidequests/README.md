# Side Quests

Side Quests are self-contained mini-games that provide additional replay value and entertainment for players. Each side quest is independent and does not affect core game scores or data.

## Structure

### Components (`client/src/sidequests/`)
Each side quest has its own React component:
- `MonsterNameGenerator.tsx` - Generate terrifying monster names
- `GloryGrab.tsx` - Quick reflexes mini-game
- `ChupacabraChallenge.tsx` - Face the legendary cryptid
- `CrypticCompliments.tsx` - Decode mysterious messages
- `HexOrFlex.tsx` - Choose your supernatural path
- `LabEscape.tsx` - Escape from Dr. Heinous laboratory
- `GhoulYourOwnAdventure.tsx` - Interactive horror story
- `HeinousHighScore.tsx` - Beat the ultimate challenge
- `CurseCrafting.tsx` - Create supernatural curses
- `WheelOfMisfortune.tsx` - Spin for your fate

### Assets (`client/public/sidequests/`)
Each side quest has its own asset folder for:
- Background images
- Sprite graphics
- UI elements
- Sound effects (future)

## Usage

Import side quests from the index:
```typescript
import { MonsterNameGenerator, SIDE_QUESTS } from '@/sidequests';
```

Use the metadata for dynamic loading:
```typescript
const quest = SIDE_QUESTS['monster-name-generator'];
console.log(quest.name); // "Monster Name Generator"
```

## Development Guidelines

1. **Independence**: Each side quest should be self-contained
2. **No Core Data**: Side quests must not modify core game state or scores
3. **Modular Assets**: Use the dedicated asset folders for each quest
4. **Consistent Theming**: Maintain horror aesthetic with existing design system
5. **Mobile First**: Ensure responsive design for all screen sizes

## Subscription Tiers

Side quest availability varies by subscription tier:
- **Basic**: 3 side quests
- **Pro**: 5 side quests  
- **Premium**: 10 side quests (all available)