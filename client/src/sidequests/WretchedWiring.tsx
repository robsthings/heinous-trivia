import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';

interface GameState {
  isPlaying: boolean;
  showCertificate: boolean;
  currentTaunt: string | null;
  currentHeinousSprite: string;
  wires: Wire[];
  chupacabraVisible: boolean;
  chupacabraMessage: string | null;
  giveUpClicks: number;
  showGiveUpMessage: boolean;
  pullChainPulled: boolean;
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
  "It's ALIVE! ...oh wait.",
  "Ctrl-Alt-Del can't save us now.",
  "Better to just wall off this room.",
  "Whelp, that didn't work.",
  "Did that make sense in your meat-brain?",
  "You've truly mastered the art of regression.",
  "Did you try unplugging it?",
  "Why didn't I think of that? Oh, because it doesn't work.",
  "I bet this looked easier from outside the brain.",
  "Congratulations! You've made it worse.",
  "That wire connects to disappointment.",
  "Error 666: Haunting Intensifies.",
  "This configuration has been banned in 13 dimensions.",
  "Just press all the buttons. That's what professionals do.",
  "Your solution just summoned a gremlin.",
  "If you feel burning, that's normal. Emotionally, I mean.",
  "Fantastic! Now we've angered the panel.",
  "This wire goes nowhere. Just like your plan.",
  "Chupacabra says you're doing fine. Chupacabra also eats drywall.",
  "You've achieved total un-circuitry.",
  "We are now operating entirely on vibes.",
  "Let's blame the intern and walk away.",
  "The wires are connected. The consequences are not.",
  "That's not a puzzle — that's modern art.",
  "You fixed it! No, wait — you flipped it."
];

const HEINOUS_SPRITES = [
  'unimpressed.png',
  'charming.png', 
  'ffs.png',
  'shocked.png'
];

const CHUPACABRA_MESSAGES = [
  "Grrrrrawwwwrrrr...",
  "Hssssssss... *sniff sniff*",
  "Grnnnnhhhhh... *chomp*",
  "*growl* Rrrrraaaahhhh!",
  "Hisssss... grrrrunt...",
  "*snort* Grawwwwwrrr...",
  "Ggrrrrhhhhh... *crunch*",
  "Hssss... *grunt grunt*"
];

