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


  
  // Local static asset paths
  const getAssetUrl = (assetName: string) => {
    return `/sidequests/wretched-wiring/${assetName}`;
  };

  // Initialize random wires
  const initializeWires = () => {
    const wireAssets = [
      'wire-red-1', 'wire-red-2', 'wire-red-3', 'wire-red-4',
      'wire-blue-1', 'wire-blue-2', 'wire-blue-3', 'wire-blue-4'
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
      'wire-red-1', 'wire-red-2', 'wire-red-3', 'wire-red-4',
      'wire-blue-1', 'wire-blue-2', 'wire-blue-3', 'wire-blue-4'
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
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        transform: Math.abs(timerRef.current % 360) < 30 
          ? `translate(${Math.sin(Date.now() * 0.02) * 3}px, ${Math.cos(Date.now() * 0.025) * 2}px) scale(${1 + Math.sin(Date.now() * 0.03) * 0.002})` 
          : 'none',
        transition: Math.abs(timerRef.current % 360) < 30 ? 'none' : 'transform 0.3s ease-out',
        filter: Math.abs(timerRef.current % 360) < 30 
          ? `contrast(${1.1 + Math.sin(Date.now() * 0.02) * 0.1}) brightness(${0.95 + Math.sin(Date.now() * 0.025) * 0.05})` 
          : 'none'
      }}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDrag}
      onTouchEnd={handleDragEnd}
    >
      {/* Background */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(/sidequests/wretched-wiring/wretched-wiring-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Certificate Screen */}
      {gameState.showCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '1rem'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '32rem',
            margin: '0 auto'
          }}>
            <img 
              src="/sidequests/wretched-wiring/certificate.png" 
              alt="Certificate of Giving Up"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              width: '100%',
              paddingLeft: '1rem',
              paddingRight: '1rem'
            }}>
              <button
                onClick={resetGame}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Try Again
              </button>
              <Link
                href="/game"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4b5563',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game Start Screen */}
      {!gameState.isPlaying && !gameState.showCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}>
          <div style={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '2px solid #eab308',
            maxWidth: '28rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#facc15',
              filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))',
              marginBottom: '1.5rem',
              fontFamily: 'Courier, monospace'
            }}>
              WRETCHED WIRING
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'white',
              marginBottom: '2rem',
              filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))'
            }}>
              "Fix" the electrical system by connecting wires to terminals. 
              Nothing will actually work, but at least you'll look busy!
            </p>
            <button
              onClick={startGame}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#ca8a04',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.5rem',
                transition: 'background-color 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '1.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ca8a04'}
            >
              Start "Fixing"
            </button>
            <div style={{ marginTop: '1rem' }}>
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
          </div>
        </div>
      )}

      {/* Terminal Nodes */}
      {gameState.isPlaying && (
        <>
          {/* Left Side Terminals */}
          <div style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={getAssetUrl('node-red-left')} 
                alt="Red Terminal Left" 
                style={{ width: '4rem', height: '4rem' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <img 
                src={getAssetUrl('node-blue-left')} 
                alt="Blue Terminal Left" 
                style={{ width: '4rem', height: '4rem' }}
              />
            </div>
          </div>

          {/* Right Side Terminals */}
          <div style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={getAssetUrl('node-red-right')} 
                alt="Red Terminal Right" 
                style={{ width: '4rem', height: '4rem' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <img 
                src={getAssetUrl('node-blue-right')} 
                alt="Blue Terminal Right" 
                style={{ width: '4rem', height: '4rem' }}
              />
            </div>
          </div>
        </>
      )}

      {/* Pull Chain */}
      {gameState.isPlaying && (
        <div 
          style={{
            position: 'absolute',
            top: '4rem',
            left: '4rem',
            zIndex: 1000,
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={handlePullChain}
        >
          <div style={{ position: 'relative' }}>
            <img 
              src={getAssetUrl('Pull-Chain')} 
              alt="Pull Chain"
              style={{
                width: '7rem',
                height: 'auto',
                transition: 'all 0.3s',
                filter: gameState.pullChainPulled 
                  ? 'drop-shadow(0 6px 12px rgba(255,255,0,0.8)) brightness(1.2)' 
                  : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.1)',
                maxWidth: '112px',
                minWidth: '84px',
                transform: gameState.pullChainPulled ? 'translateY(1.5rem)' : 'none',
                animation: gameState.pullChainPulled ? 'bounce 1s infinite' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.25) drop-shadow(0 6px 12px rgba(255,255,0,0.6))';
                e.currentTarget.style.transform = gameState.pullChainPulled ? 'translateY(1.5rem) scale(1.1)' : 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = gameState.pullChainPulled 
                  ? 'drop-shadow(0 6px 12px rgba(255,255,0,0.8)) brightness(1.2)' 
                  : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.1)';
                e.currentTarget.style.transform = gameState.pullChainPulled ? 'translateY(1.5rem)' : 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Draggable Wires */}
      {gameState.isPlaying && gameState.wires.map(wire => (
        !wire.isStolen && (
          <div
            key={wire.id}
            style={{
              position: 'absolute',
              left: wire.position.x,
              top: wire.position.y,
              transform: `rotate(${wire.rotation}deg) ${wire.isDragging ? 'scale(1.1)' : ''}`,
              filter: wire.isDragging ? 'drop-shadow(0 0 10px rgba(255,255,0,0.5))' : 'none',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: wire.isDragging ? 40 : 30,
              transition: 'all 0.2s'
            }}
            onMouseDown={(e) => handleDragStart(wire.id, e)}
            onTouchStart={(e) => handleDragStart(wire.id, e)}
            onClick={() => rotateWire(wire.id)}
            onMouseEnter={(e) => {
              if (!wire.isDragging) {
                e.currentTarget.style.transform = `rotate(${wire.rotation}deg) scale(1.05)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!wire.isDragging) {
                e.currentTarget.style.transform = `rotate(${wire.rotation}deg)`;
              }
            }}
          >
            <img 
              src={getAssetUrl(wire.assetName)} 
              alt={`${wire.color} wire`}
              style={{ 
                width: '100px', 
                height: '100px',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
          </div>
        )
      ))}

      {/* Fake Timer Ring */}
      {gameState.isPlaying && (
        <div 
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            width: '5rem',
            height: '5rem',
            zIndex: 30,
            transition: 'all 0.1s ease-out',
            filter: Math.abs(timerRef.current % 360) < 30 
              ? 'drop-shadow(0 0 30px rgba(239, 68, 68, 1)) drop-shadow(0 0 50px rgba(239, 68, 68, 0.5)) brightness(1.3) contrast(1.5)' 
              : 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))',
            transform: Math.abs(timerRef.current % 360) < 30 
              ? `scale(1.3) rotate(${Math.sin(Date.now() * 0.01) * 3}deg)` 
              : 'scale(1)',
            animation: Math.abs(timerRef.current % 360) < 30 
              ? 'none' 
              : 'none',
            backgroundColor: Math.abs(timerRef.current % 360) < 30 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'transparent',
            borderRadius: '50%',
            border: Math.abs(timerRef.current % 360) < 30 
              ? '2px solid rgba(239, 68, 68, 0.6)' 
              : 'none'
          }}
        >
          <svg 
            width="80" 
            height="80" 
            style={{
              transform: Math.abs(timerRef.current % 360) < 30 
                ? `rotate(-90deg) scale(${1 + Math.sin(Date.now() * 0.02) * 0.1})` 
                : 'rotate(-90deg)',
              transition: Math.abs(timerRef.current % 360) < 30 ? 'none' : 'all 0.2s',
              filter: Math.abs(timerRef.current % 360) < 30 
                ? `hue-rotate(${Math.sin(Date.now() * 0.01) * 30}deg) saturate(1.5)` 
                : 'none'
            }}
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
              style={{ transition: 'all 0.2s' }}
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
                  style={{ animation: 'spin 0.5s linear infinite' }}
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
                  style={{ animation: 'pulse 2s infinite' }}
                />
              </>
            )}
          </svg>
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: Math.abs(timerRef.current % 360) < 30 ? '0.9rem' : '0.75rem',
              transition: Math.abs(timerRef.current % 360) < 30 ? 'none' : 'all 0.2s',
              color: Math.abs(timerRef.current % 360) < 30 
                ? `hsl(${Math.sin(Date.now() * 0.02) * 60 + 0}, 100%, 70%)` 
                : '#ffffff',
              textShadow: Math.abs(timerRef.current % 360) < 30 
                ? `0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)` 
                : 'none',
              transform: Math.abs(timerRef.current % 360) < 30 
                ? `scale(${1.2 + Math.sin(Date.now() * 0.03) * 0.15}) rotate(${Math.sin(Date.now() * 0.025) * 2}deg)` 
                : 'scale(1)',
              filter: Math.abs(timerRef.current % 360) < 30 
                ? `contrast(${1.3 + Math.sin(Date.now() * 0.02) * 0.3})` 
                : 'none'
            }}
          >
            {Math.abs(timerRef.current % 360) < 30 ? 'PANIC!' : 'FAKE'}
          </div>
        </div>
      )}

      {/* Heinous Taunts with Sprite */}
      {gameState.currentTaunt && (
        <div style={{
          position: 'fixed',
          top: '4rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Speech Bubble */}
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '1rem',
              maxWidth: '24rem',
              marginBottom: '0.5rem',
              animation: 'bounce 1s infinite',
              position: 'relative'
            }}>
              <div style={{
                color: '#f87171',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                marginBottom: '0.25rem'
              }}>Dr. Heinous says:</div>
              <div style={{
                color: '#ffffff',
                fontSize: '0.875rem'
              }}>{gameState.currentTaunt}</div>
              {/* Speech bubble tail */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateY(100%) translateX(-50%)'
              }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '16px solid #ef4444'
                }}></div>
              </div>
            </div>
            {/* Dr. Heinous Sprite */}
            <div style={{ animation: 'pulse 2s infinite' }}>
              <img 
                src={`/heinous/${gameState.currentHeinousSprite}`}
                alt="Dr. Heinous"
                style={{
                  width: '6rem',
                  height: '6rem',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chupacabra Wire Thief */}
      {gameState.chupacabraVisible && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 40,
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ position: 'relative' }}>
            <img 
              src="/chupacabra/chupacabra-1.png" 
              alt="Chupacabra"
              style={{
                width: '8rem',
                height: '8rem',
                animation: 'bounce 1s infinite'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '-3rem',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap'
            }}>
              <div style={{
                backgroundColor: 'rgba(88, 28, 135, 0.95)',
                border: '2px solid #a855f7',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                color: '#ffffff',
                fontSize: '0.75rem'
              }}>
                {gameState.chupacabraMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* I Give Up Button */}
      {gameState.isPlaying && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30
        }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={giveUp}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 'bold',
                borderRadius: '9999px',
                transition: 'all 0.3s',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                animation: 'pulse 2s infinite',
                border: '4px solid #f87171',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              🏳️ I GIVE UP 🏳️
            </button>
            
            {/* "That's broken too" message */}
            {gameState.showGiveUpMessage && (
              <div style={{
                position: 'absolute',
                top: '-4rem',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                animation: 'bounce 1s infinite'
              }}>
                <div style={{
                  backgroundColor: 'rgba(127, 29, 29, 0.95)',
                  border: '2px solid #f87171',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  That's broken too.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Title Header */}
      {gameState.isPlaying && (
        <div style={{
          position: 'absolute',
          top: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#facc15',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            fontFamily: 'Courier, monospace'
          }}>
            WRETCHED WIRING
          </h1>
        </div>
      )}


    </div>
  );
}