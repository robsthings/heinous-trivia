/**
 * Migrate Existing Sidequests to Firebase
 * 
 * This script uploads existing sidequest definitions to Firebase
 * so they can be dynamically loaded instead of hardcoded
 */

import { FirebaseService } from './server/firebase.ts';

// Define existing sidequests to migrate to Firebase
const sidequests = [
  {
    id: 'monster-name-generator',
    name: 'Monster Name Generator',
    description: 'Generate terrifying monster names with supernatural flair',
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    componentType: 'generator',
    config: {
      wordBanks: {
        adjectives: ['Terrifying', 'Ancient', 'Cursed', 'Bloodthirsty', 'Sinister'],
        nouns: ['Beast', 'Demon', 'Wraith', 'Fiend', 'Specter'],
        suffixes: ['of Doom', 'the Destroyer', 'from Beyond', 'of Shadows']
      }
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'glory-grab',
    name: 'Glory Grab',
    description: 'Fast-paced laboratory vial collection with escalating chaos',
    difficulty: 'Medium',
    estimatedTime: '3-5 minutes',
    componentType: 'reflex-game',
    config: {
      timeLimit: 20,
      vialTypes: ['normal', 'glowing', 'exploding', 'decoy'],
      spawnRate: 1500,
      chaosLevels: 5
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'chupacabra-challenge',
    name: 'Chupacabra Challenge',
    description: 'Memory card matching game with cryptid interference',
    difficulty: 'Hard',
    estimatedTime: '5-7 minutes',
    componentType: 'memory-game',
    config: {
      gridSize: '4x4',
      cardPairs: 8,
      timeLimit: 90,
      interferenceEvents: ['shuffle', 'reveal', 'fog', 'scramble']
    },
    isActive: true,
    requiredTier: 'Pro'
  },
  {
    id: 'cryptic-compliments',
    name: 'Cryptic Compliments',
    description: 'Receive personalized supernatural compliments on mystical scrolls',
    difficulty: 'Easy',
    estimatedTime: '2-4 minutes',
    componentType: 'interactive-story',
    config: {
      complimentBanks: {
        supernatural: ['Your aura radiates otherworldly power', 'The spirits whisper of your greatness'],
        mystical: ['Ancient runes spell out your magnificence', 'Crystal balls reveal your hidden talents']
      }
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'wheel-of-misfortune',
    name: 'Wheel of Misfortune',
    description: 'Spin for supernatural consequences and bizarre effects',
    difficulty: 'Easy',
    estimatedTime: '1-2 minutes',
    componentType: 'wheel-spinner',
    config: {
      slices: [
        { label: 'Cursed!', effect: 'cursed-sparks' },
        { label: 'Mystery Prize', effect: 'mystery-glow' },
        { label: 'Ghosted', effect: 'ghost-swoosh' },
        { label: 'Doomlight Savings Time', effect: 'time-melt' },
        { label: 'Physical Challenge', effect: 'eye-blink' },
        { label: 'Glory by Accident', effect: 'golden-shower' },
        { label: 'Cringe Echo', effect: 'cringe-flash' },
        { label: 'Unknowable Insight', effect: 'mind-expansion' }
      ]
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'necromancers-gambit',
    name: "Necromancer's Gambit",
    description: 'Strategic card battle against undead forces',
    difficulty: 'Hard',
    estimatedTime: '7-10 minutes',
    componentType: 'card-battle',
    config: {
      playerCards: [
        { name: 'Holy Water', power: 8, effect: 'anti-undead' },
        { name: 'Silver Cross', power: 6, effect: 'anti-dark' },
        { name: 'Blessed Sword', power: 7, effect: 'holy-damage' }
      ],
      enemyCards: [
        { name: 'Skeleton Warrior', power: 5, effect: 'undead' },
        { name: 'Dark Spell', power: 6, effect: 'dark-magic' },
        { name: 'Zombie Horde', power: 7, effect: 'swarm' }
      ]
    },
    isActive: true,
    requiredTier: 'Pro'
  },
  {
    id: 'spectral-memory',
    name: 'Spectral Memory',
    description: 'Supernatural symbol matching with ghostly interference',
    difficulty: 'Medium',
    estimatedTime: '4-6 minutes',
    componentType: 'memory-challenge',
    config: {
      symbols: ['pentagram', 'skull', 'raven', 'moon', 'crystal', 'cauldron'],
      timeLimit: 60,
      interferenceRate: 12000
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'phantoms-puzzle',
    name: "Phantom's Puzzle",
    description: 'Progressive pattern memorization with ethereal themes',
    difficulty: 'Hard',
    estimatedTime: '5-8 minutes',
    componentType: 'pattern-memory',
    config: {
      levels: 7,
      startingTime: 8,
      timeDecrement: 0.5,
      patterns: ['orb', 'mist', 'chain', 'eye', 'flame', 'void', 'portal', 'star']
    },
    isActive: true,
    requiredTier: 'Pro'
  },
  {
    id: 'curse-crafting',
    name: 'Curse Crafting',
    description: 'Create supernatural curses by mixing mystical ingredients',
    difficulty: 'Medium',
    estimatedTime: '4-6 minutes',
    componentType: 'crafting-game',
    config: {
      ingredients: [
        'Easther of Wood Rossen', 'Sneaker Worn Sock Lint', 'Fairy Dust (Questionable)',
        'Dragon Breath Mints', 'Unicorn Hair (Synthetic)', 'Phoenix Feather (Plastic)',
        'Troll Tears (Crocodile)', 'Mermaid Scales (Fish)', 'Vampire Fang (Plastic)',
        'Werewolf Fur (Dog)', 'Ghost Ectoplasm (Slime)', 'Witch Brew (Coffee)',
        'Demon Horn (Foam)', 'Angel Wing (Feather)', 'Zombie Flesh (Tofu)',
        'Banshee Wail (Scream)', 'Kraken Ink (Squid)', 'Djinn Lamp (Brass)'
      ],
      maxIngredients: 3,
      totalIngredients: 8
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'wack-a-chupacabra',
    name: 'Wack-A-Chupacabra',
    description: 'Reflex game with cryptid targets and dangerous decoys',
    difficulty: 'Medium',
    estimatedTime: '3-5 minutes',
    componentType: 'whack-a-mole',
    config: {
      holes: 5,
      spawnRates: {
        chupacabra: 0.7,
        decoy: 0.2,
        poison: 0.1
      },
      spriteTime: 1200,
      points: { chupacabra: 1, decoy: -1, poison: 'gameOver' }
    },
    isActive: true,
    requiredTier: 'Basic'
  },
  {
    id: 'wretched-wiring',
    name: 'Wretched Wiring',
    description: 'Intentionally broken electrical repair simulation with no actual logic',
    difficulty: 'Impossible',
    estimatedTime: '5-10 minutes (or until you give up)',
    componentType: 'chaos-simulator',
    config: {
      wires: 12,
      terminals: 6,
      chupacabraTheftRate: 8000,
      drHeinousTauntRate: 7000,
      isBroken: true,
      winCondition: false
    },
    isActive: true,
    requiredTier: 'Premium'
  },
  {
    id: 'lab-escape',
    name: 'Lab Escape',
    description: 'Escape from Dr. Heinous laboratory by solving riddles',
    difficulty: 'Hard',
    estimatedTime: '7-10 minutes',
    componentType: 'puzzle-adventure',
    config: {
      doors: 3,
      riddles: 99,
      maxAttempts: 5,
      hintsAvailable: true
    },
    isActive: true,
    requiredTier: 'Pro'
  },
  {
    id: 'face-the-chupacabra',
    name: 'Face the Chupacabra',
    description: 'Final showdown with the legendary cryptid',
    difficulty: 'Expert',
    estimatedTime: '10-15 minutes',
    componentType: 'boss-battle',
    config: {
      phases: 3,
      attacks: ['claw', 'bite', 'roar', 'invisibility'],
      playerHealth: 100,
      bossHealth: 300
    },
    isActive: true,
    requiredTier: 'Premium'
  }
];

async function migrateSidequests() {
  console.log('🔄 Starting sidequest migration to Firebase...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const sidequest of sidequests) {
    try {
      const sidequestData = {
        ...sidequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await FirebaseService.saveSidequest(sidequest.id, sidequestData);
      console.log(`✅ Migrated: ${sidequest.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${sidequest.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📱 Total: ${sidequests.length}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All sidequests migrated successfully to Firebase!');
    console.log('🔥 Sidequests are now stored in Firebase and can be dynamically loaded.');
  } else {
    console.log('\n⚠️ Some sidequests failed to migrate. Check Firebase configuration.');
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSidequests()
    .then(() => {
      console.log('Migration completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateSidequests, sidequests };