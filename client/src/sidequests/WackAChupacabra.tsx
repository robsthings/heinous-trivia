import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';

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
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    currentHole: null,
    currentSprite: null,
    isPlaying: false
  });

  const [spriteVisible, setSpriteVisible] = useState(false);

  const getRandomSprite = (): 'chupacabra' | 'decoy' | 'vial' => {
    const rand = Math.random();
    if (rand < 0.7) return 'chupacabra'; // 70% chance
    if (rand < 0.9) return 'decoy'; // 20% chance (0.7-0.9)
    return 'vial'; // 10% chance (0.9-1.0)
  };

  const getRandomHole = (): number => {
    return Math.floor(Math.random() * 5); // 0-4 for 5 holes
  };

  const spawnSprite = useCallback(() => {
    if (gameState.isGameOver || !gameState.isPlaying) return;

    const newHole = getRandomHole();
    const newSprite = getRandomSprite();

    setGameState(prev => ({
      ...prev,
      currentHole: newHole,
      currentSprite: newSprite
    }));
    setSpriteVisible(true);

    // Hide sprite after duration
    setTimeout(() => {
      setSpriteVisible(false);
      setGameState(prev => ({
        ...prev,
        currentHole: null,
        currentSprite: null
      }));

      // Schedule next spawn
      setTimeout(() => {
        spawnSprite();
      }, SPAWN_DELAY);
    }, SPRITE_DURATION);
  }, [gameState.isGameOver, gameState.isPlaying]);

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
    
    // Start first spawn after a short delay
    setTimeout(() => {
      spawnSprite();
    }, 1000);
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/sidequests/wack-a-chupacabra/wack-bg.png)' }}
      />

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Green goo splash effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/sidequests/wack-a-chupacabra/wack-splash.png)' }}
          />
          <div className="absolute inset-0 bg-green-500 bg-opacity-30" />
          
          {/* Game Over UI */}
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              GAME OVER!
            </h2>
            <p className="text-xl text-white mb-6 drop-shadow-lg">
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
                href="/sidequests"
                className="block px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Return to Side Quests
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
          <div className="text-lg text-white drop-shadow-lg">
            Wack-A-Chupacabra
          </div>
        </div>

        {/* Game Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                Wack-A-Chupacabra
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
            <div className="grid grid-cols-3 grid-rows-2 gap-6 md:gap-8 place-items-center">
              {Array.from({ length: 5 }, (_, index) => {
                // Position holes: top row has 2 holes (indices 0,1), bottom row has 3 holes (indices 2,3,4)
                const isTopRow = index < 2;
                const gridPosition = isTopRow 
                  ? `col-start-${index + 1} col-span-1 row-start-1`
                  : `col-start-${index - 1} col-span-1 row-start-2`;
                
                return (
                  <div
                    key={index}
                    className={`relative cursor-pointer ${isTopRow ? 'col-start-' + (index + 1) : 'col-start-' + (index - 1)}`}
                    style={{
                      gridColumn: isTopRow ? `${index + 1} / span 1` : `${index - 1} / span 1`,
                      gridRow: isTopRow ? '1' : '2'
                    }}
                    onClick={() => handleHoleClick(index)}
                  >
                    {/* Hole */}
                    <img
                      src="/sidequests/wack-a-chupacabra/wack-hole.png"
                      alt={`Hole ${index + 1}`}
                      className="w-20 h-20 md:w-24 md:h-24 block"
                    />
                    
                    {/* Sprite */}
                    {gameState.currentHole === index && gameState.currentSprite && spriteVisible && (
                      <img
                        src={getSpriteImagePath(gameState.currentSprite)}
                        alt={gameState.currentSprite}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 animate-bounce pointer-events-none"
                      />
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
              href="/sidequests"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
            >
              ← Back to Side Quests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}