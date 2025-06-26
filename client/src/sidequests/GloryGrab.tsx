import React, { useState, useEffect, useRef } from 'react';

interface Vial {
  id: string;
  x: number;
  y: number;
  timeLeft: number;
  maxTime: number;
  type: 'normal' | 'decoy' | 'glowing' | 'exploding';
  points: number;
}

interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  isGameOver: boolean;
  chaosLevel: number;
  vials: Vial[];
  message: string;
}

const VIAL_TYPES = [
  { type: 'normal' as const, probability: 0.6, points: 10, lifetime: 3000 },
  { type: 'glowing' as const, probability: 0.2, points: 25, lifetime: 2500 },
  { type: 'exploding' as const, probability: 0.15, points: 50, lifetime: 1500 },
  { type: 'decoy' as const, probability: 0.05, points: 0, lifetime: 4000 }
];

const HEINOUS_REACTIONS = {
  collect: [
    "Impressive reflexes, worm!",
    "The laboratory thanks you!",
    "Efficient collection, minion!",
    "Your greed serves science!"
  ],
  explode: [
    "MELTDOWN! My laboratory!",
    "That was EXPENSIVE equipment!",
    "Clean that up immediately!",
    "Science demands sacrifice!"
  ],
  decoy: [
    "You fool! That was empty!",
    "Worthless specimen detected!",
    "Your incompetence astounds me!",
    "Try harder, lab rat!"
  ],
  chaos: [
    "MORE CHAOS! I LOVE IT!",
    "The experiment intensifies!",
    "Beautiful destruction!",
    "MAXIMUM CHAOS ACHIEVED!"
  ]
};

function getRandomVialType(chaosLevel: number) {
  const random = Math.random();
  let cumulative = 0;
  
  for (const vialType of VIAL_TYPES) {
    const adjustedProb = vialType.type === 'exploding' ? 
      vialType.probability * (1 + chaosLevel * 0.2) : 
      vialType.probability;
    
    cumulative += adjustedProb;
    if (random < cumulative) return vialType;
  }
  
  return VIAL_TYPES[0];
}