const INITIAL_GAME_STATE: GameState = {
  isPlaying: false,
  showCertificate: false,
  currentTaunt: null,
  currentHeinousSprite: 'unimpressed.png',
  wires: [],
  chupacabraVisible: false,
  chupacabraMessage: null,
  giveUpClicks: 0,
  showGiveUpMessage: false,
  pullChainPulled: false
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

  // Show certificate (broken - requires 3 clicks)
  const giveUp = () => {
    setGameState(prev => {
      const newClicks = prev.giveUpClicks + 1;
      
      if (newClicks < 3) {
        return { 
          ...prev, 
          giveUpClicks: newClicks,
          showGiveUpMessage: true
        };
      } else {
        return { 
          ...prev, 
          showCertificate: true,
          giveUpClicks: 0,
          showGiveUpMessage: false
        };
      }
    });
  };

  // Hide "That's broken too" message after delay
  useEffect(() => {
    if (gameState.showGiveUpMessage) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, showGiveUpMessage: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.showGiveUpMessage]);

  // Reset pull chain animation
  useEffect(() => {
    if (gameState.pullChainPulled) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, pullChainPulled: false }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameState.pullChainPulled]);

  // Handle pull chain interaction
  const handlePullChain = () => {
    if (!gameState.isPlaying || gameState.pullChainPulled) return;

    // Generate 1-5 new wires
    const numNewWires = Math.floor(Math.random() * 5) + 1;
    const wireAssets = [
      'wire-red-1.png', 'wire-red-2.png', 'wire-red-3.png',
      'wire-blue-1.png', 'wire-blue-2.png', 'wire-blue-3.png'
    ];

    const newWires: Wire[] = [];
    for (let i = 0; i < numNewWires; i++) {
      const assetName = wireAssets[Math.floor(Math.random() * wireAssets.length)];
      const newWire: Wire = {
        id: `wire-${Date.now()}-${i}`,
        color: assetName.includes('red') ? 'red' : 'blue',
        assetName,
        position: {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 200) + 150
        },
        rotation: Math.floor(Math.random() * 4) * 90,
        isDragging: false,
        isStolen: false
      };
      newWires.push(newWire);
    }

    setGameState(prev => ({
      ...prev,
      wires: [...prev.wires, ...newWires],
      pullChainPulled: true,
      currentTaunt: `${numNewWires} more wires? Excellent. More chaos!`,
      currentHeinousSprite: 'scheming.png'
    }));
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

    // Replace stolen wire with chupa-wire.png
    setGameState(prev => ({
      ...prev,
      chupacabraVisible: true,
      chupacabraMessage: randomMessage,
      wires: prev.wires.map(w =>
        w.id === randomWire.id 
          ? { ...w, isStolen: true, assetName: 'chupa-wire.png' } 
          : w
      )
    }));

    // Show the chewed wire for 2 seconds, then hide completely
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        chupacabraVisible: false,
        chupacabraMessage: null
      }));
    }, 2000);

    // Hide the chewed wire after showing it briefly
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        wires: prev.wires.filter(w => w.id !== randomWire.id)
      }));
    }, 4000);
  };

  // Show random taunts with random Dr. Heinous sprites
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const tauntInterval = setInterval(() => {
      const randomTaunt = HEINOUS_TAUNTS[Math.floor(Math.random() * HEINOUS_TAUNTS.length)];
      const randomSprite = HEINOUS_SPRITES[Math.floor(Math.random() * HEINOUS_SPRITES.length)];
      
      setGameState(prev => ({ 
        ...prev, 
        currentTaunt: randomTaunt,
        currentHeinousSprite: randomSprite
      }));

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-lg mx-auto">
            <img 
              src="/sidequests/wretched-wiring/certificate.png" 
              alt="Certificate of Giving Up"
              className="w-full h-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full px-4 sm:px-0 sm:w-auto">
              <button
                onClick={resetGame}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base"
              >
                Try Again
              </button>
              <Link
                href="/game"
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg inline-block text-center text-sm sm:text-base"
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
            <div className="relative">
              <img src="/sidequests/wretched-wiring/node-red-left.png" alt="Red Terminal Left" className="w-16 h-16" />
            </div>
            <div className="relative">
              <img src="/sidequests/wretched-wiring/node-blue-left.png" alt="Blue Terminal Left" className="w-16 h-16" />
            </div>
          </div>

          {/* Right Side Terminals */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-8">
            <div className="relative">
              <img src="/sidequests/wretched-wiring/node-red-right.png" alt="Red Terminal Right" className="w-16 h-16" />
            </div>
            <div className="relative">
              <img src="/sidequests/wretched-wiring/node-blue-right.png" alt="Blue Terminal Right" className="w-16 h-16" />
            </div>
          </div>
        </>
      )}

      {/* Pull Chain */}
      {gameState.isPlaying && (
        <div 
          className="absolute top-8 left-8 z-30 cursor-pointer select-none"
          onClick={handlePullChain}
        >
          <img 
            src="/sidequests/wretched-wiring/Pull-Chain.png" 
            alt="Pull Chain"
            className={`w-12 h-auto transition-all duration-300 hover:brightness-110 ${
              gameState.pullChainPulled 
                ? 'transform translate-y-4 animate-bounce' 
                : 'hover:scale-105'
            }`}
            style={{
              filter: gameState.pullChainPulled 
                ? 'drop-shadow(0 4px 8px rgba(255,255,0,0.6))' 
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
        </div>
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
        <div 
          className={`absolute top-8 right-8 w-20 h-20 z-30 transition-all duration-200 ${
            Math.abs(timerRef.current % 360) < 30 
              ? 'animate-bounce scale-110' 
              : ''
          }`}
          style={{
            filter: Math.abs(timerRef.current % 360) < 30 
              ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))' 
              : 'none'
          }}
        >
          <svg 
            width="80" 
            height="80" 
            className={`transform -rotate-90 transition-all duration-200 ${
              Math.abs(timerRef.current % 360) < 30 
                ? 'animate-pulse' 
                : ''
            }`}
          >
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
              stroke={Math.abs(timerRef.current % 360) < 30 ? "#ef4444" : "#10b981"}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - (timerRef.current / 360))}`}
              className="transition-all duration-200"
            />
            {/* Panic slice with intense effects */}
            {Math.abs(timerRef.current % 360) < 30 && (
              <>
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray="15"
                  strokeDashoffset="0"
                  className="animate-spin"
                  style={{ animationDuration: '0.5s' }}
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="10"
                  strokeDashoffset="0"
                  className="animate-pulse"
                />
              </>
            )}
          </svg>
          <div 
            className={`absolute inset-0 flex items-center justify-center font-bold text-xs transition-all duration-200 ${
              Math.abs(timerRef.current % 360) < 30 
                ? 'text-red-300 animate-pulse scale-110' 
                : 'text-white'
            }`}
          >
            {Math.abs(timerRef.current % 360) < 30 ? 'PANIC!' : 'FAKE'}
          </div>
        </div>
      )}

      {/* Heinous Taunts with Sprite */}
      {gameState.currentTaunt && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="bg-gray-900 bg-opacity-95 border-2 border-red-500 rounded-lg p-4 max-w-sm mb-2 animate-bounce">
              <div className="text-red-400 font-bold text-sm mb-1">Dr. Heinous says:</div>
              <div className="text-white text-sm">{gameState.currentTaunt}</div>
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500"></div>
              </div>
            </div>
            {/* Dr. Heinous Sprite */}
            <div className="animate-pulse">
              <img 
                src={`/heinous/${gameState.currentHeinousSprite}`}
                alt="Dr. Heinous"
                className="w-24 h-24 object-contain"
              />
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
          <div className="relative">
            <button
              onClick={giveUp}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg animate-pulse border-4 border-red-400"
              style={{
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.1)'
              }}
            >
              🏳️ I GIVE UP 🏳️
            </button>
            
            {/* "That's broken too" message */}
            {gameState.showGiveUpMessage && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-bounce">
                <div className="bg-red-900 bg-opacity-95 border-2 border-red-400 rounded-lg p-3 text-white font-bold text-sm">
                  That's broken too.
                </div>
              </div>
            )}
          </div>
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