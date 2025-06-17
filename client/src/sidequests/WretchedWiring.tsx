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
  techControls: {
    fluxCapacitor: boolean;
    ghostproofing: boolean;
    autoWire: boolean;
    useAI: boolean;
  };
  showToast: string | null;
  showSparks: boolean;
  autoWireAnimation: boolean;
  aiGlitch: boolean;
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
  "Try unplugging it. And yourself.",
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
  techControls: {
    fluxCapacitor: false,
    ghostproofing: false,
    autoWire: false,
    useAI: false
  },
  showToast: null,
  showSparks: false,
  autoWireAnimation: false,
  aiGlitch: false
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

  // Hide toast after delay
  useEffect(() => {
    if (gameState.showToast) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, showToast: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.showToast]);

  // Hide sparks after delay
  useEffect(() => {
    if (gameState.showSparks) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, showSparks: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.showSparks]);

  // Hide auto-wire animation after delay
  useEffect(() => {
    if (gameState.autoWireAnimation) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, autoWireAnimation: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.autoWireAnimation]);

  // Hide AI glitch after delay
  useEffect(() => {
    if (gameState.aiGlitch) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, aiGlitch: false }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.aiGlitch]);

  // Tech control button handlers
  const toggleFluxCapacitor = () => {
    setGameState(prev => ({
      ...prev,
      techControls: { ...prev.techControls, fluxCapacitor: !prev.techControls.fluxCapacitor },
      showToast: "Flux enabled. Time travel… delayed indefinitely.",
      showSparks: true
    }));
  };

  const toggleGhostproofing = () => {
    setGameState(prev => ({
      ...prev,
      techControls: { ...prev.techControls, ghostproofing: !prev.techControls.ghostproofing },
      showToast: "Ectoplasmic shielding active. Results inconclusive."
    }));
  };

  const toggleAutoWire = () => {
    setGameState(prev => ({
      ...prev,
      techControls: { ...prev.techControls, autoWire: !prev.techControls.autoWire },
      showToast: "System attempted optimization. It failed gloriously.",
      autoWireAnimation: true
    }));
  };

  const toggleUseAI = () => {
    setGameState(prev => ({
      ...prev,
      aiGlitch: true,
      showToast: "AI has abandoned us. Again."
    }));
    // Reset AI button after glitch
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        techControls: { ...prev.techControls, useAI: false }
      }));
    }, 1500);
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
            <div className={`relative transition-all duration-200 ${gameState.showSparks ? 'animate-pulse' : ''}`}>
              <img src="/sidequests/wretched-wiring/node-red-left.png" alt="Red Terminal Left" className="w-16 h-16" />
              {gameState.showSparks && (
                <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-75"></div>
              )}
            </div>
            <div className={`relative transition-all duration-200 ${gameState.showSparks ? 'animate-pulse' : ''}`}>
              <img src="/sidequests/wretched-wiring/node-blue-left.png" alt="Blue Terminal Left" className="w-16 h-16" />
              {gameState.showSparks && (
                <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-75"></div>
              )}
            </div>
          </div>

          {/* Right Side Terminals */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-8">
            <div className={`relative transition-all duration-200 ${gameState.showSparks ? 'animate-pulse' : ''}`}>
              <img src="/sidequests/wretched-wiring/node-red-right.png" alt="Red Terminal Right" className="w-16 h-16" />
              {gameState.showSparks && (
                <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-75"></div>
              )}
            </div>
            <div className={`relative transition-all duration-200 ${gameState.showSparks ? 'animate-pulse' : ''}`}>
              <img src="/sidequests/wretched-wiring/node-blue-right.png" alt="Blue Terminal Right" className="w-16 h-16" />
              {gameState.showSparks && (
                <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-75"></div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tech Control Panel */}
      {gameState.isPlaying && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-95 border-4 border-yellow-600 rounded-none p-6 backdrop-blur-sm" style={{ 
            boxShadow: 'inset 0 0 20px rgba(255, 255, 0, 0.3), 0 0 30px rgba(255, 255, 0, 0.2)',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
          }}>
            <div className="text-center mb-3">
              <div className="text-yellow-400 text-xs font-mono tracking-widest">CONTROL MATRIX</div>
              <div className="h-px bg-yellow-600 w-full mt-1"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Flux Capacitor */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleFluxCapacitor}
                  className={`relative w-16 h-16 border-4 transition-all duration-200 ${
                    gameState.techControls.fluxCapacitor 
                      ? 'border-blue-400 bg-blue-900 shadow-lg' 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                  style={{
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    boxShadow: gameState.techControls.fluxCapacitor 
                      ? '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(59, 130, 246, 0.3)' 
                      : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className={`text-2xl ${gameState.techControls.fluxCapacitor ? 'text-white animate-pulse' : 'text-gray-400'}`}>⚡</span>
                </button>
                <span className="text-xs font-mono text-yellow-300 mt-2 tracking-wider">FLUX CAP</span>
              </div>

              {/* Ghostproofing */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleGhostproofing}
                  className={`relative w-16 h-16 border-4 transition-all duration-200 ${
                    gameState.techControls.ghostproofing 
                      ? 'border-purple-400 bg-purple-900 shadow-lg' 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                  style={{
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    boxShadow: gameState.techControls.ghostproofing 
                      ? '0 0 20px rgba(147, 51, 234, 0.6), inset 0 0 10px rgba(147, 51, 234, 0.3)' 
                      : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className={`text-2xl ${gameState.techControls.ghostproofing ? 'text-white animate-pulse' : 'text-gray-400'}`}>👻</span>
                </button>
                <span className="text-xs font-mono text-yellow-300 mt-2 tracking-wider">ECTO-SHLD</span>
              </div>

              {/* Auto-Wire */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleAutoWire}
                  className={`relative w-16 h-16 border-4 transition-all duration-200 ${
                    gameState.techControls.autoWire 
                      ? 'border-green-400 bg-green-900 shadow-lg' 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                  style={{
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    boxShadow: gameState.techControls.autoWire 
                      ? '0 0 20px rgba(34, 197, 94, 0.6), inset 0 0 10px rgba(34, 197, 94, 0.3)' 
                      : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className={`text-2xl ${gameState.techControls.autoWire ? 'text-white animate-pulse' : 'text-gray-400'}`}>🔧</span>
                </button>
                <span className="text-xs font-mono text-yellow-300 mt-2 tracking-wider">AUTO-SYS</span>
              </div>

              {/* Use AI */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleUseAI}
                  className={`relative w-16 h-16 border-4 transition-all duration-200 ${
                    gameState.aiGlitch
                      ? 'border-red-400 bg-red-900 animate-pulse'
                      : gameState.techControls.useAI 
                        ? 'border-orange-400 bg-orange-900 shadow-lg' 
                        : 'border-gray-600 bg-gray-800'
                  }`}
                  style={{
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                    boxShadow: gameState.aiGlitch 
                      ? '0 0 20px rgba(239, 68, 68, 0.8), inset 0 0 10px rgba(239, 68, 68, 0.5)' 
                      : gameState.techControls.useAI
                        ? '0 0 20px rgba(249, 115, 22, 0.6), inset 0 0 10px rgba(249, 115, 22, 0.3)'
                        : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span className={`text-2xl ${
                    gameState.aiGlitch 
                      ? 'text-white animate-spin' 
                      : gameState.techControls.useAI 
                        ? 'text-white animate-pulse' 
                        : 'text-gray-400'
                  }`}>🤖</span>
                </button>
                <span className="text-xs font-mono text-yellow-300 mt-2 tracking-wider">AI-CORE™</span>
              </div>
              
            </div>
            
            {/* Status Bar */}
            <div className="mt-4 pt-3 border-t border-yellow-600">
              <div className="flex justify-center items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-yellow-300 tracking-wider">SYSTEM OPERATIONAL</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
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

      {/* Toast Notifications */}
      {gameState.showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gray-900 bg-opacity-95 border-2 border-cyan-400 rounded-lg p-4 max-w-sm mx-auto backdrop-blur-sm">
            <div className="text-cyan-300 text-sm font-mono text-center">
              {gameState.showToast}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Wire Animation Overlay */}
      {gameState.autoWireAnimation && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-ping bg-green-400 rounded-full w-8 h-8 opacity-75"></div>
          </div>
          <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <div className="bg-red-500 w-2 h-16 rotate-45 opacity-80"></div>
          </div>
          <div className="absolute bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2 animate-bounce">
            <div className="bg-blue-500 w-2 h-12 -rotate-12 opacity-80"></div>
          </div>
        </div>
      )}
    </div>
  );
}