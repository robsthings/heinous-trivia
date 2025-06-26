import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface GameState {
  score: number;
  isGameOver: boolean;
  currentHole: number | null;
  currentSprite: 'chupacabra' | 'decoy' | 'vial' | null;
  isPlaying: boolean;
}

const SPRITE_DURATION = 1200; // 1.2 seconds
const SPAWN_DELAY = 800; // Delay between spawns

export function WackAChupacabra() {
  const hauntId = new URLSearchParams(window.location.search).get('haunt') || 'headquarters';
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    currentHole: null,
    currentSprite: null,
    isPlaying: false
  });

  const [spriteVisible, setSpriteVisible] = useState(false);
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch haunt configuration for logo
  const { data: hauntConfig } = useQuery({
    queryKey: ['/api/haunt-config', hauntId],
    queryFn: () => fetch(`/api/haunt-config/${hauntId}`).then(res => res.json()),
    enabled: !!hauntId
  });

  const getRandomSprite = (): 'chupacabra' | 'decoy' | 'vial' => {
    const rand = Math.random();
    if (rand < 0.7) return 'chupacabra'; // 70% chance
    if (rand < 0.9) return 'decoy'; // 20% chance (0.7-0.9)
    return 'vial'; // 10% chance (0.9-1.0)
  };

  const getRandomHole = (): number => {
    return Math.floor(Math.random() * 5); // 0-4 for 5 holes
  };

  const spawnNextSprite = () => {
    if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    const newHole = getRandomHole();
    const newSprite = getRandomSprite();
    


    setGameState(prev => ({
      ...prev,
      currentHole: newHole,
      currentSprite: newSprite
    }));
    setSpriteVisible(true);

    // Hide sprite after duration
    hideTimeoutRef.current = setTimeout(() => {
      setSpriteVisible(false);
      setGameState(prev => ({
        ...prev,
        currentHole: null,
        currentSprite: null
      }));

      // Schedule next spawn
      gameTimeoutRef.current = setTimeout(() => {
        spawnNextSprite();
      }, SPAWN_DELAY);
    }, SPRITE_DURATION);
  };

  // Start spawning when game begins
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      console.log('Starting sprite spawning');
      gameTimeoutRef.current = setTimeout(() => {
        spawnNextSprite();
      }, 1000);
    } else {
      // Clean up timeouts when game stops
      if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }

    return () => {
      if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [gameState.isPlaying, gameState.isGameOver]);

  const handleHoleClick = (holeIndex: number) => {
    if (!gameState.isPlaying || gameState.isGameOver || !spriteVisible) return;
    if (gameState.currentHole !== holeIndex || !gameState.currentSprite) return;

    const sprite = gameState.currentSprite;

    if (sprite === 'vial') {
      // Game over immediately
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isPlaying: false
      }));
      setSpriteVisible(false);
      return;
    }

    // Update score based on sprite type
    const scoreChange = sprite === 'chupacabra' ? 1 : -1;
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, prev.score + scoreChange), // Don't go below 0
      currentHole: null,
      currentSprite: null
    }));
    setSpriteVisible(false);
  };

  const startGame = () => {
    setGameState({
      score: 0,
      isGameOver: false,
      currentHole: null,
      currentSprite: null,
      isPlaying: true
    });
    setSpriteVisible(false);
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      isGameOver: false,
      currentHole: null,
      currentSprite: null,
      isPlaying: false
    });
    setSpriteVisible(false);
  };

  const getSpriteImagePath = (sprite: string): string => {
    switch (sprite) {
      case 'chupacabra':
        return '/sidequests/wack-a-chupacabra/wack-chupacabra.png';
      case 'decoy':
        return '/sidequests/wack-a-chupacabra/wack-decoy.png';
      case 'vial':
        return '/sidequests/wack-a-chupacabra/wack-vial.png';
      default:
        return '';
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/sidequests/wack-a-chupacabra/wack-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Moon with Haunt Logo Overlay */}
      <div style={{
        position: 'fixed',
        zIndex: 5,
        pointerEvents: 'none',
        top: 'clamp(2rem, 8vh, 4rem)',
        right: 'clamp(1rem, 8vw, 3rem)',
        width: 'clamp(9rem, 22.5vw, 15rem)',
        height: 'clamp(9rem, 22.5vw, 15rem)'
      }}>
        {/* Moon Background */}
        <img 
          src="/sidequests/wack-a-chupacabra/wack-moon.png" 
          alt="Moon"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        
        {/* Haunt Logo Overlay */}
        {hauntConfig?.logoPath && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={hauntConfig.logoPath} 
              alt="Haunt Logo"
              style={{
                width: '75%',
                height: '75%',
                objectFit: 'contain',
                opacity: 0.8,
                filter: 'grayscale(100%)'
              }}
            />
          </div>
        )}
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Green goo splash effect */}
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(/sidequests/wack-a-chupacabra/wack-splash.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(34, 197, 94, 0.3)'
          }} />
          
          {/* Game Over UI */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 8vw, 2.5rem)',
              fontFamily: 'Creepster, cursive',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>
              GAME OVER!
            </h2>
            <p style={{
              fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>
              You hit the poison vial!
            </p>
            <p style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              color: '#ffffff',
              marginBottom: '2rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>
              Final Score: {gameState.score}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <button
                onClick={resetGame}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Try Again
              </button>
              <Link
                href="/game"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(to right, #4b5563, #374151)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #6b7280, #4b5563)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #374151)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Score Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
          }}>
            Score: {gameState.score}
          </div>
          <div style={{
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            fontFamily: 'Frijole, cursive'
          }}>
            WACK-A-CHUPACABRA
          </div>
        </div>

        {/* Game Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{textAlign: 'center'}}>
              <h1 style={{
                fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                fontFamily: 'Creepster, cursive',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
              }}>
                WACK-A-CHUPACABRA
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: '#ffffff',
                marginBottom: '2rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                maxWidth: '28rem'
              }}>
                Hit the Chupacabras (+1 point), avoid decoys (-1 point), and DON'T hit the poison vials!
              </p>
              <button
                onClick={startGame}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(to right, #16a34a, #15803d)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: 'clamp(1.1rem, 4vw, 1.25rem)',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #166534)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Area - Holes Grid */}
        {gameState.isPlaying && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '5rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 'clamp(1rem, 4vw, 2rem)',
              placeItems: 'center',
              maxWidth: '28rem',
              margin: '0 auto'
            }}>
              {Array.from({ length: 5 }, (_, index) => {
                // Position holes: top row has 2 holes centered (indices 0,1), bottom row has 3 holes (indices 2,3,4)
                let gridColumnStart;
                let gridRowStart;
                
                if (index < 2) {
                  // Top row: center 2 holes by starting at column 1 and 3 (skipping middle column)
                  gridColumnStart = index === 0 ? 1 : 3;
                  gridRowStart = 1;
                } else {
                  // Bottom row: 3 holes across all columns
                  gridColumnStart = index - 2 + 1; // Maps 2,3,4 to 1,2,3
                  gridRowStart = 2;
                }
                
                return (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      gridColumn: `${gridColumnStart} / span 1`,
                      gridRow: gridRowStart
                    }}
                    onClick={() => handleHoleClick(index)}
                  >
                    {/* Hole */}
                    <img
                      src="/sidequests/wack-a-chupacabra/wack-hole.png"
                      alt={`Hole ${index + 1}`}
                      style={{
                        width: 'clamp(5rem, 15vw, 9rem)',
                        height: 'clamp(5rem, 15vw, 9rem)',
                        display: 'block'
                      }}
                    />
                    
                    {/* Sprite */}
                    {gameState.currentHole === index && gameState.currentSprite && spriteVisible && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-0.25rem',
                          left: 0,
                          right: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          pointerEvents: 'auto',
                          zIndex: 10,
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHoleClick(index);
                        }}
                      >
                        <img
                          src={getSpriteImagePath(gameState.currentSprite)}
                          alt={gameState.currentSprite}
                          style={{
                            width: 'clamp(4.5rem, 12vw, 6rem)',
                            height: 'clamp(4.5rem, 12vw, 6rem)',
                            animation: 'bounce 1s infinite',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem'
          }}>
            <Link
              href="/game"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(to right, #374151, #4b5563)',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transform: 'scale(1)',
                transition: 'all 0.2s ease',
                border: '1px solid #6b7280',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #6b7280)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #374151, #4b5563)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ← Return to Game
            </Link>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -30px, 0);
          }
          70% {
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0, -4px, 0);
          }
        }
      `}</style>
    </div>
  );
}