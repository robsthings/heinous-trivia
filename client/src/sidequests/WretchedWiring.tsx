import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';

interface GameState {
  isPlaying: boolean;
  showCertificate: boolean;
  currentTaunt: string | null;
  wires: Wire[];
  chupacabraVisible: boolean;
  chupacabraMessage: string | null;
}

interface Wire {
  id: string;
  color: 'red' | 'blue';
  assetName: string;
  position: { x: number; y: number };
  rotation: number;
  isDragging: boolean;
  isStolen: boolean;
}

const HEINOUS_TAUNTS = [
  "This is why we can't have nice things.",
  "Smells like burnt toast.",
  "So close. To what? Unknown.",
  "Chupacabra has been chewing on wires again!",
  "Did you try turning it off and on again?",
  "I've seen toasters with better wiring.",
  "Even my grandmother could do better!",
  "The sparks are supposed to be INSIDE the box!",
  "Perhaps engineering isn't your calling.",
  "At least the fire department gets exercise."
];

const CHUPACABRA_MESSAGES = [
  "I'm sure we won't need that.",
  "This looks tasty!",
  "Copper is my favorite flavor.",
  "Nom nom nom... wire snacks!",
  "Don't mind me, just tidying up."
];

const INITIAL_GAME_STATE: GameState = {
  isPlaying: false,
  showCertificate: false,
  currentTaunt: null,
  wires: [],
  chupacabraVisible: false,
  chupacabraMessage: null
};

