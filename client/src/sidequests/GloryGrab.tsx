import React, { useState, useEffect, useRef } from 'react';

interface Vial {
  id: string;
  x: number;
  y: number;
  timeLeft: number;
  maxTime: number;
  type: 'normal' | 'decoy' | 'glowing' | 'exploding';
  points: number;
  vialNumber: number;
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
    
    const vialSize = 112; // 7rem = 112px (75% larger than original 4rem = 64px)
    const newVial: Vial = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (rect.width - vialSize) + vialSize/2,
      y: Math.random() * (rect.height - vialSize - 120) + 120, // Account for header space
      timeLeft: vialType.lifetime,
      maxTime: vialType.lifetime,
      type: vialType.type,
      points: vialType.points,
      vialNumber: Math.ceil(Math.random() * 4)
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

  const getVialImagePath = (vial: Vial) => {
    const progress = vial.timeLeft / vial.maxTime;
    
    if (vial.type === 'decoy') {
      return `/sidequests/glory-grab/vial-empty.png`;
    }
    
    // All vials start as normal and progress through states based on time remaining
    if (progress > 0.6) {
      return `/sidequests/glory-grab/vial-${vial.vialNumber}-normal.png`;
    } else if (progress > 0.3) {
      return `/sidequests/glory-grab/vial-${vial.vialNumber}-glowing.png`;
    } else {
      return `/sidequests/glory-grab/vial-${vial.vialNumber}-exploding.png`;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/sidequests/glory-grab/glory-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4
      }} />

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '1.5rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 'bold',
          color: '#f59e0b',
          marginBottom: '0.5rem',
          textShadow: '0 0 20px #f59e0b',
          fontFamily: 'Creepster, cursive'
        }}>
          GLORY GRAB
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
          color: '#d1d5db'
        }}>
          Collect laboratory vials before they explode!
        </p>
      </div>

      {/* Game Stats */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
          fontWeight: 'bold',
          color: '#10b981'
        }}>
          Score: {gameState.score}
        </div>
        <div style={{
          fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
          fontWeight: 'bold',
          color: '#3b82f6'
        }}>
          Time: {gameState.timeLeft}s
        </div>
        <div style={{
          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
          color: '#a855f7'
        }}>
          Chaos Level: {gameState.chaosLevel}
        </div>
      </div>

      {/* Dr. Heinous */}
      <div style={{
        position: 'absolute',
        top: '5rem',
        right: '2rem',
        zIndex: 20
      }}>
        <img 
          src="/heinous/scheming.png" 
          alt="Dr. Heinous"
          style={{
            width: 'clamp(4rem, 10vw, 5rem)',
            height: 'clamp(4rem, 10vw, 5rem)'
          }}
        />
        {gameState.message && (
          <div style={{
            position: 'absolute',
            left: '-12rem',
            top: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#f59e0b',
            fontSize: '0.875rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #f59e0b',
            maxWidth: '12rem',
            wordWrap: 'break-word'
          }}>
            {gameState.message}
          </div>
        )}
      </div>

      {/* Game Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        zIndex: 10,
        margin: '1rem',
        minHeight: '400px'
      }}>
        <div 
          ref={gameAreaRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 5
          }}
        >
          {/* Vials */}
          {gameState.vials.map(vial => (
            <div
              key={vial.id}
              style={{
                position: 'absolute',
                width: 'clamp(5.25rem, 14vw, 7rem)',
                height: 'clamp(5.25rem, 14vw, 7rem)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                left: vial.x,
                top: vial.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => collectVial(vial.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              }}
            >
              {/* Vial Image */}
              <img
                src={getVialImagePath(vial)}
                alt={`${vial.type} vial`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: vial.timeLeft / vial.maxTime < 0.3 ? 'brightness(1.5) contrast(1.2)' : 'none',
                  animation: vial.timeLeft / vial.maxTime < 0.3 ? 'pulse 0.5s infinite' : 'none'
                }}
              />
              
              {/* Countdown indicator */}
              <div style={{
                position: 'absolute',
                bottom: '-0.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3rem',
                height: '0.25rem',
                backgroundColor: '#4b5563',
                borderRadius: '0.25rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#ef4444',
                  transition: 'all 0.1s ease',
                  width: `${(vial.timeLeft / vial.maxTime) * 100}%`
                }} />
              </div>
            </div>
          ))}

          {/* Game Over/Start Screen */}
          {(!gameState.isPlaying && !gameState.isGameOver) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                  color: '#f59e0b',
                  marginBottom: '1.5rem'
                }}>
                  Ready to start collecting?
                </h2>
                <button
                  onClick={startGame}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #d97706, #92400e)',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                    borderRadius: '0.5rem',
                    border: '2px solid #f59e0b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #d97706)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #d97706, #92400e)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  START GAME
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState.isGameOver && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{
                  fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
                  color: '#f59e0b',
                  marginBottom: '1rem'
                }}>
                  Laboratory Session Complete!
                </h2>
                <p style={{
                  fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
                  color: '#10b981',
                  marginBottom: '0.5rem'
                }}>
                  Final Score: {gameState.score}
                </p>
                <p style={{
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  color: '#a855f7',
                  marginBottom: '1.5rem'
                }}>
                  Chaos Level Reached: {gameState.chaosLevel}
                </p>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={playAgain}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(to right, #059669, #047857)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      borderRadius: '0.5rem',
                      border: '2px solid #10b981',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    INCREASE CHAOS ({gameState.chaosLevel + 1})
                  </button>
                  
                  <button
                    onClick={() => window.history.back()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      borderRadius: '0.5rem',
                      border: '2px solid #a855f7',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #7c3aed)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Return to Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}