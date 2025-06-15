// Side Quests Index
// Export all side quest components for easy importing

export { MonsterNameGenerator } from './MonsterNameGenerator';
export { GloryGrab } from './GloryGrab';
export { ChupacabraChallenge } from './ChupacabraChallenge';
export { CrypticCompliments } from './CrypticCompliments';
export { HexOrFlex } from './HexOrFlex';
export { LabEscape } from './LabEscape';
export { GhoulYourOwnAdventure } from './GhoulYourOwnAdventure';
export { HeinousHighScore } from './HeinousHighScore';
export { CurseCrafting } from './CurseCrafting';
export { WheelOfMisfortune } from './WheelOfMisfortune';

// Side Quest metadata for dynamic loading
export const SIDE_QUESTS = {
  'monster-name-generator': {
    name: 'Monster Name Generator',
    component: 'MonsterNameGenerator',
    description: 'Generate terrifying monster names',
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes'
  },
  'glory-grab': {
    name: 'Glory Grab',
    component: 'GloryGrab', 
    description: 'Quick reflexes mini-game',
    difficulty: 'Medium',
    estimatedTime: '3-5 minutes'
  },
  'chupacabra-challenge': {
    name: 'Chupacabra Challenge',
    component: 'ChupacabraChallenge',
    description: 'Face the legendary cryptid',
    difficulty: 'Hard',
    estimatedTime: '5-7 minutes'
  },
  'cryptic-compliments': {
    name: 'Cryptic Compliments',
    component: 'CrypticCompliments',
    description: 'Decode mysterious messages',
    difficulty: 'Easy',
    estimatedTime: '2-4 minutes'
  },
  'hex-or-flex': {
    name: 'Hex or Flex',
    component: 'HexOrFlex',
    description: 'Choose your supernatural path',
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes'
  },
  'lab-escape': {
    name: 'Lab Escape',
    component: 'LabEscape',
    description: 'Escape from Dr. Heinous laboratory',
    difficulty: 'Hard',
    estimatedTime: '7-10 minutes'
  },
  'ghoul-your-own-adventure': {
    name: 'Ghoul Your Own Adventure',
    component: 'GhoulYourOwnAdventure',
    description: 'Interactive horror story',
    difficulty: 'Medium',
    estimatedTime: '5-8 minutes'
  },
  'heinous-high-score': {
    name: 'Heinous High Score',
    component: 'HeinousHighScore',
    description: 'Beat the ultimate challenge',
    difficulty: 'Expert',
    estimatedTime: '10-15 minutes'
  },
  'curse-crafting': {
    name: 'Curse Crafting',
    component: 'CurseCrafting',
    description: 'Create supernatural curses',
    difficulty: 'Medium',
    estimatedTime: '4-6 minutes'
  },
  'wheel-of-misfortune': {
    name: 'Wheel of Misfortune',
    component: 'WheelOfMisfortune',
    description: 'Spin for your fate',
    difficulty: 'Easy',
    estimatedTime: '1-2 minutes'
  }
} as const;

export type SideQuestId = keyof typeof SIDE_QUESTS;