export function WretchedWiring() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [draggedWire, setDraggedWire] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<number>(0);

  // Initialize random wires
  const initializeWires = () => {
    const wireAssets = [
      'wire-red-1.png', 'wire-red-2.png', 'wire-red-3.png',
      'wire-blue-1.png', 'wire-blue-2.png', 'wire-blue-3.png'
    ];

    const shuffled = wireAssets.sort(() => Math.random() - 0.5);
    const selectedWires = shuffled.slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 wires

    const wires: Wire[] = selectedWires.map((asset, index) => ({
      id: `wire-${index}`,
      color: asset.includes('red') ? 'red' : 'blue',
      assetName: asset,
      position: {
        x: Math.random() * (window.innerWidth - 200) + 100,
        y: Math.random() * (window.innerHeight - 300) + 200
      },
      rotation: Math.floor(Math.random() * 4) * 90,
      isDragging: false,
      isStolen: false
    }));

    setGameState(prev => ({ ...prev, wires }));
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    initializeWires();
  };

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_GAME_STATE);
    timerRef.current = 0;
  };

  // Show certificate
  const giveUp = () => {
    setGameState(prev => ({ ...prev, showCertificate: true }));
  };

  // Handle wire rotation
  const rotateWire = (wireId: string) => {
    setGameState(prev => ({
      ...prev,
      wires: prev.wires.map(wire =>
        wire.id === wireId
          ? { ...wire, rotation: (wire.rotation + 90) % 360 }
          : wire
      )
    }));
  };

  // Handle wire drag start
  const handleDragStart = (wireId: string, event: React.MouseEvent | React.TouchEvent) => {
    const wire = gameState.wires.find(w => w.id === wireId);
    if (!wire || wire.isStolen) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    setDraggedWire(wireId);
    setDragOffset({
      x: clientX - wire.position.x,
      y: clientY - wire.position.y
    });

    setGameState(prev => ({
      ...prev,
      wires: prev.wires.map(w =>
        w.id === wireId ? { ...w, isDragging: true } : w
      )
    }));
  };

  // Handle wire drag
  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!draggedWire) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    setGameState(prev => ({
      ...prev,
      wires: prev.wires.map(wire =>
        wire.id === draggedWire
          ? {
              ...wire,
              position: {
                x: clientX - dragOffset.x,
                y: clientY - dragOffset.y
              }
            }
          : wire
      )
    }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedWire(null);
    setGameState(prev => ({
      ...prev,
      wires: prev.wires.map(w => ({ ...w, isDragging: false }))
    }));
  };

  // Chupacabra steals wire
  const stealWire = () => {
    const availableWires = gameState.wires.filter(w => !w.isStolen);
    if (availableWires.length === 0) return;

    const randomWire = availableWires[Math.floor(Math.random() * availableWires.length)];
    const randomMessage = CHUPACABRA_MESSAGES[Math.floor(Math.random() * CHUPACABRA_MESSAGES.length)];

    setGameState(prev => ({
      ...prev,
      chupacabraVisible: true,
      chupacabraMessage: randomMessage,
      wires: prev.wires.map(w =>
        w.id === randomWire.id ? { ...w, isStolen: true } : w
      )
    }));

    // Hide chupacabra after animation
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        chupacabraVisible: false,
        chupacabraMessage: null
      }));
    }, 3000);
  };

  // Show random taunts
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const tauntInterval = setInterval(() => {
      const randomTaunt = HEINOUS_TAUNTS[Math.floor(Math.random() * HEINOUS_TAUNTS.length)];
      setGameState(prev => ({ ...prev, currentTaunt: randomTaunt }));

      setTimeout(() => {
        setGameState(prev => ({ ...prev, currentTaunt: null }));
      }, 4000);
    }, Math.random() * 4000 + 6000); // 6-10 seconds

    return () => clearInterval(tauntInterval);
  }, [gameState.isPlaying]);

  // Chupacabra events
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const chupacabraInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        stealWire();
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(chupacabraInterval);
  }, [gameState.isPlaying, gameState.wires]);

  // Fake timer animation
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const animateTimer = () => {
      timerRef.current = (timerRef.current + 1) % 360;
      requestAnimationFrame(animateTimer);
    };

    animateTimer();
  }, [gameState.isPlaying]);

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDrag}
      onTouchEnd={handleDragEnd}
    >
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/sidequests/wretched-wiring/wretched-wiring-bg.png)' }}
      />

      {/* Certificate Screen */}
      {gameState.showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative">
            <img 
              src="/sidequests/wretched-wiring/certificate.png" 
              alt="Certificate of Giving Up"
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/game"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg inline-block"
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game Start Screen */}
      {!gameState.isPlaying && !gameState.showCertificate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center bg-gray-800 bg-opacity-95 p-8 rounded-xl border-2 border-yellow-500 max-w-md">
            <h1 className="text-4xl font-bold text-yellow-400 mb-6 drop-shadow-lg" style={{ fontFamily: 'Courier, monospace' }}>
              WRETCHED WIRING
            </h1>
            <p className="text-lg text-white mb-8 drop-shadow-lg">
              "Fix" the electrical system by connecting wires to terminals. 
              Nothing will actually work, but at least you'll look busy!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg text-xl"
            >
              Start "Fixing"
            </button>
            <div className="mt-4">
              <Link
                href="/game"
                className="text-gray-400 hover:text-white underline"
              >
                ← Back to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Nodes */}
      {gameState.isPlaying && (
        <>
          {/* Left Side Terminals */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-8">
            <img src="/sidequests/wretched-wiring/node-red-left.png" alt="Red Terminal Left" className="w-16 h-16" />
            <img src="/sidequests/wretched-wiring/node-blue-left.png" alt="Blue Terminal Left" className="w-16 h-16" />
          </div>

          {/* Right Side Terminals */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-8">
            <img src="/sidequests/wretched-wiring/node-red-right.png" alt="Red Terminal Right" className="w-16 h-16" />
            <img src="/sidequests/wretched-wiring/node-blue-right.png" alt="Blue Terminal Right" className="w-16 h-16" />
          </div>
        </>
      )}

      {/* Draggable Wires */}
      {gameState.isPlaying && gameState.wires.map(wire => (
        !wire.isStolen && (
          <div
            key={wire.id}
            className={`absolute cursor-pointer select-none z-30 transition-all duration-200 ${
              wire.isDragging ? 'scale-110 z-40' : 'hover:scale-105'
            }`}
            style={{
              left: wire.position.x,
              top: wire.position.y,
              transform: `rotate(${wire.rotation}deg)`,
              filter: wire.isDragging ? 'drop-shadow(0 0 10px rgba(255,255,0,0.5))' : 'none'
            }}
            onMouseDown={(e) => handleDragStart(wire.id, e)}
            onTouchStart={(e) => handleDragStart(wire.id, e)}
            onClick={() => rotateWire(wire.id)}
          >
            <img 
              src={`/sidequests/wretched-wiring/${wire.assetName}`} 
              alt={`${wire.color} wire`}
              className="w-20 h-20 pointer-events-none"
              draggable={false}
            />
          </div>
        )
      ))}

      {/* Fake Timer Ring */}
      {gameState.isPlaying && (
        <div className="absolute top-8 right-8 w-20 h-20 z-30">
          <svg width="80" height="80" className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#374151"
              strokeWidth="4"
            />
            {/* Animated progress ring */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - (timerRef.current / 360))}`}
              className="transition-all duration-75"
            />
            {/* Panic slice */}
            {Math.abs(timerRef.current % 360) < 30 && (
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray="20"
                strokeDashoffset="0"
                className="animate-pulse"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
            FAKE
          </div>
        </div>
      )}

      {/* Heinous Taunts */}
      {gameState.currentTaunt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-gray-900 bg-opacity-95 border-2 border-red-500 rounded-lg p-4 max-w-sm">
            <div className="text-red-400 font-bold text-sm mb-1">Dr. Heinous says:</div>
            <div className="text-white text-sm">{gameState.currentTaunt}</div>
            {/* Speech bubble tail */}
            <div className="absolute bottom-0 left-8 transform translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chupacabra Wire Thief */}
      {gameState.chupacabraVisible && (
        <div className="fixed bottom-8 right-8 z-40 animate-pulse">
          <div className="relative">
            <img 
              src="/chupacabra/chupacabra-1.png" 
              alt="Chupacabra"
              className="w-32 h-32 animate-bounce"
            />
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-purple-900 bg-opacity-95 border-2 border-purple-400 rounded-lg p-2 text-white text-xs">
                {gameState.chupacabraMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* I Give Up Button */}
      {gameState.isPlaying && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={giveUp}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg animate-pulse border-4 border-red-400"
            style={{
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.1)'
            }}
          >
            🏳️ I GIVE UP 🏳️
          </button>
        </div>
      )}

      {/* Title Header */}
      {gameState.isPlaying && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg" style={{ fontFamily: 'Courier, monospace' }}>
            WRETCHED WIRING
          </h1>
        </div>
      )}
    </div>
  );
}