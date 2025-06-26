// Side Quests Index
// Export all side quest components for easy importing

export { MonsterNameGenerator } from './MonsterNameGenerator';
export { GloryGrab } from './GloryGrab';
export { ChupacabraChallenge } from './ChupacabraChallenge';
export { CrypticCompliments } from './CrypticCompliments';
export { LabEscape } from './LabEscape';
export { WackAChupacabra } from './WackAChupacabra';
export { CurseCrafting } from './CurseCrafting';
export { WretchedWiring } from './WretchedWiring';
export { FaceTheChupacabra } from './FaceTheChupacabra';
export { Crime } from './Crime';

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

  'lab-escape': {
    name: 'Lab Escape',
    component: 'LabEscape',
    description: 'Escape from Dr. Heinous laboratory',
    difficulty: 'Hard',
    estimatedTime: '7-10 minutes'
  },
  'wack-a-chupacabra': {
    name: 'Wack-A-Chupacabra',
    component: 'WackAChupacabra',
    description: 'Reflex hit game with Chupacabra taunts and trick targets',
    difficulty: 'Medium',
    estimatedTime: '3-5 minutes'
  },

  'curse-crafting': {
    name: 'Curse Crafting',
    component: 'CurseCrafting',
    description: 'Create supernatural curses',
    difficulty: 'Medium',
    estimatedTime: '4-6 minutes'
  },

  'wretched-wiring': {
    name: 'Wretched Wiring',
    component: 'WretchedWiring',
    description: 'Chaotic electrical "repair" simulation with no actual logic',
    difficulty: 'Impossible',
    estimatedTime: '5-10 minutes (or until you give up)'
  },
  'face-the-chupacabra': {
    name: 'Face the Chupacabra',
    component: 'FaceTheChupacabra',
    description: 'Rock-paper-scissors duel against the legendary cryptid',
    difficulty: 'Medium',
    estimatedTime: '3-5 minutes'
  },
  'crime': {
    name: 'C.R.I.M.E.',
    component: 'Crime',
    description: 'Control Room Interactive Memory Experiment - Simon-style memory challenge',
    difficulty: 'Hard',
    estimatedTime: '5-8 minutes'
  }
} as const;

export type SideQuestId = keyof typeof SIDE_QUESTS;