function getRandomReaction(category: keyof typeof HEINOUS_REACTIONS): string {
  const reactions = HEINOUS_REACTIONS[category];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

export function GloryGrab() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 20,
    isPlaying: false,
    isGameOver: false,
    chaosLevel: 1,
    vials: [],
    message: ''
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const spawnRef = useRef<NodeJS.Timeout>();

  const spawnVial = () => {
    if (!gameAreaRef.current || !gameState.isPlaying) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const vialType = getRandomVialType(gameState.chaosLevel);
    
    const newVial: Vial = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (rect.width - 80) + 40,
      y: Math.random() * (rect.height - 80) + 40,
      timeLeft: vialType.lifetime,
      maxTime: vialType.lifetime,
      type: vialType.type,
      points: vialType.points
    };

    setGameState(prev => ({
      ...prev,
      vials: [...prev.vials, newVial]
    }));
  };

  const collectVial = (vialId: string) => {
    setGameState(prev => {
      const vial = prev.vials.find(v => v.id === vialId);
      if (!vial) return prev;

      let newScore = prev.score;
      let message = '';

      switch (vial.type) {
        case 'normal':
        case 'glowing':
        case 'exploding':
          newScore += vial.points;
          message = getRandomReaction('collect');
          break;
        case 'decoy':
          message = getRandomReaction('decoy');
          break;
      }

      return {
        ...prev,
        score: newScore,
        vials: prev.vials.filter(v => v.id !== vialId),
        message
      };
    });

    setTimeout(() => setGameState(prev => ({ ...prev, message: '' })), 2000);
  };

  const explodeVial = (vialId: string) => {
    setGameState(prev => {
      const message = getRandomReaction('explode');
      return {
        ...prev,
        vials: prev.vials.filter(v => v.id !== vialId),
        message
      };
    });

    setTimeout(() => setGameState(prev => ({ ...prev, message: '' })), 2000);
  };

  const startGame = () => {
    setGameState({
      score: 0,
      timeLeft: 20,
      isPlaying: true,
      isGameOver: false,
      chaosLevel: 1,
      vials: [],
      message: 'Collect the vials before they explode!'
    });
  };

  const playAgain = () => {
    setGameState(prev => ({
      ...prev,
      chaosLevel: Math.min(prev.chaosLevel + 1, 5),
      message: prev.chaosLevel >= 3 ? getRandomReaction('chaos') : ''
    }));
    
    setTimeout(() => startGame(), 1000);
  };

  // Game timer
  useEffect(() => {
    if (!gameState.isPlaying) return;

    intervalRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return {
            ...prev,
            timeLeft: 0,
            isPlaying: false,
            isGameOver: true,
            message: `Final Score: ${prev.score} points!`
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState.isPlaying]);

  // Vial spawning
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const spawnRate = Math.max(800, 1500 - (gameState.chaosLevel - 1) * 200);
    const maxVials = Math.min(8 + gameState.chaosLevel * 3, 20);

    spawnRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.vials.length < maxVials) {
          const vialsToSpawn = gameState.chaosLevel >= 3 ? 
            Math.floor(Math.random() * 2) + 1 : 1;
          
          for (let i = 0; i < vialsToSpawn; i++) {
            setTimeout(() => spawnVial(), i * 200);
          }
        }
        return prev;
      });
    }, spawnRate);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState.isPlaying, gameState.chaosLevel]);

  // Vial countdown
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const countdown = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        vials: prev.vials.filter(vial => {
          if (vial.timeLeft <= 100) {
            if (vial.type !== 'decoy') {
              explodeVial(vial.id);
            }
            return false;
          }
          return true;
        }).map(vial => ({
          ...vial,
          timeLeft: vial.timeLeft - 100
        }))
      }));
    }, 100);

    return () => clearInterval(countdown);
  }, [gameState.isPlaying]);

  const getVialColor = (vial: Vial) => {
    const progress = vial.timeLeft / vial.maxTime;
    
    switch (vial.type) {
      case 'normal':
        return progress > 0.3 ? '#10b981' : '#ef4444';
      case 'glowing':
        return progress > 0.3 ? '#3b82f6' : '#ef4444';
      case 'exploding':
        return progress > 0.3 ? '#f59e0b' : '#dc2626';
      case 'decoy':
        return '#6b7280';
      default:
        return '#10b981';
    }
  };

  const getVialGlow = (vial: Vial) => {
    if (vial.type === 'glowing') return '0 0 20px #3b82f6';
    if (vial.type === 'exploding') return '0 0 15px #f59e0b';
    if (vial.timeLeft / vial.maxTime < 0.3) return '0 0 10px #ef4444';
    return 'none';
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Creepster', cursive"
      }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/backgrounds/lab-dark-blue.png)' }}
      />

      {/* Header */}
      <div className="relative z-10 text-center py-6">
        <h1 
          className="text-4xl md:text-6xl font-bold text-amber-400 mb-2"
          style={{ textShadow: '0 0 20px #f59e0b' }}
        >
          GLORY GRAB
        </h1>
        <p className="text-lg text-gray-300">
          Collect laboratory vials before they explode!
        </p>
      </div>

      {/* Game Stats */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-bold text-green-400">
          Score: {gameState.score}
        </div>
        <div className="text-2xl font-bold text-blue-400">
          Time: {gameState.timeLeft}s
        </div>
        <div className="text-lg text-purple-400">
          Chaos Level: {gameState.chaosLevel}
        </div>
      </div>

      {/* Dr. Heinous */}
      <div className="absolute top-20 right-8 z-20">
        <img 
          src="/heinous/scheming.png" 
          alt="Dr. Heinous" 
          className="w-16 h-16 md:w-20 md:h-20"
        />
        {gameState.message && (
          <div className="absolute -left-48 top-2 bg-black bg-opacity-80 text-amber-400 text-sm px-3 py-2 rounded-lg border border-amber-400 max-w-48">
            {gameState.message}
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 relative z-10 mx-4 my-4">
        <div 
          ref={gameAreaRef}
          className="w-full h-full relative border-2 border-amber-400 rounded-lg bg-black bg-opacity-30"
          style={{ minHeight: '400px' }}
        >
          {/* Vials */}
          {gameState.vials.map(vial => (
            <div
              key={vial.id}
              className="absolute w-16 h-16 cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: vial.x,
                top: vial.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => collectVial(vial.id)}
            >
              {/* Vial container */}
              <div
                className="w-full h-full rounded-full border-4 flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor: getVialColor(vial),
                  borderColor: getVialColor(vial),
                  boxShadow: getVialGlow(vial),
                  animation: vial.timeLeft / vial.maxTime < 0.3 ? 'pulse 0.5s infinite' : 'none'
                }}
              >
                {vial.type === 'decoy' ? '?' : vial.points}
              </div>
              
              {/* Countdown indicator */}
              <div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-red-500 transition-all duration-100"
                  style={{ width: `${(vial.timeLeft / vial.maxTime) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Game Over/Start Screen */}
          {(!gameState.isPlaying && !gameState.isGameOver) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <h2 className="text-3xl text-amber-400 mb-6">Ready to start collecting?</h2>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold text-xl rounded-lg border-2 border-amber-400 hover:from-amber-500 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
                >
                  START GAME
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState.isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="text-center">
                <h2 className="text-4xl text-amber-400 mb-4">Laboratory Session Complete!</h2>
                <p className="text-2xl text-green-400 mb-2">Final Score: {gameState.score}</p>
                <p className="text-lg text-purple-400 mb-6">Chaos Level Reached: {gameState.chaosLevel}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={playAgain}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg border-2 border-green-400 hover:from-green-500 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                  >
                    INCREASE CHAOS ({gameState.chaosLevel + 1})
                  </button>
                  
                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Return to Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}