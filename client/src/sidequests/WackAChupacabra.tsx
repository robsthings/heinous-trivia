import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
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
  const [location] = useLocation();
  const hauntId = new URLSearchParams(window.location.search).get('haunt') || 'headquarters';
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    currentHole: null,
    currentSprite: null,
    isPlaying: false
  });

  const { data: assets = {} } = useSidequestAssets('wack-a-chupacabra');

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
        return '/chupacabra/chupacabra-1.png';
      case 'decoy':
        return '/chupacabra/chupacabra-2.png';
      case 'vial':
        return '/heinous/gift.png';
      default:
        return '';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: assets['wack-bg'] ? `url(${assets['wack-bg']})` : 'url(/backgrounds/lab-dark-blue.png)'
        }}
      />

      {/* Moon with Haunt Logo Overlay */}
      <div className="fixed z-5 pointer-events-none" 
           style={{
             top: 'clamp(2rem, 8vh, 4rem)',
             right: 'clamp(1rem, 8vw, 3rem)',
             width: 'clamp(9rem, 22.5vw, 15rem)',
             height: 'clamp(9rem, 22.5vw, 15rem)'
           }}>
        {/* Moon Background */}
        <img 
          src="/heinous/presenting.png" 
          alt="Moon"
          className="w-full h-full object-contain"
        />
        
        {/* Haunt Logo Overlay */}
        {hauntConfig?.logoPath && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={hauntConfig.logoPath} 
              alt="Haunt Logo"
              className="w-3/4 h-3/4 object-contain opacity-80 filter grayscale"
            />
          </div>
        )}
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Green goo splash effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/backgrounds/lab-dark-blue.png)' }}
          />
          <div className="absolute inset-0 bg-green-500 bg-opacity-30" />
          
          {/* Game Over UI */}
          <div className="relative z-10 " style={{textAlign: "center"}}>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              GAME OVER!
            </h2>
            <p className="text-xl text-white  drop-shadow-lg" style={{marginBottom: "1.5rem"}}>
              You hit the poison vial!
            </p>
            <p className="text-lg text-white mb-8 drop-shadow-lg">
              Final Score: {gameState.score}
            </p>
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/game"
                className="block px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Score Display */}
        <div className="flex justify-between items-center p-6">
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Score: {gameState.score}
          </div>
          <div className="text-lg text-white drop-shadow-lg" style={{ fontFamily: 'Frijole, cursive' }}>
            WACK-A-CHUPACABRA
          </div>
        </div>
        


        {/* Game Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="flex-1 flex items-center justify-center">
            <div style={{textAlign: "center"}}>
              <h1 className="text-4xl font-bold text-white  drop-shadow-lg" style={{marginBottom: "1.5rem", fontFamily: 'Frijole, cursive'}}>
                WACK-A-CHUPACABRA
              </h1>
              <p className="text-lg text-white mb-8 drop-shadow-lg max-w-md">
                Hit the Chupacabras (+1 point), avoid decoys (-1 point), and DON'T hit the poison vials!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg transition-colors duration-200 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Area - Holes Grid */}
        {gameState.isPlaying && (
          <div className="flex-1 flex items-end justify-center pb-20">
            <div className="grid grid-cols-3 grid-rows-2 gap-6 md:gap-8 place-items-center max-w-md mx-auto">
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
                    className="relative cursor-pointer"
                    style={{
                      gridColumn: `${gridColumnStart} / span 1`,
                      gridRow: gridRowStart
                    }}
                    onClick={() => handleHoleClick(index)}
                  >
                    {/* Hole */}
                    <img
                      src="/heinous/neutral.png"
                      alt={`Hole ${index + 1}`}
                      className="w-30 h-30 md:w-36 md:h-36 block"
                    />
                    
                    {/* Sprite */}
                    {gameState.currentHole === index && gameState.currentSprite && spriteVisible && (
                      <div className="absolute -top-1 left-0 right-0 flex justify-center pointer-events-none z-10">
                        <img
                          src={getSpriteImagePath(gameState.currentSprite)}
                          alt={gameState.currentSprite}
                          className="w-18 h-18 md:w-24 md:h-24 animate-bounce"
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
          <div className="absolute bottom-6 left-6">
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
    </div>
  );
}